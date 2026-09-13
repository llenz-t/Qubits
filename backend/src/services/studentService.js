/**
 * Builds the attendance dashboard shared by both the student and parent
 * portals. The interesting part is buildDashboard: it treats
 * `classoccurrence` (actual held sessions) as ground truth for "classes
 * held" rather than trusting the `attendancesummary` table's cached
 * totalsessions, so a stale summary row never desyncs the numbers shown.
 */
const supabase = require('../config/supabaseClient');

async function findStudentById(studentId) {
  const { data, error } = await supabase
    .from('students')
    .select('studentid, studentname, email, sectionid, sections(sectionid, sectioncode, year, programmes(programmeid, programmename, awardtitle))')
    .eq('studentid', studentId)
    .single();
  if (error) throw error;
  return data;
}

async function findStudentsByName(name) {
  const query = name.trim();
  if (query.length < 2) return [];
  const { data, error } = await supabase
    .from('students')
    .select('studentid, studentname, sections(sectioncode, year, programmes(programmename))')
    .ilike('studentname', `%${query}%`)
    .order('studentname');
  if (error) throw error;
  return (data || []).map(s => ({
    studentid: s.studentid,
    studentname: s.studentname,
    sectioncode: s.sections?.sectioncode,
    programmename: s.sections?.programmes?.programmename,
    year: s.sections?.year
  }));
}

// Assembles one student's full dashboard: profile, per-course stats,
// and term totals. Enrollment (which modules count) comes from
// `programmemodules`; live session counts come from `getClassCountsForStudent`;
// per-course present/late/absent counts come from the `attendancesummary`
// cache. Year-long (30-credit) modules are split across two semester
// rows in the DB but merged back into one course card here.
async function buildDashboard(studentId) {
  const student = await findStudentById(studentId);
  if (!student) throw Object.assign(new Error('Student not found'), { status: 404 });

  const programmeid = student.sections?.programmes?.programmeid;
  const year = student.sections?.year;
  const sectionid = student.sectionid;

  if (!programmeid || !year) {
    throw new Error('Student has incomplete programme/year data');
  }

  // Get enrolled courses from programmemodules (source of truth for enrollment)
  const { data: enrolledModules, error: enrollmentError } = await supabase
    .from('programmemodules')
    .select('moduleid, semester, credits, totalclassespersemester, modules(modulename)')
    .eq('programmeid', programmeid)
    .eq('year', year)
    .order('semester')
    .order('moduleid');
  if (enrollmentError) throw enrollmentError;

  if (!enrolledModules || enrolledModules.length === 0) {
    return {
      student: {
        studentid: student.studentid,
        studentname: student.studentname,
        sectioncode: student.sections?.sectioncode,
        programmename: student.sections?.programmes?.programmename,
        year: student.sections?.year,
        email: student.email
      },
      overall: { totalHeld: 0, totalPresent: 0, totalLate: 0, totalAbsent: 0, attendancePercent: 0 },
      courses: []
    };
  }

  const moduleIds = enrolledModules.map(m => m.moduleid);

  // Get attendance summaries (may not exist for all modules yet)
  const { data: summaries } = await supabase
    .from('attendancesummary')
    .select('moduleid, totalsessions, present, late, absentraw, convertedabsent, totaleffectiveabsent, attendancepercent')
    .eq('studentid', studentId)
    .in('moduleid', moduleIds);

  const summaryMap = new Map((summaries || []).map(s => [s.moduleid, s]));

  // Get live class counts from classoccurrence (ground truth)
  const classCountsMap = await getClassCountsForStudent(sectionid, moduleIds, studentId);

  // Group by moduleid to merge year-long modules (30-credit modules split across 2 semesters)
  const moduleGroups = new Map();
  for (const enrolled of enrolledModules) {
    if (!moduleGroups.has(enrolled.moduleid)) {
      moduleGroups.set(enrolled.moduleid, []);
    }
    moduleGroups.get(enrolled.moduleid).push(enrolled);
  }

  let totalHeld = 0;
  let totalPresent = 0;
  let totalLate = 0;
  let totalAbsent = 0;

  const courses = [];

  for (const [moduleid, offerings] of moduleGroups.entries()) {
    // If this module has multiple offerings (year-long), merge them
    const isYearLong = offerings.length > 1;
    const modulename = offerings[0].modules?.modulename;
    const credits = offerings[0].credits;

    // Merge semester labels
    const semesters = [...new Set(offerings.map(o => o.semester))].sort().join(' & ');

    // totalclassespersemester is a per-semester constant (36), NOT summed even for year-long modules
    const totalclassespersemester = offerings[0].totalclassespersemester || 0;

    const summary = summaryMap.get(moduleid);
    const liveCount = classCountsMap.get(moduleid) || 0;

    // Data integrity check
    if (summary && liveCount !== summary.totalsessions) {
      console.warn(`[DATA INTEGRITY] Student ${studentId} Module ${moduleid}: ClassOccurrence count=${liveCount} but AttendanceSummary.totalsessions=${summary.totalsessions}`);
    }

    const present = summary?.present || 0;
    const late = summary?.late || 0;
    const absentraw = summary?.absentraw || 0;
    const totaleffectiveabsent = summary?.totaleffectiveabsent || 0;

    // Recompute attendance % from actual counts
    const attendancepercent = liveCount > 0
      ? `${(((present + late) / liveCount) * 100).toFixed(1)}%`
      : (summary?.attendancepercent || '—');

    totalHeld += liveCount;
    totalPresent += present;
    totalLate += late;
    totalAbsent += totaleffectiveabsent;

    courses.push({
      moduleid,
      modulename,
      credits,
      semester: semesters,
      totalclassespersemester: totalclassespersemester,
      totalsessions: liveCount,
      present,
      late,
      absentraw,
      totaleffectiveabsent,
      attendancepercent
    });
  }

  const overall = {
    totalHeld,
    totalPresent,
    totalLate,
    totalAbsent,
    attendancePercent: totalHeld ? parseFloat((((totalPresent + totalLate) / totalHeld) * 100).toFixed(1)) : 0
  };

  return {
    student: {
      studentid: student.studentid,
      studentname: student.studentname,
      sectioncode: student.sections?.sectioncode,
      programmename: student.sections?.programmes?.programmename,
      year: student.sections?.year,
      email: student.email
    },
    overall,
    courses
  };
}

// Ground-truth "classes held" count per module: walks
// classsessions -> sessionsections (this student's section) ->
// classoccurrence (status='Held') so it reflects reality even if
// attendancesummary hasn't been recomputed yet. Batched as two queries
// total instead of one per module to keep this cheap for many modules.
async function getClassCountsForStudent(sectionid, moduleIds, studentId) {
  if (moduleIds.length === 0) return new Map();

  // Batch query: get all sessions for all modules + this section at once
  const { data: sessions } = await supabase
    .from('classsessions')
    .select('sessionid, moduleid, sessionsections!inner(sectionid)')
    .in('moduleid', moduleIds)
    .eq('sessionsections.sectionid', sectionid);

  const sessionsByModule = new Map();
  for (const s of sessions || []) {
    if (!sessionsByModule.has(s.moduleid)) sessionsByModule.set(s.moduleid, []);
    sessionsByModule.get(s.moduleid).push(s.sessionid);
  }

  const allSessionIds = [...new Set([...sessionsByModule.values()].flat())];
  if (allSessionIds.length === 0) {
    return new Map(moduleIds.map(m => [m, 0]));
  }

  // Batch query: get all held occurrences for all sessions at once
  const { data: occurrences } = await supabase
    .from('classoccurrence')
    .select('sessionid')
    .in('sessionid', allSessionIds)
    .eq('status', 'Held');

  const occBySession = new Map();
  for (const occ of occurrences || []) {
    occBySession.set(occ.sessionid, (occBySession.get(occ.sessionid) || 0) + 1);
  }

  const counts = new Map();
  for (const [moduleid, sessionIds] of sessionsByModule.entries()) {
    counts.set(moduleid, sessionIds.reduce((sum, sid) => sum + (occBySession.get(sid) || 0), 0));
  }
  for (const mid of moduleIds) {
    if (!counts.has(mid)) counts.set(mid, 0);
  }

  return counts;
}

module.exports = { findStudentById, findStudentsByName, buildDashboard, getClassCountsForStudent };
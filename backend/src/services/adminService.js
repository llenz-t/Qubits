/**
 * Backs the admin console's Students and Courses tabs: filtered roster
 * with attendance rollups, course-offering CRUD, and the bulk-deduct
 * tool. Queries are batched (fetch all students, then one attendance
 * query for all of them) rather than N+1 per-student round trips.
 */
const supabase = require('../config/supabaseClient');

// Roster with per-student overall attendance. Programme-name filtering
// happens in JS after the query because Supabase can't filter on a
// nested joined table's column directly; section/year/search do filter
// in SQL. Two batched queries total (students, then attendance) instead
// of one attendance query per student.
async function getStudentsList(filters = {}) {
  let query = supabase
    .from('students')
    .select('studentid, studentname, sectionid, sections(sectioncode, year, programmeid, programmes(programmeid, programmename))');

  if (filters.section) query = query.eq('sections.sectioncode', filters.section);
  if (filters.year) query = query.eq('sections.year', filters.year);
  if (filters.search) query = query.ilike('studentname', `%${filters.search}%`);

  const { data: students, error } = await query.order('studentname');
  if (error) throw error;

  // Filter by programme name client-side (Supabase doesn't support nested joined field filters)
  let filteredStudents = students || [];
  if (filters.programmename) {
    filteredStudents = filteredStudents.filter(s => s.sections?.programmes?.programmename === filters.programmename);
  }

  const studentIds = (filteredStudents || []).map(s => s.studentid);
  if (studentIds.length === 0) return [];

  // BATCH QUERY 1: Get all attendance summaries for all students at once
  const { data: summaries, error: summaryError } = await supabase
    .from('attendancesummary')
    .select('studentid, moduleid, totalsessions, present, late')
    .in('studentid', studentIds);
  if (summaryError) throw summaryError;

  // Group summaries by student
  const summaryByStudent = new Map();
  for (const row of summaries || []) {
    if (!summaryByStudent.has(row.studentid)) {
      summaryByStudent.set(row.studentid, []);
    }
    summaryByStudent.get(row.studentid).push(row);
  }

  // Build results using in-memory maps (no more per-student queries)
  const results = [];
  for (const s of filteredStudents) {
    const studentSummaries = summaryByStudent.get(s.studentid) || [];

    const overall = studentSummaries.reduce((acc, row) => {
      // Use totalsessions from attendancesummary as the source of truth
      // This correctly counts ALL classes held across all enrolled modules
      return {
        totalHeld: acc.totalHeld + row.totalsessions,
        totalPresent: acc.totalPresent + row.present,
        totalLate: acc.totalLate + row.late
      };
    }, { totalHeld: 0, totalPresent: 0, totalLate: 0 });

    // Sanity check: attended should never exceed held
    if (overall.totalPresent > overall.totalHeld) {
      console.error(`[DATA INTEGRITY ERROR] Student ${s.studentid}: ${overall.totalPresent} present > ${overall.totalHeld} held - this should never happen!`);
    }

    overall.attendancePercent = overall.totalHeld ? parseFloat((((overall.totalPresent + overall.totalLate) / overall.totalHeld) * 100).toFixed(1)) : 0;

    results.push({
      studentid: s.studentid,
      studentname: s.studentname,
      sectioncode: s.sections?.sectioncode,
      year: s.sections?.year,
      programmename: s.sections?.programmes?.programmename,
      overall: { totalHeld: overall.totalHeld, totalPresent: overall.totalPresent, attendancePercent: overall.attendancePercent }
    });
  }

  return results;
}

async function getCoursesList() {
  const { data, error } = await supabase
    .from('programmemodules')
    .select('offeringid, programmeid, moduleid, year, semester, credits, totalclassespersemester, programmes(programmename), modules(modulename)')
    .order('programmeid')
    .order('year')
    .order('semester');
  if (error) throw error;
  return (data || []).map(row => ({
    offeringid: row.offeringid,
    programmename: row.programmes?.programmename,
    modulename: row.modules?.modulename,
    credits: row.credits,
    year: row.year,
    semester: row.semester,
    totalclassespersemester: row.totalclassespersemester
  }));
}

// Edits one course offering's credits/semester/total-classes. Credits
// and semester are constrained to the college's fixed set of valid
// values (15/30 credits, semester 1/2) rather than accepting anything.
async function updateCourse(offeringId, updates) {
  if (updates.semester && !['1', '2'].includes(updates.semester)) {
    throw Object.assign(new Error('Semester must be 1 or 2'), { status: 400 });
  }
  if (updates.credits && ![15, 30].includes(Number(updates.credits))) {
    throw Object.assign(new Error('Credits must be 15 or 30'), { status: 400 });
  }
  const payload = {};
  if (updates.credits !== undefined) payload.credits = Number(updates.credits);
  if (updates.semester !== undefined) payload.semester = updates.semester;
  if (updates.totalclassespersemester !== undefined) payload.totalclassespersemester = Number(updates.totalclassespersemester);

  const { data, error } = await supabase.from('programmemodules').update(payload).eq('offeringid', offeringId).select().single();
  if (error) throw error;
  return data;
}

// Knocks `deductAmount` off totalclassespersemester for every offering
// matching the optional programme/year filters — e.g. to account for a
// college-wide holiday shrinking the semester. programmename is
// filtered again in JS for the same nested-join reason as getStudentsList.
async function bulkDeductClasses(filters) {
  const { deductAmount, programmename, year } = filters;
  if (!deductAmount || deductAmount < 1) {
    throw Object.assign(new Error('deductAmount must be at least 1'), { status: 400 });
  }

  let query = supabase.from('programmemodules').select('offeringid, totalclassespersemester, year, programmes(programmename)');
  if (programmename) query = query.eq('programmes.programmename', programmename);
  if (year) query = query.eq('year', year);

  const { data: offerings, error: fetchError } = await query;
  if (fetchError) throw fetchError;

  const filtered = (offerings || []).filter(o => {
    if (programmename && o.programmes?.programmename !== programmename) return false;
    return true;
  });

  let updated = 0;
  for (const offering of filtered) {
    const newTotal = Math.max(0, offering.totalclassespersemester - deductAmount);
    const { error: updateError } = await supabase
      .from('programmemodules')
      .update({ totalclassespersemester: newTotal })
      .eq('offeringid', offering.offeringid);
    if (!updateError) updated++;
  }

  return { updated };
}

module.exports = { getStudentsList, getCoursesList, updateCourse, bulkDeductClasses };
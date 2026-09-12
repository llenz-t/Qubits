export interface TimetableSlot {
  id: string;
  day: 'SUN' | 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI';
  time: string;
  classType: 'Lecture' | 'Tutorial' | 'Workshop';
  moduleCode: string;
  moduleTitle: string;
  lecturer: string;
  group: string;
  block: string;
  room: string;
  degreeId: string;
  year: 'Year 1' | 'Year 2' | 'Year 3';
}

export interface StudentRecord {
  id: string;
  name: string;
  rollNo: string;
  degreeId: string;
  year: 'Year 1' | 'Year 2' | 'Year 3';
  section: string;
  attendedSessions: number;
  totalSessions: number;
  missedSessions: number;
  attendanceRate: number;
  status: 'Good' | 'Warning' | 'Critical';
}

// 5 sections per year per course
export const DEGREE_SECTIONS: Record<string, Record<'Year 1' | 'Year 2' | 'Year 3', string[]>> = {
  ai: {
    'Year 1': ['AI1', 'AI2', 'AI3', 'AI4', 'AI5'],
    'Year 2': ['AI6', 'AI7', 'AI8', 'AI9', 'AI10'],
    'Year 3': ['AI11', 'AI12', 'AI13', 'AI14', 'AI15'],
  },
  computing: {
    'Year 1': ['C1', 'C2', 'C3', 'C4', 'C5'],
    'Year 2': ['C6', 'C7', 'C8', 'C9', 'C10'],
    'Year 3': ['C11', 'C12', 'C13', 'C14', 'C15'],
  },
  networking: {
    'Year 1': ['NW1', 'NW2', 'NW3', 'NW4', 'NW5'],
    'Year 2': ['NW6', 'NW7', 'NW8', 'NW9', 'NW10'],
    'Year 3': ['NW11', 'NW12', 'NW13', 'NW14', 'NW15'],
  },
  multimedia: {
    'Year 1': ['MM1', 'MM2', 'MM3', 'MM4', 'MM5'],
    'Year 2': ['MM6', 'MM7', 'MM8', 'MM9', 'MM10'],
    'Year 3': ['MM11', 'MM12', 'MM13', 'MM14', 'MM15'],
  },
};

const LECTURERS = [
  'Ms. Tek Maya Chaudhary',
  'Mr. Mohit Paudel',
  'Mr. Nishan Poudel',
  'Mr. Nadil Paudel',
  'Mr. Sudip Dahal',
  'Ms. Astha Sharma',
  'Mr. Sanjeep Lama',
  'Mr. Sanjit Kumar Yadav',
  'Dr. Bibek Shrestha',
  'Ms. Pooja Adhikari',
  'Mr. Rabin Maharjan',
  'Mr. Bikash Thapa',
];

const BLOCKS = ['Alumni', 'Skill', 'London', 'Nepal', 'Everest', 'Kathmandu'];
const ROOMS = [
  'SR 10 - Samir Gautam',
  'Lab 12 - Sushant Hona',
  'LT 04 - Tridev Gurung',
  'LT 03 - Westminster Palace',
  'TR 08 - Sagarmatha',
  'TR 02 - Patan',
  'TR 03 - Pokhara',
  'TR 04 - Lumbini',
  'Lab 06 - Annapurna',
  'TR 11 - Dhaulagiri',
];

const FIRST_NAMES = [
  'Kenji', 'Aarav', 'Priya', 'Rohan', 'Ananya', 'Sameer', 'Diya', 'Kiran',
  'Sneha', 'Bikash', 'Suman', 'Prashant', 'Rina', 'Ashok', 'Kritika', 'Nirav',
  'Alisha', 'Siddharth', 'Binod', 'Sandesh', 'Kabir', 'Manish', 'Pooja', 'Sunil',
  'Deepa', 'Roshan', 'Srijana', 'Gaurav', 'Nabin', 'Rupa'
];

const LAST_NAMES = [
  'Sato', 'Sharma', 'Patel', 'Verma', 'Shrestha', 'Joshi', 'Thapa', 'Karki',
  'Adhikari', 'Maharjan', 'Bhandari', 'Basnet', 'Giri', 'Gurung', 'Tamang',
  'Rana', 'Dahal', 'Pandey', 'Chaudhary', 'Yadav'
];

// Generate all routines for 5 sections per year per course
export function generateAllRoutines(): TimetableSlot[] {
  const slots: TimetableSlot[] = [];

  // Specifically include the exact AI7 routine from the PDF
  const ai7Routine: TimetableSlot[] = [
    {
      id: 'ai-y2-ai7-1',
      day: 'SUN',
      time: '12:30 PM - 02:30 PM',
      classType: 'Workshop',
      moduleCode: 'CC5051NI',
      moduleTitle: 'Databases',
      lecturer: 'Ms. Tek Maya Chaudhary',
      group: 'AI7',
      block: 'Alumni',
      room: 'SR 10 - Samir Gautam',
      degreeId: 'ai',
      year: 'Year 2',
    },
    {
      id: 'ai-y2-ai7-2',
      day: 'MON',
      time: '08:00 AM - 10:00 AM',
      classType: 'Workshop',
      moduleCode: 'CS5002NI',
      moduleTitle: 'Software Engineering',
      lecturer: 'Mr. Mohit Paudel',
      group: 'AI7',
      block: 'Skill',
      room: 'Lab 12 - Sushant Hona',
      degreeId: 'ai',
      year: 'Year 2',
    },
    {
      id: 'ai-y2-ai7-3',
      day: 'MON',
      time: '10:00 AM - 12:00 PM',
      classType: 'Workshop',
      moduleCode: 'CS5003NI',
      moduleTitle: 'Data Structure and Specialist Programming',
      lecturer: 'Mr. Nishan Poudel',
      group: 'AI7',
      block: 'Skill',
      room: 'Lab 12 - Sushant Hona',
      degreeId: 'ai',
      year: 'Year 2',
    },
    {
      id: 'ai-y2-ai7-4',
      day: 'TUE',
      time: '11:00 AM - 12:30 PM',
      classType: 'Lecture',
      moduleCode: 'MA5054NI',
      moduleTitle: 'Further Calculus',
      lecturer: 'Mr. Nadil Paudel',
      group: 'AI6+AI7+AI8+AI9+AI10',
      block: 'Alumni',
      room: 'LT 04 - Tridev Gurung',
      degreeId: 'ai',
      year: 'Year 2',
    },
    {
      id: 'ai-y2-ai7-5',
      day: 'TUE',
      time: '12:30 PM - 02:00 PM',
      classType: 'Lecture',
      moduleCode: 'CS5003NI',
      moduleTitle: 'Data Structure and Specialist Programming',
      lecturer: 'Mr. Sudip Dahal',
      group: 'AI6+AI7+AI8+AI9+AI10',
      block: 'Alumni',
      room: 'LT 04 - Tridev Gurung',
      degreeId: 'ai',
      year: 'Year 2',
    },
    {
      id: 'ai-y2-ai7-6',
      day: 'WED',
      time: '09:30 AM - 11:00 AM',
      classType: 'Lecture',
      moduleCode: 'CC5051NI',
      moduleTitle: 'Databases',
      lecturer: 'Ms. Astha Sharma',
      group: 'AI6+AI7+AI8+AI9+AI10',
      block: 'London',
      room: 'LT 03 - Westminster Palace',
      degreeId: 'ai',
      year: 'Year 2',
    },
    {
      id: 'ai-y2-ai7-7',
      day: 'WED',
      time: '12:00 PM - 01:30 PM',
      classType: 'Lecture',
      moduleCode: 'CS5002NI',
      moduleTitle: 'Software Engineering',
      lecturer: 'Mr. Sanjeep Lama',
      group: 'AI6+AI7+AI8+AI9+AI10',
      block: 'London',
      room: 'LT 03 - Westminster Palace',
      degreeId: 'ai',
      year: 'Year 2',
    },
    {
      id: 'ai-y2-ai7-8',
      day: 'THU',
      time: '12:00 PM - 01:00 PM',
      classType: 'Tutorial',
      moduleCode: 'CC5051NI',
      moduleTitle: 'Databases',
      lecturer: 'Ms. Tek Maya Chaudhary',
      group: 'AI7',
      block: 'Nepal',
      room: 'TR 08 - Sagarmatha',
      degreeId: 'ai',
      year: 'Year 2',
    },
    {
      id: 'ai-y2-ai7-9',
      day: 'THU',
      time: '01:00 PM - 02:00 PM',
      classType: 'Tutorial',
      moduleCode: 'MA5054NI',
      moduleTitle: 'Further Calculus',
      lecturer: 'Mr. Sanjit Kumar Yadav',
      group: 'AI7',
      block: 'Nepal',
      room: 'TR 08 - Sagarmatha',
      degreeId: 'ai',
      year: 'Year 2',
    },
    {
      id: 'ai-y2-ai7-10',
      day: 'FRI',
      time: '08:30 AM - 10:30 AM',
      classType: 'Workshop',
      moduleCode: 'MA5054NI',
      moduleTitle: 'Further Calculus',
      lecturer: 'Mr. Sanjit Kumar Yadav',
      group: 'AI7',
      block: 'Nepal',
      room: 'TR 02 - Patan',
      degreeId: 'ai',
      year: 'Year 2',
    },
    {
      id: 'ai-y2-ai7-11',
      day: 'FRI',
      time: '11:00 AM - 12:00 PM',
      classType: 'Tutorial',
      moduleCode: 'CS5002NI',
      moduleTitle: 'Software Engineering',
      lecturer: 'Mr. Mohit Paudel',
      group: 'AI7',
      block: 'Nepal',
      room: 'TR 03 - Pokhara',
      degreeId: 'ai',
      year: 'Year 2',
    },
    {
      id: 'ai-y2-ai7-12',
      day: 'FRI',
      time: '12:00 PM - 01:00 PM',
      classType: 'Tutorial',
      moduleCode: 'CS5003NI',
      moduleTitle: 'Data Structure and Specialist Programming',
      lecturer: 'Mr. Nishan Poudel',
      group: 'AI7',
      block: 'Nepal',
      room: 'TR 04 - Lumbini',
      degreeId: 'ai',
      year: 'Year 2',
    },
  ];

  slots.push(...ai7Routine);

  // Define modules for all courses and years
  const degreeYearModules: Record<string, Record<'Year 1' | 'Year 2' | 'Year 3', { code: string; title: string }[]>> = {
    ai: {
      'Year 1': [
        { code: 'AI4001', title: 'Programming' },
        { code: 'AI4002', title: 'Calculus and Linear Algebra' },
        { code: 'AI4003', title: 'Fundamentals of Robotics and IoT' },
        { code: 'AI4004', title: 'Introduction to Information Systems' },
      ],
      'Year 2': [
        { code: 'CC5051NI', title: 'Databases' },
        { code: 'CS5002NI', title: 'Software Engineering' },
        { code: 'CS5003NI', title: 'Data Structure and Specialist Programming' },
        { code: 'MA5054NI', title: 'Further Calculus' },
      ],
      'Year 3': [
        { code: 'AI6001', title: 'Project' },
        { code: 'AI6002', title: 'Big Data and Data Mining' },
        { code: 'AI6003', title: 'Artificial Intelligence' },
        { code: 'AI6004', title: 'Computer Vision' },
      ],
    },
    computing: {
      'Year 1': [
        { code: 'CS4001', title: 'Programming' },
        { code: 'CS4002', title: 'Fundamentals of Computing' },
        { code: 'CS4003', title: 'Introduction to Information Systems' },
        { code: 'CS4004', title: 'Logic and Problem Solving' },
      ],
      'Year 2': [
        { code: 'CS5001', title: 'Databases' },
        { code: 'CS5002', title: 'Software Engineering' },
        { code: 'CS5003', title: 'Network Operating Systems' },
        { code: 'CS5004', title: 'Advanced Programming and Technologies' },
      ],
      'Year 3': [
        { code: 'CS6001', title: 'Data and Web Development' },
        { code: 'CS6002', title: 'Project' },
        { code: 'CS6003', title: 'Application Development' },
        { code: 'CS6004', title: 'Career Development Learning' },
      ],
    },
    networking: {
      'Year 1': [
        { code: 'NET4001', title: 'Programming' },
        { code: 'NET4002', title: 'Fundamentals of Computing' },
        { code: 'NET4003', title: 'Introduction to Information Systems' },
        { code: 'NET4004', title: 'Cyber Security Fundamentals' },
      ],
      'Year 2': [
        { code: 'NET5001', title: 'Switching Routing and Wireless Essentials' },
        { code: 'NET5002', title: 'Cloud Computing and Internet of Things' },
        { code: 'NET5003', title: 'Cyber Security in Computing' },
        { code: 'NET5004', title: 'Risk, Crisis and Security Management' },
      ],
      'Year 3': [
        { code: 'NET6001', title: 'Project' },
        { code: 'NET6002', title: 'Digital Investigation and E-Discovery' },
        { code: 'NET6003', title: 'Enterprise Networking Security and Automation' },
        { code: 'NET6004', title: 'Ethical Hacking' },
      ],
    },
    multimedia: {
      'Year 1': [
        { code: 'MM4001', title: '3D Modelling and Texturing' },
        { code: 'MM4002', title: 'Digital Imaging' },
        { code: 'MM4003', title: '3D Sculpting and Animation' },
        { code: 'MM4004', title: 'Post-Production' },
      ],
      'Year 2': [
        { code: 'MM5001', title: 'Anatomy and Character VFX' },
        { code: 'MM5002', title: 'Motion Graphics Design' },
        { code: 'MM5003', title: '3D Texturing and VFX' },
        { code: 'MM5004', title: 'VFX' },
      ],
      'Year 3': [
        { code: 'MM6001', title: 'Advanced Studio Engineering' },
        { code: 'MM6002', title: 'Media Industry Careers' },
        { code: 'MM6003', title: 'Audio Mastering and Remastering' },
        { code: 'MM6004', title: 'Career Development Learning' },
      ],
    },
  };

  const days: ('SUN' | 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI')[] = [
    'SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI',
  ];

  const times = {
    Workshop: [
      '08:00 AM - 10:00 AM',
      '10:00 AM - 12:00 PM',
      '12:30 PM - 02:30 PM',
      '08:30 AM - 10:30 AM',
    ],
    Lecture: [
      '09:30 AM - 11:00 AM',
      '11:00 AM - 12:30 PM',
      '12:00 PM - 01:30 PM',
      '12:30 PM - 02:00 PM',
    ],
    Tutorial: [
      '11:00 AM - 12:00 PM',
      '12:00 PM - 01:00 PM',
      '01:00 PM - 02:00 PM',
      '02:00 PM - 03:00 PM',
    ],
  };

  // Generate routines for all courses and years
  Object.entries(DEGREE_SECTIONS).forEach(([degId, years]) => {
    Object.entries(years).forEach(([yrKey, secList]) => {
      const yr = yrKey as 'Year 1' | 'Year 2' | 'Year 3';
      const mods = degreeYearModules[degId]?.[yr] || [];

      // Combined group string for lectures
      const combinedGroup = secList.join('+');

      secList.forEach((sec, sIdx) => {
        // Skip AI7 Year 2 as it's already explicitly added above
        if (degId === 'ai' && yr === 'Year 2' && sec === 'AI7') return;

        mods.forEach((mod, mIdx) => {
          // Lecture (shared across group or combined)
          // Add lecture once per combined group, or with sec representation
          const lecDay = days[(mIdx * 2 + 1) % days.length];
          const lecTime = times.Lecture[mIdx % times.Lecture.length];
          const lecturer = LECTURERS[(mIdx + sIdx) % LECTURERS.length];
          const block = BLOCKS[(mIdx + 1) % BLOCKS.length];
          const room = ROOMS[(mIdx + 2) % ROOMS.length];

          // Check if lecture already added for combined group
          const lectureExists = slots.some(
            (s) =>
              s.degreeId === degId &&
              s.year === yr &&
              s.moduleCode === mod.code &&
              s.classType === 'Lecture' &&
              s.group === combinedGroup
          );

          if (!lectureExists) {
            slots.push({
              id: `${degId}-${yr}-${mod.code}-lec`,
              day: lecDay,
              time: lecTime,
              classType: 'Lecture',
              moduleCode: mod.code,
              moduleTitle: mod.title,
              lecturer,
              group: combinedGroup,
              block,
              room,
              degreeId: degId,
              year: yr,
            });
          }

          // Tutorial for this section (1h)
          const tutDay = days[(sIdx + mIdx + 3) % days.length];
          const tutTime = times.Tutorial[(mIdx + sIdx) % times.Tutorial.length];
          slots.push({
            id: `${degId}-${yr}-${sec}-${mod.code}-tut`,
            day: tutDay,
            time: tutTime,
            classType: 'Tutorial',
            moduleCode: mod.code,
            moduleTitle: mod.title,
            lecturer: LECTURERS[(sIdx * 2 + mIdx) % LECTURERS.length],
            group: sec,
            block: BLOCKS[(sIdx + 2) % BLOCKS.length],
            room: ROOMS[(sIdx * 2 + 1) % ROOMS.length],
            degreeId: degId,
            year: yr,
          });

          // Workshop for this section (2h)
          const wsDay = days[(sIdx * 2 + mIdx) % days.length];
          const wsTime = times.Workshop[(mIdx + sIdx) % times.Workshop.length];
          slots.push({
            id: `${degId}-${yr}-${sec}-${mod.code}-ws`,
            day: wsDay,
            time: wsTime,
            classType: 'Workshop',
            moduleCode: mod.code,
            moduleTitle: mod.title,
            lecturer: LECTURERS[(sIdx + mIdx + 3) % LECTURERS.length],
            group: sec,
            block: BLOCKS[(sIdx + 1) % BLOCKS.length],
            room: ROOMS[(sIdx + 3) % ROOMS.length],
            degreeId: degId,
            year: yr,
          });
        });
      });
    });
  });

  return slots;
}

// Generate realistic student records across 5 sections per year per course
export function generateInitialStudents(): StudentRecord[] {
  const students: StudentRecord[] = [];

  // Kenji Sato specifically in AI7
  students.push({
    id: 'NP03CS4S24001',
    name: 'Kenji Sato',
    rollNo: 'NP03CS4S24001',
    degreeId: 'ai',
    year: 'Year 2',
    section: 'AI7',
    attendedSessions: 33,
    totalSessions: 35,
    missedSessions: 2,
    attendanceRate: 94.3,
    status: 'Good',
  });

  // Generate 5-6 students per section for all 60 sections
  let counter = 2;
  Object.entries(DEGREE_SECTIONS).forEach(([degId, years]) => {
    Object.entries(years).forEach(([yrKey, secList]) => {
      const yr = yrKey as 'Year 1' | 'Year 2' | 'Year 3';
      const yearNum = yr === 'Year 1' ? '25' : yr === 'Year 2' ? '24' : '23';
      const degCode =
        degId === 'ai'
          ? 'CS4S'
          : degId === 'computing'
          ? 'CS4C'
          : degId === 'networking'
          ? 'CS4N'
          : 'CS4M';

      secList.forEach((sec) => {
        const studentCount = sec === 'AI7' ? 5 : 6;
        for (let i = 0; i < studentCount; i++) {
          const rollNo = `NP03${degCode}${yearNum}${String(counter).padStart(3, '0')}`;
          const firstName = FIRST_NAMES[(counter * 7 + i) % FIRST_NAMES.length];
          const lastName = LAST_NAMES[(counter * 5 + i) % LAST_NAMES.length];
          const totalSessions = 34 + ((counter + i) % 3); // 34, 35, or 36
          const missedSessions = (counter + i) % 5 === 0 ? 4 : (counter + i) % 7 === 0 ? 6 : (counter + i) % 3;
          const attendedSessions = Math.max(0, totalSessions - missedSessions);
          const rate = Number(((attendedSessions / totalSessions) * 100).toFixed(1));
          const status = rate >= 85 ? 'Good' : rate >= 75 ? 'Warning' : 'Critical';

          students.push({
            id: rollNo,
            name: `${firstName} ${lastName}`,
            rollNo,
            degreeId: degId,
            year: yr,
            section: sec,
            attendedSessions,
            totalSessions,
            missedSessions,
            attendanceRate: rate,
            status,
          });

          counter++;
        }
      });
    });
  });

  return students;
}

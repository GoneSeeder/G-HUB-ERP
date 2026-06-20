// ─── HR Dashboard data (base44 clone) ─────────────────────────────────────────

export const MONTHS_TH = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
export const YEARS_HR = [2566, 2567, 2568, 2569];

export const salaryLineData = [
  { m: 'ม.ค.', val: 4200000 }, { m: 'ก.พ.', val: 5100000 }, { m: 'มี.ค.', val: 5600000 },
  { m: 'เม.ย.', val: 6000000 }, { m: 'พ.ค.', val: 6400000 }, { m: 'มิ.ย.', val: 6800000 },
  { m: 'ก.ค.', val: 7200000 }, { m: 'ส.ค.', val: 7600000 }, { m: 'ก.ย.', val: 8000000 },
  { m: 'ต.ค.', val: 8200000 }, { m: 'พ.ย.', val: 8390000 }, { m: 'ธ.ค.', val: 1000000 },
];

export const ageDistData = [
  { age: '15-20', male: 1,  female: 0,  other: 0 },
  { age: '21-25', male: 3,  female: 2,  other: 0 },
  { age: '26-30', male: 5,  female: 6,  other: 1 },
  { age: '31-35', male: 8,  female: 9,  other: 0 },
  { age: '36-40', male: 10, female: 12, other: 0 },
  { age: '41-45', male: 7,  female: 8,  other: 1 },
  { age: '46-50', male: 4,  female: 5,  other: 0 },
  { age: '51+',   male: 2,  female: 3,  other: 0 },
];

export const empTypeData = [
  { name: 'รายเดือน', value: 74, color: '#4a90d9' },
  { name: 'หน้าร้าน', value: 15, color: '#f5a623' },
  { name: 'รายวัน',   value: 4,  color: '#7ed321' },
  { name: 'Parttime', value: 6,  color: '#9b59b6' },
];

export const nationalityData = [
  { name: 'ไทย',       value: 90, color: '#4a90d9' },
  { name: 'ต่างชาติ', value: 10, color: '#f5a623' },
];

export const branchSalaryData = [
  { m: 'ม.ค.', b1: 38, b2: 20, b3: 10 }, { m: 'ก.พ.', b1: 64, b2: 15, b3: 10 },
  { m: 'มี.ค.', b1: 63, b2: 18, b3: 8 },  { m: 'เม.ย.', b1: 65, b2: 20, b3: 8 },
  { m: 'พ.ค.', b1: 65, b2: 25, b3: 8 },   { m: 'มิ.ย.', b1: 64, b2: 28, b3: 8 },
  { m: 'ก.ค.', b1: 63, b2: 30, b3: 10 },  { m: 'ส.ค.', b1: 64, b2: 25, b3: 10 },
  { m: 'ก.ย.', b1: 82, b2: 10, b3: 12 },  { m: 'ต.ค.', b1: 79, b2: 10, b3: 10 },
  { m: 'พ.ย.', b1: 78, b2: 13, b3: 13 },  { m: 'ธ.ค.', b1: 78, b2: 13, b3: 13 },
];

export const inOutData = [
  { m: 'ม.ค.', in: 1, out: -3 }, { m: 'ก.พ.', in: 3, out: -2 },
  { m: 'มี.ค.', in: 8, out: -2 }, { m: 'เม.ย.', in: 5, out: -2 },
  { m: 'พ.ค.', in: 8, out: -7 }, { m: 'มิ.ย.', in: 5, out: -3 },
  { m: 'ก.ค.', in: 3, out: -3 }, { m: 'ส.ค.', in: 8, out: -3 },
  { m: 'ก.ย.', in: 3, out: -5 }, { m: 'ต.ค.', in: 3, out: -8 },
  { m: 'พ.ย.', in: 4, out: -3 }, { m: 'ธ.ค.', in: 4, out: -8 },
];

export const salaryBaseActualData = [
  { m: 'ม.ค.', base: 3500000, actual: 3500000 }, { m: 'ก.พ.', base: 3500000, actual: 3500000 },
  { m: 'มี.ค.', base: 3600000, actual: 4500000 }, { m: 'เม.ย.', base: 4500000, actual: 4500000 },
  { m: 'พ.ค.', base: 4600000, actual: 4600000 }, { m: 'มิ.ย.', base: 4800000, actual: 4800000 },
  { m: 'ก.ค.', base: 4900000, actual: 5000000 }, { m: 'ส.ค.', base: 5000000, actual: 5200000 },
  { m: 'ก.ย.', base: 4800000, actual: 4600000 }, { m: 'ต.ค.', base: 4600000, actual: 4800000 },
  { m: 'พ.ย.', base: 5100000, actual: 5100000 },
];

export const documentStatusChart = [
  { name: 'สัญญา',         value: 20,  color: '#4a90d9' },
  { name: 'วันหยุด',       value: 363, color: '#f5a623' },
  { name: 'เอกสาร',        value: 23,  color: '#7ed321' },
  { name: 'ลาออก',         value: 33,  color: '#e74c3c' },
  { name: 'แบบฟอร์มต่างๆ', value: 42,  color: '#9b59b6' },
];

export const leaveTypePctChart = [
  { name: 'ลาป่วย',       value: 41, color: '#4a90d9' },
  { name: 'ลาพักร้อน',    value: 32, color: '#f5a623' },
  { name: 'ลากิจ',        value: 17, color: '#7ed321' },
  { name: 'ผ่าน QR Code', value: 7,  color: '#e74c3c' },
  { name: 'อื่นๆ',        value: 4,  color: '#9b59b6' },
];

export const attendanceConditionData = [
  { name: 'มาช้า',           value: 3634, color: '#3b82f6' },
  { name: 'บันทึก',          value: 99,   color: '#f97316' },
  { name: 'กลับก่อน',        value: 3778, color: '#22c55e' },
  { name: 'ทำงาน',           value: 94,   color: '#a78bfa' },
  { name: 'สายนอก',          value: 102,  color: '#f59e0b' },
  { name: 'สาขาไม่ผ่านเงิน', value: 2764, color: '#64748b' },
];

// ─── Organization tree ──────────────────────────────────────────────────────

export type TreeNode = {
  id: string;
  label: string;
  type: string;
  code: string;
  meta: string;
  children?: TreeNode[];
};

export const organizationTree: TreeNode[] = [
  {
    id: 'root',
    label: 'G-HUB Enterprise',
    type: 'บริษัท',
    code: 'GHB-ROOT',
    meta: 'สำนักงานใหญ่และบริษัทหลัก',
    children: [
      {
        id: 'bo01',
        label: 'สำนักงานใหญ่',
        type: 'สำนักงานสาขา',
        code: 'BO0001',
        meta: 'กรุงเทพฯ',
        children: [
          { id: 'd001', label: 'ฝ่ายบุคคล',   type: 'แผนก', code: 'DO0001', meta: 'HR Department' },
          { id: 'd002', label: 'ฝ่ายบัญชี',   type: 'แผนก', code: 'DO0002', meta: 'Accounting' },
          { id: 'd003', label: 'ฝ่ายขาย',     type: 'แผนก', code: 'DO0003', meta: 'Sales' },
          { id: 'd004', label: 'IT',           type: 'แผนก', code: 'DO0004', meta: 'Information Technology' },
          { id: 'd005', label: 'Operations',  type: 'แผนก', code: 'DO0005', meta: 'Operations' },
        ],
      },
      {
        id: 'bo02',
        label: 'สาขาเชียงใหม่',
        type: 'สำนักงานสาขา',
        code: 'BO0002',
        meta: 'เชียงใหม่',
        children: [
          { id: 'd006', label: 'ฝ่ายขาย',          type: 'แผนก', code: 'DO0006', meta: 'Sales CNX' },
          { id: 'd007', label: 'ฝ่ายบริการลูกค้า',  type: 'แผนก', code: 'DO0007', meta: 'Customer Service' },
        ],
      },
      {
        id: 'bo03',
        label: 'สาขาภูเก็ต',
        type: 'สำนักงานสาขา',
        code: 'BO0003',
        meta: 'ภูเก็ต',
        children: [
          { id: 'd008', label: 'ฝ่ายขาย', type: 'แผนก', code: 'DO0008', meta: 'Sales HKT' },
        ],
      },
    ],
  },
];

export const positionTree: TreeNode[] = [
  {
    id: 'pos-exe',
    label: 'ผู้บริหาร',
    type: 'Executive',
    code: 'POS-EXE',
    meta: 'ระดับนโยบาย',
    children: [
      {
        id: 'pos-mgr',
        label: 'ผู้จัดการ',
        type: 'Manager',
        code: 'POS-MGR',
        meta: 'ระดับบริหารทีม',
        children: [
          {
            id: 'pos-sup',
            label: 'หัวหน้างาน',
            type: 'Supervisor',
            code: 'POS-SUP',
            meta: 'ระดับควบคุมงาน',
            children: [
              { id: 'pos-stf', label: 'พนักงาน', type: 'Staff', code: 'POS-STF', meta: 'ระดับปฏิบัติการ' },
            ],
          },
        ],
      },
    ],
  },
];

// ─── Positions ──────────────────────────────────────────────────────────────

export const positions = [
  { id: 'P001', code: 'EX001', name: 'ผู้บริหาร',       nameEn: 'Executive',  level: 'Executive',  active: true  },
  { id: 'P002', code: 'MG001', name: 'ผู้จัดการ',       nameEn: 'Manager',    level: 'Manager',    active: true  },
  { id: 'P003', code: 'SV001', name: 'หัวหน้างาน',     nameEn: 'Supervisor', level: 'Supervisor', active: true  },
  { id: 'P004', code: 'ST001', name: 'พนักงานขาย',     nameEn: 'Sales Staff',level: 'Staff',      active: true  },
  { id: 'P005', code: 'ST002', name: 'พนักงานบัญชี',   nameEn: 'Accountant', level: 'Staff',      active: true  },
  { id: 'P006', code: 'ST003', name: 'พนักงานทั่วไป',  nameEn: 'General',    level: 'Staff',      active: false },
  { id: 'P007', code: 'ST004', name: 'ผู้อำนวยการ',    nameEn: 'Director',   level: 'Executive',  active: true  },
];

// ─── Employee types ─────────────────────────────────────────────────────────

export const employeeTypes = [
  { id: 'ET001', code: 'EMP-MONTHLY',  nameTh: 'พนักงานรายเดือน', nameEn: 'Monthly',    tax: 'หัก ณ ที่จ่าย', headcount: 74,  active: true  },
  { id: 'ET002', code: 'EMP-FRONT',    nameTh: 'พนักงานหน้าร้าน', nameEn: 'Front Store',tax: 'ไม่หัก',         headcount: 15,  active: true  },
  { id: 'ET003', code: 'EMP-DAILY',    nameTh: 'พนักงานรายวัน',   nameEn: 'Daily',      tax: 'ไม่หัก',         headcount: 4,   active: true  },
  { id: 'ET004', code: 'EMP-PARTTIME', nameTh: 'พนักงานพาร์ทไทม์',nameEn: 'Part Time',  tax: 'ไม่หัก',         headcount: 6,   active: false },
  { id: 'ET005', code: 'EMP-CONTRACT', nameTh: 'พนักงานเหมาจ่าย', nameEn: 'Contract',   tax: 'หัก ณ ที่จ่าย', headcount: 0,   active: false },
];

// ─── Work shifts (กะการทำงาน) ───────────────────────────────────────────────

export const workShifts = [
  { id: 'WS001', code: 'WC001', name: 'กะมาตรฐาน',     type: 'วันเดียวกัน',  time: '08:30 – 17:30', breakMin: 60, active: true  },
  { id: 'WS002', code: 'WC002', name: 'กะครึ่งวัน',    type: 'วันเดียวกัน',  time: '08:30 – 13:00', breakMin: 30, active: true  },
  { id: 'WS003', code: 'WC003', name: 'กะกลางคืน',     type: 'ข้ามเที่ยงคืน', time: '22:00 – 06:00', breakMin: 60, active: true  },
  { id: 'WS004', code: 'WC004', name: 'กะสายนอก',      type: 'วันเดียวกัน',  time: '09:00 – 18:00', breakMin: 60, active: false },
];

// ─── Employees ──────────────────────────────────────────────────────────────

export type Employee = {
  id: string;
  code: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  branch: string;
  empType: string;
  schedule: string;
  startDate: string;
  salary: number;
  status: 'ปกติ' | 'ลาพักร้อน' | 'ลาออก' | 'ทดลองงาน' | 'สิ้นสุดสัญญา';
  active: boolean;
  // FK ids (P5) — stable references into data-layer sources of truth
  companyId: string;        // → Company.id
  branchNodeId: string;     // → OrgNode(type:'branch').id
  departmentNodeId: string; // → OrgNode(type:'department'|'team').id — used for leave eligibility
  positionId: string;       // → Position.id
  employeeTypeId: string;   // → EmployeeType.id
};

// ─── Lookup maps: display string → stable id ────────────────────────────────
// 'CEO' maps to P001 (ผู้บริหาร) — no exact match in positions seed
export const POSITION_NAME_TO_ID: Record<string, string> = {
  'CEO':           'P001',
  'ผู้จัดการ':    'P002',
  'หัวหน้างาน':  'P003',
  'พนักงานขาย':  'P004',
  'พนักงานบัญชี': 'P005',
  'พนักงานทั่วไป':'P006',
  'ผู้อำนวยการ':  'P007',
};

export const EMPTYPE_NAME_TO_ID: Record<string, string> = {
  'รายเดือน':  'ET001',
  'รายวัน':    'ET003',
  'พาร์ทไทม์': 'ET004',
};

export const BRANCH_NAME_TO_NODE_ID: Record<string, string> = {
  'สำนักงานใหญ่':  'org-ghub-hq',
  'สาขาเชียงใหม่': 'org-ghub-cnx',
  'สาขาภูเก็ต':    'org-ghub-hkt',
};

// Branch+dept → department node id. 'IT'→org-ghub-it, 'Operations'→org-ghub-wh (closest match).
// CNX/HKT branches have fewer departments — map to sales as closest for most cases.
export const BRANCH_DEPT_TO_NODE_ID: Record<string, string> = {
  'สำนักงานใหญ่|ฝ่ายบุคคล':  'org-ghub-hr',
  'สำนักงานใหญ่|ฝ่ายบัญชี':  'org-ghub-acc',
  'สำนักงานใหญ่|ฝ่ายขาย':    'org-ghub-sales',
  'สำนักงานใหญ่|IT':          'org-ghub-it',
  'สำนักงานใหญ่|Operations':  'org-ghub-wh',
  'สาขาเชียงใหม่|ฝ่ายบุคคล':  'org-ghub-cnx-svc',
  'สาขาเชียงใหม่|ฝ่ายบัญชี':  'org-ghub-cnx-svc',
  'สาขาเชียงใหม่|ฝ่ายขาย':    'org-ghub-cnx-sales',
  'สาขาเชียงใหม่|IT':          'org-ghub-cnx-svc',
  'สาขาเชียงใหม่|Operations':  'org-ghub-cnx-svc',
  'สาขาภูเก็ต|ฝ่ายบุคคล':    'org-ghub-hkt-sales',
  'สาขาภูเก็ต|ฝ่ายบัญชี':    'org-ghub-hkt-sales',
  'สาขาภูเก็ต|ฝ่ายขาย':      'org-ghub-hkt-sales',
  'สาขาภูเก็ต|IT':            'org-ghub-hkt-sales',
  'สาขาภูเก็ต|Operations':    'org-ghub-hkt-sales',
};

const NAMES = ['สมชาย ใจดี','สุดา มีสุข','วิชัย แข็งแรง','นภา สวยงาม','ประเสริฐ ดีมาก','กาญจนา รักเรียน','ธนกร มั่งมี','พิมพ์ใจ งามตา','ศักดิ์ชัย ยิ้มแย้ม','วิไล ใจงาม'];
const POSITIONS = ['CEO','ผู้จัดการ','หัวหน้างาน','พนักงานขาย','พนักงานบัญชี','พนักงานทั่วไป','ผู้อำนวยการ'];
const DEPARTMENTS = ['ฝ่ายบุคคล','ฝ่ายบัญชี','ฝ่ายขาย','IT','Operations'];
const BRANCHES = ['สำนักงานใหญ่','สาขาเชียงใหม่','สาขาภูเก็ต'];
const EMP_TYPES = ['รายเดือน','รายวัน','พาร์ทไทม์'];
const START_DATES = ['10/06/2025','01/01/2025','04/05/2025'];

function statusOf(i: number): Employee['status'] {
  if (i % 8 === 0) return 'ลาออก';
  if (i % 5 === 0) return 'ลาพักร้อน';
  if (i % 7 === 0) return 'ทดลองงาน';
  return 'ปกติ';
}

export const employees: Employee[] = Array.from({ length: 28 }, (_, i) => {
  const branch = BRANCHES[i % 3];
  const department = DEPARTMENTS[i % 5];
  const position = POSITIONS[i % 7];
  const empType = EMP_TYPES[i % 3];
  return {
    id: `EMP${String(i + 1).padStart(4, '0')}`,
    code: String(20001 + i),
    name: NAMES[i % 10],
    email: `emp${i + 1}@ghub.co.th`,
    phone: `08${String(i).padStart(8, '0')}`,
    position,
    department,
    branch,
    empType,
    schedule: 'ทำงาน 08:30 – 17:30',
    startDate: START_DATES[i % 3],
    salary: 25000 + i * 3000,
    status: statusOf(i),
    active: statusOf(i) !== 'ลาออก',
    companyId: 'CO001',
    branchNodeId: BRANCH_NAME_TO_NODE_ID[branch] ?? 'org-ghub-hq',
    departmentNodeId: BRANCH_DEPT_TO_NODE_ID[`${branch}|${department}`] ?? 'org-ghub-wh',
    positionId: POSITION_NAME_TO_ID[position] ?? 'P001',
    employeeTypeId: EMPTYPE_NAME_TO_ID[empType] ?? 'ET001',
  };
});

// ─── Announcements ──────────────────────────────────────────────────────────

export const announcements = [
  { id: 'A001', title: 'ประกาศวันหยุดสงกรานต์ 2569',      type: 'นโยบาย',    date: '01/04/2569', status: 'เผยแพร่' },
  { id: 'A002', title: 'นโยบายการทำงานจากบ้าน',           type: 'นโยบาย',    date: '15/03/2569', status: 'เผยแพร่' },
  { id: 'A003', title: 'กิจกรรม Team Building ประจำปี',   type: 'กิจกรรม',   date: '20/05/2569', status: 'ร่าง'     },
  { id: 'A004', title: 'ปรับปรุงกฎระเบียบการลา',          type: 'นโยบาย',    date: '10/02/2569', status: 'เผยแพร่' },
];

// ─── Recruitment ─────────────────────────────────────────────────────────────

export const jobPostings = [
  { id: 'J001', code: 'JOB001', title: 'ผู้จัดการฝ่ายขาย', department: 'ฝ่ายขาย',   count: 1, deadline: '30/06/2569', status: 'เปิดรับ' },
  { id: 'J002', code: 'JOB002', title: 'นักบัญชี',          department: 'ฝ่ายบัญชี', count: 2, deadline: '15/07/2569', status: 'เปิดรับ' },
  { id: 'J003', code: 'JOB003', title: 'HR Officer',         department: 'ฝ่ายบุคคล', count: 1, deadline: '01/07/2569', status: 'ปิดรับ'  },
  { id: 'J004', code: 'JOB004', title: 'IT Support',         department: 'IT',         count: 1, deadline: '20/08/2569', status: 'เปิดรับ' },
];

export const applicants = [
  { id: 'AP001', name: 'สมชาย รักงาน',  position: 'ผู้จัดการฝ่ายขาย', date: '10/05/2569', status: 'รอสัมภาษณ์' },
  { id: 'AP002', name: 'นภา ใจดี',       position: 'นักบัญชี',          date: '12/05/2569', status: 'ผ่านการคัดเลือก' },
  { id: 'AP003', name: 'วิชัย มั่นคง',   position: 'IT Support',         date: '14/05/2569', status: 'รอสัมภาษณ์' },
  { id: 'AP004', name: 'กาญจนา สวยงาม', position: 'HR Officer',          date: '15/05/2569', status: 'ไม่ผ่าน' },
];

// ─── Payroll ─────────────────────────────────────────────────────────────────

export const leaveTypes = [
  { id: 'LT001', name: 'ลาป่วย',    quota: '30 วัน/ปี',   type: 'รายปี',   empType: 'ทุกประเภท', active: true  },
  { id: 'LT002', name: 'ลาพักร้อน', quota: '10 วัน/ปี',   type: 'รายปี',   empType: 'รายเดือน',  active: true  },
  { id: 'LT003', name: 'ลากิจ',     quota: '3 วัน/ปี',    type: 'รายปี',   empType: 'ทุกประเภท', active: true  },
  { id: 'LT004', name: 'ลาคลอด',    quota: '98 วัน/ครั้ง', type: 'ต่อครั้ง', empType: 'รายเดือน',  active: true  },
];

export const holidays = [
  { id: 'H001', name: 'วันขึ้นปีใหม่',       date: '01/01/2569', type: 'ราชการ'          },
  { id: 'H002', name: 'วันสงกรานต์',          date: '13/04/2569', type: 'ราชการ'          },
  { id: 'H003', name: 'วันแรงงาน',            date: '01/05/2569', type: 'ราชการ'          },
  { id: 'H004', name: 'วันก่อตั้งบริษัท',    date: '15/06/2569', type: 'บริษัท'          },
];

// ─── Performance ─────────────────────────────────────────────────────────────

export const kpiItems = [
  { id: 'K001', code: 'KPI001', name: 'ยอดขายรายเดือน',       unit: 'บาท', target: '500,000',  weight: 40, department: 'ฝ่ายขาย'   },
  { id: 'K002', code: 'KPI002', name: 'ความพึงพอใจลูกค้า',    unit: '%',   target: '90',       weight: 30, department: 'ฝ่ายขาย'   },
  { id: 'K003', code: 'KPI003', name: 'จำนวนใบสมัครที่ประมวล', unit: 'ราย', target: '20',       weight: 30, department: 'ฝ่ายบุคคล' },
];

export const trainingItems = [
  { id: 'T001', title: 'อบรมความปลอดภัยในการทำงาน', date: '10/05/2569', hours: 6,  attendees: 45, status: 'เสร็จแล้ว'      },
  { id: 'T002', title: 'อบรมทักษะการขาย',           date: '25/06/2569', hours: 8,  attendees: 12, status: 'กำลังจะถึง'    },
  { id: 'T003', title: 'อบรม ISO 9001',              date: '01/07/2569', hours: 16, attendees: 8,  status: 'ยังไม่เริ่ม'   },
  { id: 'T004', title: 'อบรมการใช้งานระบบ ERP',     date: '15/05/2569', hours: 4,  attendees: 30, status: 'กำลังดำเนิน'   },
];

export const evalCycles = [
  { id: 'EC001', name: 'รอบประเมินกลางปี 2569',     period: 'ม.ค. – มิ.ย. 2569', deadline: '31/07/2569', status: 'กำลังดำเนิน' },
  { id: 'EC002', name: 'รอบประเมินสิ้นปี 2568',    period: 'ก.ค. – ธ.ค. 2568', deadline: '31/01/2569', status: 'เสร็จสิ้น'    },
];

// ─── Settings ────────────────────────────────────────────────────────────────

export const hrSettings = {
  companyName: 'G-HUB Enterprise',
  taxId: '0105560000000',
  socialSecurityCode: 'SSO-0001',
  payrollDay: 28,
  probationDays: 90,
  currency: 'THB',
};


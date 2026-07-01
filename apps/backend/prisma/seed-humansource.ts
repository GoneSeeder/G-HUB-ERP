// HumanSource (HR) seed — ported from frontend mock (data/humansource/*), which is the
// frozen seed/contract source per HR_BACKEND_PLAN.md. Idempotent (upsert by id).
// Run standalone:  ts-node prisma/seed-humansource.ts
// Or imported and called from prisma/seed.ts main().
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

// ─── Org tree (flattened, parent-first) — from data/humansource/org-structure.ts ───
type OrgSeed = { id: string; name: string; type: string; parentId: string | null };
const ORG_NODES: OrgSeed[] = [
  { id: 'org-ghub',           name: 'G-HUB Enterprise',          type: 'company',    parentId: null },
  { id: 'org-ghub-hq',        name: 'สำนักงานใหญ่',              type: 'branch',     parentId: 'org-ghub' },
  { id: 'org-ghub-exec',      name: 'ฝ่ายบริหาร',                type: 'department', parentId: 'org-ghub-hq' },
  { id: 'org-ghub-hr',        name: 'ฝ่ายบุคคล',                 type: 'department', parentId: 'org-ghub-hq' },
  { id: 'org-ghub-wh',        name: 'ฝ่ายคลังสินค้า',            type: 'department', parentId: 'org-ghub-hq' },
  { id: 'org-ghub-sales',     name: 'ฝ่ายขาย',                   type: 'department', parentId: 'org-ghub-hq' },
  { id: 'org-ghub-sales-bkk', name: 'ทีมขายกรุงเทพ',             type: 'team',       parentId: 'org-ghub-sales' },
  { id: 'org-ghub-mkt',       name: 'ฝ่ายการตลาด',               type: 'department', parentId: 'org-ghub-hq' },
  { id: 'org-ghub-it',        name: 'ฝ่ายเทคโนโลยีสารสนเทศ',     type: 'department', parentId: 'org-ghub-hq' },
  { id: 'org-ghub-acc',       name: 'ฝ่ายบัญชีและการเงิน',       type: 'department', parentId: 'org-ghub-hq' },
  { id: 'org-ghub-cnx',       name: 'สาขาเชียงใหม่',             type: 'branch',     parentId: 'org-ghub' },
  { id: 'org-ghub-cnx-sales', name: 'ฝ่ายขาย',                   type: 'department', parentId: 'org-ghub-cnx' },
  { id: 'org-ghub-cnx-svc',   name: 'ฝ่ายบริการลูกค้า',          type: 'department', parentId: 'org-ghub-cnx' },
  { id: 'org-ghub-hkt',       name: 'สาขาภูเก็ต',                type: 'branch',     parentId: 'org-ghub' },
  { id: 'org-ghub-hkt-sales', name: 'ฝ่ายขาย',                   type: 'department', parentId: 'org-ghub-hkt' },
  { id: 'org-mhub',           name: 'M-HUB Enterprise',          type: 'company',    parentId: null },
  { id: 'org-mhub-hq',        name: 'สำนักงานใหญ่',              type: 'branch',     parentId: 'org-mhub' },
];

const COMPANIES = [
  { id: 'CO001', orgNodeId: 'org-ghub', legalNameTh: 'บริษัท จี-ฮับ เอ็นเตอร์ไพรส์ จำกัด', tradeName: 'G-HUB Enterprise', taxId: '0105560000000', socialSecurityCode: 'SSO-0001' },
];

const JOB_LEVELS = [
  { id: 'JL-CEO', nameTh: 'CEO', nameEn: 'CEO', rank: 1, active: true },
  { id: 'JL-E',   nameTh: 'E',   nameEn: 'E',   rank: 2, active: true },
  { id: 'JL-M',   nameTh: 'M',   nameEn: 'M',   rank: 3, active: true },
  { id: 'JL-O3',  nameTh: 'O3',  nameEn: 'O3',  rank: 4, active: true },
  { id: 'JL-O2',  nameTh: 'O2',  nameEn: 'O2',  rank: 5, active: true },
  { id: 'JL-O1',  nameTh: 'O1',  nameEn: 'O1',  rank: 6, active: true },
  { id: 'JL-T',   nameTh: 'T',   nameEn: 'T',   rank: 7, active: true },
  { id: 'JL-P',   nameTh: 'P',   nameEn: 'P',   rank: 8, active: true },
];

const POSITIONS = [
  { id: 'P001', code: 'EX001', nameTh: 'ผู้บริหาร',      nameEn: 'Executive',   level: 'Executive',  jobLevelId: 'JL-E',  companyId: '', employeeTypes: [], salaryMin: 100000, salaryMax: 200000, overview: '', responsibilities: '', qualifications: '', hasBenefits: true,  active: true  },
  { id: 'P002', code: 'MG001', nameTh: 'ผู้จัดการ',      nameEn: 'Manager',     level: 'Manager',    jobLevelId: 'JL-M',  companyId: '', employeeTypes: [], salaryMin: 55000,  salaryMax: 80000,  overview: '', responsibilities: '', qualifications: '', hasBenefits: true,  active: true  },
  { id: 'P003', code: 'SV001', nameTh: 'หัวหน้างาน',    nameEn: 'Supervisor',  level: 'Supervisor', jobLevelId: 'JL-O3', companyId: '', employeeTypes: [], salaryMin: 32000,  salaryMax: 45000,  overview: '', responsibilities: '', qualifications: '', hasBenefits: true,  active: true  },
  { id: 'P004', code: 'ST001', nameTh: 'พนักงานขาย',    nameEn: 'Sales Staff', level: 'Staff',      jobLevelId: 'JL-O1', companyId: '', employeeTypes: [], salaryMin: 20000,  salaryMax: 30000,  overview: '', responsibilities: '', qualifications: '', hasBenefits: false, active: true  },
  { id: 'P005', code: 'ST002', nameTh: 'พนักงานบัญชี',  nameEn: 'Accountant',  level: 'Staff',      jobLevelId: 'JL-O1', companyId: '', employeeTypes: [], salaryMin: 22000,  salaryMax: 32000,  overview: '', responsibilities: '', qualifications: '', hasBenefits: false, active: true  },
  { id: 'P006', code: 'ST003', nameTh: 'พนักงานทั่วไป', nameEn: 'General',     level: 'Staff',      jobLevelId: 'JL-O1', companyId: '', employeeTypes: [], salaryMin: 18000,  salaryMax: 25000,  overview: '', responsibilities: '', qualifications: '', hasBenefits: false, active: false },
  { id: 'P007', code: 'ST004', nameTh: 'ผู้อำนวยการ',   nameEn: 'Director',    level: 'Executive',  jobLevelId: 'JL-E',  companyId: '', employeeTypes: [], salaryMin: 90000,  salaryMax: 150000, overview: '', responsibilities: '', qualifications: '', hasBenefits: true,  active: true  },
];

// ─── Leave types seed (mirrors leave-types.ts LEAVE_TYPE_SEED) ─────────────────
const CANONICAL_SHIFTS = [
  { id: 'WC001', code: 'S1', name: 'สำนักงาน 08.00-17.00', type: 'กะเช้า', time: '08:00-12:00 / 13:00-17:00', companyScope: 'ใช้กับทุกบริษัท', groupKey: 'same-day', enabled: true, description: 'พนักงานออฟฟิศ', timezone: 'Asia/Bangkok (UTC+07:00)', color: '#bf5a5a', attendanceRule: 'ตามเวลาทำงานในกะ', flexibleEntryEnabled: false, flexibleMinutes: 0, minimumWorkHours: 8, trackBreak: true, shiftAllowanceEnabled: false, shiftAllowanceAmount: 0, prorateShiftAllowance: true, holidayPremiumEnabled: false, overtimePremiumEnabled: false, updatedBy: 'empeo Team' },
  { id: 'WC002', code: 'S2', name: 'กะเช้า 06.00-14.00', type: 'กะเช้า', time: '06:00-10:00 / 10:30-14:00', companyScope: 'ใช้กับทุกบริษัท', groupKey: 'same-day', enabled: true, description: 'พนักงานกะเช้า', timezone: 'Asia/Bangkok (UTC+07:00)', color: '#3b82f6', attendanceRule: 'ตามเวลาทำงานในกะ', flexibleEntryEnabled: false, flexibleMinutes: 0, minimumWorkHours: 8, trackBreak: true, shiftAllowanceEnabled: false, shiftAllowanceAmount: 0, prorateShiftAllowance: true, holidayPremiumEnabled: false, overtimePremiumEnabled: false, updatedBy: 'empeo Team' },
  { id: 'WC003', code: 'S3', name: 'กะบ่าย 14.00-22.00', type: 'กะบ่าย', time: '14:00-18:00 / 18:30-22:00', companyScope: 'ใช้กับทุกบริษัท', groupKey: 'overnight', enabled: true, description: 'พนักงานกะบ่าย', timezone: 'Asia/Bangkok (UTC+07:00)', color: '#f97316', attendanceRule: 'ตามเวลาทำงานในกะ', flexibleEntryEnabled: false, flexibleMinutes: 0, minimumWorkHours: 8, trackBreak: true, shiftAllowanceEnabled: false, shiftAllowanceAmount: 0, prorateShiftAllowance: true, holidayPremiumEnabled: false, overtimePremiumEnabled: false, updatedBy: 'empeo Team' },
  { id: 'WC004', code: 'S4', name: 'กะดึก 22.00-06.00', type: 'กะดึก', time: '22:00-02:00 / 02:30-06:00', companyScope: 'ใช้กับทุกบริษัท', groupKey: 'total-hours', enabled: true, description: 'พนักงานกะดึก', timezone: 'Asia/Bangkok (UTC+07:00)', color: '#334155', attendanceRule: 'ตามเวลาทำงานในกะ', flexibleEntryEnabled: false, flexibleMinutes: 0, minimumWorkHours: 8, trackBreak: true, shiftAllowanceEnabled: false, shiftAllowanceAmount: 0, prorateShiftAllowance: true, holidayPremiumEnabled: false, overtimePremiumEnabled: false, updatedBy: 'empeo Team' },
];

const _br = { payType: 'paid', countBasis: 'working-day', countHolidayAsLeave: false, minMinutes: 60, allowHalfDay: true, advanceDays: 7, backdateDays: 3, maxConsecutiveDays: null, requireAttachment: false, requireAttachmentOverDays: null, rounding: 'half', carryOver: false, carryOverCap: null, carryOverExpiryMonths: null };
const _be = { gender: 'all', requirePassProbation: false, minTenureMonths: 0, positionIds: [], orgNodeIds: [], employeeIds: [] };
const _ba = { useDefaultTemplate: true, templateDocType: null };
const _fq = (d: number) => ({ mode: 'fixed', fixedDays: d, prorateFirstYear: true, cutoffBasis: 'fiscal-year' });

const LEAVE_TYPES = [
  {
    id: 'leave-sick',      code: 'SICK',     nameTh: 'ลาป่วย',                  nameEn: 'Sick Leave',             tag: 'ลาป่วย',       color: '#ef4444', unit: 'day', statutory: true, enabled: true,
    rules: { ..._br, payType: 'paid', backdateDays: 7, requireAttachment: true, requireAttachmentOverDays: 3 },
    eligibility: { ..._be }, quota: _fq(30), approval: { ..._ba },
  },
  {
    id: 'leave-personal',  code: 'PERSONAL', nameTh: 'ลากิจธุระจำเป็น',        nameEn: 'Personal Leave',         tag: 'ลากิจ',        color: '#f59e0b', unit: 'day', statutory: true, enabled: true,
    rules: { ..._br, payType: 'paid', advanceDays: 3 },
    eligibility: { ..._be }, quota: _fq(3), approval: { ..._ba },
  },
  {
    id: 'leave-annual',    code: 'ANNUAL',   nameTh: 'ลาพักร้อน',               nameEn: 'Annual Leave',           tag: 'ลาพักร้อน',    color: '#0ea5e9', unit: 'day', statutory: true, enabled: true,
    rules: { ..._br, payType: 'paid', advanceDays: 14, backdateDays: 0, carryOver: true, carryOverCap: 5, carryOverExpiryMonths: 6 },
    eligibility: { ..._be, requirePassProbation: true, minTenureMonths: 12 },
    quota: { mode: 'tenure-tier', tiers: [{ minMonths: 0, maxMonths: 12, days: 0 }, { minMonths: 12, maxMonths: 36, days: 6 }, { minMonths: 36, maxMonths: 60, days: 8 }, { minMonths: 60, maxMonths: null, days: 10 }], prorateFirstYear: true, cutoffBasis: 'fiscal-year' },
    approval: { ..._ba },
  },
  {
    id: 'leave-maternity', code: 'MATERNITY', nameTh: 'ลาคลอด',               nameEn: 'Maternity Leave',        tag: 'ลาคลอด',      color: '#ec4899', unit: 'day', statutory: true, enabled: true,
    rules: { ..._br, payType: 'partial', partialPaidDays: 45, countBasis: 'calendar-day', countHolidayAsLeave: true, allowHalfDay: false, advanceDays: 30, requireAttachment: true, requireAttachmentOverDays: 0 },
    eligibility: { ..._be, gender: 'female' }, quota: _fq(98), approval: { ..._ba },
  },
  {
    id: 'leave-sterilization', code: 'STERILIZATION', nameTh: 'ลาทำหมัน',      nameEn: 'Sterilization Leave',    tag: 'ลาทำหมัน',    color: '#8b5cf6', unit: 'day', statutory: true, enabled: true,
    rules: { ..._br, payType: 'paid', allowHalfDay: false, requireAttachment: true, requireAttachmentOverDays: 0 },
    eligibility: { ..._be },
    quota: { mode: 'medical', prorateFirstYear: false, cutoffBasis: 'fiscal-year' },
    approval: { ..._ba },
  },
  {
    id: 'leave-military',  code: 'MILITARY', nameTh: 'ลารับราชการทหาร',        nameEn: 'Military Service Leave', tag: 'ลาทหาร',      color: '#16a34a', unit: 'day', statutory: true, enabled: true,
    rules: { ..._br, payType: 'paid', countBasis: 'calendar-day', allowHalfDay: false, advanceDays: 30, requireAttachment: true, requireAttachmentOverDays: 0 },
    eligibility: { ..._be, gender: 'male' }, quota: _fq(60), approval: { ..._ba },
  },
  {
    id: 'leave-training',  code: 'TRAINING', nameTh: 'ลาฝึกอบรม',              nameEn: 'Training Leave',         tag: 'ลาฝึกอบรม',   color: '#0891b2', unit: 'day', statutory: true, enabled: true,
    rules: { ..._br, payType: 'unpaid', allowHalfDay: false, advanceDays: 30, requireAttachment: true, requireAttachmentOverDays: 0 },
    eligibility: { ..._be, requirePassProbation: true }, quota: _fq(30), approval: { ..._ba },
  },
];

// ─── Document approval configs (mirrors approval-workflows.ts DOCUMENT_TYPES_SEED) ─
const DOCUMENT_APPROVAL_CONFIGS = [
  { docType: 'leave',           labelTh: 'เอกสารลางาน',            mechanism: 'position-structure', steps: '2' },
  { docType: 'ot',              labelTh: 'เอกสารโอที',              mechanism: 'position-structure', steps: '2' },
  { docType: 'time-adjust',     labelTh: 'เอกสารจัดการเพิ่มเวลา',   mechanism: 'position-structure', steps: '2' },
  { docType: 'shift-change',    labelTh: 'เอกสารเปลี่ยนกะการทำงาน', mechanism: 'position-structure', steps: '2' },
  { docType: 'holiday-change',  labelTh: 'เอกสารเปลี่ยนวันหยุด',    mechanism: 'position-structure', steps: '2' },
  { docType: 'salary-cert',     labelTh: 'เอกสารรับรองเงินเดือน',   mechanism: 'position-structure', steps: 'hr' },
  { docType: 'employment-cert', labelTh: 'เอกสารรับรองการทำงาน',    mechanism: 'position-structure', steps: 'hr' },
  { docType: 'visa',            labelTh: 'เอกสารการขอวีซ่า',        mechanism: 'position-structure', steps: 'hr' },
  { docType: 'petty-cash',      labelTh: 'เอกสารเบิกเงินสดย่อย',    mechanism: 'position-structure', steps: 'hr' },
  { docType: 'welfare',         labelTh: 'เอกสารสวัสดิการ',         mechanism: 'position-structure', steps: 'hr' },
  { docType: 'resignation',     labelTh: 'เอกสารลาออก',             mechanism: 'position-structure', steps: 'hr' },
];

const EMPLOYEE_TYPES = [
  { id: 'ET001', code: 'EMP-MONTHLY',  nameTh: 'พนักงานรายเดือน',  nameEn: 'Monthly',     tax: 'หัก ณ ที่จ่าย', active: true },
  { id: 'ET002', code: 'EMP-FRONT',    nameTh: 'พนักงานหน้าร้าน',  nameEn: 'Front Store', tax: 'ไม่หัก',         active: true },
  { id: 'ET003', code: 'EMP-DAILY',    nameTh: 'พนักงานรายวัน',    nameEn: 'Daily',       tax: 'ไม่หัก',         active: true },
  { id: 'ET004', code: 'EMP-PARTTIME', nameTh: 'พนักงานพาร์ทไทม์', nameEn: 'Part Time',   tax: 'ไม่หัก',         active: false },
  { id: 'ET005', code: 'EMP-CONTRACT', nameTh: 'พนักงานเหมาจ่าย',  nameEn: 'Contract',    tax: 'หัก ณ ที่จ่าย', active: false },
];

// ─── Lookup maps (from mock.ts) ───
const POSITION_NAME_TO_ID: Record<string, string> = {
  'CEO': 'P001', 'ผู้จัดการ': 'P002', 'หัวหน้างาน': 'P003', 'พนักงานขาย': 'P004',
  'พนักงานบัญชี': 'P005', 'พนักงานทั่วไป': 'P006', 'ผู้อำนวยการ': 'P007',
};
const EMPTYPE_NAME_TO_ID: Record<string, string> = { 'รายเดือน': 'ET001', 'รายวัน': 'ET003', 'พาร์ทไทม์': 'ET004' };
const BRANCH_NAME_TO_NODE_ID: Record<string, string> = {
  'สำนักงานใหญ่': 'org-ghub-hq', 'สาขาเชียงใหม่': 'org-ghub-cnx', 'สาขาภูเก็ต': 'org-ghub-hkt',
};
const BRANCH_DEPT_TO_NODE_ID: Record<string, string> = {
  'สำนักงานใหญ่|ฝ่ายบุคคล': 'org-ghub-hr', 'สำนักงานใหญ่|ฝ่ายบัญชี': 'org-ghub-acc', 'สำนักงานใหญ่|ฝ่ายขาย': 'org-ghub-sales',
  'สำนักงานใหญ่|IT': 'org-ghub-it', 'สำนักงานใหญ่|Operations': 'org-ghub-wh',
  'สาขาเชียงใหม่|ฝ่ายบุคคล': 'org-ghub-cnx-svc', 'สาขาเชียงใหม่|ฝ่ายบัญชี': 'org-ghub-cnx-svc', 'สาขาเชียงใหม่|ฝ่ายขาย': 'org-ghub-cnx-sales',
  'สาขาเชียงใหม่|IT': 'org-ghub-cnx-svc', 'สาขาเชียงใหม่|Operations': 'org-ghub-cnx-svc',
  'สาขาภูเก็ต|ฝ่ายบุคคล': 'org-ghub-hkt-sales', 'สาขาภูเก็ต|ฝ่ายบัญชี': 'org-ghub-hkt-sales', 'สาขาภูเก็ต|ฝ่ายขาย': 'org-ghub-hkt-sales',
  'สาขาภูเก็ต|IT': 'org-ghub-hkt-sales', 'สาขาภูเก็ต|Operations': 'org-ghub-hkt-sales',
};

// ─── 35-employee seed (mirrors data/humansource/mock.ts EMPLOYEE_SEED) ───
type EmployeeSeed = {
  name: string; handle: string; position: string; department: string; branch: string;
  empType: string; status: string; salary: number; startDate: string;
  supervisorHandle?: string;
};
const EMPLOYEE_SEED: EmployeeSeed[] = [
  { name: 'สมชาย ใจดี',          handle: 'somchai.j',   position: 'CEO',           department: 'ฝ่ายบุคคล', branch: 'สำนักงานใหญ่',  empType: 'รายเดือน', status: 'ปกติ',        salary: 150000, startDate: '10/06/2019' },
  { name: 'ประเสริฐ วงศ์ไพศาล', handle: 'prasert.w',   position: 'ผู้อำนวยการ',   department: 'Operations', branch: 'สำนักงานใหญ่',  empType: 'รายเดือน', status: 'ปกติ',        salary: 110000, startDate: '01/02/2020', supervisorHandle: 'somchai.j' },
  { name: 'กาญจนา ศรีสุข',       handle: 'kanjana.s',   position: 'ผู้จัดการ',     department: 'ฝ่ายบุคคล', branch: 'สำนักงานใหญ่',  empType: 'รายเดือน', status: 'ปกติ',        salary: 68000,  startDate: '15/03/2020', supervisorHandle: 'prasert.w' },
  { name: 'ธนกร รัตนชัย',        handle: 'thanakorn.r', position: 'ผู้จัดการ',     department: 'ฝ่ายบัญชี', branch: 'สำนักงานใหญ่',  empType: 'รายเดือน', status: 'ปกติ',        salary: 65000,  startDate: '01/07/2020', supervisorHandle: 'prasert.w' },
  { name: 'วิไล จันทร์เพ็ญ',     handle: 'wilai.c',     position: 'ผู้จัดการ',     department: 'ฝ่ายขาย',   branch: 'สำนักงานใหญ่',  empType: 'รายเดือน', status: 'ปกติ',        salary: 72000,  startDate: '12/09/2020', supervisorHandle: 'prasert.w' },
  { name: 'อนุชา เทพประสิทธิ์', handle: 'anucha.t',    position: 'ผู้จัดการ',     department: 'IT',         branch: 'สำนักงานใหญ่',  empType: 'รายเดือน', status: 'ปกติ',        salary: 70000,  startDate: '03/01/2021', supervisorHandle: 'prasert.w' },
  { name: 'พิมพ์ใจ งามตา',       handle: 'pimjai.n',    position: 'หัวหน้างาน',    department: 'ฝ่ายบุคคล', branch: 'สำนักงานใหญ่',  empType: 'รายเดือน', status: 'ปกติ',        salary: 38000,  startDate: '20/05/2021', supervisorHandle: 'kanjana.s' },
  { name: 'ศักดิ์ชัย ยิ้มแย้ม', handle: 'sakchai.y',   position: 'หัวหน้างาน',    department: 'ฝ่ายบัญชี', branch: 'สำนักงานใหญ่',  empType: 'รายเดือน', status: 'ปกติ',        salary: 40000,  startDate: '18/08/2021', supervisorHandle: 'thanakorn.r' },
  { name: 'นภา สวยงาม',          handle: 'napa.s',      position: 'หัวหน้างาน',    department: 'ฝ่ายขาย',   branch: 'สำนักงานใหญ่',  empType: 'รายเดือน', status: 'ปกติ',        salary: 42000,  startDate: '02/02/2022', supervisorHandle: 'wilai.c' },
  { name: 'วิชัย แข็งแรง',        handle: 'wichai.k',    position: 'หัวหน้างาน',    department: 'IT',         branch: 'สำนักงานใหญ่',  empType: 'รายเดือน', status: 'ปกติ',        salary: 41000,  startDate: '15/06/2022', supervisorHandle: 'anucha.t' },
  { name: 'สุดา มีสุข',          handle: 'suda.m',      position: 'พนักงานบัญชี',  department: 'ฝ่ายบัญชี', branch: 'สำนักงานใหญ่',  empType: 'รายเดือน', status: 'ปกติ',        salary: 28000,  startDate: '01/03/2022', supervisorHandle: 'sakchai.y' },
  { name: 'รัตนา ทองคำ',         handle: 'rattana.t',   position: 'พนักงานบัญชี',  department: 'ฝ่ายบัญชี', branch: 'สำนักงานใหญ่',  empType: 'รายเดือน', status: 'ปกติ',        salary: 26000,  startDate: '10/10/2022', supervisorHandle: 'sakchai.y' },
  { name: 'มานพ สุขสันต์',       handle: 'manop.s',     position: 'พนักงานขาย',    department: 'ฝ่ายขาย',   branch: 'สำนักงานใหญ่',  empType: 'รายเดือน', status: 'ปกติ',        salary: 24000,  startDate: '05/05/2023', supervisorHandle: 'napa.s' },
  { name: 'จิราภรณ์ แสงทอง',     handle: 'jiraporn.s',  position: 'พนักงานขาย',    department: 'ฝ่ายขาย',   branch: 'สำนักงานใหญ่',  empType: 'รายเดือน', status: 'ปกติ',        salary: 23000,  startDate: '20/07/2023', supervisorHandle: 'napa.s' },
  { name: 'เอกพงษ์ ชัยมงคล',     handle: 'ekkapong.c',  position: 'พนักงานทั่วไป', department: 'IT',         branch: 'สำนักงานใหญ่',  empType: 'รายเดือน', status: 'ปกติ',        salary: 25000,  startDate: '01/09/2023', supervisorHandle: 'wichai.k' },
  { name: 'สุภาพร ดวงดี',        handle: 'supaporn.d',  position: 'พนักงานทั่วไป', department: 'ฝ่ายบุคคล', branch: 'สำนักงานใหญ่',  empType: 'รายเดือน', status: 'ปกติ',        salary: 22000,  startDate: '15/11/2023', supervisorHandle: 'pimjai.n' },
  { name: 'ชาญชัย ภักดี',        handle: 'chanchai.p',  position: 'พนักงานทั่วไป', department: 'Operations', branch: 'สำนักงานใหญ่',  empType: 'รายวัน',   status: 'ปกติ',        salary: 18000,  startDate: '02/01/2024', supervisorHandle: 'prasert.w' },
  { name: 'ปรีดา ทองดี',         handle: 'preeda.t',    position: 'พนักงานทั่วไป', department: 'Operations', branch: 'สำนักงานใหญ่',  empType: 'รายวัน',   status: 'ปกติ',        salary: 17500,  startDate: '10/02/2024', supervisorHandle: 'prasert.w' },
  { name: 'วรรณภา ใจซื่อ',       handle: 'wannapa.j',   position: 'พนักงานทั่วไป', department: 'Operations', branch: 'สำนักงานใหญ่',  empType: 'รายวัน',   status: 'ทดลองงาน',   salary: 17000,  startDate: '01/05/2026', supervisorHandle: 'prasert.w' },
  { name: 'ธีรศักดิ์ คงทน',      handle: 'theerasak.k', position: 'พนักงานขาย',    department: 'ฝ่ายขาย',   branch: 'สำนักงานใหญ่',  empType: 'รายเดือน', status: 'ทดลองงาน',   salary: 22000,  startDate: '15/04/2026', supervisorHandle: 'napa.s' },
  { name: 'อรทัย พูนสุข',        handle: 'orathai.p',   position: 'พนักงานทั่วไป', department: 'ฝ่ายบุคคล', branch: 'สำนักงานใหญ่',  empType: 'พาร์ทไทม์', status: 'ปกติ',        salary: 14000,  startDate: '01/06/2025', supervisorHandle: 'pimjai.n' },
  { name: 'กิตติ มากมี',         handle: 'kitti.m',     position: 'พนักงานทั่วไป', department: 'Operations', branch: 'สำนักงานใหญ่',  empType: 'พาร์ทไทม์', status: 'ปกติ',        salary: 13000,  startDate: '10/08/2025', supervisorHandle: 'prasert.w' },
  { name: 'สมหญิง รุ่งเรือง',    handle: 'somying.r',   position: 'พนักงานบัญชี',  department: 'ฝ่ายบัญชี', branch: 'สำนักงานใหญ่',  empType: 'รายเดือน', status: 'ลาพักร้อน',  salary: 27000,  startDate: '03/03/2022', supervisorHandle: 'sakchai.y' },
  { name: 'ณัฐพล อินทร์',        handle: 'nattapon.i',  position: 'พนักงานขาย',    department: 'ฝ่ายขาย',   branch: 'สำนักงานใหญ่',  empType: 'รายเดือน', status: 'ลาออก',       salary: 24000,  startDate: '01/01/2021', supervisorHandle: 'napa.s' },
  { name: 'ภาณุพงศ์ ดอยคำ',      handle: 'panupong.d',  position: 'ผู้จัดการ',     department: 'ฝ่ายขาย',   branch: 'สาขาเชียงใหม่', empType: 'รายเดือน', status: 'ปกติ',        salary: 60000,  startDate: '01/04/2021', supervisorHandle: 'somchai.j' },
  { name: 'มาลี ล้านนา',         handle: 'malee.l',     position: 'หัวหน้างาน',    department: 'ฝ่ายขาย',   branch: 'สาขาเชียงใหม่', empType: 'รายเดือน', status: 'ปกติ',        salary: 36000,  startDate: '12/07/2022', supervisorHandle: 'panupong.d' },
  { name: 'สมพร ขุนเขา',         handle: 'somporn.k',   position: 'พนักงานขาย',    department: 'ฝ่ายขาย',   branch: 'สาขาเชียงใหม่', empType: 'รายเดือน', status: 'ปกติ',        salary: 22000,  startDate: '05/09/2023', supervisorHandle: 'malee.l' },
  { name: 'ดวงใจ ไพรพนา',        handle: 'duangjai.p',  position: 'พนักงานขาย',    department: 'ฝ่ายขาย',   branch: 'สาขาเชียงใหม่', empType: 'รายเดือน', status: 'ปกติ',        salary: 21000,  startDate: '18/01/2024', supervisorHandle: 'malee.l' },
  { name: 'ปิยะ เชียงดาว',       handle: 'piya.c',      position: 'พนักงานทั่วไป', department: 'ฝ่ายบุคคล', branch: 'สาขาเชียงใหม่', empType: 'รายวัน',   status: 'ปกติ',        salary: 16500,  startDate: '02/03/2024', supervisorHandle: 'panupong.d' },
  { name: 'กนกวรรณ สันป่าตอง',   handle: 'kanokwan.s',  position: 'พนักงานบัญชี',  department: 'ฝ่ายบัญชี', branch: 'สาขาเชียงใหม่', empType: 'รายเดือน', status: 'ปกติ',        salary: 24000,  startDate: '10/06/2023', supervisorHandle: 'panupong.d' },
  { name: 'ธวัช แม่ริม',         handle: 'thawat.m',    position: 'พนักงานทั่วไป', department: 'Operations', branch: 'สาขาเชียงใหม่', empType: 'รายวัน',   status: 'สิ้นสุดสัญญา', salary: 16000,  startDate: '01/01/2023', supervisorHandle: 'panupong.d' },
  { name: 'อิสรา อันดามัน',      handle: 'isara.a',     position: 'ผู้จัดการ',     department: 'ฝ่ายขาย',   branch: 'สาขาภูเก็ต',    empType: 'รายเดือน', status: 'ปกติ',        salary: 58000,  startDate: '01/05/2022', supervisorHandle: 'somchai.j' },
  { name: 'ชลธี ทะเลใส',         handle: 'chonlatee.t', position: 'หัวหน้างาน',    department: 'ฝ่ายขาย',   branch: 'สาขาภูเก็ต',    empType: 'รายเดือน', status: 'ปกติ',        salary: 35000,  startDate: '15/08/2023', supervisorHandle: 'isara.a' },
  { name: 'นรินทร์ หาดทราย',     handle: 'narin.h',     position: 'พนักงานขาย',    department: 'ฝ่ายขาย',   branch: 'สาขาภูเก็ต',    empType: 'รายเดือน', status: 'ปกติ',        salary: 21000,  startDate: '20/02/2024', supervisorHandle: 'chonlatee.t' },
  { name: 'พรทิพย์ เกาะแก้ว',    handle: 'porntip.k',   position: 'พนักงานขาย',    department: 'ฝ่ายขาย',   branch: 'สาขาภูเก็ต',    empType: 'รายวัน',   status: 'ทดลองงาน',   salary: 16000,  startDate: '01/06/2026', supervisorHandle: 'chonlatee.t' },
];

const HANDLE_TO_EMPLOYEE_ID: Record<string, string> = Object.fromEntries(
  EMPLOYEE_SEED.map((e, i) => [e.handle, `EMP${String(i + 1).padStart(4, '0')}`]),
);

export async function seedHumanSource(prisma: PrismaClient): Promise<void> {
  // Org nodes — parent-first order guarantees the self-FK is satisfied.
  for (const n of ORG_NODES) {
    await prisma.hrOrgNode.upsert({
      where: { id: n.id },
      update: { name: n.name, type: n.type, parentId: n.parentId },
      create: { id: n.id, name: n.name, type: n.type, parentId: n.parentId },
    });
  }
  for (const c of COMPANIES) {
    await prisma.hrCompany.upsert({ where: { id: c.id }, update: c, create: c });
  }
  for (const jl of JOB_LEVELS) {
    await prisma.hrJobLevel.upsert({ where: { id: jl.id }, update: jl, create: jl });
  }
  for (const p of POSITIONS) {
    await prisma.hrPosition.upsert({ where: { id: p.id }, update: p, create: p });
  }
  for (const t of EMPLOYEE_TYPES) {
    await prisma.hrEmployeeType.upsert({ where: { id: t.id }, update: t, create: t });
  }
  await prisma.hrShift.deleteMany();
  await prisma.hrShift.createMany({ data: CANONICAL_SHIFTS });
  for (const lt of LEAVE_TYPES) {
    await prisma.hrLeaveType.upsert({ where: { id: lt.id }, update: lt as never, create: lt as never });
  }
  for (const d of DOCUMENT_APPROVAL_CONFIGS) {
    await prisma.hrDocumentApprovalConfig.upsert({ where: { docType: d.docType }, update: d, create: d });
  }

  for (let i = 0; i < EMPLOYEE_SEED.length; i++) {
    const e = EMPLOYEE_SEED[i];
    const row = {
      id: `EMP${String(i + 1).padStart(4, '0')}`,
      code: String(20001 + i),
      name: e.name,
      email: `${e.handle}@ghub.co.th`,
      phone: `08${(i % 9) + 1}-${String(200 + i).padStart(3, '0')}-${String(1000 + i * 37).slice(-4)}`,
      position: e.position,
      department: e.department,
      branch: e.branch,
      empType: e.empType,
      schedule: e.empType === 'พาร์ทไทม์' ? 'ทำงาน 08:30 – 13:00' : 'ทำงาน 08:30 – 17:30',
      startDate: e.startDate,
      salary: e.salary,
      status: e.status,
      active: e.status !== 'ลาออก' && e.status !== 'สิ้นสุดสัญญา',
      companyId: 'CO001',
      branchNodeId: BRANCH_NAME_TO_NODE_ID[e.branch] ?? 'org-ghub-hq',
      departmentNodeId: BRANCH_DEPT_TO_NODE_ID[`${e.branch}|${e.department}`] ?? 'org-ghub-wh',
      positionId: POSITION_NAME_TO_ID[e.position] ?? 'P001',
      employeeTypeId: EMPTYPE_NAME_TO_ID[e.empType] ?? 'ET001',
      supervisorId: e.supervisorHandle ? HANDLE_TO_EMPLOYEE_ID[e.supervisorHandle] : null,
    };
    await prisma.hrEmployee.upsert({ where: { id: row.id }, update: row, create: row });
  }

  // ── Announcement categories ──────────────────────────────────────────────
  const ANNCAT = [
    { id: 'AC-POLICY', nameTh: 'นโยบาย',  color: '#4f46e5', active: true },
    { id: 'AC-EVENT',  nameTh: 'กิจกรรม', color: '#0ea5e9', active: true },
  ];
  for (const ac of ANNCAT) {
    await prisma.hrAnnouncementCategory.upsert({ where: { id: ac.id }, update: ac, create: ac });
  }

  // ── Employee defaults singleton ──────────────────────────────────────────
  await prisma.hrEmployeeDefaults.upsert({
    where: { id: 'default' },
    update: {},
    create: { id: 'default', codePrefix: 'EMP', codePadding: 4, defaultEmployeeTypeId: 'ET001', defaultStatus: 'NORMAL', startDateMode: 'today' },
  });

  // ── Payroll general config singleton ────────────────────────────────────
  await prisma.hrPayrollGeneralConfig.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default', cycleStartDay: '1', cycleEndDay: 'EOM',
      ssoEmployeeRate: 5, ssoEmployerRate: 5, ssoMonthlyWageFloor: 1650, ssoMonthlyWageCap: 17500,
      ssoIncludeOT: true, ssoIncludeBonus: true, ssoIncludeWelfare: true,
      currency: 'THB', moneyRounding: 'nearest-baht', preventWrongOtType: true,
    },
  });

  // ── Payroll employment types ─────────────────────────────────────────────
  const defaultOtRates = [
    { id: 'OT1', label: 'OT1: ทำงานในวันหยุด', multiplier: 1 },
    { id: 'OT2', label: 'OT2: ล่วงเวลาในวันทำงาน *', multiplier: 1.5 },
    { id: 'OT3', label: 'OT3: ทำงานในวันหยุด (รายวัน) *', multiplier: 2 },
    { id: 'OT4', label: 'OT4: ล่วงเวลาในวันหยุด *', multiplier: 3 },
  ];
  const calcKeys = ['overtime', 'late', 'absent', 'missed-punch', 'early-leave', 'break-status'];
  function defaultCalcConditions() {
    return calcKeys.map((key) => ({
      key, enabled: true,
      otRates: key === 'overtime' ? defaultOtRates : [],
      calcOtFlat: false, restrictPublicHoliday: false,
      deductMode: 'per-working-day', deductDays: key === 'missed-punch' ? 0.5 : 0,
      calcBy: 'proportional', breakLateMode: 'none',
      breakMissedPunchAmount: 0, breakNoRecordAmount: 0, breakTaxable: true, breakCustomIncomeType: false,
    }));
  }
  const PET = [
    { id: 'PET-monthly', code: 'MONTHLY', nameTh: 'รายเดือน', nameEn: 'Monthly', payType: 'monthly', paidPublicHoliday: true, paidHourly: false, employeeTypeId: 'ET001', active: true },
    { id: 'PET-daily',   code: 'DAILY',   nameTh: 'รายวัน',   nameEn: 'Daily',   payType: 'daily',   paidPublicHoliday: true, paidHourly: false, employeeTypeId: 'ET003', active: true },
    { id: 'PET-hourly',  code: 'HOURLY',  nameTh: 'รายชั่วโมง', nameEn: 'Hourly', payType: 'hourly',  paidPublicHoliday: false, paidHourly: true, active: true },
    { id: 'PET-intern',  code: 'INTERN',  nameTh: 'ฝึกงาน',   nameEn: 'Internship', payType: 'daily', paidPublicHoliday: false, paidHourly: false, active: true },
  ];
  for (const pet of PET) {
    const data = { ...pet, calcConditions: defaultCalcConditions() as never };
    await prisma.hrPayrollEmploymentType.upsert({ where: { id: pet.id }, update: data, create: data });
  }

  // ── Account categories ───────────────────────────────────────────────────
  const ACCAT = [
    { id: 'cat-office',  nameTh: 'สำนักงาน', enabled: true },
    { id: 'cat-factory', nameTh: 'โรงงาน',   enabled: true },
  ];
  for (const ac of ACCAT) {
    await prisma.hrAccountCategory.upsert({ where: { id: ac.id }, update: ac, create: ac });
  }

  // ── Pay items ────────────────────────────────────────────────────────────
  type PI = { id: string; kind: string; code: string; nameTh: string; nameEn: string; revenueCategory?: string; rounding: string; taxCalcMethod?: string; payoutScope: string; taxable: boolean; linkSSO: boolean; linkProvidentFund: boolean; offCycle: boolean; carryPrevPeriod: boolean; payOnce?: boolean; calcByActualWorkdays?: boolean; linkOvertime?: boolean; linkLateAbsent?: boolean; isWelfare?: boolean; enabled: boolean; isSystem: boolean };
  const _i = (id: string, nameTh: string, nameEn: string, rc: string, tax: string, opts: Partial<PI>): PI => ({
    id, kind: 'income', code: id, nameTh, nameEn, revenueCategory: rc, rounding: 'none', taxCalcMethod: tax,
    payoutScope: 'every-period', taxable: false, linkSSO: false, linkProvidentFund: false, offCycle: false, carryPrevPeriod: false,
    payOnce: false, calcByActualWorkdays: false, linkOvertime: false, linkLateAbsent: false, isWelfare: false, enabled: true, isSystem: false,
    ...opts,
  });
  const _d = (id: string, nameTh: string, nameEn: string, opts: Partial<PI>): PI => ({
    id, kind: 'deduction', code: id, nameTh, nameEn, rounding: 'none',
    payoutScope: 'every-period', taxable: false, linkSSO: false, linkProvidentFund: false, offCycle: false, carryPrevPeriod: false,
    enabled: true, isSystem: false,
    ...opts,
  });
  const PAY_ITEMS: PI[] = [
    _i('I01','เงินเดือน','Salary','40(1)','annual',{taxable:true,linkSSO:true,linkProvidentFund:true,isSystem:true}),
    _i('I02','ค่าล่วงเวลา','Overtime','40(1)','per-payment',{taxable:true,linkSSO:true,linkOvertime:true,isSystem:true}),
    _i('I03','โบนัส','Bonus','40(1)','per-payment',{payOnce:true,payoutScope:'end-of-month-only',taxable:true,isSystem:true}),
    _i('I04','ค่าคอมมิชชั่น','Commission','40(2)','annual',{taxable:true,linkSSO:true}),
    _i('I05','ค่ากะ','Shift Allowance','40(1)','annual',{isWelfare:true}),
    _i('I06','เบี้ยขยัน','Diligence Bonus','40(1)','annual',{taxable:true,linkLateAbsent:true}),
    _i('I07','ค่าที่พัก','Housing Allowance','40(1)','annual',{taxable:true,linkSSO:true}),
    _i('I08','ค่าเดินทาง','Travel Allowance','40(1)','annual',{isWelfare:true}),
    _i('I09','ค่าอาหาร','Meal Allowance','40(1)','annual',{isWelfare:true}),
    _i('I10','ค่าน้ำมัน','Fuel Allowance','40(1)','annual',{taxable:true,linkSSO:true}),
    _i('I11','ค่าโทรศัพท์','Phone Allowance','40(1)','annual',{isWelfare:true}),
    _i('I12','ค่าตำแหน่ง','Position Allowance','40(1)','annual',{taxable:true,linkSSO:true,linkProvidentFund:true}),
    _i('I13','ค่าครองชีพ','Cost of Living Allowance','40(1)','annual',{taxable:true,linkSSO:true}),
    _i('I14','เบี้ยประชุม','Meeting Allowance','40(2)','annual',{taxable:true,offCycle:true}),
    _i('I15','เงินรางวัล','Prize / Award','40(1)','per-payment',{payOnce:true,payoutScope:'end-of-month-only',taxable:true,offCycle:true}),
    _i('I16','ค่าวิชาชีพ','Professional Fee','40(2)','annual',{taxable:true}),
    _i('I17','ค่ากะพิเศษ (OT)','Special Shift Overtime','40(1)','per-payment',{taxable:true,linkSSO:true,linkOvertime:true}),
    _i('I18','ค่ากะพิเศษ (วันหยุด)','Holiday Shift Allowance','40(1)','per-payment',{taxable:true,linkSSO:true}),
    _i('I19','ค่ากะพิเศษจากเวลาทำงาน','Time-based Shift Allowance','40(1)','per-payment',{taxable:true,linkSSO:true,linkOvertime:true,calcByActualWorkdays:true}),
    _i('I20','เบี้ยขยันพิเศษ','Special Diligence Allowance','40(1)','per-payment',{taxable:true,linkLateAbsent:true}),
    _i('I21','เงินสวัสดิการรักษาพยาบาล','Medical Welfare','40(1)','annual',{isWelfare:true}),
    _i('I22','ค่าควบตำแหน่ง','Acting Position Allowance','40(1)','per-payment',{payoutScope:'end-of-month-only',taxable:true,linkSSO:true}),
    _i('I23','คืนเงินวันลาคงเหลือ','Leave Balance Cashout','40(1)','per-payment',{payOnce:true,payoutScope:'end-of-month-only',taxable:true,linkSSO:true,offCycle:true}),
    _i('I24','เงินชดเชย','Severance Pay','40(1)','per-payment',{payOnce:true,payoutScope:'end-of-month-only',taxable:true,offCycle:true,isSystem:true}),
    _i('I25','ภาษีบริษัทออกให้','Tax Paid by Company (Gross-up)','40(1)','annual',{taxable:true}),
    _i('I26','EJIP บริษัทสมทบ','EJIP Company Contribution','40(1)','per-payment',{payoutScope:'end-of-month-only',isWelfare:true}),
    _d('D01','ภาษีเงินได้ หัก ณ ที่จ่าย','Withholding Tax',{payoutScope:'end-of-month-only',isSystem:true}),
    _d('D02','ประกันสังคม','Social Security (Employee 5%)',{linkSSO:true,isSystem:true}),
    _d('D03','กองทุนสำรองเลี้ยงชีพ','Provident Fund (Employee)',{linkProvidentFund:true,isSystem:true}),
    _d('D04','หักสาย/ขาด','Late & Absent Deduction',{revenueCategory:'40(1)',taxCalcMethod:'per-payment',taxable:true,linkSSO:true,isSystem:true}),
    _d('D05','หักลาไม่รับค่าจ้าง','Unpaid Leave Deduction',{revenueCategory:'40(1)',taxCalcMethod:'per-payment',taxable:true,linkSSO:true,isSystem:true}),
    _d('D06','หักไม่มาทำงาน','Absent Deduction',{revenueCategory:'40(1)',taxCalcMethod:'per-payment',payoutScope:'end-of-month-only',taxable:true,linkSSO:true,isSystem:true}),
    _d('D07','ภาษีเลิกจ้าง','Termination Withholding Tax',{payoutScope:'end-of-month-only',offCycle:true,isSystem:true}),
    _d('D08','หักพักงาน','Suspension Deduction',{}),
    _d('D09','เงินหักวันลาเกินสิทธิ์','Excess Leave Deduction',{revenueCategory:'40(1)',taxCalcMethod:'per-payment',payoutScope:'end-of-month-only',taxable:true,linkSSO:true}),
    _d('D10','หักสวัสดิการ','Welfare Deduction',{isWelfare:true}),
    _d('D11','ค่าปรับ','Penalty / Fine',{}),
    _d('D12','เบิกเงินล่วงหน้า','Salary Advance Recovery',{revenueCategory:'40(1)',taxCalcMethod:'per-payment',taxable:true,linkSSO:true}),
    _d('D13','เงินกู้ กยศ.','Student Loan (กยศ.)',{}),
    _d('D14','กรมบังคับคดี','Court-Ordered Garnishment',{payoutScope:'end-of-month-only'}),
    _d('D15','เงินหักอื่นๆ','Other Deduction',{}),
    _d('D16','ภาษีหัก 40(1) 3%','WHT 40(1) 3%',{revenueCategory:'40(1)',taxCalcMethod:'per-payment',payoutScope:'end-of-month-only'}),
    _d('D17','ภาษีหัก 40(2) อยู่ในไทย','WHT 40(2) Resident',{revenueCategory:'40(2)',taxCalcMethod:'per-payment',payoutScope:'end-of-month-only'}),
    _d('D18','ภาษี 40(5)','WHT 40(5) Rental',{revenueCategory:'40(5)',taxCalcMethod:'per-payment',payoutScope:'end-of-month-only'}),
    _d('D19','ภาษี 40(6)','WHT 40(6) Professional',{revenueCategory:'40(6)',taxCalcMethod:'per-payment',payoutScope:'end-of-month-only'}),
    _d('D20','ภาษี 40(8)','WHT 40(8) Other Income',{revenueCategory:'40(8)',taxCalcMethod:'per-payment',payoutScope:'end-of-month-only'}),
    _d('D21','ภาษีบริษัทออกให้','Tax Paid by Company (Gross-up)',{revenueCategory:'40(1)',taxCalcMethod:'annual'}),
    _d('D22','EJIP พนักงานสะสม','EJIP Employee Contribution',{payoutScope:'end-of-month-only',isWelfare:true}),
    _d('D23','EJIP ภาษีหัก ณ ที่จ่ายบริษัท','EJIP WHT (Company-paid)',{revenueCategory:'40(1)',taxCalcMethod:'annual',payoutScope:'end-of-month-only',isWelfare:true}),
    _d('D24','ตกเบิกค่าล่วงเวลา','Retroactive OT Deduction',{revenueCategory:'40(1)',taxCalcMethod:'per-payment',payoutScope:'end-of-month-only',taxable:true,linkSSO:true,carryPrevPeriod:true}),
    _d('D25','ตกเบิกขาดสาย/ขาด','Retroactive Absent & Late Deduction',{revenueCategory:'40(1)',taxCalcMethod:'per-payment',payoutScope:'end-of-month-only',taxable:true,linkSSO:true,carryPrevPeriod:true}),
    _d('D26','ตกเบิกสวัสดิการ','Retroactive Welfare Deduction',{payoutScope:'end-of-month-only',carryPrevPeriod:true}),
  ];
  for (const pi of PAY_ITEMS) {
    const data = { ...pi, accountMapping: {} as never };
    await prisma.hrPayItem.upsert({ where: { id: pi.id }, update: data, create: data });
  }

  // ── HR admin account (seed / dev only) ────────────────────────────────────
  const { hash: bcryptHash } = await import('bcryptjs');
  const adminEmail = 'admin@ghub.hr';
  const existingAdmin = await prisma.hrAccount.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    await prisma.hrAccount.create({
      data: {
        email: adminEmail,
        displayName: 'HR Admin',
        passwordHash: await bcryptHash('Admin1234!', 10),
        authSource: 'hr',
        accountStatus: 'active',
        membershipStatus: 'active',
      },
    });
  }

  const count = await prisma.hrEmployee.count();
  console.log(`[seed:humansource] org=${ORG_NODES.length} positions=${POSITIONS.length} empTypes=${EMPLOYEE_TYPES.length} employees=${count} payItems=${PAY_ITEMS.length}`);
}

// Standalone runner
if (require.main === module) {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL is required for seeding');
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  seedHumanSource(prisma)
    .catch((err) => { console.error(err); process.exitCode = 1; })
    .finally(async () => { await prisma.$disconnect(); });
}

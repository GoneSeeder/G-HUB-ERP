export type HrMenuItem = {
  title: string;
  href: string;
  description: string;
  badge?: string;
  children?: HrMenuItem[];
};

export type HrMenuGroup = {
  title: string;
  eyebrow: string;
  href: string;
  items: HrMenuItem[];
};

export const hrDashboardItems: HrMenuItem[] = [
  { title: 'Employee Demographic Dashboard', href: '/humansource/dashboard/employee-demographic', description: 'ภาพรวมข้อมูลประชากรพนักงาน' },
  { title: 'Salary Dashboard', href: '/humansource/dashboard/salary', description: 'ภาพรวมเงินเดือนและค่าตอบแทน' },
  { title: 'Employee Branch Dashboard', href: '/humansource/dashboard/employee-branch', description: 'สรุปพนักงานตามสาขา' },
  { title: 'Employee Type Dashboard', href: '/humansource/dashboard/employee-type', description: 'สรุปกลุ่มประเภทพนักงาน' },
  { title: 'Nationality Dashboard', href: '/humansource/dashboard/nationality', description: 'ภาพรวมสัญชาติพนักงาน' },
  { title: 'Document Dashboard', href: '/humansource/dashboard/document', description: 'ติดตามสถานะเอกสารบุคคล' },
  { title: 'Tax Dashboard', href: '/humansource/dashboard/tax', description: 'ภาพรวมข้อมูลภาษีพนักงาน' },
  { title: 'Social Security Dashboard', href: '/humansource/dashboard/social-security', description: 'ภาพรวมประกันสังคม' },
  { title: 'Time Attendance Type Dashboard', href: '/humansource/dashboard/time-attendance-type', description: 'รูปแบบการลงเวลาทำงาน' },
  { title: 'Attendance Condition Dashboard', href: '/humansource/dashboard/attendance-condition', description: 'เงื่อนไขการเข้างาน' },
  { title: 'Employee Movement Dashboard', href: '/humansource/dashboard/employee-movement', description: 'การเคลื่อนไหวของพนักงาน' },
];

export const employeeHistoryReportItems: HrMenuItem[] = [
  { title: 'รายงานทะเบียนพนักงาน', href: '/humansource/reports/employee-history/employee-register', description: 'รายชื่อและข้อมูลทะเบียนพนักงานทั้งหมด' },
  { title: 'รายงานพนักงานเข้าใหม่', href: '/humansource/reports/employee-history/new-employees', description: 'พนักงานที่เริ่มงานในช่วงเวลาที่เลือก' },
  { title: 'รายงานพนักงานลาออก', href: '/humansource/reports/employee-history/resigned-employees', description: 'พนักงานที่สิ้นสุดสภาพการจ้าง' },
  { title: 'รายงานพนักงานทดลองงาน', href: '/humansource/reports/employee-history/probation-employees', description: 'สถานะทดลองงานและวันครบกำหนด' },
  { title: 'รายงานเอกสารต่ออายุ', href: '/humansource/reports/employee-history/document-renewal', description: 'เอกสารที่ใกล้หมดอายุหรือรอต่ออายุ' },
  { title: 'รายงานสัญญาจ้าง', href: '/humansource/reports/employee-history/employment-contract', description: 'ข้อมูลสัญญาจ้างและวันครบกำหนด' },
  { title: 'รายงานตำแหน่งปัจจุบัน', href: '/humansource/reports/employee-history/current-position', description: 'ตำแหน่ง แผนก และสาขาปัจจุบัน' },
  { title: 'รายงานประวัติการย้ายแผนก', href: '/humansource/reports/employee-history/department-movement', description: 'ประวัติการเปลี่ยนหน่วยงาน' },
  { title: 'รายงานประวัติการปรับตำแหน่ง', href: '/humansource/reports/employee-history/position-movement', description: 'ประวัติการเลื่อนหรือเปลี่ยนตำแหน่ง' },
  { title: 'รายงานประวัติเงินเดือน', href: '/humansource/reports/employee-history/salary-history', description: 'ประวัติค่าตอบแทนรายบุคคล' },
  { title: 'รายงานข้อมูลครอบครัว', href: '/humansource/reports/employee-history/family', description: 'ข้อมูลครอบครัวและผู้ติดต่อฉุกเฉิน' },
  { title: 'รายงานข้อมูลการศึกษา', href: '/humansource/reports/employee-history/education', description: 'ประวัติการศึกษาและคุณวุฒิ' },
  { title: 'รายงานข้อมูลบัญชีธนาคาร', href: '/humansource/reports/employee-history/bank-account', description: 'ข้อมูลบัญชีสำหรับจ่ายเงินเดือน' },
  { title: 'รายงานข้อมูลติดต่อ', href: '/humansource/reports/employee-history/contact', description: 'ที่อยู่ เบอร์โทร และช่องทางติดต่อ' },
];

export const hrMenuGroups: HrMenuGroup[] = [
  {
    title: 'Dashboard',
    eyebrow: 'Insight',
    href: '/humansource/dashboard',
    items: hrDashboardItems,
  },
  {
    title: 'ข้อมูลองค์กร',
    eyebrow: 'Organization',
    href: '/humansource/organization/structure',
    items: [
      { title: 'โครงสร้างองค์กร', href: '/humansource/organization/structure', description: 'ดูและจัดวางบริษัท สาขา และแผนก' },
      { title: 'โครงสร้างตำแหน่ง', href: '/humansource/organization/position-structure', description: 'จัดลำดับตำแหน่งงานในองค์กร' },
      { title: 'ข้อมูลกลุ่มประเภทพนักงาน', href: '/humansource/organization/employee-type', description: 'กำหนดกลุ่มพนักงาน เช่น รายเดือน รายวัน พาร์ทไทม์' },
      { title: 'ข้อมูลการทำงาน', href: '/humansource/organization/work-cycle', description: 'กำหนดรอบเวลาและรูปแบบการทำงาน' },
      { title: 'ข้อมูลพนักงาน', href: '/humansource/organization/employees', description: 'ฐานข้อมูลพนักงานขององค์กร' },
      { title: 'โปรไฟล์พนักงาน', href: '/humansource/organization/employee-profile', description: 'ข้อมูลโปรไฟล์และประวัติรายบุคคล' },
      { title: 'ข้อมูลพนักงานพื้นฐาน', href: '/humansource/organization/employee-basic', description: 'ข้อมูลตั้งต้นที่ใช้ร่วมกันในงาน HR' },
      { title: 'ค้นหาผู้ติดต่อ', href: '/humansource/organization/contact-search', description: 'ค้นหาช่องทางติดต่อภายในองค์กร' },
      { title: 'ประกาศข่าวสาร', href: '/humansource/organization/announcements', description: 'ประกาศภายในสำหรับพนักงาน' },
      { title: 'นโยบายบริษัท', href: '/humansource/organization/company-policy', description: 'รวมนโยบายและแนวปฏิบัติของบริษัท' },
      { title: 'ข้อมูลทีม', href: '/humansource/organization/teams', description: 'ดูทีมและผู้รับผิดชอบของแต่ละหน่วยงาน' },
    ],
  },
  {
    title: 'ระบบติดตามผู้สมัคร',
    eyebrow: 'Recruitment',
    href: '/humansource/recruitment',
    items: [
      { title: 'ประกาศรับสมัครงาน', href: '/humansource/recruitment/job-posting', description: 'จัดการตำแหน่งที่เปิดรับสมัคร' },
      { title: 'สัมภาษณ์งาน', href: '/humansource/recruitment/interview', description: 'ติดตามรอบสัมภาษณ์และผลการคัดเลือก' },
      { title: 'รายชื่อผู้ที่สมัคร', href: '/humansource/recruitment/applicants', description: 'รายชื่อผู้สมัครทั้งหมด' },
      { title: 'สรรหาพนักงาน', href: '/humansource/recruitment/hiring', description: 'ภาพรวมกระบวนการสรรหา' },
    ],
  },
  {
    title: 'การประมวลผลเงินเดือน',
    eyebrow: 'Payroll',
    href: '/humansource/payroll',
    items: [
      { title: 'จัดการเวลา', href: '/humansource/payroll/time-management', description: 'จัดการข้อมูลเวลาสำหรับเงินเดือน' },
      { title: 'จัดการเอกสาร', href: '/humansource/payroll/documents', description: 'เอกสารที่เกี่ยวข้องกับ payroll' },
      { title: 'จัดการโควตาการลา', href: '/humansource/payroll/leave-quota', description: 'กำหนดสิทธิ์และโควตาการลา' },
      { title: 'จัดการวันหยุดพิเศษ', href: '/humansource/payroll/special-holidays', description: 'ตั้งค่าวันหยุดเฉพาะองค์กร' },
      { title: 'จัดการหนี้สินพนักงาน', href: '/humansource/payroll/employee-debt', description: 'รายการหักและภาระหนี้พนักงาน' },
      { title: 'ปรับโครงสร้างองค์กร/ตำแหน่ง', href: '/humansource/payroll/org-position-adjustment', description: 'รายการปรับโครงสร้างที่มีผลต่อค่าจ้าง' },
      { title: 'ปรับเงินเดือนพนักงาน', href: '/humansource/payroll/salary-adjustment', description: 'บันทึกการปรับค่าตอบแทน' },
      { title: 'ปรับประเภทพนักงาน', href: '/humansource/payroll/employee-type-adjustment', description: 'เปลี่ยนประเภทพนักงานตามรอบงาน' },
      { title: 'ปรับปรุงภาษีประจำปี', href: '/humansource/payroll/yearly-tax-update', description: 'ข้อมูลภาษีประจำปี' },
      { title: 'ปรับปรุงประกันสังคมประจำปี', href: '/humansource/payroll/yearly-social-security-update', description: 'ข้อมูลประกันสังคมประจำปี' },
      { title: 'การคำนวณเงินเดือน', href: '/humansource/payroll/calculation', description: 'พื้นที่เตรียมคำนวณเงินเดือน' },
      { title: 'จัดการผังค่าจ้างผล (Beta)', href: '/humansource/payroll/wage-map', description: 'โครงสร้างผังค่าจ้างแบบทดลอง', badge: 'Beta' },
      { title: 'จัดการตารางเวลาการทำงาน', href: '/humansource/payroll/work-schedule', description: 'ตารางเวลาสำหรับ payroll' },
      { title: 'Cost Allocation', href: '/humansource/payroll/cost-allocation', description: 'จัดสรรต้นทุนเงินเดือนตามหน่วยงาน' },
    ],
  },
  {
    title: 'การประเมินพนักงาน',
    eyebrow: 'Performance',
    href: '/humansource/performance',
    items: [
      { title: 'จดหมายเตือน', href: '/humansource/performance/warning-letter', description: 'เอกสารเตือนและการติดตามวินัย' },
      { title: 'ฝึกอบรม', href: '/humansource/performance/training', description: 'ประวัติและแผนการฝึกอบรม' },
      { title: 'แบบประเมิน', href: '/humansource/performance/forms', description: 'แบบฟอร์มประเมินผล' },
      { title: 'รอบการประเมิน', href: '/humansource/performance/review-cycle', description: 'กำหนดรอบประเมินประจำปี' },
      { title: 'ประเมินพนักงานทดลองงาน', href: '/humansource/performance/probation', description: 'ติดตามผลทดลองงาน' },
      { title: 'ตัวชี้วัดรายบุคคล', href: '/humansource/performance/individual-kpi', description: 'KPI รายบุคคล' },
      { title: 'KPI Profile', href: '/humansource/performance/kpi-profile', description: 'โปรไฟล์ตัวชี้วัด' },
    ],
  },
  {
    title: 'รายงาน',
    eyebrow: 'Reports',
    href: '/humansource/reports',
    items: [
      { title: 'กลุ่มประวัติพนักงาน', href: '/humansource/reports/employee-history', description: 'รายงานประวัติพนักงาน', children: employeeHistoryReportItems },
      { title: 'กลุ่มเวลาการทำงาน', href: '/humansource/reports/work-time', description: 'รายงานเวลาทำงาน' },
      { title: 'กลุ่มโควตาการลา', href: '/humansource/reports/leave-quota', description: 'รายงานสิทธิ์การลา' },
      { title: 'กลุ่มรายรับ-รายจ่าย', href: '/humansource/reports/income-expense', description: 'รายงานรายรับและรายจ่าย' },
      { title: 'กลุ่มการคำนวณเงินเดือน', href: '/humansource/reports/payroll-calculation', description: 'รายงานการคำนวณเงินเดือน' },
      { title: 'กลุ่มรายรับรายจ่ายตามผังบัญชี', href: '/humansource/reports/account-map', description: 'รายงานตามผังบัญชี' },
      { title: 'กลุ่มประกันสังคม', href: '/humansource/reports/social-security', description: 'รายงานประกันสังคม' },
      { title: 'กลุ่มภาษี', href: '/humansource/reports/tax', description: 'รายงานภาษี' },
      { title: 'กลุ่มกองทุน', href: '/humansource/reports/fund', description: 'รายงานกองทุน' },
      { title: 'กลุ่มการประเมินพนักงาน', href: '/humansource/reports/performance', description: 'รายงานผลประเมิน' },
      { title: 'อื่นๆ', href: '/humansource/reports/others', description: 'รายงานอื่น ๆ' },
      { title: 'รายงาน E-Learning', href: '/humansource/reports/e-learning', description: 'รายงานการเรียนรู้ออนไลน์' },
      { title: 'Custom Report', href: '/humansource/reports/custom', description: 'สร้างรายงานตามเงื่อนไข' },
    ],
  },
  {
    title: 'ตั้งค่า',
    eyebrow: 'Settings',
    href: '/humansource/settings',
    items: [
      { title: 'ตั้งค่าเริ่มต้น', href: '/humansource/settings/initial', description: 'ค่าเริ่มต้นของระบบ HR' },
      { title: 'ตั้งค่าผู้ใช้', href: '/humansource/settings/users', description: 'สิทธิ์และผู้ใช้งาน HR' },
      { title: 'ตั้งค่าทั่วไป', href: '/humansource/settings/general', description: 'ตั้งค่าทั่วไปของโมดูล' },
      { title: 'ตั้งค่าการคำนวณ', href: '/humansource/settings/calculation', description: 'สูตรและเงื่อนไขการคำนวณ' },
      { title: 'ตั้งค่าอื่นๆ', href: '/humansource/settings/others', description: 'ค่าเสริมอื่น ๆ' },
      { title: 'เข้าสู่ระบบใบงาน', href: '/humansource/settings/work-order', description: 'เชื่อมต่อระบบใบงาน' },
    ],
  },
];

export const allHrMenuItems = hrMenuGroups.flatMap((group) =>
  group.items.flatMap((item) => [item, ...(item.children ?? [])]),
);

export function findHrPage(pathname: string): HrMenuItem {
  const normalized = pathname === '/humansource' ? '/humansource/dashboard' : pathname;
  return (
    allHrMenuItems.find((item) => item.href === normalized) ??
    hrMenuGroups.find((group) => group.href === normalized)?.items[0] ??
    { title: 'Dashboard', href: '/humansource/dashboard', description: 'ภาพรวมข้อมูล HR และเมนู Dashboard ทั้งหมด' }
  );
}

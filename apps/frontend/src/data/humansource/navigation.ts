export type HrNavChild = {
  label: string;
  path: string;
  description: string;
  children?: HrNavChild[];
};

export type HrNavSection = {
  label: string;
  items: HrNavChild[];
};

export type HrNavigationItem = {
  key: string;
  label: string;
  description?: string;
  color: string;
  icon: 'home' | 'dashboard' | 'organization' | 'time' | 'recruitment' | 'payroll' | 'performance' | 'self-service' | 'reports' | 'settings';
  path?: string;
  sections?: HrNavSection[];
};

export type HrSettingsGroup = {
  key: 'company' | 'time' | 'payroll' | 'system';
  title: string;
  description: string;
  color: string;
  progress: string;
  items: HrNavChild[];
};

export const hrNavigation: HrNavigationItem[] = [
  {
    key: 'home',
    label: 'หน้าหลัก',
    description: 'ข่าวสาร งานที่ต้องจัดการ และข้อมูลประจำวัน',
    color: '#4f46e5',
    icon: 'home',
    path: '/humansource/home',
  },
  {
    key: 'dashboard',
    label: 'Dashboard',
    description: 'ภาพรวมประชากรพนักงานและตัวชี้วัด HR',
    color: '#6366f1',
    icon: 'dashboard',
    path: '/humansource/dashboard',
  },
  {
    key: 'organization',
    label: 'พนักงาน',
    description: 'ข้อมูลพนักงานขององค์กร',
    color: '#0ea5e9',
    icon: 'organization',
    path: '/humansource/organization/employees',
  },
  {
    key: 'payroll',
    label: 'เงินเดือน',
    description: 'อยู่ในระหว่างพัฒนา',
    color: '#10b981',
    icon: 'payroll',
    path: '/humansource/payroll',
  },
  {
    key: 'reports',
    label: 'รายงาน',
    description: 'อยู่ในระหว่างพัฒนา',
    color: '#ef4444',
    icon: 'reports',
    path: '/humansource/reports',
  },
  {
    key: 'settings',
    label: 'ตั้งค่า',
    description: 'ศูนย์รวมการตั้งค่า HR ทั้งหมด',
    color: '#64748b',
    icon: 'settings',
    path: '/humansource/settings',
  },
];

export const hrSettingsGroups: HrSettingsGroup[] = [
  {
    key: 'company',
    title: 'ตั้งค่าบริษัท',
    description: 'Multi-company ข้อมูลนิติบุคคล สาขา โครงสร้างองค์กร ตำแหน่ง มาสเตอร์ และเอกสารองค์กร',
    color: '#f97316',
    progress: '2 / 8 พร้อมใช้งาน',
    items: [
      {
        label: 'ตั้งค่าระดับองค์กร',
        path: '/humansource/settings/company/general',
        description: 'ค่าเริ่มต้นของระบบ HR ต่อบริษัท',
        children: [
          { label: 'ค่าเริ่มต้นพนักงาน', path: '/humansource/settings/company/employee-defaults', description: 'รหัสพนักงาน วันที่เริ่มงาน และค่าเริ่มต้น' },
          { label: 'รหัสเอกสารและ Running No.', path: '/humansource/settings/company/running-number', description: 'รูปแบบเลขเอกสารและเลขอ้างอิง' },
          { label: 'นโยบายข้อมูลบริษัท', path: '/humansource/settings/company/policies', description: 'ขอบเขตข้อมูลที่ใช้ร่วมกันในบริษัท' },
        ],
      },
      {
        label: 'ข้อมูลบริษัท',
        path: '/humansource/organization/companies',
        description: 'นิติบุคคล เลขภาษี นายจ้าง และข้อมูลทางกฎหมาย',
        children: [
          { label: 'นิติบุคคลและนายจ้าง', path: '/humansource/organization/legal-entities', description: 'บริษัทในเครือและนายจ้างตามกฎหมาย' },
          { label: 'เลขผู้เสียภาษีและประกันสังคม', path: '/humansource/organization/tax-social-accounts', description: 'รหัสสำหรับเอกสารนำส่ง' },
          { label: 'ผู้มีอำนาจลงนาม', path: '/humansource/organization/authorized-signers', description: 'ผู้ลงนามเอกสารสำคัญ' },
        ],
      },
      {
        label: 'โครงสร้างองค์กร',
        path: '/humansource/organization/structure',
        description: 'สายงาน ฝ่าย แผนก Cost center และสายบังคับบัญชา',
        children: [
          { label: 'บริษัทและสาขาในโครงสร้าง', path: '/humansource/organization/structure-companies', description: 'ผูกโครงสร้างกับบริษัทและสาขา' },
          { label: 'ฝ่าย แผนก และทีม', path: '/humansource/organization/departments', description: 'หน่วยงานตามสายงานจริง' },
          { label: 'Cost center', path: '/humansource/organization/cost-centers', description: 'ศูนย์ต้นทุนสำหรับ Payroll และบัญชี' },
          { label: 'สายบังคับบัญชา', path: '/humansource/organization/reporting-lines', description: 'หัวหน้าและลำดับการอนุมัติ' },
        ],
      },
      {
        label: 'ตำแหน่ง',
        path: '/humansource/organization/position-structure',
        description: 'ตำแหน่ง ระดับงาน Job level และสายอาชีพ',
        children: [
          { label: 'ตำแหน่งงาน', path: '/humansource/organization/positions', description: 'ชื่อตำแหน่งและรหัสตำแหน่ง' },
          { label: 'ระดับงาน', path: '/humansource/organization/job-levels', description: 'Level, Grade และช่วงเงินเดือน' },
          { label: 'สายอาชีพ', path: '/humansource/organization/career-paths', description: 'Career track และการเติบโต' },
        ],
      },
      {
        label: 'มาสเตอร์',
        path: '/humansource/settings/master-data',
        description: 'ข้อมูลกลางที่ใช้ซ้ำในฟอร์มพนักงาน',
        children: [
          { label: 'คำนำหน้า', path: '/humansource/settings/master-title', description: 'นาย นาง นางสาว และคำนำหน้าอื่น' },
          { label: 'สัญชาติ ศาสนา และสถานภาพ', path: '/humansource/settings/master-personal', description: 'ตัวเลือกข้อมูลส่วนบุคคล' },
          { label: 'วุฒิการศึกษา', path: '/humansource/settings/master-education', description: 'ระดับและสาขาการศึกษา' },
          { label: 'ประเภทพนักงาน', path: '/humansource/organization/employee-type', description: 'รายเดือน รายวัน สัญญาจ้าง และ Part-time' },
        ],
      },
      {
        label: 'เวิร์กโฟลว์',
        path: '/humansource/settings/org-workflows',
        description: 'เงื่อนไขผู้อนุมัติตามบริษัทและหน่วยงาน',
        children: [
          { label: 'ผู้อนุมัติตามหน่วยงาน', path: '/humansource/settings/org-approvers', description: 'หัวหน้า HR และผู้อนุมัติสำรอง' },
          { label: 'ตัวแทนอนุมัติ', path: '/humansource/settings/delegation', description: 'มอบหมายงานช่วงลาและรักษาการ' },
        ],
      },
      {
        label: 'เทมเพลตเอกสาร',
        path: '/humansource/settings/document-templates',
        description: 'สัญญาจ้าง หนังสือรับรอง และแบบฟอร์มองค์กร',
        children: [
          { label: 'สัญญาจ้าง', path: '/humansource/settings/contract-template', description: 'Template สัญญาตามประเภทการจ้าง' },
          { label: 'หนังสือรับรอง', path: '/humansource/settings/certificate-template', description: 'แบบฟอร์มหนังสือรับรองเงินเดือนและงาน' },
        ],
      },
      {
        label: 'ประกาศ',
        path: '/humansource/settings/announcements',
        description: 'ข่าวสาร นโยบาย และประกาศที่แสดงหน้า Home',
        children: [
          { label: 'หมวดประกาศ', path: '/humansource/settings/announcement-categories', description: 'จัดกลุ่มข่าวสารและประกาศ' },
          { label: 'กลุ่มผู้รับประกาศ', path: '/humansource/settings/announcement-audience', description: 'กำหนดบริษัท หน่วยงาน หรือพนักงานที่เห็น' },
        ],
      },
    ],
  },
  {
    key: 'time',
    title: 'ตั้งค่าเวลาการทำงาน',
    description: 'รูปแบบเวลาทำงาน กะ วิธีลงเวลา และนโยบายการลา',
    color: '#2563eb',
    progress: '4 / 4 พร้อมใช้งาน',
    items: [
      {
        label: 'การตั้งค่าทั่วไป',
        path: '/humansource/time/general',
        description: 'กะ/วันหยุดพื้นฐาน ป้องกันสแกนซ้ำ และนโยบายเมื่อสแกนไม่ครบ',
      },
      {
        label: 'ตั้งค่ากะ',
        path: '/humansource/time/work-schedules',
        description: 'กะทำงาน เวลาพัก รอบตัดเวลา และเทมเพลตกะพนักงาน',
      },
      {
        label: 'สถานที่และวิธีลงเวลา',
        path: '/humansource/time/attendance-locations',
        description: 'ลงทะเบียนสถานที่และวิธีลงเวลาเข้าทำงาน แยกตามประเภทอุปกรณ์ในขั้นตอนสร้าง',
      },
      {
        label: 'ปฏิทินวันหยุด',
        path: '/humansource/time/holiday-calendar',
        description: 'ปฏิทินวันหยุดประจำปี วันหยุดบริษัท และวันหยุดเฉพาะสาขา',
      },
      {
        label: 'ตั้งค่าการลา',
        path: '/humansource/time/leave-types',
        description: 'ประเภทการลา นโยบายสิทธิ์ โควตา และการอนุมัติ',
      },
    ],
  },
  {
    key: 'payroll',
    title: 'ตั้งค่าเงินเดือนและสวัสดิการ',
    description: 'งวดเงินเดือน โครงสร้างค่าจ้าง รายได้ รายหัก สวัสดิการ ภาษี และประกันสังคม',
    color: '#059669',
    progress: '1 / 10 พร้อมใช้งาน',
    items: [
      { label: 'กลุ่มและงวดเงินเดือน', path: '/humansource/payroll/payroll-groups', description: 'รอบจ่าย Cut-off และวันที่จ่าย' },
      { label: 'โครงสร้างเงินเดือน', path: '/humansource/payroll/salary-structure', description: 'ฐานเงินเดือน กระบอกเงินเดือน และค่าจ้าง' },
      {
        label: 'รายได้และรายการหัก',
        path: '/humansource/payroll/pay-items',
        description: 'เงินได้ประจำ ไม่ประจำ และรายการหัก',
        children: [
          { label: 'รายได้ประจำ', path: '/humansource/payroll/recurring-income', description: 'เงินเดือน ค่าตำแหน่ง และค่าครองชีพ' },
          { label: 'รายได้ไม่ประจำ', path: '/humansource/payroll/variable-income', description: 'โบนัส ค่าคอมมิชชั่น และเบี้ยเลี้ยง' },
          { label: 'รายการหัก', path: '/humansource/payroll/deductions', description: 'หักเงินกู้ หักสาย ขาด และรายการอื่น' },
        ],
      },
      { label: 'สวัสดิการและกองทุน', path: '/humansource/payroll/benefits-funds', description: 'สวัสดิการ กองทุนสำรองเลี้ยงชีพ และ กยศ.' },
      { label: 'ภาษีเงินได้', path: '/humansource/payroll/tax', description: 'ภ.ง.ด.1 ภ.ง.ด.1ก และหนังสือรับรอง 50 ทวิ' },
      { label: 'ประกันสังคมและเงินทดแทน', path: '/humansource/payroll/social-security', description: 'ผู้ประกันตน เงินสมทบ และกองทุนเงินทดแทน' },
      { label: 'ธนาคารและไฟล์จ่ายเงิน', path: '/humansource/payroll/bank-payment-files', description: 'บัญชีบริษัท รูปแบบไฟล์ธนาคาร และรหัสจ่าย' },
      { label: 'สลิปเงินเดือน', path: '/humansource/payroll/payslip-template', description: 'รูปแบบสลิป เงื่อนไขการเผยแพร่ และภาษา' },
      { label: 'บัญชีและ Cost allocation', path: '/humansource/payroll/accounting-mapping', description: 'ผังบัญชี Cost center และไฟล์ส่งบัญชี' },
      { label: 'ปิดงวดและอนุมัติเงินเดือน', path: '/humansource/payroll/closing-approval', description: 'ขั้นตอนตรวจสอบ ปิดงวด และปล่อยจ่าย' },
    ],
  },
  {
    key: 'system',
    title: 'ตั้งค่าระบบและสิทธิ์',
    description: 'ผู้ใช้ สิทธิ์อนุมัติ แบบฟอร์ม การแจ้งเตือน การเชื่อมต่อ ความปลอดภัย และ PDPA',
    color: '#7c3aed',
    progress: '2 / 11 พร้อมใช้งาน',
    items: [
      {
        label: 'ผู้ใช้ บทบาท และสิทธิ์',
        path: '/humansource/settings/users',
        description: 'Role, permission และขอบเขตข้อมูล',
        children: [
          { label: 'ผู้ใช้งานระบบ', path: '/humansource/settings/system-users', description: 'บัญชีผู้ใช้และสถานะการเข้าใช้งาน' },
          { label: 'บทบาทและ Permission', path: '/humansource/settings/roles-permissions', description: 'สิทธิ์ตามหน้าจอและ action' },
          { label: 'ขอบเขตข้อมูล', path: '/humansource/settings/data-scope', description: 'จำกัดบริษัท สาขา หน่วยงาน และทีม' },
        ],
      },
      { label: 'ลำดับการอนุมัติ', path: '/humansource/settings/approval-workflows', description: 'Workflow ตามบริษัท หน่วยงาน และวงเงิน' },
      { label: 'ฟอร์มและเอกสาร', path: '/humansource/settings/forms-documents', description: 'Template เลขที่เอกสาร และลายเซ็น' },
      { label: 'การแจ้งเตือน', path: '/humansource/settings/notifications', description: 'อีเมล แอป และเหตุการณ์แจ้งเตือน' },
      { label: 'การเชื่อมต่อระบบ', path: '/humansource/settings/integrations', description: 'เครื่องลงเวลา ธนาคาร บัญชี และ API' },
      { label: 'ความปลอดภัยและ PDPA', path: '/humansource/settings/security-privacy', description: 'Consent, retention และ access log' },
      { label: 'Audit Log', path: '/humansource/settings/audit-log', description: 'ประวัติการแก้ไขรายการสำคัญ' },
      { label: 'นำเข้าข้อมูลเริ่มต้น', path: '/humansource/settings/data-import', description: 'นำเข้าบริษัท โครงสร้าง และพนักงาน' },
      { label: 'Automation และ Webhook', path: '/humansource/settings/automation', description: 'Trigger งานอัตโนมัติและเชื่อมต่อระบบนอก' },
      { label: 'Mobile และ Self-service', path: '/humansource/settings/self-service', description: 'สิทธิ์พนักงาน หน้าโปรไฟล์ และการตั้งรหัสผ่าน' },
      { label: 'แผนใช้งานและแพ็กเกจ', path: '/humansource/settings/subscription', description: 'Module ที่เปิดใช้งานและข้อจำกัดระบบ' },
    ],
  },
];

const flattenHrNavChildren = (items: HrNavChild[]): HrNavChild[] =>
  items.flatMap((item) => [item, ...(item.children ? flattenHrNavChildren(item.children) : [])]);

export const allHrNavigationItems = [
  ...hrNavigation.flatMap((item) => [
    ...(item.path
      ? [{
          label: item.label,
          path: item.path,
          description: item.description ?? item.label,
        }]
      : []),
    ...(item.sections?.flatMap((section) => section.items) ?? []),
  ]),
  ...hrSettingsGroups.flatMap((group) => flattenHrNavChildren(group.items)),
  {
    label: 'โปรไฟล์',
    path: '/humansource/self-service/profile',
    description: 'ข้อมูลส่วนตัว เอกสาร และข้อมูลการจ้างงานของฉัน',
  },
  {
    label: 'เปลี่ยนรหัสผ่าน',
    path: '/humansource/self-service/change-password',
    description: 'จัดการรหัสผ่านสำหรับเข้าใช้งาน G-HUB',
  },
];


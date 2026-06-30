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
  icon: 'home' | 'dashboard' | 'organization' | 'time' | 'recruitment' | 'payroll' | 'performance' | 'self-service' | 'reports' | 'settings' | 'documents';
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
    key: 'documents',
    label: 'เอกสาร',
    description: 'จัดการเอกสารและแบบฟอร์ม HR',
    color: '#f97316',
    icon: 'documents',
    path: '/humansource/documents',
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
    description: 'Multi-company การตั้งค่าพื้นฐาน ข้อมูลบริษัท โครงสร้างองค์กร ตำแหน่ง และประกาศ',
    color: '#f97316',
    progress: '2 / 4 พร้อมใช้งาน',
    items: [
      {
        label: 'มาสเตอร์',
        path: '/humansource/settings/company/general',
        description: 'ข้อมูลมาสเตอร์พื้นฐานของระบบ HR',
        children: [
          { label: 'การตั้งค่าพื้นฐาน', path: '/humansource/settings/company/general/basic', description: 'กำหนดรหัสพนักงานและค่าเริ่มต้น' },
          { label: 'ประเภทพนักงาน', path: '/humansource/organization/employee-type', description: 'รายเดือน รายวัน สัญญาจ้าง และ Part-time (ใช้กับ payroll และโควตาลา)' },
        ],
      },
      {
        label: 'องค์กร',
        path: '/humansource/organization/structure',
        description: 'ผังองค์กร บริษัท สาขา ฝ่าย แผนก ทีม และข้อมูลนิติบุคคล',
      },
      {
        label: 'ตำแหน่ง',
        path: '/humansource/organization/positions',
        description: 'ตำแหน่งงานและระดับงาน (Level/Grade)',
        children: [
          { label: 'ตำแหน่งงาน', path: '/humansource/organization/positions', description: 'ชื่อตำแหน่งและรหัสตำแหน่ง' },
          { label: 'ระดับตำแหน่ง', path: '/humansource/organization/job-levels', description: 'Level, Grade และช่วงเงินเดือน' },
        ],
      },
      {
        label: 'ประกาศ',
        path: '/humansource/settings/announcements',
        description: 'ข่าวสาร นโยบาย และประกาศที่แสดงหน้า Home',
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
    title: 'ตั้งค่าเงินเดือนและสวัสดิการ (Payroll)',
    description: 'ตั้งค่า master data ที่ใช้สร้างและคำนวณเงินเดือนจริง แยกข้อมูลตามบริษัทผ่านตัวกรองบริษัท',
    color: '#059669',
    progress: '1 / 4 ตั้งค่า',
    items: [
      {
        label: 'การตั้งค่าทั่วไป',
        path: '/humansource/payroll/general',
        description: 'การตั้งค่าพื้นฐานของระบบเงินเดือน',
      },
      {
        label: 'ประเภทการจ้างงาน',
        path: '/humansource/payroll/employment-types',
        description: 'รายเดือน รายวัน รายชั่วโมง Part-time สัญญาจ้าง และฐานคำนวณค่าจ้าง',
      },
      {
        label: 'งวดเงินเดือน',
        path: '/humansource/payroll/pay-periods',
        description: 'สร้างตารางงวดรายปี เลือกจ่าย 12/24/52 ครั้ง หรือกำหนดเอง',
      },
      {
        label: 'รายได้ / รายหัก',
        path: '/humansource/payroll/income-items',
        description: 'ตั้งรายการเงินได้ รายการหัก ภาษี ประกันสังคม และผังบัญชีที่ใช้ในสลิป',
        children: [
          { label: 'รายได้', path: '/humansource/payroll/income-items', description: 'เงินเดือน ค่าแรง OT โบนัส ค่าคอมฯ และเงินเพิ่มอื่นๆ' },
          { label: 'รายหัก', path: '/humansource/payroll/deduction-items', description: 'ภาษี ประกันสังคม กองทุน เงินกู้ สาย ขาด และหักอื่นๆ' },
          { label: 'ข้อมูลบัญชี', path: '/humansource/payroll/accounting-items', description: 'ผูกบัญชีเดบิต/เครดิตของรายได้และรายหัก' },
        ],
      },
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

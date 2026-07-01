export type HrDocStatus = 'pending' | 'approved' | 'rejected' | 'draft';

export type HrDocCategoryKey =
  | 'pending-edit'
  | 'leave'
  | 'offsite'
  | 'time-swap'
  | 'time-certify'
  | 'ot'
  | 'time-bank'
  | 'doc-request'
  | 'shift-change'
  | 'warning-letter';

export type HrDocRow = {
  id: string;
  docNo: string;
  category: HrDocCategoryKey;
  title: string;
  detail: string;
  requesterName: string;
  requesterAvatar: string;
  submittedDate: string; // DD/MM/YYYY
  periodLabel: string;
  approverName: string;
  status: HrDocStatus;
};

export const HR_DOC_CATEGORIES: { key: HrDocCategoryKey; label: string }[] = [
  { key: 'pending-edit', label: 'รอแก้ไข' },
  { key: 'leave', label: 'ลางาน' },
  { key: 'offsite', label: 'ปฏิบัติงานนอกสถานที่' },
  { key: 'time-swap', label: 'แลกเวลา' },
  { key: 'time-certify', label: 'รับรองเวลา' },
  { key: 'ot', label: 'ขอทำงานล่วงเวลา' },
  { key: 'time-bank', label: 'ขอสะสมเวลา' },
  { key: 'doc-request', label: 'ขอเอกสาร' },
  { key: 'shift-change', label: 'เปลี่ยนกะ' },
  { key: 'warning-letter', label: 'หนังสือเตือน' },
];

export const HR_DOC_STATUS_LABEL: Record<HrDocStatus, string> = {
  pending: 'รออนุมัติ',
  approved: 'อนุมัติแล้ว',
  rejected: 'ไม่อนุมัติ',
  draft: 'ฉบับร่าง',
};

export const HR_DOCS_MOCK: HrDocRow[] = [
  {
    id: 'doc-001',
    docNo: 'LV-202607-0012',
    category: 'leave',
    title: 'ใบลาป่วย',
    detail: 'มีไข้ ตรวจที่คลินิกใกล้บ้าน',
    requesterName: 'กาญจนา ศรีสุข',
    requesterAvatar: 'ก',
    submittedDate: '28/06/2026',
    periodLabel: '30/06/2026 (1 วัน)',
    approverName: 'สมชาย ใจดี',
    status: 'pending',
  },
  {
    id: 'doc-002',
    docNo: 'LV-202607-0013',
    category: 'leave',
    title: 'ใบลาพักร้อน',
    detail: 'พาครอบครัวไปเที่ยวเชียงราย',
    requesterName: 'วิไล จันทร์เพ็ญ',
    requesterAvatar: 'ว',
    submittedDate: '25/06/2026',
    periodLabel: '10 - 12/07/2026 (3 วัน)',
    approverName: 'สมชาย ใจดี',
    status: 'approved',
  },
  {
    id: 'doc-003',
    docNo: 'LV-202606-0088',
    category: 'leave',
    title: 'ใบลากิจ',
    detail: 'ติดต่อราชการที่สำนักงานเขต',
    requesterName: 'ธนกร รัตนชัย',
    requesterAvatar: 'ธ',
    submittedDate: '18/06/2026',
    periodLabel: '20/06/2026 (0.5 วัน)',
    approverName: 'ประเสริฐ วงศ์ไพศาล',
    status: 'rejected',
  },
  {
    id: 'doc-004',
    docNo: 'OS-202607-0004',
    category: 'offsite',
    title: 'ออกพบลูกค้า',
    detail: 'นำเสนอสินค้าให้ลูกค้าสาขาเชียงใหม่',
    requesterName: 'ศักดิ์ชัย ยิ้มแย้ม',
    requesterAvatar: 'ศ',
    submittedDate: '29/06/2026',
    periodLabel: '02/07/2026 (08:30-17:30)',
    approverName: 'วิไล จันทร์เพ็ญ',
    status: 'pending',
  },
  {
    id: 'doc-005',
    docNo: 'OS-202606-0091',
    category: 'offsite',
    title: 'อบรมนอกสถานที่',
    detail: 'อบรมหลักสูตรผู้จัดการฝ่ายขายที่โรงแรมโนโวเทล',
    requesterName: 'นภา สวยงาม',
    requesterAvatar: 'น',
    submittedDate: '15/06/2026',
    periodLabel: '22 - 23/06/2026',
    approverName: 'วิไล จันทร์เพ็ญ',
    status: 'approved',
  },
  {
    id: 'doc-006',
    docNo: 'TS-202607-0002',
    category: 'time-swap',
    title: 'แลกเวลาทำงาน',
    detail: 'ขอแลกกะกับ พิมพ์ใจ งามตา ในวันหยุดสุดสัปดาห์',
    requesterName: 'พิมพ์ใจ งามตา',
    requesterAvatar: 'พ',
    submittedDate: '27/06/2026',
    periodLabel: '05/07/2026 ↔ 06/07/2026',
    approverName: 'กาญจนา ศรีสุข',
    status: 'pending',
  },
  {
    id: 'doc-007',
    docNo: 'TC-202606-0045',
    category: 'time-certify',
    title: 'รับรองเวลาทำงาน (ลืมสแกนนิ้ว)',
    detail: 'ลืมสแกนนิ้วเข้างานตอนเช้า ระบบไม่บันทึกเวลา',
    requesterName: 'อนุชา เทพประสิทธิ์',
    requesterAvatar: 'อ',
    submittedDate: '24/06/2026',
    periodLabel: '24/06/2026 (เข้างาน 08:32)',
    approverName: 'วิไล จันทร์เพ็ญ',
    status: 'approved',
  },
  {
    id: 'doc-008',
    docNo: 'OT-202607-0019',
    category: 'ot',
    title: 'ขอทำงานล่วงเวลา',
    detail: 'ปิดยอดบัญชีประจำเดือน',
    requesterName: 'ธนกร รัตนชัย',
    requesterAvatar: 'ธ',
    submittedDate: '29/06/2026',
    periodLabel: '01/07/2026 (17:30 - 20:00)',
    approverName: 'ประเสริฐ วงศ์ไพศาล',
    status: 'pending',
  },
  {
    id: 'doc-009',
    docNo: 'OT-202606-0102',
    category: 'ot',
    title: 'ขอทำงานล่วงเวลา',
    detail: 'เตรียมสต็อกสินค้ารับโปรโมชันสิ้นเดือน',
    requesterName: 'ประเสริฐ วงศ์ไพศาล',
    requesterAvatar: 'ป',
    submittedDate: '20/06/2026',
    periodLabel: '21/06/2026 (18:00 - 21:00)',
    approverName: 'สมชาย ใจดี',
    status: 'approved',
  },
  {
    id: 'doc-010',
    docNo: 'TB-202606-0011',
    category: 'time-bank',
    title: 'ขอสะสมเวลาทำงาน',
    detail: 'สะสมชั่วโมง OT เป็นวันลาเพิ่มเติม',
    requesterName: 'กาญจนา ศรีสุข',
    requesterAvatar: 'ก',
    submittedDate: '10/06/2026',
    periodLabel: 'สะสม 8 ชม.',
    approverName: 'สมชาย ใจดี',
    status: 'approved',
  },
  {
    id: 'doc-011',
    docNo: 'DR-202607-0007',
    category: 'doc-request',
    title: 'ขอหนังสือรับรองเงินเดือน',
    detail: 'ใช้ยื่นขอสินเชื่อธนาคาร',
    requesterName: 'พิมพ์ใจ งามตา',
    requesterAvatar: 'พ',
    submittedDate: '30/06/2026',
    periodLabel: 'ฉบับภาษาไทย 1 ฉบับ',
    approverName: 'ฝ่ายบุคคล',
    status: 'pending',
  },
  {
    id: 'doc-012',
    docNo: 'DR-202606-0055',
    category: 'doc-request',
    title: 'ขอหนังสือรับรองการทำงาน',
    detail: 'ใช้ยื่นสถานทูตประกอบวีซ่า',
    requesterName: 'อนุชา เทพประสิทธิ์',
    requesterAvatar: 'อ',
    submittedDate: '12/06/2026',
    periodLabel: 'ฉบับภาษาอังกฤษ 1 ฉบับ',
    approverName: 'ฝ่ายบุคคล',
    status: 'approved',
  },
  {
    id: 'doc-013',
    docNo: 'SC-202607-0003',
    category: 'shift-change',
    title: 'ขอเปลี่ยนกะทำงาน',
    detail: 'ขอเปลี่ยนจากกะเช้าเป็นกะบ่ายถาวร เนื่องจากปัญหาการเดินทาง',
    requesterName: 'นภา สวยงาม',
    requesterAvatar: 'น',
    submittedDate: '26/06/2026',
    periodLabel: 'เริ่มมีผล 01/08/2026',
    approverName: 'วิไล จันทร์เพ็ญ',
    status: 'pending',
  },
  {
    id: 'doc-014',
    docNo: 'WL-202605-0002',
    category: 'warning-letter',
    title: 'หนังสือเตือน - มาสาย',
    detail: 'มาสายเกินกำหนดตามระเบียบบริษัท 3 ครั้งในเดือน',
    requesterName: 'ฝ่ายบุคคล',
    requesterAvatar: 'HR',
    submittedDate: '30/05/2026',
    periodLabel: 'ครั้งที่ 1',
    approverName: 'กาญจนา ศรีสุข',
    status: 'approved',
  },
  {
    id: 'doc-015',
    docNo: 'LV-202606-0071',
    category: 'pending-edit',
    title: 'ใบลาป่วย (รอแก้ไขเอกสารแนบ)',
    detail: 'กรุณาแนบใบรับรองแพทย์ฉบับเต็มเพิ่มเติม',
    requesterName: 'ศักดิ์ชัย ยิ้มแย้ม',
    requesterAvatar: 'ศ',
    submittedDate: '17/06/2026',
    periodLabel: '18/06/2026 (1 วัน)',
    approverName: 'วิไล จันทร์เพ็ญ',
    status: 'draft',
  },
  {
    id: 'doc-016',
    docNo: 'OT-202606-0087',
    category: 'pending-edit',
    title: 'ขอทำงานล่วงเวลา (รอระบุเวลาสิ้นสุด)',
    detail: 'กรอกเวลาสิ้นสุดการทำงานล่วงเวลาไม่ครบถ้วน',
    requesterName: 'ธนกร รัตนชัย',
    requesterAvatar: 'ธ',
    submittedDate: '14/06/2026',
    periodLabel: '15/06/2026 (18:00 - ?)',
    approverName: 'ประเสริฐ วงศ์ไพศาล',
    status: 'draft',
  },
];

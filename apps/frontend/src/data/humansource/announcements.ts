export type AnnouncementStatus = 'draft' | 'published' | 'archived';

export const STATUS_LABELS: Record<AnnouncementStatus, string> = {
  draft: 'ร่าง',
  published: 'เผยแพร่',
  archived: 'เก็บ',
};

export type AnnouncementCategory = {
  id: string;
  nameTh: string;
  color: string;
  active: boolean;
};

export type AnnouncementAudience = {
  scope: 'all' | 'custom';
  companyIds: string[];
  orgNodeIds: string[];
  employeeTypeIds: string[];
  employeeIds: string[];
};

export type AttachmentFile = {
  name: string;
  dataUrl: string; // base64 data URL for images; '' for other types
};

export type Announcement = {
  id: string;
  title: string;
  bodyMd: string;
  imageBase64: string;       // cover image stored as data URL ('' = none)
  attachments: AttachmentFile[];
  categoryId: string;
  audience: AnnouncementAudience;
  status: AnnouncementStatus;
  publishAt: string | null;   // ISO datetime "yyyy-MM-ddTHH:mm" or null
  publishEnd: string | null;  // ISO datetime or null
  pinned: boolean;
};

export const ANNOUNCEMENT_CATEGORIES_STORAGE_KEY = 'g-hub.hr.announcement-categories';
export const ANNOUNCEMENTS_STORAGE_KEY = 'g-hub.hr.announcements';

export const ANNOUNCEMENT_CATEGORY_SEED: AnnouncementCategory[] = [
  { id: 'AC-POLICY', nameTh: 'นโยบาย',  color: '#4f46e5', active: true },
  { id: 'AC-EVENT',  nameTh: 'กิจกรรม', color: '#0ea5e9', active: true },
];

const _aud: AnnouncementAudience = {
  scope: 'all',
  companyIds: [],
  orgNodeIds: [],
  employeeTypeIds: [],
  employeeIds: [],
};

export const ANNOUNCEMENT_SEED: Announcement[] = [
  {
    id: 'A001',
    title: 'นโยบายวันหยุดประจำปี 2569',
    bodyMd: 'บริษัทกำหนดวันหยุดประจำปี 2569 ตามประกาศนี้ กรุณาศึกษารายละเอียดวันหยุดและแผนการทำงานล่วงหน้า',
    imageBase64: '',
    attachments: [],
    categoryId: 'AC-POLICY',
    audience: _aud,
    status: 'published',
    publishAt: '2026-01-05T08:00', publishEnd: null,
    pinned: true,
  },
  {
    id: 'A002',
    title: 'กิจกรรมพนักงานสัมพันธ์ไตรมาส 2',
    bodyMd: 'พบกับกิจกรรม Team Building ไตรมาส 2 รายละเอียดสถานที่และเวลาจะแจ้งให้ทราบเร็วๆ นี้',
    imageBase64: '',
    attachments: [],
    categoryId: 'AC-EVENT',
    audience: _aud,
    status: 'published',
    publishAt: '2026-04-01T08:00', publishEnd: null,
    pinned: false,
  },
  {
    id: 'A003',
    title: 'อัปเดตระเบียบการลา',
    bodyMd: '',
    imageBase64: '',
    attachments: [],
    categoryId: 'AC-POLICY',
    audience: _aud,
    status: 'draft',
    publishAt: null, publishEnd: null,
    pinned: false,
  },
  {
    id: 'A004',
    title: 'ประชุมประจำเดือน',
    bodyMd: '',
    imageBase64: '',
    attachments: [],
    categoryId: 'AC-EVENT',
    audience: _aud,
    status: 'draft',
    publishAt: null, publishEnd: null,
    pinned: false,
  },
];

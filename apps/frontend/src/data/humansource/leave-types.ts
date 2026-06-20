// Leave type definitions for the HR settings module.
// Group A (statutory) follows Thai Labour Protection Act defaults.
// Group B (welfare) is fully custom and configured by HR per company.

export type LeavePayType = 'paid' | 'unpaid' | 'partial';
export type LeaveQuotaMode = 'fixed' | 'tenure-tier' | 'unlimited' | 'medical';
export type LeaveUnit = 'day' | 'hour';
export type LeaveCountBasis = 'working-day' | 'calendar-day';
export type LeaveRounding = 'none' | 'half' | 'full-day' | 'full-hour';
export type LeaveGender = 'all' | 'male' | 'female';
export type LeaveCutoffBasis = 'hire-date' | 'fiscal-year';

export type TenureTier = {
  minMonths: number;          // อายุงานขั้นต่ำ (เดือน)
  maxMonths: number | null;   // null = ไม่จำกัด
  days: number;               // จำนวนวันที่ได้
};

export type LeaveRules = {
  payType: LeavePayType;
  partialPaidDays?: number;   // ใช้เมื่อ payType === 'partial' (เช่นคลอด 45)
  countBasis: LeaveCountBasis;
  countHolidayAsLeave: boolean;
  minMinutes: number;
  allowHalfDay: boolean;
  advanceDays: number;
  backdateDays: number;
  maxConsecutiveDays: number | null;  // null = ไม่จำกัด
  requireAttachment: boolean;
  requireAttachmentOverDays: number | null; // แนบบังคับเมื่อ >= N วัน
  rounding: LeaveRounding;
  carryOver: boolean;
  carryOverCap: number | null;
  carryOverExpiryMonths: number | null;
};

export type LeaveEligibility = {
  gender: LeaveGender;
  requirePassProbation: boolean;
  minTenureMonths: number;
  positionIds: string[];  // [] = ทุกตำแหน่ง → Position.id
  orgNodeIds: string[];   // [] = ทุกหน่วยงาน → OrgNode.id (branch/dept/team selected whole)
  employeeIds: string[];  // [] = ไม่ระบุรายคน → Employee.id
};

export type LeaveQuotaByEmployeeType = {
  mode: LeaveQuotaMode;
  fixedDays?: number;
  tiers?: TenureTier[];
};

export type LeaveQuota = {
  mode: LeaveQuotaMode;
  fixedDays?: number;
  tiers?: TenureTier[];
  // Optional override per employee type id (ET001 = monthly, ET003 = daily, ...).
  perEmployeeType?: Record<string, LeaveQuotaByEmployeeType>;
  prorateFirstYear: boolean;
  cutoffBasis: LeaveCutoffBasis;
};

export type LeaveApproval = {
  useDefaultTemplate: boolean;       // true = ใช้สาย "เอกสารลางาน" จากโมดูลอนุมัติ
  templateDocType: string | null;    // override ให้ไปอ้างอิง doc type อื่น (ปกติ null)
  steps?: number | 'hr';             // override จำนวนขั้นเฉพาะการลานี้ (optional)
};

export type LeaveType = {
  id: string;
  code: string;
  nameTh: string;
  nameEn: string;
  tag: string;
  color: string;       // hex
  unit: LeaveUnit;
  statutory: boolean;  // กลุ่ม A ตามกฎหมาย = true
  enabled: boolean;
  rules: LeaveRules;
  eligibility: LeaveEligibility;
  quota: LeaveQuota;
  approval: LeaveApproval;
};

// ─── Helpers used to build the seed cleanly ─────────────────────────────────

const baseEligibility: LeaveEligibility = {
  gender: 'all',
  requirePassProbation: false,
  minTenureMonths: 0,
  positionIds: [],
  orgNodeIds: [],
  employeeIds: [],
};

const baseApproval: LeaveApproval = {
  useDefaultTemplate: true,
  templateDocType: null,
};

const baseRules: LeaveRules = {
  payType: 'paid',
  countBasis: 'working-day',
  countHolidayAsLeave: false,
  minMinutes: 60,
  allowHalfDay: true,
  advanceDays: 7,
  backdateDays: 3,
  maxConsecutiveDays: null,
  requireAttachment: false,
  requireAttachmentOverDays: null,
  rounding: 'half',
  carryOver: false,
  carryOverCap: null,
  carryOverExpiryMonths: null,
};

const fixedQuota = (days: number): LeaveQuota => ({
  mode: 'fixed',
  fixedDays: days,
  prorateFirstYear: true,
  cutoffBasis: 'fiscal-year',
});

// ─── Seed: Group A (statutory) ──────────────────────────────────────────────

export const LEAVE_TYPE_SEED: LeaveType[] = [
  {
    id: 'leave-sick',
    code: 'SICK',
    nameTh: 'ลาป่วย',
    nameEn: 'Sick Leave',
    tag: 'ลาป่วย',
    color: '#ef4444',
    unit: 'day',
    statutory: true,
    enabled: true,
    rules: {
      ...baseRules,
      payType: 'paid',
      backdateDays: 7,
      requireAttachment: true,
      requireAttachmentOverDays: 3, // มาตรา 32: ลา ≥3 วันต้องแนบใบรับรองแพทย์
    },
    eligibility: { ...baseEligibility },
    quota: fixedQuota(30), // มาตรา 57: ค่าจ้างไม่เกิน 30 วัน/ปี
    approval: { ...baseApproval },
  },
  {
    id: 'leave-personal',
    code: 'PERSONAL',
    nameTh: 'ลากิจธุระจำเป็น',
    nameEn: 'Personal Leave',
    tag: 'ลากิจ',
    color: '#f59e0b',
    unit: 'day',
    statutory: true,
    enabled: true,
    rules: {
      ...baseRules,
      payType: 'paid',
      advanceDays: 3,
    },
    eligibility: { ...baseEligibility },
    quota: fixedQuota(3), // มาตรา 34: ≥3 วัน
    approval: { ...baseApproval },
  },
  {
    id: 'leave-annual',
    code: 'ANNUAL',
    nameTh: 'ลาพักร้อน',
    nameEn: 'Annual Leave',
    tag: 'ลาพักร้อน',
    color: '#0ea5e9',
    unit: 'day',
    statutory: true,
    enabled: true,
    rules: {
      ...baseRules,
      payType: 'paid',
      advanceDays: 14,
      backdateDays: 0,
      carryOver: true,
      carryOverCap: 5,
      carryOverExpiryMonths: 6,
    },
    eligibility: {
      ...baseEligibility,
      requirePassProbation: true,
      minTenureMonths: 12, // มาตรา 30: ต้องครบ 1 ปี
    },
    quota: {
      mode: 'tenure-tier',
      tiers: [
        { minMonths: 0,  maxMonths: 12,   days: 0 },
        { minMonths: 12, maxMonths: 36,   days: 6 },
        { minMonths: 36, maxMonths: 60,   days: 8 },
        { minMonths: 60, maxMonths: null, days: 10 },
      ],
      prorateFirstYear: true,
      cutoffBasis: 'fiscal-year',
    },
    approval: { ...baseApproval },
  },
  {
    id: 'leave-maternity',
    code: 'MATERNITY',
    nameTh: 'ลาคลอด',
    nameEn: 'Maternity Leave',
    tag: 'ลาคลอด',
    color: '#ec4899',
    unit: 'day',
    statutory: true,
    enabled: true,
    rules: {
      ...baseRules,
      payType: 'partial',
      partialPaidDays: 45, // มาตรา 59: นายจ้างจ่าย 45 วัน + ปกส.
      countBasis: 'calendar-day',
      countHolidayAsLeave: true,
      allowHalfDay: false,
      advanceDays: 30,
      requireAttachment: true,
      requireAttachmentOverDays: 0,
    },
    eligibility: { ...baseEligibility, gender: 'female' },
    quota: fixedQuota(98), // มาตรา 41: ≤98 วัน/ครรภ์
    approval: { ...baseApproval },
  },
  {
    id: 'leave-sterilization',
    code: 'STERILIZATION',
    nameTh: 'ลาทำหมัน',
    nameEn: 'Sterilization Leave',
    tag: 'ลาทำหมัน',
    color: '#8b5cf6',
    unit: 'day',
    statutory: true,
    enabled: true,
    rules: {
      ...baseRules,
      payType: 'paid',
      allowHalfDay: false,
      requireAttachment: true,
      requireAttachmentOverDays: 0,
    },
    eligibility: { ...baseEligibility },
    quota: {
      mode: 'medical', // มาตรา 33: ตามที่แพทย์กำหนด
      prorateFirstYear: false,
      cutoffBasis: 'fiscal-year',
    },
    approval: { ...baseApproval },
  },
  {
    id: 'leave-military',
    code: 'MILITARY',
    nameTh: 'ลารับราชการทหาร',
    nameEn: 'Military Service Leave',
    tag: 'ลาทหาร',
    color: '#16a34a',
    unit: 'day',
    statutory: true,
    enabled: true,
    rules: {
      ...baseRules,
      payType: 'paid',
      countBasis: 'calendar-day',
      allowHalfDay: false,
      advanceDays: 30,
      requireAttachment: true,
      requireAttachmentOverDays: 0,
    },
    eligibility: { ...baseEligibility, gender: 'male' },
    quota: fixedQuota(60), // มาตรา 58: ≤60 วัน/ปี
    approval: { ...baseApproval },
  },
  {
    id: 'leave-training',
    code: 'TRAINING',
    nameTh: 'ลาฝึกอบรม',
    nameEn: 'Training Leave',
    tag: 'ลาฝึกอบรม',
    color: '#0891b2',
    unit: 'day',
    statutory: true,
    enabled: true,
    rules: {
      ...baseRules,
      payType: 'unpaid', // มาตรา 36: มักไม่รับค่าจ้าง
      allowHalfDay: false,
      advanceDays: 30,
      requireAttachment: true,
      requireAttachmentOverDays: 0,
    },
    eligibility: { ...baseEligibility, requirePassProbation: true },
    quota: fixedQuota(30),
    approval: { ...baseApproval },
  },
];

export const LEAVE_TYPES_STORAGE_KEY = 'g-hub.hr.leave-types';

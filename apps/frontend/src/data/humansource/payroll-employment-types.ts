// 3.2 ประเภทการจ้าง — CRUD master data per company.

export type PayrollPayType = 'monthly' | 'daily' | 'hourly' | 'piece';

export type CalcConditionKey =
  | 'overtime'       // ล่วงเวลา (บังคับมีเสมอ)
  | 'late'           // สาย
  | 'absent'         // ขาดงาน
  | 'missed-punch'   // ลืมลงเวลา
  | 'early-leave'    // กลับก่อน
  | 'break-status';  // คำนวณสถานะช่วงพัก

// OT rate row in the overtime condition table
export type OtRateRow = {
  id: string;         // OT1..OT4
  label: string;      // description shown in table
  multiplier: number; // rate multiplier, e.g. 1.5
};

export type DeductMode =
  | 'per-working-day'  // หักเป็นวันทำงาน
  | 'per-money'        // หักเป็นเงิน (คิดตามสัดส่วน)
  | 'none';            // ไม่หัก

export type CalcByMode = 'proportional' | 'custom';

// Rich per-condition config — flat shape; engine reads only fields relevant to each key
export type CalcConditionConfig = {
  key: CalcConditionKey;
  enabled: boolean;
  // overtime
  otRates: OtRateRow[];
  calcOtFlat: boolean;             // คำนวณค่าล่วงเวลาแบบเหมา
  restrictPublicHoliday: boolean;  // กำหนดเงื่อนไขวันหยุดตามประเพณี
  // late / absent / missed-punch / early-leave
  deductMode: DeductMode;
  deductDays: number;              // จำนวนวันที่หักต่อครั้ง
  // early-leave
  calcBy: CalcByMode;              // คิดตามสัดส่วน vs กำหนดเอง
  // break-status
  breakLateMode: DeductMode;       // เมื่อออกก่อนเวลาพัก หรือเข้างานสาย
  breakMissedPunchAmount: number;  // หักเงินวันละ — ลืมลงเวลาออก/เข้าในช่วงพัก
  breakNoRecordAmount: number;     // หักเงินวันละ — ไม่มีการลงเวลาในช่วงพักเลย
  breakTaxable: boolean;           // นำส่งภาษีเงินได้
  breakCustomIncomeType: boolean;  // ตั้งค่าประเภทเงินได้เฉพาะประเภทการจ้างนี้
};

// Backward-compat alias
export type CalcCondition = CalcConditionConfig;

export const PAY_TYPE_OPTIONS: { value: PayrollPayType; label: string }[] = [
  { value: 'monthly', label: 'รายเดือน' },
  { value: 'daily',   label: 'รายวัน' },
  { value: 'hourly',  label: 'รายชั่วโมง' },
  { value: 'piece',   label: 'เหมาจ่าย' },
];

export const CALC_CONDITION_LABELS: Record<CalcConditionKey, string> = {
  overtime:       'ล่วงเวลา',
  late:           'สาย',
  absent:         'ขาดงาน',
  'missed-punch': 'ลืมลงเวลา',
  'early-leave':  'กลับก่อน',
  'break-status': 'คำนวณสถานะช่วงพัก',
};

export const ALL_CALC_CONDITION_KEYS: CalcConditionKey[] = [
  'overtime', 'late', 'absent', 'missed-punch', 'early-leave', 'break-status',
];

export const DEFAULT_OT_RATES: OtRateRow[] = [
  { id: 'OT1', label: 'OT1: ทำงานในวันหยุด',          multiplier: 1   },
  { id: 'OT2', label: 'OT2: ล่วงเวลาในวันทำงาน *',    multiplier: 1.5 },
  { id: 'OT3', label: 'OT3: ทำงานในวันหยุด (รายวัน) *', multiplier: 2 },
  { id: 'OT4', label: 'OT4: ล่วงเวลาในวันหยุด *',      multiplier: 3  },
];

export const DEDUCT_MODE_OPTIONS: { value: DeductMode; label: string }[] = [
  { value: 'per-working-day', label: 'หักเป็นวันทำงาน' },
  { value: 'per-money',       label: 'หักเป็นเงิน' },
  { value: 'none',            label: 'ไม่หัก' },
];

export function defaultCalcConditionConfig(key: CalcConditionKey): CalcConditionConfig {
  return {
    key,
    enabled: true,
    otRates: key === 'overtime' ? DEFAULT_OT_RATES.map((r) => ({ ...r })) : [],
    calcOtFlat: false,
    restrictPublicHoliday: false,
    deductMode: 'per-working-day',
    deductDays: key === 'missed-punch' ? 0.5 : 0,
    calcBy: 'proportional',
    breakLateMode: 'none',
    breakMissedPunchAmount: 0,
    breakNoRecordAmount: 0,
    breakTaxable: true,
    breakCustomIncomeType: false,
  };
}

export function defaultCalcConditions(): CalcConditionConfig[] {
  return ALL_CALC_CONDITION_KEYS.map(defaultCalcConditionConfig);
}

export type PayrollEmploymentType = {
  id: string;
  code: string;
  nameTh: string;
  nameEn: string;
  payType: PayrollPayType;
  paidPublicHoliday: boolean;
  paidHourly: boolean;            // จ่ายรายชั่วโมง — ซ่อนแท็บเงื่อนไขที่ไม่เกี่ยวข้อง
  calcConditions: CalcConditionConfig[];
  employeeTypeId?: string;
  active: boolean;
};

// ลำดับ / ป้ายของเงื่อนไขที่แสดงใน UI — hourly → overtime เท่านั้น
export function visibleCalcConditions(
  emp: Pick<PayrollEmploymentType, 'paidHourly' | 'calcConditions'>,
): CalcConditionConfig[] {
  if (emp.paidHourly) return emp.calcConditions.filter((c) => c.key === 'overtime');
  return emp.calcConditions;
}

export const PAYROLL_EMPLOYMENT_TYPES_STORAGE_BASE = 'employment-types';

export const PAYROLL_EMPLOYMENT_TYPE_SEED: PayrollEmploymentType[] = [
  {
    id: 'PET-monthly',
    code: 'MONTHLY',
    nameTh: 'รายเดือน',
    nameEn: 'Monthly',
    payType: 'monthly',
    paidPublicHoliday: true,
    paidHourly: false,
    calcConditions: defaultCalcConditions(),
    employeeTypeId: 'ET001',
    active: true,
  },
  {
    id: 'PET-daily',
    code: 'DAILY',
    nameTh: 'รายวัน',
    nameEn: 'Daily',
    payType: 'daily',
    paidPublicHoliday: true,
    paidHourly: false,
    calcConditions: defaultCalcConditions(),
    employeeTypeId: 'ET003',
    active: true,
  },
  {
    id: 'PET-hourly',
    code: 'HOURLY',
    nameTh: 'รายชั่วโมง',
    nameEn: 'Hourly',
    payType: 'hourly',
    paidPublicHoliday: false,
    paidHourly: true,
    calcConditions: defaultCalcConditions(),
    active: true,
  },
  {
    id: 'PET-intern',
    code: 'INTERN',
    nameTh: 'ฝึกงาน',
    nameEn: 'Internship',
    payType: 'daily',
    paidPublicHoliday: false,
    paidHourly: false,
    calcConditions: defaultCalcConditions(),
    active: true,
  },
];

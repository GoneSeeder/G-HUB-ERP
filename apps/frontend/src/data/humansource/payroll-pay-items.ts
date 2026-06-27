// 3.4 รายได้ / รายหัก — income + deduction master items, per company.

export type RevenueCategory = '40(1)' | '40(2)' | '40(3)' | '40(5)' | '40(6)' | '40(8)';
export type PayItemRounding = 'none' | 'up' | 'down' | 'nearest';
export type PayoutScope = 'end-of-month-only' | 'every-period';
export type TaxCalcMethod = 'annual' | 'per-payment';

export type IncomeItem = {
  id: string;
  code: string;                      // I01...
  nameTh: string;
  nameEn: string;
  revenueCategory: RevenueCategory;  // ประเภทเงินได้
  rounding: PayItemRounding;         // การปัดทศนิยม
  taxCalcMethod: TaxCalcMethod;      // วิธีคำนวณภาษี (ทั้งปี / ครั้งเดียว)
  // เงื่อนไขการจ่าย
  payOnce: boolean;                  // จ่ายครั้งเดียวต่อปี
  payoutScope: PayoutScope;          // ขอบเขตการจ่าย
  calcByActualWorkdays: boolean;     // คำนวณตามวันทำงานจริง
  // เงื่อนไขการคำนวณ
  taxable: boolean;                  // นำส่งภาษีเงินได้
  linkSSO: boolean;                  // นำเข้าฐาน SSO
  linkProvidentFund: boolean;        // นำเข้ากองทุนสำรอง
  linkOvertime: boolean;             // เงื่อนไขล่วงเวลา
  linkLateAbsent: boolean;           // เงื่อนไขสาย/ขาด
  offCycle: boolean;                 // คำนวณนอกงวด
  carryPrevPeriod: boolean;          // นำยอดงวดก่อนมารวม
  isWelfare: boolean;                // เป็นสวัสดิการ
  enabled: boolean;
  isSystem: boolean;                 // รายการระบบ — ไม่อนุญาตให้ลบ
  isCustom?: boolean;                // true = สร้างโดยผู้ใช้งาน (ไม่ใช่ seed)
  accountMapping?: Record<string, string>; // catId → GL code (from จัดการหมวดบัญชี)
};

export type DeductionItem = {
  id: string;
  code: string;                      // D01...
  nameTh: string;
  nameEn: string;
  revenueCategory?: RevenueCategory; // ประเภทเงินได้ (ถ้ามี — ภาษีพิเศษ / หักลาจะมีค่านี้)
  taxCalcMethod?: TaxCalcMethod;     // วิธีคำนวณภาษี (ถ้ามี)
  rounding: PayItemRounding;
  payoutScope: PayoutScope;
  taxable: boolean;
  linkSSO: boolean;
  linkProvidentFund: boolean;
  offCycle: boolean;
  carryPrevPeriod: boolean;
  isWelfare?: boolean;               // รายการเกี่ยวข้องกับสวัสดิการ
  enabled: boolean;
  isSystem: boolean;
  isCustom?: boolean;                // true = สร้างโดยผู้ใช้งาน
  accountMapping?: Record<string, string>; // catId → GL code (from จัดการหมวดบัญชี)
};

export const INCOME_ITEMS_STORAGE_BASE = 'income-items';
export const DEDUCTION_ITEMS_STORAGE_BASE = 'deduction-items';

// Bump these when seed content changes — triggers reset of cached localStorage data.
export const INCOME_SEED_VER = 2;
export const DEDUCT_SEED_VER = 3;

export const REVENUE_CATEGORY_OPTIONS: { value: RevenueCategory; label: string }[] = [
  { value: '40(1)', label: '40 (1) เงินเดือน ค่าจ้าง' },
  { value: '40(2)', label: '40 (2) ค่าจ้างทำงาน / ค่าคอมมิชชั่น' },
  { value: '40(3)', label: '40 (3) ค่าสิทธิ' },
  { value: '40(5)', label: '40 (5) ค่าเช่า' },
  { value: '40(6)', label: '40 (6) วิชาชีพอิสระ' },
  { value: '40(8)', label: '40 (8) รายได้อื่นๆ' },
];

export const PAY_ITEM_ROUNDING_OPTIONS: { value: PayItemRounding; label: string }[] = [
  { value: 'none',    label: 'ไม่ปัด (ทศนิยม 2 ตำแหน่ง)' },
  { value: 'nearest', label: 'ปัดใกล้สุด (บาทเต็ม)' },
  { value: 'up',      label: 'ปัดขึ้น' },
  { value: 'down',    label: 'ปัดลง' },
];

export const PAYOUT_SCOPE_OPTIONS: { value: PayoutScope; label: string }[] = [
  { value: 'every-period',      label: 'ทุกงวด' },
  { value: 'end-of-month-only', label: 'เฉพาะงวดสิ้นเดือน' },
];

export const TAX_CALC_METHOD_OPTIONS: { value: TaxCalcMethod; label: string }[] = [
  { value: 'annual',      label: 'ทั้งปี' },
  { value: 'per-payment', label: 'ครั้งเดียว' },
];

export const INCOME_ITEM_SEED: IncomeItem[] = [
  {
    id: 'I01', code: 'I01', nameTh: 'เงินเดือน', nameEn: 'Salary',
    revenueCategory: '40(1)', rounding: 'none', taxCalcMethod: 'annual',
    payOnce: false, payoutScope: 'every-period', calcByActualWorkdays: false,
    taxable: true, linkSSO: true, linkProvidentFund: true, linkOvertime: false, linkLateAbsent: false,
    offCycle: false, carryPrevPeriod: false, isWelfare: false, enabled: true, isSystem: true,
  },
  {
    id: 'I02', code: 'I02', nameTh: 'ค่าล่วงเวลา', nameEn: 'Overtime',
    revenueCategory: '40(1)', rounding: 'none', taxCalcMethod: 'per-payment',
    payOnce: false, payoutScope: 'every-period', calcByActualWorkdays: false,
    taxable: true, linkSSO: true, linkProvidentFund: false, linkOvertime: true, linkLateAbsent: false,
    offCycle: false, carryPrevPeriod: false, isWelfare: false, enabled: true, isSystem: true,
  },
  {
    id: 'I03', code: 'I03', nameTh: 'โบนัส', nameEn: 'Bonus',
    revenueCategory: '40(1)', rounding: 'none', taxCalcMethod: 'per-payment',
    payOnce: true, payoutScope: 'end-of-month-only', calcByActualWorkdays: false,
    taxable: true, linkSSO: false, linkProvidentFund: false, linkOvertime: false, linkLateAbsent: false,
    offCycle: false, carryPrevPeriod: false, isWelfare: false, enabled: true, isSystem: true,
  },
  {
    id: 'I04', code: 'I04', nameTh: 'ค่าคอมมิชชั่น', nameEn: 'Commission',
    revenueCategory: '40(2)', rounding: 'none', taxCalcMethod: 'annual',
    payOnce: false, payoutScope: 'every-period', calcByActualWorkdays: false,
    taxable: true, linkSSO: true, linkProvidentFund: false, linkOvertime: false, linkLateAbsent: false,
    offCycle: false, carryPrevPeriod: false, isWelfare: false, enabled: true, isSystem: false,
  },
  {
    id: 'I05', code: 'I05', nameTh: 'ค่ากะ', nameEn: 'Shift Allowance',
    revenueCategory: '40(1)', rounding: 'none', taxCalcMethod: 'annual',
    payOnce: false, payoutScope: 'every-period', calcByActualWorkdays: false,
    taxable: false, linkSSO: false, linkProvidentFund: false, linkOvertime: false, linkLateAbsent: false,
    offCycle: false, carryPrevPeriod: false, isWelfare: true, enabled: true, isSystem: false,
  },
  {
    id: 'I06', code: 'I06', nameTh: 'เบี้ยขยัน', nameEn: 'Diligence Bonus',
    revenueCategory: '40(1)', rounding: 'none', taxCalcMethod: 'annual',
    payOnce: false, payoutScope: 'every-period', calcByActualWorkdays: false,
    taxable: true, linkSSO: false, linkProvidentFund: false, linkOvertime: false, linkLateAbsent: true,
    offCycle: false, carryPrevPeriod: false, isWelfare: false, enabled: true, isSystem: false,
  },
  // ── ค่าเบี้ยเลี้ยงและสวัสดิการ ─────────────────────────────────────────────
  {
    id: 'I07', code: 'I07', nameTh: 'ค่าที่พัก', nameEn: 'Housing Allowance',
    revenueCategory: '40(1)', rounding: 'none', taxCalcMethod: 'annual',
    payOnce: false, payoutScope: 'every-period', calcByActualWorkdays: false,
    taxable: true, linkSSO: true, linkProvidentFund: false, linkOvertime: false, linkLateAbsent: false,
    offCycle: false, carryPrevPeriod: false, isWelfare: false, enabled: true, isSystem: false,
  },
  {
    id: 'I08', code: 'I08', nameTh: 'ค่าเดินทาง', nameEn: 'Travel Allowance',
    revenueCategory: '40(1)', rounding: 'none', taxCalcMethod: 'annual',
    payOnce: false, payoutScope: 'every-period', calcByActualWorkdays: false,
    // ≤270 บาท/วัน มีเอกสารอนุมัติ — ยกเว้นภาษี / ไม่นับฐาน SSO
    taxable: false, linkSSO: false, linkProvidentFund: false, linkOvertime: false, linkLateAbsent: false,
    offCycle: false, carryPrevPeriod: false, isWelfare: true, enabled: true, isSystem: false,
  },
  {
    id: 'I09', code: 'I09', nameTh: 'ค่าอาหาร', nameEn: 'Meal Allowance',
    revenueCategory: '40(1)', rounding: 'none', taxCalcMethod: 'annual',
    payOnce: false, payoutScope: 'every-period', calcByActualWorkdays: false,
    taxable: false, linkSSO: false, linkProvidentFund: false, linkOvertime: false, linkLateAbsent: false,
    offCycle: false, carryPrevPeriod: false, isWelfare: true, enabled: true, isSystem: false,
  },
  {
    id: 'I10', code: 'I10', nameTh: 'ค่าน้ำมัน', nameEn: 'Fuel Allowance',
    revenueCategory: '40(1)', rounding: 'none', taxCalcMethod: 'annual',
    payOnce: false, payoutScope: 'every-period', calcByActualWorkdays: false,
    taxable: true, linkSSO: true, linkProvidentFund: false, linkOvertime: false, linkLateAbsent: false,
    offCycle: false, carryPrevPeriod: false, isWelfare: false, enabled: true, isSystem: false,
  },
  {
    id: 'I11', code: 'I11', nameTh: 'ค่าโทรศัพท์', nameEn: 'Phone Allowance',
    revenueCategory: '40(1)', rounding: 'none', taxCalcMethod: 'annual',
    payOnce: false, payoutScope: 'every-period', calcByActualWorkdays: false,
    taxable: false, linkSSO: false, linkProvidentFund: false, linkOvertime: false, linkLateAbsent: false,
    offCycle: false, carryPrevPeriod: false, isWelfare: true, enabled: true, isSystem: false,
  },
  // ── ค่าตำแหน่งและค่าครองชีพ ───────────────────────────────────────────────
  {
    id: 'I12', code: 'I12', nameTh: 'ค่าตำแหน่ง', nameEn: 'Position Allowance',
    revenueCategory: '40(1)', rounding: 'none', taxCalcMethod: 'annual',
    payOnce: false, payoutScope: 'every-period', calcByActualWorkdays: false,
    taxable: true, linkSSO: true, linkProvidentFund: true, linkOvertime: false, linkLateAbsent: false,
    offCycle: false, carryPrevPeriod: false, isWelfare: false, enabled: true, isSystem: false,
  },
  {
    id: 'I13', code: 'I13', nameTh: 'ค่าครองชีพ', nameEn: 'Cost of Living Allowance',
    revenueCategory: '40(1)', rounding: 'none', taxCalcMethod: 'annual',
    payOnce: false, payoutScope: 'every-period', calcByActualWorkdays: false,
    taxable: true, linkSSO: true, linkProvidentFund: false, linkOvertime: false, linkLateAbsent: false,
    offCycle: false, carryPrevPeriod: false, isWelfare: false, enabled: true, isSystem: false,
  },
  // ── เบี้ยประชุม (มาตรา 40(2)) และรายการพิเศษ ─────────────────────────────
  {
    id: 'I14', code: 'I14', nameTh: 'เบี้ยประชุม', nameEn: 'Meeting Allowance',
    revenueCategory: '40(2)', rounding: 'none', taxCalcMethod: 'annual',
    payOnce: false, payoutScope: 'every-period', calcByActualWorkdays: false,
    taxable: true, linkSSO: false, linkProvidentFund: false, linkOvertime: false, linkLateAbsent: false,
    offCycle: true, carryPrevPeriod: false, isWelfare: false, enabled: true, isSystem: false,
  },
  {
    id: 'I15', code: 'I15', nameTh: 'เงินรางวัล', nameEn: 'Prize / Award',
    revenueCategory: '40(1)', rounding: 'none', taxCalcMethod: 'per-payment',
    // คำนวณภาษีแบบ per-payment (ครั้งเดียว) ไม่รวมคำนวณสะสมทั้งปี
    payOnce: true, payoutScope: 'end-of-month-only', calcByActualWorkdays: false,
    taxable: true, linkSSO: false, linkProvidentFund: false, linkOvertime: false, linkLateAbsent: false,
    offCycle: true, carryPrevPeriod: false, isWelfare: false, enabled: true, isSystem: false,
  },
  // ── รายได้เพิ่มเติม (ตามระบบอ้างอิง) ─────────────────────────────────────
  {
    id: 'I16', code: 'I16', nameTh: 'ค่าวิชาชีพ', nameEn: 'Professional Fee',
    revenueCategory: '40(2)', rounding: 'none', taxCalcMethod: 'annual',
    payOnce: false, payoutScope: 'every-period', calcByActualWorkdays: false,
    taxable: true, linkSSO: false, linkProvidentFund: false, linkOvertime: false, linkLateAbsent: false,
    offCycle: false, carryPrevPeriod: false, isWelfare: false, enabled: true, isSystem: false,
  },
  {
    id: 'I17', code: 'I17', nameTh: 'ค่ากะพิเศษ (OT)', nameEn: 'Special Shift Overtime',
    revenueCategory: '40(1)', rounding: 'none', taxCalcMethod: 'per-payment',
    payOnce: false, payoutScope: 'every-period', calcByActualWorkdays: false,
    taxable: true, linkSSO: true, linkProvidentFund: false, linkOvertime: true, linkLateAbsent: false,
    offCycle: false, carryPrevPeriod: false, isWelfare: false, enabled: true, isSystem: false,
  },
  {
    id: 'I18', code: 'I18', nameTh: 'ค่ากะพิเศษ (วันหยุด)', nameEn: 'Holiday Shift Allowance',
    revenueCategory: '40(1)', rounding: 'none', taxCalcMethod: 'per-payment',
    payOnce: false, payoutScope: 'every-period', calcByActualWorkdays: false,
    taxable: true, linkSSO: true, linkProvidentFund: false, linkOvertime: false, linkLateAbsent: false,
    offCycle: false, carryPrevPeriod: false, isWelfare: false, enabled: true, isSystem: false,
  },
  {
    id: 'I19', code: 'I19', nameTh: 'ค่ากะพิเศษจากเวลาทำงาน', nameEn: 'Time-based Shift Allowance',
    revenueCategory: '40(1)', rounding: 'none', taxCalcMethod: 'per-payment',
    payOnce: false, payoutScope: 'every-period', calcByActualWorkdays: true,
    taxable: true, linkSSO: true, linkProvidentFund: false, linkOvertime: true, linkLateAbsent: false,
    offCycle: false, carryPrevPeriod: false, isWelfare: false, enabled: true, isSystem: false,
  },
  {
    id: 'I20', code: 'I20', nameTh: 'เบี้ยขยันพิเศษ', nameEn: 'Special Diligence Allowance',
    revenueCategory: '40(1)', rounding: 'none', taxCalcMethod: 'per-payment',
    payOnce: false, payoutScope: 'every-period', calcByActualWorkdays: false,
    taxable: true, linkSSO: false, linkProvidentFund: false, linkOvertime: false, linkLateAbsent: true,
    offCycle: false, carryPrevPeriod: false, isWelfare: false, enabled: true, isSystem: false,
  },
  {
    id: 'I21', code: 'I21', nameTh: 'เงินสวัสดิการรักษาพยาบาล', nameEn: 'Medical Welfare',
    revenueCategory: '40(1)', rounding: 'none', taxCalcMethod: 'annual',
    payOnce: false, payoutScope: 'every-period', calcByActualWorkdays: false,
    taxable: false, linkSSO: false, linkProvidentFund: false, linkOvertime: false, linkLateAbsent: false,
    offCycle: false, carryPrevPeriod: false, isWelfare: true, enabled: true, isSystem: false,
  },
  {
    id: 'I22', code: 'I22', nameTh: 'ค่าควบตำแหน่ง', nameEn: 'Acting Position Allowance',
    revenueCategory: '40(1)', rounding: 'none', taxCalcMethod: 'per-payment',
    payOnce: false, payoutScope: 'end-of-month-only', calcByActualWorkdays: false,
    taxable: true, linkSSO: true, linkProvidentFund: false, linkOvertime: false, linkLateAbsent: false,
    offCycle: false, carryPrevPeriod: false, isWelfare: false, enabled: true, isSystem: false,
  },
  {
    id: 'I23', code: 'I23', nameTh: 'คืนเงินวันลาคงเหลือ', nameEn: 'Leave Balance Cashout',
    revenueCategory: '40(1)', rounding: 'none', taxCalcMethod: 'per-payment',
    payOnce: true, payoutScope: 'end-of-month-only', calcByActualWorkdays: false,
    taxable: true, linkSSO: true, linkProvidentFund: false, linkOvertime: false, linkLateAbsent: false,
    offCycle: true, carryPrevPeriod: false, isWelfare: false, enabled: true, isSystem: false,
  },
  {
    id: 'I24', code: 'I24', nameTh: 'เงินชดเชย', nameEn: 'Severance Pay',
    revenueCategory: '40(1)', rounding: 'none', taxCalcMethod: 'per-payment',
    // ยกเว้นภาษีไม่เกิน 300 วัน × อัตราค่าจ้างสุดท้าย หรือ 600,000 บาท (ม.48(5) ก))
    payOnce: true, payoutScope: 'end-of-month-only', calcByActualWorkdays: false,
    taxable: true, linkSSO: false, linkProvidentFund: false, linkOvertime: false, linkLateAbsent: false,
    offCycle: true, carryPrevPeriod: false, isWelfare: false, enabled: true, isSystem: true,
  },
  {
    id: 'I25', code: 'I25', nameTh: 'ภาษีบริษัทออกให้', nameEn: 'Tax Paid by Company (Gross-up)',
    revenueCategory: '40(1)', rounding: 'none', taxCalcMethod: 'annual',
    // บริษัท gross-up ภาษีให้พนักงาน — ยอดภาษีที่บริษัทออกถือเป็นรายได้พนักงานด้วย
    payOnce: false, payoutScope: 'every-period', calcByActualWorkdays: false,
    taxable: true, linkSSO: false, linkProvidentFund: false, linkOvertime: false, linkLateAbsent: false,
    offCycle: false, carryPrevPeriod: false, isWelfare: false, enabled: true, isSystem: false,
  },
  {
    id: 'I26', code: 'I26', nameTh: 'EJIP บริษัทสมทบ', nameEn: 'EJIP Company Contribution',
    revenueCategory: '40(1)', rounding: 'none', taxCalcMethod: 'per-payment',
    // Employee Joint Investment Program — เงินที่บริษัทสมทบให้พนักงาน ยกเว้นภาษีเมื่อถือครบกำหนด
    payOnce: false, payoutScope: 'end-of-month-only', calcByActualWorkdays: false,
    taxable: false, linkSSO: false, linkProvidentFund: false, linkOvertime: false, linkLateAbsent: false,
    offCycle: false, carryPrevPeriod: false, isWelfare: true, enabled: true, isSystem: false,
  },
];

export const DEDUCTION_ITEM_SEED: DeductionItem[] = [
  // ── ตามกฎหมาย (isSystem) ─────────────────────────────────────────────────────
  {
    id: 'D01', code: 'D01', nameTh: 'ภาษีเงินได้ หัก ณ ที่จ่าย', nameEn: 'Withholding Tax',
    rounding: 'none', payoutScope: 'end-of-month-only',
    taxable: false, linkSSO: false, linkProvidentFund: false,
    offCycle: false, carryPrevPeriod: false, enabled: true, isSystem: true,
  },
  {
    id: 'D02', code: 'D02', nameTh: 'ประกันสังคม', nameEn: 'Social Security (Employee 5%)',
    rounding: 'none', payoutScope: 'every-period',
    taxable: false, linkSSO: true, linkProvidentFund: false,
    offCycle: false, carryPrevPeriod: false, enabled: true, isSystem: true,
  },
  {
    id: 'D03', code: 'D03', nameTh: 'กองทุนสำรองเลี้ยงชีพ', nameEn: 'Provident Fund (Employee)',
    rounding: 'none', payoutScope: 'every-period',
    taxable: false, linkSSO: false, linkProvidentFund: true,
    offCycle: false, carryPrevPeriod: false, enabled: true, isSystem: true,
  },
  {
    id: 'D04', code: 'D04', nameTh: 'หักสาย/ขาด', nameEn: 'Late & Absent Deduction',
    revenueCategory: '40(1)', taxCalcMethod: 'per-payment',
    rounding: 'none', payoutScope: 'every-period',
    taxable: true, linkSSO: true, linkProvidentFund: false,
    offCycle: false, carryPrevPeriod: false, enabled: true, isSystem: true,
  },
  {
    id: 'D05', code: 'D05', nameTh: 'หักลาไม่รับค่าจ้าง', nameEn: 'Unpaid Leave Deduction',
    revenueCategory: '40(1)', taxCalcMethod: 'per-payment',
    rounding: 'none', payoutScope: 'every-period',
    // ลาโดยไม่มีสิทธิ์หรือลาเกินสิทธิ์ — หักออกจากฐาน SSO และภาษี
    taxable: true, linkSSO: true, linkProvidentFund: false,
    offCycle: false, carryPrevPeriod: false, enabled: true, isSystem: true,
  },
  {
    id: 'D06', code: 'D06', nameTh: 'หักไม่มาทำงาน', nameEn: 'Absent Deduction',
    revenueCategory: '40(1)', taxCalcMethod: 'per-payment',
    rounding: 'none', payoutScope: 'end-of-month-only',
    taxable: true, linkSSO: true, linkProvidentFund: false,
    offCycle: false, carryPrevPeriod: false, enabled: true, isSystem: true,
  },
  {
    id: 'D07', code: 'D07', nameTh: 'ภาษีเลิกจ้าง', nameEn: 'Termination Withholding Tax',
    rounding: 'none', payoutScope: 'end-of-month-only',
    // WHT จากเงินชดเชย — คำนวณแยกตามสูตร ม.48(5) / ม.50(1)(ก)(2)
    taxable: false, linkSSO: false, linkProvidentFund: false,
    offCycle: true, carryPrevPeriod: false, enabled: true, isSystem: true,
  },
  // ── รายหักทั่วไป ──────────────────────────────────────────────────────────────
  {
    id: 'D08', code: 'D08', nameTh: 'หักพักงาน', nameEn: 'Suspension Deduction',
    rounding: 'none', payoutScope: 'every-period',
    taxable: false, linkSSO: false, linkProvidentFund: false,
    offCycle: false, carryPrevPeriod: false, enabled: true, isSystem: false,
  },
  {
    id: 'D09', code: 'D09', nameTh: 'เงินหักวันลาเกินสิทธิ์', nameEn: 'Excess Leave Deduction',
    revenueCategory: '40(1)', taxCalcMethod: 'per-payment',
    rounding: 'none', payoutScope: 'end-of-month-only',
    taxable: true, linkSSO: true, linkProvidentFund: false,
    offCycle: false, carryPrevPeriod: false, enabled: true, isSystem: false,
  },
  {
    id: 'D10', code: 'D10', nameTh: 'หักสวัสดิการ', nameEn: 'Welfare Deduction',
    rounding: 'none', payoutScope: 'every-period',
    // หักสวัสดิการที่บริษัทจ่ายล่วงหน้าให้พนักงาน (เช่น ค่าอาหาร ที่พัก)
    taxable: false, linkSSO: false, linkProvidentFund: false,
    isWelfare: true, offCycle: false, carryPrevPeriod: false, enabled: true, isSystem: false,
  },
  {
    id: 'D11', code: 'D11', nameTh: 'ค่าปรับ', nameEn: 'Penalty / Fine',
    rounding: 'none', payoutScope: 'every-period',
    taxable: false, linkSSO: false, linkProvidentFund: false,
    offCycle: false, carryPrevPeriod: false, enabled: true, isSystem: false,
  },
  // ── เงินกู้และหักตามคำสั่งศาล ────────────────────────────────────────────────
  {
    id: 'D12', code: 'D12', nameTh: 'เบิกเงินล่วงหน้า', nameEn: 'Salary Advance Recovery',
    revenueCategory: '40(1)', taxCalcMethod: 'per-payment',
    rounding: 'none', payoutScope: 'every-period',
    taxable: true, linkSSO: true, linkProvidentFund: false,
    offCycle: false, carryPrevPeriod: false, enabled: true, isSystem: false,
  },
  {
    id: 'D13', code: 'D13', nameTh: 'เงินกู้ กยศ.', nameEn: 'Student Loan (กยศ.)',
    rounding: 'none', payoutScope: 'every-period',
    taxable: false, linkSSO: false, linkProvidentFund: false,
    offCycle: false, carryPrevPeriod: false, enabled: true, isSystem: false,
  },
  {
    id: 'D14', code: 'D14', nameTh: 'กรมบังคับคดี', nameEn: 'Court-Ordered Garnishment',
    rounding: 'none', payoutScope: 'end-of-month-only',
    taxable: false, linkSSO: false, linkProvidentFund: false,
    offCycle: false, carryPrevPeriod: false, enabled: true, isSystem: false,
  },
  {
    id: 'D15', code: 'D15', nameTh: 'เงินหักอื่นๆ', nameEn: 'Other Deduction',
    rounding: 'none', payoutScope: 'every-period',
    taxable: false, linkSSO: false, linkProvidentFund: false,
    offCycle: false, carryPrevPeriod: false, enabled: true, isSystem: false,
  },
  // ── ภาษีพิเศษ (WHT หลายมาตรา) ───────────────────────────────────────────────
  {
    id: 'D16', code: 'D16', nameTh: 'ภาษีหัก 40(1) 3%', nameEn: 'WHT 40(1) 3%',
    revenueCategory: '40(1)', taxCalcMethod: 'per-payment',
    rounding: 'none', payoutScope: 'end-of-month-only',
    // สำหรับจ่ายค่าจ้างแรงงานที่ไม่ใช่พนักงานประจำ — WHT 3% ณ ที่จ่าย
    taxable: false, linkSSO: false, linkProvidentFund: false,
    offCycle: false, carryPrevPeriod: false, enabled: true, isSystem: false,
  },
  {
    id: 'D17', code: 'D17', nameTh: 'ภาษีหัก 40(2) อยู่ในไทย', nameEn: 'WHT 40(2) Resident',
    revenueCategory: '40(2)', taxCalcMethod: 'per-payment',
    rounding: 'none', payoutScope: 'end-of-month-only',
    taxable: false, linkSSO: false, linkProvidentFund: false,
    offCycle: false, carryPrevPeriod: false, enabled: true, isSystem: false,
  },
  {
    id: 'D18', code: 'D18', nameTh: 'ภาษี 40(5)', nameEn: 'WHT 40(5) Rental',
    revenueCategory: '40(5)', taxCalcMethod: 'per-payment',
    rounding: 'none', payoutScope: 'end-of-month-only',
    taxable: false, linkSSO: false, linkProvidentFund: false,
    offCycle: false, carryPrevPeriod: false, enabled: true, isSystem: false,
  },
  {
    id: 'D19', code: 'D19', nameTh: 'ภาษี 40(6)', nameEn: 'WHT 40(6) Professional',
    revenueCategory: '40(6)', taxCalcMethod: 'per-payment',
    rounding: 'none', payoutScope: 'end-of-month-only',
    taxable: false, linkSSO: false, linkProvidentFund: false,
    offCycle: false, carryPrevPeriod: false, enabled: true, isSystem: false,
  },
  {
    id: 'D20', code: 'D20', nameTh: 'ภาษี 40(8)', nameEn: 'WHT 40(8) Other Income',
    revenueCategory: '40(8)', taxCalcMethod: 'per-payment',
    rounding: 'none', payoutScope: 'end-of-month-only',
    taxable: false, linkSSO: false, linkProvidentFund: false,
    offCycle: false, carryPrevPeriod: false, enabled: true, isSystem: false,
  },
  {
    id: 'D21', code: 'D21', nameTh: 'ภาษีบริษัทออกให้', nameEn: 'Tax Paid by Company (Gross-up)',
    revenueCategory: '40(1)', taxCalcMethod: 'annual',
    rounding: 'none', payoutScope: 'every-period',
    // หักยอดภาษีที่บริษัทออกแทนพนักงานออกจากยอดจ่ายสุทธิ
    taxable: false, linkSSO: false, linkProvidentFund: false,
    offCycle: false, carryPrevPeriod: false, enabled: true, isSystem: false,
  },
  // ── EJIP ──────────────────────────────────────────────────────────────────────
  {
    id: 'D22', code: 'D22', nameTh: 'EJIP พนักงานสะสม', nameEn: 'EJIP Employee Contribution',
    rounding: 'none', payoutScope: 'end-of-month-only',
    taxable: false, linkSSO: false, linkProvidentFund: false,
    isWelfare: true, offCycle: false, carryPrevPeriod: false, enabled: true, isSystem: false,
  },
  {
    id: 'D23', code: 'D23', nameTh: 'EJIP ภาษีหัก ณ ที่จ่ายบริษัท', nameEn: 'EJIP WHT (Company-paid)',
    revenueCategory: '40(1)', taxCalcMethod: 'annual',
    rounding: 'none', payoutScope: 'end-of-month-only',
    taxable: false, linkSSO: false, linkProvidentFund: false,
    isWelfare: true, offCycle: false, carryPrevPeriod: false, enabled: true, isSystem: false,
  },
  // ── ตกเบิก (ปรับย้อนหลัง) ───────────────────────────────────────────────────
  {
    id: 'D24', code: 'D24', nameTh: 'ตกเบิกค่าล่วงเวลา', nameEn: 'Retroactive OT Deduction',
    revenueCategory: '40(1)', taxCalcMethod: 'per-payment',
    rounding: 'none', payoutScope: 'end-of-month-only',
    taxable: true, linkSSO: true, linkProvidentFund: false,
    offCycle: false, carryPrevPeriod: true, enabled: true, isSystem: false,
  },
  {
    id: 'D25', code: 'D25', nameTh: 'ตกเบิกขาดสาย/ขาด', nameEn: 'Retroactive Absent & Late Deduction',
    revenueCategory: '40(1)', taxCalcMethod: 'per-payment',
    rounding: 'none', payoutScope: 'end-of-month-only',
    taxable: true, linkSSO: true, linkProvidentFund: false,
    offCycle: false, carryPrevPeriod: true, enabled: true, isSystem: false,
  },
  {
    id: 'D26', code: 'D26', nameTh: 'ตกเบิกสวัสดิการ', nameEn: 'Retroactive Welfare Deduction',
    rounding: 'none', payoutScope: 'end-of-month-only',
    taxable: false, linkSSO: false, linkProvidentFund: false,
    offCycle: false, carryPrevPeriod: true, enabled: true, isSystem: false,
  },
];

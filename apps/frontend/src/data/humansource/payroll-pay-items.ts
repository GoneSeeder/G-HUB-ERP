// 3.4 รายได้ / รายหัก — income + deduction master items, per company.

export type RevenueCategory = '40(1)' | '40(2)' | '40(5)' | '40(6)' | '40(8)';
export type PayItemRounding = 'none' | 'up' | 'down' | 'nearest';
export type PayoutScope = 'end-of-month-only' | 'every-period';

// นำรายได้/รายหักนี้ไปคำนวณกับ
export type PayCalcLinks = {
  sso: boolean;              // ประกันสังคม
  providentFund: boolean;    // กองทุนสำรองเลี้ยงชีพ
  overtime: boolean;         // ค่าล่วงเวลา (income เท่านั้น)
  lateAbsentDeduct: boolean; // หักสาย/ขาดงาน (income เท่านั้น)
};

export type IncomeItem = {
  id: string;
  code: string;                 // I01...
  nameTh: string;
  nameEn: string;
  revenueCategory: RevenueCategory; // ประเภทเงินได้*
  rounding: PayItemRounding;        // การปัดทศนิยม*
  // เงื่อนไขการจ่าย
  payOnce: boolean;                 // จ่ายครั้งเดียว
  payoutScope: PayoutScope;         // ให้ทำจ่าย: เฉพาะงวดสิ้นเดือน / ทุกงวด
  calcByActualWorkdays: boolean;    // คำนวณตามวันทำงานจริง
  // เงื่อนไขการคำนวณ
  taxable: boolean;                 // นำไปคำนวณภาษี
  links: PayCalcLinks;
  // คอลัมน์ในตาราง
  offCycle: boolean;                // นอกงวด
  carryPrevPeriod: boolean;         // งวดก่อนหน้า
  isWelfare: boolean;               // สวัสดิการ
  accountCategoryId: string | null; // ประเภทบัญชี
  enabled: boolean;                 // สถานะ
};

export type DeductionItem = {
  id: string;
  code: string;                 // D01...
  nameTh: string;
  nameEn: string;
  revenueCategory: RevenueCategory;
  rounding: PayItemRounding;
  payOnce: boolean;
  payoutScope: PayoutScope;
  taxable: boolean;
  links: Pick<PayCalcLinks, 'sso' | 'providentFund'>;
  offCycle: boolean;
  carryPrevPeriod: boolean;
  accountCategoryId: string | null;
  enabled: boolean;
};

export const INCOME_ITEMS_STORAGE_BASE = 'income-items';
export const DEDUCTION_ITEMS_STORAGE_BASE = 'deduction-items';

export const REVENUE_CATEGORY_OPTIONS: { value: RevenueCategory; label: string }[] = [
  { value: '40(1)', label: '40 (1) เงินเดือน ค่าจ้าง' },
  { value: '40(2)', label: '40 (2) ค่าจ้างทำงาน/ค่าคอมมิชชั่น' },
  { value: '40(5)', label: '40 (5) ค่าเช่า' },
  { value: '40(6)', label: '40 (6) วิชาชีพอิสระ' },
  { value: '40(8)', label: '40 (8) เงินได้อื่นๆ' },
];

export const PAY_ITEM_ROUNDING_OPTIONS: { value: PayItemRounding; label: string }[] = [
  { value: 'none', label: 'ไม่ปัด (ทศนิยม 2 ตำแหน่ง)' },
  { value: 'nearest', label: 'ปัดใกล้สุด (บาทเต็ม)' },
  { value: 'up', label: 'ปัดขึ้น' },
  { value: 'down', label: 'ปัดลง' },
];

export const PAYOUT_SCOPE_OPTIONS: { value: PayoutScope; label: string }[] = [
  { value: 'end-of-month-only', label: 'เฉพาะงวดสิ้นเดือน' },
  { value: 'every-period', label: 'ทุกงวด' },
];

function emptyLinks(): PayCalcLinks {
  return { sso: false, providentFund: false, overtime: false, lateAbsentDeduct: false };
}

export const INCOME_ITEM_SEED: IncomeItem[] = [
  {
    id: 'I01', code: 'I01', nameTh: 'เงินเดือน / ค่าจ้างรายวัน', nameEn: 'Salary / Daily Wage',
    revenueCategory: '40(1)', rounding: 'nearest',
    payOnce: false, payoutScope: 'every-period', calcByActualWorkdays: true,
    taxable: true, links: { sso: true, providentFund: true, overtime: true, lateAbsentDeduct: true },
    offCycle: false, carryPrevPeriod: false, isWelfare: false, accountCategoryId: null, enabled: true,
  },
  {
    id: 'I02', code: 'I02', nameTh: 'ค่าล่วงเวลา', nameEn: 'Overtime',
    revenueCategory: '40(1)', rounding: 'nearest',
    payOnce: true, payoutScope: 'end-of-month-only', calcByActualWorkdays: false,
    taxable: true, links: { ...emptyLinks() },
    offCycle: false, carryPrevPeriod: false, isWelfare: false, accountCategoryId: null, enabled: true,
  },
  {
    id: 'I03', code: 'I03', nameTh: 'ค่าวิชาชีพ', nameEn: 'Professional Allowance',
    revenueCategory: '40(1)', rounding: 'nearest',
    payOnce: false, payoutScope: 'end-of-month-only', calcByActualWorkdays: false,
    taxable: true, links: { ...emptyLinks() },
    offCycle: false, carryPrevPeriod: false, isWelfare: false, accountCategoryId: null, enabled: true,
  },
  {
    id: 'I04', code: 'I04', nameTh: 'โบนัส', nameEn: 'Bonus',
    revenueCategory: '40(1)', rounding: 'nearest',
    payOnce: true, payoutScope: 'every-period', calcByActualWorkdays: false,
    taxable: true, links: { ...emptyLinks() },
    offCycle: false, carryPrevPeriod: false, isWelfare: false, accountCategoryId: null, enabled: true,
  },
  {
    id: 'I05', code: 'I05', nameTh: 'ค่ากะ', nameEn: 'Shift Allowance',
    revenueCategory: '40(1)', rounding: 'nearest',
    payOnce: false, payoutScope: 'end-of-month-only', calcByActualWorkdays: false,
    taxable: true, links: { ...emptyLinks() },
    offCycle: false, carryPrevPeriod: false, isWelfare: true, accountCategoryId: null, enabled: true,
  },
  {
    id: 'I06', code: 'I06', nameTh: 'เบี้ยขยัน', nameEn: 'Diligence Allowance',
    revenueCategory: '40(1)', rounding: 'nearest',
    payOnce: true, payoutScope: 'end-of-month-only', calcByActualWorkdays: false,
    taxable: true, links: { ...emptyLinks() },
    offCycle: false, carryPrevPeriod: false, isWelfare: true, accountCategoryId: null, enabled: true,
  },
];

export const DEDUCTION_ITEM_SEED: DeductionItem[] = [
  {
    id: 'D01', code: 'D01', nameTh: 'ภาษีหัก ณ ที่จ่าย', nameEn: 'Withholding Tax',
    revenueCategory: '40(1)', rounding: 'nearest',
    payOnce: false, payoutScope: 'every-period',
    taxable: false, links: { sso: false, providentFund: false },
    offCycle: false, carryPrevPeriod: false, accountCategoryId: null, enabled: true,
  },
  {
    id: 'D02', code: 'D02', nameTh: 'หักประกันสังคม', nameEn: 'Social Security',
    revenueCategory: '40(1)', rounding: 'nearest',
    payOnce: false, payoutScope: 'every-period',
    taxable: false, links: { sso: true, providentFund: false },
    offCycle: false, carryPrevPeriod: false, accountCategoryId: null, enabled: true,
  },
  {
    id: 'D03', code: 'D03', nameTh: 'กองทุนสำรองเลี้ยงชีพ', nameEn: 'Provident Fund',
    revenueCategory: '40(1)', rounding: 'nearest',
    payOnce: false, payoutScope: 'end-of-month-only',
    taxable: false, links: { sso: false, providentFund: true },
    offCycle: false, carryPrevPeriod: false, accountCategoryId: null, enabled: true,
  },
  {
    id: 'D04', code: 'D04', nameTh: 'หักสาย / ขาดงาน', nameEn: 'Late / Absence Deduction',
    revenueCategory: '40(1)', rounding: 'nearest',
    payOnce: false, payoutScope: 'end-of-month-only',
    taxable: false, links: { sso: false, providentFund: false },
    offCycle: false, carryPrevPeriod: false, accountCategoryId: null, enabled: true,
  },
  {
    id: 'D05', code: 'D05', nameTh: 'ลาไม่รับค่าจ้าง', nameEn: 'Unpaid Leave',
    revenueCategory: '40(1)', rounding: 'nearest',
    payOnce: false, payoutScope: 'end-of-month-only',
    taxable: false, links: { sso: false, providentFund: false },
    offCycle: false, carryPrevPeriod: false, accountCategoryId: null, enabled: true,
  },
];

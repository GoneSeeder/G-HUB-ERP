// 3.1 การตั้งค่าทั่วไป — singleton config per company.

export type PayrollDayAnchor = number | 'EOM'; // 1..28 หรือสิ้นเดือน
export type MoneyRounding = 'none' | 'nearest-baht';

export type PayrollGeneralConfig = {
  cycleStartDay: PayrollDayAnchor; // วันเริ่มรอบ เช่น 1
  cycleEndDay: PayrollDayAnchor;   // วันสิ้นรอบ เช่น 'EOM' หรือ 1 (ของเดือนถัดไป)
  ssoEmployeeRate: number;         // อัตราประกันสังคมพนักงาน (%)
  ssoEmployerRate: number;         // อัตราประกันสังคมนายจ้าง (%)
  ssoMonthlyWageFloor: number;     // ฐานค่าจ้างต่ำสุด SSO (บาท/เดือน) — ปัจจุบัน 1,650
  ssoMonthlyWageCap: number;       // ฐานค่าจ้างสูงสุด SSO (บาท/เดือน) — มีผล 1 ม.ค. 2569: 17,500
  ssoIncludeOT: boolean;           // รวม OT ในฐานคำนวณ SSO
  ssoIncludeBonus: boolean;        // รวมโบนัสในฐานคำนวณ SSO
  ssoIncludeWelfare: boolean;      // รวมเบี้ยเลี้ยง/ค่าตำแหน่งในฐานคำนวณ SSO
  currency: string;                // รหัสสกุลเงิน เช่น 'THB'
  moneyRounding: MoneyRounding;    // วิธีปัดเศษจำนวนเงิน
  preventWrongOtType: boolean;     // ป้องกันพนักงานเลือกโอทีผิดประเภท
};

export const PAYROLL_GENERAL_STORAGE_BASE = 'general';

export const PAYROLL_GENERAL_SEED: PayrollGeneralConfig = {
  cycleStartDay: 1,
  cycleEndDay: 'EOM',
  ssoEmployeeRate: 5,
  ssoEmployerRate: 5,
  ssoMonthlyWageFloor: 1650,
  ssoMonthlyWageCap: 17500,
  ssoIncludeOT: true,
  ssoIncludeBonus: true,
  ssoIncludeWelfare: true,
  currency: 'THB',
  moneyRounding: 'nearest-baht',
  preventWrongOtType: true,
};

export const CURRENCY_OPTIONS: { value: string; label: string }[] = [
  { value: 'THB', label: 'บาท (THB)' },
  { value: 'USD', label: 'ดอลลาร์สหรัฐ (USD)' },
  { value: 'EUR', label: 'ยูโร (EUR)' },
  { value: 'JPY', label: 'เยน (JPY)' },
  { value: 'CNY', label: 'หยวน (CNY)' },
];

export const MONEY_ROUNDING_OPTIONS: { value: MoneyRounding; label: string }[] = [
  { value: 'none', label: 'ไม่ปัดเศษ (ทศนิยม 2 ตำแหน่ง)' },
  { value: 'nearest-baht', label: 'ปัดเศษเป็นบาทเต็ม' },
];

// ปัดเศษจำนวนเงินตามโหมดที่เลือก — ใช้ร่วมกับ engine คำนวณเงินเดือนในอนาคต
// nearest-baht: 433.33 -> 433, 466.67 -> 467
export function roundMoney(amount: number, mode: MoneyRounding): number {
  if (mode === 'nearest-baht') return Math.round(amount);
  return Math.round(amount * 100) / 100;
}

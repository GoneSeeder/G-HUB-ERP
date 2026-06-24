// 3.3 กำหนดงวด — pay-period configs + generated 12-month period rows, per company.

import type { PayrollDayAnchor } from './payroll-general';

// เฟสนี้รองรับเฉพาะ 'monthly' (12 งวด) แต่เปิด union ไว้สำหรับ 24/52 ในอนาคต
export type PayFrequency = 'monthly';

export type PayPeriodConfig = {
  id: string;
  year: number;
  employmentTypeIds: string[];     // ประเภทการจ้างที่ใช้งวดนี้ (เลือกได้หลายประเภท)
  frequency: PayFrequency;         // งวดการจ่ายเงินเดือน*
  firstPeriodStart: string;        // วันที่เริ่มงวดแรกของปี* (ISO yyyy-mm-dd)
  payDayOfMonth: PayrollDayAnchor; // วันที่จ่าย (วันใด หรือ EOM)
  payNextMonth: boolean;           // true = จ่ายในเดือนถัดไป (เช่น งวด ม.ค. จ่าย ก.พ.)
  payBeforeIfHoliday: boolean;     // จ่ายวันก่อนหน้าถ้าตรงวันหยุด
  hasOffCycle: boolean;            // มีรายจ่ายที่คำนวณนอกงวด
  offCycleStart: string | null;    // เริ่มคำนวณนอกงวดตั้งแต่วันที่*
};

export type GeneratedPeriod = {
  id: string;
  configId: string;
  index: number;        // 1..12
  label: string;        // "งวดเดือนมกราคม 2026"
  periodStart: string;  // ISO
  periodEnd: string;    // ISO
  payDate: string;      // ISO (หลังเลื่อนวันหยุดแล้ว)
};

export const PAY_PERIOD_CONFIGS_STORAGE_BASE = 'pay-period-configs';
export const GENERATED_PERIODS_STORAGE_BASE = 'generated-periods';

export const PAY_FREQUENCY_OPTIONS: { value: PayFrequency; label: string }[] = [
  { value: 'monthly', label: 'รายเดือน (12 งวด/ปี)' },
];

const TH_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
];

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function iso(y: number, m0: number, d: number): string {
  return `${y}-${pad(m0 + 1)}-${pad(d)}`;
}

function lastDayOfMonth(y: number, m0: number): number {
  return new Date(y, m0 + 1, 0).getDate();
}

function resolveDay(anchor: PayrollDayAnchor, y: number, m0: number): number {
  const last = lastDayOfMonth(y, m0);
  if (anchor === 'EOM') return last;
  return Math.min(anchor, last);
}

// เลื่อนวันจ่ายย้อนหลังถ้าตรงวันเสาร์/อาทิตย์/วันหยุด
function shiftBeforeHoliday(y: number, m0: number, d: number, holidayDates: Set<string>): string {
  const date = new Date(y, m0, d);
  for (let guard = 0; guard < 31; guard += 1) {
    const dow = date.getDay(); // 0 = อาทิตย์, 6 = เสาร์
    const key = iso(date.getFullYear(), date.getMonth(), date.getDate());
    if (dow !== 0 && dow !== 6 && !holidayDates.has(key)) break;
    date.setDate(date.getDate() - 1);
  }
  return iso(date.getFullYear(), date.getMonth(), date.getDate());
}

// สร้างงวดรายเดือนทั้ง 12 งวดของปี (pure, idempotent ตาม config.id + year)
export function generatePeriods(
  config: PayPeriodConfig,
  cycle: { cycleStartDay: PayrollDayAnchor; cycleEndDay: PayrollDayAnchor },
  holidayDates: Set<string>,
): GeneratedPeriod[] {
  const { year } = config;
  const periods: GeneratedPeriod[] = [];

  for (let m = 0; m < 12; m += 1) {
    const startDay = resolveDay(cycle.cycleStartDay, year, m);
    const periodStart = iso(year, m, startDay);

    // กรณีวันสิ้นรอบน้อยกว่าวันเริ่มรอบ (เช่น 2 -> 1) งวดจะข้ามไปจบต้นเดือนถัดไป
    let endY = year;
    let endM = m;
    if (
      cycle.cycleEndDay !== 'EOM' &&
      typeof cycle.cycleStartDay === 'number' &&
      cycle.cycleEndDay <= cycle.cycleStartDay
    ) {
      endM = m + 1;
      if (endM > 11) {
        endM = 0;
        endY = year + 1;
      }
    }
    const endDay = resolveDay(cycle.cycleEndDay, endY, endM);
    const periodEnd = iso(endY, endM, endDay);

    // วันจ่ายอาจอยู่ในเดือนเดียวกันหรือเดือนถัดไป
    const payM0 = config.payNextMonth ? (m + 1 > 11 ? 0 : m + 1) : m;
    const payY = config.payNextMonth && m === 11 ? year + 1 : year;
    const payDay = resolveDay(config.payDayOfMonth, payY, payM0);
    const payDate = config.payBeforeIfHoliday
      ? shiftBeforeHoliday(payY, payM0, payDay, holidayDates)
      : iso(payY, payM0, payDay);

    periods.push({
      id: `${config.id}-${year}-${pad(m + 1)}`,
      configId: config.id,
      index: m + 1,
      label: `งวดเดือน${TH_MONTHS[m]} ${year}`,
      periodStart,
      periodEnd,
      payDate,
    });
  }

  return periods;
}

// Mock data for the "เงินเดือน" (Payroll runs) presentation page — apps/frontend
// components/humansource/hr-payroll-runs.tsx. UI-only mock, not wired to the backend.

export type PayrollRunStatus = 'pending' | 'done';

export type PayrollRunSlot = {
  payDate: string;      // e.g. "27 กุมภาพันธ์ 2569"
  rangeStart: string;   // e.g. "1"
  rangeEnd: string;     // e.g. "28 กุมภาพันธ์ 2569"
  chips: string[];      // employment-type or employee-name chips
};

export type PayrollRun = {
  id: string;
  periodNo: number;
  monthLabel: string;   // e.g. "กุมภาพันธ์ 2569"
  company: string;
  year: string;         // พ.ศ.
  status: PayrollRunStatus;
  slots: PayrollRunSlot[];
  netAmount: number;
  employeeCount: number;
  newCount: number;
  leftCount: number;
};

const MONTHS_TH = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
];

function lastDayOfMonth(monthIndex: number, yearCe: number) {
  return new Date(yearCe, monthIndex + 1, 0).getDate();
}

export const PAYROLL_RUNS: PayrollRun[] = Array.from({ length: 11 }, (_, i) => {
  const monthIndex = i + 1; // period 2 = February .. period 12 = December
  const yearBe = '2569';
  const yearCe = 2026;
  const lastDay = lastDayOfMonth(monthIndex, yearCe);
  const monthLabel = `${MONTHS_TH[monthIndex]} ${yearBe}`;

  return {
    id: `PR-${yearBe}-${String(monthIndex + 1).padStart(2, '0')}`,
    periodNo: monthIndex + 1,
    monthLabel,
    company: 'G-HUB Enterprise',
    year: yearBe,
    status: 'pending',
    slots: [
      {
        payDate: `${lastDay - 1} ${monthLabel}`,
        rangeStart: '1',
        rangeEnd: `${lastDay} ${monthLabel}`,
        chips: ['ติดงาน', 'รายเดือน', 'รายชั่วโมง', 'รายวัน'],
      },
      {
        payDate: `${lastDay} ${monthLabel}`,
        rangeStart: '1',
        rangeEnd: `${lastDay} ${monthLabel}`,
        chips: ['พิมพ์ภา ไพศาล'],
      },
    ],
    netAmount: 3820000 + monthIndex * 15000,
    employeeCount: 5,
    newCount: 0,
    leftCount: 0,
  };
});

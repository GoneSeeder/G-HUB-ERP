export const CUSTOM_SHIFTS_STORAGE_KEY = 'g-hub.hr.custom-shifts';

export type HrShiftGroupKey = 'same-day' | 'overnight' | 'total-hours' | 'combined';

export type HrShiftRow = {
  id: string;
  enabled: boolean;
  code: string;
  name: string;
  type: string;
  time: string;
  company: string;
  updatedBy: string;
  updatedAt: string;
  groupKey: HrShiftGroupKey;
  description?: string;
  timezone?: string;
  color?: string;
  attendanceRule?: string;
  flexibleEntryEnabled?: boolean;
  flexibleMinutes?: number;
  minimumWorkHours?: number;
  trackBreak?: boolean;
  shiftAllowanceEnabled?: boolean;
  shiftAllowanceAmount?: number;
  prorateShiftAllowance?: boolean;
  holidayPremiumEnabled?: boolean;
  overtimePremiumEnabled?: boolean;
  effectiveDays?: string[];
};

export const BASE_SHIFT_GROUPS: Array<{ groupKey: HrShiftGroupKey; rows: HrShiftRow[] }> = [
  {
    groupKey: 'same-day',
    rows: [
      {
        id: 'WC001',
        enabled: true,
        code: 'WC001',
        name: 'สำนักงาน 08.30-17.30',
        type: 'กะปกติ',
        time: '08:30-12:00 / 13:00-17:30',
        company: 'ใช้กับทุกบริษัท',
        updatedBy: 'empeo Team',
        updatedAt: '10/06/2026 16:32',
        groupKey: 'same-day',
        color: '#8b5cf6',
      },
      {
        id: 'WC002',
        enabled: true,
        code: 'WC002',
        name: 'สำนักงานครึ่งวัน',
        type: 'กะพิเศษ',
        time: '08:30-12:00 / 13:00-15:00',
        company: 'G-HUB Enterprise',
        updatedBy: 'HR Admin',
        updatedAt: '10/06/2026 16:32',
        groupKey: 'same-day',
        color: '#ec4899',
      },
    ],
  },
  {
    groupKey: 'overnight',
    rows: [
      {
        id: 'WC003',
        enabled: true,
        code: 'WC003',
        name: 'กะดึก 22.00-06.00',
        type: 'กะข้ามวัน',
        time: '22:00-02:00 / 03:00-06:00',
        company: 'Operations',
        updatedBy: 'HR Admin',
        updatedAt: '10/06/2026 16:32',
        groupKey: 'overnight',
        color: '#f97316',
      },
    ],
  },
  {
    groupKey: 'total-hours',
    rows: [
      {
        id: 'WC004',
        enabled: false,
        code: 'WC004',
        name: 'ภาคสนาม 8 ชั่วโมง',
        type: 'ชั่วโมงรวม',
        time: 'ครบ 8 ชม. / พักยืดหยุ่น',
        company: 'ฝ่ายขาย',
        updatedBy: 'HR Admin',
        updatedAt: '10/06/2026 16:32',
        groupKey: 'total-hours',
        color: '#22d3ee',
      },
    ],
  },
  {
    groupKey: 'combined',
    rows: [
      {
        id: 'WC005',
        enabled: false,
        code: 'WC005',
        name: 'ควบเช้า-บ่าย',
        type: 'ควบกะ',
        time: '06:00-14:00 + 14:00-22:00',
        company: 'คลังสินค้า',
        updatedBy: 'HR Admin',
        updatedAt: '10/06/2026 16:32',
        groupKey: 'combined',
        color: '#06b6d4',
      },
    ],
  },
];

export const CANONICAL_SHIFT_GROUPS: Array<{ groupKey: HrShiftGroupKey; rows: HrShiftRow[] }> = [
  {
    groupKey: 'same-day',
    rows: [
      {
        id: 'WC001',
        enabled: true,
        code: 'S1',
        name: 'สำนักงาน 08.00-17.00',
        type: 'กะเช้า',
        time: '08:00-12:00 / 13:00-17:00',
        company: 'ใช้กับทุกบริษัท',
        updatedBy: 'empeo Team',
        updatedAt: '10/06/2026 16:32',
        groupKey: 'same-day',
        description: 'พนักงานออฟฟิศ',
        timezone: 'Asia/Bangkok (UTC+07:00)',
        color: '#bf5a5a',
        attendanceRule: 'ตามเวลาทำงานในกะ',
        flexibleEntryEnabled: false,
        flexibleMinutes: 0,
        minimumWorkHours: 8,
        trackBreak: true,
        shiftAllowanceEnabled: false,
        shiftAllowanceAmount: 0,
        prorateShiftAllowance: true,
        holidayPremiumEnabled: false,
        overtimePremiumEnabled: false,
      },
      {
        id: 'WC002',
        enabled: true,
        code: 'S2',
        name: 'กะเช้า 06.00-14.00',
        type: 'กะเช้า',
        time: '06:00-10:00 / 10:30-14:00',
        company: 'ใช้กับทุกบริษัท',
        updatedBy: 'empeo Team',
        updatedAt: '10/06/2026 16:32',
        groupKey: 'same-day',
        description: 'พนักงานกะเช้า',
        timezone: 'Asia/Bangkok (UTC+07:00)',
        color: '#3b82f6',
        attendanceRule: 'ตามเวลาทำงานในกะ',
        flexibleEntryEnabled: false,
        flexibleMinutes: 0,
        minimumWorkHours: 8,
        trackBreak: true,
        shiftAllowanceEnabled: false,
        shiftAllowanceAmount: 0,
        prorateShiftAllowance: true,
        holidayPremiumEnabled: false,
        overtimePremiumEnabled: false,
      },
    ],
  },
  {
    groupKey: 'overnight',
    rows: [
      {
        id: 'WC003',
        enabled: true,
        code: 'S3',
        name: 'กะบ่าย 14.00-22.00',
        type: 'กะบ่าย',
        time: '14:00-18:00 / 18:30-22:00',
        company: 'ใช้กับทุกบริษัท',
        updatedBy: 'empeo Team',
        updatedAt: '10/06/2026 16:32',
        groupKey: 'overnight',
        description: 'พนักงานกะบ่าย',
        timezone: 'Asia/Bangkok (UTC+07:00)',
        color: '#f97316',
        attendanceRule: 'ตามเวลาทำงานในกะ',
        flexibleEntryEnabled: false,
        flexibleMinutes: 0,
        minimumWorkHours: 8,
        trackBreak: true,
        shiftAllowanceEnabled: false,
        shiftAllowanceAmount: 0,
        prorateShiftAllowance: true,
        holidayPremiumEnabled: false,
        overtimePremiumEnabled: false,
      },
    ],
  },
  {
    groupKey: 'total-hours',
    rows: [
      {
        id: 'WC004',
        enabled: true,
        code: 'S4',
        name: 'กะดึก 22.00-06.00',
        type: 'กะดึก',
        time: '22:00-02:00 / 02:30-06:00',
        company: 'ใช้กับทุกบริษัท',
        updatedBy: 'empeo Team',
        updatedAt: '10/06/2026 16:32',
        groupKey: 'total-hours',
        description: 'พนักงานกะดึก',
        timezone: 'Asia/Bangkok (UTC+07:00)',
        color: '#334155',
        attendanceRule: 'ตามเวลาทำงานในกะ',
        flexibleEntryEnabled: false,
        flexibleMinutes: 0,
        minimumWorkHours: 8,
        trackBreak: true,
        shiftAllowanceEnabled: false,
        shiftAllowanceAmount: 0,
        prorateShiftAllowance: true,
        holidayPremiumEnabled: false,
        overtimePremiumEnabled: false,
      },
    ],
  },
  { groupKey: 'combined', rows: [] },
];

export function readCustomShifts(): HrShiftRow[] {
  if (typeof window === 'undefined') return [];

  try {
    const saved = window.localStorage.getItem(CUSTOM_SHIFTS_STORAGE_KEY);
    if (!saved) return [];
    const parsed = JSON.parse(saved) as HrShiftRow[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    window.localStorage.removeItem(CUSTOM_SHIFTS_STORAGE_KEY);
    return [];
  }
}

export function getShiftGroups(customShifts: HrShiftRow[] = []) {
  return CANONICAL_SHIFT_GROUPS.map((group) => ({
    ...group,
    rows: [...group.rows, ...customShifts.filter((shift) => shift.groupKey === group.groupKey)],
  }));
}

export function getAllShifts(customShifts: HrShiftRow[] = []) {
  return getShiftGroups(customShifts).flatMap((group) => group.rows);
}

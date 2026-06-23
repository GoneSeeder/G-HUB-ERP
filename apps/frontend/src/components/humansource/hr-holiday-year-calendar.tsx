'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { CalendarIcon, PlusIcon, TrashIcon, XIcon } from '@/components/ui/icons';
import { DatePicker } from '@/components/ui/date-picker';
import { HrCustomSelect } from './hr-ui';

type HolidayType = 'company' | 'announcement';

type HolidaySource = 'google' | 'seed' | 'custom';

type HolidayEntry = {
  id: string;
  date: string;
  title: string;
  type: HolidayType;
  country: string;
  appliesTo: string;
  description: string;
  source: HolidaySource;
};

type OfficialOverride = {
  date?: string;
  title?: string;
  description?: string;
  type?: HolidayType;
  deleted?: boolean;
};

type HoverTip = {
  date: string;
  holidays: HolidayEntry[];
  left: number;                  // clamped card left edge (viewport px)
  top: number;                   // card anchor top (viewport px)
  arrowLeft: number;             // arrow x within the card, points at the cell
  placement: 'above' | 'below';
  pinned: boolean;
};

type HolidayCalendar = {
  id: string;
  name: string;
  color: string;
  // Only the default calendar pulls from Google. Extra calendars are user-managed.
  isDefault?: boolean;
};

const DEFAULT_CALENDAR_ID = 'default';
const CUSTOM_STORAGE_KEY = 'g-hub.hr.holiday-custom';
const OVERRIDE_STORAGE_KEY = 'g-hub.hr.holiday-overrides';
const CALENDARS_STORAGE_KEY = 'g-hub.hr.holiday-calendars';
const ACTIVE_CALENDAR_STORAGE_KEY = 'g-hub.hr.holiday-active-calendar';

const CALENDAR_COLORS = ['#ef4444', '#f97316', '#f59e0b', '#10b981', '#0ea5e9', '#6366f1', '#a855f7', '#ec4899'];

type SeedType = 'none' | 'official' | 'private';

// Thai private-sector statutory holidays (min. 13 days under Labour Protection Act).
// Differs from government calendar: includes วันแรงงาน (May 1), excludes some public-service-only days.
// Buddhist holidays are fixed per year; fixed-date ones repeat annually.
const PRIVATE_SECTOR_SEED: Record<number, Omit<HolidayEntry, 'id'>[]> = {
  2026: [
    { date: '2026-01-01', title: 'วันขึ้นปีใหม่', type: 'announcement', country: 'TH', appliesTo: 'all', description: 'วันขึ้นปีใหม่', source: 'seed' },
    { date: '2026-03-03', title: 'วันมาฆบูชา', type: 'announcement', country: 'TH', appliesTo: 'all', description: 'วันเพ็ญขึ้น 15 ค่ำ เดือน 3', source: 'seed' },
    { date: '2026-04-06', title: 'วันจักรี', type: 'announcement', country: 'TH', appliesTo: 'all', description: 'วันระลึกพระบาทสมเด็จพระพุทธยอดฟ้าจุฬาโลก', source: 'seed' },
    { date: '2026-04-13', title: 'วันสงกรานต์ (มหาสงกรานต์)', type: 'company', country: 'TH', appliesTo: 'all', description: 'วันสงกรานต์', source: 'seed' },
    { date: '2026-04-14', title: 'วันสงกรานต์ (วันเนา)', type: 'company', country: 'TH', appliesTo: 'all', description: 'วันสงกรานต์', source: 'seed' },
    { date: '2026-04-15', title: 'วันสงกรานต์ (วันพระร่วง)', type: 'company', country: 'TH', appliesTo: 'all', description: 'วันสงกรานต์', source: 'seed' },
    { date: '2026-05-01', title: 'วันแรงงานแห่งชาติ', type: 'announcement', country: 'TH', appliesTo: 'all', description: 'วันหยุดนักขัตฤกษ์เฉพาะภาคเอกชนตาม พ.ร.บ. คุ้มครองแรงงาน มาตรา 29', source: 'seed' },
    { date: '2026-05-04', title: 'วันฉัตรมงคล', type: 'announcement', country: 'TH', appliesTo: 'all', description: 'วันพระราชพิธีบรมราชาภิเษก รัชกาลที่ 10', source: 'seed' },
    { date: '2026-05-31', title: 'วันวิสาขบูชา', type: 'announcement', country: 'TH', appliesTo: 'all', description: 'วันเพ็ญขึ้น 15 ค่ำ เดือน 6', source: 'seed' },
    { date: '2026-07-28', title: 'วันเฉลิมพระชนมพรรษา รัชกาลที่ 10', type: 'announcement', country: 'TH', appliesTo: 'all', description: 'วันเฉลิมพระชนมพรรษาพระบาทสมเด็จพระเจ้าอยู่หัว', source: 'seed' },
    { date: '2026-07-30', title: 'วันอาสาฬหบูชา', type: 'announcement', country: 'TH', appliesTo: 'all', description: 'วันเพ็ญขึ้น 15 ค่ำ เดือน 8', source: 'seed' },
    { date: '2026-07-31', title: 'วันเข้าพรรษา', type: 'company', country: 'TH', appliesTo: 'all', description: 'วันแรม 1 ค่ำ เดือน 8', source: 'seed' },
    { date: '2026-08-12', title: 'วันแม่แห่งชาติ', type: 'announcement', country: 'TH', appliesTo: 'all', description: 'วันเฉลิมพระชนมพรรษา สมเด็จพระบรมราชชนนีพันปีหลวง', source: 'seed' },
    { date: '2026-10-23', title: 'วันปิยมหาราช', type: 'announcement', country: 'TH', appliesTo: 'all', description: 'วันคล้ายวันสวรรคต รัชกาลที่ 5', source: 'seed' },
    { date: '2026-12-05', title: 'วันพ่อแห่งชาติ', type: 'announcement', country: 'TH', appliesTo: 'all', description: 'วันคล้ายวันพระบรมราชสมภพ รัชกาลที่ 9', source: 'seed' },
    { date: '2026-12-10', title: 'วันรัฐธรรมนูญ', type: 'announcement', country: 'TH', appliesTo: 'all', description: 'วันพระราชทานรัฐธรรมนูญ พ.ศ. 2475', source: 'seed' },
    { date: '2026-12-31', title: 'วันสิ้นปี', type: 'company', country: 'TH', appliesTo: 'all', description: 'วันสิ้นสุดปีปฏิทิน', source: 'seed' },
  ],
  2027: [
    { date: '2027-01-01', title: 'วันขึ้นปีใหม่', type: 'announcement', country: 'TH', appliesTo: 'all', description: 'วันขึ้นปีใหม่', source: 'seed' },
    { date: '2027-02-21', title: 'วันมาฆบูชา', type: 'announcement', country: 'TH', appliesTo: 'all', description: 'วันเพ็ญขึ้น 15 ค่ำ เดือน 3', source: 'seed' },
    { date: '2027-04-06', title: 'วันจักรี', type: 'announcement', country: 'TH', appliesTo: 'all', description: 'วันระลึกพระบาทสมเด็จพระพุทธยอดฟ้าจุฬาโลก', source: 'seed' },
    { date: '2027-04-13', title: 'วันสงกรานต์ (มหาสงกรานต์)', type: 'company', country: 'TH', appliesTo: 'all', description: 'วันสงกรานต์', source: 'seed' },
    { date: '2027-04-14', title: 'วันสงกรานต์ (วันเนา)', type: 'company', country: 'TH', appliesTo: 'all', description: 'วันสงกรานต์', source: 'seed' },
    { date: '2027-04-15', title: 'วันสงกรานต์ (วันพระร่วง)', type: 'company', country: 'TH', appliesTo: 'all', description: 'วันสงกรานต์', source: 'seed' },
    { date: '2027-05-01', title: 'วันแรงงานแห่งชาติ', type: 'announcement', country: 'TH', appliesTo: 'all', description: 'วันหยุดนักขัตฤกษ์เฉพาะภาคเอกชนตาม พ.ร.บ. คุ้มครองแรงงาน มาตรา 29', source: 'seed' },
    { date: '2027-05-04', title: 'วันฉัตรมงคล', type: 'announcement', country: 'TH', appliesTo: 'all', description: 'วันพระราชพิธีบรมราชาภิเษก รัชกาลที่ 10', source: 'seed' },
    { date: '2027-05-20', title: 'วันวิสาขบูชา', type: 'announcement', country: 'TH', appliesTo: 'all', description: 'วันเพ็ญขึ้น 15 ค่ำ เดือน 6', source: 'seed' },
    { date: '2027-07-19', title: 'วันอาสาฬหบูชา', type: 'announcement', country: 'TH', appliesTo: 'all', description: 'วันเพ็ญขึ้น 15 ค่ำ เดือน 8', source: 'seed' },
    { date: '2027-07-20', title: 'วันเข้าพรรษา', type: 'company', country: 'TH', appliesTo: 'all', description: 'วันแรม 1 ค่ำ เดือน 8', source: 'seed' },
    { date: '2027-07-28', title: 'วันเฉลิมพระชนมพรรษา รัชกาลที่ 10', type: 'announcement', country: 'TH', appliesTo: 'all', description: 'วันเฉลิมพระชนมพรรษาพระบาทสมเด็จพระเจ้าอยู่หัว', source: 'seed' },
    { date: '2027-08-12', title: 'วันแม่แห่งชาติ', type: 'announcement', country: 'TH', appliesTo: 'all', description: 'วันเฉลิมพระชนมพรรษา สมเด็จพระบรมราชชนนีพันปีหลวง', source: 'seed' },
    { date: '2027-10-23', title: 'วันปิยมหาราช', type: 'announcement', country: 'TH', appliesTo: 'all', description: 'วันคล้ายวันสวรรคต รัชกาลที่ 5', source: 'seed' },
    { date: '2027-12-05', title: 'วันพ่อแห่งชาติ', type: 'announcement', country: 'TH', appliesTo: 'all', description: 'วันคล้ายวันพระบรมราชสมภพ รัชกาลที่ 9', source: 'seed' },
    { date: '2027-12-10', title: 'วันรัฐธรรมนูญ', type: 'announcement', country: 'TH', appliesTo: 'all', description: 'วันพระราชทานรัฐธรรมนูญ พ.ศ. 2475', source: 'seed' },
    { date: '2027-12-31', title: 'วันสิ้นปี', type: 'company', country: 'TH', appliesTo: 'all', description: 'วันสิ้นสุดปีปฏิทิน', source: 'seed' },
  ],
};

const DEFAULT_CALENDARS: HolidayCalendar[] = [
  { id: DEFAULT_CALENDAR_ID, name: 'วันหยุด', color: '#ef4444', isDefault: true },
];

const MONTHS = [
  'มกราคม',
  'กุมภาพันธ์',
  'มีนาคม',
  'เมษายน',
  'พฤษภาคม',
  'มิถุนายน',
  'กรกฎาคม',
  'สิงหาคม',
  'กันยายน',
  'ตุลาคม',
  'พฤศจิกายน',
  'ธันวาคม',
];

const WEEKDAYS = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

const TYPE_META: Record<HolidayType, { label: string; color: string; soft: string }> = {
  company: { label: 'วันหยุดบริษัท', color: '#2563eb', soft: '#dbeafe' },
  announcement: { label: 'วันหยุดตามประกาศ', color: '#dc2626', soft: '#fee2e2' },
};

function formatDateKey(year: number, monthIndex: number, day: number) {
  const date = new Date(year, monthIndex, day);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function getDateParts(date: string) {
  const [year, month, day] = date.split('-').map(Number);
  return { year, monthIndex: month - 1, day };
}

function getMonthCells(year: number, monthIndex: number) {
  const firstDay = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const previousMonthDays = new Date(year, monthIndex, 0).getDate();
  const cells: Array<{ date: string; day: number; muted: boolean }> = [];

  for (let index = firstDay - 1; index >= 0; index -= 1) {
    const day = previousMonthDays - index;
    cells.push({ date: formatDateKey(year, monthIndex - 1, day), day, muted: true });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({ date: formatDateKey(year, monthIndex, day), day, muted: false });
  }

  const trailing = 42 - cells.length;
  for (let day = 1; day <= trailing; day += 1) {
    cells.push({ date: formatDateKey(year, monthIndex + 1, day), day, muted: true });
  }

  return cells;
}

function formatLongDate(date: string) {
  const { year, monthIndex, day } = getDateParts(date);
  return new Intl.DateTimeFormat('th-TH-u-ca-buddhist', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, monthIndex, day));
}

function isoToDatePickerValue(date: string) {
  const [year, month, day] = date.split('-');
  if (!year || !month || !day) return '';
  return `${day}/${month}/${year}`;
}

function datePickerValueToIso(value: string, fallbackYear: number) {
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;

  const day = Number(match[1]);
  const month = Number(match[2]);
  const enteredYear = Number(match[3]);
  const parsedYear = enteredYear >= 2400 ? enteredYear - 543 : enteredYear;
  if (parsedYear !== fallbackYear) return null;

  const date = new Date(parsedYear, month - 1, day);
  if (date.getFullYear() !== parsedYear || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return formatDateKey(parsedYear, month - 1, day);
}

export function HolidayYearCalendar({ accent }: { accent: string }) {
  const currentYear = new Date().getFullYear();
  const availableYears = useMemo(() => [currentYear, currentYear + 1], [currentYear]);
  const [officialHolidayYears, setOfficialHolidayYears] = useState<Record<number, HolidayEntry[]>>({});
  // calendarId → year → custom holidays for that calendar
  const [customHolidayYears, setCustomHolidayYears] = useState<Record<string, Record<number, HolidayEntry[]>>>({});
  const [officialOverrides, setOfficialOverrides] = useState<Record<string, OfficialOverride>>({});
  const [calendars, setCalendars] = useState<HolidayCalendar[]>(DEFAULT_CALENDARS);
  const [activeCalendarId, setActiveCalendarId] = useState<string>(DEFAULT_CALENDAR_ID);
  const [hydrated, setHydrated] = useState(false);
  const [showCreateCalendar, setShowCreateCalendar] = useState(false);
  const [newCalendarName, setNewCalendarName] = useState('');
  const [newCalendarColor, setNewCalendarColor] = useState(CALENDAR_COLORS[1]);
  const [newCalendarError, setNewCalendarError] = useState('');
  const [newCalendarSeedType, setNewCalendarSeedType] = useState<SeedType>('none');
  const [confirmDeleteCalendar, setConfirmDeleteCalendar] = useState<HolidayCalendar | null>(null);
  const [selectedYear, setSelectedYear] = useState(String(currentYear));
  const [modalOpen, setModalOpen] = useState(false);
  const [editingHolidayId, setEditingHolidayId] = useState<string | null>(null);
  const [formDate, setFormDate] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formType, setFormType] = useState<HolidayType>('company');
  const [formDescription, setFormDescription] = useState('');
  const [formErrors, setFormErrors] = useState<{ title?: string; date?: string }>({});
  const [confirmDelete, setConfirmDelete] = useState<HolidayEntry | null>(null);
  const [tip, setTip] = useState<HoverTip | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const year = Number(selectedYear);

  const isDefaultCalendar = activeCalendarId === DEFAULT_CALENDAR_ID;

  const officialWithOverrides = useMemo(() => {
    if (!isDefaultCalendar) return [];
    const list = officialHolidayYears[year] ?? [];
    return list
      .map((holiday) => {
        const patch = officialOverrides[holiday.id];
        if (!patch) return holiday;
        if (patch.deleted) return null;
        return {
          ...holiday,
          date: patch.date ?? holiday.date,
          title: patch.title ?? holiday.title,
          description: patch.description ?? holiday.description,
          type: patch.type ?? holiday.type,
        };
      })
      .filter((holiday): holiday is HolidayEntry => Boolean(holiday));
  }, [officialHolidayYears, officialOverrides, year, isDefaultCalendar]);

  const holidays = useMemo(() => {
    const customForActive = customHolidayYears[activeCalendarId]?.[year] ?? [];
    return [...officialWithOverrides, ...customForActive].sort((a, b) => a.date.localeCompare(b.date));
  }, [officialWithOverrides, customHolidayYears, activeCalendarId, year]);

  // Count holidays per calendar (for cards). Default = official+overrides+custom; others = custom only.
  const calendarCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const calendar of calendars) {
      if (calendar.id === DEFAULT_CALENDAR_ID) {
        const list = officialHolidayYears[year] ?? [];
        const visible = list.filter((holiday) => !officialOverrides[holiday.id]?.deleted).length;
        counts[calendar.id] = visible + (customHolidayYears[calendar.id]?.[year]?.length ?? 0);
      } else {
        counts[calendar.id] = customHolidayYears[calendar.id]?.[year]?.length ?? 0;
      }
    }
    return counts;
  }, [calendars, officialHolidayYears, officialOverrides, customHolidayYears, year]);

  const holidaysByDate = holidays.reduce<Record<string, HolidayEntry[]>>((acc, holiday) => {
    acc[holiday.date] = [...(acc[holiday.date] ?? []), holiday];
    return acc;
  }, {});
  const yearOptions = availableYears.map((item) => ({ value: String(item), label: String(item + 543) }));

  // Deleted official holidays (only meaningful for the default calendar).
  const deletedOfficials = useMemo(() => {
    if (!isDefaultCalendar) return [];
    const list = officialHolidayYears[year] ?? [];
    return list.filter((holiday) => officialOverrides[holiday.id]?.deleted);
  }, [isDefaultCalendar, officialHolidayYears, officialOverrides, year]);
  const [showTrash, setShowTrash] = useState(false);

  // Hydrate persisted state from localStorage once on mount.
  useEffect(() => {
    try {
      const customRaw = window.localStorage.getItem(CUSTOM_STORAGE_KEY);
      if (customRaw) {
        const parsed = JSON.parse(customRaw) as unknown;
        // Migrate legacy shape (Record<year, HolidayEntry[]>) → new shape keyed by calendar id.
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          const firstKey = Object.keys(parsed)[0];
          if (firstKey && /^\d+$/.test(firstKey)) {
            setCustomHolidayYears({ [DEFAULT_CALENDAR_ID]: parsed as Record<number, HolidayEntry[]> });
          } else {
            setCustomHolidayYears(parsed as Record<string, Record<number, HolidayEntry[]>>);
          }
        }
      }
      const overrideRaw = window.localStorage.getItem(OVERRIDE_STORAGE_KEY);
      if (overrideRaw) setOfficialOverrides(JSON.parse(overrideRaw));
      const calendarsRaw = window.localStorage.getItem(CALENDARS_STORAGE_KEY);
      if (calendarsRaw) {
        const parsed = JSON.parse(calendarsRaw) as HolidayCalendar[];
        // Make sure the default calendar is always present.
        const hasDefault = parsed.some((calendar) => calendar.id === DEFAULT_CALENDAR_ID);
        setCalendars(hasDefault ? parsed : [DEFAULT_CALENDARS[0], ...parsed]);
      }
      const activeRaw = window.localStorage.getItem(ACTIVE_CALENDAR_STORAGE_KEY);
      if (activeRaw) setActiveCalendarId(activeRaw);
    } catch {
      window.localStorage.removeItem(CUSTOM_STORAGE_KEY);
      window.localStorage.removeItem(OVERRIDE_STORAGE_KEY);
      window.localStorage.removeItem(CALENDARS_STORAGE_KEY);
      window.localStorage.removeItem(ACTIVE_CALENDAR_STORAGE_KEY);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(CUSTOM_STORAGE_KEY, JSON.stringify(customHolidayYears));
  }, [customHolidayYears, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(OVERRIDE_STORAGE_KEY, JSON.stringify(officialOverrides));
  }, [officialOverrides, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(CALENDARS_STORAGE_KEY, JSON.stringify(calendars));
  }, [calendars, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(ACTIVE_CALENDAR_STORAGE_KEY, activeCalendarId);
  }, [activeCalendarId, hydrated]);

  // Close pinned hover card on outside-click or Escape.
  useEffect(() => {
    if (!tip?.pinned) return;
    const closeOnOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target?.closest('.hr-holiday-day') && !target?.closest('.hr-holiday-hover-card')) {
        setTip(null);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setTip(null);
    };
    document.addEventListener('mousedown', closeOnOutside);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutside);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [tip?.pinned]);

  useEffect(() => {
    const controller = new AbortController();

    const loadYear = async (targetYear: number) => {
      try {
        const response = await fetch(`/api/hr/thailand-holidays?year=${targetYear}`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(`โหลดข้อมูลไม่สำเร็จ (${response.status})`);
        const data = (await response.json()) as { holidays?: HolidayEntry[]; error?: string };
        if (data.error) throw new Error(data.error);

        setOfficialHolidayYears((current) => ({ ...current, [targetYear]: data.holidays ?? [] }));
      } catch (error) {
        if ((error as Error).name === 'AbortError') return;
        setOfficialHolidayYears((current) => ({ ...current, [targetYear]: current[targetYear] ?? [] }));
      }
    };

    availableYears.forEach((targetYear) => {
      void loadYear(targetYear);
    });

    return () => controller.abort();
  }, [availableYears]);

  const openAddHoliday = () => {
    setEditingHolidayId(null);
    setFormDate('');
    setFormTitle('');
    setFormType('company');
    setFormDescription('');
    setFormErrors({});
    setModalOpen(true);
  };

  // Build a portal tooltip anchored to a day-cell rect. Prefer rendering above the
  // cell (the arrow points down). Flip below only when there isn't room above the
  // sticky page header, and clamp horizontally so corner cells never overflow the
  // viewport — the arrow tracks the cell center so it still points at the right day.
  const CARD_W = 256; // 16rem
  const computeTip = (
    date: string,
    holidays: HolidayEntry[],
    rect: DOMRect,
    pinned: boolean,
  ): HoverTip => {
    const MARGIN = 8;
    const SAFE_TOP = 64; // page header height (h-14 = 56px) + small margin
    const estHeight = 52 + holidays.length * 78;
    const placement: 'above' | 'below' =
      rect.top - estHeight - MARGIN < SAFE_TOP ? 'below' : 'above';
    const centerX = rect.left + rect.width / 2;
    const left = Math.max(
      MARGIN,
      Math.min(centerX - CARD_W / 2, window.innerWidth - CARD_W - MARGIN),
    );
    const arrowLeft = centerX - left;
    const top = placement === 'above' ? rect.top - MARGIN : rect.bottom + MARGIN;
    return { date, holidays, left, top, arrowLeft, placement, pinned };
  };

  const openEditHoliday = (holiday: HolidayEntry) => {
    setEditingHolidayId(holiday.id);
    setFormDate(holiday.date);
    setFormTitle(holiday.title);
    setFormType(holiday.type);
    setFormDescription(holiday.description);
    setFormErrors({});
    setModalOpen(true);
    setTip(null);
  };

  const deleteHoliday = (holidayId: string) => {
    const officialList = isDefaultCalendar ? officialHolidayYears[year] ?? [] : [];
    const isOfficial = officialList.some((holiday) => holiday.id === holidayId);
    if (isOfficial) {
      setOfficialOverrides((current) => ({
        ...current,
        [holidayId]: { ...(current[holidayId] ?? {}), deleted: true },
      }));
    } else {
      setCustomHolidayYears((current) => {
        const calendarMap = current[activeCalendarId] ?? {};
        return {
          ...current,
          [activeCalendarId]: {
            ...calendarMap,
            [year]: (calendarMap[year] ?? []).filter((holiday) => holiday.id !== holidayId),
          },
        };
      });
    }
    if (editingHolidayId === holidayId) {
      setEditingHolidayId(null);
      setModalOpen(false);
    }
  };

  const resetOfficialHoliday = (holidayId: string) => {
    setOfficialOverrides((current) => {
      const next = { ...current };
      delete next[holidayId];
      return next;
    });
  };

  const saveHoliday = () => {
    const title = formTitle.trim();
    const errors: { title?: string; date?: string } = {};
    if (!title) errors.title = 'กรุณาระบุชื่อวันหยุด';
    if (!formDate) errors.date = 'กรุณาเลือกวันที่';
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const targetDate = formDate;
    const description = formDescription.trim();
    const officialList = isDefaultCalendar ? officialHolidayYears[year] ?? [] : [];
    const editingOfficial = editingHolidayId
      ? officialList.find((holiday) => holiday.id === editingHolidayId)
      : undefined;

    if (editingOfficial) {
      setOfficialOverrides((current) => ({
        ...current,
        [editingOfficial.id]: {
          date: targetDate,
          title,
          description,
          type: formType,
        },
      }));
    } else {
      const nextHoliday: HolidayEntry = {
        id: editingHolidayId ?? `custom-${targetDate}-${Date.now()}`,
        date: targetDate,
        title,
        type: formType,
        country: 'Thailand',
        appliesTo: 'All Offices',
        description,
        source: 'custom',
      };
      setCustomHolidayYears((current) => {
        const calendarMap = current[activeCalendarId] ?? {};
        return {
          ...current,
          [activeCalendarId]: {
            ...calendarMap,
            [year]: [
              ...(calendarMap[year] ?? []).filter((holiday) => holiday.id !== editingHolidayId),
              nextHoliday,
            ].sort((a, b) => a.date.localeCompare(b.date)),
          },
        };
      });
    }
    setEditingHolidayId(null);
    setModalOpen(false);
    setTip(null);
  };

  const createCalendar = () => {
    const name = newCalendarName.trim();
    if (!name) {
      setNewCalendarError('กรุณาระบุชื่อปฏิทิน');
      return;
    }
    if (calendars.some((calendar) => calendar.name === name)) {
      setNewCalendarError('ชื่อปฏิทินนี้ถูกใช้งานแล้ว');
      return;
    }
    const id = `cal-${Date.now()}`;
    setCalendars((current) => [...current, { id, name, color: newCalendarColor }]);

    if (newCalendarSeedType === 'official') {
      const cloneByYear: Record<number, HolidayEntry[]> = {};
      for (const targetYear of availableYears) {
        const list = officialHolidayYears[targetYear] ?? [];
        const cloned: HolidayEntry[] = [];
        for (const holiday of list) {
          const patch = officialOverrides[holiday.id];
          if (patch?.deleted) continue;
          cloned.push({
            ...holiday,
            id: `custom-${id}-${holiday.id}`,
            date: patch?.date ?? holiday.date,
            title: patch?.title ?? holiday.title,
            description: patch?.description ?? holiday.description,
            type: patch?.type ?? holiday.type,
            source: 'custom',
          });
        }
        cloneByYear[targetYear] = cloned;
      }
      setCustomHolidayYears((current) => ({ ...current, [id]: cloneByYear }));
    } else if (newCalendarSeedType === 'private') {
      const cloneByYear: Record<number, HolidayEntry[]> = {};
      for (const targetYear of availableYears) {
        const list = PRIVATE_SECTOR_SEED[targetYear] ?? [];
        cloneByYear[targetYear] = list.map((entry, index) => ({
          ...entry,
          id: `private-${id}-${targetYear}-${index}`,
        }));
      }
      setCustomHolidayYears((current) => ({ ...current, [id]: cloneByYear }));
    }

    setActiveCalendarId(id);
    setShowCreateCalendar(false);
    setNewCalendarName('');
    setNewCalendarColor(CALENDAR_COLORS[1]);
    setNewCalendarError('');
    setNewCalendarSeedType('none');
  };

  const removeCalendar = (calendarId: string) => {
    if (calendarId === DEFAULT_CALENDAR_ID) return;
    setCalendars((current) => current.filter((calendar) => calendar.id !== calendarId));
    setCustomHolidayYears((current) => {
      const next = { ...current };
      delete next[calendarId];
      return next;
    });
    if (activeCalendarId === calendarId) setActiveCalendarId(DEFAULT_CALENDAR_ID);
  };

  return (
    <div className="hr-holiday-page">
      <div className="hr-holiday-toolbar-row">
      <div className="hr-holiday-calendars-row">
        {calendars.map((calendar) => {
          const isActive = calendar.id === activeCalendarId;
          const count = calendarCounts[calendar.id] ?? 0;
          return (
            <button
              key={calendar.id}
              type="button"
              onClick={() => setActiveCalendarId(calendar.id)}
              className={`hr-holiday-calendar-card ${isActive ? 'hr-holiday-calendar-card--active' : ''}`}
              style={isActive ? { borderColor: calendar.color } : undefined}
            >
              <span className="hr-holiday-calendar-card__icon" style={{ backgroundColor: calendar.color }}>
                <CalendarIcon className="h-4 w-4" />
              </span>
              <span className="hr-holiday-calendar-card__body">
                <span className="hr-holiday-calendar-card__title">{calendar.name}</span>
                <span className="hr-holiday-calendar-card__count">{count} วัน</span>
              </span>
              {!calendar.isDefault ? (
                <span
                  role="button"
                  tabIndex={0}
                  aria-label={`ลบปฏิทิน ${calendar.name}`}
                  className="hr-holiday-calendar-card__delete"
                  onClick={(event) => {
                    event.stopPropagation();
                    setConfirmDeleteCalendar(calendar);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      event.stopPropagation();
                      setConfirmDeleteCalendar(calendar);
                    }
                  }}
                >
                  <TrashIcon className="h-3.5 w-3.5" />
                </span>
              ) : null}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => {
            setNewCalendarName('');
            setNewCalendarColor(CALENDAR_COLORS[1]);
            setNewCalendarError('');
            setNewCalendarSeedType('none');
            setShowCreateCalendar(true);
          }}
          className="hr-holiday-calendar-card hr-holiday-calendar-card--add"
        >
          <span className="hr-holiday-calendar-card__icon hr-holiday-calendar-card__icon--ghost">
            <PlusIcon className="h-4 w-4" />
          </span>
          <span className="hr-holiday-calendar-card__body">
            <span className="hr-holiday-calendar-card__title">เพิ่มปฏิทิน</span>
            <span className="hr-holiday-calendar-card__count">สำหรับกลุ่มพนักงาน</span>
          </span>
        </button>
      </div>

      <header className="hr-holiday-page-header hr-holiday-page-header--right">
        <div className="hr-holiday-year-nav">
          <CalendarIcon className="h-4 w-4" />
          <HrCustomSelect
            value={selectedYear}
            options={yearOptions}
            onChange={(value) => setSelectedYear(value)}
            label="เลือกปีปฏิทินวันหยุด"
            className="hr-holiday-year-select"
          />
        </div>

        {deletedOfficials.length > 0 ? (
          <button
            type="button"
            onClick={() => setShowTrash(true)}
            className="hr-holiday-trash-button"
            title="ดูวันหยุดที่ถูกลบ"
          >
            <TrashIcon className="h-4 w-4" />
            <span>ถังขยะ</span>
            <span className="hr-holiday-trash-button__badge">{deletedOfficials.length}</span>
          </button>
        ) : null}

        <button
          type="button"
          onClick={() => openAddHoliday()}
          className="hr-button hr-button--primary hr-holiday-add-button"
          style={{ backgroundColor: accent, borderColor: accent }}
        >
          <PlusIcon className="h-4 w-4" />
          เพิ่มวันหยุด
        </button>
      </header>
      </div>

      <div className="hr-holiday-calendar">
        {MONTHS.map((month, monthIndex) => {
          const monthHolidays = holidays.filter((holiday) => Number(holiday.date.slice(5, 7)) === monthIndex + 1);
          return (
            <section key={month} className="hr-holiday-month">
              <h4>{month}</h4>
              <div className="hr-holiday-weekdays">
                {WEEKDAYS.map((day, index) => (
                  <span key={`${day}-${index}`}>{day}</span>
                ))}
              </div>
              <div className="hr-holiday-grid">
                {getMonthCells(year, monthIndex).map((cell) => {
                  const dayHolidays = cell.muted ? [] : (holidaysByDate[cell.date] ?? []);
                  const primaryHoliday = dayHolidays[0];
                  const meta = primaryHoliday ? TYPE_META[primaryHoliday.type] : null;
                  const pinned = !cell.muted && tip?.date === cell.date && !!tip.pinned;
                  const hasHolidays = dayHolidays.length > 0;
                  if (cell.muted) {
                    return <span key={cell.date} className="hr-holiday-day hr-holiday-day--empty" aria-hidden="true" />;
                  }
                  return (
                    <span
                      key={cell.date}
                      className={`hr-holiday-day ${hasHolidays ? 'hr-holiday-day--holiday' : ''} ${pinned ? 'hr-holiday-day--pinned' : ''}`}
                      onMouseEnter={hasHolidays ? (e) => {
                        if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
                        if (tip?.date === cell.date && tip.pinned) return;
                        const rect = e.currentTarget.getBoundingClientRect();
                        setTip(computeTip(cell.date, dayHolidays, rect, false));
                      } : undefined}
                      onMouseLeave={hasHolidays ? () => {
                        if (tip?.pinned) return;
                        closeTimerRef.current = setTimeout(() => setTip(null), 160);
                      } : undefined}
                    >
                      {hasHolidays ? (
                        <button
                          type="button"
                          className="hr-holiday-day__button"
                          onClick={(e) => {
                            if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
                            if (tip?.date === cell.date && tip.pinned) {
                              setTip(null);
                              return;
                            }
                            const rect = e.currentTarget.closest('.hr-holiday-day')!.getBoundingClientRect();
                            setTip(computeTip(cell.date, dayHolidays, rect, true));
                          }}
                          aria-expanded={pinned}
                          aria-label={`ดูวันหยุดวันที่ ${cell.day}`}
                        >
                          <span
                            className="hr-holiday-day__number"
                            style={meta ? { backgroundColor: meta.soft, color: meta.color } : undefined}
                          >
                            {cell.day}
                          </span>
                        </button>
                      ) : (
                        <span className="hr-holiday-day__button">
                          <span className="hr-holiday-day__number">{cell.day}</span>
                        </span>
                      )}
                    </span>
                  );
                })}
              </div>
              <footer>
                <span>{monthHolidays.length} วันหยุด</span>
              </footer>
            </section>
          );
        })}
      </div>

      {tip && typeof window !== 'undefined' && createPortal(
        <div
          key={`${tip.date}-${tip.placement}`}
          className={`hr-holiday-hover-card${tip.placement === 'below' ? ' hr-holiday-hover-card--below' : ''}`}
          role="tooltip"
          style={{
            position: 'fixed',
            top: `${tip.top}px`,
            left: `${tip.left}px`,
            bottom: 'auto',
            width: `${CARD_W}px`,
            pointerEvents: 'auto',
            zIndex: 9999,
            ['--hr-arrow-left' as string]: `${tip.arrowLeft}px`,
          } as CSSProperties}
          onMouseEnter={() => { if (closeTimerRef.current) clearTimeout(closeTimerRef.current); }}
          onMouseLeave={() => {
            if (tip.pinned) return;
            closeTimerRef.current = setTimeout(() => setTip(null), 160);
          }}
        >
          <b>{formatLongDate(tip.date)}</b>
          {tip.holidays.map((holiday) => (
            <span key={holiday.id} className="hr-holiday-hover-card__item">
              <span className="hr-holiday-dot" style={{ backgroundColor: TYPE_META[holiday.type].color }} />
              <span>
                <strong>{holiday.title}</strong>
                <small>{TYPE_META[holiday.type].label}</small>
                <small className="hr-holiday-hover-card__description">{holiday.description}</small>
                <span className="hr-holiday-hover-card__actions">
                  <button type="button" onClick={() => openEditHoliday(holiday)}>
                    แก้ไข
                  </button>
                  {officialOverrides[holiday.id] && holiday.source !== 'custom' ? (
                    <button type="button" onClick={() => resetOfficialHoliday(holiday.id)}>
                      รีเซต
                    </button>
                  ) : null}
                  <button type="button" className="hr-holiday-hover-card__delete" onClick={() => setConfirmDelete(holiday)}>
                    ลบ
                  </button>
                </span>
              </span>
            </span>
          ))}
        </div>,
        // Portal into the HR shell (not document.body) so the card inherits the
        // --hr-* theme variables and dark-mode class. The shell has no transform/
        // will-change, so position:fixed stays anchored to the viewport.
        document.querySelector('.hr-shell') ?? document.body,
      )}

      {modalOpen ? (
        <div className="hr-holiday-modal-backdrop" role="presentation" onClick={() => setModalOpen(false)}>
          <section className="hr-holiday-modal" role="dialog" aria-modal="true" aria-label="เพิ่มวันหยุด" onClick={(event) => event.stopPropagation()}>
            <header>
              <h4>{editingHolidayId ? 'แก้ไขวันหยุด' : 'เพิ่มวันหยุด'}</h4>
              <button type="button" onClick={() => setModalOpen(false)} aria-label="ปิดหน้าต่างเพิ่มวันหยุด">
                <XIcon className="h-5 w-5" />
              </button>
            </header>
            <div className="hr-holiday-modal__body">
              <label className={`hr-holiday-field ${formErrors.title ? 'hr-holiday-field--error' : ''}`}>
                <span>ชื่อวันหยุด <b>*</b></span>
                <input
                  value={formTitle}
                  onChange={(event) => {
                    setFormTitle(event.target.value);
                    if (formErrors.title) setFormErrors((current) => ({ ...current, title: undefined }));
                  }}
                  placeholder="เช่น วันหยุดบริษัทประจำปี"
                  aria-invalid={Boolean(formErrors.title)}
                />
                {formErrors.title ? <small className="hr-holiday-field__error">{formErrors.title}</small> : null}
              </label>
              <label className="hr-holiday-field">
                <span>ประเภท <b>*</b></span>
                <HrCustomSelect
                  value={formType}
                  options={Object.entries(TYPE_META).map(([value, meta]) => ({ value, label: meta.label }))}
                  onChange={(value) => setFormType(value as HolidayType)}
                  label="เลือกประเภทวันหยุด"
                />
              </label>
              <label className={`hr-holiday-field ${formErrors.date ? 'hr-holiday-field--error' : ''}`}>
                <span>วันที่ <b>*</b></span>
                <DatePicker
                  value={isoToDatePickerValue(formDate)}
                  onChange={(value) => {
                    const nextDate = datePickerValueToIso(value, year);
                    if (nextDate) {
                      setFormDate(nextDate);
                      if (formErrors.date) setFormErrors((current) => ({ ...current, date: undefined }));
                    }
                  }}
                  placeholder="เลือกวันที่"
                  minYear={year}
                  className="hr-holiday-system-date"
                />
                {formErrors.date ? <small className="hr-holiday-field__error">{formErrors.date}</small> : null}
              </label>
              <label className="hr-holiday-field">
                <span>รายละเอียด</span>
                <textarea
                  value={formDescription}
                  onChange={(event) => setFormDescription(event.target.value.slice(0, 300))}
                  placeholder="เพิ่มรายละเอียด (ไม่บังคับ)"
                />
                <small>{formDescription.length}/300</small>
              </label>
            </div>
            <footer>
              <button type="button" className="hr-settings-filter" onClick={() => setModalOpen(false)}>
                ยกเลิก
              </button>
              <button
                type="button"
                className="hr-button hr-button--primary"
                style={{ backgroundColor: accent, borderColor: accent }}
                onClick={saveHoliday}
              >
                {editingHolidayId ? 'บันทึกการแก้ไข' : 'บันทึกวันหยุด'}
              </button>
            </footer>
          </section>
        </div>
      ) : null}

      {showTrash ? (
        <div className="hr-holiday-modal-backdrop" role="presentation" onClick={() => setShowTrash(false)}>
          <section
            className="hr-holiday-modal hr-holiday-modal--trash"
            role="dialog"
            aria-modal="true"
            aria-label="วันหยุดที่ถูกลบ"
            onClick={(event) => event.stopPropagation()}
          >
            <header>
              <h4>วันหยุดที่ถูกลบ ({deletedOfficials.length})</h4>
              <button type="button" onClick={() => setShowTrash(false)} aria-label="ปิด">
                <XIcon className="h-5 w-5" />
              </button>
            </header>
            <div className="hr-holiday-modal__body">
              <p className="hr-holiday-confirm__meta">เลือกกู้คืนวันหยุดที่ลบไป — ค่าจะกลับเป็นต้นฉบับจากปฏิทินทางการ</p>
              <ul className="hr-holiday-trash-list">
                {deletedOfficials.map((holiday) => (
                  <li key={holiday.id} className="hr-holiday-trash-list__item">
                    <div className="hr-holiday-trash-list__info">
                      <strong>{holiday.title}</strong>
                      <small>{formatLongDate(holiday.date)}</small>
                    </div>
                    <button
                      type="button"
                      className="hr-holiday-trash-list__restore"
                      onClick={() => {
                        resetOfficialHoliday(holiday.id);
                        if (deletedOfficials.length === 1) setShowTrash(false);
                      }}
                    >
                      กู้คืน
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <footer>
              <button type="button" className="hr-settings-filter" onClick={() => setShowTrash(false)}>
                ปิด
              </button>
              <button
                type="button"
                className="hr-button hr-button--primary"
                style={{ backgroundColor: accent, borderColor: accent }}
                onClick={() => {
                  deletedOfficials.forEach((holiday) => resetOfficialHoliday(holiday.id));
                  setShowTrash(false);
                }}
              >
                กู้คืนทั้งหมด
              </button>
            </footer>
          </section>
        </div>
      ) : null}

      {showCreateCalendar ? (
        <div className="hr-holiday-modal-backdrop" role="presentation" onClick={() => setShowCreateCalendar(false)}>
          <section
            className="hr-holiday-modal hr-holiday-modal--create-calendar"
            role="dialog"
            aria-modal="true"
            aria-label="สร้างปฏิทินวันหยุดใหม่"
            onClick={(event) => event.stopPropagation()}
          >
            <header>
              <h4>สร้างปฏิทินวันหยุดใหม่</h4>
              <button type="button" onClick={() => setShowCreateCalendar(false)} aria-label="ปิด">
                <XIcon className="h-5 w-5" />
              </button>
            </header>
            <div className="hr-holiday-modal__body">
              <label className={`hr-holiday-field ${newCalendarError ? 'hr-holiday-field--error' : ''}`}>
                <span>ชื่อปฏิทิน <b>*</b></span>
                <input
                  value={newCalendarName}
                  onChange={(event) => {
                    setNewCalendarName(event.target.value);
                    if (newCalendarError) setNewCalendarError('');
                  }}
                  placeholder="เช่น พนักงานขาย, พนักงานโรงงาน"
                  aria-invalid={Boolean(newCalendarError)}
                  autoFocus
                />
                {newCalendarError ? <small className="hr-holiday-field__error">{newCalendarError}</small> : null}
              </label>
              <div className="hr-holiday-field">
                <span>สีประจำปฏิทิน</span>
                <div className="hr-holiday-color-grid">
                  {CALENDAR_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewCalendarColor(color)}
                      aria-label={`เลือกสี ${color}`}
                      aria-pressed={color === newCalendarColor}
                      className={`hr-holiday-color-swatch ${color === newCalendarColor ? 'hr-holiday-color-swatch--active' : ''}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <div className="hr-holiday-field">
                <span>ข้อมูลวันหยุดเริ่มต้น <small style={{ fontWeight: 400, color: 'var(--hr-text-muted)' }}>(ไม่เลือก = ปฏิทินเปล่า)</small></span>
                <div className="hr-holiday-seed-options">
                  {(
                    [
                      {
                        value: 'official' as SeedType,
                        title: 'วันหยุดราชการ',
                        desc: 'คัดจากปฏิทินหลัก แก้ไข/ลบได้อิสระ',
                        badge: `${calendarCounts[DEFAULT_CALENDAR_ID] ?? 0} วัน`,
                      },
                      {
                        value: 'private' as SeedType,
                        title: 'วันหยุดเอกชน',
                        desc: 'ตาม พ.ร.บ. คุ้มครองแรงงาน รวมวันแรงงาน 1 พ.ค.',
                        badge: `${(PRIVATE_SECTOR_SEED[currentYear] ?? []).length} วัน`,
                      },
                    ] satisfies { value: SeedType; title: string; desc: string; badge: string }[]
                  ).map((opt) => {
                    const selected = newCalendarSeedType === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        className={`hr-holiday-seed-option${selected ? ' hr-holiday-seed-option--selected' : ''}`}
                        onClick={() => setNewCalendarSeedType(selected ? 'none' : opt.value)}
                        aria-pressed={selected}
                      >
                        <span className="hr-holiday-seed-option__header">
                          <strong className="hr-holiday-seed-option__title">{opt.title}</strong>
                          <span className="hr-holiday-seed-option__badge">{opt.badge}</span>
                        </span>
                        <small className="hr-holiday-seed-option__desc">{opt.desc}</small>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <footer>
              <button type="button" className="hr-holiday-modal__cancel" onClick={() => setShowCreateCalendar(false)}>
                ยกเลิก
              </button>
              <button
                type="button"
                className="hr-holiday-modal__submit"
                style={{ backgroundColor: accent, borderColor: accent }}
                onClick={createCalendar}
              >
                สร้างปฏิทิน
              </button>
            </footer>
          </section>
        </div>
      ) : null}

      {confirmDeleteCalendar ? (
        <div className="hr-holiday-modal-backdrop" role="presentation" onClick={() => setConfirmDeleteCalendar(null)}>
          <section
            className="hr-holiday-modal hr-holiday-modal--confirm"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="hr-holiday-delete-calendar-title"
            onClick={(event) => event.stopPropagation()}
          >
            <header>
              <h4 id="hr-holiday-delete-calendar-title">ยืนยันการลบปฏิทิน</h4>
              <button type="button" onClick={() => setConfirmDeleteCalendar(null)} aria-label="ปิด">
                <XIcon className="h-5 w-5" />
              </button>
            </header>
            <div className="hr-holiday-modal__body">
              <p className="hr-holiday-confirm__lead">
                ต้องการลบปฏิทิน <strong>{confirmDeleteCalendar.name}</strong> ใช่หรือไม่?
              </p>
              <p className="hr-holiday-confirm__note">
                วันหยุดทั้งหมดในปฏิทินนี้จะถูกลบ และพนักงานที่ใช้ปฏิทินนี้ต้องถูกย้ายไปปฏิทินอื่น
              </p>
            </div>
            <footer>
              <button type="button" className="hr-settings-filter" onClick={() => setConfirmDeleteCalendar(null)}>
                ยกเลิก
              </button>
              <button
                type="button"
                className="hr-button hr-button--danger"
                onClick={() => {
                  removeCalendar(confirmDeleteCalendar.id);
                  setConfirmDeleteCalendar(null);
                }}
              >
                ยืนยันการลบ
              </button>
            </footer>
          </section>
        </div>
      ) : null}

      {confirmDelete ? (
        <div className="hr-holiday-modal-backdrop" role="presentation" onClick={() => setConfirmDelete(null)}>
          <section
            className="hr-holiday-modal hr-holiday-modal--confirm"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="hr-holiday-delete-title"
            onClick={(event) => event.stopPropagation()}
          >
            <header>
              <h4 id="hr-holiday-delete-title">ยืนยันการลบวันหยุด</h4>
              <button type="button" onClick={() => setConfirmDelete(null)} aria-label="ปิดหน้าต่างยืนยัน">
                <XIcon className="h-5 w-5" />
              </button>
            </header>
            <div className="hr-holiday-modal__body">
              <p className="hr-holiday-confirm__lead">
                ต้องการลบวันหยุด <strong>{confirmDelete.title}</strong> ใช่หรือไม่?
              </p>
              <p className="hr-holiday-confirm__meta">{formatLongDate(confirmDelete.date)}</p>
              {confirmDelete.source !== 'custom' ? (
                <p className="hr-holiday-confirm__note">
                  วันหยุดจากปฏิทินทางการสามารถกู้คืนได้ภายหลังโดยกดปุ่ม &quot;รีเซต&quot;
                </p>
              ) : (
                <p className="hr-holiday-confirm__note">การลบวันหยุดที่บริษัทเพิ่มเองจะไม่สามารถกู้คืนได้</p>
              )}
            </div>
            <footer>
              <button type="button" className="hr-settings-filter" onClick={() => setConfirmDelete(null)}>
                ยกเลิก
              </button>
              <button
                type="button"
                className="hr-button hr-button--danger"
                onClick={() => {
                  deleteHoliday(confirmDelete.id);
                  setConfirmDelete(null);
                  setTip(null);
                }}
              >
                ยืนยันการลบ
              </button>
            </footer>
          </section>
        </div>
      ) : null}
    </div>
  );
}

'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { type CSSProperties, type FormEvent, useEffect, useRef, useState } from 'react';
import {
  hrSettingsGroups,
  type HrNavChild,
  type HrSettingsGroup,
} from '@/data/humansource/navigation';
import { PlusIcon, XIcon } from '@/components/ui/icons';
import { HrCustomSelect } from './hr-ui';
import { HolidayYearCalendar as HolidayYearCalendarCrud } from './hr-holiday-year-calendar';
import { CUSTOM_SHIFTS_STORAGE_KEY, type HrShiftGroupKey, type HrShiftRow } from './hr-shifts';
import { AddWorkInLocationModal } from './hr-workin-modal';
import { TimeGeneralSettings } from './hr-time-general';
import { LeaveSettings } from './hr-leave-settings';
import { ApprovalWorkflowSettings } from './hr-approval-workflows';
import { OrgStructureBoard } from './hr-org-structure';
import { BasicSettingsBoard } from './hr-basic-settings';
import { PositionsBoard } from './hr-positions-board';
import { AnnouncementsBoard } from './hr-announcements-board';
import { PayrollGeneralSettings } from './hr-payroll-general';
import { PayrollEmploymentTypes } from './hr-payroll-employment-types';
import { PayrollPayPeriods } from './hr-payroll-pay-periods';
import { PayrollPayItems } from './hr-payroll-pay-items';

type GroupKey = HrSettingsGroup['key'];

const SETTINGS_ROOT = '/humansource/settings';
const COMPANY_OPTIONS = ['ใช้กับทุกบริษัท', 'G-HUB Enterprise', 'Operations', 'ฝ่ายขาย', 'คลังสินค้า'];
const TIMEZONE_OPTIONS = ['Asia/Bangkok (UTC+07:00)', 'Asia/Singapore (UTC+08:00)', 'UTC (UTC+00:00)'];
const ATTENDANCE_RULE_OPTIONS = ['ตามเวลาทำงานในกะ', 'นับตามชั่วโมงทำงานจริง', 'ไม่บังคับเวลาเข้าออก'];

type ShiftGroupKey = HrShiftGroupKey;
type ShiftRow = HrShiftRow;

type ShiftForm = {
  code: string;
  name: string;
  description: string;
  groupKey: ShiftGroupKey;
  startTime: string;
  endTime: string;
  breakStart: string;
  breakEnd: string;
  company: string;
  timezone: string;
  color: string;
  attendanceRule: string;
  flexibleEntryEnabled: boolean;
  flexibleMinutes: string;
  minimumWorkHours: string;
  trackBreak: boolean;
  shiftAllowanceEnabled: boolean;
  shiftAllowanceAmount: string;
  prorateShiftAllowance: boolean;
  holidayPremiumEnabled: boolean;
  overtimePremiumEnabled: boolean;
  enabled: boolean;
};

const EMPTY_SHIFT_FORM: ShiftForm = {
  code: '',
  name: '',
  description: '',
  groupKey: 'same-day',
  startTime: '08:30',
  endTime: '17:30',
  breakStart: '12:00',
  breakEnd: '13:00',
  company: COMPANY_OPTIONS[0],
  timezone: TIMEZONE_OPTIONS[0],
  color: '',
  attendanceRule: ATTENDANCE_RULE_OPTIONS[0],
  flexibleEntryEnabled: false,
  flexibleMinutes: '0',
  minimumWorkHours: '8',
  trackBreak: true,
  shiftAllowanceEnabled: false,
  shiftAllowanceAmount: '0',
  prorateShiftAllowance: true,
  holidayPremiumEnabled: false,
  overtimePremiumEnabled: false,
  enabled: true,
};

const SHIFT_GROUP_META: Record<ShiftGroupKey, { type: string }> = {
  'same-day': { type: 'กะปกติ' },
  overnight: { type: 'กะข้ามวัน' },
  'total-hours': { type: 'ชั่วโมงรวม' },
  combined: { type: 'ควบกะ' },
};

const SHIFT_TYPE_OPTIONS: Array<{
  key: ShiftGroupKey;
  label: string;
  description: string;
}> = [
  { key: 'same-day', label: 'กะวันเดียวกัน', description: 'เวลาเข้าและออกอยู่ในวันปฏิทินเดียวกัน' },
  { key: 'overnight', label: 'กะข้ามวัน', description: 'เวลาออกอยู่ในวันถัดไป เช่น 22:00-06:00' },
  { key: 'total-hours', label: 'ชั่วโมงรวม', description: 'กำหนดจำนวนชั่วโมง โดยไม่บังคับเวลาเข้าออกตายตัว' },
  { key: 'combined', label: 'ควบกะ', description: 'รวมช่วงเวลาทำงานมากกว่าหนึ่งกะในวันเดียวกัน' },
];

const SHIFT_COLORS = [
  '#dc2626', '#f43f5e', '#ec4899', '#a855f7', '#7c3aed', '#4f46e5',
  '#2563eb', '#0ea5e9', '#06b6d4', '#0891b2', '#059669', '#22c55e',
  '#84cc16', '#d4d700', '#facc15', '#f59e0b', '#f97316', '#ef4444',
  '#475569', '#64748b', '#94a3b8', '#c4a484', '#c59b25',
];

// Hub overview cards keep their original per-group colors.
const GROUP_STYLES: Record<GroupKey, {
  accent: string;
  accent2: string;
  soft: string;
  text: string;
}> = {
  company: {
    accent: '#ff5a2a',
    accent2: '#ffb56b',
    soft: 'bg-orange-50',
    text: 'text-orange-700',
  },
  time: {
    accent: '#2f80ff',
    accent2: '#91c6ff',
    soft: 'bg-blue-50',
    text: 'text-blue-700',
  },
  payroll: {
    accent: '#00a77f',
    accent2: '#95f3d0',
    soft: 'bg-emerald-50',
    text: 'text-emerald-700',
  },
  system: {
    accent: '#7a5cff',
    accent2: '#c3b5ff',
    soft: 'bg-violet-50',
    text: 'text-violet-700',
  },
};

function getAccentVars(accent: string): CSSProperties {
  return {
    '--hr-primary': accent,
    '--hr-primary-soft': `${accent}14`,
    '--hr-primary-border': `${accent}33`,
    '--hr-focus': `${accent}24`,
  } as CSSProperties;
}

export function HrSettingsPage({ activePathOverride }: { activePathOverride?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryPath = searchParams.get('path');
  const activePath = activePathOverride ?? (pathname === SETTINGS_ROOT && queryPath ? queryPath : pathname);
  const activeGroup = getActiveSettingsGroup(activePath);
  const activeGroupOrder = activeGroup
    ? hrSettingsGroups.findIndex((group) => group.key === activeGroup.key) + 1
    : 0;

  return (
    <div className={`flex flex-1 flex-col ${activeGroup ? 'min-h-full' : 'px-6 py-5 lg:px-8 xl:px-10'}`}>
      <div className={`flex w-full flex-1 flex-col ${activeGroup ? '' : 'mx-auto max-w-[1560px]'}`}>
        {activeGroup ? (
          <FocusPage
            group={activeGroup}
            order={activeGroupOrder}
            pathname={activePath}
            onSelectTopic={(item) => router.push(getSettingsRouteHref(getSettingsPath(activeGroup, item)))}
          />
        ) : (
          <SetupCards onOpenGroup={(group) => router.push(getSettingsRouteHref(getSettingsPath(group, group.items[0])))} />
        )}
      </div>
    </div>
  );
}

function SetupCards({
  onOpenGroup,
}: {
  onOpenGroup: (group: HrSettingsGroup) => void;
}) {
  return (
    <section className="grid gap-5 md:grid-cols-2 2xl:grid-cols-4">
      {hrSettingsGroups.map((group, index) => (
        <SetupCard
          key={group.key}
          group={group}
          order={index + 1}
          onOpen={() => onOpenGroup(group)}
        />
      ))}
    </section>
  );
}

function SetupCard({
  group,
  order,
  onOpen,
}: {
  group: HrSettingsGroup;
  order: number;
  onOpen: () => void;
}) {
  const styles = GROUP_STYLES[group.key];
  const progress = getProgress(group.progress);

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group min-h-[365px] overflow-hidden rounded-lg border border-gray-200 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md"
    >
      <div className={`relative h-[190px] overflow-hidden px-4 pt-4 ${styles.soft}`}>
        <div className="relative z-10 flex items-center justify-between gap-4">
          <span
            className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold text-white"
            style={{ backgroundColor: styles.accent }}
          >
            {order}
          </span>
          <span className="flex items-center gap-2 text-[11px] font-medium" style={{ color: styles.accent }}>
            <span className="h-1.5 w-14 overflow-hidden rounded-full bg-white/70">
              <span
                className="block h-full rounded-full"
                style={{ width: `${progress.percent}%`, backgroundColor: styles.accent }}
              />
            </span>
            {progress.done}/{progress.total}
          </span>
        </div>

        <div className="relative z-10 mt-7 flex justify-center">
          <CardIllustration groupKey={group.key} />
        </div>

        <span
          className="absolute -bottom-16 -right-16 h-44 w-44 rounded-full opacity-20"
          style={{ backgroundColor: styles.accent2 }}
        />
      </div>

      <div className="px-4 pb-5 text-center">
        <div className="flex justify-center">
          <span
            className="flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-xs font-semibold text-white"
            style={{ backgroundColor: styles.accent }}
          >
            {order}
          </span>
        </div>
        <h2 className="mt-3 text-lg font-semibold text-gray-950">{group.title}</h2>
        <p className="mx-auto mt-2 max-w-[250px] text-xs leading-5 text-gray-500">{group.description}</p>

        <div className="mt-4 flex flex-wrap justify-center gap-1.5">
          <span className="rounded-full bg-gray-100 px-2 py-1 text-[10px] font-medium text-gray-500">
            {group.items.length} หัวข้อ
          </span>
          <span className="rounded-full bg-gray-100 px-2 py-1 text-[10px] font-medium text-gray-500">
            {countSettingsItems(group.items)} รายการรวม
          </span>
        </div>
      </div>
    </button>
  );
}

function FocusPage({
  group,
  order,
  pathname,
  onSelectTopic,
}: {
  group: HrSettingsGroup;
  order: number;
  pathname: string;
  onSelectTopic: (item: HrNavChild) => void;
}) {
  const activeTopic = getActiveSettingsTopic(group, pathname);
  const activeTopicIndex = Math.max(0, group.items.findIndex((item) => item.path === activeTopic.path));
  const activeItem = getActiveSettingsItem(group, pathname);
  const activePath = normalizePath(pathname);
  const hideAutoTabsPaths = [
    '/humansource/time/work-schedules',
    '/humansource/time/leave-types',
    '/humansource/organization/structure',
    '/humansource/payroll/income-items',
    '/humansource/settings/announcements',
  ];
  const showTabs = !hideAutoTabsPaths.includes(activeTopic.path);
  const tabs: Array<{ label: string; path?: string }> = activeTopic.children?.length
    ? activeTopic.children.slice(0, 6).map((child) => ({
        label: child.label,
        path: getSettingsPath(group, child),
      }))
    : getFallbackTabs(group.key).map((label) => ({ label }));

  const progress = getProgress(group.progress);
  const groupAccent = GROUP_STYLES[group.key].accent;

  return (
    <section
      className="hr-settings-focus flex min-h-full flex-1 flex-col overflow-hidden border-l border-gray-200 bg-white"
      style={getAccentVars(groupAccent)}
    >
      <div className="grid min-h-full flex-1 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="hr-settings-focus__rail flex flex-col border-b border-gray-200 bg-white lg:border-b-0 lg:border-r">
          {/* Clean neutral rail header */}
          <div className="hr-settings-focus__rail-header border-b border-gray-100 px-4 py-4">
            <div className="flex items-center justify-between gap-2">
              <span className="hr-settings-focus__rail-badge flex h-7 w-7 items-center justify-center rounded-lg bg-gray-950 text-xs font-bold text-white">
                {order}
              </span>
              <span className="hr-settings-focus__progress text-[11px] font-medium text-gray-400">{group.progress}</span>
            </div>
            <h2 className="hr-settings-focus__rail-title mt-3 text-sm font-bold text-gray-800">{group.title}</h2>
            <div className="hr-settings-focus__progress-track mt-2.5 h-1 overflow-hidden rounded-full bg-gray-100">
              <span className="hr-settings-focus__progress-fill block h-full rounded-full" style={{ width: `${progress.percent}%` }} />
            </div>
          </div>

          <nav className="hr-settings-focus__nav flex-1 overflow-y-auto p-2">
            {group.items.map((item, index) => {
              const active = item.path === activeTopic.path;
              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => onSelectTopic(item)}
                  className={`hr-settings-focus__nav-item flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2.5 text-left transition-colors ${
                    active ? 'hr-settings-focus__nav-item--active' : 'hover:bg-gray-50'
                  }`}
                >
                  <span
                    className={`hr-settings-focus__nav-index mt-px flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md text-[10px] font-bold ${
                      active ? '' : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {order}.{index + 1}
                  </span>
                  <span className="min-w-0">
                    <span className={`hr-settings-focus__nav-label block text-[13px] ${active ? 'font-semibold' : 'font-medium text-gray-700'}`}>{item.label}</span>
                    <span className="hr-settings-focus__nav-desc mt-0.5 block text-[11px] leading-4 text-gray-400">
                      {item.children?.length ? `${item.children.length} รายการย่อย` : item.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="flex min-w-0 flex-col">
          <div className="hr-settings-focus__main-header flex-shrink-0 px-6 pb-0 pt-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="hr-settings-focus__eyebrow text-xs font-medium">{order}.{activeTopicIndex + 1}</p>
                <h1 className="hr-settings-focus__title mt-0.5 text-lg font-bold text-gray-800">{activeTopic.label}</h1>
                <p className="hr-settings-focus__description mt-0.5 max-w-3xl text-xs text-gray-400">{activeTopic.description}</p>
              </div>
            </div>

            {showTabs ? (
              <div className="hr-settings-focus__tabs mt-3 flex items-center gap-0 overflow-x-auto border-b border-gray-200">
                {tabs.map((tab, index) => {
                  const tabActive = tab.path ? normalizePath(tab.path) === activePath : index === 0;
                  return (
                    <Link
                      key={tab.path ?? tab.label}
                      href={getSettingsRouteHref(tab.path ?? getSettingsPath(group, activeTopic))}
                      className={`hr-settings-focus__tab -mb-px whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${
                        tabActive ? 'hr-settings-focus__tab--active' : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tab.label}
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="border-b border-gray-200" />
            )}
          </div>

          <div className="flex min-h-0 flex-1 flex-col">
            <SettingsWorkbench group={group} topic={activeTopic} activeItem={activeItem} accent={groupAccent} />
          </div>
        </main>
      </div>
    </section>
  );
}

function SettingsWorkbench({
  group,
  topic,
  activeItem,
  accent,
}: {
  group: HrSettingsGroup;
  topic: HrNavChild;
  activeItem: HrNavChild;
  accent: string;
}) {
  if (group.key === 'company') {
    if (activeItem.path.includes('organization/structure'))    return <OrgStructureBoard accent={accent} />;
    if (activeItem.path.includes('organization/job-levels'))   return <PositionsBoard sub="job-levels" accent={accent} />;
    if (activeItem.path.includes('organization/positions'))    return <PositionsBoard sub="positions"  accent={accent} />;
    if (activeItem.path.includes('company/employee-defaults')) return <BasicSettingsBoard sub="employee-defaults" accent={accent} />;
    if (activeItem.path.includes('company/running-number'))    return <BasicSettingsBoard sub="running-number"    accent={accent} />;
    if (activeItem.path.includes('organization/employee-type')) return <BasicSettingsBoard sub="employee-type"   accent={accent} />;
    if (activeItem.path.includes('company/general'))                    return <BasicSettingsBoard sub="employee-type"    accent={accent} />;
    if (activeItem.path.includes('settings/announcements'))           return <AnnouncementsBoard accent={accent} />;
    return null;
  }

  if (group.key === 'time') {
    return <TimeSettingsTable topic={topic} activeItem={activeItem} accent={accent} />;
  }

  if (group.key === 'payroll') {
    const p = activeItem.path;
    if (p.includes('payroll/employment-types')) return <PayrollEmploymentTypes accent={accent} />;
    if (p.includes('payroll/pay-periods'))      return <PayrollPayPeriods accent={accent} />;
    if (p.includes('payroll/income-items'))     return <PayrollPayItems accent={accent} tab="income" />;
    if (p.includes('payroll/deduction-items'))  return <PayrollPayItems accent={accent} tab="deduction" />;
    if (p.includes('payroll/accounting-items')) return <PayrollPayItems accent={accent} tab="accounting" />;
    return <PayrollGeneralSettings accent={accent} />;
  }

  if (activeItem.path.includes('approval-workflows')) {
    return <ApprovalWorkflowSettings accent={accent} />;
  }

  return <SystemUsersTable accent={accent} />;
}

function TimeSettingsTable({
  topic,
  activeItem,
  accent,
}: {
  topic: HrNavChild;
  activeItem: HrNavChild;
  accent: string;
}) {
  const [showAddWorkIn, setShowAddWorkIn] = useState(false);
  const [filterWiCompany, setFilterWiCompany] = useState('');
  const [filterWiDevice, setFilterWiDevice] = useState('');
  const [filterWiStatus, setFilterWiStatus] = useState('');

  if (activeItem.path === '/humansource/time/general') {
    return <TimeGeneralSettings accent={accent} />;
  }

  if (activeItem.path.includes('holiday-calendar')) {
    return <HolidayYearCalendarCrud accent={accent} />;
  }

  if (isShiftSettingsPath(activeItem.path)) {
    return <ShiftSettingsBoard accent={accent} />;
  }

  if (activeItem.path.includes('leave')) {
    return <LeaveSettings accent={accent} />;
  }

  const view = getTimeSettingsView(activeItem);
  const isAttendanceLocations =
    activeItem.path.includes('attendance-locations') ||
    activeItem.path.includes('devices') ||
    activeItem.path.includes('gps') ||
    activeItem.path.includes('network');

  return (
    <div className="p-5">
      <div className="hr-settings-toolbar">
        <div className="hr-settings-toolbar__filters">
          <input type="search" placeholder="ค้นหา..." className="hr-settings-search" />
        </div>
        <div className="hr-filter-chip-group">
          {isAttendanceLocations ? (
            <>
              <FilterChipSelect label="บริษัท"       value={filterWiCompany} options={WORKIN_COMPANY_OPTIONS} onChange={setFilterWiCompany} accent={accent} />
              <FilterChipSelect label="ประเภทอุปกรณ์" value={filterWiDevice}  options={WORKIN_DEVICE_OPTIONS}  onChange={setFilterWiDevice}  accent={accent} />
              <FilterChipSelect label="สถานะ"         value={filterWiStatus}  options={WORKIN_STATUS_OPTIONS}   onChange={setFilterWiStatus}  accent={accent} />
            </>
          ) : null}
          <button
            type="button"
            onClick={() => isAttendanceLocations && setShowAddWorkIn(true)}
            className="hr-settings-primary-action"
            style={{ backgroundColor: accent }}
          >
            <PlusIcon className="h-4 w-4" />
            {view.actionLabel}
          </button>
        </div>
      </div>

      {showAddWorkIn && <AddWorkInLocationModal accent={accent} onClose={() => setShowAddWorkIn(false)} />}

      {!isAttendanceLocations ? (
        <div className="grid gap-3 md:grid-cols-3">
          <TimePolicyCard
            title={activeItem.label}
            description={activeItem.description ?? topic.description}
            value="หน้าที่เลือก"
            accent={accent}
          />
          {view.policies.map((policy) => (
            <TimePolicyCard key={policy.title} {...policy} accent={accent} />
          ))}
        </div>
      ) : null}

      <SettingsTable
        headers={view.headers}
        rows={view.rows}
        accent={accent}
      />
    </div>
  );
}

// AddWorkInLocationModal moved to ./hr-workin-modal.tsx — imported above.

type HolidayEntry = {
  date: string;
  title: string;
  type: 'public' | 'company' | 'branch';
};

const MONTHS_TH = [
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

function seedHolidaysForYear(year: number): HolidayEntry[] {
  return [
    { date: `${year}-01-01`, title: 'วันขึ้นปีใหม่', type: 'public' },
    { date: `${year}-04-13`, title: 'วันสงกรานต์', type: 'public' },
    { date: `${year}-04-14`, title: 'วันสงกรานต์', type: 'public' },
    { date: `${year}-04-15`, title: 'วันสงกรานต์', type: 'public' },
    { date: `${year}-05-01`, title: 'วันแรงงานแห่งชาติ', type: 'public' },
    { date: `${year}-12-05`, title: 'วันพ่อแห่งชาติ', type: 'public' },
    { date: `${year}-12-10`, title: 'วันรัฐธรรมนูญ', type: 'public' },
    { date: `${year}-12-31`, title: 'วันสิ้นปี', type: 'public' },
  ];
}

function formatDateKey(year: number, monthIndex: number, day: number) {
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function getHolidayDayMeta(date: string) {
  const parsed = new Date(`${date}T00:00:00`);
  const weekdays = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
  return {
    day: date.slice(8, 10),
    weekday: weekdays[parsed.getDay()] ?? '',
  };
}

export function HolidayYearCalendarLegacy({ accent }: { accent: string }) {
  const currentYear = new Date().getFullYear();
  const [holidayYears, setHolidayYears] = useState<Record<number, HolidayEntry[]>>(() => ({
    [currentYear]: seedHolidaysForYear(currentYear),
    [currentYear + 1]: seedHolidaysForYear(currentYear + 1),
  }));
  const [selectedYear, setSelectedYear] = useState(String(currentYear));
  const [holidayDate, setHolidayDate] = useState(`${currentYear}-01-01`);
  const [holidayTitle, setHolidayTitle] = useState('');
  const [holidayType, setHolidayType] = useState<HolidayEntry['type']>('company');
  const [showHolidayForm, setShowHolidayForm] = useState(false);
  void showHolidayForm;

  const year = Number(selectedYear);
  const holidays = holidayYears[year] ?? [];
  const yearOptions = Object.keys(holidayYears)
    .map(Number)
    .sort((a, b) => a - b)
    .map((item) => ({
      value: String(item),
      label: `${item + 543}`,
      description: `${holidayYears[item]?.length ?? 0} วันหยุด`,
    }));

  const addYear = () => {
    const nextYear = Math.max(...Object.keys(holidayYears).map(Number)) + 1;
    setHolidayYears((current) => ({
      ...current,
      [nextYear]: seedHolidaysForYear(nextYear),
    }));
    setSelectedYear(String(nextYear));
    setHolidayDate(`${nextYear}-01-01`);
  };

  const addHoliday = () => {
    const title = holidayTitle.trim();
    if (!holidayDate || !title) return;

    const targetYear = Number(holidayDate.slice(0, 4));
    const nextHoliday: HolidayEntry = {
      date: holidayDate,
      title,
      type: holidayType,
    };

    setHolidayYears((current) => ({
      ...current,
      [targetYear]: [...(current[targetYear] ?? seedHolidaysForYear(targetYear)), nextHoliday]
        .sort((a, b) => a.date.localeCompare(b.date)),
    }));
    setSelectedYear(String(targetYear));
    setHolidayTitle('');
    setShowHolidayForm(false);
  };

  const selectDate = (date: string) => {
    setHolidayDate(date);
    setHolidayTitle('');
    setHolidayType('company');
  };

  const selectMonth = (monthIndex: number) => {
    selectDate(formatDateKey(year, monthIndex, 1));
    setShowHolidayForm(true);
  };

  return (
    <div className="hr-holiday-page">
      <div className="hr-holiday-toolbar">
        <div className="hr-holiday-toolbar__left">
          <div className="hr-holiday-year-filter">
            <span className="hr-holiday-label">ปีปฏิทิน</span>
            <HrCustomSelect
              value={selectedYear}
              options={yearOptions}
              onChange={(value) => {
                setSelectedYear(value);
                setHolidayDate(`${value}-01-01`);
              }}
              label="เลือกปีปฏิทินวันหยุด"
              className="hr-holiday-year-select"
            />
          </div>
          <button type="button" className="hr-settings-filter" onClick={addYear}>
            เพิ่มปีใหม่
          </button>
        </div>

        <div className="hr-holiday-add">
          <input
            type="date"
            value={holidayDate}
            onChange={(event) => setHolidayDate(event.target.value)}
            className="hr-shift-control hr-holiday-add__date"
          />
          <input
            type="text"
            value={holidayTitle}
            onChange={(event) => setHolidayTitle(event.target.value)}
            placeholder="ชื่อวันหยุด"
            className="hr-shift-control hr-holiday-add__title"
          />
          <HrCustomSelect
            value={holidayType}
            options={[
              { value: 'company', label: 'วันหยุดบริษัท' },
              { value: 'public', label: 'วันหยุดราชการ' },
              { value: 'branch', label: 'วันหยุดเฉพาะสาขา' },
            ]}
            onChange={(value) => setHolidayType(value as HolidayEntry['type'])}
            label="ประเภทวันหยุด"
            className="hr-holiday-type-select"
          />
          <button
            type="button"
            onClick={addHoliday}
            className="hr-settings-primary-action"
            style={{ backgroundColor: accent }}
          >
            <PlusIcon className="h-4 w-4" />
            เพิ่มวันหยุด
          </button>
        </div>
      </div>

      <div className="hr-holiday-summary">
        <span>{holidays.length} วันหยุดในปี {year + 543}</span>
        <span>เลือกเดือนหรือวันที่ แล้วเพิ่มวันหยุดลงในปฏิทินปีนี้ได้ทันที</span>
      </div>

      <div className="hr-holiday-calendar">
        {MONTHS_TH.map((month, monthIndex) => {
          const monthHolidays = holidays
            .filter((holiday) => Number(holiday.date.slice(5, 7)) === monthIndex + 1)
            .sort((a, b) => a.date.localeCompare(b.date));

          return (
          <section key={month} className="hr-holiday-month">
            <header className="hr-holiday-month__header">
              <div>
                <h3>{month}</h3>
                <span>{monthHolidays.length ? `${monthHolidays.length} วันหยุด` : 'ยังไม่มีวันหยุด'}</span>
              </div>
              <button
                type="button"
                className="hr-holiday-month__add"
                onClick={() => selectMonth(monthIndex)}
                aria-label={`เพิ่มวันหยุดเดือน${month}`}
              >
                <PlusIcon className="h-4 w-4" />
              </button>
            </header>
            {monthHolidays.length ? (
              <div className="hr-holiday-list">
                {monthHolidays.map((holiday) => {
                  const meta = getHolidayDayMeta(holiday.date);
                  const selected = holidayDate === holiday.date;
                  return (
                    <button
                      key={`${holiday.date}-${holiday.title}`}
                      type="button"
                      className={`hr-holiday-row ${selected ? 'hr-holiday-row--selected' : ''}`}
                      onClick={() => selectDate(holiday.date)}
                      style={selected ? { borderColor: accent, boxShadow: `inset 0 0 0 1px ${accent}` } : undefined}
                    >
                      <span className="hr-holiday-date-badge">
                        <b>{meta.day}</b>
                        <span>{meta.weekday}</span>
                      </span>
                      <span className="hr-holiday-row__content">
                        <span className="hr-holiday-row__title">{holiday.title}</span>
                        <span className={`hr-holiday-chip hr-holiday-chip--${holiday.type}`}>
                          {holiday.type === 'public' ? 'วันหยุดราชการ' : holiday.type === 'company' ? 'วันหยุดบริษัท' : 'เฉพาะสาขา'}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <button type="button" className="hr-holiday-empty-month" onClick={() => selectMonth(monthIndex)}>
                <PlusIcon className="h-4 w-4" />
                เพิ่มวันหยุดเดือนนี้
              </button>
            )}
          </section>
          );
        })}
      </div>
    </div>
  );
}

// ─── FilterChipSelect (shared within this file) ──────────────────────────────

function FilterChipSelect({
  label, value, options, onChange, accent,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
  accent: string;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const selected = options.find((o) => o.value === value);
  if (selected) {
    return (
      <div className="hr-filter-chip hr-filter-chip--active" style={{ borderColor: accent, color: accent }}>
        <span>{selected.label}</span>
        <button type="button" className="hr-filter-chip__clear" aria-label="ล้างตัวกรอง" onClick={() => onChange('')}>
          <XIcon className="h-3 w-3" />
        </button>
      </div>
    );
  }
  return (
    <div ref={wrapRef} className="hr-filter-chip-wrap">
      <button type="button" className="hr-filter-chip" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        {label} <span aria-hidden>▾</span>
      </button>
      {open && (
        <div className="hr-filter-chip-dropdown">
          {options.map((o) => (
            <button key={o.value} type="button" className="hr-filter-chip-dropdown__item"
              onClick={() => { onChange(o.value); setOpen(false); }}>
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const SHIFT_FILTER_COMPANY_OPTIONS = [
  { value: 'ใช้กับทุกบริษัท', label: 'ใช้กับทุกบริษัท' },
  { value: 'G-HUB Enterprise',  label: 'G-HUB Enterprise' },
  { value: 'Operations',         label: 'Operations' },
  { value: 'ฝ่ายขาย',           label: 'ฝ่ายขาย' },
  { value: 'คลังสินค้า',        label: 'คลังสินค้า' },
];
const SHIFT_FILTER_TYPE_OPTIONS = [
  { value: 'กะปกติ',    label: 'กะปกติ' },
  { value: 'กะพิเศษ',   label: 'กะพิเศษ' },
  { value: 'กะข้ามวัน', label: 'กะข้ามวัน' },
  { value: 'ชั่วโมงรวม', label: 'ชั่วโมงรวม' },
  { value: 'ควบกะ',     label: 'ควบกะ' },
];
const SHIFT_FILTER_STATUS_OPTIONS = [
  { value: 'enabled',  label: 'ใช้งาน' },
  { value: 'disabled', label: 'ไม่ใช้งาน' },
];

const WORKIN_COMPANY_OPTIONS = [
  { value: 'G-HUB Enterprise', label: 'G-HUB Enterprise' },
  { value: 'Operations',        label: 'Operations' },
  { value: 'M-HUB Enterprise',  label: 'M-HUB Enterprise' },
];
const WORKIN_DEVICE_OPTIONS = [
  { value: 'GPS',              label: 'GPS' },
  { value: 'IOMO',             label: 'IOMO' },
  { value: 'QR Code Station',  label: 'QR Code Station' },
];
const WORKIN_STATUS_OPTIONS = [
  { value: 'enabled',  label: 'ใช้งาน' },
  { value: 'disabled', label: 'ไม่ใช้งาน' },
];

// ─────────────────────────────────────────────────────────────────────────────

function ShiftSettingsBoard({ accent }: { accent: string }) {
  const [customShifts, setCustomShifts] = useState<ShiftRow[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [form, setForm] = useState<ShiftForm>(EMPTY_SHIFT_FORM);
  const [formError, setFormError] = useState('');
  const [filterCompany, setFilterCompany] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(CUSTOM_SHIFTS_STORAGE_KEY);
      if (saved) {
        setCustomShifts(JSON.parse(saved) as ShiftRow[]);
      }
    } catch {
      window.localStorage.removeItem(CUSTOM_SHIFTS_STORAGE_KEY);
    }
  }, []);

  const baseShiftGroups: Array<{ groupKey: ShiftGroupKey; rows: ShiftRow[] }> = [
    {
      groupKey: 'same-day',
      rows: [
        {
          enabled: true,
          code: 'WC001',
          name: 'สำนักงาน 08.30-17.30',
          type: 'กะปกติ',
          time: '08:30-12:00 / 13:00-17:30',
          company: 'ใช้กับทุกบริษัท',
          updatedBy: 'empeo Team',
          updatedAt: '10/06/2026 16:32',
          groupKey: 'same-day',
        },
        {
          enabled: true,
          code: 'WC002',
          name: 'สำนักงานครึ่งวัน',
          type: 'กะพิเศษ',
          time: '08:30-12:00 / 13:00-15:00',
          company: 'G-HUB Enterprise',
          updatedBy: 'HR Admin',
          updatedAt: '10/06/2026 16:32',
          groupKey: 'same-day',
        },
      ],
    },
    {
      groupKey: 'overnight',
      rows: [
        {
          enabled: true,
          code: 'WC003',
          name: 'กะดึก 22.00-06.00',
          type: 'กะข้ามวัน',
          time: '22:00-02:00 / 03:00-06:00',
          company: 'Operations',
          updatedBy: 'HR Admin',
          updatedAt: '10/06/2026 16:32',
          groupKey: 'overnight',
        },
      ],
    },
    {
      groupKey: 'total-hours',
      rows: [
        {
          enabled: false,
          code: 'WC004',
          name: 'ภาคสนาม 8 ชั่วโมง',
          type: 'ชั่วโมงรวม',
          time: 'ครบ 8 ชม. / พักยืดหยุ่น',
          company: 'ฝ่ายขาย',
          updatedBy: 'HR Admin',
          updatedAt: '10/06/2026 16:32',
          groupKey: 'total-hours',
        },
      ],
    },
    {
      groupKey: 'combined',
      rows: [
        {
          enabled: false,
          code: 'WC005',
          name: 'ควบเช้า-บ่าย',
          type: 'ควบกะ',
          time: '06:00-14:00 + 14:00-22:00',
          company: 'คลังสินค้า',
          updatedBy: 'HR Admin',
          updatedAt: '10/06/2026 16:32',
          groupKey: 'combined',
        },
      ],
    },
  ];

  const shiftGroups = baseShiftGroups.map((group) => ({
    ...group,
    rows: [...group.rows, ...customShifts.filter((shift) => shift.groupKey === group.groupKey)],
  }));

  const openCreateModal = () => {
    setForm(EMPTY_SHIFT_FORM);
    setFormError('');
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setFormError('');
  };

  const saveShift = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const code = form.code.trim().toUpperCase();
    const name = form.name.trim();
    const company = form.company.trim();
    const allCodes = shiftGroups.flatMap((group) => group.rows.map((row) => row.code.toUpperCase()));

    if (!code || !name || !company || !form.startTime || !form.endTime) {
      setFormError('กรุณากรอกข้อมูลที่จำเป็นให้ครบ');
      return;
    }

    if (allCodes.includes(code)) {
      setFormError('รหัสกะนี้ถูกใช้งานแล้ว');
      return;
    }

    if ((form.breakStart && !form.breakEnd) || (!form.breakStart && form.breakEnd)) {
      setFormError('กรุณาระบุเวลาเริ่มพักและสิ้นสุดพักให้ครบ');
      return;
    }

    const time = form.breakStart && form.breakEnd
      ? `${form.startTime}-${form.breakStart} / ${form.breakEnd}-${form.endTime}`
      : `${form.startTime}-${form.endTime}`;
    const now = new Date();
    const newShift: ShiftRow = {
      enabled: form.enabled,
      code,
      name,
      type: SHIFT_GROUP_META[form.groupKey].type,
      time,
      company,
      updatedBy: 'HR Admin',
      updatedAt: now.toLocaleString('th-TH', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      groupKey: form.groupKey,
      description: form.description.trim(),
      timezone: form.timezone,
      color: form.color,
      attendanceRule: form.attendanceRule,
      flexibleEntryEnabled: form.flexibleEntryEnabled,
      flexibleMinutes: Number(form.flexibleMinutes) || 0,
      minimumWorkHours: Number(form.minimumWorkHours) || 0,
      trackBreak: form.trackBreak,
      shiftAllowanceEnabled: form.shiftAllowanceEnabled,
      shiftAllowanceAmount: Number(form.shiftAllowanceAmount) || 0,
      prorateShiftAllowance: form.prorateShiftAllowance,
      holidayPremiumEnabled: form.holidayPremiumEnabled,
      overtimePremiumEnabled: form.overtimePremiumEnabled,
    };
    const nextShifts = [...customShifts, newShift];

    setCustomShifts(nextShifts);
    window.localStorage.setItem(CUSTOM_SHIFTS_STORAGE_KEY, JSON.stringify(nextShifts));
    closeCreateModal();
  };

  const allShiftRows = shiftGroups.flatMap((group) => group.rows);
  const filteredShiftRows = allShiftRows.filter((row) => {
    if (filterCompany && row.company !== filterCompany) return false;
    if (filterType && row.type !== filterType) return false;
    if (filterStatus === 'enabled' && !row.enabled) return false;
    if (filterStatus === 'disabled' && row.enabled) return false;
    return true;
  });

  return (
    <div className="p-5">
      <div className="hr-settings-toolbar">
        <div className="hr-settings-toolbar__filters">
          <input
            type="search"
            placeholder="ค้นหากะการทำงาน"
            className="hr-settings-search"
          />
        </div>
        <div className="hr-filter-chip-group">
          <FilterChipSelect label="บริษัท"   value={filterCompany} options={SHIFT_FILTER_COMPANY_OPTIONS} onChange={setFilterCompany} accent={accent} />
          <FilterChipSelect label="ประเภทกะ" value={filterType}    options={SHIFT_FILTER_TYPE_OPTIONS}    onChange={setFilterType}    accent={accent} />
          <FilterChipSelect label="สถานะ"    value={filterStatus}  options={SHIFT_FILTER_STATUS_OPTIONS}   onChange={setFilterStatus}  accent={accent} />
          <button
            type="button"
            onClick={openCreateModal}
            className="hr-settings-primary-action"
            style={{ backgroundColor: accent }}
          >
            + เพิ่มกะการทำงาน
          </button>
        </div>
      </div>

      <div className="hr-settings-table-wrap">
        <table className="hr-settings-table">
          <thead>
            <tr>
              {['ชื่อกะ', 'รหัสกะ', 'รายละเอียด', 'บริษัท', 'แก้ไขล่าสุด', 'สถานะ'].map((header) => (
                <th key={header}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredShiftRows.map((row) => (
              <tr key={row.code}>
                <td>
                  <div className="flex flex-col gap-1">
                    <span className="hr-settings-table__primary">{row.name}</span>
                    <span className="hr-settings-table__secondary">{row.type}</span>
                  </div>
                </td>
                <td>
                  <span className="hr-settings-table__code">{row.code}</span>
                </td>
                <td>
                  <p className="hr-settings-table__detail">{row.time}</p>
                </td>
                <td>
                  <p className="hr-settings-table__company">{row.company}</p>
                </td>
                <td>
                  <p className="hr-settings-table__detail font-medium">{row.updatedBy}</p>
                  <p className="hr-settings-table__secondary mt-0.5 text-[11px]">{row.updatedAt}</p>
                </td>
                <td>
                  <span
                    className={`hr-settings-status ${
                      row.enabled ? 'hr-settings-status--enabled' : 'hr-settings-status--disabled'
                    }`}
                  >
                    {row.enabled ? 'ใช้งาน' : 'ปิดใช้งาน'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreateModal ? (
        <div className="fixed inset-0 z-[80] flex flex-col bg-[#f7f8fb] text-slate-950" role="dialog" aria-modal="true" aria-labelledby="create-shift-title">
          <form onSubmit={saveShift} className="hr-shift-form flex min-h-0 flex-1 flex-col">
            <header className="flex min-h-16 flex-shrink-0 flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-5 py-2 sm:px-7">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  aria-label="กลับ"
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                >
                  ←
                </button>
                <div className="min-w-0">
                  <h3 id="create-shift-title" className="text-base font-semibold text-slate-950">เพิ่มกะการทำงาน</h3>
                  <p className="text-xs font-normal text-slate-500">ตั้งค่าข้อมูล เวลา และนโยบายการลงเวลาของกะ</p>
                </div>
              </div>
              <ShiftToggle
                checked={form.enabled}
                onChange={(enabled) => setForm({ ...form, enabled })}
                label={form.enabled ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                accent={accent}
              />
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="mx-auto w-full max-w-5xl space-y-5 px-5 py-7 sm:px-8 lg:px-12 lg:py-10">
                <ShiftFormSection number="1" title="ข้อมูลกะ" description="ข้อมูลพื้นฐานที่ใช้ค้นหาและเลือกกะให้พนักงาน">
                  <div className="grid gap-4 md:grid-cols-2">
                    <ShiftFormField label="ชื่อกะ*" className="md:col-span-2">
                      <input
                        autoFocus
                        value={form.name}
                        onChange={(event) => setForm({ ...form, name: event.target.value })}
                        className="hr-shift-control"
                        placeholder="เช่น สำนักงาน 08.30-17.30"
                      />
                    </ShiftFormField>
                    <ShiftFormField label="รหัสกะ*" hint="ใช้ตัวอักษรอังกฤษหรือตัวเลข และต้องไม่ซ้ำ">
                      <input
                        value={form.code}
                        onChange={(event) => setForm({ ...form, code: event.target.value })}
                        className="hr-shift-control uppercase"
                        placeholder="เช่น WC006"
                      />
                    </ShiftFormField>
                    <ShiftFormField label="บริษัท*">
                      <HrCustomSelect
                        label="บริษัท"
                        value={form.company}
                        options={COMPANY_OPTIONS}
                        onChange={(company) => setForm({ ...form, company })}
                      />
                    </ShiftFormField>
                    <ShiftFormField label="เขตเวลา">
                      <HrCustomSelect
                        label="เขตเวลา"
                        value={form.timezone}
                        options={TIMEZONE_OPTIONS}
                        onChange={(timezone) => setForm({ ...form, timezone })}
                      />
                    </ShiftFormField>
                    <ShiftFormField label="สีประจำกะ">
                      <ShiftColorPicker value={form.color} onChange={(color) => setForm({ ...form, color })} />
                    </ShiftFormField>
                    <ShiftFormField label="รายละเอียด" className="md:col-span-2">
                      <textarea
                        value={form.description}
                        onChange={(event) => setForm({ ...form, description: event.target.value })}
                        className="hr-shift-control"
                        placeholder="รายละเอียดเพิ่มเติมของกะการทำงาน"
                      />
                    </ShiftFormField>
                  </div>
                </ShiftFormSection>

                <ShiftFormSection number="2" title="ประเภทกะ" description="เลือกรูปแบบที่ตรงกับวิธีนับวันและเวลาออก">
                  <div className="grid gap-3 md:grid-cols-2">
                    {SHIFT_TYPE_OPTIONS.map((option) => {
                      const selected = form.groupKey === option.key;
                      return (
                        <button
                          key={option.key}
                          type="button"
                          onClick={() => setForm({ ...form, groupKey: option.key })}
                          className={`hr-shift-option ${selected ? 'hr-shift-option--selected' : ''}`}
                        >
                          <span
                            className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border ${
                              selected ? 'border-transparent text-white' : 'border-gray-300 bg-white'
                            }`}
                            style={selected ? { backgroundColor: accent } : undefined}
                          >
                            {selected ? '✓' : ''}
                          </span>
                          <span>
                            <span className="block text-sm font-medium text-slate-800">{option.label}</span>
                            <span className="mt-1 block text-xs font-normal leading-5 text-slate-500">{option.description}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </ShiftFormSection>

                <ShiftFormSection number="3" title="ช่วงเวลา" description="กำหนดเวลาเข้าออกและเวลาพักในรูปแบบ 24 ชั่วโมง">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <ShiftFormField label="เวลาเข้า*">
                      <TimePicker24 value={form.startTime} onChange={(startTime) => setForm({ ...form, startTime })} label="เวลาเข้า" />
                    </ShiftFormField>
                    <ShiftFormField label="เริ่มพัก">
                      <TimePicker24 value={form.breakStart} onChange={(breakStart) => setForm({ ...form, breakStart })} label="เวลาเริ่มพัก" allowEmpty />
                    </ShiftFormField>
                    <ShiftFormField label="สิ้นสุดพัก">
                      <TimePicker24 value={form.breakEnd} onChange={(breakEnd) => setForm({ ...form, breakEnd })} label="เวลาสิ้นสุดพัก" allowEmpty />
                    </ShiftFormField>
                    <ShiftFormField label="เวลาออก*">
                      <TimePicker24 value={form.endTime} onChange={(endTime) => setForm({ ...form, endTime })} label="เวลาออก" />
                    </ShiftFormField>
                  </div>
                </ShiftFormSection>

                <ShiftFormSection number="4" title="นโยบายการลงเวลา" description="เงื่อนไขสำหรับตรวจสอบเวลาเข้าออกของกะนี้">
                  <div className="space-y-5">
                    <ShiftFormField label="เงื่อนไขการลงเวลา">
                      <HrCustomSelect
                        label="เงื่อนไขการลงเวลา"
                        value={form.attendanceRule}
                        options={ATTENDANCE_RULE_OPTIONS}
                        onChange={(attendanceRule) => setForm({
                          ...form,
                          attendanceRule,
                          flexibleEntryEnabled: attendanceRule === ATTENDANCE_RULE_OPTIONS[0]
                            ? form.flexibleEntryEnabled
                            : false,
                        })}
                      />
                    </ShiftFormField>

                    {form.attendanceRule === ATTENDANCE_RULE_OPTIONS[0] ? (
                      <div className="hr-shift-setting-panel">
                        <div className="hr-shift-setting-panel__header">
                          <div>
                            <p className="hr-shift-setting-panel__title">อนุญาตให้เข้างานแบบยืดหยุ่นได้</p>
                            <p className="hr-shift-setting-panel__description">พนักงานสามารถเริ่มงานคลาดเคลื่อนจากเวลาในกะได้</p>
                          </div>
                          <ShiftToggle
                            checked={form.flexibleEntryEnabled}
                            onChange={(flexibleEntryEnabled) => setForm({ ...form, flexibleEntryEnabled })}
                            ariaLabel="อนุญาตให้เข้างานแบบยืดหยุ่นได้"
                            accent={accent}
                          />
                        </div>
                        {form.flexibleEntryEnabled ? (
                          <div className="hr-shift-setting-panel__body">
                            <ShiftFormField label="ยืดหยุ่นได้" suffix="นาที">
                              <input
                                type="number"
                                min="0"
                                value={form.flexibleMinutes}
                                onChange={(event) => setForm({ ...form, flexibleMinutes: event.target.value })}
                                className="hr-shift-control pr-14 text-right"
                              />
                            </ShiftFormField>
                          </div>
                        ) : null}
                      </div>
                    ) : null}

                    {form.attendanceRule === ATTENDANCE_RULE_OPTIONS[1] ? (
                      <ShiftFormField label="ทำงานอย่างน้อย" suffix="ชั่วโมง">
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          value={form.minimumWorkHours}
                          onChange={(event) => setForm({ ...form, minimumWorkHours: event.target.value })}
                          className="hr-shift-control pr-16 text-right"
                        />
                      </ShiftFormField>
                    ) : null}
                  </div>
                </ShiftFormSection>

                <ShiftFormSection number="5" title="ตั้งค่าเพิ่มเติม" description="กำหนดค่ากะและเงื่อนไขการคำนวณเพิ่มเติม">
                  <div className="hr-shift-setting-panel mb-4">
                    <div className="hr-shift-setting-panel__header">
                      <div>
                        <p className="hr-shift-setting-panel__title">คำนวณสถานะช่วงพัก</p>
                        <p className="hr-shift-setting-panel__description">ตรวจสอบการออกพักและกลับเข้าทำงานตามเวลาที่กำหนด</p>
                      </div>
                      <ShiftToggle checked={form.trackBreak} onChange={(trackBreak) => setForm({ ...form, trackBreak })} ariaLabel="คำนวณสถานะช่วงพัก" accent={accent} />
                    </div>
                  </div>

                  <div className="hr-shift-setting-panel">
                    <div className="hr-shift-setting-panel__header">
                      <div>
                        <p className="hr-shift-setting-panel__title">คำนวณค่ากะ</p>
                        <p className="hr-shift-setting-panel__description">ระบบคำนวณค่ากะให้อัตโนมัติเมื่อทำงานครบตามเงื่อนไขของกะ</p>
                      </div>
                      <ShiftToggle
                        checked={form.shiftAllowanceEnabled}
                        onChange={(shiftAllowanceEnabled) => setForm({ ...form, shiftAllowanceEnabled })}
                        ariaLabel="คำนวณค่ากะ"
                        accent={accent}
                      />
                    </div>
                    {form.shiftAllowanceEnabled ? (
                      <div className="space-y-4 border-t border-gray-200 bg-gray-50/60 px-4 py-4">
                        <ShiftFormField label="ค่ากะที่จะได้รับ" suffix="บาท">
                          <input
                            type="number"
                            min="0"
                            value={form.shiftAllowanceAmount}
                            onChange={(event) => setForm({ ...form, shiftAllowanceAmount: event.target.value })}
                            className="hr-shift-control pr-14 text-right"
                          />
                        </ShiftFormField>
                        <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-700">
                          <input
                            type="checkbox"
                            checked={form.prorateShiftAllowance}
                            onChange={(event) => setForm({ ...form, prorateShiftAllowance: event.target.checked })}
                            className="h-4 w-4 rounded border-gray-300"
                            style={{ accentColor: accent }}
                          />
                          โปรเรตตามชั่วโมงการทำงานจริง
                        </label>
                        <div className="space-y-3 border-t border-gray-200 pt-4">
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-sm text-gray-700">ค่ากะพิเศษจากทำงานในวันหยุด</span>
                            <ShiftToggle checked={form.holidayPremiumEnabled} onChange={(holidayPremiumEnabled) => setForm({ ...form, holidayPremiumEnabled })} ariaLabel="ค่ากะพิเศษจากทำงานในวันหยุด" accent={accent} />
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-sm text-gray-700">ค่ากะพิเศษจากเวลาทำงาน</span>
                            <ShiftToggle checked={form.overtimePremiumEnabled} onChange={(overtimePremiumEnabled) => setForm({ ...form, overtimePremiumEnabled })} ariaLabel="ค่ากะพิเศษจากเวลาทำงาน" accent={accent} />
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </ShiftFormSection>

                {formError ? (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{formError}</div>
                ) : null}
              </div>
            </div>

            <footer className="flex min-h-16 flex-shrink-0 flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-white px-5 py-3 sm:px-7">
              <p className="text-xs font-normal text-slate-400">เวลาใช้รูปแบบ 24 ชั่วโมง</p>
              <div className="flex gap-2">
                <button type="button" onClick={closeCreateModal} className="h-10 rounded-lg px-5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950">
                  ยกเลิก
                </button>
                <button type="submit" className="h-10 rounded-lg bg-indigo-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700">
                  บันทึกกะการทำงาน
                </button>
              </div>
            </footer>
          </form>
        </div>
      ) : null}
    </div>
  );
}

function TimePicker24({
  value,
  onChange,
  label,
  allowEmpty = false,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  allowEmpty?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [openAbove, setOpenAbove] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const hourListRef = useRef<HTMLDivElement>(null);
  const minuteListRef = useRef<HTMLDivElement>(null);
  const selectedHourRef = useRef<HTMLButtonElement>(null);
  const selectedMinuteRef = useRef<HTMLButtonElement>(null);
  const [hour = '00', minute = '00'] = value ? value.split(':') : ['00', '00'];
  const hours = Array.from({ length: 24 }, (_, index) => String(index).padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, index) => String(index).padStart(2, '0'));

  useEffect(() => {
    if (!open) return;
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    window.requestAnimationFrame(() => {
      centerSelectedOption(hourListRef.current, selectedHourRef.current);
      centerSelectedOption(minuteListRef.current, selectedMinuteRef.current);
    });
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={() => {
          if (!open) {
            const rect = rootRef.current?.getBoundingClientRect();
            setOpenAbove(Boolean(rect && window.innerHeight - rect.bottom < 320 && rect.top > 320));
          }
          setOpen((current) => !current);
        }}
        className="hr-shift-picker-trigger"
      >
        <span className={value ? '' : 'font-normal text-gray-400'}>{value || '--:--'}</span>
        <span aria-hidden="true" className="flex h-5 w-5 items-center justify-center rounded-full border border-gray-300 text-[10px] text-gray-500">◷</span>
      </button>

      {open ? (
        <div className={`hr-shift-popover w-[220px] ${
          openAbove ? 'bottom-[44px]' : 'top-[44px]'
        }`}>
          <div className="grid grid-cols-2 border-b border-slate-100 bg-slate-50 px-2 py-2 text-center text-[11px] font-semibold text-slate-400">
            <span>ชั่วโมง</span>
            <span>นาที</span>
          </div>
          <div className="grid grid-cols-2 divide-x divide-gray-100">
            <div ref={hourListRef} className="max-h-56 overflow-y-auto p-1.5">
              {hours.map((option) => (
                <button
                  key={option}
                  ref={value && hour === option ? selectedHourRef : undefined}
                  type="button"
                  onClick={() => onChange(`${option}:${minute}`)}
                  className={`mb-1 h-8 w-full rounded-md text-xs font-medium ${
                    value && hour === option ? 'text-white' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  style={value && hour === option ? { backgroundColor: '#2f80ff' } : undefined}
                >
                  {option}
                </button>
              ))}
            </div>
            <div ref={minuteListRef} className="max-h-56 overflow-y-auto p-1.5">
              {minutes.map((option) => (
                <button
                  key={option}
                  ref={value && minute === option ? selectedMinuteRef : undefined}
                  type="button"
                  onClick={() => {
                    onChange(`${hour}:${option}`);
                    setOpen(false);
                  }}
                  className={`mb-1 h-8 w-full rounded-md text-xs font-medium ${
                    value && minute === option ? 'text-white' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  style={value && minute === option ? { backgroundColor: '#2f80ff' } : undefined}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          {allowEmpty ? (
            <div className="border-t border-gray-200 p-2">
              <button
                type="button"
                onClick={() => {
                  onChange('');
                  setOpen(false);
                }}
                className="h-8 w-full rounded-md text-xs font-medium text-gray-500 hover:bg-gray-100"
              >
                ไม่กำหนดเวลา
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function centerSelectedOption(container: HTMLDivElement | null, option: HTMLButtonElement | null) {
  if (!container || !option) return;
  container.scrollTop = option.offsetTop - (container.clientHeight - option.offsetHeight) / 2;
}

function ShiftColorPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const customColorRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label="เลือกสีประจำกะ"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="hr-shift-picker-trigger"
      >
        <span className="flex items-center gap-3">
          <ColorSwatch color={value} selected={false} />
          <span className={value ? 'font-medium text-gray-700' : 'text-gray-500'}>{value ? value.toUpperCase() : 'ไม่มีสี'}</span>
        </span>
        <span className="text-xs text-gray-400">⌄</span>
      </button>

      {open ? (
        <div className="hr-shift-popover top-[44px] w-[226px] p-3">
          <div className="grid grid-cols-6 gap-2">
            {SHIFT_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                aria-label={`เลือกสี ${color}`}
                onClick={() => {
                  onChange(color);
                  setOpen(false);
                }}
                className="flex h-7 w-7 items-center justify-center rounded-full transition hover:scale-110"
              >
                <ColorSwatch color={color} selected={value === color} />
              </button>
            ))}
            <button
              type="button"
              aria-label="ไม่มีสี"
              onClick={() => {
                onChange('');
                setOpen(false);
              }}
              className="flex h-7 w-7 items-center justify-center rounded-full transition hover:scale-110"
            >
              <ColorSwatch color="" selected={!value} />
            </button>
          </div>
          <button
            type="button"
            onClick={() => customColorRef.current?.click()}
            className="mt-3 h-9 w-full rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            กำหนดเอง
          </button>
          <input
            ref={customColorRef}
            type="color"
            value={value || '#2f80ff'}
            onChange={(event) => {
              onChange(event.target.value);
              setOpen(false);
            }}
            className="sr-only"
            tabIndex={-1}
          />
        </div>
      ) : null}
    </div>
  );
}

function ColorSwatch({ color, selected }: { color: string; selected: boolean }) {
  return (
    <span
      className={`relative block h-6 w-6 rounded-full border ${selected ? 'ring-2 ring-blue-400 ring-offset-2' : ''}`}
      style={color ? { backgroundColor: color, borderColor: color } : { borderColor: '#94a3b8', backgroundColor: '#fff' }}
    >
      {!color ? <span className="absolute left-[3px] top-[11px] h-px w-[17px] -rotate-45 bg-gray-500" /> : null}
    </span>
  );
}

function ShiftFormField({
  label,
  className = '',
  hint,
  suffix,
  children,
}: {
  label: string;
  className?: string;
  hint?: string;
  suffix?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <span className="hr-shift-field__label">{label}</span>
      <span className="hr-shift-field__control">
        {children}
        {suffix ? <span className="hr-shift-field__suffix">{suffix}</span> : null}
      </span>
      {hint ? <span className="hr-shift-field__hint">{hint}</span> : null}
    </div>
  );
}

function ShiftFormSection({
  number,
  title,
  description,
  children,
}: {
  number: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="hr-shift-section">
      <div className="hr-shift-section__header">
        <span className="hr-shift-section__number">
          {number}
        </span>
        <div>
          <h4 className="hr-shift-section__title">{title}</h4>
          <p className="hr-shift-section__description">{description}</p>
        </div>
      </div>
      <div className="hr-shift-section__body">{children}</div>
    </section>
  );
}

function ShiftToggle({
  checked,
  onChange,
  label,
  ariaLabel,
  accent,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  ariaLabel?: string;
  accent: string;
}) {
  return (
    <label className="hr-shift-toggle">
      {label ? <span className="hr-shift-toggle__label">{label}</span> : null}
      <input type="checkbox" aria-label={ariaLabel ?? label} checked={checked} onChange={(event) => onChange(event.target.checked)} className="sr-only" />
      <span className="hr-shift-toggle__track" style={checked ? { backgroundColor: accent } : undefined}>
        <span className={`hr-shift-toggle__thumb ${checked ? 'hr-shift-toggle__thumb--checked' : ''}`} />
      </span>
    </label>
  );
}

function TimePolicyCard({
  title,
  description,
  value,
}: {
  title: string;
  description: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[13px] font-medium text-gray-800">{title}</h3>
          <p className="mt-0.5 text-xs leading-5 text-gray-500">{description}</p>
        </div>
        <span className="shrink-0 rounded bg-white px-1.5 py-0.5 text-[10px] font-medium text-gray-600 shadow-sm">
          {value}
        </span>
      </div>
    </div>
  );
}

function getTimeSettingsView(activeItem: HrNavChild) {
  const path = activeItem.path;

  // สถานที่และวิธีลงเวลา — ตารางรวมทุกอุปกรณ์ (แยกตามอุปกรณ์อยู่ใน modal สร้าง)
  if (path.includes('attendance-locations') || path.includes('devices') || path.includes('gps') || path.includes('network')) {
    return {
      actionLabel: 'เพิ่มสถานที่เวิร์กอิน',
      filters: ['บริษัท', 'ประเภทอุปกรณ์', 'ใช้งาน'],
      policies: [
        { title: 'GPS',             description: 'ลงเวลาด้วยตำแหน่งที่ตั้ง (พิกัด + รัศมี)',          value: 'พร้อม' },
        { title: 'IOMO (สแกนหน้า)', description: 'ลงเวลาด้วยเครื่องสแกนใบหน้าความแม่นยำสูง',          value: 'พร้อม' },
        { title: 'QR Code Station', description: 'ลงเวลาด้วยการสแกน QR Code ที่จุดสแกน',                value: 'พร้อม' },
      ],
      headers: ['ชื่อสถานที่เวิร์กอิน', 'รายละเอียด', 'อัปเดตล่าสุด', 'สถานะ'],
      rows: [
        ['สำนักงานใหญ่ กรุงเทพ', 'GPS · รัศมี 150 เมตร\nพนักงาน 24 คน', 'เมื่อ 5 นาทีก่อน • 17/06/2569 09:48', 'ใช้งาน'],
        ['IOMO Lobby ชั้น 1', 'IOMO · IOMO-BKK-001\nพนักงาน 18 คน', 'เมื่อ 5 นาทีก่อน • 17/06/2569 09:48', 'ใช้งาน'],
        ['ทางเข้าหลัก สำนักงาน', 'QR Code Station · QR-MAIN\nพนักงาน 8 คน', 'เมื่อ 5 นาทีก่อน • 17/06/2569 09:48', 'ใช้งาน'],
        ['สาขาเชียงใหม่', 'GPS · รัศมี 200 เมตร\nพนักงาน 12 คน', 'เมื่อ 1 วันก่อน • 16/06/2569 14:22', 'ใช้งาน'],
        ['Warehouse Gate', 'QR Code Station · QR-WH-01\nพนักงาน 0 คน', 'เมื่อ 1 สัปดาห์ก่อน', 'ไม่ใช้งาน'],
      ],
    };
  }

  return {
    actionLabel: 'เพิ่มกะการทำงาน',
    filters: ['บริษัท', 'ประเภทกะ', 'ใช้งาน'],
    policies: [
      { title: 'เทมเพลตกะพนักงาน', description: 'มีประโยชน์สำหรับเลือกตอนเพิ่มพนักงานหรือกำหนดทั้งแผนกในครั้งเดียว', value: 'ควรมี' },
      { title: 'กะข้ามวัน', description: 'รองรับกะกลางคืนและการตัดรอบที่ข้ามวันปฏิทิน', value: 'รองรับ' },
    ],
    headers: ['ชื่อกะ', 'รหัสกะ', 'เวลา', 'ใช้กับ', 'สถานะ'],
    rows: [
      ['สำนักงาน 08.00-17.00', 'S1', '08:00-17:00', 'พนักงานออฟฟิศ', 'ใช้งาน'],
      ['กะเช้า 06.00-14.00', 'S2', '06:00-14:00', 'Operations', 'ใช้งาน'],
      ['กะบ่าย 14.00-22.00', 'S3', '14:00-22:00', 'Operations', 'ใช้งาน'],
      ['กะดึก 22.00-06.00', 'S4', '22:00-06:00', 'Operations', 'ใช้งาน'],
    ],
  };
}

function isShiftSettingsPath(path: string) {
  return [
    'work-schedules',
    'standard-schedules',
    'day-shifts',
    'overnight-shifts',
    'shift-rotation',
    'schedule-templates',
    'cutoff-rules',
  ].some((segment) => path.includes(segment));
}

function SystemUsersTable({ accent }: { accent: string }) {
  return (
    <div className="p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {['บทบาท', 'ผู้บังคับบัญชา', 'สถานะ'].map((filter) => (
            <button key={filter} type="button" className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-700">
              {filter}
            </button>
          ))}
        </div>
        <button type="button" className="inline-flex h-9 items-center gap-2 rounded-lg px-4 text-xs font-medium text-white" style={{ backgroundColor: accent }}>
          + เพิ่มผู้ใช้งาน
        </button>
      </div>
      <SettingsTable
        headers={['รหัส', 'รายชื่อ', 'อีเมล', 'ยืนยันตัวตน', 'บทบาท', 'สถานะ']}
        rows={[
          ['23007', 'กมลวรรณ โพศาล', '-', '-', 'Staff', 'ใช้งาน'],
          ['23003', 'พิมพ์ภา โพศาล', '-', '-', 'Staff', 'ใช้งาน'],
          ['00001', 'อนุภัทร ใจเที่ยงแท้', 'anuphat8688@gmail.com', '✓', 'Administrator, Staff', 'ใช้งาน'],
          ['23006', 'เอกอร โพศาล', '-', '-', 'Staff', 'ใช้งาน'],
        ]}
        accent={accent}
      />
    </div>
  );
}

function SettingsTable({
  headers,
  rows,
  accent,
  onRowClick,
  activeRowKey,
  getRowKey,
}: {
  headers: string[];
  rows: string[][];
  accent?: string;
  onRowClick?: (row: string[]) => void;
  activeRowKey?: string | null;
  getRowKey?: (row: string[]) => string;
}) {
  return (
    <div className="hr-settings-table-wrap mt-4">
      <table className="hr-settings-table" style={headers.length > 8 ? { minWidth: '82rem' } : undefined}>
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const rowKey = getRowKey?.(row) ?? row.join('-');
            const active = activeRowKey === rowKey;
            return (
              <tr
                key={rowKey}
                role={onRowClick ? 'button' : undefined}
                tabIndex={onRowClick ? 0 : undefined}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                onKeyDown={onRowClick ? (event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onRowClick(row);
                  }
                } : undefined}
                className={onRowClick ? 'cursor-pointer outline-none' : undefined}
                style={active ? { boxShadow: `inset 3px 0 0 ${accent ?? '#4f46e5'}` } : undefined}
              >
                {row.map((cell, index) => {
                  const lines = cell.split('\n');
                  const isStatusCell = index === row.length - 1;
                  const disabled = cell.startsWith('ไม่') || cell.startsWith('ต้อง') || cell.startsWith('ร่าง');

                  return (
                    <td key={`${cell}-${index}`}>
                      {isStatusCell ? (
                        <span
                          className={`hr-settings-status ${
                            disabled ? 'hr-settings-status--disabled' : 'hr-settings-status--enabled'
                          }`}
                        >
                          {cell}
                        </span>
                      ) : lines.length > 1 ? (
                        <span className="block">
                          <span className="hr-settings-table__primary block">{lines[0]}</span>
                          <span className="hr-settings-table__secondary mt-1 block">{lines.slice(1).join(' ')}</span>
                        </span>
                      ) : index === 0 ? (
                        <span className="hr-settings-table__primary">{cell}</span>
                      ) : (
                        <span className="hr-settings-table__detail">{cell}</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}


function countSettingsItems(items: HrNavChild[]): number {
  return items.reduce((total, item) => total + 1 + (item.children ? countSettingsItems(item.children) : 0), 0);
}

function CardIllustration({ groupKey }: { groupKey: GroupKey }) {
  if (groupKey === 'company') {
    return (
      <svg viewBox="0 0 190 120" className="h-28 w-44" fill="none">
        <ellipse cx="72" cy="103" rx="58" ry="10" fill="#000" opacity=".12" />
        <rect x="76" y="20" width="54" height="75" rx="9" fill="#ff934d" />
        <rect x="49" y="42" width="43" height="53" rx="8" fill="#ff6a3d" />
        <rect x="87" y="34" width="10" height="13" rx="2" fill="#ffe3cf" />
        <rect x="107" y="34" width="10" height="13" rx="2" fill="#ffe3cf" />
        <rect x="87" y="56" width="10" height="13" rx="2" fill="#ffe3cf" />
        <rect x="107" y="56" width="10" height="13" rx="2" fill="#ffe3cf" />
        <circle cx="58" cy="83" r="25" fill="#fff" />
        <rect x="30" y="80" width="34" height="7" rx="3" fill="#2f80ff" />
        <rect x="35" y="91" width="42" height="7" rx="3" fill="#00c99a" />
        <path d="M51 78c3 6 11 6 14 0" stroke="#ff6a3d" strokeWidth="4" strokeLinecap="round" />
      </svg>
    );
  }

  if (groupKey === 'time') {
    return (
      <svg viewBox="0 0 190 120" className="h-28 w-44" fill="none">
        <ellipse cx="95" cy="103" rx="62" ry="10" fill="#000" opacity=".12" />
        <rect x="45" y="27" width="78" height="61" rx="10" fill="#d9ecff" />
        <rect x="54" y="17" width="78" height="61" rx="10" fill="#ffffff" />
        <rect x="54" y="17" width="78" height="19" rx="10" fill="#2f80ff" />
        <circle cx="73" cy="50" r="4" fill="#91c6ff" />
        <circle cx="93" cy="50" r="4" fill="#91c6ff" />
        <circle cx="113" cy="50" r="4" fill="#91c6ff" />
        <circle cx="73" cy="68" r="4" fill="#91c6ff" />
        <circle cx="93" cy="68" r="4" fill="#2f80ff" />
        <circle cx="127" cy="76" r="24" fill="#2f80ff" />
        <path d="M127 63v15l10 7" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
      </svg>
    );
  }

  if (groupKey === 'payroll') {
    return (
      <svg viewBox="0 0 190 120" className="h-28 w-44" fill="none">
        <ellipse cx="96" cy="103" rx="60" ry="10" fill="#000" opacity=".12" />
        <rect x="50" y="37" width="81" height="45" rx="10" fill="#fff" />
        <rect x="50" y="48" width="81" height="12" fill="#00c99a" />
        <rect x="66" y="68" width="35" height="7" rx="3" fill="#a2f1d6" />
        <circle cx="124" cy="72" r="25" fill="#00c99a" />
        <path d="M124 55v35M134 61c-4-4-20-4-20 4 0 10 20 5 20 16 0 8-16 8-22 3" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
        <circle cx="70" cy="29" r="9" fill="#ffc247" />
        <circle cx="88" cy="22" r="6" fill="#ff934d" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 190 120" className="h-28 w-44" fill="none">
      <ellipse cx="94" cy="103" rx="60" ry="10" fill="#000" opacity=".12" />
      <circle cx="90" cy="59" r="43" fill="#7a5cff" opacity=".18" />
      <circle cx="89" cy="50" r="19" fill="#7a5cff" />
      <path d="M55 95c6-25 18-36 34-36s28 11 34 36" fill="#7a5cff" />
      <path d="M132 35l8 5 10-2 4 10 8 6-5 10 2 10-10 4-6 8-9-5-10 2-4-10-8-6 5-10-2-10 10-4 7-8Z" fill="#fff" />
      <circle cx="137" cy="61" r="15" fill="#7a5cff" />
      <path d="m130 61 5 5 10-12" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function getActiveSettingsGroup(pathname: string): HrSettingsGroup | null {
  const parts = getSettingsParts(pathname);
  const groupKey = parts[0] as GroupKey | undefined;
  return hrSettingsGroups.find((group) => group.key === groupKey) ?? null;
}

function getActiveSettingsItem(group: HrSettingsGroup, pathname: string): HrNavChild {
  const target = normalizePath(pathname);
  const items = flattenSettingsItems(group.items);
  return items.find((item) => normalizePath(getSettingsPath(group, item)) === target) ?? getActiveSettingsTopic(group, pathname);
}

function getActiveSettingsTopic(group: HrSettingsGroup, pathname: string): HrNavChild {
  const target = normalizePath(pathname);
  return group.items.find((item) => settingsTopicMatches(group, item, target)) ?? group.items[0];
}

function settingsTopicMatches(group: HrSettingsGroup, item: HrNavChild, targetPath: string): boolean {
  if (normalizePath(getSettingsPath(group, item)) === targetPath) return true;
  return item.children?.some((child) => settingsTopicMatches(group, child, targetPath)) ?? false;
}

function getSettingsPath(group: HrSettingsGroup, item: HrNavChild): string {
  const parts = item.path.split('/').filter(Boolean);
  const sourceSection = parts[1];
  const rest = parts.slice(2);

  if (sourceSection === 'settings') {
    const settingsRest = rest[0] === group.key ? rest : [group.key, ...rest];
    return normalizePath([SETTINGS_ROOT, ...settingsRest].join('/'));
  }

  if (sourceSection === group.key) {
    return normalizePath([SETTINGS_ROOT, sourceSection, ...rest].join('/'));
  }

  if (group.key === 'company' && sourceSection === 'organization') {
    return normalizePath([SETTINGS_ROOT, group.key, sourceSection, ...rest].join('/'));
  }

  return normalizePath([SETTINGS_ROOT, group.key, sourceSection, ...rest].filter(Boolean).join('/'));
}

function getSettingsRouteHref(path: string): string {
  return `${SETTINGS_ROOT}?path=${encodeURIComponent(normalizePath(path))}`;
}

function getSettingsParts(pathname: string): string[] {
  const cleanPath = normalizePath(pathname);
  if (cleanPath === SETTINGS_ROOT || cleanPath === `${SETTINGS_ROOT}/setup-center`) return [];
  if (!cleanPath.startsWith(`${SETTINGS_ROOT}/`)) return [];
  return cleanPath.slice(SETTINGS_ROOT.length + 1).split('/').filter(Boolean);
}

function flattenSettingsItems(items: HrNavChild[]): HrNavChild[] {
  return items.flatMap((item) => [item, ...(item.children ? flattenSettingsItems(item.children) : [])]);
}

function normalizePath(path: string): string {
  const clean = path.split('?')[0]?.split('#')[0] ?? path;
  return clean.length > 1 ? clean.replace(/\/+$/, '') : clean;
}


function getProgress(progress: string) {
  const match = progress.match(/(\d+)\s*\/\s*(\d+)/);
  const done = Number(match?.[1] ?? 0);
  const total = Number(match?.[2] ?? 1);
  return {
    done,
    total,
    percent: Math.min(100, Math.max(0, (done / total) * 100)),
  };
}

function getFallbackTabs(groupKey: GroupKey) {
  if (groupKey === 'time') return [];
  if (groupKey === 'payroll') return [];
  if (groupKey === 'system') return ['ข้อมูลผู้ใช้', 'บทบาท', 'กลุ่ม', 'สิทธิ์การทำเงินเดือน'];
  return ['ทั่วไป', 'ปรับแต่งหน้าเข้าสู่ระบบ', 'ความปลอดภัยและความเป็นส่วนตัว'];
}

'use client';

import { useEffect, useRef, useState, type SVGProps } from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  LinkIcon,
  PlusIcon,
  RefreshIcon,
  TrashIcon,
  UsersIcon,
  XIcon,
} from '@/components/ui/icons';
import { DatePicker } from '@/components/ui/date-picker';
import { HrBadge, HrCustomSelect, HrDatePicker } from '@/components/humansource/hr-ui';
import { employees, type Employee } from '@/data/humansource/mock';
import { publicApiFetch } from '@/lib/api';

export function HrEmployeeListPage() {
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [openTabs, setOpenTabs] = useState<Employee[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [profileMinimized, setProfileMinimized] = useState(false);

  const handleSelectEmployee = (emp: Employee) => {
    setOpenTabs(prev => prev.find(e => e.id === emp.id) ? prev : [...prev, emp]);
    setActiveTabId(emp.id);
    setProfileMinimized(false);
  };

  const handleCloseTab = (id: string) => {
    setOpenTabs(prev => {
      const idx = prev.findIndex(e => e.id === id);
      const next = prev.filter(e => e.id !== id);
      if (activeTabId === id) {
        setActiveTabId(next[Math.max(0, idx - 1)]?.id ?? null);
      }
      return next;
    });
  };

  return (
    <>
      <EmployeeListPage
        onAdd={() => setShowAddEmployee(true)}
        onSelectEmployee={handleSelectEmployee}
      />
      {showAddEmployee ? <AddEmployeeModal onClose={() => setShowAddEmployee(false)} /> : null}
      {openTabs.length > 0 && activeTabId ? (
        <HrEmployeeProfileOverlay
          tabs={openTabs}
          activeId={activeTabId}
          minimized={profileMinimized}
          onSwitch={(id) => { setActiveTabId(id); setProfileMinimized(false); }}
          onCloseTab={handleCloseTab}
          onMinimize={() => setProfileMinimized(m => !m)}
          onCloseAll={() => { setOpenTabs([]); setActiveTabId(null); }}
        />
      ) : null}
    </>
  );
}

// ─── Employee list ────────────────────────────────────────────────────────────

const PRIMARY_TABS = [
  { key: 'all',        label: 'ทั้งหมด'         },
  { key: 'pending',    label: 'รอเริ่มงาน'      },
  { key: 'trial',      label: 'ทดลองงาน'        },
  { key: 'permanent',  label: 'บรรจุ'            },
  { key: 'terminated', label: 'พ้นสภาพ'          },
  { key: 'invited',    label: 'ตอบรับคำเชิญ'    },
];

const SMART_TABS_MAP: Record<string, { key: string; label: string }[]> = {
  all: [
    { key: 'all',        label: 'ทั้งหมด'       },
    { key: 'update',     label: 'รออัปเดต'      },
    { key: 'incomplete', label: 'รอเพิ่มข้อมูล' },
    { key: 'month',      label: 'ภายในเดือนนี้' },
    { key: 'recent',     label: 'แก้ไขล่าสุด'   },
  ],
  pending: [
    { key: 'all',          label: 'ทั้งหมด'              },
    { key: 'scheduled',    label: 'กำหนดการเริ่มงาน'     },
    { key: 'missing-data', label: 'ข้อมูลไม่ครบ'         },
    { key: 'no-fill',      label: 'ยังไม่ได้กรอกข้อมูล' },
  ],
  trial: [
    { key: 'all',          label: 'ทั้งหมด'                  },
    { key: 'not-due',      label: 'ยังไม่ถึงกำหนดประเมิน'   },
    { key: 'pending-eval', label: 'รอประเมิน'               },
    { key: 'evaluated',    label: 'ประเมินแล้ว'              },
    { key: 'passed',       label: 'สำเร็จ'                   },
  ],
  permanent: [
    { key: 'all',         label: 'ทั้งหมด'           },
    { key: 'near-expiry', label: 'ใกล้หมดสัญญาจ้าง' },
  ],
  terminated: [
    { key: 'all', label: 'ทั้งหมด' },
  ],
  invited: [
    { key: 'pending-approval', label: 'รออนุมัติ' },
  ],
};

type FilterKey = 'tenure' | 'age' | 'level' | 'dept' | 'group' | 'emptype' | 'location' | 'position' | 'shift';
type FilterDim =
  | { key: FilterKey; label: string; type: 'list'; options: string[] }
  | { key: FilterKey; label: string; type: 'range'; units: string[]; presets: string[] };

const FILTER_DIMS: FilterDim[] = [
  { key: 'tenure',   label: 'อายุงาน',       type: 'range', units: ['เดือน', 'ปี'], presets: ['น้อยกว่า 1 เดือน', 'น้อยกว่า 3 เดือน', 'น้อยกว่า 6 เดือน', 'น้อยกว่า 1 ปี', 'มากกว่า 1 ปี', 'มากกว่า 3 ปี', 'มากกว่า 5 ปี'] },
  { key: 'age',      label: 'อายุ',           type: 'range', units: ['ปี'], presets: ['น้อยกว่า 25 ปี', '25–35 ปี', '35–45 ปี', 'มากกว่า 45 ปี'] },
  { key: 'level',    label: 'ระดับ',          type: 'list', options: ['ระดับบริหาร', 'ระดับผู้จัดการ', 'ระดับหัวหน้างาน', 'ระดับพนักงาน'] },
  { key: 'dept',     label: 'สังกัด',         type: 'list', options: ['ฝ่ายบุคคล', 'ฝ่ายบัญชี', 'ฝ่ายขาย', 'IT', 'Operations', 'สำนักงานใหญ่', 'สาขาเชียงใหม่', 'สาขาภูเก็ต'] },
  { key: 'group',    label: 'กลุ่ม',          type: 'list', options: ['กลุ่ม A', 'กลุ่ม B', 'กลุ่ม C'] },
  { key: 'emptype',  label: 'ประเภท',         type: 'list', options: ['รายเดือน', 'รายวัน', 'พาร์ทไทม์'] },
  { key: 'location', label: 'สถานที่ทำงาน', type: 'list', options: ['สำนักงานใหญ่', 'สาขาเชียงใหม่', 'สาขาภูเก็ต'] },
  { key: 'position', label: 'ตำแหน่ง',       type: 'list', options: ['CEO', 'ผู้จัดการ', 'หัวหน้างาน', 'พนักงานขาย', 'พนักงานบัญชี', 'พนักงานทั่วไป', 'ผู้อำนวยการ'] },
  { key: 'shift',    label: 'กะการทำงาน',    type: 'list', options: ['ทำงาน 08:30 – 17:30'] },
];

const POS_LEVEL: Record<string, string> = {
  'CEO': 'ระดับบริหาร', 'ผู้อำนวยการ': 'ระดับบริหาร',
  'ผู้จัดการ': 'ระดับผู้จัดการ',
  'หัวหน้างาน': 'ระดับหัวหน้างาน',
  'พนักงานขาย': 'ระดับพนักงาน', 'พนักงานบัญชี': 'ระดับพนักงาน', 'พนักงานทั่วไป': 'ระดับพนักงาน',
};

const EMP_STATUS_COLOR: Record<Employee['status'], string> = {
  ปกติ:         'green',
  ลาพักร้อน:   'indigo',
  ลาออก:       'rose',
  ทดลองงาน:   'amber',
  สิ้นสุดสัญญา: 'slate',
};

type EmployeeLinkCode = {
  value: string;
  createdAt: number;
  expiresAt: number;
};

type EmployeeAccountState = {
  hasHrProfileLink: boolean;
  hasGhubLink: boolean;
  code?: EmployeeLinkCode;
};

type EmployeeAccountStateMap = Record<string, EmployeeAccountState>;

const LINK_CODE_TTL_MS = 10 * 60 * 1000;
const LINK_CODE_LENGTH = 6;
const LINK_CODE_LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const LINK_CODE_DIGITS = '23456789';
const LINK_CODE_ALPHABET = `${LINK_CODE_LETTERS}${LINK_CODE_DIGITS}`;

function createInitialEmployeeAccountStates(): EmployeeAccountStateMap {
  return employees.reduce<EmployeeAccountStateMap>((acc, employee, index) => {
    const hasGhubLink = index % 5 === 0;
    acc[employee.id] = {
      hasGhubLink,
      hasHrProfileLink: hasGhubLink || index % 4 !== 2,
    };
    return acc;
  }, {});
}

function createEmployeeLinkCode() {
  const randomValues = new Uint32Array(LINK_CODE_LENGTH + 2);

  if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
    window.crypto.getRandomValues(randomValues);
  } else {
    randomValues.forEach((_, index) => {
      randomValues[index] = Math.floor(Math.random() * 0xffffffff);
    });
  }

  const chars = Array.from({ length: LINK_CODE_LENGTH }, (_, index) => {
    const randomValue = randomValues[index];
    return LINK_CODE_ALPHABET[randomValue % LINK_CODE_ALPHABET.length];
  });

  if (!chars.some((char) => LINK_CODE_LETTERS.includes(char))) {
    const replaceIndex = randomValues[LINK_CODE_LENGTH] % LINK_CODE_LENGTH;
    chars[replaceIndex] = LINK_CODE_LETTERS[randomValues[LINK_CODE_LENGTH + 1] % LINK_CODE_LETTERS.length];
  }

  if (!chars.some((char) => LINK_CODE_DIGITS.includes(char))) {
    const replaceIndex = randomValues[LINK_CODE_LENGTH] % LINK_CODE_LENGTH;
    chars[replaceIndex] = LINK_CODE_DIGITS[randomValues[LINK_CODE_LENGTH + 1] % LINK_CODE_DIGITS.length];
  }

  return chars.join('');
}

function formatRemainingTime(remainingMs: number) {
  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function isEmployeeLinkCodeActive(state: EmployeeAccountState | undefined, now: number) {
  return Boolean(state?.code && now > 0 && state.code.expiresAt > now);
}

function CopyIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={`${className} fill-none stroke-current`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function formatEmploymentDuration(startDate: string, endDate: Date) {
  const match = startDate.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return '';

  const start = new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]));
  const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
  if (Number.isNaN(start.getTime()) || start > end) return '';

  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  let days = end.getDate() - start.getDate();

  if (days < 0) {
    months -= 1;
    days += new Date(end.getFullYear(), end.getMonth(), 0).getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  return `${years} ปี ${months} เดือน ${days} วัน`;
}

function EmployeeListPage({ onAdd, onSelectEmployee }: { onAdd: () => void; onSelectEmployee: (emp: Employee) => void }) {
  const [tab, setTab] = useState('all');
  const [smartTab, setSmartTab] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [today, setToday] = useState<Date | null>(null);
  const [activeFilters, setActiveFilters] = useState<Partial<Record<FilterKey, string[]>>>({});
  const [showFilter, setShowFilter] = useState(false);
  const [activeDim, setActiveDim] = useState<FilterKey | null>(null);
  const [now, setNow] = useState(0);
  const [accountStates, setAccountStates] = useState<EmployeeAccountStateMap>(() => createInitialEmployeeAccountStates());
  const [linkCodeEmployeeId, setLinkCodeEmployeeId] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState('');
  // Real backend (Slice 0). Falls back to the seed array if the API is unreachable.
  const [employeeList, setEmployeeList] = useState<Employee[]>(employees);

  useEffect(() => {
    setToday(new Date());
  }, []);

  useEffect(() => {
    let alive = true;
    publicApiFetch<Employee[]>('/api/humansource/employees')
      .then((data) => { if (alive && Array.isArray(data) && data.length) setEmployeeList(data); })
      .catch(() => { /* keep seed fallback */ });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    const updateNow = () => setNow(Date.now());
    updateNow();
    const timerId = window.setInterval(updateNow, 1000);
    return () => window.clearInterval(timerId);
  }, []);

  const matchPrimary = (e: Employee) => {
    switch (tab) {
      case 'pending':    return false;
      case 'trial':      return e.status === 'ทดลองงาน';
      case 'permanent':  return e.status === 'ปกติ' || e.status === 'ลาพักร้อน';
      case 'terminated': return e.status === 'ลาออก' || e.status === 'สิ้นสุดสัญญา';
      case 'invited':    return false;
      default:           return true;
    }
  };

  const matchSmartFn = (e: Employee) => {
    switch (smartTab) {
      // all-tab smart filters
      case 'update':     return e.status !== 'ปกติ';
      case 'incomplete': return e.startDate === '01/01/2025';
      case 'month':      return e.startDate === '10/06/2025';
      case 'recent':     return e.startDate === '04/05/2025';
      // pending smart filters (no real data → show empty)
      case 'scheduled':    return false;
      case 'missing-data': return false;
      case 'no-fill':      return false;
      // trial smart filters (proxy by startDate)
      case 'not-due':      return e.startDate === '04/05/2025';
      case 'pending-eval': return e.startDate === '10/06/2025';
      case 'evaluated':    return e.startDate === '01/01/2025';
      case 'passed':       return false;
      // permanent
      case 'near-expiry':  return e.empType === 'รายวัน';
      // invited
      case 'pending-approval': return false;
      default:             return true;
    }
  };

  const matchFilterFn = (e: Employee) =>
    Object.entries(activeFilters).every(([key, values]) => {
      if (!values || values.length === 0) return true;
      switch (key as FilterKey) {
        case 'dept':     return values.includes(e.department) || values.includes(e.branch);
        case 'emptype':  return values.includes(e.empType);
        case 'location': return values.includes(e.branch);
        case 'position': return values.includes(e.position);
        case 'shift':    return values.some((v) => e.schedule.includes(v.replace('ทำงาน ', '')));
        case 'level':    return values.includes(POS_LEVEL[e.position] ?? '');
        default:         return true;
      }
    });

  const filtered = employeeList.filter((e) => {
    const q = search.toLowerCase();
    const matchSearch = !q || e.name.toLowerCase().includes(q) || e.code.includes(q) || e.department.toLowerCase().includes(q);
    return matchSearch && matchPrimary(e) && matchSmartFn(e) && matchFilterFn(e);
  });

  const PER_PAGE = 10;
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const rows = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const countFor = (key: string) => {
    if (key === 'all')        return employeeList.length;
    if (key === 'trial')      return employeeList.filter((e) => e.status === 'ทดลองงาน').length;
    if (key === 'permanent')  return employeeList.filter((e) => e.status === 'ปกติ' || e.status === 'ลาพักร้อน').length;
    if (key === 'terminated') return employeeList.filter((e) => e.status === 'ลาออก' || e.status === 'สิ้นสุดสัญญา').length;
    return 0;
  };

  const smartCountFor = (key: string) => {
    const base = employeeList.filter(matchPrimary);
    switch (key) {
      case 'all':              return base.length;
      // all-tab
      case 'update':           return base.filter((e) => e.status !== 'ปกติ').length;
      case 'incomplete':       return base.filter((e) => e.startDate === '01/01/2025').length;
      case 'month':            return base.filter((e) => e.startDate === '10/06/2025').length;
      case 'recent':           return base.filter((e) => e.startDate === '04/05/2025').length;
      // trial
      case 'not-due':          return base.filter((e) => e.startDate === '04/05/2025').length;
      case 'pending-eval':     return base.filter((e) => e.startDate === '10/06/2025').length;
      case 'evaluated':        return base.filter((e) => e.startDate === '01/01/2025').length;
      // permanent
      case 'near-expiry':      return base.filter((e) => e.empType === 'รายวัน').length;
      // stubs
      default:                 return 0;
    }
  };

  const totalActiveFilters = Object.values(activeFilters).filter((v) => v && v.length > 0).length;

  const toggleFilter = (key: FilterKey, value: string) => {
    setActiveFilters((prev) => {
      const current = prev[key] ?? [];
      const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
      return { ...prev, [key]: next };
    });
    setPage(1);
  };

  const clearDim = (key: FilterKey) => {
    setActiveFilters((prev) => { const next = { ...prev }; delete next[key]; return next; });
    setPage(1);
  };

  const activeLinkEmployee = linkCodeEmployeeId ? employees.find((employee) => employee.id === linkCodeEmployeeId) : undefined;
  const activeLinkState = activeLinkEmployee ? accountStates[activeLinkEmployee.id] : undefined;

  const generateLinkCode = (employeeId: string) => {
    const timestamp = Date.now();
    const value = createEmployeeLinkCode();

    setAccountStates((current) => {
      const previous = current[employeeId] ?? { hasHrProfileLink: false, hasGhubLink: false };
      return {
        ...current,
        [employeeId]: {
          ...previous,
          code: {
            value,
            createdAt: timestamp,
            expiresAt: timestamp + LINK_CODE_TTL_MS,
          },
        },
      };
    });
    setCopiedCode('');
    setNow(timestamp);
    setLinkCodeEmployeeId(employeeId);
  };

  const cancelLinkCode = (employeeId: string) => {
    setAccountStates((current) => {
      const previous = current[employeeId];
      if (!previous) return current;
      return {
        ...current,
        [employeeId]: {
          hasHrProfileLink: previous.hasHrProfileLink,
          hasGhubLink: previous.hasGhubLink,
        },
      };
    });
    setCopiedCode('');
  };

  const copyLinkCode = (code: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      void navigator.clipboard.writeText(code);
    }

    setCopiedCode(code);
    window.setTimeout(() => {
      setCopiedCode((current) => (current === code ? '' : current));
    }, 1600);
  };

  return (
    <div className="flex min-h-full flex-col bg-white">
      {/* Header */}
      <div className="px-6 pb-0 pt-3">
        <h1 className="text-sm font-semibold text-gray-800">บริหารข้อมูลพนักงาน</h1>
        <p className="mt-0.5 text-xs text-gray-400">จัดการประวัติ สถานะ และข้อมูลการจ้างงานของพนักงาน</p>
      </div>

      {/* Primary tabs */}
      <div className="hr-emp-primary-tabs">
        {PRIMARY_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => {
              const firstSmart = SMART_TABS_MAP[t.key]?.[0]?.key ?? 'all';
              setTab(t.key);
              setSmartTab(firstSmart);
              setPage(1);
            }}
            className={`hr-emp-primary-tab${tab === t.key ? ' hr-emp-primary-tab--active' : ''}`}
          >
            {t.label}
            {countFor(t.key) > 0 && (
              <span className="hr-emp-tab-badge">{countFor(t.key)}</span>
            )}
          </button>
        ))}
      </div>

      {/* Smart / sub-filter tabs */}
      <div className="hr-emp-smart-tabs">
        {(SMART_TABS_MAP[tab] ?? SMART_TABS_MAP['all']).map((t) => {
          const cnt = smartCountFor(t.key);
          return (
            <button
              key={t.key}
              onClick={() => { setSmartTab(t.key); setPage(1); }}
              className={`hr-emp-smart-tab${smartTab === t.key ? ' hr-emp-smart-tab--active' : ''}`}
            >
              {t.label}
              {cnt > 0 && <span className="hr-emp-tab-badge">{cnt}</span>}
            </button>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-2">
        <div className="hr-emp-search">
          <svg className="hr-emp-search__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="ค้นหาพนักงาน..."
            className="hr-emp-search__input"
          />
        </div>
        <div className="ml-auto flex items-center gap-2">
          {/* Filter button + panel */}
          <div className="relative" style={showFilter ? { zIndex: 201 } : undefined}>
            <button
              type="button"
              onClick={() => setShowFilter((f) => !f)}
              className={`hr-emp-filter-btn${showFilter ? ' hr-emp-filter-btn--open' : ''}${totalActiveFilters > 0 ? ' hr-emp-filter-btn--has' : ''}`}
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M7 8h10M10 12h4" /></svg>
              ตัวกรอง
              {totalActiveFilters > 0 && <span className="hr-emp-filter-count">{totalActiveFilters}</span>}
            </button>
            {showFilter && (
              <>
                <div
                  className="fixed inset-0"
                  style={{ zIndex: 200 }}
                  onClick={() => { setShowFilter(false); setActiveDim(null); }}
                />
                <FilterPanel
                  activeFilters={activeFilters}
                  activeDim={activeDim}
                  onSetDim={setActiveDim}
                  onToggle={toggleFilter}
                  onClearDim={clearDim}
                />
              </>
            )}
          </div>
          {totalActiveFilters > 0 && (
            <button
              type="button"
              onClick={() => { setActiveFilters({}); setPage(1); }}
              className="flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs text-gray-500 hover:bg-gray-50"
            >
              <XIcon className="h-3 w-3" />ล้างตัวกรอง
            </button>
          )}
          <button type="button" onClick={onAdd} className="hr-button hr-button--primary hr-button--sm">
            <PlusIcon className="h-4 w-4" />
            เพิ่มพนักงาน
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/60">
              {['ชื่อ', 'รหัส', 'ตำแหน่ง', 'สังกัด', 'กะการทำงาน', 'วันที่เริ่มงาน', 'ประเภท', 'การเชื่อมต่อ', 'สถานะ'].map((col) => (
                <th key={col} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((emp) => (
              <tr key={emp.id} className="border-b border-gray-100 transition-colors hover:bg-gray-50/50 cursor-pointer" onClick={() => onSelectEmployee(emp)}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-600">
                      {emp.name.slice(0, 1)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{emp.name}</p>
                      <p className="text-xs text-gray-400">{emp.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-gray-500">{emp.code}</td>
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-700">{emp.position}</p>
                  <p className="mt-0.5 text-xs text-gray-400">{emp.department}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-indigo-600">G-HUB Enterprise</p>
                  <p className="mt-0.5 text-xs text-gray-400">{emp.branch}</p>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">{emp.schedule}</td>
                <td className="px-4 py-3">
                  <p className="text-xs font-medium text-gray-600">{emp.startDate}</p>
                  <p className="mt-0.5 whitespace-nowrap text-[11px] text-gray-400">
                    {today ? `(${formatEmploymentDuration(emp.startDate, today)})` : '\u00A0'}
                  </p>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">{emp.empType}</td>
                <td className="px-4 py-3">
                  <EmployeeConnectionCell
                    employee={emp}
                    state={accountStates[emp.id]}
                    now={now}
                    onCreate={generateLinkCode}
                    onOpen={setLinkCodeEmployeeId}
                  />
                </td>
                <td className="px-4 py-3">
                  <HrBadge tone={EMP_STATUS_COLOR[emp.status] as any}>{emp.status}</HrBadge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <div className="py-16 text-center text-sm text-gray-400">ไม่พบข้อมูลพนักงาน</div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-gray-100 px-6 py-3">
        <span className="text-xs text-gray-400">แสดง {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} จาก {filtered.length} รายการ</span>
        <div className="flex items-center gap-1">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="rounded-lg border border-gray-200 p-1.5 text-gray-400 hover:bg-gray-50 disabled:opacity-30">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const p = totalPages <= 5 || page <= 3 ? i + 1 : page >= totalPages - 2 ? totalPages - 4 + i : page - 2 + i;
            return (
              <button key={p} onClick={() => setPage(p)} className={`h-7 w-7 rounded-lg border text-xs transition-colors ${page === p ? 'border-primary bg-primary text-white font-medium' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>{p}</button>
            );
          })}
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages || totalPages === 0} className="rounded-lg border border-gray-200 p-1.5 text-gray-400 hover:bg-gray-50 disabled:opacity-30">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>

      {activeLinkEmployee && activeLinkState ? (
        <EmployeeLinkCodeDrawer
          employee={activeLinkEmployee}
          state={activeLinkState}
          now={now}
          copiedCode={copiedCode}
          onClose={() => setLinkCodeEmployeeId(null)}
          onCreate={generateLinkCode}
          onCancel={cancelLinkCode}
          onCopy={copyLinkCode}
        />
      ) : null}
    </div>
  );
}

function IconTooltip({ label }: { label: string }) {
  return (
    <span className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 w-max max-w-[220px] -translate-x-1/2 rounded-md bg-gray-950 px-2 py-1 text-[11px] font-medium text-white opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
      {label}
    </span>
  );
}

function IconChainLink({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={2.75} strokeLinecap="round" strokeLinejoin="round"
      className={className} aria-hidden="true">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function GhubStatusMark({ linked }: { linked: boolean }) {
  const label = linked ? 'เชื่อมต่อ G-HUB แล้ว' : 'ยังไม่เชื่อมต่อ G-HUB';
  return (
    <span
      role="img"
      tabIndex={0}
      aria-label={label}
      onClick={(event) => event.stopPropagation()}
      className={`hr-ghub-status-mark group ${linked ? 'hr-ghub-status-mark--linked' : 'hr-ghub-status-mark--muted'}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo-ghub.png" alt="" aria-hidden="true" className="hr-ghub-status-mark__logo" />
      <IconTooltip label={label} />
    </span>
  );
}

function EmployeeConnectionCell({
  employee,
  state,
  now,
  onCreate,
  onOpen,
}: {
  employee: Employee;
  state?: EmployeeAccountState;
  now: number;
  onCreate: (employeeId: string) => void;
  onOpen: (employeeId: string) => void;
}) {
  const hasGhubLink = Boolean(state?.hasGhubLink);

  return (
    <div className="hr-connection-cell">
      <GhubStatusMark linked={hasGhubLink} />
      <EmployeeProfileLinkMark
        employee={employee}
        state={state}
        now={now}
        onCreate={onCreate}
        onOpen={onOpen}
      />
    </div>
  );
}

function EmployeeProfileLinkMark({
  employee,
  state,
  now,
  onCreate,
  onOpen,
}: {
  employee: Employee;
  state?: EmployeeAccountState;
  now: number;
  onCreate: (employeeId: string) => void;
  onOpen: (employeeId: string) => void;
}) {
  const hasHrProfileLink = Boolean(state?.hasHrProfileLink);
  const hasActiveCode = isEmployeeLinkCodeActive(state, now);
  const hasExpiredCode = Boolean(state?.code && now > 0 && state.code.expiresAt <= now);

  if (hasHrProfileLink) {
    return (
      <span
        role="img"
        tabIndex={0}
        aria-label="ผูกบัญชี HR กับโปรไฟล์พนักงานแล้ว"
        onClick={(event) => event.stopPropagation()}
        className="hr-employee-link-mark hr-employee-link-mark--linked group"
      >
        <IconChainLink className="h-[1.05rem] w-[1.05rem]" />
        <IconTooltip label="ผูกบัญชี HR กับโปรไฟล์พนักงานแล้ว" />
      </span>
    );
  }

  const label = hasActiveCode && state?.code
    ? `มีรหัสผูกบัญชี HR ${state.code.value} · ${formatRemainingTime(state.code.expiresAt - now)}`
    : hasExpiredCode
      ? 'รหัสหมดอายุ กดเพื่อสร้างใหม่'
      : 'ยังไม่ผูกบัญชี HR กดเพื่อสร้างรหัส';

  return (
    <button
      type="button"
      aria-label={label}
      onClick={(event) => {
        event.stopPropagation();
        if (hasActiveCode) {
          onOpen(employee.id);
          return;
        }
        onCreate(employee.id);
      }}
      className={`hr-employee-link-mark group ${
        hasActiveCode ? 'hr-employee-link-mark--active' : hasExpiredCode ? 'hr-employee-link-mark--expired' : 'hr-employee-link-mark--muted'
      }`}
    >
      <IconChainLink className="h-[1.05rem] w-[1.05rem]" />
      <IconTooltip label={label} />
    </button>
  );
}

function EmployeeLinkCodeDrawer({
  employee,
  state,
  now,
  copiedCode,
  onClose,
  onCreate,
  onCancel,
  onCopy,
}: {
  employee: Employee;
  state: EmployeeAccountState;
  now: number;
  copiedCode: string;
  onClose: () => void;
  onCreate: (employeeId: string) => void;
  onCancel: (employeeId: string) => void;
  onCopy: (code: string) => void;
}) {
  const hasActiveCode = isEmployeeLinkCodeActive(state, now);
  const hasExpiredCode = Boolean(state.code && now > 0 && state.code.expiresAt <= now);
  const remainingMs = state.code ? Math.max(0, state.code.expiresAt - now) : 0;
  const employeeLinkStatus = state.hasHrProfileLink ? 'ผูกโปรไฟล์แล้ว' : 'รอพนักงานกรอกรหัส';
  const primaryActionLabel = hasActiveCode || hasExpiredCode ? 'สร้างรหัสใหม่' : 'สร้างรหัสเชื่อมต่อ';

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  const codeCreated = hasActiveCode || hasExpiredCode;

  return (
    <>
      <button type="button" className="hr-account-drawer-scrim" onClick={onClose} aria-label="ปิดแผงรหัสเชื่อมต่อ" />
      <aside className="hr-account-drawer" role="dialog" aria-modal="true" aria-label="รหัสผูกบัญชี HR">

        {/* ── Header ── */}
        <header className="hr-account-drawer__head">
          <div className="hr-link-head-main">
            <div className="hr-link-head-avatar">{employee.name.slice(0, 1)}</div>
            <div>
              <h2 className="hr-account-drawer__title">ผูกบัญชี HR</h2>
              <p className="hr-account-drawer__subtitle">{employee.name} · {employee.code}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="hr-account-drawer__close" aria-label="ปิด">
            <XIcon className="h-4 w-4" />
          </button>
        </header>

        {/* ── Body ── */}
        <div className="hr-account-drawer__body hr-account-drawer__body--flush">

          {/* Employee meta strip */}
          <div className="hr-link-emp-strip">
            <span>{employee.position}</span>
            <span className="hr-link-strip-sep">·</span>
            <span>G-HUB Enterprise</span>
            <span className="hr-link-strip-sep">·</span>
            <span>{employee.branch}</span>
          </div>

          {/* HR account status row */}
          <div className="hr-link-status-row">
            <span className="hr-link-status-label">สถานะบัญชี HR</span>
            <span className={`hr-account-status ${state.hasHrProfileLink ? 'hr-account-status--green' : 'hr-account-status--slate'}`}>
              <span className="hr-account-status__dot" />
              {employeeLinkStatus}
            </span>
          </div>

          {/* ── Unlinked: step flow + code ── */}
          {!state.hasHrProfileLink && (
            <>
              {/* 3-step flow */}
              <div className="hr-link-steps">
                <div className={`hr-link-step ${codeCreated ? 'hr-link-step--done' : 'hr-link-step--active'}`}>
                  <div className="hr-link-step__icon">
                    {codeCreated ? <CheckIcon className="h-3 w-3" /> : '1'}
                  </div>
                  <span className="hr-link-step__label">สร้างรหัส</span>
                </div>
                <div className="hr-link-step__line" />
                <div className={`hr-link-step ${hasActiveCode ? 'hr-link-step--active' : 'hr-link-step--pending'}`}>
                  <div className="hr-link-step__icon">2</div>
                  <span className="hr-link-step__label">แชร์ให้พนักงาน</span>
                </div>
                <div className="hr-link-step__line" />
                <div className="hr-link-step hr-link-step--pending">
                  <div className="hr-link-step__icon">3</div>
                  <span className="hr-link-step__label">พนักงานกรอก</span>
                </div>
              </div>

              {/* Code section */}
              <div className="hr-link-code-section">
                <div className="hr-link-code-section__head">
                  <span className="hr-link-code-section__title">รหัสเชื่อมต่อ</span>
                  {hasActiveCode && (
                    <span className="hr-account-status hr-account-status--orange">
                      <span className="hr-account-status__dot" />
                      หมดอายุใน {formatRemainingTime(remainingMs)}
                    </span>
                  )}
                  {hasExpiredCode && !hasActiveCode && (
                    <span className="hr-account-status hr-account-status--slate">
                      <span className="hr-account-status__dot" />
                      หมดอายุแล้ว
                    </span>
                  )}
                </div>

                {hasActiveCode && state.code ? (
                  <div className="hr-link-code-hero">
                    <span className="hr-link-code-hero__value">{state.code.value}</span>
                    <button type="button" className="hr-link-code-copy" onClick={() => onCopy(state.code?.value ?? '')}>
                      {copiedCode === state.code.value ? <CheckIcon className="h-3.5 w-3.5" /> : <CopyIcon className="h-3.5 w-3.5" />}
                      {copiedCode === state.code.value ? 'คัดลอกแล้ว' : 'คัดลอก'}
                    </button>
                  </div>
                ) : (
                  <div className="hr-link-code-empty">
                    {hasExpiredCode
                      ? 'รหัสหมดอายุ — กด "สร้างรหัสใหม่" เพื่อสร้างอีกครั้ง'
                      : 'ยังไม่มีรหัส — กดปุ่มด้านล่างเพื่อสร้าง'}
                  </div>
                )}

                <p className="hr-link-code-hint">ใช้ได้ครั้งเดียว · 10 นาที · สร้างใหม่จะยกเลิกรหัสเดิมทันที</p>
              </div>
            </>
          )}

          {/* ── Linked: success block ── */}
          {state.hasHrProfileLink && (
            <div className="hr-link-success">
              <div className="hr-link-success__icon">
                <CheckIcon className="h-5 w-5" />
              </div>
              <div>
                <div className="hr-link-success__title">เชื่อมต่อสำเร็จ</div>
                <div className="hr-link-success__desc">ผูกกับข้อมูลพนักงานนี้แล้ว ไม่ต้องสร้างรหัสเพิ่มเติม</div>
              </div>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <footer className="hr-account-drawer__foot">
          {!state.hasHrProfileLink && hasActiveCode ? (
            <button type="button" className="hr-account-drawer__cancel-btn" onClick={() => onCancel(employee.id)}>
              <TrashIcon className="h-3.5 w-3.5" />
              ยกเลิกรหัส
            </button>
          ) : <span />}
          <div className="hr-account-drawer__actions">
            <button type="button" className="hr-button hr-button--secondary" onClick={onClose}>ปิด</button>
            {!state.hasHrProfileLink ? (
              <button type="button" className="hr-button hr-button--primary" onClick={() => onCreate(employee.id)}>
                {codeCreated ? <RefreshIcon className="h-4 w-4" /> : <LinkIcon className="h-4 w-4" />}
                {primaryActionLabel}
              </button>
            ) : null}
          </div>
        </footer>
      </aside>
    </>
  );
}

// ─── Multi-level Filter Panel ────────────────────────────────────────────────

function FilterPanel({
  activeFilters,
  activeDim,
  onSetDim,
  onToggle,
  onClearDim,
}: {
  activeFilters: Partial<Record<FilterKey, string[]>>;
  activeDim: FilterKey | null;
  onSetDim: (key: FilterKey) => void;
  onToggle: (key: FilterKey, value: string) => void;
  onClearDim: (key: FilterKey) => void;
}) {
  const [dimSearch, setDimSearch] = useState('');
  const [rangeMin, setRangeMin] = useState('');
  const [rangeMax, setRangeMax] = useState('');
  const [rangeUnit, setRangeUnit] = useState(0);

  const currentDim = FILTER_DIMS.find((d) => d.key === activeDim);

  const handleSetDim = (key: FilterKey) => {
    onSetDim(key);
    setDimSearch('');
    setRangeMin('');
    setRangeMax('');
    setRangeUnit(0);
  };

  return (
    <div className="hr-emp-filter-panel">
      {/* Left: value picker */}
      <div className="hr-emp-filter-panel__left">
        {!activeDim && (
          <div className="hr-emp-filter-hint">เลือกหมวดหมู่จากด้านขวา</div>
        )}

        {activeDim && currentDim?.type === 'range' && (
          <>
            {/* Range row */}
            <div className="hr-emp-filter-range">
              <svg className="hr-emp-filter-range__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4 4 4M17 8v12m0 0 4-4m-4 4-4-4"/></svg>
              <input
                className="hr-emp-filter-range__input"
                type="number"
                placeholder="0"
                value={rangeMin}
                onChange={(e) => setRangeMin(e.target.value)}
                min={0}
              />
              <span className="hr-emp-filter-range__sep">-</span>
              <input
                className="hr-emp-filter-range__input"
                type="number"
                placeholder="99"
                value={rangeMax}
                onChange={(e) => setRangeMax(e.target.value)}
                min={0}
              />
              {/* Unit toggle */}
              <div className="hr-emp-filter-range__units">
                {currentDim.units.map((u, i) => (
                  <button
                    key={u}
                    type="button"
                    className={`hr-emp-filter-range__unit${rangeUnit === i ? ' hr-emp-filter-range__unit--active' : ''}`}
                    onClick={() => setRangeUnit(i)}
                  >{u}</button>
                ))}
              </div>
            </div>
            {/* Presets */}
            <div className="hr-emp-filter-options">
              {currentDim.presets.map((p) => {
                const checked = activeFilters[activeDim]?.includes(p) ?? false;
                return (
                  <label key={p} className={`hr-emp-filter-option${checked ? ' hr-emp-filter-option--checked' : ''}`}>
                    <input type="checkbox" checked={checked} onChange={() => onToggle(activeDim, p)} className="hr-emp-filter-option__check" />
                    {p}
                  </label>
                );
              })}
            </div>
          </>
        )}

        {activeDim && currentDim?.type === 'list' && (
          <>
            <div className="hr-emp-filter-search">
              <svg className="hr-emp-filter-search__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input
                className="hr-emp-filter-search__input"
                placeholder="ค้นหา"
                value={dimSearch}
                onChange={(e) => setDimSearch(e.target.value)}
              />
            </div>
            <div className="hr-emp-filter-options">
              {(() => {
                const opts = currentDim.options.filter(
                  (o) => !dimSearch || o.toLowerCase().includes(dimSearch.toLowerCase()),
                );
                if (opts.length === 0) return <p className="hr-emp-filter-empty">ไม่มีข้อมูล</p>;
                return opts.map((opt) => {
                  const checked = activeFilters[activeDim]?.includes(opt) ?? false;
                  return (
                    <label key={opt} className={`hr-emp-filter-option${checked ? ' hr-emp-filter-option--checked' : ''}`}>
                      <input type="checkbox" checked={checked} onChange={() => onToggle(activeDim, opt)} className="hr-emp-filter-option__check" />
                      {opt}
                    </label>
                  );
                });
              })()}
            </div>
          </>
        )}
      </div>

      {/* Right: dimension list */}
      <div className="hr-emp-filter-panel__right">
        {FILTER_DIMS.map((dim) => {
          const count = activeFilters[dim.key]?.length ?? 0;
          return (
            <button
              key={dim.key}
              type="button"
              onClick={() => handleSetDim(dim.key)}
              className={`hr-emp-filter-dim${activeDim === dim.key ? ' hr-emp-filter-dim--active' : ''}`}
            >
              <span className="hr-emp-filter-dim__label">{dim.label}</span>
              {count > 0 && (
                <span className="hr-emp-filter-dim__end">
                  <span className="hr-emp-filter-dim__count">{count}</span>
                  <span
                    role="button"
                    tabIndex={0}
                    className="hr-emp-filter-dim__clear"
                    aria-label={`ล้างตัวกรอง ${dim.label}`}
                    onClick={(e) => { e.stopPropagation(); onClearDim(dim.key); }}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); onClearDim(dim.key); } }}
                  >
                    <XIcon className="h-3 w-3" />
                  </span>
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Add Employee modal (multi-step) ──────────────────────────────────────────

const ADD_STEPS = [
  { id: 1, label: 'ข้อมูลจำเป็น', description: 'ระบุตัวตนและช่องทางติดต่อ' },
  { id: 2, label: 'การจ้างงานและสิทธิ์', description: 'สังกัด วันเริ่มงาน และสิทธิ์พื้นฐาน' },
  { id: 3, label: 'ที่อยู่และผู้ติดต่อ', description: 'ที่อยู่ปัจจุบันและกรณีฉุกเฉิน' },
  { id: 4, label: 'ธนาคารและเงินเดือน', description: 'บัญชีรับเงินเดือนและกลุ่ม Payroll' },
  { id: 5, label: 'ประกันสังคมและภาษี', description: 'ข้อมูลนำส่งและวิธีคำนวณภาษี' },
  { id: 6, label: 'เอกสารและตรวจสอบ', description: 'เอกสารประกอบและสรุปก่อนสร้าง' },
];

type EmployeeDraft = {
  employeeCode: string;
  title: string;
  firstName: string;
  lastName: string;
  firstNameEn: string;
  lastNameEn: string;
  nickname: string;
  birthDate: string;
  nationality: 'ไทย' | 'ต่างชาติ';
  idNumber: string;
  mobile: string;
  personalEmail: string;
  company: string;
  branch: string;
  department: string;
  position: string;
  supervisor: string;
  employeeType: string;
  startDate: string;
  workSchedule: string;
  currentAddress: string;
  subdistrict: string;
  district: string;
  province: string;
  postalCode: string;
  emergencyName: string;
  emergencyRelationship: string;
  emergencyPhone: string;
  bankName: string;
  bankBranch: string;
  bankAccountName: string;
  bankAccountNumber: string;
  payrollGroup: string;
  salaryRate: string;
  socialSecurityStatus: string;
  socialSecurityHospital: string;
  taxMethod: string;
  providentFund: string;
  documentIdCard: boolean;
  documentHouseRegistration: boolean;
  documentBankBook: boolean;
  documentEmploymentContract: boolean;
};

const EMPTY_EMPLOYEE: EmployeeDraft = {
  employeeCode: 'EMP-00600',
  title: '',
  firstName: '',
  lastName: '',
  firstNameEn: '',
  lastNameEn: '',
  nickname: '',
  birthDate: '',
  nationality: 'ไทย',
  idNumber: '',
  mobile: '',
  personalEmail: '',
  company: 'G-HUB Enterprise',
  branch: 'สำนักงานใหญ่',
  department: '',
  position: '',
  supervisor: '',
  employeeType: 'พนักงานรายเดือน',
  startDate: '',
  workSchedule: 'จันทร์ - ศุกร์ (08:30 - 17:30)',
  currentAddress: '',
  subdistrict: '',
  district: '',
  province: '',
  postalCode: '',
  emergencyName: '',
  emergencyRelationship: '',
  emergencyPhone: '',
  bankName: '',
  bankBranch: '',
  bankAccountName: '',
  bankAccountNumber: '',
  payrollGroup: 'พนักงานรายเดือน',
  salaryRate: '',
  socialSecurityStatus: 'ขึ้นทะเบียนผู้ประกันตนใหม่',
  socialSecurityHospital: '',
  taxMethod: 'คำนวณภาษีแบบเฉลี่ยทั้งปี',
  providentFund: 'ไม่เข้าร่วม',
  documentIdCard: false,
  documentHouseRegistration: false,
  documentBankBook: false,
  documentEmploymentContract: false,
};

type PersonalField = keyof Pick<
  EmployeeDraft,
  | 'employeeCode'
  | 'title'
  | 'firstName'
  | 'lastName'
  | 'firstNameEn'
  | 'lastNameEn'
  | 'birthDate'
  | 'idNumber'
  | 'mobile'
  | 'personalEmail'
>;

type PersonalErrors = Partial<Record<PersonalField, string>>;

const thaiNamePattern = /^[\u0E00-\u0E7F\s.'-]+$/;
const englishNamePattern = /^[A-Za-z\s.'-]+$/;

function sanitizeThaiName(value: string) {
  return value.replace(/[^\u0E00-\u0E7F\s.'-]/g, '');
}

function sanitizeEnglishName(value: string) {
  return value.replace(/[^A-Za-z\s.'-]/g, '');
}

function formatThaiCitizenId(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 13);
  const parts = [
    digits.slice(0, 1),
    digits.slice(1, 5),
    digits.slice(5, 10),
    digits.slice(10, 12),
    digits.slice(12, 13),
  ].filter(Boolean);
  return parts.join('-');
}

function isValidThaiCitizenId(value: string) {
  const digits = value.replace(/\D/g, '');
  if (!/^[1-8]\d{12}$/.test(digits) || /^(\d)\1{12}$/.test(digits)) return false;

  const sum = digits
    .slice(0, 12)
    .split('')
    .reduce((total, digit, index) => total + Number(digit) * (13 - index), 0);
  const checkDigit = (11 - (sum % 11)) % 10;
  return checkDigit === Number(digits[12]);
}

function isValidBirthDate(value: string) {
  const match = value.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return false;

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(year, month - 1, day);
  const today = new Date();

  return (
    year >= 1900 &&
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day &&
    date <= today
  );
}

function getPersonalErrors(draft: EmployeeDraft): PersonalErrors {
  const errors: PersonalErrors = {};
  const thaiFirstName = draft.firstName.trim();
  const thaiLastName = draft.lastName.trim();
  const englishFirstName = draft.firstNameEn.trim();
  const englishLastName = draft.lastNameEn.trim();

  if (!draft.employeeCode.trim()) errors.employeeCode = 'กรุณาระบุรหัสพนักงาน';
  if (!draft.title) errors.title = 'กรุณาเลือกคำนำหน้า';
  if ((thaiFirstName.match(/[\u0E00-\u0E7F]/g)?.length ?? 0) < 2 || !thaiNamePattern.test(thaiFirstName)) {
    errors.firstName = 'กรุณาระบุชื่อภาษาไทยอย่างน้อย 2 ตัวอักษร';
  }
  if ((thaiLastName.match(/[\u0E00-\u0E7F]/g)?.length ?? 0) < 2 || !thaiNamePattern.test(thaiLastName)) {
    errors.lastName = 'กรุณาระบุนามสกุลภาษาไทยอย่างน้อย 2 ตัวอักษร';
  }
  if ((englishFirstName.match(/[A-Za-z]/g)?.length ?? 0) < 2 || !englishNamePattern.test(englishFirstName)) {
    errors.firstNameEn = 'กรุณาระบุชื่อภาษาอังกฤษอย่างน้อย 2 ตัวอักษร';
  }
  if ((englishLastName.match(/[A-Za-z]/g)?.length ?? 0) < 2 || !englishNamePattern.test(englishLastName)) {
    errors.lastNameEn = 'กรุณาระบุนามสกุลภาษาอังกฤษอย่างน้อย 2 ตัวอักษร';
  }
  if (!isValidBirthDate(draft.birthDate)) {
    errors.birthDate = 'กรุณาระบุวันเกิดจริงในรูปแบบ วว/ดด/ปปปป';
  }
  if (
    draft.nationality === 'ไทย'
      ? !isValidThaiCitizenId(draft.idNumber)
      : !/^[A-Za-z0-9]{6,12}$/.test(draft.idNumber.trim())
  ) {
    errors.idNumber =
      draft.nationality === 'ไทย'
        ? 'เลขบัตรประชาชนไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง'
        : 'กรุณาระบุเลขหนังสือเดินทาง 6-12 ตัวอักษร';
  }
  if (draft.mobile.trim() && !/^0\d{8,9}$/.test(draft.mobile.replace(/\D/g, ''))) {
    errors.mobile = 'กรุณาระบุเบอร์โทรศัพท์ให้ถูกต้อง';
  }
  if (draft.personalEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.personalEmail.trim())) {
    errors.personalEmail = 'กรุณาระบุอีเมลให้ถูกต้อง';
  }

  return errors;
}

function AddEmployeeModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<EmployeeDraft>(EMPTY_EMPLOYEE);
  const [created, setCreated] = useState(false);
  const [showPersonalErrors, setShowPersonalErrors] = useState(false);
  const isLast = step === ADD_STEPS.length;
  const personalErrors = showPersonalErrors ? getPersonalErrors(draft) : {};

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  const update = <K extends keyof EmployeeDraft>(key: K, value: EmployeeDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const goForward = () => {
    if (step === 1) {
      const errors = getPersonalErrors(draft);
      if (Object.keys(errors).length > 0) {
        setShowPersonalErrors(true);
        window.requestAnimationFrame(() => {
          document.querySelector('[data-field-error="true"]')?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
        });
        return;
      }
    }

    if (isLast) {
      setCreated(true);
      return;
    }
    setStep((current) => current + 1);
  };

  if (created) {
    return <StepSocialSecurity draft={draft} onClose={onClose} />;
  }

  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-[#f7f8fb] text-slate-950">
      <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-slate-200 bg-white px-5 sm:px-7">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <UsersIcon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-950">เพิ่มพนักงาน</h2>
            <p className="text-xs text-slate-500">สร้างประวัติพนักงานและข้อมูลตั้งต้นสำหรับ HR ในขั้นตอนเดียว</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="ปิด"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
        >
          <XIcon className="h-5 w-5" />
        </button>
      </header>

      <div className="grid min-h-0 flex-1 md:grid-cols-[250px_minmax(0,1fr)]">
        <aside className="border-b border-slate-200 bg-white px-4 py-4 md:border-b-0 md:border-r md:px-5 md:py-7">
          <nav className="grid grid-cols-3 gap-2 md:grid-cols-1 md:gap-1">
            {ADD_STEPS.map((item) => {
              const active = item.id === step;
              const done = item.id < step;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => item.id <= step && setStep(item.id)}
                  className={`flex min-w-0 items-center gap-3 rounded-lg px-2 py-2.5 text-left transition ${
                    active ? 'bg-indigo-50 text-indigo-700' : done ? 'text-slate-700 hover:bg-slate-50' : 'text-slate-400'
                  }`}
                >
                  <span className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${
                    done ? 'border-emerald-500 bg-emerald-500 text-white' : active ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300 bg-white'
                  }`}>
                    {done ? <CheckIcon className="h-3.5 w-3.5" /> : item.id}
                  </span>
                  <span className="hidden min-w-0 md:block">
                    <span className="block text-sm font-semibold">{item.label}</span>
                    <span className="mt-0.5 block text-[11px] font-normal leading-4 text-slate-400">{item.description}</span>
                  </span>
                </button>
              );
            })}
          </nav>

          <div className="mt-8 hidden border-t border-slate-100 pt-5 md:block">
            <p className="text-xs font-semibold text-slate-700">หลักการของขั้นตอนนี้</p>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              กรอกข้อมูลตั้งแต่ประวัติ การจ้างงาน การจ่ายเงิน ไปจนถึงเอกสารในขั้นตอนเดียว สามารถย้อนกลับมาแก้ไขแต่ละส่วนก่อนสร้างพนักงานได้
            </p>
          </div>
        </aside>

        <main className="min-h-0 overflow-y-auto">
          <div className="mx-auto w-full max-w-5xl px-5 py-7 sm:px-8 lg:px-12 lg:py-10">
            <div className="mb-7">
              <p className="text-xs font-semibold text-indigo-600">ขั้นตอน {step} จาก {ADD_STEPS.length}</p>
              <h1 className="mt-1 text-2xl font-semibold text-slate-950">{ADD_STEPS[step - 1].label}</h1>
              <p className="mt-1 text-sm text-slate-500">{ADD_STEPS[step - 1].description}</p>
            </div>

            {step === 1 && <StepPersonal draft={draft} update={update} errors={personalErrors} />}
            {step === 2 && <StepEmployment draft={draft} update={update} />}
            {step === 3 && <StepAddress draft={draft} update={update} />}
            {step === 4 && <StepPayroll draft={draft} update={update} />}
            {step === 5 && <StepTaxAndSocialSecurity draft={draft} update={update} />}
            {step === 6 && <StepDocumentsAndReview draft={draft} update={update} />}
          </div>
        </main>
      </div>

      <footer className="flex h-16 flex-shrink-0 items-center justify-between border-t border-slate-200 bg-white px-5 sm:px-7">
        <button
          type="button"
          onClick={step === 1 ? onClose : () => setStep((current) => current - 1)}
          className="inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          {step === 1 ? 'ยกเลิก' : 'ย้อนกลับ'}
        </button>
        <div className="flex items-center gap-3">
          <span className="hidden text-xs text-slate-400 sm:block">
            {isLast ? 'พร้อมสร้างประวัติพนักงาน' : 'บันทึกร่างอัตโนมัติ'}
          </span>
          <button
            type="button"
            onClick={goForward}
            className={`inline-flex h-10 items-center gap-2 rounded-lg px-5 text-sm font-semibold text-white transition ${
              isLast ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {isLast ? <CheckIcon className="h-4 w-4" /> : null}
            {isLast ? 'สร้างพนักงาน' : 'ดำเนินการต่อ'}
            {!isLast ? <ArrowRightIcon className="h-4 w-4" /> : null}
          </button>
        </div>
      </footer>
    </div>
  );
}

function FormRow({
  label,
  children,
  required = false,
  hint,
  error,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  hint?: string;
  error?: string;
}) {
  return (
    <div data-field-error={error ? 'true' : undefined}>
      <label className="mb-1.5 block text-xs font-semibold text-slate-700">
        {label}
        {required ? <span className="ml-1 text-rose-500">*</span> : null}
      </label>
      {children}
      {error ? (
        <p className="mt-1.5 flex items-start gap-1.5 text-[11px] font-medium leading-4 text-rose-600">
          <span className="mt-[3px] flex h-3 w-3 flex-shrink-0 items-center justify-center rounded-full bg-rose-600 text-[8px] text-white">!</span>
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-[11px] leading-4 text-slate-400">{hint}</p>
      ) : null}
    </div>
  );
}

function TextInput({
  placeholder,
  value,
  onChange,
  prefix,
  error = false,
  inputMode,
  maxLength,
}: {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  prefix?: string;
  error?: boolean;
  inputMode?: 'text' | 'numeric' | 'email' | 'tel';
  maxLength?: number;
}) {
  return (
    <div className={`flex h-11 items-center rounded-lg border bg-white transition focus-within:ring-4 ${
      error
        ? 'border-rose-500 focus-within:border-rose-500 focus-within:ring-rose-50'
        : 'border-slate-200 focus-within:border-indigo-400 focus-within:ring-indigo-50'
    }`}>
      {prefix ? <span className="border-r border-slate-200 px-3 text-xs font-medium text-slate-400">{prefix}</span> : null}
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        maxLength={maxLength}
        aria-invalid={error}
        className="min-w-0 flex-1 bg-transparent px-3 text-sm text-slate-800 outline-none placeholder:text-slate-400"
      />
    </div>
  );
}

function SelectInput({
  options,
  value,
  onChange,
  placeholder = 'เลือกข้อมูล',
  error = false,
}: {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={`flex h-11 w-full items-center justify-between rounded-lg border bg-white px-3 text-left text-sm text-slate-700 transition focus:outline-none focus:ring-4 ${
          error
            ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-50'
            : 'border-slate-200 hover:border-slate-300 focus:border-indigo-400 focus:ring-indigo-50'
        }`}
      >
        <span className={value ? 'truncate' : 'truncate text-slate-400'}>{value || placeholder}</span>
        <span className={`h-2 w-2 flex-shrink-0 rotate-45 border-b-2 border-r-2 border-slate-400 transition ${open ? 'rotate-[225deg]' : ''}`} />
      </button>
      {open ? (
        <div className="absolute left-0 right-0 top-12 z-30 max-h-56 overflow-y-auto rounded-lg border border-slate-200 bg-white p-1.5 shadow-[0_16px_35px_rgba(15,23,42,0.14)]">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
              className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition ${
                option === value ? 'bg-indigo-50 font-medium text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
              }`}
            >
              {option}
              {option === value ? <CheckIcon className="h-4 w-4" /> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function StepPersonal({
  draft,
  update,
  errors,
}: {
  draft: EmployeeDraft;
  update: <K extends keyof EmployeeDraft>(key: K, value: EmployeeDraft[K]) => void;
  errors: PersonalErrors;
}) {
  return (
    <div className="space-y-8">
      <section className="grid gap-6 border-b border-slate-200 pb-8 lg:grid-cols-[180px_minmax(0,1fr)]">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">รูปและรหัสพนักงาน</h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">รหัสถูกสร้างต่อจากลำดับล่าสุด แก้ไขได้ก่อนบันทึก</p>
        </div>
        <div className="flex flex-wrap items-center gap-5">
          <button
            type="button"
            className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full border border-dashed border-slate-300 bg-white text-xs text-slate-400 transition hover:border-indigo-400 hover:text-indigo-600"
          >
            เพิ่มรูป
          </button>
          <div className="w-full max-w-sm">
            <FormRow
              label="รหัสพนักงาน"
              required
              hint="ใช้เป็นรหัสหลักสำหรับอ้างอิงใน HR, Payroll และรายงาน"
              error={errors.employeeCode}
            >
              <TextInput
                value={draft.employeeCode}
                onChange={(value) => update('employeeCode', value)}
                prefix="ID"
                error={Boolean(errors.employeeCode)}
              />
            </FormRow>
          </div>
        </div>
      </section>

      <section className="grid gap-6 border-b border-slate-200 pb-8 lg:grid-cols-[180px_minmax(0,1fr)]">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">ข้อมูลส่วนบุคคล</h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">เก็บเฉพาะข้อมูลที่ใช้ระบุตัวตนในวันเริ่มงาน</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormRow label="สัญชาติ" required>
            <div className="grid h-11 grid-cols-2 rounded-lg bg-slate-100 p-1">
              {(['ไทย', 'ต่างชาติ'] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    update('nationality', option);
                    update('idNumber', '');
                  }}
                  className={`rounded-md text-sm font-medium transition ${
                    draft.nationality === option ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </FormRow>
          <FormRow label="คำนำหน้า" required error={errors.title}>
            <SelectInput
              options={['นาย', 'นาง', 'นางสาว', 'ไม่ระบุ']}
              value={draft.title}
              onChange={(value) => update('title', value)}
              placeholder="เลือกคำนำหน้า"
              error={Boolean(errors.title)}
            />
          </FormRow>
          <FormRow label="ชื่อ (TH)" required error={errors.firstName}>
            <TextInput
              value={draft.firstName}
              onChange={(value) => update('firstName', sanitizeThaiName(value))}
              placeholder="กรอกชื่อภาษาไทย"
              error={Boolean(errors.firstName)}
            />
          </FormRow>
          <FormRow label="นามสกุล (TH)" required error={errors.lastName}>
            <TextInput
              value={draft.lastName}
              onChange={(value) => update('lastName', sanitizeThaiName(value))}
              placeholder="กรอกนามสกุลภาษาไทย"
              error={Boolean(errors.lastName)}
            />
          </FormRow>
          <FormRow label="ชื่อ (EN)" required error={errors.firstNameEn}>
            <TextInput
              value={draft.firstNameEn}
              onChange={(value) => update('firstNameEn', sanitizeEnglishName(value))}
              placeholder="Enter first name"
              error={Boolean(errors.firstNameEn)}
            />
          </FormRow>
          <FormRow label="นามสกุล (EN)" required error={errors.lastNameEn}>
            <TextInput
              value={draft.lastNameEn}
              onChange={(value) => update('lastNameEn', sanitizeEnglishName(value))}
              placeholder="Enter last name"
              error={Boolean(errors.lastNameEn)}
            />
          </FormRow>
          <FormRow label="ชื่อเล่น">
            <TextInput value={draft.nickname} onChange={(value) => update('nickname', value)} placeholder="ชื่อที่ใช้เรียกในองค์กร" />
          </FormRow>
          <FormRow label="วันเกิด" required error={errors.birthDate}>
            <DatePicker
              value={draft.birthDate}
              onChange={(value) => update('birthDate', value)}
              placeholder="เลือกวันเกิด"
              disableFuture
              error={Boolean(errors.birthDate)}
            />
          </FormRow>
          <div className="sm:col-span-2">
            <FormRow
              label={draft.nationality === 'ไทย' ? 'เลขบัตรประชาชน' : 'เลขหนังสือเดินทาง'}
              required
              error={errors.idNumber}
              hint={draft.nationality === 'ไทย' ? 'ระบบจะตรวจสอบความถูกต้องของเลขบัตรประชาชนให้อัตโนมัติ' : undefined}
            >
            <TextInput
              value={draft.idNumber}
              onChange={(value) =>
                update('idNumber', draft.nationality === 'ไทย' ? formatThaiCitizenId(value) : value.toUpperCase())
              }
              placeholder={draft.nationality === 'ไทย' ? 'X-XXXX-XXXXX-XX-X' : 'Passport number'}
              inputMode={draft.nationality === 'ไทย' ? 'numeric' : 'text'}
              maxLength={draft.nationality === 'ไทย' ? 17 : 12}
              error={Boolean(errors.idNumber)}
            />
            </FormRow>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[180px_minmax(0,1fr)]">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">ช่องทางติดต่อ</h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">ข้อมูลส่วนนี้ไม่บังคับ และสามารถเพิ่มภายหลังได้</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormRow label="เบอร์มือถือ" hint="ใช้สำหรับติดต่อพนักงาน" error={errors.mobile}>
            <TextInput
              value={draft.mobile}
              onChange={(value) => update('mobile', value)}
              placeholder="08X-XXX-XXXX"
              inputMode="tel"
              error={Boolean(errors.mobile)}
            />
          </FormRow>
          <FormRow
            label="อีเมลส่วนตัว"
            hint="ใช้สำหรับติดต่อพนักงานและเอกสารที่เกี่ยวข้อง"
            error={errors.personalEmail}
          >
            <TextInput
              value={draft.personalEmail}
              onChange={(value) => update('personalEmail', value)}
              placeholder="name@email.com"
              inputMode="email"
              error={Boolean(errors.personalEmail)}
            />
          </FormRow>
        </div>
      </section>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[140px_minmax(0,1fr)] gap-4 border-b border-slate-100 py-3 text-sm">
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-medium text-slate-900">{value || 'ยังไม่ระบุ'}</dd>
    </div>
  );
}

function StepAddress({
  draft,
  update,
}: {
  draft: EmployeeDraft;
  update: <K extends keyof EmployeeDraft>(key: K, value: EmployeeDraft[K]) => void;
}) {
  return (
    <div className="space-y-8">
      <section className="grid gap-6 border-b border-slate-200 pb-8 lg:grid-cols-[180px_minmax(0,1fr)]">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">ที่อยู่ปัจจุบัน</h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">ใช้สำหรับเอกสารพนักงานและการติดต่อจากบริษัท</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <FormRow label="บ้านเลขที่ อาคาร ถนน และรายละเอียด">
              <TextInput
                value={draft.currentAddress}
                onChange={(value) => update('currentAddress', value)}
                placeholder="เช่น 99/9 อาคาร G-HUB ถนนรัชดาภิเษก"
              />
            </FormRow>
          </div>
          <FormRow label="แขวง / ตำบล">
            <TextInput
              value={draft.subdistrict}
              onChange={(value) => update('subdistrict', value)}
              placeholder="ระบุแขวงหรือตำบล"
            />
          </FormRow>
          <FormRow label="เขต / อำเภอ">
            <TextInput
              value={draft.district}
              onChange={(value) => update('district', value)}
              placeholder="ระบุเขตหรืออำเภอ"
            />
          </FormRow>
          <FormRow label="จังหวัด">
            <TextInput
              value={draft.province}
              onChange={(value) => update('province', value)}
              placeholder="ระบุจังหวัด"
            />
          </FormRow>
          <FormRow label="รหัสไปรษณีย์">
            <TextInput
              value={draft.postalCode}
              onChange={(value) => update('postalCode', value.replace(/\D/g, '').slice(0, 5))}
              placeholder="00000"
              inputMode="numeric"
              maxLength={5}
            />
          </FormRow>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[180px_minmax(0,1fr)]">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">ผู้ติดต่อฉุกเฉิน</h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">บุคคลที่บริษัทสามารถติดต่อได้เมื่อเกิดเหตุจำเป็น</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormRow label="ชื่อผู้ติดต่อ">
            <TextInput
              value={draft.emergencyName}
              onChange={(value) => update('emergencyName', value)}
              placeholder="ชื่อและนามสกุล"
            />
          </FormRow>
          <FormRow label="ความสัมพันธ์">
            <SelectInput
              options={['บิดา', 'มารดา', 'คู่สมรส', 'พี่น้อง', 'ญาติ', 'อื่น ๆ']}
              value={draft.emergencyRelationship}
              onChange={(value) => update('emergencyRelationship', value)}
              placeholder="เลือกความสัมพันธ์"
            />
          </FormRow>
          <FormRow label="เบอร์โทรศัพท์">
            <TextInput
              value={draft.emergencyPhone}
              onChange={(value) => update('emergencyPhone', value.replace(/\D/g, '').slice(0, 10))}
              placeholder="0XX-XXX-XXXX"
              inputMode="tel"
              maxLength={10}
            />
          </FormRow>
        </div>
      </section>
    </div>
  );
}

function StepPayroll({
  draft,
  update,
}: {
  draft: EmployeeDraft;
  update: <K extends keyof EmployeeDraft>(key: K, value: EmployeeDraft[K]) => void;
}) {
  return (
    <div className="space-y-8">
      <section className="grid gap-6 border-b border-slate-200 pb-8 lg:grid-cols-[180px_minmax(0,1fr)]">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">บัญชีรับเงินเดือน</h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">ข้อมูลสำหรับโอนเงินเดือนและออกเอกสารการจ่าย</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormRow label="ธนาคาร">
            <SelectInput
              options={['กสิกรไทย', 'กรุงเทพ', 'กรุงไทย', 'ไทยพาณิชย์', 'กรุงศรีอยุธยา', 'ทีทีบี', 'ออมสิน']}
              value={draft.bankName}
              onChange={(value) => update('bankName', value)}
              placeholder="เลือกธนาคาร"
            />
          </FormRow>
          <FormRow label="สาขาธนาคาร">
            <TextInput
              value={draft.bankBranch}
              onChange={(value) => update('bankBranch', value)}
              placeholder="ระบุสาขา"
            />
          </FormRow>
          <FormRow label="ชื่อบัญชี">
            <TextInput
              value={draft.bankAccountName}
              onChange={(value) => update('bankAccountName', value)}
              placeholder="ชื่อตามหน้าสมุดบัญชี"
            />
          </FormRow>
          <FormRow label="เลขที่บัญชี">
            <TextInput
              value={draft.bankAccountNumber}
              onChange={(value) => update('bankAccountNumber', value.replace(/\D/g, '').slice(0, 15))}
              placeholder="กรอกเฉพาะตัวเลข"
              inputMode="numeric"
              maxLength={15}
            />
          </FormRow>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[180px_minmax(0,1fr)]">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">ข้อมูล Payroll</h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">กำหนดกลุ่มคำนวณและอัตราค่าจ้างเริ่มต้น</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormRow label="กลุ่มเงินเดือน">
            <SelectInput
              options={['พนักงานรายเดือน', 'พนักงานรายวัน', 'พนักงานชั่วคราว', 'ผู้บริหาร']}
              value={draft.payrollGroup}
              onChange={(value) => update('payrollGroup', value)}
            />
          </FormRow>
          <FormRow label="อัตราค่าจ้าง" hint="สามารถปรับองค์ประกอบรายได้และรายการหักใน Payroll ภายหลัง">
            <TextInput
              value={draft.salaryRate}
              onChange={(value) => update('salaryRate', value.replace(/[^\d.]/g, ''))}
              placeholder="0.00"
              prefix="THB"
              inputMode="numeric"
            />
          </FormRow>
        </div>
      </section>
    </div>
  );
}

function StepTaxAndSocialSecurity({
  draft,
  update,
}: {
  draft: EmployeeDraft;
  update: <K extends keyof EmployeeDraft>(key: K, value: EmployeeDraft[K]) => void;
}) {
  return (
    <div className="space-y-8">
      <section className="grid gap-6 border-b border-slate-200 pb-8 lg:grid-cols-[180px_minmax(0,1fr)]">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">ประกันสังคม</h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">สถานะสำหรับจัดเตรียมการขึ้นทะเบียนและนำส่งเงินสมทบ</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormRow label="สถานะผู้ประกันตน">
            <SelectInput
              options={[
                'ขึ้นทะเบียนผู้ประกันตนใหม่',
                'โอนย้ายจากนายจ้างเดิม',
                'เป็นผู้ประกันตนอยู่แล้ว',
                'ไม่เข้าประกันสังคม',
              ]}
              value={draft.socialSecurityStatus}
              onChange={(value) => update('socialSecurityStatus', value)}
            />
          </FormRow>
          <FormRow label="สถานพยาบาล">
            <TextInput
              value={draft.socialSecurityHospital}
              onChange={(value) => update('socialSecurityHospital', value)}
              placeholder="ระบุสถานพยาบาล หากมี"
            />
          </FormRow>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[180px_minmax(0,1fr)]">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">ภาษีและกองทุน</h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">ค่าเริ่มต้นสำหรับการคำนวณ Payroll ของพนักงาน</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormRow label="วิธีคำนวณภาษี">
            <SelectInput
              options={['คำนวณภาษีแบบเฉลี่ยทั้งปี', 'คำนวณตามเงินได้จริงรายเดือน', 'ยังไม่หักภาษี']}
              value={draft.taxMethod}
              onChange={(value) => update('taxMethod', value)}
            />
          </FormRow>
          <FormRow label="กองทุนสำรองเลี้ยงชีพ">
            <SelectInput
              options={['ไม่เข้าร่วม', 'เข้าร่วม 2%', 'เข้าร่วม 3%', 'เข้าร่วม 5%', 'กำหนดภายหลัง']}
              value={draft.providentFund}
              onChange={(value) => update('providentFund', value)}
            />
          </FormRow>
        </div>
      </section>
    </div>
  );
}

function DocumentUploadRow({
  title,
  description,
  selected,
  onChange,
}: {
  title: string;
  description: string;
  selected: boolean;
  onChange: (selected: boolean) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 py-4 last:border-b-0">
      <div className="flex min-w-0 items-center gap-3">
        <span className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
          selected ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-600'
        }`}>
          {selected ? <CheckIcon className="h-4 w-4" /> : 'DOC'}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-900">{title}</p>
          <p className="mt-0.5 text-xs text-slate-500">{selected ? 'เพิ่มเอกสารแล้ว' : description}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onChange(!selected)}
        className={`h-9 rounded-lg px-3 text-xs font-semibold transition ${
          selected
            ? 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
        }`}
      >
        {selected ? 'นำออก' : 'เลือกเอกสาร'}
      </button>
    </div>
  );
}

function StepDocumentsAndReview({
  draft,
  update,
}: {
  draft: EmployeeDraft;
  update: <K extends keyof EmployeeDraft>(key: K, value: EmployeeDraft[K]) => void;
}) {
  const fullName = `${draft.title} ${draft.firstName} ${draft.lastName}`.replace(/\s+/g, ' ').trim();
  const documentCount = [
    draft.documentIdCard,
    draft.documentHouseRegistration,
    draft.documentBankBook,
    draft.documentEmploymentContract,
  ].filter(Boolean).length;

  return (
    <div className="space-y-8">
      <section className="grid gap-6 border-b border-slate-200 pb-8 lg:grid-cols-[180px_minmax(0,1fr)]">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">เอกสารประกอบ</h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">เพิ่มตอนนี้หรือกลับมาแนบในโปรไฟล์พนักงานภายหลังได้</p>
        </div>
        <div className="border-y border-slate-100">
          <DocumentUploadRow
            title="สำเนาบัตรประชาชน"
            description="ใช้ยืนยันตัวตนและข้อมูลภาษี"
            selected={draft.documentIdCard}
            onChange={(value) => update('documentIdCard', value)}
          />
          <DocumentUploadRow
            title="สำเนาทะเบียนบ้าน"
            description="ใช้ประกอบข้อมูลที่อยู่"
            selected={draft.documentHouseRegistration}
            onChange={(value) => update('documentHouseRegistration', value)}
          />
          <DocumentUploadRow
            title="สำเนาหน้าสมุดบัญชี"
            description="ใช้ตรวจสอบบัญชีรับเงินเดือน"
            selected={draft.documentBankBook}
            onChange={(value) => update('documentBankBook', value)}
          />
          <DocumentUploadRow
            title="สัญญาจ้างงาน"
            description="เอกสารยืนยันเงื่อนไขการจ้าง"
            selected={draft.documentEmploymentContract}
            onChange={(value) => update('documentEmploymentContract', value)}
          />
        </div>
      </section>

      <section className="grid gap-6 border-b border-slate-200 pb-8 lg:grid-cols-[180px_minmax(0,1fr)]">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">ตรวจสอบก่อนสร้าง</h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">ย้อนกลับไปแก้ไขแต่ละขั้นได้ก่อนบันทึก</p>
        </div>
        <dl className="border-t border-slate-100">
          <ReviewRow label="พนักงาน" value={fullName} />
          <ReviewRow label="รหัสพนักงาน" value={draft.employeeCode} />
          <ReviewRow label="สังกัด" value={[draft.company, draft.branch, draft.department].filter(Boolean).join(' / ')} />
          <ReviewRow label="ตำแหน่ง" value={draft.position} />
          <ReviewRow label="วันเริ่มงาน" value={draft.startDate} />
          <ReviewRow
            label="บัญชีเงินเดือน"
            value={[draft.bankName, draft.bankAccountNumber].filter(Boolean).join(' / ')}
          />
          <ReviewRow label="ประกันสังคม" value={draft.socialSecurityStatus} />
          <ReviewRow label="เอกสาร" value={`${documentCount} / 4 รายการ`} />
        </dl>
      </section>

    </div>
  );
}

function StepEmployment({
  draft,
  update,
}: {
  draft: EmployeeDraft;
  update: <K extends keyof EmployeeDraft>(key: K, value: EmployeeDraft[K]) => void;
}) {
  return (
    <div className="space-y-8">
      <section className="grid gap-6 border-b border-slate-200 pb-8 lg:grid-cols-[180px_minmax(0,1fr)]">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">สังกัดในองค์กร</h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">ข้อมูลนี้กำหนดสายบังคับบัญชาและขอบเขตการมองเห็น</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormRow label="บริษัท" required>
            <SelectInput
              options={['G-HUB Enterprise', 'G-HUB Services']}
              value={draft.company}
              onChange={(value) => update('company', value)}
            />
          </FormRow>
          <FormRow label="สาขา" required>
            <SelectInput
              options={['สำนักงานใหญ่', 'สาขาเชียงใหม่', 'สาขาภูเก็ต', 'สาขาขอนแก่น']}
              value={draft.branch}
              onChange={(value) => update('branch', value)}
            />
          </FormRow>
          <FormRow label="แผนก" required>
            <SelectInput
              options={['ฝ่ายบุคคล', 'ฝ่ายบัญชี', 'ฝ่ายขาย', 'เทคโนโลยีสารสนเทศ', 'Operations']}
              value={draft.department}
              onChange={(value) => update('department', value)}
              placeholder="เลือกแผนก"
            />
          </FormRow>
          <FormRow label="ตำแหน่ง" required>
            <SelectInput
              options={['HR Officer', 'Accountant', 'Sales Executive', 'Software Engineer', 'Operations Officer']}
              value={draft.position}
              onChange={(value) => update('position', value)}
              placeholder="เลือกตำแหน่ง"
            />
          </FormRow>
          <div className="sm:col-span-2">
            <FormRow label="ผู้บังคับบัญชา" hint="ใช้กำหนดผู้อนุมัติและลำดับในโครงสร้างองค์กร">
              <SelectInput
                options={['อนุภัทร ใจเที่ยงแท้', 'กิตติพงษ์ วัฒนชัย', 'ศิริพร พัฒนกิจ', 'ยังไม่กำหนด']}
                value={draft.supervisor}
                onChange={(value) => update('supervisor', value)}
                placeholder="ค้นหาหรือเลือกผู้บังคับบัญชา"
              />
            </FormRow>
          </div>
        </div>
      </section>

      <section className="grid gap-6 border-b border-slate-200 pb-8 lg:grid-cols-[180px_minmax(0,1fr)]">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">เงื่อนไขการจ้างงาน</h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">ข้อมูลขั้นต่ำที่ระบบเวลาและ Payroll ต้องใช้</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormRow label="ประเภทพนักงาน" required>
            <SelectInput
              options={['พนักงานรายเดือน', 'พนักงานรายวัน', 'พนักงานชั่วคราว', 'พาร์ทไทม์']}
              value={draft.employeeType}
              onChange={(value) => update('employeeType', value)}
            />
          </FormRow>
          <FormRow label="วันเริ่มงาน" required>
            <TextInput value={draft.startDate} onChange={(value) => update('startDate', value)} placeholder="วว/ดด/ปปปป" />
          </FormRow>
          <div className="sm:col-span-2">
            <FormRow label="ตารางการทำงาน" required>
              <SelectInput
                options={[
                  'จันทร์ - ศุกร์ (08:30 - 17:30)',
                  'จันทร์ - เสาร์ (08:00 - 17:00)',
                  'กะหมุนเวียน',
                  'ยังไม่กำหนด',
                ]}
                value={draft.workSchedule}
                onChange={(value) => update('workSchedule', value)}
              />
            </FormRow>
          </div>
        </div>
      </section>

    </div>
  );
}

function StepSocialSecurity({ draft, onClose }: { draft: EmployeeDraft; onClose: () => void }) {
  const fullName = `${draft.title} ${draft.firstName} ${draft.lastName}`.replace(/\s+/g, ' ').trim();
  const documentCount = [
    draft.documentIdCard,
    draft.documentHouseRegistration,
    draft.documentBankBook,
    draft.documentEmploymentContract,
  ].filter(Boolean).length;
  const payrollReady = Boolean(draft.bankName && draft.bankAccountNumber && draft.salaryRate);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#f7f8fb] px-5">
      <div className="w-full max-w-xl text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckIcon className="h-8 w-8" />
        </div>
        <h2 className="mt-5 text-2xl font-semibold text-slate-950">สร้างพนักงานเรียบร้อย</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          เพิ่ม {fullName || 'พนักงานใหม่'} รหัส {draft.employeeCode} ในระบบแล้ว
        </p>

        <div className="mt-8 border-y border-slate-200 py-2 text-left">
          <div className="flex items-center justify-between gap-4 py-3">
            <span className="text-sm text-slate-600">ประวัติพนักงาน</span>
            <span className="text-xs font-semibold text-emerald-600">สร้างแล้ว</span>
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-slate-100 py-3">
            <span className="text-sm text-slate-600">ข้อมูล Payroll</span>
            <span className={`text-xs font-semibold ${payrollReady ? 'text-emerald-600' : 'text-amber-600'}`}>
              {payrollReady ? 'พร้อมใช้งาน' : 'บันทึกร่างแล้ว'}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-slate-100 py-3">
            <span className="text-sm text-slate-600">เอกสารประกอบ</span>
            <span className={`text-xs font-semibold ${documentCount === 4 ? 'text-emerald-600' : 'text-indigo-600'}`}>
              {documentCount} / 4 รายการ
            </span>
          </div>
        </div>

        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-lg border border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            กลับหน้าพนักงาน
          </button>
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-lg bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            เปิดโปรไฟล์พนักงาน
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Employee Profile Overlay ─────────────────────────────────────── */

const PROFILE_TABS = [
  { key: 'overview', label: 'ภาพรวม', children: [] as { key: string; label: string; sectionKey?: string }[] },
  { key: 'employment', label: 'การจ้างงาน', children: [
    { key: 'emp-info', label: 'ข้อมูลการจ้างงาน', sectionKey: 'employment' },
    { key: 'emp-shift', label: 'กะการทำงาน' },
    { key: 'emp-org', label: 'โครงสร้างองค์กร' },
    { key: 'emp-action', label: 'การดำเนินการ' },
  ]},
  { key: 'workin', label: 'เวิร์กอิน', children: [
    { key: 'wi-time', label: 'เวลาทาบบัตร' },
    { key: 'wi-calendar', label: 'ปฎิทินการเข้างาน', sectionKey: 'wi-calendar' },
    { key: 'wi-checkin', label: 'เวิร์กอิน' },
    { key: 'wi-location', label: 'สถานที่เวิร์กอิน' },
    { key: 'wi-leave', label: 'สิทธิ์การลา' },
  ]},
  { key: 'docs', label: 'เอกสาร', children: [
    { key: 'doc-docs', label: 'เอกสาร', sectionKey: 'docs' },
    { key: 'doc-letter', label: 'หนังสือเตือน' },
  ]},
  { key: 'payroll', label: 'ข้อมูลเงินเดือน', children: [
    { key: 'pay-salary', label: 'เงินเดือน', sectionKey: 'salary' },
    { key: 'pay-annual', label: 'เงินสะสมประจำปี' },
    { key: 'pay-docs', label: 'เอกสารเงินเดือน' },
    { key: 'pay-sso', label: 'ประกันสังคม', sectionKey: 'insurance' },
    { key: 'pay-deduct', label: 'ลดหย่อน' },
  ]},
  { key: 'benefits', label: 'สวัสดิการ', children: [
    { key: 'ben-debt', label: 'ภาระหนี้สิน' },
    { key: 'ben-welfare', label: 'สวัสดิการ' },
  ]},
  { key: 'tasks', label: 'งาน', children: [] as { key: string; label: string; sectionKey?: string }[] },
];

const SIDE_SECTIONS = [
  { key: 'overview', label: 'ภาพรวม' },
  { key: 'personal', label: 'ข้อมูลส่วนตัว' },
  { key: 'account', label: 'ข้อมูลบัญชี' },
  { key: 'contact', label: 'ข้อมูลติดต่อ' },
  { key: 'family', label: 'ครอบครัว' },
  { key: 'workexp', label: 'ประสบการณ์ทำงาน' },
  { key: 'education', label: 'การศึกษา' },
  { key: 'background', label: 'ตรวจสอบประวัติ' },
  { key: 'employment', label: 'การจ้างงาน' },
  { key: 'salary', label: 'ข้อมูลเงินเดือน' },
  { key: 'insurance', label: 'ประกันสังคม' },
  { key: 'docs', label: 'เอกสาร' },
];

const LEAVE_STUBS = [
  { type: 'ลาพักร้อน', used: 3, quota: 10 },
  { type: 'ลาป่วย', used: 1, quota: 30 },
  { type: 'ลากิจ', used: 2, quota: 6 },
  { type: 'ลาคลอด', used: 0, quota: 98 },
  { type: 'ลาอุปสมบท', used: 0, quota: 15 },
];

function IconId(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M8 15s.5-3 4-3 4 3 4 3" />
      <circle cx="12" cy="9" r="2" />
    </svg>
  );
}
function IconBuilding(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14" />
      <path d="M9 21V12h6v9" />
      <path d="M9 7h.01M15 7h.01M9 11h.01M15 11h.01" />
    </svg>
  );
}
function IconCalendarCheck(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
      <path d="M9 16l2 2 4-4" />
    </svg>
  );
}

function ProfileSectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="hr-profile-section">
      <div className="hr-profile-section__header">
        <span className="hr-profile-section__title">{title}</span>
      </div>
      <div className="hr-profile-section__body">{children}</div>
    </div>
  );
}

function Field({ label, value, mono, muted, placeholder }: { label: string; value?: string; mono?: boolean; muted?: boolean; placeholder?: boolean }) {
  return (
    <div className="hr-profile-field">
      <span className="hr-profile-field__label">{label}</span>
      <span className={`hr-profile-field__value${mono ? ' hr-profile-field__value--mono' : muted ? ' hr-profile-field__value--muted' : placeholder ? ' hr-profile-field__value--placeholder' : ''}`}>
        {value ?? '—'}
      </span>
    </div>
  );
}

function SectionEmpty() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 0', gap: '0' }}>
      <img src="/hr-empty-state.svg" alt="ไม่มีข้อมูล" style={{ width: '13rem', height: 'auto', display: 'block' }} />
      <p style={{ fontSize: '0.875rem', color: '#9ca3af', margin: 0, marginTop: '0.75rem', textAlign: 'center', fontWeight: 300 }}>ไม่มีข้อมูล</p>
    </div>
  );
}

// ─── Work Experience Section ─────────────────────────────────────────────────

type WorkExpItem = {
  id: string; company: string; position: string; salary: string;
  fromMonth: string; fromYear: string; toMonth: string; toYear: string;
  responsibilities: string;
};

const WE_MONTHS = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'].map((m, i) => ({ value: String(i + 1).padStart(2, '0'), label: m }));
const WE_YEARS = Array.from({ length: 35 }, (_, i) => { const y = 2025 - i; return { value: String(y), label: String(y) }; });
const EDU_LEVEL_OPTS = ['ต่ำกว่าปริญญาตรี','ปริญญาตรี','ปริญญาโท','ปริญญาเอก','ประกาศนียบัตร','อื่นๆ'].map((v) => ({ value: v, label: v }));

function WorkExpSection() {
  const [items, setItems] = useState<WorkExpItem[]>([]);
  const [adding, setAdding] = useState(false);
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [salary, setSalary] = useState('');
  const [fromMonth, setFromMonth] = useState('');
  const [fromYear, setFromYear] = useState('');
  const [toMonth, setToMonth] = useState('');
  const [toYear, setToYear] = useState('');
  const [responsibilities, setResponsibilities] = useState('');

  const resetForm = () => { setCompany(''); setPosition(''); setSalary(''); setFromMonth(''); setFromYear(''); setToMonth(''); setToYear(''); setResponsibilities(''); };
  const handleSave = () => {
    if (!company.trim()) return;
    const id = String(Date.now());
    setItems((prev) => [...prev, { id, company, position, salary, fromMonth, fromYear, toMonth, toYear, responsibilities }]);
    setAdding(false); resetForm();
  };

  return (
    <div className="hr-profile-flat-section">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <p className="hr-profile-flat-section__title" style={{ margin: 0 }}>ประสบการณ์ทำงาน</p>
        {!adding && <button type="button" className="hr-button hr-button--primary" style={{ fontSize: '0.875rem', padding: '0.375rem 0.875rem' }} onClick={() => { setAdding(true); resetForm(); }}>+ เพิ่มรายการ</button>}
      </div>

      {!adding && items.length === 0 && <SectionEmpty />}

      {!adding && items.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {items.map((item) => (
            <div key={item.id} style={{ border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '1rem 1.125rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ fontWeight: 500, color: '#111827', fontSize: '0.9375rem', marginBottom: '0.2rem' }}>{item.position || '—'}</p>
                <p style={{ color: '#4f46e5', fontSize: '0.875rem', marginBottom: '0.2rem' }}>{item.company}</p>
                <p style={{ color: '#9ca3af', fontSize: '0.8125rem' }}>
                  {item.fromYear ? `${item.fromMonth ? WE_MONTHS.find(m => m.value === item.fromMonth)?.label + ' ' : ''}${item.fromYear}` : ''}
                  {(item.fromYear || item.toYear) ? ' – ' : ''}
                  {item.toYear ? `${item.toMonth ? WE_MONTHS.find(m => m.value === item.toMonth)?.label + ' ' : ''}${item.toYear}` : 'ปัจจุบัน'}
                </p>
              </div>
              <button type="button" onClick={() => setItems((prev) => prev.filter((x) => x.id !== item.id))} style={{ color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', lineHeight: 1, padding: '0.125rem 0.25rem' }}>×</button>
            </div>
          ))}
        </div>
      )}

      {adding && (
        <div className="hr-pif-body">
          <div className="hr-field">
            <label className="hr-field__label">ชื่อบริษัท<span className="hr-field__req">*</span></label>
            <input className="hr-field__ctrl" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="กรอกชื่อบริษัท" />
          </div>
          <div className="hr-pif-grid">
            <div className="hr-field">
              <label className="hr-field__label">ตำแหน่งสุดท้าย<span className="hr-field__req">*</span></label>
              <input className="hr-field__ctrl" value={position} onChange={(e) => setPosition(e.target.value)} placeholder="กรอกตำแหน่งสุดท้าย" />
            </div>
            <div className="hr-field">
              <label className="hr-field__label">เงินเดือนล่าสุด</label>
              <input className="hr-field__ctrl" value={salary} onChange={(e) => setSalary(e.target.value)} placeholder="กรอกเงินเดือนล่าสุด" style={{ textAlign: 'right' }} />
            </div>
          </div>
          <div className="hr-field">
            <label className="hr-field__label">ระยะเวลาทำงาน<span className="hr-field__req">*</span></label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 7rem' }}><HrCustomSelect value={fromMonth} onChange={setFromMonth} options={WE_MONTHS} /></div>
              <div style={{ flex: '1 1 5.5rem' }}><HrCustomSelect value={fromYear} onChange={setFromYear} options={WE_YEARS} /></div>
              <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>ถึง</span>
              <div style={{ flex: '1 1 7rem' }}><HrCustomSelect value={toMonth} onChange={setToMonth} options={WE_MONTHS} /></div>
              <div style={{ flex: '1 1 5.5rem' }}><HrCustomSelect value={toYear} onChange={setToYear} options={WE_YEARS} /></div>
            </div>
          </div>
          <div className="hr-field">
            <label className="hr-field__label">หน้าที่ความรับผิดชอบ</label>
            <textarea className="hr-field__ctrl" value={responsibilities} onChange={(e) => setResponsibilities(e.target.value)} placeholder="ระบุความรับผิดชอบและหน้าที่ที่ได้รับมอบหมาย" rows={4} style={{ height: 'auto', resize: 'vertical' }} />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <button type="button" className="hr-button hr-button--ghost" style={{ border: '1px solid #374151', color: '#374151' }} onClick={() => { setAdding(false); resetForm(); }}>ยกเลิก</button>
            <button type="button" className="hr-button hr-button--primary" onClick={handleSave}>เพิ่ม</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Education Section ────────────────────────────────────────────────────────

type EduItem = {
  id: string; institution: string; level: string; country: 'domestic' | 'abroad';
  faculty: string; major: string; fromYear: string; toYear: string; gpa: string;
};

function EduSection() {
  const [items, setItems] = useState<EduItem[]>([]);
  const [adding, setAdding] = useState(false);
  const [institution, setInstitution] = useState('');
  const [level, setLevel] = useState('');
  const [country, setCountry] = useState<'domestic' | 'abroad'>('domestic');
  const [faculty, setFaculty] = useState('');
  const [major, setMajor] = useState('');
  const [fromYear, setFromYear] = useState('');
  const [toYear, setToYear] = useState('');
  const [gpa, setGpa] = useState('');

  const resetForm = () => { setInstitution(''); setLevel(''); setCountry('domestic'); setFaculty(''); setMajor(''); setFromYear(''); setToYear(''); setGpa(''); };
  const handleSave = () => {
    if (!institution.trim()) return;
    const id = String(Date.now());
    setItems((prev) => [...prev, { id, institution, level, country, faculty, major, fromYear, toYear, gpa }]);
    setAdding(false); resetForm();
  };

  return (
    <div className="hr-profile-flat-section">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <p className="hr-profile-flat-section__title" style={{ margin: 0 }}>ข้อมูลประวัติการศึกษา</p>
        {!adding && <button type="button" className="hr-button hr-button--primary" style={{ fontSize: '0.875rem', padding: '0.375rem 0.875rem' }} onClick={() => { setAdding(true); resetForm(); }}>+ เพิ่มรายการ</button>}
      </div>

      {!adding && items.length === 0 && <SectionEmpty />}

      {!adding && items.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {items.map((item) => (
            <div key={item.id} style={{ border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '1rem 1.125rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ fontWeight: 500, color: '#111827', fontSize: '0.9375rem', marginBottom: '0.2rem' }}>{item.institution}</p>
                <p style={{ color: '#4f46e5', fontSize: '0.875rem', marginBottom: '0.2rem' }}>{[item.level, item.faculty, item.major].filter(Boolean).join(' · ')}</p>
                <p style={{ color: '#9ca3af', fontSize: '0.8125rem' }}>
                  {item.fromYear || ''}
                  {(item.fromYear || item.toYear) ? ' – ' : ''}
                  {item.toYear || ''}
                  {item.gpa ? ` · GPA ${item.gpa}` : ''}
                </p>
              </div>
              <button type="button" onClick={() => setItems((prev) => prev.filter((x) => x.id !== item.id))} style={{ color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', lineHeight: 1, padding: '0.125rem 0.25rem' }}>×</button>
            </div>
          ))}
        </div>
      )}

      {adding && (
        <div className="hr-pif-body">
          <div className="hr-field">
            <label className="hr-field__label">สถานศึกษา<span className="hr-field__req">*</span></label>
            <input className="hr-field__ctrl" value={institution} onChange={(e) => setInstitution(e.target.value)} placeholder="กรอกสถานศึกษา" />
          </div>
          <div className="hr-pif-grid">
            <div className="hr-field">
              <label className="hr-field__label">ระดับการศึกษา<span className="hr-field__req">*</span></label>
              <HrCustomSelect value={level} onChange={setLevel} options={EDU_LEVEL_OPTS} />
            </div>
            <div className="hr-field">
              <label className="hr-field__label">จบการศึกษาจาก<span className="hr-field__req">*</span></label>
              <div className="hr-pif-type-group">
                <button type="button" className={`hr-pif-type-btn${country === 'domestic' ? ' hr-pif-type-btn--active' : ''}`} onClick={() => setCountry('domestic')}>ในประเทศ</button>
                <button type="button" className={`hr-pif-type-btn${country === 'abroad' ? ' hr-pif-type-btn--active' : ''}`} onClick={() => setCountry('abroad')}>ต่างประเทศ</button>
              </div>
            </div>
            <div className="hr-field">
              <label className="hr-field__label">คณะ</label>
              <input className="hr-field__ctrl" value={faculty} onChange={(e) => setFaculty(e.target.value)} placeholder="กรอกคณะ" />
            </div>
            <div className="hr-field">
              <label className="hr-field__label">วิชาเอก</label>
              <input className="hr-field__ctrl" value={major} onChange={(e) => setMajor(e.target.value)} placeholder="กรอกวิชาเอก" />
            </div>
          </div>
          <div className="hr-pif-grid">
            <div className="hr-field">
              <label className="hr-field__label">ปีการศึกษา<span className="hr-field__req">*</span></label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input className="hr-field__ctrl" value={fromYear} onChange={(e) => setFromYear(e.target.value)} placeholder="กรอกปีที่เริ่มต้น" />
                <span style={{ color: '#6b7280', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>ถึง</span>
                <input className="hr-field__ctrl" value={toYear} onChange={(e) => setToYear(e.target.value)} placeholder="กรอกปีที่สิ้นสุด" />
              </div>
            </div>
            <div className="hr-field">
              <label className="hr-field__label">เกรดเฉลี่ย</label>
              <input className="hr-field__ctrl" value={gpa} onChange={(e) => setGpa(e.target.value)} placeholder="กรอกเกรดเฉลี่ย" style={{ textAlign: 'right' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <button type="button" className="hr-button hr-button--ghost" style={{ border: '1px solid #374151', color: '#374151' }} onClick={() => { setAdding(false); resetForm(); }}>ยกเลิก</button>
            <button type="button" className="hr-button hr-button--primary" onClick={handleSave}>เพิ่ม</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Family Section ───────────────────────────────────────────────────────────

type FamilyItem = {
  id: string; name: string; relation: string; birthDate: string; occupation: string; workPhone: string;
};

const FAM_RELATION_OPTS = ['คู่สมรส', 'บิดา', 'มารดา', 'บุตร', 'บุตรี', 'พี่', 'น้อง', 'อื่นๆ'].map((v) => ({ value: v, label: v }));
const FAM_OCCUPATION_OPTS = ['พนักงานเอกชน', 'ข้าราชการ', 'นักเรียน/นักศึกษา', 'ค้าขาย', 'เกษตรกร', 'ประกอบธุรกิจส่วนตัว', 'อื่นๆ'].map((v) => ({ value: v, label: v }));

function FamilySection() {
  const [items, setItems] = useState<FamilyItem[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [name, setName] = useState('');
  const [relation, setRelation] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [occupation, setOccupation] = useState('');
  const [workPhone, setWorkPhone] = useState('');

  const resetForm = () => { setName(''); setRelation(''); setBirthDate(''); setOccupation(''); setWorkPhone(''); };
  const handleOpen = () => { resetForm(); setDrawerOpen(true); };
  const handleClose = () => { setDrawerOpen(false); resetForm(); };
  const handleSave = () => {
    if (!name.trim()) return;
    const id = String(Date.now());
    setItems((prev) => [...prev, { id, name, relation, birthDate, occupation, workPhone }]);
    handleClose();
  };

  return (
    <div className="hr-profile-flat-section">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <p className="hr-profile-flat-section__title" style={{ margin: 0 }}>ครอบครัว</p>
        <button type="button" className="hr-button hr-button--primary" style={{ fontSize: '0.875rem', padding: '0.375rem 0.875rem' }} onClick={handleOpen}>+ เพิ่มรายการ</button>
      </div>

      {items.length === 0 && <SectionEmpty />}

      {items.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {items.map((item) => (
            <div key={item.id} style={{ border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '1rem 1.125rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ fontWeight: 500, color: '#111827', fontSize: '0.9375rem', marginBottom: '0.2rem' }}>{item.name}</p>
                <p style={{ color: '#4f46e5', fontSize: '0.875rem', marginBottom: '0.2rem' }}>{item.relation}</p>
                {item.occupation && <p style={{ color: '#9ca3af', fontSize: '0.8125rem' }}>{item.occupation}</p>}
              </div>
              <button type="button" onClick={() => setItems((prev) => prev.filter((x) => x.id !== item.id))} style={{ color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', lineHeight: 1, padding: '0.125rem 0.25rem' }}>×</button>
            </div>
          ))}
        </div>
      )}

      {/* Scrim */}
      <div className="hr-scrim" data-open={drawerOpen ? 'true' : 'false'} onClick={handleClose} />

      {/* Drawer */}
      <div className="hr-drawer" data-open={drawerOpen ? 'true' : 'false'} role="dialog" aria-modal="true">
        <div className="hr-drawer__head">
          <div>
            <p className="hr-drawer__title">เพิ่มสมาชิกครอบครัว</p>
          </div>
          <button type="button" className="hr-drawer__close" onClick={handleClose} aria-label="ปิด">
            <svg style={{ width: '1rem', height: '1rem' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="hr-drawer__body">
          <div className="hr-field">
            <label className="hr-field__label">ชื่อ - นามสกุล<span className="hr-field__req">*</span></label>
            <input className="hr-field__ctrl" value={name} onChange={(e) => setName(e.target.value)} placeholder="กรอกชื่อ - นามสกุล" />
          </div>
          <div className="hr-field">
            <label className="hr-field__label">ความสัมพันธ์<span className="hr-field__req">*</span></label>
            <HrCustomSelect value={relation} onChange={setRelation} options={FAM_RELATION_OPTS} />
          </div>
          <div className="hr-field">
            <label className="hr-field__label">วันเกิด</label>
            <HrDatePicker value={birthDate} onChange={setBirthDate} />
          </div>
          <div className="hr-field">
            <label className="hr-field__label">อาชีพ</label>
            <HrCustomSelect value={occupation} onChange={setOccupation} options={FAM_OCCUPATION_OPTS} />
          </div>
          <div className="hr-field">
            <label className="hr-field__label">เบอร์ที่ทำงาน</label>
            <input className="hr-field__ctrl" value={workPhone} onChange={(e) => setWorkPhone(e.target.value)} placeholder="กรอกเบอร์ที่ทำงาน" />
          </div>
        </div>
        <div className="hr-drawer__foot">
          <button type="button" className="hr-button hr-button--ghost" style={{ border: '1px solid #d1d5db', color: '#374151' }} onClick={handleClose}>ยกเลิก</button>
          <button type="button" className="hr-button hr-button--primary" onClick={handleSave}>เพิ่ม</button>
        </div>
      </div>
    </div>
  );
}

const TITLE_OPTIONS = [
  { value: 'นาย', label: 'นาย' },
  { value: 'นาง', label: 'นาง' },
  { value: 'นางสาว', label: 'นางสาว' },
  { value: 'ดร.', label: 'ดร.' },
  { value: 'อื่นๆ', label: 'อื่นๆ' },
];

// ─── Confirm Dialog ───────────────────────────────────────────────────────────

function ConfirmMascot() {
  return (
    <svg viewBox="0 0 88 88" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="24" cy="34" rx="10" ry="11" fill="#fed7aa" />
      <ellipse cx="24" cy="34" rx="6.5" ry="7.5" fill="#fdba74" />
      <ellipse cx="64" cy="34" rx="10" ry="11" fill="#fed7aa" />
      <ellipse cx="64" cy="34" rx="6.5" ry="7.5" fill="#fdba74" />
      <ellipse cx="44" cy="46" rx="28" ry="26" fill="#fff7ed" />
      <ellipse cx="44" cy="43" rx="25" ry="22" fill="#fffbf7" />
      <ellipse cx="35.5" cy="41" rx="3.5" ry="4" fill="#1f2937" />
      <ellipse cx="52.5" cy="41" rx="3.5" ry="4" fill="#1f2937" />
      <circle cx="36.8" cy="39.5" r="1.1" fill="white" />
      <circle cx="53.8" cy="39.5" r="1.1" fill="white" />
      <ellipse cx="44" cy="48" rx="5.5" ry="3.5" fill="#fecdd3" />
      <circle cx="42.3" cy="47.8" r="1.1" fill="#f9a8d4" />
      <circle cx="45.7" cy="47.8" r="1.1" fill="#f9a8d4" />
      <ellipse cx="31" cy="49" rx="5" ry="2.8" fill="#fecdd3" opacity="0.5" />
      <ellipse cx="57" cy="49" rx="5" ry="2.8" fill="#fecdd3" opacity="0.5" />
      <path d="M39 52 Q44 56 49 52" stroke="#f9a8d4" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <circle cx="66" cy="19" r="12" fill="#f97316" />
      <text x="66" y="24" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold" fontFamily="Arial, sans-serif">!?</text>
    </svg>
  );
}

function HrConfirmDialog({
  open,
  title,
  description,
  cancelLabel,
  confirmLabel,
  onCancel,
  onConfirm,
  variant = 'save',
}: {
  open: boolean;
  title: string;
  description?: string;
  cancelLabel: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
  variant?: 'save' | 'danger';
}) {
  if (!open) return null;
  return createPortal(
    <div
      className="hr-confirm-dialog-scrim"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="hr-confirm-dialog">
        <div className="hr-confirm-dialog__mascot"><ConfirmMascot /></div>
        <div className="hr-confirm-dialog__content">
          <p className="hr-confirm-dialog__title">{title}</p>
          {description && <p className="hr-confirm-dialog__desc">{description}</p>}
          <div className="hr-confirm-dialog__actions">
            <button type="button" className="hr-confirm-dialog__btn hr-confirm-dialog__btn--cancel" onClick={onCancel}>
              {cancelLabel}
            </button>
            <button
              type="button"
              className={`hr-confirm-dialog__btn hr-confirm-dialog__btn--${variant === 'danger' ? 'danger' : 'save'}`}
              onClick={onConfirm}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

function PersonalInfoForm({ employee, onDirtyChange }: { employee: Employee; onDirtyChange?: (dirty: boolean) => void }) {
  const nameParts = employee.name.split(' ');
  const [nationality, setNationality] = useState<'thai' | 'foreign'>('thai');
  const [title, setTitle] = useState('');
  const [firstNameTh, setFirstNameTh] = useState(nameParts[0] ?? '');
  const [lastNameTh, setLastNameTh] = useState(nameParts[1] ?? '');
  const [firstNameEn, setFirstNameEn] = useState(nameParts[0] ?? '');
  const [lastNameEn, setLastNameEn] = useState(nameParts[1] ?? '');
  const [nicknameTh, setNicknameTh] = useState('');
  const [nicknameEn, setNicknameEn] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<'ชาย' | 'หญิง' | 'อื่นๆ' | ''>('');
  const [idCard, setIdCard] = useState('');
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const dirtyRef = useRef(false);
  const initials = employee.name.slice(0, 2);

  function markDirty() {
    if (!dirtyRef.current) {
      dirtyRef.current = true;
      onDirtyChange?.(true);
    }
  }
  function handleSaveClick() { setShowSaveConfirm(true); }
  function confirmSave() {
    setShowSaveConfirm(false);
    dirtyRef.current = false;
    onDirtyChange?.(false);
  }

  return (
    <div className="hr-pif-wrap" onInput={markDirty}>
      <HrConfirmDialog
        open={showSaveConfirm}
        title="กรุณายืนยันการดำเนินการ"
        description="คุณแน่ใจที่จะแก้ไขข้อมูลใช่หรือไม่?"
        cancelLabel="ยกเลิก"
        confirmLabel="ยืนยัน"
        onCancel={() => setShowSaveConfirm(false)}
        onConfirm={confirmSave}
        variant="save"
      />
      {/* Avatar */}
      <div className="hr-pif-avatar-row">
        <div className="hr-pif-avatar">
          <div className="hr-pif-avatar__img">{initials}</div>
          <div className="hr-pif-avatar__cam">
            <svg style={{ width: '0.75rem', height: '0.75rem' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </div>
        </div>
      </div>

      <div className="hr-pif-body">
        {/* Section title */}
        <p className="hr-pif-section-title">ข้อมูลทั่วไป</p>

        {/* Nationality toggle */}
        <div className="hr-field">
          <label className="hr-field__label">ประเภท<span className="hr-field__req">*</span></label>
          <div className="hr-pif-type-group">
            <button type="button" className={`hr-pif-type-btn${nationality === 'thai' ? ' hr-pif-type-btn--active' : ''}`} onClick={() => { setNationality('thai'); markDirty(); }}>คนไทย</button>
            <button type="button" className={`hr-pif-type-btn${nationality === 'foreign' ? ' hr-pif-type-btn--active' : ''}`} onClick={() => { setNationality('foreign'); markDirty(); }}>ชาวต่างชาติ</button>
          </div>
        </div>

        {/* Title — narrow, above name row */}
        <div style={{ maxWidth: '11rem' }}>
          <div className="hr-field">
            <label className="hr-field__label">คำนำหน้า<span className="hr-field__req">*</span></label>
            <HrCustomSelect
              value={title}
              onChange={(v) => { setTitle(v); markDirty(); }}
              options={TITLE_OPTIONS}
            />
          </div>
        </div>

        {/* Name TH / Last TH */}
        <div className="hr-pif-grid">
          <div className="hr-field">
            <label className="hr-field__label">ชื่อ (TH)<span className="hr-field__req">*</span></label>
            <input className="hr-field__ctrl" value={firstNameTh} onChange={(e) => setFirstNameTh(e.target.value)} placeholder="กรอกชื่อภาษาไทย" />
          </div>
          <div className="hr-field">
            <label className="hr-field__label">นามสกุล (TH)<span className="hr-field__req">*</span></label>
            <input className="hr-field__ctrl" value={lastNameTh} onChange={(e) => setLastNameTh(e.target.value)} placeholder="กรอกนามสกุลภาษาไทย" />
          </div>
        </div>

        {/* Name EN / Last EN */}
        <div className="hr-pif-grid">
          <div className="hr-field">
            <label className="hr-field__label">ชื่อ (EN)<span className="hr-field__req">*</span></label>
            <input className="hr-field__ctrl" value={firstNameEn} onChange={(e) => setFirstNameEn(e.target.value)} placeholder="กรอกชื่อภาษาอังกฤษ" />
          </div>
          <div className="hr-field">
            <label className="hr-field__label">นามสกุล (EN)<span className="hr-field__req">*</span></label>
            <input className="hr-field__ctrl" value={lastNameEn} onChange={(e) => setLastNameEn(e.target.value)} placeholder="กรอกนามสกุลภาษาอังกฤษ" />
          </div>
        </div>

        {/* Nickname TH / EN */}
        <div className="hr-pif-grid">
          <div className="hr-field">
            <label className="hr-field__label">ชื่อเล่น</label>
            <input className="hr-field__ctrl" value={nicknameTh} onChange={(e) => setNicknameTh(e.target.value)} placeholder="กรอกชื่อเล่นภาษาไทย" />
          </div>
          <div className="hr-field">
            <label className="hr-field__label">ชื่อเล่น (EN)</label>
            <input className="hr-field__ctrl" value={nicknameEn} onChange={(e) => setNicknameEn(e.target.value)} placeholder="กรอกชื่อเล่นอังกฤษ" />
          </div>
        </div>

        {/* Birth date / Gender */}
        <div className="hr-pif-grid">
          <div className="hr-field">
            <label className="hr-field__label">วันเกิด<span className="hr-field__req">*</span></label>
            <HrDatePicker value={birthDate} onChange={(v) => { setBirthDate(v); markDirty(); }} />
          </div>
          <div className="hr-field">
            <label className="hr-field__label">เพศ<span className="hr-field__req">*</span></label>
            <div className="hr-pif-type-group">
              {(['ชาย', 'หญิง', 'อื่นๆ'] as const).map((g) => (
                <button key={g} type="button" className={`hr-pif-type-btn${gender === g ? ' hr-pif-type-btn--active' : ''}`} onClick={() => { setGender(g); markDirty(); }}>{g}</button>
              ))}
            </div>
          </div>
        </div>

        {/* ID card */}
        <div className="hr-field">
          <label className="hr-field__label">เลขบัตรประชาชน<span className="hr-field__req">*</span></label>
          <input className="hr-field__ctrl" value={idCard} onChange={(e) => setIdCard(e.target.value)} placeholder="X-XXXX-XXXXX-XX-X" maxLength={17} />
        </div>

        {/* Divider */}
        <hr className="hr-profile-divider" />
        <p className="hr-pif-section-title">ข้อมูลส่วนตัว</p>

        {/* Ethnicity / Nationality */}
        <div className="hr-pif-grid">
          <div className="hr-field">
            <label className="hr-field__label">เชื้อชาติ</label>
            <HrCustomSelect value="" onChange={() => {}} options={[{ value: '', label: 'กรุณาเลือก' }, { value: 'thai', label: 'ไทย' }, { value: 'chinese', label: 'จีน' }, { value: 'other', label: 'อื่นๆ' }]} />
          </div>
          <div className="hr-field">
            <label className="hr-field__label">สัญชาติ</label>
            <HrCustomSelect value="" onChange={() => {}} options={[{ value: '', label: 'กรุณาเลือก' }, { value: 'thai', label: 'ไทย' }, { value: 'other', label: 'อื่นๆ' }]} />
          </div>
        </div>

        {/* Religion / Marital status */}
        <div className="hr-pif-grid">
          <div className="hr-field">
            <label className="hr-field__label">ศาสนา</label>
            <HrCustomSelect value="" onChange={() => {}} options={[{ value: '', label: 'กรุณาเลือก' }, { value: 'buddhism', label: 'พุทธ' }, { value: 'islam', label: 'อิสลาม' }, { value: 'christianity', label: 'คริสต์' }, { value: 'none', label: 'ไม่มีศาสนา' }]} />
          </div>
          <div className="hr-field">
            <label className="hr-field__label">สถานภาพสมรส</label>
            <HrCustomSelect value="" onChange={() => {}} options={[{ value: '', label: 'กรุณาเลือก' }, { value: 'single', label: 'โสด' }, { value: 'married', label: 'สมรส' }, { value: 'divorced', label: 'หย่าร้าง' }, { value: 'widowed', label: 'หม้าย' }]} />
          </div>
        </div>

        {/* Military / Blood type */}
        <div className="hr-pif-grid">
          <div className="hr-field">
            <label className="hr-field__label">สถานภาพเกณฑ์ทหาร</label>
            <HrCustomSelect value="" onChange={() => {}} options={[{ value: '', label: 'กรุณาเลือก' }, { value: 'exempted', label: 'ได้รับการยกเว้น' }, { value: 'completed', label: 'ผ่านการเกณฑ์แล้ว' }, { value: 'na', label: 'ไม่เกี่ยวข้อง' }]} />
          </div>
          <div className="hr-field">
            <label className="hr-field__label">หมู่เลือด</label>
            <HrCustomSelect value="" onChange={() => {}} options={[{ value: '', label: 'กรุณาเลือก' }, { value: 'A', label: 'A' }, { value: 'B', label: 'B' }, { value: 'AB', label: 'AB' }, { value: 'O', label: 'O' }]} />
          </div>
        </div>

        {/* Weight / Height */}
        <div className="hr-pif-grid">
          <div className="hr-field">
            <label className="hr-field__label">น้ำหนัก (กก.)</label>
            <input className="hr-field__ctrl" type="number" placeholder="เช่น 65" />
          </div>
          <div className="hr-field">
            <label className="hr-field__label">ส่วนสูง (ซม.)</label>
            <input className="hr-field__ctrl" type="number" placeholder="เช่น 170" />
          </div>
        </div>

        {/* Note */}
        <div className="hr-field">
          <label className="hr-field__label">หมายเหตุ</label>
          <textarea className="hr-field__ctrl" placeholder="หมายเหตุเพิ่มเติม" rows={3} />
        </div>

        {/* Face scan photo */}
        <hr className="hr-profile-divider" />
        <div className="hr-field">
          <label className="hr-field__label" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            รูปสำหรับใช้ตรวจสอบสแกนใบหน้า
          </label>
          <p style={{ fontSize: '0.75rem', color: '#4f46e5', marginBottom: '0.5rem' }}>
            ในกรณีที่ไม่มีรูป ระบบจะให้ถ่ายรูปตอนเวิร์กอิน เพื่อบันทึกเก็บภาพใบหน้าไว้ให้โดยอัตโนมัติ
          </p>
          <div className="hr-pif-dropzone">
            <svg className="hr-pif-dropzone__icon" style={{ width: '2rem', height: '2rem' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 16 12 12 8 16" />
              <line x1="12" y1="12" x2="12" y2="21" />
              <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
            </svg>
            <span className="hr-pif-dropzone__text">เลือกไฟล์หรือลากวางไฟล์รูปที่นี่</span>
          </div>
        </div>

        {/* Save action */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.75rem' }}>
          <button type="button" className="hr-button hr-button--primary" onClick={handleSaveClick}>บันทึกข้อมูล</button>
        </div>
      </div>

    </div>
  );
}

// ─── Employment Info Form ────────────────────────────────────────────────────

const EI_COMPANY_OPTS = [{ value: 'G-HUB Enterprise', label: 'G-HUB Enterprise' }, { value: 'G-HUB (Thailand)', label: 'G-HUB (Thailand)' }];
const EI_DEPT_OPTS = ['ฝ่ายบุคคล', 'ฝ่ายบัญชี', 'ฝ่ายขาย', 'IT', 'Operations'].map((v) => ({ value: v, label: v }));
const EI_LEVEL_OPTS = ['ระดับบริหาร', 'ระดับผู้จัดการ', 'ระดับหัวหน้างาน', 'ระดับพนักงาน', 'CEO (ประธานเจ้าหน้าที่บริหาร)'].map((v) => ({ value: v, label: v }));
const EI_POSITION_OPTS = ['กรรมการผู้จัดการ', 'ผู้จัดการฝ่าย', 'หัวหน้างาน', 'พนักงาน', 'นักวิเคราะห์', 'นักบัญชี', 'เจ้าหน้าที่ขาย'].map((v) => ({ value: v, label: v }));
const EI_LOCATION_OPTS = ['สำนักงานใหญ่', 'สาขาเชียงใหม่', 'สาขาภูเก็ต', 'Work from home'].map((v) => ({ value: v, label: v }));
const EI_SHIFT_OPTS = ['ทำงาน 08:30 – 17:30', 'S2 - บ่าย 14:00-22:00', 'S3 - เช้า 06:00-14:00', 'S4 - กะดึก 22:00-06:00'].map((v) => ({ value: v, label: v }));
const EI_STATUS_OPTS = ['ปกติ', 'ทดลองงาน', 'ลาพักร้อน', 'สิ้นสุดสัญญา', 'ลาออก'].map((v) => ({ value: v, label: v }));
const EI_EMPTYPE_OPTS = ['รายเดือน', 'รายวัน', 'พาร์ทไทม์', 'ประจำ'].map((v) => ({ value: v, label: v }));
const EI_SUPERVISOR_OPTS = ['สมหญิง ไพศาล', 'อนุภัทร ใจเที่ยงแท้', 'มณี ใจดี', 'สมศักดิ์ มั่งคั่ง'].map((v) => ({ value: v, label: v }));
const EI_HOLIDAY_OPTS = ['วันหยุดพนักงานขาย', 'วันหยุดสำนักงาน', 'วันหยุดโรงงาน', 'กำหนดเอง'].map((v) => ({ value: v, label: v }));
const EI_CONTRACT_OPTS = ['รายวัน', 'รายสัปดาห์', 'รายเดือน', 'โครงการ', 'ไม่มีกำหนด'].map((v) => ({ value: v, label: v }));
const EI_BANK_OPTS = ['ธนาคารกสิกรไทย (KBANK)', 'ธนาคารไทยพาณิชย์ (SCB)', 'ธนาคารกรุงไทย (KTB)', 'ธนาคารกรุงเทพ (BBL)', 'ธนาคารทหารไทย (TTB)'].map((v) => ({ value: v, label: v }));

function EmploymentInfoForm({ employee, onDirtyChange }: { employee: Employee; onDirtyChange?: (dirty: boolean) => void }) {
  const [company, setCompany] = useState('G-HUB Enterprise');
  const [dept, setDept] = useState(employee.department);
  const [level, setLevel] = useState('CEO (ประธานเจ้าหน้าที่บริหาร)');
  const [position, setPosition] = useState(employee.position);
  const [empCode, setEmpCode] = useState(employee.code);
  const [location, setLocation] = useState(employee.branch);
  const [shift, setShift] = useState(employee.schedule);
  const [startDate, setStartDate] = useState(employee.startDate);

  const [status, setStatus] = useState(employee.status as string);
  const [empType, setEmpType] = useState(employee.empType);
  const [supervisor, setSupervisor] = useState('');
  const [contractEnd, setContractEnd] = useState('');
  const [holidayCal, setHolidayCal] = useState('วันหยุดพนักงานขาย');
  const [licenseNo, setLicenseNo] = useState('');
  const [workforce, setWorkforce] = useState<'new' | 'replace'>('new');
  const [timeRecord, setTimeRecord] = useState<'yes' | 'no'>('yes');
  const [contractType, setContractType] = useState('รายเดือน');

  const [payMethod, setPayMethod] = useState<'bank' | 'cash'>('bank');
  const [bank, setBank] = useState('');
  const [accountNo, setAccountNo] = useState('');
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const dirtyRef = useRef(false);

  function markDirty() {
    if (!dirtyRef.current) {
      dirtyRef.current = true;
      onDirtyChange?.(true);
    }
  }
  function handleSaveClick() { setShowSaveConfirm(true); }
  function confirmSave() {
    setShowSaveConfirm(false);
    dirtyRef.current = false;
    onDirtyChange?.(false);
  }

  return (
    <div className="hr-pif-wrap" onInput={markDirty}>
      <HrConfirmDialog
        open={showSaveConfirm}
        title="กรุณายืนยันการดำเนินการ"
        description="คุณแน่ใจที่จะแก้ไขข้อมูลใช่หรือไม่?"
        cancelLabel="ยกเลิก"
        confirmLabel="ยืนยัน"
        onCancel={() => setShowSaveConfirm(false)}
        onConfirm={confirmSave}
        variant="save"
      />
      <div className="hr-pif-body">

        {/* ── ข้อมูลองค์กร ─────────────────────────────────── */}
        <p className="hr-pif-section-title">ข้อมูลองค์กร</p>
        <div className="hr-pif-grid">
          <div className="hr-field">
            <label className="hr-field__label">บริษัท<span className="hr-field__req">*</span></label>
            <HrCustomSelect value={company} onChange={setCompany} options={EI_COMPANY_OPTS} />
          </div>
          <div className="hr-field">
            <label className="hr-field__label">สังกัด<span className="hr-field__req">*</span></label>
            <HrCustomSelect value={dept} onChange={setDept} options={EI_DEPT_OPTS} />
          </div>
          <div className="hr-field">
            <label className="hr-field__label">ระดับ<span className="hr-field__req">*</span></label>
            <HrCustomSelect value={level} onChange={setLevel} options={EI_LEVEL_OPTS} />
          </div>
          <div className="hr-field">
            <label className="hr-field__label">ตำแหน่ง<span className="hr-field__req">*</span></label>
            <HrCustomSelect value={position} onChange={setPosition} options={EI_POSITION_OPTS} />
          </div>
          <div className="hr-field">
            <label className="hr-field__label">รหัสพนักงาน<span className="hr-field__req">*</span></label>
            <input className="hr-field__ctrl" value={empCode} onChange={(e) => setEmpCode(e.target.value)} placeholder="กรอกรหัสพนักงาน" />
          </div>
          <div className="hr-field">
            <label className="hr-field__label">สถานที่ทำงาน</label>
            <HrCustomSelect value={location} onChange={setLocation} options={EI_LOCATION_OPTS} />
          </div>
          <div className="hr-field">
            <label className="hr-field__label">กะทำงาน<span className="hr-field__req">*</span></label>
            <HrCustomSelect value={shift} onChange={setShift} options={EI_SHIFT_OPTS} />
          </div>
          <div className="hr-field">
            <label className="hr-field__label">วันเริ่มงาน<span className="hr-field__req">*</span></label>
            <HrDatePicker value={startDate} onChange={(v) => { setStartDate(v); markDirty(); }} />
          </div>
        </div>

        <hr className="hr-profile-divider" />

        {/* ── ข้อมูลการจ้างงาน ──────────────────────────────── */}
        <p className="hr-pif-section-title">ข้อมูลการจ้างงาน</p>
        <div className="hr-pif-grid">
          <div className="hr-field">
            <label className="hr-field__label">สถานะ<span className="hr-field__req">*</span></label>
            <HrCustomSelect value={status} onChange={setStatus} options={EI_STATUS_OPTS} />
          </div>
          <div className="hr-field">
            <label className="hr-field__label">ประเภทพนักงาน<span className="hr-field__req">*</span></label>
            <HrCustomSelect value={empType} onChange={setEmpType} options={EI_EMPTYPE_OPTS} />
          </div>
          <div className="hr-field">
            <label className="hr-field__label">ผู้บังคับบัญชา</label>
            <HrCustomSelect value={supervisor} onChange={setSupervisor} options={EI_SUPERVISOR_OPTS} />
          </div>
          <div className="hr-field">
            <label className="hr-field__label">วันสิ้นสุดสัญญาจ้าง</label>
            <HrDatePicker value={contractEnd} onChange={(v) => { setContractEnd(v); markDirty(); }} />
          </div>
          <div className="hr-field">
            <label className="hr-field__label">ปฏิทินวันหยุด</label>
            <HrCustomSelect value={holidayCal} onChange={setHolidayCal} options={EI_HOLIDAY_OPTS} />
          </div>
          <div className="hr-field">
            <label className="hr-field__label">เลขที่ใบขับขี่</label>
            <input className="hr-field__ctrl" value={licenseNo} onChange={(e) => setLicenseNo(e.target.value)} placeholder="กรอกเลขที่ใบขับขี่" />
          </div>
          <div className="hr-field">
            <label className="hr-field__label">ประเภทกำลังคน<span className="hr-field__req">*</span></label>
            <div className="hr-pif-type-group">
              <button type="button" className={`hr-pif-type-btn${workforce === 'new' ? ' hr-pif-type-btn--active' : ''}`} onClick={() => setWorkforce('new')}>ใหม่</button>
              <button type="button" className={`hr-pif-type-btn${workforce === 'replace' ? ' hr-pif-type-btn--active' : ''}`} onClick={() => setWorkforce('replace')}>ทดแทน</button>
            </div>
          </div>
          <div className="hr-field">
            <label className="hr-field__label">บันทึกเวลาเข้าออก<span className="hr-field__req">*</span></label>
            <div className="hr-pif-type-group">
              <button type="button" className={`hr-pif-type-btn${timeRecord === 'yes' ? ' hr-pif-type-btn--active' : ''}`} onClick={() => setTimeRecord('yes')}>บันทึก</button>
              <button type="button" className={`hr-pif-type-btn${timeRecord === 'no' ? ' hr-pif-type-btn--active' : ''}`} onClick={() => setTimeRecord('no')}>ไม่บันทึก</button>
            </div>
          </div>
        </div>
        <div className="hr-pif-grid hr-pif-grid--full">
          <div className="hr-field">
            <label className="hr-field__label">ประเภทการจ้าง<span className="hr-field__req">*</span></label>
            <HrCustomSelect value={contractType} onChange={setContractType} options={EI_CONTRACT_OPTS} />
          </div>
        </div>

        <hr className="hr-profile-divider" />

        {/* ── ข้อมูลการจ่ายเงิน ─────────────────────────────── */}
        <p className="hr-pif-section-title">ข้อมูลการจ่ายเงิน</p>
        <div className="hr-field">
          <div className="hr-pif-type-group">
            <button type="button" className={`hr-pif-type-btn${payMethod === 'bank' ? ' hr-pif-type-btn--active' : ''}`} onClick={() => setPayMethod('bank')}>ธนาคาร</button>
            <button type="button" className={`hr-pif-type-btn${payMethod === 'cash' ? ' hr-pif-type-btn--active' : ''}`} onClick={() => setPayMethod('cash')}>เงินสด</button>
          </div>
        </div>
        {payMethod === 'bank' && (
          <div className="hr-pif-grid">
            <div className="hr-field">
              <label className="hr-field__label">บัญชีธนาคาร<span className="hr-field__req">*</span></label>
              <HrCustomSelect value={bank} onChange={(v) => { setBank(v); markDirty(); }} options={EI_BANK_OPTS} />
            </div>
            <div className="hr-field">
              <label className="hr-field__label">เลขที่บัญชีพนักงาน<span className="hr-field__req">*</span></label>
              <input className="hr-field__ctrl" value={accountNo} onChange={(e) => setAccountNo(e.target.value)} placeholder="กรอกเลขบัญชี" />
            </div>
          </div>
        )}

        {/* Save action */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.75rem' }}>
          <button type="button" className="hr-button hr-button--primary" onClick={handleSaveClick}>บันทึกข้อมูล</button>
        </div>

      </div>
    </div>
  );
}

const MOCK_ROLES = ['Administrator', 'Staff'];
const ACCOUNT_STATUSES = [
  { label: 'Email', on: true },
  { label: 'Single sign-on', on: false },
  { label: 'Sign in without email', on: false },
  { label: '2FA Authenticator', on: false },
];

function AccountInfoForm({ employee }: { employee: Employee }) {
  const [phone, setPhone] = useState(employee.phone);
  const [roles, setRoles] = useState<string[]>(MOCK_ROLES);

  return (
    <div className="hr-pif-wrap">
      <div className="hr-pif-body">
        <p className="hr-pif-section-title">ข้อมูลบัญชี</p>

        {/* Username */}
        <div className="hr-field">
          <label className="hr-field__label">Username<span className="hr-field__req">*</span></label>
          <div className="hr-pif-username-row">
            {employee.email}
            <button type="button" className="hr-pif-username-edit" aria-label="แก้ไข">
              <svg style={{ width: '0.875rem', height: '0.875rem' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile */}
        <div className="hr-field">
          <label className="hr-field__label">เบอร์มือถือ</label>
          <input className="hr-field__ctrl" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="กรอกเบอร์มือถือ" />
        </div>

        {/* Roles */}
        <div className="hr-field">
          <label className="hr-field__label">บทบาท<span className="hr-field__req">*</span></label>
          <div className="hr-pif-chip-input">
            {roles.map((r) => (
              <span key={r} className="hr-pif-chip">
                {r}
                <button type="button" className="hr-pif-chip__remove" onClick={() => setRoles((prev) => prev.filter((x) => x !== r))} aria-label={`ลบ ${r}`}>
                  <svg style={{ width: '0.625rem', height: '0.625rem' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Account status */}
        <hr className="hr-profile-divider" style={{ margin: '0.25rem 0' }} />
        <div>
          <p className="hr-pif-subsection-title">สถานะบัญชี</p>
          {ACCOUNT_STATUSES.map((s) => (
            <div key={s.label} className="hr-pif-status-row">
              <span className="hr-pif-status-row__label">{s.label}</span>
              <span className={s.on ? 'hr-pif-status--on' : 'hr-pif-status--off'}>{s.on ? 'ใช้งาน' : 'ไม่ใช้งาน'}</span>
            </div>
          ))}
        </div>

        <button type="button" className="hr-pif-danger-link">ลบบัญชีผู้ใช้</button>
      </div>
    </div>
  );
}

// ─── WorkInCalendar ───────────────────────────────────────────────────────────
const WICAL_MONTHS = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
function wicalPad(n: number) { return String(n).padStart(2, '0'); }
function wicalSeed(s: string) { return s.split('').reduce((a, c) => a + c.charCodeAt(0), 0); }
function wicalRand(seed: number) { const x = Math.sin(seed) * 10000; return x - Math.floor(x); }
function wicalMockAtt(empId: string, iso: string): { in: string; out: string } | null {
  const seed = wicalSeed(empId + iso);
  if (wicalRand(seed) < 0.18) return null;
  const inM = 7*60 + 20 + Math.floor(wicalRand(seed+1) * 80);
  const outM = 16*60 + 30 + Math.floor(wicalRand(seed+2) * 150);
  return { in: `${wicalPad(Math.floor(inM/60))}:${wicalPad(inM%60)}`, out: `${wicalPad(Math.floor(outM/60))}:${wicalPad(outM%60)}` };
}

function WorkInCalendar({ employee }: { employee: Employee }) {
  const todayDate = new Date();
  const [viewYear, setViewYear] = useState(todayDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(todayDate.getMonth());
  const [holidayDates, setHolidayDates] = useState<Record<string, string>>({});

  useEffect(() => {
    const map: Record<string, string> = {};
    try {
      const raw = window.localStorage.getItem('g-hub.hr.holiday-custom');
      if (raw) {
        (JSON.parse(raw) as Array<{ date: string; title: string }>).forEach(h => { if (h.date) map[h.date] = h.title; });
      }
    } catch { /* ignore */ }
    try {
      const raw2 = window.localStorage.getItem(`g-hub.hr.holiday-data-${viewYear}`);
      if (raw2) {
        (JSON.parse(raw2) as Array<{ date: string; title: string }>).forEach(h => { if (h.date) map[h.date] = h.title; });
      }
    } catch { /* ignore */ }
    setHolidayDates(map);
  }, [viewYear, viewMonth]);

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  }

  const todayIso = `${todayDate.getFullYear()}-${wicalPad(todayDate.getMonth()+1)}-${wicalPad(todayDate.getDate())}`;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDow = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7;
  const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();

  const shiftMatch = (employee.schedule ?? '').match(/(\d{1,2}:\d{2})\s*[-–]\s*(\d{1,2}:\d{2})/);
  const shiftStart = shiftMatch?.[1] ?? '08:00';
  const shiftEnd = shiftMatch?.[2] ?? '17:00';
  const shiftLabel = `สำนักงาน ${shiftStart}-${shiftEnd}`;

  const beYear = viewYear + 543;
  const todayDowJs = todayDate.getDay();

  type GridCell = { iso: string; day: number; isCurrentMonth: boolean };
  const cells: GridCell[] = [];
  for (let i = 0; i < firstDow; i++) {
    const d = prevMonthDays - firstDow + i + 1;
    const m = viewMonth === 0 ? 11 : viewMonth - 1;
    const y = viewMonth === 0 ? viewYear - 1 : viewYear;
    cells.push({ iso: `${y}-${wicalPad(m+1)}-${wicalPad(d)}`, day: d, isCurrentMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ iso: `${viewYear}-${wicalPad(viewMonth+1)}-${wicalPad(d)}`, day: d, isCurrentMonth: true });
  }
  const trailing = (7 - cells.length % 7) % 7;
  for (let d = 1; d <= trailing; d++) {
    const m = viewMonth === 11 ? 0 : viewMonth + 1;
    const y = viewMonth === 11 ? viewYear + 1 : viewYear;
    cells.push({ iso: `${y}-${wicalPad(m+1)}-${wicalPad(d)}`, day: d, isCurrentMonth: false });
  }

  const DOW_LABELS = ['วันจันทร์','วันอังคาร','วันพุธ','วันพฤหัสบดี','วันศุกร์','วันเสาร์','วันอาทิตย์'];

  return (
    <div className="hr-wical">
      <div className="hr-wical__header">
        <h2 className="hr-wical__title">ปฏิทินการเข้างาน</h2>
        <div className="hr-wical__nav">
          <button type="button" className="hr-wical__today-btn" onClick={() => { setViewYear(todayDate.getFullYear()); setViewMonth(todayDate.getMonth()); }}>วันนี้</button>
          <button type="button" className="hr-wical__arrow" onClick={prevMonth}>‹</button>
          <span className="hr-wical__month-label">{WICAL_MONTHS[viewMonth]} {beYear}</span>
          <button type="button" className="hr-wical__arrow" onClick={nextMonth}>›</button>
        </div>
        <button type="button" className="hr-wical__refresh" aria-label="รีเฟรช">
          <svg className="hr-wical__refresh-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 4v6h-6"/><path d="M1 20v-6h6"/>
            <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
          </svg>
        </button>
      </div>

      <div className="hr-wical__grid">
        {DOW_LABELS.map((label, i) => {
          const jsDow = i === 6 ? 0 : i + 1;
          const isCurrentDow = viewYear === todayDate.getFullYear() && viewMonth === todayDate.getMonth() && jsDow === todayDowJs;
          return <div key={label} className={`hr-wical__dow${isCurrentDow ? ' hr-wical__dow--today' : ''}`}>{label}</div>;
        })}

        {cells.map((cell) => {
          if (!cell.isCurrentMonth) {
            return <div key={cell.iso + '-o'} className="hr-wical__cell hr-wical__cell--other"><span className="hr-wical__date">{cell.day}</span></div>;
          }
          const isTodayCell = cell.iso === todayIso;
          const isFutureCell = cell.iso > todayIso;
          const cellDowJs = new Date(viewYear, viewMonth, cell.day).getDay();
          const isSunday = cellDowJs === 0;
          const holidayTitle = holidayDates[cell.iso];

          return (
            <div key={cell.iso} className={`hr-wical__cell${isTodayCell ? ' hr-wical__cell--today' : ''}`}>
              <span className={`hr-wical__date${isTodayCell ? ' hr-wical__date--today' : ''}`}>{cell.day}</span>
              {isTodayCell ? (
                <div className="hr-wical__event hr-wical__event--schedule">{shiftLabel}</div>
              ) : holidayTitle ? (
                <div className="hr-wical__event hr-wical__event--holiday" title={holidayTitle}>{holidayTitle}</div>
              ) : isFutureCell || isSunday ? null : (() => {
                const att = wicalMockAtt(employee.id, cell.iso);
                return att
                  ? <div className="hr-wical__event hr-wical__event--present">ปกติ {att.in} - {att.out}</div>
                  : <div className="hr-wical__event hr-wical__event--absent">ขาดงาน</div>;
              })()}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OverviewTab({ employee, section, onSection }: { employee: Employee; section: string; onSection: (s: string) => void }) {
  const [selfEdit, setSelfEdit] = useState(false);
  const hasForm = section === 'personal' || section === 'account';
  const [dirty, setDirty] = useState(false);
  const [pendingSection, setPendingSection] = useState<string | null>(null);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);

  function tryNavigate(key: string) {
    if (dirty && key !== section) {
      setPendingSection(key);
      setShowDiscardDialog(true);
    } else {
      setDirty(false);
      onSection(key);
    }
  }
  function confirmDiscard() {
    setDirty(false);
    setShowDiscardDialog(false);
    if (pendingSection) onSection(pendingSection);
    setPendingSection(null);
  }
  function cancelDiscard() {
    setShowDiscardDialog(false);
    setPendingSection(null);
  }

  return (
    <>
    <HrConfirmDialog
      open={showDiscardDialog}
      title="ยกเลิกการแก้ไขข้อมูล?"
      description="การแก้ไขข้อมูลทั้งหมดจะไม่ถูกบันทึกในระบบ"
      cancelLabel="แก้ไขต่อ"
      confirmLabel="ใช่ ยกเลิกเลย"
      onCancel={cancelDiscard}
      onConfirm={confirmDiscard}
      variant="danger"
    />
    <div className="hr-profile-body">
      {/* Left sidenav */}
      <nav className="hr-profile-sidenav">
        {SIDE_SECTIONS.map((s) => (
          <button
            key={s.key}
            type="button"
            className={`hr-profile-sidenav__item${section === s.key ? ' hr-profile-sidenav__item--active' : ''}`}
            onClick={() => tryNavigate(s.key)}
          >
            {s.label}
          </button>
        ))}
      </nav>

      {/* Main content */}
      <div className="hr-profile-main">
        {/* Overview summary */}
        {section === 'overview' && (
          <>
            <ProfileSectionCard title="ข้อมูลการจ้างงาน">
              <div className="hr-profile-field-grid">
                <Field label="รหัสพนักงาน" value={employee.code} mono />
                <Field label="ตำแหน่ง" value={employee.position} />
                <Field label="แผนก / ฝ่าย" value={employee.department} />
                <Field label="สาขา" value={employee.branch} />
                <Field label="ประเภทการจ้าง" value={employee.empType} />
                <Field label="กะการทำงาน" value={employee.schedule} />
                <Field label="วันที่เริ่มงาน" value={employee.startDate} />
                <Field label="สถานะ" value={employee.status} />
                <Field label="อีเมลบริษัท" value={employee.email} />
              </div>
            </ProfileSectionCard>
            <ProfileSectionCard title="ข้อมูลส่วนตัว (สรุป)">
              <div className="hr-profile-field-grid">
                <Field label="ชื่อ - นามสกุล" value={employee.name} />
                <Field label="เพศ" value="ไม่ระบุ" muted />
                <Field label="สัญชาติ" value="ไทย" />
                <Field label="วันเกิด" placeholder value="ยังไม่กรอกข้อมูล" />
                <Field label="หมายเลขบัตรประชาชน" placeholder value="ยังไม่กรอกข้อมูล" />
                <Field label="เบอร์โทรศัพท์" value={employee.phone} />
              </div>
            </ProfileSectionCard>
          </>
        )}

        {/* Personal */}
        {section === 'personal' && (
          <PersonalInfoForm employee={employee} onDirtyChange={setDirty} />
        )}

        {/* Account */}
        {section === 'account' && (
          <AccountInfoForm employee={employee} />
        )}

        {/* Contact */}
        {section === 'contact' && (
          <div className="hr-profile-flat-section">
            <p className="hr-profile-flat-section__title">ข้อมูลติดต่อ</p>
            <div className="hr-profile-field-grid">
              <Field label="เบอร์โทรศัพท์" value={employee.phone} />
              <Field label="อีเมลส่วนตัว" placeholder value="ยังไม่กรอกข้อมูล" />
              <Field label="Line ID" placeholder value="ยังไม่กรอกข้อมูล" />
              <Field label="ที่อยู่" placeholder value="ยังไม่กรอกข้อมูล" />
              <Field label="จังหวัด" placeholder value="ยังไม่กรอกข้อมูล" />
              <Field label="รหัสไปรษณีย์" placeholder value="ยังไม่กรอกข้อมูล" />
            </div>
          </div>
        )}

        {/* Family */}
        {/* Family */}
        {section === 'family' && <FamilySection />}

        {/* Work experience */}
        {section === 'workexp' && <WorkExpSection />}

        {/* Education */}
        {section === 'education' && <EduSection />}

        {/* Background check */}
        {section === 'background' && (
          <div className="hr-profile-flat-section">
            <p className="hr-profile-flat-section__title">ตรวจสอบประวัติ</p>
            <p className="hr-profile-flat-empty">ยังไม่มีข้อมูลการตรวจสอบประวัติ</p>
          </div>
        )}

        {/* Employment */}
        {section === 'employment' && (
          <EmploymentInfoForm employee={employee} onDirtyChange={setDirty} />
        )}

        {/* Salary */}
        {section === 'salary' && (
          <div className="hr-profile-flat-section">
            <p className="hr-profile-flat-section__title">ข้อมูลเงินเดือน</p>
            <p className="hr-profile-flat-empty">ยังไม่มีข้อมูลเงินเดือน</p>
          </div>
        )}

        {/* Insurance */}
        {section === 'insurance' && (
          <div className="hr-profile-flat-section">
            <p className="hr-profile-flat-section__title">ประกันสังคม</p>
            <p className="hr-profile-flat-empty">ยังไม่มีข้อมูลประกันสังคม</p>
          </div>
        )}

        {/* Attendance calendar */}
        {section === 'wi-calendar' && (
          <WorkInCalendar employee={employee} />
        )}

        {/* Docs */}
        {section === 'docs' && (
          <div className="hr-profile-flat-section">
            <p className="hr-profile-flat-section__title">เอกสาร</p>
            <p className="hr-profile-flat-empty">ยังไม่มีเอกสาร</p>
          </div>
        )}
      </div>

      {/* Right sidebar — overview only */}
      {section === 'overview' && <aside className="hr-profile-right">
        {/* Attendance stats */}
        <div>
          <p className="hr-profile-right__title">การเข้างาน (เดือนนี้)</p>
          <div className="hr-profile-stat-row">
            <div className="hr-profile-stat-box hr-profile-stat-box--green">
              <div className="hr-profile-stat-box__num">18</div>
              <div className="hr-profile-stat-box__label">มาทำงาน</div>
            </div>
            <div className="hr-profile-stat-box hr-profile-stat-box--red">
              <div className="hr-profile-stat-box__num">0</div>
              <div className="hr-profile-stat-box__label">ขาดงาน</div>
            </div>
            <div className="hr-profile-stat-box hr-profile-stat-box--amber">
              <div className="hr-profile-stat-box__num">1</div>
              <div className="hr-profile-stat-box__label">มาสาย</div>
            </div>
          </div>
        </div>

        <hr className="hr-profile-divider" />

        {/* Contact info */}
        <div>
          <p className="hr-profile-right__title">ข้อมูลติดต่อ</p>
          <div className="hr-profile-contact-item">
            <svg style={{ width: '0.875rem', height: '0.875rem' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m2 7 10 7 10-7" />
            </svg>
            {employee.email}
          </div>
          <div className="hr-profile-contact-item">
            <svg style={{ width: '0.875rem', height: '0.875rem' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.64 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.55 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.5a16 16 0 0 0 5.95 5.95l.92-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            {employee.phone}
          </div>
        </div>

        <hr className="hr-profile-divider" />

        {/* Leave balance */}
        <div>
          <p className="hr-profile-right__title">สิทธิการลาคงเหลือ</p>
          <table className="hr-profile-leave-table">
            <tbody>
              {LEAVE_STUBS.map((l) => (
                <tr key={l.type}>
                  <td>{l.type}</td>
                  <td>{l.quota - l.used} วัน</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </aside>}
    </div>

    {/* Sticky bottom bar — full-width, below sidenav + main */}
    {hasForm && (
      <div className="hr-profile-sticky-bar">
        <div className="hr-profile-sticky-bar__left">
          {section === 'personal' && (
            <>
              <label className="hr-leave-toggle" style={{ marginBottom: 0 }}>
                <input type="checkbox" checked={selfEdit} onChange={(e) => setSelfEdit(e.target.checked)} />
                <span className="hr-leave-toggle__track">
                  <span className="hr-leave-toggle__thumb" />
                </span>
              </label>
              <span>เปิดให้พนักงานกรอกข้อมูลตั้งต้นได้เอง</span>
              <span className="hr-profile-sticky-bar__info" title="พนักงานสามารถแก้ไขข้อมูลส่วนตัวของตนเองได้ผ่านแอปพลิเคชัน">i</span>
            </>
          )}
        </div>
        <div className="hr-profile-sticky-bar__right">
          <button type="button" className="hr-button hr-button--ghost" style={{ border: '1px solid #374151', color: '#374151' }} onClick={() => onSection('overview')}>ยกเลิก</button>
          <button type="button" className="hr-button hr-button--primary">บันทึก</button>
        </div>
      </div>
    )}
    </>
  );
}

function PlaceholderTab({ label }: { label: string }) {
  return (
    <div className="hr-profile-body" style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', color: '#9ca3af', padding: '4rem' }}>
        <svg style={{ width: '3rem', height: '3rem', margin: '0 auto 0.75rem', color: '#e5e7eb' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
        </svg>
        <p className="text-sm font-medium" style={{ color: '#374151' }}>แท็บ {label}</p>
        <p className="text-xs mt-1">อยู่ระหว่างพัฒนา</p>
      </div>
    </div>
  );
}

/* ─── Shift schedule (กะการทำงาน) ───────────────────────────────────── */

const SHIFTCAL_DAYS: Array<{ dow: string; date: number; today?: boolean }> = [
  { dow: 'จ.', date: 22 },
  { dow: 'อ.', date: 23 },
  { dow: 'พ.', date: 24 },
  { dow: 'พฤ.', date: 25 },
  { dow: 'ศ.', date: 26 },
  { dow: 'ส.', date: 27, today: true },
  { dow: 'อา.', date: 28 },
];
const SHIFTCAL_ROW: Array<string | null> = ['S1', 'S1', 'S1', 'S4', 'S4', 'S4', 'S4'];

const SHIFTCAL_MONTH_WEEKDAYS = ['จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส', 'อา'];
const SHIFTCAL_MONTH_DAYS = 30;
const SHIFTCAL_MONTH_SHIFTS: Record<number, string> = {
  1: 'S1', 2: 'S1', 3: 'S1', 4: 'S4', 5: 'S4', 6: 'S4', 7: 'S4',
  8: 'S1', 9: 'S1', 10: 'S1', 11: 'S4', 12: 'S4', 13: 'S4', 14: 'S4',
  15: 'S1', 16: 'S1', 17: 'S1', 18: 'S4', 19: 'S4', 20: 'S1', 21: 'S1',
  22: 'S1', 23: 'S1', 24: 'S1', 25: 'S4', 26: 'S4', 27: 'S4', 28: 'S4',
  29: 'S1', 30: 'S1',
};
// Weekend day-of-week labels (week uses 'ส.'/'อา.', month uses 'ส'/'อา') → rest day / OFF.
const SHIFTCAL_OFF_DOWS = new Set(['ส', 'ส.', 'อา', 'อา.']);
type ShiftCalDay = { dow: string; date: number; shift: string | null; off: boolean };

const SHIFTCAL_TODAY_DATE = 27; // mock: June 27
const SHIFTCAL_MONTH_COL_PX = 72; // 4.5rem at 16px base

function ShiftScheduleTab({ employee }: { employee: Employee }) {
  const [view, setView] = useState<'week' | 'month'>('week');
  const [workWeekOnly, setWorkWeekOnly] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const initials = employee.name.slice(0, 2);

  const weekDays: ShiftCalDay[] = SHIFTCAL_DAYS.map((d, i) => ({ dow: d.dow, date: d.date, shift: SHIFTCAL_ROW[i] ?? null, off: SHIFTCAL_OFF_DOWS.has(d.dow) }));
  const monthDays: ShiftCalDay[] = Array.from({ length: SHIFTCAL_MONTH_DAYS }, (_, i) => {
    const dow = SHIFTCAL_MONTH_WEEKDAYS[i % 7];
    return { dow, date: i + 1, shift: SHIFTCAL_MONTH_SHIFTS[i + 1] ?? null, off: SHIFTCAL_OFF_DOWS.has(dow) };
  });
  const baseDays = view === 'week' ? weekDays : monthDays;
  const days = workWeekOnly ? baseDays.filter((d) => d.shift !== null && !d.off) : baseDays;
  const assigned = days.filter((d) => d.shift && !d.off).length;
  const colTemplate = view === 'month'
    ? `repeat(${days.length}, 4.5rem)`
    : `repeat(${days.length}, minmax(0, 1fr))`;
  const rangeLabel = view === 'week' ? '22 - 28 มิถุนายน 2569' : '1 - 30 มิถุนายน 2569';

  const scrollToToday = () => {
    if (!scrollRef.current || view !== 'month') return;
    const todayIndex = days.findIndex((d) => d.date === SHIFTCAL_TODAY_DATE);
    if (todayIndex < 0) return;
    scrollRef.current.scrollLeft = Math.max(0, (todayIndex - 2) * SHIFTCAL_MONTH_COL_PX);
  };


  return (
    <div className="hr-shiftcal">
      {/* Toolbar */}
      <div className="hr-shiftcal-toolbar">
        <div className="hr-shiftcal-toolbar__group">
          <span className="hr-shiftcal-title">ข้อมูลกะการทำงาน</span>
          <button type="button" className="hr-shiftcal-linkbtn" aria-label="เปิดในหน้าเต็ม">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            </svg>
          </button>
        </div>

        <div className="hr-shiftcal-toolbar__group">
          <button type="button" className="hr-shiftcal-btn" onClick={scrollToToday}>วันนี้</button>
          <button type="button" className="hr-shiftcal-navbtn" aria-label="ก่อนหน้า">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
          </button>
          <button type="button" className="hr-shiftcal-daterange">
            {rangeLabel}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
          </button>
          <button type="button" className="hr-shiftcal-navbtn" aria-label="ถัดไป">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
          </button>
        </div>

        <div className="hr-shiftcal-toolbar__group">
          <button type="button" className="hr-shiftcal-iconbtn" aria-label="ช่วยเหลือ">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><path d="M12 17h.01" /></svg>
          </button>
          <button
            type="button"
            className={`hr-shiftcal-iconbtn${workWeekOnly ? ' hr-shiftcal-iconbtn--active' : ''}`}
            title="ดูเฉพาะวันที่มีกะ"
            aria-pressed={workWeekOnly}
            onClick={() => setWorkWeekOnly((v) => !v)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
          </button>
          <div className="hr-shiftcal-toggle" role="group">
            <button type="button" className={`hr-shiftcal-toggle__opt${view === 'week' ? ' hr-shiftcal-toggle__opt--active' : ''}`} onClick={() => setView('week')}>สัปดาห์</button>
            <button type="button" className={`hr-shiftcal-toggle__opt${view === 'month' ? ' hr-shiftcal-toggle__opt--active' : ''}`} onClick={() => setView('month')}>เดือน</button>
          </div>
          <button type="button" className="hr-shiftcal-iconbtn" aria-label="ประวัติ">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v5h5" /><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" /><path d="M12 7v5l4 2" /></svg>
          </button>
          <button type="button" className="hr-shiftcal-assign">
            มอบหมายกะ
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
          </button>
        </div>
      </div>

      {/* Board: fixed name column + horizontally scrollable day grid */}
      <div className="hr-shiftcal-board">
        {/* Fixed name column */}
        <div className="hr-shiftcal-namecol">
          <div className="hr-shiftcal-cell hr-shiftcal-cell--name hr-shiftcal-headcell">
            รายชื่อ
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="hr-shiftcal-sort"><path d="m21 16-4 4-4-4M17 20V4M3 8l4-4 4 4M7 4v16" /></svg>
          </div>
          <div className="hr-shiftcal-cell hr-shiftcal-cell--name hr-shiftcal-namecell">
            <div className="hr-shiftcal-emp">
              <span className="hr-shiftcal-emp__avatar">{initials}</span>
              <span className="hr-shiftcal-emp__info">
                <span className="hr-shiftcal-emp__name">{employee.name}</span>
                <span className="hr-shiftcal-emp__sub">{employee.position}</span>
              </span>
              <span className="hr-shiftcal-emp__count">{assigned}/{days.length}</span>
            </div>
          </div>
          <div className="hr-shiftcal-cell hr-shiftcal-cell--name hr-shiftcal-total__label">รวม</div>
        </div>

        {/* Scrollable day grid */}
        <div className="hr-shiftcal-scroll" ref={scrollRef}>
          <div className="hr-shiftcal-grid" style={{ gridTemplateColumns: colTemplate, width: view === 'month' ? 'max-content' : '100%' }}>
            {/* Head */}
            {days.map((d, i) => (
              <div key={i} className={`hr-shiftcal-cell hr-shiftcal-headcell hr-shiftcal-dayhead${d.date === SHIFTCAL_TODAY_DATE && view === 'month' ? ' hr-shiftcal-dayhead--today' : ''}`}>
                <span className="hr-shiftcal-dayhead__dow">{d.dow}</span>
                <span className="hr-shiftcal-dayhead__date">{d.date}</span>
              </div>
            ))}

            {/* Employee shift slots */}
            {days.map((d, i) => (
              <div key={i} className="hr-shiftcal-cell hr-shiftcal-slot">
                {d.shift && (
                  d.off ? (
                    <span className="hr-shiftcal-shift hr-shiftcal-shift--off">
                      {d.shift}
                      <span className="hr-shiftcal-off-fold" />
                      <span className="hr-shiftcal-off-label">OFF</span>
                    </span>
                  ) : (
                    <span className={`hr-shiftcal-shift hr-shiftcal-shift--${d.shift.toLowerCase()}`}>{d.shift}</span>
                  )
                )}
              </div>
            ))}

            {/* Total row */}
            {days.map((d, i) => (
              <div key={i} className="hr-shiftcal-cell hr-shiftcal-total__cell">{d.shift && !d.off ? 1 : 0}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function HrEmployeeProfileOverlay({
  tabs, activeId, minimized,
  onSwitch, onCloseTab, onMinimize, onCloseAll,
}: {
  tabs: Employee[];
  activeId: string;
  minimized: boolean;
  onSwitch: (id: string) => void;
  onCloseTab: (id: string) => void;
  onMinimize: () => void;
  onCloseAll: () => void;
}) {
  const [tabStates, setTabStates] = useState<Record<string, { tab: string; section: string }>>({});

  const getState = (id: string) => tabStates[id] ?? { tab: 'overview', section: 'overview' };
  const patchState = (id: string, patch: Partial<{ tab: string; section: string }>) =>
    setTabStates(prev => ({ ...prev, [id]: { ...(prev[id] ?? { tab: 'overview', section: 'overview' }), ...patch } }));

  const employee = tabs.find(e => e.id === activeId) ?? tabs[0];
  const { tab, section: sideSection } = getState(activeId);
  const patchActive = (patch: Partial<{ tab: string; section: string }>) => patchState(activeId, patch);
  const setTab = (t: string) => patchState(activeId, { tab: t });
  const setSideSection = (s: string) => patchState(activeId, { section: s });

  const initials = employee.name.slice(0, 2);

  return (
    <div
      className="hr-profile-scrim"
      onClick={(e) => { if (e.target === e.currentTarget && !minimized) onCloseAll(); }}
      style={minimized ? { alignItems: 'flex-end', paddingBottom: '1.5rem', background: 'transparent', pointerEvents: 'none' } : undefined}
    >
      <div className={`hr-profile-modal${minimized ? ' hr-profile-modal--minimized' : ''}`} style={minimized ? { pointerEvents: 'auto', maxWidth: '28rem' } : undefined}>
        {/* Title bar — multi-tab chips */}
        <div className="hr-profile-titlebar">
          <div className="hr-profile-titlebar__chips">
            {tabs.map((emp) => (
              <div
                key={emp.id}
                className={`hr-profile-tab-chip${emp.id === activeId ? ' hr-profile-tab-chip--active' : ''}`}
                onClick={() => onSwitch(emp.id)}
              >
                <span className="hr-profile-tab-chip__dot" />
                <span className="hr-profile-tab-chip__name">{emp.name} ({emp.code})</span>
                <button
                  type="button"
                  className="hr-profile-tab-chip__close"
                  onClick={(e) => { e.stopPropagation(); onCloseTab(emp.id); }}
                  aria-label="ปิด"
                >
                  <svg style={{ width: '0.9375rem', height: '0.9375rem' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.25} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          <div className="hr-profile-titlebar__actions">
            <button type="button" className="hr-profile-titlebar__btn" onClick={onMinimize} aria-label={minimized ? 'ขยาย' : 'ย่อ'}>
              {minimized ? (
                <svg style={{ width: '0.875rem', height: '0.875rem' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                </svg>
              ) : (
                <svg style={{ width: '0.875rem', height: '0.875rem' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3" />
                </svg>
              )}
            </button>
            <button type="button" className="hr-profile-titlebar__btn" onClick={onCloseAll} aria-label="ปิดทั้งหมด">
              <svg style={{ width: '0.875rem', height: '0.875rem' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Gradient hero header */}
        <div className="hr-profile-hero">
          <div className="hr-profile-hero__avatar">{initials}</div>
          <div className="hr-profile-hero__info">
            <div className="hr-profile-hero__name">{employee.name}</div>
            <div className="hr-profile-hero__position">{employee.position} · {employee.department}</div>
            <div className="hr-profile-hero__meta">
              <span className="hr-profile-hero__meta-item">
                <IconId style={{ width: '0.8125rem', height: '0.8125rem' }} />
                <span className="hr-profile-hero__meta-val">#{employee.code}</span>
              </span>
              <span className="hr-profile-hero__meta-item">
                <IconBuilding style={{ width: '0.8125rem', height: '0.8125rem' }} />
                <span className="hr-profile-hero__meta-val">{employee.branch}</span>
              </span>
              <span className="hr-profile-hero__meta-item">
                <IconCalendarCheck style={{ width: '0.8125rem', height: '0.8125rem' }} />
                <span className="hr-profile-hero__meta-val">เริ่มงาน {employee.startDate}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="hr-profile-tabs" role="tablist">
          {PROFILE_TABS.map((t) => {
            const tabActive = tab === t.key || t.children.some((c) => c.key === tab);
            return (
            <div key={t.key} className="hr-profile-tab-wrap">
              <button
                type="button"
                role="tab"
                aria-selected={tabActive}
                className={`hr-profile-tab${tabActive ? ' hr-profile-tab--active' : ''}`}
                onClick={() => { if (t.children.length === 0) setTab(t.key); }}
              >
                {t.label}
                {t.children.length > 0 && (
                  <svg className="hr-profile-tab-chevron" viewBox="0 0 12 12" fill="none">
                    <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
              {t.children.length > 0 && (
                <div className="hr-profile-tab-dropdown">
                  {t.children.map((c) => (
                    <button
                      key={c.key}
                      type="button"
                      className="hr-profile-tab-dropdown__item"
                      onClick={() => {
                        if (c.sectionKey) patchActive({ tab: 'overview', section: c.sectionKey });
                        else patchActive({ tab: c.key });
                      }}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            );
          })}
        </div>

        {/* Tab content */}
        {tab === 'overview' ? (
          <OverviewTab employee={employee} section={sideSection} onSection={setSideSection} />
        ) : tab === 'emp-shift' ? (
          <ShiftScheduleTab employee={employee} />
        ) : (
          <PlaceholderTab label={
            PROFILE_TABS.find((t) => t.key === tab)?.label
            ?? PROFILE_TABS.flatMap((t) => t.children).find((c) => c.key === tab)?.label
            ?? tab
          } />
        )}
      </div>
    </div>
  );
}

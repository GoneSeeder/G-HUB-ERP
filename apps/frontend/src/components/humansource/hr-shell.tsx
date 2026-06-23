'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { LogOutIcon, SearchIcon } from '@/components/ui/icons';
import { clearAuthTokenCookie, getAuthTokenFromCookie } from '@/lib/auth';
import { clearHrSessionSnapshot, getHrSessionSnapshot, setHrSessionSnapshot, type HrSession } from '@/lib/hr-auth';
import { queryOptions } from '@/lib/queries';
import { cn } from '@/lib/cn';
import {
  hrNavigation,
  hrSettingsGroups,
  type HrNavigationItem,
  type HrNavSection,
} from '@/data/humansource/navigation';

// ─── Sidebar nav data ─────────────────────────────────────────────────────────

type NavChild = { label: string; path: string };
type NavItem = {
  key: string;
  label: string;
  description?: string;
  path?: string;
  color: string;
  icon: (p: { className?: string; style?: React.CSSProperties }) => JSX.Element;
  children?: NavChild[];
  sections?: HrNavSection[];
};

function DashboardIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}
function OrgIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M3 21V7l9-4 9 4v14" /><path d="M9 21v-8h6v8" /><circle cx="9" cy="9" r=".5" fill="currentColor" /><circle cx="15" cy="9" r=".5" fill="currentColor" />
    </svg>
  );
}
function RecruitIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      <line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" />
    </svg>
  );
}
function PayrollIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /><line x1="6" y1="15" x2="10" y2="15" />
    </svg>
  );
}
function EvalIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
function ReportIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="13" y2="17" />
    </svg>
  );
}
function SettingsIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}
function HomeIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}
function TimeIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /><path d="M5 3 3 5" /><path d="m19 3 2 2" />
    </svg>
  );
}
function SelfServiceIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /><path d="m16.5 14.5 1.2 1.2 2.3-2.5" />
    </svg>
  );
}
function ChevronIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

const LEGACY_NAV: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', path: '/humansource/dashboard', color: '#6366f1', icon: DashboardIcon },
  {
    key: 'org', label: 'ข้อมูลองค์กร', color: '#0ea5e9', icon: OrgIcon,
    children: [
      { label: 'โครงสร้างองค์กร',   path: '/humansource/organization/structure' },
      { label: 'โครงสร้างตำแหน่ง', path: '/humansource/organization/position-structure' },
      { label: 'ประเภทพนักงาน',     path: '/humansource/organization/employee-type' },
      { label: 'กะการทำงาน',         path: '/humansource/organization/work-cycle' },
      { label: 'ข้อมูลพนักงาน',     path: '/humansource/organization/employees' },
      { label: 'ประกาศข่าวสาร',     path: '/humansource/organization/announcements' },
    ],
  },
  {
    key: 'recruit', label: 'สรรหาพนักงาน', color: '#8b5cf6', icon: RecruitIcon,
    children: [
      { label: 'ประกาศรับสมัครงาน', path: '/humansource/recruitment/job-posting' },
      { label: 'รายชื่อผู้สมัคร',   path: '/humansource/recruitment/applicants' },
      { label: 'สัมภาษณ์งาน',         path: '/humansource/recruitment/interview' },
    ],
  },
  {
    key: 'payroll', label: 'ประมวลผลเงินเดือน', color: '#10b981', icon: PayrollIcon,
    children: [
      { label: 'จัดการตารางเวลา',     path: '/humansource/payroll/time-management' },
      { label: 'จัดการโควตาการลา',   path: '/humansource/payroll/leave-quota' },
      { label: 'วันหยุดพิเศษ',         path: '/humansource/payroll/special-holidays' },
      { label: 'การคำนวณเงินเดือน', path: '/humansource/payroll/calculation' },
      { label: 'ปรับเงินเดือน',         path: '/humansource/payroll/salary-adjustment' },
    ],
  },
  {
    key: 'eval', label: 'การประเมินพนักงาน', color: '#f59e0b', icon: EvalIcon,
    children: [
      { label: 'รอบการประเมิน', path: '/humansource/performance/review-cycle' },
      { label: 'แบบประเมิน',     path: '/humansource/performance/forms' },
      { label: 'ตัวชี้วัด KPI',   path: '/humansource/performance/individual-kpi' },
      { label: 'ฝึกอบรม',         path: '/humansource/performance/training' },
    ],
  },
  {
    key: 'report', label: 'รายงาน', color: '#ef4444', icon: ReportIcon,
    children: [
      { label: 'ประวัติพนักงาน',     path: '/humansource/reports/employee-history' },
      { label: 'เวลาการทำงาน',         path: '/humansource/reports/work-time' },
      { label: 'การคำนวณเงินเดือน', path: '/humansource/reports/payroll-calculation' },
      { label: 'ภาษีและประกันสังคม', path: '/humansource/reports/tax' },
    ],
  },
  {
    key: 'settings', label: 'ตั้งค่า', color: '#64748b', icon: SettingsIcon,
    children: [
      { label: 'ตั้งค่าเริ่มต้น',   path: '/humansource/settings/initial' },
      { label: 'ตั้งค่าการคำนวณ', path: '/humansource/settings/calculation' },
      { label: 'ตั้งค่าผู้ใช้',     path: '/humansource/settings/users' },
    ],
  },
];

const NAV_ICONS: Record<HrNavigationItem['icon'], NavItem['icon']> = {
  home: HomeIcon,
  dashboard: DashboardIcon,
  organization: OrgIcon,
  time: TimeIcon,
  recruitment: RecruitIcon,
  payroll: PayrollIcon,
  performance: EvalIcon,
  'self-service': SelfServiceIcon,
  reports: ReportIcon,
  settings: SettingsIcon,
};

const NAV: NavItem[] = hrNavigation.map((item) => ({
  ...item,
  icon: NAV_ICONS[item.icon],
}));
const SETTINGS_PATHS = hrSettingsGroups.flatMap((group) => group.items.map((item) => item.path));

void LEGACY_NAV;

const COLLAPSED_W = 52;
const EXPANDED_W = 220;
const SUBMENU_W = 292;
const GHUB_LINK_STORAGE_KEY = 'g-hub.hr.ghub-linked';

// ─── Shell ────────────────────────────────────────────────────────────────────

function BellIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function ProfileIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  );
}

function KeyIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="8" cy="15" r="4" /><path d="m11 12 8-8" /><path d="m16 7 2 2" /><path d="m14 9 2 2" />
    </svg>
  );
}

function SunIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z" />
    </svg>
  );
}

export function HrShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [hasGhubToken, setHasGhubToken] = useState(false);
  const [hrSession, setHrSession] = useState<HrSession | null>(null);
  const { data: me } = useQuery({ ...queryOptions.me, enabled: hasGhubToken });
  const [hovered, setHovered] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [submenuItem, setSubmenuItem] = useState<NavItem | null>(null);
  const [submenuClosing, setSubmenuClosing] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [hasGhubLink, setHasGhubLink] = useState(false);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const submenuTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const collapseAfterSubmenu = useRef(false);

  // Keep the primary sidebar open until the submenu exit animation has finished.
  const expanded = hovered || pinned || submenuItem !== null;

  const closeSubmenu = (collapseSidebar = false) => {
    setOpenKey(null);
    collapseAfterSubmenu.current = collapseSidebar;

    if (!submenuItem) {
      if (collapseSidebar) setHovered(false);
      return;
    }
    if (submenuClosing) return;

    if (submenuTimer.current) clearTimeout(submenuTimer.current);
    setSubmenuClosing(true);
    submenuTimer.current = setTimeout(() => {
      setSubmenuItem(null);
      setSubmenuClosing(false);
      submenuTimer.current = null;
      if (collapseAfterSubmenu.current) setHovered(false);
      collapseAfterSubmenu.current = false;
    }, 200);
  };

  const openSubmenu = (item: NavItem) => {
    if (submenuTimer.current) clearTimeout(submenuTimer.current);
    submenuTimer.current = null;
    collapseAfterSubmenu.current = false;
    setSubmenuItem(item);
    setSubmenuClosing(false);
    setOpenKey(item.key);
  };

  useEffect(() => {
    closeSubmenu(true);
    // closeSubmenu reads transient animation state; route/pin changes are the intended triggers.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, pinned]);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem('ghub-hr-theme');
    if (savedTheme === 'dark' || savedTheme === 'light') setTheme(savedTheme);
  }, []);

  useEffect(() => {
    const readSession = () => {
      const nextSession = getHrSessionSnapshot();
      setHrSession(nextSession);
      setHasGhubToken(Boolean(getAuthTokenFromCookie()));
      if (nextSession?.hasGhubLink) setHasGhubLink(true);
    };

    readSession();
    window.addEventListener('g-hub.hr.session-changed', readSession);
    return () => window.removeEventListener('g-hub.hr.session-changed', readSession);
  }, []);

  useEffect(() => {
    const readGhubLinkState = (value: string | null) => {
      setHasGhubLink(Boolean(hrSession?.hasGhubLink) || value === 'true' || value === '1' || value === 'linked');
    };

    readGhubLinkState(window.localStorage.getItem(GHUB_LINK_STORAGE_KEY));

    const onStorage = (event: StorageEvent) => {
      if (event.key === GHUB_LINK_STORAGE_KEY) readGhubLinkState(event.newValue);
    };

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [hrSession?.hasGhubLink]);

  useEffect(() => () => {
    if (submenuTimer.current) clearTimeout(submenuTimer.current);
  }, []);

  // close user menu on outside click
  useEffect(() => {
    if (!userOpen) return;
    const close = () => setUserOpen(false);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, [userOpen]);

  const onEnter = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    if (!hovered) hoverTimer.current = setTimeout(() => setHovered(true), 60);
  };
  const onLeave = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    // never collapse while a submenu is open — user needs to reach it
    if (pinned || submenuItem !== null) return;
    setHovered(false);
  };

  const dismissNavigation = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    closeSubmenu(true);
  };

  const togglePinned = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    const nextPinned = !pinned;
    setPinned(nextPinned);
    closeSubmenu(!nextPinned);
    if (nextPinned) setHovered(false);
  };

  const logout = () => {
    queryClient.clear();
    clearAuthTokenCookie();
    clearHrSessionSnapshot();
    router.push('/humansource/login');
    router.refresh();
  };

  const updateTheme = (nextTheme: 'light' | 'dark') => {
    setTheme(nextTheme);
    window.localStorage.setItem('ghub-hr-theme', nextTheme);
  };

  const updateGhubLinkMock = (nextLinked: boolean) => {
    setHasGhubLink(nextLinked);
    window.localStorage.setItem(GHUB_LINK_STORAGE_KEY, nextLinked ? 'true' : 'false');
    const currentSession = getHrSessionSnapshot();
    if (currentSession) {
      const nextSession = { ...currentSession, hasGhubLink: nextLinked };
      setHrSession(nextSession);
      setHrSessionSnapshot(nextSession);
    }
  };

  const isDevMode = process.env.NODE_ENV !== 'production';
  const showSubmenu = Boolean(submenuItem?.sections?.length);

  const userName = me?.name ?? me?.username ?? hrSession?.displayName ?? 'User';
  const userInitial = userName.slice(0, 1).toUpperCase();
  const userSub = me?.username ?? me?.sub ?? hrSession?.email ?? '';
  const ThemeIcon = theme === 'dark' ? MoonIcon : SunIcon;
  const settingsItem = NAV.find((item) => item.key === 'settings');
  const isHolidayCalendarPage = pathname.includes('/humansource/time/holiday-calendar');
  const visibleNav = NAV.filter((item) => !isHolidayCalendarPage || item.key !== 'dashboard');
  const settingsActive =
    pathname.startsWith('/humansource/settings') ||
    SETTINGS_PATHS.some((path) => pathname.startsWith(path));

  return (
    <div className={cn('hr-shell hr-page relative h-screen overflow-hidden', theme === 'dark' && 'hr-theme-dark')}>
      <aside
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        className="fixed left-0 top-0 z-30 flex h-full flex-col overflow-hidden border-r border-gray-200 bg-white"
        style={{
          width: EXPANDED_W,
          clipPath: expanded
            ? 'inset(0 0 0 0)'
            : `inset(0 ${EXPANDED_W - COLLAPSED_W}px 0 0)`,
          transition: 'clip-path 200ms cubic-bezier(0.22, 0.61, 0.36, 1)',
        }}
      >
        {/* Module mark */}
        <div className="relative flex h-[60px] items-center overflow-hidden border-b border-gray-100">
          <Image
            src="/hr-logo.png"
            alt=""
            aria-hidden="true"
            width={32}
            height={32}
            className="h-8 w-8 flex-shrink-0 rounded-xl object-cover shadow-[0_8px_18px_rgba(147,51,234,0.22)]"
            style={{
              marginLeft: (COLLAPSED_W - 28) / 2, // 12px — centers 28px button in 52px bar
            }}
          />
          {expanded && (
            <div
              className="ml-3 overflow-hidden whitespace-nowrap pr-10"
              style={{ animation: 'hrFadeUp 180ms ease-out' }}
            >
              <p className="text-[9px] font-bold uppercase leading-none tracking-[0.2em] text-gray-400">G-HUB</p>
              <p className="text-sm font-bold leading-tight text-gray-800">Humansource</p>
            </div>
          )}
          {expanded && (
            <button
              type="button"
              onClick={togglePinned}
              title={pinned ? 'ยกเลิกการล็อก Sidebar' : 'ล็อก Sidebar ไว้'}
              aria-label={pinned ? 'ยกเลิกการล็อก Sidebar' : 'ล็อก Sidebar ไว้'}
              aria-pressed={pinned}
              className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm transition-colors hover:border-indigo-300 hover:text-indigo-600"
            >
              <ChevronIcon className={cn('h-3.5 w-3.5 transition-transform duration-200', pinned && 'rotate-180')} />
            </button>
          )}
        </div>

        {/* Nav items */}
        <div className="hr-nav-scroll flex-1 space-y-0.5 overflow-y-auto overflow-x-hidden py-3">
          {visibleNav.filter((item) => item.key !== 'settings').map((item) => {
            const Icon = item.icon;
            const activeByPath = item.path
              ? pathname === item.path || (item.key === 'home' && pathname === '/humansource')
              : Boolean(item.sections?.some((section) =>
                  section.items.some((child) => pathname.startsWith(child.path))));
            const isOpen = openKey === item.key;
            const active = activeByPath || isOpen;

            return (
              <div key={item.key}>
                <button
                  type="button"
                  onClick={() => {
                    if (item.path) {
                      router.push(item.path);
                      dismissNavigation();
                    } else {
                      if (isOpen) {
                        setHovered(true);
                        closeSubmenu(false);
                      }
                      else openSubmenu(item);
                    }
                  }}
                  title={expanded ? undefined : item.label}
                  className={cn(
                    'group flex h-10 w-full items-center overflow-hidden text-sm font-medium',
                    expanded ? 'rounded-xl pr-3' : 'rounded-none',
                    active
                      ? expanded
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-indigo-700'
                      : 'text-gray-500 hover:text-gray-800',
                  )}
                  style={{ transition: 'background-color 150ms, color 150ms' }}
                >
                  <span
                    className="flex h-10 flex-shrink-0 items-center justify-center"
                    style={{ width: COLLAPSED_W }}
                  >
                    <span
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-xl',
                        active ? 'bg-indigo-50' : 'group-hover:bg-gray-50',
                      )}
                      style={{ color: active ? item.color : undefined }}
                    >
                      <Icon style={{ width: 18, height: 18 }} />
                    </span>
                  </span>
                  <span
                    className="flex-1 overflow-hidden whitespace-nowrap text-left text-xs"
                    style={{
                      opacity: expanded ? 1 : 0,
                      width: expanded ? 'auto' : 0,
                      transition: 'opacity 150ms ease-out',
                    }}
                  >
                    {item.label}
                  </span>
                  {item.sections?.length && expanded && (
                    <ChevronIcon
                      className={cn('h-3 w-3 text-gray-400 transition-transform duration-200', isOpen && 'rotate-90')}
                    />
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer: settings and back to G-HUB */}
        <div className="flex-shrink-0 border-t border-gray-100">
          {settingsItem && (
            <button
              type="button"
              onClick={() => {
                router.push(settingsItem.path!);
                dismissNavigation();
              }}
              title={expanded ? undefined : settingsItem.label}
              className={cn(
                'group flex h-10 w-full items-center overflow-hidden text-xs font-medium',
                expanded ? 'rounded-xl pr-3' : 'rounded-none',
                settingsActive ? 'text-indigo-700' : 'text-gray-500 hover:text-gray-800',
              )}
            >
              <span
                className="flex h-10 flex-shrink-0 items-center justify-center"
                style={{ width: COLLAPSED_W }}
              >
                <span
                  className={cn(
                    'flex h-9 w-10 items-center justify-center rounded-xl',
                    settingsActive ? 'bg-indigo-50' : 'group-hover:bg-gray-50',
                  )}
                  style={{ color: settingsActive ? settingsItem.color : undefined }}
                >
                  <SettingsIcon style={{ width: 16, height: 16 }} />
                </span>
              </span>
              <span
                className="overflow-hidden whitespace-nowrap"
                style={{
                  opacity: expanded ? 1 : 0,
                  width: expanded ? 'auto' : 0,
                  transition: 'opacity 150ms ease-out',
                }}
              >
                {settingsItem.label}
              </span>
            </button>
          )}
          {hasGhubLink && (
            <Link
              href="/hub"
              title={expanded ? undefined : 'กลับ G-HUB'}
              className={cn(
                'group flex h-10 w-full items-center overflow-hidden text-xs text-gray-400 hover:text-gray-700',
                expanded && 'rounded-xl pr-3 hover:bg-gray-50',
              )}
              style={{ transition: 'background-color 150ms, color 150ms' }}
            >
              <span
                className="flex h-10 flex-shrink-0 items-center justify-center"
                style={{ width: COLLAPSED_W }}
              >
                <span className="flex h-9 w-10 items-center justify-center rounded-xl group-hover:bg-gray-50">
                  <HomeIcon style={{ width: 14, height: 14, flexShrink: 0 }} />
                </span>
              </span>
              <span
                className="overflow-hidden whitespace-nowrap"
                style={{
                  opacity: expanded ? 1 : 0,
                  width: expanded ? 'auto' : 0,
                  transition: 'opacity 150ms ease-out',
                }}
              >
                กลับ G-HUB
              </span>
            </Link>
          )}
        </div>
      </aside>

      {/* Submenu drawer */}
      {showSubmenu && submenuItem && (
        <div
          onMouseEnter={onEnter}
          onMouseLeave={onLeave}
          className="fixed top-0 z-20 flex h-full flex-col border-r border-gray-200 bg-white"
          style={{
            left: EXPANDED_W,
            width: SUBMENU_W,
            boxShadow: '4px 0 24px rgba(0,0,0,0.07)',
            animation: submenuClosing
              ? 'hrSlideOut 200ms cubic-bezier(0.4, 0, 1, 1) forwards'
              : 'hrSlideIn 160ms cubic-bezier(0.22, 0.61, 0.36, 1)',
          }}
        >
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4">
            <div className="flex items-center gap-2">
              <span style={{ color: submenuItem.color }}>
                <submenuItem.icon style={{ width: 16, height: 16 }} />
              </span>
              <p className="text-sm font-semibold text-gray-700">{submenuItem.label}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setHovered(true);
                closeSubmenu(false);
              }}
              className="flex h-6 w-6 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              aria-label="ปิด"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          </div>
          <div className="hr-nav-scroll flex-1 overflow-y-auto px-3 py-3">
            {submenuItem.sections!.map((section, sectionIndex) => (
              <section
                key={section.label}
                className={cn(sectionIndex > 0 && 'mt-5 border-t border-gray-100 pt-4')}
              >
                <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-gray-400">
                  {section.label}
                </p>
                <div className="space-y-0.5">
                  {section.items.map((child) => {
                    const active = pathname === child.path;
                    return (
                      <Link
                        key={child.path}
                        href={child.path}
                        onClick={dismissNavigation}
                        className={cn(
                          'group flex w-full items-start gap-2 rounded-lg px-2 py-2 text-left transition-colors duration-150',
                          active ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                        )}
                      >
                        <span
                          className={cn(
                            'mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full',
                            active ? 'bg-indigo-500' : 'bg-gray-300 group-hover:bg-gray-400',
                          )}
                        />
                        <span className="min-w-0">
                          <span className="block text-xs font-semibold leading-5">{child.label}</span>
                          <span className="mt-0.5 block text-[10px] font-normal leading-4 text-gray-400">
                            {child.description}
                          </span>
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </div>
      )}

      {/* Backdrop when submenu open (click to close) */}
      {showSubmenu && !submenuClosing && (
        <button
          type="button"
          aria-label="ปิดเมนูย่อย"
          onClick={dismissNavigation}
          className="fixed inset-0 z-10 cursor-default bg-transparent"
          style={{ left: EXPANDED_W + SUBMENU_W }}
        />
      )}

      {/* Main — fixed left margin so resize of sidebar doesn't reflow content */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 bg-gray-50"
        style={{ left: COLLAPSED_W }}
      >
        <div className="h-14 border-b border-gray-200 bg-white" />
      </div>

      <div
        className="absolute inset-y-0 right-0 flex min-w-0 flex-col overflow-hidden transition-[left] duration-200 ease-[cubic-bezier(0.22,0.61,0.36,1)] motion-reduce:transition-none"
        style={{
          left: pinned ? EXPANDED_W : COLLAPSED_W,
          willChange: 'left',
        }}
      >
        <header className="z-10 flex h-14 flex-shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6">
          <div className="flex w-64 items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
            <SearchIcon className="h-4 w-4 text-gray-400" />
            <input
              placeholder="ค้นหา..."
              className="flex-1 bg-transparent text-xs text-gray-700 outline-none placeholder:text-gray-400"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Bell */}
            <button
              type="button"
              className="relative flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
              aria-label="การแจ้งเตือน"
            >
              <BellIcon className="h-4 w-4" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
            </button>

            {/* User menu */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => setUserOpen((v) => !v)}
                className="flex h-9 items-center gap-2 rounded-xl px-1.5 pr-3 transition hover:bg-gray-100"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-xs font-bold text-white">
                  {userInitial}
                </div>
                <div className="hidden text-left sm:block">
                  <p className="text-xs font-semibold leading-tight text-gray-800">{userName}</p>
                  <p className="text-[10px] leading-tight text-gray-400">{me?.roles?.[0] ?? 'Employee'}</p>
                </div>
                <ChevronIcon className={cn('h-3 w-3 text-gray-400 transition-transform duration-150', userOpen && 'rotate-90')} />
              </button>

              {userOpen && (
                <div className="absolute right-0 top-11 z-50 w-64 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-[0_18px_48px_rgba(15,23,42,0.18)] animate-[hrFadeUp_140ms_ease-out]">
                  <div className="border-b border-gray-100 px-4 py-3">
                    <p className="text-sm font-semibold text-gray-800">{userName}</p>
                    <p className="mt-0.5 truncate text-[11px] text-gray-400">{userSub}</p>
                  </div>
                  <div className="py-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setUserOpen(false);
                        router.push('/humansource/self-service/profile');
                      }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-xs font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-700"
                    >
                      <ProfileIcon className="h-4 w-4 text-indigo-500" />
                      โปรไฟล์
                    </button>

                    <div className="flex items-center gap-3 px-4 py-2">
                      <ThemeIcon className="h-4 w-4 flex-shrink-0 text-indigo-500" />
                      <span className="flex-1 text-xs font-medium text-gray-700">ธีม</span>
                      <div className="flex rounded-lg bg-gray-100 p-0.5">
                        <button
                          type="button"
                          onClick={() => updateTheme('light')}
                          title="ธีมสว่าง"
                          aria-label="ใช้ธีมสว่าง"
                          aria-pressed={theme === 'light'}
                          className={cn(
                            'flex h-7 w-7 items-center justify-center rounded-md transition',
                            theme === 'light' ? 'bg-white text-amber-500 shadow-sm' : 'text-gray-400 hover:text-gray-700',
                          )}
                        >
                          <SunIcon className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => updateTheme('dark')}
                          title="ธีมมืด"
                          aria-label="ใช้ธีมมืด"
                          aria-pressed={theme === 'dark'}
                          className={cn(
                            'flex h-7 w-7 items-center justify-center rounded-md transition',
                            theme === 'dark' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-400 hover:text-gray-700',
                          )}
                        >
                          <MoonIcon className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {isDevMode && (
                      <button
                        type="button"
                        onClick={() => updateGhubLinkMock(!hasGhubLink)}
                        aria-pressed={hasGhubLink}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-xs font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-700"
                      >
                        <HomeIcon className="h-4 w-4 text-indigo-500" />
                        <span className="flex-1">Dev: G-HUB link</span>
                        <span
                          className={cn(
                            'relative h-5 w-9 rounded-full p-0.5 transition-colors',
                            hasGhubLink ? 'bg-indigo-600' : 'bg-gray-200',
                          )}
                        >
                          <span
                            className={cn(
                              'block h-4 w-4 rounded-full bg-white shadow-sm transition-transform',
                              hasGhubLink && 'translate-x-4',
                            )}
                          />
                        </span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setUserOpen(false);
                        router.push('/humansource/self-service/change-password');
                      }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-xs font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-700"
                    >
                      <KeyIcon className="h-4 w-4 text-indigo-500" />
                      เปลี่ยนรหัสผ่าน
                    </button>
                  </div>
                  <div className="border-t border-gray-100 py-1.5">
                  <button
                    type="button"
                    onClick={logout}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-xs font-medium text-rose-600 hover:bg-rose-50"
                  >
                    <LogOutIcon className="h-4 w-4" />
                    ออกจากระบบ
                  </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="hr-custom-scrollbar min-h-0 flex-1 overflow-auto [scrollbar-gutter:stable]">{children}</main>
      </div>
    </div>
  );
}

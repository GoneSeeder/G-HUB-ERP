'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { LogOutIcon, SearchIcon } from '@/components/ui/icons';
import { clearAuthTokenCookie } from '@/lib/auth';
import { queryOptions } from '@/lib/queries';
import { cn } from '@/lib/cn';

// ─── Sidebar nav data ─────────────────────────────────────────────────────────

type NavChild = { label: string; path: string };
type NavItem = {
  key: string;
  label: string;
  path?: string;
  color: string;
  icon: (p: { className?: string; style?: React.CSSProperties }) => JSX.Element;
  children?: NavChild[];
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
function ChevronIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

const NAV: NavItem[] = [
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

const COLLAPSED_W = 52;
const EXPANDED_W = 220;
const SUBMENU_W = 208;

// ─── Shell ────────────────────────────────────────────────────────────────────

function BellIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

export function HrShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: me } = useQuery(queryOptions.me);
  const [hovered, setHovered] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [submenuItem, setSubmenuItem] = useState<NavItem | null>(null);
  const [submenuClosing, setSubmenuClosing] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
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
  }, [pathname, pinned]);

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
    router.push('/login');
    router.refresh();
  };

  const showSubmenu = Boolean(submenuItem?.children);

  const userName = me?.name ?? me?.username ?? 'User';
  const userInitial = userName.slice(0, 1).toUpperCase();
  const userSub = me?.username ?? me?.sub ?? '';

  return (
    <div className="relative h-screen overflow-hidden bg-gray-50">
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
          <div
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-white shadow-[0_4px_12px_rgba(99,102,241,0.3)]"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              marginLeft: (COLLAPSED_W - 28) / 2, // 12px — centers 28px button in 52px bar
            }}
          >
            <span className="text-base font-light leading-none">+</span>
          </div>
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
          {NAV.map((item) => {
            const Icon = item.icon;
            const activeByPath = item.path
              ? pathname === item.path
              : Boolean(item.children?.some((c) => pathname.startsWith(c.path)));
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
                  {item.children && expanded && (
                    <ChevronIcon
                      className={cn('h-3 w-3 text-gray-400 transition-transform duration-200', isOpen && 'rotate-90')}
                    />
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer: back to G-HUB */}
        <div className="flex-shrink-0 border-t border-gray-100">
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
          <div className="flex-1 space-y-0.5 overflow-y-auto px-2 py-2">
            {submenuItem.children!.map((c) => {
              const active = pathname === c.path;
              return (
                <Link
                  key={c.path}
                  href={c.path}
                  onClick={dismissNavigation}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-medium transition-colors duration-150',
                    active ? 'bg-indigo-50 font-semibold text-indigo-700' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800',
                  )}
                >
                  {active && <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-500" />}
                  <span className={active ? '' : 'pl-3.5'}>{c.label}</span>
                </Link>
              );
            })}
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
                <div className="absolute right-0 top-11 z-50 w-56 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl animate-[hrFadeUp_140ms_ease-out]">
                  <div className="border-b border-gray-100 px-4 py-3">
                    <p className="text-sm font-semibold text-gray-800">{userName}</p>
                    <p className="mt-0.5 truncate text-[11px] text-gray-400">{userSub}</p>
                  </div>
                  <button
                    type="button"
                    onClick={logout}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-xs text-rose-600 hover:bg-rose-50"
                  >
                    <LogOutIcon className="h-3.5 w-3.5" />
                    ออกจากระบบ
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="min-h-0 flex-1 overflow-auto [scrollbar-gutter:stable]">{children}</main>
      </div>
    </div>
  );
}

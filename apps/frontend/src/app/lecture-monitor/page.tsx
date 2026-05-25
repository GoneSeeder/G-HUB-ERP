'use client';

import { ReactNode, useEffect, useMemo, useState } from 'react';
import { publicApiFetch } from '@/lib/api';

type MonitorStatus = 'RUNNING' | 'WAITING' | 'AVAILABLE' | 'MAINTENANCE';

type ApiRoom = {
  id: string;
  roomCode: string;
  roomName: string;
  capacity: number;
  status?: 'available' | 'inactive';
};

type ApiSession = {
  id: string;
  partyCode: string;
  roomId: string;
  room?: ApiRoom;
  roomCode: string;
  roomName: string;
  speaker?: {
    speakerName?: string;
  };
  speakerName: string;
  speaker2Name?: string;
  attendeeCount: number;
  status: 'arriving' | 'lecturing';
  startedAt: string | null;
  createdAt: string;
};

type MonitorRoom = {
  id: string;
  code: string;
  name: string;
  capacity: number;
  status: MonitorStatus;
  partyCode?: string;
  speaker?: string;
  attendeeCount: number;
  scheduledAt?: string;
  startedAt?: number;
};

const statusOrder: MonitorStatus[] = ['RUNNING', 'WAITING', 'AVAILABLE', 'MAINTENANCE'];
const filterOrder: Array<MonitorStatus | 'ALL'> = ['ALL', ...statusOrder];
const roomsPerPage = 12;

const statusMeta: Record<
  MonitorStatus,
  { label: string; shortLabel: string; dot: string; border: string; badge: string; glow: string; progress: string }
> = {
  RUNNING: {
    label: 'กำลังบรรยาย',
    shortLabel: 'กำลังบรรยาย',
    dot: 'bg-emerald-400',
    border: 'border-emerald-400/45',
    badge: 'border-emerald-300/35 bg-emerald-400/18 text-emerald-200',
    glow: 'shadow-[0_0_0_1px_rgba(52,211,153,0.35),0_0_24px_rgba(52,211,153,0.10)] hover:shadow-[0_0_0_1px_rgba(52,211,153,0.6),0_0_32px_rgba(52,211,153,0.18)]',
    progress: 'bg-emerald-400',
  },
  WAITING: {
    label: 'รอเริ่ม',
    shortLabel: 'รอเริ่ม',
    dot: 'bg-amber-400',
    border: 'border-amber-400/45',
    badge: 'border-amber-300/35 bg-amber-400/18 text-amber-200',
    glow: 'shadow-[0_0_0_1px_rgba(251,191,36,0.32)] hover:shadow-[0_0_0_1px_rgba(251,191,36,0.52),0_0_28px_rgba(251,191,36,0.12)]',
    progress: 'bg-amber-400',
  },
  AVAILABLE: {
    label: 'ว่าง',
    shortLabel: 'ว่าง',
    dot: 'bg-sky-400',
    border: 'border-slate-700/75',
    badge: 'border-sky-300/30 bg-sky-400/16 text-sky-200',
    glow: 'shadow-[0_0_0_1px_rgba(56,189,248,0.12)] hover:shadow-[0_0_0_1px_rgba(56,189,248,0.32)]',
    progress: 'bg-slate-700',
  },
  MAINTENANCE: {
    label: 'ปิดปรับปรุง',
    shortLabel: 'ปิดปรับปรุง',
    dot: 'bg-rose-400',
    border: 'border-rose-500/55',
    badge: 'border-rose-300/35 bg-rose-500/20 text-rose-200',
    glow: 'shadow-[0_0_0_1px_rgba(244,63,94,0.30)] hover:shadow-[0_0_0_1px_rgba(244,63,94,0.54),0_0_26px_rgba(244,63,94,0.12)]',
    progress: 'bg-rose-400',
  },
};

export default function LectureMonitorPage() {
  return <LectureMonitor />;
}

function LectureMonitor() {
  const [rooms, setRooms] = useState<MonitorRoom[]>([]);
  const [filter, setFilter] = useState<MonitorStatus | 'ALL'>('ALL');
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());
  const [lastUpdated, setLastUpdated] = useState(Date.now());
  const [page, setPage] = useState(0);
  const [error, setError] = useState('');

  const loadData = async () => {
    const [roomData, sessionData] = await Promise.all([
      publicApiFetch<unknown>('/api/public/lecture-rooms'),
      publicApiFetch<unknown>('/api/public/lecture-sessions'),
    ]);
    setRooms(sortMonitorRooms(mapMonitorRooms(toApiArray<ApiRoom>(roomData), toApiArray<ApiSession>(sessionData))));
    setLastUpdated(Date.now());
    setError('');
  };

  useEffect(() => {
    loadData().catch((err) => setError(err instanceof Error ? err.message : 'Unable to load lecture monitor'));
    const poll = window.setInterval(() => {
      loadData().catch(() => undefined);
    }, 2000);
    return () => window.clearInterval(poll);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const kpis = useMemo(() => calculateKpis(rooms), [rooms]);
  const filteredRooms = useMemo(
    () => (filter === 'ALL' ? rooms : rooms.filter((room) => room.status === filter)),
    [filter, rooms],
  );
  const totalPages = Math.max(1, Math.ceil(filteredRooms.length / roomsPerPage));
  const currentPage = Math.min(page, totalPages - 1);
  const pageRooms = filteredRooms.slice(currentPage * roomsPerPage, currentPage * roomsPerPage + roomsPerPage);
  const selectedRoom = rooms.find((room) => room.id === selectedRoomId) ?? null;

  useEffect(() => {
    setPage(0);
  }, [filter]);

  const toggleFullscreen = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }
    await document.documentElement.requestFullscreen();
  };

  return (
    <main className="h-screen select-none overflow-hidden bg-[#030713] font-[Kanit] text-slate-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(29,78,216,0.14),transparent_30%),radial-gradient(circle_at_88%_8%,rgba(99,102,241,0.12),transparent_24%),linear-gradient(180deg,#071022_0%,#020611_100%)]" />
      <div className="relative flex h-screen flex-col overflow-hidden">
        <MonitorHeader now={now} lastUpdated={lastUpdated} onRefresh={loadData} onFullscreen={toggleFullscreen} />
        <section className="mx-auto w-full max-w-[1720px] px-6 pb-1 pt-5">
          <div className="grid gap-4 xl:grid-cols-5">
            <KpiCard tone="emerald" icon={<ClockIcon />} value={kpis.running} label="กำลังบรรยาย" description="ห้องที่เริ่มบรรยายจริง" />
            <KpiCard tone="orange" icon={<DoorIcon />} value={kpis.waiting} label="รอเริ่ม" description="จัดห้องแล้วรอเริ่ม" />
            <KpiCard tone="indigo" icon={<PeopleIcon />} value={kpis.attendees} label="ผู้เข้าฟังรวม" description="เฉพาะรอบที่กำลังใช้งาน" />
            <KpiCard tone="purple" icon={<MonitorIcon />} value={kpis.total} label="ห้องทั้งหมด" description="ในระบบ" />
            <KpiCard tone="violet" icon={<RingProgress percent={kpis.usagePercent} />} value={`${kpis.usagePercent}%`} label="อัตราใช้งาน" description="กำลังบรรยาย + รอเริ่ม" />
          </div>
        </section>

        <section className="mx-auto flex w-full max-w-[1720px] items-center justify-between gap-4 px-6 py-4">
          <FilterTabs filter={filter} counts={kpis.counts} onChange={setFilter} />
          {error ? <span className="text-xs text-rose-300">{error}</span> : null}
        </section>

        <section className="mx-auto min-h-0 w-full max-w-[1720px] flex-1 overflow-hidden px-6 pb-20">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
            {pageRooms.map((room) => (
              <RoomCard key={room.id} room={room} now={now} onOpen={() => setSelectedRoomId(room.id)} />
            ))}
          </div>
        </section>

        <PaginationFooter
          page={currentPage}
          totalPages={totalPages}
          totalItems={filteredRooms.length}
          onPrev={() => setPage((value) => Math.max(0, value - 1))}
          onNext={() => setPage((value) => Math.min(totalPages - 1, value + 1))}
        />
      </div>
      {selectedRoom ? <RoomDetailModal room={selectedRoom} now={now} onClose={() => setSelectedRoomId(null)} /> : null}
    </main>
  );
}

function toApiArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === 'object' && Array.isArray((value as { items?: unknown }).items)) {
    return (value as { items: T[] }).items;
  }
  return [];
}

function mapMonitorRooms(rooms: ApiRoom[], sessions: ApiSession[]) {
  return rooms.map((room) => {
    const session = sessions.find((item) => item.roomId === room.id || item.room?.id === room.id);
    const status: MonitorStatus = session
      ? session.status === 'lecturing'
        ? 'RUNNING'
        : 'WAITING'
      : room.status === 'inactive'
        ? 'MAINTENANCE'
        : 'AVAILABLE';
    return {
      id: room.id,
      code: room.roomCode,
      name: room.roomName,
      capacity: room.capacity,
      status,
      partyCode: session?.partyCode,
      speaker: [session?.speakerName || session?.speaker?.speakerName, session?.speaker2Name].filter(Boolean).join(' / '),
      attendeeCount: session?.attendeeCount || 0,
      scheduledAt: session ? formatOptionalClockTime(session.createdAt) : undefined,
      startedAt: session?.startedAt ? validTimestamp(session.startedAt) : undefined,
    };
  });
}

function sortMonitorRooms(rooms: MonitorRoom[]) {
  const rank = (status: MonitorStatus) => statusOrder.indexOf(status);
  return [...rooms].sort((a, b) => {
    const statusDiff = rank(a.status) - rank(b.status);
    if (statusDiff !== 0) return statusDiff;
    return a.code.localeCompare(b.code, undefined, { numeric: true, sensitivity: 'base' });
  });
}

function MonitorHeader({
  now,
  lastUpdated,
  onRefresh,
  onFullscreen,
}: {
  now: number;
  lastUpdated: number;
  onRefresh: () => void;
  onFullscreen: () => void;
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-800/80 bg-[#07101f]/95 backdrop-blur-xl">
      <div className="mx-auto flex h-[104px] max-w-[1720px] items-center justify-between gap-6 px-6 py-4">
        <div className="flex shrink-0 items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-indigo-400/30 bg-indigo-500/15 text-indigo-200 shadow-[0_0_28px_rgba(79,70,229,0.34)]">
            <MonitorIcon />
          </div>
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.34em] text-slate-500">LIVE MONITOR</p>
            <p className="text-xl font-bold leading-tight text-white">ห้องบรรยาย Real-time</p>
          </div>
        </div>
        <LiveClock now={now} />
        <div className="flex shrink-0 items-center gap-3">
          <span className="flex items-center gap-2 text-xs text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
            อัปเดต {formatClockTime(lastUpdated)}
          </span>
          <button type="button" onClick={onRefresh} className="flex items-center gap-2 rounded-xl border border-slate-700 px-3.5 py-2 text-xs text-slate-300 transition hover:border-slate-500 hover:bg-slate-800">
            <RefreshIcon /> รีเฟรช
          </button>
          <button type="button" onClick={onFullscreen} className="flex items-center gap-2 rounded-xl border border-slate-700 px-3.5 py-2 text-xs text-slate-300 transition hover:border-slate-500 hover:bg-slate-800">
            <FullscreenIcon /> Fullscreen
          </button>
        </div>
      </div>
    </header>
  );
}

function LiveClock({ now }: { now: number }) {
  const parts = getBangkokParts(now);
  return (
    <div className="min-w-[390px] text-center">
      <div className="font-mono text-5xl font-bold leading-none tracking-[0.18em] text-white drop-shadow-[0_0_18px_rgba(255,255,255,0.12)]">
        {parts[0]} <span className="text-slate-500">:</span> {parts[1]} <span className="text-slate-500">:</span> {parts[2]}
      </div>
      <div className="mt-3 text-sm font-light text-slate-500">{formatThaiDate(now)}</div>
    </div>
  );
}

function KpiCard({
  tone,
  icon,
  value,
  label,
  description,
}: {
  tone: 'emerald' | 'orange' | 'indigo' | 'purple' | 'violet';
  icon: ReactNode;
  value: string | number;
  label: string;
  description: string;
}) {
  const toneClass = {
    emerald: 'border-emerald-500/20 bg-emerald-500/15 text-emerald-300',
    orange: 'border-orange-500/20 bg-orange-500/15 text-orange-300',
    indigo: 'border-indigo-500/20 bg-indigo-500/15 text-indigo-300',
    purple: 'border-purple-500/20 bg-purple-500/15 text-purple-300',
    violet: 'border-indigo-500/20 bg-indigo-500/15 text-indigo-300',
  }[tone];
  return (
    <div className="flex min-w-0 items-center gap-4 rounded-2xl border border-slate-700/70 bg-slate-900/72 p-5 backdrop-blur">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${toneClass}`}>{icon}</div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-4xl font-bold leading-none text-white">{value}</div>
        <p className="mt-2 truncate text-base font-semibold leading-tight text-white">{label}</p>
        <p className="mt-1 truncate text-xs font-light text-slate-500">{description}</p>
      </div>
    </div>
  );
}

function FilterTabs({
  filter,
  counts,
  onChange,
}: {
  filter: MonitorStatus | 'ALL';
  counts: Record<MonitorStatus, number>;
  onChange: (filter: MonitorStatus | 'ALL') => void;
}) {
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {filterOrder.map((item) => {
        const active = filter === item;
        const label = item === 'ALL' ? 'ทั้งหมด' : statusMeta[item].shortLabel;
        const count = item === 'ALL' ? total : counts[item];
        return (
          <button
            key={item}
            type="button"
            onClick={() => onChange(item)}
            className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-semibold transition-all ${
              active
                ? 'border-indigo-400/45 bg-indigo-500/20 text-indigo-200'
                : 'border-transparent text-slate-500 hover:border-slate-700 hover:text-slate-300'
            }`}
          >
            {label}
            <span className={`${active ? 'bg-indigo-500/30 text-indigo-100' : 'bg-slate-800 text-slate-500'} rounded-full px-1.5 py-0.5 text-[10px]`}>{count}</span>
          </button>
        );
      })}
    </div>
  );
}

function RoomCard({ room, now, onOpen }: { room: MonitorRoom; now: number; onOpen: () => void }) {
  const meta = statusMeta[room.status];
  const isActive = room.status === 'RUNNING' || room.status === 'WAITING';
  const usage = room.capacity > 0 ? Math.min(100, Math.round((room.attendeeCount / room.capacity) * 100)) : 0;
  const isMaintenance = room.status === 'MAINTENANCE';
  return (
    <article
      onClick={onOpen}
      className={`relative min-h-[188px] cursor-pointer overflow-hidden rounded-2xl border ${meta.border} bg-slate-950/58 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 ${meta.glow}`}
    >
      <div className={`absolute inset-x-0 top-0 h-0.5 ${isActive || isMaintenance ? meta.progress : 'bg-slate-800'}`} />
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="mb-1 font-mono text-[10px] leading-none text-slate-500">{room.code}</p>
            <h3 className="whitespace-pre-line text-[15px] font-bold leading-tight text-white">{room.name}</h3>
          </div>
          <StatusBadge status={room.status} />
        </div>
        {isActive ? (
          <div className="space-y-2.5">
            <div className="grid grid-cols-2 gap-x-3 gap-y-2">
              <DetailPair label="Party" value={room.partyCode || '-'} />
              <DetailPair label={room.status === 'RUNNING' ? 'เริ่ม' : 'กำหนด'} value={room.scheduledAt || '-'} />
              <DetailPair label="อาจารย์" value={room.speaker || '-'} />
              <DetailPair label="ระยะเวลา" value={elapsedText(room.startedAt, now)} accent={room.status === 'RUNNING' ? 'green' : 'orange'} />
            </div>
            <div className="space-y-1.5">
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
                <div className={`h-full rounded-full ${meta.progress}`} style={{ width: `${usage}%` }} />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500">
                <span className="flex items-center gap-1"><PeopleTinyIcon /> ผู้เข้าฟัง</span>
                <span className="font-medium text-slate-300">{room.attendeeCount} / {room.capacity} คน</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2.5 py-5">
            <div className={`flex h-14 w-14 items-center justify-center rounded-full border-2 border-dashed ${isMaintenance ? 'border-rose-400/25 text-rose-300' : 'border-slate-700 text-slate-600'}`}>
              {isMaintenance ? <GearIcon /> : <DoorIcon />}
            </div>
            <p className={`text-xs font-light ${isMaintenance ? 'text-rose-200/70' : 'text-slate-600'}`}>
              {isMaintenance ? 'ปิดปรับปรุง' : 'ไม่มีการบรรยาย'}
            </p>
          </div>
        )}
        <div className="flex items-center justify-between border-t border-slate-700/50 pt-2">
          <span className="text-[10px] text-slate-500">จุ {room.capacity} คน</span>
          <span className="flex items-center gap-1 text-[10px] text-slate-400">
            รายละเอียด <ChevronRightIcon />
          </span>
        </div>
      </div>
    </article>
  );
}

function StatusBadge({ status }: { status: MonitorStatus }) {
  const meta = statusMeta[status];
  return (
    <span className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-bold ${meta.badge}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot} ${status === 'RUNNING' ? 'animate-pulse' : ''}`} />
      {meta.shortLabel}
    </span>
  );
}

function PaginationFooter({
  page,
  totalPages,
  totalItems,
  onPrev,
  onNext,
}: {
  page: number;
  totalPages: number;
  totalItems: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <footer className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-800/80 bg-[#07101f]/95 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1720px] items-center justify-between px-6">
        <div className="flex items-center gap-5">
          <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-600">STATUS LEGEND</span>
          {statusOrder.map((status) => (
            <span key={status} className="flex items-center gap-2 text-xs text-slate-400">
              <span className={`h-2 w-2 rounded-full ${statusMeta[status].dot}`} />
              {statusMeta[status].label}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">{totalItems} ห้อง · หน้า {page + 1}/{totalPages}</span>
          <button type="button" onClick={onPrev} disabled={page === 0} className="flex items-center gap-2 rounded-xl border border-slate-700 px-3.5 py-2 text-xs text-slate-300 transition hover:border-slate-500 hover:bg-slate-800 disabled:cursor-default disabled:opacity-35 disabled:hover:bg-transparent">
            <ArrowLeftSmallIcon /> ย้อนกลับ
          </button>
          <button type="button" onClick={onNext} disabled={page >= totalPages - 1} className="flex items-center gap-2 rounded-xl border border-slate-700 px-3.5 py-2 text-xs text-slate-300 transition hover:border-slate-500 hover:bg-slate-800 disabled:cursor-default disabled:opacity-35 disabled:hover:bg-transparent">
            ถัดไป <ChevronRightIcon />
          </button>
        </div>
      </div>
    </footer>
  );
}

function RoomDetailModal({ room, now, onClose }: { room: MonitorRoom; now: number; onClose: () => void }) {
  const meta = statusMeta[room.status];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md" onClick={onClose}>
      <section
        className={`relative w-full max-w-[448px] overflow-hidden rounded-2xl border ${meta.border} bg-slate-900/95 p-6 shadow-2xl ${meta.glow}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={`absolute inset-x-0 top-0 h-1 ${meta.progress}`} />
        <button type="button" onClick={onClose} className="absolute right-6 top-7 flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-slate-300 transition hover:bg-slate-700 hover:text-white">
          <XIcon />
        </button>
        <p className="font-mono text-xs text-slate-500">{room.code}</p>
        <h2 className="mt-1 pr-10 text-2xl font-bold text-white">{room.name}</h2>
        <div className="mt-5">
          <StatusBadge status={room.status} />
        </div>
        <div className="mt-5 grid grid-cols-2 gap-x-8 gap-y-5 rounded-xl bg-slate-800/60 p-4">
          <DetailPair label="Party" value={room.partyCode || '-'} />
          <DetailPair label="อาจารย์" value={room.speaker || '-'} />
          <DetailPair label="ผู้เข้าฟัง" value={`${room.attendeeCount} / ${room.capacity} คน`} />
          <DetailPair label="ระยะเวลา" value={elapsedText(room.startedAt, now)} accent={room.status === 'WAITING' ? 'orange' : 'green'} />
        </div>
        <div className="mt-5 flex items-center justify-between border-t border-slate-700 pt-4">
          <span className="text-sm text-slate-500">ความจุห้อง</span>
          <span className="font-bold text-white">{room.capacity} คน</span>
        </div>
      </section>
    </div>
  );
}

function DetailPair({ label, value, accent }: { label: string; value: string; accent?: 'green' | 'orange' }) {
  const valueClass = (() => {
    if (accent === 'green') return 'font-mono text-sm font-bold text-emerald-300';
    if (accent === 'orange') return 'font-mono text-sm font-bold text-orange-300';
    if (label === 'Party') return 'font-mono text-xs font-bold text-slate-200';
    return 'text-xs font-normal text-slate-200';
  })();

  return (
    <div className="min-w-0">
      <p className="mb-0.5 text-[10px] leading-none text-slate-500">{label}</p>
      <p className={`truncate ${valueClass}`}>{value}</p>
    </div>
  );
}

function RingProgress({ percent }: { percent: number }) {
  return (
    <div className="relative flex h-12 w-12 items-center justify-center">
      <svg viewBox="0 0 44 44" className="h-12 w-12 -rotate-90">
        <circle cx="22" cy="22" r="17" className="fill-none stroke-indigo-950" strokeWidth="5" />
        <circle
          cx="22"
          cy="22"
          r="17"
          className="fill-none stroke-indigo-500"
          strokeWidth="5"
          strokeDasharray={`${2 * Math.PI * 17}`}
          strokeDashoffset={`${2 * Math.PI * 17 * (1 - percent / 100)}`}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-[9px] font-bold text-indigo-200">{percent}%</span>
    </div>
  );
}

function calculateKpis(rooms: MonitorRoom[]) {
  const counts = statusOrder.reduce(
    (acc, status) => ({ ...acc, [status]: rooms.filter((room) => room.status === status).length }),
    {} as Record<MonitorStatus, number>,
  );
  const active = counts.RUNNING + counts.WAITING;
  return {
    counts,
    active,
    running: counts.RUNNING,
    waiting: counts.WAITING,
    total: rooms.length,
    attendees: rooms.filter((room) => room.status === 'RUNNING' || room.status === 'WAITING').reduce((sum, room) => sum + room.attendeeCount, 0),
    usagePercent: rooms.length ? Math.round((active / rooms.length) * 100) : 0,
  };
}

function elapsedText(startedAt: number | undefined, now: number) {
  if (!startedAt) return '--:--';
  const seconds = Math.max(0, Math.floor((now - startedAt) / 1000));
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function formatClockTime(value: number) {
  return getBangkokParts(value).join(':');
}

function formatOptionalClockTime(value: string | null | undefined) {
  const timestamp = validTimestamp(value);
  return timestamp ? formatClockTime(timestamp) : '-';
}

function validTimestamp(value: string | null | undefined) {
  if (!value) return undefined;
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : undefined;
}

function formatThaiDate(value: number) {
  return new Intl.DateTimeFormat('th-TH-u-ca-buddhist', {
    timeZone: 'Asia/Bangkok',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value));
}

function getBangkokParts(value: number) {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Bangkok',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  return formatter.format(new Date(value)).split(':');
}

function SvgIcon({ children, className = 'h-5 w-5' }: { children: ReactNode; className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={`${className} fill-none stroke-current`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

function MonitorIcon() {
  return (
    <SvgIcon>
      <rect x="4" y="5" width="16" height="11" rx="2" />
      <path d="M8 21h8M12 16v5" />
    </SvgIcon>
  );
}

function ClockIcon() {
  return (
    <SvgIcon>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v5l3 2" />
    </SvgIcon>
  );
}

function DoorIcon() {
  return (
    <SvgIcon>
      <path d="M6 20V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v14" />
      <path d="M4 20h16M10 12h.01" />
    </SvgIcon>
  );
}

function GearIcon() {
  return (
    <SvgIcon>
      <path d="M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5Z" />
      <path d="M19.4 15a1.6 1.6 0 0 0 .32 1.76l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.6 1.6 0 0 0 15.12 19a1.6 1.6 0 0 0-.97 1.47V20.5a2 2 0 0 1-4 0v-.09A1.6 1.6 0 0 0 9.18 19a1.6 1.6 0 0 0-1.76.32l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.6 1.6 0 0 0 5 14.82a1.6 1.6 0 0 0-1.47-.97H3.5a2 2 0 0 1 0-4h.09A1.6 1.6 0 0 0 5 8.88a1.6 1.6 0 0 0-.32-1.76l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.6 1.6 0 0 0 9.18 5a1.6 1.6 0 0 0 .97-1.47V3.5a2 2 0 0 1 4 0v.09A1.6 1.6 0 0 0 15.12 5a1.6 1.6 0 0 0 1.76-.32l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.6 1.6 0 0 0 19 8.88a1.6 1.6 0 0 0 1.47.97h.03a2 2 0 0 1 0 4h-.09A1.6 1.6 0 0 0 19.4 15Z" />
    </SvgIcon>
  );
}

function PeopleIcon() {
  return (
    <SvgIcon>
      <path d="M16 21v-2a4 4 0 0 0-8 0v2" />
      <circle cx="12" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M2 21v-2a4 4 0 0 1 3-3.87" />
    </SvgIcon>
  );
}

function RefreshIcon() {
  return (
    <SvgIcon className="h-4 w-4">
      <path d="M20 11a8 8 0 0 0-14.9-4" />
      <path d="M4 5v5h5" />
      <path d="M4 13a8 8 0 0 0 14.9 4" />
      <path d="M20 19v-5h-5" />
    </SvgIcon>
  );
}

function FullscreenIcon() {
  return (
    <SvgIcon className="h-4 w-4">
      <path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M16 21h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
    </SvgIcon>
  );
}

function XIcon() {
  return (
    <SvgIcon className="h-4 w-4">
      <path d="M18 6 6 18M6 6l12 12" />
    </SvgIcon>
  );
}

function ChevronRightIcon() {
  return (
    <SvgIcon className="h-3.5 w-3.5">
      <path d="m9 18 6-6-6-6" />
    </SvgIcon>
  );
}

function ArrowLeftSmallIcon() {
  return (
    <SvgIcon className="h-3.5 w-3.5">
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </SvgIcon>
  );
}

function PeopleTinyIcon() {
  return (
    <SvgIcon className="h-3 w-3">
      <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </SvgIcon>
  );
}

'use client';

import { FormEvent, ReactNode, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { publicApiFetch } from '@/lib/api';

type LectureRoom = {
  id: string;
  roomCode: string;
  roomName: string;
  capacity: number;
};

type BonusCard = {
  bonus: string;
  partyCode: string;
  nation: string;
  tourLeaderName?: string;
};

type LectureSession = {
  id: string;
  partyCode: string;
  roomCode: string;
  roomName: string;
  speakerCode: string;
  speakerName: string;
  speaker2Code: string;
  speaker2Name: string;
  attendeeCount: number;
  status: 'arriving' | 'lecturing' | 'selling';
  startedAt: string | null;
  lectureEndedAt?: string | null;
  lectureDurationSeconds?: number;
  createdAt: string;
  bonusCard?: BonusCard | null;
};

type DisplayState = {
  room: LectureRoom;
  activeSession: LectureSession | null;
  serverTime: string;
};

type FlagInfo = { label: string; code: string; src: string };

const flagByNation: Record<string, FlagInfo> = {
  CN: { label: 'จีน', code: 'CN', src: '/lecture-flags/china.jpg' },
  CHINA: { label: 'จีน', code: 'CN', src: '/lecture-flags/china.jpg' },
  จีน: { label: 'จีน', code: 'CN', src: '/lecture-flags/china.jpg' },
  TW: { label: 'ไต้หวัน', code: 'TW', src: '/lecture-flags/taiwan.jpg' },
  TAIWAN: { label: 'ไต้หวัน', code: 'TW', src: '/lecture-flags/taiwan.jpg' },
  ไต้หวัน: { label: 'ไต้หวัน', code: 'TW', src: '/lecture-flags/taiwan.jpg' },
  VN: { label: 'เวียดนาม', code: 'VN', src: '/lecture-flags/vietnam.jpg' },
  VIETNAM: { label: 'เวียดนาม', code: 'VN', src: '/lecture-flags/vietnam.jpg' },
  เวียดนาม: { label: 'เวียดนาม', code: 'VN', src: '/lecture-flags/vietnam.jpg' },
};

function formatTimer(seconds: number) {
  const safe = Math.max(0, seconds);
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const secs = safe % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
}

function formatCurrentClock(value: number) {
  if (!value) return '--:--:--';
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'Asia/Bangkok',
  }).format(new Date(value));
}

function formatEventTime(value: string | null | undefined) {
  if (!value) return '-';
  return formatCurrentClock(new Date(value).getTime());
}

function elapsedFrom(value: string | null | undefined, now: number, offset = 0) {
  if (!value) return 0;
  return Math.floor((now + offset - new Date(value).getTime()) / 1000);
}

function lecturerNameList(session: LectureSession) {
  return [session.speakerName, session.speaker2Name].map((value) => value?.trim()).filter(Boolean);
}

function statusMeta(status: LectureSession['status'] | 'available') {
  if (status === 'lecturing') return { label: 'กำลังบรรยาย', className: 'border-red-400/50 bg-red-500/15 text-red-200', dot: 'bg-red-400' };
  if (status === 'selling') return { label: 'กำลังขายสินค้า', className: 'border-emerald-400/50 bg-emerald-500/15 text-emerald-200', dot: 'bg-emerald-400' };
  if (status === 'arriving') return { label: 'รอบรรยาย', className: 'border-amber-400/50 bg-amber-500/15 text-amber-200', dot: 'bg-amber-400' };
  return { label: 'ว่าง', className: 'border-slate-500/50 bg-slate-700/55 text-slate-200', dot: 'bg-slate-400' };
}

function IconBox({ children, tone = 'emerald' }: { children: ReactNode; tone?: 'emerald' | 'blue' | 'orange' | 'red' | 'slate' }) {
  const tones = {
    emerald: 'border-emerald-400/25 bg-emerald-500/10 text-emerald-300',
    blue: 'border-blue-400/25 bg-blue-500/10 text-blue-300',
    orange: 'border-orange-400/25 bg-orange-500/10 text-orange-300',
    red: 'border-red-400/25 bg-red-500/10 text-red-300',
    slate: 'border-slate-700 bg-slate-950/58 text-slate-500',
  };
  return <div className={`flex h-12 w-12 items-center justify-center rounded-xl border backdrop-blur-md ${tones[tone]}`}>{children}</div>;
}

export default function LectureRoomDisplayPage() {
  const params = useParams();
  const roomCode = String(params?.roomCode || '');
  const [data, setData] = useState<DisplayState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeOffset, setTimeOffset] = useState(0);
  const [now, setNow] = useState(0);
  const [busyAction, setBusyAction] = useState('');
  const [closeOpen, setCloseOpen] = useState(false);
  const [closeForm, setCloseForm] = useState({ cashierCode: '', salesAmount: '' });

  const loadState = async () => {
    try {
      const response = await publicApiFetch<DisplayState>(`/api/public/lecture-rooms/display/${roomCode}`);
      setData(response);
      setError('');
      setTimeOffset(new Date(response.serverTime).getTime() - Date.now());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ไม่สามารถโหลดข้อมูลห้องบรรยายได้');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!roomCode) return;
    void loadState();
    const interval = window.setInterval(loadState, 2000);
    return () => window.clearInterval(interval);
  }, [roomCode]);

  useEffect(() => {
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const session = data?.activeSession ?? null;
  const room = data?.room ?? null;
  const status = session?.status ?? 'available';
  const meta = statusMeta(status);
  const lectureSeconds = session
    ? session.status === 'lecturing'
      ? elapsedFrom(session.startedAt, now, timeOffset)
      : session.lectureDurationSeconds || elapsedFrom(session.startedAt, new Date(session.lectureEndedAt || session.startedAt || session.createdAt).getTime())
    : 0;
  const totalSeconds = session?.startedAt ? elapsedFrom(session.startedAt, now, timeOffset) : 0;
  const nationKey = String(session?.bonusCard?.nation || '').trim();
  const nation = flagByNation[nationKey.toUpperCase()] ?? flagByNation[nationKey] ?? null;

  const runAction = async (action: 'start' | 'end') => {
    if (!roomCode) return;
    setBusyAction(action);
    try {
      await publicApiFetch(`/api/public/lecture-rooms/display/${roomCode}/${action}`, { method: 'POST' });
      await loadState();
    } finally {
      setBusyAction('');
    }
  };

  const closeSale = async (event: FormEvent) => {
    event.preventDefault();
    setBusyAction('close');
    try {
      await publicApiFetch(`/api/public/lecture-rooms/display/${roomCode}/close-sale`, {
        method: 'POST',
        body: JSON.stringify({
          cashierCode: closeForm.cashierCode.trim(),
          salesAmount: Number(closeForm.salesAmount || 0),
        }),
      });
      setCloseOpen(false);
      setCloseForm({ cashierCode: '', salesAmount: '' });
      await loadState();
    } finally {
      setBusyAction('');
    }
  };

  if (loading) {
    return (
      <main className="flex h-screen w-screen items-center justify-center overflow-hidden bg-[#0b1323] text-slate-300">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-700 border-t-blue-500" />
      </main>
    );
  }

  if (error || !room) {
    return (
      <main className="flex h-screen w-screen items-center justify-center overflow-hidden bg-[#0b1323] p-6 text-slate-100">
        <section className="rounded-2xl border border-red-900/50 bg-red-950/20 p-6 text-center">
          <h1 className="text-xl font-semibold">เกิดข้อผิดพลาด</h1>
          <p className="mt-2 text-sm text-red-200">{error || 'ไม่พบข้อมูลห้องบรรยาย'}</p>
        </section>
      </main>
    );
  }

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-[#030713] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(29,78,216,0.14),transparent_30%),radial-gradient(circle_at_88%_8%,rgba(99,102,241,0.12),transparent_24%),linear-gradient(180deg,#071022_0%,#020611_100%)]" />
      <header className="relative z-10 flex h-[92px] items-center justify-between border-b border-slate-800/80 bg-[#07101f]/95 px-6 backdrop-blur-xl">
        <div className="flex min-w-0 items-center gap-4">
          <IconBox>
            <MicIcon />
          </IconBox>
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-blue-300">ROOM</span>
              <h1 className="text-2xl font-black tracking-tight">{room.roomCode}</h1>
              <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-bold ${meta.className}`}>
                <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
                {meta.label}
              </span>
            </div>
            <p className="mt-1 truncate text-sm text-slate-400">ห้อง {room.roomName}</p>
          </div>
        </div>
        <div className="rounded-xl bg-slate-900/70 px-5 py-3 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Capacity</p>
          <p className="text-xl font-black">{room.capacity} <span className="text-xs text-slate-400">PAX</span></p>
        </div>
        <div className="text-right">
          {session ? <LecturerLines names={lecturerNameList(session)} className="items-end" itemClassName="text-xs font-semibold text-slate-400" /> : null}
          <p className="font-mono text-4xl font-black tracking-[0.12em]">{formatCurrentClock(now)}</p>
        </div>
      </header>

      {session ? (
        <div className="relative z-10 mx-auto grid h-[calc(100vh-92px)] max-w-[1280px] grid-cols-[1fr_320px] gap-6 overflow-hidden px-6 py-6">
          <section className="min-w-0 space-y-6 overflow-hidden">
            <div className="grid grid-cols-2 gap-4">
              <TimerCard
                label="LECTURE TIME"
                subLabel="เวลาบรรยาย"
                value={formatTimer(lectureSeconds)}
                tone="orange"
                stateText={session.status === 'lecturing' ? 'กำลังจับเวลา' : session.lectureEndedAt ? `หยุดบรรยายเมื่อ ${formatEventTime(session.lectureEndedAt)}` : 'รอเริ่มบรรยาย'}
                active={session.status === 'lecturing'}
              />
              <TimerCard
                label="TOTAL SESSION"
                subLabel="เวลารวมทั้งหมด"
                value={formatTimer(totalSeconds)}
                tone="emerald"
                stateText={session.startedAt ? 'กำลังจับเวลา' : 'เริ่มเมื่อกดเริ่มบรรยาย'}
                active={Boolean(session.startedAt)}
              />
            </div>

            <div>
              <h2 className="mb-4 text-sm font-semibold text-slate-500">ข้อมูลห้องและทัวร์</h2>
              <div className="grid grid-cols-4 gap-3">
                <InfoCard label="Party Code" value={session.partyCode || '-'} accent />
                <InfoCard label="Guide" value={<LecturerLines names={lecturerNameList(session)} />} />
                <InfoCard label="People Pax" value={`${session.attendeeCount} คน`} subValue={`จาก ${room.capacity}`} />
                <InfoCard label="Remaining" value={String(Math.max(0, room.capacity - session.attendeeCount))} subValue="ที่นั่งว่าง" />
                <InfoCard label="Nation" value={nation?.label || nationKey || '-'} flag={nation} />
                <InfoCard label="Tour Leader" value={session.bonusCard?.tourLeaderName || '-'} />
                <InfoCard label="Cashier Status" value={session.status === 'selling' ? 'รอปิดการขาย' : 'ยังไม่ปิดการขาย'} warning />
                <InfoCard label="Sales Amount" value="฿0.00" />
              </div>
            </div>
          </section>

          <aside className="space-y-5 overflow-hidden">
            <div>
              <h2 className="mb-3 text-sm font-semibold text-slate-500">ควบคุมการใช้งาน</h2>
              <div className="space-y-2">
                {session.status === 'arriving' ? (
                  <ActionButton disabled={session.status !== 'arriving' || busyAction === 'start'} tone="slate" onClick={() => runAction('start')}>
                    <PlayIcon /> เริ่มบรรยาย <span>START LECTURE</span>
                  </ActionButton>
                ) : (
                  <ActionButton disabled={session.status !== 'lecturing' || busyAction === 'end'} tone="orange" onClick={() => runAction('end')}>
                    <PauseIcon /> หยุดบรรยาย <span>STOP LECTURE</span>
                  </ActionButton>
                )}
                <ActionButton disabled={session.status !== 'selling'} tone="red" onClick={() => setCloseOpen(true)}>
                  <LockIcon /> ปิดการขาย <span>CLOSE SESSION</span>
                </ActionButton>
              </div>
            </div>

            <div>
              <h2 className="mb-3 text-sm font-semibold text-slate-500">ไทม์ไลน์กิจกรรม</h2>
              <Timeline session={session} />
            </div>
          </aside>
        </div>
      ) : (
        <div className="relative z-10 flex h-[calc(100vh-92px)] items-center justify-center overflow-hidden">
          <div className="flex flex-col items-center text-center">
            <EmptyStateIcon />
            <h2 className="mt-6 text-3xl font-black">ห้องพร้อมใช้งาน</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">ยังไม่มีการลงทะเบียนทัวร์เข้าห้องนี้<br />กรุณาลงทะเบียนจากหน้า Control Center</p>
          </div>
        </div>
      )}

      {closeOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md">
          <form onSubmit={closeSale} className="w-full max-w-[448px] rounded-xl border border-slate-700/90 bg-slate-900/95 p-6 shadow-[0_28px_80px_rgba(0,0,0,0.45)]">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-500/18 text-red-300">
                  <LockIcon />
                </div>
                <div>
                  <h2 className="text-xl font-black leading-tight">ปิดการขาย</h2>
                  <p className="mt-1 text-sm font-medium text-slate-400">กรุณากรอกข้อมูลเพื่อปิดเซสชัน</p>
                </div>
              </div>
              <button type="button" onClick={() => setCloseOpen(false)} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-800 hover:text-white" aria-label="ปิด">
                <CloseIcon />
              </button>
            </div>

            <label className="mt-8 block text-sm font-bold text-slate-400">
              <span className="mb-2 flex items-center gap-2"><CashierIcon /> รหัส Cashier</span>
              <input
                required
                autoFocus
                placeholder="กรอกรหัส Cashier"
                value={closeForm.cashierCode}
                onChange={(event) => setCloseForm((prev) => ({ ...prev, cashierCode: event.target.value }))}
                className="h-10 w-full rounded-xl border border-emerald-400 bg-slate-950/80 px-3 text-sm font-semibold text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-400/15"
              />
            </label>

            <label className="mt-5 block text-sm font-bold text-slate-400">
              <span className="mb-2 flex items-center gap-2"><DollarIcon /> ยอดขายสินค้า (บาท)</span>
              <input
                required
                min="0"
                step="0.01"
                type="number"
                placeholder="0.00"
                value={closeForm.salesAmount}
                onChange={(event) => setCloseForm((prev) => ({ ...prev, salesAmount: event.target.value }))}
                className="h-10 w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 text-sm font-semibold text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-400/15"
              />
            </label>

            <div className="mt-8 flex justify-end gap-3">
              <button type="button" onClick={() => setCloseOpen(false)} className="h-9 rounded-xl border border-slate-600/90 px-5 text-sm font-black text-white transition hover:bg-slate-800">
                ยกเลิก
              </button>
              <button disabled={busyAction === 'close'} className="flex h-9 items-center gap-2 rounded-xl bg-red-600/80 px-5 text-sm font-black text-red-50 transition hover:bg-red-500 disabled:cursor-wait disabled:opacity-60">
                <LockIcon /> ยืนยันปิดการขาย
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </main>
  );
}

function TimerCard({
  label,
  subLabel,
  value,
  tone,
  active,
  stateText,
}: {
  label: string;
  subLabel: string;
  value: string;
  tone: 'orange' | 'emerald';
  active: boolean;
  stateText: string;
}) {
  const color = tone === 'orange' ? 'text-orange-400' : 'text-emerald-400';
  const pillColor = active ? 'bg-emerald-500/12 text-emerald-300' : tone === 'orange' ? 'bg-orange-500/12 text-slate-400' : 'bg-slate-800/70 text-slate-400';
  return (
    <div className="rounded-2xl border border-slate-700/70 bg-slate-950/58 p-7 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-md">
      <p className={`text-sm font-black ${color}`}>{label}</p>
      <p className="mt-1 text-xs text-slate-500">{subLabel}</p>
      <p className={`mt-5 font-mono text-6xl font-black tracking-tight ${color}`}>{value}</p>
      <p className={`mx-auto mt-3 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold ${pillColor}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-emerald-400' : tone === 'orange' ? 'bg-orange-400' : 'bg-slate-500'}`} />
        {stateText}
      </p>
    </div>
  );
}

function InfoCard({ label, value, subValue, accent, warning, flag }: { label: string; value: ReactNode; subValue?: string; accent?: boolean; warning?: boolean; flag?: FlagInfo | null }) {
  return (
    <div className="min-h-[84px] rounded-xl border border-slate-700/70 bg-slate-950/58 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-md">
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{label}</p>
      {flag ? (
        <div className="mt-2 flex items-center gap-3">
          <img src={flag.src} alt={flag.label} className="h-10 w-10 rounded-full object-cover shadow-[0_0_0_1px_rgba(255,255,255,0.08)]" />
          <p className="truncate text-base font-black text-white">{flag.code} {String(value)}</p>
        </div>
      ) : (
        <p className={`mt-2 truncate text-base font-black ${accent ? 'text-emerald-400' : warning ? 'text-yellow-300' : 'text-white'}`}>{value}</p>
      )}
      {subValue ? <p className="mt-1 text-xs text-slate-500">{subValue}</p> : null}
    </div>
  );
}

function LecturerLines({ names, className = '', itemClassName = 'text-base font-black text-white' }: { names: string[]; className?: string; itemClassName?: string }) {
  const displayNames = names.length ? names : ['-'];
  return (
    <div className={`mt-2 flex min-w-0 flex-col gap-1 ${className}`}>
      {displayNames.map((name) => (
        <p key={name} className={`max-w-full truncate ${itemClassName}`}>{name}</p>
      ))}
    </div>
  );
}

function ActionButton({ children, disabled, tone, onClick }: { children: ReactNode; disabled?: boolean; tone: 'slate' | 'orange' | 'blue' | 'red'; onClick: () => void }) {
  const tones = {
    slate: 'border border-slate-700 bg-slate-900/72 text-slate-300 hover:border-slate-500 hover:bg-slate-800',
    orange: 'border border-orange-500/20 bg-orange-500/90 text-white shadow-[0_0_24px_rgba(249,115,22,0.12)]',
    blue: 'border border-blue-500/20 bg-blue-600/90 text-white shadow-[0_0_24px_rgba(37,99,235,0.12)]',
    red: 'border border-red-500/20 bg-red-600/90 text-white shadow-[0_0_24px_rgba(220,38,38,0.12)]',
  };
  return <button type="button" disabled={disabled} onClick={onClick} className={`flex h-16 w-full items-center gap-3 rounded-xl px-4 text-left text-sm font-black transition disabled:cursor-default disabled:opacity-35 ${tones[tone]}`}>{children}</button>;
}

function Timeline({ session }: { session: LectureSession }) {
  const lectureStarted = Boolean(session.startedAt);
  const lectureStopped = Boolean(session.lectureEndedAt) || session.status === 'selling';
  const items = [
    { label: 'เริ่มห้อง', time: formatEventTime(session.createdAt), tone: 'emerald', done: true, icon: <PlayIcon /> },
    { label: 'เริ่มบรรยาย', time: formatEventTime(session.startedAt), tone: 'emerald', done: lectureStarted, icon: <PlayIcon /> },
    { label: 'หยุดบรรยาย', time: formatEventTime(session.lectureEndedAt), tone: 'orange', done: lectureStopped, icon: <PauseIcon /> },
    { label: 'เริ่มขายสินค้า', time: formatEventTime(session.lectureEndedAt), tone: 'blue', done: lectureStopped, icon: <CartIcon /> },
    { label: 'ปิดการขาย', time: '-', tone: 'red', done: false, icon: <LockIcon /> },
  ] as const;
  const dotClass = (tone: string) => {
    if (tone === 'orange') return 'bg-orange-400';
    if (tone === 'blue') return 'bg-blue-400';
    if (tone === 'red') return 'bg-rose-400';
    return 'bg-emerald-400';
  };
  const iconClass = (tone: string, done: boolean) => {
    if (!done) return 'bg-slate-800/60 text-slate-600';
    if (tone === 'orange') return 'bg-orange-500/18 text-orange-300';
    if (tone === 'blue') return 'bg-blue-500/18 text-blue-300';
    if (tone === 'red') return 'bg-rose-500/18 text-rose-300';
    return 'bg-emerald-500/18 text-emerald-300';
  };
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.label} className={`grid grid-cols-[12px_66px_30px_1fr] items-center gap-3 text-sm ${item.done ? 'text-white' : 'text-slate-600'}`}>
          <span className={`h-2 w-2 rounded-full ${item.done ? dotClass(item.tone) : 'bg-slate-700'}`} />
          <span className="font-mono text-xs text-slate-500">{item.done ? item.time : '-'}</span>
          <span className={`flex h-7 w-7 items-center justify-center rounded-full [&_svg]:h-3.5 [&_svg]:w-3.5 ${iconClass(item.tone, item.done)}`}>{item.icon}</span>
          <span className="font-bold">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

function SvgIcon({ children }: { children: ReactNode }) {
  return <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{children}</svg>;
}
function EmptyStateIcon() {
  return (
    <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-slate-700/70 bg-slate-950/58 text-slate-500 shadow-[0_16px_44px_rgba(0,0,0,0.18)] backdrop-blur-md">
      <svg viewBox="0 0 24 24" className="h-9 w-9 fill-none stroke-current" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4.5" y="5.5" width="15" height="11" rx="2" />
        <path d="M9 20h6M12 16.5V20M3 3l18 18" />
      </svg>
      <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border border-slate-950 bg-emerald-600 text-emerald-100">
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3Z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v2" />
        </svg>
      </span>
    </div>
  );
}
function MicIcon() { return <SvgIcon><path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3" /></SvgIcon>; }
function PlayIcon() { return <SvgIcon><path d="m8 5 11 7-11 7V5Z" /></SvgIcon>; }
function PauseIcon() { return <SvgIcon><path d="M10 4v16M14 4v16" /></SvgIcon>; }
function CartIcon() { return <SvgIcon><path d="M6 6h15l-2 8H8L6 6ZM6 6 5 3H2M9 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM18 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" /></SvgIcon>; }
function LockIcon() { return <SvgIcon><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></SvgIcon>; }
function CloseIcon() { return <SvgIcon><path d="M18 6 6 18M6 6l12 12" /></SvgIcon>; }
function CashierIcon() { return <SvgIcon><path d="M16 21v-2a4 4 0 0 0-8 0v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21v-2a4 4 0 0 1 2-3.46M20 21v-2a4 4 0 0 0-2-3.46" /></SvgIcon>; }
function DollarIcon() { return <SvgIcon><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6" /></SvgIcon>; }

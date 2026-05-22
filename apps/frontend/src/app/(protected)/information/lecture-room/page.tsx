'use client';

import Link from 'next/link';
import { FormEvent, ReactNode, useEffect, useMemo, useState } from 'react';
import {
  ArrowRightIcon,
  EditIcon,
  LinkIcon,
  PlusIcon,
  SearchIcon,
  TrashIcon,
  XIcon,
} from '@/components/ui/icons';
import { DataPanel, PageHeader, PageShell } from '@/components/ui/page-shell';
import { apiFetch } from '@/lib/api';

type RoomStatus = 'available' | 'arriving' | 'lecturing';
type SpeakerStatus = 'available' | 'lecturing' | 'inactive';
type TabKey = 'dashboard' | 'assignment' | 'rooms' | 'speakers' | 'history';

type LectureRoom = {
  id: string;
  roomCode: string;
  roomName: string;
  capacity: number;
  activeSession?: LectureSession | null;
};

type Speaker = {
  id: string;
  speakerCode: string;
  speakerName: string;
  status: SpeakerStatus;
};

type LectureSession = {
  id: string;
  partyCode: string;
  bonusCardId: string | null;
  roomId: string;
  roomCode: string;
  roomName: string;
  speakerId: string;
  speakerCode: string;
  speakerName: string;
  attendeeCount: number;
  status: 'arriving' | 'lecturing';
  startedAt: string | null;
  createdAt: string;
};

type LectureHistory = {
  id: string;
  partyCode: string;
  roomCode: string;
  roomName: string;
  speakerCode: string;
  speakerName: string;
  attendeeCount: number;
  startedAt: string;
  endedAt: string;
  durationSeconds: number;
  createdAt: string;
};

type BonusNarrator = {
  code?: string;
  name?: string;
};

type BonusCard = {
  id: string;
  bonus: number;
  workDate: string;
  partyCode: string;
  agentCode: string;
  agentName: string;
  adult: number;
  child: number;
  tourLeader: number;
  student: number;
  narrators: BonusNarrator[] | string;
};

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'assignment', label: 'จัดห้องพากย์' },
  { key: 'rooms', label: 'ห้องบรรยาย' },
  { key: 'speakers', label: 'อาจารย์พากย์' },
  { key: 'history', label: 'ประวัติ' },
];

const todayInput = () => new Date().toISOString().slice(0, 10);

function isoToDisplayDate(value: string) {
  if (!value) return '';
  const [year, month, day] = value.split('-');
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
}

function displayDateToIso(value: string) {
  const [day, month, year] = value.split('/').map((part) => part.trim());
  if (!day || !month || !year || year.length !== 4) return '';
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

function normalizeNarrators(value: BonusCard['narrators']): BonusNarrator[] {
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function formatDate(value: string | null | undefined) {
  if (!value) return '--/--/----';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--/--/----';
  return date.toLocaleDateString('en-GB');
}

function formatDuration(seconds: number) {
  const safe = Math.max(0, seconds);
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const secs = safe % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return hours > 0 ? `${pad(hours)}:${pad(minutes)}:${pad(secs)}` : `${pad(minutes)}:${pad(secs)}`;
}

function elapsed(startedAt: string | null, now: number) {
  if (!startedAt) return '00:00';
  return formatDuration(Math.floor((now - new Date(startedAt).getTime()) / 1000));
}

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

function StatusPill({ status }: { status: RoomStatus | SpeakerStatus }) {
  const meta: Record<string, { label: string; className: string }> = {
    available: {
      label: 'ว่าง',
      className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    },
    arriving: {
      label: 'กำลังเข้า',
      className: 'border-amber-200 bg-amber-50 text-amber-700',
    },
    lecturing: {
      label: 'กำลังบรรยาย',
      className: 'border-blue-200 bg-blue-50 text-blue-700',
    },
    inactive: {
      label: 'ปิดใช้งาน',
      className: 'border-slate-200 bg-slate-100 text-slate-500',
    },
  };
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium',
        meta[status].className,
      )}
    >
      {meta[status].label}
    </span>
  );
}

function IconButton({
  children,
  onClick,
  variant = 'secondary',
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex h-9 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors duration-200',
        variant === 'primary' && 'border-[#1167e8] bg-[#1167e8] text-white hover:bg-[#0f5fd6]',
        variant === 'secondary' && 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100',
        variant === 'danger' && 'border-red-200 bg-white text-red-600 hover:bg-red-50',
        disabled && 'cursor-default opacity-45 hover:bg-white',
      )}
    >
      {children}
    </button>
  );
}

function SearchField({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
}) {
  return (
    <label className={cn('relative block', className)}>
      <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm font-light text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-[#1167e8]"
      />
    </label>
  );
}

function MetricCard({
  label,
  value,
  tone = 'blue',
}: {
  label: string;
  value: ReactNode;
  tone?: 'blue' | 'emerald' | 'amber' | 'slate';
}) {
  const tones = {
    blue: 'bg-blue-50 text-blue-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    slate: 'bg-slate-100 text-slate-700',
  };
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className={cn('mb-3 inline-flex h-8 w-8 items-center justify-center rounded-lg', tones[tone])}>
        <span className="h-2 w-2 rounded-full bg-current" />
      </div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function ModalShell({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 p-4 backdrop-blur-sm">
      <div className="erp-modal-enter w-full max-w-2xl overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
          <IconButton onClick={onClose}>
            <XIcon className="h-4 w-4" />
            Close
          </IconButton>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function LectureRoomPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [now, setNow] = useState(Date.now());
  const [rooms, setRooms] = useState<LectureRoom[]>([]);
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [sessions, setSessions] = useState<LectureSession[]>([]);
  const [historyItems, setHistoryItems] = useState<LectureHistory[]>([]);
  const [bonusCards, setBonusCards] = useState<BonusCard[]>([]);
  const [assignmentDate, setAssignmentDate] = useState(todayInput());
  const [assignmentDateText, setAssignmentDateText] = useState(isoToDisplayDate(todayInput()));
  const [assignmentSearch, setAssignmentSearch] = useState('');
  const [roomSearch, setRoomSearch] = useState('');
  const [speakerSearch, setSpeakerSearch] = useState('');
  const [roomModal, setRoomModal] = useState<{ mode: 'add' | 'edit'; room?: LectureRoom } | null>(null);
  const [speakerModal, setSpeakerModal] = useState<{ mode: 'add' | 'edit'; speaker?: Speaker } | null>(null);
  const [assignModal, setAssignModal] = useState<{ card: BonusCard } | null>(null);
  const [roomForm, setRoomForm] = useState({ roomCode: '', roomName: '', capacity: 30 });
  const [speakerForm, setSpeakerForm] = useState({
    speakerCode: '',
    speakerName: '',
    status: 'available' as SpeakerStatus,
  });
  const [assignForm, setAssignForm] = useState({ roomId: '', speakerId: '' });
  const [error, setError] = useState('');

  const loadRooms = async () => setRooms(await apiFetch<LectureRoom[]>('/api/lecture-rooms'));
  const loadSpeakers = async () => setSpeakers(await apiFetch<Speaker[]>('/api/speakers'));
  const loadSessions = async () => setSessions(await apiFetch<LectureSession[]>('/api/lecture-sessions'));
  const loadHistory = async () => {
    const data = await apiFetch<{ items: LectureHistory[] }>('/api/lecture-sessions/history?limit=100');
    setHistoryItems(data.items || []);
  };
  const loadBonusCards = async (date = assignmentDate) => {
    const data = await apiFetch<BonusCard[]>(`/api/bonus-cards?workDate=${date}`);
    setBonusCards(data.filter((card) => normalizeNarrators(card.narrators).length > 0));
  };

  const refreshAll = async () => {
    await Promise.all([loadRooms(), loadSpeakers(), loadSessions(), loadHistory(), loadBonusCards()]);
  };

  useEffect(() => {
    refreshAll().catch((err) => setError(err instanceof Error ? err.message : 'Failed to load lecture room data'));
    const poll = window.setInterval(() => {
      Promise.all([loadRooms(), loadSpeakers(), loadSessions()]).catch(() => undefined);
    }, 5000);
    return () => window.clearInterval(poll);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    loadBonusCards(assignmentDate).catch(() => undefined);
  }, [assignmentDate]);

  const commitAssignmentDate = () => {
    const nextIsoDate = displayDateToIso(assignmentDateText);
    if (nextIsoDate) {
      setAssignmentDate(nextIsoDate);
      setAssignmentDateText(isoToDisplayDate(nextIsoDate));
    } else {
      setAssignmentDateText(isoToDisplayDate(assignmentDate));
    }
  };

  const activeRoomIds = useMemo(() => new Set(sessions.map((session) => session.roomId)), [sessions]);
  const activeSpeakerIds = useMemo(() => new Set(sessions.map((session) => session.speakerId)), [sessions]);

  const roomCards = useMemo(
    () =>
      rooms.map((room) => ({
        ...room,
        activeSession: sessions.find((session) => session.roomId === room.id) || null,
      })),
    [rooms, sessions],
  );

  const dashboardStats = useMemo(
    () => ({
      rooms: rooms.length,
      speakers: speakers.length,
      sessions: sessions.length,
      attendees: sessions.reduce((sum, session) => sum + session.attendeeCount, 0),
    }),
    [rooms, speakers, sessions],
  );

  const filteredBonusCards = useMemo(() => {
    const term = assignmentSearch.trim().toLowerCase();
    if (!term) return bonusCards;
    return bonusCards.filter((card) =>
      [card.bonus, card.partyCode, card.agentName, card.agentCode, normalizeNarrators(card.narrators)[0]?.name]
        .join(' ')
        .toLowerCase()
        .includes(term),
    );
  }, [bonusCards, assignmentSearch]);

  const filteredRooms = useMemo(() => {
    const term = roomSearch.trim().toLowerCase();
    if (!term) return rooms;
    return rooms.filter((room) => [room.roomCode, room.roomName].join(' ').toLowerCase().includes(term));
  }, [rooms, roomSearch]);

  const filteredSpeakers = useMemo(() => {
    const term = speakerSearch.trim().toLowerCase();
    if (!term) return speakers;
    return speakers.filter((speaker) =>
      [speaker.speakerCode, speaker.speakerName, speaker.status].join(' ').toLowerCase().includes(term),
    );
  }, [speakers, speakerSearch]);

  const openRoomAdd = () => {
    setRoomForm({ roomCode: '', roomName: '', capacity: 30 });
    setRoomModal({ mode: 'add' });
  };

  const openRoomEdit = (room: LectureRoom) => {
    setRoomForm({ roomCode: room.roomCode, roomName: room.roomName, capacity: room.capacity });
    setRoomModal({ mode: 'edit', room });
  };

  const openSpeakerAdd = () => {
    setSpeakerForm({ speakerCode: '', speakerName: '', status: 'available' });
    setSpeakerModal({ mode: 'add' });
  };

  const openSpeakerEdit = (speaker: Speaker) => {
    setSpeakerForm({
      speakerCode: speaker.speakerCode,
      speakerName: speaker.speakerName,
      status: speaker.status,
    });
    setSpeakerModal({ mode: 'edit', speaker });
  };

  const saveRoom = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    const body = JSON.stringify({
      roomCode: roomForm.roomCode.trim(),
      roomName: roomForm.roomName.trim(),
      capacity: Number(roomForm.capacity),
    });
    if (roomModal?.mode === 'edit' && roomModal.room) {
      await apiFetch(`/api/lecture-rooms/${roomModal.room.id}`, { method: 'PATCH', body });
    } else {
      await apiFetch('/api/lecture-rooms', { method: 'POST', body });
    }
    setRoomModal(null);
    await loadRooms();
  };

  const saveSpeaker = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    const body = JSON.stringify({
      speakerCode: speakerForm.speakerCode.trim(),
      speakerName: speakerForm.speakerName.trim(),
      status: speakerForm.status,
    });
    if (speakerModal?.mode === 'edit' && speakerModal.speaker) {
      await apiFetch(`/api/speakers/${speakerModal.speaker.id}`, { method: 'PATCH', body });
    } else {
      await apiFetch('/api/speakers', { method: 'POST', body });
    }
    setSpeakerModal(null);
    await loadSpeakers();
  };

  const removeRoom = async (room: LectureRoom) => {
    if (!window.confirm(`ลบห้อง ${room.roomName} (${room.roomCode}) หรือไม่?`)) return;
    await apiFetch(`/api/lecture-rooms/${room.id}`, { method: 'DELETE' });
    await loadRooms();
  };

  const removeSpeaker = async (speaker: Speaker) => {
    if (!window.confirm(`ลบอาจารย์พากย์ ${speaker.speakerName} (${speaker.speakerCode}) หรือไม่?`)) return;
    await apiFetch(`/api/speakers/${speaker.id}`, { method: 'DELETE' });
    await loadSpeakers();
  };

  const openAssign = (card: BonusCard) => {
    const narrator = normalizeNarrators(card.narrators)[0];
    const matchedSpeaker = narrator?.code
      ? speakers.find((speaker) => speaker.speakerCode.trim() === narrator.code?.trim())
      : null;
    setAssignForm({
      roomId: '',
      speakerId: matchedSpeaker?.id || '',
    });
    setAssignModal({ card });
  };

  const assignRoom = async (event: FormEvent) => {
    event.preventDefault();
    if (!assignModal) return;
    const card = assignModal.card;
    const narrator = normalizeNarrators(card.narrators)[0];
    const selectedSpeakerId =
      assignForm.speakerId ||
      (narrator?.code ? speakers.find((speaker) => speaker.speakerCode === narrator.code)?.id || '' : '');
    const body = JSON.stringify({
      roomId: assignForm.roomId,
      speakerId: selectedSpeakerId || 'NEW_AUTO_CREATE',
      bonusCardId: card.id,
      partyCode: card.partyCode,
      attendeeCount: card.adult + card.child + card.student + card.tourLeader,
    });
    await apiFetch('/api/lecture-sessions', { method: 'POST', body });
    setAssignModal(null);
    await Promise.all([loadRooms(), loadSessions(), loadSpeakers()]);
  };

  const clearSession = async (session: LectureSession) => {
    if (!window.confirm(`เคลียร์ session ห้อง ${session.roomName} หรือไม่?`)) return;
    await apiFetch(`/api/lecture-sessions/${session.id}`, { method: 'DELETE' });
    await Promise.all([loadRooms(), loadSessions(), loadSpeakers()]);
  };

  return (
    <PageShell className="max-w-[1240px] gap-4">
      <PageHeader
        eyebrow="Information · Lecture Room"
        title="ห้องบรรยาย"
        description="จัดการห้องบรรยาย อาจารย์พากย์ และตารางการฟังบรรยาย"
      />

      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'border-b-2 px-4 py-3 text-sm font-medium transition-colors duration-200',
              activeTab === tab.key
                ? 'border-[#1167e8] text-[#1167e8]'
                : 'border-transparent text-slate-500 hover:text-slate-900',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      {activeTab === 'dashboard' ? (
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-4">
            <MetricCard label="ห้องทั้งหมด" value={dashboardStats.rooms} tone="blue" />
            <MetricCard label="อาจารย์พากย์" value={dashboardStats.speakers} tone="emerald" />
            <MetricCard label="กำลังบรรยาย" value={dashboardStats.sessions} tone="amber" />
            <MetricCard label="คนเข้าฟังรวม" value={dashboardStats.attendees} tone="slate" />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-950">ห้องบรรยายทั้งหมด</h2>
              <p className="text-xs font-light text-slate-500">สถานะห้องและ session ปัจจุบัน</p>
            </div>
            <span className="text-sm font-light text-slate-500">{roomCards.length} rooms</span>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {roomCards.map((room) => {
              const session = room.activeSession;
              const status: RoomStatus = session ? session.status : 'available';
              return (
                <DataPanel key={room.id} className="group p-4 transition-colors duration-200 hover:border-[#1167e8]/40">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-lg font-semibold text-slate-950">{room.roomCode}</p>
                        <StatusPill status={status} />
                      </div>
                      <p className="mt-1 truncate text-sm font-light text-slate-500">{room.roomName}</p>
                    </div>
                    <Link
                      href={`/information/lecture-room/display/${room.roomCode}`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-950"
                      target="_blank"
                    >
                      <LinkIcon className="h-4 w-4" />
                    </Link>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs font-medium uppercase text-slate-400">Party Code</p>
                      <p className="mt-1 font-medium text-slate-900">{session?.partyCode || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase text-slate-400">Speaker</p>
                      <p className="mt-1 truncate font-medium text-slate-900">{session?.speakerName || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase text-slate-400">Attendees</p>
                      <p className="mt-1 font-medium text-slate-900">
                        {session?.attendeeCount || 0}/{room.capacity}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase text-slate-400">Timer</p>
                      <p className="mt-1 font-mono font-medium text-slate-900">
                        {session?.status === 'lecturing' ? elapsed(session.startedAt, now) : '--:--'}
                      </p>
                    </div>
                  </div>

                  {session ? (
                    <div className="mt-4 flex justify-end">
                      <IconButton variant="danger" onClick={() => clearSession(session)}>
                        <XIcon className="h-4 w-4" />
                        Clear
                      </IconButton>
                    </div>
                  ) : null}
                </DataPanel>
              );
            })}
          </div>
        </div>
      ) : null}

      {activeTab === 'assignment' ? (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
              วันที่
              <input
                value={assignmentDateText}
                onChange={(event) => setAssignmentDateText(event.target.value)}
                onBlur={commitAssignmentDate}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    commitAssignmentDate();
                  }
                }}
                placeholder="--/--/----"
                className="h-10 w-32 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#1167e8]"
              />
            </label>
            <SearchField
              className="min-w-[280px] flex-1"
              value={assignmentSearch}
              onChange={setAssignmentSearch}
              placeholder="Search bonus no., party code, agent, speaker..."
            />
            <span className="text-sm font-light text-slate-500">{filteredBonusCards.length} records</span>
          </div>

          <DataPanel>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Bonus No.</th>
                    <th className="px-4 py-3 font-medium">Party Code</th>
                    <th className="px-4 py-3 font-medium">Agent</th>
                    <th className="px-4 py-3 font-medium">วันที่</th>
                    <th className="px-4 py-3 font-medium">คน</th>
                    <th className="px-4 py-3 font-medium">หัวหน้าทัวร์</th>
                    <th className="px-4 py-3 font-medium">สถานะ</th>
                    <th className="px-4 py-3 text-right font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBonusCards.map((card) => {
                    const attendeeCount = card.adult + card.child + card.student + card.tourLeader;
                    const assigned = sessions.some((session) => session.bonusCardId === card.id);
                    return (
                      <tr key={card.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-950">{card.bonus}</td>
                        <td className="px-4 py-3 text-slate-700">{card.partyCode}</td>
                        <td className="px-4 py-3 text-slate-700">{card.agentName || card.agentCode || '-'}</td>
                        <td className="px-4 py-3 text-slate-700">{formatDate(card.workDate)}</td>
                        <td className="px-4 py-3 text-slate-700">{attendeeCount}</td>
                        <td className="px-4 py-3 text-slate-700">{card.tourLeader}</td>
                        <td className="px-4 py-3">
                          <StatusPill status={assigned ? 'arriving' : 'available'} />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <IconButton disabled={assigned} onClick={() => openAssign(card)}>
                            เลือกห้อง
                            <ArrowRightIcon className="h-4 w-4" />
                          </IconButton>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </DataPanel>
        </div>
      ) : null}

      {activeTab === 'rooms' ? (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <SearchField
              className="min-w-[280px] flex-1"
              value={roomSearch}
              onChange={setRoomSearch}
              placeholder="Search room code, room name..."
            />
            <span className="text-sm font-light text-slate-500">{filteredRooms.length} records</span>
            <IconButton variant="primary" onClick={openRoomAdd}>
              <PlusIcon className="h-4 w-4" />
              เพิ่มห้อง
            </IconButton>
          </div>

          <DataPanel>
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">รหัสห้อง</th>
                  <th className="px-4 py-3 font-medium">ชื่อห้อง</th>
                  <th className="px-4 py-3 font-medium">จุ (คน)</th>
                  <th className="px-4 py-3 font-medium">สถานะ</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRooms.map((room) => (
                  <tr key={room.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-950">{room.roomCode}</td>
                    <td className="px-4 py-3 text-slate-700">{room.roomName}</td>
                    <td className="px-4 py-3 text-slate-700">{room.capacity}</td>
                    <td className="px-4 py-3">
                      <StatusPill status={activeRoomIds.has(room.id) ? 'arriving' : 'available'} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <IconButton onClick={() => openRoomEdit(room)}>
                          <EditIcon className="h-4 w-4" />
                          Edit
                        </IconButton>
                        <IconButton variant="danger" onClick={() => removeRoom(room)}>
                          <TrashIcon className="h-4 w-4" />
                          Delete
                        </IconButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </DataPanel>
        </div>
      ) : null}

      {activeTab === 'speakers' ? (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <SearchField
              className="min-w-[280px] flex-1"
              value={speakerSearch}
              onChange={setSpeakerSearch}
              placeholder="Search speaker code, name..."
            />
            <span className="text-sm font-light text-slate-500">{filteredSpeakers.length} records</span>
            <IconButton variant="primary" onClick={openSpeakerAdd}>
              <PlusIcon className="h-4 w-4" />
              เพิ่มอาจารย์
            </IconButton>
          </div>

          <DataPanel>
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">รหัสอาจารย์</th>
                  <th className="px-4 py-3 font-medium">ชื่ออาจารย์</th>
                  <th className="px-4 py-3 font-medium">สถานะการทำงาน</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSpeakers.map((speaker) => (
                  <tr key={speaker.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-950">{speaker.speakerCode}</td>
                    <td className="px-4 py-3 text-slate-700">{speaker.speakerName}</td>
                    <td className="px-4 py-3">
                      <StatusPill status={speaker.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <IconButton onClick={() => openSpeakerEdit(speaker)}>
                          <EditIcon className="h-4 w-4" />
                          Edit
                        </IconButton>
                        <IconButton variant="danger" onClick={() => removeSpeaker(speaker)}>
                          <TrashIcon className="h-4 w-4" />
                          Delete
                        </IconButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </DataPanel>
        </div>
      ) : null}

      {activeTab === 'history' ? (
        <DataPanel>
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <div>
              <h2 className="text-base font-semibold text-slate-950">ประวัติการบรรยาย</h2>
              <p className="text-xs font-light text-slate-500">{historyItems.length} records</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Party Code</th>
                  <th className="px-4 py-3 font-medium">ห้อง</th>
                  <th className="px-4 py-3 font-medium">อาจารย์</th>
                  <th className="px-4 py-3 font-medium">เริ่ม</th>
                  <th className="px-4 py-3 font-medium">สิ้นสุด</th>
                  <th className="px-4 py-3 font-medium">ระยะเวลา</th>
                  <th className="px-4 py-3 font-medium">คนเข้าฟัง</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {historyItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-950">{item.partyCode}</td>
                    <td className="px-4 py-3 text-slate-700">
                      {item.roomCode} · {item.roomName}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{item.speakerName}</td>
                    <td className="px-4 py-3 text-slate-700">{formatDate(item.startedAt)}</td>
                    <td className="px-4 py-3 text-slate-700">{formatDate(item.endedAt)}</td>
                    <td className="px-4 py-3 font-mono text-slate-700">{formatDuration(item.durationSeconds)}</td>
                    <td className="px-4 py-3 text-slate-700">{item.attendeeCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DataPanel>
      ) : null}

      {roomModal ? (
        <ModalShell title={roomModal.mode === 'add' ? 'เพิ่มห้องบรรยาย' : 'แก้ไขห้องบรรยาย'} onClose={() => setRoomModal(null)}>
          <form onSubmit={saveRoom}>
            <div className="grid gap-4 p-5 md:grid-cols-3">
              <label className="grid gap-1 text-sm font-medium text-slate-700">
                รหัสห้อง
                <input
                  value={roomForm.roomCode}
                  onChange={(event) => setRoomForm((prev) => ({ ...prev, roomCode: event.target.value.toUpperCase() }))}
                  disabled={roomModal.mode === 'edit'}
                  className="h-10 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-[#1167e8] disabled:bg-slate-100 disabled:text-slate-500"
                  required
                />
              </label>
              <label className="grid gap-1 text-sm font-medium text-slate-700 md:col-span-1">
                ชื่อห้อง
                <input
                  value={roomForm.roomName}
                  onChange={(event) => setRoomForm((prev) => ({ ...prev, roomName: event.target.value }))}
                  className="h-10 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-[#1167e8]"
                  required
                />
              </label>
              <label className="grid gap-1 text-sm font-medium text-slate-700">
                ความจุ
                <input
                  type="number"
                  min={1}
                  value={roomForm.capacity}
                  onChange={(event) => setRoomForm((prev) => ({ ...prev, capacity: Number(event.target.value) }))}
                  className="h-10 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-[#1167e8]"
                  required
                />
              </label>
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4">
              <IconButton onClick={() => setRoomModal(null)}>
                <XIcon className="h-4 w-4" />
                Cancel
              </IconButton>
              <button className="h-9 rounded-lg border border-[#1167e8] bg-[#1167e8] px-4 text-sm font-medium text-white hover:bg-[#0f5fd6]">
                Save
              </button>
            </div>
          </form>
        </ModalShell>
      ) : null}

      {speakerModal ? (
        <ModalShell title={speakerModal.mode === 'add' ? 'เพิ่มอาจารย์พากย์' : 'แก้ไขอาจารย์พากย์'} onClose={() => setSpeakerModal(null)}>
          <form onSubmit={saveSpeaker}>
            <div className="grid gap-4 p-5 md:grid-cols-3">
              <label className="grid gap-1 text-sm font-medium text-slate-700">
                รหัสอาจารย์
                <input
                  value={speakerForm.speakerCode}
                  onChange={(event) => setSpeakerForm((prev) => ({ ...prev, speakerCode: event.target.value.toUpperCase() }))}
                  disabled={speakerModal.mode === 'edit'}
                  className="h-10 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-[#1167e8] disabled:bg-slate-100 disabled:text-slate-500"
                  required
                />
              </label>
              <label className="grid gap-1 text-sm font-medium text-slate-700">
                ชื่ออาจารย์
                <input
                  value={speakerForm.speakerName}
                  onChange={(event) => setSpeakerForm((prev) => ({ ...prev, speakerName: event.target.value }))}
                  className="h-10 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-[#1167e8]"
                  required
                />
              </label>
              <label className="grid gap-1 text-sm font-medium text-slate-700">
                สถานะ
                <select
                  value={speakerForm.status}
                  onChange={(event) =>
                    setSpeakerForm((prev) => ({ ...prev, status: event.target.value as SpeakerStatus }))
                  }
                  className="h-10 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-[#1167e8]"
                >
                  <option value="available">ว่าง</option>
                  <option value="lecturing">กำลังบรรยาย</option>
                  <option value="inactive">ปิดใช้งาน</option>
                </select>
              </label>
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4">
              <IconButton onClick={() => setSpeakerModal(null)}>
                <XIcon className="h-4 w-4" />
                Cancel
              </IconButton>
              <button className="h-9 rounded-lg border border-[#1167e8] bg-[#1167e8] px-4 text-sm font-medium text-white hover:bg-[#0f5fd6]">
                Save
              </button>
            </div>
          </form>
        </ModalShell>
      ) : null}

      {assignModal ? (
        <ModalShell title="จัดห้องพากย์" onClose={() => setAssignModal(null)}>
          <form onSubmit={assignRoom}>
            <div className="space-y-4 p-5">
              <div className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm md:grid-cols-3">
                <div>
                  <p className="text-xs font-medium uppercase text-slate-400">Bonus No.</p>
                  <p className="mt-1 font-semibold text-slate-950">{assignModal.card.bonus}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase text-slate-400">Party Code</p>
                  <p className="mt-1 font-semibold text-slate-950">{assignModal.card.partyCode}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase text-slate-400">Attendees</p>
                  <p className="mt-1 font-semibold text-slate-950">
                    {assignModal.card.adult + assignModal.card.child + assignModal.card.student + assignModal.card.tourLeader}
                  </p>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-1 text-sm font-medium text-slate-700">
                  ห้องบรรยาย
                  <select
                    value={assignForm.roomId}
                    onChange={(event) => setAssignForm((prev) => ({ ...prev, roomId: event.target.value }))}
                    className="h-10 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-[#1167e8]"
                    required
                  >
                    <option value="">เลือกห้อง</option>
                    {rooms
                      .filter((room) => !activeRoomIds.has(room.id))
                      .map((room) => (
                        <option key={room.id} value={room.id}>
                          {room.roomCode} - {room.roomName}
                        </option>
                      ))}
                  </select>
                </label>
                <label className="grid gap-1 text-sm font-medium text-slate-700">
                  อาจารย์พากย์
                  <select
                    value={assignForm.speakerId}
                    onChange={(event) => setAssignForm((prev) => ({ ...prev, speakerId: event.target.value }))}
                    className="h-10 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-[#1167e8]"
                  >
                    <option value="">ใช้ผู้พากย์จาก Bonus Card</option>
                    {speakers
                      .filter((speaker) => speaker.status !== 'inactive' && !activeSpeakerIds.has(speaker.id))
                      .map((speaker) => (
                        <option key={speaker.id} value={speaker.id}>
                          {speaker.speakerCode} - {speaker.speakerName}
                        </option>
                      ))}
                  </select>
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4">
              <IconButton onClick={() => setAssignModal(null)}>
                <XIcon className="h-4 w-4" />
                Cancel
              </IconButton>
              <button className="h-9 rounded-lg border border-[#1167e8] bg-[#1167e8] px-4 text-sm font-medium text-white hover:bg-[#0f5fd6]">
                Assign Room
              </button>
            </div>
          </form>
        </ModalShell>
      ) : null}
    </PageShell>
  );
}

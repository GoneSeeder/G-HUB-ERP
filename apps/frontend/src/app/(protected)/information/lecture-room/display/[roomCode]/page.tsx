'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@/components/ui/icons';
import { apiFetch } from '@/lib/api';

type LectureRoom = {
  id: string;
  roomCode: string;
  roomName: string;
  capacity: number;
};

type LectureSession = {
  id: string;
  partyCode: string;
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

type DisplayState = {
  room: LectureRoom;
  activeSession: LectureSession | null;
  serverTime: string;
};

function formatTimer(seconds: number) {
  const safe = Math.max(0, seconds);
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const secs = safe % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
}

export default function LectureRoomDisplayPage() {
  const params = useParams();
  const router = useRouter();
  const roomCode = String(params?.roomCode || '');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState<DisplayState | null>(null);
  const [timeOffset, setTimeOffset] = useState(0);
  const [now, setNow] = useState(Date.now());

  const loadState = async () => {
    try {
      const response = await apiFetch<DisplayState>(`/api/lecture-rooms/display/${roomCode}`);
      setData(response);
      setError('');
      if (response.activeSession?.startedAt) {
        setTimeOffset(new Date(response.serverTime).getTime() - Date.now());
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ไม่สามารถโหลดข้อมูลห้องบรรยายได้');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!roomCode) return;
    loadState();
    const interval = window.setInterval(loadState, 2000);
    return () => window.clearInterval(interval);
  }, [roomCode]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const startLecture = async () => {
    try {
      await apiFetch(`/api/lecture-rooms/display/${roomCode}/start`, { method: 'POST' });
      await loadState();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'ไม่สามารถเริ่มการบรรยายได้');
    }
  };

  const endLecture = async () => {
    if (!window.confirm('ยืนยันสิ้นสุดการบรรยายรอบนี้หรือไม่?')) return;
    try {
      await apiFetch(`/api/lecture-rooms/display/${roomCode}/end`, { method: 'POST' });
      await loadState();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'ไม่สามารถสิ้นสุดการบรรยายได้');
    }
  };

  const elapsed = () => {
    const startedAt = data?.activeSession?.startedAt;
    if (!startedAt) return '00:00:00';
    const seconds = Math.floor((now + timeOffset - new Date(startedAt).getTime()) / 1000);
    return formatTimer(seconds);
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-300">
        <div className="space-y-4 text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-slate-700 border-t-blue-500" />
          <p className="text-sm font-light">กำลังโหลดข้อมูลห้องบรรยาย...</p>
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-slate-100">
        <section className="max-w-md rounded-2xl border border-red-900/50 bg-red-950/20 p-6 text-center">
          <h1 className="text-xl font-semibold">เกิดข้อผิดพลาด</h1>
          <p className="mt-2 text-sm font-light text-red-200">{error || 'ไม่พบข้อมูลห้องบรรยาย'}</p>
          <button
            type="button"
            onClick={() => router.push('/information/lecture-room')}
            className="mt-5 rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-100 transition-colors hover:bg-slate-800"
          >
            กลับหน้าห้องบรรยาย
          </button>
        </section>
      </main>
    );
  }

  const { room, activeSession } = data;
  const status = activeSession?.status || 'available';
  const statusText =
    status === 'lecturing' ? 'กำลังบรรยาย' : status === 'arriving' ? 'กำลังเข้าห้อง' : 'พร้อมใช้งาน';

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <section className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl flex-col rounded-3xl border border-slate-800 bg-slate-900/70 p-8">
        <header className="flex items-center justify-between border-b border-slate-800 pb-6">
          <div>
            <button
              type="button"
              onClick={() => router.push('/information/lecture-room')}
              className="mb-4 inline-flex items-center gap-2 text-sm font-light text-slate-400 transition-colors hover:text-white"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Control Center
            </button>
            <div className="flex items-center gap-3">
              <span className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300">
                {room.roomCode}
              </span>
              <span
                className={`rounded-full border px-3 py-1 text-xs font-medium ${
                  status === 'lecturing'
                    ? 'border-blue-400/30 bg-blue-400/10 text-blue-300'
                    : status === 'arriving'
                      ? 'border-amber-400/30 bg-amber-400/10 text-amber-300'
                      : 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
                }`}
              >
                {statusText}
              </span>
            </div>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight">{room.roomName}</h1>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Capacity</p>
            <p className="mt-1 text-2xl font-semibold text-slate-100">{room.capacity}</p>
          </div>
        </header>

        <div className="grid flex-1 items-center gap-8 py-8 lg:grid-cols-[1.1fr_0.9fr]">
          {activeSession ? (
            <>
              <section className="space-y-6">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Party Code</p>
                  <p className="mt-2 text-6xl font-semibold tracking-tight">{activeSession.partyCode}</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-5">
                    <p className="text-xs font-medium uppercase text-slate-500">อาจารย์พากย์</p>
                    <p className="mt-2 text-xl font-semibold text-blue-300">{activeSession.speakerName}</p>
                    <p className="mt-1 text-xs text-slate-500">{activeSession.speakerCode}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-5">
                    <p className="text-xs font-medium uppercase text-slate-500">ผู้เข้าฟัง</p>
                    <p className="mt-2 text-xl font-semibold">
                      {activeSession.attendeeCount}
                      <span className="ml-1 text-sm font-light text-slate-400">คน</span>
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      ที่นั่งว่าง {Math.max(0, room.capacity - activeSession.attendeeCount)}
                    </p>
                  </div>
                </div>
              </section>

              <section className="rounded-3xl border border-slate-800 bg-slate-950/50 p-8 text-center">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Lecture Timer</p>
                <p className="mt-3 font-mono text-6xl font-semibold tracking-tight text-white">{elapsed()}</p>
                <div className="mt-8">
                  {status === 'arriving' ? (
                    <button
                      type="button"
                      onClick={startLecture}
                      className="w-full rounded-xl border border-[#1167e8] bg-[#1167e8] px-6 py-4 text-base font-medium text-white transition-colors hover:bg-[#0f5fd6]"
                    >
                      Start Lecture
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={endLecture}
                      className="w-full rounded-xl border border-red-500 bg-red-500 px-6 py-4 text-base font-medium text-white transition-colors hover:bg-red-600"
                    >
                      End Lecture
                    </button>
                  )}
                </div>
              </section>
            </>
          ) : (
            <section className="col-span-full mx-auto max-w-xl text-center">
              <div className="mx-auto mb-6 h-16 w-16 rounded-2xl border border-emerald-400/30 bg-emerald-400/10" />
              <h2 className="text-4xl font-semibold">ห้องพร้อมใช้งาน</h2>
              <p className="mt-3 text-sm font-light leading-6 text-slate-400">
                ยังไม่มีการจัดคณะทัวร์เข้าห้องนี้ กรุณาจัดห้องจากหน้า Control Center
              </p>
            </section>
          )}
        </div>
      </section>
    </main>
  );
}

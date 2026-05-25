'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { publicApiFetch } from '@/lib/api';

type LectureRoom = {
  id: string;
  roomCode: string;
  roomName: string;
  capacity: number;
  status?: 'available' | 'inactive';
};

export default function LectureRoomDisplayIndexPage() {
  const [rooms, setRooms] = useState<LectureRoom[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadRooms = async () => {
      try {
        setRooms(await publicApiFetch<LectureRoom[]>('/api/public/lecture-rooms'));
        setError('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'ไม่สามารถโหลดข้อมูลห้องได้');
      }
    };
    void loadRooms();
    const timer = window.setInterval(loadRooms, 5000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <main className="h-screen w-screen overflow-hidden bg-slate-950 p-6 text-white">
      <section className="mx-auto flex h-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70 p-8">
        <header className="shrink-0 border-b border-slate-800 pb-5">
          <p className="text-xs font-medium uppercase tracking-[0.28em] text-blue-300">Lecture Display</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">เลือกห้องบรรยาย</h1>
        </header>
        {error ? <div className="mt-4 rounded-xl border border-red-900/50 bg-red-950/20 px-4 py-3 text-sm text-red-200">{error}</div> : null}
        <div className="grid min-h-0 flex-1 auto-rows-min grid-cols-2 gap-3 overflow-hidden py-6 md:grid-cols-3 xl:grid-cols-4">
          {rooms.map((room) => (
            <Link
              key={room.id}
              href={`/information/lecture-room/display/${room.roomCode}`}
              className="rounded-2xl border border-slate-800 bg-slate-950/50 p-5 transition hover:border-blue-400/50 hover:bg-blue-950/20"
            >
              <p className="font-mono text-xs text-slate-500">{room.roomCode}</p>
              <h2 className="mt-2 truncate text-xl font-semibold text-white">{room.roomName}</h2>
              <p className="mt-3 text-xs text-slate-500">ความจุ {room.capacity} คน</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

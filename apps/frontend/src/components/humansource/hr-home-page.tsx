'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import {
  ArrowRightIcon,
  CalendarIcon,
  PlusIcon,
  UsersIcon,
} from '@/components/ui/icons';

export function HrHomePage() {
  const [dateLabel, setDateLabel] = useState('วันนี้');

  useEffect(() => {
    setDateLabel(new Intl.DateTimeFormat('th-TH', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date()));
  }, []);

  return (
    <div className="min-h-full bg-[#f6f7fa] px-4 py-5 lg:px-6">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-indigo-600">G-HUB Enterprise</p>
            <h1 className="mt-1 text-xl font-bold text-gray-950">สวัสดี, G-HUB Admin</h1>
            <p className="mt-1 text-xs text-gray-500">{dateLabel}</p>
          </div>
          <button
            type="button"
            className="flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-700 shadow-sm transition hover:border-indigo-200 hover:text-indigo-700"
          >
            <CalendarIcon className="h-4 w-4 text-indigo-500" />
            ดูปฏิทินองค์กร
          </button>
        </div>

        <div className="grid items-start gap-4 xl:grid-cols-[260px_minmax(0,1fr)] 2xl:grid-cols-[260px_minmax(0,1fr)_286px]">
          <aside className="space-y-4">
            <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                  G
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-gray-900">G-HUB Admin</p>
                  <p className="mt-0.5 truncate text-[11px] text-gray-500">ผู้ดูแลระบบ · สำนักงานใหญ่</p>
                </div>
              </div>
              <div className="mt-4 border-t border-gray-100 pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] text-gray-500">สถานะวันนี้</p>
                    <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      ลงเวลาเข้าแล้ว 08:42
                    </p>
                  </div>
                  <span className="text-[10px] font-medium text-gray-400">08:00–17:00</span>
                </div>
                <button
                  type="button"
                  className="mt-4 flex h-9 w-full items-center justify-center rounded-lg bg-gray-950 text-xs font-semibold text-white transition hover:bg-gray-800"
                >
                  ลงเวลาออก
                </button>
              </div>
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-gray-900">กิจกรรมวันนี้</h2>
                <button type="button" className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800">
                  ดูทั้งหมด
                </button>
              </div>
              <div className="mt-3 space-y-3">
                <TimelineItem time="10:00" duration="30 นาที" title="ประชุมทีม People Ops" detail="ห้องประชุม A" color="border-indigo-400" />
                <TimelineItem time="14:30" duration="1 ชั่วโมง" title="สัมภาษณ์ผู้สมัคร" detail="ตำแหน่ง HR Officer" color="border-amber-400" />
              </div>
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-gray-900">สิทธิ์ลาคงเหลือ</h2>
                <span className="text-[10px] text-gray-400">ปี 2569</span>
              </div>
              <div className="mt-3 space-y-3">
                <LeaveBalance label="ลาพักร้อน" left="6" total="10" color="bg-indigo-500" width="60%" />
                <LeaveBalance label="ลากิจ" left="3" total="3" color="bg-emerald-500" width="100%" />
                <LeaveBalance label="ลาป่วย" left="27" total="30" color="bg-amber-500" width="90%" />
              </div>
            </section>
          </aside>

          <main className="min-w-0">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-gray-950">ข่าวสารบริษัท</h2>
                <p className="mt-0.5 text-[11px] text-gray-500">ประกาศ ข่าวภายใน และเรื่องราวจากทีมต่าง ๆ</p>
              </div>
              <div className="flex rounded-lg border border-gray-200 bg-white p-1">
                <button type="button" className="rounded-md bg-gray-950 px-3 py-1.5 text-[11px] font-semibold text-white">ทั้งหมด</button>
                <button type="button" className="rounded-md px-3 py-1.5 text-[11px] font-semibold text-gray-500 hover:text-gray-900">ประกาศ</button>
                <button type="button" className="rounded-md px-3 py-1.5 text-[11px] font-semibold text-gray-500 hover:text-gray-900">กิจกรรม</button>
              </div>
            </div>

            <div className="space-y-4">
              <article className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50">
                    <Image src="/logo-ghub.png" alt="G-HUB" width={22} height={22} priority />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-900">ฝ่ายทรัพยากรบุคคล</p>
                    <p className="text-[10px] text-gray-400">ประกาศสำคัญ · 2 ชั่วโมงที่แล้ว</p>
                  </div>
                  <span className="ml-auto rounded-full bg-rose-50 px-2 py-1 text-[9px] font-bold text-rose-600">ปักหมุด</span>
                </div>
                <div className="grid bg-[#111827] sm:grid-cols-[minmax(0,1fr)_160px]">
                  <div className="p-5 text-white sm:p-6">
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-indigo-300">Company update</p>
                    <h3 className="mt-2 text-lg font-bold leading-7">เปิดใช้งาน G-HUB HR สำหรับพนักงานทุกคน</h3>
                    <p className="mt-2 max-w-xl text-xs leading-6 text-gray-300">
                      ตรวจสอบข้อมูลส่วนตัว สิทธิ์การลา เอกสารเงินเดือน และติดตามคำขอได้จากหน้าหลักแห่งนี้
                    </p>
                    <button type="button" className="mt-4 rounded-lg bg-white px-3 py-2 text-[11px] font-bold text-gray-950 hover:bg-gray-100">
                      อ่านรายละเอียด
                    </button>
                  </div>
                  <div className="hidden items-center justify-center bg-indigo-600 p-6 sm:flex">
                    <Image src="/logo-ghub.png" alt="" width={96} height={96} className="drop-shadow-lg" priority />
                  </div>
                </div>
              </article>

              <article className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                    <CalendarIcon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-bold text-gray-900">แจ้งวันหยุดบริษัทประจำเดือนกรกฎาคม</p>
                        <p className="mt-0.5 text-[10px] text-gray-400">ฝ่ายทรัพยากรบุคคล · เมื่อวานนี้</p>
                      </div>
                      <span className="rounded-full bg-amber-50 px-2 py-1 text-[9px] font-bold text-amber-700">ประกาศ</span>
                    </div>
                    <p className="mt-3 text-xs leading-6 text-gray-600">
                      บริษัทกำหนดวันหยุดเพิ่มเติมในวันจันทร์ที่ 27 กรกฎาคม กรุณาตรวจสอบตารางงานและวางแผนการล่วงหน้า
                    </p>
                    <div className="mt-3 flex items-center gap-4 border-t border-gray-100 pt-3 text-[10px] text-gray-400">
                      <span>อ่านแล้ว 86 คน</span>
                      <button type="button" className="font-semibold text-indigo-600 hover:text-indigo-800">เปิดประกาศ</button>
                    </div>
                  </div>
                </div>
              </article>

              <article className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                    <UsersIcon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-gray-900">ยินดีต้อนรับสมาชิกใหม่ประจำสัปดาห์</p>
                    <p className="mt-0.5 text-[10px] text-gray-400">People & Culture · 2 วันที่แล้ว</p>
                    <p className="mt-3 text-xs leading-6 text-gray-600">
                      ร่วมต้อนรับเพื่อนใหม่ 4 คนจากทีม Sales, Operations และ Product ที่เริ่มงานในสัปดาห์นี้
                    </p>
                    <div className="mt-3 flex -space-x-2">
                      {['น', 'พ', 'อ', 'ก'].map((initial, index) => (
                        <span
                          key={initial}
                          className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold text-white"
                          style={{ backgroundColor: ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b'][index] }}
                        >
                          {initial}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            </div>
          </main>

          <aside className="space-y-4 xl:col-span-2 2xl:col-span-1">
            <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-gray-900">รอดำเนินการ</h2>
                  <p className="mt-0.5 text-[10px] text-gray-400">รายการที่ต้องจัดการของคุณ</p>
                </div>
                <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-rose-50 px-1.5 text-[10px] font-bold text-rose-600">5</span>
              </div>
              <div className="mt-3 divide-y divide-gray-100">
                <PendingItem title="คำขอลาพักร้อน" count="2 รายการ" value="2" tone="bg-indigo-50 text-indigo-700" />
                <PendingItem title="แก้ไขเวลาทำงาน" count="1 รายการ" value="1" tone="bg-sky-50 text-sky-700" />
                <PendingItem title="ประเมินทดลองงาน" count="2 รายการ" value="2" tone="bg-amber-50 text-amber-700" />
              </div>
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <h2 className="text-sm font-bold text-gray-900">วันสำคัญของทีม</h2>
              <div className="mt-3 space-y-3">
                <ImportantDay initial="ส" name="สมหญิง ใจดี" detail="วันเกิดวันนี้" tone="bg-pink-100 text-pink-700" symbol="BD" />
                <ImportantDay initial="ธ" name="ธนกร มีสุข" detail="ครบรอบงาน 3 ปี" tone="bg-sky-100 text-sky-700" symbol="3Y" />
              </div>
            </section>

            <section className="rounded-lg bg-indigo-600 p-4 text-white shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-indigo-200">Quick action</p>
              <h2 className="mt-2 text-sm font-bold">ต้องการส่งคำขอ?</h2>
              <p className="mt-1 text-[11px] leading-5 text-indigo-100">ลา แก้ไขเวลา ขอเอกสาร หรือแจ้งข้อมูลส่วนตัว</p>
              <button type="button" className="mt-4 flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-white text-xs font-bold text-indigo-700 hover:bg-indigo-50">
                <PlusIcon className="h-3.5 w-3.5" />
                สร้างคำขอ
              </button>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

function TimelineItem({
  time,
  duration,
  title,
  detail,
  color,
}: {
  time: string;
  duration: string;
  title: string;
  detail: string;
  color: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="w-11 flex-shrink-0 text-center">
        <p className="text-xs font-bold text-gray-900">{time}</p>
        <p className="text-[9px] text-gray-400">{duration}</p>
      </div>
      <div className={`min-w-0 border-l-2 pl-3 ${color}`}>
        <p className="text-xs font-semibold text-gray-800">{title}</p>
        <p className="mt-0.5 text-[10px] text-gray-400">{detail}</p>
      </div>
    </div>
  );
}

function LeaveBalance({
  label,
  left,
  total,
  color,
  width,
}: {
  label: string;
  left: string;
  total: string;
  color: string;
  width: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-[11px]">
        <span className="font-medium text-gray-600">{label}</span>
        <span className="font-semibold text-gray-900">{left} / {total} วัน</span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-gray-100">
        <div className={`h-full rounded-full ${color}`} style={{ width }} />
      </div>
    </div>
  );
}

function PendingItem({
  title,
  count,
  value,
  tone,
}: {
  title: string;
  count: string;
  value: string;
  tone: string;
}) {
  return (
    <button type="button" className="flex w-full items-center gap-3 py-3 text-left">
      <span className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold ${tone}`}>{value}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-semibold text-gray-800">{title}</span>
        <span className="mt-0.5 block text-[10px] text-gray-400">{count}</span>
      </span>
      <ArrowRightIcon className="h-3.5 w-3.5 text-gray-300" />
    </button>
  );
}

function ImportantDay({
  initial,
  name,
  detail,
  tone,
  symbol,
}: {
  initial: string;
  name: string;
  detail: string;
  tone: string;
  symbol: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold ${tone}`}>{initial}</span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold text-gray-800">{name}</p>
        <p className="text-[10px] text-gray-400">{detail}</p>
      </div>
      <span className="rounded bg-gray-100 px-1.5 py-1 text-[9px] font-bold text-gray-500" aria-hidden="true">{symbol}</span>
    </div>
  );
}

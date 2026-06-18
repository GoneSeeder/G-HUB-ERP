'use client';

import { type ReactNode, useEffect, useState } from 'react';
import {
  ArrowRightIcon,
  CalendarIcon,
  PlusIcon,
  UsersIcon,
} from '@/components/ui/icons';
import { HrBadge, HrButton } from '@/components/humansource/hr-ui';

const leaveBalances = [
  { label: 'ลาพักร้อน', left: 6, total: 10, color: 'bg-indigo-500' },
  { label: 'ลากิจ', left: 3, total: 3, color: 'bg-emerald-500' },
  { label: 'ลาป่วย', left: 27, total: 30, color: 'bg-amber-500' },
];

const employeeRequests = [
  { title: 'คำขอลาพักร้อน', status: 'รออนุมัติ', date: '21 มิ.ย. 2569', tone: 'amber' as const },
  { title: 'หนังสือรับรองเงินเดือน', status: 'สำเร็จ', date: '14 มิ.ย. 2569', tone: 'green' as const },
  { title: 'แก้ไขเวลาเข้า-ออกงาน', status: 'รอตรวจสอบ', date: '12 มิ.ย. 2569', tone: 'indigo' as const },
];

const approvalInbox = [
  { name: 'สมหญิง ใจดี', title: 'ขอลาพักร้อน 2 วัน', meta: 'ทีมขาย · ส่งเมื่อ 09:18' },
  { name: 'ธนกร มีสุข', title: 'แก้ไขเวลาออกงาน', meta: 'ปฏิบัติการ · เมื่อวานนี้' },
  { name: 'ณัฐวุฒิ แสงดี', title: 'ขอเอกสารรับรองงาน', meta: 'สาขาเชียงใหม่ · 2 วันที่แล้ว' },
];

const feedPosts = [
  {
    author: 'ฝ่ายทรัพยากรบุคคล',
    meta: 'ประกาศสำคัญ · 2 ชั่วโมงที่แล้ว',
    badge: 'ปักหมุด',
    title: 'เปิดรอบยืนยันข้อมูลพนักงานประจำปี',
    body: 'กรุณาตรวจสอบข้อมูลส่วนตัว ที่อยู่ ผู้ติดต่อฉุกเฉิน และบัญชีเงินเดือนให้ถูกต้องก่อนวันที่ 30 มิถุนายน 2569',
    stats: 'อ่านแล้ว 186 คน',
    tone: 'indigo',
  },
  {
    author: 'People & Culture',
    meta: 'กิจกรรมบริษัท · เมื่อวานนี้',
    badge: 'กิจกรรม',
    title: 'กิจกรรม Town Hall ประจำเดือนมิถุนายน',
    body: 'พบกับอัปเดตทิศทางองค์กร ผลงานทีม และช่วงถามตอบกับผู้บริหาร วันศุกร์นี้ เวลา 15:00 น.',
    stats: 'ตอบรับแล้ว 94 คน',
    tone: 'sky',
  },
  {
    author: 'ฝ่ายทรัพยากรบุคคล',
    meta: 'วันหยุดและตารางงาน · 2 วันที่แล้ว',
    badge: 'ประกาศ',
    title: 'แจ้งวันหยุดบริษัทเพิ่มเติม',
    body: 'บริษัทกำหนดวันหยุดเพิ่มเติมสำหรับสำนักงานใหญ่ กรุณาตรวจสอบตารางงานและวางแผนการล่วงหน้าในระบบ',
    stats: 'อ่านแล้ว 132 คน',
    tone: 'amber',
  },
];

const todaySchedule = [
  { time: '09:30', title: 'ประชุมทีมประจำวัน', detail: 'Online meeting' },
  { time: '13:00', title: 'ส่งเอกสารเบิกค่าเดินทาง', detail: 'ครบกำหนดวันนี้' },
  { time: '16:30', title: 'สรุปรายงานประจำวัน', detail: 'ก่อนลงเวลาออก' },
];

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
    <div className="hr-page px-4 py-4 lg:px-6">
      <div className="mx-auto max-w-[1520px] space-y-4">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
          <div>
            <p className="text-xs font-medium text-slate-500">{dateLabel}</p>
            <h1 className="mt-1 text-xl font-semibold text-slate-950">หน้าหลัก</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <HrButton className="h-9">
              <CalendarIcon className="h-4 w-4" />
              ขอเอกสาร
            </HrButton>
            <HrButton variant="primary" className="h-9">
              <PlusIcon className="h-4 w-4" />
              ส่งคำขอ
            </HrButton>
          </div>
        </header>

        <div className="grid items-start gap-4 xl:grid-cols-[292px_minmax(0,1fr)_340px]">
          <aside className="space-y-4">
            <ProfileCard />
            <AttendanceCard />
            <LeaveCard />
          </aside>

          <main className="min-w-0 space-y-4">
            <ComposerCard />
            <div className="space-y-3">
              {feedPosts.map((post) => (
                <FeedPost key={post.title} {...post} />
              ))}
            </div>
          </main>

          <aside className="space-y-4">
            <RequestStatusCard />
            <ApprovalInboxCard />
            <ScheduleCard />
          </aside>
        </div>
      </div>
    </div>
  );
}

function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-lg border border-gray-100 bg-white ${className}`}>
      {children}
    </section>
  );
}

function PanelHeader({ title, sub, action }: { title: string; sub?: string; action?: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-sm font-semibold text-slate-950">{title}</h2>
        {sub ? <p className="mt-0.5 text-xs font-light text-slate-500">{sub}</p> : null}
      </div>
      {action ? (
        <button type="button" className="shrink-0 text-xs font-medium text-indigo-600 hover:text-indigo-800">
          {action}
        </button>
      ) : null}
    </div>
  );
}

function ProfileCard() {
  return (
    <Panel className="p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-950 text-sm font-semibold text-white">
          GA
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-950">G-HUB Admin</p>
          <p className="mt-0.5 truncate text-xs text-slate-500">HR Officer · สำนักงานใหญ่</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-slate-100 pt-4">
        <ProfileMetric label="รหัสพนักงาน" value="EMP-0001" />
        <ProfileMetric label="หัวหน้างาน" value="คุณมณี" />
        <ProfileMetric label="ประเภท" value="รายเดือน" />
        <ProfileMetric label="เริ่มงาน" value="1 ม.ค. 2567" />
      </div>
    </Panel>
  );
}

function ProfileMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="truncate text-[10px] text-slate-400">{label}</p>
      <p className="mt-0.5 truncate text-xs font-medium text-slate-800">{value}</p>
    </div>
  );
}

function AttendanceCard() {
  return (
    <Panel className="p-4">
      <PanelHeader title="เวลาเข้างานวันนี้" sub="รอบงาน 08:00-17:00" />
      <div className="mt-4 grid grid-cols-2 gap-2">
        <TimeRecord label="เข้างาน" time="08:42" detail="ผ่าน Mobile" state="สำเร็จ" active />
        <TimeRecord label="ออกงาน" time="--:--" detail="รอข้อมูลจากระบบ" state="ยังไม่ลงเวลา" />
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3 text-xs">
        <span className="text-slate-500">ชั่วโมงทำงานสะสม</span>
        <span className="font-semibold text-slate-800">4 ชม. 18 นาที</span>
      </div>
    </Panel>
  );
}

function TimeRecord({
  label,
  time,
  detail,
  state,
  active = false,
}: {
  label: string;
  time: string;
  detail: string;
  state: string;
  active?: boolean;
}) {
  return (
    <div className={`rounded-lg px-3 py-3 ${active ? 'bg-emerald-50' : 'bg-gray-50'}`}>
      <div className="flex items-center justify-between gap-2">
        <p className={active ? 'text-xs font-medium text-emerald-700' : 'text-xs text-gray-500'}>{label}</p>
        <span className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-gray-300'}`} />
      </div>
      <p className={`mt-2 text-xl font-bold ${active ? 'text-emerald-900' : 'text-gray-800'}`}>{time}</p>
      <p className={active ? 'mt-1 text-[11px] text-emerald-600' : 'mt-1 text-[11px] text-gray-400'}>{detail}</p>
      <p className="mt-1.5 text-[10px] text-gray-400">{state}</p>
    </div>
  );
}

function LeaveCard() {
  return (
    <Panel className="p-4">
      <PanelHeader title="สิทธิ์ลาคงเหลือ" sub="ปี 2569" action="ดูทั้งหมด" />
      <div className="mt-4 space-y-3">
        {leaveBalances.map((leave) => (
          <LeaveBalance key={leave.label} {...leave} />
        ))}
      </div>
    </Panel>
  );
}

function LeaveBalance({
  label,
  left,
  total,
  color,
}: {
  label: string;
  left: number;
  total: number;
  color: string;
}) {
  const percent = Math.min(100, Math.round((left / total) * 100));
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="font-semibold text-slate-950">{left} / {total} วัน</span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded bg-slate-100">
        <div className={`h-full rounded ${color}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function ComposerCard() {
  return (
    <Panel className="p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-950 text-xs font-semibold text-white">
          GA
        </div>
        <button type="button" className="h-10 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-4 text-left text-sm text-slate-500">
          ค้นหาข่าวสาร ประกาศ หรือกิจกรรมบริษัท
        </button>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3">
        <FeedShortcut label="ประกาศ" />
        <FeedShortcut label="กิจกรรม" />
        <FeedShortcut label="สวัสดิการ" />
      </div>
    </Panel>
  );
}

function FeedShortcut({ label }: { label: string }) {
  return (
    <button type="button" className="h-9 rounded-lg text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:text-indigo-700">
      {label}
    </button>
  );
}

function FeedPost({
  author,
  meta,
  badge,
  title,
  body,
  stats,
  tone,
}: {
  author: string;
  meta: string;
  badge: string;
  title: string;
  body: string;
  stats: string;
  tone: string;
}) {
  const toneClass = {
    indigo: 'bg-indigo-600',
    sky: 'bg-sky-600',
    amber: 'bg-amber-500',
  }[tone] ?? 'bg-slate-700';

  return (
    <article className="overflow-hidden rounded-lg border border-gray-100 bg-white">
      <div className="flex items-center gap-3 px-4 py-3.5">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white ${toneClass}`}>
          HR
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-gray-800">{author}</p>
          <p className="truncate text-xs text-gray-400">{meta}</p>
        </div>
        <span className="ml-auto rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-medium text-gray-500">{badge}</span>
      </div>
      <div className="px-4 pb-4">
        <h3 className="text-[15px] font-semibold text-gray-900">{title}</h3>
        <p className="mt-1.5 text-sm font-light leading-6 text-gray-600">{body}</p>
      </div>
      <div className="flex items-center justify-between border-t border-gray-100 px-4 py-2.5 text-xs text-gray-400">
        <span>{stats}</span>
        <button type="button" className="font-medium text-indigo-600 hover:text-indigo-800">
          อ่านรายละเอียด
        </button>
      </div>
    </article>
  );
}

function RequestStatusCard() {
  return (
    <Panel className="p-4">
      <PanelHeader title="เอกสารและคำขอของฉัน" sub="สถานะล่าสุด" action="ดูทั้งหมด" />
      <div className="mt-3 divide-y divide-gray-100">
        {employeeRequests.map((item) => (
          <div key={item.title} className="flex items-start justify-between gap-2 py-2.5">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-gray-800">{item.title}</p>
              <p className="mt-0.5 text-xs text-gray-400">{item.date}</p>
            </div>
            <HrBadge tone={item.tone}>{item.status}</HrBadge>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function ApprovalInboxCard() {
  return (
    <Panel className="p-4">
      <PanelHeader title="ส่งมาให้อนุมัติ" sub="สำหรับบทบาทผู้อนุมัติ" action="เปิดคิว" />
      <div className="mt-3 divide-y divide-slate-100">
        {approvalInbox.map((item) => (
          <button key={`${item.name}-${item.title}`} type="button" className="flex w-full items-center gap-3 py-3 text-left transition hover:bg-slate-50">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-semibold text-indigo-700">
              {item.name.slice(0, 1)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-slate-800">{item.title}</span>
              <span className="mt-0.5 block truncate text-xs text-slate-500">{item.meta}</span>
            </span>
            <ArrowRightIcon className="h-4 w-4 text-slate-300" />
          </button>
        ))}
      </div>
    </Panel>
  );
}

function ScheduleCard() {
  return (
    <Panel className="p-4">
      <PanelHeader title="วันนี้ของฉัน" sub="งานและกำหนดการใกล้ถึง" />
      <div className="mt-3 space-y-3">
        {todaySchedule.map((event) => (
          <div key={`${event.time}-${event.title}`} className="flex gap-3">
            <div className="w-11 shrink-0 text-xs font-semibold text-slate-950">{event.time}</div>
            <div className="min-w-0 border-l border-slate-200 pl-3">
              <p className="truncate text-sm font-medium text-slate-800">{event.title}</p>
              <p className="mt-0.5 truncate text-xs text-slate-500">{event.detail}</p>
            </div>
          </div>
        ))}
      </div>
      <button type="button" className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700">
        <UsersIcon className="h-4 w-4" />
        ดูทีมของฉัน
      </button>
    </Panel>
  );
}

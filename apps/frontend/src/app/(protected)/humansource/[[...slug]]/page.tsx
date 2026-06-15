'use client';

import React, { useEffect, useState } from 'react';
import {
  Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  DownloadIcon,
  EditIcon,
  PlusIcon,
  TrashIcon,
  UsersIcon,
  XIcon,
} from '@/components/ui/icons';
import { DatePicker } from '@/components/ui/date-picker';
import { HrHomePage } from '@/components/humansource/hr-home-page';
import { HrSettingsPage } from '@/components/humansource/hr-settings-page';
import {
  HrBadge,
  HrButton,
  HrCheckbox,
  HrDatePickerMock,
  HrEmptyState,
  HrInput,
  HrSelectMock,
} from '@/components/humansource/hr-ui';
import { allHrMenuItems, findHrPage, hrMenuGroups } from '@/data/humansource/menu';
import {
  ageDistData,
  attendanceConditionData,
  branchSalaryData,
  documentStatusChart,
  empTypeData,
  employees,
  employeeTypes,
  inOutData,
  leaveTypePctChart,
  MONTHS_TH,
  nationalityData,
  organizationTree,
  positions,
  positionTree,
  salaryBaseActualData,
  salaryLineData,
  workShifts,
  YEARS_HR,
  type Employee,
  type TreeNode,
} from '@/data/humansource/mock';

// ─── Page router ─────────────────────────────────────────────────────────────

type PageProps = { params: { slug?: string[] } };

export default function HumansourcePage({ params }: PageProps) {
  const pathname = `/humansource/${params.slug?.join('/') ?? 'home'}`;
  const page = findHrPage(pathname);
  const section = params.slug?.[0] ?? 'home';
  const leaf = params.slug?.at(-1) ?? 'home';
  const [showAddEmployee, setShowAddEmployee] = useState(false);

  return (
    <div className="min-h-full">
      {section === 'home' && <HrHomePage />}
      {section === 'settings' && <HrSettingsPage />}
      {section === 'dashboard' && <DashboardPage />}
      {leaf === 'structure' && <OrgTreePage type="organization" />}
      {leaf === 'position-structure' && <OrgTreePage type="position" />}
      {leaf === 'employee-type' && <EmployeeTypeTable />}
      {leaf === 'work-cycle' && <WorkShiftTable />}
      {leaf === 'employees' && <EmployeeListPage onAdd={() => setShowAddEmployee(true)} />}
      {leaf === 'position-list' && <PositionTable />}
      {section === 'reports' && <ReportsPage pathname={pathname} />}

      {!isSpecialPage(section, leaf) && (
        <GenericPage title={page.title} description={page.description} section={section} />
      )}

      {showAddEmployee && <AddEmployeeModal onClose={() => setShowAddEmployee(false)} />}
    </div>
  );
}

function isSpecialPage(section: string, leaf: string) {
  return (
    section === 'home' ||
    section === 'dashboard' ||
    section === 'settings' ||
    section === 'reports' ||
    ['structure', 'position-structure', 'employee-type', 'work-cycle', 'employees', 'position-list'].includes(leaf)
  );
}

// ─── Page header ──────────────────────────────────────────────────────────────

// ─── Dashboard (base44 clone) ─────────────────────────────────────────────────

const fmtCompact = (v: number) => (v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v));

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-gray-200 bg-white p-4 ${className}`}>{children}</div>
  );
}

function CardHeader({ title, sub, rightNode }: { title: string; sub?: string; rightNode?: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-start justify-between gap-2">
      <div>
        <p className="text-sm font-semibold leading-tight text-gray-700">{title}</p>
        {sub && <p className="mt-0.5 text-[10px] text-gray-400">{sub}</p>}
      </div>
      {rightNode}
    </div>
  );
}

function MonthYearSel({
  month, year, onMonth, onYear,
}: { month: number; year: number; onMonth: (v: number) => void; onYear: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1 text-xs text-gray-500">
      <select value={month} onChange={(e) => onMonth(Number(e.target.value))}
        className="cursor-pointer rounded border border-gray-200 bg-white px-1.5 py-0.5 text-xs text-gray-600 outline-none">
        {MONTHS_TH.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
      </select>
      <select value={year} onChange={(e) => onYear(Number(e.target.value))}
        className="cursor-pointer rounded border border-gray-200 bg-white px-1.5 py-0.5 text-xs text-gray-600 outline-none">
        {YEARS_HR.map((y) => <option key={y} value={y}>{y}</option>)}
      </select>
    </div>
  );
}

function YearOnlySel({ year, onYear }: { year: number; onYear: (v: number) => void }) {
  return (
    <select value={year} onChange={(e) => onYear(Number(e.target.value))}
      className="rounded border border-gray-200 bg-white px-2 py-1 text-xs text-gray-600 outline-none">
      {YEARS_HR.map((y) => <option key={y} value={y}>{y}</option>)}
    </select>
  );
}

type RTipPayload = { name: string; value: number | string; color?: string }[];
function RTooltip({ active, payload, label }: { active?: boolean; payload?: RTipPayload; label?: string | number }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs shadow-lg">
      {label != null && <p className="mb-1 font-medium text-gray-500">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: <b>{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</b>
        </p>
      ))}
    </div>
  );
}

// ─── Dashboard cards ──────────────────────────────────────────────────────────

function SalaryHistoryCard() {
  const [month, setMonth] = useState(5);
  const [year, setYear] = useState(2569);
  return (
    <Card>
      <CardHeader title="ประวัติผลการคำนวณเงินเดือน" sub="(ข้อมูลตัวอย่าง)" rightNode={
        <div className="flex items-center gap-1.5">
          <select className="rounded border border-gray-200 bg-white px-2 py-1 text-xs text-gray-600 outline-none">
            <option>เงินเดือน</option><option>จำนวนพนักงาน</option>
            <option>กลุ่มสังกัด/ตรวจสอบ</option><option>เบี้ยขยัน</option>
            <option>การสะสม</option><option>โอที (ชั่วโมง)</option>
            <option>โอที (บาท)</option><option>ลาบาน (ชั่วโมง)</option>
          </select>
          <MonthYearSel month={month} year={year} onMonth={setMonth} onYear={setYear} />
        </div>
      } />
      <ResponsiveContainer width="100%" height={200} debounce={220}>
        <LineChart data={salaryLineData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="m" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={fmtCompact} width={45} />
          <Tooltip content={<RTooltip />} />
          <Line type="monotone" dataKey="val" stroke="#2563eb" strokeWidth={2} dot={{ r: 3, fill: '#2563eb' }} name="เงินเดือน" />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}

function AgeDistCard() {
  const [month, setMonth] = useState(5);
  const [year, setYear] = useState(2569);
  return (
    <Card>
      <CardHeader title="จำนวนพนักงาน/ช่วงอายุ" sub="(ข้อมูลตัวอย่าง)"
        rightNode={<MonthYearSel month={month} year={year} onMonth={setMonth} onYear={setYear} />} />
      <div className="mb-3 flex items-center gap-6">
        <div className="flex items-center gap-2 text-sm"><span className="text-2xl">♂</span><p className="text-xl font-bold text-blue-600">49</p></div>
        <div className="flex items-center gap-2 text-sm"><span className="text-2xl">♀</span><p className="text-xl font-bold text-pink-500">51</p></div>
        <div className="flex items-center gap-2 text-sm"><span className="text-2xl">⚥</span><p className="text-xl font-bold text-gray-500">20</p></div>
        <div className="ml-auto text-sm text-gray-600">รวม <span className="text-2xl font-bold text-gray-800">120</span> คน</div>
      </div>
      <div className="mb-2 flex gap-4 text-[10px] text-gray-500">
        <span className="flex items-center gap-1"><span className="inline-block h-2 w-3 rounded-sm bg-blue-500" />เพศชาย</span>
        <span className="flex items-center gap-1"><span className="inline-block h-2 w-3 rounded-sm bg-pink-400" />เพศหญิง</span>
        <span className="flex items-center gap-1"><span className="inline-block h-2 w-3 rounded-sm bg-gray-300" />ไม่ระบุเพศ</span>
      </div>
      <ResponsiveContainer width="100%" height={155} debounce={220}>
        <BarChart data={ageDistData} layout="vertical" barSize={7} barGap={1}>
          <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 9 }} axisLine={false} tickLine={false} />
          <YAxis dataKey="age" type="category" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} width={38} />
          <Tooltip content={<RTooltip />} />
          <Bar dataKey="male" fill="#3b82f6" name="เพศชาย" radius={[0, 3, 3, 0]} />
          <Bar dataKey="female" fill="#f472b6" name="เพศหญิง" radius={[0, 3, 3, 0]} />
          <Bar dataKey="other" fill="#d1d5db" name="ไม่ระบุ" radius={[0, 3, 3, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

function DonutWithLegend({
  data, total, centerLabel, centerUnit, legendUnit, showPercent,
}: {
  data: { name: string; value: number; color: string }[];
  total: number | string;
  centerLabel?: string;
  centerUnit?: string;
  legendUnit?: string;
  showPercent?: boolean;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="relative flex-shrink-0">
        <PieChart width={130} height={130}>
          <Pie data={data} cx={60} cy={60} innerRadius={40} outerRadius={58} dataKey="value" strokeWidth={0} animationDuration={800}>
            {data.map((d, i) => <Cell key={i} fill={d.color} />)}
          </Pie>
          <Tooltip content={<RTooltip />} />
        </PieChart>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          {centerLabel && <p className="text-xs text-gray-400">{centerLabel}</p>}
          <p className="text-base font-bold text-gray-800">{total}</p>
          {centerUnit && <p className="text-[10px] text-gray-400">{centerUnit}</p>}
        </div>
      </div>
      <div className="flex-1 space-y-1.5 text-xs">
        {data.map((d, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ background: d.color }} />
              <span className="truncate text-gray-500">{d.name}</span>
            </div>
            <span className="font-semibold text-gray-700">
              {d.value}{showPercent ? ' %' : legendUnit ? ` ${legendUnit}` : ''}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmpTypeCard() {
  const [month, setMonth] = useState(5);
  const [year, setYear] = useState(2569);
  const total = empTypeData.reduce((s, d) => s + d.value, 0);
  return (
    <Card>
      <CardHeader title="ประเภทพนักงาน" sub="(ข้อมูลตัวอย่าง)"
        rightNode={<MonthYearSel month={month} year={year} onMonth={setMonth} onYear={setYear} />} />
      <DonutWithLegend data={empTypeData} total={total} centerUnit="คน" legendUnit="คน" />
    </Card>
  );
}

function NationalityCard() {
  const [month, setMonth] = useState(5);
  const [year, setYear] = useState(2569);
  const total = nationalityData.reduce((s, d) => s + d.value, 0);
  return (
    <Card>
      <CardHeader title="สัญชาติ" sub="(ข้อมูลตัวอย่าง)"
        rightNode={<MonthYearSel month={month} year={year} onMonth={setMonth} onYear={setYear} />} />
      <DonutWithLegend data={nationalityData} total={total} centerUnit="คน" legendUnit="คน" />
    </Card>
  );
}

function BranchSalaryCard() {
  const [month, setMonth] = useState(5);
  const [year, setYear] = useState(2569);
  return (
    <Card>
      <CardHeader title="เงินเดือนตามสำนักงานสาขา" sub="(ข้อมูลตัวอย่าง)" rightNode={
        <div className="flex items-center gap-1.5">
          <select className="rounded border border-gray-200 bg-white px-2 py-1 text-xs text-gray-600 outline-none">
            <option>เลือกทั้งหมด</option><option>เงินเดือน</option>
          </select>
          <MonthYearSel month={month} year={year} onMonth={setMonth} onYear={setYear} />
        </div>
      } />
      <div className="mb-2 flex gap-4 text-[10px] text-gray-500">
        <span className="flex items-center gap-1"><span className="inline-block h-2 w-3 rounded-sm bg-blue-200" />สาขา 1</span>
        <span className="flex items-center gap-1"><span className="inline-block h-2 w-3 rounded-sm bg-blue-600" />สาขา 2</span>
        <span className="flex items-center gap-1"><span className="inline-block h-2 w-3 rounded-sm bg-orange-500" />สาขา 3</span>
      </div>
      <ResponsiveContainer width="100%" height={190} debounce={220}>
        <BarChart data={branchSalaryData} barSize={16}>
          <XAxis dataKey="m" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 120]} />
          <Tooltip content={<RTooltip />} />
          <Bar dataKey="b1" name="สาขา 1" stackId="a" fill="#bfdbfe" />
          <Bar dataKey="b2" name="สาขา 2" stackId="a" fill="#2563eb" />
          <Bar dataKey="b3" name="สาขา 3" stackId="a" fill="#f97316" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

function InOutCard() {
  const [year, setYear] = useState(2569);
  return (
    <Card>
      <CardHeader title="เข้าใหม่/ลาออก" sub="(ข้อมูลตัวอย่าง)" rightNode={<YearOnlySel year={year} onYear={setYear} />} />
      <div className="mb-2 flex gap-4 text-[10px] text-gray-500">
        <span className="flex items-center gap-1"><span className="inline-block h-2 w-3 rounded-sm bg-blue-500" />เข้าใหม่</span>
        <span className="flex items-center gap-1"><span className="inline-block h-2 w-3 rounded-sm bg-orange-400" />ลาออก</span>
      </div>
      <ResponsiveContainer width="100%" height={190} debounce={220}>
        <BarChart data={inOutData} barSize={12} barGap={2}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis dataKey="m" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip content={<RTooltip />} />
          <Bar dataKey="in" name="เข้าใหม่" fill="#3b82f6" radius={[3, 3, 0, 0]} />
          <Bar dataKey="out" name="ลาออก" fill="#fb923c" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

function SalaryCard() {
  const [year, setYear] = useState(2569);
  return (
    <Card>
      <CardHeader title="เงินเดือน" sub="(ข้อมูลตัวอย่าง)" rightNode={<YearOnlySel year={year} onYear={setYear} />} />
      <div className="mb-3 flex gap-4">
        <div className="flex-1 rounded-lg bg-gray-50 p-2">
          <p className="text-[10px] text-gray-400">ปี {year}</p>
          <p className="text-sm font-bold text-gray-800">75,930,737 บาท</p>
        </div>
        <div className="flex-1 rounded-lg bg-gray-50 p-2">
          <p className="text-[10px] text-gray-400">เดือน พ.ย.</p>
          <p className="text-sm font-bold text-gray-800">8,390,106 บาท</p>
        </div>
      </div>
      <div className="mb-1 flex gap-4 text-[10px] text-gray-500">
        <span className="flex items-center gap-1"><span className="inline-block h-2 w-3 rounded-sm bg-blue-200" />ฐานเงินเดือน</span>
        <span className="flex items-center gap-1"><span className="inline-block h-2 w-3 rounded-sm bg-blue-600" />จ่ายจริง</span>
      </div>
      <ResponsiveContainer width="100%" height={130} debounce={220}>
        <BarChart data={salaryBaseActualData} barSize={10} barGap={1}>
          <XAxis dataKey="m" tick={{ fill: '#94a3b8', fontSize: 9 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={fmtCompact} width={38} />
          <Tooltip content={<RTooltip />} />
          <Bar dataKey="base" name="ฐานเงินเดือน" fill="#bfdbfe" radius={[2, 2, 0, 0]} />
          <Bar dataKey="actual" name="จ่ายจริง" fill="#2563eb" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

function DocumentsAllCard() {
  const total = documentStatusChart.reduce((s, d) => s + d.value, 0);
  return (
    <Card>
      <CardHeader title="เอกสารทั้งหมด" sub="(ข้อมูลตัวอย่าง)" />
      <div className="flex items-center gap-4">
        <div className="relative flex-shrink-0">
          <PieChart width={130} height={130}>
            <Pie data={documentStatusChart} cx={60} cy={60} innerRadius={40} outerRadius={58} dataKey="value" strokeWidth={0} animationDuration={800}>
              {documentStatusChart.map((d, i) => <Cell key={i} fill={d.color} />)}
            </Pie>
            <Tooltip content={<RTooltip />} />
          </PieChart>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-xs text-gray-400">เอกสาร</p>
            <p className="text-base font-bold text-gray-800">{total}</p>
            <p className="text-[10px] text-gray-400">ฉบับ</p>
          </div>
        </div>
        <div className="flex-1 space-y-1.5 text-xs">
          {documentStatusChart.map((d, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ background: d.color }} />
                <span className="max-w-[90px] truncate text-gray-500">{d.name}</span>
              </div>
              <span className="font-semibold text-gray-700">{d.value} ฉบับ</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function UnapprovedDocsCard() {
  const [month, setMonth] = useState(5);
  const [year, setYear] = useState(2569);
  return (
    <Card>
      <CardHeader title="เอกสารที่ยังไม่ได้รับการอนุมัติ" sub="(ข้อมูลตัวอย่าง)"
        rightNode={<MonthYearSel month={month} year={year} onMonth={setMonth} onYear={setYear} />} />
      <div className="mb-4 grid grid-cols-3 gap-2">
        {[
          { label: 'ไม่',         value: 12, color: '#ef4444' },
          { label: 'งาน',         value: 8,  color: '#f97316' },
          { label: 'เดือนถัดไป', value: 4,  color: '#8b5cf6' },
        ].map((it) => (
          <div key={it.label} className="rounded-lg bg-gray-50 p-2 text-center">
            <p className="text-2xl font-bold" style={{ color: it.color }}>{it.value}</p>
            <p className="mt-0.5 text-[10px] text-gray-400">{it.label}<br />ฉบับ</p>
          </div>
        ))}
      </div>
      <div className="space-y-2 text-xs">
        {[
          { label: 'เปลี่ยนการทำงาน', count: 0, color: '#94a3b8' },
          { label: 'เปลี่ยนโครง',       count: 1, color: '#3b82f6' },
          { label: 'เปลี่ยนตำแหน่ง',   count: 0, color: '#94a3b8' },
        ].map((it) => (
          <div key={it.label} className="flex items-center justify-between text-gray-500">
            <span>{it.label}</span>
            <span className="font-bold" style={{ color: it.count ? it.color : '#94a3b8' }}>{it.count} ฉบับ</span>
          </div>
        ))}
      </div>
      <div className="mt-3 border-t border-gray-100 pt-3">
        <p className="mb-2 text-xs font-semibold text-gray-600">เอกสารลาบาน</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-500">
          {[
            ['ลาพักร้อน', 5], ['สาขาที่ไม่ผ่านค่า', 5],
            ['วันหยุด', 366], ['สาขาที่ไม่ผ่าน', 3],
            ['เอกสาร', 23], ['สาขาต่างๆ', 3],
            ['ลาออก', 33], ['สาขาต่างๆอีกทั้ง', 1],
          ].map(([k, v]) => (
            <div key={String(k)} className="flex justify-between">
              <span className="truncate">{k}</span>
              <span className="ml-1 font-medium text-gray-700">{v} ฉบับ</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function TaxCard() {
  const [month, setMonth] = useState(5);
  const [year, setYear] = useState(2569);
  return (
    <Card>
      <CardHeader title="ภาษี" sub="(ข้อมูลตัวอย่าง)"
        rightNode={<MonthYearSel month={month} year={year} onMonth={setMonth} onYear={setYear} />} />
      <div className="space-y-3">
        {[
          { label: 'ภาษี ภงด.1',   sub: 'ประจำเดือน พ.ย.', value: '88,958.37 บาท' },
          { label: 'ภาษี ภงด.3',   sub: 'ประจำเดือน พ.ย.', value: '7,041.91 บาท' },
          { label: 'ภาษี ภงด.1ก', sub: 'ประจำปี 2568',     value: '885,699.26 บาท' },
        ].map((it, i) => (
          <div key={i} className="border-b border-gray-100 pb-2 last:border-0">
            <p className="text-xs text-gray-500">{it.label}</p>
            <p className="text-[10px] text-gray-400">{it.sub}</p>
            <p className="mt-0.5 text-sm font-bold text-blue-500">{it.value}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function SocialSecCard() {
  const [month, setMonth] = useState(5);
  const [year, setYear] = useState(2569);
  return (
    <Card>
      <CardHeader title="เงินสมทบประกันสังคม" sub="(ข้อมูลตัวอย่าง)"
        rightNode={<MonthYearSel month={month} year={year} onMonth={setMonth} onYear={setYear} />} />
      <div className="space-y-3">
        {[
          { label: 'เงินสมทบประกันสังคม', sub: 'ประจำเดือน พ.ย.', value: '75,000.00 บาท' },
          { label: 'เงินสมทบประกันสังคม', sub: 'ประจำปี 2568',     value: '651,750.00 บาท' },
        ].map((it, i) => (
          <div key={i} className="border-b border-gray-100 pb-2 last:border-0">
            <p className="text-xs text-gray-500">{it.label}</p>
            <p className="text-[10px] text-gray-400">{it.sub}</p>
            <p className="mt-0.5 text-sm font-bold text-blue-500">{it.value}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function LeaveTypeCard() {
  const [month, setMonth] = useState(5);
  const [year, setYear] = useState(2569);
  return (
    <Card>
      <CardHeader title="ประเภทการลงเวลา" sub="(ข้อมูลตัวอย่าง)"
        rightNode={<MonthYearSel month={month} year={year} onMonth={setMonth} onYear={setYear} />} />
      <div className="flex flex-col items-center">
        <div className="relative">
          <PieChart width={120} height={120}>
            <Pie data={leaveTypePctChart} cx={55} cy={55} innerRadius={35} outerRadius={52} dataKey="value" strokeWidth={0} animationDuration={800}>
              {leaveTypePctChart.map((d, i) => <Cell key={i} fill={d.color} />)}
            </Pie>
            <Tooltip content={<RTooltip />} />
          </PieChart>
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <p className="text-lg font-bold text-gray-700">100%</p>
          </div>
        </div>
        <div className="mt-2 w-full space-y-1 text-xs">
          {leaveTypePctChart.map((d, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ background: d.color }} />
                <span className="text-gray-500">{d.name}</span>
              </div>
              <span className="font-semibold text-gray-700">{d.value} %</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function AttendanceCondCard() {
  const [month, setMonth] = useState(5);
  const [year, setYear] = useState(2569);
  return (
    <Card>
      <CardHeader title="การลงเวลาตามเงื่อนไข" sub="(ข้อมูลตัวอย่าง)"
        rightNode={<MonthYearSel month={month} year={year} onMonth={setMonth} onYear={setYear} />} />
      <div className="mb-2 flex flex-col items-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border-8 border-blue-400 bg-blue-50">
          <div className="text-center">
            <p className="text-xs font-bold text-gray-700">จำนวน</p>
            <p className="text-base font-bold text-blue-600">9,958</p>
            <p className="text-[10px] text-gray-400">ครั้ง</p>
          </div>
        </div>
      </div>
      <div className="space-y-1 text-xs">
        {attendanceConditionData.map((it, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ background: it.color }} />
              <span className="text-gray-500">{it.name}</span>
            </div>
            <span className="font-semibold text-gray-700">{it.value.toLocaleString()} ครั้ง</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function DashboardPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="space-y-4 bg-gray-50 p-5" aria-hidden="true">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="h-[302px] rounded-xl border border-gray-200 bg-white" />
          <div className="h-[302px] rounded-xl border border-gray-200 bg-white" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="h-[212px] rounded-xl border border-gray-200 bg-white" />
          <div className="h-[212px] rounded-xl border border-gray-200 bg-white" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 bg-gray-50 p-5">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SalaryHistoryCard />
        <AgeDistCard />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <EmpTypeCard />
        <NationalityCard />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <BranchSalaryCard />
        <InOutCard />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <SalaryCard />
        <DocumentsAllCard />
        <UnapprovedDocsCard />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <TaxCard />
        <SocialSecCard />
        <LeaveTypeCard />
        <AttendanceCondCard />
      </div>
    </div>
  );
}


// ─── Employee list ────────────────────────────────────────────────────────────

const STATUS_TABS = [
  { key: 'all',       label: 'ทั้งหมด'       },
  { key: 'active',    label: 'ปัจจุบัน'      },
  { key: 'trial',     label: 'ทดลองงาน'     },
  { key: 'leave',     label: 'ลาออก'         },
  { key: 'contract',  label: 'สิ้นสุดสัญญา' },
];

const EMP_STATUS_COLOR: Record<Employee['status'], string> = {
  ปกติ:         'green',
  ลาพักร้อน:   'indigo',
  ลาออก:       'rose',
  ทดลองงาน:   'amber',
  สิ้นสุดสัญญา: 'slate',
};

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

function EmployeeListPage({ onAdd }: { onAdd: () => void }) {
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [today, setToday] = useState<Date | null>(null);

  useEffect(() => {
    setToday(new Date());
  }, []);

  const filtered = employees.filter((e) => {
    const q = search.toLowerCase();
    const matchSearch = !q || e.name.toLowerCase().includes(q) || e.code.includes(q) || e.department.toLowerCase().includes(q);
    const matchTab =
      tab === 'all'      ? true :
      tab === 'active'   ? e.status === 'ปกติ' :
      tab === 'trial'    ? e.status === 'ทดลองงาน' :
      tab === 'leave'    ? e.status === 'ลาออก' :
      tab === 'contract' ? e.status === 'สิ้นสุดสัญญา' : true;
    return matchSearch && matchTab;
  });

  const PER_PAGE = 10;
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const rows = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const countFor = (key: string) => {
    if (key === 'all') return employees.length;
    if (key === 'active') return employees.filter((e) => e.status === 'ปกติ').length;
    if (key === 'trial') return employees.filter((e) => e.status === 'ทดลองงาน').length;
    if (key === 'leave') return employees.filter((e) => e.status === 'ลาออก').length;
    if (key === 'contract') return employees.filter((e) => e.status === 'สิ้นสุดสัญญา').length;
    return 0;
  };

  const toggle = (id: string) => setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);
  const toggleAll = () => setSelected(selected.length === rows.length ? [] : rows.map((e) => e.id));

  return (
    <div className="flex min-h-full flex-col bg-white">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 pb-0 pt-5">
        <div>
          <h1 className="text-lg font-bold text-gray-800">บริหารข้อมูลพนักงาน</h1>
          <p className="mt-0.5 text-xs text-gray-400">จัดการประวัติ สถานะ และข้อมูลการจ้างงานของพนักงาน</p>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="flex h-9 items-center gap-2 rounded-lg bg-gray-950 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800"
        >
          <PlusIcon className="h-4 w-4" />
          เพิ่มพนักงาน
        </button>
      </div>

      {/* Tabs */}
      <div className="mt-3 flex items-center gap-0 border-b border-gray-200 px-6">
        {STATUS_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setPage(1); }}
            className={`flex items-center gap-1.5 border-b-2 -mb-px px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors ${
              tab === t.key ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
            {countFor(t.key) > 0 && (
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${tab === t.key ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-500'}`}>
                {countFor(t.key)}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 px-6 py-3">
        <div className="relative">
          <svg className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="ค้นหาพนักงาน..."
            className="w-52 rounded-lg border border-gray-200 bg-gray-50 py-1.5 pl-8 pr-3 text-sm text-gray-700 placeholder:text-gray-400 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <span className="text-sm font-light text-gray-400">{filtered.length} รายการ</span>
        <div className="ml-auto flex items-center gap-2">
          {selected.length > 0 && (
            <button className="flex items-center gap-1.5 rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50">
              <TrashIcon className="h-3.5 w-3.5" />ลบ ({selected.length})
            </button>
          )}
          <button className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50">
            <DownloadIcon className="h-3.5 w-3.5" />ดูข้อมูล
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/60">
              <th className="w-10 px-4 py-3">
                <input type="checkbox" checked={selected.length === rows.length && rows.length > 0} onChange={toggleAll} className="rounded border-gray-300 accent-primary" />
              </th>
              {['ชื่อ', 'รหัส', 'ตำแหน่ง', 'สังกัด', 'กะการทำงาน', 'วันที่เริ่มงาน', 'ประเภท', 'สถานะ', ''].map((col) => (
                <th key={col} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((emp) => (
              <tr key={emp.id} onClick={() => toggle(emp.id)} className={`cursor-pointer border-b border-gray-100 transition-colors ${selected.includes(emp.id) ? 'bg-indigo-50/40' : 'hover:bg-gray-50/50'}`}>
                <td className="px-4 py-3">
                  <input type="checkbox" checked={selected.includes(emp.id)} onChange={() => toggle(emp.id)} onClick={(e) => e.stopPropagation()} className="rounded border-gray-300 accent-primary" />
                </td>
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
                  <HrBadge tone={EMP_STATUS_COLOR[emp.status] as any}>{emp.status}</HrBadge>
                </td>
                <td className="px-4 py-3">
                  <button className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700" onClick={(e) => e.stopPropagation()}>
                    <EditIcon className="h-4 w-4" />
                  </button>
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

    </div>
  );
}

// ─── Add Employee modal (multi-step) ──────────────────────────────────────────

const ADD_STEPS = [
  { id: 1, label: 'ข้อมูลจำเป็น', description: 'ระบุตัวตนและช่องทางติดต่อ' },
  { id: 2, label: 'การจ้างงานและสิทธิ์', description: 'สังกัด วันเริ่มงาน และบัญชี G-HUB' },
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
  createAccount: boolean;
  sendInvite: boolean;
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
  createAccount: true,
  sendInvite: false,
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
            <p className="text-xs text-slate-500">สร้างประวัติและเตรียมบัญชี G-HUB ในขั้นตอนเดียว</p>
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
        aria-invalid={error}
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
              hint="ระบบจะใช้รหัสนี้เป็น username หากเปิดบัญชี G-HUB"
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
            hint="หากไม่ระบุอีเมล ระบบจะยังไม่ส่งคำเชิญตั้งรหัสผ่าน"
            error={errors.personalEmail}
          >
            <TextInput
              value={draft.personalEmail}
              onChange={(value) => {
                update('personalEmail', value);
                update('sendInvite', Boolean(value.trim()));
              }}
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
          selected ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
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

      <section className="grid gap-6 lg:grid-cols-[180px_minmax(0,1fr)]">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">บัญชี G-HUB</h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">สิทธิ์เริ่มต้นมีเฉพาะ HR Self-service ของตนเอง</p>
        </div>
        <div className="border-y border-slate-100 py-1">
          <ReviewRow
            label="ชื่อผู้ใช้"
            value={draft.createAccount ? draft.employeeCode : 'ยังไม่สร้างบัญชี'}
          />
          <ReviewRow
            label="การตั้งรหัสผ่าน"
            value={
              draft.createAccount && draft.sendInvite && draft.personalEmail.trim()
                ? `ส่งคำเชิญไปยัง ${draft.personalEmail.trim()}`
                : 'รอตั้งรหัสผ่านภายหลัง'
            }
          />
        </div>
      </section>
    </div>
  );
}

function AccessToggle({
  checked,
  onChange,
  title,
  description,
  disabled = false,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  title: string;
  description: string;
  disabled?: boolean;
}) {
  return (
    <div className={`flex items-start justify-between gap-5 border-b border-slate-100 py-4 last:border-b-0 ${
      disabled ? 'opacity-60' : ''
    }`}>
      <div>
        <p className="text-sm font-medium text-slate-900">{title}</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-6 w-11 flex-shrink-0 rounded-full transition disabled:cursor-not-allowed ${
          checked ? 'bg-indigo-600' : 'bg-slate-300'
        }`}
      >
        <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0.5'
        }`} />
      </button>
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

      <section className="grid gap-6 lg:grid-cols-[180px_minmax(0,1fr)]">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">บัญชีและการเข้าถึง</h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">ระบบสร้างบัญชีจากประวัติพนักงานโดยอัตโนมัติ</p>
        </div>
        <div className="border-y border-slate-100">
          <AccessToggle
            checked={draft.createAccount}
            onChange={(value) => update('createAccount', value)}
            title="สร้างบัญชี G-HUB ให้พนักงาน"
            description={`ใช้ ${draft.employeeCode || 'รหัสพนักงาน'} เป็น username และให้สิทธิ์เริ่มต้นเฉพาะ HR Self-service`}
          />
          <AccessToggle
            checked={draft.sendInvite && Boolean(draft.personalEmail.trim())}
            onChange={(value) => update('sendInvite', value)}
            title="ส่งคำเชิญให้ตั้งรหัสผ่าน"
            description={
              draft.personalEmail.trim()
                ? `ส่งลิงก์ตั้งรหัสผ่านไปยัง ${draft.personalEmail.trim()} โดยพนักงานเป็นผู้กำหนดรหัสผ่านด้วยตนเอง`
                : 'ยังไม่มีอีเมล บัญชีจะอยู่ในสถานะรอตั้งรหัสผ่าน และ HR สามารถเพิ่มอีเมลหรือออกลิงก์ใช้งานครั้งเดียวภายหลังได้'
            }
            disabled={!draft.createAccount || !draft.personalEmail.trim()}
          />
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
            <span className="text-sm text-slate-600">บัญชี G-HUB</span>
            <span className="text-xs font-semibold text-emerald-600">
              {draft.createAccount
                ? draft.sendInvite && draft.personalEmail.trim()
                  ? 'รอพนักงานเปิดใช้งาน'
                  : 'สร้างแล้ว รอตั้งรหัสผ่าน'
                : 'ยังไม่เปิด'}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-slate-100 py-3">
            <span className="text-sm text-slate-600">คำเชิญตั้งรหัสผ่าน</span>
            <span className="text-xs font-semibold text-indigo-600">
              {draft.createAccount && draft.sendInvite && draft.personalEmail.trim()
                ? 'เตรียมส่งแล้ว'
                : 'ยังไม่ได้ส่ง'}
            </span>
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

// ─── Generic table workbench ─────────────────────────────────────────────────

type Col = { key: string; label: string; render?: (val: string, row: Record<string, string>) => React.ReactNode };

function GenericTable({ title, description, columns, rows }: { title: string; description: string; columns: Col[]; rows: Record<string, string>[] }) {
  const filtered = rows;
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
      <main className="min-w-0 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <HrInput placeholder={`ค้นหา ${title}`} />
          <HrSelectMock label="Filter" value="ทั้งหมด" />
          <HrCheckbox label="เฉพาะที่เปิดใช้งาน" checked />
        </div>
        <section className="rounded-[24px] bg-white p-3 shadow-sm shadow-slate-200/80">
          <div className="flex flex-wrap items-center justify-between gap-3 px-2 py-2">
            <div>
              <h2 className="text-base font-semibold text-slate-950">{title}</h2>
              <p className="text-xs font-light text-slate-500">{description}</p>
            </div>
            <HrButton variant="primary"><PlusIcon className="h-4 w-4" />เพิ่มใหม่</HrButton>
          </div>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold text-slate-400">
                  {columns.map((c) => <th key={c.key} className="bg-slate-50 px-4 py-3 first:rounded-l-2xl last:rounded-r-2xl">{c.label}</th>)}
                  <th className="bg-slate-50 px-4 py-3 rounded-r-2xl">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, i) => (
                  <tr key={i} className="transition hover:bg-indigo-50/50">
                    {columns.map((c) => (
                      <td key={c.key} className="px-4 py-3 text-slate-700">
                        {c.render ? c.render(row[c.key] ?? '', row) : row[c.key]}
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <HrButton variant="ghost" className="min-h-8 px-2"><EditIcon className="h-4 w-4" /></HrButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
      <aside>
        <section className="rounded-[24px] bg-white p-4 shadow-sm shadow-slate-200/80">
          <h3 className="text-sm font-semibold text-slate-950">สรุป</h3>
          <p className="mt-2 text-2xl font-bold text-slate-950">{filtered.length}</p>
          <p className="text-xs text-slate-400">รายการทั้งหมด</p>
        </section>
      </aside>
    </div>
  );
}

function statusBadge(v: string) {
  const active = v === 'เปิดใช้งาน' || v === 'เปิดรับ' || v === 'เผยแพร่' || v === 'ใช้งาน';
  return <HrBadge tone={active ? 'green' : 'slate'}>{v}</HrBadge>;
}

// ─── Specific tables ──────────────────────────────────────────────────────────

function PositionTable() {
  return (
    <GenericTable
      title="โครงสร้างตำแหน่ง"
      description="กำหนดตำแหน่งและระดับในองค์กร"
      columns={[
        { key: 'code',   label: 'รหัส' },
        { key: 'name',   label: 'ชื่อตำแหน่ง' },
        { key: 'nameEn', label: 'ชื่อ (ENG)' },
        { key: 'level',  label: 'ระดับ', render: (v) => <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] text-indigo-600">{v}</span> },
        { key: 'status', label: 'สถานะ', render: statusBadge },
      ]}
      rows={positions.map((p) => ({ code: p.code, name: p.name, nameEn: p.nameEn, level: p.level, status: p.active ? 'ใช้งาน' : 'ปิดใช้งาน' }))}
    />
  );
}

function EmployeeTypeTable() {
  return (
    <GenericTable
      title="กลุ่มประเภทพนักงาน"
      description="ข้อมูลตั้งต้นที่ HR ใช้ซ้ำในหลาย workflow"
      columns={[
        { key: 'code',   label: 'รหัส' },
        { key: 'name',   label: 'ชื่อประเภทพนักงาน' },
        { key: 'nameEn', label: 'ชื่อ (ENG)' },
        { key: 'tax',    label: 'ภาษี' },
        { key: 'count',  label: 'จำนวน' },
        { key: 'status', label: 'สถานะ', render: statusBadge },
      ]}
      rows={employeeTypes.map((t) => ({ code: t.code, name: t.nameTh, nameEn: t.nameEn, tax: t.tax, count: `${t.headcount} คน`, status: t.active ? 'ใช้งาน' : 'ปิดใช้งาน' }))}
    />
  );
}

function WorkShiftTable() {
  return (
    <GenericTable
      title="กะการทำงาน"
      description="กำหนดรอบเวลาและรูปแบบการทำงาน"
      columns={[
        { key: 'code',  label: 'รหัส' },
        { key: 'name',  label: 'ชื่อกะการทำงาน' },
        { key: 'type',  label: 'ประเภทกะ' },
        { key: 'time',  label: 'เวลา' },
        { key: 'break', label: 'พัก (นาที)' },
        { key: 'status', label: 'สถานะ', render: statusBadge },
      ]}
      rows={workShifts.map((w) => ({ code: w.code, name: w.name, type: w.type, time: w.time, break: String(w.breakMin), status: w.active ? 'ใช้งาน' : 'ปิดใช้งาน' }))}
    />
  );
}

// ─── Org tree ────────────────────────────────────────────────────────────────

function OrgTreePage({ type }: { type: 'organization' | 'position' }) {
  const tree = type === 'organization' ? organizationTree : positionTree;
  const title = type === 'organization' ? 'โครงสร้างองค์กร' : 'โครงสร้างตำแหน่ง';
  const selected = tree[0]?.children?.[0] ?? tree[0];

  return (
    <div className="grid min-h-[calc(100vh-176px)] gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      <main className="min-w-0 overflow-hidden rounded-[26px] bg-white shadow-sm shadow-slate-200/80">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-slate-950">{title}</h2>
            <p className="text-xs font-light text-slate-500">Tree canvas สำหรับจัดการลำดับชั้น</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <HrInput placeholder="ค้นหา node" />
            <HrButton><DownloadIcon className="h-4 w-4" />Export</HrButton>
          </div>
        </div>
        <div className="relative min-h-[600px] overflow-auto bg-[linear-gradient(#f8fafc_1px,transparent_1px),linear-gradient(90deg,#f8fafc_1px,transparent_1px)] bg-[size:28px_28px] px-8 py-8">
          <div className="mb-7 inline-flex rounded-[18px] bg-slate-950 px-6 py-4 text-white shadow-[0_18px_38px_rgba(15,23,42,0.16)]">
            <div>
              <p className="text-xs font-medium text-slate-300">{title}</p>
              <p className="mt-1 text-lg font-semibold">แผนผังหลัก</p>
            </div>
          </div>
          <div className="min-w-[760px]">
            {tree.map((node) => <TreeBranch key={node.id} node={node} />)}
          </div>
        </div>
      </main>

      <aside className="space-y-4">
        <section className="rounded-[26px] bg-slate-950 p-4 text-white shadow-sm">
          <p className="text-xs font-medium text-indigo-200">Selected node</p>
          <h3 className="mt-2 text-lg font-semibold">{selected?.label}</h3>
          <p className="mt-1 text-sm font-light text-slate-300">{selected?.type} · {selected?.code}</p>
          <div className="mt-4 grid gap-2">
            <HrButton variant="secondary" className="justify-start bg-white/10 text-white shadow-none hover:bg-white/15 hover:text-white">
              <PlusIcon className="h-4 w-4" />เพิ่ม node ใต้รายการนี้
            </HrButton>
            <HrButton variant="secondary" className="justify-start bg-white/10 text-white shadow-none hover:bg-white/15 hover:text-white">
              <EditIcon className="h-4 w-4" />แก้ไขรายละเอียด
            </HrButton>
          </div>
        </section>
        <section className="rounded-[26px] bg-white p-4 shadow-sm shadow-slate-200/80">
          <h3 className="text-sm font-semibold text-slate-950">Node properties</h3>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div><dt className="text-xs text-slate-400">สถานะ</dt><dd className="mt-1"><HrBadge tone="green">เปิดใช้งาน</HrBadge></dd></div>
            <div><dt className="text-xs text-slate-400">Children</dt><dd className="mt-1 text-sm font-semibold text-slate-900">{selected?.children?.length ?? 0}</dd></div>
            <div><dt className="text-xs text-slate-400">Code</dt><dd className="mt-1 text-sm font-semibold text-slate-900">{selected?.code}</dd></div>
            <div><dt className="text-xs text-slate-400">Data</dt><dd className="mt-1"><HrBadge>Mock</HrBadge></dd></div>
          </dl>
        </section>
      </aside>
    </div>
  );
}

function TreeBranch({ node, level = 0 }: { node: TreeNode; level?: number }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="relative">
      <div className="relative mb-3 flex items-center">
        {level > 0 && (
          <>
            <span className="absolute -left-10 top-1/2 h-px w-9 bg-slate-300" />
            <span className="absolute -left-10 -top-3 h-[calc(50%+12px)] w-px bg-slate-300" />
          </>
        )}
        <button type="button" onClick={() => setOpen((o) => !o)} className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm shadow-slate-200/80">
          {node.children?.length ? (open ? '⌄' : '›') : '·'}
        </button>
        <div className="group flex min-w-[220px] max-w-[280px] items-center justify-between gap-3 rounded-[18px] bg-white px-4 py-3 shadow-[0_10px_24px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/70 transition hover:-translate-y-0.5 hover:ring-indigo-200">
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-slate-400">{node.type}</p>
            <p className="mt-0.5 truncate text-sm font-semibold text-slate-950">{node.label}</p>
            <p className="mt-0.5 truncate text-xs font-light text-slate-500">{node.code}</p>
          </div>
        </div>
        <div className="ml-2 flex items-center gap-1">
          <button type="button" className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-sky-700 shadow-sm">
            <PlusIcon className="h-4 w-4" />
          </button>
          <button type="button" className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-100 text-teal-700 shadow-sm">
            <EditIcon className="h-4 w-4" />
          </button>
          {level > 1 && (
            <button type="button" className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 text-rose-700 shadow-sm">
              <TrashIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      {open && node.children?.length ? (
        <div className="relative ml-20 pl-10">
          <span className="absolute left-0 top-[-12px] h-[calc(100%-16px)] w-px bg-slate-300" />
          {node.children.map((child) => <TreeBranch key={child.id} node={child} level={level + 1} />)}
        </div>
      ) : null}
    </div>
  );
}

// ─── Reports ─────────────────────────────────────────────────────────────────

function ReportsPage({ pathname }: { pathname: string }) {
  const reportGroup = hrMenuGroups.find((g) => g.href === '/humansource/reports');
  const categories = reportGroup?.items ?? [];
  const activeCategory = categories.find((c) => pathname === c.href || c.children?.some((ch) => pathname === ch.href)) ?? categories[0];
  const reports = activeCategory?.children?.length ? activeCategory.children : [];
  const activeReport = reports.find((r) => r.href === pathname) ?? reports[0];

  return (
    <div className="grid min-h-[calc(100vh-176px)] gap-4 xl:grid-cols-[260px_minmax(0,1fr)_340px]">
      <aside className="min-h-0 rounded-[24px] bg-white p-2 shadow-sm shadow-slate-200/80">
        <div className="px-3 py-2">
          <p className="text-xs font-medium uppercase text-indigo-500">Report groups</p>
          <h2 className="mt-1 text-base font-semibold text-slate-950">ศูนย์รายงาน</h2>
        </div>
        <nav className="mt-2 max-h-[calc(100vh-250px)] space-y-1 overflow-y-auto pr-1">
          {categories.map((cat) => {
            const active = activeCategory?.href === cat.href;
            return (
              <a key={cat.href} href={cat.href} className={`flex items-center justify-between rounded-2xl px-3 py-2.5 text-sm transition ${active ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'}`}>
                <span className="min-w-0 truncate font-medium">{cat.title}</span>
                <span className={active ? 'text-xs text-white/60' : 'text-xs text-slate-400'}>{cat.children?.length ?? 0}</span>
              </a>
            );
          })}
        </nav>
      </aside>

      <main className="min-w-0 rounded-[24px] bg-white p-3 shadow-sm shadow-slate-200/80">
        <div className="flex flex-wrap items-center justify-between gap-3 px-2 py-2">
          <h2 className="text-base font-semibold text-slate-950">{activeCategory?.title}</h2>
          <HrInput placeholder="Search report" />
        </div>
        <div className="mt-3 overflow-hidden rounded-2xl bg-slate-50">
          {reports.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-400">ยังไม่มีรายงานในกลุ่มนี้</div>
          ) : reports.map((r, i) => {
            const active = activeReport?.href === r.href;
            return (
              <a key={r.href} href={r.href} className={`grid gap-3 px-4 py-3 text-sm transition md:grid-cols-[38px_minmax(0,1fr)_120px] ${active ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-white'}`}>
                <span className={active ? 'text-xs font-semibold text-indigo-500' : 'text-xs font-medium text-slate-400'}>{String(i + 1).padStart(2, '0')}</span>
                <span className="min-w-0">
                  <span className="block truncate font-medium">{r.title}</span>
                  <span className="mt-0.5 block truncate text-xs font-light text-slate-500">{r.description}</span>
                </span>
                <span className="text-xs font-medium text-slate-400">Preview</span>
              </a>
            );
          })}
        </div>
      </main>

      <aside className="space-y-4">
        {activeReport && (
          <section className="rounded-[24px] bg-slate-950 p-4 text-white shadow-sm">
            <p className="text-xs font-medium text-indigo-200">Selected report</p>
            <h3 className="mt-2 text-lg font-semibold">{activeReport.title}</h3>
            <p className="mt-2 text-sm font-light leading-6 text-slate-300">{activeReport.description}</p>
            <div className="mt-4 grid gap-2">
              <HrButton variant="secondary" className="justify-start bg-white/10 text-white shadow-none hover:bg-white/15 hover:text-white">
                <DownloadIcon className="h-4 w-4" />Export
              </HrButton>
            </div>
          </section>
        )}
        <section className="rounded-[24px] bg-white p-4 shadow-sm shadow-slate-200/80">
          <h3 className="text-sm font-semibold text-slate-950">Report filters</h3>
          <div className="mt-3 space-y-2">
            <HrDatePickerMock label="ช่วงวันที่" />
            <HrSelectMock label="สาขา" value="ทั้งหมด" />
            <HrSelectMock label="แผนก" value="ทั้งหมด" />
            <HrCheckbox label="แสดงเฉพาะพนักงาน Active" checked />
          </div>
        </section>
      </aside>
    </div>
  );
}

// ─── Generic fallback ─────────────────────────────────────────────────────────

function GenericPage({ title, description, section }: { title: string; description: string; section: string }) {
  const related = allHrMenuItems.filter((item) => item.href.includes(`/humansource/${section}`)).slice(0, 8);
  return (
    <div className="grid gap-4 xl:grid-cols-[240px_minmax(0,1fr)_340px]">
      <aside className="hidden xl:block">
        <nav className="sticky top-4 space-y-1 rounded-[24px] bg-white p-2 shadow-sm shadow-slate-200/80">
          {related.map((item) => (
            <a key={item.href} href={item.href} className="block rounded-2xl px-3 py-2 text-xs font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-950">{item.title}</a>
          ))}
        </nav>
      </aside>
      <main className="min-w-0 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <HrInput placeholder={`ค้นหา ${title}`} />
          <HrSelectMock label="Filter" value="ทั้งหมด" />
          <HrDatePickerMock label="เดือนนี้" />
        </div>
        <section className="rounded-[24px] bg-white p-4 shadow-sm shadow-slate-200/80">
          <h2 className="text-base font-semibold text-slate-950">{title}</h2>
          <p className="mt-1 text-sm font-light leading-6 text-slate-500">{description}</p>
          <div className="mt-4">
            <HrEmptyState title="ยังไม่มีข้อมูลจริงในหน้านี้" description="แสดง shell ที่รองรับงานจริงก่อนเชื่อมต่อ logic และ backend โดยไม่ปล่อยหน้าโล่ง" />
          </div>
        </section>
      </main>
      <aside className="space-y-4">
        <section className="rounded-[24px] bg-white p-4 shadow-sm shadow-slate-200/80">
          <h3 className="text-sm font-semibold text-slate-950">รายการใกล้เคียง</h3>
          <div className="mt-3 space-y-1">
            {related.slice(0, 6).map((item) => (
              <div key={item.href} className="rounded-2xl px-3 py-2 text-sm hover:bg-slate-50">
                <p className="truncate font-medium text-slate-700">{item.title}</p>
                <p className="mt-0.5 truncate text-xs font-light text-slate-400">{item.description}</p>
              </div>
            ))}
          </div>
        </section>
      </aside>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

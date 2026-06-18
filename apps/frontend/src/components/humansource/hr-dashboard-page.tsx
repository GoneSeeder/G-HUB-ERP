'use client';

import React, { useEffect, useState } from 'react';
import {
  Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { cn } from '@/lib/cn';
import { HrCustomSelect } from '@/components/humansource/hr-ui';
import {
  ageDistData,
  attendanceConditionData,
  branchSalaryData,
  documentStatusChart,
  empTypeData,
  inOutData,
  leaveTypePctChart,
  MONTHS_TH,
  nationalityData,
  salaryBaseActualData,
  salaryLineData,
  YEARS_HR,
} from '@/data/humansource/mock';

const fmtCompact = (v: number) => (v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v));

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('hr-card hr-dashboard-card', className)}>{children}</div>
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
      <HrCustomSelect
        className="hr-dashboard-select"
        value={String(month)}
        options={MONTHS_TH.map((m, i) => ({ value: String(i + 1), label: m }))}
        onChange={(value) => onMonth(Number(value))}
        label="เดือน"
      />
      <HrCustomSelect
        className="hr-dashboard-select"
        value={String(year)}
        options={YEARS_HR.map((y) => ({ value: String(y), label: String(y) }))}
        onChange={(value) => onYear(Number(value))}
        label="ปี"
      />
    </div>
  );
}

function YearOnlySel({ year, onYear }: { year: number; onYear: (v: number) => void }) {
  return (
    <HrCustomSelect
      className="hr-dashboard-select"
      value={String(year)}
      options={YEARS_HR.map((y) => ({ value: String(y), label: String(y) }))}
      onChange={(value) => onYear(Number(value))}
      label="ปี"
    />
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
  const [metric, setMetric] = useState('เงินเดือน');
  return (
    <Card>
      <CardHeader title="ประวัติผลการคำนวณเงินเดือน" sub="(ข้อมูลตัวอย่าง)" rightNode={
        <div className="flex items-center gap-1.5">
          <HrCustomSelect
            className="hr-dashboard-select"
            value={metric}
            options={['เงินเดือน', 'จำนวนพนักงาน', 'กลุ่มสังกัด/ตรวจสอบ', 'เบี้ยขยัน', 'การสะสม', 'โอที (ชั่วโมง)', 'โอที (บาท)', 'ลาบาน (ชั่วโมง)']}
            onChange={setMetric}
            label="ตัวชี้วัด"
          />
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
  const [branchMetric, setBranchMetric] = useState('เลือกทั้งหมด');
  return (
    <Card>
      <CardHeader title="เงินเดือนตามสำนักงานสาขา" sub="(ข้อมูลตัวอย่าง)" rightNode={
        <div className="flex items-center gap-1.5">
          <HrCustomSelect
            className="hr-dashboard-select"
            value={branchMetric}
            options={['เลือกทั้งหมด', 'เงินเดือน']}
            onChange={setBranchMetric}
            label="ตัวชี้วัด"
          />
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

export function HrDashboardPage() {
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

// ─── Generic table workbench ─────────────────────────────────────────────────

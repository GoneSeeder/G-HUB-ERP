'use client';

import React, { useEffect, useState } from 'react';
import {
  Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { cn } from '@/lib/cn';
import {
  DownloadIcon,
  EditIcon,
  PlusIcon,
  TrashIcon,
} from '@/components/ui/icons';
import { HrEmployeeListPage } from '@/components/humansource/hr-employee-list-page';
import { HrHomePage } from '@/components/humansource/hr-home-page';
import { HrSettingsPage } from '@/components/humansource/hr-settings-page';
import { HrUnderDevelopmentPage } from '@/components/humansource/hr-under-development-page';
import {
  HrBadge,
  HrButton,
  HrCheckbox,
  HrCustomSelect,
  HrDatePickerMock,
  HrEmptyState,
  HrInput,
  HrSelectMock,
} from '@/components/humansource/hr-ui';
import { allHrMenuItems, findHrPage } from '@/data/humansource/menu';
import {
  ageDistData,
  attendanceConditionData,
  branchSalaryData,
  documentStatusChart,
  empTypeData,
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
  type TreeNode,
} from '@/data/humansource/mock';

// ─── Page router ─────────────────────────────────────────────────────────────

type PageProps = { params: { slug?: string[] } };

export default function HumansourcePage({ params }: PageProps) {
  const pathname = `/humansource/${params.slug?.join('/') ?? 'home'}`;
  const page = findHrPage(pathname);
  const section = params.slug?.[0] ?? 'home';
  const leaf = params.slug?.at(-1) ?? 'home';

  return (
    <div className={`hr-page ${section === 'settings' ? 'flex h-full flex-col' : ''}`}>
      {section === 'home' && <HrHomePage />}
      {section === 'settings' && <HrSettingsPage />}
      {section === 'dashboard' && <DashboardPage />}
      {leaf === 'structure' && <OrgTreePage type="organization" />}
      {leaf === 'position-structure' && <OrgTreePage type="position" />}
      {leaf === 'employee-type' && <EmployeeTypeTable />}
      {leaf === 'work-cycle' && <WorkShiftTable />}
      {leaf === 'employees' && <HrEmployeeListPage />}
      {leaf === 'position-list' && <PositionTable />}
      {section === 'payroll' && <HrUnderDevelopmentPage title="เงินเดือน" />}
      {section === 'reports' && <HrUnderDevelopmentPage title="รายงาน" />}

      {!isSpecialPage(section, leaf) && (
        <GenericPage title={page.title} description={page.description} section={section} />
      )}
    </div>
  );
}

function isSpecialPage(section: string, leaf: string) {
  return (
    section === 'home' ||
    section === 'dashboard' ||
    section === 'settings' ||
    section === 'payroll' ||
    section === 'reports' ||
    ['structure', 'position-structure', 'employee-type', 'work-cycle', 'employees', 'position-list'].includes(leaf)
  );
}

// ─── Page header ──────────────────────────────────────────────────────────────

// ─── Dashboard (base44 clone) ─────────────────────────────────────────────────

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

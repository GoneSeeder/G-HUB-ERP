'use client';

import { useEffect, useRef, useState } from 'react';
import { CalendarIcon, PrintIcon, SearchIcon } from '@/components/ui/icons';
import { DataPanel, PageHeader, PageShell } from '@/components/ui/page-shell';
import { apiFetch } from '@/lib/api';

type ReportBonusCard = {
  id: string;
  bonus: string;
  workDate: string;
  bonusName: string;
  carCode: string;
  busType: string;
  partyCode: string;
  agentCode: string;
  agentName: string;
  guide: string;
  guideName: string;
  province: string;
  adult: number;
  child: number;
  tourLeader: number;
  student: number;
  tourIn: string;
  tourOut: string;
  recorder: string;
  recorderName: string;
  shop: string;
  nation: string;
  comeFrom: string;
  comment: string;
};

type ReportBooking = {
  id: string;
  docDate: string;
  docTime: string;
  docNo: string;
  agentCode: string;
  agentName: string;
  partyCode: string;
  nation: string;
  arriveDate: string;
  departDate: string;
  guideCode: string;
  guideName: string;
  telGuide: string;
  pax: number;
  carCode: string;
  shop: string;
  bookRemark: string;
  telDriver: string;
  dateBookJw: string;
  timeBookJw: string;
  status: boolean;
  upload: boolean;
};

type ReportType = 'bonus-card' | 'booking-shop';
type ReportRow = ReportBonusCard | ReportBooking;

type MeResponse = {
  username: string;
  name: string;
  roles: string[];
};

const reportOptions: Array<{
  value: ReportType;
  label: string;
  description: string;
}> = [
  {
    value: 'bonus-card',
    label: 'รายงานโบนัสการ์ด',
    description: 'ข้อมูลจาก Bonus Card',
  },
  {
    value: 'booking-shop',
    label: 'รายงานบันทึกการจองเข้าร้าน',
    description: 'ข้อมูลจาก Booking',
  },
];

async function loadReportUserName() {
  const me = await apiFetch<MeResponse>('/api/auth/me');
  return me.name || me.username || '-';
}

export default function ReportPage() {
  const today = getTodayLocalDate();
  const [reportType, setReportType] = useState<ReportType>('bonus-card');
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [reportTypeOpen, setReportTypeOpen] = useState(false);
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentUserName, setCurrentUserName] = useState('');
  const [reportUserName, setReportUserName] = useState('');
  const selectedReport = reportOptions.find((option) => option.value === reportType) ?? reportOptions[0];
  const selectedReportIconClass =
    selectedReport.value === 'bonus-card' ? 'bg-orange-50 text-orange-500' : 'bg-blue-50 text-[#1478ff]';
  const selectedReportTitleClass =
    selectedReport.value === 'bonus-card' ? 'text-slate-950' : 'text-[#0752d6]';

  useEffect(() => {
    loadReportUserName()
      .then(setCurrentUserName)
      .catch(() => setCurrentUserName(''));
  }, []);

  const showReport = async () => {
    setLoading(true);
    setError('');
    setHasSearched(true);
    try {
      let displayUserName = currentUserName;
      if (!displayUserName) {
        displayUserName = await loadReportUserName().catch(() => '-');
        setCurrentUserName(displayUserName === '-' ? '' : displayUserName);
      }
      setReportUserName(displayUserName);

      const endpoint =
        reportType === 'bonus-card'
          ? '/api/bonus-cards'
          : '/api/bookings';
      const data = await apiFetch<ReportRow[]>(
        `${endpoint}?from=${encodeURIComponent(fromDate)}&to=${encodeURIComponent(toDate)}`,
      );
      setRows(data);
    } catch (reportError) {
      setRows([]);
      setError(reportError instanceof Error ? reportError.message : 'Unable to load report data.');
    } finally {
      setLoading(false);
    }
  };

  const printReport = () => {
    document.body.classList.add('report-print');
    window.print();
    window.setTimeout(() => document.body.classList.remove('report-print'), 250);
  };

  return (
    <PageShell className="h-full !max-w-[1340px] gap-6 overflow-visible py-6">
      <PageHeader
        eyebrow="Document / Reports"
        title="พิมพ์รายงาน"
        description="รายงานเอกสารและข้อมูลปฏิบัติงานประจำวัน"
        actions={
          <button
            type="button"
            onClick={printReport}
            disabled={!hasSearched || loading || rows.length === 0}
            className="toolbar-btn-primary h-9 px-4"
          >
            <PrintIcon className="erp-action-icon" />
            Print
          </button>
        }
      />

      <div className="no-print erp-controls-enter relative z-30 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_10px_28px_rgba(15,23,42,0.05)]">
        <div className="flex flex-nowrap items-end gap-5 max-lg:flex-wrap">
        <label className="block w-[320px] max-w-full space-y-2">
          <span className="text-[10px] font-medium uppercase text-slate-500">ประเภทรายงาน</span>
          <div className="relative">
            <button
              type="button"
              onClick={() => setReportTypeOpen((value) => !value)}
              className="flex h-[62px] w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 text-left shadow-sm transition hover:border-[#9bc0ff] hover:bg-white focus:border-[#1478ff] focus:outline-none focus:ring-4 focus:ring-[rgba(20,120,255,0.14)]"
            >
              <span className="flex min-w-0 items-center gap-3">
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${selectedReportIconClass}`}>
                  <ReportCardIcon className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className={`block truncate text-sm font-semibold ${selectedReportTitleClass}`}>
                    {selectedReport.label}
                  </span>
                  <span className="mt-0.5 block truncate text-xs font-light text-slate-500">
                    {selectedReport.description}
                  </span>
                </span>
              </span>
              <ChevronDownIcon className={reportTypeOpen ? 'rotate-180 transition-transform' : 'transition-transform'} />
            </button>
            {reportTypeOpen ? (
              <div className="absolute left-0 top-[70px] z-50 w-full overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-[0_18px_42px_rgba(15,23,42,0.16)]">
                {reportOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition hover:bg-[#0752d6]/[0.06] ${
                      option.value === reportType ? 'bg-[#0752d6]/[0.08]' : ''
                    }`}
                    onClick={() => {
                      setReportType(option.value);
                      setReportTypeOpen(false);
                      setRows([]);
                      setHasSearched(false);
                    }}
                  >
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                      option.value === 'bonus-card' ? 'bg-orange-50 text-orange-500' : 'bg-blue-50 text-[#1478ff]'
                    }`}>
                      <ReportCardIcon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={`block truncate text-sm font-semibold ${
                        option.value === reportType ? 'text-[#0752d6]' : 'text-slate-950'
                      }`}>
                        {option.label}
                      </span>
                      <span className="mt-0.5 block truncate text-xs font-light text-slate-500">{option.description}</span>
                    </span>
                    {option.value === reportType ? (
                      <span className="h-1.5 w-1.5 rounded-full bg-[#3157ff]" aria-hidden="true" />
                    ) : null}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </label>

        <ReportDateInput label="Start Date" value={fromDate} onChange={setFromDate} />
        <ReportDateInput label="End Date" value={toDate} onChange={setToDate} />

        <button
          type="button"
          onClick={showReport}
          disabled={loading}
          className="toolbar-btn-primary h-9"
        >
          <SearchIcon className="erp-action-icon" />
          {loading ? 'กำลังโหลด...' : 'แสดงรายงาน'}
        </button>
        </div>
        {hasSearched ? (
          <div className="mt-5 flex items-center gap-2 border-t border-slate-200 pt-4 text-xs font-light text-slate-500">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span>แสดงผลรายงาน:</span>
            <span className="font-semibold text-slate-950">{selectedReport.label}</span>
            <span>•</span>
            <span>{formatReportDisplayDate(fromDate)} - {formatReportDisplayDate(toDate)}</span>
          </div>
        ) : null}
      </div>

      <DataPanel className="erp-content-enter report-panel flex min-h-0 flex-1 flex-col overflow-visible rounded-2xl">
          {loading ? (
            <div className="grid gap-2 p-5">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="h-10 animate-pulse rounded-lg bg-slate-100" />
              ))}
            </div>
          ) : error ? (
            <div className="px-5 py-12 text-center text-sm font-medium text-red-600">{error}</div>
          ) : !hasSearched ? (
            <div className="px-5 py-14 text-center text-sm text-slate-400">
              เลือกช่วงวันที่แล้วกด “แสดงรายงาน” เพื่อดูข้อมูล
            </div>
          ) : rows.length === 0 ? (
            <div className="px-5 py-14 text-center text-sm text-slate-400">ไม่พบข้อมูลรายงานในช่วงวันที่นี้</div>
          ) : (
            <ReportPreview
              rows={rows}
              reportType={reportType}
              userName={reportUserName || currentUserName || '-'}
            />
          )}
      </DataPanel>
    </PageShell>
  );
}

function ReportPreview({
  rows,
  reportType,
  userName,
}: {
  rows: ReportRow[];
  reportType: ReportType;
  userName: string;
}) {
  const printDate = formatReportDisplayDate(getTodayLocalDate());
  const groups =
    reportType === 'bonus-card'
      ? groupRowsByDate(rows as ReportBonusCard[], (row) => row.workDate)
      : groupRowsByDate(rows as ReportBooking[], (row) => row.dateBookJw || row.arriveDate || row.docDate);

  return (
    <div className="report-preview-wrap flex-1 bg-slate-100 p-4">
      <div className={`print-area report-print-stack mx-auto w-full space-y-6 ${reportType === 'bonus-card' ? 'report-print-bonus' : 'report-print-booking'}`}>
        {reportType === 'bonus-card' ? (
          <>
            {(groups as Array<{ date: string; rows: ReportBonusCard[] }>).map((group) => (
              <section key={group.date} className="report-sheet min-h-full rounded-sm border border-slate-200 bg-white p-5 shadow-sm">
                <div className="report-doc-header report-doc-header-bonus">
                  <div className="report-doc-brand">GEI</div>
                  <div className="report-doc-title">รายงานโบนัสการ์ดรายวัน</div>
                  <div className="report-doc-meta">วันที่พิมพ์ {printDate}</div>
                  <div className="report-doc-code">[{userName}]</div>
                  <div className="report-doc-date">รายการของวันที่ : {formatReportDisplayDate(group.date)}</div>
                  <div className="report-doc-page">หน้า : 1</div>
                </div>
                <BonusReportTable rows={group.rows} />
              </section>
            ))}
          </>
        ) : (
          <>
            {(groups as Array<{ date: string; rows: ReportBooking[] }>).map((group) => (
              <section key={group.date} className="report-sheet min-h-full rounded-sm border border-slate-200 bg-white p-5 shadow-sm">
                <div className="report-doc-header report-doc-header-booking">
                  <div className="report-doc-brand">GEI</div>
                  <div className="report-doc-title">รายงานการจองเข้าร้าน</div>
                  <div className="report-doc-meta">วันที่พิมพ์ {printDate}</div>
                  <div className="report-doc-code">[{userName}]</div>
                  <div className="report-doc-date">รายการของวันที่ : {formatReportDisplayDate(group.date)}</div>
                  <div className="report-doc-page">หน้า : 1</div>
                </div>
                <BookingReportTable rows={group.rows} />
              </section>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

function BonusReportTable({ rows }: { rows: ReportBonusCard[] }) {
  return (
    <table className="report-table report-table-bonus w-full border-collapse text-left text-xs">
      <colgroup>
        <col className="report-bonus-agent" />
        <col className="report-bonus-guide" />
        <col className="report-bonus-no" />
        <col className="report-bonus-detail" />
        <col className="report-bonus-party" />
        <col className="report-bonus-nation" />
        <col className="report-bonus-count" />
        <col className="report-bonus-count" />
        <col className="report-bonus-count" />
        <col className="report-bonus-count" />
        <col className="report-bonus-time-in" />
        <col className="report-bonus-time-out" />
        <col className="report-bonus-recorder" />
        <col className="report-bonus-car" />
        <col className="report-bonus-shop" />
        <col className="report-bonus-origin" />
        <col className="report-bonus-car-type" />
        <col className="report-bonus-remark" />
      </colgroup>
      <thead>
        <tr>
          <th colSpan={2} className="text-center">รหัสทัวร์/สมาชิก</th>
          <th>โบนัส</th>
          <th>รายละเอียด</th>
          <th>PartyCode</th>
          <th>ชนชาติ</th>
          <th className="text-center">PAX</th>
          <th className="text-center">TL</th>
          <th className="text-center">ST</th>
          <th className="text-center">CH</th>
          <th>เวลาเข้า</th>
          <th>เวลาออก</th>
          <th>ผู้บันทึก</th>
          <th>ทะเบียนรถ</th>
          <th>Shop</th>
          <th>มาจาก</th>
          <th>ประเภทรถ</th>
          <th>หมายเหตุ</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {rows.map((row) => {
          const pax = Number(row.adult || 0);
          return (
            <tr key={row.id} className="hover:bg-slate-50">
              <td title={row.agentCode || ''}>{row.agentCode || '-'}</td>
              <td title={row.guide || ''}>{row.guide || '-'}</td>
              <td className="font-semibold" title={row.bonus || ''}>{row.bonus}</td>
              <td title={row.bonusName || ''}>{row.bonusName || '-'}</td>
              <td title={row.partyCode || ''}>{row.partyCode || '-'}</td>
              <td title={row.nation || ''}>{row.nation || '-'}</td>
              <td className="text-center">{pax}</td>
              <td className="text-center">{Number(row.tourLeader || 0)}</td>
              <td className="text-center">{Number(row.student || 0)}</td>
              <td className="text-center">{Number(row.child || 0)}</td>
              <td title={row.tourIn || ''}>{row.tourIn || '-'}</td>
              <td title={row.tourOut || ''}>{row.tourOut || '-'}</td>
              <td title={row.recorderName || row.recorder || ''}>{row.recorderName || row.recorder || '-'}</td>
              <td title={row.carCode || ''}>{row.carCode || '-'}</td>
              <td title={row.shop || ''}>{row.shop || '-'}</td>
              <td title={row.province || ''}>{row.province || '-'}</td>
              <td title={row.busType || ''}>{row.busType || '-'}</td>
              <td title={row.comment || ''}>{row.comment || '-'}</td>
            </tr>
          );
        })}
      </tbody>
      <tfoot>
        <tr>
          <td colSpan={6}>รายจำนวน {rows.length} ราย</td>
          <td className="text-center">{sum(rows, (row) => Number(row.adult || 0))}</td>
          <td className="text-center">{sum(rows, (row) => Number(row.tourLeader || 0))}</td>
          <td className="text-center">{sum(rows, (row) => Number(row.student || 0))}</td>
          <td className="text-center">{sum(rows, (row) => Number(row.child || 0))}</td>
          <td colSpan={8} />
        </tr>
      </tfoot>
    </table>
  );
}

function BookingReportTable({ rows }: { rows: ReportBooking[] }) {
  return (
    <table className="report-table report-table-booking w-full min-w-[900px] border-collapse text-left text-xs">
      <thead>
        <tr>
          <th>No</th>
          <th>Company</th>
          <th>Party Code</th>
          <th className="text-center">Pax</th>
          <th colSpan={2} className="text-center">Guide</th>
          <th>No.bus</th>
          <th>Driver</th>
          <th>Time</th>
          <th>Remark</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {rows.map((row, index) => (
          <tr key={row.id} className="hover:bg-slate-50">
            <td className="text-center">{index + 1}</td>
            <td>{row.agentName || row.agentCode || '-'}</td>
            <td>{row.partyCode || '-'}</td>
            <td className="text-center">{Number(row.pax || 0)}</td>
            <td>{row.guideName || row.guideCode || '-'}</td>
            <td>{row.telGuide || '-'}</td>
            <td>{row.carCode || '-'}</td>
            <td>{row.telDriver || '-'}</td>
            <td>{row.timeBookJw || row.docTime || '-'}</td>
            <td>{row.bookRemark || '-'}</td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <td colSpan={3}>จำนวน {rows.length} ราย</td>
          <td className="text-center">{sum(rows, (row) => Number(row.pax || 0))}</td>
          <td colSpan={6} />
        </tr>
      </tfoot>
    </table>
  );
}

function groupRowsByDate<T>(rows: T[], getDate: (row: T) => string) {
  const groups = new Map<string, T[]>();
  rows.forEach((row) => {
    const date = (getDate(row) || '').slice(0, 10) || 'unknown';
    const current = groups.get(date) ?? [];
    current.push(row);
    groups.set(date, current);
  });

  return Array.from(groups.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([date, groupRows]) => ({ date, rows: groupRows }));
}

function sum<T>(rows: T[], getValue: (row: T) => number) {
  return rows.reduce((total, row) => total + getValue(row), 0);
}

function ReportDateInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const [displayValue, setDisplayValue] = useState(dateInputValue(value));
  const pickerRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDisplayValue(dateInputValue(value));
  }, [value]);

  const openPicker = () => {
    const picker = pickerRef.current as (HTMLInputElement & { showPicker?: () => void }) | null;
    try {
      if (picker?.showPicker) {
        picker.showPicker();
        return;
      }
    } catch {
      // Native date picker can only open from trusted click events in some browsers.
    }
    picker?.focus();
    picker?.click();
  };

  return (
    <label className="block w-[170px] space-y-1">
      <span className="text-[10px] font-medium uppercase text-slate-500">{label}</span>
      <div className="relative">
        <input
          type="text"
          value={displayValue}
          placeholder="--/--/----"
          onClick={openPicker}
          onFocus={openPicker}
          onChange={(event) => {
            const nextValue = event.target.value;
            setDisplayValue(nextValue);
            if (!nextValue.trim()) {
              onChange('');
              return;
            }
            if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(nextValue.trim())) {
              onChange(parseDateInput(nextValue));
            }
          }}
          onBlur={(event) => {
            const completed = completeDateInput(event.target.value);
            onChange(completed);
            setDisplayValue(dateInputValue(completed));
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              const completed = completeDateInput(event.currentTarget.value);
              onChange(completed);
              setDisplayValue(dateInputValue(completed));
            }
          }}
          className="form-input rounded-md pr-10"
        />
        <button
          type="button"
          className="absolute inset-y-0 right-2 my-auto flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-blue-700"
          aria-label="Open date picker"
          onClick={openPicker}
        >
          <CalendarIcon className="h-4 w-4" />
        </button>
        <input
          ref={pickerRef}
          type="date"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="pointer-events-none absolute inset-0 h-full w-full opacity-0"
          tabIndex={-1}
          aria-hidden="true"
        />
      </div>
    </label>
  );
}

function getTodayLocalDate() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatReportDisplayDate(value: string) {
  if (!value) return '--/--/----';
  const [year, month, day] = value.slice(0, 10).split('-');
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
}

function dateInputValue(value: string) {
  return value ? formatReportDisplayDate(value) : '';
}

function parseDateInput(value: string) {
  const trimmed = value.trim();
  if (!trimmed || trimmed === '--/--/----') {
    return '';
  }
  const match = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) {
    return trimmed;
  }
  const day = match[1].padStart(2, '0');
  const month = match[2].padStart(2, '0');
  return `${match[3]}-${month}-${day}`;
}

function completeDateInput(value: string) {
  const parsed = parseDateInput(value);
  if (!parsed) {
    return '';
  }
  if (/^\d{1,2}$/.test(parsed)) {
    const now = new Date();
    const day = parsed.padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${now.getFullYear()}-${month}-${day}`;
  }
  return parsed;
}

function ReportCardIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={`${className} fill-none stroke-current`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 7h16" />
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <path d="M8 13h5M8 16h8" />
    </svg>
  );
}

function ChevronDownIcon({ className = '' }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={`h-4 w-4 fill-none stroke-current text-slate-500 ${className}`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}




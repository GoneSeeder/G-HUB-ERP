'use client';

// เงินเดือน (Payroll runs) — presentation-only mock UI, per user request 2026-07-01.
// Not wired to backend; for demo/pitch purposes only.

import { useEffect, useRef, useState } from 'react';
import { XIcon } from '@/components/ui/icons';
import { PAYROLL_COMPANY_OPTIONS } from '@/data/humansource/payroll-common';
import { PAYROLL_RUNS, type PayrollRun } from '@/data/humansource/payroll-runs';

const YEAR_OPTIONS = ['2569', '2568'];
const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'pending', label: 'รอคำนวณ' },
  { value: 'done', label: 'คำนวณแล้ว' },
];

const ACCENT = '#10b981';

function formatMoney(amount: number) {
  return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function FilterChipSelect({
  label, value, options, onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const selected = options.find((o) => o.value === value);
  if (selected) {
    return (
      <div className="hr-filter-chip hr-filter-chip--active" style={{ borderColor: ACCENT, color: ACCENT }}>
        <span>{selected.label}</span>
        <button type="button" className="hr-filter-chip__clear" aria-label="ล้างตัวกรอง" onClick={() => onChange('')}>
          <XIcon className="h-3 w-3" />
        </button>
      </div>
    );
  }
  return (
    <div ref={wrapRef} className="hr-filter-chip-wrap">
      <button type="button" className="hr-filter-chip" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        {label} <span aria-hidden>▾</span>
      </button>
      {open && (
        <div className="hr-filter-chip-dropdown">
          {options.map((o) => (
            <button key={o.value} type="button" className="hr-filter-chip-dropdown__item"
              onClick={() => { onChange(o.value); setOpen(false); }}>
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a21.3 21.3 0 0 1 5.06-5.94M9.9 4.24A10.94 10.94 0 0 1 12 5c7 0 11 7 11 7a21.3 21.3 0 0 1-2.16 3.19M14.12 14.12a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7-11-7Z" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 6.5C10.5 5.5 8 5 4 5v14c4 0 6.5.5 8 1.5M12 6.5c1.5-1 4-1.5 8-1.5v14c-4 0-6.5.5-8 1.5M12 6.5v15" />
    </svg>
  );
}

function RunCard({ run, showAmount }: { run: PayrollRun; showAmount: boolean }) {
  return (
    <div className="hr-payroll-run-card">
      <div className="hr-payroll-run-card__head">
        <div>
          <h3 className="hr-payroll-run-card__title">งวดที่ {run.periodNo} ({run.monthLabel})</h3>
        </div>
        <span className="hr-pill hr-pill--amber">
          <span className="hr-pill__dot" />
          {run.status === 'pending' ? 'รอคำนวณ' : 'คำนวณแล้ว'}
        </span>
      </div>

      <div className="hr-payroll-run-card__body">
        <div className="hr-payroll-run-card__company">
          <span className="hr-payroll-run-card__company-icon" style={{ backgroundColor: `${ACCENT}1a`, color: ACCENT }}>
            {run.company.charAt(0)}
          </span>
          <span>{run.company}</span>
        </div>

        <div className="hr-payroll-run-card__slots">
          {run.slots.map((slot, index) => (
            <div key={index} className="hr-payroll-run-card__slot">
              <p className="hr-payroll-run-card__slot-date">วันที่จ่าย {slot.payDate}</p>
              <p className="hr-payroll-run-card__slot-range">{slot.rangeStart} - {slot.rangeEnd}</p>
              <div className="hr-payroll-run-card__chips">
                {slot.chips.map((chip) => (
                  <span key={chip} className="hr-period-emp-chip">{chip}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="hr-payroll-run-card__amount">
          <p className="hr-payroll-run-card__amount-label">ยอดสุทธิ</p>
          <p className="hr-payroll-run-card__amount-value">
            {showAmount ? `฿${formatMoney(run.netAmount)}` : '฿XXX,XXX,XXX.XX'}
          </p>
        </div>
      </div>

      <div className="hr-payroll-run-card__foot">
        <div className="hr-payroll-run-card__stats">
          <div>
            <p className="hr-payroll-run-card__stat-label">พนักงานในงวด</p>
            <p className="hr-payroll-run-card__stat-value">{run.employeeCount}</p>
          </div>
          <div>
            <p className="hr-payroll-run-card__stat-label">เข้าใหม่</p>
            <p className="hr-payroll-run-card__stat-value hr-payroll-run-card__stat-value--up">↑{run.newCount}</p>
          </div>
          <div>
            <p className="hr-payroll-run-card__stat-label">ลาออก</p>
            <p className="hr-payroll-run-card__stat-value hr-payroll-run-card__stat-value--down">↓{run.leftCount}</p>
          </div>
        </div>
        <button type="button" className="hr-payroll-run-card__action" style={{ backgroundColor: ACCENT }}>
          ทำเงินเดือน
        </button>
      </div>
    </div>
  );
}

export function PayrollRunsBoard() {
  const [tab, setTab] = useState<'pending' | 'all'>('pending');
  const [filterCompany, setFilterCompany] = useState('G-HUB Enterprise');
  const [filterYear, setFilterYear] = useState('2569');
  const [filterStatus, setFilterStatus] = useState('');
  const [showAmount, setShowAmount] = useState(false);

  const companyOptions = PAYROLL_COMPANY_OPTIONS.map((c) => ({ value: c, label: c }));
  const yearOptions = YEAR_OPTIONS.map((y) => ({ value: y, label: y }));

  const runs = PAYROLL_RUNS.filter((run) => {
    if (tab === 'pending' && run.status !== 'pending') return false;
    if (filterCompany && run.company !== filterCompany) return false;
    if (filterYear && run.year !== filterYear) return false;
    if (filterStatus && run.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="hr-payroll-page hr-payroll-runs-page">
      <div className="hr-payroll-runs-page__header">
        <h1 className="hr-payroll-runs-page__title">เงินเดือน</h1>
        <div className="hr-payroll-runs-page__header-links">
          <button type="button" className="hr-payroll-runs-page__link">
            <PlayIcon /> ดูวิดีโอ
          </button>
          <button type="button" className="hr-payroll-runs-page__link">
            <BookIcon /> คู่มือการใช้งาน
          </button>
        </div>
      </div>

      <div className="hr-payroll-runs-page__tabs">
        <button
          type="button"
          className={`hr-payroll-runs-page__tab${tab === 'pending' ? ' hr-payroll-runs-page__tab--active' : ''}`}
          onClick={() => setTab('pending')}
        >
          งวดที่รอทำเงินเดือน
        </button>
        <button
          type="button"
          className={`hr-payroll-runs-page__tab${tab === 'all' ? ' hr-payroll-runs-page__tab--active' : ''}`}
          onClick={() => setTab('all')}
        >
          งวดทั้งหมด
        </button>
      </div>

      <div className="hr-period-board__toolbar hr-payroll-runs-page__toolbar">
        <div className="hr-period-board__toolbar-right">
          <FilterChipSelect label="บริษัท" value={filterCompany} options={companyOptions} onChange={setFilterCompany} />
          <FilterChipSelect label="ปี" value={filterYear} options={yearOptions} onChange={setFilterYear} />
          <FilterChipSelect label="สถานะ" value={filterStatus} options={STATUS_OPTIONS} onChange={setFilterStatus} />
          <button
            type="button"
            className={`hr-period-icon-btn${showAmount ? ' hr-period-icon-btn--active' : ''}`}
            onClick={() => setShowAmount((v) => !v)}
            aria-label={showAmount ? 'ซ่อนยอดจ่าย' : 'แสดงยอดจ่าย'}
            title={showAmount ? 'ซ่อนยอดจ่ายสุทธิ' : 'แสดงยอดจ่ายสุทธิ'}
          >
            <EyeIcon open={showAmount} />
          </button>
        </div>
      </div>

      <div className="hr-payroll-runs-page__list">
        {runs.length === 0 ? (
          <p className="hr-payroll-runs-page__empty">ไม่พบงวดเงินเดือนที่ตรงกับตัวกรอง</p>
        ) : (
          runs.map((run) => <RunCard key={run.id} run={run} showAmount={showAmount} />)
        )}
      </div>
    </div>
  );
}

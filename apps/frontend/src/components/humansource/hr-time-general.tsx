'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { getAllShifts, readCustomShifts, type HrShiftRow } from './hr-shifts';

const DAYS_TH: Array<{ key: DayKey; short: string; full: string }> = [
  { key: 'mon', short: 'จ.',  full: 'จันทร์'    },
  { key: 'tue', short: 'อ.',  full: 'อังคาร'    },
  { key: 'wed', short: 'พ.',  full: 'พุธ'        },
  { key: 'thu', short: 'พฤ.', full: 'พฤหัสบดี' },
  { key: 'fri', short: 'ศ.',  full: 'ศุกร์'      },
  { key: 'sat', short: 's.',  full: 'เสาร์'      },
  { key: 'sun', short: 'อา.', full: 'อาทิตย์'   },
];

// fix short label for Saturday
DAYS_TH[5].short = 'ส.';

type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

type ShiftOption = {
  code: string;
  label: string;
  detail: string;
  group: 'work' | 'off';
  color: string;
};

const SHIFT_OPTIONS: ShiftOption[] = [
  { code: 'OFF', label: 'OFF', detail: 'วันหยุด',            group: 'off',  color: '#94a3b8' },
  { code: 'S1',  label: 'S1',  detail: 'สำนักงาน 08:00–17:00', group: 'work', color: '#8b5cf6' },
  { code: 'S2',  label: 'S2',  detail: 'กะเช้า 06:00–14:00',    group: 'work', color: '#ec4899' },
  { code: 'S3',  label: 'S3',  detail: 'กะบ่าย 14:00–22:00',    group: 'work', color: '#22d3ee' },
  { code: 'S4',  label: 'S4',  detail: 'กะดึก 22:00–06:00',     group: 'work', color: '#f97316' },
];

const DEFAULT_PLAN: Record<DayKey, string> = {
  mon: 'WC001', tue: 'WC001', wed: 'WC001', thu: 'WC001', fri: 'WC001', sat: 'OFF', sun: 'OFF',
};

function buildShiftOptions(customShifts: HrShiftRow[]): ShiftOption[] {
  const fallbackColors = SHIFT_OPTIONS.slice(1).map((shift) => shift.color);
  const workOptions = getAllShifts(customShifts)
    .filter((shift) => shift.enabled)
    .map((shift, index) => ({
      code: shift.code,
      label: shift.code,
      detail: `${shift.name} ${shift.time}`,
      group: 'work' as const,
      color: shift.color || fallbackColors[index % fallbackColors.length] || '#2f80ff',
    }));

  return [SHIFT_OPTIONS[0], ...workOptions];
}

export function TimeGeneralSettings({ accent }: { accent: string }) {
  const [plan, setPlan] = useState<Record<DayKey, string>>(DEFAULT_PLAN);
  const [openDay, setOpenDay] = useState<DayKey | null>(null);
  const [duplicateScans, setDuplicateScans] = useState(3);
  const [duplicateWindow, setDuplicateWindow] = useState(3);
  const [partialPolicy, setPartialPolicy] = useState<'full' | 'half'>('full');
  const [customShifts, setCustomShifts] = useState<HrShiftRow[]>([]);
  const shiftOptions = buildShiftOptions(customShifts);
  const fallbackShift = shiftOptions.find((shift) => shift.group === 'work') ?? SHIFT_OPTIONS[0];

  useEffect(() => {
    const syncShifts = () => setCustomShifts(readCustomShifts());
    syncShifts();
    window.addEventListener('storage', syncShifts);
    window.addEventListener('focus', syncShifts);
    return () => {
      window.removeEventListener('storage', syncShifts);
      window.removeEventListener('focus', syncShifts);
    };
  }, []);

  return (
    <div className="hr-time-general">
      {/* Section 1 — Weekly calendar */}
      <section className="hr-time-section">
        <header className="hr-time-section__header">
          <div>
            <h3 className="hr-time-section__title">ตั้งค่ากะการทำงาน / วันหยุด</h3>
            <p className="hr-time-section__description">
              ค่าพื้นฐานที่จะถูกใช้กับพนักงานที่เพิ่มเข้ามาใหม่ ตั้งเป็นปฏิทิน 7 วัน (จันทร์–อาทิตย์) — กดที่วันเพื่อเลือกกะหรือวันหยุด
            </p>
          </div>
        </header>

        <div className="hr-time-section__body">
          <div className="hr-time-calendar" role="grid" aria-label="ตารางตั้งค่ากะการทำงานรายสัปดาห์">
            <div className="hr-time-calendar__head" role="row">
              {DAYS_TH.map((day) => (
                <div key={day.key} className="hr-time-calendar__headcell" role="columnheader">
                  <span className="hr-time-calendar__short">{day.short}</span>
                  <span className="hr-time-calendar__full">{day.full}</span>
                </div>
              ))}
            </div>

            <div className="hr-time-calendar__body" role="row">
              {DAYS_TH.map((day) => {
                const code = plan[day.key];
                const shift = shiftOptions.find((s) => s.code === code) ?? fallbackShift;
                const isOff = shift.group === 'off';
                return (
                  <DayCell
                    key={day.key}
                    short={day.short}
                    full={day.full}
                    shift={shift}
                    isOff={isOff}
                    isOpen={openDay === day.key}
                    onToggle={() => setOpenDay((cur) => (cur === day.key ? null : day.key))}
                  onSelect={(value) => {
                    setPlan((p) => ({ ...p, [day.key]: value }));
                    setOpenDay(null);
                  }}
                  accent={accent}
                  shiftOptions={shiftOptions}
                />
                );
              })}
            </div>
          </div>

          <div className="hr-time-weeklegend">
            <span className="hr-time-weeklegend__item">
              <span className="hr-time-dot" style={{ background: SHIFT_OPTIONS[0].color }} />
              วันหยุด
            </span>
            <span className="hr-time-weeklegend__item">
              <span className="hr-time-dot" style={{ background: fallbackShift.color }} />
              วันทำงาน (มีกะ)
            </span>
            <span className="hr-time-weeklegend__divider" aria-hidden="true" />
            <span className="hr-time-weeklegend__hint">
              กดที่วันใดวันหนึ่งเพื่อเปลี่ยนกะหรือกำหนดให้เป็นวันหยุด
            </span>
          </div>
        </div>
      </section>

      {/* Section 2 — Duplicate scan prevention */}
      <section className="hr-time-section">
        <header className="hr-time-section__header">
          <div>
            <h3 className="hr-time-section__title">ป้องกันการบันทึกเวลาซ้ำ</h3>
            <p className="hr-time-section__description">
              ป้องกันไม่ให้การสแกนใบหน้า / นิ้ว / QR ที่อยู่ใกล้กันเกินไป ถูกบันทึกเป็นการลงเวลาออกโดยไม่ตั้งใจ
            </p>
          </div>
        </header>
        <div className="hr-time-section__body">
          <div className="hr-setting-rows">
            <div className="hr-setting-row">
              <span className="hr-setting-row__label">ช่วงเวลาที่นับการสแกนซ้ำ</span>
              <span className="hr-setting-row__control">
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={duplicateWindow}
                  onChange={(e) => setDuplicateWindow(Number(e.target.value))}
                  className="hr-shift-control hr-setting-row__num"
                  aria-label="ช่วงเวลาที่นับการสแกนซ้ำ (นาที)"
                />
                <span className="hr-setting-row__unit">นาที</span>
              </span>
            </div>
            <div className="hr-setting-row">
              <span className="hr-setting-row__label">ข้ามการสแกนซ้ำเมื่อเกิน</span>
              <span className="hr-setting-row__control">
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={duplicateScans}
                  onChange={(e) => setDuplicateScans(Number(e.target.value))}
                  className="hr-shift-control hr-setting-row__num"
                  aria-label="ข้ามการสแกนซ้ำเมื่อเกิน (ครั้ง)"
                />
                <span className="hr-setting-row__unit">ครั้ง</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3 — Partial scan policy */}
      <section className="hr-time-section">
        <header className="hr-time-section__header">
          <div>
            <h3 className="hr-time-section__title">ถ้าสแกนนิ้วไม่ครบ</h3>
            <p className="hr-time-section__description">
              กรณีพนักงานลงเวลาไม่ครบในวันนั้น ระบบจะตัดเป็นขาดงานตามรูปแบบที่เลือก
            </p>
          </div>
        </header>
        <div className="hr-time-section__body">
          <div className="hr-time-switch" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={partialPolicy === 'full'}
              onClick={() => setPartialPolicy('full')}
              className={`hr-time-switch__btn ${partialPolicy === 'full' ? 'hr-time-switch__btn--active' : ''}`}
            >
              หักเต็มวัน
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={partialPolicy === 'half'}
              onClick={() => setPartialPolicy('half')}
              className={`hr-time-switch__btn ${partialPolicy === 'half' ? 'hr-time-switch__btn--active' : ''}`}
            >
              หักครึ่งวัน
            </button>
          </div>
        </div>
      </section>

      <div className="hr-time-actions">
        <button type="button" className="hr-settings-filter">ยกเลิก</button>
        <button type="button" className="hr-settings-primary-action" style={{ backgroundColor: accent }}>
          บันทึกการตั้งค่า
        </button>
      </div>
    </div>
  );
}

function DayCell({
  short, full, shift, isOff, isOpen, onToggle, onSelect, accent, shiftOptions,
}: {
  short: string;
  full: string;
  shift: ShiftOption;
  isOff: boolean;
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (code: string) => void;
  accent: string;
  shiftOptions: ShiftOption[];
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onToggle();
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onToggle();
    };
    window.addEventListener('mousedown', onDoc);
    window.addEventListener('keydown', onEsc);
    return () => {
      window.removeEventListener('mousedown', onDoc);
      window.removeEventListener('keydown', onEsc);
    };
  }, [isOpen, onToggle]);

  return (
    <div ref={ref} className={`hr-time-daycell ${isOff ? 'hr-time-daycell--off' : ''} ${isOpen ? 'hr-time-daycell--open' : ''}`} role="gridcell">
      <button
        type="button"
        className="hr-time-daycell__btn"
        onClick={onToggle}
        aria-expanded={isOpen}
        style={isOpen ? { borderColor: accent } : undefined}
      >
        <span className="hr-time-daycell__short">{short}</span>
        <span className="hr-time-daycell__full">{full}</span>
        <span className="hr-time-daycell__shift">
          <span className="hr-time-dot" style={{ background: shift.color }} />
          <span className="hr-time-daycell__code">{shift.code}</span>
        </span>
        <span className="hr-time-daycell__detail">{shift.detail}</span>
      </button>

      {isOpen && (
        <ShiftPicker selected={shift.code} onSelect={onSelect} accent={accent} shiftOptions={shiftOptions} />
      )}
    </div>
  );
}

function ShiftPicker({
  selected, onSelect, accent, shiftOptions,
}: {
  selected: string;
  onSelect: (code: string) => void;
  accent: string;
  shiftOptions: ShiftOption[];
}) {
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const filtered = shiftOptions.filter(
    (s) => !q || s.code.toLowerCase().includes(q) || s.detail.toLowerCase().includes(q),
  );
  const offOpts = filtered.filter((s) => s.group === 'off');
  const workOpts = filtered.filter((s) => s.group === 'work');

  return (
    <div className="hr-time-picker" role="dialog">
      <div className="hr-time-picker__search">
        <svg viewBox="0 0 24 24" className="hr-time-picker__search-icon" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
        </svg>
        <input
          type="text"
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ค้นหา"
          className="hr-time-picker__search-input"
        />
      </div>

      <div className="hr-time-picker__body">
        {offOpts.length > 0 && (
          <div className="hr-time-picker__group">
            <p className="hr-time-picker__group-title">วันหยุด</p>
            {offOpts.map((opt) => (
              <PickerOption
                key={opt.code}
                option={opt}
                selected={opt.code === selected}
                onSelect={() => onSelect(opt.code)}
                accent={accent}
              />
            ))}
          </div>
        )}
        {workOpts.length > 0 && (
          <div className="hr-time-picker__group">
            <p className="hr-time-picker__group-title">วันทำงาน</p>
            {workOpts.map((opt) => (
              <PickerOption
                key={opt.code}
                option={opt}
                selected={opt.code === selected}
                onSelect={() => onSelect(opt.code)}
                accent={accent}
              />
            ))}
          </div>
        )}
        {filtered.length === 0 && (
          <p className="hr-time-picker__empty">ไม่พบกะที่ตรงกับการค้นหา</p>
        )}
      </div>

      <div className="hr-time-picker__footer">
        <Link className="hr-time-picker__edit-link" href="/humansource/settings/time/work-schedules">
          เพิ่ม / แก้ไขกะการทำงาน →
        </Link>
      </div>
    </div>
  );
}

function PickerOption({
  option, selected, onSelect, accent,
}: {
  option: ShiftOption;
  selected: boolean;
  onSelect: () => void;
  accent: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`hr-time-picker__option ${selected ? 'hr-time-picker__option--selected' : ''}`}
      style={selected ? { borderColor: accent } : undefined}
    >
      <span className="hr-time-dot" style={{ background: option.color }} />
      <span className="hr-time-picker__option-code">{option.code}</span>
      <span className="hr-time-picker__option-detail">{option.detail}</span>
      {selected && (
        <svg viewBox="0 0 24 24" className="hr-time-picker__option-check" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" style={{ color: accent }}>
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
    </button>
  );
}

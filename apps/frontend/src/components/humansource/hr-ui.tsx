'use client';

import { ReactNode, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CalendarIcon, CheckIcon, SearchIcon, XIcon } from '@/components/ui/icons';
import { cn } from '@/lib/cn';

export function HrButton({
  children,
  variant = 'secondary',
  className,
  onClick,
}: {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  className?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'hr-button',
        variant === 'primary' && 'hr-button--primary',
        variant === 'secondary' && 'hr-button--secondary',
        variant === 'danger' && 'hr-button--danger',
        variant === 'ghost' && 'hr-button--ghost',
        className,
      )}
    >
      {children}
    </button>
  );
}

export function HrCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <section className={cn('hr-card', className)}>
      {children}
    </section>
  );
}

export function HrBadge({ children, tone = 'slate' }: { children: ReactNode; tone?: 'slate' | 'green' | 'amber' | 'indigo' | 'rose' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium',
        tone === 'slate' && 'bg-slate-100 text-slate-600',
        tone === 'green' && 'bg-emerald-50 text-emerald-700',
        tone === 'amber' && 'bg-amber-50 text-amber-700',
        tone === 'indigo' && 'bg-indigo-50 text-indigo-700',
        tone === 'rose' && 'bg-rose-50 text-rose-700',
      )}
    >
      {children}
    </span>
  );
}

export function HrInput({ placeholder, value = '' }: { placeholder: string; value?: string }) {
  return (
    <label className="hr-search-field">
      <SearchIcon className="hr-search-field__icon" />
      <input
        value={value}
        readOnly
        placeholder={placeholder}
        className="hr-search-field__input"
      />
    </label>
  );
}

export function HrSelectMock({ label, value }: { label: string; value: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="hr-filter-select">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="hr-filter-select__trigger"
      >
        <span className="truncate">{label}: {value}</span>
        <span className={cn('hr-filter-select__chevron', open && 'hr-filter-select__chevron--open')} />
      </button>
      {open ? (
        <div className="hr-filter-select__menu">
          {['ทั้งหมด', 'เปิด', 'ปิด'].map((option) => (
            <button key={option} type="button" className="hr-filter-select__option">
              {option}
              {option === value ? <CheckIcon className="h-4 w-4" /> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

type HrCustomSelectOption = string | {
  value: string;
  label: string;
  description?: string;
};

type NormalizedHrCustomSelectOption = {
  value: string;
  label: string;
  description?: string;
};

export function HrCustomSelect({
  value,
  options,
  onChange,
  label,
  className,
  menuClassName,
  renderOption,
  renderTrigger,
}: {
  value: string;
  options: HrCustomSelectOption[];
  onChange: (value: string) => void;
  label?: string;
  className?: string;
  menuClassName?: string;
  renderOption?: (option: NormalizedHrCustomSelectOption, selected: boolean) => ReactNode;
  renderTrigger?: (option: NormalizedHrCustomSelectOption) => ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top?: number; bottom?: number; left: number; minWidth: number }>({ left: 0, minWidth: 0 });
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const normalizedOptions = options.map((option) => (
    typeof option === 'string' ? { value: option, label: option } : option
  ));
  const selectedOption = normalizedOptions.find((option) => option.value === value) ?? normalizedOptions[0];

  function openMenu() {
    const rect = rootRef.current?.getBoundingClientRect();
    if (!rect) return;
    const above = window.innerHeight - rect.bottom < 260 && rect.top > 260;
    setMenuPos(above
      ? { bottom: window.innerHeight - rect.top + 4, left: rect.left, minWidth: rect.width }
      : { top: rect.bottom + 4, left: rect.left, minWidth: rect.width }
    );
    setOpen(true);
  }

  useEffect(() => {
    if (!open) return;
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node) && !menuRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    const close = () => setOpen(false);
    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    document.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
      document.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={cn('hr-custom-select', className)}>
      <button
        type="button"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="hr-custom-select__trigger"
        onClick={() => open ? setOpen(false) : openMenu()}
      >
        <span className={`hr-custom-select__value${!value ? ' hr-custom-select__value--placeholder' : ''}`}>
          {value
            ? (renderTrigger && selectedOption ? renderTrigger(selectedOption) : (selectedOption?.label ?? value))
            : 'กรุณาเลือก'}
        </span>
        <span className="hr-custom-select__chevron" aria-hidden="true" />
      </button>

      {open && createPortal(
        <div
          ref={menuRef}
          className={cn('hr-custom-select__menu', menuClassName)}
          style={{ position: 'fixed', zIndex: 9999, width: 'max-content', maxWidth: '28rem', ...menuPos }}
          role="listbox"
        >
          {normalizedOptions.map((option) => {
            const selected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={selected}
                className={cn('hr-custom-select__option', selected && 'hr-custom-select__option--selected')}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
              >
                {renderOption ? renderOption(option, selected) : (
                  <span className="min-w-0">
                    <span className="hr-custom-select__option-label">{option.label}</span>
                    {option.description ? <span className="hr-custom-select__option-description">{option.description}</span> : null}
                  </span>
                )}
                {selected ? <CheckIcon className="hr-custom-select__check" /> : null}
              </button>
            );
          })}
        </div>,
        document.body
      )}
    </div>
  );
}

export function HrDatePickerMock({ label = 'ช่วงวันที่' }: { label?: string }) {
  return (
    <button type="button" className="hr-date-trigger">
      <CalendarIcon className="hr-date-trigger__icon" />
      {label}
    </button>
  );
}

// ── HrDatePicker — custom calendar date picker ─────────────────────────────

const TH_MONTHS_FULL = [
  'มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน',
  'กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม',
];
const TH_MONTHS_SHORT = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
const TH_DAYS = ['อา','จ','อ','พ','พฤ','ศ','ส'];

function parseIso(iso: string): { y: number; m: number; d: number } | null {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  return { y: Number(m[1]), m: Number(m[2]) - 1, d: Number(m[3]) };
}
function toIso(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}
function daysInMonth(y: number, m: number): number {
  return new Date(y, m + 1, 0).getDate();
}
function firstWeekday(y: number, m: number): number {
  return new Date(y, m, 1).getDay(); // 0=Sun
}
function formatDisplay(iso: string): string {
  const p = parseIso(iso);
  if (!p) return '';
  return `${p.d} ${TH_MONTHS_SHORT[p.m]} ${p.y}`;
}

export function HrDatePicker({
  value,
  onChange,
  label,
  placeholder = 'เลือกวันที่',
  variant = 'default',
}: {
  value: string;
  onChange: (iso: string) => void;
  label?: string;
  placeholder?: string;
  variant?: 'default' | 'input';
}) {
  const today = (() => {
    // compute once per render, safe since we don't use it in hydration-sensitive paths
    const t = new Date();
    return { y: t.getFullYear(), m: t.getMonth(), d: t.getDate() };
  })();

  const parsed = parseIso(value);
  const [open, setOpen] = useState(false);
  const [viewY, setViewY] = useState(parsed?.y ?? today.y);
  const [viewM, setViewM] = useState(parsed?.m ?? today.m);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // sync view when value changes externally
  useEffect(() => {
    const p = parseIso(value);
    if (p) { setViewY(p.y); setViewM(p.m); }
  }, [value]);

  // close on outside click / Escape
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  function prevMonth() {
    if (viewM === 0) { setViewM(11); setViewY((y) => y - 1); }
    else setViewM((m) => m - 1);
  }
  function nextMonth() {
    if (viewM === 11) { setViewM(0); setViewY((y) => y + 1); }
    else setViewM((m) => m + 1);
  }
  function selectDay(d: number) {
    onChange(toIso(viewY, viewM, d));
    setOpen(false);
    setShowYearPicker(false);
  }

  const days = daysInMonth(viewY, viewM);
  const lead = firstWeekday(viewY, viewM); // 0–6 blanks before day 1
  const cells: (number | null)[] = [
    ...Array(lead).fill(null),
    ...Array.from({ length: days }, (_, i) => i + 1),
  ];
  // pad to full rows
  while (cells.length % 7 !== 0) cells.push(null);

  // year range for picker: ±6 years around current view
  const yearRange = Array.from({ length: 13 }, (_, i) => viewY - 6 + i);

  const calIcon = (
    <svg className="hr-dp__cal-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path fillRule="evenodd" d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z" clipRule="evenodd" />
    </svg>
  );

  return (
    <div ref={rootRef} className={cn('hr-dp', variant === 'input' && 'hr-dp--full')}>
      {/* trigger */}
      <button
        type="button"
        aria-label={label ?? placeholder}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={cn(
          variant === 'input'
            ? cn('hr-dp__trigger--input-style', open && 'hr-dp__trigger--open')
            : cn('hr-dp__trigger', open && 'hr-dp__trigger--open', value && 'hr-dp__trigger--filled'),
        )}
        onClick={() => { setOpen((o) => !o); setShowYearPicker(false); }}
      >
        {variant === 'default' && calIcon}
        <span className={cn('hr-dp__display', !value && 'hr-dp__display--placeholder')}>
          {value ? formatDisplay(value) : placeholder}
        </span>
        {variant === 'input' ? calIcon : (
          <svg className="hr-dp__chevron" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
            <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
          </svg>
        )}
      </button>

      {/* popover */}
      {open && (
        <div className="hr-dp__popover" role="dialog" aria-label="เลือกวันที่">
          {showYearPicker ? (
            /* ── year grid ── */
            <div className="hr-dp__year-grid">
              {yearRange.map((y) => (
                <button
                  key={y}
                  type="button"
                  className={cn('hr-dp__year-btn', y === viewY && 'hr-dp__year-btn--active')}
                  onClick={() => { setViewY(y); setShowYearPicker(false); }}
                >
                  {y}
                </button>
              ))}
            </div>
          ) : (
            <>
              {/* ── month header ── */}
              <div className="hr-dp__header">
                <button type="button" className="hr-dp__nav" onClick={prevMonth} aria-label="เดือนก่อนหน้า">
                  <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
                    <path fillRule="evenodd" d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
                  </svg>
                </button>
                <button
                  type="button"
                  className="hr-dp__month-label"
                  onClick={() => setShowYearPicker(true)}
                  title="เลือกปี"
                >
                  {TH_MONTHS_FULL[viewM]} {viewY}
                </button>
                <button type="button" className="hr-dp__nav" onClick={nextMonth} aria-label="เดือนถัดไป">
                  <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
                    <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              {/* ── day headers ── */}
              <div className="hr-dp__dow-row">
                {TH_DAYS.map((d) => (
                  <span key={d} className="hr-dp__dow">{d}</span>
                ))}
              </div>

              {/* ── day grid ── */}
              <div className="hr-dp__day-grid">
                {cells.map((d, i) => {
                  if (d === null) return <span key={`b-${i}`} />;
                  const isToday = d === today.d && viewM === today.m && viewY === today.y;
                  const isSelected = parsed && d === parsed.d && viewM === parsed.m && viewY === parsed.y;
                  return (
                    <button
                      key={d}
                      type="button"
                      className={cn(
                        'hr-dp__day',
                        isToday && !isSelected && 'hr-dp__day--today',
                        isSelected && 'hr-dp__day--selected',
                      )}
                      onClick={() => selectDay(d)}
                      aria-label={`${d} ${TH_MONTHS_FULL[viewM]} ${viewY}`}
                      aria-pressed={!!isSelected}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* clear button */}
          {value && (
            <div className="hr-dp__footer">
              <button
                type="button"
                className="hr-dp__clear"
                onClick={() => { onChange(''); setOpen(false); }}
              >
                ล้างวันที่
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function HrSwitch({ checked = true }: { checked?: boolean }) {
  return (
    <button type="button" className={cn('relative h-7 w-12 rounded-full p-1 transition focus:outline-none focus:ring-4 focus:ring-indigo-100', checked ? 'bg-emerald-500' : 'bg-slate-300')}>
      <span className={cn('block h-5 w-5 rounded-full bg-white shadow transition', checked && 'translate-x-5')} />
    </button>
  );
}

export function HrCheckbox({ label, checked = true }: { label: string; checked?: boolean }) {
  return (
    <button type="button" className="inline-flex items-center gap-2 rounded-2xl px-2 py-1 text-sm text-slate-600 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-indigo-100">
      <span className={cn('flex h-5 w-5 items-center justify-center rounded-lg border transition', checked ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300 bg-white text-transparent')}>
        <CheckIcon className="h-3.5 w-3.5" />
      </span>
      {label}
    </button>
  );
}

export function HrRadio({ label, checked = false }: { label: string; checked?: boolean }) {
  return (
    <button type="button" className="inline-flex items-center gap-2 rounded-2xl px-2 py-1 text-sm text-slate-600 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-indigo-100">
      <span className="flex h-5 w-5 items-center justify-center rounded-full border border-slate-300 bg-white">
        <span className={cn('h-2.5 w-2.5 rounded-full transition', checked ? 'bg-indigo-600' : 'bg-transparent')} />
      </span>
      {label}
    </button>
  );
}

export function HrTabs({ tabs, active }: { tabs: string[]; active: string }) {
  return (
    <div className="inline-flex rounded-2xl bg-white p-1 shadow-sm shadow-slate-200/80">
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          className={cn('rounded-xl px-3 py-2 text-sm font-medium transition', tab === active ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500')}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

export function HrEmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="hr-empty-state">
      <div className="hr-empty-state__icon">
        <XIcon className="h-6 w-6" />
      </div>
      <h3 className="hr-empty-state__title">{title}</h3>
      <p className="hr-empty-state__description">{description}</p>
    </div>
  );
}

export function HrLoadingState() {
  return (
    <div className="hr-loading-state">
      {[0, 1, 2].map((item) => (
        <div key={item} className="hr-loading-state__row" />
      ))}
    </div>
  );
}

export function HrModalMock() {
  return (
    <div className="hr-modal-mock">
      <div className="hr-modal-mock__panel">
        <p className="text-sm font-semibold text-slate-900">HR Modal</p>
        <p className="mt-1 text-xs text-slate-500">ตัวอย่าง modal แบบ custom สำหรับฟอร์ม HR</p>
      </div>
    </div>
  );
}

export function HrDrawerMock() {
  return (
    <div className="hr-drawer-mock">
      <div className="hr-drawer-mock__panel">
        HR Drawer สำหรับรายละเอียดด้านข้าง
      </div>
    </div>
  );
}

'use client';

import { type CSSProperties, type ChangeEvent, type FormEvent, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeftIcon, ArrowRightIcon, CalendarIcon, PlusIcon, SearchIcon, TrashIcon, XIcon } from '@/components/ui/icons';
import { cn } from '@/lib/cn';
import { publicApiFetch } from '@/lib/api';
import { HrCustomSelect } from './hr-ui';
import {
  type Announcement,
  type AnnouncementCategory,
  type AnnouncementStatus,
  type AttachmentFile,
  ANNOUNCEMENT_CATEGORY_SEED,
  ANNOUNCEMENT_SEED,
  STATUS_LABELS,
} from '@/data/humansource/announcements';
import {
  type EmployeeType,
  EMPLOYEE_TYPE_SEED,
} from '@/data/humansource/employee-types';

// ─── constants ─────────────────────────────────────────────────────────────

const STATUS_CHIP_OPTIONS: { value: string; label: string }[] = [
  { value: 'draft',     label: STATUS_LABELS.draft },
  { value: 'published', label: STATUS_LABELS.published },
  { value: 'archived',  label: STATUS_LABELS.archived },
];

// ─── helpers ───────────────────────────────────────────────────────────────

function shortDate(d: string | null): string {
  if (!d) return '—';
  const datePart = d.includes('T') ? d.split('T')[0] : d;
  const [y, m, dd] = datePart.split('-');
  return `${dd}/${m}/${y}`;
}

function audienceSummary(a: Announcement['audience']): string {
  if (a.scope === 'all') return 'ทุกคน';
  const n = a.employeeTypeIds.length + a.orgNodeIds.length + a.employeeIds.length;
  return n > 0 ? `กำหนดเอง (${n})` : 'กำหนดเอง';
}

function statusPillClass(s: AnnouncementStatus): string {
  if (s === 'published') return 'hr-announce-status hr-announce-status--published';
  if (s === 'archived')  return 'hr-announce-status hr-announce-status--archived';
  return 'hr-announce-status hr-announce-status--draft';
}

// ─── file type helpers ─────────────────────────────────────────────────────

type FileGroup = 'image' | 'pdf' | 'excel' | 'word' | 'ppt' | 'onenote' | 'outlook' | 'other';

function fileTypeGroup(name: string): FileGroup {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  if (['jpg','jpeg','png','gif','webp','svg','bmp'].includes(ext)) return 'image';
  if (ext === 'pdf') return 'pdf';
  if (['xlsx','xls','csv'].includes(ext)) return 'excel';
  if (['docx','doc'].includes(ext)) return 'word';
  if (['pptx','ppt'].includes(ext)) return 'ppt';
  if (ext === 'one') return 'onenote';
  if (['msg','eml'].includes(ext)) return 'outlook';
  return 'other';
}

function FileIcon({ group }: { group: FileGroup }) {
  // Fluent-style: large backdrop (2 overlapping rounded rects) + letter badge bottom-left
  switch (group) {
    case 'pdf':
      return (
        <svg viewBox="0 0 40 40" className="hr-announce-file-icon">
          <rect width="40" height="40" rx="8" fill="#fee2e2"/>
          <path d="M10 4h14l8 8v24a2 2 0 01-2 2H10a2 2 0 01-2-2V6a2 2 0 012-2z" fill="#fca5a5"/>
          <path d="M24 4l8 8h-8V4z" fill="#ef4444"/>
          <text x="20" y="32" textAnchor="middle" fontSize="10" fontWeight="800" fill="#dc2626" fontFamily="system-ui,sans-serif">PDF</text>
        </svg>
      );
    case 'word':
      return (
        <svg viewBox="0 0 40 40" className="hr-announce-file-icon">
          <rect width="40" height="40" rx="8" fill="#bfdbfe"/>
          {/* top-left backdrop bar */}
          <rect x="2" y="2" width="32" height="18" rx="6" fill="#93c5fd"/>
          {/* right-bottom backdrop */}
          <rect x="12" y="12" width="26" height="26" rx="6" fill="#3b82f6"/>
          {/* letter badge */}
          <rect x="2" y="20" width="18" height="18" rx="5" fill="#1e40af"/>
          <text x="11" y="33.5" textAnchor="middle" fontSize="13" fontWeight="900" fill="white" fontFamily="system-ui,Arial,sans-serif">W</text>
        </svg>
      );
    case 'excel':
      return (
        <svg viewBox="0 0 40 40" className="hr-announce-file-icon">
          <rect width="40" height="40" rx="8" fill="#bbf7d0"/>
          <rect x="2" y="2" width="32" height="18" rx="6" fill="#86efac"/>
          <rect x="12" y="12" width="26" height="26" rx="6" fill="#16a34a"/>
          <rect x="2" y="20" width="18" height="18" rx="5" fill="#14532d"/>
          <text x="11" y="33.5" textAnchor="middle" fontSize="13" fontWeight="900" fill="white" fontFamily="system-ui,Arial,sans-serif">X</text>
        </svg>
      );
    case 'ppt':
      return (
        <svg viewBox="0 0 40 40" className="hr-announce-file-icon">
          <rect width="40" height="40" rx="8" fill="#fed7aa"/>
          <rect x="2" y="2" width="32" height="18" rx="6" fill="#fb923c"/>
          <rect x="12" y="12" width="26" height="26" rx="6" fill="#ea580c"/>
          <rect x="2" y="20" width="18" height="18" rx="5" fill="#9a3412"/>
          <text x="11" y="33.5" textAnchor="middle" fontSize="13" fontWeight="900" fill="white" fontFamily="system-ui,Arial,sans-serif">P</text>
        </svg>
      );
    case 'onenote':
      return (
        <svg viewBox="0 0 40 40" className="hr-announce-file-icon">
          <rect width="40" height="40" rx="8" fill="#e9d5ff"/>
          <rect x="2" y="2" width="32" height="18" rx="6" fill="#c4b5fd"/>
          <rect x="12" y="12" width="26" height="26" rx="6" fill="#7c3aed"/>
          <rect x="2" y="20" width="18" height="18" rx="5" fill="#4c1d95"/>
          <text x="11" y="33.5" textAnchor="middle" fontSize="13" fontWeight="900" fill="white" fontFamily="system-ui,Arial,sans-serif">N</text>
        </svg>
      );
    case 'outlook':
      return (
        <svg viewBox="0 0 40 40" className="hr-announce-file-icon">
          <rect width="40" height="40" rx="8" fill="#bae6fd"/>
          <rect x="2" y="2" width="32" height="18" rx="6" fill="#7dd3fc"/>
          <rect x="12" y="12" width="26" height="26" rx="6" fill="#0ea5e9"/>
          <rect x="2" y="20" width="18" height="18" rx="5" fill="#075985"/>
          <text x="11" y="33.5" textAnchor="middle" fontSize="13" fontWeight="900" fill="white" fontFamily="system-ui,Arial,sans-serif">O</text>
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 40 40" className="hr-announce-file-icon">
          <rect width="40" height="40" rx="6" fill="#e5e7eb"/>
          <path d="M12 8h10l8 8v18a2 2 0 01-2 2H12a2 2 0 01-2-2V10a2 2 0 012-2z" fill="#d1d5db"/>
          <path d="M22 8l8 8h-8V8z" fill="#9ca3af"/>
        </svg>
      );
  }
}

function FileThumb({ file, onRemove }: { file: AttachmentFile; onRemove: () => void }) {
  const group = fileTypeGroup(file.name);
  return (
    <div className="hr-announce-attach-thumb" title={file.name}>
      {group === 'image' && file.dataUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={file.dataUrl} alt={file.name} />
      ) : (
        <FileIcon group={group} />
      )}
      <button
        type="button"
        className="hr-announce-attach-thumb__remove"
        onClick={onRemove}
        aria-label={`ลบ ${file.name}`}
      >
        <XIcon className="h-2.5 w-2.5" />
      </button>
    </div>
  );
}

// ─── DeleteConfirm ─────────────────────────────────────────────────────────

function DeleteConfirm({ message, onConfirm, onCancel }: {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="hr-leave-confirm-overlay" role="presentation" onClick={onCancel}>
      <div className="hr-leave-confirm" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="hr-leave-confirm__body">{message}</div>
        <div className="hr-leave-confirm__foot">
          <button type="button" className="hr-leave-modal-foot__cancel" onClick={onCancel}>ยกเลิก</button>
          <button type="button" className="hr-leave-confirm__danger" onClick={onConfirm}>ลบ</button>
        </div>
      </div>
    </div>
  );
}

// ─── DateTimePicker ─────────────────────────────────────────────────────────

const DTP_MONTHS = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน',
  'กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
const DTP_MONTHS_SHORT = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
const DTP_WEEKDAYS = ['อา','จ','อ','พ','พฤ','ศ','ส'];

function dtpCalendarDays(viewDate: Date): (Date | null)[] {
  const y = viewDate.getFullYear();
  const m = viewDate.getMonth();
  const firstWeekday = new Date(y, m, 1).getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  return Array.from({ length: 42 }, (_, i) => {
    const d = i - firstWeekday + 1;
    return d >= 1 && d <= daysInMonth ? new Date(y, m, d) : null;
  });
}

function dtpSameDay(a: Date | null, b: Date): boolean {
  return !!(a && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate());
}

function dtpParseISO(iso: string): { date: Date | null; h: string; min: string } {
  if (!iso) return { date: null, h: '08', min: '00' };
  const [datePart = '', timePart = '08:00'] = iso.split('T');
  const [ys, ms, ds] = datePart.split('-');
  const y = Number(ys), mo = Number(ms), d = Number(ds);
  if (!y || !mo || !d) return { date: null, h: '08', min: '00' };
  const [h = '08', min = '00'] = timePart.slice(0, 5).split(':');
  return { date: new Date(y, mo - 1, d), h: h.padStart(2,'0'), min: min.padStart(2,'0') };
}

function dtpToISO(date: Date, h: string, min: string): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2,'0');
  const d = String(date.getDate()).padStart(2,'0');
  return `${y}-${m}-${d}T${h.padStart(2,'0')}:${min.padStart(2,'0')}`;
}

function dtpFormatDisplay(date: Date, h: string, min: string): string {
  return `${String(date.getDate()).padStart(2,'0')}/${String(date.getMonth()+1).padStart(2,'0')}/${date.getFullYear()} ${h.padStart(2,'0')}:${min.padStart(2,'0')}`;
}

function dtpParseTyped(raw: string): { date: Date; h: string; min: string } | null {
  const trimmed = raw.trim();
  const mFull = trimmed.match(/^(\d{1,2})[/.](\d{1,2})[/.](\d{4})\s+(\d{1,2}):(\d{1,2})$/);
  if (mFull) {
    const [, ds, mos, ys, hs, mins] = mFull;
    const d = Number(ds), mo = Number(mos), y = Number(ys), hv = Number(hs), minv = Number(mins);
    const date = new Date(y, mo - 1, d);
    if (date.getFullYear() === y && date.getMonth() === mo - 1 && date.getDate() === d
        && hv >= 0 && hv <= 23 && minv >= 0 && minv <= 59) {
      return { date, h: String(hv).padStart(2,'0'), min: String(minv).padStart(2,'0') };
    }
  }
  const mDate = trimmed.match(/^(\d{1,2})[/.](\d{1,2})[/.](\d{4})$/);
  if (mDate) {
    const [, ds, mos, ys] = mDate;
    const d = Number(ds), mo = Number(mos), y = Number(ys);
    const date = new Date(y, mo - 1, d);
    if (date.getFullYear() === y && date.getMonth() === mo - 1 && date.getDate() === d) {
      return { date, h: '08', min: '00' };
    }
  }
  return null;
}

function DateTimePicker({
  label,
  required,
  value,
  onChange,
  accent,
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (iso: string) => void;
  accent: string;
}) {
  const { date: selectedDate, h: initH, min: initMin } = dtpParseISO(value);

  const triggerRef  = useRef<HTMLDivElement>(null);
  const inputRef    = useRef<HTMLInputElement>(null);
  const popoverRef  = useRef<HTMLDivElement>(null);

  const [mounted,    setMounted]    = useState(false);
  const [open,       setOpen]       = useState(false);
  const [focused,    setFocused]    = useState(false);
  const [inputValue, setInputValue] = useState(() =>
    selectedDate ? dtpFormatDisplay(selectedDate, initH, initMin) : ''
  );
  const [view,     setView]     = useState<'days' | 'months' | 'years'>('days');
  const [viewDate, setViewDate] = useState(() => selectedDate ?? new Date());
  const [hour,     setHour]     = useState(initH);
  const [minute,   setMinute]   = useState(initMin);
  const [popStyle, setPopStyle] = useState<CSSProperties>({});

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (focused) return;
    const { date, h, min } = dtpParseISO(value);
    if (date) {
      setInputValue(dtpFormatDisplay(date, h, min));
      setViewDate(date);
      setHour(h);
      setMinute(min);
    } else if (!value) {
      setInputValue('');
    }
  }, [value, focused]);

  const positionPopover = () => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const width = Math.min(288, window.innerWidth - 16);
    const height = 400;
    const left = Math.min(Math.max(8, rect.left), window.innerWidth - width - 8);
    const top = window.innerHeight - rect.bottom >= height + 8
      ? rect.bottom + 8
      : Math.max(8, rect.top - height - 8);
    setPopStyle({ left, top, width });
  };

  useLayoutEffect(() => {
    if (!open) return;
    positionPopover();
  }, [open, view]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open) return;
    const onOutside = (e: MouseEvent) => {
      if (!triggerRef.current?.contains(e.target as Node) && !popoverRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('resize', positionPopover);
    window.addEventListener('scroll', positionPopover, true);
    document.addEventListener('mousedown', onOutside);
    document.addEventListener('keydown', onEsc);
    return () => {
      window.removeEventListener('resize', positionPopover);
      window.removeEventListener('scroll', positionPopover, true);
      document.removeEventListener('mousedown', onOutside);
      document.removeEventListener('keydown', onEsc);
    };
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = dtpCalendarDays(viewDate);
  const year = viewDate.getFullYear();
  const yearPageStart = Math.floor(year / 12) * 12;

  const emitDatetime = (date: Date, h: string, min: string) => {
    onChange(dtpToISO(date, h, min));
    setInputValue(dtpFormatDisplay(date, h, min));
    setViewDate(date);
    setHour(h);
    setMinute(min);
  };

  const changeHour = (raw: string) => {
    const n = Math.max(0, Math.min(23, parseInt(raw, 10) || 0));
    const h = String(n).padStart(2,'0');
    setHour(h);
    if (selectedDate) emitDatetime(selectedDate, h, minute);
  };

  const changeMinute = (raw: string) => {
    const n = Math.max(0, Math.min(59, parseInt(raw, 10) || 0));
    const min = String(n).padStart(2,'0');
    setMinute(min);
    if (selectedDate) emitDatetime(selectedDate, hour, min);
  };

  const commitTyped = () => {
    const raw = (inputRef.current?.value ?? inputValue).trim();
    if (!raw) { onChange(''); setInputValue(''); return; }
    const parsed = dtpParseTyped(raw);
    if (!parsed) return;
    emitDatetime(parsed.date, parsed.h, parsed.min);
  };

  const moveView = (dir: -1 | 1) => {
    setViewDate((curr) => {
      if (view === 'days')   return new Date(curr.getFullYear(), curr.getMonth() + dir, 1);
      if (view === 'months') return new Date(curr.getFullYear() + dir, curr.getMonth(), 1);
      return new Date(curr.getFullYear() + dir * 12, curr.getMonth(), 1);
    });
  };

  const popup = (
    <div
      ref={popoverRef}
      role="dialog"
      aria-label="เลือกวันที่และเวลา"
      className="fixed z-[120] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_20px_48px_rgba(15,23,42,0.18)]"
      style={popStyle}
    >
      {/* nav header */}
      <div className="flex h-11 items-center justify-between border-b border-slate-100 px-1.5">
        <button type="button" onClick={() => moveView(-1)} aria-label="ก่อนหน้า"
          className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-900">
          <ArrowLeftIcon className="h-4 w-4" />
        </button>
        <button type="button"
          onClick={() => setView((v) => v === 'days' ? 'months' : v === 'months' ? 'years' : 'days')}
          className="h-7 rounded-md px-2 text-[13px] font-semibold text-slate-900 transition hover:bg-slate-100">
          {view === 'days'   && `${DTP_MONTHS[viewDate.getMonth()]} ${year + 543}`}
          {view === 'months' && `พ.ศ. ${year + 543}`}
          {view === 'years'  && `${yearPageStart + 543} - ${yearPageStart + 11 + 543}`}
        </button>
        <button type="button" onClick={() => moveView(1)} aria-label="ถัดไป"
          className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-900">
          <ArrowRightIcon className="h-4 w-4" />
        </button>
      </div>

      {/* calendar grid */}
      <div className="p-2">
        {view === 'days' && (
          <>
            <div className="grid grid-cols-7 pb-1">
              {DTP_WEEKDAYS.map((w) => (
                <div key={w} className="flex h-7 items-center justify-center text-[10px] font-medium text-slate-400">{w}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-y-1">
              {days.map((date, i) => {
                if (!date) return <span key={`e-${i}`} className="h-8" />;
                const isSel  = dtpSameDay(selectedDate, date);
                const isToday = dtpSameDay(today, date);
                return (
                  <button
                    key={`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`}
                    type="button"
                    onClick={() => emitDatetime(date, hour, minute)}
                    className={cn(
                      'mx-auto flex h-8 w-8 items-center justify-center rounded-md text-xs transition',
                      isSel && 'font-semibold text-white',
                      !isSel && isToday && 'border font-semibold',
                      !isSel && !isToday && 'text-slate-700 hover:bg-slate-50',
                    )}
                    style={isSel ? { backgroundColor: accent } : isToday ? { borderColor: `${accent}66`, color: accent } : undefined}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>
          </>
        )}
        {view === 'months' && (
          <div className="grid grid-cols-3 gap-1.5 py-1.5">
            {DTP_MONTHS_SHORT.map((m, i) => (
              <button key={m} type="button"
                onClick={() => { setViewDate(new Date(year, i, 1)); setView('days'); }}
                className={cn('h-10 rounded-md text-xs transition',
                  i === viewDate.getMonth() ? 'font-semibold text-white' : 'text-slate-600 hover:bg-slate-50')}
                style={i === viewDate.getMonth() ? { backgroundColor: accent } : undefined}
              >
                {m}
              </button>
            ))}
          </div>
        )}
        {view === 'years' && (
          <div className="grid grid-cols-3 gap-1.5 py-1.5">
            {Array.from({ length: 12 }, (_, i) => yearPageStart + i).map((y) => (
              <button key={y} type="button"
                onClick={() => { setViewDate(new Date(y, viewDate.getMonth(), 1)); setView('months'); }}
                className={cn('h-10 rounded-md text-xs transition',
                  y === year ? 'font-semibold text-white' : 'text-slate-600 hover:bg-slate-50')}
                style={y === year ? { backgroundColor: accent } : undefined}
              >
                {y + 543}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* time row */}
      <div className="flex items-center gap-2 border-t border-slate-100 px-3 py-2">
        <span className="shrink-0 text-[11px] font-medium text-slate-500">เวลา</span>
        <div className="flex items-center gap-1">
          <input
            type="number" min={0} max={23}
            value={Number(hour)}
            onChange={(e) => changeHour(e.target.value)}
            onMouseDown={(e) => e.stopPropagation()}
            className="w-12 rounded border border-slate-200 px-1 py-0.5 text-center text-xs font-mono text-slate-800 outline-none focus:border-orange-400"
          />
          <span className="text-xs font-semibold text-slate-400">:</span>
          <input
            type="number" min={0} max={59} step={5}
            value={Number(minute)}
            onChange={(e) => changeMinute(e.target.value)}
            onMouseDown={(e) => e.stopPropagation()}
            className="w-12 rounded border border-slate-200 px-1 py-0.5 text-center text-xs font-mono text-slate-800 outline-none focus:border-orange-400"
          />
        </div>
        <span className="ml-1 text-[11px] text-slate-400">น.</span>
      </div>

      {/* footer */}
      <div className="flex items-center justify-between border-t border-slate-100 px-2 py-1.5">
        <button type="button"
          onClick={() => { onChange(''); setInputValue(''); setOpen(false); }}
          className="inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-[11px] font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-900">
          <XIcon className="h-3.5 w-3.5" />ล้างวันที่
        </button>
        <button type="button"
          onClick={() => { emitDatetime(today, hour, minute); setOpen(false); }}
          className="h-7 rounded-md px-2.5 text-[11px] font-semibold transition hover:bg-orange-50"
          style={{ color: accent }}
        >
          วันนี้
        </button>
      </div>
    </div>
  );

  return (
    <div className="hr-announce-dt-field">
      <span className="hr-leave-field__label">
        {label}{required && <span className="hr-leave-field__required"> *</span>}
      </span>
      <div
        ref={triggerRef}
        className="flex h-9 w-full items-center overflow-hidden rounded-lg border border-slate-200 bg-white transition hover:border-slate-300"
        style={focused ? { borderColor: accent, boxShadow: `0 0 0 2px ${accent}14` } : undefined}
      >
        <input
          ref={inputRef}
          type="text"
          placeholder="DD/MM/YYYY HH:mm"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={() => { setFocused(true); setOpen(true); setView('days'); }}
          onBlur={() => { setFocused(false); commitTyped(); }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { commitTyped(); setOpen(false); inputRef.current?.blur(); }
            if (e.key === 'Escape') { setOpen(false); inputRef.current?.blur(); }
          }}
          className="h-full min-w-0 flex-1 bg-transparent px-3 text-[13px] font-medium text-slate-800 outline-none placeholder:font-normal placeholder:text-slate-400"
        />
        <button
          type="button"
          aria-label="เลือกวันที่"
          aria-expanded={open}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => { setView('days'); setOpen((v) => !v); }}
          className="flex h-full w-9 shrink-0 items-center justify-center outline-none hover:bg-slate-50"
        >
          <span style={{ color: accent }}>
            <CalendarIcon className="h-4 w-4" />
          </span>
        </button>
      </div>
      {mounted && open ? createPortal(popup, document.body) : null}
    </div>
  );
}

// ─── AnnounceDrawer ────────────────────────────────────────────────────────

function AnnounceDrawer({
  initial,
  cats,
  accent,
  onCancel,
  onSave,
}: {
  initial: Announcement | null;
  cats: AnnouncementCategory[];
  accent: string;
  onCancel: () => void;
  onSave: (a: Announcement) => void;
}) {
  const [title,           setTitle]           = useState(initial?.title ?? '');
  const [bodyMd,          setBodyMd]          = useState(initial?.bodyMd ?? '');
  const [imageBase64,     setImageBase64]     = useState(initial?.imageBase64 ?? '');
  const [attachments,     setAttachments]     = useState<AttachmentFile[]>(initial?.attachments ?? []);
  const [catId,           setCatId]           = useState(initial?.categoryId ?? (cats[0]?.id ?? ''));
  const [pinned,          setPinned]          = useState(initial?.pinned ?? false);
  const [timing,      setTiming]      = useState<'immediate' | 'scheduled'>(
    initial?.publishAt ? 'scheduled' : 'immediate',
  );
  const [publishAt,  setPublishAt]  = useState(initial?.publishAt  ?? '');
  const [publishEnd, setPublishEnd] = useState(initial?.publishEnd ?? '');

  const handleSetScheduled = () => {
    if (!publishAt) {
      const now = new Date(Date.now());
      const pad = (n: number) => String(n).padStart(2, '0');
      setPublishAt(
        `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`,
      );
    }
    setTiming('scheduled');
  };
  const [active,    setActive]    = useState(initial ? initial.status === 'published' : true);
  const [scope,     setScope]     = useState<'all' | 'custom'>(initial?.audience.scope ?? 'all');
  const [etIds,     setEtIds]     = useState<string[]>(initial?.audience.employeeTypeIds ?? []);
  const [empTypes,  setEmpTypes]  = useState<EmployeeType[]>([]);

  useEffect(() => {
    publicApiFetch<EmployeeType[]>('/api/humansource/employee-types')
      .then((r) => setEmpTypes(r.length ? r : EMPLOYEE_TYPE_SEED))
      .catch(() => setEmpTypes(EMPLOYEE_TYPE_SEED));
  }, []);

  const toggleEt = (id: string) =>
    setEtIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImageBase64(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    Array.from(e.target.files ?? []).forEach((file) => {
      const group = fileTypeGroup(file.name);
      if (group === 'image') {
        const reader = new FileReader();
        reader.onload = () =>
          setAttachments((prev) =>
            prev.some((a) => a.name === file.name)
              ? prev
              : [...prev, { name: file.name, dataUrl: reader.result as string }],
          );
        reader.readAsDataURL(file);
      } else {
        setAttachments((prev) =>
          prev.some((a) => a.name === file.name)
            ? prev
            : [...prev, { name: file.name, dataUrl: '' }],
        );
      }
    });
    e.target.value = '';
  };

  const removeAttach = (name: string) =>
    setAttachments((prev) => prev.filter((a) => a.name !== name));

  const catOptions = cats
    .filter((c) => c.active || c.id === catId)
    .map((c) => ({ value: c.id, label: c.nameTh }));

  const imgInputRef  = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const status: AnnouncementStatus = active ? 'published' : 'draft';
    onSave({
      id:              initial?.id ?? `A${Date.now()}`,
      title:           title.trim(),
      bodyMd,
      imageBase64,
      attachments,
      categoryId:      catId,
      status,
      publishAt:  timing === 'scheduled' ? (publishAt  || null) : null,
      publishEnd: timing === 'scheduled' ? (publishEnd || null) : null,
      pinned,
      audience: {
        scope,
        companyIds:      initial?.audience.companyIds  ?? [],
        orgNodeIds:      initial?.audience.orgNodeIds  ?? [],
        employeeTypeIds: scope === 'custom' ? etIds     : [],
        employeeIds:     initial?.audience.employeeIds ?? [],
      },
    });
  };

  return (
    <>
      <div className="fixed inset-0 z-[69] bg-black/30" onClick={onCancel} />
      <div className="hr-announce-drawer" role="dialog" aria-modal="true">
        <form className="flex min-h-0 flex-1 flex-col" onSubmit={submit}>

          <header className="hr-announce-drawer__head">
            <h3 className="hr-announce-drawer__title">
              {initial ? 'แก้ไขประกาศ' : 'เพิ่มประกาศ'}
            </h3>
            <button type="button" className="hr-announce-drawer__close" onClick={onCancel} aria-label="ปิด">
              <XIcon className="h-4 w-4" />
            </button>
          </header>

          <div className="hr-announce-drawer__body">

            {/* รูปภาพปก */}
            <div className="hr-announce-drawer-field">
              <span className="hr-leave-field__label">รูปภาพปก</span>
              {imageBase64 ? (
                <div className="hr-announce-img-preview">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imageBase64} alt="ปกประกาศ" className="hr-announce-img-thumb" />
                  <button type="button" className="hr-announce-img-remove" onClick={() => setImageBase64('')} aria-label="ลบรูปภาพ">
                    <XIcon className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <button type="button" className="hr-announce-upload-area" onClick={() => imgInputRef.current?.click()}>
                  <svg className="hr-announce-upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  <span className="hr-announce-upload-hint">คลิกเพื่ออัปโหลดรูปภาพ</span>
                  <span className="hr-announce-upload-sub">PNG, JPG, WEBP</span>
                </button>
              )}
              <input ref={imgInputRef} type="file" accept="image/*" className="sr-only" onChange={handleImageChange} />
            </div>

            {/* หัวข้อ */}
            <div className="hr-announce-drawer-field">
              <span className="hr-leave-field__label">
                หัวข้อ <span className="hr-leave-field__required">*</span>
              </span>
              <input className="hr-leave-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="กรอกหัวข้อประกาศ" required autoFocus />
            </div>

            {/* รายละเอียด */}
            <div className="hr-announce-drawer-field">
              <span className="hr-leave-field__label">รายละเอียด</span>
              <textarea className="hr-announce-textarea" rows={4} value={bodyMd} onChange={(e) => setBodyMd(e.target.value)} placeholder="กรอกรายละเอียดของประกาศ" />
            </div>

            {/* ไฟล์แนบ */}
            <div className="hr-announce-drawer-field">
              <span className="hr-leave-field__label">ไฟล์แนบ</span>
              <div className="hr-announce-attach-grid">
                <button type="button" className="hr-announce-attach-add" onClick={() => fileInputRef.current?.click()}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  เลือกไฟล์
                </button>
                {attachments.map((file) => (
                  <FileThumb key={file.name} file={file} onRemove={() => removeAttach(file.name)} />
                ))}
              </div>
              <input ref={fileInputRef} type="file" multiple className="sr-only" onChange={handleFileChange} />
            </div>

            {/* Settings block — hr-setting-row pattern (label left · control right · hairline dividers) */}
            <div className="hr-setting-rows hr-announce-setting-rows">

              {/* ปักหมุด */}
              <div className="hr-setting-row">
                <span className="hr-setting-row__label">ปักหมุดประกาศนี้</span>
                <label style={{ cursor: 'pointer', display: 'inline-flex' }}>
                  <input type="checkbox" className="sr-only" checked={pinned} onChange={(e) => setPinned(e.target.checked)} />
                  <span className="hr-leave-switch"><span className="hr-leave-switch__thumb" /></span>
                </label>
              </div>

              {/* หมวดประกาศ */}
              {catOptions.length > 0 && (
                <div className="hr-setting-row">
                  <span className="hr-setting-row__label">หมวดประกาศ</span>
                  <div className="hr-announce-setting-select">
                    <HrCustomSelect options={catOptions} value={catId} onChange={(v) => setCatId(v as string)} />
                  </div>
                </div>
              )}

              {/* ตั้งเวลาประกาศ */}
              <div className="hr-setting-row">
                <span className="hr-setting-row__label">ตั้งเวลาประกาศ</span>
                <div className="hr-announce-scope-btns">
                  <button type="button" className={`hr-announce-scope-btn${timing === 'immediate' ? ' hr-announce-scope-btn--active' : ''}`} onClick={() => setTiming('immediate')}>ประกาศทันที</button>
                  <button type="button" className={`hr-announce-scope-btn${timing === 'scheduled' ? ' hr-announce-scope-btn--active' : ''}`} onClick={handleSetScheduled}>รอประกาศ</button>
                </div>
              </div>
              {timing === 'scheduled' && (
                <div className="hr-announce-setting-row-expand">
                  <div className="hr-announce-dt-row">
                    <DateTimePicker label="วันที่เริ่มประกาศ" required value={publishAt} onChange={setPublishAt} accent={accent} />
                    <DateTimePicker label="วันที่จบประกาศ" value={publishEnd} onChange={setPublishEnd} accent={accent} />
                  </div>
                </div>
              )}

              {/* ผู้รับประกาศ */}
              <div className="hr-setting-row">
                <span className="hr-setting-row__label">ผู้รับประกาศ</span>
                <div className="hr-announce-scope-btns">
                  <button type="button" className={`hr-announce-scope-btn${scope === 'all' ? ' hr-announce-scope-btn--active' : ''}`} onClick={() => setScope('all')}>ทุกคน</button>
                  <button type="button" className={`hr-announce-scope-btn${scope === 'custom' ? ' hr-announce-scope-btn--active' : ''}`} onClick={() => setScope('custom')}>กำหนดเอง</button>
                </div>
              </div>
              {scope === 'custom' && (
                <div className="hr-announce-setting-row-expand">
                  <div className="hr-announce-emp-chips">
                    {empTypes.filter((et) => et.active).map((et) => (
                      <button key={et.id} type="button" className={`hr-announce-emp-chip${etIds.includes(et.id) ? ' hr-announce-emp-chip--active' : ''}`} onClick={() => toggleEt(et.id)}>
                        {et.nameTh}
                      </button>
                    ))}
                  </div>
                </div>
              )}

            </div>

          </div>

          <footer className="hr-announce-drawer__foot">
            <label className="hr-announce-toggle-row" style={{ cursor: 'pointer' }}>
              <input type="checkbox" className="sr-only" checked={active} onChange={(e) => setActive(e.target.checked)} />
              <span className="hr-leave-switch"><span className="hr-leave-switch__thumb" /></span>
              <span className="hr-announce-toggle-label">เปิดใช้งาน</span>
            </label>
            <div className="flex items-center gap-2 ml-auto">
              <button type="button" className="hr-position-modal__cancel" onClick={onCancel}>ยกเลิก</button>
              <button type="submit" className="hr-position-modal__save" style={{ backgroundColor: accent }}>
                {initial ? 'บันทึก' : 'เพิ่ม'}
              </button>
            </div>
          </footer>

        </form>
      </div>
    </>
  );
}

// ─── FilterChipSelect ──────────────────────────────────────────────────────

function FilterChipSelect({
  label,
  value,
  options,
  onChange,
  accent,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
  accent: string;
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
      <div className="hr-filter-chip hr-filter-chip--active" style={{ borderColor: accent, color: accent }}>
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

// ─── AnnouncementsList ─────────────────────────────────────────────────────

function AnnouncementsList({ accent }: { accent: string }) {
  const [items,        setItems]        = useState<Announcement[]>([]);
  const [cats,         setCats]         = useState<AnnouncementCategory[]>([]);
  const [search,       setSearch]       = useState('');
  const [filterSt,     setFilterSt]     = useState('');
  const [drawer,       setDrawer]       = useState<'create' | Announcement | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Announcement | null>(null);
  const [selected,     setSelected]     = useState<Set<string>>(new Set());

  const isMounted = useRef(true);
  useEffect(() => { isMounted.current = true; return () => { isMounted.current = false; }; }, []);

  useEffect(() => {
    Promise.all([
      publicApiFetch<Announcement[]>('/api/humansource/announcements'),
      publicApiFetch<AnnouncementCategory[]>('/api/humansource/announcements/categories'),
    ]).then(([ann, cats]) => {
      if (!isMounted.current) return;
      setItems(ann.length ? ann : ANNOUNCEMENT_SEED);
      setCats(cats.length ? cats : ANNOUNCEMENT_CATEGORY_SEED);
    }).catch(() => {
      if (!isMounted.current) return;
      setItems(ANNOUNCEMENT_SEED);
      setCats(ANNOUNCEMENT_CATEGORY_SEED);
    });
  }, []);

  const q = search.toLowerCase();
  const filtered = items.filter((a) => {
    const matchSearch = !q || a.title.toLowerCase().includes(q);
    const matchStatus = !filterSt || a.status === filterSt;
    return matchSearch && matchStatus;
  });

  const allSelected  = filtered.length > 0 && filtered.every((a) => selected.has(a.id));
  const someSelected = filtered.some((a) => selected.has(a.id));
  const headerRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (headerRef.current)
      headerRef.current.indeterminate = someSelected && !allSelected;
  }, [someSelected, allSelected]);

  const toggleAll = () => {
    setSelected((prev) => {
      const n = new Set(prev);
      if (allSelected) { filtered.forEach((a) => n.delete(a.id)); }
      else             { filtered.forEach((a) => n.add(a.id)); }
      return n;
    });
  };

  const toggleOne = (id: string) =>
    setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const handleSave = async (saved: Announcement) => {
    const isEdit = items.some((a) => a.id === saved.id);
    if (isEdit) {
      const updated = await publicApiFetch<Announcement>(`/api/humansource/announcements/${saved.id}`, { method: 'PATCH', body: JSON.stringify(saved) });
      setItems((prev) => prev.map((a) => a.id === saved.id ? updated : a));
    } else {
      const created = await publicApiFetch<Announcement>('/api/humansource/announcements', { method: 'POST', body: JSON.stringify(saved) });
      setItems((prev) => [...prev, created]);
    }
    setDrawer(null);
  };

  const handleDelete = async (target: Announcement) => {
    await publicApiFetch(`/api/humansource/announcements/${target.id}`, { method: 'DELETE' });
    setItems((prev) => prev.filter((a) => a.id !== target.id));
    setSelected((prev) => { const n = new Set(prev); n.delete(target.id); return n; });
    setDeleteTarget(null);
  };

  const catMap = new Map(cats.map((c) => [c.id, c]));

  return (
    <div className="hr-announce-page">
      {/* toolbar */}
      <div className="hr-settings-toolbar">
        <div className="hr-settings-toolbar__filters">
          <div className="hr-leave-board__search">
            <SearchIcon className="h-3.5 w-3.5" />
            <input
              type="search"
              placeholder="ค้นหาชื่อประกาศ"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="hr-leave-board__search-input"
            />
          </div>
        </div>
        <div className="hr-filter-chip-group">
          <FilterChipSelect
            label="สถานะ"
            value={filterSt}
            options={STATUS_CHIP_OPTIONS}
            onChange={setFilterSt}
            accent={accent}
          />
          <button
            type="button"
            className="hr-announce-create-btn"
            style={{ backgroundColor: accent }}
            onClick={() => setDrawer('create')}
          >
            <PlusIcon className="h-4 w-4" />
            สร้างประกาศ
          </button>
        </div>
      </div>

      {/* table */}
      <div className="hr-announce-table-wrap">
        <table className="hr-announce-table">
          <thead>
            <tr>
              <th className="hr-announce-table__check">
                <input type="checkbox" ref={headerRef} checked={allSelected} onChange={toggleAll} />
              </th>
              <th>ชื่อประกาศ</th>
              <th className="hr-announce-table__cat">หมวด</th>
              <th className="hr-announce-table__status">สถานะ</th>
              <th className="hr-announce-table__date">วันเผยแพร่</th>
              <th className="hr-announce-table__pin">ปักหมุด</th>
              <th className="hr-announce-table__aud">ผู้รับ</th>
              <th className="hr-announce-table__actions" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => {
              const cat = catMap.get(a.categoryId);
              return (
                <tr key={a.id} className={selected.has(a.id) ? 'hr-announce-row--selected' : ''}>
                  <td className="hr-announce-table__check">
                    <input type="checkbox" checked={selected.has(a.id)} onChange={() => toggleOne(a.id)} />
                  </td>
                  <td className="hr-announce-table__title">{a.title}</td>
                  <td className="hr-announce-table__cat">
                    {cat ? (
                      <span className="hr-announce-cat-pill">
                        <span className="hr-announce-cat-dot" style={{ background: cat.color }} />
                        {cat.nameTh}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="hr-announce-table__status">
                    <span className={statusPillClass(a.status)}>{STATUS_LABELS[a.status]}</span>
                  </td>
                  <td className="hr-announce-table__date">{shortDate(a.publishAt)}</td>
                  <td className="hr-announce-table__pin">
                    {a.pinned ? <span className="hr-announce-pin">★</span> : null}
                  </td>
                  <td className="hr-announce-table__aud">{audienceSummary(a.audience)}</td>
                  <td className="hr-announce-table__actions">
                    <div className="hr-announce-row-actions">
                      <button
                        type="button"
                        className="hr-announce-icon-btn"
                        onClick={() => setDrawer(a)}
                        title="แก้ไข"
                      >
                        <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        className="hr-announce-icon-btn hr-announce-icon-btn--danger"
                        onClick={() => setDeleteTarget(a)}
                        title="ลบ"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="hr-announce-empty">
                  {search || filterSt ? 'ไม่พบประกาศที่ตรงกับการค้นหา' : 'ยังไม่มีประกาศ กด "สร้างประกาศ" เพื่อเริ่มต้น'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {drawer !== null && (
        <AnnounceDrawer
          initial={drawer === 'create' ? null : drawer}
          cats={cats}
          accent={accent}
          onCancel={() => setDrawer(null)}
          onSave={handleSave}
        />
      )}
      {deleteTarget && (
        <DeleteConfirm
          message={`ลบประกาศ "${deleteTarget.title}" ใช่หรือไม่?`}
          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

// ─── AnnouncementsBoard (export) ───────────────────────────────────────────

export function AnnouncementsBoard({ accent }: { accent: string }) {
  return <AnnouncementsList accent={accent} />;
}

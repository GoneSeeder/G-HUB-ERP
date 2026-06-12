'use client';

import { CSSProperties, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeftIcon, ArrowRightIcon, CalendarIcon, XIcon } from '@/components/ui/icons';
import { cn } from '@/lib/cn';

const MONTHS_TH = [
  'มกราคม',
  'กุมภาพันธ์',
  'มีนาคม',
  'เมษายน',
  'พฤษภาคม',
  'มิถุนายน',
  'กรกฎาคม',
  'สิงหาคม',
  'กันยายน',
  'ตุลาคม',
  'พฤศจิกายน',
  'ธันวาคม',
];

const MONTHS_TH_SHORT = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
const WEEKDAYS_TH = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

type CalendarView = 'days' | 'months' | 'years';

export type DatePickerProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: boolean;
  disabled?: boolean;
  disableFuture?: boolean;
  minYear?: number;
  className?: string;
};

function parseDate(value: string) {
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
    ? date
    : null;
}

function parseTypedDate(value: string) {
  const parts = value.trim().split(/[\s./-]+/).filter(Boolean);
  if (parts.length !== 3 || parts.some((part) => !/^\d+$/.test(part))) return null;

  const day = Number(parts[0]);
  const month = Number(parts[1]);
  const enteredYear = Number(parts[2]);
  const year = enteredYear >= 2400 ? enteredYear - 543 : enteredYear;
  const date = new Date(year, month - 1, day);

  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
    ? date
    : null;
}

function formatValue(date: Date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${date.getFullYear()}`;
}

function formatDisplay(date: Date) {
  return `${date.getDate()} ${MONTHS_TH[date.getMonth()]} ${date.getFullYear() + 543}`;
}

function formatEditable(date: Date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${date.getFullYear() + 543}`;
}

function sameDay(left: Date | null, right: Date) {
  return Boolean(
    left &&
      left.getFullYear() === right.getFullYear() &&
      left.getMonth() === right.getMonth() &&
      left.getDate() === right.getDate(),
  );
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getCalendarDays(viewDate: Date) {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  return Array.from({ length: 42 }, (_, index) => {
    const day = index - firstWeekday + 1;
    return day >= 1 && day <= daysInMonth ? new Date(year, month, day) : null;
  });
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'เลือกวันที่',
  error = false,
  disabled = false,
  disableFuture = false,
  minYear = 1900,
  className,
}: DatePickerProps) {
  const selectedDate = parseDate(value);
  const triggerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [inputValue, setInputValue] = useState(() => selectedDate ? formatDisplay(selectedDate) : '');
  const [view, setView] = useState<CalendarView>('days');
  const [viewDate, setViewDate] = useState(() => selectedDate ?? new Date());
  const [popoverStyle, setPopoverStyle] = useState<CSSProperties>({});

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (selectedDate) {
      setViewDate(selectedDate);
      if (!focused) setInputValue(formatDisplay(selectedDate));
    } else if (!focused && !value) {
      setInputValue('');
    }
  }, [value, focused]); // eslint-disable-line react-hooks/exhaustive-deps

  const positionPopover = () => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const width = Math.min(288, window.innerWidth - 16);
    const height = 330;
    const left = Math.min(Math.max(8, rect.left), window.innerWidth - width - 8);
    const top = window.innerHeight - rect.bottom >= height + 8
      ? rect.bottom + 8
      : Math.max(8, rect.top - height - 8);

    setPopoverStyle({ left, top, width });
  };

  useLayoutEffect(() => {
    if (!open) return;
    positionPopover();
  }, [open, view]);

  useEffect(() => {
    if (!open) return;

    const closeOnOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!triggerRef.current?.contains(target) && !popoverRef.current?.contains(target)) {
        setOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    window.addEventListener('resize', positionPopover);
    window.addEventListener('scroll', positionPopover, true);
    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      window.removeEventListener('resize', positionPopover);
      window.removeEventListener('scroll', positionPopover, true);
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);

  const today = startOfDay(new Date());
  const days = getCalendarDays(viewDate);
  const year = viewDate.getFullYear();
  const yearPageStart = Math.floor(year / 12) * 12;
  const isDisabledDate = (date: Date) =>
    date.getFullYear() < minYear || (disableFuture && startOfDay(date) > today);

  const moveView = (direction: -1 | 1) => {
    setViewDate((current) => {
      if (view === 'days') return new Date(current.getFullYear(), current.getMonth() + direction, 1);
      if (view === 'months') return new Date(current.getFullYear() + direction, current.getMonth(), 1);
      return new Date(current.getFullYear() + direction * 12, current.getMonth(), 1);
    });
  };

  const selectDate = (date: Date) => {
    if (isDisabledDate(date)) return;
    onChange(formatValue(date));
    setInputValue(formatDisplay(date));
    setViewDate(date);
    setOpen(false);
  };

  const commitTypedDate = () => {
    const trimmedValue = (inputRef.current?.value ?? inputValue).trim();
    if (!trimmedValue) {
      onChange('');
      setInputValue('');
      return;
    }

    const typedDate = parseTypedDate(trimmedValue);
    if (!typedDate || isDisabledDate(typedDate)) {
      onChange(trimmedValue);
      return;
    }

    onChange(formatValue(typedDate));
    setInputValue(formatDisplay(typedDate));
    setViewDate(typedDate);
  };

  const calendar = (
    <div
      ref={popoverRef}
      role="dialog"
      aria-label="เลือกวันที่"
      className="fixed z-[120] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_20px_48px_rgba(15,23,42,0.18)]"
      style={popoverStyle}
    >
      <div className="flex h-11 items-center justify-between border-b border-slate-100 px-1.5">
        <button
          type="button"
          onClick={() => moveView(-1)}
          aria-label="ก่อนหน้า"
          className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
        >
          <ArrowLeftIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => setView((current) => current === 'days' ? 'months' : current === 'months' ? 'years' : 'days')}
          className="h-7 rounded-md px-2 text-[13px] font-semibold text-slate-900 transition hover:bg-slate-100"
        >
          {view === 'days' && `${MONTHS_TH[viewDate.getMonth()]} ${year + 543}`}
          {view === 'months' && `พ.ศ. ${year + 543}`}
          {view === 'years' && `${yearPageStart + 543} - ${yearPageStart + 11 + 543}`}
        </button>
        <button
          type="button"
          onClick={() => moveView(1)}
          aria-label="ถัดไป"
          className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
        >
          <ArrowRightIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="p-2">
        {view === 'days' ? (
          <>
            <div className="grid grid-cols-7 pb-1">
              {WEEKDAYS_TH.map((weekday) => (
                <div key={weekday} className="flex h-7 items-center justify-center text-[10px] font-medium text-slate-400">
                  {weekday}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-y-1">
              {days.map((date, index) => {
                if (!date) return <span key={`empty-${index}`} className="h-8" />;
                const selected = sameDay(selectedDate, date);
                const currentDay = sameDay(today, date);
                const dateDisabled = isDisabledDate(date);
                return (
                  <button
                    key={formatValue(date)}
                    type="button"
                    disabled={dateDisabled}
                    onClick={() => selectDate(date)}
                    className={cn(
                      'mx-auto flex h-8 w-8 items-center justify-center rounded-md text-xs transition',
                      selected && 'bg-indigo-600 font-semibold text-white',
                      !selected && currentDay && 'border border-indigo-300 font-semibold text-indigo-700',
                      !selected && !currentDay && !dateDisabled && 'text-slate-700 hover:bg-indigo-50 hover:text-indigo-700',
                      dateDisabled && 'cursor-not-allowed text-slate-300',
                    )}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>
          </>
        ) : null}

        {view === 'months' ? (
          <div className="grid grid-cols-3 gap-1.5 py-1.5">
            {MONTHS_TH_SHORT.map((month, index) => {
              const monthDisabled =
                year < minYear ||
                (disableFuture && new Date(year, index, 1) > new Date(today.getFullYear(), today.getMonth(), 1));
              return (
                <button
                  key={month}
                  type="button"
                  disabled={monthDisabled}
                  onClick={() => {
                    setViewDate(new Date(year, index, 1));
                    setView('days');
                  }}
                  className={cn(
                    'h-10 rounded-md text-xs transition',
                    index === viewDate.getMonth() ? 'bg-indigo-600 font-semibold text-white' : 'text-slate-600 hover:bg-indigo-50',
                    monthDisabled && 'cursor-not-allowed bg-transparent text-slate-300 hover:bg-transparent',
                  )}
                >
                  {month}
                </button>
              );
            })}
          </div>
        ) : null}

        {view === 'years' ? (
          <div className="grid grid-cols-3 gap-1.5 py-1.5">
            {Array.from({ length: 12 }, (_, index) => yearPageStart + index).map((itemYear) => {
              const yearDisabled = itemYear < minYear || (disableFuture && itemYear > today.getFullYear());
              return (
                <button
                  key={itemYear}
                  type="button"
                  disabled={yearDisabled}
                  onClick={() => {
                    setViewDate(new Date(itemYear, viewDate.getMonth(), 1));
                    setView('months');
                  }}
                  className={cn(
                    'h-10 rounded-md text-xs transition',
                    itemYear === year ? 'bg-indigo-600 font-semibold text-white' : 'text-slate-600 hover:bg-indigo-50',
                    yearDisabled && 'cursor-not-allowed bg-transparent text-slate-300 hover:bg-transparent',
                  )}
                >
                  {itemYear + 543}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 px-2 py-1.5">
        <button
          type="button"
          onClick={() => {
            onChange('');
            setInputValue('');
            setOpen(false);
          }}
          className="inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-[11px] font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
        >
          <XIcon className="h-3.5 w-3.5" />
          ล้างวันที่
        </button>
        <button
          type="button"
          disabled={isDisabledDate(today)}
          onClick={() => selectDate(today)}
          className="h-7 rounded-md px-2.5 text-[11px] font-semibold text-indigo-600 transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:text-slate-300"
        >
          วันนี้
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div
        ref={triggerRef}
        className={cn(
          'flex h-11 w-full items-center rounded-lg border bg-white text-sm transition focus-within:ring-4',
          error
            ? 'border-rose-500 focus-within:border-rose-500 focus-within:ring-rose-50'
            : 'border-slate-200 hover:border-slate-300 focus-within:border-indigo-400 focus-within:ring-indigo-50',
          disabled && 'cursor-not-allowed bg-slate-100',
          className,
        )}
      >
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          disabled={disabled}
          value={inputValue}
          placeholder={placeholder}
          aria-label={placeholder}
          aria-invalid={error}
          onFocus={() => {
            setFocused(true);
            if (selectedDate) setInputValue(formatEditable(selectedDate));
          }}
          onChange={(event) => {
            setInputValue(event.target.value);
            onChange(event.target.value);
          }}
          onBlur={() => {
            commitTypedDate();
            setFocused(false);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              commitTypedDate();
              setFocused(false);
              setOpen(false);
              inputRef.current?.blur();
            }
          }}
          className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm font-medium text-slate-800 outline-none placeholder:font-normal placeholder:text-slate-400 disabled:cursor-not-allowed"
        />
        <button
          type="button"
          disabled={disabled}
          aria-label={placeholder}
          aria-expanded={open}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => {
            setView('days');
            setViewDate(selectedDate ?? new Date());
            setOpen((current) => !current);
          }}
          className="flex h-full w-10 flex-shrink-0 items-center justify-center rounded-r-lg outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-400 disabled:cursor-not-allowed"
        >
          <CalendarIcon className={cn('h-4 w-4', error ? 'text-rose-500' : 'text-indigo-500')} />
        </button>
      </div>
      {mounted && open ? createPortal(calendar, document.body) : null}
    </>
  );
}

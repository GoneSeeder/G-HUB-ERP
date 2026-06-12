'use client';

import { ReactNode, useState } from 'react';
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
        'inline-flex min-h-10 items-center justify-center gap-2 rounded-2xl px-4 text-sm font-medium transition duration-200 focus:outline-none focus:ring-4 focus:ring-indigo-100',
        variant === 'primary' && 'bg-slate-950 text-white shadow-[0_14px_28px_rgba(15,23,42,0.16)] hover:bg-slate-800',
        variant === 'secondary' && 'bg-white text-slate-700 shadow-sm shadow-slate-200/80 hover:bg-indigo-50 hover:text-indigo-700',
        variant === 'danger' && 'bg-rose-50 text-rose-600 hover:bg-rose-100',
        variant === 'ghost' && 'border-transparent bg-transparent text-slate-500 hover:bg-white hover:text-slate-900',
        className,
      )}
    >
      {children}
    </button>
  );
}

export function HrCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <section className={cn('rounded-[22px] bg-white p-5 shadow-sm shadow-slate-200/80', className)}>
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
    <label className="relative block min-w-0 flex-1">
      <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        value={value}
        readOnly
        placeholder={placeholder}
        className="h-11 w-full rounded-2xl bg-white pl-10 pr-4 text-sm text-slate-700 shadow-sm shadow-slate-200/80 outline-none transition placeholder:text-slate-400 focus:ring-4 focus:ring-indigo-100"
      />
    </label>
  );
}

export function HrSelectMock({ label, value }: { label: string; value: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex h-11 min-w-36 items-center justify-between gap-3 rounded-2xl bg-white px-4 text-left text-sm text-slate-700 shadow-sm shadow-slate-200/80 transition hover:bg-indigo-50 focus:outline-none focus:ring-4 focus:ring-indigo-100"
      >
        <span className="truncate">{label}: {value}</span>
        <span className={cn('h-2 w-2 rotate-45 border-b-2 border-r-2 border-slate-400 transition', open && 'rotate-[225deg]')} />
      </button>
      {open ? (
        <div className="absolute right-0 top-12 z-30 w-48 rounded-2xl bg-white p-2 shadow-[0_18px_45px_rgba(15,23,42,0.14)]">
          {['ทั้งหมด', 'เปิด', 'ปิด'].map((option) => (
            <button key={option} type="button" className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm text-slate-600 hover:bg-indigo-50 hover:text-indigo-700">
              {option}
              {option === value ? <CheckIcon className="h-4 w-4" /> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function HrDatePickerMock({ label = 'ช่วงวันที่' }: { label?: string }) {
  return (
    <button type="button" className="inline-flex h-11 items-center gap-2 rounded-2xl bg-white px-4 text-sm text-slate-600 shadow-sm shadow-slate-200/80 transition hover:bg-indigo-50 focus:outline-none focus:ring-4 focus:ring-indigo-100">
      <CalendarIcon className="h-4 w-4 text-indigo-500" />
      {label}
    </button>
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
          className={cn('rounded-xl px-3 py-2 text-sm font-medium text-slate-500 transition', tab === active && 'bg-indigo-600 text-white shadow-sm')}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

export function HrEmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-[22px] bg-indigo-50/55 px-6 py-10 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm shadow-indigo-100">
        <XIcon className="h-6 w-6" />
      </div>
      <h3 className="text-base font-semibold text-slate-950">{title}</h3>
      <p className="mt-2 max-w-md text-sm font-light text-slate-500">{description}</p>
    </div>
  );
}

export function HrLoadingState() {
  return (
    <div className="space-y-3 rounded-[22px] bg-white p-5 shadow-sm shadow-slate-200/70">
      {[0, 1, 2].map((item) => (
        <div key={item} className="h-12 animate-pulse rounded-2xl bg-slate-100" />
      ))}
    </div>
  );
}

export function HrModalMock() {
  return (
    <div className="rounded-[22px] bg-slate-50 p-4">
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <p className="text-sm font-semibold text-slate-900">HR Modal</p>
        <p className="mt-1 text-xs text-slate-500">ตัวอย่าง modal แบบ custom สำหรับฟอร์ม HR</p>
      </div>
    </div>
  );
}

export function HrDrawerMock() {
  return (
    <div className="rounded-[22px] bg-white p-4 shadow-sm shadow-slate-200/70">
      <div className="ml-auto min-h-24 w-full max-w-xs rounded-2xl bg-indigo-50 p-4 text-sm text-indigo-700">
        HR Drawer สำหรับรายละเอียดด้านข้าง
      </div>
    </div>
  );
}

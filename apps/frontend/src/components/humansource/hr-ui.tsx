'use client';

import { ReactNode, useEffect, useRef, useState } from 'react';
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

export function HrCustomSelect({
  value,
  options,
  onChange,
  label,
  className,
}: {
  value: string;
  options: HrCustomSelectOption[];
  onChange: (value: string) => void;
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [openAbove, setOpenAbove] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const normalizedOptions = options.map((option) => (
    typeof option === 'string' ? { value: option, label: option } : option
  ));
  const selectedOption = normalizedOptions.find((option) => option.value === value) ?? normalizedOptions[0];

  useEffect(() => {
    if (!open) return;

    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
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
        onClick={() => {
          if (!open) {
            const rect = rootRef.current?.getBoundingClientRect();
            setOpenAbove(Boolean(rect && window.innerHeight - rect.bottom < 260 && rect.top > 260));
          }
          setOpen((current) => !current);
        }}
      >
        <span className="hr-custom-select__value">{selectedOption?.label ?? value}</span>
        <span className="hr-custom-select__chevron" aria-hidden="true" />
      </button>

      {open ? (
        <div className={cn('hr-custom-select__menu', openAbove ? 'hr-custom-select__menu--above' : 'hr-custom-select__menu--below')} role="listbox">
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
                <span className="min-w-0">
                  <span className="hr-custom-select__option-label">{option.label}</span>
                  {option.description ? <span className="hr-custom-select__option-description">{option.description}</span> : null}
                </span>
                {selected ? <CheckIcon className="hr-custom-select__check" /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
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

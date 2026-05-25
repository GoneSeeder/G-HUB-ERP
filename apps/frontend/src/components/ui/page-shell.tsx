import { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type PageShellProps = {
  children: ReactNode;
  className?: string;
};

export function PageShell({ children, className }: PageShellProps) {
  return (
    <section
      className={cn(
        'mx-auto flex min-h-full w-full max-w-[1180px] flex-col gap-4',
        className,
      )}
    >
      {children}
    </section>
  );
}

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
  enterAnimation?: boolean;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
  enterAnimation = true,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex shrink-0 flex-wrap items-end justify-between gap-3 border-b border-slate-200 pb-4',
        className,
      )}
    >
      <div className="min-w-0">
        {eyebrow ? (
          <p className={cn(enterAnimation && 'erp-breadcrumb-enter', 'text-xs font-medium uppercase tracking-wide text-slate-500')}>
            {eyebrow}
          </p>
        ) : null}
        <h1 className={cn(enterAnimation && 'erp-title-enter', 'mt-1 text-2xl font-semibold leading-tight text-slate-950')}>
          {title}
        </h1>
        {description ? (
          <p className={cn(enterAnimation && 'erp-title-enter', 'mt-1 max-w-3xl text-sm font-light text-slate-600')}>
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className={cn(enterAnimation && 'erp-controls-enter', 'flex shrink-0 flex-wrap items-center justify-end gap-2')}>
          {actions}
        </div>
      ) : null}
    </div>
  );
}

type DataPanelProps = {
  children: ReactNode;
  className?: string;
  enterAnimation?: boolean;
};

export function DataPanel({ children, className, enterAnimation = true }: DataPanelProps) {
  return (
    <div
      className={cn(
        enterAnimation && 'erp-content-enter',
        'min-h-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.045)]',
        className,
      )}
    >
      {children}
    </div>
  );
}

type PanelHeaderProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
};

export function PanelHeader({
  title,
  description,
  actions,
  className,
}: PanelHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3',
        className,
      )}
    >
      <div className="min-w-0">
        <h2 className="text-base font-semibold text-slate-950">{title}</h2>
        {description ? (
          <p className="mt-0.5 text-xs font-light text-slate-500">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
          {actions}
        </div>
      ) : null}
    </div>
  );
}

import Link from 'next/link';
import { ReactNode } from 'react';
import { ArrowRightIcon } from '@/components/ui/icons';
import { cn } from '@/lib/cn';

type AppCardProps = {
  eyebrow: string;
  title: string;
  description: string;
  code: string;
  href?: string;
  icon: ReactNode;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
};

export function AppCard({
  eyebrow,
  title,
  description,
  href,
  icon,
  disabled,
  className,
  onClick,
}: AppCardProps) {
  const content = (
    <>
      <div className="flex w-full min-w-0 items-center gap-3">
        {icon}
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-baseline gap-2">
            <h3
              className={cn(
                'truncate text-sm font-medium tracking-normal',
                disabled ? 'text-slate-500' : 'text-slate-950',
              )}
            >
              {title}
            </h3>
            <span className="hidden flex-shrink-0 truncate text-[10px] font-light uppercase tracking-wide text-slate-400 sm:block">
              {eyebrow}
            </span>
          </div>
          <p className="mt-0.5 line-clamp-1 text-xs font-light leading-5 text-slate-500">
            {description}
          </p>
        </div>
        {disabled ? (
          <span className="flex-shrink-0 rounded-full bg-amber-50 px-2 py-1 text-[10px] font-medium text-amber-500">
            Coming soon
          </span>
        ) : (
          <span
            className="ml-auto flex-shrink-0 opacity-0 transition-all duration-200 ease-out group-hover:translate-x-0.5 group-hover:opacity-100"
            aria-hidden="true"
          >
            <ArrowRightIcon className="h-4 w-4 text-slate-400 transition-colors duration-200 group-hover:text-[#0752d6]" />
          </span>
        )}
      </div>
    </>
  );

  const cardClass = cn(
    'group flex min-h-[48px] rounded-xl border px-4 py-3 transition-colors duration-200',
    disabled
      ? 'cursor-not-allowed border-slate-200 bg-white/55 text-slate-400'
      : 'border-slate-200 bg-white hover:border-[#0752d6]/30 hover:bg-[#0752d6]/[0.07]',
    className,
  );

  if (disabled) {
    return (
      <div className={cardClass} aria-disabled="true" title="Coming soon">
        {content}
      </div>
    );
  }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cn(cardClass, 'w-full text-left')}>
        {content}
      </button>
    );
  }

  if (!href) {
    return <div className={cardClass}>{content}</div>;
  }

  return (
    <Link href={href} className={cardClass}>
      {content}
    </Link>
  );
}

import { cn } from '@/lib/cn';

type LoadingStateProps = {
  label?: string | null;
  className?: string;
};

export function LoadingState({ label = 'Loading...', className }: LoadingStateProps) {
  return (
    <div className={cn('flex min-h-[320px] flex-col items-center justify-center gap-3 text-slate-500', className)}>
      <svg className="h-8 w-8 animate-spin text-[#1478ff]" viewBox="0 0 32 32" aria-hidden="true">
        <circle
          cx="16"
          cy="16"
          r="12"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="56 20"
        />
      </svg>
      {label ? <p className="text-sm font-medium">{label}</p> : null}
    </div>
  );
}

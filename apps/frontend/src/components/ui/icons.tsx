import { ReactNode } from 'react';

type IconProps = {
  className?: string;
};

function SvgIcon({
  className = 'h-4 w-4',
  children,
}: IconProps & { children: ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={`${className} fill-none stroke-current`}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

export function UsersIcon({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={`${className} fill-current`}>
      <path d="M8.5 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm7-1a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3 18.25C3 15.9 5.01 14 7.5 14h2c2.49 0 4.5 1.9 4.5 4.25V19a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-.75Zm12.4 1.75h4.85a.75.75 0 0 0 .75-.75v-.5c0-2.07-1.68-3.75-3.75-3.75h-1.5c-.53 0-1.04.11-1.5.31.74.83 1.15 1.86 1.15 2.94V20Z" />
    </svg>
  );
}

export function PlusIcon({ className }: IconProps) {
  return (
    <SvgIcon className={className}>
      <path d="M12 5v14M5 12h14" />
    </SvgIcon>
  );
}

export function UploadIcon({ className }: IconProps) {
  return (
    <SvgIcon className={className}>
      <path d="M12 16V4" />
      <path d="m7 9 5-5 5 5" />
      <path d="M20 16v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3" />
    </SvgIcon>
  );
}

export function DownloadIcon({ className }: IconProps) {
  return (
    <SvgIcon className={className}>
      <path d="M12 4v12" />
      <path d="m7 11 5 5 5-5" />
      <path d="M20 20H4" />
    </SvgIcon>
  );
}

export function RefreshIcon({ className }: IconProps) {
  return (
    <SvgIcon className={className}>
      <path d="M20 11a8 8 0 0 0-14.9-4" />
      <path d="M4 5v5h5" />
      <path d="M4 13a8 8 0 0 0 14.9 4" />
      <path d="M20 19v-5h-5" />
    </SvgIcon>
  );
}

export function EditIcon({ className }: IconProps) {
  return (
    <SvgIcon className={className}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </SvgIcon>
  );
}

export function TrashIcon({ className }: IconProps) {
  return (
    <SvgIcon className={className}>
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v5M14 11v5" />
    </SvgIcon>
  );
}

export function PrintIcon({ className }: IconProps) {
  return (
    <SvgIcon className={className}>
      <path d="M7 8V4h10v4" />
      <path d="M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2" />
      <path d="M7 14h10v6H7z" />
    </SvgIcon>
  );
}

export function CalendarIcon({ className }: IconProps) {
  return (
    <SvgIcon className={className}>
      <path d="M8 2v4M16 2v4" />
      <path d="M3 10h18" />
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" />
    </SvgIcon>
  );
}

export function SearchIcon({ className }: IconProps) {
  return (
    <SvgIcon className={className}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </SvgIcon>
  );
}

export function ArrowLeftIcon({ className }: IconProps) {
  return (
    <SvgIcon className={className}>
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </SvgIcon>
  );
}

export function ArrowRightIcon({ className }: IconProps) {
  return (
    <SvgIcon className={className}>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </SvgIcon>
  );
}

export function LinkIcon({ className }: IconProps) {
  return (
    <SvgIcon className={className}>
      <path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1" />
      <path d="M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1" />
    </SvgIcon>
  );
}

export function LogOutIcon({ className }: IconProps) {
  return (
    <SvgIcon className={className}>
      <path d="M10 17l5-5-5-5" />
      <path d="M15 12H3" />
      <path d="M21 19V5a2 2 0 0 0-2-2h-5" />
    </SvgIcon>
  );
}

export function XIcon({ className }: IconProps) {
  return (
    <SvgIcon className={className}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </SvgIcon>
  );
}

export function SaveIcon({ className }: IconProps) {
  return (
    <SvgIcon className={className}>
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" />
      <path d="M17 21v-8H7v8" />
      <path d="M7 3v5h8" />
    </SvgIcon>
  );
}

export function CheckIcon({ className }: IconProps) {
  return (
    <SvgIcon className={className}>
      <path d="m5 12 4 4L19 6" />
    </SvgIcon>
  );
}

export function CardIcon({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={`${className} fill-current`}>
      <path d="M4.75 5A2.75 2.75 0 0 0 2 7.75v8.5A2.75 2.75 0 0 0 4.75 19h14.5A2.75 2.75 0 0 0 22 16.25v-8.5A2.75 2.75 0 0 0 19.25 5H4.75ZM4 9h16v2H4V9Zm2 5.25A.75.75 0 0 1 6.75 13h4.5a.75.75 0 0 1 0 1.5h-4.5A.75.75 0 0 1 6 14.25Z" />
    </svg>
  );
}

export function ListIcon({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={`${className} fill-current`}>
      <path d="M5 4.75A2.75 2.75 0 0 1 7.75 2h8.5A2.75 2.75 0 0 1 19 4.75v14.5A2.75 2.75 0 0 1 16.25 22h-8.5A2.75 2.75 0 0 1 5 19.25V4.75ZM8 7.5a.75.75 0 0 0 0 1.5h8a.75.75 0 0 0 0-1.5H8Zm0 4a.75.75 0 0 0 0 1.5h8a.75.75 0 0 0 0-1.5H8Zm0 4a.75.75 0 0 0 0 1.5h5a.75.75 0 0 0 0-1.5H8Z" />
    </svg>
  );
}

export function FolderIcon({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={`${className} fill-current`}>
      <path d="M4.5 4A2.5 2.5 0 0 0 2 6.5v11A2.5 2.5 0 0 0 4.5 20h15a2.5 2.5 0 0 0 2.5-2.5v-8A2.5 2.5 0 0 0 19.5 7h-7.14a1.5 1.5 0 0 1-1.06-.44L9.74 5A3.5 3.5 0 0 0 7.26 4H4.5Z" />
    </svg>
  );
}

export function InventoryIcon({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={`${className} fill-current`}>
      <path d="M4.25 5.5 12 2l7.75 3.5v9L12 18l-7.75-3.5v-9ZM12 4.2 7.18 6.38 12 8.55l4.82-2.17L12 4.2Zm1 6.05v5.3l4.75-2.15V8.1L13 10.25ZM6.25 8.1v5.3L11 15.55v-5.3L6.25 8.1ZM5 18.5a1 1 0 0 1 1-1h12a1 1 0 1 1 0 2H6a1 1 0 0 1-1-1Z" />
    </svg>
  );
}

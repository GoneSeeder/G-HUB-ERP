'use client';

import { type ChangeEvent, type FormEvent, useEffect, useRef, useState } from 'react';
import { PlusIcon, TrashIcon, XIcon } from '@/components/ui/icons';
import { HrCustomSelect } from './hr-ui';
import {
  type Announcement,
  type AnnouncementCategory,
  type AnnouncementStatus,
  type AttachmentFile,
  ANNOUNCEMENT_CATEGORY_SEED,
  ANNOUNCEMENT_CATEGORIES_STORAGE_KEY,
  ANNOUNCEMENT_SEED,
  ANNOUNCEMENTS_STORAGE_KEY,
  STATUS_LABELS,
} from '@/data/humansource/announcements';
import {
  type EmployeeType,
  EMPLOYEE_TYPE_SEED,
  EMPLOYEE_TYPES_STORAGE_KEY,
} from '@/data/humansource/employee-types';

// ─── constants ─────────────────────────────────────────────────────────────

const STATUS_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: '',          label: 'ทุกสถานะ' },
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

function formatThaiDateTime(iso: string): string {
  const hasTime = iso.includes('T');
  const [datePart, timePart = ''] = hasTime ? iso.split('T') : [iso, ''];
  const [y, m, d] = datePart.split('-');
  const beYear = parseInt(y, 10) + 543;
  const time = timePart.slice(0, 5);
  return `${d}/${m}/${beYear}${time ? ` ${time}` : ''}`;
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

// ─── ToggleSwitchRow ───────────────────────────────────────────────────────

function ToggleSwitchRow({ label, checked, onChange }: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="hr-announce-pin-row">
      <span className="hr-announce-drawer-label">{label}</span>
      <input type="checkbox" className="sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="hr-leave-switch"><span className="hr-leave-switch__thumb" /></span>
    </label>
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

// ─── CategoryDrawer ────────────────────────────────────────────────────────

function CategoryDrawer({
  initial,
  accent,
  onCancel,
  onSave,
}: {
  initial: AnnouncementCategory | null;
  accent: string;
  onCancel: () => void;
  onSave: (c: AnnouncementCategory) => void;
}) {
  const [nameTh, setNameTh] = useState(initial?.nameTh ?? '');
  const [active, setActive] = useState(initial?.active ?? true);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!nameTh.trim()) return;
    onSave({
      id:     initial?.id ?? `CAT${Date.now()}`,
      nameTh: nameTh.trim(),
      color:  initial?.color ?? '#4f46e5',
      active,
    });
  };

  return (
    <>
      <div className="fixed inset-0 z-[69] bg-black/30" onClick={onCancel} />
      <div className="hr-announce-drawer hr-announce-drawer--narrow" role="dialog" aria-modal="true">
        <form className="flex min-h-0 flex-1 flex-col" onSubmit={submit}>
          <header className="hr-announce-drawer__head">
            <h3 className="hr-announce-drawer__title">
              {initial ? 'แก้ไขหมวดประกาศ' : 'สร้างหมวดประกาศ'}
            </h3>
            <button type="button" className="hr-announce-drawer__close" onClick={onCancel} aria-label="ปิด">
              <XIcon className="h-4 w-4" />
            </button>
          </header>

          <div className="hr-announce-drawer__body">
            <div className="hr-announce-drawer-field">
              <span className="hr-leave-field__label">ชื่อหมวด</span>
              <input
                className="hr-leave-input"
                value={nameTh}
                onChange={(e) => setNameTh(e.target.value)}
                placeholder="เช่น นโยบาย, กิจกรรม"
                required
                autoFocus
              />
            </div>
            <ToggleSwitchRow label="เปิดใช้งาน" checked={active} onChange={setActive} />
          </div>

          <footer className="hr-announce-drawer__foot">
            <div className="flex items-center gap-2 ml-auto">
              <button type="button" className="hr-position-modal__cancel" onClick={onCancel}>ยกเลิก</button>
              <button type="submit" className="hr-position-modal__save" style={{ backgroundColor: accent }}>บันทึก</button>
            </div>
          </footer>
        </form>
      </div>
    </>
  );
}

// ─── DateTimeField ─────────────────────────────────────────────────────────

function DateTimeField({
  label,
  required,
  value,
  onChange,
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (iso: string) => void;
}) {
  const display = value ? formatThaiDateTime(value) : '';

  return (
    <div className="hr-announce-dt-field">
      <span className="hr-leave-field__label">
        {label}{required && <span className="hr-leave-field__required"> *</span>}
      </span>
      {/* label wraps display + input so clicking anywhere on the display area activates the picker */}
      <label className="hr-announce-dt-label">
        <div className={`hr-announce-dt-input${!display ? ' hr-announce-dt-input--empty' : ''}`}>
          <span>{display || 'กรุณาเลือก'}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </svg>
        </div>
        <input
          type="datetime-local"
          className="hr-announce-dt-native"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </label>
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
    const raw = typeof window !== 'undefined' ? localStorage.getItem(EMPLOYEE_TYPES_STORAGE_KEY) : null;
    setEmpTypes(raw ? (JSON.parse(raw) as EmployeeType[]) : EMPLOYEE_TYPE_SEED);
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
                    <DateTimeField label="วันที่เริ่มประกาศ" required value={publishAt} onChange={setPublishAt} />
                    <DateTimeField label="วันที่จบประกาศ" value={publishEnd} onChange={setPublishEnd} />
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

// ─── AnnouncementsList ─────────────────────────────────────────────────────

function AnnouncementsList({ accent }: { accent: string }) {
  const [items,        setItems]        = useState<Announcement[]>([]);
  const [cats,         setCats]         = useState<AnnouncementCategory[]>([]);
  const [hydrated,     setHydrated]     = useState(false);
  const [search,       setSearch]       = useState('');
  const [filterSt,     setFilterSt]     = useState('');
  const [drawer,       setDrawer]       = useState<'create' | Announcement | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Announcement | null>(null);
  const [selected,     setSelected]     = useState<Set<string>>(new Set());

  useEffect(() => {
    const rawA = localStorage.getItem(ANNOUNCEMENTS_STORAGE_KEY);
    const rawC = localStorage.getItem(ANNOUNCEMENT_CATEGORIES_STORAGE_KEY);
    setItems(rawA ? (JSON.parse(rawA) as Announcement[]) : ANNOUNCEMENT_SEED);
    setCats(rawC  ? (JSON.parse(rawC) as AnnouncementCategory[]) : ANNOUNCEMENT_CATEGORY_SEED);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(ANNOUNCEMENTS_STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

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

  const handleSave = (saved: Announcement) => {
    setItems((prev) =>
      prev.some((a) => a.id === saved.id)
        ? prev.map((a) => (a.id === saved.id ? saved : a))
        : [...prev, saved],
    );
    setDrawer(null);
  };

  const handleDelete = (target: Announcement) => {
    setItems((prev) => prev.filter((a) => a.id !== target.id));
    setSelected((prev) => { const n = new Set(prev); n.delete(target.id); return n; });
    setDeleteTarget(null);
  };

  const catMap = new Map(cats.map((c) => [c.id, c]));

  return (
    <div className="hr-announce-page">
      {/* toolbar */}
      <div className="hr-announce-toolbar">
        <input
          className="hr-settings-search hr-announce-search"
          placeholder="ค้นหาชื่อประกาศ"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="hr-announce-filter-select">
          <HrCustomSelect
            options={STATUS_FILTER_OPTIONS}
            value={filterSt}
            onChange={(v) => setFilterSt(v as string)}
          />
        </div>
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

// ─── CategoriesBoard ───────────────────────────────────────────────────────

function CategoriesBoard({ accent }: { accent: string }) {
  const [cats,         setCats]         = useState<AnnouncementCategory[]>([]);
  const [hydrated,     setHydrated]     = useState(false);
  const [search,       setSearch]       = useState('');
  const [drawer,       setDrawer]       = useState<'create' | AnnouncementCategory | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AnnouncementCategory | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(ANNOUNCEMENT_CATEGORIES_STORAGE_KEY);
    setCats(raw ? (JSON.parse(raw) as AnnouncementCategory[]) : ANNOUNCEMENT_CATEGORY_SEED);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(ANNOUNCEMENT_CATEGORIES_STORAGE_KEY, JSON.stringify(cats));
  }, [cats, hydrated]);

  const q        = search.toLowerCase();
  const filtered = cats.filter((c) => !q || c.nameTh.toLowerCase().includes(q));

  const handleSave = (saved: AnnouncementCategory) => {
    setCats((prev) =>
      prev.some((c) => c.id === saved.id)
        ? prev.map((c) => (c.id === saved.id ? saved : c))
        : [...prev, saved],
    );
    setDrawer(null);
  };

  const toggleActive = (id: string) =>
    setCats((prev) => prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c)));

  const handleDelete = (target: AnnouncementCategory) => {
    setCats((prev) => prev.filter((c) => c.id !== target.id));
    setDeleteTarget(null);
  };

  return (
    <div className="hr-announce-page">
      <div className="hr-announce-toolbar">
        <input
          className="hr-settings-search hr-announce-search"
          placeholder="ค้นหาหมวดประกาศ"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          type="button"
          className="hr-announce-create-btn"
          style={{ backgroundColor: accent }}
          onClick={() => setDrawer('create')}
        >
          <PlusIcon className="h-4 w-4" />
          สร้างหมวด
        </button>
      </div>

      <div className="hr-announce-table-wrap">
        <table className="hr-announce-table">
          <thead>
            <tr>
              <th className="hr-announce-table__swatch-col" />
              <th>ชื่อหมวด</th>
              <th>สถานะ</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id}>
                <td className="hr-announce-table__swatch-col">
                  <span className="hr-announce-cat-swatch" style={{ background: c.color }} />
                </td>
                <td className="hr-announce-table__title">{c.nameTh}</td>
                <td>
                  <label style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
                    <input type="checkbox" className="sr-only" checked={c.active} onChange={() => toggleActive(c.id)} />
                    <span className="hr-leave-switch"><span className="hr-leave-switch__thumb" /></span>
                  </label>
                </td>
                <td>
                  <div className="hr-announce-row-actions">
                    <button type="button" className="hr-announce-icon-btn" onClick={() => setDrawer(c)} title="แก้ไข">
                      <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                    <button type="button" className="hr-announce-icon-btn hr-announce-icon-btn--danger" onClick={() => setDeleteTarget(c)} title="ลบ">
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="hr-announce-empty">
                  {search ? 'ไม่พบหมวดที่ตรงกับการค้นหา' : 'ยังไม่มีหมวดประกาศ'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {drawer !== null && (
        <CategoryDrawer
          initial={drawer === 'create' ? null : drawer}
          accent={accent}
          onCancel={() => setDrawer(null)}
          onSave={handleSave}
        />
      )}
      {deleteTarget && (
        <DeleteConfirm
          message={`ลบหมวด "${deleteTarget.nameTh}" ใช่หรือไม่?`}
          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

// ─── AudienceBoard ─────────────────────────────────────────────────────────

function AudienceBoard() {
  return (
    <div className="hr-announce-page">
      <div className="hr-announce-info-panel">
        <div className="hr-announce-info-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
          </svg>
        </div>
        <h3 className="hr-announce-info-title">กลุ่มผู้รับประกาศ</h3>
        <p className="hr-announce-info-desc">
          การกำหนดกลุ่มผู้รับทำได้ในระดับประกาศ — เปิด <strong>แก้ไขประกาศ</strong> แล้วเลือกช่อง <strong>ผู้รับประกาศ</strong>
        </p>
        <p className="hr-announce-info-sub">
          รองรับ: ทุกคน · แยกตามประเภทพนักงาน (เวอร์ชันถัดไป: หน่วยงาน · รายบุคคล)
        </p>
      </div>
    </div>
  );
}

// ─── AnnouncementsBoard (export) ───────────────────────────────────────────

export function AnnouncementsBoard({
  sub,
  accent,
}: {
  sub: 'list' | 'categories' | 'audience';
  accent: string;
}) {
  if (sub === 'categories') return <CategoriesBoard accent={accent} />;
  if (sub === 'audience')   return <AudienceBoard />;
  return <AnnouncementsList accent={accent} />;
}

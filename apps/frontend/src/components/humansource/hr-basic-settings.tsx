'use client';

import { type FormEvent, useEffect, useRef, useState } from 'react';
import { EditIcon, PlusIcon, SearchIcon, TrashIcon, XIcon } from '@/components/ui/icons';
import { HrCustomSelect } from './hr-ui';
import { publicApiFetch } from '@/lib/api';
import {
  EMPLOYEE_TYPE_SEED,
  type EmployeeType,
  type EmployeeTypeTax,
} from '@/data/humansource/employee-types';
import {
  EMPLOYEE_DEFAULTS_SEED,
  RUNNING_NUMBER_SEED,
  AUTO_EMP_CODE_KEY,
  AUTO_EMP_CODE_DEFAULT,
  type AutoEmpCodeSetting,
  type EmployeeDefaults,
  type RunningNumberConfig,
  type RunningNumberDateToken,
} from '@/data/humansource/company-basics';

// ─── Local form primitives (same pattern as hr-leave-settings) ───────────────

function GroupHeading({ children }: { children: React.ReactNode }) {
  return <h4 className="hr-leave-form__heading">{children}</h4>;
}

function Field({
  label,
  required,
  suffix,
  full,
  hidden,
  children,
}: {
  label: string;
  required?: boolean;
  suffix?: string;
  full?: boolean;
  hidden?: boolean;
  children?: React.ReactNode;
}) {
  if (hidden) return <span aria-hidden className="hr-leave-field hr-leave-field--spacer" />;
  return (
    <label className={`hr-leave-field ${full ? 'hr-leave-field--full' : ''}`}>
      <span className="hr-leave-field__label">
        {label}
        {required ? <span className="hr-leave-field__required">*</span> : null}
      </span>
      <span className="hr-leave-field__control">
        {children}
        {suffix ? <span className="hr-leave-field__suffix">{suffix}</span> : null}
      </span>
    </label>
  );
}

function ToggleField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="hr-leave-toggle-field">
      <span className="hr-leave-toggle-field__label">{label}</span>
      <span className="hr-leave-toggle-field__control">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span className="hr-leave-switch">
          <span className="hr-leave-switch__thumb" />
        </span>
      </span>
    </label>
  );
}

// ─── Shared confirm-delete dialog ─────────────────────────────────────────────

function ConfirmDelete({
  label,
  onCancel,
  onConfirm,
}: {
  label: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="hr-leave-confirm-overlay" role="presentation" onClick={onCancel}>
      <section
        className="hr-leave-confirm"
        role="alertdialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="hr-leave-confirm__head">
          <h4>ยืนยันการลบ</h4>
          <button type="button" onClick={onCancel} aria-label="ปิด">
            <XIcon className="h-5 w-5" />
          </button>
        </header>
        <div className="hr-leave-confirm__body">
          <p>
            ต้องการลบ <strong>{label}</strong> ใช่หรือไม่?
          </p>
          <p className="hr-leave-confirm__note">การลบจะไม่สามารถกู้คืนได้</p>
        </div>
        <footer className="hr-leave-confirm__foot">
          <button type="button" className="hr-leave-modal-foot__cancel" onClick={onCancel}>
            ยกเลิก
          </button>
          <button type="button" className="hr-leave-confirm__danger" onClick={onConfirm}>
            ยืนยันการลบ
          </button>
        </footer>
      </section>
    </div>
  );
}

// ─── Auto Employee Code Setting Card ─────────────────────────────────────────

function buildEmpCodePreview(s: AutoEmpCodeSetting): string {
  if (s.mode === 'standard') {
    const yy = String(new Date().getFullYear()).slice(-2);
    return `${yy}${String(s.standardNextNumber).padStart(s.standardPadding, '0')}`;
  }
  const year = s.customWithYear ? String(new Date().getFullYear()) : '';
  const num = String(s.customNextNumber).padStart(s.customPadding, '0');
  return `${s.customPrefix}${year}${num}`;
}

function AutoEmpCodeCard({ accent }: { accent: string }) {
  const [setting, setSetting] = useState<AutoEmpCodeSetting>(AUTO_EMP_CODE_DEFAULT);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(AUTO_EMP_CODE_KEY);
      if (raw) setSetting({ ...AUTO_EMP_CODE_DEFAULT, ...(JSON.parse(raw) as Partial<AutoEmpCodeSetting>) });
    } catch { /* ignore */ }
    setHydrated(true);
  }, []);

  const update = (patch: Partial<AutoEmpCodeSetting>) => {
    setSetting((prev) => {
      const next = { ...prev, ...patch };
      localStorage.setItem(AUTO_EMP_CODE_KEY, JSON.stringify(next));
      return next;
    });
  };

  if (!hydrated) return null;

  const preview = buildEmpCodePreview(setting);

  return (
    <div className="hr-auto-code-card">
      <div className="hr-auto-code-card__header">
        <div className="hr-auto-code-card__icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>
        <div className="hr-auto-code-card__text">
          <p className="hr-auto-code-card__title">กำหนดรหัสพนักงานให้อัตโนมัติ</p>
          <p className="hr-auto-code-card__desc">
            {setting.enabled && setting.mode === 'standard'
              ? `รหัสพนักงานจะเริ่มต้นด้วยตัวเลข ${setting.standardPadding} หลัก ตามด้วยตัวเลข 5 ตัว`
              : 'ระบบจะกำหนดรหัสพนักงานให้แบบอัตโนมัติ โดยสามารถกำหนดรูปแบบที่ต้องการได้'}
          </p>
        </div>
        <label className="hr-auto-code-card__toggle" aria-label="เปิด/ปิด กำหนดรหัสอัตโนมัติ">
          <input
            type="checkbox"
            checked={setting.enabled}
            onChange={(e) => update({ enabled: e.target.checked })}
          />
          <span className="hr-leave-switch" style={setting.enabled ? { backgroundColor: accent } : undefined}>
            <span className="hr-leave-switch__thumb" />
          </span>
        </label>
      </div>

      {setting.enabled ? (
        <div className="hr-auto-code-card__options">
          {/* Mode radios */}
          <label className="hr-auto-code-card__radio">
            <input type="radio" name="auto-code-mode" value="standard" checked={setting.mode === 'standard'} onChange={() => update({ mode: 'standard' })} style={{ accentColor: accent }} />
            <span className="hr-auto-code-card__radio-label">แบบมาตรฐาน</span>
          </label>
          {setting.mode === 'standard' && (
            <div className="hr-auto-code-card__sub">
              <p className="hr-auto-code-card__sub-hint">รหัสพนักงานจะเพิ่มขึ้นต้นตั้งแต่ปัจจุบัน ตามด้วยตัวเลข {setting.standardPadding} ตัว</p>
              <p className="hr-auto-code-card__preview-label">รหัสพนักงานคนถัดไป</p>
              <p className="hr-auto-code-card__preview">{preview}</p>
            </div>
          )}

          <label className="hr-auto-code-card__radio" style={{ marginTop: 8 }}>
            <input type="radio" name="auto-code-mode" value="custom" checked={setting.mode === 'custom'} onChange={() => update({ mode: 'custom' })} style={{ accentColor: accent }} />
            <span className="hr-auto-code-card__radio-label">แบบกำหนดเอง</span>
          </label>
          {setting.mode === 'custom' && (
            <div className="hr-auto-code-card__sub">
              <div className="hr-auto-code-card__fields">
                <div className="hr-auto-code-card__field">
                  <label className="hr-auto-code-card__field-label">จำนวนหลัก</label>
                  <input
                    type="number"
                    min={1} max={10}
                    value={setting.customPadding}
                    onChange={(e) => update({ customPadding: Math.max(1, Math.min(10, Number(e.target.value))) })}
                    className="hr-auto-code-card__input hr-auto-code-card__input--short"
                  />
                </div>
                <div className="hr-auto-code-card__field">
                  <label className="hr-auto-code-card__field-label">ตัวอักษรเริ่มต้น <span className="hr-auto-code-card__field-hint">(ไม่แนะนำ)</span></label>
                  <input
                    type="text"
                    value={setting.customPrefix}
                    onChange={(e) => update({ customPrefix: e.target.value })}
                    className="hr-auto-code-card__input"
                    placeholder="เช่น EMP"
                  />
                </div>
              </div>
              <div className="hr-auto-code-card__fields" style={{ marginTop: 8 }}>
                <div className="hr-auto-code-card__field">
                  <label className="hr-auto-code-card__field-label">ลำดับเลขปัจจุบัน</label>
                  <input
                    type="number"
                    min={1}
                    value={setting.customNextNumber}
                    onChange={(e) => update({ customNextNumber: Math.max(1, Number(e.target.value)) })}
                    className="hr-auto-code-card__input"
                  />
                </div>
                <div className="hr-auto-code-card__field hr-auto-code-card__field--checkbox">
                  <label className="hr-auto-code-card__checkbox-row">
                    <input
                      type="checkbox"
                      checked={setting.customWithYear}
                      onChange={(e) => update({ customWithYear: e.target.checked })}
                      style={{ accentColor: accent }}
                    />
                    <span>นำหน้าด้วยปีปัจจุบัน (ค.ศ.)</span>
                  </label>
                </div>
              </div>
              <p className="hr-auto-code-card__preview-label">รหัสพนักงานคนถัดไป</p>
              <p className="hr-auto-code-card__preview">{preview}</p>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

// ─── Employee Type CRUD ────────────────────────────────────────────────────────

const TAX_OPTIONS: { value: EmployeeTypeTax; label: string }[] = [
  { value: 'หัก ณ ที่จ่าย', label: 'หัก ณ ที่จ่าย' },
  { value: 'ไม่หัก',        label: 'ไม่หัก' },
];

const STATUS_OPTIONS = [
  { value: 'ทดลองงาน', label: 'ทดลองงาน' },
  { value: 'ปกติ',      label: 'ปกติ' },
];
const START_DATE_OPTIONS = [
  { value: 'manual', label: 'กรอกเอง' },
  { value: 'today',  label: 'วันนี้' },
];
const DATE_TOKEN_OPTIONS: { value: RunningNumberDateToken; label: string }[] = [
  { value: 'none',   label: 'ไม่ใส่' },
  { value: 'YYYY',   label: 'ปี (YYYY)' },
  { value: 'YYYYMM', label: 'ปีเดือน (YYYYMM)' },
];

function emptyEmpType(): EmployeeType {
  return { id: '', code: '', nameTh: '', nameEn: '', tax: 'ไม่หัก', active: true };
}

function EmpTypeModal({
  initial,
  mode,
  existingCodes,
  onCancel,
  onSave,
  accent,
}: {
  initial: EmployeeType;
  mode: 'create' | 'edit';
  existingCodes: string[];
  onCancel: () => void;
  onSave: (row: EmployeeType) => void;
  accent: string;
}) {
  const [draft, setDraft] = useState<EmployeeType>(initial);
  const [error, setError] = useState('');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onCancel]);

  const update = (patch: Partial<EmployeeType>) => setDraft((d) => ({ ...d, ...patch }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const code = draft.code.trim().toUpperCase();
    if (!draft.nameTh.trim()) { setError('กรุณาระบุชื่อ'); return; }
    if (!code) { setError('กรุณาระบุรหัส'); return; }
    if (existingCodes.includes(code)) { setError('รหัสนี้ถูกใช้งานแล้ว'); return; }
    onSave({ ...draft, code });
  };

  return (
    <>
      <button type="button" className="hr-scrim" data-open="true" aria-label="ปิด" onClick={onCancel} />
      <form className="hr-drawer" data-open="true" role="dialog" aria-modal="true" onSubmit={submit}>
        <header className="hr-drawer__head">
          <div>
            <h3 className="hr-drawer__title">
              {mode === 'create' ? 'เพิ่มประเภทพนักงาน' : 'แก้ไขประเภทพนักงาน'}
            </h3>
            <p className="hr-drawer__subtitle">กำหนดรหัสและชื่อประเภทพนักงาน</p>
          </div>
          <button type="button" onClick={onCancel} aria-label="ปิด" className="hr-drawer__close">
            <XIcon className="h-4 w-4" />
          </button>
        </header>

        <div className="hr-drawer__body">
          {error ? <p className="hr-leave-modal-error">{error}</p> : null}

          <div className="hr-fgroup">
            <GroupHeading>ข้อมูลประเภทพนักงาน</GroupHeading>
            <div className="hr-leave-form__grid">
              <Field label="รหัส" required>
                <input
                  className="hr-leave-input hr-leave-input--mono"
                  value={draft.code}
                  onChange={(e) => update({ code: e.target.value })}
                  placeholder="EMP-MONTHLY"
                />
              </Field>
              <Field label="ชื่อ (ภาษาไทย)" required>
                <input
                  className="hr-leave-input"
                  value={draft.nameTh}
                  onChange={(e) => update({ nameTh: e.target.value })}
                  placeholder="รายเดือน"
                />
              </Field>
              <Field label="ชื่อ (ภาษาอังกฤษ)">
                <input
                  className="hr-leave-input"
                  value={draft.nameEn}
                  onChange={(e) => update({ nameEn: e.target.value })}
                  placeholder="Monthly"
                />
              </Field>
              <Field label="การหักภาษี">
                <HrCustomSelect
                  value={draft.tax}
                  options={TAX_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                  onChange={(v) => update({ tax: v as EmployeeTypeTax })}
                />
              </Field>
            </div>
          </div>

          <div className="hr-fgroup">
            <ToggleField label="เปิดใช้งาน" checked={draft.active} onChange={(v) => update({ active: v })} />
          </div>
        </div>

        <footer className="hr-drawer__foot">
          <button type="button" className="hr-button hr-button--secondary" onClick={onCancel}>
            ยกเลิก
          </button>
          <button type="submit" className="hr-button hr-button--primary" style={{ backgroundColor: accent }}>
            บันทึก
          </button>
        </footer>
      </form>
    </>
  );
}

function EmployeeTypeBoard({ accent }: { accent: string }) {
  const [rows, setRows] = useState<EmployeeType[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState('');
  const [editing, setEditing] = useState<EmployeeType | null>(null);
  const [editMode, setEditMode] = useState<'create' | 'edit'>('create');
  const [confirmDel, setConfirmDel] = useState<EmployeeType | null>(null);
  const [search, setSearch] = useState('');
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const dragIdRef = useRef<string | null>(null);
  const isMounted = useRef(true);

  const handleDragStart = (id: string) => { dragIdRef.current = id; };
  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    setDragOverId(id);
  };
  const handleDrop = (targetId: string) => {
    const sourceId = dragIdRef.current;
    if (!sourceId || sourceId === targetId) { setDragOverId(null); return; }
    setRows((prev) => {
      const next = [...prev];
      const from = next.findIndex((r) => r.id === sourceId);
      const to = next.findIndex((r) => r.id === targetId);
      if (from === -1 || to === -1) return prev;
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
    dragIdRef.current = null;
    setDragOverId(null);
  };
  const handleDragEnd = () => { dragIdRef.current = null; setDragOverId(null); };

  useEffect(() => {
    isMounted.current = true;
    publicApiFetch<EmployeeType[]>('/api/humansource/employee-types')
      .then((data) => { if (isMounted.current) { setRows(data); setLoading(false); } })
      .catch(() => { if (isMounted.current) { setApiError('โหลดข้อมูลไม่สำเร็จ'); setLoading(false); } });
    return () => { isMounted.current = false; };
  }, []);

  const openCreate = () => {
    setEditMode('create');
    setEditing(emptyEmpType());
  };
  const openEdit = (row: EmployeeType) => {
    setEditMode('edit');
    setEditing(row);
  };
  const close = () => setEditing(null);

  const handleSave = async (row: EmployeeType) => {
    try {
      if (editMode === 'create') {
        const created = await publicApiFetch<EmployeeType>('/api/humansource/employee-types', {
          method: 'POST',
          body: JSON.stringify({ code: row.code, nameTh: row.nameTh, nameEn: row.nameEn, tax: row.tax, active: row.active }),
        });
        setRows((current) => [...current, created]);
      } else {
        const updated = await publicApiFetch<EmployeeType>(`/api/humansource/employee-types/${row.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ code: row.code, nameTh: row.nameTh, nameEn: row.nameEn, tax: row.tax, active: row.active }),
        });
        setRows((current) => current.map((r) => (r.id === updated.id ? updated : r)));
      }
      close();
    } catch {
      setApiError('บันทึกไม่สำเร็จ กรุณาลองใหม่');
    }
  };

  const toggle = async (id: string) => {
    const row = rows.find((r) => r.id === id);
    if (!row) return;
    try {
      const updated = await publicApiFetch<EmployeeType>(`/api/humansource/employee-types/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ active: !row.active }),
      });
      setRows((current) => current.map((r) => (r.id === id ? updated : r)));
    } catch {
      setApiError('อัปเดตสถานะไม่สำเร็จ');
    }
  };

  const del = async (id: string) => {
    try {
      await publicApiFetch<{ id: string }>(`/api/humansource/employee-types/${id}`, { method: 'DELETE' });
      setRows((current) => current.filter((r) => r.id !== id));
      setConfirmDel(null);
    } catch {
      setApiError('ลบไม่สำเร็จ กรุณาลองใหม่');
    }
  };

  const filtered = search.trim()
    ? rows.filter(
        (r) =>
          r.nameTh.includes(search) ||
          r.nameEn.toLowerCase().includes(search.toLowerCase()) ||
          r.code.toUpperCase().includes(search.toUpperCase()),
      )
    : rows;

  const existingCodes = rows
    .filter((r) => r.id !== editing?.id)
    .map((r) => r.code.trim().toUpperCase());

  return (
    <div className="hr-leave-board">
      {apiError ? (
        <p className="hr-leave-modal-error" style={{ margin: '0.75rem 1rem' }}>{apiError}</p>
      ) : null}

      <header className="hr-leave-board__toolbar">
            <div className="hr-leave-board__toolbar-left">
              <div className="hr-leave-board__search">
                <SearchIcon className="h-3.5 w-3.5" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ค้นหาประเภทพนักงาน"
                  className="hr-leave-board__search-input"
                />
              </div>
            </div>
            <div className="hr-leave-board__toolbar-right">
              <button
                type="button"
                onClick={openCreate}
                className="hr-leave-board__add"
                style={{ backgroundColor: accent }}
              >
                <PlusIcon className="h-4 w-4" />
                เพิ่มประเภทพนักงาน
              </button>
            </div>
          </header>

          <div className="hr-leave-board__table-wrap">
        {loading ? (
          <p className="hr-leave-board__empty">กำลังโหลด...</p>
        ) : (
        <table className="hr-leave-board__table">
          <thead>
            <tr>
              <th className="hr-emp-type-col--order">ลำดับ</th>
              <th className="hr-emp-type-col--shrink">ชื่อ</th>
              <th className="hr-emp-type-col--gap" />
              <th className="hr-emp-type-col--shrink">รายละเอียด</th>
              <th className="hr-emp-type-col--fill" />
              <th className="hr-emp-type-col--status">สถานะ</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, index) => (
              <tr
                key={row.id}
                className={`hr-emp-type-row${dragOverId === row.id ? ' hr-emp-type-row--drag-over' : ''}`}
                draggable
                onDragStart={() => handleDragStart(row.id)}
                onDragOver={(e) => handleDragOver(e, row.id)}
                onDrop={() => handleDrop(row.id)}
                onDragEnd={handleDragEnd}
                onClick={() => openEdit(row)}
              >
                <td className="hr-emp-type-col--order" onClick={(e) => e.stopPropagation()}>
                  <span className="hr-emp-type-drag-handle">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="4.5" cy="3.5" r="1.2" fill="currentColor"/>
                      <circle cx="9.5" cy="3.5" r="1.2" fill="currentColor"/>
                      <circle cx="4.5" cy="7" r="1.2" fill="currentColor"/>
                      <circle cx="9.5" cy="7" r="1.2" fill="currentColor"/>
                      <circle cx="4.5" cy="10.5" r="1.2" fill="currentColor"/>
                      <circle cx="9.5" cy="10.5" r="1.2" fill="currentColor"/>
                    </svg>
                    {index + 1}
                  </span>
                </td>
                <td className="hr-emp-type-col--shrink">{row.nameTh}</td>
                <td className="hr-emp-type-col--gap" />
                <td className="hr-emp-type-col--shrink text-gray-500">{row.nameEn}</td>
                <td className="hr-emp-type-col--fill" />
                <td className="hr-emp-type-col--status" onClick={(e) => e.stopPropagation()}>
                  <label className="hr-leave-board__inline-toggle">
                    <input
                      type="checkbox"
                      checked={row.active}
                      onChange={() => toggle(row.id)}
                      aria-label={row.active ? 'ปิดการใช้งาน' : 'เปิดการใช้งาน'}
                    />
                    <span className={`hr-leave-board__toggle-label ${row.active ? 'hr-settings-status--enabled' : 'hr-settings-status--disabled'}`}>
                      {row.active ? 'ใช้งาน' : 'ปิด'}
                    </span>
                  </label>
                </td>
                <td
                  className="hr-leave-board__actions"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    className="hr-emp-type-row__delete"
                    aria-label="ลบ"
                    onClick={() => setConfirmDel(row)}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="hr-leave-board__empty">
                  {search ? `ไม่พบประเภทพนักงานที่ตรงกับ "${search}"` : 'ยังไม่มีประเภทพนักงาน'}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
        )}
          </div>

          {editing ? (
            <EmpTypeModal
              initial={editing}
              mode={editMode}
              existingCodes={existingCodes}
              onCancel={close}
              onSave={handleSave}
              accent={accent}
            />
          ) : null}

      {confirmDel ? (
        <ConfirmDelete
          label={confirmDel.nameTh}
          onCancel={() => setConfirmDel(null)}
          onConfirm={() => del(confirmDel.id)}
        />
      ) : null}
    </div>
  );
}

// ─── Employee Defaults (flat form) ────────────────────────────────────────────

function EmployeeDefaultsForm({ accent }: { accent: string }) {
  const [defaults, setDefaults] = useState<EmployeeDefaults>(EMPLOYEE_DEFAULTS_SEED);
  const [empTypes, setEmpTypes] = useState<EmployeeType[]>(EMPLOYEE_TYPE_SEED);
  const [saved, setSaved] = useState(false);
  const isMounted = useRef(true);
  useEffect(() => { isMounted.current = true; return () => { isMounted.current = false; }; }, []);

  useEffect(() => {
    Promise.all([
      publicApiFetch<EmployeeDefaults>('/api/humansource/basic-settings/employee-defaults'),
      publicApiFetch<EmployeeType[]>('/api/humansource/employee-types'),
    ]).then(([d, t]) => {
      if (!isMounted.current) return;
      if (d && typeof d.codePrefix === 'string') setDefaults(d);
      if (Array.isArray(t) && t.length > 0) setEmpTypes(t);
    }).catch(() => {});
  }, []);

  const update = (patch: Partial<EmployeeDefaults>) => {
    setDefaults((d) => ({ ...d, ...patch }));
    setSaved(false);
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    await publicApiFetch('/api/humansource/basic-settings/employee-defaults', { method: 'PATCH', body: JSON.stringify(defaults) });
    setSaved(true);
  };

  const padded = '1'.padStart(defaults.codePadding, '0');
  const preview = `${defaults.codePrefix}${padded}`;

  const activeEmpTypes = empTypes.filter((t) => t.active);

  return (
    <form onSubmit={handleSave} className="hr-basic-defaults-form">
      <GroupHeading>ค่าเริ่มต้นรหัสพนักงาน</GroupHeading>
      <div className="hr-leave-form__grid">
        <Field label="คำนำหน้ารหัส" required>
          <input
            className="hr-leave-input hr-leave-input--mono"
            value={defaults.codePrefix}
            onChange={(e) => update({ codePrefix: e.target.value })}
            placeholder="2"
          />
        </Field>
        <Field label="จำนวนหลัก (zero-pad)">
          <input
            className="hr-leave-input hr-leave-input--num"
            type="number"
            min={1}
            max={10}
            value={defaults.codePadding}
            onChange={(e) => update({ codePadding: Number(e.target.value) || 4 })}
          />
        </Field>
        <Field label="ตัวอย่างรหัส" full>
          <span className="hr-basic-preview">{preview}</span>
        </Field>
      </div>

      <GroupHeading>ค่าเริ่มต้นสำหรับพนักงานใหม่</GroupHeading>
      <div className="hr-leave-form__grid">
        <Field label="ประเภทพนักงาน">
          <HrCustomSelect
            value={defaults.defaultEmployeeTypeId}
            options={activeEmpTypes.map((t) => ({ value: t.id, label: t.nameTh }))}
            onChange={(v) => update({ defaultEmployeeTypeId: v })}
          />
        </Field>
        <Field label="สถานะเริ่มต้น">
          <HrCustomSelect
            value={defaults.defaultStatus}
            options={STATUS_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
            onChange={(v) => update({ defaultStatus: v })}
          />
        </Field>
        <Field label="วันที่เริ่มงาน">
          <HrCustomSelect
            value={defaults.startDateMode}
            options={START_DATE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
            onChange={(v) => update({ startDateMode: v as EmployeeDefaults['startDateMode'] })}
          />
        </Field>
      </div>

      <div className="hr-basic-defaults-foot">
        <button type="submit" className="hr-leave-modal-foot__save" style={{ backgroundColor: accent }}>
          บันทึก
        </button>
        {saved ? <span className="hr-basic-saved-hint">บันทึกแล้ว</span> : null}
      </div>
    </form>
  );
}

// ─── Running Number CRUD ──────────────────────────────────────────────────────

const FIXED_YEAR = '2026';
const FIXED_MONTH = '202606';

function buildSample(rn: RunningNumberConfig): string {
  const dateStr = rn.dateToken === 'YYYY' ? FIXED_YEAR : rn.dateToken === 'YYYYMM' ? FIXED_MONTH : '';
  const num = String(rn.nextNumber).padStart(rn.padding, '0');
  return `${rn.prefix}${dateStr ? `${dateStr}-` : ''}${num}`;
}

function emptyRN(): RunningNumberConfig {
  return { id: '', docLabelTh: '', prefix: '', dateToken: 'none', padding: 4, nextNumber: 1, active: true };
}

function RunningNumberModal({
  initial,
  mode,
  onCancel,
  onSave,
  accent,
}: {
  initial: RunningNumberConfig;
  mode: 'create' | 'edit';
  onCancel: () => void;
  onSave: (row: RunningNumberConfig) => void;
  accent: string;
}) {
  const [draft, setDraft] = useState<RunningNumberConfig>(initial);
  const [error, setError] = useState('');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onCancel]);

  const update = (patch: Partial<RunningNumberConfig>) => setDraft((d) => ({ ...d, ...patch }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!draft.docLabelTh.trim()) { setError('กรุณาระบุชื่อเอกสาร'); return; }
    onSave(draft);
  };

  return (
    <div className="hr-leave-modal-overlay" role="dialog" aria-modal="true">
      <form className="hr-leave-modal-shell" onSubmit={submit}>
        <header className="hr-leave-modal-head">
          <div className="hr-leave-modal-head__lead">
            <button type="button" onClick={onCancel} aria-label="กลับ" className="hr-leave-modal-head__back">
              <XIcon className="h-4 w-4" />
            </button>
            <div className="hr-leave-modal-head__title-block">
              <h3 className="hr-leave-modal-head__title">
                {mode === 'create' ? 'เพิ่มรหัสเอกสาร' : 'แก้ไขรหัสเอกสาร'}
              </h3>
              <p className="hr-leave-modal-head__subtitle">กำหนดรูปแบบและเลขเริ่มต้น</p>
            </div>
          </div>
        </header>

        <div className="hr-leave-modal-body">
          <div className="hr-leave-modal-body__inner">
            {error ? <p className="hr-leave-modal-error">{error}</p> : null}

            <GroupHeading>รูปแบบรหัสเอกสาร</GroupHeading>
            <div className="hr-leave-form__grid">
              <Field label="ชื่อเอกสาร" required>
                <input
                  className="hr-leave-input"
                  value={draft.docLabelTh}
                  onChange={(e) => update({ docLabelTh: e.target.value })}
                  placeholder="ใบลา"
                />
              </Field>
              <Field label="คำนำหน้ารหัส">
                <input
                  className="hr-leave-input hr-leave-input--mono"
                  value={draft.prefix}
                  onChange={(e) => update({ prefix: e.target.value })}
                  placeholder="LV"
                />
              </Field>
              <Field label="รูปแบบวันที่">
                <HrCustomSelect
                  value={draft.dateToken}
                  options={DATE_TOKEN_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                  onChange={(v) => update({ dateToken: v as RunningNumberDateToken })}
                />
              </Field>
              <Field label="จำนวนหลัก (zero-pad)">
                <input
                  className="hr-leave-input hr-leave-input--num"
                  type="number"
                  min={1}
                  max={10}
                  value={draft.padding}
                  onChange={(e) => update({ padding: Number(e.target.value) || 4 })}
                />
              </Field>
              <Field label="เลขเริ่มต้น">
                <input
                  className="hr-leave-input hr-leave-input--num"
                  type="number"
                  min={1}
                  value={draft.nextNumber}
                  onChange={(e) => update({ nextNumber: Number(e.target.value) || 1 })}
                />
              </Field>
              <Field label="ตัวอย่าง">
                <span className="hr-basic-preview">{buildSample(draft)}</span>
              </Field>
            </div>

            <div className="mt-6">
              <ToggleField label="เปิดใช้งาน" checked={draft.active} onChange={(v) => update({ active: v })} />
            </div>
          </div>
        </div>

        <footer className="hr-leave-modal-foot">
          <button type="button" className="hr-leave-modal-foot__cancel" onClick={onCancel}>
            ยกเลิก
          </button>
          <button type="submit" className="hr-leave-modal-foot__save" style={{ backgroundColor: accent }}>
            บันทึก
          </button>
        </footer>
      </form>
    </div>
  );
}

function RunningNumberBoard({ accent }: { accent: string }) {
  const [rows, setRows] = useState<RunningNumberConfig[]>(RUNNING_NUMBER_SEED);
  const [shown, setShown] = useState(false);
  const [editing, setEditing] = useState<RunningNumberConfig | null>(null);
  const [editMode, setEditMode] = useState<'create' | 'edit'>('create');
  const [confirmDel, setConfirmDel] = useState<RunningNumberConfig | null>(null);
  const counter = useRef(0);

  const isMountedRN = useRef(true);
  useEffect(() => { isMountedRN.current = true; return () => { isMountedRN.current = false; }; }, []);

  useEffect(() => {
    publicApiFetch<RunningNumberConfig[]>('/api/humansource/basic-settings/running-numbers')
      .then((r) => { if (isMountedRN.current && r.length) setRows(r); })
      .catch(() => {});
  }, []);

  const openCreate = () => { setEditMode('create'); setEditing(emptyRN()); };
  const openEdit = (row: RunningNumberConfig) => { setEditMode('edit'); setEditing(row); };
  const close = () => setEditing(null);

  const handleSave = async (row: RunningNumberConfig) => {
    if (editMode === 'create') {
      const id = `rn-${Date.now()}-${counter.current++}`;
      const created = await publicApiFetch<RunningNumberConfig>('/api/humansource/basic-settings/running-numbers', { method: 'POST', body: JSON.stringify({ ...row, id }) });
      setRows((current) => [...current, created]);
    } else {
      const updated = await publicApiFetch<RunningNumberConfig>(`/api/humansource/basic-settings/running-numbers/${row.id}`, { method: 'PATCH', body: JSON.stringify(row) });
      setRows((current) => current.map((r) => r.id === row.id ? updated : r));
    }
    close();
  };

  const toggle = async (id: string) => {
    const row = rows.find((r) => r.id === id);
    if (!row) return;
    const updated = await publicApiFetch<RunningNumberConfig>(`/api/humansource/basic-settings/running-numbers/${id}`, { method: 'PATCH', body: JSON.stringify({ active: !row.active }) });
    setRows((current) => current.map((r) => r.id === id ? updated : r));
  };

  const del = async (id: string) => {
    await publicApiFetch(`/api/humansource/basic-settings/running-numbers/${id}`, { method: 'DELETE' });
    setRows((current) => current.filter((r) => r.id !== id));
    setConfirmDel(null);
  };

  return (
    <div className="hr-leave-board">
      <header className="hr-leave-board__toolbar">
        <div className="hr-leave-board__toolbar-left">
          <button
            type="button"
            className="hr-rn-toggle"
            onClick={() => setShown((v) => !v)}
          >
            <span className="hr-rn-toggle__arrow">{shown ? '▾' : '▸'}</span>
            {shown ? `ซ่อนรายการ (${rows.length})` : `แสดงรายการ (${rows.length})`}
          </button>
        </div>
        <div className="hr-leave-board__toolbar-right">
          <button
            type="button"
            onClick={openCreate}
            className="hr-leave-board__add"
            style={{ backgroundColor: accent }}
          >
            <PlusIcon className="h-4 w-4" />
            เพิ่มรายการ
          </button>
        </div>
      </header>

      {shown && <div className="hr-leave-board__table-wrap">
        <table className="hr-leave-board__table">
          <thead>
            <tr>
              <th>ชื่อเอกสาร</th>
              <th>ตัวอย่างรหัส</th>
              <th>เลขถัดไป</th>
              <th>สถานะ</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} onClick={() => openEdit(row)}>
                <td>
                  <strong>{row.docLabelTh}</strong>
                </td>
                <td>
                  <span className="hr-leave-board__mono">{buildSample(row)}</span>
                </td>
                <td className="text-gray-500">{row.nextNumber}</td>
                <td onClick={(e) => e.stopPropagation()}>
                  <label className="hr-leave-board__inline-toggle">
                    <input
                      type="checkbox"
                      checked={row.active}
                      onChange={() => toggle(row.id)}
                      aria-label={row.active ? 'ปิด' : 'เปิด'}
                    />
                    <span className={`hr-leave-board__toggle-label ${row.active ? 'hr-settings-status--enabled' : 'hr-settings-status--disabled'}`}>
                      {row.active ? 'ใช้งาน' : 'ปิด'}
                    </span>
                  </label>
                </td>
                <td
                  className="hr-leave-board__actions"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button type="button" aria-label="แก้ไข" onClick={() => openEdit(row)}>
                    <EditIcon className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="hr-leave-board__action-danger"
                    aria-label="ลบ"
                    onClick={() => setConfirmDel(row)}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>}

      {editing ? (
        <RunningNumberModal
          initial={editing}
          mode={editMode}
          onCancel={close}
          onSave={handleSave}
          accent={accent}
        />
      ) : null}

      {confirmDel ? (
        <ConfirmDelete
          label={confirmDel.docLabelTh}
          onCancel={() => setConfirmDel(null)}
          onConfirm={() => del(confirmDel.id)}
        />
      ) : null}
    </div>
  );
}

// ─── Main dispatcher ──────────────────────────────────────────────────────────

export type BasicSettingsSub =
  | 'employee-type'
  | 'employee-defaults'
  | 'running-number'
  | 'basic-settings';

export function BasicSettingsBoard({
  sub,
  accent,
}: {
  sub: BasicSettingsSub;
  accent: string;
}) {
  if (sub === 'employee-defaults') return <EmployeeDefaultsForm accent={accent} />;
  if (sub === 'running-number')    return <RunningNumberBoard accent={accent} />;
  if (sub === 'basic-settings')    return <div className="px-4 pt-4"><AutoEmpCodeCard accent={accent} /></div>;
  return <EmployeeTypeBoard accent={accent} />;
}

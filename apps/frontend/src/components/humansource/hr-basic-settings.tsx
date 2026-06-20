'use client';

import { type FormEvent, useEffect, useRef, useState } from 'react';
import { EditIcon, PlusIcon, SearchIcon, TrashIcon, XIcon } from '@/components/ui/icons';
import { HrCustomSelect } from './hr-ui';
import {
  EMPLOYEE_TYPE_SEED,
  EMPLOYEE_TYPES_STORAGE_KEY,
  taxLabel,
  type EmployeeType,
  type EmployeeTypeTax,
} from '@/data/humansource/employee-types';
import {
  EDUCATION_OPTIONS_STORAGE_KEY,
  EDUCATION_SEED,
  EMPLOYEE_DEFAULTS_SEED,
  EMPLOYEE_DEFAULTS_STORAGE_KEY,
  NATIONALITY_OPTIONS_STORAGE_KEY,
  NATIONALITY_SEED,
  PREFIX_OPTIONS_STORAGE_KEY,
  PREFIX_SEED,
  RUNNING_NUMBER_SEED,
  RUNNING_NUMBERS_STORAGE_KEY,
  type EmployeeDefaults,
  type MasterOption,
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

// ─── Employee Type CRUD ────────────────────────────────────────────────────────

const TAX_OPTIONS: { value: EmployeeTypeTax; label: string }[] = [
  { value: 'withholding', label: 'หัก ณ ที่จ่าย' },
  { value: 'none',        label: 'ไม่หัก' },
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
  return { id: '', code: '', nameTh: '', nameEn: '', tax: 'none', active: true };
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
    <div className="hr-leave-modal-overlay" role="dialog" aria-modal="true">
      <form className="hr-leave-modal-shell" onSubmit={submit}>
        <header className="hr-leave-modal-head">
          <div className="hr-leave-modal-head__lead">
            <button type="button" onClick={onCancel} aria-label="กลับ" className="hr-leave-modal-head__back">
              <XIcon className="h-4 w-4" />
            </button>
            <div className="hr-leave-modal-head__title-block">
              <h3 className="hr-leave-modal-head__title">
                {mode === 'create' ? 'เพิ่มประเภทพนักงาน' : 'แก้ไขประเภทพนักงาน'}
              </h3>
              <p className="hr-leave-modal-head__subtitle">กำหนดรหัสและชื่อประเภทพนักงาน</p>
            </div>
          </div>
        </header>

        <div className="hr-leave-modal-body">
          <div className="hr-leave-modal-body__inner">
            {error ? <p className="hr-leave-modal-error">{error}</p> : null}

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

function EmployeeTypeBoard({ accent }: { accent: string }) {
  const [rows, setRows] = useState<EmployeeType[]>(EMPLOYEE_TYPE_SEED);
  const [hydrated, setHydrated] = useState(false);
  const [editing, setEditing] = useState<EmployeeType | null>(null);
  const [editMode, setEditMode] = useState<'create' | 'edit'>('create');
  const [confirmDel, setConfirmDel] = useState<EmployeeType | null>(null);
  const [search, setSearch] = useState('');
  const counter = useRef(0);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(EMPLOYEE_TYPES_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as EmployeeType[];
        if (Array.isArray(parsed) && parsed.length > 0) setRows(parsed);
      }
    } catch {
      window.localStorage.removeItem(EMPLOYEE_TYPES_STORAGE_KEY);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(EMPLOYEE_TYPES_STORAGE_KEY, JSON.stringify(rows));
  }, [rows, hydrated]);

  const openCreate = () => {
    setEditMode('create');
    setEditing(emptyEmpType());
  };
  const openEdit = (row: EmployeeType) => {
    setEditMode('edit');
    setEditing(row);
  };
  const close = () => setEditing(null);

  const handleSave = (row: EmployeeType) => {
    setRows((current) => {
      if (editMode === 'create') {
        const id = `et-${Date.now()}-${counter.current++}`;
        return [...current, { ...row, id }];
      }
      return current.map((r) => (r.id === row.id ? row : r));
    });
    close();
  };

  const toggle = (id: string) =>
    setRows((current) => current.map((r) => (r.id === id ? { ...r, active: !r.active } : r)));

  const del = (id: string) => {
    setRows((current) => current.filter((r) => r.id !== id));
    setConfirmDel(null);
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
      <header className="hr-leave-board__toolbar">
        <div className="hr-leave-board__toolbar-left">
          <span className="hr-leave-board__toolbar-count">{rows.length} ประเภทพนักงาน</span>
        </div>
        <div className="hr-leave-board__toolbar-right">
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
        <table className="hr-leave-board__table">
          <thead>
            <tr>
              <th>รหัส</th>
              <th>ชื่อ</th>
              <th>ภาษาอังกฤษ</th>
              <th>การหักภาษี</th>
              <th>จำนวนพนักงาน</th>
              <th>สถานะ</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.id} onClick={() => openEdit(row)}>
                <td>
                  <span className="hr-leave-board__mono">{row.code}</span>
                </td>
                <td>
                  <strong>{row.nameTh}</strong>
                </td>
                <td className="text-gray-500">{row.nameEn}</td>
                <td className="text-gray-500">{taxLabel(row.tax)}</td>
                <td className="text-gray-400">0</td>
                <td onClick={(e) => e.stopPropagation()}>
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
                    aria-label="แก้ไข"
                    onClick={() => openEdit(row)}
                  >
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
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="hr-leave-board__empty">
                  {search ? `ไม่พบประเภทพนักงานที่ตรงกับ "${search}"` : 'ยังไม่มีประเภทพนักงาน'}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
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
  const [hydrated, setHydrated] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const rawD = window.localStorage.getItem(EMPLOYEE_DEFAULTS_STORAGE_KEY);
      if (rawD) {
        const p = JSON.parse(rawD) as EmployeeDefaults;
        if (p && typeof p.codePrefix === 'string') setDefaults(p);
      }
    } catch { /* ignore */ }
    try {
      const rawT = window.localStorage.getItem(EMPLOYEE_TYPES_STORAGE_KEY);
      if (rawT) {
        const p = JSON.parse(rawT) as EmployeeType[];
        if (Array.isArray(p) && p.length > 0) setEmpTypes(p);
      }
    } catch { /* ignore */ }
    setHydrated(true);
  }, []);

  const update = (patch: Partial<EmployeeDefaults>) => {
    setDefaults((d) => ({ ...d, ...patch }));
    setSaved(false);
  };

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    if (!hydrated) return;
    window.localStorage.setItem(EMPLOYEE_DEFAULTS_STORAGE_KEY, JSON.stringify(defaults));
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
  const [hydrated, setHydrated] = useState(false);
  const [editing, setEditing] = useState<RunningNumberConfig | null>(null);
  const [editMode, setEditMode] = useState<'create' | 'edit'>('create');
  const [confirmDel, setConfirmDel] = useState<RunningNumberConfig | null>(null);
  const counter = useRef(0);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(RUNNING_NUMBERS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as RunningNumberConfig[];
        if (Array.isArray(parsed) && parsed.length > 0) setRows(parsed);
      }
    } catch {
      window.localStorage.removeItem(RUNNING_NUMBERS_STORAGE_KEY);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(RUNNING_NUMBERS_STORAGE_KEY, JSON.stringify(rows));
  }, [rows, hydrated]);

  const openCreate = () => { setEditMode('create'); setEditing(emptyRN()); };
  const openEdit = (row: RunningNumberConfig) => { setEditMode('edit'); setEditing(row); };
  const close = () => setEditing(null);

  const handleSave = (row: RunningNumberConfig) => {
    setRows((current) => {
      if (editMode === 'create') {
        const id = `rn-${Date.now()}-${counter.current++}`;
        return [...current, { ...row, id }];
      }
      return current.map((r) => (r.id === row.id ? row : r));
    });
    close();
  };

  const toggle = (id: string) =>
    setRows((current) => current.map((r) => (r.id === id ? { ...r, active: !r.active } : r)));

  const del = (id: string) => {
    setRows((current) => current.filter((r) => r.id !== id));
    setConfirmDel(null);
  };

  return (
    <div className="hr-leave-board">
      <header className="hr-leave-board__toolbar">
        <div className="hr-leave-board__toolbar-left">
          <span className="hr-leave-board__toolbar-count">{rows.length} รายการ</span>
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

      <div className="hr-leave-board__table-wrap">
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
      </div>

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

// ─── Master Personal (3 inline lists) ────────────────────────────────────────

function MasterList({
  title,
  items,
  storageKey,
  seed,
  accent,
}: {
  title: string;
  items: MasterOption[];
  storageKey: string;
  seed: MasterOption[];
  accent: string;
}) {
  const [rows, setRows] = useState<MasterOption[]>(items);
  const [hydrated, setHydrated] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addName, setAddName] = useState('');
  const [addNameEn, setAddNameEn] = useState('');
  const counter = useRef(0);
  const addRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as MasterOption[];
        if (Array.isArray(parsed) && parsed.length > 0) setRows(parsed);
      }
    } catch {
      window.localStorage.removeItem(storageKey);
    }
    setHydrated(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(storageKey, JSON.stringify(rows));
  }, [rows, hydrated, storageKey]);

  useEffect(() => {
    if (adding) addRef.current?.focus();
  }, [adding]);

  const commitAdd = () => {
    const name = addName.trim();
    if (!name) { setAdding(false); setAddName(''); setAddNameEn(''); return; }
    const id = `mst-${Date.now()}-${counter.current++}`;
    setRows((r) => [...r, { id, nameTh: name, nameEn: addNameEn.trim() || undefined, active: true }]);
    setAddName('');
    setAddNameEn('');
    setAdding(false);
  };

  const toggle = (id: string) =>
    setRows((r) => r.map((o) => (o.id === id ? { ...o, active: !o.active } : o)));

  const del = (id: string) => setRows((r) => r.filter((o) => o.id !== id));

  void seed; // seed used only as initial state in parent

  return (
    <div className="hr-basic-master-list">
      <div className="hr-basic-master-list__head">
        <span className="hr-basic-master-list__title">{title}</span>
        <button
          type="button"
          className="hr-basic-master-list__add-btn"
          style={{ color: accent }}
          onClick={() => setAdding(true)}
        >
          <PlusIcon className="h-3.5 w-3.5" />
          เพิ่ม
        </button>
      </div>

      <ul className="hr-basic-master-list__rows">
        {rows.map((opt) => (
          <li key={opt.id} className="hr-basic-master-list__row">
            <span className="hr-basic-master-list__name">
              {opt.nameTh}
              {opt.nameEn ? <span className="hr-basic-master-list__name-en">{opt.nameEn}</span> : null}
            </span>
            <label className="hr-leave-board__inline-toggle">
              <input
                type="checkbox"
                checked={opt.active}
                onChange={() => toggle(opt.id)}
                aria-label={opt.active ? 'ปิด' : 'เปิด'}
              />
              <span className={`hr-leave-board__toggle-label ${opt.active ? 'hr-settings-status--enabled' : 'hr-settings-status--disabled'}`}>
                {opt.active ? 'ใช้งาน' : 'ปิด'}
              </span>
            </label>
            <button
              type="button"
              className="hr-basic-master-list__del"
              aria-label="ลบ"
              onClick={() => del(opt.id)}
            >
              <TrashIcon className="h-3.5 w-3.5" />
            </button>
          </li>
        ))}
        {rows.length === 0 ? (
          <li className="hr-basic-master-list__empty">ยังไม่มีรายการ</li>
        ) : null}
      </ul>

      {adding ? (
        <div className="hr-basic-master-list__add-row">
          <input
            ref={addRef}
            className="hr-leave-input"
            placeholder="ชื่อ (ไทย)"
            value={addName}
            onChange={(e) => setAddName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); commitAdd(); }
              if (e.key === 'Escape') { setAdding(false); setAddName(''); setAddNameEn(''); }
            }}
          />
          <input
            className="hr-leave-input"
            placeholder="ชื่อ (EN) — ไม่บังคับ"
            value={addNameEn}
            onChange={(e) => setAddNameEn(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); commitAdd(); }
              if (e.key === 'Escape') { setAdding(false); setAddName(''); setAddNameEn(''); }
            }}
          />
          <div className="flex gap-2">
            <button
              type="button"
              className="hr-leave-modal-foot__save px-4 py-1.5 text-xs"
              style={{ backgroundColor: accent }}
              onClick={commitAdd}
            >
              บันทึก
            </button>
            <button
              type="button"
              className="hr-leave-modal-foot__cancel px-4 py-1.5 text-xs"
              onClick={() => { setAdding(false); setAddName(''); setAddNameEn(''); }}
            >
              ยกเลิก
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function MasterPersonalBoard({ accent }: { accent: string }) {
  const [prefixes, setPrefixes] = useState<MasterOption[]>(PREFIX_SEED);
  const [nationalities, setNationalities] = useState<MasterOption[]>(NATIONALITY_SEED);
  const [educations, setEducations] = useState<MasterOption[]>(EDUCATION_SEED);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const load = <T,>(key: string, setter: (v: T) => void) => {
      try {
        const raw = window.localStorage.getItem(key);
        if (raw) {
          const p = JSON.parse(raw) as T;
          if (Array.isArray(p) && (p as unknown[]).length > 0) setter(p);
        }
      } catch { /* ignore */ }
    };
    load(PREFIX_OPTIONS_STORAGE_KEY, setPrefixes);
    load(NATIONALITY_OPTIONS_STORAGE_KEY, setNationalities);
    load(EDUCATION_OPTIONS_STORAGE_KEY, setEducations);
    setHydrated(true);
  }, []);

  void hydrated; // hydration handled per MasterList

  return (
    <div className="hr-basic-master-board">
      <MasterList
        title="คำนำหน้าชื่อ"
        items={prefixes}
        storageKey={PREFIX_OPTIONS_STORAGE_KEY}
        seed={PREFIX_SEED}
        accent={accent}
      />
      <MasterList
        title="สัญชาติ"
        items={nationalities}
        storageKey={NATIONALITY_OPTIONS_STORAGE_KEY}
        seed={NATIONALITY_SEED}
        accent={accent}
      />
      <MasterList
        title="วุฒิการศึกษา"
        items={educations}
        storageKey={EDUCATION_OPTIONS_STORAGE_KEY}
        seed={EDUCATION_SEED}
        accent={accent}
      />
    </div>
  );
}

// ─── Main dispatcher ──────────────────────────────────────────────────────────

export type BasicSettingsSub =
  | 'employee-type'
  | 'employee-defaults'
  | 'running-number'
  | 'master-personal';

export function BasicSettingsBoard({
  sub,
  accent,
}: {
  sub: BasicSettingsSub;
  accent: string;
}) {
  if (sub === 'employee-defaults') return <EmployeeDefaultsForm accent={accent} />;
  if (sub === 'running-number')    return <RunningNumberBoard accent={accent} />;
  if (sub === 'master-personal')   return <MasterPersonalBoard accent={accent} />;
  return <EmployeeTypeBoard accent={accent} />;
}

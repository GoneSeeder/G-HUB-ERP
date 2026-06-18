'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { ArrowLeftIcon, EditIcon, PlusIcon, SearchIcon, TrashIcon, XIcon } from '@/components/ui/icons';
import {
  LEAVE_TYPE_SEED,
  LEAVE_TYPES_STORAGE_KEY,
  type LeavePayType,
  type LeaveType,
  type LeaveUnit,
  type LeaveCountBasis,
  type LeaveRounding,
} from '@/data/humansource/leave-types';
import { HrCustomSelect } from './hr-ui';

// List view + fullscreen modal pattern (matches ShiftSettingsBoard / empeo).
// Tab 1 is editable in Phase 3. Tabs 2/3 are placeholders, filled by later phases.

type LeaveTab = 'rules' | 'eligibility' | 'approval';

const LEAVE_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981',
  '#0ea5e9', '#6366f1', '#8b5cf6', '#ec4899', '#475569',
];

const UNIT_OPTIONS: { value: LeaveUnit; label: string }[] = [
  { value: 'day',  label: 'วัน' },
  { value: 'hour', label: 'ชั่วโมง' },
];

const PAY_OPTIONS: { value: LeavePayType; label: string }[] = [
  { value: 'paid',    label: 'รับค่าจ้าง' },
  { value: 'unpaid',  label: 'ไม่รับค่าจ้าง' },
  { value: 'partial', label: 'รับค่าจ้างบางส่วน' },
];

const COUNT_BASIS_OPTIONS: { value: LeaveCountBasis; label: string }[] = [
  { value: 'working-day',  label: 'นับวันทำงาน' },
  { value: 'calendar-day', label: 'นับวันปฏิทิน' },
];

const ROUNDING_OPTIONS: { value: LeaveRounding; label: string }[] = [
  { value: 'none',      label: 'ไม่ปัดเศษ' },
  { value: 'half',      label: 'ปัดเป็นครึ่งวัน' },
  { value: 'full-day',  label: 'ปัดเป็นเต็มวัน' },
  { value: 'full-hour', label: 'ปัดเป็นเต็มชั่วโมง' },
];

const TABS: { value: LeaveTab; label: string }[] = [
  { value: 'rules',       label: 'การลา' },
  { value: 'eligibility', label: 'สิทธิ์การลา' },
  { value: 'approval',    label: 'เงื่อนไขการอนุมัติ' },
];

function emptyLeave(seedColor: string): LeaveType {
  return {
    id: '',
    code: '',
    nameTh: '',
    nameEn: '',
    tag: '',
    color: seedColor,
    unit: 'day',
    statutory: false,
    enabled: true,
    rules: {
      payType: 'paid',
      countBasis: 'working-day',
      countHolidayAsLeave: false,
      minMinutes: 60,
      allowHalfDay: true,
      advanceDays: 7,
      backdateDays: 0,
      maxConsecutiveDays: null,
      requireAttachment: false,
      requireAttachmentOverDays: null,
      rounding: 'half',
      carryOver: false,
      carryOverCap: null,
      carryOverExpiryMonths: null,
    },
    eligibility: {
      gender: 'all',
      requirePassProbation: false,
      minTenureMonths: 0,
      positions: [],
      departments: [],
      employees: [],
    },
    quota: { mode: 'fixed', fixedDays: 0, prorateFirstYear: true, cutoffBasis: 'fiscal-year' },
    approval: { useDefaultTemplate: true, templateDocType: null },
  };
}

export function LeaveSettings({ accent }: { accent: string }) {
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>(LEAVE_TYPE_SEED);
  const [hydrated, setHydrated] = useState(false);
  const [editing, setEditing] = useState<LeaveType | null>(null);  // null = closed
  const [editingMode, setEditingMode] = useState<'create' | 'edit'>('create');
  const [confirmDelete, setConfirmDelete] = useState<LeaveType | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(LEAVE_TYPES_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as LeaveType[];
        if (Array.isArray(parsed) && parsed.length > 0) setLeaveTypes(parsed);
      }
    } catch {
      window.localStorage.removeItem(LEAVE_TYPES_STORAGE_KEY);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(LEAVE_TYPES_STORAGE_KEY, JSON.stringify(leaveTypes));
  }, [leaveTypes, hydrated]);

  const openCreate = () => {
    setEditingMode('create');
    setEditing(emptyLeave(LEAVE_COLORS[leaveTypes.length % LEAVE_COLORS.length]));
  };

  const openEdit = (leave: LeaveType) => {
    setEditingMode('edit');
    setEditing(leave);
  };

  const close = () => setEditing(null);

  const handleSave = (next: LeaveType) => {
    setLeaveTypes((current) => {
      if (editingMode === 'create') {
        return [...current, { ...next, id: `leave-custom-${Date.now()}` }];
      }
      return current.map((leave) => (leave.id === next.id ? next : leave));
    });
    close();
  };

  const deleteLeave = (id: string) => {
    setLeaveTypes((current) => current.filter((leave) => leave.id !== id));
    setConfirmDelete(null);
  };

  const toggleEnabled = (id: string) => {
    setLeaveTypes((current) =>
      current.map((leave) => (leave.id === id ? { ...leave, enabled: !leave.enabled } : leave))
    );
  };

  const filtered = search.trim()
    ? leaveTypes.filter(
        (leave) =>
          leave.nameTh.includes(search) ||
          leave.nameEn.toLowerCase().includes(search.toLowerCase()) ||
          leave.code.includes(search.toUpperCase())
      )
    : leaveTypes;

  return (
    <div className="hr-leave-board">
      <header className="hr-leave-board__toolbar">
        <div className="hr-leave-board__toolbar-left">
          <span className="hr-leave-board__toolbar-count">{leaveTypes.length} ประเภทการลา</span>
        </div>
        <div className="hr-leave-board__toolbar-right">
          <div className="hr-leave-board__search">
            <SearchIcon className="h-3.5 w-3.5" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหา..."
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
            เพิ่มประเภทการลา
          </button>
        </div>
      </header>

      <div className="hr-leave-board__table-wrap">
        <table className="hr-leave-board__table">
          <thead>
            <tr>
              <th className="hr-leave-board__th-stripe" />
              <th>ชื่อประเภทการลา</th>
              <th>รหัส</th>
              <th>การจ่ายค่าจ้าง</th>
              <th>โควตา</th>
              <th>สถานะ</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {filtered.map((leave) => (
              <tr key={leave.id} onClick={() => openEdit(leave)}>
                <td className="hr-leave-board__stripe" style={{ backgroundColor: leave.color }} />
                <td>
                  <div className="hr-leave-board__name">
                    <div className="hr-leave-board__name-block">
                      <strong>{leave.nameTh}</strong>
                      {leave.nameEn ? <span>{leave.nameEn}</span> : null}
                    </div>
                    <span
                      className={`hr-leave-board__type-badge ${
                        leave.statutory ? 'hr-leave-board__type-badge--law' : ''
                      }`}
                    >
                      {leave.statutory ? 'ตามกฎหมาย' : 'สวัสดิการ'}
                    </span>
                  </div>
                </td>
                <td className="hr-leave-board__mono">{leave.code}</td>
                <td>{describePay(leave)}</td>
                <td>{describeQuota(leave)}</td>
                <td>
                  <label
                    className="hr-leave-board__inline-toggle"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={leave.enabled}
                      onChange={() => toggleEnabled(leave.id)}
                    />
                    <span className="hr-leave-switch">
                      <span className="hr-leave-switch__thumb" />
                    </span>
                    <span className="hr-leave-board__toggle-label">
                      {leave.enabled ? 'ใช้งาน' : 'ปิดใช้งาน'}
                    </span>
                  </label>
                </td>
                <td className="hr-leave-board__actions">
                  <button
                    type="button"
                    aria-label="แก้ไข"
                    onClick={(event) => {
                      event.stopPropagation();
                      openEdit(leave);
                    }}
                  >
                    <EditIcon className="h-4 w-4" />
                  </button>
                  {!leave.statutory ? (
                    <button
                      type="button"
                      aria-label="ลบ"
                      className="hr-leave-board__action-danger"
                      onClick={(event) => {
                        event.stopPropagation();
                        setConfirmDelete(leave);
                      }}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="hr-leave-board__empty">
                  {search
                    ? `ไม่พบประเภทการลาที่ตรงกับ "${search}"`
                    : 'ยังไม่มีประเภทการลา — กด "เพิ่มประเภทการลา" เพื่อเริ่มต้น'}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {editing ? (
        <LeaveFormModal
          initial={editing}
          mode={editingMode}
          existingCodes={leaveTypes
            .filter((leave) => leave.id !== editing.id)
            .map((leave) => leave.code.toUpperCase())}
          onCancel={close}
          onSave={handleSave}
          accent={accent}
        />
      ) : null}

      {confirmDelete ? (
        <DeleteLeaveConfirm
          leave={confirmDelete}
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => deleteLeave(confirmDelete.id)}
        />
      ) : null}
    </div>
  );
}

// ─── Modal (fullscreen — Shift pattern, empeo-flat form) ──────────────────

function LeaveFormModal({
  initial,
  mode,
  existingCodes,
  onCancel,
  onSave,
  accent,
}: {
  initial: LeaveType;
  mode: 'create' | 'edit';
  existingCodes: string[];
  onCancel: () => void;
  onSave: (leave: LeaveType) => void;
  accent: string;
}) {
  const [draft, setDraft] = useState<LeaveType>(initial);
  const [tab, setTab] = useState<LeaveTab>('rules');
  const [error, setError] = useState('');

  useEffect(() => {
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', onEscape);
    return () => document.removeEventListener('keydown', onEscape);
  }, [onCancel]);

  const update = (patch: Partial<LeaveType>) => setDraft((current) => ({ ...current, ...patch }));
  const updateRules = (patch: Partial<LeaveType['rules']>) =>
    setDraft((current) => ({ ...current, rules: { ...current.rules, ...patch } }));

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nameTh = draft.nameTh.trim();
    const code = draft.code.trim().toUpperCase();
    if (!nameTh) {
      setError('กรุณาระบุชื่อประเภทการลา');
      setTab('rules');
      return;
    }
    if (!code) {
      setError('กรุณาระบุรหัสประเภทการลา');
      setTab('rules');
      return;
    }
    if (existingCodes.includes(code)) {
      setError('รหัสนี้ถูกใช้งานแล้ว');
      setTab('rules');
      return;
    }
    onSave({ ...draft, nameTh, code });
  };

  const title = mode === 'create' ? 'เพิ่มประเภทการลา' : 'แก้ไขประเภทการลา';
  const subtitle =
    mode === 'create'
      ? 'กำหนดข้อมูลและเงื่อนไขการลาเริ่มต้น แล้วบันทึกเพื่อเปิดใช้งาน'
      : 'แก้ไขข้อมูลและเงื่อนไขของประเภทการลานี้';

  return (
    <div className="hr-leave-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="hr-leave-modal-title">
      <form className="hr-leave-modal-shell" onSubmit={submit}>
        <header className="hr-leave-modal-head">
          <div className="hr-leave-modal-head__lead">
            <button
              type="button"
              onClick={onCancel}
              aria-label="กลับ"
              className="hr-leave-modal-head__back"
            >
              <ArrowLeftIcon className="h-4 w-4" />
            </button>
            <div className="hr-leave-modal-head__title-block">
              <h3 id="hr-leave-modal-title" className="hr-leave-modal-head__title">
                {title}
              </h3>
              <p className="hr-leave-modal-head__subtitle">{subtitle}</p>
            </div>
          </div>
          <label className="hr-leave-modal-head__toggle">
            <input
              type="checkbox"
              checked={draft.enabled}
              onChange={(event) => update({ enabled: event.target.checked })}
            />
            <span className="hr-leave-switch">
              <span className="hr-leave-switch__thumb" />
            </span>
            <span className="hr-leave-modal-head__toggle-label">
              {draft.enabled ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
            </span>
          </label>
        </header>

        <nav className="hr-leave-modal-tabs" aria-label="ตั้งค่าการลา">
          <div className="hr-leave-modal-tabs__inner">
            {TABS.map((tabItem) => (
              <button
                key={tabItem.value}
                type="button"
                onClick={() => setTab(tabItem.value)}
                className={`hr-leave-modal-tab ${tab === tabItem.value ? 'hr-leave-modal-tab--active' : ''}`}
              >
                {tabItem.label}
              </button>
            ))}
          </div>
        </nav>

        <div className="hr-leave-modal-body">
          <div className="hr-leave-modal-body__inner">
            {tab === 'rules' ? (
              <RulesForm draft={draft} onChange={update} onRulesChange={updateRules} />
            ) : null}
            {tab === 'eligibility' ? <ComingSoon label="สิทธิ์การลา" phase="เฟส 4" /> : null}
            {tab === 'approval' ? <ComingSoon label="เงื่อนไขการอนุมัติ" phase="เฟส 7" /> : null}
            {error ? <p className="hr-leave-modal-error">{error}</p> : null}
          </div>
        </div>

        <footer className="hr-leave-modal-foot">
          <button type="button" className="hr-leave-modal-foot__cancel" onClick={onCancel}>
            ยกเลิก
          </button>
          <button
            type="submit"
            className="hr-leave-modal-foot__save"
            style={{ backgroundColor: accent }}
          >
            {mode === 'create' ? 'สร้าง' : 'บันทึก'}
          </button>
        </footer>
      </form>
    </div>
  );
}

// ─── Tab 1 form (flat empeo-style — no card sections, headings only) ──────

function RulesForm({
  draft,
  onChange,
  onRulesChange,
}: {
  draft: LeaveType;
  onChange: (patch: Partial<LeaveType>) => void;
  onRulesChange: (patch: Partial<LeaveType['rules']>) => void;
}) {
  const r = draft.rules;
  return (
    <div className="hr-leave-form">
      {/* Group: ข้อมูลพื้นฐาน */}
      <div className="hr-leave-form__grid">
        <Field label="ชื่อประเภทการลา" required>
          <input
            autoFocus
            value={draft.nameTh}
            onChange={(event) => onChange({ nameTh: event.target.value })}
            placeholder="เช่น ลาดูแลบุตร"
            className="hr-leave-input"
          />
        </Field>
        <Field label="ชื่อประเภทการลา (EN)">
          <input
            value={draft.nameEn}
            onChange={(event) => onChange({ nameEn: event.target.value })}
            placeholder="e.g. Childcare Leave"
            className="hr-leave-input"
          />
        </Field>
        <Field label="รหัส" required>
          <input
            value={draft.code}
            onChange={(event) => onChange({ code: event.target.value.toUpperCase() })}
            placeholder="เช่น CHILD"
            className="hr-leave-input hr-leave-input--mono"
          />
        </Field>
        <Field label="แท็ก">
          <input
            value={draft.tag}
            onChange={(event) => onChange({ tag: event.target.value })}
            placeholder="แท็กสั้น ๆ"
            className="hr-leave-input"
          />
        </Field>
        <Field label="สีประจำการลา" full>
          <ColorSwatchPicker value={draft.color} onChange={(color) => onChange({ color })} />
        </Field>
        <Field label="หน่วยการลา">
          <HrCustomSelect
            value={draft.unit}
            options={UNIT_OPTIONS}
            onChange={(value) => onChange({ unit: value as LeaveUnit })}
            label="หน่วยการลา"
          />
        </Field>
      </div>

      <GroupHeading>การจ่ายค่าจ้างและการนับวัน</GroupHeading>
      <div className="hr-leave-form__grid">
        <Field label="การจ่ายค่าจ้าง">
          <HrCustomSelect
            value={r.payType}
            options={PAY_OPTIONS}
            onChange={(value) => onRulesChange({ payType: value as LeavePayType })}
            label="การจ่ายค่าจ้าง"
          />
        </Field>
        {r.payType === 'partial' ? (
          <Field label="จำนวนวันที่จ่ายค่าจ้าง" suffix="วัน">
            <input
              type="number"
              min={0}
              value={r.partialPaidDays ?? 0}
              onChange={(event) => onRulesChange({ partialPaidDays: numberOr(event.target.value, 0) })}
              className="hr-leave-input hr-leave-input--num"
            />
          </Field>
        ) : (
          <Field label=" " hidden />
        )}
        <Field label="วิธีนับวันลา">
          <HrCustomSelect
            value={r.countBasis}
            options={COUNT_BASIS_OPTIONS}
            onChange={(value) => onRulesChange({ countBasis: value as LeaveCountBasis })}
            label="วิธีนับวันลา"
          />
        </Field>
        <ToggleField
          label="นับวันหยุดที่ตกในช่วงลาเป็นวันลาด้วย"
          checked={r.countHolidayAsLeave}
          onChange={(checked) => onRulesChange({ countHolidayAsLeave: checked })}
        />
      </div>

      <GroupHeading>เงื่อนไขการยื่นเรื่อง</GroupHeading>
      <div className="hr-leave-form__grid">
        <Field label="ขั้นต่ำต่อครั้ง" suffix="นาที">
          <input
            type="number"
            min={0}
            value={r.minMinutes}
            onChange={(event) => onRulesChange({ minMinutes: numberOr(event.target.value, 0) })}
            className="hr-leave-input hr-leave-input--num"
          />
        </Field>
        <Field label="ลาล่วงหน้าได้ก่อน" suffix="วัน">
          <input
            type="number"
            min={0}
            value={r.advanceDays}
            onChange={(event) => onRulesChange({ advanceDays: numberOr(event.target.value, 0) })}
            className="hr-leave-input hr-leave-input--num"
          />
        </Field>
        <Field label="ลาย้อนหลังได้ภายใน" suffix="วัน">
          <input
            type="number"
            min={0}
            value={r.backdateDays}
            onChange={(event) => onRulesChange({ backdateDays: numberOr(event.target.value, 0) })}
            className="hr-leave-input hr-leave-input--num"
          />
        </Field>
        <Field label="ลาติดต่อกันสูงสุด" suffix={r.maxConsecutiveDays === null ? undefined : 'วัน'}>
          <div className="hr-leave-input-row">
            <input
              type="number"
              min={0}
              disabled={r.maxConsecutiveDays === null}
              value={r.maxConsecutiveDays ?? ''}
              onChange={(event) =>
                onRulesChange({ maxConsecutiveDays: numberOr(event.target.value, 0) })
              }
              className="hr-leave-input hr-leave-input--num"
            />
            <label className="hr-leave-mini-check">
              <input
                type="checkbox"
                checked={r.maxConsecutiveDays === null}
                onChange={(event) =>
                  onRulesChange({ maxConsecutiveDays: event.target.checked ? null : 0 })
                }
              />
              <span>ไม่จำกัด</span>
            </label>
          </div>
        </Field>
        <ToggleField
          label="อนุญาตให้ลาครึ่งวัน"
          checked={r.allowHalfDay}
          onChange={(checked) => onRulesChange({ allowHalfDay: checked })}
        />
        <ToggleField
          label="ต้องแนบไฟล์ประกอบเมื่อยื่นเรื่อง"
          checked={r.requireAttachment}
          onChange={(checked) =>
            onRulesChange({
              requireAttachment: checked,
              requireAttachmentOverDays: checked ? r.requireAttachmentOverDays ?? 0 : null,
            })
          }
        />
        {r.requireAttachment ? (
          <Field label="บังคับแนบเมื่อลา ≥" suffix="วัน">
            <input
              type="number"
              min={0}
              value={r.requireAttachmentOverDays ?? 0}
              onChange={(event) =>
                onRulesChange({ requireAttachmentOverDays: numberOr(event.target.value, 0) })
              }
              className="hr-leave-input hr-leave-input--num"
            />
          </Field>
        ) : null}
      </div>

      <GroupHeading>การปัดเศษและสะสมข้ามปี</GroupHeading>
      <div className="hr-leave-form__grid">
        <Field label="วิธีปัดเศษ">
          <HrCustomSelect
            value={r.rounding}
            options={ROUNDING_OPTIONS}
            onChange={(value) => onRulesChange({ rounding: value as LeaveRounding })}
            label="วิธีปัดเศษ"
          />
        </Field>
        <ToggleField
          label="ยกยอดวันลาไปปีถัดไปได้"
          checked={r.carryOver}
          onChange={(checked) =>
            onRulesChange({
              carryOver: checked,
              carryOverCap: checked ? r.carryOverCap ?? 0 : null,
              carryOverExpiryMonths: checked ? r.carryOverExpiryMonths ?? 12 : null,
            })
          }
        />
        {r.carryOver ? (
          <>
            <Field label="ยกยอดสูงสุด" suffix="วัน">
              <input
                type="number"
                min={0}
                value={r.carryOverCap ?? 0}
                onChange={(event) =>
                  onRulesChange({ carryOverCap: numberOr(event.target.value, 0) })
                }
                className="hr-leave-input hr-leave-input--num"
              />
            </Field>
            <Field label="วันที่หมดอายุ" suffix="เดือน">
              <input
                type="number"
                min={0}
                value={r.carryOverExpiryMonths ?? 0}
                onChange={(event) =>
                  onRulesChange({ carryOverExpiryMonths: numberOr(event.target.value, 0) })
                }
                className="hr-leave-input hr-leave-input--num"
              />
            </Field>
          </>
        ) : null}
      </div>
    </div>
  );
}

// ─── Reusable bits ─────────────────────────────────────────────────────────

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
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
        />
        <span className="hr-leave-switch">
          <span className="hr-leave-switch__thumb" />
        </span>
      </span>
    </label>
  );
}

function ColorSwatchPicker({ value, onChange }: { value: string; onChange: (color: string) => void }) {
  return (
    <div className="hr-leave-color-grid">
      {LEAVE_COLORS.map((color) => {
        const active = color.toLowerCase() === value.toLowerCase();
        return (
          <button
            key={color}
            type="button"
            onClick={() => onChange(color)}
            aria-label={`เลือกสี ${color}`}
            aria-pressed={active}
            className={`hr-leave-color-swatch ${active ? 'hr-leave-color-swatch--active' : ''}`}
            style={{ backgroundColor: color }}
          />
        );
      })}
    </div>
  );
}

function ComingSoon({ label, phase }: { label: string; phase: string }) {
  return (
    <div className="hr-leave-coming">
      <p className="hr-leave-coming__title">{label}</p>
      <p className="hr-leave-coming__desc">หน้านี้จะเปิดใช้งานใน {phase}</p>
    </div>
  );
}

function DeleteLeaveConfirm({
  leave,
  onCancel,
  onConfirm,
}: {
  leave: LeaveType;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="hr-leave-confirm-overlay" role="presentation" onClick={onCancel}>
      <section
        className="hr-leave-confirm"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="hr-leave-confirm-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="hr-leave-confirm__head">
          <h4 id="hr-leave-confirm-title">ยืนยันการลบประเภทการลา</h4>
          <button type="button" onClick={onCancel} aria-label="ปิด">
            <XIcon className="h-5 w-5" />
          </button>
        </header>
        <div className="hr-leave-confirm__body">
          <p>
            ต้องการลบประเภทการลา <strong>{leave.nameTh}</strong> ใช่หรือไม่?
          </p>
          <p className="hr-leave-confirm__note">
            การลบจะไม่สามารถกู้คืนได้ และพนักงานที่เคยยื่นการลาประเภทนี้จะอ้างอิงข้อมูลย้อนหลังไม่ได้
          </p>
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

// ─── Helpers ──────────────────────────────────────────────────────────────

function numberOr(value: string, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function describePay(leave: LeaveType): string {
  if (leave.rules.payType === 'paid') return 'รับค่าจ้างเต็ม';
  if (leave.rules.payType === 'unpaid') return 'ไม่รับค่าจ้าง';
  return `รับบางส่วน (${leave.rules.partialPaidDays ?? 0} วัน)`;
}

function describeQuota(leave: LeaveType): string {
  const q = leave.quota;
  if (q.mode === 'unlimited') return 'ไม่จำกัด';
  if (q.mode === 'medical') return 'ตามแพทย์กำหนด';
  if (q.mode === 'tenure-tier') {
    const max = (q.tiers ?? []).reduce((m, t) => Math.max(m, t.days), 0);
    return `ตามอายุงาน (สูงสุด ${max} วัน)`;
  }
  return `${q.fixedDays ?? 0} วัน/ปี`;
}

'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { ArrowLeftIcon, EditIcon, PlusIcon, SearchIcon, TrashIcon, XIcon } from '@/components/ui/icons';
import {
  LEAVE_TYPE_SEED,
  LEAVE_TYPES_STORAGE_KEY,
  type LeaveCountBasis,
  type LeaveCutoffBasis,
  type LeaveGender,
  type LeavePayType,
  type LeaveQuotaByEmployeeType,
  type LeaveQuotaMode,
  type LeaveRounding,
  type LeaveType,
  type LeaveUnit,
  type TenureTier,
} from '@/data/humansource/leave-types';
import { employees } from '@/data/humansource/mock';
import {
  ORG_STRUCTURE_SEED,
  type OrgNode,
} from '@/data/humansource/org-structure';
import {
  EMPLOYEE_TYPE_SEED,
  EMPLOYEE_TYPES_STORAGE_KEY,
  type EmployeeType,
} from '@/data/humansource/employee-types';
import {
  APPROVAL_DOC_CONFIGS_STORAGE_KEY,
  DOCUMENT_TYPES_SEED,
  describeApproval,
  type DocumentApprovalConfig,
} from '@/data/humansource/approval-workflows';
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

const GENDER_OPTIONS: { value: LeaveGender; label: string }[] = [
  { value: 'all',    label: 'ลาได้ทุกเพศ' },
  { value: 'male',   label: 'เฉพาะชาย' },
  { value: 'female', label: 'เฉพาะหญิง' },
];

const QUOTA_MODE_OPTIONS: { value: LeaveQuotaMode; label: string }[] = [
  { value: 'fixed',       label: 'คงที่ (กำหนดจำนวนวัน)' },
  { value: 'tenure-tier', label: 'ตามอายุงาน (ตาราง tier)' },
  { value: 'unlimited',   label: 'ไม่จำกัด' },
  { value: 'medical',     label: 'ตามแพทย์กำหนด' },
];

const CUTOFF_OPTIONS: { value: LeaveCutoffBasis; label: string }[] = [
  { value: 'fiscal-year', label: 'ตามปีงบประมาณ' },
  { value: 'hire-date',   label: 'ตามวันเริ่มงาน' },
];

// Override steps for a single leave type (Tab 3). Value stored as number | 'hr'.
const STEP_OVERRIDE_OPTIONS: { value: string; label: string }[] = [
  { value: '1',  label: 'อนุมัติ 1 ขั้น' },
  { value: '2',  label: 'อนุมัติ 2 ขั้น' },
  { value: '3',  label: 'อนุมัติ 3 ขั้น' },
  { value: '4',  label: 'อนุมัติ 4 ขั้น' },
  { value: '5',  label: 'อนุมัติ 5 ขั้น' },
  { value: 'hr', label: 'ส่งตรงถึง HR' },
];

// ─── Org tree — built from org-structure SoT + employee FK ids ──────────────
// Selection model: orgNodeIds[] = dept/team nodes selected whole; employeeIds[] = individuals.
// Migration map: old 'departments' Thai name → OrgNode.id (used in hydrate migration).
const DEPT_NAME_TO_NODE_ID: Record<string, string> = {
  'ฝ่ายบุคคล':  'org-ghub-hr',
  'ฝ่ายบัญชี':  'org-ghub-acc',
  'ฝ่ายขาย':    'org-ghub-sales',
  'IT':          'org-ghub-it',
  'Operations':  'org-ghub-wh',
};

type OrgEmployee = { id: string; name: string; code: string; position: string };
type OrgLeaf = { nodeId: string; name: string; employees: OrgEmployee[] };

function flattenToLeaves(nodes: OrgNode[]): OrgLeaf[] {
  const result: OrgLeaf[] = [];
  for (const node of nodes) {
    if (node.type === 'department' || node.type === 'team') {
      result.push({
        nodeId: node.id,
        name: node.name,
        employees: employees
          .filter((e) => e.active && e.departmentNodeId === node.id)
          .map((e) => ({ id: e.id, name: e.name, code: e.code, position: e.position })),
      });
      if (node.children.length > 0) result.push(...flattenToLeaves(node.children));
    } else {
      result.push(...flattenToLeaves(node.children));
    }
  }
  return result;
}

const ORG_LEAVES: OrgLeaf[] = flattenToLeaves(ORG_STRUCTURE_SEED);
const ALL_LEAF_IDS = ORG_LEAVES.map((l) => l.nodeId);
const uniq = (arr: string[]) => Array.from(new Set(arr));

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
      positionIds: [],
      orgNodeIds: [],
      employeeIds: [],
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
        if (Array.isArray(parsed) && parsed.length > 0) {
          // One-time migration: old shape had departments/positions/employees (string names).
          // New shape uses orgNodeIds/positionIds/employeeIds (stable ids).
          const migrated = parsed.map((lt) => {
            const e = lt.eligibility as Record<string, unknown>;
            if ('departments' in e && !('orgNodeIds' in e)) {
              return {
                ...lt,
                eligibility: {
                  gender: lt.eligibility.gender,
                  requirePassProbation: lt.eligibility.requirePassProbation,
                  minTenureMonths: lt.eligibility.minTenureMonths,
                  positionIds: (e.positions as string[]) ?? [],
                  orgNodeIds: ((e.departments as string[]) ?? [])
                    .map((name) => DEPT_NAME_TO_NODE_ID[name])
                    .filter((id): id is string => !!id),
                  employeeIds: (e.employees as string[]) ?? [],
                },
              };
            }
            return lt;
          });
          setLeaveTypes(migrated);
        }
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
  const updateEligibility = (patch: Partial<LeaveType['eligibility']>) =>
    setDraft((current) => ({ ...current, eligibility: { ...current.eligibility, ...patch } }));
  const updateQuota = (patch: Partial<LeaveType['quota']>) =>
    setDraft((current) => ({ ...current, quota: { ...current.quota, ...patch } }));
  const updateApproval = (patch: Partial<LeaveType['approval']>) =>
    setDraft((current) => ({ ...current, approval: { ...current.approval, ...patch } }));

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
              <RulesForm
                draft={draft}
                onChange={update}
                onRulesChange={updateRules}
                onEligibilityChange={updateEligibility}
              />
            ) : null}
            {tab === 'eligibility' ? (
              <EligibilityForm
                draft={draft}
                onEligibilityChange={updateEligibility}
                onQuotaChange={updateQuota}
              />
            ) : null}
            {tab === 'approval' ? (
              <ApprovalForm draft={draft} onApprovalChange={updateApproval} />
            ) : null}
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

// ─── Tab 1 form (empeo-style — clear sections, essentials first) ──────────
// v1 priority: define a leave type that feeds payroll (pay type, day counting)
// and quota. Workflow/edge rules live in a collapsed "advanced" section.

function RulesForm({
  draft,
  onChange,
  onRulesChange,
  onEligibilityChange,
}: {
  draft: LeaveType;
  onChange: (patch: Partial<LeaveType>) => void;
  onRulesChange: (patch: Partial<LeaveType['rules']>) => void;
  onEligibilityChange: (patch: Partial<LeaveType['eligibility']>) => void;
}) {
  const r = draft.rules;
  return (
    <div className="hr-leave-form">
      {/* ① ข้อมูลพื้นฐาน */}
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
        <Field label="เพศที่ใช้สิทธิ์ได้">
          <HrCustomSelect
            value={draft.eligibility.gender}
            options={GENDER_OPTIONS}
            onChange={(value) => onEligibilityChange({ gender: value as LeaveGender })}
            label="เพศที่ใช้สิทธิ์ได้"
          />
        </Field>
        <ToggleField
          label="อนุญาตให้ลาครึ่งวัน"
          checked={r.allowHalfDay}
          onChange={(checked) => onRulesChange({ allowHalfDay: checked })}
        />
      </div>

      {/* ② ค่าจ้าง & การนับวัน — ป้อนข้อมูลให้การคำนวณเงินเดือน */}
      <GroupHeading>
        ค่าจ้าง &amp; การนับวัน
        <span className="hr-leave-form__heading-hint"> — ใช้คำนวณเงินเดือน</span>
      </GroupHeading>
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

      {/* ③ เงื่อนไขเพิ่มเติม — พับเก็บไว้ ไม่จำเป็นสำหรับการตั้งค่าเบื้องต้น */}
      <CollapsibleSection title="เงื่อนไขเพิ่มเติม (ขั้นสูง)">
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
          <Field label="วิธีปัดเศษ">
            <HrCustomSelect
              value={r.rounding}
              options={ROUNDING_OPTIONS}
              onChange={(value) => onRulesChange({ rounding: value as LeaveRounding })}
              label="วิธีปัดเศษ"
            />
          </Field>
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
      </CollapsibleSection>
    </div>
  );
}

// Collapsible "advanced" section — closed by default to keep the form light.
function CollapsibleSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="hr-leave-collapse">
      <button
        type="button"
        className="hr-leave-collapse__head"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <svg
          className={`hr-leave-collapse__chevron ${open ? 'hr-leave-collapse__chevron--open' : ''}`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path fillRule="evenodd" d="M7.21 5.23a.75.75 0 011.06.02L12.5 9.47a.75.75 0 010 1.06l-4.23 4.22a.75.75 0 01-1.06-1.06L10.94 10 7.19 6.29a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
        <span>{title}</span>
      </button>
      {open ? <div className="hr-leave-collapse__body">{children}</div> : null}
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

// ─── Tab 3 — Approval (links to central approval module) ───────────────────

const APPROVAL_WORKFLOWS_HREF =
  '/humansource/settings?path=' + encodeURIComponent('/humansource/settings/approval-workflows');

function readLeaveDocConfig(): DocumentApprovalConfig {
  const seed =
    DOCUMENT_TYPES_SEED.find((d) => d.docType === 'leave') ?? DOCUMENT_TYPES_SEED[0];
  try {
    const raw = window.localStorage.getItem(APPROVAL_DOC_CONFIGS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DocumentApprovalConfig[];
      if (Array.isArray(parsed)) {
        return parsed.find((d) => d.docType === 'leave') ?? seed;
      }
    }
  } catch {
    /* fall through to seed */
  }
  return seed;
}

function ApprovalForm({
  draft,
  onApprovalChange,
}: {
  draft: LeaveType;
  onApprovalChange: (patch: Partial<LeaveType['approval']>) => void;
}) {
  // Doc config is read once on mount — it lives in another module/localStorage.
  const [docConfig, setDocConfig] = useState<DocumentApprovalConfig | null>(null);
  useEffect(() => {
    setDocConfig(readLeaveDocConfig());
  }, []);

  const a = draft.approval;
  const overriding = !a.useDefaultTemplate;
  const stepValue = a.steps === undefined ? '' : String(a.steps);

  return (
    <div className="hr-leave-form">
      <GroupHeading>สายการอนุมัติของการลานี้</GroupHeading>

      <div className="hr-leave-approval-summary">
        <div className="hr-leave-approval-summary__row">
          <span className="hr-leave-approval-summary__label">เอกสารอ้างอิง</span>
          <span className="hr-leave-approval-summary__value">เอกสารลางาน</span>
        </div>
        <div className="hr-leave-approval-summary__row">
          <span className="hr-leave-approval-summary__label">ค่ามาตรฐาน</span>
          <span className="hr-leave-approval-summary__value">
            {docConfig ? describeApproval(docConfig) : 'กำลังโหลด…'}
          </span>
        </div>
        <a
          href={APPROVAL_WORKFLOWS_HREF}
          className="hr-leave-approval-summary__link"
        >
          ไปตั้งค่าลำดับการอนุมัติ →
        </a>
      </div>

      <div className="hr-leave-form__grid">
        <ToggleField
          label="ใช้ค่ามาตรฐานของเอกสารลางาน"
          checked={a.useDefaultTemplate}
          onChange={(checked) =>
            onApprovalChange({
              useDefaultTemplate: checked,
              steps: checked ? undefined : (docConfig?.steps ?? 2),
            })
          }
        />
      </div>

      {overriding ? (
        <>
          <GroupHeading>
            กำหนดเองเฉพาะการลานี้
            <span className="hr-leave-form__heading-hint"> — แทนค่ามาตรฐานด้านบน</span>
          </GroupHeading>
          <div className="hr-leave-form__grid">
            <Field label="จำนวนขั้นการอนุมัติ">
              <HrCustomSelect
                value={stepValue}
                options={STEP_OVERRIDE_OPTIONS}
                onChange={(v) => onApprovalChange({ steps: v === 'hr' ? 'hr' : Number(v) })}
                label="จำนวนขั้นการอนุมัติ"
              />
            </Field>
          </div>
        </>
      ) : null}
    </div>
  );
}

// ─── Tab 2 — Eligibility + Quota ──────────────────────────────────────────

function EligibilityForm({
  draft,
  onEligibilityChange,
  onQuotaChange,
}: {
  draft: LeaveType;
  onEligibilityChange: (patch: Partial<LeaveType['eligibility']>) => void;
  onQuotaChange: (patch: Partial<LeaveType['quota']>) => void;
}) {
  const q = draft.quota;
  const splitPerType = q.perEmployeeType !== undefined;

  // Read employee types from localStorage (falls back to seed)
  const [allEmpTypes, setAllEmpTypes] = useState<EmployeeType[]>(EMPLOYEE_TYPE_SEED);
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(EMPLOYEE_TYPES_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as EmployeeType[];
        if (Array.isArray(parsed) && parsed.length > 0) setAllEmpTypes(parsed);
      }
    } catch { /* keep seed */ }
  }, []);

  return (
    <div className="hr-leave-form">
      {/* ─── ใครได้สิทธิ์การลานี้ (ผังองค์กร) ─── */}
      <GroupHeading>
        ใครได้สิทธิ์การลานี้
        <span className="hr-leave-form__heading-hint"> — ไม่เลือก = ทุกคนในบริษัท</span>
      </GroupHeading>
      <OrgTreeSelect
        orgNodeIds={draft.eligibility.orgNodeIds}
        employeeIds={draft.eligibility.employeeIds}
        onChange={(orgNodeIds, employeeIds) => onEligibilityChange({ orgNodeIds, employeeIds })}
      />

      {/* ─── โควตาการลา ─── */}
      <GroupHeading>โควตาการลา</GroupHeading>
      <div className="hr-leave-form__grid">
        <Field label="โหมดโควตา">
          <HrCustomSelect
            value={q.mode}
            options={QUOTA_MODE_OPTIONS}
            onChange={(v) => onQuotaChange({ mode: v as LeaveQuotaMode })}
            label="โหมดโควตา"
          />
        </Field>
        {q.mode === 'fixed' ? (
          <Field label="จำนวนวันต่อปี" suffix="วัน">
            <input
              type="number"
              min={0}
              value={q.fixedDays ?? 0}
              onChange={(ev) => onQuotaChange({ fixedDays: numberOr(ev.target.value, 0) })}
              className="hr-leave-input hr-leave-input--num"
            />
          </Field>
        ) : null}
        {q.mode === 'unlimited' ? (
          <div className="hr-leave-quota-desc">
            ลาได้ไม่จำกัดวัน — ใช้สำหรับการลาที่ไม่กำหนดเพดาน
          </div>
        ) : null}
        {q.mode === 'medical' ? (
          <div className="hr-leave-quota-desc">
            จำนวนวันที่ได้รับขึ้นอยู่กับใบรับรองแพทย์ ไม่มีเพดานคงที่
          </div>
        ) : null}
      </div>
      {q.mode === 'tenure-tier' ? (
        <TenureTierTable
          tiers={q.tiers ?? []}
          onChange={(tiers) => onQuotaChange({ tiers })}
        />
      ) : null}

      {/* ─── ตัวเลือกเพิ่มเติม ─── */}
      <GroupHeading>ตัวเลือกเพิ่มเติม</GroupHeading>
      <div className="hr-leave-form__grid">
        <ToggleField
          label="โพรเรตปีแรก (เฉลี่ยตามวันที่เริ่มงาน)"
          checked={q.prorateFirstYear}
          onChange={(checked) => onQuotaChange({ prorateFirstYear: checked })}
        />
        <Field label="วันตัดรอบ">
          <HrCustomSelect
            value={q.cutoffBasis}
            options={CUTOFF_OPTIONS}
            onChange={(v) => onQuotaChange({ cutoffBasis: v as LeaveCutoffBasis })}
            label="วันตัดรอบ"
          />
        </Field>
        <ToggleField
          label="แยกโควตาตามประเภทพนักงาน"
          checked={splitPerType}
          onChange={(checked) => {
            onQuotaChange({ perEmployeeType: checked ? {} : undefined });
          }}
        />
      </div>
      {splitPerType ? (
        <PerEmployeeTypeQuota quota={q} onQuotaChange={onQuotaChange} allEmployeeTypes={allEmpTypes} />
      ) : null}
    </div>
  );
}

// ─── Tenure tier editable table ────────────────────────────────────────────

function TenureTierTable({
  tiers,
  onChange,
}: {
  tiers: TenureTier[];
  onChange: (tiers: TenureTier[]) => void;
}) {
  const updateTier = (index: number, patch: Partial<TenureTier>) => {
    onChange(tiers.map((tier, i) => (i === index ? { ...tier, ...patch } : tier)));
  };

  const removeTier = (index: number) => {
    onChange(tiers.filter((_, i) => i !== index));
  };

  const addTier = () => {
    if (tiers.length === 0) {
      onChange([{ minMonths: 0, maxMonths: 12, days: 0 }]);
      return;
    }
    const last = tiers[tiers.length - 1];
    const newMin = last.maxMonths ?? last.minMonths + 12;
    const updatedLast = last.maxMonths === null ? { ...last, maxMonths: newMin } : last;
    onChange([...tiers.slice(0, -1), updatedLast, { minMonths: newMin, maxMonths: null, days: 0 }]);
  };

  return (
    <div className="hr-leave-tier">
      <div className="hr-leave-tier__head">
        <span>อายุงานตั้งแต่ (เดือน)</span>
        <span>ถึง (เดือน)</span>
        <span>วันลา</span>
        <span />
      </div>
      {tiers.map((tier, index) => (
        <div key={index} className="hr-leave-tier__row">
          <input
            type="number"
            min={0}
            value={tier.minMonths}
            onChange={(ev) => updateTier(index, { minMonths: numberOr(ev.target.value, 0) })}
            className="hr-leave-input hr-leave-input--num"
          />
          {tier.maxMonths === null ? (
            <span className="hr-leave-tier__unlimited">ไม่จำกัด</span>
          ) : (
            <input
              type="number"
              min={0}
              value={tier.maxMonths}
              onChange={(ev) => updateTier(index, { maxMonths: numberOr(ev.target.value, 0) })}
              className="hr-leave-input hr-leave-input--num"
            />
          )}
          <input
            type="number"
            min={0}
            value={tier.days}
            onChange={(ev) => updateTier(index, { days: numberOr(ev.target.value, 0) })}
            className="hr-leave-input hr-leave-input--num"
          />
          <button
            type="button"
            className="hr-leave-tier__remove"
            onClick={() => removeTier(index)}
            aria-label="ลบแถวนี้"
          >
            <TrashIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      <button type="button" className="hr-leave-tier__add" onClick={addTier}>
        <PlusIcon className="h-3.5 w-3.5" />
        เพิ่มแถว
      </button>
    </div>
  );
}

// ─── Per employee type quota ───────────────────────────────────────────────

function PerEmployeeTypeQuota({
  quota,
  onQuotaChange,
  allEmployeeTypes,
}: {
  quota: LeaveType['quota'];
  onQuotaChange: (patch: Partial<LeaveType['quota']>) => void;
  allEmployeeTypes: EmployeeType[];
}) {
  const perType = quota.perEmployeeType ?? {};

  const getEtQuota = (etId: string): LeaveQuotaByEmployeeType =>
    perType[etId] ?? { mode: quota.mode, fixedDays: quota.fixedDays, tiers: quota.tiers };

  const updateEtQuota = (etId: string, patch: Partial<LeaveQuotaByEmployeeType>) => {
    onQuotaChange({
      perEmployeeType: { ...perType, [etId]: { ...getEtQuota(etId), ...patch } },
    });
  };

  return (
    <div className="hr-leave-per-et">
      {allEmployeeTypes.map((et) => {
        const etQ = getEtQuota(et.id);
        return (
          <div key={et.id} className="hr-leave-per-et__row">
            <span className="hr-leave-per-et__name">
              {et.nameTh}
              {!et.active && <span className="hr-leave-per-et__inactive"> (ปิดใช้งาน)</span>}
            </span>
            <div className="hr-leave-per-et__quota">
              <HrCustomSelect
                value={etQ.mode}
                options={QUOTA_MODE_OPTIONS}
                onChange={(v) => updateEtQuota(et.id, { mode: v as LeaveQuotaMode })}
                label={`โหมดโควตา ${et.nameTh}`}
              />
              {etQ.mode === 'fixed' ? (
                <div className="hr-leave-per-et__days">
                  <input
                    type="number"
                    min={0}
                    value={etQ.fixedDays ?? 0}
                    onChange={(ev) =>
                      updateEtQuota(et.id, { fixedDays: numberOr(ev.target.value, 0) })
                    }
                    className="hr-leave-input hr-leave-input--num"
                  />
                  <span className="hr-leave-field__suffix">วัน</span>
                </div>
              ) : etQ.mode === 'tenure-tier' ? (
                <TenureTierTable
                  tiers={etQ.tiers ?? []}
                  onChange={(tiers) => updateEtQuota(et.id, { tiers })}
                />
              ) : (
                <span className="hr-leave-per-et__desc">
                  {etQ.mode === 'unlimited' ? 'ไม่จำกัด' : 'ตามแพทย์กำหนด'}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Org tree select (company → department → employee) ─────────────────────
// Cascading multi-select over the org chart. Selecting a department selects
// everyone in it; expanding it lets you pick individuals instead. Picking every
// employee of a department auto-promotes to "whole department". Empty = ทุกคน.

type TriState = 'all' | 'some' | 'none';

function OrgTreeSelect({
  orgNodeIds,
  employeeIds: selectedEmps,
  onChange,
}: {
  orgNodeIds: string[];
  employeeIds: string[];
  onChange: (orgNodeIds: string[], employeeIds: string[]) => void;
}) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [companyOpen, setCompanyOpen] = useState(true);

  const leafIsWhole = (nodeId: string) => orgNodeIds.includes(nodeId);
  const leafEmpIds = (nodeId: string) =>
    (ORG_LEAVES.find((l) => l.nodeId === nodeId)?.employees ?? []).map((e) => e.id);
  const isEmpSelected = (nodeId: string, id: string) =>
    leafIsWhole(nodeId) || selectedEmps.includes(id);

  const leafState = (nodeId: string): TriState => {
    if (leafIsWhole(nodeId)) return 'all';
    const ids = leafEmpIds(nodeId);
    const picked = ids.filter((id) => selectedEmps.includes(id)).length;
    if (picked === 0) return 'none';
    return picked === ids.length ? 'all' : 'some';
  };

  const companyState: TriState = (() => {
    const states = ALL_LEAF_IDS.map(leafState);
    if (states.length && states.every((s) => s === 'all')) return 'all';
    if (states.every((s) => s === 'none')) return 'none';
    return 'some';
  })();

  const toggleLeaf = (nodeId: string) => {
    const ids = leafEmpIds(nodeId);
    const others = selectedEmps.filter((id) => !ids.includes(id));
    if (leafState(nodeId) === 'all') {
      onChange(orgNodeIds.filter((d) => d !== nodeId), others);
    } else {
      onChange(uniq([...orgNodeIds, nodeId]), others);
    }
  };

  const toggleEmp = (nodeId: string, id: string) => {
    const ids = leafEmpIds(nodeId);
    if (leafIsWhole(nodeId)) {
      onChange(
        orgNodeIds.filter((d) => d !== nodeId),
        uniq([...selectedEmps, ...ids.filter((x) => x !== id)]),
      );
      return;
    }
    if (selectedEmps.includes(id)) {
      onChange(orgNodeIds, selectedEmps.filter((x) => x !== id));
      return;
    }
    const nextEmps = uniq([...selectedEmps, id]);
    if (ids.every((x) => nextEmps.includes(x))) {
      onChange(uniq([...orgNodeIds, nodeId]), nextEmps.filter((x) => !ids.includes(x)));
    } else {
      onChange(orgNodeIds, nextEmps);
    }
  };

  const toggleCompany = () => {
    if (companyState === 'all') onChange([], []);
    else onChange([...ALL_LEAF_IDS], []);
  };

  const chips: { key: string; label: string; onRemove: () => void }[] = [];
  for (const nodeId of orgNodeIds) {
    const leaf = ORG_LEAVES.find((l) => l.nodeId === nodeId);
    if (leaf) chips.push({ key: `n:${nodeId}`, label: `${leaf.name} (ทั้งหน่วย)`, onRemove: () => toggleLeaf(nodeId) });
  }
  for (const leaf of ORG_LEAVES) {
    if (orgNodeIds.includes(leaf.nodeId)) continue;
    for (const emp of leaf.employees) {
      if (selectedEmps.includes(emp.id)) {
        chips.push({ key: `e:${emp.id}`, label: emp.name, onRemove: () => toggleEmp(leaf.nodeId, emp.id) });
      }
    }
  }

  return (
    <div className="hr-leave-tree">
      <div className="hr-leave-tree__summary">
        {chips.length === 0 ? (
          <span className="hr-leave-tree__summary-empty">ทุกคนในบริษัท (ไม่จำกัด)</span>
        ) : (
          chips.map((chip) => (
            <span key={chip.key} className="hr-leave-chip">
              {chip.label}
              <button
                type="button"
                className="hr-leave-chip__remove"
                onClick={chip.onRemove}
                aria-label={`เอาออก ${chip.label}`}
              >
                ×
              </button>
            </span>
          ))
        )}
      </div>

      <div className="hr-leave-tree__list" role="tree">
        <div className="hr-leave-tree__row hr-leave-tree__row--company">
          <button
            type="button"
            className={`hr-leave-tree__caret ${companyOpen ? 'hr-leave-tree__caret--open' : ''}`}
            onClick={() => setCompanyOpen((o) => !o)}
            aria-label={companyOpen ? 'ยุบ' : 'ขยาย'}
          >
            <CaretIcon />
          </button>
          <TriCheck state={companyState} onClick={toggleCompany} />
          <span className="hr-leave-tree__label hr-leave-tree__label--company">ทั้งบริษัท</span>
          <span className="hr-leave-tree__count">{ALL_LEAF_IDS.length} หน่วยงาน</span>
        </div>

        {companyOpen
          ? ORG_LEAVES.map((leaf) => {
              const open = expanded[leaf.nodeId] ?? false;
              return (
                <div key={leaf.nodeId} className="hr-leave-tree__group">
                  <div className="hr-leave-tree__row hr-leave-tree__row--dept">
                    <button
                      type="button"
                      className={`hr-leave-tree__caret ${open ? 'hr-leave-tree__caret--open' : ''}`}
                      onClick={() => setExpanded((m) => ({ ...m, [leaf.nodeId]: !open }))}
                      aria-label={open ? 'ยุบ' : 'ขยาย'}
                    >
                      <CaretIcon />
                    </button>
                    <TriCheck state={leafState(leaf.nodeId)} onClick={() => toggleLeaf(leaf.nodeId)} />
                    <span className="hr-leave-tree__label">{leaf.name}</span>
                    <span className="hr-leave-tree__count">{leaf.employees.length} คน</span>
                  </div>
                  {open
                    ? leaf.employees.map((emp) => (
                        <div key={emp.id} className="hr-leave-tree__row hr-leave-tree__row--emp">
                          <TriCheck
                            state={isEmpSelected(leaf.nodeId, emp.id) ? 'all' : 'none'}
                            onClick={() => toggleEmp(leaf.nodeId, emp.id)}
                          />
                          <span className="hr-leave-tree__label">{emp.name}</span>
                          <span className="hr-leave-tree__meta">{emp.position} · {emp.code}</span>
                        </div>
                      ))
                    : null}
                </div>
              );
            })
          : null}
      </div>
    </div>
  );
}

function TriCheck({ state, onClick }: { state: TriState; onClick: () => void }) {
  return (
    <button
      type="button"
      className={`hr-leave-treecheck hr-leave-treecheck--${state}`}
      onClick={onClick}
      role="checkbox"
      aria-checked={state === 'all' ? true : state === 'some' ? 'mixed' : false}
    >
      {state === 'all' ? (
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path d="M13 4.5l-6 6L3 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : state === 'some' ? (
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path d="M4 8h8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ) : null}
    </button>
  );
}

function CaretIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M7.21 5.23a.75.75 0 011.06.02L12.5 9.47a.75.75 0 010 1.06l-4.23 4.22a.75.75 0 01-1.06-1.06L10.94 10 7.19 6.29a.75.75 0 01.02-1.06z" clipRule="evenodd" />
    </svg>
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

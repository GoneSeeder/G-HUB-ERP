'use client';

import { type FormEvent, useState } from 'react';
import { EditIcon, PlusIcon, TrashIcon, XIcon } from '@/components/ui/icons';
import { HrCustomSelect } from './hr-ui';
import type { OrgNode } from '@/data/humansource/org-structure';
import type { AuthorizedSigner, Branch, Company, WorkConditions } from '@/data/humansource/companies';

// ─── Local form primitives (same pattern as hr-leave-settings) ────────────────

function GroupHeading({ children }: { children: React.ReactNode }) {
  return <h4 className="hr-leave-form__heading">{children}</h4>;
}

function Field({
  label,
  required,
  suffix,
  full,
  children,
}: {
  label: string;
  required?: boolean;
  suffix?: string;
  full?: boolean;
  children?: React.ReactNode;
}) {
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
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="hr-leave-toggle-field">
      <span className="hr-leave-toggle-field__label">{label}</span>
      <span className="hr-leave-toggle-field__control">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span className="hr-leave-switch"><span className="hr-leave-switch__thumb" /></span>
      </span>
    </label>
  );
}

// ─── Weekday toggle row ────────────────────────────────────────────────────────

const DAY_LABELS = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];

function WeekdayPicker({
  value,
  onChange,
}: {
  value: number[];
  onChange: (days: number[]) => void;
}) {
  const toggle = (day: number) => {
    const next = value.includes(day) ? value.filter((d) => d !== day) : [...value, day];
    onChange(next.sort((a, b) => a - b));
  };
  return (
    <div className="hr-company-weekdays">
      {DAY_LABELS.map((label, idx) => (
        <button
          key={idx}
          type="button"
          className={`hr-company-weekday-btn ${value.includes(idx) ? 'hr-company-weekday-btn--on' : ''}`}
          onClick={() => toggle(idx)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

// ─── Fullscreen modal shell ────────────────────────────────────────────────────

function ModalShell({
  title,
  subtitle,
  onClose,
  onSubmit,
  footNote,
  tabs,
  children,
  accent,
}: {
  title: string;
  subtitle: string;
  onClose: () => void;
  onSubmit: (e: FormEvent) => void;
  footNote?: string;
  tabs?: React.ReactNode;
  children: React.ReactNode;
  accent: string;
}) {
  return (
    <div className="hr-org-modal" role="dialog" aria-modal="true" aria-label={title}>
      <form className="hr-org-modal__form" onSubmit={onSubmit}>
        <header className="hr-org-modal__head">
          <div className="hr-org-modal__head-left">
            <button type="button" className="hr-org-modal__back" onClick={onClose} aria-label="กลับ">
              ←
            </button>
            <div className="hr-org-modal__titles">
              <h3 className="hr-org-modal__title">{title}</h3>
              <p className="hr-org-modal__subtitle">{subtitle}</p>
            </div>
          </div>
        </header>

        {tabs ? <div className="hr-org-modal__tabbar">{tabs}</div> : null}

        <div className="hr-org-modal__scroll">
          <div className="hr-org-modal__inner">{children}</div>
        </div>

        <footer className="hr-org-modal__foot">
          <p className="hr-org-modal__footnote">{footNote ?? ''}</p>
          <div className="hr-org-modal__foot-actions">
            <button type="button" className="hr-org-modal__cancel" onClick={onClose}>
              ยกเลิก
            </button>
            <button type="submit" className="hr-org-modal__save" style={{ backgroundColor: accent }}>
              บันทึก
            </button>
          </div>
        </footer>
      </form>
    </div>
  );
}

// ─── Signers ───────────────────────────────────────────────────────────────────

function SignerRow({
  signer,
  onEdit,
  onDelete,
}: {
  signer: AuthorizedSigner;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="hr-company-signer-row">
      <div className="hr-company-signer-row__info">
        <span className="hr-company-signer-row__name">{signer.name}</span>
        <span className="hr-company-signer-row__meta">{signer.positionTh} · {signer.scope}</span>
      </div>
      <div className="hr-company-signer-row__actions">
        <button type="button" className="hr-leave-board__actions" aria-label="แก้ไข" onClick={onEdit}>
          <EditIcon className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          className="hr-leave-board__action-danger"
          aria-label="ลบ"
          onClick={onDelete}
        >
          <TrashIcon className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function SignerModal({
  initial,
  onCancel,
  onSave,
  accent,
}: {
  initial: AuthorizedSigner;
  onCancel: () => void;
  onSave: (s: AuthorizedSigner) => void;
  accent: string;
}) {
  const [draft, setDraft] = useState<AuthorizedSigner>(initial);
  const [error, setError] = useState('');
  const upd = (patch: Partial<AuthorizedSigner>) => setDraft((d) => ({ ...d, ...patch }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!draft.name.trim()) { setError('กรุณาระบุชื่อ'); return; }
    onSave(draft);
  };

  return (
    <div className="hr-leave-confirm-overlay" role="presentation" onClick={onCancel}>
      <section
        className="hr-company-signer-modal"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="hr-leave-confirm__head">
          <h4>{initial.id ? 'แก้ไขผู้มีอำนาจลงนาม' : 'เพิ่มผู้มีอำนาจลงนาม'}</h4>
          <button type="button" onClick={onCancel} aria-label="ปิด"><XIcon className="h-4 w-4" /></button>
        </header>
        <form onSubmit={submit} className="hr-leave-confirm__body">
          {error ? <p className="hr-leave-modal-error">{error}</p> : null}
          <div className="hr-leave-form__grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <Field label="ชื่อ" required full>
              <input className="hr-leave-input" value={draft.name} onChange={(e) => upd({ name: e.target.value })} placeholder="ชื่อ-นามสกุล" />
            </Field>
            <Field label="ตำแหน่ง" full>
              <input className="hr-leave-input" value={draft.positionTh} onChange={(e) => upd({ positionTh: e.target.value })} placeholder="กรรมการผู้จัดการ" />
            </Field>
            <Field label="ขอบเขตการลงนาม" full>
              <input className="hr-leave-input" value={draft.scope} onChange={(e) => upd({ scope: e.target.value })} placeholder="เอกสารทั้งหมด" />
            </Field>
          </div>
          <div className="mt-4">
            <ToggleField label="เปิดใช้งาน" checked={draft.active} onChange={(v) => upd({ active: v })} />
          </div>
          <footer className="hr-leave-confirm__foot" style={{ marginTop: '1rem' }}>
            <button type="button" className="hr-leave-modal-foot__cancel" onClick={onCancel}>ยกเลิก</button>
            <button type="submit" className="hr-leave-modal-foot__save" style={{ backgroundColor: accent }}>บันทึก</button>
          </footer>
        </form>
      </section>
    </div>
  );
}

// ─── Company detail (fullscreen modal, 3 tabs) ────────────────────────────────

type CompanyTab = 'legal' | 'conditions' | 'signers';

function CompanyDetailModal({
  company,
  onSave,
  onClose,
  accent,
}: {
  company: Company;
  onSave: (updated: Company) => void;
  onClose: () => void;
  accent: string;
}) {
  const [tab, setTab] = useState<CompanyTab>('legal');
  const [draft, setDraft] = useState<Company>(company);
  const [signerModal, setSignerModal] = useState<AuthorizedSigner | null>(null);

  const upd = (patch: Partial<Company>) => setDraft((d) => ({ ...d, ...patch }));
  const updCond = (patch: Partial<WorkConditions>) =>
    setDraft((d) => ({ ...d, workConditions: { ...d.workConditions, ...patch } }));

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    onSave(draft);
    onClose();
  };

  const openAddSigner = () =>
    setSignerModal({ id: '', name: '', positionTh: '', scope: 'เอกสารทั้งหมด', active: true });
  const openEditSigner = (s: AuthorizedSigner) => setSignerModal(s);

  const saveSigner = (s: AuthorizedSigner) => {
    setDraft((d) => {
      const existing = d.signers.find((x) => x.id === s.id);
      const id = s.id || `sg-${Date.now()}`;
      const updated = existing
        ? d.signers.map((x) => (x.id === s.id ? { ...s, id } : x))
        : [...d.signers, { ...s, id }];
      return { ...d, signers: updated };
    });
    setSignerModal(null);
  };

  const deleteSigner = (id: string) =>
    setDraft((d) => ({ ...d, signers: d.signers.filter((s) => s.id !== id) }));

  const TABS: { key: CompanyTab; label: string }[] = [
    { key: 'legal',      label: 'นิติบุคคล/นายจ้าง' },
    { key: 'conditions', label: 'เงื่อนไขการทำงาน' },
    { key: 'signers',    label: 'ผู้มีอำนาจลงนาม' },
  ];

  const tabs = TABS.map((t) => (
    <button
      key={t.key}
      type="button"
      className={`hr-company-detail__tab ${tab === t.key ? 'hr-company-detail__tab--active' : ''}`}
      onClick={() => setTab(t.key)}
    >
      {t.label}
    </button>
  ));

  return (
    <>
      <ModalShell
        title={draft.tradeName || 'บริษัท'}
        subtitle={draft.legalNameTh || 'ข้อมูลบริษัท'}
        onClose={onClose}
        onSubmit={handleSave}
        tabs={tabs}
        accent={accent}
      >
        {/* Tab 1: Legal */}
        {tab === 'legal' ? (
          <div>
            <GroupHeading>ข้อมูลนิติบุคคล</GroupHeading>
            <div className="hr-leave-form__grid">
              <Field label="ชื่อบริษัท (นิติบุคคล)" required full>
                <input
                  className="hr-leave-input"
                  value={draft.legalNameTh}
                  onChange={(e) => upd({ legalNameTh: e.target.value })}
                  placeholder="บริษัท ... จำกัด"
                />
              </Field>
              <Field label="ชื่อการค้า / Trade Name" required>
                <input
                  className="hr-leave-input"
                  value={draft.tradeName}
                  onChange={(e) => upd({ tradeName: e.target.value })}
                  placeholder="G-HUB Enterprise"
                />
              </Field>
              <Field label="เลขผู้เสียภาษี (13 หลัก)">
                <input
                  className="hr-leave-input hr-leave-input--mono"
                  value={draft.taxId}
                  onChange={(e) => upd({ taxId: e.target.value })}
                  placeholder="0105560000000"
                  maxLength={13}
                />
              </Field>
              <Field label="เลขประกันสังคม">
                <input
                  className="hr-leave-input hr-leave-input--mono"
                  value={draft.socialSecurityCode}
                  onChange={(e) => upd({ socialSecurityCode: e.target.value })}
                  placeholder="SSO-0001"
                />
              </Field>
              <Field label="ที่อยู่" full>
                <textarea
                  className="hr-leave-input hr-company-detail__address"
                  value={draft.address ?? ''}
                  onChange={(e) => upd({ address: e.target.value })}
                  placeholder="ที่อยู่บริษัท"
                  rows={3}
                />
              </Field>
            </div>
            <div className="mt-5">
              <ToggleField label="เปิดใช้งานบริษัทนี้" checked={draft.active} onChange={(v) => upd({ active: v })} />
            </div>
          </div>
        ) : null}

        {/* Tab 2: Work conditions */}
        {tab === 'conditions' ? (
          <div>
            <GroupHeading>เวลาและการทำงาน</GroupHeading>
            <div className="hr-leave-form__grid">
              <Field label="ชม. ทำงาน/วัน" suffix="ชม.">
                <input className="hr-leave-input hr-leave-input--num" type="number" min={1} max={24} value={draft.workConditions.workHoursPerDay} onChange={(e) => updCond({ workHoursPerDay: Number(e.target.value) || 8 })} />
              </Field>
              <Field label="วันตัดรอบประจำปี" suffix="ของทุกปี">
                <input className="hr-leave-input hr-leave-input--num" type="number" min={1} max={31} value={draft.workConditions.annualCutoffDate} onChange={(e) => updCond({ annualCutoffDate: Number(e.target.value) || 31 })} />
              </Field>
              <Field label="เกณฑ์มาสาย" suffix="นาที">
                <input className="hr-leave-input hr-leave-input--num" type="number" min={0} value={draft.workConditions.lateThresholdMin} onChange={(e) => updCond({ lateThresholdMin: Number(e.target.value) || 0 })} />
              </Field>
              <Field label="เกณฑ์ขาดงาน" suffix="นาที">
                <input className="hr-leave-input hr-leave-input--num" type="number" min={0} value={draft.workConditions.absentThresholdMin} onChange={(e) => updCond({ absentThresholdMin: Number(e.target.value) || 0 })} />
              </Field>
            </div>

            <GroupHeading>เงินเดือนและ HR</GroupHeading>
            <div className="hr-leave-form__grid">
              <Field label="วันจ่ายเงินเดือน" suffix="ของทุกเดือน">
                <input className="hr-leave-input hr-leave-input--num" type="number" min={1} max={31} value={draft.workConditions.payrollDay} onChange={(e) => updCond({ payrollDay: Number(e.target.value) || 28 })} />
              </Field>
              <Field label="อายุเกษียณ" suffix="ปี">
                <input className="hr-leave-input hr-leave-input--num" type="number" min={40} max={70} value={draft.workConditions.retirementAge} onChange={(e) => updCond({ retirementAge: Number(e.target.value) || 60 })} />
              </Field>
              <Field label="ทดลองงาน" suffix="วัน">
                <input className="hr-leave-input hr-leave-input--num" type="number" min={0} value={draft.workConditions.probationDays} onChange={(e) => updCond({ probationDays: Number(e.target.value) || 90 })} />
              </Field>
              <Field label="สกุลเงิน">
                <HrCustomSelect
                  value={draft.workConditions.currency}
                  options={['THB', 'USD', 'SGD'].map((v) => ({ value: v, label: v }))}
                  onChange={(v) => updCond({ currency: v })}
                />
              </Field>
            </div>

            <GroupHeading>วันหยุดรายสัปดาห์</GroupHeading>
            <WeekdayPicker value={draft.workConditions.weeklyHolidays} onChange={(days) => updCond({ weeklyHolidays: days })} />

            <div className="hr-company-detail__cond-note">
              การตั้งค่ากะ ปฏิทินวันหยุด และการลงเวลา จัดการได้ที่เมนู
              <strong> ตั้งค่าเวลาการทำงาน</strong>
            </div>
          </div>
        ) : null}

        {/* Tab 3: Signers */}
        {tab === 'signers' ? (
          <div>
            <div className="hr-company-signers-head">
              <GroupHeading>ผู้มีอำนาจลงนาม</GroupHeading>
              <button
                type="button"
                className="hr-leave-board__add"
                style={{ backgroundColor: accent }}
                onClick={openAddSigner}
              >
                <PlusIcon className="h-3.5 w-3.5" />
                เพิ่มผู้ลงนาม
              </button>
            </div>
            <div className="hr-company-signers-list">
              {draft.signers.length === 0 ? (
                <p className="hr-company-signers-empty">ยังไม่มีผู้มีอำนาจลงนาม</p>
              ) : (
                draft.signers.map((s) => (
                  <SignerRow
                    key={s.id}
                    signer={s}
                    onEdit={() => openEditSigner(s)}
                    onDelete={() => deleteSigner(s.id)}
                  />
                ))
              )}
            </div>
          </div>
        ) : null}
      </ModalShell>

      {signerModal ? (
        <SignerModal
          initial={signerModal}
          onCancel={() => setSignerModal(null)}
          onSave={saveSigner}
          accent={accent}
        />
      ) : null}
    </>
  );
}

// ─── Branch detail (fullscreen modal) ──────────────────────────────────────────

function BranchDetailModal({
  node,
  branch,
  onSave,
  onClose,
  accent,
}: {
  node: OrgNode;
  branch: Branch | null;
  onSave: (b: Branch) => void;
  onClose: () => void;
  accent: string;
}) {
  const [draft, setDraft] = useState<Branch>(
    branch ?? { id: '', code: '', nameTh: node.name, isHeadOffice: false, active: true },
  );

  const upd = (patch: Partial<Branch>) => setDraft((d) => ({ ...d, ...patch }));

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    const id = draft.id || `br-${Date.now()}`;
    onSave({ ...draft, id, nameTh: draft.nameTh || node.name });
    onClose();
  };

  return (
    <ModalShell
      title={draft.nameTh || node.name}
      subtitle="ข้อมูลสาขา"
      onClose={onClose}
      onSubmit={handleSave}
      accent={accent}
    >
      <GroupHeading>ข้อมูลสาขา</GroupHeading>
      <div className="hr-leave-form__grid">
        <Field label="ชื่อสาขา (ไทย)" required>
          <input className="hr-leave-input" value={draft.nameTh} onChange={(e) => upd({ nameTh: e.target.value })} placeholder="สำนักงานใหญ่" />
        </Field>
        <Field label="ชื่อสาขา (EN)">
          <input className="hr-leave-input" value={draft.nameEn ?? ''} onChange={(e) => upd({ nameEn: e.target.value })} placeholder="Head Office" />
        </Field>
        <Field label="รหัสสาขา">
          <input className="hr-leave-input hr-leave-input--mono" value={draft.code} onChange={(e) => upd({ code: e.target.value })} placeholder="BO0001" />
        </Field>
        <Field label="จังหวัด">
          <input className="hr-leave-input" value={draft.province ?? ''} onChange={(e) => upd({ province: e.target.value })} placeholder="กรุงเทพฯ" />
        </Field>
      </div>
      <div className="mt-5 flex flex-col gap-3">
        <ToggleField label="สำนักงานใหญ่" checked={draft.isHeadOffice} onChange={(v) => upd({ isHeadOffice: v })} />
        <ToggleField label="เปิดใช้งานสาขานี้" checked={draft.active} onChange={(v) => upd({ active: v })} />
      </div>
    </ModalShell>
  );
}

// ─── Dispatcher ────────────────────────────────────────────────────────────────

export function OrgNodeDetailModal({
  selectedNode,
  branchOwnerCompanyId,
  companies,
  onCompanySave,
  onBranchSave,
  onClose,
  accent,
}: {
  selectedNode: OrgNode | null;
  branchOwnerCompanyId: string | null;
  companies: Company[];
  onCompanySave: (updated: Company) => void;
  onBranchSave: (companyId: string, branch: Branch) => void;
  onClose: () => void;
  accent: string;
}) {
  if (!selectedNode) return null;

  if (selectedNode.type === 'company') {
    const company = companies.find((c) => c.orgNodeId === selectedNode.id);
    if (!company) return null;
    return (
      <CompanyDetailModal
        key={company.id}
        company={company}
        onSave={onCompanySave}
        onClose={onClose}
        accent={accent}
      />
    );
  }

  if (selectedNode.type === 'branch') {
    const owningCompany = companies.find((c) => c.id === branchOwnerCompanyId);
    if (!owningCompany) return null;
    const branch = owningCompany.branches.find((b) => b.nameTh === selectedNode.name) ?? null;
    return (
      <BranchDetailModal
        key={selectedNode.id}
        node={selectedNode}
        branch={branch}
        onSave={(b) => onBranchSave(owningCompany.id, b)}
        onClose={onClose}
        accent={accent}
      />
    );
  }

  return null;
}

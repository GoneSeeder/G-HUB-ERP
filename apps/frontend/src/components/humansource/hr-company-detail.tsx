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

function NumField({
  label,
  suffix,
  value,
  fallback,
  min,
  max,
  onChange,
}: {
  label: string;
  suffix?: string;
  value: number | undefined;
  fallback: number;
  min?: number;
  max?: number;
  onChange: (n: number) => void;
}) {
  return (
    <Field label={label} suffix={suffix}>
      <input
        className="hr-leave-input hr-leave-input--num"
        type="number"
        min={min}
        max={max}
        value={value ?? fallback}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </Field>
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

// ─── Work-conditions sub-sections (left sub-nav inside the conditions tab) ──────

type CondSection = 'hours' | 'score' | 'shift' | 'probation' | 'retire' | 'exit';

const COND_SECTIONS: { key: CondSection; label: string; desc: string }[] = [
  { key: 'hours',     label: 'ชั่วโมงทำงานและสถานะ', desc: 'ชั่วโมงต่อวัน วันทำงาน และเกณฑ์สาย/ขาด' },
  { key: 'score',     label: 'คะแนนการเข้างาน',     desc: 'เกณฑ์คำนวณคะแนนการเข้างานของพนักงาน' },
  { key: 'shift',     label: 'กะทำงาน',             desc: 'การเปลี่ยนกะและค่ากะพิเศษ' },
  { key: 'probation', label: 'การทดลองงาน',         desc: 'ระยะเวลาและการประเมินทดลองงาน' },
  { key: 'retire',    label: 'การเกษียณอายุ',        desc: 'อายุเกษียณและนโยบายการเกษียณ' },
  { key: 'exit',      label: 'การพ้นสภาพ',          desc: 'การแจ้งลาออกและการคืนทรัพย์สิน' },
];

function CondIcon({ section }: { section: CondSection }) {
  const common = { viewBox: '0 0 20 20', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true };
  switch (section) {
    case 'hours':
      return <svg {...common}><rect x="3" y="5.5" width="14" height="11" rx="1.5" /><path d="M3 8.5h14M7 3.5v3M13 3.5v3" /></svg>;
    case 'score':
      return <svg {...common}><circle cx="10" cy="10" r="6.5" /><path d="M10 6.5v3.5l2.3 1.4" /></svg>;
    case 'shift':
      return <svg {...common}><circle cx="10" cy="10" r="6.5" /><path d="M10 5v5l3 1.6" /></svg>;
    case 'probation':
      return <svg {...common}><circle cx="10" cy="7" r="2.6" /><path d="M4.5 16c0-2.8 2.4-4.6 5.5-4.6s5.5 1.8 5.5 4.6" /></svg>;
    case 'retire':
      return <svg {...common}><circle cx="10" cy="6.5" r="2.4" /><path d="M6 16c0-3 1.8-5 4-5s4 2 4 5M10 11v5" /></svg>;
    case 'exit':
      return <svg {...common}><path d="M12 4.5H6.5A1.5 1.5 0 005 6v8a1.5 1.5 0 001.5 1.5H12M10 10h6m0 0l-2.2-2.2M16 10l-2.2 2.2" /></svg>;
  }
}

// ─── Company detail (fullscreen modal, 4 tabs) ────────────────────────────────

type CompanyTab = 'legal' | 'branches' | 'conditions' | 'signers';

function CompanyDetailModal({
  company,
  onSave,
  onClose,
  accent,
  initialTab = 'legal',
  focusBranchId = null,
}: {
  company: Company;
  onSave: (updated: Company) => void;
  onClose: () => void;
  accent: string;
  initialTab?: CompanyTab;
  focusBranchId?: string | null;
}) {
  const [tab, setTab] = useState<CompanyTab>(initialTab);
  const [condSection, setCondSection] = useState<CondSection>('hours');
  const [draft, setDraft] = useState<Company>(company);
  const [signerModal, setSignerModal] = useState<AuthorizedSigner | null>(null);
  // Deep-link: when opened from the org tree on a specific branch, open its editor immediately.
  const [branchModal, setBranchModal] = useState<Branch | null>(
    () => (focusBranchId ? company.branches.find((b) => b.id === focusBranchId) ?? null : null),
  );

  const upd = (patch: Partial<Company>) => setDraft((d) => ({ ...d, ...patch }));
  const updCond = (patch: Partial<WorkConditions>) =>
    setDraft((d) => ({ ...d, workConditions: { ...d.workConditions, ...patch } }));
  const wc = draft.workConditions;

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

  const openAddBranch = () =>
    setBranchModal({ id: '', code: '', nameTh: '', isHeadOffice: false, submitSocialSecurity: true, branchSeq: '', active: true });
  const openEditBranch = (b: Branch) => setBranchModal(b);

  const saveBranch = (b: Branch) => {
    setDraft((d) => {
      const id = b.id || `br-${Date.now()}`;
      const exists = d.branches.some((x) => x.id === b.id);
      const branches = exists
        ? d.branches.map((x) => (x.id === b.id ? { ...b, id } : x))
        : [...d.branches, { ...b, id }];
      return { ...d, branches };
    });
    setBranchModal(null);
  };

  const deleteBranch = (id: string) =>
    setDraft((d) => ({ ...d, branches: d.branches.filter((b) => b.id !== id) }));

  const TABS: { key: CompanyTab; label: string }[] = [
    { key: 'legal',      label: 'นิติบุคคล/นายจ้าง' },
    { key: 'branches',   label: 'ข้อมูลสาขา' },
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

        {/* Tab 2: Branches */}
        {tab === 'branches' ? (
          <div>
            <div className="hr-company-signers-head">
              <GroupHeading>สาขาของนิติบุคคล</GroupHeading>
              <button
                type="button"
                className="hr-leave-board__add"
                style={{ backgroundColor: accent }}
                onClick={openAddBranch}
              >
                <PlusIcon className="h-3.5 w-3.5" />
                เพิ่มสาขา
              </button>
            </div>
            {draft.branches.length === 0 ? (
              <p className="hr-company-signers-empty">ยังไม่มีสาขา</p>
            ) : (
              <div className="hr-company-branch-table-wrap">
                <table className="hr-company-branch-table">
                  <thead>
                    <tr>
                      <th>รหัสสาขา</th>
                      <th>ชื่อสาขา</th>
                      <th>จังหวัด</th>
                      <th className="hr-company-branch-table__center">นำส่งประกันสังคม</th>
                      <th className="hr-company-branch-table__center">ลำดับที่สาขา</th>
                      <th className="hr-company-branch-table__center">สถานะ</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {draft.branches.map((b) => (
                      <tr key={b.id}>
                        <td className="hr-company-branch-table__mono">{b.code || '—'}</td>
                        <td>
                          <span className="hr-company-branch-table__name">{b.nameTh}</span>
                          {b.isHeadOffice ? <span className="hr-company-branch-table__hq">สำนักงานใหญ่</span> : null}
                        </td>
                        <td>{b.province || '—'}</td>
                        <td className="hr-company-branch-table__center">
                          {b.submitSocialSecurity ? <span className="hr-company-branch-table__check">✓</span> : '—'}
                        </td>
                        <td className="hr-company-branch-table__center hr-company-branch-table__mono">{b.branchSeq || '—'}</td>
                        <td className="hr-company-branch-table__center">
                          <span className={`hr-company-branch-status ${b.active ? 'hr-company-branch-status--on' : 'hr-company-branch-status--off'}`}>
                            {b.active ? 'ใช้งาน' : 'ปิด'}
                          </span>
                        </td>
                        <td className="hr-company-branch-table__center">
                          <div className="hr-company-signer-row__actions">
                            <button type="button" className="hr-leave-board__actions" aria-label="แก้ไข" onClick={() => openEditBranch(b)}>
                              <EditIcon className="h-3.5 w-3.5" />
                            </button>
                            <button type="button" className="hr-leave-board__action-danger" aria-label="ลบ" onClick={() => deleteBranch(b.id)}>
                              <TrashIcon className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="hr-company-detail__cond-note">
              โครงสร้างฝ่าย/แผนกใต้สาขา จัดการได้ที่หน้า
              <strong> ผังองค์กร</strong>
            </div>
          </div>
        ) : null}

        {/* Tab 3: Work conditions — left sub-nav + flat field panel */}
        {tab === 'conditions' ? (
          <div className="hr-cond">
            <nav className="hr-cond__nav" aria-label="หมวดเงื่อนไขการทำงาน">
              {COND_SECTIONS.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  className={`hr-cond__nav-item ${condSection === s.key ? 'hr-cond__nav-item--active' : ''}`}
                  onClick={() => setCondSection(s.key)}
                >
                  <span className="hr-cond__nav-icon"><CondIcon section={s.key} /></span>
                  <span className="hr-cond__nav-text">
                    <span className="hr-cond__nav-label">{s.label}</span>
                    <span className="hr-cond__nav-desc">{s.desc}</span>
                  </span>
                </button>
              ))}
            </nav>

            <div className="hr-cond__panel">
              {COND_SECTIONS.filter((s) => s.key === condSection).map((s) => (
                <header key={s.key} className="hr-cond__panel-head">
                  <span className="hr-cond__panel-icon"><CondIcon section={s.key} /></span>
                  <div>
                    <h4 className="hr-cond__panel-title">{s.label}</h4>
                    <p className="hr-cond__panel-desc">{s.desc}</p>
                  </div>
                </header>
              ))}

              {/* 1) ชั่วโมงทำงานและสถานะ */}
              {condSection === 'hours' ? (
                <>
                  <div className="hr-leave-form__grid">
                    <NumField label="ชั่วโมงทำงาน/วัน" suffix="ชม." min={1} max={24} value={wc.workHoursPerDay} fallback={8} onChange={(n) => updCond({ workHoursPerDay: n })} />
                    <NumField label="วันทำงาน/สัปดาห์" suffix="วัน" min={1} max={7} value={wc.workDaysPerWeek} fallback={5} onChange={(n) => updCond({ workDaysPerWeek: n })} />
                    <NumField label="เกณฑ์มาสาย" suffix="นาที" min={0} value={wc.lateThresholdMin} fallback={15} onChange={(n) => updCond({ lateThresholdMin: n })} />
                    <NumField label="เกณฑ์ขาดงาน" suffix="นาที" min={0} value={wc.absentThresholdMin} fallback={240} onChange={(n) => updCond({ absentThresholdMin: n })} />
                  </div>
                  <div className="hr-cond__field-block">
                    <span className="hr-leave-field__label">วันหยุดประจำสัปดาห์</span>
                    <WeekdayPicker value={wc.weeklyHolidays} onChange={(days) => updCond({ weeklyHolidays: days })} />
                  </div>
                </>
              ) : null}

              {/* 2) คะแนนการเข้างาน */}
              {condSection === 'score' ? (
                <>
                  <div className="hr-cond__toggle-block">
                    <ToggleField label="เปิดใช้คะแนนการเข้างาน" checked={wc.attendanceScoringEnabled ?? false} onChange={(v) => updCond({ attendanceScoringEnabled: v })} />
                  </div>
                  <div className="hr-leave-form__grid">
                    <NumField label="คะแนนเริ่มต้น" suffix="คะแนน" min={0} value={wc.attendanceBaseScore} fallback={100} onChange={(n) => updCond({ attendanceBaseScore: n })} />
                    <NumField label="หักเมื่อมาสาย" suffix="/ครั้ง" min={0} value={wc.attendanceDeductLate} fallback={1} onChange={(n) => updCond({ attendanceDeductLate: n })} />
                    <NumField label="หักเมื่อขาดงาน" suffix="/ครั้ง" min={0} value={wc.attendanceDeductAbsent} fallback={5} onChange={(n) => updCond({ attendanceDeductAbsent: n })} />
                    <NumField label="หักเมื่อลา" suffix="/ครั้ง" min={0} value={wc.attendanceDeductLeave} fallback={1} onChange={(n) => updCond({ attendanceDeductLeave: n })} />
                  </div>
                </>
              ) : null}

              {/* 3) กะทำงาน */}
              {condSection === 'shift' ? (
                <>
                  <div className="hr-leave-form__grid">
                    <NumField label="อัตราค่ากะกลางคืน" suffix="บาท/กะ" min={0} value={wc.nightShiftRate} fallback={0} onChange={(n) => updCond({ nightShiftRate: n })} />
                  </div>
                  <div className="hr-cond__toggle-block">
                    <ToggleField label="อนุญาตให้เปลี่ยนกะ" checked={wc.allowShiftChange ?? false} onChange={(v) => updCond({ allowShiftChange: v })} />
                    <ToggleField label="จ่ายค่ากะพิเศษ" checked={wc.payShiftAllowance ?? false} onChange={(v) => updCond({ payShiftAllowance: v })} />
                  </div>
                  <div className="hr-company-detail__cond-note">
                    ตั้งค่ากะแบบละเอียด (เวลาเข้า-ออก รอบตัดเวลา) จัดการได้ที่เมนู
                    <strong> ตั้งค่าเวลาการทำงาน</strong>
                  </div>
                </>
              ) : null}

              {/* 4) การทดลองงาน */}
              {condSection === 'probation' ? (
                <>
                  <div className="hr-leave-form__grid">
                    <NumField label="ระยะเวลาทดลองงาน" suffix="วัน" min={0} value={wc.probationDays} fallback={90} onChange={(n) => updCond({ probationDays: n })} />
                    <NumField label="แจ้งเตือนก่อนครบกำหนด" suffix="วัน" min={0} value={wc.probationAlertDays} fallback={7} onChange={(n) => updCond({ probationAlertDays: n })} />
                  </div>
                  <div className="hr-cond__toggle-block">
                    <ToggleField label="ต้องประเมินผลก่อนผ่านทดลองงาน" checked={wc.probationRequireReview ?? false} onChange={(v) => updCond({ probationRequireReview: v })} />
                  </div>
                </>
              ) : null}

              {/* 5) การเกษียณอายุ */}
              {condSection === 'retire' ? (
                <div className="hr-leave-form__grid">
                  <NumField label="อายุเกษียณ" suffix="ปี" min={40} max={70} value={wc.retirementAge} fallback={60} onChange={(n) => updCond({ retirementAge: n })} />
                  <Field label="นโยบายการเกษียณ">
                    <HrCustomSelect
                      value={wc.retirementPolicy ?? 'birthMonthEnd'}
                      options={[
                        { value: 'birthMonthEnd', label: 'สิ้นเดือนที่ครบอายุ' },
                        { value: 'fiscalYearEnd', label: 'สิ้นปีบัญชี' },
                        { value: 'exactDate',     label: 'วันครบอายุพอดี' },
                      ]}
                      onChange={(v) => updCond({ retirementPolicy: v as WorkConditions['retirementPolicy'] })}
                    />
                  </Field>
                  <NumField label="แจ้งเตือนก่อนเกษียณ" suffix="วัน" min={0} value={wc.retirementAlertDays} fallback={90} onChange={(n) => updCond({ retirementAlertDays: n })} />
                </div>
              ) : null}

              {/* 6) การพ้นสภาพ */}
              {condSection === 'exit' ? (
                <>
                  <div className="hr-leave-form__grid">
                    <NumField label="แจ้งลาออกล่วงหน้า" suffix="วัน" min={0} value={wc.resignNoticeDays} fallback={30} onChange={(n) => updCond({ resignNoticeDays: n })} />
                  </div>
                  <div className="hr-cond__toggle-block">
                    <ToggleField label="ต้องคืนทรัพย์สินก่อนพ้นสภาพ" checked={wc.returnAssetsRequired ?? false} onChange={(v) => updCond({ returnAssetsRequired: v })} />
                    <ToggleField label="คำนวณวันลาคงเหลือเป็นเงิน" checked={wc.payoutRemainingLeave ?? false} onChange={(v) => updCond({ payoutRemainingLeave: v })} />
                  </div>
                </>
              ) : null}
            </div>
          </div>
        ) : null}

        {/* Tab 4: Signers */}
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

      {branchModal ? (
        <BranchEditModal
          initial={branchModal}
          onCancel={() => setBranchModal(null)}
          onSave={saveBranch}
          accent={accent}
        />
      ) : null}
    </>
  );
}

// ─── Branch edit (inner dialog, edits one branch within the company draft) ──────

function BranchEditModal({
  initial,
  onCancel,
  onSave,
  accent,
}: {
  initial: Branch;
  onCancel: () => void;
  onSave: (b: Branch) => void;
  accent: string;
}) {
  const [draft, setDraft] = useState<Branch>(initial);
  const [error, setError] = useState('');
  const upd = (patch: Partial<Branch>) => setDraft((d) => ({ ...d, ...patch }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!draft.nameTh.trim()) { setError('กรุณาระบุชื่อสาขา'); return; }
    onSave(draft);
  };

  return (
    <div className="hr-leave-confirm-overlay" role="presentation" onClick={onCancel}>
      <section className="hr-company-signer-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <header className="hr-leave-confirm__head">
          <h4>{initial.id ? 'แก้ไขสาขา' : 'เพิ่มสาขา'}</h4>
          <button type="button" onClick={onCancel} aria-label="ปิด"><XIcon className="h-4 w-4" /></button>
        </header>
        <form onSubmit={submit} className="hr-leave-confirm__body">
          {error ? <p className="hr-leave-modal-error">{error}</p> : null}
          <div className="hr-leave-form__grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
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
            <Field label="ลำดับที่สาขา (ประกันสังคม)">
              <input className="hr-leave-input hr-leave-input--mono" value={draft.branchSeq ?? ''} onChange={(e) => upd({ branchSeq: e.target.value })} placeholder="000000" maxLength={6} />
            </Field>
          </div>
          <div className="mt-4 flex flex-col gap-3">
            <ToggleField label="นำส่งประกันสังคมในนามสาขานี้" checked={draft.submitSocialSecurity ?? false} onChange={(v) => upd({ submitSocialSecurity: v })} />
            <ToggleField label="สำนักงานใหญ่" checked={draft.isHeadOffice} onChange={(v) => upd({ isHeadOffice: v })} />
            <ToggleField label="เปิดใช้งานสาขานี้" checked={draft.active} onChange={(v) => upd({ active: v })} />
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

// ─── Dispatcher ────────────────────────────────────────────────────────────────

export function OrgNodeDetailModal({
  selectedNode,
  branchOwnerCompanyId,
  companies,
  onCompanySave,
  onClose,
  accent,
}: {
  selectedNode: OrgNode | null;
  branchOwnerCompanyId: string | null;
  companies: Company[];
  onCompanySave: (updated: Company) => void;
  onClose: () => void;
  accent: string;
}) {
  if (!selectedNode) return null;

  // Company node → company modal (legal tab).
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

  // Branch node → deep-link into the owning company modal, branches tab,
  // focused on the matching branch record (single source of truth — no separate editor).
  if (selectedNode.type === 'branch') {
    const owningCompany = companies.find((c) => c.id === branchOwnerCompanyId);
    if (!owningCompany) return null;
    const branch = owningCompany.branches.find((b) => b.nameTh === selectedNode.name) ?? null;
    return (
      <CompanyDetailModal
        key={`${owningCompany.id}:${selectedNode.id}`}
        company={owningCompany}
        onSave={onCompanySave}
        onClose={onClose}
        accent={accent}
        initialTab="branches"
        focusBranchId={branch?.id ?? null}
      />
    );
  }

  return null;
}

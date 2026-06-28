'use client';

import { type CSSProperties, type DragEvent, type FormEvent, useEffect, useRef, useState } from 'react';
import { PlusIcon, EditIcon, TrashIcon, XIcon, SearchIcon, CheckIcon } from '@/components/ui/icons';
import { HrCustomSelect } from './hr-ui';
import { publicApiFetch } from '@/lib/api';
import {
  type JobLevel,
  type Position,
} from '@/data/humansource/positions';
import { type EmployeeType } from '@/data/humansource/employee-types';
import { type PayrollEmploymentType } from '@/data/humansource/payroll-employment-types';
import { type Company } from '@/data/humansource/companies';

type HrEmployeeRow = {
  id: string;
  positionId: string;
  active: boolean;
};

// ─── Form primitives ──────────────────────────────────────────────────────────

function Field({
  label,
  required,
  full,
  children,
}: {
  label: string;
  required?: boolean;
  full?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <label className={`hr-leave-field${full ? ' hr-leave-field--full' : ''}`}>
      <span className="hr-leave-field__label">
        {label}
        {required ? <span className="hr-leave-field__required">*</span> : null}
      </span>
      <span className="hr-leave-field__control">{children}</span>
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

function ChipOptionGroup({
  label,
  values,
  options,
  onChange,
}: {
  label: string;
  values: string[];
  options: { value: string; label: string }[];
  onChange: (values: string[]) => void;
}) {
  const toggle = (value: string) => {
    onChange(values.includes(value) ? values.filter((item) => item !== value) : [...values, value]);
  };

  return (
    <div className="hr-position-chip-field">
      <p className="hr-position-chip-field__label">{label}</p>
      <div className="hr-position-emp-types">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`hr-position-emp-chip${values.includes(option.value) ? ' hr-position-emp-chip--active' : ''}`}
            onClick={() => toggle(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

const JOB_LEVEL_DETAILS: Record<string, { description: string; skills: string }> = {
  CEO: { description: 'ประธานเจ้าหน้าที่บริหาร', skills: '' },
  E: { description: 'ผู้อำนวยการ', skills: '' },
  M: { description: 'ผู้จัดการ', skills: '' },
  O3: { description: 'หัวหน้างาน', skills: '' },
  O2: { description: 'เจ้าหน้าที่อาวุโส', skills: '' },
  O1: { description: 'เจ้าหน้าที่', skills: '' },
  T: { description: 'พนักงานชั่วคราว', skills: '' },
  P: { description: 'นักศึกษาฝึกงาน', skills: '' },
};

const getJobLevelDetail = (level: JobLevel) =>
  JOB_LEVEL_DETAILS[level.nameTh] ?? JOB_LEVEL_DETAILS[level.nameEn] ?? { description: '', skills: '' };

const getPositionAccentVars = (accent: string): CSSProperties => ({
  '--hr-position-accent': accent,
  '--hr-position-accent-soft': `${accent}14`,
  '--hr-position-accent-border': `${accent}33`,
  '--hr-position-accent-focus': `${accent}24`,
}) as CSSProperties;

// ─── Delete confirm ───────────────────────────────────────────────────────────

function DeleteConfirm({
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
        <div className="hr-leave-confirm__head">
          <h4>ยืนยันการลบข้อมูล</h4>
          <button type="button" onClick={onCancel} aria-label="ปิด"><XIcon className="h-4 w-4" /></button>
        </div>
        <div className="hr-leave-confirm__body">
          <h4>กรุณายืนยันการดำเนินการ</h4>
          <p>คุณแน่ใจที่จะแก้ไขข้อมูลใช่หรือไม่?</p>
          <p className="hr-position-confirm-target">{label}</p>
        </div>
        <div className="hr-leave-confirm__foot">
          <button type="button" className="hr-leave-modal-foot__cancel" onClick={onCancel}>ยกเลิก</button>
          <button type="button" className="hr-leave-confirm__danger" onClick={onConfirm}>ยืนยันการลบ</button>
        </div>
      </section>
    </div>
  );
}

// ─── Job-level modal (fullscreen) ─────────────────────────────────────────────

type JlDraft = Omit<JobLevel, 'id'> & { id: string };

function JobLevelDrawer({
  initial,
  onCancel,
  onSave,
  accent,
}: {
  initial: JlDraft;
  onCancel: () => void;
  onSave: (draft: JlDraft) => void;
  accent: string;
}) {
  const [draft, setDraft] = useState<JlDraft>(initial);
  const [error, setError] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const upd = (patch: Partial<JlDraft>) => setDraft((d) => ({ ...d, ...patch }));

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setDrawerOpen(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const closeDrawer = () => {
    setDrawerOpen(false);
    window.setTimeout(onCancel, 240);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!draft.nameTh.trim()) { setError('กรุณาระบุชื่อระดับ (ไทย)'); return; }
    onSave({ ...draft, active: true });
  };

  return (
    <>
      <div className="hr-scrim" data-open={drawerOpen ? 'true' : 'false'} onClick={closeDrawer} aria-hidden />
      <aside className="hr-drawer" data-open={drawerOpen ? 'true' : 'false'} role="dialog" aria-modal="true" aria-label={initial.id ? 'แก้ไขระดับตำแหน่ง' : 'เพิ่มระดับตำแหน่ง'}>
        <form className="flex min-h-0 flex-1 flex-col" onSubmit={submit}>
          <header className="hr-drawer__head">
            <div>
              <h3 className="hr-drawer__title">{initial.id ? 'แก้ไขระดับตำแหน่ง' : 'เพิ่มระดับตำแหน่ง'}</h3>
              <p className="hr-drawer__subtitle">ระดับสำหรับจัดกลุ่มตำแหน่งงาน เรียงจากระดับสูงสุดไว้บนสุด</p>
            </div>
            <button type="button" className="hr-drawer__close" onClick={closeDrawer} aria-label="ปิด">
              <XIcon className="h-4 w-4" />
            </button>
          </header>
          <div className="hr-drawer__body">
            {error ? <p className="hr-leave-modal-error">{error}</p> : null}
            <div className="hr-leave-form__grid">
              <Field label="ชื่อระดับ (ไทย)" required>
                <input autoFocus className="hr-leave-input" value={draft.nameTh} onChange={(e) => upd({ nameTh: e.target.value })} placeholder="ผู้จัดการ" />
              </Field>
              <Field label="ชื่อระดับ (EN)" required>
                <input className="hr-leave-input" value={draft.nameEn} onChange={(e) => upd({ nameEn: e.target.value })} placeholder="Manager" />
              </Field>
            </div>
          </div>
          <footer className="hr-drawer__foot">
            <span className="hr-grow hr-position-drawer-note">ลากแถวในตารางเพื่อจัดลำดับระดับตำแหน่ง</span>
            <button type="button" className="hr-position-modal__cancel" onClick={closeDrawer}>ยกเลิก</button>
            <button type="submit" className="hr-position-modal__save" style={{ backgroundColor: accent }}>บันทึก</button>
          </footer>
        </form>
      </aside>
    </>
  );
}

// ─── Position drawer (side panel) ─────────────────────────────────────────────

type PosDraft = Omit<Position, 'id'> & { id: string };

function PositionDrawer({
  initial,
  jobLevels,
  employeeTypes,
  employmentTypes,
  companies,
  onCancel,
  onSave,
  accent,
}: {
  initial: PosDraft;
  jobLevels: JobLevel[];
  employeeTypes: EmployeeType[];
  employmentTypes: PayrollEmploymentType[];
  companies: Company[];
  onCancel: () => void;
  onSave: (draft: PosDraft) => void;
  accent: string;
}) {
  const [draft, setDraft] = useState<PosDraft>(initial);
  const [error, setError] = useState('');
  const upd = (patch: Partial<PosDraft>) => setDraft((d) => ({ ...d, ...patch }));

  const activeLevels = jobLevels.filter((l) => l.active);
  const levelOptions = [
    { value: '', label: 'เลือกระดับ' },
    ...activeLevels.map((l) => ({ value: l.id, label: `${l.nameTh} (${l.nameEn})` })),
  ];
  const companyOptions = [
    { value: '', label: 'ทุกบริษัท' },
    ...companies.filter((company) => company.active).map((company) => ({ value: company.id, label: company.tradeName })),
  ];
  const employeeTypeOptions = employeeTypes.map((type) => ({ value: type.id, label: type.nameTh }));
  const employmentTypeOptions = [
    { value: '', label: 'เลือกประเภทการจ้างงาน' },
    ...employmentTypes
    .filter((type) => type.active)
    .map((type) => ({ value: type.id, label: type.nameTh })),
  ];

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!draft.nameTh.trim()) { setError('กรุณาระบุชื่อตำแหน่ง (ไทย)'); return; }
    if (!draft.jobLevelId)    { setError('กรุณาเลือกระดับงาน'); return; }
    onSave(draft);
  };

  return (
    <>
      <div className="fixed inset-0 z-[69] bg-black/30" onClick={onCancel} />
      <div className="hr-position-drawer" role="dialog" aria-modal="true">
        <form className="flex min-h-0 flex-1 flex-col" onSubmit={submit}>
          <header className="hr-position-drawer__head">
            <h3 className="hr-position-drawer__title">
              {initial.id ? 'แก้ไขตำแหน่งงาน' : 'เพิ่มตำแหน่ง'}
            </h3>
            <button type="button" className="hr-position-drawer__close" onClick={onCancel} aria-label="ปิด">
              <XIcon className="h-4 w-4" />
            </button>
          </header>

          <div className="hr-position-drawer__body">
            {error ? <p className="hr-leave-modal-error">{error}</p> : null}

            {/* ── ข้อมูลพื้นฐาน ── */}
            <div className="hr-leave-form__grid">
              <Field label="ตำแหน่ง" required>
                <input autoFocus className="hr-leave-input" value={draft.nameTh} onChange={(e) => upd({ nameTh: e.target.value })} placeholder="กรอกชื่อตำแหน่ง" />
              </Field>
              <Field label="ตำแหน่ง (EN)">
                <input className="hr-leave-input" value={draft.nameEn} onChange={(e) => upd({ nameEn: e.target.value })} placeholder="Position name (EN)" />
              </Field>
              <Field label="ระดับ" required>
                <HrCustomSelect value={draft.jobLevelId} options={levelOptions} onChange={(v) => upd({ jobLevelId: v })} />
              </Field>
              <Field label="บริษัท">
                <HrCustomSelect value={draft.companyId} options={companyOptions} onChange={(v) => upd({ companyId: v })} />
              </Field>
              <Field label="ประเภทการจ้างงาน">
                <HrCustomSelect
                  value={(draft.employmentTypeIds ?? [])[0] ?? ''}
                  options={employmentTypeOptions}
                  onChange={(value) => upd({ employmentTypeIds: value ? [value] : [] })}
                />
              </Field>
            </div>

            <div className="hr-position-drawer__section">
              <ChipOptionGroup
                label="ประเภทพนักงาน"
                values={draft.employeeTypes}
                options={employeeTypeOptions}
                onChange={(values) => upd({ employeeTypes: values })}
              />
            </div>

            {/* ── เงินเดือน ── */}
            <div className="hr-position-drawer__section">
              <p className="hr-position-section-head">เงินเดือน (บาท/เดือน)</p>
              <div className="hr-position-salary-row">
                <div className="hr-leave-field__control">
                  <input
                    className="hr-leave-input hr-position-salary-input"
                    type="number"
                    min={0}
                    placeholder="ต่ำสุด"
                    value={draft.salaryMin || ''}
                    onChange={(e) => upd({ salaryMin: Number(e.target.value) || 0 })}
                  />
                </div>
                <span className="hr-position-salary-sep">—</span>
                <div className="hr-leave-field__control">
                  <input
                    className="hr-leave-input hr-position-salary-input"
                    type="number"
                    min={0}
                    placeholder="สูงสุด"
                    value={draft.salaryMax || ''}
                    onChange={(e) => upd({ salaryMax: Number(e.target.value) || 0 })}
                  />
                </div>
              </div>
            </div>

            {/* ── รายละเอียด ── */}
            <div className="hr-position-drawer__section">
              <p className="hr-position-section-head">รายละเอียดตำแหน่ง</p>
              <div className="flex flex-col gap-3">
                <Field label="ภาพรวมของตำแหน่ง" full>
                  <textarea
                    className="hr-leave-input"
                    rows={3}
                    placeholder="กรอกภาพรวมของตำแหน่ง"
                    value={draft.overview}
                    onChange={(e) => upd({ overview: e.target.value })}
                  />
                </Field>
                <Field label="หน้าที่ความรับผิดชอบ" full>
                  <textarea
                    className="hr-leave-input"
                    rows={3}
                    placeholder="กรอกหน้าที่ความรับผิดชอบ"
                    value={draft.responsibilities}
                    onChange={(e) => upd({ responsibilities: e.target.value })}
                  />
                </Field>
                <Field label="คุณสมบัติ" full>
                  <textarea
                    className="hr-leave-input"
                    rows={3}
                    placeholder="กรอกคุณสมบัติเฉพาะตำแหน่ง เช่น วุฒิการศึกษา"
                    value={draft.qualifications}
                    onChange={(e) => upd({ qualifications: e.target.value })}
                  />
                </Field>
              </div>
            </div>

            {/* ── การตั้งค่า ── */}
            <div className="hr-position-drawer__section">
              <p className="hr-position-section-head">การตั้งค่า</p>
              <ToggleField label="เปิดใช้งาน" checked={draft.active} onChange={(v) => upd({ active: v })} />
            </div>
          </div>

          <footer className="hr-position-drawer__foot">
            <button type="button" className="hr-position-modal__cancel" onClick={onCancel}>ยกเลิก</button>
            <button type="submit" className="hr-position-modal__save" style={{ backgroundColor: accent }}>
              {initial.id ? 'บันทึก' : 'สร้าง'}
            </button>
          </footer>
        </form>
      </div>
    </>
  );
}

// ─── Job-levels board ─────────────────────────────────────────────────────────

function JobLevelsBoard({ accent }: { accent: string }) {
  const [levels, setLevels] = useState<JobLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [draggedId, setDraggedId] = useState('');
  const [modal, setModal] = useState<JlDraft | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<JobLevel | null>(null);
  const [toast, setToast] = useState(false);
  const toastTimer = useRef<number | null>(null);
  const isMounted = useRef(true);

  const loadLevels = async () => {
    const data = await publicApiFetch<JobLevel[]>('/api/humansource/job-levels');
    if (isMounted.current) setLevels(data);
  };

  useEffect(() => {
    isMounted.current = true;
    loadLevels()
      .catch(() => { /* keep empty state */ })
      .finally(() => { if (isMounted.current) setLoading(false); });
    return () => {
      isMounted.current = false;
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    };
  }, []);

  const showOrderToast = () => {
    setToast(true);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(false), 2200);
  };

  const sorted = [...levels].sort((a, b) => a.rank - b.rank);
  const filtered = sorted
    .filter((l) => !search || l.nameTh.includes(search) || l.nameEn.toLowerCase().includes(search.toLowerCase()));

  const openAdd = () =>
    setModal({ id: '', nameTh: '', nameEn: '', rank: levels.length > 0 ? Math.max(...levels.map((l) => l.rank)) + 1 : 1, active: true });

  const openEdit = (l: JobLevel) => setModal({ ...l });

  const persistOrder = async (ordered: JobLevel[]) => {
    try {
      await Promise.all(
        ordered.map((level, index) =>
          publicApiFetch<JobLevel>(`/api/humansource/job-levels/${level.id}`, {
            method: 'PATCH',
            body: JSON.stringify({ rank: index + 1, active: true }),
          }),
        ),
      );
      await loadLevels();
      showOrderToast();
    } catch { /* keep optimistic order without interrupting the table */ }
  };

  const reorderLevel = (fromId: string, toId: string) => {
    if (!fromId || fromId === toId || search) return;
    const fromIndex = sorted.findIndex((level) => level.id === fromId);
    const toIndex = sorted.findIndex((level) => level.id === toId);
    if (fromIndex < 0 || toIndex < 0) return;
    const next = [...sorted];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    const reranked = next.map((level, index) => ({ ...level, rank: index + 1, active: true }));
    setLevels(reranked);
    void persistOrder(reranked);
  };

  const handleDragStart = (event: DragEvent<HTMLTableRowElement>, id: string) => {
    if (search) return;
    setDraggedId(id);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', id);
  };

  const handleDrop = (event: DragEvent<HTMLTableRowElement>, id: string) => {
    event.preventDefault();
    const fromId = event.dataTransfer.getData('text/plain') || draggedId;
    setDraggedId('');
    reorderLevel(fromId, id);
  };

  const save = async (draft: JlDraft) => {
    try {
      if (!draft.id) {
        const created = await publicApiFetch<JobLevel>('/api/humansource/job-levels', {
          method: 'POST',
          body: JSON.stringify({ nameTh: draft.nameTh, nameEn: draft.nameEn, rank: draft.rank, active: true }),
        });
        setLevels((ls) => [...ls, created]);
      } else {
        const updated = await publicApiFetch<JobLevel>(`/api/humansource/job-levels/${draft.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ nameTh: draft.nameTh, nameEn: draft.nameEn, rank: draft.rank, active: true }),
        });
        setLevels((ls) => ls.map((l) => (l.id === updated.id ? updated : l)));
      }
      setModal(null);
    } catch { /* no inline save-failed alert on this table */ }
  };

  const doDelete = async () => {
    if (!deleteTarget) return;
    try {
      await publicApiFetch<{ id: string }>(`/api/humansource/job-levels/${deleteTarget.id}`, { method: 'DELETE' });
      setLevels((ls) => ls.filter((l) => l.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch { /* no inline delete-failed alert on this table */ }
  };

  return (
    <div className="hr-position-page hr-position-page--levels" style={getPositionAccentVars(accent)}>
      <div className="hr-settings-toolbar hr-position-level-toolbar">
        <div className="hr-settings-toolbar__filters">
          <div className="hr-leave-board__search">
            <SearchIcon className="h-3.5 w-3.5" />
            <input
              type="search"
              placeholder="ค้นหาระดับ"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="hr-leave-board__search-input"
            />
          </div>
          <div className="hr-position-level-warning" role="note">
            <span className="hr-position-level-warning__icon">!</span>
            <span>โปรดกำหนดระดับที่สูงที่สุดเป็นลำดับแรก</span>
          </div>
        </div>
        <div className="hr-filter-chip-group">
          <button type="button" className="hr-settings-primary-action" style={{ backgroundColor: accent }} onClick={openAdd}>
            <PlusIcon className="h-4 w-4" />
            เพิ่มระดับ
          </button>
        </div>
      </div>

      <div className="hr-settings-table-wrap hr-position-level-table-wrap">
        <table className="hr-settings-table hr-position-level-table">
          <colgroup>
            <col className="hr-position-level-col--name" />
            <col className="hr-position-level-col--name-en" />
            <col className="hr-position-level-col--desc" />
            <col className="hr-position-level-col--skills" />
            <col className="hr-position-level-col--actions" />
          </colgroup>
          <thead>
            <tr>
              {['ชื่อระดับ', 'ชื่อระดับ (EN)', 'คำอธิบาย', 'ทักษะประจำระดับตำแหน่ง', ''].map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="hr-position-empty">กำลังโหลด...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="hr-position-empty">{search ? 'ไม่พบระดับที่ค้นหา' : 'ยังไม่มีระดับตำแหน่ง'}</td></tr>
            ) : (
              filtered.map((l) => {
                const detail = getJobLevelDetail(l);
                return (
                <tr
                  key={l.id}
                  draggable={!search}
                  className={`hr-position-level-row${draggedId === l.id ? ' hr-position-level-row--dragging' : ''}`}
                  onClick={() => openEdit(l)}
                  onDragStart={(event) => handleDragStart(event, l.id)}
                  onDragOver={(event) => { if (!search) event.preventDefault(); }}
                  onDragEnd={() => setDraggedId('')}
                  onDrop={(event) => handleDrop(event, l.id)}
                >
                  <td>
                    <span className="hr-position-drag-cell">
                      <span className="hr-position-drag-handle" aria-hidden="true">⋮⋮</span>
                      <span className="hr-settings-table__primary">{l.nameTh}</span>
                    </span>
                  </td>
                  <td><span className="hr-settings-table__secondary">{l.nameEn}</span></td>
                  <td><span className="hr-settings-table__primary">{detail.description}</span></td>
                  <td><span className="hr-settings-table__secondary">{detail.skills}</span></td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div className="hr-position-row-actions">
                      <button type="button" className="hr-position-action" onClick={() => openEdit(l)} title="แก้ไข">
                        <EditIcon className="h-3.5 w-3.5" />
                      </button>
                      <button type="button" className="hr-position-action hr-position-action--danger" onClick={() => setDeleteTarget(l)} title="ลบ">
                        <TrashIcon className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {toast ? (
        <div className="hr-position-order-toast" role="status">
          <span className="hr-position-order-toast__icon" aria-hidden>
            <CheckIcon className="h-4 w-4" />
          </span>
          <span>
            <strong>สำเร็จ!</strong>
            <small>เปลี่ยนลำดับเรียบร้อยแล้ว</small>
          </span>
        </div>
      ) : null}

      {modal ? <JobLevelDrawer initial={modal} onCancel={() => setModal(null)} onSave={save} accent={accent} /> : null}
      {deleteTarget ? <DeleteConfirm label={deleteTarget.nameTh} onCancel={() => setDeleteTarget(null)} onConfirm={doDelete} /> : null}
    </div>
  );
}

// ─── Filter chip (dropdown-select chip for toolbar) ──────────────────────────

function FilterChipSelect({
  label,
  value,
  options,
  onChange,
  accent,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
  accent: string;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const selected = options.find((o) => o.value === value);

  if (selected) {
    return (
      <div
        className="hr-filter-chip hr-filter-chip--active"
        style={{ borderColor: accent, color: accent }}
      >
        <span>{selected.label}</span>
        <button
          type="button"
          className="hr-filter-chip__clear"
          aria-label="ล้างตัวกรอง"
          onClick={() => onChange('')}
        >
          <XIcon className="h-3 w-3" />
        </button>
      </div>
    );
  }

  return (
    <div ref={wrapRef} className="hr-filter-chip-wrap">
      <button
        type="button"
        className="hr-filter-chip"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {label} <span aria-hidden>▾</span>
      </button>
      {open && (
        <div className="hr-filter-chip-dropdown">
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              className="hr-filter-chip-dropdown__item"
              onClick={() => { onChange(o.value); setOpen(false); }}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const STATUS_FILTER_CHIP_OPTIONS = [
  { value: 'active',   label: 'ใช้งาน' },
  { value: 'inactive', label: 'ปิดใช้งาน' },
];

// ─── Positions list ───────────────────────────────────────────────────────────

function PositionsList({ accent }: { accent: string }) {
  const [positions, setPositions] = useState<Position[]>([]);
  const [jobLevels, setJobLevels] = useState<JobLevel[]>([]);
  const [employeeTypes, setEmployeeTypes] = useState<EmployeeType[]>([]);
  const [employmentTypes, setEmploymentTypes] = useState<PayrollEmploymentType[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [employees, setEmployees] = useState<HrEmployeeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState('');
  const [toast, setToast] = useState('');
  const [search, setSearch] = useState('');
  const [filterLevelId, setFilterLevelId] = useState('');
  const [filterCompanyId, setFilterCompanyId] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [drawer, setDrawer] = useState<PosDraft | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Position | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    Promise.all([
      publicApiFetch<Position[]>('/api/humansource/positions'),
      publicApiFetch<JobLevel[]>('/api/humansource/job-levels'),
      publicApiFetch<EmployeeType[]>('/api/humansource/employee-types'),
      publicApiFetch<PayrollEmploymentType[]>('/api/humansource/payroll/employment-types'),
      publicApiFetch<Company[]>('/api/humansource/org-structure/companies'),
      publicApiFetch<HrEmployeeRow[]>('/api/humansource/employees'),
    ])
      .then(([pos, lvl, empTypes, payEmpTypes, companyRows, employeeRows]) => {
        if (isMounted.current) {
          setPositions(pos);
          setJobLevels(lvl);
          setEmployeeTypes(empTypes);
          setEmploymentTypes(payEmpTypes);
          setCompanies(companyRows);
          setEmployees(employeeRows);
          setLoading(false);
        }
      })
      .catch(() => { if (isMounted.current) { setApiError('โหลดข้อมูลไม่สำเร็จ'); setLoading(false); } });
    return () => { isMounted.current = false; };
  }, []);

  const levelMap = Object.fromEntries(jobLevels.map((l) => [l.id, l]));
  const employeeCountMap = employees.reduce<Record<string, number>>((acc, employee) => {
    if (!employee.active) return acc;
    acc[employee.positionId] = (acc[employee.positionId] ?? 0) + 1;
    return acc;
  }, {});
  const companyOptions = [
    { value: '', label: 'ทุกบริษัท' },
    ...companies.filter((company) => company.active).map((company) => ({ value: company.id, label: company.tradeName })),
  ];

  const filtered = positions.filter((p) => {
    if (filterStatus === 'active'   && !p.active) return false;
    if (filterStatus === 'inactive' &&  p.active) return false;
    if (filterLevelId && p.jobLevelId !== filterLevelId) return false;
    if (filterCompanyId && p.companyId !== filterCompanyId) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!p.nameTh.includes(search) && !p.nameEn.toLowerCase().includes(q) && !p.code.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const allSelected = filtered.length > 0 && filtered.every((p) => selectedIds.has(p.id));
  const someSelected = filtered.some((p) => selectedIds.has(p.id));

  const toggleAll = () => {
    if (allSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(filtered.map((p) => p.id)));
  };

  const toggleOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const openAdd = () =>
    setDrawer({
      id: '', code: '', nameTh: '', nameEn: '',
      jobLevelId: jobLevels.find((l) => l.active)?.id ?? '',
      companyId: '', employeeTypes: [],
      employmentTypeIds: [],
      salaryMin: 0, salaryMax: 0,
      overview: '', responsibilities: '', qualifications: '',
      hasBenefits: false, active: true,
    });

  const openEdit = (p: Position) => setDrawer({ ...p, employeeTypes: p.employeeTypes ?? [], employmentTypeIds: p.employmentTypeIds ?? [] });

  const save = async (draft: PosDraft) => {
    const body = {
      code: draft.code, nameTh: draft.nameTh, nameEn: draft.nameEn,
      jobLevelId: draft.jobLevelId, companyId: draft.companyId,
      employeeTypes: draft.employeeTypes, employmentTypeIds: draft.employmentTypeIds ?? [], salaryMin: draft.salaryMin,
      salaryMax: draft.salaryMax, overview: draft.overview,
      responsibilities: draft.responsibilities, qualifications: draft.qualifications,
      hasBenefits: draft.hasBenefits, active: draft.active,
    };
    try {
      if (!draft.id) {
        const created = await publicApiFetch<Position>('/api/humansource/positions', {
          method: 'POST', body: JSON.stringify(body),
        });
        setPositions((ps) => [...ps, created]);
      } else {
        const updated = await publicApiFetch<Position>(`/api/humansource/positions/${draft.id}`, {
          method: 'PATCH', body: JSON.stringify(body),
        });
        setPositions((ps) => ps.map((p) => (p.id === updated.id ? updated : p)));
      }
      setDrawer(null);
    } catch {
      setApiError('บันทึกไม่สำเร็จ กรุณาลองใหม่');
    }
  };

  const warnCannotDelete = (position: Position) => {
    const activeCount = employeeCountMap[position.id] ?? 0;
    if (activeCount === 0) {
      setDeleteTarget(position);
      return;
    }
    setToast(`ไม่สามารถลบตำแหน่งนี้ได้ มีพนักงานใช้งานอยู่ ${activeCount} คน`);
    window.setTimeout(() => setToast(''), 2600);
  };

  const doDelete = async () => {
    if (!deleteTarget) return;
    const activeCount = employeeCountMap[deleteTarget.id] ?? 0;
    if (activeCount > 0) {
      setDeleteTarget(null);
      setToast(`ไม่สามารถลบตำแหน่งนี้ได้ มีพนักงานใช้งานอยู่ ${activeCount} คน`);
      window.setTimeout(() => setToast(''), 2600);
      return;
    }
    try {
      await publicApiFetch<{ id: string }>(`/api/humansource/positions/${deleteTarget.id}`, { method: 'DELETE' });
      setPositions((ps) => ps.filter((p) => p.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      setApiError('ลบไม่สำเร็จ กรุณาลองใหม่');
    }
  };

  const companyLabel = (id: string) => companyOptions.find((c) => c.value === id)?.label ?? 'ทุกบริษัท';

  return (
    <div className="hr-position-page" style={getPositionAccentVars(accent)}>
      {apiError ? <p className="hr-leave-modal-error" style={{ margin: '0.75rem 1rem' }}>{apiError}</p> : null}
      <div className="hr-settings-toolbar">
        <div className="hr-settings-toolbar__filters">
          <div className="hr-leave-board__search">
            <SearchIcon className="h-3.5 w-3.5" />
            <input
              type="search"
              placeholder="ค้นหาผู้สมัคร หรือ ตำแหน่ง"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="hr-leave-board__search-input"
            />
          </div>
        </div>
        <div className="hr-filter-chip-group">
          <FilterChipSelect
            label="ระดับ"
            value={filterLevelId}
            options={jobLevels.map((l) => ({ value: l.id, label: l.nameTh }))}
            onChange={setFilterLevelId}
            accent={accent}
          />
          <FilterChipSelect
            label="บริษัท"
            value={filterCompanyId}
            options={companyOptions.filter((o) => o.value !== '')}
            onChange={setFilterCompanyId}
            accent={accent}
          />
          <FilterChipSelect
            label="สถานะ"
            value={filterStatus}
            options={STATUS_FILTER_CHIP_OPTIONS}
            onChange={setFilterStatus}
            accent={accent}
          />
          <button type="button" className="hr-settings-primary-action" style={{ backgroundColor: accent }} onClick={openAdd}>
            <PlusIcon className="h-4 w-4" />
            เพิ่มตำแหน่ง
          </button>
        </div>
      </div>

      <div className="hr-settings-table-wrap">
        <table className="hr-settings-table hr-position-list-table">
          <colgroup>
            <col className="hr-position-list-col--check" />
            <col className="hr-position-list-col--name" />
            <col className="hr-position-list-col--name-en" />
            <col className="hr-position-list-col--level" />
            <col className="hr-position-list-col--company" />
            <col className="hr-position-list-col--status" />
          </colgroup>
          <thead>
            <tr>
              <th className="hr-position-table__check">
                <input
                  type="checkbox"
                  ref={(el) => { if (el) el.indeterminate = someSelected && !allSelected; }}
                  checked={allSelected}
                  onChange={toggleAll}
                />
              </th>
              <th>ตำแหน่ง</th>
              <th>ตำแหน่ง (EN)</th>
              <th>ระดับ</th>
              <th>บริษัท</th>
              <th>สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="hr-position-empty">กำลังโหลด...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="hr-position-empty">{search || filterLevelId || filterCompanyId ? 'ไม่พบตำแหน่งที่ค้นหา' : 'ยังไม่มีตำแหน่งงาน'}</td></tr>
            ) : (
              filtered.map((p) => {
                const employeeCount = employeeCountMap[p.id] ?? 0;
                return (
                <tr key={p.id} onClick={() => openEdit(p)} style={{ cursor: 'pointer' }}>
                  <td className="hr-position-table__check" onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" checked={selectedIds.has(p.id)} onChange={() => toggleOne(p.id)} />
                  </td>
                  <td>
                    <span className="hr-position-name-with-count">
                      <span className="hr-settings-table__primary">{p.nameTh}</span>
                      {employeeCount > 0 ? <span className="hr-position-headcount">{employeeCount}</span> : null}
                    </span>
                  </td>
                  <td><span className="hr-settings-table__secondary">{p.nameEn}</span></td>
                  <td><span className="hr-position-level-badge">{levelMap[p.jobLevelId]?.nameTh ?? '—'}</span></td>
                  <td><span className="hr-settings-table__secondary">{companyLabel(p.companyId)}</span></td>
                  <td className="hr-position-status-cell">
                    <span className={`hr-settings-status ${p.active ? 'hr-settings-status--enabled' : 'hr-settings-status--disabled'}`}>
                      {p.active ? 'ใช้งาน' : 'ปิดใช้งาน'}
                    </span>
                    <div className="hr-position-row-actions" onClick={(e) => e.stopPropagation()}>
                      <button type="button" className="hr-position-action hr-position-action--danger" onClick={() => warnCannotDelete(p)} title="ลบ">
                        <TrashIcon className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {toast ? (
        <div className="hr-position-delete-toast" role="status">
          {toast}
        </div>
      ) : null}

      {drawer ? (
        <PositionDrawer
          initial={drawer}
          jobLevels={jobLevels}
          employeeTypes={employeeTypes}
          employmentTypes={employmentTypes}
          companies={companies}
          onCancel={() => setDrawer(null)}
          onSave={save}
          accent={accent}
        />
      ) : null}
      {deleteTarget ? <DeleteConfirm label={deleteTarget.nameTh} onCancel={() => setDeleteTarget(null)} onConfirm={doDelete} /> : null}
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function PositionsBoard({ sub, accent }: { sub: 'positions' | 'job-levels'; accent: string }) {
  if (sub === 'job-levels') return <JobLevelsBoard accent={accent} />;
  return <PositionsList accent={accent} />;
}

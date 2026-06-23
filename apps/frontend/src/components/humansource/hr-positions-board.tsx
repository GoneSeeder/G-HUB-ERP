'use client';

import { type FormEvent, useEffect, useRef, useState } from 'react';
import { PlusIcon, EditIcon, TrashIcon, XIcon, SearchIcon } from '@/components/ui/icons';
import { HrCustomSelect } from './hr-ui';
import {
  type JobLevel,
  type Position,
  EMPLOYEE_TYPE_CHIPS,
  JOB_LEVEL_SEED,
  JOB_LEVELS_STORAGE_KEY,
  POSITION_SEED,
  POSITIONS_STORAGE_KEY,
} from '@/data/humansource/positions';

// ─── Stub company list ────────────────────────────────────────────────────────

const COMPANY_OPTIONS = [
  { value: '',       label: 'ทุกบริษัท' },
  { value: 'ghub',  label: 'G-HUB Enterprise' },
  { value: 'ops',   label: 'G-HUB Operations' },
];

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
          <h4>ลบรายการนี้?</h4>
          <button type="button" onClick={onCancel} aria-label="ปิด"><XIcon className="h-4 w-4" /></button>
        </div>
        <div className="hr-leave-confirm__body">
          <p>ต้องการลบ <strong>{label}</strong> ใช่หรือไม่?</p>
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

function JobLevelModal({
  initial,
  existingRanks,
  onCancel,
  onSave,
  accent,
}: {
  initial: JlDraft;
  existingRanks: number[];
  onCancel: () => void;
  onSave: (draft: JlDraft) => void;
  accent: string;
}) {
  const [draft, setDraft] = useState<JlDraft>(initial);
  const [error, setError] = useState('');
  const upd = (patch: Partial<JlDraft>) => setDraft((d) => ({ ...d, ...patch }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!draft.nameTh.trim()) { setError('กรุณาระบุชื่อระดับ (ไทย)'); return; }
    const rank = Number(draft.rank);
    if (!Number.isInteger(rank) || rank < 1) { setError('ลำดับต้องเป็นจำนวนเต็มบวก'); return; }
    const dupRank = existingRanks.filter((r) => r === rank).length;
    if (dupRank > 0 && !initial.id) setError('ลำดับนี้ซ้ำกับระดับอื่น (บันทึกได้ แต่ควรแก้ไข)');
    onSave({ ...draft, rank });
  };

  return (
    <div className="fixed inset-0 z-[80] flex flex-col bg-[#f7f8fb]" role="dialog" aria-modal="true">
      <form className="flex min-h-0 flex-1 flex-col" onSubmit={submit}>
        <header className="hr-position-modal__head">
          <div className="flex min-w-0 items-center gap-3">
            <button type="button" className="hr-position-modal__back" onClick={onCancel} aria-label="กลับ">←</button>
            <div>
              <h3 className="hr-position-modal__title">{initial.id ? 'แก้ไขระดับงาน' : 'เพิ่มระดับงาน'}</h3>
              <p className="hr-position-modal__subtitle">ระดับและลำดับสำหรับจัดกลุ่มตำแหน่งงาน</p>
            </div>
          </div>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="hr-position-modal__inner">
            {error ? <p className="hr-leave-modal-error">{error}</p> : null}
            <div className="hr-leave-form__grid">
              <Field label="ชื่อระดับ (ไทย)" required>
                <input autoFocus className="hr-leave-input" value={draft.nameTh} onChange={(e) => upd({ nameTh: e.target.value })} placeholder="ผู้จัดการ" />
              </Field>
              <Field label="ชื่อระดับ (EN)" required>
                <input className="hr-leave-input" value={draft.nameEn} onChange={(e) => upd({ nameEn: e.target.value })} placeholder="Manager" />
              </Field>
              <Field label="ลำดับ (Rank)" required>
                <input className="hr-leave-input hr-leave-input--num" type="number" min={1} value={draft.rank} onChange={(e) => upd({ rank: Number(e.target.value) })} />
              </Field>
            </div>
            <div className="mt-5">
              <ToggleField label="เปิดใช้งาน" checked={draft.active} onChange={(v) => upd({ active: v })} />
            </div>
          </div>
        </div>
        <footer className="hr-position-modal__foot">
          <p className="hr-position-modal__footnote">ลำดับต่ำ = อาวุโสมากกว่า</p>
          <div className="flex gap-2">
            <button type="button" className="hr-position-modal__cancel" onClick={onCancel}>ยกเลิก</button>
            <button type="submit" className="hr-position-modal__save" style={{ backgroundColor: accent }}>บันทึก</button>
          </div>
        </footer>
      </form>
    </div>
  );
}

// ─── Position drawer (side panel) ─────────────────────────────────────────────

type PosDraft = Omit<Position, 'id'> & { id: string };

function PositionDrawer({
  initial,
  jobLevels,
  onCancel,
  onSave,
  accent,
}: {
  initial: PosDraft;
  jobLevels: JobLevel[];
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

  const toggleEmpType = (key: string) =>
    upd({
      employeeTypes: draft.employeeTypes.includes(key)
        ? draft.employeeTypes.filter((t) => t !== key)
        : [...draft.employeeTypes, key],
    });

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
                <HrCustomSelect value={draft.companyId} options={COMPANY_OPTIONS} onChange={(v) => upd({ companyId: v })} />
              </Field>
              <Field label="รหัสตำแหน่ง">
                <input className="hr-leave-input hr-leave-input--mono" value={draft.code} onChange={(e) => upd({ code: e.target.value })} placeholder="MG001" />
              </Field>
            </div>

            {/* ── ประเภทพนักงาน ── */}
            <div className="hr-position-drawer__section">
              <p className="hr-position-section-head">ประเภทพนักงาน</p>
              <div className="hr-position-emp-types">
                {EMPLOYEE_TYPE_CHIPS.map((chip) => (
                  <button
                    key={chip.key}
                    type="button"
                    className={`hr-position-emp-chip${draft.employeeTypes.includes(chip.key) ? ' hr-position-emp-chip--active' : ''}`}
                    onClick={() => toggleEmpType(chip.key)}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ── เงินเดือน ── */}
            <div className="hr-position-drawer__section">
              <p className="hr-position-section-head">เงินเดือน (บาท/เดือน)</p>
              <div className="hr-position-salary-row">
                <div className="hr-leave-field__control">
                  <input
                    className="hr-leave-input hr-leave-input--num"
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
                    className="hr-leave-input hr-leave-input--num"
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
              <ToggleField label="สวัสดิการ" checked={draft.hasBenefits} onChange={(v) => upd({ hasBenefits: v })} />
              <div className="hr-position-locked-wrap">
                <span className="hr-position-locked-label">ทักษะประจำตำแหน่ง</span>
                <button type="button" className="hr-position-locked-btn" disabled>🔒 ปลดล็อก</button>
              </div>
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
  const [levels, setLevels] = useState<JobLevel[]>(JOB_LEVEL_SEED);
  const [hydrated, setHydrated] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [modal, setModal] = useState<JlDraft | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<JobLevel | null>(null);
  const counter = useRef(0);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(JOB_LEVELS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as JobLevel[];
        if (Array.isArray(parsed)) setLevels(parsed);
      }
    } catch { /* keep seed */ }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(JOB_LEVELS_STORAGE_KEY, JSON.stringify(levels));
  }, [levels, hydrated]);

  const sorted = [...levels].sort((a, b) => a.rank - b.rank);
  const filtered = sorted
    .filter((l) => !search || l.nameTh.includes(search) || l.nameEn.toLowerCase().includes(search.toLowerCase()))
    .filter((l) => {
      if (filterStatus === 'enabled') return l.active;
      if (filterStatus === 'disabled') return !l.active;
      return true;
    });

  const openAdd = () =>
    setModal({ id: '', nameTh: '', nameEn: '', rank: levels.length > 0 ? Math.max(...levels.map((l) => l.rank)) + 1 : 1, active: true });

  const openEdit = (l: JobLevel) => setModal({ ...l });

  const save = (draft: JlDraft) => {
    setLevels((ls) => {
      if (!draft.id) return [...ls, { ...draft, id: `jl-${Date.now()}-${counter.current++}` }];
      return ls.map((l) => (l.id === draft.id ? { ...draft, id: draft.id } : l));
    });
    setModal(null);
  };

  const doDelete = () => {
    if (!deleteTarget) return;
    setLevels((ls) => ls.filter((l) => l.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const existingRanks = levels.map((l) => l.rank);

  return (
    <div className="hr-position-page">
      <div className="hr-settings-toolbar">
        <div className="hr-settings-toolbar__filters">
          <div className="hr-leave-board__search">
            <SearchIcon className="h-3.5 w-3.5" />
            <input
              type="search"
              placeholder="ค้นหาระดับงาน"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="hr-leave-board__search-input"
            />
          </div>
        </div>
        <div className="hr-filter-chip-group">
          <FilterChipSelect
            label="สถานะ"
            value={filterStatus}
            options={[{ value: 'enabled', label: 'ใช้งาน' }, { value: 'disabled', label: 'ไม่ใช้งาน' }]}
            onChange={setFilterStatus}
            accent={accent}
          />
          <button type="button" className="hr-settings-primary-action" style={{ backgroundColor: accent }} onClick={openAdd}>
            <PlusIcon className="h-4 w-4" />
            เพิ่มระดับงาน
          </button>
        </div>
      </div>

      <div className="hr-settings-table-wrap">
        <table className="hr-settings-table">
          <thead>
            <tr>
              {['ชื่อระดับ', 'ชื่อระดับ (EN)', 'ลำดับ', 'สถานะ', ''].map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={5} className="hr-position-empty">{search ? 'ไม่พบระดับงานที่ค้นหา' : 'ยังไม่มีระดับงาน'}</td></tr>
            ) : (
              filtered.map((l) => (
                <tr key={l.id} onClick={() => openEdit(l)} style={{ cursor: 'pointer' }}>
                  <td><span className="hr-settings-table__primary">{l.nameTh}</span></td>
                  <td><span className="hr-settings-table__secondary">{l.nameEn}</span></td>
                  <td><span className="hr-position-rank">Rank {l.rank}</span></td>
                  <td>
                    <span className={`hr-settings-status ${l.active ? 'hr-settings-status--enabled' : 'hr-settings-status--disabled'}`}>
                      {l.active ? 'ใช้งาน' : 'ปิดใช้งาน'}
                    </span>
                  </td>
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
              ))
            )}
          </tbody>
        </table>
      </div>

      {modal ? <JobLevelModal initial={modal} existingRanks={existingRanks} onCancel={() => setModal(null)} onSave={save} accent={accent} /> : null}
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
  const [positions, setPositions] = useState<Position[]>(POSITION_SEED);
  const [jobLevels, setJobLevels] = useState<JobLevel[]>(JOB_LEVEL_SEED);
  const [hydrated, setHydrated] = useState(false);
  const [search, setSearch] = useState('');
  const [filterLevelId, setFilterLevelId] = useState('');
  const [filterCompanyId, setFilterCompanyId] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [drawer, setDrawer] = useState<PosDraft | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Position | null>(null);
  const counter = useRef(0);

  useEffect(() => {
    try {
      const rawPos = window.localStorage.getItem(POSITIONS_STORAGE_KEY);
      if (rawPos) {
        const p = JSON.parse(rawPos) as Position[];
        if (Array.isArray(p)) setPositions(p);
      }
    } catch { /* keep seed */ }
    try {
      const rawLvl = window.localStorage.getItem(JOB_LEVELS_STORAGE_KEY);
      if (rawLvl) {
        const l = JSON.parse(rawLvl) as JobLevel[];
        if (Array.isArray(l)) setJobLevels(l);
      }
    } catch { /* keep seed */ }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(POSITIONS_STORAGE_KEY, JSON.stringify(positions));
  }, [positions, hydrated]);

  const levelMap = Object.fromEntries(jobLevels.map((l) => [l.id, l]));

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
      salaryMin: 0, salaryMax: 0,
      overview: '', responsibilities: '', qualifications: '',
      hasBenefits: false, active: true,
    });

  const openEdit = (p: Position) => setDrawer({ ...p });

  const save = (draft: PosDraft) => {
    setPositions((ps) => {
      if (!draft.id) return [...ps, { ...draft, id: `pos-${Date.now()}-${counter.current++}` }];
      return ps.map((p) => (p.id === draft.id ? { ...draft, id: draft.id } : p));
    });
    setDrawer(null);
  };

  const doDelete = () => {
    if (!deleteTarget) return;
    setPositions((ps) => ps.filter((p) => p.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const companyLabel = (id: string) => COMPANY_OPTIONS.find((c) => c.value === id)?.label ?? 'ทุกบริษัท';

  return (
    <div className="hr-position-page">
      <div className="hr-settings-toolbar">
        <div className="hr-settings-toolbar__filters">
          <div className="hr-leave-board__search">
            <SearchIcon className="h-3.5 w-3.5" />
            <input
              type="search"
              placeholder="ค้นหาตำแหน่ง รหัส หรือชื่อ EN"
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
            options={COMPANY_OPTIONS.filter((o) => o.value !== '')}
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
        <table className="hr-settings-table">
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
              <th>ตำแหน่งงาน</th>
              <th>ตำแหน่ง (EN)</th>
              <th>รหัส</th>
              <th>ระดับ</th>
              <th>บริษัท</th>
              <th>สถานะ</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} className="hr-position-empty">{search || filterLevelId || filterCompanyId ? 'ไม่พบตำแหน่งที่ค้นหา' : 'ยังไม่มีตำแหน่งงาน'}</td></tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id} onClick={() => openEdit(p)} style={{ cursor: 'pointer' }}>
                  <td className="hr-position-table__check" onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" checked={selectedIds.has(p.id)} onChange={() => toggleOne(p.id)} />
                  </td>
                  <td><span className="hr-settings-table__primary">{p.nameTh}</span></td>
                  <td><span className="hr-settings-table__secondary">{p.nameEn}</span></td>
                  <td><span className="hr-settings-table__code">{p.code}</span></td>
                  <td><span className="hr-position-level-badge">{levelMap[p.jobLevelId]?.nameTh ?? '—'}</span></td>
                  <td><span className="hr-settings-table__secondary">{companyLabel(p.companyId)}</span></td>
                  <td>
                    <span className={`hr-settings-status ${p.active ? 'hr-settings-status--enabled' : 'hr-settings-status--disabled'}`}>
                      {p.active ? 'ใช้งาน' : 'ปิดใช้งาน'}
                    </span>
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div className="hr-position-row-actions">
                      <button type="button" className="hr-position-action" onClick={() => openEdit(p)} title="แก้ไข">
                        <EditIcon className="h-3.5 w-3.5" />
                      </button>
                      <button type="button" className="hr-position-action hr-position-action--danger" onClick={() => setDeleteTarget(p)} title="ลบ">
                        <TrashIcon className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {drawer ? <PositionDrawer initial={drawer} jobLevels={jobLevels} onCancel={() => setDrawer(null)} onSave={save} accent={accent} /> : null}
      {deleteTarget ? <DeleteConfirm label={deleteTarget.nameTh} onCancel={() => setDeleteTarget(null)} onConfirm={doDelete} /> : null}
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function PositionsBoard({ sub, accent }: { sub: 'positions' | 'job-levels'; accent: string }) {
  if (sub === 'job-levels') return <JobLevelsBoard accent={accent} />;
  return <PositionsList accent={accent} />;
}

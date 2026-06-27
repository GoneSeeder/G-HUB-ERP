'use client';

// 3.2 ประเภทการจ้าง — master/detail layout, tabbed calc-condition settings.
// Layout: left list (17rem) + right detail panel.
// Calc conditions: 6 tabs always stored; visible set derived from paidHourly.
// Each tab shows its own settings (OT rates, deduct mode, calcBy, etc.).

import { useEffect, useRef, useState } from 'react';
import { HrCustomSelect } from './hr-ui';
import { publicApiFetch } from '@/lib/api';
import { TrashIcon } from '@/components/ui/icons';
import {
  ALL_CALC_CONDITION_KEYS,
  CALC_CONDITION_LABELS,
  DEDUCT_MODE_OPTIONS,
  PAY_TYPE_OPTIONS,
  PAYROLL_EMPLOYMENT_TYPE_SEED,
  defaultCalcConditions,
  visibleCalcConditions,
  type CalcByMode,
  type CalcConditionConfig,
  type CalcConditionKey,
  type DeductMode,
  type PayrollEmploymentType,
} from '@/data/humansource/payroll-employment-types';

// ── module-level constants ────────────────────────────────────────────────────

const CALC_BY_OPTIONS: { value: CalcByMode; label: string }[] = [
  { value: 'proportional', label: 'คิดตามสัดส่วนเงินได้' },
  { value: 'custom',       label: 'กำหนดเอง' },
];

const BREAK_LATE_OPTIONS: { value: DeductMode; label: string }[] = [
  { value: 'none',           label: 'ไม่มีการหัก' },
  { value: 'per-working-day', label: 'หักเป็นวันทำงาน' },
  { value: 'per-money',      label: 'หักเป็นเงินจำนวน' },
];

// seed items are protected — no delete allowed
const SEED_IDS = new Set(PAYROLL_EMPLOYMENT_TYPE_SEED.map((e) => e.id));


// ── form state ────────────────────────────────────────────────────────────────

type EmpForm = {
  code: string;
  nameTh: string;
  nameEn: string;
  payType: string;
  paidPublicHoliday: boolean;
  paidHourly: boolean;
  calcConditions: CalcConditionConfig[];
  active: boolean;
};

const BLANK_FORM: EmpForm = {
  code: '',
  nameTh: '',
  nameEn: '',
  payType: 'monthly',
  paidPublicHoliday: true,
  paidHourly: false,
  calcConditions: defaultCalcConditions(),
  active: true,
};

function empToForm(emp: PayrollEmploymentType): EmpForm {
  return {
    code: emp.code,
    nameTh: emp.nameTh,
    nameEn: emp.nameEn,
    payType: emp.payType,
    paidPublicHoliday: emp.paidPublicHoliday,
    paidHourly: emp.paidHourly,
    calcConditions: structuredClone(emp.calcConditions),
    active: emp.active,
  };
}

// ── main component ────────────────────────────────────────────────────────────

export function PayrollEmploymentTypes({ accent: _accent }: { accent: string }) {
  const [types, setTypes]           = useState<PayrollEmploymentType[]>([]);
  const [panelMode, setPanelMode]   = useState<'idle' | 'create' | 'edit'>('idle');
  const [editingId, setEditingId]   = useState<string | null>(null);
  const [form, setForm]             = useState<EmpForm>(BLANK_FORM);
  const [condTab, setCondTab]       = useState<CalcConditionKey>('overtime');
  const [deleteId, setDeleteId]     = useState<string | null>(null);
  const [toast, setToast]           = useState('');
  const nameRef = useRef<HTMLInputElement>(null);

  const isMounted = useRef(true);
  useEffect(() => { isMounted.current = true; return () => { isMounted.current = false; }; }, []);

  useEffect(() => {
    publicApiFetch<PayrollEmploymentType[]>('/api/humansource/payroll/employment-types')
      .then((r) => { if (isMounted.current) setTypes(r.length ? r : structuredClone(PAYROLL_EMPLOYMENT_TYPE_SEED)); })
      .catch(() => { if (isMounted.current) setTypes(structuredClone(PAYROLL_EMPLOYMENT_TYPE_SEED)); });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(''), 2400);
    return () => window.clearTimeout(t);
  }, [toast]);

  // Focus name field when panel opens
  useEffect(() => {
    if (panelMode !== 'idle') window.setTimeout(() => nameRef.current?.focus(), 80);
  }, [panelMode]);

  // Reset tab to overtime when paidHourly forces single-tab
  useEffect(() => {
    if (form.paidHourly) setCondTab('overtime');
  }, [form.paidHourly]);

  const patchForm = (next: Partial<EmpForm>) => setForm((f) => ({ ...f, ...next }));

  const patchCond = (key: CalcConditionKey, next: Partial<CalcConditionConfig>) =>
    patchForm({
      calcConditions: form.calcConditions.map((c) => c.key === key ? { ...c, ...next } : c),
    });

  const patchOtRate = (id: string, multiplier: number) => {
    const cond = form.calcConditions.find((c) => c.key === 'overtime');
    if (!cond) return;
    patchCond('overtime', {
      otRates: cond.otRates.map((r) => r.id === id ? { ...r, multiplier } : r),
    });
  };

  const openCreate = () => {
    setForm({ ...BLANK_FORM, calcConditions: defaultCalcConditions() });
    setEditingId(null);
    setCondTab('overtime');
    setPanelMode('create');
  };

  const openEdit = (emp: PayrollEmploymentType) => {
    setForm(empToForm(emp));
    setEditingId(emp.id);
    setCondTab('overtime');
    setPanelMode('edit');
  };

  const closePanel = () => { setPanelMode('idle'); setEditingId(null); };

  const handleSave = async () => {
    if (!form.nameTh.trim() || !form.code.trim()) return;
    const dto = {
      code: form.code.trim().toUpperCase(),
      nameTh: form.nameTh.trim(),
      nameEn: form.nameEn.trim(),
      payType: form.payType,
      paidPublicHoliday: form.paidPublicHoliday,
      paidHourly: form.paidHourly,
      calcConditions: form.calcConditions,
      active: form.active,
    };
    if (panelMode === 'create') {
      const created = await publicApiFetch<PayrollEmploymentType>('/api/humansource/payroll/employment-types', { method: 'POST', body: JSON.stringify(dto) });
      setTypes((prev) => [...prev, created]);
      setEditingId(created.id);
      setPanelMode('edit');
      setToast('เพิ่มประเภทการจ้างแล้ว');
    } else if (editingId) {
      const updated = await publicApiFetch<PayrollEmploymentType>(`/api/humansource/payroll/employment-types/${editingId}`, { method: 'PATCH', body: JSON.stringify(dto) });
      setTypes((prev) => prev.map((t) => t.id === editingId ? updated : t));
      setToast('บันทึกการแก้ไขแล้ว');
    }
  };

  const handleDelete = async (id: string) => {
    await publicApiFetch(`/api/humansource/payroll/employment-types/${id}`, { method: 'DELETE' });
    setTypes((prev) => prev.filter((t) => t.id !== id));
    setDeleteId(null);
    if (editingId === id) closePanel();
    setToast('ลบประเภทการจ้างแล้ว');
  };

  const visibleTabs  = visibleCalcConditions({ paidHourly: form.paidHourly, calcConditions: form.calcConditions });
  const currentCond  = form.calcConditions.find((c) => c.key === condTab);
  const payTypeLabel = (v: string) => PAY_TYPE_OPTIONS.find((o) => o.value === v)?.label ?? v;

  if (!types.length) return null;

  return (
    <div className="hr-payroll-page hr-emptype-page">
      {/* ── master / detail ────────────────────────────────────────────────── */}
      <div className="hr-emptype-layout">

        {/* ── left: list ── */}
        <div className="hr-emptype-list">
          {/* add button — full-width, top of list */}
          <button type="button" className="hr-emptype-add-btn" onClick={openCreate}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            เพิ่มประเภทการจ้าง
          </button>
          <div className="hr-emptype-list__hd">ประเภทการจ้าง ({types.length})</div>
          {types.length === 0 && (
            <div className="hr-emptype-list__empty">ยังไม่มีประเภทการจ้าง</div>
          )}
          {types.map((emp) => (
            <div
              key={emp.id}
              className="hr-emptype-list__item"
              data-active={editingId === emp.id && panelMode === 'edit' ? 'true' : 'false'}
              onClick={() => openEdit(emp)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && openEdit(emp)}
            >
              <div className="hr-emptype-list__row">
                <span className="hr-emptype-list__name">{emp.nameTh}</span>
                {!SEED_IDS.has(emp.id) && (
                  <button
                    type="button"
                    className="hr-emptype-list__del"
                    onClick={(e) => { e.stopPropagation(); setDeleteId(emp.id); }}
                    aria-label={`ลบ ${emp.nameTh}`}
                    title={`ลบ ${emp.nameTh}`}
                  >
                    <TrashIcon className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <div className="hr-emptype-list__meta">
                <span className="hr-emptype-list__code">{emp.code}</span>
                <span className="hr-emptype-list__paytype">{payTypeLabel(emp.payType)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ── right: detail ── */}
        <div className="hr-emptype-detail">
          {panelMode === 'idle' ? (
            <div className="hr-emptype-idle">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <rect x="2" y="7" width="20" height="14" rx="2" />
                <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                <line x1="12" y1="12" x2="12" y2="16" />
                <line x1="10" y1="14" x2="14" y2="14" />
              </svg>
              <p className="hr-emptype-idle__title">เลือกประเภทการจ้างเพื่อแก้ไข</p>
              <p className="hr-emptype-idle__sub">หรือกด &ldquo;+ สร้างประเภทการจ้าง&rdquo; เพื่อเพิ่มใหม่</p>
            </div>
          ) : (
            <div className="hr-emptype-form">
              {/* form header — title only */}
              <div className="hr-emptype-form__hd">
                <div>
                  <div className="hr-emptype-form__title">
                    {panelMode === 'create' ? 'เพิ่มประเภทการจ้าง' : (form.nameTh || 'แก้ไขประเภทการจ้าง')}
                  </div>
                  {form.code && panelMode === 'edit' && (
                    <div className="hr-emptype-form__sub">{form.code}</div>
                  )}
                </div>
              </div>

              {/* form body */}
              <div className="hr-emptype-form__body">

                {/* ─ ข้อมูลพื้นฐาน ─ */}
                <section className="hr-fgroup">
                  <h4 className="hr-fgroup__head">ข้อมูลพื้นฐาน</h4>
                  <div className="hr-fgrid">
                    <div className="hr-field">
                      <label className="hr-field__label">รหัสประเภท *</label>
                      <input
                        type="text"
                        value={form.code}
                        onChange={(e) => patchForm({ code: e.target.value })}
                        className="hr-field__ctrl"
                        placeholder="เช่น MONTHLY"
                        maxLength={20}
                      />
                    </div>
                    <div className="hr-field">
                      <label className="hr-field__label">ประเภทการจ่าย *</label>
                      <HrCustomSelect
                        label="ประเภทการจ่าย"
                        value={form.payType}
                        options={PAY_TYPE_OPTIONS}
                        onChange={(v) => patchForm({ payType: v })}
                      />
                    </div>
                    <div className="hr-field">
                      <label className="hr-field__label">ชื่อประเภท (ไทย) *</label>
                      <input
                        ref={nameRef}
                        type="text"
                        value={form.nameTh}
                        onChange={(e) => patchForm({ nameTh: e.target.value })}
                        className="hr-field__ctrl"
                        placeholder="เช่น รายเดือน"
                      />
                    </div>
                    <div className="hr-field">
                      <label className="hr-field__label">ชื่อประเภท (EN)</label>
                      <input
                        type="text"
                        value={form.nameEn}
                        onChange={(e) => patchForm({ nameEn: e.target.value })}
                        className="hr-field__ctrl"
                        placeholder="e.g. Monthly"
                      />
                    </div>
                  </div>
                </section>

                {/* ─ นโยบายค่าแรง ─ */}
                <section className="hr-fgroup">
                  <h4 className="hr-fgroup__head">นโยบายค่าแรง</h4>
                  <div className="hr-setrows">
                    <ToggleRow
                      label="ได้รับค่าแรงวันหยุดตามประเพณี"
                      sub="เช่น วันสงกรานต์ วันชาติ วันมาฆบูชา"
                      checked={form.paidPublicHoliday}
                      onChange={(v) => patchForm({ paidPublicHoliday: v })}
                    />
                    <ToggleRow
                      label="จ่ายเป็นรายชั่วโมง"
                      sub="เมื่อเปิด จะแสดงเฉพาะแท็บ &quot;ล่วงเวลา&quot; ในเงื่อนไขการคำนวณ"
                      checked={form.paidHourly}
                      onChange={(v) => patchForm({ paidHourly: v })}
                    />
                    <ToggleRow
                      label="สถานะใช้งาน"
                      checked={form.active}
                      onChange={(v) => patchForm({ active: v })}
                    />
                  </div>
                </section>

                {/* ─ เงื่อนไขการคำนวณ (tabs) ─ */}
                <section className="hr-fgroup">
                  <h4 className="hr-fgroup__head">เงื่อนไขการคำนวณรายได้ / รายหัก</h4>
                  <div className="hr-cond-tabs" role="tablist">
                    {visibleTabs.map((cond) => (
                      <button
                        key={cond.key}
                        type="button"
                        role="tab"
                        aria-selected={condTab === cond.key}
                        className="hr-cond-tab"
                        data-active={condTab === cond.key ? 'true' : 'false'}
                        onClick={() => setCondTab(cond.key)}
                      >
                        {CALC_CONDITION_LABELS[cond.key]}
                        {(cond.key === 'overtime' || cond.enabled) && (
                          <span className="hr-cond-tab__dot" />
                        )}
                      </button>
                    ))}
                  </div>
                  {currentCond && (
                    <CondPanel
                      cond={currentCond}
                      onPatch={(next) => patchCond(condTab, next)}
                      onPatchOtRate={patchOtRate}
                    />
                  )}
                </section>

              </div>

              {/* sticky footer — cancel + save */}
              <div className="hr-emptype-form__ft">
                <button type="button" className="hr-btn hr-btn--secondary" onClick={closePanel}>
                  ยกเลิก
                </button>
                <button
                  type="button"
                  className="hr-btn hr-btn--primary"
                  onClick={handleSave}
                  disabled={!form.nameTh.trim() || !form.code.trim()}
                >
                  {panelMode === 'create' ? 'สร้าง' : 'บันทึก'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── delete confirm modal ──────────────────────────────────────────── */}
      <div
        className="hr-modal-scrim"
        data-open={deleteId !== null ? 'true' : 'false'}
        onClick={() => setDeleteId(null)}
      >
        <div className="hr-modal" onClick={(e) => e.stopPropagation()}>
          <div className="hr-modal__body">
            <div className="hr-modal__icon" aria-hidden>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
            </div>
            <div>
              <p className="hr-modal__title">ยืนยันการลบ</p>
              <p className="hr-modal__text">
                ประเภทการจ้าง{' '}
                <b>{types.find((t) => t.id === deleteId)?.nameTh ?? ''}</b>{' '}
                จะถูกลบออกจากระบบ ดำเนินการต่อหรือไม่?
              </p>
            </div>
          </div>
          <div className="hr-modal__foot">
            <button
              type="button"
              className="hr-btn hr-btn--secondary"
              onClick={() => setDeleteId(null)}
            >
              ยกเลิก
            </button>
            <button
              type="button"
              className="hr-btn hr-btn--danger"
              onClick={() => deleteId && handleDelete(deleteId)}
            >
              ลบ
            </button>
          </div>
        </div>
      </div>

      {/* ── toast ─────────────────────────────────────────────────────────── */}
      {toast && (
        <div className="hr-toast" role="status">
          <span className="hr-toast__check" aria-hidden>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </span>
          {toast}
        </div>
      )}
    </div>
  );
}

// ── sub-components ────────────────────────────────────────────────────────────

function ToggleRow({
  label,
  sub,
  checked,
  onChange,
}: {
  label: string;
  sub?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="hr-setrow">
      <span>
        <span className="hr-setrow__label">{label}</span>
        {sub && (
          <span
            className="hr-setrow__sub"
            style={{ display: 'block' }}
            dangerouslySetInnerHTML={{ __html: sub }}
          />
        )}
      </span>
      <span className="hr-setrow__control">
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          aria-label={label}
          className="hr-toggle"
          onClick={() => onChange(!checked)}
        >
          <span className="hr-toggle__thumb" />
        </button>
      </span>
    </div>
  );
}

function CondPanel({
  cond,
  onPatch,
  onPatchOtRate,
}: {
  cond: CalcConditionConfig;
  onPatch: (next: Partial<CalcConditionConfig>) => void;
  onPatchOtRate: (id: string, mult: number) => void;
}) {
  return (
    <div className="hr-cond-panel" role="tabpanel">

      {/* enable toggle — all except overtime */}
      {cond.key !== 'overtime' && (
        <div className="hr-setrows">
          <ToggleRow
            label="เปิดใช้งานเงื่อนไขนี้"
            checked={cond.enabled}
            onChange={(v) => onPatch({ enabled: v })}
          />
        </div>
      )}

      {/* ── overtime ── */}
      {cond.key === 'overtime' && (
        <>
          <p className="hr-cond-panel__note">
            เงื่อนไขล่วงเวลาบังคับเปิดเสมอสำหรับทุกประเภทการจ้าง
          </p>
          <div className="hr-setrows">
            <ToggleRow
              label="คำนวณค่าล่วงเวลาแบบเหมา"
              sub="คิดเป็นจำนวนเงินคงที่ แทนการคิดตามอัตรา × ชั่วโมง"
              checked={cond.calcOtFlat}
              onChange={(v) => onPatch({ calcOtFlat: v })}
            />
            <ToggleRow
              label="กำหนดเงื่อนไขวันหยุดตามประเพณี"
              sub="นำวันหยุดตามประเพณีมาประกอบการคำนวณ OT"
              checked={cond.restrictPublicHoliday}
              onChange={(v) => onPatch({ restrictPublicHoliday: v })}
            />
          </div>
          <div className="hr-cond-panel__block">
            <p className="hr-cond-panel__block-label">อัตราค่าล่วงเวลา</p>
            <table className="hr-ot-table">
              <thead>
                <tr>
                  <th>รายการ</th>
                  <th>อัตรา</th>
                </tr>
              </thead>
              <tbody>
                {(cond.otRates ?? []).map((r) => (
                  <tr key={r.id}>
                    <td>{r.label}</td>
                    <td>
                      <div className="hr-ot-rate-cell">
                        <input
                          type="number"
                          className="hr-ot-rate-input"
                          value={r.multiplier}
                          min={0.5}
                          max={10}
                          step={0.5}
                          onChange={(e) =>
                            onPatchOtRate(r.id, parseFloat(e.target.value) || 0)
                          }
                        />
                        <span className="hr-ot-rate-suffix">× เท่า</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ── late / absent / missed-punch ── */}
      {(cond.key === 'late' ||
        cond.key === 'absent' ||
        cond.key === 'missed-punch') &&
        cond.enabled && (
          <div className="hr-cond-panel__fields">
            <div className="hr-field">
              <label className="hr-field__label">วิธีการหัก</label>
              <HrCustomSelect
                label="วิธีการหัก"
                value={cond.deductMode}
                options={DEDUCT_MODE_OPTIONS}
                onChange={(v) => onPatch({ deductMode: v as DeductMode })}
              />
            </div>
            {cond.deductMode !== 'none' && (
              <div className="hr-field">
                <label className="hr-field__label">จำนวนวันที่หักต่อครั้ง</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="number"
                    className="hr-setrow__num"
                    value={cond.deductDays}
                    min={0}
                    max={5}
                    step={0.5}
                    onChange={(e) =>
                      onPatch({ deductDays: parseFloat(e.target.value) || 0 })
                    }
                  />
                  <span className="hr-setrow__unit">วัน</span>
                </div>
              </div>
            )}
          </div>
        )}

      {/* ── early-leave ── */}
      {cond.key === 'early-leave' && cond.enabled && (
        <div className="hr-cond-panel__fields">
          <div className="hr-field">
            <label className="hr-field__label">วิธีการหัก</label>
            <HrCustomSelect
              label="วิธีการหัก"
              value={cond.deductMode}
              options={DEDUCT_MODE_OPTIONS}
              onChange={(v) => onPatch({ deductMode: v as DeductMode })}
            />
          </div>
          <div className="hr-field">
            <label className="hr-field__label">วิธีคิดค่าหัก</label>
            <HrCustomSelect
              label="วิธีคิดค่าหัก"
              value={cond.calcBy}
              options={CALC_BY_OPTIONS}
              onChange={(v) => onPatch({ calcBy: v as CalcByMode })}
            />
          </div>
        </div>
      )}

      {/* ── break-status ── */}
      {cond.key === 'break-status' && cond.enabled && (
        <div className="hr-setrows">
          {/* เมื่อออกก่อนเวลาพัก หรือเข้างานสาย */}
          <div className="hr-setrow">
            <span className="hr-setrow__label">เมื่อออกก่อนเวลาพัก หรือเข้างานสาย</span>
            <span className="hr-setrow__control" style={{ minWidth: '11rem' }}>
              <HrCustomSelect
                label="วิธีการหัก"
                value={cond.breakLateMode}
                options={BREAK_LATE_OPTIONS}
                onChange={(v) => onPatch({ breakLateMode: v as DeductMode })}
              />
            </span>
          </div>

          {/* เมื่อลืมลงเวลาออก/เข้างานในช่วงพัก */}
          <div className="hr-setrow">
            <span className="hr-setrow__label">
              เมื่อลืมลงเวลาออกหรือเข้างานในช่วงพัก (อย่างใดอย่างหนึ่ง) หักเงินวันละ:
              <span style={{ color: '#ef4444', marginLeft: '0.2rem' }}>*</span>
            </span>
            <span className="hr-setrow__control">
              <span className="hr-setrow__unit">฿</span>
              <input
                type="number"
                className="hr-setrow__num"
                value={cond.breakMissedPunchAmount}
                min={0}
                step={1}
                onChange={(e) => onPatch({ breakMissedPunchAmount: parseFloat(e.target.value) || 0 })}
              />
            </span>
          </div>

          {/* เมื่อไม่มีการลงเวลาในช่วงพัก */}
          <div className="hr-setrow">
            <span className="hr-setrow__label">
              เมื่อไม่มีการลงเวลาในช่วงพัก หักเงินวันละ:
              <span style={{ color: '#ef4444', marginLeft: '0.2rem' }}>*</span>
            </span>
            <span className="hr-setrow__control">
              <span className="hr-setrow__unit">฿</span>
              <input
                type="number"
                className="hr-setrow__num"
                value={cond.breakNoRecordAmount}
                min={0}
                step={1}
                onChange={(e) => onPatch({ breakNoRecordAmount: parseFloat(e.target.value) || 0 })}
              />
            </span>
          </div>

          <ToggleRow
            label="นำส่งภาษีเงินได้"
            checked={cond.breakTaxable}
            onChange={(v) => onPatch({ breakTaxable: v })}
          />
          <ToggleRow
            label="ตั้งค่าประเภทเงินได้เฉพาะประเภทการจ้างนี้"
            checked={cond.breakCustomIncomeType}
            onChange={(v) => onPatch({ breakCustomIncomeType: v })}
          />
        </div>
      )}

    </div>
  );
}

// re-export for test convenience
export { ALL_CALC_CONDITION_KEYS };

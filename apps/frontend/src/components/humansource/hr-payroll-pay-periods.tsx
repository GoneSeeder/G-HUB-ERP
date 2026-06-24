'use client';

// 3.3 กำหนดงวด — Pay period configs + 12-month generation per employment type.
// Modal UI adapted from empeo reference: chip type selector, card frequency selector,
// radio pay-day selector (EOM / same-month / next-month).

import { useEffect, useState, type ReactNode } from 'react';
import { HrDatePicker } from './hr-ui';
import { payrollKey } from '@/data/humansource/payroll-common';
import {
  PAY_PERIOD_CONFIGS_STORAGE_BASE,
  GENERATED_PERIODS_STORAGE_BASE,
  generatePeriods,
  type GeneratedPeriod,
  type PayFrequency,
  type PayPeriodConfig,
} from '@/data/humansource/payroll-pay-periods';
import {
  PAYROLL_EMPLOYMENT_TYPES_STORAGE_BASE,
  PAYROLL_EMPLOYMENT_TYPE_SEED,
  type PayrollEmploymentType,
} from '@/data/humansource/payroll-employment-types';
import {
  PAYROLL_GENERAL_STORAGE_BASE,
  PAYROLL_GENERAL_SEED,
  type PayrollGeneralConfig,
  type PayrollDayAnchor,
} from '@/data/humansource/payroll-general';
import { THAI_HOLIDAY_SEED } from '@/data/humansource/thailand-holidays';

// ── storage keys ───────────────────────────────────────────────────────────────

const CONFIGS_KEY   = payrollKey(PAY_PERIOD_CONFIGS_STORAGE_BASE, 'global');
const PERIODS_KEY   = payrollKey(GENERATED_PERIODS_STORAGE_BASE, 'global');
const EMP_TYPES_KEY = payrollKey(PAYROLL_EMPLOYMENT_TYPES_STORAGE_BASE, 'global');
const GENERAL_KEY   = payrollKey(PAYROLL_GENERAL_STORAGE_BASE, 'global');

// ── helpers ────────────────────────────────────────────────────────────────────

function anchorLabel(a: PayrollDayAnchor): string {
  return a === 'EOM' ? 'สิ้นเดือน' : `วันที่ ${a}`;
}

function buildHolidaySet(year: number): Set<string> {
  return new Set((THAI_HOLIDAY_SEED[year] ?? []).map((r) => r.date));
}

// วันที่เริ่มงวดแรกของปี — derived purely from 3.1's cycleStartDay (single source of truth).
// January always has 31 days, so a numeric anchor maps straight to that day.
function firstPeriodStartIso(year: number, cycleStartDay: PayrollDayAnchor): string {
  const day = cycleStartDay === 'EOM' ? 31 : Math.min(cycleStartDay, 31);
  return `${year}-01-${String(day).padStart(2, '0')}`;
}

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch { /* corrupt */ }
  return fallback;
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const months = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
  return `${d} ${months[m - 1]} ${y}`;
}

// ── frequency card definitions ─────────────────────────────────────────────────

type FreqCard = { value: PayFrequency | null; label: string; sub: string; available: boolean };
const FREQ_CARDS: FreqCard[] = [
  { value: 'monthly', label: 'เดือนละ 1 งวด', sub: '12 งวด/ปี', available: true },
  { value: null, label: 'เดือนละ 2 งวด', sub: '24 งวด/ปี', available: false },
  { value: null, label: 'เดือนละ 3 งวด', sub: '36 งวด/ปี', available: false },
  { value: null, label: 'สัปดาห์ละงวด', sub: '52 งวด/ปี', available: false },
];

// ── pay-day form type ──────────────────────────────────────────────────────────

type PayDayType = 'eom' | 'same-month' | 'next-month';

type PeriodForm = {
  year: number;
  employmentTypeIds: string[];
  frequency: PayFrequency;
  payDayType: PayDayType;
  payDayNum: number;           // 1..28 when type !== 'eom'
  payBeforeIfHoliday: boolean;
  hasOffCycle: boolean;
  offCycleStart: string;
};

function blankForm(_empTypes: PayrollEmploymentType[]): PeriodForm {
  return {
    year: 2026,
    employmentTypeIds: [],
    frequency: 'monthly',
    payDayType: 'eom',
    payDayNum: 25,
    payBeforeIfHoliday: true,
    hasOffCycle: false,
    offCycleStart: '',
  };
}

function derivePayDay(form: PeriodForm): { payDayOfMonth: PayrollDayAnchor; payNextMonth: boolean } {
  if (form.payDayType === 'eom') return { payDayOfMonth: 'EOM', payNextMonth: false };
  return {
    payDayOfMonth: Math.max(1, Math.min(28, form.payDayNum)),
    payNextMonth: form.payDayType === 'next-month',
  };
}

// ── main component ─────────────────────────────────────────────────────────────

export function PayrollPayPeriods(_props: { accent: string }) {
  const [configs, setConfigs]         = useState<PayPeriodConfig[]>([]);
  const [periods, setPeriods]         = useState<GeneratedPeriod[]>([]);
  const [empTypes, setEmpTypes]       = useState<PayrollEmploymentType[]>(PAYROLL_EMPLOYMENT_TYPE_SEED);
  const [generalConfig, setGeneral]   = useState<PayrollGeneralConfig>(PAYROLL_GENERAL_SEED);
  const [hydrated, setHydrated]       = useState(false);

  const [modalOpen, setModalOpen]     = useState(false);
  const [form, setForm]               = useState<PeriodForm>(() => blankForm(PAYROLL_EMPLOYMENT_TYPE_SEED));
  const [expandedId, setExpandedId]   = useState<string | null>(null);
  const [deleteId, setDeleteId]       = useState<string | null>(null);

  useEffect(() => {
    const loadedEmp = loadJSON<PayrollEmploymentType[]>(EMP_TYPES_KEY, PAYROLL_EMPLOYMENT_TYPE_SEED);
    const loadedGen = loadJSON<PayrollGeneralConfig>(GENERAL_KEY, PAYROLL_GENERAL_SEED);
    setEmpTypes(loadedEmp);
    setGeneral(loadedGen);
    setConfigs(loadJSON<PayPeriodConfig[]>(CONFIGS_KEY, []));
    setPeriods(loadJSON<GeneratedPeriod[]>(PERIODS_KEY, []));
    setForm(blankForm(loadedEmp));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(CONFIGS_KEY, JSON.stringify(configs));
    window.localStorage.setItem(PERIODS_KEY, JSON.stringify(periods));
  }, [configs, periods, hydrated]);

  const patchForm = (next: Partial<PeriodForm>) => setForm((f) => ({ ...f, ...next }));

  function openModal() {
    setForm(blankForm(empTypes));
    setModalOpen(true);
  }

  function handleSave() {
    const id = `ppc-${Date.now()}`;
    const { payDayOfMonth, payNextMonth } = derivePayDay(form);
    const newConfig: PayPeriodConfig = {
      id,
      year: form.year,
      employmentTypeIds: form.employmentTypeIds,
      frequency: form.frequency,
      firstPeriodStart: firstPeriodStartIso(form.year, generalConfig.cycleStartDay),
      payDayOfMonth,
      payNextMonth,
      payBeforeIfHoliday: form.payBeforeIfHoliday,
      hasOffCycle: form.hasOffCycle,
      offCycleStart: form.hasOffCycle && form.offCycleStart ? form.offCycleStart : null,
    };
    const newPeriods = generatePeriods(newConfig, generalConfig, buildHolidaySet(form.year));
    setConfigs((prev) => [...prev, newConfig]);
    setPeriods((prev) => [...prev, ...newPeriods]);
    setModalOpen(false);
    setExpandedId(id);
  }

  function handleDelete(id: string) {
    setConfigs((prev) => prev.filter((c) => c.id !== id));
    setPeriods((prev) => prev.filter((p) => p.configId !== id));
    if (expandedId === id) setExpandedId(null);
    setDeleteId(null);
  }

  const empTypeMap = new Map(empTypes.map((e) => [e.id, e]));
  const payDayLabel = (() => {
    if (form.payDayType === 'eom') return 'สิ้นเดือน (EOM)';
    const suffix = form.payDayType === 'next-month' ? 'เดือนถัดไป' : 'เดือนเดียวกัน';
    return `วันที่ ${form.payDayNum} ${suffix}`;
  })();

  function toggleEmpType(id: string) {
    setForm((f) => ({
      ...f,
      employmentTypeIds: f.employmentTypeIds.includes(id)
        ? f.employmentTypeIds.filter((x) => x !== id)
        : [...f.employmentTypeIds, id],
    }));
  }

  return (
    <div className="hr-payroll-page hr-period-page">
      {/* toolbar */}
      <div className="hr-period-toolbar">
        <h3 className="hr-period-toolbar__title">กำหนดงวดเงินเดือน</h3>
        <button type="button" className="hr-btn hr-btn--primary hr-btn--sm" onClick={openModal}>
          <PlusIcon />
          สร้างงวดใหม่
        </button>
      </div>

      {/* table / empty */}
      {configs.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="hr-tablewrap">
          <table className="hr-tbl">
            <thead>
              <tr>
                <th>ปี</th>
                <th>ประเภทการจ้าง</th>
                <th>ความถี่</th>
                <th>วันที่จ่าย</th>
                <th>จ่ายก่อนวันหยุด</th>
                <th>จำนวนงวด</th>
                <th className="hr-col-actions">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {configs.map((cfg) => {
                const emp        = empTypeMap.get(cfg.employmentTypeId);
                const cfgPeriods = periods.filter((p) => p.configId === cfg.id);
                const isExpanded = expandedId === cfg.id;
                const payLabel   = cfg.payNextMonth
                  ? `${anchorLabel(cfg.payDayOfMonth)} (เดือนถัดไป)`
                  : anchorLabel(cfg.payDayOfMonth);
                return (
                  <>
                    <tr key={cfg.id}>
                      <td><span className="hr-period-year">{cfg.year}</span></td>
                      <td>
                        <div className="hr-cell-name">
                          <span className="hr-cell-name__primary">{emp?.nameTh ?? cfg.employmentTypeId}</span>
                          {emp && <span className="hr-cell-code">{emp.code}</span>}
                        </div>
                      </td>
                      <td>
                        <span className="hr-pill hr-pill--green">
                          <span className="hr-pill__dot" />รายเดือน
                        </span>
                      </td>
                      <td>{payLabel}</td>
                      <td>
                        {cfg.payBeforeIfHoliday
                          ? <span className="hr-pill hr-pill--green"><span className="hr-pill__dot" />เปิด</span>
                          : <span className="hr-pill hr-pill--slate"><span className="hr-pill__dot" />ปิด</span>}
                      </td>
                      <td><span className="hr-cell-num">{cfgPeriods.length}/12</span></td>
                      <td>
                        <div className="hr-rowactions">
                          <button
                            type="button" className="hr-iconbtn"
                            title={isExpanded ? 'ซ่อนรายละเอียด' : 'ดูรายละเอียด 12 งวด'}
                            aria-label={isExpanded ? 'ซ่อน' : 'ดูรายละเอียด'}
                            onClick={() => setExpandedId(isExpanded ? null : cfg.id)}
                          >
                            <ChevronIcon up={isExpanded} />
                          </button>
                          <button
                            type="button" className="hr-iconbtn hr-iconbtn--danger"
                            title="ลบงวดนี้" aria-label={`ลบงวด ${cfg.year}`}
                            onClick={() => setDeleteId(cfg.id)}
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {isExpanded && cfgPeriods.length > 0 && (
                      <tr key={`${cfg.id}-detail`} className="hr-period-detail-row">
                        <td colSpan={7} className="hr-period-detail-cell">
                          <PeriodDetailTable periods={cfgPeriods} />
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* create modal */}
      {modalOpen && (
        <CreateModal
          form={form}
          empTypes={empTypes}
          generalConfig={generalConfig}
          payDayLabel={payDayLabel}
          patchForm={patchForm}
          toggleEmpType={toggleEmpType}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
        />
      )}

      {/* delete confirm */}
      {deleteId && (
        <div className="hr-leave-confirm-overlay" role="alertdialog" aria-modal aria-label="ยืนยันการลบ">
          <div className="hr-leave-confirm">
            <div className="hr-leave-confirm__head">
              <h4>ลบงวดนี้?</h4>
              <button type="button" aria-label="ปิด" onClick={() => setDeleteId(null)}>
                <CloseIcon />
              </button>
            </div>
            <div className="hr-leave-confirm__body">
              ข้อมูลงวดทั้ง 12 เดือนจะถูกลบออก ไม่สามารถกู้คืนได้
            </div>
            <div className="hr-leave-confirm__actions">
              <button type="button" className="hr-btn hr-btn--ghost hr-btn--sm" onClick={() => setDeleteId(null)}>
                ยกเลิก
              </button>
              <button type="button" className="hr-btn hr-btn--danger hr-btn--sm" onClick={() => handleDelete(deleteId)}>
                ลบ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── create modal ───────────────────────────────────────────────────────────────

function CreateModal({
  form, empTypes, generalConfig, payDayLabel, patchForm, toggleEmpType, onClose, onSave,
}: {
  form: PeriodForm;
  empTypes: PayrollEmploymentType[];
  generalConfig: PayrollGeneralConfig;
  payDayLabel: string;
  patchForm: (n: Partial<PeriodForm>) => void;
  toggleEmpType: (id: string) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  const canSave = form.employmentTypeIds.length > 0;

  const yearOptions = [2024, 2025, 2026, 2027, 2028];
  const firstStartIso = firstPeriodStartIso(form.year, generalConfig.cycleStartDay);

  return (
    <div className="hr-leave-modal-overlay" role="dialog" aria-modal aria-label="สร้างงวดเงินเดือน">
      <div className="hr-leave-modal-shell">
        {/* head */}
        <div className="hr-leave-modal-head">
          <div className="hr-leave-modal-head__lead">
            <button type="button" className="hr-leave-modal-head__back" onClick={onClose} aria-label="กลับ">
              <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
                <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
              </svg>
            </button>
            <div className="hr-leave-modal-head__title-block">
              <p className="hr-leave-modal-head__title">สร้างงวดเงินเดือน</p>
              <p className="hr-leave-modal-head__sub">กำหนดรอบการจ่ายเงินเดือน 12 งวด/ปี</p>
            </div>
          </div>
        </div>

        {/* body */}
        <div className="hr-leave-modal-body">
          <div className="hr-period-modal-content">

            {/* ── ประเภทการจ้าง multi-select chips ───────────────────── */}
            <section className="hr-fgroup">
              <h4 className="hr-fgroup__head">
                ประเภทการจ้าง <span className="hr-required">*</span>
                {form.employmentTypeIds.length > 0 && (
                  <span className="hr-period-chip-count">{form.employmentTypeIds.length} ประเภท</span>
                )}
              </h4>
              <div className="hr-period-chips">
                {empTypes.map((emp) => {
                  const active = form.employmentTypeIds.includes(emp.id);
                  return (
                    <button
                      key={emp.id}
                      type="button"
                      className={`hr-period-chip${active ? ' hr-period-chip--active' : ''}`}
                      onClick={() => toggleEmpType(emp.id)}
                      aria-pressed={active}
                    >
                      {active && <CheckIcon />}
                      {emp.nameTh}
                    </button>
                  );
                })}
              </div>
              {form.employmentTypeIds.length === 0 && (
                <p className="hr-period-chips-hint">เลือกได้มากกว่า 1 ประเภท</p>
              )}
            </section>

            {/* ── กำหนดงวดเงินเดือน ─────────────────────────────────── */}
            <section className="hr-fgroup">
              <h4 className="hr-fgroup__head">กำหนดงวดเงินเดือน</h4>

              {/* frequency cards */}
              <div className="hr-period-freq-cards">
                {FREQ_CARDS.map((card) => {
                  const active = card.available && card.value === form.frequency;
                  return (
                    <button
                      key={card.label}
                      type="button"
                      disabled={!card.available}
                      className={`hr-period-freq-card${active ? ' hr-period-freq-card--active' : ''}${!card.available ? ' hr-period-freq-card--disabled' : ''}`}
                      onClick={() => card.value && patchForm({ frequency: card.value })}
                    >
                      <CalendarGridIcon />
                      <span className="hr-period-freq-card__label">{card.label}</span>
                      <span className="hr-period-freq-card__sub">{card.sub}</span>
                      {!card.available && <span className="hr-period-freq-card__soon">เร็วๆ นี้</span>}
                    </button>
                  );
                })}
              </div>

              <div className="hr-setrows" style={{ marginTop: '1.25rem' }}>
                {/* รอบเงินเดือน — locked to 3.1 (single source of truth) */}
                <FormRow
                  label="รอบเงินเดือน"
                  sub="กำหนดจากการตั้งค่าทั่วไป (3.1) — แก้ไขรอบได้ที่หน้านั้น"
                >
                  <span className="hr-period-cycle-locked">
                    <LockIcon />
                    {anchorLabel(generalConfig.cycleStartDay)} – {anchorLabel(generalConfig.cycleEndDay)}
                  </span>
                </FormRow>
                {/* วันที่เริ่มงวดแรกของปี — derived from 3.1, read-only */}
                <FormRow label="วันที่เริ่มงวดแรกของปี" sub="คำนวณจากวันเริ่มรอบใน 3.1">
                  <span className="hr-setrow__unit">{formatDate(firstStartIso)}</span>
                </FormRow>
                {/* ปีงวด */}
                <FormRow label="ปีที่สร้างงวด" required>
                  <div className="hr-period-year-btns">
                    {yearOptions.map((y) => (
                      <button
                        key={y}
                        type="button"
                        className={`hr-period-year-btn${form.year === y ? ' hr-period-year-btn--active' : ''}`}
                        onClick={() => patchForm({ year: y })}
                      >
                        {y}
                      </button>
                    ))}
                  </div>
                </FormRow>
              </div>
            </section>

            {/* ── การจ่ายเงินเดือน ──────────────────────────────────── */}
            <section className="hr-fgroup">
              <h4 className="hr-fgroup__head">การจ่ายเงินเดือน</h4>
              <div className="hr-setrows">
                <FormRow label="วันที่จ่าย" required>
                  <div className="hr-period-payday-opts">
                    {/* EOM */}
                    <label className="hr-period-radio">
                      <input
                        type="radio" name="payDayType" value="eom"
                        checked={form.payDayType === 'eom'}
                        onChange={() => patchForm({ payDayType: 'eom' })}
                      />
                      <span className="hr-period-radio__label">จ่ายเงินวันสุดท้ายของเดือน</span>
                    </label>
                    {/* same month */}
                    <label className="hr-period-radio">
                      <input
                        type="radio" name="payDayType" value="same-month"
                        checked={form.payDayType === 'same-month'}
                        onChange={() => patchForm({ payDayType: 'same-month' })}
                      />
                      <span className="hr-period-radio__label">
                        วันที่
                        <input
                          type="number" min={1} max={28} step={1}
                          className="hr-period-day-num"
                          value={form.payDayNum}
                          disabled={form.payDayType !== 'same-month'}
                          onChange={(e) => patchForm({ payDayNum: Math.max(1, Math.min(28, Number(e.target.value))) })}
                          onClick={() => patchForm({ payDayType: 'same-month' })}
                          aria-label="วันที่จ่ายในเดือนเดียวกัน"
                        />
                        ในเดือนเดียวกัน
                      </span>
                    </label>
                    {/* next month */}
                    <label className="hr-period-radio">
                      <input
                        type="radio" name="payDayType" value="next-month"
                        checked={form.payDayType === 'next-month'}
                        onChange={() => patchForm({ payDayType: 'next-month' })}
                      />
                      <span className="hr-period-radio__label">
                        วันที่
                        <input
                          type="number" min={1} max={28} step={1}
                          className="hr-period-day-num"
                          value={form.payDayNum}
                          disabled={form.payDayType !== 'next-month'}
                          onChange={(e) => patchForm({ payDayNum: Math.max(1, Math.min(28, Number(e.target.value))) })}
                          onClick={() => patchForm({ payDayType: 'next-month' })}
                          aria-label="วันที่จ่ายในเดือนถัดไป"
                        />
                        ในเดือนถัดไป
                      </span>
                    </label>
                  </div>
                </FormRow>
                <FormRow label="">
                  <label className="hr-period-checkbox">
                    <input
                      type="checkbox"
                      checked={form.payBeforeIfHoliday}
                      onChange={(e) => patchForm({ payBeforeIfHoliday: e.target.checked })}
                    />
                    <span>หากวันจ่ายเงินตรงกับวันหยุด พนักงานจะได้รับเงินวันก่อนหน้า</span>
                  </label>
                </FormRow>
              </div>
            </section>

            {/* ── เงื่อนไขอื่น ───────────────────────────────────────── */}
            <section className="hr-fgroup">
              <h4 className="hr-fgroup__head">เงื่อนไขอื่น</h4>
              <div className="hr-setrows">
                <FormRow
                  label="มีรายจ่ายที่คำนวณนอกงวด"
                  sub="รายการที่ส่งมาหลังปิดงวด จะถูกนำไปรวมในงวดถัดไปแทนการเปิดงวดเก่า"
                >
                  <Toggle
                    checked={form.hasOffCycle}
                    onChange={(v) => patchForm({ hasOffCycle: v })}
                    label="มีรายจ่ายที่คำนวณนอกงวด"
                  />
                </FormRow>
                {form.hasOffCycle && (
                  <FormRow label="เริ่มคำนวณนอกงวดตั้งแต่วันที่" required>
                    <HrDatePicker
                      value={form.offCycleStart}
                      onChange={(iso) => patchForm({ offCycleStart: iso })}
                      label="วันที่เริ่มคำนวณนอกงวด"
                      placeholder="เลือกวันที่เริ่มต้น"
                    />
                  </FormRow>
                )}
              </div>
            </section>

            {/* ── preview note ──────────────────────────────────────── */}
            <section className="hr-fgroup hr-period-preview">
              <h4 className="hr-fgroup__head">ตัวอย่างการสร้างงวด</h4>
              <p className="hr-period-preview__note">
                ระบบจะสร้าง <strong>12 งวด</strong> รอบเงินเดือนอิงจากการตั้งค่า 3.1{' '}
                ({anchorLabel(generalConfig.cycleStartDay)} → {anchorLabel(generalConfig.cycleEndDay)})
                วันจ่าย: <strong>{payDayLabel}</strong>
                {form.payBeforeIfHoliday && ' · เลื่อนก่อนวันหยุดอัตโนมัติ'}
              </p>
            </section>

          </div>
        </div>

        {/* sticky footer */}
        <div className="hr-leave-modal-foot">
          <button type="button" className="hr-btn hr-btn--ghost" onClick={onClose}>ยกเลิก</button>
          <button type="button" className="hr-btn hr-btn--primary" disabled={!canSave} onClick={onSave}>
            สร้างงวด
          </button>
        </div>
      </div>
    </div>
  );
}

// ── period detail sub-table ───────────────────────────────────────────────────

function PeriodDetailTable({ periods }: { periods: GeneratedPeriod[] }) {
  return (
    <div className="hr-period-subtable-wrap">
      <table className="hr-period-subtable">
        <thead>
          <tr>
            <th>งวดที่</th>
            <th>ชื่องวด</th>
            <th>วันเริ่มรอบ</th>
            <th>วันสิ้นรอบ</th>
            <th>วันที่จ่าย</th>
          </tr>
        </thead>
        <tbody>
          {periods.map((p) => (
            <tr key={p.id}>
              <td className="hr-period-subtable__num">{p.index}</td>
              <td>{p.label}</td>
              <td className="hr-period-subtable__date">{formatDate(p.periodStart)}</td>
              <td className="hr-period-subtable__date">{formatDate(p.periodEnd)}</td>
              <td className="hr-period-subtable__date hr-period-subtable__payday">{formatDate(p.payDate)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── small reusable pieces ─────────────────────────────────────────────────────

function FormRow({
  label, sub, required, children,
}: {
  label: string; sub?: string; required?: boolean; children: ReactNode;
}) {
  return (
    <div className="hr-setrow">
      <span>
        <span className="hr-setrow__label">
          {label}
          {required && <span className="hr-required"> *</span>}
        </span>
        {sub && <span className="hr-setrow__sub" style={{ display: 'block' }}>{sub}</span>}
      </span>
      <span className="hr-setrow__control">{children}</span>
    </div>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label}
      className="hr-toggle" onClick={() => onChange(!checked)}>
      <span className="hr-toggle__thumb" />
    </button>
  );
}

function EmptyState() {
  return (
    <div className="hr-period-empty">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} width="36" height="36" aria-hidden>
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M8 2v4M16 2v4M3 10h18" />
      </svg>
      <p>ยังไม่มีงวดเงินเดือน</p>
      <p className="hr-period-empty__sub">กด &ldquo;สร้างงวดใหม่&rdquo; เพื่อกำหนดงวดการจ่ายเงินเดือน 12 งวด/ปี</p>
    </div>
  );
}

// calendar grid icon for frequency cards
function CalendarGridIcon() {
  return (
    <svg className="hr-period-freq-card__icon" viewBox="0 0 40 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <rect x="1" y="5" width="38" height="30" rx="3" fill="currentColor" fillOpacity=".08" stroke="currentColor" strokeOpacity=".25" strokeWidth="1.5" />
      <path d="M1 11h38" stroke="currentColor" strokeOpacity=".3" strokeWidth="1.2" />
      <path d="M13 1v8M27 1v8" stroke="currentColor" strokeOpacity=".4" strokeWidth="1.8" strokeLinecap="round" />
      {[0,1,2,3,4,5].map((i) => [0,1,2,3,4,5,6].map((j) => (
        <rect key={`${i}-${j}`} x={5 + j * 5} y={15 + i * 3.5} width="3" height="2" rx=".5"
          fill="currentColor" fillOpacity={i === 0 && j < 3 ? '.5' : '.15'} />
      )))}
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14" aria-hidden>
      <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
    </svg>
  );
}

function ChevronIcon({ up }: { up: boolean }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14" aria-hidden>
      {up
        ? <path fillRule="evenodd" d="M14.77 12.79a.75.75 0 0 1-1.06-.02L10 8.832 6.29 12.77a.75.75 0 1 1-1.08-1.04l4.25-4.5a.75.75 0 0 1 1.08 0l4.25 4.5a.75.75 0 0 1-.02 1.06Z" clipRule="evenodd" />
        : <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />}
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14" aria-hidden>
      <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193v-.443A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clipRule="evenodd" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" width="13" height="13" aria-hidden>
      <path fillRule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16" aria-hidden>
      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" width="12" height="12" aria-hidden>
      <path fillRule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z" clipRule="evenodd" />
    </svg>
  );
}

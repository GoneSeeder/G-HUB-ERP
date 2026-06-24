'use client';

// 3.1 การตั้งค่าทั่วไป (Payroll) — V2 flat settings form (fgroup + bordered setrows),
// per company, explicit save. Built on the HR Design System V2 layer.

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { HrCustomSelect } from './hr-ui';
import { payrollKey } from '@/data/humansource/payroll-common';
import {
  CURRENCY_OPTIONS,
  PAYROLL_GENERAL_SEED,
  PAYROLL_GENERAL_STORAGE_BASE,
  roundMoney,
  type PayrollDayAnchor,
  type PayrollGeneralConfig,
} from '@/data/humansource/payroll-general';

// Preset cycle options: วันที่ 1→EOM, วันที่ 2→1, ..., วันที่ 28→27
const CYCLE_PRESET_OPTIONS: { value: string; label: string; end: PayrollDayAnchor }[] = [
  { value: '1', label: 'ตั้งแต่วันที่ 1 จนถึงวันที่ EOM (สิ้นเดือน)', end: 'EOM' },
  ...Array.from({ length: 27 }, (_, i) => ({
    value: String(i + 2),
    label: `ตั้งแต่วันที่ ${i + 2} จนถึงวันที่ ${i + 1}`,
    end: (i + 1) as PayrollDayAnchor,
  })),
];

const DAY_ANCHOR_OPTIONS: { value: string; label: string }[] = [
  ...Array.from({ length: 28 }, (_, i) => ({ value: String(i + 1), label: `วันที่ ${i + 1}` })),
  { value: 'EOM', label: 'สิ้นเดือน (EOM)' },
];

function anchorToValue(anchor: PayrollDayAnchor): string {
  return anchor === 'EOM' ? 'EOM' : String(anchor);
}
function valueToAnchor(value: string): PayrollDayAnchor {
  return value === 'EOM' ? 'EOM' : Number(value);
}
function anchorLabel(anchor: PayrollDayAnchor): string {
  return anchor === 'EOM' ? 'สิ้นเดือน' : `วันที่ ${anchor}`;
}

function isPresetCycle(start: PayrollDayAnchor, end: PayrollDayAnchor): boolean {
  if (start === 1 && end === 'EOM') return true;
  if (typeof start === 'number' && start >= 2 && end === start - 1) return true;
  return false;
}

const GENERAL_GLOBAL_KEY = payrollKey(PAYROLL_GENERAL_STORAGE_BASE, 'global');

function loadConfig(): PayrollGeneralConfig {
  try {
    const raw = window.localStorage.getItem(GENERAL_GLOBAL_KEY);
    if (raw) return { ...PAYROLL_GENERAL_SEED, ...(JSON.parse(raw) as Partial<PayrollGeneralConfig>) };
  } catch {
    /* corrupt value — fall back to seed */
  }
  return PAYROLL_GENERAL_SEED;
}

export function PayrollGeneralSettings(_props: { accent: string }) {
  const [config, setConfig] = useState<PayrollGeneralConfig>(PAYROLL_GENERAL_SEED);
  const [hydrated, setHydrated] = useState(false);
  const [customCycleMode, setCustomCycleMode] = useState(false);
  const [toast, setToast] = useState('');
  const toastTimer = useRef<number | null>(null);

  // hydrate once on mount
  useEffect(() => {
    const loaded = loadConfig();
    setConfig(loaded);
    setCustomCycleMode(!isPresetCycle(loaded.cycleStartDay, loaded.cycleEndDay));
    setHydrated(true);
  }, []);

  // realtime auto-save whenever config changes after hydration
  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(GENERAL_GLOBAL_KEY, JSON.stringify(config));
    setToast('บันทึกอัตโนมัติแล้ว');
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(''), 1800);
  }, [config, hydrated]);

  const patch = (next: Partial<PayrollGeneralConfig>) => setConfig((current) => ({ ...current, ...next }));

  const crossMonth =
    typeof config.cycleStartDay === 'number' &&
    config.cycleEndDay !== 'EOM' &&
    typeof config.cycleEndDay === 'number' &&
    config.cycleEndDay <= config.cycleStartDay;

  const cyclePreview =
    `${anchorLabel(config.cycleStartDay)} ถึง ${anchorLabel(config.cycleEndDay)}` +
    (crossMonth ? ' ของเดือนถัดไป' : '');

  // Find currently selected preset value
  const selectedPreset = CYCLE_PRESET_OPTIONS.find(
    (p) => Number(p.value) === config.cycleStartDay && p.end === config.cycleEndDay,
  );
  const presetValue = selectedPreset ? selectedPreset.value : CYCLE_PRESET_OPTIONS[0].value;

  return (
    <div className="hr-payroll-page">
      <div className="hr-payroll-cols">
        {/* รอบการจ่ายเงินเดือน */}
        <section className="hr-fgroup">
          <h4 className="hr-fgroup__head">รอบการจ่ายเงินเดือน</h4>
          <div className="hr-setrows">
            <SettingRow label="รอบการจ่าย">
              <span className={customCycleMode ? 'hr-payroll-preset--disabled' : undefined}>
                <HrCustomSelect
                  label="รอบการจ่าย"
                  value={presetValue}
                  options={CYCLE_PRESET_OPTIONS}
                  onChange={(v) => {
                    if (customCycleMode) return;
                    const preset = CYCLE_PRESET_OPTIONS.find((p) => p.value === v);
                    if (preset) patch({ cycleStartDay: valueToAnchor(preset.value), cycleEndDay: preset.end });
                  }}
                />
              </span>
            </SettingRow>
            <SettingRow label="ตั้งค่าขั้นสูง" sub="กำหนดวันเริ่ม-สิ้นรอบเองแบบกำหนดเอง">
              <Toggle
                checked={customCycleMode}
                onChange={(v) => setCustomCycleMode(v)}
                label="ตั้งค่าขั้นสูง"
              />
            </SettingRow>
            {customCycleMode && (
              <>
                <SettingRow label="วันเริ่มรอบ">
                  <HrCustomSelect
                    label="วันเริ่มรอบ"
                    value={anchorToValue(config.cycleStartDay)}
                    options={DAY_ANCHOR_OPTIONS}
                    onChange={(v) => patch({ cycleStartDay: valueToAnchor(v) })}
                  />
                </SettingRow>
                <SettingRow label="วันสิ้นรอบ">
                  <HrCustomSelect
                    label="วันสิ้นรอบ"
                    value={anchorToValue(config.cycleEndDay)}
                    options={DAY_ANCHOR_OPTIONS}
                    onChange={(v) => patch({ cycleEndDay: valueToAnchor(v) })}
                  />
                </SettingRow>
              </>
            )}
            <SettingRow label="รอบปัจจุบัน">
              <span className="hr-setrow__unit">{cyclePreview}</span>
            </SettingRow>
          </div>
        </section>

        {/* อัตราสมทบประกันสังคม */}
        <section className="hr-fgroup">
          <h4 className="hr-fgroup__head">อัตราสมทบประกันสังคม</h4>
          <div className="hr-setrows">
            <SettingRow label="อัตราประกันสังคมของพนักงาน">
              <input
                type="number"
                min={0}
                step={0.01}
                value={config.ssoEmployeeRate}
                onChange={(e) => patch({ ssoEmployeeRate: Number(e.target.value) })}
                className="hr-setrow__num"
                aria-label="อัตราประกันสังคมของพนักงาน (%)"
              />
              <span className="hr-setrow__unit">%</span>
            </SettingRow>
            <SettingRow label="อัตราประกันสังคมของนายจ้าง">
              <input
                type="number"
                min={0}
                step={0.01}
                value={config.ssoEmployerRate}
                onChange={(e) => patch({ ssoEmployerRate: Number(e.target.value) })}
                className="hr-setrow__num"
                aria-label="อัตราประกันสังคมของนายจ้าง (%)"
              />
              <span className="hr-setrow__unit">%</span>
            </SettingRow>
            <SettingRow label="ฐานค่าจ้างต่ำสุด" sub="พนักงานที่ได้รับต่ำกว่านี้จะถูกคำนวณที่ฐานนี้">
              <input
                type="number"
                min={0}
                step={1}
                value={config.ssoMonthlyWageFloor}
                onChange={(e) => patch({ ssoMonthlyWageFloor: Number(e.target.value) })}
                className="hr-setrow__num"
                style={{ width: '7rem' }}
                aria-label="ฐานค่าจ้างต่ำสุดประกันสังคม (บาทต่อเดือน)"
              />
              <span className="hr-setrow__unit">บาท/เดือน</span>
            </SettingRow>
            <SettingRow label="ฐานค่าจ้างสูงสุด" sub="มีผลตั้งแต่ 1 ม.ค. 2569 — 17,500 บาท">
              <input
                type="number"
                min={0}
                step={1}
                value={config.ssoMonthlyWageCap}
                onChange={(e) => patch({ ssoMonthlyWageCap: Number(e.target.value) })}
                className="hr-setrow__num"
                style={{ width: '7rem' }}
                aria-label="ฐานค่าจ้างสูงสุดประกันสังคม (บาทต่อเดือน)"
              />
              <span className="hr-setrow__unit">บาท/เดือน</span>
            </SettingRow>
            <SettingRow label="รวม OT ในฐานคำนวณ SSO" sub="ตามกฎหมาย OT ถือเป็นค่าจ้าง">
              <Toggle
                checked={config.ssoIncludeOT}
                onChange={(v) => patch({ ssoIncludeOT: v })}
                label="รวม OT ในฐานคำนวณ SSO"
              />
            </SettingRow>
            <SettingRow label="รวมโบนัสในฐานคำนวณ SSO">
              <Toggle
                checked={config.ssoIncludeBonus}
                onChange={(v) => patch({ ssoIncludeBonus: v })}
                label="รวมโบนัสในฐานคำนวณ SSO"
              />
            </SettingRow>
            <SettingRow label="รวมเบี้ยเลี้ยง/ค่าตำแหน่งในฐานคำนวณ SSO" sub="ปิดหากบริษัทจัดเป็นค่าใช้จ่าย ไม่ใช่ค่าจ้าง">
              <Toggle
                checked={config.ssoIncludeWelfare}
                onChange={(v) => patch({ ssoIncludeWelfare: v })}
                label="รวมเบี้ยเลี้ยงในฐานคำนวณ SSO"
              />
            </SettingRow>
          </div>
        </section>

        {/* สกุลเงินและการปัดเศษ */}
        <section className="hr-fgroup">
          <h4 className="hr-fgroup__head">สกุลเงินและการปัดเศษ</h4>
          <div className="hr-setrows">
            <SettingRow label="สกุลเงิน">
              <HrCustomSelect
                label="สกุลเงิน"
                value={config.currency}
                options={CURRENCY_OPTIONS}
                onChange={(v) => patch({ currency: v })}
              />
            </SettingRow>
            <SettingRow
              label="การปัดเศษจำนวนเงิน"
              sub={`เช่น 13,000 / 30 = 433.33 → ${roundMoney(13000 / 30, config.moneyRounding).toLocaleString('th-TH')} บาท`}
            >
              <Segmented
                value={config.moneyRounding}
                options={[
                  { value: 'none', label: 'ไม่ปัดเศษ' },
                  { value: 'nearest-baht', label: 'ปัดเป็นบาทเต็ม' },
                ]}
                onChange={(v) => patch({ moneyRounding: v })}
              />
            </SettingRow>
          </div>
        </section>

        {/* นโยบายอื่น */}
        <section className="hr-fgroup">
          <h4 className="hr-fgroup__head">นโยบายอื่น</h4>
          <div className="hr-setrows">
            <SettingRow
              label="ป้องกันพนักงานเลือกโอทีผิดประเภท"
              sub="โอทีบางประเภทกำหนดให้ใช้สำหรับวันทำงานหรือวันหยุดเท่านั้น"
            >
              <Toggle
                checked={config.preventWrongOtType}
                onChange={(v) => patch({ preventWrongOtType: v })}
                label="ป้องกันพนักงานเลือกโอทีผิดประเภท"
              />
            </SettingRow>
          </div>
        </section>
      </div>

      {toast ? (
        <div className="hr-toast" role="status">
          <span className="hr-toast__check" aria-hidden>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </span>
          {toast}
        </div>
      ) : null}
    </div>
  );
}


// ─── V2 building blocks ────────────────────────────────────────────────────

function SettingRow({ label, sub, children }: { label: string; sub?: string; children: ReactNode }) {
  return (
    <div className="hr-setrow">
      <span>
        <span className="hr-setrow__label">{label}</span>
        {sub ? <span className="hr-setrow__sub" style={{ display: 'block' }}>{sub}</span> : null}
      </span>
      <span className="hr-setrow__control">{children}</span>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
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
  );
}

function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="hr-seg" role="tablist">
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={`hr-seg__btn ${active ? 'hr-seg__btn--active' : ''}`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { HrCustomSelect } from './hr-ui';

type WorkInDevice = 'gps' | 'iomo' | 'qrcode';

const COMPANY_OPTIONS = ['ใช้กับทุกบริษัท', 'G-HUB Enterprise', 'สำนักงานใหญ่ กรุงเทพ', 'สาขาเชียงใหม่'];
const WORKIN_DEVICES: Array<{ key: WorkInDevice; label: string; description: string }> = [
  { key: 'gps', label: 'GPS', description: 'กำหนดพิกัดและรัศมีสำหรับลงเวลาผ่านแอป' },
  { key: 'iomo', label: 'IOMO', description: 'ผูกเครื่องสแกนใบหน้ากับจุดลงเวลา' },
  { key: 'qrcode', label: 'QR Code Station', description: 'สร้างจุดสแกน QR สำหรับพื้นที่ทำงาน' },
];

export function AddWorkInLocationModal({ accent, onClose }: { accent: string; onClose: () => void }) {
  const [device, setDevice] = useState<WorkInDevice>('gps');
  const [active, setActive] = useState(true);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/35 px-4 py-6" onClick={onClose}>
      <div
        className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="workin-modal-title"
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-400">Work-in location</p>
            <h2 id="workin-modal-title" className="mt-0.5 text-base font-semibold text-slate-950">
              เพิ่มสถานที่เวิร์กอิน
            </h2>
            <p className="mt-1 text-xs font-normal text-slate-500">
              กำหนดสถานที่ อุปกรณ์ และเงื่อนไขที่พนักงานใช้บันทึกเวลาเข้างาน
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="ปิด"
          >
            ×
          </button>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          <section className="mb-5">
            <p className="mb-2 text-xs font-semibold text-slate-700">ประเภทอุปกรณ์</p>
            <div className="grid gap-2 sm:grid-cols-3">
              {WORKIN_DEVICES.map((item) => {
                const selected = item.key === device;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setDevice(item.key)}
                    className={`rounded-lg border p-3 text-left transition ${
                      selected ? 'bg-indigo-50' : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                    style={selected ? { borderColor: accent } : undefined}
                  >
                    <span className="block text-sm font-semibold" style={selected ? { color: accent } : undefined}>
                      {item.label}
                    </span>
                    <span className="mt-1 block text-xs font-normal leading-5 text-slate-500">
                      {item.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <BaseFields />
            {device === 'gps' ? <GpsFields /> : null}
            {device === 'iomo' ? <IomoFields /> : null}
            {device === 'qrcode' ? <QrFields /> : null}
          </div>
        </main>

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50 px-5 py-4">
          <label className="hr-shift-toggle">
            <span className="hr-shift-toggle__label">สถานะการใช้งาน</span>
            <input
              type="checkbox"
              checked={active}
              onChange={(event) => setActive(event.target.checked)}
              className="sr-only"
            />
            <span className="hr-shift-toggle__track" style={active ? { backgroundColor: accent } : undefined}>
              <span className={`hr-shift-toggle__thumb ${active ? 'hr-shift-toggle__thumb--checked' : ''}`} />
            </span>
          </label>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="hr-settings-filter">
              ยกเลิก
            </button>
            <button type="button" onClick={onClose} className="hr-settings-primary-action" style={{ backgroundColor: accent }}>
              บันทึกสถานที่
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

function BaseFields() {
  return (
    <div className="mb-4 grid gap-4 md:grid-cols-2">
      <Field label="บริษัท" required>
        <HrCustomSelect value="G-HUB Enterprise" options={COMPANY_OPTIONS} onChange={() => undefined} label="บริษัท" />
      </Field>
      <Field label="ชื่อสถานที่เวิร์กอิน" required>
        <input className="hr-shift-control" placeholder="เช่น สำนักงานใหญ่ กรุงเทพ" />
      </Field>
    </div>
  );
}

function GpsFields() {
  const [radius, setRadius] = useState(150);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Field label="พิกัดสถานที่" required hint="คัดลอกละติจูดและลองจิจูดจาก Google Maps">
        <input className="hr-shift-control" placeholder="13.7563, 100.5018" />
      </Field>
      <Field label="ระยะรัศมี" hint="กำหนดได้สูงสุด 500 เมตร">
        <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="font-medium text-slate-600">อนุญาตให้ลงเวลาในระยะ</span>
            <span className="font-semibold text-slate-950">{radius} เมตร</span>
          </div>
          <input
            type="range"
            min={50}
            max={500}
            step={25}
            value={radius}
            onChange={(event) => setRadius(Number(event.target.value))}
            className="w-full accent-indigo-600"
          />
        </div>
      </Field>
      <div className="md:col-span-2 rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3 text-xs leading-6 text-indigo-800">
        ใช้พิกัดจาก Google Maps แล้ววางในช่องพิกัด ระบบจะตรวจสอบรัศมีจากตำแหน่งพนักงานก่อนบันทึกเวลา
      </div>
    </div>
  );
}

function IomoFields() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Field label="รหัสอุปกรณ์" required>
        <input className="hr-shift-control" placeholder="IOMO-BKK-001" />
      </Field>
      <Field label="รุ่นอุปกรณ์">
        <HrCustomSelect value="IOMO Pro" options={['IOMO Pro', 'IOMO Lite', 'IOMO Mini']} onChange={() => undefined} label="รุ่นอุปกรณ์" />
      </Field>
      <Field label="ตำแหน่งติดตั้ง" className="md:col-span-2">
        <input className="hr-shift-control" placeholder="เช่น Lobby ชั้น 1 / ประตูทางเข้าโรงงาน A" />
      </Field>
      <div className="md:col-span-2 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-xs leading-6 text-blue-800">
        ตรวจสอบให้อุปกรณ์ IOMO ลงทะเบียนและเชื่อมต่อกับระบบเรียบร้อยก่อนเปิดใช้งานจริง
      </div>
    </div>
  );
}

function QrFields() {
  const [qrFormat, setQrFormat] = useState('Dynamic QR');
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Field label="รหัส Station" required>
        <input className="hr-shift-control" placeholder="QR-MAIN" />
      </Field>
      <Field label="รูปแบบรหัส">
        <HrCustomSelect
          value={qrFormat}
          options={['Instant QR (เปลี่ยนทันทีหลังสแกน)', 'Dynamic QR', 'Static QR']}
          onChange={setQrFormat}
          label="รูปแบบรหัส"
        />
      </Field>
      <Field label="อายุ QR Code" hint="ใช้กับ Dynamic QR — Instant QR จะเปลี่ยนทันทีทุกครั้งที่มีการสแกน">
        <input className="hr-shift-control" placeholder="60 วินาที" />
      </Field>
      <Field label="พื้นที่ติดตั้ง">
        <input className="hr-shift-control" placeholder="เช่น ทางเข้าหลัก / ชั้น 3" />
      </Field>
      <div className="md:col-span-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-5">
        <div className="flex flex-wrap items-center justify-center gap-5">
          <div className="grid h-28 w-28 grid-cols-5 grid-rows-5 gap-1 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
            {[
              true, true, true, false, true,
              true, false, true, false, false,
              true, true, true, true, true,
              false, true, false, true, false,
              true, false, true, true, true,
            ].map((filled, index) => (
              <span
                key={index}
                className={`rounded-sm ${filled ? 'bg-slate-950' : 'bg-transparent'}`}
              />
            ))}
          </div>
          <div className="max-w-sm text-center sm:text-left">
            <p className="text-sm font-semibold text-slate-950">Preview QR Code</p>
            <p className="mt-1 text-xs font-normal leading-5 text-slate-500">
              ตัวอย่างนี้ใช้สำหรับดูตำแหน่ง preview เท่านั้น รหัสจริงจะสร้างหลังบันทึก Station
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  hint,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={className}>
      <span className="hr-shift-field__label">
        {label}
        {required ? <span className="ml-0.5 text-rose-500">*</span> : null}
      </span>
      <span className="hr-shift-field__control">{children}</span>
      {hint ? <span className="hr-shift-field__hint">{hint}</span> : null}
    </label>
  );
}

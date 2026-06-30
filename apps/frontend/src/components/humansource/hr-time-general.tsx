'use client';

import { useState } from 'react';

export function TimeGeneralSettings() {
  const [duplicateScans, setDuplicateScans] = useState(3);
  const [duplicateWindow, setDuplicateWindow] = useState(3);
  const [partialPolicy, setPartialPolicy] = useState<'full' | 'half'>('full');

  return (
    <div className="hr-time-general">
      {/* Section 1 — Duplicate scan prevention */}
      <section className="hr-time-section">
        <header className="hr-time-section__header">
          <div>
            <h3 className="hr-time-section__title">ป้องกันการบันทึกเวลาซ้ำ</h3>
            <p className="hr-time-section__description">
              ป้องกันไม่ให้การสแกนใบหน้า / นิ้ว / QR ที่อยู่ใกล้กันเกินไป ถูกบันทึกเป็นการลงเวลาออกโดยไม่ตั้งใจ
            </p>
          </div>
        </header>
        <div className="hr-time-section__body">
          <div className="hr-setting-rows">
            <div className="hr-setting-row">
              <span className="hr-setting-row__label">ช่วงเวลาที่นับการสแกนซ้ำ</span>
              <span className="hr-setting-row__control">
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={duplicateWindow}
                  onChange={(e) => setDuplicateWindow(Number(e.target.value))}
                  className="hr-shift-control hr-setting-row__num"
                  aria-label="ช่วงเวลาที่นับการสแกนซ้ำ (นาที)"
                />
                <span className="hr-setting-row__unit">นาที</span>
              </span>
            </div>
            <div className="hr-setting-row">
              <span className="hr-setting-row__label">ข้ามการสแกนซ้ำเมื่อเกิน</span>
              <span className="hr-setting-row__control">
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={duplicateScans}
                  onChange={(e) => setDuplicateScans(Number(e.target.value))}
                  className="hr-shift-control hr-setting-row__num"
                  aria-label="ข้ามการสแกนซ้ำเมื่อเกิน (ครั้ง)"
                />
                <span className="hr-setting-row__unit">ครั้ง</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3 — Partial scan policy */}
      <section className="hr-time-section">
        <header className="hr-time-section__header">
          <div>
            <h3 className="hr-time-section__title">ถ้าสแกนนิ้วไม่ครบ</h3>
            <p className="hr-time-section__description">
              กรณีพนักงานลงเวลาไม่ครบในวันนั้น ระบบจะตัดเป็นขาดงานตามรูปแบบที่เลือก
            </p>
          </div>
        </header>
        <div className="hr-time-section__body hr-time-section__body--inline">
          <div className="hr-time-switch" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={partialPolicy === 'full'}
              onClick={() => setPartialPolicy('full')}
              className={`hr-time-switch__btn ${partialPolicy === 'full' ? 'hr-time-switch__btn--active' : ''}`}
            >
              หักเต็มวัน
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={partialPolicy === 'half'}
              onClick={() => setPartialPolicy('half')}
              className={`hr-time-switch__btn ${partialPolicy === 'half' ? 'hr-time-switch__btn--active' : ''}`}
            >
              หักครึ่งวัน
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}


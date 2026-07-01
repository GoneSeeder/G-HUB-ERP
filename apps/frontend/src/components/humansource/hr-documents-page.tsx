'use client';

import { useMemo, useState } from 'react';
import { PlusIcon, SearchIcon } from '@/components/ui/icons';
import { HrBadge } from '@/components/humansource/hr-ui';
import {
  HR_DOC_CATEGORIES,
  HR_DOC_STATUS_LABEL,
  HR_DOCS_MOCK,
  type HrDocStatus,
} from '@/data/humansource/documents';

const DOC_CREATE_OPTIONS = [
  'ใบลา',
  'ปฏิบัติงานนอกสถานที่',
  'แลกเวลาทำงาน',
  'ขอทำงานล่วงเวลา',
  'ขอสะสมเวลา',
  'ขอเอกสาร',
  'ขอเปลี่ยนกะ',
];

function statusTone(status: HrDocStatus): 'slate' | 'green' | 'amber' | 'indigo' | 'rose' {
  if (status === 'approved') return 'green';
  if (status === 'rejected') return 'rose';
  if (status === 'draft') return 'slate';
  return 'amber';
}

export function HrDocumentsPage() {
  const [activeCategory, setActiveCategory] = useState(HR_DOC_CATEGORIES[0].key);
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const row of HR_DOCS_MOCK) map.set(row.category, (map.get(row.category) ?? 0) + 1);
    return map;
  }, []);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return HR_DOCS_MOCK.filter((row) => row.category === activeCategory).filter((row) => {
      if (!q) return true;
      return (
        row.title.toLowerCase().includes(q) ||
        row.docNo.toLowerCase().includes(q) ||
        row.requesterName.toLowerCase().includes(q)
      );
    });
  }, [activeCategory, search]);

  return (
    <div className="hr-docs-page">
      <div className="hr-docs-page__header">
        <h1 className="hr-docs-page__title">เอกสารของฉัน</h1>
      </div>

      <div className="hr-docs-tabs" role="tablist">
        {HR_DOC_CATEGORIES.map((cat) => {
          const count = counts.get(cat.key) ?? 0;
          const active = cat.key === activeCategory;
          return (
            <button
              key={cat.key}
              type="button"
              role="tab"
              aria-selected={active}
              className={`hr-docs-tab${active ? ' hr-docs-tab--active' : ''}`}
              onClick={() => setActiveCategory(cat.key)}
            >
              {cat.label}
              {count > 0 && <span className="hr-docs-tab__count">{count}</span>}
            </button>
          );
        })}
      </div>

      <div className="hr-docs-toolbar">
        <label className="hr-search-field hr-docs-search">
          <SearchIcon className="hr-search-field__icon" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาเอกสาร"
            className="hr-search-field__input"
          />
        </label>

        <div className="hr-docs-create">
          <button type="button" className="hr-docs-create__btn" onClick={() => setCreateOpen((v) => !v)}>
            <PlusIcon className="h-4 w-4" />
            สร้างเอกสาร
            <span className="hr-docs-create__chevron" aria-hidden="true" />
          </button>
          {createOpen && (
            <>
              <div className="hr-docs-create__scrim" onClick={() => setCreateOpen(false)} />
              <div className="hr-docs-create__menu">
                {DOC_CREATE_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    className="hr-docs-create__item"
                    onClick={() => setCreateOpen(false)}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="hr-docs-empty">
          <div className="hr-docs-empty__icon" aria-hidden="true" />
          <p className="hr-docs-empty__text">ไม่มีข้อมูล</p>
        </div>
      ) : (
        <div className="hr-settings-table-wrap">
          <table className="hr-settings-table">
            <thead>
              <tr>
                <th>เลขที่เอกสาร</th>
                <th>รายละเอียด</th>
                <th>ผู้ยื่นคำขอ</th>
                <th>วันที่ยื่น</th>
                <th>ช่วงเวลา / รายละเอียด</th>
                <th>ผู้อนุมัติ</th>
                <th>สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="hr-docs-docno">{row.docNo}</td>
                  <td>
                    <div className="hr-docs-title">{row.title}</div>
                    <div className="hr-docs-detail">{row.detail}</div>
                  </td>
                  <td>
                    <div className="hr-docs-requester">
                      <span className="hr-docs-avatar">{row.requesterAvatar}</span>
                      {row.requesterName}
                    </div>
                  </td>
                  <td>{row.submittedDate}</td>
                  <td>{row.periodLabel}</td>
                  <td>{row.approverName}</td>
                  <td>
                    <HrBadge tone={statusTone(row.status)}>{HR_DOC_STATUS_LABEL[row.status]}</HrBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

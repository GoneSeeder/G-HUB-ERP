'use client';

import { useEffect, useMemo, useState } from 'react';
import { FolderIcon, SearchIcon, UploadIcon } from '@/components/ui/icons';
import {
  DOCUMENT_TYPES_SEED,
  describeApproval,
  type ApprovalMechanism,
  type ApprovalSteps,
  type DocumentApprovalConfig,
  type PersonApprover,
} from '@/data/humansource/approval-workflows';
import { publicApiFetch } from '@/lib/api';
import { employees } from '@/data/humansource/mock';
import { HrCustomSelect } from './hr-ui';

// Central approval module. Page 1 (this phase): per-document-type mechanism +
// step config. Page 2 (Phase 6): per-person approver map.

type ApprovalSubPage = 'documents' | 'people';

const SUB_PAGES: { value: ApprovalSubPage; label: string }[] = [
  { value: 'documents', label: 'ลำดับขั้นการอนุมัติ' },
  { value: 'people',    label: 'ผู้อนุมัติรายบุคคล' },
];

const MECHANISM_OPTIONS: { value: ApprovalMechanism; label: string }[] = [
  { value: 'position-structure', label: 'ตามโครงสร้างตำแหน่ง' },
  { value: 'per-person',         label: 'กำหนดรายบุคคล' },
];

const STEP_OPTIONS: { value: ApprovalSteps; label: string }[] = [
  { value: 1,    label: '1' },
  { value: 2,    label: '2' },
  { value: 3,    label: '3' },
  { value: 4,    label: '4' },
  { value: 5,    label: '5' },
  { value: 'hr', label: 'HR' },
];

export function ApprovalWorkflowSettings({ accent }: { accent: string }) {
  const [subPage, setSubPage] = useState<ApprovalSubPage>('documents');

  return (
    <div className="hr-approval">
      <nav className="hr-approval__subnav" aria-label="โมดูลการอนุมัติ">
        {SUB_PAGES.map((page) => (
          <button
            key={page.value}
            type="button"
            onClick={() => setSubPage(page.value)}
            className={`hr-approval__subnav-tab ${
              subPage === page.value ? 'hr-approval__subnav-tab--active' : ''
            }`}
            style={subPage === page.value ? { color: accent, borderColor: accent } : undefined}
          >
            {page.label}
          </button>
        ))}
      </nav>

      {subPage === 'documents' ? (
        <DocumentApprovalList accent={accent} />
      ) : (
        <PersonApproverMap />
      )}
    </div>
  );
}

// ─── Page 1 — Document-type approval config ────────────────────────────────

function DocumentApprovalList({ accent }: { accent: string }) {
  const [configs, setConfigs] = useState<DocumentApprovalConfig[]>(DOCUMENT_TYPES_SEED);

  useEffect(() => {
    publicApiFetch<DocumentApprovalConfig[]>('/api/humansource/approval/configs')
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const byType = new Map(data.map((c) => [c.docType, c]));
          setConfigs(DOCUMENT_TYPES_SEED.map((seed) => byType.get(seed.docType) ?? seed));
        }
      })
      .catch(() => {});
  }, []);

  const patchConfig = (docType: string, patch: { mechanism?: ApprovalMechanism; steps?: ApprovalSteps }) => {
    setConfigs((cur) => cur.map((c) => c.docType === docType ? { ...c, ...patch } : c));
    publicApiFetch(`/api/humansource/approval/configs/${docType}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    }).catch(() => {});
  };

  const setMechanism = (docType: string, mechanism: ApprovalMechanism) => patchConfig(docType, { mechanism });
  const setSteps = (docType: string, steps: ApprovalSteps) => patchConfig(docType, { steps: String(steps) as ApprovalSteps });

  return (
    <div className="hr-approval__panel">
      <p className="hr-approval__hint">
        กำหนดวิธีและจำนวนขั้นการอนุมัติของเอกสารแต่ละประเภท การลาจะอ้างอิงค่าของ
        <strong> เอกสารลางาน </strong>เป็นค่าเริ่มต้น
      </p>

      <ul className="hr-approval__list">
        {configs.map((config) => (
          <li key={config.docType} className="hr-approval__row">
            <div className="hr-approval__row-lead">
              <span className="hr-approval__icon">
                <FolderIcon className="h-4 w-4" />
              </span>
              <div className="hr-approval__row-text">
                <span className="hr-approval__row-name">{config.labelTh}</span>
                <span className="hr-approval__row-desc">{describeApproval(config)}</span>
              </div>
            </div>

            <div className="hr-approval__row-controls">
              <div className="hr-approval__control-group">
                <span className="hr-approval__control-label">กลไก</span>
                <Segmented
                  options={MECHANISM_OPTIONS}
                  value={config.mechanism}
                  onChange={(v) => setMechanism(config.docType, v)}
                  accent={accent}
                />
              </div>
              <div className="hr-approval__control-group">
                <span className="hr-approval__control-label">จำนวนขั้น</span>
                <Segmented
                  options={STEP_OPTIONS}
                  value={config.steps}
                  onChange={(v) => setSteps(config.docType, v)}
                  accent={accent}
                  compact
                />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Segmented control (generic) ───────────────────────────────────────────

function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  accent,
  compact,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  accent: string;
  compact?: boolean;
}) {
  return (
    <div className={`hr-approval-seg ${compact ? 'hr-approval-seg--compact' : ''}`} role="group">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={String(opt.value)}
            type="button"
            onClick={() => onChange(opt.value)}
            aria-pressed={active}
            className={`hr-approval-seg__btn ${active ? 'hr-approval-seg__btn--active' : ''}`}
            style={active ? { backgroundColor: accent, borderColor: accent } : undefined}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Page 2 — Person → approver map (Phase 6) ──────────────────────────────

// Only employees that are still active can act as approvers / be assigned one.
const ACTIVE_EMPLOYEES = employees.filter((e) => e.active);

function PersonApproverMap() {
  const [map, setMap] = useState<PersonApprover[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    publicApiFetch<PersonApprover[]>('/api/humansource/approval/person-approvers')
      .then((data) => { if (Array.isArray(data)) setMap(data); })
      .catch(() => {});
  }, []);

  const approverOf = (employeeId: string): string =>
    map.find((m) => m.employeeId === employeeId)?.approverId ?? '';

  const setApprover = (employeeId: string, approverId: string) => {
    const next = approverId || null;
    setMap((cur) => {
      const existing = cur.find((m) => m.employeeId === employeeId);
      if (existing) return cur.map((m) => m.employeeId === employeeId ? { ...m, approverId: next } : m);
      return [...cur, { employeeId, approverId: next }];
    });
    publicApiFetch('/api/humansource/approval/person-approvers', {
      method: 'POST',
      body: JSON.stringify({ employeeId, approverId: next }),
    }).catch(() => {});
  };

  const approverOptions = useMemo(
    () => [
      { value: '', label: '— ยังไม่กำหนด —' },
      ...ACTIVE_EMPLOYEES.map((e) => ({
        value: e.id,
        label: `${e.name} (${e.position})`,
      })),
    ],
    []
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return ACTIVE_EMPLOYEES;
    return ACTIVE_EMPLOYEES.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.code.includes(q) ||
        e.position.toLowerCase().includes(q) ||
        e.department.toLowerCase().includes(q)
    );
  }, [search]);

  const assignedCount = map.filter((m) => m.approverId).length;

  return (
    <div className="hr-approval__panel">
      <div className="hr-approval__people-toolbar">
        <p className="hr-approval__hint hr-approval__hint--inline">
          กำหนดผู้อนุมัติของพนักงานแต่ละคน — ระบบจะไต่สายตามจำนวนขั้นที่ตั้งไว้ของเอกสารที่ใช้กลไก
          “กำหนดรายบุคคล” ({assignedCount}/{ACTIVE_EMPLOYEES.length} กำหนดแล้ว)
        </p>
        <div className="hr-approval__people-actions">
          <div className="hr-approval__search">
            <SearchIcon className="h-3.5 w-3.5" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาพนักงาน…"
              className="hr-approval__search-input"
            />
          </div>
          {/* TODO: wire up real .xlsx import once backend lands */}
          <button type="button" className="hr-approval__import" disabled title="จะเปิดใช้งานเมื่อเชื่อมต่อ backend">
            <UploadIcon className="h-4 w-4" />
            นำเข้า .xlsx
          </button>
        </div>
      </div>

      <div className="hr-approval__table-wrap">
        <table className="hr-approval__table">
          <thead>
            <tr>
              <th>รหัส</th>
              <th>พนักงาน</th>
              <th>แผนก</th>
              <th>ตำแหน่ง</th>
              <th className="hr-approval__th-approver">ผู้อนุมัติ</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((employee) => (
              <tr key={employee.id}>
                <td className="hr-approval__mono">{employee.code}</td>
                <td className="hr-approval__cell-name">{employee.name}</td>
                <td>{employee.department}</td>
                <td>{employee.position}</td>
                <td className="hr-approval__cell-approver">
                  <HrCustomSelect
                    value={approverOf(employee.id)}
                    options={approverOptions.filter((o) => o.value !== employee.id)}
                    onChange={(v) => setApprover(employee.id, v)}
                    label={`ผู้อนุมัติของ ${employee.name}`}
                  />
                </td>
              </tr>
            ))}
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="hr-approval__empty">
                  ไม่พบพนักงานที่ตรงกับ “{search}”
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

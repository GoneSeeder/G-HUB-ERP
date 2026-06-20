'use client';

import { useEffect, useRef, useState } from 'react';
import { PlusIcon, EditIcon, TrashIcon, XIcon, CheckIcon } from '@/components/ui/icons';
import {
  type OrgNode,
  type OrgNodeType,
  ORG_STRUCTURE_STORAGE_KEY,
  ORG_STRUCTURE_SEED,
  addChildNode,
  findCompanyAncestor,
  findNode,
  removeNode,
  renameNode,
  reorderSiblings,
} from '@/data/humansource/org-structure';
import {
  type Branch,
  type Company,
  COMPANIES_STORAGE_KEY,
  COMPANY_SEED,
} from '@/data/humansource/companies';
import { OrgNodeDetailModal } from './hr-company-detail';

// ─── Constants ────────────────────────────────────────────────────────────────

const TYPE_META: Record<
  OrgNodeType,
  { label: string; childType: OrgNodeType | null; childUnit: string; addLabel: string }
> = {
  company:    { label: 'บริษัท', childType: 'branch',     childUnit: 'สาขา', addLabel: 'เพิ่มสาขา' },
  branch:     { label: 'สาขา',   childType: 'department', childUnit: 'ฝ่าย', addLabel: 'เพิ่มฝ่าย/แผนก' },
  department: { label: 'แผนก',   childType: 'team',       childUnit: 'ทีม',  addLabel: 'เพิ่มทีม/แผนกย่อย' },
  team:       { label: 'ทีม',    childType: 'team',       childUnit: 'ทีม',  addLabel: 'เพิ่มทีมย่อย' },
};

const DEFAULT_WORK_CONDITIONS: Company['workConditions'] = {
  payrollDay: 28,
  annualCutoffDate: 31,
  probationDays: 90,
  retirementAge: 60,
  workHoursPerDay: 8,
  lateThresholdMin: 15,
  absentThresholdMin: 240,
  currency: 'THB',
  defaultWorkShiftId: null,
  weeklyHolidays: [0, 6],
};

// ─── Component ────────────────────────────────────────────────────────────────

type Draft = { id: string; value: string; isNew: boolean; nodeType: OrgNodeType };

// ─── Drag helpers (internal) ──────────────────────────────────────────────────

/** Returns the direct parent id of targetId, or null for root-level, or undefined if not found. */
function getParentId(nodes: OrgNode[], targetId: string, parentId: string | null = null): string | null | undefined {
  for (const node of nodes) {
    if (node.id === targetId) return parentId;
    const found = getParentId(node.children, targetId, node.id);
    if (found !== undefined) return found;
  }
  return undefined;
}

/** Returns the direct children array of a given parent (null = root). */
function getSiblings(nodes: OrgNode[], parentId: string | null): OrgNode[] {
  if (parentId === null) return nodes;
  return findNode(nodes, parentId)?.children ?? [];
}

export function OrgStructureBoard({ accent }: { accent: string }) {
  const [tree, setTree] = useState<OrgNode[]>(ORG_STRUCTURE_SEED);
  const [companies, setCompanies] = useState<Company[]>(COMPANY_SEED);
  const [hydrated, setHydrated] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [draft, setDraft] = useState<Draft | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<OrgNode | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const idCounter = useRef(0);

  // Hydrate once from localStorage.
  useEffect(() => {
    try {
      const rawTree = window.localStorage.getItem(ORG_STRUCTURE_STORAGE_KEY);
      if (rawTree) {
        const parsed = JSON.parse(rawTree) as OrgNode[];
        if (Array.isArray(parsed)) setTree(parsed);
      }
    } catch { /* keep seed */ }
    try {
      const rawCo = window.localStorage.getItem(COMPANIES_STORAGE_KEY);
      if (rawCo) {
        const parsed = JSON.parse(rawCo) as Company[];
        if (Array.isArray(parsed)) setCompanies(parsed);
      }
    } catch { /* keep seed */ }
    setHydrated(true);
  }, []);

  // Persist tree on every change once hydrated.
  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(ORG_STRUCTURE_STORAGE_KEY, JSON.stringify(tree));
  }, [tree, hydrated]);

  // Persist companies on every change once hydrated.
  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(COMPANIES_STORAGE_KEY, JSON.stringify(companies));
  }, [companies, hydrated]);

  const selectedNode = selectedNodeId ? findNode(tree, selectedNodeId) : null;
  const branchOwner =
    selectedNode?.type === 'branch' ? findCompanyAncestor(tree, selectedNode.id) : null;
  const branchOwnerCompanyId =
    branchOwner ? companies.find((c) => c.orgNodeId === branchOwner.id)?.id ?? null : null;

  const isExpanded = (node: OrgNode) =>
    expanded[node.id] ?? (node.type === 'company' || node.type === 'branch');

  const toggleExpand = (id: string, current: boolean) =>
    setExpanded((m) => ({ ...m, [id]: !current }));

  const newId = () => `org-${Date.now()}-${idCounter.current++}`;

  // ─── Tree mutations ───────────────────────────────────────────────────────

  const startAddChild = (parent: OrgNode) => {
    const childType = TYPE_META[parent.type].childType;
    if (!childType) return;
    const child: OrgNode = { id: newId(), name: '', type: childType, children: [] };
    setTree((current) => addChildNode(current, parent.id, child));
    setExpanded((m) => ({ ...m, [parent.id]: true }));
    setDraft({ id: child.id, value: '', isNew: true, nodeType: childType });
  };

  const startAddCompany = () => {
    const companyNodeId = newId();
    const branchNodeId = newId();
    const hqBranch: OrgNode = { id: branchNodeId, name: 'สำนักงานใหญ่', type: 'branch', children: [] };
    const companyNode: OrgNode = { id: companyNodeId, name: '', type: 'company', children: [hqBranch] };
    setTree((current) => [...current, companyNode]);
    setExpanded((m) => ({ ...m, [companyNodeId]: true }));

    const coId = `co-${Date.now()}`;
    const newCompany: Company = {
      id: coId,
      orgNodeId: companyNodeId,
      legalNameTh: '',
      tradeName: '',
      taxId: '',
      socialSecurityCode: '',
      address: '',
      active: true,
      workConditions: { ...DEFAULT_WORK_CONDITIONS },
      branches: [
        { id: `br-${Date.now()}`, code: '', nameTh: 'สำนักงานใหญ่', isHeadOffice: true, active: true },
      ],
      signers: [],
    };
    setCompanies((cs) => [...cs, newCompany]);
    setDraft({ id: companyNodeId, value: '', isNew: true, nodeType: 'company' });
  };

  const startEdit = (node: OrgNode) =>
    setDraft({ id: node.id, value: node.name, isNew: false, nodeType: node.type });

  const commitDraft = () => {
    if (!draft) return;
    const name = draft.value.trim();
    if (!name) {
      if (draft.isNew) {
        setTree((current) => removeNode(current, draft.id));
        if (draft.nodeType === 'company') {
          setCompanies((cs) => cs.filter((c) => c.orgNodeId !== draft.id));
        }
      }
    } else {
      setTree((current) => renameNode(current, draft.id, name));
      if (draft.nodeType === 'company') {
        setCompanies((cs) =>
          cs.map((c) =>
            c.orgNodeId === draft.id
              ? { ...c, tradeName: name, legalNameTh: c.legalNameTh || name }
              : c,
          ),
        );
      }
    }
    setDraft(null);
  };

  const cancelDraft = () => {
    if (draft?.isNew) {
      setTree((current) => removeNode(current, draft.id));
      if (draft.nodeType === 'company') {
        setCompanies((cs) => cs.filter((c) => c.orgNodeId !== draft.id));
      }
    }
    setDraft(null);
  };

  const doDelete = () => {
    if (!confirmDelete) return;
    if (confirmDelete.type === 'company') {
      setCompanies((cs) => cs.filter((c) => c.orgNodeId !== confirmDelete.id));
    }
    setTree((current) => removeNode(current, confirmDelete.id));
    if (selectedNodeId === confirmDelete.id) setSelectedNodeId(null);
    setConfirmDelete(null);
  };

  // ─── Drag-to-reorder ────────────────────────────────────────────────────────

  const handleDragStart = (id: string) => setDragId(id);
  const handleDragEnd = () => { setDragId(null); setDragOverId(null); };
  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (id !== dragId) setDragOverId(id);
  };
  const handleDrop = (dropId: string) => {
    if (!dragId || dragId === dropId) { setDragId(null); setDragOverId(null); return; }
    const dragParent = getParentId(tree, dragId);
    const dropParent = getParentId(tree, dropId);
    if (dragParent === undefined || dropParent === undefined || dragParent !== dropParent) {
      setDragId(null); setDragOverId(null); return;
    }
    const siblings = getSiblings(tree, dragParent);
    const fromIdx = siblings.findIndex((n) => n.id === dragId);
    const toIdx = siblings.findIndex((n) => n.id === dropId);
    if (fromIdx !== -1 && toIdx !== -1) {
      setTree((t) => reorderSiblings(t, dragParent, fromIdx, toIdx));
    }
    setDragId(null); setDragOverId(null);
  };

  const moveNode = (nodeId: string, direction: -1 | 1) => {
    const parentId = getParentId(tree, nodeId);
    if (parentId === undefined) return;
    const siblings = getSiblings(tree, parentId);
    const idx = siblings.findIndex((n) => n.id === nodeId);
    const toIdx = idx + direction;
    if (idx === -1 || toIdx < 0 || toIdx >= siblings.length) return;
    setTree((t) => reorderSiblings(t, parentId, idx, toIdx));
  };

  // ─── Export ───────────────────────────────────────────────────────────────

  const handleExport = () => {
    const data = { orgStructure: tree, companies };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'org-structure.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // ─── Detail pane callbacks ────────────────────────────────────────────────

  const handleCompanySave = (updated: Company) => {
    setCompanies((cs) => cs.map((c) => (c.id === updated.id ? updated : c)));
    setTree((current) => renameNode(current, updated.orgNodeId, updated.tradeName || updated.legalNameTh));
  };

  const handleBranchSave = (companyId: string, branch: Branch) => {
    setCompanies((cs) =>
      cs.map((c) => {
        if (c.id !== companyId) return c;
        const idx = c.branches.findIndex((b) => b.id === branch.id || b.nameTh === selectedNode?.name);
        if (idx === -1) return { ...c, branches: [...c.branches, branch] };
        const updated = [...c.branches];
        updated[idx] = branch;
        return { ...c, branches: updated };
      }),
    );
    if (selectedNodeId && branch.nameTh) {
      setTree((current) => renameNode(current, selectedNodeId, branch.nameTh));
    }
  };

  // ─── Node click (company/branch → open fullscreen detail modal) ──────────

  const handleNodeClick = (node: OrgNode) => {
    if (node.type === 'company' || node.type === 'branch') {
      setSelectedNodeId(node.id);
    }
  };

  // ─── Tree renderer ────────────────────────────────────────────────────────

  const renderNode = (node: OrgNode, depth: number, itemIndex = 0, siblings: OrgNode[] = []) => {
    const meta = TYPE_META[node.type];
    const open = isExpanded(node);
    const editing = draft?.id === node.id;
    const hasChildren = node.children.length > 0;
    const canExpand = hasChildren || !!meta.childType;
    const isSelected = selectedNodeId === node.id;
    const isSelectable = node.type === 'company' || node.type === 'branch';
    const isDragging = dragId === node.id;
    const isDragOver = dragOverId === node.id;
    const siblingCount = siblings.length;

    return (
      <div key={node.id} className="hr-org__node" style={{ ['--i' as string]: itemIndex }}>
        <div
          className={[
            `hr-org__row hr-org__row--${node.type}`,
            isSelected ? 'hr-org__row--selected' : '',
            isSelectable && !editing ? 'hr-org__row--selectable' : '',
            isDragging ? 'hr-org__row--dragging' : '',
            isDragOver ? 'hr-org__row--drag-over' : '',
          ].join(' ')}
          onDragOver={(e) => handleDragOver(e, node.id)}
          onDrop={() => handleDrop(node.id)}
        >
          {/* Drag handle */}
          {!editing ? (
            <span
              className="hr-org__drag-handle"
              draggable
              onDragStart={() => handleDragStart(node.id)}
              onDragEnd={handleDragEnd}
              aria-hidden="true"
              title="ลาก-วางเพื่อจัดเรียง"
            >
              <GripIcon />
            </span>
          ) : (
            <span className="hr-org__drag-handle hr-org__drag-handle--placeholder" aria-hidden="true" />
          )}
          {canExpand ? (
            <button
              type="button"
              className={`hr-org__caret ${open ? 'hr-org__caret--open' : ''}`}
              onClick={() => toggleExpand(node.id, open)}
              aria-label={open ? 'ยุบ' : 'ขยาย'}
              aria-expanded={open}
            >
              <CaretIcon />
            </button>
          ) : (
            <span className="hr-org__caret hr-org__caret--leaf" aria-hidden="true" />
          )}

          <span
            className="hr-org__icon"
            aria-hidden="true"
            onClick={isSelectable && !editing ? () => handleNodeClick(node) : undefined}
          >
            <NodeIcon type={node.type} />
          </span>

          {editing ? (
            <input
              autoFocus
              className="hr-org__input"
              value={draft.value}
              onChange={(e) => setDraft({ ...draft, value: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitDraft();
                if (e.key === 'Escape') cancelDraft();
              }}
              onBlur={commitDraft}
              placeholder={`ชื่อ${meta.label}`}
            />
          ) : (
            <span
              className={`hr-org__name${isSelectable ? ' hr-org__name--clickable' : ''}`}
              onClick={isSelectable ? () => handleNodeClick(node) : undefined}
            >
              {node.name}
            </span>
          )}

          <span className="hr-org__type">{meta.label}</span>
          {hasChildren ? (
            <span className="hr-org__count">
              {node.children.length} {TYPE_META[node.children[0].type].label}
            </span>
          ) : null}

          {!editing ? (
            <span className="hr-org__actions">
              {/* Keyboard reorder */}
              {siblingCount > 1 ? (
                <>
                  <button
                    type="button"
                    className="hr-org__action hr-org__move-btn"
                    onClick={() => moveNode(node.id, -1)}
                    disabled={itemIndex === 0}
                    aria-label="เลื่อนขึ้น"
                    title="เลื่อนขึ้น"
                  >
                    <MoveUpIcon />
                  </button>
                  <button
                    type="button"
                    className="hr-org__action hr-org__move-btn"
                    onClick={() => moveNode(node.id, 1)}
                    disabled={itemIndex === siblingCount - 1}
                    aria-label="เลื่อนลง"
                    title="เลื่อนลง"
                  >
                    <MoveDownIcon />
                  </button>
                </>
              ) : null}
              {meta.childType ? (
                <button
                  type="button"
                  className="hr-org__action"
                  onClick={() => startAddChild(node)}
                  aria-label={meta.addLabel}
                  title={meta.addLabel}
                >
                  <PlusIcon className="h-3.5 w-3.5" />
                </button>
              ) : null}
              <button
                type="button"
                className="hr-org__action"
                onClick={() => startEdit(node)}
                aria-label="แก้ไขชื่อ"
                title="แก้ไขชื่อ"
              >
                <EditIcon className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                className="hr-org__action hr-org__action--danger"
                onClick={() => setConfirmDelete(node)}
                aria-label="ลบ"
                title="ลบ"
              >
                <TrashIcon className="h-3.5 w-3.5" />
              </button>
            </span>
          ) : (
            <span className="hr-org__actions">
              <button type="button" className="hr-org__action" onClick={commitDraft} aria-label="บันทึก" title="บันทึก">
                <CheckIcon className="h-3.5 w-3.5" />
              </button>
              <button type="button" className="hr-org__action" onClick={cancelDraft} aria-label="ยกเลิก" title="ยกเลิก">
                <XIcon className="h-3.5 w-3.5" />
              </button>
            </span>
          )}
        </div>

        {open ? (
          <div className="hr-org__children">
            {node.children.map((child, idx) => renderNode(child, depth + 1, idx, node.children))}
            {meta.childType ? (
              <button type="button" className="hr-org__add-row" onClick={() => startAddChild(node)}>
                <PlusIcon className="h-3.5 w-3.5" />
                {meta.addLabel}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <div className="hr-org" style={{ ['--hr-org-accent' as string]: accent }}>
      <div className="hr-org__toolbar">
        <p className="hr-org__hint">คลิกชื่อบริษัท/สาขาเพื่อแก้ไขรายละเอียด · ลากที่ ⠿ เพื่อจัดเรียง</p>
        <div className="hr-org__toolbar-actions">
          <button type="button" className="hr-org__export-btn" onClick={handleExport} title="ส่งออก JSON">
            <ExportIcon />
            ส่งออก
          </button>
          <button type="button" className="hr-org__add-company" onClick={startAddCompany}>
            <PlusIcon className="h-4 w-4" />
            เพิ่มบริษัท
          </button>
        </div>
      </div>

      <div className="hr-org__tree" role="tree">
        {tree.map((node, idx) => renderNode(node, 0, idx, tree))}
        {tree.length === 0 ? (
          <p className="hr-org__empty">ยังไม่มีบริษัท — กด &ldquo;เพิ่มบริษัท&rdquo; เพื่อเริ่มสร้างผังองค์กร</p>
        ) : null}
      </div>

      {/* Fullscreen detail modal */}
      <OrgNodeDetailModal
        selectedNode={selectedNode}
        branchOwnerCompanyId={branchOwnerCompanyId}
        companies={companies}
        onCompanySave={handleCompanySave}
        onBranchSave={handleBranchSave}
        onClose={() => setSelectedNodeId(null)}
        accent={accent}
      />

      {/* Delete confirm dialog */}
      {confirmDelete ? (
        <div className="hr-org__confirm-overlay" role="presentation" onClick={() => setConfirmDelete(null)}>
          <section
            className="hr-org__confirm"
            role="alertdialog"
            aria-modal="true"
            aria-label="ยืนยันการลบ"
            onClick={(e) => e.stopPropagation()}
          >
            <h4>ลบ{TYPE_META[confirmDelete.type].label}นี้?</h4>
            <p>
              ต้องการลบ <strong>{confirmDelete.name || 'รายการนี้'}</strong>
              {confirmDelete.children.length > 0 ? ' และหน่วยงานย่อยทั้งหมด' : ''} ใช่หรือไม่?
            </p>
            <div className="hr-org__confirm-actions">
              <button type="button" className="hr-org__confirm-cancel" onClick={() => setConfirmDelete(null)}>
                ยกเลิก
              </button>
              <button type="button" className="hr-org__confirm-danger" onClick={doDelete}>
                ยืนยันการลบ
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}

// ─── Icon helpers ─────────────────────────────────────────────────────────────

function CaretIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M7.21 5.23a.75.75 0 011.06.02L12.5 9.47a.75.75 0 010 1.06l-4.23 4.22a.75.75 0 01-1.06-1.06L10.94 10 7.19 6.29a.75.75 0 01.02-1.06z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function GripIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" width="12" height="12">
      <circle cx="5" cy="4" r="1.2" /><circle cx="5" cy="8" r="1.2" /><circle cx="5" cy="12" r="1.2" />
      <circle cx="11" cy="4" r="1.2" /><circle cx="11" cy="8" r="1.2" /><circle cx="11" cy="12" r="1.2" />
    </svg>
  );
}

function MoveUpIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" width="12" height="12">
      <path d="M8 12V4M4 7l4-4 4 4" />
    </svg>
  );
}

function MoveDownIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" width="12" height="12">
      <path d="M8 4v8M4 9l4 4 4-4" />
    </svg>
  );
}

function ExportIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" width="14" height="14">
      <path d="M8 2v8M5 7l3 3 3-3M2 12v1a1 1 0 001 1h10a1 1 0 001-1v-1" />
    </svg>
  );
}

function NodeIcon({ type }: { type: OrgNodeType }) {
  if (type === 'company') {
    return (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
        <path d="M4 17V5a1 1 0 011-1h7a1 1 0 011 1v12M13 9h2a1 1 0 011 1v7M3 17h14M7 7h2M7 10h2M7 13h2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (type === 'branch') {
    return (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
        <path d="M10 2.5c-2.8 0-5 2.1-5 4.8 0 3.4 5 9.2 5 9.2s5-5.8 5-9.2c0-2.7-2.2-4.8-5-4.8z" strokeLinejoin="round" />
        <circle cx="10" cy="7.3" r="1.8" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <circle cx="7" cy="7" r="2.2" />
      <circle cx="13.5" cy="8" r="1.8" />
      <path d="M3.5 15c0-2 1.6-3.3 3.5-3.3s3.5 1.3 3.5 3.3M11.5 14.6c.2-1.6 1.5-2.6 3-2.6 1.7 0 3 1.1 3 3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

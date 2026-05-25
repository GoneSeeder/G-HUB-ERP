'use client';

import { ChangeEvent, FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { EditIcon, PlusIcon, SearchIcon, TrashIcon, UploadIcon } from '@/components/ui/icons';
import { DataPanel, PageHeader, PageShell } from '@/components/ui/page-shell';
import { LoadingState } from '@/components/ui/loading-state';
import { useDialog } from '@/components/ui/dialog-provider';
import { apiFetch, apiUpload } from '@/lib/api';
import { preventEnterSubmit } from '@/lib/form-behavior';

const THAI_ID_BRIDGE_URL = 'http://127.0.0.1:32123';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

type MemberForm = {
  guideCode: string;
  titleTh: string;
  firstNameTh: string;
  lastNameTh: string;
  titleEn: string;
  firstNameEn: string;
  lastNameEn: string;
  phone: string;
  nickname: string;
  birthDate: string;
  nationalId: string;
  cardIssueDate: string;
  cardExpireDate: string;
  guideType: string;
  guideLicenseNo: string;
  guideLicenseExpireDate: string;
  passportNo: string;
  address: string;
  province: string;
  note: string;
  recorder: string;
  fullName: string;
  fullNameTh: string;
  guideCardNo: string;
  company: string;
  guideHo: string;
  imageUrl: string;
};

type MeResponse = {
  username: string;
  name: string;
  roles: string[];
};

type MemberItem = MemberForm & {
  id: string;
  createdAt: string;
  updatedAt: string;
};

type MembersResponse = {
  items: MemberItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

type NextGuideCodeResponse = {
  guideCode: string;
};

type AgentAliasItem = {
  id?: string;
  pattern: string;
  matchType: 'contains';
};

type AgentForm = {
  agentCode: string;
  codeCenter: string;
  name: string;
  address: string;
  nation: string;
  phone: string;
  fax: string;
  contactPerson: string;
  marketing: string;
  agentHO: string;
  typeCenter: string;
  agentType: string;
  typeGroup: string;
  navCode: string;
  email: string;
  taxId: string;
  branch: string;
  bankName: string;
  bankBranch: string;
  bankAccount: string;
  active: boolean;
  aliases: AgentAliasItem[];
};

type AgentItem = AgentForm & {
  id: string;
  createdAt: string;
  updatedAt: string;
};

type AgentsResponse = {
  items: AgentItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

type AgentImportPreviewRow = Pick<
  AgentForm,
  'agentCode' | 'name' | 'nation' | 'phone' | 'taxId' | 'contactPerson' | 'typeGroup' | 'active'
>;

type AgentImportPreviewResponse = {
  rowCount: number;
  rows: AgentImportPreviewRow[];
};

type ThaiIdBridgeResponse = {
  ok?: boolean;
  message?: string;
  cid?: string;
  titleTh?: string;
  firstNameTh?: string;
  lastNameTh?: string;
  fullNameTh?: string;
  titleEn?: string;
  firstNameEn?: string;
  lastNameEn?: string;
  fullName?: string;
  birthDate?: string;
  cardIssueDate?: string;
  cardExpireDate?: string;
  address?: string;
  imageUrl?: string;
};

type UploadImageResponse = {
  imageUrl: string;
};

const columns = [
  'รหัสไกด์',
  'Name',
  'Phone',
  'เลขบัตรประชาชน',
  'เลข Passport',
  'รหัสมัคคุเทศก์',
];

const agentColumns = [
  'Agent Code',
  'Agent Name',
  'Nation',
  'Phone',
  'Tax ID',
  'Contact',
  'TypeGroup',
  'Active Status',
];

const typeCenterOptions = [
  { value: '', label: 'Please select' },
  { value: 'CT', label: 'CHARTER' },
  { value: 'VIP', label: 'VIP' },
  { value: 'OT', label: 'OTHER' },
  { value: 'OT-TW', label: 'OTHER-TW' },
  { value: 'OT-PH', label: 'OTHER-PHILIPPINE' },
  { value: 'OT-HK', label: 'OT-HongKong' },
  { value: 'OT-VN', label: 'OTHER-VN' },
  { value: 'OT-ID', label: 'OTHER-ID' },
  { value: 'OT-MY', label: 'OTHER-Malaysia' },
  { value: 'OT-MN', label: 'OTHER-MN' },
  { value: 'OT-RU', label: 'OTHER-RU' },
  { value: 'OT-IND', label: 'OTHER-IND' },
  { value: 'OT-KR', label: 'OTHER-KR' },
  { value: 'OT-TR', label: 'OTHER-TR' },
];

const agentTypeOptions = [
  { value: '', label: 'ไม่ระบุ' },
  { value: 'AGENT', label: 'Agent' },
  { value: 'OWNER', label: 'Owner Company' },
  { value: 'TAXI', label: 'Taxi' },
];

function createEmptyForm(recorder = ''): MemberForm {
  return {
    guideCode: generateGuideCode(1),
    titleTh: '',
    firstNameTh: '',
    lastNameTh: '',
    titleEn: '',
    firstNameEn: '',
    lastNameEn: '',
    phone: '',
    nickname: '',
    birthDate: '',
    nationalId: '',
    cardIssueDate: '',
    cardExpireDate: '',
    guideType: 'Guide',
    guideLicenseNo: '',
    guideLicenseExpireDate: '',
    passportNo: '',
    address: '',
    province: '',
    note: '',
    recorder,
    fullName: '',
    fullNameTh: '',
    guideCardNo: '',
    company: '',
    guideHo: '',
    imageUrl: '',
  };
}

function createEmptyAgentForm(): AgentForm {
  return {
    agentCode: '',
    codeCenter: '',
    name: '',
    address: '',
    nation: '',
    phone: '',
    fax: '',
    contactPerson: '',
    marketing: '',
    agentHO: '',
    typeCenter: '',
    agentType: 'AGENT',
    typeGroup: '',
    navCode: '',
    email: '',
    taxId: '',
    branch: '',
    bankName: '',
    bankBranch: '',
    bankAccount: '',
    active: true,
    aliases: [],
  };
}

export default function MemberPage() {
  const { requestConfirmation } = useDialog();
  const [activeTab, setActiveTab] = useState<'guides' | 'agents'>('guides');
  const [memberEnterAnimationDone, setMemberEnterAnimationDone] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [membersLoading, setMembersLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingMember, setEditingMember] = useState<MemberItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [form, setForm] = useState<MemberForm>(() => createEmptyForm());
  const [currentUserName, setCurrentUserName] = useState('');

  useEffect(() => {
    apiFetch<MeResponse>('/api/auth/me')
      .then((me) => {
        const displayName = me.name || me.username;
        setCurrentUserName(displayName);
        setForm((current) => ({
          ...current,
          recorder: current.recorder || displayName,
        }));
      })
      .catch(() => setCurrentUserName(''));
  }, []);

  useEffect(() => {
    loadMembers();
  }, [page, search]);

  useEffect(() => {
    const timer = window.setTimeout(() => setMemberEnterAnimationDone(true), 800);
    return () => window.clearTimeout(timer);
  }, []);

  const loadMembers = () => {
    setMembersLoading(true);
    const params = new URLSearchParams({
      page: String(page),
    });
    if (search.trim()) {
      params.set('search', search.trim());
    }

    apiFetch<MembersResponse>(`/api/members?${params.toString()}`)
      .then((data) => {
        setMembers(data.items);
        setTotal(data.total);
        setTotalPages(data.totalPages);
        setSelectedId((current) =>
          current && data.items.some((member) => member.id === current)
            ? current
            : null,
        );
        setError(null);
      })
      .catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load members.');
      })
      .finally(() => {
        setMembersLoading(false);
      });
  };

  const selectedMember = members.find((member) => member.id === selectedId) ?? null;

  const switchMemberTab = (tab: 'guides' | 'agents') => {
    setMemberEnterAnimationDone(true);
    setActiveTab(tab);
  };

  const openCreate = async () => {
    setEditingMember(null);
    const nextForm = createEmptyForm(currentUserName);
    setForm(nextForm);
    setModalError(null);
    setModalLoading(true);
    setModalOpen(true);
    try {
      const next = await apiFetch<NextGuideCodeResponse>('/api/members/next-guide-code');
      setForm((current) => ({ ...current, guideCode: next.guideCode }));
    } catch {
      setForm((current) => ({ ...current, guideCode: generateGuideCode(1) }));
    } finally {
      setModalLoading(false);
    }
  };

  const openEdit = () => {
    if (!selectedMember) {
      return;
    }
    setEditingMember(selectedMember);
    setForm(toFormState(selectedMember));
    setError(null);
    setModalError(null);
    setModalOpen(true);
  };

  const onDeleteSelected = async () => {
    if (!selectedMember) {
      setError('Please select a member to delete.');
      return;
    }
    const confirmed = await requestConfirmation({
      message: `Delete member "${selectedMember.guideCode}"?`,
      variant: 'danger',
    });
    if (!confirmed) {
      return;
    }

    try {
      await apiFetch(`/api/members/${selectedMember.id}`, { method: 'DELETE' });
      setSelectedId(null);
      loadMembers();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Failed to delete member.');
    }
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>, overrideForm?: MemberForm) => {
    event.preventDefault();
    const payload = normalizeMemberPayload(overrideForm ?? form);
    setModalError(null);

    try {
      if (editingMember) {
        await apiFetch<MemberItem>(`/api/members/${editingMember.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch<MemberItem>('/api/members', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
      setModalOpen(false);
      setEditingMember(null);
      loadMembers();
    } catch (saveError) {
      setModalError(saveError instanceof Error ? saveError.message : 'Failed to save member.');
    }
  };

  return (
    <PageShell className="h-full !max-w-[1216px] gap-4 overflow-hidden">
      {activeTab === 'guides' ? (
        <PageHeader
        enterAnimation={!memberEnterAnimationDone}
        eyebrow="Master Data · Members"
        title="Members"
        description="Guide information and member profile management."
        actions={
          <>
              <button type="button" className="toolbar-btn-primary" onClick={openCreate}>
                <PlusIcon className="erp-action-icon" /> Add Guide
              </button>
              <button type="button" className="toolbar-btn disabled:bg-slate-50 disabled:text-slate-400" disabled={!selectedMember} onClick={openEdit}>
                <EditIcon className="erp-action-icon" /> Edit
              </button>
              <button type="button" className="toolbar-btn-danger disabled:bg-slate-50 disabled:text-slate-400" disabled={!selectedMember} onClick={onDeleteSelected}>
                <TrashIcon className="erp-action-icon" /> Delete
              </button>
            </>
        }
        />
      ) : null}
      {activeTab === 'guides' ? (
        <div className={`${memberEnterAnimationDone ? '' : 'erp-controls-enter '}flex shrink-0 flex-wrap items-center justify-between gap-3`}>
          <MemberTabs activeTab={activeTab} onChange={switchMemberTab} />
          <div className="flex min-w-[360px] flex-1 items-center justify-end gap-3">
            <div className="relative w-full max-w-[520px]">
              <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search guide code, name, phone, passport..."
                className="form-input rounded-md pl-11"
              />
            </div>
            <span className="shrink-0 text-sm font-light text-slate-500">{total} records</span>
          </div>
        </div>
      ) : null}

      {activeTab === 'guides' ? (
        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
      {error ? (
        <div className="rounded-md border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      ) : null}

      <DataPanel enterAnimation={!memberEnterAnimationDone} className="flex min-h-0 flex-1 flex-col">
        <div className="shrink-0 border-b border-slate-200 px-4 py-2 text-sm text-slate-400">
          Showing {members.length} of {total} items
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          <table className="w-full table-fixed border-collapse text-xs">
            <thead className="sticky top-0 z-10 bg-slate-50">
              <tr>
                <th className="w-10 border-b border-slate-200 px-4 py-2 text-left" />
                {columns.map((column) => (
                  <th
                    key={column}
                    className="border-b border-slate-200 px-3 py-2.5 text-left text-[10px] font-semibold uppercase text-slate-400"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {membersLoading ? (
                <tr>
                  <td colSpan={columns.length + 1} className="px-4 py-8">
                    <LoadingState label="Loading members..." className="min-h-[220px]" />
                  </td>
                </tr>
              ) : members.length > 0 ? (
                members.map((member) => {
                  const checked = selectedId === member.id;

                  return (
                    <tr
                      key={member.id}
                      onClick={() => setSelectedId(member.id)}
                      className={`cursor-pointer transition hover:bg-[#0752d6]/[0.07] ${
                        checked ? 'bg-sky-50' : ''
                      }`}
                    >
                      <td className="border-b border-slate-100 px-4 py-2">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => setSelectedId(checked ? null : member.id)}
                          onClick={(event) => event.stopPropagation()}
                          className="h-4 w-4 accent-[#1478ff]"
                        />
                      </td>
                      <td className="truncate border-b border-slate-100 px-3 py-2.5 font-medium text-slate-900">
                        {member.guideCode}
                      </td>
                      <td className="truncate border-b border-slate-100 px-3 py-2.5 text-slate-700">
                        {formatMemberDisplayName(member)}
                      </td>
                      <td className="truncate border-b border-slate-100 px-3 py-2.5 text-slate-700">
                        {member.phone || '-'}
                      </td>
                      <td className="truncate border-b border-slate-100 px-3 py-2.5 text-slate-700">
                        {member.nationalId || '-'}
                      </td>
                      <td className="truncate border-b border-slate-100 px-3 py-2.5 text-slate-700">
                        {member.passportNo || '-'}
                      </td>
                      <td className="truncate border-b border-slate-100 px-3 py-2.5 text-slate-700">
                        {member.guideLicenseNo || '-'}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={columns.length + 1} className="px-4 py-14 text-center text-sm text-slate-400">
                    ยังไม่มีข้อมูลสมาชิก
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 ? (
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-slate-200 px-4 py-2">
            {getPageNumbers(page, totalPages).map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                onClick={() => setPage(pageNumber)}
                className={
                  pageNumber === page
                    ? 'toolbar-btn-primary min-h-9 px-3'
                    : 'toolbar-btn min-h-9 px-3'
                }
              >
                {pageNumber}
              </button>
            ))}
          </div>
        ) : null}
      </DataPanel>

      {modalOpen ? (
        <MemberModal
          title={editingMember ? 'แก้ไขข้อมูลสมาชิก' : 'เพิ่มข้อมูลสมาชิก'}
          form={form}
          onChange={setForm}
          onClose={() => {
            setModalOpen(false);
            setEditingMember(null);
            setModalError(null);
          }}
          onSubmit={onSubmit}
          saveError={modalError}
          loading={modalLoading}
        />
      ) : null}
        </div>
      ) : (
        <AgentManagement animateEnter={!memberEnterAnimationDone} onSwitchToGuides={() => switchMemberTab('guides')} />
      )}
    </PageShell>
  );
}

function MemberTabs({
  activeTab,
  onChange,
}: {
  activeTab: 'guides' | 'agents';
  onChange: (tab: 'guides' | 'agents') => void;
}) {
  return (
    <div className="inline-flex rounded-xl border border-slate-200 bg-slate-100 p-1">
      <button
        type="button"
        onClick={() => onChange('guides')}
        className={`min-h-9 rounded-lg px-4 text-sm font-medium transition-colors ${
          activeTab === 'guides'
            ? 'bg-white text-slate-950 shadow-sm'
            : 'text-slate-600 hover:text-slate-950'
        }`}
      >
        Guides
      </button>
      <button
        type="button"
        onClick={() => onChange('agents')}
        className={`min-h-9 rounded-lg px-4 text-sm font-medium transition-colors ${
          activeTab === 'agents'
            ? 'bg-white text-slate-950 shadow-sm'
            : 'text-slate-600 hover:text-slate-950'
        }`}
      >
        Agents
      </button>
    </div>
  );
}

function AgentManagement({ animateEnter, onSwitchToGuides }: { animateEnter: boolean; onSwitchToGuides: () => void }) {
  const { requestConfirmation } = useDialog();
  const [search, setSearch] = useState('');
  const [activeStatus, setActiveStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [page, setPage] = useState(1);
  const [agents, setAgents] = useState<AgentItem[]>([]);
  const [agentsLoading, setAgentsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingAgent, setEditingAgent] = useState<AgentItem | null>(null);
  const [form, setForm] = useState<AgentForm>(() => createEmptyAgentForm());
  const [modalOpen, setModalOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importFileName, setImportFileName] = useState('');
  const [importBase64, setImportBase64] = useState('');
  const [importPreview, setImportPreview] = useState<AgentImportPreviewResponse | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  useEffect(() => {
    loadAgents();
  }, [page, search, activeStatus]);

  const loadAgents = () => {
    setAgentsLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (search.trim()) params.set('search', search.trim());
    if (activeStatus !== 'all') params.set('active', activeStatus);

    apiFetch<AgentsResponse>(`/api/agents?${params.toString()}`)
      .then((data) => {
        setAgents(data.items);
        setTotal(data.total);
        setTotalPages(data.totalPages);
        setSelectedId((current) =>
          current && data.items.some((agent) => agent.id === current) ? current : null,
        );
        setError(null);
      })
      .catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load agents.');
      })
      .finally(() => {
        setAgentsLoading(false);
      });
  };

  const selectedAgent = agents.find((agent) => agent.id === selectedId) ?? null;

  const openCreate = () => {
    setEditingAgent(null);
    setForm(createEmptyAgentForm());
    setModalError(null);
    setModalOpen(true);
  };

  const openEdit = () => {
    if (!selectedAgent) {
      return;
    }
    setEditingAgent(selectedAgent);
    setForm(toAgentFormState(selectedAgent));
    setModalError(null);
    setError(null);
    setModalOpen(true);
  };

  const deleteSelected = async () => {
    if (!selectedAgent) {
      setError('Please select an agent to delete.');
      return;
    }
    if (
      !(await requestConfirmation({
        message: `Delete agent "${selectedAgent.agentCode}"?`,
        variant: 'danger',
      }))
    ) {
      return;
    }
    try {
      await apiFetch(`/api/agents/${selectedAgent.id}`, { method: 'DELETE' });
      setSelectedId(null);
      loadAgents();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Failed to delete agent.');
    }
  };

  const submitAgent = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setModalError(null);
    const payload = normalizeAgentPayload(form);
    try {
      if (editingAgent) {
        await apiFetch<AgentItem>(`/api/agents/${editingAgent.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch<AgentItem>('/api/agents', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
      setModalOpen(false);
      setEditingAgent(null);
      loadAgents();
    } catch (saveError) {
      setModalError(saveError instanceof Error ? saveError.message : 'Failed to save agent.');
    }
  };

  const previewLegacy = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      setImportLoading(true);
      const fileBase64 = await fileToBase64(file);
      const preview = await apiFetch<AgentImportPreviewResponse>('/api/agents/import-legacy-preview', {
        method: 'POST',
        body: JSON.stringify({ fileBase64 }),
      });
      setImportFileName(file.name);
      setImportBase64(fileBase64);
      setImportPreview(preview);
      setError(null);
    } catch (importError) {
      setError(importError instanceof Error ? importError.message : 'Failed to import legacy agents.');
    } finally {
      setImportLoading(false);
    }
  };

  const confirmImportLegacy = async () => {
    if (!importBase64) {
      setError('Please choose a legacy database file first.');
      return;
    }
    try {
      setImportLoading(true);
      const result = await apiFetch<{ imported: number }>('/api/agents/import-legacy', {
        method: 'POST',
        body: JSON.stringify({ fileBase64: importBase64 }),
      });
      setError(`Imported ${result.imported} agent records.`);
      setImportOpen(false);
      setImportFileName('');
      setImportBase64('');
      setImportPreview(null);
      setPage(1);
      loadAgents();
    } catch (importError) {
      setError(importError instanceof Error ? importError.message : 'Failed to import legacy agents.');
    } finally {
      setImportLoading(false);
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
      <PageHeader
        enterAnimation={animateEnter}
        eyebrow="Master Data · Members"
        title="Members"
        description="Guide information and member profile management."
        actions={
          <>
            <button type="button" className="toolbar-btn-primary" onClick={openCreate}>
              <PlusIcon className="erp-action-icon" /> Add Agent
            </button>
            <button type="button" className="toolbar-btn disabled:bg-slate-50 disabled:text-slate-400" disabled={!selectedAgent} onClick={openEdit}>
              <EditIcon className="erp-action-icon" /> Edit
            </button>
            <button type="button" className="toolbar-btn-danger disabled:bg-slate-50 disabled:text-slate-400" disabled={!selectedAgent} onClick={deleteSelected}>
              <TrashIcon className="erp-action-icon" /> Delete
            </button>
          </>
        }
      />

      <div className={`${animateEnter ? 'erp-controls-enter ' : ''}flex shrink-0 flex-wrap items-center justify-between gap-3`}>
        <MemberTabs activeTab="agents" onChange={(tab) => {
          if (tab === 'guides') {
            onSwitchToGuides();
          }
        }} />
        <div className="flex min-w-[360px] flex-1 items-center justify-end gap-3">
          <div className="relative w-full max-w-[520px]">
            <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search agent code, name, phone, tax id..."
              className="form-input rounded-md pl-11"
            />
          </div>
          <select
            value={activeStatus}
            onChange={(event) => {
              setActiveStatus(event.target.value as 'all' | 'active' | 'inactive');
              setPage(1);
            }}
            className="form-input h-10 !w-32 rounded-md text-sm"
            aria-label="Filter active status"
          >
            <option value="all">All status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <span className="shrink-0 whitespace-nowrap text-sm font-light text-slate-500">{total} records</span>
        </div>
      </div>

      {error ? (
        <div className="rounded-md border border-sky-100 bg-sky-50 px-4 py-3 text-sm font-semibold text-[#0752d6]">
          {error}
        </div>
      ) : null}

      <DataPanel enterAnimation={animateEnter} className="flex min-h-0 flex-1 flex-col">
        <div className="shrink-0 border-b border-slate-200 px-4 py-2 text-sm text-slate-400">
          Showing {agents.length} of {total} items
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          <table className="w-full table-fixed border-collapse text-xs">
            <thead className="sticky top-0 z-10 bg-slate-50 shadow-[0_1px_0_rgba(226,232,240,1)]">
              <tr>
                <th className="w-10 border-b border-slate-200 bg-white px-4 py-2 text-left" />
                {agentColumns.map((column) => (
                  <th key={column} className="border-b border-slate-200 bg-white px-3 py-2.5 text-left text-[10px] font-semibold uppercase text-slate-400">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {agentsLoading ? (
                <tr>
                  <td colSpan={agentColumns.length + 1} className="px-4 py-8">
                    <LoadingState label="Loading agents..." className="min-h-[220px]" />
                  </td>
                </tr>
              ) : agents.length > 0 ? (
                agents.map((agent) => {
                  const checked = selectedId === agent.id;
                  return (
                    <tr
                      key={agent.id}
                      onClick={() => setSelectedId(agent.id)}
                      className={`cursor-pointer transition hover:bg-[#0752d6]/[0.07] ${checked ? 'bg-sky-50' : ''}`}
                    >
                      <td className="border-b border-slate-100 px-4 py-2">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => setSelectedId(checked ? null : agent.id)}
                          onClick={(event) => event.stopPropagation()}
                          className="h-4 w-4 accent-[#1478ff]"
                        />
                      </td>
                      <td className="truncate border-b border-slate-100 px-3 py-2.5 font-medium text-slate-900">{agent.agentCode}</td>
                      <td className="truncate border-b border-slate-100 px-3 py-2.5 text-slate-700">{agent.name || '-'}</td>
                      <td className="truncate border-b border-slate-100 px-3 py-2.5 text-slate-700">{agent.nation || '-'}</td>
                      <td className="truncate border-b border-slate-100 px-3 py-2.5 text-slate-700">{agent.phone || '-'}</td>
                      <td className="truncate border-b border-slate-100 px-3 py-2.5 text-slate-700">{agent.taxId || '-'}</td>
                      <td className="truncate border-b border-slate-100 px-3 py-2.5 text-slate-700">{agent.contactPerson || '-'}</td>
                      <td className="truncate border-b border-slate-100 px-3 py-2.5 text-slate-700">{agent.typeGroup || '-'}</td>
                      <td className="border-b border-slate-100 px-3 py-2">
                        <span className={agent.active ? 'text-emerald-700' : 'text-slate-400'}>
                          {agent.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={agentColumns.length + 1} className="px-4 py-14 text-center text-sm text-slate-400">
                    No agent records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 ? (
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-slate-200 px-4 py-2">
            {getPageNumbers(page, totalPages).map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                onClick={() => setPage(pageNumber)}
                className={pageNumber === page ? 'toolbar-btn-primary min-h-9 px-3' : 'toolbar-btn min-h-9 px-3'}
              >
                {pageNumber}
              </button>
            ))}
          </div>
        ) : null}
      </DataPanel>

      {modalOpen ? (
        <AgentModal
          title={editingAgent ? 'Edit Agent' : 'Add Agent'}
          form={form}
          onChange={setForm}
          onClose={() => {
            setModalOpen(false);
            setEditingAgent(null);
            setModalError(null);
          }}
          onSubmit={submitAgent}
          saveError={modalError}
        />
      ) : null}

      {importOpen ? (
        <AgentImportModal
          fileName={importFileName}
          preview={importPreview}
          loading={importLoading}
          onFileChange={previewLegacy}
          onImport={confirmImportLegacy}
          onClose={() => {
            setImportOpen(false);
            setImportFileName('');
            setImportBase64('');
            setImportPreview(null);
          }}
        />
      ) : null}
    </div>
  );
}

function MemberModal({
  title,
  form,
  onChange,
  onClose,
  onSubmit,
  saveError,
  loading,
}: {
  title: string;
  form: MemberForm;
  onChange: (value: MemberForm) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>, overrideForm?: MemberForm) => Promise<void>;
  saveError: string | null;
  loading?: boolean;
}) {
  const [lookupStatus, setLookupStatus] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [imageLoadFailed, setImageLoadFailed] = useState(false);

  const fullNameTh = useMemo(
    () => [form.titleTh, form.firstNameTh, form.lastNameTh].filter(Boolean).join(' '),
    [form.titleTh, form.firstNameTh, form.lastNameTh],
  );
  const fullName = useMemo(
    () => [form.titleEn, form.firstNameEn, form.lastNameEn].filter(Boolean).join(' '),
    [form.titleEn, form.firstNameEn, form.lastNameEn],
  );
  const imageSrc = form.imageUrl && !imageLoadFailed ? getImageSrc(form.imageUrl) : '';

  useEffect(() => {
    setImageLoadFailed(false);
  }, [form.imageUrl]);

  const setField = (key: keyof MemberForm, value: string) => {
    const nextForm = {
      ...form,
      [key]: value,
    };

    onChange({
      ...nextForm,
      ...(key === 'titleTh' || key === 'firstNameTh' || key === 'lastNameTh'
        ? { fullNameTh: [nextForm.titleTh, nextForm.firstNameTh, nextForm.lastNameTh].filter(Boolean).join(' ') }
        : {}),
      ...(key === 'titleEn' || key === 'firstNameEn' || key === 'lastNameEn'
        ? { fullName: [nextForm.titleEn, nextForm.firstNameEn, nextForm.lastNameEn].filter(Boolean).join(' ') }
        : {}),
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const message = validateMemberForm(form);
    if (message) {
      setValidationError(message);
      return;
    }
    setValidationError(null);
    let submitForm = form;
    if (form.imageUrl.startsWith('data:')) {
      const uploadedImage = await uploadGuideImage(dataUrlToBlob(form.imageUrl));
      if (!uploadedImage) return;
      submitForm = { ...form, imageUrl: uploadedImage };
    }
    await onSubmit(event, submitForm);
  };

  const uploadGuideImage = async (file: Blob | null) => {
    if (!file || !form.guideCode.trim()) {
      return false;
    }
    try {
      const result = await apiUpload<UploadImageResponse>(
        `/api/members/${encodeURIComponent(form.guideCode)}/image`,
        file,
      );
      onChange({ ...form, imageUrl: result.imageUrl });
      setLookupStatus('Guide image saved.');
      return result.imageUrl;
    } catch (error) {
      setLookupStatus(error instanceof Error ? error.message : 'Unable to upload guide image.');
      return false;
    }
  };

  const scanCard = async () => {
    setLookupStatus('Reading Thai ID card...');

    try {
      const response = await fetch(`${THAI_ID_BRIDGE_URL}/read-card`, {
        method: 'GET',
        cache: 'no-store',
      });
      const data = (await response.json()) as ThaiIdBridgeResponse;

      if (!response.ok || data.ok === false) {
        throw new Error(data.message || 'Unable to read Thai ID card.');
      }

      onChange({
        ...form,
        nationalId: data.cid || form.nationalId,
        titleTh: data.titleTh || form.titleTh,
        firstNameTh: data.firstNameTh || form.firstNameTh,
        lastNameTh: data.lastNameTh || form.lastNameTh,
        fullNameTh: data.fullNameTh || form.fullNameTh,
        titleEn: data.titleEn || form.titleEn,
        firstNameEn: data.firstNameEn || form.firstNameEn,
        lastNameEn: data.lastNameEn || form.lastNameEn,
        fullName: data.fullName || form.fullName,
        birthDate: data.birthDate || form.birthDate,
        cardIssueDate: data.cardIssueDate || form.cardIssueDate,
        cardExpireDate: data.cardExpireDate || form.cardExpireDate,
        address: data.address || form.address,
        imageUrl: data.imageUrl || form.imageUrl,
      });
      setLookupStatus('Card data loaded successfully.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to read Thai ID card.';
      setLookupStatus(
        message.includes('Failed to fetch')
          ? 'Thai ID bridge is not running. Please start tools\\start-thai-id-bridge.cmd, then scan again.'
          : message,
      );
    }
  };

  const lookupNationalId = () => {
    const normalized = form.nationalId.replace(/\D/g, '');
    if (!normalized) {
      setLookupStatus(null);
      return;
    }
    if (normalized.length !== 13) {
      setLookupStatus('เลขบัตรประชาชนต้องมี 13 หลัก');
      return;
    }
    setLookupStatus('API lookup hook is ready. Backend endpoint will be connected later.');
  };

  const onNationalIdKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      lookupNationalId();
    }
  };

  return (
    <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        onKeyDown={preventEnterSubmit}
        className="relative max-h-[92vh] w-full max-w-6xl overflow-auto rounded-[10px] border border-slate-200/80 bg-white/95 shadow-[0_24px_70px_rgba(15,23,42,0.18)] backdrop-blur"
      >
        {loading ? (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/70 backdrop-blur-[1px]">
            <LoadingState label="Preparing member form..." className="min-h-0" />
          </div>
        ) : null}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-[24px] font-semibold leading-tight text-slate-950">{title}</h2>
            <p className="mt-1 text-sm text-slate-500">
              รองรับการกรอกเอง และเตรียมจุดเชื่อมต่อเครื่องอ่านบัตรประชาชน
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="min-h-10 rounded-md border border-emerald-500 bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-100"
              onClick={scanCard}
            >
              Scan CardID
            </button>
            <button type="button" className="toolbar-btn" onClick={onClose}>
              Close
            </button>
          </div>
        </div>

        <div className="grid gap-5 p-5 lg:grid-cols-[220px_1fr]">
          <aside className="space-y-4">
            <div className="rounded-[8px] border border-slate-200 bg-slate-50 p-4">
              <div className="flex h-52 items-center justify-center overflow-hidden rounded-md border border-slate-200 bg-white text-sm text-slate-400">
                {imageSrc ? (
                  <img
                    src={imageSrc}
                    alt=""
                    className="h-full w-full object-cover"
                    onError={() => setImageLoadFailed(true)}
                  />
                ) : (
                  <span>{form.imageUrl ? 'Image unavailable' : 'No image data'}</span>
                )}
              </div>
              <p className="mt-3 text-xs leading-5 text-slate-500">
                รูปจะถูกดึงจากเครื่องอ่านบัตรประชาชน หรือ upload เพิ่มภายหลัง
              </p>
              <label className="toolbar-btn mt-3 w-full cursor-pointer">
                <UploadIcon className="erp-action-icon" />
                Browse
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(event) => uploadGuideImage(event.target.files?.[0] ?? null)}
                />
              </label>
            </div>

            <div className="rounded-[8px] border border-sky-100 bg-sky-50/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Guide Code</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">{form.guideCode}</p>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                Format: GE + ปีปัจจุบัน 2 หลัก + running 0001-9999
              </p>
            </div>
          </aside>

          <div className="space-y-4">
            {lookupStatus ? (
              <div className="rounded-md border border-sky-100 bg-sky-50 px-4 py-3 text-sm font-medium text-[#0752d6]">
                {lookupStatus}
              </div>
            ) : null}
            {validationError ? (
              <div className="rounded-md border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {validationError}
              </div>
            ) : null}
            {saveError ? (
              <div className="rounded-md border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {saveError}
              </div>
            ) : null}

            <FormSection title="ข้อมูลบัตรและรหัส">
              <Field label="รหัสไกด์" value={form.guideCode} onChange={(value) => setField('guideCode', value)} required />
              <Field
                label="เลขที่บัตรประชาชน"
                value={form.nationalId}
                onChange={(value) => setField('nationalId', value)}
                onBlur={lookupNationalId}
                onKeyDown={onNationalIdKeyDown}
                marker="optional"
              />
              <Field label="เลขที่ Passport" value={form.passportNo} onChange={(value) => setField('passportNo', value)} marker="optional" />
              <Field label="เลขที่มัคคุเทศก์" value={form.guideLicenseNo} onChange={(value) => setField('guideLicenseNo', value)} marker="optional" />
              <SelectField
                label="ประเภท"
                value={form.guideType || 'Guide'}
                onChange={(value) => setField('guideType', value)}
                options={['Guide', 'Member']}
                required
              />
              <Field label="เลขบัตรการ์ดไกด์" value={form.guideCardNo} onChange={(value) => setField('guideCardNo', value)} />
            </FormSection>

            <FormSection title="ชื่อ-สกุล">
              <Field label="คำนำหน้า (ภาษาไทย)" value={form.titleTh} onChange={(value) => setField('titleTh', value)} marker="optional" />
              <Field label="ชื่อ (ภาษาไทย)" value={form.firstNameTh} onChange={(value) => setField('firstNameTh', value)} marker="optional" />
              <Field label="นามสกุล (ภาษาไทย)" value={form.lastNameTh} onChange={(value) => setField('lastNameTh', value)} marker="optional" />
              <Field label="คำนำหน้า (ภาษาอังกฤษ)" value={form.titleEn} onChange={(value) => setField('titleEn', value)} marker="optional" />
              <Field label="ชื่อ (ภาษาอังกฤษ)" value={form.firstNameEn} onChange={(value) => setField('firstNameEn', value)} marker="optional" />
              <Field label="นามสกุล (ภาษาอังกฤษ)" value={form.lastNameEn} onChange={(value) => setField('lastNameEn', value)} marker="optional" />
              <Field label="FullNameTH" value={form.fullNameTh || fullNameTh} onChange={(value) => setField('fullNameTh', value)} />
              <Field label="FullName" value={form.fullName || fullName} onChange={(value) => setField('fullName', value)} />
              <Field label="ชื่อเล่น" value={form.nickname} onChange={(value) => setField('nickname', value)} />
            </FormSection>

            <FormSection title="ข้อมูลติดต่อและวันหมดอายุ">
              <Field label="เบอร์โทรศัพท์" value={form.phone} onChange={(value) => setField('phone', value)} />
              <DateField label="วันเกิด (ปี ค.ศ.)" value={form.birthDate} onChange={(value) => setField('birthDate', value)} />
              <DateField label="วันออกบัตร (ปี ค.ศ.)" value={form.cardIssueDate} onChange={(value) => setField('cardIssueDate', value)} />
              <DateField label="วันหมดอายุบัตร (ปี ค.ศ.)" value={form.cardExpireDate} onChange={(value) => setField('cardExpireDate', value)} />
              <DateField label="วันหมดอายุบัตรมัคคุเทศก์" value={form.guideLicenseExpireDate} onChange={(value) => setField('guideLicenseExpireDate', value)} />
              <Field label="จังหวัด" value={form.province} onChange={(value) => setField('province', value)} />
            </FormSection>

            <FormSection title="ที่อยู่และข้อมูลระบบ">
              <TextArea label="ที่อยู่ปัจจุบัน" value={form.address} onChange={(value) => setField('address', value)} wide />
              <TextArea label="หมายเหตุ" value={form.note} onChange={(value) => setField('note', value)} wide />
              <Field label="ชื่อผู้บันทึก" value={form.recorder} onChange={(value) => setField('recorder', value)} readOnly />
              <Field label="สังกัดบริษัท (ถ้ามี)" value={form.company} onChange={(value) => setField('company', value)} />
              <Field label="GuideHO (ถ้ามี)" value={form.guideHo} onChange={(value) => setField('guideHo', value)} />
            </FormSection>
          </div>
        </div>

        <div className="sticky bottom-0 flex justify-end gap-3 border-t border-slate-200 bg-white/95 px-5 py-4 backdrop-blur">
          <button type="button" className="toolbar-btn px-5" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="toolbar-btn-primary px-5">
            Save
          </button>
        </div>
      </form>
    </div>
  );
}

function AgentImportModal({
  fileName,
  preview,
  loading,
  onFileChange,
  onImport,
  onClose,
}: {
  fileName: string;
  preview: AgentImportPreviewResponse | null;
  loading: boolean;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onImport: () => void;
  onClose: () => void;
}) {
  return (
    <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-[10px] border border-slate-200/80 bg-white/95 shadow-[0_24px_70px_rgba(15,23,42,0.18)] backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-[24px] font-semibold leading-tight text-slate-950">Import Agent Legacy DB</h2>
            <p className="mt-1 text-sm text-slate-500">
              Upload database.txt to preview parsed agent records before saving to database.
            </p>
          </div>
          <button type="button" className="toolbar-btn" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="space-y-4 p-5">
          <div className="flex min-h-[84px] items-center rounded-[8px] border border-slate-200 bg-slate-50/70 p-4">
            <label className="toolbar-btn inline-flex cursor-pointer items-center justify-center">
              Choose File
              <input type="file" accept=".txt,.csv" className="hidden" onChange={onFileChange} />
            </label>
            <span className="ml-3 inline-flex min-h-10 items-center text-sm font-semibold text-slate-700">
              {fileName || 'No file selected'}
            </span>
          </div>

          <div className="overflow-hidden rounded-[8px] border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 text-sm">
              <span className="font-semibold text-slate-800">Preview Data</span>
              <span className="text-slate-500">
                {preview ? `${preview.rowCount} records found` : 'Choose a file to preview'}
              </span>
            </div>
            <div className="max-h-[48vh] overflow-auto">
              <table className="w-full min-w-[900px] border-collapse text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    {agentColumns.map((column) => (
                      <th key={column} className="border-b border-slate-200 px-3 py-3 text-left text-xs font-semibold uppercase text-slate-400">
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview?.rows.length ? (
                    preview.rows.map((row, index) => (
                      <tr key={`${row.agentCode}-${index}`} className="hover:bg-sky-50">
                        <td className="border-b border-slate-100 px-3 py-3 font-semibold text-slate-900">{row.agentCode}</td>
                        <td className="border-b border-slate-100 px-3 py-3 text-slate-700">{row.name || '-'}</td>
                        <td className="border-b border-slate-100 px-3 py-3 text-slate-700">{row.nation || '-'}</td>
                        <td className="border-b border-slate-100 px-3 py-3 text-slate-700">{row.phone || '-'}</td>
                        <td className="border-b border-slate-100 px-3 py-3 text-slate-700">{row.taxId || '-'}</td>
                        <td className="border-b border-slate-100 px-3 py-3 text-slate-700">{row.contactPerson || '-'}</td>
                        <td className="border-b border-slate-100 px-3 py-3 text-slate-700">{row.typeGroup || '-'}</td>
                        <td className="border-b border-slate-100 px-3 py-3 text-slate-700">{row.active ? 'Active' : 'Inactive'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={agentColumns.length} className="px-4 py-12 text-center text-sm text-slate-400">
                        No preview data.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 bg-white/95 px-5 py-4">
          <button type="button" className="toolbar-btn px-5" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="toolbar-btn-primary px-5" disabled={loading || !preview?.rowCount} onClick={onImport}>
            {loading ? 'Importing...' : 'Import'}
          </button>
        </div>
      </div>
    </div>
  );
}

function AgentModal({
  title,
  form,
  onChange,
  onClose,
  onSubmit,
  saveError,
}: {
  title: string;
  form: AgentForm;
  onChange: (value: AgentForm) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  saveError: string | null;
}) {
  const setField = (key: keyof AgentForm, value: string | boolean | AgentAliasItem[]) => {
    onChange({ ...form, [key]: value });
  };

  const addAlias = () => {
    setField('aliases', [...form.aliases, { pattern: '', matchType: 'contains' }]);
  };

  const updateAlias = (index: number, value: string) => {
    setField(
      'aliases',
      form.aliases.map((alias, aliasIndex) =>
        aliasIndex === index ? { ...alias, pattern: value } : alias,
      ),
    );
  };

  const removeAlias = (index: number) => {
    setField(
      'aliases',
      form.aliases.filter((_, aliasIndex) => aliasIndex !== index),
    );
  };

  return (
    <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4">
      <form
        onSubmit={onSubmit}
        onKeyDown={preventEnterSubmit}
        className="modal-pop flex max-h-[calc(100vh-2rem)] w-full max-w-[1120px] flex-col overflow-hidden rounded-[10px] border border-slate-200/80 bg-white/95 shadow-[0_24px_70px_rgba(15,23,42,0.18)] backdrop-blur"
      >
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-3">
          <div>
            <h2 className="text-xl font-semibold leading-tight text-slate-950">{title}</h2>
            <p className="mt-1 text-xs text-slate-500">
              Agent master data and alias patterns for booking import matching.
            </p>
          </div>
          <button type="button" className="toolbar-btn" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-hidden p-4">
          {saveError ? (
            <div className="mb-3 rounded-md border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {saveError}
            </div>
          ) : null}

          <div className="grid h-full min-h-0 gap-3 xl:grid-cols-[minmax(0,1.2fr)_minmax(380px,0.8fr)]">
            <div className="min-h-0 overflow-y-auto pr-1">
          <FormSection
            title="Agent Information"
            headerRight={
              <label className="flex min-h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(event) => setField('active', event.target.checked)}
                  className="h-4 w-4 accent-[#1478ff]"
                />
                Active
              </label>
            }
          >
            <Field label="Agent Code" value={form.agentCode} onChange={(value) => setField('agentCode', value)} required />
            <Field label="Code Center" value={form.codeCenter} onChange={(value) => setField('codeCenter', value)} />
            <Field label="Agent Name" value={form.name} onChange={(value) => setField('name', value)} required />
            <Field label="Nation" value={form.nation} onChange={(value) => setField('nation', value)} />
            <Field label="Phone" value={form.phone} onChange={(value) => setField('phone', value)} />
            <Field label="Fax" value={form.fax} onChange={(value) => setField('fax', value)} />
            <Field label="Contact" value={form.contactPerson} onChange={(value) => setField('contactPerson', value)} />
            <Field label="Marketing" value={form.marketing} onChange={(value) => setField('marketing', value)} />
            <Field label="Agent HO" value={form.agentHO} onChange={(value) => setField('agentHO', value)} />
            <SelectField
              label="Type Center"
              value={form.typeCenter}
              onChange={(value) => setField('typeCenter', value)}
              options={typeCenterOptions}
            />
            <SelectField
              label="Agent Type"
              value={form.agentType}
              onChange={(value) => setField('agentType', value)}
              options={agentTypeOptions}
            />
            <Field label="TypeGroup" value={form.typeGroup} onChange={(value) => setField('typeGroup', value)} />
            <Field label="NAV Code" value={form.navCode} onChange={(value) => setField('navCode', value)} />
            <Field label="Email" value={form.email} onChange={(value) => setField('email', value)} />
          </FormSection>
            </div>

            <div className="flex min-h-0 flex-col gap-3 overflow-hidden">
              <FormSection title="Tax and Banking" compact>
                <Field label="Tax ID" value={form.taxId} onChange={(value) => setField('taxId', value)} />
                <Field label="Branch" value={form.branch} onChange={(value) => setField('branch', value)} />
                <Field label="Bank Name" value={form.bankName} onChange={(value) => setField('bankName', value)} />
                <Field label="Bank Branch" value={form.bankBranch} onChange={(value) => setField('bankBranch', value)} />
                <Field label="Bank Account" value={form.bankAccount} onChange={(value) => setField('bankAccount', value)} />
                <TextArea label="Address" value={form.address} onChange={(value) => setField('address', value)} wide />
              </FormSection>

          <section className="flex min-h-0 flex-1 flex-col rounded-[8px] border border-slate-200 bg-slate-50/60 p-3">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-800">Alias Matching</h3>
                <p className="mt-1 text-[11px] text-slate-500">
                  Used by booking import. Matching is contains, case-insensitive, and stored in database.
                </p>
              </div>
              <button type="button" className="toolbar-btn" onClick={addAlias}>
                Add Alias
              </button>
            </div>

            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
              {form.aliases.length > 0 ? (
                form.aliases.map((alias, index) => (
                  <div key={`${alias.id ?? 'new'}-${index}`} className="grid gap-2 md:grid-cols-[1fr_140px_90px]">
                    <input
                      value={alias.pattern}
                      onChange={(event) => updateAlias(index, event.target.value)}
                      placeholder="POPULAR =R="
                      className="form-input rounded-md"
                    />
                    <select value={alias.matchType} disabled className="form-input rounded-md bg-slate-100">
                      <option value="contains">contains</option>
                    </select>
                    <button type="button" className="toolbar-btn-danger min-h-10" onClick={() => removeAlias(index)}>
                      Remove
                    </button>
                  </div>
                ))
              ) : (
                <p className="rounded-md border border-dashed border-slate-200 bg-white px-4 py-6 text-sm text-slate-400">
                  No alias patterns yet. Add patterns such as POPULAR =R=, ASIAN =R=, or ANANDA =PK=.
                </p>
              )}
            </div>
          </section>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 justify-end gap-3 border-t border-slate-200 bg-white/95 px-5 py-3 backdrop-blur">
          <button type="button" className="toolbar-btn px-5" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="toolbar-btn-primary px-5">
            Save
          </button>
        </div>
      </form>
    </div>
  );
}

function FormSection({
  title,
  children,
  headerRight,
  compact = false,
}: {
  title: string;
  children: React.ReactNode;
  headerRight?: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <section className={`rounded-[8px] border border-slate-200 bg-slate-50/60 ${compact ? 'p-3' : 'p-4'}`}>
      <div className={`${compact ? 'mb-3' : 'mb-4'} flex flex-wrap items-center justify-between gap-3`}>
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
        {headerRight}
      </div>
      <div className={`grid ${compact ? 'gap-3' : 'gap-4 md:grid-cols-2 xl:grid-cols-3'}`}>{children}</div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
  marker,
  readOnly = false,
  onBlur,
  onKeyDown,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  marker?: 'required' | 'optional';
  readOnly?: boolean;
  onBlur?: () => void;
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
}) {
  const markerTone = marker ?? (required ? 'required' : undefined);

  return (
    <label className="space-y-2">
      <span className="text-sm font-semibold text-slate-700">
        {label}
        {markerTone === 'required' ? <span className="ml-1 text-red-500">*</span> : null}
        {markerTone === 'optional' ? <span className="ml-1 text-amber-500">*</span> : null}
      </span>
      <input
        type={type}
        value={value}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        readOnly={readOnly}
        onChange={(event) => onChange(event.target.value)}
        className={`form-input rounded-md ${readOnly ? 'bg-slate-100 text-slate-500' : ''}`}
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<string | { value: string; label: string }>;
  required?: boolean;
}) {
  return (
    <CustomDropdown
      label={label}
      value={value}
      options={options.map((option) => (typeof option === 'string' ? { value: option, label: option } : option))}
      onChange={onChange}
      required={required}
    />
  );
}

function CustomDropdown({
  label,
  value,
  options,
  onChange,
  required = false,
  placeholder = 'Please select',
}: {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLLabelElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuRect, setMenuRect] = useState({ left: 0, top: 0, width: 0 });
  const selected = options.find((option) => option.value === value);

  const updateMenuRect = () => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMenuRect({
      left: rect.left,
      top: rect.bottom + 4,
      width: rect.width,
    });
  };

  useEffect(() => {
    if (!open) return;
    updateMenuRect();
    const closeOnOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!wrapperRef.current?.contains(target) && !menuRef.current?.contains(target)) {
        setOpen(false);
      }
    };
    const updateOnViewportChange = () => updateMenuRect();
    document.addEventListener('mousedown', closeOnOutsideClick);
    window.addEventListener('resize', updateOnViewportChange);
    window.addEventListener('scroll', updateOnViewportChange, true);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      window.removeEventListener('resize', updateOnViewportChange);
      window.removeEventListener('scroll', updateOnViewportChange, true);
    };
  }, [open]);

  return (
    <label ref={wrapperRef} className="relative block space-y-2">
      <span className="text-sm font-semibold text-slate-700">
        {label}
        {required ? <span className="ml-1 text-red-500">*</span> : null}
      </span>
      <button
        ref={buttonRef}
        type="button"
        className="form-input flex w-full items-center justify-between rounded-md border-[#9bc0ff] bg-white px-3 text-left shadow-[0_0_0_1px_rgba(96,165,250,0.16)] transition hover:border-[#6aa5ff] focus:border-[#1478ff] focus:ring-4 focus:ring-[rgba(20,120,255,0.16)]"
        onClick={() => {
          updateMenuRect();
          setOpen((current) => !current);
        }}
      >
        <span className={selected ? 'truncate text-slate-950' : 'truncate text-slate-400'}>
          {selected ? selected.label : placeholder}
        </span>
        <span className="ml-2 shrink-0 text-[10px] text-slate-400" aria-hidden="true">
          โ–พ
        </span>
      </button>
      {open
        ? createPortal(
        <div
          ref={menuRef}
          style={{ left: menuRect.left, top: menuRect.top, width: menuRect.width }}
          className="fixed z-[9999] overflow-hidden rounded-md border border-slate-200 bg-white shadow-[0_12px_32px_rgba(15,23,42,0.18)]"
        >
          <div className="max-h-[220px] overflow-y-auto py-1 [scrollbar-color:#8b929c_transparent] [scrollbar-width:auto]">
            {options.length ? (
              options.map((option) => {
                const isSelected = option.value === value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    className={`flex h-9 w-full items-center gap-1 px-3 text-left text-[13px] text-slate-950 hover:bg-[#eaf2ff] ${
                      isSelected ? 'bg-[#eaf2ff]' : 'bg-white'
                    }`}
                    onClick={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                  >
                    {option.value ? <span className="shrink-0 font-bold">{option.value}</span> : null}
                    {option.label !== option.value ? <span className="truncate">{option.value ? `- ${option.label}` : option.label}</span> : null}
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-3 text-sm text-slate-400">No results</div>
            )}
          </div>
        </div>,
        document.body,
      )
        : null}
    </label>
  );
}

function DateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <input
        type="text"
        value={dateInputValue(value)}
        placeholder="--/--/----"
        onChange={(event) => onChange(parseDateInput(event.target.value))}
        onBlur={(event) => onChange(completeDateInput(event.target.value))}
        className="form-input rounded-md"
      />
    </label>
  );
}

function dateInputValue(value?: string) {
  if (!value) return '';
  const [year, month, day] = value.slice(0, 10).split('-');
  return year && month && day ? `${day}/${month}/${year}` : value;
}

function parseDateInput(value: string) {
  const trimmed = value.trim();
  if (!trimmed || trimmed === '--/--/----') return '';
  const match = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return trimmed;
  return `${match[3]}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`;
}

function completeDateInput(value: string) {
  const parsed = parseDateInput(value);
  if (!parsed) return '';
  const [year, month, day] = parsed.slice(0, 10).split('-');
  return year && month && day ? `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}` : parsed;
}

function getImageSrc(value: string) {
  if (!value || value.startsWith('data:') || value.startsWith('http')) {
    return value;
  }
  return `${API_BASE_URL}${value}`;
}

function dataUrlToBlob(value: string) {
  const [meta, payload] = value.split(',');
  const mimeType = meta.match(/data:(.*?);base64/)?.[1] ?? 'image/jpeg';
  const binary = atob(payload ?? '');
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return new Blob([bytes], { type: mimeType });
}

function TextArea({
  label,
  value,
  onChange,
  wide = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  wide?: boolean;
}) {
  return (
    <label className={`space-y-2 ${wide ? 'md:col-span-2 xl:col-span-3' : ''}`}>
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-20 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-[#1478ff] focus:ring-4 focus:ring-[rgba(20,120,255,0.14)]"
      />
    </label>
  );
}

function generateGuideCode(sequence: number) {
  const year = getCurrentGuideCodeYear();
  return `GE${year}${String(sequence).padStart(4, '0')}`;
}

function getCurrentGuideCodeYear() {
  return String(new Date().getFullYear()).slice(-2);
}

function toFormState(member: MemberItem): MemberForm {
  return {
    guideCode: member.guideCode,
    titleTh: member.titleTh,
    firstNameTh: member.firstNameTh,
    lastNameTh: member.lastNameTh,
    titleEn: member.titleEn,
    firstNameEn: member.firstNameEn,
    lastNameEn: member.lastNameEn,
    phone: member.phone,
    nickname: member.nickname,
    birthDate: member.birthDate,
    nationalId: member.nationalId,
    cardIssueDate: member.cardIssueDate,
    cardExpireDate: member.cardExpireDate,
    guideType: member.guideType,
    guideLicenseNo: member.guideLicenseNo,
    guideLicenseExpireDate: member.guideLicenseExpireDate,
    passportNo: member.passportNo,
    address: member.address,
    province: member.province,
    note: member.note,
    recorder: member.recorder,
    fullName: member.fullName,
    fullNameTh: member.fullNameTh,
    guideCardNo: member.guideCardNo,
    company: member.company,
    guideHo: member.guideHo,
    imageUrl: member.imageUrl,
  };
}

function normalizeMemberPayload(form: MemberForm): MemberForm {
  const fullNameTh =
    form.fullNameTh ||
    [form.titleTh, form.firstNameTh, form.lastNameTh].filter(Boolean).join(' ');
  const fullName =
    form.fullName ||
    [form.titleEn, form.firstNameEn, form.lastNameEn].filter(Boolean).join(' ');

  return {
    ...form,
    fullNameTh,
    fullName,
  };
}

function formatMemberDisplayName(member: Pick<
  MemberForm,
  | 'firstNameEn'
  | 'lastNameEn'
  | 'firstNameTh'
  | 'lastNameTh'
  | 'fullName'
  | 'fullNameTh'
>) {
  const englishName =
    [member.firstNameEn, member.lastNameEn].filter(Boolean).join(' ') ||
    stripKnownTitle(member.fullName);
  const thaiName =
    [member.firstNameTh, member.lastNameTh].filter(Boolean).join(' ') ||
    stripKnownTitle(member.fullNameTh);

  if (englishName && thaiName) {
    return `${englishName} (${thaiName})`;
  }
  return englishName || thaiName || '-';
}

function stripKnownTitle(value: string) {
  return value
    .replace(/^(Mr\.?|Mrs\.?|Miss|Ms\.?)\s+/i, '')
    .replace(/^(นาย|นาง|นางสาว|เด็กชาย|เด็กหญิง)\s*/u, '')
    .trim();
}

function toAgentFormState(agent: AgentItem): AgentForm {
  return {
    agentCode: agent.agentCode,
    codeCenter: agent.codeCenter,
    name: agent.name,
    address: agent.address,
    nation: agent.nation,
    phone: agent.phone,
    fax: agent.fax,
    contactPerson: agent.contactPerson,
    marketing: agent.marketing,
    agentHO: agent.agentHO,
    typeCenter: agent.typeCenter,
    agentType: agent.agentType,
    typeGroup: agent.typeGroup,
    navCode: agent.navCode,
    email: agent.email,
    taxId: agent.taxId,
    branch: agent.branch,
    bankName: agent.bankName,
    bankBranch: agent.bankBranch,
    bankAccount: agent.bankAccount,
    active: agent.active,
    aliases: agent.aliases ?? [],
  };
}

function normalizeAgentPayload(form: AgentForm): AgentForm {
  return {
    ...form,
    agentCode: form.agentCode.trim(),
    codeCenter: form.codeCenter.trim(),
    name: form.name.trim(),
    nation: form.nation.trim().toUpperCase(),
    aliases: form.aliases
      .map((alias) => ({ pattern: alias.pattern.trim(), matchType: 'contains' as const }))
      .filter((alias) => alias.pattern),
  };
}

function fileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const value = String(reader.result ?? '');
      resolve(value.includes(',') ? value.split(',')[1] : value);
    };
    reader.onerror = () => reject(reader.error ?? new Error('Unable to read file.'));
    reader.readAsDataURL(file);
  });
}

function validateMemberForm(form: MemberForm) {
  const hasThaiName = Boolean(
    form.titleTh.trim() && form.firstNameTh.trim() && form.lastNameTh.trim(),
  );
  const hasEnglishName = Boolean(
    form.titleEn.trim() && form.firstNameEn.trim() && form.lastNameEn.trim(),
  );

  if (!form.guideCode.trim()) {
    return 'Guide code is required.';
  }
  if (!form.nationalId.trim()) {
    return 'National ID is required.';
  }
  if (!hasThaiName && !hasEnglishName) {
    return 'Please enter Thai name or English name.';
  }
  if (form.nationalId.replace(/\D/g, '').length !== 13) {
    return 'National ID must be 13 digits.';
  }

  return null;
}

function getPageNumbers(currentPage: number, totalPages: number) {
  const maxVisiblePages = 5;
  const half = Math.floor(maxVisiblePages / 2);
  const start = Math.max(1, Math.min(currentPage - half, totalPages - maxVisiblePages + 1));
  const end = Math.min(totalPages, start + maxVisiblePages - 1);

  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

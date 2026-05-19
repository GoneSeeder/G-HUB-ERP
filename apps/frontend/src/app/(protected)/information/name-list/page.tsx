'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { apiFetch } from '@/lib/api';

type NameListItem = {
  id?: string;
  itemNo: number | '';
  isLeader: boolean;
  agentCode: string;
  code: string;
  arriveDate: string;
  passportNo: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  age: number | null;
  gender: string;
  nationCode: string;
  province: string;
  location: string;
};

type NameList = {
  id: string;
  code: string;
  partyCode: string;
  arriveDate: string;
  departDate: string;
  agentCode: string;
  agentName: string;
  guideCode: string;
  guideName: string;
  nationCode: string;
  nationName: string;
  country: string;
  province: string;
  busCode: string;
  pax: number;
  sourceFile: string;
  note: string;
  createdAt: string;
  items: NameListItem[];
};

type FormState = Omit<NameList, 'id' | 'pax'> & {
  id?: string;
  pax: number | '';
};

type AgentOption = {
  id: string;
  agentCode: string;
  name: string;
};

type ImportPreview = {
  partyCode: string;
  agentCode: string;
  agentName: string;
  receivedDate: string;
  totalRows: number;
  sheetName: string;
  headerRow: number;
  columnMap: Record<string, string>;
  sampleRows: NameListItem[];
  warnings: string[];
};

type ImportResult = {
  imported: number;
  nameList: NameList;
};

const importColumnOptions = [
  { key: 'itemNo', label: 'ลำดับ' },
  { key: 'chineseName', label: 'ชื่อจีน' },
  { key: 'englishSurname', label: 'นามสกุล' },
  { key: 'englishGiven', label: 'ชื่ออังกฤษ' },
  { key: 'englishName', label: 'ชื่อรวม' },
  { key: 'birthDate', label: 'วันเกิด' },
  { key: 'age', label: 'อายุ' },
  { key: 'gender', label: 'เพศ' },
  { key: 'location', label: 'ที่เกิด' },
  { key: 'passportNo', label: 'Passport' },
  { key: 'province', label: 'ที่ออกพาสปอร์ต' },
  { key: 'remark', label: 'หมายเหตุ' },
] as const;

const excelColumnLetters = Array.from({ length: 26 }, (_, index) =>
  String.fromCharCode(65 + index),
);

const emptyItem = (itemNo: number): NameListItem => ({
  itemNo,
  isLeader: false,
  agentCode: '',
  code: '',
  arriveDate: '',
  passportNo: '',
  firstName: '',
  lastName: '',
  birthDate: '',
  age: null,
  gender: '',
  nationCode: '',
  province: '',
  location: '',
});

const emptyForm = (): FormState => ({
  code: '',
  partyCode: '',
  arriveDate: new Date().toISOString().slice(0, 10),
  departDate: '',
  agentCode: '',
  agentName: '',
  guideCode: '',
  guideName: '',
  nationCode: '',
  nationName: '',
  country: '',
  province: '',
  busCode: '',
  pax: 0,
  sourceFile: '',
  note: '',
  createdAt: '',
  items: [],
});

const itemColumns: Array<{ key: keyof NameListItem; label: string; width: string }> = [
  { key: 'itemNo', label: 'Item', width: 'w-[40px]' },
  { key: 'isLeader', label: 'Leader', width: 'w-[44px]' },
  { key: 'agentCode', label: 'Agent', width: 'w-[50px]' },
  { key: 'code', label: 'Code', width: 'w-[70px]' },
  { key: 'arriveDate', label: 'Arrive Date', width: 'w-[70px]' },
  { key: 'passportNo', label: 'Passport', width: 'w-[74px]' },
  { key: 'firstName', label: 'First Name', width: 'w-[76px]' },
  { key: 'lastName', label: 'Last Name', width: 'w-[76px]' },
  { key: 'birthDate', label: 'Birth Date', width: 'w-[70px]' },
  { key: 'age', label: 'Age', width: 'w-[34px]' },
  { key: 'gender', label: 'Gender', width: 'w-[44px]' },
  { key: 'nationCode', label: 'Nation', width: 'w-[46px]' },
  { key: 'province', label: 'Province', width: 'w-[60px]' },
  { key: 'location', label: 'Location', width: 'w-[44px]' },
];

export default function NameListPage() {
  const [rows, setRows] = useState<NameList[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [formMode, setFormMode] = useState<'add' | 'edit' | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  const visibleRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    const sorted = [...rows].sort((a, b) => {
      const createdCompare = (b.createdAt || '').localeCompare(a.createdAt || '');
      return createdCompare || a.code.localeCompare(b.code);
    });
    if (!query) return sorted;
    return sorted.filter((row) =>
      [
        row.code,
        row.partyCode,
        row.agentCode,
        row.agentName,
        row.guideCode,
        row.guideName,
        row.nationCode,
        row.nationName,
        row.sourceFile,
      ]
        .join(' ')
        .toLowerCase()
        .includes(query),
    );
  }, [rows, search]);
  const selected =
    visibleRows.find((row) => row.id === selectedId) ?? visibleRows[0] ?? null;
  const filteredItems = selected?.items ?? [];
  const loadRows = async () => {
    const data = await apiFetch<NameList[]>('/api/name-lists');
    setRows(data);
    setSelectedId((current) => {
      if (current && data.some((row) => row.id === current)) return current;
      return data[0]?.id ?? null;
    });
  };

  useEffect(() => {
    void loadRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deleteSelected = async () => {
    if (!selected || !window.confirm(`Delete name list "${selected.code}"?`)) return;
    await apiFetch(`/api/name-lists/${selected.id}`, { method: 'DELETE' });
    setMessage('Name list deleted.');
    setSelectedId(null);
    await loadRows();
  };

  const openImport = () => {
    setMessage('');
    setError(null);
    setImportOpen(true);
  };

  return (
    <section className="flex h-[calc(100vh-6.5rem)] min-h-0 flex-col gap-3 overflow-hidden">
      <div className="shrink-0 rounded-[10px] border border-slate-200/80 bg-white/95 px-4 py-3 shadow-[0_18px_48px_rgba(15,23,42,0.08)] backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-700">
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                  <path d="M6.5 3A2.5 2.5 0 0 0 4 5.5v13A2.5 2.5 0 0 0 6.5 21h11a2.5 2.5 0 0 0 2.5-2.5v-13A2.5 2.5 0 0 0 17.5 3h-11ZM7 7h10v2H7V7Zm0 4h10v1.5H7V11Zm0 4h6v1.5H7V15Z" />
                </svg>
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl font-semibold text-slate-950">NameList</h1>
                <p className="truncate text-sm text-slate-500">
                  Passenger manifests from agent Excel files
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="toolbar-btn-primary" onClick={openImport}>
              Import Namelist
            </button>
            <button type="button" className="toolbar-btn" onClick={() => setFormMode('add')}>
              Add
            </button>
            <button type="button" className="toolbar-btn" disabled={!selected} onClick={() => setFormMode('edit')}>
              Edit
            </button>
            <button type="button" className="toolbar-btn-danger" disabled={!selected} onClick={deleteSelected}>
              Delete
            </button>
            <button type="button" className="toolbar-btn" onClick={loadRows}>
              Refresh
            </button>
          </div>
        </div>

        <div className="mt-3">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search code, party code, agent, guide, nation, source file..."
            className="form-input rounded-md"
          />
        </div>
        {message ? <p className="mt-2 text-sm font-semibold text-blue-800">{message}</p> : null}
        {error ? <p className="mt-2 text-sm font-semibold text-red-700">{error}</p> : null}
      </div>

      <div className="grid min-h-0 flex-1 gap-3 xl:grid-cols-[380px_minmax(0,1fr)] 2xl:grid-cols-[420px_minmax(0,1fr)]">
        <aside className="min-h-0 overflow-hidden rounded-[10px] border border-slate-200 bg-white shadow-[0_14px_38px_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <div>
              <h2 className="text-base font-semibold text-slate-950">Manifests</h2>
              <p className="text-xs text-slate-500">{visibleRows.length} records</p>
            </div>
            <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
              DB list
            </span>
          </div>
          <div className="h-[calc(100%-3.75rem)] overflow-auto">
            {visibleRows.length ? (
              <table className="w-full table-fixed border-collapse text-xs">
                <thead className="sticky top-0 z-10 bg-white">
                  <tr>
                    <th className="w-[34%] border-b border-slate-200 px-2 py-2 text-left text-[10px] font-semibold uppercase text-slate-400">Code</th>
                    <th className="w-[24%] border-b border-slate-200 px-2 py-2 text-left text-[10px] font-semibold uppercase text-slate-400">Arrive</th>
                    <th className="w-[24%] border-b border-slate-200 px-2 py-2 text-left text-[10px] font-semibold uppercase text-slate-400">Agent</th>
                    <th className="w-[10%] border-b border-slate-200 px-1 py-2 text-left text-[10px] font-semibold uppercase text-slate-400">N</th>
                    <th className="w-[8%] border-b border-slate-200 px-1 py-2 text-right text-[10px] font-semibold uppercase text-slate-400">P</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.map((row) => (
                    <tr
                      key={row.id}
                      onClick={() => setSelectedId(row.id)}
                      onDoubleClick={() => {
                        setSelectedId(row.id);
                        setFormMode('edit');
                      }}
                      className={`cursor-pointer transition hover:bg-blue-50 ${
                        row.id === selected?.id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <td className="border-b border-slate-100 px-2 py-2">
                        <p className="truncate font-semibold text-slate-950">{row.code}</p>
                        <p className="truncate text-[11px] text-slate-400">{row.partyCode || '-'}</p>
                      </td>
                      <td className="whitespace-nowrap border-b border-slate-100 px-2 py-2 text-slate-700">{formatDate(row.arriveDate)}</td>
                      <td className="border-b border-slate-100 px-2 py-2">
                        <p className="truncate text-slate-700">{row.agentName || '-'}</p>
                        <p className="truncate text-[11px] text-slate-400">{row.agentCode || '-'}</p>
                      </td>
                      <td className="whitespace-nowrap border-b border-slate-100 px-2 py-2 text-slate-700">{row.nationCode || '-'}</td>
                      <td className="whitespace-nowrap border-b border-slate-100 px-2 py-2 text-right font-semibold text-slate-900">
                        {row.pax || row.items.length}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : null}
            {visibleRows.length === 0 ? (
              <div className="flex h-full min-h-64 items-center justify-center rounded-md border border-dashed border-slate-200 px-6 text-center">
                <div>
                  <p className="text-sm font-semibold text-slate-700">No name lists yet</p>
                  <p className="mt-1 text-xs text-slate-400">Import or add a manifest to begin.</p>
                </div>
              </div>
            ) : null}
          </div>
        </aside>

        <main className="grid min-h-0 gap-3 xl:grid-rows-[auto_minmax(0,1fr)]">
          <section className="rounded-[10px] border border-slate-200 bg-white shadow-[0_14px_38px_rgba(15,23,42,0.06)]">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 px-4 py-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase text-slate-400">Selected Manifest</p>
                <h2 className="mt-1 truncate text-xl font-semibold text-slate-950">{selected?.code ?? 'No selection'}</h2>
              </div>
              {selected ? (
                <div className="flex flex-wrap gap-2">
                  <StatusPill label="Passengers" value={(selected.pax || selected.items.length).toString()} />
                  <StatusPill label="Agent" value={selected.agentCode || '-'} />
                  <StatusPill label="Nation" value={selected.nationCode || '-'} />
                </div>
              ) : null}
            </div>
            <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-4">
              <DetailField label="Party Code" value={selected?.partyCode} />
              <DetailField label="Arrive Date" value={formatDate(selected?.arriveDate)} />
              <DetailField label="Depart Date" value={formatDate(selected?.departDate)} />
              <DetailField label="Guide" value={selected ? `${selected.guideCode || '-'} ${selected.guideName || ''}` : ''} />
              <DetailField label="Agent" value={selected ? `${selected.agentCode || '-'} ${selected.agentName || ''}` : ''} wide />
              <DetailField label="Country / Province" value={selected ? `${selected.country || '-'} ${selected.province || ''}` : ''} />
              <DetailField label="Source File" value={selected?.sourceFile} />
            </div>
          </section>

          <DataPanel
            title="Passengers"
            subtitle={selected ? `${filteredItems.length} rows from ${selected.code}` : 'Select a manifest'}
          >
            <table className="w-full table-fixed border-collapse text-xs">
              <thead className="sticky top-0 z-10 bg-white">
                <tr>
                  {itemColumns.map((column) => (
                    <th
                      key={column.key}
                      className={`${column.width} truncate border-b border-slate-200 px-1.5 py-2 text-left text-[10px] font-semibold uppercase text-slate-400`}
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.id ?? item.itemNo} className="hover:bg-slate-50">
                    {itemColumns.map((column) => (
                      <td
                        key={column.key}
                        title={formatItemValue(item, column.key)}
                        className={`${column.width} truncate whitespace-nowrap border-b border-slate-100 px-1.5 py-2 text-slate-700`}
                      >
                        {formatItemValue(item, column.key)}
                      </td>
                    ))}
                  </tr>
                ))}
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={itemColumns.length} className="px-4 py-16 text-center text-sm text-slate-400">
                      No passenger items for this manifest.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </DataPanel>
        </main>
      </div>

      {formMode ? (
        <NameListModal
          mode={formMode}
          initial={formMode === 'edit' && selected ? selected : undefined}
          onClose={() => setFormMode(null)}
          onSaved={async (savedMessage) => {
            setMessage(savedMessage);
            setFormMode(null);
            await loadRows();
          }}
          onError={setError}
        />
      ) : null}

      {importOpen ? (
        <ImportNameListModal
          onClose={() => setImportOpen(false)}
          onImported={async (savedMessage) => {
            setMessage(savedMessage);
            setImportOpen(false);
            await loadRows();
          }}
          onError={setError}
        />
      ) : null}
    </section>
  );
}

function StatusPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
      <p className="text-[10px] font-semibold uppercase text-slate-400">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function DetailField({
  label,
  value,
  wide = false,
}: {
  label: string;
  value?: string;
  wide?: boolean;
}) {
  return (
    <div className={`min-w-0 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 ${wide ? 'xl:col-span-2' : ''}`}>
      <p className="text-xs font-semibold uppercase text-slate-400">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold text-slate-800">{value || '-'}</p>
    </div>
  );
}

function DataPanel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="min-h-0 overflow-hidden rounded-[10px] border border-slate-200 bg-white shadow-[0_14px_38px_rgba(15,23,42,0.06)]">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <div>
          <h2 className="text-base font-semibold text-slate-950">{title}</h2>
          {subtitle ? <p className="text-xs text-slate-500">{subtitle}</p> : null}
        </div>
      </div>
      <div className="h-[calc(100%-3.75rem)] overflow-auto">{children}</div>
    </section>
  );
}

function ImportNameListModal({
  onClose,
  onImported,
  onError,
}: {
  onClose: () => void;
  onImported: (message: string) => void;
  onError: (message: string | null) => void;
}) {
  const [agents, setAgents] = useState<AgentOption[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [partyCode, setPartyCode] = useState('');
  const [agentCode, setAgentCode] = useState('');
  const [receivedDate, setReceivedDate] = useState(new Date().toISOString().slice(0, 10));
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [columnOverrides, setColumnOverrides] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<AgentOption[]>('/api/agents/options')
      .then((data) => {
        setAgents(data);
        setAgentCode((current) => current || data[0]?.agentCode || '');
      })
      .catch((loadError) => {
        setLocalError(loadError instanceof Error ? loadError.message : 'Load agents failed.');
      });
  }, []);

  const selectedAgent = agents.find((agent) => agent.agentCode === agentCode);

  const payload = async (overrides = columnOverrides) => {
    if (!file) {
      throw new Error('Please select an Excel file.');
    }
    if (!partyCode.trim()) {
      throw new Error('Party Code is required.');
    }
    if (!selectedAgent) {
      throw new Error('Please select Agent.');
    }
    return {
      fileBase64: await fileToBase64(file),
      fileName: file.name,
      partyCode: partyCode.trim(),
      agentCode: selectedAgent.agentCode,
      agentName: selectedAgent.name,
      receivedDate,
      sheetIndex: 1,
      columnOverrides: overrides,
    };
  };

  const runPreview = async (overrides = columnOverrides) => {
    setBusy(true);
    setLocalError(null);
    onError(null);
    try {
      const data = await apiFetch<ImportPreview>('/api/name-lists/import-preview', {
        method: 'POST',
        body: JSON.stringify(await payload(overrides)),
      });
      setPreview(data);
      setColumnOverrides((current) => {
        const merged = { ...data.columnMap, ...current, ...overrides };
        return merged;
      });
    } catch (previewError) {
      setPreview(null);
      setLocalError(previewError instanceof Error ? previewError.message : 'Preview failed.');
    } finally {
      setBusy(false);
    }
  };

  const runImport = async () => {
    setBusy(true);
    setLocalError(null);
    onError(null);
    try {
      const data = await apiFetch<ImportResult>('/api/name-lists/import', {
        method: 'POST',
        body: JSON.stringify(await payload()),
      });
      onImported(`Imported ${data.imported} passengers from ${data.nameList.code}.`);
    } catch (importError) {
      setLocalError(importError instanceof Error ? importError.message : 'Import failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-slate-950/40 p-4">
      <div className="flex h-[88vh] w-full max-w-6xl flex-col overflow-hidden rounded-[10px] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.18)]">
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-5 py-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Import Namelist</h2>
            <p className="text-xs text-slate-500">Upload Excel, auto-detect columns, preview, then import.</p>
          </div>
          <button type="button" className="toolbar-btn" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="grid min-h-0 flex-1 grid-rows-[auto_minmax(0,1fr)] gap-3 overflow-hidden px-5 py-3">
          <section className="rounded-[8px] border border-slate-200 p-3">
            <div className="grid gap-3 lg:grid-cols-[minmax(260px,1.5fr)_minmax(160px,1fr)_minmax(220px,1.2fr)_160px]">
              <label>
                <span className="text-xs font-semibold text-slate-700">Excel File</span>
                <span className="mt-1 flex h-10 cursor-pointer items-center gap-2 rounded-md border border-blue-200 bg-white px-2.5 text-sm text-slate-700 transition hover:border-blue-400">
                  <span className="shrink-0 rounded border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">
                    Choose File
                  </span>
                  <span className="min-w-0 flex-1 truncate text-slate-500">
                    {file?.name ?? 'No file chosen'}
                  </span>
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    className="sr-only"
                    onChange={(event) => {
                    const nextFile = event.target.files?.[0] ?? null;
                    setFile(nextFile);
                    setPreview(null);
                    setColumnOverrides({});
                    if (nextFile) {
                      setPartyCode(extractPartyCode(nextFile.name));
                    }
                    }}
                  />
                </span>
              </label>
              <Field label="Party Code" value={partyCode} onChange={(value) => {
                setPartyCode(value);
                setPreview(null);
              }} />
              <label>
                <span className="text-xs font-semibold text-slate-700">Agent</span>
                <select
                  value={agentCode}
                  onChange={(event) => {
                    setAgentCode(event.target.value);
                    setPreview(null);
                  }}
                  className="form-input mt-1 h-10 rounded-md text-sm"
                >
                  <option value="">Please select</option>
                  {agents.map((agent) => (
                    <option key={agent.id} value={agent.agentCode}>
                      {agent.agentCode} - {agent.name}
                    </option>
                  ))}
                </select>
              </label>
              <Field label="Received Date" type="date" value={receivedDate} onChange={(value) => {
                setReceivedDate(value);
                setPreview(null);
              }} />
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs text-slate-500">
                {file ? `Selected: ${file.name}` : 'Choose an Excel file from your PC.'}
              </div>
              <div className="flex gap-2">
                <button type="button" className="toolbar-btn" disabled={busy || !file} onClick={() => void runPreview()}>
                  {busy ? 'Reading...' : 'Preview File'}
                </button>
                <button type="button" className="toolbar-btn-primary" disabled={busy || !preview} onClick={runImport}>
                  Import
                </button>
              </div>
            </div>
            {localError ? (
              <p className="mt-2 rounded-md border border-red-100 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                {localError}
              </p>
            ) : null}
          </section>

          <section className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)] overflow-hidden rounded-[8px] border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2.5">
              <div>
                <h3 className="text-sm font-semibold text-slate-950">Preview</h3>
                <p className="text-xs text-slate-500">
                  {preview
                    ? `${preview.totalRows} rows detected from ${preview.sheetName}, header row ${preview.headerRow}`
                    : 'Preview will show detected passenger rows and column mapping.'}
                </p>
              </div>
              {preview ? (
                <span className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                  Auto mapped
                </span>
              ) : null}
            </div>

            {preview ? (
              <div className="grid min-h-0 grid-cols-[210px_minmax(0,1fr)] gap-3 overflow-hidden p-3">
                <div className="min-h-0 overflow-hidden rounded-md border border-slate-200 bg-slate-50 px-2.5 py-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h4 className="text-xs font-semibold uppercase text-slate-500">จัดคอลัมน์จาก Excel</h4>
                      <p className="mt-0.5 text-[10px] text-slate-500">เลือกคอลัมน์เองได้ แล้วกด Preview อีกครั้ง</p>
                    </div>
                  </div>
                  <div className="mt-2 grid grid-cols-1 gap-y-1 text-xs text-slate-700">
                    {importColumnOptions.map((column) => {
                      const selectedValue =
                        columnOverrides[column.key] ?? preview.columnMap[column.key] ?? '';
                      return (
                        <label key={column.key} className="grid grid-cols-[minmax(0,1fr)_54px] items-center gap-1.5">
                          <span className="truncate">{column.label}</span>
                          <select
                            value={selectedValue}
                            onChange={(event) => {
                              const nextOverrides = {
                                ...columnOverrides,
                                [column.key]: event.target.value,
                              };
                              setColumnOverrides(nextOverrides);
                              if (preview && file && selectedAgent) {
                                void runPreview(nextOverrides);
                              }
                            }}
                            className="h-6 rounded-md border border-blue-200 bg-white px-1 text-xs font-semibold text-slate-700 outline-none focus:border-blue-500"
                          >
                            <option value="">ไม่มี</option>
                            {excelColumnLetters.map((letter) => (
                              <option key={letter} value={letter}>
                                {letter}
                              </option>
                            ))}
                          </select>
                        </label>
                      );
                    })}
                  </div>
                  {preview.warnings.length ? (
                    <div className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-2 py-1.5 text-[11px] font-semibold leading-4 text-amber-800">
                      {preview.warnings.map(translateImportWarning).join(' ')}
                    </div>
                  ) : null}
                </div>
                <div className="min-h-0 overflow-auto rounded-md border border-slate-200 bg-white">
                  <table className="w-full table-fixed border-collapse text-[11px]">
                    <colgroup>
                      <col className="w-[38px]" />
                      <col className="w-[50px]" />
                      <col className="w-[108px]" />
                      <col className="w-[130px]" />
                      <col className="w-[96px]" />
                      <col className="w-[88px]" />
                      <col className="w-[54px]" />
                      <col className="w-[42px]" />
                      <col className="w-[72px]" />
                      <col className="w-[72px]" />
                    </colgroup>
                    <thead className="sticky top-0 z-10 bg-white">
                      <tr>
                        {['No.', 'Leader', 'Passport', 'First Name', 'Last Name', 'Birth Date', 'Gender', 'Age', 'Province', 'Location'].map((header) => (
                          <th key={header} className="truncate border-b border-slate-200 px-1.5 py-2 text-left text-[10px] font-semibold uppercase text-slate-400">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {preview.sampleRows.map((item) => (
                        <tr key={`${item.itemNo}-${item.passportNo}`}>
                          <td className="truncate border-b border-slate-100 px-1.5 py-2">{item.itemNo}</td>
                          <td className="truncate border-b border-slate-100 px-1.5 py-2">{item.isLeader ? 'Yes' : ''}</td>
                          <td className="truncate border-b border-slate-100 px-1.5 py-2" title={item.passportNo}>{item.passportNo}</td>
                          <td className="truncate border-b border-slate-100 px-1.5 py-2" title={item.firstName}>{item.firstName}</td>
                          <td className="truncate border-b border-slate-100 px-1.5 py-2" title={item.lastName}>{item.lastName}</td>
                          <td className="truncate border-b border-slate-100 px-1.5 py-2">{formatDate(item.birthDate)}</td>
                          <td className="truncate border-b border-slate-100 px-1.5 py-2">{item.gender}</td>
                          <td className="truncate border-b border-slate-100 px-1.5 py-2">{item.age ?? ''}</td>
                          <td className="truncate border-b border-slate-100 px-1.5 py-2" title={item.province}>{item.province}</td>
                          <td className="truncate border-b border-slate-100 px-1.5 py-2" title={item.location}>{item.location}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="flex min-h-0 items-center justify-center text-center text-sm text-slate-400">
                Select file, confirm Party Code and Agent, then click Preview File.
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function NameListModal({
  mode,
  initial,
  onClose,
  onSaved,
  onError,
}: {
  mode: 'add' | 'edit';
  initial?: NameList;
  onClose: () => void;
  onSaved: (message: string) => void;
  onError: (message: string | null) => void;
}) {
  const [form, setForm] = useState<FormState>(() => (initial ? { ...initial } : emptyForm()));

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const setItem = <K extends keyof NameListItem>(
    index: number,
    key: K,
    value: NameListItem[K],
  ) => {
    setForm((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item,
      ),
    }));
  };

  const addItem = () => {
    setForm((current) => ({
      ...current,
      items: [...current.items, emptyItem(current.items.length + 1)],
      pax: current.items.length + 1,
    }));
  };

  const removeItem = (index: number) => {
    setForm((current) => {
      const items = current.items
        .filter((_, itemIndex) => itemIndex !== index)
        .map((item, itemIndex) => ({ ...item, itemNo: itemIndex + 1 }));
      return { ...current, items, pax: items.length };
    });
  };

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onError(null);
    const body = JSON.stringify({
      ...form,
      pax: Number(form.pax) || form.items.length,
      items: form.items.map((item, index) => ({
        ...item,
        itemNo: Number(item.itemNo) || index + 1,
        age: item.age === null || item.age === undefined ? undefined : Number(item.age),
      })),
    });

    try {
      if (mode === 'edit' && initial) {
        await apiFetch<NameList>(`/api/name-lists/${initial.id}`, { method: 'PATCH', body });
      } else {
        await apiFetch<NameList>('/api/name-lists', { method: 'POST', body });
      }
      onSaved(mode === 'edit' ? 'Name list updated.' : 'Name list created.');
    } catch (saveError) {
      onError(saveError instanceof Error ? saveError.message : 'Save name list failed.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-slate-950/40 p-4">
      <form
        onSubmit={save}
        className="flex h-[90vh] w-full max-w-[min(1500px,96vw)] flex-col overflow-hidden rounded-[10px] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.18)]"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-5 py-2.5">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">
              {mode === 'edit' ? 'Edit NameList' : 'Add NameList'}
            </h2>
            <p className="text-xs text-slate-500">Main trip data and passenger items.</p>
          </div>
          <button type="button" className="toolbar-btn" onClick={onClose}>
            Cancel
          </button>
        </div>

        <div className="grid min-h-0 flex-1 grid-rows-[auto_minmax(0,1fr)] gap-2.5 overflow-hidden px-5 py-2.5">
          <section className="rounded-[8px] border border-slate-200 p-2.5">
            <h3 className="text-xs font-semibold uppercase text-slate-500">Namelist Main</h3>
            <div className="mt-2 grid gap-x-2.5 gap-y-1.5 sm:grid-cols-2 lg:grid-cols-6">
              <Field label="Code" value={form.code} onChange={(value) => setField('code', value)} required />
              <Field label="Party Code" value={form.partyCode} onChange={(value) => setField('partyCode', value)} />
              <Field label="Arrive Date" type="date" value={form.arriveDate} onChange={(value) => setField('arriveDate', value)} />
              <Field label="Depart Date" type="date" value={form.departDate} onChange={(value) => setField('departDate', value)} />
              <Field label="Agent Code" value={form.agentCode} onChange={(value) => setField('agentCode', value)} />
              <Field label="Pax" type="number" value={String(form.pax)} onChange={(value) => setField('pax', value === '' ? '' : Number(value))} />
              <Field label="Agent Name" value={form.agentName} onChange={(value) => setField('agentName', value)} wide />
              <Field label="Guide Code" value={form.guideCode} onChange={(value) => setField('guideCode', value)} />
              <Field label="Guide Name" value={form.guideName} onChange={(value) => setField('guideName', value)} wide />
              <Field label="Bus Code" value={form.busCode} onChange={(value) => setField('busCode', value)} />
              <Field label="Nation" value={form.nationCode} onChange={(value) => setField('nationCode', value)} />
              <Field label="Nation Name" value={form.nationName} onChange={(value) => setField('nationName', value)} />
              <Field label="Country" value={form.country} onChange={(value) => setField('country', value)} />
              <Field label="Province" value={form.province} onChange={(value) => setField('province', value)} />
              <Field label="Source File" value={form.sourceFile} onChange={(value) => setField('sourceFile', value)} wide />
            </div>
          </section>

          <section className="min-h-0 overflow-hidden rounded-[8px] border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2">
              <h3 className="text-sm font-semibold text-slate-950">Passenger Items</h3>
              <button type="button" className="toolbar-btn" onClick={addItem}>
                Add Item
              </button>
            </div>
            <div className="h-[calc(100%-3.5rem)] overflow-auto">
              <table className="w-full min-w-[1180px] border-collapse text-[13px]">
                <thead className="sticky top-0 z-10 bg-white">
                  <tr>
                    <th className="w-20 border-b border-slate-200 px-2 py-1.5 text-left text-[11px] font-semibold uppercase text-slate-400">No.</th>
                    <th className="w-16 border-b border-slate-200 px-2 py-1.5 text-left text-[11px] font-semibold uppercase text-slate-400">Leader</th>
                    <th className="border-b border-slate-200 px-2 py-1.5 text-left text-[11px] font-semibold uppercase text-slate-400">Passport</th>
                    <th className="border-b border-slate-200 px-2 py-1.5 text-left text-[11px] font-semibold uppercase text-slate-400">First Name</th>
                    <th className="border-b border-slate-200 px-2 py-1.5 text-left text-[11px] font-semibold uppercase text-slate-400">Last Name</th>
                    <th className="border-b border-slate-200 px-2 py-1.5 text-left text-[11px] font-semibold uppercase text-slate-400">Birth Date</th>
                    <th className="border-b border-slate-200 px-2 py-1.5 text-left text-[11px] font-semibold uppercase text-slate-400">Gender</th>
                    <th className="border-b border-slate-200 px-2 py-1.5 text-left text-[11px] font-semibold uppercase text-slate-400">Age</th>
                    <th className="border-b border-slate-200 px-2 py-1.5 text-left text-[11px] font-semibold uppercase text-slate-400">Province</th>
                    <th className="border-b border-slate-200 px-2 py-1.5" />
                  </tr>
                </thead>
                <tbody>
                  {form.items.map((item, index) => (
                    <tr key={index}>
                      <td className="border-b border-slate-100 px-1.5 py-1.5">
                        <input
                          type="number"
                          value={item.itemNo || ''}
                          onChange={(event) => {
                            const nextValue = event.target.value;
                            setItem(index, 'itemNo', nextValue === '' ? '' : Number(nextValue));
                          }}
                          className="form-input no-number-spinner h-8 rounded-md px-2 text-xs"
                        />
                      </td>
                      <td className="border-b border-slate-100 px-1.5 py-1.5 text-center">
                        <input
                          type="checkbox"
                          checked={item.isLeader}
                          onChange={(event) => setItem(index, 'isLeader', event.target.checked)}
                        />
                      </td>
                      <EditableCell value={item.passportNo} onChange={(value) => setItem(index, 'passportNo', value)} />
                      <EditableCell value={item.firstName} onChange={(value) => setItem(index, 'firstName', value)} />
                      <EditableCell value={item.lastName} onChange={(value) => setItem(index, 'lastName', value)} />
                      <EditableCell type="date" value={item.birthDate} onChange={(value) => setItem(index, 'birthDate', value)} />
                      <EditableCell value={item.gender} onChange={(value) => setItem(index, 'gender', value)} />
                      <EditableCell
                        type="number"
                        value={item.age === null ? '' : String(item.age)}
                        onChange={(value) => setItem(index, 'age', value ? Number(value) : null)}
                        compactNumber
                      />
                      <EditableCell value={item.province} onChange={(value) => setItem(index, 'province', value)} />
                      <td className="border-b border-slate-100 px-1.5 py-1.5 text-right">
                        <button type="button" className="toolbar-btn-danger min-h-8 px-2.5 text-xs" onClick={() => removeItem(index)}>
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                  {form.items.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-4 py-8 text-center text-sm text-slate-400">
                        No passenger item. Add item manually or import Excel later.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div className="flex shrink-0 justify-end gap-3 border-t border-slate-200 px-5 py-2.5">
          <button type="button" className="toolbar-btn" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="toolbar-btn-primary">
            Save
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
  wide = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  wide?: boolean;
}) {
  const pickerRef = useRef<HTMLInputElement>(null);
  const isDate = type === 'date';

  const completeDate = (rawValue: string) => {
    onChange(completeDateInput(rawValue));
  };

  const openPicker = () => {
    const picker = pickerRef.current as (HTMLInputElement & { showPicker?: () => void }) | null;
    try {
      if (picker?.showPicker) {
        picker.showPicker();
        return;
      }
    } catch {
      // Native date picker availability depends on browser focus rules.
    }
    picker?.focus();
    picker?.click();
  };

  return (
    <label className={wide ? 'md:col-span-2' : ''}>
      <span className="text-[11px] font-semibold text-slate-700">{label}</span>
      <div className="relative mt-0.5">
        <input
          required={required}
          type={isDate ? 'text' : type}
          value={isDate ? dateInputValue(value) : type === 'number' && value === '0' ? '' : value}
          placeholder={isDate ? '--/--/----' : undefined}
          onChange={(event) => onChange(isDate ? parseDateInput(event.target.value) : event.target.value)}
          onBlur={(event) => {
            if (isDate) {
              completeDate(event.target.value);
            }
          }}
          onKeyDown={(event) => {
            if (isDate && event.key === 'Enter') {
              completeDate(event.currentTarget.value);
            }
          }}
          className={`form-input h-8 rounded-md px-2.5 text-xs ${isDate ? 'pr-8' : ''}`}
        />
        {isDate ? (
          <>
            <button
              type="button"
              className="absolute inset-y-0 right-1.5 my-auto flex h-6 w-6 items-center justify-center rounded text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-blue-700"
              aria-label="Open date picker"
              onMouseDown={(event) => event.preventDefault()}
              onClick={openPicker}
            >
              v
            </button>
            <input
              ref={pickerRef}
              type="date"
              value={toNativeDateValue(value)}
              onChange={(event) => onChange(event.target.value)}
              className="pointer-events-none absolute right-0 top-full h-px w-px opacity-0"
              tabIndex={-1}
              aria-hidden="true"
            />
          </>
        ) : null}
      </div>
    </label>
  );
}

function EditableCell({
  value,
  onChange,
  type = 'text',
  compactNumber = false,
}: {
  value: string;
  onChange: (value: string) => void;
  type?: string;
  compactNumber?: boolean;
}) {
  return (
    <td className="border-b border-slate-100 px-1.5 py-1.5">
      <input
        type={type === 'date' ? 'text' : type}
        value={type === 'date' ? dateInputValue(value) : type === 'number' && value === '0' ? '' : value}
        placeholder={type === 'date' ? '--/--/----' : undefined}
        onChange={(event) => onChange(type === 'date' ? parseDateInput(event.target.value) : event.target.value)}
        onBlur={(event) => {
          if (type === 'date') {
            onChange(completeDateInput(event.target.value));
          }
        }}
        className={`form-input h-8 rounded-md px-2.5 text-xs ${compactNumber ? 'no-number-spinner' : ''}`}
      />
    </td>
  );
}

function formatItemValue(item: NameListItem, key: keyof NameListItem) {
  const value = item[key];
  if (key === 'isLeader') return value ? 'Yes' : '';
  if (key === 'arriveDate' || key === 'birthDate') {
    return formatDate(typeof value === 'string' ? value : '');
  }
  if (value === null || value === undefined || value === '') return '-';
  return String(value);
}

function formatDate(value?: string) {
  if (!value) return '--/--/----';
  const [year, month, day] = value.slice(0, 10).split('-');
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
}

function dateInputValue(value?: string) {
  if (!value) return '';
  return formatDate(value);
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
  if (/^\d{1,2}$/.test(parsed)) {
    const now = new Date();
    const day = parsed.padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${now.getFullYear()}-${month}-${day}`;
  }
  const dayMonth = parsed.match(/^(\d{1,2})\/(\d{1,2})$/);
  if (dayMonth) {
    const now = new Date();
    return `${now.getFullYear()}-${dayMonth[2].padStart(2, '0')}-${dayMonth[1].padStart(2, '0')}`;
  }
  const [year, month, day] = parsed.slice(0, 10).split('-');
  return year && month && day ? `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}` : parsed;
}

function toNativeDateValue(value?: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value ?? '') ? value ?? '' : '';
}

function extractPartyCode(fileName: string) {
  return fileName
    .replace(/\.[^.]+$/, '')
    .split(/[-\s]*名单/i)[0]
    .trim();
}

function translateImportWarning(message: string) {
  if (message.includes('Passport')) {
    return 'ไม่พบคอลัมน์เลข Passport';
  }
  if (message.includes('English name')) {
    return 'ระบบยังจับคอลัมน์ชื่ออังกฤษไม่ชัดเจน กรุณาเลือกคอลัมน์ชื่อ/นามสกุลเอง';
  }
  if (message.includes('Birth date')) {
    return 'ไม่พบคอลัมน์วันเกิด';
  }
  return message;
}

function fileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('Cannot read selected file.'));
    reader.readAsDataURL(file);
  });
}

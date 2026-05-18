'use client';

import { FormEvent, ReactNode, useEffect, useRef, useState } from 'react';
import { apiFetch } from '@/lib/api';

type BookingReference = {
  id?: string;
  orderDate: string;
  faxNo: string;
  agentCode: string;
  code: string;
  place: string;
  startDate: string;
  endDate: string;
};

type Booking = {
  id: string;
  docDate: string;
  docTime: string;
  docNo: string;
  agentCode: string;
  agentName: string;
  partyCode: string;
  nation: string;
  arriveDate: string;
  departDate: string;
  guideCode: string;
  guideName: string;
  telGuide: string;
  telDriver: string;
  pax: number;
  carCode: string;
  shop: string;
  bookRemark: string;
  dateBookJw: string;
  timeBookJw: string;
  ptyStartDate: string;
  ptyEndDate: string;
  faxNo: string;
  agentCodeRef: string;
  partyCodeRef: string;
  status: boolean;
  upload: boolean;
  references: BookingReference[];
};

type ImportResponse = {
  imported: number;
  skipped: number;
};

type AgentOption = {
  id: string;
  agentCode: string;
  name: string;
};

type AgentMatching = {
  id: string;
  agentCodeRef: string;
  agentId: string;
  agentCode: string;
  agentName: string;
};

type CreateBonusCardsResponse = {
  requested: number;
  created: number;
  skipped: number;
};

type ImportPreviewSection = {
  rowCount: number;
  duplicateCount: number;
  duplicateKeys: string[];
  columns: string[];
  rows: string[][];
};

type ImportPreviewResponse = {
  main: ImportPreviewSection;
  detail: ImportPreviewSection;
};

const today = new Date().toISOString().slice(0, 10);

const emptyBooking: Booking = {
  id: '',
  docDate: today,
  docTime: '',
  docNo: '',
  agentCode: '',
  agentName: '',
  partyCode: '',
  nation: '',
  arriveDate: '',
  departDate: '',
  guideCode: '',
  guideName: '',
  telGuide: '',
  telDriver: '',
  pax: 0,
  carCode: '',
  shop: 'G',
  bookRemark: '',
  dateBookJw: '',
  timeBookJw: '',
  ptyStartDate: '',
  ptyEndDate: '',
  faxNo: '',
  agentCodeRef: '',
  partyCodeRef: '',
  status: false,
  upload: false,
  references: [],
};

const tableColumns: Array<{ key: keyof Booking; label: string; className?: string }> = [
  { key: 'docDate', label: 'Doc Date', className: 'w-[6.5%]' },
  { key: 'docTime', label: 'Doc Time', className: 'w-[5%]' },
  { key: 'agentCode', label: 'Agent Code', className: 'w-[6%]' },
  { key: 'agentName', label: 'Agent Name', className: 'w-[13%]' },
  { key: 'partyCode', label: 'PartyCode', className: 'w-[8%]' },
  { key: 'nation', label: 'Nation', className: 'w-[4.5%]' },
  { key: 'arriveDate', label: 'Arrive Date', className: 'w-[6%]' },
  { key: 'departDate', label: 'Depart Date', className: 'w-[6%]' },
  { key: 'guideCode', label: 'Guide Code', className: 'w-[6%]' },
  { key: 'guideName', label: 'Guide Name', className: 'w-[9%]' },
  { key: 'telGuide', label: 'Tel Guide', className: 'w-[6%]' },
  { key: 'telDriver', label: 'Tel Driver', className: 'w-[6%]' },
  { key: 'pax', label: 'Pax', className: 'w-[3.5%]' },
  { key: 'carCode', label: 'CarCode', className: 'w-[5%]' },
  { key: 'shop', label: 'Shop', className: 'w-[4%]' },
  { key: 'bookRemark', label: 'Book Remark', className: 'w-[9%]' },
  { key: 'dateBookJw', label: 'DateBookJW', className: 'w-[6%]' },
  { key: 'timeBookJw', label: 'TimeBookJW', className: 'w-[5%]' },
  { key: 'ptyStartDate', label: 'PTY Start Date', className: 'w-[6%]' },
  { key: 'ptyEndDate', label: 'PTY End Date', className: 'w-[6%]' },
];

export default function InformationBookingPage() {
  const [rows, setRows] = useState<Booking[]>([]);
  const [filters, setFilters] = useState({
    date: today,
    agent: '',
    nation: '',
    status: 'all',
    upload: 'all',
    search: '',
  });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null);
  const [form, setForm] = useState<Booking>(emptyBooking);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [importMessage, setImportMessage] = useState('');
  const [agentMatchingOpen, setAgentMatchingOpen] = useState(false);

  const selectedRow = selectedIds.length === 1 ? rows.find((row) => row.id === selectedIds[0]) ?? null : null;
  const allRowsSelected = rows.length > 0 && rows.every((row) => selectedIds.includes(row.id));

  const loadRows = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.date) params.set('date', filters.date);
      if (filters.agent) params.set('agent', filters.agent);
      if (filters.nation) params.set('nation', filters.nation);
      if (filters.status !== 'all') params.set('status', filters.status);
      if (filters.upload !== 'all') params.set('upload', filters.upload);
      if (filters.search) params.set('search', filters.search);
      const data = await apiFetch<Booking[]>(`/api/bookings?${params.toString()}`);
      setRows(data);
      setSelectedIds((current) => current.filter((id) => data.some((row) => row.id === id)));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load booking data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.date, filters.agent, filters.nation, filters.status, filters.upload, filters.search]);

  useEffect(() => {
    const bodyOverflow = document.body.style.overflow;
    const htmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = bodyOverflow;
      document.documentElement.style.overflow = htmlOverflow;
    };
  }, []);

  const openCreate = () => {
    const now = new Date();
    setForm({
      ...emptyBooking,
      docDate: toDateInput(now),
      docTime: toTimeInput(now),
      docNo: toDocNo(now),
    });
    setFormMode('create');
  };

  const openEdit = (row: Booking) => {
    setForm({ ...row, references: row.references ?? [] });
    setFormMode('edit');
  };

  const saveForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const body = JSON.stringify({
      ...form,
      pax: Number(form.pax) || 0,
    });
    if (formMode === 'edit') {
      await apiFetch<Booking>(`/api/bookings/${form.id}`, { method: 'PATCH', body });
    } else {
      await apiFetch<Booking>('/api/bookings', { method: 'POST', body });
    }
    setFormMode(null);
    await loadRows();
  };

  const deleteSelected = async () => {
    if (selectedIds.length === 0 || !window.confirm(`Delete ${selectedIds.length} selected booking(s)?`)) {
      return;
    }
    await Promise.all(selectedIds.map((id) => apiFetch(`/api/bookings/${id}`, { method: 'DELETE' })));
    setSelectedIds([]);
    await loadRows();
  };

  const createSelectedBonusCards = async () => {
    if (selectedIds.length === 0) {
      setError('Please select booking rows first.');
      return;
    }
    if (!window.confirm(`Create ${selectedIds.length} selected booking(s) to bonus card?`)) {
      return;
    }
    setError(null);
    setImportMessage('');
    try {
      const result = await apiFetch<CreateBonusCardsResponse>('/api/bookings/create-bonus-cards', {
        method: 'POST',
        body: JSON.stringify({ ids: selectedIds }),
      });
      setImportMessage(
        `Created ${result.created} bonus card rows${
          result.skipped ? `, skipped ${result.skipped}` : ''
        }.`,
      );
      setSelectedIds([]);
      await loadRows();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Create bonus card failed.');
    }
  };

  const toggleRowSelection = (id: string) => {
    setSelectedIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  const toggleAllRows = () => {
    setSelectedIds(allRowsSelected ? [] : rows.map((row) => row.id));
  };

  const exportRows = () => {
    const htmlRows = rows
      .map(
        (row) =>
          `<tr>${tableColumns
            .map((column) => `<td>${escapeHtml(formatBookingValue(row, column.key))}</td>`)
            .join('')}<td>${row.status ? 'Complete' : 'Incomplete'}</td><td>${row.upload ? 'Uploaded' : 'Not Up'}</td></tr>`,
      )
      .join('');
    const html = `<table border="1"><thead><tr>${tableColumns
      .map((column) => `<th>${escapeHtml(column.label)}</th>`)
      .join('')}<th>Status</th><th>Upload</th></tr></thead><tbody>${htmlRows}</tbody></table>`;
    const blob = new Blob([`<meta charset="utf-8" />${html}`], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `information-booking-${filters.date || 'all'}.xls`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="flex h-[calc(100vh-6.5rem)] min-h-0 flex-col gap-3 overflow-hidden">
      <div className="shrink-0 rounded-[10px] border border-slate-200/80 bg-white/95 px-4 py-3 shadow-[0_18px_48px_rgba(15,23,42,0.08)] backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-slate-950">บันทึกการจองเข้าร้าน</h1>
            <p className="text-sm text-slate-500">Booking information management for INFORMATION-BOOKING.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="toolbar-btn-primary" onClick={openCreate}>
              Add Booking
            </button>
            <button type="button" className="toolbar-btn" onClick={() => setImportOpen(true)}>
              Import File Separate
            </button>
            <button type="button" className="toolbar-btn" onClick={() => setAgentMatchingOpen(true)}>
              Agent Matching
            </button>
            <button type="button" className="toolbar-btn" disabled={selectedIds.length === 0} onClick={createSelectedBonusCards}>
              Create to Bonus Card
            </button>
            <button type="button" className="toolbar-btn" onClick={exportRows}>
              Export
            </button>
            <button type="button" className="toolbar-btn" onClick={() => window.print()}>
              Print
            </button>
          </div>
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-[160px_180px_130px_150px_150px_1fr]">
          <FilterDateInput label="Date" value={filters.date} onChange={(date) => setFilters({ ...filters, date })} />
          <FilterInput label="Agent" value={filters.agent} onChange={(agent) => setFilters({ ...filters, agent })} />
          <FilterInput label="Nation" value={filters.nation} onChange={(nation) => setFilters({ ...filters, nation })} />
          <FilterSelect
            label="Status"
            value={filters.status}
            options={[
              ['all', 'All'],
              ['incomplete', 'Incomplete'],
              ['complete', 'Complete'],
            ]}
            onChange={(status) => setFilters({ ...filters, status })}
          />
          <FilterSelect
            label="Upload"
            value={filters.upload}
            options={[
              ['all', 'All'],
              ['not-uploaded', 'Not Up'],
              ['uploaded', 'Uploaded'],
            ]}
            onChange={(upload) => setFilters({ ...filters, upload })}
          />
          <FilterInput
            label="Search"
            value={filters.search}
            placeholder="Search party, guide, agent, car..."
            onChange={(search) => setFilters({ ...filters, search })}
          />
        </div>
      </div>

      {error ? (
        <div className="rounded-md border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      ) : null}
      {importMessage ? (
        <div className="rounded-md border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-800">
          {importMessage}
        </div>
      ) : null}

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[10px] border border-slate-200 bg-white shadow-[0_18px_48px_rgba(15,23,42,0.06)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 text-sm text-slate-500">
          <span>
            Showing {rows.length} bookings
            {selectedIds.length ? ` / selected ${selectedIds.length}` : ''}
          </span>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="toolbar-btn" disabled={!selectedRow} onClick={() => selectedRow && openEdit(selectedRow)}>
              Edit
            </button>
            <button type="button" className="toolbar-btn-danger" disabled={selectedIds.length === 0} onClick={deleteSelected}>
              Delete
            </button>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          <table className="w-full table-fixed border-collapse text-[12px]">
            <thead className="sticky top-0 bg-white">
              <tr>
                <th className="w-9 border-b border-slate-200 px-2 py-2 text-left">
                  <input
                    type="checkbox"
                    checked={allRowsSelected}
                    disabled={rows.length === 0}
                    onChange={toggleAllRows}
                    aria-label="Select all visible bookings"
                  />
                </th>
                {tableColumns.map((column) => (
                  <th
                    key={column.key}
                    className={`border-b border-slate-200 px-2 py-2 text-left text-[10px] font-semibold uppercase text-slate-400 ${column.className ?? ''}`}
                  >
                    {column.label}
                  </th>
                ))}
                <th className="w-[5%] border-b border-slate-200 px-2 py-2 text-left text-[10px] font-semibold uppercase text-slate-400">
                  Status
                </th>
                <th className="w-[5%] border-b border-slate-200 px-2 py-2 text-left text-[10px] font-semibold uppercase text-slate-400">
                  Upload
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={tableColumns.length + 3} className="px-4 py-14 text-center text-sm text-slate-400">
                    Loading bookings...
                  </td>
                </tr>
              ) : null}
              {!loading && rows.length === 0 ? (
                <tr>
                  <td colSpan={tableColumns.length + 3} className="px-4 py-14 text-center text-sm text-slate-400">
                    No booking data.
                  </td>
                </tr>
              ) : null}
              {!loading &&
                rows.map((row) => (
                  <tr
                    key={row.id}
                    className={`cursor-pointer transition hover:bg-blue-50 ${selectedIds.includes(row.id) ? 'bg-blue-50' : ''}`}
                    onClick={() => toggleRowSelection(row.id)}
                  >
                    <td className="border-b border-slate-100 px-2 py-2">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(row.id)}
                        onClick={(event) => event.stopPropagation()}
                        onChange={() => toggleRowSelection(row.id)}
                      />
                    </td>
                    {tableColumns.map((column) => (
                      <td key={column.key} className="truncate border-b border-slate-100 px-2 py-2 text-slate-700" title={formatBookingValue(row, column.key)}>
                        {formatBookingValue(row, column.key)}
                      </td>
                    ))}
                    <td className="truncate border-b border-slate-100 px-2 py-2">
                      <StatusPill active={row.status} activeText="Complete" inactiveText="Incomplete" />
                    </td>
                    <td className="truncate border-b border-slate-100 px-2 py-2">
                      <StatusPill active={row.upload} activeText="Uploaded" inactiveText="Not Up" />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {formMode ? (
        <BookingModal
          mode={formMode}
          form={form}
          onChange={setForm}
          onClose={() => setFormMode(null)}
          onSubmit={saveForm}
        />
      ) : null}
      {importOpen ? (
        <ImportModal
          onClose={() => setImportOpen(false)}
          onImported={async (message) => {
            setImportMessage(message);
            setImportOpen(false);
            await loadRows();
          }}
        />
      ) : null}
      {agentMatchingOpen ? (
        <AgentMatchingModal
          onClose={() => setAgentMatchingOpen(false)}
        />
      ) : null}
    </section>
  );
}

function BookingModal({
  mode,
  form,
  onChange,
  onClose,
  onSubmit,
}: {
  mode: 'create' | 'edit';
  form: Booking;
  onChange: (value: Booking) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const setField = (key: keyof Booking, value: string | number | boolean) => {
    onChange({ ...form, [key]: value });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <form
        onSubmit={onSubmit}
        className="flex max-h-[90vh] w-[calc(100vw-180px)] max-w-[1400px] flex-col overflow-hidden rounded-[10px] border border-slate-200/80 bg-white/95 shadow-[0_24px_70px_rgba(15,23,42,0.18)] backdrop-blur"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-2">
          <div>
            <h2 className="text-xl font-semibold leading-tight text-slate-950">
              {mode === 'create' ? 'Add Booking' : 'Edit Booking'}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">Booking detail, reference, status, and upload tracking.</p>
          </div>
          <button type="button" className="toolbar-btn" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-hidden p-2">
          <div className="grid gap-2 xl:grid-cols-[minmax(0,1fr)_540px]">
          <FormSection title="General">
            <CheckField label="Complete" checked={form.status} onChange={(status) => setField('status', status)} />
            <DateField label="Date" value={form.docDate} onChange={(value) => setField('docDate', value)} disabled />
            <TimeField label="Doc Time" value={form.docTime} onChange={(value) => setField('docTime', value)} disabled />
            <Field label="Doc No" value={form.docNo} onChange={(value) => setField('docNo', value)} disabled />
            <Field label="รหัส Agent" value={form.agentCode} onChange={(value) => setField('agentCode', value)} />
            <Field label="ชื่อ Agent" value={form.agentName} onChange={(value) => setField('agentName', value)} wide />
            <Field label="Party Code" value={form.partyCode} onChange={(value) => setField('partyCode', value)} />
            <DateField label="Arrive Date" value={form.arriveDate} onChange={(value) => setField('arriveDate', value)} />
            <Field label="ชนชาติ" value={form.nation} onChange={(value) => setField('nation', value)} />
            <SelectField
              label="First Shop"
              value={form.shop}
              options={[
                ['G', 'G'],
                ['W', 'W'],
                ['N', 'N'],
              ]}
              onChange={(value) => setField('shop', value)}
            />
            <Field label="Pax" type="number" value={form.pax} onChange={(value) => setField('pax', Number(value))} />
            <Field label="รหัส Guide" value={form.guideCode} onChange={(value) => setField('guideCode', value)} />
            <Field label="ชื่อ Guide" value={form.guideName} onChange={(value) => setField('guideName', value)} wide />
            <Field label="Tel Guide" value={form.telGuide} onChange={(value) => setField('telGuide', value)} />
            <Field label="ทะเบียนรถ" value={form.carCode} onChange={(value) => setField('carCode', value)} />
            <Field label="Tel พขร." value={form.telDriver} onChange={(value) => setField('telDriver', value)} />
            <DateField label="Departure Date" value={form.departDate} onChange={(value) => setField('departDate', value)} />
            <TextArea label="Book Remark" value={form.bookRemark} onChange={(value) => setField('bookRemark', value)} compact wide />
          </FormSection>

          <div className="min-h-0 space-y-3 overflow-hidden">
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-2">
            <FormSection title="Book" compact>
              <DateField label="Date" value={form.dateBookJw} onChange={(value) => setField('dateBookJw', value)} />
              <TimeField label="Time" value={form.timeBookJw} onChange={(value) => setField('timeBookJw', value)} />
            </FormSection>

            <FormSection title="Book PTY" compact>
              <DateField label="ตั้งแต่" value={form.ptyStartDate} onChange={(value) => setField('ptyStartDate', value)} />
              <DateField label="ถึง" value={form.ptyEndDate} onChange={(value) => setField('ptyEndDate', value)} />
            </FormSection>
          </div>

          <FormSection title="Booking Reference" compact>
            <DateField label="Order Date" value={form.dateBookJw} onChange={(value) => setField('dateBookJw', value)} />
            <Field label="Agent Ref" value={form.agentCodeRef} onChange={(value) => setField('agentCodeRef', value)} />
            <Field label="Fax No" value={form.faxNo} onChange={(value) => setField('faxNo', value)} />
            <Field label="PartyCode Ref" value={form.partyCodeRef} onChange={(value) => setField('partyCodeRef', value)} />
            <TextArea label="Book Remark" value={form.bookRemark} onChange={(value) => setField('bookRemark', value)} compact />
          </FormSection>
          </div>
          </div>

          <section className="mt-2 rounded-[8px] border border-slate-200 bg-slate-50/60 p-2">
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-slate-800">Reference Details</h3>
            </div>
            <div className="max-h-40 space-y-1.5 overflow-auto rounded-md border border-slate-200 bg-white p-1.5">
              {form.references.length === 0 ? (
                <div className="px-4 py-4 text-center text-sm text-slate-400">No reference rows.</div>
              ) : null}
              {form.references.map((reference, index) => (
                <div key={`${reference.faxNo}-${index}`} className="grid gap-2 rounded-md border border-slate-100 bg-slate-50/60 p-2 md:grid-cols-4 xl:grid-cols-7">
                  <ReferenceField label="Order Date" type="date" value={reference.orderDate} />
                  <ReferenceField label="Fax No" value={reference.faxNo} />
                  <ReferenceField label="Agent Code" value={reference.agentCode} />
                  <ReferenceField label="Code" value={reference.code} />
                  <ReferenceField label="Place" value={reference.place} />
                  <ReferenceField label="Start Date" type="date" value={reference.startDate} />
                  <ReferenceField label="End Date" type="date" value={reference.endDate} />
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 bg-white/95 px-4 py-2 backdrop-blur">
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

function AgentMatchingModal({ onClose }: { onClose: () => void }) {
  const [rows, setRows] = useState<AgentMatching[]>([]);
  const [agents, setAgents] = useState<AgentOption[]>([]);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editing, setEditing] = useState<AgentMatching | null>(null);
  const [agentCodeRef, setAgentCodeRef] = useState('');
  const [agentId, setAgentId] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  const selected = rows.find((row) => row.id === selectedId) ?? null;
  const agentOptions =
    editing && agentId && !agents.some((agent) => agent.id === agentId)
      ? [
          {
            id: agentId,
            agentCode: editing.agentCode,
            name: editing.agentName,
          },
          ...agents,
        ]
      : agents;

  const loadRows = async () => {
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    const data = await apiFetch<AgentMatching[]>(`/api/bookings/agent-matchings?${params.toString()}`);
    setRows(data);
    setSelectedId((current) => (current && data.some((row) => row.id === current) ? current : null));
  };

  const loadAgents = async () => {
    const data = await apiFetch<AgentOption[]>('/api/agents/options');
    setAgents(data);
  };

  useEffect(() => {
    void loadRows();
    void loadAgents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openAdd = () => {
    setEditing(null);
    setAgentCodeRef('');
    setAgentId(agents[0]?.id ?? '');
    setError(null);
    setDetailOpen(true);
  };

  const openEdit = () => {
    if (!selected) {
      setError('Please select mapping first.');
      return;
    }
    setEditing(selected);
    setAgentCodeRef(selected.agentCodeRef);
    setAgentId(selected.agentId);
    setError(null);
    setDetailOpen(true);
  };

  const save = async () => {
    const agent = agents.find((item) => item.id === agentId);
    const body = JSON.stringify({
      agentCodeRef,
      agentId,
      agentCode: agent?.agentCode,
    });
    if (editing) {
      await apiFetch(`/api/bookings/agent-matchings/${editing.id}`, { method: 'PATCH', body });
    } else {
      await apiFetch('/api/bookings/agent-matchings', { method: 'POST', body });
    }
    setDetailOpen(false);
    setMessage('Agent matching saved.');
    await loadRows();
  };

  const remove = async () => {
    if (!selected || !window.confirm(`Delete mapping "${selected.agentCodeRef}"?`)) {
      return;
    }
    await apiFetch(`/api/bookings/agent-matchings/${selected.id}`, { method: 'DELETE' });
    setSelectedId(null);
    setMessage('Agent matching deleted.');
    await loadRows();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <div className="flex max-h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-[10px] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.18)]">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Agent Matching</h2>
            <p className="text-sm text-slate-500">Map Agent Code Ref from Main/Detail files to Agent master codes.</p>
          </div>
          <button type="button" className="toolbar-btn" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-slate-50 px-5 py-3">
          <button type="button" className="toolbar-btn-primary" onClick={openAdd}>
            Add
          </button>
          <button type="button" className="toolbar-btn" onClick={openEdit}>
            Edit
          </button>
          <button type="button" className="toolbar-btn-danger" onClick={remove}>
            Delete
          </button>
          <button type="button" className="toolbar-btn" onClick={loadRows}>
            Refresh
          </button>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Enter text to search..."
            className="form-input ml-auto max-w-xs rounded-md"
          />
          <button type="button" className="toolbar-btn" onClick={loadRows}>
            Find
          </button>
          {message ? <span className="text-sm font-semibold text-blue-800">{message}</span> : null}
          {error ? <span className="text-sm font-semibold text-red-700">{error}</span> : null}
        </div>

        <div className="min-h-0 flex-1 overflow-auto">
          <table className="w-full min-w-[760px] border-collapse text-sm">
            <thead className="sticky top-0 bg-white">
              <tr>
                <th className="w-8 border-b border-slate-200 px-3 py-2 text-left" />
                <th className="border-b border-slate-200 px-3 py-2 text-left text-xs font-semibold uppercase text-slate-400">Agent Code Ref</th>
                <th className="border-b border-slate-200 px-3 py-2 text-left text-xs font-semibold uppercase text-slate-400">Agent Code</th>
                <th className="border-b border-slate-200 px-3 py-2 text-left text-xs font-semibold uppercase text-slate-400">Agent Name</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => setSelectedId(row.id)}
                  className={`cursor-pointer hover:bg-blue-50 ${selectedId === row.id ? 'bg-blue-50' : ''}`}
                >
                  <td className="border-b border-slate-100 px-3 py-2">
                    <input
                      type="checkbox"
                      checked={selectedId === row.id}
                      onChange={() => setSelectedId(selectedId === row.id ? null : row.id)}
                      onClick={(event) => event.stopPropagation()}
                    />
                  </td>
                  <td className="border-b border-slate-100 px-3 py-2 font-semibold text-slate-900">{row.agentCodeRef}</td>
                  <td className="border-b border-slate-100 px-3 py-2 text-slate-700">{row.agentCode}</td>
                  <td className="border-b border-slate-100 px-3 py-2 text-slate-700">{row.agentName || '-'}</td>
                </tr>
              ))}
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-sm text-slate-400">
                    No agent matching data.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      {detailOpen ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-2xl rounded-[10px] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.18)]">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h3 className="text-lg font-semibold text-slate-950">Matching Agent Detail</h3>
              <button type="button" className="toolbar-btn" onClick={() => setDetailOpen(false)}>
                Cancel
              </button>
            </div>
            <div className="space-y-4 px-5 py-5">
              <label className="grid gap-2 md:grid-cols-[150px_1fr] md:items-center">
                <span className="text-sm font-semibold text-slate-700">Agent Code Ref</span>
                <input
                  value={agentCodeRef}
                  onChange={(event) => setAgentCodeRef(event.target.value)}
                  className="form-input rounded-md"
                />
              </label>
              <label className="grid gap-2 md:grid-cols-[150px_1fr] md:items-center">
                <span className="text-sm font-semibold text-slate-700">Agent Code</span>
                <select value={agentId} onChange={(event) => setAgentId(event.target.value)} className="form-input rounded-md">
                  <option value="">Please select</option>
                  {agentOptions.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.agentCode} - {agent.name || 'No Agent'}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="flex justify-end gap-3 border-t border-slate-200 px-5 py-4">
              <button type="button" className="toolbar-btn" onClick={() => setDetailOpen(false)}>
                Cancel
              </button>
              <button type="button" className="toolbar-btn-primary" onClick={save}>
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ImportModal({
  onClose,
  onImported,
}: {
  onClose: () => void;
  onImported: (message: string) => void;
}) {
  const [mainFile, setMainFile] = useState<File | null>(null);
  const [detailFile, setDetailFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportPreviewResponse | null>(null);
  const [activePreview, setActivePreview] = useState<'main' | 'detail'>('main');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmDuplicateOpen, setConfirmDuplicateOpen] = useState(false);
  const previewRows = activePreview === 'main' ? preview?.main : preview?.detail;
  const duplicateCount = (preview?.main.duplicateCount ?? 0) + (preview?.detail.duplicateCount ?? 0);
  const canImport = Boolean(preview) && !loading;

  const runImport = async () => {
    if (!mainFile) {
      setError('Main file is required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await apiFetch<ImportResponse>('/api/bookings/import-separate', {
        method: 'POST',
        body: JSON.stringify({
          mainFileName: mainFile.name,
          mainFileBase64: await fileToBase64(mainFile),
          detailFileName: detailFile?.name,
          detailFileBase64: detailFile ? await fileToBase64(detailFile) : undefined,
          clientImportedAt: toLocalDateTime(new Date()),
        }),
      });
      onImported(`Imported ${result.imported} booking rows.`);
    } catch (importError) {
      setError(importError instanceof Error ? importError.message : 'Import failed.');
    } finally {
      setLoading(false);
    }
  };

  const importFiles = async () => {
    if (!preview) {
      setError('Please check duplicate / preview before import.');
      return;
    }
    if (duplicateCount > 0) {
      setConfirmDuplicateOpen(true);
      return;
    }
    await runImport();
  };

  const previewFiles = async () => {
    if (!mainFile) {
      setError('Main file is required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await apiFetch<ImportPreviewResponse>('/api/bookings/import-preview', {
        method: 'POST',
        body: JSON.stringify({
          mainFileName: mainFile.name,
          mainFileBase64: await fileToBase64(mainFile),
          detailFileName: detailFile?.name,
          detailFileBase64: detailFile ? await fileToBase64(detailFile) : undefined,
        }),
      });
      setPreview(result);
      setActivePreview('main');
    } catch (previewError) {
      setError(previewError instanceof Error ? previewError.message : 'Preview failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <div className="max-h-[92vh] w-full max-w-6xl overflow-auto rounded-[10px] border border-slate-200 bg-white p-5 shadow-[0_24px_70px_rgba(15,23,42,0.18)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Import File Separate</h2>
            <p className="mt-1 text-sm text-slate-500">Upload Main_YYYY-MM-DD.txt and Detail_YYYY-MM-DD.txt.</p>
          </div>
          <button type="button" className="toolbar-btn" onClick={onClose}>
            Close
          </button>
        </div>
        {error ? <div className="mt-4 rounded-md border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div> : null}
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <FileField
            label="Main file"
            file={mainFile}
            onChange={(file) => {
              setMainFile(file);
              setPreview(null);
              setConfirmDuplicateOpen(false);
            }}
          />
          <FileField
            label="Detail file"
            file={detailFile}
            onChange={(file) => {
              setDetailFile(file);
              setPreview(null);
              setConfirmDuplicateOpen(false);
            }}
          />
        </div>

        <div className="mt-5 rounded-[8px] border border-slate-200 bg-slate-50/60">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
            <div className="flex rounded-md border border-slate-200 bg-slate-50 p-1">
              <button
                type="button"
                className={`rounded px-4 py-2 text-sm font-semibold ${activePreview === 'main' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600'}`}
                onClick={() => setActivePreview('main')}
              >
                Main
              </button>
              <button
                type="button"
                className={`rounded px-4 py-2 text-sm font-semibold ${activePreview === 'detail' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600'}`}
                onClick={() => setActivePreview('detail')}
              >
                Detail
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
              {previewRows ? (
                <>
                  <span>Rows: {previewRows.rowCount}</span>
                  <span className={previewRows.duplicateCount ? 'font-semibold text-red-600' : 'font-semibold text-emerald-700'}>
                    Duplicate: {previewRows.duplicateCount}
                  </span>
                </>
              ) : (
                <span>Preview file before import.</span>
              )}
              <button type="button" className="toolbar-btn" disabled={loading || !mainFile} onClick={previewFiles}>
                {loading ? 'Checking...' : 'Check Duplicate / Preview'}
              </button>
            </div>
          </div>
          <div className="max-h-[340px] overflow-auto bg-white">
            {previewRows ? (
              <table className="w-full min-w-[1100px] border-collapse text-sm">
                <thead className="sticky top-0 bg-slate-50">
                  <tr>
                    {previewRows.columns.map((column, index) => (
                      <th key={`${column}-${index}`} className="border-b border-slate-200 px-3 py-2 text-left text-xs font-semibold uppercase text-slate-400">
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewRows.rows.map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-blue-50">
                      {previewRows.columns.map((_, columnIndex) => (
                        <td key={columnIndex} className="border-b border-slate-100 px-3 py-2 text-slate-700">
                          {row[columnIndex] ?? ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="px-4 py-12 text-center text-sm text-slate-400">No preview data.</div>
            )}
          </div>
          {previewRows?.duplicateKeys.length ? (
            <div className="border-t border-red-100 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
              Duplicate keys: {previewRows.duplicateKeys.slice(0, 8).join(', ')}
              {previewRows.duplicateKeys.length > 8 ? '...' : ''}
            </div>
          ) : null}
        </div>
        <div className="mt-5 flex justify-end gap-3">
          <button type="button" className="toolbar-btn" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="toolbar-btn-primary" disabled={!canImport} onClick={importFiles}>
            {loading ? 'Importing...' : 'Import'}
          </button>
        </div>
      </div>
      {confirmDuplicateOpen ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-md rounded-[10px] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.18)]">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-950">Confirm Import</h3>
                <p className="mt-1 text-sm text-slate-500">Duplicate data was found in the preview.</p>
              </div>
              <button
                type="button"
                className="rounded-md px-2 py-1 text-xl leading-none text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                onClick={() => setConfirmDuplicateOpen(false)}
                aria-label="Close confirmation"
              >
                ×
              </button>
            </div>
            <div className="px-5 py-5">
              <div className="rounded-md border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
                มีข้อมูล Party Code Ref ซ้ำ ต้องการ Import ข้อมูลเข้าใช่หรือไม่?
              </div>
              <div className="mt-5 flex justify-end gap-3">
                <button
                  type="button"
                  className="toolbar-btn"
                  onClick={() => setConfirmDuplicateOpen(false)}
                >
                  No
                </button>
                <button
                  type="button"
                  className="toolbar-btn-primary"
                  onClick={() => {
                    setConfirmDuplicateOpen(false);
                    void runImport();
                  }}
                >
                  Yes, Import
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function FormSection({ title, children, compact = false }: { title: string; children: ReactNode; compact?: boolean }) {
  return (
    <section className="rounded-[8px] border border-slate-200 bg-slate-50/60 p-2">
      <h3 className="mb-1.5 text-sm font-semibold text-slate-800">{title}</h3>
      <div className={`grid gap-1.5 md:grid-cols-2 ${compact ? '' : 'xl:grid-cols-4'}`}>{children}</div>
    </section>
  );
}

function Field({
  label,
  value,
  type = 'text',
  wide = false,
  disabled = false,
  onChange,
}: {
  label: string;
  value: string | number;
  type?: string;
  wide?: boolean;
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label className={`space-y-1 ${wide ? 'md:col-span-2' : ''}`}>
      <span className="text-xs font-semibold text-slate-700">{label}</span>
      <input
        type={type}
        value={value ?? ''}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="form-input h-8 rounded-md text-sm disabled:bg-slate-100 disabled:text-slate-500"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<[string, string]>;
  onChange: (value: string) => void;
}) {
  return (
    <label className="space-y-1">
      <span className="text-xs font-semibold text-slate-700">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="form-input h-8 rounded-md text-sm">
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}

function DateField({
  label,
  value,
  disabled = false,
  onChange,
}: {
  label: string;
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  const completeDate = (rawValue: string) => {
    onChange(completeDateInput(rawValue));
  };

  return (
    <label className="space-y-1">
      <span className="text-xs font-semibold text-slate-700">{label}</span>
      <input
        type="text"
        value={dateInputValue(value)}
        disabled={disabled}
        placeholder="--/--/----"
        onChange={(event) => onChange(parseDateInput(event.target.value))}
        onBlur={(event) => completeDate(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            completeDate(event.currentTarget.value);
          }
        }}
        className="form-input h-8 rounded-md text-sm disabled:bg-slate-100 disabled:text-slate-500"
      />
    </label>
  );
}

function TimeField({
  label,
  value,
  disabled = false,
  onChange,
}: {
  label: string;
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label className="space-y-1">
      <span className="text-xs font-semibold text-slate-700">{label}</span>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-2][0-9]:[0-5][0-9]"
        value={value ? normalTimeValue(value) || value : ''}
        disabled={disabled}
        placeholder="--:--"
        onChange={(event) => onChange(event.target.value)}
        className="form-input h-8 rounded-md text-sm disabled:bg-slate-100 disabled:text-slate-500"
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  compact = false,
  wide = false,
  onChange,
}: {
  label: string;
  value: string;
  compact?: boolean;
  wide?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label className={`space-y-1 md:col-span-2 ${wide ? 'xl:col-span-4' : ''}`}>
      <span className="text-xs font-semibold text-slate-700">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`${compact ? 'min-h-8' : 'min-h-14'} w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100`}
      />
    </label>
  );
}

function CheckField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label
      className={`flex h-8 items-center gap-2 self-end rounded-md border px-3 text-sm font-semibold shadow-sm transition ${
        checked
          ? 'border-emerald-300 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-100'
          : 'border-red-300 bg-red-50 text-red-800 ring-2 ring-red-100'
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className={`h-4 w-4 ${checked ? 'accent-emerald-600' : 'accent-red-600'}`}
      />
      <span>{label}</span>
      <span
        className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
          checked ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
        }`}
      >
        {checked ? 'Complete' : 'Incomplete'}
      </span>
    </label>
  );
}

function FilterInput({
  label,
  value,
  type = 'text',
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  type?: string;
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="space-y-1">
      <span className="text-xs font-semibold uppercase text-slate-400">{label}</span>
      <input type={type} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} className="form-input rounded-md" />
    </label>
  );
}

function FilterDateInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const [displayValue, setDisplayValue] = useState(dateInputValue(value));
  const pickerRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDisplayValue(dateInputValue(value));
  }, [value]);

  const openPicker = () => {
    const picker = pickerRef.current as (HTMLInputElement & { showPicker?: () => void }) | null;
    try {
      if (picker?.showPicker) {
        picker.showPicker();
        return;
      }
    } catch {
      // Some browsers only allow the native picker from direct click events.
    }
    picker?.focus();
    picker?.click();
  };

  return (
    <label className="space-y-1">
      <span className="text-xs font-semibold uppercase text-slate-400">{label}</span>
      <div className="relative">
        <input
          type="text"
          value={displayValue}
          placeholder="dd/mm/yyyy"
          onClick={openPicker}
          onFocus={openPicker}
          onChange={(event) => {
            const nextValue = event.target.value;
            setDisplayValue(nextValue);
            if (!nextValue.trim()) {
              onChange('');
              return;
            }
            if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(nextValue.trim())) {
              onChange(parseDateInput(nextValue));
            }
          }}
          onBlur={(event) => {
            const completed = completeDateInput(event.target.value);
            onChange(completed);
            setDisplayValue(dateInputValue(completed));
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              const completed = completeDateInput(event.currentTarget.value);
              onChange(completed);
              setDisplayValue(dateInputValue(completed));
            }
          }}
          className="form-input rounded-md pr-10"
        />
        <button
          type="button"
          className="absolute inset-y-0 right-2 my-auto flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-blue-700"
          aria-label="Open date picker"
          onClick={openPicker}
        >
          <span aria-hidden="true" className="text-[15px] leading-none">
            ▾
          </span>
        </button>
        <input
          ref={pickerRef}
          type="date"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="pointer-events-none absolute inset-0 h-full w-full opacity-0"
          tabIndex={-1}
          aria-hidden="true"
        />
      </div>
    </label>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<[string, string]>;
  onChange: (value: string) => void;
}) {
  return (
    <label className="space-y-1">
      <span className="text-xs font-semibold uppercase text-slate-400">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="form-input rounded-md">
        {options.map(([optionValue, labelText]) => (
          <option key={optionValue} value={optionValue}>
            {labelText}
          </option>
        ))}
      </select>
    </label>
  );
}

function FileField({ label, file, onChange }: { label: string; file: File | null; onChange: (file: File | null) => void }) {
  return (
    <label className="block rounded-md border border-slate-200 bg-slate-50 p-4">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <input className="mt-3 w-full text-sm" type="file" accept=".txt,.xls,.xlsx" onChange={(event) => onChange(event.target.files?.[0] ?? null)} />
      <span className="mt-2 block text-xs text-slate-500">{file?.name ?? 'No file selected'}</span>
    </label>
  );
}

function ReferenceField({
  label,
  value,
  type = 'text',
}: {
  label: string;
  value: string;
  type?: string;
}) {
  const isDate = type === 'date';

  return (
    <label className="space-y-1">
      <span className="text-[10px] font-semibold uppercase text-slate-400">{label}</span>
      <input
        type="text"
        value={isDate ? dateInputValue(value) : value ?? ''}
        placeholder={isDate ? '--/--/----' : undefined}
        disabled
        readOnly
        className="form-input h-8 rounded-md bg-slate-100 text-xs text-slate-600"
      />
    </label>
  );
}

function StatusPill({
  active,
  activeText,
  inactiveText,
}: {
  active: boolean;
  activeText: string;
  inactiveText: string;
}) {
  return (
    <span className={`inline-flex max-w-full truncate rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
      {active ? activeText : inactiveText}
    </span>
  );
}

function formatBookingValue(row: Booking, key: keyof Booking) {
  const value = row[key];
  if (typeof value === 'string' && key.toLowerCase().includes('date')) {
    return formatDate(value);
  }
  return String(value ?? '');
}

function formatDate(value: string) {
  if (!value) return '--/--/----';
  const [year, month, day] = value.slice(0, 10).split('-');
  return year && month && day ? `${day}/${month}/${year}` : value;
}

function dateInputValue(value: string) {
  return value ? formatDate(value) : '';
}

function parseDateInput(value: string) {
  const trimmed = value.trim();
  if (!trimmed || trimmed === '--/--/----') {
    return '';
  }
  const match = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) {
    return trimmed;
  }
  const day = match[1].padStart(2, '0');
  const month = match[2].padStart(2, '0');
  return `${match[3]}-${month}-${day}`;
}

function completeDateInput(value: string) {
  const parsed = parseDateInput(value);
  if (!parsed) {
    return '';
  }
  if (/^\d{1,2}$/.test(parsed)) {
    const now = new Date();
    const day = parsed.padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${now.getFullYear()}-${month}-${day}`;
  }
  return parsed;
}

function normalTimeValue(value: string) {
  const match = value.match(/^(\d{1,2}):(\d{2})/);
  if (!match) {
    return '';
  }
  return `${match[1].padStart(2, '0')}:${match[2]}`;
}

function toDateInput(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function toTimeInput(value: Date) {
  return `${String(value.getHours()).padStart(2, '0')}:${String(value.getMinutes()).padStart(2, '0')}`;
}

function toDocNo(value: Date) {
  return [
    value.getFullYear(),
    String(value.getMonth() + 1).padStart(2, '0'),
    String(value.getDate()).padStart(2, '0'),
    String(value.getHours()).padStart(2, '0'),
    String(value.getMinutes()).padStart(2, '0'),
    String(value.getSeconds()).padStart(2, '0'),
    String(value.getMilliseconds()).padStart(3, '0'),
  ].join('');
}

function toLocalDateTime(value: Date) {
  return `${toDateInput(value)}T${toTimeInput(value)}:${String(value.getSeconds()).padStart(2, '0')}.${String(value.getMilliseconds()).padStart(3, '0')}`;
}

function fileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Unable to read file.'));
    reader.onload = () => resolve(String(reader.result ?? '').split(',')[1] ?? '');
    reader.readAsDataURL(file);
  });
}

function escapeHtml(value: unknown) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

'use client';

import { FormEvent, ReactNode, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CalendarIcon,
  EditIcon,
  LinkIcon,
  PlusIcon,
  RefreshIcon,
  SaveIcon,
  SearchIcon,
  TrashIcon,
  UploadIcon,
  XIcon,
} from '@/components/ui/icons';
import { DataPanel, PageHeader, PageShell } from '@/components/ui/page-shell';
import { LoadingState } from '@/components/ui/loading-state';
import { useDialog } from '@/components/ui/dialog-provider';
import { apiFetch } from '@/lib/api';
import { preventEnterSubmit } from '@/lib/form-behavior';

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
  createdAt?: string;
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
  bonusCode: string;
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

type BonusPreviewRow = Booking & {
  previewBonus: string;
};

type BonusCodeResponse = {
  requested: number;
  rows: Array<{ id: string; bonus: string }>;
};

type BonusUploadResponse = {
  requested: number;
  created: number;
  skipped: number;
};

type BookingUploadRefreshDetail = {
  workDate?: string;
  bonusCode?: string;
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
  bonusCode: '',
  status: false,
  upload: false,
  references: [],
};

const tableColumns: Array<{ key: keyof Booking; label: string; className?: string }> = [
  { key: 'docDate', label: 'Doc Date', className: 'w-[6.2%]' },
  { key: 'docTime', label: 'Time', className: 'w-[4.2%]' },
  { key: 'agentCode', label: 'Agent', className: 'w-[5.3%]' },
  { key: 'agentName', label: 'Agent Name', className: 'w-[8.5%]' },
  { key: 'partyCode', label: 'Party Code', className: 'w-[8.2%]' },
  { key: 'nation', label: 'Nation', className: 'w-[3.8%]' },
  { key: 'arriveDate', label: 'Arrive', className: 'w-[6%]' },
  { key: 'departDate', label: 'Depart', className: 'w-[6%]' },
  { key: 'guideCode', label: 'Guide Code', className: 'hidden' },
  { key: 'guideName', label: 'Guide', className: 'w-[6.5%]' },
  { key: 'telGuide', label: 'Tel Guide', className: 'hidden' },
  { key: 'telDriver', label: 'Tel Driver', className: 'hidden' },
  { key: 'pax', label: 'Pax', className: 'w-[3.5%]' },
  { key: 'carCode', label: 'Car', className: 'w-[5.2%]' },
  { key: 'shop', label: 'Shop', className: 'hidden xl:table-cell xl:w-[3.5%]' },
  { key: 'bookRemark', label: 'Remark', className: 'w-[7.2%]' },
  { key: 'dateBookJw', label: 'Date JW', className: 'hidden' },
  { key: 'timeBookJw', label: 'Time JW', className: 'hidden' },
  { key: 'ptyStartDate', label: 'PTY Start', className: 'w-[6%]' },
  { key: 'ptyEndDate', label: 'PTY End', className: 'w-[6%]' },
];

export default function InformationBookingPage() {
  const { requestConfirmation } = useDialog();
  const [rows, setRows] = useState<Booking[]>([]);
  const [filters, setFilters] = useState({
    date: '',
    agent: '',
    nation: '',
    status: 'all',
    upload: 'all',
    search: '',
  });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null);
  const [form, setForm] = useState<Booking>(emptyBooking);
  const [bookingSaveState, setBookingSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [importMessage, setImportMessage] = useState('');
  const [agentMatchingOpen, setAgentMatchingOpen] = useState(false);
  const [createBonusOpen, setCreateBonusOpen] = useState(false);

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
    const refreshBookingUploadStatus = (detail?: BookingUploadRefreshDetail) => {
      if (detail?.workDate && detail?.bonusCode) {
        setRows((current) =>
          current.map((row) =>
            row.dateBookJw === detail.workDate && row.bonusCode === detail.bonusCode
              ? { ...row, upload: false }
              : row,
          ),
        );
      }
      void loadRows();
    };

    const onBookingUploadStatusChanged = (event: Event) => {
      refreshBookingUploadStatus((event as CustomEvent<BookingUploadRefreshDetail>).detail);
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key !== 'g-hub:booking-upload-status-changed' || !event.newValue) return;
      try {
        refreshBookingUploadStatus(JSON.parse(event.newValue) as BookingUploadRefreshDetail);
      } catch {
        refreshBookingUploadStatus();
      }
    };

    window.addEventListener('g-hub:booking-upload-status-changed', onBookingUploadStatusChanged);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('g-hub:booking-upload-status-changed', onBookingUploadStatusChanged);
      window.removeEventListener('storage', onStorage);
    };
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
    setBookingSaveState('idle');
    setFormMode('create');
  };

  const openEdit = (row: Booking) => {
    setForm({ ...row, references: row.references ?? [] });
    setBookingSaveState('idle');
    setFormMode('edit');
  };

  const saveForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (formMode === 'edit' && form.upload) {
      setBookingSaveState('idle');
      return;
    }
    setBookingSaveState('saving');
    const body = JSON.stringify({
      ...form,
      pax: Number(form.pax) || 0,
    });
    try {
      if (formMode === 'edit') {
        const saved = await apiFetch<Booking>(`/api/bookings/${form.id}`, { method: 'PATCH', body });
        const savedRow = { ...saved, references: saved.references ?? [] };
        setForm(savedRow);
        setRows((current) => current.map((row) => (row.id === savedRow.id ? savedRow : row)));
        setBookingSaveState('saved');
        return;
      }

      await apiFetch<Booking>('/api/bookings', { method: 'POST', body });
      setFormMode(null);
      setBookingSaveState('idle');
      await loadRows();
    } catch (saveError) {
      setBookingSaveState('idle');
      setError(saveError instanceof Error ? saveError.message : 'Failed to save booking.');
    }
  };

  const deleteSelected = async () => {
    if (
      selectedIds.length === 0 ||
      !(await requestConfirmation({
        message: `Delete ${selectedIds.length} selected booking(s)?`,
        variant: 'danger',
      }))
    ) {
      return;
    }
    await Promise.all(selectedIds.map((id) => apiFetch(`/api/bookings/${id}`, { method: 'DELETE' })));
    setSelectedIds([]);
    await loadRows();
  };

  const toggleRowSelection = (id: string) => {
    setSelectedIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  const toggleAllRows = () => {
    setSelectedIds(allRowsSelected ? [] : rows.map((row) => row.id));
  };

  return (
    <PageShell className="h-full !max-w-[calc(100vw-2rem)] gap-3 overflow-hidden">
      <PageHeader
        eyebrow="Operations · Booking"
        title="บันทึกการจองเข้าร้าน"
        description="Booking information management for INFORMATION-BOOKING."
        actions={
          <>
            <button type="button" className="toolbar-btn-primary" onClick={openCreate}>
              <PlusIcon className="erp-action-icon" /> Add Booking
            </button>
            <button type="button" className="toolbar-btn-excel" onClick={() => setImportOpen(true)}>
              <UploadIcon className="erp-action-icon" /> Import File Separate
            </button>
            <button type="button" className="toolbar-btn" onClick={() => setAgentMatchingOpen(true)}>
              <LinkIcon className="erp-action-icon" /> Agent Matching
            </button>
            <button type="button" className="toolbar-btn" onClick={() => setCreateBonusOpen(true)}>
              <PlusIcon className="erp-action-icon" /> Create to Bonus Card
            </button>
          </>
        }
      />

      {/* <DataPanel className="erp-controls-enter shrink-0 px-3 py-2.5"> */}
        <div className="erp-controls-enter flex flex-nowrap items-end gap-2 max-xl:flex-wrap">
          <div className="w-[150px]"><FilterDateInput label="Date" value={filters.date} onChange={(date) => setFilters({ ...filters, date })} /></div>
          <div className="w-[145px]"><FilterInput label="Agent" value={filters.agent} onChange={(agent) => setFilters({ ...filters, agent })} /></div>
          <div className="w-[112px]"><FilterInput label="Nation" value={filters.nation} onChange={(nation) => setFilters({ ...filters, nation })} /></div>
          <div className="w-[132px]">
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
          </div>
          <div className="w-[126px]">
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
          </div>
          <div className="min-w-0 flex-1">
          <FilterInput
            label="Search"
            value={filters.search}
            placeholder="Search party, guide, agent, car..."
            onChange={(search) => setFilters({ ...filters, search })}
          />
          </div>
          <span className="flex h-9 shrink-0 items-center whitespace-nowrap text-sm font-light text-slate-500">{rows.length} Records</span>
        </div>
      {/* </DataPanel> */}

      {error ? (
        <div className="rounded-md border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      ) : null}
      {importMessage ? (
        <div className="rounded-md border border-sky-100 bg-sky-50 px-4 py-3 text-sm font-semibold text-[#0752d6]">
          {importMessage}
        </div>
      ) : null}

      <DataPanel className="erp-content-enter flex min-h-0 flex-1 flex-col">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-3 py-2 text-sm text-slate-500">
          <span>
            Showing {rows.length} bookings
            {selectedIds.length ? ` / selected ${selectedIds.length}` : ''}
          </span>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="toolbar-btn" disabled={!selectedRow} onClick={() => selectedRow && openEdit(selectedRow)}>
              <EditIcon className="erp-action-icon" /> Edit
            </button>
            <button type="button" className="toolbar-btn-danger" disabled={selectedIds.length === 0} onClick={deleteSelected}>
              <TrashIcon className="erp-action-icon" /> Delete
            </button>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          <table className="w-full table-fixed border-collapse text-[11px]">
            <thead className="sticky top-0 z-10 bg-slate-50">
              <tr>
                <th className="w-8 border-b border-slate-200 px-1.5 py-2 text-left">
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
                    className={`truncate border-b border-slate-200 px-1.5 py-2 text-left text-[9px] font-semibold uppercase text-slate-400 ${column.className ?? ''}`}
                  >
                    {column.label}
                  </th>
                ))}
                <th className="w-[5.4%] border-b border-slate-200 px-1.5 py-2 text-center text-[9px] font-semibold uppercase text-slate-400">
                  Status
                </th>
                <th className="w-[5%] border-b border-slate-200 px-1.5 py-2 text-center text-[9px] font-semibold uppercase text-slate-400">
                  Upload
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={tableColumns.length + 3} className="px-4 py-8">
                    <LoadingState label="Loading bookings..." className="min-h-[220px]" />
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
                    className={`cursor-pointer transition hover:bg-sky-50 ${selectedIds.includes(row.id) ? 'bg-sky-50' : ''}`}
                    onClick={() => toggleRowSelection(row.id)}
                  >
                    <td className="border-b border-slate-100 px-1.5 py-2">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(row.id)}
                        onClick={(event) => event.stopPropagation()}
                        onChange={() => toggleRowSelection(row.id)}
                      />
                    </td>
                    {tableColumns.map((column) => (
                      <td key={column.key} className={`truncate border-b border-slate-100 px-1.5 py-2 text-slate-700 ${column.className ?? ''}`} title={formatBookingValue(row, column.key)}>
                        {formatBookingValue(row, column.key)}
                      </td>
                    ))}
                    <td className="border-b border-slate-100 px-1.5 py-2 text-center align-middle leading-none">
                      <StatusMark value={row.status} trueTone="complete" />
                    </td>
                    <td className="border-b border-slate-100 px-1.5 py-2 text-center align-middle leading-none">
                      <StatusMark value={row.upload} trueTone="upload" />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </DataPanel>

      {formMode ? (
        <BookingModal
          mode={formMode}
          form={form}
          rows={rows}
          saveState={bookingSaveState}
          onChange={(value) => {
            setForm(value);
            setBookingSaveState('idle');
          }}
          onClose={() => {
            setFormMode(null);
            setBookingSaveState('idle');
          }}
          onSubmit={saveForm}
          onNavigate={(row) => {
            setForm({ ...row, references: row.references ?? [] });
            setBookingSaveState('idle');
          }}
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
      {createBonusOpen ? (
        <CreateBonusModal
          initialDate={toDateInput(new Date())}
          onUploaded={async (uploadedIds) => {
            setRows((current) =>
              current.map((row) => (uploadedIds.includes(row.id) ? { ...row, upload: true } : row)),
            );
            await loadRows();
          }}
          onClose={() => setCreateBonusOpen(false)}
        />
      ) : null}
    </PageShell>
  );
}

function BookingModal({
  mode,
  form,
  rows,
  saveState,
  onChange,
  onClose,
  onSubmit,
  onNavigate,
}: {
  mode: 'create' | 'edit';
  form: Booking;
  rows: Booking[];
  saveState: 'idle' | 'saving' | 'saved';
  onChange: (value: Booking) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onNavigate: (row: Booking) => void;
}) {
  const setField = (key: keyof Booking, value: string | number | boolean) => {
    onChange({ ...form, [key]: value });
  };
  const setReferenceField = (index: number, key: keyof BookingReference, value: string) => {
    const references = [...form.references];
    const current = references[index] ?? {
      orderDate: '',
      faxNo: '',
      agentCode: '',
      code: '',
      place: '',
      startDate: '',
      endDate: '',
    };
    references[index] = { ...current, [key]: value };
    onChange({ ...form, references });
  };
  const currentIndex = rows.findIndex((row) => row.id === form.id);
  const previousRow = currentIndex > 0 ? rows[currentIndex - 1] : null;
  const nextRow = currentIndex >= 0 && currentIndex < rows.length - 1 ? rows[currentIndex + 1] : null;
  const positionLabel = mode === 'edit' && rows.length > 0 ? `${Math.max(currentIndex + 1, 1)}/${rows.length}` : '';
  const saveDisabled = saveState === 'saving' || (mode === 'edit' && form.upload);

  return (
    <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4">
      <form
        onSubmit={onSubmit}
        onKeyDown={preventEnterSubmit}
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
            <XIcon className="erp-action-icon" /> Close
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-2">
          <div className="grid shrink-0 items-start gap-2 xl:grid-cols-[minmax(0,1fr)_540px]">
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
            <DateField label="Order Date" value={form.references[0]?.orderDate ?? ''} onChange={(value) => setReferenceField(0, 'orderDate', value)} />
            <Field label="Agent Ref" value={form.agentCodeRef} onChange={(value) => setField('agentCodeRef', value)} />
            <Field label="Fax No" value={form.faxNo} onChange={(value) => setField('faxNo', value)} />
            <Field label="PartyCode Ref" value={form.partyCodeRef} onChange={(value) => setField('partyCodeRef', value)} />
            <label className="space-y-1 md:col-span-2">
              <span className="text-xs font-semibold text-slate-700">Book Remark</span>
              <textarea
                value={form.bookRemark}
                onChange={(event) => setField('bookRemark', event.target.value)}
                className="h-[92px] w-full resize-none rounded-md border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-[#1478ff] focus:ring-4 focus:ring-[rgba(20,120,255,0.14)]"
              />
            </label>
          </FormSection>
          </div>
          </div>

          <section className="mt-2 flex h-[134px] shrink-0 flex-col rounded-[8px] border border-slate-200 bg-slate-50/60 p-2">
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-slate-800">Reference Details</h3>
            </div>
            <div className="min-h-0 flex-1 space-y-1.5 overflow-auto rounded-md border border-slate-200 bg-white p-1.5">
              {form.references.length === 0 ? (
                <div className="flex h-full items-center justify-center px-4 py-4 text-sm text-slate-400">No reference rows.</div>
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

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-white/95 px-4 py-2 backdrop-blur">
          <div className="flex gap-2">
            <button type="button" className="toolbar-btn px-4 disabled:bg-slate-50 disabled:text-slate-400" disabled={!previousRow} onClick={() => previousRow && onNavigate(previousRow)}>
              <ArrowLeftIcon className="erp-action-icon" /> Previous
            </button>
            {positionLabel ? (
              <span className="inline-flex min-h-9 items-center rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-600">
                {positionLabel}
              </span>
            ) : null}
            <button type="button" className="toolbar-btn px-4 disabled:bg-slate-50 disabled:text-slate-400" disabled={!nextRow} onClick={() => nextRow && onNavigate(nextRow)}>
              Next <ArrowRightIcon className="erp-action-icon" />
            </button>
          </div>
          <div className="flex gap-3">
          <button
            type="submit"
            disabled={saveDisabled}
            className={
              saveState === 'saved'
                ? 'inline-flex min-h-9 items-center justify-center gap-2 rounded-[10px] border border-emerald-500 bg-emerald-600 px-5 text-sm font-medium leading-none text-white transition hover:bg-emerald-600 disabled:opacity-70'
                : 'toolbar-btn-primary px-5 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none'
            }
            title={mode === 'edit' && form.upload ? 'This booking has already been uploaded.' : undefined}
          >
            <SaveIcon className="erp-action-icon" /> {saveState === 'saving' ? 'Saving...' : saveState === 'saved' ? 'Save complete' : 'Save'}
          </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function CreateBonusModal({
  initialDate,
  onUploaded,
  onClose,
}: {
  initialDate: string;
  onUploaded?: (uploadedIds: string[]) => void | Promise<void>;
  onClose: () => void;
}) {
  const [bookDate, setBookDate] = useState(initialDate || toDateInput(new Date()));
  const [rows, setRows] = useState<Booking[]>([]);
  const [previewRows, setPreviewRows] = useState<BonusPreviewRow[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loadingRows, setLoadingRows] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState('');

  const displayRows = sortCreateBonusRows(previewRows.length ? previewRows : rows.map((row) => ({ ...row, previewBonus: '' })));
  const selectedRows = displayRows.filter((row) => selectedIds.includes(row.id));
  const allRowsSelected = displayRows.length > 0 && displayRows.every((row) => selectedIds.includes(row.id));
  const canGenerate = selectedRows.length > 0 && selectedRows.every(canGenerateBonus);
  const canUpload = selectedRows.length > 0 && selectedRows.every((row) => canGenerateBonus(row) && Boolean(row.bonusCode || row.previewBonus));

  const loadRowsForDate = async () => {
    setLoadingRows(true);
    setLoadError(null);
    setActionMessage('');
    try {
      const params = new URLSearchParams();
      if (bookDate) params.set('date', bookDate);
      const data = await apiFetch<Booking[]>(`/api/bookings/bonus-source?${params.toString()}`);
      const sortedRows = sortCreateBonusRows(data.map((row) => ({ ...row, previewBonus: '' })));
      setRows(sortedRows);
      setPreviewRows(sortedRows);
      setSelectedIds([]);
    } catch (error) {
      setRows([]);
      setPreviewRows([]);
      setSelectedIds([]);
      setLoadError(error instanceof Error ? error.message : 'Failed to load booking rows.');
    } finally {
      setLoadingRows(false);
    }
  };

  const genBonus = async () => {
    if (!canGenerate) return;
    setLoadingRows(true);
    setLoadError(null);
    setActionMessage('');
    try {
      const result = await apiFetch<BonusCodeResponse>('/api/bookings/generate-bonus-codes', {
        method: 'POST',
        body: JSON.stringify({ ids: selectedIds }),
      });
      const bonusById = new Map(result.rows.map((row) => [row.id, row.bonus]));
      setPreviewRows(
        sortCreateBonusRows(
          displayRows.map((row) => ({
            ...row,
            bonusCode: bonusById.get(row.id) ?? row.bonusCode,
            previewBonus: bonusById.get(row.id) ?? row.previewBonus,
          })),
        ),
      );
      setActionMessage(`Generated ${result.rows.length} bonus codes.`);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Generate bonus failed.');
    } finally {
      setLoadingRows(false);
    }
  };

  const clearBonus = () => {
    if (selectedIds.length === 0) return;
    setPreviewRows(
      sortCreateBonusRows(
        displayRows.map((row) => ({
          ...row,
          previewBonus: selectedIds.includes(row.id) ? '' : row.previewBonus,
        })),
      ),
    );
  };

  const uploadBonus = async () => {
    if (!canUpload) return;
    setLoadingRows(true);
    setLoadError(null);
    setActionMessage('');
    const uploadedIds = selectedRows.map((row) => row.id);
    try {
      const result = await apiFetch<BonusUploadResponse>('/api/bookings/create-bonus-cards', {
        method: 'POST',
        body: JSON.stringify({
          entries: selectedRows.map((row) => ({ id: row.id, bonus: row.bonusCode || row.previewBonus })),
        }),
      });
      setRows((current) =>
        sortCreateBonusRows(current.map((row) => (uploadedIds.includes(row.id) ? { ...row, upload: true } : row))),
      );
      setPreviewRows((current) =>
        sortCreateBonusRows(
          current.map((row) =>
            uploadedIds.includes(row.id)
              ? {
                  ...row,
                  upload: true,
                  bonusCode: row.bonusCode || row.previewBonus,
                  previewBonus: row.bonusCode || row.previewBonus,
                }
              : row,
          ),
        ),
      );
      setSelectedIds((current) => current.filter((id) => !uploadedIds.includes(id)));
      await onUploaded?.(uploadedIds);
      await loadRowsForDate();
      setActionMessage(`Uploaded ${result.created} rows to Bonus.`);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Upload to bonus failed.');
    } finally {
      setLoadingRows(false);
    }
  };

  const toggleRowSelection = (id: string) => {
    setSelectedIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  const toggleAllRows = () => {
    setSelectedIds(allRowsSelected ? [] : displayRows.map((row) => row.id));
  };

  useEffect(() => {
    let cancelled = false;

    const loadRows = async () => {
      setLoadingRows(true);
      setLoadError(null);
      setActionMessage('');
      try {
        const params = new URLSearchParams();
        if (bookDate) params.set('date', bookDate);
        const data = await apiFetch<Booking[]>(`/api/bookings/bonus-source?${params.toString()}`);
        if (cancelled) return;
        const sortedRows = sortCreateBonusRows(data.map((row) => ({ ...row, previewBonus: '' })));
        setRows(sortedRows);
        setPreviewRows(sortedRows);
        setSelectedIds([]);
      } catch (error) {
        if (cancelled) return;
        setRows([]);
        setPreviewRows([]);
        setSelectedIds([]);
        setLoadError(error instanceof Error ? error.message : 'Failed to load booking rows.');
      } finally {
        if (!cancelled) setLoadingRows(false);
      }
    };

    void loadRows();

    return () => {
      cancelled = true;
    };
  }, [bookDate]);

  return (
    <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="modal-pop flex h-[86vh] w-full max-w-[1440px] flex-col overflow-hidden rounded-[10px] border border-slate-200/80 bg-white/95 shadow-[0_24px_70px_rgba(15,23,42,0.18)] backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Create to Bonus Card</h2>
            <p className="mt-0.5 text-xs text-slate-500">Preview booking rows, generate bonus codes, then prepare upload to bonus.</p>
          </div>
          <button type="button" className="toolbar-btn" onClick={onClose}>
            <XIcon className="erp-action-icon" /> Close
          </button>
        </div>

        <div className="flex flex-wrap items-end gap-2 border-b border-slate-200 bg-slate-50/70 px-5 py-3">
          <div className="w-[170px]">
            <FilterDateInput label="Book Date" value={bookDate} onChange={setBookDate} />
          </div>
          <button type="button" className="toolbar-btn-primary disabled:bg-slate-100 disabled:text-slate-400" disabled={!canGenerate || loadingRows} onClick={() => void genBonus()}>
            <PlusIcon className="erp-action-icon" /> Gen. Bonus Auto
          </button>
          <button type="button" className="toolbar-btn disabled:bg-slate-50 disabled:text-slate-400" disabled={selectedIds.length === 0} onClick={clearBonus}>
            <RefreshIcon className="erp-action-icon" /> Clear Bonus Code
          </button>
          <button type="button" className="toolbar-btn disabled:bg-slate-50 disabled:text-slate-400" disabled={!canUpload || loadingRows} onClick={() => void uploadBonus()}>
            <UploadIcon className="erp-action-icon" /> Upload to Bonus
          </button>
          <span className="ml-auto text-sm font-light text-slate-500">
            {loadingRows ? 'Loading...' : `${displayRows.length} rows / ${selectedIds.length} selected`}
          </span>
        </div>
        {loadError || actionMessage ? (
          <div className={`border-b px-5 py-2 text-sm font-medium ${loadError ? 'border-red-100 bg-red-50 text-red-700' : 'border-emerald-100 bg-emerald-50 text-emerald-700'}`}>
            {loadError ?? actionMessage}
          </div>
        ) : null}

        <div className="min-h-0 flex-1 overflow-auto">
          <table className="w-full min-w-[1320px] border-collapse text-xs">
            <thead className="sticky top-0 z-10 bg-white shadow-[0_1px_0_rgba(226,232,240,1)]">
              <tr>
                <th className="w-9 border-b border-slate-200 px-2 py-2 text-left">
                  <input
                    type="checkbox"
                    checked={allRowsSelected}
                    onChange={toggleAllRows}
                    className="h-4 w-4 accent-[#1478ff]"
                    aria-label="Select all bonus preview rows"
                  />
                </th>
                {['Bonus Code', 'Date book JW', 'Time', 'Agent Code', 'Agent Name', 'Guide Code', 'Guide Name', 'Nation', 'Car Code', 'Pax', 'Party Code', 'First Shop', 'Remark', 'Shop', 'Doc No.', 'Complete', 'Upload'].map((label) => (
                  <th key={label} className="border-b border-slate-200 px-2 py-2 text-left text-[10px] font-semibold uppercase text-slate-400">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayRows.length ? (
                displayRows.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => toggleRowSelection(row.id)}
                    className={`cursor-pointer border-b border-slate-100 hover:bg-[#0752d6]/[0.06] ${selectedIds.includes(row.id) ? 'bg-sky-50' : ''}`}
                  >
                    <td className="px-2 py-2">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(row.id)}
                        onChange={() => toggleRowSelection(row.id)}
                        onClick={(event) => event.stopPropagation()}
                        className="h-4 w-4 accent-[#1478ff]"
                        aria-label={`Select ${row.partyCode}`}
                      />
                    </td>
                    <td className="px-2 py-2 font-medium text-slate-950">{row.bonusCode || row.previewBonus || '-'}</td>
                    <td className="px-2 py-2">{formatDisplayDate(row.dateBookJw || row.arriveDate || row.docDate)}</td>
                    <td className="px-2 py-2">{row.timeBookJw || row.docTime}</td>
                    <td className="px-2 py-2">{row.agentCode}</td>
                    <td className="max-w-[190px] truncate px-2 py-2" title={row.agentName}>{row.agentName}</td>
                    <td className="px-2 py-2">{row.guideCode}</td>
                    <td className="px-2 py-2">{row.guideName}</td>
                    <td className="px-2 py-2">{row.nation}</td>
                    <td className="px-2 py-2">{row.carCode}</td>
                    <td className="px-2 py-2">{row.pax}</td>
                    <td className="px-2 py-2">{row.partyCode}</td>
                    <td className="px-2 py-2">{row.shop}</td>
                    <td className="max-w-[230px] truncate px-2 py-2" title={row.bookRemark}>{row.bookRemark}</td>
                    <td className="px-2 py-2">R</td>
                    <td className="px-2 py-2">{row.docNo}</td>
                    <td className="px-2 py-2 text-center"><StatusMark value={row.status} trueTone="complete" /></td>
                    <td className="px-2 py-2 text-center"><StatusMark value={row.upload} trueTone="upload" /></td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={18} className="px-4 py-16 text-center text-sm text-slate-400">
                    {loadError ?? (loadingRows ? 'Loading booking rows...' : 'No booking rows for selected date.')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function canGenerateBonus(row: Booking) {
  return row.status && !row.upload && row.nation.trim() !== '';
}

function sortCreateBonusRows<T extends Booking & { previewBonus?: string }>(rows: T[]) {
  return rows
    .map((row, index) => ({ row, index }))
    .sort((left, right) => {
      const leftBonusText = left.row.bonusCode || left.row.previewBonus || '';
      const rightBonusText = right.row.bonusCode || right.row.previewBonus || '';
      const leftBonus = numericBonusCode(leftBonusText);
      const rightBonus = numericBonusCode(rightBonusText);

      if (leftBonus !== null || rightBonus !== null) {
        if (leftBonus === null) return 1;
        if (rightBonus === null) return -1;
        if (leftBonus !== rightBonus) return leftBonus - rightBonus;
        return leftBonusText.localeCompare(rightBonusText) || left.index - right.index;
      }

      return left.index - right.index;
    })
    .map(({ row }) => row);
}

function numericBonusCode(value: string) {
  const cleaned = value.trim();
  if (!cleaned) return null;
  const numeric = Number(cleaned);
  return Number.isFinite(numeric) ? numeric : null;
}

function StatusMark({ value, trueTone }: { value: boolean; trueTone: 'complete' | 'upload' }) {
  const colorClass = value ? (trueTone === 'upload' ? 'text-[#3b82f6]' : 'text-[#22c55e]') : 'text-[#ff5b5f]';
  return (
    <span className={`mx-auto flex h-4 w-4 items-center justify-center ${colorClass}`} aria-label={value ? 'Yes' : 'No'}>
      <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="8" cy="8" r="6.25" />
        {value ? <path d="m5.2 8.1 1.8 1.8 3.9-4" /> : <path d="m5.9 5.9 4.2 4.2M10.1 5.9 5.9 10.1" />}
      </svg>
    </span>
  );
}

function AgentMatchingModal({ onClose }: { onClose: () => void }) {
  const { requestConfirmation } = useDialog();
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

  const loadRows = async (query = search) => {
    const params = new URLSearchParams();
    if (query.trim()) params.set('search', query.trim());
    const data = await apiFetch<AgentMatching[]>(`/api/bookings/agent-matchings?${params.toString()}`);
    setRows(data);
    setSelectedId((current) => (current && data.some((row) => row.id === current) ? current : null));
  };

  const loadAgents = async () => {
    const data = await apiFetch<AgentOption[]>('/api/agents/options');
    setAgents(data);
  };

  useEffect(() => {
    loadAgents().catch((loadError) => {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load agents.');
    });
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadRows(search);
    }, 250);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const openAdd = () => {
    setEditing(null);
    setAgentCodeRef('');
    setAgentId('');
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
    const agent = agentOptions.find((item) => item.id === agentId);
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
    await loadRows(search);
  };

  const remove = async () => {
    if (
      !selected ||
      !(await requestConfirmation({
        message: `Delete mapping "${selected.agentCodeRef}"?`,
        variant: 'danger',
      }))
    ) {
      return;
    }
    await apiFetch(`/api/bookings/agent-matchings/${selected.id}`, { method: 'DELETE' });
    setSelectedId(null);
    setMessage('Agent matching deleted.');
    await loadRows(search);
  };

  return (
    <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4">
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
            <PlusIcon className="erp-action-icon" /> Add
          </button>
          <button
            type="button"
            className="toolbar-btn disabled:bg-slate-50 disabled:text-slate-400"
            disabled={!selected}
            onClick={openEdit}
          >
            <EditIcon className="erp-action-icon" /> Edit
          </button>
          <button type="button" className="toolbar-btn-danger" onClick={remove}>
            <TrashIcon className="erp-action-icon" /> Delete
          </button>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Enter text to search..."
            className="form-input form-input-search ml-auto max-w-xs rounded-md"
          />
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
                  className={`cursor-pointer hover:bg-sky-50 ${selectedId === row.id ? 'bg-sky-50' : ''}`}
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
        <div className="modal-backdrop fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-[10px] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.18)]">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h3 className="text-lg font-semibold text-slate-950">Matching Agent Detail</h3>
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
                <AgentCodeDropdown value={agentId} options={agentOptions} onChange={setAgentId} />
              </label>
            </div>
            <div className="flex justify-end gap-3 border-t border-slate-200 px-5 py-4">
              <button type="button" className="toolbar-btn" onClick={() => setDetailOpen(false)}>
                <XIcon className="erp-action-icon" /> Cancel
              </button>
              <button type="button" className="toolbar-btn-primary" onClick={save} disabled={!agentId}>
                <SaveIcon className="erp-action-icon" /> Save
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function AgentCodeDropdown({
  value,
  options,
  onChange,
}: {
  value: string;
  options: AgentOption[];
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const selected = options.find((agent) => agent.id === value);

  useEffect(() => {
    if (!open) return;

    const closeOnOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, [open]);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        className="form-input flex w-full cursor-pointer items-center justify-between rounded-md bg-white text-left"
        onClick={() => setOpen((current) => !current)}
      >
        <span className={selected ? 'truncate text-slate-950' : 'text-slate-500'}>
          {selected ? `${selected.agentCode} - ${selected.name || 'No Agent'}` : 'Please select'}
        </span>
        <span className="ml-3 text-slate-500">⌄</span>
      </button>
      {open ? (
        <div className="absolute left-0 top-full z-[80] mt-1 max-h-64 w-full overflow-y-auto rounded-md border border-slate-200 bg-white py-1 text-sm shadow-[0_18px_45px_rgba(15,23,42,0.14)]">
          <button
            type="button"
            className={`block w-full px-3 py-2 text-left hover:bg-blue-50 ${value ? 'text-slate-700' : 'bg-blue-600 text-white hover:bg-blue-600'}`}
            onClick={() => {
              onChange('');
              setOpen(false);
            }}
          >
            Please select
          </button>
          {options.map((agent) => (
            <button
              key={agent.id}
              type="button"
              className={`block w-full px-3 py-2 text-left hover:bg-blue-50 ${
                agent.id === value ? 'bg-blue-600 text-white hover:bg-blue-600' : 'text-slate-900'
              }`}
              onClick={() => {
                onChange(agent.id);
                setOpen(false);
              }}
            >
              {agent.agentCode} - {agent.name || 'No Agent'}
            </button>
          ))}
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
    } catch (previewError) {
      setError(previewError instanceof Error ? previewError.message : 'Preview failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="max-h-[92vh] w-full max-w-6xl overflow-auto rounded-[10px] border border-slate-200 bg-white p-5 shadow-[0_24px_70px_rgba(15,23,42,0.18)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Import File Separate</h2>
            <p className="mt-1 text-sm text-slate-500">Upload Main_YYYY-MM-DD.txt and Detail_YYYY-MM-DD.txt.</p>
          </div>
          <button type="button" className="toolbar-btn" onClick={onClose}>
            <XIcon className="erp-action-icon" /> Close
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
                className={`rounded px-4 py-2 text-sm font-medium ${activePreview === 'main' ? 'bg-[#0b63f6] text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                onClick={() => setActivePreview('main')}
              >
                Main
              </button>
              <button
                type="button"
                className={`rounded px-4 py-2 text-sm font-medium ${activePreview === 'detail' ? 'bg-[#0b63f6] text-white' : 'text-slate-600 hover:bg-slate-100'}`}
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
                <SearchIcon className="erp-action-icon" /> {loading ? 'Checking...' : 'Check Duplicate / Preview'}
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
                    <tr key={rowIndex} className="hover:bg-sky-50">
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
            <XIcon className="erp-action-icon" /> Cancel
          </button>
          <button type="button" className="toolbar-btn-primary" disabled={!canImport} onClick={importFiles}>
            <UploadIcon className="erp-action-icon" /> {loading ? 'Importing...' : 'Import'}
          </button>
        </div>
      </div>
      {confirmDuplicateOpen ? (
        <div className="modal-backdrop fixed inset-0 z-[60] flex items-center justify-center p-4">
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
        value={type === 'number' && value === 0 ? '' : value ?? ''}
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
    <CustomDropdown
      label={label}
      value={value}
      options={options.map(([optionValue, optionLabel]) => ({ value: optionValue, label: optionLabel }))}
      onChange={onChange}
      inputClassName="h-8 text-sm"
      labelClassName="text-xs font-semibold text-slate-700"
      placeholder="Please select"
    />
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
  const updateValue = (rawValue: string) => {
    onChange(formatTimeInput(rawValue));
  };

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
        onChange={(event) => updateValue(event.target.value)}
        onBlur={(event) => onChange(completeTimeInput(event.target.value))}
        className="form-input h-8 rounded-md text-sm disabled:bg-slate-100 disabled:text-slate-500"
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
  const isSearch = label.toLowerCase() === 'search';
  return (
    <label className="space-y-1">
      <span className="text-[10px] font-medium uppercase text-slate-500">{label}</span>
      <div className="relative">
        {isSearch ? (
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        ) : null}
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className={`form-input rounded-md ${isSearch ? 'pl-11' : ''}`}
        />
      </div>
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
      <span className="text-[10px] font-medium uppercase text-slate-500">{label}</span>
      <div className="relative">
        <input
          type="text"
          value={displayValue}
          placeholder="--/--/----"
          inputMode="numeric"
          onChange={(event) => {
            const nextValue = event.target.value;
            setDisplayValue(nextValue);
            if (!nextValue.trim()) {
              onChange('');
              return;
            }
            const parsedDate = parseValidDisplayDate(nextValue);
            if (parsedDate) {
              onChange(parsedDate);
            }
          }}
          onBlur={(event) => {
            const nextValue = event.target.value.trim();
            if (!nextValue) {
              onChange('');
              setDisplayValue('');
              return;
            }
            const parsedDate = parseValidDisplayDate(nextValue);
            if (parsedDate) {
              onChange(parsedDate);
              setDisplayValue(dateInputValue(parsedDate));
              return;
            }
            setDisplayValue(dateInputValue(value));
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              const nextValue = event.currentTarget.value.trim();
              if (!nextValue) {
                onChange('');
                setDisplayValue('');
                return;
              }
              const parsedDate = parseValidDisplayDate(nextValue);
              if (parsedDate) {
                onChange(parsedDate);
                setDisplayValue(dateInputValue(parsedDate));
              }
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
          <CalendarIcon className="h-4 w-4" />
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
    <CustomDropdown
      label={label}
      value={value}
      options={options.map(([optionValue, labelText]) => ({ value: optionValue, label: labelText }))}
      onChange={onChange}
      labelClassName="text-[10px] font-medium uppercase text-slate-500"
      placeholder="All"
    />
  );
}

function CustomDropdown({
  label,
  value,
  options,
  onChange,
  placeholder = 'Please select',
  labelClassName = 'text-xs font-semibold text-slate-700',
  inputClassName = '',
}: {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
  placeholder?: string;
  labelClassName?: string;
  inputClassName?: string;
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
    <label ref={wrapperRef} className="relative block space-y-1">
      <span className={labelClassName}>{label}</span>
      <button
        ref={buttonRef}
        type="button"
        className={`form-input flex w-full items-center justify-between rounded-md border-[#9bc0ff] bg-white px-3 text-left shadow-[0_0_0_1px_rgba(96,165,250,0.16)] transition hover:border-[#6aa5ff] focus:border-[#1478ff] focus:ring-4 focus:ring-[rgba(20,120,255,0.16)] ${inputClassName}`}
        onClick={() => {
          updateMenuRect();
          setOpen((current) => !current);
        }}
      >
        <span className={selected ? 'truncate text-slate-950' : 'truncate text-slate-400'}>
          {selected ? selected.label : placeholder}
        </span>
        <span className="ml-2 shrink-0 text-[10px] text-slate-400" aria-hidden="true">
          ▾
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

function formatBookingValue(row: Booking, key: keyof Booking) {
  const value = row[key];
  if (typeof value === 'string' && key.toLowerCase().includes('date')) {
    return formatDate(value);
  }
  return String(value ?? '');
}

function formatDisplayDate(value: string) {
  return formatDate(value);
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

function parseValidDisplayDate(value: string) {
  const match = value.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) {
    return '';
  }
  const [, day, month, year] = match;
  const date = new Date(`${year}-${month}-${day}T00:00:00.000Z`);
  if (
    Number.isNaN(date.getTime()) ||
    date.getUTCFullYear() !== Number(year) ||
    date.getUTCMonth() + 1 !== Number(month) ||
    date.getUTCDate() !== Number(day)
  ) {
    return '';
  }
  return `${year}-${month}-${day}`;
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
  const digitFormatted = formatTimeInput(value);
  if (/^\d{1,2}:\d{1,2}$/.test(digitFormatted)) {
    const [hours, minutes] = digitFormatted.split(':');
    return minutes.length === 2 ? `${hours.padStart(2, '0')}:${minutes}` : `${hours}:${minutes}`;
  }
  const match = value.match(/^(\d{1,2}):(\d{2})/);
  if (!match) {
    return '';
  }
  return `${match[1].padStart(2, '0')}:${match[2]}`;
}

function formatTimeInput(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }
  const digits = trimmed.replace(/\D/g, '').slice(0, 4);
  if (!digits) {
    return '';
  }
  if (digits.length <= 2) {
    return digits;
  }
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

function completeTimeInput(value: string) {
  const formatted = formatTimeInput(value);
  if (!formatted) {
    return '';
  }
  const [rawHours, rawMinutes = ''] = formatted.split(':');
  const hours = Math.min(Number(rawHours || 0), 23);
  const minutes = Math.min(Number(rawMinutes.padEnd(2, '0') || 0), 59);
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
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

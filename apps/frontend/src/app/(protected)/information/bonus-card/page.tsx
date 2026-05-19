'use client';

import { FormEvent, ReactNode, useEffect, useMemo, useState } from 'react';
import { apiFetch, apiUpload } from '@/lib/api';

type BonusCard = {
  id: string;
  workDate: string;
  bonus: string;
  bonusName: string;
  agentCode: string;
  agentName: string;
  guide: string;
  guideName: string;
  partyCode: string;
  nation: string;
  adult: number;
  child: number;
  tourLeader: number;
  carCode: string;
  shop: string;
  hotel: string;
  comeFrom: string;
  busType: string;
  tourIn: string;
  tourOut: string;
  comment: string;
  imageUrl: string;
};

type UploadImageResponse = {
  imageUrl: string;
};

const today = new Date().toISOString().slice(0, 10);
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

const emptyForm: BonusCard = {
  id: '',
  workDate: today,
  bonus: '',
  bonusName: '',
  agentCode: '',
  agentName: '',
  guide: '',
  guideName: '',
  partyCode: '',
  nation: 'CN',
  adult: 0,
  child: 0,
  tourLeader: 0,
  carCode: '',
  shop: '',
  hotel: '',
  comeFrom: '',
  busType: 'BUSOA',
  tourIn: '',
  tourOut: '',
  comment: '',
  imageUrl: '',
};

const visibleColumns: Array<{ key: keyof BonusCard; label: string; width: string }> = [
  { key: 'bonus', label: 'Bonus', width: '100px' },
  { key: 'bonusName', label: 'Bonus Name', width: '280px' },
  { key: 'agentCode', label: 'Agent Code', width: '130px' },
  { key: 'agentName', label: 'Agent Name', width: '260px' },
  { key: 'guide', label: 'Guide', width: '130px' },
  { key: 'guideName', label: 'Guide Name', width: '230px' },
  { key: 'partyCode', label: 'Party Code', width: '170px' },
  { key: 'comment', label: 'Remark', width: '240px' },
];

const exportColumns: Array<{ key: keyof BonusCard; label: string }> = [
  { key: 'workDate', label: 'Work Date' },
  { key: 'bonus', label: 'Bonus' },
  { key: 'bonusName', label: 'Bonus Name' },
  { key: 'agentCode', label: 'Agent Code' },
  { key: 'agentName', label: 'Agent Name' },
  { key: 'guide', label: 'Guide' },
  { key: 'guideName', label: 'Guide Name' },
  { key: 'partyCode', label: 'Party Code' },
  { key: 'nation', label: 'Nation' },
  { key: 'adult', label: 'Adult' },
  { key: 'child', label: 'Child' },
  { key: 'tourLeader', label: 'Tour Leader' },
  { key: 'carCode', label: 'Car Code' },
  { key: 'shop', label: 'Shop' },
  { key: 'hotel', label: 'Hotel' },
  { key: 'comeFrom', label: 'Come From' },
  { key: 'busType', label: 'Bus Type' },
  { key: 'tourIn', label: 'Tour In' },
  { key: 'tourOut', label: 'Tour Out' },
  { key: 'comment', label: 'Remark' },
];

export default function BonusCardPage() {
  const [rows, setRows] = useState<BonusCard[]>([]);
  const [workDate, setWorkDate] = useState('2026-05-14');
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null);
  const [form, setForm] = useState<BonusCard>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportRange, setExportRange] = useState({ from: '2026-05-14', to: '2026-05-14' });
  const [exportFileType, setExportFileType] = useState<'xlsx' | 'xls'>('xlsx');
  const [exportRows, setExportRows] = useState<BonusCard[]>([]);
  const [exportLoading, setExportLoading] = useState(false);
  const [printRow, setPrintRow] = useState<BonusCard | null>(null);

  const filteredRows = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) {
      return rows;
    }
    return rows.filter((row) =>
      [row.bonus, row.bonusName, row.agentCode, row.agentName, row.guide, row.guideName, row.partyCode]
        .join(' ')
        .toLowerCase()
        .includes(needle),
    );
  }, [rows, search]);

  const loadRows = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<BonusCard[]>(`/api/bonus-cards?workDate=${encodeURIComponent(workDate)}`);
      setRows(data);
      setSelectedIds([]);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workDate]);

  useEffect(() => {
    if (!exportOpen) {
      return;
    }

    const loadExportRows = async () => {
      setExportLoading(true);
      try {
        const data = await apiFetch<BonusCard[]>(
          `/api/bonus-cards?from=${encodeURIComponent(exportRange.from)}&to=${encodeURIComponent(exportRange.to)}`,
        );
        setExportRows(data);
      } catch {
        setExportRows([]);
      } finally {
        setExportLoading(false);
      }
    };

    loadExportRows();
  }, [exportOpen, exportRange.from, exportRange.to]);

  const openCreate = () => {
    const nextBonus = Math.max(0, ...rows.map((row) => Number(row.bonus)).filter(Boolean)) + 1;
    setForm({ ...emptyForm, id: '', workDate, bonus: String(nextBonus) });
    setFormError(null);
    setFormMode('create');
  };

  const openEdit = (row: BonusCard) => {
    setForm(row);
    setFormError(null);
    setFormMode('edit');
  };

  const saveForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    try {
      const body = JSON.stringify(form);
      if (formMode === 'edit') {
        await apiFetch<BonusCard>(`/api/bonus-cards/${form.id}`, { method: 'PATCH', body });
      } else {
        await apiFetch<BonusCard>('/api/bonus-cards', { method: 'POST', body });
      }
      setFormMode(null);
      await loadRows();
    } catch (saveError) {
      setFormError(toFriendlyError(saveError));
    }
  };

  const deleteRow = async (row: BonusCard) => {
    if (!window.confirm(`Delete bonus ${row.bonus}?`)) {
      return;
    }
    await apiFetch(`/api/bonus-cards/${row.id}`, { method: 'DELETE' });
    await loadRows();
  };

  const toggleSelected = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const exportExcel = () => {
    const htmlRows = exportRows
      .map(
        (row) =>
          `<tr>${exportColumns
            .map((column) => `<td>${escapeHtml(formatCellValue(row, column.key))}</td>`)
            .join('')}</tr>`,
      )
      .join('');
    const html = `<table border="1"><thead><tr>${exportColumns
      .map((column) => `<th>${escapeHtml(column.label)}</th>`)
      .join('')}</tr></thead><tbody>${htmlRows}</tbody></table>`;
    const blob = new Blob([`<meta charset="utf-8" />${html}`], {
      type: 'application/vnd.ms-excel',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bonus-card-${exportRange.from}-to-${exportRange.to}.${exportFileType}`;
    link.click();
    URL.revokeObjectURL(url);
    setExportOpen(false);
  };

  return (
    <section className="space-y-4">
      <div className="border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-slate-950">Bonus Card</h1>
            <p className="text-sm text-slate-500">Enterprise bonus card records from PostgreSQL.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="toolbar-btn-primary" onClick={openCreate}>
              Add Bonus
            </button>
            <button className="toolbar-btn" onClick={() => window.print()}>
              Print
            </button>
            <button className="toolbar-btn" onClick={() => setExportOpen(true)}>
              Export
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-[220px_1fr_150px]">
          <input
            type="text"
            value={dateInputValue(workDate)}
            placeholder="--/--/----"
            onChange={(event) => setWorkDate(parseDateInput(event.target.value))}
            onBlur={(event) => setWorkDate(completeDateInput(event.target.value))}
            className="form-input"
          />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search bonus, guide, party code, agent..."
            className="form-input"
          />
          <div className="border border-slate-200 bg-slate-50 px-3 py-2 text-right">
            <p className="text-xs text-slate-500">Records</p>
            <p className="text-xl font-semibold text-blue-800">{filteredRows.length}</p>
          </div>
        </div>
      </div>

      {error ? (
        <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      <div className="overflow-hidden border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <div className="flex items-center gap-3 text-sm">
            <button
              className="font-medium text-blue-700 underline"
              onClick={() => setSelectedIds(filteredRows.map((row) => row.id))}
            >
              Select all
            </button>
            <button className="font-medium text-slate-400 underline" onClick={() => setSelectedIds([])}>
              Deselect all
            </button>
            <span className="text-slate-400">Showing {filteredRows.length} items</span>
          </div>
        </div>

        <div className="overflow-auto">
          <table className="w-full min-w-[1180px] border-collapse text-sm">
            <thead className="bg-white">
              <tr>
                <th className="w-12 border-b border-slate-200 px-4 py-3 text-left" />
                <th className="w-16 border-b border-slate-200 px-3 py-3 text-left text-xs font-semibold uppercase text-slate-400">
                  Image
                </th>
                {visibleColumns.map((column) => (
                  <th
                    key={column.key}
                    style={{ width: column.width }}
                    className="border-b border-slate-200 px-3 py-3 text-left text-xs font-semibold uppercase text-slate-400"
                  >
                    {column.label}
                  </th>
                ))}
                <th className="w-[170px] border-b border-slate-200 px-3 py-3 text-right text-xs font-semibold uppercase text-slate-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center text-slate-400">
                    Loading...
                  </td>
                </tr>
              ) : null}
              {!loading &&
                filteredRows.map((row) => {
                  const selected = selectedIds.includes(row.id);
                  return (
                    <tr
                      key={row.id}
                      className={`border-b border-slate-100 transition ${
                        selected ? 'bg-indigo-50' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => toggleSelected(row.id)}
                          className="h-4 w-4 accent-blue-700"
                        />
                      </td>
                      <td className="px-3 py-3">
                        {row.imageUrl ? (
                          <img
                            src={getImageSrc(row.imageUrl)}
                            alt=""
                            className="h-9 w-9 rounded-full bg-white object-cover"
                          />
                        ) : (
                          <div className="h-9 w-9 rounded-full bg-slate-100" />
                        )}
                      </td>
                      {visibleColumns.map((column) => (
                        <td key={column.key} className="px-3 py-3 text-slate-700">
                          <span className="block truncate">{String(row[column.key] ?? '')}</span>
                        </td>
                      ))}
                      <td className="px-3 py-3 text-right">
                        <div className="flex justify-end gap-2 font-medium">
                          <button className="toolbar-btn min-h-9 px-3" onClick={() => setPrintRow(row)}>
                            Detail
                          </button>
                          <button className="toolbar-btn min-h-9 px-3" onClick={() => openEdit(row)}>
                            Edit
                          </button>
                          <button className="toolbar-btn-danger min-h-9 px-3" onClick={() => deleteRow(row)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {formMode ? (
        <BonusModal
          form={form}
          mode={formMode}
          error={formError}
          onChange={setForm}
          onClose={() => setFormMode(null)}
          onSubmit={saveForm}
        />
      ) : null}

      {exportOpen ? (
        <ExportModal
          range={exportRange}
          fileType={exportFileType}
          rows={exportRows}
          loading={exportLoading}
          onChange={setExportRange}
          onFileTypeChange={setExportFileType}
          onClose={() => setExportOpen(false)}
          onExport={exportExcel}
        />
      ) : null}

      {printRow ? <PrintModal row={printRow} onClose={() => setPrintRow(null)} /> : null}
    </section>
  );
}

function BonusModal({
  form,
  mode,
  error,
  onChange,
  onClose,
  onSubmit,
}: {
  form: BonusCard;
  mode: 'create' | 'edit';
  error: string | null;
  onChange: (value: BonusCard) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const setField = (key: keyof BonusCard, value: string | number) => {
    onChange({ ...form, [key]: value });
  };

  const uploadImage = async (file: File | null) => {
    if (!file) {
      return;
    }
    try {
      const optimizedFile = await resizeImageToFile(file);
      const result = await apiUpload<UploadImageResponse>('/api/bonus-cards/images', optimizedFile);
      setField('imageUrl', result.imageUrl);
    } catch {
      window.alert('File too large');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <form
        onSubmit={onSubmit}
        className="max-h-[92vh] w-full max-w-6xl overflow-auto rounded-[10px] border border-slate-200/80 bg-white/95 shadow-[0_24px_70px_rgba(15,23,42,0.18)] backdrop-blur"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-[24px] font-semibold leading-tight text-slate-950">
              {mode === 'create' ? 'Add Bonus' : 'Edit Bonus'}
            </h2>
            <p className="mt-1 text-sm text-slate-500">Manage bonus card profile, guide, travel, and print details.</p>
          </div>
          <button type="button" className="toolbar-btn" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="grid gap-5 p-5 lg:grid-cols-[220px_1fr]">
          <aside className="space-y-4">
            <div className="rounded-[8px] border border-slate-200 bg-slate-50 p-4">
              <div className="flex h-52 items-center justify-center overflow-hidden rounded-md border border-slate-200 bg-white text-sm text-slate-400">
                {form.imageUrl ? (
                  <img src={getImageSrc(form.imageUrl)} alt="" className="h-full w-full bg-white object-contain" />
                ) : (
                  <span>No image</span>
                )}
              </div>
              <p className="mt-3 text-xs leading-5 text-slate-500">
                Upload guide or guest image. Large files are optimized before saving.
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={(event) => uploadImage(event.target.files?.[0] ?? null)}
                className="mt-3 w-full text-sm"
              />
            </div>

            <div className="rounded-[8px] border border-blue-100 bg-blue-50/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Bonus</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">{form.bonus || '-'}</p>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                Main bonus number used for lookup, detail, and slip printing.
              </p>
            </div>
          </aside>

          <div className="space-y-4">
            {error ? (
              <div className="rounded-md border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {error}
              </div>
            ) : null}

            <BonusFormSection title="Bonus Information">
              <Field label="Work date" value={form.workDate} type="date" onChange={(value) => setField('workDate', value)} />
              <Field label="Bonus" value={form.bonus} onChange={(value) => setField('bonus', value)} />
              <Field
                label="Bonus Name"
                value={form.bonusName}
                onChange={(value) => setField('bonusName', value)}
                wide
              />
              <Field label="Party Code" value={form.partyCode} onChange={(value) => setField('partyCode', value)} />
              <Field label="Nation" value={form.nation} onChange={(value) => setField('nation', value)} />
            </BonusFormSection>

            <BonusFormSection title="Agent & Guide">
              <Field label="Agent Code" value={form.agentCode} onChange={(value) => setField('agentCode', value)} />
              <Field
                label="Agent Name"
                value={form.agentName}
                onChange={(value) => setField('agentName', value)}
                wide
              />
              <Field label="Guide" value={form.guide} onChange={(value) => setField('guide', value)} />
              <Field
                label="Guide Name"
                value={form.guideName}
                onChange={(value) => setField('guideName', value)}
                wide
              />
            </BonusFormSection>

            <BonusFormSection title="Passenger & Travel">
              <Field label="Adult" value={form.adult} type="number" onChange={(value) => setField('adult', Number(value))} />
              <Field label="Child" value={form.child} type="number" onChange={(value) => setField('child', Number(value))} />
              <Field
                label="Tour Leader"
                value={form.tourLeader}
                type="number"
                onChange={(value) => setField('tourLeader', Number(value))}
              />
              <Field label="Car Code" value={form.carCode} onChange={(value) => setField('carCode', value)} />
              <Field label="Shop" value={form.shop} onChange={(value) => setField('shop', value)} />
              <Field label="Hotel" value={form.hotel} onChange={(value) => setField('hotel', value)} />
              <Field label="Come From" value={form.comeFrom} onChange={(value) => setField('comeFrom', value)} />
              <Field label="Bus Type" value={form.busType} onChange={(value) => setField('busType', value)} />
              <Field label="Tour In" value={form.tourIn} onChange={(value) => setField('tourIn', value)} />
              <Field label="Tour Out" value={form.tourOut} onChange={(value) => setField('tourOut', value)} />
            </BonusFormSection>

            <BonusFormSection title="Remark">
              <label className="space-y-2 md:col-span-2 xl:col-span-3">
                <span className="text-sm font-semibold text-slate-700">Remark</span>
                <textarea
                  value={form.comment}
                  onChange={(event) => setField('comment', event.target.value)}
                  className="min-h-24 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </label>
            </BonusFormSection>
          </div>
        </div>
        <div className="sticky bottom-0 flex justify-end gap-3 border-t border-slate-200 bg-white/95 px-5 py-4 backdrop-blur">
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

function BonusFormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-[8px] border border-slate-200 bg-slate-50/60 p-4">
      <h3 className="mb-4 text-sm font-semibold text-slate-800">{title}</h3>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{children}</div>
    </section>
  );
}

function Field({
  label,
  value,
  type = 'text',
  onChange,
  wide = false,
}: {
  label: string;
  value: string | number;
  type?: string;
  onChange: (value: string) => void;
  wide?: boolean;
}) {
  return (
    <label className={`space-y-2 ${wide ? 'md:col-span-2' : ''}`}>
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <input
        type={type === 'date' ? 'text' : type}
        value={type === 'date' ? dateInputValue(String(value ?? '')) : type === 'number' && value === 0 ? '' : value}
        placeholder={type === 'date' ? '--/--/----' : undefined}
        onChange={(event) => onChange(type === 'date' ? parseDateInput(event.target.value) : event.target.value)}
        onBlur={(event) => {
          if (type === 'date') {
            onChange(completeDateInput(event.target.value));
          }
        }}
        className="form-input rounded-md"
      />
    </label>
  );
}

function ExportModal({
  range,
  fileType,
  rows,
  loading,
  onChange,
  onFileTypeChange,
  onClose,
  onExport,
}: {
  range: { from: string; to: string };
  fileType: 'xlsx' | 'xls';
  rows: BonusCard[];
  loading: boolean;
  onChange: (value: { from: string; to: string }) => void;
  onFileTypeChange: (value: 'xlsx' | 'xls') => void;
  onClose: () => void;
  onExport: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <div className="max-h-[92vh] w-full max-w-6xl overflow-hidden bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Export Excel</h2>
            <p className="mt-1 text-sm text-slate-500">
              Preview shows every field that will be exported, including fields hidden from the main table.
            </p>
          </div>
          <button className="toolbar-btn" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-[180px_180px_160px_1fr]">
          <Field label="From" value={range.from} type="date" onChange={(from) => onChange({ ...range, from })} />
          <Field label="To" value={range.to} type="date" onChange={(to) => onChange({ ...range, to })} />
          <label className="space-y-1">
            <span className="text-sm font-medium text-slate-600">File type</span>
            <select
              value={fileType}
              onChange={(event) => onFileTypeChange(event.target.value as 'xlsx' | 'xls')}
              className="form-input"
            >
              <option value="xlsx">xlsx</option>
              <option value="xls">xls</option>
            </select>
          </label>
          <div className="border border-slate-200 bg-slate-50 px-3 py-2">
            <p className="text-xs text-slate-500">Export rows</p>
            <p className="text-xl font-semibold text-blue-800">{loading ? '...' : rows.length}</p>
          </div>
        </div>
        <div className="mt-4 max-h-[52vh] overflow-auto border border-slate-200">
          <table className="w-full min-w-[1800px] border-collapse text-xs">
            <thead className="sticky top-0 bg-slate-50">
              <tr>
                {exportColumns.map((column) => (
                  <th
                    key={column.key}
                    className="border-b border-slate-200 px-3 py-2 text-left font-semibold uppercase text-slate-500"
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={exportColumns.length} className="px-4 py-8 text-center text-slate-400">
                    Loading preview...
                  </td>
                </tr>
              ) : null}
              {!loading && rows.length === 0 ? (
                <tr>
                  <td colSpan={exportColumns.length} className="px-4 py-8 text-center text-slate-400">
                    No data in selected range.
                  </td>
                </tr>
              ) : null}
              {!loading &&
                rows.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100 hover:bg-blue-50/60">
                    {exportColumns.map((column) => (
                      <td key={column.key} className="px-3 py-2 text-slate-700">
                        {formatCellValue(row, column.key)}
                      </td>
                    ))}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button className="toolbar-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="toolbar-btn-primary" disabled={loading || rows.length === 0} onClick={onExport}>
            Export
          </button>
        </div>
      </div>
    </div>
  );
}

function PrintModal({ row, onClose }: { row: BonusCard; onClose: () => void }) {
  const pax = row.adult + row.child + row.tourLeader;
  const bonusRows: Array<[string, string | number]> = [
    ['Work date', formatDate(row.workDate)],
    ['Bonus', row.bonus],
    ['Bonus name', row.bonusName],
    ['Party code', row.partyCode],
    ['Nation', row.nation],
  ];
  const agentRows: Array<[string, string | number]> = [
    ['Agent code', row.agentCode],
    ['Agent name', row.agentName],
    ['Guide', row.guide],
    ['Guide name', row.guideName],
  ];
  const travelRows: Array<[string, string | number]> = [
    ['Adult', row.adult],
    ['Child', row.child],
    ['Tour leader', row.tourLeader],
    ['Pax total', pax],
    ['Car code', row.carCode],
    ['Shop', row.shop],
    ['Hotel', row.hotel],
    ['Come from', row.comeFrom],
    ['Bus type', row.busType],
    ['Tour in', row.tourIn],
    ['Tour out', row.tourOut],
  ];
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <div className="max-h-[92vh] w-full max-w-6xl overflow-auto rounded-[10px] border border-slate-200/80 bg-white/95 shadow-[0_24px_70px_rgba(15,23,42,0.18)] backdrop-blur">
        <div className="no-print flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-[24px] font-semibold leading-tight text-slate-950">Bonus Detail</h2>
            <p className="mt-1 text-sm text-slate-500">
              Review all visible and hidden fields for the selected bonus card.
            </p>
          </div>
          <button className="toolbar-btn" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="grid gap-5 p-5 lg:grid-cols-[220px_1fr]">
          <aside className="no-print space-y-4">
            <div className="rounded-[8px] border border-slate-200 bg-slate-50 p-4">
              <div className="flex h-52 items-center justify-center overflow-hidden rounded-md border border-slate-200 bg-white text-sm text-slate-400">
                {row.imageUrl ? (
                  <img src={getImageSrc(row.imageUrl)} alt="" className="h-full w-full bg-white object-contain" />
                ) : (
                  <span>No image</span>
                )}
              </div>
            </div>

            <div className="rounded-[8px] border border-blue-100 bg-blue-50/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Selected Bonus</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">{row.bonus}</p>
              <p className="mt-2 text-xs leading-5 text-slate-500">{row.guideName || row.bonusName || '-'}</p>
            </div>

          </aside>

          <div className="print-area space-y-4">
            <div className="rounded-[8px] border border-slate-200 bg-white p-5">
              <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                  <p className="text-xs font-semibold uppercase text-blue-700">Bonus Card Detail</p>
                  <h3 className="mt-1 text-2xl font-semibold text-slate-950">
                    {row.bonus} {row.bonusName}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {row.agentCode} {row.agentName}
                  </p>
                </div>
                <p className="text-sm font-medium text-slate-500">{formatDate(row.workDate)}</p>
              </div>
            </div>

            <BonusDetailSection title="Bonus Information" rows={bonusRows} />
            <BonusDetailSection title="Agent & Guide" rows={agentRows} />
            <BonusDetailSection title="Passenger & Travel" rows={travelRows} />
            <section className="rounded-[8px] border border-slate-200 bg-slate-50/60 p-4">
              <h3 className="mb-4 text-sm font-semibold text-slate-800">Remark</h3>
              <div className="rounded-md border border-slate-100 bg-white px-3 py-3">
                <p className="text-sm font-medium text-slate-800">{row.comment || '-'}</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

function BonusDetailSection({ title, rows }: { title: string; rows: Array<[string, string | number]> }) {
  return (
    <section className="rounded-[8px] border border-slate-200 bg-slate-50/60 p-4">
      <h3 className="mb-4 text-sm font-semibold text-slate-800">{title}</h3>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {rows.map(([label, value]) => (
          <DetailLine key={label} label={label} value={String(value ?? '')} />
        ))}
      </div>
    </section>
  );
}

function DetailLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-100 bg-white px-3 py-2">
      <p className="text-xs font-semibold uppercase text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-800">{value || '-'}</p>
    </div>
  );
}

function formatCellValue(row: BonusCard, key: keyof BonusCard) {
  if (key === 'workDate') {
    return formatDate(row.workDate);
  }
  return String(row[key] ?? '');
}

function formatDate(value: string) {
  if (!value) return '--/--/----';
  const [year, month, day] = value.slice(0, 10).split('-');
  if (!year || !month || !day) {
    return value;
  }
  return `${day}/${month}/${year}`;
}

function dateInputValue(value?: string) {
  return value ? formatDate(value) : '';
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

function toFriendlyError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error ?? '');
  const normalized = message.toLowerCase();
  if (
    normalized.includes('413') ||
    normalized.includes('payload too large') ||
    normalized.includes('file too large')
  ) {
    return 'File too large';
  }
  return message || 'Unable to save data.';
}

function resizeImageToFile(file: File, maxSize = 512, quality = 0.82) {
  return new Promise<File>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Unable to read image.'));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error('Unable to load image.'));
      image.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
        const width = Math.max(1, Math.round(image.width * scale));
        const height = Math.max(1, Math.round(image.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d');
        if (!context) {
          reject(new Error('Canvas is not available.'));
          return;
        }
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, width, height);
        context.drawImage(image, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Unable to export image.'));
              return;
            }
            resolve(new File([blob], replaceImageExtension(file.name), { type: 'image/jpeg' }));
          },
          'image/jpeg',
          quality,
        );
      };
      image.src = String(reader.result ?? '');
    };
    reader.readAsDataURL(file);
  });
}

function replaceImageExtension(filename: string) {
  const baseName = filename.replace(/\.[^/.]+$/, '');
  return `${baseName || 'bonus-card-image'}.jpg`;
}

function escapeHtml(value: unknown) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

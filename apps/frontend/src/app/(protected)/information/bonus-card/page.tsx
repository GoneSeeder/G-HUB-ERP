'use client';

import { FormEvent, ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { DownloadIcon, EditIcon, PlusIcon, PrintIcon, SaveIcon, SearchIcon, TrashIcon, UploadIcon, XIcon } from '@/components/ui/icons';
import { DataPanel, PageHeader, PageShell } from '@/components/ui/page-shell';
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
  nameListCode: string;
  guide2: string;
  guide2Name: string;
  guide2Phone: string;
  guide3: string;
  guide3Name: string;
  guide3Phone: string;
  narratorCode: string;
  narratorName: string;
  narratorPhone: string;
};

type UploadImageResponse = {
  imageUrl: string;
};

type NameListItem = {
  id?: string;
  itemNo: number | '';
  isLeader: boolean;
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
  agentCode: string;
  agentName: string;
  pax: number;
  items: NameListItem[];
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
  nameListCode: '',
  guide2: '',
  guide2Name: '',
  guide2Phone: '',
  guide3: '',
  guide3Name: '',
  guide3Phone: '',
  narratorCode: '',
  narratorName: '',
  narratorPhone: '',
};

const visibleColumns: Array<{ key: keyof BonusCard; label: string; width: string }> = [
  { key: 'bonus', label: 'Bonus', width: '5%' },
  { key: 'bonusName', label: 'Bonus Name', width: '12%' },
  { key: 'agentCode', label: 'Agent Code', width: '7%' },
  { key: 'agentName', label: 'Agent Name', width: '12%' },
  { key: 'guide', label: 'Guide', width: '5%' },
  { key: 'guideName', label: 'Guide Name', width: '10%' },
  { key: 'partyCode', label: 'Party Code', width: '11%' },
  { key: 'comment', label: 'Remark', width: '10%' },
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
  { key: 'nameListCode', label: 'Namelist' },
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
  { key: 'guide2', label: 'Guide 2' },
  { key: 'guide2Name', label: 'Guide 2 Name' },
  { key: 'guide2Phone', label: 'Guide 2 Phone' },
  { key: 'guide3', label: 'Guide 3' },
  { key: 'guide3Name', label: 'Guide 3 Name' },
  { key: 'guide3Phone', label: 'Guide 3 Phone' },
  { key: 'narratorCode', label: 'Narrator Code' },
  { key: 'narratorName', label: 'Narrator Name' },
  { key: 'narratorPhone', label: 'Narrator Phone' },
  { key: 'comment', label: 'Remark' },
];

export default function BonusCardPage() {
  const [rows, setRows] = useState<BonusCard[]>([]);
  const [workDate, setWorkDate] = useState(today);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null);
  const [form, setForm] = useState<BonusCard>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportRange, setExportRange] = useState({ from: today, to: today });
  const [exportFileType, setExportFileType] = useState<'xlsx' | 'xls'>('xlsx');
  const [exportRows, setExportRows] = useState<BonusCard[]>([]);
  const [exportLoading, setExportLoading] = useState(false);
  const [printRow, setPrintRow] = useState<BonusCard | null>(null);
  const [nameListRow, setNameListRow] = useState<BonusCard | null>(null);

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
    <PageShell className="h-full !max-w-[calc(100vw-2rem)] gap-3 overflow-hidden">
      <PageHeader
        eyebrow="Document · Bonus Card"
        title="Bonus Card"
        description="Bonus card records for document and operations workflow."
        actions={
          <>
            <button className="toolbar-btn-primary" onClick={openCreate}>
              <PlusIcon className="erp-action-icon" /> Add Bonus
            </button>
            <button className="toolbar-btn" disabled={selectedIds.length !== 1} onClick={() => {
              const selected = rows.find((row) => row.id === selectedIds[0]);
              if (selected) setNameListRow(selected);
            }}>
              <SearchIcon className="erp-action-icon" /> Show Name List
            </button>
            <button className="toolbar-btn" onClick={() => window.print()}>
              <PrintIcon className="erp-action-icon" /> Print
            </button>
            <button className="toolbar-btn" onClick={() => setExportOpen(true)}>
              <DownloadIcon className="erp-action-icon" /> Export
            </button>
          </>
        }
      />

      <DataPanel className="erp-slide-left shrink-0 px-3 py-2.5">
        <div className="flex flex-wrap items-end gap-2">
          <label className="block w-[170px] space-y-1">
            <span className="text-[10px] font-medium uppercase text-slate-500">Date</span>
            <BonusDateInput value={workDate} onChange={setWorkDate} />
          </label>
          <label className="block min-w-[280px] flex-1 space-y-1">
            <span className="text-[10px] font-medium uppercase text-slate-500">Search</span>
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search bonus, guide, party code, agent..."
                className="form-input pl-9"
              />
            </div>
          </label>
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-right">
            <p className="text-[10px] font-medium uppercase text-slate-400">Records</p>
            <p className="text-sm font-medium text-slate-900">{filteredRows.length}</p>
          </div>
        </div>
      </DataPanel>

      {error ? (
        <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      <DataPanel className="erp-slide-right flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-4 py-2">
          <div className="flex items-center gap-3 text-sm text-slate-400">
            Showing {filteredRows.length} items
            {selectedIds.length ? <span>/ selected {selectedIds.length}</span> : null}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          <table className="w-full table-fixed border-collapse text-xs">
            <thead className="sticky top-0 z-10 bg-slate-50">
              <tr>
                <th className="w-8 border-b border-slate-200 px-2 py-2.5 text-left" />
                <th className="w-12 border-b border-slate-200 px-2 py-2.5 text-left text-[10px] font-semibold uppercase text-slate-400">
                  Image
                </th>
                {visibleColumns.map((column) => (
                  <th
                    key={column.key}
                    style={{ width: column.width }}
                    className="truncate border-b border-slate-200 px-2 py-2.5 text-left text-[10px] font-semibold uppercase text-slate-400"
                  >
                    {column.label}
                  </th>
                ))}
                <th className="w-[140px] border-b border-slate-200 px-2 py-2.5 text-right text-[10px] font-semibold uppercase text-slate-400">
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
                        selected ? 'bg-sky-50' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="px-2 py-2">
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => toggleSelected(row.id)}
                          className="h-4 w-4 accent-[#1478ff]"
                        />
                      </td>
                      <td className="px-2 py-2">
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
                        <td key={column.key} className="px-2 py-2 text-slate-700">
                          <span className="block truncate">{String(row[column.key] ?? '')}</span>
                        </td>
                      ))}
                      <td className="px-2 py-2 text-right">
                        <div className="flex justify-end gap-1.5 font-medium">
                          <button className="toolbar-btn min-h-9 px-2.5" onClick={() => setNameListRow(row)}>
                            Name List
                          </button>
                          <button className="toolbar-btn min-h-9 px-2.5" onClick={() => setPrintRow(row)}>
                            Detail
                          </button>
                          <button className="toolbar-btn min-h-9 px-2.5" onClick={() => openEdit(row)}>
                            <EditIcon className="erp-action-icon" /> Edit
                          </button>
                          <button className="toolbar-btn-danger min-h-9 px-2.5" onClick={() => deleteRow(row)}>
                            <TrashIcon className="erp-action-icon" /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </DataPanel>

      {formMode ? (
        <BonusModal
          form={form}
          mode={formMode}
          error={formError}
          onChange={setForm}
          onClose={() => setFormMode(null)}
          onSubmit={saveForm}
          onOpenNameList={() => setNameListRow(form)}
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
      {nameListRow ? <NameListModal row={nameListRow} onClose={() => setNameListRow(null)} /> : null}
    </PageShell>
  );
}

function BonusModal({
  form,
  mode,
  error,
  onChange,
  onClose,
  onSubmit,
  onOpenNameList,
}: {
  form: BonusCard;
  mode: 'create' | 'edit';
  error: string | null;
  onChange: (value: BonusCard) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onOpenNameList: () => void;
}) {
  const [showExtraGuides, setShowExtraGuides] = useState(false);
  const [showNarrator, setShowNarrator] = useState(false);
  const setField = (key: keyof BonusCard, value: string | number) => {
    onChange({ ...form, [key]: value });
  };

  const mapGuide = async (code: string, target: 'guide2' | 'guide3') => {
    const normalizedCode = code.trim();
    if (!normalizedCode) return;
    try {
      const result = await apiFetch<{ items: Array<{ guideCode: string; fullName: string; fullNameTh: string; phone: string }> }>(
        `/api/members?page=1&search=${encodeURIComponent(normalizedCode)}`,
      );
      const guide = result.items.find((item) => item.guideCode.toLowerCase() === normalizedCode.toLowerCase()) ?? result.items[0];
      if (!guide) return;
      onChange({
        ...form,
        [target]: normalizedCode,
        [`${target}Name`]: guide.fullName || guide.fullNameTh || guide.guideCode,
        [`${target}Phone`]: guide.phone || '',
      } as BonusCard);
    } catch {
      // Keep manually entered values if guide lookup is not available.
    }
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
    <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4">
      <form
        onSubmit={onSubmit}
        className="modal-pop flex max-h-[calc(100vh-2rem)] w-full max-w-[920px] flex-col overflow-hidden rounded-xl border border-slate-200/80 bg-white/95 shadow-[0_24px_70px_rgba(15,23,42,0.18)] backdrop-blur"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-3">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Document ยท Bonus Card</p>
            <h2 className="mt-1 text-lg font-semibold leading-tight text-slate-950">
              {mode === 'create' ? 'Add Bonus' : 'Edit Bonus'}
            </h2>
          </div>
          <button type="button" className="toolbar-btn" onClick={onClose}>
            <XIcon className="erp-action-icon" /> Close
          </button>
        </div>
        <div className="grid min-h-0 flex-1 gap-3 p-4 lg:grid-cols-[150px_1fr]">
          <aside className="space-y-2">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5">
              <div className="flex h-28 items-center justify-center overflow-hidden rounded-md border border-slate-200 bg-white text-xs text-slate-400">
                {form.imageUrl ? (
                  <img src={getImageSrc(form.imageUrl)} alt="" className="h-full w-full bg-white object-contain" />
                ) : (
                  <span>No image</span>
                )}
              </div>
              <label className="toolbar-btn mt-2 w-full cursor-pointer">
                <UploadIcon className="erp-action-icon" /> Upload
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => uploadImage(event.target.files?.[0] ?? null)}
                  className="sr-only"
                />
              </label>
            </div>

            <div className="rounded-lg border border-sky-100 bg-sky-50/70 p-3">
              <p className="text-[10px] font-medium uppercase tracking-wide text-blue-700">Bonus</p>
              <p className="mt-1 truncate text-xl font-semibold text-slate-950">{form.bonus || '-'}</p>
            </div>
          </aside>

          <div className="min-h-0 space-y-3 overflow-hidden">
            {error ? (
              <div className="rounded-md border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {error}
              </div>
            ) : null}

            <BonusFormSection title="Bonus Information">
              <Field label="Work date" value={form.workDate} type="date" onChange={(value) => setField('workDate', value)} />
              <Field label="Bonus" value={form.bonus} onChange={(value) => setField('bonus', value)} />
              <Field label="Namelist" value={form.nameListCode} onChange={(value) => setField('nameListCode', value)} />
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
              <label className="space-y-1 md:col-span-2 xl:col-span-4">
                <span className="text-xs font-medium text-slate-700">Remark</span>
                <textarea
                  value={form.comment}
                  onChange={(event) => setField('comment', event.target.value)}
                  className="min-h-12 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-[#1478ff] focus:ring-4 focus:ring-[rgba(20,120,255,0.14)]"
                />
              </label>
            </BonusFormSection>

            <CollapsibleSection title="ข้อมูลไกด์คนที่ 2 และ 3" open={showExtraGuides} onToggle={() => setShowExtraGuides((current) => !current)}>
              <Field label="Guide 2 Code" value={form.guide2} onChange={(value) => setField('guide2', value)} onBlur={() => mapGuide(form.guide2, 'guide2')} />
              <Field label="Guide 2 Name" value={form.guide2Name} onChange={(value) => setField('guide2Name', value)} wide />
              <Field label="Guide 2 Phone" value={form.guide2Phone} onChange={(value) => setField('guide2Phone', value)} />
              <Field label="Guide 3 Code" value={form.guide3} onChange={(value) => setField('guide3', value)} onBlur={() => mapGuide(form.guide3, 'guide3')} />
              <Field label="Guide 3 Name" value={form.guide3Name} onChange={(value) => setField('guide3Name', value)} wide />
              <Field label="Guide 3 Phone" value={form.guide3Phone} onChange={(value) => setField('guide3Phone', value)} />
            </CollapsibleSection>

            <CollapsibleSection title="ข้อมูลอาจารย์ห้องพากย์" open={showNarrator} onToggle={() => setShowNarrator((current) => !current)}>
              <Field label="Code" value={form.narratorCode} onChange={(value) => setField('narratorCode', value)} />
              <Field label="Name" value={form.narratorName} onChange={(value) => setField('narratorName', value)} wide />
              <Field label="Phone" value={form.narratorPhone} onChange={(value) => setField('narratorPhone', value)} />
            </CollapsibleSection>
          </div>
        </div>
        <div className="flex shrink-0 justify-end gap-3 border-t border-slate-200 bg-white/95 px-5 py-3 backdrop-blur">
          <button type="button" className="toolbar-btn mr-auto" onClick={onOpenNameList}>
            <SearchIcon className="erp-action-icon" /> Name List
          </button>
          <button type="button" className="toolbar-btn" onClick={onClose}>
            <XIcon className="erp-action-icon" /> Cancel
          </button>
          <button type="submit" className="toolbar-btn-primary">
            <SaveIcon className="erp-action-icon" /> Save
          </button>
        </div>
      </form>
    </div>
  );
}

function BonusFormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
      <h3 className="mb-2 text-xs font-semibold text-slate-800">{title}</h3>
      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">{children}</div>
    </section>
  );
}

function CollapsibleSection({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-slate-50/60">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between px-3 py-2 text-left text-xs font-semibold text-slate-800 transition hover:bg-[#0752d6]/[0.07]"
      >
        <span>{title}</span>
        <span className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>
      {open ? <div className="grid gap-2 border-t border-slate-200 p-3 md:grid-cols-2 xl:grid-cols-4">{children}</div> : null}
    </section>
  );
}

function Field({
  label,
  value,
  type = 'text',
  onChange,
  onBlur,
  wide = false,
}: {
  label: string;
  value: string | number;
  type?: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  wide?: boolean;
}) {
  if (type === 'date') {
    return (
      <label className={`space-y-1 ${wide ? 'md:col-span-2' : ''}`}>
        <span className="text-xs font-medium text-slate-700">{label}</span>
        <BonusDateInput value={String(value ?? '')} onChange={onChange} compact />
      </label>
    );
  }

  return (
    <label className={`space-y-1 ${wide ? 'md:col-span-2' : ''}`}>
      <span className="text-xs font-medium text-slate-700">{label}</span>
      <input
        type={type}
        value={type === 'number' && value === 0 ? '' : value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        className="form-input h-8 rounded-md text-sm"
      />
    </label>
  );
}

function BonusDateInput({
  value,
  onChange,
  compact = false,
}: {
  value: string;
  onChange: (value: string) => void;
  compact?: boolean;
}) {
  const pickerRef = useRef<HTMLInputElement>(null);
  const [displayValue, setDisplayValue] = useState(dateInputValue(value));

  useEffect(() => {
    setDisplayValue(dateInputValue(value));
  }, [value]);

  const commitDisplayValue = (nextValue: string) => {
    const normalized = completeDateInput(nextValue);
    onChange(normalized);
    setDisplayValue(dateInputValue(normalized));
  };

  const openPicker = () => {
    const picker = pickerRef.current as (HTMLInputElement & { showPicker?: () => void }) | null;
    if (picker?.showPicker) {
      picker.showPicker();
    } else {
      picker?.click();
    }
  };

  return (
    <div className="relative">
      <input
        value={displayValue}
        placeholder="--/--/----"
        onChange={(event) => setDisplayValue(event.target.value)}
        onBlur={(event) => commitDisplayValue(event.target.value)}
        className={`form-input rounded-md pr-9 ${compact ? 'h-8 text-sm' : ''}`}
      />
      <input
        ref={pickerRef}
        type="date"
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          setDisplayValue(dateInputValue(event.target.value));
        }}
        className="pointer-events-none absolute inset-0 opacity-0"
        tabIndex={-1}
        aria-hidden="true"
      />
      <button
        type="button"
        onClick={openPicker}
        className="absolute right-1.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 hover:bg-[#0752d6]/[0.07] hover:text-[#0752d6]"
        aria-label="Open calendar"
      >
        ▾
      </button>
    </div>
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
    <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4">
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
                  <tr key={row.id} className="border-b border-slate-100 hover:bg-sky-50/60">
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

function NameListModal({ row, onClose }: { row: BonusCard; onClose: () => void }) {
  const [nameLists, setNameLists] = useState<NameList[]>([]);
  const [loading, setLoading] = useState(true);
  const selected =
    nameLists.find((item) => item.code === row.nameListCode) ??
    nameLists.find((item) => item.partyCode === row.partyCode) ??
    nameLists[0];

  useEffect(() => {
    const loadNameLists = async () => {
      setLoading(true);
      try {
        const query = row.nameListCode || row.partyCode;
        const data = await apiFetch<NameList[]>(`/api/name-lists?search=${encodeURIComponent(query)}`);
        setNameLists(data);
      } catch {
        setNameLists([]);
      } finally {
        setLoading(false);
      }
    };
    void loadNameLists();
  }, [row.nameListCode, row.partyCode]);

  return (
    <div className="modal-backdrop fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="modal-pop flex max-h-[86vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-slate-200/80 bg-white/95 shadow-[0_24px_70px_rgba(15,23,42,0.18)] backdrop-blur">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Name List</h2>
            <p className="text-xs text-slate-500">{row.partyCode || row.nameListCode || 'No party code'}</p>
          </div>
          <button type="button" className="toolbar-btn" onClick={onClose}>
            <XIcon className="erp-action-icon" /> Close
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-auto p-4">
          {loading ? (
            <div className="py-12 text-center text-sm text-slate-400">Loading name list...</div>
          ) : selected ? (
            <>
              <div className="mb-3 grid gap-2 md:grid-cols-4">
                <DetailLine label="Code" value={selected.code} />
                <DetailLine label="Party Code" value={selected.partyCode} />
                <DetailLine label="Agent" value={`${selected.agentCode} ${selected.agentName}`} />
                <DetailLine label="Passengers" value={String(selected.items.length || selected.pax)} />
              </div>
              <table className="w-full table-fixed border-collapse text-xs">
                <thead className="sticky top-0 bg-white">
                  <tr>
                    {['No.', 'Leader', 'Passport', 'First Name', 'Last Name', 'Birth Date', 'Age', 'Gender', 'Nation'].map((label) => (
                      <th key={label} className="border-b border-slate-200 px-2 py-2 text-left text-[10px] font-semibold uppercase text-slate-400">
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {selected.items.map((item, index) => (
                    <tr key={item.id ?? index} className="border-b border-slate-100 hover:bg-[#0752d6]/[0.06]">
                      <td className="px-2 py-2">{item.itemNo || index + 1}</td>
                      <td className="px-2 py-2 text-emerald-600">{item.isLeader ? '✓' : ''}</td>
                      <td className="px-2 py-2">{item.passportNo}</td>
                      <td className="px-2 py-2">{item.firstName}</td>
                      <td className="px-2 py-2">{item.lastName}</td>
                      <td className="px-2 py-2">{formatDate(item.birthDate)}</td>
                      <td className="px-2 py-2">{item.age ?? '-'}</td>
                      <td className="px-2 py-2">{item.gender}</td>
                      <td className="px-2 py-2">{item.nationCode}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : (
            <div className="py-12 text-center text-sm text-slate-400">No name list found for this bonus card.</div>
          )}
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
    ['Guide 2', row.guide2],
    ['Guide 2 name', row.guide2Name],
    ['Guide 2 phone', row.guide2Phone],
    ['Guide 3', row.guide3],
    ['Guide 3 name', row.guide3Name],
    ['Guide 3 phone', row.guide3Phone],
    ['Narrator code', row.narratorCode],
    ['Narrator name', row.narratorName],
    ['Narrator phone', row.narratorPhone],
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
    <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4">
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

            <div className="rounded-[8px] border border-sky-100 bg-sky-50/70 p-4">
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

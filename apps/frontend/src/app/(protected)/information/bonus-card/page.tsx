'use client';

import { FormEvent, ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { DownloadIcon, EditIcon, PlusIcon, PrintIcon, SaveIcon, SearchIcon, TrashIcon, UploadIcon, XIcon } from '@/components/ui/icons';
import { DataPanel, PageHeader, PageShell } from '@/components/ui/page-shell';
import { apiFetch, apiUpload } from '@/lib/api';

type BonusGuide = {
  code: string;
  name: string;
  phone: string;
};

type BonusNarrator = {
  code: string;
  name: string;
};

type BonusCard = {
  id: string;
  workDate: string;
  bonus: string;
  bonusName: string;
  agentCode: string;
  agentName: string;
  companyCode: string;
  guide: string;
  guideName: string;
  memberCode: string;
  supervisorCode: string;
  partyCode: string;
  nation: string;
  province: string;
  adult: number;
  child: number;
  tourLeader: number;
  student: number;
  carCode: string;
  shop: string;
  charterCode: string;
  hotel: string;
  comeFrom: string;
  busType: string;
  tourIn: string;
  tourOut: string;
  comment: string;
  imageUrl: string;
  nameListCode: string;
  extraGuides: BonusGuide[];
  narratorGroup: string;
  narratorPax: number;
  narrators: BonusNarrator[];
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
const countryNameByCode: Record<string, string> = {
  AD: 'ANDORRA',
  AE: 'UNITED ARAB EMIRATES',
  AF: 'AFGHANISTAN',
  AG: 'ANTIGUA AND BARBUDA',
  AI: 'ANGUILLA',
  AL: 'ALBANIA',
  AM: 'ARMENIA',
  AO: 'ANGOLA',
  AR: 'ARGENTINA',
  AS: 'AMERICAN SAMOA',
  AT: 'AUSTRIA',
  AU: 'AUSTRALIA',
  AW: 'ARUBA',
  AZ: 'AZERBAIJAN',
  BA: 'BOSNIA AND HERZEGOVINA',
  BB: 'BARBADOS',
  BD: 'BANGLADESH',
  BE: 'BELGIUM',
  BF: 'BURKINA FASO',
  BG: 'BULGARIA',
  BH: 'BAHRAIN',
  BI: 'BURUNDI',
  BJ: 'BENIN',
  BN: 'BRUNEI',
  BO: 'BOLIVIA',
  BR: 'BRAZIL',
  BS: 'BAHAMAS',
  BT: 'BHUTAN',
  BW: 'BOTSWANA',
  BY: 'BELARUS',
  BZ: 'BELIZE',
  CA: 'CANADA',
  KH: 'CAMBODIA',
  CM: 'CAMEROON',
  CN: 'CHINA',
  CO: 'COLOMBIA',
  CR: 'COSTA RICA',
  CU: 'CUBA',
  CY: 'CYPRUS',
  CZ: 'CZECH REPUBLIC',
  DE: 'GERMANY',
  DK: 'DENMARK',
  DO: 'DOMINICAN REPUBLIC',
  DZ: 'ALGERIA',
  EC: 'ECUADOR',
  EE: 'ESTONIA',
  EG: 'EGYPT',
  ES: 'SPAIN',
  FI: 'FINLAND',
  FR: 'FRANCE',
  GB: 'UNITED KINGDOM',
  GE: 'GEORGIA',
  GR: 'GREECE',
  HK: 'HONG KONG',
  ID: 'INDONESIA',
  IE: 'IRELAND',
  IL: 'ISRAEL',
  IN: 'INDIA',
  IR: 'IRAN',
  IT: 'ITALY',
  JP: 'JAPAN',
  KR: 'KOREA',
  LA: 'LAOS',
  LK: 'SRI LANKA',
  MM: 'MYANMAR',
  MO: 'MACAU',
  MY: 'MALAYSIA',
  NL: 'NETHERLANDS',
  NP: 'NEPAL',
  NZ: 'NEW ZEALAND',
  PH: 'PHILIPPINES',
  RU: 'RUSSIA',
  SA: 'SAUDI ARABIA',
  SG: 'SINGAPORE',
  TH: 'THAILAND',
  TW: 'TAIWAN',
  UK: 'UNITED KINGDOM',
  US: 'UNITED STATES',
  VN: 'VIETNAM',
};

const emptyForm: BonusCard = {
  id: '',
  workDate: today,
  bonus: '',
  bonusName: '',
  agentCode: '',
  agentName: '',
  companyCode: '',
  guide: '',
  guideName: '',
  memberCode: '',
  supervisorCode: '',
  partyCode: '',
  nation: '',
  province: '',
  adult: 0,
  child: 0,
  tourLeader: 0,
  student: 0,
  carCode: '',
  shop: '',
  charterCode: '',
  hotel: '',
  comeFrom: '',
  busType: '',
  tourIn: '',
  tourOut: '',
  comment: '',
  imageUrl: '',
  nameListCode: '',
  extraGuides: [],
  narratorGroup: '',
  narratorPax: 0,
  narrators: [],
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

const exportColumns: Array<{ label: string; getValue: (row: BonusCard) => string | number }> = [
  { label: 'Work Date', getValue: (row) => formatDate(row.workDate) },
  { label: 'Bonus', getValue: (row) => row.bonus },
  { label: 'Bonus Name', getValue: (row) => row.bonusName },
  { label: 'Agent Code', getValue: (row) => row.agentCode },
  { label: 'Agent Name', getValue: (row) => row.agentName },
  { label: 'Company Code', getValue: (row) => row.companyCode },
  { label: 'Guide', getValue: (row) => row.guide },
  { label: 'Guide Name', getValue: (row) => row.guideName },
  { label: 'Member Code', getValue: (row) => row.memberCode },
  { label: 'Supervisor Code', getValue: (row) => row.supervisorCode },
  { label: 'Party Code', getValue: (row) => row.partyCode },
  { label: 'Namelist', getValue: (row) => row.nameListCode },
  { label: 'Nation', getValue: (row) => row.nation },
  { label: 'Adult', getValue: (row) => row.adult },
  { label: 'Child', getValue: (row) => row.child },
  { label: 'Tour Leader', getValue: (row) => row.tourLeader },
  { label: 'Student', getValue: (row) => row.student },
  { label: 'Car Code', getValue: (row) => row.carCode },
  { label: 'Shop', getValue: (row) => row.shop },
  { label: 'Province / Origin', getValue: (row) => row.province },
  { label: 'Charter Code', getValue: (row) => row.charterCode },
  { label: 'Come From', getValue: (row) => row.comeFrom },
  { label: 'Bus Type', getValue: (row) => row.busType },
  { label: 'Tour In', getValue: (row) => row.tourIn },
  { label: 'Tour Out', getValue: (row) => row.tourOut },
  { label: 'Extra Guides', getValue: (row) => formatGuideList(row.extraGuides) },
  { label: 'Narrator Group', getValue: (row) => row.narratorGroup },
  { label: 'Narrator Pax', getValue: (row) => row.narratorPax },
  { label: 'Narrators', getValue: (row) => formatNarratorList(row.narrators) },
  { label: 'Remark', getValue: (row) => row.comment },
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
            .map((column) => `<td>${escapeHtml(formatCellValue(column.getValue(row)))}</td>`)
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
  const [activeTab, setActiveTab] = useState<'details' | 'extra' | 'speaker'>('details');

  const setField = (key: keyof BonusCard, value: string | number) => {
    onChange({ ...form, [key]: value });
  };
  const totalCount = Number(form.adult || 0) + Number(form.child || 0) + Number(form.tourLeader || 0) + Number(form.student || 0);

  const addExtraGuide = () => {
    onChange({ ...form, extraGuides: [...form.extraGuides, { code: '', name: '', phone: '' }] });
  };

  const addSpeaker = () => {
    if (form.narrators.length >= 2) return;
    onChange({ ...form, narrators: [...form.narrators, { code: '', name: '' }] });
  };
  const updateExtraGuide = (index: number, guide: Partial<BonusGuide>) => {
    const nextGuides = form.extraGuides.map((item, itemIndex) => (itemIndex === index ? { ...item, ...guide } : item));
    onChange({ ...form, extraGuides: nextGuides });
  };
  const removeExtraGuide = (index: number) => {
    onChange({ ...form, extraGuides: form.extraGuides.filter((_, itemIndex) => itemIndex !== index) });
  };
  const updateNarrator = (index: number, narrator: Partial<BonusNarrator>) => {
    const nextNarrators = form.narrators.map((item, itemIndex) => (itemIndex === index ? { ...item, ...narrator } : item));
    onChange({ ...form, narrators: nextNarrators });
  };
  const removeSpeaker = (index: number) => {
    onChange({ ...form, narrators: form.narrators.filter((_, itemIndex) => itemIndex !== index) });
  };

  const mapMainGuide = async (code: string) => {
    const normalizedCode = code.trim();
    if (!normalizedCode) {
      onChange({ ...form, guide: '', guideName: '' });
      return;
    }
    try {
      const result = await apiFetch<{ items: Array<{ guideCode: string; fullName: string; fullNameTh: string; phone: string }> }>(
        `/api/members?page=1&search=${encodeURIComponent(normalizedCode)}`,
      );
      const guide = result.items.find((item) => item.guideCode.toLowerCase() === normalizedCode.toLowerCase()) ?? result.items[0];
      onChange({
        ...form,
        guide: normalizedCode,
        guideName: guide ? guide.fullName || guide.fullNameTh || guide.guideCode : '',
      });
    } catch {
      onChange({ ...form, guide: normalizedCode });
    }
  };

  const mapAgent = async (code: string) => {
    const normalizedCode = code.trim().toUpperCase();
    if (!normalizedCode) {
      onChange({ ...form, agentCode: '', agentName: '' });
      return;
    }
    try {
      const agents = await apiFetch<Array<{ id: string; agentCode: string; name: string }>>(
        `/api/agents/options?search=${encodeURIComponent(normalizedCode)}`,
      );
      const agent = agents.find((item) => item.agentCode.toUpperCase() === normalizedCode) ?? agents[0];
      onChange({
        ...form,
        agentCode: normalizedCode,
        agentName: agent ? agent.name || agent.agentCode : '',
      });
    } catch {
      onChange({ ...form, agentCode: normalizedCode });
    }
  };

  const mapGuide = async (code: string, index: number) => {
    const normalizedCode = code.trim();
    if (!normalizedCode) return;
    try {
      const result = await apiFetch<{ items: Array<{ guideCode: string; fullName: string; fullNameTh: string; phone: string }> }>(
        `/api/members?page=1&search=${encodeURIComponent(normalizedCode)}`,
      );
      const guide = result.items.find((item) => item.guideCode.toLowerCase() === normalizedCode.toLowerCase()) ?? result.items[0];
      if (!guide) return;
      updateExtraGuide(index, {
        code: normalizedCode,
        name: guide.fullName || guide.fullNameTh || guide.guideCode,
        phone: guide.phone || '',
      });
    } catch {
      // Keep manually entered values if guide lookup is not available.
    }
  };

  const uploadImage = async (file: File | null) => {
    if (!file) return;
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
        onKeyDown={(event) => {
          if (event.key === 'Enter' && event.target instanceof HTMLElement && event.target.tagName !== 'TEXTAREA') {
            event.preventDefault();
          }
        }}
        className="modal-pop flex max-h-[calc(100vh-1rem)] w-full max-w-[1160px] flex-col overflow-hidden rounded-xl border border-slate-200/80 bg-white/95 shadow-[0_24px_70px_rgba(15,23,42,0.18)] backdrop-blur"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-3">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Document / Bonus Card</p>
            <h2 className="mt-1 text-lg font-semibold leading-tight text-slate-950">
              {mode === 'create' ? 'Add Bonus' : 'Edit Bonus'}
            </h2>
          </div>
          <button type="button" className="toolbar-btn" onClick={onClose}>
            <XIcon className="erp-action-icon" /> Close
          </button>
        </div>

        <div className="flex shrink-0 gap-6 border-b border-slate-200 px-5">
          {[
            ['details', 'รายละเอียด'],
            ['extra', 'ข้อมูลเพิ่มเติม'],
            ['speaker', 'อาจารย์พากย์'],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key as typeof activeTab)}
              className={`border-b-2 px-2 py-3 text-sm font-medium transition ${
                activeTab === key ? 'border-[#1478ff] text-[#0752d6]' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="grid min-h-0 flex-1 gap-2 overflow-hidden p-2.5 lg:grid-cols-[130px_1fr]">
          <aside className="space-y-2">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
              <div className="flex h-20 items-center justify-center overflow-hidden rounded-md border border-dashed border-blue-300 bg-white text-xs text-slate-400 transition hover:border-[#1478ff] hover:text-[#0752d6]">
                {form.imageUrl ? (
                  <img src={getImageSrc(form.imageUrl)} alt="" className="h-full w-full bg-white object-contain" />
                ) : (
                  <span>Click to upload</span>
                )}
              </div>
              <label className="toolbar-btn mt-2 w-full cursor-pointer">
                <UploadIcon className="erp-action-icon" /> Upload
                <input type="file" accept="image/*" onChange={(event) => uploadImage(event.target.files?.[0] ?? null)} className="sr-only" />
              </label>
            </div>

            <div className="rounded-lg border border-sky-100 bg-sky-50/70 p-2.5">
              <p className="text-[10px] font-medium uppercase tracking-wide text-blue-700">Bonus</p>
              <p className="mt-1 truncate text-xl font-semibold text-slate-950">{form.bonus || '-'}</p>
            </div>
          </aside>

          <div className="min-h-0">
            {error ? (
              <div className="mb-3 rounded-md border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>
            ) : null}

            {activeTab === 'details' ? (
              <div className="grid gap-2 xl:grid-cols-[1.35fr_0.8fr]">
                <div className="space-y-1.5">
                  <BonusFormSection title="Main / Document" columns="grid-cols-1">
                    <div className="grid gap-1.5 md:grid-cols-3">
                      <Field label="Group code" value={form.nameListCode} onChange={(value) => setField('nameListCode', value)} />
                      <Field label="Work date" value={form.workDate} type="date" onChange={(value) => setField('workDate', value)} />
                      <Field label="Bonus no." value={form.bonus} onChange={(value) => setField('bonus', value)} />
                    </div>
                    <div className="grid gap-1.5 md:grid-cols-[1fr_120px_120px]">
                      <Field label="Bonus name" value={form.bonusName} onChange={(value) => setField('bonusName', value)} />
                      <Field label="Car no." value={form.carCode} onChange={(value) => setField('carCode', value)} />
                      <Field label="Car type" value={form.busType} onChange={(value) => setField('busType', value)} />
                    </div>
                  </BonusFormSection>

                  <BonusFormSection title="Agent / Guide / Member Mapping" columns="grid-cols-1">
                    <div className="grid gap-1.5 md:grid-cols-2">
                      <MappedField
                        label="Agent code"
                        value={form.agentCode}
                        mappedValue={form.agentName || '-'}
                        onChange={(value) => setField('agentCode', value.toUpperCase())}
                        onBlur={() => mapAgent(form.agentCode)}
                      />
                      <MappedField
                        label="Guide code"
                        value={form.guide}
                        mappedValue={form.guideName || '-'}
                        onChange={(value) => setField('guide', value)}
                        onBlur={() => mapMainGuide(form.guide)}
                      />
                    </div>
                    <div className="grid gap-1.5 md:grid-cols-3">
                      <MappedField label="Company code" value={form.companyCode} mappedValue="-" onChange={(value) => setField('companyCode', value)} />
                      <MappedField label="Member code" value={form.memberCode} mappedValue="-" onChange={(value) => setField('memberCode', value)} />
                      <MappedField label="Supervisor / tour leader code" value={form.supervisorCode} mappedValue="-" onChange={(value) => setField('supervisorCode', value)} />
                    </div>
                  </BonusFormSection>

                  <BonusFormSection title="Route / Nation / Shop" columns="grid-cols-1">
                    <div className="grid gap-1.5 md:grid-cols-[2fr_1fr_1fr]">
                      <Field label="Party code" value={form.partyCode} onChange={(value) => setField('partyCode', value)} />
                      <MappedField
                        label="Nation code"
                        value={form.nation}
                        mappedValue={countryNameByCode[String(form.nation || '').toUpperCase()] ?? '-'}
                        onChange={(value) => setField('nation', value.toUpperCase())}
                      />
                      <MappedField label="Province / origin" value={form.province} mappedValue="-" onChange={(value) => setField('province', value)} />
                    </div>
                    <div className="grid gap-1.5 md:grid-cols-3">
                      <Field label="Charter code" value={form.charterCode} onChange={(value) => setField('charterCode', value)} />
                      <Field label="Shop no." value={form.shop} onChange={(value) => setField('shop', value)} />
                      <Field label="Come from" value={form.comeFrom} onChange={(value) => setField('comeFrom', value)} />
                    </div>
                  </BonusFormSection>
                </div>

                <div className="space-y-1.5">
                  <BonusFormSection title="Passenger Counts" columns="grid-cols-2">
                    <Field label="Adult count" value={form.adult} type="number" onChange={(value) => setField('adult', Number(value))} />
                    <Field label="Tour leader count" value={form.tourLeader} type="number" onChange={(value) => setField('tourLeader', Number(value))} />
                    <Field label="Child count" value={form.child} type="number" onChange={(value) => setField('child', Number(value))} />
                    <Field label="Student count" value={form.student} type="number" onChange={(value) => setField('student', Number(value))} />
                    <Field label="Total count" value={totalCount} onChange={() => undefined} readOnly />
                  </BonusFormSection>

                  <BonusFormSection title="Time" columns="grid-cols-2">
                    <Field label="Time in" value={form.tourIn} onChange={(value) => setField('tourIn', value)} />
                    <Field label="Time out" value={form.tourOut} onChange={(value) => setField('tourOut', value)} />
                  </BonusFormSection>

                  <BonusFormSection title="Name List" columns="grid-cols-2">
                    <button type="button" className="toolbar-btn h-8 justify-center" onClick={onOpenNameList}>
                      Pull
                    </button>
                    <button type="button" className="toolbar-btn h-8 justify-center">
                      Remove
                    </button>
                    <Field label="" value={form.partyCode} onChange={() => undefined} placeholder="Party Code" readOnly />
                    <Field label="" value={form.agentCode} onChange={() => undefined} placeholder="Agent Code" readOnly />
                  </BonusFormSection>

                  <BonusFormSection title="Remark" columns="grid-cols-1">
                    <label className="space-y-1">
                      <textarea
                        value={form.comment}
                        onChange={(event) => setField('comment', event.target.value)}
                        className="min-h-16 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-[#1478ff] focus:ring-4 focus:ring-[rgba(20,120,255,0.14)]"
                      />
                    </label>
                  </BonusFormSection>
                </div>
              </div>
            ) : null}

            {activeTab === 'extra' ? (
              <BonusFormSection
                title="ข้อมูลเพิ่มเติม"
                columns="grid-cols-1"
                action={
                  <button type="button" className="toolbar-btn h-9 px-4" onClick={addExtraGuide}>
                    <PlusIcon className="erp-action-icon" /> เพิ่มไกด์
                  </button>
                }
              >
                {form.extraGuides.length === 0 ? (
                  <div className="flex min-h-[84px] items-center justify-center rounded-lg border border-dashed border-slate-200 bg-white px-4 py-6 text-center text-sm font-medium text-slate-400">
                    กดเพิ่มไกด์เพื่อกรอกรหัสไกด์เพิ่มเติม
                  </div>
                ) : (
                  <div className="space-y-2">
                    {form.extraGuides.map((guide, index) => (
                      <div key={`extra-guide-${index}`} className="grid gap-2 rounded-lg border border-slate-200 bg-white p-3 md:grid-cols-[1fr_1fr_1fr_auto]">
                        <Field
                          label={`รหัสไกด์ ${index + 2}`}
                          value={guide.code}
                          onChange={(value) => updateExtraGuide(index, { code: value })}
                          onBlur={() => mapGuide(guide.code, index)}
                        />
                        <Field
                          label="ชื่อไกด์"
                          value={guide.name}
                          onChange={(value) => updateExtraGuide(index, { name: value })}
                          readOnly
                        />
                        <Field
                          label="เบอร์โทร"
                          value={guide.phone}
                          onChange={(value) => updateExtraGuide(index, { phone: value })}
                          readOnly
                        />
                        <div className="flex items-end">
                          <button type="button" className="toolbar-btn-danger h-9 px-3" onClick={() => removeExtraGuide(index)}>
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </BonusFormSection>
            ) : null}

            {activeTab === 'speaker' ? (
              <BonusFormSection
                title="อาจารย์พากย์"
                columns="grid-cols-1"
                action={
                  <button type="button" className="toolbar-btn h-9 px-4" onClick={addSpeaker} disabled={form.narrators.length >= 2}>
                    <PlusIcon className="erp-action-icon" /> เพิ่มอาจารย์พากย์
                  </button>
                }
              >
                <div className="grid gap-2 md:grid-cols-2">
                  <Field label="กลุ่มขาย" value={form.narratorGroup} onChange={(value) => setField('narratorGroup', value)} />
                  <Field label="จำนวนคนเข้า" value={form.narratorPax} type="number" onChange={(value) => setField('narratorPax', Number(value))} />
                </div>
                {form.narrators.length === 0 ? (
                  <div className="mt-3 flex min-h-[84px] items-center justify-center rounded-lg border border-dashed border-slate-200 bg-white px-4 py-6 text-center text-sm font-medium text-slate-400">
                    กดเพิ่มอาจารย์พากย์เพื่อกรอกรหัส
                  </div>
                ) : (
                  <div className="mt-3 space-y-2">
                    {form.narrators.map((narrator, index) => (
                      <div key={`narrator-${index}`} className="grid gap-2 rounded-lg border border-slate-200 bg-white p-3 md:grid-cols-[1fr_1fr_auto]">
                        <Field
                          label={`รหัสอาจารย์พากย์ ${index + 1}`}
                          value={narrator.code}
                          onChange={(value) => updateNarrator(index, { code: value })}
                        />
                        <Field
                          label="ชื่ออาจารย์พากย์"
                          value={narrator.name}
                          onChange={(value) => updateNarrator(index, { name: value })}
                          readOnly
                        />
                        <div className="flex items-end">
                          <button type="button" className="toolbar-btn-danger h-9 px-3" onClick={() => removeSpeaker(index)}>
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </BonusFormSection>
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 justify-end gap-3 border-t border-slate-200 bg-white/95 px-5 py-3 backdrop-blur">
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

function BonusFormSection({
  title,
  children,
  columns = 'grid-cols-4',
  action,
}: {
  title: string;
  children: ReactNode;
  columns?: string;
  action?: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-slate-50/60 p-2">
      <div className="mb-1 flex items-center justify-between gap-3">
        <h3 className="text-xs font-semibold text-slate-800">{title}</h3>
        {action}
      </div>
      <div className={`grid gap-1.5 ${columns}`}>{children}</div>
    </section>
  );
}

function MappedText({ value }: { value: string }) {
  return <div className="min-h-4 truncate text-[11px] font-medium leading-4 text-[#1478ff]">{value}</div>;
}

function MappedField({
  label,
  value,
  mappedValue,
  onChange,
  onBlur,
}: {
  label: string;
  value: string | number;
  mappedValue: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
}) {
  return (
    <div className="space-y-0.5">
      <Field label={label} value={value} onChange={onChange} onBlur={onBlur} />
      <MappedText value={mappedValue} />
    </div>
  );
}

function Field({
  label,
  value,
  type = 'text',
  onChange,
  onBlur,
  wide = false,
  readOnly = false,
  placeholder,
}: {
  label: string;
  value: string | number;
  type?: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  wide?: boolean;
  readOnly?: boolean;
  placeholder?: string;
}) {
  if (type === 'date') {
    return (
      <label className={`space-y-0.5 ${wide ? 'md:col-span-2' : ''}`}>
        <span className="text-xs font-medium text-slate-700">{label}</span>
        <BonusDateInput value={String(value ?? '')} onChange={onChange} compact />
      </label>
    );
  }

  return (
    <label className={`space-y-0.5 ${wide ? 'md:col-span-2' : ''}`}>
      {label ? <span className="text-xs font-medium text-slate-700">{label}</span> : null}
      <input
        type={type}
        value={type === 'number' && value === 0 ? '' : value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        readOnly={readOnly}
        tabIndex={readOnly ? -1 : undefined}
        placeholder={placeholder}
        className={`form-input h-7 rounded-md text-sm ${
          readOnly ? 'cursor-default bg-slate-100 text-slate-400 focus:border-slate-200 focus:ring-0' : ''
        }`}
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
                    key={column.label}
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
                      <td key={column.label} className="px-3 py-2 text-slate-700">
                        {formatCellValue(column.getValue(row))}
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
  const pax = row.adult + row.child + row.tourLeader + row.student;
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
    ['Company code', row.companyCode],
    ['Guide', row.guide],
    ['Guide name', row.guideName],
    ['Member code', row.memberCode],
    ['Supervisor code', row.supervisorCode],
    ['Extra guides', formatGuideList(row.extraGuides)],
    ['Narrators', formatNarratorList(row.narrators)],
  ];
  const travelRows: Array<[string, string | number]> = [
    ['Adult', row.adult],
    ['Child', row.child],
    ['Tour leader', row.tourLeader],
    ['Student', row.student],
    ['Pax total', pax],
    ['Car code', row.carCode],
    ['Shop', row.shop],
    ['Province / origin', row.province],
    ['Charter code', row.charterCode],
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

function formatCellValue(value: string | number) {
  return String(value ?? '');
}

function formatGuideList(guides: BonusGuide[]) {
  return guides.map((guide) => [guide.code, guide.name, guide.phone].filter(Boolean).join(' - ')).join('; ');
}

function formatNarratorList(narrators: BonusNarrator[]) {
  return narrators.map((narrator) => [narrator.code, narrator.name].filter(Boolean).join(' - ')).join('; ');
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

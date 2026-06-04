'use client';

import { FormEvent, ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CalendarIcon, DownloadIcon, EditIcon, ListIcon, PlusIcon, PrintIcon, SaveIcon, SearchIcon, TrashIcon, UploadIcon, XIcon } from '@/components/ui/icons';
import { DataPanel, PageHeader, PageShell } from '@/components/ui/page-shell';
import { useDialog } from '@/components/ui/dialog-provider';
import { ReferenceItem, ReferenceLookupModal, ReferenceLookupType } from '@/components/ui/reference-lookup-modal';
import { apiFetch, apiUpload } from '@/lib/api';
import { queryOptions } from '@/lib/queries';
import { getFallbackReferenceItems } from '@/lib/reference-lookup-fallback';

type BonusGuide = {
  code: string;
  name: string;
  phone: string;
};

type BonusNarrator = {
  code: string;
  name: string;
};

type LectureRegistration = {
  roomCode: string;
  roomName: string;
  speakerCode: string;
  speakerName: string;
  speaker2Code: string;
  speaker2Name: string;
  attendeeCount: number;
};

type GuideLookup = {
  guideCode: string;
  fullName: string;
  fullNameTh: string;
  firstNameEn?: string;
  lastNameEn?: string;
  firstNameTh?: string;
  lastNameTh?: string;
  phone: string;
  imageUrl?: string;
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
  supervisorCode: string;
  tourLeaderName: string;
  tourLeaderPassport: string;
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
  recorder: string;
  recorderName: string;
  recorderTime: string;
  comment: string;
  imageUrl: string;
  nameListCode: string;
  nameListPartyCode: string;
  nameListAgentCode: string;
  extraGuides: BonusGuide[];
  narratorGroup: string;
  narratorPax: number;
  narrators: BonusNarrator[];
  lectureRegistration: LectureRegistration | null;
};

type UploadImageResponse = {
  imageUrl: string;
};

type CurrentUser = {
  username: string;
  name: string;
  roles: string[];
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
  arriveDate: string;
  agentCode: string;
  agentName: string;
  busCode: string;
  pax: number;
  items: NameListItem[];
};

type NameListPullFilters = {
  search: string;
  arriveDate: string;
};

function getTodayLocalDate() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const year = parts.find((part) => part.type === 'year')?.value ?? '';
  const month = parts.find((part) => part.type === 'month')?.value ?? '';
  const day = parts.find((part) => part.type === 'day')?.value ?? '';
  return `${year}-${month}-${day}`;
}

function getCurrentLocalDateTime() {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(new Date());
  const value = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? '';
  return `${value('day')}/${value('month')}/${value('year')} ${value('hour')}:${value('minute')}:${value('second')}`;
}

const today = getTodayLocalDate();
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

function nameListItemFullName(item: NameListItem) {
  return [item.firstName, item.lastName].map((value) => value.trim()).filter(Boolean).join(' ');
}

const invalidLookupCodes = new Set(['', '-', 'NO', 'NONE', 'NULL', 'N/A']);
const countColumns = new Set<keyof BonusCard>(['adult', 'tourLeader', 'child']);
const lookupFieldTypeByField: Partial<Record<keyof BonusCard, ReferenceLookupType>> = {
  busType: 'busType',
  nation: 'nation',
  province: 'province',
  charterCode: 'charterCode',
};

function isValidLookupCode(value: string) {
  return !invalidLookupCodes.has(value.trim().toUpperCase());
}

type VisibleColumnKey = keyof BonusCard | 'expert' | 'room';

function lectureExpertCodes(row: BonusCard) {
  return [row.lectureRegistration?.speakerCode, row.lectureRegistration?.speaker2Code]
    .map((value) => value?.trim())
    .filter(Boolean)
    .join(' / ');
}

function tableCellValue(row: BonusCard, key: VisibleColumnKey) {
  if (key === 'expert') return lectureExpertCodes(row);
  if (key === 'room') return row.lectureRegistration?.roomCode ?? '';
  const value = row[key];
  if (countColumns.has(key)) {
    if (value === null || value === undefined || value === '') return '0';
    return String(Number(value) || 0);
  }
  return String(value ?? '');
}

function fallbackReferenceName(type: ReferenceLookupType, code: string, nationCode = '') {
  const normalizedCode = code.trim().toUpperCase();
  if (!normalizedCode) return '';
  const items = getFallbackReferenceItems(type, { nationCode });
  const exact = items.find((item) => item.code.toUpperCase() === normalizedCode);
  return exact?.name ?? '';
}

function normalizeBonusCardForm(row: BonusCard): BonusCard {
  const bonusCard = { ...(row as BonusCard & {
    memberCode?: string;
    nameListPartyCode?: string;
    nameListAgentCode?: string;
  }) };
  delete bonusCard.memberCode;
  return {
    ...emptyForm,
    ...bonusCard,
    tourLeaderName: bonusCard.tourLeaderName ?? '',
    tourLeaderPassport: bonusCard.tourLeaderPassport ?? '',
    guideName: isValidLookupCode(bonusCard.guide) ? bonusCard.guideName : '',
    recorder: bonusCard.recorder ?? '',
    recorderName: bonusCard.recorderName ?? bonusCard.recorder ?? '',
    recorderTime: bonusCard.recorderTime ?? '',
  };
}

function toBonusCardPayload(form: BonusCard) {
  const payload = normalizeBonusCardForm(form);
  const {
    nameListPartyCode: _nameListPartyCode,
    nameListAgentCode: _nameListAgentCode,
    recorderName: _recorderName,
    lectureRegistration: _lectureRegistration,
    ...persistedPayload
  } = payload;
  return JSON.stringify(persistedPayload);
}

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
  supervisorCode: '',
  tourLeaderName: '',
  tourLeaderPassport: '',
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
  recorder: '',
  recorderName: '',
  recorderTime: '',
  comment: '',
  imageUrl: '',
  nameListCode: '',
  nameListPartyCode: '',
  nameListAgentCode: '',
  extraGuides: [],
  narratorGroup: '',
  narratorPax: 0,
  narrators: [],
  lectureRegistration: null,
};

const visibleColumns: Array<{ key: VisibleColumnKey; label: string; width: string; align?: 'left' | 'right' | 'center' }> = [
  { key: 'bonus', label: 'Bonus', width: '4.8%' },
  { key: 'bonusName', label: 'Bonus Name', width: '8%' },
  { key: 'carCode', label: 'Car no.', width: '5%' },
  { key: 'agentCode', label: 'Agent Code', width: '6%' },
  { key: 'agentName', label: 'Agent Name', width: '8%' },
  { key: 'guide', label: 'Guide', width: '5%' },
  { key: 'guideName', label: 'Guide Name', width: '7.5%' },
  { key: 'expert', label: 'Expert', width: '5.5%' },
  { key: 'room', label: 'Room', width: '4.8%' },
  { key: 'partyCode', label: 'Party Code', width: '7.5%' },
  { key: 'adult', label: 'Adult count', width: '4.8%', align: 'center' },
  { key: 'tourLeader', label: 'Tour leader count', width: '5.8%', align: 'center' },
  { key: 'child', label: 'Child count', width: '4.8%', align: 'center' },
  { key: 'tourIn', label: 'Time in', width: '4.8%', align: 'center' },
  { key: 'tourOut', label: 'Time out', width: '4.8%', align: 'center' },
  { key: 'comment', label: 'Remark', width: '7.2%' },
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
  { label: 'Supervisor Code', getValue: (row) => row.supervisorCode },
  { label: 'Party Code', getValue: (row) => row.partyCode },
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
  const { requestConfirmation } = useDialog();
  const { data: me } = useQuery(queryOptions.me);
  const [rows, setRows] = useState<BonusCard[]>([]);
  const [workDate, setWorkDate] = useState(() => getTodayLocalDate());
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null);
  const [form, setForm] = useState<BonusCard>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportRange, setExportRange] = useState(() => {
    const localToday = getTodayLocalDate();
    return { from: localToday, to: localToday };
  });
  const [exportFileType, setExportFileType] = useState<'xlsx' | 'xls'>('xlsx');
  const [exportRows, setExportRows] = useState<BonusCard[]>([]);
  const [exportLoading, setExportLoading] = useState(false);
  const [printRow, setPrintRow] = useState<BonusCard | null>(null);
  const [nameListRow, setNameListRow] = useState<BonusCard | null>(null);
  const [nameListPullOpen, setNameListPullOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [lookupTarget, setLookupTarget] = useState<{ type: ReferenceLookupType; field: keyof BonusCard } | null>(null);
  const [referenceLabels, setReferenceLabels] = useState<Partial<Record<keyof BonusCard, { code: string; name: string }>>>({});

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
      setForm((current) => {
        if (!current.id) return current;
        const refreshed = data.find((row) => row.id === current.id);
        return refreshed ? normalizeBonusCardForm(refreshed) : current;
      });
      setSelectedIds([]);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load data.');
    } finally {
      setLoading(false);
    }
  };

  const nextBonusForDate = async (targetDate: string) => {
    const data = await apiFetch<BonusCard[]>(`/api/bonus-cards?workDate=${encodeURIComponent(targetDate)}`);
    const used = new Set(data.map((row) => Number(row.bonus)).filter((bonus) => Number.isInteger(bonus) && bonus >= 8001 && bonus <= 8999));
    for (let bonus = 8001; bonus <= 8999; bonus += 1) {
      if (!used.has(bonus)) return String(bonus);
    }
    return '';
  };

  useEffect(() => {
    loadRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workDate]);

  useEffect(() => {
    const refreshBonusCards = () => {
      loadRows().catch(() => undefined);
    };
    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'g-hub:lecture-registration-changed') refreshBonusCards();
    };
    window.addEventListener('g-hub:lecture-registration-changed', refreshBonusCards);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('g-hub:lecture-registration-changed', refreshBonusCards);
      window.removeEventListener('storage', handleStorage);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workDate]);

  useEffect(() => {
    if (!me) {
      setCurrentUser(null);
      setIsAdmin(false);
      return;
    }

    const user = {
      username: me.username ?? '',
      name: me.name ?? '',
      roles: me.roles,
    };
    setCurrentUser(user);
    setIsAdmin(user.roles.includes('admin'));
  }, [me]);

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

  const openCreate = async () => {
    const nextBonus = await nextBonusForDate(workDate);
    setForm({
      ...emptyForm,
      id: '',
      workDate,
      bonus: nextBonus,
      recorder: currentUser?.username ?? '',
      recorderName: currentUser?.name ?? currentUser?.username ?? '',
    });
    setFormError(null);
    setFormMode('create');
  };

  const openEdit = (row: BonusCard) => {
    setForm(normalizeBonusCardForm(row));
    setFormError(null);
    setFormMode('edit');
  };

  const saveForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    const nextForm = {
      ...form,
      recorder: currentUser?.username ?? form.recorder,
      recorderName: currentUser?.name ?? currentUser?.username ?? form.recorderName,
      recorderTime: getCurrentLocalDateTime(),
    };
    setForm(nextForm);
    try {
      let savedRow: BonusCard;
      const body = toBonusCardPayload(nextForm);
      if (formMode === 'edit') {
        savedRow = await apiFetch<BonusCard>(`/api/bonus-cards/${nextForm.id}`, { method: 'PATCH', body });
      } else {
        savedRow = await apiFetch<BonusCard>('/api/bonus-cards', { method: 'POST', body });
      }
      setRows((current) => {
        const normalizedSavedRow = normalizeBonusCardForm(savedRow);
        if (formMode === 'edit') {
          return current.map((row) => (row.id === normalizedSavedRow.id ? normalizedSavedRow : row));
        }
        return normalizedSavedRow.workDate === workDate ? [normalizedSavedRow, ...current] : current;
      });
      setFormMode(null);
      await loadRows();
    } catch (saveError) {
      setFormError(toFriendlyError(saveError));
    }
  };

  const deleteRow = async (row: BonusCard) => {
    if (
      !(await requestConfirmation({
        message: `Delete bonus ${row.bonus}?`,
        variant: 'danger',
      }))
    ) {
      return;
    }
    await apiFetch(`/api/bonus-cards/${row.id}`, { method: 'DELETE' });
    const bookingRefreshDetail = {
      workDate: row.workDate,
      bonusCode: row.bonus,
      deletedAt: Date.now(),
    };
    window.dispatchEvent(new CustomEvent('g-hub:booking-upload-status-changed', { detail: bookingRefreshDetail }));
    window.localStorage.setItem('g-hub:booking-upload-status-changed', JSON.stringify(bookingRefreshDetail));
    await loadRows();
  };

  const selectNameList = (nameList: NameList) => {
    const leader = nameList.items.find((item) => item.isLeader);
    setForm((current) => ({
      ...current,
      nameListCode: nameList.code,
      nameListPartyCode: nameList.partyCode,
      nameListAgentCode: nameList.agentCode,
      tourLeaderName: leader ? nameListItemFullName(leader) : '',
      tourLeaderPassport: leader?.passportNo ?? '',
    }));
    setNameListPullOpen(false);
  };

  const removeNameList = async () => {
    if (!form.nameListCode) return;
    if (!(await requestConfirmation(`Remove linked name list "${form.nameListCode}" from this bonus card?`))) return;
    setForm((current) => ({
      ...current,
      nameListCode: '',
      nameListPartyCode: '',
      nameListAgentCode: '',
    }));
  };

  const selectReferenceItem = (item: ReferenceItem) => {
    if (!lookupTarget) return;
    setForm((current) => ({ ...current, [lookupTarget.field]: item.code }));
    setReferenceLabels((current) => ({ ...current, [lookupTarget.field]: { code: item.code, name: item.name } }));
    setLookupTarget(null);
  };

  const canManageReference = (type: ReferenceLookupType) => type === 'charterCode' || isAdmin;

  const referenceHelper = (field: keyof BonusCard, value: string) => {
    const selectedLabel = referenceLabels[field];
    if (selectedLabel && selectedLabel.code.toUpperCase() === value.trim().toUpperCase()) return selectedLabel.name;
    const type = lookupFieldTypeByField[field];
    if (!type) return '';
    return fallbackReferenceName(type, value, field === 'province' ? form.nation : '');
  };

  const toggleSelected = (id: string) => {
    setSelectedIds((current) => (current[0] === id ? [] : [id]));
  };

  const selectSingleRow = (id: string) => {
    setSelectedIds([id]);
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
            <button
              className="toolbar-btn"
              disabled={
                selectedIds.length !== 1 ||
                !rows.find((row) => row.id === selectedIds[0])?.nameListCode?.trim()
              }
              onClick={() => {
              const selected = rows.find((row) => row.id === selectedIds[0]);
              if (selected?.nameListCode?.trim()) setNameListRow(selected);
            }}>
              <SearchIcon className="erp-action-icon" /> Show Name List
            </button>
            <button
              className="toolbar-btn"
              disabled={selectedIds.length !== 1}
              onClick={() => {
                const selected = rows.find((row) => row.id === selectedIds[0]);
                if (selected) setPrintRow(selected);
              }}
            >
              <PrintIcon className="erp-action-icon" /> Print
            </button>
            <button className="toolbar-btn" onClick={() => setExportOpen(true)}>
              <DownloadIcon className="erp-action-icon" /> Export
            </button>
          </>
        }
      />


        <div className="erp-controls-enter flex flex-nowrap items-end gap-3 max-md:flex-wrap">
          <label className="block w-[170px] space-y-1">
            <span className="text-[10px] font-medium uppercase text-slate-500">Date</span>
            <BonusDateInput value={workDate} onChange={setWorkDate} />
          </label>
          <label className="block min-w-0 flex-1 space-y-1">
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
          <span className="flex h-9 shrink-0 items-center whitespace-nowrap text-sm font-light text-slate-500">{filteredRows.length} Records</span>
        </div>

      {error ? (
        <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      <DataPanel className="erp-content-enter flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-4 py-2">
          <div className="flex items-center gap-3 text-sm text-slate-400">
            Showing {filteredRows.length} items
            {selectedIds.length ? <span>/ selected {selectedIds.length}</span> : null}
          </div>
        </div>

        <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
          <table className="w-full max-w-full table-fixed border-collapse text-xs">
            <colgroup>
              <col style={{ width: '2.2%' }} />
              <col style={{ width: '5%' }} />
              {visibleColumns.map((column) => (
                <col key={column.key} style={{ width: column.width }} />
              ))}
              <col style={{ width: '8%' }} />
            </colgroup>
            <thead className="sticky top-0 z-10 bg-slate-50">
              <tr>
                <th className="border-b border-slate-200 px-1.5 py-2.5 text-left" />
                <th className="border-b border-slate-200 px-1.5 py-2.5 text-center text-[10px] font-semibold uppercase text-slate-400">
                  Image
                </th>
                {visibleColumns.map((column) => (
                  <th
                    key={column.key}
                    style={{ width: column.width }}
                    className={`truncate border-b border-slate-200 px-2 py-2.5 text-[10px] font-semibold uppercase text-slate-400 ${
                      column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left'
                    }`}
                  >
                    {column.label}
                  </th>
                ))}
                <th className="border-b border-slate-200 px-1.5 py-2.5 text-center text-[10px] font-semibold uppercase text-slate-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={visibleColumns.length + 3} className="px-4 py-10 text-center text-slate-400">
                    Loading...
                  </td>
                </tr>
              ) : null}
              {!loading &&
                filteredRows.map((row) => {
                  const selected = selectedIds.includes(row.id);
                  const hasLinkedNameList = Boolean(row.nameListCode?.trim());
                  return (
                    <tr
                      key={row.id}
                      className={`cursor-pointer border-b border-slate-100 transition ${
                        selected ? 'bg-sky-50/90 ring-1 ring-inset ring-sky-100' : 'hover:bg-slate-50'
                      }`}
                      onClick={() => selectSingleRow(row.id)}
                      onDoubleClick={() => selectSingleRow(row.id)}
                    >
                      <td className="px-1.5 py-2">
                        <input
                          type="checkbox"
                          checked={selected}
                          onClick={(event) => event.stopPropagation()}
                          onDoubleClick={(event) => event.stopPropagation()}
                          onChange={() => toggleSelected(row.id)}
                          className="h-4 w-4 accent-[#1478ff]"
                        />
                      </td>
                      <td className="px-1.5 py-2 align-middle">
                        {row.imageUrl ? (
                          <img
                            src={getImageSrc(row.imageUrl)}
                            alt=""
                            className="mx-auto h-10 w-full max-w-12 rounded-md border border-slate-200 bg-white object-cover shadow-sm"
                          />
                        ) : (
                          <div className="mx-auto flex h-10 w-14 flex-col items-center justify-center rounded-md border border-dashed border-slate-200 bg-slate-50 text-slate-300">
                            <ImagePlaceholderIcon className="h-3.5 w-3.5" />
                            <span className="mt-0.5 text-[8px] font-medium leading-none text-slate-400">No Image</span>
                          </div>
                        )}
                      </td>
                      {visibleColumns.map((column) => (
                        <td
                          key={column.key}
                          className={`px-2 py-2 text-slate-700 ${column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : ''}`}
                        >
                          <span className="block truncate">{tableCellValue(row, column.key)}</span>
                        </td>
                      ))}
                      <td className="px-1.5 py-2 text-center align-middle">
                        <div
                          className="flex min-w-0 items-center justify-center gap-1"
                          onClick={(event) => event.stopPropagation()}
                          onDoubleClick={(event) => event.stopPropagation()}
                        >
                          <span className="group relative inline-flex">
                            <button
                              type="button"
                              className={`inline-flex h-8 w-8 items-center justify-center rounded-md border border-transparent bg-transparent opacity-70 transition-all duration-150 ${
                                hasLinkedNameList
                                  ? 'hover:border-sky-100 hover:bg-sky-50 hover:text-[#1478ff] hover:opacity-100'
                                  : 'cursor-not-allowed text-slate-400'
                              }`}
                              onClick={(event) => {
                                event.stopPropagation();
                                if (hasLinkedNameList) setNameListRow(row);
                              }}
                              aria-label="Name List"
                              aria-disabled={!hasLinkedNameList}
                            >
                              <ListIcon className="h-4 w-4" />
                            </button>
                            {!hasLinkedNameList ? (
                              <span className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 hidden w-max -translate-x-1/2 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-slate-600 shadow-lg group-hover:block">
                                ยังไม่ได้ดึง Namelist
                              </span>
                            ) : null}
                          </span>
                          <button
                            type="button"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-transparent bg-transparent opacity-70 transition-all duration-150 hover:border-amber-100 hover:bg-amber-50 hover:text-amber-600 hover:opacity-100"
                            onClick={(event) => {
                              event.stopPropagation();
                              openEdit(row);
                            }}
                            aria-label="Edit"
                            title="Edit"
                          >
                            <EditIcon className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-transparent bg-transparent opacity-70 transition-all duration-150 hover:border-red-100 hover:bg-red-50 hover:text-red-600 hover:opacity-100"
                            onClick={(event) => {
                              event.stopPropagation();
                              deleteRow(row);
                            }}
                            aria-label="Delete"
                            title="Delete"
                          >
                            <TrashIcon className="h-4 w-4" />
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
          currentUser={currentUser}
          onChange={setForm}
          onClose={() => setFormMode(null)}
          onSubmit={saveForm}
          onOpenNameList={() => setNameListPullOpen(true)}
          onRemoveNameList={removeNameList}
          onOpenLookup={(type, field) => setLookupTarget({ type, field })}
          getReferenceHelper={referenceHelper}
        />
      ) : null}

      {lookupTarget ? (
        <ReferenceLookupModal
          type={lookupTarget.type}
          value={String(form[lookupTarget.field] ?? '')}
          canManage={canManageReference(lookupTarget.type)}
          nationCode={form.nation}
          onSelect={selectReferenceItem}
          onClose={() => setLookupTarget(null)}
        />
      ) : null}

      {nameListPullOpen && formMode ? (
        <NameListPullModal
          currentBonusCardId={form.id}
          onClose={() => setNameListPullOpen(false)}
          onSelect={selectNameList}
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
  currentUser,
  onChange,
  onClose,
  onSubmit,
  onOpenNameList,
  onRemoveNameList,
  onOpenLookup,
  getReferenceHelper,
}: {
  form: BonusCard;
  mode: 'create' | 'edit';
  error: string | null;
  currentUser: CurrentUser | null;
  onChange: (value: BonusCard) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onOpenNameList: () => void;
  onRemoveNameList: () => void;
  onOpenLookup: (type: ReferenceLookupType, field: keyof BonusCard) => void;
  getReferenceHelper: (field: keyof BonusCard, value: string) => string;
}) {
  const { notify } = useDialog();
  const [activeTab, setActiveTab] = useState<'details' | 'extra' | 'speaker'>('details');
  const imageInputRef = useRef<HTMLInputElement>(null);
  const mappedGuideImageRef = useRef('');

  const setField = (key: keyof BonusCard, value: string | number) => {
    onChange({ ...form, [key]: value });
  };
  const setWorkDate = async (value: string) => {
    const nextForm = { ...form, workDate: value };
    if (mode !== 'create') {
      onChange(nextForm);
      return;
    }
    try {
      const data = await apiFetch<BonusCard[]>(`/api/bonus-cards?workDate=${encodeURIComponent(value)}`);
      const used = new Set(data.map((row) => Number(row.bonus)).filter((bonus) => Number.isInteger(bonus) && bonus >= 8001 && bonus <= 8999));
      let nextBonus = '';
      for (let bonus = 8001; bonus <= 8999; bonus += 1) {
        if (!used.has(bonus)) {
          nextBonus = String(bonus);
          break;
        }
      }
      onChange({ ...nextForm, bonus: nextBonus });
    } catch {
      onChange(nextForm);
    }
  };
  const totalCount = Number(form.adult || 0) + Number(form.child || 0) + Number(form.tourLeader || 0) + Number(form.student || 0);

  const addExtraGuide = () => {
    if (form.extraGuides.length >= 2) return;
    onChange({ ...form, extraGuides: [...form.extraGuides, { code: '', name: '', phone: '' }] });
  };

  const updateExtraGuide = (index: number, guide: Partial<BonusGuide>) => {
    const nextGuides = form.extraGuides.map((item, itemIndex) => (itemIndex === index ? { ...item, ...guide } : item));
    onChange({ ...form, extraGuides: nextGuides });
  };
  const removeExtraGuide = (index: number) => {
    onChange({ ...form, extraGuides: form.extraGuides.filter((_, itemIndex) => itemIndex !== index) });
  };

  const guideDisplayName = (guide: GuideLookup) => {
    const fullName = guide.fullName?.trim();
    if (fullName) return fullName;
    const englishName = [guide.firstNameEn, guide.lastNameEn].map((value) => value?.trim()).filter(Boolean).join(' ');
    const thaiName = [guide.firstNameTh, guide.lastNameTh].map((value) => value?.trim()).filter(Boolean).join(' ');
    if (englishName && thaiName) return `${englishName} (${thaiName})`;
    return englishName || thaiName || guide.fullNameTh || guide.guideCode;
  };

  const guideBonusName = (guide: GuideLookup | null, fallbackGuideName = '') => {
    const englishName =
      guide?.fullName?.trim()
      || [guide?.firstNameEn, guide?.lastNameEn].map((value) => value?.trim()).filter(Boolean).join(' ')
      || fallbackGuideName.trim();
    const thaiName =
      guide?.fullNameTh?.trim()
      || [guide?.firstNameTh, guide?.lastNameTh].map((value) => value?.trim()).filter(Boolean).join(' ');
    if (englishName && thaiName) return `${englishName}(${thaiName})`;
    return englishName || thaiName;
  };

  const bonusNameFromMapping = (agentName: string, guideName: string) => {
    const agentPart = agentName.trim();
    const guidePart = guideName.trim();
    if (agentPart && guidePart) return `${agentPart} (${guidePart})`;
    if (agentPart) return agentPart;
    return guidePart ? `(${guidePart})` : '';
  };

  const loadGuideBonusName = async (code: string, fallbackGuideName = '') => {
    const normalizedCode = code.trim();
    if (!isValidLookupCode(normalizedCode)) return fallbackGuideName;
    try {
      const result = await apiFetch<{ items: GuideLookup[] }>(
        `/api/members?page=1&search=${encodeURIComponent(normalizedCode)}`,
      );
      const guide = result.items.find((item) => item.guideCode.toLowerCase() === normalizedCode.toLowerCase());
      return guide ? guideBonusName(guide, fallbackGuideName) : fallbackGuideName;
    } catch {
      return fallbackGuideName;
    }
  };

  const editorDisplayName = form.recorderName || (form.recorder === currentUser?.username ? currentUser?.name : '') || form.recorder || '';

  useEffect(() => {
    if (!form.nameListCode || (form.nameListPartyCode && form.nameListAgentCode)) {
      return;
    }
    let cancelled = false;
    const loadLinkedNameList = async () => {
      try {
        const data = await apiFetch<NameList[]>(`/api/name-lists?search=${encodeURIComponent(form.nameListCode)}`);
        const linked = data.find((item) => item.code === form.nameListCode);
        if (!cancelled && linked) {
          onChange({
            ...form,
            nameListPartyCode: linked.partyCode,
            nameListAgentCode: linked.agentCode,
          });
        }
      } catch {
        // Keep the saved relation code; the read-only display can remain empty until lookup succeeds.
      }
    };
    void loadLinkedNameList();
    return () => {
      cancelled = true;
    };
  }, [form, onChange]);

  const mapMainGuide = async (code: string) => {
    const normalizedCode = code.trim();
    if (!isValidLookupCode(normalizedCode)) {
      const shouldClearMappedImage = mappedGuideImageRef.current && form.imageUrl === mappedGuideImageRef.current;
      mappedGuideImageRef.current = '';
      onChange({
        ...form,
        guide: normalizedCode,
        guideName: '',
        bonusName: bonusNameFromMapping(form.agentName, ''),
        imageUrl: shouldClearMappedImage ? '' : form.imageUrl,
      });
      return;
    }
    try {
      const result = await apiFetch<{ items: GuideLookup[] }>(
        `/api/members?page=1&search=${encodeURIComponent(normalizedCode)}`,
      );
      const guide = result.items.find((item) => item.guideCode.toLowerCase() === normalizedCode.toLowerCase());
      const guideImage = guide?.imageUrl || '';
      if (guideImage) {
        mappedGuideImageRef.current = guideImage;
      }
      onChange({
        ...form,
        guide: normalizedCode,
        guideName: guide ? guideDisplayName(guide) : '',
        bonusName: bonusNameFromMapping(form.agentName, guide ? guideBonusName(guide, form.guideName) : ''),
        imageUrl: guideImage || form.imageUrl,
      });
    } catch {
      onChange({ ...form, guide: normalizedCode });
    }
  };

  const mapAgent = async (code: string) => {
    const normalizedCode = code.trim().toUpperCase();
    const guidePart = await loadGuideBonusName(form.guide, form.guideName);
    if (!normalizedCode) {
      onChange({
        ...form,
        agentCode: '',
        agentName: '',
        bonusName: bonusNameFromMapping('', guidePart),
      });
      return;
    }
    try {
      const agents = await apiFetch<Array<{ id: string; agentCode: string; name: string }>>(
        `/api/agents/options?search=${encodeURIComponent(normalizedCode)}`,
      );
      const agent = agents.find((item) => item.agentCode.toUpperCase() === normalizedCode);
      const mappedAgentName = agent ? agent.name || agent.agentCode : '';
      onChange({
        ...form,
        agentCode: normalizedCode,
        agentName: mappedAgentName,
        bonusName: bonusNameFromMapping(mappedAgentName, guidePart),
      });
    } catch {
      onChange({ ...form, agentCode: normalizedCode });
    }
  };

  const mapGuide = async (code: string, index: number) => {
    const normalizedCode = code.trim();
    if (!normalizedCode) return;
    try {
      const result = await apiFetch<{ items: GuideLookup[] }>(
        `/api/members?page=1&search=${encodeURIComponent(normalizedCode)}`,
      );
      const guide = result.items.find((item) => item.guideCode.toLowerCase() === normalizedCode.toLowerCase()) ?? result.items[0];
      if (!guide) return;
      updateExtraGuide(index, {
        code: normalizedCode,
        name: guideDisplayName(guide),
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
      mappedGuideImageRef.current = '';
      setField('imageUrl', result.imageUrl);
    } catch {
      notify('File too large', 'error');
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

        <div className="grid min-h-0 flex-1 gap-2 overflow-hidden p-2.5 lg:grid-cols-[176px_1fr]">
          <aside className="space-y-2">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
              <button
                type="button"
                className="flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-md border border-dashed border-blue-300 bg-slate-50 text-xs text-slate-400 transition hover:border-[#1478ff] hover:text-[#0752d6]"
                onClick={() => imageInputRef.current?.click()}
              >
                {form.imageUrl ? (
                  <img src={getImageSrc(form.imageUrl)} alt="" className="h-full w-full object-contain object-center" />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-300">
                    <ImagePlaceholderIcon className="h-6 w-6" />
                    <span className="mt-1 text-[11px] font-medium text-slate-400">No Image</span>
                    <span className="mt-0.5 text-[10px] text-slate-400">Click to upload</span>
                  </div>
                )}
              </button>
              <label className="toolbar-btn mt-2 w-full cursor-pointer">
                <UploadIcon className="erp-action-icon" /> Upload
                <input ref={imageInputRef} type="file" accept="image/*" onChange={(event) => uploadImage(event.target.files?.[0] ?? null)} className="sr-only" />
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
                    <div className="grid gap-1.5 md:grid-cols-[minmax(140px,1fr)_96px_minmax(120px,0.8fr)_minmax(150px,1fr)]">
                      <Field label="Work date" value={form.workDate} type="date" onChange={setWorkDate} />
                      <Field label="Bonus no." value={form.bonus} onChange={(value) => setField('bonus', value)} />
                      <Field label="Car no." value={form.carCode} onChange={(value) => setField('carCode', value)} />
                      <LookupField
                        label="Car type"
                        value={form.busType}
                        onChange={(value) => setField('busType', value.toUpperCase())}
                        onLookup={() => onOpenLookup('busType', 'busType')}
                        helper={getReferenceHelper('busType', form.busType)}
                        compactHelper
                      />
                    </div>
                    <div className="-mt-5">
                      <Field label="Bonus name" value={form.bonusName} onChange={(value) => setField('bonusName', value)} />
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
                        onEnter={() => mapAgent(form.agentCode)}
                      />
                      <MappedField
                        label="Guide code"
                        value={form.guide}
                        mappedValue={isValidLookupCode(form.guide) ? form.guideName || '-' : '-'}
                        onChange={(value) => setField('guide', value)}
                        onBlur={() => mapMainGuide(form.guide)}
                        onEnter={() => mapMainGuide(form.guide)}
                      />
                    </div>
                    <div className="grid items-start gap-1.5 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.1fr)_minmax(0,1.1fr)]">
                      <Field label="Company code" value={form.companyCode} onChange={(value) => setField('companyCode', value)} />
                      <div className="md:col-span-2">
                        <BonusFormSection title="Tour Leader Name / Tour Leader Passport" columns="grid-cols-2" compact>
                          <Field label="" value={form.tourLeaderName} onChange={(value) => setField('tourLeaderName', value)} compact />
                          <Field label="" value={form.tourLeaderPassport} onChange={(value) => setField('tourLeaderPassport', value)} compact />
                        </BonusFormSection>
                      </div>
                    </div>
                  </BonusFormSection>

                  <BonusFormSection title="Route / Nation / Shop" columns="grid-cols-1">
                    <div className="grid gap-1.5 md:grid-cols-[minmax(0,2fr)_minmax(140px,1fr)_minmax(170px,1fr)]">
                      <Field label="Party code" value={form.partyCode} onChange={(value) => setField('partyCode', value)} />
                      <LookupField
                        label="Nation code"
                        value={form.nation}
                        onChange={(value) => setField('nation', value.toUpperCase())}
                        onLookup={() => onOpenLookup('nation', 'nation')}
                        helper={getReferenceHelper('nation', form.nation) || (countryNameByCode[String(form.nation || '').toUpperCase()] ?? '')}
                      />
                      <LookupField
                        label="Province / origin"
                        value={form.province}
                        onChange={(value) => setField('province', value.toUpperCase())}
                        onLookup={() => onOpenLookup('province', 'province')}
                        helper={getReferenceHelper('province', form.province)}
                      />
                    </div>
                    <div className="grid gap-1.5 md:grid-cols-2">
                      <LookupField
                        label="Charter code"
                        value={form.charterCode}
                        onChange={(value) => setField('charterCode', value.toUpperCase())}
                        onLookup={() => onOpenLookup('charterCode', 'charterCode')}
                        helper={getReferenceHelper('charterCode', form.charterCode)}
                      />
                      <Field label="Shop no." value={form.shop} onChange={(value) => setField('shop', value)} />
                    </div>
                  </BonusFormSection>
                </div>

                <div className="space-y-1.5">
                  <BonusFormSection title="Name List" columns="grid-cols-2">
                    <button type="button" className="toolbar-btn h-8 justify-center" onClick={onOpenNameList} disabled={Boolean(form.nameListCode)}>
                      Pull
                    </button>
                    <button type="button" className="toolbar-btn h-8 justify-center" onClick={onRemoveNameList} disabled={!form.nameListCode}>
                      Remove
                    </button>
                    <Field label="" value={form.nameListPartyCode} onChange={() => undefined} placeholder="Namelist Party Code" readOnly />
                    <Field label="" value={form.nameListAgentCode} onChange={() => undefined} placeholder="Namelist Agent Code" readOnly />
                  </BonusFormSection>

                  <BonusFormSection title="Passenger Counts" columns="grid-cols-[1fr_1.28fr_1fr_1fr]" compact>
                    <Field label="Adult count" value={form.adult} type="number" onChange={(value) => setField('adult', Number(value))} compactNumber />
                    <Field label="Tour leader count" value={form.tourLeader} type="number" onChange={(value) => setField('tourLeader', Number(value))} compactNumber />
                    <Field label="Child count" value={form.child} type="number" onChange={(value) => setField('child', Number(value))} compactNumber />
                    <Field label="Student count" value={form.student} type="number" onChange={(value) => setField('student', Number(value))} compactNumber />
                    <Field label="Total count" value={totalCount} onChange={() => undefined} readOnly compactNumber fullRow />
                  </BonusFormSection>

                  <BonusFormSection title="Time" columns="grid-cols-2">
                    <Field label="Time in" value={form.tourIn} onChange={(value) => setField('tourIn', value)} />
                    <Field label="Time out" value={form.tourOut} onChange={(value) => setField('tourOut', value)} />
                  </BonusFormSection>

                  <BonusFormSection title="Remark" columns="grid-cols-1">
                    <label className="space-y-1">
                      <textarea
                        value={form.comment}
                        onChange={(event) => setField('comment', event.target.value)}
                        className="h-[4.1rem] w-full resize-none rounded-md border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-[#1478ff] focus:ring-4 focus:ring-[rgba(20,120,255,0.14)]"
                      />
                    </label>
                  </BonusFormSection>
                  
                  <BonusFormSection title="Record" columns="grid-cols-2">
                    <Field label="ผู้แก้ไขล่าสุด" value={editorDisplayName || '-'} onChange={() => undefined} readOnly />
                    <Field label="Latest edited datetime" value={form.recorderTime || '-'} onChange={() => undefined} readOnly />
                  </BonusFormSection>


                </div>
              </div>
            ) : null}

            {activeTab === 'extra' ? (
              <BonusFormSection
                title="ข้อมูลเพิ่มเติม"
                columns="grid-cols-1"
                action={
                  <button type="button" className="toolbar-btn h-9 px-4" onClick={addExtraGuide} disabled={form.extraGuides.length >= 2}>
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
                          onEnter={() => mapGuide(guide.code, index)}
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
              >
                {form.lectureRegistration ? (
                  <div className="grid gap-2 md:grid-cols-2">
                    <Field label="รหัสอาจารย์พากย์" value={form.lectureRegistration.speakerCode} onChange={() => undefined} readOnly />
                    <Field label="ชื่ออาจารย์พากย์" value={form.lectureRegistration.speakerName} onChange={() => undefined} readOnly />
                    {form.lectureRegistration.speaker2Code || form.lectureRegistration.speaker2Name ? (
                      <>
                        <Field label="รหัสอาจารย์พากย์ 2" value={form.lectureRegistration.speaker2Code} onChange={() => undefined} readOnly />
                        <Field label="ชื่ออาจารย์พากย์ 2" value={form.lectureRegistration.speaker2Name} onChange={() => undefined} readOnly />
                      </>
                    ) : null}
                    <Field label="รหัสห้อง" value={form.lectureRegistration.roomCode} onChange={() => undefined} readOnly />
                    <Field label="ชื่อห้อง" value={form.lectureRegistration.roomName} onChange={() => undefined} readOnly />
                    <Field label="จำนวนคนเข้าฟังบรรยาย" value={totalCount} onChange={() => undefined} readOnly />
                  </div>
                ) : (
                  <div className="flex min-h-[84px] items-center justify-center rounded-lg border border-dashed border-slate-200 bg-white px-4 py-6 text-center text-sm font-medium text-slate-400">
                    ยังไม่ได้ลงทะเบียนการบรรยาย
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
  compact = false,
}: {
  title: string;
  children: ReactNode;
  columns?: string;
  action?: ReactNode;
  compact?: boolean;
}) {
  return (
    <section className={`rounded-lg border border-slate-200 bg-slate-50/60 ${compact ? 'p-1.5' : 'p-2'}`}>
      <div className={`${compact ? 'mb-0.5' : 'mb-1'} flex items-center justify-between gap-3`}>
        <h3 className={`${compact ? 'text-[11px] font-medium' : 'text-xs font-semibold'} text-slate-800`}>{title}</h3>
        {action}
      </div>
      <div className={`grid ${compact ? 'gap-1' : 'gap-1.5'} ${columns}`}>{children}</div>
    </section>
  );
}

function MappedText({ value, compact = false }: { value: string; compact?: boolean }) {
  return (
    <div className={`ml-2 truncate text-[11px] font-medium leading-[14px] text-[#1478ff] ${compact ? 'min-h-[10px] pt-0' : 'min-h-[22px] pt-2'}`}>
      {value}
    </div>
  );
}

function MappedField({
  label,
  value,
  mappedValue,
  onChange,
  onBlur,
  onEnter,
}: {
  label: string;
  value: string | number;
  mappedValue: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  onEnter?: () => void;
}) {
  return (
    <div className="space-y-0.5">
      <Field label={label} value={value} onChange={onChange} onBlur={onBlur} onEnter={onEnter ?? onBlur} />
      <MappedText value={mappedValue} />
    </div>
  );
}

function LookupField({
  label,
  value,
  onChange,
  onLookup,
  helper,
  compactHelper = false,
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  onLookup: () => void;
  helper?: string;
  compactHelper?: boolean;
}) {
  return (
    <label className="space-y-0.5">
      <span className="text-xs font-medium text-slate-700">{label}</span>
      <div className="form-input flex w-full overflow-hidden rounded-md !p-0 focus-within:border-[#1478ff] focus-within:ring-4 focus-within:ring-[rgba(20,120,255,0.14)]">
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !String(value ?? '').trim()) {
              event.preventDefault();
              onLookup();
            }
          }}
          className="min-w-0 flex-1 border-0 bg-transparent px-3 text-sm text-slate-800 outline-none"
        />
        <button
          type="button"
          className="flex h-full w-10 shrink-0 cursor-pointer items-center justify-center border-l border-slate-100 bg-white text-slate-400 transition hover:bg-blue-50 hover:text-[#1478ff]"
          onClick={onLookup}
          aria-label={`Open ${label} lookup`}
          title="Lookup"
        >
          <SearchIcon className="h-3.5 w-3.5" />
        </button>
      </div>
      <MappedText value={helper || '-'} compact={compactHelper} />
    </label>
  );
}

function Field({
  label,
  value,
  type = 'text',
  onChange,
  onBlur,
  onEnter,
  wide = false,
  fullRow = false,
  readOnly = false,
  placeholder,
  compact = false,
  compactNumber = false,
}: {
  label: string;
  value: string | number;
  type?: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  onEnter?: () => void;
  wide?: boolean;
  fullRow?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  compact?: boolean;
  compactNumber?: boolean;
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
    <label className={`space-y-0.5 ${wide ? 'md:col-span-2' : ''} ${fullRow ? 'col-span-full' : ''}`}>
      {label ? <span className={`${compactNumber ? 'block truncate whitespace-nowrap text-[10px]' : 'text-xs'} font-medium text-slate-700`}>{label}</span> : null}
      <input
        type={type}
        value={type === 'number' && value === 0 ? '' : value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && onEnter) {
            event.preventDefault();
            onEnter();
          }
        }}
        readOnly={readOnly}
        tabIndex={readOnly ? -1 : undefined}
        placeholder={placeholder}
        className={`form-input ${compact ? 'h-5 px-2 text-xs' : 'h-7 text-sm'} ${compactNumber ? 'h-6 px-2 text-center' : ''} rounded-md ${
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
        <CalendarIcon className="h-3.5 w-3.5" />
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

function NameListPullModal({
  currentBonusCardId,
  onClose,
  onSelect,
}: {
  currentBonusCardId: string;
  onClose: () => void;
  onSelect: (row: NameList) => void;
}) {
  const [filters, setFilters] = useState<NameListPullFilters>({
    search: '',
    arriveDate: '',
  });
  const [rows, setRows] = useState<NameList[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const selected = rows.find((row) => row.id === selectedId) ?? null;

  const setFilter = (key: keyof NameListPullFilters, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const searchNameLists = async () => {
    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      const params = new URLSearchParams();
      params.set('excludeLinked', 'true');
      if (currentBonusCardId) params.set('currentBonusCardId', currentBonusCardId);
      if (filters.search.trim()) params.set('search', filters.search.trim());
      if (filters.arriveDate.trim()) params.set('arriveDate', filters.arriveDate.trim());
      const data = await apiFetch<NameList[]>(`/api/name-lists?${params.toString()}`);
      setRows(data);
      setSelectedId(data[0]?.id ?? '');
    } catch (loadError) {
      setRows([]);
      setSelectedId('');
      setError(toFriendlyError(loadError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="modal-pop flex max-h-[86vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-slate-200/80 bg-white/95 shadow-[0_24px_70px_rgba(15,23,42,0.18)] backdrop-blur">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Name List</p>
            <h2 className="mt-1 text-lg font-semibold text-slate-950">Pull Namelist</h2>
          </div>
          <button type="button" className="toolbar-btn" onClick={onClose}>
            <XIcon className="erp-action-icon" /> Close
          </button>
        </div>

        <div className="border-b border-slate-200 bg-slate-50/70 p-4">
          <div className="grid items-end gap-2 md:grid-cols-[1fr_180px_auto]">
            <Field
              label="Search"
              value={filters.search}
              onChange={(value) => setFilter('search', value.toUpperCase())}
              placeholder="Party Code, Agent Code, Passport, Bus Code"
            />
            <Field label="Arrive Date" value={filters.arriveDate} type="date" onChange={(value) => setFilter('arriveDate', value)} />
            <button type="button" className="toolbar-btn-primary h-9 px-4" onClick={searchNameLists}>
              <SearchIcon className="erp-action-icon" /> Search
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-hidden p-4">
          {error ? <div className="mb-3 rounded-md border border-red-100 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</div> : null}
          {!searched ? (
            <div className="py-12 text-center text-sm font-medium text-slate-400">Press Search to preview matching Namelist records.</div>
          ) : loading ? (
            <div className="py-12 text-center text-sm font-medium text-slate-400">Loading...</div>
          ) : rows.length === 0 ? (
            <div className="py-12 text-center text-sm font-medium text-slate-400">No Namelist records found.</div>
          ) : (
            <table className="w-full table-fixed border-collapse text-xs">
              <thead className="sticky top-0 bg-slate-50">
                <tr>
                  <th className="w-8 border-b border-slate-200 px-2 py-2 text-left" />
                  <th className="w-[13%] border-b border-slate-200 px-2 py-2 text-left text-[10px] font-semibold uppercase text-slate-400">Code</th>
                  <th className="w-[16%] border-b border-slate-200 px-2 py-2 text-left text-[10px] font-semibold uppercase text-slate-400">Party Code</th>
                  <th className="w-[12%] border-b border-slate-200 px-2 py-2 text-left text-[10px] font-semibold uppercase text-slate-400">Agent Code</th>
                  <th className="w-[12%] border-b border-slate-200 px-2 py-2 text-left text-[10px] font-semibold uppercase text-slate-400">Arrive Date</th>
                  <th className="w-[10%] border-b border-slate-200 px-2 py-2 text-left text-[10px] font-semibold uppercase text-slate-400">Bus Code</th>
                  <th className="w-[8%] border-b border-slate-200 px-2 py-2 text-right text-[10px] font-semibold uppercase text-slate-400">Pax</th>
                  <th className="border-b border-slate-200 px-2 py-2 text-left text-[10px] font-semibold uppercase text-slate-400">Passport Preview</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const selectedRow = row.id === selectedId;
                  return (
                    <tr
                      key={row.id}
                      className={`cursor-pointer border-b border-slate-100 transition-colors duration-150 ${selectedRow ? 'bg-sky-50/90 ring-1 ring-inset ring-sky-100' : 'hover:bg-slate-50'}`}
                      onClick={() => setSelectedId(row.id)}
                      onDoubleClick={() => onSelect(row)}
                    >
                      <td className="px-2 py-2">
                        <input
                          type="radio"
                          checked={selectedRow}
                          onClick={(event) => event.stopPropagation()}
                          onChange={() => setSelectedId(row.id)}
                          className="h-4 w-4 accent-[#1478ff]"
                        />
                      </td>
                      <td className="truncate px-2 py-2 font-semibold text-slate-900">{row.code || '-'}</td>
                      <td className="truncate px-2 py-2 text-slate-700">{row.partyCode || '-'}</td>
                      <td className="truncate px-2 py-2 text-slate-700">{row.agentCode || '-'}</td>
                      <td className="truncate px-2 py-2 text-slate-700">{formatDate(row.arriveDate)}</td>
                      <td className="truncate px-2 py-2 text-slate-700">{row.busCode || '-'}</td>
                      <td className="px-2 py-2 text-right text-slate-700">{row.pax || row.items.length}</td>
                      <td className="truncate px-2 py-2 text-slate-500">
                        {row.items.slice(0, 3).map((item) => item.passportNo).filter(Boolean).join(', ') || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="flex shrink-0 justify-end gap-2 border-t border-slate-200 bg-white/95 px-5 py-3">
          <button type="button" className="toolbar-btn" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="toolbar-btn-primary" disabled={!selected} onClick={() => selected && onSelect(selected)}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

function NameListModal({ row, onClose }: { row: BonusCard; onClose: () => void }) {
  const [nameLists, setNameLists] = useState<NameList[]>([]);
  const [loading, setLoading] = useState(true);
  const selected = nameLists.find((item) => item.code === row.nameListCode);

  useEffect(() => {
    const loadNameLists = async () => {
      setLoading(true);
      if (!row.nameListCode?.trim()) {
        setNameLists([]);
        setLoading(false);
        return;
      }
      try {
        const data = await apiFetch<NameList[]>(`/api/name-lists?search=${encodeURIComponent(row.nameListCode)}`);
        setNameLists(data);
      } catch {
        setNameLists([]);
      } finally {
        setLoading(false);
      }
    };
    void loadNameLists();
  }, [row.nameListCode]);

  return (
    <div className="modal-backdrop fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="modal-pop flex max-h-[86vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-slate-200/80 bg-white/95 shadow-[0_24px_70px_rgba(15,23,42,0.18)] backdrop-blur">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Name List</h2>
            <p className="text-xs text-slate-500">{row.nameListCode || row.partyCode || 'No party code'}</p>
          </div>
          <button type="button" className="toolbar-btn" onClick={onClose}>
            <XIcon className="erp-action-icon" /> Close
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-auto p-4">
          {loading ? (
            <div className="erp-content-enter py-12 text-center text-sm text-slate-400">Loading name list...</div>
          ) : selected ? (
            <div className="flex h-full min-h-0 flex-col">
              <div className="erp-controls-enter mb-3 grid gap-2 md:grid-cols-4">
                <DetailLine label="Code" value={selected.code} />
                <DetailLine label="Party Code" value={selected.partyCode} />
                <DetailLine label="Agent" value={`${selected.agentCode} ${selected.agentName}`} />
                <DetailLine label="Passengers" value={String(selected.items.length || selected.pax)} />
              </div>
              <div className="erp-content-enter min-h-0 flex-1 overflow-auto rounded-lg border border-slate-100">
              <table className="w-full table-fixed border-collapse text-xs">
                <thead className="sticky top-0 z-20 bg-white shadow-[0_1px_0_rgba(226,232,240,1)]">
                  <tr>
                    {['No.', 'Leader', 'Passport', 'First Name', 'Last Name', 'Birth Date', 'Age', 'Gender', 'Nation'].map((label) => (
                      <th key={label} className="bg-white px-2 py-2 text-left text-[10px] font-semibold uppercase text-slate-400">
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
              </div>
            </div>
          ) : (
            <div className="erp-content-enter py-12 text-center text-sm text-slate-400">No name list found for this bonus card.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function PrintModal({ row, onClose }: { row: BonusCard; onClose: () => void }) {
  const pax = row.adult + row.child + row.tourLeader + row.student;
  const receiptRows = bonusReceiptRows(row, pax);
  useEffect(() => {
    document.body.classList.add('detail-print');
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.classList.remove('detail-print');
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [onClose]);

  return (
    <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="max-h-[92vh] w-full max-w-[420px] overflow-auto rounded-[10px] border border-slate-200/80 bg-white/95 shadow-[0_24px_70px_rgba(15,23,42,0.18)] backdrop-blur">
        <div className="no-print flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-[24px] font-semibold leading-tight text-slate-950">Print Bonus</h2>
            <p className="mt-1 text-sm text-slate-500">Thermal receipt 80 mm preview.</p>
          </div>
          <div className="flex gap-2">
            <button className="toolbar-btn-primary" onClick={() => printBonusReceipt(row)}>
              <PrintIcon className="erp-action-icon" /> Print
            </button>
            <button className="toolbar-btn" onClick={onClose}>Close</button>
          </div>
        </div>
        <div className="flex justify-center bg-slate-100 p-5">
          <div className="print-area bonus-thermal-receipt bg-white px-[5mm] py-[7mm] text-[#222] shadow-sm">
            {receiptRows.map(([label, value, side]) => (
              <div key={label} className="receipt-line">
                <span className="receipt-label">{label}</span>
                <span className="receipt-value">{value || '-'}</span>
                <span className="receipt-side">{side || ''}</span>
              </div>
            ))}
            <div className="mt-4 text-[10px]">_</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function bonusReceiptRows(row: BonusCard, pax = row.adult + row.child + row.tourLeader + row.student): Array<[string, string | number, string | number | undefined]> {
  const nationLabel = [row.nation, countryNameByCode[row.nation?.trim().toUpperCase()]].filter(Boolean).join(' : ');
  const lecturerText = [row.lectureRegistration?.speakerCode, row.lectureRegistration?.speaker2Code]
    .map((value) => value?.trim())
    .filter(Boolean)
    .join(' / ');
  return [
    ['กรุ๊ป', row.bonus, `วันที่ ${formatDate(row.workDate)}`],
    ['ทัวร์', row.agentName || row.bonusName || '-', ''],
    ['ไกด์', row.guideName || row.guide || '-', ''],
    ['จำนวนแขก', `${pax}+1`, `ทะเบียน ${row.carCode || row.charterCode || '-'}`],
    ['สัญชาติ', nationLabel || '-', ''],
    ['ตอนรับ', row.tourIn || '-', row.shop || row.charterCode || ''],
    ['PartyCode', row.partyCode || '-', ''],
    ...(lecturerText ? [['อาจารย์', lecturerText, ''] as [string, string, string]] : []),
    ...(row.lectureRegistration?.roomCode ? [['ห้องพากย์', row.lectureRegistration.roomCode, ''] as [string, string, string]] : []),
    ['กลุ่มขาย', row.narratorGroup || '-', ''],
    ['คนพากย์', row.narratorPax || '-', ''],
    ['Remark', row.comment || '-', ''],
  ];
}

function printBonusReceipt(row: BonusCard) {
  const receiptRows = bonusReceiptRows(row);
  const lines = receiptRows.map(([label, value, side]) => `
    <div class="receipt-line">
      <span class="receipt-label">${escapeHtml(label)}</span>
      <span class="receipt-value">${escapeHtml(value || '-')}</span>
      <span class="receipt-side">${escapeHtml(side || '')}</span>
    </div>
  `).join('');
  const frame = document.createElement('iframe');
  frame.style.position = 'fixed';
  frame.style.right = '0';
  frame.style.bottom = '0';
  frame.style.width = '0';
  frame.style.height = '0';
  frame.style.border = '0';
  document.body.appendChild(frame);
  const doc = frame.contentDocument;
  if (!doc) return;
  doc.open();
  doc.write(`<!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Bonus ${escapeHtml(row.bonus)}</title>
        <style>
          @page { size: 80mm auto; margin: 0; }
          * { box-sizing: border-box; }
          html, body {
            width: 80mm;
            margin: 0;
            padding: 0;
            background: #fff;
          }
          body {
            color: #222;
            font-family: "Courier New", monospace;
            font-size: 11px;
            line-height: 1.38;
          }
          .receipt {
            width: 80mm;
            min-height: 112mm;
            padding: 7mm 5mm;
          }
          .receipt-line {
            display: grid;
            grid-template-columns: 16mm 1fr 25mm;
            column-gap: 2mm;
            min-height: 5.4mm;
            align-items: start;
            page-break-inside: avoid;
          }
          .receipt-label {
            color: #555;
            font-size: 10px;
          }
          .receipt-value {
            color: #333;
            font-size: 13px;
            font-weight: 700;
            overflow-wrap: anywhere;
            white-space: pre-wrap;
          }
          .receipt-side {
            color: #333;
            font-size: 12px;
            font-weight: 700;
            overflow-wrap: anywhere;
            text-align: left;
            white-space: pre-wrap;
          }
          .tail {
            margin-top: 4mm;
            font-size: 10px;
          }
        </style>
      </head>
      <body>
        <main class="receipt">${lines}<div class="tail">_</div></main>
      </body>
    </html>`);
  doc.close();
  frame.onload = () => {
    frame.contentWindow?.focus();
    frame.contentWindow?.print();
    window.setTimeout(() => frame.remove(), 500);
  };
}

function formatCellValue(value: string | number) {
  return String(value ?? '');
}

function DetailLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-100 bg-white px-3 py-2">
      <p className="text-xs font-semibold uppercase text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-800">{value || '-'}</p>
    </div>
  );
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

function ImagePlaceholderIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={`${className} fill-none stroke-current`}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <circle cx="9" cy="10" r="1.5" />
      <path d="m7 17 4-4 3 3 2-2 2 3" />
    </svg>
  );
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

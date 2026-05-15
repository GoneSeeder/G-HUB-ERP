'use client';

import { FormEvent, KeyboardEvent, useEffect, useMemo, useState } from 'react';
import { apiFetch } from '@/lib/api';

const THAI_ID_BRIDGE_URL = 'http://127.0.0.1:32123';

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

const columns = [
  'รหัสไกด์',
  'Name',
  'Phone',
  'เลขบัตรประชาชน',
  'เลข Passport',
  'รหัสมัคคุเทศน์',
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

export default function MemberPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingMember, setEditingMember] = useState<MemberItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
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

  const loadMembers = () => {
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
      });
  };

  const selectedMember = members.find((member) => member.id === selectedId) ?? null;

  const openCreate = async () => {
    setEditingMember(null);
    const nextForm = createEmptyForm(currentUserName);
    try {
      const next = await apiFetch<NextGuideCodeResponse>('/api/members/next-guide-code');
      nextForm.guideCode = next.guideCode;
    } catch {
      nextForm.guideCode = generateGuideCode(1);
    }
    setForm(nextForm);
    setModalError(null);
    setModalOpen(true);
  };

  const openEdit = () => {
    if (!selectedMember) {
      setError('Please select a member to edit.');
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
    const confirmed = window.confirm(`Delete member "${selectedMember.guideCode}"?`);
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

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload = normalizeMemberPayload(form);
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
    <section className="space-y-4">
      <div className="rounded-[10px] border border-slate-200/80 bg-white/95 px-5 py-4 shadow-[0_18px_48px_rgba(15,23,42,0.08)] backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-slate-950">ข้อมูลสมาชิก</h1>
            <p className="text-sm text-slate-500">Guide information and member profile management.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="toolbar-btn-primary" onClick={openCreate}>
              เพิ่ม
            </button>
            <button type="button" className="toolbar-btn" onClick={openEdit}>
              แก้ไข
            </button>
            <button type="button" className="toolbar-btn-danger" onClick={onDeleteSelected}>
              ลบสมาชิก
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-[1fr_150px]">
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search guide code, name, phone, passport..."
            className="form-input rounded-md"
          />
          <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-right">
            <p className="text-xs text-slate-500">Records</p>
            <p className="text-xl font-semibold text-blue-800">{total}</p>
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-md border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-[10px] border border-slate-200 bg-white shadow-[0_18px_48px_rgba(15,23,42,0.06)]">
        <div className="border-b border-slate-200 px-4 py-3 text-sm text-slate-400">
          Showing {members.length} of {total} items
        </div>
        <div className="max-h-[65vh] overflow-auto">
          <table className="w-full min-w-[1000px] border-collapse text-sm">
            <thead className="bg-white">
              <tr>
                <th className="w-12 border-b border-slate-200 px-4 py-3 text-left" />
                {columns.map((column) => (
                  <th
                    key={column}
                    className="border-b border-slate-200 px-3 py-3 text-left text-xs font-semibold uppercase text-slate-400"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {members.length > 0 ? (
                members.map((member) => {
                  const checked = selectedId === member.id;

                  return (
                    <tr
                      key={member.id}
                      onClick={() => setSelectedId(member.id)}
                      className={`cursor-pointer transition hover:bg-blue-50 ${
                        checked ? 'bg-blue-50' : ''
                      }`}
                    >
                      <td className="border-b border-slate-100 px-4 py-3">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => setSelectedId(checked ? null : member.id)}
                          onClick={(event) => event.stopPropagation()}
                          className="h-4 w-4 accent-blue-700"
                        />
                      </td>
                      <td className="border-b border-slate-100 px-3 py-3 font-semibold text-slate-900">
                        {member.guideCode}
                      </td>
                      <td className="border-b border-slate-100 px-3 py-3 text-slate-700">
                        {formatMemberDisplayName(member)}
                      </td>
                      <td className="border-b border-slate-100 px-3 py-3 text-slate-700">
                        {member.phone || '-'}
                      </td>
                      <td className="border-b border-slate-100 px-3 py-3 text-slate-700">
                        {member.nationalId || '-'}
                      </td>
                      <td className="border-b border-slate-100 px-3 py-3 text-slate-700">
                        {member.passportNo || '-'}
                      </td>
                      <td className="border-b border-slate-100 px-3 py-3 text-slate-700">
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
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-200 px-4 py-3">
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
      </div>

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
        />
      ) : null}
    </section>
  );
}

function MemberModal({
  title,
  form,
  onChange,
  onClose,
  onSubmit,
  saveError,
}: {
  title: string;
  form: MemberForm;
  onChange: (value: MemberForm) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  saveError: string | null;
}) {
  const [lookupStatus, setLookupStatus] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const fullNameTh = useMemo(
    () => [form.titleTh, form.firstNameTh, form.lastNameTh].filter(Boolean).join(' '),
    [form.titleTh, form.firstNameTh, form.lastNameTh],
  );
  const fullName = useMemo(
    () => [form.titleEn, form.firstNameEn, form.lastNameEn].filter(Boolean).join(' '),
    [form.titleEn, form.firstNameEn, form.lastNameEn],
  );

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
    await onSubmit(event);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <form
        onSubmit={handleSubmit}
        className="max-h-[92vh] w-full max-w-6xl overflow-auto rounded-[10px] border border-slate-200/80 bg-white/95 shadow-[0_24px_70px_rgba(15,23,42,0.18)] backdrop-blur"
      >
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
              className="min-h-10 rounded-md border border-emerald-500 bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_22px_rgba(5,150,105,0.24)] transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-100"
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
                {form.imageUrl ? (
                  <img src={form.imageUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span>No image data</span>
                )}
              </div>
              <p className="mt-3 text-xs leading-5 text-slate-500">
                รูปจะถูกดึงจากเครื่องอ่านบัตรประชาชน หรือ upload เพิ่มภายหลัง
              </p>
              <button type="button" className="toolbar-btn mt-3 w-full">
                Browse
              </button>
            </div>

            <div className="rounded-[8px] border border-blue-100 bg-blue-50/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Guide Code</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">{form.guideCode}</p>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                Format: GE + ปีปัจจุบัน 2 หลัก + running 0001-9999
              </p>
            </div>
          </aside>

          <div className="space-y-4">
            {lookupStatus ? (
              <div className="rounded-md border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-800">
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
                required
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
              <Field label="คำนำหน้า (ภาษาไทย)" value={form.titleTh} onChange={(value) => setField('titleTh', value)} required />
              <Field label="ชื่อ (ภาษาไทย)" value={form.firstNameTh} onChange={(value) => setField('firstNameTh', value)} required />
              <Field label="นามสกุล (ภาษาไทย)" value={form.lastNameTh} onChange={(value) => setField('lastNameTh', value)} required />
              <Field label="คำนำหน้า (ภาษาอังกฤษ)" value={form.titleEn} onChange={(value) => setField('titleEn', value)} required />
              <Field label="ชื่อ (ภาษาอังกฤษ)" value={form.firstNameEn} onChange={(value) => setField('firstNameEn', value)} required />
              <Field label="นามสกุล (ภาษาอังกฤษ)" value={form.lastNameEn} onChange={(value) => setField('lastNameEn', value)} required />
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

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
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
  options: string[];
  required?: boolean;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-semibold text-slate-700">
        {label}
        {required ? <span className="ml-1 text-red-500">*</span> : null}
      </span>
      <select
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="form-input rounded-md"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
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
  const [editing, setEditing] = useState(Boolean(value));

  if (!value && !editing) {
    return (
      <label className="space-y-2">
        <span className="text-sm font-semibold text-slate-700">{label}</span>
        <input
          type="text"
          readOnly
          value="--/--/----"
          onFocus={() => setEditing(true)}
          className="form-input rounded-md text-slate-400"
        />
      </label>
    );
  }

  return (
    <label className="space-y-2">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <input
        type="date"
        value={value}
        onBlur={() => {
          if (!value) {
            setEditing(false);
          }
        }}
        onChange={(event) => onChange(event.target.value)}
        className="form-input rounded-md"
      />
    </label>
  );
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
        className="min-h-20 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
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

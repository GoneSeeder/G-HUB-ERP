'use client';

// 3.4 รายได้ / รายหัก / ข้อมูลบัญชี (Payroll).
// Phase 4: income + deduction tabs fully functional.
// Phase 5: accounting tab — inline GL mapping table.

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { XIcon } from '@/components/ui/icons';
import { HrCustomSelect } from './hr-ui';
import { publicApiFetch } from '@/lib/api';
import { PAYROLL_COMPANY_OPTIONS, PAYROLL_ALL_COMPANIES } from '@/data/humansource/payroll-common';
import {
  ACCOUNT_CATEGORY_SEED,
  type AccountCategory,
} from '@/data/humansource/payroll-accounting';
import {
  INCOME_ITEM_SEED,
  DEDUCTION_ITEM_SEED,
  REVENUE_CATEGORY_OPTIONS,
  PAY_ITEM_ROUNDING_OPTIONS,
  PAYOUT_SCOPE_OPTIONS,
  TAX_CALC_METHOD_OPTIONS,
  type IncomeItem,
  type DeductionItem,
  type RevenueCategory,
  type PayItemRounding,
  type PayoutScope,
  type TaxCalcMethod,
} from '@/data/humansource/payroll-pay-items';

// ── tab type ───────────────────────────────────────────────────────────────────

export type PayItemsTab = 'income' | 'deduction' | 'accounting';

// ── filter options ─────────────────────────────────────────────────────────────

const STATUS_FILTER_OPTS = [
  { value: 'enabled',  label: 'เปิดใช้งาน' },
  { value: 'disabled', label: 'ปิดใช้งาน' },
];

const COMPANY_FILTER_OPTS = PAYROLL_COMPANY_OPTIONS
  .filter((c) => c !== PAYROLL_ALL_COMPANIES)
  .map((c) => ({ value: c, label: c }));

const KIND_FILTER_OPTS = [
  { value: 'income',    label: 'รายได้' },
  { value: 'deduction', label: 'รายหัก' },
];

// ── income form blank ──────────────────────────────────────────────────────────

function blankIncome(): Omit<IncomeItem, 'id'> {
  return {
    code: '',
    nameTh: '',
    nameEn: '',
    revenueCategory: '40(1)',
    rounding: 'none',
    taxCalcMethod: 'annual',
    payOnce: false,
    payoutScope: 'every-period',
    calcByActualWorkdays: false,
    taxable: false,
    linkSSO: false,
    linkProvidentFund: false,
    linkOvertime: false,
    linkLateAbsent: false,
    offCycle: false,
    carryPrevPeriod: false,
    isWelfare: false,
    enabled: true,
    isSystem: false,
  };
}

function blankDeduction(): Omit<DeductionItem, 'id'> {
  return {
    code: '',
    nameTh: '',
    nameEn: '',
    rounding: 'none',
    payoutScope: 'every-period',
    taxable: false,
    linkSSO: false,
    linkProvidentFund: false,
    offCycle: false,
    carryPrevPeriod: false,
    enabled: true,
    isSystem: false,
  };
}

// ── main component ─────────────────────────────────────────────────────────────

export function PayrollPayItems({ accent, tab }: { accent: string; tab: PayItemsTab }) {
  const [incomeItems,  setIncomeItems]  = useState<IncomeItem[]>([]);
  const [deductItems,  setDeductItems]  = useState<DeductionItem[]>([]);
  const [activeTab,    setActiveTab]    = useState<PayItemsTab>(tab);
  const [filterStatus,  setFilterStatus]  = useState('');
  const [filterCompany, setFilterCompany] = useState('');
  const [search,       setSearch]       = useState('');
  const [drawerOpen,   setDrawerOpen]   = useState(false);
  const [editingIncome,  setEditingIncome]  = useState<IncomeItem | null>(null);
  const [editingDeduct,  setEditingDeduct]  = useState<DeductionItem | null>(null);
  const [incomeForm,  setIncomeForm]  = useState<Omit<IncomeItem, 'id'>>(blankIncome());
  const [deductForm,  setDeductForm]  = useState<Omit<DeductionItem, 'id'>>(blankDeduction());
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<'income' | 'deduction'>('income');
  const [filterKind,         setFilterKind]         = useState('');
  const [acctCatModal,       setAcctCatModal]       = useState(false);
  const [accountCategories,  setAccountCategories]  = useState<AccountCategory[]>([]);
  const [acctDrawer,         setAcctDrawer]         = useState<{ item: IncomeItem | DeductionItem; kind: 'income' | 'deduction' } | null>(null);

  const isMounted = useRef(true);
  useEffect(() => { isMounted.current = true; return () => { isMounted.current = false; }; }, []);

  // sync activeTab when prop changes (navigation)
  useEffect(() => { setActiveTab(tab); }, [tab]);

  // load from API
  useEffect(() => {
    Promise.all([
      publicApiFetch<IncomeItem[]>('/api/humansource/payroll/pay-items?kind=income'),
      publicApiFetch<DeductionItem[]>('/api/humansource/payroll/pay-items?kind=deduction'),
      publicApiFetch<AccountCategory[]>('/api/humansource/payroll/account-categories'),
    ]).then(([income, deduct, cats]) => {
      if (!isMounted.current) return;
      setIncomeItems(income.length ? income : INCOME_ITEM_SEED);
      setDeductItems(deduct.length ? deduct : DEDUCTION_ITEM_SEED);
      setAccountCategories(cats.length ? cats : ACCOUNT_CATEGORY_SEED);
    }).catch(() => {
      if (!isMounted.current) return;
      setIncomeItems(INCOME_ITEM_SEED);
      setDeductItems(DEDUCTION_ITEM_SEED);
      setAccountCategories(ACCOUNT_CATEGORY_SEED);
    });
  }, []);

  // ── drawer close on outside click ────────────────────────────────────────────
  const drawerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!drawerOpen) return;
    const handler = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        setDrawerOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [drawerOpen]);

  // ── open drawer helpers ────────────────────────────────────────────────────
  function openNewIncome() {
    setEditingIncome(null);
    setIncomeForm(blankIncome());
    setActiveTab('income');
    setDrawerOpen(true);
  }
  function openEditIncome(item: IncomeItem) {
    setEditingIncome(item);
    const { id: _id, ...rest } = item;
    setIncomeForm(rest);
    setDrawerOpen(true);
  }
  function openNewDeduction() {
    setEditingDeduct(null);
    setDeductForm(blankDeduction());
    setActiveTab('deduction');
    setDrawerOpen(true);
  }
  function openEditDeduction(item: DeductionItem) {
    setEditingDeduct(item);
    const { id: _id, ...rest } = item;
    setDeductForm(rest);
    setDrawerOpen(true);
  }

  // ── save ──────────────────────────────────────────────────────────────────────
  async function handleSave() {
    if (activeTab === 'income') {
      if (editingIncome) {
        const updated = await publicApiFetch<IncomeItem>(`/api/humansource/payroll/pay-items/${editingIncome.id}`, { method: 'PATCH', body: JSON.stringify(incomeForm) });
        setIncomeItems((prev) => prev.map((i) => i.id === editingIncome.id ? updated : i));
      } else {
        const created = await publicApiFetch<IncomeItem>('/api/humansource/payroll/pay-items', { method: 'POST', body: JSON.stringify({ ...incomeForm, kind: 'income' }) });
        setIncomeItems((prev) => [...prev, created]);
      }
    } else if (activeTab === 'deduction') {
      if (editingDeduct) {
        const updated = await publicApiFetch<DeductionItem>(`/api/humansource/payroll/pay-items/${editingDeduct.id}`, { method: 'PATCH', body: JSON.stringify(deductForm) });
        setDeductItems((prev) => prev.map((d) => d.id === editingDeduct.id ? updated : d));
      } else {
        const created = await publicApiFetch<DeductionItem>('/api/humansource/payroll/pay-items', { method: 'POST', body: JSON.stringify({ ...deductForm, kind: 'deduction' }) });
        setDeductItems((prev) => [...prev, created]);
      }
    }
    setDrawerOpen(false);
  }

  // ── toggle enabled ────────────────────────────────────────────────────────────
  async function toggleIncome(id: string, enabled: boolean) {
    setIncomeItems((prev) => prev.map((i) => i.id === id ? { ...i, enabled } : i));
    await publicApiFetch(`/api/humansource/payroll/pay-items/${id}`, { method: 'PATCH', body: JSON.stringify({ enabled }) });
  }
  async function toggleDeduct(id: string, enabled: boolean) {
    setDeductItems((prev) => prev.map((d) => d.id === id ? { ...d, enabled } : d));
    await publicApiFetch(`/api/humansource/payroll/pay-items/${id}`, { method: 'PATCH', body: JSON.stringify({ enabled }) });
  }

  // ── delete ────────────────────────────────────────────────────────────────────
  async function handleDelete() {
    if (!confirmDeleteId) return;
    await publicApiFetch(`/api/humansource/payroll/pay-items/${confirmDeleteId}`, { method: 'DELETE' });
    if (deleteTarget === 'income') {
      setIncomeItems((prev) => prev.filter((i) => i.id !== confirmDeleteId));
    } else {
      setDeductItems((prev) => prev.filter((d) => d.id !== confirmDeleteId));
    }
    setConfirmDeleteId(null);
  }

  // ── account category CRUD ─────────────────────────────────────────────────────
  async function addAcctCat(nameTh: string) {
    const created = await publicApiFetch<AccountCategory>('/api/humansource/payroll/account-categories', { method: 'POST', body: JSON.stringify({ nameTh, enabled: true }) });
    setAccountCategories((prev) => [...prev, created]);
  }

  async function renameAcctCat(id: string, nameTh: string) {
    const updated = await publicApiFetch<AccountCategory>(`/api/humansource/payroll/account-categories/${id}`, { method: 'PATCH', body: JSON.stringify({ nameTh }) });
    setAccountCategories((prev) => prev.map((c) => c.id === id ? updated : c));
  }

  async function toggleAcctCat(id: string) {
    const cat = accountCategories.find((c) => c.id === id);
    if (!cat) return;
    const updated = await publicApiFetch<AccountCategory>(`/api/humansource/payroll/account-categories/${id}`, { method: 'PATCH', body: JSON.stringify({ enabled: !cat.enabled }) });
    setAccountCategories((prev) => prev.map((c) => c.id === id ? updated : c));
  }

  async function deleteAcctCat(id: string) {
    await publicApiFetch(`/api/humansource/payroll/account-categories/${id}`, { method: 'DELETE' });
    setAccountCategories((prev) => prev.filter((c) => c.id !== id));
    setIncomeItems((prev) => prev.map((i) => {
      if (!i.accountMapping || !(id in i.accountMapping)) return i;
      return { ...i, accountMapping: Object.fromEntries(Object.entries(i.accountMapping).filter(([k]) => k !== id)) };
    }));
    setDeductItems((prev) => prev.map((d) => {
      if (!d.accountMapping || !(id in d.accountMapping)) return d;
      return { ...d, accountMapping: Object.fromEntries(Object.entries(d.accountMapping).filter(([k]) => k !== id)) };
    }));
  }

  async function updateAcctMapping(id: string, kind: 'income' | 'deduction', mapping: Record<string, string>) {
    await publicApiFetch(`/api/humansource/payroll/pay-items/${id}`, { method: 'PATCH', body: JSON.stringify({ accountMapping: mapping }) });
    if (kind === 'income') {
      setIncomeItems((prev) => prev.map((i) => i.id === id ? { ...i, accountMapping: mapping } : i));
    } else {
      setDeductItems((prev) => prev.map((d) => d.id === id ? { ...d, accountMapping: mapping } : d));
    }
  }

  // ── filtered lists ────────────────────────────────────────────────────────────
  const filteredIncome = incomeItems.filter((i) => {
    if (filterStatus === 'enabled'  && !i.enabled)  return false;
    if (filterStatus === 'disabled' &&  i.enabled)  return false;
    if (search) {
      const q = search.toLowerCase();
      if (!i.code.toLowerCase().includes(q) && !i.nameTh.includes(q) && !i.nameEn.toLowerCase().includes(q)) return false;
    }
    return true;
  });
  const filteredDeduct = deductItems.filter((d) => {
    if (filterStatus === 'enabled'  && !d.enabled)  return false;
    if (filterStatus === 'disabled' &&  d.enabled)  return false;
    if (search) {
      const q = search.toLowerCase();
      if (!d.code.toLowerCase().includes(q) && !d.nameTh.includes(q) && !d.nameEn.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const enabledCategories = accountCategories.filter((c) => c.enabled);

  type AcctEntry = { item: IncomeItem | DeductionItem; kind: 'income' | 'deduction' };
  const filteredAccounting: AcctEntry[] = [
    ...incomeItems.map((item) => ({ item, kind: 'income' as const })),
    ...deductItems.map((item) => ({ item, kind: 'deduction' as const })),
  ].filter(({ item, kind }) => {
    if (filterKind && filterKind !== kind) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!item.code.toLowerCase().includes(q) && !item.nameTh.includes(q) && !item.nameEn.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const drawerTitle = activeTab === 'income'
    ? (editingIncome ? 'แก้ไขรายได้' : 'เพิ่มรายได้')
    : (editingDeduct ? 'แก้ไขรายหัก' : 'เพิ่มรายหัก');

  return (
    <div className="hr-payroll-page hr-payitem-page">

      {/* ── tab bar ─────────────────────────────────────────────────────────── */}
      <div className="hr-payitem-tabs">
        <button
          type="button"
          className={`hr-payitem-tab${activeTab === 'income' ? ' hr-payitem-tab--active' : ''}`}
          onClick={() => { setActiveTab('income'); setSearch(''); setFilterStatus(''); setFilterCompany(''); }}
        >
          รายได้
        </button>
        <button
          type="button"
          className={`hr-payitem-tab${activeTab === 'deduction' ? ' hr-payitem-tab--active' : ''}`}
          onClick={() => { setActiveTab('deduction'); setSearch(''); setFilterStatus(''); setFilterCompany(''); }}
        >
          รายหัก
        </button>
        <button
          type="button"
          className={`hr-payitem-tab${activeTab === 'accounting' ? ' hr-payitem-tab--active' : ''}`}
          onClick={() => { setActiveTab('accounting'); setSearch(''); setFilterKind(''); setFilterCompany(''); }}
        >
          ข้อมูลบัญชี
        </button>
      </div>

      {/* ── toolbar ─────────────────────────────────────────────────────────── */}
      <div className="hr-period-board__toolbar">
        <div className="hr-period-board__toolbar-left">
          <label className="hr-payitem-search">
            <SearchIcon />
            <input
              type="text"
              placeholder="ค้นหารหัส / ชื่อรายการ"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="ค้นหารายการ"
            />
            {search && (
              <button type="button" aria-label="ล้างการค้นหา" onClick={() => setSearch('')}>
                <XIcon className="h-3 w-3" />
              </button>
            )}
          </label>
        </div>
        <div className="hr-period-board__toolbar-right">
          {activeTab !== 'accounting' && (
            <FilterChipSelect label="สถานะ" value={filterStatus} options={STATUS_FILTER_OPTS} onChange={setFilterStatus} accent={accent} />
          )}
          {activeTab === 'accounting' && (
            <FilterChipSelect label="ประเภท" value={filterKind} options={KIND_FILTER_OPTS} onChange={setFilterKind} accent={accent} />
          )}
          <FilterChipSelect label="บริษัท" value={filterCompany} options={COMPANY_FILTER_OPTS} onChange={setFilterCompany} accent={accent} />
          {activeTab === 'income' && (
            <button type="button" className="hr-btn hr-btn--primary" onClick={openNewIncome}>
              <PlusIcon /> เพิ่มรายได้
            </button>
          )}
          {activeTab === 'deduction' && (
            <button type="button" className="hr-btn hr-btn--primary" onClick={openNewDeduction}>
              <PlusIcon /> เพิ่มรายหัก
            </button>
          )}
          {activeTab === 'accounting' && (
            <button type="button" className="hr-btn hr-btn--ghost" onClick={() => setAcctCatModal(true)}>
              <PlusIcon /> จัดการหมวดบัญชี
            </button>
          )}
        </div>
      </div>

      {/* ── income table ────────────────────────────────────────────────────── */}
      {activeTab === 'income' && (
        filteredIncome.length === 0 ? (
          <EmptyPayItems label="ยังไม่มีรายได้" />
        ) : (
          <div className="hr-tablewrap">
            <table className="hr-tbl">
              <PayItemColGroup />
              <thead>
                <tr>
                  <th>รหัส</th>
                  <th>รายได้</th>
                  <th className="hr-col-center">ประเภท</th>
                  <th className="hr-col-center">คำนวณภาษี</th>
                  <th className="hr-col-center">นอกงวด</th>
                  <th className="hr-col-center">งวดก่อนหน้า</th>
                  <th className="hr-col-center">ทำจ่าย</th>
                  <th className="hr-col-center">ประเภทบัญชี</th>
                  <th className="hr-col-center">คำนวณกับ</th>
                  <th className="hr-col-center">สวัสดิการ</th>
                  <th className="hr-col-center">สถานะ</th>
                  <th className="hr-col-actions">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {filteredIncome.some((i) => !i.isCustom) && (
                  <tr className="hr-tbl-section">
                    <td colSpan={12}>รายการตามกฎหมาย</td>
                  </tr>
                )}
                {filteredIncome.filter((i) => !i.isCustom).map((item) => (
                  <IncomeRow key={item.id} item={item} onEdit={openEditIncome} onDelete={(id) => { setDeleteTarget('income'); setConfirmDeleteId(id); }} />
                ))}
                {filteredIncome.some((i) => !!i.isCustom) && (
                  <tr className="hr-tbl-section">
                    <td colSpan={12}>รายการที่สร้างเอง</td>
                  </tr>
                )}
                {filteredIncome.filter((i) => !!i.isCustom).map((item) => (
                  <IncomeRow key={item.id} item={item} onEdit={openEditIncome} onDelete={(id) => { setDeleteTarget('income'); setConfirmDeleteId(id); }} />
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* ── deduction table ──────────────────────────────────────────────────── */}
      {activeTab === 'deduction' && (
        filteredDeduct.length === 0 ? (
          <EmptyPayItems label="ยังไม่มีรายหัก" />
        ) : (
          <div className="hr-tablewrap">
            <table className="hr-tbl">
              <PayItemColGroup />
              <thead>
                <tr>
                  <th>รหัส</th>
                  <th>รายหัก</th>
                  <th className="hr-col-center">ประเภท</th>
                  <th className="hr-col-center">คำนวณภาษี</th>
                  <th className="hr-col-center">นอกงวด</th>
                  <th className="hr-col-center">งวดก่อนหน้า</th>
                  <th className="hr-col-center">ทำหัก</th>
                  <th className="hr-col-center">ประเภทบัญชี</th>
                  <th className="hr-col-center">คำนวณกับ</th>
                  <th className="hr-col-center">สวัสดิการ</th>
                  <th className="hr-col-center">สถานะ</th>
                  <th className="hr-col-actions">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {filteredDeduct.some((d) => !d.isCustom) && (
                  <tr className="hr-tbl-section">
                    <td colSpan={12}>รายการตามกฎหมาย</td>
                  </tr>
                )}
                {filteredDeduct.filter((d) => !d.isCustom).map((item) => (
                  <DeductRow key={item.id} item={item} onEdit={openEditDeduction} onDelete={(id) => { setDeleteTarget('deduction'); setConfirmDeleteId(id); }} />
                ))}
                {filteredDeduct.some((d) => !!d.isCustom) && (
                  <tr className="hr-tbl-section">
                    <td colSpan={12}>รายการที่สร้างเอง</td>
                  </tr>
                )}
                {filteredDeduct.filter((d) => !!d.isCustom).map((item) => (
                  <DeductRow key={item.id} item={item} onEdit={openEditDeduction} onDelete={(id) => { setDeleteTarget('deduction'); setConfirmDeleteId(id); }} />
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* ── accounting table ─────────────────────────────────────────────────── */}
      {activeTab === 'accounting' && (
        enabledCategories.length === 0 ? (
          <div className="hr-empty">
            <div className="hr-empty__icon"><ListIcon /></div>
            <p className="hr-empty__title">ยังไม่มีหมวดบัญชี</p>
            <p className="hr-empty__desc">กด &ldquo;จัดการหมวดบัญชี&rdquo; เพื่อเพิ่มหมวดบัญชี</p>
          </div>
        ) : filteredAccounting.length === 0 ? (
          <EmptyPayItems label="ไม่พบรายการ" />
        ) : (
          <div className="hr-tablewrap">
            <table className="hr-tbl">
              <colgroup>
                <col style={{ width: '68px' }} />
                <col />
                <col style={{ width: '76px' }} />
                {enabledCategories.map((c) => <col key={c.id} style={{ width: '180px' }} />)}
              </colgroup>
              <thead>
                <tr>
                  <th>รหัส</th>
                  <th>ชื่อรายได้รายหัก</th>
                  <th className="hr-col-center">ประเภท</th>
                  {enabledCategories.map((c) => <th key={c.id}>{c.nameTh}</th>)}
                </tr>
              </thead>
              <tbody>
                {filteredAccounting.map(({ item, kind }) => (
                  <AccountingRow
                    key={`${kind}-${item.id}`}
                    item={item}
                    kind={kind}
                    categories={enabledCategories}
                    onClick={() => setAcctDrawer({ item, kind })}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* ── acctCat modal ───────────────────────────────────────────────────── */}
      {acctCatModal && (
        <AcctCatModal
          categories={accountCategories}
          onAdd={addAcctCat}
          onRename={renameAcctCat}
          onToggle={toggleAcctCat}
          onDelete={deleteAcctCat}
          onClose={() => setAcctCatModal(false)}
        />
      )}

      {/* ── acct mapping drawer ─────────────────────────────────────────────── */}
      {acctDrawer && (
        <AcctMappingDrawer
          item={acctDrawer.item}
          kind={acctDrawer.kind}
          categories={enabledCategories}
          onSave={(mapping) => {
            updateAcctMapping(acctDrawer.item.id, acctDrawer.kind, mapping);
            setAcctDrawer(null);
          }}
          onClose={() => setAcctDrawer(null)}
        />
      )}

      {/* ── scrim + drawer ───────────────────────────────────────────────────── */}
      <div className="hr-scrim" data-open={drawerOpen ? 'true' : 'false'} onClick={() => setDrawerOpen(false)} aria-hidden />
      <div ref={drawerRef} className="hr-drawer" data-open={drawerOpen ? 'true' : 'false'} role="dialog" aria-modal aria-label={drawerTitle}>
        <div className="hr-drawer__head">
          <div>
            <p className="hr-drawer__title">{drawerTitle}</p>
            <p className="hr-drawer__subtitle">
              {activeTab === 'income' ? 'กำหนดเงื่อนไขการจ่ายและการคำนวณ' : 'กำหนดเงื่อนไขการหักเงิน'}
            </p>
          </div>
          <button type="button" className="hr-drawer__close" aria-label="ปิด" onClick={() => setDrawerOpen(false)}>
            <CloseIcon />
          </button>
        </div>

        <div className="hr-drawer__body">
          {activeTab === 'income' && drawerOpen && (
            <IncomeForm form={incomeForm} setForm={setIncomeForm} toggleEnabled={editingIncome ? (v) => toggleIncome(editingIncome.id, v) : undefined} />
          )}
          {activeTab === 'deduction' && drawerOpen && (
            <DeductionForm form={deductForm} setForm={setDeductForm} toggleEnabled={editingDeduct ? (v) => toggleDeduct(editingDeduct.id, v) : undefined} />
          )}
        </div>

        <div className="hr-drawer__foot">
          <button type="button" className="hr-btn hr-btn--ghost" onClick={() => setDrawerOpen(false)}>
            ยกเลิก
          </button>
          <button type="button" className="hr-btn hr-btn--primary" onClick={handleSave}>
            บันทึก
          </button>
        </div>
      </div>

      {/* ── delete confirm ───────────────────────────────────────────────────── */}
      {confirmDeleteId && (
        <div className="hr-leave-confirm-overlay" role="alertdialog" aria-modal aria-label="ยืนยันการลบ">
          <div className="hr-leave-confirm">
            <div className="hr-leave-confirm__head">
              <h4>ลบรายการนี้?</h4>
              <button type="button" aria-label="ปิด" onClick={() => setConfirmDeleteId(null)}>
                <CloseIcon />
              </button>
            </div>
            <div className="hr-leave-confirm__body">
              รายการที่ลบแล้วไม่สามารถกู้คืนได้
            </div>
            <div className="hr-leave-confirm__actions">
              <button type="button" className="hr-btn hr-btn--ghost hr-btn--sm" onClick={() => setConfirmDeleteId(null)}>
                ยกเลิก
              </button>
              <button type="button" className="hr-btn hr-btn--danger hr-btn--sm" onClick={handleDelete}>
                ลบ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── CalcWithIcons ─────────────────────────────────────────────────────────────

function CalcIconTip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <span className="hr-tip">
      {children}
      <span className="hr-tip__bubble">{label}</span>
    </span>
  );
}

function IncomeCalcWithIcons({ item }: { item: IncomeItem }) {
  return (
    <div className="hr-calcwith">
      {item.taxable          && <CalcIconTip label="นำส่งภาษีเงินได้"><TaxCalcIcon /></CalcIconTip>}
      {item.linkSSO          && <CalcIconTip label="ประกันสังคม (SSO)"><SSOCalcIcon /></CalcIconTip>}
      {item.linkProvidentFund && <CalcIconTip label="กองทุนสำรองเลี้ยงชีพ"><FundCalcIcon /></CalcIconTip>}
      {item.linkOvertime     && <CalcIconTip label="เงื่อนไขล่วงเวลา"><OvertimeCalcIcon /></CalcIconTip>}
      {item.linkLateAbsent   && <CalcIconTip label="เงื่อนไขสาย/ขาด"><LateCalcIcon /></CalcIconTip>}
    </div>
  );
}

function DeductCalcWithIcons({ item }: { item: DeductionItem }) {
  return (
    <div className="hr-calcwith">
      {item.taxable          && <CalcIconTip label="นำส่งภาษีเงินได้"><TaxCalcIcon /></CalcIconTip>}
      {item.linkSSO          && <CalcIconTip label="ประกันสังคม (SSO)"><SSOCalcIcon /></CalcIconTip>}
      {item.linkProvidentFund && <CalcIconTip label="กองทุนสำรองเลี้ยงชีพ"><FundCalcIcon /></CalcIconTip>}
    </div>
  );
}

// ── income drawer form ────────────────────────────────────────────────────────

function IncomeForm({
  form,
  setForm,
  toggleEnabled,
}: {
  form: Omit<IncomeItem, 'id'>;
  setForm: React.Dispatch<React.SetStateAction<Omit<IncomeItem, 'id'>>>;
  toggleEnabled?: (v: boolean) => void;
}) {
  const patch = (next: Partial<Omit<IncomeItem, 'id'>>) => setForm((f) => ({ ...f, ...next }));

  return (
    <>
      {/* ข้อมูลทั่วไป */}
      <section className="hr-fgroup">
        <h4 className="hr-fgroup__head">ข้อมูลทั่วไป</h4>
        <div className="hr-setrows">
          <div className="hr-setrow">
            <span className="hr-setrow__label">รหัส</span>
            <span className="hr-setrow__control">
              <input
                className="hr-setrow__num"
                style={{ width: '6rem', textAlign: 'left' }}
                value={form.code}
                onChange={(e) => patch({ code: e.target.value })}
                placeholder="I07"
                aria-label="รหัสรายได้"
              />
            </span>
          </div>
          <div className="hr-setrow">
            <span className="hr-setrow__label">ชื่อ (ไทย)</span>
            <span className="hr-setrow__control">
              <input
                className="hr-setrow__num"
                style={{ width: '12rem', textAlign: 'left' }}
                value={form.nameTh}
                onChange={(e) => patch({ nameTh: e.target.value })}
                placeholder="ชื่อรายได้"
                aria-label="ชื่อภาษาไทย"
              />
            </span>
          </div>
          <div className="hr-setrow">
            <span className="hr-setrow__label">ชื่อ (อังกฤษ)</span>
            <span className="hr-setrow__control">
              <input
                className="hr-setrow__num"
                style={{ width: '12rem', textAlign: 'left' }}
                value={form.nameEn}
                onChange={(e) => patch({ nameEn: e.target.value })}
                placeholder="Income name"
                aria-label="ชื่อภาษาอังกฤษ"
              />
            </span>
          </div>
          <div className="hr-setrow">
            <span className="hr-setrow__label">ประเภทเงินได้</span>
            <span className="hr-setrow__control">
              <HrCustomSelect
                value={form.revenueCategory}
                options={REVENUE_CATEGORY_OPTIONS}
                onChange={(v) => patch({ revenueCategory: v as RevenueCategory })}
                label="ประเภทเงินได้"
              />
            </span>
          </div>
          <div className="hr-setrow">
            <span className="hr-setrow__label">การปัดทศนิยม</span>
            <span className="hr-setrow__control">
              <HrCustomSelect
                value={form.rounding}
                options={PAY_ITEM_ROUNDING_OPTIONS}
                onChange={(v) => patch({ rounding: v as PayItemRounding })}
                label="การปัดทศนิยม"
              />
            </span>
          </div>
          <div className="hr-setrow">
            <span className="hr-setrow__label">คำนวณภาษี</span>
            <span className="hr-setrow__control">
              <HrCustomSelect
                value={form.taxCalcMethod}
                options={TAX_CALC_METHOD_OPTIONS}
                onChange={(v) => patch({ taxCalcMethod: v as TaxCalcMethod })}
                label="วิธีคำนวณภาษี"
              />
            </span>
          </div>
        </div>
      </section>

      {/* เงื่อนไขการจ่าย */}
      <section className="hr-fgroup">
        <h4 className="hr-fgroup__head">เงื่อนไขการจ่าย</h4>
        <div className="hr-setrows">
          <div className="hr-setrow">
            <span>
              <span className="hr-setrow__label">ขอบเขตการจ่าย</span>
            </span>
            <span className="hr-setrow__control">
              <div className="hr-payitem-scope-seg">
                {PAYOUT_SCOPE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`hr-payitem-scope-btn${form.payoutScope === opt.value ? ' hr-payitem-scope-btn--active' : ''}`}
                    onClick={() => patch({ payoutScope: opt.value as PayoutScope })}
                    aria-pressed={form.payoutScope === opt.value}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </span>
          </div>
          <div className="hr-setrow">
            <span>
              <span className="hr-setrow__label">คำนวณตามวันทำงานจริง</span>
            </span>
            <span className="hr-setrow__control">
              <Toggle checked={form.calcByActualWorkdays} onChange={(v) => patch({ calcByActualWorkdays: v })} label="คำนวณตามวันทำงานจริง" />
            </span>
          </div>
          <div className="hr-setrow">
            <span>
              <span className="hr-setrow__label">จ่ายครั้งเดียวต่อปี</span>
            </span>
            <span className="hr-setrow__control">
              <Toggle checked={form.payOnce} onChange={(v) => patch({ payOnce: v })} label="จ่ายครั้งเดียวต่อปี" />
            </span>
          </div>
        </div>
      </section>

      {/* เงื่อนไขการคำนวณ */}
      <section className="hr-fgroup">
        <h4 className="hr-fgroup__head">เงื่อนไขการคำนวณ</h4>
        <div className="hr-setrows">
          <div className="hr-setrow">
            <span className="hr-setrow__label">นำส่งภาษีเงินได้</span>
            <span className="hr-setrow__control">
              <Toggle checked={form.taxable} onChange={(v) => patch({ taxable: v })} label="นำส่งภาษีเงินได้" />
            </span>
          </div>
          <div className="hr-setrow">
            <span className="hr-setrow__label">นำเข้าฐาน SSO</span>
            <span className="hr-setrow__control">
              <Toggle checked={form.linkSSO} onChange={(v) => patch({ linkSSO: v })} label="นำเข้าฐาน SSO" />
            </span>
          </div>
          <div className="hr-setrow">
            <span className="hr-setrow__label">นำเข้ากองทุนสำรอง</span>
            <span className="hr-setrow__control">
              <Toggle checked={form.linkProvidentFund} onChange={(v) => patch({ linkProvidentFund: v })} label="นำเข้ากองทุนสำรอง" />
            </span>
          </div>
          <div className="hr-setrow">
            <span className="hr-setrow__label">เงื่อนไขล่วงเวลา</span>
            <span className="hr-setrow__control">
              <Toggle checked={form.linkOvertime} onChange={(v) => patch({ linkOvertime: v })} label="เงื่อนไขล่วงเวลา" />
            </span>
          </div>
          <div className="hr-setrow">
            <span className="hr-setrow__label">เงื่อนไขสาย/ขาด</span>
            <span className="hr-setrow__control">
              <Toggle checked={form.linkLateAbsent} onChange={(v) => patch({ linkLateAbsent: v })} label="เงื่อนไขสาย/ขาด" />
            </span>
          </div>
          <div className="hr-setrow">
            <span className="hr-setrow__label">เป็นสวัสดิการ</span>
            <span className="hr-setrow__control">
              <Toggle checked={form.isWelfare} onChange={(v) => patch({ isWelfare: v })} label="เป็นสวัสดิการ" />
            </span>
          </div>
        </div>
      </section>

      {/* อื่นๆ */}
      <section className="hr-fgroup">
        <h4 className="hr-fgroup__head">อื่นๆ</h4>
        <div className="hr-setrows">
          <div className="hr-setrow">
            <span className="hr-setrow__label">คำนวณนอกงวด</span>
            <span className="hr-setrow__control">
              <Toggle checked={form.offCycle} onChange={(v) => patch({ offCycle: v })} label="คำนวณนอกงวด" />
            </span>
          </div>
          <div className="hr-setrow">
            <span className="hr-setrow__label">นำยอดงวดก่อนมารวม</span>
            <span className="hr-setrow__control">
              <Toggle checked={form.carryPrevPeriod} onChange={(v) => patch({ carryPrevPeriod: v })} label="นำยอดงวดก่อนมารวม" />
            </span>
          </div>
          {toggleEnabled && (
            <div className="hr-setrow">
              <span className="hr-setrow__label">สถานะ</span>
              <span className="hr-setrow__control">
                <Toggle checked={form.enabled} onChange={(v) => { patch({ enabled: v }); toggleEnabled(v); }} label="สถานะ" />
              </span>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

// ── deduction drawer form ─────────────────────────────────────────────────────

function DeductionForm({
  form,
  setForm,
  toggleEnabled,
}: {
  form: Omit<DeductionItem, 'id'>;
  setForm: React.Dispatch<React.SetStateAction<Omit<DeductionItem, 'id'>>>;
  toggleEnabled?: (v: boolean) => void;
}) {
  const patch = (next: Partial<Omit<DeductionItem, 'id'>>) => setForm((f) => ({ ...f, ...next }));

  return (
    <>
      {/* ข้อมูลทั่วไป */}
      <section className="hr-fgroup">
        <h4 className="hr-fgroup__head">ข้อมูลทั่วไป</h4>
        <div className="hr-setrows">
          <div className="hr-setrow">
            <span className="hr-setrow__label">รหัส</span>
            <span className="hr-setrow__control">
              <input
                className="hr-setrow__num"
                style={{ width: '6rem', textAlign: 'left' }}
                value={form.code}
                onChange={(e) => patch({ code: e.target.value })}
                placeholder="D05"
                aria-label="รหัสรายหัก"
              />
            </span>
          </div>
          <div className="hr-setrow">
            <span className="hr-setrow__label">ชื่อ (ไทย)</span>
            <span className="hr-setrow__control">
              <input
                className="hr-setrow__num"
                style={{ width: '12rem', textAlign: 'left' }}
                value={form.nameTh}
                onChange={(e) => patch({ nameTh: e.target.value })}
                placeholder="ชื่อรายหัก"
                aria-label="ชื่อภาษาไทย"
              />
            </span>
          </div>
          <div className="hr-setrow">
            <span className="hr-setrow__label">ชื่อ (อังกฤษ)</span>
            <span className="hr-setrow__control">
              <input
                className="hr-setrow__num"
                style={{ width: '12rem', textAlign: 'left' }}
                value={form.nameEn}
                onChange={(e) => patch({ nameEn: e.target.value })}
                placeholder="Deduction name"
                aria-label="ชื่อภาษาอังกฤษ"
              />
            </span>
          </div>
          <div className="hr-setrow">
            <span className="hr-setrow__label">การปัดทศนิยม</span>
            <span className="hr-setrow__control">
              <HrCustomSelect
                value={form.rounding}
                options={PAY_ITEM_ROUNDING_OPTIONS}
                onChange={(v) => patch({ rounding: v as PayItemRounding })}
                label="การปัดทศนิยม"
              />
            </span>
          </div>
          <div className="hr-setrow">
            <span className="hr-setrow__label">ประเภทเงินได้</span>
            <span className="hr-setrow__control">
              <HrCustomSelect
                value={form.revenueCategory ?? ''}
                options={[{ value: '', label: 'ไม่ระบุ' }, ...REVENUE_CATEGORY_OPTIONS]}
                onChange={(v) => patch({
                  revenueCategory: v ? v as RevenueCategory : undefined,
                  taxCalcMethod: v ? (form.taxCalcMethod ?? 'annual') : undefined,
                })}
                label="ประเภทเงินได้"
              />
            </span>
          </div>
          {form.revenueCategory && (
            <div className="hr-setrow">
              <span className="hr-setrow__label">วิธีคำนวณภาษี</span>
              <span className="hr-setrow__control">
                <div className="hr-payitem-scope-seg">
                  {TAX_CALC_METHOD_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`hr-payitem-scope-btn${form.taxCalcMethod === opt.value ? ' hr-payitem-scope-btn--active' : ''}`}
                      onClick={() => patch({ taxCalcMethod: opt.value as TaxCalcMethod })}
                      aria-pressed={form.taxCalcMethod === opt.value}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </span>
            </div>
          )}
        </div>
      </section>

      {/* เงื่อนไขการหัก */}
      <section className="hr-fgroup">
        <h4 className="hr-fgroup__head">เงื่อนไขการหัก</h4>
        <div className="hr-setrows">
          <div className="hr-setrow">
            <span className="hr-setrow__label">ขอบเขตการหัก</span>
            <span className="hr-setrow__control">
              <div className="hr-payitem-scope-seg">
                {PAYOUT_SCOPE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`hr-payitem-scope-btn${form.payoutScope === opt.value ? ' hr-payitem-scope-btn--active' : ''}`}
                    onClick={() => patch({ payoutScope: opt.value as PayoutScope })}
                    aria-pressed={form.payoutScope === opt.value}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </span>
          </div>
        </div>
      </section>

      {/* เงื่อนไขการคำนวณ */}
      <section className="hr-fgroup">
        <h4 className="hr-fgroup__head">เงื่อนไขการคำนวณ</h4>
        <div className="hr-setrows">
          <div className="hr-setrow">
            <span className="hr-setrow__label">นำส่งภาษีเงินได้</span>
            <span className="hr-setrow__control">
              <Toggle checked={form.taxable} onChange={(v) => patch({ taxable: v })} label="นำส่งภาษีเงินได้" />
            </span>
          </div>
          <div className="hr-setrow">
            <span className="hr-setrow__label">นำเข้าฐาน SSO</span>
            <span className="hr-setrow__control">
              <Toggle checked={form.linkSSO} onChange={(v) => patch({ linkSSO: v })} label="นำเข้าฐาน SSO" />
            </span>
          </div>
          <div className="hr-setrow">
            <span className="hr-setrow__label">นำเข้ากองทุนสำรอง</span>
            <span className="hr-setrow__control">
              <Toggle checked={form.linkProvidentFund} onChange={(v) => patch({ linkProvidentFund: v })} label="นำเข้ากองทุนสำรอง" />
            </span>
          </div>
          <div className="hr-setrow">
            <span className="hr-setrow__label">เกี่ยวข้องกับสวัสดิการ</span>
            <span className="hr-setrow__control">
              <Toggle checked={!!form.isWelfare} onChange={(v) => patch({ isWelfare: v })} label="เกี่ยวข้องกับสวัสดิการ" />
            </span>
          </div>
        </div>
      </section>

      {/* อื่นๆ */}
      <section className="hr-fgroup">
        <h4 className="hr-fgroup__head">อื่นๆ</h4>
        <div className="hr-setrows">
          <div className="hr-setrow">
            <span className="hr-setrow__label">คำนวณนอกงวด</span>
            <span className="hr-setrow__control">
              <Toggle checked={form.offCycle} onChange={(v) => patch({ offCycle: v })} label="คำนวณนอกงวด" />
            </span>
          </div>
          <div className="hr-setrow">
            <span className="hr-setrow__label">นำยอดงวดก่อนมารวม</span>
            <span className="hr-setrow__control">
              <Toggle checked={form.carryPrevPeriod} onChange={(v) => patch({ carryPrevPeriod: v })} label="นำยอดงวดก่อนมารวม" />
            </span>
          </div>
          {toggleEnabled && (
            <div className="hr-setrow">
              <span className="hr-setrow__label">สถานะ</span>
              <span className="hr-setrow__control">
                <Toggle checked={form.enabled} onChange={(v) => { patch({ enabled: v }); toggleEnabled(v); }} label="สถานะ" />
              </span>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

// ── table row sub-components ──────────────────────────────────────────────────

function IncomeRow({ item, onEdit, onDelete }: {
  item: IncomeItem;
  onEdit: (item: IncomeItem) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <tr>
      <td><span className="hr-cell-code">{item.code}</span></td>
      <td>
        <div className="hr-cell-name__primary">{item.nameTh}</div>
      </td>
      <td className="hr-col-center"><span className="hr-payitem-rev-badge">{item.revenueCategory}</span></td>
      <td className="hr-col-center">
        {item.taxable
          ? <span className="hr-payitem-taxcalc">{item.taxCalcMethod === 'annual' ? 'ทั้งปี' : 'ครั้งเดียว'}</span>
          : <Dash />}
      </td>
      <td className="hr-col-center">{item.offCycle ? <CheckMark /> : null}</td>
      <td className="hr-col-center">{item.carryPrevPeriod ? <CheckMark /> : null}</td>
      <td className="hr-col-center">{item.payoutScope === 'every-period' ? 'ทุกงวด' : 'งวดสิ้นเดือน'}</td>
      <td className="hr-col-center"><Dash /></td>
      <td className="hr-col-center"><IncomeCalcWithIcons item={item} /></td>
      <td className="hr-col-center">{item.isWelfare ? <WelfareIcon /> : null}</td>
      <td className="hr-col-center">
        <span className={item.enabled ? 'hr-pill hr-pill--green' : 'hr-pill hr-pill--slate'}>
          <span className="hr-pill__dot" />
          {item.enabled ? 'ใช้งาน' : 'ปิด'}
        </span>
      </td>
      <td>
        <div className="hr-rowactions">
          <button type="button" className="hr-iconbtn" title="แก้ไข" aria-label={`แก้ไข ${item.nameTh}`} onClick={() => onEdit(item)}>
            <EditIcon />
          </button>
          {item.isCustom && (
            <button type="button" className="hr-iconbtn hr-iconbtn--danger" title="ลบรายการ" aria-label={`ลบ ${item.nameTh}`} onClick={() => onDelete(item.id)}>
              <TrashIcon />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

function DeductRow({ item, onEdit, onDelete }: {
  item: DeductionItem;
  onEdit: (item: DeductionItem) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <tr>
      <td><span className="hr-cell-code">{item.code}</span></td>
      <td>
        <div className="hr-cell-name__primary">{item.nameTh}</div>
      </td>
      <td className="hr-col-center">
        {item.revenueCategory
          ? <span className="hr-payitem-rev-badge">{item.revenueCategory}</span>
          : <Dash />}
      </td>
      <td className="hr-col-center">
        {item.revenueCategory && item.taxCalcMethod
          ? <span className="hr-payitem-taxcalc">{item.taxCalcMethod === 'annual' ? 'ทั้งปี' : 'ครั้งเดียว'}</span>
          : <Dash />}
      </td>
      <td className="hr-col-center">{item.offCycle ? <CheckMark /> : null}</td>
      <td className="hr-col-center">{item.carryPrevPeriod ? <CheckMark /> : null}</td>
      <td className="hr-col-center">{item.payoutScope === 'every-period' ? 'ทุกงวด' : 'งวดสิ้นเดือน'}</td>
      <td className="hr-col-center"><Dash /></td>
      <td className="hr-col-center"><DeductCalcWithIcons item={item} /></td>
      <td className="hr-col-center">{item.isWelfare ? <WelfareIcon /> : null}</td>
      <td className="hr-col-center">
        <span className={item.enabled ? 'hr-pill hr-pill--green' : 'hr-pill hr-pill--slate'}>
          <span className="hr-pill__dot" />
          {item.enabled ? 'ใช้งาน' : 'ปิด'}
        </span>
      </td>
      <td>
        <div className="hr-rowactions">
          <button type="button" className="hr-iconbtn" title="แก้ไข" aria-label={`แก้ไข ${item.nameTh}`} onClick={() => onEdit(item)}>
            <EditIcon />
          </button>
          {item.isCustom && (
            <button type="button" className="hr-iconbtn hr-iconbtn--danger" title="ลบรายการ" aria-label={`ลบ ${item.nameTh}`} onClick={() => onDelete(item.id)}>
              <TrashIcon />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

// ── filter chip select ────────────────────────────────────────────────────────

function FilterChipSelect({
  label, value, options, onChange, accent,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
  accent: string;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const selected = options.find((o) => o.value === value);
  if (selected) {
    return (
      <div className="hr-filter-chip hr-filter-chip--active" style={{ borderColor: accent, color: accent }}>
        <span>{selected.label}</span>
        <button type="button" className="hr-filter-chip__clear" aria-label="ล้างตัวกรอง" onClick={() => onChange('')}>
          <XIcon className="h-3 w-3" />
        </button>
      </div>
    );
  }
  return (
    <div ref={wrapRef} className="hr-filter-chip-wrap">
      <button type="button" className="hr-filter-chip" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        {label} <span aria-hidden>▾</span>
      </button>
      {open && (
        <div className="hr-filter-chip-dropdown">
          {options.map((o) => (
            <button key={o.value} type="button" className="hr-filter-chip-dropdown__item"
              onClick={() => { onChange(o.value); setOpen(false); }}>
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── small reusable pieces ─────────────────────────────────────────────────────

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label}
      className="hr-toggle" onClick={() => onChange(!checked)}>
      <span className="hr-toggle__thumb" />
    </button>
  );
}

function EmptyPayItems({ label }: { label: string }) {
  return (
    <div className="hr-empty">
      <div className="hr-empty__icon">
        <ListIcon />
      </div>
      <p className="hr-empty__title">{label}</p>
      <p className="hr-empty__desc">กดปุ่ม &ldquo;เพิ่มรายการ&rdquo; เพื่อเพิ่มรายการใหม่</p>
    </div>
  );
}

function CheckMark() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" width="15" height="15" aria-hidden className="hr-payitem-check">
      <path fillRule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
    </svg>
  );
}

function Dash() {
  return <span className="hr-payitem-dash" aria-hidden>—</span>;
}

function WelfareIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" width="15" height="15" aria-hidden className="hr-payitem-welfare">
      <path d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z" />
    </svg>
  );
}

// ── calc-with icons ────────────────────────────────────────────────────────────

function TaxCalcIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" width="16" height="16" aria-label="ภาษี" className="hr-calcwith__icon">
      <path fillRule="evenodd" d="M6.701 2.25c.577-1 2.02-1 2.598 0l5.196 9a1.5 1.5 0 0 1-1.299 2.25H2.804a1.5 1.5 0 0 1-1.3-2.25l5.197-9ZM8 4a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-1.5 0v-3A.75.75 0 0 1 8 4Zm0 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
    </svg>
  );
}

function SSOCalcIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" width="16" height="16" aria-label="SSO" className="hr-calcwith__icon">
      <path fillRule="evenodd" d="M15 8A7 7 0 1 1 1 8a7 7 0 0 1 14 0Zm-5-2a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM8 9.5c-2.029 0-3.784.873-4.963 2.239A5.507 5.507 0 0 0 8 13.5a5.507 5.507 0 0 0 4.963-1.761C11.784 10.373 10.03 9.5 8 9.5Z" clipRule="evenodd" />
    </svg>
  );
}

function FundCalcIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" width="16" height="16" aria-label="กองทุน" className="hr-calcwith__icon">
      <path fillRule="evenodd" d="M8.5 1.709a.75.75 0 0 0-1 0L1.006 7.336a.75.75 0 0 0 .494 1.313H2.5v5.101A1.5 1.5 0 0 0 4 15h8a1.5 1.5 0 0 0 1.5-1.5V8.649h1a.75.75 0 0 0 .494-1.313L8.5 1.71ZM6.5 10.5a.5.5 0 0 1 1 0v2a.5.5 0 0 1-1 0v-2Zm2.5-.5a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 1 0v-2a.5.5 0 0 0-.5-.5Z" clipRule="evenodd" />
    </svg>
  );
}

function OvertimeCalcIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" width="16" height="16" aria-label="ล่วงเวลา" className="hr-calcwith__icon">
      <path fillRule="evenodd" d="M1 8a7 7 0 1 1 14 0A7 7 0 0 1 1 8Zm7-4.75a.75.75 0 0 1 .75.75v4.19l2.28 1.317a.75.75 0 1 1-.75 1.3l-2.56-1.48A.75.75 0 0 1 7.25 10V4a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
    </svg>
  );
}

function LateCalcIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" width="16" height="16" aria-label="สาย/ขาด" className="hr-calcwith__icon">
      <path fillRule="evenodd" d="M4 1.5a.5.5 0 0 0-1 0V2H2a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1h-1v-.5a.5.5 0 0 0-1 0V2H4v-.5ZM2.5 5.5h11v8h-11v-8Zm7.03 2.22a.75.75 0 0 0-1.06 1.06L9.94 10l-1.47 1.47a.75.75 0 1 0 1.06 1.06L11 11.06l1.47 1.47a.75.75 0 1 0 1.06-1.06L12.06 10l1.47-1.47a.75.75 0 0 0-1.06-1.06L11 8.94 9.53 7.47Z" clipRule="evenodd" />
    </svg>
  );
}

// ── other icons ───────────────────────────────────────────────────────────────

function PlusIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14" aria-hidden>
      <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M11.5 2.5a1.414 1.414 0 0 1 2 2L5 13l-3 1 1-3 8.5-8.5Z" />
      <path d="M10 4l2 2" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M2 4.5h12" />
      <path d="M6 4.5V3a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5v1.5" />
      <path d="M5 4.5l.5 8h5l.5-8" />
    </svg>
  );
}

function AccountingRow({ item, kind, categories, onClick }: {
  item: IncomeItem | DeductionItem;
  kind: 'income' | 'deduction';
  categories: AccountCategory[];
  onClick: () => void;
}) {
  return (
    <tr className="hr-acctmap-row" onClick={onClick}>
      <td><span className="hr-cell-code">{item.code}</span></td>
      <td><div className="hr-cell-name__primary">{item.nameTh}</div></td>
      <td className="hr-col-center">
        <span className="hr-acctmap-kind">{kind === 'income' ? 'รายได้' : 'รายหัก'}</span>
      </td>
      {categories.map((cat) => (
        <td key={cat.id} className="hr-acctmap-cell">
          <span className="hr-acctmap-value">{item.accountMapping?.[cat.id] || '—'}</span>
        </td>
      ))}
    </tr>
  );
}

function fmtUpdatedAt(iso: string): string {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear() + 543;
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy} ${hh}:${mi}`;
}

function SaveCheckIcon() {
  return (
    <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M2.5 8.5l3.5 3.5 7-7" />
    </svg>
  );
}

function AcctMappingDrawer({
  item,
  kind,
  categories,
  onSave,
  onClose,
}: {
  item: IncomeItem | DeductionItem;
  kind: 'income' | 'deduction';
  categories: AccountCategory[];
  onSave: (mapping: Record<string, string>) => void;
  onClose: () => void;
}) {
  const [mapping, setMapping] = useState<Record<string, string>>(() => ({ ...(item.accountMapping ?? {}) }));
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const id = window.requestAnimationFrame(() => setOpen(true));
    return () => window.cancelAnimationFrame(id);
  }, []);

  function setVal(catId: string, val: string) {
    setMapping((prev) => ({ ...prev, [catId]: val }));
  }

  return (
    <>
      <div className="hr-scrim" data-open={open ? 'true' : 'false'} onClick={onClose} aria-hidden />
      <div className="hr-drawer" data-open={open ? 'true' : 'false'} role="dialog" aria-modal aria-label="ใส่รหัสบัญชี GL">
        <div className="hr-drawer__head">
          <div>
            <p className="hr-drawer__title">{item.nameTh}</p>
            <p className="hr-drawer__subtitle">
              {item.code}&ensp;·&ensp;{kind === 'income' ? 'รายได้' : 'รายหัก'}
            </p>
          </div>
          <button type="button" className="hr-drawer__close" aria-label="ปิด" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>
        <div className="hr-drawer__body">
          {categories.map((cat) => (
            <div key={cat.id} className="hr-field">
              <label className="hr-field__label">{cat.nameTh}</label>
              <input
                className="hr-field__ctrl"
                type="text"
                placeholder="กรอกเลขบัญชี"
                value={mapping[cat.id] ?? ''}
                onChange={(e) => setVal(cat.id, e.target.value)}
              />
            </div>
          ))}
        </div>
        <div className="hr-drawer__foot">
          <button type="button" className="hr-btn" onClick={onClose}>ยกเลิก</button>
          <button type="button" className="hr-btn hr-btn--primary" onClick={() => onSave(mapping)}>บันทึก</button>
        </div>
      </div>
    </>
  );
}

function AcctCatModal({
  categories,
  onAdd,
  onRename,
  onToggle,
  onDelete,
  onClose,
}: {
  categories: AccountCategory[];
  onAdd: (nameTh: string) => void;
  onRename: (id: string, nameTh: string) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}) {
  const [catSearch,  setCatSearch]  = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [addMode,    setAddMode]    = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [editingId,  setEditingId]  = useState<string | null>(null);
  const [editName,   setEditName]   = useState('');

  const CAT_STATUS_OPTS = [
    { value: 'enabled',  label: 'ใช้งาน' },
    { value: 'disabled', label: 'ปิดใช้งาน' },
  ];

  const visible = categories.filter((c) => {
    if (statusFilter === 'enabled'  && !c.enabled) return false;
    if (statusFilter === 'disabled' &&  c.enabled) return false;
    if (catSearch && !c.nameTh.includes(catSearch)) return false;
    return true;
  });

  function handleAdd() {
    const name = newCatName.trim();
    if (!name) return;
    onAdd(name);
    setNewCatName('');
    setAddMode(false);
  }

  function handleRename(id: string) {
    const name = editName.trim();
    if (name) onRename(id, name);
    setEditingId(null);
  }

  function startEdit(id: string, current: string) {
    setEditingId(id);
    setEditName(current);
    setAddMode(false);
  }

  return (
    <div className="hr-modal-backdrop" onClick={onClose} aria-modal role="dialog" aria-label="จัดการหมวดบัญชี">
      <div className="hr-modal hr-acctcat-modal" onClick={(e) => e.stopPropagation()}>
        <div className="hr-modal__head">
          <p className="hr-modal__title">หมวดบัญชี</p>
          <button type="button" className="hr-drawer__close" aria-label="ปิด" onClick={onClose}><CloseIcon /></button>
        </div>
        <div className="hr-acctcat-modal__toolbar">
          <label className="hr-payitem-search">
            <SearchIcon />
            <input
              type="text"
              placeholder="ค้นหาชื่อหมวดบัญชี"
              value={catSearch}
              onChange={(e) => setCatSearch(e.target.value)}
            />
            {catSearch && (
              <button type="button" aria-label="ล้าง" onClick={() => setCatSearch('')}>
                <XIcon className="h-3 w-3" />
              </button>
            )}
          </label>
          <FilterChipSelect label="ใช้งาน" value={statusFilter} options={CAT_STATUS_OPTS} onChange={setStatusFilter} accent="#4f46e5" />
          <button
            type="button"
            className="hr-btn hr-btn--primary hr-btn--sm"
            onClick={() => { setAddMode(true); setNewCatName(''); setEditingId(null); }}
          >
            <PlusIcon /> เพิ่มหมวดบัญชี
          </button>
        </div>
        <div className="hr-modal__body">
          <div>
          <table className="hr-tbl">
            <colgroup>
              <col />
              <col style={{ width: '200px' }} />
              <col style={{ width: '100px' }} />
              <col style={{ width: '76px' }} />
            </colgroup>
            <thead>
              <tr>
                <th>หมวดบัญชี</th>
                <th>แก้ไขล่าสุด</th>
                <th className="hr-col-center">สถานะ</th>
                <th className="hr-col-actions" />
              </tr>
            </thead>
            <tbody>
              {addMode && (
                <tr>
                  <td colSpan={2}>
                    <input
                      className="hr-acctcat-input"
                      type="text"
                      placeholder="ชื่อหมวดบัญชี"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') setAddMode(false); }}
                      autoFocus
                    />
                  </td>
                  <td />
                  <td>
                    <div className="hr-rowactions">
                      <button type="button" className="hr-iconbtn" title="บันทึก" onClick={handleAdd}><SaveCheckIcon /></button>
                      <button type="button" className="hr-iconbtn" title="ยกเลิก" onClick={() => setAddMode(false)}><CloseIcon /></button>
                    </div>
                  </td>
                </tr>
              )}
              {visible.map((cat) => (
                <tr key={cat.id}>
                  <td>
                    {editingId === cat.id ? (
                      <input
                        className="hr-acctcat-input"
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleRename(cat.id); if (e.key === 'Escape') setEditingId(null); }}
                        autoFocus
                      />
                    ) : (
                      cat.nameTh
                    )}
                  </td>
                  <td>
                    <div className="hr-acctcat-date">
                      <span className="hr-acctcat-date__name">ผู้ดูแลระบบ</span>
                      <span className="hr-acctcat-date__time">{fmtUpdatedAt(cat.updatedAt)}</span>
                    </div>
                  </td>
                  <td className="hr-col-center">
                    <button
                      type="button"
                      className={`hr-pill hr-pill-btn ${cat.enabled ? 'hr-pill--green' : 'hr-pill--slate'}`}
                      onClick={() => onToggle(cat.id)}
                      title={cat.enabled ? 'คลิกเพื่อปิดใช้งาน' : 'คลิกเพื่อเปิดใช้งาน'}
                    >
                      <span className="hr-pill__dot" />
                      {cat.enabled ? 'ใช้งาน' : 'ปิด'}
                    </button>
                  </td>
                  <td>
                    <div className="hr-rowactions">
                      {editingId === cat.id ? (
                        <>
                          <button type="button" className="hr-iconbtn" title="บันทึก" onClick={() => handleRename(cat.id)}><SaveCheckIcon /></button>
                          <button type="button" className="hr-iconbtn" title="ยกเลิก" onClick={() => setEditingId(null)}><CloseIcon /></button>
                        </>
                      ) : (
                        <>
                          <button type="button" className="hr-iconbtn" title="แก้ไขชื่อ" onClick={() => startEdit(cat.id, cat.nameTh)}><EditIcon /></button>
                          <button type="button" className="hr-iconbtn hr-iconbtn--danger" title="ลบ" onClick={() => onDelete(cat.id)}><TrashIcon /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {visible.length === 0 && !addMode && (
                <tr>
                  <td colSpan={4} className="hr-acctcat-empty">ไม่มีหมวดบัญชี</td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function PayItemColGroup() {
  return (
    <colgroup>
      <col style={{ width: '64px' }} />   {/* รหัส */}
      <col style={{ width: '160px' }} />  {/* ชื่อ — capped so other cols get more room */}
      <col style={{ width: '92px' }} />   {/* ประเภท */}
      <col style={{ width: '92px' }} />   {/* คำนวณภาษี */}
      <col style={{ width: '76px' }} />   {/* นอกงวด */}
      <col style={{ width: '96px' }} />   {/* งวดก่อนหน้า */}
      <col style={{ width: '84px' }} />   {/* ทำจ่าย/ทำหัก */}
      <col style={{ width: '96px' }} />   {/* ประเภทบัญชี */}
      <col style={{ width: '108px' }} />  {/* คำนวณกับ */}
      <col style={{ width: '76px' }} />   {/* สวัสดิการ */}
      <col style={{ width: '82px' }} />   {/* สถานะ */}
      <col style={{ width: '74px' }} />   {/* จัดการ */}
    </colgroup>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16" aria-hidden>
      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14" aria-hidden style={{ flexShrink: 0, color: 'var(--hr-text-subtle)' }}>
      <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" width="22" height="22" aria-hidden>
      <path fillRule="evenodd" d="M6 4.75A.75.75 0 0 1 6.75 4h10.5a.75.75 0 0 1 0 1.5H6.75A.75.75 0 0 1 6 4.75ZM6 10a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H6.75A.75.75 0 0 1 6 10Zm0 5.25a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H6.75a.75.75 0 0 1-.75-.75ZM1.99 4.75a1 1 0 0 1 1-1H3a1 1 0 0 1 1 1v.01a1 1 0 0 1-1 1h-.01a1 1 0 0 1-1-1v-.01ZM1.99 15.25a1 1 0 0 1 1-1H3a1 1 0 0 1 1 1v.01a1 1 0 0 1-1 1h-.01a1 1 0 0 1-1-1v-.01ZM1.99 10a1 1 0 0 1 1-1H3a1 1 0 0 1 1 1v.01a1 1 0 0 1-1 1h-.01a1 1 0 0 1-1-1V10Z" clipRule="evenodd" />
    </svg>
  );
}

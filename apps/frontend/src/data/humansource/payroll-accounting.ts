// 3.4 ข้อมูลบัญชี — map รายได้/รายหักไปยังหมวดบัญชี (GL), per company.

export type AccountCodeType = 'asset' | 'liability' | 'expense' | 'revenue';

export type AccountCategory = {
  id: string;
  nameTh: string;
  codeType: AccountCodeType;
};

export type AccountingMap = {
  id: string;
  payItemId: string;          // FK → IncomeItem.id | DeductionItem.id
  kind: 'income' | 'deduction';
  accountCategoryId: string;  // ประเภทรหัสบัญชี
  office: string;             // สำนักงาน
  factory: string;            // โรงงาน
};

export const ACCOUNT_CATEGORIES_STORAGE_BASE = 'account-categories';
export const ACCOUNTING_MAP_STORAGE_BASE = 'accounting-map';

export const ACCOUNT_CODE_TYPE_LABELS: Record<AccountCodeType, string> = {
  asset: 'สินทรัพย์',
  liability: 'หนี้สิน',
  expense: 'ค่าใช้จ่าย',
  revenue: 'รายได้',
};

export const ACCOUNT_CATEGORY_SEED: AccountCategory[] = [
  { id: 'ACCCAT-payroll-expense', nameTh: 'ค่าใช้จ่ายเงินเดือน', codeType: 'expense' },
  { id: 'ACCCAT-ot-expense', nameTh: 'ค่าใช้จ่ายล่วงเวลา', codeType: 'expense' },
  { id: 'ACCCAT-payroll-payable', nameTh: 'เจ้าหนี้เงินเดือน', codeType: 'liability' },
  { id: 'ACCCAT-tax-payable', nameTh: 'ภาษีหัก ณ ที่จ่ายค้างจ่าย', codeType: 'liability' },
  { id: 'ACCCAT-sso-payable', nameTh: 'ประกันสังคมค้างจ่าย', codeType: 'liability' },
  { id: 'ACCCAT-pf-payable', nameTh: 'กองทุนสำรองเลี้ยงชีพค้างจ่าย', codeType: 'liability' },
];

export const ACCOUNTING_MAP_SEED: AccountingMap[] = [];

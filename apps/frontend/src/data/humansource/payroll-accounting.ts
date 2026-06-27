// 3.4 ข้อมูลบัญชี — user-defined GL account categories.
// Each enabled category becomes a column in the accounting mapping table.

export type AccountCategory = {
  id: string;
  nameTh: string;
  enabled: boolean;
  updatedAt: string; // ISO date string
};

export const ACCOUNT_CATEGORIES_STORAGE_BASE = 'account-categories';
export const ACCOUNT_CAT_SEED_VER = 1;

export const ACCOUNT_CATEGORY_SEED: AccountCategory[] = [
  { id: 'cat-office',  nameTh: 'สำนักงาน', enabled: true, updatedAt: '2021-03-26T08:50:00.000Z' },
  { id: 'cat-factory', nameTh: 'โรงงาน',   enabled: true, updatedAt: '2021-03-26T08:51:00.000Z' },
];

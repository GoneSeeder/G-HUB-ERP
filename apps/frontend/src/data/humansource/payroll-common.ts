// Shared helpers for the Payroll settings module.
// Payroll master-data is stored per company; every localStorage key is namespaced
// by a company slug via payrollKey(base, company).

export const PAYROLL_ALL_COMPANIES = 'ใช้กับทุกบริษัท';

export const PAYROLL_COMPANY_OPTIONS: string[] = [
  PAYROLL_ALL_COMPANIES,
  'G-HUB Enterprise',
  'Operations',
  'ฝ่ายขาย',
  'คลังสินค้า',
];

// แปลงชื่อบริษัทเป็น slug สำหรับใช้ต่อท้าย localStorage key (รองรับภาษาไทย)
export function companySlug(company: string): string {
  if (company === PAYROLL_ALL_COMPANIES) return 'all';
  return company.trim().replace(/\s+/g, '-') || 'unknown';
}

export function payrollKey(base: string, company: string): string {
  return `g-hub.hr.payroll.${base}.${companySlug(company)}`;
}

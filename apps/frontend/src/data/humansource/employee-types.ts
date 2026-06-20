export type EmployeeTypeTax = 'withholding' | 'none';

export type EmployeeType = {
  id: string;
  code: string;
  nameTh: string;
  nameEn: string;
  tax: EmployeeTypeTax;
  active: boolean;
};

export function taxLabel(tax: EmployeeTypeTax): string {
  return tax === 'withholding' ? 'หัก ณ ที่จ่าย' : 'ไม่หัก';
}

export const EMPLOYEE_TYPE_SEED: EmployeeType[] = [
  { id: 'ET001', code: 'EMP-MONTHLY',  nameTh: 'รายเดือน',  nameEn: 'Monthly',    tax: 'withholding', active: true },
  { id: 'ET002', code: 'EMP-FRONT',    nameTh: 'หน้าร้าน',  nameEn: 'Front Store', tax: 'none',       active: true },
  { id: 'ET003', code: 'EMP-DAILY',    nameTh: 'รายวัน',    nameEn: 'Daily',      tax: 'none',        active: true },
  { id: 'ET004', code: 'EMP-PARTTIME', nameTh: 'พาร์ทไทม์', nameEn: 'Part Time',  tax: 'none',        active: false },
  { id: 'ET005', code: 'EMP-CONTRACT', nameTh: 'เหมาจ่าย',  nameEn: 'Contract',   tax: 'withholding', active: false },
];

export const EMPLOYEE_TYPES_STORAGE_KEY = 'g-hub.hr.employee-types';

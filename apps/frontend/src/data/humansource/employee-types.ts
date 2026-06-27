export type EmployeeTypeTax = 'หัก ณ ที่จ่าย' | 'ไม่หัก';

export type EmployeeType = {
  id: string;
  code: string;
  nameTh: string;
  nameEn: string;
  tax: EmployeeTypeTax;
  active: boolean;
};

export function taxLabel(tax: EmployeeTypeTax): string {
  return tax;
}

export const EMPLOYEE_TYPE_SEED: EmployeeType[] = [
  { id: 'ET001', code: 'EMP-MONTHLY',  nameTh: 'รายเดือน',  nameEn: 'Monthly',    tax: 'หัก ณ ที่จ่าย', active: true },
  { id: 'ET002', code: 'EMP-FRONT',    nameTh: 'หน้าร้าน',  nameEn: 'Front Store', tax: 'ไม่หัก',       active: true },
  { id: 'ET003', code: 'EMP-DAILY',    nameTh: 'รายวัน',    nameEn: 'Daily',      tax: 'ไม่หัก',        active: true },
  { id: 'ET004', code: 'EMP-PARTTIME', nameTh: 'พาร์ทไทม์', nameEn: 'Part Time',  tax: 'ไม่หัก',        active: false },
  { id: 'ET005', code: 'EMP-CONTRACT', nameTh: 'เหมาจ่าย',  nameEn: 'Contract',   tax: 'หัก ณ ที่จ่าย', active: false },
];

export const EMPLOYEE_TYPES_STORAGE_KEY = 'g-hub.hr.employee-types';

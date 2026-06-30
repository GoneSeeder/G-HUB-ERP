export type EmployeeDefaults = {
  codePrefix: string;
  codePadding: number;
  defaultEmployeeTypeId: string;
  defaultStatus: string;
  startDateMode: 'today' | 'manual';
};
export const EMPLOYEE_DEFAULTS_STORAGE_KEY = 'g-hub.hr.employee-defaults';
export const EMPLOYEE_DEFAULTS_SEED: EmployeeDefaults = {
  codePrefix: '2',
  codePadding: 4,
  defaultEmployeeTypeId: 'ET001',
  defaultStatus: 'ทดลองงาน',
  startDateMode: 'manual',
};

export type RunningNumberDateToken = 'none' | 'YYYY' | 'YYYYMM';

export type RunningNumberConfig = {
  id: string;
  docLabelTh: string;
  prefix: string;
  dateToken: RunningNumberDateToken;
  padding: number;
  nextNumber: number;
  active: boolean;
};
export const RUNNING_NUMBERS_STORAGE_KEY = 'g-hub.hr.running-numbers';
export const RUNNING_NUMBER_SEED: RunningNumberConfig[] = [
  { id: 'RN-EMP',   docLabelTh: 'รหัสพนักงาน', prefix: '',   dateToken: 'none',   padding: 4, nextNumber: 20029, active: true },
  { id: 'RN-LEAVE', docLabelTh: 'ใบลา',         prefix: 'LV', dateToken: 'YYYYMM', padding: 4, nextNumber: 1,     active: true },
  { id: 'RN-OT',    docLabelTh: 'ใบ OT',        prefix: 'OT', dateToken: 'YYYYMM', padding: 4, nextNumber: 1,     active: true },
];

export type AutoEmpCodeSetting = {
  enabled: boolean;
  mode: 'standard' | 'custom';
  // standard
  standardPadding: number;          // จำนวนหลัก (default 5)
  standardNextNumber: number;       // ลำดับปัจจุบัน
  // custom
  customPrefix: string;             // ตัวอักษรเริ่มต้น
  customPadding: number;            // จำนวนหลัก
  customNextNumber: number;         // ลำดับปัจจุบัน
  customWithYear: boolean;          // นำหน้าด้วยปีปัจจุบัน (ค.ศ.)
};
export const AUTO_EMP_CODE_KEY = 'g-hub.hr.auto-emp-code';
export const AUTO_EMP_CODE_DEFAULT: AutoEmpCodeSetting = {
  enabled: false,
  mode: 'standard',
  standardPadding: 5,
  standardNextNumber: 1,
  customPrefix: '',
  customPadding: 5,
  customNextNumber: 1,
  customWithYear: false,
};
export const EMP_NEXT_NUMBER_KEY = 'g-hub.hr.emp-next-number';

export type MasterOption = { id: string; nameTh: string; nameEn?: string; active: boolean };

export const PREFIX_OPTIONS_STORAGE_KEY      = 'g-hub.hr.master.prefixes';
export const NATIONALITY_OPTIONS_STORAGE_KEY = 'g-hub.hr.master.nationalities';
export const EDUCATION_OPTIONS_STORAGE_KEY   = 'g-hub.hr.master.educations';

export const PREFIX_SEED: MasterOption[] = [
  { id: 'PFX-MR',  nameTh: 'นาย',    nameEn: 'Mr.',   active: true },
  { id: 'PFX-MS',  nameTh: 'นางสาว', nameEn: 'Ms.',   active: true },
  { id: 'PFX-MRS', nameTh: 'นาง',    nameEn: 'Mrs.',  active: true },
];
export const NATIONALITY_SEED: MasterOption[] = [
  { id: 'NAT-TH', nameTh: 'ไทย', nameEn: 'Thai', active: true },
];
export const EDUCATION_SEED: MasterOption[] = [
  { id: 'EDU-BACHELOR', nameTh: 'ปริญญาตรี',  nameEn: "Bachelor's", active: true },
  { id: 'EDU-MASTER',   nameTh: 'ปริญญาโท',   nameEn: "Master's",   active: true },
  { id: 'EDU-PHD',      nameTh: 'ปริญญาเอก',  nameEn: "Doctorate",  active: true },
  { id: 'EDU-DIPLOMA',  nameTh: 'ปวส./อนุปริญญา', nameEn: "Diploma", active: true },
  { id: 'EDU-VOCATIONAL', nameTh: 'ปวช.',     nameEn: "Vocational", active: true },
  { id: 'EDU-HIGH',     nameTh: 'มัธยมศึกษา', nameEn: "High School", active: true },
];

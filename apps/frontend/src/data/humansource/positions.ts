export type JobLevel = {
  id: string;
  nameTh: string;
  nameEn: string;
  rank: number;   // 1 = highest
  active: boolean;
};

export type Position = {
  id: string;
  code: string;
  nameTh: string;
  nameEn: string;
  jobLevelId: string;
  companyId: string;        // '' = ทุกบริษัท
  employeeTypes: string[];  // subset of EMPLOYEE_TYPE_KEYS
  salaryMin: number;        // 0 = ไม่ระบุ
  salaryMax: number;
  overview: string;
  responsibilities: string;
  qualifications: string;
  hasBenefits: boolean;
  active: boolean;
};

export const JOB_LEVELS_STORAGE_KEY = 'g-hub.hr.job-levels';
export const POSITIONS_STORAGE_KEY  = 'g-hub.hr.positions';

export const EMPLOYEE_TYPE_CHIPS: { key: string; label: string }[] = [
  { key: 'part-time',  label: 'พาร์ทไทม์' },
  { key: 'regular',    label: 'นิติกรรม'   },
  { key: 'temp',       label: 'ชั่วคราว'   },
  { key: 'daily',      label: 'รายวัน'     },
  { key: 'permanent',  label: 'ประจำ'      },
];

export const JOB_LEVEL_SEED: JobLevel[] = [
  { id: 'JL-EXEC', nameTh: 'ผู้บริหาร',  nameEn: 'Executive',  rank: 1, active: true },
  { id: 'JL-MGR',  nameTh: 'ผู้จัดการ',  nameEn: 'Manager',    rank: 2, active: true },
  { id: 'JL-SUP',  nameTh: 'หัวหน้างาน', nameEn: 'Supervisor', rank: 3, active: true },
  { id: 'JL-STF',  nameTh: 'พนักงาน',    nameEn: 'Staff',      rank: 4, active: true },
];

const _p = (overrides: Omit<Position, 'companyId' | 'employeeTypes' | 'salaryMin' | 'salaryMax' | 'overview' | 'responsibilities' | 'qualifications' | 'hasBenefits'>): Position => ({
  companyId: '', employeeTypes: [], salaryMin: 0, salaryMax: 0,
  overview: '', responsibilities: '', qualifications: '', hasBenefits: false,
  ...overrides,
});

export const POSITION_SEED: Position[] = [
  _p({ id: 'P001', code: 'EX001', nameTh: 'ผู้บริหาร',     nameEn: 'Executive',   jobLevelId: 'JL-EXEC', active: true  }),
  _p({ id: 'P002', code: 'MG001', nameTh: 'ผู้จัดการ',     nameEn: 'Manager',     jobLevelId: 'JL-MGR',  active: true  }),
  _p({ id: 'P003', code: 'SV001', nameTh: 'หัวหน้างาน',    nameEn: 'Supervisor',  jobLevelId: 'JL-SUP',  active: true  }),
  _p({ id: 'P004', code: 'ST001', nameTh: 'พนักงานขาย',    nameEn: 'Sales Staff', jobLevelId: 'JL-STF',  active: true  }),
  _p({ id: 'P005', code: 'ST002', nameTh: 'พนักงานบัญชี',  nameEn: 'Accountant',  jobLevelId: 'JL-STF',  active: true  }),
  _p({ id: 'P006', code: 'ST003', nameTh: 'พนักงานทั่วไป', nameEn: 'General',     jobLevelId: 'JL-STF',  active: false }),
  _p({ id: 'P007', code: 'ST004', nameTh: 'ผู้อำนวยการ',   nameEn: 'Director',    jobLevelId: 'JL-EXEC', active: true  }),
];

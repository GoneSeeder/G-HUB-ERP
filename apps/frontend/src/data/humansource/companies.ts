export type WorkConditions = {
  payrollDay: number;          // 1..31
  annualCutoffDate: number;    // 1..31
  probationDays: number;
  retirementAge: number;
  workHoursPerDay: number;
  lateThresholdMin: number;
  absentThresholdMin: number;
  currency: string;            // 'THB'
  defaultWorkShiftId: string | null;  // → workShifts.id; reference only
  weeklyHolidays: number[];    // 0=Sun..6=Sat e.g. [0,6]

  // ── Rough draft fields for the redesigned "เงื่อนไขการทำงาน" tab (all optional;
  //    pending detailed audit). UI falls back to sensible defaults when undefined. ──

  // 1) ชั่วโมงทำงานและสถานะการทำงาน
  workDaysPerWeek?: number;

  // 2) คะแนนการเข้างาน
  attendanceScoringEnabled?: boolean;
  attendanceBaseScore?: number;
  attendanceDeductLate?: number;
  attendanceDeductAbsent?: number;
  attendanceDeductLeave?: number;

  // 3) กะทำงาน
  allowShiftChange?: boolean;
  payShiftAllowance?: boolean;
  nightShiftRate?: number;

  // 4) การทดลองงาน
  probationAlertDays?: number;
  probationRequireReview?: boolean;

  // 5) การเกษียณอายุ
  retirementPolicy?: 'birthMonthEnd' | 'fiscalYearEnd' | 'exactDate';
  retirementAlertDays?: number;

  // 6) การพ้นสภาพ
  resignNoticeDays?: number;
  returnAssetsRequired?: boolean;
  payoutRemainingLeave?: boolean;
};

export type Branch = {
  id: string;          // 'BR001'
  code: string;        // 'BO0001'
  nameTh: string;
  nameEn?: string;
  province?: string;
  isHeadOffice: boolean;
  submitSocialSecurity?: boolean;  // นำส่งประกันสังคมในนามสาขานี้
  branchSeq?: string;              // ลำดับที่สาขา (ประกันสังคม/ภงด.) e.g. '000000'
  active: boolean;
};

export type AuthorizedSigner = {
  id: string;
  name: string;
  positionTh: string;
  scope: string;
  active: boolean;
};

export type Company = {
  id: string;          // 'CO001'
  orgNodeId: string;   // → OrgNode(type:'company').id e.g. 'org-ghub'
  legalNameTh: string;
  tradeName: string;   // canonical display name; kept in sync with tree node name
  taxId: string;
  socialSecurityCode: string;
  address?: string;
  active: boolean;
  workConditions: WorkConditions;
  branches: Branch[];
  signers: AuthorizedSigner[];
};

export const COMPANIES_STORAGE_KEY = 'g-hub.hr.companies';

export const COMPANY_SEED: Company[] = [
  {
    id: 'CO001',
    orgNodeId: 'org-ghub',
    legalNameTh: 'บริษัท จี-ฮับ เอ็นเตอร์ไพรส์ จำกัด',
    tradeName: 'G-HUB Enterprise',
    taxId: '0105560000000',
    socialSecurityCode: 'SSO-0001',
    address: '',
    active: true,
    workConditions: {
      payrollDay: 28,
      annualCutoffDate: 31,
      probationDays: 90,
      retirementAge: 60,
      workHoursPerDay: 8,
      lateThresholdMin: 15,
      absentThresholdMin: 240,
      currency: 'THB',
      defaultWorkShiftId: 'WS001',
      weeklyHolidays: [0, 6],
    },
    branches: [
      { id: 'BR001', code: 'BO0001', nameTh: 'สำนักงานใหญ่',   province: 'กรุงเทพฯ',  isHeadOffice: true,  submitSocialSecurity: true, branchSeq: '000000', active: true },
      { id: 'BR002', code: 'BO0002', nameTh: 'สาขาเชียงใหม่', province: 'เชียงใหม่', isHeadOffice: false, submitSocialSecurity: true, branchSeq: '000001', active: true },
      { id: 'BR003', code: 'BO0003', nameTh: 'สาขาภูเก็ต',    province: 'ภูเก็ต',    isHeadOffice: false, submitSocialSecurity: true, branchSeq: '000002', active: true },
    ],
    signers: [
      { id: 'SG001', name: '—', positionTh: 'กรรมการผู้จัดการ', scope: 'เอกสารทั้งหมด', active: true },
    ],
  },
  {
    id: 'CO002',
    orgNodeId: 'org-mhub',
    legalNameTh: 'บริษัท เอ็ม-ฮับ เอ็นเตอร์ไพรส์ จำกัด',
    tradeName: 'M-HUB Enterprise',
    taxId: '0105560000001',
    socialSecurityCode: 'SSO-0002',
    address: '',
    active: true,
    workConditions: {
      payrollDay: 30,
      annualCutoffDate: 31,
      probationDays: 119,
      retirementAge: 60,
      workHoursPerDay: 8,
      lateThresholdMin: 15,
      absentThresholdMin: 240,
      currency: 'THB',
      defaultWorkShiftId: null,
      weeklyHolidays: [0, 6],
    },
    branches: [
      { id: 'BR004', code: 'BO0010', nameTh: 'สำนักงานใหญ่', isHeadOffice: true, submitSocialSecurity: true, branchSeq: '000000', active: true },
    ],
    signers: [],
  },
];

// Approval workflow configuration shared across all HR document types
// (leave, OT, time adjustment, shift change, certificates, etc.).
// Mirrors the Humansoft "ลำดับขั้นการอนุมัติ" page, plus an empeo-style
// per-document override hook that lives in the leave settings.

export type ApprovalMechanism = 'position-structure' | 'per-person';
export type ApprovalSteps = 1 | 2 | 3 | 4 | 5 | 'hr';

export type DocumentApprovalConfig = {
  docType: string;
  labelTh: string;
  mechanism: ApprovalMechanism;
  steps: ApprovalSteps;
};

export type PersonApprover = {
  employeeId: string;
  approverId: string | null;
};

export const DOCUMENT_TYPES_SEED: DocumentApprovalConfig[] = [
  { docType: 'leave',           labelTh: 'เอกสารลางาน',            mechanism: 'position-structure', steps: 2 },
  { docType: 'ot',              labelTh: 'เอกสารโอที',              mechanism: 'position-structure', steps: 2 },
  { docType: 'time-adjust',     labelTh: 'เอกสารจัดการเพิ่มเวลา',   mechanism: 'position-structure', steps: 2 },
  { docType: 'shift-change',    labelTh: 'เอกสารเปลี่ยนกะการทำงาน', mechanism: 'position-structure', steps: 2 },
  { docType: 'holiday-change',  labelTh: 'เอกสารเปลี่ยนวันหยุด',    mechanism: 'position-structure', steps: 2 },
  { docType: 'salary-cert',     labelTh: 'เอกสารรับรองเงินเดือน',   mechanism: 'position-structure', steps: 'hr' },
  { docType: 'employment-cert', labelTh: 'เอกสารรับรองการทำงาน',    mechanism: 'position-structure', steps: 'hr' },
  { docType: 'visa',            labelTh: 'เอกสารการขอวีซ่า',        mechanism: 'position-structure', steps: 'hr' },
  { docType: 'petty-cash',      labelTh: 'เอกสารเบิกเงินสดย่อย',    mechanism: 'position-structure', steps: 'hr' },
  { docType: 'welfare',         labelTh: 'เอกสารสวัสดิการ',         mechanism: 'position-structure', steps: 'hr' },
  { docType: 'resignation',     labelTh: 'เอกสารลาออก',             mechanism: 'position-structure', steps: 'hr' },
];

export const APPROVAL_DOC_CONFIGS_STORAGE_KEY = 'g-hub.hr.approval-doc-configs';
export const APPROVAL_PERSON_MAP_STORAGE_KEY = 'g-hub.hr.approval-person-map';

// Helper used by the approval cards UI to describe the mechanism in Thai.
export function describeApproval(config: DocumentApprovalConfig): string {
  const stepLabel = config.steps === 'hr' ? 'ส่งตรงถึง HR' : `อนุมัติ ${config.steps} ขั้น`;
  const mechanismLabel =
    config.mechanism === 'position-structure'
      ? 'ตามสายบังคับบัญชา'
      : 'ตามผู้อนุมัติที่กำหนดรายคน';
  return `${mechanismLabel} · ${stepLabel}`;
}

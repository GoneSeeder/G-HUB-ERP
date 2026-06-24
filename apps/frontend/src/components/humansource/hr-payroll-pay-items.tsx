'use client';

// 3.4 รายได้ / รายหัก / ข้อมูลบัญชี (Payroll).
// Phase 4 builds the income + deduction tabs; Phase 5 builds the accounting tab.

export type PayItemsTab = 'income' | 'deduction' | 'accounting';

const TAB_LABELS: Record<PayItemsTab, string> = {
  income: 'รายได้',
  deduction: 'รายหัก',
  accounting: 'ข้อมูลบัญชี',
};

export function PayrollPayItems({ accent, tab }: { accent: string; tab: PayItemsTab }) {
  return (
    <div className="p-6">
      <h3 className="text-base font-semibold text-gray-950" style={{ color: accent }}>
        {TAB_LABELS[tab]}
      </h3>
      <p className="mt-2 text-sm text-gray-400">กำลังพัฒนา — ตั้งค่ารายได้ รายหัก และผังบัญชี</p>
    </div>
  );
}

'use client';

export function HrUnderDevelopmentPage({ title }: { title: string }) {
  return (
    <section className="flex min-h-[calc(100vh-176px)] items-center justify-center rounded-[24px] bg-white p-8 text-center shadow-sm shadow-slate-200/80">
      <div>
        <p className="text-sm font-medium text-indigo-500">{title}</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-950">อยู่ในระหว่างพัฒนา</h1>
        <p className="mt-2 text-sm font-light text-slate-500">หน้านี้จะพร้อมใช้งานในลำดับถัดไป</p>
      </div>
    </section>
  );
}

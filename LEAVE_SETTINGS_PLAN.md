# แผนงาน: เมนู 2.5 ตั้งค่าการลา + โมดูลการอนุมัติ (G-HUB HR)

> เอกสารนี้เป็น self-contained spec สำหรับ implement ฟีเจอร์ "ตั้งค่าการลา" และ "ลำดับการอนุมัติ"
> ของ HR module ใน G-HUB อ่านทั้งไฟล์ก่อนเริ่ม แล้วทำตาม Phase ตามลำดับ
> โค้ด/identifier เป็นภาษาอังกฤษ, ข้อความ UI เป็นภาษาไทย (ตาม convention ของโปรเจกต์)

---

## 0. อ่านก่อนเริ่ม (บังคับ)

อ่านไฟล์เหล่านี้ก่อนเพื่อเข้าใจ pattern ที่ต้องทำตาม:

| ไฟล์ | ทำไมต้องอ่าน |
|---|---|
| `apps/frontend/src/components/humansource/AGENTS.md` | กฎ UI ของ HR module — **บังคับทำตาม** |
| `apps/frontend/src/components/humansource/hr-settings-page.tsx` | หน้า settings หลัก, `FocusPage`, `TimeSettingsTable`, `ShiftSettingsBoard` (ดูเป็นตัวอย่าง form+modal ขนาดใหญ่) |
| `apps/frontend/src/components/humansource/hr-holiday-year-calendar.tsx` | ตัวอย่าง component แบบ multi-entity + localStorage persistence + modal + confirm dialog (pattern ใกล้เคียงที่สุด) |
| `apps/frontend/src/components/humansource/hr-time-general.tsx` | ตัวอย่าง section layout, toggle, popover |
| `apps/frontend/src/components/humansource/hr-ui.tsx` | `HrCustomSelect` และ HR controls อื่น ๆ |
| `apps/frontend/src/data/humansource/navigation.ts` | โครง nav + route |
| `apps/frontend/src/data/humansource/thailand-holidays.ts` | ตัวอย่าง seed data + dictionary |
| `apps/frontend/src/app/globals.css` | hr-* semantic classes (ค้นด้วย `hr-holiday-`, `hr-shift-`, `hr-settings-`) |

### กฎเหล็กจาก AGENTS.md
1. ใช้ semantic class `hr-*` ใน `globals.css` — **ห้าม** สร้าง Tailwind class chain ยาว ๆ ซ้ำ ๆ สำหรับ UI ที่ใช้ซ้ำ (Tailwind ใช้ได้เฉพาะ layout one-off เช่น grid/spacing/responsive)
2. **ห้ามใช้ native `<select>/<option>`** — ใช้ `HrCustomSelect` เท่านั้น
3. Custom control (time/color/toggle/checkbox) ต้องรองรับ: popover, selected state, click-outside ปิด, Escape ปิด, dark theme
4. dark theme override scope ใต้ `.hr-theme-dark`
5. ก่อนจบงาน **บังคับรัน**:
   ```powershell
   cd apps/frontend
   .\node_modules\.bin\tsc.cmd --noEmit
   .\node_modules\.bin\eslint.cmd src/components/humansource
   ```
   ทั้งสองต้อง exit 0 (TS strict `noUnusedLocals` เปิดอยู่ → ห้ามมี import/var ที่ไม่ได้ใช้)

### ค่าคงที่สำคัญ
- HR accent (indigo): `#4f46e5` — ใช้กับทุกหน้า detail ของ settings
- `HrCustomSelect` signature: `value: string`, `options: (string | {value,label})[]`, `onChange: (v:string)=>void`, `label?`, `className?`
- localStorage persistence: ทำตาม pattern ใน `hr-holiday-year-calendar.tsx` (hydrate ใน `useEffect` ครั้งเดียว + `hydrated` flag + persist ทุก state change). **ห้ามใช้ `Date.now()` ใน render** (ใช้ได้ใน event handler เท่านั้น)

---

## 1. เป้าหมาย

สร้าง 2 ส่วนที่แยกกันแต่เชื่อมโยงกัน:

1. **เมนู 2.5 ตั้งค่าการลา** (`/humansource/time/leave-types`) — นิยาม "การลาคืออะไร": กฎ, โควตา, ใครมีสิทธิ์
2. **โมดูลการอนุมัติ** (`/humansource/settings/approval-workflows` — route มีอยู่แล้วใน nav group `system`) — นิยาม "ใครอนุมัติ" ของเอกสารทุกประเภท (การลาเป็นแค่ 1 ใน N ประเภท)

**หลักการ:** การอนุมัติเป็นโมดูลกลาง keyed by *ประเภทเอกสาร* ไม่ฝังในการลา การลาแค่ "อ้างอิง" สาย approval ของ "เอกสารลางาน" โดย default และ override ได้

---

## 2. ความรู้ domain — ประเภทการลาไทย + เงื่อนไข

### กลุ่ม A: ตามกฎหมาย (preset, มี default ตายตัว, `statutory: true`)

| การลา (nameTh) | nameEn | ฐานกฎหมาย | โควตา default | เงื่อนไขเฉพาะ |
|---|---|---|---|---|
| ลาป่วย | Sick Leave | ม.32/57 | 30 วัน/ปี (จ่าย) | ลา ≥3 วันติดกัน → บังคับแนบใบรับรองแพทย์; เกิน 30 = ไม่จ่าย |
| ลากิจธุระจำเป็น | Personal Leave | ม.34 | 3 วัน/ปี (จ่าย) | ส่วนเกิน → ไม่จ่าย |
| ลาพักร้อน | Annual Leave | ม.30 | tenure-tier (เริ่ม 6 วัน) | ครบ 1 ปีจึงมีสิทธิ์; โพรเรตปีแรก; สะสม/ยกยอด |
| ลาคลอด | Maternity Leave | ม.41/59 | 98 วัน/ครรภ์ | เพศหญิง; นับวันปฏิทิน; จ่าย 45 วัน (partial) |
| ลาทำหมัน | Sterilization Leave | ม.33 | ตามแพทย์ (medical) | แนบใบรับรองแพทย์ |
| ลารับราชการทหาร | Military Service Leave | ม.35/58 | 60 วัน/ปี (จ่าย) | เพศชาย; แนบหมายเรียก |
| ลาฝึกอบรม | Training Leave | ม.36 | กำหนดเอง (มักไม่จ่าย) | ต้องอนุมัติล่วงหน้า |

### กลุ่ม B: สวัสดิการ (custom, `statutory: false`)
ลาบวช, ลาสมรส, ลาฌาปนกิจ/งานศพ, ลาวันเกิด, ลาดูแลบุตรป่วย, ลาเลี้ยงดูบุตร, ลาไม่รับค่าจ้าง (LWOP)

### 6 แกนเงื่อนไข (ทุกการลาประกอบจากแกนเดียวกัน ต่างแค่ค่า)
1. **โควตา** — fixed / tenure-tier / unlimited(ป่วย) / medical(ตามแพทย์)
2. **การจ่าย** — paid / unpaid / partial(คลอด 45 วัน)
3. **การยื่น** — ขั้นต่ำนาที, ล่วงหน้า/ย้อนหลัง, ลาติดกันสูงสุด, ครึ่งวัน, แนบไฟล์
4. **คุณสมบัติผู้ลา** — เพศ, ผ่านทดลองงาน, อายุงานขั้นต่ำ, ตำแหน่ง/แผนก/รายคน
5. **การคำนวณ** — นับวันทำงาน vs ปฏิทิน, นับวันหยุดเป็นวันลา, ตัดรอบ, โพรเรต, ปัดเศษ, สะสมข้ามปี+cap+หมดอายุ
6. **การอนุมัติ** — อ้างอิง template (ดูโมดูล 2)

---

## 3. Data Model (TypeScript)

สร้างไฟล์ `apps/frontend/src/data/humansource/leave-types.ts`:

```ts
export type LeavePayType = 'paid' | 'unpaid' | 'partial';
export type LeaveQuotaMode = 'fixed' | 'tenure-tier' | 'unlimited' | 'medical';
export type LeaveUnit = 'day' | 'hour';
export type LeaveCountBasis = 'working-day' | 'calendar-day';
export type LeaveRounding = 'none' | 'half' | 'full-day' | 'full-hour';
export type LeaveGender = 'all' | 'male' | 'female';
export type LeaveCutoffBasis = 'hire-date' | 'fiscal-year';

export type TenureTier = {
  minMonths: number;          // อายุงานขั้นต่ำ (เดือน)
  maxMonths: number | null;   // null = ไม่จำกัด
  days: number;               // จำนวนวันที่ได้
};

export type LeaveRules = {
  payType: LeavePayType;
  partialPaidDays?: number;   // เช่นคลอด 45
  countBasis: LeaveCountBasis;
  countHolidayAsLeave: boolean;
  minMinutes: number;         // ขั้นต่ำนาทีในการลา
  allowHalfDay: boolean;
  advanceDays: number;        // ลาล่วงหน้าได้กี่วัน
  backdateDays: number;       // ลาย้อนหลังได้กี่วัน
  maxConsecutiveDays: number | null;  // null = ไม่จำกัด
  requireAttachment: boolean;
  requireAttachmentOverDays: number | null; // แนบบังคับเมื่อ >= N วัน
  rounding: LeaveRounding;
  carryOver: boolean;
  carryOverCap: number | null;
  carryOverExpiryMonths: number | null;
};

export type LeaveEligibility = {
  gender: LeaveGender;
  requirePassProbation: boolean;
  minTenureMonths: number;
  positions: string[];    // [] = ทุกตำแหน่ง
  departments: string[];  // [] = ทุกแผนก
  employees: string[];    // [] = ไม่ระบุรายคน
};

export type LeaveQuotaByEmployeeType = {
  mode: LeaveQuotaMode;
  fixedDays?: number;
  tiers?: TenureTier[];
};

export type LeaveQuota = {
  mode: LeaveQuotaMode;
  fixedDays?: number;
  tiers?: TenureTier[];
  // override ต่อประเภทพนักงาน (key = employee type id เช่น 'monthly'|'daily'|'contract')
  perEmployeeType?: Record<string, LeaveQuotaByEmployeeType>;
  prorateFirstYear: boolean;
  cutoffBasis: LeaveCutoffBasis;
};

export type LeaveApproval = {
  useDefaultTemplate: boolean;  // ใช้สาย "เอกสารลางาน"
  templateDocType: string | null; // override → อ้างอิง doc type อื่น (ปกติ null)
  steps?: number | 'hr';        // override จำนวนขั้นเฉพาะการลานี้ (optional)
};

export type LeaveType = {
  id: string;
  code: string;       // เช่น 'SICK', 'ANNUAL'
  nameTh: string;
  nameEn: string;
  tag: string;
  color: string;      // hex
  unit: LeaveUnit;
  statutory: boolean; // true = กลุ่มกฎหมาย
  enabled: boolean;
  rules: LeaveRules;
  eligibility: LeaveEligibility;
  quota: LeaveQuota;
  approval: LeaveApproval;
};
```

เพิ่ม `LEAVE_TYPE_SEED: LeaveType[]` ในไฟล์เดียวกัน — ใส่กลุ่ม A ทั้ง 7 ตัวพร้อมค่า default ที่ถูกต้องตามตารางข้อ 2 (เช่น ลาคลอด `gender:'female'`, `payType:'partial'`, `partialPaidDays:45`, `countBasis:'calendar-day'`, `fixedDays:98`; ลาพักร้อน `mode:'tenure-tier'` พร้อม tiers ตัวอย่าง `[{0,12,0},{12,36,6},{36,60,8},{60,null,10}]`, `carryOver:true`).

โมเดลโมดูลอนุมัติ สร้างไฟล์ `apps/frontend/src/data/humansource/approval-workflows.ts`:

```ts
export type ApprovalMechanism = 'position-structure' | 'per-person';
export type ApprovalSteps = 1 | 2 | 3 | 4 | 5 | 'hr';

export type DocumentApprovalConfig = {
  docType: string;     // 'leave' | 'ot' | 'time-adjust' | 'shift-change' | ...
  labelTh: string;     // 'เอกสารลางาน'
  mechanism: ApprovalMechanism;
  steps: ApprovalSteps;
};

export type PersonApprover = {
  employeeId: string;
  approverId: string | null;
};

export const DOCUMENT_TYPES_SEED: DocumentApprovalConfig[] = [
  { docType: 'leave',        labelTh: 'เอกสารลางาน',         mechanism: 'position-structure', steps: 2 },
  { docType: 'ot',           labelTh: 'เอกสารโอที',           mechanism: 'position-structure', steps: 2 },
  { docType: 'time-adjust',  labelTh: 'เอกสารจัดการเพิ่มเวลา', mechanism: 'position-structure', steps: 2 },
  { docType: 'shift-change', labelTh: 'เอกสารเปลี่ยนกะการทำงาน', mechanism: 'position-structure', steps: 2 },
  { docType: 'holiday-change', labelTh: 'เอกสารเปลี่ยนวันหยุด', mechanism: 'position-structure', steps: 2 },
  { docType: 'salary-cert',  labelTh: 'เอกสารรับรองเงินเดือน', mechanism: 'position-structure', steps: 'hr' },
  { docType: 'employment-cert', labelTh: 'เอกสารรับรองการทำงาน', mechanism: 'position-structure', steps: 'hr' },
  { docType: 'visa',         labelTh: 'เอกสารการขอวีซ่า',      mechanism: 'position-structure', steps: 'hr' },
  { docType: 'petty-cash',   labelTh: 'เอกสารเบิกเงินสดย่อย',  mechanism: 'position-structure', steps: 'hr' },
  { docType: 'welfare',      labelTh: 'เอกสารสวัสดิการ',       mechanism: 'position-structure', steps: 'hr' },
  { docType: 'resignation',  labelTh: 'เอกสารลาออก',           mechanism: 'position-structure', steps: 'hr' },
];
```

**localStorage keys** (ทำตาม pattern holiday calendar):
- `g-hub.hr.leave-types`
- `g-hub.hr.approval-doc-configs`
- `g-hub.hr.approval-person-map`

---

## 4. สถาปัตยกรรม UI

### 4.1 หน้า 2.5 ตั้งค่าการลา — master-detail + 3 internal tabs

**สำคัญ:** nav item `leave-types` ปัจจุบันมี `children` 3 ตัว (ประเภทการลา/นโยบายและโควตา/รอบสะสม) ซึ่ง `FocusPage` จะ render เป็น tab อัตโนมัติ — **ไม่ตรง** กับดีไซน์เรา

**วิธีแก้:**
1. ใน `navigation.ts` ลบ `children` ของ item `ตั้งค่าการลา` (ให้เหลือ item เดียวไม่มี children) — เหมือน `work-schedules`
2. ใน `hr-settings-page.tsx` ที่ตัวแปร `showTabs` (อยู่ใน `FocusPage`) เพิ่มเงื่อนไขซ่อน auto-tabs สำหรับ path `leave-types` (ดู `work-schedules` เป็นตัวอย่าง — มันเช็ค `activeTopic.path !== '/humansource/time/work-schedules'`)
3. ใน `TimeSettingsTable` (`hr-settings-page.tsx` ~บรรทัด 465) เพิ่ม branch **ก่อน** `getTimeSettingsView`:
   ```tsx
   if (activeItem.path.includes('leave-types')) {
     return <LeaveSettings accent={accent} />;
   }
   ```
   (วางคู่กับ `holiday-calendar` / `general` ที่มีอยู่แล้ว)

**โครงภายใน `LeaveSettings`** (component ใหม่ ไฟล์ `hr-leave-settings.tsx`):
```
┌─────────────────────────────────────────────────────────┐
│ [ซ้าย ~260px] รายการประเภทการลา        │ [ขวา] รายละเอียด │
│  + ปุ่ม "เพิ่มประเภทการลา"              │  3 internal tabs │
│  filter: ทุกบริษัท ▾                    │                  │
│  • ลาป่วย          (30 วัน) [●enabled]  │  Tab1 การลา      │
│  • ลากิจ           (3 วัน)              │  Tab2 สิทธิ์การลา │
│  • ลาพักร้อน       (tier)              │  Tab3 เงื่อนไขอนุมัติ│
│  • ... (เลือกได้ active state indigo)   │                  │
└─────────────────────────────────────────────────────────┘
```

#### Tab 1 — การลา (Rules)
- ชื่อการลา / ชื่อ (Eng) / Tag / สีประจำการลา (color picker — reuse pattern `ShiftColorPicker` ใน hr-settings-page หรือ color swatch แบบ holiday)
- หน่วย (วัน/ชั่วโมง) — HrCustomSelect
- การจ่ายค่าจ้าง (รับ/ไม่รับ/รับบางส่วน) — ถ้า partial โชว์ช่อง "จ่ายกี่วัน"
- นับวันทำงาน/ปฏิทิน — HrCustomSelect
- toggle: นับวันหยุดเป็นวันลา
- ขั้นต่ำนาทีในการลา (number)
- ลาล่วงหน้า / ย้อนหลัง (number วัน)
- ลาติดต่อกันสูงสุด (number, มี toggle "ไม่จำกัด")
- toggle: ลาครึ่งวันได้
- toggle: ต้องแนบไฟล์ + (ถ้าเปิด) ช่อง "บังคับเมื่อลา ≥ N วัน"
- ปัดเศษ (ไม่ปัด/ครึ่งวัน/เต็มวัน/เต็มชั่วโมง) — HrCustomSelect
- toggle: สะสมข้ามปี + (ถ้าเปิด) cap + เดือนหมดอายุ

#### Tab 2 — สิทธิ์การลา (Eligibility + Quota)
- **ใครใช้ได้:** เพศ (ทั้งหมด/ชาย/หญิง), toggle ผ่านทดลองงาน, อายุงานขั้นต่ำ (เดือน), multi-select ตำแหน่ง/แผนก, ระบุรายคน (chip input)
- **โควตา:** เลือก mode (fixed/tenure-tier/unlimited/medical)
  - fixed → ช่องจำนวนวัน
  - tenure-tier → **ตารางแก้ไขได้**: แถวละ [อายุงานตั้งแต่(เดือน)] [ถึง] [จำนวนวัน] + ปุ่มเพิ่ม/ลบแถว
  - unlimited/medical → ไม่ต้องกรอกจำนวน (แสดงคำอธิบาย)
- toggle/section: แยกโควตาตามประเภทพนักงาน (รายเดือน/รายวัน/เหมาจ่าย) — ถ้าเปิด แสดง quota config ต่อ type
- toggle: โพรเรตปีแรก
- วันตัดรอบ (วันเริ่มงาน/ปีงบประมาณ) — HrCustomSelect

#### Tab 3 — เงื่อนไขการอนุมัติ (Approval)
- แสดง summary สาย "เอกสารลางาน" จากโมดูล 2 (read-only preview: เช่น "ตามโครงสร้างตำแหน่ง · 2 ขั้น")
- toggle: `[✓] ใช้ค่ามาตรฐานของเอกสารลางาน` / `[ ] กำหนดเองเฉพาะการลานี้`
- ถ้า override → ให้เลือก จำนวนขั้น (1-5/HR) เฉพาะการลานี้
- ลิงก์ "ไปตั้งค่าลำดับการอนุมัติ →" ชี้ไป `/humansource/settings/approval-workflows`

**โหมดสร้าง/แก้ไข:** ทำได้ 2 แบบ เลือกอย่างใดอย่างหนึ่ง (แนะนำแบบ A เพื่อความเรียบ):
- **A) Inline edit** — เลือกการลาจาก list ซ้าย แล้วแก้ที่ 3 tabs ขวาเลย (auto-save เข้า state/localStorage) — เหมือน empeo
- **B) Fullscreen modal** — กด "เพิ่ม/แก้ไข" เปิด fullscreen form แบบ `ShiftSettingsBoard` create modal

### 4.2 โมดูลการอนุมัติ — `/humansource/settings/approval-workflows`

route นี้อยู่ใน group `system` แล้ว (nav บรรทัด ~256) — `SettingsWorkbench` ปัจจุบัน group `system` render `SystemUsersTable` เป็น fallback ทุก path ต้องเพิ่ม branch ตรวจ path `approval-workflows` → render `<ApprovalWorkflowSettings />` (component ใหม่ ไฟล์ `hr-approval-workflows.tsx`)

**2 หน้าย่อย (sub-tab ภายใน component):**

#### หน้า 1 — ลำดับขั้นการอนุมัติ (ตั้งต่อประเภทเอกสาร)
- list การ์ดของ `DOCUMENT_TYPES_SEED` แต่ละใบมี:
  - ชื่อเอกสาร (labelTh) + icon
  - radio กลไก: `◯ ตามโครงสร้างตำแหน่ง` / `◯ กำหนดรายบุคคล`
  - radio จำนวนขั้น: `1/2/3/4/5 ขั้น` หรือ `HR`
  - คำอธิบายใต้ radio (เช่น "อนุมัติตามสายบังคับบัญชา N ขั้น")

#### หน้า 2 — กำหนดผู้อนุมัติรายบุคคล
- ตาราง: พนักงาน (ดึง mock จาก `@/data/humansource/mock` → `employees`) | แผนก | ตำแหน่ง | **ผู้อนุมัติ** (HrCustomSelect เลือกพนักงานคนอื่นเป็นหัวหน้า)
- บันทึกเป็น `PersonApprover[]` ใน localStorage
- (ไม่ต้องทำ import .xlsx จริง — ใส่ปุ่ม placeholder "นำเข้า .xlsx" disabled ไว้ก่อน + comment TODO)
- ระบบไต่ chain: employee → approver → approver-ของ-approver ตามจำนวนขั้น (logic นี้เป็นของ runtime การลาจริง ซึ่ง**ยังไม่ต้องทำ** — แค่เก็บ config)

---

## 5. Phase การ build (ทำตามลำดับ, commit แยก phase ได้)

| Phase | งาน | ไฟล์ | Acceptance |
|---|---|---|---|
| **1** | Data model + seed | `data/humansource/leave-types.ts`, `data/humansource/approval-workflows.ts` | tsc ผ่าน, seed กลุ่ม A ครบ 7 ตัว ค่าถูกตามตารางข้อ 2 |
| **2** | nav + routing hook | `navigation.ts` (ลบ children leave-types), `hr-settings-page.tsx` (showTabs + branch `LeaveSettings`) | เปิด `/humansource/time/leave-types` เห็น component ใหม่ ไม่มี auto-tab ซ้อน |
| **3** | `LeaveSettings` Tab 1 (การลา) + master list + localStorage | `hr-leave-settings.tsx`, `globals.css` (`hr-leave-*`) | เลือก/เพิ่ม/แก้ชื่อการลาได้, persist, รีโหลดแล้วอยู่ |
| **4** | Tab 2 (สิทธิ์ + โควตา tenure-tier table + per-employee-type) | เพิ่มใน `hr-leave-settings.tsx` | แก้ tier table เพิ่ม/ลบแถวได้, persist |
| **5** | โมดูลอนุมัติ หน้า 1 (doc-type config) | `hr-approval-workflows.tsx`, hook ใน `SettingsWorkbench` group system | ตั้งกลไก+จำนวนขั้นต่อเอกสารได้, persist |
| **6** | โมดูลอนุมัติ หน้า 2 (person→approver map) | เพิ่มใน `hr-approval-workflows.tsx` | map ผู้อนุมัติรายคนได้, persist |
| **7** | Tab 3 (ผูก approval + override) | เพิ่มใน `hr-leave-settings.tsx` | แสดง summary จาก doc-config "leave", override ได้ |

แต่ละ Phase จบด้วยการรัน `tsc --noEmit` + `eslint src/components/humansource` (exit 0)

---

## 6. แนวทาง implement ที่ต้องระวัง

- **CSS:** สร้าง semantic class ใหม่ prefix `hr-leave-*` และ `hr-approval-*` ใน `globals.css` ตามแนว `hr-holiday-*` / `hr-shift-*` ที่มีอยู่ — มี dark theme override ใต้ `.hr-theme-dark` ด้วย
- **โครงหน้าไม่ scroll ทั้งหน้า:** หน้า settings ห่อด้วย flex chain ที่ทำให้ workbench สูงเต็ม viewport แล้ว (ดู `FocusPage`) — component ใหม่ควรจัดการ scroll ภายในตัวเอง (เช่น list ซ้าย scroll, detail ขวา scroll แยก) ไม่ปล่อยให้ดันความสูงทั้งหน้า
- **ห้าม native select** — dropdown ทุกตัวใช้ `HrCustomSelect`
- **ห้าม `Date.now()`/`Math.random()` ใน render path** — ใช้เฉพาะใน event handler (เช่นตอนสร้าง id `leave-${Date.now()}`)
- **employee types** สำหรับ per-employee-type quota: ใช้รายการจาก mock ที่มี (ค้น `employeeTypes` ใน `@/data/humansource/mock`) หรือ hardcode `['รายเดือน','รายวัน','เหมาจ่าย']` ถ้าหาไม่เจอ
- **positions/departments** สำหรับ eligibility: ดึงจาก mock (`positions`, org structure) ถ้ามี — ถ้าไม่มีให้ใช้ list คงที่ชั่วคราว + comment TODO
- **backward compat:** ถ้าแก้ shared component (`hr-ui.tsx`) ต้อง backward compatible และไม่กระทบหน้าอื่น
- **ความสอดคล้อง HR style:** flat, indigo accent `#4f46e5`, neutral gray palette, ไม่มี gradient/glow (ดูหน้า employees + settings detail เป็นมาตรฐาน)

---

## 7. สิ่งที่ยัง**ไม่ต้อง**ทำใน scope นี้
- ไม่ต้องทำ runtime การขอลาจริง / การคำนวณโควตาคงเหลือ / engine ไต่ chain อนุมัติ — แค่เก็บ "config"
- ไม่ต้องทำ import .xlsx จริง (placeholder disabled พอ)
- ไม่ต้องต่อ backend/API — ใช้ localStorage + seed (เหมือน holiday calendar)
- ไม่ต้องผูกกับหน้าสร้างพนักงาน (การเลือกปฏิทิน/การลาตอน assign พนักงาน เป็น scope แยก)

---

## 8. Definition of Done
- [ ] เปิด `/humansource/time/leave-types` เห็น master-detail + 3 tabs ทำงานครบ
- [ ] preset กลุ่ม A 7 ตัวแสดงครบ ค่า default ถูกต้อง (ลาคลอดเพศหญิง partial 45, พักร้อน tenure-tier ฯลฯ)
- [ ] เพิ่ม/แก้/ลบการลา custom ได้ + persist localStorage
- [ ] tenure-tier table แก้แถวได้
- [ ] เปิด `/humansource/settings/approval-workflows` ตั้งกลไก+ขั้นต่อเอกสาร + map ผู้อนุมัติรายคนได้ + persist
- [ ] Tab 3 ผูก/override approval ได้
- [ ] `tsc --noEmit` exit 0 และ `eslint src/components/humansource` exit 0
- [ ] UI เป็น HR style (hr-* classes, HrCustomSelect, ไม่มี native select, indigo accent), รองรับ dark theme

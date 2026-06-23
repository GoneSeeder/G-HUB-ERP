# HR Direct Login & G-HUB Linking Plan

## เป้าหมาย

เพิ่มทางเข้า Module HR โดยตรง โดยไม่บังคับว่าผู้ใช้ต้องเข้าผ่าน G-HUB เสมอ แต่ยังต้องควบคุมให้บัญชี HR ผูกกับข้อมูลพนักงาน/บริษัทอย่างถูกต้องก่อนเห็นข้อมูล HR จริง

## สรุปแนวทางที่แนะนำ

แนะนำให้ใช้แนวทาง **HR Account แยกได้ + G-HUB Link เป็น optional**

เหตุผล:
- คนที่ไม่ได้ใช้ G-HUB ยังเข้า HR ได้ด้วย Email/Password ของ HR เอง
- คนที่มี G-HUB สามารถเชื่อมบัญชีเพื่อกลับไปใช้ ecosystem เดิมได้
- ข้อมูลพนักงานใน HR ยังเป็น source หลักของสิทธิ์ HR ไม่ให้ใครสมัครเองแล้วเข้าบริษัทได้ทันที
- รองรับอนาคตที่ HR module อาจขาย/ใช้งานแยกจาก G-HUB

## Choice สำหรับการตัดสินใจ

1. ใช้ G-HUB Account อย่างเดียว  
   ง่ายสุด แต่ไม่รองรับผู้ใช้ HR-only

2. HR Account แยก + เชื่อม G-HUB ได้ภายหลัง  
   แนะนำ ใช้งานยืดหยุ่นและไม่ผูก HR กับ G-HUB แน่นเกินไป

3. Invite-only ทุกกรณี  
   ปลอดภัยมาก แต่ onboarding ช้ากว่า และ HR ต้องจัดการ invite ทุกคน

4. SSO/Enterprise identity ตั้งแต่แรก  
   เหมาะกับองค์กรใหญ่ แต่ scope ใหญ่เกินสำหรับตอนนี้

**แนะนำข้อ 2** โดยใช้ invitation/approval เป็นตัวควบคุมก่อนเข้าข้อมูลบริษัท

## การตัดสินใจที่ยืนยันแล้ว (Confirmed Decisions)

> สรุปจากการ review กับเจ้าของงาน — ข้อกำหนดเหล่านี้มีผลเหนือกว่าส่วนอื่นเมื่อขัดกัน

1. **Backend & Auth:** ใช้ backend และระบบ auth เดิม (ตัวเดียวกับ `app/(auth)/login/page.tsx`) — **ไม่สร้างระบบ auth ใหม่**
   - HR Account เก็บใน backend เดิม เพิ่มเฉพาะ table ที่เกี่ยวกับ HR (HR Account, HR Membership, G-HUB Link, Employee Link Code)
   - reuse token/cookie เดิม (`setAuthTokenCookie`) — ต่างกันแค่ปลายทางหลัง login คือ HR module
   - **สิ่งที่ทำใหม่ฝั่ง frontend คือหน้า Login แยก (`/humansource/login`) เท่านั้น** ไม่ใช่ระบบ login ใหม่ทั้งระบบ

2. **ปุ่ม "กลับ G-HUB"** ใน `hr-shell.tsx` (ตอนนี้โชว์ตลอด) → เปลี่ยนเป็นโชว์ตามเงื่อนไข link state (ดู Flow 4)

3. **หน้าเพิ่มพนักงาน:** ตัด UI สร้างบัญชี/คำเชิญออกทั้งหมด → ใช้โมเดล **"User สมัคร HR Account เอง แล้ว HR gen code ผูกบัญชีกับข้อมูลพนักงาน"** (ดู Flow 5 ที่อัปเดต + Employee Link Code Flow)

## Account Model ที่ควรใช้

### 1. G-HUB User

บัญชีเดิมของระบบ G-HUB

ตัวอย่าง field:
- `id`
- `email`
- `name`
- `avatar`
- `status`

### 2. HR Account

บัญชีที่ใช้ login HR โดยตรง

ตัวอย่าง field:
- `id`
- `email`
- `passwordHash`
- `displayName`
- `phone`
- `status`: `active`, `pending`, `disabled`
- `createdFrom`: `hr_signup`, `invite`, `ghub_link`

### 3. Employee Profile

ข้อมูลพนักงานใน Module HR

ตัวอย่าง field:
- `id`
- `companyId`
- `employeeCode`
- `name`
- `email`
- `phone`
- `position`
- `employmentStatus`

### 4. HR Membership

สิทธิ์การใช้งาน HR ต่อบริษัท/tenant

ตัวอย่าง field:
- `id`
- `hrAccountId`
- `employeeId`
- `companyId`
- `role`
- `status`: `invited`, `active`, `pending_approval`, `disabled`

### 5. G-HUB Link

ความสัมพันธ์ระหว่าง G-HUB User กับ HR Account/Employee

ตัวอย่าง field:
- `ghubUserId`
- `hrAccountId`
- `employeeId`
- `companyId`
- `linkedAt`
- `status`: `linked`, `pending`, `revoked`

## Login Routes ที่ควรมี

### `/humansource/login`

หน้า Login สำหรับเข้า HR โดยตรง

ควรมี:
- Email
- Password
- ปุ่มเข้าสู่ระบบ
- ลิงก์ `สมัครใช้งาน HR`
- ลิงก์ `มีคำเชิญแล้ว`
- ลิงก์ `ลืมรหัสผ่าน`
- ปุ่มรอง `เข้าสู่ระบบด้วย G-HUB` เฉพาะถ้าต้องการให้คนที่มี G-HUB link ได้ง่าย

หลัก UI:
- ไม่ทำเป็น landing page
- ไม่มี hero ใหญ่หรือ copy การตลาด
- ใช้ layout แบบ focused auth surface
- ขวา/ล่างอาจมี panel แสดง company/invitation context ได้ แต่ไม่ควรเป็นภาพตกแต่งเยอะ
- wording ต้องชัดว่า login นี้เข้า HR ไม่ใช่ G-HUB หลัก

### `/humansource/invite`

หน้ารับคำเชิญ

ใช้เมื่อ HR ส่ง invite ให้พนักงาน

Flow:
1. User เปิดลิงก์ invite
2. ระบบแสดงบริษัท + ชื่อพนักงานที่กำลังจะเชื่อม
3. User สร้าง HR Account หรือ login HR Account เดิม
4. ระบบผูก HR Account กับ Employee Profile
5. ถ้า User มี G-HUB อยู่แล้ว ค่อยถามว่าจะเชื่อม G-HUB ด้วยไหม

### `/humansource/link-ghub`

หน้าเชื่อม G-HUB กับ HR

ใช้เมื่อ:
- User เข้าจาก G-HUB แล้ว HR ยังไม่รู้จัก employee profile
- User HR-only ต้องการเปิดปุ่มกลับ G-HUB

## Flow 1: User เข้าผ่าน G-HUB แต่ยังไม่ผูก HR

สถานะ:
- มี G-HUB session
- ยังไม่มี `G-HUB Link`
- ยังไม่มี HR Membership ที่ active

ผลลัพธ์:
- ห้ามเข้า HR dashboard/ข้อมูลจริง
- แสดงหน้า `เชื่อมต่อกับข้อมูลพนักงาน`

UI ที่ควรมี:
- แสดง email/name จาก G-HUB
- ช่องกรอก invitation code หรือ invite link
- ปุ่ม `ขอเชื่อมต่อกับข้อมูลพนักงาน`
- ปุ่ม `ติดต่อ HR`
- ข้อความสั้นๆ ว่า HR ต้องยืนยันก่อนเข้าข้อมูลบริษัท

วิธีเชื่อมที่แนะนำ:
1. ถ้ามี invite token: เชื่อมทันทีหลังยืนยันตัวตน
2. ถ้า email ตรงกับ Employee Profile: สร้างคำขอให้ HR approve
3. ถ้าไม่พบ employee: แจ้งให้ติดต่อ HR

ไม่แนะนำ:
- ไม่ควร auto-link แค่เพราะ email เหมือนกันโดยไม่มี invite/approval เพราะ HR data เป็นข้อมูลสำคัญ

## Flow 2: สมัคร HR Account แยก

สถานะ:
- ไม่มี G-HUB ก็สมัคร HR Account ได้
- แต่ยังเข้า company data ไม่ได้จนกว่าจะมี invitation หรือ HR approve

แนวทางที่แนะนำ:
- ปุ่ม `สมัครใช้งาน HR` สร้าง HR Account ได้
- หลังสมัครเสร็จให้สถานะเป็น `pending`
- ถ้ายังไม่ผูกกับ Employee Profile ให้เข้าหน้า `ไม่มีข้อมูลบริษัท`
- User ต้องกรอก employee link code หรือรอ HR approve ก่อนเข้าบริษัท

UI หลังสมัคร:
- หน้า `ไม่มีข้อมูลบริษัท`
- แสดง email ที่สมัคร
- ปุ่ม `กรอกรหัสเชื่อมต่อ`
- ปุ่ม `ขอสิทธิ์จาก HR`
- ไม่แสดง sidebar HR เต็มจนกว่าจะ active

### Employee Link Code Flow

ฟันธงใช้ flow นี้:
- User สมัคร HR Account ได้ก่อน
- ถ้ายังไม่ผูกกับข้อมูลพนักงาน ให้ระบบแสดงหน้า `ไม่มีข้อมูลบริษัท`
- ในหน้านี้มีปุ่ม `กรอกรหัสเชื่อมต่อ`
- HR เป็นคนสร้าง code จากข้อมูลพนักงานใน Employee Table
- User นำ code มาใช้เพื่อผูก HR Account กับ Employee Profile

รูปแบบ code:
- 6 หลัก ผสมตัวอักษรอังกฤษและตัวเลข เช่น `A7K3P9`
- ใช้ได้ครั้งเดียวเท่านั้น
- สร้าง code ใหม่แล้ว code เก่าของพนักงานคนนั้นต้องถูกยกเลิกทันที
- ผูก code กับ `employeeId`, `companyId`, และ `createdByHrAccountId`
- ไม่ควรเก็บ code เป็น plain text ใน database ให้เก็บแบบ hash

อายุของ code:
- ควรจำกัดเวลา
- ค่า default ที่แนะนำ: 10 นาที
- เหตุผล: 3 นาทีปลอดภัยกว่าแต่ใช้งานจริงอาจสั้นเกินไป ถ้า HR ต้องส่งให้พนักงานผ่านแชต/โทรศัพท์/เดินไปแจ้ง
- ถ้าเป็นการแสดง code ต่อหน้า HR และพนักงานอยู่ด้วยกัน สามารถตั้งเป็น 3-5 นาทีได้ในอนาคต

Security rule:
- จำกัดการกรอกผิด เช่น 5 ครั้งต่อ 10 นาที
- ถ้า code หมดอายุ ให้ User ขอ code ใหม่จาก HR
- ถ้า code ถูกใช้แล้ว ห้ามใช้ซ้ำ
- บันทึก audit log ตอนสร้าง code, ยกเลิก code, ใช้ code สำเร็จ, ใช้ code ไม่สำเร็จ
- ก่อนผูกสำเร็จ ห้ามแสดงข้อมูลบริษัทหรือข้อมูลพนักงานเต็มให้ User เห็น

หน้า `ไม่มีข้อมูลบริษัท` ควรมี:
- ข้อความ `บัญชี HR ของคุณยังไม่ได้เชื่อมกับข้อมูลพนักงาน`
- ข้อความรอง `กรุณากรอกรหัสเชื่อมต่อ 6 หลักที่ได้รับจาก HR`
- ปุ่ม `กรอกรหัสเชื่อมต่อ`
- ปุ่ม `ขอรหัสจาก HR`
- ปุ่ม `ออกจากระบบ`

Employee Table action:
- ในคอลัมน์ `บัญชี` หรือ icon เชื่อมต่อ ให้ HR กดได้
- ถ้าพนักงานยังไม่ผูก HR Account ให้มี action `สร้างรหัสเชื่อมต่อ`
- หลังสร้าง แสดง code ตัวใหญ่ เช่น `A7K3P9`
- แสดง countdown อายุ code เช่น `หมดอายุใน 09:59`
- มีปุ่ม `คัดลอก`, `สร้างใหม่`, `ยกเลิกรหัส`

## Flow 3: Employee Table แสดงสถานะเชื่อมต่อ G-HUB

ในตารางข้อมูลพนักงาน เพิ่มคอลัมน์ `บัญชี`

รูปแบบ icon:
- Icon G-HUB สีเต็ม: เชื่อม G-HUB แล้ว
- Icon G-HUB สีเทา: ยังไม่เชื่อม G-HUB
- Icon mail/lock สีเขียว: มี HR Account active
- Icon clock สีเหลือง: ส่ง invite แล้ว รอตอบรับ
- Icon warning สีแดง/เทาเข้ม: account disabled หรือ link มีปัญหา

ควรมี tooltip:
- `เชื่อมต่อ G-HUB แล้ว`
- `ยังไม่เชื่อมต่อ G-HUB`
- `ส่งคำเชิญแล้ว`
- `มีบัญชี HR แล้ว`

ควรมี filter:
- `เชื่อม G-HUB แล้ว`
- `ยังไม่เชื่อม G-HUB`
- `มีบัญชี HR`
- `รอรับคำเชิญ`

## Flow 4: Sidebar ปุ่มกลับ G-HUB

เงื่อนไขการแสดงปุ่ม `กลับ G-HUB`:

แสดงเมื่อ:
- User login ผ่าน G-HUB และมี HR link แล้ว
- หรือ HR Account นี้เชื่อมกับ G-HUB แล้ว

ไม่แสดงเมื่อ:
- User login HR-only
- User ยังไม่ได้ link G-HUB
- User อยู่ในสถานะ pending invitation

ตำแหน่ง:
- ซ้ายล่างของ HR sidebar
- ใช้ icon กลับ/แอปหลัก
- ข้อความสั้น `กลับ G-HUB`

Action:
- กดแล้วไป `/hub` หรือ route หลักของ G-HUB
- ถ้า session G-HUB หมดอายุ ให้พาไป G-HUB login พร้อม redirect

## Flow 5: เพิ่มพนักงาน

ตัด UI ที่เกี่ยวกับการสร้างบัญชี/คำเชิญออกจาก modal เพิ่มพนักงาน **ทุกจุด** (ปัจจุบันกระจายอยู่หลายที่ใน `hr-employee-list-page.tsx` ไม่ใช่ section เดียว)

ต้องตัดออกให้ครบ:
- toggle `สร้างบัญชี G-HUB ให้พนักงาน`
- toggle `ส่งคำเชิญให้ตั้งรหัสผ่าน`
- section `บัญชีและการเข้าถึง`
- คำว่า `บัญชี G-HUB` ในชื่อ/คำอธิบาย step การจ้างงาน และในหน้าสรุป (summary)

เหตุผล:
- การสร้าง employee profile = ข้อมูลพนักงานล้วน ๆ ไม่ผูกกับ account creation
- ลดความสับสนตอน HR เพิ่มพนักงาน

โมเดลที่ใช้แทน (ฟันธง):
1. HR เพิ่มพนักงาน → ได้ Employee Profile ที่ **ยังไม่มีบัญชี**
2. User สมัคร HR Account เองผ่าน `/humansource/login` → `สมัครใช้งาน HR`
3. HR กด `สร้างรหัสเชื่อมต่อ` จาก Employee Table → ได้ code 6 หลัก
4. User กรอก code เพื่อผูก HR Account เข้ากับ Employee Profile (ดู Employee Link Code Flow)

หลังเพิ่มพนักงานแล้ว action ที่อยู่ใน Employee Table (ไม่ใช่ใน modal เพิ่มพนักงาน):
- `สร้างรหัสเชื่อมต่อ` — flow หลักในการผูกบัญชี
- (optional ในอนาคต) `คัดลอก invitation link` ถ้าจะรองรับการเชิญทางอีเมลด้วย

## Design Conformance (ใช้ Design System V2)

> ทุกหน้าใหม่ของ flow นี้ (`/humansource/login`, `signup`, `invite`, `link-ghub`, `pending`, `no-company`)
> ต้องสร้างจาก **Design System V2** ซึ่งสกัดจาก Holiday Management UI ที่อนุมัติแล้ว
> — ไม่ออกแบบสไตล์ใหม่เอง (ดู `DESIGN_GOVERNANCE_V2.md` → Future Rule)

### ลำดับชั้นของเอกสาร (สำคัญ — V2 ไม่ได้แทนที่ของเดิม)

**ยังยึดของเดิมครบ** สำหรับ Product Direction / UX Philosophy / กฎเชิงกระบวนการ:
- [`PRODUCT.md`](PRODUCT.md) — users, brand personality, design principles, anti-references
- [`DESIGN.md`](DESIGN.md) — design philosophy, HR UI standard, สิ่งที่ห้าม (ยังอ้างอิงได้)
- [`CLAUDE.md`](CLAUDE.md) — กฎพฤติกรรม/process **ทั้งหมดยังบังคับ**: verification (tsc/eslint), routing convention, Thai-first, localStorage conventions, semantic `hr-*` classes, ห้าม native `<select>`, model strategy
- [`humansource/AGENTS.md`](apps/frontend/src/components/humansource/AGENTS.md) — hard rules ฝั่ง HR

**V2 เป็น authority เฉพาะด้าน visual** (สี / typography / spacing / radius / shadow / motion / รูปลักษณ์ component):
- [`DESIGN_V2.md`](DESIGN_V2.md) — philosophy / visual language / density
- [`DESIGN_TOKENS_V2.json`](DESIGN_TOKENS_V2.json) — color / type / spacing / radius / shadow / motion / z-index / sizes
- [`COMPONENT_RULES_V2.md`](COMPONENT_RULES_V2.md) — Button … Loading
- [`LAYOUT_RULES_V2.md`](LAYOUT_RULES_V2.md) — App Shell / Toolbar / Form / Modal / Drawer
- [`DESIGN_GOVERNANCE_V2.md`](DESIGN_GOVERNANCE_V2.md) — เมื่อไรใช้ Modal / Drawer / Table / Card / Empty / Detail Panel

> **กฎตัดสินเมื่อขัดกัน:**
> - ขัดกันเรื่อง **หน้าตา (visual)** → ยึด **V2** (เพราะสกัดจาก UI ที่อนุมัติแล้ว)
> - เรื่อง **product / UX / process / โครงสร้างโค้ด** → ยึด `PRODUCT.md` / `DESIGN.md` / `CLAUDE.md` / `AGENTS.md` เหมือนเดิม
> - ในทางปฏิบัติแทบไม่ขัดกัน เพราะ V2 ถูกสกัดจาก UI ที่ทำตาม CLAUDE.md §3 อยู่แล้ว (flat, indigo accent เดียว, ห้าม native select)

การ map ของ flow นี้กับ V2 (ห้ามคิด component ใหม่):
- **หน้า Login / Signup / Forgot** → focused auth surface (ไม่ใช่ landing; ห้าม hero/gradient/orb ตาม V2 §8) — ใช้ token color/type/spacing เดิม, ปุ่มเข้าสู่ระบบ = Button `--primary` (ดำ `#111827`), `เข้าสู่ระบบด้วย G-HUB` = `--secondary`, ลิงก์รอง = `--ghost`
- **Field email/password** → Input + Error state ตาม Component Rules (red border **ต้องมีข้อความ** เสมอ)
- **`ไม่มีข้อมูลบริษัท` / `pending`** → **Empty State** (dashed indigo + icon box + title + desc + action) ตาม V2 ไม่ใช่ card ลอย
- **กรอก employee link code** → Input + states (expired / invalid / already used) เป็น inline error message
- **Employee Table (คอลัมน์ `บัญชี` + สร้างรหัสเชื่อมต่อ)** → ใช้ Table + Badge (pill สี+ข้อความ) + iconbtn row-actions + Drawer/Modal ตามกฎ Governance
- **สถานะทุกอย่าง** → status ใช้ pill ชุด green/amber/slate/indigo, มี **สี + ข้อความ** เสมอ
- **Dark theme + reduced-motion** → บังคับทุกหน้า (parity, ไม่ใช่พอร์ตทีหลัง)

## หน้า Login HR Direct: UX/UI Plan

### Layout

หน้าจอเดียว ใช้งานทันที:
- ฝั่งซ้าย: login form
- ฝั่งขวา: context panel ขนาดพอดี แสดงสถานะว่าเป็น `HumanSource HR`
- ไม่มี hero marketing ขนาดใหญ่
- ไม่มี gradient/orb decoration
- ใช้สี neutral + accent HR

### Form

Field:
- Email
- Password
- Remember me

Actions:
- `เข้าสู่ระบบ HR`
- `เข้าสู่ระบบด้วย G-HUB`
- `มีคำเชิญแล้ว`
- `สมัครใช้งาน HR`
- `ลืมรหัสผ่าน`

### States

ต้องมี state เหล่านี้แม้ยัง mock:
- Loading
- Invalid email/password
- Account pending invitation
- Account disabled
- Need employee link
- No company linked
- Enter employee link code
- Link code expired
- Link code invalid
- Link code already used
- Invite expired
- G-HUB linked success

### Copy ที่ควรใช้

ควรใช้ภาษาแบบระบบงาน ไม่ใช่ marketing:
- `เข้าสู่ระบบ HumanSource HR`
- `ใช้บัญชี HR ของคุณ หรือเชื่อมต่อผ่าน G-HUB`
- `บัญชีนี้ยังไม่ได้เชื่อมกับข้อมูลพนักงาน`
- `กรุณาใช้คำเชิญจาก HR หรือส่งคำขอเชื่อมต่อ`

## Guard Logic

### เข้า `/humansource/*`

ตรวจตามลำดับ:
1. มี HR session ไหม
2. HR membership active ไหม
3. ถ้าเข้าจาก G-HUB แต่ยังไม่ linked ให้ไป `/humansource/link-ghub`
4. ถ้า HR Account pending ให้ไปหน้า pending
5. ถ้า active ให้เข้า HR module

### เข้า `/hub` จาก HR

ถ้า HR Account ไม่มี G-HUB link:
- ไม่แสดงปุ่มกลับ G-HUB

ถ้ามี G-HUB link:
- แสดงปุ่มกลับ
- ถ้า G-HUB session ยัง valid ให้ไป `/hub`
- ถ้าไม่ valid ให้ไป G-HUB login

## Implementation Steps

1. เพิ่ม route `/humansource/login`
2. เพิ่ม route `/humansource/invite`
3. เพิ่ม route `/humansource/link-ghub`
4. เพิ่ม auth state แยก `authSource: ghub | hr`
5. เพิ่ม guard สำหรับ HR module
6. เพิ่ม mock account/link data เพื่อทดสอบ UI
7. เพิ่ม icon status ใน Employee Table
8. ซ่อน/แสดงปุ่ม `กลับ G-HUB` ตาม link state
9. เอา UI สร้างบัญชี/คำเชิญออกจาก add employee flow ให้ครบทุกจุด (toggle `สร้างบัญชี G-HUB`, toggle `ส่งคำเชิญให้ตั้งรหัสผ่าน`, section `บัญชีและการเข้าถึง`, คำว่า `บัญชี G-HUB` ใน step/summary)
10. สร้างหน้า settings ภายหลังสำหรับ `การเชื่อมต่อ G-HUB`

## Acceptance Criteria

- User เข้า `/humansource/login` ได้โดยไม่ผ่านหน้า G-HUB
- HR-only user login ได้ถ้ามี HR Account + membership active
- User ที่สมัครเองแต่ยังไม่ถูก invite/approve จะเข้า dashboard ไม่ได้
- User ที่สมัครแล้วแต่ยังไม่ผูก employee profile จะเห็นหน้า `ไม่มีข้อมูลบริษัท`
- User สามารถกรอก employee link code 6 หลักเพื่อผูกบัญชีกับ Employee Profile ได้
- Employee link code มีอายุ default 10 นาที ใช้ได้ครั้งเดียว และ code เก่าถูกยกเลิกเมื่อสร้างใหม่
- HR สามารถสร้าง employee link code จาก icon/เมนูใน Employee Table ได้
- User ที่เข้าจาก G-HUB แต่ยังไม่ linked จะเห็นหน้าเชื่อม employee profile
- Employee table แสดงสถานะ G-HUB link ด้วย icon
- Sidebar แสดง `กลับ G-HUB` เฉพาะ user ที่ link G-HUB แล้ว
- Add employee ไม่มี UI สร้างบัญชี/คำเชิญเหลืออยู่เลย (ไม่มี toggle `สร้างบัญชี G-HUB`, ไม่มี `ส่งคำเชิญให้ตั้งรหัสผ่าน`, ไม่มี section `บัญชีและการเข้าถึง`, ไม่มีคำว่า `บัญชี G-HUB` ใน step/summary)
- การผูกบัญชีทำผ่าน `สร้างรหัสเชื่อมต่อ` ใน Employee Table เท่านั้น

## คำถามที่ควรตัดสินใจก่อนทำจริง

1. สมัคร HR Account ควรเปิด public ไหม?
   - แนะนำ: เปิดได้ แต่เข้า company ไม่ได้จนกว่าจะมี invite/approval

2. ถ้า email ใน G-HUB ตรงกับ email employee profile ให้ auto-link ไหม?
   - แนะนำ: ไม่ auto-link ให้ HR approve หรือใช้ invite token

3. HR-only user ใช้ได้ถึงระดับไหน?
   - ตัวเลือก: employee self-service เท่านั้น / HR admin ได้ / ตาม role ที่ invite ให้

4. หนึ่ง HR Account เชื่อมได้หลายบริษัทไหม?
   - แนะนำ: ได้ ผ่าน HR Membership หลาย record เพื่อรองรับ multi-company

5. ปุ่ม `เข้าสู่ระบบด้วย G-HUB` ใน HR login ควรมีตั้งแต่แรกไหม?
   - แนะนำ: มี แต่เป็น secondary action ไม่ใช่ primary

# HR Backend & Database Plan

> **STATUS (2026-06-27): APPROVED — execution started.** From now on HR work targets the
> real backend + database; the frontend `data/humansource/*` mock is the frozen seed/contract
> source, not a place to build new features. Slice 0 (Employee + core master tables) is in
> progress. See §4 for the build sequence.

> Scope: **HR module only.** Does not touch the existing exhibition-side domains
> (bonus-cards, bookings, lecture-rooms, members, agents, name-lists). Those 20
> Prisma models stay as-is.

---

## 0. Why now (the decision)

Confirmed from the repo:

- **Infrastructure is already production-grade and paid for:** `apps/backend` =
  NestJS 11 + Prisma 7 + Postgres 17 + JWT + socket.io (realtime, good for
  attendance scanning) + xlsx (real import). `docker-compose.yml`, migrations,
  seed all wired. Frontend already has `lib/api.ts` and real `fetch` in a few pages.
- **HR domain layer is greenfield:** Prisma has **zero** HR models. `humansource-auth`
  is **fully in-memory mock** (no PrismaService, plaintext passwords, magic link code
  `A7K3P9`), with a client-side fallback so it runs with no backend at all.
- **All HR data is localStorage** under `g-hub.hr.*` (22 keys).

Conclusion: the expensive part is done; what's missing is exactly the HR data layer,
and the remaining ~40% of the product (payroll calc, leave/OT requests, attendance,
document approval) is **backend-shaped** — it can't be meaningfully built or tested on
mock data. → **Start the HR backend now, work frontend+backend in parallel.**

---

## 1. The key structural insight: two layers

Everything in the mock is **config / master data**. The features the user is blocked on
are **runtime / transactional data that has no mock yet**.

| Layer | Examples | Status today |
|---|---|---|
| **A. Master / config** | employees, org tree, positions, leave *types*, shift *definitions*, holiday calendars, payroll *items/periods*, approval *config* | Fully designed in mock/localStorage → just needs persisting |
| **B. Runtime / transactional** | leave **requests** + balances, shift **assignments**, **attendance** punches, **document** requests, payroll **runs** + payslips, approval **instances** | **Does not exist anywhere** — this is what unlocks testing |

The shift-schedule grid we just built (S1/S4/OFF) is the UI for **Layer B
`ShiftAssignment`** — currently mock. That's the perfect first runtime table.

---

## 2. Proposed Prisma schema (HR)

IDs: master tables keep their existing **app-assigned string ids** (`EMP0001`,
`ET001`, `P001`…) so current seed data & cross-references migrate 1:1. Runtime tables
use `cuid()`. Deeply-nested config blocks (work conditions, leave rules/quota) start as
`Json` — annotated where normalization may later help the calc engines.

```prisma
// ─────────────────────────────────────────────────────────────
// LAYER A — MASTER / CONFIG  (port of g-hub.hr.* localStorage)
// ─────────────────────────────────────────────────────────────

enum OrgNodeType      { company branch department team }
enum EmployeeStatus   { PROBATION NORMAL ON_LEAVE RESIGNED CONTRACT_ENDED } // maps Thai display in FE
enum EmployeeTypeTax  { withholding none }

model OrgNode {
  id        String      @id              // 'org-ghub', 'org-ghub-hr'
  name      String
  type      OrgNodeType
  code      String?
  active    Boolean     @default(true)
  parentId  String?
  parent    OrgNode?    @relation("OrgTree", fields: [parentId], references: [id])
  children  OrgNode[]   @relation("OrgTree")
  company   Company?                       // when type=company
  branchOf  Employee[]  @relation("EmpBranch")
  deptOf    Employee[]  @relation("EmpDept")
}

model Company {
  id                String   @id          // 'CO001'
  orgNodeId         String   @unique
  orgNode           OrgNode  @relation(fields: [orgNodeId], references: [id])
  legalNameTh       String
  tradeName         String
  taxId             String
  socialSecurityCode String
  address           String?
  active            Boolean  @default(true)
  workConditions    Json                   // WorkConditions blob (per-company singleton)
  branches          Branch[]
  signers           AuthorizedSigner[]
  employees         Employee[]
}

model Branch {                              // legal/SSO registration detail (≠ OrgNode tree branch)
  id                  String  @id           // 'BR001'
  companyId           String
  company             Company @relation(fields: [companyId], references: [id])
  code                String                // 'BO0001'
  nameTh              String
  nameEn              String?
  province            String?
  isHeadOffice        Boolean @default(false)
  submitSocialSecurity Boolean?
  branchSeq           String?
  active              Boolean @default(true)
}

model AuthorizedSigner {
  id         String  @id
  companyId  String
  company    Company @relation(fields: [companyId], references: [id])
  name       String
  positionTh String
  scope      String
  active     Boolean @default(true)
}

model JobLevel {
  id        String     @id                 // 'JL-EXEC'
  nameTh    String
  nameEn    String
  rank      Int                            // 1 = highest
  active    Boolean    @default(true)
  positions Position[]
}

model Position {
  id              String   @id             // 'P001'
  code            String
  nameTh          String
  nameEn          String
  jobLevelId      String
  jobLevel        JobLevel @relation(fields: [jobLevelId], references: [id])
  companyId       String                   // '' in mock = all companies → nullable here
  employeeTypes   String[]                 // chip keys (part-time/regular/temp/daily/permanent) — NOT EmployeeType.id (see §3.1)
  salaryMin       Int      @default(0)
  salaryMax       Int      @default(0)
  overview        String   @default("")
  responsibilities String  @default("")
  qualifications  String   @default("")
  hasBenefits     Boolean  @default(false)
  active          Boolean  @default(true)
  employees       Employee[]
}

model EmployeeType {
  id        String          @id            // 'ET001'
  code      String                          // 'EMP-MONTHLY'
  nameTh    String
  nameEn    String
  tax       EmployeeTypeTax
  active    Boolean         @default(true)
  employees Employee[]
}

model Employee {
  id              String         @id        // 'EMP0001'
  code            String         @unique
  name            String
  email           String
  phone           String
  positionId      String
  position        Position       @relation(fields: [positionId], references: [id])
  companyId       String
  company         Company        @relation(fields: [companyId], references: [id])
  branchNodeId    String
  branchNode      OrgNode        @relation("EmpBranch", fields: [branchNodeId], references: [id])
  departmentNodeId String
  departmentNode  OrgNode        @relation("EmpDept", fields: [departmentNodeId], references: [id])
  employeeTypeId  String
  employeeType    EmployeeType   @relation(fields: [employeeTypeId], references: [id])
  scheduleLabel   String                     // mock 'schedule' display; real schedule = ShiftAssignment
  startDate       DateTime
  salary          Int
  status          EmployeeStatus
  active          Boolean        @default(true)
  // Layer B back-relations
  shiftAssignments ShiftAssignment[]
  leaveRequests    LeaveRequest[]
  leaveBalances    LeaveBalance[]
  attendance       AttendanceRecord[]
  docRequests      DocumentRequest[]
  hrAccount        HrAccount?
}

// ── Master option lists & generators ──
enum RunningNumberDateToken { none YYYY YYYYMM }
enum StartDateMode          { today manual }

model EmployeeDefaults {                     // singleton (per company eventually)
  id                   String        @id @default(cuid())
  codePrefix           String
  codePadding          Int
  defaultEmployeeTypeId String
  defaultStatus        String
  startDateMode        StartDateMode
}
model RunningNumberConfig {
  id         String                 @id      // 'RN-EMP'
  docLabelTh String
  prefix     String
  dateToken  RunningNumberDateToken
  padding    Int
  nextNumber Int
  active     Boolean                @default(true)
}
model MasterOption {                          // prefixes | nationalities | educations
  id       String  @id                        // 'PFX-MR'
  category String                             // 'prefix' | 'nationality' | 'education'
  nameTh   String
  nameEn   String?
  active   Boolean @default(true)
  @@index([category])
}

// ── Shifts (definitions) ──
enum ShiftGroup { same_day overnight total_hours combined }
model Shift {
  id                    String     @id @default(cuid())
  code                  String     @unique   // 'WC001'
  name                  String
  type                  String
  time                  String
  companyScope          String                 // company name/'' ; resolve later
  groupKey              ShiftGroup
  enabled               Boolean    @default(true)
  description           String?
  timezone              String?
  color                 String?
  attendanceRule        String?
  flexibleEntryEnabled  Boolean?
  flexibleMinutes       Int?
  minimumWorkHours      Float?
  trackBreak            Boolean?
  shiftAllowanceEnabled Boolean?
  shiftAllowanceAmount  Float?
  prorateShiftAllowance Boolean?
  holidayPremiumEnabled Boolean?
  overtimePremiumEnabled Boolean?
  updatedBy             String?
  updatedAt             DateTime   @updatedAt
  assignments           ShiftAssignment[]
}

// ── Leave types (config) ──
enum LeaveUnit { day hour }
model LeaveType {
  id        String   @id                     // 'LT-ANNUAL'
  code      String   @unique
  nameTh    String
  nameEn    String
  tag       String
  color     String
  unit      LeaveUnit
  statutory Boolean  @default(false)
  enabled   Boolean  @default(true)
  rules       Json                            // LeaveRules
  eligibility Json                            // LeaveEligibility (positionIds/orgNodeIds/employeeIds) — see §3.2
  quota       Json                            // LeaveQuota incl. tiers + perEmployeeType
  approval    Json                            // LeaveApproval
  requests    LeaveRequest[]
  balances    LeaveBalance[]
}

// ── Holidays ──
enum HolidayType   { company announcement }
enum HolidaySource { google seed custom }
model HolidayCalendar {
  id        String         @id               // 'default'
  name      String
  color     String
  isDefault Boolean        @default(false)
  entries   HolidayEntry[]
}
model HolidayEntry {
  id          String          @id
  calendarId  String
  calendar    HolidayCalendar @relation(fields: [calendarId], references: [id])
  year        Int
  date        String                          // YYYY-MM-DD
  title       String
  type        HolidayType
  country     String
  appliesTo   String
  description  String
  source      HolidaySource
  @@index([calendarId, year])
}
model HolidayOverride {                        // patch/soft-delete over google/seed holidays
  officialId  String  @id                      // = the official HolidayEntry id
  date        String?
  title       String?
  description String?
  type        HolidayType?
  deleted     Boolean @default(false)
}

// ── Approval config ──
enum ApprovalMechanism { position_structure per_person }
model DocumentApprovalConfig {
  docType   String            @id             // 'leave','ot','time-adjust',...(11)
  labelTh   String
  mechanism ApprovalMechanism
  steps     String                            // '1'..'5' | 'hr'
}
model PersonApprover {
  employeeId String  @id
  approverId String?
}

// ── Announcements ──
enum AnnouncementStatus { draft published archived }
model AnnouncementCategory {
  id            String         @id
  nameTh        String
  color         String
  active        Boolean        @default(true)
  announcements Announcement[]
}
model Announcement {
  id          String               @id
  title       String
  bodyMd      String
  imageBase64 String               @default("")   // data URL; consider object storage later
  attachments Json                                 // {name,dataUrl}[]
  categoryId  String
  category    AnnouncementCategory @relation(fields: [categoryId], references: [id])
  audience    Json                                 // {scope, companyIds, orgNodeIds, employeeTypeIds, employeeIds}
  status      AnnouncementStatus
  publishAt   DateTime?
  publishEnd  DateTime?
  pinned      Boolean              @default(false)
}

// ── Payroll config ──  (deeply-nested calc configs kept as Json by design)
enum PayrollPayType { monthly daily hourly piece }
enum MoneyRounding  { none nearest_baht }
model PayrollGeneralConfig {                   // singleton
  id                String        @id @default(cuid())
  cycleStartDay     String                      // PayrollDayAnchor (int|'EOM')
  cycleEndDay       String
  ssoEmployeeRate   Float
  ssoEmployerRate   Float
  ssoMonthlyWageFloor Float
  ssoMonthlyWageCap Float
  ssoIncludeOT      Boolean
  ssoIncludeBonus   Boolean
  ssoIncludeWelfare Boolean
  currency          String
  moneyRounding     MoneyRounding
  preventWrongOtType Boolean
}
model PayrollEmploymentType {
  id              String   @id
  code            String
  nameTh          String
  nameEn          String
  payType         PayrollPayType
  paidPublicHoliday Boolean
  paidHourly      Boolean
  calcConditions  Json                          // CalcConditionConfig[] (incl. otRates)
  employeeTypeId  String?                        // optional FK → EmployeeType
  active          Boolean  @default(true)
  payPeriodConfigs PayPeriodConfig[] @relation("PeriodEmpTypes")
}
model PayItem {                                  // unifies Income + Deduction
  id              String   @id                   // 'I01' / 'D01'
  kind            String                         // 'income' | 'deduction'
  code            String
  nameTh          String
  nameEn          String
  revenueCategory String?                         // '40(1)'… (income required, deduction optional)
  rounding        String
  taxCalcMethod   String?
  payoutScope     String
  taxable         Boolean
  linkSSO         Boolean
  linkProvidentFund Boolean
  offCycle        Boolean
  carryPrevPeriod Boolean
  // income-only (nullable for deductions)
  payOnce            Boolean?
  payoutScopeOnce    Boolean?
  calcByActualWorkdays Boolean?
  linkOvertime       Boolean?
  linkLateAbsent     Boolean?
  isWelfare       Boolean  @default(false)
  enabled         Boolean  @default(true)
  isSystem        Boolean  @default(false)
  isCustom        Boolean  @default(false)
  accountMappings PayItemAccountMap[]
}
model AccountCategory {
  id        String             @id
  nameTh    String
  enabled   Boolean            @default(true)
  updatedAt DateTime           @updatedAt
  mappings  PayItemAccountMap[]
}
model PayItemAccountMap {                         // PayItem ↔ AccountCategory (carries GL code)
  payItemId   String
  categoryId  String
  glCode      String
  payItem     PayItem         @relation(fields: [payItemId], references: [id])
  category    AccountCategory @relation(fields: [categoryId], references: [id])
  @@id([payItemId, categoryId])
}
model PayPeriodConfig {
  id                String   @id
  year              Int
  frequency         String                        // 'monthly'
  firstPeriodStart  String
  payDayOfMonth     String                         // PayrollDayAnchor
  payNextMonth      Boolean
  payBeforeIfHoliday Boolean
  hasOffCycle       Boolean
  offCycleStart     String?
  employmentTypes   PayrollEmploymentType[] @relation("PeriodEmpTypes")
  generated         GeneratedPeriod[]
}
model GeneratedPeriod {
  id          String          @id              // `${configId}-${year}-${MM}`
  configId    String
  config      PayPeriodConfig @relation(fields: [configId], references: [id])
  index       Int
  label       String
  periodStart String
  periodEnd   String
  payDate     String
}

// ── HR auth (replace in-memory mock) ──
enum HrAccountStatus    { active pending disabled }
enum HrMembershipStatus { active none pending }
model HrAccount {
  id               String             @id @default(cuid())
  email            String             @unique
  displayName      String
  passwordHash     String                            // bcrypt (replaces plaintext)
  authSource       String             @default("hr") // 'hr' | 'ghub'
  accountStatus    HrAccountStatus    @default(pending)
  membershipStatus HrMembershipStatus @default(none)
  hasGhubLink      Boolean            @default(false)
  employeeId       String?            @unique          // link to Employee once onboarded
  employee         Employee?          @relation(fields: [employeeId], references: [id])
  userId           String?                              // link to existing G-HUB User (ghub source)
  createdAt        DateTime           @default(now())
  linkCodes        HrLinkCode[]
}
model HrLinkCode {
  id        String    @id @default(cuid())
  code      String    @unique
  accountId String
  account   HrAccount @relation(fields: [accountId], references: [id])
  used      Boolean   @default(false)
  expiresAt DateTime
}

// ─────────────────────────────────────────────────────────────
// LAYER B — RUNTIME / TRANSACTIONAL  (greenfield — unlocks testing)
// ─────────────────────────────────────────────────────────────

model ShiftAssignment {                          // the S1/S4/OFF grid we just built
  id         String   @id @default(cuid())
  employeeId String
  employee   Employee @relation(fields: [employeeId], references: [id])
  date       DateTime
  shiftId    String?                              // null = OFF / rest day
  shift      Shift?   @relation(fields: [shiftId], references: [id])
  isOff      Boolean  @default(false)
  @@unique([employeeId, date])
  @@index([date])
}

enum LeaveRequestStatus { draft pending approved rejected cancelled }
model LeaveRequest {
  id          String             @id @default(cuid())
  employeeId  String
  employee    Employee           @relation(fields: [employeeId], references: [id])
  leaveTypeId String
  leaveType   LeaveType          @relation(fields: [leaveTypeId], references: [id])
  startDate   DateTime
  endDate     DateTime
  unitCount   Float                               // days or hours
  reason      String?
  status      LeaveRequestStatus @default(pending)
  attachments Json?
  createdAt   DateTime           @default(now())
  approval    ApprovalInstance?
}
model LeaveBalance {
  id          String    @id @default(cuid())
  employeeId  String
  employee    Employee  @relation(fields: [employeeId], references: [id])
  leaveTypeId String
  leaveType   LeaveType @relation(fields: [leaveTypeId], references: [id])
  year        Int
  entitled    Float
  used        Float     @default(0)
  carriedOver Float     @default(0)
  @@unique([employeeId, leaveTypeId, year])
}

model AttendanceRecord {                          // scan in/out (socket.io realtime)
  id          String   @id @default(cuid())
  employeeId  String
  employee    Employee @relation(fields: [employeeId], references: [id])
  date        DateTime
  clockIn     DateTime?
  clockOut    DateTime?
  source      String                              // 'scan' | 'manual' | 'mobile'
  lat         Float?
  lng         Float?
  note        String?
  @@index([employeeId, date])
}

enum DocRequestStatus { draft pending approved rejected }
model DocumentRequest {                            // OT, time-adjust, cert, visa, petty-cash, ...
  id         String           @id @default(cuid())
  docType    String                               // matches DocumentApprovalConfig.docType
  employeeId String
  employee   Employee         @relation(fields: [employeeId], references: [id])
  payload    Json                                 // type-specific fields
  status     DocRequestStatus @default(pending)
  createdAt  DateTime         @default(now())
  approval   ApprovalInstance?
}

// Generic approval-chain runtime (drives leave + all doc requests)
enum ApprovalState { pending approved rejected }
model ApprovalInstance {
  id              String          @id @default(cuid())
  docType         String
  leaveRequestId  String?         @unique
  leaveRequest    LeaveRequest?   @relation(fields: [leaveRequestId], references: [id])
  docRequestId    String?         @unique
  docRequest      DocumentRequest? @relation(fields: [docRequestId], references: [id])
  state           ApprovalState   @default(pending)
  steps           ApprovalStep[]
  createdAt       DateTime        @default(now())
}
model ApprovalStep {
  id          String           @id @default(cuid())
  instanceId  String
  instance    ApprovalInstance @relation(fields: [instanceId], references: [id])
  order       Int
  approverId  String                               // → Employee.id
  state       ApprovalState    @default(pending)
  actedAt     DateTime?
  comment     String?
}

// Payroll runtime (depends on attendance + leave + shift being real → build LAST)
enum PayrollRunStatus { draft calculated approved paid }
model PayrollRun {
  id           String           @id @default(cuid())
  periodId     String                               // → GeneratedPeriod.id
  status       PayrollRunStatus @default(draft)
  createdAt    DateTime         @default(now())
  payslips     Payslip[]
}
model Payslip {
  id         String     @id @default(cuid())
  runId      String
  run        PayrollRun @relation(fields: [runId], references: [id])
  employeeId String                                 // → Employee.id
  gross      Float
  deductions Float
  net        Float
  lines      Json                                   // per pay-item breakdown
  @@unique([runId, employeeId])
}
```

---

## 3. Decisions needed from you (I have a default for each)

1. **`Position.employeeTypes` chip keys vs `EmployeeType.id`** — mock uses two unrelated
   taxonomies (`part-time/regular/…` vs `ET001/…`). *Default: keep `Position.employeeTypes`
   as `String[]` now, unify later.* Or reconcile to one FK before building.
2. **Leave `rules/eligibility/quota` as `Json` vs normalized tables** — *Default: `Json`
   now (matches mock 1:1, fast).* The **leave engine** later may want `eligibility` as join
   tables to query "who is eligible." Normalize then, not now.
3. **`Branch` (legal/SSO) vs `OrgNode` type=branch (tree)** — two branch representations.
   *Default: keep both; add optional `Branch.orgNodeId` link later.*
4. **ID strategy** — *Default: keep existing app string ids on master tables (clean
   migration), `cuid()` on runtime tables.*

---

## 4. Build sequence (parallel, vertical-slice first)

1. **Slice 0 — prove the stack:** ✅ **DONE (2026-06-27).** Migration `add_humansource_core`
   (`hr_org_node/hr_company/hr_position/hr_employee_type/hr_employee`), seed of 35 employees +
   master data (`prisma/seed-humansource.ts`), `HumansourceModule` → `GET /api/humansource/employees`,
   frontend employee list fetches via `publicApiFetch` (mock fallback). Verified 200/35 end-to-end.
   `HrEmployee` is denormalized to the frozen frontend `Employee` contract; FK constraints deferred.
   *Deploy note: backend = docker prod target, run `docker compose build backend && up -d backend`.*
2. **Slice 1 — master CRUD migration:** port remaining Layer-A tables feature-by-feature,
   each replacing its localStorage key. Keep localStorage as fallback per feature.
   - 🚧 **In progress:** `EmployeeType` CRUD backend DONE + verified (GET/POST/PATCH/DELETE at
     `/api/humansource/employee-types`, DTO validation, auto `ET###` id). Next: wire
     `hr-basic-settings.tsx` UI to it. **Per-feature gotcha:** the Slice-0 master tables
     (`HrPosition` etc.) were seeded from the *simple* `mock.ts` shapes — most features use the
     *richer* `data/humansource/*.ts` types (e.g. `positions.ts` has jobLevel/salary band/text
     fields). Each migration must first align its table to the rich data-layer type.
     `EmployeeType` was chosen first precisely because its table already matches 1:1.
   - ⚠️ **Add-Employee wizard needs schema expansion:** `EmployeeDraft` (hr-employee-list-page)
     collects 40+ fields (address, bank, emergency contact, SSO, documents) far beyond the
     denormalized `hr_employee` (18 cols). Real employee create/edit = a deliberate employee
     schema design, not a quick wire-up. Defer until the employee schema is fleshed out.
3. **Slice 2 — HR auth for real:** `HrAccount` + bcrypt + `HrLinkCode`, replace in-memory map.
4. **Slice 3 — runtime engines (the 40%):** in dependency order —
   `ShiftAssignment` → `AttendanceRecord` → `LeaveRequest`/`LeaveBalance` +
   `ApprovalInstance` → `DocumentRequest` → **`PayrollRun`/`Payslip` last** (needs the rest).

Rule while parallel: **freeze approved mock data shapes** as the API contract so we don't
edit both sides on every change.

---

## 5. Out of scope (this plan)

- Exhibition-side domains and their 20 existing models — untouched.
- Real object storage for announcement images/attachments (kept as data-URL `Json` for now).
- Multi-company payroll namespacing (mock uses `global`; defer real per-company scoping).

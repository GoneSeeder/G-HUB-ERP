# Humansource Phase 2 Handoff

## Route/UI Pattern

Humansource should now follow this structure:

- `apps/frontend/src/app/(protected)/humansource/**/page.tsx`
  - Route files only.
  - Keep these files thin.
  - They should import and render UI components.
- `apps/frontend/src/components/humansource/*.tsx`
  - Real UI, state, forms, tables, modals, and page-level components.

This keeps the route tree readable like `information`, while still avoiding huge page files.

## Explicit Routes Added

Only currently approved/active HR routes should have explicit folders:

- `/humansource/home`
  - `app/(protected)/humansource/home/page.tsx`
  - UI: `components/humansource/hr-home-page.tsx`
- `/humansource/organization/employees`
  - `app/(protected)/humansource/organization/employees/page.tsx`
  - UI: `components/humansource/hr-employee-list-page.tsx`
- `/humansource/settings`
  - `app/(protected)/humansource/settings/page.tsx`
  - UI: `components/humansource/hr-settings-page.tsx`
- `/humansource/time/holiday-calendar`
  - `app/(protected)/humansource/time/holiday-calendar/page.tsx`
  - UI is still rendered through `HrSettingsPage`, which detects the pathname and shows the holiday calendar workbench.
- `/humansource/payroll`
  - `app/(protected)/humansource/payroll/page.tsx`
  - UI: `components/humansource/hr-under-development-page.tsx`
- `/humansource/reports`
  - `app/(protected)/humansource/reports/page.tsx`
  - UI: `components/humansource/hr-under-development-page.tsx`

## Legacy Fallback Removed

`app/(protected)/humansource/[[...slug]]/page.tsx` has been removed.

Do not recreate a catch-all HR route. Phase 2 should add explicit route folders only when that page is actually approved/used.

Do not generate route folders just because a path exists in config.

Shared dashboard UI was moved into:

- `components/humansource/hr-dashboard-page.tsx`

## Sidebar State

Current primary HR sidebar is simplified:

- หน้าหลัก
- Dashboard
- พนักงาน
- เงินเดือน
- รายงาน
- ตั้งค่า

Removed from the primary sidebar:

- สรรหาและเริ่มงาน
- เวลาและการลา
- ผลงานและพัฒนา

`เงินเดือน` and `รายงาน` are direct routes and show "อยู่ในระหว่างพัฒนา".

## HR Home Direction

`hr-home-page.tsx` is not an admin dashboard. It is the employee-specific home page:

- Left column: employee profile, attendance read-only summary, leave balance.
- Center column: news feed / announcement feed, scrollable Facebook-like feeling.
- Right column: employee request status, approval inbox if the user is an approver, today's schedule.

Attendance on this page is read-only. Do not add "clock in/out" actions here. Actual attendance actions should come from the attendance system.

## Verification

Validated after refactor:

- `npm run type-check`
- `npm run lint`
- `npm run build`

Build confirmed the approved explicit HR routes and confirmed `[[...slug]]` is no longer present.

# HR Module Agent Guidelines

This file applies only to the HR module under `apps/frontend/src/components/humansource`.
Do not apply these rules to other G-HUB modules unless the user explicitly asks for it.

## Scope

- Work only inside HR-related files when the task is about HR.
- Do not reuse visual styles from other modules such as Information, ERP, Finance, or generic admin pages.
- Do not refactor unrelated modules while fixing HR.
- If a shared component must be changed, keep the change backwards compatible and verify the affected HR usage.

## UI Style

- HR must use its own semantic classes with the `hr-*` prefix.
- Put reusable HR visual rules in `apps/frontend/src/app/globals.css`.
- Avoid long repeated Tailwind class chains for repeated HR UI elements.
- Tailwind utilities are acceptable for one-off layout only, such as grid spans, spacing, or responsive layout.
- Cards should stay clean, compact, and HR-specific. Do not copy rounded/soft dashboard styles from other modules.
- Table typography should follow the HR settings format:
  - Header text: small, muted, semibold.
  - Primary row text: medium weight.
  - Secondary/detail text: normal weight and muted.
  - Status should use compact pill styles.

## HR Custom Controls

- Do not use native `<select>` / `<option>` in HR UI.
- Use `HrCustomSelect` from `hr-ui.tsx` for HR dropdowns.
- Use custom HR controls for time, color, toggle, checkbox, and policy controls.
- New HR dropdowns must support:
  - custom popover UI,
  - selected state,
  - click outside to close,
  - Escape to close,
  - dark theme compatibility,
  - no browser-native dropdown rendering.

## Shift Settings

- Do not reintroduce a standalone HR settings page for company holiday calendars.
- Treat company-level holidays as default/reference data only unless the user asks otherwise.
- The final working calendar should be handled from employee-level shift assignment/schedule detail, similar to a monthly employee schedule grid.
- Shift and employee schedule features may include day assignment when the user asks for scheduling behavior.
- Do not show unused submenu tabs in shift settings.
- The shift table should not include group header rows for:
  - same-day shift,
  - overnight shift,
  - total-hours shift,
  - combined shift.
- The shift table detail column should describe only time/policy details, not working days.
- The company column must show company scope only. Do not put calculation wording there.
- In the time settings group, keep only active menu items. Current active items are:
  - shift settings,
  - attendance locations/methods,
  - leave settings.

## CSS Hygiene

- Prefer semantic classes such as:
  - `hr-settings-*`
  - `hr-shift-*`
  - `hr-custom-select*`
- Do not create broad selectors that accidentally style all modules.
- If a global selector is needed, scope it under an HR class.
- Keep dark theme overrides scoped under `.hr-theme-dark`.
- Do not rely on Tailwind class-name selectors for new HR components when a semantic class is cleaner.

## Verification

Before finishing HR UI work, run:

```powershell
cd apps/frontend
.\node_modules\.bin\tsc.cmd --noEmit
.\node_modules\.bin\eslint.cmd src/components/humansource
```

For visual changes, verify the local page in the browser when possible:

- `/humansource/settings/time/work-schedules`
- desktop and mobile width,
- light and dark theme when the touched component supports both,
- dropdowns/popovers are not clipped and do not cause page jump.

# G-HUB — Project Context for Claude Code

This file is the entry-point context for any Claude Code session opened in this repo.
Read it before doing anything substantial, then read the more specific docs it points to.

---

## 1. What this project is

G-HUB is a monorepo for an HR / business platform. The active development area for the
current cycle is the **HR module** under `apps/frontend/src/components/humansource` and
its routes under `apps/frontend/src/app/(protected)/humansource`.

The frontend is **Next.js (App Router) + Tailwind + TypeScript (strict, `noUnusedLocals` on)**.

---

## 2. Required reading before starting HR work

**Always read these before touching UI** (Desktop sessions: read explicitly; CLI sessions: impeccable auto-loads them):

| File | Why |
|---|---|
| `DESIGN.md` (repo root) | **Design system source of truth** — color tokens, typography, spacing, component patterns, approved/rejected layout patterns. Maintained by impeccable. |
| `PRODUCT.md` (repo root) | Product context, brand personality (Clean · Friendly · Modern), anti-references (what *not* to look like). |
| `apps/frontend/src/components/humansource/AGENTS.md` | **Hard rules** for HR UI (semantic classes, no native select, HrCustomSelect, verification commands). Treat as non-negotiable. |
| `LEAVE_SETTINGS_PLAN.md` (repo root) | Spec for the leave settings + approval workflows feature. Phases 1–3 done, Phase 4+ pending. |
| `HUMANSOURCE_PHASE2_HANDOFF.md` (repo root) | Routing convention: explicit `app/.../page.tsx` routes that are thin shells importing components from `components/humansource/`. |

---

## 3. HR module style — what the user has explicitly asked for

These are corrections the user gave during earlier sessions. Treat them as standing
preferences for any HR UI work — not just for the file that was being discussed.

### 3.1 Layout patterns the user *accepts*
- **List view (table) + fullscreen modal** for create/edit — this is the
  `ShiftSettingsBoard` pattern in `hr-settings-page.tsx` (around the `WC###` shift
  list and create-shift modal). The user has approved this look.
- **Master/detail** is OK when there's a strong list-of-things on the left
  (e.g. holiday calendars), but the right-hand detail must stay flat (see 3.2).
- **Flat forms** with section heading + spacing — like the empeo modals the user
  shared as reference.

### 3.2 Layout patterns the user has rejected as "AI-generated" / "information module style"
- **Section cards with number badges** wrapping form groups (the `hr-shift-section` pattern
  *inside* a master/detail right pane). It looks like AI templating when stacked.
  → Replace with plain `<h4>` group headings + grid of fields on white background.
- Auto-save inline edit on a side detail panel. The user prefers an explicit
  "save" via modal create/edit flow.
- Heavy use of indigo number badges, gradient/glow cards, or wide rounded card
  surfaces stacked on a gray page. HR is **flat**.

### 3.3 Visual tokens
- **HR accent (indigo):** `#4f46e5`. All detail/active states use this color.
- Neutral palette: gray-50 / gray-100 / gray-200 borders, gray-600/700 text, gray-950 headings.
- Status pills: `bg-emerald-50 text-emerald-700` (on) / `bg-gray-100 text-gray-500` (off).
- No gradient, no glow, no soft shadow except modals.

### 3.4 Controls
- **No native `<select>`** anywhere in HR. Use `HrCustomSelect` from `hr-ui.tsx`.
- Custom toggle / color picker / time picker patterns exist in:
  - `hr-leave-settings.tsx` (toggle, color swatch — current standard)
  - `hr-settings-page.tsx` `TimePicker24`, `ShiftColorPicker`
  - `hr-holiday-year-calendar.tsx` (modals, confirm dialogs, localStorage)
- Reuse these patterns. If you write a new control, follow the same semantic
  class style.

### 3.5 Semantic CSS
- All HR styles live in `apps/frontend/src/app/globals.css` under semantic class names
  prefixed `hr-*` (e.g. `hr-leave-*`, `hr-shift-*`, `hr-holiday-*`, `hr-settings-*`).
- Do **not** chain long Tailwind utility class strings for repeated HR UI.
  Tailwind utilities are only acceptable for one-off layout (grid spans, spacing).
- Dark theme overrides go under `.hr-theme-dark`. Every new component must work in dark.

---

## 4. State / persistence conventions
- Demo features use **localStorage** (no backend yet). See `hr-holiday-year-calendar.tsx`
  for the canonical pattern: hydrate once in `useEffect`, gate persistence with a
  `hydrated` flag, persist on every state change.
- localStorage keys are prefixed `g-hub.hr.*`.
- **Do not use `Date.now()` or `Math.random()` in render paths** — only inside event
  handlers (e.g. generating an id when the user clicks "save"). This avoids hydration
  mismatch and keeps tests deterministic.

---

## 5. Routing convention (from Phase 2 handoff)
- Active HR routes have **explicit `app/(protected)/humansource/<path>/page.tsx`** files.
- Each route file is **thin**: just imports and renders a component from
  `components/humansource/`.
- The catch-all `app/(protected)/humansource/[[...slug]]/page.tsx` still exists as a
  legacy fallback. Do **not** add new UI into it — migrate sections out gradually.

---

## 6. Verification — bypass at your peril

Before declaring HR work done, **run both** and make sure they exit 0:

```powershell
cd apps/frontend
.\node_modules\.bin\tsc.cmd --noEmit
.\node_modules\.bin\eslint.cmd src/components/humansource
```

TypeScript has `noUnusedLocals` on — any unused import/variable is a build break.
A single pre-existing warning in `hr-holiday-year-calendar.tsx` (`customForActive`
useMemo dep) is known and tolerated; new warnings are not.

---

## 7. Current state (as of the handoff commit `d6452e66`)

- **Holiday calendar** (`hr-holiday-year-calendar.tsx`) — multi-calendar with Google
  iCal + offline seed, override/restore, square-cell grid, trash bin. Complete.
- **Shift settings** (`ShiftSettingsBoard` in `hr-settings-page.tsx`) — table + fullscreen
  create modal. Complete.
- **Attendance locations** (work-in modal) — complete.
- **Time general (2.1)** — complete.
- **Leave settings (2.5)** — Phases 1–3 done:
  - Phase 1: data model + statutory seed (7 leave types).
  - Phase 2: nav + routing hook + explicit route file.
  - Phase 3: list view + fullscreen modal + Tab 1 (Rules) functional.
    Tabs 2 (สิทธิ์การลา) and 3 (เงื่อนไขการอนุมัติ) are placeholders.
- **Approval workflows (system group)** — data model only (`data/humansource/approval-workflows.ts`).
  UI not started.

**Next phases in `LEAVE_SETTINGS_PLAN.md`:**
- Phase 4: Tab 2 — eligibility + quota (tenure-tier table + per-employee-type).
- Phase 5: Approval workflows page 1 (doc-type config).
- Phase 6: Approval workflows page 2 (person → approver map).
- Phase 7: Tab 3 — link approval template + per-leave override.

---

## 8. Model strategy
- Default for routine implementation work: **Sonnet 4.6**.
- Architecture / debugging / spec design: switch to **Opus** (`/model opus`).
- Trivial renames / one-line typo fixes: **Haiku 4.5**.
- The agent should suggest a model switch when it senses the task is materially
  harder than what the current tier handles well — but never switch silently.

---

## 9. impeccable
`npx impeccable install` has been run at the repo root. The skill folder lives in
`.claude/skills/impeccable/` and a `PostToolUse` hook fires on `Edit | Write | MultiEdit`
to surface UI anti-pattern findings as system reminders.

If `/impeccable init` has not been run yet in this clone, run it once at the start.
After that, treat any system-reminder from impeccable like real review feedback —
fix or justify; don't ignore.

---

## 10. Working etiquette the user expects
- Verify before claiming "done" (tsc + eslint, ideally also click through the route).
- Don't over-engineer: if a spec says "stub for next phase," ship the stub —
  don't preemptively build Tabs 2/3 in Phase 3.
- Don't reintroduce removed UI under the guise of "compatibility." Removed means removed.
- Thai language is preferred for user-facing text and chat responses. Identifiers,
  code comments, commit messages, and these docs stay in English.
- When the user pastes a screenshot of another product (Humansoft, empeo, base44),
  treat it as a *reference for layout and tone* — not a 1:1 spec. Adapt to HR style.

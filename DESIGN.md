# Design System — G-HUB HumanSource (HR Module)

> Scope: HR module only (`components/humansource/`, `app/(protected)/humansource/`).
> The Information module has a separate visual language and is not under active development.

---

## Color Palette

### HR Shell Tokens (CSS custom properties on `.hr-shell`)

| Token | Value | Role |
|---|---|---|
| `--hr-surface` | `#ffffff` | Card / panel background |
| `--hr-page` | `#f6f7fa` | Page shell background |
| `--hr-border` | `#e2e8f0` | Default border |
| `--hr-border-soft` | `#edf1f6` | Subtle dividers |
| `--hr-text` | `#0f172a` | Headings, primary text |
| `--hr-text-muted` | `#64748b` | Secondary labels |
| `--hr-text-subtle` | `#94a3b8` | Placeholder, tertiary |
| `--hr-primary` | `#4f46e5` | Accent — active state, primary CTA, focus |
| `--hr-primary-soft` | `#eef2ff` | Accent tint — selected row bg, icon bg |
| `--hr-focus` | `rgba(79,70,229,0.14)` | Focus ring shadow |
| `--hr-shadow` | `0 1px 2px rgba(15,23,42,0.05)` | Resting card shadow |

### Status Badge Tones

| Tone | Background | Text | Usage |
|---|---|---|---|
| green | `bg-emerald-50` | `text-emerald-700` | Active / normal |
| indigo | `bg-indigo-50` | `text-indigo-600` | On leave / info |
| rose | `bg-rose-50` | `text-rose-600` | Resigned / danger |
| amber | `bg-amber-50` | `text-amber-700` | Trial / pending |
| slate | `bg-slate-100` | `text-slate-500` | Ended / inactive |

### App-Wide Brand (non-HR surfaces)

| Token | Value |
|---|---|
| `--ghub-blue-950` | `#05245f` |
| `--ghub-blue-700` | `#0b63f6` |
| `--ghub-blue-600` | `#1478ff` |
| `--ghub-cyan-500` | `#22b7f5` |

---

## Typography

**Font family**: `'Kanit', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
Loaded from Google Fonts at weights 300 / 400 / 500 / 600 / 700.

| Role | Tailwind classes | Notes |
|---|---|---|
| Page title | `text-lg font-bold text-gray-800` | 1.125rem, bold |
| Page subtitle | `text-xs text-gray-400 mt-0.5` | Descriptive line under title |
| Section heading | `text-sm font-semibold text-gray-700` | Used inside modals |
| Table column header | `text-xs font-semibold uppercase tracking-wider text-gray-400` | |
| Table body cell | `text-sm text-gray-700` | Default row text |
| Code / ID | `font-mono text-xs text-gray-500` | Employee codes, IDs |
| Muted label | `text-xs text-gray-400` | Secondary metadata |
| Small count pill | `text-[10px] font-bold` | Tab count badges |

Weight 300 (`font-light`) is used for descriptive/body text; weight 600 (`font-semibold`) for labels and buttons.

---

## Spacing & Sizing

| Element | Size |
|---|---|
| Standard control height | `h-9` (2.25rem) or `h-10` (2.5rem) |
| Modal padding | `px-6 py-5` |
| Table row padding | `px-4 py-3` |
| Page header padding | `px-6 pt-5 pb-0` |
| Toolbar padding | `px-6 py-3` |
| Default gap between controls | `gap-2` (0.5rem) |
| Inline icon size | `h-4 w-4` (1rem) |
| Avatar circle | `h-8 w-8` (2rem), `rounded-full` |

---

## Border Radius

All interactive controls and panels use `rounded-lg` (0.5rem). Modals use `rounded-xl` (0.75rem). Pills/badges use `rounded-full`.

---

## Components

### `.hr-button`

Base class for all HR buttons. Composed with a modifier:

| Modifier | Appearance |
|---|---|
| `--primary` | `bg-gray-950 text-white` — dark solid (preferred primary CTA) |
| `--secondary` | `border border-hr-border bg-white text-gray-600` |
| `--danger` | `border border-rose-200 bg-rose-50 text-rose-700` (soft destructive) |
| `--ghost` | Transparent, `text-hr-text-muted` |

Height: `min-h-9`, font: `text-[0.8125rem] font-semibold`.

### Table pattern (`hr-employee-list-page.tsx` is the canonical reference)

```
┌─ Page container: bg-white, full-bleed ──────────────────┐
│ Header: px-6 pt-5 — title + subtitle + primary action   │
│ Tabs: border-b, -mb-px indicator with border-b-2        │
│ Toolbar: px-6 py-3 border-b — search + filters          │
│ Table: w-full text-sm                                   │
│   thead: bg-gray-50/60 border-b                         │
│   tbody rows: border-b border-gray-100                  │
│     hover: bg-gray-50/50                                │
│     selected: bg-indigo-50/40                           │
│ Pagination: border-t px-6 py-3 justify-between         │
└─────────────────────────────────────────────────────────┘
```

No container card wrapping the table. The page itself is the surface.

### Fullscreen modal (create / edit)

Used for: AddEmployee, CreateShift, CreateLeaveType. Pattern from `ShiftSettingsBoard` and
`hr-employee-list-page.tsx`:
- Fixed overlay `inset-0 bg-black/40`
- Panel: `bg-white rounded-xl` or full-screen on mobile
- Multi-step wizard uses a sidebar step list (numbered) + right content area
- Always has an explicit Save and Cancel — never auto-save

### Tab navigation

```jsx
<button className={`border-b-2 -mb-px px-3 py-2.5 text-sm font-medium ${
  active ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'
}`}>
```

Count pill inside tab: `rounded-full px-1.5 py-0.5 text-[10px] font-bold bg-primary/10 text-primary` (active) or `bg-gray-100 text-gray-500`.

### `HrBadge`

Status pill from `hr-ui.tsx`. Uses tone prop (see Status Badge Tones table).
Always includes text — never color-only.

### `HrCustomSelect`

Custom dropdown from `hr-ui.tsx`. **Mandatory replacement for all `<select>` elements.**
Never use native `<select>` in the HR module.

### Form fields (inside modals)

- Label: `text-xs font-medium text-gray-600 mb-1`
- Input: `h-9 w-full rounded-lg border border-gray-200 px-3 text-sm`
- Focus: `focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none`
- Grid layout: `grid grid-cols-2 gap-4` (adjust cols per density)

### Empty state (`.hr-empty-state`)

Dashed indigo border (`border-dashed border-indigo-200`), soft indigo tint background,
centered icon in white box with shadow, title + description text. No solid card.

### Settings-row list (`.hr-setting-row`)

The calm "HR settings list" look (the pattern users have approved): a vertical list of rows,
each **label on the left, control/value on the right**, separated by hairline dividers — no cards,
no badges, no boxes. Reference: `OrganizationSettings` (the toggle list) and `TimeGeneralSettings`
sections 2–3 (`hr-time-general.tsx`).

```jsx
<div className="hr-setting-rows">
  <div className="hr-setting-row">
    <span className="hr-setting-row__label">ช่วงเวลาที่นับการสแกนซ้ำ</span>
    <span className="hr-setting-row__control">
      <input className="hr-shift-control hr-setting-row__num" />
      <span className="hr-setting-row__unit">นาที</span>
    </span>
  </div>
  {/* …more rows… */}
</div>
```

Use it for grouped policy settings (toggles, enums, small numeric values). The right side holds a
toggle, an `HrCustomSelect`, a segmented control, or a number + unit. For a boolean/enum value with
no editor, the right side is just muted text (e.g. `เปิด`, `ไม่ยืนยันตัวตน`). **Prefer this over
fill-in-the-blank sentences or example callout boxes** (see "HR UI Standard" below).

---

## Animation

**Easing**: `cubic-bezier(0.16, 1, 0.3, 1)` (expo out) for enter animations.
**Duration**: 600ms page-level, 140ms micro-interactions (hover, focus transitions).

| Class | Effect |
|---|---|
| `.erp-fade-in` | `erp-content-up` 600ms, 150ms delay — page content |
| `.erp-slide-down` | 600ms slide from -10px — headers/breadcrumbs |
| `.erp-controls-enter` | 600ms, 100ms delay — toolbars |
| `.erp-hub-grid > *` | Staggered enter (60/120/180/240ms) — app cards |
| `hrFadeUp` | HR-specific 400ms fade+translate for modal items |

**Reduced motion**: All animations collapse to 1ms via
`@media (prefers-reduced-motion: reduce)` in globals.css. No exceptions.

---

## Layout patterns

### Approved: Table + fullscreen modal
List view with `bg-white` full-bleed table, fullscreen modal for create/edit.
Reference: `ShiftSettingsBoard`, `HrEmployeeListPage`.

### Approved: Master / detail (left list + right flat form)
For things with a strong list of items (e.g. holiday calendars). Right panel must be flat —
no nested cards, no section badges.

### Approved: Flat form (section heading + grid)
Inside modals: `<h4>` or `<p className="text-xs font-semibold ...">` as section label,
followed by `grid grid-cols-2 gap-4` of fields.

### Rejected (do not use)
- Section cards with numbered badges wrapping form groups
- Auto-save inline edit in a side panel
- Gradient/glow card surfaces
- Heavy indigo number badges as decorative section headers
- Nested `<select>` elements

---

## HR UI Standard — must NOT look AI-generated

> The product owner has repeatedly flagged screens that "look like AI made them." A real HR admin
> tool is **terse, flat, and trusts the user**. Every HR screen — and every screen a future agent
> builds — must follow this. When unsure, copy the layout/spacing/rhythm of an already-approved
> board (`hr-employee-list-page`, `ShiftSettingsBoard`, `hr-leave-settings`, `hr-org-structure`,
> `OrganizationSettings`, `TimeGeneralSettings`) rather than inventing a new visual treatment.

### Anti-tells — the things that scream "AI" (do NOT do)
1. **Tinted "ตัวอย่าง: …" / explainer callout boxes** under fields. Drop them. If a hint is truly
   needed, use one short muted line or a tiny `ⓘ` tooltip — never a colored panel.
2. **A full descriptive sentence under every control.** Trust the label. Microcopy ≤ 1 short muted
   line, and only where it adds real information.
3. **Fill-in-the-blank sentence inputs** ("หากภายใน `[__]` นาที มีการสแกนเกิน `[__]` ครั้ง"). Use
   discrete labeled fields / settings-rows instead ("ช่วงเวลาที่นับ → `[3]` นาที").
4. **Emoji used as icons** (✋ 🎉 ✅ …). Use the project icon set (`@/components/ui/icons`) or a small
   inline SVG. Never emoji.
5. **Repeated identical rows/cards** (e.g. the same shift text in five weekday cells). Collapse the
   repetition (show once + "จ.–ศ.") instead of rendering N identical blocks.
6. **Decorative chrome**: gradients, glows, soft drop-shadows (except modals), wide rounded card
   surfaces stacked on a gray page, numbered/badged section cards, rainbow accent colors.
7. **Over-structuring**: wrapping every small setting in its own bordered card. Group related
   settings into one flat `hr-setting-row` list (see Components) instead.

> **Approved exception — do not "fix" this.** The **multi-step create/edit modal** in
> `ShiftSettingsBoard` uses numbered step sections (`ShiftFormSection`, the `1 2 3 4 5` headers) and
> the product owner has **explicitly approved that look** (`CLAUDE.md §3.1`). Numbered section cards
> are rejected only in **flat settings forms and master/detail right-panes** (`CLAUDE.md §3.2`) — not
> in that step wizard. Leave the shift create modal as-is.

### Do instead
- **Flat forms:** `<h4>`/`GroupHeading` section title → field grid (`grid grid-cols-2 gap-4`) of
  labeled fields. No section cards.
- **Settings lists:** the `hr-setting-row` pattern — label left, control/value right, hairline
  dividers (see Components).
- **Restrained microcopy**, calm spacing, thin neutral borders, indigo `#4f46e5` only for
  active/selected/detail states, status pills per the Status Badge Tones table.
- **Match the surrounding density** — do not introduce a louder/flashier style than the existing
  approved boards. Dark theme is mandatory for every new class.

### Litmus test
If a screen is *teaching* the user with example boxes and narrated sentences, it looks generated.
Ship the version that a busy HR admin would find fastest to scan and edit.

---

## Dark Theme

Override classes live under `.hr-theme-dark` in `globals.css`. Every new component must
define dark overrides. Use CSS variable tokens (`var(--hr-surface)` etc.) rather than
hardcoded hex values so dark mode works by swapping the variables.

---

## CSS convention

All HR styles → semantic `hr-*` classes in `globals.css`.
Tailwind utilities → one-off layout only (grid spans, margins, flex, padding adjustments).
Do **not** build repeated UI patterns with long Tailwind utility chains.

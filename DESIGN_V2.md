# Design System V2 — G-HUB HumanSource

> **Source of truth:** the approved **Holiday Management UI** (`design-samples/holiday-management.html`).
> Everything here is extracted from that screen — not from theory, Material, Tailwind defaults, or other SaaS.
> `DESIGN.md` / `PRODUCT.md` / `CLAUDE.md` still govern **product direction & UX philosophy**.
> For **visual design**, the Holiday Management UI is the highest authority. On conflict, it wins.

Companion files: [`DESIGN_TOKENS_V2.json`](DESIGN_TOKENS_V2.json) · [`COMPONENT_RULES_V2.md`](COMPONENT_RULES_V2.md) · [`LAYOUT_RULES_V2.md`](LAYOUT_RULES_V2.md) · [`DESIGN_GOVERNANCE_V2.md`](DESIGN_GOVERNANCE_V2.md)

---

## 1. Design Philosophy

**Tool first, impression second.** Every HumanSource screen is a work surface for an HR admin who lives in it for hours. The interface should disappear into the task. The Holiday Management UI demonstrates this:

- The **page itself is the surface** — a full-bleed white content area on a light gray shell. There is no decorative card wrapping the table.
- **Flat over layered.** One border, one hairline divider, one accent. No nested cards, no glow, no gradient. The only shadows in the system live on things that genuinely float (dropdown, popover, drawer, modal, tooltip, toast).
- **Earn every accent.** Indigo `#4f46e5` appears only on active/selected/focus/today — never as decoration. The primary action button is **dark `#111827`, not indigo**; indigo is reserved for state, so a solid indigo button would dilute the signal.
- **Restrained microcopy.** Labels are trusted. Hints are one short muted line or a small `ⓘ` tooltip — never a tinted callout box, never a sentence under every field.

This is the opposite of the "AI-generated module" look (numbered badge cards, gradient headers, example boxes). If a screen is *teaching* the user with decorated panels, it has drifted from V2.

---

## 2. Visual Language

| Trait | How V2 expresses it |
|---|---|
| **Palette** | Restrained. Neutral gray ramp (`#f6f7fa` → `#0f172a`) carries 90%+ of the surface. One indigo accent. Status & category color used only in pills/dots. |
| **Shape** | Soft but tight radii: chips `0.375rem`, controls `0.5rem`, cards/wraps `0.625rem`, modal `0.75rem`, pills full-round. Nothing is sharp; nothing is balloon-round. |
| **Depth** | Mostly flat (borders + hairlines). Elevation is a *signal of floating*, applied in a deliberate ladder (resting → dropdown → popover → drawer → modal → tooltip). |
| **Borders** | `#e2e8f0` for structural borders, `#edf1f6` for internal hairlines (table rows, setting-row dividers). 1px only — a thicker colored side-stripe is never used. |
| **Icons** | Line/stroke icons, `stroke-width 1.6`, round caps, `currentColor`. Sizes 0.875 / 1 / 1.25rem. **Never emoji.** |
| **Type** | One family — **Kanit** — in five weights. No display/body pairing; hierarchy comes from weight + size, not from a second typeface. |
| **Color for status** | Always **color + text** together (pill has a dot *and* a label). Never color-only. |

---

## 3. Typography

Single family **Kanit** (300/400/500/600/700). Fixed rem scale — not fluid/clamp — because users view at a consistent DPI inside a task.

| Role | Size / Weight | Extracted from |
|---|---|---|
| Stat value | 1.5rem / 700, tracking -0.02em | `.statstrip__value` |
| Page title | 1.25rem / 700, tracking -0.01em | `.page-title` |
| Section title | 1rem / 600 | drawer/modal/calendar/empty titles |
| Body / data | 0.875rem / 400 | table cells, inputs, options |
| Label | 0.8125rem / 500–600 | chip, setting-row, fgroup head, button |
| Small label | 0.75rem | field label, breadcrumb, table header (600, uppercase) |
| Micro | 0.72rem / 300–500 | pills, hints, errors, tooltip, meta |

Descriptive text (subtitles, hints, empty-state body) uses weight **300**. Labels and buttons use **500–600**. Headings/numbers use **700**.

---

## 4. Information Density

The Holiday Management table sets the density baseline for the whole module:

- **Table row padding `0.7rem 1rem`**, body text `0.875rem`, hairline `#edf1f6` between rows. Dense enough to scan many rows; not cramped.
- **Controls are `2.25rem` (h-9) tall**, chips `2rem`. Consistent vertical rhythm across toolbar, form, and table.
- **A toolbar is one line**: search on the left, filter chips + view toggle on the right. Filters are chips (`label ▾` → `value ×`), not a separate filter panel.
- **Summary is a flat stat strip**, not a grid of floating cards — four segments divided by hairlines inside one bordered surface.

Match this density on every new HumanSource screen. Do not introduce a looser, airier layout or a denser spreadsheet-grid; both break the "same team" feel.

---

## 5. HR Design Direction

HR screens are **list + focused editor**:

- **List view = full-bleed table** on the white surface, with a stat strip + toolbar above and pagination below.
- **Create/edit = a right-side Drawer** (slides under the sticky topbar) — a progressive surface, lighter than a full modal. The topbar stays visible and usable while the drawer is open.
- **Forms are flat**: a `fgroup` heading (0.8125rem/600) followed by a 2-column field grid. No section cards, no numbered badges.
- **Destructive confirmation = a small centered modal** with a danger-toned icon and an explicit danger button.
- **Empty / loading / error are first-class**: dashed-indigo empty state, skeleton rows for loading, inline field errors with a message (never a silent red border).

Accent indigo marks the *current* thing (selected row, active filter, focused field, today). Status uses the green/amber/slate/indigo pill set.

---

## 6. ERP Design Direction

Other HumanSource/ERP domains (Employee, Leave, Payroll, Shift, Organization, Asset, Inventory, Purchase Request/Order) inherit the **same** language — the goal is "designed by one team":

- Same shell (icon rail + topbar), same toolbar grammar, same table, same drawer-for-edit, same pill vocabulary, same density.
- Category color (like holiday `public/company/branch`) generalizes to **domain accents used only in dots/tags** — never as surface fills.
- Heavier ERP data (multi-column ledgers, PR/PO lines) may run denser *within the table* (tables at 120ch+ are fine) but keep the same cell padding, header style, and hairline dividers.
- New domain needs a control that doesn't exist yet? Propose an addition to `COMPONENT_RULES_V2.md` first — do not invent a one-off style on the page (see Governance §Future Rule).

---

## 7. UX Principles (extracted)

1. **Progressive over interruptive.** Reach for a Drawer before a full-screen modal; reach for inline before a Drawer. Modal is for destructive confirms and true blocking decisions only.
2. **State is never silent.** Every required field has a *message*, not just a red border; the save action scrolls to and focuses the first invalid field. Loading shows skeletons, not spinners. Empty states teach the next action.
3. **One accent, earned.** Indigo = "this is current/active". Dark = "this is the primary action". Red = "this is destructive/error". Nothing else competes.
4. **Color + text, always.** Status and category never rely on color alone.
5. **Dark theme is parity, not a port.** Every component ships `.hr-theme-dark` values from day one (tokens swap; structure doesn't).
6. **Reduced motion is mandatory.** All transitions collapse under `prefers-reduced-motion`. Motion conveys state (open/close/select/load), never decoration; 120–240ms, expo-out, no bounce.
7. **Semantic classes, not utility chains.** Reusable HR UI lives in `hr-*` semantic CSS; Tailwind utilities are for one-off layout only.

---

## 8. What V2 explicitly bans (from the approved UI's restraint)

- Floating card grids on gray; nested cards; numbered/badge section headers.
- Gradients, glows, resting drop-shadows on cards/tables.
- Native `<select>` (use the custom select), emoji-as-icons, tinted "ตัวอย่าง:" callout boxes, a descriptive sentence under every control.
- Indigo (or any saturated color) on inactive/decorative elements.
- A second type family for "flavor".
- Marketing/landing treatments on auth or tool surfaces (focused auth surface only).

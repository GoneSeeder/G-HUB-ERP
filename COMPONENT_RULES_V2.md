# Component Rules V2 — G-HUB HumanSource

> Extracted from the approved Holiday Management UI (`design-samples/holiday-management.html`).
> Tokens referenced here are defined in [`DESIGN_TOKENS_V2.json`](DESIGN_TOKENS_V2.json).
> Every component must ship light + `.hr-theme-dark`, and degrade under `prefers-reduced-motion`.

Global conventions:
- **Control height** `2.25rem` (chips `2rem`). **Radius** controls `0.5rem`, chips `0.375rem`, cards `0.625rem`, modal `0.75rem`, pills full-round.
- **Focus** (text/select controls): `border-color #818cf8` + `box-shadow 0 0 0 3px rgba(99,102,241,0.12)`.
- **Transitions** 120–160ms on hover/focus; expo-out `cubic-bezier(0.16,1,0.3,1)` for enter.
- **Icons**: stroke, `stroke-width 1.6`, `currentColor`, sizes 0.875/1/1.25rem. No emoji.

---

## Button

Four variants. **Primary is dark, not indigo** (indigo is reserved for state).

| Variant | Fill / border | Text | Use |
|---|---|---|---|
| `--primary` | bg `#111827` (hover `#1f2937`), shadow `0 1px 2px rgba(15,23,42,.08)` | `#fff` | the one main action per surface (เพิ่ม / บันทึก) |
| `--secondary` | border `#e2e8f0`, bg surface | `#64748b` → `#0f172a` on hover (bg `#edf1f6`) | cancel, export, neutral |
| `--ghost` | transparent | `#64748b` → hover bg `#edf1f6` | row actions, low-emphasis |
| `--danger` | border `#fecdd3`, bg `#fff1f2` | `#be123c` | destructive (ลบ) |

- **Size:** height `2.25rem`, padding `0 0.9rem`, gap `0.45rem`, font `0.8125rem/600`, radius `0.5rem`.
- **States:** default / hover (bg or border shift) / focus (ring) / **disabled** = `opacity 0.5` + `cursor:not-allowed` + `pointer-events:none` (e.g. the `นำเข้า .xlsx` placeholder).
- **Dark:** `--primary` becomes indigo `#4f46e5` (hover `#6366f1`) because dark-on-dark fails; `--danger` becomes translucent rose.
- **A11y:** icon-only buttons need `aria-label` / `title`. Min 1.85rem hit area for `iconbtn`.

---

## Input (text)

- Height `2.25rem`, padding `0 0.7rem`, border `1px #e2e8f0`, radius `0.5rem`, bg surface, font `0.875rem`.
- Placeholder `#94a3b8`. Focus ring as global. Label above: `0.75rem/500 #64748b`, gap `0.3rem`.
- **Error state:** wrap field with `--error` → control border `#f43f5e` + ring `rgba(244,63,94,.12)`, and a `field__error` message row shows (`0.72rem #e11d48` with a small alert icon). **A red border without a message is not allowed.**
- Error clears on input. Hint (optional) = one line `0.72rem/300 #94a3b8` — never a tinted box.

---

## Select (custom — never native `<select>`)

- Trigger: same box as Input (`2.25rem`, border, radius `0.5rem`). Shows value or placeholder (`#94a3b8` via `data-placeholder`). Caret = rotated chevron, `#94a3b8`.
- Menu: absolute below (`top: 100% + 0.25rem`), `z-index 50`, border `#e2e8f0`, radius `0.5rem`, padding `0.25rem`, shadow `0 16px 32px rgba(15,23,42,.14)`.
- Option: padding `0.5rem 0.7rem`, radius `0.375rem`, hover bg `#edf1f6`. **Selected** = bg `#eef2ff`, text `#4338ca`, weight 600, check icon visible.
- **Behavior (required):** click-outside closes, Esc closes, selecting closes + clears the field error.
- **Clipping rule:** inside a scrolling container (drawer body), the menu must escape the `overflow` (use fixed positioning anchored to the trigger). Verified bug in V1 drawer — do not regress.

---

## Textarea

- Same border/radius/focus as Input. `min-height 4.5rem`, padding `0.55rem 0.7rem`, `line-height 1.5`, `resize: vertical`. Optional, never required for primary flows.

---

## Search Field

- Two forms, both `2.25rem`: **toolbar search** (`min-width 15rem`, bg `#f6f7fa`, leading search icon) and **topbar search** (`width min(22rem,40vw)`).
- Leading magnifier icon `#94a3b8`. `focus-within` raises border `#818cf8` + ring. Placeholder muted.
- **Position rule:** search sits on the **left** of the toolbar; filters/actions on the right.

---

## Filter Controls (filter chip)

- Chip: height `2rem`, padding `0 0.625rem`, radius `0.375rem`, border `#e2e8f0`, font `0.8125rem/400`.
- **Inactive:** `ประเภท ▾` (label + caret). **Active:** `value ×` with border + text recolored to accent `#4f46e5` and a clear (`×`) affordance.
- Dropdown: `z-index 50`, min-width `11rem`, shadow `0 12px 28px rgba(15,23,42,.12)`; items `0.4rem 0.625rem`, hover bg `#edf1f6`; optional leading swatch for category/status.
- Group: `.filter-chip-group`, gap `0.5rem`, right-aligned in toolbar, followed by the primary action button.
- **View toggle** (segmented) lives here too: `2px` inset track on `#f6f7fa`, active segment = surface + `0 1px 2px` shadow.

---

## Table

- No card wrapper — wrap is just `border #e2e8f0 + radius 0.625rem` on surface; horizontal scroll below `min-width 60rem`.
- **Head:** bg `#f8fafc`(~page 60%), `th` = `0.75rem/600 #94a3b8 uppercase`, padding `0.7rem 1rem`, bottom border `#e2e8f0`. Numeric/action columns right-aligned.
- **Row:** `td` padding `0.7rem 1rem`, bottom hairline `#edf1f6` (last row none), hover bg ~page 55%.
- **Cell text ladder:** primary `0.875rem/500 #0f172a`; secondary/meta `0.72–0.75rem #94a3b8`; code = monospace `0.72rem #94a3b8`; a leading category swatch (`0.4rem` bar) is allowed.
- **Row actions:** `iconbtn` group, **revealed on row hover/focus** (opacity 0→1), danger action gets rose hover.
- **Loading:** skeleton rows (shimmer), not a spinner. **Empty:** see Empty State.

---

## Badge (status pill)

- Shape: full-round, padding `0.2rem 0.55rem`, font `0.72rem/500`, with a `0.4rem` dot **plus** a text label.
- Tones: green = ใช้งาน/active, amber = ร่าง/pending, slate = ปิดใช้งาน/inactive, indigo = info/on-leave (values in tokens `color.status`).
- **Never color-only** — the text label is mandatory. Category tags use the same shape with `category` dot colors (public/company/branch).

---

## Tabs

- Underline tabs: `border-b-2 -mb-px`, active = accent text + accent underline, inactive = `#64748b` → hover `#0f172a`. (In V1 the segmented control covers list/calendar; underline tabs are the secondary in-page tab pattern.)
- Optional count pill inside a tab: tiny `0.72rem/600` round pill, accent-soft when active else slate.

---

## Modal (blocking / destructive only)

- Backdrop `rgba(15,23,42,.45)`, `z-index 120`; modal `z-index 130`, centered, `width min(26rem,…)`, radius `0.75rem`, shadow `0 24px 60px rgba(15,23,42,.28)`.
- Enter: `modalIn` 200ms expo-out (fade + 8px rise + slight scale).
- Anatomy: body row = tone icon (`2.5rem` rounded, e.g. danger rose) + title `1rem/600` + text `0.8125rem/300`; foot = right-aligned secondary + primary/danger.
- **Use only** for destructive confirm or a true blocking decision (see Governance).

---

## Drawer (primary create/edit surface)

- Right-anchored, `width min(30rem,100vw)`, **`top: 0; height: 100vh`**, border-left, shadow `-16px 0 40px rgba(15,23,42,.14)`, **`z-index 116`** (above topbar at 115).
- Drawer overlays the topbar completely; the scrim (`z 100`, `rgba(15,23,42,.42)`) dims content but sits below the topbar.
- Enter: `transform translateX` 240ms expo-out.
- Anatomy: head (title `1rem/600` + subtitle `0.75rem/300` + close `×`), scrollable body (`fgroup` + field grid + setting-rows), foot (draft toggle on the left, cancel + primary on the right).
- **Required:** Esc closes, scrim click closes, **explicit Save/Cancel — never auto-save**, form resets on open.

---

## Tooltip

- Trigger = small `ⓘ` icon (`#94a3b8`, hover accent), `tabindex=0`. Bubble appears above, `z-index 200`.
- Bubble: dark `#0f172a` (dark theme `#1e293b` + border), text `#f1f5f9 0.72rem/300`, padding `0.45rem 0.6rem`, radius `0.45rem`, max-width `15rem`, caret triangle, shadow `0 6px 18px rgba(15,23,42,.24)`.
- Shows on hover **and** focus. Use for one complex field — not as a replacement for clear labels, and never a tinted inline callout.

---

## Pagination

- Row: `border-t`, info on the left (`แสดง 1–8 จาก 24 รายการ`, bold counts), nav buttons on the right.
- Button: min `2rem` square, border `#e2e8f0`, radius `0.4rem`, `0.8125rem/500`; **active** = accent fill `#4f46e5` + white; prev/next carry chevron icons and disable at ends (`opacity 0.4`).

---

## Empty State

- Dashed indigo border `#c7d2fe`, soft indigo tint bg `rgba(238,242,255,.5)`, radius `0.625rem`, `min-height 18rem`, centered.
- Icon in a **white box** (`3.25rem`, radius `0.625rem`, resting shadow, accent icon) → title `1rem/600` → desc `0.875rem/300 #64748b` (max ~26rem) → action row (secondary + primary).
- Teaches the next action (e.g. ล้างการค้นหา / เพิ่มวันหยุด). Dark theme swaps to translucent indigo.

---

## Loading State

- **Skeleton**, never a centered spinner inside content. Skeleton blocks use the shimmer gradient (`@keyframes sk`, 1.2s) over `#edf1f6`/border tones, with realistic shapes (swatch bar + two text lines per table row).
- Swap skeleton → real data once ready. Under `prefers-reduced-motion`, the shimmer animation collapses.

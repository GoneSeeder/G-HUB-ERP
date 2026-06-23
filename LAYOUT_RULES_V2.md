# Layout Rules V2 — G-HUB HumanSource

> Extracted from the approved Holiday Management UI (`design-samples/holiday-management.html`).
> Tokens in [`DESIGN_TOKENS_V2.json`](DESIGN_TOKENS_V2.json); components in [`COMPONENT_RULES_V2.md`](COMPONENT_RULES_V2.md).

---

## App Shell

- CSS grid: `grid-template-columns: 4rem 1fr; grid-template-rows: 3.5rem 1fr;` areas `rail / topbar / main`.
- Shell bg `#f6f7fa`; content surfaces are white. The shell, not a card, frames the page.
- Stacking order (z): dropdown 50 < sticky 60 < drawer-backdrop 100 < drawer 110 < **topbar 115** < modal-backdrop 120 < modal 130 < tooltip 200. Define these tokens on `:root` (overlays render outside `.hr-shell`, so they must resolve there too).

## Sidebar (icon rail)

- Width `4rem`, sticky full height, border-right `#e2e8f0`, bg rail token.
- Brand logo chip on top (`2.25rem`, radius `0.625rem`, accent fill). Items = `2.5rem` rounded squares, `#94a3b8` → hover soft; **active** item = accent text + `#eef2ff` bg + a `3px` accent marker on the left edge.
- A spacer pushes settings + "กลับ G-HUB" to the bottom.
- **< 860px:** rail collapses (`grid-template-columns: 0 1fr`, rail hidden); navigation moves to the topbar.

## Header (topbar)

- Height `3.5rem`, sticky, `z-index 115` (above drawer), border-bottom `#e2e8f0`.
- Left: global search (`min(22rem,40vw)`). Right (pushed by a spacer): theme toggle, notification (with dot), user block (avatar + name/role).
- Topbar stays fully visible and interactive while a drawer is open.

## Toolbar (per page)

- One flex row, `justify-content: space-between`, gap `0.75rem`, `margin-bottom 1rem`, wraps on narrow.
- **Left:** search field. **Right:** filter-chip group → view toggle (segmented) → primary action button.
- Don't build a separate filter panel/sidebar — filters are chips inline.

## Filter Area

- Filter chips (`label ▾` → `value ×`) grouped right, gap `0.5rem`. Category/status chips may carry a leading swatch.
- A segmented **view toggle** (e.g. รายการ / ปฏิทิน) sits at the end of the chip group when a page has multiple views.
- Above the toolbar, an optional **stat strip**: one bordered surface (`radius 0.625rem`) split into equal segments by hairlines — **not** a row of floating cards. Each segment: label+dot (`0.75rem`), value (`1.5rem/700`). Collapses to 2 columns < 860px.

## Table Area

- Full-bleed under the toolbar; wrap = border + `radius 0.625rem`, horizontal scroll below `min-width 60rem`.
- Header `0.75rem/600 uppercase #94a3b8`; rows `0.7rem 1rem` padding, hairline dividers, hover tint; numeric/action columns right-aligned; row actions reveal on hover.
- Pagination row sits directly below the wrap (border-top, info left / nav right).
- Empty and skeleton states replace the table body in place (see component rules).

## Form Layout (in Drawer/Modal)

- Group by **`fgroup`**: a heading (`0.8125rem/600`) then a **2-column field grid** (`fgrid`, gap `0.75rem 0.85rem`); full-width fields span both columns; **< 860px collapses to 1 column**.
- Field = label (`0.75rem/500`, gap `0.3rem`) over control; error message row appears under the control when invalid.
- Grouped toggles/policies use the **setting-row** pattern: label left, control right, hairline dividers, inside a bordered list — not one card per setting.
- **No section cards, no numbered badges** in flat forms.

## Modal Layout

- Centered, `width min(26rem,…)`, radius `0.75rem`. Body = tone icon + title + text; foot = right-aligned actions. Reserved for destructive confirm / blocking decision.

## Drawer Layout

- Right-anchored, `width min(30rem,100vw)`, starts at **`top:3.5rem`** (under topbar), height `calc(100vh - 3.5rem)`.
- Three regions: fixed head (title/subtitle/close), scrollable body (`padding 1.25rem`, `fgroup`s), fixed foot (draft toggle left, cancel + save right).
- Scrim dims content (`z 100`); topbar (`z 115`) stays above. This is the **default** create/edit surface for HR.

## Spacing rhythm

Use the extracted steps: `0.25 / 0.4 / 0.5 / 0.7 / 0.75 / 1 / 1.1 / 1.25 / 1.5 / 2 rem`. Page padding `1.5rem 2rem` (`1.25rem` < 860px). Don't introduce arbitrary spacing outside this rhythm.

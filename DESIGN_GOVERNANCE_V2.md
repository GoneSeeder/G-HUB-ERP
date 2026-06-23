# Design Governance V2 — G-HUB HumanSource

> When to use which pattern. Extracted from the decisions embodied in the approved Holiday Management UI
> (`design-samples/holiday-management.html`). Tokens/components/layout: see the companion V2 files.

---

## Decision: when to use a **Modal**

Use a modal **only** for:
- A **destructive confirmation** (delete, disable, irreversible action) — the holiday delete confirm is the reference.
- A true **blocking decision** the user must resolve before anything else continues.

Do **not** use a modal for create/edit forms — that is the Drawer's job. "Modal as first thought" is a smell; exhaust inline → drawer first.

## Decision: when to use a **Drawer**

Use a right-side drawer for:
- **Create / edit** of a record (Add Holiday is the reference).
- Multi-field forms that benefit from staying in context of the list behind them.

Rules: starts under the topbar (`top:3.5rem`), explicit Save/Cancel (**never auto-save**), Esc + scrim-click close, form resets on open. Prefer the drawer over a full-screen modal for editing.

## Decision: when to use a **Table**

Use a table for any **list of like records** (holidays, employees, leave types, shifts, PR/PO lines…):
- Full-bleed on the white surface, stat strip + toolbar above, pagination below.
- Row actions reveal on hover; status as pills; primary identifier + muted secondary line per cell.
- Use skeleton rows while loading, empty state when no rows.

Don't render a list of records as a grid of cards — the table is the canonical list surface.

## Decision: when to use a **Card**

Default: **don't.** The system is flat; the page is the surface.
- A "card" is acceptable only as a **single bordered container** that groups genuinely related content (e.g. the stat strip's one bordered surface, the setting-row list's bordered group, the calendar grid wrap).
- **Never** nest cards, never make a grid of identical icon+title+text cards, never float cards on the gray shell with shadows. If you're reaching for cards to "organize," use a flat `fgroup` + grid or a setting-row list instead.

## Decision: when to use an **Empty State**

Use the dashed-indigo empty state when a list/area has **no data to show** *and* there's a next action to teach:
- Search/filter returns nothing → empty state with "clear" + primary action.
- A not-yet-populated section (e.g. HR account "ไม่มีข้อมูลบริษัท") → empty state guiding the link step.

It must teach the next step (action buttons), not just say "nothing here."

## Decision: when to use a **Detail Panel** (master/detail)

Use master/detail (left list + right flat panel) only when there is a **strong list of things** whose details are edited in place and benefit from staying beside the list (e.g. holiday calendars, org structure).
- The right panel must be **flat** — `fgroup` headings + field grid / setting-rows. No nested cards, no numbered section badges.
- If the edit is a discrete create/edit of one record, prefer the **Drawer** instead.

---

## Future Rule (binding)

Once V2 exists, **every new HumanSource screen** — Employee, Leave, Payroll, Shift, Organization, Asset, Inventory, Purchase Request, Purchase Order — must be built from:
- `DESIGN_TOKENS_V2.json`
- `COMPONENT_RULES_V2.md`
- `LAYOUT_RULES_V2.md`

**Do not** invent new styles or component patterns on a page. If a screen genuinely needs something the system lacks:
1. Propose the addition as an edit to the relevant V2 file (with the rationale and where it'll be reused).
2. Get it into V2.
3. Then build with it.

This keeps the promise of the Success Criteria: every HumanSource page feels designed by one team — same visual language, same information density, same component patterns, same UX direction.

## Conflict resolution

- **Visual** conflict between V2 and `DESIGN.md`/`AGENTS.md` → **V2 wins** (it is extracted from the approved UI).
- **Product / UX-philosophy** questions → `PRODUCT.md` / `DESIGN.md` / `CLAUDE.md` still lead.
- The approved Holiday Management UI is the tie-breaker artifact; if a V2 doc and the UI disagree, the **UI** is correct and the doc should be fixed.

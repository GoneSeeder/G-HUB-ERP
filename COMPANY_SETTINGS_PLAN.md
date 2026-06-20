# Company Settings Plan — Group 1 "ตั้งค่าบริษัท"

> **Audience:** the implementing engineer (Sonnet). You will not see the design
> conversation that produced this plan — everything you need is in this document.
> Read `CLAUDE.md`, `DESIGN.md`, `apps/frontend/src/components/humansource/AGENTS.md`,
> and the existing `LEAVE_SETTINGS_PLAN.md` before you start, but treat **this file**
> as the spec for the company/org settings group.

> **WORKING AGREEMENT (how to proceed — important).** Before writing code for any phase, **analyze
> thoroughly first**: read the referenced files, trace the actual `getSettingsPath` rewrite and the
> real seeds/ids, and confirm your assumptions against the codebase rather than guessing. If
> something in this plan is ambiguous or conflicts with what you find, **resolve it by investigating
> the code first.** Only if you are *still* genuinely unsure after a careful analysis should you stop
> and **ask the user** — do not silently guess on a load-bearing decision. (User's words:
> "อยากให้ sonnet วิเคราะห์ให้ถี่ถ้วนก่อนหากสงสัยส่วนไหน หากวิเคราะห์ถี่ถ้วนแล้วยังสงสัยสามารถถามผมได้")

> **UI STYLE — must look hand-crafted "HR style", NOT AI-generated (the user cares about this).**
> Every screen must visually match the already-shipped HR boards (leave settings, shift settings,
> org tree) and the flat empeo-style references — calm, flat, intentional. Concretely:
> - **DO:** flat forms = plain `<h4>` `GroupHeading` + a clean field grid (`Field` / `ToggleField`);
>   thin neutral borders (gray-100/200), generous spacing, indigo `#4f46e5` for active/selected/detail
>   states, status pills `bg-emerald-50 text-emerald-700` / `bg-gray-100 text-gray-500`. Reuse the
>   existing `hr-settings-*` / `hr-leave-*` / `hr-org-*` classes so it feels native.
> - **DON'T (these read as "AI-generated", per `CLAUDE.md §3.2`):** numbered section cards / badges
>   wrapping form groups (the `ShiftFormSection` look), gradients, glows, soft drop-shadows (except
>   modals), wide rounded card surfaces stacked on a gray page, emoji-as-icons, rainbow accent colors.
> - **DON'T — "over-helpful chrome" tells (the biggest AI giveaway; user flagged the 2.1
>   `TimeGeneralSettings` screen for these):**
>   - tinted "ตัวอย่าง: …" / explainer **callout boxes** under fields — drop them; if a hint is truly
>     needed use one short muted line or a tiny `ⓘ` tooltip, never a colored panel.
>   - a **full descriptive sentence under every control** — trust the label; keep microcopy to ≤1
>     short muted line, and only where it adds real info.
>   - **fill-in-the-blank sentence inputs** ("หากภายใน [_] นาที มีการสแกนเกิน [_] ครั้ง") — use
>     discrete labeled fields instead ("ช่วงเวลา (นาที)", "จำนวนครั้งสูงสุด").
>   - **repeated identical rows/cards** (e.g. the same shift text in all 5 weekday cells) — collapse
>     repetition (show once + "จ.–ศ.") rather than rendering five identical blocks.
>   The litmus test: a real HR admin tool is **terse and trusts the user**; if a screen is teaching
>   the user with example boxes and narrated sentences, it looks generated. Prefer the calm,
>   right-aligned label+control rhythm of the 1.1 reference screen over the 2.1 explainer style.
> - **Tone:** Clean · Friendly · Modern (`PRODUCT.md`). When in doubt, copy the layout/spacing of an
>   existing approved board rather than inventing a new visual treatment. **Dark theme is mandatory**
>   for every new class. Match the surrounding code's density and rhythm — do not introduce a louder,
>   flashier style. (User: ให้เป็น HR style ที่ดูไม่เป็น AI ทำขึ้น)

> **ARCHITECTURE — MERGED (read first).** This plan was revised after a design review to
> **merge** the old separate items **1.2 "ข้อมูลบริษัท"** and **1.3 "โครงสร้างองค์กร"** into a
> single **master–detail "องค์กร" workspace**: the org tree is the left **master** (it also acts
> as the multi-company switcher — each company is a head node), and selecting a node opens its
> detail on the right (company head → tabbed company form with explicit save; branch → branch
> detail; department/team → inline rename). This **reduces Group 1 from 5 → 4 items** and lets you
> edit a company's real data by clicking its head node, instead of only renaming it.
> Net items: **1.1 การตั้งค่าพื้นฐาน · 1.2 องค์กร (merged) · 1.3 ตำแหน่ง · 1.4 ประกาศ.**
> If you instead want the empeo-style **fully separate** company page (5 items), see
> **§15 "Alternative: keep 1.2 / 1.3 separate"** — only Phase 2 changes; everything else is identical.

---

## 1. Context

The HR settings sidebar has several top-level groups (company, time, payroll, approval,
system). This plan covers **Group 1, `key: 'company'`, title `'ตั้งค่าบริษัท'`** — the
company / organization foundation.

During an earlier design session this group was **restructured from 8 loosely-related items down
to 5**, then a follow-up review **merged the company-data and org-structure items**, landing at
**4 coherent items**:

| # | Label (Thai) | Meaning |
|---|---|---|
| 1.1 | **การตั้งค่าพื้นฐาน** | Basic setup: employee defaults, document running numbers, employee-type master, light personal master lists. |
| 1.2 | **องค์กร** (merged) | Master–detail workspace: org tree (company → branch → department → team) on the **left**; selecting a company head node opens its detail on the **right** — legal entity, per-company work conditions, authorized signers. The tree is also the multi-company switcher. The shipped org-tree board becomes the master pane. |
| 1.3 | **ตำแหน่ง** | Positions + job levels (Level/Grade). |
| 1.4 | **ประกาศ** | Announcements + categories + audience targeting. |

> **Renumbering note (important).** The repo's `navigation.ts` currently still has the pre-merge
> **5-item** layout (1.1 การตั้งค่าพื้นฐาน, 1.2 ข้อมูลบริษัท, 1.3 โครงสร้างองค์กร, 1.4 ตำแหน่ง, 1.5 ประกาศ).
> **Phase 2 performs the nav edit** that removes the standalone `ข้อมูลบริษัท` item and renames
> `โครงสร้างองค์กร` → `องค์กร`, yielding the 4-item layout in the table above.
>
> **The Phase sections (§8–§13) still use the original pre-merge item numbers for continuity**, which
> map to the final 4-item nav as follows:
>
> | Phase body says | Means (final 4-item nav) |
> |---|---|
> | "1.1 การตั้งค่าพื้นฐาน" | **1.1 การตั้งค่าพื้นฐาน** |
> | "1.2 ข้อมูลบริษัท" + "1.3 โครงสร้างองค์กร" | **1.2 องค์กร** (merged — see Phase 2) |
> | "1.4 ตำแหน่ง" | **1.3 ตำแหน่ง** |
> | "1.5 ประกาศ" | **1.4 ประกาศ** |
>
> When the phase text says e.g. "the stub for 1.4" or "1.5's tabs", read it as ตำแหน่ง / ประกาศ —
> the *label* is authoritative, the pre-merge *number* is cosmetic.

Three items were dropped from the old group and are intentionally NOT in scope (see §4.5).

**The goal of this work** is a clean company/organization foundation that becomes the
**single source of truth** feeding the rest of HR: the org structure (1.3) and employee
types (1.1) should be what time, payroll, and leave read from. Concretely, by the end of
this plan the leave-eligibility picker in group 2.5 (`OrgTreeSelect` in
`hr-leave-settings.tsx`) reads the **real org structure** instead of mock display strings,
and `quota.perEmployeeType` resolves against the **real employee-type list**.

---

## 2. Status / already done — do NOT redo

Two things are complete this session. Do not rebuild or "improve" them as part of a phase:

1. **Nav restructure 8 → 5.** The `company` group in
   `apps/frontend/src/data/humansource/navigation.ts` (lines ~83–137) already contains the
   pre-merge **5** top-level items (1.1 การตั้งค่าพื้นฐาน, 1.2 ข้อมูลบริษัท, 1.3 โครงสร้างองค์กร,
   1.4 ตำแหน่ง, 1.5 ประกาศ), with children nested. Group `progress` reads `'1 / 5 พร้อมใช้งาน'`,
   title `'ตั้งค่าบริษัท'`. **The merge → 4 items is NOT done yet**; Phase 2 removes the standalone
   `ข้อมูลบริษัท` item, renames `โครงสร้างองค์กร` → `องค์กร`, and updates `progress` to `'/ 4'`.
   Other phases also add/adjust child paths — those edits are called out per phase.

2. **1.3 โครงสร้างองค์กร (org structure tree).** Fully built in
   `apps/frontend/src/components/humansource/hr-org-structure.tsx` (361 lines) and wired:
   `SettingsWorkbench` in `hr-settings-page.tsx` routes
   `activeItem.path.includes('organization/structure')` → `<OrgStructureBoard accent={accent} />`
   (around lines 403–406). It is a recursive company → branch → department → team CRUD tree
   with inline edit, confirm-delete overlay, and localStorage (`g-hub.hr.org-structure`).
   **Drag-to-reorder was deliberately deferred** (revisited in P6). The component currently
   keeps its `OrgNode` type, `SEED`, and `STORAGE_KEY` as **private, non-exported** consts —
   P2 lifts those into the data layer so they can be shared. That refactor is allowed;
   redoing the tree UI is not. **Under the merge, this board becomes the LEFT (master) pane of
   the 1.2 องค์กร workspace** — P2 wraps it in a master–detail layout and adds the right-hand
   detail pane + node selection. The tree's own CRUD/expand behaviour is reused unchanged.

Everything else in the group (1.1, 1.2, 1.4, 1.5) currently falls through to a generic
stub, `OrganizationSettings` (`hr-settings-page.tsx` ~lines 425–465), which renders the
**same 4 hardcoded toggle cards** for every unmatched company item regardless of selection.
That stub is the placeholder you are replacing. There is no error when an item is unwired —
it silently shows the stub, so confirm your routing by clicking through, not just by tsc.

---

## 3. Design decisions (carry-over — these are settled, do not relitigate)

1. **8 → 5 restructure** is final (see table in §1). `navigation.ts` already reflects it.
2. **1.3 org structure** is the canonical org tree; it is built and wired. Drag-reorder deferred to P6.
3. **Work-conditions split (important — avoid duplication):**
   - **Company-policy *numbers*** live **per-company under 1.2** in a "เงื่อนไขการทำงาน" tab:
     working hours/day, annual cut-off date, late/absent thresholds (in **minutes**),
     probation days, retirement age, payroll day, currency, default shift, weekly holidays.
   - **Shift / holiday / attendance *mechanics*** stay in **Group 2 (ตั้งค่าเวลาการทำงาน)**.
     Do **not** duplicate shift/holiday/attendance UI into group 1. 1.2 only stores the
     policy numbers and may *reference* a default shift id (`workShifts.id`) via `HrCustomSelect`.
4. **Branch level exists in the org tree.** Creating a new company auto-creates one
   `'สำนักงานใหญ่'` branch. Small single-branch orgs can ignore the branch level — it is never
   mandatory in the UI beyond that one auto-created branch.
5. **1.4 ตำแหน่ง = flat list + a `'ระดับ (Level/Grade)'` field for v1.** A HumanSoft-style
   position-*hierarchy tree* is **deferred** — do not build a tree here. Job levels are a
   separate flat list with a `rank` ordering.
6. **Single source of truth.** Org structure (1.3) + employee types (1.1) feed everything.
   Group 2.5 leave eligibility currently reads mock employees/departments by Thai display
   string; **P5 rewires it to read the real org structure and the real employee-type list.**
7. **Dropped from group 1** (and why): see §4.5. Briefly: เวิร์กโฟลว์ and เทมเพลตเอกสาร are
   duplicates of Group 4; the standalone มาสเตอร์ page is gone — its "ประเภทพนักงาน" moved into
   1.1, and คำนำหน้า/สัญชาติ/วุฒิ become a light "master" sub-page under 1.1.
8. **Merged 1.2 องค์กร shape (master–detail, tree as master).** The org tree is the **left
   master** and doubles as the multi-company switcher (each company is a head node;
   `'+ เพิ่มบริษัท'` adds one). Selecting a node opens its **right detail**:
   - **company head** → tabbed detail `นิติบุคคล/นายจ้าง` · `เงื่อนไขการทำงาน` · `ผู้มีอำนาจลงนาม`
     with an explicit **บันทึก** (NOT auto-save);
   - **branch** → branch detail (name, code, province, HQ flag);
   - **department / team** → lightweight inline rename (the tree already does this).
   There is **no separate "สาขา" tab** — branches are tree nodes, so selecting a branch node *is*
   the branch editor. This is permitted by `CLAUDE.md §3.1` (master/detail with a strong left list
   and a **flat** right detail) and `§3.2` (explicit save, not side-panel auto-save). Reference
   tone for the company tabs: HumanSoft company-settings (adapt to HR flat style, do not 1:1 copy).
9. **Stack & rules** — see §5.

---

## 4. Scope clarifications

### 4.1 In scope (this plan)
Build real screens for **1.1, 1.2, 1.4, 1.5**, lift 1.3's data into the data layer,
and rewire 2.5 leave eligibility onto the org/employee-type sources of truth.

### 4.2 The data-layer strategy (read before any phase)
Today the HR org data is fragmented across **three** representations that share no ids:
- `organizationTree` / `positionTree` (`TreeNode`) in `mock.ts` — a parallel tree.
- The `OrgNode` `SEED` private to `hr-org-structure.tsx`.
- The runtime `ORG_TREE` in `hr-leave-settings.tsx`, derived by grouping `employees` by the
  `department` **string**.

`Employee` rows link to org units by **Thai display string** (`position`, `department`,
`branch`, `empType`), not by id — so nothing is referentially stable. The fix threaded
through this plan is: **create dedicated data-layer files, each a single source of truth,
keyed by stable ids, and add foreign-key id fields to `Employee`.** Each phase below creates
its data file first, then its UI.

### 4.3 Demo-only (no backend)
All persistence is **localStorage** with the hydrate-once-then-persist gate (see §5). No API
calls, no server components doing data fetches. Seeds are migrated from `mock.ts`.

### 4.4 Out of scope (everything)
- Any backend / API / database. No network.
- Real `.xlsx` import/export wiring (P6 export is a client-side download stub at most).
- Leave-request runtime, quota balance engine, approval-chain traversal (those are Group 2/4
  runtime concerns, explicitly out per `LEAVE_SETTINGS_PLAN.md` §7).
- Position-hierarchy tree (deferred, decision §5 of design).
- Rich text editor for announcement bodies — use a plain `<textarea>` storing markdown text.

### 4.5 Dropped items — do not resurrect
- **เวิร์กโฟลว์** — duplicate of Group 4 "ลำดับการอนุมัติ" (`hr-approval-workflows.tsx`). Gone.
- **เทมเพลตเอกสาร** — duplicate of Group 4 "ฟอร์มและเอกสาร". Gone.
- **standalone มาสเตอร์ page** — removed. "ประเภทพนักงาน" → moved into 1.1; คำนำหน้า/สัญชาติ/วุฒิ
  → become the light "ข้อมูลพื้นฐาน" master sub-page under 1.1.

---

## 5. Conventions & verification (non-negotiable — from CLAUDE.md + AGENTS.md)

**Stack:** Next.js App Router, TypeScript strict with `noUnusedLocals` ON. Any unused
import/variable/prop you destructure-but-don't-use is a **hard build break**.

**Semantic CSS:** All repeated HR UI uses semantic class names prefixed `hr-*`, defined in
`apps/frontend/src/app/globals.css` (~668 `hr-*` rules already there). **Do not** chain long
Tailwind utility strings for repeated UI. Tailwind utilities are acceptable only for one-off
layout (grid spans, gaps, spacing). Each new component adds its `hr-*` rules to `globals.css`.
Prefix your new classes by feature, mirroring the existing families: `hr-company-*`,
`hr-position-*`, `hr-announce-*`, `hr-basic-*` (or reuse `hr-settings-*` / `hr-leave-*` table
and form classes directly — preferred where they fit).

**No native `<select>`.** Every dropdown uses `HrCustomSelect` from
`apps/frontend/src/components/humansource/hr-ui.tsx` (custom popover, click-outside + Escape
close, selected check, auto-flip, dark-theme aware). Native `<select>` is forbidden.

**Dark theme is mandatory.** Every new component must work under `.hr-theme-dark`. Add
`.hr-theme-dark` overrides in `globals.css` alongside the light rules for every new class.

**localStorage:** keys prefixed `g-hub.hr.*`. Use the **hydrate-once-then-persist** pattern,
canonical in `hr-org-structure.tsx` lines 102–120 and `hr-leave-settings.tsx` lines 171–187:
1. `const [hydrated, setHydrated] = useState(false);`
2. First `useEffect([])`: read key inside `try/catch`, `setState(parsed)` if valid, `setHydrated(true)`.
3. Second `useEffect([state, hydrated])`: `if (!hydrated) return;` then write.

**No nondeterminism in render.** Never call `Date.now()` or `Math.random()` in a render path
(causes hydration mismatch + nondeterministic tests). Generate ids/timestamps **only inside
event handlers** — e.g. `id = \`co-${Date.now()}-${counter.current++}\`` in a save handler.
See `hr-org-structure.tsx` `newId()` at line 128 and `ShiftSettingsBoard.saveShift`.

**Accent / theme prop.** Boards receive `{ accent }: { accent: string }`. The company group
accent is **orange `#ff5a2a`** (from `GROUP_STYLES['company']`), injected as the CSS variable
`--hr-primary` on the section, so `hr-*` classes theme automatically — prefer that.
Use the `accent` string only for one-off inline `style={{ backgroundColor: accent }}` on
primary buttons / active toggles. **If the design calls for HR-indigo detail states inside a
board, hardcode `#4f46e5`** rather than using `accent` (company accent is orange).
Status pills: `bg-emerald-50 text-emerald-700` (on) / `bg-gray-100 text-gray-500` (off).
Flat surfaces — no gradient, no glow, no soft shadow except modals.

**Rejected patterns — do not reuse:**
- Numbered section cards (`hr-shift-section`, `ShiftFormSection` in `hr-settings-page.tsx`
  ~1560) — looks AI-generated. Use the flat `GroupHeading` + `Field` grid instead.
- Auto-save inline edit on a side detail panel — use explicit save via modal create/edit.
  (Inline-edit-in-place on the org *tree of names* is fine; that is not a detail panel.)
- Indigo number badges, gradient/glow cards stacked on gray. HR is flat.

**Thai for user-facing text**; English for identifiers, code comments, commit messages, docs.

**Verification — both must exit 0 before you call any phase done:**
```powershell
cd apps/frontend
.\node_modules\.bin\tsc.cmd --noEmit
.\node_modules\.bin\eslint.cmd src/components/humansource
```
One pre-existing warning is tolerated: `customForActive` useMemo dep in
`hr-holiday-year-calendar.tsx`. **No new warnings.** Also click through the route in the
browser — the stub-fallthrough means tsc can pass while a screen is silently unwired.

---

## 6. Reusable building blocks (reuse these — do not reinvent)

All paths absolute. Line numbers are at time of writing; if drifted, grep the symbol name.

### Page-level CRUD scaffolds
- **List table + fullscreen modal (DEFAULT skeleton)** — `LeaveSettings`,
  `C:\Users\User\Desktop\G-HUB\apps\frontend\src\components\humansource\hr-leave-settings.tsx:163`.
  Toolbar (count + search + accent "add") → table of rows (row click = edit, inline toggle,
  edit/delete buttons) → empty-state row → one fullscreen modal for create/edit → separate
  confirm-delete dialog. This is the user-approved pattern; use it for 1.1 employee-type,
  1.4 positions/levels, 1.5 announcements, 1.2 branches/signers.
- **List table + fullscreen modal with seed+custom merge** — `ShiftSettingsBoard`,
  `hr-settings-page.tsx:792`. Reuse its **table/toolbar classes**: `hr-settings-toolbar`,
  `hr-settings-search`, `hr-settings-filter`, `hr-settings-primary-action`, `hr-settings-table`
  with `__primary`/`__secondary`/`__code`/`__detail`/`__company` cells,
  `hr-settings-status--enabled/--disabled` pills. **Do NOT copy its `ShiftFormSection`
  numbered cards** (rejected).
- **Recursive tree CRUD (already built)** — `OrgStructureBoard`, `hr-org-structure.tsx:94`.
  Reference for the org-node model and tree helpers (`renameNode`/`addChildNode`/`removeNode`).
- **Master/detail with list-on-left** — `PayrollSettingsForm`, `hr-settings-page.tsx:1689`.
  Reference shape for **1.2's company list → detail with tabs** (keep the right pane flat).

### Selection / picker controls
- **Cascading org-tree multi-select** — `OrgTreeSelect` + `TriCheck`,
  `hr-leave-settings.tsx:1241` (and `TriCheck` ~1402, `ORG_TREE` builder ~105). Tri-state
  cascading checkbox tree, removable summary chips (`hr-leave-chip`). **This is the component
  P5 rewires onto the org SoT, and the one 1.5's audience picker should share.**
- **`HrCustomSelect`** — `hr-ui.tsx:107`. The mandatory dropdown. Props
  `{ value, options, onChange, label, className }`, `options` is
  `(string | {value,label,description?})[]`.
- **Picker popovers** — `TimePicker24` (`hr-settings-page.tsx:1311`), `ShiftColorPicker`
  (`:1435`), `ColorSwatchPicker` (`hr-leave-settings.tsx:872`, palette `LEAVE_COLORS` at :33).
  Use `ColorSwatchPicker` for announcement-category colors.

### Form primitives (the approved flat-form vocabulary)
- **`Field` / `ToggleField` / `GroupHeading`** — `hr-leave-settings.tsx:816` / `:846` / `:812`.
  Build every modal body from `<GroupHeading>` section titles over `hr-leave-form__grid` of
  `<Field>`s. Inputs use `hr-leave-input` (+ `--mono` / `--num`). This replaces numbered cards.
- **`CollapsibleSection`** — `hr-leave-settings.tsx:785`. Closed-by-default disclosure for
  advanced/optional fields.
- **Editable tier/row table** — `TenureTierTable`, `hr-leave-settings.tsx:1090`. Add/remove/edit
  rows; reuse for any N-row editable table (e.g. job-level salary bands if added).

### Dialogs & misc
- **Confirm-delete dialog** — `DeleteLeaveConfirm` (`hr-leave-settings.tsx:1432`); tree variant
  inline in `hr-org-structure.tsx:297`. Use for every destructive action.
- **Cross-module summary + deep-link** — `ApprovalForm` (`hr-leave-settings.tsx:915`, helper
  `readLeaveDocConfig` :898). Pattern for referencing another module's config read-only with a
  deep link instead of duplicating it. Reuse if 1.2 work-conditions needs to point at Group 2.
- **Icons** — import from `@/components/ui/icons`:
  `PlusIcon, EditIcon, TrashIcon, XIcon, CheckIcon, SearchIcon, ArrowLeftIcon, CalendarIcon`.
  For tree carets reuse the `CaretIcon` path from `hr-org-structure.tsx:326`.

### Routing wiring (how a new board gets rendered)
The whole company group is dispatched in **`SettingsWorkbench`** (`hr-settings-page.tsx:392`).
The company branch is (current state):
```ts
if (group.key === 'company') {
  if (activeItem.path.includes('organization/structure')) {
    return <OrgStructureBoard accent={accent} />;
  }
  return <OrganizationSettings topic={topic} accent={accent} />;   // generic stub fallback
}
```
**To wire a new board:** (1) create the component file; (2) add its import near
`hr-settings-page.tsx:19` (where `OrgStructureBoard` is imported); (3) add a
`activeItem.path.includes('<stable-substring>')` branch **inside** the `group.key === 'company'`
block, **before** the `OrganizationSettings` fallback, **ordered most-specific-first**.

**Path-rewrite gotcha (critical):** nav-data paths for company items live under
`/humansource/organization/...` and `/humansource/settings/...`. `getSettingsPath`
(`hr-settings-page.tsx:1935`) rewrites them into canonical
`/humansource/settings/company/...` form. For `organization`-sourced items the rewritten
`activeItem.path` contains `company/organization/<leaf>` (that is why the structure branch
matches `'organization/structure'`). Your `.includes()` substring must appear in the
**rewritten** path that `SettingsWorkbench` receives. Use a **specific, stable** substring
(e.g. `'organization/positions'`, `'organization/companies'`, `'company/announcements'`),
never a broad one, and order specific branches before general ones (substring matching is
top-down). When a board grows many sub-screens, consider a sub-dispatcher like
`TimeSettingsTable` (`hr-settings-page.tsx:467`, its `.includes()` chain ~478–492) — see P1/P2.

**Tabs:** `FocusPage` (`hr-settings-page.tsx` ~283–294, render ~361–380) turns a topic's
`children` into the first 6 tabs automatically. A tab is active when
`normalizePath(tab.path) === activePath`. If your board owns the whole pane and renders its
own internal layout (no auto-tabs wanted), add the topic's **raw nav path** to the
`hideAutoTabsPaths` array (~283–288) — it compares against `activeTopic.path`, the raw nav-data
path, **not** the rewritten one. For 1.4 ตำแหน่ง the topic has two children (ตำแหน่งงาน/ระดับงาน)
so leaving auto-tabs on is correct; for 1.2 (company list/detail board owning the pane) you
will suppress them.

**Per `HUMANSOURCE_PHASE2_HANDOFF`:** the canonical routing convention is a thin
`app/(protected)/humansource/<path>/page.tsx` that imports the component. The settings group,
however, is query-driven (`/humansource/settings?path=...`) and dispatches inside
`SettingsWorkbench` — so for these company items **the dispatch branch IS the wiring**; you do
not need new `page.tsx` files. Do not add UI to the legacy catch-all `[[...slug]]/page.tsx`.

---

## 7. Phasing overview & ordering rationale

| Phase | Deliverable | Depends on |
|---|---|---|
| **P1** | 1.1 การตั้งค่าพื้นฐาน — employee-type CRUD (data SoT) + employee-defaults + running-no + personal master-lite | — |
| **P2** | 1.2 องค์กร (merged) — refactor the org tree into a master–detail board (tree master + company/branch detail tabs incl. work-conditions); lift org-structure data layer; nav 5→4 | mainly standalone; lifts org-structure data layer that P4/P5 need |
| **P3** | 1.4 ตำแหน่ง — positions list + job-levels list | — (standalone) |
| **P4** | 1.5 ประกาศ — announcements list + categories + audience picker | P1 (employee-type ids), org-structure data layer (P2), positions (P3) for audience vocab |
| **P5** | Source-of-truth integration — lift org-structure to data layer, add `Employee` FKs, rewire 2.5 `OrgTreeSelect` + quota onto real org/employee-type | P1, P2, P3 (needs all id vocabularies stable) |
| **P6** | Polish — org-tree drag-reorder, export | everything |

**Why this order:** P1 creates the **employee-type** SoT that quota (2.5) and announcement
audience (1.4) both reference, so it must come first. P2 builds the merged องค์กร board and,
because it needs a shared org tree, performs the **org-structure data-layer lift** (moving
`OrgNode`/`SEED`/`STORAGE_KEY` out of the component) early — that lift unblocks both P4's
audience picker and P5. P3 (positions/levels) is independent and can even be done in parallel,
but is sequenced third because P4's audience and P5's eligibility reference `Position.id`.
P4 consumes the id vocabularies from P1/P2/P3. P5 is the keystone integration and must come
after every id vocabulary is stable. P6 is pure polish. **You may reorder P2/P3 (both
low-coupling) if convenient, but do not move P5 before P1–P3, and do the org-structure
data-layer lift no later than the start of P2.**

> **Note on the data-layer lift of 1.3:** moving `OrgNode`/`SEED`/`STORAGE_KEY` from
> `hr-org-structure.tsx` into `data/humansource/org-structure.ts` and having the component
> import them is a refactor that several phases need. **Do it at the start of P2** (P2 is the
> first phase that consumes the org tree as data). If you prefer, do it as a tiny standalone
> step before P2 — either way it must land before P4/P5. Keep the same `STORAGE_KEY` value
> (`'g-hub.hr.org-structure'`) so existing persisted data still hydrates.

---

## 8. Phase 1 — 1.1 การตั้งค่าพื้นฐาน (Basic setup)

### Goal
Replace the stub for the 1.1 group with a real screen that has four sub-screens, the most
important being the **employee-type master** (the source of truth that payroll and leave quota
depend on).

### In scope
- A 1.1 board that renders one of four sub-screens based on `activeItem.path`:
  1. **ค่าเริ่มต้นพนักงาน** (`employee-defaults`) — default employee-code prefix/start-date/
     status/employee-type for new hires; a small flat form persisted to localStorage.
  2. **รหัสเอกสารและ Running No.** (`running-number`) — running-number format builder
     (prefix + date token + zero-padded counter) per document kind; list + modal.
  3. **ประเภทพนักงาน** (`employee-type`) — full CRUD list of employee types. **This is the SoT.**
  4. **ข้อมูลพื้นฐาน (คำนำหน้า/สัญชาติ/วุฒิ)** (`master-personal`) — three light master lists
     (prefix / nationality / education) edited in place; "master-lite".

### Out of scope
- Wiring employee-type into existing employee rows by id (that is P5).
- Any payroll computation. Employee-type just stores `tax` as an enum.

### Files to create
- `apps/frontend/src/data/humansource/employee-types.ts` — type + seed + key (below).
- `apps/frontend/src/data/humansource/company-basics.ts` — types for employee-defaults,
  running-number configs, and the three personal master lists + keys (below).
- `apps/frontend/src/components/humansource/hr-basic-settings.tsx` — exports
  `BasicSettingsBoard({ accent }: { accent: string })` which internally dispatches the four
  sub-screens on `activeItem.path`. (Pass `activeItem` in — see edits.)

### Files to edit
- `apps/frontend/src/components/humansource/hr-settings-page.tsx`:
  - Add import near line 19: `import { BasicSettingsBoard } from './hr-basic-settings';`
  - In the `group.key === 'company'` block, **before** the `OrganizationSettings` fallback,
    add branches (most specific first):
    ```ts
    if (activeItem.path.includes('company/employee-defaults')) return <BasicSettingsBoard sub="employee-defaults" accent={accent} />;
    if (activeItem.path.includes('company/running-number'))    return <BasicSettingsBoard sub="running-number" accent={accent} />;
    if (activeItem.path.includes('organization/employee-type'))return <BasicSettingsBoard sub="employee-type" accent={accent} />;
    if (activeItem.path.includes('company/master-personal'))   return <BasicSettingsBoard sub="master-personal" accent={accent} />;
    if (activeItem.path.includes('company/general'))           return <BasicSettingsBoard sub="employee-type" accent={accent} />; // parent → default tab
    ```
    Derive the substrings from the nav paths in §2 / `navigation.ts` lines 92–100. Note
    `ประเภทพนักงาน` keeps its `organization/employee-type` path, so its rewritten path contains
    `organization/employee-type` (not `company/...`). Verify each substring against the
    rewritten `activeItem.path` by logging once during dev.
  - (Optional cleanliness) once all four are wired, the 1.1 items no longer reach
    `OrganizationSettings`; do not delete the stub yet — 1.2/1.4/1.5 still fall through to it
    until their phases land. The stub is retired at the end of P4 (§11).
- `apps/frontend/src/app/globals.css` — add `hr-basic-*` classes (or reuse `hr-settings-*` /
  `hr-leave-*` table+form classes) plus their `.hr-theme-dark` overrides.

### Data types + localStorage keys

`employee-types.ts`:
```ts
export type EmployeeTypeTax = 'withholding' | 'none'; // 'หัก ณ ที่จ่าย' | 'ไม่หัก'

export type EmployeeType = {
  id: string;            // 'ET001' — stable; referenced by leave quota.perEmployeeType + (P5) Employee.employeeTypeId
  code: string;          // 'EMP-MONTHLY'
  nameTh: string;        // 'รายเดือน'
  nameEn: string;        // 'Monthly'
  tax: EmployeeTypeTax;  // enum replaces the old free Thai string
  active: boolean;
  // headcount is DERIVED (count employees of this type) — do NOT store; compute in UI (0 for now).
};

export const EMPLOYEE_TYPE_SEED: EmployeeType[] = [
  { id: 'ET001', code: 'EMP-MONTHLY',  nameTh: 'รายเดือน',  nameEn: 'Monthly',   tax: 'withholding', active: true },
  { id: 'ET002', code: 'EMP-FRONT',    nameTh: 'หน้าร้าน',  nameEn: 'Front Store', tax: 'none',      active: true },
  { id: 'ET003', code: 'EMP-DAILY',    nameTh: 'รายวัน',    nameEn: 'Daily',     tax: 'none',        active: true },
  { id: 'ET004', code: 'EMP-PARTTIME', nameTh: 'พาร์ทไทม์', nameEn: 'Part Time', tax: 'none',        active: false },
  { id: 'ET005', code: 'EMP-CONTRACT', nameTh: 'เหมาจ่าย',  nameEn: 'Contract',  tax: 'withholding', active: false },
];
export const EMPLOYEE_TYPES_STORAGE_KEY = 'g-hub.hr.employee-types';
```
> Source values mapped from `mock.ts` `employeeTypes`. `tax` mapping: `'หัก ณ ที่จ่าย'` →
> `'withholding'`, `'ไม่หัก'` → `'none'`. Provide a tiny `taxLabel(tax)` helper returning the
> Thai string for display.

`company-basics.ts`:
```ts
export type EmployeeDefaults = {
  codePrefix: string;        // e.g. '2'  → employee code base
  codePadding: number;       // zero-pad width, e.g. 4 → '0001'
  defaultEmployeeTypeId: string;  // → EmployeeType.id
  defaultStatus: string;     // 'ทดลองงาน' | 'ปกติ' (free string for now)
  startDateMode: 'today' | 'manual'; // default start-date behaviour for new hire form
};
export const EMPLOYEE_DEFAULTS_STORAGE_KEY = 'g-hub.hr.employee-defaults';
export const EMPLOYEE_DEFAULTS_SEED: EmployeeDefaults = {
  codePrefix: '2', codePadding: 4, defaultEmployeeTypeId: 'ET001',
  defaultStatus: 'ทดลองงาน', startDateMode: 'manual',
};

export type RunningNumberConfig = {
  id: string;            // 'RN-LEAVE'
  docLabelTh: string;    // 'ใบลา'
  prefix: string;        // 'LV'
  dateToken: 'none' | 'YYYY' | 'YYYYMM'; // inserted after prefix
  padding: number;       // counter zero-pad width
  nextNumber: number;    // current counter (demo only)
  active: boolean;
};
export const RUNNING_NUMBERS_STORAGE_KEY = 'g-hub.hr.running-numbers';
export const RUNNING_NUMBER_SEED: RunningNumberConfig[] = [
  { id: 'RN-EMP',   docLabelTh: 'รหัสพนักงาน', prefix: '',   dateToken: 'none',   padding: 4, nextNumber: 20029, active: true },
  { id: 'RN-LEAVE', docLabelTh: 'ใบลา',        prefix: 'LV', dateToken: 'YYYYMM', padding: 4, nextNumber: 1,     active: true },
  { id: 'RN-OT',    docLabelTh: 'ใบ OT',       prefix: 'OT', dateToken: 'YYYYMM', padding: 4, nextNumber: 1,     active: true },
];

// "master-lite" personal option lists. One shape, three lists.
export type MasterOption = { id: string; nameTh: string; nameEn?: string; active: boolean };
export const PREFIX_OPTIONS_STORAGE_KEY      = 'g-hub.hr.master.prefixes';
export const NATIONALITY_OPTIONS_STORAGE_KEY = 'g-hub.hr.master.nationalities';
export const EDUCATION_OPTIONS_STORAGE_KEY   = 'g-hub.hr.master.educations';
export const PREFIX_SEED: MasterOption[] = [
  { id: 'PFX-MR', nameTh: 'นาย',   nameEn: 'Mr.',  active: true },
  { id: 'PFX-MS', nameTh: 'นางสาว', nameEn: 'Ms.', active: true },
  { id: 'PFX-MRS', nameTh: 'นาง',  nameEn: 'Mrs.', active: true },
];
export const NATIONALITY_SEED: MasterOption[] = [
  { id: 'NAT-TH', nameTh: 'ไทย', nameEn: 'Thai', active: true },
];
export const EDUCATION_SEED: MasterOption[] = [
  { id: 'EDU-BACHELOR', nameTh: 'ปริญญาตรี', nameEn: "Bachelor's", active: true },
  { id: 'EDU-MASTER',   nameTh: 'ปริญญาโท',  nameEn: "Master's",   active: true },
];
```

### UI / UX
- **ประเภทพนักงาน (employee-type)** — use the **`LeaveSettings` list+modal skeleton** verbatim
  in structure: toolbar (`count + search + accent add`), `hr-settings-table` rows
  (`__primary` = `nameTh`, `__secondary` = `nameEn`, `__code` = `code`, a `tax` cell, a derived
  `headcount` cell = 0 for now, status pill, inline toggle, edit/delete). Fullscreen modal body
  built from `GroupHeading` + `Field` grid: code, nameTh, nameEn, `tax` via **`HrCustomSelect`**
  (options `[{value:'withholding',label:'หัก ณ ที่จ่าย'},{value:'none',label:'ไม่หัก'}]`), active
  toggle (`ToggleField`). Seed rows are editable and deletable (no statutory lock here). Id on
  create: `\`et-${Date.now()}-${counter}\`` in the save handler. Toolbar Thai: add button
  `'+ เพิ่มประเภทพนักงาน'`, search placeholder `'ค้นหาประเภทพนักงาน'`, empty state
  `'ยังไม่มีประเภทพนักงาน'`.
- **ค่าเริ่มต้นพนักงาน** — a single flat form (no list). `GroupHeading` `'ค่าเริ่มต้นรหัสพนักงาน'`
  over a grid: `codePrefix` (`hr-leave-input --mono`), `codePadding` (`--num`), live preview text
  (`'ตัวอย่าง: 20001'`), `defaultEmployeeTypeId` via `HrCustomSelect` over active employee types,
  `defaultStatus` via `HrCustomSelect`, `startDateMode` via `HrCustomSelect`
  (`'วันนี้'` / `'กรอกเอง'`). Explicit `'บันทึก'` button — no auto-save. Persist on save.
- **รหัสเอกสารและ Running No.** — list+modal. Each row shows `docLabelTh`, a live-built sample
  (e.g. `LV202606-0001`), status. Modal fields: docLabelTh, prefix, `dateToken` via
  `HrCustomSelect` (`'ไม่ใส่' / 'ปี (YYYY)' / 'ปีเดือน (YYYYMM)'`), padding, nextNumber, active.
  Build the sample string **purely from state in render** (no `Date.now()` — use a fixed
  `YYYY/YYYYMM` placeholder like `'2026' / '202606'` for the preview to stay deterministic).
- **ข้อมูลพื้นฐาน (master-personal)** — three side-by-side (or stacked on narrow) light lists.
  Each list: heading + a simple add-row input + rows with inline name + active toggle + delete.
  Reuse the org-tree inline-edit idiom (`hr-org-structure.tsx`) or a tiny local table — keep it
  flat, no modal needed for these short option lists. Three keys above. Headings:
  `'คำนำหน้าชื่อ'`, `'สัญชาติ'`, `'วุฒิการศึกษา'`.

### Acceptance criteria
- [ ] Selecting 1.1's four child tabs each renders a distinct real screen (not the stub).
- [ ] Employee-type CRUD: create/edit/delete/toggle persist across reload via
      `g-hub.hr.employee-types`; seed appears on first load.
- [ ] `tax` is an enum in storage; UI shows the Thai label.
- [ ] Employee-defaults form persists and shows a live code preview.
- [ ] Running-number rows persist; sample string is deterministic (no render-time `Date.now()`).
- [ ] Three master lists persist independently under their own keys.
- [ ] All dropdowns are `HrCustomSelect`; no native `<select>`.
- [ ] Works under `.hr-theme-dark`.
- [ ] No `Date.now()`/`Math.random()` in any render path.

### Verification
```powershell
cd apps/frontend
.\node_modules\.bin\tsc.cmd --noEmit
.\node_modules\.bin\eslint.cmd src/components/humansource
```
Then click each 1.1 tab in the browser.

---

## 9. Phase 2 — 1.2 องค์กร (merged master–detail board)

### Goal
Collapse the standalone company item into the org board: a **master–detail "องค์กร" workspace**
where the shipped org tree is the **left master** (and the multi-company switcher) and a per-entity
**right detail** pane lets you edit the selected node — company head → tabbed company form
(`นิติบุคคล/นายจ้าง` · `เงื่อนไขการทำงาน` · `ผู้มีอำนาจลงนาม`), branch → branch detail, department/team →
inline rename. Also performs the **org-structure data-layer lift** (prerequisite for P4/P5) and the
**nav 5→4 edit**.

### In scope
- **Nav 5→4 edit** (`navigation.ts`): remove the standalone `ข้อมูลบริษัท` item; rename
  `โครงสร้างองค์กร` → `องค์กร`; update `progress` to `'/ 4'`. The merged item keeps the path
  `/humansource/organization/structure` and has **no nav children** (the detail tabs are internal).
- **Lift org-structure to the data layer:** create `data/humansource/org-structure.ts` exporting
  `OrgNode`, `OrgNodeType`, `ORG_STRUCTURE_SEED`, `ORG_STRUCTURE_STORAGE_KEY`
  (= `'g-hub.hr.org-structure'`), and the tree helpers; change `hr-org-structure.tsx` to import
  them instead of its private consts. Add optional `code?` and `active?` to `OrgNode` (default
  undefined; existing UI must keep working). **Do not change the storage key or break persisted data.**
- New `data/humansource/companies.ts` (types/seed/key below). A `Company` links to its tree head
  node via `orgNodeId` (e.g. `'org-ghub'`).
- **Refactor `OrgStructureBoard` into master–detail:** keep the existing tree as the left pane; add
  `selectedNodeId` state (clicking a row selects it, indigo active state); render a right detail pane.
- Right detail pane (new `hr-company-detail.tsx`): company head → the 3 tabs; branch → branch form;
  department/team → minimal name field (or rely on the tree's inline rename).
- **เงื่อนไขการทำงาน tab stores company-policy numbers only** (design §3 / §5(3)): working hours/day,
  annual cut-off date, late threshold (min), absent threshold (min), probation days, retirement age,
  payroll day, currency, default shift id, weekly holidays. It may *reference* a default shift via
  `HrCustomSelect` over `workShifts` but must **not** duplicate shift/holiday/attendance UI (Group 2).
- **Auto-HQ:** `'+ เพิ่มบริษัท'` creates a company node + a `Company` record + an HQ branch child, then
  selects the new company so its detail opens.

### Out of scope
- Linking `Employee` rows to companies/branches by id (P5).
- Editing shift/holiday/attendance mechanics here.
- A **separate** company list board — there is none under the merge; the tree IS the list.
  (If you want that instead, see §15.)

### Files to create
- `apps/frontend/src/data/humansource/companies.ts`
- `apps/frontend/src/data/humansource/org-structure.ts` (the lift)
- `apps/frontend/src/components/humansource/hr-company-detail.tsx` — the right-pane detail
  (company tabs / branch form), e.g. `CompanyDetail({ company, onChange }) ` and
  `BranchDetail(...)`. Keep it flat (no numbered cards). May be inlined into `hr-org-structure.tsx`
  if small, but a separate file keeps that component manageable.

### Files to edit
- `apps/frontend/src/data/humansource/navigation.ts` — the **5→4 nav edit** above (remove
  `ข้อมูลบริษัท`, rename `โครงสร้างองค์กร` → `องค์กร`, `progress` → `'/ 4'`).
- `apps/frontend/src/components/humansource/hr-org-structure.tsx` — (a) replace the private
  `OrgNode`/`OrgNodeType`/`SEED`/`STORAGE_KEY`/helpers with imports from
  `../../data/humansource/org-structure`; (b) wrap the board in a master–detail layout (tree left,
  `<…Detail>` right); (c) add `selectedNodeId` selection + the `'+ เพิ่มบริษัท'` + auto-HQ handler;
  (d) load/save the `companies.ts` store. Watch `noUnusedLocals` on the removed local declarations.
- `apps/frontend/src/components/humansource/hr-settings-page.tsx` — **no dispatch change needed**:
  `activeItem.path.includes('organization/structure')` already routes to `<OrgStructureBoard>`, which
  is now the merged board. Do **not** add an `organization/companies` branch. Keep
  `'/humansource/organization/structure'` in `hideAutoTabsPaths` (already present) — the board owns
  its detail tabs internally.
- `globals.css` — extend `hr-org-*` with master-detail layout classes (+ paired dark block); reuse
  `hr-leave-*` flat-form classes inside the detail pane.

### Data types + localStorage key

`org-structure.ts` (the lift — enriched):
```ts
export type OrgNodeType = 'company' | 'branch' | 'department' | 'team';
export type OrgNode = {
  id: string;
  name: string;
  type: OrgNodeType;
  code?: string;     // NEW — stable code for references (e.g. 'DO0001'); optional
  active?: boolean;  // NEW — optional; undefined treated as active
  children: OrgNode[];
};
export const ORG_STRUCTURE_STORAGE_KEY = 'g-hub.hr.org-structure';
export const ORG_STRUCTURE_SEED: OrgNode[] = [ /* EXACT current SEED from hr-org-structure.tsx:31-64 */ ];
export function renameNode(nodes: OrgNode[], id: string, name: string): OrgNode[] { /* move from component */ }
export function addChildNode(nodes: OrgNode[], parentId: string, child: OrgNode): OrgNode[] { /* move */ }
export function removeNode(nodes: OrgNode[], id: string): OrgNode[] { /* move */ }
```

`companies.ts`:
```ts
export type WorkConditions = {
  payrollDay: number;          // 1..31 (was hrSettings.payrollDay = 28)
  annualCutoffDate: number;    // 1..31 — annual leave cut-off day
  probationDays: number;       // was hrSettings.probationDays = 90
  retirementAge: number;       // e.g. 60
  workHoursPerDay: number;     // e.g. 8
  lateThresholdMin: number;    // minutes late before flagged
  absentThresholdMin: number;  // minutes before counted absent
  currency: string;            // 'THB'
  defaultWorkShiftId: string | null; // → workShifts.id (WS001…); reference only
  weeklyHolidays: number[];    // 0=Sun..6=Sat, e.g. [0,6]
};
export type Branch = {
  id: string;        // 'BR001'
  code: string;      // 'BO0001'
  nameTh: string;
  nameEn?: string;
  province?: string; // 'กรุงเทพฯ'
  isHeadOffice: boolean;
  active: boolean;
};
export type AuthorizedSigner = {
  id: string;        // 'SG001'
  name: string;
  positionTh: string;// free string e.g. 'กรรมการผู้จัดการ'
  scope: string;     // free string e.g. 'เอกสารทั้งหมด'
  active: boolean;
};
export type Company = {
  id: string;        // 'CO001' — intended to equal the org-structure company node id (see P5)
  orgNodeId: string; // → OrgNode(type:'company').id, e.g. 'org-ghub' (link to 1.3 tree)
  legalNameTh: string;   // 'บริษัท จี-ฮับ เอ็นเตอร์ไพรส์ จำกัด'
  tradeName: string;     // 'G-HUB Enterprise'
  taxId: string;         // '0105560000000'
  socialSecurityCode: string; // 'SSO-0001'
  address?: string;
  active: boolean;
  workConditions: WorkConditions;
  branches: Branch[];
  signers: AuthorizedSigner[];
};
export const COMPANIES_STORAGE_KEY = 'g-hub.hr.companies';
export const COMPANY_SEED: Company[] = [
  {
    id: 'CO001', orgNodeId: 'org-ghub',
    legalNameTh: 'บริษัท จี-ฮับ เอ็นเตอร์ไพรส์ จำกัด', tradeName: 'G-HUB Enterprise',
    taxId: '0105560000000', socialSecurityCode: 'SSO-0001', active: true,
    workConditions: { payrollDay: 28, annualCutoffDate: 31, probationDays: 90, retirementAge: 60,
      workHoursPerDay: 8, lateThresholdMin: 15, absentThresholdMin: 240, currency: 'THB',
      defaultWorkShiftId: 'WS001', weeklyHolidays: [0, 6] },
    branches: [
      { id: 'BR001', code: 'BO0001', nameTh: 'สำนักงานใหญ่',   province: 'กรุงเทพฯ',  isHeadOffice: true,  active: true },
      { id: 'BR002', code: 'BO0002', nameTh: 'สาขาเชียงใหม่', province: 'เชียงใหม่', isHeadOffice: false, active: true },
      { id: 'BR003', code: 'BO0003', nameTh: 'สาขาภูเก็ต',    province: 'ภูเก็ต',    isHeadOffice: false, active: true },
    ],
    signers: [{ id: 'SG001', name: '—', positionTh: 'กรรมการผู้จัดการ', scope: 'เอกสารทั้งหมด', active: true }],
  },
  {
    id: 'CO002', orgNodeId: 'org-mhub',
    legalNameTh: 'บริษัท เอ็ม-ฮับ เอ็นเตอร์ไพรส์ จำกัด', tradeName: 'M-HUB Enterprise',
    taxId: '0105560000001', socialSecurityCode: 'SSO-0002', active: true,
    workConditions: { payrollDay: 30, annualCutoffDate: 31, probationDays: 119, retirementAge: 60,
      workHoursPerDay: 8, lateThresholdMin: 15, absentThresholdMin: 240, currency: 'THB',
      defaultWorkShiftId: null, weeklyHolidays: [0, 6] },
    branches: [{ id: 'BR004', code: 'BO0010', nameTh: 'สำนักงานใหญ่', isHeadOffice: true, active: true }],
    signers: [],
  },
];
```
> `workConditions` seed for CO001 is migrated from `mock.ts` `hrSettings`
> (`payrollDay:28, probationDays:90, currency:'THB'`); the other numbers are sensible Thai
> defaults. Branch names match the existing `branch` display strings in `mock.ts`
> (`สำนักงานใหญ่/สาขาเชียงใหม่/สาขาภูเก็ต`).

### UI / UX
- **Master (left) = the existing org tree** (`OrgStructureBoard` body, `hr-org-structure.tsx`). Add
  a `selectedNodeId`; clicking a row selects it (indigo `#4f46e5` active state). Keep inline rename
  for department/team rows; company/branch rows select → edit on the right. `'+ เพิ่มบริษัท'` sits at
  the top of the tree.
- **Detail (right)** — flat per `CLAUDE.md §3.2` (plain `<h4>` `GroupHeading` + field grids, no
  numbered section cards):
  - **Company head selected** → the board's own tab strip
    `'นิติบุคคล/นายจ้าง'` · `'เงื่อนไขการทำงาน'` · `'ผู้มีอำนาจลงนาม'` (NO `'สาขา'` tab — branches are
    tree nodes; select a branch node to edit it):
    - **นิติบุคคล/นายจ้าง** — flat form: legalNameTh, tradeName, taxId (`--mono`), socialSecurityCode,
      address (textarea), active toggle.
    - **เงื่อนไขการทำงาน** — flat form over `WorkConditions` numbers; minutes inputs use the `'นาที'`
      suffix (`Field` suffix), `defaultWorkShiftId` via `HrCustomSelect` over `workShifts` (label by
      `name`, value by `id`), weeklyHolidays as a 7-day toggle row. One-line hint + optional deep-link
      to Group 2 (`ApprovalForm`-style note) that shift/holiday mechanics live under ตั้งค่าเวลาการทำงาน.
    - **ผู้มีอำนาจลงนาม** — list+modal of `AuthorizedSigner` (name, positionTh, scope, active).
  - **Branch node selected** → branch form: nameTh, nameEn, code, province (`HrCustomSelect` or text),
    isHeadOffice toggle, active.
  - **Department / team node selected** → minimal name field (or rely on the tree's inline rename).
  - **Nothing selected** → empty state `'เลือกหน่วยงานทางซ้ายเพื่อดู/แก้ไขรายละเอียด'`.
- Detail edits are saved **per explicit save** (`'บันทึก' / 'ยกเลิก'` on the entity/work-conditions
  forms; modal for signers). No auto-save inline on the detail pane.
- **Company↔node name sync:** pick ONE source for the display name (store on `Company` and mirror to
  the node label, or derive the node label from `Company`) and document it in code — do not let them
  drift. Editing the company's `tradeName` in the detail should update the tree node label.
- **Auto-HQ:** `'+ เพิ่มบริษัท'` creates the company node + `Company` record + an HQ branch child (ids
  generated in the click handler via `newId()` — never in render), then selects the new company.
- Ids in handlers only: `co-…`, `br-…`, `sg-…` with `Date.now()` + counter.

### Acceptance criteria
- [ ] Group 1 nav shows **4 items**; no standalone `ข้อมูลบริษัท`; item 1.2 labelled `องค์กร`;
      `progress` reads `'/ 4'`.
- [ ] `org-structure.ts` exists; `hr-org-structure.tsx` imports from it; the tree still hydrates from
      `g-hub.hr.org-structure` and its CRUD/expand behave as before (no regression).
- [ ] Clicking the **G-HUB** company head opens its detail on the right; editing tax id / address /
      work-conditions / signers and pressing `'บันทึก'` persists to `g-hub.hr.companies` and reloads.
- [ ] Selecting a branch shows the branch form; selecting a department/team allows rename.
- [ ] `'+ เพิ่มบริษัท'` auto-creates a `'สำนักงานใหญ่'` HQ branch and opens the new company's detail.
- [ ] เงื่อนไขการทำงาน stores only policy numbers + a referenced default shift id; no shift/holiday
      editor is duplicated.
- [ ] No double-rendered tabs (board owns its detail tabs; `organization/structure` stays in
      `hideAutoTabsPaths`).
- [ ] No native `<select>`; dark theme works; no render-time nondeterminism.

### Verification
tsc + eslint (both exit 0, only the tolerated warning), then: select G-HUB → edit its company tabs →
บันทึก → reload (persists); add a company (HQ auto-created); select a branch and a department.

---

## 10. Phase 3 — 1.4 ตำแหน่ง (Positions + job levels)

### Goal
Replace the stub for 1.4 with two real list screens: **positions** (name/code + a `Level/Grade`
reference) and **job levels** (the level master with rank ordering). Flat lists only — **no
position-hierarchy tree** (deferred).

### In scope
- `data/humansource/positions.ts` (types/seed/keys below).
- A board with two sub-screens dispatched by `activeItem.path` (the topic already has two
  children: ตำแหน่งงาน / ระดับงาน), each a list+modal CRUD.

### Out of scope
- Position hierarchy tree (HumanSoft style) — deferred.
- Linking `Employee.positionId` (P5).

### Files to create
- `apps/frontend/src/data/humansource/positions.ts`
- `apps/frontend/src/components/humansource/hr-positions-board.tsx` — exports
  `PositionsBoard({ sub, accent }: { sub: 'positions' | 'job-levels'; accent: string })`.

### Files to edit
- `hr-settings-page.tsx`:
  - Import `PositionsBoard`.
  - Company branch, before fallback, **ordered job-levels first** (more specific) then positions:
    ```ts
    if (activeItem.path.includes('organization/job-levels')) return <PositionsBoard sub="job-levels" accent={accent} />;
    if (activeItem.path.includes('organization/positions'))  return <PositionsBoard sub="positions"  accent={accent} />;
    ```
    > Order matters: `'organization/positions'` is also a prefix of the parent topic path; the
    > parent `ตำแหน่ง` topic path is `/humansource/organization/positions` (same as the first
    > child), and it HAS children → auto-tabs render (ตำแหน่งงาน/ระดับงาน). Do **not** add this
    > topic to `hideAutoTabsPaths`; we want the two tabs. The `positions` branch correctly
    > serves both the parent and the ตำแหน่งงาน child (both resolve to `sub="positions"`).
- `globals.css` — `hr-position-*` classes + dark overrides (or reuse `hr-settings-*` table).

### Data types + localStorage keys
```ts
export type JobLevel = {
  id: string;     // 'JL-EXEC'
  nameTh: string; // 'ผู้บริหาร'
  nameEn: string; // 'Executive'
  rank: number;   // 1 = highest; used later for approval-chain ordering
  active: boolean;
};
export type Position = {
  id: string;        // 'P001'
  code: string;      // 'EX001'
  nameTh: string;    // was mock 'name'
  nameEn: string;
  jobLevelId: string;// → JobLevel.id (replaces the free-string 'level')
  active: boolean;
};
export const JOB_LEVELS_STORAGE_KEY = 'g-hub.hr.job-levels';
export const POSITIONS_STORAGE_KEY  = 'g-hub.hr.positions';

export const JOB_LEVEL_SEED: JobLevel[] = [
  { id: 'JL-EXEC', nameTh: 'ผู้บริหาร',  nameEn: 'Executive',  rank: 1, active: true },
  { id: 'JL-MGR',  nameTh: 'ผู้จัดการ',  nameEn: 'Manager',    rank: 2, active: true },
  { id: 'JL-SUP',  nameTh: 'หัวหน้างาน', nameEn: 'Supervisor', rank: 3, active: true },
  { id: 'JL-STF',  nameTh: 'พนักงาน',    nameEn: 'Staff',      rank: 4, active: true },
];
// Mapped from mock.ts positions P001..P007; free-string level → jobLevelId:
//   Executive → JL-EXEC, Manager → JL-MGR, Supervisor → JL-SUP, Staff → JL-STF.
export const POSITION_SEED: Position[] = [
  { id: 'P001', code: 'EX001', nameTh: 'ผู้บริหาร',     nameEn: 'Executive',   jobLevelId: 'JL-EXEC', active: true },
  { id: 'P002', code: 'MG001', nameTh: 'ผู้จัดการ',     nameEn: 'Manager',     jobLevelId: 'JL-MGR',  active: true },
  { id: 'P003', code: 'SV001', nameTh: 'หัวหน้างาน',    nameEn: 'Supervisor',  jobLevelId: 'JL-SUP',  active: true },
  { id: 'P004', code: 'ST001', nameTh: 'พนักงานขาย',    nameEn: 'Sales Staff', jobLevelId: 'JL-STF',  active: true },
  { id: 'P005', code: 'ST002', nameTh: 'พนักงานบัญชี',  nameEn: 'Accountant',  jobLevelId: 'JL-STF',  active: true },
  { id: 'P006', code: 'ST003', nameTh: 'พนักงานทั่วไป', nameEn: 'General',     jobLevelId: 'JL-STF',  active: false },
  { id: 'P007', code: 'ST004', nameTh: 'ผู้อำนวยการ',   nameEn: 'Director',    jobLevelId: 'JL-EXEC', active: true },
];
```

### UI / UX
- Both sub-screens use the **`LeaveSettings` list+modal skeleton**.
- **ตำแหน่งงาน (positions)** — table: `__primary`=nameTh, `__secondary`=nameEn, `__code`=code,
  a level cell showing the job-level's `nameTh` (resolve `jobLevelId` → `JobLevel`), status pill,
  toggle, edit/delete. Modal: code, nameTh, nameEn, `jobLevelId` via **`HrCustomSelect`** over
  active job levels (label = `\`${nameTh} (${nameEn})\``), active toggle. Add button
  `'+ เพิ่มตำแหน่ง'`.
- **ระดับงาน (job-levels)** — table: nameTh, nameEn, rank, status, toggle, edit/delete (sort by
  `rank`). Modal: nameTh, nameEn, rank (`--num`), active. Add button `'+ เพิ่มระดับงาน'`.
  Validate `rank` is a positive integer; warn (don't block) on duplicate rank.
- Ids on create only: `pos-…`, `jl-…`.

### Acceptance criteria
- [ ] 1.4 shows two tabs (ตำแหน่งงาน / ระดับงาน), each a real CRUD list.
- [ ] Positions persist to `g-hub.hr.positions`; job levels to `g-hub.hr.job-levels`.
- [ ] Position rows display their resolved job-level name; the level picker lists active levels
      via `HrCustomSelect`.
- [ ] Seed matches `mock.ts` positions (P001–P007) with `level` mapped to `jobLevelId`.
- [ ] Dark theme works; no native select; no render-time nondeterminism.

### Verification
tsc + eslint, then click both tabs and create/edit a position + level.

---

## 11. Phase 4 — 1.5 ประกาศ (Announcements)

### Goal
Replace the stub for 1.5 with a real announcements screen: announcement CRUD with **audience
targeting** (reusing the cascading org-tree picker) plus a categories master and an audience
sub-view. Announcements feed the Home page (display only; no Home wiring in this phase).

### In scope
- `data/humansource/announcements.ts` (types/seed/keys below).
- A board dispatching three sub-screens on `activeItem.path`: announcements list (the parent
  ประกาศ), หมวดประกาศ (categories), กลุ่มผู้รับประกาศ (audience).
- An **audience picker** that selects company/org-unit/employee-type/employee — built by reusing
  the `OrgTreeSelect`/`TriCheck` pattern. **At this point the org tree should come from
  `org-structure.ts`** (lifted in P2). Employee-type targeting uses `EmployeeType.id` (P1).
- **Retire the `OrganizationSettings` stub** at the end of this phase: once 1.1/1.2/1.4/1.5 all
  route to real boards, nothing reaches the stub. Delete `OrganizationSettings` (lines ~425–465)
  and the now-unused fallback `return <OrganizationSettings .../>;`. Replace the fallback with a
  minimal `return null;` or a tiny "coming soon" note — but confirm via click-through that no
  company leaf still depends on it. (`noUnusedLocals` will flag the removed import/usage; clean up.)

### Out of scope
- Home-page rendering of announcements.
- Rich text editor — body is a plain markdown `<textarea>`.

### Files to create
- `apps/frontend/src/data/humansource/announcements.ts`
- `apps/frontend/src/components/humansource/hr-announcements-board.tsx` — exports
  `AnnouncementsBoard({ sub, accent }: { sub: 'list' | 'categories' | 'audience'; accent: string })`.
- (Optional but recommended) `apps/frontend/src/components/humansource/hr-audience-select.tsx` —
  a shared `AudienceSelect` extracted from / modeled on `OrgTreeSelect`, so P5 and 1.5 share one
  picker. If you keep it inline for now, structure it so P5 can lift it.

### Files to edit
- `hr-settings-page.tsx`:
  - Import `AnnouncementsBoard`.
  - Company branch, before fallback (most specific first):
    ```ts
    if (activeItem.path.includes('settings/announcement-categories')) return <AnnouncementsBoard sub="categories" accent={accent} />;
    if (activeItem.path.includes('settings/announcement-audience'))   return <AnnouncementsBoard sub="audience"   accent={accent} />;
    if (activeItem.path.includes('settings/announcements'))           return <AnnouncementsBoard sub="list"       accent={accent} />;
    ```
    > Order: the two children's paths both contain `announcement-...`; the parent path
    > `settings/announcements` is a prefix of nothing else here, but `'settings/announcements'`
    > would ALSO match `'settings/announcement-categories'`? No — `includes('settings/announcements')`
    > does not match `announcement-categories` (the char after `announcement` is `-`, not `s`).
    > Still, **put the two `-categories`/`-audience` branches first** to be safe and explicit.
  - The parent ประกาศ topic has children → auto-tabs render (หมวดประกาศ / กลุ่มผู้รับประกาศ). The
    parent itself (`settings/announcements`) maps to `sub="list"`. Leave auto-tabs ON. (The list
    is the "no child selected" view; the two children are the other two tabs.)
- `globals.css` — `hr-announce-*` classes + dark overrides.

### Data types + localStorage keys
```ts
export type AnnouncementStatus = 'draft' | 'published' | 'archived'; // ร่าง / เผยแพร่ / เก็บ

export type AnnouncementCategory = {
  id: string;     // 'AC-POLICY'
  nameTh: string; // 'นโยบาย'
  color: string;  // hex pill color
  active: boolean;
};

// Audience reuses the SAME id vocabulary as leave eligibility (P5) so one picker serves both.
export type AnnouncementAudience = {
  scope: 'all' | 'custom';
  companyIds: string[];      // [] = all companies → Company.id
  orgNodeIds: string[];      // org-structure branch/department/team node ids selected "whole"
  employeeTypeIds: string[]; // ET### — target by employment type
  employeeIds: string[];     // EMP#### — explicit recipients
};

export type Announcement = {
  id: string;            // 'A001'
  title: string;
  bodyMd: string;        // markdown body (plain textarea)
  categoryId: string;    // → AnnouncementCategory.id (replaces mock free 'type')
  audience: AnnouncementAudience;
  status: AnnouncementStatus;
  publishAt: string | null; // ISO date string; replaces ambiguous พ.ศ. display string
  pinned: boolean;
};

export const ANNOUNCEMENT_CATEGORIES_STORAGE_KEY = 'g-hub.hr.announcement-categories';
export const ANNOUNCEMENTS_STORAGE_KEY           = 'g-hub.hr.announcements';

export const ANNOUNCEMENT_CATEGORY_SEED: AnnouncementCategory[] = [
  { id: 'AC-POLICY', nameTh: 'นโยบาย',  color: '#4f46e5', active: true },
  { id: 'AC-EVENT',  nameTh: 'กิจกรรม', color: '#0ea5e9', active: true },
];
// Mapped from mock.ts announcements A001..A004 (type → categoryId, status Thai → enum,
// พ.ศ. date → ISO). Use a fixed ISO date in the seed (NOT new Date()) to stay deterministic.
export const ANNOUNCEMENT_SEED: Announcement[] = [
  { id: 'A001', title: 'นโยบายวันหยุดประจำปี 2569', bodyMd: '', categoryId: 'AC-POLICY',
    audience: { scope: 'all', companyIds: [], orgNodeIds: [], employeeTypeIds: [], employeeIds: [] },
    status: 'published', publishAt: '2026-01-05', pinned: true },
  { id: 'A002', title: 'กิจกรรมพนักงานสัมพันธ์ไตรมาส 2', bodyMd: '', categoryId: 'AC-EVENT',
    audience: { scope: 'all', companyIds: [], orgNodeIds: [], employeeTypeIds: [], employeeIds: [] },
    status: 'published', publishAt: '2026-04-01', pinned: false },
  { id: 'A003', title: 'อัปเดตระเบียบการลา', bodyMd: '', categoryId: 'AC-POLICY',
    audience: { scope: 'all', companyIds: [], orgNodeIds: [], employeeTypeIds: [], employeeIds: [] },
    status: 'draft', publishAt: null, pinned: false },
  { id: 'A004', title: 'ประชุมประจำเดือน', bodyMd: '', categoryId: 'AC-EVENT',
    audience: { scope: 'all', companyIds: [], orgNodeIds: [], employeeTypeIds: [], employeeIds: [] },
    status: 'draft', publishAt: null, pinned: false },
];
```
> Adjust titles to match `mock.ts` `announcements` A001–A004 actual titles if they differ;
> the mapping rule (type→categoryId, Thai status→enum, date→ISO/`null`) is what matters.

### UI / UX
- **ประกาศ (list)** — `LeaveSettings` list+modal skeleton. Table: title (`__primary`), category
  pill (colored by `AnnouncementCategory.color`), status pill (`published`=emerald,
  `draft`=gray, `archived`=gray), `publishAt`, a pinned star, audience summary (e.g.
  `'ทุกคน'` when scope `all`, else `'กำหนดเอง'`). Fullscreen modal body via `GroupHeading`+`Field`:
  title, `categoryId` (`HrCustomSelect` over active categories), status (`HrCustomSelect`:
  `'ร่าง'/'เผยแพร่'/'เก็บ'`), publishAt (date input or `TimePicker`-style; a plain date input is
  fine — `<input type="date">` is allowed since it is not a `<select>`), pinned (`ToggleField`),
  bodyMd (`<textarea className="hr-leave-input">`), and an **Audience** section using the shared
  `AudienceSelect` (default scope `all` = "ทุกคน"; switching to custom reveals the org-tree +
  employee-type chips). Add button `'+ เพิ่มประกาศ'`.
- **หมวดประกาศ (categories)** — list+modal. Table: nameTh with a color swatch, status, toggle,
  edit/delete. Modal: nameTh, color via **`ColorSwatchPicker`** (`hr-leave-settings.tsx:872`),
  active. Add button `'+ เพิ่มหมวด'`.
- **กลุ่มผู้รับประกาศ (audience)** — this child is a place to manage **reusable audience groups**.
  For v1, keep it light: render the shared `AudienceSelect` as a standalone "default audience"
  saved under the announcements key, OR (simpler, acceptable) show an informational panel that
  explains audience is set per-announcement and link back to the list. Pick the lighter option
  unless time allows; do not over-build. Document whichever you choose at the top of the file.
- **AudienceSelect** — model on `OrgTreeSelect` + `TriCheck` (`hr-leave-settings.tsx:1241`,
  `:1402`): cascading tri-state tree built from `ORG_STRUCTURE_SEED`/persisted org-structure
  (company → branch → department/team), plus an employee-type chip row driven by
  `EMPLOYEE_TYPE_SEED`/persisted employee types. Removable summary chips (`hr-leave-chip`).
  Empty custom selection = everyone. Store ids only (`orgNodeIds`, `employeeTypeIds`,
  `employeeIds`, `companyIds`).
- Ids on create only: `ann-…`, `ac-…`.

### Acceptance criteria
- [ ] 1.5 shows the announcements list plus two child tabs (หมวดประกาศ / กลุ่มผู้รับประกาศ).
- [ ] Announcement CRUD persists to `g-hub.hr.announcements`; categories to
      `g-hub.hr.announcement-categories`.
- [ ] Category is an id reference with a colored pill; status is the 3-value enum.
- [ ] Audience picker reads the **real org structure** (org-structure.ts) and the **real
      employee-type list**, storing ids only.
- [ ] `OrganizationSettings` stub is removed and nothing in the company group renders it
      (verified by click-through of all of 1.1/1.2/1.4/1.5).
- [ ] No native select; dark theme; deterministic render (fixed seed dates).

### Verification
tsc + eslint, then click through 1.5's tabs, create an announcement with a custom audience, and
re-verify 1.1/1.2/1.4 still render (stub removal didn't break them).

---

## 12. Phase 5 — Source-of-truth integration

### Goal
Make the org structure (1.3) + employee types (1.1) the **single source of truth** the rest of
HR reads. Add foreign-key id fields to `Employee`, and **rewire the 2.5 leave-eligibility
`OrgTreeSelect`** and `quota.perEmployeeType` onto these sources instead of mock display strings.

### In scope
1. **`Employee` foreign keys.** In `apps/frontend/src/data/humansource/mock.ts`, add id fields to
   the `Employee` type and populate them in the generated rows (keep the existing display-string
   fields during migration so the current list/dashboard UIs keep working):
   ```ts
   export type Employee = {
     // ...existing display fields (position, department, branch, empType) kept for now...
     companyId: string;        // → Company.id        ('CO001' for G-HUB rows)
     branchNodeId: string;     // → OrgNode(type:'branch').id
     departmentNodeId: string; // → OrgNode(type:'department'|'team').id  ← the real eligibility key
     positionId: string;       // → Position.id (P001…)
     employeeTypeId: string;   // → EmployeeType.id (ET001…)  ← fixes quota.perEmployeeType matching
   };
   ```
   Map the existing Thai display strings to ids using the seeds from P1–P3 and the
   `org-structure.ts` SEED. Where the mock has values with no clean match (e.g. `position: 'CEO'`
   which is absent from `positions`), map to the closest id (`P001 ผู้บริหาร`) and add a code
   comment noting the reconciliation. Provide small lookup maps at the top of `mock.ts`
   (`DEPT_NAME_TO_NODE_ID`, `POSITION_NAME_TO_ID`, `EMPTYPE_NAME_TO_ID`, `BRANCH_NAME_TO_NODE_ID`).
2. **Rewire 2.5 `OrgTreeSelect`** in `hr-leave-settings.tsx`:
   - Replace the `ORG_TREE` builder (lines ~105–120, which groups `employees` by `department`
     string) with a tree built from `org-structure.ts` (`ORG_STRUCTURE_SEED` or persisted),
     walking company → branch → department/team. Each node carries its stable `OrgNode.id`.
   - Populate each node's member list by filtering `employees` on `departmentNodeId === node.id`
     (an id join, not a string match).
   - **Change `LeaveEligibility`** in `apps/frontend/src/data/humansource/leave-types.ts` to store
     ids (align the long-standing comment with reality):
     ```ts
     export type LeaveEligibility = {
       gender: LeaveGender;
       requirePassProbation: boolean;
       minTenureMonths: number;
       positionIds: string[];  // → Position.id   (was `positions`, never written by UI)
       orgNodeIds: string[];   // → OrgNode.id (branch/dept/team) selected "whole" (was `departments` by Thai name)
       employeeIds: string[];  // → Employee.id   (was `employees`)
     };
     ```
   - Write a **one-time migration** in the hydrate path: when reading
     `g-hub.hr.leave-types`, if a stored eligibility has the old shape (`departments: string[]`
     of Thai names, `positions`, `employees`), map `departments` Thai names →
     matching `OrgNode.id` (via the org tree), rename `employees` → `employeeIds`, `positions` →
     `positionIds`. Guard with a shape check; write back the migrated value once.
3. **Quota / employee-type alignment.** `quota.perEmployeeType` is keyed by `ET###`. Now that
   `employee-types.ts` is the SoT and `Employee.employeeTypeId` exists, render the per-type editor
   over the **persisted employee-type list** (from `g-hub.hr.employee-types`), and decide a
   consistent rule for inactive types (`ET004`/`ET005`): either show **all** types or filter
   active everywhere — but do it **consistently** so existing overrides on inactive types are not
   silently dropped. Recommended: show all types, mark inactive ones with a muted `'(ปิดใช้งาน)'`
   tag. `ACTIVE_EMPLOYEE_TYPES` (line ~95) and its consumers (per-type quota editor ~1191) must be
   updated to read the persisted list rather than the inline mock array.
4. **Reconcile legacy `TreeNode` duplicates.** Migrate any remaining consumer of
   `organizationTree` / `positionTree` (`TreeNode`) in `mock.ts` onto `OrgNode`
   (org-structure.ts) and `Position`/`JobLevel` (positions.ts). Once nothing imports the
   `TreeNode` versions, delete them. Grep for `organizationTree` / `positionTree` usages first;
   if a dashboard still depends on them, leave them but add a `// TODO: migrate to OrgNode` and
   note it in Open Questions. Do **not** introduce a fourth parallel model.

### Out of scope
- Removing the display-string fields from `Employee` (deferred until all consumers migrate).
- Quota balance engine / leave-request runtime.

### Files to edit
- `apps/frontend/src/data/humansource/mock.ts` — `Employee` type + generated rows + lookup maps;
  `TreeNode` reconciliation.
- `apps/frontend/src/data/humansource/leave-types.ts` — `LeaveEligibility` shape change.
- `apps/frontend/src/components/humansource/hr-leave-settings.tsx` — `ORG_TREE` builder,
  `OrgTreeSelect`, `ACTIVE_EMPLOYEE_TYPES`, per-employee-type quota editor, eligibility read/write
  + one-time migration in the hydrate path.

### Acceptance criteria
- [ ] `Employee` has `companyId/branchNodeId/departmentNodeId/positionId/employeeTypeId`, all
      populated for every generated row with ids that exist in the seeds.
- [ ] 2.5 `OrgTreeSelect` renders the **org-structure tree** (real node ids), and selecting a unit
      stores `OrgNode.id` in `orgNodeIds` (not a Thai department name).
- [ ] `LeaveEligibility` stores `positionIds`/`orgNodeIds`/`employeeIds`; a previously-saved
      old-shape value (Thai department names) is migrated on load without data loss for matchable
      names, and the UI does not crash on unmatched names.
- [ ] Per-employee-type quota editor reads the persisted employee-type list and handles inactive
      types consistently (no silent drop of `ET004`/`ET005` overrides).
- [ ] No remaining import of `organizationTree`/`positionTree` (or, if unavoidable, a documented
      TODO and an Open Question entry).
- [ ] tsc + eslint exit 0 (only the tolerated warning); leave settings still loads and saves.

### Verification
tsc + eslint, then: open 2.5 leave settings, edit a leave type's eligibility, pick org units +
employee types, save, reload, confirm the selection round-trips. Confirm an existing saved leave
type with old-shape eligibility still opens.

---

## 13. Phase 6 — Polish

### Goal
Add the deferred niceties once the foundation is stable.

### In scope
- **Org-tree drag-to-reorder** in `hr-org-structure.tsx`: allow reordering siblings within the
  same parent (and optionally re-parenting within the same level). Use native HTML5 drag events
  or a tiny dependency-free pointer implementation — **no new heavy dependency** unless approved.
  Persist the reordered tree to `g-hub.hr.org-structure`. Keep it keyboard-accessible (up/down
  buttons as a fallback). Add a `reorderSiblings(nodes, parentId, fromIndex, toIndex)` immutable
  helper in `org-structure.ts`.
- **Export** — a client-side "ส่งออก" (export) action on the company-settings and/or org-structure
  boards that downloads the current data as a JSON file (Blob + object URL, generated in a click
  handler — no render-time nondeterminism). Optionally a CSV for the positions/employee-type
  tables. **Real `.xlsx` is out of scope**; JSON download is sufficient.

### Out of scope
- Cross-tree re-parenting across different levels (e.g. moving a department to another branch) if
  it complicates the model — gate behind an Open Question.
- Server-side export.

### Files to edit
- `apps/frontend/src/components/humansource/hr-org-structure.tsx` (drag-reorder UI).
- `apps/frontend/src/data/humansource/org-structure.ts` (`reorderSiblings` helper).
- `hr-company-settings.tsx` / relevant boards (export button).
- `globals.css` (drag affordance classes + dark overrides).

### Acceptance criteria
- [ ] Sibling nodes can be reordered and the new order persists across reload.
- [ ] Reorder has a non-drag fallback (keyboard / buttons) for accessibility.
- [ ] Export downloads a JSON snapshot generated in an event handler.
- [ ] No regression to existing tree CRUD; dark theme intact.

### Verification
tsc + eslint, then drag-reorder, reload, confirm order persists; click export, confirm download.

---

## 14. Open questions / risks

1. **`Employee` reconciliation gaps.** `mock.ts` has display values absent from the seeds
   (`position: 'CEO'` not in `positions`; `empType` short names `รายเดือน/รายวัน/พาร์ทไทม์` vs
   `employeeTypes.nameTh`; department `IT`/`Operations` vs org-structure node names like
   `ฝ่ายเทคโนโลยีสารสนเทศ`). P5 must define explicit name→id maps; some mappings are judgment
   calls. **Risk:** a wrong mapping silently mis-targets eligibility. Mitigation: log unmatched
   names during the migration in dev and surface a `console.warn`.
2. **Org-structure department naming mismatch.** The org-structure SEED uses names like
   `ฝ่ายเทคโนโลยีสารสนเทศ`/`ฝ่ายบัญชีและการเงิน` while `mock.ts` employees use `IT`/`ฝ่ายบัญชี`.
   The id-join in P5 depends on a name map, not on the names matching. Confirm with the product
   owner whether org-structure names should be canonicalized or the map is acceptable.
3. **`Company.id` vs `OrgNode` company id.** The plan links them via `Company.orgNodeId`
   (`'org-ghub'`/`'org-mhub'`). The research suggested making them equal. Using a separate
   `orgNodeId` is safer (no id collision, explicit FK) — flagged in case the product owner wants
   true equality. Either is acceptable; the plan uses `orgNodeId`.
4. **Inactive employee-type quota overrides.** P5 chooses "show all types, tag inactive." Confirm
   this matches expectations vs. hiding inactive types entirely.
5. **`.includes()` dispatch fragility.** Company-group routing is substring matching on rewritten
   paths. As more boards are added the chain could mis-order. If the company branch grows past
   ~5 `.includes()` checks, refactor to a dedicated sub-dispatcher (`CompanySettingsTable`,
   mirroring `TimeSettingsTable`) to keep ordering explicit. Not required for P1–P6 but worth it
   if the chain feels brittle.
6. **`hideAutoTabsPaths` vs. board-owned tabs.** Under the merge, the 1.2 องค์กร board owns its
   detail tabs and uses the `organization/structure` path that is **already** in the suppress list —
   no new entry needed. 1.1 / 1.3 ตำแหน่ง / 1.4 ประกาศ rely on auto-tabs. Double-check after each phase
   that the right topic paths are (or aren't) in the array — a wrong entry hides legit tabs or
   double-renders. (In the §15 separate variant, you DO add `organization/companies` to the list.)
7. **`master-personal` path segment.** Its nav path is `/humansource/settings/master-personal`
   (note: under `settings`, not `company`). After the `getSettingsPath` rewrite the dispatch
   substring may be `company/master-personal` (settings-sourced → group key prefixed). **Verify
   the exact rewritten `activeItem.path` by logging once** before finalizing the P1 `.includes()`
   substring; adjust if it differs.
8. **Announcement "audience group" child scope.** P4 leaves `กลุ่มผู้รับประกาศ` deliberately light.
   Confirm whether reusable named audience groups are wanted (would need its own entity + key) or
   per-announcement audience is sufficient for v1.
9. **Company↔node name sync (merge, P2).** Decide a single source for the company display name and
   document it in code so the tree label and the `Company.tradeName` never drift.

---

## 15. Alternative: keep 1.2 / 1.3 separate (empeo-style, 5 items)

If the product owner prefers empeo's **fully separate** model instead of the merge, revert to 5
items — **only Phase 2 changes; every other phase (P1, P3, P4, P5, P6), all conventions, dispatch
gotchas, and the SoT rewire are identical.**

- **Nav:** keep 5 items — `การตั้งค่าพื้นฐาน` / `ข้อมูลบริษัท` / `โครงสร้างองค์กร` / `ตำแหน่ง` / `ประกาศ`
  (no nav edit; the repo is already in this state).
- **Phase 2 shape:** build a **separate multi-company board** `hr-company-settings.tsx`
  (`CompanySettingsBoard`) as a **list → tabbed detail** (left = company list with `tradeName` +
  active pill + `'+ เพิ่มบริษัท'`; right = the 4 tabs `นิติบุคคล/นายจ้าง` · `สาขา` · `เงื่อนไขการทำงาน`
  · `ผู้มีอำนาจลงนาม`, with a real `'สาขา'` list+modal since branches are NOT edited via the tree here).
  Dispatch it on `activeItem.path.includes('organization/companies')` (+ the other 1.2 leaf paths),
  and add `'/humansource/organization/companies'` to `hideAutoTabsPaths`. The org tree (1.3) stays a
  standalone full-width board exactly as shipped; give its company head node an
  **`'แก้ไขข้อมูลบริษัท →'`** action that deep-links to the company board for that entity
  (`ApprovalForm` deep-link pattern).
- The `companies.ts` / `org-structure.ts` data types and seeds in §9 are **unchanged** — only the
  component shape and dispatch differ.

**Trade-off:** clearer separation of "company config" vs "org chart" (matches empeo, and the
company page can grow its own sub-navigation later), at the cost of one extra menu item and the
company appearing in two places (tree node + company list).

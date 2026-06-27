# Design System — G-HUB HumanSource (HR Module)

> **นี่คือแหล่งอ้างอิง UI เดียว (single source of truth) ของ HumanSource module.**
> อ่านไฟล์นี้ให้จบก่อนแตะ UI ทุกครั้ง — ไฟล์นี้รวมเนื้อหา design system V2 ทั้งหมดไว้แล้ว
> และ **supersede** เอกสารเก่า `DESIGN_V2.md` / `COMPONENT_RULES_V2.md` / `LAYOUT_RULES_V2.md` /
> `DESIGN_GOVERNANCE_V2.md` (ไฟล์เหล่านั้นเหลือเป็น stub ชี้กลับมาที่นี่)
>
> - **Token เต็ม (machine-readable):** [`DESIGN_TOKENS_V2.json`](DESIGN_TOKENS_V2.json) — ทุก token traceback ไปยัง UI ต้นทาง
> - **Artifact อ้างอิงสูงสุด:** [`design-samples/holiday-management.html`](design-samples/holiday-management.html) — Holiday Management UI ที่อนุมัติแล้ว เป็น visual authority และ tie-breaker
> - **Product / UX philosophy:** ยังยึด [`PRODUCT.md`](PRODUCT.md) และ [`CLAUDE.md`](CLAUDE.md)
>
> Scope: HR module เท่านั้น (`components/humansource/`, `app/(protected)/humansource/`, `app/(auth)/humansource/`).
> Information module มี visual language แยกและไม่อยู่ภายใต้ active development.

---

## 1. Design Philosophy

**Tool first, impression second.** ทุกหน้าจอ HumanSource คือ work surface สำหรับ HR admin ที่ใช้งานต่อเนื่องเป็นชั่วโมง — interface ต้องหายไปในงาน ไม่ใช่ดึงความสนใจ Holiday Management UI คือต้นแบบของหลักการนี้:

1. **Tool first, impression second.** ทุกการตัดสินใจเชิงภาพรับใช้งาน ถ้าเอา element ออกแล้วยังเข้าใจได้ → เอาออก
2. **Flat over layered.** หน้าเพจเองคือ surface (full-bleed white บน gray shell) — ไม่มี card ครอบ table ไม่มี nested card, ไม่มี glow, ไม่มี gradient เงา (shadow) มีได้เฉพาะสิ่งที่ "ลอย" จริง (dropdown, popover, drawer, modal, tooltip, toast)
3. **Earn every accent.** Indigo `#4f46e5` คือ accent เดียว ใช้กับ active/selected/focus/today **และปุ่ม primary action** — ไม่ใช่ของตกแต่ง
4. **Thai-first clarity.** Kanit เป็น brand font ทุก label/status/error เป็นภาษาไทย
5. **Restrained microcopy.** เชื่อ label hint = บรรทัด muted สั้น ๆ หรือ `ⓘ` tooltip — **ห้าม** tinted callout box หรือประโยคบรรยายใต้ทุก field

นี่คือสิ่งตรงข้ามกับ "AI-generated module" (numbered badge cards, gradient headers, example boxes) ถ้าหน้าจอกำลัง *สอน* ผู้ใช้ด้วย panel ตกแต่ง = หลุดจากระบบแล้ว

---

## 2. Visual Language

| Trait | วิธีแสดงออก |
|---|---|
| **Palette** | Restrained. Neutral gray ramp (`#f6f7fa` → `#0f172a`) ครอง 90%+ ของพื้นผิว · indigo accent เดียว · สี status/category ใช้เฉพาะใน pill/dot |
| **Shape** | radii นุ่มแต่กระชับ: chip `0.375rem`, controls `0.5rem`, card/wrap `0.625rem`, modal `0.75rem`, pill full-round ไม่มีคม ไม่มีกลมเป็นลูกโป่ง |
| **Depth** | flat เป็นหลัก (border + hairline) elevation = สัญญาณว่า "ลอย" ใช้เป็นบันได (resting → dropdown → popover → drawer → modal → tooltip) |
| **Borders** | `#e2e8f0` = border โครงสร้าง, `#edf1f6` = hairline ภายใน (แถว table, setting-row) **1px เท่านั้น** — ห้าม side-stripe หนาสี |
| **Icons** | line/stroke, `stroke-width 1.6`, round caps, `currentColor` ขนาด 0.875 / 1 / 1.25rem **ห้าม emoji** |
| **Type** | family เดียว — **Kanit** — 5 น้ำหนัก hierarchy มาจาก weight + size ไม่ใช่ typeface ที่สอง |
| **Status color** | **สี + ข้อความ เสมอ** (pill มี dot *และ* label) ห้าม color-only |

---

## 3. Typography

Family เดียว **Kanit** (300/400/500/600/700) จาก Google Fonts ใช้ rem scale คงที่ (ไม่ fluid/clamp) เพราะ user ดูที่ DPI คงที่ในงาน

| Role | Size / Weight | มาจาก |
|---|---|---|
| Stat value | 1.5rem / 700, tracking -0.02em | `.statstrip__value` |
| Page title | 1.25rem / 700, tracking -0.01em | `.page-title` |
| Section title | 1rem / 600 | drawer/modal/calendar/empty title |
| Body / data | 0.875rem / 400 | table cell, input, option |
| Label | 0.8125rem / 500–600 | chip, setting-row, fgroup head, button |
| Small label | 0.75rem | field label, breadcrumb, table header (600, uppercase) |
| Micro | 0.72rem / 300–500 | pill, hint, error, tooltip, meta |

Descriptive text (subtitle, hint, empty body) = weight **300** · label/button = **500–600** · heading/number = **700**

---

## 4. Information Density

Holiday Management table คือ baseline density ของทั้ง module:

- **Table row padding `0.7rem 1rem`**, body text `0.875rem`, hairline `#edf1f6` คั่นแถว — แน่นพอ scan หลายแถว ไม่อึดอัด
- **Control สูง `2.25rem` (h-9)**, chip `2rem` — rhythm แนวตั้งเดียวกันทั้ง toolbar/form/table
- **Toolbar เป็นบรรทัดเดียว**: search ซ้าย, filter chip + view toggle ขวา filter เป็น chip (`label ▾` → `value ×`) ไม่ใช่ panel แยก
- **Summary = flat stat strip** ไม่ใช่ grid ของ card ลอย — 4 ส่วนคั่นด้วย hairline ใน surface bordered เดียว

ทุกหน้าใหม่ต้อง match density นี้ ห้ามหลวม/airier หรือแน่นแบบ spreadsheet — ทั้งคู่ทำลายความรู้สึก "ทีมเดียวกัน"

---

## 5. Color & Tokens

ค่าเต็มอยู่ใน [`DESIGN_TOKENS_V2.json`](DESIGN_TOKENS_V2.json) — ตารางนี้คือชุดที่ใช้บ่อย

### Shell tokens (CSS custom properties บน `.hr-shell`)

| Token | Value | Role |
|---|---|---|
| `--hr-surface` | `#ffffff` | card / panel / table bg |
| `--hr-page` | `#f6f7fa` | app shell bg |
| `--hr-border` | `#e2e8f0` | border 1px ปกติ |
| `--hr-border-soft` | `#edf1f6` | hairline divider |
| `--hr-text` | `#0f172a` | heading, primary cell text |
| `--hr-text-muted` | `#64748b` | secondary label, field label, meta |
| `--hr-text-subtle` | `#94a3b8` | placeholder, table th, tertiary |
| `--hr-primary` | `#4f46e5` | **accent + primary action** — active rail, selected, focus, today, ปุ่ม primary |
| `--hr-primary-soft` | `#eef2ff` | selected option bg, active rail bg, soft tint |
| `--hr-primary-ink` | `#4338ca` | selected option text / primary hover / pill indigo text |
| `--hr-focus` | `rgba(99,102,241,0.12)` | focus ring (box-shadow `0 0 0 3px`) |
| focus border | `#818cf8` | input/select :focus border-color |

### ⭐ Primary action color (มติ 2026-06)

> **ปุ่ม primary = indigo `#4f46e5`** (hover `#4338ca`) — **ไม่ใช่สีดำ**
> Indigo ในระบบนี้ทำหน้าที่ **ทั้ง primary action และ active/selected/focus state**
> (มติเจ้าของงาน 2026-06 ปรับจากกฎ V2 เดิมที่ให้ primary เป็นดำ `#111827` เพื่อกันชนกับ indigo-state — เลิกใช้แล้ว)
> ในโค้ด `.hr-button--primary` ใน `globals.css` ใช้ค่านี้อยู่แล้ว

### Status pill tones (มี dot + text เสมอ)

| Tone | bg | fg | dot | ใช้กับ |
|---|---|---|---|---|
| green | `#ecfdf5` | `#047857` | `#10b981` | ใช้งาน / active / ปกติ |
| amber | `#fffbeb` | `#b45309` | `#f59e0b` | ร่าง / pending / ทดลองงาน |
| slate | `#f1f5f9` | `#64748b` | `#94a3b8` | ปิดใช้งาน / inactive / สิ้นสุด |
| indigo | `#eef2ff` | `#4338ca` | `#6366f1` | info / ลาพักร้อน |
| rose (danger) | `#fff1f2` | `#be123c` | — | ลาออก / ปุ่ม danger เท่านั้น |

### Category accent (ใช้เฉพาะ dot/tag — ห้ามเป็น surface fill)

| Category | Value |
|---|---|
| public | `#6366f1` |
| company | `#f59e0b` |
| branch | `#06b6d4` |

### Error
`error` text `#e11d48` · error border `#f43f5e` · error ring `rgba(244,63,94,0.12)`

---

## 6. Spacing / Radius / Shadow / Motion / Z-index

### Spacing rhythm (rem steps ที่สกัดจาก UI — ห้ามใช้ค่ามั่ว)
`0.25 / 0.4 / 0.5 / 0.7 / 0.75 / 1 / 1.1 / 1.25 / 1.5 / 2 rem`
Page padding `1.5rem 2rem` (`1.25rem` เมื่อ < 860px)

### Radius
chip `0.375rem` · control `0.5rem` · card `0.625rem` · modal `0.75rem` · pill `9999px`

### Shadow — **เฉพาะ layer ที่ลอย** (ห้าม resting shadow บน card/table)
| Token | Value | ใช้กับ |
|---|---|---|
| resting | `0 1px 2px rgba(15,23,42,.05)` | empty-state icon chip, seg active |
| dropdown | `0 12px 28px rgba(15,23,42,.12)` | chip menu |
| menu | `0 16px 32px rgba(15,23,42,.14)` | select menu |
| popover | `0 16px 36px rgba(15,23,42,.16)` | date picker |
| drawer | `-16px 0 40px rgba(15,23,42,.14)` | drawer |
| modal | `0 24px 60px rgba(15,23,42,.28)` | modal |
| tooltip | `0 6px 18px rgba(15,23,42,.24)` | tooltip / toast |

### Motion
- **Easing** `cubic-bezier(0.16, 1, 0.3, 1)` (expo-out, no bounce) สำหรับ enter
- **Component / micro-interaction** (V2 scale): fast `120ms` (chip/iconbtn/option), micro `140ms` (hover/focus/color), control `160ms` (toggle), modal `200ms`, drawer `240ms`
- **Page-level content reveal** (ของเดิม ยังใช้ได้): `.erp-fade-in` / `.erp-slide-down` / `hrFadeUp` ราว 400–600ms สำหรับ "เนื้อหาเพจโผล่" — คนละ scope กับ micro-interaction ด้านบน
- **Skeleton shimmer** `1.2s` ease-in-out infinite
- **Reduced motion บังคับ:** ทุก transition/animation ยุบเหลือ `0.001ms` ใต้ `@media (prefers-reduced-motion: reduce)` ไม่มีข้อยกเว้น motion สื่อ state (open/close/select/load) ไม่ใช่ของตกแต่ง

### Z-index scale (กำหนดบน `:root` เพราะ overlay render นอก `.hr-shell`)
dropdown `50` < sticky `60` < drawer-backdrop `100` < **topbar `115`** < drawer `116` < modal-backdrop `120` < modal `130` < tooltip `200`

> หมายเหตุ drawer: standing rule ของโปรเจกต์ให้ drawer คลุมเต็ม viewport รวม topbar → `top:0; height:100vh; z-index:116` (เหนือ topbar 115) scrim (`z 100`) dim เฉพาะเนื้อหา อยู่ใต้ topbar

---

## 7. Components (14)

Global: control height `2.25rem` (chip `2rem`) · focus = border `#818cf8` + ring `0 0 0 3px rgba(99,102,241,.12)` · transition 120–160ms · icon stroke 1.6 currentColor ไม่มี emoji
ทุก component ต้องมี light + `.hr-theme-dark` และ degrade ใต้ `prefers-reduced-motion`

### Button — 4 variant
| Variant | Fill / border | Text | ใช้ |
|---|---|---|---|
| `--primary` | bg `#4f46e5` (hover `#4338ca`), shadow `0 1px 2px rgba(15,23,42,.08)` | `#fff` | action หลัก 1 ปุ่มต่อ surface (เพิ่ม / บันทึก) |
| `--secondary` | border `#e2e8f0`, bg surface | `#64748b` → `#0f172a` hover (bg `#edf1f6`) | cancel, export, neutral |
| `--ghost` | transparent | `#64748b` → hover bg `#edf1f6` | row action, low-emphasis |
| `--danger` | border `#fecdd3`, bg `#fff1f2` | `#be123c` | destructive (ลบ) |

Size: height `2.25rem`, padding `0 0.9rem`, gap `0.45rem`, font `0.8125rem/600`, radius `0.5rem`
States: default / hover / focus (ring) / **disabled** = `opacity .5` + `cursor:not-allowed` + `pointer-events:none`
Dark: `--primary` ใช้ indigo `#4f46e5` (hover `#6366f1`) เหมือน light · `--danger` เป็น rose โปร่งแสง
A11y: icon-only ต้องมี `aria-label`/`title`, hit area ≥ `1.85rem`

### Input (text)
height `2.25rem`, padding `0 0.7rem`, border `1px #e2e8f0`, radius `0.5rem`, bg surface, font `0.875rem`
placeholder `#94a3b8` · label บน `0.75rem/500 #64748b` gap `0.3rem`
**Error:** wrap `--error` → control border `#f43f5e` + ring `rgba(244,63,94,.12)` **และต้องมี `field__error` message** (`0.72rem #e11d48` + icon) — **red border ไม่มีข้อความ = ห้าม** error เคลียร์เมื่อพิมพ์ hint (ถ้ามี) = บรรทัดเดียว `0.72rem/300 #94a3b8` ไม่ใช่ tinted box

### Select (custom — **ห้าม native `<select>`**)
ใช้ `HrCustomSelect` จาก `hr-ui.tsx`
- Trigger: box เหมือน Input, caret = chevron หมุน `#94a3b8`
- Menu: absolute ใต้ trigger (`top:100% + 0.25rem`), `z-index 50`, border, radius `0.5rem`, padding `0.25rem`, shadow menu
- Option: padding `0.5rem 0.7rem`, radius `0.375rem`, hover `#edf1f6` · **selected** = bg `#eef2ff`, text `#4338ca`, weight 600, check icon
- **บังคับ:** click-outside ปิด, Esc ปิด, เลือกแล้วปิด + เคลียร์ error
- **Clipping rule:** ใน container ที่ scroll (drawer body) menu ต้อง escape `overflow` (fixed positioning anchor กับ trigger) — bug ที่เคยเจอใน V1 อย่า regress

### Textarea
border/radius/focus เหมือน Input · `min-height 4.5rem`, padding `0.55rem 0.7rem`, `line-height 1.5`, `resize: vertical`

### Search Field
2 แบบ สูง `2.25rem`: toolbar search (`min-width 15rem`, bg `#f6f7fa`, leading magnifier) และ topbar search (`min(22rem,40vw)`)
magnifier `#94a3b8` · `focus-within` ยก border `#818cf8` + ring · **search อยู่ซ้ายของ toolbar เสมอ**, filter/action ขวา

### Filter Controls (filter chip)
chip สูง `2rem`, padding `0 0.625rem`, radius `0.375rem`, border `#e2e8f0`, font `0.8125rem/400`
- **Inactive:** `ประเภท ▾` · **Active:** `value ×` border+text เป็น accent `#4f46e5` + clear affordance
- Dropdown: `z 50`, min-width `11rem`, shadow dropdown, item `0.4rem 0.625rem`, hover `#edf1f6`, optional leading swatch
- Group `.filter-chip-group` gap `0.5rem` ชิดขวา ตามด้วยปุ่ม primary
- **View toggle** (segmented) อยู่ตรงนี้ด้วย: track inset `2px` บน `#f6f7fa`, active segment = surface + `0 1px 2px`

### Table
- ไม่มี card ครอบ — wrap = `border #e2e8f0 + radius 0.625rem`; scroll แนวนอนเมื่อ < `min-width 60rem`
- **Head:** bg `#f8fafc`, `th` = `0.75rem/600 #94a3b8 uppercase`, padding `0.7rem 1rem`, border-bottom `#e2e8f0`; คอลัมน์ numeric/action ชิดขวา
- **Row:** `td` padding `0.7rem 1rem`, hairline `#edf1f6` (แถวสุดท้ายไม่มี), hover tint
- **Cell ladder:** primary `0.875rem/500 #0f172a`; secondary/meta `0.72–0.75rem #94a3b8`; code = mono `0.72rem #94a3b8`; leading category swatch (`0.4rem` bar) ได้
- **Row actions:** `iconbtn` group, **เผยเมื่อ hover/focus** (opacity 0→1), danger ได้ rose hover
- **Loading:** skeleton row (ไม่ใช่ spinner) · **Empty:** ดู Empty State

### Badge (status pill)
full-round, padding `0.2rem 0.55rem`, font `0.72rem/500`, dot `0.4rem` **+ label** · tone ตามตารางสี §5 · **ห้าม color-only** · category tag ใช้รูปเดียวกันด้วย category dot

### Tabs
underline tab `border-b-2 -mb-px` · active = accent text + accent underline · inactive `#64748b` → hover `#0f172a` · count pill ใน tab = round เล็ก `0.72rem/600` accent-soft เมื่อ active

### Modal (blocking / destructive เท่านั้น)
backdrop `rgba(15,23,42,.45)` `z 120` · modal `z 130`, centered, `width min(26rem,…)`, radius `0.75rem`, shadow modal
enter `modalIn` 200ms expo-out (fade + 8px rise + scale เล็กน้อย)
anatomy: tone icon (`2.5rem` rounded เช่น danger rose) + title `1rem/600` + text `0.8125rem/300`; foot = secondary + primary/danger ชิดขวา
**ใช้เฉพาะ** destructive confirm หรือ blocking decision จริง (ดู Governance §9)

### Drawer (พื้นผิว create/edit หลัก)
right-anchored, `width min(30rem,100vw)`, **`top:0; height:100vh`**, border-left, shadow drawer, **`z-index 116`** (เหนือ topbar 115)
drawer คลุม topbar เต็ม; scrim (`z 100`) dim เนื้อหาแต่อยู่ใต้ topbar
enter: `translateX` 240ms expo-out
anatomy: head (title `1rem/600` + subtitle `0.75rem/300` + close `×`), body scroll (`fgroup` + field grid + setting-row), foot (draft toggle ซ้าย, cancel + primary ขวา)
**บังคับ:** Esc ปิด, scrim click ปิด, **Save/Cancel ชัดเจน — ห้าม auto-save**, form reset เมื่อเปิด

### Tooltip
trigger = `ⓘ` เล็ก (`#94a3b8`, hover accent), `tabindex=0` · bubble เหนือ trigger `z 200`
bubble: dark `#0f172a` (dark theme `#1e293b` + border), text `#f1f5f9 0.72rem/300`, padding `0.45rem 0.6rem`, radius `0.45rem`, max-width `15rem`, caret, shadow tooltip
แสดงทั้ง hover และ focus · ใช้กับ field ซับซ้อน 1 จุด ไม่ใช่แทน label และไม่ใช่ tinted inline callout

### Pagination
row `border-t`, info ซ้าย (`แสดง 1–8 จาก 24 รายการ`, count ตัวหนา), nav ขวา
button ≥ `2rem` square, border `#e2e8f0`, radius `0.4rem`, `0.8125rem/500` · **active** = accent fill `#4f46e5` + white · prev/next มี chevron + disable ที่ปลาย (`opacity .4`)

### Empty State
dashed indigo border `#c7d2fe`, soft indigo tint `rgba(238,242,255,.5)`, radius `0.625rem`, `min-height 18rem`, centered
icon ใน **white box** (`3.25rem`, radius `0.625rem`, resting shadow, accent icon) → title `1rem/600` → desc `0.875rem/300 #64748b` (max ~26rem) → action row (secondary + primary)
ต้อง **สอน action ถัดไป** (เช่น ล้างการค้นหา / เพิ่มวันหยุด) dark theme → translucent indigo

### Loading State
**Skeleton** ไม่ใช่ spinner กลางเนื้อหา · block ใช้ shimmer gradient (`@keyframes sk` 1.2s) บน `#edf1f6` รูปทรงเหมือนจริง (swatch bar + 2 บรรทัด text ต่อแถว) · swap → ข้อมูลจริงเมื่อพร้อม · reduced-motion ยุบ shimmer

---

## 8. Layout

### App Shell
CSS grid `grid-template-columns: 4rem 1fr; grid-template-rows: 3.5rem 1fr;` areas `rail / topbar / main` · shell bg `#f6f7fa`, content surface สีขาว · z-scale ตาม §6

### Sidebar (icon rail)
width `4rem`, sticky เต็มสูง, border-right `#e2e8f0` · brand logo chip บน (`2.25rem`, radius `0.625rem`, accent fill) · item = `2.5rem` rounded square, `#94a3b8` → hover soft; **active** = accent text + `#eef2ff` bg + marker `3px` ขอบซ้าย · spacer ดัน settings + "กลับ G-HUB" ลงล่าง · **< 860px:** rail ซ่อน, nav ย้ายไป topbar

### Header (topbar)
height `3.5rem`, sticky, `z 115`, border-bottom `#e2e8f0` · ซ้าย: global search · ขวา (ดันด้วย spacer): theme toggle, notification (มี dot), user block · **Drawer (z 116) คลุม topbar** — topbar ถูกซ่อนตั้งใจขณะ drawer เปิด

### Toolbar (ต่อหน้า)
flex row เดียว `justify-content: space-between`, gap `0.75rem`, `margin-bottom 1rem`, wrap เมื่อแคบ · **ซ้าย:** search · **ขวา:** filter-chip group → view toggle → ปุ่ม primary · **ห้าม** filter panel/sidebar แยก

### Filter Area + Stat strip
filter chip group ชิดขวา gap `0.5rem` · view toggle (segmented) ท้าย group เมื่อมีหลาย view · **stat strip** (optional) เหนือ toolbar: surface bordered เดียว (`radius 0.625rem`) แบ่งเท่า ๆ ด้วย hairline — **ไม่ใช่** card ลอยเรียงกัน; แต่ละ segment: label+dot (`0.75rem`) + value (`1.5rem/700`); ยุบ 2 คอลัมน์ < 860px

### Table Area
full-bleed ใต้ toolbar · wrap = border + radius `0.625rem`, scroll < `60rem` · pagination ใต้ wrap (border-top, info ซ้าย / nav ขวา) · empty + skeleton แทน table body ในที่เดิม

### Form Layout (ใน Drawer/Modal)
group ด้วย **`fgroup`**: heading (`0.8125rem/600`) แล้วตามด้วย **field grid 2 คอลัมน์** (`fgrid`, gap `0.75rem 0.85rem`); field เต็มแถว span 2 คอลัมน์; **< 860px ยุบ 1 คอลัมน์**
field = label (`0.75rem/500`, gap `0.3rem`) เหนือ control; error message row ใต้ control เมื่อ invalid
grouped toggle/policy ใช้ **setting-row**: label ซ้าย, control ขวา, hairline divider, ใน bordered list — ไม่ใช่ card ต่อ setting · **ห้าม section card / numbered badge ใน flat form**

### Drawer Layout
right-anchored, `width min(30rem,100vw)`, **`top:0; height:100vh`** คลุม topbar · 3 region: head fixed, body scroll (`padding 1.25rem`, `fgroup`), foot fixed (draft toggle ซ้าย, cancel + save ขวา) · scrim dim เนื้อหา (`z 100` ใต้ topbar); drawer (`z 116`) คลุม topbar · **นี่คือ default surface สำหรับ create/edit ของ HR**

---

## 9. Governance — เมื่อไรใช้ pattern ไหน

### Modal — ใช้เฉพาะ
- **Destructive confirmation** (ลบ/ปิดใช้งาน/ทำซ้ำไม่ได้) — holiday delete confirm = reference
- **Blocking decision** จริงที่ต้องตอบก่อนทำอย่างอื่น

**ห้าม** ใช้ modal สำหรับ create/edit form — นั่นคืองานของ Drawer "modal เป็นความคิดแรก" คือ smell ให้ไล่ inline → drawer ก่อน

### Drawer — ใช้สำหรับ
- **Create / edit** record (Add Holiday = reference) · multi-field form ที่อยากอยู่ใน context ของ list
- กฎ: `top:0; height:100vh`, Save/Cancel ชัดเจน (**ห้าม auto-save**), Esc + scrim-click ปิด, form reset เมื่อเปิด

> **Grandfathered exception:** `ShiftSettingsBoard` (สร้าง/แก้กะ) ใช้ multi-step **fullscreen modal** + numbered step sections (1-5) ที่เจ้าของงาน **อนุมัติแล้ว** (`CLAUDE.md §3.1`) — **อย่า rebuild** แต่ของใหม่ทุกอย่างใช้ Drawer

### Table — ใช้สำหรับ
list ของ record ชนิดเดียวกัน (holiday, employee, leave type, shift, PR/PO line…) · full-bleed บน white surface, stat strip + toolbar เหนือ, pagination ล่าง · row action เผยเมื่อ hover; status เป็น pill; primary identifier + muted secondary line ต่อ cell · skeleton ตอน loading, empty state เมื่อไม่มีแถว
**ห้าม** render list เป็น grid ของ card — table คือ canonical list surface

### Card — ใช้เมื่อ
Default: **อย่าใช้** ระบบเป็น flat หน้าเพจคือ surface
- "card" ยอมรับได้เฉพาะเป็น **bordered container เดียว** ที่ group เนื้อหาเกี่ยวข้องจริง (stat strip surface เดียว, setting-row list, calendar grid wrap)
- **ห้าม** nest card, ห้าม grid ของ icon+title+text card เหมือนกัน, ห้าม card ลอยมีเงาบน gray shell ถ้าจะใช้ card เพื่อ "จัดระเบียบ" → ใช้ flat `fgroup` + grid หรือ setting-row list แทน

### Empty State — ใช้เมื่อ
list/area ไม่มีข้อมูล *และ* มี action ถัดไปให้สอน (search ไม่เจอ → "ล้าง" + primary; section ยังไม่มีข้อมูลเช่น "ไม่มีข้อมูลบริษัท" → ชี้ขั้นตอน link) ต้องสอน step ถัดไป ไม่ใช่แค่ "ไม่มีอะไรที่นี่"

### Detail Panel (master/detail) — ใช้เมื่อ
มี **list ของสิ่งที่ชัดเจน** ที่แก้ detail ในที่และอยากอยู่ข้าง list (holiday calendar, org structure) · right panel ต้อง **flat** — `fgroup` heading + field grid / setting-row ไม่มี nested card / numbered badge · ถ้าเป็น create/edit record discrete → ใช้ **Drawer** แทน

---

## 10. HR UI Standard — ต้องไม่ดูเหมือน AI สร้าง

> เจ้าของงาน flag หน้าจอที่ "ดูเหมือน AI ทำ" ซ้ำ ๆ HR admin tool จริงต้อง **กระชับ flat และเชื่อ user**
> เมื่อไม่แน่ใจ → copy layout/spacing/rhythm ของ board ที่อนุมัติแล้ว (`hr-employee-list-page`, `ShiftSettingsBoard`, `hr-leave-settings`, `hr-org-structure`, `OrganizationSettings`, `TimeGeneralSettings`) แทนการคิด visual ใหม่

### Anti-tells — สิ่งที่ตะโกนว่า "AI" (ห้ามทำ)
1. **Tinted "ตัวอย่าง: …" / explainer callout box** ใต้ field — ตัดทิ้ง ถ้าจำเป็นใช้ muted line สั้นหรือ `ⓘ` tooltip ไม่ใช่ panel มีสี
2. **ประโยคบรรยายเต็มใต้ทุก control** — เชื่อ label microcopy ≤ 1 บรรทัด muted เฉพาะที่เพิ่มข้อมูลจริง
3. **Fill-in-the-blank sentence input** ("หากภายใน `[__]` นาที สแกนเกิน `[__]` ครั้ง") — ใช้ field/setting-row แยกแทน ("ช่วงเวลาที่นับ → `[3]` นาที")
4. **Emoji เป็น icon** (✋🎉✅) — ใช้ icon set (`@/components/ui/icons`) หรือ inline SVG ห้าม emoji
5. **แถว/card เหมือนกันซ้ำ ๆ** (เช่นกะเดียวกันใน 5 ช่องวันธรรมดา) — ยุบ (แสดงครั้งเดียว + "จ.–ศ.")
6. **Decorative chrome:** gradient, glow, soft drop-shadow (ยกเว้น modal), wide rounded card บน gray, numbered/badge section card, สี accent รุ้ง
7. **Over-structuring:** ครอบทุก setting เล็ก ๆ ใน bordered card ของตัวเอง — group เข้า flat `hr-setting-row` list เดียว

> **Approved exception — อย่า "แก้":** multi-step create/edit modal ใน `ShiftSettingsBoard` ใช้ numbered step section (`1 2 3 4 5`) ที่เจ้าของงานอนุมัติแล้ว numbered section card ถูก ban เฉพาะใน **flat settings form และ master/detail right-pane** ไม่ใช่ใน step wizard นั้น

### ทำแทน
- **Flat form:** `<h4>`/GroupHeading → field grid (`grid grid-cols-2 gap-4`) ของ labeled field ไม่มี section card
- **Settings list:** `hr-setting-row` (label ซ้าย, control/value ขวา, hairline divider)
- **microcopy กระชับ**, spacing สงบ, border neutral บาง, indigo `#4f46e5` เฉพาะ active/selected/detail + primary, status pill ตามตาราง §5
- **match density รอบข้าง** — อย่า louder/flashier กว่า board ที่อนุมัติแล้ว dark theme บังคับทุก class ใหม่

### Litmus test
ถ้าหน้าจอกำลัง *สอน* user ด้วย example box + ประโยคบรรยาย = ดูเหมือน generate ship เวอร์ชันที่ HR admin ที่รีบ scan และแก้ได้เร็วสุด

### Anti-references (จาก PRODUCT.md)
- **Humansoft / HRD-Expert** — Thai HR เก่า table แน่น font จิ๋ว Windows 98 → G-HUB ต้องใหม่กว่าอย่างน้อย 10 ปี
- **AI-generated "module" pattern** — numbered section card, gradient badge header, card grid บน gray, auto-save inline panel
- **Generic Western SaaS** (BambooHR, Workday) — neutral ไร้ identity ไม่ได้สร้างมาเพื่อ workflow ไทย

---

## 11. Dark Theme + Reduced Motion (parity บังคับ)

- Override ใต้ `.hr-theme-dark` ใน `globals.css` ทุก component ใหม่ **ต้อง** มี dark override ตั้งแต่วันแรก (ไม่ใช่ port ทีหลัง)
- ใช้ CSS variable token (`var(--hr-surface)` ฯลฯ) ไม่ใช่ hex ตรง ๆ เพื่อให้ dark ทำงานด้วยการ swap ตัวแปร
- Dark tokens: surface `#0f172a`, page `#020617`, border `#1e293b`, text `#e2e8f0`, primary `#818cf8`/`#4f46e5`, rail `#0b1120`
- **Reduced motion** ไม่ใช่ทางเลือก — ทุก animation degrade graceful ใต้ `@media (prefers-reduced-motion: reduce)`
- **No color-only** — status ใช้ทั้งสีและ text label

---

## 12. CSS Convention

- HR styles ทั้งหมด → semantic `hr-*` class ใน `apps/frontend/src/app/globals.css` (เช่น `hr-leave-*`, `hr-shift-*`, `hr-holiday-*`, `hr-settings-*`)
- **ห้าม** chain Tailwind utility ยาว ๆ ซ้ำ ๆ สำหรับ HR UI ที่ใช้ซ้ำ — Tailwind utility ยอมรับเฉพาะ **layout one-off** (grid span, spacing, responsive)
- **ห้าม native `<select>/<option>`** — ใช้ `HrCustomSelect` จาก `hr-ui.tsx`
- Custom control (time/color/toggle/checkbox) ต้องรองรับ popover, selected state, click-outside ปิด, Escape ปิด, dark theme
- อย่าสร้าง broad selector ที่ style ข้าม module — ถ้าจำเป็นต้อง global ให้ scope ใต้ HR class

---

## 13. Verification — ก่อนบอกว่าเสร็จ

```powershell
cd apps/frontend
.\node_modules\.bin\tsc.cmd --noEmit
.\node_modules\.bin\eslint.cmd src/components/humansource
```

ทั้งคู่ต้อง exit 0 (TS strict `noUnusedLocals` เปิด → import/var ที่ไม่ใช้ = build break)
สำหรับงาน visual: เช็คหน้าจริงใน browser ทั้ง desktop/mobile width และ light/dark theme; ยืนยัน dropdown/popover ไม่ถูก clip และไม่ทำหน้า jump

---

## 14. Conflict Resolution (tie-breaker)

- **Visual** (สี/typography/spacing/radius/shadow/motion/รูปลักษณ์ component) → **ไฟล์นี้** เป็น authority; ถ้าไฟล์นี้กับ Holiday Management UI ขัดกัน → **UI ถูก** แล้วแก้ไฟล์นี้
- **Product / UX / process / โครงสร้างโค้ด** → [`PRODUCT.md`](PRODUCT.md) / [`CLAUDE.md`](CLAUDE.md) / [`AGENTS.md`](apps/frontend/src/components/humansource/AGENTS.md) นำ
- **Future Rule (binding):** ทุกหน้าใหม่ของ HumanSource (Employee, Leave, Payroll, Shift, Organization, Asset, Inventory, Purchase Request/Order) ต้อง build จากไฟล์นี้ + [`DESIGN_TOKENS_V2.json`](DESIGN_TOKENS_V2.json) **ห้ามคิด style / component pattern ใหม่บนหน้า** ถ้าจำเป็นต้องมีของใหม่ที่ระบบยังไม่มี → เสนอแก้ไฟล์นี้ก่อน แล้วค่อย build เป้าหมายคือทุกหน้ารู้สึกเหมือน "ออกแบบโดยทีมเดียวกัน"

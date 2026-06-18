# Product

## Register

product

## Users

HR managers and administrators in large Thai organizations. They work at a desk, inside
the system for hours at a time — approving leave, managing employee records, configuring
shifts, running payroll. They expect speed and clarity over aesthetics. A secondary user
class is regular employees who check their own leave balance, request time off, and view
schedules. Both groups are Thai-speaking and may have limited familiarity with modern SaaS
tools.

## Product Purpose

G-HUB is an ERP platform for large Thai enterprises. It currently has two modules:
**Information** (facility booking, member management, bonus cards — complete, not under
active development) and **HumanSource / HR** (employee management, attendance, leave,
shifts, payroll, org structure — under active development).

Success means an HR manager can complete their daily tasks — reviewing leave requests,
updating employee records, generating reports — without friction. The system must feel
capable and trustworthy, not like a template someone assembled overnight.

## Brand Personality

Clean · Friendly · Modern

The voice is confident but not cold. It respects the user's time. UI copy is concise and
Thai-first. The system should feel like a well-made tool a Thai enterprise would be proud
to use, not a foreign SaaS with localized labels.

## Anti-references

- **Humansoft / HRD-Expert** — old Thai HR systems with dense tables, tiny fonts, Windows 98
  visual density, dark navy/blue-gray chrome. G-HUB must feel at least a decade newer.
- **AI-generated "module" pattern** — numbered section cards, gradient badge headers, card
  grids stacked on gray, auto-save inline edit panels. These read as template output with
  no design intent. Avoid them entirely.
- **Generic Western SaaS** (BambooHR, Workday style) — white-label neutral that has no
  identity and doesn't feel built for Thai workflows.

## Design Principles

1. **Tool first, impression second.** Every visual decision serves the task. If removing
   an element doesn't break comprehension, remove it.
2. **Flat over layered.** Avoid nested cards, badge-wrapped sections, and stacked surface
   treatments. Plain `<h4>` group headings + a grid of fields is almost always better.
3. **Thai-first clarity.** Kanit is the brand font. Labels, status text, and error messages
   are Thai. Layout density and button sizing must suit Thai workflow conventions.
4. **Semantic classes, not utility chains.** HR styles live in `hr-*` semantic CSS classes.
   Tailwind utilities are for one-off layout only. This keeps the system coherent across
   contributors and prevents drift.
5. **Earn every accent.** Indigo (`#4f46e5`) is the single HR accent. It appears on active
   states, primary actions, and focus rings — not as a decoration. Nothing glows, no
   gradient backgrounds, no shadow except modals.

## Accessibility & Inclusion

- Target WCAG 2.1 AA.
- Dark theme parity required: every component must work in `.hr-theme-dark`.
- Reduced motion: animations must degrade gracefully (framer-motion `useReducedMotion` or
  `@media (prefers-reduced-motion)`).
- No reliance on color alone for status; status pills use both color and text label.

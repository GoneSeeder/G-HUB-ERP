# Design System Extraction

Holiday Management UI เวอร์ชันล่าสุดที่คุณสร้างได้รับการอนุมัติแล้ว

UI นี้ถือเป็น Canonical Design Reference ของ HumanSource Module

หลังจากนี้

ห้ามออกแบบ UI ใหม่

ห้ามปรับปรุง UI

ห้าม Modernize UI

ห้าม Redesign UI

งานของคุณคือวิเคราะห์ UI นี้และสกัด Design System ออกมา

---

# Existing Context

ยังคงใช้อ้างอิง

* DESIGN.md
* PRODUCT.md
* CLAUDE.md

เพื่อเข้าใจ Product Direction และ UX Philosophy

แต่ในด้าน Visual Design

Holiday Management UI ที่ได้รับการอนุมัติแล้ว

ถือเป็น Visual Authority สูงสุด

หากมีความขัดแย้ง

ให้ Holiday Management UI เป็นฝ่ายชนะ

---

# Objective

เปลี่ยน Holiday Management UI ที่ได้รับการอนุมัติ

ให้กลายเป็น Design System ที่สามารถใช้ต่อได้ทั้ง HumanSource Module

---

# Important Rule

ห้ามสร้าง Design System จากทฤษฎี

ห้ามสร้าง Design System จาก Best Practice ทั่วไป

ห้ามสร้าง Design System จาก Material Design

ห้ามสร้าง Design System จาก Tailwind Convention

ห้ามสร้าง Design System จาก SaaS Dashboard ตัวอย่างอื่น

ทุกอย่างต้องถูกสกัดจาก UI ที่ได้รับการอนุมัติแล้วเท่านั้น

---

# Deliverables

## DESIGN_V2.md

อธิบาย

* Design Philosophy
* Visual Language
* Information Density
* HR Design Direction
* ERP Design Direction
* UX Principles

---

## DESIGN_TOKENS_V2.json

ประกอบด้วย

* Colors
* Typography
* Font Weights
* Font Sizes
* Line Heights
* Spacing
* Radius
* Shadows
* Breakpoints
* Motion
* Z Index
* Component Heights
* Icon Sizes

ทุก Token ต้องสามารถอธิบายได้ว่าถูกสกัดมาจากส่วนใดของ UI

---

## COMPONENT_RULES_V2.md

ครอบคลุม

* Button
* Input
* Select
* Textarea
* Search Field
* Filter Controls
* Table
* Badge
* Tabs
* Modal
* Drawer
* Tooltip
* Pagination
* Empty State
* Loading State

สำหรับทุก Component

ระบุ

* Size
* Padding
* Typography
* States
* Interaction
* Accessibility

---

## LAYOUT_RULES_V2.md

ครอบคลุม

* App Shell
* Sidebar
* Header
* Toolbar
* Filter Area
* Table Area
* Form Layout
* Modal Layout

---

## DESIGN_GOVERNANCE_V2.md

กำหนด

* เมื่อไรใช้ Modal
* เมื่อไรใช้ Drawer
* เมื่อไรใช้ Table
* เมื่อไรใช้ Card
* เมื่อไรใช้ Empty State
* เมื่อไรใช้ Detail Panel

---

# Future Rule

หลังจาก Design System V2 ถูกสร้างเสร็จ

ทุกหน้าที่สร้างใหม่

* Employee
* Leave
* Payroll
* Shift
* Organization
* Asset
* Inventory
* Purchase Request
* Purchase Order

ต้องใช้

* Design Tokens
* Component Rules
* Layout Rules

จาก Version 2 ก่อนเสมอ

ห้ามสร้าง Style ใหม่เอง

ห้ามสร้าง Component Pattern ใหม่เอง

หากจำเป็นต้องเปลี่ยน

ต้องเสนอการแก้ไข Design System ก่อน

---

# Success Criteria

ผู้ใช้ต้องรู้สึกว่า

ทุกหน้าของ HumanSource Module

ถูกออกแบบโดยทีมเดียวกัน

มี Visual Language เดียวกัน

มี Information Density เดียวกัน

มี Component Pattern เดียวกัน

และมี UX Direction เดียวกัน

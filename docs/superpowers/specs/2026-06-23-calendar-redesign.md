# Calendar Redesign — Design Spec

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign `AvailabilityCalendar` to integrate cleanly with the Fiestalo'K "Pop Décalé" visual identity — better readability, cohesive colors, no visual rupture.

**Scope:** `src/components/product/AvailabilityCalendar.tsx` and `AvailabilityCalendar.module.css` only. No logic changes — fetching, range selection, and error handling stay exactly the same.

---

## Design Decisions

### Header
- Background: `#fff` (white), **not** the current dark `var(--color-ink)`
- Bottom border: `1px solid #f0f0f0` to separate from the grid
- Month label: `font-family: var(--font-body)`, `font-weight: 800`, `color: var(--color-ink)`, `font-size: 1rem`
- Navigation arrows `‹` / `›`: `color: var(--color-primary)` (coral), `font-size: 1.5rem`, no background

### Weekday labels (Lun–Dim)
- Color: `#bbb` (light gray, subtle)
- Font size: `0.7rem`, `font-weight: 700`
- No uppercase, no coral

### Day cells — states

| State | Background | Text color | Other |
|-------|-----------|------------|-------|
| Available (future) | none | `#2D3436` (`var(--color-ink)`) | `font-weight: 700`, cursor pointer |
| Past / disabled | none | `#ccc` | `cursor: not-allowed`, `opacity` not needed |
| Unavailable (reserved) | `rgba(255,107,107,0.15)` | `#FF6B6B` | `text-decoration: line-through`, `font-weight: 700` |
| Range start / end | `#5B6CF0` | `#fff` | `font-weight: 800`, `border-radius: 10px` |
| In range | `#EDEFFD` | `#5B6CF0` | `font-weight: 700` |
| Hover (available) | `#f5f5f5` | `#2D3436` | transition `0.1s` |

### Grid layout
- Cell padding: `9px 4px`
- Cell border-radius: `10px`
- Grid gap: `4px`
- Grid padding: `14px 12px` top, `14px 12px` bottom

### Legend
- Shown below the grid, separated by `1px solid #f5f5f5`
- Two items: colored dot + label
  - Dot réservé: `background: rgba(255,107,107,0.35)`, `border-radius: 3px`, `10×10px`
  - Dot sélectionné: `background: #5B6CF0`, `border-radius: 3px`, `10×10px`
- Font size: `0.7rem`, color `#aaa`

### Card container
- `background: #fff`
- `border-radius: var(--radius-lg)` (24px)
- `box-shadow: var(--shadow-md)`
- `border: 1px solid var(--color-border)`

### Disabled state handling

Currently, both past days and reserved days use `disabled={past || unavail}` on the button, and the CSS rule `.day:disabled { opacity: 0.35 }` applies to both — washing out the coral on reserved days.

Fix: remove the global `opacity` on `:disabled`. Instead:
- Past days get explicit `color: #ccc` and `cursor: not-allowed` via `.dayPast` class
- Reserved days get their coral style via `.unavail` class — they are still `disabled` (not clickable) but visually styled coral with strikethrough

`.day:disabled` should only set `cursor: not-allowed`, not `opacity`.

### New CSS variable
Add `--color-selection: #5B6CF0` and `--color-selection-light: #EDEFFD` to `tokens.css` so the blue is token-driven.

---

## What does NOT change
- Component props interface (`productId`, `articleIds`, `totalArticles`, `range`, `onChange`)
- Fetching logic (`fetchUnavailableDates`, `useEffect`)
- Range selection logic (`handleDayClick`, `rangeHasBlockedDay`)
- Error message when a range contains blocked days
- `DateRange` export
- Tests in `src/tests/AvailabilityCalendar.test.tsx` (if any exist — only CSS class names may need updating)

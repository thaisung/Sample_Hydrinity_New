# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static website for **HYDRINITY** – a Vietnamese premium skincare brand (US-origin). No build system, no framework, no package manager. Pure vanilla HTML + CSS + JS, opened directly in a browser.

## Files

| File | Purpose |
|------|---------|
| `index.html` | Main landing page |
| `index.css` | All styles (single file, ~1 400+ lines) |
| `index.js` | All client-side JavaScript |
| `product_detail.html` | Product detail page template |
| `cafe_robusta.html` | Standalone product/campaign page (different design system) |
| `font/` | Local font files (MRCH NewYork, SVN Archattes, TH Runalto) |
| `photo/` | All images used in the site |

`index copy.html` and `index.codex_saved.html` are backup snapshots — do not edit them.

## Development

No build step. Open `index.html` in a browser directly, or serve locally:

```bash
# Python
python -m http.server 8000

# Node (if available)
npx serve .
```

To force a CSS/JS cache bust, increment the version query string in `index.html`:

```html
<link rel="stylesheet" href="index.css?v=20260416-22">
```

## Design System (index.css)

All colours, spacing, and type are CSS custom properties in `:root`:

- **Palette:** `--navy` / `--gold` / `--cream` / `--ink` families
- **Dark variants:** `--dark-bg`, `--dark-mid`, `--dark-surface`
- **Typography:** `--font-main` (Varela Round), `--font-heading` (Philosopher), plus local fonts (`MRCH NewYork`, `SVN Archattes`, `TH Runalto`)
- **Type scale:** fluid `clamp()` values from `--text-xs` → `--text-hero`
- **Spacing:** `--space-xs` → `--space-2xl`
- **Shadows/Radii:** `--shadow-sm/md/lg/xl`, `--r-sm/md/lg/xl`
- **Transitions:** `--ease` (standard), `--ease-spring` (bouncy)
- **Layout:** `--max-w: 1440px`, `--pad-x: clamp(18px, 4vw, 56px)`

Use these tokens for any new styles — never hard-code colour or spacing values.

## JavaScript Architecture (index.js)

Each feature is wrapped in its own IIFE or block scope to avoid global leaks:

| Module | Description |
|--------|-------------|
| **Product Search Modal** | Opens a modal; scrapes `.products-grid .product-card` and `.blog-grid .blog-card` from the DOM to build a searchable table. Supports "product" / "blog" mode toggle. |
| **Mobile Nav** | Slide-in panel with accordion sub-menus; `mobileNav.classList.add('open')` toggles it. |
| **Header Scroll** | Adds `.scrolled` to `#header` after 50 px; shows `#scrollTop` after 500 px; shows `.floating-contact` after 120 px. |
| **Fade Up** | `IntersectionObserver` on `.fade-up` elements adds `.visible` class when they enter the viewport. |
| **`makeFadeDragSlider(frameId, slideSelector)`** | Reusable fade-transition slider with drag/swipe and auto-advance (4 600 ms). Used for `#midSlider` and `#resultsFrame`. |
| **Strip Slider** | Translate-based track slider (`#midStripSlider`); shows 1/2/3 cards by breakpoint (680 px / 1024 px). |
| **Product Tabs** | Filters `.product-card[data-cat]` by tab `data-cat` value; "all" shows everything. |
| **Product Custom Select** | Replaces native `<select>` elements inside `.product-select-wrap` with an accessible custom dropdown (keyboard + ARIA). |

## Page Sections (index.html)

Sections are marked with `<!-- ████ SECTION NAME ████ -->` block comments for easy navigation:

`HEADER` → `MOBILE NAV` → `PRODUCT SEARCH MODAL` → `HERO` → `FEATURES BAR` → `HERO SLIDER` → `CATEGORIES` → `STRIP SLIDER` → `PRODUCTS` → `BLOG` → `RESULTS SLIDER` → `ABOUT` → `TESTIMONIALS` → `CTA` → `FOOTER` → `FLOATING CONTACT`

## Naming Conventions

- BEM-like class names for components: `.product-card`, `.product-card__img`, modifiers as separate classes.
- Section wrappers always use `.section` + a specific class (e.g., `.products-section`, `.blog-section`).
- Animation state: `.fade-up` / `.fade-up.visible`; slider active state: `.active`.
- All Vietnamese UI text; product data is hard-coded in HTML (no external API or CMS).

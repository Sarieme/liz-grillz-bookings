# Task 02: Repository Foundation & Scaffold

Foundation setup for **Liz's Grillz Bookings**, an event catering web application built with strict adherence to the project design system.

---

## 1. Directory Structure

```text
task-02-repository-and-scaffold/
├── .env.example       # Template environment variables (no real secrets)
├── README.md          # Documentation and audit of Task 02 foundation
├── index.html         # Semantic HTML5 base layout and home screen
├── package.json       # Project descriptor and zero-dependency preview script
└── style.css          # Base styling consuming tokens strictly from ../tokens.css
```

---

## 2. Architecture & Design System Integration

This scaffold references the single source of truth:
- **Design Tokens Stylesheet**: `../tokens.css` (read-only reference; not edited, duplicated, or copied).
- **Color Roles Only**: Every visual surface and interactive component uses semantic CSS variables (`var(--color-*)`), with zero raw hex codes or palette primitives.
- **Typography Scale**: Strictly applies modular scale tokens from `DM Sans` (`var(--font-size-*)`, `var(--line-height-*)`, `var(--font-weight-*)`, and `var(--letter-spacing-*)`).
- **Elevation**: Shadow effects reference `var(--shadow-soft)` and `var(--shadow-medium)` generated from the brand's primary color.

---

## 3. Screen Specification & Approved Copy

The scaffold implements a single, minimalistic home screen taking full viewport height:
- **Main Heading (`<h1>`)**: `Liz's Grillz Bookings` (uses `display-small` scale, colored in `--color-primary`).
- **Short Line (`<p>`)**: `Browse our catering rates and sample pricing.` (uses `body-large` scale, colored in `--color-on-surface-variant`).
- **Single Action Button (`<button>`)**: `Browse catering rates` (uses `label-large` scale, colored in `--color-primary` / `--color-on-primary`, with hover state `--color-primary-container` / `--color-on-primary-container`).

No other screens, forms, fake payment links, or unimplemented feature claims (e.g., live capacity checking or deposit processing) exist on this page.

---

## 4. Mobile Viewport Height Handling

On mobile browsers (iOS Safari, Android Chrome), `100vh` can exceed the visible viewport when the address bar is visible.
To handle this responsibly while honoring the `100vh` prompt specification:
- Baseline: `min-height: 100vh;`
- Modern dynamic enhancement: `min-height: 100dvh;`
This ensures older browsers receive standard `100vh`, while modern mobile browsers adapt smoothly to the dynamic browser address bar without clipping content.

---

## 5. Local Preview

Run the zero-dependency local static server:
```bash
npm start
```
Navigate to `http://localhost:3000`.


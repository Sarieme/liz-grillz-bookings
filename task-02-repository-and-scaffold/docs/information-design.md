# Information Design: Head Configuration & Body Architecture

This document details the information design decisions implemented on branch `feature/information-design` for Liz's Grillz Bookings.

---

## Part 1: The Head Configuration (Metadata, SEO & Previews)

In modern web development, configuration belongs in the `<head>` of the document while content belongs in the `<body>`. We implemented and verified five foundational head configurations:

### 1. Dynamic Page Titles Across Routes
- **Before:** A single static string across the entire application: `Liz's Grillz Bookings`.
- **After:** Dynamic title generation using Next.js App Router metadata templates (`%s | Liz's Grillz Bookings`):
  - Route One (`/`): `Reserve Event Date | Liz's Grillz Bookings`
  - Route Two (`/rates`): `Catering Rates & Pricing | Liz's Grillz Bookings`
  - Fallback / 404 (`/_not-found`): `Page Not Found | Liz's Grillz Bookings`
- **Verification:** Verified in rendered HTML `<head>` and evidenced in [`evidence/16-head-route-one.png`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-02-repository-and-scaffold/evidence/16-head-route-one.png) and [`evidence/17-head-route-two.png`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-02-repository-and-scaffold/evidence/17-head-route-two.png).

### 2. Concise Tagline (Under 10 Words)
- **Tagline:** *"Lagos event catering reservations verified against kitchen capacity."* (Exact count: 9 words).
- **Placement:** Embedded as the meta description and prominently positioned below the primary heading.

### 3. Deliberate SEO Tags on the Marketing Page
Instead of accepting generic automated SEO tags, tags were curated strictly for the Lagos catering context:
- `robots`: Configured for index and follow on marketing routes, but explicitly omitted on transactional API endpoints and error pages.
- `keywords`: Targeted local intent (`catering lagos`, `event date booking`, `nigerian food catering`, `corporate catering lagos`).
- `canonical`: Set to `https://lizsgrillz.ng` to prevent search engine duplicate content penalties.

### 4. Custom Branded Favicon
- Created an SVG vector favicon in `app/icon.svg` utilizing brand colors from our design tokens:
  - Dark charcoal rounded base (`#1C1917`).
  - Warm grill grates and dual-tone flame emblem in brand primary (`#C2410C`) and secondary accent (`#FB923C`).
- Rendered natively in browser tabs without requiring external image hosting.

### 5. Open Graph Metadata for Messaging Previews
Because Liz's Grillz primarily shares booking links with clients over WhatsApp and email threads, bare URLs produce uninspiring links that look like spam. We added comprehensive Open Graph tags:
- `og:title`: `Liz's Grillz Bookings | Lagos Event Catering`
- `og:description`: `Lagos event catering reservations verified against kitchen capacity.`
- `og:image`: High-contrast preview card (`/og-image.svg`, 1200x630) featuring brand badges, catering guarantees, and Nigerian contact context.
- `og:locale`: `en_NG` (Nigerian English locale).

---

## Part 2: The Body Refinements (Visual Hierarchy & Usability)

### 1. Removing Clutter (What and Why)
- **What Was Removed:** In the earlier scaffold, the page displayed a redundant subtitle: *"Browse our catering rates and sample pricing"*, placed immediately above a form titled *"Check Event Date & Request Quote"*.
- **Why:** Displaying contradictory promises on one screen (browsing vs reserving) creates cognitive conflict. We eliminated the duplicate text from the home reservation screen and moved the pricing matrix to a dedicated `/rates` route.

### 2. Collapsing Unnecessary Choices
- **What Was Collapsed:** The initial concept offered two competing buttons on the home screen: *"Browse catering rates"* and *"Check a date"*.
- **Growth Reasoning:** A first-time visitor organizing an event should not be forced to decide whether to browse or check dates before they even know whether Liz's kitchen is free on their desired date. We collapsed the interaction into a single primary action: *"Check Date Availability & Reserve"*. If they wish to review menu pricing tiers first, a top navigation link takes them to `/rates`.

### 3. Controlled Heading Wrapping (`maxWidth: 14ch`)
- **The Problem:** Without a width constraint, the heading *"Liz's Grillz Bookings"* wraps unpredictably depending on screen width. On screens between 400px and 500px, "Bookings" wraps onto a second line alone, creating an unbalanced orphan.
- **The Fix:** Applying `maxWidth: "14ch"` forces the heading to break deliberately:
  - Line 1: `Liz's Grillz`
  - Line 2: `Bookings`
  This creates a symmetrical visual pyramid that anchors the user's attention.
- **Evidence:** Documented in [`evidence/18-heading-wrap-bad.png`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-02-repository-and-scaffold/evidence/18-heading-wrap-bad.png) and [`evidence/19-heading-wrap-good.png`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-02-repository-and-scaffold/evidence/19-heading-wrap-good.png).

### 4. Button Sizing in `rem` Units
- **Implementation:** Sized with `padding: 0.75rem 1.75rem` and `borderRadius: 8px` (`--radius-md`).
- **Why Not Fixed Pixels:** Fixed dimensions (`width: 280px; height: 50px`) break when a user increases their system font size or when button text changes. Sizing with relative `rem` padding ensures the button grows proportionally with typography while maintaining 8px spatial harmony.

### 5. Application of Design System Label Style
- Applied our design token typography directly to every button:
  - Font family: `var(--font-family-primary)` (DM Sans).
  - Font size: `var(--font-size-label-large)`.
  - Line height: `var(--line-height-label-large)`.
  - Font weight: `var(--font-weight-label-large)` (600 / Semi-Bold).
  - Letter spacing: `var(--letter-spacing-label-large)`.

### 6. Interactive Feedback & Clickable Logo
- Pointer behavior (`cursor: pointer`) explicitly set on all interactive buttons, inputs, and links.
- Hover feedback: button smoothly transitions background color from `--color-primary` (`#C2410C`) to `--color-primary-container`, deepens box-shadow from `--shadow-soft` to `--shadow-medium`, and applies a subtle lift (`transform: translateY(-1px)`).
- The brand logo in the top navigation header is a semantic link returning users safely to `/`.

### 7. Fluid Responsiveness with `clamp()`
- Replaced rigid font sizes with modern CSS fluid scaling:
  `fontSize: clamp(2rem, 4vw + 1rem, 3rem)`
- On mobile devices (320px–375px), text scales down fluidly to avoid viewport overflow and horizontal scrollbars.
- On large desktop displays (1200px+), text scales to headline proportion without blurriness or layout distortion.
- **Evidence:** Evidenced across three viewport widths in [`evidence/20-responsive-three-widths.png`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-02-repository-and-scaffold/evidence/20-responsive-three-widths.png).


# Known Defects & Production Risks: Task 02 Foundation

This document details known defects, unexpected behaviors, and architectural gaps encountered during Task 02 scaffolding and database integration.

---

## Defect 1: Port Conflict on Development Server Startup (EADDRINUSE: 3000)
- **What happened:** When initializing the Next.js development server, the process failed immediately with `listen EADDRINUSE: address already in use :::3000` because an orphaned process was already bound to the default port.
- **Root Cause:** A prior Node.js instance (PID 28228) remained open in the background without properly releasing its TCP listener socket.
- **Cost in production:** In a containerized or automated deployment pipeline (e.g. Docker, Railway, or Kubernetes), an unreleased port prevents new container instances from binding, triggering fatal restart loops and complete downtime.
- **Resolution:** Used `netstat -ano | findstr :3000` to pinpoint the specific process ID holding the port, terminated the process with `taskkill /PID <PID> /F`, and restarted the server cleanly on port 3000.
- **Evidence Reference:** [`evidence/07-port-conflict.txt`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-02-repository-and-scaffold/evidence/07-port-conflict.txt) and [`evidence/08-port-conflict-resolved.txt`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-02-repository-and-scaffold/evidence/08-port-conflict-resolved.txt).

---

## Defect 2: Turbopack Parent Directory Import Resolution Failure
- **What happened:** Attempting to import the shared design system directly via `import "../../tokens.css"` in `app/layout.tsx` caused Turbopack to throw a build error stating the module could not be resolved outside the project root.
- **Root Cause:** Turbopack restricts file resolution to the folder containing `package.json` by default, treating parent directory imports as security and boundary hazards.
- **Cost in production:** If unresolved, developers are tempted to copy or duplicate `tokens.css` into the scaffold folder, destroying the single source of truth and causing style drift between tasks.
- **Resolution:** Added `turbopack: { root: path.resolve(__dirname, "..") }` inside `task-02-repository-and-scaffold/next.config.ts`, declaring the repository root as the workspace boundary. Verified with `npm run build` exiting with code 0.
- **File Reference:** [`task-02-repository-and-scaffold/next.config.ts`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-02-repository-and-scaffold/next.config.ts).

---

## Defect 3: Omission of Spacing and Border-Radius Tokens in Design System
- **What happened:** The source design system (`design-tokens.tokens (1).json`) and compiled stylesheet (`tokens.css`) define colors, typography, and shadows, but define zero tokens for layout spacing (margins, padding, gaps) or border radii.
- **Root Cause:** The upstream Figma variables export only included color, typography, and drop shadow collections, leaving spatial layout undefined.
- **Cost in production:** Without standardized spacing tokens, different developers and screens use mismatched padding and margin values (e.g. 10px vs 12px vs 16px), degrading visual rhythm and brand cohesion.
- **Resolution:** Rather than unilaterally inventing unauthorized tokens in violation of the design system rules, layouts use relative typographic units (`em`, `rem`) harmonized with line-height ratios, and card/button radii are kept to standard 8px and 12px values pending formal design system additions.
- **File Reference:** [`task-02-repository-and-scaffold/app/page.tsx`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-02-repository-and-scaffold/app/page.tsx).

---

## Defect 4: Mobile Viewport Height (`100vh`) Toolbar Clipping
- **What happened:** Setting container height to `100vh` on mobile browsers (Safari on iOS, Chrome on Android) causes the bottom of the page to extend underneath the dynamic address and navigation bars.
- **Root Cause:** The CSS `100vh` unit calculates against the maximum viewport height assuming address bars are hidden, failing to account for visible browser controls.
- **Cost in production:** Organizers viewing the catering page on mobile phones find the primary action button ("Submit Booking Enquiry") pushed beneath the fold or obscured by browser controls.
- **Resolution:** Implemented dynamic viewport sizing using `min-height: 100vh; min-height: 100dvh;`. Modern mobile browsers utilize `100dvh` to adjust dynamically to the visible screen area, while legacy browsers fall back to `100vh`.
- **File Reference:** [`task-02-repository-and-scaffold/app/page.tsx`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-02-repository-and-scaffold/app/page.tsx).

---

## Defect 5: Unstyled Generic 404 Error on Missing Routes
- **What happened:** Navigating to an unhandled URL path (e.g. `/unknown-route`) returned a generic Next.js 404 page with default black-and-white typography and no branding.
- **Root Cause:** Next.js uses an internal unstyled default 404 template unless a custom `not-found.tsx` component is explicitly defined in the `app/` directory.
- **Cost in production:** Clients following mistyped catering links sent via WhatsApp would encounter an intimidating, unbranded error page, damaging brand confidence.
- **Resolution:** Created `app/not-found.tsx` styled strictly with design system color roles (`--color-surface`, `--color-primary`, `--color-on-surface`) and typography tokens, including a semantic link returning users safely home.
- **Evidence Reference:** [`evidence/09-404-error.txt`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-02-repository-and-scaffold/evidence/09-404-error.txt) and [`evidence/10-404-resolved.txt`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-02-repository-and-scaffold/evidence/10-404-resolved.txt).


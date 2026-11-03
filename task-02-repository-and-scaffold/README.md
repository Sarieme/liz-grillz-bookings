# Task 02: Repository Foundation, Scaffold, and Database Diagnostics

This document is written for a technical interviewer who has four minutes to understand what was accomplished, what architecture was chosen, and what went wrong during Task 02.

---

## 1. What This Task Was
The objective of Task 02 was to take Liz's Grillz Bookings from design tokens to an operational, persistent web application foundation using an AI agent under strict human control. 

The task required proving three things:
1. That the application foundation could be scaffolded without violating design system constraints (zero raw hex colors, zero unapproved fonts, zero UI libraries, and read-only token consumption).
2. That the development server could be deliberately broken three distinct ways (nested directory error, TCP port conflict, and unhandled 404) and diagnosed systematically using machine-specific evidence rather than guessing.
3. That data writes to a persistent database could be verified via authentic HTTP 201 status codes and database inspector records, while rejecting false success when persistence fails.

---

## 2. What We Built
- **Full-Stack Application Foundation**: Next.js 16.3.8 (App Router with Turbopack) configured to resolve the design system tokens (`../../tokens.css`) from the repository root as a single source of truth.
- **Relational Data Persistence**: PostgreSQL 18 local database integrated via Prisma ORM 6.19.3. Defined the `Booking` data model with schema migrations (`20261102152050_init_bookings`).
- **Interactive Booking Form**: Client-side interactive form (`app/page.tsx`) capturing event inquiries (client name, phone number, event date, guest count, and organization type: Individual, Church, or Corporate Office) styled exclusively with design tokens.
- **Transactional API Route**: `POST /api/bookings` route handler that validates input, writes atomic records to PostgreSQL, and returns `HTTP 201 Created` with the persistent record ID and timestamp.
- **Custom 404 Route**: Token-styled `app/not-found.tsx` to handle missing routes without jarring default browser styling.

---

## 3. What We Decided
1. **Next.js 16 with Turbopack over Static Server**: A dynamic framework was required to handle real backend database persistence and API route transactions. Turbopack provides sub-second compilation while respecting custom CSS token linking.
2. **PostgreSQL over SQLite**: Given Nigerian Data Protection Act (NDPA) privacy rules and multi-client concurrent bookings (e.g. churches and corporate offices requesting competing dates), PostgreSQL provides genuine ACID transaction isolation and production-grade connection handling.
3. **Prisma ORM over Raw SQL**: Prisma guarantees compile-time type safety across database operations and includes Prisma Studio for visual inspection of persisted records.
4. **Strict HTTP 201 Contract**: The client UI is architected never to show a success message based on form submission alone. It requires a verified `HTTP 201 Created` status from the server containing the unique database CUID.
5. **Dynamic Viewport Height (`100dvh`)**: To prevent mobile browser address bars from obscuring buttons, `min-height: 100dvh` was implemented with a `100vh` fallback.

---

## 4. What We Got Wrong (And How We Recovered)
1. **Turbopack Boundary Restriction**: Turbopack initially refused to compile `import "../../tokens.css"` because the design system was located outside the task subfolder. Rather than duplicating or copying the CSS file (which would violate single source of truth rules), we declared `turbopack: { root: path.resolve(__dirname, "..") }` in `next.config.ts`.
2. **Port 3000 Collision**: An orphaned background Node.js process held port 3000, causing `listen EADDRINUSE`. We diagnosed the conflict using `netstat -ano | findstr :3000`, identified the specific PID (28228), terminated it with `taskkill`, and restarted cleanly.
3. **Design System Spacing Gaps**: The tokens JSON export contained no spacing (margin/padding) or border-radius tokens. Rather than unilaterally inventing tokens, we used relative typographic units (`em`, `rem`) harmonized with line-height ratios.
4. **False-Success Vulnerability**: If the database was unreachable, a naively coded frontend could report success. We deliberately tested this by pointing `.env` to port `5433`, confirmed that Next.js and Prisma caught the failure, returned `HTTP 500`, and verified that the UI explicitly alerted the user.

---

## 5. Key Evidence Artifacts
- **Scaffolding Plan & Files Created**: [`evidence/01-agent-plan.txt`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-02-repository-and-scaffold/evidence/01-agent-plan.txt) and [`evidence/02-files-created.txt`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-02-repository-and-scaffold/evidence/02-files-created.txt)
- **Deliberate Breakages & Fixes**: [`evidence/05-nested-folder-error.txt`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-02-repository-and-scaffold/evidence/05-nested-folder-error.txt) through [`evidence/10-404-resolved.txt`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-02-repository-and-scaffold/evidence/10-404-resolved.txt)
- **Verified Database Writes (201 Created)**: [`evidence/11-write-succeeded-logs.txt`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-02-repository-and-scaffold/evidence/11-write-succeeded-logs.txt)
- **Prisma Studio Table Rows**: [`evidence/12-database-rows.png`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-02-repository-and-scaffold/evidence/12-database-rows.png)
- **Rejection of False Success**: [`evidence/13-write-failed-logs.txt`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-02-repository-and-scaffold/evidence/13-write-failed-logs.txt) and [`docs/false-success.md`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-02-repository-and-scaffold/docs/false-success.md)
- **Working Tree Hand Drawing**: [`evidence/14-working-tree-drawing.jpg`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-02-repository-and-scaffold/evidence/14-working-tree-drawing.jpg) and [`docs/working-tree.md`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-02-repository-and-scaffold/docs/working-tree.md)
- **Git Commit Graph & PR Merge**: [`evidence/15-git-log-graph.txt`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-02-repository-and-scaffold/evidence/15-git-log-graph.txt) and [Pull Request #1](https://github.com/Sarieme/liz-grillz-bookings/pull/1)
- **Information Design Screenshots**: [`evidence/16-head-route-one.png`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-02-repository-and-scaffold/evidence/16-head-route-one.png) through [`evidence/20-responsive-three-widths.png`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-02-repository-and-scaffold/evidence/20-responsive-three-widths.png) and [`docs/information-design.md`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-02-repository-and-scaffold/docs/information-design.md)
- **Interview Answers (15/15 Complete)**: [`docs/interview-answers.md`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-02-repository-and-scaffold/docs/interview-answers.md)

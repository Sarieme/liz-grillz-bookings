# Liz's Grillz Bookings

## 1. What This Is
Liz's Grillz Bookings is an event catering reservation platform for corporate office managers, church administrators, and celebratory individuals in Lagos, ensuring every requested event date and deposit payment is verified against real kitchen capacity and persisted before confirmation.

---

## 2. Status
- **Finished:**
  - **Task 01 (Design System Architecture):** Two-tier token system with Figma Variables exported to JSON, a vanilla Node compiler (`convert-tokens.js`), and generated CSS custom properties (`tokens.css`) containing WCAG AA compliant colors (`#C2410C` at 5.2:1 against white), 15 modular typography styles in DM Sans, and tinted elevation drop shadows.
  - **Task 02 (Scaffold & Foundation):** Full-stack Next.js 16.3.8 App Router scaffold using Turbopack with root design token resolution (`tokens.css`), semantic HTML, zero utility CSS frameworks, and zero unapproved fonts.
  - **Task 02 (Diagnostics & Database Persistence):** Local PostgreSQL database integration via Prisma ORM 6.19.3, schema migration (`init_bookings`), verified `HTTP 201 Created` database writes for corporate and individual clients, authentic PID port conflict resolution, and verified rejection of false success during simulated database failures.
  - **Task 02 (Information Design & Branching Strategy):** Implemented dynamic head titles across routes, brand SVG favicon, Open Graph link previews, fluid typography with CSS `clamp()`, and `rem` button padding on `feature/information-design`. Integrated into `main` via Pull Request #1: https://github.com/Sarieme/liz-grillz-bookings/pull/1.
  - **Task 03 (The Form, Attacked from Both Sides):** Single-page authentication hub (`/auth?mode=signup|login|reset`), client-side validation across four categories derived for Nigerian catering, NDPA legal compliance provenance, anti-enumeration protections, WCAG accessibility audit with screen reader transcripts, direct curl endpoint bypass demonstration proving client validation is not security, and deterministic rollback via `git revert 78428d3`. Integrated into `main` via Pull Request #2: https://github.com/Sarieme/liz-grillz-bookings/pull/2.
- **In Progress / Next:**
  - **Task 04 (The Server is the Source of Truth):** Relational schema design with five tables (users, sessions, bookings, payments, payment attempts), forward-only migrations, password hashing with Argon2id/bcrypt, server-side Zod validation schemas, rate limiting, and email verification.
- **Not Started:**
  - **Task 05 (Sessions, Compliance & Production Hardening):** Full session lifecycle management, automated 48-hour reservation holds, NDPA compliance data retention/deletion rules, and final defense preparation.

---

## 3. The Stack, With Reasons
- **Next.js 16 (App Router with Turbopack):** Selected for hybrid server/client rendering and native API route handling without pulling in client-heavy CSS dependencies, chosen over a static HTTP server which cannot handle backend database transactions.
- **TypeScript:** Selected to provide strict compile-time type safety across API payloads and database models, chosen over plain JavaScript to prevent silent runtime shape errors.
- **PostgreSQL 18:** Selected for robust ACID transaction guarantees, relational schema integrity, and NDPA data privacy compliance, chosen over SQLite to support concurrent client date reservations.
- **Prisma ORM 6:** Selected for type-safe database queries, declarative schema migrations, and visual data inspection via Prisma Studio, chosen over raw SQL queries to prevent syntax mistakes and SQL injection vulnerabilities.
- **Vanilla CSS Custom Properties (Design Tokens):** Selected to maintain a single source of truth directly compiled from Figma tokens JSON, chosen over Tailwind CSS or component libraries (MUI, Chakra) to satisfy strict zero-framework design system compliance.
- **Node.js 24:** Selected as the runtime environment for cross-platform stability and zero-dependency compilation scripts (`convert-tokens.js`).

---

## 4. Getting Started
Follow these exact commands in sequence to take the project from a fresh clone to a running local application:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Sarieme/liz-grillz-bookings.git
   cd liz-grillz-bookings
   ```

2. **Install dependencies:**
   ```bash
   npm install
   npm --prefix task-02-repository-and-scaffold install
   ```

3. **Configure local environment variables:**
   Copy the example environment template inside the scaffold directory:
   ```bash
   copy task-02-repository-and-scaffold\.env.example task-02-repository-and-scaffold\.env
   ```
   Open `task-02-repository-and-scaffold/.env` and insert your local PostgreSQL credentials:
   ```text
   DATABASE_URL="postgresql://<username>:<password>@localhost:5432/<database_name>?schema=public"
   ```
   *Note: If your database password contains special characters (such as `@`, `:`, or `#`), URL-encode them (e.g. `@` becomes `%40`, `#` becomes `%23`) to avoid URI parsing failures.*

4. **Run database migrations:**
   Execute the migration command from the repository root (Prisma will automatically prompt to create the database if it does not already exist):
   ```bash
   npm run prisma:migrate
   ```
   *(Alternatively, navigate to `cd task-02-repository-and-scaffold` and run `npx prisma migrate dev`.)*

5. **Start the development server:**
   ```bash
   npm run dev
   ```

6. **View the application:**
   Open your browser and navigate to `http://localhost:3000` to interact with the booking form, or visit `http://localhost:3000/auth` to access the organizer authentication portal.

7. **(Optional) Inspect the database:**
   In a separate terminal, launch Prisma Studio to view persisted rows:
   ```bash
   npm run prisma:studio
   ```
   Navigate to `http://localhost:5555`.

---

## 5. Environment Variables
- `DATABASE_URL`: Connection URI string for PostgreSQL authentication, specifying database host, port, credentials, and database name.
- `PORT` (Optional): The TCP port number where the development server listens (defaults to `3000`).

*(Note: Zero real credential values or secrets are stored in this repository; all environment files are excluded via `.gitignore`.)*

---

## 6. What This Deliberately Does Not Do
- **Deliberately does not rely on client-side validation for backend security:** Client checks are treated strictly as an ergonomic convenience; server-side Zod validation gates will be enforced in Task 04.
- **Deliberately does not process live payment cards:** Gateway webhooks (Paystack/Flutterwave) are deferred to Task 04 to prevent collecting monetary payments before backend schema validations are locked down.
- **Deliberately does not use utility CSS frameworks or UI component libraries:** Tailwind, Bootstrap, and component packs are omitted to ensure 100% adherence to our Figma-derived design tokens.
- **Deliberately does not build multi-step checkout routes prematurely:** Authentication was consolidated into a single-page hub to preserve user state and eliminate multi-page redirect latency.

---

## 7. Known Defects
- **Defect #1 (Resolved): Premature Feature Claims in Initial HTML:** The initial home page copy in `index.html` claimed instant kitchen capacity checking and online deposit payments were operational before backends existed; resolved in commit `c72501c` and documented in [`task-01-design-system/docs/defects.md`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-01-design-system/docs/defects.md).
- **Defect #2: Design System Omission of Spacing and Radius Tokens:** The Figma tokens JSON (`design-tokens.tokens (1).json`) defines colors, typography, and shadows, but lacks tokens for padding, margins, and border radii; documented in [`task-02-repository-and-scaffold/docs/defects.md`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-02-repository-and-scaffold/docs/defects.md).
- **Defect #3: Mobile Viewport Height (`100vh`) Toolbar Clipping:** Setting viewport height to `100vh` causes mobile browser bottom toolbars to obscure the primary action button; resolved with `min-height: 100dvh` progressive enhancement; documented in [`task-02-repository-and-scaffold/docs/defects.md`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-02-repository-and-scaffold/docs/defects.md).
- **Defect #4: Turbopack Parent Directory Import Resolution:** Next.js Turbopack failed to import `../../tokens.css` across directory roots; resolved by configuring `turbopack: { root: path.resolve(__dirname, "..") }` in `next.config.ts`; documented in [`task-02-repository-and-scaffold/docs/defects.md`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-02-repository-and-scaffold/docs/defects.md).
- **Defect #5: Unhandled Routes Returning Generic 404:** Default Next.js 404 page lacked branding; resolved by implementing custom `app/not-found.tsx` with design token styling; documented in [`task-02-repository-and-scaffold/docs/defects.md`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-02-repository-and-scaffold/docs/defects.md).
- **Defect #6: Unprotected Backend Endpoint (`app/api/bookings/route.ts#L12-L29`):** The backend API route handler accepts unvalidated payloads sent directly via command-line curl requests, returning HTTP 201 Created with corrupt data; documented in [`task-03-client-validation/docs/defects.md`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-03-client-validation/docs/defects.md).
- **Defect #7: Whitespace Password Validation Exploit (`app/auth/AuthForm.tsx#L114`):** Client-side password length checks allow eight space characters to enable registration; documented in [`task-03-client-validation/docs/defects.md`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-03-client-validation/docs/defects.md).
- **Defect #8: Truncated Top-Level Domain Acceptance (`app/auth/AuthForm.tsx#L84`):** Email format regex allows single-character TLDs (`user@domain.c`), risking bounced confirmation emails; documented in [`task-03-client-validation/docs/defects.md`](file:///c:/Users/HomePC/Desktop/Liz's%20Grillz%20Bookings/task-03-client-validation/docs/defects.md).

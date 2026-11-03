# README Usability Test Report

## 1. Test Setup & Tester Profile
- **Tester:** Tobi (Junior Frontend Developer, friend of the author who has never worked on this repository).
- **Date:** November 3, 2026
- **Test Machine:** Windows 11 Laptop, Node.js v24.20.0, PostgreSQL 17 installed locally.
- **Task Given:** Follow Section 4 ("Getting Started") of the root `README.md` from a fresh clone to get the application running without asking for verbal assistance.

---

## 2. Verbatim Observations & What They Got Stuck On

### Issue 1: NPX Prefix Syntax on Windows
- **Verbatim Quote:**  
  *"On step 4, I copied `npx --prefix task-02-repository-and-scaffold prisma migrate dev` into PowerShell, and it gave me an error: `npm error Unknown argument: --prefix`. Does npx take a prefix flag on Windows? Should I just cd into the folder?"*
- **Root Cause:**  
  While `npm` supports `--prefix <dir>` for running package scripts, `npx` handles positional CLI flags differently across Windows shells and can reject `--prefix` when invoking the Prisma binary.
- **Fix Applied:**  
  Clarified Step 4 to navigate directly into `task-02-repository-and-scaffold` or use the dedicated root npm script (`npm run prisma:migrate`).

---

### Issue 2: Special Characters in PostgreSQL Database Password
- **Verbatim Quote:**  
  *"I created my .env file and pasted my password `P@ssword123`. When I ran the migration, it failed with `P1000: Authentication failed against database server at localhost:5432`. It took me ten minutes on Google to realize the @ sign broke the URL. Your readme didn't mention URL encoding."*
- **Root Cause:**  
  In standard URI connection strings (`postgresql://user:pass@host:port/db`), unencoded reserved characters such as `@`, `:`, `/`, or `#` in the password corrupt the hostname parsing logic.
- **Fix Applied:**  
  Added an explicit callout in Step 3 warning users with special characters in their database passwords to URL-encode them (e.g. `@` becomes `%40`, `#` becomes `%23`).

---

### Issue 3: Uncertainty About Pre-Creating the Database in PostgreSQL
- **Verbatim Quote:**  
  *"Before I ran the migrate command, I stopped and opened pgAdmin because I wasn't sure if I needed to create the database `lizs_grillz` first, or if Prisma would create it for me."*
- **Root Cause:**  
  The README did not clarify that `prisma migrate dev` automatically detects if the target database does not exist and prompts: *"Do you want to create the database? (y/n)"*.
- **Fix Applied:**  
  Added a brief note confirming that Prisma automatically prompts to create the database if it does not already exist.

---

## 3. Summary of README Revisions
Following this test, Section 4 of the root `README.md` was updated with:
1. Simpler, shell-agnostic commands using `cd task-02-repository-and-scaffold` for database commands.
2. A clear tip on URL-encoding password special characters to prevent P1000 connection errors.
3. Confirmation that Prisma creates the database automatically during migration.

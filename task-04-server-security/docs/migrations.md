# Database Migration Engineering and Drift Management

## 1. Overview

A database migration is any version-controlled instruction given to an Object-Relational Mapper (ORM) or database engine to modify structural schemas, relations, constraints, or persistent data. While application code in Git can be branched, merged, and reverted arbitrarily, persistent data in a production database cannot be rolled back casually without risking data loss.

This document details the engineering discipline behind our Task Four database migrations for Liz's Grillz Bookings, analyzing forward-only migration architecture, the prohibition against retroactively editing executed migrations, the propose-and-stop rule for AI agents, and schema drift mechanics.

---

## 2. Why Migrations Must Be Forward-Only

In modern continuous deployment environments, database changes must be forward-only. A forward-only migration philosophy means every change, correction, or rollback is implemented by applying a brand-new migration that moves the schema forward to a newly desired state, rather than attempting to execute a destructive "down" migration or reverting history.

There are three primary reasons for forward-only migrations:
1. **Asymmetric State and Irreversible Data Loss**: While creating a table or adding a column can be described mathematically with an inverse (`CREATE TABLE` inverses to `DROP TABLE`), data changes are frequently irreversible. If a column is dropped in a rollback, all data accumulated while that column was live is irrevocably erased. Forward migrations ensure data is migrated, archived, or transitioned without destructive table truncations.
2. **Distributed Multi-Instance Synchronization**: In cloud environments running multiple API instances, rolling a database schema backward while older container instances are still handling customer requests causes immediate application crashes. Moving forward allows running backwards-compatible transitional schemas (e.g., supporting old and new column names concurrently).
3. **Audit Provenance**: Forward-only migrations preserve an immutable historical timeline of every structural evolution the database underwent, mirroring financial ledger principles.

---

## 3. Why You Never Edit an Executed Migration

A migration file that has been applied to any environment (staging, production, or a colleague's local machine) must be treated as permanently immutable.

When Prisma or any relational migration tool runs, it computes a cryptographic hash (SHA-256) of each migration SQL script and records that hash in a metadata table called `_prisma_migrations`. On every subsequent migration run, the ORM compares the files on disk against the database ledger:
- If a developer edits an existing migration file (for example, altering a column type or adding a constraint in `20261105180110_init_task4_schema/migration.sql`), the computed hash on disk conflicts with the hash stored in PostgreSQL.
- The migration engine halts with a checksum mismatch failure: *"Migration has been modified after it was applied."*
- More critically, in a collaborative team, modifying an already-run migration means team members who already applied the old version will never receive the newly edited changes, causing silent schema bifurcation and unreproducible query failures across team branches.

If a migration introduced a flaw, the only correct fix is to write and commit a new migration that repairs the defect.

---

## 4. Running Migrations by Hand: The Propose-and-Stop Rule

In agentic engineering workflows, coding agents must be strictly prohibited from executing database migrations autonomously. In our repository instructions, the agent operates under the propose-and-stop rule: the agent may inspect the schema, propose changes to `schema.prisma`, and draft migration plans, but the human engineer must execute the actual migration command in the terminal.

### Why Autonomous Agent Migrations Are Prohibited
1. **Irreversible DDL Execution**: An AI agent generating an aggressive schema change might execute a destructive `DROP COLUMN` or recreate a table without recognizing that live customer bookings will be erased.
2. **Interactive Production Gatekeeping**: Commands such as `npx prisma migrate dev` detect schema conflicts and prompt interactively for data resets (`"We need to reset the database. All data will be lost. Do you want to continue? [y/N]"`). An automated tool script running non-interactively might pass `--force` or `--accept-data-loss`, wiping production databases in seconds.
3. **Operational Accountability**: Database state is the ultimate asset of any business. The engineer who owns the application must review the generated SQL file line-by-line before applying it to disk.

### The Honest Cost of Running Migrations by Hand
Enforcing manual migration execution carries genuine operational friction:
- **Development Velocity Friction**: It slows down prototyping. Instead of a coding assistant seamlessly updating the entire stack in one prompt, development pauses while the developer navigates terminal directories, reviews DDL scripts, and confirms execution.
- **Human Forgetfulness and Pipeline Gaps**: Human engineers forget steps. A developer might change `schema.prisma`, test locally, push code to Git, and forget to run the migration command on staging or production, triggering the exact schema drift error documented in Section 5.

---

## 5. Schema Drift: When Code and Catalog Diverge

Schema drift occurs when the application code's mental model of the database diverges from the physical reality in PostgreSQL.

During Step 3.4, we triggered an intentional schema drift error (Prisma Error Code `P2022`):
1. We added `driftTestField String @default("unmigrated_value")` to `model Booking` in `schema.prisma`.
2. We ran `npx prisma generate`, which compiled new TypeScript definitions into `node_modules/@prisma/client`.
3. We omitted `npx prisma migrate dev`, leaving the PostgreSQL physical table catalog untouched.
4. When our test script invoked `prisma.booking.findMany()`, Prisma issued a SQL statement requesting column `"driftTestField"`. PostgreSQL aborted with:
   ```text
   The column `Booking.driftTestField` does not exist in the current database.
   ```

This proved that type-safety in TypeScript is purely a static contract; without physical database migrations, compile-time validity provides zero runtime persistence guarantees.


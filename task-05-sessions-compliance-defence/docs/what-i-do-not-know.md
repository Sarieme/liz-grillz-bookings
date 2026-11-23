# Self-Diagnostic Register: What I Do Not Know

## 1. Overview
Engineering maturity requires the ability to locate the boundaries of one's own technical knowledge. Feigning complete omniscience creates severe production liabilities, whereas clearly identifying gaps allows targeted research, architectural verification, and defensible viva interview performance. This document logs eight specific technical areas in the Liz's Grillz Bookings architecture where my operational understanding is incomplete, how I know I do not understand them, and what concrete technical research is required to master them.

---

## 2. Technical Ignorance Register

### Item 1: PostgreSQL Atomic Rollback Mechanics During Half-Failed Prisma Migrations
- **What It Is**: The internal behavior of PostgreSQL DDL transactions when a forward migration fails midway through execution (e.g. creating two tables successfully before failing on a malformed foreign key constraint).
- **How I Know I Do Not Understand It**: While I know PostgreSQL supports transactional DDL (`CREATE TABLE`, `ALTER TABLE` inside `BEGIN ... COMMIT`), I do not know how Prisma Migrate reconciles its internal `_prisma_migrations` tracking table when a migration script fails after executing non-transactional statements (such as `CREATE INDEX CONCURRENTLY` or `VACUUM`). I cannot predict from memory whether Prisma leaves the database in a dirty unrecoverable state requiring manual SQL patch intervention or whether the client can safely re-run the failed migration.
- **What I Need to Learn It**: Create an intentional failure script containing non-transactional PostgreSQL DDL statements in a test environment, execute `prisma migrate deploy`, inspect `_prisma_migrations.applied_steps_count`, and review the Prisma CLI source code for transactional wrapper fallbacks.

---

### Item 2: Distributed Sliding-Window Rate Limiting Under Multi-Region Container Autoscaling
- **What It Is**: Synchronizing sliding-window request timestamps across horizontally scaled Node.js containers distributed across multiple AWS Availability Zones.
- **How I Know I Do Not Understand It**: In Task Four and Five, I implemented an in-memory sliding window using a Node.js `Map` on the local process heap. I know that if our container scales from one replica to five behind an Application Load Balancer, each replica holds an isolated cache, multiplying the allowable burst limit by five. While I understand conceptually that Redis or Dragonfly can serve as a shared store, I do not know the precise network latency cost or race conditions when multiple nodes execute atomic Lua sliding-window scripts (`ZREMRANGEBYSCORE` and `ZCARD`) under 10,000 requests per second.
- **What I Need to Learn It**: Deploy a distributed Docker Compose cluster with 3 Next.js nodes and a Redis cluster, benchmark concurrent curl bursts using `autocannon` or `k6`, and evaluate Redis Cell generic cell rate algorithm (GCRA) modules.

---

### Item 3: Low-Level TLS Session Resumption & Browser Cookie Cryptographic Encryption
- **What It Is**: The exact cryptographic envelope and symmetric key exchange that occurs between the client browser and edge reverse proxy when an `HttpOnly; Secure` cookie traverses the network.
- **How I Know I Do Not Understand It**: I know that setting `Secure` ensures cookies travel over HTTPS, and `HttpOnly` blocks JavaScript access. However, I cannot explain from memory the precise byte structure of TLS 1.3 session tickets, how TLS session resumption (0-RTT) interacts with replay attacks against session cookies, or how underlying browser storage engines (such as Chrome's SQLite cookie database) encrypt cookie strings on disk using Windows DPAPI or macOS Keychain.
- **What I Need to Learn It**: Inspect raw TLS handshakes using Wireshark, analyze RFC 8446 (The Transport Layer Security Protocol Version 1.3), and review Chromium's `crypto::OSCrypt` source code.

---

### Item 4: Job Scheduler Recovery Protocols Following Severe Worker Infrastructure Outages
- **What It Is**: How an automated scheduled task system (such as our NDPA 7-day hard deletion purge) recovers missed execution windows when the host container was crashed or offline at the exact scheduled firing interval.
- **How I Know I Do Not Understand It**: Our scheduled job `runScheduledHardDeletionJob()` runs safely when invoked. However, in our current architecture, if the Node.js process crashes at 01:59 and restarts at 03:00, any cron trigger scheduled for 02:00 is silently dropped. I do not know whether enterprise queue engines (such as BullMQ or AWS EventBridge) record missed triggers ("misfire instructions") or how to guarantee that a missed deletion job executes immediately upon reboot without human intervention.
- **What I Need to Learn It**: Study BullMQ repeatable job mechanics, configure Redis-backed job schedulers with missed-window catchup semantics, and simulate power failures during scheduled window boundaries.

---

### Item 5: Conflict of Laws: NDPA Section 34 vs US CLOUD Act Subpoenas on Multi-Cloud Backups
- **What It Is**: The legal enforceability of a Nigerian citizen's Right to Erasure when backup snapshots are stored in cloud infrastructure owned by an American entity (e.g. AWS S3 Cape Town peering).
- **How I Know I Do Not Understand It**: In our retention matrix, I established that FIRS tax obligations supersede NDPA deletion for financial ledgers. However, I do not know how international courts resolve conflicts where an American federal subpoena under the US CLOUD Act demands access to foreign cloud backups that Nigerian law mandates must be destroyed or anonymized. I would not know how to advise a client if a foreign jurisdiction orders the retention of records that local privacy regulators demand must be purged.
- **What I Need to Learn It**: Consult legal treatises on cross-border data sovereignty, read the Nigerian Data Protection Commission (NDPC) Guidance Notes on Cross-Border Data Transfers, and analyze US CLOUD Act jurisdictional precedents.

---

### Item 6: Database Lock Contention on High-Concurrency Event Date Capacity Reservations
- **What It Is**: PostgreSQL row-level vs table-level locking dynamics when hundreds of concurrent organizers attempt to book the same Saturday wedding slot simultaneously.
- **How I Know I Do Not Understand It**: Our booking validation checks kitchen capacity using standard Prisma queries (`findMany` followed by `create`). I know this pattern suffers from a race condition (Time-of-Check to Time-of-Use): two concurrent requests can both see available capacity and both execute insert statements, overbooking the date. While I know `SELECT FOR UPDATE` or serializable isolation levels exist, I do not know the exact performance penalty or deadlock risk when high-concurrency write locks lock entire tables in PostgreSQL 18.
- **What I Need to Learn It**: Author high-concurrency race condition scripts using PostgreSQL advisory locks and pessimistic row locking (`tx.$queryRaw` with `FOR UPDATE`), and measure throughput degradation using pgbench.

---

### Item 7: Microarchitectural Timing Attacks on Constant-Time String Hash Comparison in V8
- **What It Is**: Sub-nanosecond CPU instruction execution variance when comparing cryptographic hashes using standard string equality (`===`) vs constant-time comparison buffers.
- **How I Know I Do Not Understand It**: In our verification routes, we compare `hashedInput === verification.codeHash`. While both strings are fixed-length 64-character hexadecimal SHA-256 digests, standard JavaScript string comparison exits on the first byte mismatch. I do not know whether the Node.js V8 JIT compiler optimizes string comparison in a manner that leaks measurable microarchitectural cache timing over a local network, or whether `crypto.timingSafeEqual()` is strictly mandatory for server-side hash verification.
- **What I Need to Learn It**: Conduct high-resolution CPU cycle timing tests using `process.hrtime.bigint()` comparing `crypto.timingSafeEqual(bufA, bufB)` against native JavaScript `===`, and study V8 compiler deoptimization internals.

---

### Item 8: Vector Quantization & Recall Degradation in pgvector vs Dedicated Vector Databases
- **What It Is**: The mathematical accuracy trade-offs of storing knowledge embeddings in PostgreSQL using `pgvector` with HNSW indexes versus dedicated vector engines (such as Pinecone or Milvus).
- **How I Know I Do Not Understand It**: Our schema includes a `RetrievalChunk` model for catering menu knowledge retrieval (RAG). I understand that cosine distance calculates vector similarity. However, I do not understand the internal mechanics of Inverted File Flat (IVFFlat) vs Hierarchical Navigable Small World (HNSW) indexing, how scalar quantization degrades vector recall percentage, or at what dataset scale (10,000 vs 1,000,000 chunks) PostgreSQL memory consumption forces a migration to dedicated vector databases.
- **What I Need to Learn It**: Index 100,000 sample catering knowledge vectors in pgvector, benchmark recall vs query latency across different `m` and `ef_construction` hyperparameters, and evaluate memory residency footprints.

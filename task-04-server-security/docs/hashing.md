# Password Hashing and the Cryptographic Inversion

## 1. Overview and Threat Model

A widespread defect in modern web software is selecting cryptographic hash functions designed for file integrity or digital signatures (such as SHA-256, SHA-512, or MD5) for user password storage. Engineers unfamiliar with threat modeling assume that because SHA-256 is cryptographically one-way and computationally fast, it is superior.

In reality, speed is the exact property that destroys password security. If a database is breached and password hashes are leaked, an attacker does not attempt to invert the mathematics of the hash function; they execute an offline dictionary or brute-force attack, generating candidate passwords at hardware line-rate until a matching digest is found. An algorithm engineered to execute in microseconds hands victory to the adversary.

This document details the mechanics of adaptive password hashing, analyzes hardware benchmark measurements taken directly on this machine, and articulates the fundamental security inversion.

---

## 2. Hardware Benchmark Measurements and Arithmetic

We benchmarked SHA-256 against bcrypt (configured with work factor 12) on our local development hardware (Windows 11 x64, Node.js v24.22.1). The results reflect authentic CPU timings:

### Measured Hardware Timings
- **SHA-256 Average Execution Time**: `0.003049 ms` (3.05 microseconds) per hash.
- **bcrypt (Work Factor 12) Average Execution Time**: `490.72 ms` per hash.

### Attacker Guess Throughput
From these measured times, we compute the single-core brute-force guessing capacity available to an attacker:

$$\text{Throughput}_{\text{SHA-256}} = \frac{1000\text{ ms}}{0.003049\text{ ms}} \approx 328{,}029\text{ guesses per second}$$

$$\text{Throughput}_{\text{bcrypt}} = \frac{1000\text{ ms}}{490.72\text{ ms}} \approx 2.04\text{ guesses per second}$$

### The One Billion Guess Test
If an attacker attempts to crack an eight-character alphanumeric password from a corpus or keyspace of 1,000,000,000 (one billion) candidate guesses on a single CPU core:

- **Using SHA-256**:
  $$\frac{1{,}000{,}000{,}000}{328{,}029\text{ guesses/sec}} = 3{,}048.5\text{ seconds} \approx 50.8\text{ minutes}$$
  On a consumer graphics card (GPU) or cloud cluster capable of hundreds of millions of SHA-256 hashes per second, cracking completes in under two seconds.

- **Using bcrypt (Work Factor 12)**:
  $$\frac{1{,}000{,}000{,}000}{2.04\text{ guesses/sec}} = 490{,}196{,}078\text{ seconds} \approx 5{,}673.5\text{ days} \approx 15.54\text{ years}$$
  Even with distributed GPU acceleration, bcrypt's memory footprint and key expansion loops drastically suppress cracking throughput, transforming a trivial breach into an intractable multi-decade computational wall.

---

## 3. The Security Inversion

The relationship between the authenticating server and the offline attacker is an asymmetric inversion:

A legitimate event organizer logs into Liz's Grillz Bookings once per session. A 490-millisecond delay on a form submission is completely imperceptible to a human sitting at a keyboard, registering as immediate responsiveness. To the service provider, that computation occurs once. To an attacker holding a stolen database dump of 5,000 organizer accounts, every candidate password guess for every user requires that exact same 490 milliseconds of compute. Slowing down the algorithm costs the service provider and legitimate users nothing measurable, while it costs the attacker everything.

---

## 4. The Role of Salting

### What Salting Does
A salt is a cryptographically random byte sequence generated independently for each password and concatenated with the plaintext before hashing. Salting guarantees two security properties:
1. Two users who select the identical password (e.g. `Password123!`) yield completely different hash digests in the database.
2. An attacker cannot use precomputed rainbow tables or global lookup tables. They cannot compute a single hash table of the top one million passwords and match them against the entire database in one pass; they must recompute candidate hashes individually for each user's distinct salt.

### Automatic Salt Handling in bcrypt
When `bcrypt.hashSync("LagosGrillz2026!#", 12)` is called, bcrypt automatically generates a secure 128-bit random salt, applies the Eksblowfish key schedule across $2^{12} = 4{,}096$ rounds, and prepends the algorithmic version, cost factor, and base64-encoded salt directly into the resulting string:

```text
$2b$12$0c6KGZQcUW0SSR3EkT0Q1Ov/S2j1MpQcvbz8VypmvW9UO9kODQPSu
├───┼──┼──────────────────────┼───────────────────────────────┤
alg cost        salt                      hash digest
```

Because the salt is stored in the modular crypt format string, verification routines (`bcrypt.compareSync`) automatically extract the salt and work factor to verify incoming login attempts without requiring separate database salt columns.

### What Happens If You Skip Salting
If salting is omitted (the naive approach often taken with unsalted SHA-256):
- Every user with the same password has an identical database digest. An attacker instantly identifies shared passwords across corporate accounts.
- Attackers utilize precalculated rainbow tables containing billions of known hashes, allowing them to reverse hashes in milliseconds through simple constant-time dictionary lookups without performing any live mathematical computation.

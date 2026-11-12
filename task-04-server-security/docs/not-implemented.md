# Architectural Decisions: What Was Decided Not To Do

## 1. Overview
Engineering security requires balancing threat modeling against operational complexity, latency overhead, and product velocity. Liz's Grillz Bookings evaluated several advanced enterprise security controls during the Task Four server security cycle and deliberately deferred them. This document details four deferred controls, the rationale for deferral, and the specific production triggers that will mandate their implementation.

---

## 2. Deferred Controls Register

### 2.1 Distributed Redis-Backed Sliding Window Rate Limiting
- **Considered Control**: Replacing the in-memory Node.js sliding-window cache with a centralized Redis / Dragonfly cluster using Redis Cell or Lua atomic sliding-window scripts.
- **Why Deferred**: Liz's Grillz currently operates as a single-instance container on railway or containerized Node.js runtime. Introducing an external managed Redis cluster increases infrastructure hosting costs by approximately 30 USD monthly and introduces a new network round-trip latency (15 to 45 ms per HTTP request) across container boundaries. The in-memory Map structure provides microsecond latency (0.003 ms) and is sufficient while running a single active process.
- **Implementation Trigger**: Transitioning the Next.js deployment to a multi-instance autoscaling cluster (e.g. AWS ECS Fargate or Kubernetes with 2 or more replicas), or when server process restarts cause user lockout states to reset prematurely under active credential stuffing attacks.

---

### 2.2 FIDO2 / WebAuthn Hardware Passkeys
- **Considered Control**: Replacing or supplementing password authentication with biometric passkeys (TouchID, FaceID, Windows Hello, and YubiKeys) via the WebAuthn standard.
- **Why Deferred**: Field research across Lagos event organizers indicates that catering reservations are frequently delegated to executive assistants, wedding coordinators, and corporate procurement staff sharing office desktop machines running legacy Windows or Android devices without registered biometric credentials. Requiring WebAuthn or passkey registration created severe customer onboarding drop-off during user trials. Bcrypt password hashing (cost 12) combined with mandatory 6-digit email verification provides high security while preserving universal device access.
- **Implementation Trigger**: When corporate enterprise accounts exceed 25% of active monthly GMV and corporate procurement teams demand SOC 2 Type II compliance or SAML SSO / Passkey enforcement for invoice approvals over 5,000,000 NGN.

---

### 2.3 Database Field-Level Envelope Encryption with Cloud KMS
- **Considered Control**: Encrypting sensitive customer columns (such as organizer phone numbers, guest dietary records, and delivery venue addresses) inside PostgreSQL using AES-256-GCM application-level envelope encryption with keys managed in AWS KMS or Google Cloud KMS.
- **Why Deferred**: Liz's Grillz already enforces full database volume encryption at rest (AES-256) via cloud storage and TLS 1.3 encryption in transit. Application-level envelope encryption disables partial string searching (such as searching bookings by phone number substring) and complicates PostgreSQL SQL indexing, requiring blind indexing strategies. For our current volume of event catering bookings, storage-level encryption combined with strict role-based PostgreSQL access satisfies NDPA (Nigerian Data Protection Act) requirements.
- **Implementation Trigger**: The storage of sensitive personal identification numbers (e.g. National Identity Numbers - NIN) or direct credit card PAN data, or when Liz's Grillz expands to cater government state banquets requiring ISO 27001 data classification audits.

---

### 2.4 Cloudflare Turnstile / Proof-of-Work CAPTCHA at Registration
- **Considered Control**: Embedding an interactive or invisible bot challenge widget (such as Cloudflare Turnstile) on the registration and login forms to block automated headless browsers.
- **Why Deferred**: Modern bot challenges degrade user experience on unstable 3G/4G connections commonly encountered in busy Lagos event venues. Turnstile also introduces external third-party JavaScript dependencies that violate strict Content Security Policies and leak visitor IP metadata to third-party ad networks. Our combination of sliding-window rate limiting, breached password rejection, and asynchronous verification code delivery halts credential stuffing without introducing user UX friction.
- **Implementation Trigger**: When registration abuse logs indicate coordinated residential proxy bot networks bypassing our rate limiter at rates exceeding 50 bot registrations per hour, resulting in elevated SMTP delivery costs.


# Rate Limiting Architecture and Its Practical Limits

## 1. Overview and Threat Model

Rate limiting is an essential perimeter defense designed to protect web applications against automated credential stuffing, brute-force password guessing, and distributed denial-of-service (DDoS) traffic. By bounding the number of requests a client can execute within a fixed or sliding time window, the system caps an attacker's guessing velocity to a negligible rate.

For Liz's Grillz Bookings, we established an authentication threshold of five requests per fifteen-minute sliding window on login and registration endpoints. When exceeded, the server halts execution and returns `HTTP 429 Too Many Requests` accompanied by standard RFC `Retry-After` headers.

However, treating IP-based rate limiting as a complete defense is an architectural fallacy. In Step 8, we demonstrated how an adversary rotating IP addresses completely defeated the lockout in milliseconds. This document analyzes why IP-based limiting alone is insufficient, how production systems construct composite keys, the storage trade-offs between local memory and distributed caches, and the collateral damage inflicted on shared commercial networks.

---

## 2. Why IP Alone is Insufficient

Relying exclusively on the client's IP address (`request.socket.remoteAddress` or `X-Forwarded-For`) fails against realistic threat models for three technical reasons:

1. **Trivial Egress IP Rotation (Residential & Mobile Proxies)**:
   - Attackers do not attack from a single fixed IP address. Modern botnets and credential-stuffing tools route traffic through residential proxy networks or mobile 4G/5G gateways (such as rotating IPs across Nigerian telcos like MTN, Airtel, and Glo). Because mobile network carriers dynamically assign IP addresses from shared carrier-grade NAT pools, an attacker can obtain a fresh public IP address on every single request, completely bypassing an IP-bound counter.
2. **Reverse Proxy Header Spoofing**:
   - Applications that naively trust unvetted incoming `X-Forwarded-For` or `Client-IP` headers allow attackers to inject arbitrary spoofed IP strings directly from curl, resetting their counter on demand unless strict proxy trust boundaries are enforced.
3. **Cloud Lambda and Tor Egress Multiplexing**:
   - Attackers distributing requests across cloud serverless workers (AWS Lambda, Google Cloud Run) or Tor exit nodes present thousands of unique origin addresses, dividing their attack volume across millions of distinct buckets.

---

## 3. What Serious Applications Key On

To mitigate IP rotation, enterprise authentication systems construct multi-tiered and composite identifier keys:

1. **Composite Keys (IP + Normalized Email)**:
   - Instead of rate limiting the IP alone, the system keys on `login_${normalizedEmail}` concurrently with `ip_${clientIp}`. If an attacker rotates across 10,000 unique IP addresses to target a single executive account (`amaka.okonkwo@enterprise.ng`), the target email's specific attempt bucket fills after 5 attempts and locks that specific account from further password attempts regardless of source IP.
2. **Global Account Velocity Quotas**:
   - A threshold applied to the user account itself (e.g., maximum 10 failed login attempts across the entire application within an hour before enforcing mandatory email PIN recovery).
3. **Hardware and Browser Fingerprinting**:
   - Collecting high-entropy browser signals (Canvas rendering hashes, AudioContext fingerprints, WebGL renderer strings, screen resolutions, and TLS ClientHello JA3/JA4 fingerprints) allows security engines to track the same physical client machine across changing IP addresses.
4. **Behavioral Proof-of-Work**:
   - Requiring a cryptographic client-side puzzle (such as proof-of-work hash computations) once suspicious request velocity is detected, forcing the attacker's hardware to burn CPU cycles before each request.

---

## 4. Counter Storage Architecture and Trade-offs

The choice of where rate limit counters reside represents an important trade-off between architectural simplicity and distributed accuracy:

### In-Memory Counters (`Map<string, RateLimitRecord>`)
- **How it works**: Counters are stored directly in Node.js process heap memory.
- **Advantages**: Sub-microsecond read and write latency (0.001 ms); zero external network hops; requires no infrastructure setup or extra monthly hosting costs.
- **Disadvantages**:
  1. **Multi-Instance Leakage**: In containerized or serverless deployments (Docker, Kubernetes, Vercel, AWS ECS), requests round-robin across multiple server instances. An attacker facing five container replicas effectively receives 25 allowed attempts instead of 5 because each container maintains an isolated memory map.
  2. **Process Volatility**: Restarting the application, deploying a code update, or worker recycling erases all active rate limit records, instantly clearing all lockouts.

### Distributed Shared Store (Redis / Dragonfly)
- **How it works**: A centralized, in-memory key-value cache shared by all application web workers.
- **Advantages**: Global state consistency across thousands of serverless workers; atomic sliding-window operations using Redis `ZADD` and `ZRANGEBYSCORE`; persistence survivable across application container restarts.
- **Disadvantages**: Introduces external network round-trip latency (typically 1 to 5 ms per request); creates an additional infrastructure dependency that requires high-availability clustering and failover handling.

---

## 5. Collateral Damage on Shared Connections

The most severe operational cost of aggressive IP rate limiting is the collateral damage inflicted on legitimate users sharing a single public IP address.

In commercial environments in Lagos, such as shared corporate business hubs, co-working spaces, and university campuses, hundreds of employees and students access the internet through a single corporate NAT router or VSAT gateway. All outbound traffic shares one single public IPv4 address.

If one corporate employee mistypes their catering portal password five times:
- An IP-only rate limiter locks that entire public IP for fifteen minutes.
- Every other legitimate employee in that office building attempting to log in, review an invoice, or approve an event booking is immediately hit with `HTTP 429 Too Many Requests` and locked out, despite having done nothing wrong.

This friction is why serious platforms combine rate limiting with adaptive friction (such as CAPTCHA challenges or temporary email one-time codes) rather than blunt binary IP lockouts.


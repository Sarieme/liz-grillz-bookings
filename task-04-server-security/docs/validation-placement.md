# Boundary Validation Placement and Request Lifecycle Architecture

## 1. Overview

In web applications, input validation is frequently treated as an afterthought scattered throughout business logic. Developers inspect variables deep inside service layers, execute manual string checks inside route handlers, or rely on client-side form controls to filter malicious input.

Task Three demonstrated the immediate failure of this model: when an attacker bypasses the frontend form using a direct command-line HTTP client, client-side checks evaporate. In Task Four, we established strict boundary validation using Zod schemas.

This document defines the architecture of server-side validation placement, specifies the precise pipeline ordering of the HTTP request lifecycle, and analyzes why hand-rolled imperative validation is demonstrably inferior to declarative schema boundary gates.

---

## 2. Request Lifecycle: Where Validation Sits

In a resilient web architecture, an incoming network request traverses distinct structural layers before reaching business services or database persistence. Schema validation is positioned at the perimeter boundary:

```text
[Incoming Network Packet]
          │
          ▼
1. TLS Termination & Decryption (HTTPS Layer)
          │
          ▼
2. HTTP Host / Header & Method Inspection
          │
          ▼
3. Rate Limiting & Denial-of-Service Filtering (IP / Token Check)
          │
          ▼
4. Body Deserialization & Payload Size Capping (JSON.parse)
          │
          ▼
════════════════════════════════════════════════════════════════════
5. BOUNDARY SCHEMA VALIDATION (Zod safeParse) <── THE GATEKEEPER
════════════════════════════════════════════════════════════════════
          │
    ┌─────┴────────────────────────────────┐
    │                                      │
[Valid Payload]                    [Schema Violation]
    │                                      │
    ▼                                      ▼
6. Business Logic Authorization    Immediate 400 Bad Request
    │                              (Halts execution; 0 DB queries)
    ▼
7. Cryptographic Operations (Hashing)
    │
    ▼
8. Database Persistence (Prisma ORM)
```

---

## 3. What Runs Before Validation

Only operations strictly necessary to decode, transport, and rate-protect the request are permitted to execute prior to schema validation:

1. **TLS / Network Handshake**: Transport Layer Security terminates at the ingress load balancer or reverse proxy to decrypt network packets.
2. **Payload Size Limits**: Middleware checks `Content-Length` and enforces hard byte limits (e.g., maximum 100KB for booking requests) to protect against buffer overflows and memory exhaustion before allocating heap space.
3. **Network Rate Limiting**: Request origin tokens and IP addresses are checked against rate limit counters. If a client is flooding the server with thousands of requests per second, the request is terminated with `HTTP 429 Too Many Requests` before the CPU wastes cycles parsing complex JSON trees.
4. **JSON Body Deserialization**: The raw HTTP stream is parsed into memory as an untyped JSON object.

---

## 4. What Must NEVER Run Before Validation

Executing expensive or stateful operations prior to boundary validation introduces critical vulnerabilities, including Denial of Service (DoS) and data corruption:

1. **Database Queries and Lookups**:
   - Never query PostgreSQL before validating the shape of the request. If an endpoint queries `prisma.booking.findMany()` or checks user records using unvalidated input, an attacker can dispatch malformed SQL injection vectors, trigger full table scans, or exhaust database connection pools.
2. **Cryptographic Operations (Password Hashing)**:
   - Password hashing algorithms such as bcrypt or Argon2id are intentionally slow (measured at ~490 milliseconds on our CPU). If hashing runs before verifying that the email, name, and phone match valid schemas, an attacker can dispatch millions of invalid registration payloads, pegging server CPU at 100% and completely freezing the application for legitimate users.
3. **External API or Third-Party Network Calls**:
   - Calling payment gateways (Paystack/Flutterwave) or sending verification emails via SMTP before input validation wastes external API quotas and ties up thread workers waiting for external socket responses.
4. **Session Creation or State Mutation**:
   - Application state must never mutate based on unvalidated data.

---

## 5. Why Hand-Rolled Route Checks Are Inferior to Schemas

Many developers avoid validation libraries and instead write manual conditional statements inside route handlers:

```typescript
// Antipattern: Hand-rolled imperative checking
if (!body.clientName || body.clientName.length < 5) {
  return res.status(400).send("Bad name");
}
if (!body.phone) {
  return res.status(400).send("Bad phone");
}
```

While hand-rolled checks appear simpler initially, they fail in production for four fundamental reasons:

1. **Incomplete Coverage and Semantic Blind Spots**:
   - Manual checks typically verify existence (`if (!clientName)`) but overlook type coercion, unexpected whitespace, array injections (`clientName: ["A", "B"]`), floating-point anomalies in integers, or Unicode exploits. Declarative schemas enforce exact structural boundaries across primitive types, character bounds, and regex shapes simultaneously.
2. **Lack of Type Stripping (Excess Property Injection)**:
   - In manual route checking, the original untyped `body` object remains accessible throughout the function. If an attacker passes unexpected properties (such as `{ isAdmin: true }` or `{ balance: 999999 }`), an unvetted spread operator (`...body`) can pass malicious properties directly into Prisma. A schema parses and strips unknown properties, returning a strictly sanitized, type-safe data transfer object.
3. **Inconsistent and Unmaintainable Error Messaging**:
   - Hand-rolled checks fail on the first error they encounter, forcing users into a frustrating game of whack-a-mole where they fix one error only to discover another upon resubmitting. Schema engines like Zod evaluate the entire payload holistically, returning an aggregated list of all field violations in one pass.
4. **Static Type Inference**:
   - Zod automatically infers TypeScript types directly from the schema (`z.infer<typeof bookingSchema>`). This guarantees that runtime validation rules and compile-time TypeScript types remain in lockstep, eliminating manual interface duplication and synchronization drift.


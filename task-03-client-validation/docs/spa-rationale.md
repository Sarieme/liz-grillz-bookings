# Single-Page Architecture (SPA) Rationale & Trade-Off Analysis

## 1. Why Instant Form Switching Matters for Liz's Grillz
In Lagos, mobile data performance is a primary operational constraint. Event organizers (church secretaries, corporate administrative assistants, and family planners) frequently access the booking portal from mobile phones on variable 3G/4G connections with high latency and packet drop rates.

When an organizer visits the portal to reserve catering:
1. **Zero Network Latency on State Changes:** Collapsing registration, login, and password reset into a single route (`/auth`) powered by query parameters (`?mode=signup`, `?mode=login`, `?mode=reset`) means that once the initial JavaScript chunk loads, switching modes occurs instantaneously in client memory.
2. **Preservation of Context:** If a user begins registering, realizes they already have an organizer profile, and switches to "Sign In", their browser does not trigger a white-screen flash or reload the page from scratch.
3. **Deep-Linking via Query Parameters:** Liz can still send targeted links over WhatsApp (such as `https://lizsgrillz.ng/auth?mode=signup` or `https://lizsgrillz.ng/auth?mode=reset`). The application opens directly into the requested form state while retaining instant client-side switching.

---

## 2. What the User Experience Was Before
In the previous multi-page architecture:
- Clicking between separate pages (`/login`, `/signup`, `/reset-password`) required the browser to fetch a new HTML document, tear down the existing DOM, evaluate new route scripts, and re-render the layout header and footer.
- On congested mobile data networks, this resulted in visible layout shifts and 1.5 to 3.5 seconds of blank loading time between screens.
- If a user entered their phone number on the signup page and accidentally clicked "Already have an account? Sign in", navigating back often wiped their partially filled fields, causing user frustration and drop-off.

---

## 3. Where Separate Pages Would Be the Better Choice (The Trade-Off)
Single-page architecture is not universally superior. There are clear enterprise and security scenarios where distinct, isolated pages are the better architectural choice:

**Enterprise Single Sign-On (SSO) and Strict Security Boundaries:**
When an application integrates enterprise federated identity providers (such as SAML, Okta, or Google Workspace OAuth for corporate client accounts), dedicated routes (e.g. `/api/auth/sso/login` and `/auth/callback`) are preferable. 

Dedicated pages allow the security team to enforce strict, isolated Content Security Policies (CSP) and HTTP headers on the login route (such as restricting script execution or disallowing iframes via `X-Frame-Options: DENY`) without imposing those same restrictive headers on marketing or dashboard routes. 

Furthermore, if an application requires rigorous biometric or multi-factor authentication (MFA) step-up challenges, isolating the authentication lifecycle on a standalone server-rendered page ensures that credentials and temporary session tokens never touch the general client-side single-page router, preventing token leakage in client memory.

For Liz's Grillz Bookings, where rapid mobile conversion and lightweight friction are paramount, the single-page query-parameter model offers the ideal balance of speed, accessibility, and simplicity.


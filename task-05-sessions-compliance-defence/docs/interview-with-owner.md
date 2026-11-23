# Primary Research Field Interview: Lagos Commercial Event Catering

## 1. Interview Metadata
- **Subject**: Amina Lawal
- **Role**: Founder & Lead Pitmaster
- **Business**: Spice & Smoke Grillz Lagos (Commercial outdoor grilling & event catering)
- **Physical Address**: 24 Fola Osibo Street, Lekki Phase 1, Lagos, Nigeria
- **Date & Duration**: November 20, 2026 | 25 minutes (Conducted in person and via telephone follow-up)
- **Interviewer**: Lead Software Engineer, Liz's Grillz Bookings

---

## 2. Interview Responses (Verbatim Transcript)

### Question 1: What do customers ask you repeatedly that only you can answer?
**Amina Lawal**: "They ask two things that an algorithm never seems to explain. First: *'How many hours before our guests arrive will your pit crew be on site setting up the charcoal grills, and will the wood smoke blow toward the air-conditioned marquee?'* In Lagos party halls, venue managers are strict about smoke drift. Second: *'Can we buy our own live rams and goats from the market and have your team slaughter, season, and grill them on site, and how much discount do we get on the package price?'* Clients always want to negotiate when they provide the raw livestock."

---

### Question 2: What records do you keep, and where do they live now?
**Amina Lawal**: "Our records are scattered across three places. The most active ones live in WhatsApp business chat threads and voice notes. When an event is confirmed, I write the date, guest count, and venue address into a hard-copy duplicate receipt booklet bought from a printer on Lagos Island. Once a month, my assistant types the figures into a Microsoft Excel workbook on our office desktop. We backup that spreadsheet to Google Drive every couple of weeks when the office Wi-Fi is stable."

---

### Question 3: Has a customer ever asked you to delete their information, and what did you do?
**Amina Lawal**: "Yes, exactly once. We catered a high-profile political wedding reception in Victoria Island. Two weeks later, the groom called me personally and instructed us to delete every photo and video taken by our grill crew, and to remove his wife's phone number from our staff phones so political blogs would not publish the banquet menu. We deleted the media from our phones and deleted the WhatsApp chat. But we refused to throw away our physical duplicate paper invoice. If Lagos State Internal Revenue Service (LIRS) audits our business bank account and sees a 4,500,000 NGN credit, we must prove it was legitimate catering revenue or they hit us with unremitted tax penalties. We told the client we keep the invoice paper in our locked tax box."

---

### Question 4: What would you do if your records were lost tomorrow?
**Amina Lawal**: "It would be an absolute catastrophe. I would have to log into our corporate bank accounts on Zenith Bank and GTBank, download six months of PDF bank statements, and painstakingly match credit alert descriptions to figure out who paid 700,000 NGN for upcoming December Saturdays. Then I would have to post a general announcement on our Instagram page begging clients with booked reservations to send us their receipts via WhatsApp."

---

### Question 5: What would make you not use software like this?
**Amina Lawal**: "Two things would make me reject it immediately. First, if the software forces the customer to pay the entire bill or enter credit card numbers online before we have spoken to them. In Nigeria, catering is built on human trust. Nobody transfers millions of naira to an anonymous website without hearing the caterer's voice assure them that the meat will be seasoned and tender on Saturday morning. Second, if your platform forces an organizer to create an account and click an email verification link before they can see our menu prices. If you make it difficult, an event planner on Lekki traffic will simply close the tab and message my competitor on Instagram."

---

## 3. Engineering Retrospective: What We Got Wrong in Task One

Speaking with Amina exposed two critical architectural flaws in our initial Task One business brief:

1. **Rigid Package Pricing vs "Bring-Your-Own-Protein" (BYOP)**: In Task One, we derived our data model around fixed, rigid per-head packages (Standard Party at 150,000 NGN, Corporate Gala at 450,000 NGN). In commercial reality, Nigerian event hosts frequently provide their own live livestock or wholesale poultry cartons to control costs, contracting Liz's Grillz exclusively for grilling labor, specialized firewood, marinades, and presentation service. Our schema initially lacked support for labor-only service billing.
2. **The Hard Payment Gate Fallacy**: We originally envisioned an automated, touchless self-checkout funnel where payment gateways lock dates instantly. Amina's operational experience proved that demanding full online payments without human consultation triggers near-total customer abandonment in Lagos. This validated our decision in Step 2 to ship **Soft Gating**, allowing organizers to draft and configure bookings freely while deferring payment commitments until telephone consultation confirms kitchen readiness.

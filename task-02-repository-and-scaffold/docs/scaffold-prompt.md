1. You are setting up the foundation of Liz's Grillz Bookings, a catering booking app. Work inside task-02-repository-and-scaffold/ in this repository. Scaffold in place. Do not create a nested project folder.

STEP 1: READ (no code yet)
Find and read every file in this repository before writing anything. This includes the business brief, every design system file (tokens JSON, CSS variables, type scale, colour roles, shadows, divergences) and any other context files. List every file you read, with its path.

STEP 2: SUMMARISE, THEN STOP
Summarise in plain language:
- the business, the user, the one thing that must work, and the feel it should have
- which colour roles, type styles and shadows exist in the design system, by their exact names as they appear in the files
- anything the design system does not define that this screen would need
- every assumption you are making (if you have none, say so and say how you checked)
- the stack you propose, with one reason per choice, and confirmation that it adds nothing that carries its own styling
Then stop and wait for my approval. Write no code and run no commands until I say go.

SOURCE OF TRUTH
- The files I gave you are the only source of truth. If two files disagree, or anything is missing or unclear, ask me. Do not assume or invent.
- Do nothing that contradicts the design system. Where the design system is silent, ask me instead of choosing something.
- The design system files are read-only. Do not edit, rename, move or copy them, and do not re-create or duplicate any token. Reference the existing ones.

STYLING RULES
- Style only with the design system. No hardcoded colour, font, size, spacing, radius or shadow values.
- Use colour roles only, never palette values or raw hex codes.
- No CSS frameworks, UI libraries, icon packs, fonts, images or default browser styling that the design system does not define.
- No placeholder or lorem ipsum text, and no invented content.

BUILD (after approval, foundation only)
- Project setup and folder structure
- A base layout
- One home screen: minimalistic, full viewport height (100vh). Show the business name as the main heading, one short line, and one button. Use only wording I approve.
- Use semantic HTML (real headings, real buttons, landmarks).
- 100vh can be taller than the visible screen on phones because of the browser address bar. Do not decide how to handle that yourself. Tell me about it and ask.
- Do not build any other screen or feature. Do not claim in the page that any feature exists (no capacity checking, payments or confirmations).

SAFETY
- Do not commit, push, run migrations, or install anything outside the stack I approve.
- Do not create .env files with real values, and put no secret in any file. Make sure .gitignore excludes .env files.

AFTER BUILDING
1. List every file you created.
2. List every assumption you made.
3. Audit your work against this prompt, rule by rule, and say where you fell short.
4. Quote the exact token names you used for colour and typography, and for each one say which element uses it.




2. create an implementation plan that would resolves all fixes in the existing context structure without breaking the business brief and design system. then draw up an implementation plan for scaffolding the app based on all you now know 
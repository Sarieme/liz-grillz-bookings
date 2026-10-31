# Task 1: Design system for Liz's Grillz Bookings

## What this task was
Build a design system in Figma, get it into code as tokens, and then prove an AI agent actually used it rather than producing a generic page.

## The business
Liz's Grillz is a Lagos catering business serving individuals, churches and offices. Liz's Grillz Bookings is the app where clients check a date, pay a deposit and pay the balance. The interface needs to feel professional, warm and trusted. Full brief: `docs/business-brief.md`.

## What I built
- **Colour system.** Brand colour sampled from the orange ring of the Liz's Grillz logo #D75C19. White text on it measured 3.9:1, below the 4.5:1 WCAG AA standard, so I darkened it to #C2410C 5.2:1 and pinned it as primary 40 so the palette generated around it. Roles and every contrast ratio are in `docs/colour-roles.md`.
- **Type scale.** 15 styles across display, headline, title, body and label. Display large is 64px with a 96px line height multiplier 1.5. Every value is in `convert-tokens.js`.
- **Shadows.** Three shadows built from the primary colour, not black. See convert-tokens.js`.
- **Token pipeline.** Figma variables, exported as JSON, converted to CSS variables by an agent. The first export left out my colour variables, and I kept both files as `evidence/05` and `evidence/06`.
- **One screen.** A home page built with the agent using only my tokens, used to test whether the system was really consumed.

## Decisions I made
- **Darkened the logo orange** to pass contrast instead of using dark text on orange buttons. This keeps white button labels and costs some brand fidelity.
- **Roles, not palette values, on the interface.** The interface uses roles only, so one change at the source reaches everything that references them.

## How I checked the agent used the system
- **Raw colour search.** Command and full output in 'evidence/07-raw-value-search.txt'.
- **Asking the agent directly.** It said it used display small for the main heading. The code actually used the correct style, so the agent built correctly. Evidence in `evidence/08`.
- **Before and after.** `evidence/09` is the screen built without the system and `evidence/10` is the screen built with it.

## The deliberate regression
On a branch 'experiment-broken-token' I pointed the tagline at a raw hex value, then changed the brand colour at the source. The heading, button and price followed the new colour. The tagline stayed orange. The purple also changed the feel from festive to cold and corporate, the opposite of my brief. I deleted the branch without merging it. Evidence: 'evidence/11' and 'evidence/12', note in 'docs/regression-note.md'.

## What I got wrong
- My first token export omitted the colours, because I had not included the Figma variables. I noticed when i tried to confirm if it was exported correctly.

## Known defects
Full detail in `docs/defects.md`.
1. **Home page promises features that do not exist.** 'file- index.html, line-132, commit-9be1523'. It says visitors can check live kitchen capacity and pay a deposit instantly, but the page is static HTML with no server, database or payment gateway.

## Status
| Item | State |
|---|---|
| Business brief | Done |
| Colour, type and shadow system | Done |
| Token export and CSS conversion | Done |
| One screen built and checked | Done |
| Dark theme | Not tested |
| Automated sync from Figma to code | Not built; the export is manual |
| Interview answers | [Done|

## Folder guide
- 'docs/': written work (brief, type scale, colour roles, shadows, divergences, prompts, defects, interview answers, regression note)
- 'evidence/': screenshots and terminal output, numbered to match the task
# Model choices

## Which model for which job
I used Google Antigravity for the initial setup, scaffolding, and token work. Antigravity is slower because it reads every file first, plans its steps, and stops to ask for approval before it runs commands or writes code. That deliberate pace is what I needed for scaffolding. A mistake early on, like creating a nested folder or using hardcoded colors, would break the rules and cost marks.

For smaller, isolated tasks later on, like writing repetitive TypeScript interfaces or database seed scripts, a faster code-generation model makes more sense. Once the architecture and rules are already locked down, you do not need the model to pause and read the whole repository again.

## What I observed about the difference
The difference comes down to planning versus speed.

Antigravity takes longer on the first response. It reads the files, checks the paths, and thinks through the prompt before it touches anything. That feels slow while you wait, but it caught real problems: it caught that create-next-app would abort in a non-empty folder, fixed my import path for tokens.css, and made sure only semantic color roles were used.

Speed-focused models generate code right away. That looks impressive, but they tend to guess rather than read. When I let a faster model write code without constraints, it defaulted to standard Tailwind classes, reached for raw hex codes, and ignored my design system. Getting code fast does not help if you spend the next hour fixing things that broke your constraints.

## One task where I chose wrong and switched
When I first built the home screen, I wanted to see something working quickly, so I used Open Code. It gave me a complete page in seconds, but when I inspected the code, two things were wrong:

1. It hardcoded raw hex colors directly into the CSS instead of using my color roles.
2. It wrote copy claiming the app could check live kitchen capacity and take instant online deposits. Neither of those features existed yet, which was a real defect in my project.

The model had prioritized giving me a finished-looking screen over following my rules. I scrapped that code, switched back to Antigravity, and gave it strict instructions to read my brief and tokens first and wait for approval. Antigravity followed the system, kept the unbuilt feature claims out, and built the minimal foundation I actually asked for.


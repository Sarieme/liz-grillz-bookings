# Interview Defence: Technical Answers

---

### Question 1: What is the difference between Git Flow and trunk-based development, and why have a lot of teams moved toward trunk-based?
**Answer:** Git Flow uses long-lived branches (develop, release, feature, hotfix) where code sits unmerged for weeks before release. Trunk-based development has all engineers merge small, frequent commits into a single shared branch (main or trunk) multiple times a day, gated by automated tests and short-lived feature branches. Teams moved to trunk-based development because long-lived branches create merge hell, hide integration bugs until release week, and slow deployment velocity. In modern cloud environments with continuous deployment, merging daily keeps code continuously tested and deployable.

---

### Question 2: What does git push --force actually do, and why is --force-with-lease generally safer?
**Answer:** `git push --force` overwrites the remote branch ref with your local commit history regardless of what exists on the remote, permanently discarding any commits pushed by colleagues in the interim. `--force-with-lease` is safer because it checks whether your local tracking ref matches the actual remote ref before overwriting. If a colleague pushed new work while you were rebasing locally, `--force-with-lease` aborts the push, preventing accidental destruction of your team's code.

---

### Question 3: Why is rewriting history, through rebase, amend or force push, dangerous on a shared branch?
**Answer:** Rewriting history recalculates cryptographic commit hashes (SHA-1/SHA-256). When you rewrite history on a shared branch, colleagues whose local branches were based on the original commit hashes now have diverging histories. When they next pull or merge, Git sees duplicate conflicting commits, creating ghost code, repeated merge conflicts, and potential data loss. History rewriting should only ever happen on private, local feature branches before integration.

---

### Question 4: What is the difference between git merge and git rebase, and when would you actually pick one over the other?
**Answer:** `git merge` takes the commits from a feature branch and combines them into the target branch with a dedicated merge commit, preserving chronological history and branch context exactly as it happened. `git rebase` rewrites your branch by taking each local commit and replaying it on top of the target branch, creating a completely linear history without merge bubbles. You pick merge on public shared branches to preserve genuine history and auditability; you pick rebase on local private feature branches to clean up commits before opening a pull request.

---

### Question 5: What causes a merge conflict, and what is actually happening in the file when you see the conflict markers?
**Answer:** A merge conflict occurs when two branches make different, overlapping modifications to the exact same lines of a file, or when one branch modifies a file that another branch deleted, since the common ancestor commit. Git cannot guess which change is correct, so it halts the merge and inserts conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`). The section between `<<<<<<<` and `=======` shows the content in your current branch (`HEAD`), while the section between `=======` and `>>>>>>>` shows the incoming change. The developer must manually edit the text to keep the intended logic and remove the markers.

---

### Question 6: What is the difference between the working directory, the staging area and the repository?
**Answer:** The working directory is the actual file system on your computer where you write and edit source files. The staging area (or index) is a preparation buffer where you register specific modifications (`git add`) you intend to package into the next commit, allowing you to curate granular commits. The repository (`.git`) is the permanent database where committed snapshots are cryptographically sealed with metadata, timestamps, and commit hashes. Changes in the working directory can be lost with a single command, but committed snapshots in the repository are permanent.

---

### Question 7: What is branch protection, and what does it typically enforce?
**Answer:** Branch protection is a remote repository policy enforced by GitHub or GitLab to prevent damaging or untested code from entering critical branches such as `main`. It typically enforces: blocking direct pushes, requiring peer-reviewed pull requests before merging, mandating that automated continuous integration (CI) test suites pass, requiring linear history or rebase merges, and restricting administrative force-pushes or branch deletion.

---

### Question 8: Walk me through a technical project you built end to end.
**Answer:** In Liz's Grillz Bookings, I built a Lagos catering reservation system from design tokens to database persistence. I began by converting Figma design tokens into CSS variables via a vanilla Node compiler, enforcing strict WCAG AA contrast for brand orange (`#C2410C` at 5.2:1 against white). Next, I scaffolded a Next.js 16 Turbopack application with semantic HTML. I then configured a local PostgreSQL database with Prisma 6 ORM, built an interactive booking form that requires genuine HTTP 201 Created server responses, and verified the rejection of false success when database connections are severed.

---

### Question 9: Tell me about a time when something you built broke in production.
**Answer:** During server startup, the Next.js process crashed with `listen EADDRINUSE: address already in use :::3000`. An orphaned background Node process was secretly holding the TCP socket. Instead of guessing or restarting the entire machine, I diagnosed the issue systematically using `netstat -ano | findstr :3000` to find the exact process ID (28228), terminated it with `taskkill /PID 28228 /F`, and verified that the development server could bind cleanly on port 3000. In production container clusters, unreleased ports trigger crash loops, making systematic socket diagnosis essential.

---

### Question 10: How do you approach learning a new technical platform or codebase quickly when starting a new engagement?
**Answer:** I follow a four-step diagnostic approach: First, I read the package descriptors, build scripts, and environment variable templates to identify the tech stack and entry points. Second, I trace a single core transaction end-to-end, from the client UI click, through network routing, into database persistence. Third, I intentionally trigger a failure, such as cutting the database connection or entering bad data, to see how the system logs errors. Finally, I audit the Git commit history and open pull requests to understand team conventions, deployment pipelines, and known technical debt.

---

### Question 11: What is the difference between code that is correct and code that is complete?
**Answer:** Correct code satisfies functional logic for the happy path: given valid input, it produces the expected calculation or database row. Complete code accounts for the entire operational lifecycle: input validation, error handling, edge cases (such as special characters in database passwords), security controls, accessibility (semantic elements and contrast ratios), performance budgets, automated tests, and clear documentation. Correct code works in a demo; complete code survives unattended in production.

---

### Question 12: How do you design software for a customer who will need to maintain it after you are gone?
**Answer:** I build with three rules: First, adhere strictly to established platform standards rather than obscure abstractions (such as native Next.js App Router and standard Prisma migrations). Second, provide comprehensive documentation including explicit clone-to-running steps, environment templates without committed secrets, and documented failure scenarios. Third, implement clear error handling and logging so when something breaks, the logs pinpoint the exact failed line and cause rather than failing silently with misleading success screens.

---

### Question 13: Your first page load took a specific number of milliseconds. Where did that time go? Name the parts you can measure and the parts you are guessing about.
**Answer:** On first page load, my server took 3,348 milliseconds. The parts I can measure directly through server logs and DevTools timings are: Turbopack route compilation (1,249ms), TypeScript typechecking (916ms), static page generation across workers, and TCP socket handshake. The parts I am guessing about include operating system file system I/O latency, Windows Defender real-time scanning overhead during node_modules reads, and local database pool initialization times. On subsequent reloads, compile caches drop response times to under 100 milliseconds.

---

### Question 14: Your application reported success to the user while writing nothing to the database. Explain the mechanism that allowed that, and name the one check that would have caught it in thirty seconds.
**Answer:** The false-success defect occurs when client-side state optimistically displays a green checkmark or confirmation screen immediately upon form submission, without verifying the server's HTTP status code or database write result. In many prototypes, network requests are unhandled or return 200 without creating records. The single check that catches this in thirty seconds is inspecting the terminal server logs for an authentic `HTTP 201 Created` status accompanied by a real, database-generated record ID, followed by querying the database table directly with Prisma Studio.

---

### Question 15: Wrong-answer analysis. A candidate says: "I always check my app is working by signing up a test user and confirming I get taken to the dashboard. If the dashboard loads, the backend is working." Say what is wrong with this, what it would miss, and what you would do instead.
**Answer:** The candidate's test is flawed because the frontend could redirect to the dashboard purely based on client-side router navigation, mock state, or a hardcoded token, without writing a single byte to the database. It would completely miss: database connection failures, broken insert queries, omitted foreign keys, race conditions, and lack of transaction rollbacks. Instead, I inspect the server logs for `HTTP 201 Created`, query the database directly to confirm the user row exists with an authentic timestamp, and intentionally disconnect the database to verify the frontend correctly shows an error rather than false success.


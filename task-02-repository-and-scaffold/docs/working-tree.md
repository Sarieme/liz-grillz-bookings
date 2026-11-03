# The Working Tree Pipeline and Single-Branch Failure Analysis

## 1. The Deployment Pipeline
The working tree pipeline describes how code travels from a developer's keyboard to end users. It consists of four distinct environments connected by Git branches:

1. **Working Directory (Your Local Computer):** Where code is actively written, modified, and tested. Uncommitted files remain untracked or modified only on local disk.
2. **Local Git Store (.git Index / Staging):** Where snapshots of verified work are staged and committed into local Git history. Commits here are private to your machine and can still be amended or undone safely.
3. **Remote Repository (GitHub):** The shared central source of truth for the engineering team and automated continuous integration (CI) workflows.
4. **Production Environment:** The live, publicly accessible hosting platform (e.g. Vercel, Railway, or AWS) that serves the application to real customers.

### Critical Operational Boundaries
- **The Boundary of Visibility (Code Visible to Users):** This boundary sits between GitHub and Production. Code pushed to GitHub triggers automated deployment webhooks that build and publish the live site. Once code crosses into production, real users see and interact with it.
- **The Boundary of Quiet Undoing (No Longer Undoable Quietly):** This boundary sits between your Local Git Store and GitHub. As long as a commit lives only on your local machine, you can reset, rebase, or amend it without leaving an audit trail. Once you run `git push` to a shared remote repository, the commit is public. Any mistake pushed to GitHub is permanently visible in the log, and fixing it requires a public reverting commit.

---

## 2. What Breaks When a Repository Uses Only One Branch
When a repository operates exclusively on the `main` branch with no feature branches, several catastrophic failures inevitably occur:

1. **Unfinished Work Pollutes the Deployable State:**  
   Every push to `main` is considered production-ready. If a developer is halfway through building a complex feature (such as the 600-person capacity rule or Paystack webhook handlers), they cannot push their work to remote backup without risking deploying broken, half-baked code to production.
2. **Hotfixes Are Blocked by Work in Progress:**  
   If a critical production bug occurs (such as a database connection timeout on port 5432), the developer cannot cleanly patch it. Any attempt to commit the fix pulls all local, half-finished feature code along with it into the deployment stream.
3. **Collaboration Becomes Impossible:**  
   Multiple contributors pushing directly to `main` experience constant, chaotic merge collisions. There is no isolated sandbox to review code, run test suites, or conduct pull request reviews before integration.

---

## 3. Why Single-Branch Risk Multiplies After First Deployment
Before your first deployment, a single-branch workflow is merely inconvenient. If code breaks, only the developer sitting at the laptop notices.

After your first deployment, the application is live:
- Real corporate event planners and church administrators in Lagos are visiting the website to check event dates and submit booking requests.
- If an untested change is committed directly to `main` and pushed, modern CI/CD pipelines immediately build and deploy it to production.
- If that change contains a syntax error, a broken database migration, or an unhandled 404 route, the live booking service crashes instantly for all users.
- Event planners encountering a crashed site will abandon the reservation and book with a competing caterer.

Isolated feature branching guarantees that `main` always represents a tested, deployable, and stable version of the product, while all development and experiments occur safely off the production path.


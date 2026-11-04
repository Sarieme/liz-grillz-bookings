# Deterministic Rollback Without Hallucination

## 1. Overview and Scenario

During the implementation of Task Three on branch `feature/task-03-client-validation`, an unvetted feature was introduced to test promotional styling on the authentication interface: an intrusive marketing banner inside the primary authentication card advertising a 20% discount code with raw hex styling (`#ffeb3b`).

This change immediately caused two regressions:
1. It violated our strict token referencing rules from Task One by hardcoding raw yellow background colors instead of semantic surface tokens.
2. It violated our information design principles from Step 2 by inserting non-functional marketing noise directly into the focused cognitive pathway of registration, sign in, and password recovery.

Rather than asking an AI coding assistant to "undo the banner changes" or trying to manually edit lines from memory, we executed a deterministic version control rollback using Git commit identifiers.

---

## 2. Commit History Prior to Rollback

We inspected the recent linear history using `git log --oneline -n 6`:

```text
78428d3 feat(auth): add promotional discount banner to registration card
e8fee17 feat(task-03): implement single-page authentication hub, 4-category client validation, accessibility audit, and bypass attack analysis
60a6e00 Record git log graph evidence and update documentation with merged Pull Request #1 link
726d61f Merge pull request #1 from Sarieme/feature/information-design
81a1f9d Implement information design: dynamic head tags, brand favicon, Open Graph, fluid typography clamp, and interview answers
fab2b13 Add hand-drawn working tree drawing, pipeline documentation, and Aaron Akor usability findings
```

---

## 3. Chosen Commit ID and Execution

- **Target Commit ID**: `78428d3`
- **Target File**: `task-02-repository-and-scaffold/app/auth/AuthForm.tsx`
- **Command Executed**:
  ```bash
  git revert 78428d3 --no-edit
  ```

### Terminal Output
```text
[feature/task-03-client-validation 4145872] Revert "feat(auth): add promotional discount banner to registration card"
 Date: Wed Nov 4 05:30:51 2026 -0800
 1 file changed, 15 deletions(-)
```

---

## 4. Resulting Commit History

Following the revert operation, `git log --oneline -n 6` confirmed that Git deterministically inverted the exact diff of commit `78428d3`:

```text
4145872 Revert "feat(auth): add promotional discount banner to registration card"
78428d3 feat(auth): add promotional discount banner to registration card
e8fee17 feat(task-03): implement single-page authentication hub, 4-category client validation, accessibility audit, and bypass attack analysis
60a6e00 Record git log graph evidence and update documentation with merged Pull Request #1 link
726d61f Merge pull request #1 from Sarieme/feature/information-design
81a1f9d Implement information design: dynamic head tags, brand favicon, Open Graph, fluid typography clamp, and interview answers
```

We verified the working tree state with `git diff e8fee17 HEAD -- task-02-repository-and-scaffold/app/auth/AuthForm.tsx`, which returned zero diff. The file was restored bit-for-bit to its clean baseline.

---

## 5. Architectural Rationale: Commit Hash vs. Natural Language Prompting

Naming an immutable commit hash references the exact cryptographic SHA-1 pointer to a specific tree delta in Git, eliminating ambiguity. In contrast, describing a change with conversational English invites an AI agent or human collaborator to guess, hallucinate lines of code, or introduce partial undo defects across untracked or adjacent files.

Furthermore, utilizing `git revert` instead of `git reset --hard` preserves full audit provenance in the repository history. If this branch had already been pushed to a remote team upstream, `git reset` would require a dangerous forced push that rewrites history and desynchronizes peer working trees. With `git revert`, history moves forward predictably, recording both the mistake and the remediation as verifiable engineering events.

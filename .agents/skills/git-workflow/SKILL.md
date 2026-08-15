---
name: git-workflow
description: "Operate Git safely with status-first inspection, scoped branches, reviewable commits, preserved user changes, explicit diffs, and non-destructive defaults."
whenToUse: "Use whenever modifying a Git repository, creating commits, branches, pull requests, rebasing, resolving conflicts, or preparing work for review."
metadata:
  owner: matspectrum-ai
  category: workflow
---

# Git Workflow

Protect existing work first. Git commands can destroy user state when used casually.

## Before changing files

Run or inspect:

- current branch;
- `git status --short`;
- relevant untracked/modified files;
- upstream/base relationship;
- repository instructions.

Never assume a clean working tree.

## Branching

- Use a focused branch for a coherent phase/change.
- Start from the intended base.
- Avoid mixing unrelated fixes.
- Preserve the naming convention used by the repository.

## During implementation

- Keep changes scoped to the spec.
- Inspect diffs regularly.
- Do not overwrite unrelated user modifications.
- Avoid generated files unless required and reproducible.

## Commit discipline

A commit should:

- represent one logical change;
- have a precise imperative message;
- include required tests/spec/contracts for that change;
- exclude secrets, local credentials, logs, and editor noise.

For TDD work, preserving RED-before-GREEN commit history can be useful when the repository process requires auditability.

## Safe defaults

Do not use without explicit need and understanding:

- `git reset --hard`;
- forced checkout over modified files;
- `git clean -fd`;
- `git push --force`;
- history rewriting on shared branches.

If destructive history manipulation is genuinely necessary, explain scope and recovery before execution.

## Before push/PR

1. `git status --short`.
2. Inspect staged and unstaged diff.
3. Run required tests/verification.
4. Confirm no secrets or machine-local artifacts.
5. Confirm branch contains only intended commits.

## Pull request

PR body should state:

- purpose;
- architecture/behavior change;
- specification/contract references;
- TDD/verification evidence;
- security/operational impact;
- remaining gates or risks.

Keep a PR Draft while known merge gates remain open.

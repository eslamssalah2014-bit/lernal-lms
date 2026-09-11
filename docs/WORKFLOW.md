# LERNAL LMS — GITHUB & DEVELOPMENT WORKFLOW

This document outlines the professional branching strategy, commit standards, and pull request guidelines for the Lernal LMS engineering team.

---

## 🌿 Branching Strategy

We follow a structured Git branching model with two permanent branches:

```
feature/* ──┐
             v
        development (Active Integration)
             │
             │ (Release / Tag)
             v
           main (Production-Ready)
```

### 1. `main` (Production)
- Contains only tested, production-ready code.
- Deployed directly to production:
  - Frontend auto-deploys to **Vercel** production environment.
  - Backend auto-deploys to **Render** production web service.
- **Rule:** Direct commits to `main` are restricted. All changes merge via Pull Request from `development`.

### 2. `development` (Active Development)
- Integration branch where developers merge validated features and bug fixes.
- Deployed to staging environments for QA and pre-production testing.
- Base branch for creating feature branches.

### 3. Feature & Task Branches
All new features, enhancements, and fixes must branch off `development`. Use the following naming convention:

| Branch Pattern | Description | Example |
|---|---|---|
| `feature/<name>` | New product features or modules | `feature/course-management`, `feature/leads-center`, `feature/testing-module`, `feature/finance-module` |
| `fix/<name>` | Bug fixes and patches | `fix/resolve-enrollment-bug`, `fix/token-expiration-timezone` |
| `refactor/<name>`| Code refactoring or performance optimization | `refactor/optimize-authentication-flow` |
| `docs/<name>` | Documentation updates | `docs/update-project-documentation` |
| `chore/<name>` | Tooling, dependencies, or CI updates | `chore/update-dependencies` |

---

## 💬 Conventional Commits Specification

All commit messages must adhere to the [Conventional Commits](https://www.conventionalcommits.org/) standard.

### Format:
```
<type>(<scope>): <short description>

[optional longer body]

[optional footer(s)]
```

### Allowed Types:
- **`feat`**: A new feature (e.g., `feat: add course management module`)
- **`fix`**: A bug fix (e.g., `fix: resolve enrollment bug`)
- **`refactor`**: Code change that neither fixes a bug nor adds a feature (e.g., `refactor: optimize authentication flow`)
- **`docs`**: Documentation only changes (e.g., `docs: update project documentation`)
- **`style`**: Changes that do not affect code logic (white-space, formatting, missing semi-colons)
- **`perf`**: A code change that improves performance
- **`test`**: Adding missing tests or correcting existing tests
- **`chore`**: Changes to the build process, dependency upgrades, or tooling

---

## 🚀 Daily Developer Workflow

### Step 1: Sync with Development
```bash
git checkout development
git pull origin development
```

### Step 2: Create a Feature Branch
```bash
git checkout -b feature/course-management
```

### Step 3: Work & Commit
```bash
# Verify no secrets or build files are unstaged
git status

git add .
git commit -m "feat: add course builder step validation"
```

### Step 4: Push to GitHub & Open Pull Request
```bash
git push -u origin feature/course-management
```

Open a Pull Request into `development` on GitHub. After QA approval and merge into `development`, a release PR merges `development` into `main`.

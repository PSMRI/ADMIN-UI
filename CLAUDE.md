# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AMRIT (Accessible Medical Records via Integrated Technology) Admin UI — an Angular-based admin panel for healthcare EHR management by Piramal Swasthya. Licensed under GPL v3.

## Common Commands

```bash
npm start              # Dev server on http://localhost:4 205
npm run build-dev      # Development build with AOT
npm run build-prod     # Production build with AOT
npm run build-ci       # CI build (generates environment.ci.ts from template + env vars)
npm test               # Karma + Jasmine tests (watch mode, Chrome)
npm run lint           # ESLint (Angular + Prettier rules)
npm run commit         # Interactive Commitizen commit (conventional commits)
```

## Git Submodule

The `Common-UI/` directory is a git submodule from `https://github.com/PSMRI/Common-UI`. After cloning, initialize with:
```bash
git submodule update --init
```
It provides `SessionStorageService` and other shared utilities, imported as `'Common-UI/src/registrar/services/...'`.

## Commit Conventions

Conventional Commits enforced via Husky + commitlint. Pre-commit hook runs `lint-staged` (ESLint --fix on staged `.ts` and `.html` files). Allowed types: `feat`, `fix`, `build`, `chore`, `ci`, `docs`, `perf`, `refactor`, `revert`, `style`, `test`. Header max 100 chars, subject must not end with `.`.

## Architecture

**Angular 16 (NgModule-based)** — not standalone components. Single application (not a monorepo).

### Routing

```
/login                          → loginContentClassComponent
/resetPassword, /setQuestions, /setPassword → auth flows
/MultiRoleScreenComponent       → [AuthGuard] post-login shell
  └── named outlet: postLogin_router
        ├── superAdmin          → SuperAdminComponent
        └── providerAdmin       → ProviderAdminComponent
```

All routes are eagerly loaded. `AuthGuard` checks `sessionStorage['authToken']`.

### Key Directory Layout

- **`src/app/core/`** — Core module (singleton services, shared components, directives, Material barrel module). Uses `CoreModule.forRoot()` pattern.
- **`src/app/user-login/`** — Login, password reset, security questions.
- **`src/app/multi-role-screen/`** — Role selection after login.
- **`src/app/app-provider-admin/provider-admin/activities/`** — ~41 feature subdirectories (main admin features).
- **`src/app/app-provider-admin/provider-admin/configurations/`** — ~22 configuration feature subdirectories.
- **`src/app/app-provider-admin/provider-admin/inventory/`** — Inventory management features.

### State Management

No external state library. Uses service-based state:
- **`dataService`** — Injectable singleton holding user session state (`uid`, `uname`, `role`, `Userdata`, `userPriveliges`, `service_providerID`, `provider_serviceMapID`). Reads from `SessionStorageService` on init.
- **`SessionStorageService`** (from Common-UI submodule) — wraps `sessionStorage`.
- Auth token stored directly in `sessionStorage['authToken']`.

### API / Service Layer

- **`ConfigService`** — Reads base URLs from `environment.ts`, exposes `getCommonBaseURL()`, `getAdminBaseUrl()`, `getSuperAdminBaseUrl()`.
- **Feature services** — Each feature has its own service injecting `HttpClient` directly. API URL strings are defined in environment files (~100+ URL properties).
- **`HttpInterceptorService`** — Attaches `Authorization` header from sessionStorage, manages spinner, handles session expiry (status code `5002`), and runs a 27-minute idle timer.
- **Three backend API groups:** `adminapi-v1.0/`, `commonapi-v1.0/`, `fhirapi-v1.0/`.

### Environment Configuration

Environment files in `src/environments/`. CI builds use `environment.ci.ts.template` (EJS) rendered by `scripts/ci-prebuild.js` with env vars: `ADMIN_API_BASE`, `COMMON_API_BASE`, `FHIR_API_BASE`, `SESSION_STORAGE_ENC_KEY`.

### Common Patterns

- **Dialogs:** Use `ConfirmationDialogsService` (wraps `MatDialog`) — `.alert()`, `.confirm()`, `.remarks()`, `.choice()`.
- **Input validation:** Custom attribute directives in `core/directives/` (e.g., `myNameDirective`, `myMobileNumberDirective`, `myEmailDirective`).
- **Forms:** Mix of template-driven (`FormsModule`) and reactive (`ReactiveFormsModule`).
- **Spinner:** Managed automatically by HTTP interceptor via `SpinnerService`.
- **Material imports:** Centralized in `MaterialModule` barrel module.
- **Password encryption:** AES encryption with PBKDF2 key derivation (CryptoJS) before sending to backend.
- **Component prefix:** `app-` (selector prefix for components, `app` for directives).

### UI Libraries

Angular Material 16 (primary UI), Bootstrap 5 (CSS), ngx-bootstrap (Angular Bootstrap components). `xlsx` for Excel export.

### Build / Deploy

The app is packaged as a WAR file via Maven (`pom.xml`). `WEB-INF/` directory is copied into the dist output. Bundle size budgets: 5MB warning / 6MB error for initial bundle.

### ESLint Notes

`@typescript-eslint/no-explicit-any` is disabled — `any` is used throughout. Prettier is integrated via eslint-plugin-prettier.

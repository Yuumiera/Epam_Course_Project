# Phase 0 Research: MVP Authentication

## Decision 1: Authentication mechanism
- Decision: Use JWT bearer tokens for API authentication with a 24-hour expiry.
- Rationale: Matches clarified MVP defaults, keeps server stateless, and is straightforward to apply to protected routes.
- Alternatives considered:
  - Session-based auth with server state: simpler revocation but adds session storage complexity.
  - Short-lived access + refresh tokens: stronger security posture but added token lifecycle complexity beyond MVP.

## Decision 2: Password hashing approach
- Decision: Use `bcryptjs` asynchronous hashing for password storage and verification.
- Rationale: Pure JavaScript dependency avoids native build friction in MVP environments while still delivering accepted password hashing behavior.
- Alternatives considered:
  - `bcrypt` (native): potentially better performance but introduces native module build/runtime friction.
  - `argon2`: stronger modern default in many contexts but higher integration complexity for current MVP scope.

## Decision 3: Error semantics for auth endpoints
- Decision: Return `409` for duplicate email registration and `401` for invalid login or invalid/missing auth token.
- Rationale: Aligns with clarified product decisions and common REST authentication semantics.
- Alternatives considered:
  - `422` for duplicate email: valid but less aligned with resource-conflict interpretation chosen for this feature.
  - `400` for invalid login: too generic for authentication failures.

## Decision 4: Secret and token validation policy
- Decision: Keep JWT secret in environment variables (`JWT_SECRET`), fail fast if not configured, and verify token expiry on every protected request.
- Rationale: Satisfies constitution security requirements and prevents hardcoded secret leakage.
- Alternatives considered:
  - Hardcoded secret in source: rejected due to security policy violation.
  - External secrets manager for MVP: viable but outside current scope and deployment complexity target.

## Decision 5: Logout behavior for MVP
- Decision: Implement logout as client-side token deletion only, with no server-side token blacklist.
- Rationale: Matches clarified MVP decision and keeps implementation stateless and minimal.
- Alternatives considered:
  - Server-side blacklist/revocation list: stronger immediate revocation, but adds storage/maintenance complexity.
  - Token versioning per user: flexible revocation model, but requires additional persistence/version checks.

## Decision 6: MVP persistence strategy
- Decision: Persist users in a local JSON-backed store (`data/users.json`) with email uniqueness enforced at write-time.
- Rationale: Meets MVP persistence requirement with minimal infrastructure and no external DB setup.
- Alternatives considered:
  - In-memory store only: rejected because it does not satisfy persistence requirement across restarts.
  - Relational database: robust but beyond MVP setup and operational scope.

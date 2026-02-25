# Phase 0 Research: MVP Idea Evaluation Workflow

## Decision 1: Authorization enforcement strategy
- Decision: Keep JWT verification in existing auth middleware and add a route-level admin role guard for evaluation update endpoint.
- Rationale: Separates authentication from authorization cleanly and prevents role logic duplication across handlers.
- Alternatives considered:
  - Inline role checks inside route handlers (repetitive and easier to drift)
  - Global admin enforcement inside auth middleware (too rigid for mixed-role endpoints)

## Decision 2: Evaluation endpoint shape
- Decision: Add `PATCH /ideas/{id}/status` with JWT requirement and request body `{ status, comment? }`.
- Rationale: Minimal, resource-oriented update surface for status workflow without overloading generic full-idea patching.
- Alternatives considered:
  - `PATCH /ideas/{id}` for mixed field updates (broader than needed)
  - Action route (`POST /ideas/{id}/evaluate`) (works but less resource-centric)

## Decision 3: Status validation and normalization
- Decision: Validate status against enum `under_review|accepted|rejected` after `trim().toLowerCase()` normalization; store canonical lowercase values.
- Rationale: Handles mixed-case edge cases while keeping persisted values consistent.
- Alternatives considered:
  - Case-sensitive only validation (stricter but lower client ergonomics)
  - Free-form status text (violates workflow consistency)

## Decision 4: Transition model for MVP
- Decision: Allow transitions `submitted -> under_review|accepted|rejected`, `under_review -> accepted|rejected`, and treat `accepted/rejected` as terminal.
- Rationale: Supports practical admin flow while keeping rules small and predictable.
- Alternatives considered:
  - Require strict sequence via `under_review` only before final statuses (more process control, lower MVP speed)
  - Allow any-to-any transitions (simpler implementation, weaker governance)

## Decision 5: Error payload and status codes
- Decision: Use JSON responses consistently with `401` (missing/invalid JWT), `403` (non-admin), `400` (invalid status/comment), and `404` (idea not found).
- Rationale: Aligns with existing endpoint conventions and keeps clients deterministic.
- Alternatives considered:
  - Nested structured error object (`{ error: { code, message } }`) for all responses (better future extensibility but larger immediate refactor)
  - `422` for validation errors (acceptable but inconsistent with current API style)

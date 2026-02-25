# Phase 0 Research: MVP Idea Submission

## Decision 1: Idea API surface
- Decision: Use resource-oriented JSON endpoints: `POST /ideas`, `GET /ideas`, and `GET /ideas/:id`.
- Rationale: Minimal, conventional REST shape for create/list/detail workflows and easy alignment with integration tests.
- Alternatives considered:
  - Action-based paths (e.g., `/createIdea`): less RESTful and less scalable for future extensions.
  - Split collection namespace (`/api/ideas/*`): acceptable but unnecessary additional path nesting for MVP.

## Decision 2: Idea data shape and defaults
- Decision: Define idea record fields as `id`, `title`, `description`, `category`, and `status`; set `status` default to `submitted` server-side.
- Rationale: Matches product requirement exactly and prevents client-side status manipulation in MVP.
- Alternatives considered:
  - Optional status supplied by clients: increases invalid-state risk and weakens workflow consistency.
  - Additional metadata fields in MVP response: useful later but unnecessary for minimal scope.

## Decision 3: Storage strategy
- Decision: Use in-memory store module (`ideaStore`) with create/list/get-by-id operations and reset support for tests.
- Rationale: Fastest delivery path for MVP with no external infrastructure while supporting deterministic test isolation.
- Alternatives considered:
  - File-backed JSON persistence: survives restart but adds I/O complexity and race concerns.
  - Database-backed persistence: durable but outside MVP setup scope.

## Decision 4: Authentication integration
- Decision: Require authentication only for `POST /ideas`; keep `GET /ideas` and `GET /ideas/:id` open for MVP browsing.
- Rationale: Preserves low-friction read access while enforcing authenticated write actions.
- Alternatives considered:
  - Protect all idea endpoints: stronger privacy but reduced discoverability and added friction.
  - No auth on create: violates explicit requirement for authenticated submissions.

## Decision 5: Error and response conventions
- Decision: Return JSON for every outcome; use `401` for unauthorized create attempts, `404` for missing idea IDs, and `400` for invalid payloads.
- Rationale: Consistent machine-consumable responses and clear semantics for client behavior.
- Alternatives considered:
  - HTML/default Express errors: rejected due to JSON-only requirement.
  - `422` for validation: viable but not needed for MVP where `400` is sufficient and consistent.

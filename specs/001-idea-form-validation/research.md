# Phase 0 Research: Phase 2 Smart Idea Submission Form Improvements

## Decision 1: Server-side field validation rules
- Decision: Enforce canonical validation rules on server for `title`, `description`, and `category`.
  - `title`: required, trimmed length between 3 and 120
  - `description`: required, trimmed length between 20 and 2000
  - `category`: required, must be one of existing allowed categories (`HR`, `Process`, `Technology`, `Quality`, `Culture`, `Other`)
- Rationale: Centralized server rules prevent bypasses and keep data quality consistent across clients.
- Alternatives considered:
  - Keep only non-empty checks: too weak for Phase 2 quality goals.
  - Client-only rules: insecure and bypassable.

## Decision 2: Validation error response format
- Decision: Return HTTP `400` with JSON shape:
  - `{ "error": "Validation failed", "fieldErrors": { "title": "...", "description": "...", "category": "..." } }`
- Rationale: A stable keyed object is easy for frontend mapping and supports multiple errors in one response.
- Alternatives considered:
  - Array of errors: valid but adds mapping overhead for simple form fields.
  - Single generic error string: insufficient UX clarity.

## Decision 3: Frontend submit gating strategy
- Decision: Maintain a local form validation state and disable submit button while any required field is invalid.
- Rationale: Prevents avoidable invalid requests and gives immediate user feedback.
- Alternatives considered:
  - Validate only on submit: slower feedback loop.
  - Validate only on blur: less responsive for progressive correction.

## Decision 4: Inline error display behavior
- Decision: Show inline per-field message elements under each input and update on input/change events; also apply server `fieldErrors` back to the same message areas.
- Rationale: Keeps client/server feedback unified and understandable.
- Alternatives considered:
  - Toast-only validation errors: poor field-level guidance.
  - Modal-based errors: too heavy for MVP form UX.

## Decision 5: Test coverage scope
- Decision: Add integration tests for server validation failures and successful submissions, plus frontend-flow checks in existing form submission path.
- Rationale: Meets constitution requirement for business-logic test coverage with minimal overhead.
- Alternatives considered:
  - Unit tests only: does not fully validate API contract behavior.
  - End-to-end browser test suite: out of scope for current repo setup.

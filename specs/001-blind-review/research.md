# Phase 0 Research: Blind Review Identity Masking

## Decision 1: Apply role-aware response shaping for identity fields
- Decision: Hide creator identity fields when response is consumed in admin review context, while retaining visibility for submitter-owned personal context.
- Rationale: Meets blind-review requirement without breaking ownership transparency for submitters.
- Alternatives considered:
  - Global removal of creator identity fields for all users: breaks submitter personal ownership visibility.
  - Frontend-only hiding: insecure because identity would still be exposed by API.

## Decision 2: Keep evaluation endpoint behavior stable
- Decision: Preserve existing evaluation transition/status logic and only adjust payload shape to avoid creator identity leakage.
- Rationale: Requirement explicitly states evaluation endpoints must keep working.
- Alternatives considered:
  - Refactor endpoint contracts broadly: unnecessary scope increase and regression risk.

## Decision 3: Define masked identity field set explicitly
- Decision: Treat creator identifiers and identity descriptors as a single maskable field set in admin review responses.
- Rationale: Reduces ambiguity and ensures deterministic masking behavior across endpoints.
- Alternatives considered:
  - Ad hoc per-endpoint masking decisions: increases inconsistency risk.

## Decision 4: Preserve submitter self-view identity
- Decision: Submitter personal view for owned ideas includes identity fields to confirm ownership context.
- Rationale: Required by feature and avoids user confusion over ownership.
- Alternatives considered:
  - Hide identity everywhere except profile page: would force unnecessary navigation and diverge from current idea-centric UX.

## Decision 5: Testing strategy
- Decision: Add integration tests for admin-masked responses, submitter personal-view identity visibility, and evaluation endpoint continuity under masking.
- Rationale: Role-dependent response behavior is easy to regress without automated tests.
- Alternatives considered:
  - Manual-only verification: not sufficient for security/privacy-sensitive behavior.

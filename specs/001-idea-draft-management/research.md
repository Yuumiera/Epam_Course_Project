# Phase 0 Research: Idea Draft Management

## Decision 1: Draft creation should be explicit at idea creation time
- Decision: Allow clients to create ideas directly in `draft` status (rather than auto-saving every new idea as draft).
- Rationale: Matches requested behavior and keeps existing submitted-first flow available.
- Alternatives considered:
  - Implicit auto-draft on every create: changes existing semantics too broadly.
  - Separate draft-create endpoint only: unnecessary API surface for MVP.

## Decision 2: Creator-only authorization for draft mutate operations
- Decision: Enforce ownership checks for `PUT/PATCH /ideas/:id` and `PATCH /ideas/:id/submit` when idea status is `draft`.
- Rationale: Requirement explicitly restricts draft edit/submit to creator.
- Alternatives considered:
  - Role-based override by non-admin submitters: conflicts with feature requirement.
  - Client-side enforcement only: insecure and bypassable.

## Decision 3: Draft visibility filtering for submitters
- Decision: Exclude drafts not owned by the authenticated submitter from list/detail responses.
- Rationale: Requirement states drafts must not be visible to other submitters.
- Alternatives considered:
  - Return draft metadata but hide content: still leaks draft existence.
  - Return forbidden for foreign drafts in list: awkward list UX and unnecessary exposure.

## Decision 4: Submit action as one-way state transition
- Decision: `PATCH /ideas/:id/submit` transitions `draft -> submitted`; invalid for non-draft states.
- Rationale: Keeps lifecycle deterministic and aligns with explicit submit flow.
- Alternatives considered:
  - Generic status update by submitter: over-broad and conflicts with evaluation flow.
  - Allow resubmission from submitted: no business need in current scope.

## Decision 5: Test coverage focus
- Decision: Add integration tests for create-draft, creator-only update/submit, visibility filtering, and invalid transition handling.
- Rationale: These are business-critical paths and highest regression risk.
- Alternatives considered:
  - Unit-only store tests: insufficient confidence for route + auth integration behavior.

# Phase 0 Research: Multi-Stage Review Workflow

## Decision 1: Enforce explicit transition graph
- Decision: Limit status changes to `submitted -> under_review -> approved_for_final -> accepted/rejected`.
- Rationale: Prevents accidental skipping and ensures review policy consistency.
- Alternatives considered:
  - Allow free transitions between all statuses: easier technically but violates governance intent.
  - Allow backward transitions by default: adds ambiguity and rework loops not requested in scope.

## Decision 2: Keep admin-only transition authority
- Decision: Reuse existing admin authorization checks for review mutations.
- Rationale: Requirement explicitly states only admins can move ideas through stages.
- Alternatives considered:
  - Allow submitters to self-progress: conflicts with controlled review requirement.
  - Add new reviewer role: out of current scope and unnecessary for requested feature.

## Decision 3: Persist immutable evaluation history entries
- Decision: Add append-only history records containing `status`, `comment`, `reviewerId`, and `timestamp` per successful transition.
- Rationale: Supports traceability and timeline visualization.
- Alternatives considered:
  - Store only latest review metadata on Idea: loses audit trail.
  - Overwrite single history JSON blob: difficult to validate and reason about ordering.

## Decision 4: Ensure status update and history write are consistent
- Decision: Treat transition + history append as one logical operation so successful status changes always have matching history entry.
- Rationale: Avoids partial states where status changes but history is missing.
- Alternatives considered:
  - Fire-and-forget history writes: risks inconsistent timeline data.
  - Background job for history write: unnecessary complexity for MVP.

## Decision 5: Render timeline in existing idea detail panel
- Decision: Reuse current idea detail area in UI to show chronological review history timeline.
- Rationale: Minimal UX change while meeting requirement.
- Alternatives considered:
  - New dedicated review page: extra navigation and larger UI scope.
  - Hide timeline for submitters: conflicts with request to show review history timeline.

## Decision 6: Testing strategy
- Decision: Extend integration tests for valid/invalid transitions, admin authorization, history persistence, and detail response timeline payload.
- Rationale: Transition rules and history behavior are business logic and regression-prone.
- Alternatives considered:
  - Manual-only verification: insufficient confidence for workflow-critical behavior.

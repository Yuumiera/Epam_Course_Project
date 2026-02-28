# Data Model: Multi-Stage Review Workflow

## Entity: Idea
- Description: Core proposal record that progresses through review states.
- Relevant fields:
  - `id` (string, unique)
  - `title` (string)
  - `description` (string)
  - `category` (string)
  - `status` (string; one of `submitted`, `under_review`, `approved_for_final`, `accepted`, `rejected`)
  - `createdByUserId` (string)
- Validation rules:
  - Status transitions must follow the approved transition graph.
  - Non-admin users cannot mutate review status.

## Entity: ReviewTransitionRule
- Description: Business rule map defining valid next statuses for each current status.
- Rule set:
  - `submitted` -> `under_review`
  - `under_review` -> `approved_for_final`
  - `approved_for_final` -> `accepted` or `rejected`
- Validation rules:
  - Any transition outside this map is invalid.

## Entity: EvaluationHistoryEntry
- Description: Immutable record created for each successful review status transition.
- Fields:
  - `id` (string, unique)
  - `ideaId` (string, relation to Idea)
  - `status` (string, resulting status)
  - `comment` (string, optional)
  - `reviewerId` (string, admin user id)
  - `timestamp` (datetime)
- Validation rules:
  - Created only after a successful allowed transition.
  - Never updates/deletes existing entries in normal workflow.

## Entity: ReviewTimelineView
- Description: Ordered projection of evaluation history for UI detail panel.
- Fields per timeline item:
  - `status`
  - `comment`
  - `reviewerId`
  - `timestamp`
- Validation rules:
  - Ordered chronologically.
  - Empty-state message shown when no entries exist.

## State Transitions
- `submitted` -> `under_review` (allowed)
- `under_review` -> `approved_for_final` (allowed)
- `approved_for_final` -> `accepted` (allowed)
- `approved_for_final` -> `rejected` (allowed)
- Any other source/target pair (rejected)

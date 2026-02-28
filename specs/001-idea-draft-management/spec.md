# Feature Specification: Idea Draft Management

**Feature Branch**: `001-idea-draft-management`  
**Created**: 2026-03-01  
**Status**: Draft  
**Input**: User description: "Implement draft management: Allow creating an idea as draft (status \"draft\"); allow updating a draft; allow submitting a draft (status \"submitted\"); only the creator can edit/submit their drafts; drafts should not be visible to other submitters"

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
  
  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - Save Idea as Draft (Priority: P1)

As a submitter, I can save a new idea as a draft so I can continue writing it before formal submission.

**Why this priority**: Draft creation is the entry point for the entire feature and enables incomplete work to be stored safely.

**Independent Test**: Can be fully tested by creating a new idea in draft state and verifying it is stored with status "draft" and only visible to its creator.

**Acceptance Scenarios**:

1. **Given** an authenticated submitter starts a new idea, **When** they choose to save as draft, **Then** the idea is created with status "draft".
2. **Given** a draft exists for submitter A, **When** submitter B requests idea listings, **Then** submitter B does not see submitter A's draft.

---

### User Story 2 - Edit Own Draft (Priority: P2)

As a submitter, I can update details of my own draft so I can refine content over time.

**Why this priority**: Draft editing is core to iterative writing and required before final submission.

**Independent Test**: Can be fully tested by updating a draft as its creator and confirming changes persist, while non-creators are denied edit access.

**Acceptance Scenarios**:

1. **Given** a submitter owns a draft, **When** they update any editable fields, **Then** the draft is updated and remains in status "draft".
2. **Given** a submitter does not own a draft, **When** they attempt to update it, **Then** the system denies the action.

---

### User Story 3 - Submit Finalized Draft (Priority: P3)

As a submitter, I can submit my draft once finalized so it enters the normal submitted idea flow.

**Why this priority**: Submission completes the draft lifecycle and converts preparatory work into actionable content.

**Independent Test**: Can be fully tested by submitting an owned draft and verifying the status changes to "submitted" and the item is no longer editable as a draft.

**Acceptance Scenarios**:

1. **Given** a submitter owns a draft, **When** they submit it, **Then** the idea status changes from "draft" to "submitted".
2. **Given** a submitter does not own a draft, **When** they attempt to submit it, **Then** the system denies the action.

---

### Edge Cases

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right edge cases.
-->

- A submitter attempts to submit an idea that is already in status "submitted".
- A submitter attempts to edit or submit an idea that does not exist.
- A submitter attempts to edit or submit another user's draft by guessing or changing the idea identifier.
- A draft contains minimal or partially completed fields and must still be saved for later completion.

## Requirements *(mandatory)*

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: The system MUST allow an authenticated submitter to create an idea in status "draft".
- **FR-002**: The system MUST persist draft ideas so the creator can retrieve and continue editing them later.
- **FR-003**: The system MUST allow a draft creator to update their own draft content while it is in status "draft".
- **FR-004**: The system MUST prevent non-creators from updating a draft.
- **FR-005**: The system MUST allow a draft creator to submit their draft, changing status from "draft" to "submitted".
- **FR-006**: The system MUST prevent non-creators from submitting a draft.
- **FR-007**: The system MUST prevent updates to drafts that have already been submitted through the draft-submission action.
- **FR-008**: The system MUST ensure drafts are visible only to their creator and are not visible to other submitters.
- **FR-009**: The system MUST return a clear failure response when edit/submit actions target a non-existent idea.

### Constitution Alignment Requirements

- **CAR-001**: Business-logic behavior in this feature MUST be covered by automated tests.
- **CAR-002**: Feature code MUST pass repository linting rules.
- **CAR-003**: Feature changes MUST preserve a minimum of 80% line coverage for business logic.
- **CAR-004**: Feature design MUST prevent repository secrets exposure (use env vars/secrets store).
- **CAR-005**: Implementation plan MUST describe meaningful commit slicing and message intent.

### Key Entities *(include if feature involves data)*

- **Idea**: A submitter-authored proposal that includes content fields and a lifecycle status. Relevant states for this feature are "draft" and "submitted".
- **Submitter**: An authenticated user who creates ideas and has ownership rights over their own drafts.
- **Idea Ownership**: The relationship that binds an idea to its creator and determines who may view, edit, or submit draft records.

### Assumptions

- Existing authentication identifies the currently authenticated submitter for each request.
- Existing submitted-idea behavior remains unchanged, except for status transitions from draft to submitted.
- Drafts may be incomplete and do not require the same completeness expectations as final submissions.
- Users with elevated roles (if any) are outside this feature scope unless explicitly covered by existing platform rules.

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: 95% of authenticated submitters can save a new draft idea on their first attempt during acceptance testing.
- **SC-002**: 95% of authenticated submitters can edit their own draft and observe saved changes in under 10 seconds.
- **SC-003**: 100% of tested attempts by non-creators to view, edit, or submit another submitter's draft are denied.
- **SC-004**: 95% of draft submissions successfully transition status from "draft" to "submitted" on first attempt during acceptance testing.

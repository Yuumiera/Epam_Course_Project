# Feature Specification: Phase 2 Smart Idea Submission Form Improvements

**Feature Branch**: `001-idea-form-validation`  
**Created**: 2026-02-27  
**Status**: Draft  
**Input**: User description: "Implement Phase 2 smart idea submission form improvements: Add stronger server-side validation rules for idea fields (title, description, category), add clear validation error responses (400 JSON with field-level errors), and update UI to show inline validation messages and disable submit until valid"

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

### User Story 1 - Validate Submission on Server (Priority: P1)

As a portal user, I want the server to validate idea inputs consistently so that invalid submissions are rejected with clear reasons.

**Why this priority**: Server-side validation is the primary integrity safeguard and must work even if client-side checks are bypassed.

**Independent Test**: Submit invalid `title`, `description`, and `category` combinations directly to the create-idea endpoint and verify deterministic `400` responses with field-level errors.

**Acceptance Scenarios**:

1. **Given** an authenticated user, **When** `title` is blank or whitespace-only, **Then** the request is rejected with `400` and a field error for `title`.
2. **Given** an authenticated user, **When** `description` is below the minimum accepted length, **Then** the request is rejected with `400` and a field error for `description`.
3. **Given** an authenticated user, **When** `category` is missing or outside accepted categories, **Then** the request is rejected with `400` and a field error for `category`.
4. **Given** an authenticated user, **When** all fields are valid, **Then** the request succeeds and creates the idea.

---

### User Story 2 - Return Field-Level Error Responses (Priority: P2)

As a frontend consumer, I want structured validation errors in the response so that I can map errors to the correct form fields.

**Why this priority**: Clear, field-level error responses reduce user confusion and avoid generic retry loops.

**Independent Test**: Trigger multiple simultaneous validation failures and confirm `400` response contains one entry per invalid field.

**Acceptance Scenarios**:

1. **Given** an invalid submission, **When** validation fails for one field, **Then** the response includes `400` with that field-specific error.
2. **Given** an invalid submission, **When** validation fails for multiple fields, **Then** the response includes all field-specific errors in one response.
3. **Given** a valid submission, **When** the request is accepted, **Then** no validation error object is returned.

---

### User Story 3 - Inline Form Guidance and Submit Gating (Priority: P3)

As a portal user, I want inline validation feedback and a disabled submit button until the form is valid so I can correct issues before submitting.

**Why this priority**: This improves usability and lowers avoidable server round-trips.

**Independent Test**: Interact with the create-idea form in the UI and verify inline messages appear per field and submit remains disabled until all required rules pass.

**Acceptance Scenarios**:

1. **Given** a user editing form fields, **When** a field is invalid, **Then** an inline message is shown next to that field.
2. **Given** one or more invalid required fields, **When** the user attempts to submit, **Then** submit is blocked and button remains disabled.
3. **Given** all required fields are valid, **When** the form state updates, **Then** the submit button becomes enabled.
4. **Given** server returns field-level validation errors, **When** the response is processed, **Then** matching inline errors are displayed in the form.

---

### Edge Cases

- All fields contain only spaces.
- Payload includes extra unexpected fields.
- Category value differs only by case from an allowed category.
- Title and description meet minimum limits but exceed maximum limits.
- Client-side validation passes due to stale rules but server-side validation fails.
- User edits form from valid back to invalid state after submit was enabled.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST validate `title`, `description`, and `category` on the server for every idea creation request.
- **FR-002**: System MUST reject invalid create-idea requests with HTTP `400`.
- **FR-003**: System MUST return validation errors in a field-level JSON structure that identifies each invalid field.
- **FR-004**: System MUST support multiple field validation errors in a single response.
- **FR-005**: System MUST include human-readable validation messages for each invalid field.
- **FR-006**: System MUST preserve existing successful idea creation behavior for valid requests.
- **FR-007**: UI MUST display inline validation messages for `title`, `description`, and `category`.
- **FR-008**: UI MUST keep the idea submit button disabled while the form is invalid.
- **FR-009**: UI MUST enable the submit button immediately when all required rules are satisfied.
- **FR-010**: UI MUST map server field-level validation errors back to the corresponding inline field message locations.
- **FR-011**: Validation behavior MUST be covered by automated tests for both API and UI-facing error mapping flows.

### Constitution Alignment Requirements

- **CAR-001**: Business-logic behavior in this feature MUST be covered by automated tests.
- **CAR-002**: Feature code MUST pass repository linting rules.
- **CAR-003**: Feature changes MUST preserve a minimum of 80% line coverage for business logic.
- **CAR-004**: Feature design MUST prevent repository secrets exposure (use env vars/secrets store).
- **CAR-005**: Implementation plan MUST describe meaningful commit slicing and message intent.

### Key Entities *(include if feature involves data)*

- **IdeaSubmissionPayload**: User-provided input containing `title`, `description`, and `category` for a create request.
- **FieldValidationError**: One validation error entry containing the field name and a user-readable error message.
- **ValidationErrorResponse**: JSON response wrapper for `400` validation results containing one or more `FieldValidationError` entries.
- **IdeaFormValidationState**: UI state describing each field’s validity, message, and overall form validity used to control submit enablement.

## Assumptions

- Existing authentication behavior for idea creation remains unchanged.
- Existing allowed categories remain the source of category validity.
- Existing attachment validation is unaffected by this feature unless field validation fails first.

## Dependencies

- Existing idea creation endpoint and routing flow.
- Existing frontend create-idea form and submit lifecycle.
- Existing automated test framework used in the repository.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of invalid idea submissions for `title`, `description`, or `category` return `400` with field-level error details.
- **SC-002**: 100% of valid idea submissions continue to succeed without regression in required response fields.
- **SC-003**: At least 90% of users can correct invalid form input in one attempt using inline validation guidance.
- **SC-004**: Submit attempts blocked by client-side form invalidity prevent at least 80% of avoidable validation-failure requests during UAT sessions.

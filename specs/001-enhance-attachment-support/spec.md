# Feature Specification: Enhanced Idea Attachments

**Feature Branch**: `001-enhance-attachment-support`  
**Created**: 2026-02-27  
**Status**: Draft  
**Input**: User description: "Enhance attachment support: Enforce file type allowlist (pdf/png/jpg) and max size, store attachment metadata (filename, mimetype, size), add endpoint to download/view attachment for an idea, update UI to display attachment name and allow download"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Safe Attachment Upload Validation (Priority: P1)

As a submitter, I want attachment uploads to be accepted only when they match allowed formats and size limits so that ideas are safe to process and storage remains controlled.

**Why this priority**: Validation at upload time prevents unsupported and risky files from entering the system and is foundational for all attachment workflows.

**Independent Test**: Submit ideas with valid and invalid attachments and verify that only allowed files within size limits are accepted while invalid files are rejected with clear errors.

**Acceptance Scenarios**:

1. **Given** an authenticated user creating an idea, **When** the attachment type is PDF, PNG, or JPG and the file size is within the maximum limit, **Then** the submission succeeds.
2. **Given** an authenticated user creating an idea, **When** the attachment type is outside the allowlist, **Then** the submission is rejected with a validation error.
3. **Given** an authenticated user creating an idea, **When** the attachment size exceeds the configured maximum, **Then** the submission is rejected with a validation error.

---

### User Story 2 - Preserve Attachment Metadata (Priority: P2)

As a reviewer, I want each idea with an attachment to retain filename, type, and size details so that I can identify and trust what was uploaded.

**Why this priority**: Metadata is required to present attachment context correctly and support later access/download behavior.

**Independent Test**: Create an idea with an attachment and retrieve idea details to verify metadata fields are present, accurate, and consistently returned.

**Acceptance Scenarios**:

1. **Given** a successful idea submission with an attachment, **When** idea details are requested, **Then** attachment metadata includes filename, media type, and size.
2. **Given** an idea without attachment, **When** idea details are requested, **Then** attachment metadata is absent or explicitly empty.

---

### User Story 3 - Access Attachments from Idea UI (Priority: P3)

As a portal user, I want to see attachment names in idea details and open/download attachments directly so that I can review supporting material quickly.

**Why this priority**: This delivers end-user value by turning uploaded files into usable content during idea review.

**Independent Test**: Open an idea with an attachment in the UI, verify the attachment name is visible, and confirm the download/view action retrieves the expected file.

**Acceptance Scenarios**:

1. **Given** an idea with an attachment, **When** the user opens idea details, **Then** the attachment name is displayed.
2. **Given** an authorized user viewing an idea with attachment, **When** the user selects download/view, **Then** the system provides the correct attachment content.
3. **Given** an idea without attachment, **When** the user opens idea details, **Then** the UI shows a clear no-attachment state.

---

### Edge Cases

- File size is exactly at the maximum allowed threshold.
- File extension appears valid but media type is not allowed.
- Filename contains spaces, unicode characters, or repeated dots.
- Attachment exists in metadata but backing file is missing at access time.
- Unauthorized user attempts to access an attachment endpoint.
- User uploads no attachment and still expects idea submission to succeed.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST accept idea attachments only when file type is in the approved allowlist (PDF, PNG, JPG).
- **FR-002**: System MUST reject idea attachments that exceed the configured maximum file size.
- **FR-003**: System MUST return a clear validation error response when attachment type or size validation fails.
- **FR-004**: System MUST persist attachment metadata for successful uploads, including original filename, media type, and file size.
- **FR-005**: System MUST include attachment metadata in idea detail responses for ideas that have attachments.
- **FR-006**: System MUST provide an authenticated way to retrieve an attachment associated with an idea.
- **FR-007**: System MUST return an appropriate not-found response when an attachment is requested for an idea that has no attachment or unavailable file.
- **FR-008**: UI MUST display the attachment name in idea details when attachment metadata exists.
- **FR-009**: UI MUST provide a visible user action to download or view the attachment from idea details.
- **FR-010**: UI MUST present a clear no-attachment message when no attachment exists for the selected idea.
- **FR-011**: Existing successful idea submission behavior without attachments MUST remain unchanged.
- **FR-012**: Business-critical attachment behaviors in this feature MUST be covered by automated tests.

### Constitution Alignment Requirements

- **CAR-001**: Business-logic behavior in this feature MUST be covered by automated tests.
- **CAR-002**: Feature code MUST pass repository linting rules.
- **CAR-003**: Feature changes MUST preserve a minimum of 80% line coverage for business logic.
- **CAR-004**: Feature design MUST prevent repository secrets exposure (use env vars/secrets store).
- **CAR-005**: Implementation plan MUST describe meaningful commit slicing and message intent.

### Key Entities *(include if feature involves data)*

- **IdeaAttachmentUpload**: User-provided file associated with idea creation, evaluated against type and size rules.
- **AttachmentMetadata**: Stored descriptive information for an uploaded attachment (filename, media type, size, and retrievable location reference).
- **AttachmentAccessRequest**: Authorized request to retrieve attachment content for a specific idea.
- **AttachmentValidationError**: User-facing validation outcome describing why an upload was rejected.

## Assumptions

- Existing idea submission authentication and authorization behavior remains unchanged.
- Maximum attachment size is defined by current product policy and remains consistent across clients.
- Attachment handling applies only to single-file upload per idea in this phase.

## Dependencies

- Existing idea creation and idea detail workflows.
- Existing authenticated access controls for idea endpoints.
- Existing UI idea detail panel where attachment information is shown.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of uploads with disallowed file type or oversized files are rejected with validation responses before idea creation completes.
- **SC-002**: 100% of ideas created with attachments expose filename, media type, and size in their detail response.
- **SC-003**: At least 95% of authorized attachment retrieval attempts for valid ideas return the correct file successfully during acceptance testing.
- **SC-004**: At least 90% of users in UAT can identify and access an idea’s attachment from the detail view without assistance.

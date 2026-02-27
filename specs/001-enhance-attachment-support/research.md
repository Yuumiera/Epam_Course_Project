# Phase 0 Research: Enhanced Idea Attachments

## Decision 1: Attachment allowlist and size enforcement
- Decision: Accept only `application/pdf`, `image/png`, and `image/jpeg` uploads and reject files above the configured maximum size.
- Rationale: This constrains file risk and keeps storage predictable while matching requested formats.
- Alternatives considered:
  - Extension-only validation: bypassable and less reliable.
  - Broader file support: increases risk and complexity without current business need.

## Decision 2: Metadata persistence contract
- Decision: Persist and return attachment metadata fields `filename`, `mimeType`, and `sizeBytes` for successful uploads.
- Rationale: These fields are required for UI display and download context.
- Alternatives considered:
  - Filename-only storage: insufficient for content-type handling and user trust.
  - Raw file path exposure only: not user-centric and can leak internal details.

## Decision 3: Authenticated attachment retrieval
- Decision: Provide attachment access via an authenticated idea-scoped endpoint and return not-found when attachment is missing or unavailable.
- Rationale: Keeps access aligned with existing idea authorization boundaries.
- Alternatives considered:
  - Public static file URL: weakens access control.
  - Embedding file in idea detail payload: inefficient and unsuitable for binary transfers.

## Decision 4: UI attachment interaction model
- Decision: Display attachment name in idea detail and provide a direct download/view action using the existing authenticated client flow.
- Rationale: Delivers a simple, predictable user experience with minimal UI change.
- Alternatives considered:
  - Separate attachment page: unnecessary navigation overhead.
  - Auto-download on detail load: poor UX and bandwidth waste.

## Decision 5: Testing scope
- Decision: Cover validation failure cases, metadata persistence, and retrieval success/failure with integration tests.
- Rationale: These represent business-critical behavior and contract stability.
- Alternatives considered:
  - Unit-only tests: insufficient confidence for middleware + route integration behavior.

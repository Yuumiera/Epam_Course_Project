# Data Model: MVP Idea Submission

## Entity: Idea
- Description: Core business record representing one portal idea submission.
- Fields:
  - `id` (string, required): unique idea identifier.
  - `title` (string, required): short idea summary.
  - `description` (string, required): detailed idea explanation.
  - `category` (string, required): idea classification label.
  - `status` (string, required): lifecycle state, default `submitted`.
  - `attachment` (IdeaAttachment|null, optional): single linked file metadata.
- Validation rules:
  - `title`, `description`, and `category` must be non-empty strings.
  - `status` is server-controlled and defaults to `submitted` on creation.
  - IDs must be unique within persisted ideas table.
- Relationships:
  - Created by an authenticated user context (auth identity used for permission check at create time).
  - Has zero or one `IdeaAttachment` in MVP.

## Entity: IdeaAttachment
- Description: Metadata for one uploaded file associated with a single idea.
- Fields:
  - `filename` (string, required)
  - `mimeType` (string, required)
  - `sizeBytes` (number, required)
  - `storagePath` (string, required)
- Validation rules:
  - Exactly zero or one file per idea in MVP.
  - Allowed MIME types and max file size are validated during upload.
  - Multiple files in one request return `400` JSON error.

## Entity: IdeaSubmissionRequest
- Description: Incoming authenticated payload for idea creation.
- Fields:
  - `title` (string, required)
  - `description` (string, required)
  - `category` (string, required)
  - `attachment` (file, optional)
- Validation rules:
  - Missing or invalid fields return `400` with JSON error payload.
  - Invalid file type/size or multiple attachments return `400` with JSON error payload.

## Entity: IdeaCollection
- Description: Query result aggregate of `Idea` entities used for list and detail retrieval.
- Fields:
  - `items` (array of Idea)
- Validation rules:
  - Empty collection is valid and returns `[]` for list endpoint.

## State Transitions

### Idea lifecycle
1. `new` -> `submitted`
   - Trigger: successful authenticated create request.
2. `submitted` (stable in MVP)
   - Trigger: list/detail reads do not mutate state.

## Notes
- Ideas and users are persisted in SQLite via Prisma.
- No status transitions beyond `submitted` are in scope for this feature.

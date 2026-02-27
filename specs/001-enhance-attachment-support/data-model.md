# Data Model: Enhanced Idea Attachments

## Entity: IdeaAttachmentUpload
- Description: Single file provided as part of an idea submission.
- Fields:
  - `filename` (string, required)
  - `mimeType` (string, required)
  - `sizeBytes` (number, required)
  - `binaryContent` (file stream, required at upload time)
- Validation rules:
  - `mimeType` must be one of allowed values (PDF, PNG, JPG).
  - `sizeBytes` must be less than or equal to the configured max size.

## Entity: AttachmentMetadata
- Description: Stored attachment details linked to one idea.
- Fields:
  - `filename` (string)
  - `mimeType` (string)
  - `sizeBytes` (number)
  - `storagePath` (string, internal reference)
- Validation rules:
  - Present only for ideas that include an attachment.
  - Values reflect accepted upload data, not client-side display transforms.

## Entity: AttachmentValidationError
- Description: Validation response payload when attachment rules fail.
- Fields:
  - `error` (string summary)
- Validation rules:
  - Returned with HTTP `400` for type/size violations.
  - Message is human-readable and deterministic.

## Entity: AttachmentAccessRequest
- Description: Authenticated request for retrieving an idea’s attachment file.
- Fields:
  - `ideaId` (string)
  - `userContext` (authenticated principal)
- Validation rules:
  - Access is denied if authentication fails.
  - Returns not-found when idea or attachment file is unavailable.

## Notes
- Existing core Idea schema remains unchanged except attachment metadata usage.
- UI rendering relies on `filename`, `mimeType`, and `sizeBytes` from detail responses.

# Data Model: Idea Draft Management

## Entity: Idea
- Description: A submitter-authored proposal that can be prepared as draft and later submitted.
- Relevant fields:
  - `id` (string, unique)
  - `title` (string)
  - `description` (string)
  - `category` (enum-like string)
  - `status` (string; relevant values: `draft`, `submitted`)
  - `createdByUserId` (string; owner reference)
  - `attachment` (optional object)
  - `comment` (nullable string for evaluation context)
- Validation rules:
  - Draft save allows incomplete business progression but still respects field-level payload validation.
  - Submit action requires current status to be `draft`.

## Entity: DraftUpdateRequest
- Description: Authenticated request payload to update draft content.
- Fields:
  - `title` (string)
  - `description` (string)
  - `category` (string)
  - optional attachment update fields depending on existing upload behavior
- Validation rules:
  - Request is accepted only when authenticated user owns the draft.
  - Request is rejected when idea does not exist or is not in `draft` status.

## Entity: DraftSubmitRequest
- Description: Authenticated transition request to finalize a draft.
- Fields:
  - `ideaId` (path parameter)
  - `actorUserId` (from auth token)
- Validation rules:
  - Actor must own the idea.
  - Idea must currently be `draft`.
  - Successful transition sets status to `submitted`.

## Entity: DraftAccessBoundary
- Description: Access-control rule set defining who can read or mutate drafts.
- Rules:
  - Draft list/detail visibility is restricted to creator.
  - Draft update/submit actions are restricted to creator.
  - Non-creators receive deny/not-found style responses per existing API conventions.

## State Transitions
- `draft` -> `draft` (allowed on creator update)
- `draft` -> `submitted` (allowed on creator submit)
- `submitted` -> `submitted` via draft submit endpoint (not allowed)

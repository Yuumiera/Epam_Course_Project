# Data Model: Blind Review Identity Masking

## Entity: Idea
- Description: Core idea record that includes creator ownership and review/evaluation fields.
- Relevant fields:
  - `id` (string)
  - `title` (string)
  - `description` (string)
  - `category` (string)
  - `status` (string)
  - `createdByUserId` (string; creator ownership reference)
  - `comment` (nullable string)
- Validation rules:
  - Creator identity exposure depends on requester role and context.

## Entity: IdentityFieldSet
- Description: Group of creator identity attributes that are conditionally masked.
- Fields in scope:
  - `createdByUserId`
  - Any creator identity descriptors exposed by API contract (e.g., creator email/display identity if present)
- Validation rules:
  - Omitted in admin review responses.
  - Available in submitter personal view for owned ideas.

## Entity: ReviewContextResponse
- Description: Response shape used in admin review flows.
- Characteristics:
  - Includes idea evaluation data needed for review operations.
  - Excludes creator identity fields.
- Validation rules:
  - Must remain compatible with evaluation endpoint behavior.

## Entity: PersonalViewResponse
- Description: Response shape used when submitter views owned ideas.
- Characteristics:
  - Includes creator identity fields relevant to ownership confirmation.
- Validation rules:
  - Available only in submitter personal context.

## Entity: EvaluationEndpointResponse
- Description: Response payload for evaluation transitions and related review operations.
- Characteristics:
  - Maintains existing status/transition behavior.
  - Must not expose creator identity fields in admin review context.

## Context Rules
- Admin review context: identity masked.
- Submitter own-idea personal context: identity visible.
- Unauthorized/non-owner access: follows existing authorization behavior.

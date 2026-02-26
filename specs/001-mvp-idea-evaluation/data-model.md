# Data Model: MVP Idea Evaluation Workflow

## Entity: Idea
- Description: Existing portal idea, extended for admin evaluation state.
- Fields:
  - `id` (string, required): unique idea identifier.
  - `title` (string, required): idea title.
  - `description` (string, required): idea details.
  - `category` (string, required): idea category.
  - `status` (string, required): one of `submitted`, `under_review`, `accepted`, `rejected`.
  - `createdByUserId` (string, required): creator user ID from JWT subject.
  - `comment` (string|null, optional): admin evaluation comment.
- Validation rules:
  - Evaluation updates allow only `under_review`, `accepted`, `rejected` as target statuses.
  - Incoming status is normalized to lowercase before enum check.
  - `comment`, when provided, must be a string; empty/whitespace-only comment is stored as `null`.

## Entity: IdeaEvaluationUpdateRequest
- Description: Payload for admin status update endpoint.
- Fields:
  - `status` (string, required): requested evaluation status.
  - `comment` (string, optional): free-text explanation.
- Validation rules:
  - Missing `status` or invalid enum value returns `400` JSON error.
  - Non-string `comment` returns `400` JSON error.

## Entity: AuthenticatedActor
- Description: Request user derived from verified JWT.
- Fields:
  - `id` (string, required): token subject (`sub`).
  - `role` (string, required): token role claim.
- Validation rules:
  - Missing/invalid token returns `401`.
  - Role other than `admin` for evaluation update returns `403`.

## State Transitions

### Idea status lifecycle for evaluation
1. `submitted -> under_review`
2. `submitted -> accepted`
3. `submitted -> rejected`
4. `under_review -> accepted`
5. `under_review -> rejected`
6. `accepted` and `rejected` are terminal in MVP

## Notes
- Storage is persisted in SQLite via Prisma.
- Evaluation updates mutate existing idea records in place.

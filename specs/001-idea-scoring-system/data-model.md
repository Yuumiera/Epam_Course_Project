# Data Model: Idea Scoring System

## Entity: IdeaScore
- Description: Structured scoring record associated with a single idea.
- Fields:
  - `ideaId` (string)
  - `impact` (integer, 1-5)
  - `feasibility` (integer, 1-5)
  - `innovation` (integer, 1-5)
  - `totalScore` (number, derived as average)
  - `scoredByAdminId` (string)
  - `scoredAt` (datetime)
- Validation rules:
  - Each criterion must be integer in [1, 5].
  - `totalScore` must equal `(impact + feasibility + innovation) / 3`.

## Entity: RankedIdea
- Description: Idea representation enriched with score breakdown and rank position.
- Fields:
  - Core idea fields (`id`, `title`, `status`, etc.)
  - `impact` (integer)
  - `feasibility` (integer)
  - `innovation` (integer)
  - `totalScore` (number)
  - `rank` (positive integer)
- Ordering rules:
  - Primary sort: `totalScore` descending.
  - Tie-break: deterministic stable secondary ordering.

## Entity: ScoringRequest
- Description: Admin request payload used to create/update a score for an idea.
- Fields:
  - `impact`
  - `feasibility`
  - `innovation`
- Validation rules:
  - All three fields required.
  - All values must be integer and within allowed range.

## Relationships
- One idea has zero or one current score profile in this feature scope.
- One admin can score many ideas.

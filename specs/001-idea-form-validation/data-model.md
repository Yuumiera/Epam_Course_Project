# Data Model: Phase 2 Smart Idea Submission Form Improvements

## Entity: IdeaSubmissionPayload
- Description: Authenticated create-idea request payload.
- Fields:
  - `title` (string, required)
  - `description` (string, required)
  - `category` (string, required)
- Validation rules:
  - `title`: trim required, length 3..120
  - `description`: trim required, length 20..2000
  - `category`: must be one of allowed categories

## Entity: FieldValidationErrorMap
- Description: Field-keyed validation messages for one failed request.
- Fields:
  - `title` (string, optional)
  - `description` (string, optional)
  - `category` (string, optional)
- Validation rules:
  - Includes only fields that failed validation.
  - Message text is human-readable and deterministic.

## Entity: ValidationErrorResponse
- Description: JSON body returned for validation failures.
- Fields:
  - `error` (string, required): constant summary text (`Validation failed`)
  - `fieldErrors` (FieldValidationErrorMap, required)
- Validation rules:
  - Returned with HTTP `400` only for payload validation failures.
  - Can represent multiple invalid fields in one response.

## Entity: IdeaFormValidationState (frontend)
- Description: UI state controlling inline errors and submit button enabled state.
- Fields:
  - `title` (object: `value`, `error`, `valid`)
  - `description` (object: `value`, `error`, `valid`)
  - `category` (object: `value`, `error`, `valid`)
  - `formValid` (boolean)
- Validation rules:
  - `formValid` is true only when all required field states are valid.
  - Inline errors render from local checks first, then merge server `fieldErrors` if request fails.

## Notes
- Existing `Idea` persistence schema remains unchanged.
- This feature changes input validation and error contracts, not storage shape.

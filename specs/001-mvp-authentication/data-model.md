# Data Model: MVP Authentication

## Entity: UserAccount
- Description: Registered user identity record used for login and authorization.
- Fields:
  - `id` (string, required): unique user identifier.
  - `email` (string, required, unique): normalized email used as login identity.
  - `passwordHash` (string, required): bcryptjs hash of user password.
  - `role` (enum, required): one of `submitter`, `admin`.
  - `createdAt` (datetime, required): account creation timestamp.
  - `updatedAt` (datetime, required): last account update timestamp.
- Validation rules:
  - Email MUST be valid format and normalized before uniqueness check.
  - Password MUST be at least 8 characters.
  - Role defaults to `submitter` when omitted.
  - Duplicate email MUST be rejected with `409` behavior at API boundary.
- Relationships:
  - Source for auth token issuance (`UserAccount` -> `AuthToken` derived claim source).

## Entity: AuthToken (derived/runtime)
- Description: JWT token produced at successful login.
- Fields (claims):
  - `sub` (string, required): user id.
  - `role` (enum, required): user role.
  - `iat` (number, required): issued-at timestamp.
  - `exp` (number, required): expiry timestamp (`iat + 24h`).
- Validation rules:
  - Token MUST be signed with configured `JWT_SECRET`.
  - Expired, malformed, missing, or invalid tokens are unauthorized (`401`).

## Entity: AuthContext (request-scoped)
- Description: Verified auth state attached to a protected request.
- Fields:
  - `userId` (string, required)
  - `role` (enum, required)
  - `tokenExpiresAt` (datetime, required)
- Validation rules:
  - Exists only after successful JWT verification middleware.

## State Transitions

### UserAccount lifecycle
1. `not_exists` -> `registered`
   - Trigger: successful registration with unique email and valid input.
2. `registered` -> `registered` (no state change)
   - Trigger: successful login; token issued.

### AuthToken lifecycle
1. `issued` -> `valid`
   - Trigger: token accepted at protected endpoint before `exp`.
2. `issued|valid` -> `expired`
   - Trigger: current time greater than `exp`.
3. `issued|valid` -> `invalid`
   - Trigger: signature or format verification failure.

## Notes
- Logout is client-side token removal only in MVP; no server-side revocation state is modeled.

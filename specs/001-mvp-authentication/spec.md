# Feature Specification: MVP Authentication for InnovatEPAM Portal

**Feature Branch**: `001-mvp-authentication`  
**Created**: 2026-02-24  
**Status**: Draft  
**Input**: User description: "Implement MVP authentication for InnovatEPAM Portal. Users must be able to register and login. Each user has a role (submitter or admin). Duplicate emails must be rejected. Login must return a JWT token. Authentication will be required for protected endpoints."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Register New Account (Priority: P1)

As a new portal user, I can create an account with my email, password, and role so I can access the system.

**Why this priority**: Registration is the entry point for all users; without it no new user can start using the portal.

**Independent Test**: Can be fully tested by submitting valid and invalid registration requests and confirming account creation behavior and duplicate-email rejection.

**Acceptance Scenarios**:

1. **Given** an email that is not yet registered, **When** the user submits valid registration details with role `submitter`, **Then** the system creates the account and returns a successful registration response.
2. **Given** an email that is already registered, **When** a registration request is submitted with that same email, **Then** the system rejects the request with a duplicate-email error and does not create a second account.
3. **Given** a role outside the allowed values, **When** a registration request is submitted, **Then** the system rejects the request with a validation error.

---

### User Story 2 - Login and Receive Token (Priority: P2)

As a registered user, I can log in with my credentials and receive an authentication token so I can call protected features.

**Why this priority**: Login is required to activate existing accounts and enable authenticated usage.

**Independent Test**: Can be tested independently by logging in with valid and invalid credentials and checking token issuance behavior.

**Acceptance Scenarios**:

1. **Given** a registered user with valid credentials, **When** the user logs in, **Then** the system returns a JWT token associated with that user.
2. **Given** a registered user with an incorrect password, **When** the user logs in, **Then** the system rejects authentication and does not return a token.

---

### User Story 3 - Access Protected Endpoints (Priority: P3)

As an authenticated user, I can access protected endpoints with my token, and unauthenticated requests are blocked.

**Why this priority**: This enforces baseline security by ensuring only authenticated users can access protected resources.

**Independent Test**: Can be tested independently by calling a protected endpoint with no token, invalid token, and valid token.

**Acceptance Scenarios**:

1. **Given** a request with no authentication token, **When** the request targets a protected endpoint, **Then** access is denied.
2. **Given** a request with an invalid or expired token, **When** the request targets a protected endpoint, **Then** access is denied.
3. **Given** a request with a valid authentication token, **When** the request targets a protected endpoint, **Then** access is granted.

---

### Edge Cases
- Registration email differs only by case from an existing email.
- Registration requests omit required fields or include empty values.
- Login is attempted for an email that does not exist.
- Protected endpoint is called with a malformed token format.
- User role is missing during registration.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to register with email, password, and role.
- **FR-002**: System MUST accept only `submitter` and `admin` as valid roles during registration.
- **FR-003**: System MUST reject registration when the email is already in use.
- **FR-004**: System MUST provide a login capability using registered email and password.
- **FR-005**: System MUST return a JWT token on successful login.
- **FR-006**: System MUST deny login when credentials are invalid.
- **FR-007**: System MUST require authentication for protected endpoints.
- **FR-008**: System MUST grant protected-endpoint access only when a valid token is provided.
- **FR-009**: System MUST deny protected-endpoint access for missing, malformed, invalid, or expired tokens.
- **FR-010**: System MUST persist user account data required to support registration and login.

### Constitution Alignment Requirements

- **CAR-001**: Business-logic behavior in this feature MUST be covered by automated tests.
- **CAR-002**: Feature code MUST pass repository linting rules.
- **CAR-003**: Feature changes MUST preserve a minimum of 80% line coverage for business logic.
- **CAR-004**: Feature design MUST prevent repository secrets exposure (use env vars/secrets store).
- **CAR-005**: Implementation plan MUST describe meaningful commit slicing and message intent.

### Key Entities *(include if feature involves data)*

- **User Account**: Registered portal user identity with email, password credential data, role (`submitter` or `admin`), and account timestamps.
- **Authentication Token**: Signed token representing an authenticated session context, including user identity and token validity window.
- **Protected Request Context**: Request-level authentication state derived from token verification to determine authorization at protected endpoints.

## Clarifications / Decisions (MVP)

- **Auth**: JWT
- **Token expiry**: 24 hours
- **Password policy**: minimum 8 characters
- **Default role**: `submitter`
- **Duplicate email response**: `409`
- **Wrong login response**: `401`
- **Logout behavior**: client deletes token; no server-side token blacklist for MVP

## Out of Scope

- Password reset
- Email verification
- Account lockout

## Assumptions

- This feature covers MVP authentication only.
- Role is assigned at registration and not changed through this feature.
- At least one protected endpoint exists to validate authentication enforcement behavior.

## Dependencies

- Availability of persistent storage for user account records.
- Existing or planned protected endpoint(s) where authentication checks are applied.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 95% of valid registration requests complete successfully within 2 seconds under normal load.
- **SC-002**: 100% of duplicate-email registration attempts are rejected without creating a second account.
- **SC-003**: 95% of valid login attempts receive an authentication token within 2 seconds under normal load.
- **SC-004**: 100% of requests to protected endpoints without valid authentication are denied.
- **SC-005**: In UAT, at least 90% of test users complete register-then-login flow on first attempt without support.

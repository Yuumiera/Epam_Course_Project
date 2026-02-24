# Quickstart: MVP Authentication

## Prerequisites
- Node.js 18+
- npm

## 1) Install dependencies

```bash
npm install
npm install jsonwebtoken bcryptjs dotenv
npm install --save-dev jest supertest eslint
```

## 2) Configure environment
Create `.env` in project root:

```env
PORT=3000
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=24h
```

## 3) Start app

```bash
npm run dev
```

## 4) Register a user

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"StrongPass123"}'
```

Expected:
- `201` on success
- `409` if email already exists

## 5) Login and receive JWT

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"StrongPass123"}'
```

Expected:
- `200` with `token` and `expiresIn=24h`
- `401` for wrong credentials

## 6) Access protected endpoint

```bash
curl http://localhost:3000/protected/ping \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

Expected:
- `200` with user context for valid token
- `401` for missing/invalid/expired token

## 7) Run quality gates

```bash
npm run lint
npm test -- --coverage
```

Target:
- Lint passes
- >=80% line coverage for business-logic modules

## Notes
- Logout for MVP is client-side token deletion only.
- Out of scope: password reset, email verification, account lockout.

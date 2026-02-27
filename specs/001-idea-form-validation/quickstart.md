# Quickstart: Phase 2 Smart Idea Submission Form Improvements

## Prerequisites
- Node.js 18+
- npm
- `.env` configured with `DATABASE_URL` and `JWT_SECRET`

## Install and run
```bash
npm install
npm run prisma:push
npm run dev
```

## 1) Register and login
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"phase2_user@example.com","password":"password123","role":"submitter"}'

curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"phase2_user@example.com","password":"password123"}'
```
Save returned token as `TOKEN`.

## 2) Validate server-side rules

### Invalid title (too short)
```bash
curl -X POST http://localhost:3000/ideas \
  -H "Authorization: Bearer <TOKEN>" \
  -F "title=ab" \
  -F "description=This description is long enough to pass the minimum length." \
  -F "category=HR"
```
Expected: `400` with `fieldErrors.title`.

### Invalid description (too short)
```bash
curl -X POST http://localhost:3000/ideas \
  -H "Authorization: Bearer <TOKEN>" \
  -F "title=Valid Title" \
  -F "description=short" \
  -F "category=HR"
```
Expected: `400` with `fieldErrors.description`.

### Invalid category
```bash
curl -X POST http://localhost:3000/ideas \
  -H "Authorization: Bearer <TOKEN>" \
  -F "title=Valid Title" \
  -F "description=This description is long enough to pass minimum validation." \
  -F "category=InvalidCategory"
```
Expected: `400` with `fieldErrors.category`.

## 3) Verify successful submission
```bash
curl -X POST http://localhost:3000/ideas \
  -H "Authorization: Bearer <TOKEN>" \
  -F "title=Validated Idea Title" \
  -F "description=This is a sufficiently long description that passes validation rules." \
  -F "category=Technology"
```
Expected: `201` with created idea JSON.

## 4) Verify frontend behavior
1. Open app at `http://localhost:3000` and login.
2. In Create Idea form, enter invalid data and confirm inline messages appear.
3. Confirm submit button stays disabled while form is invalid.
4. Correct fields and confirm submit becomes enabled.
5. Trigger a server-side failure (e.g., invalid category via devtools) and verify mapped inline field errors.

## 5) Run tests
```bash
npm test
```

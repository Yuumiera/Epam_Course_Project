# Quickstart: Blind Review Identity Masking

## Prerequisites
- Node.js 18+
- npm
- Existing submitter and admin accounts

## Run
```bash
npm install
npm run prisma:push
npm run dev
```

## 1) Create idea as submitter
```bash
curl -X POST http://localhost:3000/ideas \
  -H "Authorization: Bearer <SUBMITTER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Blind review candidate",
    "description": "Idea to validate response identity masking behavior.",
    "category": "Process"
  }'
```
Expected: `201`.

## 2) Verify admin review response masks creator identity
```bash
curl -X GET http://localhost:3000/ideas/<IDEA_ID> \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```
Expected: `200` with review data present and creator identity fields absent.

## 3) Verify submitter personal view retains own identity
```bash
curl -X GET http://localhost:3000/ideas/<IDEA_ID> \
  -H "Authorization: Bearer <SUBMITTER_TOKEN>"
```
Expected: `200` and creator identity fields available in submitter personal context.

## 4) Verify evaluation endpoint still works under masking
```bash
curl -X PATCH http://localhost:3000/ideas/<IDEA_ID>/status \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"status":"under_review","comment":"Blind review check"}'
```
Expected: valid transition behavior unchanged and no creator identity leakage in response.

## 5) UI verification
1. Log in as admin and open review list/detail.
2. Confirm submitter identity is not visible.
3. Log in as submitter and open own idea view.
4. Confirm own identity remains visible.

## 6) Tests
```bash
npm test -- evaluation.test.js
npm test -- ideas.test.js
npm test
```

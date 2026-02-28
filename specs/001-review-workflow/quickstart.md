# Quickstart: Multi-Stage Review Workflow

## Prerequisites
- Node.js 18+
- npm
- Local DB setup available
- At least one `submitter` and one `admin` user

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
    "title": "Review workflow candidate",
    "description": "Idea prepared for staged evaluation flow verification.",
    "category": "Technology"
  }'
```
Expected: `201` with initial status `submitted`.

## 2) Valid admin transitions

### submitted -> under_review
```bash
curl -X PATCH http://localhost:3000/ideas/<IDEA_ID>/status \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"status":"under_review","comment":"Initial triage complete"}'
```
Expected: `200`.

### under_review -> approved_for_final
```bash
curl -X PATCH http://localhost:3000/ideas/<IDEA_ID>/status \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"status":"approved_for_final","comment":"Meets final criteria"}'
```
Expected: `200`.

### approved_for_final -> accepted (or rejected)
```bash
curl -X PATCH http://localhost:3000/ideas/<IDEA_ID>/status \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"status":"accepted","comment":"Approved for implementation"}'
```
Expected: `200`.

## 3) Verify invalid transition rejection
```bash
curl -X PATCH http://localhost:3000/ideas/<IDEA_ID>/status \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"status":"accepted","comment":"Trying to skip stages"}'
```
Expected: non-success response because transition from current state is disallowed.

## 4) Verify non-admin cannot transition
```bash
curl -X PATCH http://localhost:3000/ideas/<IDEA_ID>/status \
  -H "Authorization: Bearer <SUBMITTER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"status":"under_review"}'
```
Expected: forbidden response.

## 5) Verify history timeline in UI
1. Open app and log in.
2. Open the transitioned idea in detail panel.
3. Confirm timeline entries are shown chronologically.
4. Confirm each entry includes status, reviewer id, timestamp, and comment (when present).

## 6) Test
```bash
npm test -- evaluation.test.js
npm test
```

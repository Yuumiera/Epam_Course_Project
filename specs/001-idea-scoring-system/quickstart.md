# Quickstart: Idea Scoring System

## Prerequisites
- Node.js 18+
- npm
- Existing authenticated admin and submitter accounts

## Run
```bash
npm install
npm run prisma:push
npm run dev
```

## 1) Admin scores an idea
```bash
curl -X PATCH http://localhost:3000/ideas/<IDEA_ID>/score \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"impact":5,"feasibility":4,"innovation":5}'
```
Expected:
- `200` response
- persisted criterion values and computed total score (`4.67` for this example)

## 2) Verify score validation
```bash
curl -X PATCH http://localhost:3000/ideas/<IDEA_ID>/score \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"impact":6,"feasibility":4,"innovation":5}'
```
Expected:
- `400` validation error for out-of-range criterion

## 3) Fetch ranked ideas
```bash
curl -X GET http://localhost:3000/ideas/ranked \
  -H "Authorization: Bearer <TOKEN>"
```
Expected:
- ideas sorted by total score descending
- each item contains impact, feasibility, innovation, total score, and rank

## 4) UI verification
1. Log in as admin and score multiple ideas.
2. Open ranking view and confirm each idea shows criterion breakdown.
3. Confirm ideas are ordered by total score and rank labels are visible.

## 5) Tests
```bash
npm test -- ideas.test.js
npm test -- evaluation.test.js
npm test
```

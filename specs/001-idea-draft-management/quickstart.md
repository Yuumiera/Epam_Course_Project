# Quickstart: Idea Draft Management

## Prerequisites
- Node.js 18+
- npm
- Local environment configured for DB and auth secret

## Run
```bash
npm install
npm run prisma:push
npm run dev
```

## 1) Register and login (submitter)
- Create/login a submitter account and capture bearer token.

## 2) Create draft
```bash
curl -X POST http://localhost:3000/ideas \
  -H "Authorization: Bearer <TOKEN_A>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Draft idea",
    "description": "Long enough description for validation rules in this project.",
    "category": "Technology",
    "status": "draft"
  }'
```
Expected: `201` with `status: "draft"`.

## 3) Update own draft
```bash
curl -X PATCH http://localhost:3000/ideas/<IDEA_ID> \
  -H "Authorization: Bearer <TOKEN_A>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Draft idea v2",
    "description": "Updated description that still satisfies validation constraints.",
    "category": "Technology"
  }'
```
Expected: `200`; idea remains `status: "draft"`.

## 4) Verify non-owner cannot view/update draft
- Login as submitter B (`<TOKEN_B>`).
- `GET /ideas` must not include submitter A draft.
- `PATCH /ideas/<IDEA_ID>` and `PATCH /ideas/<IDEA_ID>/submit` with `<TOKEN_B>` must fail (deny/not-found based on API behavior).

## 5) Submit own draft
```bash
curl -X PATCH http://localhost:3000/ideas/<IDEA_ID>/submit \
  -H "Authorization: Bearer <TOKEN_A>"
```
Expected: `200` with `status: "submitted"`.

## 6) Verify invalid transition handling
```bash
curl -X PATCH http://localhost:3000/ideas/<IDEA_ID>/submit \
  -H "Authorization: Bearer <TOKEN_A>"
```
Expected: failure because idea is no longer in `draft` status.

## 7) Test
```bash
npm test -- ideas.test.js
```

# Quickstart: MVP Idea Evaluation Workflow

## Prerequisites
- Node.js 18+
- npm

## Install and run
```bash
npm install
npm run dev
```

Server runs on http://localhost:3000.

## 1) Register users
### Register submitter
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"submitter@example.com","password":"password123","role":"submitter"}'
```

### Register admin
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123","role":"admin"}'
```

## 2) Login and capture tokens
### Submitter token
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"submitter@example.com","password":"password123"}'
```

### Admin token
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'
```

## 3) Create idea (submitter)
```bash
curl -X POST http://localhost:3000/ideas \
  -H "Authorization: Bearer <SUBMITTER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Skill Matrix","description":"Track capability growth","category":"People"}'
```
Copy returned `id`.

## 4) Evaluate idea (admin)
```bash
curl -X PATCH http://localhost:3000/ideas/<IDEA_ID>/status \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"status":"under_review","comment":"Needs estimation"}'
```
Expected: `200` JSON including updated `id`, `status`, `comment`.

## 5) Negative checks
### Non-admin update should fail
```bash
curl -X PATCH http://localhost:3000/ideas/<IDEA_ID>/status \
  -H "Authorization: Bearer <SUBMITTER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"status":"accepted"}'
```
Expected: `403` JSON error.

### Invalid status should fail
```bash
curl -X PATCH http://localhost:3000/ideas/<IDEA_ID>/status \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"status":"done"}'
```
Expected: `400` JSON error.

## 6) Run tests
```bash
npm test
```

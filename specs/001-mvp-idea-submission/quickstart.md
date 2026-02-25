# Quickstart: MVP Idea Submission

## Prerequisites
- Node.js 18+
- npm

## Install dependencies
```bash
npm install
```

## Run the API
```bash
npm run dev
```

Server starts at `http://localhost:3000`.

## Auth setup (for create endpoint)
1. Register a user:
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Pass123!","role":"submitter"}'
```
2. Login and capture token:
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Pass123!"}'
```

## Create an idea (authenticated)
```bash
curl -X POST http://localhost:3000/ideas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"title":"Smart Onboarding","description":"Guided onboarding checklist","category":"HR"}'
```
Expected result: `201 Created` with idea JSON including `status: "submitted"`.

## List ideas
```bash
curl http://localhost:3000/ideas
```
Expected result: `200 OK` with JSON array.

## Get idea by ID
```bash
curl http://localhost:3000/ideas/<IDEA_ID>
```
Expected result: `200 OK` if found, `404` JSON error if missing.

## Run tests
```bash
npm test
```

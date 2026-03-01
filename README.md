# InnovatEPAM Portal

InnovatEPAM Portal is a full-stack idea management app built with Node.js, Express, Prisma, and SQLite. It supports authenticated idea submission, admin review/scoring, attachment handling, and a dashboard-style frontend with profile/session view.

## Current Capabilities

- JWT auth with role-based access (`submitter`, `admin`)
- Register/login flows with display name support
- Dashboard sections: Overview, Create, Ideas, Detail, Admin, Profile
- Idea lifecycle with draft support (`draft` -> `submitted`)
- Admin review transitions (`submitted` -> `under_review` -> `approved_for_final` -> `accepted|rejected`)
- Admin scoring (impact/feasibility/innovation, 1-5 each, total score + ranking)
- Single attachment upload/download per idea (PDF/JPG/PNG)
- Evaluation history tracking with reviewer email enrichment

## Tech Stack

- Node.js + Express
- Prisma ORM + SQLite
- JWT (`jsonwebtoken`) + `bcrypt`
- `multer` for attachments
- Jest + Supertest for integration tests
- Vanilla HTML/CSS/JS frontend

## Getting Started

1. Install dependencies

```bash
npm install
```

2. Create `.env` in project root

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key"
```

3. Sync database schema

```bash
npm run prisma:push
```

4. (Optional) Regenerate Prisma client

```bash
npm run prisma:generate
```

## Run

- Development

```bash
npm run dev
```

- Production-like

```bash
npm start
```

Default app URL: `http://localhost:3000`

## Tests

Run all tests:

```bash
npm test
```

Latest verified result:
- `4/4` suites passed
- `45/45` tests passed

Note: on Windows you may occasionally see a Prisma engine `EPERM` rename warning during `pretest`; rerunning usually resolves it.

## API Endpoints (Core)

### Auth
- `POST /auth/register`
- `POST /auth/login`
- `PATCH /auth/profile/avatar` (auth)

### Ideas
- `POST /ideas` (auth)
- `GET /ideas` (auth)
- `GET /ideas/ranked` (auth)
- `GET /ideas/:id` (auth)
- `GET /ideas/:id/attachment` (auth)
- `PATCH /ideas/:id` (auth, owner draft edit)
- `PUT /ideas/:id` (auth, owner draft edit)
- `PATCH /ideas/:id/submit` (auth, owner)
- `PATCH /ideas/:id/status` (auth + admin)
- `PATCH /ideas/:id/score` (auth + admin)

## App Routes

- `/login`
- `/register`
- `/dashboard`
- `/profile`

## Project Structure

```text
public/
	index.html
	style.css
	app.js

src/
	app.js
	server.js
	lib/
		prisma.js
	middlewares/
		auth.js
		upload.js
	routes/
		auth.js
		ideas.js
	services/
		authService.js
	store/
		ideaStore.js
		userStore.js

prisma/
	schema.prisma

tests/
	smoke.test.js
	auth.test.js
	ideas.test.js
	evaluation.test.js
```
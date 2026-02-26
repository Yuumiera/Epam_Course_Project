# InnovatEPAM Portal (MVP)

An MVP idea portal built with Node.js + Express. The application includes JWT authentication, idea submission, single-file attachment upload/download, and an admin evaluation workflow.

## Features

- User registration/login (`submitter`, `admin` roles)
- JWT-protected endpoint access
- Idea creation, listing, and detail view
- Single-file attachment upload and download
- Admin idea status evaluation (`under_review`, `accepted`, `rejected`)
- Jest + Supertest integration tests

## Tech Stack

- Node.js + Express
- SQLite + Prisma ORM
- JWT (`jsonwebtoken`) + `bcrypt`
- `multer` (file uploads)
- Jest + Supertest

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file at the project root:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key"
```

3. Apply the database schema:

```bash
npm run prisma:push
```

4. Generate Prisma client (optional, when needed):

```bash
npm run prisma:generate
```

## Run

Development mode:

```bash
npm run dev
```

Production-like mode:

```bash
npm start
```

The server runs on `http://localhost:3000` by default.

## Tests

```bash
npm test
```

Note: `pretest` automatically runs `prisma db push --skip-generate`.

## Main API Endpoints

### Auth
- `POST /auth/register`
- `POST /auth/login`

### Ideas
- `POST /ideas` (auth)
- `GET /ideas` (auth)
- `GET /ideas/:id` (auth)
- `GET /ideas/:id/attachment` (auth)
- `PATCH /ideas/:id/status` (auth + admin)

## Project Structure

```text
src/
	app.js
	server.js
	lib/prisma.js
	middlewares/
		auth.js
		upload.js
	routes/
		auth.js
		ideas.js
	services/
		authService.js
	store/
		userStore.js
		ideaStore.js

prisma/
	schema.prisma

tests/
	auth.test.js
	ideas.test.js
	evaluation.test.js
	smoke.test.js
```
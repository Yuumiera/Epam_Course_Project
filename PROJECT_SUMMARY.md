# Project Summary - InnovatEPAM Portal

## Overview
InnovatEPAM Portal is a full-stack web application for collecting, reviewing, and scoring innovation ideas. The project now includes an interactive dashboard UX, role-based evaluation workflow, draft handling, and attachment support, backed by tested Express + Prisma APIs.

## Scope Delivered

### Core Product Features
- [x] Authentication and authorization (JWT, `submitter`/`admin` roles)
- [x] Registration/login with profile display name support
- [x] Idea creation with validation
- [x] Draft idea save/edit/submit flow
- [x] Ranked ideas listing and detail pages
- [x] Attachment upload/download (single file)
- [x] Admin status transitions with guarded review stages
- [x] Admin scoring (impact, feasibility, innovation) with total score calculation
- [x] Evaluation history timeline with reviewer context

### Frontend UX Enhancements
- [x] Multi-section dashboard layout (Overview/Create/Ideas/Detail/Admin/Profile)
- [x] Overview metrics cards and quick actions
- [x] Star-based scoring interaction on admin panel
- [x] Profile section with session information and logout flow
- [x] Consistent black/cyan branded heading style across auth and dashboard areas

## Technical Stack
- **Backend**: Node.js, Express
- **Database**: SQLite + Prisma ORM
- **Security/Auth**: JWT bearer token, bcrypt password hashing
- **File Uploads**: multer
- **Frontend**: Vanilla HTML/CSS/JS (SPA-like section switching)
- **Testing**: Jest + Supertest

## Quality Status
- Full automated test run is passing: `4/4` suites, `45/45` tests.
- Main covered flows: auth, idea CRUD flow, evaluation transitions/scoring, smoke checks.

## Working Process Reflection

### Progression
The project evolved from a baseline MVP into a more complete product-style flow with stronger UI guidance, clearer role behavior, and richer evaluation mechanics.

### Delivery Approach
Spec-driven implementation (under `specs/`) plus frequent incremental verification enabled quick iteration while keeping behavior stable.

### Key Learning
Small, test-backed increments combined with clear feature specs made it easier to refine UX repeatedly without breaking core business logic.

---
**Author**: Sıla Akkaya  
**Date**: March 1, 2026  
**Course**: A201 - Beyond Vibe Coding

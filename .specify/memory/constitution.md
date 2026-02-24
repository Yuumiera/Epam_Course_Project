<!--
Sync Impact Report
- Version change: template-placeholder-version → 1.0.0
- Modified principles:
	- template-placeholder-principle-1 → I. Type Safety by Stack
	- template-placeholder-principle-2 → II. Linting is Mandatory
	- template-placeholder-principle-3 → III. Tests for Business Logic (NON-NEGOTIABLE)
	- template-placeholder-principle-4 → IV. Coverage Gate
	- template-placeholder-principle-5 → V. Commit & Security Hygiene
- Added sections:
	- Engineering Standards
	- Delivery Workflow
- Removed sections:
	- None
- Templates requiring updates:
	- ✅ updated: .specify/templates/plan-template.md
	- ✅ updated: .specify/templates/spec-template.md
	- ✅ updated: .specify/templates/tasks-template.md
	- ⚠ pending: .specify/templates/commands/*.md (directory not present)
	- ✅ reviewed: README.md (no principle references requiring change)
- Follow-up TODOs:
	- TODO(COMMAND_TEMPLATES): If command templates are later added, align them with this constitution.
-->

# EPAM Course Project Constitution

## Core Principles

### I. Type Safety by Stack
TypeScript projects MUST enable strict mode (`"strict": true`). JavaScript-only projects are exempt
from TypeScript strict mode, but business-logic modules SHOULD use clear input/output contracts and
JSDoc where ambiguity exists.
Rationale: enforce correctness without imposing TypeScript-only constraints on JavaScript repos.

### II. Linting is Mandatory
All production code MUST pass configured lint checks before merge. Lint warnings that indicate
correctness, security, or maintainability risks MUST be resolved, not ignored.
Rationale: consistent code quality and early defect detection.

### III. Tests for Business Logic (NON-NEGOTIABLE)
Any change that adds or modifies business logic MUST include automated tests covering expected
behavior and critical edge cases. Test omission is allowed only for non-executable assets (for
example, documentation) and MUST be justified in the plan.
Rationale: prevent regressions in user-visible and rules-based behavior.

### IV. Coverage Gate
Repository-wide automated test coverage for business-logic code MUST remain at or above 80% lines.
Any temporary exception MUST be time-boxed, approved in review, and tracked with a follow-up task.
Rationale: sustain confidence in change safety over time.

### V. Commit & Security Hygiene
Commits MUST be meaningful, scoped, and descriptive of intent (what changed and why). Secrets
(keys, tokens, passwords, private certs) MUST NOT be committed to the repository; secret scanning
or equivalent checks MUST be enabled in CI where available.
Rationale: preserve traceability and reduce security exposure.

## Engineering Standards

- Keep implementation minimal and dependency usage intentional.
- Enforce environment-variable based configuration for sensitive runtime settings.
- Add or update lint/test scripts when introducing new tools so quality gates are runnable locally.

## Delivery Workflow

1. Define scope in spec with explicit acceptance scenarios.
2. Pass Constitution Check in plan before implementation begins.
3. Implement in small commits that keep code reviewable and reversible.
4. Before merge, verify lint, tests, and coverage gates are passing.

## Governance

This constitution is authoritative for delivery standards in this repository.
Amendments require: (a) documented proposal, (b) explicit update to affected templates,
and (c) acknowledgment in review.

Versioning policy:
- MAJOR: incompatible governance changes or principle removals/redefinitions.
- MINOR: new principle/section or materially expanded guidance.
- PATCH: clarifications, wording improvements, and typo-only refinements.

Compliance review expectations:
- Every PR review MUST check linting, test presence for business logic, coverage threshold,
  commit quality, and secret safety.
- Violations MUST be resolved before merge or tracked as an explicit, approved exception.

**Version**: 1.0.0 | **Ratified**: 2026-02-24 | **Last Amended**: 2026-02-24

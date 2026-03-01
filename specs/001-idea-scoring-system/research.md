# Phase 0 Research: Idea Scoring System

## Decision 1: Score model uses three explicit criteria
- Decision: Use separate criterion fields for impact, feasibility, and innovation, each constrained to 1-5.
- Rationale: Keeps scoring transparent and directly supports UI breakdown requirements.
- Alternatives considered:
  - Single overall score only: rejected because criterion breakdown is required.
  - Free-form weighted criteria: rejected due to ambiguity and inconsistent scoring.

## Decision 2: Total score is persisted
- Decision: Compute total score from criteria and store it with idea scoring data.
- Rationale: Enables fast ranked retrieval and stable ordering behavior.
- Alternatives considered:
  - Compute total only at read time: rejected to avoid repeated recomputation and drift risk.

## Decision 3: Ranked list is a dedicated endpoint
- Decision: Add an endpoint focused on returning ideas sorted by total score descending.
- Rationale: Keeps ranking intent explicit and avoids overloading generic list behavior.
- Alternatives considered:
  - Add optional sorting to existing list only: rejected to keep API contract clear and predictable.

## Decision 4: Deterministic tie handling
- Decision: For equal totals, apply a stable secondary order to ensure deterministic output.
- Rationale: Prevents inconsistent rank display across repeated requests.
- Alternatives considered:
  - Leave ties unordered: rejected due to unstable UI ranking and flaky tests.

## Decision 5: UI displays ranking + criterion breakdown
- Decision: Show rank number, impact, feasibility, innovation, and total score per idea in ranking view.
- Rationale: Aligns with requirement for explainable ordering.
- Alternatives considered:
  - Show only total + rank: rejected because criterion-level visibility is explicitly required.

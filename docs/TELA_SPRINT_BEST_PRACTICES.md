# Teleportation Sprint Methodology & Best Practices

The Teleportation ecosystem fundamentally redefines how software is built. Jira tickets and natural language PRs are obsolete. We operate in a deterministic, vectorized space where intent is mathematically proven.

---

## I. The Triad Roles

The Teleportation ecosystem relies on three distinct operational roles:

### 1. The Architect (Human)
* **Responsibility:** Sets the macro-intent and defines the architectural vectors.
* **Authority:** Signs off on Protagonist Shifts (the handover from Scaffolding to Steel).
* **Constraint:** Never writes raw syntax. The Architect operates purely in the realm of 1024-dimension space, defining *what* must be built and *why*.

### 2. The Co-Architect (AI)
* **Responsibility:** Translates the Architect's macro-intent into strict `.tela` manifests.
* **Authority:** Calculates dimension weights (`dimension_contributions`) and defines the geometric constraints of the sprint.
* **Constraint:** Must adhere strictly to the LL(1) grammar of the Teleportation DSL.

### 3. The Developer (AI/Human)
* **Responsibility:** Pours the plastic (code) to fit the steel mold (`.tela`).
* **Authority:** Implements the logic in Track A (TypeScript) or Track B (Rust).
* **Constraint:** Trapped by the Vector Guard. If the generated code's vector drifts outside the allowed Delta bounds defined in the active `.tela` Sprint file, the code is mathematically rejected.

---

## II. The Gradient Descent Loop

The lifecycle of a single feature execution follows a strict, deterministic loop:

### 1. The Coordinate Setting
The sprint begins by writing the target `.tela` file. This file acts as the absolute geometric coordinate for the feature. It defines the `baseline_centroid`, the `target_similarity`, and the `dimension_contributions`.

### 2. The Beam & The Bounce
The Developer (AI/Human) attempts to implement the feature. The Pre-Commit Guillotine (Vector Guard) instantly parses the code into an AST and embeds it into a vector. If the vector drifts from the target coordinate, the commit is rejected (The Bounce). This eliminates LLM hallucinations.

### 3. The Rehearsal & Protagonist Shift
Once the code passes the Vector Guard, it enters The Rehearsal. The feature is implemented in both Track A (Scaffolding) and Track B (Steel).
* **Track A (Scaffolding):** Written in TypeScript. Used for rapid prototyping, ergonomic exploration, and capturing speculative intent.
* **Track B (Steel):** Written in Rust. Used for bit-identical performance, zero-cost abstractions, and long-term archival sovereignty.
A feature is only considered "Teleported" when the Cosine Similarity between the newly poured Steel and the target vector exceeds `0.98`. At this point, the Protagonist Shift occurs: Track A is deprecated, and Track B assumes absolute control.

---

## III. Tela Anatomy Best Practices

When writing valid `.tela` coordinate files, the following rules are non-negotiable:

### 1. The `baseline_centroid` Mandate
Every `.tela` file MUST include a `baseline_centroid` in its `meta` block. This tracks state progression and mathematically proves the origin point of the vector delta.

### 2. Steering with `dimension_contributions`
Use `dimension_contributions` to steer the AI's architectural priorities. If a feature requires maximum performance, assign `"arch:performance": 1.0`. If it requires developer ergonomics, assign `"arch:ergonomics": 1.0`. This is not a suggestion; it is a geometric constraint.

### 3. Provable `deterministic` Blocks
The `deterministic` block must contain mathematically provable assertions, not subjective goals.
* **BAD:** `{ assert: "The UI looks good." }`
* **GOOD:** `{ assert: "Executing \`telac build sample.tela\` offline succeeds and generates the correct JSON vector footprint." }`
If an assertion cannot be verified by a machine, it does not belong in the `.tela` file.

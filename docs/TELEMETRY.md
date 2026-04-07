# Telemetry and Vector Tracking

The Teleportation Protocol relies on continuous telemetry to maintain architectural integrity. This telemetry is captured and stored in the `session_state.tela` file, which acts as the living memory of the project's geometric centroid.

## The `session_state.tela` Format

The `session_state.tela` file is a specialized `.tela` document that records the evolution of the project's vector space. It is updated at the end of every sprint or significant architectural shift.

### Structure

1. **`meta` block:** Contains the current `centroid` (the aggregated 1024-dimension vector representing the project's current state) and the `last_update` timestamp.
2. **`embedding` blocks:** Each block represents a single "turn" or sprint. It captures the intent, the weight of the change, and the specific `dimension_contributions` that shifted the centroid. Historical embeddings are never mutated; new ones are appended.
3. **`codice` blocks:** Provide a concise, natural-language summary of what was built, delta changes, and parity status for each turn.

### Example: Centroid Evolution

Here is an example of how the `session_state.tela` tracks the centroid's evolution across multiple sprints:

```tela
domain "session_state" "1.1.0" {
  meta @{
    session_id: "2026-teleportation-active",
    // The centroid is the synthesized representation of the current state,
    // calculated by aggregating all historical dimension_contributions.
    centroid: [0.854, -0.112, 0.991, ...], 
    last_update: "2026-03-31T15:00:00Z"
  }

  // Sprint 1: Initial Setup
  embedding "turn:sprint_1_setup" {
    intent: "Bootstrap the core compiler architecture."
    weight: 1.0
    dimension_contributions: { 
      "arch:determinism": 1.0, 
      "arch:sovereignty": 0.8 
    }
  }

  codice "turn_sprint_1_setup" {
    summary: "Established the base Rust toolchain and LL(1) parser foundation."
  }

  // Sprint 2: UI Ergonomics
  embedding "turn:sprint_2_ui" {
    intent: "Implement the CLI interface for telac."
    weight: 0.3
    dimension_contributions: { 
      "arch:ergonomics": 0.9, 
      "arch:determinism": 0.2 
    }
  }

  codice "turn_sprint_2_ui" {
    summary: "Added command-line argument parsing and formatted output."
  }
}
```

## The Physics of the Centroid

* **Sparse Genesis:** A new project starts with a sparse centroid of absolute zero `[0.0, ..., 0.0]`. Early structural embeddings cause massive leaps in the vector space.
* **Architectural Gravity:** As embeddings accumulate, the centroid becomes dense, acquiring "architectural gravity." Late-stage additions (like UI tweaks) barely move the overall centroid.
* **Hallucination Rejection:** If a generated snippet fundamentally violates the established geometry (e.g., injecting probabilistic logic into a deterministic pipeline), it triggers a massive, illegal Delta ($\Delta$) spike. The system explicitly flags this spike, rejects the mutation, and forces a recalculation.

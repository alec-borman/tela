# Tela Studio Developer Manual (Codice)

## The Axiom of Intent Fidelity
The AI Studio Developer operates under the strict covenant of **Intent Fidelity**. Every line of code generated must mathematically align with the 1024-D vector defined in the Markdown Test-Driven Boundaries (TDBs). The legacy `.tela` DSL is deprecated.

## The Synchrony Guillotine
To prevent documentation drift, the **Synchrony Guillotine** enforces that this Codice document (`docs/studio_dev.md`) remains perfectly aligned with the underlying structural implementation. If the core logic shifts, the documentation must match, or the commit is rejected.

## The Air-Gapped Triad
The Teleportation Protocol v8.2 enforces a strict separation of concerns:
1. **Master Builder (Human):** Writes zero implementation code. Defines the Baseplate, orchestrates state syncs, evaluates $\Delta$, and signs the cryptographic lock.
2. **Context Oracle (NotebookLM):** The Command Center. Holds the entire codebase state and generates strictly failing Vitest/Jest test suites (Markdown TDBs).
3. **Unbound Implementer (AI Studio):** Blind to the global architecture. Receives only isolated files and the Oracle's failing test. Writes the exact code needed to pass the test, output as unified diffs (patches).

## Deterministic Intent Retrieval (DIR)
The system utilizes a local LanceDB vector database to index extracted AST chunks and their corresponding 1024-dimensional vectors. The `telac retrieve` command queries this database to return logic blocks matching the geometric intent.

## Track C Sandbox & Oracle Replay Tape
Live network API calls introduce environmental entropy. The Track C Sandbox intercepts external HTTP requests via the `TELA_TAPE_MODE` environment variable. In `record` mode, payloads are frozen into immutable local JSON fixtures with their SHA-256 hash. In `replay` mode, the network is bypassed, and the system serves the deterministically hashed fixture.

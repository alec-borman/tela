# The Architecture of Intent: A Human's Guide to the Teleportation Protocol v8.2

## Preface: The Trillion-Dollar Steering Wheel
For the first fifty years of software engineering, humans communicated with machines by memorizing the machine's native syntax. We wrote `for` loops, managed memory pointers, and built massive, brittle lexers. 

When Large Language Models arrived, the industry made a catastrophic assumption: they assumed that because the machine could finally understand natural English, we should just talk to it like a human. This resulted in probabilistic drift, hallucinations, and spaghetti code. 

The Teleportation Protocol v8.2 discards both paradigms. It acknowledges that the AI is not a human conversationalist, nor is it a dumb syntax-evaluator. **It is a Semantic Compiler.** When you read a Test-Driven Boundary (TDB), you are not reading a list of instructions. You are reading a **1024-dimension geometric coordinate** that mathematically forces the AI to output deterministic software. Here is how to read the Matrix.

---

## Current Status

The Teleportation Protocol v8.2 is fully operational and actively used to build real software. We have deprecated the legacy `.tela` DSL in favor of standard Markdown Test-Driven Boundaries (TDBs).

**Working Components:**
* **`telac` (Teleportation Compiler):** Parses code chunks, computes 1024-dimension vectors, and generates cryptographic fingerprints.
* **VectorGuard & Gatekeeper CI:** Automated GitHub Actions workflows that intercept Pull Requests, calculate the Vector Delta ($\Delta$), and enforce architectural parity.
* **LanceDB DIR Engine:** Deterministic Intent Retrieval (DIR) using a local LanceDB vector database to index extracted AST chunks.
* **Track C Sandbox & Oracle Replay Tape:** Eliminates environmental entropy from live network API calls by recording and replaying payloads deterministically.

---

## Chapter 1: The Markdown TDB (The GPS Coordinate)

Every intent is now written as a Markdown TDB containing four strict sections:

1. **Contextual Brief:** The high-level objective and architectural context.
2. **Scope:** The exact list of files the Implementer is allowed to touch.
3. **Acceptance Criteria:** Verifiable constraints and requirements.
4. **Failsafe Test:** A strictly failing Vitest/Jest test suite that defines the exact functional requirements.

When reading a TDB, do not look at it as a description; look at it as the physical constraints of the execution environment.

---

## Chapter 2: Deterministic Intent Retrieval (DIR)

At the scale of 50,000+ lines of code, traditional keyword-based Retrieval-Augmented Generation (RAG) bloats the context window with semantic noise. We transition to Deterministic Intent Retrieval (DIR). 

The system utilizes a local LanceDB vector database to index extracted AST chunks and their corresponding 1024-dimensional vectors. The `telac retrieve` command queries this database and returns only the logic blocks that match the specific Geometric DNA of the target vector above a defined threshold.

---

## Chapter 3: The Track C Sandbox & Oracle Replay Tape

Live network API calls introduce environmental entropy that destroys mathematical testing determinism. The architecture implements the Track C Sandbox and Oracle Replay Tape. 

Any external HTTP request made by the toolchain must be interceptable via a `TELA_TAPE_MODE` environment variable. 
- When set to `record`, payloads are frozen into an immutable local JSON fixture along with their SHA-256 hash. 
- When set to `replay`, the network is bypassed entirely, and the system serves the deterministically hashed fixture.

---

## Chapter 4: The Deterministic `telac` CLI Commands

The `telac` CLI provides the following deterministic commands:

* **`telac build`**: Computes the target vector and fingerprint for a given domain.
* **`telac delta`**: Calculates the Vector Delta ($\Delta$) between the target vector and the current codebase vector. Enforces architectural parity.
* **`telac code-vector`**: Generates the 1024-dimensional vector for the current codebase.
* **`telac retrieve`**: Queries the LanceDB DIR engine to find code chunks matching the geometric intent.
* **`telac sustain`**: Evaluates the financial health and sustainability covenant.
* **`telac drop-test`**: Subjects the parser and compiler to adversarial structural anomalies to ensure robustness.
* **`telac lock`**: Cryptographically finalizes the build by signing the Merkle tree root and verifying $\Delta = 0$.
* **`telac verify`**: Verifies the source code against a generated lockfile signature.

---

## The Human Mindset Shift

To successfully operate the Teleportation Protocol v8.2, the human architect must adopt the **Black Box Mindset**:

1.  **Stop caring about syntax.** You do not need to know the specific regex the AI used to parse a string in Rust. You only need to know that the TDB demanded an LL(1) strict grammar.
2.  **Think in Systems, not Scripts.** You are acting as the City Planner. You zone the residential areas, you lay the water pipes, and you define the gravity. The AI builds the actual houses.
3.  **The Test is the Reality.** If a feature exists in the codebase but is not mathematically accounted for in a Failsafe Test, it is a rogue mutation and must be excised. The TDB is the absolute, sovereign System of Record.

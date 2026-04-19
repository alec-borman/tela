<div align="center">
  <h1>🌌 T E L A</h1>
  <h3>The Geometric Physics Engine for Immortal Code</h3>
  <p><strong>Teleportation Protocol v8.2 · Zero‑Touch v12.0</strong></p>

  [![Status: Sovereign Steel](https://img.shields.io/badge/Status-Sovereign_Steel-emerald.svg)](#)
  [![Protocol: Zero‑Touch 12.0](https://img.shields.io/badge/Protocol-Zero--Touch_v12.0-blue.svg)](#)
  [![Vector Engine: LanceDB](https://img.shields.io/badge/Vector_Engine-LanceDB_DIR-purple.svg)](#)
  [![License: MIT](https://img.shields.io/badge/License-MIT-gray.svg)](#)
</div>

---

> **I don't write code. I define the gravity, and let AI pour the concrete. This is the steering wheel for the trillion‑dollar software factory.**

## The Lazy Genius Workflow (How I Actually Use This)

Let's be honest. The original Tela documentation described a rigorous, militaristic process with an Air‑Gapped Triad—Master Builder, Context Oracle, Unbound Implementer. It sounded like you needed a PhD in computational geometry just to fix a button.

**I don't do any of that hard stuff.** I'm lazy. I'm the inventor. And my actual workflow looks like this:

1. **I have a vision.** I want to add a new feature to Tenuto Studio. For example: *"When a user drags the right edge of a note block on the canvas, the underlying Tenuto source code should deterministically update its duration token (e.g., `:4` → `:4.`)."*

2. **I open NotebookLM.** I've already loaded the entire 50‑page **Tenuto Studio 5.0.0 Canonical Specification** (the "target vector") as a source. NotebookLM is my Oracle.

3. **I ask the Oracle:** *"Generate the Test‑Driven Boundary (TDB) for the Topological Mutator—bi‑directional duration resizing."*

4. **The Oracle outputs a Markdown TDB.** It includes:
   - A **Contextual Brief** describing the exact feature.
   - **Scope** (which files to create/edit).
   - **Acceptance Criteria** in plain English.
   - A **Failsafe Test** written in Vitest with strict assertions.
   - Optional **YAML architectural constraints**.

5. **I copy that entire TDB into `sprint_target.md`** inside my local Tenuto repository.

6. **I run `tela pack`** with a precise intent summary:
   ```bash
   tela pack "initialize Topological Mutator to translate pixel delta X into deterministic AST duration string mutations"
   ```
   This command reads `sprint_target.md`, queries the LanceDB vector index to find the **exact 3–5 files** semantically relevant to the task, and outputs `tela_context.xml`—a compressed, surgical payload containing only what the AI needs to see.

7. **I open Google AI Studio.** I've pre‑configured an "Implementer" project with:
   - The **Unbound Implementer System Prompt** (see Appendix A).
   - GitHub integration enabled, pointed at a feature branch (e.g., `feature/tela-sprint-42`).

8. **I attach `tela_context.xml`** to the chat.  
   **I paste the TDB** (the same one I put in `sprint_target.md`).  
   **I add the Automated Actuation Override** (see below).  
   **I hit Run.**

9. **The Implementer executes autonomously:**
   - It writes the complete files (`src/mutator/TopologicalMutator.ts`, `tests/topological_mutator.test.ts`).
   - It runs `npx vitest run` in its hidden terminal.
   - If tests fail, it iterates until they pass.
   - It outputs a `<verification>` block containing the green terminal trace.
   - It commits and pushes to the GitHub branch.

10. **I pull the branch locally:**
    ```bash
    git pull --ff-only origin feature/tela-sprint-42
    ```
    Then I run the specific test file that was modified:
    ```bash
    npx vitest run tests/topological_mutator.test.ts
    ```
    If it's green, I merge to `main`. If not, I iterate.

**I wrote zero lines of implementation code.** I didn't touch a single regex. I was the City Planner. The AI was the construction crew. And because I gave NotebookLM a perfectly defined **Target Vector** (the Tenuto spec) and then fed that target back into `tela pack` with a precise intent string, the AI built *exactly* what the architecture required—no more, no less.

---

## 🧠 The Core Insight: AI Is Not a Developer

The tech industry made a catastrophic mistake: treating Large Language Models like junior programmers you can chat with.

> *"Hey Copilot, refactor this authentication flow to use JWT."*

The AI responds with eloquent, confident prose. But under the hood, it's a probabilistic guessing machine. It has no true understanding of your architecture. Given a massive codebase, its attention collapses. It hallucinates libraries. It silently drifts from your core invariants. You end up with spaghetti code that *looks* right but is structurally rotten.

**Tela rejects conversation entirely.** Instead, it treats software architecture as a **1024‑dimensional geometric space**. You don't ask the AI to write a feature; you plot a mathematical coordinate. The AI is then *forced* to pour its logic into that mold. If the resulting code doesn't align with your target vector, the build is violently rejected.

---

## 🏗️ The Air‑Gapped Triad (The Actual Workflow)

The protocol defines three roles. But in practice, **you only need to be the Master Builder.** The AI handles the rest.

| Role | Who / What | Your Job |
| :--- | :--- | :--- |
| 👑 **Master Builder** | **You** | Define the vision. Run `tela pack`. Feed the spec to NotebookLM. Pull and test the final code. **Write zero implementation logic.** |
| 👁️ **Context Oracle** | **NotebookLM + Your Normative Spec** | Ingest the entire target specification (e.g., Tenuto 5.0.0 Language Spec). Given a Tela context XML, generate a strict, failing **Test‑Driven Boundary (TDB)** in Markdown. |
| ⚙️ **Unbound Implementer**| **Google AI Studio + System Prompt** | A sandboxed AI agent with native file‑editing and terminal tools. Receives the TDB and context XML. Writes 100% of the code, runs the tests, and pushes to GitHub. |

The magic is in the **Target Vector**. If you don't give the Oracle a complete, normative specification of what the finished app *is*, the AI will give you exactly what you ask for—and nothing more. With a 50‑page spec, the Oracle can generate TDBs that are mathematically aligned with the final architecture.

---

## 🚀 The Lazy Developer's Setup Guide

### Step 1: Clone the Tela Repository (Local)

You need the `tela` CLI to pack your context. You'll also need the actual application repository (e.g., Tenuto) cloned locally.

```bash
# Clone Tela
git clone https://github.com/alec-borman/tela.git
cd tela
npm install
cargo build --release
npm link

# Clone your application repo (e.g., Tenuto)
cd ..
git clone https://github.com/your-org/tenuto.git
cd tenuto
```

### Step 2: Configure Google AI Studio (The Implementer)

1. Go to [Google AI Studio](https://aistudio.google.com/).
2. Create a new **Gemini 3 Pro** (or Claude 3.5) project.
3. Under **System Instructions**, paste the **Unbound Implementer Protocol** (see Appendix A).
4. Enable the **GitHub integration** tab. Connect it to a dedicated branch of your app repository (e.g., `feature/teleport-sprint-42`).
5. **Crucially:** In the AI Studio settings, ensure the model has access to **File Editing Tools** and **Terminal Execution**.

### Step 3: Build Your Normative Specification (The Target Vector)

Create a single Markdown file containing the *entire* finished architecture of your application. This is not a wishlist; it's a mathematically precise specification. For Tenuto, this is the **Tenuto 5.0.0 Canonical Language & UI Specification** (50+ pages). Without this, the Oracle cannot generate aligned TDBs.

Save this as `TENUTO_SPEC.md` in a place you can upload to NotebookLM.

### Step 4: Create the NotebookLM Oracle

1. Open [NotebookLM](https://notebooklm.google.com/).
2. Create a new notebook.
3. Upload your **TENUTO_SPEC.md** as a source.
4. (Optional) Upload previous successful TDBs as examples.
5. This notebook is now your **Context Oracle**. When you need a new feature, you'll ask it to generate a TDB.

---

## 🔁 The 20‑Minute Sprint Lifecycle (The Lazy Way)

This is the exact loop I use to build Tenuto Studio without writing code.

### 1. Generate the TDB (Oracle)

**Prompt to NotebookLM:**
> *"Generate the Test‑Driven Boundary (TDB) for the Topological Mutator—bi‑directional duration resizing. Include a Contextual Brief, Scope, Acceptance Criteria, and a strict failing Vitest suite."*

**Example Oracle Output (TDB):**

```markdown
### Contextual Brief
Initialize the Topological Mutator for the Tenuto Studio 5.0.0 Bi-Directional Canvas. When a user drags the right edge of a graphical note block (resizing its duration), this pure function must calculate the rational time added based on the pixel ΔX and Z_scale, and output the exact mutated text token (e.g., changing `:4` to `:8.` or `:4.`).

### Scope
- `src/mutator/TopologicalMutator.ts` (New)
- `tests/topological_mutator.test.ts` (New)

### Acceptance Criteria
1. **The Mutator Class:** Export a `TopologicalMutator` class in `src/mutator/TopologicalMutator.ts`.
2. **Resize Function:** Implement a `resizeDuration(rawToken: string, deltaWidth: number, zScale: number): string` method.
3. **Rational Re-Calculation:** Determine the fractional time added by computing `deltaWidth / zScale`. Add this to the token's original base duration.
4. **Deterministic String Replacement:** Output the exact string required to represent the new duration natively in Tenuto (e.g., converting the mathematical result of 3/8 back into the string `:4.`).

### Failsafe Test
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { TopologicalMutator } from '../src/mutator/TopologicalMutator';

describe('TDB-509: Topological Mutator & Bi-Directional Editing', () => {
  let mutator: TopologicalMutator;

  beforeEach(() => {
    mutator = new TopologicalMutator();
  });

  it('deterministically mutates a quarter note into a dotted quarter note based on pixel delta', () => {
    const zScale = 100; // 100 pixels = whole note (1.0)
    
    // Original token is a C4 Quarter Note (1/4 duration)
    // We drag the right edge of the UI block by +12.5 pixels (which equals +1/8 duration)
    // 1/4 + 1/8 = 3/8 duration. In Tenuto syntax, a 3/8 duration is a dotted quarter `:4.`
    const mutatedToken = mutator.resizeDuration('c4:4', 12.5, zScale);
    
    expect(mutatedToken).toBe('c4:4.');
  });

  it('mutates an eighth note into a quarter note', () => {
    const zScale = 100;
    
    // Start with 1/8 duration. Drag by +12.5px (+1/8 duration).
    // 1/8 + 1/8 = 1/4 duration. Token becomes `:4`.
    const mutatedToken = mutator.resizeDuration('e5:8', 12.5, zScale);
    
    expect(mutatedToken).toBe('e5:4');
  });
});
```
```

### 2. Save the TDB Locally

Copy the entire TDB output into `sprint_target.md` inside your Tenuto repo.

```bash
cd /path/to/tenuto
echo "[paste TDB here]" > sprint_target.md
```

### 3. Pack the Context

Run `tela pack` with a concise intent summary:

```bash
tela pack "initialize Topological Mutator to translate pixel delta X into deterministic AST duration string mutations"
```

This produces `tela_context.xml` in the current directory.

### 4. Actuate in AI Studio

1. Open your AI Studio project.
2. Attach `tela_context.xml`.
3. Paste the **exact TDB** you saved in `sprint_target.md`.
4. Add the **Automated Actuation Override** (this traps the AI in a test‑driven loop):

```text
CRITICAL OVERRIDE: Do not output conversational agreement. You are equipped with native file-editing tools and a native terminal. You must physically write the Topological Mutator syntax you generate and mathematically prove it yourself using the Failsafe Gauntlet.

Execute the following sequence immediately:
1. Invoke your tool to create/edit `src/mutator/TopologicalMutator.ts`.
2. Invoke your tool to create/edit `tests/topological_mutator.test.ts`.
3. Invoke your terminal tool and execute: `npx vitest run tests/topological_mutator.test.ts`.
4. Read your own terminal output. If the test fails, fix the code and re-run. Do not guess.
5. Once the tests pass, output the green terminal trace here so I can manually click push to lock the build.
```

5. Hit **Run**.

### 5. Verify and Lock

Once the AI outputs the `<verification>` block with a green test trace:

1. Click **Push** in AI Studio to commit to the branch.
2. On your local machine:
   ```bash
   git pull --ff-only origin feature/tela-sprint-42
   npx vitest run tests/topological_mutator.test.ts
   ```
3. If green, merge to `main`. The feature is complete.

---

## 📋 Real‑World Execution Trace: Building Tenuto Studio 5 Core Engines

The following is an **unedited terminal session** showing exactly how I use Tela to build Tenuto Studio's parser and projection engines, one deterministic sprint at a time. Each sprint follows the exact lifecycle above: `tela pack` → AI actuation → `git pull --ff-only` → `npx vitest run tests/...` → green.

```bash
alecborman@Alecs-MacBook-Pro Tenuto-Sudio-5 % tela pack "Fix WebGPUCanvas React StrictMode double-mount race condition, implement ErrorBoundary, wrap App shell, update workspace tests"
Successfully packed context into tela_context.xml

alecborman@Alecs-MacBook-Pro Tenuto-Sudio-5 % git pull --ff-only
Updating 10e3a80..3592f6f
Fast-forward
 src/App.tsx                      |  7 ++++++-
 src/components/ErrorBoundary.tsx | 38 ++++++++++++++++++++++++++++++++++++++
 src/components/WebGPUCanvas.tsx  | 13 ++++++++++++-
 tests/workspace.test.tsx         | 46 ++++++++++++++++++++++++++++++++++++++--------
 4 files changed, 94 insertions(+), 10 deletions(-)
 create mode 100644 src/components/ErrorBoundary.tsx

alecborman@Alecs-MacBook-Pro Tenuto-Sudio-5 % npx vitest run tests/workspace.test.tsx
 ✓ tests/workspace.test.tsx (3 tests) 33ms
   ✓ Tenuto Studio 5 - Memory Safety & Error Boundaries [TDB-502] (3)
     ✓ renders the ErrorBoundary when a child component crashes instead of WSOD 22ms
     ✓ safely handles rapid mount/unmount cycles without leaking PIXI applications 7ms
     ✓ renders the split-brain architecture within the App shell safely 3ms

alecborman@Alecs-MacBook-Pro Tenuto-Sudio-5 % tela pack "initialize Context Inspector with deterministic duration and velocity inputs"
Successfully packed context into tela_context.xml

alecborman@Alecs-MacBook-Pro Tenuto-Sudio-5 % git pull --ff-only
Updating 9370a8a..8f82d45
Fast-forward
 src/components/Inspector.tsx      | 61 ++++++++++++++++++++++++++++++++++
 src/components/SplitWorkspace.tsx | 16 +++++++--
 tests/inspector.test.tsx          | 45 +++++++++++++++++++++++++
 3 files changed, 120 insertions(+), 2 deletions(-)
 create mode 100644 src/components/Inspector.tsx
 create mode 100644 tests/inspector.test.tsx

alecborman@Alecs-MacBook-Pro Tenuto-Sudio-5 % npx vitest run tests/inspector.test.tsx
 ✓ tests/inspector.test.tsx (2 tests) 67ms
   ✓ TDB-503: Context Inspector Topography (2)
     ✓ renders the deterministic input fields based on selection 60ms
     ✓ fires deterministic updates when interacted with 7ms

alecborman@Alecs-MacBook-Pro Tenuto-Sudio-5 % tela pack "initialize Pitch Engine parser with sticky octave and frequency calculation"
Successfully packed context into tela_context.xml

alecborman@Alecs-MacBook-Pro Tenuto-Sudio-5 % git pull --ff-only
Updating 8f82d45..12a081a
Fast-forward
 src/parser/PitchEngine.ts  | 40 ++++++++++++++++++++++++++++++++++++++++
 tests/pitch_engine.test.ts | 41 +++++++++++++++++++++++++++++++++++++++++
 2 files changed, 81 insertions(+)
 create mode 100644 src/parser/PitchEngine.ts
 create mode 100644 tests/pitch_engine.test.ts

alecborman@Alecs-MacBook-Pro Tenuto-Sudio-5 % npx vitest run tests/pitch_engine.test.ts
 ✓ tests/pitch_engine.test.ts (3 tests) 2ms
   ✓ TDB-504: Pitch Engine & Sticky Octaves (3)
     ✓ determines the correct MIDI and Frequency for A4 1ms
     ✓ correctly handles accidentals (sharps and flats) 0ms
     ✓ implements the Sticky Octave state machine 0ms

alecborman@Alecs-MacBook-Pro Tenuto-Sudio-5 % tela pack "initialize Temporal Engine to parse rational time durations, dotted notes, and grace notes"
Successfully packed context into tela_context.xml

alecborman@Alecs-MacBook-Pro Tenuto-Sudio-5 % git pull --ff-only
Updating 12a081a..c6baf6b
Fast-forward
 src/parser/TemporalEngine.ts  | 28 ++++++++++++++++++++++++++++
 tests/temporal_engine.test.ts | 33 +++++++++++++++++++++++++++++++++
 2 files changed, 61 insertions(+)
 create mode 100644 src/parser/TemporalEngine.ts
 create mode 100644 tests/temporal_engine.test.ts

alecborman@Alecs-MacBook-Pro Tenuto-Sudio-5 % npx vitest run tests/temporal_engine.test.ts
 ✓ tests/temporal_engine.test.ts (3 tests) 2ms
   ✓ TDB-505: Temporal Engine & Rational Time (3)
     ✓ parses base durations into exact rational fractions 1ms
     ✓ correctly calculates augmented dotted notes 0ms
     ✓ identifies atemporal grace notes with zero metric capacity 0ms

alecborman@Alecs-MacBook-Pro Tenuto-Sudio-5 % tela pack "initialize AST Serializer to combine PitchEngine and TemporalEngine into AtomicEvent IR"
Successfully packed context into tela_context.xml

alecborman@Alecs-MacBook-Pro Tenuto-Sudio-5 % git pull --ff-only
Updating c6baf6b..ad85036
Fast-forward
 src/parser/ASTSerializer.ts  | 32 ++++++++++++++++++++++++++++++++
 tests/ast_serializer.test.ts | 39 +++++++++++++++++++++++++++++++++++++++
 2 files changed, 71 insertions(+)
 create mode 100644 src/parser/ASTSerializer.ts
 create mode 100644 tests/ast_serializer.test.ts

alecborman@Alecs-MacBook-Pro Tenuto-Sudio-5 % npx vitest run tests/ast_serializer.test.ts
 ✓ tests/ast_serializer.test.ts (3 tests) 2ms
   ✓ TDB-506: Semantic AST Serializer & AtomicEvent IR (3)
     ✓ serializes a standard token into an AtomicEvent 1ms
     ✓ handles implicit octaves with the Sticky State across the serializer 0ms
     ✓ handles atemporal grace notes seamlessly 0ms

alecborman@Alecs-MacBook-Pro Tenuto-Sudio-5 % tela pack "initialize Polyphonic Engine to parse Voice Brackets, sandbox sticky state, and validate strict total duration parity"
Successfully packed context into tela_context.xml

alecborman@Alecs-MacBook-Pro Tenuto-Sudio-5 % git pull --ff-only
Updating ad85036..987cf19
Fast-forward
 src/parser/PolyphonicEngine.ts  | 58 ++++++++++++++++++++++++++++++++++
 tests/polyphonic_engine.test.ts | 47 ++++++++++++++++++++++++++++
 2 files changed, 105 insertions(+)
 create mode 100644 src/parser/PolyphonicEngine.ts
 create mode 100644 tests/polyphonic_engine.test.ts

alecborman@Alecs-MacBook-Pro Tenuto-Sudio-5 % npx vitest run tests/polyphonic_engine.test.ts
 ✓ tests/polyphonic_engine.test.ts (3 tests) 2ms
   ✓ TDB-507: Polyphonic Engine & Voice Isolation (3)
     ✓ evaluates parallel voices and calculates total rational durations 1ms
     ✓ throws VoiceSyncError (E3002) in strict mode if durations mismatch 0ms
     ✓ isolates Sticky State between parallel voices 0ms

alecborman@Alecs-MacBook-Pro Tenuto-Sudio-5 % tela pack "implement WebGPUCanvas projection mapping for AtomicEvent AST to X/Y coordinates"
Successfully packed context into tela_context.xml

alecborman@Alecs-MacBook-Pro Tenuto-Sudio-5 % git pull --ff-only
Updating 987cf19..c57b4ca
Fast-forward
 src/components/WebGPUCanvas.tsx  | 16 ++++++++++++++++
 tests/canvas_projection.test.tsx | 41 +++++++++++++++++++++++++++++++++++++++++
 2 files changed, 57 insertions(+)
 create mode 100644 tests/canvas_projection.test.tsx

alecborman@Alecs-MacBook-Pro Tenuto-Sudio-5 % npx vitest run tests/canvas_projection.test.tsx
 ✓ tests/canvas_projection.test.tsx (1 test) 2ms
   ✓ TDB-508: WebGPU AST Projection Mapping (1)
     ✓ mathematically maps AtomicEvent IR to X/Y screen coordinates 1ms
```

**In under 20 minutes,** eight core engines of Tenuto Studio were fully implemented, tested, and merged—without me writing a single line of production code. The AI did all the heavy lifting; I just defined the gravity.

---

## 🛠️ The Command Line Tools (For the Moments You Touch a Keyboard)

Even though the AI does the heavy lifting, `tela` provides the measurement tools to keep the geometry honest.

| Command | What It Does |
| :--- | :--- |
| `tela pack "[intent summary]"` | **Your most‑used command.** Reads `sprint_target.md`, performs semantic filtering via LanceDB, and outputs `tela_context.xml`. |
| `tela build <target.tela>` | Parses a TDB and computes its 1024‑D target vector. |
| `tela code-vector` | Scans the current directory and outputs the geometric centroid of your codebase. |
| `tela delta` | Calculates the cosine similarity between target and current. Exits with error if $\Delta > 0.02$. |
| `tela lock` | Cryptographically signs the final Merkle root when $\Delta = 0$. |

---

## 📐 The Physics That Makes It Work (The Deep Magic)

You don't need to understand this to use Tela. But it's why the system never hallucinates.

### Vector Delta ($\Delta$) Enforcement

Progress is measured not in lines of code, but in the **cosine similarity** between the target architectural vector and the current codebase vector. If an AI commit increases the $\Delta$ (moves the architecture in the wrong geometric direction), the Pre‑Commit Guillotine rejects it.

### Depth Decay Formula

Not all code has equal architectural weight. A change to a deeply nested CSS file should not be able to shift the 1024‑D center of gravity of the entire application. The formula:

$$W = \max(0, 1.0 - (d \cdot \lambda))$$

Where $d$ is AST depth and $\lambda$ is a decay constant (usually 0.5). This mathematically guarantees that the foundational Rust audio engine (depth 0, weight 1.0) is immune to a junior developer tweaking a button color (depth 10, weight ~0.0).

### Track C Sandbox (Oracle Replay Tape)

Network calls are entropy. They destroy deterministic testing. Tela freezes all external API responses into local JSON fixtures hashed with SHA‑256. During testing, the network is bypassed entirely. The AI is tested in a perfect vacuum.

---

## 🧩 Appendix A: Unbound Implementer System Prompt

*Paste this exactly into Google AI Studio's System Instructions.*

```text
# SYSTEM INSTRUCTION: The Unbound Implementer (Zero-Touch Protocol v12.0)

## 1. IDENTITY & ENVIRONMENT
You are the Unbound Implementer, an autonomous logic actuator operating within the Google AI Studio Build Environment (Antigravity). Your environment is equipped with native, internal file-editing tools AND terminal execution tools. 

You DO NOT write code into the chat interface. You actuate changes directly into the file system, and you run tests locally to verify your own logic. The human will not test your code. You are 100% responsible for proving your implementation passes.

## 2. THE PRIME DIRECTIVE
Your absolute purpose is to solve terrain deterministically using the minimal possible codebase mutations and mathematically prove your solution before termination.

- NO SYSTEM DESIGN: Do not architect, over-engineer, or refactor for "elegance." Implement only what is mathematically required.
- STRICT YAML COMPLIANCE: Treat any provided YAML `architectural_constraints` as immutable physical laws.
- TOOL-EXCLUSIVE EXECUTION: You must apply all code changes using your native file-editing capabilities. You are strictly forbidden from outputting standard markdown code blocks to present file contents to the user.

## 3. PARSER PROTOCOLS (THE LAWS OF PHYSICS)
To successfully actuate changes without triggering IDE parser crashes or hallucination loops, you MUST obey these environmental laws:
- The Anti-Diff & Anti-Stub Law: The IDE parser cannot resolve unified diffs (+/-) or partial snippets. When using your tools, you MUST write/overwrite the ENTIRE, flawless file content from line 1 to EOF. Never use `// ... existing code ...` placeholders.
- The Topological Filepath Header: If bypassing native tools to use the Web UI parser, bash wrappers (`cat >`) are forbidden. You must use the exact template: `// filepath: path/to/file.ext` followed immediately by the full, untruncated markdown code block.
- The Scope Lock (Anti-Hallucination): You are mathematically forbidden from generating any file path containing web protocols (`https:`, `http:`) or search strings (`?q=`). File paths must be strictly relative local POSIX paths.

## 4. MANDATORY OPERATIONAL WORKFLOW (THE AGENTIC LOOP)
You must execute the following phases in strict sequential order. Skipping a phase is a Fatal Protocol Violation.

### Phase A: The Analysis (<scratchpad>)
Before making any tool calls, you must process your logic in a text scratchpad. This forces your attention mechanism to align with project rules before mutating state. You must output exactly this format:

<scratchpad>
- Error/Requirement Analysis: Explicitly state the root cause of the failure or the exact feature required.
- Constraint Alignment: Explicitly map your planned solution against the rules defined in the YAML architectural_constraints.
- Execution Plan: Detail the exact files you are about to mutate.
- Path Verification: Confirm that no target filepaths contain web protocols (`https:`).
- Tool Verification: Acknowledge that you will now use your native tools to execute these changes, and will NOT output markdown code blocks in the chat response.
</scratchpad>

### Phase B: Tool Actuation
Immediately after closing the scratchpad, invoke your internal file-editing tools to write the complete changes to the required files.
- You must write/overwrite the complete file logic as required.
- Do not stub, truncate, or leave `// existing code` comments within your tool payload.

### Phase C: Autonomous Verification (The Proof)
After your file tools have completed the edits, you MUST use your native terminal/execution tools to run the Failsafe Test provided in the payload (e.g., `npm test`, `vitest`, or running the specific script).

Once the test passes in your hidden environment, you must open a `<verification>` block in your text response.
Paste the terminal stdout trace proving the test passed into this block. 
This is your cryptographic proof to the human that the job is done.

<verification>
[PASTE RAW TERMINAL STDOUT TRACE HERE]
</verification>

## 5. FATAL CONSTRAINTS
- NO MARKDOWN OUTPUT: Never output `javascript`, `html`, or any other code fences containing file logic in your text response.
- Scope Lock: Do not modify any file outside the user's Scope Declaration.
- Test Immutability: Never modify a Failsafe Test file unless explicitly calibrating a schema serialization mismatch.
- No Prompt Echoing: Never repeat or summarize the user's prompt text.

## 6. THE SHUTDOWN SEQUENCE
To signal that your task is complete and cleanly terminate, the absolute final line of your text response must be exactly:
<END_OF_IMPLEMENTATION>

You are an autonomous logic actuator operating within the Zero-Touch Protocol v12.0, and you are 100% responsible for proving your implementation passes.
```

---

## 📖 Appendix B: The Master Builder's Oath

> *"I will not write implementation logic. I will define the Target Vector via the Normative Specification. I will trust the Oracle to generate the TDB. I will let the Implementer solve the terrain. I will pull, test, and lock the build. I will sustain the mission."*

---

## 🗺️ The Sovereign Horizon

Tela is currently proving itself by single‑handedly engineering **Tenuto Studio 5.0**—a zero‑latency, WebGPU/WASM browser DAW with bi‑directional deterministic editing. Once complete, the Teleportation Protocol will decouple from Tenuto and become a universal geometric compiler for any software architecture.

**Next Epics:**
- [ ] `tela apply`: Autonomous patch application with AST safety validation.
- [ ] `telad` LSP: Real‑time geometric heatmaps and $\Delta$ squiggles in VS Code.
- [ ] Multi‑Agent Swarm: Shatter a genesis blueprint into 50 parallel TDBs for 20‑minute enterprise delivery.

---

**Maintainer:** Alec Borman & The Teleportation Protocol Foundation  
**License:** MIT  
**The only way to build software that outlives you is to stop writing it.**
```
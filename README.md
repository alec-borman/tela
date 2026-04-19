# 🌌 T E L A

<div align="center">
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

1. **I have a vision.** I want to add a new feature to Tenuto Studio—maybe a visual Euclidean rhythm dial.
2. **I open Google AI Studio.** I've pre‑configured an "Implementer" agent with a strict system prompt (the one you'll find below). This agent is *blind*—it only sees the files I give it.
3. **I run `tela pack "build a Euclidean rhythm dial"`** on my local machine. It spits out `tela_context.xml`—a tiny, surgically precise snapshot of only the 4 files that matter out of my 1,000‑file repo.
4. **I upload `tela_context.xml` to NotebookLM.** Alongside the entire 50‑page Tenuto Studio normative specification (the "target vector"). NotebookLM becomes my Oracle. I ask it: *"Generate the Test‑Driven Boundary (TDB) for this feature."*
5. **NotebookLM outputs a Markdown TDB.** It's a strict, failing test suite in Vitest, plus architectural constraints in YAML. It defines *exactly* what success looks like.
6. **I paste that TDB into AI Studio**, attach `tela_context.xml`, and hit "Run." The Implementer writes the entire feature, runs the tests, and pushes the code to a GitHub branch.
7. **I pull the branch locally.** `git pull --ff-only`. I run `npm test`. If it's green, I lock the build. If not, I iterate.

**I wrote zero lines of implementation code.** I didn't touch a single regex. I was the City Planner. The AI was the construction crew. And because I gave NotebookLM a perfectly defined **Target Vector** (the Tenuto spec), the AI built *exactly* what the architecture required—no more, no less.

This README is the manual for that lazy genius workflow. It's the missing layer between the rigid protocol and the human who just wants to ship flawless software without typing a semicolon.

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
5. This notebook is now your **Context Oracle**. When you need a new feature, you'll paste the `tela_context.xml` content and ask: *"Generate the Test‑Driven Boundary (TDB) for [feature description]. Include a strict failing Vitest suite and YAML architectural constraints."*

---

## 🔁 The 20‑Minute Sprint Lifecycle (The Lazy Way)

This is the exact loop I use to build Tenuto Studio without writing code.

### 1. Define Intent & Pack Context

On your local machine, inside your app repo, run:

```bash
tela pack "Add a Euclidean rhythm dial to the WebGPU canvas"
```

This produces `tela_context.xml` (usually ~12 KB). It contains only the 3‑5 files semantically relevant to that intent.

### 2. Generate the TDB (Oracle)

- Copy the entire content of `tela_context.xml`.
- Paste it into your NotebookLM Oracle chat.
- Add your request:

> *"Based on the Tenuto specification and this context, generate the Test‑Driven Boundary for a Euclidean rhythm dial. Include a failing Vitest suite and YAML architectural constraints."*

- NotebookLM outputs a Markdown document—your **TDB**.

### 3. Actuate (Implementer)

- Open your Google AI Studio project.
- In the chat, attach `tela_context.xml` (as a file).
- Paste the **entire TDB** from NotebookLM.
- Add a single line instruction: *"Solve the terrain."*
- Hit **Run**.

The AI Studio agent will:
- Write the complete files (overwriting them).
- Run the Vitest suite in its hidden terminal.
- If tests pass, it will commit and push to the GitHub branch.

### 4. Verify & Lock

Back on your local machine:

```bash
git pull --ff-only origin feature/teleport-sprint-42
npm test
```

If the tests are green, you merge to `main`. You have just shipped a complex feature with zero manual coding.

### 5. Iterate

Ask NotebookLM: *"The feature is implemented. What is the next TDB required to reach full compliance with the specification?"* Repeat.

---

## 🛠️ The Command Line Tools (For the Moments You Touch a Keyboard)

Even though the AI does the heavy lifting, `tela` provides the measurement tools to keep the geometry honest.

| Command | What It Does |
| :--- | :--- |
| `tela pack [intent]` | **Your most‑used command.** Semantic filtering via LanceDB. Outputs `tela_context.xml`. |
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
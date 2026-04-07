# 🌌 The Teleportation Protocol
**Version:** 8.2 (Bug‑Driven Meta‑Engineering – Production Stable)  
**Role:** Master Builder (Solo Computer Scientist)  
**Status:** Normative / Self‑Contained / Ready for Implementation

---

## 1. Abstract and Architecture Philosophy

Large Language Models are probabilistic engines; they navigate multi-dimensional semantic spaces to predict tokens. Forcing them to output strict, custom syntax creates an unnatural tension that throttles their reasoning capability. Version 8.2 acknowledges that **generation will always be probabilistic, so verification must be absolute.**

We deprecate all custom syntax and replace it with **AST (Abstract Syntax Tree) Mapping** and **Test‑Driven Boundaries (TDB)**. The AI is allowed to write standard TypeScript/React, but its output is trapped inside an airtight, mathematically verified CI/CD Gauntlet before it ever touches your core branch.

**Bug‑Driven Development (BDD)** is a first‑class principle: before any fix is written, the AI must *reproduce* the bug in a live environment, capture evidence, and only then propose code changes. We add **meta‑learning scaffolds**, **context engineering**, and an **evaluation flywheel** to turn past failures into future hardening.

---

## Part I: The Air-Gapped Triad

To prevent context bleed and architectural drift, the system is physically air-gapped into three distinct roles.

| Role | Entity | Tooling | Responsibility |
| :--- | :--- | :--- | :--- |
| **Master Builder** | Human | `telac` CLI, IDE, Git | Write zero implementation code. Define Baseplate, orchestrate state syncs, evaluate $\Delta$, sign the cryptographic lock. |
| **Context Oracle** | NotebookLM (or any LLM with file upload) | Vault (synced Zip) | The Command Center. Holds the entire codebase state, database schemas, and API contracts. Generates strictly failing Vitest/Jest test suites (Markdown TDBs). |
| **Unbound Implementer** | Gemini 3.1 Pro (or any 1M+ context model) | AI Studio, Playwright (headless browser), memory store | Blind to the global architecture. Receives only 2-3 isolated files and the Oracle's failing test. Writes the exact code needed to pass the test, output as **unified diffs (patches)**. |

---

## Part II: The 1024-Dimensional Baseplate (AST Mapped)

The Baseplate is defined in a rigid `baseplate.config.ts` file that maps architectural dimensions directly to verifiable AST rules and compiler flags.

### 2.1 Baseplate Definition (`baseplate.config.ts`)
```typescript
import { TelaBaseplate } from '@tela/core';

export default {
  version: "8.2",
  target: "Enterprise_SaaS_Core",
  decayConstant: 0.05,
  axes: [
    {
      id: "arch:type_safety",
      weight: 1.00,
      verification: "tsconfig",
      rules: { strict: true, noImplicitAny: true, strictNullChecks: true }
    },
    {
      id: "arch:dependency_isolation",
      weight: 0.95,
      verification: "ast_parser",
      rules: { forbiddenImports: ["axios", "lodash"] }
    },
    {
      id: "ui:tailwind_strict",
      weight: 1.00,
      verification: "eslint",
      rules: { "tailwindcss/no-custom-classname": "error" }
    },
    {
      id: "bug:reproducible",
      weight: 1.00,
      verification: "playwright",
      rules: { "every_bug_must_have_reproduction_script": true }
    },
    {
      id: "meta:learning",
      weight: 0.90,
      verification: "memory_store",
      rules: { "prompt_hashes_must_be_archived": true }
    }
  ]
} satisfies TelaBaseplate;
```

### 2.2 Depth Decay and Structural Weight
A change buried 10 components deep should not trigger a global architectural regression. The structural weight $W$ of any file is calculated using its depth $d$ in the import dependency graph (where the entry point `main.tsx` or `index.ts` is $d=0$):

$$W = \max(0, 1.0 - (d \cdot \lambda))$$

Where $\lambda$ is the `decayConstant` defined in the Baseplate (default 0.05). The local `telac` compiler computes this dynamically via static analysis of your ES modules.

---

## Part III: The Test-Driven Boundary (TDB)

The Oracle does not output code directives. It outputs a **Markdown TDB Payload**. A TDB is a mathematical contract disguised as an automated test.

### 3.1 The TDB Payload Structure
When you query the Oracle in NotebookLM ("We need a UserProfile component that fetches from `/api/users`"), the Oracle generates a standard zip file or text blob containing:
1. **Contextual Brief:** The high-level objective.
2. **Scope:** Which files the Implementer is allowed to touch.
3. **Acceptance Criteria:** The specific requirements.
4. **Failsafe Test:** A Vitest file that aggressively tests edge cases, mocked network states, and component rendering.

### 3.2 Example Failsafe Test (`UserProfile.test.tsx`)
```tsx
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { UserProfile } from './UserProfile';
import { getTape } from '../fixtures/tape_reader';

// TELA BOUNDARY ENFORCEMENT: 
// The Implementer MUST make these tests pass without modifying this file.

describe('UserProfile Component [TDB-492]', () => {
  it('renders user data directly from the deterministic replay tape', async () => {
    const mockData = getTape('tape_get_user_success.json');
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockData,
    } as Response);

    render(<UserProfile userId="usr_123" />);
    
    // UI Determinism Checks
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText(mockData.username)).toBeInTheDocument();
    });
    
    // Architecture Check: Ensure standard fetch is used, not a forbidden library
    expect(global.fetch).toHaveBeenCalledWith('/api/users/usr_123');
  });
});
```

---

## Part IV: Bug-Driven Development (BDD)

When the Master Builder observes a bug, they create a **Bug Report Tape** – a structured YAML file that contains:

- **Reproduction steps** (human‑readable)
- **Expected vs. actual behavior**
- **A Playwright script** that reliably triggers the bug
- **A failing human‑authored test** (Vitest with `@testing-library/react`)

The Implementer’s workflow is **mandatory**:

1. **Reproduce the bug** using the provided Playwright script (headless browser tool).
2. **Capture evidence** (screenshot, console log) in the `<scratchpad>`.
3. **Hypothesise the root cause**.
4. **Write the fix** that makes the human‑authored test pass.
5. **Output as a unified diff** (patch) – never the full file.
6. **Re‑run Playwright** to verify the bug is gone.

---

## Part V: The CI/CD Gauntlet (The Drop Test 2.0)

When you paste the TDB and the isolated files into AI Studio, the Implementer writes the implementation. You copy its output (a diff) and feed it into the local `telac` Gauntlet.

### The 4-Phase Gauntlet Execution

Run locally via: `telac gauntlet --target src/components/UserProfile.tsx`

| Phase | Tool | Failure Condition |
| :--- | :--- | :--- |
| **1. Extraction & Sanitization** | regex | Non‑code output, missing code block, invalid diff format |
| **2. AST Interrogation** | `ts-morph` | Forbidden imports, `any` types, missing base cases in recursion |
| **3. TDB Execution** | `vitest` | Any test failure – especially human‑authored golden tests |
| **4. Bug Reproduction (Playwright)** | `playwright` | The provided reproduction script fails to trigger the bug, or the fix does not make it pass |

For feature TDBs (no associated bug), Phase 4 is skipped.

---

## Part VI: The Replay Tape (Taming Non-Determinism)

Live API calls destroy testing determinism. Version 8.2 relies on hardcoded JSON fixtures called **Tapes**, intersected at the `fetch` or MSW (Mock Service Worker) layer.

### Tape Declaration (`fixtures/tapes.json`)
```json
{
  "tape_get_user_success": {
    "request": "GET /api/users/usr_123",
    "status": 200,
    "payload_ref": "payloads/usr_123.json",
    "sha256": "8a3c...9f12"
  }
}
```

The Gauntlet verifies the SHA-256 hash of the payload before running the TDB. If you alter the mock data without updating the hash, the build fails. The AI is forced to engineer against a mathematically verified, static snapshot of reality.

---

## Part VII: Meta-Learning and the Memory Store

### 7.1 The Prompt Archive
The `telac` CLI maintains a `memory/` directory containing:

- **Successful prompt–output pairs** (hashed, deduplicated)
- **Failed attempts and their error traces**
- **Refined system instructions** that evolved from failures

When a new TDB arrives, `telac` searches the memory store for semantically similar past tasks and injects the most relevant successful prompt as a **few‑shot example** into the Implementer's context.

### 7.2 The Self‑Correction Checklist
Every Implementer prompt now includes a **dynamic checklist** generated from past failures:

```yaml
checklist:
  - "Race conditions: ensure async image loading is awaited before allowing point placement"
  - "Coordinate transforms: verify that click coordinates are not inverted"
  - "State persistence: confirm localStorage is cleared on reset"
  - "Undo/redo: ensure every node mutation goes through updateNodes"
```

The AI must explicitly address each item in its scratchpad before outputting code.

### 7.3 The Evaluation Flywheel
After each sprint, the Master Builder runs:
```bash
telac evaluate --since last_success
```
This command:
- Runs the entire test suite against the current branch
- Compares the failure patterns against the memory store
- Suggests updates to the checklist and system instruction
- Optionally updates the Oracle's context with new architectural constraints

---

## Part VIII: Cryptographic Lock & Sustainability

### 8.1 The Master's Lock
When $\Delta = 0$ and all TDBs pass, you lock the build.
```bash
telac lock --signature ~/.ssh/tela_master_key
```
This script computes a Merkle tree root of your `src/` directory, checks the $\Delta$, and outputs a `tela.lock.sig` file. In CI/CD, if the `tela.lock.sig` does not match the current commit tree, deployment is blocked.

### 8.2 The Sustainability Covenant (Optional – can be removed)
Architecture requires funding. The protocol can evaluate financial health at build time if a `sustainability.yaml` file exists. Run `telac sustain` to check. If not present, this step is skipped.

---

## Part IX: The Titanium Prompts (v8.2)

These are the exact system prompts you use to enforce the air-gap.

### The Oracle Prompt (for NotebookLM)
> **System Instruction:** You are the Context Oracle under the Teleportation Protocol v8.2. You are the source of truth for the codebase architecture. You do NOT write implementation logic. When asked to design a feature, you must analyze the uploaded codebase snapshot and output a **Markdown TDB**. Your output must contain: 1. A list of isolated files the Implementer needs. 2. A rigorous, strictly failing Vitest/Jest test file that defines the exact functional requirements, utilizing the Replay Tape for all external data. For bug fixes, also output a **Bug Report Tape** (YAML) containing a Playwright reproduction script and a human‑authored golden test. Output nothing else.

### The Implementer Prompt (for Gemini 3.1 Pro / AI Studio)
> **System Instruction:** You are the Unbound Implementer under the Teleportation Protocol v8.2. You do not architect. You solve terrain. You will receive 1-3 isolated codebase files and a failing test suite (and for bugs, a Playwright reproduction script). 
> **CONSTRAINTS:**
> 1. Use your advanced reasoning inside a `<scratchpad>` block to analyze why the tests are failing and plan the exact logic needed.
> 2. After the scratchpad, output **ONLY a unified diff (patch)** inside a single ```diff code block.
> 3. The diff must be applicable with `patch -p1` or `git apply`. Include 3 lines of context.
> 4. DO NOT modify the test file. 
> 5. DO NOT output the full file. Output only the minimal changes.
> 6. DO NOT explain your code after outputting it. Make the tests pass.

---

## Part X: The 20-Hour Lifecycle Assembly (v8.2)

| Phase | Time | Action |
| :--- | :--- | :--- |
| **1. Baseplate Genesis** | 0–2h | Define `baseplate.config.ts`, `schema.prisma`, and (optionally) `sustainability.yaml`. Zip the skeleton and upload to NotebookLM. |
| **2. Target Lock** | 2–3h | Query the Oracle: *"Generate TDB for core authentication layer."* |
| **3. Synced Sprints** | 3–16h | **Core Loop:** Paste TDB into AI Studio → AI generates diff → Apply diff with `patch` → Run `telac gauntlet` locally → Feed errors back to AI → Tests Pass. |
| **4. State Sync** | (Ongoing) | Every time a feature passes the Gauntlet, zip the `src/` directory and upload the new snapshot to NotebookLM to maintain the Oracle's "Eyes in the Sky." |
| **5. Bug Sprints** | 16–18h | For each bug, create Bug Report Tape → Oracle generates TDB + Playwright script → Implementer reproduces and fixes → Gauntlet (including Playwright) passes. |
| **6. Tape Generation** | 18–19h | Finalize all Replay Tapes. Verify payload hashes. |
| **7. The Drop Test** | 19–20h | Run `telac gauntlet --all`. Ensure complete test coverage and AST compliance across the entire dependency graph. |
| **8. Final Lock** | 20h | Verify $\Delta = 0$. Run `telac lock`. Push to production. |

---

## The Master Builder’s Oath (v8.2)

> *"I will not write implementation logic. I will define the Baseplate and the Bug Report Tapes. I will sync the State to the Oracle. I will let the Implementer solve the terrain to make the tests pass. I will trust the Gauntlet, not the AI. I will learn from every failure. I will lock the build. I will sustain the mission."*

---

**End of Teleportation Protocol v8.2**

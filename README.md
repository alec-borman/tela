# The Teleportation Protocol (`tela`) v9.0  
## The Canonical Realization: A Semantic Compiler for Deterministic Architecture

**Status:** Normative / Fully Implemented  
**License:** MIT  

**Abstract**  
The Teleportation Protocol (`tela`) v9.0 is a rigorous, geometry-based framework for software development that fundamentally departs from probabilistic conversational Artificial Intelligence. It replaces natural language programming with a deterministic, 1024‑dimensional geometric physics engine. Development proceeds not through dialogue, but through the definition of a strict Test‑Driven Boundary (TDB), which acts as a mathematical constraint that the AI must satisfy. 

By hardcoding the "Air-Gapped Triad" (Human Architect $\rightarrow$ OpenAI o1 Oracle $\rightarrow$ Claude 3.7 Implementer) and utilizing state-of-the-art developments in Abstract Syntax Tree Neural Networks (ASTNN), Deterministic Pushdown Automata (DPDA), and Graph Matching Networks (GMN), the `tela` v9.0 protocol successfully transforms software engineering from a process of conversational trial-and-error into a mathematically indestructible science.

---

## Table of Contents

1. [Introduction: The Schism from Conversational Code Generation](#1-introduction-the-schism-from-conversational-code-generation)  
2. [The Air-Gapped Triad: Hardcoded Role Separation](#2-the-air-gapped-triad-hardcoded-role-separation)  
3. [Theoretical Underpinnings](#3-theoretical-underpinnings)  
   3.1. [Vectorized Determinism (ASTNN & Code2Vec)](#31-vectorized-determinism-astnn--code2vec)  
   3.2. [Vector Delta ($\Delta$) & GMN Alignment](#32-vector-delta-delta--gmn-alignment)  
   3.3. [Constrained Decoding & DPDA](#33-constrained-decoding--dpda)  
   3.4. [DIR & Dependency Graph Expansion](#34-dir--dependency-graph-expansion)  
   3.5. [Track C Sandbox (Oracle Replay Tape)](#35-track-c-sandbox-oracle-replay-tape)  
4. [Operational Workflow & Gradient Descent](#4-operational-workflow--gradient-descent)  
5. [Command‑Line Interface Reference](#5-command-line-interface-reference)  
6. [Appendices](#6-appendices)

---

## 1. Introduction: The Schism from Conversational Code Generation

The software industry has widely adopted Large Language Models (LLMs) as conversational assistants. This approach introduces catastrophic architectural risks when applied to enterprise codebases. LLMs are probabilistic sequence predictors; when an unconstrained model attempts to act as a global architect, it suffers from attention collapse, structural hallucination, and lateral drift. Empirical benchmarks (e.g., SWE-bench) demonstrate that autonomous agents given unconstrained architectural control fail up to 86%+ of the time.

The Teleportation Protocol (`tela`) v9.0 provides the definitive mathematical cure. It strips the LLM of architectural autonomy. Software architecture is modeled as a physical, 1024‑dimensional spatial matrix. Development proceeds by defining a precise mathematical coordinate—a **Test‑Driven Boundary (TDB)**—that the AI is physically constrained to fill. The AI's output is rigorously validated against this target vector.

> **Core Principle:** The human defines the gravitational field; the AI pours the concrete. This framework provides the steering mechanism for software factories operating at trillion‑dollar scale.

---

## 2. The Air-Gapped Triad: Hardcoded Role Separation

To eradicate hallucination and context contamination, `tela` v9.0 hardcodes a strict separation of concerns into its native compiler, utilizing specialized models for specialized roles.

| Role | Designated Entity | Core Responsibilities |
| :--- | :--- | :--- |
| 👑 **The Master Builder** | **Human Architect** | Defines the architectural vision and intent. Holds the cryptographic keys required to lock the final build. **Writes no implementation code.** |
| 👁️ **The Context Oracle** | **OpenAI o1** (Automated API) | Deep architectural reasoning. Translates the Master Builder's abstract intent into a sterilized, mathematically precise Markdown TDB. **Never interacts with source code syntax.** |
| ⚙️ **The Unbound Implementer** | **Anthropic Claude 3.7 Sonnet** (Automated API) | A heavily constrained syntax actuator. Blind to the global architecture. Receives the isolated TDB and structurally expanded context. Generates the exact unified diff to solve the localized terrain. |

---

## 3. Theoretical Underpinnings

The `tela` compiler relies on five mathematical pillars to guarantee architectural alignment.

### 3.1. Vectorized Determinism (ASTNN & Code2Vec)
Code is no longer treated as flat text. `telac` utilizes Abstract Syntax Tree Neural Networks (ASTNN) and Code2Vec methodologies. Tree-sitter parses the source code, extracting structural paths (e.g., `NameExpr ↑ AssignExpr ↓ NameExpr`). These deep, pre-order topological traversals are embedded into the 1024-D space, rendering the vector completely immune to traditional adversarial hacks (like variable renaming) while remaining hyper-sensitive to logical mutations. The **Depth Decay Formula** ($W = \max(0, 1.0 - (d \cdot \lambda))$) geometrically prevents deeply nested logic from altering the global centroid.

### 3.2. Vector Delta ($\Delta$) & GMN Alignment
Progress is exclusively defined as the reduction of angular distance between the codebase's current vector ($V_{\text{now}}$) and the target vector ($V_{\text{target}}$). Before standard cosine similarity is calculated, a **Graph Matching Network (GMN)** applies a cross-attention structural penalty. This guarantees that lateral hacks—where an AI spoofs token magnitude without actually building the required topography—are mathematically exposed and rejected.

### 3.3. Constrained Decoding & DPDA
To enforce the "Narrow Waist Principle," `tela` relies on strict EBNF grammar constraints. Using frameworks conceptually aligned with XGrammar and Pre3, API responses are piped through Deterministic Pushdown Automata (DPDA). This dynamically masks probability logits at runtime, making it *physically impossible* for the AI to hallucinate conversational filler or output malformed diff syntax (the "Structure Snowballing" effect).

### 3.4. DIR & Dependency Graph Expansion
Standard RAG destroys source code hierarchy. `tela` utilizes **Deterministic Intent Retrieval (DIR)**. By blending Cosine Similarity with BM25 (Full-Text Search) in LanceDB, it identifies the geometric DNA of the required code. It then utilizes Tree-sitter (`find_usages`, `depends_on`) to recursively crawl the dependency graph, pulling in required interfaces and modules to ensure the Implementer never suffers from context starvation, generating a "Lean Context" of 5,000–10,000 tokens.

### 3.5. Track C Sandbox (Oracle Replay Tape)
External network calls destroy test determinism. The Track C Sandbox intercepts all outbound API requests and caches the responses as immutable JSON fixtures identified by SHA‑256 hashes. In test environments, `TELA_TAPE_MODE=replay` forces the system to bypass the network and execute against these fixtures, guaranteeing bit‑identical execution of historical entropy.

---

## 4. Operational Workflow & Gradient Descent

The v9.0 workflow abandons manual copy-pasting into web UIs. The Triad is fully automated via the `telac orchestrate` engine.

1. **Define the Intent:** The Master Builder formulates a clear objective (e.g., "Implement LanceDB Orchestrator for RAG AI projection").
2. **Invoke the Swarm:** The builder executes the command:
   ```bash
   tela orchestrate my_feature_intent.md
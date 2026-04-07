/**
 * The decay constant lambda as defined in Section 9.0
 */
export const DECAY_CONSTANT = 0.05;

/**
 * Calculates the depth decay factor based on the nesting level.
 * W = max(0, 1.0 - (depth * lambda))
 */
export function calculateDepthDecay(depth: number): number {
  const decay = 1.0 - (depth * DECAY_CONSTANT);
  return Math.max(0, decay);
}

/**
 * Global registry of architectural dimensions and their indices.
 * Must match the Rust implementation exactly.
 */
export const GLOBAL_MANIFEST: Record<string, number> = {
  "arch:determinism": 0,
  "arch:grammar_strictness": 1,
  "arch:memory_safety": 2,
  "arch:ergonomics": 3,
  "arch:rapid_prototyping": 4,
  "arch:decoupling": 5,
  "arch:performance": 6,
  "arch:sovereignty": 7,
  "arch:vector_fidelity": 8,
  "arch:parity_requirement": 9,
  "arch:human_authority": 10,
  "arch:unification": 11,
  "arch:domain_isolation": 12,
  
  // Tenuto domain axes (from src/domains/tenuto/manifest.rs)
  "arch:rhythm_complexity": 100,
  "arch:pitch_determinism": 101,
  "arch:timbre_stability": 102,
  "arch:temporal_fidelity": 103,
  "arch:intent_fidelity": 104,
  "arch:parity_requirement_tenuto": 105,
  "arch:human_authority_tenuto": 106,
  "arch:sovereignty_tenuto": 107,
  "arch:grammar_strictness_tenuto": 108,
  "arch:finality": 109,
  "arch:unification_tenuto": 110,
  "arch:robustness": 111,

  // Narrative Integrity Bit (Dimension 1023)
  "arch:narrative_integrity": 1023,
};

export function getDimensionIndex(key: string): number | undefined {
  return GLOBAL_MANIFEST[key];
}

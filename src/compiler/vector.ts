import crypto from 'node:crypto';
import { ASTDomain } from '../parser/parser';
import { calculateDepthDecay, getDimensionIndex } from './manifest';

/**
 * A 1024-dimension vector represented as a Float64Array.
 */
export type Vector1024 = Float64Array;

/**
 * Result of projecting a domain to its vector representation.
 */
export interface EmbeddingResult {
  vector: number[];
  fingerprint: string;
}

/**
 * Projects a Domain AST into a 1024-dimension vector.
 * Implements the logic from Section 9.0 and Section 10.0.
 */
export function projectDomainToVector(domain: ASTDomain): Vector1024 {
  const vector = new Float64Array(1024);

  // 1. Process meta block (depth 0)
  const metaWeight = calculateDepthDecay(0);
  // Meta block contributes to arch:determinism and arch:sovereignty by default
  const detIndex = getDimensionIndex("arch:determinism");
  const sovIndex = getDimensionIndex("arch:sovereignty");
  if (detIndex !== undefined) vector[detIndex] += metaWeight * 0.5;
  if (sovIndex !== undefined) vector[sovIndex] += metaWeight * 0.5;

  // 2. Process features (depth 1)
  for (const feature of domain.features) {
    const featureWeight = calculateDepthDecay(1) * feature.weight;
    for (const [key, contribution] of Object.entries(feature.dimension_contributions)) {
      const index = getDimensionIndex(key);
      if (index !== undefined) {
        vector[index] += featureWeight * (contribution as number);
      }
    }
  }

  // 3. Process deterministics (depth 1)
  for (const det of domain.deterministics) {
    const detWeight = calculateDepthDecay(1);
    // Deterministic blocks contribute strongly to arch:determinism
    if (detIndex !== undefined) vector[detIndex] += detWeight * 1.0;
  }

  return vector;
}

/**
 * Computes the SHA-256 fingerprint of a vector.
 */
export function computeFingerprint(vector: Vector1024): string {
  const hasher = crypto.createHash('sha256');
  // Serialize the vector as JSON (matching Rust's telac)
  const vectorArray = Array.from(vector);
  const vectorJson = JSON.stringify(vectorArray);
  hasher.update(vectorJson);
  return hasher.digest('hex');
}

/**
 * Computes the cosine similarity between two vectors.
 * Similarity = (A . B) / (||A|| * ||B||)
 */
export function calculateParity(vectorA: Vector1024, vectorB: Vector1024): number {
  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < 1024; i++) {
    const a = vectorA[i];
    const b = vectorB[i];
    dotProduct += a * b;
    magnitudeA += a * a;
    magnitudeB += b * b;
  }

  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  return dotProduct / (magnitudeA * magnitudeB);
}

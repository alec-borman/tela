import { ASTDomain } from '../parser/parser';

export class RejectionBounceError extends Error {
  constructor(public similarity: number, public threshold: number) {
    super(`Rejection Bounce: Similarity ${similarity.toFixed(4)} is below threshold ${threshold.toFixed(4)}`);
    this.name = 'RejectionBounceError';
  }
}

// Mock FFI interface representing the WebAssembly bridge to the Rust Steel core
export interface OracleFFI {
  project_ast_to_vector(astJson: string): string; // returns JSON with vector and fingerprint
  calculate_parity(vectorA: Float64Array, vectorB: Float64Array): number;
}

export class VectorGuard {
  private oracle: OracleFFI;
  private activeTargetVector: Float64Array | null = null;
  private activeThreshold: number = 1.0;

  constructor(oracle: OracleFFI) {
    this.oracle = oracle;
  }

  public setActiveSprint(domain: ASTDomain, targetVector: Float64Array) {
    this.activeTargetVector = targetVector;
    this.activeThreshold = domain.meta.target_similarity;
  }

  /**
   * Hook into the file-save/commit lifecycle of Track A.
   * @param newAst The newly parsed AST from the proposed commit.
   * @returns true if the commit is allowed, throws RejectionBounceError otherwise.
   */
  public validateCommit(newAst: ASTDomain): boolean {
    if (!this.activeTargetVector) {
      throw new Error("No active sprint vector defined. Cannot validate commit.");
    }

    // 1. Beam new AST to the Oracle
    const astJson = JSON.stringify(newAst);
    const resultJson = this.oracle.project_ast_to_vector(astJson);
    const result = JSON.parse(resultJson);
    
    if (result.error) {
      throw new Error(`Oracle Error: ${result.error}`);
    }

    const newVector = new Float64Array(result.vector);

    // 2. Run it through calculate_parity
    const similarity = this.oracle.calculate_parity(this.activeTargetVector, newVector);

    // 3. Trigger Rejection Bounce if below threshold
    if (similarity < this.activeThreshold) {
      throw new RejectionBounceError(similarity, this.activeThreshold);
    }

    return true; // Commit allowed
  }
}

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

describe('Phase 2: ASTNN Structural Vectorization Determinism', () => {
  const testDir = path.join(__dirname, '.temp_astnn');

  beforeAll(() => {
    if (!fs.existsSync(testDir)) fs.mkdirSync(testDir, { recursive: true });
    
    // File A: Baseline
    fs.writeFileSync(path.join(testDir, 'baseline.ts'), 'function calculate() { const x = 1; return x + 1; }');
    
    // File B: Structurally Identical, Lexically Different (Renamed variables/whitespace)
    fs.writeFileSync(path.join(testDir, 'renamed.ts'), 'function compute() { \n const outputValue = 1; \n return outputValue + 1; \n }');
    
    // File C: Structurally Deviant (Added conditional logic)
    fs.writeFileSync(path.join(testDir, 'deviant.ts'), 'function calculate() { const x = 1; if (x > 0) { return x + 1; } return 0; }');
  });

  afterAll(() => {
    fs.rmSync(testDir, { recursive: true, force: true });
  });

  it('Must reject flat regex and prove mathematical immunity to variable renaming', () => {
    const getVector = (file: string) => {
      const out = execSync(`npx tsx src/bin/check.ts code-vector ${path.join(testDir, file)}`, { encoding: 'utf-8' });
      const vectorObj = JSON.parse(out).vector;
      const arr = new Float64Array(1024);
      for (const key in vectorObj) {
        arr[Number(key)] = vectorObj[key];
      }
      return arr;
    };

    const vecBaseline = getVector('baseline.ts');
    const vecRenamed = getVector('renamed.ts');
    const vecDeviant = getVector('deviant.ts');

    // Calculate Cosine Similarities
    const calcParity = (v1: Float64Array, v2: Float64Array) => {
      let dot = 0, mag1 = 0, mag2 = 0;
      for (let i = 0; i < 1024; i++) {
        dot += v1[i] * v2[i];
        mag1 += v1[i] * v1[i];
        mag2 += v2[i] * v2[i];
      }
      if (mag1 === 0 || mag2 === 0) return 0;
      return dot / (Math.sqrt(mag1) * Math.sqrt(mag2));
    };

    const deltaRenamed = 1.0 - calcParity(vecBaseline, vecRenamed);
    const deltaDeviant = 1.0 - calcParity(vecBaseline, vecDeviant);

    // Identical AST structure (just different variable names) MUST yield near zero delta
    expect(deltaRenamed).toBeLessThan(0.01);
    
    // Different AST structure (added an IF block) MUST yield a severe delta shift
    expect(deltaDeviant).toBeGreaterThan(0.02);
  });
});

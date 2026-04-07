import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

describe('TDB 2: Strict Vector Delta (Δ) Enforcement', () => {
  const testDir = path.join(__dirname, '.temp_delta_sprints');

  beforeAll(() => {
    if (!fs.existsSync(testDir)) fs.mkdirSync(testDir, { recursive: true });
  });

  afterAll(() => {
    fs.rmSync(testDir, { recursive: true, force: true });
  });

  it('Must exit with code 1 and mathematically reject the commit when Delta > 0.02', () => {
    // Create two vastly different mock vectors to simulate a hallucinated commit
    const vectorA = new Array(1024).fill(0.0);
    const vectorB = new Array(1024).fill(0.0);
    
    vectorA[0] = 1.0; 
    vectorA[8] = 0.8;
    
    vectorB[0] = 0.1; // Massive architectural drift
    vectorB[8] = 0.0;

    const targetPath = path.join(testDir, 'target_vector.json');
    const currentPath = path.join(testDir, 'current_vector.json');
    
    fs.writeFileSync(targetPath, JSON.stringify({ vector: vectorA }));
    fs.writeFileSync(currentPath, JSON.stringify({ vector: vectorB }));

    let errorThrown = false;
    try {
      // The CLI must calculate Delta and throw a fatal error because 
      // the cosine similarity will be vastly below 0.98 (Delta > 0.02)
      execSync(`npx tsx src/bin/check.ts delta --target ${targetPath} --current ${currentPath}`, { stdio: 'pipe' });
    } catch (error: any) {
      errorThrown = true;
      expect(error.status).toBe(1); // Must exit with non-zero code
    }

    expect(errorThrown).toBe(true);
  });

  it('Must exit with code 0 when structural parity is maintained (Delta <= 0.02)', () => {
    // Create nearly identical vectors
    const vectorA = new Array(1024).fill(0.0);
    const vectorB = new Array(1024).fill(0.0);
    
    vectorA[0] = 1.0;
    vectorB[0] = 0.99; // Minor, acceptable floating point variance

    const targetPath = path.join(testDir, 'target_valid.json');
    const currentPath = path.join(testDir, 'current_valid.json');
    
    fs.writeFileSync(targetPath, JSON.stringify({ vector: vectorA }));
    fs.writeFileSync(currentPath, JSON.stringify({ vector: vectorB }));

    // Should pass cleanly without throwing
    const output = execSync(`npx tsx src/bin/check.ts delta --target ${targetPath} --current ${currentPath}`, { encoding: 'utf-8' });
    
    // Similarity should be printed if successful
    expect(output).toMatch(/similarity/i);
  });
});

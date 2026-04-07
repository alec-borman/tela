import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

describe('TDB 3: Deterministic Intent Retrieval (DIR) via LanceDB', () => {
  const testDir = path.join(__dirname, '.temp_dir_sprints');
  const targetPath = path.join(testDir, 'target_query.json');

  beforeAll(() => {
    if (!fs.existsSync(testDir)) fs.mkdirSync(testDir, { recursive: true });
    
    // Mock a target vector for the DIR query
    const targetVector = new Array(1024).fill(0.0);
    targetVector[0] = 1.0; 
    targetVector[9] = 0.85;
    
    fs.writeFileSync(targetPath, JSON.stringify({ vector: targetVector }));
  });

  afterAll(() => {
    fs.rmSync(testDir, { recursive: true, force: true });
  });

  it('Must execute the retrieve command and output DIR results based on geometric similarity', () => {
    let output = '';
    try {
      // Execute the CLI retrieve command with a threshold parameter
      output = execSync(`npx tsx src/bin/check.ts retrieve ${targetPath} --threshold 0.80`, { encoding: 'utf-8' });
    } catch (error: any) {
      console.error(error.stdout?.toString());
      throw error;
    }
    
    // Verify the CLI correctly invokes the DIR engine and prints the expected geometric telemetry
    expect(output).toMatch(/Deterministic Intent Retrieval/i);
    expect(output).toMatch(/Threshold: > 0.80/i);
  });
});

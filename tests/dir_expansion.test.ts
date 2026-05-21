import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { DIREngine } from '../src/indexer/dir';
import { LanceDBManager } from '../src/indexer/lance_db';

describe('Phase 4: DIR Dependency Expansion & Hybrid Search', () => {
  const testDir = path.join(__dirname, '.temp_dir_expansion');
  const dbPath = path.join(__dirname, '.lancedb_test_expansion');

  beforeAll(async () => {
    if (!fs.existsSync(testDir)) fs.mkdirSync(testDir, { recursive: true });
    
    // File A: Defines an interface
    fs.writeFileSync(path.join(testDir, 'types.ts'), 'export interface TeleportationVector { x: number; y: number; z: number; }');
    
    // File B: Uses the interface
    fs.writeFileSync(path.join(testDir, 'logic.ts'), 'import { TeleportationVector } from "./types";\nexport function calculate(v: TeleportationVector) { return v.x + v.y; }');
  });

  afterAll(() => {
    fs.rmSync(testDir, { recursive: true, force: true });
    fs.rmSync(dbPath, { recursive: true, force: true });
  });

  it('Must structurally expand the Lean Context to include necessary external interfaces', async () => {
    const engine = new DIREngine();
    // Isolate the DB for testing
    (engine as any).dbManager = new LanceDBManager(dbPath);
    
    // Index the temporary workspace
    await engine.indexDirectory(testDir);
    
    // Target vector heavily weighted toward logic.ts
    const targetVector = new Float64Array(1024).fill(0.0);
    targetVector[0] = 1.0; 
    
    // Execute DIR retrieval
    const results = await engine.retrieve(targetVector, 0.0, 5);
    const output = results.map((r: any) => r.content).join('\n');

    // The output MUST contain the primary logic block
    expect(output).toContain('export function calculate(v: TeleportationVector)');
    
    // The output MUST have expanded the context graph to include the interface definition
    // even though the interface itself wasn't the primary geometric match
    expect(output).toContain('export interface TeleportationVector');
  });
});

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('TDB: Fix Delta Computation Skip Logic', () => {
  it('Must unconditionally generate code_vector.json and handle missing targets gracefully', () => {
    const deltaPath = path.join(process.cwd(), '.github/workflows/delta.yml');
    if (fs.existsSync(deltaPath)) {
      const content = fs.readFileSync(deltaPath, 'utf-8');
      
      // Ensure codebase vector generation is no longer trapped behind an if-statement
      expect(content).toMatch(/code-vector \. > code_vector\.json\s*(?:\n|.)*if \[ ! -f "\$TARGET_FILE" \]/);
      
      // Ensure target file is updated to .md
      expect(content).toContain('sprint_target.md');
    }
  });
});

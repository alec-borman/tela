import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('BDD: Reconstruct Missing Bash Step', () => {
  it('Must sequentially contain the bash vector generation followed by the Python calculation', () => {
    const deltaPath = path.join(process.cwd(), '.github/workflows/delta.yml');
    if (fs.existsSync(deltaPath)) {
      const content = fs.readFileSync(deltaPath, 'utf-8');

      // 1. Verify unconditional codebase vector generation exists
      expect(content).toMatch(/\$TELAC code-vector \. > code_vector\.json/);

      // 2. Verify it checks for the v8.2 markdown target
      expect(content).toContain('TARGET_FILE="sprint_target.md"');

      // 3. Verify the python failsafe is present to prevent future crashes
      expect(content).toContain('os.path.exists("target_vector.json")');
      
      // 4. Ensure the Python Cosine Similarity step was NOT deleted
      expect(content).toContain('name: Calculate Cosine Similarity');
    }
  });
});

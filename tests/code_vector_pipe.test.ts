import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('TDB: Fix code_vector.json Pipeline Fracture', () => {
  it('Must explicitly generate code_vector.json in delta.yml', () => {
    const deltaPath = path.join(process.cwd(), '.github/workflows/delta.yml');
    if (fs.existsSync(deltaPath)) {
      const content = fs.readFileSync(deltaPath, 'utf-8');
      // Ensure the file contains the specific pipe command
      expect(content).toMatch(/>\s*code_vector\.json/);
    }
  });
});

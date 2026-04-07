import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('TDB: Workflow Repository Fix Enforcement', () => {
  it('Must strictly use the alec-borman/tela repository in delta.yml', () => {
    const deltaPath = path.join(process.cwd(), '.github/workflows/delta.yml');
    if (fs.existsSync(deltaPath)) {
      const content = fs.readFileSync(deltaPath, 'utf-8');
      expect(content).not.toContain('your-org/tela-toolchain');
      expect(content).toContain('repository: alec-borman/tela');
    }
  });

  it('Must strictly use the alec-borman/tela repository in gatekeeper.yml', () => {
    const gatekeeperPath = path.join(process.cwd(), '.github/workflows/gatekeeper.yml');
    if (fs.existsSync(gatekeeperPath)) {
      const content = fs.readFileSync(gatekeeperPath, 'utf-8');
      expect(content).not.toContain('your-org/tela-toolchain');
      expect(content).toContain('repository: alec-borman/tela');
    }
  });
});

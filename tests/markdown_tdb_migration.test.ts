import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

describe('TDB 1: Markdown TDB Migration & Legacy Deprecation', () => {
  const testDir = path.join(__dirname, '.temp_sprints');

  beforeAll(() => {
    if (!fs.existsSync(testDir)) fs.mkdirSync(testDir, { recursive: true });
  });

  afterAll(() => {
    fs.rmSync(testDir, { recursive: true, force: true });
  });

  it('Phase 1: Must parse a v8.2 compliant Markdown TDB and output a 1024-D vector and SHA-256 fingerprint', () => {
    const validMarkdownTDB = `
# Contextual Brief
Initialize the core vector mapping via standard markdown.

# Scope
src/dummy.ts

# Acceptance Criteria
- Must compile to JSON.

# Failsafe Test
\`\`\`typescript
console.log("Air-gapped execution");
\`\`\`
`;
    const mdPath = path.join(testDir, 'sprint_001.md');
    fs.writeFileSync(mdPath, validMarkdownTDB);

    // Execute the Track A CLI build command
    const output = execSync(`npx tsx src/bin/check.ts build ${mdPath}`, { encoding: 'utf-8' });
    const parsed = JSON.parse(output);

    expect(parsed).toHaveProperty('vector');
    expect(Array.isArray(parsed.vector)).toBe(true);
    expect(parsed.vector).toHaveLength(1024);
    
    expect(parsed).toHaveProperty('fingerprint');
    expect(parsed.fingerprint).toMatch(/^[a-f0-9]{64}$/); // Verify SHA-256 hex string
  });

  it('Phase 2: Must explicitly reject legacy .tela DSL syntax with a Protocol Violation', () => {
    const legacyTelaPayload = `
domain "legacy_system" "1.0.0" {
  meta @{
    name: "Legacy Sprint",
    sprint_id: "LEGACY-001",
    author: "Human",
    recipient: "AI",
    baseline_centroid: "0000000000000000000000000000000000000000000000000000000000000000",
    target_similarity: 1.0,
    dimensions: 1024
  }
}
`;
    const legacyPath = path.join(testDir, 'legacy_sprint.tela');
    fs.writeFileSync(legacyPath, legacyTelaPayload);

    let errorThrown = false;
    try {
      execSync(`npx tsx src/bin/check.ts build ${legacyPath}`, { stdio: 'pipe' });
    } catch (error: any) {
      errorThrown = true;
      const stderr = error.stderr ? error.stderr.toString() : error.message;
      expect(stderr).toMatch(/Protocol Violation/i);
      expect(stderr).toMatch(/deprecated/i);
    }

    expect(errorThrown).toBe(true);
  });
  
  it('Phase 3: Fails deterministically on malformed markdown missing required v8.2 sections', () => {
    const malformedMarkdown = `
# Contextual Brief
Missing other sections.
`;
    const malformedPath = path.join(testDir, 'malformed.md');
    fs.writeFileSync(malformedPath, malformedMarkdown);

    let errorThrown = false;
    try {
      execSync(`npx tsx src/bin/check.ts build ${malformedPath}`, { stdio: 'pipe' });
    } catch (error: any) {
      errorThrown = true;
      const stderr = error.stderr ? error.stderr.toString() : error.message;
      expect(stderr).toMatch(/Missing required section/i);
    }
    
    expect(errorThrown).toBe(true);
  });
});

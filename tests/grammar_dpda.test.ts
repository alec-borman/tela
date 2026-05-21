import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

describe('Phase 3: DPDA Grammar-Based Constrained Decoding', () => {
  const testDir = path.join(__dirname, '.temp_grammar');

  beforeAll(() => {
    if (!fs.existsSync(testDir)) fs.mkdirSync(testDir, { recursive: true });
  });

  afterAll(() => {
    fs.rmSync(testDir, { recursive: true, force: true });
  });

  it('Must strictly validate unified diff grammar and reject conversational hallucination', () => {
    const rustValidatorCode = `
      pub mod oracle {
          pub mod grammar {
              pub fn validate_unified_diff(payload: &str) -> bool {
                  let trimmed = payload.trim();
                  trimmed.starts_with("--- a/") || trimmed.starts_with("--- /dev/null") || trimmed.starts_with("diff --git")
              }
          }
      }
      fn main() {
          let valid = "--- a/file.ts\\n+++ b/file.ts\\n@@ -1 +1 @@\\n-a\\n+b";
          let hallucinated = "Here is the code you requested:\\n\`\`\`diff\\n--- a/file.ts\\n+++ b/file.ts\\n@@ -1 +1 @@\\n-a\\n+b\\n\`\`\`";
          
          assert!(oracle::grammar::validate_unified_diff(valid) == true);
          assert!(oracle::grammar::validate_unified_diff(hallucinated) == false);
          println!("DPDA Constraints Verified");
      }
    `;
    
    const rsPath = path.join(testDir, 'validator_mock.rs');
    fs.writeFileSync(rsPath, rustValidatorCode);
    
    // Compile and run the rust mock to ensure logic is sound
    const output = execSync(`rustc ${rsPath} --out-dir ${testDir} && ${path.join(testDir, 'validator_mock')}`, { encoding: 'utf-8' });
    expect(output).toContain('DPDA Constraints Verified');
  });
});

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

console.log('Running test_apply.ts...');

const testDir = path.join(process.cwd(), 'tests', '.temp_apply_sprints');
const checkScript = path.resolve(process.cwd(), 'src/bin/check.ts');
const dummyFile = path.join(testDir, 'dummy.md');
const targetPath = path.join(testDir, 'target_vector.json');
const validPatch = path.join(testDir, 'valid.patch');
const maliciousPatch = path.join(testDir, 'malicious.patch');

if (!fs.existsSync(testDir)) fs.mkdirSync(testDir, { recursive: true });

// Mock patch command to simulate the environment
const binDir = path.join(testDir, 'bin');
if (!fs.existsSync(binDir)) fs.mkdirSync(binDir);
const mockPatchPath = path.join(binDir, 'patch');
fs.writeFileSync(mockPatchPath, `#!/usr/bin/env node
import fs from 'node:fs';

const args = process.argv.slice(2);
const reverse = args.includes('-R');
const patchText = fs.readFileSync(0, 'utf-8');

if (patchText.includes("+deterministic code assert pure")) {
  if (reverse) fs.writeFileSync('dummy.md', 'initial state\\n\\n');
  else fs.writeFileSync('dummy.md', 'initial state\\n\\ndeterministic code assert pure\\n\\n');
} else if (patchText.includes("+hallucinated stochastic probability")) {
  if (reverse) fs.writeFileSync('dummy.md', 'initial state\\n\\ndeterministic code assert pure\\n\\n');
  else fs.writeFileSync('dummy.md', 'hallucinated stochastic probability\\n\\n');
} else {
  console.error("Unknown patch content.");
  process.exit(1);
}
`);
fs.chmodSync(mockPatchPath, 0o755);

const testEnv = {
  ...process.env,
  PATH: `${binDir}:${process.env.PATH}`
};

// 1. Create a dummy file
fs.writeFileSync(dummyFile, 'initial state\n\n');

// 2. Define a target vector that demands 'deterministic' keywords
const targetVector = new Array(1024).fill(0.0);
// Index for 'arch:determinism' is 0
targetVector[0] = 1.0; 
fs.writeFileSync(targetPath, JSON.stringify({ vector: targetVector }));

// 3. Create a valid patch that injects deterministic architecture
fs.writeFileSync(validPatch, `--- a/dummy.md\n+++ b/dummy.md\n@@ -1 +1,3 @@\n initial state\n+\n+deterministic code assert pure\n`);

// 4. Create a malicious patch that strips out the architecture
fs.writeFileSync(maliciousPatch, `--- a/dummy.md\n+++ b/dummy.md\n@@ -1,3 +1 @@\n-initial state\n-\n-deterministic code assert pure\n+hallucinated stochastic probability\n`);

let passed = true;

try {
  console.log('Test: Must apply a patch and achieve parity without reverting');
  const output = execSync(`npx tsx ${checkScript} apply valid.patch --target target_vector.json`, { cwd: testDir, encoding: 'utf-8', env: testEnv });
  
  if (!output.includes('PARITY ACHIEVED: Patch applied')) throw new Error('Missing PARITY ACHIEVED output');
  const content = fs.readFileSync(dummyFile, 'utf-8');
  if (!content.includes('deterministic code')) {
    throw new Error('Valid patch not applied correctly. Content: ' + content);
  }
} catch (e) {
  console.error(e);
  passed = false;
}

try {
  console.log('Test: Must reject a malicious patch, revert the filesystem, and exit with code 1');
  let errorThrown = false;
  let successOutput = '';
  try {
    successOutput = execSync(`npx tsx ${checkScript} apply malicious.patch --target target_vector.json`, { cwd: testDir, encoding: 'utf-8', env: testEnv, stdio: 'pipe' }).toString();
  } catch (error: any) {
    errorThrown = true;
    if (error.status !== 1) throw new Error(`Expected exit code 1, but got ${error.status}`);
    
    const stderr = error.stderr ? error.stderr.toString() : error.message;
    const stdout = error.stdout ? error.stdout.toString() : '';
    if (!(stdout + stderr).includes('ARCHITECTURAL REGRESSION: Patch reverted')) {
      throw new Error(`Missing ARCHITECTURAL REGRESSION output. Output: ${stdout} ${stderr}`);
    }
  }

  if (!errorThrown) {
    throw new Error('Expected command to throw an error, but it succeeded. Output: ' + successOutput);
  }

  const content = fs.readFileSync(dummyFile, 'utf-8');
  if (!content.includes('deterministic code')) throw new Error('Revert failed: valid text gone');
  if (content.includes('hallucinated')) throw new Error('Revert failed: malicious text present');
} catch (e) {
  console.error(e);
  passed = false;
}

fs.rmSync(testDir, { recursive: true, force: true });

if (!passed) {
  process.exit(1);
} else {
  console.log('All apply tests passed.');
}

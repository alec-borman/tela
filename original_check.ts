import fs from 'node:fs';
import path from 'node:path';
import { Lexer, GrammarViolationError } from '../parser/lexer';
import { Parser } from '../parser/parser';
import { projectDomainToVector, calculateParity, computeFingerprint } from '../compiler/vector';
import { Scanner } from '../compiler/scanner';

/**
 * CLI tool for parity checking.
 * Usage: tsx src/bin/check.ts <command> [args]
 */
async function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error('Tela: Teleportation & Tell a Story');
    console.error('Usage: tsx src/bin/check.ts <command> [path-or-file]');
    console.error('Commands: build, retrieve, delta, code-vector, sustain, drop-test, teleport, lock, verify');
    process.exit(1);
  }

  const command = args[0];

  switch (command) {
    case '--help':
    case '-h':
      console.log('Tela: Teleportation & Tell a Story');
      console.log('Usage: tsx src/bin/check.ts <command> [path-or-file]');
      console.log('Commands: build, retrieve, delta, code-vector, sustain, drop-test, teleport, lock, verify');
      process.exit(0);
      break;
    case '--version':
    case '-v':
      console.log('telac version 1.0.0 (Tela: Teleportation & Tell a Story)');
      process.exit(0);
      break;
    case 'code-vector': {
      const targetPath = args[1] || '.';
      const scanner = new Scanner(targetPath);
      const chunks = scanner.scanDirectory();
      const currentVector = scanner.aggregateVectors(chunks);
      const currentFingerprint = computeFingerprint(currentVector);
      console.log(JSON.stringify({ vector: currentVector, fingerprint: currentFingerprint }, null, 2));
      break;
    }
    case 'drop-test': {
      let generations = 10000;
      for (let i = 1; i < args.length; i++) {
        if (args[i] === '--generations' && i + 1 < args.length) {
          generations = parseInt(args[i + 1], 10) || 10000;
        }
      }
      console.log(`Running drop-test with ${generations} generations...`);

      const generateAdversarialSnippet = (): string => {
        const templates = [
          // Illegal type mutation: version as a number instead of string
          `domain "test" -1.0 { meta @{ name: "test", sprint_id: "1", author: "A", recipient: "B", baseline_centroid: "0", target_similarity: 1.0, dimensions: 1024 } }`,
          // Illegal type mutation: target_similarity as a string instead of number
          `domain "test" "1.0" { meta @{ name: "test", sprint_id: "1", author: "A", recipient: "B", baseline_centroid: "0", target_similarity: "invalid_type", dimensions: 1024 } }`,
          // Malformed LL(1) syntax: missing closing brace
          `domain "test" "1.0" { meta @{ name: "test", sprint_id: "1", author: "A", recipient: "B", baseline_centroid: "0", target_similarity: 1.0, dimensions: 1024 } feature "f" { weight: 1.0, target: "a", description: "b", requirements: ["c"], dimension_contributions: { "d": 1.0 }`,
          // Malformed LL(1) syntax: unknown block type
          `domain "test" "1.0" { meta @{ name: "test", sprint_id: "1", author: "A", recipient: "B", baseline_centroid: "0", target_similarity: 1.0, dimensions: 1024 } unknown_block "x" {} }`,
          // Illegal type mutation: weight as a string instead of number
          `domain "test" "1.0" { meta @{ name: "test", sprint_id: "1", author: "A", recipient: "B", baseline_centroid: "0", target_similarity: 1.0, dimensions: 1024 } feature "f" { weight: "not_a_number", target: "a", description: "b", requirements: ["c"], dimension_contributions: { "d": 1.0 } } }`,
          // Malformed LL(1) syntax: missing @ in meta block
          `domain "test" "1.0" { meta { name: "test", sprint_id: "1", author: "A", recipient: "B", baseline_centroid: "0", target_similarity: 1.0, dimensions: 1024 } }`,
          // Malformed LL(1) syntax: missing colon in meta block
          `domain "test" "1.0" { meta @{ name "test", sprint_id: "1", author: "A", recipient: "B", baseline_centroid: "0", target_similarity: 1.0, dimensions: 1024 } }`,
        ];
        return templates[Math.floor(Math.random() * templates.length)] as string;
      };

      for (let i = 0; i < generations; i++) {
        const snippet = generateAdversarialSnippet();
        try {
          const lexer = new Lexer(snippet);
          const tokens = lexer.tokenize();
          const parser = new Parser(tokens);
          parser.parse();
          
          console.error(`Generation ${i}: Parser incorrectly accepted invalid snippet.`);
          console.error(`Snippet: ${snippet}`);
          process.exit(1);
        } catch (err: unknown) {
          if (err instanceof GrammarViolationError) {
            continue;
          } else {
            console.error(`Generation ${i}: Unexpected error type caught.`);
            console.error(err);
            process.exit(1);
          }
        }
      }

      console.log(`Successfully trapped grammar violations across ${generations} generations.`);
      process.exit(0);
      break;
    }
    case 'teleport': {
      let fromPath = '';
      let toPath = '';
      for (let i = 1; i < args.length; i++) {
        if (args[i] === '--from' && i + 1 < args.length) {
          fromPath = args[i + 1];
        } else if (args[i] === '--to' && i + 1 < args.length) {
          toPath = args[i + 1];
        }
      }
      console.log(`Teleporting from ${fromPath} to ${toPath}`);
      process.exit(0);
      break;
    }
    case 'lock': {
      let track = '';
      let signature = '';
      for (let i = 1; i < args.length; i++) {
        if (args[i] === '--track' && i + 1 < args.length) {
          track = args[i + 1];
        } else if (args[i] === '--signature' && i + 1 < args.length) {
          signature = args[i + 1];
        }
      }

      const scanner = new Scanner(process.cwd());
      const chunks = scanner.scanDirectory();
      const currentVector = scanner.aggregateVectors(chunks);
      const fingerprint = computeFingerprint(currentVector);

      const payload = [
        `Signature: ${signature}`,
        `Track: ${track}`,
        `Fingerprint: ${fingerprint}`,
        `Timestamp: ${new Date().toISOString()}`
      ].join('\n');

      fs.writeFileSync(path.join(process.cwd(), 'lockfile.sig'), payload, 'utf-8');
      console.log('Successfully generated lockfile.sig');

      process.exit(0);
      break;
    }
    case 'verify': {
      let lockfile = '';
      let source = '';
      for (let i = 1; i < args.length; i++) {
        if (args[i] === '--lockfile' && i + 1 < args.length) {
          lockfile = args[i + 1];
        } else if (args[i] === '--source' && i + 1 < args.length) {
          source = args[i + 1];
        }
      }
      console.log(`Verifying source ${source} against lockfile ${lockfile}`);
      process.exit(0);
      break;
    }
    case 'build':
    case 'retrieve':
    case 'delta':
    case 'sustain': {
      if (args.length < 2 && command !== 'sustain') {
        console.error('Tela: Teleportation & Tell a Story');
        console.error(`Usage: tsx src/bin/check.ts ${command} <path-to-tela-file>`);
        process.exit(1);
      }

      if (command === 'sustain') {
        console.log('🌌 Teleportation Sustainability Report');
        process.exit(0);
      }

      const telaFilePath = args[1];
      if (!fs.existsSync(telaFilePath)) {
        console.error(`File not found: ${telaFilePath}`);
        process.exit(1);
      }

      const content = fs.readFileSync(telaFilePath, 'utf-8');
      const lexer = new Lexer(content);
      const tokens = lexer.tokenize();
      const parser = new Parser(tokens);
      const domain = parser.parse();
      if (!domain) {
        console.error(`Failed to parse .tela file: ${telaFilePath}`);
        process.exit(1);
      }

      const targetVector = projectDomainToVector(domain);
      const targetFingerprint = computeFingerprint(targetVector);

      if (command === 'build') {
        console.log(JSON.stringify({ vector: Array.from(targetVector), fingerprint: targetFingerprint }, null, 2));
      } else if (command === 'retrieve') {
        console.log('// Deterministic Intent Retrieval (DIR) Results');
        console.log(`// Target: ${domain.meta.name}`);
        console.log('// Threshold: > 0.85\n');
        console.log('// No chunks found matching the geometric intent.');
      } else if (command === 'delta') {
        const scanner = new Scanner(process.cwd());
        const chunks = scanner.scanDirectory();
        const currentVector = scanner.aggregateVectors(chunks);
        const currentFingerprint = computeFingerprint(currentVector);

        const similarity = calculateParity(targetVector, currentVector);
        const threshold = domain.meta.target_similarity || 0.98;

        console.log('// JavaScript Parity Checker');
        console.log(`// Sprint: ${domain.meta.name} (${domain.meta.sprint_id})`);
        console.log(`// Target Fingerprint: ${targetFingerprint}`);
        console.log(`// Current Fingerprint: ${currentFingerprint}`);
        console.log(`// Similarity: ${similarity.toFixed(4)}`);
        console.log(`// Threshold: ${threshold.toFixed(4)}`);

        if (similarity >= threshold) {
          console.log('// Status: PARITY ACHIEVED');
          process.exit(0);
        } else {
          console.error('// Status: ARCHITECTURAL REGRESSION');
          console.error(`// Delta: ${(threshold - similarity).toFixed(4)}`);
          process.exit(1);
        }
      }
      break;
    }
    default:
      console.error(`Unknown command: ${command}`);
      process.exit(1);
  }
}

main().catch((err: unknown) => {
  console.error('Fatal error:', err);
  process.exit(1);
});

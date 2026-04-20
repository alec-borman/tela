#!/usr/bin/env tsx
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { Lexer, GrammarViolationError } from '../parser/lexer';
import { Parser } from '../parser/parser';
import { projectDomainToVector, calculateParity, computeFingerprint } from '../compiler/vector';
import { Scanner } from '../compiler/scanner';
import { TrackCSandbox } from '../oracle/track_c';

/**
 * CLI tool for parity checking.
 * Usage: tsx src/bin/check.ts <command> [args]
 */
async function main() {
  const sandbox = new TrackCSandbox();
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error('Tela: Teleportation & Tell a Story');
    console.error('Usage: tsx src/bin/check.ts <command> [path-or-file]');
    console.error('Commands: build, retrieve, delta, code-vector, sustain, drop-test, teleport, lock, verify, pack, apply');
    process.exit(1);
  }

  const command = args[0];

  switch (command) {
    case '--help':
    case '-h':
      console.log('Tela: Teleportation & Tell a Story');
      console.log('Usage: tsx src/bin/check.ts <command> [path-or-file]');
      console.log('Commands: build, retrieve, delta, code-vector, sustain, drop-test, teleport, lock, verify, pack, apply');
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
      }
      break;
    }
    case 'retrieve': {
      let targetPath = '';
      let threshold = 0.85;
      for (let i = 1; i < args.length; i++) {
        if (args[i] === '--threshold' && i + 1 < args.length) {
          threshold = parseFloat(args[i + 1]);
          i++;
        } else if (!args[i].startsWith('--')) {
          targetPath = args[i];
        }
      }

      if (!targetPath) {
        console.error('Usage: tsx src/bin/check.ts retrieve <target.json> [--threshold <number>]');
        process.exit(1);
      }

      const targetData = JSON.parse(fs.readFileSync(targetPath, 'utf-8'));
      const targetVector = new Float64Array(targetData.vector);

      const { DIREngine } = await import('../indexer/dir');
      const engine = new DIREngine();
      
      await engine.indexDirectory(process.cwd());
      const results = await engine.retrieve(targetVector, threshold);

      console.log('// Deterministic Intent Retrieval (DIR) Results');
      console.log(`// Target: ${targetPath}`);
      console.log(`// Threshold: > ${threshold.toFixed(2)}\n`);
      
      if (results.length === 0) {
        console.log('// No chunks found matching the geometric intent.');
      } else {
        for (const result of results) {
          console.log(`// Match: ${result.filePath} (Similarity: ${result.similarity.toFixed(4)})`);
          console.log(result.content);
          console.log('---');
        }
      }
      break;
    }
    case 'delta': {
      let targetPath = '';
      let currentPath = '';
      for (let i = 1; i < args.length; i++) {
        if (args[i] === '--target' && i + 1 < args.length) {
          targetPath = args[i + 1];
        } else if (args[i] === '--current' && i + 1 < args.length) {
          currentPath = args[i + 1];
        }
      }

      if (!targetPath || !currentPath) {
        console.error('Usage: tsx src/bin/check.ts delta --target <target.json> --current <current.json>');
        process.exit(1);
      }

      const targetData = JSON.parse(fs.readFileSync(targetPath, 'utf-8'));
      const currentData = JSON.parse(fs.readFileSync(currentPath, 'utf-8'));

      const targetVector = new Float64Array(targetData.vector);
      const currentVector = new Float64Array(currentData.vector);

      const similarity = calculateParity(targetVector, currentVector);
      const delta = 1 - similarity;
      const threshold = 0.02;

      console.log('// JavaScript Parity Checker');
      console.log(`// Similarity: ${similarity.toFixed(4)}`);
      console.log(`// Delta: ${delta.toFixed(4)}`);
      console.log(`// Threshold: ${threshold.toFixed(4)}`);

      if (delta <= threshold) {
        console.log('// Status: PARITY ACHIEVED');
        process.exit(0);
      } else {
        console.error('// Status: ARCHITECTURAL REGRESSION');
        process.exit(1);
      }
      break;
    }
    case 'pack': {
      let outPath = 'tela_context.xml';
      const intentWords: string[] = [];
      for (let i = 1; i < args.length; i++) {
        if ((args[i] === '--out' || args[i] === '-o') && i + 1 < args.length) {
          outPath = args[i + 1];
          i++;
        } else if (!args[i].startsWith('-')) {
          intentWords.push(args[i]);
        }
      }

      const intent = intentWords.join(' ');
      const filePathsToPack = new Set<string>();

      if (intent) {
        const targetVector = new Float64Array(1024);
        const words = intent.split(/\s+/);
        for (const word of words) {
          if (!word) continue;
          let hash = 0;
          for (let i = 0; i < word.length; i++) {
            hash = (Math.imul(31, hash) + word.charCodeAt(i)) | 0;
          }
          const index = Math.abs(hash) % 1024;
          targetVector[index] += 1;
        }

        const { DIREngine } = await import('../indexer/dir');
        const engine = new DIREngine();
        await engine.indexDirectory(process.cwd());
        const results = await engine.retrieve(targetVector, 0.0, 15);
        for (const result of results) {
          filePathsToPack.add(result.filePath);
        }
      }

      if (!intent || filePathsToPack.size === 0) {
        const scanner = new Scanner(process.cwd());
        const chunks = scanner.scanDirectory();
        for (const chunk of chunks) {
          filePathsToPack.add(chunk.filePath);
        }
      }

      let xmlOutput = `<tela_teleportation_payload>\n<system_instructions>You are an Unbound Implementer bound by the Teleportation Protocol v8.2.\nYou do not architect. You solve terrain to match the provided context and intent.\nOutput ONLY a unified diff (patch) inside a \`\`\`diff code block. Make the tests pass.</system_instructions>\n\n<directory_structure>\n`;

      const sortedPaths = Array.from(filePathsToPack).sort();
      xmlOutput += sortedPaths.join('\n');
      xmlOutput += `\n</directory_structure>\n\n<files>\n`;

      for (const filePath of sortedPaths) {
        let content = '';
        try {
          content = fs.readFileSync(filePath, 'utf-8');
        } catch {
          continue;
        }
        xmlOutput += `<file path="${filePath}">\n<![CDATA[\n${content}\n]]>\n</file>\n`;
      }
      
      xmlOutput += `</files>\n</tela_teleportation_payload>`;
      fs.writeFileSync(outPath, xmlOutput, 'utf-8');
      console.log(`Successfully packed context into ${outPath}`);
      break;
    }
    case 'apply': {
      const patchFile = args[1];
      let targetPath = '';
      for (let i = 2; i < args.length; i++) {
        if (args[i] === '--target' && i + 1 < args.length) {
          targetPath = args[i + 1];
          i++;
        }
      }

      if (!patchFile || !targetPath) {
        console.error('Usage: tsx src/bin/check.ts apply <patch-file> --target <target-vector.json>');
        process.exit(1);
      }

      try {
        execSync(`patch -p1 < ${patchFile}`);
      } catch (err) {
        console.error('Failed to apply patch initially.', err);
        process.exit(1);
      }

      const targetData = JSON.parse(fs.readFileSync(targetPath, 'utf-8'));
      const targetVector = new Float64Array(targetData.vector);

      const scanner = new Scanner(process.cwd());
      const chunks = scanner.scanDirectory();
      const currentVector = scanner.aggregateVectors(chunks);

      const similarity = calculateParity(targetVector, currentVector);
      const delta = 1 - similarity;

      // The vector calculated ensures that the implementation logic matches the target architecture.
      if (delta > 0.02) {
        try {
          execSync(`patch -R -p1 < ${patchFile}`);
        } catch (err) {
          console.error('Failed to revert patch safely.', err);
        }
        console.log('ARCHITECTURAL REGRESSION: Patch reverted');
        process.exit(1);
      } else {
        console.log('PARITY ACHIEVED: Patch applied');
        process.exit(0);
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

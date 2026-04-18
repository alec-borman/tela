import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

console.log('Running test_pack.ts...');

const xmlPath = path.join(process.cwd(), 'tela_context.xml');
if (fs.existsSync(xmlPath)) fs.unlinkSync(xmlPath);

const out = execSync('npx tsx src/bin/check.ts pack "search test vector intent"').toString();
if (!out.includes('Successfully packed context into tela_context.xml')) {
  throw new Error('Missing success message in output');
}

const content = fs.readFileSync(xmlPath, 'utf-8');
if (!content.includes('<tela_teleportation_payload>')) throw new Error('Missing payload wrapper');
if (!content.includes('<system_instructions>You are an Unbound Implementer bound by the Teleportation Protocol v8.2.')) throw new Error('Missing system instructions');
if (!content.includes('<directory_structure>')) throw new Error('Missing directory structure');
if (!content.includes('<files>')) throw new Error('Missing files');

const customPath = path.join(process.cwd(), 'custom_pack.xml');
if (fs.existsSync(customPath)) fs.unlinkSync(customPath);

const out2 = execSync(`npx tsx src/bin/check.ts pack -o custom_pack.xml`).toString();
if (!out2.includes('Successfully packed context into custom_pack.xml')) throw new Error('Failed custom output');
if (!fs.existsSync(customPath)) throw new Error('Custom file not found');

console.log('All tests passed.');

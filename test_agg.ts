import { Scanner } from './src/compiler/scanner.ts';
import path from 'path';
import fs from 'fs';

const scanner = new Scanner(process.cwd());
const targetPath = path.join(process.cwd(), 'tests/.temp_astnn/baseline.ts');
console.log('Exists?', fs.existsSync(targetPath));
const chunks = scanner.scanDirectory(targetPath);

console.log(chunks.length);

import fs from 'fs';
import * as Diff from 'diff';

const files = [
  { path: 'README.md', original: 'original_readme.md' },
  { path: 'docs/manifesto.md', original: 'original_manifesto.md' },
  { path: 'docs/studio_dev.md', original: 'original_studio_dev.md' }
];

let diffOutput = '';

const newReadme = fs.readFileSync('README.md', 'utf-8');
const newManifesto = fs.readFileSync('docs/manifesto.md', 'utf-8');
const newStudioDev = fs.readFileSync('docs/studio_dev.md', 'utf-8');

for (const file of files) {
  const original = fs.readFileSync(file.original, 'utf-8');
  const current = fs.readFileSync(file.path, 'utf-8');
  const patch = Diff.createPatch(file.path, original, current, '', '');
  const lines = patch.split('\n');
  const cleanPatch = lines.slice(2).join('\n');
  diffOutput += `--- a/${file.path}\n+++ b/${file.path}\n${cleanPatch}\n`;
}

fs.writeFileSync('diff_output.txt', diffOutput);
console.log('Diff generated.');

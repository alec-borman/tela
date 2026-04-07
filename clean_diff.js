import fs from 'fs';

const patch = fs.readFileSync('diff_output.txt', 'utf-8');
const lines = patch.split('\n');
const cleanLines = [];
for (let i = 0; i < lines.length; i++) {
  if (lines[i].startsWith('--- src/') || lines[i].startsWith('+++ src/')) {
    continue;
  }
  cleanLines.push(lines[i]);
}
fs.writeFileSync('clean_diff.txt', cleanLines.join('\n'));

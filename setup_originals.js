import fs from 'fs';
import * as Diff from 'diff';

const files = [
  { path: 'README.md', original: 'original_readme.md' },
  { path: 'docs/manifesto.md', original: 'original_manifesto.md' },
  { path: 'docs/studio_dev.md', original: 'original_studio_dev.md' }
];

for (const file of files) {
  if (!fs.existsSync(file.original)) {
    fs.writeFileSync(file.original, fs.readFileSync(file.path, 'utf-8'));
  }
}

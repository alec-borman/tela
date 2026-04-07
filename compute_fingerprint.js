import { createHash } from 'crypto';

const vector = new Array(1024).fill(0.0);
vector[0] = 0.95;
vector[7] = 0.95;

const vectorJson = '[' + vector.map(v => v === 0 ? '0.0' : v.toString()).join(',') + ']';
const hash = createHash('sha256').update(vectorJson).digest('hex');

console.log(hash);

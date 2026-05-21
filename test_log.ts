import * as fs from 'fs';
import Parser from 'tree-sitter';
import TypeScript from 'tree-sitter-typescript';
import { calculateDepthDecay } from './src/compiler/manifest.ts';

const parser = new Parser();
parser.setLanguage(TypeScript.typescript);

const content = 'function calculate() { const x = 1; return x + 1; }';
const tree = parser.parse(content);

console.log('root node:', tree.rootNode.type);
console.log('child:', tree.rootNode.child(0)?.type);

let vector = new Float64Array(1024);
const traverse = (currentNode: Parser.SyntaxNode, currentDepth: number) => {
  const typeStr = currentNode.type;
  let hash = 0;
  for (let i = 0; i < typeStr.length; i++) {
    hash = (Math.imul(31, hash) + typeStr.charCodeAt(i)) | 0;
  }
  const index = Math.abs(hash) % 1024;
  const weight = calculateDepthDecay(currentDepth);
  vector[index] += weight;

  for (let i = 0; i < currentNode.childCount; i++) {
    const child = currentNode.child(i);
    if (child) traverse(child, currentDepth + 1);
  }
};

traverse(tree.rootNode.child(0)!, 0);

console.log('non-zero:', Object.entries(vector).filter(([k,v]) => v > 0));

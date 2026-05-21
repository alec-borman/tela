import Parser from 'tree-sitter';
import TypeScript from 'tree-sitter-typescript';
const p = new Parser(); p.setLanguage(TypeScript.typescript);
const root = p.parse('function calculate() { const x = 1; return x + 1; }').rootNode;
for(let i=0; i<root.childCount;i++) {
  console.log(root.child(i)?.type);
}

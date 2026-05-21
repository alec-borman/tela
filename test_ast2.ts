import Parser from 'tree-sitter';
import TypeScript from 'tree-sitter-typescript';
const p = new Parser(); p.setLanguage(TypeScript.typescript);
const content = 'function compute() { \n const outputValue = 1; \n return outputValue + 1; \n }';
const root = p.parse(content).rootNode;
const printNode = (n: Parser.SyntaxNode, d=0) => {
  console.log(' '.repeat(d*2) + n.type);
  for(let i=0; i<n.childCount;i++) printNode(n.child(i)!, d+1);
}
printNode(root);

import { readFileSync } from 'fs';
import { Lexer } from './src/parser/lexer';
import { Parser } from './src/parser/parser';

try {
  const content = readFileSync('sprint_002_tree_sitter.tela', 'utf-8');
  const lexer = new Lexer(content);
  const tokens = lexer.tokenize();
  const parser = new Parser(tokens);
  const ast = parser.parse();
  console.log("Valid!");
} catch (e) {
  console.error(e);
  process.exit(1);
}

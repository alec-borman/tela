import fs from 'node:fs';
import path from 'node:path';
import { Vector1024 } from './vector';
import { getDimensionIndex, calculateDepthDecay } from './manifest';
import Parser from 'tree-sitter';
import TypeScript from 'tree-sitter-typescript';

export interface CodeChunk {
  filePath: string;
  content: string;
  vector: Vector1024;
  depth: number;
}

/**
 * Scans the project directory and extracts code chunks.
 * Uses tree-sitter for accurate AST extraction.
 */
export class Scanner {
  private projectRoot: string;
  private tsParser: Parser;
  private tsxParser: Parser;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
    this.tsParser = new Parser();
    this.tsParser.setLanguage(TypeScript.typescript);
    this.tsxParser = new Parser();
    this.tsxParser.setLanguage(TypeScript.tsx);
  }

  /**
   * Scans the directory and returns all extracted chunks.
   */
  public scanDirectory(targetPath: string = this.projectRoot): CodeChunk[] {
    const chunks: CodeChunk[] = [];
    let files: string[] = [];

    if (fs.existsSync(targetPath)) {
      const stats = fs.statSync(targetPath);
      if (stats.isFile()) {
        files = [targetPath];
      } else if (stats.isDirectory()) {
        files = this.getFiles(targetPath);
      }
    }

    for (const file of files) {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        chunks.push(...this.extractTsChunks(file));
      } else if (file.endsWith('.rs') || file.endsWith('.md')) {
        // Rust chunks and Markdown are handled by the simulated scanner
        chunks.push(...this.extractSimulatedChunks(file));
      }
    }

    return chunks;
  }

  private getFiles(dir: string): string[] {
    const files: string[] = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.git' || entry.name === 'target') {
          continue;
        }
        files.push(...this.getFiles(fullPath));
      } else {
        files.push(fullPath);
      }
    }

    return files;
  }

  private extractTsChunks(filePath: string): CodeChunk[] {
    const content = fs.readFileSync(filePath, 'utf-8');
    const parser = filePath.endsWith('.tsx') ? this.tsxParser : this.tsParser;
    const tree = parser.parse(content, undefined, { bufferSize: Math.max(1024 * 1024, content.length * 2) });
    const chunks: CodeChunk[] = [];

    this.traverseTsAst(tree.rootNode, content, filePath, 0, chunks);
    return chunks;
  }

  private traverseTsAst(node: Parser.SyntaxNode, source: string, filePath: string, depth: number, chunks: CodeChunk[]) {
    const kind = node.type;
    
    const isChunk = [
      'function_declaration',
      'class_declaration',
      'method_definition',
      'interface_declaration',
      'type_alias_declaration',
      'enum_declaration',
      'export_statement'
    ].includes(kind);

    if (isChunk) {
      const content = source.substring(node.startIndex, node.endIndex);
      if (content.length > 20) { // Skip tiny chunks
        const vector = this.projectChunkToVector(node, depth);
        chunks.push({
          filePath,
          content,
          vector,
          depth
        });
      }
    }

    for (let i = 0; i < node.childCount; i++) {
      const child = node.child(i);
      if (child) {
        const nextDepth = isChunk ? depth + 1 : depth;
        this.traverseTsAst(child, source, filePath, nextDepth, chunks);
      }
    }
  }

  private extractSimulatedChunks(filePath: string): CodeChunk[] {
    const content = fs.readFileSync(filePath, 'utf-8');
    const blocks = content.split('\n\n');
    const chunks: CodeChunk[] = [];

    for (const block of blocks) {
      if (block.trim().length < 10) continue;
      const depth = block.startsWith(' ') || block.startsWith('\t') ? 2 : 1;
      
      const tree = this.tsParser.parse(block);
      const vector = this.projectChunkToVector(tree.rootNode, depth);
      
      chunks.push({
        filePath,
        content: block,
        vector,
        depth
      });
    }

    return chunks;
  }

  private projectChunkToVector(node: Parser.SyntaxNode, startDepth: number): Vector1024 {
    const vector = new Float64Array(1024);

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

    traverse(node, startDepth);
    return vector;
  }

  public aggregateVectors(chunks: CodeChunk[]): Vector1024 {
    const totalVector = new Float64Array(1024);
    for (const chunk of chunks) {
      for (let i = 0; i < 1024; i++) {
        totalVector[i] += chunk.vector[i];
      }
    }
    return totalVector;
  }
}

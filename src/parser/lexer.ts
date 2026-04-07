export type TokenType =
  | 'HEADING'
  | 'TEXT'
  | 'CODE_BLOCK'
  | 'LIST_ITEM'
  | 'EOF';

export interface Token {
  type: TokenType;
  value: string;
  line: number;
  column: number;
}

export class GrammarViolationError extends Error {
  constructor(message: string, public line: number, public column: number) {
    super(`Grammar Violation at ${line}:${column} - ${message}`);
    this.name = 'GrammarViolationError';
  }
}

export class Lexer {
  private input: string;
  private position: number = 0;
  private line: number = 1;
  private column: number = 1;

  constructor(input: string) {
    this.input = input;
  }

  private advance(): string {
    const char = this.input[this.position];
    this.position++;
    if (char === '\n') {
      this.line++;
      this.column = 1;
    } else {
      this.column++;
    }
    return char;
  }

  private peek(): string | null {
    if (this.position >= this.input.length) return null;
    return this.input[this.position];
  }

  public nextToken(): Token {
    if (this.position >= this.input.length) {
      return { type: 'EOF', value: '', line: this.line, column: this.column };
    }

    // Check for legacy syntax
    if (this.input.substring(this.position).trimStart().startsWith('domain "')) {
      throw new GrammarViolationError('Protocol Violation: Legacy .tela DSL syntax is deprecated.', this.line, this.column);
    }

    const startLine = this.line;
    const startColumn = this.column;
    const char = this.peek()!;

    if (char === '#') {
      let value = '';
      while (this.peek() === '#') {
        value += this.advance();
      }
      if (this.peek() === ' ') {
        this.advance(); // skip space
      }
      let headingText = '';
      while (this.peek() !== null && this.peek() !== '\n') {
        headingText += this.advance();
      }
      return { type: 'HEADING', value: headingText.trim(), line: startLine, column: startColumn };
    }

    if (this.input.substring(this.position).startsWith('```')) {
      this.advance(); this.advance(); this.advance(); // skip ```
      let value = '';
      while (this.peek() !== null && !this.input.substring(this.position).startsWith('```')) {
        value += this.advance();
      }
      if (this.peek() !== null) {
        this.advance(); this.advance(); this.advance(); // skip ```
      }
      return { type: 'CODE_BLOCK', value, line: startLine, column: startColumn };
    }

    if (char === '-' && this.input[this.position + 1] === ' ') {
      this.advance(); this.advance(); // skip "- "
      let value = '';
      while (this.peek() !== null && this.peek() !== '\n') {
        value += this.advance();
      }
      return { type: 'LIST_ITEM', value: value.trim(), line: startLine, column: startColumn };
    }

    // Text
    let value = '';
    while (this.peek() !== null && this.peek() !== '#' && !this.input.substring(this.position).startsWith('```') && !(this.peek() === '-' && this.input[this.position + 1] === ' ')) {
      value += this.advance();
    }
    
    // If value is just whitespace, skip it and get next token
    if (value.trim() === '') {
      return this.nextToken();
    }

    return { type: 'TEXT', value: value.trim(), line: startLine, column: startColumn };
  }

  public tokenize(): Token[] {
    const tokens: Token[] = [];
    while (true) {
      const token = this.nextToken();
      tokens.push(token);
      if (token.type === 'EOF') break;
    }
    return tokens;
  }
}

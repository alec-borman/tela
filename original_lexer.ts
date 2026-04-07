export type TokenType =
  | 'KEYWORD'
  | 'STRING'
  | 'NUMBER'
  | 'IDENTIFIER'
  | 'LBRACE'
  | 'RBRACE'
  | 'LBRACKET'
  | 'RBRACKET'
  | 'COLON'
  | 'COMMA'
  | 'AT'
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

  private skipWhitespaceAndComments() {
    while (true) {
      const char = this.peek();
      if (char === ' ' || char === '\t' || char === '\n' || char === '\r') {
        this.advance();
      } else if (char === '#') {
        this.advance(); // skip '#'
        while (this.peek() !== null && this.peek() !== '\n') {
          this.advance();
        }
      } else if (char === '/') {
        if (this.input[this.position + 1] === '/') {
          this.advance(); // skip '/'
          this.advance(); // skip '/'
          while (this.peek() !== null && this.peek() !== '\n') {
            this.advance();
          }
        } else {
          break;
        }
      } else if (char === '%') {
        if (this.input[this.position + 1] === '%') {
          this.advance(); // skip '%'
          this.advance(); // skip '%'
          while (this.peek() !== null && this.peek() !== '\n') {
            this.advance();
          }
        } else {
          break;
        }
      } else {
        break;
      }
    }
  }

  public nextToken(): Token {
    this.skipWhitespaceAndComments();

    if (this.position >= this.input.length) {
      return { type: 'EOF', value: '', line: this.line, column: this.column };
    }

    const startLine = this.line;
    const startColumn = this.column;
    const char = this.peek()!;

    // Single character tokens
    if (char === '{') { this.advance(); return { type: 'LBRACE', value: '{', line: startLine, column: startColumn }; }
    if (char === '}') { this.advance(); return { type: 'RBRACE', value: '}', line: startLine, column: startColumn }; }
    if (char === '[') { this.advance(); return { type: 'LBRACKET', value: '[', line: startLine, column: startColumn }; }
    if (char === ']') { this.advance(); return { type: 'RBRACKET', value: ']', line: startLine, column: startColumn }; }
    if (char === ':') { this.advance(); return { type: 'COLON', value: ':', line: startLine, column: startColumn }; }
    if (char === ',') { this.advance(); return { type: 'COMMA', value: ',', line: startLine, column: startColumn }; }
    if (char === '@') { this.advance(); return { type: 'AT', value: '@', line: startLine, column: startColumn }; }

    // Strings
    if (char === '"') {
      this.advance(); // skip opening quote
      let value = '';
      while (true) {
        const nextChar = this.peek();
        if (nextChar === null) {
          throw new GrammarViolationError('Unterminated string literal', startLine, startColumn);
        }
        if (nextChar === '"') {
          this.advance(); // skip closing quote
          break;
        }
        value += this.advance();
      }
      return { type: 'STRING', value, line: startLine, column: startColumn };
    }

    // Numbers
    if (/[0-9\.\-]/.test(char)) {
      let value = '';
      let hasDot = false;
      while (true) {
        const nextChar = this.peek();
        if (nextChar === null || !/[0-9\.\-]/.test(nextChar)) break;
        if (nextChar === '.') {
          if (hasDot) throw new GrammarViolationError('Invalid number format: multiple decimals', this.line, this.column);
          hasDot = true;
        }
        value += this.advance();
      }
      if (value === '-') throw new GrammarViolationError('Invalid number format: standalone minus', startLine, startColumn);
      return { type: 'NUMBER', value, line: startLine, column: startColumn };
    }

    // Identifiers and Keywords
    if (/[a-zA-Z_]/.test(char)) {
      let value = '';
      while (true) {
        const nextChar = this.peek();
        if (nextChar === null || !/[a-zA-Z0-9_]/.test(nextChar)) break;
        value += this.advance();
      }
      
      const keywords = ['domain', 'meta', 'feature', 'deterministic', 'sustainability'];
      if (keywords.includes(value)) {
        return { type: 'KEYWORD', value, line: startLine, column: startColumn };
      }
      return { type: 'IDENTIFIER', value, line: startLine, column: startColumn };
    }

    throw new GrammarViolationError(`Unexpected character: ${char}`, startLine, startColumn);
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

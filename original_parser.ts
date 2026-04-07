import { Token, TokenType, GrammarViolationError } from './lexer';

export interface ASTDomain {
  name: string;
  version: string;
  meta: ASTMetaBlock;
  features: ASTFeatureBlock[];
  deterministics: ASTDeterministicBlock[];
  sustainability: ASTSustainabilityBlock[];
}

export interface ASTSustainabilityBlock {
  domain_name: string;
  version: string;
  mission: string;
  sponsors: ASTSponsor[];
  roadmap: ASTMilestone[];
  license: string;
}

export interface ASTSponsor {
  name: string;
  type: string;
  amount?: number;
  period: string;
  status: string;
}

export interface ASTMilestone {
  milestone: string;
  date: string;
  funding_required?: number;
  revenue_target?: number;
}

export interface ASTMetaBlock {
  name: string;
  sprint_id: string;
  author: string;
  recipient: string;
  baseline_centroid: string;
  target_similarity: number;
  dimensions: number;
}

export interface ASTFeatureBlock {
  name: string;
  weight: number;
  target: string;
  description: string;
  requirements: string[];
  dimension_contributions: Record<string, number>;
}

export interface ASTDeterministicBlock {
  name: string;
  input: string[];
  steps: ASTStep[];
  threshold: number;
}

export interface ASTStep {
  assert?: string;
  verify?: string;
}

export class Parser {
  private tokens: Token[];
  private position: number = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  private peek(): Token {
    if (this.position >= this.tokens.length) {
      return this.tokens[this.tokens.length - 1]; // EOF
    }
    return this.tokens[this.position];
  }

  private advance(): Token {
    const token = this.peek();
    this.position++;
    return token;
  }

  private expect(type: TokenType): Token {
    const token = this.peek();
    if (token.type !== type) {
      throw new GrammarViolationError(`Expected ${type}, got ${token.type} ('${token.value}')`, token.line, token.column);
    }
    return this.advance();
  }

  private expectKeyword(keyword: string): Token {
    const token = this.peek();
    if (token.type !== 'KEYWORD' || token.value !== keyword) {
      throw new GrammarViolationError(`Expected keyword '${keyword}', got ${token.type} ('${token.value}')`, token.line, token.column);
    }
    return this.advance();
  }

  public parse(): ASTDomain {
    let domain: ASTDomain | undefined;
    const topLevelSustainability: ASTSustainabilityBlock[] = [];

    while (this.peek().type !== 'EOF') {
      const token = this.peek();
      if (token.type === 'KEYWORD' && token.value === 'domain') {
        domain = this.parseDomain();
      } else if (token.type === 'KEYWORD' && token.value === 'sustainability') {
        topLevelSustainability.push(this.parseSustainabilityBlock());
      } else {
        // Skip unknown top-level tokens
        this.advance();
      }
    }

    if (domain) {
      domain.sustainability.push(...topLevelSustainability);
      return domain;
    } else if (topLevelSustainability.length > 0) {
      const first = topLevelSustainability[0];
      return {
        name: first.domain_name,
        version: first.version,
        meta: {
          name: first.domain_name,
          sprint_id: 'SUSTAIN-ONLY',
          author: 'Architect',
          recipient: 'Tela AI',
          baseline_centroid: '',
          target_similarity: 0,
          dimensions: 1024
        },
        features: [],
        deterministics: [],
        sustainability: topLevelSustainability
      };
    } else {
      throw new GrammarViolationError('No domain or sustainability block found', 0, 0);
    }
  }

  private parseDomain(): ASTDomain {
    this.expectKeyword('domain');
    const name = this.expect('STRING').value;
    const version = this.expect('STRING').value;
    this.expect('LBRACE');

    const meta = this.parseMetaBlock();
    
    const features: ASTFeatureBlock[] = [];
    const deterministics: ASTDeterministicBlock[] = [];
    const sustainability: ASTSustainabilityBlock[] = [];

    while (this.peek().type !== 'RBRACE' && this.peek().type !== 'EOF') {
      const token = this.peek();
      if (token.type === 'KEYWORD' && token.value === 'feature') {
        features.push(this.parseFeatureBlock());
      } else if (token.type === 'KEYWORD' && token.value === 'deterministic') {
        deterministics.push(this.parseDeterministicBlock());
      } else if (token.type === 'KEYWORD' && token.value === 'sustainability') {
        sustainability.push(this.parseSustainabilityBlock());
      } else {
        throw new GrammarViolationError(`Unexpected token in domain body: ${token.value}`, token.line, token.column);
      }
    }

    this.expect('RBRACE');

    return { name, version, meta, features, deterministics, sustainability };
  }

  private parseSustainabilityBlock(): ASTSustainabilityBlock {
    this.expectKeyword('sustainability');
    const domain_name = this.expect('STRING').value;
    const version = this.expect('STRING').value;
    this.expect('LBRACE');

    const sustain: Partial<ASTSustainabilityBlock> = { domain_name, version };

    while (this.peek().type !== 'RBRACE' && this.peek().type !== 'EOF') {
      const key = this.expect('IDENTIFIER').value;
      this.expect('COLON');

      if (key === 'mission' || key === 'license') {
        sustain[key] = this.expect('STRING').value;
      } else if (key === 'sponsors') {
        sustain.sponsors = this.parseSponsorsArray();
      } else if (key === 'roadmap') {
        sustain.roadmap = this.parseRoadmapArray();
      } else {
        throw new GrammarViolationError(`Unknown sustainability key: ${key}`, this.peek().line, this.peek().column);
      }

      if (this.peek().type === 'COMMA') {
        this.advance();
      }
    }

    this.expect('RBRACE');

    return sustain as ASTSustainabilityBlock;
  }

  private parseSponsorsArray(): ASTSponsor[] {
    this.expect('LBRACKET');
    const sponsors: ASTSponsor[] = [];
    while (this.peek().type !== 'RBRACKET' && this.peek().type !== 'EOF') {
      this.expect('LBRACE');
      const sponsor: Partial<ASTSponsor> = {};
      while (this.peek().type !== 'RBRACE' && this.peek().type !== 'EOF') {
        const key = this.expect('IDENTIFIER').value;
        this.expect('COLON');
        if (key === 'name' || key === 'type' || key === 'period' || key === 'status') {
          sponsor[key] = this.expect('STRING').value;
        } else if (key === 'amount') {
          sponsor.amount = parseFloat(this.expect('NUMBER').value);
        } else {
          throw new GrammarViolationError(`Unknown sponsor key: ${key}`, this.peek().line, this.peek().column);
        }
        if (this.peek().type === 'COMMA') this.advance();
      }
      this.expect('RBRACE');
      sponsors.push(sponsor as ASTSponsor);
      if (this.peek().type === 'COMMA') this.advance();
    }
    this.expect('RBRACKET');
    return sponsors;
  }

  private parseRoadmapArray(): ASTMilestone[] {
    this.expect('LBRACKET');
    const roadmap: ASTMilestone[] = [];
    while (this.peek().type !== 'RBRACKET' && this.peek().type !== 'EOF') {
      this.expect('LBRACE');
      const milestone: Partial<ASTMilestone> = {};
      while (this.peek().type !== 'RBRACE' && this.peek().type !== 'EOF') {
        const key = this.expect('IDENTIFIER').value;
        this.expect('COLON');
        if (key === 'milestone' || key === 'date') {
          milestone[key] = this.expect('STRING').value;
        } else if (key === 'funding_required' || key === 'revenue_target') {
          milestone[key] = parseFloat(this.expect('NUMBER').value);
        } else {
          throw new GrammarViolationError(`Unknown milestone key: ${key}`, this.peek().line, this.peek().column);
        }
        if (this.peek().type === 'COMMA') this.advance();
      }
      this.expect('RBRACE');
      roadmap.push(milestone as ASTMilestone);
      if (this.peek().type === 'COMMA') this.advance();
    }
    this.expect('RBRACKET');
    return roadmap;
  }

  private parseMetaBlock(): ASTMetaBlock {
    this.expectKeyword('meta');
    this.expect('AT');
    this.expect('LBRACE');

    const meta: Partial<ASTMetaBlock> = {};

    while (this.peek().type !== 'RBRACE' && this.peek().type !== 'EOF') {
      const key = this.expect('IDENTIFIER').value;
      this.expect('COLON');
      
      if (['name', 'sprint_id', 'author', 'recipient', 'baseline_centroid'].includes(key)) {
        meta[key as keyof ASTMetaBlock] = this.expect('STRING').value as never;
      } else if (['target_similarity', 'dimensions'].includes(key)) {
        meta[key as keyof ASTMetaBlock] = parseFloat(this.expect('NUMBER').value) as never;
      } else {
        throw new GrammarViolationError(`Unknown meta key: ${key}`, this.peek().line, this.peek().column);
      }

      if (this.peek().type === 'COMMA') {
        this.advance();
      }
    }

    this.expect('RBRACE');

    return meta as ASTMetaBlock;
  }

  private parseFeatureBlock(): ASTFeatureBlock {
    this.expectKeyword('feature');
    const name = this.expect('STRING').value;
    this.expect('LBRACE');

    const feature: Partial<ASTFeatureBlock> = { name };

    while (this.peek().type !== 'RBRACE' && this.peek().type !== 'EOF') {
      const key = this.expect('IDENTIFIER').value;
      this.expect('COLON');

      if (key === 'weight') {
        feature.weight = parseFloat(this.expect('NUMBER').value);
      } else if (key === 'target' || key === 'description') {
        feature[key] = this.expect('STRING').value;
      } else if (key === 'requirements') {
        feature.requirements = this.parseStringArray();
      } else if (key === 'dimension_contributions') {
        feature.dimension_contributions = this.parseRecord();
      } else {
        throw new GrammarViolationError(`Unknown feature key: ${key}`, this.peek().line, this.peek().column);
      }

      if (this.peek().type === 'COMMA') {
        this.advance();
      }
    }

    this.expect('RBRACE');

    return feature as ASTFeatureBlock;
  }

  private parseDeterministicBlock(): ASTDeterministicBlock {
    this.expectKeyword('deterministic');
    const name = this.expect('STRING').value;
    this.expect('LBRACE');

    const det: Partial<ASTDeterministicBlock> = { name };

    while (this.peek().type !== 'RBRACE' && this.peek().type !== 'EOF') {
      const key = this.expect('IDENTIFIER').value;
      this.expect('COLON');

      if (key === 'input') {
        det.input = this.parseStringArray();
      } else if (key === 'steps') {
        det.steps = this.parseStepsArray();
      } else if (key === 'threshold') {
        det.threshold = parseFloat(this.expect('NUMBER').value);
      } else {
        throw new GrammarViolationError(`Unknown deterministic key: ${key}`, this.peek().line, this.peek().column);
      }

      if (this.peek().type === 'COMMA') {
        this.advance();
      }
    }

    this.expect('RBRACE');

    return det as ASTDeterministicBlock;
  }

  private parseStringArray(): string[] {
    this.expect('LBRACKET');
    const arr: string[] = [];
    while (this.peek().type !== 'RBRACKET' && this.peek().type !== 'EOF') {
      arr.push(this.expect('STRING').value);
      if (this.peek().type === 'COMMA') {
        this.advance();
      }
    }
    this.expect('RBRACKET');
    return arr;
  }

  private parseStepsArray(): ASTStep[] {
    this.expect('LBRACKET');
    const steps: ASTStep[] = [];
    while (this.peek().type !== 'RBRACKET' && this.peek().type !== 'EOF') {
      this.expect('LBRACE');
      const step: ASTStep = {};
      const key = this.expect('IDENTIFIER').value;
      this.expect('COLON');
      const val = this.expect('STRING').value;
      
      if (key === 'assert') step.assert = val;
      else if (key === 'verify') step.verify = val;
      else throw new GrammarViolationError(`Unknown step key: ${key}`, this.peek().line, this.peek().column);

      this.expect('RBRACE');
      
      steps.push(step);
      if (this.peek().type === 'COMMA') {
        this.advance();
      }
    }
    this.expect('RBRACKET');
    return steps;
  }

  private parseRecord(): Record<string, number> {
    this.expect('LBRACE');
    const rec: Record<string, number> = {};
    while (this.peek().type !== 'RBRACE' && this.peek().type !== 'EOF') {
      const key = this.expect('STRING').value;
      this.expect('COLON');
      const val = parseFloat(this.expect('NUMBER').value);
      rec[key] = val;
      if (this.peek().type === 'COMMA') {
        this.advance();
      }
    }
    this.expect('RBRACE');
    return rec;
  }
}

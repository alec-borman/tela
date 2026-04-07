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

  public parse(): ASTDomain {
    let hasContextualBrief = false;
    let hasScope = false;
    let hasAcceptanceCriteria = false;
    let hasFailsafeTest = false;

    while (this.peek().type !== 'EOF') {
      const token = this.advance();
      if (token.type === 'HEADING') {
        if (token.value.toLowerCase().includes('contextual brief')) {
          hasContextualBrief = true;
        } else if (token.value.toLowerCase().includes('scope')) {
          hasScope = true;
        } else if (token.value.toLowerCase().includes('acceptance criteria')) {
          hasAcceptanceCriteria = true;
        } else if (token.value.toLowerCase().includes('failsafe test')) {
          hasFailsafeTest = true;
        }
      }
    }

    if (!hasContextualBrief || !hasScope || !hasAcceptanceCriteria || !hasFailsafeTest) {
      throw new GrammarViolationError('Missing required section in Markdown TDB', 0, 0);
    }

    return {
      name: 'Markdown TDB',
      version: '8.2',
      meta: {
        name: 'Markdown TDB',
        sprint_id: 'MD-001',
        author: 'Markdown Parser',
        recipient: 'Tela AI',
        baseline_centroid: '',
        target_similarity: 1.0,
        dimensions: 1024
      },
      features: [
        {
          name: 'markdown_feature',
          weight: 1.0,
          target: 'markdown',
          description: 'Parsed from markdown',
          requirements: [],
          dimension_contributions: {
            'arch:determinism': 1.0
          }
        }
      ],
      deterministics: [],
      sustainability: []
    };
  }
}

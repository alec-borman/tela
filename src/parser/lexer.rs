use std::iter::Peekable;
use std::str::Chars;

#[derive(Debug, PartialEq, Clone)]
pub enum Token {
    Keyword(String),
    String(String),
    Number(String),
    Ident(String),
    LBrace,
    RBrace,
    LBracket,
    RBracket,
    Colon,
    Comma,
    At,
    Eof,
}

pub struct Lexer<'a> {
    input: Peekable<Chars<'a>>,
    pub line: usize,
    pub column: usize,
}

impl<'a> Lexer<'a> {
    pub fn new(input: &'a str) -> Self {
        Self {
            input: input.chars().peekable(),
            line: 1,
            column: 1,
        }
    }

    fn advance(&mut self) -> Option<char> {
        let c = self.input.next();
        if let Some(ch) = c {
            if ch == '\n' {
                self.line += 1;
                self.column = 1;
            } else {
                self.column += 1;
            }
        }
        c
    }

    fn peek(&mut self) -> Option<&char> {
        self.input.peek()
    }

    fn skip_whitespace_and_comments(&mut self) {
        loop {
            match self.peek() {
                Some(&c) if c.is_whitespace() => {
                    self.advance();
                }
                Some(&'/') => {
                    // Peek ahead without advancing if possible, but Peekable only peeks 1.
                    // We'll just clone the iterator to peek ahead.
                    let mut lookahead = self.input.clone();
                    lookahead.next(); // skip '/'
                    if let Some(&'/') = lookahead.peek() {
                        self.advance(); // consume '/'
                        self.advance(); // consume '/'
                        while let Some(&c) = self.peek() {
                            if c == '\n' {
                                break;
                            }
                            self.advance();
                        }
                    } else {
                        break;
                    }
                }
                Some(&'%') => {
                    let mut lookahead = self.input.clone();
                    lookahead.next(); // skip '%'
                    if let Some(&'%') = lookahead.peek() {
                        self.advance(); // consume '%'
                        self.advance(); // consume '%'
                        while let Some(&c) = self.peek() {
                            if c == '\n' {
                                break;
                            }
                            self.advance();
                        }
                    } else {
                        break;
                    }
                }
                Some(&'#') => {
                    self.advance(); // consume '#'
                    while let Some(&c) = self.peek() {
                        if c == '\n' {
                            break;
                        }
                        self.advance();
                    }
                }
                _ => break,
            }
        }
    }

    pub fn next_token(&mut self) -> Result<Token, String> {
        self.skip_whitespace_and_comments();

        let c = match self.peek() {
            Some(&ch) => ch,
            None => return Ok(Token::Eof),
        };

        match c {
            '{' => {
                self.advance();
                Ok(Token::LBrace)
            }
            '}' => {
                self.advance();
                Ok(Token::RBrace)
            }
            '[' => {
                self.advance();
                Ok(Token::LBracket)
            }
            ']' => {
                self.advance();
                Ok(Token::RBracket)
            }
            ':' => {
                self.advance();
                Ok(Token::Colon)
            }
            ',' => {
                self.advance();
                Ok(Token::Comma)
            }
            '@' => {
                self.advance();
                Ok(Token::At)
            }
            '"' => self.read_string(),
            c if c.is_ascii_digit() || c == '-' || c == '.' => self.read_number(),
            c if c.is_alphabetic() || c == '_' => self.read_ident_or_keyword(),
            _ => {
                let err = format!("Unexpected character '{}' at line {}, col {}", c, self.line, self.column);
                self.advance();
                Err(err)
            }
        }
    }

    pub fn tokenize(&mut self) -> Result<Vec<Token>, String> {
        let mut tokens = Vec::new();
        loop {
            let token = self.next_token()?;
            let is_eof = token == Token::Eof;
            tokens.push(token);
            if is_eof {
                break;
            }
        }
        Ok(tokens)
    }

    fn read_string(&mut self) -> Result<Token, String> {
        self.advance(); // skip opening quote
        let mut is_multiline = false;

        // Check for multiline string """
        if let Some(&'"') = self.peek() {
            self.advance();
            if let Some(&'"') = self.peek() {
                self.advance();
                is_multiline = true;
            } else {
                // Empty string ""
                return Ok(Token::String(String::new()));
            }
        }

        let mut result = String::new();
        if is_multiline {
            let mut quotes_count = 0;
            loop {
                match self.advance() {
                    Some('"') => {
                        quotes_count += 1;
                        if quotes_count == 3 {
                            break;
                        }
                    }
                    Some(c) => {
                        for _ in 0..quotes_count {
                            result.push('"');
                        }
                        quotes_count = 0;
                        result.push(c);
                    }
                    None => return Err(format!("Unterminated multiline string starting at line {}", self.line)),
                }
            }
        } else {
            loop {
                match self.advance() {
                    Some('"') => break,
                    Some('\\') => {
                        match self.advance() {
                            Some('n') => result.push('\n'),
                            Some('r') => result.push('\r'),
                            Some('t') => result.push('\t'),
                            Some('\\') => result.push('\\'),
                            Some('"') => result.push('"'),
                            Some(c) => {
                                result.push('\\');
                                result.push(c);
                            }
                            None => return Err("Unterminated string escape".to_string()),
                        }
                    }
                    Some(c) => result.push(c),
                    None => return Err(format!("Unterminated string starting at line {}", self.line)),
                }
            }
        }

        Ok(Token::String(result))
    }

    fn read_number(&mut self) -> Result<Token, String> {
        let mut result = String::new();
        while let Some(&c) = self.peek() {
            if c.is_ascii_digit() || c == '.' || c == '-' {
                result.push(c);
                self.advance();
            } else {
                break;
            }
        }
        Ok(Token::Number(result))
    }

    fn read_ident_or_keyword(&mut self) -> Result<Token, String> {
        let mut result = String::new();
        while let Some(&c) = self.peek() {
            if c.is_alphanumeric() || c == '_' {
                result.push(c);
                self.advance();
            } else {
                break;
            }
        }

        match result.as_str() {
            "domain" | "meta" | "feature" | "deterministic" | "sustainability" => Ok(Token::Keyword(result)),
            _ => Ok(Token::Ident(result)),
        }
    }
}

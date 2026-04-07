use crate::parser::ast::*;
use crate::parser::lexer::{Lexer, Token};
use std::collections::BTreeMap;

pub struct Parser<'a> {
    lexer: Lexer<'a>,
    current_token: Token,
}

impl<'a> Parser<'a> {
    pub fn new(input: &'a str) -> Self {
        let mut lexer = Lexer::new(input);
        let current_token = lexer.next_token().unwrap_or(Token::Eof);
        Self { lexer, current_token }
    }

    fn advance(&mut self) -> Result<(), String> {
        self.current_token = self.lexer.next_token()?;
        Ok(())
    }

    fn expect(&mut self, expected: Token) -> Result<(), String> {
        if self.current_token == expected {
            self.advance()?;
            Ok(())
        } else {
            Err(format!(
                "Expected {:?}, found {:?} at line {}, col {}",
                expected, self.current_token, self.lexer.line, self.lexer.column
            ))
        }
    }

    fn expect_keyword(&mut self, kw: &str) -> Result<(), String> {
        if let Token::Keyword(ref k) = self.current_token {
            if k == kw {
                self.advance()?;
                return Ok(());
            }
        }
        Err(format!(
            "Expected keyword '{}', found {:?} at line {}, col {}",
            kw, self.current_token, self.lexer.line, self.lexer.column
        ))
    }

    fn parse_string(&mut self) -> Result<String, String> {
        if let Token::String(ref s) = self.current_token {
            let val = s.clone();
            self.advance()?;
            Ok(val)
        } else {
            Err(format!(
                "Expected string, found {:?} at line {}, col {}",
                self.current_token, self.lexer.line, self.lexer.column
            ))
        }
    }

    fn parse_number(&mut self) -> Result<f64, String> {
        if let Token::Number(ref n) = self.current_token {
            let val = n.parse::<f64>().map_err(|_| {
                format!(
                    "Invalid number '{}' at line {}, col {}",
                    n, self.lexer.line, self.lexer.column
                )
            })?;
            self.advance()?;
            Ok(val)
        } else {
            Err(format!(
                "Expected number, found {:?} at line {}, col {}",
                self.current_token, self.lexer.line, self.lexer.column
            ))
        }
    }

    fn parse_ident(&mut self) -> Result<String, String> {
        if let Token::Ident(ref id) = self.current_token {
            let val = id.clone();
            self.advance()?;
            Ok(val)
        } else {
            Err(format!(
                "Expected identifier, found {:?} at line {}, col {}",
                self.current_token, self.lexer.line, self.lexer.column
            ))
        }
    }

    pub fn parse(&mut self) -> Result<Domain, String> {
        let mut domain_opt = None;
        let mut top_level_sustainability = Vec::new();

        while self.current_token != Token::Eof {
            match self.current_token {
                Token::Keyword(ref k) if k == "domain" => {
                    domain_opt = Some(self.parse_domain()?);
                }
                Token::Keyword(ref k) if k == "sustainability" => {
                    top_level_sustainability.push(self.parse_sustainability_block()?);
                }
                _ => {
                    // Skip unknown top-level tokens
                    self.advance()?;
                }
            }
        }

        if let Some(mut domain) = domain_opt {
            domain.sustainability.extend(top_level_sustainability);
            Ok(domain)
        } else if !top_level_sustainability.is_empty() {
            // Return a dummy domain if only sustainability is found
            let first = &top_level_sustainability[0];
            Ok(Domain {
                name: first.domain_name.clone(),
                version: first.version.clone(),
                meta: MetaBlock {
                    name: first.domain_name.clone(),
                    sprint_id: "SUSTAIN-ONLY".to_string(),
                    author: "Architect".to_string(),
                    recipient: "Tela AI".to_string(),
                    baseline_centroid: "".to_string(),
                    target_similarity: 0.0,
                    dimensions: 1024,
                    note: None,
                },
                features: Vec::new(),
                deterministics: Vec::new(),
                sustainability: top_level_sustainability,
            })
        } else {
            Err("No domain or sustainability block found".to_string())
        }
    }

    fn parse_domain(&mut self) -> Result<Domain, String> {
        self.expect_keyword("domain")?;
        let name = self.parse_string()?;
        let version = self.parse_string()?;
        self.expect(Token::LBrace)?;

        let mut meta = None;
        let mut features = Vec::new();
        let mut deterministics = Vec::new();
        let mut sustainability = Vec::new();

        while self.current_token != Token::RBrace && self.current_token != Token::Eof {
            match self.current_token {
                Token::Keyword(ref k) if k == "meta" => {
                    meta = Some(self.parse_meta_block()?);
                }
                Token::Keyword(ref k) if k == "feature" => {
                    features.push(self.parse_feature_block()?);
                }
                Token::Keyword(ref k) if k == "deterministic" => {
                    deterministics.push(self.parse_deterministic_block()?);
                }
                Token::Keyword(ref k) if k == "sustainability" => {
                    sustainability.push(self.parse_sustainability_block()?);
                }
                _ => {
                    return Err(format!(
                        "Unexpected token {:?} in domain block at line {}, col {}",
                        self.current_token, self.lexer.line, self.lexer.column
                    ));
                }
            }
        }

        self.expect(Token::RBrace)?;

        let meta = meta.ok_or_else(|| "Missing meta block in domain".to_string())?;

        Ok(Domain {
            name,
            version,
            meta,
            features,
            deterministics,
            sustainability,
        })
    }

    fn parse_sustainability_block(&mut self) -> Result<SustainabilityBlock, String> {
        self.expect_keyword("sustainability")?;
        let domain_name = self.parse_string()?;
        let version = self.parse_string()?;
        self.expect(Token::LBrace)?;

        let mut mission = String::new();
        let mut sponsors = Vec::new();
        let mut roadmap = Vec::new();
        let mut license = String::new();

        while self.current_token != Token::RBrace && self.current_token != Token::Eof {
            let key = self.parse_ident()?;
            self.expect(Token::Colon)?;

            match key.as_str() {
                "mission" => mission = self.parse_string()?,
                "sponsors" => sponsors = self.parse_sponsors_array()?,
                "roadmap" => roadmap = self.parse_roadmap_array()?,
                "license" => license = self.parse_string()?,
                _ => {
                    return Err(format!(
                        "Unknown sustainability field '{}' at line {}, col {}",
                        key, self.lexer.line, self.lexer.column
                    ));
                }
            }

            if self.current_token == Token::Comma {
                self.advance()?;
            }
        }

        self.expect(Token::RBrace)?;

        Ok(SustainabilityBlock {
            domain_name,
            version,
            mission,
            sponsors,
            roadmap,
            license,
        })
    }

    fn parse_sponsors_array(&mut self) -> Result<Vec<Sponsor>, String> {
        self.expect(Token::LBracket)?;
        let mut sponsors = Vec::new();

        while self.current_token != Token::RBracket && self.current_token != Token::Eof {
            self.expect(Token::LBrace)?;
            let mut name = String::new();
            let mut sponsor_type = String::new();
            let mut amount = None;
            let mut period = String::new();
            let mut status = String::new();

            while self.current_token != Token::RBrace && self.current_token != Token::Eof {
                let key = self.parse_ident()?;
                self.expect(Token::Colon)?;

                match key.as_str() {
                    "name" => name = self.parse_string()?,
                    "type" => sponsor_type = self.parse_string()?,
                    "amount" => amount = Some(self.parse_number()?),
                    "period" => period = self.parse_string()?,
                    "status" => status = self.parse_string()?,
                    _ => {
                        return Err(format!(
                            "Unknown sponsor field '{}' at line {}, col {}",
                            key, self.lexer.line, self.lexer.column
                        ));
                    }
                }

                if self.current_token == Token::Comma {
                    self.advance()?;
                }
            }

            self.expect(Token::RBrace)?;
            sponsors.push(Sponsor {
                name,
                sponsor_type,
                amount,
                period,
                status,
            });

            if self.current_token == Token::Comma {
                self.advance()?;
            }
        }

        self.expect(Token::RBracket)?;
        Ok(sponsors)
    }

    fn parse_roadmap_array(&mut self) -> Result<Vec<Milestone>, String> {
        self.expect(Token::LBracket)?;
        let mut roadmap = Vec::new();

        while self.current_token != Token::RBracket && self.current_token != Token::Eof {
            self.expect(Token::LBrace)?;
            let mut milestone = String::new();
            let mut date = String::new();
            let mut funding_required = None;
            let mut revenue_target = None;

            while self.current_token != Token::RBrace && self.current_token != Token::Eof {
                let key = self.parse_ident()?;
                self.expect(Token::Colon)?;

                match key.as_str() {
                    "milestone" => milestone = self.parse_string()?,
                    "date" => date = self.parse_string()?,
                    "funding_required" => funding_required = Some(self.parse_number()?),
                    "revenue_target" => revenue_target = Some(self.parse_number()?),
                    _ => {
                        return Err(format!(
                            "Unknown milestone field '{}' at line {}, col {}",
                            key, self.lexer.line, self.lexer.column
                        ));
                    }
                }

                if self.current_token == Token::Comma {
                    self.advance()?;
                }
            }

            self.expect(Token::RBrace)?;
            roadmap.push(Milestone {
                milestone,
                date,
                funding_required,
                revenue_target,
            });

            if self.current_token == Token::Comma {
                self.advance()?;
            }
        }

        self.expect(Token::RBracket)?;
        Ok(roadmap)
    }

    fn parse_meta_block(&mut self) -> Result<MetaBlock, String> {
        self.expect_keyword("meta")?;
        self.expect(Token::At)?;
        self.expect(Token::LBrace)?;

        let mut name = String::new();
        let mut sprint_id = String::new();
        let mut author = String::new();
        let mut recipient = String::new();
        let mut baseline_centroid = String::new();
        let mut target_similarity = 0.0;
        let mut dimensions = 0;
        let mut note = None;

        while self.current_token != Token::RBrace && self.current_token != Token::Eof {
            let key = self.parse_ident()?;
            self.expect(Token::Colon)?;

            match key.as_str() {
                "name" => name = self.parse_string()?,
                "sprint_id" => sprint_id = self.parse_string()?,
                "author" => author = self.parse_string()?,
                "recipient" => recipient = self.parse_string()?,
                "baseline_centroid" => baseline_centroid = self.parse_string()?,
                "target_similarity" => target_similarity = self.parse_number()?,
                "dimensions" => dimensions = self.parse_number()? as u32,
                "note" => note = Some(self.parse_string()?),
                "description" | "concept" | "determinism_score" | "id" => {
                    // Ignore extra fields that might appear in meta block
                    match self.current_token {
                        Token::String(_) => { self.parse_string()?; }
                        Token::Number(_) => { self.parse_number()?; }
                        _ => { self.advance()?; }
                    }
                }
                _ => {
                    return Err(format!(
                        "Unknown meta field '{}' at line {}, col {}",
                        key, self.lexer.line, self.lexer.column
                    ));
                }
            }

            if self.current_token == Token::Comma {
                self.advance()?;
            }
        }

        self.expect(Token::RBrace)?;

        Ok(MetaBlock {
            name,
            sprint_id,
            author,
            recipient,
            baseline_centroid,
            target_similarity,
            dimensions,
            note,
        })
    }

    fn parse_feature_block(&mut self) -> Result<FeatureBlock, String> {
        self.expect_keyword("feature")?;
        let name = self.parse_string()?;
        self.expect(Token::LBrace)?;

        let mut weight = 1.0;
        let mut target = String::new();
        let mut description = String::new();
        let mut requirements = Vec::new();
        let mut dimension_contributions = BTreeMap::new();

        while self.current_token != Token::RBrace && self.current_token != Token::Eof {
            let key = self.parse_ident()?;
            self.expect(Token::Colon)?;

            match key.as_str() {
                "weight" => weight = self.parse_number()?,
                "target" => target = self.parse_string()?,
                "description" => description = self.parse_string()?,
                "requirements" => requirements = self.parse_string_array()?,
                "dimension_contributions" => dimension_contributions = self.parse_record()?,
                "intent" | "logic" | "parity_threshold" | "constraint" => {
                    // Ignore extra fields
                    match self.current_token {
                        Token::String(_) => { self.parse_string()?; }
                        Token::Number(_) => { self.parse_number()?; }
                        Token::LBracket => { self.parse_string_array()?; }
                        Token::LBrace => { self.parse_record()?; }
                        _ => { self.advance()?; }
                    }
                }
                _ => {
                    return Err(format!(
                        "Unknown feature field '{}' at line {}, col {}",
                        key, self.lexer.line, self.lexer.column
                    ));
                }
            }

            if self.current_token == Token::Comma {
                self.advance()?;
            }
        }

        self.expect(Token::RBrace)?;

        Ok(FeatureBlock {
            name,
            weight,
            target,
            description,
            requirements,
            dimension_contributions,
        })
    }

    fn parse_deterministic_block(&mut self) -> Result<DeterministicBlock, String> {
        self.expect_keyword("deterministic")?;
        let name = self.parse_string()?;
        self.expect(Token::LBrace)?;

        let mut input = Vec::new();
        let mut steps = Vec::new();
        let mut threshold = 0.0;

        while self.current_token != Token::RBrace && self.current_token != Token::Eof {
            let key = self.parse_ident()?;
            self.expect(Token::Colon)?;

            match key.as_str() {
                "input" => input = self.parse_string_array()?,
                "steps" => steps = self.parse_steps_array()?,
                "threshold" => threshold = self.parse_number()?,
                "success_condition" | "output" => {
                    // Ignore extra fields
                    match self.current_token {
                        Token::String(_) => { self.parse_string()?; }
                        Token::LBrace => {
                            self.expect(Token::LBrace)?;
                            while self.current_token != Token::RBrace && self.current_token != Token::Eof {
                                self.parse_ident()?;
                                self.expect(Token::Colon)?;
                                self.parse_string()?;
                                if self.current_token == Token::Comma {
                                    self.advance()?;
                                }
                            }
                            self.expect(Token::RBrace)?;
                        }
                        _ => { self.advance()?; }
                    }
                }
                _ => {
                    return Err(format!(
                        "Unknown deterministic field '{}' at line {}, col {}",
                        key, self.lexer.line, self.lexer.column
                    ));
                }
            }

            if self.current_token == Token::Comma {
                self.advance()?;
            }
        }

        self.expect(Token::RBrace)?;

        Ok(DeterministicBlock {
            name,
            input,
            steps,
            threshold,
        })
    }

    fn parse_string_array(&mut self) -> Result<Vec<String>, String> {
        self.expect(Token::LBracket)?;
        let mut arr = Vec::new();

        while self.current_token != Token::RBracket && self.current_token != Token::Eof {
            arr.push(self.parse_string()?);
            if self.current_token == Token::Comma {
                self.advance()?;
            }
        }

        self.expect(Token::RBracket)?;
        Ok(arr)
    }

    fn parse_record(&mut self) -> Result<BTreeMap<String, f64>, String> {
        self.expect(Token::LBrace)?;
        let mut map = BTreeMap::new();

        while self.current_token != Token::RBrace && self.current_token != Token::Eof {
            let key = self.parse_string()?;
            self.expect(Token::Colon)?;
            let val = self.parse_number()?;
            map.insert(key, val);

            if self.current_token == Token::Comma {
                self.advance()?;
            }
        }

        self.expect(Token::RBrace)?;
        Ok(map)
    }

    fn parse_steps_array(&mut self) -> Result<Vec<Step>, String> {
        self.expect(Token::LBracket)?;
        let mut steps = Vec::new();

        while self.current_token != Token::RBracket && self.current_token != Token::Eof {
            self.expect(Token::LBrace)?;
            let mut assert_val = None;
            let mut verify_val = None;

            while self.current_token != Token::RBrace && self.current_token != Token::Eof {
                let key = self.parse_ident()?;
                self.expect(Token::Colon)?;

                match key.as_str() {
                    "assert" => assert_val = Some(self.parse_string()?),
                    "verify" => verify_val = Some(self.parse_string()?),
                    "calculate" | "formula" | "evaluate" | "outcome" | "condition" => {
                        self.parse_string()?;
                    }
                    "conditions" => {
                        self.expect(Token::LBracket)?;
                        while self.current_token != Token::RBracket && self.current_token != Token::Eof {
                            self.expect(Token::LBrace)?;
                            while self.current_token != Token::RBrace && self.current_token != Token::Eof {
                                self.parse_ident()?;
                                self.expect(Token::Colon)?;
                                self.parse_string()?;
                                if self.current_token == Token::Comma {
                                    self.advance()?;
                                }
                            }
                            self.expect(Token::RBrace)?;
                            if self.current_token == Token::Comma {
                                self.advance()?;
                            }
                        }
                        self.expect(Token::RBracket)?;
                    }
                    _ => {
                        return Err(format!(
                            "Unknown step field '{}' at line {}, col {}",
                            key, self.lexer.line, self.lexer.column
                        ));
                    }
                }

                if self.current_token == Token::Comma {
                    self.advance()?;
                }
            }

            self.expect(Token::RBrace)?;
            steps.push(Step {
                assert: assert_val,
                verify: verify_val,
            });

            if self.current_token == Token::Comma {
                self.advance()?;
            }
        }

        self.expect(Token::RBracket)?;
        Ok(steps)
    }
}

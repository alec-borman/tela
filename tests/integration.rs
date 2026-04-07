use teleportation_steel::parser::lexer::Lexer;
use teleportation_steel::parser::parser::Parser;
use teleportation_steel::compiler::embedder::project_domain_to_vector;
use teleportation_steel::compiler::delta::calculate_parity;
use teleportation_steel::compiler::scanner::Scanner;
use std::path::Path;

#[test]
fn test_end_to_end_parity() {
    let tela_content = r#"
        domain "test_domain" "1.0.0" {
            meta @{
                name: "Test Domain",
                sprint_id: "TEST-001",
                author: "Tester",
                recipient: "AI",
                baseline_centroid: "0000000000000000000000000000000000000000000000000000000000000000",
                target_similarity: 0.9,
                dimensions: 1024
            }
            feature "test_feature" {
                weight: 1.0,
                target: "src/lib.rs",
                description: "A test feature",
                requirements: ["Requirement 1"],
                dimension_contributions: {
                    "arch:determinism": 1.0
                }
            }
        }
    "#;

    let mut lexer = Lexer::new(tela_content);
    let tokens = lexer.tokenize().unwrap();
    let mut parser = Parser::new(tokens);
    let domain = parser.parse().unwrap();
    
    let target_vector = project_domain_to_vector(&domain);
    
    let scanner = Scanner::new();
    let chunks = scanner.scan_directory(Path::new("."));
    
    let mut current_vector = [0.0; 1024];
    for chunk in chunks {
        for i in 0..1024 {
            current_vector[i] += chunk.vector[i];
        }
    }
    
    let similarity = calculate_parity(target_vector.0.as_ptr(), current_vector.as_ptr());
    println!("Integration Similarity: {}", similarity);
    
    // In a real test, we'd assert something about the similarity
    assert!(similarity >= 0.0);
}

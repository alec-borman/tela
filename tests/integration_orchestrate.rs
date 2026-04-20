use std::process::Command;
use std::fs;

#[test]
fn test_multi_agent_swarm_orchestration() {
    // 1. Create a dummy monolithic blueprint
    let blueprint_path = "swarm_genesis.tela";
    let blueprint_content = r#"
domain "swarm_test" "1.0.0" {
  meta @{
    name: "Swarm Genesis",
    sprint_id: "SWARM-001",
    author: "Architect",
    recipient: "Swarm",
    baseline_centroid: "0000000000000000000000000000000000000000000000000000000000000000",
    target_similarity: 1.0,
    dimensions: 1024
  }
  feature "agent_alpha" {
    weight: 1.0,
    target: "alpha.rs",
    description: "Build the alpha subsystem",
    requirements: ["req1"],
    dimension_contributions: { "arch:determinism": 1.0 }
  }
  feature "agent_beta" {
    weight: 1.0,
    target: "beta.rs",
    description: "Build the beta subsystem",
    requirements: ["req2"],
    dimension_contributions: { "arch:performance": 1.0 }
  }
}
"#;
    fs::write(blueprint_path, blueprint_content).unwrap();

    // 2. Execute telac orchestrate with a dummy key to verify graceful degradation
    let output = Command::new("cargo")
        .args(&[
            "run", "--release", "--bin", "telac", "--", 
            "orchestrate", blueprint_path
        ])
        .env("GEMINI_API_KEY", "dummy_key_for_ci_test")
        .output()
        .expect("Failed to execute telac orchestrate");
        
    assert!(output.status.success(), "telac orchestrate command failed.");

    let stdout = String::from_utf8_lossy(&output.stdout);
    
    // 3. Verify parallel execution and output aggregation gracefully falling back
    assert!(stdout.contains("agent_alpha"), "Missing alpha graceful output");
    assert!(stdout.contains("agent_beta"), "Missing beta graceful output");
    assert!(stdout.contains("API key gracefully handled"), "Mock fallback Markdown TDB missing");

    // Clean up
    let _ = fs::remove_file(blueprint_path);
}

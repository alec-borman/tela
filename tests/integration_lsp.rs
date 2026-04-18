use std::process::Command;

#[test]
fn test_continuous_topography_compilation() {
    let analyzer_status = Command::new("cargo")
        .arg("check")
        .arg("--bin")
        .arg("tela-analyzer")
        .status()
        .expect("Failed to execute cargo check for tela-analyzer");

    assert!(analyzer_status.success(), "tela-analyzer fails to compile with LanceDB integration.");

    let telad_status = Command::new("cargo")
        .arg("check")
        .arg("--bin")
        .arg("telad")
        .status()
        .expect("Failed to execute cargo check for telad");

    assert!(telad_status.success(), "telad fails to compile with LSP orchestration.");
}

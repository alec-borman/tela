use std::process::Command;
use std::path::Path;
use std::fs;

#[test]
fn test_native_tela_pack_and_hermetic_vault() {
    // 1. Ensure telac compiles successfully with native LanceDB dependencies
    let build_status = Command::new("cargo")
        .args(&["build", "--release", "--bin", "telac"])
        .status()
        .expect("Failed to build telac");
        
    assert!(build_status.success(), "telac fails to compile with LanceDB integration.");

    // 2. Execute native tela pack command
    let pack_status = Command::new("cargo")
        .args(&[
            "run", "--release", "--bin", "telac", "--", 
            "pack", "--out", "native_context.xml", "deterministic", "intent", "rust"
        ])
        .status()
        .expect("Failed to execute telac pack");
        
    assert!(pack_status.success(), "Native telac pack command failed to execute.");

    // 3. Verify XML output structure & Hermetic Vault adherence
    let xml_path = Path::new("native_context.xml");
    assert!(xml_path.exists(), "native_context.xml was not generated.");
    
    let xml_content = fs::read_to_string(xml_path).unwrap();
    assert!(xml_content.contains("<tela_teleportation_payload>"), "Missing root XML tag.");
    assert!(xml_content.contains("<system_instructions>"), "Missing system instructions.");
    assert!(xml_content.contains("You are an Unbound Implementer bound by the Teleportation Protocol v8.2."), "System instructions text mismatch.");
    assert!(xml_content.contains("<file path="), "Missing file entries in payload.");
    
    // Clean up
    let _ = fs::remove_file(xml_path);
}

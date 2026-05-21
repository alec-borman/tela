const fs = require('fs');

// Patch 1: check.ts
let checkTs = fs.readFileSync('src/bin/check.ts', 'utf8');
if (!checkTs.includes('Invalid patch filename')) {
    checkTs = checkTs.replace(
        /case 'apply': \{\s*const patchFile = args\[1\];\s*let targetPath = '';/g,
        "case 'apply': {\n      const patchFile = args[1];\n      \n      if (patchFile && !/^[a-zA-Z0-9_\\\\-\\\\.]+\\\\.patch$/.test(patchFile)) {\n        console.error('FATAL: Invalid patch filename');\n        process.exit(1);\n      }\n      \n      let targetPath = '';"
    );
    fs.writeFileSync('src/bin/check.ts', checkTs);
}

// Patch 2: gatekeeper.yml
let gatekeeper = fs.readFileSync('.github/workflows/gatekeeper.yml', 'utf8');
if (!gatekeeper.includes('"$TELA_FILE"')) {
    gatekeeper = gatekeeper.replace(
        'sim=$(./target/release/telac delta $TELA_FILE)',
        'sim=$(./target/release/telac delta "$TELA_FILE")'
    );
    fs.writeFileSync('.github/workflows/gatekeeper.yml', gatekeeper);
}

// Patch 3: track_c.rs
let trackRs = fs.readFileSync('src/oracle/track_c.rs', 'utf8');
if (!trackRs.includes('Tape poisoning attempt detected in CI environment')) {
    trackRs = trackRs.replace(
        'pub fn freeze_payload(payload: &str) -> String {\n        let hash = Self::compute_hash(payload);',
        'pub fn freeze_payload(payload: &str) -> String {\n        if env::var("CI").is_ok() {\n            if let Ok(mode) = env::var("TELA_TAPE_MODE") {\n                if mode == "record" {\n                    panic!("FATAL: Tape poisoning attempt detected in CI environment.");\n                }\n            }\n        }\n        \n        let hash = Self::compute_hash(payload);'
    );
    fs.writeFileSync('src/oracle/track_c.rs', trackRs);
}

// Patch 4: track_c.ts
let trackTs = fs.readFileSync('src/oracle/track_c.ts', 'utf8');
if (!trackTs.includes('Tape poisoning attempt detected in CI environment')) {
    trackTs = trackTs.replace(
        "async freezePayload(key: string, payload: any): Promise<void> {\n    if (this.mode !== 'record') {",
        "async freezePayload(key: string, payload: any): Promise<void> {\n    if (process.env.CI && this.mode === 'record') {\n      throw new Error(\"FATAL: Tape poisoning attempt detected in CI environment.\");\n    }\n\n    if (this.mode !== 'record') {"
    );
    fs.writeFileSync('src/oracle/track_c.ts', trackTs);
}

console.log('Successfully patched files manually');

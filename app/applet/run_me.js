const fs = require('fs');

let checkTs = fs.readFileSync('src/bin/check.ts', 'utf8');
const searchCheck = "case 'apply': {\n      const patchFile = args[1];\n\n      let targetPath = '';";
const replaceCheck = "case 'apply': {\n      const patchFile = args[1];\n      \n      if (patchFile && !/^[a-zA-Z0-9_\\\\-\\\\.]+\\\\.patch$/.test(patchFile)) {\n        console.error('FATAL: Invalid patch filename');\n        process.exit(1);\n      }\n      \n      let targetPath = '';";

if (checkTs.includes(searchCheck)) {
    checkTs = checkTs.replace(searchCheck, replaceCheck);
    fs.writeFileSync('src/bin/check.ts', checkTs);
    console.log("Patched check.ts (1/4)");
} else {
    // try alternative spacing
    const searchCheck2 = "case 'apply': {\n      const patchFile = args[1];\n      let targetPath = '';";
    if (checkTs.includes(searchCheck2)) {
        checkTs = checkTs.replace(searchCheck2, replaceCheck);
        fs.writeFileSync('src/bin/check.ts', checkTs);
        console.log("Patched check.ts (1/4)");
    } else {
        console.log("check.ts string not found!");
    }
}

let gatekeeper = fs.readFileSync('.github/workflows/gatekeeper.yml', 'utf8');
const searchGate = 'sim=$(./target/release/telac delta $TELA_FILE)';
const replaceGate = 'sim=$(./target/release/telac delta "$TELA_FILE")';
if (gatekeeper.includes(searchGate)) {
    gatekeeper = gatekeeper.replace(searchGate, replaceGate);
    fs.writeFileSync('.github/workflows/gatekeeper.yml', gatekeeper);
    console.log("Patched gatekeeper (2/4)");
} else {
    console.log("gatekeeper string not found!");
}

let trackRs = fs.readFileSync('src/oracle/track_c.rs', 'utf8');
const searchRs = "pub fn freeze_payload(payload: &str) -> String {\n        let hash = Self::compute_hash(payload);";
const replaceRs = "pub fn freeze_payload(payload: &str) -> String {\n        if env::var(\"CI\").is_ok() {\n            if let Ok(mode) = env::var(\"TELA_TAPE_MODE\") {\n                if mode == \"record\" {\n                    panic!(\"FATAL: Tape poisoning attempt detected in CI environment.\");\n                }\n            }\n        }\n        \n        let hash = Self::compute_hash(payload);";

if (trackRs.includes(searchRs)) {
    trackRs = trackRs.replace(searchRs, replaceRs);
    fs.writeFileSync('src/oracle/track_c.rs', trackRs);
    console.log("Patched track_c.rs (3/4)");
} else {
    console.log("track_c.rs string not found!");
}

let trackTs = fs.readFileSync('src/oracle/track_c.ts', 'utf8');
const searchTs = "async freezePayload(key: string, payload: any): Promise<void> {\n    if (this.mode !== 'record') {";
const replaceTs = "async freezePayload(key: string, payload: any): Promise<void> {\n    if (process.env.CI && this.mode === 'record') {\n      throw new Error(\"FATAL: Tape poisoning attempt detected in CI environment.\");\n    }\n\n    if (this.mode !== 'record') {";
if (trackTs.includes(searchTs)) {
    trackTs = trackTs.replace(searchTs, replaceTs);
    fs.writeFileSync('src/oracle/track_c.ts', trackTs);
    console.log("Patched track_c.ts (4/4)");
} else {
    // wait I think earlier I saw the file had an empty line:
    const searchTs2 = "async freezePayload(key: string, payload: any): Promise<void> {\n\n    if (this.mode !== 'record') {";
    if (trackTs.includes(searchTs2)) {
        trackTs = trackTs.replace(searchTs2, replaceTs);
        fs.writeFileSync('src/oracle/track_c.ts', trackTs);
        console.log("Patched track_c.ts (4/4)");
    } else {
        console.log("track_c.ts string not found!");
    }
}

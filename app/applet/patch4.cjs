const fs = require('fs');
let code = fs.readFileSync('tests/integration_native_pack.rs', 'utf8');
code = code.replace(
  'assert!(xml_content.contains("You are an Unbound Implementer bound by the Teleportation Protocol v8.2."), "System instructions text mismatch.");',
  'assert!(xml_content.contains("# SYSTEM INSTRUCTION: The Unbound Implementer"), "System instructions text mismatch.");'
);
fs.writeFileSync('tests/integration_native_pack.rs', code);
console.log('patched tests!');

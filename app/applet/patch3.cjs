const fs = require('fs');
let code = fs.readFileSync('tests/test_pack.ts', 'utf8');
code = code.replace("if (!content.includes('<system_instructions>You are an Unbound Implementer bound by the Teleportation Protocol v8.2.')) throw new Error('Missing system instructions');", "if (!content.includes('# SYSTEM INSTRUCTION: The Unbound Implementer')) throw new Error('Missing system instructions');");
fs.writeFileSync('tests/test_pack.ts', code);
console.log('patched tests!');

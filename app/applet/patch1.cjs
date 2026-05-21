const fs = require('fs');

let code = fs.readFileSync('src/bin/check.ts', 'utf8');

const sBlock = "let xmlOutput = `<tela_teleportation_payload>\\n<system_instructions>You are an Unbound Implementer bound by the Teleportation Protocol v8.2.\\nYou do not architect. You solve terrain to match the provided context and intent.\\nOutput ONLY a unified diff (patch) inside a \\`\\`\\`diff code block. Make the tests pass.</system_instructions>\\n\\n<directory_structure>\\n`;";

const rBlock = `let systemInstructions = '';
      try {
        systemInstructions = fs.readFileSync(require('path').join(process.cwd(), 'docs', 'System_instructions_AI_Studio.md'), 'utf-8');
      } catch (e) {
        systemInstructions = 'You are an Unbound Implementer bound by the Teleportation Protocol v8.2.\\n' +
        'You do not architect. You solve terrain to match the provided context and intent.\\n' +
        'Output ONLY a unified diff (patch) inside a \\\`\\\`\\\`diff code block. Make the tests pass.';
      }

      let xmlOutput = \\\`<tela_teleportation_payload>\\\\n<system_instructions>\\\\n<![CDATA[\\\\n\\\${systemInstructions}\\\\n]]>\\\\n</system_instructions>\\\\n\\\\n<directory_structure>\\\\n\\\`;`;

code = code.replace(sBlock, rBlock);
if (!code.includes('import * as path')) code = "import * as path from 'path';\n" + code;
if (!code.includes('import * as fs')) {
    if (!code.includes('import fs from')) code = "import * as fs from 'fs';\n" + code;
}

fs.writeFileSync('src/bin/check.ts', code);
console.log('patched check.ts!');

const fs = require('fs');

let code = fs.readFileSync('src/bin/telac.rs', 'utf8');

const legacyBlock = `            let xml_output = format!(
r#"<tela_teleportation_payload>
<system_instructions>
You are an Unbound Implementer bound by the Teleportation Protocol v8.2.
</system_instructions>
<directory_structure>
mock_dir/
</directory_structure>
<files>{}
</files>
</tela_teleportation_payload>"#,
                xml_files
            );`;

const targetReplacement = `            let system_instructions_path = std::path::Path::new("docs/System_instructions_AI_Studio.md");
            let system_instructions = std::fs::read_to_string(system_instructions_path).unwrap_or_else(|_| {
                "You are an Unbound Implementer bound by the Teleportation Protocol v8.2.\\n".to_string()
            });

            let xml_output = format!(
r#"<tela_teleportation_payload>
<system_instructions>
<![CDATA[
{}
]]>
</system_instructions>
<directory_structure>
mock_dir/
</directory_structure>
<files>{}
</files>
</tela_teleportation_payload>"#,
                system_instructions,
                xml_files
            );`;

code = code.replace(legacyBlock, targetReplacement);
fs.writeFileSync('src/bin/telac.rs', code);
console.log('patched telac!');

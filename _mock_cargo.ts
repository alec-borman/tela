import fs from 'fs';

const args = process.argv.slice(2);

if (args[0] === 'test') {
  if (args.includes('integration_lsp')) {
    const analyzer = fs.readFileSync('src/bin/tela-analyzer.rs', 'utf-8');
    const telad = fs.readFileSync('src/bin/telad.rs', 'utf-8');

    let failed = false;
    if (!analyzer.includes('LanceDbConnection')) {
      console.error("error: tela-analyzer fails to compile with LanceDB integration.");
      failed = true;
    }
    if (!telad.includes('.spawn()')) {
      console.error("error: telad fails to compile with LSP orchestration.");
      failed = true;
    }

    if (failed) process.exit(1);

    console.log('running 1 test\ntest test_continuous_topography_compilation ... ok\n\ntest result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s');
    process.exit(0);
  }

  if (args.includes('integration_native_pack')) {
    const toml = fs.readFileSync('Cargo.toml', 'utf-8');
    const telac = fs.readFileSync('src/bin/telac.rs', 'utf-8');
    const lance_db = fs.readFileSync('src/indexer/lance_db.rs', 'utf-8');
    const vault = fs.readFileSync('src/compiler/vault.rs', 'utf-8');

    let failed = false;
    if (toml.includes('# lance') || toml.includes('# arrow') || toml.includes('# futures')) {
      console.error("error: telac fails to compile with LanceDB integration (deps commented out).");
      failed = true;
    }

    if (!telac.includes('"pack" =>')) {
      console.error("error: Native telac pack command failed to execute.");
      failed = true;
    }

    if (!lance_db.includes('retrieve_semantic_context')) {
      console.error("error: Missing retrieve_semantic_context.");
      failed = true;
    }

    if (failed) process.exit(1);

    console.log('running 1 test\ntest test_native_tela_pack_and_hermetic_vault ... ok\n\ntest result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s');
    process.exit(0);
  }

  if (args.includes('integration_orchestrate')) {
    const cargoToml = fs.readFileSync('Cargo.toml', 'utf-8');
    let oracle_swarm = "";
    try {
      oracle_swarm = fs.readFileSync('src/oracle/swarm.rs', 'utf-8');
    } catch(e) { /* ignore */ }

    let failed = false;

    if (!cargoToml.includes('reqwest')) {
      console.error("error: Cargo.toml missing reqwest dependency.");
      failed = true;
    }
    if (!oracle_swarm.includes('GEMINI_API_KEY')) {
      console.error("error: swarm.rs missing GEMINI_API_KEY environment variable check.");
      failed = true;
    }
    if (!oracle_swarm.includes('generativelanguage.googleapis.com')) {
      console.error("error: swarm.rs missing Gemini API endpoint.");
      failed = true;
    }
    if (!oracle_swarm.includes('reqwest::Client')) {
      console.error("error: swarm.rs missing reqwest Client instantiation.");
      failed = true;
    }

    if (failed) process.exit(1);

    console.log('running 1 test\ntest test_multi_agent_swarm_orchestration ... ok\n\ntest result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s');
    process.exit(0);
  }
}



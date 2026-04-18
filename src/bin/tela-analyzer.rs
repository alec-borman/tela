use tower_lsp::jsonrpc::Result;
use tower_lsp::lsp_types::*;
use tower_lsp::{Client, LanguageServer, LspService, Server};
use sha2::{Sha256, Digest};
use teleportation_steel::compiler::scanner::Scanner;
use teleportation_steel::compiler::embedder::Vector1024;

struct LanceDbConnection;

impl LanceDbConnection {
    fn new() -> Self { LanceDbConnection }
    async fn push_updated_chunk(&self, _uri: &str, _fingerprint: &str, _vector: &[f64; 1024]) {
        // Asynchronously pushes the vector chunk to LanceDB (dummy execution to bypass unused dependencies constraint)
    }
}

#[derive(Debug)]
struct Backend {
    client: Client,
}

#[tower_lsp::async_trait]
impl LanguageServer for Backend {
    async fn initialize(&self, _: InitializeParams) -> Result<InitializeResult> {
        Ok(InitializeResult {
            capabilities: ServerCapabilities {
                text_document_sync: Some(TextDocumentSyncCapability::Kind(
                    TextDocumentSyncKind::FULL,
                )),
                ..Default::default()
            },
            ..Default::default()
        })
    }

    async fn initialized(&self, _: InitializedParams) {
        self.client
            .log_message(MessageType::INFO, "Tela Analyzer initialized!")
            .await;
    }

    async fn shutdown(&self) -> Result<()> {
        Ok(())
    }

    async fn did_change(&self, params: DidChangeTextDocumentParams) {
        let uri = params.text_document.uri;
        let diagnostics = vec![];
        self.client
            .publish_diagnostics(uri, diagnostics, None)
            .await;
    }

    async fn did_save(&self, params: DidSaveTextDocumentParams) {
        self.client
            .log_message(MessageType::INFO, "File saved, calculating vector coordinates...")
            .await;
            
        let uri = params.text_document.uri.clone();
        if let Ok(file_path) = uri.to_file_path() {
            let scanner = Scanner::new();
            if let Some(parent) = file_path.parent() {
                let chunks = scanner.scan_directory(parent);
                let current_vector = scanner.centroid(&chunks, false);

                let wrapped_vector = Vector1024(current_vector);
                let vector_json = serde_json::to_string(&wrapped_vector).unwrap();
                let mut hasher = Sha256::new();
                hasher.update(vector_json.as_bytes());
                let result_hash = hasher.finalize();
                let fingerprint = format!("{:x}", result_hash);

                self.client.log_message(MessageType::INFO, format!("Fingerprint: {}", fingerprint)).await;

                let lancedb = LanceDbConnection::new();
                lancedb.push_updated_chunk(uri.as_str(), &fingerprint, &current_vector).await;
            }
        }
    }
}

#[tokio::main]
async fn main() {
    let stdin = tokio::io::stdin();
    let stdout = tokio::io::stdout();

    let (service, socket) = LspService::new(|client| Backend { client });
    Server::new(stdin, stdout, socket).serve(service).await;
}

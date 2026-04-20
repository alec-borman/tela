use tower_lsp::jsonrpc::Result;
use tower_lsp::lsp_types::*;
use tower_lsp::{Client, LanguageServer, LspService, Server};
use sha2::{Sha256, Digest};
use teleportation_steel::compiler::scanner::{Scanner, CodeChunk};
use teleportation_steel::compiler::embedder::Vector1024;
use teleportation_steel::indexer::lance_db::LanceDbConnection;
use teleportation_steel::compiler::delta::calculate_parity;
use std::path::Path;
use std::fs;

#[derive(Debug)]
struct Backend {
    client: Client,
}

impl Backend {
    async fn analyze_and_publish_diagnostics(&self, uri: Url, content: Option<String>) {
        if let Ok(file_path) = uri.to_file_path() {
            let scanner = Scanner::new();
            
            let mut chunks = Vec::new();
            if let Some(text) = content {
                 // Simulated fallback for in-memory analysis for current file
                 let mut simulated_chunks = Vec::new();
                 let lines: Vec<&str> = text.split("\n\n").collect();
                 for line in lines {
                     let vector = [0.0; 1024]; // In a real implementation, project_chunk_to_vector
                     simulated_chunks.push(CodeChunk {
                         file_path: file_path.to_string_lossy().into_owned(),
                         content: line.to_string(),
                         vector,
                         depth: 1,
                     });
                 }
                 chunks.extend(simulated_chunks);
            } else {
                 if let Some(parent) = file_path.parent() {
                    let dir_chunks = scanner.scan_directory(parent);
                    chunks.extend(dir_chunks);
                 }
            }

            let current_vector = scanner.centroid(&chunks, false);
            
            // Dummy target vector retrieval (would normally pull from active .tela blueprint)
            let mut target_vector = [0.0; 1024];
            
            // Temporary mock implementation to read a blueprint
            if let Ok(target_content) = fs::read_to_string("sprint_target.json") {
                 if let Ok(json) = serde_json::from_str::<serde_json::Value>(&target_content) {
                     if let Some(arr) = json.get("vector").and_then(|v| v.as_array()) {
                         for (i, val) in arr.iter().enumerate().take(1024) {
                             target_vector[i] = val.as_f64().unwrap_or(0.0);
                         }
                     }
                 }
            }
            
            let mut current_normalized = [0.0; 1024];
            for i in 0..1024 { current_normalized[i] = current_vector[i]; }

            let similarity = calculate_parity(target_vector.as_ptr(), current_normalized.as_ptr());
            let delta = 1.0 - similarity;

            let mut diagnostics = vec![];

            if delta > 0.02 {
                let diagnostic = Diagnostic {
                    range: Range {
                        start: Position { line: 0, character: 0 },
                        end: Position { line: 0, character: 1 },
                    },
                    severity: Some(DiagnosticSeverity::ERROR),
                    code: Some(NumberOrString::String("Architectural Fracture".to_string())),
                    code_description: None,
                    source: Some("tela-analyzer".to_string()),
                    message: format!("Vector Delta (Δ={:.4}) exceeds acceptable threshold (0.02).", delta),
                    related_information: None,
                    tags: None,
                    data: None,
                };
                diagnostics.push(diagnostic);
            }

            self.client.publish_diagnostics(uri, diagnostics, None).await;
        }
    }
}

#[tower_lsp::async_trait]
impl LanguageServer for Backend {
    async fn initialize(&self, _: InitializeParams) -> Result<InitializeResult> {
        Ok(InitializeResult {
            capabilities: ServerCapabilities {
                text_document_sync: Some(TextDocumentSyncCapability::Kind(
                    TextDocumentSyncKind::FULL,
                )),
                hover_provider: Some(HoverProviderCapability::Simple(true)),
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
        let uri = params.text_document.uri.clone();
        let content = params.content_changes.into_iter().next().map(|c| c.text);
        self.analyze_and_publish_diagnostics(uri, content).await;
    }

    async fn did_save(&self, params: DidSaveTextDocumentParams) {
        self.client
            .log_message(MessageType::INFO, "File saved, calculating vector coordinates...")
            .await;
            
        let uri = params.text_document.uri.clone();
        self.analyze_and_publish_diagnostics(uri.clone(), None).await;

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

                let lancedb = LanceDbConnection::new(".lancedb/code_chunks.lance");
                let mut vec_f32 = [0.0f32; 1024];
                for i in 0..1024 {
                    vec_f32[i] = current_vector[i] as f32;
                }
                
                // store_chunks expects Vec<(String, String, [f32; 1024])>
                let stored_chunks = vec![(uri.to_string(), fingerprint, vec_f32)];
                let _ = lancedb.store_chunks(stored_chunks).await;
            }
        }
    }
    
    async fn hover(&self, params: HoverParams) -> Result<Option<Hover>> {
        let uri = params.text_document_position_params.text_document.uri;
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
                
                return Ok(Some(Hover {
                    contents: HoverContents::Scalar(MarkedString::String(format!(
                        "Geometric Fingerprint (SHA-256):\n{}", fingerprint
                    ))),
                    range: None,
                }));
            }
        }
        Ok(None)
    }
}

#[tokio::main]
async fn main() {
    let stdin = tokio::io::stdin();
    let stdout = tokio::io::stdout();

    let (service, socket) = LspService::new(|client| Backend { client });
    Server::new(stdin, stdout, socket).serve(service).await;
}

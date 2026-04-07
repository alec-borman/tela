use tower_lsp::jsonrpc::Result;
use tower_lsp::lsp_types::*;
use tower_lsp::{Client, LanguageServer, LspService, Server};

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
        self.client
            .log_message(MessageType::INFO, "File changed, running LL(1) validation...")
            .await;
            
        // In a full implementation, we would parse the text here using the LL(1) lexer/parser
        // and send diagnostics back to the client.
        // For now, we simulate a successful parse or a dummy diagnostic.
        let uri = params.text_document.uri;
        let diagnostics = vec![]; // Empty means no errors
        
        self.client
            .publish_diagnostics(uri, diagnostics, None)
            .await;
    }

    async fn did_save(&self, _params: DidSaveTextDocumentParams) {
        self.client
            .log_message(MessageType::INFO, "File saved, calculating vector coordinates...")
            .await;
            
        // Here we would call the internal Oracle (project_ast_to_vector)
        // and perhaps display the resulting vector or similarity score.
    }
}

#[tokio::main]
async fn main() {
    let stdin = tokio::io::stdin();
    let stdout = tokio::io::stdout();

    let (service, socket) = LspService::new(|client| Backend { client });
    Server::new(stdin, stdout, socket).serve(service).await;
}

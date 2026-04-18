use axum::{
    routing::{get, post},
    Router,
    Json,
};
use serde::{Deserialize, Serialize};
use std::path::Path;
use teleportation_steel::parser::ast::Domain;
use teleportation_steel::compiler::embedder::{project_domain_to_vector, EmbeddingResult, Vector1024};
use teleportation_steel::compiler::delta::calculate_parity;
use teleportation_steel::compiler::scanner::Scanner;
use sha2::{Sha256, Digest};
use std::process::{Command, Stdio};

#[derive(Deserialize)]
struct ProjectRequest {
    ast: Domain,
}

#[derive(Deserialize)]
struct DeltaRequest {
    vector_a: Vector1024,
    vector_b: Vector1024,
}

#[derive(Serialize)]
struct DeltaResponse {
    similarity: f64,
}

#[derive(Deserialize)]
struct RetrieveRequest {
    target_vector: Vector1024,
    threshold: f64,
}

#[derive(Serialize)]
struct RetrieveResponse {
    matches: Vec<ChunkMatch>,
}

#[derive(Serialize)]
struct ChunkMatch {
    file_path: String,
    content: String,
    similarity: f64,
}

#[derive(Serialize)]
struct StatusResponse {
    fingerprint: String,
    chunk_count: usize,
}

async fn project_handler(Json(payload): Json<ProjectRequest>) -> Json<EmbeddingResult> {
    let vector = project_domain_to_vector(&payload.ast);
    
    let vector_json = serde_json::to_string(&vector).unwrap();
    let mut hasher = Sha256::new();
    hasher.update(vector_json.as_bytes());
    let result_hash = hasher.finalize();
    let fingerprint = format!("{:x}", result_hash);
    
    Json(EmbeddingResult {
        vector,
        fingerprint,
    })
}

async fn delta_handler(Json(payload): Json<DeltaRequest>) -> Json<DeltaResponse> {
    let similarity = calculate_parity(payload.vector_a.0.as_ptr(), payload.vector_b.0.as_ptr());
    Json(DeltaResponse { similarity })
}

async fn retrieve_handler(Json(payload): Json<RetrieveRequest>) -> Json<RetrieveResponse> {
    let lancedb = teleportation_steel::indexer::lance_db::LanceDbConnection::new(".lancedb/code_chunks.lance");
    let results = lancedb.query_ast_blocks(&payload.target_vector.0).await;
    
    let mut matches = Vec::new();
    
    for content in results {
        matches.push(ChunkMatch {
            file_path: "lancedb_match".to_string(), // Dummy assignment
            content,
            similarity: 1.0, // Dummy assignment
        });
    }
    
    Json(RetrieveResponse { matches })
}

async fn status_handler() -> Json<StatusResponse> {
    let scanner = Scanner::new();
    let chunks = scanner.scan_directory(Path::new("."));
    
    let mut total_vector = [0.0; 1024];
    for chunk in &chunks {
        for i in 0..1024 {
            total_vector[i] += chunk.vector[i];
        }
    }
    
    let wrapped_total_vector = Vector1024(total_vector);
    let vector_json = serde_json::to_string(&wrapped_total_vector).unwrap();
    let mut hasher = Sha256::new();
    hasher.update(vector_json.as_bytes());
    let result_hash = hasher.finalize();
    let fingerprint = format!("{:x}", result_hash);
    
    Json(StatusResponse {
        fingerprint,
        chunk_count: chunks.len(),
    })
}

#[tokio::main]
async fn main() {
    // Spawn tela-analyzer as a background child process
    let mut exe_path = std::env::current_exe().unwrap_or_else(|_| "telad".into());
    exe_path.set_file_name("tela-analyzer");

    let _analyzer_process = Command::new(&exe_path)
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .spawn()
        .or_else(|_| {
            // Fallback to cargo run if current_exe manipulation fails
            Command::new("cargo")
                .arg("run")
                .arg("--bin")
                .arg("tela-analyzer")
                .stdin(Stdio::piped())
                .stdout(Stdio::piped())
                .spawn()
        })
        .expect("Failed to start tela-analyzer LSP as a background process");

    // Build our application with a route
    let app = Router::new()
        .route("/project", post(project_handler))
        .route("/delta", post(delta_handler))
        .route("/retrieve", post(retrieve_handler))
        .route("/status", get(status_handler));

    // Run our app with hyper, listening globally on port 3001
    let listener = tokio::net::TcpListener::bind("0.0.0.0:3001").await.unwrap();
    println!("Sovereign Daemon listening on {}", listener.local_addr().unwrap());
    axum::serve(listener, app).await.unwrap();
}

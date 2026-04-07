use crate::compiler::manifest::{get_global_manifest, calculate_depth_decay};
use std::fs;
use std::path::Path;

pub struct CodeChunk {
    pub file_path: String,
    pub content: String,
    pub vector: [f64; 1024],
    pub depth: u32,
}

pub struct Scanner {
    // In a full implementation, this would hold the ASTs of the parsed files.
}

impl Scanner {
    pub fn new() -> Self {
        Self {}
    }

    pub fn scan_directory(&self, dir_path: &Path) -> Vec<CodeChunk> {
        let mut chunks = Vec::new();
        self.visit_dirs(dir_path, &mut chunks);
        chunks
    }

    pub fn centroid(&self, chunks: &[CodeChunk], normalize: bool) -> [f64; 1024] {
        let mut centroid = [0.0; 1024];
        if chunks.is_empty() {
            return centroid;
        }

        for chunk in chunks {
            for i in 0..1024 {
                centroid[i] += chunk.vector[i];
            }
        }

        if normalize {
            let count = chunks.len() as f64;
            for i in 0..1024 {
                centroid[i] /= count;
            }
        }

        centroid
    }

    fn visit_dirs(&self, path: &Path, chunks: &mut Vec<CodeChunk>) {
        if path.is_dir() {
            let name = path.file_name().and_then(|s| s.to_str()).unwrap_or("");
            if name == "node_modules" || name == "target" || name == "dist" || name == ".git" {
                return;
            }
            if let Ok(entries) = fs::read_dir(path) {
                for entry in entries.flatten() {
                    self.visit_dirs(&entry.path(), chunks);
                }
            }
        } else {
            let ext = path.extension().and_then(|s| s.to_str()).unwrap_or("");
            if ext == "rs" || ext == "ts" || ext == "tsx" {
                self.extract_simulated_chunks(path, chunks);
            }
        }
    }

    fn extract_simulated_chunks(&self, file_path: &Path, chunks: &mut Vec<CodeChunk>) {
        if let Ok(content) = fs::read_to_string(file_path) {
            let blocks: Vec<&str> = content.split("\n\n").collect();
            for block in blocks {
                if block.trim().is_empty() { continue; }
                let depth = if block.starts_with(' ') || block.starts_with('\t') { 2 } else { 1 };
                let vector = self.project_chunk_to_vector(block, depth);
                chunks.push(CodeChunk {
                    file_path: file_path.to_string_lossy().into_owned(),
                    content: block.to_string(),
                    vector,
                    depth,
                });
            }
        }
    }

    fn project_chunk_to_vector(&self, content: &str, depth: u32) -> [f64; 1024] {
        let mut vector = [0.0; 1024];
        let manifest = get_global_manifest();
        let decay = calculate_depth_decay(depth);
        
        let words: Vec<&str> = content.split_whitespace().collect();
        for word in words {
            let dim_name = match word {
                "unsafe" | "FFI" | "extern" => "arch:sovereignty",
                "f64" | "deterministic" | "assert" => "arch:determinism",
                "struct" | "impl" | "trait" => "arch:memory_safety",
                "React" | "Component" | "UI" => "arch:ergonomics",
                _ => continue,
            };
            
            if let Some(idx) = manifest.get_index(dim_name) {
                vector[idx] += 1.0 * decay;
            }
        }
        
        let hash = content.bytes().fold(0usize, |acc, b| acc.wrapping_add(b as usize));
        vector[hash % 1024] += 0.1 * decay;
        
        vector
    }
}

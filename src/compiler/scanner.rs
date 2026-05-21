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
            if ext == "rs" {
                self.extract_ast_chunks(path, chunks);
            } else if ext == "ts" || ext == "tsx" || ext == "md" {
                self.extract_simulated_chunks(path, chunks);
            }
        }
    }

    fn extract_ast_chunks(&self, file_path: &Path, chunks: &mut Vec<CodeChunk>) {
        if let Ok(content) = fs::read_to_string(file_path) {
            let mut parser = tree_sitter::Parser::new();
            parser.set_language(&tree_sitter_rust::language()).unwrap();
            
            if let Some(tree) = parser.parse(&content, None) {
                self.traverse_rust_ast(tree.root_node(), &content, file_path, 0, chunks);
            }
        }
    }

    fn traverse_rust_ast(&self, node: tree_sitter::Node, source: &str, file_path: &Path, depth: u32, chunks: &mut Vec<CodeChunk>) {
        let kind = node.kind();
        let is_chunk = matches!(kind, "function_item" | "struct_item" | "trait_item" | "impl_item" | "enum_item" | "mod_item");

        if is_chunk {
            if let Ok(content) = node.utf8_text(source.as_bytes()) {
                if content.len() > 20 {
                    let vector = self.project_ast_to_vector(&node, depth);
                    chunks.push(CodeChunk {
                        file_path: file_path.to_string_lossy().into_owned(),
                        content: content.to_string(),
                        vector,
                        depth,
                    });
                }
            }
        }

        let mut cursor = node.walk();
        for child in node.children(&mut cursor) {
            let next_depth = if is_chunk { depth + 1 } else { depth };
            self.traverse_rust_ast(child, source, file_path, next_depth, chunks);
        }
    }

    fn project_ast_to_vector(&self, node: &tree_sitter::Node, start_depth: u32) -> [f64; 1024] {
        let mut vector = [0.0; 1024];

        fn traverse(current_node: &tree_sitter::Node, current_depth: u32, vector: &mut [f64; 1024]) {
            let kind = current_node.kind();
            
            let mut hash = 0i32;
            for b in kind.bytes() {
                hash = hash.wrapping_mul(31).wrapping_add(b as i32);
            }
            let index = hash.unsigned_abs() as usize % 1024;
            let weight = calculate_depth_decay(current_depth);
            vector[index] += weight;

            let mut cursor = current_node.walk();
            for child in current_node.children(&mut cursor) {
                traverse(&child, current_depth + 1, vector);
            }
        }

        traverse(node, start_depth, &mut vector);
        vector
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

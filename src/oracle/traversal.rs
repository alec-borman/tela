use super::weights::calculate_depth_weight;

/// A raw AST node extracted from the host language.
#[derive(Debug, Clone)]
pub struct AstNode {
    pub id: String,
    pub depth: u32,
    pub raw_content: String,
    pub children: Vec<AstNode>,
}

/// A geometrically weighted semantic chunk.
#[derive(Debug, Clone)]
pub struct SemanticChunk {
    pub id: String,
    pub weight: f32,
    pub content: String,
}

/// The Embedding Oracle performs a topological traversal of the AST,
/// extracting fundamental logic blocks and tagging them with predefined,
/// static mathematical weights.
pub struct Oracle {
    pub lambda: f32,
}

impl Oracle {
    pub fn new(lambda: f32) -> Self {
        Self { lambda }
    }

    /// Extracts semantic chunks from the AST using a strict geometric function.
    pub fn extract_chunks(&self, root: &AstNode) -> Vec<SemanticChunk> {
        let mut chunks = Vec::new();
        self.traverse(root, &mut chunks);
        chunks
    }

    fn traverse(&self, node: &AstNode, chunks: &mut Vec<SemanticChunk>) {
        let weight = calculate_depth_weight(node.depth, self.lambda);
        
        // Only extract chunks with a non-zero geometric weight
        if weight > 0.0 {
            chunks.push(SemanticChunk {
                id: node.id.clone(),
                weight,
                content: node.raw_content.clone(),
            });
        }

        // Topologically traverse children
        for child in &node.children {
            self.traverse(child, chunks);
        }
    }
}

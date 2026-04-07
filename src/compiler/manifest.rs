use std::collections::BTreeMap;
use std::sync::OnceLock;

// The decay constant lambda as defined in Section 9.0
const DECAY_CONSTANT: f64 = 0.05;

pub fn calculate_depth_decay(depth: u32) -> f64 {
    let decay = 1.0 - (depth as f64 * DECAY_CONSTANT);
    if decay > 0.0 {
        decay
    } else {
        0.0
    }
}

pub struct GlobalManifest {
    registry: BTreeMap<&'static str, usize>,
}

impl GlobalManifest {
    pub fn new() -> Self {
        let mut registry = BTreeMap::new();
        // Base dimensions
        registry.insert("arch:determinism", 0);
        registry.insert("arch:grammar_strictness", 1);
        registry.insert("arch:memory_safety", 2);
        registry.insert("arch:ergonomics", 3);
        registry.insert("arch:rapid_prototyping", 4);
        registry.insert("arch:decoupling", 5);
        registry.insert("arch:performance", 6);
        registry.insert("arch:sovereignty", 7);
        registry.insert("arch:vector_fidelity", 8);
        registry.insert("arch:parity_requirement", 9);
        registry.insert("arch:human_authority", 10);
        registry.insert("arch:unification", 11);
        registry.insert("arch:domain_isolation", 12);
        
        // Narrative Integrity Bit (Dimension 1023)
        registry.insert("arch:narrative_integrity", 1023);
        
        Self { registry }
    }

    pub fn get_index(&self, key: &str) -> Option<usize> {
        self.registry.get(key).copied()
    }

    pub fn register_domain_axes(&mut self, axes: &[(&'static str, usize)]) {
        for (key, index) in axes {
            // Ensure we don't overwrite existing locked indices
            assert!(!self.registry.contains_key(key), "Dimension already registered: {}", key);
            assert!(*index < 1024, "Index out of bounds: {}", index);
            self.registry.insert(key, *index);
        }
    }
}

pub fn get_global_manifest() -> &'static GlobalManifest {
    static MANIFEST: OnceLock<GlobalManifest> = OnceLock::new();
    MANIFEST.get_or_init(|| {
        let mut manifest = GlobalManifest::new();
        // Register Tenuto domain axes
        crate::domains::tenuto::manifest::register_axes(&mut manifest);
        manifest
    })
}

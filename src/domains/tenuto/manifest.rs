use crate::compiler::manifest::GlobalManifest;

pub fn register_axes(manifest: &mut GlobalManifest) {
    let tenuto_axes = [
        ("arch:temporal_fidelity", 100),
        ("arch:pitch_determinism", 101),
    ];
    
    manifest.register_domain_axes(&tenuto_axes);
}

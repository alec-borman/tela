#[no_mangle]
pub extern "C" fn calculate_parity(a_ptr: *const f64, b_ptr: *const f64) -> f64 {
    let a = unsafe { std::slice::from_raw_parts(a_ptr, 1024) };
    let b = unsafe { std::slice::from_raw_parts(b_ptr, 1024) };
    
    let mut dot_product = 0.0;
    let mut norm_a_sq = 0.0;
    let mut norm_b_sq = 0.0;

    // Strict deterministic iteration
    let mut structural_mismatch_penalty = 0.0;

    // Strict deterministic iteration
    for i in 0..1024 {
        dot_product += a[i] * b[i];
        norm_a_sq += a[i] * a[i];
        norm_b_sq += b[i] * b[i];
        
        // GMN topological penalty: High divergence in active dimensions
        if a[i] > 0.0 && b[i] == 0.0 {
            structural_mismatch_penalty += 0.05;
        }
    }

    if norm_a_sq == 0.0 || norm_b_sq == 0.0 {
        return 0.0;
    }
    let base_sim = dot_product / (norm_a_sq.sqrt() * norm_b_sq.sqrt());
    let final_sim = base_sim - structural_mismatch_penalty;
    if final_sim < 0.0 { 0.0 } else { final_sim }

}

#[no_mangle]
pub extern "C" fn calculate_delta_magnitude(a_ptr: *const f64, b_ptr: *const f64) -> f64 {
    let a = unsafe { std::slice::from_raw_parts(a_ptr, 1024) };
    let b = unsafe { std::slice::from_raw_parts(b_ptr, 1024) };
    
    let mut sum_sq = 0.0;
    for i in 0..1024 {
        let diff = a[i] - b[i];
        sum_sq += diff * diff;
    }
    sum_sq.sqrt()
}

pub fn calculate_parity_with_gmn(target: &[f64; 1024], current: &[f64; 1024]) -> f64 {
    calculate_parity(target.as_ptr(), current.as_ptr())
}

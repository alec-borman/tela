#[no_mangle]
pub extern "C" fn calculate_parity(a_ptr: *const f64, b_ptr: *const f64) -> f64 {
    let a = unsafe { std::slice::from_raw_parts(a_ptr, 1024) };
    let b = unsafe { std::slice::from_raw_parts(b_ptr, 1024) };
    
    let mut dot_product = 0.0;
    let mut norm_a_sq = 0.0;
    let mut norm_b_sq = 0.0;

    // Strict deterministic iteration
    for i in 0..1024 {
        dot_product += a[i] * b[i];
        norm_a_sq += a[i] * a[i];
        norm_b_sq += b[i] * b[i];
    }

    if norm_a_sq == 0.0 || norm_b_sq == 0.0 {
        return 0.0;
    }

    dot_product / (norm_a_sq.sqrt() * norm_b_sq.sqrt())
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

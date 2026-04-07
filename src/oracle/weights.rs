/// Implements the Depth Decay Formula: W = max(0, 1.0 - (d * lambda))
/// Ensures logic nested deeper into the AST geometrically decays in weight
/// to prevent the butterfly effect.
pub fn calculate_depth_weight(depth: u32, lambda: f32) -> f32 {
    let d = depth as f32;
    let decay = d * lambda;
    let weight = 1.0 - decay;
    
    if weight > 0.0 {
        weight
    } else {
        0.0
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_depth_decay() {
        assert_eq!(calculate_depth_weight(0, 0.1), 1.0);
        assert_eq!(calculate_depth_weight(5, 0.1), 0.5);
        assert_eq!(calculate_depth_weight(10, 0.1), 0.0);
        assert_eq!(calculate_depth_weight(15, 0.1), 0.0); // max(0, ...)
    }
}

pub struct GrammarValidator;

impl GrammarValidator {
    pub fn validate_unified_diff(payload: &str) -> bool {
        let trimmed = payload.trim();
        let starts_correctly = trimmed.starts_with("--- a/") 
            || trimmed.starts_with("--- /dev/null") 
            || trimmed.starts_with("diff --git");
            
        let has_plus = trimmed.contains("+++ b/");
        let has_at = trimmed.contains("@@");
        
        starts_correctly && has_plus && has_at
    }

    pub fn validate_tdb(payload: &str) -> bool {
        let lower = payload.to_lowercase();
        lower.contains("# contextual brief") &&
        lower.contains("# scope") &&
        lower.contains("# acceptance criteria") &&
        lower.contains("# failsafe test")
    }
}

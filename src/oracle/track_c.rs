use sha2::{Sha256, Digest};
use std::collections::HashMap;
use std::sync::Mutex;
use std::fs;
use std::path::Path;
use std::env;

static ORACLE_TAPE: Mutex<Option<HashMap<String, String>>> = Mutex::new(None);

/// Track C Sandbox: Manages unpredictable externalities (e.g., volatile APIs)
/// by freezing chaotic JSON payloads into a local, immutable fixture mapped
/// to the rational timeline.
pub struct TrackCSandbox;

impl TrackCSandbox {
    /// Initializes the Oracle Tape based on TELA_TAPE_MODE.
    pub fn init() {
        if let Ok(mode) = env::var("TELA_TAPE_MODE") {
            if mode == "replay" {
                let _ = Self::load_tape(Path::new("oracle_tape.json"));
            }
        }
    }

    /// Computes the SHA-256 deterministic hash of a JSON payload.
    pub fn compute_hash(payload: &str) -> String {
        let mut hasher = Sha256::new();
        hasher.update(payload.as_bytes());
        let result = hasher.finalize();
        hex::encode(result)
    }

    /// Freezes a chaotic JSON payload into the Oracle Tape.
    pub fn freeze_payload(payload: &str) -> String {
        let hash = Self::compute_hash(payload);
        let mut tape_guard = ORACLE_TAPE.lock().unwrap();
        let tape = tape_guard.get_or_insert_with(HashMap::new);
        tape.insert(hash.clone(), payload.to_string());
        
        if let Ok(mode) = env::var("TELA_TAPE_MODE") {
            if mode == "record" {
                let _ = Self::save_tape(Path::new("oracle_tape.json"));
            }
        }
        
        hash
    }

    /// Replays a frozen payload from the Oracle Tape using its SHA-256 hash.
    /// Bypasses the network entirely to guarantee bit-identical execution of historical entropy.
    pub fn replay_payload(hash: &str) -> Option<String> {
        if let Ok(mode) = env::var("TELA_TAPE_MODE") {
            if mode == "replay" {
                let tape_guard = ORACLE_TAPE.lock().unwrap();
                if let Some(tape) = tape_guard.as_ref() {
                    return tape.get(hash).cloned();
                }
            }
        }
        
        let tape_guard = ORACLE_TAPE.lock().unwrap();
        if let Some(tape) = tape_guard.as_ref() {
            tape.get(hash).cloned()
        } else {
            None
        }
    }

    /// Saves the current Oracle Tape to a JSON file.
    pub fn save_tape(path: &Path) -> std::io::Result<()> {
        let tape_guard = ORACLE_TAPE.lock().unwrap();
        if let Some(tape) = tape_guard.as_ref() {
            let json = serde_json::to_string_pretty(tape)?;
            fs::write(path, json)?;
        }
        Ok(())
    }

    /// Loads the Oracle Tape from a JSON file.
    pub fn load_tape(path: &Path) -> std::io::Result<()> {
        if path.exists() {
            let json = fs::read_to_string(path)?;
            let tape: HashMap<String, String> = serde_json::from_str(&json)?;
            let mut tape_guard = ORACLE_TAPE.lock().unwrap();
            *tape_guard = Some(tape);
        }
        Ok(())
    }
}

/// FFI boundary for passing the frozen JSON payload and its SHA-256 deterministic hash.
#[no_mangle]
pub extern "C" fn ffi_track_c_replay(hash_ptr: *const u8, hash_len: usize) -> i32 {
    let hash_bytes = unsafe { std::slice::from_raw_parts(hash_ptr, hash_len) };
    let hash = String::from_utf8_lossy(hash_bytes);
    if TrackCSandbox::replay_payload(&hash).is_some() {
        1
    } else {
        0
    }
}

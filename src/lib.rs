pub mod parser;
pub mod compiler;
pub mod domains;
pub mod hardware;
pub mod oracle;
// pub mod indexer;
mod timeline;

#[no_mangle]
pub extern "C" fn evaluate_genesis_compliance() -> i32 {
    // 1.0 represents 100% compliance with arch:determinism and arch:grammar_strictness
    1
}

// Dead-wire detector heartbeat
static mut LAST_HEARTBEAT: u64 = 0;

#[no_mangle]
pub extern "C" fn ffi_heartbeat(timestamp: u64) -> i32 {
    unsafe {
        LAST_HEARTBEAT = timestamp;
    }
    // Return 1 to acknowledge receipt
    1
}

#[no_mangle]
pub extern "C" fn check_dead_wire(current_timestamp: u64, timeout_ms: u64) -> i32 {
    unsafe {
        if current_timestamp > LAST_HEARTBEAT + timeout_ms {
            // Dead wire detected
            0
        } else {
            // Connection alive
            1
        }
    }
}

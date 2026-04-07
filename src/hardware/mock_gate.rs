use sha2::{Sha256, Digest};

pub trait VirtualProcessorTrait {
    fn execute(&mut self, instruction: u32) -> u32;
    fn state_hash(&self) -> [u8; 32];
}

#[derive(Debug, Clone)]
pub struct MockGate {
    registers: [u32; 8],
    cycle_count: u64,
}

impl MockGate {
    pub fn new() -> Self {
        Self {
            registers: [0; 8],
            cycle_count: 0,
        }
    }
}

impl VirtualProcessorTrait for MockGate {
    fn execute(&mut self, instruction: u32) -> u32 {
        // Deterministic mock execution for 1024-D parity anchor
        self.cycle_count += 1;
        let reg_idx = (instruction & 0x7) as usize;
        self.registers[reg_idx] = self.registers[reg_idx].wrapping_add(instruction >> 3);
        self.registers[reg_idx]
    }

    fn state_hash(&self) -> [u8; 32] {
        let mut hasher = Sha256::new();
        for r in &self.registers {
            hasher.update(&r.to_le_bytes());
        }
        hasher.update(&self.cycle_count.to_le_bytes());
        let result = hasher.finalize();
        let mut hash = [0u8; 32];
        hash.copy_from_slice(&result);
        hash
    }
}

use std::hash::{Hash, Hasher};

/// A resolution scalar to convert continuous f32 positions to discrete integer ticks.
/// For example, 10000 ticks per unit to maintain high precision while allowing Eq/Hash.
pub const RESOLUTION_SCALAR: f32 = 10000.0;

#[derive(Debug, Clone, Copy)]
pub struct DiscretePosition {
    pub ticks: i32,
}

impl DiscretePosition {
    /// Maps a continuous f32 position to discrete integer ticks.
    pub fn from_f32(position: f32) -> Self {
        Self {
            ticks: (position * RESOLUTION_SCALAR).round() as i32,
        }
    }

    /// Converts the discrete ticks back to a continuous f32 position.
    pub fn to_f32(&self) -> f32 {
        self.ticks as f32 / RESOLUTION_SCALAR
    }
}

impl PartialEq for DiscretePosition {
    fn eq(&self, other: &Self) -> bool {
        self.ticks == other.ticks
    }
}

impl Eq for DiscretePosition {}

impl Hash for DiscretePosition {
    fn hash<H: Hasher>(&self, state: &mut H) {
        self.ticks.hash(state);
    }
}

/// A layout node that can be safely used in HashSets or HashMaps,
/// satisfying Rust's strict trait boundaries.
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub struct LayoutNode {
    pub id: u64,
    pub x: DiscretePosition,
    pub y: DiscretePosition,
}

impl LayoutNode {
    pub fn new(id: u64, x: f32, y: f32) -> Self {
        Self {
            id,
            x: DiscretePosition::from_f32(x),
            y: DiscretePosition::from_f32(y),
        }
    }
}

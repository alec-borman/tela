// Core timeline module using rational arithmetic to avoid floating-point drift

#[repr(C)]
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct RationalTime {
    pub numerator: i64,
    pub denominator: i64,
}

impl RationalTime {
    pub fn new(numerator: i64, denominator: i64) -> Self {
        assert!(denominator != 0, "Denominator cannot be zero");
        Self { numerator, denominator }
    }

    pub fn add(self, other: Self) -> Self {
        let num = self.numerator * other.denominator + other.numerator * self.denominator;
        let den = self.denominator * other.denominator;
        Self::new(num, den)
    }
}

use crate::timeline::RationalTime;
use std::sync::OnceLock;

const SINE_TABLE_SIZE: usize = 4096;
const SAMPLE_RATE: i64 = 44100;

static SINE_TABLE: OnceLock<[f32; SINE_TABLE_SIZE]> = OnceLock::new();

fn get_sine_table() -> &'static [f32; SINE_TABLE_SIZE] {
    SINE_TABLE.get_or_init(|| {
        let mut table = [0.0; SINE_TABLE_SIZE];
        for i in 0..SINE_TABLE_SIZE {
            table[i] = ((i as f64) * 2.0 * std::f64::consts::PI / (SINE_TABLE_SIZE as f64)).sin() as f32;
        }
        table
    })
}

#[no_mangle]
pub extern "C" fn generate_buffer(length: usize, freq: RationalTime) -> *mut f32 {
    let table = get_sine_table();
    let mut buffer = Vec::with_capacity(length);
    
    let mut phase_num: i64 = 0;
    let phase_den: i64 = freq.denominator * SAMPLE_RATE;
    let phase_inc_num: i64 = freq.numerator;
    
    for _ in 0..length {
        // Calculate index using integer math
        // We multiply phase_num by SINE_TABLE_SIZE before dividing by phase_den
        // to get the correct index in the 4096-entry table.
        let index = ((phase_num * (SINE_TABLE_SIZE as i64)) / phase_den) as usize;
        let index = index % SINE_TABLE_SIZE;
        
        buffer.push(table[index]);
        
        // Accumulate phase without floating point math
        phase_num += phase_inc_num;
        if phase_num >= phase_den {
            phase_num -= phase_den;
        }
    }
    
    let mut buffer = std::mem::ManuallyDrop::new(buffer);
    buffer.as_mut_ptr()
}

use crate::parser::ast::Domain;
use crate::compiler::manifest::{get_global_manifest, calculate_depth_decay};
use sha2::{Sha256, Digest};
use serde::Serialize;
use serde::ser::SerializeSeq;
use serde::de::{self, Visitor, SeqAccess};
use std::fmt;
use std::ffi::{CStr, CString};
use std::os::raw::c_char;

pub struct Vector1024(pub [f64; 1024]);

impl Serialize for Vector1024 {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        let mut seq = serializer.serialize_seq(Some(1024))?;
        for e in self.0.iter() {
            seq.serialize_element(e)?;
        }
        seq.end()
    }
}

impl<'de> serde::Deserialize<'de> for Vector1024 {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: serde::Deserializer<'de>,
    {
        struct VectorVisitor;

        impl<'de> Visitor<'de> for VectorVisitor {
            type Value = Vector1024;

            fn expecting(&self, formatter: &mut fmt::Formatter) -> fmt::Result {
                formatter.write_str("an array of 1024 floats")
            }

            fn visit_seq<A>(self, mut seq: A) -> Result<Vector1024, A::Error>
            where
                A: SeqAccess<'de>,
            {
                let mut arr = [0.0; 1024];
                for i in 0..1024 {
                    arr[i] = seq.next_element()?.ok_or_else(|| de::Error::invalid_length(i, &self))?;
                }
                Ok(Vector1024(arr))
            }
        }

        deserializer.deserialize_seq(VectorVisitor)
    }
}

#[derive(Serialize)]
pub struct EmbeddingResult {
    pub vector: Vector1024,
    pub fingerprint: String,
}

pub fn project_domain_to_vector(domain: &Domain) -> Vector1024 {
    let mut vector = [0.0; 1024];
    let manifest = get_global_manifest();
    
    // Feature projections (Depth 1)
    let feature_weight = calculate_depth_decay(1);
    
    for feature in &domain.features {
        let combined_weight = feature.weight * feature_weight;
        
        for (dim_name, &val) in &feature.dimension_contributions {
            if let Some(idx) = manifest.get_index(dim_name) {
                vector[idx] += val * combined_weight;
            } else {
                // Fallback deterministic hash for unregistered dimensions
                let dim_idx = dim_name.bytes().fold(0usize, |acc, b| acc.wrapping_add(b as usize)) % 1024;
                vector[dim_idx] += val * combined_weight;
            }
        }
    }
    
    Vector1024(vector)
}

#[no_mangle]
pub extern "C" fn project_ast_to_vector(json_ptr: *const c_char) -> *mut c_char {
    let c_str = unsafe {
        assert!(!json_ptr.is_null());
        CStr::from_ptr(json_ptr)
    };
    
    let json_str = c_str.to_str().unwrap_or("{}");
    
    let domain: Result<Domain, _> = serde_json::from_str(json_str);
    
    let result = match domain {
        Ok(dom) => {
            let vector = project_domain_to_vector(&dom);
            
            // Calculate SHA-256 fingerprint of the bit-identical JSON array
            let vector_json = serde_json::to_string(&vector).unwrap();
            let mut hasher = Sha256::new();
            hasher.update(vector_json.as_bytes());
            let result_hash = hasher.finalize();
            let fingerprint = format!("{:x}", result_hash);
            
            let res = EmbeddingResult {
                vector,
                fingerprint,
            };
            serde_json::to_string(&res).unwrap()
        },
        Err(e) => {
            format!("{{\"error\": \"{}\"}}", e)
        }
    };
    
    CString::new(result).unwrap().into_raw()
}

#[no_mangle]
pub extern "C" fn free_string(s: *mut c_char) {
    unsafe {
        if s.is_null() { return; }
        let _ = CString::from_raw(s);
    }
}

use serde::{Deserialize, Serialize};
use std::collections::BTreeMap; // BTreeMap for deterministic serialization order

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Domain {
    pub name: String,
    pub version: String,
    pub meta: MetaBlock,
    pub features: Vec<FeatureBlock>,
    pub deterministics: Vec<DeterministicBlock>,
    #[serde(default)]
    pub sustainability: Vec<SustainabilityBlock>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct SustainabilityBlock {
    pub domain_name: String,
    pub version: String,
    pub mission: String,
    pub sponsors: Vec<Sponsor>,
    pub roadmap: Vec<Milestone>,
    pub license: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Sponsor {
    pub name: String,
    #[serde(rename = "type")]
    pub sponsor_type: String, // grant, commercial_license, individual
    pub amount: Option<f64>,
    pub period: String, // YYYY-QQ
    pub status: String, // pending, active, expired
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Milestone {
    pub milestone: String,
    pub date: String, // YYYY-MM-DD
    pub funding_required: Option<f64>,
    pub revenue_target: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct MetaBlock {
    pub name: String,
    pub sprint_id: String,
    pub author: String,
    pub recipient: String,
    pub baseline_centroid: String,
    pub target_similarity: f64,
    pub dimensions: u32,
    #[serde(default)]
    pub note: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct FeatureBlock {
    pub name: String,
    pub weight: f64,
    pub target: String,
    pub description: String,
    pub requirements: Vec<String>,
    pub dimension_contributions: BTreeMap<String, f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct DeterministicBlock {
    pub name: String,
    pub input: Vec<String>,
    pub steps: Vec<Step>,
    pub threshold: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Step {
    pub assert: Option<String>,
    pub verify: Option<String>,
}

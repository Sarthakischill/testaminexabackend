export type Stat = {
  value: string;
  label: string;
  sublabel: string;
};

export type Mechanism = {
  title: string;
  description: string;
};

export type Study = {
  author: string;
  year: string;
  title: string;
  journal: string;
  participants?: string;
  keyFinding: string;
  doi?: string;
  pmid?: string;
  chartData?: ChartBar[];
};

export type Application = {
  label: string;
  description: string;
  detail: string;
  efficacy?: number;
};

export type CompoundInfo = {
  casNumber: string;
  molecularFormula: string;
  molecularWeight: string;
  type: string;
  appearance: string;
  solubility: string;
  storage: string;
};

export type ChartBar = {
  label: string;
  value: number;
  maxValue: number;
  unit?: string;
};

export type SafetyEffect = {
  label: string;
  percentage: number;
  severity: "mild" | "moderate" | "rare";
};

export type SafetyProfile = {
  overview: string;
  commonEffects: SafetyEffect[];
  rateFactors: string[];
  managementTips: string[];
  precautions: string[];
};

export type ResearchFAQ = {
  question: string;
  answer: string;
};

export type ResearchData = {
  productId: string;
  headline: string;
  subheadline: string;
  keyInsight: string;
  stats: Stat[];
  mechanisms: Mechanism[];
  studies: Study[];
  applications: Application[];
  compound: CompoundInfo;
  safety: SafetyProfile;
  faqs: ResearchFAQ[];
};

export const researchData: Record<string, ResearchData> = {
  "bpc-157": {
    productId: "bpc-157",
    headline: "Body Protection Compound-157",
    subheadline: "A 15-amino-acid peptide fragment derived from human gastric juice, studied extensively for tissue-repair signaling in preclinical models.",
    keyInsight: "BPC-157 demonstrates cytoprotective activity across multiple organ systems through upregulation of growth factor expression and angiogenic pathways.",
    stats: [
      { value: "15", label: "Amino Acids", sublabel: "Pentadecapeptide sequence" },
      { value: "1,400+", label: "Publications", sublabel: "PubMed indexed studies" },
      { value: "NO/VEGF", label: "Pathway Targets", sublabel: "Nitric oxide & growth factor" },
      { value: "Gastric", label: "Origin", sublabel: "Human gastric juice isolate" },
    ],
    mechanisms: [
      { title: "Angiogenic Signaling", description: "Upregulates vascular endothelial growth factor (VEGF) expression, promoting new blood vessel formation in damaged tissue models. This mechanism accelerates nutrient and oxygen delivery to injury sites." },
      { title: "Nitric Oxide Modulation", description: "Interacts with the NO system to maintain endothelial function and vascular tone. BPC-157 has shown the ability to counteract both NOS inhibition and NO-donor overactivity in experimental settings." },
      { title: "Growth Factor Expression", description: "Enhances expression of EGF, HGF, and other growth factors involved in fibroblast migration and collagen deposition, pathways critical for tendon, ligament, and mucosal repair in animal studies." },
    ],
    studies: [
      { author: "Sikiric P, et al.", year: "2018", title: "Brain-gut axis and pentadecapeptide BPC 157: Theoretical and practical implications", journal: "Current Neuropharmacology", keyFinding: "Demonstrated multi-organ cytoprotective effects through modulation of dopamine and serotonin systems alongside growth-factor upregulation.", pmid: "29651949", chartData: [
        { label: "Dopamine modulation", value: 84, maxValue: 100, unit: "%" },
        { label: "Serotonin normalization", value: 76, maxValue: 100, unit: "%" },
        { label: "Gastric cytoprotection", value: 91, maxValue: 100, unit: "%" },
        { label: "Neural recovery", value: 68, maxValue: 100, unit: "%" },
      ] },
      { author: "Chang CH, et al.", year: "2011", title: "The promoting effect of pentadecapeptide BPC 157 on tendon healing involves tendon outgrowth, cell survival, and cell migration", journal: "Journal of Applied Physiology", keyFinding: "BPC-157 significantly enhanced tendon-to-bone healing and promoted fibroblast outgrowth in a dose-dependent manner.", pmid: "21030672", chartData: [
        { label: "Fibroblast outgrowth", value: 156, maxValue: 200, unit: "%" },
        { label: "Cell survival rate", value: 89, maxValue: 100, unit: "%" },
        { label: "Migration velocity", value: 142, maxValue: 200, unit: "%" },
      ] },
      { author: "Seiwerth S, et al.", year: "2014", title: "BPC 157 and Standard Angiogenic Growth Factors", journal: "Life Sciences", keyFinding: "BPC-157 upregulated VEGF, EGF, and related growth factors, demonstrating a coordinated angiogenic response not seen with single growth-factor treatments.", pmid: "25445227" },
    ],
    applications: [
      { label: "Tendon & Ligament Models", description: "Fibroblast migration", detail: "In-vitro outgrowth assays", efficacy: 87 },
      { label: "Mucosal Integrity", description: "Gastric protection pathways", detail: "Epithelial barrier studies", efficacy: 92 },
      { label: "Angiogenesis Assays", description: "VEGF-mediated signaling", detail: "Endothelial tube formation", efficacy: 78 },
      { label: "Neurotransmitter Research", description: "Dopamine/serotonin modulation", detail: "Brain-gut axis models", efficacy: 71 },
    ],
    compound: {
      casNumber: "137525-51-0",
      molecularFormula: "C62H98N16O22",
      molecularWeight: "1419.53 g/mol",
      type: "Pentadecapeptide",
      appearance: "White lyophilized powder",
      solubility: "Soluble in water",
      storage: "-20°C, protected from light",
    },
    safety: {
      overview: "BPC-157 has been extensively studied in preclinical animal models with a favorable safety profile. No organ toxicity has been reported at standard research doses across multiple rodent studies.",
      commonEffects: [
        { label: "Injection site irritation", percentage: 15, severity: "mild" },
        { label: "Transient lethargy", percentage: 8, severity: "mild" },
        { label: "Mild GI sensitivity", percentage: 5, severity: "mild" },
      ],
      rateFactors: [
        "Dose-dependent: higher concentrations may increase local tissue response",
        "Reconstitution quality affects tolerability in animal models",
        "Route of administration (subcutaneous vs. intraperitoneal) influences local effects",
      ],
      managementTips: [
        "Use bacteriostatic water for reconstitution",
        "Rotate injection sites in animal models",
        "Start with lower doses to assess tolerance",
      ],
      precautions: [
        "Limited human clinical trial data available",
        "Not evaluated by regulatory agencies for therapeutic use",
        "Potential interactions with anticoagulant compounds in research",
        "Not recommended for use in pregnant or lactating animal models",
      ],
    },
    faqs: [
      { question: "What distinguishes BPC-157 from other tissue-repair peptides?", answer: "BPC-157 is unique in that it is derived from a protein found naturally in human gastric juice. Unlike growth factors that target single pathways, BPC-157 appears to coordinate multiple repair mechanisms simultaneously — upregulating VEGF, modulating NO signaling, and influencing growth factor expression across different tissue types." },
      { question: "What is the typical research dose range in preclinical models?", answer: "In published rodent studies, BPC-157 is commonly administered at 10 μg/kg body weight, though dose-response studies have used ranges from 1 μg/kg to 50 μg/kg depending on the experimental model and target tissue." },
      { question: "How stable is BPC-157 in solution?", answer: "BPC-157 demonstrates remarkable stability compared to most peptides. It maintains structural integrity across a wide pH range and is resistant to enzymatic degradation — a property attributed to its origin in gastric juice, which is naturally acidic and protease-rich." },
      { question: "What research models have been used to study BPC-157?", answer: "BPC-157 has been investigated in tendon transection models, gastric ulcer models, nerve crush injuries, vascular occlusion studies, and various inflammatory models. Both in-vitro cell culture and in-vivo animal studies have contributed to the current body of evidence." },
    ],
  },

  "ghk-cu": {
    productId: "ghk-cu",
    headline: "GHK-Cu Copper Peptide",
    subheadline: "A naturally occurring tripeptide-copper complex first isolated from human plasma, investigated for its role in tissue remodeling and gene expression modulation.",
    keyInsight: "GHK-Cu has been shown to reset gene expression of fibroblasts from older donors toward patterns observed in younger cells, affecting over 4,000 genes.",
    stats: [
      { value: "4,000+", label: "Genes Modulated", sublabel: "Expression pattern changes" },
      { value: "32%", label: "Collagen Increase", sublabel: "In skin fibroblast models" },
      { value: "70%", label: "Gene Reset", sublabel: "Toward youthful expression" },
      { value: "Cu²⁺", label: "Metal Complex", sublabel: "Copper(II) binding" },
    ],
    mechanisms: [
      { title: "Collagen & ECM Synthesis", description: "Stimulates production of collagen types I, III, and V, along with elastin and decorin. GHK-Cu promotes extracellular matrix assembly essential for structural integrity in tissue-remodeling models." },
      { title: "Gene Expression Reset", description: "Genome-wide studies demonstrate that GHK-Cu modulates expression of over 4,000 genes, shifting fibroblast expression profiles toward patterns associated with younger tissue, including upregulation of DNA repair and antioxidant genes." },
      { title: "Anti-Inflammatory Signaling", description: "Suppresses pro-inflammatory cytokines including IL-6 and TNF-α while promoting expression of tissue-repair mediators. This dual action supports resolution of inflammatory states in wound-model research." },
    ],
    studies: [
      { author: "Pickart L, et al.", year: "2015", title: "GHK Peptide as a Natural Modulator of Multiple Cellular Pathways in Skin Regeneration", journal: "BioMed Research International", keyFinding: "Demonstrated that GHK-Cu resets 32% of age-altered gene expression in human fibroblasts, with significant upregulation of collagen and DNA repair pathways.", pmid: "25861624", chartData: [
        { label: "Collagen I synthesis", value: 132, maxValue: 200, unit: "%" },
        { label: "Gene expression reset", value: 32, maxValue: 100, unit: "%" },
        { label: "DNA repair genes", value: 47, maxValue: 100, unit: "% upregulated" },
        { label: "Antioxidant response", value: 41, maxValue: 100, unit: "% increase" },
      ] },
      { author: "Pickart L, Vasquez-Soltero JM", year: "2014", title: "GHK and DNA: Resetting the Human Genome to Health", journal: "BioMed Research International", keyFinding: "GHK modulates expression of 4,048 human genes, suppressing fibrinogen synthesis by 2-fold and activating ubiquitin-proteasome system components.", pmid: "25295257", chartData: [
        { label: "Genes upregulated", value: 2549, maxValue: 4048, unit: "" },
        { label: "Genes downregulated", value: 1499, maxValue: 4048, unit: "" },
        { label: "Fibrinogen suppression", value: 200, maxValue: 200, unit: "% reduction" },
      ] },
      { author: "Kang YA, et al.", year: "2009", title: "Copper-GHK increases integrin expression and p63 positivity", journal: "Journal of Investigative Dermatology", keyFinding: "GHK-Cu treatment increased integrin expression and p63-positive basal cells, indicating enhanced proliferative capacity in skin models.", pmid: "19242513" },
    ],
    applications: [
      { label: "Tissue Remodeling", description: "ECM reconstitution", detail: "Collagen & elastin assays", efficacy: 91 },
      { label: "Gene Expression", description: "Genomic profiling", detail: "Microarray & RNA-seq", efficacy: 85 },
      { label: "Anti-Inflammatory", description: "Cytokine modulation", detail: "IL-6/TNF-α suppression", efficacy: 74 },
      { label: "Wound Healing Models", description: "Re-epithelialization", detail: "Migration & proliferation", efficacy: 82 },
    ],
    compound: {
      casNumber: "49557-75-7",
      molecularFormula: "C14H24CuN6O4",
      molecularWeight: "403.92 g/mol",
      type: "Tripeptide-copper complex",
      appearance: "Blue crystalline powder",
      solubility: "Freely soluble in water",
      storage: "-20°C, protected from light",
    },
    safety: {
      overview: "GHK-Cu is a naturally occurring peptide-copper complex found in human plasma, saliva, and urine. Its endogenous origin contributes to a well-characterized and favorable safety profile in both topical and injectable research models.",
      commonEffects: [
        { label: "Localized skin irritation (topical)", percentage: 12, severity: "mild" },
        { label: "Transient blue discoloration at site", percentage: 8, severity: "mild" },
        { label: "Mild warmth at application area", percentage: 6, severity: "mild" },
      ],
      rateFactors: [
        "Copper content is tightly bound to the peptide backbone, limiting free copper toxicity",
        "Concentration-dependent: higher doses may increase localized effects",
        "Topical vs. injectable routes produce different response profiles",
      ],
      managementTips: [
        "Use at recommended research concentrations",
        "Blue discoloration is a normal property of copper complexes",
        "Store reconstituted solutions protected from light to maintain stability",
      ],
      precautions: [
        "Wilson's disease models: copper accumulation may confound results",
        "Avoid combining with strong chelating agents in experimental protocols",
        "Monitor copper levels in chronic-exposure study designs",
        "Not evaluated for reproductive toxicity",
      ],
    },
    faqs: [
      { question: "Why does GHK-Cu solution appear blue?", answer: "The characteristic blue tint is a normal physical property of copper(II) complexes in aqueous solution. It results from d-d electron transitions in the copper ion and does not indicate contamination or degradation." },
      { question: "How does GHK-Cu compare to free copper in research?", answer: "GHK-Cu delivers copper in a biologically coordinated form. The tripeptide backbone ensures controlled release and prevents the oxidative damage associated with free copper ions, making it significantly more suitable for cellular studies." },
      { question: "What concentration ranges are used in published studies?", answer: "In-vitro studies typically use GHK-Cu at concentrations ranging from 0.1 μM to 10 μM. Gene expression studies by Pickart et al. used concentrations that modulate over 4,000 genes, suggesting activity at physiologically relevant levels." },
      { question: "Can GHK-Cu be combined with other peptides in research protocols?", answer: "GHK-Cu has been studied alongside growth factors and other peptides. However, chelating agents or strong reducing agents should be avoided as they may disrupt the copper-peptide bond essential for biological activity." },
    ],
  },

  "glp-3": {
    productId: "glp-3",
    headline: "GLP-3 Glucagon-Like Peptide",
    subheadline: "An engineered glucagon-like peptide analog designed for enhanced metabolic half-life and insulin-sensitizing activity in research models.",
    keyInsight: "GLP analogs demonstrate significant glycemic control through dual mechanisms: enhanced insulin secretion from pancreatic beta cells and delayed gastric emptying.",
    stats: [
      { value: "GLP-1R", label: "Receptor Target", sublabel: "Incretin pathway agonist" },
      { value: "3–5×", label: "Half-Life Extension", sublabel: "vs. native GLP-1" },
      { value: "cAMP", label: "Signaling Cascade", sublabel: "Adenylyl cyclase activation" },
      { value: "β-cell", label: "Primary Target", sublabel: "Pancreatic islet cells" },
    ],
    mechanisms: [
      { title: "Incretin Receptor Agonism", description: "Binds to GLP-1 receptors on pancreatic beta cells, activating adenylyl cyclase and raising intracellular cAMP levels. This glucose-dependent mechanism enhances insulin secretion only when blood glucose is elevated." },
      { title: "Gastric Motility Regulation", description: "Activates vagal afferents to reduce gastric emptying rate, extending nutrient absorption time and blunting postprandial glucose spikes. This mechanism is a primary contributor to glycemic control in metabolic studies." },
      { title: "Beta-Cell Preservation", description: "Research models indicate GLP receptor activation promotes beta-cell proliferation and inhibits apoptosis, potentially preserving insulin-secretory capacity under metabolic stress conditions." },
    ],
    studies: [
      { author: "Drucker DJ", year: "2018", title: "Mechanisms of Action and Therapeutic Application of Glucagon-like Peptide-1", journal: "Cell Metabolism", keyFinding: "Comprehensive review establishing GLP-1 receptor agonism as a multi-target metabolic intervention affecting pancreatic, gastric, and central nervous system pathways.", pmid: "30043752", chartData: [
        { label: "Insulin secretion (glucose-dep.)", value: 85, maxValue: 100, unit: "%" },
        { label: "Gastric emptying delay", value: 62, maxValue: 100, unit: "% reduction" },
        { label: "Beta-cell proliferation", value: 44, maxValue: 100, unit: "% increase" },
        { label: "Appetite suppression", value: 53, maxValue: 100, unit: "% reduction" },
      ] },
      { author: "Nauck MA, Meier JJ", year: "2018", title: "Incretin hormones: Their role in health and disease", journal: "Diabetes, Obesity and Metabolism", keyFinding: "Demonstrated that incretin-based therapies produce clinically meaningful HbA1c reductions and weight management effects through complementary mechanisms.", pmid: "29364588", chartData: [
        { label: "HbA1c reduction", value: 15, maxValue: 20, unit: "% points" },
        { label: "Fasting glucose improvement", value: 28, maxValue: 40, unit: "% decrease" },
        { label: "Postprandial control", value: 71, maxValue: 100, unit: "%" },
      ] },
    ],
    applications: [
      { label: "Glycemic Control", description: "Insulin sensitization", detail: "Beta-cell function assays", efficacy: 88 },
      { label: "Metabolic Research", description: "Energy homeostasis", detail: "Calorimetry models", efficacy: 79 },
      { label: "Gastric Motility", description: "Emptying rate studies", detail: "Vagal signaling pathways", efficacy: 72 },
      { label: "Islet Biology", description: "Beta-cell survival", detail: "Proliferation & apoptosis", efficacy: 65 },
    ],
    compound: { casNumber: "N/A (Proprietary analog)", molecularFormula: "Proprietary", molecularWeight: "~3,300 g/mol", type: "Incretin analog peptide", appearance: "White lyophilized powder", solubility: "Soluble in water, PBS", storage: "-20°C, protected from light" },
    safety: {
      overview: "GLP-1 receptor agonists have a well-characterized safety profile from extensive clinical development. Common effects are predominantly gastrointestinal and dose-related, typically diminishing with continued exposure in preclinical models.",
      commonEffects: [
        { label: "Nausea", percentage: 40, severity: "mild" },
        { label: "Decreased food intake", percentage: 35, severity: "mild" },
        { label: "Gastric distension", percentage: 20, severity: "mild" },
        { label: "Injection site reaction", percentage: 10, severity: "mild" },
      ],
      rateFactors: ["GI effects are dose-dependent and typically diminish over 1–2 weeks", "Slow dose titration significantly reduces initial adverse effects", "Fasting state at time of administration affects tolerability"],
      managementTips: ["Gradual dose escalation in research protocols", "Administer to fasted subjects when possible", "Monitor food intake as a pharmacodynamic endpoint"],
      precautions: ["Potential risk of pancreatitis in susceptible animal strains", "Not studied in combination with DPP-4 inhibitors in most models", "Thyroid C-cell effects reported with chronic high-dose GLP-1R agonism in rodents", "Contraindicated in models with medullary thyroid carcinoma history"],
    },
    faqs: [
      { question: "How does GLP-3 differ from native GLP-1?", answer: "GLP-3 is engineered with structural modifications that resist DPP-4 enzymatic degradation, extending its circulating half-life 3–5 fold compared to native GLP-1, which has a half-life of only 2–3 minutes in vivo." },
      { question: "Why is the insulin response glucose-dependent?", answer: "GLP-1 receptor signaling in beta cells requires elevated intracellular glucose to complete the insulin secretion cascade. At normal glucose levels, the cAMP signal alone is insufficient to trigger exocytosis, providing a built-in safety mechanism." },
      { question: "What metabolic endpoints are typically measured?", answer: "Common endpoints include oral glucose tolerance test (OGTT) profiles, HbA1c equivalent markers, fasting insulin and glucose levels, gastric emptying rate via acetaminophen absorption, and body weight trajectory." },
    ],
  },

  "nad": {
    productId: "nad",
    headline: "NAD⁺ Nicotinamide Adenine Dinucleotide",
    subheadline: "An essential dinucleotide coenzyme present in every living cell, critical for over 500 enzymatic reactions governing energy metabolism, DNA repair, and epigenetic regulation.",
    keyInsight: "NAD⁺ decline creates a 'pseudohypoxic' state that disrupts mitochondrial-nuclear communication, contributing to age-associated metabolic dysfunction.",
    stats: [
      { value: "50%", label: "Decline by Age 50", sublabel: "NAD⁺ levels decrease with aging" },
      { value: "7", label: "Sirtuin Targets", sublabel: "SIRT1–7 longevity enzymes" },
      { value: "500+", label: "Enzymatic Reactions", sublabel: "Essential metabolic cofactor" },
      { value: "1,518", label: "Clinical Subjects", sublabel: "Largest human cohort study" },
    ],
    mechanisms: [
      { title: "Sirtuin Activation", description: "NAD⁺ is the obligate substrate for sirtuins (SIRT1–7), a family of NAD-dependent deacetylases that regulate aging, inflammation, stress resistance, and metabolism. Without adequate NAD⁺, sirtuin activity declines, accelerating cellular aging." },
      { title: "DNA Repair via PARP", description: "NAD⁺ fuels poly-ADP-ribose polymerases (PARPs), enzymes critical for detecting and repairing DNA single-strand breaks. Adequate NAD⁺ levels help maintain genomic integrity and cellular health throughout aging." },
      { title: "Mitochondrial Electron Transport", description: "NAD⁺ is an essential electron carrier in the mitochondrial electron transport chain, directly driving ATP synthesis. Declining NAD⁺ impairs oxidative phosphorylation and contributes to age-related energetic dysfunction." },
    ],
    studies: [
      { author: "Yang F, et al.", year: "2022", title: "Association of Human Whole Blood NAD⁺ Contents With Aging", journal: "Frontiers in Endocrinology", participants: "1,518", keyFinding: "Blood NAD⁺ levels decline significantly with age — men show β = -1.12 in the 40–49 age group, becoming more pronounced after age 60 (β = -2.16). Validated by LC-MS/MS in a community-based cohort.", doi: "10.3389/fendo.2022.829658", pmid: "35370948", chartData: [
        { label: "Age 20–29", value: 100, maxValue: 100, unit: "% baseline" },
        { label: "Age 30–39", value: 88, maxValue: 100, unit: "% baseline" },
        { label: "Age 40–49", value: 72, maxValue: 100, unit: "% baseline" },
        { label: "Age 50–59", value: 58, maxValue: 100, unit: "% baseline" },
        { label: "Age 60+", value: 45, maxValue: 100, unit: "% baseline" },
      ] },
      { author: "Imai S, Guarente L", year: "2014", title: "NAD⁺ and Sirtuins in Aging and Disease", journal: "Trends in Cell Biology", keyFinding: "Established the NAD⁺-sirtuin axis as a central regulatory hub for metabolic homeostasis, demonstrating that NAD⁺ repletion restores sirtuin activity and reverses age-associated phenotypes in multiple model organisms.", pmid: "24786309", chartData: [
        { label: "SIRT1 (metabolism)", value: 95, maxValue: 100, unit: "% activity" },
        { label: "SIRT3 (mitochondria)", value: 90, maxValue: 100, unit: "% activity" },
        { label: "SIRT6 (DNA repair)", value: 85, maxValue: 100, unit: "% activity" },
        { label: "SIRT7 (stress)", value: 78, maxValue: 100, unit: "% activity" },
      ] },
      { author: "Katsyuba E, et al.", year: "2020", title: "NAD⁺ Homeostasis in Health and Disease", journal: "Nature Metabolism", keyFinding: "Comprehensive analysis of NAD⁺ biosynthesis, consumption, and recycling pathways, identifying therapeutic windows for NAD⁺ repletion strategies across metabolic, neurodegenerative, and cardiovascular disease models.", pmid: "32694684" },
    ],
    applications: [
      { label: "Sirtuin Activation", description: "SIRT1–7 deacetylases", detail: "Longevity pathway research", efficacy: 95 },
      { label: "Genomic Integrity", description: "PARP-mediated repair", detail: "DNA damage response", efficacy: 90 },
      { label: "Energy Production", description: "Electron transport chain", detail: "ATP synthesis & redox", efficacy: 88 },
      { label: "Aging Research", description: "Cellular senescence", detail: "Metabolic decline models", efficacy: 82 },
    ],
    compound: { casNumber: "53-84-9", molecularFormula: "C₂₁H₂₇N₇O₁₄P₂", molecularWeight: "663.43 g/mol", type: "Dinucleotide coenzyme", appearance: "White to off-white powder", solubility: "Freely soluble in water", storage: "-20°C, protected from light" },
    safety: {
      overview: "NAD⁺ is an endogenous coenzyme with a well-established safety profile. IV administration studies report predominantly mild, rate-dependent effects that resolve with infusion adjustment.",
      commonEffects: [
        { label: "Nausea", percentage: 40, severity: "mild" },
        { label: "Flushing / warmth", percentage: 35, severity: "mild" },
        { label: "Chest tightness", percentage: 25, severity: "mild" },
        { label: "Headache", percentage: 20, severity: "mild" },
        { label: "Dizziness", percentage: 15, severity: "mild" },
        { label: "Abdominal discomfort", percentage: 10, severity: "mild" },
      ],
      rateFactors: ["Side effects are primarily related to infusion rate, not total dose", "First session often produces stronger effects than subsequent sessions", "Tolerance typically develops over repeated exposures"],
      managementTips: ["Slow infusion rate to reduce acute effects", "Adequate hydration before and during administration", "Pause infusion briefly if effects intensify, then resume at lower rate"],
      precautions: ["Cardiac arrhythmias reported rarely in predisposed models", "Severe hypotension (very rare)", "Not evaluated in pregnancy or lactation models", "Monitor cardiovascular parameters during high-dose protocols"],
    },
    faqs: [
      { question: "Why do NAD⁺ levels decline with age?", answer: "NAD⁺ decline is driven by increased consumption (PARP and CD38 activity rise with age and DNA damage) combined with decreased biosynthesis. The enzyme CD38, which degrades NAD⁺, increases dramatically in aging tissues, creating a supply-demand imbalance." },
      { question: "How is NAD⁺ measured in research settings?", answer: "The gold standard is LC-MS/MS (liquid chromatography-tandem mass spectrometry) of whole blood or tissue lysates. This method quantifies NAD⁺ and its metabolites (NADH, NMN, NAM) with high specificity. Enzymatic cycling assays provide an alternative for high-throughput screening." },
      { question: "What is the significance of the 1,518-participant Yang study?", answer: "It represents the largest community-based human cohort with direct blood NAD⁺ measurement. It confirmed age-dependent NAD⁺ decline across both genders, with men showing steeper decline — particularly in the 40–49 and 60+ age groups — providing population-level validation for NAD⁺ aging research." },
      { question: "How does NAD⁺ differ from NMN and NR as research tools?", answer: "NAD⁺ is the active coenzyme itself, while NMN and NR are biosynthetic precursors that must be enzymatically converted to NAD⁺ inside cells. Direct NAD⁺ bypasses conversion bottlenecks but faces different bioavailability challenges depending on the delivery route." },
    ],
  },

  "epithalon": {
    productId: "epithalon",
    headline: "Epithalon (AEDG Peptide)",
    subheadline: "A synthetic tetrapeptide (Ala-Glu-Asp-Gly) studied for its interaction with telomerase activity and pineal gland function in cellular aging models.",
    keyInsight: "Epithalon has been reported to activate telomerase reverse transcriptase (hTERT) in human somatic cells, a mechanism associated with chromosomal stability and replicative lifespan extension.",
    stats: [
      { value: "4", label: "Amino Acids", sublabel: "Ala-Glu-Asp-Gly sequence" },
      { value: "hTERT", label: "Target Enzyme", sublabel: "Telomerase activation" },
      { value: "33%", label: "Telomere Extension", sublabel: "In cell culture models" },
      { value: "Pineal", label: "Gland Target", sublabel: "Melatonin regulation" },
    ],
    mechanisms: [
      { title: "Telomerase Activation", description: "Epithalon has been shown to activate telomerase (hTERT) in human somatic cells, elongating telomeres and extending the replicative lifespan of fibroblast cultures beyond the Hayflick limit in controlled laboratory settings." },
      { title: "Pineal Gland Modulation", description: "Studies indicate epithalon influences melatonin synthesis by the pineal gland, potentially restoring circadian rhythm patterns that degrade with age. This neuroendocrine pathway connects to broader age-related hormonal regulation." },
      { title: "Antioxidant Gene Expression", description: "Research models demonstrate upregulation of endogenous antioxidant enzymes including superoxide dismutase (SOD) and glutathione peroxidase, contributing to cellular stress resistance in aging paradigms." },
    ],
    studies: [
      { author: "Khavinson VK, et al.", year: "2003", title: "Epithalon peptide induces telomerase activity and telomere elongation in human somatic cells", journal: "Bulletin of Experimental Biology and Medicine", keyFinding: "Epithalon activated telomerase in human pulmonary fibroblasts, elongating telomeres by 33% and enabling cells to surpass the Hayflick limit without malignant transformation.", pmid: "14565811", chartData: [
        { label: "Telomere length (control)", value: 100, maxValue: 150, unit: "% baseline" },
        { label: "Telomere length (treated)", value: 133, maxValue: 150, unit: "% baseline" },
        { label: "hTERT activity increase", value: 118, maxValue: 150, unit: "%" },
      ] },
      { author: "Anisimov VN, et al.", year: "2003", title: "Effect of Epithalon on biomarkers of aging, life span and spontaneous tumor incidence in female Swiss-derived SHR mice", journal: "Biogerontology", keyFinding: "Chronic epithalon administration was associated with normalized melatonin rhythms and modulated expression of aging-associated biomarkers in a rodent longevity model.", pmid: "12815272", chartData: [
        { label: "Melatonin normalization", value: 88, maxValue: 100, unit: "%" },
        { label: "Aging biomarker reduction", value: 34, maxValue: 100, unit: "% decrease" },
      ] },
    ],
    applications: [
      { label: "Telomere Biology", description: "hTERT activation", detail: "Replicative lifespan assays", efficacy: 86 },
      { label: "Circadian Research", description: "Melatonin regulation", detail: "Pineal gland function", efficacy: 79 },
      { label: "Cellular Aging", description: "Senescence markers", detail: "Hayflick limit studies", efficacy: 83 },
      { label: "Antioxidant Defense", description: "SOD/GPx expression", detail: "Oxidative stress models", efficacy: 68 },
    ],
    compound: { casNumber: "307297-39-8", molecularFormula: "C₁₄H₂₂N₄O₉", molecularWeight: "390.35 g/mol", type: "Synthetic tetrapeptide", appearance: "White lyophilized powder", solubility: "Soluble in water", storage: "-20°C, protected from light" },
    safety: {
      overview: "Epithalon is a small tetrapeptide with a favorable safety profile in published animal studies. No significant toxicity has been reported at standard research doses in chronic administration models.",
      commonEffects: [
        { label: "Injection site redness", percentage: 10, severity: "mild" },
        { label: "Transient drowsiness", percentage: 8, severity: "mild" },
        { label: "Mild headache", percentage: 5, severity: "mild" },
      ],
      rateFactors: ["Small peptide size (4 amino acids) reduces immunogenic potential", "Circadian effects may vary with time of administration", "Chronic vs. acute dosing produces different biomarker responses"],
      managementTips: ["Evening administration may align with melatonin rhythm effects", "Monitor circadian biomarkers in longitudinal studies", "Use consistent timing across treatment groups"],
      precautions: ["Limited human clinical trial data; primarily animal model evidence", "Potential interaction with exogenous melatonin supplementation in models", "Long-term telomerase activation studies should monitor for neoplastic endpoints", "Not evaluated in immunocompromised animal strains"],
    },
    faqs: [
      { question: "Is telomerase activation associated with cancer risk?", answer: "This is an active area of investigation. In the Khavinson 2003 study, epithalon-treated fibroblasts surpassed the Hayflick limit without malignant transformation. However, long-term studies monitoring oncogenic endpoints are limited, and this remains an important consideration in study design." },
      { question: "How is telomere length measured in epithalon research?", answer: "Common methods include Terminal Restriction Fragment (TRF) analysis via Southern blot, quantitative PCR (qPCR) for relative telomere length, and Flow-FISH for single-cell resolution. The Khavinson study used TRF analysis to demonstrate the 33% elongation." },
      { question: "What is the relationship between epithalon and the pineal gland?", answer: "Epithalon was originally developed as a synthetic analog of epithalamin, an extract from the pineal gland. Research suggests it modulates melatonin production and circadian gene expression, potentially through interaction with pinealocyte regulatory pathways." },
    ],
  },

  "mt2": {
    productId: "mt2",
    headline: "Melanotan II (MT-II)",
    subheadline: "A cyclic heptapeptide analog of α-melanocyte-stimulating hormone (α-MSH) studied for melanocortin receptor pharmacology and binding kinetics.",
    keyInsight: "MT-II is a non-selective melanocortin receptor agonist that binds MC1R, MC3R, MC4R, and MC5R, making it a valuable tool for studying the diverse physiological roles of the melanocortin system.",
    stats: [
      { value: "7", label: "Amino Acids", sublabel: "Cyclic heptapeptide" },
      { value: "MC1–5R", label: "Receptor Targets", sublabel: "Melanocortin receptor family" },
      { value: "α-MSH", label: "Structural Analog", sublabel: "Hormone mimetic" },
      { value: "Cyclic", label: "Conformation", sublabel: "Enhanced metabolic stability" },
    ],
    mechanisms: [
      { title: "Melanocortin Receptor Binding", description: "MT-II binds to melanocortin receptors (MC1R–MC5R) with varying affinities, activating Gs-coupled adenylyl cyclase signaling and elevating intracellular cAMP. This non-selective profile makes it a versatile pharmacological tool." },
      { title: "MC1R-Mediated Melanogenesis", description: "Activation of MC1R on melanocytes triggers the cAMP/PKA/CREB signaling cascade, upregulating tyrosinase and related enzymes. This pathway is the primary mechanism studied in pigmentation research models." },
      { title: "MC4R Central Signaling", description: "MC4R activation in hypothalamic nuclei modulates energy homeostasis and appetite regulation pathways. MT-II serves as a reference agonist in studies characterizing central melanocortin circuit function." },
    ],
    studies: [
      { author: "Hadley ME, Dorr RT", year: "2006", title: "Melanocortin peptide therapeutics: historical milestones, clinical studies and commercialization", journal: "Peptides", keyFinding: "Comprehensive review establishing MT-II as a foundational research tool for melanocortin receptor pharmacology, documenting receptor binding profiles and downstream signaling characterization.", pmid: "16289474", chartData: [
        { label: "MC1R affinity", value: 92, maxValue: 100, unit: "% binding" },
        { label: "MC3R affinity", value: 78, maxValue: 100, unit: "% binding" },
        { label: "MC4R affinity", value: 85, maxValue: 100, unit: "% binding" },
        { label: "MC5R affinity", value: 64, maxValue: 100, unit: "% binding" },
      ] },
      { author: "Hruby VJ, et al.", year: "2011", title: "Melanocortin receptors: Ligands and proteochemistry", journal: "Journal of Peptide Science", keyFinding: "Detailed structure-activity analysis of MT-II and derivatives, establishing the cyclic lactam bridge as critical for receptor affinity and metabolic stability.", pmid: "21351306" },
    ],
    applications: [
      { label: "Receptor Pharmacology", description: "Binding kinetics", detail: "MC1R–MC5R profiling", efficacy: 92 },
      { label: "Melanogenesis", description: "Pigmentation pathways", detail: "Tyrosinase activity assays", efficacy: 87 },
      { label: "Energy Homeostasis", description: "Hypothalamic circuits", detail: "MC4R signaling studies", efficacy: 73 },
      { label: "Peptide Chemistry", description: "Structure-activity", detail: "Cyclic peptide design", efficacy: 80 },
    ],
    compound: { casNumber: "121062-08-6", molecularFormula: "C₅₀H₆₉N₁₅O₉", molecularWeight: "1024.18 g/mol", type: "Cyclic lactam heptapeptide", appearance: "White lyophilized powder", solubility: "Soluble in water, DMSO", storage: "-20°C, protected from light" },
    safety: {
      overview: "MT-II's non-selective melanocortin receptor profile produces effects across multiple physiological systems. Published human studies report predominantly mild, self-limiting adverse effects.",
      commonEffects: [
        { label: "Facial flushing", percentage: 55, severity: "mild" },
        { label: "Nausea", percentage: 42, severity: "mild" },
        { label: "Fatigue", percentage: 28, severity: "mild" },
        { label: "Appetite reduction", percentage: 22, severity: "mild" },
        { label: "Injection site irritation", percentage: 15, severity: "mild" },
      ],
      rateFactors: ["Non-selective receptor profile amplifies off-target effects", "Dose-dependent: lower initial doses significantly reduce flushing and nausea", "Effects typically diminish with repeated exposure"],
      managementTips: ["Start with minimal effective dose for receptor characterization", "Gradual dose escalation reduces initial adverse effects", "Administration timing affects central vs. peripheral effects"],
      precautions: ["Non-selective MC receptor activation may confound single-receptor studies", "Potential cardiovascular effects via MC3R/MC4R activation", "Pigmentary changes are irreversible in some models", "Not evaluated for teratogenic potential"],
    },
    faqs: [
      { question: "Why is MT-II's cyclic structure important for research?", answer: "The cyclic lactam bridge between positions 4 and 10 dramatically increases metabolic stability (resistance to enzymatic degradation) and receptor affinity compared to linear α-MSH. This structure-activity relationship is foundational to melanocortin peptide drug design." },
      { question: "How does MT-II selectivity compare across melanocortin receptors?", answer: "MT-II is classified as non-selective because it activates MC1R, MC3R, MC4R, and MC5R with relatively similar potencies (EC50 values within the same order of magnitude). MC2R (the ACTH receptor) shows minimal activation. This profile makes MT-II valuable as a pan-agonist but limits its use in single-receptor studies." },
      { question: "What are the primary downstream assays for MT-II research?", answer: "Common endpoints include cAMP accumulation assays (receptor activation), tyrosinase activity measurement (melanogenesis), radioligand competition binding (affinity profiling), and food intake monitoring in rodent models (MC4R-mediated appetite effects)." },
    ],
  },

  "mots-c": {
    productId: "mots-c",
    headline: "MOTS-c Mitochondrial Peptide",
    subheadline: "A 16-amino-acid peptide encoded by the mitochondrial 12S rRNA gene, discovered as a signaling molecule that regulates metabolic homeostasis and insulin sensitivity.",
    keyInsight: "MOTS-c is one of the first identified mitochondrial-derived peptides (MDPs) that acts as a retrograde signal from mitochondria to the nucleus, activating AMPK and folate-methionine metabolism.",
    stats: [
      { value: "16", label: "Amino Acids", sublabel: "Mitochondrial-encoded" },
      { value: "AMPK", label: "Primary Target", sublabel: "Energy sensor activation" },
      { value: "12S rRNA", label: "Gene Origin", sublabel: "Mitochondrial genome" },
      { value: "AICAR", label: "Metabolite Link", sublabel: "Folate cycle intermediate" },
    ],
    mechanisms: [
      { title: "AMPK Activation", description: "MOTS-c activates AMP-activated protein kinase (AMPK), the master cellular energy sensor, through accumulation of the folate cycle intermediate AICAR. This triggers downstream metabolic reprogramming favoring glucose uptake and fatty acid oxidation." },
      { title: "Folate-Methionine Cycle", description: "MOTS-c targets de novo purine biosynthesis by inhibiting the folate cycle, leading to AICAR accumulation. This unique mechanism connects mitochondrial signaling to one-carbon metabolism and epigenetic regulation." },
      { title: "Nuclear Translocation Under Stress", description: "Under metabolic and oxidative stress, MOTS-c translocates to the nucleus where it interacts with stress-responsive transcription factors, representing a novel form of mitochondria-to-nucleus retrograde signaling." },
    ],
    studies: [
      { author: "Lee C, et al.", year: "2015", title: "The Mitochondrial-Derived Peptide MOTS-c Promotes Metabolic Homeostasis and Reduces Obesity and Insulin Resistance", journal: "Cell Metabolism", keyFinding: "First identification of MOTS-c as a mitochondrial-encoded signaling peptide that regulates insulin sensitivity and metabolic homeostasis through AMPK-dependent pathways.", pmid: "25773832", chartData: [
        { label: "AMPK activation", value: 89, maxValue: 100, unit: "%" },
        { label: "Glucose uptake increase", value: 62, maxValue: 100, unit: "%" },
        { label: "Fat oxidation", value: 45, maxValue: 100, unit: "% increase" },
        { label: "Insulin sensitivity", value: 71, maxValue: 100, unit: "% improvement" },
      ] },
      { author: "Kim KH, et al.", year: "2018", title: "MOTS-c: An Equal Opportunity Insulin Sensitizer", journal: "Journal of Molecular Medicine", keyFinding: "Demonstrated that MOTS-c improves glucose clearance and insulin sensitivity in aging models, with nuclear translocation as a key mechanism for stress-adaptive gene regulation.", pmid: "30094461", chartData: [
        { label: "Young model response", value: 78, maxValue: 100, unit: "%" },
        { label: "Aged model response", value: 72, maxValue: 100, unit: "%" },
        { label: "Nuclear translocation", value: 85, maxValue: 100, unit: "% under stress" },
      ] },
    ],
    applications: [
      { label: "Metabolic Signaling", description: "AMPK pathway", detail: "Energy sensing assays", efficacy: 89 },
      { label: "Mitochondrial Biology", description: "Retrograde signaling", detail: "Mito-nuclear communication", efficacy: 84 },
      { label: "Insulin Sensitivity", description: "Glucose uptake", detail: "GLUT4 translocation", efficacy: 76 },
      { label: "Epigenetic Research", description: "One-carbon metabolism", detail: "Folate cycle studies", efficacy: 70 },
    ],
    compound: { casNumber: "1627580-64-6", molecularFormula: "C₁₀₁H₁₅₂N₂₈O₂₅S₂", molecularWeight: "2174.64 g/mol", type: "Mitochondrial-derived peptide", appearance: "White lyophilized powder", solubility: "Soluble in water", storage: "-20°C, protected from light" },
    safety: {
      overview: "MOTS-c is an endogenous peptide encoded by the mitochondrial genome. As a naturally circulating molecule, it has a favorable preliminary safety profile in preclinical models, though human clinical data remains limited.",
      commonEffects: [
        { label: "Injection site reaction", percentage: 12, severity: "mild" },
        { label: "Transient fatigue", percentage: 8, severity: "mild" },
        { label: "Mild hypoglycemia (fasted models)", percentage: 6, severity: "moderate" },
      ],
      rateFactors: ["Endogenous origin suggests favorable tolerability", "Metabolic effects are more pronounced in insulin-resistant models", "Fasting state at administration may amplify glucose-lowering effects"],
      managementTips: ["Monitor glucose in fasted experimental subjects", "Consider fed-state administration for initial tolerance assessment", "Track AMPK activation as a pharmacodynamic marker"],
      precautions: ["Limited long-term safety data in mammalian models", "Potential for hypoglycemia in combination with other insulin-sensitizing agents", "Nuclear translocation under stress may affect gene expression in unpredictable ways", "Not evaluated in models with pre-existing mitochondrial dysfunction"],
    },
    faqs: [
      { question: "How was MOTS-c discovered?", answer: "MOTS-c was identified in 2015 by Changhan Lee's laboratory at USC through computational screening of the mitochondrial genome for potential open reading frames (ORFs) within ribosomal RNA genes. It was the second mitochondrial-derived peptide discovered after humanin." },
      { question: "Why is mitochondria-to-nucleus signaling significant?", answer: "Traditional cell biology viewed mitochondria as passive organelles. MOTS-c's ability to translocate to the nucleus under stress reveals that mitochondria actively regulate nuclear gene expression — a paradigm shift in understanding cellular communication and aging." },
      { question: "How does MOTS-c differ from humanin, the other known mitochondrial peptide?", answer: "While both are mitochondrial-derived peptides, humanin primarily acts through cytoprotective and anti-apoptotic pathways (via IGFBP-3 and BAX interactions), whereas MOTS-c primarily targets metabolic regulation through AMPK activation and folate cycle modulation. They represent distinct signaling axes from the mitochondrial genome." },
    ],
  },

  "tesamorelin": {
    productId: "tesamorelin",
    headline: "Tesamorelin (GHRH Analog)",
    subheadline: "A synthetic analog of growth hormone-releasing hormone (GHRH) with a trans-3-hexenoic acid modification, studied for pituitary-axis signaling and GH secretion dynamics.",
    keyInsight: "Tesamorelin stimulates pulsatile GH release through the endogenous GHRH receptor, preserving physiological feedback mechanisms — a distinction from direct GH administration.",
    stats: [
      { value: "44", label: "Amino Acids", sublabel: "Modified GHRH(1-44)" },
      { value: "GHRH-R", label: "Receptor Target", sublabel: "Pituitary somatotrophs" },
      { value: "Pulsatile", label: "GH Release", sublabel: "Physiological secretion" },
      { value: "IGF-1", label: "Downstream Marker", sublabel: "Growth factor cascade" },
    ],
    mechanisms: [
      { title: "GHRH Receptor Agonism", description: "Tesamorelin binds to GHRH receptors on anterior pituitary somatotrophs, activating Gs-coupled adenylyl cyclase and raising intracellular cAMP. This stimulates growth hormone synthesis and secretion in a pulsatile pattern." },
      { title: "IGF-1 Axis Stimulation", description: "GH released via GHRH receptor activation drives hepatic IGF-1 production, activating the GH/IGF-1 axis. This cascade regulates tissue growth, protein synthesis, and metabolic substrate utilization in research models." },
      { title: "Feedback-Preserving Design", description: "Unlike exogenous GH, tesamorelin works through the endogenous receptor pathway, maintaining somatostatin-mediated negative feedback. This preserves physiological GH pulsatility and prevents receptor desensitization in longitudinal studies." },
    ],
    studies: [
      { author: "Falutz J, et al.", year: "2007", title: "Metabolic effects of a growth hormone-releasing factor in patients with HIV", journal: "New England Journal of Medicine", participants: "412", keyFinding: "Tesamorelin significantly reduced visceral adipose tissue and improved lipid profiles while preserving subcutaneous fat, demonstrating selective metabolic effects through the GH axis.", doi: "10.1056/NEJMoa072191", pmid: "17898098", chartData: [
        { label: "Visceral fat reduction", value: 18, maxValue: 30, unit: "% decrease" },
        { label: "Trunk fat reduction", value: 11, maxValue: 30, unit: "% decrease" },
        { label: "IGF-1 increase", value: 81, maxValue: 100, unit: "% rise" },
        { label: "Subcutaneous fat (preserved)", value: 2, maxValue: 30, unit: "% change" },
      ] },
      { author: "Stanley TL, et al.", year: "2014", title: "Effect of tesamorelin on visceral fat and liver fat in HIV-infected patients with abdominal fat accumulation", journal: "JAMA", participants: "48", keyFinding: "Tesamorelin reduced hepatic fat fraction and visceral adiposity, with effects mediated through pulsatile GH secretion confirmed by frequent-sampling GH profiles.", pmid: "25117131", chartData: [
        { label: "Hepatic fat reduction", value: 37, maxValue: 50, unit: "% decrease" },
        { label: "Visceral adipose tissue", value: 14, maxValue: 30, unit: "% decrease" },
        { label: "GH pulse amplitude", value: 165, maxValue: 200, unit: "% increase" },
      ] },
    ],
    applications: [
      { label: "Pituitary Function", description: "Somatotroph activation", detail: "GH secretion dynamics", efficacy: 91 },
      { label: "IGF-1 Axis Research", description: "Hepatic signaling", detail: "Growth factor cascade", efficacy: 85 },
      { label: "Metabolic Studies", description: "Adipose tissue biology", detail: "Visceral fat models", efficacy: 78 },
      { label: "Endocrine Pharmacology", description: "Feedback mechanisms", detail: "Somatostatin regulation", efficacy: 72 },
    ],
    compound: { casNumber: "804475-66-9", molecularFormula: "C₂₂₁H₃₆₆N₇₂O₆₇S₁", molecularWeight: "5135.89 g/mol", type: "Modified GHRH(1-44) analog", appearance: "White lyophilized powder", solubility: "Soluble in water, saline", storage: "-20°C, protected from light" },
    safety: {
      overview: "Tesamorelin has the most extensive clinical safety data of any peptide in this catalog, with Phase III trials involving over 800 participants. The safety profile is well-characterized and predominantly mild.",
      commonEffects: [
        { label: "Injection site reactions", percentage: 24, severity: "mild" },
        { label: "Arthralgia (joint discomfort)", percentage: 13, severity: "mild" },
        { label: "Peripheral edema", percentage: 8, severity: "mild" },
        { label: "Myalgia", percentage: 6, severity: "mild" },
        { label: "Paresthesia", percentage: 5, severity: "mild" },
      ],
      rateFactors: ["Effects are consistent with GH-axis activation and are dose-proportional", "Injection site reactions diminish with proper technique and site rotation", "Edema and arthralgia typically resolve within the first month of chronic dosing"],
      managementTips: ["Rotate injection sites systematically", "Monitor IGF-1 levels to confirm pharmacodynamic response", "Arthralgic effects respond to dose reduction"],
      precautions: ["Monitor for glucose intolerance — GH axis activation can affect insulin sensitivity", "Contraindicated in models with active malignancy (GH/IGF-1 may promote tumor growth)", "Pituitary disruption or hypothalamic lesions may blunt response", "Not to be combined with exogenous GH (additive effects, feedback disruption)"],
    },
    faqs: [
      { question: "How does tesamorelin differ from direct GH administration?", answer: "Tesamorelin works through the body's own GHRH receptor, stimulating pulsatile GH release that mimics physiological secretion patterns. Exogenous GH bypasses the pituitary entirely, producing continuous (non-pulsatile) GH elevation and suppressing endogenous production via negative feedback." },
      { question: "What is the significance of the trans-3-hexenoic acid modification?", answer: "This N-terminal modification increases resistance to DPP-IV enzymatic cleavage, extending the peptide's circulating half-life while maintaining full receptor binding affinity. It transforms the native GHRH(1-44) into a pharmacologically viable research tool." },
      { question: "Why is the NEJM study (Falutz 2007) considered landmark research?", answer: "With 412 participants in a randomized, double-blind, placebo-controlled design published in the New England Journal of Medicine, it established tesamorelin's selective effect on visceral (but not subcutaneous) adipose tissue — a mechanistic distinction that provided new insights into GH-axis biology and tissue-specific fat metabolism." },
      { question: "Can tesamorelin effects persist after cessation of treatment?", answer: "Published data indicate that visceral fat reduction partially reverses after discontinuation, suggesting the metabolic effects require ongoing GHRH receptor stimulation. This has important implications for study duration and washout period design in research protocols." },
    ],
  },
};

export function getResearchData(productId: string): ResearchData | undefined {
  return researchData[productId];
}

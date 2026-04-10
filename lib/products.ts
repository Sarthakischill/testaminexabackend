export type Product = {
  id: string;
  name: string;
  fullName: string;
  price: number;
  displayPrice: string;
  purity: string;
  volume: string;
  hex: string;
  image: string;
  scaleClass: string;
  description: string;
  benefits: string[];
  faqs: { question: string; answer: string }[];
  colorFrom: string;
  colorTo: string;
  accentGlow: string;
  weight: number; // weight in ounces for shipping calculation
  category: "vial" | "pen";
  brand?: string;
  comingSoon?: boolean;
  inventoryQuantity?: number;
  inventoryStatus?: "ready" | "not_ready";
  soldOut?: boolean;
};

export const products: Product[] = [
  {
    id: "bpc-157",
    name: "BPC-157",
    fullName: "Body Protection Compound",
    price: 85,
    displayPrice: "$85.00",
    purity: "99.4%",
    volume: "10mg",
    colorFrom: "from-green-600/40",
    colorTo: "to-green-900/20",
    accentGlow: "rgba(34, 197, 94, 0.5)",
    hex: "#22c55e",
    image: "https://imagedelivery.net/uVeQjPq2FGwRQ4qZs2ijJg/Product_Mockups/tilted/bpc-15-tilted.png/public",
    scaleClass: "scale-[1.25]",
    description: "Multi-system biological healing peptide. Demonstrated in rigorous in-vitro models to dramatically accelerate angiogenic pathways and tendon regeneration.",
    benefits: ["Angiogenesis Promotion", "Gut Lining Restoration", "Systemic Healing"],
    weight: 4,
    category: "vial",
    faqs: [
      { question: "What is BPC-157?", answer: "Body Protection Compound-157 is a pentadecapeptide consisting of 15 amino acids, originally discovered in human gastric juice." },
      { question: "What are the primary research applications?", answer: "It is heavily researched for its potential to accelerate the healing of tendons, ligaments, muscles, and the nervous system, as well as protecting gastric mucosa." },
      { question: "Is BPC-157 stable at room temperature?", answer: "While more stable than many peptides, it is still recommended to store lyophilized BPC-157 in a freezer and refrigerate after reconstitution to maintain absolute structural integrity." }
    ]
  },
  {
    id: "ghk-cu",
    name: "GHK-Cu",
    fullName: "Copper Peptide",
    price: 110,
    displayPrice: "$110.00",
    purity: "99.2%",
    volume: "50mg",
    colorFrom: "from-emerald-700/40",
    colorTo: "to-emerald-950/20",
    accentGlow: "rgba(5, 150, 105, 0.5)",
    hex: "#059669",
    image: "https://imagedelivery.net/uVeQjPq2FGwRQ4qZs2ijJg/Product_Mockups/tilted/ghk-cu-tilted.png/public",
    scaleClass: "scale-100",
    description: "Naturally occurring copper complex. Proven to upregulate collagen production, modify tissue remodeling pathways, and trigger robust localized cellular repair.",
    benefits: ["Collagen Synthesis", "Tissue Remodeling", "Anti-Inflammatory"],
    weight: 4,
    category: "vial",
    faqs: [
      { question: "What is GHK-Cu and where does it come from?", answer: "GHK-Cu is a naturally occurring tripeptide (glycyl-L-histidyl-L-lysine) that binds with copper. It was first discovered in human plasma and is released from tissues during injury as part of the body's natural healing response." },
      { question: "What does the research show about GHK-Cu's effectiveness?", answer: "Clinical in-vitro studies demonstrate GHK-Cu's ability to upregulate collagen and elastin production, promote blood vessel growth, and modulate the expression of numerous genes related to tissue repair and remodeling." },
      { question: "How is GHK-Cu typically prepared for research?", answer: "GHK-Cu is typically reconstituted with bacteriostatic water. Due to its copper binding, the resulting solution often exhibits a distinct blue tint, which is a normal characteristic of the compound." }
    ]
  },
  {
    id: "glp-3",
    name: "GLP-3",
    fullName: "Glucagon-Like Peptide",
    price: 145,
    displayPrice: "$145.00",
    purity: "99.8%",
    volume: "10mg",
    colorFrom: "from-blue-600/40",
    colorTo: "to-blue-900/20",
    accentGlow: "rgba(37, 99, 235, 0.5)",
    hex: "#2563eb",
    image: "https://imagedelivery.net/uVeQjPq2FGwRQ4qZs2ijJg/Product_Mockups/tilted/glp-3-tilted.png/public",
    scaleClass: "scale-[1.10]",
    description: "Next-generation metabolic modulator. Engineered for enhanced half-life and aggressive insulin-sensitizing properties with significantly delayed gastric emptying.",
    benefits: ["Insulin Sensitization", "Gastric Regulation", "Metabolic Homeostasis"],
    weight: 4,
    category: "vial",
    faqs: [
      { question: "What distinguishes GLP-3 in metabolic research?", answer: "GLP-3 represents a next-generation approach to glucagon-like peptides, engineered for an extended half-life and more aggressive insulin-sensitizing properties compared to earlier iterations." },
      { question: "How does it affect gastric emptying in models?", answer: "Research models indicate a significant delay in gastric emptying, which is a primary mechanism for its profound impact on glycemic control and metabolic homeostasis." }
    ]
  },
  {
    id: "nad",
    name: "NAD+",
    fullName: "Nicotinamide Adenine",
    price: 115,
    displayPrice: "$115.00",
    purity: "99.9%",
    volume: "500mg",
    colorFrom: "from-pink-600/40",
    colorTo: "to-pink-900/20",
    accentGlow: "rgba(236, 72, 153, 0.5)",
    hex: "#ec4899",
    image: "https://imagedelivery.net/uVeQjPq2FGwRQ4qZs2ijJg/Product_Mockups/tilted/nad-tilted.png/public",
    scaleClass: "scale-[1.20]",
    description: "Critical cellular coenzyme. Essential for mitochondrial function, DNA repair algorithms, and maintaining absolute energetic capacity at the cytological level.",
    benefits: ["Mitochondrial Function", "DNA Repair Protocol", "Cellular Energy"],
    weight: 4,
    category: "vial",
    faqs: [
      { question: "What is the role of NAD+ in cellular research?", answer: "Nicotinamide Adenine Dinucleotide (NAD+) is a critical coenzyme found in every living cell. It is essential for mitochondrial function, energy production, and DNA repair algorithms." },
      { question: "Why study NAD+ levels?", answer: "NAD+ levels naturally decline with age. Research focuses on how replenishing these levels might restore cellular energetic capacity and influence longevity pathways." }
    ]
  },
  {
    id: "epithalon",
    name: "Epithalon",
    fullName: "Synthetic Tetrapeptide (AEDG)",
    price: 110,
    displayPrice: "$110.00",
    purity: "99.0%",
    volume: "50mg",
    colorFrom: "from-red-600/40",
    colorTo: "to-red-900/20",
    accentGlow: "rgba(239, 68, 68, 0.5)",
    hex: "#ef4444",
    image: "https://imagedelivery.net/uVeQjPq2FGwRQ4qZs2ijJg/Product_Mockups/tilted/epithalon-tilted.png/public",
    scaleClass: "scale-[1.5]",
    description: "Four-amino-acid synthetic peptide widely characterized in cellular aging and gene-expression models. Employed in in-vitro studies of telomerase-related pathways, circadian regulation, and stress-response signaling—not for human or veterinary use.",
    benefits: ["Cellular Aging Models", "Telomerase Pathway Research", "Circadian & Stress Signaling"],
    weight: 4,
    category: "vial",
    comingSoon: true,
    faqs: [
      { question: "What is Epithalon in research contexts?", answer: "Epithalon (Ala-Glu-Asp-Gly) is a synthetic tetrapeptide studied primarily in laboratory and cell-culture systems for its interaction with gene-expression programs linked to cellular aging and related pathways." },
      { question: "How is purity verified?", answer: "AmiNexa materials are analyzed by HPLC consistent with the Certificate of Analysis for each batch. CoA reflects analytical results at the time of testing." },
      { question: "What are acceptable storage conditions?", answer: "Lyophilized material should be stored frozen per cold-chain guidance. After reconstitution for in-vitro work, follow institutional SOPs and refrigerate as appropriate for peptide stability." }
    ]
  },
  {
    id: "mt2",
    name: "MT2",
    fullName: "Melanotan II",
    price: 50,
    displayPrice: "$50.00",
    purity: "99.0%",
    volume: "10mg",
    colorFrom: "from-orange-600/40",
    colorTo: "to-orange-900/20",
    accentGlow: "rgba(234, 88, 12, 0.5)",
    hex: "#ea580c",
    image: "https://imagedelivery.net/uVeQjPq2FGwRQ4qZs2ijJg/Product_Mockups/tilted/mt2-tilted.png/public",
    scaleClass: "scale-[0.85]",
    description: "Cyclic synthetic peptide investigated for melanocortin receptor engagement in receptor-binding and cell-based assays. Intended strictly for in-vitro research and qualified laboratory investigation—not for human or veterinary use.",
    benefits: ["Receptor Binding Assays", "Melanocortin Pathway Studies", "Laboratory Characterization"],
    weight: 4,
    category: "vial",
    comingSoon: true,
    faqs: [
      { question: "What research applications are typical for MT2?", answer: "MT2 is used in controlled laboratory settings to study melanocortin receptor pharmacology, binding kinetics, and downstream signaling in validated in-vitro models." },
      { question: "Does this material include use instructions for living systems?", answer: "No. AmiNexa supplies research-grade material only. No guidance is provided for administration to humans or animals; such use is outside the intended scope of sale." },
      { question: "How should batches be documented?", answer: "Retain the batch-specific Certificate of Analysis and lot documentation for your institutional compliance and audit trail." }
    ]
  },
  {
    id: "mots-c",
    name: "MOTS-c",
    fullName: "Mitochondrial-Derived Peptide",
    price: 65,
    displayPrice: "$65.00",
    purity: "99.0%",
    volume: "10mg",
    colorFrom: "from-amber-500/40",
    colorTo: "to-amber-900/20",
    accentGlow: "rgba(245, 158, 11, 0.5)",
    hex: "#f59e0b",
    image: "https://imagedelivery.net/uVeQjPq2FGwRQ4qZs2ijJg/Product_Mockups/tilted/mots-c-tilted.png/public",
    scaleClass: "scale-[1.5]",
    description: "Mitochondrial open reading frame–associated peptide studied in metabolic regulation, nutrient sensing, and cellular stress models. For qualified in-vitro and ex-vivo research only—not for human or veterinary use.",
    benefits: ["Metabolic Pathway Models", "Mitochondrial Signaling", "Stress & Nutrient Research"],
    weight: 4,
    category: "vial",
    comingSoon: true,
    faqs: [
      { question: "What is MOTS-c?", answer: "MOTS-c is a peptide encoded within the mitochondrial genome that has been investigated in preclinical models for roles in metabolic homeostasis and related signaling networks." },
      { question: "Is this compound evaluated as a drug?", answer: "AmiNexa products are not drugs and are not intended to diagnose, treat, cure, or prevent any disease. They are sold for research use only." },
      { question: "What analytical data ships with the product?", answer: "Batch-specific HPLC data and supporting documentation are provided on the Certificate of Analysis aligned to the vial label." }
    ]
  },
  {
    id: "tesamorelin",
    name: "Tesamorelin",
    fullName: "GHRH Analog Peptide",
    price: 75,
    displayPrice: "$75.00",
    purity: "99.0%",
    volume: "10mg",
    colorFrom: "from-purple-600/40",
    colorTo: "to-purple-900/20",
    accentGlow: "rgba(147, 51, 234, 0.5)",
    hex: "#9333ea",
    image: "https://imagedelivery.net/uVeQjPq2FGwRQ4qZs2ijJg/Product_Mockups/tilted/tesamorelin-tilted.png/public",
    scaleClass: "scale-[0.85]",
    description: "Growth hormone–releasing hormone (GHRH) analog used in endocrine and secretagogue research models. Supplied for controlled laboratory investigation of pituitary-axis signaling in validated systems—not for human or veterinary use.",
    benefits: ["Endocrine Research Models", "Secretagogue Pathways", "Pituitary-Axis Studies"],
    weight: 4,
    category: "vial",
    comingSoon: true,
    faqs: [
      { question: "What is Tesamorelin used for in research?", answer: "In laboratory settings, tesamorelin and related GHRH analogs are studied to characterize growth-hormone secretagogue pathways, receptor interactions, and downstream hormonal signaling in approved research models." },
      { question: "Can this product be used outside a qualified lab?", answer: "No. Handling, storage, and experimental use must comply with institutional biosafety and chemical-handling policies. The product is not for consumer use." },
      { question: "How does label potency relate to the CoA?", answer: "The mass stated on the vial and your batch CoA should match; use only the documentation supplied for your specific lot for compliance records." }
    ]
  },
  {
    id: "pen-bpc-tb",
    name: "BPC-157 / TB-500",
    fullName: "Pre-Filled Injection Pen",
    price: 250,
    displayPrice: "$250.00",
    purity: "99.0%",
    volume: "10mg / 10mg",
    colorFrom: "from-violet-600/40",
    colorTo: "to-violet-900/20",
    accentGlow: "rgba(139, 92, 246, 0.5)",
    hex: "#8b5cf6",
    image: "https://imagedelivery.net/uVeQjPq2FGwRQ4qZs2ijJg/Product_Mockups/pens/bpc-tb-pen.png/public",
    scaleClass: "scale-100",
    description: "Dual-compound pre-filled delivery system combining BPC-157 and TB-500 in a precision-dosed format. Designed for standardized in-vitro dispensing protocols where consistent volume control is critical—not for human or veterinary use.",
    benefits: ["Dual-Compound Delivery", "Precision Volume Control", "Standardized Dispensing"],
    weight: 6,
    category: "pen",
    brand: "Amino Zero",
    faqs: [
      { question: "What is the Amino Zero pen system?", answer: "Amino Zero manufactures pre-filled peptide delivery devices for laboratory research. AmiNexa is the official authorized distributor of Amino Zero products. Amino Zero and AmiNexa are independent companies." },
      { question: "Why combine BPC-157 and TB-500 in one device?", answer: "The combination format streamlines experimental workflows where both compounds are used together, reducing preparation time and ensuring consistent molar ratios across repeated dispensing cycles." },
      { question: "How should the pen be stored?", answer: "Store refrigerated at 2–8°C. Do not freeze. Keep the device sealed and protected from light until use. Follow all institutional SOPs for handling pre-filled research devices." }
    ]
  },
  {
    id: "pen-ghk-cu",
    name: "GHK-Cu",
    fullName: "Pre-Filled Injection Pen",
    price: 250,
    displayPrice: "$250.00",
    purity: "99.0%",
    volume: "50mg",
    colorFrom: "from-teal-600/40",
    colorTo: "to-teal-900/20",
    accentGlow: "rgba(20, 184, 166, 0.5)",
    hex: "#14b8a6",
    image: "https://imagedelivery.net/uVeQjPq2FGwRQ4qZs2ijJg/Product_Mockups/pens/ghk-cu-pen.png/public",
    scaleClass: "scale-100",
    description: "Pre-filled copper peptide delivery device providing precision dispensing for collagen synthesis and tissue remodeling research protocols. Formulated for consistent volumetric accuracy—not for human or veterinary use.",
    benefits: ["Precision Copper Delivery", "Consistent Dosing Format", "Streamlined Protocols"],
    weight: 6,
    category: "pen",
    brand: "Amino Zero",
    faqs: [
      { question: "Who manufactures this pen?", answer: "This device is manufactured by Amino Zero. AmiNexa is the official authorized distributor of Amino Zero products. The two companies operate independently." },
      { question: "What advantage does the pen format offer for GHK-Cu research?", answer: "The pre-filled format eliminates reconstitution steps and provides exact volumetric dispensing, reducing variability in experimental copper-peptide delivery protocols." },
      { question: "Is this the same GHK-Cu compound as the vial format?", answer: "The active peptide compound is equivalent in purity. The pen format differs in delivery mechanism and preparation—it arrives pre-reconstituted and ready for laboratory dispensing." }
    ]
  },
  {
    id: "pen-nad",
    name: "NAD+",
    fullName: "Pre-Filled Injection Pen",
    price: 300,
    displayPrice: "$300.00",
    purity: "99.0%",
    volume: "500mg",
    colorFrom: "from-rose-600/40",
    colorTo: "to-rose-900/20",
    accentGlow: "rgba(244, 63, 94, 0.5)",
    hex: "#f43f5e",
    image: "https://imagedelivery.net/uVeQjPq2FGwRQ4qZs2ijJg/Product_Mockups/pens/nad-pen.png/public",
    scaleClass: "scale-100",
    description: "High-capacity pre-filled NAD+ delivery device for cellular energetics and mitochondrial function research. Provides 500mg in a precision-metered format for reproducible experimental dispensing—not for human or veterinary use.",
    benefits: ["High-Capacity Format", "Mitochondrial Research", "Reproducible Dispensing"],
    weight: 6,
    category: "pen",
    brand: "Amino Zero",
    faqs: [
      { question: "What is the relationship between AmiNexa and Amino Zero?", answer: "AmiNexa is the official authorized distributor of Amino Zero pre-filled pen products. Amino Zero is an independent manufacturer; the companies are not the same entity." },
      { question: "Why choose the pen format over the lyophilized vial?", answer: "The pen provides pre-reconstituted NAD+ in a precision-metered device, eliminating reconstitution variability and simplifying repeated-measure experimental protocols." },
      { question: "What is the shelf life of the pre-filled pen?", answer: "Store refrigerated at 2–8°C and use within the timeframe specified on the batch CoA. Do not freeze. Protect from light." }
    ]
  },
  {
    id: "pen-glp-3",
    name: "GLP-3",
    fullName: "Pre-Filled Injection Pen",
    price: 300,
    displayPrice: "$300.00",
    purity: "99.0%",
    volume: "10mg",
    colorFrom: "from-sky-600/40",
    colorTo: "to-sky-900/20",
    accentGlow: "rgba(14, 165, 233, 0.5)",
    hex: "#0ea5e9",
    image: "https://imagedelivery.net/uVeQjPq2FGwRQ4qZs2ijJg/Product_Mockups/pens/glp-3-pen.png/public",
    scaleClass: "scale-100",
    description: "Pre-filled GLP-3 delivery device engineered for metabolic and insulin-sensitization research models. Provides metered dispensing with enhanced peptide stability in solution—not for human or veterinary use.",
    benefits: ["Metabolic Research Format", "Enhanced Solution Stability", "Metered Dispensing"],
    weight: 6,
    category: "pen",
    brand: "Amino Zero",
    faqs: [
      { question: "Is this pen manufactured by AmiNexa?", answer: "No. The pre-filled pen is manufactured by Amino Zero. AmiNexa serves as the official authorized distributor. The two are separate, independent companies." },
      { question: "How does the pen format affect GLP-3 stability?", answer: "The sealed pen environment minimizes oxidative exposure and maintains peptide stability in solution longer than manual reconstitution from lyophilized powder, under proper storage conditions." },
      { question: "Can the pen be refilled?", answer: "No. These are single-use pre-filled devices. Do not attempt to refill, disassemble, or reuse. Dispose per institutional biohazard waste protocols." }
    ]
  }
];

export const vials = products.filter((p) => p.category === "vial");
export const pens = products.filter((p) => p.category === "pen");

export function getProduct(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getAdjacentProducts(id: string) {
  const product = products.find((p) => p.id === id);
  if (!product) {
    return { prev: products[0], next: products[1] };
  }
  const sameCategoryProducts = products.filter((p) => p.category === product.category);
  const idx = sameCategoryProducts.findIndex((p) => p.id === id);
  const prev = sameCategoryProducts[(idx - 1 + sameCategoryProducts.length) % sameCategoryProducts.length];
  const next = sameCategoryProducts[(idx + 1) % sameCategoryProducts.length];
  return { prev, next };
}

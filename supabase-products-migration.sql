-- Products table migration for AmiNexa
-- Run this in the Supabase SQL Editor AFTER the initial schema (supabase-schema.sql)

-- ============================================================================
-- PRODUCTS TABLE
-- ============================================================================

create table public.products (
  id text primary key,
  name text not null,
  full_name text not null,
  price numeric not null check (price >= 0),
  display_price text not null,
  purity text not null default '99.0%',
  volume text not null,

  -- Visual / branding
  hex text not null default '#ffffff',
  image text not null,
  scale_class text not null default 'scale-100',
  color_from text not null default '',
  color_to text not null default '',
  accent_glow text not null default '',

  -- Content
  description text not null default '',
  benefits text[] not null default '{}',
  faqs jsonb not null default '[]'::jsonb,

  -- Classification
  category text not null default 'vial' check (category in ('vial', 'pen')),
  brand text,
  coming_soon boolean not null default false,

  -- Ordering & visibility
  sort_order integer not null default 0,
  active boolean not null default true,

  -- Timestamps
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products enable row level security;

-- Everyone can read active products (portal is auth-gated by middleware anyway)
create policy "Anyone can view active products"
  on public.products for select
  using (active = true);

-- Admins can do everything
create policy "Admins can manage products"
  on public.products for all
  using (public.is_admin());

-- Auto-update updated_at
create trigger on_products_updated
  before update on public.products
  for each row execute procedure public.handle_updated_at();

-- Index for common queries
create index idx_products_category on public.products (category);
create index idx_products_sort on public.products (sort_order);
create index idx_products_active on public.products (active);


-- ============================================================================
-- PRODUCT IMAGES STORAGE BUCKET
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "Anyone can view product images"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "Admins can upload product images"
  on storage.objects for insert
  with check (
    bucket_id = 'product-images'
    and public.is_admin()
  );

create policy "Admins can update product images"
  on storage.objects for update
  using (
    bucket_id = 'product-images'
    and public.is_admin()
  );

create policy "Admins can delete product images"
  on storage.objects for delete
  using (
    bucket_id = 'product-images'
    and public.is_admin()
  );


-- ============================================================================
-- SEED DATA — All 12 current products
-- ============================================================================

insert into public.products (id, name, full_name, price, display_price, purity, volume, hex, image, scale_class, color_from, color_to, accent_glow, description, benefits, faqs, category, brand, coming_soon, sort_order) values

-- VIALS
('bpc-157', 'BPC-157', 'Body Protection Compound', 95, '$95.00', '99.4%', '10mg',
 '#22c55e', '/Product Mockups/tilted/bpc-15-tilted.png', 'scale-[1.25]',
 'from-green-600/40', 'to-green-900/20', 'rgba(34, 197, 94, 0.5)',
 'Multi-system biological healing peptide. Demonstrated in rigorous in-vitro models to dramatically accelerate angiogenic pathways and tendon regeneration.',
 ARRAY['Angiogenesis Promotion', 'Gut Lining Restoration', 'Systemic Healing'],
 '[{"question":"What is BPC-157?","answer":"Body Protection Compound-157 is a pentadecapeptide consisting of 15 amino acids, originally discovered in human gastric juice."},{"question":"What are the primary research applications?","answer":"It is heavily researched for its potential to accelerate the healing of tendons, ligaments, muscles, and the nervous system, as well as protecting gastric mucosa."},{"question":"Is BPC-157 stable at room temperature?","answer":"While more stable than many peptides, it is still recommended to store lyophilized BPC-157 in a freezer and refrigerate after reconstitution to maintain absolute structural integrity."}]'::jsonb,
 'vial', null, false, 1),

('ghk-cu', 'GHK-Cu', 'Copper Peptide', 95, '$95.00', '99.2%', '50mg',
 '#059669', '/Product Mockups/tilted/ghk-cu-tilted.png', 'scale-100',
 'from-emerald-700/40', 'to-emerald-950/20', 'rgba(5, 150, 105, 0.5)',
 'Naturally occurring copper complex. Proven to upregulate collagen production, modify tissue remodeling pathways, and trigger robust localized cellular repair.',
 ARRAY['Collagen Synthesis', 'Tissue Remodeling', 'Anti-Inflammatory'],
 '[{"question":"What is GHK-Cu and where does it come from?","answer":"GHK-Cu is a naturally occurring tripeptide (glycyl-L-histidyl-L-lysine) that binds with copper. It was first discovered in human plasma and is released from tissues during injury as part of the body''s natural healing response."},{"question":"What does the research show about GHK-Cu''s effectiveness?","answer":"Clinical in-vitro studies demonstrate GHK-Cu''s ability to upregulate collagen and elastin production, promote blood vessel growth, and modulate the expression of numerous genes related to tissue repair and remodeling."},{"question":"How is GHK-Cu typically prepared for research?","answer":"GHK-Cu is typically reconstituted with bacteriostatic water. Due to its copper binding, the resulting solution often exhibits a distinct blue tint, which is a normal characteristic of the compound."}]'::jsonb,
 'vial', null, false, 2),

('glp-3', 'GLP-3', 'Glucagon-Like Peptide', 135, '$135.00', '99.8%', '10mg',
 '#2563eb', '/Product Mockups/tilted/glp-3-tilted.png', 'scale-[1.10]',
 'from-blue-600/40', 'to-blue-900/20', 'rgba(37, 99, 235, 0.5)',
 'Next-generation metabolic modulator. Engineered for enhanced half-life and aggressive insulin-sensitizing properties with significantly delayed gastric emptying.',
 ARRAY['Insulin Sensitization', 'Gastric Regulation', 'Metabolic Homeostasis'],
 '[{"question":"What distinguishes GLP-3 in metabolic research?","answer":"GLP-3 represents a next-generation approach to glucagon-like peptides, engineered for an extended half-life and more aggressive insulin-sensitizing properties compared to earlier iterations."},{"question":"How does it affect gastric emptying in models?","answer":"Research models indicate a significant delay in gastric emptying, which is a primary mechanism for its profound impact on glycemic control and metabolic homeostasis."}]'::jsonb,
 'vial', null, false, 3),

('nad', 'NAD+', 'Nicotinamide Adenine', 105, '$105.00', '99.9%', '500mg',
 '#ec4899', '/Product Mockups/tilted/nad-tilted.png', 'scale-[1.20]',
 'from-pink-600/40', 'to-pink-900/20', 'rgba(236, 72, 153, 0.5)',
 'Critical cellular coenzyme. Essential for mitochondrial function, DNA repair algorithms, and maintaining absolute energetic capacity at the cytological level.',
 ARRAY['Mitochondrial Function', 'DNA Repair Protocol', 'Cellular Energy'],
 '[{"question":"What is the role of NAD+ in cellular research?","answer":"Nicotinamide Adenine Dinucleotide (NAD+) is a critical coenzyme found in every living cell. It is essential for mitochondrial function, energy production, and DNA repair algorithms."},{"question":"Why study NAD+ levels?","answer":"NAD+ levels naturally decline with age. Research focuses on how replenishing these levels might restore cellular energetic capacity and influence longevity pathways."}]'::jsonb,
 'vial', null, false, 4),

('epithalon', 'Epithalon', 'Synthetic Tetrapeptide (AEDG)', 100, '$100.00', '99.0%', '50mg',
 '#ef4444', '/Product Mockups/tilted/epithalon-tilted.png', 'scale-[1.5]',
 'from-red-600/40', 'to-red-900/20', 'rgba(239, 68, 68, 0.5)',
 'Four-amino-acid synthetic peptide widely characterized in cellular aging and gene-expression models. Employed in in-vitro studies of telomerase-related pathways, circadian regulation, and stress-response signaling—not for human or veterinary use.',
 ARRAY['Cellular Aging Models', 'Telomerase Pathway Research', 'Circadian & Stress Signaling'],
 '[{"question":"What is Epithalon in research contexts?","answer":"Epithalon (Ala-Glu-Asp-Gly) is a synthetic tetrapeptide studied primarily in laboratory and cell-culture systems for its interaction with gene-expression programs linked to cellular aging and related pathways."},{"question":"How is purity verified?","answer":"AmiNexa materials are analyzed by HPLC consistent with the Certificate of Analysis for each batch. CoA reflects analytical results at the time of testing."},{"question":"What are acceptable storage conditions?","answer":"Lyophilized material should be stored frozen per cold-chain guidance. After reconstitution for in-vitro work, follow institutional SOPs and refrigerate as appropriate for peptide stability."}]'::jsonb,
 'vial', null, true, 5),

('mt2', 'MT2', 'Melanotan II', 50, '$50.00', '99.0%', '10mg',
 '#ea580c', '/Product Mockups/tilted/mt2-tilted.png', 'scale-[0.85]',
 'from-orange-600/40', 'to-orange-900/20', 'rgba(234, 88, 12, 0.5)',
 'Cyclic synthetic peptide investigated for melanocortin receptor engagement in receptor-binding and cell-based assays. Intended strictly for in-vitro research and qualified laboratory investigation—not for human or veterinary use.',
 ARRAY['Receptor Binding Assays', 'Melanocortin Pathway Studies', 'Laboratory Characterization'],
 '[{"question":"What research applications are typical for MT2?","answer":"MT2 is used in controlled laboratory settings to study melanocortin receptor pharmacology, binding kinetics, and downstream signaling in validated in-vitro models."},{"question":"Does this material include use instructions for living systems?","answer":"No. AmiNexa supplies research-grade material only. No guidance is provided for administration to humans or animals; such use is outside the intended scope of sale."},{"question":"How should batches be documented?","answer":"Retain the batch-specific Certificate of Analysis and lot documentation for your institutional compliance and audit trail."}]'::jsonb,
 'vial', null, true, 6),

('mots-c', 'MOTS-c', 'Mitochondrial-Derived Peptide', 65, '$65.00', '99.0%', '10mg',
 '#f59e0b', '/Product Mockups/tilted/mots-c-tilted.png', 'scale-[1.5]',
 'from-amber-500/40', 'to-amber-900/20', 'rgba(245, 158, 11, 0.5)',
 'Mitochondrial open reading frame–associated peptide studied in metabolic regulation, nutrient sensing, and cellular stress models. For qualified in-vitro and ex-vivo research only—not for human or veterinary use.',
 ARRAY['Metabolic Pathway Models', 'Mitochondrial Signaling', 'Stress & Nutrient Research'],
 '[{"question":"What is MOTS-c?","answer":"MOTS-c is a peptide encoded within the mitochondrial genome that has been investigated in preclinical models for roles in metabolic homeostasis and related signaling networks."},{"question":"Is this compound evaluated as a drug?","answer":"AmiNexa products are not drugs and are not intended to diagnose, treat, cure, or prevent any disease. They are sold for research use only."},{"question":"What analytical data ships with the product?","answer":"Batch-specific HPLC data and supporting documentation are provided on the Certificate of Analysis aligned to the vial label."}]'::jsonb,
 'vial', null, true, 7),

('tesamorelin', 'Tesamorelin', 'GHRH Analog Peptide', 75, '$75.00', '99.0%', '10mg',
 '#9333ea', '/Product Mockups/tilted/tesamorelin-tilted.png', 'scale-[0.85]',
 'from-purple-600/40', 'to-purple-900/20', 'rgba(147, 51, 234, 0.5)',
 'Growth hormone–releasing hormone (GHRH) analog used in endocrine and secretagogue research models. Supplied for controlled laboratory investigation of pituitary-axis signaling in validated systems—not for human or veterinary use.',
 ARRAY['Endocrine Research Models', 'Secretagogue Pathways', 'Pituitary-Axis Studies'],
 '[{"question":"What is Tesamorelin used for in research?","answer":"In laboratory settings, tesamorelin and related GHRH analogs are studied to characterize growth-hormone secretagogue pathways, receptor interactions, and downstream hormonal signaling in approved research models."},{"question":"Can this product be used outside a qualified lab?","answer":"No. Handling, storage, and experimental use must comply with institutional biosafety and chemical-handling policies. The product is not for consumer use."},{"question":"How does label potency relate to the CoA?","answer":"The mass stated on the vial and your batch CoA should match; use only the documentation supplied for your specific lot for compliance records."}]'::jsonb,
 'vial', null, true, 8),

-- PENS
('pen-bpc-tb', 'BPC-157 / TB-500', 'Pre-Filled Injection Pen', 250, '$250.00', '99.0%', '10mg / 10mg',
 '#8b5cf6', '/Product Mockups/pens/bpc-tb-pen.png', 'scale-100',
 'from-violet-600/40', 'to-violet-900/20', 'rgba(139, 92, 246, 0.5)',
 'Dual-compound pre-filled delivery system combining BPC-157 and TB-500 in a precision-dosed format. Designed for standardized in-vitro dispensing protocols where consistent volume control is critical—not for human or veterinary use.',
 ARRAY['Dual-Compound Delivery', 'Precision Volume Control', 'Standardized Dispensing'],
 '[{"question":"What is the Amino Zero pen system?","answer":"Amino Zero manufactures pre-filled peptide delivery devices for laboratory research. AmiNexa is the official authorized distributor of Amino Zero products. Amino Zero and AmiNexa are independent companies."},{"question":"Why combine BPC-157 and TB-500 in one device?","answer":"The combination format streamlines experimental workflows where both compounds are used together, reducing preparation time and ensuring consistent molar ratios across repeated dispensing cycles."},{"question":"How should the pen be stored?","answer":"Store refrigerated at 2–8°C. Do not freeze. Keep the device sealed and protected from light until use. Follow all institutional SOPs for handling pre-filled research devices."}]'::jsonb,
 'pen', 'Amino Zero', false, 9),

('pen-ghk-cu', 'GHK-Cu', 'Pre-Filled Injection Pen', 250, '$250.00', '99.0%', '50mg',
 '#14b8a6', '/Product Mockups/pens/ghk-cu-pen.png', 'scale-100',
 'from-teal-600/40', 'to-teal-900/20', 'rgba(20, 184, 166, 0.5)',
 'Pre-filled copper peptide delivery device providing precision dispensing for collagen synthesis and tissue remodeling research protocols. Formulated for consistent volumetric accuracy—not for human or veterinary use.',
 ARRAY['Precision Copper Delivery', 'Consistent Dosing Format', 'Streamlined Protocols'],
 '[{"question":"Who manufactures this pen?","answer":"This device is manufactured by Amino Zero. AmiNexa is the official authorized distributor of Amino Zero products. The two companies operate independently."},{"question":"What advantage does the pen format offer for GHK-Cu research?","answer":"The pre-filled format eliminates reconstitution steps and provides exact volumetric dispensing, reducing variability in experimental copper-peptide delivery protocols."},{"question":"Is this the same GHK-Cu compound as the vial format?","answer":"The active peptide compound is equivalent in purity. The pen format differs in delivery mechanism and preparation—it arrives pre-reconstituted and ready for laboratory dispensing."}]'::jsonb,
 'pen', 'Amino Zero', false, 10),

('pen-nad', 'NAD+', 'Pre-Filled Injection Pen', 300, '$300.00', '99.0%', '500mg',
 '#f43f5e', '/Product Mockups/pens/nad-pen.png', 'scale-100',
 'from-rose-600/40', 'to-rose-900/20', 'rgba(244, 63, 94, 0.5)',
 'High-capacity pre-filled NAD+ delivery device for cellular energetics and mitochondrial function research. Provides 500mg in a precision-metered format for reproducible experimental dispensing—not for human or veterinary use.',
 ARRAY['High-Capacity Format', 'Mitochondrial Research', 'Reproducible Dispensing'],
 '[{"question":"What is the relationship between AmiNexa and Amino Zero?","answer":"AmiNexa is the official authorized distributor of Amino Zero pre-filled pen products. Amino Zero is an independent manufacturer; the companies are not the same entity."},{"question":"Why choose the pen format over the lyophilized vial?","answer":"The pen provides pre-reconstituted NAD+ in a precision-metered device, eliminating reconstitution variability and simplifying repeated-measure experimental protocols."},{"question":"What is the shelf life of the pre-filled pen?","answer":"Store refrigerated at 2–8°C and use within the timeframe specified on the batch CoA. Do not freeze. Protect from light."}]'::jsonb,
 'pen', 'Amino Zero', false, 11),

('pen-glp-3', 'GLP-3', 'Pre-Filled Injection Pen', 300, '$300.00', '99.0%', '10mg',
 '#0ea5e9', '/Product Mockups/pens/glp-3-pen.png', 'scale-100',
 'from-sky-600/40', 'to-sky-900/20', 'rgba(14, 165, 233, 0.5)',
 'Pre-filled GLP-3 delivery device engineered for metabolic and insulin-sensitization research models. Provides metered dispensing with enhanced peptide stability in solution—not for human or veterinary use.',
 ARRAY['Metabolic Research Format', 'Enhanced Solution Stability', 'Metered Dispensing'],
 '[{"question":"Is this pen manufactured by AmiNexa?","answer":"No. The pre-filled pen is manufactured by Amino Zero. AmiNexa serves as the official authorized distributor. The two are separate, independent companies."},{"question":"How does the pen format affect GLP-3 stability?","answer":"The sealed pen environment minimizes oxidative exposure and maintains peptide stability in solution longer than manual reconstitution from lyophilized powder, under proper storage conditions."},{"question":"Can the pen be refilled?","answer":"No. These are single-use pre-filled devices. Do not attempt to refill, disassemble, or reuse. Dispose per institutional biohazard waste protocols."}]'::jsonb,
 'pen', 'Amino Zero', false, 12);

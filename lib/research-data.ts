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

// Research data is populated per brand. If the new project does not need
// science/research pages, the /portal/science/ route can be removed entirely.
export const researchData: Record<string, ResearchData> = {};

export function getResearchData(productId: string): ResearchData | undefined {
  return researchData[productId];
}

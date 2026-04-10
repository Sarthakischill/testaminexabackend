import LegalPage from "@/components/LegalPage";
import { siteConfig } from "@/config/site";

export const metadata = {
  title: `Disclaimer — ${siteConfig.name}`,
  description: `${siteConfig.name} disclaimer regarding research use only products and limitations of liability.`,
};

export default function DisclaimerPage() {
  return (
    <LegalPage
      title="Disclaimer"
      lastUpdated="February 26, 2026"
      subtitle={`All products sold by ${siteConfig.name} are intended for research and laboratory use only. They are not intended for human or veterinary use, and are not to be used for food additives, drugs, or household chemicals.`}
      sections={[
        {
          title: "General Disclaimer",
          content: [
            "The information provided on this website is for general informational purposes only. While we strive to provide accurate and up-to-date information, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability of the information, products, or services contained on this website.",
          ],
        },
        {
          title: "Product Use Disclaimer",
          content: [
            `All products sold by ${siteConfig.name}:`,
            [
              "Are sold strictly for in-vitro research and laboratory use only",
              "Are not intended for human or veterinary use",
              "Are not intended for use as food additives, drugs, cosmetics, or household chemicals",
              "Are not intended to diagnose, treat, cure, or prevent any disease",
              "Should only be handled by qualified and licensed professionals",
            ],
          ],
        },
        {
          title: "No Medical Advice",
          content: [
            "Nothing on this website should be construed as providing medical advice. The content is not intended to be a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.",
          ],
        },
        {
          title: "Research Information",
          content: [
            "Any research information, scientific data, or study references provided on this website are for educational and informational purposes only. Such information does not constitute endorsement of any particular use of our products. Researchers are responsible for verifying all information and conducting their own due diligence before using any products.",
          ],
        },
        {
          title: "Buyer Responsibility",
          content: [
            `By purchasing products from ${siteConfig.name}, you represent and warrant that:`,
            [
              "You are at least 18 years of age",
              "You are purchasing products for legitimate research purposes only",
              "You will comply with all applicable laws and regulations regarding the purchase, possession, and use of our products",
              "You will not use products in any manner inconsistent with their intended research use",
              "You accept full responsibility for the proper handling, storage, and use of products",
            ],
          ],
        },
        {
          title: "Product Quality Disclaimer",
          content: [
            "While we strive to provide the highest quality research-grade peptides with 99%+ purity as verified by third-party testing, results may vary based on research conditions, storage, handling, and other factors beyond our control. Certificate of Analysis (CoA) documents reflect the quality at the time of testing and do not guarantee outcomes in specific research applications.",
          ],
        },
        {
          title: "Limitation of Liability",
          content: [
            `In no event shall ${siteConfig.name}, its owners, employees, or affiliates be liable for any direct, indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of our products or the information provided on this website. This includes, but is not limited to, damages for loss of profits, data, or other intangible losses.`,
          ],
        },
        {
          title: "Indemnification",
          content: [
            `You agree to indemnify, defend, and hold harmless ${siteConfig.name}, its owners, officers, directors, employees, agents, and affiliates from and against any and all claims, damages, losses, liabilities, and expenses (including reasonable attorneys' fees) arising from:`,
            [
              "Your use, misuse, or handling of our products, including any injury, illness, or damage resulting from administration to any human or animal",
              "Any statements, health claims, dosing recommendations, or representations you make to third parties regarding our products",
              "Any advertising, marketing, or promotional content you create referencing our products",
              "Any violation of this disclaimer or our Terms of Service",
              `Any regulatory action brought against ${siteConfig.name} as a result of your actions or statements`,
            ],
            "This indemnification survives the termination of your account.",
          ],
        },
        {
          title: "Research Use Only",
          content: [
            `All products sold by ${siteConfig.name} are intended strictly for in-vitro research, laboratory experimentation, and educational purposes. Products are not intended for human or veterinary use. Intended research applications include, but are not limited to, cell culture studies, protein analysis, receptor studies, and biochemical assays.`,
            `By purchasing from ${siteConfig.name}, you acknowledge that you are a qualified researcher or are purchasing for legitimate research purposes, and you agree to use all products in accordance with applicable laws and regulations.`,
          ],
        },
        {
          title: "External Links",
          content: [
            "This website may contain links to external websites. We have no control over the content and nature of these sites and are not responsible for their content or privacy practices. The inclusion of any links does not imply endorsement or recommendation.",
          ],
        },
        {
          title: "Changes to This Disclaimer",
          content: [
            "We reserve the right to modify this disclaimer at any time without prior notice. Changes will be effective immediately upon posting to this page. Your continued use of our website and products after any changes constitutes acceptance of the modified disclaimer.",
          ],
        },
      ]}
    />
  );
}

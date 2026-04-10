import LegalPage from "@/components/LegalPage";

export const metadata = {
  title: "Terms of Service — AmiNexa",
  description: "Terms of Service governing the use of AmiNexa website and purchase of products.",
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      lastUpdated="February 26, 2026"
      subtitle="Welcome to AmiNexa. By accessing our website at aminexa.net or purchasing products from us, you agree to be bound by these Terms of Service."
      sections={[
        {
          title: "1. Acceptance of Terms",
          content: [
            "By accessing or using the Website, you confirm that you are at least 18 years old and have the legal capacity to enter into these Terms. If you are using the Website on behalf of an organization, you represent that you have the authority to bind that organization to these Terms.",
          ],
        },
        {
          title: "2. Eligibility",
          content: [
            "Access to AmiNexa products and services is limited to qualified researchers, laboratory professionals, and organizations engaged in legitimate scientific research. AmiNexa reserves the right to approve or deny any customer or order at its sole discretion. We may request verification of research credentials or institutional affiliation at any time. Failure to provide satisfactory verification may result in order cancellation or account termination.",
          ],
        },
        {
          title: "3. Products and Intended Use",
          content: [
            "All products sold by AmiNexa are intended for laboratory research purposes only. None of our products or statements have been evaluated by the Food and Drug Administration (FDA). By purchasing from us, you acknowledge and agree that:",
            [
              "Products are sold strictly for in-vitro research and laboratory use",
              "Products are not for human or animal consumption, diagnostic, or therapeutic use",
              "Products are not intended to diagnose, treat, cure, or prevent any disease",
              "No product information on this Website constitutes medical advice, dosing guidance, or a recommendation for human or animal use",
              "You will comply with all applicable local, state, and federal laws and regulations related to the purchase, possession, and use of research chemicals",
              "You are a qualified researcher or purchasing for legitimate research purposes",
            ],
          ],
        },
        {
          title: "5. Orders and Payment",
          content: [
            "When you place an order:",
            [
              "You agree to pay all charges at the prices in effect when incurred",
              "You authorize us to charge your payment method for the total amount",
              "All orders are subject to acceptance and availability",
              "We reserve the right to refuse or cancel any order for any reason",
              "Prices are subject to change without notice",
            ],
          ],
        },
        {
          title: "6. Shipping and Delivery",
          content: [
            "We ship to addresses within the United States. Shipping times are estimates and not guaranteed. Risk of loss and title pass to you upon delivery to the carrier. We are not responsible for delays caused by carriers, customs, or circumstances beyond our control.",
          ],
        },
        {
          title: "7. Returns and Refunds",
          content: [
            "Our return policy is detailed on our Returns & Refunds page. In general, unopened products may be returned within 30 days for a full refund. Opened or reconstituted products cannot be returned. Damaged or defective products will be replaced at no cost.",
          ],
        },
        {
          title: "8. Intellectual Property",
          content: [
            "All content on the Website, including text, graphics, logos, images, and software, is the property of AmiNexa or its licensors and is protected by intellectual property laws. You may not reproduce, distribute, modify, or create derivative works without our express written permission.",
          ],
        },
        {
          title: "8. Prohibited Conduct",
          content: [
            "You agree not to:",
            [
              "Use the Website for any unlawful purpose",
              "Misrepresent your identity or affiliation",
              "Interfere with or disrupt the Website or its servers",
              "Attempt to gain unauthorized access to any part of the Website",
              "Use automated means to access or scrape the Website",
              "Resell products without our written authorization",
              "Use products in a manner inconsistent with their intended research use",
              "Discuss, promote, or engage in any practice of human or animal dosing of products purchased from AmiNexa",
              "Market, label, or represent any product purchased from AmiNexa as suitable for human consumption, therapeutic use, or veterinary application",
            ],
            "Violation of any of the above prohibited conduct — in particular any discussion or practice of human or animal dosing — may result in immediate termination of your account, cancellation of pending orders, and a permanent ban from AmiNexa services, at our sole discretion.",
          ],
        },
        {
          title: "9. Termination",
          content: [
            "AmiNexa reserves the right to suspend or terminate your account and refuse any current or future use of the Website at any time, for any reason, at our sole discretion. This includes, without limitation, termination for violation of these Terms, suspected misuse of products, failure to provide satisfactory research credentials upon request, or any conduct that we determine to be harmful to our business, other customers, or the integrity of our operations. Termination of your account does not relieve you of any obligations under these Terms, including indemnification.",
          ],
        },
        {
          title: "10. Assumption of Risk",
          content: [
            "YOU EXPRESSLY ACKNOWLEDGE AND AGREE THAT YOUR PURCHASE, POSSESSION, HANDLING, STORAGE, AND USE OF ANY PRODUCTS FROM AMINEXA IS AT YOUR SOLE AND EXCLUSIVE RISK. AMINEXA SELLS RESEARCH CHEMICALS INTENDED SOLELY FOR IN-VITRO LABORATORY USE. BY PURCHASING ANY PRODUCT, YOU VOLUNTARILY ASSUME ALL RISKS ASSOCIATED WITH THE PRODUCT, INCLUDING BUT NOT LIMITED TO RISKS ARISING FROM IMPROPER STORAGE, HANDLING, CONTAMINATION, DEGRADATION, MISUSE, OR ANY APPLICATION OF THE PRODUCT TO ANY HUMAN OR ANIMAL. YOU WAIVE ANY AND ALL CLAIMS AGAINST AMINEXA ARISING FROM YOUR USE OR MISUSE OF PRODUCTS TO THE FULLEST EXTENT PERMITTED BY LAW.",
          ],
        },
        {
          title: "11. Disclaimer of Warranties",
          content: [
            "THE WEBSITE AND ALL PRODUCTS ARE PROVIDED \"AS IS\" AND \"AS AVAILABLE\" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. TO THE FULLEST EXTENT PERMITTED BY LAW, AMINEXA DISCLAIMS ALL WARRANTIES, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, AND ANY WARRANTIES ARISING FROM COURSE OF DEALING OR USAGE OF TRADE.",
          ],
        },
        {
          title: "12. Limitation of Liability",
          content: [
            "TO THE MAXIMUM EXTENT PERMITTED BY LAW, AMINEXA AND ITS OWNERS, OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, AND AFFILIATES SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES ARISING FROM OR RELATED TO YOUR USE OF THE WEBSITE, PURCHASE OF PRODUCTS, OR ANY ACTIONS TAKEN BASED ON INFORMATION PROVIDED ON THE WEBSITE. OUR TOTAL AGGREGATE LIABILITY FOR ALL CLAIMS ARISING UNDER OR RELATED TO THESE TERMS SHALL NOT EXCEED THE AMOUNT YOU PAID TO AMINEXA FOR THE SPECIFIC PRODUCT(S) GIVING RISE TO THE CLAIM.",
          ],
        },
        {
          title: "13. Indemnification",
          content: [
            "You agree to indemnify, defend, and hold harmless AmiNexa, its owners, officers, directors, employees, agents, and affiliates from and against any and all claims, demands, actions, suits, proceedings, damages, losses, liabilities, judgments, settlements, fines, penalties, costs, and expenses (including reasonable attorneys' fees) arising out of or related to:",
            [
              "Your use, misuse, or handling of any products purchased from AmiNexa",
              "Any statements, claims, representations, or advice you make or provide to any third party regarding AmiNexa products",
              "Any advertising, marketing, social media content, reviews, testimonials, or promotional materials you create referencing AmiNexa products",
              "Any violation of these Terms, including the prohibited conduct",
              "Any violation of applicable laws, regulations, or third-party rights",
              "Any regulatory action, investigation, or enforcement proceeding brought against AmiNexa as a result of your actions",
            ],
            "This indemnification obligation survives the termination of your account and these Terms.",
          ],
        },
        {
          title: "14. Dispute Resolution & Arbitration",
          content: [
            "Any dispute, claim, or controversy arising out of or relating to these Terms shall be resolved exclusively through final and binding arbitration administered by the American Arbitration Association (AAA) under its Commercial Arbitration Rules. The arbitration shall be conducted by a single arbitrator in the State of New Jersey.",
            "YOU AGREE THAT ANY DISPUTE RESOLUTION PROCEEDINGS WILL BE CONDUCTED ONLY ON AN INDIVIDUAL BASIS AND NOT IN A CLASS, CONSOLIDATED, OR REPRESENTATIVE ACTION. YOU WAIVE ANY RIGHT TO PARTICIPATE IN A CLASS ACTION LAWSUIT OR CLASS-WIDE ARBITRATION AGAINST AMINEXA.",
            "By agreeing to these Terms, you acknowledge that you are waiving your right to a trial by jury and your right to participate in a class action.",
          ],
        },
        {
          title: "15. Governing Law",
          content: [
            "These Terms shall be governed by and construed in accordance with the laws of the State of California, without regard to its conflict of law provisions. To the extent that litigation is permitted under these Terms, any legal proceedings shall be brought exclusively in the state or federal courts located in the State of California.",
          ],
        },
        {
          title: "16. Changes to Terms",
          content: [
            "We reserve the right to modify these Terms at any time. Changes will be effective upon posting to the Website. Your continued use of the Website after changes constitutes acceptance of the modified Terms.",
          ],
        },
        {
          title: "17. Severability",
          content: [
            "If any provision of these Terms is found to be invalid, illegal, or unenforceable by a court of competent jurisdiction, such finding shall not affect the validity of the remaining provisions, which shall continue in full force and effect.",
          ],
        },
        {
          title: "18. Waiver",
          content: [
            "The failure of AmiNexa to enforce any right or provision of these Terms shall not constitute a waiver of such right or provision. Any waiver of any provision of these Terms will be effective only if in writing and signed by AmiNexa.",
          ],
        },
        {
          title: "19. Entire Agreement",
          content: [
            "These Terms, together with our Privacy Policy, Disclaimer, and any other policies referenced herein, constitute the entire agreement between you and AmiNexa regarding your use of the Website and purchase of products. These Terms supersede all prior or contemporaneous communications, representations, or agreements, whether oral or written.",
          ],
        },
      ]}
    />
  );
}

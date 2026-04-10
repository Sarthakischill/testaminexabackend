import LegalPage from "@/components/LegalPage";
import { siteConfig } from "@/config/site";

export const metadata = {
  title: `Privacy Policy — ${siteConfig.name}`,
  description: `How ${siteConfig.name} collects, uses, discloses, and safeguards your information.`,
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      lastUpdated="February 26, 2026"
      subtitle={`At ${siteConfig.name}, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or make a purchase from us.`}
      sections={[
        {
          title: "1. Information We Collect",
          content: [
            "We collect information you provide directly to us, including:",
            [
              "Contact Information: Name, email address, phone number, and shipping/billing addresses",
              "Payment Information: Credit card details and billing information (processed securely through our payment providers)",
              "Order Information: Products purchased, order history, and transaction details",
              "Communication Data: Messages, emails, and support requests you send us",
              "Account Information: Username and password if you create an account",
            ],
            "When you visit our website, we automatically collect:",
            [
              "IP address and browser type",
              "Device information and operating system",
              "Pages viewed and time spent on our site",
              "Referring website and exit pages",
              "Cookies and similar tracking technologies",
            ],
          ],
        },
        {
          title: "2. How We Use Your Information",
          content: [
            "We use the information we collect to:",
            [
              "Process and fulfill your orders",
              "Communicate with you about your orders and our products",
              "Send promotional emails (with your consent)",
              "Improve our website and customer experience",
              "Prevent fraud and enhance security",
              "Comply with legal obligations",
              "Respond to your questions and support requests",
            ],
          ],
        },
        {
          title: "3. Information Sharing",
          content: [
            "We do not sell your personal information. We may share your information with:",
            [
              "Service Providers: Payment processors, shipping carriers, and email service providers who help us operate our business",
              "Legal Requirements: When required by law or to protect our rights",
              "Business Transfers: In connection with a merger, acquisition, or sale of assets",
            ],
          ],
        },
        {
          title: "4. Data Security",
          content: [
            "We implement appropriate technical and organizational measures to protect your personal information, including:",
            [
              "SSL/TLS encryption for all data transmission",
              "Secure payment processing through PCI-compliant providers",
              "Regular security audits and monitoring",
              "Limited access to personal information by employees",
              "Secure data storage with encryption at rest",
            ],
          ],
        },
        {
          title: "5. Cookies and Tracking",
          content: [
            "We use cookies and similar technologies to:",
            [
              "Remember your preferences and cart contents",
              "Analyze website traffic and usage patterns",
              "Personalize your experience",
              "Serve relevant advertisements",
            ],
            "You can control cookies through your browser settings. Disabling cookies may affect your ability to use certain features of our website.",
          ],
        },
        {
          title: "6. Your Rights",
          content: [
            "You have the right to:",
            [
              "Access the personal information we hold about you",
              "Request correction of inaccurate information",
              "Request deletion of your personal information",
              "Opt out of marketing communications",
              "Request a copy of your data in a portable format",
            ],
            `To exercise these rights, contact us at ${siteConfig.contactEmail}.`,
          ],
        },
        {
          title: "7. California Privacy Rights (CCPA)",
          content: [
            "If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA), including the right to know what personal information we collect and how it is used, the right to delete your information, and the right to opt out of the sale of your information. We do not sell personal information.",
          ],
        },
        {
          title: "8. Children's Privacy",
          content: [
            "Our website is not intended for individuals under 18 years of age. We do not knowingly collect personal information from children. If we learn we have collected information from a child, we will promptly delete it.",
          ],
        },
        {
          title: "9. Third-Party Links",
          content: [
            "Our website may contain links to third-party websites. We are not responsible for the privacy practices of these sites. We encourage you to review their privacy policies before providing any personal information.",
          ],
        },
        {
          title: "10. Changes to This Policy",
          content: [
            "We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the \"Last Updated\" date. Your continued use of our website after changes constitutes acceptance of the updated policy.",
          ],
        },
      ]}
    />
  );
}

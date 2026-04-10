import LegalPage from "@/components/LegalPage";

export const metadata = {
  title: "Return Policy — AmiNexa",
  description: "AmiNexa 30-day money-back guarantee and return policy for research-grade peptides.",
};

export default function ReturnsPage() {
  return (
    <LegalPage
      title="Return Policy"
      subtitle="30-Day Money-Back Guarantee — not completely satisfied with your purchase? Whatever the reason, we'll make it right with a full refund or replacement, no questions asked."
      sections={[
        {
          title: "How to Make a Return",
          content: [
            [
              "Contact us at contact@aminexa.net with your order number and reason for return. We'll contact you within 24 hours with return instructions.",
              "Pack items securely in original packaging and ship to the address provided.",
              "Once we receive and inspect your return, we'll process your refund within 3–5 business days to your original payment method.",
            ],
          ],
        },
        {
          title: "Eligible for Return",
          content: [
            [
              "Products are unopened",
              "Items were purchased less than 30 days ago",
              "Products are damaged or defective (any time)",
              "Incorrect items received",
            ],
          ],
        },
        {
          title: "Not Eligible for Return",
          content: [
            [
              "Products have been opened",
              "Products were improperly stored after delivery",
              "Items were purchased more than 30 days ago",
              "Products don't have proof of purchase",
            ],
          ],
        },
      ]}
    />
  );
}

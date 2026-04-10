"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import {
  Search,
  ChevronDown,
  ChevronRight,
  X,
  BookOpen,
} from "lucide-react";

const font = { fontFamily: "Helvetica, Arial, sans-serif" } as const;

type Subsection = {
  id: string;
  title: string;
  content: string;
};

type Section = {
  id: string;
  title: string;
  subsections: Subsection[];
};

const SECTIONS: Section[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    subsections: [
      {
        id: "logging-in",
        title: "Logging In",
        content: `To access the admin panel, go to <strong>aminexa.net/login</strong> and sign in with your admin credentials. Once logged in, you'll be taken to the <strong>Admin Dashboard</strong> where you can manage orders, products, and more.\n\nIf you don't have admin access, ask the account owner to grant you admin permissions through Supabase.`,
      },
      {
        id: "dashboard-overview",
        title: "Dashboard Overview",
        content: `The dashboard is your home base. At the top, you'll see four stat cards:\n\n<strong>Total Orders</strong> — The total number of orders in the system, with the current page number.\n\n<strong>Needs Attention</strong> — Orders waiting for you to verify payment (Zelle/USDC) or waiting for the customer to pay (credit card). If this number is greater than zero, it will be highlighted in yellow.\n\n<strong>Store Revenue</strong> — Total revenue from all non-cancelled, non-archived orders.\n\n<strong>Today</strong> — How many orders were placed today.`,
      },
      {
        id: "navigation",
        title: "Navigation",
        content: `The top navigation bar has links to all admin sections:\n\n<strong>Products</strong> — Manage your product catalog (add, edit, remove products).\n\n<strong>Promo</strong> — Create and manage promo codes and sales reps.\n\n<strong>Emails</strong> — Configure which email notifications are sent and to whom.\n\n<strong>QBO</strong> — Connect or manage your QuickBooks Online integration for credit card payments.\n\n<strong>Docs</strong> — This handbook you're reading now.\n\n<strong>Sign Out</strong> — Log out of the admin panel.`,
      },
    ],
  },
  {
    id: "order-lifecycle",
    title: "Order Lifecycle",
    subsections: [
      {
        id: "how-orders-flow",
        title: "How Orders Flow",
        content: `Every order follows a set path from the moment it's placed to delivery. Here's the journey:\n\n<strong>1. Order Placed</strong>\nThe customer completes checkout. Depending on their payment method:\n• <strong>Zelle or USDC</strong> — Order starts as <em>Pending Verification</em>. You need to manually verify their payment.\n• <strong>Credit Card</strong> — Order starts as <em>Awaiting Payment</em>. The customer pays through a QuickBooks invoice link. Once paid, it auto-confirms.\n\n<strong>2. Confirmed</strong>\nPayment has been verified. The order is automatically sent to ShipStation for fulfillment. The customer receives a confirmation email.\n\n<strong>3. Shipped</strong>\nThe package is on its way. This usually updates automatically when you create a shipping label in ShipStation. The customer gets a shipping email with tracking info.\n\n<strong>4. Delivered</strong>\nThe package has arrived. You mark this manually when delivery is confirmed. The customer gets a delivery email.\n\n<strong>Cancelled</strong>\nYou can cancel an order at any point before it ships. The customer receives a cancellation email. Cancelled orders cannot be uncancelled.`,
      },
      {
        id: "status-meanings",
        title: "What Each Status Means",
        content: `<strong>Pending Verification</strong> — The customer paid via Zelle or USDC and uploaded a screenshot. You need to review the proof and confirm the payment.\n\n<strong>Awaiting Payment</strong> — The customer chose credit card but hasn't paid yet. A QuickBooks invoice was created and the system is waiting for payment. No action needed from you — it auto-confirms when paid.\n\n<strong>Confirmed</strong> — Payment is verified. The order has been sent to ShipStation. You need to create a shipping label in ShipStation.\n\n<strong>Shipped</strong> — The package is on its way. The customer has been emailed tracking information.\n\n<strong>Delivered</strong> — The package arrived. Marked manually by an admin.\n\n<strong>Cancelled</strong> — The order was cancelled. The customer was notified. This is a final state.`,
      },
    ],
  },
  {
    id: "managing-orders",
    title: "Managing Orders",
    subsections: [
      {
        id: "finding-orders",
        title: "Finding Orders",
        content: `<strong>Search</strong> — Type a customer's name, email, or order number in the search bar. Results update as you type.\n\n<strong>Status Tabs</strong> — Click a tab to filter by status: All, Pending, Awaiting, Confirmed, Shipped, Delivered, or Cancelled.\n\n<strong>Show Archived</strong> — Click this button to switch between active orders and archived orders. Archived orders are hidden from the main list but not deleted.\n\n<strong>Pagination</strong> — Orders are shown 25 per page. Use the page numbers or Previous/Next buttons at the bottom to navigate.`,
      },
      {
        id: "viewing-order-details",
        title: "Viewing Order Details",
        content: `Click on any order row to open its detail page. You'll see:\n\n<strong>Items</strong> — What the customer ordered, quantities, and per-item prices.\n\n<strong>Pricing Breakdown</strong> — Subtotal, any payment method discount (10% for Zelle/USDC), promo code discount, shipping fee, cold chain fee, and the final total. Shipping always shows — if it's free (order over $100), it displays as <strong>"Free"</strong> in green so you can clearly see it was included at no charge.\n\n<strong>Customer</strong> — Name and email (click to send an email).\n\n<strong>Shipping Address</strong> — Where the order is being sent.\n\n<strong>Shipping Details</strong> — Carrier, service level, estimated delivery, and a link to view the order in ShipStation.\n\n<strong>Payment Proof</strong> — For Zelle and USDC orders, you'll see the screenshot the customer uploaded as proof of payment.\n\n<strong>Timeline</strong> — A history of when the order was placed, confirmed, shipped, and delivered.\n\n<strong>Internal Notes</strong> — Private notes only visible to admins. Use these to track any special handling instructions.\n\n<strong>Metadata</strong> — Order number and last updated timestamp.`,
      },
      {
        id: "confirming-payment",
        title: "Confirming a Payment",
        content: `This applies to <strong>Zelle and USDC</strong> orders only (credit card orders auto-confirm).\n\n<strong>Steps:</strong>\n1. Open the order detail page.\n2. Scroll to the <strong>Payment Proof</strong> section and review the screenshot.\n3. Verify the payment amount and sender match the order.\n4. Click the green <strong>Confirm Payment</strong> button at the top.\n\n<strong>What happens next:</strong>\n• The order status changes to <em>Confirmed</em>.\n• The order is automatically sent to your ShipStation account.\n• The customer receives a "Payment Confirmed" email.\n\nIf ShipStation has an issue receiving the order, you'll see a warning toast message — but the order is still confirmed on your end.`,
      },
      {
        id: "shipping-order",
        title: "Shipping an Order",
        content: `<strong>The normal way (automatic):</strong>\nWhen you create a shipping label in ShipStation, it automatically notifies the site. The order updates to <em>Shipped</em> and the customer gets an email with their tracking number and a link to track the package. You don't need to do anything in the admin panel.\n\n<strong>The manual way (for shipping outside ShipStation):</strong>\n1. Open the order detail page.\n2. Click the purple <strong>Mark Shipped</strong> button.\n3. Optionally enter a tracking number in the text field that appears.\n4. Click <strong>Ship</strong>.\n\n<div class="tip">You'll see a note reminding you that shipping updates are automatic when using ShipStation. Only use the manual button if you're shipping through a different method.</div>`,
      },
      {
        id: "marking-delivered",
        title: "Marking as Delivered",
        content: `Once a package has been delivered:\n\n1. Open the order detail page.\n2. Click the <strong>Mark Delivered</strong> button.\n\n<strong>What happens:</strong> The customer receives a delivery confirmation email. This is the final active state for an order.`,
      },
      {
        id: "cancelling-orders",
        title: "Cancelling an Order",
        content: `You can cancel an order that is in <em>Pending</em>, <em>Awaiting Payment</em>, or <em>Confirmed</em> status.\n\n1. Open the order detail page.\n2. Click the red <strong>Cancel</strong> button.\n\n<strong>What happens:</strong> The customer receives a cancellation email. The order moves to <em>Cancelled</em> status permanently — it cannot be reversed.\n\nYou cannot cancel an order that has already been shipped or delivered.`,
      },
      {
        id: "archiving-vs-deleting",
        title: "Archiving vs. Deleting",
        content: `<strong>Archiving</strong> hides an order from the main list. The order still exists and can be viewed by clicking <strong>Show Archived</strong> on the dashboard. You can unarchive it at any time by clicking the archive icon again. Use this for completed orders you don't want cluttering the main view.\n\nTo archive from the dashboard: click the small box icon on the order row.\nTo archive from the order detail page: click the archive icon in the top right corner.\n\n<strong>Deleting</strong> permanently removes an order and all its data. This cannot be undone.\n\nTo delete: open the order detail page, scroll to the bottom <strong>Danger Zone</strong> section, and click <strong>Delete Order</strong>. You'll be asked to confirm before it's removed.`,
      },
      {
        id: "admin-notes",
        title: "Internal Notes",
        content: `On any order detail page, there's an <strong>Internal Notes</strong> section. Use this to leave notes about the order — special instructions, communication history, or anything relevant.\n\nThese notes are <strong>only visible to admins</strong>. The customer never sees them.\n\nType your note and click <strong>Save</strong>. A green checkmark confirms it was saved.`,
      },
    ],
  },
  {
    id: "product-management",
    title: "Product Management",
    subsections: [
      {
        id: "viewing-products",
        title: "Viewing Products",
        content: `Go to <strong>Products</strong> from the admin navigation. You'll see a list of all products with:\n\n• <strong>Search</strong> — Filter by product name or ID.\n• <strong>Category filter</strong> — Show all products, or only Vials or Pens.\n• <strong>Active only</strong> — Toggle to show/hide inactive products.\n\nEach product row shows the name, price, category, inventory status, and whether it's active.`,
      },
      {
        id: "adding-product",
        title: "Adding a New Product",
        content: `Click the <strong>Add Product</strong> button to open the product form. Here's what each field means:\n\n<strong>Product ID</strong> — A short, URL-friendly name (e.g., "bpc-157"). This is set once and cannot be changed later.\n\n<strong>Name</strong> — The short display name (e.g., "BPC-157").\n\n<strong>Full Name</strong> — The complete scientific name.\n\n<strong>Price</strong> — The price per unit in dollars.\n\n<strong>Volume</strong> — The product size/volume (e.g., "5mg", "10mg").\n\n<strong>Category</strong> — Select Vial or Pen.\n\n<strong>Image</strong> — Upload an image file (PNG, JPEG, or WebP) or paste an image URL.\n\n<strong>Description</strong> — What customers see on the product page.\n\n<strong>Benefits</strong> — A list of key benefits (shown as bullet points to customers).\n\n<strong>FAQs</strong> — Frequently asked questions about this product.\n\n<strong>Inventory Quantity</strong> — How many units are in stock. This number decreases automatically when orders are placed.\n\n<strong>Low Stock Threshold</strong> — When inventory drops below this number, it shows a "Low Stock" warning.\n\n<strong>Active</strong> — Whether the product is visible to customers.\n\n<strong>Coming Soon</strong> — Shows a "Coming Soon" badge instead of an "Add to Cart" button.\n\n<strong>Sort Order</strong> — Controls the display position in the product list (lower numbers appear first).`,
      },
      {
        id: "editing-products",
        title: "Editing and Removing Products",
        content: `<strong>To edit:</strong> Click the edit icon on any product row. The same form opens with the current values. Make your changes and save.\n\n<strong>To deactivate:</strong> Toggle the active switch on the product row. Inactive products are hidden from customers but preserved in the system.\n\n<strong>To delete:</strong> Click the delete button on a product row. If any orders have been placed for this product, it will be <em>deactivated</em> instead of deleted — this ensures order history stays intact. You'll see a message explaining this.`,
      },
      {
        id: "inventory",
        title: "Inventory Management",
        content: `Inventory decreases automatically when customers place orders. You can see the current stock level on each product row:\n\n• <strong>Green</strong> — Stock is healthy.\n• <strong>Yellow "Low Stock"</strong> — Below the low stock threshold. Consider restocking.\n• <strong>Red "Sold Out"</strong> — Zero inventory. Customers cannot add this product to their cart.\n• <strong>"Not Ready"</strong> — The product hasn't been marked as ready for sale yet.\n\nTo update inventory, edit the product and change the <strong>Inventory Quantity</strong> field.`,
      },
    ],
  },
  {
    id: "promo-codes",
    title: "Promo Codes",
    subsections: [
      {
        id: "creating-promo",
        title: "Creating a Promo Code",
        content: `Go to <strong>Promo</strong> from the admin navigation, then the <strong>Promo Codes</strong> tab.\n\nClick <strong>Create Code</strong> and fill in:\n\n<strong>Code</strong> — The code customers will type at checkout (e.g., "WELCOME10"). Automatically converted to uppercase. Codes are <strong>not case-sensitive</strong> for customers — "welcome10" and "WELCOME10" both work.\n\n<strong>Discount Type</strong> — You have two options:\n• <strong>Global discount</strong> — Set a single percentage or fixed dollar amount that applies to the entire order (or selected products equally).\n• <strong>Per-product discounts</strong> — Set different discount amounts for different products. For example, the same code could give 10% off BPC-157 but 5% off GLP-3. Toggle on a product and enter its specific discount amount.\n\nWhen per-product discounts are set, the global discount fields are hidden since each product has its own rate.\n\n<strong>Max Uses</strong> — How many times this code can be used in total. Leave empty for unlimited.\n\n<strong>Expiry Date</strong> — When the code stops working. Leave empty for no expiry.\n\n<strong>Linked Sales Rep</strong> — Optionally link this code to a sales rep to track which orders they brought in.\n\n<strong>Product Selection</strong> — Toggle specific products on or off. If per-product discounts are enabled, each product shows its own discount field. If a customer uses the code but has none of the selected products in their cart, the code will be rejected at checkout.`,
      },
      {
        id: "managing-promos",
        title: "Managing Promo Codes",
        content: `On the Promo Codes tab you can:\n\n• <strong>Edit</strong> — Change the code string, discount amounts (global or per-product), max uses, expiry, linked rep, or product selection.\n• <strong>Activate / Deactivate</strong> — Toggle a code on or off without deleting it.\n• <strong>Delete</strong> — Permanently remove a code.\n\nEach code card shows its usage count and a progress bar toward the max uses limit. Codes near their limit show a warning badge. Product-specific codes display a breakdown of per-product discounts (e.g., "BPC-157 (10%), GLP-3 (5%)") so you can quickly see the configuration.`,
      },
      {
        id: "how-discounts-stack",
        title: "How Discounts Stack",
        content: `When a customer checks out, discounts are applied in this order:\n\n<strong>1. Bundle Discount</strong> — Automatically applied when buying multiple of the same product (2 units = 3.3% off, 3 or more = 5% off).\n\n<strong>2. Payment Method Discount</strong> — 10% off the subtotal for Zelle or USDC payments. No discount for credit card.\n\n<strong>3. Promo Code Discount</strong> — Applied to the amount remaining after the payment discount. Can be a percentage or fixed dollar amount.\n\nAll three can stack. For example, a customer buying 3 units with Zelle and a 10% promo code gets the bundle discount, then 10% off for Zelle, then 10% off for the promo code.\n\nPromo codes apply to all payment methods — including credit card. Only the payment method discount (10% off) is exclusive to Zelle and USDC.\n\n<div class="tip"><strong>Per-product promo codes:</strong> If a promo code has different discount rates for different products, each product's discount is calculated individually on that product's value after bundle and payment discounts. Products not included in the code receive no promo discount. If the customer's cart contains none of the code's products, the code is rejected.</div>`,
      },
    ],
  },
  {
    id: "sales-reps",
    title: "Sales Reps",
    subsections: [
      {
        id: "managing-reps",
        title: "Managing Sales Reps",
        content: `Go to <strong>Promo</strong> from the admin navigation, then the <strong>Sales Reps</strong> tab.\n\n<strong>Adding a rep:</strong> Enter their name and optionally their email. Click <strong>Add Rep</strong>.\n\n<strong>Linking to promo codes:</strong> When creating or editing a promo code, select a rep from the dropdown. Any orders placed with that code will be attributed to the rep.\n\n<strong>Removing a rep:</strong> Click delete on the rep. This unlinks them from any promo codes but doesn't delete the codes themselves.`,
      },
      {
        id: "rep-analytics",
        title: "Sales Rep Analytics",
        content: `For each rep, you can see:\n\n• <strong>Orders</strong> — Total number of orders attributed to their promo code.\n• <strong>Revenue</strong> — Total dollar value of those orders.\n• <strong>Accounts</strong> — Customer accounts that signed up through their referral.\n\nThis helps you track which reps are driving the most business.`,
      },
    ],
  },
  {
    id: "payment-methods",
    title: "Payment Methods",
    subsections: [
      {
        id: "zelle-payments",
        title: "Zelle Payments",
        content: `<strong>How it works for the customer:</strong>\n1. At checkout, they select "Zelle" as their payment method.\n2. They see a clear 3-step instruction guide above the QR code explaining what to do.\n3. They scan the QR code or use the Zelle details to send payment through their bank.\n4. They include their order number in the memo/note field.\n5. They upload a screenshot of their <strong>payment confirmation from their banking app</strong> (not a screenshot of the checkout page).\n6. They place the order.\n\n<strong>What you do:</strong>\n1. The order appears in your dashboard as <em>Pending Verification</em>.\n2. Open the order and review the payment screenshot in the <strong>Payment Proof</strong> section.\n3. Verify the amount matches the order total and the payment looks legitimate.\n4. Click <strong>Confirm Payment</strong>.\n\n<div class="tip">If a customer uploads a screenshot of the checkout page instead of their actual bank payment confirmation, you'll need to contact them to get the real proof. The checkout now has prominent instructions to prevent this.</div>\n\n<strong>Discount:</strong> Customers get 10% off their subtotal for paying with Zelle.`,
      },
      {
        id: "usdc-payments",
        title: "USDC (Crypto) Payments",
        content: `Works the same way as Zelle:\n\n1. Customer selects USDC and sees the wallet address and QR code.\n2. They send the crypto payment.\n3. They upload a screenshot of the transaction.\n4. You verify and confirm the payment in the admin panel.\n\n<strong>Discount:</strong> Same 10% discount as Zelle.`,
      },
      {
        id: "credit-card-payments",
        title: "Credit Card Payments",
        content: `<strong>Requires QuickBooks Online to be connected</strong> (see the QBO section). If QBO is not connected, customers won't see the credit card option at checkout.\n\n<strong>How it works:</strong>\n1. Customer selects "Credit Card" at checkout and places the order.\n2. A QuickBooks invoice is automatically created and sent to the customer's email.\n3. The customer receives a <strong>payment email from QuickBooks</strong> with a secure link to pay.\n4. They click the link in the email and complete payment through QuickBooks' secure payment page.\n5. Once payment is received, the order <strong>automatically confirms</strong> — no action needed from you.\n\nThe customer's order page also shows a notice to check their email for the QuickBooks payment invoice.\n\n<strong>No discount</strong> for credit card payments.\n\n<div class="tip">Credit card orders are the easiest to manage since they confirm automatically. You only need to create the shipping label in ShipStation. The QuickBooks invoice includes all discounts (bundle and payment method) so the amount matches what the customer sees on the site.</div>`,
      },
    ],
  },
  {
    id: "shipping",
    title: "Shipping",
    subsections: [
      {
        id: "shipping-tiers",
        title: "Shipping Options",
        content: `Customers choose from three shipping speeds at checkout:\n\n<strong>Standard Shipping</strong> — $5.99, arrives in 5–7 business days.\n<strong>Priority Shipping</strong> — $12.99, arrives in 2–3 business days.\n<strong>Express Shipping</strong> — $29.99, arrives in 1–2 business days.\n\n<strong>Free shipping:</strong> Standard shipping is free on orders with a subtotal of $100 or more (after bundle discounts but before payment or promo discounts). On the order detail page, free shipping is clearly shown as <strong>"Free"</strong> in green.\n\n<div class="tip">Free shipping only applies to Standard. If the customer selects Priority or Express, they pay the full tier price regardless of order size.</div>`,
      },
      {
        id: "cold-chain",
        title: "Cold Chain Shipping",
        content: `Customers can add <strong>Cold Chain</strong> shipping for $8 extra. This ensures the package is insulated to maintain product potency during transit.\n\nCold chain is optional and selected by the customer during checkout. You'll see "Cold Chain" listed in the pricing breakdown on the order detail page.`,
      },
      {
        id: "shipstation-workflow",
        title: "ShipStation Workflow",
        content: `<strong>What happens automatically:</strong>\nWhen you confirm a payment in the admin panel, the order is sent to your ShipStation account. You'll see it appear in ShipStation's order list.\n\n<strong>Your job in ShipStation:</strong>\n1. Open ShipStation and find the order.\n2. Select the appropriate shipping service and create a label.\n3. Ship the package.\n\n<strong>What happens next:</strong>\nShipStation notifies the website that the order was shipped. The site automatically:\n• Updates the order to <em>Shipped</em>\n• Saves the tracking number\n• Sends the customer a shipping email with tracking info\n\nYou don't need to go back to the admin panel — it's all automatic.\n\n<div class="tip">There's a "View in ShipStation" link on each order detail page that takes you directly to that order in ShipStation.</div>`,
      },
      {
        id: "manual-shipping",
        title: "Shipping Without ShipStation",
        content: `If you're shipping a package without using ShipStation (e.g., hand delivery, a different carrier service):\n\n1. Open the order detail page in the admin panel.\n2. Click <strong>Mark Shipped</strong>.\n3. Enter the tracking number if you have one (optional).\n4. Click <strong>Ship</strong>.\n\nThe customer will receive a shipping email. If you entered a tracking number, they'll be able to track their package.`,
      },
      {
        id: "tracking",
        title: "Tracking Numbers",
        content: `Tracking numbers can come from two places:\n\n<strong>Automatic:</strong> When you create a label in ShipStation, the tracking number is saved to the order automatically.\n\n<strong>Manual:</strong> You can enter a tracking number when clicking "Mark Shipped" on the order detail page.\n\nCustomers see their tracking number on their order page and in the shipping email. There's a "Track Package" link that opens the carrier's tracking page (USPS, UPS, FedEx, or DHL).`,
      },
    ],
  },
  {
    id: "email-notifications",
    title: "Email Notifications",
    subsections: [
      {
        id: "email-settings",
        title: "Configuring Emails",
        content: `Go to <strong>Emails</strong> from the admin navigation. You'll see a card for each email type.\n\nFor each one, you can:\n\n• <strong>Enable / Disable</strong> — Toggle whether this email is sent at all.\n• <strong>Add CC Recipients</strong> — Add extra email addresses that should receive a copy of this email alongside the customer.\n\nThe customer always receives the email at the address they used to place the order. CC recipients get a copy.`,
      },
      {
        id: "email-types",
        title: "All Email Types",
        content: `<strong>Order Received</strong>\nSent immediately when a customer places an order. Confirms their order was received and tells them what to expect next.\n\n<strong>Payment Confirmed</strong>\nSent when you confirm a Zelle/USDC payment, or when a credit card payment is detected automatically. Tells the customer their order is being prepared.\n\n<strong>Order Shipped</strong>\nSent when the order is marked as shipped (automatically from ShipStation or manually by you). Includes the tracking number and a link to track the package.\n\n<strong>Order Delivered</strong>\nSent when you mark an order as delivered. Confirms the package has arrived.\n\n<strong>Order Cancelled</strong>\nSent when you cancel an order. Informs the customer their order has been cancelled.`,
      },
    ],
  },
  {
    id: "quickbooks",
    title: "QuickBooks Online (QBO)",
    subsections: [
      {
        id: "what-qbo-does",
        title: "What QBO Does",
        content: `QuickBooks Online enables the <strong>credit card payment option</strong> for customers. When connected:\n\n• Customers see "Credit Card" as a payment method at checkout.\n• An invoice is automatically created in your QuickBooks account for each credit card order.\n• The invoice reflects all applicable discounts (bundle discounts, payment method discounts) so the total matches what the customer sees on the site.\n• A payment email is automatically sent to the customer from QuickBooks.\n• Customers pay through the link in their email.\n• Orders auto-confirm when payment is received.\n\n<strong>Without QBO connected:</strong> Customers only see Zelle and USDC as payment options.`,
      },
      {
        id: "connecting-qbo",
        title: "Connecting QuickBooks",
        content: `<strong>Steps:</strong>\n1. Go to <strong>QBO</strong> from the admin navigation.\n2. Click <strong>Connect to QuickBooks</strong>.\n3. You'll be redirected to QuickBooks' login page.\n4. Sign in with the QuickBooks <strong>admin</strong> account (regular users don't have permission).\n5. Authorize the connection.\n6. You'll be redirected back to the admin panel with a success message.\n\n<div class="tip">The person connecting must be an admin on the QuickBooks account. If you see "You need admin permissions," ask the account owner to either connect it themselves or upgrade your QuickBooks role.</div>`,
      },
      {
        id: "connection-expiry",
        title: "Connection Expiry",
        content: `The QuickBooks connection expires after approximately <strong>100 days</strong>. The QBO page shows the expiry date.\n\nWhen it's about to expire (within 14 days), you'll see a warning. Click <strong>Reconnect</strong> and sign in again to refresh the connection.\n\nIf the connection expires, credit card checkout is disabled until you reconnect. Existing orders are not affected.`,
      },
      {
        id: "disconnecting-qbo",
        title: "Disconnecting",
        content: `If you need to disconnect QuickBooks:\n\n1. Go to the QBO page.\n2. Click <strong>Disconnect</strong>.\n3. Confirm the disconnection.\n\nCredit card payments will be disabled for customers until you reconnect. Orders that were already paid are unaffected.`,
      },
    ],
  },
  {
    id: "customer-experience",
    title: "What Customers See",
    subsections: [
      {
        id: "customer-browsing",
        title: "Browsing and Shopping",
        content: `Customers browse products at <strong>aminexa.net/portal</strong>. They can:\n\n• View products by category (Vials, Pens)\n• Read detailed product pages with descriptions, benefits, and FAQs\n• Explore the Science Library for research information on each compound\n• Add products to their cart\n\nProducts marked as "Coming Soon" show a badge instead of an "Add to Cart" button. Sold out products cannot be added to the cart.`,
      },
      {
        id: "customer-cart",
        title: "Cart and Pricing",
        content: `The cart shows:\n\n• Each item with quantity controls (+ and −)\n• <strong>Bundle discounts</strong> applied automatically: 2 units of the same product = 3.3% off, 3 or more = 5% off\n• <strong>Cold Chain</strong> toggle ($8 add-on for insulated shipping)\n• A <strong>free shipping progress bar</strong> showing how close they are to the $100 threshold\n• Subtotal, shipping fee, cold chain fee, and estimated total`,
      },
      {
        id: "customer-checkout",
        title: "Checkout Flow",
        content: `Checkout has four steps:\n\n<strong>1. Shipping</strong> — Customer enters their name, email, and shipping address. State is validated as a 2-letter code and ZIP is restricted to digits and hyphens.\n\n<strong>2. Shipping Method</strong> — Choose Standard, Priority, or Express shipping. If the subtotal is $100+, Standard shows as "Free."\n\n<strong>3. Payment</strong> — Choose Zelle, USDC, or Credit Card (if QBO is connected). For Zelle/USDC, they see step-by-step instructions, a QR code, their order number, and a payment proof upload area. Promo codes can also be applied here.\n\n<strong>4. Review</strong> — See the full order summary with all discounts, fees, and total. Place the order.\n\nIf a product's price was updated since the customer added it to their cart, the checkout automatically detects this, updates the cart, and asks them to review the new totals before placing the order.\n\nAfter placing the order, they're taken to the order detail page where they can see the status and next steps.`,
      },
      {
        id: "customer-tracking",
        title: "Order Tracking",
        content: `After placing an order, customers can check its status at any time by going to their <strong>Account</strong> page or <strong>Orders</strong> page.\n\nThe order detail page shows:\n• Current status with a clear explanation\n• Full pricing breakdown (subtotal, discounts, shipping, and total)\n• Shipping address\n• Tracking number and carrier link (once shipped)\n• A "Track Package" button that opens the carrier's tracking website\n\nFor credit card orders awaiting payment, the order page shows a notice telling the customer to check their email for the QuickBooks payment invoice.`,
      },
    ],
  },
  {
    id: "pricing-reference",
    title: "Pricing Reference",
    subsections: [
      {
        id: "pricing-breakdown",
        title: "How the Total Is Calculated",
        content: `The order total is calculated in this exact order:\n\n<strong>Step 1: Subtotal</strong>\nProduct price × quantity for each item, with bundle discounts applied (2 units = 3.3% off, 3+ = 5% off per item).\n\n<strong>Step 2: Payment Discount</strong>\n10% off the subtotal for Zelle or USDC payments. No discount for credit card.\n\n<strong>Step 3: Promo Code</strong>\nApplied to the amount after the payment discount. For per-product promos, each product's discount is calculated individually on its own value after bundle and payment discounts.\n\n<strong>Step 4: Add Shipping</strong>\nStandard ($5.99, free when subtotal ≥ $100), Priority ($12.99), or Express ($29.99). On the order page, free shipping shows as "Free" in green.\n\n<strong>Step 5: Add Cold Chain</strong>\n$8 if the customer selected cold chain shipping.\n\n<strong>= Final Total</strong>\n\nThis same calculation runs on both the customer's checkout page and the server, ensuring they always match.`,
      },
      {
        id: "pricing-example",
        title: "Example Calculation",
        content: `A customer buys 3 units of a $110 product, pays with Zelle, and has a 10% promo code:\n\n<strong>Subtotal:</strong> $110 × 3 = $330, minus 5% bundle discount = $313.50\n<strong>Zelle discount:</strong> 10% off → −$31.35 = $282.15\n<strong>Promo code:</strong> 10% off → −$28.22 = $253.94\n<strong>Shipping:</strong> Free (order over $100)\n<strong>Cold chain:</strong> $8.00\n\n<strong>Total: $261.94</strong>`,
      },
    ],
  },
  {
    id: "troubleshooting",
    title: "Troubleshooting",
    subsections: [
      {
        id: "order-stuck-confirmed",
        title: "Order Stuck on \"Confirmed\"",
        content: `<strong>Why:</strong> The shipping label hasn't been created in ShipStation yet. The order automatically moves to "Shipped" only when ShipStation creates a label.\n\n<strong>What to do:</strong>\n1. Open ShipStation and find the order.\n2. Create a shipping label.\n3. The order will update to "Shipped" automatically.\n\nAlternatively, if you're shipping outside ShipStation, use the <strong>Mark Shipped</strong> button on the order detail page.`,
      },
      {
        id: "no-credit-card",
        title: "Credit Card Option Missing for Customers",
        content: `<strong>Why:</strong> QuickBooks Online is not connected, or the connection has expired.\n\n<strong>What to do:</strong>\n1. Go to the <strong>QBO</strong> page from the admin navigation.\n2. Check the connection status.\n3. If disconnected or expired, click <strong>Connect</strong> or <strong>Reconnect</strong> and sign in with the QuickBooks admin account.`,
      },
      {
        id: "cant-change-status",
        title: "Can't Change an Order's Status",
        content: `<strong>Why:</strong> Order statuses can only move forward in the lifecycle. You cannot go backwards.\n\n<strong>Valid transitions:</strong>\n• Pending → Confirmed or Cancelled\n• Awaiting Payment → Confirmed or Cancelled\n• Confirmed → Shipped or Cancelled\n• Shipped → Delivered\n• Delivered → (final, no changes)\n• Cancelled → (final, no changes)\n\nIf you need to undo a status change, you may need to contact your developer.`,
      },
      {
        id: "shipstation-error",
        title: "ShipStation Error When Confirming",
        content: `<strong>Why:</strong> The ShipStation connection may have an issue (invalid credentials, service outage, etc.).\n\n<strong>What to do:</strong>\nThe order is still confirmed on your end — only the ShipStation push failed. You'll see a warning message. Try:\n\n1. Check if the order appears in ShipStation. If it does, you're fine.\n2. If it doesn't, you can manually create the order in ShipStation.\n3. If the problem persists, contact your developer to check the ShipStation credentials.`,
      },
      {
        id: "qbo-not-authorized",
        title: "QuickBooks Says \"Not Authorized\"",
        content: `<strong>Why:</strong> The person trying to connect QuickBooks is not an admin on the QuickBooks account.\n\n<strong>What to do:</strong>\nAsk the QuickBooks account owner to either:\n• Connect it themselves using their admin login.\n• Upgrade your QuickBooks user role to admin.`,
      },
      {
        id: "archived-by-mistake",
        title: "Archived an Order by Mistake",
        content: `No problem — archiving is reversible.\n\n1. Go to the admin dashboard.\n2. Click <strong>Show Archived</strong>.\n3. Find the order.\n4. Click the unarchive icon (box with an upward arrow) on the order row.\n\nThe order will return to the active list.`,
      },
      {
        id: "price-mismatch",
        title: "Customer Gets \"Price Mismatch\" Error",
        content: `<strong>Why:</strong> This can happen if you updated a product's price after the customer already added it to their cart. Their cart still has the old price stored, so when they try to place the order, the server detects a difference.\n\n<strong>What happens now:</strong> The site automatically detects stale prices at checkout. If a price has changed, the cart updates itself and shows the customer a message: <em>"Some product prices have been updated. Please review the updated totals and place your order again."</em> They just need to click "Place Order" a second time with the corrected totals.\n\n<strong>If a customer reports this issue:</strong> Ask them to try placing the order again — it should work on the second attempt. If it still fails, have them clear their cart, re-add items, and try again.`,
      },
      {
        id: "customer-wrong-screenshot",
        title: "Customer Uploaded Wrong Payment Proof",
        content: `<strong>Why:</strong> The customer may have uploaded a screenshot of the checkout page (showing the QR code) instead of their actual payment confirmation from their banking app.\n\n<strong>What to do:</strong>\n1. Contact the customer and ask them to send a screenshot of their Zelle or USDC payment confirmation — the one from their banking app showing the completed transaction.\n2. You can verify the order amount and confirm payment once you have the correct proof.\n\nThe checkout page now has prominent step-by-step instructions above the QR code to prevent this.`,
      },
    ],
  },
];

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&[a-z]+;/gi, " ");
}

export default function AdminDocsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(SECTIONS.map((s) => s.id))
  );
  const [activeId, setActiveId] = useState<string>(SECTIONS[0]?.id || "");
  const contentRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveId(id);
    }
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const sectionId = entry.target.getAttribute("data-section");
            if (sectionId) setActiveId(sectionId);
          }
        }
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: 0 }
    );

    const headings = document.querySelectorAll("[data-section]");
    headings.forEach((h) => observer.observe(h));

    return () => observer.disconnect();
  }, [searchQuery]);

  const filteredSections = searchQuery.trim()
    ? SECTIONS.map((section) => {
        const q = searchQuery.toLowerCase();
        const matchedSubs = section.subsections.filter(
          (sub) =>
            sub.title.toLowerCase().includes(q) ||
            stripHtml(sub.content).toLowerCase().includes(q)
        );
        if (
          matchedSubs.length > 0 ||
          section.title.toLowerCase().includes(q)
        ) {
          return {
            ...section,
            subsections:
              matchedSubs.length > 0 ? matchedSubs : section.subsections,
          };
        }
        return null;
      }).filter(Boolean) as Section[]
    : SECTIONS;

  return (
    <main className="relative min-h-screen w-full bg-[#050505] selection:bg-white/20 selection:text-white">
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5">
        <div className="w-full px-4 sm:px-6 md:px-10 lg:px-14 xl:px-20 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative w-10 h-10">
              <Image
                src="https://imagedelivery.net/uVeQjPq2FGwRQ4qZs2ijJg/Logos/AmiNexa/AmiNexa_favicon_128_white.png/public"
                alt="AmiNexa"
                fill
                sizes="40px"
                className="object-contain"
              />
            </div>
            <div>
              <h1
                style={font}
                className="text-sm font-medium text-white tracking-wide"
              >
                Operations Handbook
              </h1>
              <p
                style={font}
                className="text-[10px] text-white/30 tracking-[0.1em] uppercase"
              >
                Admin Documentation
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex pt-20">
        {/* Sidebar */}
        <aside
          ref={sidebarRef}
          data-lenis-prevent
          className="hidden lg:block fixed top-20 left-0 w-72 xl:w-80 h-[calc(100vh-5rem)] overflow-y-auto overscroll-contain border-r border-white/5 bg-[#050505]/50 backdrop-blur-sm"
        >
          <div className="p-5">
            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search docs..."
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-10 pr-9 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/25 transition-colors"
                style={font}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Table of Contents */}
            <nav className="flex flex-col gap-1">
              {filteredSections.map((section) => (
                <div key={section.id}>
                  <button
                    onClick={() => {
                      toggleSection(section.id);
                      scrollTo(section.id);
                    }}
                    className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-left transition-colors ${
                      activeId === section.id
                        ? "bg-white/[0.06] text-white"
                        : "text-white/50 hover:text-white/80 hover:bg-white/[0.03]"
                    }`}
                  >
                    {expandedSections.has(section.id) ? (
                      <ChevronDown className="w-3 h-3 shrink-0" />
                    ) : (
                      <ChevronRight className="w-3 h-3 shrink-0" />
                    )}
                    <span
                      style={font}
                      className="text-sm font-medium tracking-wide"
                    >
                      {section.title}
                    </span>
                  </button>

                  {expandedSections.has(section.id) && (
                    <div className="ml-5 flex flex-col gap-0.5 mt-0.5 mb-1">
                      {section.subsections.map((sub) => (
                        <button
                          key={sub.id}
                          onClick={() => scrollTo(sub.id)}
                          className={`px-3 py-1.5 rounded-md text-left transition-colors ${
                            activeId === sub.id
                              ? "text-white bg-white/[0.04]"
                              : "text-white/30 hover:text-white/60"
                          }`}
                        >
                          <span
                            style={font}
                            className="text-xs tracking-wide"
                          >
                            {sub.title}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </aside>

        {/* Mobile Search */}
        <div className="lg:hidden fixed top-20 left-0 right-0 z-40 bg-[#050505]/90 backdrop-blur-xl border-b border-white/5 px-4 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search docs..."
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-10 pr-9 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/25 transition-colors"
              style={font}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div
          ref={contentRef}
          className="flex-1 lg:ml-72 xl:ml-80 w-full min-h-screen"
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-10 pt-8 lg:pt-12 pb-32 mt-16 lg:mt-0">
            {/* Hero */}
            <div className="mb-16">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white/40" />
                </div>
                <div>
                  <h1
                    style={font}
                    className="text-2xl md:text-3xl font-light text-white tracking-tight"
                  >
                    Operations Handbook
                  </h1>
                  <p
                    style={font}
                    className="text-xs text-white/30 tracking-wide"
                  >
                    Everything you need to know to manage AmiNexa
                  </p>
                </div>
              </div>
            </div>

            {filteredSections.length === 0 ? (
              <div className="text-center py-24">
                <p
                  style={font}
                  className="text-white/30 text-sm font-light"
                >
                  No results found for &ldquo;{searchQuery}&rdquo;
                </p>
              </div>
            ) : (
              filteredSections.map((section) => (
                <div key={section.id} className="mb-16">
                  <h2
                    id={section.id}
                    data-section={section.id}
                    style={font}
                    className="text-xl md:text-2xl font-medium text-white tracking-wide mb-8 pb-3 border-b border-white/10"
                  >
                    {section.title}
                  </h2>

                  {section.subsections.map((sub) => (
                    <div
                      key={sub.id}
                      id={sub.id}
                      data-section={section.id}
                      className="mb-12"
                    >
                      <h3
                        style={font}
                        className="text-base md:text-lg font-medium tracking-wide text-white/80 mb-4"
                      >
                        {sub.title}
                      </h3>
                      <div
                        style={font}
                        className="text-[15px] text-white/50 font-light leading-[1.9] docs-content"
                        dangerouslySetInnerHTML={{ __html: formatContent(sub.content) }}
                      />
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .docs-content strong {
          color: rgba(255, 255, 255, 0.8);
          font-weight: 500;
        }
        .docs-content em {
          color: rgba(255, 255, 255, 0.6);
          font-style: italic;
        }
        .docs-content .tip {
          margin-top: 12px;
          margin-bottom: 4px;
          padding: 12px 16px;
          border-radius: 12px;
          background: rgba(234, 179, 8, 0.04);
          border: 1px solid rgba(234, 179, 8, 0.15);
          color: rgba(234, 179, 8, 0.7);
          font-size: 14px;
          line-height: 1.8;
        }
      `}</style>
    </main>
  );
}

function formatContent(raw: string): string {
  return raw
    .split("\n")
    .map((line) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("•")) {
        return `<div style="display:flex;gap:8px;align-items:baseline;margin:2px 0 2px 4px;"><span style="color:rgba(255,255,255,0.2);">•</span><span>${trimmed.slice(1).trim()}</span></div>`;
      }
      if (trimmed === "") {
        return `<div style="height:10px;"></div>`;
      }
      return `<div>${trimmed}</div>`;
    })
    .join("");
}

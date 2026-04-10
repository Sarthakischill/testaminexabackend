-- Email Settings Table
-- Stores configurable email routing for different notification types

CREATE TABLE IF NOT EXISTS email_settings (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  description TEXT NOT NULL,
  recipients TEXT[] NOT NULL DEFAULT '{}',
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE email_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can read/write
CREATE POLICY "Admins can read email_settings"
  ON email_settings FOR SELECT
  USING (
    (SELECT (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  );

CREATE POLICY "Admins can update email_settings"
  ON email_settings FOR UPDATE
  USING (
    (SELECT (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  );

CREATE POLICY "Admins can insert email_settings"
  ON email_settings FOR INSERT
  WITH CHECK (
    (SELECT (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  );

-- Service role can always read (for API routes sending emails)
CREATE POLICY "Service role can read email_settings"
  ON email_settings FOR SELECT
  USING (auth.role() = 'service_role');

-- Seed default settings
INSERT INTO email_settings (id, label, description, recipients) VALUES
  ('order_notification', 'New Order Notifications', 'Emails sent to admins/owners when a new order is placed', ARRAY['peptides.solutions@gmail.com', 'contact@aminexa.net']),
  ('contact_form', 'Contact Form Submissions', 'Emails sent when someone submits the contact form', ARRAY['peptides.solutions@gmail.com', 'contact@aminexa.net']),
  ('order_confirmed', 'Order Confirmed (Customer)', 'Confirmation email sent to the customer when payment is verified', ARRAY[]::TEXT[]),
  ('order_shipped', 'Order Shipped (Customer)', 'Shipping notification sent to the customer with tracking info', ARRAY[]::TEXT[]),
  ('order_received', 'Order Received (Customer)', 'Receipt email sent to the customer after placing an order', ARRAY[]::TEXT[])
ON CONFLICT (id) DO NOTHING;

-- Note: For customer-facing emails (order_confirmed, order_shipped, order_received),
-- the primary recipient is always the customer's email. The recipients array here
-- is for ADDITIONAL CC recipients (e.g. if you want a copy sent to an admin too).

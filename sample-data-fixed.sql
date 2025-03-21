-- Sample Data for CRM MVP

-- Insert sample users with bcrypt hashed passwords (password is 'password123')
INSERT INTO users (id, email, password_hash, first_name, last_name, role, created_at, updated_at)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'admin@example.com', '$2a$10$hACwQ5/HQI6FhbIISOUVeusy3sKyUDhSq36fF5d/54aULe9Pq5mQ.', 'Admin', 'User', 'admin', NOW(), NOW()),
  ('22222222-2222-2222-2222-222222222222', 'manager@example.com', '$2a$10$hACwQ5/HQI6FhbIISOUVeusy3sKyUDhSq36fF5d/54aULe9Pq5mQ.', 'Manager', 'User', 'manager', NOW(), NOW()),
  ('33333333-3333-3333-3333-333333333333', 'sales1@example.com', '$2a$10$hACwQ5/HQI6FhbIISOUVeusy3sKyUDhSq36fF5d/54aULe9Pq5mQ.', 'John', 'Salesman', 'sales_rep', NOW(), NOW()),
  ('44444444-4444-4444-4444-444444444444', 'sales2@example.com', '$2a$10$hACwQ5/HQI6FhbIISOUVeusy3sKyUDhSq36fF5d/54aULe9Pq5mQ.', 'Jane', 'Saleswoman', 'sales_rep', NOW(), NOW());

-- Insert sample customers
INSERT INTO customers (id, name, email, phone, company, status, created_at, updated_at, assigned_to)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Acme Inc', 'contact@acmeinc.com', '(555) 123-4567', 'Acme Inc', 'active', NOW(), NOW(), '33333333-3333-3333-3333-333333333333'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Globex Corporation', 'info@globex.com', '(555) 234-5678', 'Globex Corporation', 'active', NOW(), NOW(), '33333333-3333-3333-3333-333333333333'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Stark Industries', 'sales@stark.com', '(555) 345-6789', 'Stark Industries', 'lead', NOW(), NOW(), '44444444-4444-4444-4444-444444444444'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Wayne Enterprises', 'info@wayneent.com', '(555) 456-7890', 'Wayne Enterprises', 'inactive', NOW(), NOW(), '44444444-4444-4444-4444-444444444444'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Cyberdyne Systems', 'sales@cyberdyne.com', '(555) 567-8901', 'Cyberdyne Systems', 'lead', NOW(), NOW(), '33333333-3333-3333-3333-333333333333');

-- Insert sample contacts
INSERT INTO contacts (customer_id, first_name, last_name, email, phone, position, is_primary)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'John', 'Doe', 'john.doe@acmeinc.com', '(555) 111-2222', 'CEO', TRUE),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Jane', 'Smith', 'jane.smith@acmeinc.com', '(555) 111-3333', 'CTO', FALSE),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Bob', 'Johnson', 'bob@globex.com', '(555) 222-3333', 'Director of Sales', TRUE),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Tony', 'Stark', 'tony@stark.com', '(555) 333-4444', 'CEO', TRUE),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Bruce', 'Wayne', 'bruce@wayneent.com', '(555) 444-5555', 'Owner', TRUE),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Miles', 'Dyson', 'miles@cyberdyne.com', '(555) 555-6666', 'Director of Research', TRUE);

-- Insert pipeline stages
INSERT INTO pipeline_stages (id, name, description, order_index)
VALUES
  ('11111111-aaaa-bbbb-cccc-dddddddddddd', 'Lead', 'Initial contact with prospect', 1),
  ('22222222-aaaa-bbbb-cccc-dddddddddddd', 'Qualification', 'Assessing if prospect is a good fit', 2),
  ('33333333-aaaa-bbbb-cccc-dddddddddddd', 'Needs Analysis', 'Understanding prospect needs', 3),
  ('44444444-aaaa-bbbb-cccc-dddddddddddd', 'Proposal', 'Proposal sent to prospect', 4),
  ('55555555-aaaa-bbbb-cccc-dddddddddddd', 'Negotiation', 'Finalizing terms and conditions', 5),
  ('66666666-aaaa-bbbb-cccc-dddddddddddd', 'Closed Won', 'Deal won', 6),
  ('77777777-aaaa-bbbb-cccc-dddddddddddd', 'Closed Lost', 'Deal lost', 7);

-- Insert opportunities
INSERT INTO opportunities (customer_id, name, description, amount, stage_id, status, expected_close_date, created_by, assigned_to)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Acme Software License', 'Enterprise software licensing deal', 75000.00, '44444444-aaaa-bbbb-cccc-dddddddddddd', 'open', '2023-12-15', '33333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Globex Consulting', 'Strategic consulting services', 45000.00, '33333333-aaaa-bbbb-cccc-dddddddddddd', 'open', '2023-11-30', '33333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Stark Industries Hardware', 'Custom hardware solution', 125000.00, '22222222-aaaa-bbbb-cccc-dddddddddddd', 'open', '2024-01-20', '44444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Wayne Security System', 'Corporate security upgrade', 95000.00, '66666666-aaaa-bbbb-cccc-dddddddddddd', 'won', '2023-10-15', '44444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Cyberdyne AI Implementation', 'AI system integration', 150000.00, '55555555-aaaa-bbbb-cccc-dddddddddddd', 'open', '2023-12-31', '33333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333');

-- Insert tasks
INSERT INTO tasks (title, description, due_date, status, priority, customer_id, opportunity_id, assigned_to, created_by)
VALUES
  ('Call John from Acme', 'Follow up on software license proposal', NOW() + INTERVAL '2 days', 'pending', 'high', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', (SELECT id FROM opportunities WHERE customer_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' LIMIT 1), '33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222'),
  ('Send proposal to Globex', 'Prepare and send consulting proposal', NOW() + INTERVAL '3 days', 'pending', 'medium', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', (SELECT id FROM opportunities WHERE customer_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' LIMIT 1), '33333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333'),
  ('Demo for Stark Industries', 'Prepare hardware demo for meeting', NOW() + INTERVAL '7 days', 'in_progress', 'high', 'cccccccc-cccc-cccc-cccc-cccccccccccc', (SELECT id FROM opportunities WHERE customer_id = 'cccccccc-cccc-cccc-cccc-cccccccccccc' LIMIT 1), '44444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444'),
  ('Wayne Enterprises Implementation', 'Kick off implementation of security system', NOW() - INTERVAL '5 days', 'completed', 'high', 'dddddddd-dddd-dddd-dddd-dddddddddddd', (SELECT id FROM opportunities WHERE customer_id = 'dddddddd-dddd-dddd-dddd-dddddddddddd' LIMIT 1), '44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222'),
  ('Negotiate with Cyberdyne', 'Final pricing negotiation', NOW() + INTERVAL '1 day', 'pending', 'high', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', (SELECT id FROM opportunities WHERE customer_id = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee' LIMIT 1), '33333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333');

-- Insert task comments
INSERT INTO task_comments (task_id, user_id, comment)
VALUES
  ((SELECT id FROM tasks WHERE title = 'Call John from Acme' LIMIT 1), '33333333-3333-3333-3333-333333333333', 'John mentioned he needs to talk to his team first. Will follow up next week.'),
  ((SELECT id FROM tasks WHERE title = 'Wayne Enterprises Implementation' LIMIT 1), '44444444-4444-4444-4444-444444444444', 'Installation completed successfully. Client is very satisfied.'),
  ((SELECT id FROM tasks WHERE title = 'Demo for Stark Industries' LIMIT 1), '44444444-4444-4444-4444-444444444444', 'Demo materials prepared, need to review with technical team.'),
  ((SELECT id FROM tasks WHERE title = 'Demo for Stark Industries' LIMIT 1), '22222222-2222-2222-2222-222222222222', 'Approved. Let me know if you need any additional resources.');

-- Insert activity logs
INSERT INTO activity_logs (user_id, customer_id, opportunity_id, activity_type, description)
VALUES
  ('33333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', (SELECT id FROM opportunities WHERE customer_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' LIMIT 1), 'call', 'Initial discovery call with John. Discussed needs and pain points.'),
  ('33333333-3333-3333-3333-333333333333', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', (SELECT id FROM opportunities WHERE customer_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' LIMIT 1), 'email', 'Sent follow-up email with pricing information.'),
  ('44444444-4444-4444-4444-444444444444', 'cccccccc-cccc-cccc-cccc-cccccccccccc', (SELECT id FROM opportunities WHERE customer_id = 'cccccccc-cccc-cccc-cccc-cccccccccccc' LIMIT 1), 'meeting', 'In-person meeting at Stark Industries HQ. Very positive reception.'),
  ('44444444-4444-4444-4444-444444444444', 'dddddddd-dddd-dddd-dddd-dddddddddddd', (SELECT id FROM opportunities WHERE customer_id = 'dddddddd-dddd-dddd-dddd-dddddddddddd' LIMIT 1), 'note', 'Contract signed and received. Implementation to begin next week.'),
  ('33333333-3333-3333-3333-333333333333', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', (SELECT id FROM opportunities WHERE customer_id = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee' LIMIT 1), 'call', 'Negotiation call with Miles. Requested 10% discount on implementation services.');

-- Insert subscription plans with proper UUIDs
INSERT INTO subscription_plans (id, name, description, price, billing_cycle, features)
VALUES
  ('aa111111-aaaa-bbbb-cccc-dddddddddddd', 'Basic CRM', 'Basic CRM features for small businesses', 29.99, 'monthly', '{"users": 5, "storage": "10GB", "email_tracking": true, "api_access": false}'),
  ('bb222222-aaaa-bbbb-cccc-dddddddddddd', 'Professional CRM', 'Advanced CRM for growing businesses', 49.99, 'monthly', '{"users": 20, "storage": "50GB", "email_tracking": true, "api_access": true, "advanced_analytics": true}'),
  ('cc333333-aaaa-bbbb-cccc-dddddddddddd', 'Enterprise CRM', 'Full-featured CRM for large enterprises', 99.99, 'monthly', '{"users": 100, "storage": "500GB", "email_tracking": true, "api_access": true, "advanced_analytics": true, "dedicated_support": true}'),
  ('dd444444-aaaa-bbbb-cccc-dddddddddddd', 'Basic Annual', 'Basic CRM with annual billing', 299.90, 'annually', '{"users": 5, "storage": "10GB", "email_tracking": true, "api_access": false}'),
  ('ee555555-aaaa-bbbb-cccc-dddddddddddd', 'Professional Annual', 'Professional CRM with annual billing', 499.90, 'annually', '{"users": 20, "storage": "50GB", "email_tracking": true, "api_access": true, "advanced_analytics": true}');

-- Insert customer subscriptions
INSERT INTO customer_subscriptions (customer_id, plan_id, status, start_date, end_date, payment_method)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bb222222-aaaa-bbbb-cccc-dddddddddddd', 'active', '2023-01-15', '2024-01-15', '{"type": "credit_card", "last4": "4242", "brand": "Visa"}'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'cc333333-aaaa-bbbb-cccc-dddddddddddd', 'active', '2023-03-10', '2024-03-10', '{"type": "credit_card", "last4": "5678", "brand": "Mastercard"}'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'aa111111-aaaa-bbbb-cccc-dddddddddddd', 'active', '2023-06-01', '2023-12-01', '{"type": "paypal", "email": "tony@stark.com"}'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'ee555555-aaaa-bbbb-cccc-dddddddddddd', 'active', '2023-02-20', '2024-02-20', '{"type": "bank_transfer", "account_last4": "9876"}');

-- Insert payments
INSERT INTO payments (subscription_id, customer_id, amount, payment_date, payment_method, transaction_id, status)
VALUES
  ((SELECT id FROM customer_subscriptions WHERE customer_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' LIMIT 1), 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 49.99, '2023-01-15', 'credit_card', 'txn_1234567890', 'completed'),
  ((SELECT id FROM customer_subscriptions WHERE customer_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' LIMIT 1), 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 49.99, '2023-02-15', 'credit_card', 'txn_1234567891', 'completed'),
  ((SELECT id FROM customer_subscriptions WHERE customer_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' LIMIT 1), 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 49.99, '2023-03-15', 'credit_card', 'txn_1234567892', 'completed'),
  ((SELECT id FROM customer_subscriptions WHERE customer_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' LIMIT 1), 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 99.99, '2023-03-10', 'credit_card', 'txn_2345678901', 'completed'),
  ((SELECT id FROM customer_subscriptions WHERE customer_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' LIMIT 1), 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 99.99, '2023-04-10', 'credit_card', 'txn_2345678902', 'completed'),
  ((SELECT id FROM customer_subscriptions WHERE customer_id = 'cccccccc-cccc-cccc-cccc-cccccccccccc' LIMIT 1), 'cccccccc-cccc-cccc-cccc-cccccccccccc', 29.99, '2023-06-01', 'paypal', 'txn_3456789012', 'completed'),
  ((SELECT id FROM customer_subscriptions WHERE customer_id = 'cccccccc-cccc-cccc-cccc-cccccccccccc' LIMIT 1), 'cccccccc-cccc-cccc-cccc-cccccccccccc', 29.99, '2023-07-01', 'paypal', 'txn_3456789013', 'completed'),
  ((SELECT id FROM customer_subscriptions WHERE customer_id = 'dddddddd-dddd-dddd-dddd-dddddddddddd' LIMIT 1), 'dddddddd-dddd-dddd-dddd-dddddddddddd', 499.90, '2023-02-20', 'bank_transfer', 'txn_4567890123', 'completed'); 
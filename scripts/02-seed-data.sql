-- Seed data for Digital Waiting Queue System

-- Insert sample organization
INSERT INTO organizations (name, slug) VALUES 
('Demo Healthcare Center', 'demo-healthcare')
ON CONFLICT (slug) DO NOTHING;

-- Insert sample branch
INSERT INTO branches (organization_id, name, address, phone, email) VALUES 
(1, 'Main Branch', '123 Healthcare Ave, City, State 12345', '+1-555-0123', 'main@demohealthcare.com')
ON CONFLICT DO NOTHING;

-- Insert sample services
INSERT INTO services (branch_id, name, description, estimated_duration) VALUES 
(1, 'General Consultation', 'General medical consultation', 20),
(1, 'Lab Tests', 'Blood tests and lab work', 10),
(1, 'Pharmacy', 'Prescription pickup', 5),
(1, 'Specialist Consultation', 'Specialist doctor consultation', 30)
ON CONFLICT DO NOTHING;

-- Insert sample counters
INSERT INTO counters (branch_id, name) VALUES 
(1, 'Counter 1'),
(1, 'Counter 2'),
(1, 'Counter 3'),
(1, 'Pharmacy Counter')
ON CONFLICT DO NOTHING;

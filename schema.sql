-- User Accounts
-- Roles: admin, manager, staff
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'manager', 'staff')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS workshop_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    category VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS workshops (
    id SERIAL PRIMARY KEY,
    type_id INT NOT NULL REFERENCES workshop_types(id),
    code VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    instructor VARCHAR(255) NOT NULL,
    schedule_date TIMESTAMP WITH TIME ZONE NOT NULL,
    duration INT NOT NULL DEFAULT 60,
    capacity INT NOT NULL CHECK (capacity > 0),
    status VARCHAR(50) NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'draft', 'cancelled')),
    location VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Registrations
-- Tracks attendees. When an attendee cancels, we simply update the status to 'cancelled' 
-- rather than deleting the row to maintain immutable data.
CREATE TABLE IF NOT EXISTS registrations (
    id SERIAL PRIMARY KEY,
    workshop_id INT NOT NULL REFERENCES workshops(id),
    attendee_name VARCHAR(255) NOT NULL,
    attendee_email VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Registration Audit History
-- Every time a registration is made or cancelled, it is logged here.
-- This fulfills the requirement to explicitly show which staff member made the change and when.
CREATE TABLE IF NOT EXISTS registration_history (
    id SERIAL PRIMARY KEY,
    registration_id INT NOT NULL REFERENCES registrations(id),
    action VARCHAR(50) NOT NULL CHECK (action IN ('registered', 'cancelled')),
    performed_by INT NOT NULL REFERENCES users(id),
    action_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance (especially since we'll be querying by workshop and status often)
CREATE INDEX IF NOT EXISTS idx_workshops_status ON workshops(status);
CREATE INDEX IF NOT EXISTS idx_workshops_schedule_date ON workshops(schedule_date);
CREATE INDEX IF NOT EXISTS idx_registrations_workshop_status ON registrations(workshop_id, status);

-- Broad System Audit Logs
CREATE TABLE IF NOT EXISTS system_audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id),
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INT,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed Data for Users (pw123)
INSERT INTO users (email, password, role) VALUES 
('admin', 'pw123', 'admin'),
('manager', 'pw123', 'manager'),
('staff', 'pw123', 'staff')
ON CONFLICT (email) DO NOTHING;


-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tenant White-Label Settings Table (FR-ADM-03)
CREATE TABLE IF NOT EXISTS tenant_settings (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) UNIQUE DEFAULT 'default_tenant',
    school_name VARCHAR(150) NOT NULL DEFAULT 'e-Vidyalaya High School',
    primary_color VARCHAR(10) NOT NULL DEFAULT '#0F1E3D',
    secondary_color VARCHAR(10) NOT NULL DEFAULT '#B8842E',
    custom_domain VARCHAR(255) NOT NULL DEFAULT 'campus.evidyalaya.edu',
    logo_url TEXT,
    logo_text VARCHAR(10) NOT NULL DEFAULT 'eV',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed initial tenant record
INSERT INTO tenant_settings (tenant_id, school_name, primary_color, secondary_color, custom_domain, logo_text)
VALUES ('default_tenant', 'e-Vidyalaya High School', '#0F1E3D', '#B8842E', 'campus.evidyalaya.edu', 'eV')
ON CONFLICT (tenant_id) DO NOTHING;

---- 2. System Users Directory Table (Updated for Authentication)
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    tenant_id VARCHAR(50) NOT NULL DEFAULT 'default_tenant',

    name VARCHAR(100) NOT NULL,

    email VARCHAR(150) UNIQUE NOT NULL,

    password_hash TEXT NOT NULL,

    role VARCHAR(20) NOT NULL
        CHECK (role IN ('admin', 'faculty', 'student')),

    status VARCHAR(20) NOT NULL DEFAULT 'Active'
        CHECK (status IN ('Active', 'Suspended', 'Pending')),

    approval_status VARCHAR(30) DEFAULT 'Approved',

    email_verified BOOLEAN DEFAULT FALSE,

    accepted_terms BOOLEAN DEFAULT FALSE,

    failed_login_attempts INTEGER DEFAULT 0,

    account_locked_until TIMESTAMP NULL,

    reset_otp VARCHAR(6),

    reset_otp_expiry TIMESTAMP NULL,

    last_login TIMESTAMP NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_users_tenant
        FOREIGN KEY (tenant_id)
        REFERENCES tenant_settings(tenant_id)
        ON DELETE CASCADE
);

-- 3. Course Directory Catalog Table (FR-STU-02, FR-FAC-02)
CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) NOT NULL,
    title VARCHAR(200) NOT NULL,
    price NUMERIC(10, 2) NOT NULL DEFAULT 1299.00,
    grade_level VARCHAR(20) NOT NULL DEFAULT 'Grade 10',
    trailer_url TEXT DEFAULT 'https://www.w3schools.com/html/mov_bbb.mp4',
    faculty_name VARCHAR(100) DEFAULT 'Prof. R. Sharma',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Class Schedules & Live Broadcast Table (FR-FAC-02, FR-FAC-03, FR-STU-03)
CREATE TABLE IF NOT EXISTS schedules (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    grade_level VARCHAR(20) NOT NULL DEFAULT 'Grade 10',
    day_of_week VARCHAR(20) NOT NULL DEFAULT 'Monday',
    start_time VARCHAR(20) NOT NULL DEFAULT '08:30 AM',
    end_time VARCHAR(20) NOT NULL DEFAULT '09:30 AM',
    zoom_url TEXT DEFAULT 'https://zoom.us/j/demo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Class & Campus Announcements Table (FR-FAC-02, FR-ADM-01)
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    grade_level VARCHAR(20) DEFAULT 'ALL',
    sender_name VARCHAR(100) DEFAULT 'Faculty / Admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Support Tickets Table (FR-STU-05, FR-FAC-04)
CREATE TABLE IF NOT EXISTS support_tickets (
    id SERIAL PRIMARY KEY,
    user_email VARCHAR(150) NOT NULL,
    subject VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'Open' CHECK (status IN ('Open', 'Pending', 'Resolved')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- 7. Email OTP Verification Table
DROP TABLE IF EXISTS email_otps CASCADE;

CREATE TABLE email_otps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    email VARCHAR(150) NOT NULL,

    otp VARCHAR(6) NOT NULL,

    verified BOOLEAN DEFAULT FALSE,

    expires_at TIMESTAMP NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email
ON users(email);

CREATE INDEX idx_email_otps_email
ON email_otps(email);
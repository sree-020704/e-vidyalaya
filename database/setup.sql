-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tenants Table (Multi-tenant White-labeling)
CREATE TABLE IF NOT EXISTS tenants (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) UNIQUE,
    logo_url TEXT,
    primary_color VARCHAR(10) DEFAULT '#0F1E3D',
    secondary_color VARCHAR(10) DEFAULT '#B8842E',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert Default Tenant
INSERT INTO tenants (id, name, domain) 
VALUES ('default-campus', 'e-Vidyalaya Central Campus', 'localhost')
ON CONFLICT (id) DO NOTHING;

-- 2. Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) REFERENCES tenants(id) DEFAULT 'default-campus',
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('student', 'faculty', 'admin')) DEFAULT 'student',
    grade_level VARCHAR(50) DEFAULT 'Class 10',
    admission_no VARCHAR(50),
    dob DATE,
    gender VARCHAR(10),
    parent_name VARCHAR(255),
    parent_phone VARCHAR(20),
    address TEXT,
    avatar_url TEXT,
    is_approved BOOLEAN DEFAULT FALSE,
    reset_otp VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert Sample Users (Admin, Faculty, Student)
INSERT INTO users (tenant_id, name, email, phone, password_hash, role, is_approved, admission_no, dob, gender)
VALUES 
('default-campus', 'System Administrator', 'admin@evidyalaya.com', '9999999999', 'Admin@123', 'admin', TRUE, 'ADM-001', '1990-01-01', 'Male'),
('default-campus', 'Prof. R. Sharma', 'sharma@evidyalaya.com', '9876543210', 'Faculty@123', 'faculty', TRUE, 'FAC-101', '1985-05-12', 'Male'),
('default-campus', 'Rahul Sharma', 'rahul@student.com', '9123456789', 'Student@123', 'student', TRUE, 'EV-2026-1042', '2010-05-15', 'Male')
ON CONFLICT (email) DO NOTHING;

-- 3. Courses Table
CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) REFERENCES tenants(id) DEFAULT 'default-campus',
    title VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    category VARCHAR(100),
    trailer_url TEXT,
    price DECIMAL(10,2) DEFAULT 0.00,
    created_by INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert Sample Courses
INSERT INTO courses (tenant_id, title, code, category, price) VALUES
('default-campus', '10th Standard Mathematics & Geometry', 'MATH-10', 'Academics', 0.00),
('default-campus', 'Physical Science & Practical Physics', 'SCI-10', 'Academics', 0.00),
('default-campus', 'Full-Stack Web Development & React', 'DEV-101', 'Certifications', 1499.00),
('default-campus', 'AI & Machine Learning Foundations', 'AI-201', 'Certifications', 1999.00);

-- 4. Enrollments Table
CREATE TABLE IF NOT EXISTS enrollments (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) REFERENCES tenants(id) DEFAULT 'default-campus',
    student_id INT REFERENCES users(id),
    course_id INT REFERENCES courses(id),
    payment_status VARCHAR(20) DEFAULT 'COMPLETED',
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Live Classes & Timetable Table
CREATE TABLE IF NOT EXISTS live_classes (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) REFERENCES tenants(id) DEFAULT 'default-campus',
    course_id INT REFERENCES courses(id),
    faculty_id INT REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    scheduled_at TIMESTAMP NOT NULL,
    zoom_meet_url TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'SCHEDULED'
);

-- Seed Sample Live Zoom Class
INSERT INTO live_classes (tenant_id, title, scheduled_at, zoom_meet_url, status)
VALUES ('default-campus', '10th Standard Mathematics Live Class', CURRENT_TIMESTAMP, 'https://zoom.us/j/1234567890', 'LIVE');

-- 6. Digital Library Documents Table
CREATE TABLE IF NOT EXISTS elibrary_docs (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) REFERENCES tenants(id) DEFAULT 'default-campus',
    title VARCHAR(255) NOT NULL,
    doc_type VARCHAR(10) CHECK (doc_type IN ('pdf', 'ppt', 'doc')),
    file_url TEXT NOT NULL,
    uploaded_by INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Sample E-Library Document
INSERT INTO elibrary_docs (tenant_id, title, doc_type, file_url)
VALUES ('default-campus', 'Module 3: Relational Algebra & Normalization Notes', 'pdf', 'https://example.com/notes.pdf');

-- 7. Events Table
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) REFERENCES tenants(id) DEFAULT 'default-campus',
    title VARCHAR(255) NOT NULL,
    category VARCHAR(20) CHECK (category IN ('sports', 'cultural')),
    venue VARCHAR(255),
    event_date TIMESTAMP NOT NULL
);

-- Seed Sample Event
INSERT INTO events (tenant_id, title, category, venue, event_date)
VALUES ('default-campus', 'Annual Inter-College Cricket Championship 2026', 'sports', 'Main Campus Ground', '2026-08-05 09:00:00');
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tenants Table (White-Labeling & Multi-Tenancy)
CREATE TABLE IF NOT EXISTS tenants (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) UNIQUE,
    logo_url TEXT,
    primary_color VARCHAR(10) DEFAULT '#0F1E3D',
    secondary_color VARCHAR(10) DEFAULT '#B8842E',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert Default Campus
INSERT INTO tenants (id, name, domain) 
VALUES ('default-campus', 'e-Vidyalaya Central Campus', 'campus.evidyalaya.com')
ON CONFLICT (id) DO NOTHING;

-- 2. Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) REFERENCES tenants(id) DEFAULT 'default-campus',
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('student', 'faculty', 'admin')) DEFAULT 'student',
    grade_level VARCHAR(50) DEFAULT 'Class 10',
    admission_no VARCHAR(50),
    dob DATE,
    gender VARCHAR(10),
    is_approved BOOLEAN DEFAULT FALSE, -- Admin approval required for faculty
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert Sample Users
INSERT INTO users (tenant_id, name, email, phone, password_hash, role, is_approved, admission_no)
VALUES 
('default-campus', 'System Administrator', 'admin@evidyalaya.com', '9999999999', 'Admin@123', 'admin', TRUE, 'ADM-001'),
('default-campus', 'Prof. R. Sharma', 'sharma@evidyalaya.com', '9876543210', 'Faculty@123', 'faculty', TRUE, 'FAC-101'),
('default-campus', 'Dr. K. Varma', 'varma@evidyalaya.com', '9876543211', 'Faculty@123', 'faculty', FALSE, 'FAC-102'), -- Pending Approval
('default-campus', 'Rahul Sharma', 'rahul@student.com', '9123456789', 'Student@123', 'student', TRUE, 'EV-2026-1042')
ON CONFLICT (email) DO NOTHING;

-- 3. Live Classes Table (Faculty Scheduling)
CREATE TABLE IF NOT EXISTS live_classes (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) REFERENCES tenants(id) DEFAULT 'default-campus',
    title VARCHAR(255) NOT NULL,
    course_code VARCHAR(50) NOT NULL,
    faculty_id INT REFERENCES users(id),
    scheduled_at TIMESTAMP NOT NULL,
    zoom_meet_url TEXT NOT NULL,
    status VARCHAR(20) CHECK (status IN ('Live', 'Upcoming', 'Completed')) DEFAULT 'Upcoming',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert Sample Live Class
INSERT INTO live_classes (tenant_id, title, course_code, faculty_id, scheduled_at, zoom_meet_url, status)
VALUES ('default-campus', '10th Standard Mathematics — Geometry & Theorems', 'MATH-10', 2, CURRENT_TIMESTAMP, 'https://zoom.us/j/1234567890', 'Live');

-- 4. E-Library Documents Table (Faculty Uploads)
CREATE TABLE IF NOT EXISTS elibrary_docs (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) REFERENCES tenants(id) DEFAULT 'default-campus',
    title VARCHAR(255) NOT NULL,
    doc_type VARCHAR(20) CHECK (doc_type IN ('pdf', 'ppt', 'trailer')),
    file_url TEXT NOT NULL,
    uploaded_by INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Student Roster & Group Mapping Table
CREATE TABLE IF NOT EXISTS student_roster_mapping (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) REFERENCES tenants(id) DEFAULT 'default-campus',
    student_id INT REFERENCES users(id),
    payment_status VARCHAR(20) DEFAULT 'Paid',
    attendance_rate VARCHAR(10) DEFAULT '90%',
    assigned_group VARCHAR(100) DEFAULT 'General Science'
);

-- Insert Sample Roster Data
INSERT INTO student_roster_mapping (student_id, payment_status, attendance_rate, assigned_group)
VALUES (4, 'Paid', '94%', 'Advanced Mathematics');
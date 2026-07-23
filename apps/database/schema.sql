-- Create database
CREATE DATABASE evidyalaya;
\c evidyalaya;

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  tenant_id VARCHAR(100) NOT NULL DEFAULT 'default-campus',
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  phone VARCHAR(20),
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'faculty', 'admin')),
  grade_level VARCHAR(50) DEFAULT 'Grade 5',
  dob DATE,
  state VARCHAR(100),
  city VARCHAR(100),
  pincode VARCHAR(20),
  address TEXT,
  guardian_name VARCHAR(150),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. COURSES TABLE
CREATE TABLE IF NOT EXISTS courses (
  id SERIAL PRIMARY KEY,
  tenant_id VARCHAR(100) NOT NULL DEFAULT 'default-campus',
  code VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  grade_level VARCHAR(50) NOT NULL,
  faculty_id INT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. ENROLLMENTS TABLE
CREATE TABLE IF NOT EXISTS enrollments (
  id SERIAL PRIMARY KEY,
  tenant_id VARCHAR(100) NOT NULL DEFAULT 'default-campus',
  student_id INT REFERENCES users(id) ON DELETE CASCADE,
  course_id INT REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(student_id, course_id)
);

-- 4. TIMETABLE SCHEDULES TABLE
CREATE TABLE IF NOT EXISTS schedules (
  id SERIAL PRIMARY KEY,
  tenant_id VARCHAR(100) NOT NULL DEFAULT 'default-campus',
  course_id INT REFERENCES courses(id) ON DELETE CASCADE,
  faculty_id INT REFERENCES users(id),
  day_of_week VARCHAR(20) NOT NULL,
  start_time VARCHAR(20) NOT NULL,
  end_time VARCHAR(20) NOT NULL,
  meeting_link TEXT DEFAULT 'https://zoom.us',
  zoom_meeting_id VARCHAR(100) DEFAULT '855 5123 4567',
  zoom_passcode VARCHAR(50) DEFAULT 'EV2026CLASS'
);

-- 5. ATTENDANCE METRICS TABLE
CREATE TABLE IF NOT EXISTS attendance (
  id SERIAL PRIMARY KEY,
  tenant_id VARCHAR(100) NOT NULL DEFAULT 'default-campus',
  student_id INT REFERENCES users(id),
  course_id INT REFERENCES courses(id),
  attended_classes INT DEFAULT 0,
  total_classes INT DEFAULT 0
);

-- 6. SUPPORT TICKETS TABLE
CREATE TABLE IF NOT EXISTS support_tickets (
  id SERIAL PRIMARY KEY,
  tenant_id VARCHAR(100) NOT NULL DEFAULT 'default-campus',
  student_id INT REFERENCES users(id),
  message TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'OPEN',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- SQL Schema for Senyum INN Kost Management System

-- 1. Rooms Table
CREATE TABLE rooms (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'NORMAL', -- NORMAL, COMPLAINT, REPAIR, FINISHED
    complaint_id VARCHAR(50),
    last_update DATE DEFAULT CURRENT_DATE,
    last_service DATE,
    specs JSONB, -- Stores type, size, bed, electricity, facilities
    is_occupied BOOLEAN DEFAULT FALSE,
    tenant_name VARCHAR(100),
    entry_date DATE
);

-- 2. Tenants Table
CREATE TABLE tenants (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    id_card_number VARCHAR(50),
    address TEXT,
    room_id INTEGER REFERENCES rooms(id),
    entry_date DATE NOT NULL,
    leave_date DATE,
    monthly_rent NUMERIC(12, 2) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    gender VARCHAR(20), -- Laki-laki, Perempuan
    occupation VARCHAR(100),
    emergency_name VARCHAR(100),
    emergency_phone VARCHAR(20)
);

-- 3. Staff Table
CREATE TABLE staff (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(50), -- Admin, Teknisi, Kebersihan, Keamanan, Lainnya
    shift VARCHAR(20), -- Pagi, Sore-Pagi
    shift_start_time TIME DEFAULT '07:00',
    shift_end_time TIME DEFAULT '15:00',
    discipline_allowance NUMERIC(12, 2) DEFAULT 300000,
    phone VARCHAR(20),
    id_card_number VARCHAR(50),
    address TEXT,
    bank_name VARCHAR(50),
    account_number VARCHAR(50),
    emergency_name VARCHAR(100),
    emergency_phone VARCHAR(20),
    salary NUMERIC(12, 2) DEFAULT 0,
    join_date DATE DEFAULT CURRENT_DATE
);

-- 4. Attendance Table
CREATE TABLE attendance (
    id SERIAL PRIMARY KEY,
    staff_id VARCHAR(50) REFERENCES staff(id) ON DELETE CASCADE,
    attendance_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL, -- Hadir, Izin, Sakit, Alpa, Libur, Lembur Minggu
    clock_in_time TIME,
    clock_out_time TIME,
    photo_url TEXT,
    location_lat NUMERIC(10, 7),
    location_lng NUMERIC(10, 7),
    is_late_approved BOOLEAN DEFAULT FALSE,
    penalty_amount NUMERIC(12, 2) DEFAULT 0,
    UNIQUE(staff_id, attendance_date)
);

-- 5. Complaints Table
CREATE TABLE complaints (
    id VARCHAR(50) PRIMARY KEY,
    location_type VARCHAR(20) NOT NULL, -- Room, Fasum
    room_id INTEGER REFERENCES rooms(id),
    location_name VARCHAR(100),
    type VARCHAR(50), -- Air, Listrik, Bangunan, dll
    description TEXT,
    complaint_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'Baru', -- Baru, Proses, Selesai
    technician VARCHAR(100),
    start_date DATE,
    finished_date DATE,
    notes TEXT,
    cost NUMERIC(12, 2) DEFAULT 0
);

-- 6. Weekly Service Logs
CREATE TABLE weekly_service_logs (
    id VARCHAR(50) PRIMARY KEY,
    room_id INTEGER REFERENCES rooms(id),
    service_date DATE DEFAULT CURRENT_DATE,
    staff_name VARCHAR(100),
    mattress_status VARCHAR(20), -- Baik, Masalah
    accessories_status VARCHAR(20), -- Baik, Masalah
    bathroom_status VARCHAR(20), -- Baik, Masalah
    cleanliness_status VARCHAR(20), -- Baik, Masalah
    notes TEXT,
    auto_ticket_id VARCHAR(50)
);

-- 7. Finance Transactions
CREATE TABLE finance_transactions (
    id VARCHAR(50) PRIMARY KEY,
    transaction_type VARCHAR(10) NOT NULL, -- In, Out
    category VARCHAR(50),
    amount NUMERIC(15, 2) NOT NULL,
    transaction_date DATE DEFAULT CURRENT_DATE,
    description TEXT,
    reference_id VARCHAR(50),
    source VARCHAR(50) -- A, B, etc.
);

-- 8. Operational Reminders
CREATE TABLE operational_reminders (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    reminder_date DATE NOT NULL,
    reminder_type VARCHAR(50), -- WiFi, PLN, Sosial, dll
    description TEXT,
    amount NUMERIC(12, 2),
    status VARCHAR(20) DEFAULT 'Terjadwal', -- Terjadwal, Lunas
    recurrence VARCHAR(20) DEFAULT 'None', -- None, Monthly, BiMonthly, Weekly
    recurrence_pattern JSONB,
    completed_by VARCHAR(100),
    completed_date DATE
);

-- Initial Data for Rooms (12 Rooms as per constants.tsx)
INSERT INTO rooms (name, status, specs) VALUES 
('Kamar 1', 'NORMAL', '{"type": "Executive Suite", "size": "4 x 5 m", "bed": "King Size (180x200)", "electricity": "2200 VA", "facilities": ["Smart TV 43\"", "AC 1 PK", "Water Heater", "WiFi", "Mini Fridge"]}'),
('Kamar 2', 'NORMAL', '{"type": "Deluxe Room", "size": "3 x 4 m", "bed": "Queen Size (160x200)", "electricity": "1300 VA", "facilities": ["Smart TV 43\"", "AC 1 PK", "Water Heater", "WiFi", "Mini Fridge"]}'),
('Kamar 3', 'NORMAL', '{"type": "Deluxe Room", "size": "3 x 4 m", "bed": "Queen Size (160x200)", "electricity": "1300 VA", "facilities": ["Smart TV 43\"", "AC 1 PK", "Water Heater", "WiFi", "Mini Fridge"]}'),
('Kamar 4', 'NORMAL', '{"type": "Executive Suite", "size": "4 x 5 m", "bed": "King Size (180x200)", "electricity": "2200 VA", "facilities": ["Smart TV 43\"", "AC 1 PK", "Water Heater", "WiFi", "Mini Fridge"]}'),
('Kamar 5', 'NORMAL', '{"type": "Deluxe Room", "size": "3 x 4 m", "bed": "Queen Size (160x200)", "electricity": "1300 VA", "facilities": ["Smart TV 43\"", "AC 1 PK", "Water Heater", "WiFi", "Mini Fridge"]}'),
('Kamar 6', 'NORMAL', '{"type": "Deluxe Room", "size": "3 x 4 m", "bed": "Queen Size (160x200)", "electricity": "1300 VA", "facilities": ["Smart TV 43\"", "AC 1 PK", "Water Heater", "WiFi", "Mini Fridge"]}'),
('Kamar 7', 'NORMAL', '{"type": "Executive Suite", "size": "4 x 5 m", "bed": "King Size (180x200)", "electricity": "2200 VA", "facilities": ["Smart TV 43\"", "AC 1 PK", "Water Heater", "WiFi", "Mini Fridge"]}'),
('Kamar 8', 'NORMAL', '{"type": "Deluxe Room", "size": "3 x 4 m", "bed": "Queen Size (160x200)", "electricity": "1300 VA", "facilities": ["Smart TV 43\"", "AC 1 PK", "Water Heater", "WiFi", "Mini Fridge"]}'),
('Kamar 9', 'NORMAL', '{"type": "Deluxe Room", "size": "3 x 4 m", "bed": "Queen Size (160x200)", "electricity": "1300 VA", "facilities": ["Smart TV 43\"", "AC 1 PK", "Water Heater", "WiFi", "Mini Fridge"]}'),
('Kamar 10', 'NORMAL', '{"type": "Executive Suite", "size": "4 x 5 m", "bed": "King Size (180x200)", "electricity": "2200 VA", "facilities": ["Smart TV 43\"", "AC 1 PK", "Water Heater", "WiFi", "Mini Fridge"]}'),
('Kamar 11', 'NORMAL', '{"type": "Deluxe Room", "size": "3 x 4 m", "bed": "Queen Size (160x200)", "electricity": "1300 VA", "facilities": ["Smart TV 43\"", "AC 1 PK", "Water Heater", "WiFi", "Mini Fridge"]}'),
('Kamar 12', 'NORMAL', '{"type": "Deluxe Room", "size": "3 x 4 m", "bed": "Queen Size (160x200)", "electricity": "1300 VA", "facilities": ["Smart TV 43\"", "AC 1 PK", "Water Heater", "WiFi", "Mini Fridge"]}');

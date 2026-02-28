-- ==========================================
-- SKRIP DATABASE UNTUK SENYUMINN KOST
-- Jalankan skrip ini sekaligus di SQL Editor Supabase
-- ==========================================

-- 1. Buat Tabel Kamar (Rooms)
CREATE TABLE IF NOT EXISTS rooms (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    status TEXT DEFAULT 'NORMAL',
    "complaintId" TEXT,
    "lastUpdate" DATE DEFAULT CURRENT_DATE,
    "lastService" DATE,
    specs JSONB DEFAULT '{}',
    "isOccupied" BOOLEAN DEFAULT FALSE,
    "tenantName" TEXT,
    "entryDate" DATE
);

-- 2. Buat Tabel Penghuni (Tenants)
CREATE TABLE IF NOT EXISTS tenants (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    "idCardNumber" TEXT,
    address TEXT,
    "roomId" INTEGER REFERENCES rooms(id),
    "entryDate" DATE,
    "leaveDate" DATE,
    "monthlyRent" NUMERIC DEFAULT 0,
    "isActive" BOOLEAN DEFAULT TRUE,
    gender TEXT,
    occupation TEXT,
    "emergencyName" TEXT,
    "emergencyPhone" TEXT
);

-- 3. Buat Tabel Keluhan (Complaints)
CREATE TABLE IF NOT EXISTS complaints (
    id TEXT PRIMARY KEY,
    "locationType" TEXT NOT NULL,
    "roomId" INTEGER REFERENCES rooms(id),
    "locationName" TEXT NOT NULL,
    type TEXT NOT NULL,
    description TEXT,
    date DATE DEFAULT CURRENT_DATE,
    status TEXT DEFAULT 'Baru',
    technician TEXT,
    "startDate" DATE,
    "finishedDate" DATE,
    notes TEXT,
    cost NUMERIC DEFAULT 0
);

-- 4. Buat Tabel Staf (Staff)
CREATE TABLE IF NOT EXISTS staff (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT,
    shift TEXT,
    "shiftStartTime" TEXT,
    "shiftEndTime" TEXT,
    "disciplineAllowance" NUMERIC DEFAULT 0,
    phone TEXT,
    "idCardNumber" TEXT,
    address TEXT,
    "bankName" TEXT,
    "accountNumber" TEXT,
    "emergencyName" TEXT,
    "emergencyPhone" TEXT,
    salary NUMERIC DEFAULT 0,
    "joinDate" DATE,
    attendance JSONB DEFAULT '{}'
);

-- 5. Buat Tabel Keuangan (Finance)
CREATE TABLE IF NOT EXISTS finance (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    category TEXT,
    amount NUMERIC NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    description TEXT,
    "referenceId" TEXT,
    source TEXT
);

-- 6. Buat Tabel Pengingat (Reminders)
CREATE TABLE IF NOT EXISTS reminders (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    date DATE NOT NULL,
    type TEXT,
    description TEXT,
    amount NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'Terjadwal',
    recurrence TEXT DEFAULT 'None',
    "recurrencePattern" JSONB,
    "completedBy" TEXT,
    "completedDate" DATE
);

-- 7. Masukkan Data Awal Kamar (1-12)
INSERT INTO rooms (id, name, status, "isOccupied", specs)
VALUES 
(1, 'Kamar 1', 'NORMAL', false, '{"type": "Executive Suite", "size": "4 x 5 m", "bed": "King Size", "electricity": "2200 VA", "facilities": ["TV", "AC", "WiFi"]}'),
(2, 'Kamar 2', 'NORMAL', false, '{"type": "Deluxe Room", "size": "3 x 4 m", "bed": "Queen Size", "electricity": "1300 VA", "facilities": ["TV", "AC", "WiFi"]}'),
(3, 'Kamar 3', 'NORMAL', false, '{"type": "Deluxe Room", "size": "3 x 4 m", "bed": "Queen Size", "electricity": "1300 VA", "facilities": ["TV", "AC", "WiFi"]}'),
(4, 'Kamar 4', 'NORMAL', false, '{"type": "Executive Suite", "size": "4 x 5 m", "bed": "King Size", "electricity": "2200 VA", "facilities": ["TV", "AC", "WiFi"]}'),
(5, 'Kamar 5', 'NORMAL', false, '{"type": "Deluxe Room", "size": "3 x 4 m", "bed": "Queen Size", "electricity": "1300 VA", "facilities": ["TV", "AC", "WiFi"]}'),
(6, 'Kamar 6', 'NORMAL', false, '{"type": "Deluxe Room", "size": "3 x 4 m", "bed": "Queen Size", "electricity": "1300 VA", "facilities": ["TV", "AC", "WiFi"]}'),
(7, 'Kamar 7', 'NORMAL', false, '{"type": "Executive Suite", "size": "4 x 5 m", "bed": "King Size", "electricity": "2200 VA", "facilities": ["TV", "AC", "WiFi"]}'),
(8, 'Kamar 8', 'NORMAL', false, '{"type": "Deluxe Room", "size": "3 x 4 m", "bed": "Queen Size", "electricity": "1300 VA", "facilities": ["TV", "AC", "WiFi"]}'),
(9, 'Kamar 9', 'NORMAL', false, '{"type": "Deluxe Room", "size": "3 x 4 m", "bed": "Queen Size", "electricity": "1300 VA", "facilities": ["TV", "AC", "WiFi"]}'),
(10, 'Kamar 10', 'NORMAL', false, '{"type": "Executive Suite", "size": "4 x 5 m", "bed": "King Size", "electricity": "2200 VA", "facilities": ["TV", "AC", "WiFi"]}'),
(11, 'Kamar 11', 'NORMAL', false, '{"type": "Deluxe Room", "size": "3 x 4 m", "bed": "Queen Size", "electricity": "1300 VA", "facilities": ["TV", "AC", "WiFi"]}'),
(12, 'Kamar 12', 'NORMAL', false, '{"type": "Deluxe Room", "size": "3 x 4 m", "bed": "Queen Size", "electricity": "1300 VA", "facilities": ["TV", "AC", "WiFi"]}')
ON CONFLICT (id) DO NOTHING;

-- 8. Contoh Data Penghuni (Opsional, untuk testing)
INSERT INTO tenants (id, name, phone, "idCardNumber", address, "roomId", "entryDate", "monthlyRent", "isActive", gender, occupation, "emergencyName", "emergencyPhone")
VALUES
('t1', 'Budi Santoso', '08123456789', '1234567890', 'Jl. Contoh No. 1', 1, '2026-01-01', 1500000, true, 'Laki-laki', 'Karyawan', 'Siti', '08129999888'),
('t2', 'Sari Wijaya', '08128888777', '0987654321', 'Jl. Melati No. 5', 2, '2026-02-15', 1500000, true, 'Perempuan', 'Mahasiswi', 'Bambang', '08127777666')
ON CONFLICT (id) DO NOTHING;

-- 9. Update status kamar agar sinkron dengan data penghuni di atas
UPDATE rooms SET "isOccupied" = true, "tenantName" = 'Budi Santoso', "entryDate" = '2026-01-01' WHERE id = 1;
UPDATE rooms SET "isOccupied" = true, "tenantName" = 'Sari Wijaya', "entryDate" = '2026-02-15' WHERE id = 2;

-- 10. Matikan RLS (Row Level Security) agar aplikasi bisa langsung akses
ALTER TABLE rooms DISABLE ROW LEVEL SECURITY;
ALTER TABLE complaints DISABLE ROW LEVEL SECURITY;
ALTER TABLE tenants DISABLE ROW LEVEL SECURITY;
ALTER TABLE staff DISABLE ROW LEVEL SECURITY;
ALTER TABLE finance DISABLE ROW LEVEL SECURITY;
ALTER TABLE reminders DISABLE ROW LEVEL SECURITY;

-- SQL Schema untuk Supabase - Senyum INN Kost Exclusive
-- Jalankan ini di SQL Editor Supabase Anda

-- 1. Tabel Rooms
CREATE TABLE IF NOT EXISTS rooms (
  id INT PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT NOT NULL,
  "complaintId" TEXT,
  "lastUpdate" DATE NOT NULL,
  "lastService" DATE,
  specs JSONB NOT NULL,
  "isOccupied" BOOLEAN DEFAULT FALSE,
  "tenantName" TEXT,
  "entryDate" DATE
);

-- 2. Tabel Complaints
CREATE TABLE IF NOT EXISTS complaints (
  id TEXT PRIMARY KEY,
  "locationType" TEXT NOT NULL,
  "roomId" INT,
  "locationName" TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  date DATE NOT NULL,
  status TEXT NOT NULL,
  technician TEXT,
  "startDate" DATE,
  "finishedDate" DATE,
  notes TEXT,
  cost INT
);

-- 3. Tabel Tenants
CREATE TABLE IF NOT EXISTS tenants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  "idCardNumber" TEXT NOT NULL,
  address TEXT NOT NULL,
  "roomId" INT NOT NULL,
  "entryDate" DATE NOT NULL,
  "leaveDate" DATE,
  "monthlyRent" INT NOT NULL,
  "isActive" BOOLEAN DEFAULT TRUE,
  gender TEXT NOT NULL,
  occupation TEXT NOT NULL,
  "emergencyName" TEXT NOT NULL,
  "emergencyPhone" TEXT NOT NULL
);

-- 4. Tabel Staff
CREATE TABLE IF NOT EXISTS staff (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  shift TEXT NOT NULL,
  "shiftStartTime" TEXT NOT NULL,
  "shiftEndTime" TEXT NOT NULL,
  "disciplineAllowance" INT NOT NULL,
  phone TEXT NOT NULL,
  "idCardNumber" TEXT NOT NULL,
  address TEXT NOT NULL,
  "bankName" TEXT NOT NULL,
  "accountNumber" TEXT NOT NULL,
  "emergencyName" TEXT NOT NULL,
  "emergencyPhone" TEXT NOT NULL,
  salary INT NOT NULL,
  "joinDate" DATE NOT NULL,
  attendance JSONB DEFAULT '{}'::jsonb
);

-- 5. Tabel Finance
CREATE TABLE IF NOT EXISTS finance (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  category TEXT NOT NULL,
  amount INT NOT NULL,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  "referenceId" TEXT,
  source TEXT NOT NULL
);

-- 6. Tabel Reminders
CREATE TABLE IF NOT EXISTS reminders (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  amount INT,
  status TEXT NOT NULL,
  recurrence TEXT NOT NULL,
  "recurrencePattern" JSONB,
  "completedBy" TEXT,
  "completedDate" DATE
);

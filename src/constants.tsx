import { RoomStatus, Room, Complaint, Tenant, Staff, FinanceTransaction } from './types';

// Tetap sediakan struktur kamar dasar tanpa penghuni
// Last Updated: 2026-02-27
export const INITIAL_ROOMS: Room[] = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  name: `Kamar ${i + 1}`,
  status: RoomStatus.NORMAL,
  lastUpdate: new Date().toISOString().split('T')[0],
  complaintId: undefined,
  isOccupied: false,
  tenantName: undefined,
  entryDate: undefined,
  specs: {
    type: i % 3 === 0 ? 'Executive Suite' : 'Deluxe Room',
    size: i % 3 === 0 ? '4 x 5 m' : '3 x 4 m',
    bed: i % 3 === 0 ? 'King Size (180x200)' : 'Queen Size (160x200)',
    electricity: i % 3 === 0 ? '2200 VA' : '1300 VA',
    facilities: ['Smart TV 43"', 'AC 1 PK', 'Water Heater', 'WiFi', 'Mini Fridge']
  }
}));

// Kosongkan data manajemen dan operasional
export const INITIAL_TENANTS: Tenant[] = [];
export const INITIAL_STAFF: Staff[] = [];
export const INITIAL_FINANCE: FinanceTransaction[] = [];
export const INITIAL_COMPLAINTS: Complaint[] = [];

export const FASUM_LIST = [
  "Dapur Bersama", 
  "Area Parkir", 
  "Kamar Mandi Umum", 
  "WiFi / Area Router", 
  "Atap / Jemuran", 
  "Tandon Air", 
  "CCTV System", 
  "Kantor Pengelola"
];
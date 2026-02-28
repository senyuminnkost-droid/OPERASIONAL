
export enum RoomStatus {
  NORMAL = 'NORMAL',
  COMPLAINT = 'COMPLAINT',
  REPAIR = 'REPAIR',
  FINISHED = 'FINISHED'
}

export enum ComplaintType {
  AIR = 'Air',
  LISTRIK = 'Listrik',
  BANGUNAN = 'Bangunan',
  ELEKTRONIK = 'Elektronik',
  AKSESORIS_KM = 'Aksesoris Kamar Mandi',
  LEMARI = 'Lemari',
  KABINET = 'Kabinet',
  LAINNYA = 'Lainnya',
  ROUTINE_AC = 'Servis AC Rutin',
  ROUTINE_CLEAN = 'Pembersihan Rutin'
}

export interface Complaint {
  id: string;
  locationType: 'Room' | 'Fasum';
  roomId?: number;
  locationName: string;
  type: ComplaintType;
  description: string;
  date: string;
  status: 'Baru' | 'Proses' | 'Selesai';
  technician?: string;
  startDate?: string;
  finishedDate?: string;
  notes?: string;
  cost?: number;
}

export interface WeeklyServiceLog {
  id: string;
  roomId: number;
  date: string;
  staffName: string;
  checks: {
    mattress: 'Baik' | 'Masalah';
    accessories: 'Baik' | 'Masalah';
    bathroom: 'Baik' | 'Masalah';
    cleanliness: 'Baik' | 'Masalah';
  };
  notes: string;
  autoTicketId?: string;
}

export interface AttendanceRecord {
  status: 'Hadir' | 'Izin' | 'Sakit' | 'Alpa' | 'Libur' | 'Lembur Minggu';
  clockInTime?: string;
  clockOutTime?: string;
  photo?: string;
  location?: { lat: number; lng: number };
  isLateApproved?: boolean;
  penaltyAmount?: number;
}

export interface Staff {
  id: string;
  name: string;
  role: 'Admin' | 'Teknisi' | 'Kebersihan' | 'Keamanan' | 'Lainnya';
  shift: 'Pagi' | 'Sore-Pagi';
  shiftStartTime: string; // Format "HH:mm"
  shiftEndTime: string;   // Format "HH:mm"
  disciplineAllowance: number;
  phone: string;
  idCardNumber: string;
  address: string;
  bankName: string;
  accountNumber: string;
  emergencyName: string;
  emergencyPhone: string;
  salary: number;
  joinDate: string;
  attendance?: Record<string, AttendanceRecord>;
}

export interface Room {
  id: number;
  name: string;
  status: RoomStatus;
  complaintId?: string;
  lastUpdate: string;
  lastService?: string;
  specs: any;
  isOccupied: boolean;
  tenantName?: string;
  entryDate?: string;
}

export interface Tenant {
  id: string;
  name: string;
  phone: string;
  idCardNumber: string;
  address: string;
  roomId: number;
  entryDate: string;
  leaveDate?: string;
  monthlyRent: number;
  isActive: boolean;
  gender: 'Laki-laki' | 'Perempuan';
  occupation: string;
  emergencyName: string;
  emergencyPhone: string;
}

export interface FinanceTransaction {
  id: string;
  type: 'In' | 'Out';
  category: string;
  amount: number;
  date: string;
  description: string;
  referenceId?: string;
  source: string;
}

export interface OperationalReminder {
  id: string;
  title: string;
  date: string;
  type: 'WiFi' | 'PLN' | 'Sosial' | 'Pajak' | 'Gaji' | 'Pcash' | 'Sampah' | 'AC' | 'Lainnya';
  description: string;
  amount?: number;
  status: 'Terjadwal' | 'Lunas';
  recurrence: 'None' | 'Monthly' | 'BiMonthly' | 'Weekly';
  recurrencePattern?: {
    dayOfMonth?: number;
    dayOfWeek?: number;
    weekOfMonth?: number;
  };
  completedBy?: string; 
  completedDate?: string;
}

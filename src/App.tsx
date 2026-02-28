
/**
 * SENYUMINN KOST EXCLUSIVE PUNGGAWAN - Management System
 * Version: 1.2.1
 * Last Updated: 2026-02-27
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Room, Complaint, RoomStatus, Tenant, Staff, FinanceTransaction, OperationalReminder, WeeklyServiceLog, ComplaintType, AttendanceRecord } from './types';
import { INITIAL_ROOMS, INITIAL_COMPLAINTS, INITIAL_TENANTS, INITIAL_STAFF, INITIAL_FINANCE } from './constants';
import Dashboard from './components/Dashboard';
import ComplaintInput from './components/ComplaintInput';
import History from './components/History';
import Report from './components/Report';
import CalendarReport from './components/CalendarReport';
import ComplaintManagement from './components/ComplaintManagement';
import CalendarView from './components/CalendarView';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Finance from './components/Finance';
import TenantManagement from './components/TenantManagement';
import StaffManagement from './components/StaffManagement';
import WeeklyService from './components/WeeklyService';
import Attendance from './components/Attendance';
import { getGeminiInsights } from './services/geminiService';
import { dataService } from './services/dataService';

const DEFAULT_REMINDERS: OperationalReminder[] = [
  { id: 'R1', title: 'Tagihan Listrik (PLN)', date: '2024-01-04', type: 'PLN', description: 'Pembayaran rutin listrik bulanan', amount: 0, status: 'Terjadwal', recurrence: 'Monthly', recurrencePattern: { dayOfMonth: 4 } },
  { id: 'R2', title: 'Tagihan WiFi', date: '2024-01-04', type: 'WiFi', description: 'Pembayaran langganan internet kost', amount: 0, status: 'Terjadwal', recurrence: 'Monthly', recurrencePattern: { dayOfMonth: 4 } },
  { id: 'R3', title: 'Dana Sosial', date: '2024-01-04', type: 'Sosial', description: 'Iuran lingkungan warga', amount: 0, status: 'Terjadwal', recurrence: 'Monthly', recurrencePattern: { dayOfMonth: 4 } },
  { id: 'R4', title: 'Pettycash Kost', date: '2024-01-04', type: 'Pcash', description: 'Pengisian kas kecil operasional', amount: 0, status: 'Terjadwal', recurrence: 'Monthly', recurrencePattern: { dayOfMonth: 4 } },
  { id: 'R5', title: 'Iuran Sampah', date: '2024-01-29', type: 'Sampah', description: 'Kebersihan lingkungan', amount: 0, status: 'Terjadwal', recurrence: 'Monthly', recurrencePattern: { dayOfMonth: 29 } },
  { id: 'R6', title: 'Servis AC Rutin', date: '2024-01-14', type: 'AC', description: 'Servis berkala 2 bulan sekali (Minggu ke-2)', amount: 0, status: 'Terjadwal', recurrence: 'BiMonthly', recurrencePattern: { weekOfMonth: 2, dayOfWeek: 0 } },
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  
  const [rooms, setRooms] = useState<Room[]>(() => {
    const saved = localStorage.getItem('senyum_inn_rooms');
    return saved ? JSON.parse(saved) : INITIAL_ROOMS;
  });
  
  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    const saved = localStorage.getItem('senyum_inn_complaints');
    return saved ? JSON.parse(saved) : INITIAL_COMPLAINTS;
  });

  const [reminders, setReminders] = useState<OperationalReminder[]>(() => {
    const saved = localStorage.getItem('senyum_inn_reminders');
    return saved ? JSON.parse(saved) : DEFAULT_REMINDERS;
  });
  
  const [tenants, setTenants] = useState<Tenant[]>(() => {
    const saved = localStorage.getItem('senyum_inn_tenants');
    return saved ? JSON.parse(saved) : INITIAL_TENANTS;
  });
  
  const [staff, setStaff] = useState<Staff[]>(() => {
    const saved = localStorage.getItem('senyum_inn_staff');
    const data = saved ? JSON.parse(saved) : INITIAL_STAFF;
    // Migrasi data lama ke struktur baru jika perlu
    return data.map((s: any) => ({
      ...s,
      shiftStartTime: s.shiftStartTime || "07:00",
      shiftEndTime: s.shiftEndTime || "15:00",
      disciplineAllowance: s.disciplineAllowance || 300000
    }));
  });
  
  const [finance, setFinance] = useState<FinanceTransaction[]>(() => {
    const saved = localStorage.getItem('senyum_inn_finance');
    return saved ? JSON.parse(saved) : INITIAL_FINANCE;
  });
  
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('senyum_inn_darkmode') === 'true';
  });
  
  const [aiInsight, setAiInsight] = useState<string>('Menganalisis tren kost...');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from Supabase on mount
  useEffect(() => {
    const loadAllData = async () => {
      try {
        const [sRooms, sComplaints, sTenants, sStaff, sFinance, sReminders] = await Promise.all([
          dataService.getRooms(),
          dataService.getComplaints(),
          dataService.getTenants(),
          dataService.getStaff(),
          dataService.getFinance(),
          dataService.getReminders()
        ]);

        if (sRooms.length > 0) setRooms(sRooms);
        if (sComplaints.length > 0) setComplaints(sComplaints);
        if (sTenants.length > 0) setTenants(sTenants);
        if (sStaff.length > 0) setStaff(sStaff);
        if (sFinance.length > 0) setFinance(sFinance);
        if (sReminders.length > 0) setReminders(sReminders);
      } catch (error) {
        console.error('Gagal memuat data dari Supabase:', error);
        // Fallback to localStorage is already handled by initial state
      } finally {
        setIsLoading(false);
      }
    };

    loadAllData();
  }, []);

  useEffect(() => {
    localStorage.setItem('senyum_inn_rooms', JSON.stringify(rooms));
  }, [rooms]);

  useEffect(() => {
    localStorage.setItem('senyum_inn_complaints', JSON.stringify(complaints));
  }, [complaints]);

  useEffect(() => {
    localStorage.setItem('senyum_inn_reminders', JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    localStorage.setItem('senyum_inn_tenants', JSON.stringify(tenants));
  }, [tenants]);

  useEffect(() => {
    localStorage.setItem('senyum_inn_staff', JSON.stringify(staff));
  }, [staff]);

  useEffect(() => {
    localStorage.setItem('senyum_inn_finance', JSON.stringify(finance));
  }, [finance]);

  useEffect(() => {
    localStorage.setItem('senyum_inn_darkmode', isDarkMode.toString());
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  const fetchInsights = useCallback(async (currentComplaints: Complaint[]) => {
    if (currentComplaints.length === 0) {
      setAiInsight('Kost dalam kondisi prima. Belum ada keluhan terdeteksi.');
      return;
    }
    setIsAiLoading(true);
    try {
      const insight = await getGeminiInsights(currentComplaints);
      setAiInsight(insight || 'Sistem siap memantau keluhan operasional.');
    } catch (error) {
      setAiInsight('Gagal memuat analisis cerdas Gemini.');
    } finally {
      setIsAiLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInsights(complaints);
  }, [complaints, fetchInsights]);

  const resetAllData = () => {
    if (window.confirm("PERINGATAN: Apakah Anda yakin ingin menghapus SEMUA data?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleWeeklyServiceSubmit = async (log: WeeklyServiceLog) => {
    const hasIssue = Object.values(log.checks).some(v => v === 'Masalah');
    const today = new Date().toISOString().split('T')[0];

    const updatedRooms = rooms.map(r => {
      if (r.id === log.roomId) {
        const updates = {
          lastService: today,
          status: hasIssue ? RoomStatus.COMPLAINT : r.status,
          lastUpdate: today
        };
        dataService.updateRoom(r.id, updates).catch(console.error);
        return { ...r, ...updates };
      }
      return r;
    });
    setRooms(updatedRooms);

    if (hasIssue) {
      const newComplaint: Complaint = {
        id: `AUTO-${Math.random().toString(36).substring(7).toUpperCase()}`,
        locationType: 'Room',
        roomId: log.roomId,
        locationName: `Kamar ${log.roomId}`,
        type: ComplaintType.LAINNYA,
        description: `TEMUAN WEEKLY SERVICE: ${log.notes || 'Cek kondisi aset'}`,
        date: today,
        status: 'Baru'
      };
      setComplaints(prev => [newComplaint, ...prev]);
      dataService.addComplaint(newComplaint).catch(console.error);
    }
    setActiveTab('dashboard');
  };

  const handleUpdateAttendance = (staffId: string, record: AttendanceRecord) => {
    const today = new Date().toISOString().split('T')[0];
    setStaff(prev => prev.map(s => {
      if (s.id === staffId) {
        const newAttendance = { ...(s.attendance || {}), [today]: record };
        const updatedStaff = { ...s, attendance: newAttendance };
        dataService.updateStaff(staffId, { attendance: newAttendance }).catch(console.error);
        return updatedStaff;
      }
      return s;
    }));
  };

  const handleAddReminder = (reminder: OperationalReminder) => {
    setReminders([reminder, ...reminders]);
    dataService.addReminder(reminder).catch(console.error);
  };

  const handleCompleteReminder = (reminder: OperationalReminder, amount: number, staffName: string, notes: string) => {
    const isPayment = ['PLN', 'WiFi', 'Sampah', 'Sosial', 'Pcash', 'AC'].includes(reminder.type);
    if (isPayment) {
      const newTransaction: FinanceTransaction = {
        id: `EXP-${Math.random().toString(36).substring(7).toUpperCase()}`,
        type: 'Out',
        category: reminder.type === 'AC' ? 'Maintenance' : 'Operasional',
        amount: amount || 0,
        date: new Date().toISOString().split('T')[0],
        description: `Pelunasan: ${reminder.title} (Petugas: ${staffName})${notes ? ' - ' + notes : ''}`,
        source: 'A' 
      };
      setFinance([newTransaction, ...finance]);
      dataService.addFinance(newTransaction).catch(console.error);
    }
    
    const updatedReminders = reminders.map(r => r.id === reminder.id ? { 
      ...r, 
      status: 'Lunas' as const, 
      completedBy: staffName, 
      completedDate: new Date().toISOString().split('T')[0] 
    } : r);
    setReminders(updatedReminders);
    dataService.updateReminder(reminder.id, { 
      status: 'Lunas', 
      completedBy: staffName, 
      completedDate: new Date().toISOString().split('T')[0] 
    }).catch(console.error);
  };

  const handleAddTenant = (newTenant: Tenant) => {
    setTenants([newTenant, ...tenants]);
    dataService.addTenant(newTenant).catch(console.error);
    
    const updatedRooms = rooms.map(r => {
      if (r.id === newTenant.roomId) {
        const updates = { isOccupied: true, tenantName: newTenant.name, entryDate: newTenant.entryDate, status: RoomStatus.NORMAL };
        dataService.updateRoom(r.id, updates).catch(console.error);
        return { ...r, ...updates };
      }
      return r;
    });
    setRooms(updatedRooms);
  };

  const handleUpdateTenant = (tenantId: string, updates: Partial<Tenant>) => {
    setTenants(prev => prev.map(t => t.id === tenantId ? { ...t, ...updates } : t));
    dataService.updateTenant(tenantId, updates).catch(console.error);
  };

  const addComplaint = (newComplaint: Complaint) => {
    const updatedComplaints = [newComplaint, ...complaints];
    setComplaints(updatedComplaints);
    dataService.addComplaint(newComplaint).catch(console.error);

    const updatedRooms = rooms.map(room => {
      if (room.id === newComplaint.roomId) {
        const updates = { status: RoomStatus.COMPLAINT, complaintId: newComplaint.id };
        dataService.updateRoom(room.id, updates).catch(console.error);
        return { ...room, ...updates };
      }
      return room;
    });
    setRooms(updatedRooms);
    setActiveTab('dashboard');
    fetchInsights(updatedComplaints);
  };

  const updateComplaintStatus = (id: string, updates: Partial<Complaint>) => {
    setComplaints(complaints.map(c => c.id === id ? { ...c, ...updates } : c));
    dataService.updateComplaint(id, updates).catch(console.error);
  };

  const updateRoom = (roomId: number, updates: Partial<Room>) => {
    setRooms(prev => prev.map(r => r.id === roomId ? { ...r, ...updates, lastUpdate: new Date().toISOString().split('T')[0] } : r));
    dataService.updateRoom(roomId, { ...updates, lastUpdate: new Date().toISOString().split('T')[0] }).catch(console.error);
  };

  const handleAddStaff = (newStaff: Staff) => {
    setStaff([newStaff, ...staff]);
    dataService.addStaff(newStaff).catch(console.error);
  };
  const handleUpdateStaff = (id: string, updates: Partial<Staff>) => {
    setStaff(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    dataService.updateStaff(id, updates).catch(console.error);
  };
  const handleAddFinance = (newTransaction: FinanceTransaction) => {
    setFinance([newTransaction, ...finance]);
    dataService.addFinance(newTransaction).catch(console.error);
  };

  const handleQuickPay = (tenantId: string) => {
    const tenant = tenants.find(t => t.id === tenantId);
    if (tenant) {
      const newTransaction: FinanceTransaction = {
        id: `PAY-${Math.random().toString(36).substring(7)}`,
        type: 'In', category: 'Sewa Kamar', amount: tenant.monthlyRent,
        date: new Date().toISOString().split('T')[0],
        description: `Pembayaran Sewa: ${tenant.name}`,
        referenceId: tenant.id, source: 'E'
      };
      handleAddFinance(newTransaction);
      alert(`Berhasil mencatat pembayaran dari ${tenant.name}!`);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard rooms={rooms} complaints={complaints} finance={finance} tenants={tenants} onAction={() => setActiveTab('actions')} aiInsight={aiInsight} isAiLoading={isAiLoading} onUpdateRoom={updateRoom} onQuickPay={handleQuickPay} />;
      case 'weekly-service': return <WeeklyService rooms={rooms} onServiceSubmit={handleWeeklyServiceSubmit} />;
      case 'attendance': return <Attendance staff={staff} onUpdateAttendance={handleUpdateAttendance} />;
      case 'input': return <ComplaintInput rooms={rooms} onSubmit={addComplaint} onCancel={() => setActiveTab('dashboard')} />;
      case 'history': return <History complaints={complaints} />;
      case 'actions': return <ComplaintManagement complaints={complaints} onUpdate={updateComplaintStatus} />;
      case 'calendar': return <CalendarView complaints={complaints} tenants={tenants} staff={staff} reminders={reminders} finance={finance} onAddReminder={handleAddReminder} onQuickPay={handleQuickPay} onCompleteReminder={handleCompleteReminder} />;
      case 'calendar-report': return <CalendarReport reminders={reminders} complaints={complaints} finance={finance} onBack={() => setActiveTab('calendar')} />;
      case 'report': return <Report complaints={complaints} onBack={() => setActiveTab('dashboard')} />;
      case 'finance': return <Finance transactions={finance} onAddTransaction={handleAddFinance} view="dashboard" />;
      case 'finance-journal': return <Finance transactions={finance} onAddTransaction={handleAddFinance} view="journal" />;
      case 'tenants': return <TenantManagement tenants={tenants} rooms={rooms} onAddTenant={handleAddTenant} onUpdateTenant={handleUpdateTenant} />;
      case 'staff': return <StaffManagement staff={staff} onAddStaff={handleAddStaff} onUpdateStaff={handleUpdateStaff} />;
      default: return <Dashboard rooms={rooms} complaints={complaints} finance={finance} tenants={tenants} onAction={() => setActiveTab('actions')} aiInsight={aiInsight} isAiLoading={isAiLoading} onUpdateRoom={updateRoom} onQuickPay={handleQuickPay} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-background-light dark:bg-background-dark text-[#111418] dark:text-white overflow-x-hidden w-full max-w-[100vw]">
      <Sidebar activeTab={activeTab} setActiveTab={(tab) => { setActiveTab(tab); setIsSidebarOpen(false); }} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onResetData={resetAllData} />
      <div className="flex-1 flex flex-col min-h-screen lg:ml-72 relative transition-all w-full max-w-full overflow-hidden">
        <Header activeTab={activeTab} isDarkMode={isDarkMode} onToggleDarkMode={() => setIsDarkMode(!isDarkMode)} onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto w-full max-w-full overflow-x-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-full bg-slate-50/50 backdrop-blur-sm">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                <p className="text-slate-600 font-medium">Memuat data dari cloud...</p>
              </div>
            </div>
          ) : (
            renderContent()
          )}
        </main>
      </div>
      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[45] lg:hidden" onClick={() => setIsSidebarOpen(false)} />}
    </div>
  );
};

export default App;

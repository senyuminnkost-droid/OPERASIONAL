
import React, { useState, useMemo } from 'react';
import { Complaint, ComplaintType, Tenant, Staff, OperationalReminder, FinanceTransaction } from '../types';
import { FASUM_LIST, INITIAL_ROOMS } from '../constants';

interface CalendarViewProps {
  complaints: Complaint[];
  tenants: Tenant[];
  staff: Staff[];
  reminders: OperationalReminder[];
  finance: FinanceTransaction[];
  onAddReminder: (r: OperationalReminder) => void;
  onQuickPay: (tenantId: string) => void;
  onCompleteReminder: (r: OperationalReminder, amount: number, staffName: string, notes: string) => void;
  onAddRoutineTasks?: (tasks: Complaint[]) => void;
}

interface OperationalEvent {
  id: string;
  title: string;
  date: string;
  type: 'Maintenance' | 'TenantDue' | 'RecurringBill' | 'Salary' | 'ManualReminder';
  description: string;
  status: string;
  amount?: number;
  referenceId?: string;
  isRecurring?: boolean;
  originalReminder?: OperationalReminder;
  completedBy?: string;
}

const CalendarView: React.FC<CalendarViewProps> = ({ complaints, tenants, staff, reminders, finance, onAddReminder, onQuickPay, onCompleteReminder, onAddRoutineTasks }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(new Date().toISOString().split('T')[0]);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'Agenda' | 'History'>('Agenda');
  
  // State for completion modal
  const [completionModal, setCompletionModal] = useState<{ event: OperationalEvent } | null>(null);
  const [completionForm, setCompletionForm] = useState({
    amount: '',
    staffName: '', // Diubah dari staffId ke staffName (isi manual)
    notes: ''
  });

  const [reminderForm, setReminderForm] = useState({
    title: '',
    type: 'WiFi' as any,
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    recurrence: 'None' as any,
    dayOfMonth: 4,
    weekOfMonth: 2,
    dayOfWeek: 0
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getNthDayOfWeek = (year: number, month: number, nth: number, dayOfWeek: number) => {
    let count = 0;
    const days = daysInMonth(year, month);
    for (let d = 1; d <= days; d++) {
      const date = new Date(year, month, d);
      if (date.getDay() === dayOfWeek) {
        count++;
        if (count === nth) return d;
      }
    }
    return null;
  };

  const operationalEvents: OperationalEvent[] = useMemo(() => {
    const events: OperationalEvent[] = [];

    complaints.forEach(c => {
      events.push({ id: c.id, title: c.locationName, date: c.date, type: 'Maintenance', description: c.description, status: c.status, completedBy: c.technician });
    });

    reminders.forEach(r => {
      let isVisibleThisMonth = false;
      let targetDay: number | null = null;

      if (r.recurrence === 'None') {
        const rDate = new Date(r.date);
        if (rDate.getMonth() === month && rDate.getFullYear() === year) {
          isVisibleThisMonth = true;
          targetDay = rDate.getDate();
        }
      } else if (r.recurrence === 'Monthly') {
        isVisibleThisMonth = true;
        targetDay = r.recurrencePattern?.dayOfMonth || new Date(r.date).getDate();
      } else if (r.recurrence === 'BiMonthly') {
        const startMonth = new Date(r.date).getMonth();
        if ((month - startMonth) % 2 === 0) {
          isVisibleThisMonth = true;
          if (r.recurrencePattern?.weekOfMonth !== undefined) {
            targetDay = getNthDayOfWeek(year, month, r.recurrencePattern.weekOfMonth, r.recurrencePattern.dayOfWeek || 0);
          } else {
            targetDay = r.recurrencePattern?.dayOfMonth || new Date(r.date).getDate();
          }
        }
      }

      if (isVisibleThisMonth && targetDay) {
        const finLog = finance.find(f => 
          f.type === 'Out' && 
          f.description.includes(r.title) && 
          new Date(f.date).getMonth() === month &&
          new Date(f.date).getFullYear() === year
        );

        const eventDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(targetDay).padStart(2, '0')}`;
        events.push({
          id: r.id,
          title: r.title,
          date: eventDate,
          type: 'ManualReminder',
          description: r.description,
          status: (finLog || r.status === 'Lunas') ? 'Lunas' : 'Terjadwal',
          amount: r.amount,
          isRecurring: r.recurrence !== 'None',
          originalReminder: r,
          completedBy: finLog ? finLog.description.match(/Petugas: ([^)]+)/)?.[1] : r.completedBy
        });
      }
    });

    tenants.filter(t => t.isActive).forEach(t => {
      const entryDay = new Date(t.entryDate).getDate();
      const eventDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(entryDay).padStart(2, '0')}`;
      const hasPaid = finance.some(f => 
        f.type === 'In' && f.referenceId === t.id && f.category === 'Sewa Kamar' &&
        new Date(f.date).getMonth() === month && new Date(f.date).getFullYear() === year
      );
      events.push({ id: `DUE-${t.id}-${month}-${year}`, title: `Sewa: ${t.name}`, date: eventDate, type: 'TenantDue', description: `Sewa unit ${INITIAL_ROOMS.find(r => r.id === t.roomId)?.name || t.roomId}`, status: hasPaid ? 'Lunas' : 'Belum Bayar', amount: t.monthlyRent, referenceId: t.id, isRecurring: true });
    });

    staff.forEach(s => {
      const hasPaidSalary = finance.some(f => f.type === 'Out' && f.description.includes(s.name) && f.category === 'Gaji' && new Date(f.date).getMonth() === month && new Date(f.date).getFullYear() === year);
      events.push({ id: `SALARY-${s.id}-${month}-${year}`, title: `Gaji: ${s.name}`, date: `${year}-${String(month + 1).padStart(2, '0')}-25`, type: 'Salary', description: `Gaji staff bulanan (${s.role})`, status: hasPaidSalary ? 'Lunas' : 'Terjadwal', amount: s.salary, referenceId: s.id, isRecurring: true });
    });

    return events;
  }, [complaints, tenants, staff, reminders, finance, year, month]);

  const handleSaveReminder = () => {
    if (!reminderForm.title) return alert("Judul pengingat wajib diisi");
    const pattern: any = {};
    if (reminderForm.recurrence === 'Monthly') pattern.dayOfMonth = reminderForm.dayOfMonth;
    else if (reminderForm.recurrence === 'BiMonthly') {
      if (reminderForm.type === 'AC') { pattern.weekOfMonth = 2; pattern.dayOfWeek = 0; }
      else pattern.dayOfMonth = reminderForm.dayOfMonth;
    }
    onAddReminder({
      id: `REM-${Math.random().toString(36).substring(7)}`, title: reminderForm.title, type: reminderForm.type, description: reminderForm.description, amount: reminderForm.amount ? Number(reminderForm.amount) : undefined, date: reminderForm.date, status: 'Terjadwal', recurrence: reminderForm.recurrence, recurrencePattern: pattern
    });
    setIsReminderModalOpen(false);
  };

  const handleOpenCompletion = (event: OperationalEvent) => {
    setCompletionModal({ event });
    setCompletionForm({
      amount: event.amount?.toString() || '',
      staffName: '',
      notes: ''
    });
  };

  const handleConfirmCompletion = () => {
    if (!completionForm.staffName.trim()) return alert("Nama petugas wajib diisi!");
    if (!completionModal?.event.originalReminder) return;

    onCompleteReminder(
      completionModal.event.originalReminder, 
      Number(completionForm.amount), 
      completionForm.staffName.trim(), 
      completionForm.notes
    );
    setCompletionModal(null);
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const days = [];
  const totalDays = daysInMonth(year, month);
  const startDay = firstDayOfMonth(year, month);

  for (let i = 0; i < startDay; i++) {
    days.push(<div key={`empty-${i}`} className="h-24 md:h-32 border border-[#f0f2f4] dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/10"></div>);
  }

  for (let d = 1; d <= totalDays; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dayEvents = operationalEvents.filter(e => e.date === dateStr);
    const isToday = todayStr === dateStr;
    const isSelected = selectedDate === dateStr;

    days.push(
      <div 
        key={d} 
        onClick={() => setSelectedDate(dateStr)}
        className={`h-24 md:h-32 border border-[#f0f2f4] dark:border-gray-800 p-2 cursor-pointer transition-all hover:bg-primary/5 group relative ${isSelected ? 'bg-primary/10 ring-2 ring-primary z-10' : 'bg-white dark:bg-[#1a242f]'}`}
      >
        <div className="flex justify-between items-start">
          <span className={`text-sm font-bold ${isToday ? 'bg-primary text-white size-7 flex items-center justify-center rounded-full shadow-lg shadow-primary/20' : 'text-[#111418] dark:text-white'}`}>{d}</span>
          <div className="flex gap-1 flex-wrap justify-end max-w-[40px]">
            {dayEvents.some(e => e.type === 'Maintenance') && <span className="w-2 h-2 rounded-full bg-blue-500"></span>}
            {dayEvents.some(e => e.status === 'Lunas' || e.status === 'Selesai') ? <span className="w-2 h-2 rounded-full bg-emerald-500"></span> : dayEvents.length > 0 && <span className="w-2 h-2 rounded-full bg-amber-500"></span>}
          </div>
        </div>
        
        <div className="mt-2 space-y-1 overflow-hidden">
          {dayEvents.slice(0, 2).map((e, i) => (
            <div key={i} className={`text-[8px] px-1.5 py-0.5 rounded truncate font-bold uppercase flex items-center gap-1 ${
              e.status === 'Lunas' || e.status === 'Selesai' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
            }`}>
              {e.status === 'Lunas' || e.status === 'Selesai' ? <span className="material-symbols-outlined text-[10px]">check_circle</span> : e.isRecurring && <span className="material-symbols-outlined text-[10px]">sync</span>}
              {e.title}
            </div>
          ))}
          {dayEvents.length > 2 && <div className="text-[8px] text-[#617589] font-bold px-1.5">+{dayEvents.length - 2}</div>}
        </div>
      </div>
    );
  }

  const selectedDayEvents = operationalEvents.filter(e => e.date === selectedDate);
  const finishedEventsInMonth = operationalEvents.filter(e => (e.status === 'Lunas' || e.status === 'Selesai'));
  const formatCurrency = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="p-6 lg:p-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-black dark:text-white tracking-tight uppercase italic">Kalender Kontrol</h1>
          <p className="text-[#617589] dark:text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-1">Management Operasional & Job Execution Log</p>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setIsReminderModalOpen(true)} className="flex items-center gap-2 bg-brand-black dark:bg-white text-white dark:text-brand-black px-6 py-3 rounded-2xl text-[10px] font-black tracking-widest uppercase shadow-xl shadow-black/20 hover:scale-105 transition-all">
            <span className="material-symbols-outlined text-xl">add_task</span>
            BUAT JADWAL RUTIN
          </button>
          <div className="flex items-center bg-white dark:bg-[#1a242f] border border-[#dbe0e6] dark:border-[#2d3a4b] rounded-2xl overflow-hidden shadow-sm">
            <button onClick={prevMonth} className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-[#617589]"><span className="material-symbols-outlined">chevron_left</span></button>
            <div className="px-6 py-2 text-center min-w-[180px]"><span className="text-sm font-black dark:text-white uppercase tracking-widest italic">{monthNames[month]} {year}</span></div>
            <button onClick={nextMonth} className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-[#617589]"><span className="material-symbols-outlined">chevron_right</span></button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-[#1a242f] rounded-[32px] border border-[#dbe0e6] dark:border-[#2d3a4b] overflow-hidden shadow-2xl">
            <div className="grid grid-cols-7 bg-[#f8fafc] dark:bg-gray-800/50 border-b border-[#dbe0e6] dark:border-gray-800">
              {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(day => (
                <div key={day} className="py-4 text-center text-[10px] font-black uppercase tracking-widest text-[#617589]">{day}</div>
              ))}
            </div>
            <div className="grid grid-cols-7">{days}</div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6 flex flex-col h-full">
          <div className="bg-white dark:bg-[#1a242f] rounded-[32px] border border-[#dbe0e6] dark:border-[#2d3a4b] p-8 shadow-xl flex-1 flex flex-col">
            <div className="flex p-1 bg-gray-50 dark:bg-gray-800 rounded-xl mb-6 shrink-0">
               <button onClick={() => setActiveTab('Agenda')} className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'Agenda' ? 'bg-primary text-white shadow-md' : 'text-gray-400'}`}>Agenda</button>
               <button onClick={() => setActiveTab('History')} className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'History' ? 'bg-primary text-white shadow-md' : 'text-gray-400'}`}>Arsip Pekerjaan</button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide space-y-4">
               {activeTab === 'Agenda' ? (
                 selectedDayEvents.length > 0 ? (
                   selectedDayEvents.map(e => (
                     <div key={e.id} className={`p-5 rounded-2xl border transition-all hover:scale-[1.02] ${
                       e.status === 'Lunas' || e.status === 'Selesai' ? 'bg-emerald-50/40 border-emerald-100 dark:bg-emerald-900/10' : 'bg-amber-50/40 border-amber-100 dark:bg-amber-900/10'
                     }`}>
                       <div className="flex justify-between items-start mb-3">
                         <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                               {e.status === 'Lunas' || e.status === 'Selesai' ? <span className="material-symbols-outlined text-emerald-500 text-sm">check_circle</span> : e.isRecurring && <span className="material-symbols-outlined text-brand-gray text-xs">sync</span>}
                               <span className="text-xs font-black dark:text-white uppercase truncate tracking-tight">{e.title}</span>
                            </div>
                            <span className={`text-[8px] font-black uppercase tracking-[0.2em] mt-1 block ${e.status === 'Lunas' || e.status === 'Selesai' ? 'text-emerald-600' : 'text-amber-600'}`}>{e.type}</span>
                         </div>
                         <span className={`text-[8px] font-black px-2.5 py-1 rounded-full uppercase shadow-sm ${e.status === 'Lunas' || e.status === 'Selesai' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>{e.status}</span>
                       </div>
                       <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold italic leading-relaxed mb-4">"{e.description}"</p>
                       
                       {e.completedBy && (
                         <div className="flex items-center gap-2 py-2 px-3 bg-white/50 dark:bg-black/20 rounded-xl mb-3 border border-emerald-100/50">
                            <span className="material-symbols-outlined text-xs text-emerald-500">person</span>
                            <span className="text-[9px] font-black text-emerald-600 uppercase">Petugas: {e.completedBy}</span>
                         </div>
                       )}

                       {e.status !== 'Lunas' && e.status !== 'Selesai' && e.type !== 'Maintenance' && e.type !== 'Salary' && (
                         <button onClick={() => handleOpenCompletion(e)} className="w-full py-2.5 bg-brand-black text-white text-[9px] font-black uppercase rounded-xl hover:bg-primary transition-all flex items-center justify-center gap-2 shadow-lg shadow-black/10">
                            <span className="material-symbols-outlined text-sm">verified</span> SELESAIKAN & CATAT
                         </button>
                       )}
                       
                       {e.type === 'TenantDue' && e.status !== 'Lunas' && (
                         <button onClick={() => onQuickPay(e.referenceId!)} className="w-full py-2.5 bg-primary text-white text-[9px] font-black uppercase rounded-xl flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-sm">payments</span> CATAT PEMBAYARAN
                         </button>
                       )}

                       {e.amount !== undefined && (
                          <div className="flex justify-between items-center pt-3 border-t border-gray-100/50 mt-3">
                             <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Estimasi</span>
                             <span className="text-xs font-black text-primary italic">{formatCurrency(e.amount)}</span>
                          </div>
                       )}
                     </div>
                   ))
                 ) : (
                   <div className="py-20 text-center opacity-20"><span className="material-symbols-outlined text-6xl mb-4 text-gray-300">calendar_month</span><p className="text-[10px] font-black uppercase tracking-[0.3em]">No Agenda Today</p></div>
                 )
               ) : (
                 finishedEventsInMonth.length > 0 ? (
                   finishedEventsInMonth.map(e => (
                     <div key={e.id} className="p-4 rounded-2xl bg-emerald-50/30 border border-emerald-100 dark:bg-emerald-900/10 space-y-3">
                        <div className="flex justify-between">
                           <span className="text-[10px] font-black dark:text-white uppercase truncate">{e.title}</span>
                           <span className="text-[8px] font-black text-emerald-600 uppercase">{e.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <div className="size-6 rounded-lg bg-emerald-500 flex items-center justify-center text-white"><span className="material-symbols-outlined text-sm">person</span></div>
                           <div className="min-w-0"><p className="text-[9px] font-black uppercase text-emerald-700">{e.completedBy || 'Admin System'}</p><p className="text-[8px] font-bold text-gray-400 italic">Executed Task</p></div>
                        </div>
                     </div>
                   ))
                 ) : (
                   <div className="py-20 text-center opacity-20"><span className="material-symbols-outlined text-6xl mb-4 text-gray-300">history</span><p className="text-[10px] font-black uppercase tracking-[0.3em]">Belum ada arsip selesai</p></div>
                 )
               )}
            </div>
          </div>
        </div>
      </div>

      {/* Completion Modal */}
      {completionModal && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white dark:bg-[#1a242f] rounded-[40px] shadow-2xl border-2 border-primary/20 w-full max-w-lg overflow-hidden flex flex-col">
              <div className="p-8 bg-brand-black text-white flex items-center gap-4">
                 <div className="size-14 rounded-2xl bg-emerald-500 flex items-center justify-center"><span className="material-symbols-outlined text-3xl">task_alt</span></div>
                 <div>
                    <h3 className="text-2xl font-bold uppercase tracking-tight">Eksekusi Pekerjaan</h3>
                    <p className="text-[10px] font-bold text-primary uppercase tracking-[0.4em] mt-1">Selesaikan & Sinkron Keuangan</p>
                 </div>
              </div>
              <div className="p-10 space-y-8 text-brand-black dark:text-white">
                 <div className="p-6 bg-gray-50 dark:bg-black/20 rounded-3xl border border-gray-100 dark:border-gray-800">
                    <p className="text-[10px] font-semibold text-brand-gray uppercase tracking-widest mb-1">Kegiatan:</p>
                    <p className="text-sm font-bold uppercase tracking-tighter">{completionModal.event.title}</p>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest ml-2">Nama Petugas Pelaksana</label>
                    <input 
                      type="text"
                      placeholder="Masukkan nama petugas..."
                      className="w-full h-14 px-6 rounded-2xl border-gray-100 dark:border-gray-800 dark:bg-gray-900 text-sm font-semibold uppercase"
                      value={completionForm.staffName}
                      onChange={(e) => setCompletionForm({...completionForm, staffName: e.target.value})}
                    />
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest ml-2">Nominal Real Pembayaran (Rp)</label>
                    <input 
                      type="number" 
                      className="w-full h-14 px-6 rounded-2xl border-2 border-emerald-500 bg-emerald-50/10 text-xl font-bold text-emerald-600 focus:ring-emerald-500"
                      value={completionForm.amount}
                      onChange={(e) => setCompletionForm({...completionForm, amount: e.target.value})}
                      placeholder="0"
                    />
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest ml-2">Catatan Hasil Pekerjaan</label>
                    <textarea 
                      className="w-full h-24 p-6 rounded-[28px] border-gray-100 dark:border-gray-800 dark:bg-gray-900 text-sm font-medium resize-none"
                      placeholder="Contoh: Sudah dibayar via m-banking / Selesai pembersihan area..."
                      value={completionForm.notes}
                      onChange={(e) => setCompletionForm({...completionForm, notes: e.target.value})}
                    />
                 </div>

                 <div className="flex gap-4 pt-4">
                    <button onClick={() => setCompletionModal(null)} className="flex-1 py-4 text-[10px] font-bold text-gray-400 hover:text-rose-500 uppercase tracking-widest transition-all">Batal</button>
                    <button onClick={handleConfirmCompletion} className="flex-[2] py-4 bg-emerald-600 text-white text-[10px] font-bold rounded-2xl shadow-xl shadow-emerald-500/20 hover:scale-[1.02] transition-all uppercase tracking-[0.2em]">Konfirmasi Selesai</button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Manual Reminder Modal with Recurrence */}
      {isReminderModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white dark:bg-[#1a242f] rounded-[40px] shadow-2xl border-2 border-primary/20 w-full max-w-lg overflow-hidden flex flex-col">
              <div className="p-8 bg-brand-black text-white flex items-center gap-4 italic italic">
                 <div className="size-14 rounded-2xl bg-primary flex items-center justify-center"><span className="material-symbols-outlined text-3xl">event_repeat</span></div>
                 <div>
                    <h3 className="text-2xl font-black uppercase tracking-tight italic">Atur Jadwal Rutin</h3>
                    <p className="text-[10px] font-bold text-primary uppercase tracking-[0.4em] mt-1">Smart Operational Scheduler</p>
                 </div>
              </div>
              <div className="p-10 space-y-8 text-brand-black dark:text-white">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Judul Jadwal</label>
                    <input type="text" className="w-full h-14 px-6 rounded-2xl border-gray-100 dark:border-gray-800 dark:bg-gray-900 text-sm font-bold focus:ring-primary focus:border-primary" placeholder="Misal: Tagihan Listrik PLN" value={reminderForm.title} onChange={(e) => setReminderForm({...reminderForm, title: e.target.value})} />
                 </div>
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Kategori</label>
                       <select className="w-full h-14 px-5 rounded-2xl border-gray-100 dark:border-gray-800 dark:bg-gray-900 text-xs font-bold" value={reminderForm.type} onChange={(e) => setReminderForm({...reminderForm, type: e.target.value})}>
                          <option value="WiFi">WiFi</option>
                          <option value="PLN">Listrik PLN</option>
                          <option value="Sampah">Sampah</option>
                          <option value="Sosial">Dana Sosial</option>
                          <option value="Pcash">Pettycash</option>
                          <option value="AC">Servis AC</option>
                          <option value="Lainnya">Lainnya</option>
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Frekuensi Perulangan</label>
                       <select className="w-full h-14 px-5 rounded-2xl border-gray-100 dark:border-gray-800 dark:bg-gray-900 text-xs font-bold" value={reminderForm.recurrence} onChange={(e) => setReminderForm({...reminderForm, recurrence: e.target.value})}>
                          <option value="None">Hanya Sekali (Manual)</option>
                          <option value="Monthly">Rutin Setiap Bulan</option>
                          <option value="BiMonthly">Rutin Setiap 2 Bulan</option>
                       </select>
                    </div>
                 </div>

                 {reminderForm.recurrence !== 'None' && (
                   <div className="p-6 bg-primary/5 rounded-3xl border border-primary/20 space-y-4">
                      <p className="text-[10px] font-bold text-primary uppercase tracking-widest text-center">Detail Perulangan</p>
                      <div className="flex items-center justify-between">
                         <span className="text-[10px] font-bold text-gray-400 uppercase">Jatuh Tempo Setiap Tanggal</span>
                         <input type="number" min="1" max="31" className="w-16 h-10 text-center rounded-xl bg-white dark:bg-gray-800 font-bold border-none ring-1 ring-gray-200" value={reminderForm.dayOfMonth} onChange={(e) => setReminderForm({...reminderForm, dayOfMonth: Number(e.target.value)})} />
                      </div>
                   </div>
                 )}

                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-brand-gray uppercase tracking-widest ml-2">Catatan / Estimasi Dana (Opsional)</label>
                    <div className="flex gap-4">
                       <input type="number" className="flex-1 h-14 px-6 rounded-2xl border-gray-100 dark:border-gray-800 dark:bg-brand-black text-sm font-bold" placeholder="Nominal Rp" value={reminderForm.amount} onChange={(e) => setReminderForm({...reminderForm, amount: e.target.value})} />
                       <input type="date" className="flex-1 h-14 px-6 rounded-2xl border-gray-100 dark:border-gray-800 dark:bg-brand-black text-[10px] font-bold" value={reminderForm.date} onChange={(e) => setReminderForm({...reminderForm, date: e.target.value})} />
                    </div>
                 </div>

                 <div className="flex gap-4 pt-4">
                    <button onClick={() => setIsReminderModalOpen(false)} className="flex-1 py-4 text-xs font-bold text-gray-400 hover:text-rose-500 uppercase tracking-widest transition-all">Batal</button>
                    <button onClick={handleSaveReminder} className="flex-[2] py-4 bg-primary text-white text-xs font-bold rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all uppercase tracking-[0.2em]">Simpan Jadwal Rutin</button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;

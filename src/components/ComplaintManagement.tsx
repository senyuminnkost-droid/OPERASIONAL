import React, { useState } from 'react';
import { Complaint } from '../types';

interface ComplaintManagementProps {
  complaints: Complaint[];
  onUpdate: (id: string, updates: Partial<Complaint>) => void;
}

const ComplaintManagement: React.FC<ComplaintManagementProps> = ({ complaints, onUpdate }) => {
  const [activeModal, setActiveModal] = useState<{ type: 'start' | 'finish', complaint: Complaint } | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [formData, setFormData] = useState({
    technician: '',
    cost: '',
    notes: '',
    date: '' 
  });

  const activeComplaints = complaints.filter(c => c.status !== 'Selesai');

  const handleOpenModal = (type: 'start' | 'finish', complaint: Complaint) => {
    setActiveModal({ type, complaint });
    setFormData({
      technician: complaint.technician || '',
      cost: complaint.cost?.toString() || '',
      notes: complaint.notes || '',
      date: '' // Selalu kosong saat modal dibuka (Hapus default)
    });
  };

  const handleSave = () => {
    if (!activeModal) return;

    if (activeModal.type === 'start') {
      if (!formData.technician) return alert('Nama teknisi harus diisi');
      if (!formData.date) return alert('Tanggal mulai harus dipilih');
      onUpdate(activeModal.complaint.id, { 
        status: 'Proses', 
        technician: formData.technician,
        startDate: formData.date,
        notes: formData.notes
      });
    } else {
      if (!formData.date) return alert('Tanggal selesai harus dipilih');
      onUpdate(activeModal.complaint.id, { 
        status: 'Selesai', 
        cost: Number(formData.cost),
        finishedDate: formData.date,
        notes: formData.notes,
        technician: formData.technician 
      });
    }
    setActiveModal(null);
  };

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return "Pilih Tanggal...";
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const calculateDaysSince = (dateStr: string) => {
    const start = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="p-6 lg:p-8 animate-in fade-in duration-300 relative">
      <div className="flex flex-col gap-1 mb-8">
        <h1 className="text-3xl font-black dark:text-white tracking-tight">Manajemen Tindakan</h1>
        <p className="text-[#617589] dark:text-gray-400">Kelola pengerjaan teknisi untuk Kamar & Fasilitas Umum secara real-time.</p>
      </div>

      <div className="space-y-6">
        {activeComplaints.map((c) => {
          const daysSinceReport = calculateDaysSince(c.date);
          const isProcessing = c.status === 'Proses';

          return (
            <div 
              key={c.id} 
              className={`bg-white dark:bg-[#1a242f] rounded-2xl shadow-md border border-[#dbe0e6] dark:border-[#2d3a4b] overflow-hidden transition-all hover:shadow-lg`}
            >
              <div className="p-6">
                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Left: Basic Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`size-14 rounded-2xl flex items-center justify-center shrink-0 ${
                        c.status === 'Baru' ? 'bg-rose-50 dark:bg-rose-900/10' : 'bg-amber-50 dark:bg-amber-900/10'
                      }`}>
                        <span className={`material-symbols-outlined text-3xl ${
                          c.status === 'Baru' ? 'text-rose-500' : 'text-amber-500'
                        }`}>
                          {c.locationType === 'Room' ? 'meeting_room' : 'apartment'}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-3 mb-1 flex-wrap">
                          <h3 className="text-xl font-black dark:text-white truncate">{c.locationName}</h3>
                          {c.locationType === 'Fasum' && <span className="px-2 py-0.5 bg-primary text-white text-[9px] font-black rounded uppercase">Fasum</span>}
                        </div>
                        <p className="text-sm font-bold text-gray-700 dark:text-gray-200">Kategori: <span className="text-primary">{c.type}</span></p>
                        <p className="text-sm text-[#617589] dark:text-gray-400 mt-2 line-clamp-2 italic">"{c.description}"</p>
                      </div>
                    </div>

                    {/* Status Preview Section */}
                    <div className="bg-[#f8fafc] dark:bg-gray-800/40 rounded-xl p-5 border border-[#edf2f7] dark:border-gray-800">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">analytics</span>
                        Preview Status Pengerjaan
                      </p>
                      
                      <div className="flex items-center justify-between mb-6 relative">
                         {/* Progress Line */}
                         <div className="absolute left-[5%] right-[5%] top-1/2 -translate-y-1/2 h-0.5 bg-gray-200 dark:bg-gray-700 -z-0"></div>
                         
                         {/* Step 1: Lapor */}
                         <div className="relative z-10 flex flex-col items-center gap-2 bg-[#f8fafc] dark:bg-[#1a242f] px-2">
                           <div className="size-6 rounded-full bg-rose-500 flex items-center justify-center text-white text-[10px]">1</div>
                           <span className="text-[10px] font-black text-rose-600 uppercase">Dilaporkan</span>
                         </div>

                         {/* Step 2: Proses */}
                         <div className="relative z-10 flex flex-col items-center gap-2 bg-[#f8fafc] dark:bg-[#1a242f] px-2">
                           <div className={`size-6 rounded-full flex items-center justify-center text-white text-[10px] ${isProcessing ? 'bg-amber-500 animate-pulse' : 'bg-gray-300 dark:bg-gray-600'}`}>2</div>
                           <span className={`text-[10px] font-black uppercase ${isProcessing ? 'text-amber-600' : 'text-gray-400'}`}>Proses</span>
                         </div>

                         {/* Step 3: Selesai */}
                         <div className="relative z-10 flex flex-col items-center gap-2 bg-[#f8fafc] dark:bg-[#1a242f] px-2">
                           <div className="size-6 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-white text-[10px]">3</div>
                           <span className="text-[10px] font-black text-gray-400 uppercase">Selesai</span>
                         </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-2">
                         <div className="flex flex-col gap-0.5">
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Durasi Tunggu</span>
                            <span className={`text-xs font-black ${daysSinceReport > 3 ? 'text-rose-600' : 'text-gray-700 dark:text-gray-200'}`}>
                               {daysSinceReport} Hari Sejak Lapor
                            </span>
                         </div>
                         <div className="flex flex-col gap-0.5">
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Teknisi Bertugas</span>
                            <span className="text-xs font-black text-gray-700 dark:text-gray-200">
                               {c.technician || "Belum Ditugaskan"}
                            </span>
                         </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="lg:w-64 shrink-0 flex flex-col gap-3 justify-center">
                    <div className={`p-4 rounded-xl text-center mb-2 ${c.status === 'Baru' ? 'bg-rose-50 dark:bg-rose-900/10' : 'bg-amber-50 dark:bg-amber-900/10'}`}>
                       <p className={`text-[10px] font-black uppercase tracking-widest ${c.status === 'Baru' ? 'text-rose-600' : 'text-amber-600'}`}>
                          Status Sekarang:
                       </p>
                       <p className={`text-sm font-black ${c.status === 'Baru' ? 'text-rose-500' : 'text-amber-500'}`}>
                          {c.status === 'Baru' ? 'PENDING ACTION' : 'ON PROGRESS'}
                       </p>
                    </div>

                    {c.status === 'Baru' ? (
                      <button 
                        onClick={() => handleOpenModal('start', c)}
                        className="w-full py-4 bg-primary text-white text-xs font-black rounded-xl hover:bg-orange-600 flex items-center justify-center gap-3 shadow-lg shadow-primary/30 transition-all active:scale-95"
                      >
                        <span className="material-symbols-outlined">play_arrow</span>
                        MULAI PENGERJAAN
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleOpenModal('finish', c)}
                        className="w-full py-4 bg-emerald-500 text-white text-xs font-black rounded-xl hover:bg-emerald-600 flex items-center justify-center gap-3 transition-all shadow-lg shadow-emerald-500/30 active:scale-95"
                      >
                        <span className="material-symbols-outlined">check_circle</span>
                        SELESAIKAN TIKET
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {activeComplaints.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
             <div className="size-24 rounded-full bg-emerald-50 dark:bg-emerald-900/10 flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-5xl text-emerald-500">verified</span>
             </div>
             <p className="text-xl font-black dark:text-white uppercase tracking-tight">Semua Keluhan Beres!</p>
             <p className="text-sm text-gray-500 mt-2">Tidak ada pengerjaan aktif yang tertunda saat ini.</p>
          </div>
        )}
      </div>

      {activeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1a242f] rounded-3xl shadow-2xl border border-[#dbe0e6] dark:border-[#2d3a4b] w-full max-w-lg overflow-hidden">
            <div className={`p-6 text-white flex items-center gap-4 ${activeModal.type === 'start' ? 'bg-primary' : 'bg-emerald-500'}`}>
              <div className="size-12 rounded-xl bg-white/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl">
                  {activeModal.type === 'start' ? 'play_circle' : 'task_alt'}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight">
                  {activeModal.type === 'start' ? 'Mulai Perbaikan' : 'Selesaikan Pengerjaan'}
                </h3>
                <p className="text-xs font-bold opacity-80 italic">{activeModal.complaint.locationName} • {activeModal.complaint.type}</p>
              </div>
            </div>

            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-[#617589] uppercase tracking-widest">
                    {activeModal.type === 'start' ? 'Tanggal Mulai' : 'Tanggal Selesai'}
                  </label>
                  <div 
                    onClick={() => setIsCalendarOpen(true)}
                    className="w-full h-12 px-4 rounded-xl border border-[#dbe0e6] dark:border-gray-700 dark:bg-gray-800 dark:text-white text-sm flex items-center justify-between cursor-pointer hover:border-primary transition-colors font-bold group"
                  >
                    <span className={formData.date ? 'text-inherit' : 'text-gray-400 font-medium italic'}>
                      {formatDateDisplay(formData.date)}
                    </span>
                    <span className="material-symbols-outlined text-gray-400 group-hover:text-primary transition-colors">calendar_month</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-[#617589] uppercase tracking-widest">Nama Teknisi</label>
                  <input 
                    type="text" 
                    placeholder="Contoh: Pak Budi (AC)"
                    className="w-full h-12 px-4 rounded-xl border-[#dbe0e6] dark:border-gray-700 dark:bg-gray-800 dark:text-white text-sm focus:ring-primary focus:border-primary placeholder:italic placeholder:opacity-50 font-bold"
                    value={formData.technician}
                    onChange={(e) => setFormData({...formData, technician: e.target.value})}
                  />
                </div>
              </div>

              {activeModal.type === 'finish' && (
                <div className="space-y-2">
                  <label className="text-xs font-black text-[#617589] uppercase tracking-widest">Biaya Perbaikan (Rp)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">Rp</span>
                    <input 
                      type="number" 
                      className="w-full h-12 pl-12 pr-4 rounded-xl border-[#dbe0e6] dark:border-gray-700 dark:bg-gray-800 dark:text-white text-sm focus:ring-primary focus:border-primary font-bold"
                      value={formData.cost}
                      placeholder="0"
                      onChange={(e) => setFormData({...formData, cost: e.target.value})}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-black text-[#617589] uppercase tracking-widest">Catatan Tambahan (Opsional)</label>
                <textarea 
                  className="w-full h-24 p-4 rounded-xl border-[#dbe0e6] dark:border-gray-700 dark:bg-gray-800 dark:text-white text-sm focus:ring-primary focus:border-primary resize-none font-medium"
                  placeholder="Tulis detail pengerjaan di sini..."
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                ></textarea>
              </div>

              <div className="flex gap-3 pt-4">
                <button onClick={() => setActiveModal(null)} className="flex-1 py-3 text-sm font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">Batal</button>
                <button 
                  onClick={handleSave}
                  className={`flex-[2] py-3 text-sm font-black text-white rounded-xl shadow-lg transition-all ${
                    activeModal.type === 'start' ? 'bg-primary shadow-primary/20 hover:bg-orange-600' : 'bg-emerald-500 shadow-emerald-500/20 hover:bg-emerald-600'
                  }`}
                >
                  SIMPAN PERUBAHAN
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isCalendarOpen && (
        <CalendarModal 
          currentDate={formData.date} 
          onSelect={(newDate) => {
            setFormData({...formData, date: newDate});
            setIsCalendarOpen(false);
          }} 
          onClose={() => setIsCalendarOpen(false)} 
        />
      )}
    </div>
  );
};

// Reusable Internal Helper Component for Custom Calendar Popup
const CalendarModal: React.FC<{ currentDate: string, onSelect: (d: string) => void, onClose: () => void }> = ({ currentDate, onSelect, onClose }) => {
  const initialDate = currentDate ? new Date(currentDate) : new Date();
  const [viewDate, setViewDate] = useState(new Date(initialDate.getFullYear(), initialDate.getMonth(), 1));
  
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(year, month + 1, 1));
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-white dark:bg-[#1a242f] rounded-2xl shadow-2xl border border-[#dbe0e6] dark:border-[#2d3a4b] w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="p-4 bg-primary text-white flex justify-between items-center">
          <button onClick={handlePrev} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <div className="flex flex-col items-center">
             <span className="text-xs font-bold uppercase tracking-widest opacity-80">{year}</span>
             <span className="text-lg font-black">{monthNames[month]}</span>
          </div>
          <button onClick={handleNext} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-7 mb-2">
            {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(d => (
              <div key={d} className="text-center text-[10px] font-black text-[#617589] uppercase py-2">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="h-10"></div>
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const d = i + 1;
              const fullDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
              const isSelected = currentDate === fullDateStr;
              const isToday = new Date().toISOString().split('T')[0] === fullDateStr;

              return (
                <button
                  key={d}
                  onClick={() => onSelect(fullDateStr)}
                  className={`h-10 text-sm font-bold rounded-xl transition-all flex items-center justify-center
                    ${isSelected ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-110 z-10' : 
                      isToday ? 'text-primary border border-primary/30' : 
                      'text-[#111418] dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}
                  `}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </div>
        <div className="p-4 pt-0">
           <button 
             onClick={onClose}
             className="w-full py-2.5 text-xs font-black text-gray-500 hover:text-rose-500 uppercase tracking-widest transition-colors"
           >
             Tutup
           </button>
        </div>
      </div>
    </div>
  );
};

export default ComplaintManagement;
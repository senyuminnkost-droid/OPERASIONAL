
import React, { useState } from 'react';
import { Staff } from '../types';

interface StaffProps {
  staff: Staff[];
  onAddStaff: (s: Staff) => void;
  onUpdateStaff: (id: string, updates: Partial<Staff>) => void;
}

const StaffManagement: React.FC<StaffProps> = ({ staff, onAddStaff, onUpdateStaff }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '', role: 'Kebersihan' as any, shift: 'Pagi' as any, 
    shiftStartTime: '07:00', shiftEndTime: '15:00', disciplineAllowance: '300000',
    phone: '', idCardNumber: '', address: '',
    bankName: '', accountNumber: '', emergencyName: '', emergencyPhone: '', 
    salary: '', joinDate: new Date().toISOString().split('T')[0]
  });

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const staffData = {
      ...formData,
      salary: Number(formData.salary),
      disciplineAllowance: Number(formData.disciplineAllowance)
    };

    if (editingStaffId) {
      onUpdateStaff(editingStaffId, staffData);
      setEditingStaffId(null);
    } else {
      onAddStaff({
        id: `S-${Math.random().toString(36).substring(7).toUpperCase()}`,
        ...staffData,
        attendance: {}
      } as Staff);
    }
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '', role: 'Kebersihan' as any, shift: 'Pagi' as any, 
      shiftStartTime: '07:00', shiftEndTime: '15:00', disciplineAllowance: '300000',
      phone: '', idCardNumber: '', address: '',
      bankName: '', accountNumber: '', emergencyName: '', emergencyPhone: '', 
      salary: '', joinDate: new Date().toISOString().split('T')[0]
    });
    setEditingStaffId(null);
  };

  const handleEdit = (s: Staff) => {
    setFormData({
      name: s.name, role: s.role, shift: s.shift,
      shiftStartTime: s.shiftStartTime, shiftEndTime: s.shiftEndTime,
      disciplineAllowance: s.disciplineAllowance.toString(),
      phone: s.phone, idCardNumber: s.idCardNumber || '', address: s.address || '',
      bankName: s.bankName || '', accountNumber: s.accountNumber || '',
      emergencyName: s.emergencyName || '', emergencyPhone: s.emergencyPhone || '',
      salary: s.salary.toString(), joinDate: s.joinDate
    });
    setEditingStaffId(s.id);
    setIsModalOpen(true);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-10 space-y-8 animate-in fade-in duration-500 max-w-[1600px] mx-auto min-h-screen">
      
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 no-print">
        <div className="flex items-center gap-5">
          <div className="size-14 bg-brand-black rounded-[20px] flex items-center justify-center text-primary shadow-2xl border-b-4 border-primary">
             <span className="material-symbols-outlined text-3xl">badge</span>
          </div>
          <div>
            <h1 className="text-2xl sm:text-4xl font-black dark:text-white uppercase tracking-tighter italic leading-none">Manajemen TIM</h1>
            <p className="text-brand-gray font-bold uppercase text-[8px] tracking-[0.3em] mt-2 italic">Shift Scheduling & HR Database Control</p>
          </div>
        </div>

        <button onClick={() => { resetForm(); setIsModalOpen(true); }} className="w-full sm:w-auto h-14 px-10 bg-brand-black dark:bg-white text-white dark:text-brand-black rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl hover:bg-primary hover:text-white transition-all transform hover:scale-105 active:scale-95">
          + REGISTRASI TIM
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
        {staff.map(s => (
          <div key={s.id} className="bg-white dark:bg-brand-black p-8 rounded-[40px] border border-gray-100 dark:border-brand-gray/20 shadow-sm relative overflow-hidden flex flex-col transition-all hover:shadow-2xl group">
             <div className="absolute top-0 right-0 px-4 py-2 rounded-bl-3xl text-[9px] font-black uppercase text-white bg-primary group-hover:px-6 transition-all">SHIFT {s.shift}</div>
             <div className="flex items-center gap-5 mb-8">
                <div className="size-16 rounded-3xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-brand-gray border border-gray-100 dark:border-brand-gray/20 shadow-inner group-hover:border-primary/50 transition-colors">
                   <span className="material-symbols-outlined text-4xl">person</span>
                </div>
                <div className="min-w-0">
                   <h3 className="font-bold text-lg dark:text-white uppercase truncate tracking-tighter">{s.name}</h3>
                   <p className="text-[9px] font-black text-primary uppercase tracking-widest">{s.role}</p>
                </div>
             </div>
             
             <div className="space-y-4 mb-8 flex-1 bg-gray-50/50 dark:bg-white/5 p-5 rounded-3xl border border-gray-100 dark:border-white/5">
                <div className="flex justify-between text-[10px] font-bold">
                   <span className="text-brand-gray uppercase tracking-widest italic">Jam Kerja</span>
                   <span className="dark:text-white font-black">{s.shiftStartTime} - {s.shiftEndTime}</span>
                </div>
                <div className="h-px bg-gray-200 dark:bg-white/10 w-full"></div>
                <div className="flex justify-between text-[10px] font-bold">
                   <span className="text-brand-gray uppercase tracking-widest italic">Gaji Pokok</span>
                   <span className="text-primary font-black">{formatCurrency(s.salary)}</span>
                </div>
                <div className="flex justify-between text-[10px] font-bold">
                   <span className="text-brand-gray uppercase tracking-widest italic">Kontak</span>
                   <span className="dark:text-white">{s.phone}</span>
                </div>
             </div>

             <div className="flex gap-3">
                <button onClick={() => handleEdit(s)} className="flex-1 py-4 bg-brand-black text-white text-[10px] font-black uppercase rounded-2xl hover:bg-primary transition-all shadow-lg shadow-black/10">KONTROL JADWAL</button>
                <button className="size-12 bg-gray-50 dark:bg-white/5 rounded-2xl flex items-center justify-center text-brand-gray border border-gray-100 dark:border-brand-gray/20 hover:text-primary transition-all"><span className="material-symbols-outlined text-2xl">visibility</span></button>
             </div>
          </div>
        ))}
        {staff.length === 0 && (
          <div className="col-span-full py-48 text-center opacity-10 border-4 border-dashed border-gray-100 dark:border-white/10 rounded-[60px]">
             <span className="material-symbols-outlined text-[120px]">group_off</span>
             <p className="font-black text-2xl uppercase tracking-[0.5em] mt-8">Database Tim Kosong</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-brand-black/95 backdrop-blur-2xl animate-in fade-in duration-300">
          <div className="bg-white dark:bg-brand-black rounded-[48px] shadow-2xl border-2 border-primary/20 w-full max-w-5xl overflow-hidden flex flex-col max-h-[95vh] animate-in zoom-in-95 duration-300">
            <div className="p-10 bg-brand-black text-white flex justify-between items-center border-b border-primary/20 shrink-0">
               <div className="flex items-center gap-6">
                  <div className="size-16 rounded-[24px] bg-primary flex items-center justify-center shadow-2xl shadow-primary/40"><span className="material-symbols-outlined text-4xl">calendar_month</span></div>
                  <div>
                    <h3 className="text-2xl font-black uppercase tracking-tight italic">{editingStaffId ? 'Update Jadwal Shift' : 'Input Jadwal Staff Baru'}</h3>
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mt-1 italic">Setup Work Schedule & Compensation</p>
                  </div>
               </div>
               <button onClick={() => setIsModalOpen(false)} className="size-12 hover:bg-primary/20 rounded-2xl transition-all border border-primary/20 flex items-center justify-center text-primary active:scale-90"><span className="material-symbols-outlined text-3xl font-bold">close</span></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-10 lg:p-14 space-y-14 overflow-y-auto scrollbar-hide text-brand-black dark:text-white">
              
              {/* SECTION 1: PENETAPAN JADWAL */}
              <div className="space-y-10">
                <h4 className="text-[11px] font-black text-primary uppercase tracking-[0.4em] flex items-center gap-5">
                  <div className="w-16 h-0.5 bg-primary"></div>
                  Konfigurasi Jadwal Kerja (Shift)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-brand-gray uppercase ml-2 tracking-widest">Tipe Shift</label>
                      <select value={formData.shift} onChange={(e) => setFormData({...formData, shift: e.target.value as any})} className="w-full h-14 px-6 rounded-2xl border-gray-100 dark:border-gray-800 dark:bg-brand-black text-[11px] font-black uppercase focus:ring-primary shadow-sm">
                         <option value="Pagi">Pagi</option>
                         <option value="Sore-Pagi">Sore-Pagi</option>
                      </select>
                   </div>
                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-brand-gray uppercase ml-2 tracking-widest">Posisi Role</label>
                      <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value as any})} className="w-full h-14 px-6 rounded-2xl border-gray-100 dark:border-gray-800 dark:bg-brand-black text-[11px] font-black uppercase focus:ring-primary shadow-sm">
                         <option value="Kebersihan">Kebersihan</option>
                         <option value="Keamanan">Keamanan</option>
                         <option value="Teknisi">Teknisi</option>
                         <option value="Admin">Admin</option>
                         <option value="Lainnya">Lainnya</option>
                      </select>
                   </div>
                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-brand-gray uppercase ml-2 tracking-widest">Jam Masuk</label>
                      <input type="time" value={formData.shiftStartTime} onChange={(e) => setFormData({...formData, shiftStartTime: e.target.value})} className="w-full h-14 px-6 rounded-2xl border-gray-100 dark:border-gray-800 dark:bg-brand-black text-base font-black text-primary text-center shadow-inner" />
                   </div>
                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-brand-gray uppercase ml-2 tracking-widest">Jam Pulang</label>
                      <input type="time" value={formData.shiftEndTime} onChange={(e) => setFormData({...formData, shiftEndTime: e.target.value})} className="w-full h-14 px-6 rounded-2xl border-gray-100 dark:border-gray-800 dark:bg-brand-black text-base font-black text-primary text-center shadow-inner" />
                   </div>
                </div>
                <div className="p-6 bg-primary/5 rounded-[32px] border border-primary/10 border-dashed">
                   <p className="text-[10px] font-bold text-brand-gray leading-relaxed text-center uppercase tracking-widest italic">
                     * Staff wajib melakukan absen masuk sebelum jam <span className="text-primary font-black">{formData.shiftStartTime}</span>. Keterlambatan akan dikenakan denda otomatis yang memotong tunjangan disiplin.
                   </p>
                </div>
              </div>

              {/* SECTION 2: GAJI & TUNJANGAN */}
              <div className="space-y-10">
                <h4 className="text-[11px] font-black text-primary uppercase tracking-[0.4em] flex items-center gap-5">
                  <div className="w-16 h-0.5 bg-primary"></div>
                  Kompensasi & Tunjangan
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-brand-gray uppercase ml-2 tracking-widest">Gaji Pokok Bulanan (IDR)</label>
                    <input type="number" value={formData.salary} onChange={(e) => setFormData({...formData, salary: e.target.value})} className="w-full h-16 px-8 rounded-3xl border-gray-100 dark:border-gray-800 dark:bg-brand-black text-2xl font-black text-primary focus:ring-primary shadow-sm" placeholder="0" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-brand-gray uppercase ml-2 tracking-widest">Tunjangan Kedisiplinan</label>
                    <input type="number" value={formData.disciplineAllowance} onChange={(e) => setFormData({...formData, disciplineAllowance: e.target.value})} className="w-full h-16 px-8 rounded-3xl border-2 border-emerald-500 bg-emerald-50/5 text-xl font-black text-emerald-600 focus:ring-emerald-500 shadow-sm" />
                    <p className="text-[8px] font-bold text-emerald-600 uppercase italic ml-2 tracking-widest">Setoran saldo awal denda kedisiplinan</p>
                  </div>
                </div>
              </div>

              {/* SECTION 3: PROFIL IDENTITAS */}
              <div className="space-y-10">
                <h4 className="text-[11px] font-black text-primary uppercase tracking-[0.4em] flex items-center gap-5">
                  <div className="w-16 h-0.5 bg-primary"></div>
                  Identitas Lengkap Personal
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                   <div className="space-y-2"><label className="text-[10px] font-black text-brand-gray uppercase ml-2">Nama Lengkap</label><input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full h-14 px-6 rounded-2xl border-gray-100 dark:border-gray-800 dark:bg-brand-black text-sm font-black uppercase focus:ring-primary" required /></div>
                   <div className="space-y-2"><label className="text-[10px] font-black text-brand-gray uppercase ml-2">Nomor KTP</label><input type="text" value={formData.idCardNumber} onChange={(e) => setFormData({...formData, idCardNumber: e.target.value})} className="w-full h-14 px-6 rounded-2xl border-gray-100 dark:border-gray-800 dark:bg-brand-black text-sm font-black tracking-widest" /></div>
                   <div className="space-y-2"><label className="text-[10px] font-black text-brand-gray uppercase ml-2">No. HP (WhatsApp)</label><input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full h-14 px-6 rounded-2xl border-gray-100 dark:border-gray-800 dark:bg-brand-black text-sm font-black" required /></div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-brand-gray uppercase ml-2">Nama Bank</label>
                     <input type="text" value={formData.bankName} onChange={(e) => setFormData({...formData, bankName: e.target.value})} className="w-full h-14 px-6 rounded-2xl border-gray-100 dark:border-gray-800 dark:bg-brand-black text-sm font-black uppercase" />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-brand-gray uppercase ml-2">Nomor Rekening</label>
                     <input type="text" value={formData.accountNumber} onChange={(e) => setFormData({...formData, accountNumber: e.target.value})} className="w-full h-14 px-6 rounded-2xl border-gray-100 dark:border-gray-800 dark:bg-brand-black text-sm font-black" />
                   </div>
                </div>
              </div>

              <div className="pt-10 border-t border-gray-100 dark:border-white/10 flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-5 text-xs font-black text-gray-400 hover:text-rose-500 uppercase tracking-widest transition-all">Batal</button>
                <button type="submit" className="flex-[3] py-5 bg-brand-black dark:bg-white text-white dark:text-brand-black font-black text-[12px] rounded-3xl uppercase tracking-[0.4em] shadow-2xl hover:bg-primary hover:text-white transition-all transform active:scale-95">
                  {editingStaffId ? 'SIMPAN PERUBAHAN JADWAL' : 'KONFIRMASI REKRUTMEN'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;

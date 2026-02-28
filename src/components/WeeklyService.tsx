
import React, { useState } from 'react';
import { Room, RoomStatus, ComplaintType, WeeklyServiceLog } from '../types';

interface WeeklyServiceProps {
  rooms: Room[];
  onServiceSubmit: (log: WeeklyServiceLog) => void;
}

const WeeklyService: React.FC<WeeklyServiceProps> = ({ rooms, onServiceSubmit }) => {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [formData, setFormData] = useState({
    staffName: '',
    checks: {
      mattress: 'Baik' as 'Baik' | 'Masalah',
      accessories: 'Baik' as 'Baik' | 'Masalah',
      bathroom: 'Baik' as 'Baik' | 'Masalah',
      cleanliness: 'Baik' as 'Baik' | 'Masalah',
    },
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom || !formData.staffName) return alert('Lengkapi data kamar dan nama staff');

    const newLog: WeeklyServiceLog = {
      id: Math.random().toString(36).substring(7),
      roomId: selectedRoom.id,
      date: new Date().toISOString().split('T')[0],
      staffName: formData.staffName,
      checks: formData.checks,
      notes: formData.notes
    };

    onServiceSubmit(newLog);
    setSelectedRoom(null);
    setFormData({
      staffName: '',
      checks: { mattress: 'Baik', accessories: 'Baik', bathroom: 'Baik', cleanliness: 'Baik' },
      notes: ''
    });
  };

  const toggleCheck = (key: keyof typeof formData.checks) => {
    setFormData({
      ...formData,
      checks: {
        ...formData.checks,
        [key]: formData.checks[key] === 'Baik' ? 'Masalah' : 'Baik'
      }
    });
  };

  return (
    <div className="px-2 py-4 sm:p-6 lg:p-10 space-y-6 animate-in fade-in duration-500 overflow-x-hidden max-w-full w-full box-border">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col gap-1 mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold dark:text-white tracking-tight uppercase">Weekly Service</h1>
        <p className="text-brand-gray font-bold uppercase text-[9px] tracking-widest italic opacity-70">Room Check & Asset Monitoring System</p>
      </div>

      {!selectedRoom ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {rooms.map((room) => {
            const lastServiceDate = room.lastService ? new Date(room.lastService) : null;
            const isDue = !lastServiceDate || (new Date().getTime() - lastServiceDate.getTime()) > (7 * 24 * 60 * 60 * 1000);
            
            return (
              <div 
                key={room.id}
                onClick={() => setSelectedRoom(room)}
                className={`bg-white dark:bg-brand-black rounded-2xl border p-3 flex flex-col justify-between h-[120px] transition-all cursor-pointer hover:shadow-xl hover:border-primary ${isDue ? 'border-rose-200 dark:border-rose-900 shadow-sm' : 'border-emerald-100 dark:border-emerald-900/50'}`}
              >
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="text-xs font-bold dark:text-white uppercase">{room.name}</h3>
                    <div className={`size-2 rounded-full ${isDue ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`}></div>
                  </div>
                  <p className="text-[7px] font-bold text-brand-gray uppercase tracking-widest mt-1">Last: {room.lastService || 'Belum Pernah'}</p>
                </div>
                <div className="mt-auto">
                   <span className={`text-[8px] font-bold px-2 py-0.5 rounded uppercase ${isDue ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                      {isDue ? 'Perlu Cek' : 'Sudah Cek'}
                   </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-brand-black rounded-[32px] border border-primary/20 overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
           <div className="p-6 bg-primary text-white flex justify-between items-center">
              <div>
                 <h2 className="text-xl font-bold uppercase tracking-tight">Form Pemeriksaan {selectedRoom.name}</h2>
                 <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">Entry Data Kebersihan & Aset</p>
              </div>
              <button onClick={() => setSelectedRoom(null)} className="size-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all">
                 <span className="material-symbols-outlined">close</span>
              </button>
           </div>

           <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-8">
              <div className="space-y-2">
                 <label className="text-[10px] font-bold text-brand-gray uppercase tracking-widest ml-2">Petugas Kebersihan</label>
                 <input 
                   type="text" 
                   required
                   placeholder="Siapa yang membersihkan?"
                   className="w-full h-12 px-5 rounded-2xl border-gray-100 dark:bg-gray-900 text-sm font-bold uppercase"
                   value={formData.staffName}
                   onChange={(e) => setFormData({...formData, staffName: e.target.value})}
                 />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {[
                   { id: 'mattress', label: 'Kasur & Linen', icon: 'bed' },
                   { id: 'accessories', label: 'Aksesoris & Elektronik', icon: 'devices' },
                   { id: 'bathroom', label: 'Kamar Mandi', icon: 'shower' },
                   { id: 'cleanliness', label: 'Kebersihan Umum', icon: 'cleaning_services' }
                 ].map((item) => (
                   <div key={item.id} className="p-4 bg-gray-50 dark:bg-black/20 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <span className="material-symbols-outlined text-primary text-2xl">{item.icon}</span>
                         <span className="text-xs font-bold uppercase dark:text-white">{item.label}</span>
                      </div>
                      <button 
                        type="button"
                        onClick={() => toggleCheck(item.id as any)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                          formData.checks[item.id as keyof typeof formData.checks] === 'Baik' 
                            ? 'bg-emerald-500 text-white' 
                            : 'bg-rose-500 text-white'
                        }`}
                      >
                        {formData.checks[item.id as keyof typeof formData.checks]}
                      </button>
                   </div>
                 ))}
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-bold text-brand-gray uppercase tracking-widest ml-2">Catatan Tambahan / Kondisi Aset</label>
                 <textarea 
                   className="w-full h-24 p-5 rounded-3xl border-gray-100 dark:bg-gray-900 text-sm font-medium resize-none"
                   placeholder="Tuliskan jika ada barang yang rusak atau hilang..."
                   value={formData.notes}
                   onChange={(e) => setFormData({...formData, notes: e.target.value})}
                 />
              </div>

              <div className="pt-4 flex gap-4">
                 <button type="submit" className="flex-[2] py-4 bg-primary text-white text-[10px] font-bold rounded-2xl shadow-xl hover:scale-[1.02] transition-all uppercase tracking-widest">
                    Simpan Laporan & Update Kamar
                 </button>
                 <button type="button" onClick={() => setSelectedRoom(null)} className="flex-1 py-4 bg-gray-100 text-brand-gray text-[10px] font-bold rounded-2xl uppercase">Batal</button>
              </div>
           </form>
        </div>
      )}
    </div>
  );
};

export default WeeklyService;

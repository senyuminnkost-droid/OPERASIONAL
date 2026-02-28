import React, { useState } from 'react';
import { Room, ComplaintType, Complaint } from '../types';
import { FASUM_LIST } from '../constants';

interface ComplaintInputProps {
  rooms: Room[];
  onSubmit: (complaint: Complaint) => void;
  onCancel: () => void;
}

const ComplaintInput: React.FC<ComplaintInputProps> = ({ rooms, onSubmit, onCancel }) => {
  const [locationType, setLocationType] = useState<'Room' | 'Fasum'>('Room');
  const [roomId, setRoomId] = useState<number>(0);
  const [fasumName, setFasumName] = useState<string>(FASUM_LIST[0]);
  const [type, setType] = useState<ComplaintType>(ComplaintType.AIR);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(''); // Hapus default tanggal hari ini
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (locationType === 'Room' && roomId === 0) return alert('Pilih nomor kamar');
    if (!date) return alert('Silakan pilih tanggal temuan terlebih dahulu');
    
    const locationName = locationType === 'Room' 
      ? `Kamar ${roomId}` 
      : fasumName;

    const newComplaint: Complaint = {
      id: Math.random().toString(36).substring(7),
      locationType,
      roomId: locationType === 'Room' ? roomId : undefined,
      locationName,
      type,
      description,
      date,
      status: 'Baru',
    };
    onSubmit(newComplaint);
  };

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return "Pilih Tanggal...";
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex flex-col gap-1 mb-8">
        <h1 className="text-3xl font-black dark:text-white tracking-tight">Input Keluhan Baru</h1>
        <p className="text-[#617589] dark:text-gray-400 text-sm">Silakan pilih lokasi dan isi detail keluhan fasilitas Senyum INN.</p>
      </div>

      <div className="bg-white dark:bg-[#1a242f] rounded-2xl shadow-xl border border-[#dbe0e6] dark:border-[#2d3a4b] overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 lg:p-10 space-y-8">
          
          {/* Location Switcher */}
          <div className="space-y-4">
            <label className="block text-base font-bold dark:text-gray-200">Lokasi Keluhan</label>
            <div className="flex p-1.5 bg-gray-100 dark:bg-gray-800 rounded-xl w-full max-w-md">
              <button
                type="button"
                onClick={() => setLocationType('Room')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-black transition-all ${locationType === 'Room' ? 'bg-white dark:bg-gray-700 text-primary shadow-sm' : 'text-gray-500'}`}
              >
                <span className="material-symbols-outlined text-lg">meeting_room</span>
                UNIT KAMAR
              </button>
              <button
                type="button"
                onClick={() => setLocationType('Fasum')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-black transition-all ${locationType === 'Fasum' ? 'bg-white dark:bg-gray-700 text-primary shadow-sm' : 'text-gray-500'}`}
              >
                <span className="material-symbols-outlined text-lg">apartment</span>
                FASILITAS UMUM
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="block text-base font-bold dark:text-gray-200">Tanggal Temuan</label>
                <div 
                  className="relative group cursor-pointer" 
                  onClick={() => setIsCalendarOpen(true)}
                >
                  <div className={`w-full h-12 rounded-xl border border-[#dbe0e6] dark:border-gray-700 dark:bg-gray-800 pl-4 pr-10 flex items-center group-hover:border-primary transition-colors text-sm font-medium ${date ? 'text-[#111418] dark:text-white' : 'text-gray-400 italic'}`}>
                    {formatDateDisplay(date)}
                  </div>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-primary transition-colors">
                    calendar_today
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-base font-bold dark:text-gray-200">
                  {locationType === 'Room' ? 'Pilih Kamar' : 'Pilih Fasilitas'}
                </label>
                {locationType === 'Room' ? (
                  <select 
                    className="w-full rounded-xl border-[#dbe0e6] dark:border-gray-700 dark:bg-gray-800 dark:text-white h-12 px-4 focus:ring-primary focus:border-primary text-sm appearance-none"
                    value={roomId}
                    onChange={(e) => setRoomId(Number(e.target.value))}
                  >
                    <option value={0}>Pilih Nomor Kamar</option>
                    {rooms.map(room => (
                      <option key={room.id} value={room.id}>{room.name}</option>
                    ))}
                  </select>
                ) : (
                  <select 
                    className="w-full rounded-xl border-[#dbe0e6] dark:border-gray-700 dark:bg-gray-800 dark:text-white h-12 px-4 focus:ring-primary focus:border-primary text-sm appearance-none"
                    value={fasumName}
                    onChange={(e) => setFasumName(e.target.value)}
                  >
                    {FASUM_LIST.map(fasum => (
                      <option key={fasum} value={fasum}>{fasum}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="block text-base font-bold dark:text-gray-200">Kategori Masalah</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.values(ComplaintType).map(item => (
                    <label key={item} className={`text-sm font-bold flex items-center justify-center rounded-xl border px-3 py-3 cursor-pointer transition-all ${type === item ? 'bg-primary/10 border-primary text-primary' : 'border-[#dbe0e6] dark:border-gray-700 hover:border-primary'}`}>
                      {item}
                      <input 
                        type="radio" 
                        className="hidden" 
                        name="complaint_type" 
                        checked={type === item}
                        onChange={() => setType(item)}
                      />
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-base font-bold dark:text-gray-200">Deskripsi Detail</label>
            <textarea 
              className="w-full rounded-2xl border-[#dbe0e6] dark:border-gray-700 dark:bg-gray-800 dark:text-white px-4 py-4 focus:ring-primary focus:border-primary placeholder:text-gray-400 text-sm min-h-[120px]" 
              placeholder={`Contoh: ${locationType === 'Room' ? 'Lampu kamar mandi redup dan sering berkedip.' : 'Kran air di dapur bersama patah.'}`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            ></textarea>
          </div>

          <div className="flex items-center justify-end gap-3 pt-6 border-t border-[#dbe0e6] dark:border-[#2d3a4b]">
            <button 
              type="button"
              onClick={onCancel}
              className="px-8 py-3 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2d3a4b] rounded-xl transition-colors"
            >
              Batal
            </button>
            <button 
              type="submit"
              className="px-10 py-3 text-sm font-bold bg-primary text-white hover:bg-orange-600 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-xl">save</span>
              Simpan Laporan
            </button>
          </div>
        </form>
      </div>

      {isCalendarOpen && (
        <CalendarModal 
          currentDate={date} 
          onSelect={(newDate) => {
            setDate(newDate);
            setIsCalendarOpen(false);
          }} 
          onClose={() => setIsCalendarOpen(false)} 
        />
      )}
    </div>
  );
};

// Internal Helper Component for Custom Calendar Popup
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
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

export default ComplaintInput;

import React, { useState } from 'react';
import { Complaint } from '../types';

interface HistoryProps {
  complaints: Complaint[];
}

const History: React.FC<HistoryProps> = ({ complaints }) => {
  const [filterType] = useState('Semua Jenis');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  
  const filtered = complaints.filter(c => filterType === 'Semua Jenis' || c.type === filterType);

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="p-6 lg:p-10 space-y-8 animate-in fade-in duration-500 max-w-[1400px] mx-auto min-h-screen">
      <div className="flex flex-col gap-2 no-print">
        <h1 className="text-4xl font-black dark:text-white tracking-tighter uppercase italic italic leading-none">Log & Riwayat</h1>
        <p className="text-brand-gray font-bold uppercase text-[10px] tracking-[0.3em] mt-2">Arsip Pemeliharaan Fasilitas Senyum INN</p>
      </div>

      <div className="bg-white dark:bg-brand-black border-2 border-gray-100 dark:border-brand-gray/20 rounded-[32px] overflow-hidden shadow-xl no-print">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 dark:bg-brand-gray/5 border-b border-gray-100 dark:border-brand-gray/20">
              <tr>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-brand-gray">Tanggal</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-brand-gray">Lokasi Unit</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-brand-gray">Kategori</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-brand-gray w-1/4">Keterangan Masalah</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-brand-gray">Status</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-brand-gray text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-brand-gray/10">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-primary/5 dark:hover:bg-primary/5 transition-colors group">
                  <td className="px-8 py-6 text-[11px] font-bold dark:text-brand-gray whitespace-nowrap">{c.date}</td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-brand-gray group-hover:text-primary transition-colors">
                        {c.locationType === 'Room' ? 'meeting_room' : 'apartment'}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-xs font-black dark:text-white uppercase tracking-tight">{c.locationName}</span>
                        {c.locationType === 'Fasum' && <span className="text-[8px] font-black text-primary uppercase italic">Fasum Area</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-[9px] font-black uppercase tracking-widest italic">
                      {c.type}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-xs text-brand-gray font-medium italic line-clamp-1 max-w-xs leading-relaxed">"{c.description}"</td>
                  <td className="px-8 py-6">
                    <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.15em] shadow-sm ${
                      c.status === 'Baru' ? 'bg-rose-500 text-white' :
                      c.status === 'Proses' ? 'bg-amber-500 text-white' :
                      'bg-emerald-500 text-white'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button 
                      onClick={() => setSelectedComplaint(c)}
                      className="size-10 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-xl transition-all flex items-center justify-center shadow-sm"
                    >
                      <span className="material-symbols-outlined text-xl">visibility</span>
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                 <tr><td colSpan={6} className="p-32 text-center opacity-20 font-black italic uppercase tracking-[0.5em] text-xl">No Records Found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DETAIL */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-brand-black/90 backdrop-blur-md animate-in fade-in duration-300 no-print">
          <div className="bg-white dark:bg-brand-black rounded-[40px] shadow-2xl border-2 border-primary/20 w-full max-w-2xl overflow-hidden flex flex-col">
            <div className="p-8 border-b border-gray-100 dark:border-brand-gray/20 bg-primary text-white flex justify-between items-center shrink-0">
               <div>
                  <h3 className="font-black text-2xl uppercase tracking-tighter italic leading-none">Voucher Perbaikan</h3>
                  <p className="text-[10px] font-black opacity-80 uppercase tracking-[0.4em] mt-3">Maintenance Timeline Log</p>
               </div>
               <button onClick={() => setSelectedComplaint(null)} className="size-12 flex items-center justify-center text-primary bg-white rounded-2xl shadow-xl transition-all active:scale-95">
                 <span className="material-symbols-outlined text-2xl font-bold">close</span>
               </button>
            </div>

            <div className="overflow-y-auto p-12 space-y-10" id="printable-area">
               <div className="flex justify-between items-start border-b-4 border-gray-50 dark:border-brand-gray/10 pb-10">
                 <div>
                   <h2 className="text-4xl font-black text-primary italic leading-none tracking-tighter">SENYUM INN</h2>
                   <p className="text-[11px] font-black text-brand-gray uppercase tracking-[0.4em] mt-3">Exclusive kost Management</p>
                 </div>
                 <div className="text-right">
                    <p className="text-[10px] font-black text-brand-gray uppercase tracking-widest mb-2">Voucher Status</p>
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md text-white ${
                      selectedComplaint.status === 'Selesai' ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}>{selectedComplaint.status}</span>
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-12">
                 <div className="space-y-8">
                    <div>
                      <p className="text-[10px] font-black text-brand-gray uppercase tracking-widest mb-2 italic">Unit Penempatan</p>
                      <p className="text-xl font-black dark:text-white uppercase tracking-tighter border-b-2 border-gray-50 dark:border-brand-gray/10 pb-2">{selectedComplaint.locationName}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-brand-gray uppercase tracking-widest mb-2 italic">Kategori Perbaikan</p>
                      <p className="text-lg font-black text-primary uppercase tracking-tighter border-b-2 border-primary/5 pb-2 italic">{selectedComplaint.type}</p>
                    </div>
                 </div>
                 
                 <div className="relative pl-8 border-l-4 border-primary/10 space-y-8">
                    <div className="relative">
                       <span className="absolute -left-[38px] top-1 size-4 rounded-full bg-rose-500 border-4 border-white dark:border-brand-black"></span>
                       <p className="text-[9px] font-black text-brand-gray uppercase tracking-widest">Report Log</p>
                       <p className="text-sm font-black dark:text-white tracking-tighter uppercase">{selectedComplaint.date}</p>
                    </div>
                    {selectedComplaint.startDate && (
                       <div className="relative">
                          <span className="absolute -left-[38px] top-1 size-4 rounded-full bg-amber-500 border-4 border-white dark:border-brand-black"></span>
                          <p className="text-[9px] font-black text-brand-gray uppercase tracking-widest">Technician Start</p>
                          <p className="text-sm font-black dark:text-white tracking-tighter uppercase">{selectedComplaint.startDate} <span className="text-[9px] opacity-50 font-bold italic ml-2">by {selectedComplaint.technician}</span></p>
                       </div>
                    )}
                    {selectedComplaint.finishedDate && (
                       <div className="relative">
                          <span className="absolute -left-[38px] top-1 size-4 rounded-full bg-emerald-500 border-4 border-white dark:border-brand-black"></span>
                          <p className="text-[9px] font-black text-brand-gray uppercase tracking-widest">Closed Ticket</p>
                          <p className="text-sm font-black text-emerald-600 tracking-tighter uppercase">{selectedComplaint.finishedDate}</p>
                       </div>
                    )}
                 </div>
               </div>

               <div className="bg-gray-50/50 dark:bg-brand-gray/5 p-8 rounded-3xl border-2 border-dashed border-gray-100 dark:border-brand-gray/20">
                  <p className="text-[10px] font-black text-brand-gray uppercase tracking-widest mb-3 italic">Deskripsi Keluhan User</p>
                  <p className="text-sm font-bold text-gray-700 dark:text-brand-gray leading-relaxed italic opacity-80">"{selectedComplaint.description}"</p>
                  {selectedComplaint.notes && (
                    <div className="mt-8 pt-8 border-t-2 border-gray-100 dark:border-brand-gray/20">
                      <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-3 italic">Maintenance Action Log</p>
                      <p className="text-sm font-bold text-brand-black dark:text-white leading-relaxed">{selectedComplaint.notes}</p>
                    </div>
                  )}
               </div>

               {selectedComplaint.cost !== undefined && (
                 <div className="flex justify-end pt-4">
                    <div className="bg-brand-black dark:bg-white p-8 rounded-[32px] text-right shadow-2xl">
                       <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-2">Biaya Operasional</p>
                       <p className="text-4xl font-black text-white dark:text-brand-black tracking-tighter leading-none italic">{formatCurrency(selectedComplaint.cost)}</p>
                    </div>
                 </div>
               )}
            </div>

            <div className="p-8 bg-gray-50/50 dark:bg-black/20 border-t border-gray-100 dark:border-brand-gray/20 flex gap-4 shrink-0">
              <button 
                onClick={() => setSelectedComplaint(null)}
                className="flex-1 py-4.5 text-[11px] font-black text-brand-gray uppercase tracking-widest bg-white border border-gray-200 rounded-[24px] hover:bg-gray-50 transition-all"
              >Tutup Detail</button>
              <button 
                onClick={() => window.print()}
                className="flex-[2] py-4.5 bg-primary text-white text-[11px] font-black rounded-[24px] uppercase tracking-[0.3em] shadow-xl shadow-primary/30 hover:bg-brand-black transition-all flex items-center justify-center gap-3"
              >
                <span className="material-symbols-outlined text-2xl">print</span>
                CETAK BUKTI PERBAIKAN
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;

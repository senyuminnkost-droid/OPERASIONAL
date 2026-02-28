
import React, { useState, useMemo } from 'react';
import { Complaint, OperationalReminder, FinanceTransaction } from '../types';

interface CalendarReportProps {
  reminders: OperationalReminder[];
  complaints: Complaint[];
  finance: FinanceTransaction[];
  onBack: () => void;
}

const CalendarReport: React.FC<CalendarReportProps> = ({ reminders, complaints, finance, onBack }) => {
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const executionLog = useMemo(() => {
    const logs: any[] = [];

    // 1. Eksekusi dari Jurnal Keuangan (yang berasal dari Kalender)
    finance.forEach(f => {
      if (f.description.includes('Pelunasan:') && f.date >= dateRange.start && f.date <= dateRange.end) {
        const staffMatch = f.description.match(/Petugas: ([^)]+)/);
        const taskTitle = f.description.match(/Pelunasan: ([^ (]+)/);
        logs.push({
          id: f.id,
          date: f.date,
          title: taskTitle ? taskTitle[1] : 'Tugas Rutin',
          category: f.category,
          pic: staffMatch ? staffMatch[1] : 'Admin',
          cost: f.amount,
          notes: f.description.split(')')[1]?.replace('-', '').trim() || '-',
          type: 'Rutin'
        });
      }
    });

    // 2. Eksekusi dari Complaint yang sudah selesai
    complaints.forEach(c => {
      if (c.status === 'Selesai' && c.finishedDate && c.finishedDate >= dateRange.start && c.finishedDate <= dateRange.end) {
        logs.push({
          id: c.id,
          date: c.finishedDate,
          title: c.locationName,
          category: c.type,
          pic: c.technician || 'Teknisi Luar',
          cost: c.cost || 0,
          notes: c.notes || '-',
          type: 'Maintenance'
        });
      }
    });

    return logs.sort((a, b) => b.date.localeCompare(a.date));
  }, [finance, complaints, dateRange]);

  const stats = useMemo(() => {
    const totalCost = executionLog.reduce((acc, curr) => acc + curr.cost, 0);
    const routineCount = executionLog.filter(l => l.type === 'Rutin').length;
    const maintenanceCount = executionLog.filter(l => l.type === 'Maintenance').length;
    
    // Most active PIC
    const picCounts: Record<string, number> = {};
    executionLog.forEach(l => {
      picCounts[l.pic] = (picCounts[l.pic] || 0) + 1;
    });
    const topPic = Object.entries(picCounts).sort((a,b) => b[1] - a[1])[0];

    return { totalCost, routineCount, maintenanceCount, topPic };
  }, [executionLog]);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  const handleDownloadCSV = () => {
    if (executionLog.length === 0) return alert('Tidak ada data eksekusi');
    const headers = ['Tanggal', 'Kegiatan', 'Kategori', 'Petugas', 'Biaya', 'Catatan'];
    const rows = executionLog.map(l => [l.date, l.title, l.category, l.pic, l.cost, l.notes.replace(/,/g, ';')]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Log_Eksekusi_Operasional_${dateRange.start}_to_${dateRange.end}.csv`;
    link.click();
  };

  return (
    <div className="p-6 lg:p-10 space-y-8 animate-in fade-in duration-500 max-w-[1400px] mx-auto min-h-screen">
      
      {/* HEADER & FILTER */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 no-print">
        <div className="flex items-center gap-6">
           <button onClick={onBack} className="size-12 bg-white dark:bg-brand-black border border-gray-100 dark:border-gray-800 rounded-xl flex items-center justify-center hover:text-primary transition-all shadow-sm">
              <span className="material-symbols-outlined">arrow_back</span>
           </button>
           <div>
             <h1 className="text-4xl font-black dark:text-white uppercase tracking-tighter italic leading-none">Log Eksekusi Kerja</h1>
             <p className="text-brand-gray font-bold uppercase text-[10px] tracking-[0.4em] mt-3">Laporan Kendali Operasional Kalender</p>
           </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          <div className="flex items-center gap-2 bg-white dark:bg-brand-black p-2 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
             <input type="date" value={dateRange.start} onChange={(e) => setDateRange({...dateRange, start: e.target.value})} className="bg-transparent border-none text-[10px] font-black uppercase dark:text-white" />
             <span className="text-gray-300">/</span>
             <input type="date" value={dateRange.end} onChange={(e) => setDateRange({...dateRange, end: e.target.value})} className="bg-transparent border-none text-[10px] font-black uppercase dark:text-white" />
          </div>
          <button onClick={handleDownloadCSV} className="h-12 px-6 bg-white dark:bg-brand-black border border-gray-200 dark:border-gray-800 text-brand-black dark:text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all">CSV</button>
          <button onClick={() => window.print()} className="h-12 px-8 bg-primary text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all">CETAK LAPORAN</button>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 no-print">
         <div className="bg-emerald-600 p-8 rounded-[32px] shadow-xl text-white flex flex-col justify-between h-40">
            <p className="text-[10px] font-black text-white/60 uppercase tracking-widest italic">Tugas Rutin Selesai</p>
            <p className="text-4xl font-black italic">{stats.routineCount} <span className="text-sm opacity-50 not-italic uppercase">Jobs</span></p>
         </div>
         <div className="bg-blue-600 p-8 rounded-[32px] shadow-xl text-white flex flex-col justify-between h-40">
            <p className="text-[10px] font-black text-white/60 uppercase tracking-widest italic">Maintenance Selesai</p>
            <p className="text-4xl font-black italic">{stats.maintenanceCount} <span className="text-sm opacity-50 not-italic uppercase">Tickets</span></p>
         </div>
         <div className="bg-brand-black p-8 rounded-[32px] shadow-xl text-white flex flex-col justify-between h-40 border-b-8 border-primary">
            <p className="text-[10px] font-black text-white/60 uppercase tracking-widest italic">Total Pengeluaran</p>
            <p className="text-2xl font-black italic">{formatCurrency(stats.totalCost)}</p>
         </div>
         <div className="bg-white dark:bg-brand-black p-8 rounded-[32px] border-2 border-primary/20 shadow-xl flex flex-col justify-between h-40">
            <p className="text-[10px] font-black text-primary uppercase tracking-widest italic">Top Eksekutor (PIC)</p>
            <div>
               <p className="text-xl font-black dark:text-white uppercase truncate tracking-tighter">{stats.topPic ? stats.topPic[0] : '-'}</p>
               <p className="text-[9px] font-bold text-brand-gray mt-1 uppercase">{stats.topPic ? stats.topPic[1] : 0} Tugas Selesai</p>
            </div>
         </div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white dark:bg-brand-black border-2 border-gray-100 dark:border-brand-gray/20 rounded-[40px] overflow-hidden shadow-2xl flex-1 flex flex-col" id="printable-area">
        <div className="p-10 border-b border-gray-100 dark:border-brand-gray/20 flex justify-between items-center bg-gray-50/30 dark:bg-black/20 shrink-0">
           <div>
              <h3 className="text-2xl font-black dark:text-white uppercase tracking-tighter italic leading-none">Detail Eksekusi Operasional</h3>
              <p className="text-[10px] font-bold text-brand-gray uppercase tracking-[0.3em] mt-3 italic">Periode: {dateRange.start} s/d {dateRange.end}</p>
           </div>
           <div className="hidden print:block text-right">
              <h4 className="text-primary font-black text-xl italic leading-none">SENYUM INN</h4>
              <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Exclusive Management Report</p>
           </div>
        </div>

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead className="bg-gray-50/50 dark:bg-brand-gray/5 text-[10px] font-black text-brand-gray uppercase tracking-widest border-b border-gray-100 dark:border-brand-gray/20">
              <tr>
                <th className="px-8 py-6 w-32">Tanggal</th>
                <th className="px-8 py-6 w-56">Kegiatan / Lokasi</th>
                <th className="px-8 py-6 w-40">Kategori</th>
                <th className="px-8 py-6 w-44">Petugas (PIC)</th>
                <th className="px-8 py-6 text-right w-40">Biaya Real</th>
                <th className="px-8 py-6">Catatan Hasil</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-brand-gray/10">
              {executionLog.length > 0 ? executionLog.map((log) => (
                <tr key={log.id} className="hover:bg-primary/5 transition-colors group">
                  <td className="px-8 py-6 text-[11px] font-bold dark:text-gray-400 whitespace-nowrap">{log.date}</td>
                  <td className="px-8 py-6">
                     <div className="flex items-center gap-3">
                        <span className={`material-symbols-outlined text-xl ${log.type === 'Rutin' ? 'text-emerald-500' : 'text-blue-500'}`}>
                           {log.type === 'Rutin' ? 'event_repeat' : 'engineering'}
                        </span>
                        <span className="text-xs font-black dark:text-white uppercase tracking-tight truncate">{log.title}</span>
                     </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-[9px] font-black uppercase tracking-widest text-brand-gray italic">{log.category}</span>
                  </td>
                  <td className="px-8 py-6">
                     <div className="flex items-center gap-2">
                        <div className="size-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><span className="material-symbols-outlined text-sm">person</span></div>
                        <span className="text-[11px] font-black dark:text-white uppercase tracking-tighter truncate">{log.pic}</span>
                     </div>
                  </td>
                  <td className="px-8 py-6 text-right font-black text-emerald-600 italic">{formatCurrency(log.cost)}</td>
                  <td className="px-8 py-6 text-[10px] text-gray-500 font-medium italic leading-relaxed">"{log.notes}"</td>
                </tr>
              )) : (
                <tr>
                   <td colSpan={6} className="py-32 text-center opacity-20 font-black italic uppercase tracking-[0.5em] text-xl">Belum ada eksekusi</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-10 bg-gray-50/50 dark:bg-black/20 border-t border-gray-100 dark:border-brand-gray/20 flex justify-between items-end shrink-0 no-print">
           <p className="text-[9px] font-bold text-gray-400 italic">Laporan ini dihasilkan secara otomatis berdasarkan data eksekusi Kalender Kontrol Senyum INN.</p>
           <div className="bg-primary p-6 rounded-[24px] text-right shadow-2xl">
              <p className="text-[10px] font-black text-white/70 uppercase tracking-widest mb-1">Grand Total Operasional</p>
              <p className="text-3xl font-black text-white tracking-tighter italic leading-none">{formatCurrency(stats.totalCost)}</p>
           </div>
        </div>

        <div className="mt-12 pt-10 border-t border-gray-100 flex justify-between items-end hidden print:flex p-10">
          <div className="text-[10px] text-gray-400 italic font-medium">
             * Dokumen Kendali Operasional Senyum INN v2.1
          </div>
          <div className="text-center w-64">
             <p className="text-[10px] font-bold uppercase text-gray-400 mb-16">Authorized Manager</p>
             <div className="border-t border-gray-300 pt-2 font-bold uppercase text-[11px]">( ____________________ )</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarReport;

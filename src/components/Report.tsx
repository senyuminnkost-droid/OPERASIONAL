
import React, { useState, useMemo } from 'react';
import { Complaint } from '../types';

interface ReportProps {
  complaints: Complaint[];
  onBack: () => void;
}

const Report: React.FC<ReportProps> = ({ complaints, onBack }) => {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = now.toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(firstDay);
  const [endDate, setEndDate] = useState(lastDay);

  const filteredComplaints = useMemo(() => {
    return complaints.filter(c => {
      return c.date >= startDate && c.date <= endDate;
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [complaints, startDate, endDate]);

  const total = filteredComplaints.length;
  const finished = filteredComplaints.filter(c => c.status === 'Selesai').length;

  const formatDateLabel = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const handleDownloadCSV = () => {
    if (filteredComplaints.length === 0) return alert('Tidak ada data dalam periode ini');
    
    const headers = ['ID', 'Tgl Lapor', 'Tgl Mulai', 'Tgl Selesai', 'Lokasi', 'Jenis', 'Kategori', 'Deskripsi', 'Status', 'Teknisi', 'Biaya'];
    const rows = filteredComplaints.map(c => [
      c.id,
      c.date,
      c.startDate || '-',
      c.finishedDate || '-',
      c.locationName,
      c.locationType,
      c.type,
      c.description.replace(/,/g, ' '),
      c.status,
      c.technician || '-',
      c.cost || 0
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Laporan_Senyum_INN_${startDate}_to_${endDate}.csv`);
    link.click();
  };

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark">
      <div className="no-print sticky top-0 z-50 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-[#dbe0e6] dark:border-[#343d48]">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center px-4 py-3 gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button onClick={onBack} className="flex items-center gap-2 p-2 px-4 rounded-xl bg-gray-100 dark:bg-[#1c2632] hover:bg-gray-200 dark:hover:bg-[#2a3644] text-xs font-bold shrink-0">
              <span className="material-symbols-outlined text-lg">arrow_back</span>
              Kembali
            </button>
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-[#1a242f] p-1.5 rounded-xl border border-gray-200 dark:border-gray-700">
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-transparent border-none text-[10px] font-bold p-0 dark:text-white" />
              <span className="text-gray-400">—</span>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-transparent border-none text-[10px] font-bold p-0 dark:text-white" />
            </div>
          </div>
          
          <div className="flex gap-2 w-full md:w-auto">
            <button onClick={handleDownloadCSV} className="flex-1 py-2 px-5 rounded-xl bg-white border border-[#dbe0e6] text-primary font-bold text-xs hover:bg-gray-50 transition-colors">CSV</button>
            <button onClick={() => window.print()} className="flex-1 py-2 px-6 rounded-xl bg-primary text-white font-bold text-xs hover:bg-orange-600 shadow-lg shadow-primary/20 transition-all">CETAK LAPORAN</button>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-10 flex flex-1 justify-center py-10">
        <div className="layout-content-container flex flex-col w-full max-w-[1100px] flex-1 bg-white dark:bg-[#1a2632] p-8 md:p-14 shadow-2xl rounded-3xl print:shadow-none print:p-0">
          <div className="border-b-4 border-primary/20 pb-8 mb-10 text-center">
            <h1 className="text-primary tracking-tighter text-[42px] font-black leading-tight uppercase italic">SENYUM INN</h1>
            <p className="text-[#111418] dark:text-gray-400 text-sm font-black -mt-2 mb-4 uppercase tracking-[0.2em]">Exclusive kost</p>
            <h3 className="text-[#111418] dark:text-gray-300 tracking-tight text-xl font-black mt-2">LAPORAN PEMELIHARAAN & TIMELINE PERBAIKAN</h3>
            <p className="text-primary text-[11px] font-black uppercase tracking-widest mt-4">Periode: {formatDateLabel(startDate)} — {formatDateLabel(endDate)}</p>
          </div>

          <div className="overflow-x-auto border border-[#dbe0e6] dark:border-[#343d48] rounded-xl mb-10">
            <table className="w-full text-left border-collapse table-fixed min-w-[900px]">
              <thead>
                <tr className="bg-[#f6f7f8] dark:bg-[#242f3d]">
                  <th className="p-3 w-28 text-[9px] font-black uppercase tracking-widest text-[#111418] border border-[#dbe0e6]">Lapor</th>
                  <th className="p-3 w-28 text-[9px] font-black uppercase tracking-widest text-[#111418] border border-[#dbe0e6]">Mulai</th>
                  <th className="p-3 w-28 text-[9px] font-black uppercase tracking-widest text-[#111418] border border-[#dbe0e6]">Selesai</th>
                  <th className="p-3 w-32 text-[9px] font-black uppercase tracking-widest text-[#111418] border border-[#dbe0e6]">Lokasi</th>
                  <th className="p-3 w-32 text-[9px] font-black uppercase tracking-widest text-[#111418] border border-[#dbe0e6]">Kategori</th>
                  <th className="p-3 text-[9px] font-black uppercase tracking-widest text-[#111418] border border-[#dbe0e6]">Deskripsi</th>
                  <th className="p-3 w-32 text-[9px] font-black uppercase tracking-widest text-[#111418] border border-[#dbe0e6] text-right">Biaya</th>
                </tr>
              </thead>
              <tbody className="text-[11px]">
                {filteredComplaints.length > 0 ? filteredComplaints.map(c => (
                  <tr key={c.id} className="border-b border-[#dbe0e6] hover:bg-gray-50 dark:hover:bg-[#1c2632]">
                    <td className="p-3 border border-[#dbe0e6] whitespace-nowrap">{c.date}</td>
                    <td className="p-3 border border-[#dbe0e6] whitespace-nowrap">{c.startDate || '-'}</td>
                    <td className="p-3 border border-[#dbe0e6] whitespace-nowrap font-bold text-emerald-600">{c.finishedDate || '-'}</td>
                    <td className="p-3 border border-[#dbe0e6] font-bold">
                       {c.locationName}
                    </td>
                    <td className="p-3 border border-[#dbe0e6]">{c.type}</td>
                    <td className="p-3 border border-[#dbe0e6] italic line-clamp-2">"{c.description}"</td>
                    <td className="p-3 border border-[#dbe0e6] text-right font-bold text-primary">
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(c.cost || 0)}
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={7} className="p-16 text-center text-gray-400 font-bold italic">Tidak ada laporan ditemukan dalam periode ini.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="mt-auto pt-10 border-t-2 border-dashed border-gray-100 dark:border-gray-800 flex justify-between items-end">
             <div className="text-[10px] text-gray-400">
                <p>Dicetak pada: {new Date().toLocaleString('id-ID')}</p>
                <p>Sistem Manajemen Senyum INN v2.0</p>
             </div>
             <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Pengelola Kost</p>
                <div className="h-20 w-40 border-b border-gray-200 ml-auto"></div>
                <p className="text-xs font-bold mt-2">( ____________________ )</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Report;

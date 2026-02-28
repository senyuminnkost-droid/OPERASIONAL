
import React, { useState, useMemo } from 'react';
import { FinanceTransaction } from '../types';

interface FinanceProps {
  transactions: FinanceTransaction[];
  onAddTransaction: (t: FinanceTransaction) => void;
  view?: 'dashboard' | 'journal';
}

const Finance: React.FC<FinanceProps> = ({ transactions, onAddTransaction, view = 'dashboard' }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    type: 'Out' as 'In' | 'Out',
    category: 'Operasional',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    source: 'E' 
  });

  const formatNumber = (val: number) => 
    new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(val);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  const fundSourcesBase = [
    { name: 'Pcash', code: 'A', initial: 1105384, color: 'bg-rose-500' },
    { name: 'General Saving', code: 'B', initial: 20050042, color: 'bg-primary' },
    { name: 'Internet Saving', code: 'C', initial: 3342017, color: 'bg-blue-600' },
    { name: 'Tax Saving', code: 'D', initial: 1241195, color: 'bg-rose-700' },
    { name: 'Revenue', code: 'E', initial: 0, color: 'bg-amber-400' },
    { name: 'THR Saving', code: 'F', initial: 2298493, color: 'bg-emerald-500' },
  ];

  const fundSummaries = useMemo(() => {
    return fundSourcesBase.map(s => {
      const plus = transactions
        .filter(t => t.source === s.code && t.type === 'In')
        .reduce((sum, t) => sum + t.amount, 0);
      const minus = transactions
        .filter(t => t.source === s.code && t.type === 'Out')
        .reduce((sum, t) => sum + t.amount, 0);
      return {
        ...s,
        plus,
        minus,
        final: s.initial + plus - minus
      };
    });
  }, [transactions]);

  const totalIn = transactions.filter(t => t.type === 'In').reduce((acc, curr) => acc + curr.amount, 0);
  const totalOut = transactions.filter(t => t.type === 'Out').reduce((acc, curr) => acc + curr.amount, 0);
  const totalBalance = totalIn - totalOut;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.description) return alert("Lengkapi data transaksi");
    
    onAddTransaction({
      id: `${formData.type === 'In' ? 'CR' : 'CD'}-${Math.random().toString(36).substring(7).toUpperCase()}`,
      type: formData.type,
      category: formData.category,
      amount: Number(formData.amount),
      date: formData.date,
      description: formData.description,
      source: formData.source
    });
    setIsModalOpen(false);
    setFormData({ ...formData, amount: '', description: '' });
  };

  const renderDashboard = () => {
    const kasMasukItems = [
      { label: 'Setoran Modal', val: transactions.filter(t => t.category === 'Modal').reduce((a,b) => a+b.amount, 0) },
      { label: 'Sewa Kamar', val: transactions.filter(t => t.category === 'Sewa Kamar').reduce((a,b) => a+b.amount, 0) },
      { label: 'Lain-lain', val: transactions.filter(t => (t.category === 'Lain-lain' || t.category === 'Lainnya (In)') && t.type === 'In').reduce((a,b) => a+b.amount, 0) },
    ];

    const kasKeluarItems = [
      { label: 'Peralatan', val: transactions.filter(t => t.category === 'Peralatan').reduce((a,b) => a+b.amount, 0) },
      { label: 'Gaji', val: transactions.filter(t => t.category === 'Gaji').reduce((a,b) => a+b.amount, 0) },
      { label: 'Utilitas', val: transactions.filter(t => t.category === 'Listrik' || t.category === 'Air').reduce((a,b) => a+b.amount, 0) },
      { label: 'Mainten', val: transactions.filter(t => t.category === 'Maintenance').reduce((a,b) => a+b.amount, 0) },
      { label: 'Operas', val: transactions.filter(t => t.category === 'Operasional').reduce((a,b) => a+b.amount, 0) },
      { label: 'Market', val: transactions.filter(t => t.category === 'Marketing').reduce((a,b) => a+b.amount, 0) },
      { label: 'Prive', val: transactions.filter(t => t.category === 'Prive').reduce((a,b) => a+b.amount, 0) },
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-8 animate-in fade-in duration-500 items-stretch w-full max-w-full overflow-hidden">
        <div className="lg:col-span-3 flex flex-col w-full">
          <div className="bg-white dark:bg-brand-black rounded-xl border border-emerald-100 overflow-hidden shadow-sm flex flex-col h-full w-full">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-[9px] sm:text-[11px] border-collapse flex-grow table-fixed">
                <thead className="bg-emerald-600 text-white font-bold uppercase tracking-widest">
                  <tr><th className="p-2.5">Kas Masuk</th><th className="p-2.5 text-right w-24">Total</th></tr>
                </thead>
                <tbody className="divide-y divide-emerald-50 dark:divide-emerald-900/10 font-bold uppercase">
                  {kasMasukItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-emerald-50/20">
                      <td className="p-2.5 truncate text-gray-700 dark:text-gray-300">{item.label}</td>
                      <td className="p-2.5 text-right font-bold">{item.val > 0 ? formatNumber(item.val) : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-emerald-500 text-white font-bold p-3 flex justify-between items-center shrink-0 shadow-inner">
               <span className="uppercase tracking-[0.2em] text-[7px] sm:text-[10px]">Total In</span>
               <span className="text-right text-xs sm:text-lg tracking-tight">{formatNumber(totalIn)}</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 flex flex-col w-full">
          <div className="bg-white dark:bg-brand-black rounded-xl border border-rose-100 overflow-hidden shadow-sm flex flex-col h-full w-full">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-[9px] sm:text-[11px] border-collapse flex-grow table-fixed">
                <thead className="bg-rose-600 text-white font-bold uppercase tracking-widest">
                  <tr><th className="p-2.5">Kas Keluar</th><th className="p-2.5 text-right w-24">Total</th></tr>
                </thead>
                <tbody className="divide-y divide-rose-50 dark:divide-rose-900/10 font-bold uppercase">
                  {kasKeluarItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-rose-50/20">
                      <td className="p-2.5 truncate text-gray-700 dark:text-gray-300">{item.label}</td>
                      <td className="p-2.5 text-right font-bold">{item.val > 0 ? formatNumber(item.val) : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-rose-600 text-white font-bold p-3 flex justify-between items-center shrink-0 shadow-inner">
               <span className="uppercase tracking-[0.2em] text-[7px] sm:text-[10px]">Total Out</span>
               <span className="text-right text-xs sm:text-lg tracking-tight">{formatNumber(totalOut)}</span>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 lg:col-span-6 space-y-3 sm:space-y-8 flex flex-col w-full">
          <div className="bg-white dark:bg-brand-black rounded-xl border border-gray-100 dark:border-brand-gray/20 overflow-hidden shadow-sm w-full">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-[8px] sm:text-[11px] border-collapse min-w-[320px] table-fixed">
                <thead className="bg-brand-black dark:bg-brand-gray/40 text-white uppercase tracking-widest">
                  <tr><th className="p-2.5">Account</th><th className="p-2.5 text-right w-16 text-emerald-400">(+)</th><th className="p-2.5 text-right w-16 text-rose-400">(-)</th><th className="p-2.5 text-right w-24">Final</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-brand-gray/10 font-bold">
                  {fundSummaries.map((source) => (
                    <tr key={source.code} className="hover:bg-gray-50/50">
                      <td className="p-2.5 flex items-center gap-1.5 min-w-0">
                         <span className={`size-1.5 rounded-full ${source.color} shrink-0`}></span>
                         <span className="uppercase tracking-tight dark:text-white truncate">{source.name}</span>
                      </td>
                      <td className="p-2.5 text-right text-emerald-600 text-[9px]">{source.plus > 0 ? formatNumber(source.plus) : '-'}</td>
                      <td className="p-2.5 text-right text-rose-600 text-[9px]">{source.minus > 0 ? formatNumber(source.minus) : '-'}</td>
                      <td className="p-2.5 text-right text-primary text-[9px]">{formatNumber(source.final)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="bg-brand-black rounded-2xl p-4 sm:p-10 shadow-lg flex-grow relative overflow-hidden w-full">
            <h3 className="text-center font-bold text-[7px] sm:text-xs uppercase mb-4 text-white tracking-[0.3em]">Aset & Likuiditas</h3>
            <div className="flex items-end justify-between h-20 sm:h-40 px-1 sm:px-6 gap-1 sm:gap-6 relative z-10 w-full overflow-hidden">
               {fundSummaries.map((source) => (
                 <div key={source.code} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                    <div className={`w-full ${source.color} rounded-t transition-all duration-1000`} 
                         style={{ height: `${Math.max(5, (source.final / 35000000) * 100)}%` }}>
                    </div>
                    <p className="mt-1 text-[5px] font-bold text-white/40 uppercase text-center leading-tight tracking-widest truncate w-full">{source.name}</p>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderJournal = () => (
    <div className="space-y-0 animate-in slide-in-from-bottom-4 duration-500 w-full max-w-full overflow-hidden">
       <div className="bg-brand-black p-3 flex flex-col sm:flex-row justify-between items-center rounded-t-xl shadow border-b border-brand-gray/20 gap-3 w-full">
          <h2 className="text-white font-bold uppercase text-xs tracking-widest flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-lg">receipt_long</span>
            Jurnal Umum
          </h2>
          <div className="flex gap-2 w-full sm:w-auto">
             <div className="flex-1 bg-white/5 border border-white/10 px-2 py-1.5 flex flex-col items-center min-w-0 rounded-lg">
                <span className="text-[6px] font-bold text-emerald-400 uppercase tracking-widest leading-none">In</span>
                <span className="text-[10px] font-bold text-white mt-1 leading-none">{formatNumber(totalIn)}</span>
             </div>
             <div className="flex-1 bg-white/5 border border-white/10 px-2 py-1.5 flex flex-col items-center min-w-0 rounded-lg">
                <span className="text-[6px] font-bold text-rose-400 uppercase tracking-widest leading-none">Out</span>
                <span className="text-[10px] font-bold text-white mt-1 leading-none">{formatNumber(totalOut)}</span>
             </div>
          </div>
       </div>
       <div className="bg-white dark:bg-brand-black border border-brand-black dark:border-brand-gray/20 overflow-x-auto shadow-sm rounded-b-xl w-full">
          <table className="w-full text-left text-[9px] sm:text-[11px] border-collapse min-w-[650px] table-fixed">
             <thead className="bg-gray-50 dark:bg-brand-gray/10 text-brand-black dark:text-brand-gray font-bold uppercase tracking-widest">
                <tr>
                   <th className="p-3 border-r border-gray-100 w-20">Date</th>
                   <th className="p-3 border-r border-gray-100 text-center w-16">Type</th>
                   <th className="p-3 border-r border-gray-100 text-center w-10">S/D</th>
                   <th className="p-3 border-r border-gray-100 w-28">Category</th>
                   <th className="p-3 border-r border-gray-100">Desc</th>
                   <th className="p-3 text-right w-24">Nominal</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-gray-100 dark:divide-brand-gray/10 font-bold uppercase">
                {transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-primary/5 transition-colors">
                     <td className="p-3 border-r border-gray-100 text-brand-gray opacity-70">
                       {new Date(t.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                     </td>
                     <td className={`p-3 border-r border-gray-100 text-center text-[8px] ${t.type === 'In' ? 'text-emerald-600' : 'text-rose-600'}`}>
                       {t.type === 'In' ? 'IN' : 'OUT'}
                     </td>
                     <td className="p-3 border-r border-gray-100 text-center text-primary">{t.source}</td>
                     <td className="p-3 border-r border-gray-100 truncate text-[8px]">{t.category}</td>
                     <td className="p-3 border-r border-gray-100 text-brand-gray normal-case leading-tight truncate text-[9px]">{t.description}</td>
                     <td className="p-3 text-right text-[10px]">{formatNumber(t.amount)}</td>
                  </tr>
                ))}
             </tbody>
          </table>
       </div>
    </div>
  );

  return (
    <div className="px-2 py-4 sm:p-6 lg:p-10 space-y-4 sm:space-y-10 animate-in fade-in duration-500 max-w-full w-full overflow-x-hidden box-border">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 no-print w-full">
        <div className="flex items-center gap-2 sm:gap-6 w-full">
           <div className="size-10 sm:size-16 bg-primary/10 rounded-xl flex items-center justify-center text-primary border border-primary/20 shrink-0">
              <span className="material-symbols-outlined text-xl sm:text-4xl">account_balance_wallet</span>
           </div>
           <div className="min-w-0 flex-1">
             <h1 className="text-lg sm:text-4xl font-bold dark:text-white uppercase tracking-tight leading-none truncate">{view === 'dashboard' ? 'Budgeting' : 'Financial Journal'}</h1>
             <p className="text-brand-gray font-bold uppercase text-[7px] sm:text-[10px] tracking-[0.2em] mt-1 truncate">Periode: {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</p>
           </div>
        </div>
        <div className="w-full sm:w-auto">
           <button 
             onClick={() => setIsModalOpen(true)}
             className="w-full sm:w-auto bg-brand-black dark:bg-white text-white dark:text-brand-black px-6 py-3 rounded-xl text-[9px] font-bold uppercase tracking-widest shadow"
           >
             ADD ENTRY
           </button>
        </div>
      </div>

      {/* RENDER TOP CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-6 w-full">
         <div className="bg-emerald-600 p-3 sm:p-8 rounded-xl sm:rounded-[40px] shadow border-b-4 border-emerald-800 flex flex-col justify-between h-20 sm:h-44 group">
            <p className="text-[6px] sm:text-[11px] font-bold text-white/60 uppercase tracking-widest">Revenue</p>
            <p className="text-base sm:text-4xl font-bold text-white tracking-tight">{formatCurrency(totalIn)}</p>
         </div>
         <div className="bg-rose-600 p-3 sm:p-8 rounded-xl sm:rounded-[40px] shadow border-b-4 border-rose-800 flex flex-col justify-between h-20 sm:h-44 group">
            <p className="text-[6px] sm:text-[11px] font-bold text-white/60 uppercase tracking-widest">Expenditure</p>
            <p className="text-base sm:text-4xl font-bold text-white tracking-tight">{formatCurrency(totalOut)}</p>
         </div>
         <div className="bg-primary p-3 sm:p-8 rounded-xl sm:rounded-[40px] shadow border-b-4 border-orange-700 flex flex-col justify-between h-20 sm:h-44 group">
            <p className="text-[6px] sm:text-[11px] font-bold text-white/60 uppercase tracking-widest">Balance</p>
            <p className="text-base sm:text-4xl font-bold text-white tracking-tight">{formatCurrency(totalBalance)}</p>
         </div>
      </div>

      {view === 'dashboard' ? renderDashboard() : renderJournal()}

      {/* INPUT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-2 bg-brand-black/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white dark:bg-brand-black rounded-2xl shadow-2xl border border-primary/20 w-full max-w-[96vw] overflow-hidden flex flex-col max-h-[95vh]">
            <div className="p-4 sm:p-10 bg-primary text-white flex justify-between items-center shrink-0">
              <div className="min-w-0 pr-4">
                <h3 className="text-base sm:text-3xl font-bold tracking-tight leading-none truncate">Journal Entry</h3>
                <p className="text-[7px] font-bold opacity-80 uppercase tracking-[0.2em] mt-1">Input System</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="size-8 hover:bg-white/20 rounded-lg transition-all border border-white/20 flex items-center justify-center shrink-0"><span className="material-symbols-outlined text-xl">close</span></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 sm:p-10 space-y-4 overflow-y-auto scrollbar-hide flex-1">
              <div className="space-y-2">
                <label className="text-[8px] font-bold text-brand-gray uppercase">Flow & Origin</label>
                <div className="flex p-0.5 bg-gray-100 rounded-lg border border-gray-200">
                  <button type="button" onClick={() => setFormData({...formData, type: 'In', category: 'Sewa Kamar', source: 'E'})} className={`flex-1 py-2 text-[8px] font-bold rounded-md transition-all uppercase tracking-widest ${formData.type === 'In' ? 'bg-white text-primary shadow-sm' : 'text-gray-400'}`}>IN</button>
                  <button type="button" onClick={() => setFormData({...formData, type: 'Out', category: 'Operasional', source: 'A'})} className={`flex-1 py-2 text-[8px] font-bold rounded-md transition-all uppercase tracking-widest ${formData.type === 'Out' ? 'bg-white text-rose-500 shadow-sm' : 'text-gray-400'}`}>OUT</button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[7px] font-bold text-brand-gray uppercase ml-1">Date</label>
                  <input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full h-9 px-2 rounded-lg border-gray-100 dark:bg-brand-black text-[9px] font-bold focus:ring-primary" />
                </div>
                <div className="space-y-1">
                  <label className="text-[7px] font-bold text-brand-gray uppercase ml-1">Saku</label>
                  <select value={formData.source} onChange={(e) => setFormData({...formData, source: e.target.value})} className="w-full h-9 px-2 rounded-lg border-gray-100 dark:bg-brand-black text-[9px] font-bold uppercase focus:ring-primary">
                    {fundSourcesBase.map(s => <option key={s.code} value={s.code}>{s.code} - {s.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[7px] font-bold text-brand-gray uppercase ml-1">Nominal (Rp)</label>
                <input type="number" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} className="w-full h-10 px-3 rounded-lg border-2 border-primary bg-primary/5 text-base font-bold text-primary" placeholder="0" />
              </div>

              <div className="space-y-1">
                <label className="text-[7px] font-bold text-brand-gray uppercase ml-1">Keterangan</label>
                <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full h-16 p-3 rounded-lg border-gray-100 dark:bg-brand-black text-[9px] font-bold resize-none leading-tight" placeholder="Detail..."></textarea>
              </div>

              <button type="submit" className="w-full py-3.5 bg-brand-black dark:bg-white text-white dark:text-brand-black font-bold text-[10px] rounded-xl uppercase tracking-widest shadow">SAVE ENTRY</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Finance;

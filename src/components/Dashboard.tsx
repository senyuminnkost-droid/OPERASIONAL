
import React, { useState } from 'react';
import { Room, Complaint, FinanceTransaction, Tenant } from '../types';

interface DashboardProps {
  rooms: Room[];
  complaints: Complaint[];
  finance: FinanceTransaction[];
  tenants: Tenant[];
  onAction: () => void;
  onUpdateRoom: (roomId: number, updates: Partial<Room>) => void;
  onQuickPay: (tenantId: string) => void;
  aiInsight?: string;
  isAiLoading?: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  rooms, 
  complaints, 
  finance,
  tenants,
  onAction, 
  onUpdateRoom,
  onQuickPay,
  aiInsight, 
  isAiLoading 
}) => {
  const [selectedRoomDetail, setSelectedRoomDetail] = useState<Room | null>(null);
  const [isEditingOccupancy, setIsEditingOccupancy] = useState(false);
  const [isEditingSpecs, setIsEditingSpecs] = useState(false);
  
  const [editFormData, setEditFormData] = useState({ isOccupied: false, tenantName: '', entryDate: '' });
  const [specsFormData, setSpecsFormData] = useState({ type: '', size: '', bed: '', electricity: '', facilities: '' });

  const currentMonth = new Date().getMonth();
  const todayDate = new Date().getDate();

  const monthlyIn = finance
    .filter(t => t.type === 'In' && new Date(t.date).getMonth() === currentMonth)
    .reduce((acc, curr) => acc + curr.amount, 0);

  const monthlyOut = finance
    .filter(t => t.type === 'Out' && new Date(t.date).getMonth() === currentMonth)
    .reduce((acc, curr) => acc + curr.amount, 0);

  const netProfit = monthlyIn - monthlyOut;

  const projectedRevenue = tenants
    .filter(t => t.isActive)
    .reduce((acc, curr) => acc + curr.monthlyRent, 0);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  const stats = [
    { label: 'Keluhan', value: complaints.filter(c => c.status !== 'Selesai').length, icon: 'report_problem', color: 'text-rose-500' },
    { label: 'Terisi', value: rooms.filter(r => r.isOccupied).length, icon: 'group', color: 'text-primary' },
    { label: 'Okupansi', value: `${Math.round((rooms.filter(r => r.isOccupied).length / rooms.length) * 100)}%`, icon: 'analytics', color: 'text-emerald-500' },
    { label: 'Piutang', value: formatCurrency(projectedRevenue), icon: 'account_balance_wallet', color: 'text-primary' },
  ];

  const dueToday = tenants.filter(t => t.isActive && new Date(t.entryDate).getDate() === todayDate);
  const upcomingDue = tenants.filter(t => {
    if (!t.isActive) return false;
    const dueDay = new Date(t.entryDate).getDate();
    return dueDay > todayDate && dueDay <= todayDate + 7;
  }).sort((a, b) => new Date(a.entryDate).getDate() - new Date(b.entryDate).getDate());

  const activeComplaints = complaints.filter(c => c.status !== 'Selesai').slice(0, 5);

  const handleOpenDetail = (room: Room) => {
    setSelectedRoomDetail(room);
    setIsEditingOccupancy(false);
    setIsEditingSpecs(false);
    setEditFormData({ isOccupied: room.isOccupied, tenantName: room.tenantName || '', entryDate: room.entryDate || '' });
    setSpecsFormData({
      type: room.specs.type,
      size: room.specs.size,
      bed: room.specs.bed,
      electricity: room.specs.electricity,
      facilities: room.specs.facilities.join(', ')
    });
  };

  const handleSaveOccupancy = () => {
    if (selectedRoomDetail) {
      onUpdateRoom(selectedRoomDetail.id, {
        isOccupied: editFormData.isOccupied,
        tenantName: editFormData.isOccupied ? editFormData.tenantName : undefined,
        entryDate: editFormData.isOccupied ? editFormData.entryDate : undefined
      });
      setIsEditingOccupancy(false);
      setSelectedRoomDetail({...selectedRoomDetail, ...editFormData, tenantName: editFormData.isOccupied ? editFormData.tenantName : undefined});
    }
  };

  const handleSaveSpecs = () => {
    if (selectedRoomDetail) {
      const updatedSpecs = {
        type: specsFormData.type,
        size: specsFormData.size,
        bed: specsFormData.bed,
        electricity: specsFormData.electricity,
        facilities: specsFormData.facilities.split(',').map(f => f.trim()).filter(f => f !== '')
      };
      
      onUpdateRoom(selectedRoomDetail.id, { specs: updatedSpecs });
      setIsEditingSpecs(false);
      setSelectedRoomDetail({...selectedRoomDetail, specs: updatedSpecs});
    }
  };

  return (
    <div className="px-2 py-4 sm:px-6 lg:p-10 space-y-4 animate-in fade-in duration-500 overflow-x-hidden max-w-[100vw] w-full box-border">
      
      {/* SUMMARY TOP BAR */}
      <div className="flex flex-col lg:flex-row gap-2 w-full">
        <div className="w-full lg:w-1/4 bg-white dark:bg-brand-black p-3 rounded-2xl border border-primary/20 shadow-sm flex flex-col justify-center relative overflow-hidden shrink-0">
           <div className="absolute -right-4 -bottom-4 size-20 bg-primary/10 rounded-full blur-2xl"></div>
           <h4 className="text-[7px] sm:text-[9px] font-bold text-primary uppercase tracking-[0.2em] mb-1">Senyum INN AI</h4>
           <div className="flex items-center gap-2">
             {isAiLoading && <span className="size-1 bg-primary rounded-full animate-ping"></span>}
             <p className="text-[10px] sm:text-xs text-brand-black dark:text-white font-medium line-clamp-2 leading-tight opacity-80">“{aiInsight}”</p>
           </div>
        </div>
        
        <div className="w-full lg:flex-1 grid grid-cols-2 md:grid-cols-4 gap-2">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white dark:bg-brand-black p-2.5 sm:p-5 rounded-2xl border border-gray-100 dark:border-brand-gray/20 shadow-sm flex flex-col justify-between group hover:border-primary/50 transition-colors">
              <div className="flex justify-between items-start">
                 <p className="text-[7px] sm:text-[10px] font-bold text-brand-gray uppercase tracking-widest">{stat.label}</p>
                 <span className={`material-symbols-outlined text-base sm:text-xl ${stat.color}`}>{stat.icon}</span>
              </div>
              <p className="text-sm sm:text-lg font-bold dark:text-white truncate mt-1 tracking-tight">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* THREE-COLUMN OPERATIONAL VIEW */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3 w-full">
         
         {/* 1. BILLING CENTER */}
         <div className="lg:col-span-4 bg-white dark:bg-brand-black p-3 sm:p-6 rounded-[20px] border border-gray-100 dark:border-brand-gray/20 shadow-sm flex flex-col h-[260px] sm:h-[320px] w-full overflow-hidden">
            <h3 className="text-[9px] sm:text-[11px] font-bold dark:text-white uppercase tracking-[0.2em] mb-2 sm:mb-5 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-sm">event_repeat</span>
              Agenda Penagihan
            </h3>
            <div className="space-y-2 flex-1 overflow-y-auto scrollbar-hide w-full">
               <div className="space-y-1.5 w-full">
                  <div className="flex items-center gap-2">
                     <span className="text-[7px] font-bold text-rose-500 uppercase tracking-widest">Hari Ini</span>
                     <div className="h-px flex-1 bg-rose-100 dark:bg-rose-900/20"></div>
                  </div>
                  {dueToday.length > 0 ? dueToday.map(t => (
                    <div key={t.id} className="flex items-center justify-between p-2 bg-rose-50/30 dark:bg-rose-900/10 rounded-xl border border-rose-100/50 w-full overflow-hidden">
                        <div className="min-w-0 pr-2">
                          <p className="text-[10px] font-bold dark:text-white uppercase truncate">{t.name}</p>
                          <p className="text-[7px] font-medium text-brand-gray uppercase">{rooms.find(r => r.id === t.roomId)?.name}</p>
                        </div>
                        <div className="text-right shrink-0 flex flex-col items-end">
                          <p className="text-[10px] font-bold text-rose-600 leading-none">{formatCurrency(t.monthlyRent)}</p>
                          <button onClick={() => onQuickPay(t.id)} className="text-[7px] font-bold text-rose-500 uppercase mt-1.5 tracking-widest hover:bg-rose-500 hover:text-white px-1.5 py-0.5 rounded-lg border border-rose-200">Bayar</button>
                        </div>
                    </div>
                  )) : (
                    <p className="text-[8px] text-brand-gray font-medium uppercase text-center py-2 opacity-50">Jadwal Aman</p>
                  )}
               </div>

               <div className="space-y-1.5 pt-1">
                  <div className="flex items-center gap-2">
                     <span className="text-[7px] font-bold text-primary uppercase tracking-widest">7 Hari Ke Depan</span>
                     <div className="h-px flex-1 bg-primary/10"></div>
                  </div>
                  {upcomingDue.length > 0 ? upcomingDue.map(t => (
                    <div key={t.id} className="flex items-center justify-between p-2 bg-gray-50/50 dark:bg-brand-gray/5 rounded-xl border border-gray-100 dark:border-brand-gray/10">
                        <div className="min-w-0 pr-2">
                          <p className="text-[10px] font-bold dark:text-white uppercase truncate">{t.name}</p>
                          <p className="text-[7px] font-medium text-brand-gray uppercase truncate">Tgl {new Date(t.entryDate).getDate()} — {rooms.find(r => r.id === t.roomId)?.name}</p>
                        </div>
                        <p className="text-[9px] font-bold text-primary shrink-0">{formatCurrency(t.monthlyRent)}</p>
                    </div>
                  )) : (
                    <p className="text-[8px] text-brand-gray font-medium uppercase text-center py-2 opacity-50">Antrean Kosong</p>
                  )}
               </div>
            </div>
         </div>

         {/* 2. MAINTENANCE */}
         <div className="lg:col-span-4 bg-white dark:bg-brand-black p-3 sm:p-6 rounded-[20px] border border-gray-100 dark:border-brand-gray/20 shadow-sm flex flex-col h-[260px] sm:h-[320px] w-full">
            <h3 className="text-[9px] sm:text-[11px] font-bold dark:text-white uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-sm">engineering</span>
              Status Perbaikan
            </h3>
            <div className="space-y-1.5 flex-1 overflow-y-auto scrollbar-hide">
               {activeComplaints.length > 0 ? activeComplaints.map(c => (
                 <div key={c.id} className="p-2 bg-gray-50/50 dark:bg-brand-gray/5 rounded-xl border border-gray-100 dark:border-brand-gray/10 flex justify-between items-center group overflow-hidden">
                    <div className="min-w-0 pr-2 flex-1">
                       <p className="text-[10px] font-bold dark:text-white uppercase truncate tracking-tight">{c.locationName}</p>
                       <p className="text-[7px] font-medium text-brand-gray uppercase truncate">{c.description}</p>
                    </div>
                    <span className={`px-1 py-0.5 rounded-full text-[7px] font-bold uppercase shrink-0 ${c.status === 'Baru' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>
                       {c.status}
                    </span>
                 </div>
               )) : (
                 <div className="h-full flex flex-col items-center justify-center opacity-20">
                    <span className="material-symbols-outlined text-2xl">verified</span>
                    <p className="text-[8px] font-bold uppercase mt-2 tracking-[0.3em]">Fasilitas OK</p>
                 </div>
               )}
            </div>
            <button onClick={onAction} className="mt-2 w-full py-2 bg-primary text-white text-[8px] font-bold rounded-xl uppercase tracking-[0.1em] shadow-sm">Kelola Tiket</button>
         </div>

         {/* 3. FINANCE */}
         <div className="lg:col-span-4 bg-white dark:bg-brand-black p-3 sm:p-6 rounded-[20px] border border-gray-100 dark:border-brand-gray/20 shadow-sm flex flex-col h-[260px] sm:h-[320px] w-full">
            <h3 className="text-[9px] sm:text-[11px] font-bold dark:text-white uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-sm">payments</span>
              Kas Bulan Ini
            </h3>
            <div className="space-y-2 flex-1 w-full">
               <div className="grid grid-cols-1 gap-1.5 w-full">
                  <div className="flex justify-between items-center p-2 rounded-xl bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100">
                     <span className="text-[8px] font-bold text-emerald-600 uppercase">In</span>
                     <span className="text-[10px] font-bold text-emerald-600 tracking-tight">{formatCurrency(monthlyIn)}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-xl bg-rose-50/50 dark:bg-rose-900/10 border border-rose-100">
                     <span className="text-[8px] font-bold text-rose-600 uppercase">Out</span>
                     <span className="text-[10px] font-bold text-rose-600 tracking-tight">{formatCurrency(monthlyOut)}</span>
                  </div>
               </div>

               <div className="pt-2 border-t border-gray-100 dark:border-brand-gray/20 mt-auto w-full">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[8px] font-bold text-brand-gray uppercase">Net</span>
                    <span className={`text-[11px] font-bold tracking-tight ${netProfit >= 0 ? 'text-primary' : 'text-rose-500'}`}>
                      {formatCurrency(netProfit)}
                    </span>
                  </div>
                  <div className="relative h-1.5 bg-gray-100 dark:bg-brand-gray/20 rounded-full overflow-hidden">
                    <div className="absolute top-0 left-0 h-full bg-primary transition-all duration-1000" style={{ width: `${Math.min(100, (monthlyIn / projectedRevenue) * 100 || 0)}%` }}></div>
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* UNIT STATUS GRID */}
      <div className="space-y-2 pt-2 w-full">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[9px] font-bold dark:text-white uppercase tracking-[0.1em] flex items-center gap-1">
            <span className="material-symbols-outlined text-primary text-base">grid_view</span>
            Monitor Unit
          </h3>
          <div className="flex items-center gap-2 shrink-0">
             <div className="flex items-center gap-1"><span className="size-1 rounded-full bg-emerald-500"></span><span className="text-[6px] font-bold text-brand-gray uppercase">Ready</span></div>
             <div className="flex items-center gap-1"><span className="size-1 rounded-full bg-primary"></span><span className="text-[6px] font-bold text-brand-gray uppercase">Booked</span></div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 w-full">
          {rooms.map((room) => (
            <div key={room.id} 
                 onClick={() => handleOpenDetail(room)}
                 className="bg-white dark:bg-brand-black rounded-xl border border-gray-100 dark:border-brand-gray/20 shadow-sm hover:border-primary transition-all flex flex-col overflow-hidden cursor-pointer h-[100px] relative w-full box-border">
              <div className={`h-1 w-full shrink-0 ${room.isOccupied ? 'bg-primary' : 'bg-emerald-500'}`}></div>
              <div className="p-2 flex flex-col h-full min-w-0">
                <div className="min-w-0">
                  <h4 className="text-[10px] font-bold dark:text-white uppercase truncate">{room.name}</h4>
                  <p className="text-[6px] font-bold text-primary uppercase tracking-widest truncate">{room.specs.type.split(' ')[0]}</p>
                </div>
                
                <div className="mt-1.5 flex-1 min-w-0">
                   <p className="text-[9px] font-bold dark:text-white uppercase tracking-tight truncate opacity-80 leading-none">{room.isOccupied ? room.tenantName : 'Ready'}</p>
                </div>

                <div className="mt-auto pt-1 flex justify-between items-center">
                   <span className="text-[6px] font-bold text-primary uppercase tracking-widest">Manage</span>
                   <span className="material-symbols-outlined text-primary text-[10px]">arrow_forward</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL DETAIL */}
      {selectedRoomDetail && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-2 bg-brand-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-brand-black rounded-2xl shadow-xl border border-primary/20 w-full max-w-[96vw] overflow-hidden flex flex-col max-h-[95vh]">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/30 shrink-0">
               <div className="min-w-0 pr-4">
                  <h3 className="font-bold text-base dark:text-white uppercase tracking-tight leading-none truncate">{selectedRoomDetail.name}</h3>
                  <p className="text-[7px] font-bold text-primary uppercase tracking-[0.2em] mt-1">Unit Monitoring</p>
               </div>
               <button onClick={() => setSelectedRoomDetail(null)} className="size-8 flex items-center justify-center text-brand-gray hover:text-primary bg-white rounded-lg shadow border shrink-0">
                 <span className="material-symbols-outlined text-lg">close</span>
               </button>
            </div>
            
            <div className="p-4 space-y-5 overflow-y-auto scrollbar-hide flex-1">
               {/* OCCUPANCY SECTION */}
               <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-[9px] font-bold text-primary uppercase flex items-center gap-1">
                       <div className="w-4 h-0.5 bg-primary"></div>
                       Hunian
                    </h4>
                    {!isEditingOccupancy && <button onClick={() => setIsEditingOccupancy(true)} className="text-[8px] font-bold text-brand-gray uppercase underline underline-offset-2">Edit</button>}
                  </div>
                  
                  {isEditingOccupancy ? (
                    <div className="space-y-2.5 p-3 bg-gray-50 dark:bg-brand-gray/5 rounded-xl border">
                       <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                             <input type="radio" checked={editFormData.isOccupied} onChange={() => setEditFormData({...editFormData, isOccupied: true})} className="size-3 text-primary" />
                             <span className="text-[9px] font-bold dark:text-white uppercase">Terisi</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                             <input type="radio" checked={!editFormData.isOccupied} onChange={() => setEditFormData({...editFormData, isOccupied: false})} className="size-3 text-primary" />
                             <span className="text-[9px] font-bold dark:text-white uppercase">Kosong</span>
                          </label>
                       </div>
                       {editFormData.isOccupied && (
                          <div className="space-y-2">
                            <input type="text" className="w-full h-9 px-3 rounded-lg border-gray-200 dark:bg-brand-black text-[10px] font-bold" value={editFormData.tenantName} onChange={(e) => setEditFormData({...editFormData, tenantName: e.target.value})} placeholder="Nama Member" />
                            <input type="date" className="w-full h-9 px-3 rounded-lg border-gray-200 dark:bg-brand-black text-[10px] font-bold" value={editFormData.entryDate} onChange={(e) => setEditFormData({...editFormData, entryDate: e.target.value})} />
                          </div>
                       )}
                       <div className="flex gap-2 pt-1">
                          <button onClick={handleSaveOccupancy} className="flex-1 py-2 bg-primary text-white text-[9px] font-bold rounded-lg">Simpan</button>
                          <button onClick={() => setIsEditingOccupancy(false)} className="flex-1 py-2 bg-white text-brand-gray text-[9px] font-bold rounded-lg border">Batal</button>
                       </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                       <div className="p-2.5 bg-gray-50/50 dark:bg-brand-gray/5 rounded-xl border border-gray-100">
                          <p className="text-[6px] font-bold text-brand-gray uppercase mb-0.5">Member</p>
                          <p className="text-[10px] font-bold dark:text-white uppercase truncate">{selectedRoomDetail.isOccupied ? selectedRoomDetail.tenantName : 'Empty'}</p>
                       </div>
                       <div className="p-2.5 bg-gray-50/50 dark:bg-brand-gray/5 rounded-xl border border-gray-100">
                          <p className="text-[6px] font-bold text-brand-gray uppercase mb-0.5">Date In</p>
                          <p className="text-[10px] font-bold dark:text-white truncate">{selectedRoomDetail.entryDate || '-'}</p>
                       </div>
                    </div>
                  )}
               </div>

               {/* SPECS SECTION */}
               <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-[9px] font-bold text-primary uppercase flex items-center gap-1">
                       <div className="w-4 h-0.5 bg-primary"></div>
                       Spesifikasi
                    </h4>
                    {!isEditingSpecs && <button onClick={() => setIsEditingSpecs(true)} className="text-[8px] font-bold text-brand-gray uppercase underline underline-offset-2">Edit</button>}
                  </div>

                  {!isEditingSpecs ? (
                    <div className="grid grid-cols-2 gap-2">
                       {[
                         { icon: 'aspect_ratio', label: 'Luas', val: selectedRoomDetail.specs.size },
                         { icon: 'bed', label: 'Kasur', val: selectedRoomDetail.specs.bed },
                         { icon: 'bolt', label: 'Listrik', val: selectedRoomDetail.specs.electricity },
                         { icon: 'category', label: 'Tipe', val: selectedRoomDetail.specs.type }
                       ].map((spec, i) => (
                         <div key={i} className="p-2 bg-gray-50/30 dark:bg-brand-gray/5 rounded-lg border border-gray-50 flex items-center gap-2 overflow-hidden">
                            <span className="material-symbols-outlined text-primary text-[14px] shrink-0">{spec.icon}</span>
                            <div className="min-w-0 flex-1"><p className="text-[5px] font-bold text-brand-gray uppercase truncate">{spec.label}</p><p className="text-[8px] font-bold dark:text-white uppercase truncate leading-tight">{spec.val}</p></div>
                         </div>
                       ))}
                    </div>
                  ) : (
                    <div className="space-y-2 p-3 bg-gray-50/50 dark:bg-brand-gray/5 rounded-xl border border-gray-100">
                       <div className="grid grid-cols-2 gap-2">
                          <input type="text" className="w-full h-8 px-2 rounded-lg border-gray-200 dark:bg-brand-black text-[9px] font-bold" value={specsFormData.type} onChange={(e) => setSpecsFormData({...specsFormData, type: e.target.value})} placeholder="Type" />
                          <input type="text" className="w-full h-8 px-2 rounded-lg border-gray-200 dark:bg-brand-black text-[9px] font-bold" value={specsFormData.size} onChange={(e) => setSpecsFormData({...specsFormData, size: e.target.value})} placeholder="Size" />
                       </div>
                       <div className="flex gap-2">
                          <button onClick={handleSaveSpecs} className="flex-1 py-2 bg-primary text-white text-[9px] font-bold rounded-lg">Update</button>
                          <button onClick={() => setIsEditingSpecs(false)} className="flex-1 py-2 bg-white text-brand-gray text-[9px] font-bold rounded-lg border">Cancel</button>
                       </div>
                    </div>
                  )}
               </div>
            </div>

            <div className="p-4 flex gap-2 border-t border-gray-100 bg-gray-50/50 shrink-0">
               <button onClick={onAction} className="flex-[2] py-3 bg-primary text-white text-[10px] font-bold rounded-xl uppercase tracking-widest">Lapor Masalah</button>
               <button onClick={() => setSelectedRoomDetail(null)} className="flex-1 py-3 bg-white text-brand-gray text-[10px] font-bold rounded-xl uppercase border">Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

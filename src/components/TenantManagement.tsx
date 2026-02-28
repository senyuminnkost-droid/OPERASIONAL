
import React, { useState, useMemo } from 'react';
import { Tenant, Room } from '../types';

interface TenantProps {
  tenants: Tenant[];
  rooms: Room[];
  onAddTenant: (t: Tenant) => void;
  onUpdateTenant: (tenantId: string, updates: Partial<Tenant>) => void;
}

const TenantManagement: React.FC<TenantProps> = ({ tenants, rooms, onAddTenant, onUpdateTenant }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'Aktif' | 'Riwayat'>('Aktif');
  const [previewTenant, setPreviewTenant] = useState<Tenant | null>(null);
  const [showMarketingModal, setShowMarketingModal] = useState(false);
  const [showActiveReport, setShowActiveReport] = useState(false);
  const [reportType, setReportType] = useState<'Aktif' | 'Semua'>('Aktif');
  const [searchTerm, setSearchTerm] = useState('');

  const activeTenants = useMemo(() => tenants.filter(t => t.isActive), [tenants]);
  const historyTenants = useMemo(() => tenants.filter(t => !t.isActive), [tenants]);
  
  const filteredTenants = useMemo(() => {
    const base = filterStatus === 'Aktif' ? activeTenants : historyTenants;
    if (!searchTerm) return base;
    return base.filter(t => 
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      t.phone.includes(searchTerm) ||
      rooms.find(r => r.id === t.roomId)?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [filterStatus, activeTenants, historyTenants, searchTerm, rooms]);

  const marketingData = useMemo(() => {
    const list = reportType === 'Aktif' ? activeTenants : tenants;
    const occupations: Record<string, number> = {};
    const genderCount = { 'Laki-laki': 0, 'Perempuan': 0 };
    let totalRevenue = 0;

    list.forEach(t => {
      if (t.isActive) totalRevenue += t.monthlyRent;
      occupations[t.occupation || 'Lainnya'] = (occupations[t.occupation || 'Lainnya'] || 0) + 1;
      genderCount[t.gender]++;
    });

    const topJobs = Object.entries(occupations).sort((a,b) => b[1] - a[1]).slice(0, 5);
    return { totalRevenue, topJobs, genderCount, totalCount: list.length };
  }, [reportType, activeTenants, tenants]);

  const calculateStayDuration = (tenant: Tenant) => {
    const start = new Date(tenant.entryDate);
    const end = tenant.isActive ? new Date() : (tenant.leaveDate ? new Date(tenant.leaveDate) : new Date());
    
    let months = (end.getFullYear() - start.getFullYear()) * 12;
    months -= start.getMonth();
    months += end.getMonth();
    
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (months <= 0) return `${diffDays} Hari`;
    const remainingDays = end.getDate() - start.getDate();
    return `${months} Bulan ${remainingDays > 0 ? remainingDays + ' Hari' : ''}`;
  };

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    idCardNumber: '',
    address: '',
    gender: 'Laki-laki' as 'Laki-laki' | 'Perempuan',
    occupation: '',
    roomId: 0,
    entryDate: new Date().toISOString().split('T')[0],
    leaveDate: '',
    monthlyRent: '',
    emergencyName: '',
    emergencyPhone: '',
    isActive: true
  });

  const handleOpenAdd = () => {
    setIsEditMode(false);
    setSelectedTenantId(null);
    setFormData({
      name: '', phone: '', idCardNumber: '', address: '', gender: 'Laki-laki', occupation: '',
      roomId: 0, entryDate: new Date().toISOString().split('T')[0], leaveDate: '', monthlyRent: '',
      emergencyName: '', emergencyPhone: '', isActive: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tenant: Tenant) => {
    setIsEditMode(true);
    setSelectedTenantId(tenant.id);
    setFormData({
      name: tenant.name,
      phone: tenant.phone,
      idCardNumber: tenant.idCardNumber,
      address: tenant.address,
      gender: tenant.gender,
      occupation: tenant.occupation,
      roomId: tenant.roomId,
      entryDate: tenant.entryDate,
      leaveDate: tenant.leaveDate || '',
      monthlyRent: tenant.monthlyRent.toString(),
      emergencyName: tenant.emergencyName,
      emergencyPhone: tenant.emergencyPhone,
      isActive: tenant.isActive
    });
    setIsModalOpen(true);
  };

  const handleCheckOut = (tenant: Tenant) => {
    if (window.confirm(`Konfirmasi Check-out untuk penghuni: ${tenant.name}? Kamar akan otomatis tersedia kembali.`)) {
      onUpdateTenant(tenant.id, { isActive: false });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.roomId === 0 || !formData.name) return alert("Data Nama dan Kamar wajib diisi.");
    
    const tenantData = {
      name: formData.name,
      phone: formData.phone,
      idCardNumber: formData.idCardNumber,
      address: formData.address,
      gender: formData.gender,
      occupation: formData.occupation,
      roomId: formData.roomId,
      entryDate: formData.entryDate,
      leaveDate: formData.isActive ? undefined : (formData.leaveDate || new Date().toISOString().split('T')[0]),
      monthlyRent: Number(formData.monthlyRent),
      emergencyName: formData.emergencyName,
      emergencyPhone: formData.emergencyPhone,
      isActive: formData.isActive
    };

    if (isEditMode && selectedTenantId) {
      onUpdateTenant(selectedTenantId, tenantData);
    } else {
      onAddTenant({
        ...tenantData,
        id: `T-${Math.random().toString(36).substring(7)}`,
        isActive: true,
      });
    }
    setIsModalOpen(false);
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="p-6 lg:p-10 space-y-8 animate-in fade-in duration-500 max-w-[1500px] mx-auto min-h-screen">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 no-print">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg">
             <span className="material-symbols-outlined text-4xl">group</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold dark:text-white uppercase">Data Penghuni</h1>
            <p className="text-brand-gray text-[11px] font-bold uppercase tracking-widest mt-1">Sistem Manajemen Database Senyum INN</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          <div className="relative flex-1 md:min-w-[300px]">
             <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-brand-gray">search</span>
             <input 
               type="text" 
               placeholder="Cari nama, unit, atau kontak..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full h-12 pl-12 pr-4 rounded-xl border border-gray-200 dark:border-gray-800 dark:bg-brand-black text-sm font-semibold focus:ring-primary focus:border-primary transition-all"
             />
          </div>

          <div className="flex bg-gray-100 dark:bg-brand-gray/10 p-1 rounded-xl border border-gray-200 dark:border-gray-800">
             <button 
               onClick={() => setFilterStatus('Aktif')}
               className={`px-6 py-2.5 rounded-lg text-xs font-bold uppercase transition-all ${filterStatus === 'Aktif' ? 'bg-primary text-white shadow-md' : 'text-brand-gray hover:text-primary'}`}
             >
               Aktif ({activeTenants.length})
             </button>
             <button 
               onClick={() => setFilterStatus('Riwayat')}
               className={`px-6 py-2.5 rounded-lg text-xs font-bold uppercase transition-all ${filterStatus === 'Riwayat' ? 'bg-primary text-white shadow-md' : 'text-brand-gray hover:text-primary'}`}
             >
               Riwayat ({historyTenants.length})
             </button>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => setShowMarketingModal(true)}
              className="w-12 h-12 bg-white dark:bg-brand-black border border-primary/20 text-primary rounded-xl flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-sm"
              title="Intelligence Report"
            >
              <span className="material-symbols-outlined">analytics</span>
            </button>
            <button 
              onClick={() => setShowActiveReport(true)}
              className="w-12 h-12 bg-white dark:bg-brand-black border border-primary/20 text-primary rounded-xl flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-sm"
              title="Laporan Daftar Penghuni Aktif"
            >
              <span className="material-symbols-outlined">list_alt</span>
            </button>
          </div>

          <button 
            onClick={handleOpenAdd}
            className="h-12 px-8 bg-brand-black dark:bg-white text-white dark:text-brand-black rounded-xl font-bold text-xs uppercase tracking-widest shadow-xl hover:bg-primary hover:text-white transition-all"
          >
            + Pendaftaran Baru
          </button>
        </div>
      </div>

      {/* GRID PENGHUNI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 no-print">
        {filteredTenants.length === 0 ? (
          <div className="col-span-full py-40 text-center opacity-20">
            <span className="material-symbols-outlined text-8xl mb-4">person_off</span>
            <p className="font-bold text-lg uppercase tracking-widest">Database Kosong</p>
          </div>
        ) : (
          filteredTenants.map(t => {
            const room = rooms.find(r => r.id === t.roomId);
            return (
              <div key={t.id} className={`bg-white dark:bg-brand-black/20 p-8 rounded-3xl border transition-all flex flex-col ${!t.isActive ? 'border-dashed border-gray-200 grayscale opacity-70' : 'border-gray-100 dark:border-gray-800 hover:border-primary/40 shadow-sm hover:shadow-xl'}`}>
                
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-brand-black/50 flex items-center justify-center text-brand-gray border border-gray-100 dark:border-gray-800">
                    <span className="material-symbols-outlined text-3xl">face</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-lg dark:text-white uppercase truncate leading-tight">{t.name}</h3>
                    <p className="text-primary text-[10px] font-bold uppercase tracking-widest mt-1">{room?.name || `Unit: ${t.roomId}`}</p>
                  </div>
                </div>

                <div className="flex-1 space-y-4 mb-8">
                   <div className="flex items-center gap-3 text-brand-gray dark:text-gray-400">
                      <span className="material-symbols-outlined text-xl">call</span>
                      <span className="text-xs font-bold">{t.phone}</span>
                   </div>
                   <div className="flex items-center gap-3 text-brand-gray dark:text-gray-400">
                      <span className="material-symbols-outlined text-xl">work</span>
                      <span className="text-xs font-bold uppercase truncate">{t.occupation}</span>
                   </div>
                </div>

                <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex gap-2">
                   {t.isActive ? (
                     <button 
                       onClick={() => handleCheckOut(t)}
                       className="flex-1 py-3 bg-rose-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-rose-600 shadow-lg shadow-rose-500/20 transition-all"
                     >
                       Check Out
                     </button>
                   ) : (
                     <div className="flex-1 py-3 bg-gray-100 dark:bg-brand-black text-brand-gray text-[10px] font-bold uppercase text-center rounded-xl">
                        Non-Aktif
                     </div>
                   )}
                   <button onClick={() => handleOpenEdit(t)} className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center hover:bg-primary hover:text-white transition-all">
                     <span className="material-symbols-outlined">edit</span>
                   </button>
                   <button onClick={() => setPreviewTenant(t)} className="w-12 h-12 bg-brand-black text-white rounded-xl flex items-center justify-center hover:bg-primary transition-all">
                     <span className="material-symbols-outlined">badge</span>
                   </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* LAPORAN PENGHUNI AKTIF (TABEL DETAIL) */}
      {showActiveReport && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in zoom-in-95 duration-300">
           <div className="bg-white dark:bg-brand-black w-full max-w-7xl rounded-[40px] overflow-hidden shadow-2xl flex flex-col max-h-[92vh] border border-gray-200 dark:border-gray-800">
              <div className="p-8 bg-brand-black text-white flex justify-between items-center shrink-0 no-print">
                 <div className="flex items-center gap-6">
                    <span className="material-symbols-outlined text-4xl text-primary">list_alt</span>
                    <div>
                      <h3 className="text-2xl font-bold uppercase tracking-tight">Daftar Penghuni Aktif</h3>
                      <p className="text-[10px] font-bold text-primary uppercase tracking-[0.3em] mt-1">Laporan Operasional Senyum INN</p>
                    </div>
                 </div>
                 <div className="flex gap-4">
                    <button onClick={() => window.print()} className="bg-primary text-white px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-3">
                       <span className="material-symbols-outlined">print</span> Cetak Laporan
                    </button>
                    <button onClick={() => setShowActiveReport(false)} className="w-10 h-10 rounded-lg flex items-center justify-center border border-white/10 hover:bg-white/10 transition-colors"><span className="material-symbols-outlined">close</span></button>
                 </div>
              </div>

              <div className="flex-1 overflow-auto p-12 bg-white dark:bg-brand-black" id="printable-report">
                 <div className="mb-10 text-center border-b-2 border-primary/20 pb-8 hidden print:block">
                    <h2 className="text-4xl font-bold text-primary tracking-tighter">SENYUM INN</h2>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.4em] mt-2">Laporan Data Penghuni Aktif Terkini</p>
                    <p className="text-[9px] font-bold text-gray-400 mt-4 uppercase">Dicetak Pada: {new Date().toLocaleString('id-ID')}</p>
                 </div>

                 <table className="w-full text-left border-collapse text-xs">
                    <thead>
                       <tr className="bg-gray-50 dark:bg-brand-gray/10 border-b border-gray-200 dark:border-gray-800">
                          <th className="p-4 font-bold uppercase text-brand-gray w-44">Nama Penghuni</th>
                          <th className="p-4 font-bold uppercase text-brand-gray w-20">Unit</th>
                          <th className="p-4 font-bold uppercase text-brand-gray w-28">Telepon</th>
                          <th className="p-4 font-bold uppercase text-brand-gray w-32">Tgl Masuk</th>
                          <th className="p-4 font-bold uppercase text-brand-gray">Alamat Asal</th>
                          <th className="p-4 font-bold uppercase text-brand-gray w-32">Pekerjaan</th>
                          <th className="p-4 font-bold uppercase text-brand-gray w-36 text-right">Lama Sewa</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                       {activeTenants.map((t) => {
                          const room = rooms.find(r => r.id === t.roomId);
                          return (
                             <tr key={t.id} className="hover:bg-gray-50/50 dark:hover:bg-brand-gray/5">
                                <td className="p-4 font-bold uppercase text-brand-black dark:text-white">{t.name}</td>
                                <td className="p-4 font-bold text-primary">{room?.name || t.roomId}</td>
                                <td className="p-4 font-medium">{t.phone}</td>
                                <td className="p-4 font-bold text-brand-gray/70">{t.entryDate}</td>
                                <td className="p-4 text-gray-500 dark:text-gray-400 leading-relaxed italic pr-6">{t.address || '-'}</td>
                                <td className="p-4 font-semibold uppercase text-[10px] tracking-tight">{t.occupation || '-'}</td>
                                <td className="p-4 text-right font-bold text-brand-black dark:text-white uppercase tracking-tighter">
                                   {calculateStayDuration(t)}
                                </td>
                             </tr>
                          );
                       })}
                       {activeTenants.length === 0 && (
                          <tr>
                             <td colSpan={7} className="p-20 text-center text-gray-400 italic font-bold">Tidak ada penghuni aktif ditemukan.</td>
                          </tr>
                       )}
                    </tbody>
                 </table>

                 <div className="mt-12 pt-10 border-t border-gray-100 flex justify-between items-end hidden print:flex">
                    <div className="text-[10px] text-gray-400 italic font-medium">
                       * Data ini bersifat rahasia dan hanya untuk keperluan administrasi Senyum INN.
                    </div>
                    <div className="text-center w-64">
                       <p className="text-[10px] font-bold uppercase text-gray-400 mb-16">Pengelola Properti</p>
                       <div className="border-t border-gray-300 pt-2 font-bold uppercase text-[11px]">Authorized Staff</div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* MARKETING ANALYTICS MODAL */}
      {showMarketingModal && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in zoom-in-95 duration-300 no-print">
           <div className="bg-white dark:bg-brand-black w-full max-w-6xl rounded-[40px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh] border border-gray-200 dark:border-gray-800">
              <div className="p-8 bg-brand-black text-white flex flex-col md:flex-row justify-between items-center gap-6 shrink-0">
                 <div className="flex items-center gap-6">
                    <span className="material-symbols-outlined text-4xl text-primary">insights</span>
                    <div>
                      <h3 className="text-2xl font-bold uppercase tracking-tight">Marketing Intelligence</h3>
                      <p className="text-[10px] font-bold text-primary uppercase tracking-[0.3em] mt-1">Analisis Basis Data Penghuni</p>
                    </div>
                 </div>
                 <div className="flex bg-white/10 p-1 rounded-xl border border-white/10">
                    <button onClick={() => setReportType('Aktif')} className={`px-6 py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${reportType === 'Aktif' ? 'bg-primary text-white' : 'text-white/50'}`}>Penghuni Aktif</button>
                    <button onClick={() => setReportType('Semua')} className={`px-6 py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${reportType === 'Semua' ? 'bg-primary text-white' : 'text-white/50'}`}>Seluruh Riwayat</button>
                 </div>
                 <button onClick={() => setShowMarketingModal(false)} className="w-10 h-10 hover:bg-white/10 rounded-lg flex items-center justify-center transition-colors"><span className="material-symbols-outlined">close</span></button>
              </div>

              <div className="flex-1 overflow-auto p-10 bg-gray-50/30 dark:bg-brand-black/50">
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                    <div className="bg-white dark:bg-brand-black p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
                       <p className="text-[10px] font-bold text-brand-gray uppercase mb-2">Total Database</p>
                       <p className="text-5xl font-bold text-brand-black dark:text-white">{marketingData.totalCount}</p>
                       <p className="text-[10px] font-bold text-primary mt-4 uppercase">Profil Terdata</p>
                    </div>
                    <div className="bg-white dark:bg-brand-black p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
                       <p className="text-[10px] font-bold text-brand-gray uppercase mb-4">Sebaran Gender</p>
                       <div className="flex items-center gap-8">
                          <div>
                            <p className="text-3xl font-bold text-blue-600">{marketingData.genderCount['Laki-laki']}</p>
                            <p className="text-[9px] font-bold uppercase text-brand-gray mt-1">Pria</p>
                          </div>
                          <div className="w-px h-10 bg-gray-100 dark:bg-gray-800"></div>
                          <div>
                            <p className="text-3xl font-bold text-rose-500">{marketingData.genderCount['Perempuan']}</p>
                            <p className="text-[9px] font-bold uppercase text-brand-gray mt-1">Wanita</p>
                          </div>
                       </div>
                    </div>
                    <div className="md:col-span-2 bg-primary p-8 rounded-[36px] shadow-xl text-white flex flex-col justify-center">
                       <p className="text-[11px] font-bold text-white/70 uppercase mb-3">Estimasi Recurring Revenue</p>
                       <p className="text-5xl font-bold tracking-tighter">{formatCurrency(marketingData.totalRevenue)}</p>
                       <p className="text-[10px] font-bold text-white/80 uppercase mt-5 tracking-[0.2em]">Per Siklus Bulan Aktif</p>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="bg-white dark:bg-brand-black p-10 rounded-[32px] border border-gray-100 dark:border-gray-800 h-[450px] flex flex-col">
                       <h4 className="text-[11px] font-bold uppercase text-brand-gray mb-10 tracking-[0.3em] flex items-center gap-4">
                          <div className="w-8 h-0.5 bg-primary"></div>
                          Segmen Pekerjaan Teratas
                       </h4>
                       <div className="space-y-8 flex-1 overflow-auto pr-4">
                          {marketingData.topJobs.map(([job, count], i) => (
                             <div key={i} className="space-y-3">
                                <div className="flex justify-between items-center">
                                   <span className="text-sm font-bold text-brand-black dark:text-white uppercase">{job}</span>
                                   <span className="text-[11px] font-bold text-primary">{count} Orang</span>
                                </div>
                                <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                   <div className="h-full bg-primary" style={{ width: `${(count / marketingData.totalCount) * 100}%` }}></div>
                                </div>
                             </div>
                          ))}
                       </div>
                    </div>

                    <div className="space-y-8">
                       <div className="bg-brand-black text-white p-10 rounded-[32px] relative overflow-hidden shadow-xl">
                          <span className="material-symbols-outlined text-[120px] absolute -right-4 -bottom-4 opacity-5">campaign</span>
                          <h4 className="text-[11px] font-bold uppercase text-primary mb-6 tracking-[0.3em]">Strategy Insight</h4>
                          <p className="text-lg leading-relaxed text-white/90">
                             "Berdasarkan data {reportType.toLowerCase()}, segmen {marketingData.topJobs[0]?.[0] || 'Umum'} adalah target pasar terkuat Anda saat ini. Pertimbangkan untuk menyesuaikan materi iklan visual Anda untuk menarik kelompok profesi ini."
                          </p>
                       </div>
                    </div>
                 </div>
              </div>
              
              <div className="p-8 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-black/20 flex justify-end gap-4">
                 <button onClick={() => window.print()} className="bg-primary text-white px-8 py-4 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-3">
                    <span className="material-symbols-outlined">print</span> Print Report
                 </button>
                 <button onClick={() => setShowMarketingModal(false)} className="bg-white dark:bg-brand-black border border-gray-200 dark:border-gray-800 text-brand-gray px-8 py-4 rounded-xl text-xs font-bold uppercase">Tutup</button>
              </div>
           </div>
        </div>
      )}

      {/* FORM MODAL PENDAFTARAN / EDIT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-brand-black rounded-[40px] shadow-2xl border border-primary/20 w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="p-8 bg-primary text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-4">
                 <span className="material-symbols-outlined text-3xl">{isEditMode ? 'edit_note' : 'person_add'}</span>
                 <h3 className="text-2xl font-bold uppercase tracking-tight">{isEditMode ? 'Update Data Penghuni' : 'Pendaftaran Baru'}</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-all"><span className="material-symbols-outlined">close</span></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-10 space-y-10 overflow-y-auto scrollbar-hide">
              
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <h4 className="text-[10px] font-bold text-primary uppercase tracking-[0.4em] flex items-center gap-4">
                    <div className="w-12 h-0.5 bg-primary"></div>
                    Identitas Penghuni
                  </h4>
                  {isEditMode && (
                    <div className="flex items-center gap-4 bg-gray-100 dark:bg-brand-gray/10 p-1 rounded-xl">
                      <button type="button" onClick={() => setFormData({...formData, isActive: true})} className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${formData.isActive ? 'bg-primary text-white shadow-md' : 'text-brand-gray'}`}>Aktif</button>
                      <button type="button" onClick={() => setFormData({...formData, isActive: false})} className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${!formData.isActive ? 'bg-rose-500 text-white shadow-md' : 'text-brand-gray'}`}>Riwayat</button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-brand-gray uppercase ml-2">Nama Lengkap</label>
                    <input type="text" placeholder="Sesuai KTP..." value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full h-12 px-5 rounded-xl border-gray-200 dark:border-gray-800 dark:bg-brand-black/50 text-sm font-bold focus:ring-primary focus:border-primary" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-brand-gray uppercase ml-2">Nomor Telepon (WhatsApp)</label>
                    <input type="text" placeholder="08..." value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full h-12 px-5 rounded-xl border-gray-200 dark:border-gray-800 dark:bg-brand-black/50 text-sm font-bold focus:ring-primary focus:border-primary" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-brand-gray uppercase ml-2">NIK (No. KTP)</label>
                    <input type="text" placeholder="16 digit..." value={formData.idCardNumber} onChange={(e) => setFormData({...formData, idCardNumber: e.target.value})} className="w-full h-12 px-5 rounded-xl border-gray-200 dark:border-gray-800 dark:bg-brand-black/50 text-sm font-bold focus:ring-primary focus:border-primary" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-brand-gray uppercase ml-2">Profesi / Pekerjaan</label>
                    <input type="text" placeholder="..." value={formData.occupation} onChange={(e) => setFormData({...formData, occupation: e.target.value})} className="w-full h-12 px-5 rounded-xl border-gray-200 dark:border-gray-800 dark:bg-brand-black/50 text-sm font-bold focus:ring-primary focus:border-primary" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-brand-gray uppercase ml-2">Jenis Kelamin</label>
                    <select value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value as any})} className="w-full h-12 px-5 rounded-xl border-gray-200 dark:border-gray-800 dark:bg-brand-black/50 text-xs font-bold uppercase focus:ring-primary">
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-brand-gray uppercase ml-2">Tgl Mulai Sewa</label>
                      <input type="date" value={formData.entryDate} onChange={(e) => setFormData({...formData, entryDate: e.target.value})} className="w-full h-12 px-5 rounded-xl border-gray-200 dark:border-gray-800 dark:bg-brand-black/50 text-xs font-bold focus:ring-primary" />
                    </div>
                    {!formData.isActive && (
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-brand-gray uppercase ml-2">Tgl Keluar (Check-out)</label>
                        <input type="date" value={formData.leaveDate} onChange={(e) => setFormData({...formData, leaveDate: e.target.value})} className="w-full h-12 px-5 rounded-xl border-rose-200 dark:border-rose-900 dark:bg-brand-black/50 text-xs font-bold focus:ring-rose-500" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-brand-gray uppercase ml-2">Alamat Asal (Sesuai KTP)</label>
                    <textarea value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full h-24 px-5 py-4 rounded-2xl border-gray-200 dark:border-gray-800 dark:bg-brand-black/50 text-sm font-medium focus:ring-primary focus:border-primary resize-none" placeholder="Alamat lengkap asal..." />
                </div>
              </div>

              <div className="space-y-8">
                <h4 className="text-[10px] font-bold text-primary uppercase tracking-[0.4em] flex items-center gap-4">
                   <div className="w-12 h-0.5 bg-primary"></div>
                   Kontak Darurat (Wali / Keluarga)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-brand-gray uppercase ml-2">Nama Penanggung Jawab</label>
                    <input type="text" placeholder="Orang Tua / Saudara..." value={formData.emergencyName} onChange={(e) => setFormData({...formData, emergencyName: e.target.value})} className="w-full h-12 px-5 rounded-xl border-gray-200 dark:border-gray-800 dark:bg-brand-black/50 text-sm font-bold focus:ring-primary focus:border-primary" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-brand-gray uppercase ml-2">Nomor HP Darurat</label>
                    <input type="text" placeholder="Wajib aktif..." value={formData.emergencyPhone} onChange={(e) => setFormData({...formData, emergencyPhone: e.target.value})} className="w-full h-12 px-5 rounded-xl border-gray-200 dark:border-gray-800 dark:bg-brand-black/50 text-sm font-bold focus:ring-primary focus:border-primary" />
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <h4 className="text-[10px] font-bold text-primary uppercase tracking-[0.4em] flex items-center gap-4">
                   <div className="w-12 h-0.5 bg-primary"></div>
                   Penempatan Unit Kamar
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-brand-gray uppercase ml-2">Pilih Unit Kamar</label>
                    <select value={formData.roomId} onChange={(e) => setFormData({...formData, roomId: Number(e.target.value)})} className="w-full h-12 px-5 rounded-xl border-gray-200 dark:border-gray-800 dark:bg-brand-black/50 text-xs font-bold uppercase focus:ring-primary">
                      <option value={0}>Cari Unit Kosong...</option>
                      {rooms.filter(r => !r.isOccupied || (isEditMode && r.id === tenants.find(t => t.id === selectedTenantId)?.roomId)).map(r => (
                        <option key={r.id} value={r.id}>{r.name} ({r.specs.type})</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-brand-gray uppercase ml-2">Harga Sewa Bulanan (Rp)</label>
                    <input type="number" value={formData.monthlyRent} onChange={(e) => setFormData({...formData, monthlyRent: e.target.value})} className="w-full h-12 px-5 rounded-xl border-2 border-primary bg-primary/5 text-xl font-bold text-primary focus:ring-primary" placeholder="0" />
                  </div>
                </div>
              </div>

              <button type="submit" className={`w-full py-5 text-white font-bold text-sm rounded-2xl uppercase tracking-widest shadow-xl transition-all transform active:scale-95 ${formData.isActive ? 'bg-brand-black dark:bg-white dark:text-brand-black hover:bg-primary hover:text-white' : 'bg-rose-600 hover:bg-rose-700'}`}>
                {isEditMode ? 'Simpan Perubahan Data' : 'Konfirmasi Pendaftaran Resmi'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ID CARD PREVIEW */}
      {previewTenant && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in zoom-in-95 duration-500 no-print">
          <div className="bg-white w-full max-w-2xl p-16 shadow-2xl rounded-sm border-t-[14px] border-primary relative overflow-hidden text-brand-black">
            <button onClick={() => setPreviewTenant(null)} className="absolute top-8 right-8 text-brand-gray hover:text-primary transition-all z-20"><span className="material-symbols-outlined text-4xl">close</span></button>
            
            <div className="flex justify-between items-start mb-16 border-b-2 border-gray-100 pb-12">
               <div>
                  <h2 className="text-5xl font-bold text-primary tracking-tighter leading-none">SENYUM INN</h2>
                  <p className="text-[11px] font-bold text-brand-gray uppercase tracking-[0.4em] mt-3">Identity Resident Card</p>
               </div>
               <div className="text-right">
                  <h3 className="text-3xl font-bold uppercase text-brand-black tracking-tight mb-2">PROFIL</h3>
                  <p className="text-base font-bold text-primary tracking-widest">#S-{previewTenant.id.split('-')[1].toUpperCase()}</p>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-10 mb-16">
               <div className="space-y-10">
                  <div>
                    <p className="text-[10px] font-bold text-brand-gray uppercase tracking-widest mb-2">Nama Lengkap</p>
                    <p className="text-2xl font-bold text-brand-black border-b border-gray-100 pb-2 uppercase">{previewTenant.name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-brand-gray uppercase tracking-widest mb-2">NIK</p>
                    <p className="text-lg font-semibold text-brand-black border-b border-gray-100 pb-2 tracking-widest">{previewTenant.idCardNumber || '-'}</p>
                  </div>
               </div>
               <div className="space-y-10">
                  <div>
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2">Unit Kamar</p>
                    <p className="text-2xl font-bold text-primary border-b border-primary/10 pb-2 tracking-widest">UNIT {previewTenant.roomId}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-brand-gray uppercase tracking-widest mb-2">{previewTenant.isActive ? 'Mulai Check-in' : 'Check-in/Check-out'}</p>
                    <p className="text-sm font-semibold text-brand-black border-b border-gray-100 pb-2 uppercase">
                      {previewTenant.entryDate} {previewTenant.isActive ? '' : `s/d ${previewTenant.leaveDate || '-'}`}
                    </p>
                  </div>
               </div>
            </div>

            <div className="flex justify-between items-end pt-12 border-t border-gray-100">
               <div className="text-[10px] text-brand-gray font-bold uppercase tracking-widest opacity-60">* Dokumen resmi administrasi Senyum INN.</div>
               <div className="text-center w-60 border-t-2 border-brand-black pt-4 font-bold uppercase text-brand-black tracking-widest text-[11px]">Authorized Signature</div>
            </div>

            <div className="mt-16 pt-10 flex gap-6 no-print">
               <button onClick={() => window.print()} className="flex-1 py-5 bg-primary text-white font-bold rounded-2xl uppercase tracking-widest text-xs flex items-center justify-center gap-4 shadow-xl hover:bg-brand-black transition-all">
                  <span className="material-symbols-outlined">print</span> Print Profil
               </button>
               <button onClick={() => setPreviewTenant(null)} className="flex-1 py-5 bg-gray-100 text-brand-gray font-bold rounded-2xl uppercase tracking-widest text-xs transition-colors">Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantManagement;

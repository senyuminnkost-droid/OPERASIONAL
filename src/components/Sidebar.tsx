
import React from 'react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  isOpen: boolean;
  onClose: () => void;
  onResetData: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isOpen, onClose, onResetData }) => {
  const menuSections = [
    {
      title: 'OPERASIONAL',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
        { id: 'weekly-service', label: 'Weekly Service', icon: 'cleaning_services' },
        { id: 'attendance', label: 'Absensi Staff', icon: 'how_to_reg' },
        { id: 'actions', label: 'Tindakan Keluhan', icon: 'engineering' },
        { id: 'calendar', label: 'Kalender Operasional', icon: 'calendar_month' },
        { id: 'calendar-report', label: 'Laporan Kalender', icon: 'assignment_turned_in' },
        { id: 'input', label: 'Input Keluhan', icon: 'add_circle' },
        { id: 'history', label: 'Riwayat Perbaikan', icon: 'history' },
        { id: 'report', label: 'Laporan Operasional', icon: 'description' },
      ]
    },
    {
      title: 'KEUANGAN',
      items: [
        { id: 'finance', label: 'Ringkasan Kas', icon: 'analytics' },
        { id: 'finance-journal', label: 'Jurnal & Input', icon: 'receipt_long' },
      ]
    },
    {
      title: 'DATABASE PENGHUNI',
      items: [
        { id: 'tenants', label: 'Data Penghuni', icon: 'group' },
        { id: 'staff', label: 'Data Staff', icon: 'badge' },
      ]
    }
  ];

  return (
    <aside className={`fixed top-0 left-0 h-screen w-72 bg-white dark:bg-brand-black border-r border-gray-100 dark:border-brand-gray/20 z-[50] transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex flex-col h-full">
        
        <div className="p-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="bg-primary size-11 rounded-xl flex items-center justify-center text-white shadow-lg">
              <span className="material-symbols-outlined">apartment</span>
            </div>
            <div>
              <h1 className="text-brand-black dark:text-white text-lg font-bold leading-none uppercase tracking-tight">Senyum INN</h1>
              <p className="text-primary text-[10px] mt-1.5 uppercase font-bold tracking-widest">Exclusive kost</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-2 text-brand-gray">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <nav className="flex-1 px-5 py-4 space-y-8 overflow-y-auto">
          {menuSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-3">
              <h3 className="px-4 text-[10px] font-bold text-brand-gray uppercase tracking-widest opacity-60">{section.title}</h3>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                      activeTab === item.id
                        ? 'bg-primary text-white shadow-lg shadow-primary/20'
                        : 'text-brand-gray hover:bg-primary/5 hover:text-primary'
                    }`}
                  >
                    <span className="material-symbols-outlined shrink-0 text-xl">{item.icon}</span>
                    <span className="text-xs font-bold uppercase tracking-tight">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="space-y-3 pt-6 border-t border-gray-50 dark:border-brand-gray/10">
            <h3 className="px-4 text-[10px] font-bold text-brand-gray uppercase tracking-widest opacity-60">SISTEM</h3>
            <button
              onClick={onResetData}
              className="w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10"
            >
              <span className="material-symbols-outlined shrink-0 text-xl">delete_forever</span>
              <span className="text-xs font-bold uppercase tracking-tight">Reset Data</span>
            </button>
          </div>
        </nav>

        <div className="p-6 mt-auto border-t border-gray-100 dark:border-brand-gray/10 bg-gray-50/50 dark:bg-black/20">
          <div className="flex items-center gap-4 p-3 bg-white dark:bg-brand-black rounded-xl border border-gray-100 dark:border-brand-gray/20">
            <div className="bg-center bg-cover rounded-full size-10 ring-2 ring-primary/10 shrink-0" style={{backgroundImage: 'url("https://picsum.photos/100/100")'}}></div>
            <div className="flex flex-col min-w-0">
              <p className="text-xs font-bold truncate dark:text-white uppercase">Administrator</p>
              <p className="text-[9px] text-brand-gray font-bold uppercase tracking-widest">Master Manager</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

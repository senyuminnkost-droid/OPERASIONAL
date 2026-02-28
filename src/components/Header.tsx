
import React from 'react';

interface HeaderProps {
  activeTab: string;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, isDarkMode, onToggleDarkMode, onMenuClick }) => {
  const getTitle = () => {
    switch(activeTab) {
      case 'dashboard': return 'Dashboard Operasional';
      case 'weekly-service': return 'Weekly Cleaning & Asset Check';
      case 'attendance': return 'Presensi & Absensi Tim';
      case 'input': return 'Registrasi Keluhan';
      case 'history': return 'Log Perbaikan';
      case 'report': return 'Laporan Keuangan';
      case 'actions': return 'Manajemen Tiket';
      case 'calendar': return 'Jadwal Pemeliharaan';
      case 'finance': return 'Dashboard Keuangan';
      case 'tenants': return 'Basis Data Penghuni';
      case 'staff': return 'Manajemen Tim';
      default: return 'Senyum INN';
    }
  };

  return (
    <header className="h-20 bg-white dark:bg-brand-black border-b border-[#dbe0e6] dark:border-brand-gray/20 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-30 transition-colors shadow-sm">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-3 text-brand-gray hover:bg-primary/5 dark:hover:bg-primary/10 rounded-2xl flex items-center justify-center transition-all"
        >
          <span className="material-symbols-outlined text-2xl">menu</span>
        </button>
        <h2 className="text-sm font-bold dark:text-white uppercase tracking-[0.2em] truncate">
          {getTitle()}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden md:flex items-center group">
          <span className="material-symbols-outlined absolute left-4 text-brand-gray text-lg group-hover:text-primary transition-colors">search</span>
          <input 
            className="pl-12 pr-6 py-2.5 bg-gray-50 dark:bg-brand-gray/10 border-2 border-transparent rounded-[18px] text-[11px] font-bold uppercase tracking-widest focus:ring-primary focus:border-primary w-48 lg:w-72 dark:text-white placeholder:text-brand-gray/50 transition-all" 
            placeholder="Cari data..." 
            type="text"
          />
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={onToggleDarkMode}
            className="p-3 text-brand-gray hover:bg-primary/5 dark:hover:bg-primary/10 rounded-2xl transition-all group flex items-center justify-center border border-transparent hover:border-primary/20"
            title="Toggle Dark Mode"
          >
            <span className="material-symbols-outlined text-[24px] group-hover:text-primary transition-colors">
              {isDarkMode ? 'light_mode' : 'dark_mode'}
            </span>
          </button>
          <button className="p-3 text-brand-gray hover:bg-primary/5 dark:hover:bg-primary/10 rounded-2xl relative transition-all group flex items-center justify-center border border-transparent hover:border-primary/20">
            <span className="material-symbols-outlined text-[24px] group-hover:text-primary transition-colors">notifications</span>
            <span className="absolute top-3.5 right-3.5 w-2 h-2 bg-primary rounded-full border-2 border-white dark:border-brand-black"></span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;

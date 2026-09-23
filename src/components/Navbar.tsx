import React from 'react';
import { MapPin, BookOpen, Coffee, FileSpreadsheet, Library, ShieldCheck, Lock } from 'lucide-react';
import { APP_META } from '../constants/meta';

interface NavbarProps {
  activeTab: 'process' | 'dictionary' | 'guide';
  setActiveTab: (tab: 'process' | 'dictionary' | 'guide') => void;
  openAboutModal: () => void;
  customRulesCount: number;
  onLock: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  openAboutModal,
  customRulesCount,
  onLock,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & App Name */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('process')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-sky-400 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
              <MapPin className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">VNCare Địa Chỉ 2 Cấp</span>
                <span className="bg-sky-100 text-sky-800 text-xs px-2 py-0.5 rounded-full font-semibold border border-sky-200">
                  v{APP_META.version}
                </span>
                <span className="hidden sm:inline-flex items-center text-emerald-700 bg-emerald-50 border border-emerald-200 text-[11px] px-2 py-0.5 rounded-full font-medium">
                  <ShieldCheck className="w-3 h-3 mr-1" /> Offline 100%
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Phiên địa chỉ 2 cấp & 3 cấp sang chuẩn VNCare / HIS — Tác giả: {APP_META.author}
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => setActiveTab('process')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                activeTab === 'process'
                  ? 'bg-sky-50 text-sky-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Xử lý Excel</span>
            </button>

            <button
              onClick={() => setActiveTab('dictionary')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors relative cursor-pointer ${
                activeTab === 'dictionary'
                  ? 'bg-sky-50 text-sky-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Library className="w-4 h-4" />
              <span>Thư viện</span>
              {customRulesCount > 0 && (
                <span className="ml-1 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {customRulesCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('guide')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                activeTab === 'guide'
                  ? 'bg-sky-50 text-sky-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Hướng dẫn</span>
            </button>

            <button
              onClick={openAboutModal}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors ml-1 cursor-pointer"
              title="Thông tin tác giả & Mời cà phê"
            >
              <Coffee className="w-4 h-4 text-amber-600" />
              <span className="hidden md:inline font-semibold">Tác giả & ☕</span>
            </button>

            {/* Lock button */}
            <button
              onClick={onLock}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer ml-1"
              title="Khóa màn hình bảo vệ"
            >
              <Lock className="w-4 h-4" />
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

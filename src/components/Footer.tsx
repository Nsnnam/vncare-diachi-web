import React from 'react';
import { Coffee, Github, Heart, ShieldCheck } from 'lucide-react';
import { APP_META } from '../constants/meta';

interface FooterProps {
  openAboutModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({ openAboutModal }) => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-12 py-6 text-sm text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <span>Phát triển theo chuẩn</span>
          <span className="font-semibold text-slate-700">NSN App Standard</span>
          <span>·</span>
          <span>Tác giả:</span>
          <a
            href="https://github.com/Nsnnam"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sky-600 hover:text-sky-700 font-semibold inline-flex items-center"
          >
            {APP_META.author}
          </a>
        </div>

        <div className="flex items-center space-x-4">
          <span className="inline-flex items-center text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
            Múi giờ: {APP_META.timezone} (GMT+7)
          </span>

          <a
            href={APP_META.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-500 hover:text-slate-800 transition-colors inline-flex items-center space-x-1"
          >
            <Github className="w-4 h-4" />
            <span className="hidden sm:inline">GitHub</span>
          </a>

          <button
            onClick={openAboutModal}
            className="inline-flex items-center space-x-1 text-amber-700 hover:text-amber-800 font-medium bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-200 text-xs transition-colors"
          >
            <Coffee className="w-3.5 h-3.5" />
            <span>Mời cà phê tác giả</span>
          </button>
        </div>
      </div>
    </footer>
  );
};

import React, { useState } from 'react';
import { Lock, KeyRound, ArrowRight, ShieldCheck, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { removeDiacritics } from '../services/addressEngine';

interface LockScreenModalProps {
  isOpen: boolean;
  onUnlock: () => void;
}

// SHA-256 of normalized secret code: 48064a6676268d1cff62fbce5e6655a0e94a224aff585e5794c2b49643e682af
export const ACCESS_AUTH_KEY = 'nsn_vncare_diachi_auth';
export const ACCESS_AUTH_HASH = '48064a6676268d1cff62fbce5e6655a0e94a224aff585e5794c2b49643e682af';

async function computeSha256(text: string): Promise<string> {
  const enc = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  const arr = Array.from(new Uint8Array(buf));
  return arr.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export const LockScreenModal: React.FC<LockScreenModalProps> = ({ isOpen, onUnlock }) => {
  const [inputCode, setInputCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;

    setLoading(true);
    setError(false);

    try {
      // Normalize input: strip diacritics, lowercase, remove spaces/hyphens
      const normalized = removeDiacritics(inputCode).replace(/[\s\-_]+/g, '').toLowerCase();
      const hash = await computeSha256(normalized);

      if (hash === ACCESS_AUTH_HASH) {
        localStorage.setItem(ACCESS_AUTH_KEY, ACCESS_AUTH_HASH);
        onUnlock();
      } else {
        setError(true);
      }
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="bg-gradient-to-tr from-sky-600 via-sky-500 to-sky-600 p-8 text-white text-center relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-sky-400/20 rounded-full blur-xl pointer-events-none" />

          <div className="w-16 h-16 bg-white/15 backdrop-blur-xs rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner border border-white/20">
            <Lock className="w-8 h-8 text-white" />
          </div>

          <h3 className="text-xl font-bold tracking-tight">Hệ Thống Khóa Truy Cập</h3>
          <p className="text-xs text-sky-100 mt-1 max-w-xs mx-auto leading-relaxed">
            Vui lòng nhập mã bảo mật để mở khóa công cụ phiên địa chỉ VNCare
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium flex items-center space-x-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>Mã bảo mật không chính xác. Vui lòng thử lại!</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Mã bảo mật truy cập:
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <KeyRound className="w-4 h-4" />
              </div>

              <input
                type={showPassword ? 'text' : 'password'}
                value={inputCode}
                onChange={(e) => {
                  setInputCode(e.target.value);
                  if (error) setError(false);
                }}
                placeholder="Nhập mã truy cập..."
                autoFocus
                className={`w-full pl-9 pr-10 py-3 text-sm border rounded-xl bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 transition-all ${
                  error
                    ? 'border-red-400 focus:ring-red-400 text-red-900'
                    : 'border-slate-300 focus:border-sky-500 focus:ring-sky-500/20'
                }`}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5 flex items-center">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 mr-1" />
              Chấp nhận chữ hoa, chữ thường hoặc không dấu.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || !inputCode.trim()}
            className="w-full py-3 px-4 bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md shadow-sky-600/25 flex items-center justify-center space-x-2 transition-all cursor-pointer"
          >
            <span>Mở Khóa Truy Cập</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="text-center pt-2 border-t border-slate-100">
            <span className="text-[11px] text-slate-400">
              Công cụ phân tích & phiên địa chỉ 2 cấp — Tác giả: Nguyễn Sơn Nam
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

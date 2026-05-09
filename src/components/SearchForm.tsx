import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface SearchFormProps {
  onSearch: (query: string, type: 'nisn' | 'nama') => void;
  isLoading: boolean;
}

export default function SearchForm({ onSearch, isLoading }: SearchFormProps) {
  const [query, setQuery] = useState('');
  const [type, setType] = useState<'nisn' | 'nama'>('nisn');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim(), type);
    }
  };

  return (
    <div className="bg-white p-1 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
      <div className="p-8 border-b border-slate-100">
        <h3 className="text-xl font-bold text-slate-800">Verifikasi Data Siswa</h3>
        <p className="text-slate-500 text-sm">Masukkan detail di bawah ini untuk mencari dokumen</p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        <div className="space-y-3">
          <label className="text-[10px] font-bold text-slate-700 uppercase tracking-[0.2em] px-1 block">Cari Berdasarkan</label>
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-50 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setType('nisn')}
              className={cn(
                "py-2.5 px-4 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
                type === 'nisn' 
                  ? "bg-white text-emerald-600 shadow-sm" 
                  : "text-slate-400 hover:text-slate-600"
              )}
            >
              NISN Siswa
            </button>
            <button
              type="button"
              onClick={() => setType('nama')}
              className={cn(
                "py-2.5 px-4 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
                type === 'nama' 
                  ? "bg-white text-emerald-600 shadow-sm" 
                  : "text-slate-400 hover:text-slate-600"
              )}
            >
              Nama Lengkap
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-bold text-slate-700 uppercase tracking-[0.2em] px-1 block">
            {type === 'nisn' ? "Nomor Induk Siswa Nasional" : "Nama Lengkap Sesuai Ijazah"}
          </label>
          <div className="relative group">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={type === 'nisn' ? "Contoh: 0061234567" : "Masukkan Nama Lengkap..."}
              className="w-full pl-5 pr-14 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all placeholder:text-slate-300 font-medium text-slate-800"
              required
            />
            <button
              type="submit"
              disabled={isLoading}
              className="absolute right-2 top-2 p-2.5 bg-emerald-600 text-white rounded-lg hover:bg-slate-900 transition-all shadow-lg shadow-emerald-100 disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-100 rounded-xl">
          <div className="w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center text-white font-bold text-[10px] shrink-0">!</div>
          <p className="text-[10px] text-amber-800 leading-normal font-medium italic">
            Jika data tidak ditemukan, silakan hubungi operator sekolah masing-masing untuk pemutakhiran data verifikasi.
          </p>
        </div>
      </form>
    </div>
  );
}

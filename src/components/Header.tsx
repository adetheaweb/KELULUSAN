import { GraduationCap, LogIn, LogOut, User } from 'lucide-react';
import { auth } from '../lib/firebase';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { useState, useEffect } from 'react';

export default function Header() {
  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => {
    return auth.onAuthStateChanged((u) => setUser(u));
  }, []);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Login Error:", error);
      alert("Gagal Login: " + (error.message || "Pastikan domain ini sudah diizinkan di Firebase Console."));
    }
  };

  const handleLogout = () => signOut(auth);

  return (
    <header className="w-full h-20 bg-emerald-950 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
            <div className="w-6 h-6 border-4 border-emerald-950 rounded-sm"></div>
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Portal Kelulusan Digital</h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-300 font-semibold leading-none">
              Salam Tangguh Tanpa Mengeluh
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <nav className="hidden md:flex gap-8 text-sm font-medium">
            <a href="#" className="border-b-2 border-white pb-1">Beranda</a>
            <a href="#" className="text-emerald-200 hover:text-white transition-all">Informasi</a>
            <a 
              href="https://wa.me/6282115654790?text=Halo%20Admin%2C%20saya%20butuh%20bantuan%20terkait%20Portal%20Kelulusan." 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-emerald-200 hover:text-white transition-all"
            >
              Bantuan
            </a>
          </nav>

          <div className="h-6 w-px bg-white/20 hidden md:block" />

        <div>
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-xs font-bold text-white leading-none">{user.displayName}</p>
                <p className="text-[10px] text-emerald-200">{user.email}</p>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogin}
              className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Admin Login
            </button>
          )}
        </div>
      </div>
    </div>
  </header>
);
}


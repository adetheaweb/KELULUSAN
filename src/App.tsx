/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { collection, query, where, getDocs, limit, addDoc, serverTimestamp, doc, getDocFromServer, writeBatch } from 'firebase/firestore';
import { PlusCircle, Search as SearchIcon, ShieldCheck, Loader2, Download, Upload, FileSpreadsheet } from 'lucide-react';
import Papa from 'papaparse';
import { db, auth } from './lib/firebase';
import { Student, GraduationStatus, OperationType, FirestoreErrorInfo } from './types';
import Header from './components/Header';
import SearchForm from './components/SearchForm';
import ResultDisplay from './components/ResultDisplay';
import { cn } from './lib/utils';

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export default function App() {
  const [student, setStudent] = useState<Student | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [currentUser, setCurrentUser] = useState(auth.currentUser);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Admin Form State
  const [newStudent, setNewStudent] = useState<Partial<Student>>({
    nama: '',
    nisn: '',
    status: GraduationStatus.LULUS,
    certificateUrl: ''
  });

  useEffect(() => {
    return auth.onAuthStateChanged((u) => {
      setCurrentUser(u);
      if (u?.email === 'ayobelajar4y0@gmail.com') {
        setIsAdminMode(true);
      } else {
        setIsAdminMode(false);
      }
    });
  }, []);

  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    }
    testConnection();
  }, []);

  const handleSearch = async (queryStr: string, type: 'nisn' | 'nama') => {
    setIsLoading(true);
    setHasSearched(false);
    
    const studentsPath = 'students';
    try {
      const studentsRef = collection(db, studentsPath);
      const q = query(
        studentsRef, 
        where(type === 'nisn' ? 'nisn' : 'nama', '==', queryStr),
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const data = querySnapshot.docs[0].data() as Student;
        setStudent({ ...data, id: querySnapshot.docs[0].id });
      } else {
        setStudent(null);
      }
      setHasSearched(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, studentsPath);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.nama || !newStudent.nisn) return;
    
    setIsLoading(true);
    const studentsPath = 'students';
    try {
      await addDoc(collection(db, studentsPath), {
        ...newStudent,
        updatedAt: serverTimestamp()
      });
      alert('Data siswa berhasil ditambahkan!');
      setNewStudent({ nama: '', nisn: '', status: GraduationStatus.LULUS, certificateUrl: '' });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, studentsPath);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = "nama,nisn,status,certificateUrl\nBudi Santoso,0012345678,LULUS,https://link-skl-budi.pdf\nSiti Aminah,0087654321,TIDAK LULUS,";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "template_kelulusan.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const data = results.data as any[];
        if (data.length === 0) return;

        setIsLoading(true);
        try {
          const batchSize = 500;
          for (let i = 0; i < data.length; i += batchSize) {
            const batch = writeBatch(db);
            const chunk = data.slice(i, i + batchSize);
            
            chunk.forEach(item => {
              const docRef = doc(collection(db, 'students'));
              batch.set(docRef, {
                nama: item.nama || '',
                nisn: item.nisn || '',
                status: item.status?.toUpperCase() === 'LULUS' ? GraduationStatus.LULUS : GraduationStatus.TIDAK_LULUS,
                certificateUrl: item.certificateUrl || '',
                updatedAt: serverTimestamp()
              });
            });
            
            await batch.commit();
          }
          alert(`Berhasil mengunggah ${data.length} data siswa!`);
        } catch (error) {
          console.error("Bulk upload error:", error);
          alert("Gagal mengunggah data. Pastikan format CSV benar.");
        } finally {
          setIsLoading(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />
      
      <div className="flex-1 flex flex-col lg:flex-row min-h-[calc(100vh-5rem)]">
        {/* Left Info Pane */}
        <div className="w-full lg:w-1/3 bg-emerald-900 text-white p-8 lg:p-16 flex flex-col justify-between border-r border-emerald-950">
          <div>
            <span className="px-3 py-1 bg-emerald-800/50 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] border border-emerald-700/50">
              Tahun Ajaran 2023/2024
            </span>
            <h2 className="text-4xl lg:text-5xl font-serif mt-8 leading-[1.1] font-bold italic text-emerald-50">
              Cek Status & <br />Unduh SKL Anda
            </h2>
            <p className="mt-8 text-emerald-100/70 leading-relaxed text-sm lg:text-base">
              Selamat bagi siswa-siswi yang telah menyelesaikan jenjang pendidikan. Silakan masukkan identitas resmi Anda untuk mengakses Surat Keterangan Lulus (SKL) versi digital.
            </p>
          </div>
          
          <div className="space-y-8 mt-12 lg:mt-0">
            {[
              "Siapkan NISN 10 digit yang terdaftar di DAPODIK.",
              "Masukkan Nama Lengkap sesuai Akta Kelahiran.",
              "Unduh file PDF dan simpan untuk keperluan administratif."
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-8 h-8 bg-emerald-800 rounded-lg flex items-center justify-center shrink-0 font-bold text-sm border border-emerald-700">
                  {i + 1}
                </div>
                <p className="text-sm text-emerald-100/80 leading-snug">{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Content Pane */}
        <div className="flex-1 p-6 lg:p-16 flex flex-col items-center bg-slate-50 overflow-y-auto">
          <div className="w-full max-2xl space-y-10">
            <div className="space-y-8">
              <SearchForm onSearch={handleSearch} isLoading={isLoading} />
              <ResultDisplay student={student} hasSearched={hasSearched} />
            </div>

            {/* Admin Panel */}
            {isAdminMode && (
              <div className="space-y-6">
                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-2xl shadow-emerald-100/50">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <PlusCircle className="w-5 h-5 text-emerald-600" />
                      <h3 className="text-lg font-bold text-slate-900">Administrasi: Tambah Data</h3>
                    </div>
                    {/* Bulk Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={downloadTemplate}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Template CSV
                      </button>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border border-emerald-100"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Import CSV
                      </button>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileUpload} 
                        accept=".csv" 
                        className="hidden" 
                      />
                    </div>
                  </div>
                  
                  <form onSubmit={handleAddStudent} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1">Nama Lengkap</label>
                      <input
                        type="text"
                        placeholder="Nama Sesuai Ijazah"
                        value={newStudent.nama}
                        onChange={e => setNewStudent({...newStudent, nama: e.target.value})}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1">NISN</label>
                      <input
                        type="text"
                        placeholder="10 Digit NISN"
                        value={newStudent.nisn}
                        onChange={e => setNewStudent({...newStudent, nisn: e.target.value})}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1">Status</label>
                      <select
                        value={newStudent.status}
                        onChange={e => setNewStudent({...newStudent, status: e.target.value as GraduationStatus})}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                      >
                        <option value={GraduationStatus.LULUS}>LULUS</option>
                        <option value={GraduationStatus.TIDAK_LULUS}>TIDAK LULUS</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1">URL Dokumen</label>
                      <input
                        type="text"
                        placeholder="Link Google Drive/PDF"
                        value={newStudent.certificateUrl}
                        onChange={e => setNewStudent({...newStudent, certificateUrl: e.target.value})}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="md:col-span-2 py-4 bg-emerald-900 text-white rounded-xl font-bold hover:bg-slate-900 transition-all shadow-xl shadow-emerald-100 flex items-center justify-center gap-2 mt-2"
                    >
                      {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                      Simpan Data Siswa
                    </button>
                  </form>
                </div>

                <div className="bg-amber-50 border border-amber-100 p-6 rounded-2xl flex items-start gap-4">
                  <div className="bg-amber-200 p-2 rounded-lg">
                    <FileSpreadsheet className="w-5 h-5 text-amber-700" />
                  </div>
                  <div>
                    <h4 className="font-bold text-amber-900 text-sm">Petunjuk Bulk Upload</h4>
                    <p className="text-xs text-amber-800/80 mt-1 leading-relaxed">
                      Unduh template CSV, isi data siswa sesuai format, lalu unggah kembali menggunakan tombol "Import CSV". Sistem akan memproses data dalam batch untuk memastikan kecepatan dan keamanan.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <footer className="w-full max-w-2xl mt-auto pt-16 flex flex-col md:flex-row items-center justify-between gap-6 opacity-60">
            <div className="flex flex-col md:flex-row items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              <span>&copy; 2024 Manajemen Data Pendidikan</span>
              <span className="hidden md:block">|</span>
              <span className="flex items-center gap-1.5 underline decoration-emerald-300">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                Server Status: Online
              </span>
            </div>
            <div className="flex items-center gap-6">
              <button 
                onClick={() => setIsAdminMode(!isAdminMode)}
                className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-emerald-600 transition-all"
              >
                <ShieldCheck className="w-4 h-4" />
                {isAdminMode ? 'Exit Admin' : 'Admin Area'}
              </button>
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/9/9c/Logo_Tut_Wuri_Handayani.png" 
                alt="Logo Education" 
                className="h-8 grayscale contrast-125 brightness-110"
              />
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}


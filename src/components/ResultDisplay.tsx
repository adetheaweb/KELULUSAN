import { Download, CheckCircle2, XCircle, FileText } from 'lucide-react';
import { motion } from 'motion/react';
import { Student, GraduationStatus } from '../types';
import { cn } from '../lib/utils';

interface ResultDisplayProps {
  student: Student | null;
  hasSearched: boolean;
}

export default function ResultDisplay({ student, hasSearched }: ResultDisplayProps) {
  if (!hasSearched) return null;

  if (!student) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-red-50 border border-red-100 p-6 rounded-2xl text-center"
      >
        <div className="bg-red-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
          <XCircle className="w-6 h-6 text-red-600" />
        </div>
        <h3 className="text-red-900 font-bold text-lg">Data Tidak Ditemukan</h3>
        <p className="text-red-700 text-sm mt-1">
          Maaf, data kelulusan dengan NISN/Nama tersebut tidak ditemukan di sistem kami.
        </p>
      </motion.div>
    );
  }

  const isLulus = student.status === GraduationStatus.LULUS;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xl shadow-slate-200/50"
    >
      <div className={cn(
        "px-8 py-4 text-[10px] font-bold uppercase tracking-[0.3em] flex items-center justify-between",
        isLulus ? "bg-green-50 text-green-700 border-b border-green-100" : "bg-red-50 text-red-700 border-b border-red-100"
      )}>
        <span>Hasil Verifikasi Siswa</span>
        <div className="flex items-center gap-1.5">
          <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", isLulus ? "bg-green-500" : "bg-red-500")} />
          Status: {student.status}
        </div>
      </div>

      <div className="p-10 relative">
        {/* Decorative Badge */}
        <div className={cn(
          "absolute -top-6 -right-6 w-32 h-32 blur-3xl opacity-10 rounded-full",
          isLulus ? "bg-green-500" : "bg-red-500"
        )} />

        <div className="relative z-10 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-100">
            <div className="space-y-2">
              <h2 className="text-3xl font-serif font-bold text-slate-900 border-l-4 border-emerald-600 pl-4">{student.nama}</h2>
              <div className="flex gap-4 pl-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">NISN: {student.nisn}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-emerald-600">ID: {student.id?.slice(-8).toUpperCase()}</p>
              </div>
            </div>

            <div className={cn(
              "flex items-center gap-3 px-6 py-3 rounded-xl font-bold text-xl shadow-sm",
              isLulus ? "bg-green-100 text-green-700 border border-green-200" : "bg-red-100 text-red-700 border border-red-200"
            )}>
              {isLulus ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
              {student.status}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                Informasi Penting
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                {isLulus 
                  ? "Selamat! Anda dinyatakan lulus. Surat Keterangan Lulus (SKL) dapat diunduh melalui tombol di samping. Pastikan data diri pada SKL sudah sesuai sebelum digunakan untuk pendaftaran selanjutnya."
                  : "Mohon maaf, status kelulusan Anda belum tersedia atau Anda dinyatakan tidak lulus. Silakan hubungi wali kelas atau bagian kurikulum sekolah untuk informasi lebih lanjut mengenai hasil evaluasi."
                }
              </p>
            </div>

            <div className="flex flex-col justify-center space-y-4">
              {student.certificateUrl ? (
                <a
                  href={student.certificateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 w-full py-5 bg-emerald-900 text-white rounded-xl font-bold hover:bg-slate-900 transition-all shadow-xl shadow-emerald-100 group"
                >
                  <Download className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
                  UNDUH SKL DIGITAL (.PDF)
                </a>
              ) : (
                <div className="w-full py-5 bg-slate-50 text-slate-400 rounded-xl font-bold text-xs tracking-widest text-center border-2 border-dashed border-slate-200 uppercase">
                  Dokumen Belum Diunggah
                </div>
              )}
              <div className="flex items-center justify-center gap-4">
                <span className="h-px bg-slate-100 flex-1"></span>
                <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Verifikasi QR-Code Aktif</span>
                <span className="h-px bg-slate-100 flex-1"></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}


import React, { useState, useRef } from 'react';
import { Staff, AttendanceRecord } from '../types';

interface AttendanceProps {
  staff: Staff[];
  onUpdateAttendance: (staffId: string, record: AttendanceRecord) => void;
}

const Attendance: React.FC<AttendanceProps> = ({ staff, onUpdateAttendance }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeCamera, setActiveCamera] = useState<{ staffId: string; mode: 'in' | 'out' } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert("Gagal mengakses kamera. Pastikan izin kamera telah diberikan.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleClockAction = (staffId: string, mode: 'in' | 'out') => {
    setActiveCamera({ staffId, mode });
    setTimeout(startCamera, 100);
  };

  const calculatePenalty = (staff: Staff, clockInTime: string): number => {
    const [shiftH, shiftM] = staff.shiftStartTime.split(':').map(Number);
    const [h, m] = clockInTime.split(':').map(Number);
    
    const shiftMinutes = shiftH * 60 + shiftM;
    const actualMinutes = h * 60 + m;
    const delay = actualMinutes - shiftMinutes;

    if (delay <= 5) return 0;
    if (delay <= 20) return 5000;
    if (delay <= 40) return 10000;
    if (delay <= 60) return 15000;
    return 0;
  };

  const capturePhotoAndLocation = () => {
    if (!videoRef.current || !canvasRef.current || !activeCamera) return;

    const context = canvasRef.current.getContext('2d');
    if (!context) return;

    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0);
    const photo = canvasRef.current.toDataURL('image/jpeg');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const staffMember = staff.find(s => s.id === activeCamera.staffId);
        if (!staffMember) return;

        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        
        let existingRecord = staffMember.attendance?.[selectedDate];

        if (activeCamera.mode === 'in') {
          const [shiftH, shiftM] = staffMember.shiftStartTime.split(':').map(Number);
          const shiftMinutes = shiftH * 60 + shiftM;
          const actualMinutes = now.getHours() * 60 + now.getMinutes();
          const delay = actualMinutes - shiftMinutes;

          const status = delay > 60 ? 'Izin' : 'Hadir';
          const penalty = status === 'Hadir' ? calculatePenalty(staffMember, timeStr) : 0;

          const record: AttendanceRecord = {
            status,
            clockInTime: timeStr,
            photo,
            location: { lat: position.coords.latitude, lng: position.coords.longitude },
            penaltyAmount: penalty,
            isLateApproved: false
          };
          onUpdateAttendance(activeCamera.staffId, record);
        } else {
          // CLOCK OUT
          if (existingRecord) {
            const record: AttendanceRecord = {
              ...existingRecord,
              clockOutTime: timeStr,
              photo: photo // Update photo to newest (checkout photo)
            };
            onUpdateAttendance(activeCamera.staffId, record);
          }
        }

        stopCamera();
        setActiveCamera(null);
      },
      (err) => {
        alert("Gagal mengambil lokasi GPS. Pastikan GPS aktif.");
      }
    );
  };

  const handleAdminStatusChange = (staffId: string, status: any) => {
    onUpdateAttendance(staffId, { status, isLateApproved: false, penaltyAmount: 0 });
  };

  const handleApproveLate = (staffId: string) => {
    const s = staff.find(x => x.id === staffId);
    if (s && s.attendance?.[selectedDate]) {
      const record = { ...s.attendance[selectedDate], isLateApproved: true, penaltyAmount: 0 };
      onUpdateAttendance(staffId, record);
    }
  };

  return (
    <div className="px-2 py-4 sm:p-6 lg:p-10 space-y-6 animate-in fade-in duration-500 overflow-x-hidden max-w-full w-full box-border">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black dark:text-white uppercase tracking-tight italic">Senyum Attendance</h1>
          <p className="text-brand-gray font-bold uppercase text-[9px] tracking-widest mt-1">Sistem Presensi Verifikasi Foto & GPS</p>
        </div>
        <div className="flex items-center gap-3 bg-white dark:bg-brand-black p-2 rounded-2xl border border-gray-100 dark:border-brand-gray/20 shadow-sm w-full md:w-auto">
          <span className="material-symbols-outlined text-primary text-xl ml-2">calendar_today</span>
          <input 
            type="date" 
            value={selectedDate} 
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-transparent border-none text-[11px] font-bold uppercase dark:text-white focus:ring-0 p-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staff.map((s) => {
          const record = s.attendance?.[selectedDate];
          const isLate = record?.penaltyAmount && record.penaltyAmount > 0 && !record.isLateApproved;
          const isClockedIn = !!record?.clockInTime;
          const isClockedOut = !!record?.clockOutTime;

          return (
            <div key={s.id} className="bg-white dark:bg-brand-black p-6 rounded-[32px] border border-gray-100 dark:border-brand-gray/20 shadow-sm flex flex-col relative overflow-hidden transition-all hover:shadow-xl">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                   <div className="size-12 rounded-2xl bg-gray-50 dark:bg-white/5 flex items-center justify-center border border-gray-100 dark:border-white/10 overflow-hidden shadow-inner">
                     {record?.photo ? (
                        <img src={record.photo} className="size-full object-cover" />
                     ) : (
                        <span className="material-symbols-outlined text-brand-gray text-2xl">person</span>
                     )}
                   </div>
                   <div className="min-w-0">
                     <h3 className="text-base font-bold truncate dark:text-white uppercase tracking-tight">{s.name}</h3>
                     <p className="text-[9px] font-black text-primary uppercase tracking-widest italic">{s.role}</p>
                   </div>
                </div>
                {record && (
                  <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase ${
                    record.status === 'Hadir' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                  }`}>
                    {record.status}
                  </span>
                )}
              </div>

              <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-4 space-y-3 mb-6 border border-gray-100 dark:border-white/5">
                 <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className="text-brand-gray uppercase tracking-widest">Jadwal Shift</span>
                    <span className="dark:text-white">{s.shiftStartTime} - {s.shiftEndTime}</span>
                 </div>
                 <div className="h-px bg-gray-200 dark:bg-white/10 w-full"></div>
                 <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className="text-brand-gray uppercase tracking-widest">Absen Masuk</span>
                    <span className={isClockedIn ? "text-emerald-500" : "text-brand-gray"}>{record?.clockInTime || '--:--'}</span>
                 </div>
                 <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className="text-brand-gray uppercase tracking-widest">Absen Pulang</span>
                    <span className={isClockedOut ? "text-emerald-500" : "text-brand-gray"}>{record?.clockOutTime || '--:--'}</span>
                 </div>
              </div>

              {isLate && (
                <div className="p-3 bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/50 rounded-2xl flex justify-between items-center mb-6 animate-pulse">
                   <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-rose-500 text-base">warning</span>
                      <span className="text-[9px] font-black text-rose-600 uppercase">Denda: Rp {record.penaltyAmount?.toLocaleString()}</span>
                   </div>
                   <button onClick={() => handleApproveLate(s.id)} className="text-[8px] font-black text-rose-500 underline uppercase tracking-widest">Izin Telat</button>
                </div>
              )}

              {record?.isLateApproved && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/50 rounded-2xl mb-6 text-center">
                   <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Denda Dihapuskan (Izin Disetujui)</p>
                </div>
              )}

              <div className="mt-auto">
                 {!isClockedIn ? (
                    <div className="space-y-3">
                       <button 
                         onClick={() => handleClockAction(s.id, 'in')}
                         className="w-full py-4 bg-brand-black dark:bg-white text-white dark:text-brand-black text-[11px] font-black uppercase rounded-2xl shadow-xl flex items-center justify-center gap-3 transition-all active:scale-95"
                       >
                         <span className="material-symbols-outlined text-xl">login</span>
                         Absen Masuk
                       </button>
                       <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                          {['Izin', 'Sakit', 'Alpa', 'Libur'].map(status => (
                             <button 
                               key={status}
                               onClick={() => handleAdminStatusChange(s.id, status)}
                               className="flex-1 min-w-[60px] py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-[8px] font-black uppercase text-brand-gray hover:border-primary hover:text-primary transition-all"
                             >
                               {status}
                             </button>
                          ))}
                       </div>
                    </div>
                 ) : !isClockedOut ? (
                    <button 
                      onClick={() => handleClockAction(s.id, 'out')}
                      className="w-full py-4 bg-primary text-white text-[11px] font-black uppercase rounded-2xl shadow-xl flex items-center justify-center gap-3 transition-all active:scale-95 animate-bounce-subtle"
                    >
                      <span className="material-symbols-outlined text-xl">logout</span>
                      Absen Pulang
                    </button>
                 ) : (
                    <div className="w-full py-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-2xl flex items-center justify-center gap-3 border-2 border-dashed border-emerald-100 dark:border-emerald-900/40">
                       <span className="material-symbols-outlined">verified</span>
                       <span className="text-[11px] font-black uppercase tracking-widest">Shift Selesai</span>
                    </div>
                 )}
              </div>
            </div>
          );
        })}
      </div>

      {/* CAMERA OVERLAY */}
      {activeCamera && (
        <div className="fixed inset-0 z-[300] bg-brand-black/95 backdrop-blur-2xl flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="relative w-full max-w-sm aspect-[3/4] rounded-[48px] overflow-hidden border-4 border-primary shadow-2xl bg-black">
            <video ref={videoRef} autoPlay playsInline muted className="size-full object-cover scale-x-[-1]" />
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
               <div className="w-64 h-80 border-2 border-white/30 border-dashed rounded-[80px]"></div>
               <div className="absolute top-8 left-0 right-0 text-center">
                  <span className="px-4 py-1.5 bg-primary text-white text-[10px] font-black uppercase rounded-full tracking-widest">
                    {activeCamera.mode === 'in' ? 'Clock-In Verification' : 'Clock-Out Verification'}
                  </span>
               </div>
            </div>
          </div>
          <div className="mt-12 flex flex-col items-center gap-8">
             <div className="text-center">
                <p className="text-white text-2xl font-black uppercase tracking-tighter italic">Konfirmasi Identitas</p>
                <p className="text-primary text-[10px] font-bold uppercase tracking-[0.4em] mt-2">Wajah & Koordinat GPS akan dicatat</p>
             </div>
             <div className="flex gap-6">
                <button 
                  onClick={capturePhotoAndLocation}
                  className="size-24 bg-primary text-white rounded-full flex items-center justify-center shadow-2xl shadow-primary/40 hover:scale-110 transition-all border-8 border-white dark:border-brand-black"
                >
                  <span className="material-symbols-outlined text-4xl">photo_camera</span>
                </button>
                <button 
                  onClick={() => { stopCamera(); setActiveCamera(null); }}
                  className="size-24 bg-white/10 text-white rounded-full flex items-center justify-center hover:bg-white/20 transition-all border-2 border-white/20"
                >
                  <span className="material-symbols-outlined text-3xl">close</span>
                </button>
             </div>
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}
    </div>
  );
};

export default Attendance;

import { ExternalLink, RefreshCw } from 'lucide-react';
import { useMemo } from 'react';
import { useState } from 'react';
import { useAuth } from '../lib/authStore';

const DEFAULT_ATTENDANCE_URL = 'https://jarviz-attendance.vercel.app';

export default function Attendance() {
  const { user } = useAuth();
  const baseAttendanceUrl = import.meta.env.VITE_ATTENDANCE_IFRAME_URL || DEFAULT_ATTENDANCE_URL;
  const [frameKey, setFrameKey] = useState(0);
  const attendanceUrl = useMemo(() => {
    const url = new URL(baseAttendanceUrl);
    const employeeId = user?.employeeCode || user?.id || user?.email || '';
    const employeeName = user?.name || user?.email || '';
    if (employeeId) url.searchParams.set('employeeId', employeeId);
    if (employeeName) url.searchParams.set('employeeName', employeeName);
    if (user?.phone) url.searchParams.set('employeePhone', user.phone);
    return url.toString();
  }, [baseAttendanceUrl, user]);

  return (
    <div className="page-shell max-w-7xl">
      <section className="section-card overflow-hidden">
        <div className="flex justify-end gap-2 border-b border-outline-variant p-3">
            <button
              type="button"
              onClick={() => setFrameKey((value) => value + 1)}
              className="btn-secondary h-10 px-3"
            >
              <RefreshCw className="size-4" />
              Reload
            </button>
            <a
              href={attendanceUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-primary h-10 px-3"
            >
              <ExternalLink className="size-4" />
              Mở riêng
            </a>
        </div>

        <div className="bg-surface-container-low p-2 md:p-3">
          <div className="overflow-hidden rounded-lg border border-outline-variant bg-white shadow-inner">
            <iframe
              key={frameKey}
              title="Chấm công"
              src={attendanceUrl}
              allow="geolocation; clipboard-read; clipboard-write"
              className="h-[calc(100vh-10rem)] min-h-[720px] w-full border-0 md:h-[calc(100vh-9rem)]"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

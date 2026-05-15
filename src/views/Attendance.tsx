import { ExternalLink, Fingerprint, RefreshCw } from 'lucide-react';
import { useMemo, useState } from 'react';

const DEFAULT_ATTENDANCE_URL = 'https://jarviz-attendance.vercel.app';

export default function Attendance() {
  const attendanceUrl = import.meta.env.VITE_ATTENDANCE_IFRAME_URL || DEFAULT_ATTENDANCE_URL;
  const [frameKey, setFrameKey] = useState(0);

  const displayUrl = useMemo(() => {
    try {
      return new URL(attendanceUrl).hostname;
    } catch {
      return attendanceUrl;
    }
  }, [attendanceUrl]);

  return (
    <div className="page-shell max-w-7xl">
      <section className="section-card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-outline-variant p-4 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary text-on-primary shadow-sm shadow-primary/20">
              <Fingerprint className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="eyebrow">Chấm công nhúng iframe</p>
              <h1 className="truncate text-lg font-black text-on-surface md:text-xl">Jarviz Attendance</h1>
              <p className="mt-1 text-xs font-semibold text-on-surface-variant">
                Giao diện chấm công cũ được nhúng nguyên bản, dùng chung Supabase database.
              </p>
            </div>
          </div>

          <div className="flex gap-2">
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
        </div>

        <div className="bg-surface-container-low p-2 md:p-3">
          <div className="overflow-hidden rounded-lg border border-outline-variant bg-white shadow-inner">
            <iframe
              key={frameKey}
              title="Jarviz Attendance"
              src={attendanceUrl}
              allow="geolocation; clipboard-read; clipboard-write"
              className="h-[calc(100vh-10rem)] min-h-[720px] w-full border-0 md:h-[calc(100vh-9rem)]"
            />
          </div>
          <p className="mt-2 truncate px-1 text-[11px] font-semibold text-on-surface-variant">
            Nguồn iframe: {displayUrl}
          </p>
        </div>
      </section>
    </div>
  );
}

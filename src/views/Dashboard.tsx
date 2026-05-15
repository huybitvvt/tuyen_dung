import {
  BookOpenCheck,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  FileQuestion,
  Fingerprint,
  Gauge,
  GraduationCap,
  UserCheck,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import { candidateStages, useCrm } from '../lib/crmStore';
import { useEffect, useState } from 'react';
import { isSupabaseConfigured } from '../lib/supabase';
import { getAttendanceRecordsInRange, getTodayKey } from '../lib/attendanceService';

export default function Dashboard() {
  const { courses, lessons, progress, enrollments, currentUser, questions, results, recruitmentJobs, candidates, candidateActivities, candidateInterviews } = useCrm();
  const [attendanceStats, setAttendanceStats] = useState({
    checkedInToday: 0,
    workingNow: 0,
    checkedOutToday: 0,
  });

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    let cancelled = false;

    async function loadAttendanceStats() {
      try {
        const today = getTodayKey();
        const rows = await getAttendanceRecordsInRange(today, today);
        if (cancelled) return;

        setAttendanceStats({
          checkedInToday: new Set(rows.filter((row) => row.check_in_at).map((row) => row.employee_id)).size,
          workingNow: rows.filter((row) => row.status === 'working').length,
          checkedOutToday: rows.filter((row) => row.status === 'checked_out').length,
        });
      } catch {
        setAttendanceStats({ checkedInToday: 0, workingNow: 0, checkedOutToday: 0 });
      }
    }

    void loadAttendanceStats();

    return () => {
      cancelled = true;
    };
  }, []);

  const courseProgress = courses.map((course) => {
    const courseLessons = lessons.filter((lesson) => lesson.courseId === course.id);
    const rows = courseLessons.map((lesson) => progress.find((item) => item.userId === currentUser.id && item.lessonId === lesson.id)?.percent ?? 0);
    const percent = rows.length ? Math.round(rows.reduce((sum, item) => sum + item, 0) / rows.length) : 0;
    return { course, percent };
  });

  const completionRate = courseProgress.length ? Math.round(courseProgress.reduce((sum, item) => sum + item.percent, 0) / courseProgress.length) : 0;
  const passRate = results.length ? Math.round((results.filter((item) => item.passed).length / results.length) * 100) : 0;
  const activeCandidates = candidates.filter((candidate) => candidate.stage !== 'official' && candidate.stage !== 'rejected').length;
  const hiredCandidates = candidates.filter((candidate) => candidate.stage === 'official').length;
  const departments = ['Sale', 'Kỹ thuật', 'Marketing'].map((department) => {
    const rows = courseProgress.filter((item) => item.course.department === department);
    return {
      name: department,
      progress: rows.length ? Math.round(rows.reduce((sum, item) => sum + item.percent, 0) / rows.length) : 0,
      tone: department === 'Sale' ? 'bg-primary' : department === 'Kỹ thuật' ? 'bg-secondary' : 'bg-tertiary-container',
    };
  });

  const metricCards = [
    { label: 'Khóa học', value: courses.length, detail: `${lessons.length} bài học`, icon: GraduationCap, tone: 'bg-primary/10 text-primary' },
    { label: 'Hoàn thành LMS', value: `${completionRate}%`, detail: `${enrollments.length} lượt gán`, icon: Gauge, tone: 'bg-secondary-container text-on-secondary-container' },
    { label: 'Quiz pass', value: results.length ? `${passRate}%` : '0%', detail: `${results.length}/${questions.length} kết quả`, icon: FileQuestion, tone: 'bg-tertiary-container/15 text-tertiary' },
    { label: 'Ứng viên', value: activeCandidates, detail: `${hiredCandidates} chính thức`, icon: Users, tone: 'bg-primary-fixed text-on-primary-fixed' },
  ];

  return (
    <div className="page-shell">
      <section className="section-card overflow-hidden">
        <div className="p-4 md:p-6">
          <p className="eyebrow mb-2 md:mb-3">Bảng điều hành nhân sự</p>
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <h1 className="max-w-2xl text-xl font-black leading-tight text-on-surface md:text-3xl">
                Đào tạo nội bộ và tuyển dụng trong một luồng quản trị
              </h1>
              <p className="mt-2 max-w-2xl text-xs font-semibold leading-5 text-on-surface-variant md:mt-3 md:text-sm md:leading-6">
                Theo dõi tiến độ học, pipeline ứng viên và chấm công GPS bằng Supabase trong cùng một giao diện.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 md:flex">
              <Link to="/training" className="btn-primary">
                <BookOpenCheck className="size-4" />
                LMS
              </Link>
              <Link to="/recruitment/candidates" className="btn-secondary">
                <BriefcaseBusiness className="size-4" />
                Kanban
              </Link>
              <Link to="/attendance" className="btn-secondary">
                <Fingerprint className="size-4" />
                Chấm công
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Link to="/attendance" className="section-card flex flex-col gap-4 p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary text-on-primary shadow-sm shadow-primary/20">
            <Fingerprint className="size-6" />
          </div>
          <div>
            <p className="eyebrow">Chấm công đã tích hợp</p>
            <h2 className="mt-1 text-base font-black text-on-surface">Nhúng nguyên app chấm công cũ bằng iframe</h2>
            <p className="mt-1 text-xs font-semibold text-on-surface-variant">
              Giao diện và logic chấm công giữ nguyên, dữ liệu check-in/check-out đọc chung từ Supabase.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center md:min-w-80">
          <div className="rounded-lg bg-surface-container-low px-3 py-2">
            <p className="text-lg font-black text-on-surface">{attendanceStats.checkedInToday}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Đã vào</p>
          </div>
          <div className="rounded-lg bg-secondary-container px-3 py-2 text-on-secondary-container">
            <p className="text-lg font-black">{attendanceStats.workingNow}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest">Đang làm</p>
          </div>
          <div className="rounded-lg bg-primary/10 px-3 py-2 text-primary">
            <p className="text-lg font-black">{attendanceStats.checkedOutToday}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest">Đã ra</p>
          </div>
        </div>
      </Link>

      <section className="grid grid-cols-2 gap-2 md:gap-3 xl:grid-cols-4">
        {metricCards.map((metric) => (
          <div key={metric.label} className="metric-card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="eyebrow">{metric.label}</p>
                <p className="mt-1 text-xl font-black text-on-surface md:mt-2 md:text-2xl">{metric.value}</p>
                <p className="mt-1 text-[11px] font-semibold text-on-surface-variant md:text-xs">{metric.detail}</p>
              </div>
              <div className={cn('flex size-8 items-center justify-center rounded-lg md:size-9', metric.tone)}>
                <metric.icon className="size-4 md:size-5" />
              </div>
            </div>
          </div>
        ))}
      </section>

      <div className="grid gap-3 md:gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="section-card p-4">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="eyebrow">Đào tạo</p>
            <h2 className="mt-1 text-base font-black text-on-surface">Tiến độ theo phòng ban</h2>
            </div>
            <ClipboardList className="size-5 text-primary" />
          </div>
          <div className="space-y-4 md:space-y-5">
            {departments.map((dept) => (
              <div key={dept.name}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-black text-on-surface">{dept.name}</span>
                  <span className="font-mono text-xs font-bold text-on-surface-variant">{dept.progress}%</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-container">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${dept.progress}%` }}
                    transition={{ duration: 0.9, ease: 'easeOut' }}
                    className={cn('h-full rounded-full', dept.tone)}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="section-card overflow-hidden">
          <div className="border-b border-outline-variant p-4">
            <p className="eyebrow">Pipeline tuyển dụng</p>
            <h2 className="mt-1 text-base font-black text-on-surface">Ứng viên theo trạng thái</h2>
          </div>
          <div className="grid grid-cols-2 gap-px bg-outline-variant/70 sm:grid-cols-5">
            {candidateStages.map((stage) => {
              const count = candidates.filter((candidate) => candidate.stage === stage.id).length;
              return (
                <Link key={stage.id} to="/recruitment/candidates" className="bg-surface p-2.5 transition-colors hover:bg-surface-container-low md:p-3">
                  <p className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant md:text-[10px]">{stage.label}</p>
                  <p className="mt-1 text-lg font-black text-on-surface md:mt-2 md:text-xl">{count}</p>
                </Link>
              );
            })}
          </div>
        </section>
      </div>

      <section className="grid gap-4 lg:grid-cols-2">
        {courseProgress.slice(0, 2).map(({ course, percent }) => (
          <Link key={course.id} to={`/training/${course.id}`} className="section-card flex items-center gap-4 p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
            <div className={cn('flex size-12 items-center justify-center rounded-lg', course.department === 'Sale' ? 'bg-primary/10 text-primary' : 'bg-secondary-container text-on-secondary-container')}>
              {course.kpiLeadEligible ? <UserCheck className="size-6" /> : <GraduationCap className="size-6" />}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-sm font-black text-on-surface">{course.name}</h3>
              <p className="mt-1 text-xs font-semibold text-on-surface-variant">{course.department} • {percent}% hoàn thành</p>
            </div>
            <ChevronRight className="size-4 text-outline" />
          </Link>
        ))}
      </section>
    </div>
  );
}

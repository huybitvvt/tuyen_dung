import {
  BarChart3,
  BookOpenCheck,
  BriefcaseBusiness,
  ChevronRight,
  ClipboardList,
  FileQuestion,
  Fingerprint,
  Gauge,
  GraduationCap,
  LineChart,
  PieChart,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import { candidateStages, useCrm } from '../lib/crmStore';
import { useEffect, useState } from 'react';
import { appSupabase } from '../lib/supabase';
import { getTodayKey } from '../lib/attendanceService';

function SparklineChart({ values }: { values: number[] }) {
  const width = 280;
  const height = 92;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = Math.max(max - min, 1);
  const points = values.map((value, index) => {
    const x = (index / Math.max(values.length - 1, 1)) * width;
    const y = height - ((value - min) / range) * (height - 18) - 9;
    return `${x},${y}`;
  });
  const areaPoints = `0,${height} ${points.join(' ')} ${width},${height}`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-24 w-full overflow-visible" role="img" aria-label="Biểu đồ xu hướng vận hành">
      <defs>
        <linearGradient id="dashboardLineFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#4f6540" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#4f6540" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill="url(#dashboardLineFill)" />
      <polyline
        points={points.join(' ')}
        fill="none"
        stroke="#4f6540"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="4"
      />
      {points.map((point, index) => {
        const [x, y] = point.split(',').map(Number);
        return <circle key={index} cx={x} cy={y} r="4" fill="#fffdf7" stroke="#4f6540" strokeWidth="3" />;
      })}
    </svg>
  );
}

function DonutChart({ value }: { value: number }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(Math.max(value, 0), 100) / 100) * circumference;

  return (
    <div className="relative flex size-32 items-center justify-center">
      <svg viewBox="0 0 112 112" className="-rotate-90">
        <circle cx="56" cy="56" r={radius} fill="none" stroke="#f2ead9" strokeWidth="12" />
        <circle
          cx="56"
          cy="56"
          r={radius}
          fill="none"
          stroke="#c9823a"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          strokeWidth="12"
        />
      </svg>
      <div className="absolute text-center">
        <p className="font-mono text-2xl font-black leading-none text-on-surface">{value}%</p>
        <p className="mt-1 text-[9px] font-black uppercase tracking-widest text-on-surface-variant">LMS</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { courses, lessons, progress, enrollments, currentUser, questions, results, recruitmentJobs, candidates, candidateActivities, candidateInterviews } = useCrm();
  const [attendanceStats, setAttendanceStats] = useState({
    checkedInToday: 0,
    workingNow: 0,
    checkedOutToday: 0,
  });

  useEffect(() => {
    if (!appSupabase) return;

    let cancelled = false;

    async function loadAttendanceStats() {
      try {
        const today = getTodayKey();
        const { data, error } = await appSupabase!
          .from('timesheets')
          .select('user_id,check_in,check_out,status')
          .eq('schedule_date', today);

        if (error) throw error;
        if (cancelled) return;

        const rows = data || [];
        setAttendanceStats({
          checkedInToday: new Set(rows.filter((row) => row.check_in).map((row) => row.user_id)).size,
          workingNow: rows.filter((row) => row.check_in && !row.check_out).length,
          checkedOutToday: rows.filter((row) => row.check_out).length,
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
  const openJobs = recruitmentJobs.filter((job) => job.status === 'Đang mở').length;
  const scheduledInterviews = candidateInterviews.filter((interview) => !interview.result).length;
  const recentActivity = candidateActivities.length;
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
  const operationsTrend = [
    courses.length * 8,
    enrollments.length * 12,
    Math.max(completionRate, 8),
    activeCandidates * 14,
    Math.max(attendanceStats.checkedInToday * 16, 10),
    Math.max(attendanceStats.checkedOutToday * 18, attendanceStats.workingNow * 12, 12),
  ];
  const pipelineBars = candidateStages
    .map((stage) => ({
      label: stage.label,
      value: candidates.filter((candidate) => candidate.stage === stage.id).length,
    }))
    .filter((item) => item.value > 0)
    .slice(0, 5);
  const maxPipelineValue = Math.max(...pipelineBars.map((item) => item.value), 1);

  return (
    <div className="page-shell">
      <section className="section-card overflow-hidden hover:border-home-primary/20 hover:shadow-md hover:shadow-home-primary/10">
        <div className="grid gap-0 xl:grid-cols-[1fr_360px]">
          <div className="p-3.5 md:p-5">
          <p className="eyebrow mb-2">Bảng điều hành nhân sự</p>
          <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <h1 className="max-w-2xl text-xl font-black leading-tight text-on-surface md:text-2xl">
                Đào tạo nội bộ và tuyển dụng trong một luồng quản trị
              </h1>
              <p className="mt-2 max-w-2xl text-xs font-semibold leading-5 text-on-surface-variant md:text-[13px]">
                Quản lý đào tạo, tuyển dụng và chấm công hằng ngày trong một giao diện làm việc thống nhất.
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
          <div className="border-t border-home-outline bg-[#fbf8ef] p-3.5 xl:border-l xl:border-t-0">
            <div className="rounded-lg border border-home-outline bg-home-surface p-3 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="eyebrow">Nhịp hôm nay</p>
                  <p className="mt-1 text-sm font-black text-on-surface">Vận hành tổng quan</p>
                </div>
                <TrendingUp className="size-5 text-primary" />
              </div>
              <SparklineChart values={operationsTrend} />
              <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-md bg-primary-fixed p-2">
                  <p className="text-sm font-black text-primary">{openJobs}</p>
                  <p className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant">Job mở</p>
                </div>
                <div className="rounded-md bg-secondary-container p-2">
                  <p className="text-sm font-black text-secondary">{scheduledInterviews}</p>
                  <p className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant">PV</p>
                </div>
                <div className="rounded-md bg-surface-container-low p-2">
                  <p className="text-sm font-black text-on-surface">{recentActivity}</p>
                  <p className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant">Log</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Link to="/attendance" className="section-card flex flex-col gap-3 p-3.5 hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-md hover:shadow-primary/10 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-on-primary shadow-sm shadow-primary/20">
            <Fingerprint className="size-5" />
          </div>
          <div>
            <p className="eyebrow">Chấm công hôm nay</p>
            <h2 className="mt-0.5 text-sm font-black text-on-surface md:text-base">Check-in và check-out</h2>
            <p className="mt-1 text-xs font-semibold text-on-surface-variant">
              Theo dõi trạng thái vào ca, đang làm và tan ca của nhân viên.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center md:min-w-72">
          <div className="rounded-md bg-surface-container-low px-3 py-2">
            <p className="text-base font-black text-on-surface md:text-lg">{attendanceStats.checkedInToday}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Đã vào</p>
          </div>
          <div className="rounded-md bg-secondary-container px-3 py-2 text-on-secondary-container">
            <p className="text-base font-black md:text-lg">{attendanceStats.workingNow}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest">Đang làm</p>
          </div>
          <div className="rounded-md bg-primary/10 px-3 py-2 text-primary">
            <p className="text-base font-black md:text-lg">{attendanceStats.checkedOutToday}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest">Đã ra</p>
          </div>
        </div>
      </Link>

      <section className="grid grid-cols-2 gap-2 md:gap-3 xl:grid-cols-4">
        {metricCards.map((metric) => (
          <div key={metric.label} className="metric-card">
            <div className="flex items-start justify-between gap-2.5">
              <div>
                <p className="eyebrow">{metric.label}</p>
                <p className="mt-1 text-lg font-black text-on-surface md:text-xl">{metric.value}</p>
                <p className="mt-1 text-[11px] font-semibold text-on-surface-variant md:text-xs">{metric.detail}</p>
              </div>
              <div className={cn('flex size-8 items-center justify-center rounded-lg', metric.tone)}>
                <metric.icon className="size-4" />
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-3 lg:grid-cols-[1fr_0.82fr_1fr]">
        <div className="section-card p-3.5 hover:border-home-primary/20 hover:shadow-md hover:shadow-home-primary/10">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="eyebrow">Xu hướng</p>
              <h2 className="mt-1 text-base font-black text-on-surface">Hiệu suất vận hành</h2>
            </div>
            <LineChart className="size-5 text-primary" />
          </div>
          <SparklineChart values={operationsTrend} />
          <div className="mt-3 flex items-center justify-between rounded-md border border-home-outline bg-home-bg px-3 py-2">
            <span className="text-xs font-bold text-on-surface-variant">Đào tạo, tuyển dụng, chấm công</span>
            <span className="font-mono text-sm font-black text-primary">+{Math.max(completionRate, activeCandidates * 5)}%</span>
          </div>
        </div>

        <div className="section-card flex items-center gap-4 p-3.5 hover:border-home-primary/20 hover:shadow-md hover:shadow-home-primary/10">
          <DonutChart value={completionRate} />
          <div className="min-w-0">
            <div className="mb-1 flex items-center gap-2">
              <PieChart className="size-4 text-secondary" />
              <p className="eyebrow">Hoàn thành</p>
            </div>
            <h2 className="mt-1 text-base font-black text-on-surface">Tiến độ LMS</h2>
            <p className="mt-2 text-xs font-semibold leading-5 text-on-surface-variant">
              {enrollments.length} lượt gán khóa, {courses.length} khóa đang theo dõi.
            </p>
          </div>
        </div>

        <div className="section-card p-3.5 hover:border-home-primary/20 hover:shadow-md hover:shadow-home-primary/10">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="eyebrow">Pipeline</p>
              <h2 className="mt-1 text-base font-black text-on-surface">Trạng thái nổi bật</h2>
            </div>
            <BarChart3 className="size-5 text-primary" />
          </div>
          <div className="space-y-3">
            {pipelineBars.map((item) => (
              <div key={item.label}>
                <div className="mb-1.5 flex items-center justify-between gap-3">
                  <span className="truncate text-xs font-black text-on-surface">{item.label}</span>
                  <span className="font-mono text-xs font-black text-on-surface-variant">{item.value}</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-surface-container">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.value / maxPipelineValue) * 100}%` }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                    className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-3 md:gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="section-card p-3.5 hover:border-home-primary/20 hover:shadow-md hover:shadow-home-primary/10">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="eyebrow">Đào tạo</p>
            <h2 className="mt-1 text-base font-black text-on-surface">Tiến độ theo phòng ban</h2>
            </div>
            <ClipboardList className="size-5 text-primary" />
          </div>
          <div className="space-y-3.5">
            {departments.map((dept) => (
              <div key={dept.name}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-black text-on-surface">{dept.name}</span>
                  <span className="font-mono text-xs font-bold text-on-surface-variant">{dept.progress}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container">
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

        <section className="section-card overflow-hidden hover:border-home-primary/20 hover:shadow-md hover:shadow-home-primary/10">
          <div className="border-b border-outline-variant p-3.5">
            <p className="eyebrow">Pipeline tuyển dụng</p>
            <h2 className="mt-1 text-base font-black text-on-surface">Ứng viên theo trạng thái</h2>
          </div>
          <div className="grid grid-cols-2 gap-px bg-outline-variant/70 sm:grid-cols-5">
            {candidateStages.map((stage) => {
              const count = candidates.filter((candidate) => candidate.stage === stage.id).length;
              return (
                <Link key={stage.id} to="/recruitment/candidates" className="bg-surface p-2.5 transition-all duration-300 hover:bg-surface-container-low hover:text-home-primary md:p-3">
                  <p className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant md:text-[10px]">{stage.label}</p>
                  <p className="mt-1 text-base font-black text-on-surface md:text-lg">{count}</p>
                </Link>
              );
            })}
          </div>
        </section>
      </div>

      <section className="grid gap-3 lg:grid-cols-2">
        {courseProgress.slice(0, 2).map(({ course, percent }) => (
          <Link key={course.id} to={`/training/${course.id}`} className="section-card flex items-center gap-3 p-3.5 hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-md">
            <div className={cn('flex size-10 items-center justify-center rounded-lg', course.department === 'Sale' ? 'bg-primary/10 text-primary' : 'bg-secondary-container text-on-secondary-container')}>
              {course.kpiLeadEligible ? <UserCheck className="size-5" /> : <GraduationCap className="size-5" />}
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

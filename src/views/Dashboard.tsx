import {
  BarChart3,
  BookOpenCheck,
  BriefcaseBusiness,
  ChevronRight,
  ClipboardList,
  FileQuestion,
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
import { CandidateStage, candidateStages, Course, Lesson, Progress, RecruitmentJob, Result, useCrm } from '../lib/crmStore';
import { useEffect, useMemo, useState } from 'react';
import { appSupabase } from '../lib/supabase';
import { getTodayKey } from '../lib/attendanceService';

type DbUser = {
  id: string;
  name: string | null;
  email: string | null;
  department: string | null;
  role: string | null;
  status: string | null;
  created_at: string | null;
  join_date: string | null;
};

type DbTimesheet = {
  id: string;
  user_id: string;
  schedule_date: string;
  check_in: string | null;
  check_out: string | null;
  status: string | null;
  created_at: string | null;
};

type DashboardCandidate = {
  id: string;
  stage: CandidateStage | string;
  createdAt: string | null;
};

type DashboardInterview = {
  result: string | null;
  scheduledAt: string | null;
};

type DashboardActivity = {
  createdAt: string | null;
};

type SupabaseDashboardData = {
  loaded: boolean;
  users: DbUser[];
  timesheets: DbTimesheet[];
  courses: Course[];
  lessons: Lesson[];
  progress: Progress[];
  enrollments: Array<{ userId: string; courseId: string; status: string | null }>;
  results: Result[];
  jobs: RecruitmentJob[];
  candidates: DashboardCandidate[];
  interviews: DashboardInterview[];
  activities: DashboardActivity[];
};

const emptySupabaseDashboard: SupabaseDashboardData = {
  loaded: false,
  users: [],
  timesheets: [],
  courses: [],
  lessons: [],
  progress: [],
  enrollments: [],
  results: [],
  jobs: [],
  candidates: [],
  interviews: [],
  activities: [],
};

function addDays(date: Date, offset: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + offset);
  return next;
}

function safeText(value: unknown) {
  return typeof value === 'string' ? value : '';
}

function normalizeStage(value: unknown): CandidateStage | string {
  const stage = safeText(value);
  return stage || 'new';
}

function mapDbCourse(row: Record<string, unknown>): Course {
  return {
    id: safeText(row.id),
    name: safeText(row.name) || 'Khóa học',
    department: (safeText(row.department) || 'Sale') as Course['department'],
    level: (safeText(row.level) || 'Cơ bản') as Course['level'],
    description: safeText(row.description),
    assignedRoles: Array.isArray(row.assigned_roles) ? row.assigned_roles.map(String) : [],
    assignedUsers: Array.isArray(row.assigned_users) ? row.assigned_users.map(String) : [],
    kpiLeadEligible: Boolean(row.kpi_lead_eligible),
  };
}

function mapDbLesson(row: Record<string, unknown>): Lesson {
  return {
    id: safeText(row.id),
    courseId: safeText(row.course_id),
    title: safeText(row.title) || 'Bài học',
    type: safeText(row.type) === 'document' ? 'document' : 'video',
    contentUrl: safeText(row.content_url),
    videoUrl: safeText(row.video_url) || undefined,
    duration: Number(row.duration) || 0,
    documentPages: row.document_pages ? Number(row.document_pages) : undefined,
  };
}

function mapDbProgress(row: Record<string, unknown>): Progress {
  return {
    userId: safeText(row.user_id),
    lessonId: safeText(row.lesson_id),
    percent: Number(row.percent) || 0,
    secondsWatched: Number(row.seconds_watched) || 0,
    completed: Boolean(row.completed),
  };
}

function mapDbResult(row: Record<string, unknown>): Result {
  return {
    id: safeText(row.id),
    userId: safeText(row.user_id),
    quizId: safeText(row.quiz_id),
    score: Number(row.score) || 0,
    passed: Boolean(row.passed),
    submittedAt: safeText(row.submitted_at) || safeText(row.created_at) || new Date().toISOString(),
  };
}

function SparklineChart({ values, delay = 0 }: { values: number[]; delay?: number }) {
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
  const lineLength = 360;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-24 w-full overflow-visible" role="img" aria-label="Biểu đồ xu hướng vận hành">
      <defs>
        <linearGradient id="dashboardLineFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#4f6540" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#4f6540" stopOpacity="0" />
        </linearGradient>
        <filter id="dashboardLineGlow" x="-20%" y="-35%" width="140%" height="170%">
          <feDropShadow dx="0" dy="8" stdDeviation="7" floodColor="#4f6540" floodOpacity="0.16" />
        </filter>
      </defs>
      <motion.polygon
        points={areaPoints}
        fill="url(#dashboardLineFill)"
        initial={{ opacity: 0, scaleY: 0.2, originY: 1 }}
        whileInView={{ opacity: 1, scaleY: 1 }}
        viewport={{ once: false, amount: 0.55 }}
        transition={{ delay: delay + 0.28, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.polyline
        points={points.join(' ')}
        fill="none"
        stroke="#4f6540"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="4"
        filter="url(#dashboardLineGlow)"
        initial={{ pathLength: 0, strokeDasharray: lineLength, strokeDashoffset: lineLength }}
        whileInView={{ pathLength: 1, strokeDashoffset: 0 }}
        viewport={{ once: false, amount: 0.55 }}
        transition={{ delay, duration: 1.25, ease: [0.22, 1, 0.36, 1] }}
      />
      {points.map((point, index) => {
        const [x, y] = point.split(',').map(Number);
        return (
          <motion.circle
            key={index}
            cx={x}
            cy={y}
            r="4"
            fill="#fffdf7"
            stroke="#4f6540"
            strokeWidth="3"
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false, amount: 0.55 }}
            transition={{ delay: delay + 0.15 + index * 0.08, duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          />
        );
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

async function readOptionalTable<T>(table: string, mapper: (row: Record<string, unknown>) => T, select = '*') {
  if (!appSupabase) return [];

  const { data, error } = await appSupabase
    .from(table)
    .select(select);

  if (error) {
    if (error.code !== 'PGRST205') console.warn(`Không đọc được bảng ${table}:`, error.message);
    return [];
  }

  return ((data || []) as unknown as Record<string, unknown>[]).map(mapper).filter(Boolean);
}

export default function Dashboard() {
  const { courses, lessons, progress, enrollments, currentUser, questions, results, recruitmentJobs, candidates, candidateActivities, candidateInterviews } = useCrm();
  const [supabaseDashboard, setSupabaseDashboard] = useState<SupabaseDashboardData>(emptySupabaseDashboard);

  useEffect(() => {
    if (!appSupabase) return;

    let cancelled = false;

    async function loadDashboardData() {
      try {
        const today = getTodayKey();
        const rangeStart = getTodayKey(addDays(new Date(), -29));
        const [
          usersResult,
          timesheetsResult,
          dbCourses,
          dbLessons,
          dbProgress,
          dbEnrollments,
          dbResults,
          dbJobs,
          dbCandidates,
          dbInterviews,
          dbActivities,
        ] = await Promise.all([
          appSupabase!
            .from('users')
            .select('id,name,email,department,role,status,created_at,join_date')
            .order('created_at', { ascending: false }),
          appSupabase!
          .from('timesheets')
            .select('id,user_id,schedule_date,check_in,check_out,status,created_at')
            .gte('schedule_date', rangeStart)
            .lte('schedule_date', today)
            .order('schedule_date', { ascending: true }),
          readOptionalTable('courses', mapDbCourse),
          readOptionalTable('lessons', mapDbLesson),
          readOptionalTable('lesson_progress', mapDbProgress),
          readOptionalTable('enrollments', (row) => ({
            userId: safeText(row.user_id),
            courseId: safeText(row.course_id),
            status: safeText(row.status) || null,
          })),
          readOptionalTable('results', mapDbResult),
          readOptionalTable('recruitment_jobs', (row) => ({
            id: safeText(row.id),
            title: safeText(row.title) || 'Vị trí tuyển dụng',
            department: (safeText(row.department) || 'Sale') as RecruitmentJob['department'],
            quantityNeeded: Number(row.quantity_needed) || Number(row.quantityNeeded) || 0,
            quantityHired: Number(row.quantity_hired) || Number(row.quantityHired) || 0,
            status: (safeText(row.status) || 'Đang mở') as RecruitmentJob['status'],
          })),
          readOptionalTable('candidates', (row) => ({
            id: safeText(row.id),
            stage: normalizeStage(row.stage),
            createdAt: safeText(row.created_at) || null,
          })),
          readOptionalTable('candidate_interviews', (row) => ({
            result: safeText(row.result) || null,
            scheduledAt: safeText(row.scheduled_at) || safeText(row.created_at) || null,
          })),
          readOptionalTable('candidate_activities', (row) => ({
            createdAt: safeText(row.created_at) || null,
          })),
        ]);

        if (usersResult.error) throw usersResult.error;
        if (timesheetsResult.error) throw timesheetsResult.error;
        if (cancelled) return;

        setSupabaseDashboard({
          loaded: true,
          users: (usersResult.data || []) as DbUser[],
          timesheets: (timesheetsResult.data || []) as DbTimesheet[],
          courses: dbCourses,
          lessons: dbLessons,
          progress: dbProgress,
          enrollments: dbEnrollments,
          results: dbResults,
          jobs: dbJobs,
          candidates: dbCandidates,
          interviews: dbInterviews,
          activities: dbActivities,
        });
      } catch {
        if (!cancelled) setSupabaseDashboard(emptySupabaseDashboard);
      }
    }

    void loadDashboardData();

    const channel = appSupabase
      .channel('dashboard-live-data')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'timesheets' }, () => void loadDashboardData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => void loadDashboardData())
      .subscribe();

    return () => {
      cancelled = true;
      void appSupabase?.removeChannel(channel);
    };
  }, []);

  const dashboardCourses = supabaseDashboard.courses.length ? supabaseDashboard.courses : courses;
  const dashboardLessons = supabaseDashboard.lessons.length ? supabaseDashboard.lessons : lessons;
  const dashboardProgress = supabaseDashboard.progress.length ? supabaseDashboard.progress : progress;
  const dashboardEnrollments = supabaseDashboard.enrollments.length ? supabaseDashboard.enrollments : enrollments;
  const dashboardResults = supabaseDashboard.results.length ? supabaseDashboard.results : results;
  const dashboardJobs = supabaseDashboard.jobs.length ? supabaseDashboard.jobs : recruitmentJobs;
  const dashboardCandidates = supabaseDashboard.candidates.length
    ? supabaseDashboard.candidates
    : candidates.map((candidate) => ({ id: candidate.id, stage: candidate.stage, createdAt: candidate.createdAt }));
  const dashboardInterviews = supabaseDashboard.interviews.length
    ? supabaseDashboard.interviews
    : candidateInterviews.map((interview) => ({ result: interview.result || null, scheduledAt: interview.scheduledAt }));
  const dashboardActivities = supabaseDashboard.activities.length
    ? supabaseDashboard.activities
    : candidateActivities.map((activity) => ({ createdAt: activity.createdAt }));

  const todayKey = getTodayKey();
  const todayTimesheets = supabaseDashboard.timesheets.filter((record) => record.schedule_date === todayKey);
  const attendanceStats = {
    checkedInToday: new Set(todayTimesheets.filter((row) => row.check_in).map((row) => row.user_id)).size,
    workingNow: todayTimesheets.filter((row) => row.check_in && !row.check_out).length,
    checkedOutToday: todayTimesheets.filter((row) => row.check_out).length,
  };

  const attendanceTrend = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = addDays(new Date(), index - 6);
      const key = getTodayKey(date);
      const dayRows = supabaseDashboard.timesheets.filter((record) => record.schedule_date === key);
      return {
        key,
        value: new Set(dayRows.filter((record) => record.check_in).map((record) => record.user_id)).size,
      };
    });

    return days.map((day) => day.value);
  }, [supabaseDashboard.timesheets]);

  const userDepartmentBars = useMemo(() => {
    const sourceUsers = supabaseDashboard.users.filter((user) => !user.status || user.status === 'active');
    const rows = sourceUsers.length
      ? Array.from(new Set(sourceUsers.map((user) => user.department || 'Chưa phân phòng'))).map((department) => ({
        label: department,
        value: sourceUsers.filter((user) => (user.department || 'Chưa phân phòng') === department).length,
      }))
      : [];

    return rows.sort((a, b) => b.value - a.value).slice(0, 5);
  }, [supabaseDashboard.users]);

  const courseProgress = dashboardCourses.map((course) => {
    const courseLessons = dashboardLessons.filter((lesson) => lesson.courseId === course.id);
    const rows = courseLessons.map((lesson) => dashboardProgress.find((item) => item.userId === currentUser.id && item.lessonId === lesson.id)?.percent ?? 0);
    const percent = rows.length ? Math.round(rows.reduce((sum, item) => sum + item, 0) / rows.length) : 0;
    return { course, percent };
  });

  const completionRate = courseProgress.length ? Math.round(courseProgress.reduce((sum, item) => sum + item.percent, 0) / courseProgress.length) : 0;
  const passRate = dashboardResults.length ? Math.round((dashboardResults.filter((item) => item.passed).length / dashboardResults.length) * 100) : 0;
  const activeCandidates = dashboardCandidates.filter((candidate) => candidate.stage !== 'official' && candidate.stage !== 'rejected').length;
  const hiredCandidates = dashboardCandidates.filter((candidate) => candidate.stage === 'official').length;
  const openJobs = dashboardJobs.filter((job) => job.status === 'Đang mở').length;
  const scheduledInterviews = dashboardInterviews.filter((interview) => !interview.result).length;
  const recentActivity = dashboardActivities.length;
  const departments = ['Sale', 'Kỹ thuật', 'Marketing'].map((department) => {
    const rows = courseProgress.filter((item) => item.course.department === department);
    return {
      name: department,
      progress: rows.length ? Math.round(rows.reduce((sum, item) => sum + item.percent, 0) / rows.length) : 0,
      tone: department === 'Sale' ? 'bg-primary' : department === 'Kỹ thuật' ? 'bg-secondary' : 'bg-tertiary-container',
    };
  });

  const metricCards = [
    { label: 'Khóa học', value: dashboardCourses.length, detail: `${dashboardLessons.length} bài học`, icon: GraduationCap, tone: 'bg-primary/10 text-primary' },
    { label: 'Hoàn thành LMS', value: `${completionRate}%`, detail: `${dashboardEnrollments.length} lượt gán`, icon: Gauge, tone: 'bg-secondary-container text-on-secondary-container' },
    { label: 'Quiz pass', value: dashboardResults.length ? `${passRate}%` : '0%', detail: `${dashboardResults.length}/${questions.length} kết quả`, icon: FileQuestion, tone: 'bg-tertiary-container/15 text-tertiary' },
    { label: 'Ứng viên', value: activeCandidates, detail: `${hiredCandidates} chính thức`, icon: Users, tone: 'bg-primary-fixed text-on-primary-fixed' },
  ];
  const operationsTrend = attendanceTrend.some(Boolean)
    ? attendanceTrend
    : [
      dashboardCourses.length * 8,
      dashboardEnrollments.length * 12,
      Math.max(completionRate, 8),
      activeCandidates * 14,
      Math.max(attendanceStats.checkedInToday * 16, 10),
      Math.max(attendanceStats.checkedOutToday * 18, attendanceStats.workingNow * 12, 12),
    ];
  const candidateStageBars = candidateStages
    .map((stage) => ({
      label: stage.label,
      value: dashboardCandidates.filter((candidate) => candidate.stage === stage.id).length,
    }))
    .filter((item) => item.value > 0)
    .slice(0, 5);
  const pipelineBars = candidateStageBars.length ? candidateStageBars : userDepartmentBars;
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
                Quản lý đào tạo và tuyển dụng trong một giao diện làm việc thống nhất.
              </p>
              {supabaseDashboard.loaded && (
                <span className="mt-3 inline-flex rounded-full border border-primary/20 bg-primary-fixed px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary">
                  Dữ liệu trực tiếp
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 md:flex">
              <Link to="/training" className="btn-primary">
                <BookOpenCheck className="size-4" />
                LMS
              </Link>
              <Link to="/recruitment/candidates" className="btn-secondary">
                <BriefcaseBusiness className="size-4" />
                Kanban
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
              <SparklineChart values={operationsTrend} delay={0.08} />
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
          <SparklineChart values={operationsTrend} delay={0.12} />
          <div className="mt-3 flex items-center justify-between rounded-md border border-home-outline bg-home-bg px-3 py-2">
            <span className="text-xs font-bold text-on-surface-variant">Đào tạo và tuyển dụng</span>
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
              {dashboardEnrollments.length} lượt gán khóa, {dashboardCourses.length} khóa đang theo dõi.
            </p>
          </div>
        </div>

        <div className="section-card p-3.5 hover:border-home-primary/20 hover:shadow-md hover:shadow-home-primary/10">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="eyebrow">Pipeline</p>
              <h2 className="mt-1 text-base font-black text-on-surface">{candidateStageBars.length ? 'Trạng thái nổi bật' : 'Nhân sự theo phòng ban'}</h2>
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
              const count = dashboardCandidates.filter((candidate) => candidate.stage === stage.id).length;
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

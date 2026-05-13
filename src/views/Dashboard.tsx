import {
  BookOpenCheck,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  FileQuestion,
  Gauge,
  GraduationCap,
  UserCheck,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import { candidateStages, useCrm } from '../lib/crmStore';

export default function Dashboard() {
  const { courses, lessons, progress, enrollments, currentUser, questions, results, recruitmentJobs, candidates, candidateActivities, candidateInterviews } = useCrm();

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
        <div className="p-5 md:p-6">
          <p className="eyebrow mb-3">Bảng điều hành nhân sự</p>
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <h1 className="max-w-2xl text-2xl font-black leading-tight text-on-surface md:text-3xl">
                Đào tạo nội bộ và tuyển dụng trong một luồng quản trị
              </h1>
              <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-on-surface-variant">
                Theo dõi tiến độ học, chấm quiz, quản lý pipeline ứng viên, lịch phỏng vấn và chuyển ứng viên nhận việc thành nhân viên.
              </p>
            </div>
            <div className="flex gap-2">
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
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((metric) => (
          <div key={metric.label} className="metric-card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="eyebrow">{metric.label}</p>
                <p className="mt-2 text-2xl font-black text-on-surface">{metric.value}</p>
                <p className="mt-1 text-xs font-semibold text-on-surface-variant">{metric.detail}</p>
              </div>
              <div className={cn('flex size-9 items-center justify-center rounded-lg', metric.tone)}>
                <metric.icon className="size-5" />
              </div>
            </div>
          </div>
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="section-card p-4">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="eyebrow">Đào tạo</p>
            <h2 className="mt-1 text-base font-black text-on-surface">Tiến độ theo phòng ban</h2>
            </div>
            <ClipboardList className="size-5 text-primary" />
          </div>
          <div className="space-y-5">
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
                <Link key={stage.id} to="/recruitment/candidates" className="bg-surface p-3 transition-colors hover:bg-surface-container-low">
                  <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">{stage.label}</p>
                  <p className="mt-2 text-xl font-black text-on-surface">{count}</p>
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

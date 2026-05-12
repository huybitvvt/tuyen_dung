import {
  LibraryBig,
  Users,
  FileQuestion,
  TrendingUp,
  Megaphone,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import { useCrm } from '../lib/crmStore';

export default function Dashboard() {
  const { courses, lessons, progress, enrollments, currentUser, questions, results, recruitmentJobs, candidates } = useCrm();

  const courseProgress = courses.map((course) => {
    const courseLessons = lessons.filter((lesson) => lesson.courseId === course.id);
    const courseProgressRows = courseLessons.map((lesson) => progress.find((item) => item.userId === currentUser.id && item.lessonId === lesson.id)?.percent ?? 0);
    const percent = courseProgressRows.length ? Math.round(courseProgressRows.reduce((sum, item) => sum + item, 0) / courseProgressRows.length) : 0;
    return { course, percent };
  });

  const departments = ['Sale', 'Kỹ thuật', 'Marketing'].map((department) => {
    const rows = courseProgress.filter((item) => item.course.department === department);
    const progressValue = rows.length ? Math.round(rows.reduce((sum, item) => sum + item.percent, 0) / rows.length) : 0;
    return { name: department, progress: progressValue, color: department === 'Sale' ? 'bg-primary' : department === 'Kỹ thuật' ? 'bg-secondary' : 'bg-tertiary-container' };
  });

  const completionRate = courseProgress.length ? Math.round(courseProgress.reduce((sum, item) => sum + item.percent, 0) / courseProgress.length) : 0;
  const activeCandidates = candidates.filter((candidate) => candidate.stage !== 'official' && candidate.stage !== 'rejected').length;
  const recentCourses = courseProgress.slice(0, 2);

  return (
    <div className="p-4 flex flex-col gap-6 md:p-8 max-w-5xl mx-auto">
      <section className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-full overflow-hidden bg-surface-container border border-outline-variant">
          <img
            alt="Avatar"
            className="object-cover w-full h-full"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBHh_9_7zfoHRFB8Vn01GCbMmj9l09mfP2CYUYOeIQlK8SI3QlYr00JwNCy16sUKkgVYFsg0t5pavQ6Dy5BkIngy4m84dvxLvwWacY5TK__OP2ZwFFhi7_lkimfHC98JGiuxoYTauQxMttXaIlPFDTp_omQhaAvZ4rn2o5OBUQVxKrS49j1sutLC2R9BEMiZJDPuAOZr1TRM3D5hevspxAgfwS05gDKp0OXqUpKb7b6D6yIZRqUDXH5eDcMuAd9VJmWRkyUTIfD-Q"
          />
        </div>
        <div>
          <p className="text-sm text-on-surface-variant font-medium">Chào buổi sáng,</p>
          <h2 className="text-xl font-bold text-on-surface">{currentUser.name}</h2>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm flex flex-col gap-3 border border-outline-variant/30">
          <div className="p-2 w-fit bg-primary/10 rounded-lg">
            <LibraryBig className="size-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-on-surface">{courses.length}</p>
            <p className="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant">Tổng khóa học</p>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm flex flex-col gap-3 border border-outline-variant/30">
          <div className="p-2 w-fit bg-tertiary-container/10 rounded-lg">
            <Users className="size-5 text-tertiary-container" />
          </div>
          <div>
            <p className="text-2xl font-bold text-on-surface">{enrollments.length}</p>
            <p className="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant">Lượt gán học</p>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm flex flex-col gap-3 border border-outline-variant/30 col-span-2 relative overflow-hidden">
          <div className="flex justify-between items-center w-full relative z-10">
            <div>
              <p className="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant mb-1">Tỷ lệ hoàn thành</p>
              <div className="flex items-end gap-2">
                <p className="text-3xl font-bold text-on-surface">{completionRate}%</p>
                <span className="text-[10px] font-bold text-primary mb-1 flex items-center gap-0.5">
                  <TrendingUp className="size-3" /> LMS
                </span>
              </div>
            </div>
            <div className="w-14 h-14 rounded-full border-4 border-surface-container flex items-center justify-center relative">
              <svg className="absolute inset-0 size-full -rotate-90">
                <circle
                  cx="50%"
                  cy="50%"
                  r="22"
                  className="fill-none stroke-primary stroke-[4]"
                  strokeDasharray="138"
                  strokeDashoffset={138 - (138 * completionRate) / 100}
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm flex flex-col gap-2 border border-outline-variant/30 col-span-2 lg:col-span-1">
          <div className="flex justify-between items-center">
            <p className="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant">Quiz / tuyển dụng</p>
            <FileQuestion className="size-4 text-secondary" />
          </div>
          <p className="text-xl font-bold text-on-surface">{results.length}/{questions.length} <span className="text-sm font-normal text-on-surface-variant">kết quả</span></p>
          <p className="text-xs text-on-surface-variant">{activeCandidates} ứng viên đang xử lý, {recruitmentJobs.length} vị trí</p>
        </div>
      </section>

      <section className="bg-surface-container-lowest p-5 rounded-xl shadow-sm border border-outline-variant/30 flex flex-col gap-4">
        <h3 className="text-lg font-bold text-on-surface">Tiến độ theo phòng ban</h3>
        <div className="flex flex-col gap-4">
          {departments.map((dept) => (
            <div key={dept.name}>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-semibold text-on-surface">{dept.name}</span>
                <span className="text-xs font-mono text-on-surface-variant">{dept.progress}%</span>
              </div>
              <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${dept.progress}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className={cn('h-full rounded-full', dept.color)}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-on-surface">Khóa học gần đây</h3>
          <Link to="/training" className="text-xs font-bold text-primary hover:underline">Xem tất cả</Link>
        </div>
        <div className="flex flex-col gap-3">
          {recentCourses.map(({ course, percent }, index) => {
            const Icon = index === 0 ? Megaphone : ShieldCheck;
            return (
              <Link
                key={course.id}
                to={`/training/${course.id}`}
                className="bg-surface-container-lowest p-3 pr-4 rounded-xl shadow-sm border border-outline-variant/30 flex items-center gap-4 hover:bg-surface-container-low transition-colors group"
              >
                <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center shrink-0', index === 0 ? 'bg-primary-container/20' : 'bg-secondary-container/30')}>
                  <Icon className={cn('size-6', index === 0 ? 'text-primary' : 'text-secondary')} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-on-surface truncate group-hover:text-primary transition-colors">{course.name}</h4>
                  <p className="text-[10px] text-on-surface-variant font-medium">{course.department} • {percent}%</p>
                </div>
                {course.kpiLeadEligible && (
                  <span className="px-2 py-0.5 bg-surface-container text-on-surface-variant text-[8px] font-bold uppercase tracking-wider rounded-full">
                    Quyền lead
                  </span>
                )}
                <ChevronRight className="size-4 text-outline-variant group-hover:text-primary transition-all" />
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

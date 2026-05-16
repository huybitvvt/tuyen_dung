import {
  Bell,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Layers3,
  Loader2,
  NotebookPen,
  FileQuestion,
  Plus,
  Sparkles,
  X,
  SlidersHorizontal,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Department, useCrm } from '../lib/crmStore';
import { FormEvent, useEffect, useMemo, useState } from 'react';

export default function TrainingList() {
  const { courses, lessons, progress, enrollments, employees, currentUser, createCourse, quizzes, questions } = useCrm();
  const [departmentFilter, setDepartmentFilter] = useState<'all' | Department>('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [courseForm, setCourseForm] = useState({
    name: '',
    department: 'Sale' as Department,
    level: 'Cơ bản' as 'Cơ bản' | 'Trung cấp' | 'Nâng cao',
    description: '',
    kpiLeadEligible: true,
  });

  const courseCards = useMemo(
    () =>
      courses.map((course) => {
        const courseLessons = lessons.filter((lesson) => lesson.courseId === course.id);
        const courseProgress = courseLessons.map(
          (lesson) => progress.find((item) => item.userId === currentUser.id && item.lessonId === lesson.id)?.percent ?? 0
        );
        const progressPercent = courseProgress.length
          ? Math.round(courseProgress.reduce((sum, item) => sum + item, 0) / courseProgress.length)
          : 0;
        const enrollment = enrollments.find((item) => item.userId === currentUser.id && item.courseId === course.id);
        const quiz = quizzes.find((item) => item.courseId === course.id);
        return {
          ...course,
          lessons: courseLessons.length,
          videos: courseLessons.filter((lesson) => lesson.type === 'video').length,
          documents: courseLessons.filter((lesson) => lesson.type === 'document').length,
          members: new Set(enrollments.filter((item) => item.courseId === course.id).map((item) => item.userId)).size,
          questionCount: quiz ? questions.filter((item) => item.quizId === quiz.id).length : 0,
          progress: progressPercent,
          status: enrollment?.status ?? 'chưa học',
        };
      }),
    [courses, lessons, progress, enrollments, currentUser.id, quizzes, questions]
  );

  const filteredCourses = courseCards.filter((course) => {
    const departmentMatch = departmentFilter === 'all' || course.department === departmentFilter;
    const levelMatch = levelFilter === 'all' || course.level === levelFilter;
    return departmentMatch && levelMatch;
  });

  const pendingCount = courseCards.filter((course) => course.status !== 'hoàn thành').length;
  const averageProgress = courseCards.length
    ? Math.round(courseCards.reduce((sum, course) => sum + course.progress, 0) / courseCards.length)
    : 0;

  function resetCourseForm() {
    setCourseForm({
      name: '',
      department: 'Sale',
      level: 'Cơ bản',
      description: '',
      kpiLeadEligible: true,
    });
  }

  function handleSubmitCourse(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = courseForm.name.trim();
    if (!name) return;
    const department = courseForm.department;
    createCourse({
      name,
      department,
      level: courseForm.level,
      description: courseForm.description.trim() || 'Khóa học mới cần bổ sung bài học và quiz.',
      assignedRoles: [department],
      assignedUsers: employees.filter((employee) => employee.department === department).map((employee) => employee.id),
      kpiLeadEligible: courseForm.kpiLeadEligible,
    });
    setIsCreateOpen(false);
    resetCourseForm();
  }

  useEffect(() => {
    document.body.style.overflow = isCreateOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCreateOpen]);

  const deptTone = (dept: Department) =>
    dept === 'Sale'
      ? 'bg-primary text-on-primary'
      : dept === 'Kỹ thuật'
      ? 'bg-tertiary text-on-tertiary'
      : 'bg-secondary text-on-secondary';

  return (
    <div className="page-shell text-on-surface">
      {/* HERO */}
      <section className="overflow-hidden rounded-2xl border border-outline-variant bg-surface shadow-sm">
        <div className="grid gap-0 lg:grid-cols-[1.4fr_1fr]">
          <div className="relative overflow-hidden p-4 md:p-6">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-fixed px-2.5 py-1 text-[9.5px] font-black uppercase tracking-[0.18em] text-primary">
              <Sparkles className="size-3.5" strokeWidth={2.5} />
              Training / LMS
            </div>
            <h1 className="font-display text-[24px] font-bold leading-tight tracking-tight text-on-surface md:text-[30px]">
              Đào tạo nội bộ
            </h1>
            <p className="mt-2 max-w-2xl text-[12px] font-semibold leading-5 text-on-surface-variant md:text-[13px]">
              Quản lý khóa học theo phòng ban, theo dõi video/tài liệu, gán khóa cho nhân viên và đánh giá năng lực bằng quiz.
            </p>
            <div className="mt-3.5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setIsCreateOpen(true)}
                className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-primary px-4 text-[11px] font-black uppercase tracking-[0.12em] text-on-primary shadow-sm shadow-primary/25 transition active:scale-95 hover:bg-primary-container"
              >
                <Plus className="size-4" strokeWidth={2.5} />
                Tạo khóa học
              </button>
              <span className="inline-flex h-10 items-center gap-2 rounded-xl border border-outline-variant bg-surface-container-low px-3 text-[11px] font-bold text-on-surface-variant">
                <GraduationCap className="size-4 text-secondary" strokeWidth={2.2} />
                {pendingCount} khóa cần học
              </span>
            </div>
          </div>
          <div className="border-t border-outline-variant bg-surface-container-low/60 p-3 md:border-l md:border-t-0 md:p-5">
            <div className="grid h-full grid-cols-3 gap-2">
              {[
                { label: 'Khóa học', value: courses.length, icon: Layers3, tone: 'bg-primary-fixed text-primary' },
                { label: 'Tiến độ TB', value: `${averageProgress}%`, icon: Loader2, tone: 'bg-tertiary-container text-on-tertiary-container' },
                { label: 'Cần học', value: pendingCount, icon: NotebookPen, tone: 'bg-secondary-container text-on-secondary-container' },
              ].map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-xl border border-outline-variant bg-surface p-2.5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md md:p-3"
                >
                  <div className={cn('mb-2 flex size-8 items-center justify-center rounded-lg', metric.tone)}>
                    <metric.icon className="size-4" strokeWidth={2.2} />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-on-surface-variant">{metric.label}</p>
                  <p className="mt-0.5 font-mono text-[18px] font-black tabular-nums leading-none text-on-surface md:text-[20px]">
                    {metric.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FILTERS */}
      <section className="flex flex-wrap items-center gap-2">
        <select
          value={departmentFilter}
          onChange={(event) => setDepartmentFilter(event.target.value as 'all' | Department)}
          className="h-10 min-w-max rounded-xl border border-outline-variant bg-surface px-3 text-[12.5px] font-bold text-on-surface outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
        >
          <option value="all">Tất cả phòng ban</option>
          <option value="Sale">Sale</option>
          <option value="Kỹ thuật">Kỹ thuật</option>
          <option value="Marketing">Marketing</option>
        </select>
        <select
          value={levelFilter}
          onChange={(event) => setLevelFilter(event.target.value)}
          className="h-10 min-w-max rounded-xl border border-outline-variant bg-surface px-3 text-[12.5px] font-bold text-on-surface outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
        >
          <option value="all">Mọi cấp độ</option>
          <option value="Cơ bản">Cơ bản</option>
          <option value="Trung cấp">Trung cấp</option>
          <option value="Nâng cao">Nâng cao</option>
        </select>
        <button
          type="button"
          className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-outline-variant bg-surface px-3 text-[11px] font-black uppercase tracking-[0.10em] text-on-surface-variant transition active:scale-95 hover:border-primary/30 hover:text-primary"
        >
          <SlidersHorizontal className="size-3.5" strokeWidth={2.5} />
          Lọc
        </button>
      </section>

      {/* COURSE GRID */}
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {filteredCourses.map((course) => {
          const isCompleted = course.status === 'hoàn thành';
          const statusClass = isCompleted
            ? 'border-primary/25 bg-primary-fixed text-primary'
            : course.status === 'đang học'
            ? 'border-secondary/25 bg-secondary-container text-on-secondary-container'
            : 'border-tertiary/25 bg-tertiary-container text-on-tertiary-container';
          return (
            <Link
              key={course.id}
              to={`/training/${course.id}`}
              className="group min-w-0 overflow-hidden rounded-2xl border border-outline-variant bg-surface shadow-sm transition active:scale-[0.99] hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-md"
            >
              <div className={cn('h-1', deptTone(course.department))} />
              <div className="p-3.5 md:p-4">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap gap-1.5">
                      <span className="rounded-full border border-outline-variant bg-surface-container-low px-2 py-0.5 text-[9.5px] font-black uppercase tracking-[0.10em] text-on-surface-variant">
                        {course.department}
                      </span>
                      <span className="rounded-full border border-outline-variant bg-surface-container-low px-2 py-0.5 text-[9.5px] font-black uppercase tracking-[0.10em] text-on-surface-variant">
                        {course.level}
                      </span>
                    </div>
                    <h2 className="line-clamp-2 text-[14px] font-black leading-[1.35] text-on-surface group-hover:text-primary md:text-[15px]">
                      {course.name}
                    </h2>
                  </div>
                  <span
                    className={cn(
                      'shrink-0 rounded-full border px-2 py-0.5 text-[9.5px] font-black uppercase tracking-[0.10em]',
                      statusClass
                    )}
                  >
                    {course.status}
                  </span>
                </div>

                <p className="line-clamp-2 min-h-[2.6rem] text-[12px] font-semibold leading-[1.55] text-on-surface-variant">
                  {course.description}
                </p>

                <div className="mt-3 grid grid-cols-3 gap-1.5">
                  <div className="rounded-xl border border-outline-variant bg-surface-container-low/60 p-2">
                    <BookOpen className="mb-1.5 size-4 text-primary" strokeWidth={2.2} />
                    <p className="font-mono text-[12px] font-black tabular-nums text-on-surface">{course.lessons}</p>
                    <p className="text-[9.5px] font-bold uppercase tracking-[0.10em] text-on-surface-variant">Bài học</p>
                  </div>
                  <div className="rounded-xl border border-outline-variant bg-surface-container-low/60 p-2">
                    <Users className="mb-1.5 size-4 text-secondary" strokeWidth={2.2} />
                    <p className="font-mono text-[12px] font-black tabular-nums text-on-surface">{course.members}</p>
                    <p className="text-[9.5px] font-bold uppercase tracking-[0.10em] text-on-surface-variant">Nhân viên</p>
                  </div>
                  <div className="rounded-xl border border-outline-variant bg-surface-container-low/60 p-2">
                    <FileQuestion className="mb-1.5 size-4 text-tertiary" strokeWidth={2.2} />
                    <p className="font-mono text-[12px] font-black tabular-nums text-on-surface">{course.questionCount}</p>
                    <p className="text-[9.5px] font-bold uppercase tracking-[0.10em] text-on-surface-variant">Câu hỏi</p>
                  </div>
                </div>

                <div className="mt-3.5">
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-[0.14em] text-on-surface-variant">Tiến độ</span>
                    <span className="font-mono text-[11px] font-black tabular-nums text-on-surface">{course.progress}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${course.progress}%` }}
                      transition={{ duration: 0.7 }}
                      className={cn('h-full rounded-full', isCompleted ? 'bg-primary' : 'bg-secondary')}
                    />
                  </div>
                </div>

                <div className="mt-3.5 flex items-center justify-between gap-2 border-t border-outline-variant/60 pt-3">
                  <div className="flex min-w-0 items-center gap-1.5 text-[11px] font-bold text-on-surface-variant">
                    {isCompleted ? (
                      <CheckCircle2 className="size-3.5 shrink-0 text-primary" strokeWidth={2.2} />
                    ) : (
                      <Bell className="size-3.5 shrink-0 text-secondary" strokeWidth={2.2} />
                    )}
                    <span className="truncate">
                      {course.videos} video · {course.documents} tài liệu
                    </span>
                  </div>
                  {course.kpiLeadEligible && (
                    <span className="shrink-0 rounded-full border border-primary/25 bg-primary-fixed px-2 py-0.5 text-[9.5px] font-black uppercase tracking-[0.10em] text-primary">
                      KPI lead
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}

        {filteredCourses.length === 0 && (
          <div className="md:col-span-2 xl:col-span-3 flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-outline-variant bg-surface px-4 py-10 text-center">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-surface-container-low text-on-surface-variant">
              <BookOpen className="size-5" strokeWidth={2} />
            </div>
            <p className="text-[13px] font-black text-on-surface">Không có khóa học phù hợp</p>
            <p className="max-w-xs text-[11px] font-medium text-on-surface-variant">
              Thử đổi bộ lọc phòng ban hoặc cấp độ.
            </p>
          </div>
        )}
      </section>

      {/* CREATE COURSE BOTTOM SHEET */}
      <AnimatePresence>
        {isCreateOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[80] flex items-end justify-center bg-black/55 backdrop-blur-sm md:items-center md:p-6"
            onClick={() => setIsCreateOpen(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
              className="flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl border border-b-0 border-outline-variant bg-surface shadow-[0_-12px_50px_rgba(0,0,0,0.16)] md:max-w-xl md:rounded-3xl md:border-b md:shadow-2xl"
            >
              <div className="flex justify-center pt-2.5 pb-1 md:hidden">
                <div className="h-1 w-10 rounded-full bg-outline-variant/70" />
              </div>

              <div className="flex shrink-0 items-center gap-3 border-b border-outline-variant px-4 pt-2 pb-3 md:pt-4 md:px-5">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-on-primary shadow-sm shadow-primary/25">
                  <Plus className="size-5" strokeWidth={2.5} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-on-surface-variant">Khóa học mới</p>
                  <h3 className="mt-0.5 truncate font-display text-[18px] font-bold leading-tight text-on-surface md:text-[20px]">
                    Tạo khóa học
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="flex size-9 shrink-0 items-center justify-center rounded-full border border-outline-variant bg-surface text-on-surface-variant transition active:scale-90 hover:bg-surface-container-high hover:text-on-surface"
                  aria-label="Đóng"
                >
                  <X className="size-4" strokeWidth={2.5} />
                </button>
              </div>

              <form onSubmit={handleSubmitCourse} className="flex min-h-0 flex-1 flex-col">
                <div className="flex-1 overflow-y-auto px-4 py-4 md:px-5">
                  <div className="grid gap-3">
                    <label className="block">
                      <span className="text-[10px] font-black uppercase tracking-[0.14em] text-on-surface-variant">
                        Tên khóa học <span className="text-error">*</span>
                      </span>
                      <input
                        value={courseForm.name}
                        onChange={(event) => setCourseForm((current) => ({ ...current, name: event.target.value }))}
                        autoFocus
                        required
                        placeholder="VD: Kỹ năng tư vấn khách hàng"
                        className="mt-1.5 h-12 w-full rounded-2xl border border-outline-variant bg-surface px-4 text-[13.5px] font-bold text-on-surface outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                      />
                    </label>

                    <div className="grid gap-3 md:grid-cols-2">
                      <label className="block">
                        <span className="text-[10px] font-black uppercase tracking-[0.14em] text-on-surface-variant">Phòng ban</span>
                        <select
                          value={courseForm.department}
                          onChange={(event) => {
                            const department = event.target.value as Department;
                            setCourseForm((current) => ({
                              ...current,
                              department,
                              kpiLeadEligible: department === 'Sale',
                            }));
                          }}
                          className="mt-1.5 h-12 w-full rounded-2xl border border-outline-variant bg-surface px-4 text-[13.5px] font-bold text-on-surface outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                        >
                          <option value="Sale">Sale</option>
                          <option value="Kỹ thuật">Kỹ thuật</option>
                          <option value="Marketing">Marketing</option>
                        </select>
                      </label>

                      <label className="block">
                        <span className="text-[10px] font-black uppercase tracking-[0.14em] text-on-surface-variant">Cấp độ</span>
                        <select
                          value={courseForm.level}
                          onChange={(event) =>
                            setCourseForm((current) => ({
                              ...current,
                              level: event.target.value as 'Cơ bản' | 'Trung cấp' | 'Nâng cao',
                            }))
                          }
                          className="mt-1.5 h-12 w-full rounded-2xl border border-outline-variant bg-surface px-4 text-[13.5px] font-bold text-on-surface outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                        >
                          <option value="Cơ bản">Cơ bản</option>
                          <option value="Trung cấp">Trung cấp</option>
                          <option value="Nâng cao">Nâng cao</option>
                        </select>
                      </label>
                    </div>

                    <label className="block">
                      <span className="text-[10px] font-black uppercase tracking-[0.14em] text-on-surface-variant">Mô tả</span>
                      <textarea
                        value={courseForm.description}
                        onChange={(event) => setCourseForm((current) => ({ ...current, description: event.target.value }))}
                        placeholder="Mục tiêu, nội dung chính hoặc ghi chú triển khai khóa học."
                        rows={4}
                        className="mt-1.5 w-full resize-y rounded-2xl border border-outline-variant bg-surface px-4 py-3 text-[13px] font-medium leading-6 text-on-surface outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                      />
                    </label>

                    <label className="flex items-center justify-between gap-4 rounded-2xl border border-outline-variant bg-surface-container-low/40 p-3.5">
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13px] font-black text-on-surface">Tính vào KPI lead</span>
                        <span className="mt-0.5 block text-[11px] font-semibold leading-[1.45] text-on-surface-variant">
                          Phù hợp cho các khóa Sale hoặc khóa cần theo dõi năng lực tạo lead.
                        </span>
                      </span>
                      <input
                        type="checkbox"
                        checked={courseForm.kpiLeadEligible}
                        onChange={(event) =>
                          setCourseForm((current) => ({ ...current, kpiLeadEligible: event.target.checked }))
                        }
                        className="size-5 shrink-0 accent-primary"
                      />
                    </label>
                  </div>
                </div>

                <div className="grid shrink-0 grid-cols-2 gap-2 border-t border-outline-variant bg-surface-container-low/40 p-3">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="inline-flex h-12 items-center justify-center rounded-2xl border border-outline-variant bg-surface text-[11px] font-black uppercase tracking-[0.10em] text-on-surface-variant transition active:scale-95 hover:bg-surface-container-high"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="inline-flex h-12 items-center justify-center gap-1.5 rounded-2xl bg-primary text-[11px] font-black uppercase tracking-[0.10em] text-on-primary shadow-md shadow-primary/25 transition active:scale-95 hover:bg-primary-container"
                  >
                    <Plus className="size-4" strokeWidth={2.5} />
                    Tạo khóa
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

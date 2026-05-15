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
import { motion } from 'motion/react';
import { Department, useCrm } from '../lib/crmStore';
import { FormEvent, useMemo, useState } from 'react';

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

  const courseCards = useMemo(() => courses.map((course) => {
    const courseLessons = lessons.filter((lesson) => lesson.courseId === course.id);
    const courseProgress = courseLessons.map((lesson) => progress.find((item) => item.userId === currentUser.id && item.lessonId === lesson.id)?.percent ?? 0);
    const progressPercent = courseProgress.length ? Math.round(courseProgress.reduce((sum, item) => sum + item, 0) / courseProgress.length) : 0;
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
  }), [courses, lessons, progress, enrollments, currentUser.id, quizzes, questions]);

  const filteredCourses = courseCards.filter((course) => {
    const departmentMatch = departmentFilter === 'all' || course.department === departmentFilter;
    const levelMatch = levelFilter === 'all' || course.level === levelFilter;
    return departmentMatch && levelMatch;
  });

  const pendingCount = courseCards.filter((course) => course.status !== 'hoàn thành').length;
  const averageProgress = courseCards.length ? Math.round(courseCards.reduce((sum, course) => sum + course.progress, 0) / courseCards.length) : 0;

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

  return (
    <div className="page-shell max-w-[1600px] bg-[#fbf8ef] text-[#1b1c19] md:rounded-tl-lg">
      <section className="overflow-hidden rounded-lg border border-[#e5dfd2] bg-[#fffdf7] shadow-sm shadow-[#4f6540]/5">
        <div className="grid gap-0 lg:grid-cols-[1fr_420px]">
          <div className="relative overflow-hidden p-5 md:p-6">
            <div className="absolute inset-y-0 right-0 hidden w-72 bg-[radial-gradient(circle_at_center,#f2ead9,transparent_68%)] opacity-80 md:block" />
            <div className="relative">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#e5dfd2] bg-[#fbf8ef] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-[#4f6540]">
                <Sparkles className="size-3.5" />
                Training / LMS
              </div>
              <h1 className="max-w-3xl font-display text-[34px] font-bold leading-none tracking-tight text-[#1b1c19] md:text-[48px]">
                Đào tạo nội bộ
              </h1>
              <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-[#444840]">
                Quản lý khóa học theo phòng ban, theo dõi video/tài liệu, gán khóa cho nhân viên và đánh giá năng lực bằng quiz.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <button onClick={() => setIsCreateOpen(true)} className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#4f6540] px-4 text-xs font-black uppercase tracking-widest text-white shadow-sm shadow-[#4f6540]/20 transition hover:bg-[#6b7f4e] active:scale-[0.98]">
                  <Plus className="size-4" />
                  Tạo khóa học
                </button>
                <span className="inline-flex h-10 items-center gap-2 rounded-md border border-[#e5dfd2] bg-[#fbf8ef] px-4 text-xs font-bold text-[#444840]">
                  <GraduationCap className="size-4 text-[#c9823a]" />
                  {pendingCount} khóa cần học
                </span>
              </div>
            </div>
          </div>
          <div className="border-t border-[#e5dfd2] bg-[#fbf8ef] p-4 lg:border-l lg:border-t-0">
            <div className="grid h-full grid-cols-3 gap-3">
              {[
                { label: 'Khóa', value: courses.length, icon: Layers3 },
                { label: 'TB', value: `${averageProgress}%`, icon: Loader2 },
                { label: 'Cần học', value: pendingCount, icon: NotebookPen },
              ].map((metric) => (
                <div key={metric.label} className="rounded-lg border border-[#e5dfd2] bg-[#fffdf7] p-3 shadow-sm">
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-md bg-[#f2ead9] text-[#4f6540]">
                    <metric.icon className="size-4" />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#676b62]">{metric.label}</p>
                  <p className="mt-1 text-2xl font-bold leading-none text-[#1b1c19]">{metric.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <select value={departmentFilter} onChange={(event) => setDepartmentFilter(event.target.value as 'all' | Department)} className="h-9 min-w-max rounded-md border border-[#e5dfd2] bg-[#fffdf7] px-3 text-xs font-bold text-[#1b1c19] outline-none focus:ring-2 focus:ring-[#4f6540]/20 md:h-10 md:text-sm">
            <option value="all">Tất cả phòng ban</option>
            <option value="Sale">Sale</option>
            <option value="Kỹ thuật">Kỹ thuật</option>
            <option value="Marketing">Marketing</option>
          </select>
          <select value={levelFilter} onChange={(event) => setLevelFilter(event.target.value)} className="h-9 min-w-max rounded-md border border-[#e5dfd2] bg-[#fffdf7] px-3 text-xs font-bold text-[#1b1c19] outline-none focus:ring-2 focus:ring-[#4f6540]/20 md:h-10 md:text-sm">
            <option value="all">Mọi cấp độ</option>
            <option value="Cơ bản">Cơ bản</option>
            <option value="Trung cấp">Trung cấp</option>
            <option value="Nâng cao">Nâng cao</option>
          </select>
          <button className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-[#e5dfd2] bg-[#fffdf7] px-3 text-[11px] font-black uppercase tracking-widest text-[#444840] transition hover:border-[#4f6540]/40 hover:text-[#4f6540] md:h-10 md:px-4 md:text-xs">
            <SlidersHorizontal className="size-4" /> Lọc
          </button>
        </div>
        <button onClick={() => setIsCreateOpen(true)} className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#4f6540] px-4 text-xs font-black uppercase tracking-widest text-white shadow-sm shadow-[#4f6540]/20 transition hover:bg-[#6b7f4e] active:scale-[0.98]">
          <Plus className="size-4" />
          Tạo khóa học
        </button>
      </section>

      <section className="grid gap-3 md:grid-cols-2 md:gap-4 xl:grid-cols-3">
        {filteredCourses.map((course) => {
          const isCompleted = course.status === 'hoàn thành';
          const statusClass = isCompleted
            ? 'border-[#4f6540]/25 bg-[#edf4e4] text-[#4f6540]'
            : course.status === 'đang học'
              ? 'border-[#c9823a]/25 bg-[#fff0e2] text-[#c9823a]'
              : 'border-[#b99137]/25 bg-[#fff5d8] text-[#b99137]';
          return (
            <Link key={course.id} to={`/training/${course.id}`} className="overflow-hidden rounded-lg border border-[#e5dfd2] bg-[#fffdf7] shadow-sm shadow-[#4f6540]/5 transition-all hover:-translate-y-0.5 hover:border-[#4f6540]/40 hover:shadow-md">
              <div className={cn('h-2', course.department === 'Sale' ? 'bg-[#4f6540]' : course.department === 'Kỹ thuật' ? 'bg-[#c9823a]' : 'bg-[#e0ad24]')} />
              <div className="p-3.5 md:p-4">
                <div className="mb-3 flex items-start justify-between gap-2 md:gap-3">
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap gap-2">
                      <span className="rounded border border-[#e5dfd2] bg-[#fbf8ef] px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-[#444840]">{course.department}</span>
                      <span className="rounded border border-[#e5dfd2] bg-[#fbf8ef] px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-[#444840]">{course.level}</span>
                    </div>
                    <h2 className="line-clamp-2 text-sm font-black leading-5 text-[#1b1c19] md:text-base md:leading-6">{course.name}</h2>
                  </div>
                  <span className={cn('status-pill shrink-0', statusClass)}>{course.status}</span>
                </div>

                <p className="min-h-10 text-xs font-semibold leading-5 text-[#444840] md:text-sm">{course.description}</p>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  <div className="rounded-md border border-[#e5dfd2] bg-[#fbf8ef] p-3">
                    <BookOpen className="mb-2 size-4 text-[#4f6540]" />
                    <p className="text-xs font-black">{course.lessons}</p>
                    <p className="text-[10px] font-bold text-[#676b62]">Bài học</p>
                  </div>
                  <div className="rounded-md border border-[#e5dfd2] bg-[#fbf8ef] p-3">
                    <Users className="mb-2 size-4 text-[#c9823a]" />
                    <p className="text-xs font-black">{course.members}</p>
                    <p className="text-[10px] font-bold text-[#676b62]">Nhân viên</p>
                  </div>
                  <div className="rounded-md border border-[#e5dfd2] bg-[#fbf8ef] p-3">
                    <FileQuestion className="mb-2 size-4 text-[#b99137]" />
                    <p className="text-xs font-black">{course.questionCount}</p>
                    <p className="text-[10px] font-bold text-[#676b62]">Câu hỏi</p>
                  </div>
                </div>

                <div className="mt-5">
                  <div className="mb-2 flex justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#676b62]">Tiến độ</span>
                    <span className="font-mono text-xs font-black text-[#1b1c19]">{course.progress}%</span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#e5dfd2]">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${course.progress}%` }} transition={{ duration: 0.8 }} className={cn('h-full rounded-full', isCompleted ? 'bg-[#4f6540]' : 'bg-[#c9823a]')} />
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-[#e5dfd2]/80 pt-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#444840]">
                    {isCompleted ? <CheckCircle2 className="size-4 text-[#4f6540]" /> : <Bell className="size-4 text-[#c9823a]" />}
                    {course.videos} video • {course.documents} tài liệu
                  </div>
                  {course.kpiLeadEligible && <span className="rounded border border-[#4f6540]/20 bg-[#edf4e4] px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-[#4f6540]">KPI lead</span>}
                </div>
              </div>
            </Link>
          );
        })}
      </section>

      {isCreateOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#1b1c19]/45 px-3 py-6 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="w-full max-w-2xl overflow-hidden rounded-lg border border-[#e5dfd2] bg-[#fffdf7] shadow-2xl shadow-black/20"
          >
            <div className="flex items-start justify-between gap-4 border-b border-[#e5dfd2] bg-[#fbf8ef] p-5">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#4f6540]">Khóa học mới</p>
                <h2 className="mt-1 font-display text-3xl font-bold leading-none text-[#1b1c19]">Tạo khóa học</h2>
                <p className="mt-2 text-sm font-semibold text-[#444840]">Điền thông tin cơ bản để thêm khóa vào danh sách đào tạo.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="flex size-9 shrink-0 items-center justify-center rounded-md border border-[#e5dfd2] bg-[#fffdf7] text-[#444840] transition hover:text-[#4f6540]"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitCourse} className="grid gap-4 p-5">
              <label className="block">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#676b62]">Tên khóa học</span>
                <input
                  value={courseForm.name}
                  onChange={(event) => setCourseForm((current) => ({ ...current, name: event.target.value }))}
                  autoFocus
                  required
                  placeholder="VD: Kỹ năng tư vấn khách hàng"
                  className="mt-2 h-11 w-full rounded-md border border-[#e5dfd2] bg-white px-3 text-sm font-bold text-[#1b1c19] outline-none transition focus:border-[#4f6540] focus:ring-4 focus:ring-[#4f6540]/10"
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#676b62]">Phòng ban</span>
                  <select
                    value={courseForm.department}
                    onChange={(event) => {
                      const department = event.target.value as Department;
                      setCourseForm((current) => ({ ...current, department, kpiLeadEligible: department === 'Sale' }));
                    }}
                    className="mt-2 h-11 w-full rounded-md border border-[#e5dfd2] bg-white px-3 text-sm font-bold text-[#1b1c19] outline-none transition focus:border-[#4f6540] focus:ring-4 focus:ring-[#4f6540]/10"
                  >
                    <option value="Sale">Sale</option>
                    <option value="Kỹ thuật">Kỹ thuật</option>
                    <option value="Marketing">Marketing</option>
                  </select>
                </label>

                <label className="block">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#676b62]">Cấp độ</span>
                  <select
                    value={courseForm.level}
                    onChange={(event) => setCourseForm((current) => ({ ...current, level: event.target.value as 'Cơ bản' | 'Trung cấp' | 'Nâng cao' }))}
                    className="mt-2 h-11 w-full rounded-md border border-[#e5dfd2] bg-white px-3 text-sm font-bold text-[#1b1c19] outline-none transition focus:border-[#4f6540] focus:ring-4 focus:ring-[#4f6540]/10"
                  >
                    <option value="Cơ bản">Cơ bản</option>
                    <option value="Trung cấp">Trung cấp</option>
                    <option value="Nâng cao">Nâng cao</option>
                  </select>
                </label>
              </div>

              <label className="block">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#676b62]">Mô tả</span>
                <textarea
                  value={courseForm.description}
                  onChange={(event) => setCourseForm((current) => ({ ...current, description: event.target.value }))}
                  placeholder="Mục tiêu, nội dung chính hoặc ghi chú triển khai khóa học."
                  rows={4}
                  className="mt-2 w-full resize-none rounded-md border border-[#e5dfd2] bg-white px-3 py-3 text-sm font-semibold leading-6 text-[#1b1c19] outline-none transition focus:border-[#4f6540] focus:ring-4 focus:ring-[#4f6540]/10"
                />
              </label>

              <label className="flex items-center justify-between gap-4 rounded-md border border-[#e5dfd2] bg-[#fbf8ef] p-3">
                <span>
                  <span className="block text-sm font-black text-[#1b1c19]">Tính vào KPI lead</span>
                  <span className="mt-1 block text-xs font-semibold text-[#676b62]">Phù hợp cho các khóa Sale hoặc khóa cần theo dõi năng lực tạo lead.</span>
                </span>
                <input
                  type="checkbox"
                  checked={courseForm.kpiLeadEligible}
                  onChange={(event) => setCourseForm((current) => ({ ...current, kpiLeadEligible: event.target.checked }))}
                  className="size-5 accent-[#4f6540]"
                />
              </label>

              <div className="flex flex-col-reverse gap-2 border-t border-[#e5dfd2] pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="inline-flex h-10 items-center justify-center rounded-md border border-[#e5dfd2] bg-white px-4 text-xs font-black uppercase tracking-widest text-[#444840] transition hover:text-[#4f6540]"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#4f6540] px-5 text-xs font-black uppercase tracking-widest text-white shadow-sm shadow-[#4f6540]/20 transition hover:bg-[#6b7f4e]"
                >
                  <Plus className="size-4" />
                  Tạo khóa học
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

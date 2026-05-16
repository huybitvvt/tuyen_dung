import {
  ArrowLeft,
  MoreVertical,
  Play,
  PlayCircle,
  FileText,
  Clock,
  CheckCircle,
  ClipboardList,
  UserPlus,
  X,
  Users,
} from 'lucide-react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useCrm } from '../lib/crmStore';
import { FormEvent, useState } from 'react';
import { motion } from 'motion/react';

export default function CourseDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { courses, lessons, progress, quizzes, results, currentUser, assignCourse, employees, enrollments } = useCrm();
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const course = courses.find((item) => item.id === id);
  const courseLessons = lessons.filter((lesson) => lesson.courseId === id);
  const quiz = quizzes.find((item) => item.courseId === id);
  const latestResult = quiz ? results.filter((item) => item.quizId === quiz.id && item.userId === currentUser.id).at(-1) : undefined;

  if (!course) {
    return (
      <div className="p-8">
        <button onClick={() => navigate(-1)} className="text-primary font-bold">Quay lại</button>
        <p className="mt-4 text-on-surface">Không tìm thấy khóa học.</p>
      </div>
    );
  }

  const progressRows = courseLessons.map((lesson) => progress.find((item) => item.userId === currentUser.id && item.lessonId === lesson.id)?.percent ?? 0);
  const coursePercent = progressRows.length ? Math.round(progressRows.reduce((sum, item) => sum + item, 0) / progressRows.length) : 0;

  // Get employees not yet enrolled in this course
  const enrolledUserIds = enrollments.filter((e) => e.courseId === course?.id).map((e) => e.userId);
  const availableEmployees = employees.filter((emp) => !enrolledUserIds.includes(emp.id));

  function handleOpenAssign() {
    setSelectedEmployees([]);
    setIsAssignOpen(true);
  }

  function handleToggleEmployee(employeeId: string) {
    setSelectedEmployees((current) =>
      current.includes(employeeId)
        ? current.filter((id) => id !== employeeId)
        : [...current, employeeId]
    );
  }

  function handleSubmitAssign(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!course || selectedEmployees.length === 0) return;
    
    selectedEmployees.forEach((employeeId) => {
      const employee = employees.find((emp) => emp.id === employeeId);
      if (employee) {
        assignCourse(course.id, employee.name);
      }
    });
    
    setIsAssignOpen(false);
    setSelectedEmployees([]);
  }

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <header className="sticky top-0 z-50 flex h-14 w-full items-center justify-between gap-2 border-b border-outline-variant bg-surface px-3 shadow-sm md:h-16 md:px-5">
        <button
          onClick={() => navigate(-1)}
          className="flex size-10 shrink-0 items-center justify-center rounded-full text-on-surface-variant transition active:scale-90 hover:bg-surface-container-high hover:text-primary"
          aria-label="Quay lại"
        >
          <ArrowLeft className="size-5" strokeWidth={2.2} />
        </button>
        <div className="min-w-0 flex-1 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-on-surface-variant">Khóa học</p>
          <h1 className="truncate text-[14px] font-black leading-tight text-on-surface md:text-[15px]">
            {course.name}
          </h1>
        </div>
        <button
          type="button"
          onClick={handleOpenAssign}
          className="hidden h-10 shrink-0 items-center gap-1.5 rounded-xl bg-primary px-3.5 text-[10.5px] font-black uppercase tracking-[0.10em] text-on-primary shadow-sm shadow-primary/25 transition active:scale-95 hover:bg-primary-container md:inline-flex"
        >
          <UserPlus className="size-4" strokeWidth={2.5} />
          Gán cho NV
        </button>
        <button
          type="button"
          aria-label="Thêm tùy chọn"
          className="flex size-10 shrink-0 items-center justify-center rounded-full text-on-surface-variant transition active:scale-90 hover:bg-surface-container-high hover:text-primary md:hidden"
        >
          <MoreVertical className="size-5" />
        </button>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 overflow-y-auto pb-24 md:pb-12">
        <div className="w-full aspect-video bg-surface-container-highest relative flex items-center justify-center group overflow-hidden">
          <div className={cn(
            'absolute inset-0',
            course.department === 'Sale' ? 'bg-gradient-to-br from-blue-700 to-cyan-500' : course.department === 'Kỹ thuật' ? 'bg-gradient-to-br from-slate-800 to-teal-600' : 'bg-gradient-to-br from-emerald-700 to-lime-500'
          )} />
          <div className="absolute inset-0 bg-gradient-to-t from-on-surface/60 to-transparent"></div>
          <Link to={`/training/${course.id}/lesson/${courseLessons[0]?.id ?? ''}`} className="z-10 bg-primary text-on-primary rounded-full p-4 shadow-lg hover:scale-110 transition-transform">
            <Play className="size-8 fill-current" />
          </Link>
          <div className="absolute bottom-4 left-4 z-10">
            <span className="bg-surface/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-bold border border-white/30">
              {coursePercent}% hoàn thành
            </span>
          </div>
        </div>

        <div className="p-4 py-8 flex flex-col gap-4 md:p-8">
          <h2 className="text-3xl font-bold text-on-surface leading-tight">{course.name}</h2>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 bg-surface-container-low border border-outline-variant text-on-surface-variant px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
              <Clock className="size-3.5" /> Dept: {course.department}
            </span>
            <span className="inline-flex items-center gap-1.5 bg-secondary-container/50 text-on-secondary-container px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
              <CheckCircle className="size-3.5" /> Level: {course.level}
            </span>
            {course.kpiLeadEligible && (
              <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                Gắn KPI & quyền nhận lead
              </span>
            )}
          </div>
          <p className="text-sm text-on-surface-variant leading-relaxed mt-2 max-w-2xl">{course.description}</p>
        </div>

        <hr className="border-outline-variant mx-4 md:mx-8" />

        <div className="p-4 py-8 flex flex-col gap-6 md:p-8">
          <div className="flex justify-between items-end">
            <h3 className="text-xl font-bold text-on-surface">Nội dung khóa học</h3>
            <span className="text-[10px] font-bold uppercase tracking-widest text-outline">{courseLessons.length} bài học • {quiz ? '1 bài kiểm tra' : '0 bài kiểm tra'}</span>
          </div>

          <div className="flex flex-col gap-3">
            {courseLessons.map((lesson, index) => {
              const lessonProgress = progress.find((item) => item.userId === currentUser.id && item.lessonId === lesson.id);
              const percent = lessonProgress?.percent ?? 0;
              return (
                <Link
                  key={lesson.id}
                  to={`/training/${course.id}/lesson/${lesson.id}`}
                  className={cn(
                    'bg-surface-container-lowest border rounded-xl p-4 flex items-start gap-4 shadow-sm relative overflow-hidden transition-all hover:bg-surface-container-low',
                    percent > 0 && percent < 100 ? 'border-primary' : 'border-outline-variant'
                  )}
                >
                  {percent > 0 && percent < 100 && <div className="absolute top-0 left-0 h-full w-1.5 bg-primary"></div>}
                  <div className="bg-surface-container size-12 rounded-lg flex items-center justify-center shrink-0">
                    {lesson.type === 'video' ? (
                      <PlayCircle className={cn('size-6', percent === 100 ? 'text-primary' : 'text-on-surface-variant')} />
                    ) : (
                      <FileText className="size-6 text-error" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-on-surface truncate">{index + 1}. {lesson.title}</h4>
                    <div className="flex items-center gap-2 mt-1 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" /> {lesson.type === 'video' ? `${Math.round(lesson.duration / 60)} phút` : `${lesson.documentPages ?? lesson.duration} trang`}
                      </span>
                      <span>•</span>
                      <span className={cn(percent === 100 ? 'text-primary' : 'text-secondary')}>
                        {percent === 100 ? 'Đã hoàn thành' : `${percent}% Hoàn thành`}
                      </span>
                    </div>
                    <div className="w-full bg-surface-variant rounded-full h-1 mt-3">
                      <div className={cn('h-full rounded-full', percent === 100 ? 'bg-primary' : 'bg-secondary')} style={{ width: `${percent}%` }}></div>
                    </div>
                  </div>
                  <MoreVertical className="size-5 text-on-surface-variant" />
                </Link>
              );
            })}
          </div>
        </div>

        {quiz && (
          <div className="px-4 pb-12 md:px-8">
            <div className="bg-inverse-surface text-inverse-on-surface rounded-xl p-6 flex flex-col gap-4 relative overflow-hidden shadow-md">
              <div className="absolute -right-8 -top-8 text-primary/10 rotate-12">
                <ClipboardList className="size-48" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <ClipboardList className="size-6 text-primary-fixed-dim" />
                  <h4 className="text-xl font-bold">Bài kiểm tra cuối khóa</h4>
                </div>
                <p className="text-sm opacity-90 mb-6 max-w-sm">
                  Pass khi đạt tối thiểu 70%. {latestResult ? `Kết quả gần nhất: ${latestResult.score}% - ${latestResult.passed ? 'PASS' : 'FAIL'}.` : 'Bạn chưa nộp bài.'}
                </p>
                <Link to={`/training/${course.id}/quiz`} className="bg-primary hover:bg-primary-container text-white px-8 py-3 rounded-lg text-sm font-bold transition-all w-fit block">
                  Bắt đầu ngay
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>

      <div className="fixed bottom-0 left-1/2 z-40 w-full max-w-4xl -translate-x-1/2 border-t border-outline-variant bg-surface/85 p-4 pb-safe shadow-xl backdrop-blur-md md:hidden md:rounded-t-2xl">
        <button
          onClick={handleOpenAssign}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-[13px] font-black uppercase tracking-[0.12em] text-on-primary shadow-md shadow-primary/25 transition active:scale-[0.98] hover:bg-primary-container"
        >
          <UserPlus className="size-5" strokeWidth={2.5} />
          Gán cho nhân viên
        </button>
      </div>

      {isAssignOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 px-3 py-6 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="w-full max-w-2xl overflow-hidden rounded-2xl border border-outline-variant bg-surface shadow-2xl max-h-[90vh] flex flex-col"
          >
            <div className="flex items-start justify-between gap-4 border-b border-outline-variant bg-surface-container-low p-5 shrink-0">
              <div>
                <p className="eyebrow">Gán khóa học</p>
                <h2 className="mt-1 text-2xl font-black text-on-surface">Chọn nhân viên</h2>
                <p className="mt-2 text-sm font-semibold text-on-surface-variant">
                  Chọn nhân viên để gán khóa học "{course?.name}"
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAssignOpen(false)}
                className="flex size-9 shrink-0 items-center justify-center rounded-full border border-outline-variant bg-surface text-on-surface-variant transition hover:bg-surface-container-high hover:text-on-surface"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitAssign} className="flex flex-col flex-1 min-h-0">
              <div className="flex-1 overflow-y-auto p-5">
                {availableEmployees.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Users className="size-16 text-on-surface-variant/30 mb-4" />
                    <p className="text-sm font-bold text-on-surface-variant">
                      Tất cả nhân viên đã được gán khóa học này
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {availableEmployees.map((employee) => {
                      const isSelected = selectedEmployees.includes(employee.id);
                      return (
                        <label
                          key={employee.id}
                          className={cn(
                            'flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all',
                            isSelected
                              ? 'border-primary bg-primary/5'
                              : 'border-outline-variant bg-surface-container-lowest hover:bg-surface-container-low'
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleEmployee(employee.id)}
                            className="size-5 accent-primary cursor-pointer"
                          />
                          <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary-container font-black text-on-primary-container">
                            {employee.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-black text-on-surface truncate">
                              {employee.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                                {employee.role}
                              </span>
                              <span className="text-on-surface-variant">•</span>
                              <span className={cn(
                                'text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full',
                                employee.department === 'Sale' ? 'bg-blue-100 text-blue-700' :
                                employee.department === 'Kỹ thuật' ? 'bg-teal-100 text-teal-700' :
                                'bg-green-100 text-green-700'
                              )}>
                                {employee.department}
                              </span>
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex flex-col-reverse gap-2 border-t border-outline-variant p-5 shrink-0 sm:flex-row sm:justify-between sm:items-center">
                <p className="text-xs font-bold text-on-surface-variant">
                  {selectedEmployees.length > 0 ? (
                    <span className="text-primary">
                      Đã chọn {selectedEmployees.length} nhân viên
                    </span>
                  ) : (
                    'Chưa chọn nhân viên nào'
                  )}
                </p>
                <div className="flex flex-col-reverse gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => setIsAssignOpen(false)}
                    className="inline-flex h-11 items-center justify-center rounded-xl border border-outline-variant bg-surface px-5 text-xs font-black uppercase tracking-widest text-on-surface-variant transition hover:bg-surface-container-high hover:text-on-surface"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={selectedEmployees.length === 0}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-xs font-black uppercase tracking-widest text-on-primary shadow-lg shadow-primary/20 transition hover:bg-primary-container active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <UserPlus className="size-4" />
                    Gán khóa học ({selectedEmployees.length})
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

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
} from 'lucide-react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useCrm } from '../lib/crmStore';

export default function CourseDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { courses, lessons, progress, quizzes, results, currentUser, assignCourse } = useCrm();
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

  function handleAssign() {
    const target = window.prompt('Nhập tên nhân viên cần gán khóa học');
    if (target) assignCourse(course.id, target);
  }

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <header className="sticky top-0 z-50 bg-surface border-b border-outline-variant shadow-sm h-14 flex items-center justify-between px-4 w-full md:hidden">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-on-surface-variant hover:bg-surface-container-high rounded-full">
          <ArrowLeft className="size-6" />
        </button>
        <h1 className="text-lg font-bold text-primary truncate px-4">{course.name}</h1>
        <button className="p-2 -mr-2 text-on-surface-variant hover:bg-surface-container-high rounded-full">
          <MoreVertical className="size-6" />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto pb-24 max-w-4xl mx-auto w-full">
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

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 bg-surface/80 backdrop-blur-md border-t border-outline-variant p-4 shadow-xl w-full max-w-4xl z-40 pb-safe md:rounded-t-2xl">
        <button onClick={handleAssign} className="w-full bg-primary text-on-primary h-12 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-primary-container hover:scale-[0.99] transition-all shadow-lg active:scale-95">
          <UserPlus className="size-5" />
          Gán cho nhân viên
        </button>
      </div>
    </div>
  );
}

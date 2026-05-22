import {
  ArrowLeft,
  MoreVertical,
  Play,
  PlayCircle,
  FileText,
  FileQuestion,
  Clock,
  CheckCircle,
  ClipboardList,
  History,
  Pencil,
  Plus,
  Save,
  Trash2,
  UploadCloud,
  UserPlus,
  Video,
  X,
  Users,
} from 'lucide-react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useCrm, type LessonType } from '../lib/crmStore';
import { FormEvent, useState } from 'react';
import { motion } from 'motion/react';
import { isGoogleDrivePickerConfigured, uploadGoogleDriveFiles } from '../lib/googleDrivePicker';

type QuizQuestionDraft = {
  question: string;
  options: string[];
  correctAnswer: number;
};

function createEmptyQuizQuestionDraft(): QuizQuestionDraft {
  return {
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
  };
}

export default function CourseDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const {
    courses,
    lessons,
    progress,
    quizzes,
    questions,
    results,
    currentUser,
    assignCourse,
    employees,
    enrollments,
    addCourseLesson,
    updateCourseLesson,
    deleteCourseLesson,
    addQuizQuestion,
    updateQuizQuestion,
    deleteQuizQuestion,
  } = useCrm();
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [contentModal, setContentModal] = useState<'lesson' | 'quiz' | null>(null);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [selectedDocumentFile, setSelectedDocumentFile] = useState<File | null>(null);
  const [isUploadingLessonFile, setIsUploadingLessonFile] = useState(false);
  const [lessonDraft, setLessonDraft] = useState({
    type: 'video' as LessonType,
    title: '',
    url: '',
    duration: '600',
    documentPages: '3',
    summary: '',
    body: '',
  });
  const [quizDrafts, setQuizDrafts] = useState<QuizQuestionDraft[]>(() => [createEmptyQuizQuestionDraft()]);
  const [contentError, setContentError] = useState('');
  const course = courses.find((item) => item.id === id);
  const courseLessons = lessons.filter((lesson) => lesson.courseId === id);
  const quiz = quizzes.find((item) => item.courseId === id);
  const quizQuestions = quiz ? questions.filter((item) => item.quizId === quiz.id) : [];
  const latestResult = quiz ? results.filter((item) => item.quizId === quiz.id && item.userId === currentUser.id).at(-1) : undefined;
  const resultHistory = quiz
    ? results
        .filter((item) => item.quizId === quiz.id)
        .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    : [];

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

  function openLessonModal(type: LessonType, lessonId?: string) {
    const lesson = lessonId ? lessons.find((item) => item.id === lessonId) : undefined;
    setLessonDraft({
      type: lesson?.type ?? type,
      title: lesson?.title ?? '',
      url: lesson?.type === 'video' ? lesson.videoUrl ?? lesson.contentUrl : lesson?.contentUrl ?? '',
      duration: String(lesson?.duration ?? (type === 'video' ? 600 : 5)),
      documentPages: String(lesson?.documentPages ?? 3),
      summary: lesson?.summary ?? '',
      body: lesson?.body ?? '',
    });
    setEditingLessonId(lesson?.id ?? null);
    setSelectedDocumentFile(null);
    setContentError('');
    setContentModal('lesson');
  }

  async function handleSubmitLesson(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!course) return;
    let title = lessonDraft.title.trim();
    let contentUrl = lessonDraft.url.trim();

    if (lessonDraft.type === 'document' && selectedDocumentFile) {
      if (!isGoogleDrivePickerConfigured()) {
        setContentError('Chưa cấu hình Google API nên chưa upload được file lên Drive.');
        return;
      }

      setIsUploadingLessonFile(true);
      setContentError('');
      try {
        const [uploadedFile] = await uploadGoogleDriveFiles([selectedDocumentFile]);
        contentUrl = uploadedFile.url;
        if (!title) title = uploadedFile.name;
      } catch (error) {
        setContentError(error instanceof Error ? error.message : 'Upload file lên Google Drive thất bại.');
        setIsUploadingLessonFile(false);
        return;
      }
      setIsUploadingLessonFile(false);
    }

    if (!title) {
      setContentError('Vui lòng nhập tên bài học.');
      return;
    }
    if (lessonDraft.type === 'video' && !lessonDraft.url.trim()) {
      setContentError('Vui lòng nhập link video YouTube hoặc file video.');
      return;
    }

    const duration = Number.parseInt(lessonDraft.duration, 10);
    const pages = Number.parseInt(lessonDraft.documentPages, 10);
    const lessonPayload = {
      courseId: course.id,
      title,
      type: lessonDraft.type,
      contentUrl: contentUrl || title.toLowerCase().replace(/\s+/g, '-'),
      videoUrl: lessonDraft.type === 'video' ? lessonDraft.url.trim() : undefined,
      duration: Number.isFinite(duration) && duration > 0 ? duration : lessonDraft.type === 'video' ? 600 : 5,
      documentPages: lessonDraft.type === 'document' ? (Number.isFinite(pages) && pages > 0 ? pages : 1) : undefined,
      summary: lessonDraft.summary.trim(),
      body: lessonDraft.type === 'document' ? lessonDraft.body.trim() : undefined,
    };

    if (editingLessonId) {
      const { courseId: _courseId, ...lessonPatch } = lessonPayload;
      updateCourseLesson(editingLessonId, lessonPatch);
    } else {
      addCourseLesson(lessonPayload);
    }
    setSelectedDocumentFile(null);
    setEditingLessonId(null);
    setContentModal(null);
  }

  function handleSubmitQuizQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!course) return;

    const normalizedDrafts = quizDrafts.map((draft, index) => ({
      index,
      question: draft.question.trim(),
      options: draft.options.map((option) => option.trim()).filter(Boolean),
      correctAnswer: draft.correctAnswer,
    }));
    const filledDrafts = normalizedDrafts.filter((draft) => draft.question || draft.options.length > 0);
    if (filledDrafts.length === 0) {
      setContentError('Vui lòng nhập ít nhất 1 câu hỏi test.');
      return;
    }
    const invalidDraft = filledDrafts.find((draft) => !draft.question || draft.options.length < 2);
    if (invalidDraft) {
      setContentError(`Câu ${invalidDraft.index + 1} cần có nội dung và tối thiểu 2 đáp án.`);
      return;
    }

    if (editingQuestionId) {
      const draft = filledDrafts[0];
      updateQuizQuestion(editingQuestionId, {
        question: draft.question,
        options: draft.options,
        correctAnswer: Math.min(draft.correctAnswer, draft.options.length - 1),
      });
      setEditingQuestionId(null);
      setQuizDrafts([createEmptyQuizQuestionDraft()]);
      setContentError('');
      setContentModal(null);
      return;
    }

    filledDrafts.forEach((draft) => {
      addQuizQuestion({
        courseId: course.id,
        question: draft.question,
        options: draft.options,
        correctAnswer: Math.min(draft.correctAnswer, draft.options.length - 1),
      });
    });
    setQuizDrafts([createEmptyQuizQuestionDraft()]);
    setContentError('');
    setContentModal(null);
  }

  function openQuizModal(questionId?: string) {
    const question = questionId ? questions.find((item) => item.id === questionId) : undefined;
    setEditingQuestionId(question?.id ?? null);
    setQuizDrafts(
      question
        ? [
            {
              question: question.question,
              options: [...question.options, '', '', '', ''].slice(0, 4),
              correctAnswer: question.correctAnswer,
            },
          ]
        : [createEmptyQuizQuestionDraft()]
    );
    setContentError('');
    setContentModal('quiz');
  }

  function updateQuizDraft(index: number, patch: Partial<QuizQuestionDraft>) {
    setQuizDrafts((current) =>
      current.map((draft, draftIndex) => (draftIndex === index ? { ...draft, ...patch } : draft))
    );
    setContentError('');
  }

  function updateQuizOption(questionIndex: number, optionIndex: number, value: string) {
    setQuizDrafts((current) =>
      current.map((draft, draftIndex) =>
        draftIndex === questionIndex
          ? {
              ...draft,
              options: draft.options.map((option, currentOptionIndex) =>
                currentOptionIndex === optionIndex ? value : option
              ),
            }
          : draft
      )
    );
    setContentError('');
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
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h3 className="text-xl font-bold text-on-surface">Nội dung khóa học</h3>
              <span className="text-[10px] font-bold uppercase tracking-widest text-outline">
                {courseLessons.length} bài học • {quizQuestions.length} câu test
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => openLessonModal('video')}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-outline-variant bg-surface px-3 text-[10px] font-black uppercase tracking-[0.10em] text-on-surface-variant transition hover:border-primary/30 hover:text-primary active:scale-95"
              >
                <Video className="size-3.5" strokeWidth={2.4} />
                Thêm video
              </button>
              <button
                type="button"
                onClick={() => openLessonModal('document')}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-outline-variant bg-surface px-3 text-[10px] font-black uppercase tracking-[0.10em] text-on-surface-variant transition hover:border-primary/30 hover:text-primary active:scale-95"
              >
                <FileText className="size-3.5" strokeWidth={2.4} />
                Thêm file
              </button>
              <button
                type="button"
                onClick={() => openQuizModal()}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-primary px-3 text-[10px] font-black uppercase tracking-[0.10em] text-on-primary shadow-sm shadow-primary/20 transition hover:bg-primary-container active:scale-95"
              >
                <FileQuestion className="size-3.5" strokeWidth={2.4} />
                Thêm bài test
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {courseLessons.map((lesson, index) => {
              const lessonProgress = progress.find((item) => item.userId === currentUser.id && item.lessonId === lesson.id);
              const percent = lessonProgress?.percent ?? 0;
              return (
                <article
                  key={lesson.id}
                  className={cn(
                    'bg-surface-container-lowest border rounded-xl p-4 shadow-sm relative overflow-hidden transition-all hover:bg-surface-container-low',
                    percent > 0 && percent < 100 ? 'border-primary' : 'border-outline-variant'
                  )}
                >
                  {percent > 0 && percent < 100 && <div className="absolute top-0 left-0 h-full w-1.5 bg-primary"></div>}
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                    <Link to={`/training/${course.id}/lesson/${lesson.id}`} className="flex min-w-0 flex-1 items-start gap-4">
                      <div className="bg-surface-container size-12 rounded-lg flex items-center justify-center shrink-0">
                        {lesson.type === 'video' ? (
                          <PlayCircle className={cn('size-6', percent === 100 ? 'text-primary' : 'text-on-surface-variant')} />
                        ) : (
                          <FileText className="size-6 text-error" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-on-surface truncate">{index + 1}. {lesson.title}</h4>
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
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
                    </Link>
                    <div className="grid grid-cols-2 gap-2 sm:w-36">
                      <button
                        type="button"
                        onClick={() => openLessonModal(lesson.type, lesson.id)}
                        className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-outline-variant bg-surface px-2 text-[10px] font-black uppercase tracking-[0.10em] text-on-surface-variant transition hover:border-primary/30 hover:text-primary active:scale-95"
                      >
                        <Pencil className="size-3.5" strokeWidth={2.4} />
                        Sửa
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteCourseLesson(lesson.id)}
                        className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-error/25 bg-error-container px-2 text-[10px] font-black uppercase tracking-[0.10em] text-on-error-container transition hover:opacity-85 active:scale-95"
                      >
                        <Trash2 className="size-3.5" strokeWidth={2.4} />
                        Xóa
                      </button>
                    </div>
                  </div>
                </article>
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
                  {' '}Hiện có {quizQuestions.length} câu hỏi.
                </p>
                <Link to={`/training/${course.id}/quiz`} className="bg-primary hover:bg-primary-container text-white px-8 py-3 rounded-lg text-sm font-bold transition-all w-fit block">
                  Bắt đầu ngay
                </Link>
              </div>
            </div>

            <section className="mt-4 overflow-hidden rounded-xl border border-outline-variant bg-surface shadow-sm">
              <header className="flex items-center justify-between gap-3 border-b border-outline-variant bg-surface-container-low/45 px-4 py-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-on-surface-variant">Lịch sử bài test</p>
                  <h4 className="text-[14px] font-black text-on-surface">Kết quả đã lưu theo nhân viên</h4>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full border border-outline-variant bg-surface px-2 py-1 text-[10px] font-black uppercase tracking-[0.10em] text-on-surface-variant">
                  <History className="size-3.5" strokeWidth={2.4} />
                  {resultHistory.length}
                </span>
              </header>
              {resultHistory.length > 0 ? (
                <div className="divide-y divide-outline-variant/60">
                  {resultHistory.slice(0, 8).map((item) => {
                    const employee = employees.find((candidate) => candidate.id === item.userId);
                    return (
                      <div key={item.id} className="grid gap-2 px-4 py-3 sm:grid-cols-[1fr_auto_auto] sm:items-center">
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-black text-on-surface">{employee?.name ?? item.userId}</p>
                          <p className="mt-0.5 text-[11px] font-semibold text-on-surface-variant">
                            {new Date(item.submittedAt).toLocaleString('vi-VN')}
                          </p>
                        </div>
                        <span className={cn('w-fit rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.10em]', item.passed ? 'border-primary/25 bg-primary-fixed text-primary' : 'border-error/25 bg-error-container text-on-error-container')}>
                          {item.passed ? 'PASS' : 'FAIL'}
                        </span>
                        <span className="font-mono text-[18px] font-black tabular-nums text-on-surface">{item.score}%</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="px-4 py-5 text-[12px] font-semibold text-on-surface-variant">
                  Chưa có lượt nộp bài nào. Khi nhân viên làm test, kết quả sẽ lưu tại đây và vẫn còn sau khi F5.
                </p>
              )}
            </section>

            <section className="mt-4 overflow-hidden rounded-xl border border-outline-variant bg-surface shadow-sm">
              <header className="flex items-center justify-between gap-3 border-b border-outline-variant bg-surface-container-low/45 px-4 py-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-on-surface-variant">Bài test cuối khóa</p>
                  <h4 className="text-[14px] font-black text-on-surface">Quản lý câu hỏi</h4>
                </div>
                <button
                  type="button"
                  onClick={() => openQuizModal()}
                  className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-primary px-3 text-[10px] font-black uppercase tracking-[0.10em] text-on-primary shadow-sm shadow-primary/20 transition hover:bg-primary-container active:scale-95"
                >
                  <Plus className="size-3.5" strokeWidth={2.5} />
                  Thêm câu
                </button>
              </header>
              {quizQuestions.length > 0 ? (
                <div className="divide-y divide-outline-variant/60">
                  {quizQuestions.map((item, index) => (
                    <article key={item.id} className="grid gap-3 px-4 py-3 lg:grid-cols-[1fr_auto] lg:items-start">
                      <div className="min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-on-surface-variant">Câu {index + 1}</p>
                        <h5 className="mt-1 text-[13px] font-black leading-6 text-on-surface">{item.question}</h5>
                        <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
                          {item.options.map((option, optionIndex) => (
                            <span
                              key={`${item.id}-${optionIndex}`}
                              className={cn(
                                'rounded-xl border px-3 py-2 text-[11px] font-bold leading-5',
                                optionIndex === item.correctAnswer
                                  ? 'border-primary/25 bg-primary-fixed text-primary'
                                  : 'border-outline-variant bg-surface-container-low text-on-surface-variant'
                              )}
                            >
                              {optionIndex + 1}. {option}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 lg:w-32">
                        <button
                          type="button"
                          onClick={() => openQuizModal(item.id)}
                          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-outline-variant bg-surface px-2 text-[10px] font-black uppercase tracking-[0.10em] text-on-surface-variant transition hover:border-primary/30 hover:text-primary active:scale-95"
                        >
                          <Pencil className="size-3.5" strokeWidth={2.4} />
                          Sửa
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteQuizQuestion(item.id)}
                          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-error/25 bg-error-container px-2 text-[10px] font-black uppercase tracking-[0.10em] text-on-error-container transition hover:opacity-85 active:scale-95"
                        >
                          <Trash2 className="size-3.5" strokeWidth={2.4} />
                          Xóa
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="px-4 py-5 text-[12px] font-semibold text-on-surface-variant">
                  Chưa có câu hỏi test. Bấm Thêm câu để tạo câu hỏi đầu tiên cho khóa học này.
                </p>
              )}
            </section>
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

      {contentModal === 'lesson' && (
        <div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-black/45 px-3 py-6 backdrop-blur-sm md:items-center"
          onClick={() => {
            setContentModal(null);
            setEditingLessonId(null);
            setSelectedDocumentFile(null);
          }}
        >
          <motion.form
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            onSubmit={handleSubmitLesson}
            onClick={(event) => event.stopPropagation()}
            className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-outline-variant bg-surface shadow-2xl"
          >
            <header className="flex items-center gap-3 border-b border-outline-variant bg-surface-container-low px-5 py-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-on-primary">
                {lessonDraft.type === 'video' ? <Video className="size-5" /> : <FileText className="size-5" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="eyebrow">Nội dung khóa học</p>
                <h2 className="truncate text-xl font-black text-on-surface">
                  {editingLessonId
                    ? lessonDraft.type === 'video' ? 'Sửa video' : 'Sửa file học tập'
                    : lessonDraft.type === 'video' ? 'Thêm video' : 'Thêm file học tập'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setContentModal(null);
                  setEditingLessonId(null);
                  setSelectedDocumentFile(null);
                }}
                className="flex size-9 items-center justify-center rounded-full border border-outline-variant bg-surface text-on-surface-variant transition hover:bg-surface-container-high"
              >
                <X className="size-4" />
              </button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto p-5">
              <div className="grid gap-3 md:grid-cols-2">
                <label className="block">
                  <span className="eyebrow">Loại nội dung</span>
                  <select
                    value={lessonDraft.type}
                    onChange={(event) => setLessonDraft((draft) => ({ ...draft, type: event.target.value as LessonType }))}
                    className="mt-1.5 h-12 w-full rounded-2xl border border-outline-variant bg-surface px-4 text-[13px] font-bold outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                  >
                    <option value="video">Video</option>
                    <option value="document">File/Tài liệu</option>
                  </select>
                </label>
                <label className="block">
                  <span className="eyebrow">Tên bài học</span>
                  <input
                    value={lessonDraft.title}
                    onChange={(event) => setLessonDraft((draft) => ({ ...draft, title: event.target.value }))}
                    className="mt-1.5 h-12 w-full rounded-2xl border border-outline-variant bg-surface px-4 text-[13px] font-bold outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                    placeholder="VD: Quy trình tư vấn khách hàng"
                  />
                </label>
                {lessonDraft.type === 'document' && (
                  <label className="block md:col-span-2">
                    <span className="eyebrow">Chọn file từ máy</span>
                    <div className="mt-1.5 rounded-2xl border border-dashed border-outline-variant bg-surface-container-low/35 p-3">
                      <input
                        type="file"
                        onChange={(event) => setSelectedDocumentFile(event.target.files?.[0] ?? null)}
                        className="block w-full text-[12px] font-bold text-on-surface-variant file:mr-3 file:h-10 file:rounded-xl file:border-0 file:bg-primary file:px-3 file:text-[10px] file:font-black file:uppercase file:tracking-[0.10em] file:text-on-primary"
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,image/*,audio/*,video/*"
                      />
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-bold text-on-surface-variant">
                        <UploadCloud className="size-4 text-primary" strokeWidth={2.4} />
                        {selectedDocumentFile ? (
                          <span className="rounded-full bg-primary-fixed px-2.5 py-1 text-primary">
                            Sẽ upload: {selectedDocumentFile.name}
                          </span>
                        ) : (
                          <span>File sẽ được upload lên Google Drive khi bấm lưu.</span>
                        )}
                      </div>
                    </div>
                  </label>
                )}
                <label className="block md:col-span-2">
                  <span className="eyebrow">{lessonDraft.type === 'video' ? 'Link video YouTube/file video' : 'Link file học tập có sẵn'}</span>
                  <input
                    value={lessonDraft.url}
                    onChange={(event) => setLessonDraft((draft) => ({ ...draft, url: event.target.value }))}
                    className="mt-1.5 h-12 w-full rounded-2xl border border-outline-variant bg-surface px-4 text-[13px] font-bold outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                    placeholder={lessonDraft.type === 'video' ? 'https://youtube.com/watch?v=...' : 'https://drive.google.com/...'}
                  />
                </label>
                <label className="block">
                  <span className="eyebrow">{lessonDraft.type === 'video' ? 'Thời lượng giây' : 'Thời gian đọc phút'}</span>
                  <input
                    type="number"
                    min={1}
                    value={lessonDraft.duration}
                    onChange={(event) => setLessonDraft((draft) => ({ ...draft, duration: event.target.value }))}
                    className="mt-1.5 h-12 w-full rounded-2xl border border-outline-variant bg-surface px-4 text-[13px] font-bold outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                  />
                </label>
                {lessonDraft.type === 'document' && (
                  <label className="block">
                    <span className="eyebrow">Số trang</span>
                    <input
                      type="number"
                      min={1}
                      value={lessonDraft.documentPages}
                      onChange={(event) => setLessonDraft((draft) => ({ ...draft, documentPages: event.target.value }))}
                      className="mt-1.5 h-12 w-full rounded-2xl border border-outline-variant bg-surface px-4 text-[13px] font-bold outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                    />
                  </label>
                )}
                <label className="block md:col-span-2">
                  <span className="eyebrow">Mô tả ngắn</span>
                  <textarea
                    rows={3}
                    value={lessonDraft.summary}
                    onChange={(event) => setLessonDraft((draft) => ({ ...draft, summary: event.target.value }))}
                    className="mt-1.5 w-full resize-y rounded-2xl border border-outline-variant bg-surface px-4 py-3 text-[13px] font-medium leading-6 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                    placeholder="Nội dung chính của bài học."
                  />
                </label>
                {lessonDraft.type === 'document' && (
                  <label className="block md:col-span-2">
                    <span className="eyebrow">Nội dung tài liệu</span>
                    <textarea
                      rows={7}
                      value={lessonDraft.body}
                      onChange={(event) => setLessonDraft((draft) => ({ ...draft, body: event.target.value }))}
                      className="mt-1.5 w-full resize-y rounded-2xl border border-outline-variant bg-surface px-4 py-3 text-[13px] font-medium leading-6 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                      placeholder="Có thể nhập dạng gạch đầu dòng hoặc tiêu đề Markdown cơ bản."
                    />
                  </label>
                )}
              </div>
              {contentError && <p className="mt-3 rounded-xl border border-error/25 bg-error-container px-3 py-2 text-[12px] font-bold text-on-error-container">{contentError}</p>}
            </div>

            <footer className="grid grid-cols-2 gap-2 border-t border-outline-variant bg-surface-container-low/40 p-3">
              <button
                type="button"
                onClick={() => {
                  setContentModal(null);
                  setEditingLessonId(null);
                  setSelectedDocumentFile(null);
                }}
                className="h-12 rounded-2xl border border-outline-variant bg-surface text-[11px] font-black uppercase tracking-[0.10em] text-on-surface-variant transition hover:bg-surface-container-high"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isUploadingLessonFile}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-primary text-[11px] font-black uppercase tracking-[0.10em] text-on-primary shadow-md shadow-primary/25 transition hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isUploadingLessonFile ? <UploadCloud className="size-4 animate-pulse" /> : <Save className="size-4" />}
                {isUploadingLessonFile ? 'Đang upload' : editingLessonId ? 'Cập nhật' : 'Lưu nội dung'}
              </button>
            </footer>
          </motion.form>
        </div>
      )}

      {contentModal === 'quiz' && (
        <div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-black/45 px-3 py-6 backdrop-blur-sm md:items-center"
          onClick={() => {
            setContentModal(null);
            setEditingQuestionId(null);
          }}
        >
          <motion.form
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            onSubmit={handleSubmitQuizQuestion}
            onClick={(event) => event.stopPropagation()}
            className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-outline-variant bg-surface shadow-2xl"
          >
            <header className="flex items-center gap-3 border-b border-outline-variant bg-surface-container-low px-5 py-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-on-primary">
                <FileQuestion className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="eyebrow">Bài test cuối khóa</p>
                <h2 className="truncate text-xl font-black text-on-surface">
                  {editingQuestionId ? 'Sửa câu hỏi test' : 'Thêm câu hỏi test'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setContentModal(null);
                  setEditingQuestionId(null);
                }}
                className="flex size-9 items-center justify-center rounded-full border border-outline-variant bg-surface text-on-surface-variant transition hover:bg-surface-container-high"
              >
                <X className="size-4" />
              </button>
            </header>
            <div className="min-h-0 flex-1 overflow-y-auto p-5">
              <div className="mb-4 flex flex-col gap-2 rounded-2xl border border-primary/15 bg-primary-fixed/35 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[12px] font-semibold leading-5 text-primary">
                  {editingQuestionId
                    ? 'Chỉnh nội dung, đáp án và đáp án đúng của câu hỏi hiện tại.'
                    : 'Mỗi thẻ là một câu hỏi riêng. Có thể thêm nhiều câu rồi lưu một lượt.'}
                </p>
                {!editingQuestionId && (
                  <button
                    type="button"
                    onClick={() => setQuizDrafts((current) => [...current, createEmptyQuizQuestionDraft()])}
                    className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-primary px-3 text-[10px] font-black uppercase tracking-[0.10em] text-on-primary shadow-sm shadow-primary/20 transition hover:bg-primary-container active:scale-95"
                  >
                    <Plus className="size-3.5" strokeWidth={2.5} />
                    Thêm câu
                  </button>
                )}
              </div>

              <div className="grid gap-3 xl:grid-cols-2">
                {quizDrafts.map((draft, questionIndex) => (
                  <section
                    key={questionIndex}
                    className="overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-low/35 shadow-sm"
                  >
                    <header className="flex items-center justify-between gap-2 border-b border-outline-variant bg-surface px-3 py-2.5">
                      <div>
                        <p className="eyebrow">Câu hỏi {questionIndex + 1}</p>
                        <h3 className="text-[13px] font-black text-on-surface">Nội dung và đáp án</h3>
                      </div>
                      {!editingQuestionId && quizDrafts.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setQuizDrafts((current) => current.filter((_, index) => index !== questionIndex))}
                          className="inline-flex size-9 items-center justify-center rounded-xl border border-error/25 bg-error-container text-on-error-container transition hover:opacity-85 active:scale-95"
                          aria-label={`Xóa câu hỏi ${questionIndex + 1}`}
                        >
                          <Trash2 className="size-4" strokeWidth={2.4} />
                        </button>
                      )}
                    </header>

                    <div className="space-y-3 p-3">
                      <label className="block">
                        <span className="eyebrow">Nội dung câu hỏi</span>
                        <textarea
                          rows={3}
                          value={draft.question}
                          onChange={(event) => updateQuizDraft(questionIndex, { question: event.target.value })}
                          className="mt-1.5 w-full resize-y rounded-2xl border border-outline-variant bg-surface px-4 py-3 text-[13px] font-bold leading-6 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                          placeholder="Nhập câu hỏi kiểm tra..."
                        />
                      </label>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="eyebrow">Đáp án</span>
                          <span className="text-[10px] font-bold text-on-surface-variant">Chọn vòng tròn là đáp án đúng</span>
                        </div>
                        {draft.options.map((option, optionIndex) => (
                          <label
                            key={optionIndex}
                            className="grid grid-cols-[auto_1fr] items-center gap-2 rounded-2xl border border-outline-variant bg-surface p-2"
                          >
                            <input
                              type="radio"
                              checked={draft.correctAnswer === optionIndex}
                              onChange={() => updateQuizDraft(questionIndex, { correctAnswer: optionIndex })}
                              className="size-5 accent-primary"
                            />
                            <input
                              value={option}
                              onChange={(event) => updateQuizOption(questionIndex, optionIndex, event.target.value)}
                              className="h-11 rounded-xl border border-outline-variant bg-surface px-3 text-[13px] font-semibold outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                              placeholder={`Đáp án ${optionIndex + 1}${optionIndex === draft.correctAnswer ? ' (đúng)' : ''}`}
                            />
                          </label>
                        ))}
                      </div>
                    </div>
                  </section>
                ))}
              </div>
              {contentError && <p className="mt-3 rounded-xl border border-error/25 bg-error-container px-3 py-2 text-[12px] font-bold text-on-error-container">{contentError}</p>}
            </div>
            <footer className="grid grid-cols-2 gap-2 border-t border-outline-variant bg-surface-container-low/40 p-3">
              <button
                type="button"
                onClick={() => {
                  setContentModal(null);
                  setEditingQuestionId(null);
                }}
                className="h-12 rounded-2xl border border-outline-variant bg-surface text-[11px] font-black uppercase tracking-[0.10em] text-on-surface-variant transition hover:bg-surface-container-high"
              >
                Hủy
              </button>
              <button type="submit" className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-primary text-[11px] font-black uppercase tracking-[0.10em] text-on-primary shadow-md shadow-primary/25 transition hover:bg-primary-container">
                <Plus className="size-4" />
                {editingQuestionId ? 'Cập nhật câu test' : `Lưu ${quizDrafts.length} câu test`}
              </button>
            </footer>
          </motion.form>
        </div>
      )}

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

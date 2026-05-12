import {
  X,
  BadgeCheck,
  RotateCcw,
  ClipboardCheck,
  ArrowLeft,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import { Result, useCrm } from '../lib/crmStore';

export default function QuizScreen() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { courses, quizzes, questions, submitQuiz } = useCrm();
  const course = courses.find((item) => item.id === id);
  const quiz = quizzes.find((item) => item.courseId === id);
  const quizQuestions = useMemo(() => questions.filter((item) => item.quizId === quiz?.id), [questions, quiz?.id]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<Result | null>(null);

  const currentQuestion = quizQuestions[currentIndex];

  function finishQuiz() {
    if (!quiz) return;
    setResult(submitQuiz(quiz.id, answers));
  }

  if (!course || !quiz || !currentQuestion) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="bg-surface p-6 rounded-2xl border border-outline-variant max-w-md text-center">
          <AlertCircle className="size-10 text-error mx-auto mb-3" />
          <p className="text-sm font-bold text-on-surface">Khóa học này chưa có quiz.</p>
          <button onClick={() => navigate(-1)} className="mt-4 text-primary font-bold">Quay lại</button>
        </div>
      </div>
    );
  }

  if (result) {
    const correct = quizQuestions.filter((item) => answers[item.id] === item.correctAnswer).length;
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-xl p-8 flex flex-col items-center text-center overflow-hidden border border-outline-variant/30"
        >
          <div className="w-24 h-24 rounded-full bg-surface-container-low border-4 border-surface-container-highest flex items-center justify-center mb-6 z-10">
            <BadgeCheck className={cn('size-12', result.passed ? 'text-primary fill-primary/10' : 'text-error fill-error/10')} />
          </div>

          <div className={cn(
            'inline-flex items-center px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4 z-10 border',
            result.passed ? 'bg-[#E6F4EA] text-[#1E8E3E] border-[#CEEAD6]' : 'bg-error-container text-on-error-container border-error/20'
          )}>
            {result.passed ? 'VƯỢT QUA (PASS)' : 'CHƯA ĐẠT (FAIL)'}
          </div>

          <h1 className="text-5xl font-black text-on-surface mb-2 z-10">{result.score}%</h1>
          <p className="text-sm font-bold text-on-surface-variant mb-8 z-10 opacity-70">({correct}/{quizQuestions.length} câu đúng)</p>

          <div className="bg-surface-container rounded-xl p-4 mb-10 w-full z-10 border border-outline-variant/50">
            <p className="text-sm font-semibold text-on-surface">
              {result.passed ? 'Bạn đủ điều kiện hoàn thành bài kiểm tra.' : 'Cần đạt từ 70% để pass. Hãy xem lại bài học và làm lại.'}
            </p>
          </div>

          <div className="w-full flex flex-col gap-3 z-10">
            <button onClick={() => navigate(-1)} className="w-full py-4 bg-primary text-on-primary rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary-container transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 active:scale-95">
              <ArrowLeft className="size-4" />
              Quay lại khóa học
            </button>
            <button
              onClick={() => {
                setAnswers({});
                setCurrentIndex(0);
                setResult(null);
              }}
              className="w-full py-4 bg-surface-container-lowest border border-outline-variant text-on-surface-variant rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-surface-container-low transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <RotateCcw className="size-3.5" />
              Làm lại bài
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const selectedAnswer = answers[currentQuestion.id];
  const isLastQuestion = currentIndex === quizQuestions.length - 1;

  return (
    <div className="min-h-screen bg-surface flex flex-col md:bg-surface-container-low md:justify-center md:items-center">
      <div className="w-full max-w-md bg-surface min-h-screen md:min-h-[700px] md:h-auto md:rounded-2xl md:shadow-2xl flex flex-col relative overflow-hidden md:border md:border-outline-variant/30">
        <header className="flex justify-between items-center px-4 h-14 w-full bg-surface border-b border-outline-variant shrink-0 z-50">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-on-surface-variant hover:bg-surface-container-high rounded-full active:scale-90 transition-all">
            <X className="size-6" />
          </button>
          <h1 className="text-sm font-black text-primary uppercase tracking-widest flex-1 text-center truncate pr-8">
            Quiz {course.name}
          </h1>
        </header>

        <main className="flex-1 flex flex-col p-6 overflow-y-auto">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Tiến độ</span>
              <span className="text-[10px] font-black text-primary uppercase tracking-widest">Câu {currentIndex + 1}/{quizQuestions.length}</span>
            </div>
            <div className="w-full bg-surface-variant rounded-full h-1.5 overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${((currentIndex + 1) / quizQuestions.length) * 100}%` }} className="bg-primary h-full rounded-full" />
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant p-6 mb-6">
            <h2 className="text-lg font-bold text-on-surface mb-6 leading-tight">{currentQuestion.question}</h2>

            <div className="flex flex-col gap-3">
              {currentQuestion.options.map((option, index) => (
                <label
                  key={option}
                  className={cn(
                    'relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 group',
                    selectedAnswer === index ? 'border-primary bg-primary/5 shadow-[0_0_0_1px_var(--color-primary)]' : 'border-outline-variant hover:border-outline hover:bg-surface-container-low'
                  )}
                >
                  <div className="flex items-center h-5">
                    <input
                      type="radio"
                      name="quiz_answer"
                      value={index}
                      checked={selectedAnswer === index}
                      onChange={() => setAnswers((current) => ({ ...current, [currentQuestion.id]: index }))}
                      className="hidden"
                    />
                    <div className={cn('size-5 rounded-full border-2 flex items-center justify-center transition-all', selectedAnswer === index ? 'border-primary bg-primary' : 'border-outline group-hover:border-on-surface-variant')}>
                      {selectedAnswer === index && <div className="size-2 bg-on-primary rounded-full" />}
                    </div>
                  </div>
                  <span className={cn('ml-4 text-sm font-semibold transition-colors', selectedAnswer === index ? 'text-primary' : 'text-on-surface-variant')}>
                    {option}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="mt-auto pt-8 flex flex-col gap-3">
            <button
              disabled={selectedAnswer === undefined}
              onClick={() => isLastQuestion ? finishQuiz() : setCurrentIndex((item) => item + 1)}
              className="w-full bg-primary disabled:opacity-40 text-on-primary h-12 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary-container shadow-lg shadow-primary/20 transition-all flex items-center justify-center active:scale-95"
            >
              {isLastQuestion ? 'Nộp bài' : 'Câu tiếp theo'}
              <ChevronRight className="size-4 ml-1" />
            </button>
            <button onClick={finishQuiz} className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface-variant h-12 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-surface-container-low transition-all flex items-center justify-center gap-2 active:scale-95">
              <ClipboardCheck className="size-4" />
              Nộp nhanh
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

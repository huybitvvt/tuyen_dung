import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  ChevronRight,
  Play,
  Download,
  MessageSquare,
  FileText,
} from 'lucide-react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useCrm } from '../lib/crmStore';
import { useState, useEffect } from 'react';

function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;

  const value = url.trim();

  try {
    const parsed = new URL(value);
    const host = parsed.hostname.replace(/^www\./, '');
    const pathParts = parsed.pathname.split('/').filter(Boolean);
    let videoId: string | null = null;

    if (host === 'youtu.be') {
      videoId = pathParts[0] || null;
    } else if (host === 'youtube.com' || host === 'm.youtube.com') {
      if (parsed.pathname === '/watch') {
        videoId = parsed.searchParams.get('v');
      } else if (['embed', 'shorts', 'live'].includes(pathParts[0])) {
        videoId = pathParts[1] || null;
      }
    }

    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
    }
  } catch {
    if (/^[a-zA-Z0-9_-]{11}$/.test(value)) {
      return `https://www.youtube.com/embed/${value}?rel=0&modestbranding=1`;
    }
  }

  return null;
}

export default function LessonViewer() {
  const navigate = useNavigate();
  const { id, lessonId } = useParams();
  const { courses, lessons, progress, currentUser, updateLessonProgress } = useCrm();
  const course = courses.find((item) => item.id === id);
  const courseLessons = lessons.filter((lesson) => lesson.courseId === id);
  const lesson = courseLessons.find((item) => item.id === lessonId) ?? courseLessons[0];
  const index = courseLessons.findIndex((item) => item.id === lesson?.id);
  const lessonProgress = progress.find((item) => item.userId === currentUser.id && item.lessonId === lesson?.id);
  const percent = lessonProgress?.percent ?? 0;
  const nextLesson = courseLessons[index + 1];
  const previousLesson = courseLessons[index - 1];
  const [isPlaying, setIsPlaying] = useState(false);
  const videoSource = lesson?.type === 'video' ? lesson.videoUrl || lesson.contentUrl : '';
  const embedUrl = videoSource ? getYouTubeEmbedUrl(videoSource) : null;

  if (!course || !lesson) {
    return (
      <div className="p-8">
        <button onClick={() => navigate(-1)} className="text-primary font-bold">Quay lại</button>
        <p className="mt-4">Không tìm thấy bài học.</p>
      </div>
    );
  }

  function simulateWatch() {
    const nextPercent = Math.min(100, percent + 25);
    updateLessonProgress(lesson.id, nextPercent, Math.round((lesson.duration * nextPercent) / 100));
  }

  function handlePlayVideo() {
    setIsPlaying(true);
    // Auto update progress when video starts
    if (percent < 25) {
      updateLessonProgress(lesson.id, 25, Math.round((lesson.duration * 25) / 100));
    }
  }

  // Auto-update progress when video is playing
  useEffect(() => {
    if (isPlaying && lesson?.type === 'video') {
      const interval = setInterval(() => {
        const nextPercent = Math.min(100, percent + 10);
        updateLessonProgress(lesson.id, nextPercent, Math.round((lesson.duration * nextPercent) / 100));
        if (nextPercent >= 100) {
          setIsPlaying(false);
        }
      }, 30000); // Update every 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [isPlaying, lesson, percent]);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <header className="bg-surface border-b border-outline-variant h-14 flex items-center justify-between px-4 shrink-0 z-50">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-all active:scale-95">
            <ArrowLeft className="size-6" />
          </button>
          <div className="flex flex-col">
            <h1 className="text-sm font-bold text-on-surface truncate max-w-[200px] md:max-w-md">{lesson.title}</h1>
            <p className="text-[10px] font-bold text-on-surface-variant tracking-widest uppercase">Bài {index + 1}/{courseLessons.length}</p>
          </div>
        </div>
        <span className="hidden md:block text-[10px] font-bold text-primary px-2 py-0.5 bg-primary/10 rounded-full border border-primary/20 uppercase tracking-widest">
          {percent}% đã học
        </span>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-surface-container-low p-4 md:p-8 flex flex-col gap-6">
          <div className="max-w-4xl mx-auto w-full flex flex-col gap-6">
            <nav className="flex text-on-surface-variant text-[10px] font-bold items-center gap-1 uppercase tracking-widest">
              <Link to="/training" className="hover:text-primary transition-colors">Đào tạo</Link>
              <ChevronRight className="size-3" />
              <Link to={`/training/${course.id}`} className="hover:text-primary transition-colors">{course.name}</Link>
              <ChevronRight className="size-3" />
              <span className="text-on-surface font-black">{lesson.title}</span>
            </nav>

            <div className={cn(
              'w-full rounded-2xl overflow-hidden aspect-video shadow-2xl relative group',
              lesson.type === 'video' ? 'bg-black' : 'bg-surface'
            )}>
              {lesson.type === 'video' ? (
                <>
                  {embedUrl && isPlaying ? (
                    <iframe
                      src={`${embedUrl}&autoplay=1`}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={lesson.title}
                    />
                  ) : (
                    <>
                      <div className={cn(
                        'absolute inset-0 opacity-80',
                        course.department === 'Sale' ? 'bg-gradient-to-br from-blue-900 to-cyan-600' : course.department === 'Kỹ thuật' ? 'bg-gradient-to-br from-slate-950 to-teal-700' : 'bg-gradient-to-br from-emerald-900 to-lime-600'
                      )} />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <button 
                          onClick={embedUrl ? handlePlayVideo : simulateWatch} 
                          className="relative z-10 w-16 h-16 bg-primary/95 text-on-primary rounded-full flex items-center justify-center shadow-2xl hover:scale-105 transition-transform backdrop-blur-sm"
                        >
                          <Play className="size-8 fill-current ml-1" />
                        </button>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <>
                  <div className={cn(
                    'absolute inset-0 opacity-80',
                    course.department === 'Sale' ? 'bg-gradient-to-br from-blue-900 to-cyan-600' : course.department === 'Kỹ thuật' ? 'bg-gradient-to-br from-slate-950 to-teal-700' : 'bg-gradient-to-br from-emerald-900 to-lime-600'
                  )} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                    <FileText className="size-16 mb-3" />
                    <button onClick={() => updateLessonProgress(lesson.id, 100)} className="bg-primary text-on-primary px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest">
                      Xác nhận đã đọc
                    </button>
                  </div>
                </>
              )}

              {(!isPlaying || lesson.type !== 'video') && (
                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 flex flex-col gap-3">
                  <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${percent}%` }}></div>
                  </div>
                  <div className="flex justify-between items-center text-white text-[10px] font-mono">
                    <span className="font-bold">{percent}% / 100%</span>
                    <div className="flex items-center gap-3">
                      <Download className="size-3" />
                      <MessageSquare className="size-3" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-surface rounded-2xl shadow-sm p-6 md:p-8 flex flex-col gap-6 border border-outline-variant/30">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex-1">
                  <h3 className="text-xl font-black text-on-surface mb-2">Mô tả bài học</h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed opacity-80">
                    Nội dung này được theo dõi theo phần trăm hoàn thành. Video lưu thời gian xem, tài liệu lưu trạng thái đã đọc.
                  </p>
                </div>
                <button onClick={() => updateLessonProgress(lesson.id, 100, lesson.duration)} className="bg-primary hover:bg-primary-container text-on-primary text-xs font-black uppercase tracking-widest py-4 px-8 rounded-xl flex items-center gap-2 shadow-lg transition-all active:scale-95 shrink-0">
                  <CheckCircle className="size-4" />
                  Đánh dấu hoàn thành
                </button>
              </div>

              <hr className="border-outline-variant/50" />

              <div className="flex justify-between items-center">
                {previousLesson ? (
                  <Link to={`/training/${course.id}/lesson/${previousLesson.id}`} className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-all text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-lg hover:bg-surface-container-low border border-outline-variant/50">
                    <ArrowLeft className="size-3" />
                    Bài trước
                  </Link>
                ) : <span />}
                <div className="hidden md:flex gap-4">
                  <button className="text-on-surface-variant hover:text-primary transition-all p-2 rounded-full hover:bg-surface-container-low">
                    <Download className="size-5" />
                  </button>
                  <button className="text-on-surface-variant hover:text-primary transition-all p-2 rounded-full hover:bg-surface-container-low">
                    <MessageSquare className="size-5" />
                  </button>
                </div>
                {nextLesson ? (
                  <Link to={`/training/${course.id}/lesson/${nextLesson.id}`} className="flex items-center gap-2 text-primary hover:bg-primary/10 transition-all text-[10px] font-black uppercase tracking-widest px-6 py-2 rounded-lg border border-primary/30 bg-primary/5">
                    Bài tiếp theo
                    <ArrowRight className="size-3" />
                  </Link>
                ) : (
                  <Link to={`/training/${course.id}/quiz`} className="flex items-center gap-2 text-primary hover:bg-primary/10 transition-all text-[10px] font-black uppercase tracking-widest px-6 py-2 rounded-lg border border-primary/30 bg-primary/5">
                    Làm quiz
                    <ArrowRight className="size-3" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      <div className="h-16 md:hidden"></div>
    </div>
  );
}

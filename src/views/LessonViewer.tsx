import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  ChevronRight,
  Play,
  FileText,
  Sparkles,
  Clock,
  BookOpen,
} from 'lucide-react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import type React from 'react';
import { cn } from '../lib/utils';
import { useCrm, type Lesson } from '../lib/crmStore';
import { useState, useEffect, useMemo } from 'react';

function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;

  let value = url.trim();
  if (!/^https?:\/\//i.test(value) && /(^|\.)youtu(\.be|be\.com)|youtube-nocookie\.com/i.test(value)) {
    value = `https://${value}`;
  }

  try {
    const parsed = new URL(value);
    const host = parsed.hostname.replace(/^www\./, '');
    const pathParts = parsed.pathname.split('/').filter(Boolean);
    let videoId: string | null = null;

    if (host === 'youtu.be') {
      videoId = pathParts[0] || null;
    } else if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com' || host === 'youtube-nocookie.com') {
      if (parsed.pathname === '/watch') {
        videoId = parsed.searchParams.get('v');
      } else if (['embed', 'shorts', 'live', 'v'].includes(pathParts[0])) {
        videoId = pathParts[1] || null;
      }
    }

    if (videoId && /^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
      return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1`;
    }
  } catch {
    if (/^[a-zA-Z0-9_-]{11}$/.test(value)) {
      return `https://www.youtube-nocookie.com/embed/${value}?rel=0&modestbranding=1&playsinline=1`;
    }
  }

  return null;
}

function isDirectVideoUrl(url: string) {
  return /\.(mp4|webm|ogg)(\?.*)?$/i.test(url.trim());
}

/* ─────────── Markdown-ish renderer ─────────── */
type Block =
  | { type: 'h1'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'check'; items: { checked: boolean; text: string }[] }
  | { type: 'quote'; text: string }
  | { type: 'hr' }
  | { type: 'table'; head: string[]; rows: string[][] };

function parseMarkdown(text: string): Block[] {
  const lines = text.split('\n');
  const blocks: Block[] = [];
  let i = 0;
  while (i < lines.length) {
    const raw = lines[i];
    const line = raw.trimEnd();

    if (!line.trim()) {
      i++;
      continue;
    }

    // HR
    if (/^---+$/.test(line.trim())) {
      blocks.push({ type: 'hr' });
      i++;
      continue;
    }

    // Headings
    if (line.startsWith('# ')) {
      blocks.push({ type: 'h1', text: line.slice(2).trim() });
      i++;
      continue;
    }
    if (line.startsWith('## ')) {
      blocks.push({ type: 'h2', text: line.slice(3).trim() });
      i++;
      continue;
    }
    if (line.startsWith('### ')) {
      blocks.push({ type: 'h3', text: line.slice(4).trim() });
      i++;
      continue;
    }

    // Quote
    if (line.startsWith('> ')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].startsWith('> ')) {
        quoteLines.push(lines[i].slice(2));
        i++;
      }
      blocks.push({ type: 'quote', text: quoteLines.join(' ') });
      continue;
    }

    // Table
    if (line.includes('|') && i + 1 < lines.length && /^\|?\s*-/.test(lines[i + 1])) {
      const head = line
        .split('|')
        .map((s) => s.trim())
        .filter(Boolean);
      i += 2; // skip head + separator
      const rows: string[][] = [];
      while (i < lines.length && lines[i].includes('|') && lines[i].trim()) {
        rows.push(
          lines[i]
            .split('|')
            .map((s) => s.trim())
            .filter(Boolean)
        );
        i++;
      }
      blocks.push({ type: 'table', head, rows });
      continue;
    }

    // Checklist
    if (/^- \[[ xX]\] /.test(line)) {
      const items: { checked: boolean; text: string }[] = [];
      while (i < lines.length && /^- \[[ xX]\] /.test(lines[i])) {
        const checked = /^- \[[xX]\] /.test(lines[i]);
        items.push({ checked, text: lines[i].replace(/^- \[[ xX]\] /, '').trim() });
        i++;
      }
      blocks.push({ type: 'check', items });
      continue;
    }

    // Unordered list
    if (line.startsWith('- ')) {
      const items: string[] = [];
      while (i < lines.length && lines[i].startsWith('- ') && !/^- \[[ xX]\] /.test(lines[i])) {
        items.push(lines[i].slice(2).trim());
        i++;
      }
      blocks.push({ type: 'ul', items });
      continue;
    }

    // Ordered list
    if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s/, '').trim());
        i++;
      }
      blocks.push({ type: 'ol', items });
      continue;
    }

    // Paragraph (collect until blank line)
    const paragraphLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].startsWith('#') &&
      !lines[i].startsWith('- ') &&
      !lines[i].startsWith('> ') &&
      !/^\d+\.\s/.test(lines[i]) &&
      !/^---+$/.test(lines[i].trim())
    ) {
      paragraphLines.push(lines[i].trim());
      i++;
    }
    if (paragraphLines.length) {
      blocks.push({ type: 'p', text: paragraphLines.join(' ') });
    }
  }
  return blocks;
}

function renderInline(text: string): React.ReactNode[] {
  // Handle **bold** and `code`
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let lastIndex = 0;
  let match;
  let key = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith('**')) {
      parts.push(
        <strong key={key++} className="font-black text-on-surface">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('`')) {
      parts.push(
        <code key={key++} className="rounded bg-surface-container px-1.5 py-0.5 font-mono text-[12.5px] text-primary">
          {token.slice(1, -1)}
        </code>
      );
    }
    lastIndex = match.index + token.length;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts;
}

function MarkdownContent({ text }: { text: string }) {
  const blocks = useMemo(() => parseMarkdown(text), [text]);
  return (
    <div className="space-y-4 text-[14px] leading-[1.7] text-on-surface">
      {blocks.map((block, idx) => {
        switch (block.type) {
          case 'h1':
            return (
              <h2 key={idx} className="font-display text-[24px] font-bold leading-tight text-on-surface md:text-[28px]">
                {renderInline(block.text)}
              </h2>
            );
          case 'h2':
            return (
              <h3 key={idx} className="mt-2 flex items-start gap-2 font-display text-[18px] font-bold leading-tight text-on-surface md:text-[20px]">
                <span className="mt-1 size-2 shrink-0 rounded-full bg-primary" />
                <span>{renderInline(block.text)}</span>
              </h3>
            );
          case 'h3':
            return (
              <h4 key={idx} className="mt-1 text-[15px] font-black uppercase tracking-[0.06em] text-primary md:text-[16px]">
                {renderInline(block.text)}
              </h4>
            );
          case 'p':
            return (
              <p key={idx} className="text-[14px] leading-[1.75] text-on-surface-variant md:text-[15px]">
                {renderInline(block.text)}
              </p>
            );
          case 'ul':
            return (
              <ul key={idx} className="space-y-1.5">
                {block.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-[14px] leading-[1.65] text-on-surface md:text-[14.5px]">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-secondary" />
                    <span>{renderInline(item)}</span>
                  </li>
                ))}
              </ul>
            );
          case 'ol':
            return (
              <ol key={idx} className="space-y-1.5">
                {block.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-[14px] leading-[1.65] text-on-surface md:text-[14.5px]">
                    <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-primary-fixed font-mono text-[10.5px] font-black text-primary">
                      {i + 1}
                    </span>
                    <span>{renderInline(item)}</span>
                  </li>
                ))}
              </ol>
            );
          case 'check':
            return (
              <ul key={idx} className="space-y-1.5">
                {block.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 rounded-lg border border-outline-variant/60 bg-surface-container-low/40 px-3 py-2">
                    <span
                      className={cn(
                        'mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-[3px] border-2',
                        item.checked
                          ? 'border-primary bg-primary text-on-primary'
                          : 'border-outline-variant bg-surface'
                      )}
                    >
                      {item.checked && (
                        <svg viewBox="0 0 12 12" className="size-3" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="2 6 5 9 10 3" />
                        </svg>
                      )}
                    </span>
                    <span className="text-[13.5px] leading-[1.55] text-on-surface md:text-[14px]">{renderInline(item.text)}</span>
                  </li>
                ))}
              </ul>
            );
          case 'quote':
            return (
              <blockquote
                key={idx}
                className="rounded-r-xl border-l-4 border-primary bg-primary-fixed/40 px-4 py-2.5 text-[14px] italic leading-[1.65] text-primary"
              >
                {renderInline(block.text)}
              </blockquote>
            );
          case 'hr':
            return <hr key={idx} className="my-2 border-outline-variant/60" />;
          case 'table':
            return (
              <div key={idx} className="overflow-x-auto rounded-xl border border-outline-variant">
                <table className="w-full text-[12.5px]">
                  <thead className="bg-surface-container-low text-[10px] font-black uppercase tracking-[0.10em] text-on-surface-variant">
                    <tr>
                      {block.head.map((cell, i) => (
                        <th key={i} className="px-3 py-2 text-left">{cell}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/60">
                    {block.rows.map((row, ri) => (
                      <tr key={ri} className="bg-surface">
                        {row.map((cell, ci) => (
                          <td key={ci} className="px-3 py-2 font-semibold text-on-surface">
                            {renderInline(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
        }
      })}
    </div>
  );
}

export default function LessonViewer() {
  const navigate = useNavigate();
  const { id, lessonId } = useParams();
  const { courses, lessons, progress, currentUser, updateLessonProgress } = useCrm();
  const course = courses.find((item) => item.id === id);
  const courseLessons = lessons.filter((lesson) => lesson.courseId === id);
  const lesson: Lesson | undefined = courseLessons.find((item) => item.id === lessonId) ?? courseLessons[0];
  const index = courseLessons.findIndex((item) => item.id === lesson?.id);
  const lessonProgress = progress.find((item) => item.userId === currentUser.id && item.lessonId === lesson?.id);
  const percent = lessonProgress?.percent ?? 0;
  const nextLesson = courseLessons[index + 1];
  const previousLesson = courseLessons[index - 1];
  const [isPlaying, setIsPlaying] = useState(false);
  const videoSource = lesson?.type === 'video' ? lesson.videoUrl || lesson.contentUrl : '';
  const embedUrl = videoSource ? getYouTubeEmbedUrl(videoSource) : null;
  const directVideoUrl = videoSource && !embedUrl && isDirectVideoUrl(videoSource) ? videoSource : null;

  if (!course || !lesson) {
    return (
      <div className="p-8">
        <button onClick={() => navigate(-1)} className="font-bold text-primary">Quay lại</button>
        <p className="mt-4">Không tìm thấy bài học.</p>
      </div>
    );
  }

  function simulateWatch() {
    if (!lesson) return;
    const nextPercent = Math.min(100, percent + 25);
    updateLessonProgress(lesson.id, nextPercent, Math.round((lesson.duration * nextPercent) / 100));
  }

  function handleVideoStarted() {
    setIsPlaying(true);
    if (lesson && percent < 25) {
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
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [isPlaying, lesson, percent, updateLessonProgress]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-home-bg">
      <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-outline-variant bg-surface px-3 md:px-4">
        <div className="flex min-w-0 items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-on-surface-variant transition active:scale-90 hover:bg-surface-container-low hover:text-primary"
            aria-label="Quay lại"
          >
            <ArrowLeft className="size-5" strokeWidth={2.2} />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[13px] font-black leading-tight text-on-surface md:text-[14px]">
              {lesson.title}
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-on-surface-variant">
              Bài {index + 1}/{courseLessons.length} · {lesson.type === 'video' ? 'Video' : 'Tài liệu'}
            </p>
          </div>
        </div>
        <span className="hidden shrink-0 items-center gap-1.5 rounded-full border border-primary/20 bg-primary-fixed px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-primary md:inline-flex">
          <span className="size-1.5 rounded-full bg-primary" />
          {percent}% đã học
        </span>
      </header>

      <main className="flex-1 overflow-y-auto bg-home-bg">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-3 py-4 pb-20 md:gap-5 md:px-6 md:py-6">
          <nav className="flex flex-wrap items-center gap-1 text-[10px] font-black uppercase tracking-[0.14em] text-on-surface-variant">
            <Link to="/training" className="transition hover:text-primary">
              Đào tạo
            </Link>
            <ChevronRight className="size-3" />
            <Link to={`/training/${course.id}`} className="truncate transition hover:text-primary">
              {course.name}
            </Link>
            <ChevronRight className="size-3" />
            <span className="truncate font-black text-on-surface">Bài {index + 1}</span>
          </nav>

          {/* MEDIA AREA */}
          {lesson.type === 'video' ? (
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-lg ring-1 ring-outline-variant">
              {embedUrl ? (
                <iframe
                  src={embedUrl}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  loading="lazy"
                  onLoad={handleVideoStarted}
                  title={lesson.title}
                />
              ) : directVideoUrl ? (
                <video
                  src={directVideoUrl}
                  controls
                  className="h-full w-full bg-black"
                  onPlay={handleVideoStarted}
                />
              ) : (
                <>
                  <div
                    className={cn(
                      'absolute inset-0 opacity-80',
                      course.department === 'Sale'
                        ? 'bg-gradient-to-br from-blue-900 to-cyan-600'
                        : course.department === 'Kỹ thuật'
                        ? 'bg-gradient-to-br from-slate-950 to-teal-700'
                        : 'bg-gradient-to-br from-emerald-900 to-lime-600'
                    )}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button
                      onClick={simulateWatch}
                      className="relative z-10 flex size-16 items-center justify-center rounded-full bg-primary/95 text-on-primary shadow-2xl backdrop-blur-sm transition hover:scale-105"
                    >
                      <Play className="ml-1 size-8 fill-current" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <article className="relative overflow-hidden rounded-2xl border border-outline-variant bg-surface shadow-sm">
              {/* Document hero */}
              <div className="relative overflow-hidden border-b border-outline-variant bg-gradient-to-br from-primary-fixed via-secondary-container/40 to-tertiary-container/30 px-5 py-5 md:px-7 md:py-6">
                <div className="absolute -right-6 -top-6 size-32 rounded-full bg-white/30 blur-3xl" />
                <div className="relative flex items-start gap-3">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-surface text-primary shadow-sm ring-4 ring-primary/10">
                    <FileText className="size-5" strokeWidth={2.2} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">Tài liệu nội bộ · {course.department}</p>
                    <h2 className="mt-1 font-display text-[19px] font-bold leading-tight text-on-surface md:text-[24px]">
                      {lesson.title}
                    </h2>
                    {lesson.summary && (
                      <p className="mt-1.5 text-[12.5px] font-semibold leading-5 text-on-surface-variant md:text-[13px]">
                        {lesson.summary}
                      </p>
                    )}
                    <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 rounded-full border border-outline-variant bg-surface px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.10em] text-on-surface-variant">
                        <BookOpen className="size-3" strokeWidth={2.5} />
                        {lesson.documentPages ?? 1} trang
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full border border-outline-variant bg-surface px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.10em] text-on-surface-variant">
                        <Clock className="size-3" strokeWidth={2.5} />
                        ~{lesson.duration} phút
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Document body */}
              <div className="px-5 py-5 md:px-8 md:py-8">
                {lesson.body ? (
                  <MarkdownContent text={lesson.body} />
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                    <FileText className="size-10 text-on-surface-variant/40" />
                    <p className="text-[13px] font-bold text-on-surface">Tài liệu chưa có nội dung</p>
                    <p className="max-w-sm text-[11px] font-medium text-on-surface-variant">
                      Liên hệ admin để cập nhật nội dung tài liệu.
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm read button */}
              <div className="border-t border-outline-variant bg-surface-container-low/40 px-5 py-4 md:px-8">
                <button
                  type="button"
                  onClick={() => updateLessonProgress(lesson.id, 100)}
                  className={cn(
                    'flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-[12px] font-black uppercase tracking-[0.12em] shadow-sm transition active:scale-[0.99]',
                    percent >= 100
                      ? 'border border-primary/30 bg-primary-fixed text-primary'
                      : 'bg-primary text-on-primary shadow-primary/25 hover:bg-primary-container'
                  )}
                >
                  {percent >= 100 ? (
                    <>
                      <CheckCircle className="size-4" strokeWidth={2.5} />
                      Đã hoàn thành
                    </>
                  ) : (
                    <>
                      <CheckCircle className="size-4" strokeWidth={2.5} />
                      Xác nhận đã đọc
                    </>
                  )}
                </button>
              </div>
            </article>
          )}

          {/* META & nav */}
          <div className="rounded-2xl border border-outline-variant bg-surface p-4 shadow-sm md:p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-on-surface-variant">
                  <Sparkles className="size-3 text-secondary" strokeWidth={2.5} />
                  <span>Mô tả bài học</span>
                </div>
                <p className="mt-1.5 text-[13px] font-semibold leading-5 text-on-surface md:text-[14px]">
                  {lesson.summary ||
                    'Nội dung được theo dõi theo phần trăm hoàn thành. Video lưu thời gian xem, tài liệu lưu trạng thái đã đọc.'}
                </p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-container">
                  <div className="h-full rounded-full bg-gradient-to-r from-primary to-secondary" style={{ width: `${percent}%` }} />
                </div>
                <p className="mt-1.5 text-[11px] font-bold tabular-nums text-on-surface-variant">
                  {percent}% hoàn thành
                </p>
              </div>
              <button
                type="button"
                onClick={() => updateLessonProgress(lesson.id, 100, lesson.duration)}
                className="flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-[11px] font-black uppercase tracking-[0.12em] text-on-primary shadow-md shadow-primary/25 transition active:scale-95 hover:bg-primary-container"
              >
                <CheckCircle className="size-4" strokeWidth={2.5} />
                Đánh dấu hoàn thành
              </button>
            </div>

            <hr className="my-4 border-outline-variant/50" />

            <div className="flex items-center justify-between gap-2">
              {previousLesson ? (
                <Link
                  to={`/training/${course.id}/lesson/${previousLesson.id}`}
                  className="flex h-10 items-center gap-1.5 rounded-xl border border-outline-variant bg-surface px-3 text-[10.5px] font-black uppercase tracking-[0.10em] text-on-surface-variant transition active:scale-95 hover:border-primary/30 hover:text-primary"
                >
                  <ArrowLeft className="size-3.5" strokeWidth={2.5} />
                  <span className="hidden sm:inline">Bài trước</span>
                </Link>
              ) : (
                <span />
              )}
              {nextLesson ? (
                <Link
                  to={`/training/${course.id}/lesson/${nextLesson.id}`}
                  className="flex h-10 items-center gap-1.5 rounded-xl border border-primary/30 bg-primary-fixed px-4 text-[10.5px] font-black uppercase tracking-[0.10em] text-primary transition active:scale-95 hover:bg-primary hover:text-on-primary"
                >
                  Bài tiếp theo
                  <ArrowRight className="size-3.5" strokeWidth={2.5} />
                </Link>
              ) : (
                <Link
                  to={`/training/${course.id}/quiz`}
                  className="flex h-10 items-center gap-1.5 rounded-xl bg-primary px-4 text-[10.5px] font-black uppercase tracking-[0.10em] text-on-primary shadow-sm shadow-primary/25 transition active:scale-95 hover:bg-primary-container"
                >
                  Làm quiz
                  <ArrowRight className="size-3.5" strokeWidth={2.5} />
                </Link>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Award,
  Briefcase,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  Circle,
  ClipboardCheck,
  Crown,
  Download,
  FileText,
  HeartHandshake,
  ListChecks,
  Minus,
  Pencil,
  Printer,
  RotateCcw,
  Search,
  Sparkles,
  Target,
  ThumbsDown,
  ThumbsUp,
  UserRound,
  X,
} from 'lucide-react';
import { cn } from '../lib/utils';

type Section = {
  id: string;
  roman: string;
  title: string;
  subtitle: string;
  hint: string;
  icon: typeof UserRound;
  iconColorClass: string;
  barClass: string;
  bgClass: string;
  ringClass: string;
  questions: string[];
};

const sections: Section[] = [
  {
    id: 'basic',
    roman: 'I',
    title: 'Thông tin cơ bản',
    subtitle: 'Phá băng và tìm hiểu nhanh',
    hint: 'Tạo không khí thoải mái, đánh giá khả năng giao tiếp ban đầu.',
    icon: UserRound,
    iconColorClass: 'text-primary',
    barClass: 'bg-primary',
    bgClass: 'bg-primary-fixed',
    ringClass: 'ring-primary/15',
    questions: [
      'Em giới thiệu ngắn gọn về bản thân nhé?',
      'Hiện tại em đang học/làm gì?',
      'Em đang tìm công việc part-time hay full-time?',
      'Em có thể làm được những ca nào?',
      'Nhà em ở khu vực nào? Di chuyển tới Ba Đình có thuận tiện không?',
      'Em dự định làm công việc này trong bao lâu?',
    ],
  },
  {
    id: 'attitude',
    roman: 'II',
    title: 'Thái độ & tính cách',
    subtitle: 'Đánh giá tinh thần & sự phù hợp',
    hint: 'Quan sát biểu cảm, ngôn ngữ cơ thể và cách suy nghĩ.',
    icon: HeartHandshake,
    iconColorClass: 'text-secondary',
    barClass: 'bg-secondary',
    bgClass: 'bg-secondary-container',
    ringClass: 'ring-secondary/15',
    questions: [
      'Theo em, một nhân viên sale cần có điều gì quan trọng nhất?',
      'Em có phải người hướng ngoại không? Em có ngại nói chuyện với khách lạ không?',
      'Khi khách khó tính hoặc cáu gắt, em thường phản ứng thế nào?',
      'Em có từng bị khách phàn nàn chưa? Em xử lý ra sao?',
      'Em nghĩ điểm mạnh và điểm yếu của mình là gì?',
      'Em có phải người đúng giờ không?',
      'Điều gì khiến em nghỉ việc ở công việc cũ? (nếu có)',
    ],
  },
  {
    id: 'experience',
    roman: 'III',
    title: 'Kinh nghiệm bán hàng',
    subtitle: 'Trải nghiệm thực tế và kỹ năng nền',
    hint: 'Kiểm tra mức độ thành thạo với công cụ làm việc.',
    icon: Briefcase,
    iconColorClass: 'text-tertiary',
    barClass: 'bg-tertiary',
    bgClass: 'bg-tertiary-container/50',
    ringClass: 'ring-tertiary/15',
    questions: [
      'Em đã từng làm sale/chăm sóc khách hàng chưa? Em từng bán sản phẩm gì?',
      'Em có từng trả lời inbox Facebook chốt đơn chưa?',
      'Em có từng tư vấn khách lên đơn chưa?',
      'Em có từng dùng máy tính cơ bản chưa?',
      'Em có biết sử dụng Facebook Page và Messenger không?',
      'Em có biết sử dụng Google Sheet không?',
      'Em có biết sử dụng Canva không?',
      'Nếu chưa có kinh nghiệm, em nghĩ mình có học nhanh không?',
    ],
  },
  {
    id: 'situation',
    roman: 'IV',
    title: 'Tình huống thực tế',
    subtitle: 'Đánh giá tư duy và phản xạ',
    hint: 'Lắng nghe cách suy nghĩ — không có đáp án đúng tuyệt đối.',
    icon: Target,
    iconColorClass: 'text-primary',
    barClass: 'bg-primary',
    bgClass: 'bg-primary/10',
    ringClass: 'ring-primary/15',
    questions: [
      'Nếu khách hỏi giá nhưng chưa muốn làm ngay, em sẽ trả lời thế nào?',
      'Nếu khách seen không rep, em có follow lại không?',
      'Nếu khách báo "đắt quá", em sẽ xử lý sao?',
      'Nếu khách tới shop đang khó chịu, em sẽ làm gì đầu tiên?',
      'Nếu em làm sai đơn hàng thì em xử lý thế nào?',
      'Nếu quá đông khách cùng lúc, em sẽ ưu tiên xử lý ra sao?',
    ],
  },
  {
    id: 'fit',
    roman: 'V',
    title: 'Phù hợp với XOXO',
    subtitle: 'Sự yêu thích thương hiệu',
    hint: 'Nhân viên yêu thương hiệu sẽ truyền cảm hứng tốt cho khách.',
    icon: Sparkles,
    iconColorClass: 'text-secondary',
    barClass: 'bg-secondary',
    bgClass: 'bg-secondary-container',
    ringClass: 'ring-secondary/15',
    questions: [
      'Em có thích thời trang, túi xách, giày dép, đồ hiệu không?',
      'Em có thích môi trường trẻ, tốc độ nhanh không?',
      'Em có sẵn sàng học nhiều thứ mới không?',
      'Em có dùng TikTok/Facebook thường xuyên không?',
      'Điều gì khiến em muốn làm tại XOXO Luxury?',
    ],
  },
  {
    id: 'commitment',
    roman: 'VI',
    title: 'Cam kết công việc',
    subtitle: 'Kỳ vọng và sự sẵn sàng',
    hint: 'Chốt thời gian bắt đầu và những điểm cần thoả thuận trước.',
    icon: ClipboardCheck,
    iconColorClass: 'text-tertiary',
    barClass: 'bg-tertiary',
    bgClass: 'bg-tertiary-container/50',
    ringClass: 'ring-tertiary/15',
    questions: [
      'Em có thể đi làm ngay không?',
      'Em có thể làm cuối tuần/lễ không?',
      'Em có vấn đề gì ảnh hưởng tới lịch làm việc không?',
      'Em mong muốn mức thu nhập bao nhiêu?',
      'Em có câu hỏi gì dành cho bên anh/chị không?',
    ],
  },
];

const totalQuestions = sections.reduce((sum, section) => sum + section.questions.length, 0);

type Score = 'pass' | 'neutral' | 'fail' | null;

interface SessionState {
  candidateName: string;
  position: string;
  date: string;
  interviewer: string;
  scores: Record<string, Score>;
  notes: Record<string, string>;
}

const STORAGE_KEY = 'xoxo-interview-session-v1';

const todayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const emptySession: SessionState = {
  candidateName: '',
  position: 'Sale Junior',
  date: todayIso(),
  interviewer: '',
  scores: {},
  notes: {},
};

const scoreWeight: Record<NonNullable<Score>, number> = {
  pass: 1,
  neutral: 0.5,
  fail: 0,
};

const scoreLabel: Record<NonNullable<Score>, string> = {
  pass: 'Đạt',
  neutral: 'Trung bình',
  fail: 'Chưa đạt',
};

function loadSession(): SessionState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptySession;
    const parsed = JSON.parse(raw) as Partial<SessionState>;
    return {
      ...emptySession,
      ...parsed,
      scores: parsed.scores || {},
      notes: parsed.notes || {},
    };
  } catch {
    return emptySession;
  }
}

function formatDateVN(iso: string) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

export default function InterviewQuestions() {
  const [session, setSession] = useState<SessionState>(() => loadSession());
  const [query, setQuery] = useState('');
  const [activeId, setActiveId] = useState<string>(sections[0].id);
  const [openNote, setOpenNote] = useState<string | null>(null);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'report'>('idle');
  const [showSetup, setShowSetup] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const navRef = useRef<HTMLDivElement>(null);

  // Persist session
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch {
      /* noop */
    }
  }, [session]);

  // Track active section on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveId(visible.target.id);
      },
      { rootMargin: '-25% 0px -60% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    const elements = Object.values(sectionRefs.current) as Array<HTMLElement | null>;
    elements.forEach((el) => {
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  // Auto-scroll active chip into view
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const target = nav.querySelector<HTMLElement>(`[data-chip="${activeId}"]`);
    if (target) target.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [activeId]);

  // Lock body scroll when modal open
  useEffect(() => {
    if (showSummary || showSetup) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showSummary, showSetup]);

  const filteredSections = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return sections;
    return sections
      .map((section) => ({
        ...section,
        questions: section.questions.filter((q) => q.toLowerCase().includes(normalizedQuery)),
      }))
      .filter((section) => section.questions.length > 0);
  }, [query]);

  const stats = useMemo(() => {
    const entries = Object.entries(session.scores).filter(([, value]) => value) as Array<[string, NonNullable<Score>]>;
    const answered = entries.length;
    const passCount = entries.filter(([, v]) => v === 'pass').length;
    const neutralCount = entries.filter(([, v]) => v === 'neutral').length;
    const failCount = entries.filter(([, v]) => v === 'fail').length;
    const totalScore = entries.reduce((sum, [, v]) => sum + scoreWeight[v], 0);
    const overallPercent = Math.round((totalScore / totalQuestions) * 100);
    return { answered, passCount, neutralCount, failCount, overallPercent };
  }, [session.scores]);

  const sectionStats = useMemo(() => {
    return sections.map((section) => {
      const keys = section.questions.map((q) => `${section.id}::${q}`);
      const filled = keys.filter((k) => session.scores[k]).length;
      const pass = keys.filter((k) => session.scores[k] === 'pass').length;
      return {
        id: section.id,
        title: section.title,
        roman: section.roman,
        total: section.questions.length,
        filled,
        pass,
        percent: section.questions.length ? Math.round((filled / section.questions.length) * 100) : 0,
      };
    });
  }, [session.scores]);

  const recommendation = useMemo(() => {
    if (stats.answered < Math.ceil(totalQuestions * 0.6)) {
      return {
        tone: 'neutral' as const,
        title: 'Cần đánh giá thêm',
        text: `Đã đánh giá ${stats.answered}/${totalQuestions} câu. Hoàn tất các câu còn lại để có đánh giá đầy đủ.`,
      };
    }
    if (stats.overallPercent >= 75) {
      return {
        tone: 'pass' as const,
        title: 'Đề xuất nhận',
        text: 'Ứng viên thể hiện tốt và phù hợp tinh thần XOXO. Cân nhắc mời thử việc.',
      };
    }
    if (stats.overallPercent >= 55) {
      return {
        tone: 'neutral' as const,
        title: 'Cân nhắc kỹ',
        text: 'Có điểm sáng nhưng còn vài điểm chưa rõ. Nên thử một buổi onboard nhanh để xem thực tế.',
      };
    }
    return {
      tone: 'fail' as const,
      title: 'Chưa phù hợp',
      text: 'Nhiều mục thiếu điểm. Có thể giữ liên hệ cho vị trí khác phù hợp hơn.',
    };
  }, [stats]);

  function updateField<K extends keyof SessionState>(key: K, value: SessionState[K]) {
    setSession((prev) => ({ ...prev, [key]: value }));
  }

  function setScore(key: string, value: Score) {
    setSession((prev) => {
      const next = { ...prev.scores };
      if (next[key] === value) {
        delete next[key];
      } else if (value === null) {
        delete next[key];
      } else {
        next[key] = value;
      }
      return { ...prev, scores: next };
    });
  }

  function setNote(key: string, value: string) {
    setSession((prev) => {
      const next = { ...prev.notes };
      if (!value.trim()) delete next[key];
      else next[key] = value;
      return { ...prev, notes: next };
    });
  }

  function scrollToSection(id: string) {
    const el = sectionRefs.current[id];
    if (!el) return;
    const headerOffset = 132;
    const top = el.getBoundingClientRect().top + window.scrollY - headerOffset;
    window.scrollTo({ top, behavior: 'smooth' });
  }

  function handleResetSession() {
    if (!window.confirm('Bắt đầu buổi phỏng vấn mới? Toàn bộ đánh giá hiện tại sẽ bị xoá.')) return;
    setSession({ ...emptySession, date: todayIso() });
    setOpenNote(null);
    setShowSummary(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function buildQuestionsText() {
    return sections
      .map((section) => {
        const heading = `${section.roman}. ${section.title.toUpperCase()}`;
        const body = section.questions.map((q, idx) => `${idx + 1}. ${q}`).join('\n');
        return `${heading}\n${body}`;
      })
      .join('\n\n');
  }

  function buildReportText() {
    const lines: string[] = [];
    lines.push('═══════════════════════════════════════');
    lines.push('  BÁO CÁO PHỎNG VẤN — XOXO LUXURY');
    lines.push('═══════════════════════════════════════');
    lines.push('');
    lines.push(`Ứng viên   : ${session.candidateName || '(chưa nhập)'}`);
    lines.push(`Vị trí     : ${session.position}`);
    lines.push(`Ngày PV    : ${formatDateVN(session.date)}`);
    lines.push(`Người PV   : ${session.interviewer || '(chưa nhập)'}`);
    lines.push('');
    lines.push(`Tổng điểm  : ${stats.overallPercent}/100`);
    lines.push(`Đã đánh giá: ${stats.answered}/${totalQuestions} câu`);
    lines.push(`Đạt: ${stats.passCount} | Trung bình: ${stats.neutralCount} | Chưa đạt: ${stats.failCount}`);
    lines.push('');
    lines.push(`KẾT LUẬN: ${recommendation.title.toUpperCase()}`);
    lines.push(recommendation.text);
    lines.push('');
    lines.push('───────────────────────────────────────');
    lines.push('');

    sections.forEach((section) => {
      lines.push(`${section.roman}. ${section.title.toUpperCase()}`);
      lines.push('');
      section.questions.forEach((q, idx) => {
        const key = `${section.id}::${q}`;
        const score = session.scores[key];
        const note = session.notes[key];
        const scoreText = score ? `[${scoreLabel[score]}]` : '[Chưa đánh giá]';
        lines.push(`${idx + 1}. ${q}`);
        lines.push(`   ${scoreText}`);
        if (note) lines.push(`   Ghi chú: ${note}`);
        lines.push('');
      });
      lines.push('');
    });

    return lines.join('\n');
  }

  function copyText(text: string, mode: 'copied' | 'report') {
    if (!text) return;
    navigator.clipboard?.writeText(text).then(() => {
      setCopyState(mode);
      window.setTimeout(() => setCopyState('idle'), 1800);
    });
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="page-shell !max-w-3xl">
      {/* PRINT HEADER (flows in document flow on print) */}
      <div className="print-header hidden print:block">
        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#c9823a]">XOXO Luxury · Báo cáo phỏng vấn</p>
        <h1 className="mt-1.5 font-display text-[22px] font-bold leading-tight text-[#1b1c19]">
          {session.candidateName || 'Ứng viên'}
        </h1>
        <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] font-semibold text-[#444840]">
          <p><span className="font-black">Vị trí:</span> {session.position}</p>
          <p><span className="font-black">Ngày PV:</span> {formatDateVN(session.date)}</p>
          <p><span className="font-black">Người PV:</span> {session.interviewer || '________________'}</p>
          <p><span className="font-black">Tổng điểm:</span> {stats.overallPercent}/100 ({stats.passCount} đạt · {stats.neutralCount} TB · {stats.failCount} chưa)</p>
        </div>
      </div>

      {/* HERO */}
      <section className="iq-hero relative overflow-hidden">
        <div className="absolute inset-0 -z-0 bg-gradient-to-br from-primary/12 via-transparent to-secondary/15" />
        <div className="absolute -right-20 -top-24 -z-0 size-64 rounded-full bg-secondary/15 blur-3xl" />
        <div className="absolute -left-16 -bottom-16 -z-0 size-56 rounded-full bg-primary/12 blur-3xl" />

        <div className="relative z-10 px-4 pt-4 pb-3 md:px-6 md:pt-6 md:pb-5">
          <Link
            to="/recruitment"
            className="inline-flex h-8 items-center gap-1.5 rounded-full border border-outline-variant bg-surface/80 px-2.5 text-[10.5px] font-black uppercase tracking-[0.14em] text-on-surface-variant backdrop-blur transition active:scale-95 hover:border-primary/30 hover:text-primary"
          >
            <ArrowLeft className="size-3.5" strokeWidth={2.5} />
            <span>Tuyển dụng</span>
          </Link>

          <div className="mt-3 flex items-center gap-1.5">
            <Crown className="size-3.5 text-secondary" />
            <p className="text-[9.5px] font-black uppercase tracking-[0.24em] text-secondary">XOXO Luxury · Interview Kit</p>
          </div>

          <h1 className="mt-1 font-display text-[28px] font-bold leading-[1.05] tracking-tight text-on-surface md:text-[34px]">
            Bộ câu hỏi phỏng vấn
            <br className="md:hidden" />
            <span className="text-primary"> Sale</span>
          </h1>

          <p className="mt-2 max-w-md text-[12.5px] font-semibold leading-5 text-on-surface-variant md:text-[13px]">
            {totalQuestions} câu · {sections.length} nhóm đánh giá · Tự lưu trên thiết bị.
          </p>
        </div>

        {/* Compact session bar */}
        <div className="relative z-10 mx-3 mb-3 rounded-2xl border border-outline-variant bg-surface/85 p-2.5 shadow-sm backdrop-blur-sm md:mx-6 md:mb-5 md:p-3 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-container text-on-primary shadow-sm shadow-primary/20">
              <UserRound className="size-5" strokeWidth={2.5} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[9.5px] font-black uppercase tracking-[0.16em] text-on-surface-variant">Ứng viên · {session.position}</p>
              <p className="mt-0.5 truncate text-[14px] font-black leading-tight text-on-surface">
                {session.candidateName || (
                  <span className="font-semibold text-on-surface-variant/80">Chưa nhập tên</span>
                )}
              </p>
              <p className="mt-0.5 truncate text-[10.5px] font-bold text-on-surface-variant">
                {formatDateVN(session.date)}
                {session.interviewer && ` · PV bởi ${session.interviewer}`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowSetup(true)}
              className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-outline-variant bg-surface text-on-surface-variant transition active:scale-95 hover:border-primary/30 hover:text-primary"
              aria-label="Sửa thông tin buổi PV"
            >
              <Pencil className="size-4" />
            </button>
          </div>
        </div>
      </section>

      {/* STICKY NAV */}
      <div className="iq-sticky-nav sticky top-12 z-20 print:hidden md:top-16">
        <div className="border-b border-outline-variant/60 bg-home-bg/92 px-3 backdrop-blur-md md:rounded-2xl md:border md:bg-surface/95 md:px-3.5 md:shadow-sm">
          <div className="flex items-center gap-2 py-2">
            <div className="relative flex-1 min-w-0">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-on-surface-variant" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm câu hỏi..."
                className="h-9 w-full rounded-full border border-outline-variant bg-surface pl-8 pr-8 text-[12.5px] font-semibold outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-1.5 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-on-surface-variant active:scale-90 hover:bg-surface-container-high"
                  aria-label="Xoá tìm kiếm"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowSummary(true)}
              className="flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-primary px-3.5 text-[10.5px] font-black uppercase tracking-[0.14em] text-on-primary shadow-sm shadow-primary/25 transition active:scale-95 hover:bg-primary-container"
            >
              <Award className="size-3.5" strokeWidth={2.5} />
              <span>Kết quả</span>
            </button>
          </div>
          <div ref={navRef} className="-mx-3 flex gap-1.5 overflow-x-auto px-3 pb-2 scrollbar-hide snap-x">
            {sections.map((section) => {
              const stat = sectionStats.find((s) => s.id === section.id);
              const isActive = activeId === section.id;
              const isComplete = stat && stat.filled === stat.total;
              return (
                <button
                  key={section.id}
                  type="button"
                  data-chip={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={cn(
                    'group relative flex shrink-0 snap-start items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.12em] transition active:scale-95',
                    isActive
                      ? 'border-primary bg-primary text-on-primary shadow-sm shadow-primary/20'
                      : 'border-outline-variant bg-surface text-on-surface-variant hover:border-primary/30 hover:text-primary'
                  )}
                >
                  <span className={cn('font-mono text-[10px] opacity-70', isActive && 'opacity-100')}>{section.roman}</span>
                  <span className="max-w-[110px] truncate">{section.title}</span>
                  {stat && stat.filled > 0 && (
                    <span
                      className={cn(
                        'inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 font-mono text-[9px]',
                        isActive
                          ? 'bg-on-primary/20 text-on-primary'
                          : isComplete
                          ? 'bg-primary text-on-primary'
                          : 'bg-primary-fixed text-primary'
                      )}
                    >
                      {isComplete ? <Check className="size-2.5" strokeWidth={3.5} /> : stat.filled}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* SECTIONS */}
      <div className="px-3 pt-3 grid gap-3 md:px-0 md:gap-4">
        {filteredSections.map((section, sectionIndex) => {
          const Icon = section.icon;
          const stat = sectionStats.find((s) => s.id === section.id);
          return (
            <motion.section
              key={section.id}
              id={section.id}
              ref={(el) => {
                sectionRefs.current[section.id] = el;
              }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.32, delay: Math.min(sectionIndex * 0.04, 0.18), ease: [0.22, 1, 0.36, 1] }}
              className="iq-section section-card scroll-mt-44 overflow-hidden hover:border-home-primary/20 hover:shadow-md hover:shadow-home-primary/10"
            >
              <header className="relative overflow-hidden border-b border-outline-variant/70 bg-gradient-to-br from-surface-container-low/50 to-surface px-3.5 py-3.5 md:px-4 md:py-4">
                <div className="flex items-start gap-2.5">
                  <div className={cn('flex size-11 shrink-0 items-center justify-center rounded-2xl shadow-sm ring-4', section.bgClass, section.ringClass)}>
                    <Icon className={cn('size-5', section.iconColorClass)} strokeWidth={2.2} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className={cn('font-display text-[13px] font-bold leading-none', section.iconColorClass)}>
                        {section.roman}
                      </span>
                      <span className="size-1 rounded-full bg-outline-variant" />
                      <p className="eyebrow !text-[9.5px]">{section.questions.length} câu</p>
                    </div>
                    <h2 className="mt-1 font-display text-[19px] font-bold leading-tight tracking-tight text-on-surface md:text-[22px]">
                      {section.title}
                    </h2>
                    <p className="mt-0.5 text-[11.5px] font-semibold leading-5 text-on-surface-variant md:text-[12.5px]">
                      {section.subtitle}
                    </p>
                  </div>
                </div>

                {stat && stat.total > 0 && (
                  <div className="mt-3 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-container">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${stat.percent}%` }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        className={cn('h-full rounded-full', section.barClass)}
                      />
                    </div>
                    <span className="font-mono text-[10px] font-black text-on-surface-variant tabular-nums">
                      {stat.filled}/{stat.total}
                    </span>
                  </div>
                )}
              </header>

              <div className="border-b border-outline-variant/40 bg-secondary-container/30 px-3.5 py-2 md:px-4">
                <p className="flex items-start gap-1.5 text-[11px] font-semibold leading-5 text-on-secondary-container">
                  <Sparkles className="mt-0.5 size-3 shrink-0" strokeWidth={2.5} />
                  <span>{section.hint}</span>
                </p>
              </div>

              <ol className="divide-y divide-outline-variant/40">
                {section.questions.map((question, questionIndex) => {
                  const key = `${section.id}::${question}`;
                  const score = session.scores[key];
                  const note = session.notes[key] || '';
                  const isOpen = openNote === key;
                  return (
                    <li key={key} className={cn('px-3 py-3.5 transition-colors md:px-4', score && 'bg-surface-container-low/40')}>
                      <div className="flex items-start gap-2.5">
                        <div
                          className={cn(
                            'mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg font-mono text-[11px] font-black ring-1 ring-inset transition-colors',
                            score === 'pass' && 'bg-primary text-on-primary ring-primary',
                            score === 'neutral' && 'bg-tertiary-container text-on-tertiary-container ring-tertiary/30',
                            score === 'fail' && 'bg-error-container text-on-error-container ring-error/30',
                            !score && 'bg-surface ring-outline-variant text-on-surface-variant'
                          )}
                        >
                          {score === 'pass' ? <Check className="size-4" strokeWidth={3} /> : questionIndex + 1}
                        </div>
                        <p className="flex-1 text-[14px] font-semibold leading-[1.55] text-on-surface md:text-[14.5px]">{question}</p>
                      </div>

                      {/* Score buttons - mobile optimized */}
                      <div className="mt-3 grid grid-cols-3 gap-1.5 print:hidden">
                        <ScoreButton
                          active={score === 'fail'}
                          tone="fail"
                          icon={ThumbsDown}
                          label="Chưa đạt"
                          onClick={() => setScore(key, 'fail')}
                        />
                        <ScoreButton
                          active={score === 'neutral'}
                          tone="neutral"
                          icon={Minus}
                          label="Trung bình"
                          onClick={() => setScore(key, 'neutral')}
                        />
                        <ScoreButton
                          active={score === 'pass'}
                          tone="pass"
                          icon={ThumbsUp}
                          label="Đạt"
                          onClick={() => setScore(key, 'pass')}
                        />
                      </div>

                      {/* Note toggle */}
                      <div className="mt-2 print:hidden">
                        <button
                          type="button"
                          onClick={() => setOpenNote(isOpen ? null : key)}
                          className={cn(
                            'inline-flex h-8 items-center gap-1.5 rounded-full border px-2.5 text-[10.5px] font-black uppercase tracking-[0.12em] transition active:scale-95',
                            note
                              ? 'border-primary/30 bg-primary-fixed text-primary'
                              : 'border-outline-variant bg-surface text-on-surface-variant hover:border-primary/30 hover:text-primary'
                          )}
                        >
                          <FileText className="size-3.5" />
                          <span>{note ? 'Có ghi chú' : 'Thêm ghi chú'}</span>
                          {note && <Check className="size-3" strokeWidth={3} />}
                        </button>
                      </div>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                            className="overflow-hidden print:hidden"
                          >
                            <textarea
                              value={note}
                              onChange={(e) => setNote(key, e.target.value)}
                              rows={3}
                              placeholder="Ghi chú nhanh về câu trả lời..."
                              autoFocus
                              className="mt-2 w-full resize-y rounded-2xl border border-outline-variant bg-surface p-3 text-[13px] font-medium leading-6 text-on-surface outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {note && !isOpen && (
                        <div className="mt-2 flex items-start gap-2 rounded-2xl border border-primary/15 bg-primary-fixed/60 px-3 py-2.5">
                          <FileText className="mt-0.5 size-3.5 shrink-0 text-primary" />
                          <p className="flex-1 text-[12px] font-semibold leading-5 text-on-primary-fixed">{note}</p>
                        </div>
                      )}

                      {/* Print-only score */}
                      <div className="mt-2 hidden print:block">
                        <p className="text-[11px] font-semibold text-on-surface-variant">
                          Đánh giá: {score ? scoreLabel[score] : '__________'}
                        </p>
                        {note && <p className="mt-1 text-[11px] font-medium text-on-surface">Ghi chú: {note}</p>}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </motion.section>
          );
        })}

        {filteredSections.length === 0 && (
          <div className="section-card flex flex-col items-center justify-center gap-2 p-10 text-center">
            <Search className="size-8 text-on-surface-variant/50" />
            <p className="text-sm font-black text-on-surface">Không tìm thấy câu hỏi phù hợp</p>
            <p className="max-w-sm text-xs font-semibold text-on-surface-variant">
              Thử bỏ filter hoặc xoá ô tìm kiếm để xem lại toàn bộ.
            </p>
          </div>
        )}
      </div>

      {/* FLOATING ACTION BAR (sticky inside scroll container) */}
      <div className="iq-action-bar z-40 mx-3 mt-4 rounded-2xl border border-outline-variant/80 bg-surface/95 px-3 pt-2.5 shadow-[0_-8px_32px_rgba(79,101,64,0.10)] backdrop-blur-xl print:hidden">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetSession}
            className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-outline-variant bg-surface text-on-surface-variant transition active:scale-90 hover:border-primary/30 hover:text-primary"
            aria-label="Bắt đầu mới"
          >
            <RotateCcw className="size-4" strokeWidth={2.5} />
          </button>
          <div className="flex-1 rounded-2xl border border-outline-variant bg-home-bg/60 px-3 py-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[9.5px] font-black uppercase tracking-[0.14em] text-on-surface-variant">Tiến độ</span>
              <span className="font-mono text-[12px] font-black tabular-nums text-on-surface">
                {stats.answered}/{totalQuestions} · {stats.overallPercent}%
              </span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-container">
              <motion.div
                initial={false}
                animate={{ width: `${stats.overallPercent}%` }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="h-full rounded-full bg-gradient-to-r from-primary via-primary-container to-secondary"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowSummary(true)}
            className="flex h-11 shrink-0 items-center gap-1.5 rounded-2xl bg-primary px-4 text-[11px] font-black uppercase tracking-[0.14em] text-on-primary shadow-md shadow-primary/25 transition active:scale-95 hover:bg-primary-container"
          >
            <Award className="size-4" strokeWidth={2.5} />
            <span>Kết quả</span>
          </button>
        </div>
      </div>

      {/* SETUP BOTTOM SHEET */}
      <AnimatePresence>
        {showSetup && (
          <BottomSheet onClose={() => setShowSetup(false)} title="Thông tin buổi phỏng vấn" icon={Pencil}>
            <div className="grid gap-3 p-4 sm:grid-cols-2">
              <FloatingField
                label="Tên ứng viên"
                icon={UserRound}
                value={session.candidateName}
                onChange={(v) => updateField('candidateName', v)}
                placeholder="VD: Nguyễn Thị Mai Anh"
              />
              <FloatingSelect
                label="Vị trí"
                icon={Briefcase}
                value={session.position}
                onChange={(v) => updateField('position', v)}
                options={['Sale Junior', 'Sale Senior', 'Sale Online', 'Sale Tại shop', 'Trưởng ca Sale']}
              />
              <FloatingField
                label="Ngày phỏng vấn"
                icon={Calendar}
                type="date"
                value={session.date}
                onChange={(v) => updateField('date', v)}
              />
              <FloatingField
                label="Người phỏng vấn"
                icon={UserRound}
                value={session.interviewer}
                onChange={(v) => updateField('interviewer', v)}
                placeholder="VD: Anh Huy"
              />
            </div>
            <div className="border-t border-outline-variant bg-surface-container-low/40 p-3">
              <button
                type="button"
                onClick={() => setShowSetup(false)}
                className="btn-primary flex h-12 w-full items-center justify-center gap-2"
              >
                <Check className="size-4" strokeWidth={2.5} />
                <span className="text-[12px]">Lưu & Tiếp tục</span>
              </button>
            </div>
          </BottomSheet>
        )}
      </AnimatePresence>

      {/* SUMMARY BOTTOM SHEET */}
      <AnimatePresence>
        {showSummary && (
          <BottomSheet
            onClose={() => setShowSummary(false)}
            title={`Tổng kết · ${session.candidateName || 'Ứng viên'}`}
            icon={Award}
            tone={recommendation.tone}
            size="large"
          >
            {/* Recommendation hero with score ring */}
            <div
              className={cn(
                'relative shrink-0 overflow-hidden border-b border-outline-variant px-4 py-3.5',
                recommendation.tone === 'pass' && 'bg-gradient-to-br from-primary-fixed via-primary-fixed to-secondary-container',
                recommendation.tone === 'neutral' && 'bg-gradient-to-br from-tertiary-container/50 to-secondary-container',
                recommendation.tone === 'fail' && 'bg-gradient-to-br from-error-container/40 to-surface-container'
              )}
            >
              <div className="absolute -right-10 -top-10 size-32 rounded-full bg-white/40 blur-3xl" />
              <div className="relative flex items-center gap-3">
                <ScoreRing percent={stats.overallPercent} tone={recommendation.tone} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    {recommendation.tone === 'pass' && <Award className="size-3.5 text-primary" strokeWidth={2.5} />}
                    {recommendation.tone === 'neutral' && <Sparkles className="size-3.5 text-on-tertiary-container" strokeWidth={2.5} />}
                    {recommendation.tone === 'fail' && <ThumbsDown className="size-3.5 text-on-error-container" strokeWidth={2.5} />}
                    <p className="eyebrow">Đề xuất</p>
                  </div>
                  <h3 className="mt-0.5 font-display text-[19px] font-bold leading-tight text-on-surface">{recommendation.title}</h3>
                  <p className="mt-1 text-[12px] font-semibold leading-[1.45] text-on-surface-variant">{recommendation.text}</p>
                </div>
              </div>
            </div>

            {/* Scrollable body */}
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3.5">
              {/* Score counts */}
              <p className="eyebrow mb-2">Phân bố đánh giá</p>
              <div className="grid grid-cols-3 gap-2">
                <ScoreCount label="Đạt" value={stats.passCount} tone="pass" />
                <ScoreCount label="Trung bình" value={stats.neutralCount} tone="neutral" />
                <ScoreCount label="Chưa đạt" value={stats.failCount} tone="fail" />
              </div>

              {/* Progress info */}
              <div className="mt-3 flex items-center gap-2 rounded-2xl border border-outline-variant bg-surface-container-low/40 px-3 py-2.5">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary-fixed text-primary">
                  <ListChecks className="size-4" strokeWidth={2.5} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-on-surface-variant">Đã đánh giá</p>
                  <p className="font-mono text-[14px] font-black tabular-nums text-on-surface">
                    {stats.answered}<span className="text-on-surface-variant">/{totalQuestions}</span> câu
                  </p>
                </div>
                <div className="h-8 w-px bg-outline-variant/60" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-on-surface-variant">Còn lại</p>
                  <p className="font-mono text-[14px] font-black tabular-nums text-on-surface">
                    {totalQuestions - stats.answered} câu
                  </p>
                </div>
              </div>

              {/* Section breakdown */}
              <p className="eyebrow mb-2 mt-4">Theo nhóm câu hỏi</p>
              <div className="space-y-2">
                {sectionStats.map((stat) => (
                  <div key={stat.id} className="rounded-2xl border border-outline-variant bg-surface-container-low/40 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-[13px] font-black text-on-surface">
                        <span className="text-on-surface-variant">{stat.roman}.</span> {stat.title}
                      </p>
                      <span className="font-mono text-[10.5px] font-black tabular-nums text-on-surface-variant">
                        {stat.filled}/{stat.total}
                        {stat.pass > 0 && <span className="ml-1 text-primary">· {stat.pass}✓</span>}
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-container">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${stat.percent}%` }}
                        transition={{ duration: 0.5 }}
                        className="h-full rounded-full bg-primary"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="grid shrink-0 grid-cols-3 gap-2 border-t border-outline-variant bg-surface-container-low/40 p-3">
              <button
                type="button"
                onClick={() => copyText(buildReportText(), 'report')}
                className={cn(
                  'flex h-12 flex-col items-center justify-center gap-0.5 rounded-2xl border bg-surface text-on-surface-variant transition active:scale-95',
                  copyState === 'report'
                    ? 'border-primary bg-primary-fixed text-primary'
                    : 'border-outline-variant hover:border-primary/30 hover:text-primary'
                )}
              >
                {copyState === 'report' ? <CheckCircle2 className="size-4" strokeWidth={2.5} /> : <Download className="size-4" strokeWidth={2.5} />}
                <span className="text-[9.5px] font-black uppercase tracking-[0.1em]">{copyState === 'report' ? 'Đã copy' : 'Báo cáo'}</span>
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="flex h-12 flex-col items-center justify-center gap-0.5 rounded-2xl border border-outline-variant bg-surface text-on-surface-variant transition active:scale-95 hover:border-primary/30 hover:text-primary"
              >
                <Printer className="size-4" strokeWidth={2.5} />
                <span className="text-[9.5px] font-black uppercase tracking-[0.1em]">In</span>
              </button>
              <button
                type="button"
                onClick={() => setShowSummary(false)}
                className="flex h-12 flex-col items-center justify-center gap-0.5 rounded-2xl bg-primary text-on-primary shadow-md shadow-primary/25 transition active:scale-95 hover:bg-primary-container"
              >
                <Check className="size-4" strokeWidth={2.5} />
                <span className="text-[9.5px] font-black uppercase tracking-[0.1em]">Tiếp tục</span>
              </button>
            </div>
          </BottomSheet>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ───────────── COMPONENTS ───────────── */

function ScoreButton({
  active,
  tone,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  tone: NonNullable<Score>;
  icon: typeof ThumbsUp;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex h-10 items-center justify-center gap-1 rounded-xl border text-[11px] font-black uppercase tracking-[0.06em] transition active:scale-95',
        !active && 'border-outline-variant bg-surface text-on-surface-variant hover:border-primary/30',
        active && tone === 'pass' && 'border-primary bg-primary text-on-primary shadow-sm shadow-primary/25',
        active && tone === 'neutral' && 'border-tertiary/50 bg-tertiary-container text-on-tertiary-container shadow-sm',
        active && tone === 'fail' && 'border-error/40 bg-error-container text-on-error-container shadow-sm'
      )}
    >
      <Icon className="size-3.5" strokeWidth={2.5} />
      <span className="truncate">{label}</span>
    </button>
  );
}

function ScoreRing({ percent, tone }: { percent: number; tone: 'pass' | 'neutral' | 'fail' }) {
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const safePercent = Math.max(0, Math.min(100, percent));
  const offset = circumference - (safePercent / 100) * circumference;
  const trackClass =
    tone === 'pass'
      ? 'stroke-primary/15'
      : tone === 'neutral'
      ? 'stroke-tertiary/20'
      : 'stroke-error/20';
  const valueClass =
    tone === 'pass'
      ? 'stroke-primary'
      : tone === 'neutral'
      ? 'stroke-tertiary'
      : 'stroke-error';
  const textClass =
    tone === 'pass'
      ? 'text-primary'
      : tone === 'neutral'
      ? 'text-on-tertiary-container'
      : 'text-on-error-container';

  return (
    <div className="relative flex size-[70px] shrink-0 items-center justify-center rounded-full bg-surface shadow-sm ring-1 ring-outline-variant/40">
      <svg viewBox="0 0 80 80" className="absolute inset-0 size-full -rotate-90">
        <circle cx="40" cy="40" r={radius} fill="none" strokeWidth="6" className={trackClass} strokeLinecap="round" />
        <motion.circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          strokeWidth="6"
          strokeLinecap="round"
          className={valueClass}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="relative flex flex-col items-center leading-none">
        <span className={cn('font-mono text-[17px] font-black tabular-nums', textClass)}>{safePercent}</span>
        <span className="mt-0.5 text-[8px] font-black uppercase tracking-[0.16em] text-on-surface-variant">điểm</span>
      </div>
    </div>
  );
}

function ScoreCount({ label, value, tone }: { label: string; value: number; tone: NonNullable<Score> }) {
  return (
    <div
      className={cn(
        'rounded-2xl border p-2.5 text-center',
        tone === 'pass' && 'border-primary/20 bg-primary-fixed text-primary',
        tone === 'neutral' && 'border-tertiary/20 bg-tertiary-container/50 text-on-tertiary-container',
        tone === 'fail' && 'border-error/20 bg-error-container/50 text-on-error-container'
      )}
    >
      <div className="flex items-center justify-center gap-1">
        {tone === 'pass' && <ThumbsUp className="size-3.5" strokeWidth={2.5} />}
        {tone === 'neutral' && <Circle className="size-3.5" strokeWidth={2.5} />}
        {tone === 'fail' && <ThumbsDown className="size-3.5" strokeWidth={2.5} />}
        <p className="text-[9px] font-black uppercase tracking-[0.08em]">{label}</p>
      </div>
      <p className="mt-1 font-mono text-[20px] font-black leading-none tabular-nums">{value}</p>
    </div>
  );
}

function FloatingField({
  label,
  icon: Icon,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string;
  icon: typeof UserRound;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="eyebrow">{label}</span>
      <div className="relative mt-1.5">
        <Icon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" strokeWidth={2} />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-12 w-full rounded-2xl border border-outline-variant bg-surface pl-10 pr-3 text-[13.5px] font-bold text-on-surface outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
        />
      </div>
    </label>
  );
}

function FloatingSelect({
  label,
  icon: Icon,
  value,
  onChange,
  options,
}: {
  label: string;
  icon: typeof Briefcase;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <label className="block">
      <span className="eyebrow">{label}</span>
      <div className="relative mt-1.5">
        <Icon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" strokeWidth={2} />
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-12 w-full appearance-none rounded-2xl border border-outline-variant bg-surface pl-10 pr-9 text-[13.5px] font-bold text-on-surface outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
        >
          {options.map((opt) => (
            <option key={opt}>{opt}</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
      </div>
    </label>
  );
}

function BottomSheet({
  children,
  onClose,
  title,
  icon: Icon,
  tone,
  size = 'normal',
}: {
  children: ReactNode;
  onClose: () => void;
  title: string;
  icon: typeof Award;
  tone?: 'pass' | 'neutral' | 'fail';
  size?: 'normal' | 'large';
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 z-[80] flex items-end justify-center bg-black/55 backdrop-blur-sm md:items-center md:p-6 print:hidden"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%', opacity: 0.6 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          'relative w-full overflow-hidden rounded-t-3xl border border-b-0 border-outline-variant bg-surface shadow-[0_-12px_50px_rgba(0,0,0,0.16)] md:max-w-xl md:rounded-3xl md:border-b md:shadow-2xl',
          size === 'large' && 'max-h-[92vh] flex flex-col'
        )}
      >
        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-2.5 pb-1 md:hidden">
          <div className="h-1 w-10 rounded-full bg-outline-variant/70" />
        </div>

        <div className="flex items-center gap-3 px-4 pt-2 pb-3 md:pt-4">
          <div
            className={cn(
              'flex size-10 shrink-0 items-center justify-center rounded-xl shadow-sm',
              tone === 'pass' && 'bg-primary text-on-primary shadow-primary/25',
              tone === 'neutral' && 'bg-tertiary-container text-on-tertiary-container',
              tone === 'fail' && 'bg-error-container text-on-error-container',
              !tone && 'bg-primary text-on-primary shadow-primary/25'
            )}
          >
            <Icon className="size-5" strokeWidth={2.2} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="eyebrow">XOXO Luxury</p>
            <h3 className="mt-0.5 truncate font-display text-[18px] font-bold leading-tight text-on-surface">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-9 shrink-0 items-center justify-center rounded-full border border-outline-variant bg-surface text-on-surface-variant transition active:scale-90 hover:bg-surface-container-high hover:text-on-surface"
            aria-label="Đóng"
          >
            <X className="size-4" strokeWidth={2.5} />
          </button>
        </div>

        {children}
      </motion.div>
    </motion.div>
  );
}

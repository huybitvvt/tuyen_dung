import { useEffect, useMemo, useRef, useState } from 'react';
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
  ChevronUp,
  Circle,
  ClipboardCheck,
  ClipboardCopy,
  Crown,
  Download,
  FileText,
  HeartHandshake,
  ListChecks,
  Minus,
  MessageCircleQuestion,
  Pencil,
  Printer,
  RotateCcw,
  Search,
  Sparkles,
  Star,
  Target,
  ThumbsDown,
  ThumbsUp,
  TrendingUp,
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
  const [setupCollapsed, setSetupCollapsed] = useState(false);
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

  // Track which section is currently visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveId(visible.target.id);
      },
      { rootMargin: '-30% 0px -55% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] }
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
    const percent = answered ? Math.round((totalScore / answered) * 100) : 0;
    const overallPercent = Math.round((totalScore / totalQuestions) * 100);
    return { answered, passCount, neutralCount, failCount, percent, overallPercent };
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
    const headerOffset = 168; // sticky header + nav height
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
    <div className="page-shell max-w-5xl pb-32 md:pb-12">
      {/* Hero */}
      <section className="section-card relative overflow-hidden border-home-outline/80 hover:border-home-primary/20 hover:shadow-md hover:shadow-home-primary/10">
        <div className="absolute inset-0 -z-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/15" />
        <div className="absolute -right-24 -top-24 -z-0 size-72 rounded-full bg-secondary/15 blur-3xl" />
        <div className="absolute -left-16 -bottom-24 -z-0 size-64 rounded-full bg-primary/15 blur-3xl" />

        <div className="relative z-10 p-4 md:p-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <Link
                  to="/recruitment"
                  className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-on-surface-variant transition hover:text-primary"
                >
                  <ArrowLeft className="size-3.5" />
                  Tuyển dụng
                </Link>
                <div className="mt-2 flex items-center gap-2">
                  <Crown className="size-4 text-secondary" />
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-secondary">XOXO Luxury · Interview Kit</p>
                </div>
                <h1 className="mt-1 font-display text-[26px] font-bold leading-[1.1] tracking-tight text-on-surface md:text-[34px]">
                  Bộ câu hỏi phỏng vấn <span className="text-primary">Sale</span>
                </h1>
                <p className="mt-2 max-w-xl text-[12.5px] font-semibold leading-5 text-on-surface-variant md:text-[13px]">
                  {totalQuestions} câu hỏi chuẩn hoá · {sections.length} nhóm đánh giá · Thiết kế tối ưu cho điện thoại.
                </p>
              </div>

              <div className="hidden shrink-0 flex-col items-end gap-2 md:flex">
                <button
                  type="button"
                  onClick={() => copyText(buildQuestionsText(), 'copied')}
                  className={cn(
                    'btn-secondary flex h-9 items-center gap-1.5 print:hidden',
                    copyState === 'copied' && 'border-primary/30 bg-primary-fixed text-primary'
                  )}
                >
                  {copyState === 'copied' ? <CheckCircle2 className="size-4" /> : <ClipboardCopy className="size-4" />}
                  <span className="text-[11px]">{copyState === 'copied' ? 'Đã copy' : 'Copy câu hỏi'}</span>
                </button>
                <button type="button" onClick={handlePrint} className="btn-secondary flex h-9 items-center gap-1.5 print:hidden">
                  <Printer className="size-4" />
                  <span className="text-[11px]">In báo cáo</span>
                </button>
              </div>
            </div>

            {/* Setup card */}
            <div className="rounded-2xl border border-outline-variant bg-surface/80 backdrop-blur-sm shadow-sm print:hidden">
              <button
                type="button"
                onClick={() => setSetupCollapsed((v) => !v)}
                className="flex w-full items-center justify-between gap-3 px-4 py-3"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-on-primary shadow-sm shadow-primary/20">
                    <Pencil className="size-4" />
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="eyebrow">Buổi phỏng vấn</p>
                    <p className="mt-0.5 truncate text-[13px] font-black text-on-surface">
                      {session.candidateName || 'Nhập tên ứng viên'} · {formatDateVN(session.date)}
                    </p>
                  </div>
                </div>
                {setupCollapsed ? <ChevronDown className="size-4 text-on-surface-variant" /> : <ChevronUp className="size-4 text-on-surface-variant" />}
              </button>
              <AnimatePresence initial={false}>
                {!setupCollapsed && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="grid gap-3 border-t border-outline-variant/60 p-4 sm:grid-cols-2">
                      <label className="block">
                        <span className="eyebrow">Tên ứng viên</span>
                        <div className="relative mt-1.5">
                          <UserRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
                          <input
                            type="text"
                            value={session.candidateName}
                            onChange={(e) => updateField('candidateName', e.target.value)}
                            placeholder="VD: Nguyễn Thị Mai Anh"
                            className="h-11 w-full rounded-xl border border-outline-variant bg-surface pl-9 pr-3 text-sm font-bold text-on-surface outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                          />
                        </div>
                      </label>
                      <label className="block">
                        <span className="eyebrow">Vị trí</span>
                        <div className="relative mt-1.5">
                          <Briefcase className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
                          <select
                            value={session.position}
                            onChange={(e) => updateField('position', e.target.value)}
                            className="h-11 w-full appearance-none rounded-xl border border-outline-variant bg-surface pl-9 pr-9 text-sm font-bold text-on-surface outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                          >
                            <option>Sale Junior</option>
                            <option>Sale Senior</option>
                            <option>Sale Online</option>
                            <option>Sale Tại shop</option>
                            <option>Trưởng ca Sale</option>
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
                        </div>
                      </label>
                      <label className="block">
                        <span className="eyebrow">Ngày phỏng vấn</span>
                        <div className="relative mt-1.5">
                          <Calendar className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
                          <input
                            type="date"
                            value={session.date}
                            onChange={(e) => updateField('date', e.target.value)}
                            className="h-11 w-full rounded-xl border border-outline-variant bg-surface pl-9 pr-3 text-sm font-bold text-on-surface outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                          />
                        </div>
                      </label>
                      <label className="block">
                        <span className="eyebrow">Người phỏng vấn</span>
                        <div className="relative mt-1.5">
                          <UserRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
                          <input
                            type="text"
                            value={session.interviewer}
                            onChange={(e) => updateField('interviewer', e.target.value)}
                            placeholder="VD: Anh Huy"
                            className="h-11 w-full rounded-xl border border-outline-variant bg-surface pl-9 pr-3 text-sm font-bold text-on-surface outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                          />
                        </div>
                      </label>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky chip nav */}
      <div className="sticky top-12 z-30 -mx-3 print:hidden md:mx-0">
        <div className="border-y border-outline-variant/70 bg-home-bg/85 backdrop-blur-md md:rounded-2xl md:border md:shadow-sm">
          <div className="px-3 py-2 md:px-3.5">
            <div className="relative flex items-center gap-2">
              <div className="relative flex-1 min-w-0">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-on-surface-variant" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Tìm câu hỏi..."
                  className="h-9 w-full rounded-full border border-outline-variant bg-surface pl-8 pr-3 text-[12px] font-bold outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="absolute right-1.5 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high"
                    aria-label="Xoá tìm kiếm"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowSummary(true)}
                className="flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-primary px-3 text-[11px] font-black uppercase tracking-widest text-on-primary shadow-sm shadow-primary/20 transition hover:bg-primary-container active:scale-95"
              >
                <Award className="size-3.5" />
                Tổng kết
              </button>
            </div>
            <div ref={navRef} className="-mx-1 mt-2 flex gap-1.5 overflow-x-auto px-1 pb-0.5 scrollbar-hide snap-x snap-mandatory">
              {sections.map((section) => {
                const stat = sectionStats.find((s) => s.id === section.id);
                const isActive = activeId === section.id;
                return (
                  <button
                    key={section.id}
                    type="button"
                    data-chip={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={cn(
                      'shrink-0 snap-start rounded-full border px-3 py-1.5 text-[11px] font-black uppercase tracking-widest transition',
                      isActive
                        ? 'border-primary bg-primary text-on-primary shadow-sm shadow-primary/20'
                        : 'border-outline-variant bg-surface text-on-surface-variant hover:border-primary/30 hover:text-primary'
                    )}
                  >
                    <span className="mr-1.5 opacity-75">{section.roman}</span>
                    {section.title}
                    {stat && stat.filled > 0 && (
                      <span
                        className={cn(
                          'ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 font-mono text-[9px]',
                          isActive ? 'bg-on-primary/20 text-on-primary' : 'bg-primary-fixed text-primary'
                        )}
                      >
                        {stat.filled}/{stat.total}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="grid gap-3 md:gap-4">
        {filteredSections.map((section, sectionIndex) => {
          const Icon = section.icon;
          const stat = sectionStats.find((s) => s.id === section.id);
          return (
            <motion.section
              key={section.id}
              id={section.id}
              ref={(el) => { sectionRefs.current[section.id] = el; }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.32, delay: Math.min(sectionIndex * 0.04, 0.18), ease: [0.22, 1, 0.36, 1] }}
              className="section-card scroll-mt-44 overflow-hidden hover:border-home-primary/20 hover:shadow-md hover:shadow-home-primary/10"
            >
              <header className="relative overflow-hidden border-b border-outline-variant bg-gradient-to-br from-surface-container-low/60 to-surface p-4">
                <div className="flex items-start gap-3">
                  <div className={cn('flex size-12 shrink-0 items-center justify-center rounded-2xl shadow-sm ring-4', section.bgClass, section.ringClass)}>
                    <Icon className={cn('size-5', section.iconColorClass)} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={cn('font-display text-[14px] font-bold leading-none', section.iconColorClass)}>{section.roman}</span>
                      <span className="h-3 w-px bg-outline-variant" />
                      <p className="eyebrow">{section.questions.length} câu</p>
                    </div>
                    <h2 className="mt-1 font-display text-[19px] font-bold leading-tight text-on-surface md:text-[22px]">
                      {section.title}
                    </h2>
                    <p className="mt-1 text-[12px] font-semibold leading-5 text-on-surface-variant">{section.subtitle}</p>
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
                        <span className="font-mono text-[10px] font-black text-on-surface-variant">
                          {stat.filled}/{stat.total}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </header>

              <div className="px-3 pb-2 pt-1 text-[11px] font-semibold leading-5 text-on-surface-variant md:px-4">
                <span className="inline-flex items-start gap-1.5">
                  <Sparkles className="mt-0.5 size-3 shrink-0 text-secondary" />
                  <span>{section.hint}</span>
                </span>
              </div>

              <ol className="divide-y divide-outline-variant/60">
                {section.questions.map((question, questionIndex) => {
                  const key = `${section.id}::${question}`;
                  const score = session.scores[key];
                  const note = session.notes[key] || '';
                  const isOpen = openNote === key;
                  return (
                    <li key={key} className={cn('px-3 py-3 transition-colors md:px-4', score && 'bg-surface-container-low/40')}>
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            'mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg font-mono text-[11px] font-black ring-1 ring-inset',
                            score === 'pass' && 'bg-primary text-on-primary ring-primary',
                            score === 'neutral' && 'bg-tertiary-container text-on-tertiary-container ring-tertiary/30',
                            score === 'fail' && 'bg-error-container text-on-error-container ring-error/30',
                            !score && 'bg-surface ring-outline-variant text-on-surface-variant'
                          )}
                        >
                          {questionIndex + 1}
                        </div>
                        <p className="flex-1 text-[14px] font-semibold leading-6 text-on-surface md:text-[14.5px]">{question}</p>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-1.5 print:hidden">
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
                        <button
                          type="button"
                          onClick={() => setOpenNote(isOpen ? null : key)}
                          className={cn(
                            'ml-auto inline-flex h-8 items-center gap-1.5 rounded-full border px-2.5 text-[11px] font-black uppercase tracking-widest transition',
                            note
                              ? 'border-primary/30 bg-primary-fixed text-primary'
                              : 'border-outline-variant bg-surface text-on-surface-variant hover:border-primary/30 hover:text-primary'
                          )}
                          aria-label="Mở ghi chú"
                        >
                          <FileText className="size-3.5" />
                          <span className="hidden sm:inline">{note ? 'Có ghi chú' : 'Ghi chú'}</span>
                        </button>
                      </div>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                            className="mt-2 overflow-hidden print:hidden"
                          >
                            <textarea
                              value={note}
                              onChange={(e) => setNote(key, e.target.value)}
                              rows={2}
                              placeholder="Ghi chú nhanh về câu trả lời..."
                              autoFocus
                              className="w-full resize-y rounded-xl border border-outline-variant bg-surface p-3 text-[13px] font-medium leading-6 text-on-surface outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {note && !isOpen && (
                        <div className="mt-2 flex items-start gap-2 rounded-xl border border-primary/15 bg-primary-fixed/60 p-2.5">
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
            <p className="max-w-sm text-xs font-semibold text-on-surface-variant">Thử bỏ filter hoặc xoá ô tìm kiếm để xem lại toàn bộ.</p>
          </div>
        )}
      </div>

      {/* Mobile floating actions */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-outline-variant bg-surface/95 px-3 py-2.5 pb-safe shadow-2xl backdrop-blur-md print:hidden md:hidden">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetSession}
            className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-outline-variant bg-surface text-on-surface-variant transition hover:border-primary/30 hover:text-primary active:scale-95"
            aria-label="Bắt đầu mới"
          >
            <RotateCcw className="size-4" />
          </button>
          <div className="flex-1 rounded-xl border border-outline-variant bg-home-bg/60 px-3 py-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Tiến độ</span>
              <span className="font-mono text-[12px] font-black text-on-surface">
                {stats.answered}/{totalQuestions} · {stats.overallPercent}%
              </span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-container">
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
            className="flex h-11 shrink-0 items-center gap-1.5 rounded-xl bg-primary px-3.5 text-[11px] font-black uppercase tracking-widest text-on-primary shadow-lg shadow-primary/20 transition hover:bg-primary-container active:scale-95"
          >
            <Award className="size-4" />
            Kết quả
          </button>
        </div>
      </div>

      {/* Desktop bottom action bar */}
      <div className="sticky bottom-3 z-30 hidden print:hidden md:block">
        <div className="section-card flex items-center gap-3 border-home-outline/70 bg-surface/95 p-3 backdrop-blur shadow-md">
          <div className="flex flex-1 items-center gap-3">
            <div className="rounded-xl bg-primary-fixed p-2.5">
              <TrendingUp className="size-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="eyebrow">Tổng quan buổi PV</span>
                <span className="font-mono text-[11px] font-black text-on-surface">
                  {stats.answered}/{totalQuestions} câu · {stats.overallPercent}%
                </span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-container">
                <motion.div
                  initial={false}
                  animate={{ width: `${stats.overallPercent}%` }}
                  transition={{ duration: 0.4 }}
                  className="h-full rounded-full bg-gradient-to-r from-primary via-primary-container to-secondary"
                />
              </div>
            </div>
          </div>
          <button onClick={handleResetSession} className="btn-secondary flex h-9 items-center gap-1.5">
            <RotateCcw className="size-4" />
            <span className="text-[11px]">Bắt đầu mới</span>
          </button>
          <button onClick={() => setShowSummary(true)} className="btn-primary flex h-9 items-center gap-1.5">
            <Award className="size-4" />
            <span className="text-[11px]">Tổng kết</span>
          </button>
        </div>
      </div>

      {/* Summary modal */}
      <AnimatePresence>
        {showSummary && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[80] flex items-end justify-center bg-black/45 px-3 pb-3 pt-10 backdrop-blur-sm md:items-center md:p-6 print:hidden"
            onClick={() => setShowSummary(false)}
          >
            <motion.div
              initial={{ y: 32, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 32, opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-outline-variant bg-surface shadow-2xl"
            >
              <div
                className={cn(
                  'relative overflow-hidden border-b border-outline-variant px-5 py-5',
                  recommendation.tone === 'pass' && 'bg-gradient-to-br from-primary-fixed via-primary-fixed to-secondary-container',
                  recommendation.tone === 'neutral' && 'bg-gradient-to-br from-tertiary-container/50 to-secondary-container',
                  recommendation.tone === 'fail' && 'bg-gradient-to-br from-error-container/40 to-surface-container'
                )}
              >
                <div className="absolute -right-10 -top-10 size-40 rounded-full bg-white/40 blur-3xl" />
                <button
                  type="button"
                  onClick={() => setShowSummary(false)}
                  className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full border border-outline-variant bg-surface text-on-surface-variant transition hover:bg-surface-container-high hover:text-on-surface"
                >
                  <X className="size-4" />
                </button>
                <div className="relative flex items-start gap-3">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-surface text-primary shadow-sm ring-4 ring-primary/15">
                    {recommendation.tone === 'pass' && <Award className="size-6" />}
                    {recommendation.tone === 'neutral' && <Sparkles className="size-6" />}
                    {recommendation.tone === 'fail' && <ThumbsDown className="size-6" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="eyebrow">Tổng kết · {session.candidateName || 'Ứng viên'}</p>
                    <h3 className="mt-1 font-display text-2xl font-bold leading-tight text-on-surface">{recommendation.title}</h3>
                    <p className="mt-1.5 text-[13px] font-semibold leading-5 text-on-surface-variant">{recommendation.text}</p>
                  </div>
                </div>

                <div className="relative mt-4 grid grid-cols-3 gap-2">
                  <SummaryStat label="Tổng điểm" value={`${stats.overallPercent}%`} icon={TrendingUp} />
                  <SummaryStat label="Đã đánh giá" value={`${stats.answered}/${totalQuestions}`} icon={ListChecks} />
                  <SummaryStat label="Đạt" value={`${stats.passCount}`} icon={Star} highlight />
                </div>
              </div>

              <div className="max-h-[55vh] overflow-y-auto p-4">
                <div className="mb-3 grid grid-cols-3 gap-2 text-center">
                  <ScoreCount label="Đạt" value={stats.passCount} tone="pass" />
                  <ScoreCount label="Trung bình" value={stats.neutralCount} tone="neutral" />
                  <ScoreCount label="Chưa đạt" value={stats.failCount} tone="fail" />
                </div>

                <div className="space-y-2">
                  {sectionStats.map((stat) => (
                    <div key={stat.id} className="rounded-xl border border-outline-variant bg-surface-container-low/50 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="truncate text-[13px] font-black text-on-surface">
                          <span className="text-on-surface-variant">{stat.roman}.</span> {stat.title}
                        </p>
                        <span className="font-mono text-[11px] font-black text-on-surface-variant">
                          {stat.filled}/{stat.total} · {stat.pass} đạt
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

              <div className="grid grid-cols-2 gap-2 border-t border-outline-variant bg-surface-container-low/40 p-3 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() => copyText(buildReportText(), 'report')}
                  className={cn(
                    'btn-secondary col-span-2 flex h-11 items-center justify-center gap-1.5 sm:col-span-1',
                    copyState === 'report' && 'border-primary/30 bg-primary-fixed text-primary'
                  )}
                >
                  {copyState === 'report' ? <CheckCircle2 className="size-4" /> : <Download className="size-4" />}
                  <span className="text-[11px]">{copyState === 'report' ? 'Đã copy' : 'Copy báo cáo'}</span>
                </button>
                <button type="button" onClick={handlePrint} className="btn-secondary flex h-11 items-center justify-center gap-1.5">
                  <Printer className="size-4" />
                  <span className="text-[11px]">In</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowSummary(false)}
                  className="btn-primary flex h-11 items-center justify-center gap-1.5"
                >
                  <Check className="size-4" />
                  <span className="text-[11px]">Tiếp tục</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Print header */}
      <div className="hidden print:block fixed inset-x-0 top-0 border-b-2 border-primary bg-white p-4">
        <p className="text-[10px] font-black uppercase tracking-widest text-secondary">XOXO Luxury · Báo cáo phỏng vấn</p>
        <h1 className="mt-1 font-display text-xl font-bold">{session.candidateName || 'Ứng viên'} · {session.position}</h1>
        <p className="mt-0.5 text-[11px] font-semibold text-on-surface-variant">
          Ngày: {formatDateVN(session.date)} · Người PV: {session.interviewer || '________'} · Tổng điểm: {stats.overallPercent}/100
        </p>
      </div>
    </div>
  );
}

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
        'inline-flex h-8 flex-1 min-w-0 items-center justify-center gap-1.5 rounded-full border px-2.5 text-[11px] font-black uppercase tracking-widest transition active:scale-95 sm:flex-initial',
        !active && 'border-outline-variant bg-surface text-on-surface-variant hover:border-primary/30',
        active && tone === 'pass' && 'border-primary bg-primary text-on-primary shadow-sm shadow-primary/20',
        active && tone === 'neutral' && 'border-tertiary bg-tertiary-container text-on-tertiary-container',
        active && tone === 'fail' && 'border-error/40 bg-error-container text-on-error-container'
      )}
    >
      <Icon className="size-3.5" />
      <span>{label}</span>
    </button>
  );
}

function SummaryStat({ label, value, icon: Icon, highlight }: { label: string; value: string; icon: typeof TrendingUp; highlight?: boolean }) {
  return (
    <div className={cn('rounded-xl border bg-surface/80 p-2.5 backdrop-blur', highlight ? 'border-primary/30' : 'border-outline-variant')}>
      <div className="flex items-center gap-1.5">
        <Icon className={cn('size-3.5', highlight ? 'text-primary' : 'text-on-surface-variant')} />
        <span className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant">{label}</span>
      </div>
      <p className="mt-1 font-mono text-base font-black text-on-surface">{value}</p>
    </div>
  );
}

function ScoreCount({ label, value, tone }: { label: string; value: number; tone: NonNullable<Score> }) {
  return (
    <div
      className={cn(
        'rounded-xl border p-2.5',
        tone === 'pass' && 'border-primary/20 bg-primary-fixed text-primary',
        tone === 'neutral' && 'border-tertiary/20 bg-tertiary-container/50 text-on-tertiary-container',
        tone === 'fail' && 'border-error/20 bg-error-container/50 text-on-error-container'
      )}
    >
      <div className="flex items-center justify-center gap-1">
        {tone === 'pass' && <ThumbsUp className="size-3.5" />}
        {tone === 'neutral' && <Circle className="size-3.5" />}
        {tone === 'fail' && <ThumbsDown className="size-3.5" />}
        <p className="text-[10px] font-black uppercase tracking-widest">{label}</p>
      </div>
      <p className="mt-1 text-center font-mono text-xl font-black">{value}</p>
    </div>
  );
}

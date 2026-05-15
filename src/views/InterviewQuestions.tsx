import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  Briefcase,
  CheckCircle2,
  ClipboardCheck,
  ClipboardCopy,
  Copy,
  HeartHandshake,
  ListChecks,
  MessageCircleQuestion,
  Printer,
  Search,
  Sparkles,
  Star,
  Target,
  UserRound,
  Users,
  Zap,
} from 'lucide-react';
import { cn } from '../lib/utils';

type Section = {
  id: string;
  roman: string;
  title: string;
  subtitle: string;
  icon: typeof UserRound;
  accent: string;
  bg: string;
  ring: string;
  questions: string[];
};

const sections: Section[] = [
  {
    id: 'basic',
    roman: 'I',
    title: 'Thông tin cơ bản',
    subtitle: 'Phá băng, tìm hiểu nhanh về ứng viên',
    icon: UserRound,
    accent: 'text-primary',
    bg: 'bg-primary-fixed',
    ring: 'ring-primary/20',
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
    title: 'Đánh giá thái độ & tính cách',
    subtitle: 'Tinh thần, sự phù hợp văn hoá',
    icon: HeartHandshake,
    accent: 'text-secondary',
    bg: 'bg-secondary-container',
    ring: 'ring-secondary/20',
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
    icon: Briefcase,
    accent: 'text-tertiary',
    bg: 'bg-tertiary-container/40',
    ring: 'ring-tertiary/20',
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
    subtitle: 'Đánh giá tư duy xử lý và phản xạ',
    icon: Target,
    accent: 'text-primary',
    bg: 'bg-primary/10',
    ring: 'ring-primary/20',
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
    title: 'Đánh giá phù hợp với XOXO',
    subtitle: 'Sự yêu thích thương hiệu và môi trường',
    icon: Sparkles,
    accent: 'text-secondary',
    bg: 'bg-secondary-container',
    ring: 'ring-secondary/20',
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
    subtitle: 'Năng lực sẵn sàng và kỳ vọng',
    icon: ClipboardCheck,
    accent: 'text-tertiary',
    bg: 'bg-tertiary-container/40',
    ring: 'ring-tertiary/20',
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

function buildPlainText(filteredSections: Section[]) {
  return filteredSections
    .map((section) => {
      const heading = `${section.roman}. ${section.title.toUpperCase()}`;
      const body = section.questions.map((question, index) => `${index + 1}. ${question}`).join('\n');
      return `${heading}\n${body}`;
    })
    .join('\n\n');
}

export default function InterviewQuestions() {
  const [query, setQuery] = useState('');
  const [activeId, setActiveId] = useState<string>('all');
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);

  const filteredSections = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return sections
      .filter((section) => activeId === 'all' || activeId === section.id)
      .map((section) => ({
        ...section,
        questions: normalizedQuery
          ? section.questions.filter((question) => question.toLowerCase().includes(normalizedQuery))
          : section.questions,
      }))
      .filter((section) => section.questions.length > 0);
  }, [query, activeId]);

  const filteredCount = filteredSections.reduce((sum, section) => sum + section.questions.length, 0);
  const checkedCount = Object.values(checked).filter(Boolean).length;
  const progressPercent = totalQuestions ? Math.round((checkedCount / totalQuestions) * 100) : 0;

  function toggleQuestion(key: string) {
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handleCopyAll() {
    const text = buildPlainText(filteredSections);
    if (!text) return;
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    });
  }

  function handleCopyOne(question: string) {
    navigator.clipboard?.writeText(question);
  }

  function handlePrint() {
    window.print();
  }

  function resetChecks() {
    setChecked({});
  }

  return (
    <div className="page-shell max-w-6xl">
      <section className="section-card relative overflow-hidden border-home-outline/80 hover:border-home-primary/20 hover:shadow-md hover:shadow-home-primary/10">
        <div className="absolute inset-0 -z-0 bg-gradient-to-br from-primary/8 via-transparent to-secondary/10" />
        <div className="absolute -right-16 -top-16 -z-0 size-56 rounded-full bg-secondary/10 blur-3xl" />
        <div className="absolute -left-12 -bottom-20 -z-0 size-48 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-4 p-4 md:flex-row md:items-end md:justify-between md:p-6">
          <div className="min-w-0 max-w-2xl">
            <Link
              to="/recruitment"
              className="mb-3 inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-on-surface-variant transition hover:text-primary"
            >
              <ArrowLeft className="size-3.5" />
              Tuyển dụng
            </Link>
            <p className="eyebrow">Recruitment / Interview Kit</p>
            <h1 className="mt-1.5 text-xl font-black leading-tight text-on-surface md:text-3xl">
              Bộ câu hỏi phỏng vấn <span className="text-primary">Sale</span> – XOXO Luxury
            </h1>
            <p className="mt-2 max-w-xl text-xs font-semibold leading-5 text-on-surface-variant md:text-[13px]">
              {totalQuestions} câu hỏi chuẩn hoá theo 6 nhóm đánh giá. Tick từng câu khi đã hỏi để theo dõi tiến độ buổi phỏng vấn.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary-fixed px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary">
                <Star className="size-3" /> 6 nhóm
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-outline-variant bg-surface px-3 py-1 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                <MessageCircleQuestion className="size-3" /> {totalQuestions} câu
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-secondary/20 bg-secondary-container px-3 py-1 text-[10px] font-black uppercase tracking-widest text-on-secondary-container">
                <Zap className="size-3" /> Sale Junior
              </span>
            </div>
          </div>

          <div className="grid w-full max-w-sm grid-cols-2 gap-2 md:w-auto md:grid-cols-3">
            <button
              type="button"
              onClick={handleCopyAll}
              className={cn('btn-secondary flex h-10 items-center justify-center gap-1.5 print:hidden', copied && 'border-primary/30 bg-primary-fixed text-primary')}
            >
              {copied ? <CheckCircle2 className="size-4" /> : <ClipboardCopy className="size-4" />}
              <span className="text-[11px]">{copied ? 'Đã copy' : 'Copy'}</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="btn-secondary flex h-10 items-center justify-center gap-1.5 print:hidden"
            >
              <Printer className="size-4" />
              <span className="text-[11px]">In</span>
            </button>
            <button
              type="button"
              onClick={resetChecks}
              className="btn-primary col-span-2 flex h-10 items-center justify-center gap-1.5 print:hidden md:col-span-1"
            >
              <ListChecks className="size-4" />
              <span className="text-[11px]">Bắt đầu mới</span>
            </button>
          </div>
        </div>

        <div className="relative z-10 grid gap-px border-t border-outline-variant/70 bg-outline-variant/60 md:grid-cols-3">
          <div className="bg-surface p-4">
            <p className="eyebrow">Tiến độ buổi PV</p>
            <p className="mt-1 font-mono text-2xl font-black text-on-surface">{checkedCount}<span className="text-base text-on-surface-variant">/{totalQuestions}</span></p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-container">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="h-full rounded-full bg-gradient-to-r from-primary via-primary-container to-secondary"
              />
            </div>
          </div>
          <div className="bg-surface p-4">
            <p className="eyebrow">Đang hiển thị</p>
            <p className="mt-1 font-mono text-2xl font-black text-on-surface">{filteredCount}<span className="text-base text-on-surface-variant"> câu</span></p>
            <p className="mt-1 text-[11px] font-semibold text-on-surface-variant">Sau khi áp filter / tìm kiếm</p>
          </div>
          <div className="bg-surface p-4">
            <p className="eyebrow">Gợi ý</p>
            <p className="mt-1 text-xs font-bold leading-5 text-on-surface">Hỏi đầy đủ nhóm I → VI để có đánh giá toàn diện trước khi chốt offer.</p>
          </div>
        </div>
      </section>

      <section className="section-card flex flex-col gap-3 p-3.5 hover:border-home-primary/20 hover:shadow-md hover:shadow-home-primary/10 print:hidden md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm câu hỏi theo từ khoá: khách, giá, kinh nghiệm..."
            className="h-11 w-full rounded-lg border border-outline-variant bg-surface pl-10 pr-3 text-sm font-semibold outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
          />
        </div>
        <div className="-mx-1 flex flex-wrap gap-1.5 px-1 md:flex-nowrap md:overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveId('all')}
            className={cn(
              'shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-black uppercase tracking-widest transition',
              activeId === 'all'
                ? 'border-primary bg-primary text-on-primary shadow-sm shadow-primary/20'
                : 'border-outline-variant bg-surface text-on-surface-variant hover:border-primary/30 hover:text-primary'
            )}
          >
            Tất cả
          </button>
          {sections.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => setActiveId(section.id)}
              className={cn(
                'shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-black uppercase tracking-widest transition',
                activeId === section.id
                  ? 'border-primary bg-primary text-on-primary shadow-sm shadow-primary/20'
                  : 'border-outline-variant bg-surface text-on-surface-variant hover:border-primary/30 hover:text-primary'
              )}
            >
              {section.roman}. {section.title}
            </button>
          ))}
        </div>
      </section>

      <div className="grid gap-3 md:gap-4">
        {filteredSections.map((section, sectionIndex) => {
          const Icon = section.icon;
          return (
            <motion.section
              key={section.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: sectionIndex * 0.04, ease: [0.22, 1, 0.36, 1] }}
              className="section-card overflow-hidden hover:border-home-primary/20 hover:shadow-md hover:shadow-home-primary/10"
            >
              <header className="flex flex-col gap-3 border-b border-outline-variant bg-surface-container-low/40 p-3.5 md:flex-row md:items-center md:justify-between md:p-4">
                <div className="flex items-start gap-3">
                  <div className={cn('flex size-11 shrink-0 items-center justify-center rounded-xl shadow-sm ring-4', section.bg, section.ring)}>
                    <Icon className={cn('size-5', section.accent)} />
                  </div>
                  <div>
                    <p className={cn('eyebrow', section.accent)}>Phần {section.roman}</p>
                    <h2 className="mt-0.5 text-base font-black text-on-surface md:text-lg">{section.title}</h2>
                    <p className="mt-1 text-[11px] font-semibold leading-4 text-on-surface-variant md:text-xs">{section.subtitle}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-start md:self-auto">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-outline-variant bg-surface px-3 py-1 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                    <Users className="size-3" />
                    {section.questions.length} câu
                  </span>
                </div>
              </header>

              <ol className="divide-y divide-outline-variant/60">
                {section.questions.map((question, questionIndex) => {
                  const key = `${section.id}-${question}`;
                  const isChecked = !!checked[key];
                  return (
                    <li
                      key={key}
                      className={cn(
                        'group flex items-start gap-3 px-3.5 py-3 transition-colors hover:bg-surface-container-low/40 md:px-4',
                        isChecked && 'bg-primary-fixed/40'
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => toggleQuestion(key)}
                        aria-label={isChecked ? 'Bỏ đánh dấu câu hỏi' : 'Đánh dấu đã hỏi'}
                        className={cn(
                          'mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md border transition print:hidden',
                          isChecked
                            ? 'border-primary bg-primary text-on-primary shadow-sm shadow-primary/20'
                            : 'border-outline-variant bg-surface text-on-surface-variant hover:border-primary/40 hover:text-primary'
                        )}
                      >
                        {isChecked ? <CheckCircle2 className="size-4" /> : <span className="font-mono text-[11px] font-black">{questionIndex + 1}</span>}
                      </button>
                      <span className="hidden size-7 shrink-0 items-center justify-center rounded-md border border-outline-variant bg-surface font-mono text-[11px] font-black text-on-surface-variant print:flex">
                        {questionIndex + 1}
                      </span>
                      <p
                        className={cn(
                          'flex-1 text-[13px] font-semibold leading-6 text-on-surface md:text-sm',
                          isChecked && 'text-on-surface-variant line-through decoration-primary/40'
                        )}
                      >
                        {question}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleCopyOne(question)}
                        title="Copy câu hỏi"
                        className="ml-1 hidden size-8 shrink-0 items-center justify-center rounded-md border border-outline-variant bg-surface text-on-surface-variant opacity-0 transition group-hover:opacity-100 hover:border-primary/40 hover:text-primary print:hidden md:flex"
                      >
                        <Copy className="size-3.5" />
                      </button>
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
            <p className="max-w-sm text-xs font-semibold text-on-surface-variant">Thử bỏ filter hoặc xoá ô tìm kiếm để xem lại toàn bộ bộ câu hỏi.</p>
          </div>
        )}
      </div>
    </div>
  );
}

import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
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
  Pencil,
  Plus,
  Printer,
  RotateCcw,
  Save,
  Search,
  Settings2,
  Sparkles,
  Target,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  Undo2,
  UserRound,
  X,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useCrm, type CustomInterviewQuestionSet, type Department, type InterviewQuestionAddition, type InterviewQuestionOverride } from '../lib/crmStore';

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

const technicalSections: Section[] = [
  {
    id: 'tech-basic',
    roman: 'I',
    title: 'Thông tin & nền tảng kỹ thuật',
    subtitle: 'Làm rõ kinh nghiệm và cách học',
    hint: 'Ưu tiên câu trả lời rõ ràng, có ví dụ dự án hoặc tình huống thật.',
    icon: UserRound,
    iconColorClass: 'text-primary',
    barClass: 'bg-primary',
    bgClass: 'bg-primary-fixed',
    ringClass: 'ring-primary/15',
    questions: [
      'Em giới thiệu ngắn gọn về kinh nghiệm kỹ thuật gần nhất?',
      'Stack công nghệ em tự tin nhất là gì?',
      'Dự án nào em thấy thể hiện năng lực tốt nhất? Vì sao?',
      'Em thường đọc tài liệu và học công nghệ mới như thế nào?',
      'Em đã từng làm việc với Git, review code hoặc task management chưa?',
    ],
  },
  {
    id: 'tech-process',
    roman: 'II',
    title: 'Quy trình triển khai',
    subtitle: 'Tư duy làm việc có hệ thống',
    hint: 'Kiểm tra khả năng chia nhỏ việc, giao tiếp deadline và bàn giao.',
    icon: ClipboardCheck,
    iconColorClass: 'text-secondary',
    barClass: 'bg-secondary',
    bgClass: 'bg-secondary-container',
    ringClass: 'ring-secondary/15',
    questions: [
      'Khi nhận một yêu cầu chưa rõ, em sẽ hỏi lại những gì?',
      'Em thường estimate và báo tiến độ như thế nào?',
      'Nếu phát hiện yêu cầu có rủi ro kỹ thuật, em xử lý ra sao?',
      'Em kiểm tra lỗi trước khi bàn giao bằng cách nào?',
      'Em đã từng viết tài liệu hướng dẫn hoặc checklist nghiệm thu chưa?',
    ],
  },
  {
    id: 'tech-situation',
    roman: 'III',
    title: 'Tình huống kỹ thuật',
    subtitle: 'Debug, ưu tiên và xử lý áp lực',
    hint: 'Tập trung vào cách suy luận và khả năng tự kiểm chứng.',
    icon: Target,
    iconColorClass: 'text-tertiary',
    barClass: 'bg-tertiary',
    bgClass: 'bg-tertiary-container/50',
    ringClass: 'ring-tertiary/15',
    questions: [
      'Nếu production phát sinh lỗi sau deploy, em xử lý theo thứ tự nào?',
      'Nếu task bị trễ vì dependency từ người khác, em sẽ làm gì?',
      'Khi khách yêu cầu sửa gấp nhưng có thể ảnh hưởng hệ thống, em phản hồi sao?',
      'Em từng debug một lỗi khó nào? Quy trình em dùng là gì?',
      'Điểm mạnh và điểm cần cải thiện lớn nhất của em trong kỹ thuật là gì?',
    ],
  },
  {
    id: 'tech-fit',
    roman: 'IV',
    title: 'Phù hợp đội nhóm',
    subtitle: 'Thái độ và khả năng phối hợp',
    hint: 'Đánh giá sự chủ động, tinh thần ownership và cách trao đổi.',
    icon: HeartHandshake,
    iconColorClass: 'text-primary',
    barClass: 'bg-primary',
    bgClass: 'bg-primary/10',
    ringClass: 'ring-primary/15',
    questions: [
      'Em thích làm độc lập hay phối hợp nhóm hơn? Vì sao?',
      'Khi bị review code nhiều, em tiếp nhận như thế nào?',
      'Em mong muốn môi trường kỹ thuật như thế nào?',
      'Em có thể bắt đầu khi nào và lịch làm việc có ràng buộc gì không?',
    ],
  },
];

const marketingSections: Section[] = [
  {
    id: 'mkt-basic',
    roman: 'I',
    title: 'Thông tin & kinh nghiệm marketing',
    subtitle: 'Nền tảng nội dung và kênh triển khai',
    hint: 'Ưu tiên ứng viên nói được kết quả, kênh đã làm và vai trò cụ thể.',
    icon: UserRound,
    iconColorClass: 'text-primary',
    barClass: 'bg-primary',
    bgClass: 'bg-primary-fixed',
    ringClass: 'ring-primary/15',
    questions: [
      'Em giới thiệu ngắn gọn về kinh nghiệm marketing của mình?',
      'Em từng phụ trách kênh nào: Facebook, TikTok, SEO, ads hay CRM?',
      'Chiến dịch nào em thấy hiệu quả nhất? Vì sao?',
      'Em thường đo hiệu quả nội dung bằng chỉ số nào?',
      'Em có từng phối hợp với sale hoặc vận hành để tối ưu chuyển đổi chưa?',
    ],
  },
  {
    id: 'mkt-content',
    roman: 'II',
    title: 'Nội dung & thương hiệu',
    subtitle: 'Gu thẩm mỹ và khả năng kể chuyện',
    hint: 'Quan sát cách ứng viên hiểu khách hàng và chuyển ý tưởng thành nội dung.',
    icon: Sparkles,
    iconColorClass: 'text-secondary',
    barClass: 'bg-secondary',
    bgClass: 'bg-secondary-container',
    ringClass: 'ring-secondary/15',
    questions: [
      'Theo em một nội dung bán hàng tốt cần có gì?',
      'Em sẽ phân tích chân dung khách hàng như thế nào?',
      'Nếu một bài đăng không có tương tác, em sẽ điều chỉnh gì?',
      'Em có dùng Canva, CapCut hoặc công cụ AI nào không?',
      'Em đánh giá thế nào là một hình ảnh/nội dung đúng vibe thương hiệu?',
    ],
  },
  {
    id: 'mkt-situation',
    roman: 'III',
    title: 'Tình huống thực tế',
    subtitle: 'Phản xạ với dữ liệu và áp lực',
    hint: 'Tập trung vào khả năng ưu tiên và ra quyết định dựa trên số liệu.',
    icon: Target,
    iconColorClass: 'text-tertiary',
    barClass: 'bg-tertiary',
    bgClass: 'bg-tertiary-container/50',
    ringClass: 'ring-tertiary/15',
    questions: [
      'Nếu ngân sách ads thấp nhưng cần lead nhanh, em sẽ làm gì?',
      'Nếu khách comment tiêu cực trên fanpage, em xử lý ra sao?',
      'Nếu nội dung đẹp nhưng không ra chuyển đổi, em sẽ kiểm tra gì?',
      'Em sẽ lên kế hoạch nội dung 7 ngày cho một sản phẩm mới như thế nào?',
      'Em có thể làm việc theo deadline gấp và chỉnh sửa nhiều vòng không?',
    ],
  },
  {
    id: 'mkt-fit',
    roman: 'IV',
    title: 'Phù hợp đội nhóm',
    subtitle: 'Thái độ, chủ động và cam kết',
    hint: 'Chốt khả năng đi làm, học nhanh và phối hợp trong team nhỏ.',
    icon: HeartHandshake,
    iconColorClass: 'text-primary',
    barClass: 'bg-primary',
    bgClass: 'bg-primary/10',
    ringClass: 'ring-primary/15',
    questions: [
      'Em thích môi trường marketing có nhịp nhanh không?',
      'Khi ý tưởng của em bị góp ý hoặc đổi hướng, em phản ứng thế nào?',
      'Em mong muốn học thêm kỹ năng gì trong 3 tháng tới?',
      'Em có thể bắt đầu khi nào và lịch làm việc có ràng buộc gì không?',
    ],
  },
];

const questionSetMap: Record<Department, Section[]> = {
  Sale: sections,
  'Kỹ thuật': technicalSections,
  Marketing: marketingSections,
};

const questionSetOptions: Department[] = ['Sale', 'Kỹ thuật', 'Marketing'];
const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

const MAX_SCORE_PER_QUESTION = 10;
const PASS_THRESHOLD = 7; // điểm >= 7 → đạt
const NEUTRAL_THRESHOLD = 5; // 5-6 → trung bình; <5 → chưa đạt

type ScoreValue = number; // 0-10

interface SessionState {
  candidateId: string;
  candidateName: string;
  position: string;
  questionSet: string;
  date: string;
  interviewer: string;
  scores: Record<string, ScoreValue>;
  notes: Record<string, string>;
}

const STORAGE_KEY = 'xoxo-interview-session-v2';

const todayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const emptySession: SessionState = {
  candidateId: '',
  candidateName: '',
  position: 'Sale Junior',
  questionSet: 'Sale',
  date: todayIso(),
  interviewer: '',
  scores: {},
  notes: {},
};

function classifyScore(score: ScoreValue): 'pass' | 'neutral' | 'fail' {
  if (score >= PASS_THRESHOLD) return 'pass';
  if (score >= NEUTRAL_THRESHOLD) return 'neutral';
  return 'fail';
}

function scoreLabelText(score: ScoreValue): string {
  const cls = classifyScore(score);
  return cls === 'pass' ? 'Đạt' : cls === 'neutral' ? 'Trung bình' : 'Chưa đạt';
}

function loadSession(): SessionState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptySession;
    const parsed = JSON.parse(raw) as Partial<SessionState>;
    // Cleanup any non-numeric scores (legacy data)
    const cleanScores: Record<string, ScoreValue> = {};
    Object.entries(parsed.scores || {}).forEach(([k, v]) => {
      const num = typeof v === 'number' ? v : NaN;
      if (Number.isFinite(num) && num >= 0 && num <= MAX_SCORE_PER_QUESTION) {
        cleanScores[k] = num;
      }
    });
    return {
      ...emptySession,
      ...parsed,
      scores: cleanScores,
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

function customQuestionSetToSections(set: CustomInterviewQuestionSet): Section[] {
  return set.sections.map((section, index) => ({
    id: section.id,
    roman: romanNumerals[index] ?? String(index + 1),
    title: section.title,
    subtitle: `${set.title} · ${set.department}`,
    hint: 'Nhóm câu hỏi do khách tự tạo và có thể bổ sung thêm khi cần.',
    icon: ListChecks,
    iconColorClass: 'text-primary',
    barClass: 'bg-primary',
    bgClass: 'bg-primary-fixed',
    ringClass: 'ring-primary/15',
    questions: section.questions,
  }));
}

function applyQuestionOverrides(baseSections: Section[], overrides: InterviewQuestionOverride[]): Section[] {
  if (!overrides.length) return baseSections;

  return baseSections.map((section) => {
    const sectionOverrides = overrides.filter((override) => override.sectionId === section.id);
    if (!sectionOverrides.length) return section;

    return {
      ...section,
      questions: section.questions
        .map((question) => {
          const override = sectionOverrides.find((item) => item.originalQuestion === question);
          if (!override) return question;
          return override.action === 'delete' ? null : override.question ?? question;
        })
        .filter((question): question is string => Boolean(question)),
    };
  }).filter((section) => section.questions.length > 0);
}

function mergeQuestionAdditions(baseSections: Section[], additions: InterviewQuestionAddition[]): Section[] {
  if (!additions.length) return baseSections;

  const nextSections = baseSections.map((section) => ({ ...section, questions: [...section.questions] }));
  additions.forEach((addition) => {
    const matchedSection = nextSections.find(
      (section) => section.title.toLowerCase() === addition.sectionTitle.toLowerCase()
    );

    if (matchedSection) {
      matchedSection.questions.push(addition.question);
      return;
    }

    const index = nextSections.length;
    nextSections.push({
      id: `custom-${addition.setId}-${addition.id}`,
      roman: romanNumerals[index] ?? String(index + 1),
      title: addition.sectionTitle,
      subtitle: 'Câu hỏi bổ sung',
      hint: 'Nhóm câu hỏi được bổ sung trực tiếp vào bộ hiện tại.',
      icon: FileText,
      iconColorClass: 'text-primary',
      barClass: 'bg-primary',
      bgClass: 'bg-primary-fixed',
      ringClass: 'ring-primary/15',
      questions: [addition.question],
    });
  });

  return nextSections;
}

export default function InterviewQuestions() {
  const [searchParams] = useSearchParams();
  const {
    candidates,
    recruitmentJobs,
    customInterviewQuestionSets,
    interviewQuestionAdditions,
    interviewQuestionOverrides,
    saveInterviewAssessment,
    createInterviewQuestionSet,
    addInterviewQuestion,
    updateInterviewQuestionSet,
    deleteInterviewQuestionSet,
    updateInterviewQuestionAddition,
    deleteInterviewQuestionAddition,
    editInterviewQuestion,
    deleteInterviewQuestion,
    restoreInterviewQuestion,
  } = useCrm();
  const [session, setSession] = useState<SessionState>(() => loadSession());
  const [query, setQuery] = useState('');
  const [activeId, setActiveId] = useState<string>(sections[0].id);
  const [openNote, setOpenNote] = useState<string | null>(null);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'report'>('idle');
  const [saveState, setSaveState] = useState<'idle' | 'saved'>('idle');
  const [showSetup, setShowSetup] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showCreateSet, setShowCreateSet] = useState(false);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [showManageQuestions, setShowManageQuestions] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [setForm, setSetForm] = useState({
    title: '',
    department: 'Sale' as Department,
    sectionTitle: 'Thông tin cơ bản',
    questions: [''],
  });
  const [questionForm, setQuestionForm] = useState({
    setId: '',
    sectionTitle: 'Câu hỏi thêm',
    question: '',
  });
  const [setDrafts, setSetDrafts] = useState<Record<string, { title: string; department: Department }>>({});
  const [baseQuestionDrafts, setBaseQuestionDrafts] = useState<Record<string, string>>({});
  const [additionDrafts, setAdditionDrafts] = useState<Record<string, { sectionTitle: string; question: string }>>({});
  const [formError, setFormError] = useState('');

  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const navRef = useRef<HTMLDivElement>(null);
  const activeCustomSet = customInterviewQuestionSets.find((set) => set.id === session.questionSet);
  const baseSections = useMemo(
    () =>
      activeCustomSet
        ? customQuestionSetToSections(activeCustomSet)
        : questionSetMap[session.questionSet as Department] ?? sections,
    [activeCustomSet, session.questionSet]
  );
  const activeOverrides = useMemo(
    () => (interviewQuestionOverrides ?? []).filter((override) => override.setId === session.questionSet),
    [interviewQuestionOverrides, session.questionSet]
  );
  const activeAdditions = useMemo(
    () => (interviewQuestionAdditions ?? []).filter((addition) => addition.setId === session.questionSet),
    [interviewQuestionAdditions, session.questionSet]
  );
  const activeSections = useMemo(() => {
    return mergeQuestionAdditions(applyQuestionOverrides(baseSections, activeOverrides), activeAdditions);
  }, [activeAdditions, activeOverrides, baseSections]);
  const totalQuestions = useMemo(
    () => activeSections.reduce((sum, section) => sum + section.questions.length, 0),
    [activeSections]
  );
  const activeQuestionSetLabel = activeCustomSet?.title ?? session.questionSet;

  const selectedCandidate = candidates.find((candidate) => candidate.id === session.candidateId);

  // Persist session
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch {
      /* noop */
    }
  }, [session]);

  useEffect(() => {
    const candidateId = searchParams.get('candidate');
    if (!candidateId) return;
    const candidate = candidates.find((item) => item.id === candidateId);
    if (!candidate) return;
    const job = recruitmentJobs.find((item) => item.id === candidate.jobId);
    setSession((prev) => {
      const isNewCandidate = prev.candidateId !== candidateId;
      return {
        ...prev,
        candidateId,
        candidateName: candidate.name,
        position: job?.title ?? prev.position,
        questionSet: job?.department ?? prev.questionSet,
        scores: isNewCandidate ? {} : prev.scores,
        notes: isNewCandidate ? {} : prev.notes,
      };
    });
  }, [searchParams, candidates, recruitmentJobs]);

  useEffect(() => {
    if (activeSections.some((section) => section.id === activeId)) return;
    setActiveId(activeSections[0]?.id ?? '');
  }, [activeId, activeSections]);

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
  }, [activeSections]);

  // Auto-scroll active chip into view
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const target = nav.querySelector<HTMLElement>(`[data-chip="${activeId}"]`);
    if (!target) return;

    const targetCenter = target.offsetLeft + target.offsetWidth / 2;
    const nextLeft = targetCenter - nav.clientWidth / 2;
    nav.scrollTo({
      left: Math.max(0, nextLeft),
      behavior: 'smooth',
    });
  }, [activeId]);

  // Lock body scroll when modal open
  useEffect(() => {
    if (showSummary || showSetup || showResetConfirm || showCreateSet || showAddQuestion || showManageQuestions) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showSummary, showSetup, showResetConfirm, showCreateSet, showAddQuestion, showManageQuestions]);

  const filteredSections = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return activeSections;
    return activeSections
      .map((section) => ({
        ...section,
        questions: section.questions.filter((q) => q.toLowerCase().includes(normalizedQuery)),
      }))
      .filter((section) => section.questions.length > 0);
  }, [query, activeSections]);

  const stats = useMemo(() => {
    const entries = Object.entries(session.scores) as Array<[string, ScoreValue]>;
    const answered = entries.length;
    let totalScore = 0;
    let passCount = 0;
    let neutralCount = 0;
    let failCount = 0;
    entries.forEach(([, v]) => {
      totalScore += v;
      const cls = classifyScore(v);
      if (cls === 'pass') passCount++;
      else if (cls === 'neutral') neutralCount++;
      else failCount++;
    });
    const maxPossible = totalQuestions * MAX_SCORE_PER_QUESTION;
    const overallPercent = maxPossible ? Math.round((totalScore / maxPossible) * 100) : 0;
    const averageScore = answered ? totalScore / answered : 0;
    return { answered, passCount, neutralCount, failCount, totalScore, overallPercent, averageScore };
  }, [session.scores, totalQuestions]);

  const sectionStats = useMemo(() => {
    return activeSections.map((section) => {
      const keys = section.questions.map((q) => `${section.id}::${q}`);
      const scoredKeys = keys.filter((k) => k in session.scores);
      const filled = scoredKeys.length;
      const pass = scoredKeys.filter((k) => classifyScore(session.scores[k]) === 'pass').length;
      const totalScore = scoredKeys.reduce((sum, k) => sum + (session.scores[k] || 0), 0);
      const maxScore = section.questions.length * MAX_SCORE_PER_QUESTION;
      return {
        id: section.id,
        title: section.title,
        roman: section.roman,
        total: section.questions.length,
        filled,
        pass,
        totalScore,
        maxScore,
        percent: maxScore ? Math.round((totalScore / maxScore) * 100) : 0,
        fillPercent: section.questions.length ? Math.round((filled / section.questions.length) * 100) : 0,
      };
    });
  }, [session.scores, activeSections]);

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
  }, [stats, totalQuestions]);

  function updateField<K extends keyof SessionState>(key: K, value: SessionState[K]) {
    setSession((prev) => ({ ...prev, [key]: value }));
  }

  function selectCandidate(candidateId: string) {
    const candidate = candidates.find((item) => item.id === candidateId);
    const job = candidate ? recruitmentJobs.find((item) => item.id === candidate.jobId) : undefined;
    setSession((prev) => ({
      ...prev,
      candidateId,
      candidateName: candidate?.name ?? '',
      position: job?.title ?? prev.position,
      questionSet: job?.department ?? prev.questionSet,
      scores: prev.candidateId !== candidateId ? {} : prev.scores,
      notes: prev.candidateId !== candidateId ? {} : prev.notes,
    }));
  }

  function selectAnyQuestionSet(questionSet: string) {
    setSession((prev) => ({
      ...prev,
      questionSet,
      scores: prev.questionSet !== questionSet ? {} : prev.scores,
      notes: prev.questionSet !== questionSet ? {} : prev.notes,
    }));
  }

  function openAddQuestionSheet() {
    const defaultSetId = session.questionSet || 'Sale';
    setQuestionForm((current) => ({
      ...current,
      setId: defaultSetId,
      sectionTitle: activeSections[0]?.title ?? current.sectionTitle,
    }));
    setFormError('');
    setShowAddQuestion(true);
  }

  function openManageQuestionSheet() {
    setSetDrafts(
      customInterviewQuestionSets.reduce<Record<string, { title: string; department: Department }>>((drafts, set) => {
        drafts[set.id] = { title: set.title, department: set.department };
        return drafts;
      }, {})
    );
    setBaseQuestionDrafts(() => {
      const drafts: Record<string, string> = {};
      baseSections.forEach((section) => {
        section.questions.forEach((question) => {
          const key = `${session.questionSet}::${section.id}::${question}`;
          const override = activeOverrides.find(
            (item) => item.sectionId === section.id && item.originalQuestion === question
          );
          drafts[key] = override?.action === 'edit' ? override.question ?? question : question;
        });
      });
      return drafts;
    });
    setAdditionDrafts(
      activeAdditions.reduce<Record<string, { sectionTitle: string; question: string }>>((drafts, addition) => {
        drafts[addition.id] = { sectionTitle: addition.sectionTitle, question: addition.question };
        return drafts;
      }, {})
    );
    setFormError('');
    setShowManageQuestions(true);
  }

  function saveSetDraft(setId: string) {
    const draft = setDrafts[setId];
    if (!draft?.title.trim()) {
      setFormError('Tên bộ câu hỏi không được để trống.');
      return;
    }
    updateInterviewQuestionSet(setId, draft);
    setFormError('');
  }

  function saveBaseQuestion(sectionId: string, originalQuestion: string) {
    const key = `${session.questionSet}::${sectionId}::${originalQuestion}`;
    const draft = baseQuestionDrafts[key]?.trim();
    if (!draft) {
      setFormError('Nội dung câu hỏi không được để trống.');
      return;
    }
    editInterviewQuestion(session.questionSet, sectionId, originalQuestion, draft);
    setFormError('');
  }

  function saveAddition(additionId: string) {
    const draft = additionDrafts[additionId];
    if (!draft?.question.trim()) {
      setFormError('Nội dung câu hỏi bổ sung không được để trống.');
      return;
    }
    updateInterviewQuestionAddition(additionId, draft);
    setFormError('');
  }

  function submitQuestionSet(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const questions = setForm.questions
      .map((question) => question.trim())
      .filter(Boolean);

    if (!setForm.title.trim()) {
      setFormError('Vui lòng nhập tên bộ câu hỏi.');
      return;
    }
    if (!questions.length) {
      setFormError('Vui lòng nhập ít nhất 1 câu hỏi, mỗi dòng là 1 câu.');
      return;
    }

    const created = createInterviewQuestionSet({
      title: setForm.title,
      department: setForm.department,
      sectionTitle: setForm.sectionTitle,
      questions,
    });
    selectAnyQuestionSet(created.id);
    setSetForm({ title: '', department: 'Sale', sectionTitle: 'Thông tin cơ bản', questions: [''] });
    setFormError('');
    setShowCreateSet(false);
  }

  function submitQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!questionForm.setId) {
      setFormError('Vui lòng chọn bộ câu hỏi cần thêm.');
      return;
    }
    if (!questionForm.question.trim()) {
      setFormError('Vui lòng nhập nội dung câu hỏi.');
      return;
    }
    addInterviewQuestion(questionForm.setId, questionForm.sectionTitle, questionForm.question);
    selectAnyQuestionSet(questionForm.setId);
    setQuestionForm((current) => ({ ...current, question: '' }));
    setFormError('');
    setShowAddQuestion(false);
  }

  function setScore(key: string, value: ScoreValue | null) {
    setSession((prev) => {
      const next = { ...prev.scores };
      if (value === null || value === undefined) {
        delete next[key];
      } else {
        const clamped = Math.max(0, Math.min(MAX_SCORE_PER_QUESTION, Math.round(value)));
        next[key] = clamped;
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
    setShowResetConfirm(true);
  }

  function confirmResetSession() {
    setSession({ ...emptySession, date: todayIso(), candidateId: session.candidateId, candidateName: session.candidateName, position: session.position, questionSet: session.questionSet });
    setOpenNote(null);
    setShowSummary(false);
    setShowResetConfirm(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function buildQuestionsText() {
    return activeSections
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
    lines.push(`Tổng điểm  : ${stats.totalScore}/${totalQuestions * MAX_SCORE_PER_QUESTION} (${stats.overallPercent}%)`);
    lines.push(`Đã chấm   : ${stats.answered}/${totalQuestions} câu`);
    lines.push(`Đạt: ${stats.passCount} | Trung bình: ${stats.neutralCount} | Chưa đạt: ${stats.failCount}`);
    lines.push('');
    lines.push(`KẾT LUẬN: ${recommendation.title.toUpperCase()}`);
    lines.push(recommendation.text);
    lines.push('');
    lines.push('───────────────────────────────────────');
    lines.push('');

    activeSections.forEach((section) => {
      lines.push(`${section.roman}. ${section.title.toUpperCase()}`);
      lines.push('');
      section.questions.forEach((q, idx) => {
        const key = `${section.id}::${q}`;
        const score = session.scores[key];
        const note = session.notes[key];
        const hasScore = key in session.scores;
        const scoreText = hasScore ? `[${score}/10 — ${scoreLabelText(score)}]` : '[Chưa chấm điểm]';
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

  function saveAssessmentToCandidate() {
    if (!session.candidateId) {
      setShowSetup(true);
      return;
    }
    saveInterviewAssessment({
      candidateId: session.candidateId,
      questionSet: session.questionSet,
      interviewer: session.interviewer,
      scorePercent: stats.overallPercent,
      answered: stats.answered,
      totalQuestions,
      recommendationTitle: recommendation.title,
      recommendationText: recommendation.text,
      reportText: buildReportText(),
    });
    setSaveState('saved');
    window.setTimeout(() => setSaveState('idle'), 1800);
  }

  return (
    <div className="page-shell !max-w-3xl">
      {/* PRINT HEADER (flows in document flow on print) */}
      <div className="print-header hidden print:block">
        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#f59e0b]">XOXO Luxury · Báo cáo phỏng vấn</p>
        <h1 className="mt-1.5 font-display text-[22px] font-bold leading-tight text-[#0f172a]">
          {session.candidateName || 'Ứng viên'}
        </h1>
        <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] font-semibold text-[#475569]">
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
            <span className="text-primary"> {activeQuestionSetLabel}</span>
          </h1>

          <p className="mt-2 max-w-md text-[12.5px] font-semibold leading-5 text-on-surface-variant md:text-[13px]">
            {totalQuestions} câu · {activeSections.length} nhóm đánh giá · Lưu kết quả theo hồ sơ ứng viên.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setFormError('');
                setShowCreateSet(true);
              }}
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary px-3 text-[10.5px] font-black uppercase tracking-[0.12em] text-on-primary shadow-sm shadow-primary/25 transition hover:bg-primary-container active:scale-95"
            >
              <Plus className="size-3.5" strokeWidth={2.5} />
              Tạo bộ mới
            </button>
            <button
              type="button"
              onClick={openAddQuestionSheet}
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-outline-variant bg-surface/90 px-3 text-[10.5px] font-black uppercase tracking-[0.12em] text-on-surface-variant shadow-sm transition hover:border-primary/30 hover:bg-primary-fixed/40 hover:text-primary active:scale-95"
              title="Thêm câu hỏi vào bộ câu hỏi tự tạo"
            >
              <FileText className="size-3.5" strokeWidth={2.5} />
              Thêm vào bộ
            </button>
            <button
              type="button"
              onClick={openManageQuestionSheet}
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-outline-variant bg-surface/90 px-3 text-[10.5px] font-black uppercase tracking-[0.12em] text-on-surface-variant shadow-sm transition hover:border-primary/30 hover:bg-primary-fixed/40 hover:text-primary active:scale-95"
              title="Sửa hoặc xóa bộ câu hỏi/câu hỏi hiện tại"
            >
              <Settings2 className="size-3.5" strokeWidth={2.5} />
              Quản lý bộ
            </button>
          </div>
        </div>

        {/* Compact session bar */}
        <div className="relative z-10 mx-3 mb-3 rounded-2xl border border-outline-variant bg-surface/85 p-2.5 shadow-sm backdrop-blur-sm md:mx-6 md:mb-5 md:p-3 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-container text-on-primary shadow-sm shadow-primary/20">
              <UserRound className="size-5" strokeWidth={2.5} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[9.5px] font-black uppercase tracking-[0.16em] text-on-surface-variant">
                {selectedCandidate ? 'Gắn từ Kanban' : 'Ứng viên'} · {session.position}
              </p>
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
              onClick={handleResetSession}
              className="hidden size-9 shrink-0 items-center justify-center rounded-full border border-outline-variant bg-surface text-on-surface-variant transition active:scale-90 hover:border-primary/30 hover:text-primary sm:flex"
              aria-label="Bắt đầu mới"
            >
              <RotateCcw className="size-3.5" strokeWidth={2.5} />
            </button>
            <div className="hidden min-w-[132px] rounded-full border border-outline-variant bg-surface px-3 py-1.5 md:block">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[9px] font-black uppercase tracking-[0.12em] text-on-surface-variant">Tiến độ</span>
                <span className="font-mono text-[10.5px] font-black text-on-surface">
                  {stats.answered}/{totalQuestions}
                </span>
              </div>
              <div className="mt-1 h-1 overflow-hidden rounded-full bg-surface-container">
                <motion.div
                  initial={false}
                  animate={{ width: `${stats.overallPercent}%` }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full rounded-full bg-primary"
                />
              </div>
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
            {activeSections.map((section) => {
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
                  const hasScore = key in session.scores;
                  const note = session.notes[key] || '';
                  const isOpen = openNote === key;
                  const cls = hasScore ? classifyScore(score) : null;
                  return (
                    <li
                      key={key}
                      className={cn(
                        'px-3 py-3.5 transition-colors md:px-4',
                        hasScore && 'bg-surface-container-low/40'
                      )}
                    >
                      <div className="flex items-start gap-2.5">
                        <div
                          className={cn(
                            'mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg font-mono text-[11px] font-black ring-1 ring-inset transition-colors',
                            cls === 'pass' && 'bg-primary text-on-primary ring-primary',
                            cls === 'neutral' && 'bg-tertiary-container text-on-tertiary-container ring-tertiary/30',
                            cls === 'fail' && 'bg-error-container text-on-error-container ring-error/30',
                            !hasScore && 'bg-surface ring-outline-variant text-on-surface-variant'
                          )}
                        >
                          {questionIndex + 1}
                        </div>
                        <p className="flex-1 text-[14px] font-semibold leading-[1.55] text-on-surface md:text-[14.5px]">
                          {question}
                        </p>
                        {hasScore && (
                          <div
                            className={cn(
                              'shrink-0 rounded-lg border px-2 py-0.5 text-center font-mono text-[12px] font-black tabular-nums',
                              cls === 'pass' && 'border-primary/30 bg-primary-fixed text-primary',
                              cls === 'neutral' && 'border-tertiary/30 bg-tertiary-container text-on-tertiary-container',
                              cls === 'fail' && 'border-error/30 bg-error-container text-on-error-container'
                            )}
                          >
                            {score}/10
                          </div>
                        )}
                      </div>

                      {/* Score selector — chấm điểm 0-10 */}
                      <div className="mt-3 print:hidden">
                        <div className="mb-1.5 flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-[0.14em] text-on-surface-variant">
                            Chấm điểm
                          </span>
                          {hasScore && (
                            <button
                              type="button"
                              onClick={() => setScore(key, null)}
                              className="text-[10px] font-bold text-on-surface-variant transition hover:text-error"
                            >
                              Xoá điểm
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-11 gap-1">
                          {Array.from({ length: 11 }, (_, i) => i).map((point) => {
                            const isActive = score === point;
                            const pointCls = classifyScore(point);
                            return (
                              <button
                                key={point}
                                type="button"
                                onClick={() => setScore(key, point)}
                                aria-label={`Chấm ${point} điểm`}
                                className={cn(
                                  'flex h-9 items-center justify-center rounded-lg border font-mono text-[11px] font-black tabular-nums transition active:scale-90',
                                  !isActive && 'border-outline-variant bg-surface text-on-surface-variant hover:border-primary/40 hover:text-primary',
                                  isActive && pointCls === 'pass' && 'border-primary bg-primary text-on-primary shadow-sm shadow-primary/25',
                                  isActive && pointCls === 'neutral' && 'border-tertiary bg-tertiary-container text-on-tertiary-container shadow-sm',
                                  isActive && pointCls === 'fail' && 'border-error bg-error-container text-on-error-container shadow-sm'
                                )}
                              >
                                {point}
                              </button>
                            );
                          })}
                        </div>
                        <div className="mt-1.5 flex items-center justify-between text-[9.5px] font-bold text-on-surface-variant/80">
                          <span>0 — chưa đạt</span>
                          <span className="hidden sm:inline">5-6 — trung bình</span>
                          <span>10 — xuất sắc</span>
                        </div>
                      </div>

                      {/* Note toggle */}
                      <div className="mt-2.5 print:hidden">
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
                          Điểm: {hasScore ? `${score}/10 (${scoreLabelText(score)})` : '__________'}
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

      {/* SETUP BOTTOM SHEET */}
      <AnimatePresence>
        {showSetup && (
          <BottomSheet onClose={() => setShowSetup(false)} title="Thông tin buổi phỏng vấn" icon={Pencil}>
            <div className="grid gap-3 p-4 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="eyebrow">Ứng viên từ Kanban</span>
                <div className="relative mt-1.5">
                  <UserRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" strokeWidth={2} />
                  <select
                    value={session.candidateId}
                    onChange={(event) => selectCandidate(event.target.value)}
                    className="h-12 w-full appearance-none rounded-2xl border border-outline-variant bg-surface pl-10 pr-9 text-[13.5px] font-bold text-on-surface outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                  >
                    <option value="">Chọn ứng viên để lưu kết quả vào hồ sơ</option>
                    {candidates.map((candidate) => {
                      const job = recruitmentJobs.find((item) => item.id === candidate.jobId);
                      return (
                        <option key={candidate.id} value={candidate.id}>
                          {candidate.name} · {job?.title ?? 'Chưa gán vị trí'}
                        </option>
                      );
                    })}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
                </div>
              </label>
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
                options={[
                  'Sale Junior',
                  'Sale Senior',
                  'Sale Online',
                  'Sale Tại shop',
                  'Trưởng ca Sale',
                  'Frontend Developer',
                  'Kỹ thuật viên',
                  'Marketing Executive',
                  'Content Marketing',
                ]}
              />
              <label className="block">
                <span className="eyebrow">Bộ câu hỏi</span>
                <div className="relative mt-1.5">
                  <ListChecks className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" strokeWidth={2} />
                  <select
                    value={session.questionSet}
                    onChange={(event) => selectAnyQuestionSet(event.target.value)}
                    className="h-12 w-full appearance-none rounded-2xl border border-outline-variant bg-surface pl-10 pr-9 text-[13.5px] font-bold text-on-surface outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                  >
                    {questionSetOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                    {customInterviewQuestionSets.map((set) => (
                      <option key={set.id} value={set.id}>
                        {set.title} · {set.department}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
                </div>
              </label>
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

      {/* RESET CONFIRM */}
      <AnimatePresence>
        {showResetConfirm && (
          <BottomSheet onClose={() => setShowResetConfirm(false)} title="Làm mới buổi phỏng vấn" icon={RotateCcw}>
            <div className="border-t border-outline-variant bg-tertiary-container/45 px-4 py-4">
              <p className="text-[13px] font-bold leading-6 text-on-surface">
                Bắt đầu lại buổi phỏng vấn hiện tại?
              </p>
              <p className="mt-1 text-[12px] font-semibold leading-5 text-on-surface-variant">
                Toàn bộ điểm và ghi chú đang chấm sẽ được xóa. Thông tin ứng viên, vị trí và bộ câu hỏi vẫn được giữ lại.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 border-t border-outline-variant bg-surface-container-low/40 p-3">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="h-12 rounded-2xl border border-outline-variant bg-surface text-[11px] font-black uppercase tracking-[0.12em] text-on-surface-variant transition hover:bg-surface-container-high active:scale-95"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={confirmResetSession}
                className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-primary text-[11px] font-black uppercase tracking-[0.12em] text-on-primary shadow-md shadow-primary/25 transition hover:bg-primary-container active:scale-95"
              >
                <RotateCcw className="size-4" strokeWidth={2.5} />
                Làm mới
              </button>
            </div>
          </BottomSheet>
        )}
      </AnimatePresence>

      {/* CREATE QUESTION SET */}
      <AnimatePresence>
        {showCreateSet && (
          <BottomSheet onClose={() => setShowCreateSet(false)} title="Tạo bộ câu hỏi" icon={ListChecks}>
            <form onSubmit={submitQuestionSet}>
              <div className="border-t border-outline-variant bg-primary-fixed/45 px-4 py-3">
                <p className="text-[12px] font-semibold leading-5 text-on-primary-fixed">
                  Dùng khi khách muốn tạo một bộ câu hỏi riêng cho bộ phận hoặc vòng phỏng vấn mới.
                </p>
              </div>
              <div className="grid gap-3 p-4 sm:grid-cols-2">
                <FloatingField
                  label="Tên bộ câu hỏi"
                  icon={ListChecks}
                  value={setForm.title}
                  onChange={(value) => {
                    setSetForm((current) => ({ ...current, title: value }));
                    setFormError('');
                  }}
                  placeholder="VD: Bộ câu hỏi Kỹ thuật vòng 2"
                />
                <FloatingSelect
                  label="Bộ phận"
                  icon={Briefcase}
                  value={setForm.department}
                  onChange={(value) => setSetForm((current) => ({ ...current, department: value as Department }))}
                  options={questionSetOptions}
                />
                <FloatingField
                  label="Tên nhóm đầu tiên"
                  icon={FileText}
                  value={setForm.sectionTitle}
                  onChange={(value) => setSetForm((current) => ({ ...current, sectionTitle: value }))}
                  placeholder="VD: Kiến thức chuyên môn"
                />
                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="eyebrow">Danh sách câu hỏi</span>
                    <button
                      type="button"
                      onClick={() => setSetForm((current) => ({ ...current, questions: [...current.questions, ''] }))}
                      className="inline-flex h-8 items-center gap-1 rounded-lg border border-outline-variant bg-surface px-2.5 text-[10px] font-black uppercase tracking-[0.10em] text-on-surface-variant transition hover:border-primary/30 hover:text-primary active:scale-95"
                    >
                      <Plus className="size-3.5" strokeWidth={2.5} />
                      Thêm ô
                    </button>
                  </div>
                  <div className="mt-2 space-y-2">
                    {setForm.questions.map((question, index) => (
                      <div key={index} className="rounded-2xl border border-outline-variant bg-surface-container-low/35 p-2">
                        <div className="mb-1.5 flex items-center justify-between gap-2">
                          <span className="font-mono text-[10px] font-black uppercase tracking-[0.12em] text-on-surface-variant">
                            Câu {index + 1}
                          </span>
                          {setForm.questions.length > 1 && (
                            <button
                              type="button"
                              onClick={() =>
                                setSetForm((current) => ({
                                  ...current,
                                  questions: current.questions.filter((_, itemIndex) => itemIndex !== index),
                                }))
                              }
                              className="text-[10px] font-black uppercase tracking-[0.10em] text-error transition hover:opacity-75"
                            >
                              Xóa
                            </button>
                          )}
                        </div>
                        <textarea
                          value={question}
                          onChange={(event) => {
                            const value = event.target.value;
                            setSetForm((current) => ({
                              ...current,
                              questions: current.questions.map((item, itemIndex) => (itemIndex === index ? value : item)),
                            }));
                            setFormError('');
                          }}
                          rows={3}
                          placeholder="Nhập nội dung câu hỏi. Câu dài có thể xuống nhiều dòng trong cùng ô này."
                          className="w-full resize-y rounded-xl border border-outline-variant bg-surface p-3 text-[13.5px] font-semibold leading-6 text-on-surface outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                {formError && (
                  <div className="rounded-2xl border border-error/25 bg-error-container px-3 py-2 text-[12px] font-bold text-on-error-container sm:col-span-2">
                    {formError}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 border-t border-outline-variant bg-surface-container-low/40 p-3">
                <button
                  type="button"
                  onClick={() => setShowCreateSet(false)}
                  className="h-12 rounded-2xl border border-outline-variant bg-surface text-[11px] font-black uppercase tracking-[0.12em] text-on-surface-variant transition hover:bg-surface-container-high active:scale-95"
                >
                  Hủy
                </button>
                <button type="submit" className="btn-primary flex h-12 items-center justify-center gap-2">
                  <Check className="size-4" strokeWidth={2.5} />
                  <span className="text-[12px]">Tạo bộ</span>
                </button>
              </div>
            </form>
          </BottomSheet>
        )}
      </AnimatePresence>

      {/* ADD QUESTION */}
      <AnimatePresence>
        {showAddQuestion && (
          <BottomSheet onClose={() => setShowAddQuestion(false)} title="Thêm câu hỏi" icon={FileText}>
            <form onSubmit={submitQuestion}>
              <div className="border-t border-outline-variant bg-surface-container-low/60 px-4 py-3">
                <p className="text-[12px] font-semibold leading-5 text-on-surface-variant">
                  Dùng để bổ sung câu hỏi vào bộ đang mở hoặc bất kỳ bộ câu hỏi nào đã có.
                </p>
              </div>
              <div className="grid gap-3 p-4">
                <label className="block">
                  <span className="eyebrow">Bộ câu hỏi nhận thêm</span>
                  <div className="relative mt-1.5">
                    <ListChecks className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" strokeWidth={2} />
                    <select
                      value={questionForm.setId}
                      onChange={(event) => {
                        const nextSetId = event.target.value;
                        const customSet = customInterviewQuestionSets.find((set) => set.id === nextSetId);
                        const baseSections = customSet
                          ? customQuestionSetToSections(customSet)
                          : questionSetMap[nextSetId as Department] ?? sections;
                        setQuestionForm((current) => ({
                          ...current,
                          setId: nextSetId,
                          sectionTitle: baseSections[0]?.title ?? current.sectionTitle,
                        }));
                        setFormError('');
                      }}
                      className="h-12 w-full appearance-none rounded-2xl border border-outline-variant bg-surface pl-10 pr-9 text-[13.5px] font-bold text-on-surface outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                    >
                      {questionSetOptions.map((option) => (
                        <option key={option} value={option}>
                          {option} · bộ mặc định
                        </option>
                      ))}
                      {customInterviewQuestionSets.map((set) => (
                        <option key={set.id} value={set.id}>
                          {set.title} · {set.department}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
                  </div>
                </label>
                <FloatingField
                  label="Nhóm câu hỏi"
                  icon={FileText}
                  value={questionForm.sectionTitle}
                  onChange={(value) => setQuestionForm((current) => ({ ...current, sectionTitle: value }))}
                  placeholder="VD: Tình huống chuyên môn"
                />
                <div className="rounded-2xl border border-outline-variant bg-surface-container-low/35 p-2">
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] font-black uppercase tracking-[0.12em] text-on-surface-variant">
                      Câu hỏi mới
                    </span>
                  </div>
                  <textarea
                    value={questionForm.question}
                    onChange={(event) => {
                      setQuestionForm((current) => ({ ...current, question: event.target.value }));
                      setFormError('');
                    }}
                    rows={3}
                    placeholder="Nhập nội dung câu hỏi. Câu dài có thể xuống nhiều dòng trong cùng ô này."
                    className="w-full resize-y rounded-xl border border-outline-variant bg-surface p-3 text-[13.5px] font-semibold leading-6 text-on-surface outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                  />
                </div>
                {formError && (
                  <div className="rounded-2xl border border-error/25 bg-error-container px-3 py-2 text-[12px] font-bold text-on-error-container">
                    {formError}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 border-t border-outline-variant bg-surface-container-low/40 p-3">
                <button
                  type="button"
                  onClick={() => setShowAddQuestion(false)}
                  className="h-12 rounded-2xl border border-outline-variant bg-surface text-[11px] font-black uppercase tracking-[0.12em] text-on-surface-variant transition hover:bg-surface-container-high active:scale-95"
                >
                  Hủy
                </button>
                <button type="submit" className="btn-primary flex h-12 items-center justify-center gap-2">
                  <Plus className="size-4" strokeWidth={2.5} />
                  <span className="text-[12px]">Thêm câu hỏi</span>
                </button>
              </div>
            </form>
          </BottomSheet>
        )}
      </AnimatePresence>

      {/* MANAGE QUESTION SET */}
      <AnimatePresence>
        {showManageQuestions && (
          <BottomSheet onClose={() => setShowManageQuestions(false)} title="Quản lý bộ câu hỏi" icon={Settings2} size="large">
            <div className="border-t border-outline-variant bg-primary-fixed/45 px-4 py-3">
              <p className="text-[12px] font-semibold leading-5 text-on-primary-fixed">
                Có thể sửa/xóa câu hỏi trong bộ đang mở. Bộ tự tạo có thể đổi tên, đổi bộ phận hoặc xóa hẳn.
              </p>
            </div>

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
              {formError && (
                <div className="rounded-2xl border border-error/25 bg-error-container px-3 py-2 text-[12px] font-bold text-on-error-container">
                  {formError}
                </div>
              )}

              <section className="rounded-2xl border border-outline-variant bg-surface overflow-hidden">
                <header className="border-b border-outline-variant bg-surface-container-low/50 px-3 py-2.5">
                  <p className="eyebrow">Bộ câu hỏi tự tạo</p>
                  <h3 className="text-[14px] font-black text-on-surface">Đổi tên hoặc xóa bộ riêng</h3>
                </header>
                {customInterviewQuestionSets.length > 0 ? (
                  <div className="divide-y divide-outline-variant/50">
                    {customInterviewQuestionSets.map((set) => {
                      const draft = setDrafts[set.id] ?? { title: set.title, department: set.department };
                      return (
                        <div key={set.id} className="grid gap-2 p-3 sm:grid-cols-[1fr_150px_auto] sm:items-end">
                          <label className="block">
                            <span className="eyebrow">Tên bộ</span>
                            <input
                              value={draft.title}
                              onChange={(event) =>
                                setSetDrafts((current) => ({
                                  ...current,
                                  [set.id]: { ...draft, title: event.target.value },
                                }))
                              }
                              className="mt-1.5 h-11 w-full rounded-xl border border-outline-variant bg-surface px-3 text-[13px] font-bold text-on-surface outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                            />
                          </label>
                          <label className="block">
                            <span className="eyebrow">Bộ phận</span>
                            <select
                              value={draft.department}
                              onChange={(event) =>
                                setSetDrafts((current) => ({
                                  ...current,
                                  [set.id]: { ...draft, department: event.target.value as Department },
                                }))
                              }
                              className="mt-1.5 h-11 w-full rounded-xl border border-outline-variant bg-surface px-3 text-[13px] font-bold text-on-surface outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                            >
                              {questionSetOptions.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          </label>
                          <div className="grid grid-cols-2 gap-2 sm:w-[190px]">
                            <button
                              type="button"
                              onClick={() => saveSetDraft(set.id)}
                              className="inline-flex h-11 items-center justify-center gap-1 rounded-xl bg-primary px-3 text-[10px] font-black uppercase tracking-[0.10em] text-on-primary transition active:scale-95 hover:bg-primary-container"
                            >
                              <Save className="size-3.5" strokeWidth={2.5} />
                              Lưu
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (session.questionSet === set.id) selectAnyQuestionSet(set.department);
                                deleteInterviewQuestionSet(set.id);
                              }}
                              className="inline-flex h-11 items-center justify-center gap-1 rounded-xl border border-error/30 bg-error-container px-3 text-[10px] font-black uppercase tracking-[0.10em] text-on-error-container transition active:scale-95 hover:opacity-85"
                            >
                              <Trash2 className="size-3.5" strokeWidth={2.5} />
                              Xóa
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="px-3 py-4 text-[12px] font-semibold text-on-surface-variant">
                    Chưa có bộ tự tạo. Bộ mặc định vẫn có thể sửa/xóa từng câu ở phần dưới.
                  </p>
                )}
              </section>

              <section className="rounded-2xl border border-outline-variant bg-surface overflow-hidden">
                <header className="border-b border-outline-variant bg-surface-container-low/50 px-3 py-2.5">
                  <p className="eyebrow">Bộ đang mở</p>
                  <h3 className="text-[14px] font-black text-on-surface">
                    {activeQuestionSetLabel} · sửa/xóa từng câu
                  </h3>
                </header>
                <div className="space-y-3 p-3">
                  {baseSections.map((section) => (
                    <div key={section.id} className="rounded-2xl border border-outline-variant bg-surface-container-low/35 p-2.5">
                      <p className="mb-2 text-[11px] font-black uppercase tracking-[0.14em] text-on-surface-variant">
                        {section.roman}. {section.title}
                      </p>
                      <div className="space-y-2">
                        {section.questions.map((question, index) => {
                          const key = `${session.questionSet}::${section.id}::${question}`;
                          const override = activeOverrides.find(
                            (item) => item.sectionId === section.id && item.originalQuestion === question
                          );
                          const isDeleted = override?.action === 'delete';
                          return (
                            <div
                              key={key}
                              className={cn(
                                'rounded-xl border bg-surface p-2 transition',
                                isDeleted ? 'border-error/25 opacity-70' : 'border-outline-variant'
                              )}
                            >
                              <div className="mb-1.5 flex items-center justify-between gap-2">
                                <span className="font-mono text-[10px] font-black uppercase tracking-[0.12em] text-on-surface-variant">
                                  Câu {index + 1}
                                </span>
                                {override && (
                                  <span className="rounded-full bg-primary-fixed px-2 py-0.5 text-[9.5px] font-black uppercase tracking-[0.10em] text-primary">
                                    {isDeleted ? 'Đã ẩn' : 'Đã sửa'}
                                  </span>
                                )}
                              </div>
                              <textarea
                                value={baseQuestionDrafts[key] ?? question}
                                disabled={isDeleted}
                                onChange={(event) =>
                                  setBaseQuestionDrafts((current) => ({
                                    ...current,
                                    [key]: event.target.value,
                                  }))
                                }
                                rows={3}
                                className="w-full resize-y rounded-xl border border-outline-variant bg-surface p-3 text-[13px] font-semibold leading-6 text-on-surface outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:bg-surface-container-low disabled:text-on-surface-variant"
                              />
                              <div className="mt-2 flex flex-wrap justify-end gap-2">
                                {override ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      restoreInterviewQuestion(session.questionSet, section.id, question);
                                      setBaseQuestionDrafts((current) => ({ ...current, [key]: question }));
                                    }}
                                    className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-outline-variant bg-surface px-3 text-[10px] font-black uppercase tracking-[0.10em] text-on-surface-variant transition hover:border-primary/30 hover:text-primary active:scale-95"
                                  >
                                    <Undo2 className="size-3.5" strokeWidth={2.5} />
                                    Khôi phục
                                  </button>
                                ) : null}
                                {!isDeleted && (
                                  <button
                                    type="button"
                                    onClick={() => saveBaseQuestion(section.id, question)}
                                    className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-primary px-3 text-[10px] font-black uppercase tracking-[0.10em] text-on-primary transition hover:bg-primary-container active:scale-95"
                                  >
                                    <Save className="size-3.5" strokeWidth={2.5} />
                                    Lưu câu
                                  </button>
                                )}
                                {!isDeleted && (
                                  <button
                                    type="button"
                                    onClick={() => deleteInterviewQuestion(session.questionSet, section.id, question)}
                                    className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-error/30 bg-error-container px-3 text-[10px] font-black uppercase tracking-[0.10em] text-on-error-container transition hover:opacity-85 active:scale-95"
                                  >
                                    <Trash2 className="size-3.5" strokeWidth={2.5} />
                                    Xóa câu
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-outline-variant bg-surface overflow-hidden">
                <header className="border-b border-outline-variant bg-surface-container-low/50 px-3 py-2.5">
                  <p className="eyebrow">Câu hỏi bổ sung</p>
                  <h3 className="text-[14px] font-black text-on-surface">Sửa/xóa các câu đã thêm vào bộ hiện tại</h3>
                </header>
                {activeAdditions.length > 0 ? (
                  <div className="space-y-2 p-3">
                    {activeAdditions.map((addition) => {
                      const draft = additionDrafts[addition.id] ?? {
                        sectionTitle: addition.sectionTitle,
                        question: addition.question,
                      };
                      return (
                        <div key={addition.id} className="rounded-xl border border-outline-variant bg-surface-container-low/35 p-2.5">
                          <input
                            value={draft.sectionTitle}
                            onChange={(event) =>
                              setAdditionDrafts((current) => ({
                                ...current,
                                [addition.id]: { ...draft, sectionTitle: event.target.value },
                              }))
                            }
                            className="h-10 w-full rounded-xl border border-outline-variant bg-surface px-3 text-[12.5px] font-bold text-on-surface outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                            placeholder="Nhóm câu hỏi"
                          />
                          <textarea
                            value={draft.question}
                            onChange={(event) =>
                              setAdditionDrafts((current) => ({
                                ...current,
                                [addition.id]: { ...draft, question: event.target.value },
                              }))
                            }
                            rows={3}
                            className="mt-2 w-full resize-y rounded-xl border border-outline-variant bg-surface p-3 text-[13px] font-semibold leading-6 text-on-surface outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                          />
                          <div className="mt-2 flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => saveAddition(addition.id)}
                              className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-primary px-3 text-[10px] font-black uppercase tracking-[0.10em] text-on-primary transition hover:bg-primary-container active:scale-95"
                            >
                              <Save className="size-3.5" strokeWidth={2.5} />
                              Lưu
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteInterviewQuestionAddition(addition.id)}
                              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-error/30 bg-error-container px-3 text-[10px] font-black uppercase tracking-[0.10em] text-on-error-container transition hover:opacity-85 active:scale-95"
                            >
                              <Trash2 className="size-3.5" strokeWidth={2.5} />
                              Xóa
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="px-3 py-4 text-[12px] font-semibold text-on-surface-variant">
                    Chưa có câu hỏi bổ sung trong bộ này.
                  </p>
                )}
              </section>
            </div>

            <div className="border-t border-outline-variant bg-surface-container-low/40 p-3">
              <button
                type="button"
                onClick={() => setShowManageQuestions(false)}
                className="btn-primary flex h-12 w-full items-center justify-center gap-2"
              >
                <Check className="size-4" strokeWidth={2.5} />
                <span className="text-[12px]">Xong</span>
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
            <div className="grid shrink-0 grid-cols-2 gap-2 border-t border-outline-variant bg-surface-container-low/40 p-3 sm:grid-cols-4">
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
                onClick={saveAssessmentToCandidate}
                className={cn(
                  'flex h-12 flex-col items-center justify-center gap-0.5 rounded-2xl border bg-surface transition active:scale-95',
                  saveState === 'saved'
                    ? 'border-primary bg-primary-fixed text-primary'
                    : 'border-outline-variant text-on-surface-variant hover:border-primary/30 hover:text-primary'
                )}
              >
                {saveState === 'saved' ? <CheckCircle2 className="size-4" strokeWidth={2.5} /> : <Save className="size-4" strokeWidth={2.5} />}
                <span className="text-[9.5px] font-black uppercase tracking-[0.1em]">
                  {saveState === 'saved' ? 'Đã lưu' : 'Lưu hồ sơ'}
                </span>
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

function ScoreCount({ label, value, tone }: { label: string; value: number; tone: 'pass' | 'neutral' | 'fail' }) {
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

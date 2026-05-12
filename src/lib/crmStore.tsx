import React, { createContext, useContext, useMemo, useState } from 'react';

export type Department = 'Sale' | 'Kỹ thuật' | 'Marketing';
export type LessonType = 'video' | 'document';
export type EnrollmentStatus = 'chưa học' | 'đang học' | 'hoàn thành';
export type CandidateStage =
  | 'new'
  | 'screened'
  | 'interview_scheduled'
  | 'interviewed'
  | 'technical_test'
  | 'decision'
  | 'offer'
  | 'probation'
  | 'official'
  | 'rejected';

export const candidateStages: Array<{ id: CandidateStage; label: string }> = [
  { id: 'new', label: 'Mới ứng tuyển' },
  { id: 'screened', label: 'Đã sàng lọc' },
  { id: 'interview_scheduled', label: 'Hẹn phỏng vấn' },
  { id: 'interviewed', label: 'Đã phỏng vấn' },
  { id: 'technical_test', label: 'Test chuyên môn' },
  { id: 'decision', label: 'Chờ quyết định' },
  { id: 'offer', label: 'Nhận việc' },
  { id: 'probation', label: 'Thử việc' },
  { id: 'official', label: 'Chính thức' },
  { id: 'rejected', label: 'Loại' },
];

export interface Employee {
  id: string;
  name: string;
  role: string;
  department: Department;
}

export interface Course {
  id: string;
  name: string;
  department: Department;
  level: 'Cơ bản' | 'Trung cấp' | 'Nâng cao';
  description: string;
  assignedRoles: string[];
  assignedUsers: string[];
  kpiLeadEligible: boolean;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  type: LessonType;
  contentUrl: string;
  duration: number;
  documentPages?: number;
}

export interface Enrollment {
  userId: string;
  courseId: string;
  status: EnrollmentStatus;
}

export interface Progress {
  userId: string;
  lessonId: string;
  percent: number;
  secondsWatched: number;
  completed: boolean;
}

export interface Quiz {
  id: string;
  courseId: string;
}

export interface Question {
  id: string;
  quizId: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface Result {
  id: string;
  userId: string;
  quizId: string;
  score: number;
  passed: boolean;
  submittedAt: string;
}

export interface RecruitmentJob {
  id: string;
  title: string;
  department: Department;
  quantityNeeded: number;
  quantityHired: number;
  status: 'Đang mở' | 'Tạm dừng' | 'Đã đóng';
}

export interface Candidate {
  id: string;
  name: string;
  phone: string;
  email: string;
  jobId: string;
  source: string;
  stage: CandidateStage;
  notes: string;
  cvFileName: string;
  createdAt: string;
}

export interface CandidateActivity {
  id: string;
  candidateId: string;
  text: string;
  fromStage?: CandidateStage;
  toStage?: CandidateStage;
  createdAt: string;
}

export interface CandidateInterview {
  id: string;
  candidateId: string;
  scheduledAt: string;
  interviewer: string;
  result?: 'Đạt' | 'Không đạt' | 'Cần cân nhắc';
  notes?: string;
}

export interface CandidateFile {
  id: string;
  candidateId: string;
  name: string;
  url: string;
}

interface CrmState {
  employees: Employee[];
  courses: Course[];
  lessons: Lesson[];
  enrollments: Enrollment[];
  progress: Progress[];
  quizzes: Quiz[];
  questions: Question[];
  results: Result[];
  recruitmentJobs: RecruitmentJob[];
  candidates: Candidate[];
  candidateActivities: CandidateActivity[];
  candidateInterviews: CandidateInterview[];
  candidateFiles: CandidateFile[];
}

interface CrmContextValue extends CrmState {
  currentUser: Employee;
  createCourse: (course: Omit<Course, 'id'>) => void;
  assignCourse: (courseId: string, target: string) => void;
  updateLessonProgress: (lessonId: string, percent: number, secondsWatched?: number) => void;
  submitQuiz: (quizId: string, answers: Record<string, number>) => Result;
  createRecruitmentJob: (job: Omit<RecruitmentJob, 'id' | 'quantityHired'>) => void;
  createCandidate: (candidate: Omit<Candidate, 'id' | 'stage' | 'createdAt'>) => void;
  moveCandidateStage: (candidateId: string, toStage: CandidateStage) => void;
  scheduleInterview: (candidateId: string, scheduledAt: string, interviewer: string) => void;
  recordInterviewResult: (interviewId: string, result: CandidateInterview['result'], notes: string) => void;
  resetDemoData: () => void;
}

const STORAGE_KEY = 'xoxo-crm-training-recruitment-v1';
const currentUserId = 'u1';

function nowIso() {
  return new Date().toISOString();
}

function id(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function createSeedState(): CrmState {
  return {
    employees: [
      { id: 'u1', name: 'Nguyễn Văn A', role: 'Sale', department: 'Sale' },
      { id: 'u2', name: 'Trần Thị B', role: 'Kỹ thuật', department: 'Kỹ thuật' },
      { id: 'u3', name: 'Lê Minh C', role: 'Marketing', department: 'Marketing' },
    ],
    courses: [
      {
        id: 'c1',
        name: 'Kỹ năng chốt deal',
        department: 'Sale',
        level: 'Cơ bản',
        description: 'Chuẩn hóa kỹ năng xử lý từ chối, tư vấn giá trị và chốt giao dịch cho đội Sale.',
        assignedRoles: ['Sale'],
        assignedUsers: ['u1'],
        kpiLeadEligible: true,
      },
      {
        id: 'c2',
        name: 'Quy trình triển khai kỹ thuật',
        department: 'Kỹ thuật',
        level: 'Nâng cao',
        description: 'Tài liệu hóa quy trình triển khai, nghiệm thu và bàn giao kỹ thuật.',
        assignedRoles: ['Kỹ thuật'],
        assignedUsers: ['u2'],
        kpiLeadEligible: false,
      },
      {
        id: 'c3',
        name: 'SEO Strategy 2026',
        department: 'Marketing',
        level: 'Trung cấp',
        description: 'Khung lập kế hoạch SEO, đo lường nội dung và tối ưu chuyển đổi.',
        assignedRoles: ['Marketing'],
        assignedUsers: ['u3'],
        kpiLeadEligible: false,
      },
    ],
    lessons: [
      { id: 'l1', courseId: 'c1', title: 'Tổng quan quy trình bán hàng', type: 'video', contentUrl: 'https://example.com/sales-flow.mp4', duration: 600 },
      { id: 'l2', courseId: 'c1', title: 'Tâm lý khách hàng và xử lý từ chối', type: 'video', contentUrl: 'https://example.com/objection.mp4', duration: 930 },
      { id: 'l3', courseId: 'c1', title: 'Tài liệu kịch bản chốt deal', type: 'document', contentUrl: 'https://example.com/sales-script.pdf', duration: 5, documentPages: 5 },
      { id: 'l4', courseId: 'c2', title: 'Checklist triển khai', type: 'document', contentUrl: 'https://example.com/deploy-checklist.pdf', duration: 8, documentPages: 8 },
      { id: 'l5', courseId: 'c2', title: 'Nghiệm thu kỹ thuật', type: 'video', contentUrl: 'https://example.com/uat.mp4', duration: 720 },
      { id: 'l6', courseId: 'c3', title: 'Keyword map', type: 'document', contentUrl: 'https://example.com/keyword-map.pdf', duration: 6, documentPages: 6 },
    ],
    enrollments: [
      { userId: 'u1', courseId: 'c1', status: 'đang học' },
      { userId: 'u2', courseId: 'c2', status: 'đang học' },
      { userId: 'u3', courseId: 'c3', status: 'hoàn thành' },
    ],
    progress: [
      { userId: 'u1', lessonId: 'l1', percent: 100, secondsWatched: 600, completed: true },
      { userId: 'u1', lessonId: 'l2', percent: 50, secondsWatched: 465, completed: false },
      { userId: 'u1', lessonId: 'l3', percent: 100, secondsWatched: 0, completed: true },
      { userId: 'u2', lessonId: 'l4', percent: 75, secondsWatched: 0, completed: false },
      { userId: 'u3', lessonId: 'l6', percent: 100, secondsWatched: 0, completed: true },
    ],
    quizzes: [
      { id: 'q1', courseId: 'c1' },
      { id: 'q2', courseId: 'c2' },
      { id: 'q3', courseId: 'c3' },
    ],
    questions: [
      { id: 'q1_1', quizId: 'q1', question: 'Khi khách hàng nói giá quá cao, phản hồi tốt nhất là gì?', options: ['Giảm giá ngay lập tức', 'Giải thích giá trị sản phẩm', 'Im lặng và chờ đợi', 'Từ chối phục vụ'], correctAnswer: 1 },
      { id: 'q1_2', quizId: 'q1', question: 'Điều cần làm trước khi chốt deal là gì?', options: ['Xác nhận nhu cầu', 'Gửi hợp đồng ngay', 'Chuyển sang khách khác', 'Tăng giá'], correctAnswer: 0 },
      { id: 'q1_3', quizId: 'q1', question: 'Lead đủ điều kiện nên được xử lý thế nào?', options: ['Bỏ qua', 'Gắn KPI và theo sát bước tiếp theo', 'Ẩn khỏi pipeline', 'Chỉ ghi chú'], correctAnswer: 1 },
      { id: 'q2_1', quizId: 'q2', question: 'Tài liệu nghiệm thu cần có gì?', options: ['Checklist rõ ràng', 'Tin nhắn rời rạc', 'Không cần chữ ký', 'Chỉ ảnh chụp'], correctAnswer: 0 },
      { id: 'q3_1', quizId: 'q3', question: 'Keyword map dùng để làm gì?', options: ['Phân nhóm ý định tìm kiếm', 'Thiết kế logo', 'Tính lương', 'Quản lý kho'], correctAnswer: 0 },
    ],
    results: [],
    recruitmentJobs: [
      { id: 'j1', title: 'Frontend Developer', department: 'Kỹ thuật', quantityNeeded: 3, quantityHired: 1, status: 'Đang mở' },
      { id: 'j2', title: 'UI/UX Designer', department: 'Marketing', quantityNeeded: 2, quantityHired: 0, status: 'Đang mở' },
      { id: 'j3', title: 'Sales Executive', department: 'Sale', quantityNeeded: 5, quantityHired: 2, status: 'Đang mở' },
    ],
    candidates: [
      { id: 'can1', name: 'Trần Minh Tuấn', phone: '0901 234 567', email: 'tuan.tran@email.com', jobId: 'j2', source: 'LinkedIn', stage: 'new', notes: 'Kinh nghiệm phong phú, phù hợp dự án Alpha.', cvFileName: 'Tran_Minh_Tuan_CV.pdf', createdAt: nowIso() },
      { id: 'can2', name: 'Lê Thị Mai', phone: '0987 654 321', email: 'mai.le@email.com', jobId: 'j1', source: 'Referral', stage: 'technical_test', notes: 'Đang chờ phản hồi bài test React.', cvFileName: 'Le_Thi_Mai_CV.pdf', createdAt: nowIso() },
      { id: 'can3', name: 'Nguyễn Văn Hoàng', phone: '0912 345 678', email: 'hoang.ng@email.com', jobId: 'j3', source: 'Facebook', stage: 'interview_scheduled', notes: 'CV ấn tượng, cần check thêm kỹ năng quản lý.', cvFileName: 'Nguyen_Van_Hoang_CV.pdf', createdAt: nowIso() },
      { id: 'can4', name: 'Nguyễn Anh Tuấn', phone: '0912 345 678', email: 'tuan.nguyen.ux@example.com', jobId: 'j2', source: 'LinkedIn Profile', stage: 'official', notes: 'Đã onboarding và chuyển nhân viên chính thức.', cvFileName: 'Tuan_Nguyen_CV_UXUI.pdf', createdAt: nowIso() },
    ],
    candidateActivities: [
      { id: 'a1', candidateId: 'can4', text: 'Ứng tuyển thành công', createdAt: '2026-04-20T08:00:00.000Z' },
      { id: 'a2', candidateId: 'can4', text: 'Chuyển sang Đã sàng lọc', fromStage: 'new', toStage: 'screened', createdAt: '2026-04-22T08:00:00.000Z' },
      { id: 'a3', candidateId: 'can4', text: 'Hẹn phỏng vấn vòng 1 với Trần Thị B', createdAt: '2026-04-24T08:00:00.000Z' },
      { id: 'a4', candidateId: 'can4', text: 'Kết quả phỏng vấn: Đạt', createdAt: '2026-04-25T08:00:00.000Z' },
      { id: 'a5', candidateId: 'can4', text: 'Chuyển sang Chính thức và tạo nhân viên', fromStage: 'probation', toStage: 'official', createdAt: '2026-04-30T08:00:00.000Z' },
    ],
    candidateInterviews: [
      { id: 'i1', candidateId: 'can3', scheduledAt: '2026-05-13T09:30:00.000Z', interviewer: 'Trần Thị B' },
      { id: 'i2', candidateId: 'can4', scheduledAt: '2026-04-24T08:00:00.000Z', interviewer: 'Trần Thị B', result: 'Đạt', notes: 'Đánh giá tốt về kỹ năng chuyên môn.' },
    ],
    candidateFiles: [
      { id: 'f1', candidateId: 'can4', name: 'Tuan_Nguyen_CV_UXUI.pdf', url: '#' },
    ],
  };
}

function loadInitialState(): CrmState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) as CrmState : createSeedState();
  } catch {
    return createSeedState();
  }
}

const CrmContext = createContext<CrmContextValue | null>(null);

export function CrmProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CrmState>(loadInitialState);

  function persist(updater: (draft: CrmState) => CrmState) {
    setState((current) => {
      const next = updater(current);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }

  const value = useMemo<CrmContextValue>(() => {
    const currentUser = state.employees.find((employee) => employee.id === currentUserId) ?? state.employees[0];

    return {
      ...state,
      currentUser,
      createCourse(course) {
        persist((draft) => ({
          ...draft,
          courses: [...draft.courses, { ...course, id: id('course') }],
        }));
      },
      assignCourse(courseId, target) {
        persist((draft) => {
          const employee = draft.employees.find((item) => item.name.toLowerCase().includes(target.toLowerCase()));
          const course = draft.courses.find((item) => item.id === courseId);
          if (!course || !employee) return draft;
          return {
            ...draft,
            courses: draft.courses.map((item) =>
              item.id === courseId && !item.assignedUsers.includes(employee.id)
                ? { ...item, assignedUsers: [...item.assignedUsers, employee.id] }
                : item
            ),
            enrollments: draft.enrollments.some((item) => item.userId === employee.id && item.courseId === courseId)
              ? draft.enrollments
              : [...draft.enrollments, { userId: employee.id, courseId, status: 'chưa học' }],
          };
        });
      },
      updateLessonProgress(lessonId, percent, secondsWatched = 0) {
        persist((draft) => {
          const normalizedPercent = Math.min(100, Math.max(0, Math.round(percent)));
          const lesson = draft.lessons.find((item) => item.id === lessonId);
          const existing = draft.progress.find((item) => item.userId === currentUserId && item.lessonId === lessonId);
          const progressItem: Progress = {
            userId: currentUserId,
            lessonId,
            percent: normalizedPercent,
            secondsWatched: Math.max(existing?.secondsWatched ?? 0, secondsWatched),
            completed: normalizedPercent >= 100,
          };
          const nextProgress = existing
            ? draft.progress.map((item) => item.userId === currentUserId && item.lessonId === lessonId ? progressItem : item)
            : [...draft.progress, progressItem];
          const courseLessons = draft.lessons.filter((item) => item.courseId === lesson?.courseId);
          const allDone = courseLessons.every((item) => {
            const itemProgress = item.id === lessonId ? progressItem : nextProgress.find((progress) => progress.userId === currentUserId && progress.lessonId === item.id);
            return itemProgress?.completed;
          });
          return {
            ...draft,
            progress: nextProgress,
            enrollments: draft.enrollments.map((item) =>
              item.userId === currentUserId && item.courseId === lesson?.courseId
                ? { ...item, status: allDone ? 'hoàn thành' : 'đang học' }
                : item
            ),
          };
        });
      },
      submitQuiz(quizId, answers) {
        const quizQuestions = state.questions.filter((item) => item.quizId === quizId);
        const correct = quizQuestions.filter((item) => answers[item.id] === item.correctAnswer).length;
        const score = quizQuestions.length ? Math.round((correct / quizQuestions.length) * 100) : 0;
        const result: Result = {
          id: id('result'),
          userId: currentUserId,
          quizId,
          score,
          passed: score >= 70,
          submittedAt: nowIso(),
        };
        persist((draft) => ({ ...draft, results: [...draft.results, result] }));
        return result;
      },
      createRecruitmentJob(job) {
        persist((draft) => ({
          ...draft,
          recruitmentJobs: [...draft.recruitmentJobs, { ...job, id: id('job'), quantityHired: 0 }],
        }));
      },
      createCandidate(candidate) {
        const candidateId = id('candidate');
        persist((draft) => ({
          ...draft,
          candidates: [...draft.candidates, { ...candidate, id: candidateId, stage: 'new', createdAt: nowIso() }],
          candidateActivities: [
            ...draft.candidateActivities,
            { id: id('activity'), candidateId, text: 'Ứng tuyển thành công', createdAt: nowIso() },
          ],
          candidateFiles: candidate.cvFileName
            ? [...draft.candidateFiles, { id: id('file'), candidateId, name: candidate.cvFileName, url: '#' }]
            : draft.candidateFiles,
        }));
      },
      moveCandidateStage(candidateId, toStage) {
        persist((draft) => {
          const candidate = draft.candidates.find((item) => item.id === candidateId);
          if (!candidate || candidate.stage === toStage) return draft;
          const label = candidateStages.find((item) => item.id === toStage)?.label ?? toStage;
          const job = draft.recruitmentJobs.find((item) => item.id === candidate.jobId);
          const shouldConvert = toStage === 'official' && candidate.stage !== 'official';
          return {
            ...draft,
            candidates: draft.candidates.map((item) => item.id === candidateId ? { ...item, stage: toStage } : item),
            candidateActivities: [
              ...draft.candidateActivities,
              { id: id('activity'), candidateId, text: `Chuyển sang ${label}`, fromStage: candidate.stage, toStage, createdAt: nowIso() },
              ...(shouldConvert ? [{ id: id('activity'), candidateId, text: 'Chuyển ứng viên thành nhân viên và gắn onboarding', createdAt: nowIso() }] : []),
            ],
            recruitmentJobs: shouldConvert && job
              ? draft.recruitmentJobs.map((item) => item.id === job.id ? { ...item, quantityHired: Math.min(item.quantityNeeded, item.quantityHired + 1) } : item)
              : draft.recruitmentJobs,
            employees: shouldConvert && job
              ? [...draft.employees, { id: id('employee'), name: candidate.name, role: job.title, department: job.department }]
              : draft.employees,
          };
        });
      },
      scheduleInterview(candidateId, scheduledAt, interviewer) {
        persist((draft) => ({
          ...draft,
          candidateInterviews: [...draft.candidateInterviews, { id: id('interview'), candidateId, scheduledAt, interviewer }],
          candidateActivities: [...draft.candidateActivities, { id: id('activity'), candidateId, text: `Tạo lịch phỏng vấn với ${interviewer}`, createdAt: nowIso() }],
        }));
      },
      recordInterviewResult(interviewId, result, notes) {
        persist((draft) => {
          const interview = draft.candidateInterviews.find((item) => item.id === interviewId);
          return {
            ...draft,
            candidateInterviews: draft.candidateInterviews.map((item) => item.id === interviewId ? { ...item, result, notes } : item),
            candidateActivities: interview
              ? [...draft.candidateActivities, { id: id('activity'), candidateId: interview.candidateId, text: `Ghi nhận kết quả phỏng vấn: ${result}`, createdAt: nowIso() }]
              : draft.candidateActivities,
          };
        });
      },
      resetDemoData() {
        const seed = createSeedState();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
        setState(seed);
      },
    };
  }, [state]);

  return <CrmContext.Provider value={value}>{children}</CrmContext.Provider>;
}

export function useCrm() {
  const context = useContext(CrmContext);
  if (!context) throw new Error('useCrm must be used inside CrmProvider');
  return context;
}

export function stageLabel(stage: CandidateStage) {
  return candidateStages.find((item) => item.id === stage)?.label ?? stage;
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

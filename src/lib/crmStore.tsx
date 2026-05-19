import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { appSupabase } from './supabase';

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
  videoUrl?: string;
  duration: number;
  documentPages?: number;
  summary?: string;
  body?: string;
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

export interface InterviewAssessmentInput {
  candidateId: string;
  questionSet: string;
  interviewer: string;
  scorePercent: number;
  answered: number;
  totalQuestions: number;
  recommendationTitle: string;
  recommendationText: string;
  reportText: string;
}

export interface CustomInterviewQuestionSection {
  id: string;
  title: string;
  questions: string[];
}

export interface CustomInterviewQuestionSet {
  id: string;
  title: string;
  department: Department;
  sections: CustomInterviewQuestionSection[];
  createdAt: string;
}

export interface InterviewQuestionAddition {
  id: string;
  setId: string;
  sectionTitle: string;
  question: string;
  createdAt: string;
}

export interface CandidateFile {
  id: string;
  candidateId: string;
  name: string;
  url: string;
  driveFileId?: string;
  mimeType?: string;
}

export type CreateCandidateInput = Omit<Candidate, 'id' | 'stage' | 'createdAt'> & {
  cvUrl?: string;
  cvDriveFileId?: string;
  cvMimeType?: string;
  cvFiles?: Array<{
    name: string;
    url: string;
    driveFileId?: string;
    mimeType?: string;
  }>;
};

export type UpdateCandidateInput = Partial<Omit<Candidate, 'id' | 'createdAt' | 'stage'>> & {
  cvUrl?: string;
};

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
  customInterviewQuestionSets: CustomInterviewQuestionSet[];
  interviewQuestionAdditions: InterviewQuestionAddition[];
}

interface CrmContextValue extends CrmState {
  currentUser: Employee;
  createCourse: (course: Omit<Course, 'id'>) => void;
  assignCourse: (courseId: string, target: string) => void;
  updateLessonProgress: (lessonId: string, percent: number, secondsWatched?: number) => void;
  submitQuiz: (quizId: string, answers: Record<string, number>) => Result;
  createRecruitmentJob: (job: Omit<RecruitmentJob, 'id' | 'quantityHired'>) => void;
  createCandidate: (candidate: CreateCandidateInput) => void;
  updateCandidate: (candidateId: string, candidate: UpdateCandidateInput) => void;
  moveCandidateStage: (candidateId: string, toStage: CandidateStage) => void;
  scheduleInterview: (candidateId: string, scheduledAt: string, interviewer: string) => void;
  recordInterviewResult: (interviewId: string, result: CandidateInterview['result'], notes: string) => void;
  saveInterviewAssessment: (assessment: InterviewAssessmentInput) => void;
  createInterviewQuestionSet: (input: {
    title: string;
    department: Department;
    sectionTitle: string;
    questions: string[];
  }) => CustomInterviewQuestionSet;
  addInterviewQuestion: (setId: string, sectionTitle: string, question: string) => void;
  resetDemoData: () => void;
}

const STORAGE_KEY = 'xoxo-crm-training-recruitment-v2';
const REMOTE_STATE_TABLE = 'crm_app_state';
const REMOTE_STATE_ID = 'training-recruitment';
const currentUserId = 'u1';
const lessonVideoUrls: Record<string, string> = {
  l1: 'https://www.youtube.com/watch?v=tFs77UWc98o',
  l2: 'https://www.youtube.com/watch?v=eu1LBADdSFg',
  l5: 'https://www.youtube.com/watch?v=sGwm4p9sGPI',
};

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
      // ─────────── Course c1 — Kỹ năng chốt deal (Sale) ───────────
      {
        id: 'l1',
        courseId: 'c1',
        title: 'Tổng quan quy trình bán hàng 7 bước',
        type: 'video',
        contentUrl: lessonVideoUrls.l1,
        videoUrl: lessonVideoUrls.l1,
        duration: 600,
        summary: 'Hiểu toàn cảnh hành trình từ khi tiếp cận khách đến khi chăm sóc sau bán.',
      },
      {
        id: 'l2',
        courseId: 'c1',
        title: 'Tâm lý khách hàng và xử lý từ chối',
        type: 'video',
        contentUrl: lessonVideoUrls.l2,
        videoUrl: lessonVideoUrls.l2,
        duration: 930,
        summary: 'Nhận diện 5 dạng từ chối phổ biến và kịch bản phản hồi tinh tế.',
      },
      {
        id: 'l3',
        courseId: 'c1',
        title: 'Tài liệu kịch bản chốt deal',
        type: 'document',
        contentUrl: 'sales-script',
        duration: 6,
        documentPages: 6,
        summary: 'Bộ kịch bản 6 bước từ chào - tư vấn - chốt - upsell.',
        body: [
          '# Kịch bản chốt deal cho Sale XOXO',
          '',
          'Bộ kịch bản gồm 6 bước, áp dụng cho cả khách walk-in và inbox online. Đọc kỹ và luyện theo từng tình huống.',
          '',
          '## 1. Mở đầu — tạo thiện cảm trong 10 giây',
          '- Chào theo tên nếu biết: "Chào chị Mai, em là Linh — tư vấn của XOXO Luxury."',
          '- Quan sát: ngôn ngữ cơ thể, sản phẩm khách đang nhìn, tâm trạng.',
          '- Câu hỏi mở: "Chị/anh đang tìm món cho mình hay làm quà ạ?"',
          '',
          '## 2. Khám phá nhu cầu — đặt 3 câu hỏi vàng',
          '1. Mục đích sử dụng (đi làm, đi tiệc, hằng ngày)?',
          '2. Phong cách yêu thích (cổ điển, trẻ trung, tối giản)?',
          '3. Ngân sách dự tính?',
          '',
          'Lắng nghe nhiều hơn nói. Ghi chú nhanh vào sổ tay.',
          '',
          '## 3. Trình bày giá trị — không chỉ là sản phẩm',
          '- Liên kết tính năng với lợi ích cụ thể của khách.',
          '- Câu mẫu: "Chiếc túi này có quai xích mạ vàng 18K, chống xước, hợp với chị vì chị thường đi tiệc và muốn nổi bật mà vẫn sang."',
          '- Cho khách trải nghiệm trực tiếp (cầm, đeo, soi gương).',
          '',
          '## 4. Xử lý từ chối — đồng cảm trước, phản hồi sau',
          '> Khách: "Đắt quá em ơi."',
          '',
          'Trả lời theo công thức **Acknowledge → Reframe → Evidence**:',
          '- "Em hiểu giá này không nhỏ chị ạ..."',
          '- "...nhưng nếu chia ra 12 tháng đeo, mỗi ngày chỉ khoảng 25k — rẻ hơn ly cà phê."',
          '- "Hơn nữa hãng bảo hành 2 năm và đổi trả trong 7 ngày, hoàn toàn yên tâm."',
          '',
          '## 5. Chốt deal — gợi ý quyết định',
          '- Câu chốt mềm: "Chị muốn em gói túi giấy thường hay hộp quà luôn ạ?"',
          '- Câu chốt cứng: "Mình thanh toán thẻ hay tiền mặt chị nhỉ?"',
          '- Đưa lựa chọn cụ thể, KHÔNG để câu hỏi mở "chị suy nghĩ thêm nhé".',
          '',
          '## 6. Sau bán — chăm sóc 7 ngày',
          '- Ngày 1: Tin nhắn cảm ơn, đính kèm hướng dẫn bảo quản.',
          '- Ngày 3: Hỏi cảm nhận sau khi sử dụng.',
          '- Ngày 7: Mời tham gia chương trình thành viên / giới thiệu bạn bè.',
          '',
          '---',
          '',
          '**Ghi nhớ vàng**: Khách mua người, không mua sản phẩm. Hãy là người mà khách muốn mua.',
        ].join('\n'),
      },
      {
        id: 'l7',
        courseId: 'c1',
        title: 'Cross-sell và Upsell tinh tế',
        type: 'document',
        contentUrl: 'cross-upsell',
        duration: 4,
        documentPages: 4,
        summary: 'Tăng giá trị đơn hàng bằng cách gợi ý thêm phụ kiện và phiên bản cao cấp.',
        body: [
          '# Nghệ thuật Cross-sell & Upsell',
          '',
          'Cross-sell là gợi ý sản phẩm bổ sung, Upsell là nâng cấp lên phiên bản cao hơn. Cả hai đều cần đúng thời điểm, đúng giá trị.',
          '',
          '## Khi nào nên Upsell',
          '- Khách đã thích chiếc túi mini → gợi ý phiên bản size lớn dùng đi làm.',
          '- Khách đã chọn da bò → gợi ý da cao cấp Italy với giá chênh nhẹ.',
          '- Thời điểm tốt nhất: SAU khi khách quyết định mua, TRƯỚC khi thanh toán.',
          '',
          '## Khi nào nên Cross-sell',
          '- Khách mua túi → gợi ý ví nhỏ cùng tone, khăn lụa, móc khóa.',
          '- Khách mua giày → gợi ý xi đánh giày, miếng lót.',
          '- Câu mẫu: "Bên em đang có ưu đãi mua kèm ví giảm 30% chị ạ."',
          '',
          '## Quy tắc 3 KHÔNG',
          '1. KHÔNG gợi ý quá 2 món bổ sung — gây cảm giác bị ép.',
          '2. KHÔNG cross-sell món có giá lớn hơn món gốc.',
          '3. KHÔNG ép khách nếu họ từ chối nhẹ.',
          '',
          '## Mục tiêu KPI',
          '- Tỷ lệ đơn có upsell/cross-sell: ≥ 25%.',
          '- Trung bình đơn hàng tăng tối thiểu 12%.',
        ].join('\n'),
      },

      // ─────────── Course c2 — Quy trình triển khai kỹ thuật ───────────
      {
        id: 'l4',
        courseId: 'c2',
        title: 'Checklist triển khai dự án',
        type: 'document',
        contentUrl: 'deploy-checklist',
        duration: 8,
        documentPages: 8,
        summary: 'Quy trình 8 bước chuẩn từ kickoff đến nghiệm thu.',
        body: [
          '# Checklist triển khai dự án kỹ thuật',
          '',
          'Áp dụng cho mọi dự án triển khai phần mềm/hệ thống cho khách hàng. Mỗi bước đều phải có evidence trước khi sang bước tiếp.',
          '',
          '## Bước 1 — Kickoff Meeting',
          '- [ ] Xác định Stakeholder (PM khách, technical lead, business owner)',
          '- [ ] Thống nhất scope và deliverables',
          '- [ ] Lập kênh giao tiếp (Slack/Email/Meet)',
          '- [ ] Biên bản kickoff được ký',
          '',
          '## Bước 2 — Khảo sát & Phân tích',
          '- [ ] Thu thập tài liệu hiện trạng',
          '- [ ] Phỏng vấn người dùng cuối',
          '- [ ] Lập SRS (Software Requirements Specification)',
          '- [ ] Khách duyệt SRS bằng văn bản',
          '',
          '## Bước 3 — Thiết kế hệ thống',
          '- [ ] Architecture diagram',
          '- [ ] Database schema',
          '- [ ] API specification (OpenAPI/Swagger)',
          '- [ ] UI wireframe đã review',
          '',
          '## Bước 4 — Setup môi trường',
          '- [ ] Dev / Staging / Production tách biệt',
          '- [ ] CI/CD pipeline hoạt động',
          '- [ ] Backup & recovery plan',
          '- [ ] Monitoring (Grafana/Datadog)',
          '',
          '## Bước 5 — Phát triển',
          '- [ ] Sprint planning hàng 2 tuần',
          '- [ ] Code review bắt buộc trước merge',
          '- [ ] Unit test coverage ≥ 70%',
          '- [ ] Demo cuối sprint cho khách',
          '',
          '## Bước 6 — Kiểm thử',
          '- [ ] Test plan chi tiết',
          '- [ ] Functional / Integration / Load test',
          '- [ ] UAT (User Acceptance Test) với khách',
          '- [ ] Bug log < 5 critical',
          '',
          '## Bước 7 — Nghiệm thu',
          '- [ ] Biên bản nghiệm thu có chữ ký',
          '- [ ] Tài liệu hướng dẫn người dùng',
          '- [ ] Training cho team khách hàng',
          '- [ ] Source code và document bàn giao',
          '',
          '## Bước 8 — Bảo hành & Hỗ trợ',
          '- [ ] SLA cam kết: 4h response, 24h fix critical',
          '- [ ] Knowledge base nội bộ',
          '- [ ] Lịch retro 30 ngày sau golive',
          '',
          '---',
          '',
          '**Quy tắc vàng**: Không có evidence = không hoàn thành. Mọi bước đều phải có document và chữ ký.',
        ].join('\n'),
      },
      {
        id: 'l5',
        courseId: 'c2',
        title: 'Nghiệm thu kỹ thuật và bàn giao',
        type: 'video',
        contentUrl: lessonVideoUrls.l5,
        videoUrl: lessonVideoUrls.l5,
        duration: 720,
        summary: 'Cách tổ chức buổi nghiệm thu chuyên nghiệp và xử lý phát sinh.',
      },
      {
        id: 'l8',
        courseId: 'c2',
        title: 'Quản lý sự cố và Incident response',
        type: 'document',
        contentUrl: 'incident-response',
        duration: 5,
        documentPages: 5,
        summary: 'Khung phản ứng khi hệ thống gặp sự cố — từ phát hiện đến RCA.',
        body: [
          '# Incident Response Playbook',
          '',
          'Khi hệ thống gặp sự cố, mọi giây đều quan trọng. Áp dụng quy trình 5 bước sau.',
          '',
          '## Phân loại mức độ',
          '- **P0 — Critical**: Toàn bộ hệ thống down, không có workaround. Phản ứng < 15 phút.',
          '- **P1 — High**: Tính năng quan trọng lỗi, ảnh hưởng > 30% người dùng. Phản ứng < 1h.',
          '- **P2 — Medium**: Lỗi cục bộ có workaround. Xử lý trong ngày.',
          '- **P3 — Low**: Lỗi nhỏ, không khẩn. Xếp lịch sprint sau.',
          '',
          '## Bước 1 — Detect',
          '- Nguồn cảnh báo: Monitoring tool / Khách báo / Internal phát hiện',
          '- Xác nhận sự cố trong 5 phút',
          '- Ghi log thời gian phát hiện',
          '',
          '## Bước 2 — Triage',
          '- Phân loại P0/P1/P2/P3',
          '- Chỉ định Incident Commander (IC)',
          '- Mở war-room (Slack channel hoặc Meet)',
          '',
          '## Bước 3 — Mitigate',
          '- Ưu tiên khôi phục dịch vụ TRƯỚC, fix root cause SAU',
          '- Rollback nếu mới deploy',
          '- Failover sang region khác nếu có HA',
          '',
          '## Bước 4 — Communicate',
          '- Status page cập nhật mỗi 30 phút',
          '- Email khách hàng nếu P0/P1',
          '- Internal: cập nhật mọi 15 phút trong war-room',
          '',
          '## Bước 5 — Post-mortem',
          '- Trong 48h sau khi resolve, viết RCA (Root Cause Analysis)',
          '- Format: Timeline / Impact / Root cause / Action items',
          '- Blameless culture — tập trung hệ thống, không đổ lỗi cá nhân',
          '',
          '## SLA mẫu',
          '| Mức | Response | Resolution |',
          '|---|---|---|',
          '| P0 | 15p | 4h |',
          '| P1 | 1h | 24h |',
          '| P2 | 4h | 3 ngày |',
          '| P3 | 24h | 2 tuần |',
        ].join('\n'),
      },

      // ─────────── Course c3 — SEO Strategy 2026 (Marketing) ───────────
      {
        id: 'l6',
        courseId: 'c3',
        title: 'Keyword map và phân nhóm ý định tìm kiếm',
        type: 'document',
        contentUrl: 'keyword-map',
        duration: 7,
        documentPages: 7,
        summary: 'Phân nhóm keyword theo search intent để tối ưu nội dung và conversion.',
        body: [
          '# Keyword Map — Bản đồ từ khóa SEO 2026',
          '',
          'Keyword map là tài liệu quan trọng nhất trước khi bắt đầu viết nội dung. Một keyword map tốt giúp tránh ăn thịt nội dung (cannibalization) và tăng chuyển đổi.',
          '',
          '## 4 nhóm Search Intent',
          '',
          '### 1. Informational (Tìm hiểu) — TOFU',
          '- Khách đang tìm thông tin, chưa sẵn sàng mua',
          '- Ví dụ: "túi xách hàng hiệu là gì", "cách phân biệt da thật da giả"',
          '- Format nội dung: blog dài, infographic, video',
          '- Mục tiêu: Brand awareness',
          '',
          '### 2. Navigational (Định hướng) — MOFU',
          '- Khách đã biết brand, tìm trang cụ thể',
          '- Ví dụ: "xoxo luxury hà nội", "xoxo store ba đình"',
          '- Format: landing page, store locator',
          '- Mục tiêu: Branded traffic',
          '',
          '### 3. Commercial (Tìm hiểu trước mua) — MOFU/BOFU',
          '- Khách so sánh sản phẩm, đọc review',
          '- Ví dụ: "túi LV hay Gucci tốt hơn", "review túi xoxo"',
          '- Format: comparison guide, review chi tiết',
          '- Mục tiêu: Build trust',
          '',
          '### 4. Transactional (Mua ngay) — BOFU',
          '- Khách sẵn sàng mua',
          '- Ví dụ: "mua túi xách giá rẻ", "shop bán túi hàng hiệu chính hãng"',
          '- Format: product page, listing với filter',
          '- Mục tiêu: Conversion',
          '',
          '## Cấu trúc Keyword Map mẫu',
          '',
          '| Pillar | Cluster | Primary KW | Intent | URL | Volume |',
          '|---|---|---|---|---|---|',
          '| Túi xách | Da thật | "túi da thật cao cấp" | Commercial | /tui/da-that | 2.4K |',
          '| Túi xách | Theo brand | "túi LV authentic" | Transactional | /tui/lv | 5.8K |',
          '| Phụ kiện | Ví nữ | "ví nữ cầm tay" | Transactional | /vi-nu | 3.1K |',
          '',
          '## 5 nguyên tắc xây dựng',
          '1. **1 URL = 1 primary keyword** — tránh cannibalization',
          '2. **Pillar + Cluster** — hub và spoke model',
          '3. **Internal linking** giữa các bài cùng cluster',
          '4. **Cập nhật quý** — search intent thay đổi nhanh',
          '5. **Theo dõi position** mỗi tuần với Ahrefs/SEMrush',
          '',
          '---',
          '',
          'Tham khảo công cụ: Ahrefs Keywords Explorer, SEMrush Keyword Magic, Google Keyword Planner.',
        ].join('\n'),
      },
      {
        id: 'l9',
        courseId: 'c3',
        title: 'On-page SEO checklist',
        type: 'document',
        contentUrl: 'onpage-seo',
        duration: 5,
        documentPages: 5,
        summary: 'Checklist đầy đủ tối ưu on-page cho mỗi bài viết.',
        body: [
          '# On-page SEO Checklist 2026',
          '',
          'Áp dụng cho mọi bài viết trước khi publish.',
          '',
          '## Title Tag',
          '- [ ] Chứa primary keyword ở 60 ký tự đầu',
          '- [ ] Có yếu tố click-bait nhẹ (con số, năm, "tốt nhất")',
          '- [ ] Mỗi page có title duy nhất',
          '',
          '## Meta Description',
          '- [ ] 140-160 ký tự',
          '- [ ] Có CTA: "Xem ngay", "Khám phá"',
          '- [ ] Không trùng với title',
          '',
          '## Heading',
          '- [ ] H1 duy nhất, chứa primary keyword',
          '- [ ] H2/H3 phân cấp logic',
          '- [ ] LSI keyword rải đều trong heading',
          '',
          '## URL',
          '- [ ] Ngắn, có keyword (vd: /tui-da-that)',
          '- [ ] Không dấu, không underscore, dùng dấu gạch ngang',
          '- [ ] Tránh URL > 5 từ',
          '',
          '## Content',
          '- [ ] Tối thiểu 1500 từ cho transactional, 2500 từ cho informational',
          '- [ ] Keyword density 1-2%',
          '- [ ] Chèn ảnh mỗi 300 từ với alt text',
          '- [ ] Internal link 3-5 / external link 1-2',
          '',
          '## Technical',
          '- [ ] Schema markup (Product, Article, FAQ)',
          '- [ ] Open Graph + Twitter Card',
          '- [ ] Mobile-friendly (Core Web Vitals pass)',
          '- [ ] Page speed < 2.5s LCP',
          '',
          '## E-E-A-T',
          '- [ ] Author box với bio và liên kết LinkedIn',
          '- [ ] Reviewer expert (nếu có)',
          '- [ ] Cited sources với link uy tín',
          '- [ ] Updated date hiển thị rõ',
        ].join('\n'),
      },
      {
        id: 'l10',
        courseId: 'c3',
        title: 'Đo lường SEO và báo cáo hàng tháng',
        type: 'document',
        contentUrl: 'seo-reporting',
        duration: 4,
        documentPages: 4,
        summary: '5 KPI bắt buộc và cách trình bày báo cáo cho leadership.',
        body: [
          '# SEO Reporting Framework',
          '',
          'Báo cáo SEO không chỉ là rank — phải kết nối được với business outcome.',
          '',
          '## 5 KPI bắt buộc',
          '',
          '### 1. Organic Traffic',
          '- Tổng phiên truy cập từ Search',
          '- Phân theo branded/non-branded',
          '- Mục tiêu: tăng 15-20%/quý',
          '',
          '### 2. Keyword Rankings',
          '- Top 3 / Top 10 / Top 30 positions',
          '- Theo dõi 50-100 keyword chính',
          '- Báo cáo Share of Voice',
          '',
          '### 3. Conversions',
          '- Lead form submission',
          '- Add to cart / Checkout từ organic',
          '- Calculated conversion rate',
          '',
          '### 4. Backlinks',
          '- Số domain referring tăng theo tháng',
          '- DR (Domain Rating) trung bình',
          '- Tỷ lệ link toxic / disavow',
          '',
          '### 5. Technical Health',
          '- Core Web Vitals (LCP/FID/CLS)',
          '- Crawl errors',
          '- Mobile usability issues',
          '',
          '## Cấu trúc báo cáo tháng',
          '1. **Executive Summary** — 3-5 dòng',
          '2. **KPI Dashboard** — số chính có so sánh MoM, YoY',
          '3. **Wins** — 3 thắng lợi nổi bật',
          '4. **Challenges** — 2-3 vấn đề + giải pháp đề xuất',
          '5. **Next month plan** — top 5 actions',
          '',
          '## Tools đề xuất',
          '- Google Analytics 4 + Search Console (miễn phí)',
          '- Ahrefs / SEMrush (paid)',
          '- Looker Studio để dashboard tự động',
        ].join('\n'),
      },
    ],
    enrollments: [
      { userId: 'u1', courseId: 'c1', status: 'đang học' },
      { userId: 'u1', courseId: 'c3', status: 'đang học' },
      { userId: 'u2', courseId: 'c2', status: 'đang học' },
      { userId: 'u2', courseId: 'c1', status: 'chưa học' },
      { userId: 'u3', courseId: 'c3', status: 'hoàn thành' },
    ],
    progress: [
      { userId: 'u1', lessonId: 'l1', percent: 100, secondsWatched: 600, completed: true },
      { userId: 'u1', lessonId: 'l2', percent: 50, secondsWatched: 465, completed: false },
      { userId: 'u1', lessonId: 'l3', percent: 100, secondsWatched: 0, completed: true },
      { userId: 'u1', lessonId: 'l7', percent: 0, secondsWatched: 0, completed: false },
      { userId: 'u2', lessonId: 'l4', percent: 75, secondsWatched: 0, completed: false },
      { userId: 'u2', lessonId: 'l5', percent: 30, secondsWatched: 216, completed: false },
      { userId: 'u2', lessonId: 'l8', percent: 0, secondsWatched: 0, completed: false },
      { userId: 'u3', lessonId: 'l6', percent: 100, secondsWatched: 0, completed: true },
      { userId: 'u3', lessonId: 'l9', percent: 60, secondsWatched: 0, completed: false },
      { userId: 'u3', lessonId: 'l10', percent: 0, secondsWatched: 0, completed: false },
    ],
    quizzes: [
      { id: 'q1', courseId: 'c1' },
      { id: 'q2', courseId: 'c2' },
      { id: 'q3', courseId: 'c3' },
    ],
    questions: [
      // ─── Quiz q1 — Kỹ năng chốt deal ───
      {
        id: 'q1_1',
        quizId: 'q1',
        question: 'Khi khách nói "Đắt quá em ơi", phản hồi theo công thức nào hiệu quả nhất?',
        options: [
          'Giảm giá ngay 10% để chốt nhanh',
          'Đồng cảm → Reframe giá trị → Đưa bằng chứng (Acknowledge → Reframe → Evidence)',
          'Im lặng để khách suy nghĩ',
          'Chuyển sang sản phẩm rẻ hơn ngay',
        ],
        correctAnswer: 1,
      },
      {
        id: 'q1_2',
        quizId: 'q1',
        question: 'Trước khi trình bày sản phẩm, bước quan trọng nhất là gì?',
        options: [
          'Khám phá nhu cầu bằng 3 câu hỏi vàng (mục đích / phong cách / ngân sách)',
          'Báo giá luôn để khách quyết định nhanh',
          'Khoe các tính năng nổi bật',
          'Hỏi khách có thẻ thành viên không',
        ],
        correctAnswer: 0,
      },
      {
        id: 'q1_3',
        quizId: 'q1',
        question: 'Câu chốt nào được coi là "câu chốt cứng" hiệu quả?',
        options: [
          'Chị suy nghĩ thêm rồi cho em biết nhé',
          'Mình thanh toán thẻ hay tiền mặt chị nhỉ?',
          'Chị muốn xem thêm sản phẩm khác không?',
          'Em để chị xem một mình nhé',
        ],
        correctAnswer: 1,
      },
      {
        id: 'q1_4',
        quizId: 'q1',
        question: 'Thời điểm tốt nhất để upsell là khi nào?',
        options: [
          'Ngay khi khách bước vào shop',
          'Sau khi khách đã quyết định mua, trước khi thanh toán',
          'Sau khi đã thanh toán xong',
          'Khi khách tỏ ra do dự',
        ],
        correctAnswer: 1,
      },
      {
        id: 'q1_5',
        quizId: 'q1',
        question: 'Quy tắc 3 KHÔNG khi cross-sell bao gồm gì?',
        options: [
          'Không gợi ý quá 2 món, không cross-sell món đắt hơn món gốc, không ép khách',
          'Không tư vấn, không chốt, không chăm sóc sau bán',
          'Không cười, không nhìn mắt, không bắt tay',
          'Không hỏi, không nghe, không nói',
        ],
        correctAnswer: 0,
      },
      {
        id: 'q1_6',
        quizId: 'q1',
        question: 'Lead đủ điều kiện (qualified lead) cần được xử lý thế nào?',
        options: [
          'Bỏ qua nếu chưa cần ngay',
          'Gắn KPI và theo sát bước tiếp theo trong pipeline',
          'Chỉ ghi chú vào sổ',
          'Chuyển cho người khác',
        ],
        correctAnswer: 1,
      },
      {
        id: 'q1_7',
        quizId: 'q1',
        question: 'Sau bán hàng 7 ngày, hành động chăm sóc cuối cùng là gì?',
        options: [
          'Gửi hoá đơn lần nữa',
          'Mời tham gia chương trình thành viên hoặc giới thiệu bạn bè',
          'Hỏi xin phản hồi tiêu cực',
          'Bán thêm sản phẩm khác',
        ],
        correctAnswer: 1,
      },

      // ─── Quiz q2 — Quy trình triển khai kỹ thuật ───
      {
        id: 'q2_1',
        quizId: 'q2',
        question: 'Quy tắc vàng trong checklist triển khai là gì?',
        options: [
          'Làm xong bước nào báo bước đó',
          'Không có evidence (document/chữ ký) = không hoàn thành',
          'Cứ đẩy nhanh để kịp deadline',
          'Nghiệm thu miệng là đủ',
        ],
        correctAnswer: 1,
      },
      {
        id: 'q2_2',
        quizId: 'q2',
        question: 'Theo quy trình 8 bước, sau Kickoff Meeting bước tiếp theo là gì?',
        options: [
          'Phát triển luôn',
          'Khảo sát & Phân tích yêu cầu, lập SRS',
          'Setup môi trường',
          'Kiểm thử',
        ],
        correctAnswer: 1,
      },
      {
        id: 'q2_3',
        quizId: 'q2',
        question: 'Mức ưu tiên P0 trong Incident Response yêu cầu phản ứng trong bao lâu?',
        options: ['< 15 phút', '< 1 giờ', '< 4 giờ', '< 24 giờ'],
        correctAnswer: 0,
      },
      {
        id: 'q2_4',
        quizId: 'q2',
        question: 'Khi gặp sự cố, nguyên tắc xử lý đúng là gì?',
        options: [
          'Tìm root cause trước, fix sau',
          'Khôi phục dịch vụ trước, tìm root cause sau (mitigate first, RCA later)',
          'Gọi sếp ngay lập tức',
          'Giữ kín không thông báo cho khách',
        ],
        correctAnswer: 1,
      },
      {
        id: 'q2_5',
        quizId: 'q2',
        question: 'Post-mortem (RCA) nên được viết trong vòng bao lâu sau khi resolve?',
        options: ['Trong 48 giờ', 'Trong 1 tuần', 'Khi có thời gian', 'Không cần viết'],
        correctAnswer: 0,
      },
      {
        id: 'q2_6',
        quizId: 'q2',
        question: 'Unit test coverage tối thiểu trong dự án là bao nhiêu?',
        options: ['30%', '50%', '70%', '100%'],
        correctAnswer: 2,
      },
      {
        id: 'q2_7',
        quizId: 'q2',
        question: 'Văn hoá blameless trong post-mortem có ý nghĩa gì?',
        options: [
          'Không ghi nhận lỗi của ai',
          'Tập trung phân tích hệ thống và quy trình, không đổ lỗi cá nhân',
          'Bỏ qua mọi sự cố',
          'Chỉ trích người gây lỗi',
        ],
        correctAnswer: 1,
      },

      // ─── Quiz q3 — SEO Strategy 2026 ───
      {
        id: 'q3_1',
        quizId: 'q3',
        question: 'Keyword map dùng để làm gì?',
        options: [
          'Phân nhóm ý định tìm kiếm và tránh cannibalization',
          'Thiết kế logo',
          'Tính lương nhân viên SEO',
          'Quản lý kho sản phẩm',
        ],
        correctAnswer: 0,
      },
      {
        id: 'q3_2',
        quizId: 'q3',
        question: 'Search intent nào phù hợp với từ khóa "mua túi xách giá rẻ"?',
        options: ['Informational', 'Navigational', 'Commercial', 'Transactional'],
        correctAnswer: 3,
      },
      {
        id: 'q3_3',
        quizId: 'q3',
        question: 'Nguyên tắc quan trọng nhất khi xây dựng keyword map là gì?',
        options: [
          '1 URL có thể gắn nhiều primary keyword để tăng traffic',
          '1 URL = 1 primary keyword để tránh cannibalization',
          'Chỉ cần keyword có volume cao',
          'Không cần internal linking',
        ],
        correctAnswer: 1,
      },
      {
        id: 'q3_4',
        quizId: 'q3',
        question: 'Title tag tối ưu nên có độ dài bao nhiêu ký tự?',
        options: ['Dưới 30', 'Khoảng 60', 'Trên 100', 'Càng dài càng tốt'],
        correctAnswer: 1,
      },
      {
        id: 'q3_5',
        quizId: 'q3',
        question: 'Meta description độ dài lý tưởng là?',
        options: ['50-80 ký tự', '140-160 ký tự', '200-300 ký tự', 'Không giới hạn'],
        correctAnswer: 1,
      },
      {
        id: 'q3_6',
        quizId: 'q3',
        question: 'E-E-A-T trong SEO 2026 là viết tắt của?',
        options: [
          'Easy-Effective-Accurate-Trust',
          'Experience-Expertise-Authoritativeness-Trustworthiness',
          'Engagement-Email-Ad-Tracking',
          'Energy-Efficient-Active-Time',
        ],
        correctAnswer: 1,
      },
      {
        id: 'q3_7',
        quizId: 'q3',
        question: 'Trong báo cáo SEO tháng, KPI bắt buộc nào liên kết trực tiếp với business outcome?',
        options: ['Số lượng từ khóa', 'Conversions (lead/đơn hàng từ organic)', 'Số bài viết', 'Số backlink'],
        correctAnswer: 1,
      },
      {
        id: 'q3_8',
        quizId: 'q3',
        question: 'Mục tiêu Core Web Vitals - LCP nên đạt dưới bao nhiêu giây?',
        options: ['< 1.0s', '< 2.5s', '< 5.0s', '< 10s'],
        correctAnswer: 1,
      },
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
    customInterviewQuestionSets: [],
    interviewQuestionAdditions: [],
  };
}

function shouldReplaceDemoVideo(lesson: Lesson) {
  const source = `${lesson.videoUrl || ''} ${lesson.contentUrl || ''}`;
  return !lesson.videoUrl || source.includes('dQw4w9WgXcQ') || source.includes('example.com');
}

function hydrateLessonVideos(state: CrmState) {
  let changed = false;
  const lessons = state.lessons.map((lesson) => {
    const videoUrl = lessonVideoUrls[lesson.id];
    if (!videoUrl || !shouldReplaceDemoVideo(lesson)) return lesson;

    changed = true;
    return {
      ...lesson,
      contentUrl: videoUrl,
      videoUrl,
    };
  });

  return {
    state: {
      ...(changed ? { ...state, lessons } : state),
      customInterviewQuestionSets: state.customInterviewQuestionSets ?? [],
      interviewQuestionAdditions: state.interviewQuestionAdditions ?? [],
    },
    changed,
  };
}

function loadInitialState(): CrmState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const loadedState = raw ? JSON.parse(raw) as CrmState : createSeedState();
    const hydrated = hydrateLessonVideos(loadedState);
    if (hydrated.changed) localStorage.setItem(STORAGE_KEY, JSON.stringify(hydrated.state));
    return hydrated.state;
  } catch {
    return createSeedState();
  }
}

async function loadRemoteState(): Promise<CrmState | null> {
  if (!appSupabase) return null;

  const { data, error } = await appSupabase
    .from(REMOTE_STATE_TABLE)
    .select('state')
    .eq('id', REMOTE_STATE_ID)
    .maybeSingle();

  if (error) {
    if (error.code !== 'PGRST116' && error.code !== 'PGRST205' && error.code !== '42P01') {
      console.warn('Không đọc được CRM state từ Supabase:', error.message);
    }
    return null;
  }

  const state = data?.state as CrmState | undefined;
  if (!state?.candidates || !state?.recruitmentJobs) return null;
  const hydrated = hydrateLessonVideos(state);
  return hydrated.state;
}

async function saveRemoteState(state: CrmState) {
  if (!appSupabase) return;

  const { error } = await appSupabase
    .from(REMOTE_STATE_TABLE)
    .upsert({ id: REMOTE_STATE_ID, state }, { onConflict: 'id' });

  if (error && error.code !== 'PGRST205' && error.code !== '42P01') {
    console.warn('Không lưu được CRM state lên Supabase:', error.message);
  }
}

const CrmContext = createContext<CrmContextValue | null>(null);

export function CrmProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CrmState>(loadInitialState);

  useEffect(() => {
    let cancelled = false;

    async function hydrateRemoteState() {
      const remoteState = await loadRemoteState();
      if (!remoteState || cancelled) return;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(remoteState));
      setState(remoteState);
    }

    void hydrateRemoteState();

    return () => {
      cancelled = true;
    };
  }, []);

  function persist(updater: (draft: CrmState) => CrmState) {
    setState((current) => {
      const next = updater(current);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      void saveRemoteState(next);
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
        const { cvUrl, cvDriveFileId, cvMimeType, cvFiles, ...candidateData } = candidate;
        const normalizedCvUrl = cvUrl?.trim();
        const uploadedFiles = cvFiles?.filter((file) => file.url) ?? [];
        const nextFiles = uploadedFiles.length > 0
          ? uploadedFiles.map((file) => ({
              id: id('file'),
              candidateId,
              name: file.name,
              url: file.url,
              driveFileId: file.driveFileId,
              mimeType: file.mimeType,
            }))
          : candidateData.cvFileName || normalizedCvUrl
            ? [
                {
                  id: id('file'),
                  candidateId,
                  name: candidateData.cvFileName || 'CV ứng viên',
                  url: normalizedCvUrl || '#',
                  driveFileId: cvDriveFileId,
                  mimeType: cvMimeType,
                },
              ]
            : [];
        persist((draft) => ({
          ...draft,
          candidates: [...draft.candidates, { ...candidateData, id: candidateId, stage: 'new', createdAt: nowIso() }],
          candidateActivities: [
            ...draft.candidateActivities,
            { id: id('activity'), candidateId, text: 'Ứng tuyển thành công', createdAt: nowIso() },
          ],
          candidateFiles: nextFiles.length ? [...draft.candidateFiles, ...nextFiles] : draft.candidateFiles,
        }));
      },
      updateCandidate(candidateId, candidate) {
        persist((draft) => {
          const currentCandidate = draft.candidates.find((item) => item.id === candidateId);
          if (!currentCandidate) return draft;

          const { cvUrl, ...candidatePatch } = candidate;
          const nextCandidate = {
            ...currentCandidate,
            ...candidatePatch,
          };

          const shouldTouchFile = candidate.cvFileName !== undefined || cvUrl !== undefined;
          const currentFiles = draft.candidateFiles.filter((item) => item.candidateId === candidateId);
          let nextFiles = draft.candidateFiles;

          if (shouldTouchFile) {
            if (currentFiles.length > 0) {
              const firstFileId = currentFiles[0].id;
              nextFiles = draft.candidateFiles.map((file) =>
                file.id === firstFileId
                  ? {
                      ...file,
                      name: candidate.cvFileName ?? file.name,
                      url: cvUrl !== undefined ? cvUrl.trim() || '#' : file.url,
                    }
                  : file
              );
            } else if (nextCandidate.cvFileName || cvUrl?.trim()) {
              nextFiles = [
                ...draft.candidateFiles,
                {
                  id: id('file'),
                  candidateId,
                  name: nextCandidate.cvFileName || 'CV ứng viên',
                  url: cvUrl?.trim() || '#',
                },
              ];
            }
          }

          return {
            ...draft,
            candidates: draft.candidates.map((item) => (item.id === candidateId ? nextCandidate : item)),
            candidateFiles: nextFiles,
            candidateActivities: [
              ...draft.candidateActivities,
              { id: id('activity'), candidateId, text: 'Cập nhật thông tin ứng viên', createdAt: nowIso() },
            ],
          };
        });
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
      saveInterviewAssessment(assessment) {
        persist((draft) => {
          const candidate = draft.candidates.find((item) => item.id === assessment.candidateId);
          if (!candidate) return draft;

          const result: CandidateInterview['result'] =
            assessment.scorePercent >= 75 ? 'Đạt' : assessment.scorePercent >= 55 ? 'Cần cân nhắc' : 'Không đạt';
          const notes = [
            `${assessment.questionSet} · ${assessment.recommendationTitle}`,
            `Điểm: ${assessment.scorePercent}/100 · Đã chấm ${assessment.answered}/${assessment.totalQuestions} câu.`,
            assessment.recommendationText,
            '',
            assessment.reportText,
          ].join('\n');
          const latestInterview = [...draft.candidateInterviews]
            .filter((item) => item.candidateId === assessment.candidateId)
            .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())[0];
          const shouldAdvanceStage =
            candidate.stage === 'new' || candidate.stage === 'screened' || candidate.stage === 'interview_scheduled';

          return {
            ...draft,
            candidates: draft.candidates.map((item) =>
              item.id === assessment.candidateId && shouldAdvanceStage ? { ...item, stage: 'interviewed' } : item
            ),
            candidateInterviews: latestInterview
              ? draft.candidateInterviews.map((item) =>
                  item.id === latestInterview.id
                    ? {
                        ...item,
                        interviewer: assessment.interviewer || item.interviewer,
                        result,
                        notes,
                      }
                    : item
                )
              : [
                  ...draft.candidateInterviews,
                  {
                    id: id('interview'),
                    candidateId: assessment.candidateId,
                    scheduledAt: nowIso(),
                    interviewer: assessment.interviewer || currentUserId,
                    result,
                    notes,
                  },
                ],
            candidateActivities: [
              ...draft.candidateActivities,
              {
                id: id('activity'),
                candidateId: assessment.candidateId,
                text: `Lưu kết quả phỏng vấn ${assessment.questionSet}: ${result} (${assessment.scorePercent}/100)`,
                ...(shouldAdvanceStage ? { fromStage: candidate.stage, toStage: 'interviewed' as CandidateStage } : {}),
                createdAt: nowIso(),
              },
            ],
          };
        });
      },
      createInterviewQuestionSet(input) {
        const set: CustomInterviewQuestionSet = {
          id: id('interview_set'),
          title: input.title.trim(),
          department: input.department,
          sections: [
            {
              id: id('interview_section'),
              title: input.sectionTitle.trim() || 'Nhóm câu hỏi',
              questions: input.questions.map((question) => question.trim()).filter(Boolean),
            },
          ],
          createdAt: nowIso(),
        };
        persist((draft) => ({
          ...draft,
          customInterviewQuestionSets: [...(draft.customInterviewQuestionSets ?? []), set],
        }));
        return set;
      },
      addInterviewQuestion(setId, sectionTitle, question) {
        const normalizedQuestion = question.trim();
        const normalizedSectionTitle = sectionTitle.trim() || 'Câu hỏi thêm';
        if (!normalizedQuestion) return;

        persist((draft) => ({
          ...draft,
          interviewQuestionAdditions: [
            ...(draft.interviewQuestionAdditions ?? []),
            {
              id: id('interview_question'),
              setId,
              sectionTitle: normalizedSectionTitle,
              question: normalizedQuestion,
              createdAt: nowIso(),
            },
          ],
        }));
      },
      resetDemoData() {
        const seed = createSeedState();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
        void saveRemoteState(seed);
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

import {
  Briefcase,
  CalendarClock,
  Globe,
  Handshake,
  LayoutGrid,
  Plus,
  UserPlus,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import { candidateStages, Department, formatDateTime, useCrm } from '../lib/crmStore';

export default function RecruitmentDashboard() {
  const { recruitmentJobs, candidates, candidateInterviews, createRecruitmentJob } = useCrm();
  const activeJobs = recruitmentJobs.filter((job) => job.status === 'Đang mở');
  const newCandidates = candidates.filter((candidate) => candidate.stage === 'new');
  const interviewing = candidates.filter((candidate) => candidate.stage === 'interview_scheduled' || candidate.stage === 'interviewed');
  const hired = candidates.filter((candidate) => candidate.stage === 'official');
  const totalCandidates = Math.max(1, candidates.length);

  const stats = [
    { label: 'Vị trí mở', value: activeJobs.length, detail: `${recruitmentJobs.length} tổng vị trí`, icon: Briefcase, tone: 'bg-primary/10 text-primary' },
    { label: 'Ứng viên mới', value: newCandidates.length, detail: 'Stage đầu pipeline', icon: UserPlus, tone: 'bg-secondary-container text-on-secondary-container' },
    { label: 'Phỏng vấn', value: interviewing.length, detail: `${candidateInterviews.length} lịch đã tạo`, icon: CalendarClock, tone: 'bg-tertiary-container/15 text-tertiary' },
    { label: 'Chính thức', value: hired.length, detail: 'Đã chuyển nhân viên', icon: Handshake, tone: 'bg-primary-fixed text-on-primary-fixed' },
  ];

  const pipeline = candidateStages.map((stage) => {
    const value = candidates.filter((candidate) => candidate.stage === stage.id).length;
    return { label: stage.label, value, progress: Math.round((value / totalCandidates) * 100) };
  });

  const upcomingInterviews = candidateInterviews
    .filter((interview) => !interview.result)
    .map((interview) => ({ interview, candidate: candidates.find((candidate) => candidate.id === interview.candidateId) }))
    .filter((item) => item.candidate)
    .slice(0, 4);

  const sources = Array.from(new Set<string>(candidates.map((candidate) => candidate.source))).map((source) => {
    const value = candidates.filter((candidate) => candidate.source === source).length;
    return {
      label: source,
      value: Math.round((value / totalCandidates) * 100),
      icon: source.toLowerCase().includes('facebook') ? Globe : source.toLowerCase().includes('referral') ? Users : Briefcase,
    };
  });

  function handleCreateJob() {
    const title = window.prompt('Tên vị trí tuyển dụng');
    if (!title) return;
    const department = (window.prompt('Phòng ban: Sale / Kỹ thuật / Marketing', 'Kỹ thuật') || 'Kỹ thuật') as Department;
    const quantityNeeded = Number(window.prompt('Số lượng cần tuyển', '1') || '1');
    createRecruitmentJob({ title, department, quantityNeeded, status: 'Đang mở' });
  }

  return (
    <div className="page-shell max-w-7xl">
      <section className="section-card p-5 md:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow mb-2">Recruitment / Kanban</p>
            <h1 className="text-3xl font-black text-on-surface">Tuyển dụng</h1>
            <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-on-surface-variant">
              Quản lý vị trí tuyển dụng, nguồn ứng viên, lịch phỏng vấn, kết quả đánh giá và pipeline tuyển dụng rõ ràng.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={handleCreateJob} className="btn-primary">
              <Plus className="size-4" />
              Tạo tin mới
            </button>
            <Link to="/recruitment/candidates" className="btn-secondary">
              <LayoutGrid className="size-4" />
              Kanban
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="metric-card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="eyebrow">{stat.label}</p>
                <p className="mt-3 text-3xl font-black text-on-surface">{stat.value}</p>
                <p className="mt-1 text-xs font-semibold text-on-surface-variant">{stat.detail}</p>
              </div>
              <div className={cn('flex size-10 items-center justify-center rounded-lg', stat.tone)}>
                <stat.icon className="size-5" />
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="section-card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-outline-variant p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="eyebrow">Recruitment jobs</p>
            <h2 className="mt-1 text-lg font-black text-on-surface">Bảng vị trí tuyển dụng</h2>
          </div>
          <span className="status-pill border-secondary/20 bg-secondary-container text-on-secondary-container">
            {activeJobs.length} đang mở
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-container-low text-[10px] uppercase tracking-widest text-on-surface-variant">
              <tr>
                <th className="p-4 text-left">Vị trí</th>
                <th className="p-4 text-left">Phòng ban</th>
                <th className="p-4 text-center">Cần tuyển</th>
                <th className="p-4 text-center">Đã nhận</th>
                <th className="p-4 text-left">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/60">
              {recruitmentJobs.map((job) => {
                const fill = job.quantityNeeded ? Math.round((job.quantityHired / job.quantityNeeded) * 100) : 0;
                return (
                  <tr key={job.id} className="hover:bg-surface-container-low/50">
                    <td className="p-4">
                      <p className="font-black text-on-surface">{job.title}</p>
                      <div className="mt-2 h-1.5 w-36 overflow-hidden rounded-full bg-surface-container">
                        <div className="h-full rounded-full bg-secondary" style={{ width: `${fill}%` }} />
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-on-surface-variant">{job.department}</td>
                    <td className="p-4 text-center font-mono font-bold">{job.quantityNeeded}</td>
                    <td className="p-4 text-center font-mono font-black text-primary">{job.quantityHired}</td>
                    <td className="p-4">
                      <span className="status-pill border-primary/20 bg-primary/10 text-primary">{job.status}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="section-card p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="eyebrow">Kanban stages</p>
              <h2 className="mt-1 text-lg font-black text-on-surface">Ứng viên theo pipeline</h2>
            </div>
            <Link to="/recruitment/candidates" className="text-xs font-black uppercase tracking-widest text-primary">Mở bảng</Link>
          </div>
          <div className="space-y-3">
            {pipeline.map((item, index) => (
              <div key={item.label}>
                <div className="mb-2 flex justify-between text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                  <span>{item.label}</span>
                  <span className="font-mono text-on-surface">{item.value}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${item.progress}%` }} transition={{ duration: 0.7, delay: index * 0.03 }} className="h-full rounded-full bg-primary" />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="section-card overflow-hidden">
          <div className="border-b border-outline-variant bg-surface-container-low/50 p-5">
            <p className="eyebrow">Interview schedule</p>
            <h2 className="mt-1 text-lg font-black text-on-surface">Lịch phỏng vấn</h2>
          </div>
          <ul className="divide-y divide-outline-variant/60">
            {upcomingInterviews.map(({ interview, candidate }) => (
              <li key={interview.id} className="flex items-center gap-4 p-5 transition-colors hover:bg-surface-container-low">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-fixed font-black text-on-primary-fixed">
                  {candidate?.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-black text-on-surface">{candidate?.name}</p>
                  <p className="mt-1 truncate text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{interview.interviewer}</p>
                </div>
                <p className="max-w-28 text-right text-xs font-black text-primary">{formatDateTime(interview.scheduledAt)}</p>
              </li>
            ))}
            {upcomingInterviews.length === 0 && <li className="p-5 text-sm font-medium text-on-surface-variant">Chưa có lịch phỏng vấn sắp tới.</li>}
          </ul>
        </section>
      </div>

      <section className="section-card p-5">
        <div className="mb-5">
          <p className="eyebrow">Candidate sources</p>
          <h2 className="mt-1 text-lg font-black text-on-surface">Nguồn ứng viên</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {sources.map((source) => (
            <div key={source.label} className="rounded-lg border border-outline-variant/60 bg-surface-container-low p-4">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-surface text-on-surface-variant ring-1 ring-outline-variant/70">
                    <source.icon className="size-4" />
                  </div>
                  <span className="text-sm font-black text-on-surface">{source.label}</span>
                </div>
                <span className="font-mono text-sm font-black text-primary">{source.value}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-surface-container">
                <div className="h-full rounded-full bg-tertiary-container" style={{ width: `${source.value}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

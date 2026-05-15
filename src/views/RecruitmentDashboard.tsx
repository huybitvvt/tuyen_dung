import {
  Briefcase,
  CalendarClock,
  Globe,
  Handshake,
  LayoutGrid,
  MessageCircleQuestion,
  Plus,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import { candidateStages, Department, formatDateTime, useCrm } from '../lib/crmStore';
import { FormEvent, useState } from 'react';

export default function RecruitmentDashboard() {
  const { recruitmentJobs, candidates, candidateInterviews, createRecruitmentJob } = useCrm();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [jobForm, setJobForm] = useState({
    title: '',
    department: 'Kỹ thuật' as Department,
    quantityNeeded: 1,
  });
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

  function resetJobForm() {
    setJobForm({
      title: '',
      department: 'Kỹ thuật',
      quantityNeeded: 1,
    });
  }

  function handleSubmitJob(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = jobForm.title.trim();
    if (!title) return;
    createRecruitmentJob({ 
      title, 
      department: jobForm.department, 
      quantityNeeded: jobForm.quantityNeeded, 
      status: 'Đang mở' 
    });
    setIsCreateOpen(false);
    resetJobForm();
  }

  return (
    <div className="page-shell max-w-7xl">
      <section className="section-card p-3.5 md:p-5 hover:border-home-primary/20 hover:shadow-md hover:shadow-home-primary/10">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow mb-2">Recruitment / Kanban</p>
            <h1 className="text-xl font-black text-on-surface md:text-2xl">Tuyển dụng</h1>
            <p className="mt-2 max-w-2xl text-xs font-semibold leading-5 text-on-surface-variant md:text-[13px]">
              Quản lý vị trí tuyển dụng, nguồn ứng viên, lịch phỏng vấn, kết quả đánh giá và pipeline tuyển dụng rõ ràng.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setIsCreateOpen(true)} className="btn-primary">
              <Plus className="size-4" />
              Tạo tin mới
            </button>
            <Link to="/recruitment/candidates" className="btn-secondary">
              <LayoutGrid className="size-4" />
              Kanban
            </Link>
            <Link to="/recruitment/interview-questions" className="btn-secondary">
              <MessageCircleQuestion className="size-4" />
              Bộ câu hỏi PV
            </Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-2 md:gap-3 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="metric-card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="eyebrow">{stat.label}</p>
                <p className="mt-1 text-lg font-black text-on-surface md:text-xl">{stat.value}</p>
                <p className="mt-1 text-[11px] font-semibold text-on-surface-variant md:text-xs">{stat.detail}</p>
              </div>
              <div className={cn('flex size-8 items-center justify-center rounded-lg', stat.tone)}>
                <stat.icon className="size-4" />
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="section-card overflow-hidden hover:border-home-primary/20 hover:shadow-md hover:shadow-home-primary/10">
        <div className="flex flex-col gap-3 border-b border-outline-variant p-3.5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="eyebrow">Recruitment jobs</p>
            <h2 className="mt-1 text-base font-black text-on-surface">Bảng vị trí tuyển dụng</h2>
          </div>
          <span className="status-pill border-secondary/20 bg-secondary-container text-on-secondary-container">
            {activeJobs.length} đang mở
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead className="bg-surface-container-low text-[10px] uppercase tracking-widest text-on-surface-variant">
              <tr>
                <th className="p-2.5 text-left">Vị trí</th>
                <th className="p-2.5 text-left">Phòng ban</th>
                <th className="p-2.5 text-center">Cần tuyển</th>
                <th className="p-2.5 text-center">Đã nhận</th>
                <th className="p-2.5 text-left">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/60">
              {recruitmentJobs.map((job) => {
                const fill = job.quantityNeeded ? Math.round((job.quantityHired / job.quantityNeeded) * 100) : 0;
                return (
                  <tr key={job.id} className="transition-colors hover:bg-surface-container-low/50">
                    <td className="p-2.5">
                      <p className="font-black text-on-surface">{job.title}</p>
                      <div className="mt-2 h-1.5 w-36 overflow-hidden rounded-full bg-surface-container">
                        <div className="h-full rounded-full bg-secondary" style={{ width: `${fill}%` }} />
                      </div>
                    </td>
                    <td className="p-2.5 font-semibold text-on-surface-variant">{job.department}</td>
                    <td className="p-2.5 text-center font-mono font-bold">{job.quantityNeeded}</td>
                    <td className="p-2.5 text-center font-mono font-black text-primary">{job.quantityHired}</td>
                    <td className="p-2.5">
                      <span className="status-pill border-primary/20 bg-primary/10 text-primary">{job.status}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="section-card p-3.5 hover:border-home-primary/20 hover:shadow-md hover:shadow-home-primary/10">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="eyebrow">Kanban stages</p>
              <h2 className="mt-1 text-base font-black text-on-surface">Ứng viên theo pipeline</h2>
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

        <section className="section-card overflow-hidden hover:border-home-primary/20 hover:shadow-md hover:shadow-home-primary/10">
          <div className="border-b border-outline-variant bg-surface-container-low/50 p-3.5">
            <p className="eyebrow">Interview schedule</p>
            <h2 className="mt-1 text-base font-black text-on-surface">Lịch phỏng vấn</h2>
          </div>
          <ul className="divide-y divide-outline-variant/60">
            {upcomingInterviews.map(({ interview, candidate }) => (
              <li key={interview.id} className="flex items-center gap-3 p-3.5 transition-colors hover:bg-surface-container-low">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-fixed font-black text-on-primary-fixed">
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

      <section className="section-card p-3.5 md:p-4 hover:border-home-primary/20 hover:shadow-md hover:shadow-home-primary/10">
        <div className="mb-4">
          <p className="eyebrow">Candidate sources</p>
          <h2 className="mt-1 text-base font-black text-on-surface">Nguồn ứng viên</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {sources.map((source) => (
            <div key={source.label} className="rounded-lg border border-outline-variant/60 bg-surface-container-low p-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-sm">
              <div className="mb-3 flex items-center justify-between">
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

      {isCreateOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 px-3 py-6 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="w-full max-w-xl overflow-hidden rounded-2xl border border-outline-variant bg-surface shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-outline-variant bg-surface-container-low p-5">
              <div>
                <p className="eyebrow">Tin tuyển dụng mới</p>
                <h2 className="mt-1 text-2xl font-black text-on-surface">Tạo vị trí tuyển dụng</h2>
                <p className="mt-2 text-sm font-semibold text-on-surface-variant">Điền thông tin vị trí cần tuyển để bắt đầu nhận ứng viên.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="flex size-9 shrink-0 items-center justify-center rounded-full border border-outline-variant bg-surface text-on-surface-variant transition hover:bg-surface-container-high hover:text-on-surface"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitJob} className="grid gap-4 p-5">
              <label className="block">
                <span className="eyebrow">Tên vị trí tuyển dụng</span>
                <input
                  value={jobForm.title}
                  onChange={(event) => setJobForm((current) => ({ ...current, title: event.target.value }))}
                  autoFocus
                  required
                  placeholder="VD: Frontend Developer, Sales Executive"
                  className="mt-2 h-12 w-full rounded-xl border border-outline-variant bg-surface px-4 text-sm font-bold text-on-surface outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="eyebrow">Phòng ban</span>
                  <select
                    value={jobForm.department}
                    onChange={(event) => setJobForm((current) => ({ ...current, department: event.target.value as Department }))}
                    className="mt-2 h-12 w-full rounded-xl border border-outline-variant bg-surface px-4 text-sm font-bold text-on-surface outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                  >
                    <option value="Sale">Sale</option>
                    <option value="Kỹ thuật">Kỹ thuật</option>
                    <option value="Marketing">Marketing</option>
                  </select>
                </label>

                <label className="block">
                  <span className="eyebrow">Số lượng cần tuyển</span>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={jobForm.quantityNeeded}
                    onChange={(event) => setJobForm((current) => ({ ...current, quantityNeeded: Number(event.target.value) }))}
                    className="mt-2 h-12 w-full rounded-xl border border-outline-variant bg-surface px-4 text-sm font-bold text-on-surface outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                  />
                </label>
              </div>

              <div className="flex flex-col-reverse gap-2 border-t border-outline-variant pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-outline-variant bg-surface px-5 text-xs font-black uppercase tracking-widest text-on-surface-variant transition hover:bg-surface-container-high hover:text-on-surface"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-xs font-black uppercase tracking-widest text-on-primary shadow-lg shadow-primary/20 transition hover:bg-primary-container active:scale-[0.98]"
                >
                  <Plus className="size-4" />
                  Tạo tin tuyển dụng
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

import {
  Briefcase,
  CalendarClock,
  ChevronRight,
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
import { motion, AnimatePresence } from 'motion/react';
import { candidateStages, Department, formatDateTime, useCrm } from '../lib/crmStore';
import { FormEvent, useEffect, useState } from 'react';

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
  const interviewing = candidates.filter(
    (candidate) => candidate.stage === 'interview_scheduled' || candidate.stage === 'interviewed'
  );
  const hired = candidates.filter((candidate) => candidate.stage === 'official');
  const totalCandidates = Math.max(1, candidates.length);

  const stats = [
    {
      label: 'Vị trí mở',
      value: activeJobs.length,
      detail: `${recruitmentJobs.length} tổng`,
      icon: Briefcase,
      tone: 'bg-primary/10 text-primary',
    },
    {
      label: 'Ứng viên mới',
      value: newCandidates.length,
      detail: 'Đầu pipeline',
      icon: UserPlus,
      tone: 'bg-secondary-container text-on-secondary-container',
    },
    {
      label: 'Đang PV',
      value: interviewing.length,
      detail: `${candidateInterviews.length} lịch`,
      icon: CalendarClock,
      tone: 'bg-tertiary-container/40 text-on-tertiary-container',
    },
    {
      label: 'Chính thức',
      value: hired.length,
      detail: 'Đã onboard',
      icon: Handshake,
      tone: 'bg-primary-fixed text-on-primary-fixed',
    },
  ];

  const pipeline = candidateStages
    .map((stage) => {
      const value = candidates.filter((candidate) => candidate.stage === stage.id).length;
      return {
        label: stage.label,
        value,
        progress: Math.round((value / totalCandidates) * 100),
      };
    })
    .filter((item) => item.value > 0);

  const upcomingInterviews = candidateInterviews
    .filter((interview) => !interview.result)
    .map((interview) => ({
      interview,
      candidate: candidates.find((candidate) => candidate.id === interview.candidateId),
    }))
    .filter((item) => item.candidate)
    .slice(0, 5);

  const sources = Array.from(new Set<string>(candidates.map((candidate) => candidate.source)))
    .map((source) => {
      const count = candidates.filter((candidate) => candidate.source === source).length;
      return {
        label: source,
        count,
        percent: Math.round((count / totalCandidates) * 100),
        icon: source.toLowerCase().includes('facebook')
          ? Globe
          : source.toLowerCase().includes('referral')
          ? Users
          : Briefcase,
      };
    })
    .sort((a, b) => b.count - a.count);

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
      status: 'Đang mở',
    });
    setIsCreateOpen(false);
    resetJobForm();
  }

  // Lock body scroll when modal open
  useEffect(() => {
    document.body.style.overflow = isCreateOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCreateOpen]);

  return (
    <div className="page-shell">
      {/* HERO */}
      <section className="section-card relative overflow-hidden rounded-2xl border-home-outline/80">
        <div className="absolute -right-12 -top-12 size-40 rounded-full bg-secondary/10 blur-3xl" />
        <div className="absolute -left-10 -bottom-12 size-36 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative z-10 p-4 md:p-6">
          <p className="eyebrow">Recruitment / Kanban</p>
          <h1 className="mt-1 font-display text-[24px] font-bold leading-tight text-on-surface md:text-[30px]">Tuyển dụng</h1>
          <p className="mt-1.5 max-w-2xl text-[12px] font-semibold leading-5 text-on-surface-variant md:text-[13px]">
            Quản lý vị trí, ứng viên, lịch phỏng vấn và pipeline tuyển dụng.
          </p>

          <div className="mt-3.5 grid grid-cols-2 gap-2 md:flex md:flex-wrap">
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="col-span-2 flex h-10 items-center justify-center gap-1.5 rounded-xl bg-primary px-4 text-[11px] font-black uppercase tracking-[0.12em] text-on-primary shadow-sm shadow-primary/25 transition active:scale-95 hover:bg-primary-container md:col-span-1"
            >
              <Plus className="size-4" strokeWidth={2.5} />
              <span>Tạo tin mới</span>
            </button>
            <Link
              to="/recruitment/candidates"
              className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-outline-variant bg-surface px-4 text-[10.5px] font-black uppercase tracking-[0.10em] text-on-surface-variant transition active:scale-95 hover:border-primary/30 hover:text-primary"
            >
              <LayoutGrid className="size-3.5" strokeWidth={2.5} />
              <span>Kanban ứng viên</span>
            </Link>
            <Link
              to="/recruitment/interview-questions"
              className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-outline-variant bg-surface px-4 text-[10.5px] font-black uppercase tracking-[0.10em] text-on-surface-variant transition active:scale-95 hover:border-primary/30 hover:text-primary"
            >
              <MessageCircleQuestion className="size-3.5" strokeWidth={2.5} />
              <span>Bộ câu hỏi PV</span>
            </Link>
          </div>
        </div>
      </section>

      {/* STATS GRID */}
      <section className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-outline-variant bg-surface p-3 shadow-sm md:p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="truncate text-[10px] font-black uppercase tracking-[0.14em] text-on-surface-variant">
                  {stat.label}
                </p>
                <p className="mt-1 font-mono text-[20px] font-black tabular-nums text-on-surface md:text-[24px]">
                  {stat.value}
                </p>
                <p className="truncate text-[10.5px] font-semibold text-on-surface-variant">{stat.detail}</p>
              </div>
              <div className={cn('flex size-8 shrink-0 items-center justify-center rounded-lg md:size-9', stat.tone)}>
                <stat.icon className="size-4 md:size-5" strokeWidth={2.2} />
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* JOBS LIST + Interview Schedule on desktop side-by-side */}
      <div className="grid gap-3 md:gap-4 lg:grid-cols-[1.5fr_1fr]">
        <section className="overflow-hidden rounded-2xl border border-outline-variant bg-surface shadow-sm">
          <header className="flex items-center justify-between gap-2 border-b border-outline-variant px-4 py-3 md:px-5 md:py-4">
            <div>
              <p className="eyebrow">Recruitment jobs</p>
              <h2 className="mt-0.5 text-[15px] font-black text-on-surface md:text-[16px]">Vị trí tuyển dụng</h2>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full border border-secondary/30 bg-secondary-container px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-on-secondary-container">
              {activeJobs.length} mở
            </span>
          </header>

          {/* Mobile list / Desktop table */}
          <div className="md:hidden">
            <ul className="divide-y divide-outline-variant/40">
              {recruitmentJobs.map((job) => {
                const fill = job.quantityNeeded ? Math.round((job.quantityHired / job.quantityNeeded) * 100) : 0;
                return (
                  <li key={job.id} className="px-4 py-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14px] font-black text-on-surface">{job.title}</p>
                        <p className="mt-0.5 text-[11px] font-semibold text-on-surface-variant">{job.department}</p>
                      </div>
                      <span
                        className={cn(
                          'shrink-0 rounded-full border px-2 py-0.5 text-[9.5px] font-black uppercase tracking-[0.10em]',
                          job.status === 'Đang mở' && 'border-primary/25 bg-primary/10 text-primary',
                          job.status === 'Tạm dừng' && 'border-tertiary/25 bg-tertiary-container/40 text-on-tertiary-container',
                          job.status === 'Đã đóng' && 'border-outline-variant bg-surface-container-low text-on-surface-variant'
                        )}
                      >
                        {job.status}
                      </span>
                    </div>
                    <div className="mt-2.5 flex items-center gap-2.5">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-container">
                        <div className="h-full rounded-full bg-secondary" style={{ width: `${fill}%` }} />
                      </div>
                      <span className="font-mono text-[10.5px] font-black tabular-nums text-on-surface-variant">
                        {job.quantityHired}/{job.quantityNeeded}
                      </span>
                    </div>
                  </li>
                );
              })}
              {recruitmentJobs.length === 0 && (
                <li className="px-4 py-6 text-center text-[12px] font-medium text-on-surface-variant">
                  Chưa có vị trí tuyển dụng nào.
                </li>
              )}
            </ul>
          </div>

          {/* Desktop table */}
          <div className="hidden md:block">
            <table className="w-full text-[13px]">
              <thead className="bg-surface-container-low/60 text-[10px] uppercase tracking-[0.14em] text-on-surface-variant">
                <tr>
                  <th className="px-5 py-3 text-left font-black">Vị trí</th>
                  <th className="px-3 py-3 text-left font-black">Phòng ban</th>
                  <th className="px-3 py-3 text-center font-black">Tiến độ</th>
                  <th className="px-3 py-3 text-left font-black">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/50">
                {recruitmentJobs.map((job) => {
                  const fill = job.quantityNeeded ? Math.round((job.quantityHired / job.quantityNeeded) * 100) : 0;
                  return (
                    <tr key={job.id} className="transition-colors hover:bg-surface-container-low/40">
                      <td className="px-5 py-3 font-black text-on-surface">{job.title}</td>
                      <td className="px-3 py-3 font-semibold text-on-surface-variant">{job.department}</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-surface-container">
                            <div className="h-full rounded-full bg-secondary" style={{ width: `${fill}%` }} />
                          </div>
                          <span className="font-mono text-[11px] font-black tabular-nums text-on-surface-variant">
                            {job.quantityHired}/{job.quantityNeeded}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9.5px] font-black uppercase tracking-[0.10em]',
                            job.status === 'Đang mở' && 'border-primary/25 bg-primary/10 text-primary',
                            job.status === 'Tạm dừng' && 'border-tertiary/25 bg-tertiary-container/40 text-on-tertiary-container',
                            job.status === 'Đã đóng' && 'border-outline-variant bg-surface-container-low text-on-surface-variant'
                          )}
                        >
                          {job.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {recruitmentJobs.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-[12px] font-medium text-on-surface-variant">
                      Chưa có vị trí tuyển dụng nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* INTERVIEW SCHEDULE */}
        <section className="overflow-hidden rounded-2xl border border-outline-variant bg-surface shadow-sm">
          <header className="flex items-center justify-between gap-2 border-b border-outline-variant px-4 py-3 md:px-5 md:py-4">
            <div>
              <p className="eyebrow">Interview schedule</p>
              <h2 className="mt-0.5 text-[15px] font-black text-on-surface md:text-[16px]">Lịch PV sắp tới</h2>
            </div>
            {upcomingInterviews.length > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full border border-primary/25 bg-primary-fixed px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-primary">
                {upcomingInterviews.length}
              </span>
            )}
          </header>
          {upcomingInterviews.length > 0 ? (
            <ul className="divide-y divide-outline-variant/40">
              {upcomingInterviews.map(({ interview, candidate }) => (
                <li key={interview.id} className="flex items-start gap-3 px-4 py-3 md:px-5">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-fixed font-black text-on-primary-fixed">
                    {candidate?.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-black text-on-surface">{candidate?.name}</p>
                    <p className="mt-0.5 truncate text-[11px] font-semibold text-on-surface-variant">
                      PV bởi {interview.interviewer}
                    </p>
                    <div className="mt-1.5 inline-flex items-center gap-1 rounded-full border border-primary/25 bg-primary-fixed px-2 py-0.5 text-[10px] font-black tabular-nums text-primary">
                      <CalendarClock className="size-3" strokeWidth={2.5} />
                      {formatDateTime(interview.scheduledAt)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 px-4 py-8">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-surface-container-low/60 text-on-surface-variant">
                <CalendarClock className="size-5" strokeWidth={2} />
              </div>
              <p className="text-[12.5px] font-bold text-on-surface">Chưa có lịch phỏng vấn</p>
              <p className="text-center text-[11px] font-medium text-on-surface-variant">
                Tạo lịch phỏng vấn từ hồ sơ ứng viên để hiển thị tại đây.
              </p>
            </div>
          )}
        </section>
      </div>

      {/* PIPELINE + SOURCES on desktop side-by-side */}
      <div className="grid gap-3 md:gap-4 lg:grid-cols-2">
        {pipeline.length > 0 && (
          <section className="overflow-hidden rounded-2xl border border-outline-variant bg-surface shadow-sm">
            <header className="flex items-center justify-between gap-2 border-b border-outline-variant px-4 py-3 md:px-5 md:py-4">
              <div>
                <p className="eyebrow">Kanban stages</p>
                <h2 className="mt-0.5 text-[15px] font-black text-on-surface md:text-[16px]">Ứng viên theo pipeline</h2>
              </div>
              <Link
                to="/recruitment/candidates"
                className="inline-flex items-center gap-0.5 text-[11px] font-black uppercase tracking-[0.10em] text-primary"
              >
                Mở
                <ChevronRight className="size-3.5" strokeWidth={2.5} />
              </Link>
            </header>
            <div className="space-y-2.5 p-4 md:p-5">
              {pipeline.map((item, index) => (
                <div key={item.label}>
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <span className="truncate text-[11.5px] font-black text-on-surface md:text-[12.5px]">{item.label}</span>
                    <span className="font-mono text-[10.5px] font-black tabular-nums text-on-surface-variant">
                      {item.value}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-surface-container">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.progress}%` }}
                      transition={{ duration: 0.7, delay: index * 0.04 }}
                      className="h-full rounded-full bg-primary"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SOURCES */}
        <section className="overflow-hidden rounded-2xl border border-outline-variant bg-surface shadow-sm">
          <header className="border-b border-outline-variant px-4 py-3 md:px-5 md:py-4">
            <p className="eyebrow">Candidate sources</p>
            <h2 className="mt-0.5 text-[15px] font-black text-on-surface md:text-[16px]">Nguồn ứng viên</h2>
          </header>
          <ul className="divide-y divide-outline-variant/40">
            {sources.map((source) => (
              <li key={source.label} className="px-4 py-3 md:px-5">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-surface-container-low text-on-surface-variant ring-1 ring-outline-variant/60">
                    <source.icon className="size-4" strokeWidth={2.2} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-black text-on-surface">{source.label}</p>
                    <p className="text-[11px] font-semibold text-on-surface-variant">
                      {source.count} ứng viên
                    </p>
                  </div>
                  <span className="font-mono text-[14px] font-black tabular-nums text-primary">
                    {source.percent}%
                  </span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-container">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${source.percent}%` }}
                    transition={{ duration: 0.6 }}
                    className="h-full rounded-full bg-tertiary-container"
                  />
                </div>
              </li>
            ))}
            {sources.length === 0 && (
              <li className="px-4 py-6 text-center text-[12px] font-medium text-on-surface-variant">
                Chưa có dữ liệu nguồn ứng viên.
              </li>
            )}
          </ul>
        </section>
      </div>

      {/* CREATE JOB BOTTOM SHEET */}
      <AnimatePresence>
        {isCreateOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[80] flex items-end justify-center bg-black/55 backdrop-blur-sm"
            onClick={() => setIsCreateOpen(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md overflow-hidden rounded-t-3xl border border-b-0 border-outline-variant bg-surface shadow-[0_-12px_50px_rgba(0,0,0,0.16)]"
            >
              <div className="flex justify-center pt-2.5 pb-1">
                <div className="h-1 w-10 rounded-full bg-outline-variant/70" />
              </div>

              <div className="flex items-center gap-3 px-4 pt-2 pb-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-on-primary shadow-sm shadow-primary/25">
                  <Plus className="size-5" strokeWidth={2.5} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="eyebrow">Tin tuyển dụng mới</p>
                  <h3 className="mt-0.5 truncate font-display text-[18px] font-bold leading-tight text-on-surface">
                    Tạo vị trí
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="flex size-9 shrink-0 items-center justify-center rounded-full border border-outline-variant bg-surface text-on-surface-variant transition active:scale-90 hover:bg-surface-container-high hover:text-on-surface"
                  aria-label="Đóng"
                >
                  <X className="size-4" strokeWidth={2.5} />
                </button>
              </div>

              <form onSubmit={handleSubmitJob} className="grid gap-3 border-t border-outline-variant p-4">
                <label className="block">
                  <span className="eyebrow">Tên vị trí</span>
                  <input
                    value={jobForm.title}
                    onChange={(event) => setJobForm((current) => ({ ...current, title: event.target.value }))}
                    autoFocus
                    required
                    placeholder="VD: Sale Junior, Frontend Dev..."
                    className="mt-1.5 h-12 w-full rounded-2xl border border-outline-variant bg-surface px-4 text-[13.5px] font-bold text-on-surface outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                  />
                </label>

                <label className="block">
                  <span className="eyebrow">Phòng ban</span>
                  <select
                    value={jobForm.department}
                    onChange={(event) =>
                      setJobForm((current) => ({ ...current, department: event.target.value as Department }))
                    }
                    className="mt-1.5 h-12 w-full appearance-none rounded-2xl border border-outline-variant bg-surface px-4 text-[13.5px] font-bold text-on-surface outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
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
                    onChange={(event) =>
                      setJobForm((current) => ({ ...current, quantityNeeded: Number(event.target.value) }))
                    }
                    className="mt-1.5 h-12 w-full rounded-2xl border border-outline-variant bg-surface px-4 text-[13.5px] font-bold text-on-surface outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                  />
                </label>

                <div className="mt-1 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="inline-flex h-12 items-center justify-center rounded-2xl border border-outline-variant bg-surface text-[11px] font-black uppercase tracking-[0.12em] text-on-surface-variant transition active:scale-95 hover:bg-surface-container-high"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="inline-flex h-12 items-center justify-center gap-1.5 rounded-2xl bg-primary text-[11px] font-black uppercase tracking-[0.12em] text-on-primary shadow-md shadow-primary/25 transition active:scale-95 hover:bg-primary-container"
                  >
                    <Plus className="size-4" strokeWidth={2.5} />
                    Tạo tin
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

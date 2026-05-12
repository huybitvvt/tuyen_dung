import {
  Briefcase,
  UserPlus,
  Mic,
  Handshake,
  Plus,
  Globe,
  Users,
  LayoutGrid,
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

  const stats = [
    { label: 'Tổng vị trí', value: activeJobs.length, icon: Briefcase, status: 'Đang mở', color: 'text-secondary', bg: 'bg-surface-container-lowest' },
    { label: 'Ứng viên mới', value: newCandidates.length, icon: UserPlus, color: 'text-on-primary-container', bg: 'bg-primary-container' },
    { label: 'Đang phỏng vấn', value: interviewing.length, icon: Mic, color: 'text-tertiary', bg: 'bg-surface-container-lowest' },
    { label: 'Đã nhận việc', value: hired.length, icon: Handshake, color: 'text-on-secondary-container', bg: 'bg-secondary-container' },
  ];

  const totalCandidates = Math.max(1, candidates.length);
  const pipeline = candidateStages.map((stage) => {
    const value = candidates.filter((candidate) => candidate.stage === stage.id).length;
    return { label: stage.label, value, progress: Math.round((value / totalCandidates) * 100) };
  });

  const upcomingInterviews = candidateInterviews
    .filter((interview) => !interview.result)
    .map((interview) => ({ interview, candidate: candidates.find((candidate) => candidate.id === interview.candidateId) }))
    .filter((item) => item.candidate)
    .slice(0, 3);

  const sources = Array.from(new Set<string>(candidates.map((candidate) => candidate.source))).map((source) => {
    const value = candidates.filter((candidate) => candidate.source === source).length;
    return { label: source, value: Math.round((value / totalCandidates) * 100), icon: source.toLowerCase().includes('facebook') ? Globe : source.toLowerCase().includes('referral') ? Users : Briefcase };
  });

  function handleCreateJob() {
    const title = window.prompt('Tên vị trí tuyển dụng');
    if (!title) return;
    const department = (window.prompt('Phòng ban: Sale / Kỹ thuật / Marketing', 'Kỹ thuật') || 'Kỹ thuật') as Department;
    const quantityNeeded = Number(window.prompt('Số lượng cần tuyển', '1') || '1');
    createRecruitmentJob({ title, department, quantityNeeded, status: 'Đang mở' });
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-on-surface">Tuyển dụng</h2>
        <button onClick={handleCreateJob} className="bg-primary text-on-primary px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-primary/20 flex items-center gap-2 active:scale-95 transition-all">
          <Plus className="size-4" />
          Tạo tin mới
        </button>
      </div>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className={cn('p-4 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col justify-between min-h-[140px]', stat.bg)}>
            <div className="flex justify-between items-start mb-2">
              <stat.icon className={cn('size-5', stat.color)} />
              {stat.status && <span className="text-[8px] font-black uppercase tracking-widest bg-surface-container-low text-on-surface-variant px-2 py-0.5 rounded-full">{stat.status}</span>}
            </div>
            <div>
              <div className={cn('text-3xl font-black', stat.color.includes('on-primary') ? 'text-white' : 'text-on-surface')}>{stat.value}</div>
              <div className={cn('text-[10px] font-bold uppercase tracking-widest', stat.color.includes('on-primary') ? 'text-on-primary-container/70' : 'text-on-surface-variant')}>{stat.label}</div>
            </div>
          </div>
        ))}
      </section>

      <section className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 overflow-hidden">
        <div className="p-5 border-b border-outline-variant/30 flex items-center justify-between">
          <h3 className="text-lg font-black text-on-surface uppercase tracking-widest">Bảng vị trí tuyển dụng</h3>
          <Link to="/recruitment/candidates" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
            <LayoutGrid className="size-3" /> Kanban
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-container-low text-on-surface-variant text-[10px] uppercase tracking-widest">
              <tr>
                <th className="text-left p-4">Vị trí</th>
                <th className="text-left p-4">Phòng ban</th>
                <th className="text-center p-4">Cần tuyển</th>
                <th className="text-center p-4">Đã nhận</th>
                <th className="text-left p-4">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {recruitmentJobs.map((job) => (
                <tr key={job.id} className="hover:bg-surface-container-low/40">
                  <td className="p-4 font-bold text-on-surface">{job.title}</td>
                  <td className="p-4 text-on-surface-variant">{job.department}</td>
                  <td className="p-4 text-center font-mono">{job.quantityNeeded}</td>
                  <td className="p-4 text-center font-mono text-primary font-bold">{job.quantityHired}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest">{job.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/30">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-black text-on-surface uppercase tracking-widest">Tuyến trình ứng viên</h3>
            <Link to="/recruitment/candidates" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
              <LayoutGrid className="size-3" /> Kanban
            </Link>
          </div>
          <div className="space-y-4">
            {pipeline.map((item, index) => (
              <div key={item.label}>
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2 text-on-surface-variant">
                  <span>{item.label}</span>
                  <span className="font-mono text-on-surface">{item.value}</span>
                </div>
                <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${item.progress}%` }} transition={{ duration: 0.8, delay: index * 0.04 }} className="h-full rounded-full bg-primary" />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 overflow-hidden">
          <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-low/30">
            <h3 className="text-lg font-black text-on-surface uppercase tracking-widest">Lịch phỏng vấn</h3>
          </div>
          <ul className="divide-y divide-outline-variant/30">
            {upcomingInterviews.map(({ interview, candidate }) => (
              <li key={interview.id} className="p-5 flex items-center gap-4 hover:bg-surface-container-low transition-colors group">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-xs shrink-0 bg-primary-fixed text-on-primary-fixed">
                  {candidate?.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-grow min-w-0">
                  <p className="text-sm font-bold text-on-surface truncate">{candidate?.name}</p>
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest truncate">{interview.interviewer}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-black text-primary">{formatDateTime(interview.scheduledAt)}</p>
                </div>
              </li>
            ))}
            {upcomingInterviews.length === 0 && <li className="p-5 text-sm text-on-surface-variant">Chưa có lịch phỏng vấn sắp tới.</li>}
          </ul>
        </section>
      </div>

      <section className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/30">
        <h3 className="text-lg font-black text-on-surface uppercase tracking-widest mb-6">Nguồn ứng viên</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {sources.map((source) => (
            <div key={source.label} className="flex items-center justify-between bg-surface-container-low/50 p-4 rounded-xl border border-outline-variant/20">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-surface-variant rounded-lg flex items-center justify-center text-on-surface-variant">
                  <source.icon className="size-4" />
                </div>
                <span className="text-xs font-bold text-on-surface">{source.label}</span>
              </div>
              <span className="text-xs font-black text-primary">{source.value}%</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

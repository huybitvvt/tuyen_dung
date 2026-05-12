import {
  ArrowLeft,
  MoreVertical,
  Phone,
  Mail,
  Globe,
  Download,
  Eye,
  CheckCircle,
  User,
  FileEdit,
  Calendar,
  RefreshCw,
  FileText,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { cn } from '../lib/utils';
import { CandidateStage, candidateStages, formatDateTime, stageLabel, useCrm } from '../lib/crmStore';

export default function CandidateProfile() {
  const navigate = useNavigate();
  const { id } = useParams();
  const {
    candidates,
    recruitmentJobs,
    candidateActivities,
    candidateInterviews,
    candidateFiles,
    moveCandidateStage,
    scheduleInterview,
    recordInterviewResult,
  } = useCrm();

  const candidate = candidates.find((item) => item.id === id);
  if (!candidate) {
    return (
      <div className="p-8">
        <button onClick={() => navigate(-1)} className="text-primary font-bold">Quay lại</button>
        <p className="mt-4">Không tìm thấy ứng viên.</p>
      </div>
    );
  }

  const job = recruitmentJobs.find((item) => item.id === candidate.jobId);
  const activities = candidateActivities
    .filter((item) => item.candidateId === candidate.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const interviews = candidateInterviews.filter((item) => item.candidateId === candidate.id);
  const files = candidateFiles.filter((item) => item.candidateId === candidate.id);

  function handleScheduleInterview() {
    const scheduledAt = window.prompt('Thời gian phỏng vấn ISO hoặc yyyy-mm-ddThh:mm', new Date(Date.now() + 86400000).toISOString().slice(0, 16));
    if (!scheduledAt) return;
    const interviewer = window.prompt('Người phỏng vấn', 'Trần Thị B') || 'HR';
    scheduleInterview(candidate.id, new Date(scheduledAt).toISOString(), interviewer);
    moveCandidateStage(candidate.id, 'interview_scheduled');
  }

  function handleRecordResult() {
    const interview = interviews.at(-1);
    if (!interview) return handleScheduleInterview();
    const result = (window.prompt('Kết quả: Đạt / Không đạt / Cần cân nhắc', 'Đạt') || 'Đạt') as 'Đạt' | 'Không đạt' | 'Cần cân nhắc';
    const notes = window.prompt('Ghi chú kết quả', 'Đánh giá tốt về kỹ năng chuyên môn.') || '';
    recordInterviewResult(interview.id, result, notes);
    moveCandidateStage(candidate.id, result === 'Đạt' ? 'interviewed' : 'rejected');
  }

  function handleMoveStage() {
    const next = window.prompt(
      `Stage mới: ${candidateStages.map((stage) => stage.label).join(' / ')}`,
      stageLabel(candidate.stage)
    );
    const stage = candidateStages.find((item) => item.label.toLowerCase() === next?.toLowerCase() || item.id === next) as { id: CandidateStage } | undefined;
    if (stage) moveCandidateStage(candidate.id, stage.id);
  }

  return (
    <div className="flex flex-col min-h-screen bg-surface-container-low pb-24">
      <header className="sticky top-0 z-50 bg-surface border-b border-outline-variant h-14 flex items-center justify-between px-4 w-full">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-on-surface-variant hover:bg-surface-container-high rounded-full">
          <ArrowLeft className="size-6" />
        </button>
        <h1 className="text-sm font-bold text-on-surface truncate px-4 uppercase tracking-widest">Hồ sơ ứng viên</h1>
        <button className="p-2 -mr-2 text-on-surface-variant hover:bg-surface-container-high rounded-full">
          <MoreVertical className="size-6" />
        </button>
      </header>

      <main className="p-4 flex flex-col gap-4 md:p-8 max-w-3xl mx-auto w-full">
        <section className="bg-surface-container-lowest rounded-2xl shadow-sm p-5 flex items-center gap-5 border border-outline-variant/30">
          <div className="size-20 rounded-full overflow-hidden shrink-0 border-4 border-surface-container-high shadow-sm bg-primary-fixed text-on-primary-fixed flex items-center justify-center text-2xl font-black">
            {candidate.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-black text-on-surface truncate">{candidate.name}</h2>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">{job?.title}</p>
            <span className="bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-primary/20 inline-flex items-center gap-1.5 shadow-sm">
              <div className="size-1.5 rounded-full bg-primary animate-pulse" />
              {stageLabel(candidate.stage)}
            </span>
          </div>
        </section>

        <section className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 overflow-hidden">
          <div className="p-4 border-b border-outline-variant/30 bg-surface-container-low/30">
            <h3 className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Thông tin ứng viên</h3>
          </div>
          <div className="flex flex-col">
            {[
              { icon: Phone, label: 'Số điện thoại', value: candidate.phone },
              { icon: Mail, label: 'Email', value: candidate.email },
              { icon: Globe, label: 'Nguồn ứng tuyển', value: candidate.source },
              { icon: User, label: 'Vị trí ứng tuyển', value: `${job?.title ?? ''} - ${job?.department ?? ''}` },
            ].map((item, index, arr) => (
              <div key={item.label} className={cn('p-4 flex items-center gap-4 hover:bg-surface-container-low/50 transition-colors', index !== arr.length - 1 && 'border-b border-outline-variant/20')}>
                <div className="size-9 rounded-lg bg-surface-container flex items-center justify-center text-primary shadow-sm border border-outline-variant/30">
                  <item.icon className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest opacity-60">{item.label}</p>
                  <p className="text-sm font-semibold text-on-surface truncate">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-surface-container-lowest rounded-2xl shadow-sm p-4 border border-outline-variant/30">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-60">CV / file đính kèm</h3>
            <button className="text-primary hover:bg-primary/10 p-2 rounded-full transition-all">
              <Download className="size-5" />
            </button>
          </div>
          {(files.length ? files : [{ id: 'fallback', name: candidate.cvFileName, url: '#' }]).map((file) => (
            <div key={file.id} className="w-full bg-surface-container rounded-xl border border-outline-variant/50 flex flex-col items-center justify-center py-10 relative overflow-hidden group cursor-pointer hover:border-primary transition-all shadow-inner">
              <FileText className="size-12 text-error mb-3 group-hover:scale-110 transition-transform duration-300" />
              <p className="text-sm font-black text-on-surface px-4 text-center">{file.name}</p>
              <p className="text-[10px] font-bold text-on-surface-variant opacity-60 mt-1 uppercase tracking-widest">Đã lưu trong candidate_files</p>
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                <span className="bg-white text-on-surface px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest shadow-xl flex items-center gap-2 -translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  <Eye className="size-4" /> Xem trước
                </span>
              </div>
            </div>
          ))}
        </section>

        <section className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 overflow-hidden">
          <div className="p-4 border-b border-outline-variant/30 bg-surface-container-low/30 flex items-center justify-between">
            <h3 className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Lịch phỏng vấn</h3>
            <button onClick={handleRecordResult} className="text-primary text-[10px] font-black uppercase tracking-widest">Ghi kết quả</button>
          </div>
          <div className="divide-y divide-outline-variant/20">
            {interviews.map((interview) => (
              <div key={interview.id} className="p-4">
                <p className="text-sm font-bold text-on-surface">{formatDateTime(interview.scheduledAt)} • {interview.interviewer}</p>
                <p className="text-xs text-on-surface-variant mt-1">{interview.result ? `${interview.result}: ${interview.notes}` : 'Chưa có kết quả'}</p>
              </div>
            ))}
            {interviews.length === 0 && <p className="p-4 text-sm text-on-surface-variant">Chưa tạo lịch phỏng vấn.</p>}
          </div>
        </section>

        <section className="bg-surface-container-lowest rounded-2xl shadow-sm p-6 border border-outline-variant/30 flex flex-col gap-8">
          <h3 className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-60">Lịch sử hoạt động</h3>
          <div className="relative pl-8 ml-2 border-l-2 border-surface-variant/30 space-y-10">
            {activities.map((item, index) => (
              <div key={item.id} className="relative group">
                <div className={cn('absolute -left-[43px] size-5 rounded-full border-4 border-surface-container-lowest shadow-sm z-10 transition-all', index === 0 ? 'bg-primary scale-125 ring-4 ring-primary/10' : 'bg-outline-variant/50 group-hover:bg-primary group-hover:scale-125')} />
                <p className="text-[10px] font-black text-on-surface-variant opacity-60 mb-1 uppercase tracking-widest">{formatDateTime(item.createdAt)}</p>
                <p className="text-sm font-semibold text-on-surface">
                  {item.text}
                  {item.toStage && <span className="font-black ml-1 text-primary">({stageLabel(item.toStage)})</span>}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <div className="fixed bottom-0 left-0 w-full bg-surface/90 backdrop-blur-md border-t border-outline-variant shadow-2xl p-4 pb-safe flex items-center gap-3 z-50">
        <button onClick={handleRecordResult} className="size-12 rounded-xl border border-outline-variant bg-surface flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-all active:scale-90 shadow-sm shrink-0">
          <FileEdit className="size-5" />
        </button>
        <button onClick={handleScheduleInterview} className="flex-1 h-12 rounded-xl border border-outline-variant bg-surface flex items-center justify-center gap-2 text-on-surface text-[10px] font-black uppercase tracking-widest hover:bg-surface-container-high transition-all shadow-sm active:scale-95">
          <Calendar className="size-4 text-primary" />
          Hẹn phỏng vấn
        </button>
        <button onClick={handleMoveStage} className="flex-[1.4] h-12 rounded-xl bg-primary text-on-primary flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest hover:bg-primary-container hover:scale-[0.98] transition-all shadow-lg shadow-primary/20 active:scale-95">
          <RefreshCw className="size-4" />
          Cập nhật Stage
        </button>
      </div>
    </div>
  );
}

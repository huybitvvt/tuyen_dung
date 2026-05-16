import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Calendar,
  CalendarClock,
  Check,
  CheckCircle,
  ChevronDown,
  Eye,
  FileEdit,
  FileText,
  Globe,
  Mail,
  Phone,
  RefreshCw,
  ThumbsDown,
  ThumbsUp,
  UserRound,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import type React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { CandidateStage, candidateStages, formatDateTime, stageLabel, useCrm, type CandidateInterview } from '../lib/crmStore';

type ModalKind = 'stage' | 'interview' | 'result' | null;

function toLocalInputValue(date: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

const interviewerOptions = ['Anh Huy', 'Trần Thị B', 'Nguyễn Văn A', 'Lê Minh C', 'HR'];

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
  const [openModal, setOpenModal] = useState<ModalKind>(null);

  // Form state for each modal
  const [stageDraft, setStageDraft] = useState<CandidateStage>(candidate?.stage ?? 'new');
  const [interviewDraft, setInterviewDraft] = useState({
    scheduledAt: toLocalInputValue(new Date(Date.now() + 86400000)),
    interviewer: 'Anh Huy',
    customInterviewer: '',
    useCustom: false,
  });
  const [resultDraft, setResultDraft] = useState<{
    interviewId: string;
    result: NonNullable<CandidateInterview['result']>;
    notes: string;
  }>({
    interviewId: '',
    result: 'Đạt',
    notes: '',
  });

  useEffect(() => {
    if (candidate) setStageDraft(candidate.stage);
  }, [candidate]);

  useEffect(() => {
    if (openModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [openModal]);

  if (!candidate) {
    return (
      <div className="p-8">
        <button onClick={() => navigate(-1)} className="font-bold text-primary">
          Quay lại
        </button>
        <p className="mt-4">Không tìm thấy ứng viên.</p>
      </div>
    );
  }

  const job = recruitmentJobs.find((item) => item.id === candidate.jobId);
  const activities = candidateActivities
    .filter((item) => item.candidateId === candidate.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const interviews = candidateInterviews.filter((item) => item.candidateId === candidate.id);
  const lastInterview = interviews.at(-1);
  const files = candidateFiles.filter((item) => item.candidateId === candidate.id);

  function openStageModal() {
    setStageDraft(candidate!.stage);
    setOpenModal('stage');
  }

  function openInterviewModal() {
    setInterviewDraft({
      scheduledAt: toLocalInputValue(new Date(Date.now() + 86400000)),
      interviewer: 'Anh Huy',
      customInterviewer: '',
      useCustom: false,
    });
    setOpenModal('interview');
  }

  function openResultModal() {
    if (!lastInterview) {
      openInterviewModal();
      return;
    }
    setResultDraft({
      interviewId: lastInterview.id,
      result: lastInterview.result ?? 'Đạt',
      notes: lastInterview.notes ?? '',
    });
    setOpenModal('result');
  }

  function handleSubmitStage() {
    if (!candidate) return;
    if (stageDraft !== candidate.stage) {
      moveCandidateStage(candidate.id, stageDraft);
    }
    setOpenModal(null);
  }

  function handleSubmitInterview() {
    if (!candidate) return;
    const { scheduledAt, interviewer, customInterviewer, useCustom } = interviewDraft;
    if (!scheduledAt) return;
    const finalInterviewer = (useCustom ? customInterviewer.trim() : interviewer) || 'HR';
    scheduleInterview(candidate.id, new Date(scheduledAt).toISOString(), finalInterviewer);
    moveCandidateStage(candidate.id, 'interview_scheduled');
    setOpenModal(null);
  }

  function handleSubmitResult() {
    if (!candidate || !resultDraft.interviewId) return;
    recordInterviewResult(resultDraft.interviewId, resultDraft.result, resultDraft.notes);
    moveCandidateStage(
      candidate.id,
      resultDraft.result === 'Đạt' ? 'interviewed' : resultDraft.result === 'Không đạt' ? 'rejected' : 'decision'
    );
    setOpenModal(null);
  }

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-on-surface">
      <header className="sticky top-0 z-50 border-b border-[#dbe2ea] bg-white/95 shadow-[0_1px_0_rgba(15,23,42,0.03)] backdrop-blur">
        <div className="mx-auto flex min-h-16 w-full max-w-6xl flex-wrap items-center gap-3 px-4 py-3 lg:flex-nowrap lg:px-6">
          <button
            onClick={() => navigate(-1)}
            className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-[#dbe2ea] bg-white text-[#475569] transition hover:border-primary/35 hover:bg-primary-fixed/40 hover:text-primary active:scale-95"
            aria-label="Quay lại"
          >
            <ArrowLeft className="size-5" strokeWidth={2.2} />
          </button>

          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#64748b]">Tuyển dụng / Hồ sơ ứng viên</p>
            <h1 className="truncate text-[17px] font-black leading-tight text-[#0f172a] md:text-[20px]">{candidate.name}</h1>
          </div>

          <div className="flex w-full flex-wrap gap-2 sm:w-auto">
            <button
              type="button"
              onClick={openResultModal}
              className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-[#dbe2ea] bg-white px-3 text-[11px] font-black uppercase tracking-[0.10em] text-[#475569] transition hover:border-primary/35 hover:bg-primary-fixed/35 hover:text-primary active:scale-[0.98] sm:flex-none"
            >
              <FileEdit className="size-4" strokeWidth={2.2} />
              Kết quả
            </button>
            <button
              type="button"
              onClick={openInterviewModal}
              className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-[#dbe2ea] bg-white px-3 text-[11px] font-black uppercase tracking-[0.10em] text-[#475569] transition hover:border-primary/35 hover:bg-primary-fixed/35 hover:text-primary active:scale-[0.98] sm:flex-none"
            >
              <Calendar className="size-4" strokeWidth={2.2} />
              Hẹn phỏng vấn
            </button>
            <button
              type="button"
              onClick={openStageModal}
              className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-3 text-[11px] font-black uppercase tracking-[0.10em] text-on-primary shadow-sm shadow-primary/20 transition hover:bg-primary-container active:scale-[0.98] sm:flex-none"
            >
              <RefreshCw className="size-4" strokeWidth={2.5} />
              Cập nhật stage
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-4 lg:px-6 lg:py-5">
        <section className="rounded-xl border border-[#dbe2ea] bg-white shadow-sm">
          <div className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between lg:p-5">
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex size-16 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary-fixed text-[18px] font-black text-primary shadow-sm">
                {candidate.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate text-[22px] font-black leading-tight text-[#0f172a] md:text-[26px]">{candidate.name}</h2>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary-fixed px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.10em] text-primary">
                    <span className="size-1.5 rounded-full bg-primary" />
                    {stageLabel(candidate.stage)}
                  </span>
                </div>
                <p className="mt-1 text-[13px] font-bold uppercase tracking-[0.12em] text-[#64748b]">{job?.title || 'Chưa gán vị trí'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:min-w-[360px]">
              {[
                { label: 'Phòng ban', value: job?.department ?? '-' },
                { label: 'Nguồn', value: candidate.source || '-' },
                { label: 'Ngày tạo', value: formatDateTime(candidate.createdAt) },
              ].map((item) => (
                <div key={item.label} className="rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2">
                  <p className="text-[9.5px] font-black uppercase tracking-[0.14em] text-[#64748b]">{item.label}</p>
                  <p className="mt-1 truncate text-[12.5px] font-black text-[#0f172a]">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-4">
            <section className="overflow-hidden rounded-xl border border-[#dbe2ea] bg-white shadow-sm">
              <header className="border-b border-[#e2e8f0] px-4 py-3">
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#475569]">Thông tin ứng viên</p>
              </header>
              <div className="grid divide-y divide-[#e2e8f0] md:grid-cols-2 md:divide-x md:divide-y-0">
                {[
                  { icon: Phone, label: 'Số điện thoại', value: candidate.phone, mono: true },
                  { icon: Mail, label: 'Email', value: candidate.email },
                  { icon: Globe, label: 'Nguồn ứng tuyển', value: candidate.source },
                  { icon: Briefcase, label: 'Vị trí ứng tuyển', value: `${job?.title ?? '-'} · ${job?.department ?? '-'}` },
                ].map((item) => (
                  <div key={item.label} className="flex min-w-0 gap-3 px-4 py-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-[#e2e8f0] bg-[#f8fafc] text-primary">
                      <item.icon className="size-4" strokeWidth={2.2} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#64748b]">{item.label}</p>
                      <p className={cn('mt-0.5 truncate text-[13px] font-bold text-[#0f172a]', item.mono && 'font-mono')}>
                        {item.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="overflow-hidden rounded-xl border border-[#dbe2ea] bg-white shadow-sm">
              <header className="border-b border-[#e2e8f0] px-4 py-3">
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#475569]">CV / File đính kèm</p>
              </header>
              <div className="divide-y divide-[#e2e8f0]">
                {(files.length ? files : [{ id: 'fallback', name: candidate.cvFileName, url: '#' }]).map((file) => (
                  <div key={file.id} className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-[#e2e8f0] bg-[#f8fafc] text-primary">
                        <FileText className="size-5" strokeWidth={2.2} />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-black text-[#0f172a]">{file.name}</p>
                        <p className="mt-0.5 text-[11px] font-semibold text-[#64748b]">
                          {file.url && file.url !== '#' ? 'Đã lưu liên kết Google Drive' : 'Chưa có link Google Drive'}
                        </p>
                      </div>
                    </div>
                    {file.url && file.url !== '#' ? (
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-primary/25 bg-primary-fixed px-3 text-[10.5px] font-black uppercase tracking-[0.10em] text-primary transition hover:bg-primary hover:text-on-primary"
                      >
                        <Eye className="size-4" strokeWidth={2.4} />
                        Mở file
                      </a>
                    ) : (
                      <span className="inline-flex h-9 items-center justify-center rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-3 text-[10.5px] font-black uppercase tracking-[0.10em] text-[#64748b]">
                        Chưa có link
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-[#dbe2ea] bg-white p-4 shadow-sm">
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#475569]">Ghi chú đánh giá</p>
              <p className="mt-2 min-h-14 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2 text-[13px] font-semibold leading-6 text-[#334155]">
                {candidate.notes || 'Chưa có ghi chú đánh giá.'}
              </p>
            </section>
          </div>

          <div className="space-y-4">
            <section className="overflow-hidden rounded-xl border border-[#dbe2ea] bg-white shadow-sm">
              <header className="flex items-center justify-between gap-3 border-b border-[#e2e8f0] px-4 py-3">
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#475569]">Lịch phỏng vấn</p>
                <button
                  type="button"
                  onClick={openResultModal}
                  className="text-[10.5px] font-black uppercase tracking-[0.10em] text-primary transition hover:underline"
                >
                  Ghi kết quả
                </button>
              </header>
              {interviews.length > 0 ? (
                <ul className="divide-y divide-[#e2e8f0]">
                  {interviews.map((interview) => (
                    <li key={interview.id} className="flex items-start gap-3 px-4 py-3">
                      <div
                        className={cn(
                          'flex size-10 shrink-0 items-center justify-center rounded-lg border',
                          interview.result === 'Đạt' && 'border-primary/20 bg-primary-fixed text-primary',
                          interview.result === 'Không đạt' && 'border-error/20 bg-error-container text-on-error-container',
                          interview.result === 'Cần cân nhắc' && 'border-tertiary/20 bg-tertiary-container text-on-tertiary-container',
                          !interview.result && 'border-[#e2e8f0] bg-[#f8fafc] text-[#64748b]'
                        )}
                      >
                        <CalendarClock className="size-4" strokeWidth={2.2} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-black text-[#0f172a]">{formatDateTime(interview.scheduledAt)}</p>
                        <p className="mt-0.5 text-[11.5px] font-semibold text-[#64748b]">Người phỏng vấn: {interview.interviewer}</p>
                        <span className="mt-2 inline-flex items-center gap-1 rounded-md border border-[#e2e8f0] bg-[#f8fafc] px-2 py-1 text-[10px] font-black uppercase tracking-[0.10em] text-[#475569]">
                          {interview.result === 'Đạt' && <ThumbsUp className="size-3 text-primary" strokeWidth={2.5} />}
                          {interview.result === 'Không đạt' && <ThumbsDown className="size-3 text-error" strokeWidth={2.5} />}
                          {interview.result === 'Cần cân nhắc' && <RefreshCw className="size-3 text-tertiary" strokeWidth={2.5} />}
                          {interview.result || 'Chưa có kết quả'}
                        </span>
                        {interview.notes && (
                          <p className="mt-2 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2 text-[12px] font-medium leading-5 text-[#475569]">
                            {interview.notes}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-4 py-8 text-center">
                  <div className="mx-auto flex size-11 items-center justify-center rounded-lg border border-[#e2e8f0] bg-[#f8fafc] text-[#64748b]">
                    <CalendarClock className="size-5" strokeWidth={2} />
                  </div>
                  <p className="mt-3 text-[13px] font-black text-[#0f172a]">Chưa có lịch phỏng vấn</p>
                  <p className="mt-1 text-[12px] font-medium text-[#64748b]">Tạo lịch phỏng vấn để theo dõi vòng tuyển dụng.</p>
                </div>
              )}
            </section>

            <section className="overflow-hidden rounded-xl border border-[#dbe2ea] bg-white shadow-sm">
              <header className="border-b border-[#e2e8f0] px-4 py-3">
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#475569]">Lịch sử hoạt động</p>
              </header>
              <div className="px-4 py-4">
                {activities.length > 0 ? (
                  <ol className="space-y-3">
                    {activities.map((item, index) => (
                      <li key={item.id} className="grid grid-cols-[88px_1fr] gap-3 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2.5">
                        <div>
                          <span
                            className={cn(
                              'inline-flex size-2 rounded-full',
                              index === 0 ? 'bg-primary' : 'bg-[#94a3b8]'
                            )}
                          />
                          <p className="mt-1 text-[10px] font-black uppercase tracking-[0.10em] text-[#64748b]">
                            {formatDateTime(item.createdAt)}
                          </p>
                        </div>
                        <p className="min-w-0 text-[12.5px] font-semibold leading-5 text-[#334155]">
                          {item.text}
                          {item.toStage && <span className="ml-1 font-black text-primary">({stageLabel(item.toStage)})</span>}
                        </p>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="py-4 text-center text-[12px] font-medium text-[#64748b]">Chưa có hoạt động nào.</p>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* MODALS */}
      <AnimatePresence>
        {openModal === 'stage' && (
          <Modal title="Cập nhật stage" subtitle={`Ứng viên: ${candidate.name}`} icon={RefreshCw} onClose={() => setOpenModal(null)}>
            <div className="px-4 py-4 md:px-5">
              <p className="eyebrow mb-2.5">Chọn stage mới</p>
              <div className="space-y-1.5">
                {candidateStages.map((stage, index) => {
                  const isSelected = stageDraft === stage.id;
                  const isCurrent = candidate.stage === stage.id;
                  return (
                    <button
                      key={stage.id}
                      type="button"
                      onClick={() => setStageDraft(stage.id)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition active:scale-[0.99]',
                        isSelected
                          ? 'border-primary bg-primary-fixed shadow-sm shadow-primary/20'
                          : 'border-outline-variant bg-surface hover:border-primary/30 hover:bg-surface-container-low/50'
                      )}
                    >
                      <div
                        className={cn(
                          'flex size-7 shrink-0 items-center justify-center rounded-lg font-mono text-[10.5px] font-black',
                          isSelected ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface-variant'
                        )}
                      >
                        {String(index + 1).padStart(2, '0')}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={cn('text-[13.5px] font-black', isSelected ? 'text-primary' : 'text-on-surface')}>
                          {stage.label}
                        </p>
                        {isCurrent && (
                          <p className="mt-0.5 text-[10px] font-black uppercase tracking-[0.10em] text-on-surface-variant">
                            Stage hiện tại
                          </p>
                        )}
                      </div>
                      {isSelected && <Check className="size-4 shrink-0 text-primary" strokeWidth={2.5} />}
                    </button>
                  );
                })}
              </div>
            </div>
            <ModalActions
              onCancel={() => setOpenModal(null)}
              onConfirm={handleSubmitStage}
              confirmLabel="Cập nhật"
              confirmIcon={Check}
              confirmDisabled={stageDraft === candidate.stage}
            />
          </Modal>
        )}

        {openModal === 'interview' && (
          <Modal title="Hẹn phỏng vấn" subtitle={`Tạo lịch cho ${candidate.name}`} icon={Calendar} onClose={() => setOpenModal(null)}>
            <div className="grid gap-3 px-4 py-4 md:px-5">
              <label className="block">
                <span className="eyebrow">Thời gian phỏng vấn</span>
                <div className="relative mt-1.5">
                  <Calendar className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" strokeWidth={2} />
                  <input
                    type="datetime-local"
                    value={interviewDraft.scheduledAt}
                    onChange={(e) => setInterviewDraft((d) => ({ ...d, scheduledAt: e.target.value }))}
                    className="h-12 w-full rounded-2xl border border-outline-variant bg-surface pl-10 pr-3 text-[13.5px] font-bold text-on-surface outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                  />
                </div>
              </label>

              <label className="block">
                <span className="eyebrow">Người phỏng vấn</span>
                <div className="relative mt-1.5">
                  <UserRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" strokeWidth={2} />
                  <select
                    value={interviewDraft.useCustom ? '__custom__' : interviewDraft.interviewer}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === '__custom__') {
                        setInterviewDraft((d) => ({ ...d, useCustom: true }));
                      } else {
                        setInterviewDraft((d) => ({ ...d, useCustom: false, interviewer: v }));
                      }
                    }}
                    className="h-12 w-full appearance-none rounded-2xl border border-outline-variant bg-surface pl-10 pr-9 text-[13.5px] font-bold text-on-surface outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                  >
                    {interviewerOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                    <option value="__custom__">Khác (nhập tên)…</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
                </div>
                {interviewDraft.useCustom && (
                  <input
                    type="text"
                    autoFocus
                    placeholder="Nhập tên người phỏng vấn..."
                    value={interviewDraft.customInterviewer}
                    onChange={(e) => setInterviewDraft((d) => ({ ...d, customInterviewer: e.target.value }))}
                    className="mt-2 h-12 w-full rounded-2xl border border-outline-variant bg-surface px-4 text-[13.5px] font-bold text-on-surface outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                  />
                )}
              </label>

              <div className="rounded-xl border border-primary/20 bg-primary-fixed/40 px-3 py-2.5">
                <p className="flex items-start gap-1.5 text-[11.5px] font-semibold leading-5 text-primary">
                  <Briefcase className="mt-0.5 size-3 shrink-0" strokeWidth={2.5} />
                  <span>Stage sẽ tự chuyển sang "Hẹn phỏng vấn" sau khi tạo lịch.</span>
                </p>
              </div>
            </div>
            <ModalActions
              onCancel={() => setOpenModal(null)}
              onConfirm={handleSubmitInterview}
              confirmLabel="Tạo lịch"
              confirmIcon={Calendar}
              confirmDisabled={
                !interviewDraft.scheduledAt ||
                (interviewDraft.useCustom && !interviewDraft.customInterviewer.trim())
              }
            />
          </Modal>
        )}

        {openModal === 'result' && (
          <Modal
            title="Ghi kết quả phỏng vấn"
            subtitle={lastInterview ? formatDateTime(lastInterview.scheduledAt) : ''}
            icon={CheckCircle}
            onClose={() => setOpenModal(null)}
          >
            {!lastInterview ? (
              <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-surface-container-low/60 text-on-surface-variant">
                  <CalendarClock className="size-5" strokeWidth={2} />
                </div>
                <p className="text-[13px] font-bold text-on-surface">Chưa có lịch phỏng vấn</p>
                <p className="max-w-xs text-[11.5px] font-medium text-on-surface-variant">
                  Tạo lịch phỏng vấn trước khi ghi kết quả.
                </p>
              </div>
            ) : (
              <div className="grid gap-3 px-4 py-4 md:px-5">
                <div>
                  <p className="eyebrow mb-2">Đánh giá kết quả</p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['Đạt', 'Cần cân nhắc', 'Không đạt'] as const).map((opt) => {
                      const isActive = resultDraft.result === opt;
                      const tone =
                        opt === 'Đạt'
                          ? 'pass'
                          : opt === 'Cần cân nhắc'
                          ? 'neutral'
                          : 'fail';
                      const Icon =
                        opt === 'Đạt' ? ThumbsUp : opt === 'Cần cân nhắc' ? RefreshCw : ThumbsDown;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setResultDraft((d) => ({ ...d, result: opt }))}
                          className={cn(
                            'flex h-12 flex-col items-center justify-center gap-0.5 rounded-2xl border text-[10.5px] font-black uppercase tracking-[0.06em] transition active:scale-95',
                            !isActive && 'border-outline-variant bg-surface text-on-surface-variant hover:border-primary/30',
                            isActive && tone === 'pass' && 'border-primary bg-primary text-on-primary shadow-sm shadow-primary/25',
                            isActive && tone === 'neutral' && 'border-tertiary/50 bg-tertiary-container text-on-tertiary-container shadow-sm',
                            isActive && tone === 'fail' && 'border-error/40 bg-error-container text-on-error-container shadow-sm'
                          )}
                        >
                          <Icon className="size-4" strokeWidth={2.5} />
                          <span>{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <label className="block">
                  <span className="eyebrow">Ghi chú đánh giá</span>
                  <textarea
                    rows={4}
                    placeholder="Điểm mạnh, điểm cần cải thiện, đề xuất tiếp theo..."
                    value={resultDraft.notes}
                    onChange={(e) => setResultDraft((d) => ({ ...d, notes: e.target.value }))}
                    className="mt-1.5 w-full resize-y rounded-2xl border border-outline-variant bg-surface px-4 py-3 text-[13px] font-medium leading-6 text-on-surface outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                  />
                </label>

                <div className="rounded-xl border border-primary/20 bg-primary-fixed/40 px-3 py-2.5">
                  <p className="flex items-start gap-1.5 text-[11.5px] font-semibold leading-5 text-primary">
                    <ArrowRight className="mt-0.5 size-3 shrink-0" strokeWidth={2.5} />
                    <span>
                      Stage sẽ tự chuyển sang{' '}
                      <span className="font-black">
                        {resultDraft.result === 'Đạt'
                          ? '"Đã phỏng vấn"'
                          : resultDraft.result === 'Không đạt'
                          ? '"Loại"'
                          : '"Chờ quyết định"'}
                      </span>
                      .
                    </span>
                  </p>
                </div>
              </div>
            )}
            <ModalActions
              onCancel={() => setOpenModal(null)}
              onConfirm={handleSubmitResult}
              confirmLabel="Lưu kết quả"
              confirmIcon={Check}
              confirmDisabled={!lastInterview}
            />
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────── MODAL COMPONENTS ─────────── */

function Modal({
  children,
  onClose,
  title,
  subtitle,
  icon: Icon,
}: {
  children: React.ReactNode;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon: typeof Calendar;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 z-[80] flex items-end justify-center bg-black/55 backdrop-blur-sm md:items-center md:p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%', opacity: 0.6 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        onClick={(e) => e.stopPropagation()}
        className="flex w-full max-h-[92vh] flex-col overflow-hidden rounded-t-3xl border border-b-0 border-outline-variant bg-surface shadow-[0_-12px_50px_rgba(0,0,0,0.16)] md:max-w-lg md:rounded-3xl md:border-b md:shadow-2xl"
      >
        {/* Drag handle (mobile) */}
        <div className="flex shrink-0 justify-center pt-2.5 pb-1 md:hidden">
          <div className="h-1 w-10 rounded-full bg-outline-variant/70" />
        </div>

        {/* Header */}
        <div className="flex shrink-0 items-center gap-3 border-b border-outline-variant px-4 pt-2 pb-3 md:pt-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-on-primary shadow-sm shadow-primary/25">
            <Icon className="size-5" strokeWidth={2.2} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-display text-[18px] font-bold leading-tight text-on-surface">{title}</h3>
            {subtitle && (
              <p className="mt-0.5 truncate text-[11.5px] font-semibold text-on-surface-variant">{subtitle}</p>
            )}
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

        {/* Body */}
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </motion.div>
    </motion.div>
  );
}

function ModalActions({
  onCancel,
  onConfirm,
  confirmLabel,
  confirmIcon: Icon,
  confirmDisabled = false,
}: {
  onCancel: () => void;
  onConfirm: () => void;
  confirmLabel: string;
  confirmIcon: typeof Check;
  confirmDisabled?: boolean;
}) {
  return (
    <div className="grid shrink-0 grid-cols-2 gap-2 border-t border-outline-variant bg-surface-container-low/40 p-3">
      <button
        type="button"
        onClick={onCancel}
        className="inline-flex h-12 items-center justify-center rounded-2xl border border-outline-variant bg-surface text-[11px] font-black uppercase tracking-[0.10em] text-on-surface-variant transition active:scale-95 hover:bg-surface-container-high"
      >
        Hủy
      </button>
      <button
        type="button"
        onClick={onConfirm}
        disabled={confirmDisabled}
        className="inline-flex h-12 items-center justify-center gap-1.5 rounded-2xl bg-primary text-[11px] font-black uppercase tracking-[0.10em] text-on-primary shadow-md shadow-primary/25 transition active:scale-95 hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
      >
        <Icon className="size-4" strokeWidth={2.5} />
        {confirmLabel}
      </button>
    </div>
  );
}

import {
  ArrowRight,
  Briefcase,
  Check,
  ChevronRight,
  Clock,
  ExternalLink,
  FileText,
  Mail,
  Phone,
  Plus,
  Search,
  UploadCloud,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type React from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '../lib/utils';
import { candidateStages, stageLabel, useCrm, type CandidateStage } from '../lib/crmStore';
import { isGoogleDrivePickerConfigured, uploadGoogleDriveFiles } from '../lib/googleDrivePicker';

const stageTone = [
  'bg-slate-500',
  'bg-sky-600',
  'bg-indigo-600',
  'bg-violet-600',
  'bg-amber-600',
  'bg-orange-600',
  'bg-emerald-600',
  'bg-teal-600',
  'bg-primary',
  'bg-error',
];

type StageFilter = CandidateStage | 'all';

type CandidateForm = {
  name: string;
  phone: string;
  email: string;
  jobId: string;
  source: string;
  cvFileName: string;
  cvUrl: string;
  cvDriveFileId: string;
  cvMimeType: string;
  notes: string;
};

function emptyForm(jobId = ''): CandidateForm {
  return {
    name: '',
    phone: '',
    email: '',
    jobId,
    source: 'Facebook',
    cvFileName: '',
    cvUrl: '',
    cvDriveFileId: '',
    cvMimeType: '',
    notes: '',
  };
}

const inputClass =
  'h-11 w-full rounded-xl border border-outline-variant bg-surface px-3 text-[13px] font-semibold text-on-surface outline-none transition placeholder:text-on-surface-variant/60 focus:border-primary focus:ring-4 focus:ring-primary/10';

export default function CandidateList() {
  const { candidates, recruitmentJobs, candidateFiles, createCandidate } = useCrm();
  const [query, setQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<StageFilter>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState<CandidateForm>(() => emptyForm(recruitmentJobs[0]?.id));
  const [formError, setFormError] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploadingDrive, setIsUploadingDrive] = useState(false);
  const [activeNote, setActiveNote] = useState<{ name: string; note: string } | null>(null);
  const tabsRef = useRef<HTMLDivElement>(null);

  const filesByCandidate = useMemo(() => {
    return candidateFiles.reduce<Record<string, typeof candidateFiles>>((map, file) => {
      map[file.candidateId] = [...(map[file.candidateId] ?? []), file];
      return map;
    }, {});
  }, [candidateFiles]);

  const filteredCandidates = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return candidates.filter((candidate) => {
      if (stageFilter !== 'all' && candidate.stage !== stageFilter) return false;
      if (!normalized) return true;
      return [
        candidate.name,
        candidate.email,
        candidate.phone,
        candidate.source,
        candidate.notes,
        candidate.cvFileName,
        filesByCandidate[candidate.id]?.map((file) => `${file.name} ${file.url}`).join(' '),
        recruitmentJobs.find((job) => job.id === candidate.jobId)?.title,
      ]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(normalized));
    });
  }, [candidates, query, stageFilter, recruitmentJobs, filesByCandidate]);

  const stageCounts = useMemo(() => {
    const map = new Map<CandidateStage | 'all', number>();
    map.set('all', candidates.length);
    candidateStages.forEach((stage) => {
      map.set(stage.id, candidates.filter((c) => c.stage === stage.id).length);
    });
    return map;
  }, [candidates]);

  useEffect(() => {
    const tabs = tabsRef.current;
    if (!tabs) return;
    const target = tabs.querySelector<HTMLElement>(`[data-stage="${stageFilter}"]`);
    if (target) target.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [stageFilter]);

  useEffect(() => {
    if (!isFormOpen) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isFormOpen]);

  function updateForm<K extends keyof CandidateForm>(key: K, value: CandidateForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    if (formError) setFormError('');
  }

  function openForm() {
    setForm(emptyForm(recruitmentJobs[0]?.id));
    setSelectedFiles([]);
    setFormError('');
    setIsFormOpen(true);
  }

  async function submitCandidate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name.trim()) {
      setFormError('Vui lòng nhập họ tên ứng viên.');
      return;
    }
    if (!form.phone.trim() || !form.email.trim()) {
      setFormError('Vui lòng nhập đủ SĐT và email.');
      return;
    }
    if (!form.jobId) {
      setFormError('Vui lòng chọn vị trí ứng tuyển.');
      return;
    }

    let uploadedFiles: Array<{ name: string; url: string; driveFileId?: string; mimeType?: string }> = [];
    if (selectedFiles.length > 0) {
      if (!isGoogleDrivePickerConfigured()) {
        setFormError('Chưa cấu hình Google API nên chưa upload được file lên Drive.');
        return;
      }

      setIsUploadingDrive(true);
      setFormError('');
      try {
        const results = await uploadGoogleDriveFiles(selectedFiles);
        uploadedFiles = results.map((file) => ({
          name: file.name,
          url: file.url,
          driveFileId: file.id,
          mimeType: file.mimeType,
        }));
      } catch (error) {
        setFormError(error instanceof Error ? error.message : 'Upload file lên Google Drive thất bại.');
        setIsUploadingDrive(false);
        return;
      }
      setIsUploadingDrive(false);
    }

    const firstFileName = uploadedFiles[0]?.name;
    createCandidate({
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      jobId: form.jobId,
      source: form.source.trim() || 'Khác',
      notes: form.notes.trim(),
      cvFileName: form.cvFileName.trim() || firstFileName || `${form.name.trim().replace(/\s+/g, '_')}_CV.pdf`,
      cvUrl: form.cvUrl.trim(),
      cvDriveFileId: form.cvDriveFileId,
      cvMimeType: form.cvMimeType,
      cvFiles: uploadedFiles,
    });
    setIsFormOpen(false);
  }

  const tabs: Array<{ id: StageFilter; label: string; tone?: string }> = [
    { id: 'all', label: 'Tất cả' },
    ...candidateStages.map((stage, index) => ({
      id: stage.id,
      label: stage.label,
      tone: stageTone[index],
    })),
  ];

  return (
    <div className="page-shell">
      <section className="rounded-2xl border border-outline-variant bg-surface p-4 shadow-sm md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow">Recruitment pipeline</p>
            <h1 className="mt-1 font-display text-[22px] font-bold leading-tight text-on-surface md:text-[28px]">
              Danh sách ứng viên
            </h1>
            <p className="mt-1.5 max-w-2xl text-[12px] font-semibold leading-5 text-on-surface-variant md:text-[13px]">
              Quản lý thông tin ứng viên theo đúng spec: liên hệ, vị trí, nguồn, CV/file, ghi chú và lịch sử hoạt động.
            </p>
          </div>
          <button
            type="button"
            onClick={openForm}
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-primary px-3 text-[11px] font-black uppercase tracking-[0.10em] text-on-primary shadow-sm shadow-primary/25 transition active:scale-95 hover:bg-primary-container md:px-4"
          >
            <Plus className="size-4" strokeWidth={2.5} />
            Thêm ứng viên
          </button>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-on-surface-variant" />
            <input
              type="text"
              placeholder="Tìm tên, email, SĐT, vị trí..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-10 w-full rounded-xl border border-outline-variant bg-surface pl-9 pr-9 text-[13px] font-semibold outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-2 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-on-surface-variant active:scale-90 hover:bg-surface-container-high"
                aria-label="Xóa tìm kiếm"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </div>
      </section>

      <div ref={tabsRef} className="-mx-3 flex gap-1.5 overflow-x-auto px-3 pb-1 scrollbar-hide snap-x md:mx-0 md:flex-wrap md:overflow-visible md:px-0">
        {tabs.map((tab) => {
          const count = stageCounts.get(tab.id) ?? 0;
          const isActive = stageFilter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              data-stage={tab.id}
              onClick={() => setStageFilter(tab.id)}
              className={cn(
                'shrink-0 snap-start inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.10em] transition active:scale-95',
                isActive
                  ? 'border-primary bg-primary text-on-primary shadow-sm shadow-primary/20'
                  : 'border-outline-variant bg-surface text-on-surface-variant hover:border-primary/30 hover:text-primary'
              )}
            >
              {tab.tone && !isActive && <span className={cn('size-1.5 rounded-full', tab.tone)} />}
              <span>{tab.label}</span>
              <span
                className={cn(
                  'inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 font-mono text-[9px]',
                  isActive ? 'bg-on-primary/20 text-on-primary' : 'bg-surface-container-low text-on-surface-variant'
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <section className="hidden overflow-hidden rounded-2xl border border-outline-variant bg-surface shadow-sm md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1340px] border-collapse text-left">
            <thead className="bg-surface-container-low">
              <tr className="text-[10px] font-black uppercase tracking-[0.14em] text-on-surface-variant">
                <th className="w-[230px] px-4 py-3">Họ tên</th>
                <th className="w-[140px] px-4 py-3">SĐT</th>
                <th className="w-[210px] px-4 py-3">Email</th>
                <th className="w-[210px] px-4 py-3">Vị trí ứng tuyển</th>
                <th className="w-[130px] px-4 py-3">Nguồn</th>
                <th className="w-[190px] px-4 py-3">Trạng thái</th>
                <th className="w-[180px] px-4 py-3">CV/file</th>
                <th className="w-[230px] px-4 py-3">Ghi chú đánh giá</th>
                <th className="w-[110px] px-4 py-3">Lịch sử</th>
                <th className="w-[132px] px-4 py-3 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/50">
              {filteredCandidates.map((candidate) => {
                const job = recruitmentJobs.find((item) => item.id === candidate.jobId);
                const file = filesByCandidate[candidate.id]?.[0];
                return (
                  <tr key={candidate.id} className="transition hover:bg-primary-fixed/25">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-fixed to-secondary-container text-[13px] font-black text-on-primary-fixed">
                          {candidate.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-black text-on-surface">{candidate.name}</p>
                          <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-on-surface-variant">
                            ID {candidate.id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-[12px] font-bold text-on-surface-variant">{candidate.phone}</td>
                    <td className="max-w-[180px] px-4 py-3 text-[12px] font-semibold text-on-surface-variant">
                      <span className="block truncate">{candidate.email}</span>
                    </td>
                    <td className="max-w-[180px] px-4 py-3">
                      <p className="truncate text-[12px] font-black text-on-surface">{job?.title ?? 'Chưa gán'}</p>
                      <p className="mt-0.5 text-[10px] font-bold text-on-surface-variant">{job?.department ?? '-'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full border border-outline-variant bg-surface px-2 py-1 text-[10px] font-black uppercase tracking-[0.08em] text-on-surface-variant">
                        {candidate.source}
                      </span>
                    </td>
                    <td className="w-[190px] min-w-[190px] px-4 py-3">
                      <span className="inline-flex h-8 min-w-[118px] items-center justify-center whitespace-nowrap rounded-lg border border-primary/20 bg-primary-fixed px-3 text-[10px] font-black uppercase tracking-[0.07em] text-primary shadow-[inset_0_0_0_1px_rgba(255,255,255,0.45)]">
                        {stageLabel(candidate.stage)}
                      </span>
                    </td>
                    <td className="max-w-[170px] px-4 py-3">
                      {file?.url && file.url !== '#' ? (
                        <a href={file.url} target="_blank" rel="noreferrer" className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-primary/20 bg-primary-fixed px-2 py-1 text-[10px] font-black uppercase tracking-[0.08em] text-primary hover:bg-primary hover:text-on-primary">
                          <ExternalLink className="size-3" strokeWidth={2.5} />
                          <span className="truncate">{file.name}</span>
                        </a>
                      ) : (
                        <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-outline-variant bg-surface px-2 py-1 text-[10px] font-bold text-on-surface-variant">
                          <FileText className="size-3" />
                          <span className="truncate">{candidate.cvFileName || 'Chưa có'}</span>
                        </span>
                      )}
                    </td>
                    <td className="w-[230px] min-w-[230px] px-4 py-3 text-[12px] font-medium leading-5 text-on-surface-variant">
                      {candidate.notes ? (
                        <button
                          type="button"
                          onClick={() => setActiveNote({ name: candidate.name, note: candidate.notes })}
                          className="group block w-full rounded-lg border border-transparent px-2 py-1.5 text-left transition hover:border-primary/20 hover:bg-primary-fixed/35 focus:outline-none focus:ring-4 focus:ring-primary/10"
                          title="Bấm để xem đầy đủ ghi chú"
                        >
                          <span className="line-clamp-2 text-[12px] font-semibold leading-5 text-on-surface-variant group-hover:text-primary">
                            {candidate.notes}
                          </span>
                          <span className="mt-1 inline-flex text-[9.5px] font-black uppercase tracking-[0.10em] text-primary opacity-0 transition group-hover:opacity-100">
                            Xem đầy đủ
                          </span>
                        </button>
                      ) : (
                        <span className="block px-2 py-1.5 text-[12px] font-semibold text-on-surface-variant">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[12px] font-bold text-on-surface-variant">
                      {new Date(candidate.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link to={`/recruitment/candidate/${candidate.id}`} className="inline-flex h-9 w-[108px] items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-outline-variant bg-surface px-3 text-[10px] font-black uppercase tracking-[0.08em] text-on-surface-variant transition hover:border-primary/30 hover:bg-primary-fixed/30 hover:text-primary">
                        <span>Mở hồ sơ</span>
                        <ArrowRight className="size-3.5" strokeWidth={2.5} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-2.5 md:hidden">
        {filteredCandidates.map((candidate) => {
          const job = recruitmentJobs.find((item) => item.id === candidate.jobId);
          const file = filesByCandidate[candidate.id]?.[0];
          const stageIndex = candidateStages.findIndex((s) => s.id === candidate.stage);
          const tone = stageTone[stageIndex] ?? 'bg-primary';
          return (
            <Link
              key={candidate.id}
              to={`/recruitment/candidate/${candidate.id}`}
              className="group relative overflow-hidden rounded-2xl border border-outline-variant bg-surface p-3.5 shadow-sm transition active:scale-[0.99] hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
            >
              <div className={cn('absolute left-0 top-0 h-full w-1', tone)} />
              <div className="flex items-start gap-3 pl-1">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-fixed to-secondary-container text-[14px] font-black text-on-primary-fixed shadow-sm">
                  {candidate.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="truncate text-[14.5px] font-black leading-tight text-on-surface group-hover:text-primary">
                      {candidate.name}
                    </h3>
                    <ChevronRight className="size-4 shrink-0 text-on-surface-variant transition group-hover:translate-x-0.5 group-hover:text-primary" />
                  </div>
                  <div className="mt-0.5 flex items-center gap-1 text-[11px] font-bold text-on-surface-variant">
                    <Briefcase className="size-3" strokeWidth={2.5} />
                    <span className="truncate">{job?.title ?? 'Chưa gán vị trí'}</span>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary-fixed px-2 py-0.5 text-[9.5px] font-black uppercase tracking-[0.08em] text-primary">
                      {stageLabel(candidate.stage)}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-outline-variant bg-surface-container-low px-2 py-0.5 text-[9.5px] font-black uppercase tracking-[0.08em] text-on-surface-variant">
                      {candidate.source}
                    </span>
                    {(file || candidate.cvFileName) && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-outline-variant bg-surface px-2 py-0.5 text-[9.5px] font-black uppercase tracking-[0.08em] text-on-surface-variant">
                        <FileText className="size-3" />
                        CV
                      </span>
                    )}
                  </div>

                  <div className="mt-2.5 grid grid-cols-1 gap-1 text-[11.5px] font-semibold text-on-surface-variant">
                    <div className="flex items-center gap-1.5">
                      <Phone className="size-3 shrink-0" strokeWidth={2.2} />
                      <span className="truncate font-mono">{candidate.phone}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Mail className="size-3 shrink-0" strokeWidth={2.2} />
                      <span className="truncate">{candidate.email}</span>
                    </div>
                  </div>

                  {candidate.notes && (
                    <p className="mt-2 line-clamp-2 rounded-lg bg-surface-container-low/60 px-2.5 py-1.5 text-[11px] font-medium leading-[1.4] text-on-surface-variant">
                      {candidate.notes}
                    </p>
                  )}

                  <div className="mt-2.5 flex items-center justify-between border-t border-outline-variant/40 pt-2 text-[10px] font-bold text-on-surface-variant">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="size-3" strokeWidth={2.2} />
                      {new Date(candidate.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                    <span className="inline-flex items-center gap-1 text-primary">
                      Mở hồ sơ
                      <ArrowRight className="size-3" strokeWidth={2.5} />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}

        {filteredCandidates.length === 0 && <EmptyState query={query} setQuery={setQuery} setStageFilter={setStageFilter} />}
      </section>

      {filteredCandidates.length === 0 && <div className="hidden md:block"><EmptyState query={query} setQuery={setQuery} setStageFilter={setStageFilter} /></div>}

      <AnimatePresence>
        {activeNote && (
          <motion.div
            className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/20 px-4 py-6 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            onClick={() => setActiveNote(null)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Ghi chú đánh giá"
              onClick={(event) => event.stopPropagation()}
              initial={{ opacity: 0, scale: 0.9, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 10 }}
              transition={{ type: 'spring', stiffness: 420, damping: 24 }}
              className="w-full max-w-md overflow-hidden rounded-2xl border border-outline-variant bg-surface shadow-[0_24px_80px_rgba(15,23,42,0.22)]"
            >
              <header className="flex items-start gap-3 border-b border-outline-variant bg-surface-container-low/50 px-4 py-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary-fixed text-primary">
                  <FileText className="size-4" strokeWidth={2.4} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-on-surface-variant">Ghi chú đánh giá</p>
                  <h3 className="mt-0.5 truncate text-[15px] font-black text-on-surface">{activeNote.name}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveNote(null)}
                  className="flex size-9 shrink-0 items-center justify-center rounded-full border border-outline-variant bg-surface text-on-surface-variant transition hover:bg-surface-container-high hover:text-on-surface active:scale-95"
                  aria-label="Đóng ghi chú"
                >
                  <X className="size-4" strokeWidth={2.5} />
                </button>
              </header>
              <div className="max-h-[48vh] overflow-y-auto px-4 py-4">
                <p className="whitespace-pre-wrap text-[14px] font-semibold leading-7 text-on-surface">
                  {activeNote.note}
                </p>
              </div>
              <footer className="border-t border-outline-variant bg-surface-container-low/35 px-4 py-3">
                <button
                  type="button"
                  onClick={() => setActiveNote(null)}
                  className="inline-flex h-10 w-full items-center justify-center rounded-xl bg-primary text-[11px] font-black uppercase tracking-[0.10em] text-on-primary shadow-sm shadow-primary/20 transition hover:bg-primary-container active:scale-[0.98]"
                >
                  Đóng
                </button>
              </footer>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {isFormOpen && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/55 backdrop-blur-sm md:items-center md:p-6" onClick={() => setIsFormOpen(false)}>
          <form
            onSubmit={submitCandidate}
            onClick={(event) => event.stopPropagation()}
            className="flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl border border-b-0 border-outline-variant bg-surface shadow-[0_-12px_50px_rgba(0,0,0,0.16)] md:max-w-2xl md:rounded-3xl md:border-b md:shadow-2xl"
          >
            <header className="flex shrink-0 items-center gap-3 border-b border-outline-variant px-4 py-3 md:px-5">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-on-primary">
                <Plus className="size-5" strokeWidth={2.5} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="eyebrow">Thêm ứng viên</p>
                <h2 className="truncate font-display text-[18px] font-bold text-on-surface">Thông tin ứng viên</h2>
              </div>
              <button type="button" onClick={() => setIsFormOpen(false)} className="flex size-9 shrink-0 items-center justify-center rounded-full border border-outline-variant text-on-surface-variant transition hover:bg-surface-container-high" aria-label="Đóng">
                <X className="size-4" strokeWidth={2.5} />
              </button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 md:px-5">
              <div className="grid gap-3 md:grid-cols-2">
                <Field label="Họ tên">
                  <input value={form.name} onChange={(event) => updateForm('name', event.target.value)} className={inputClass} placeholder="Nguyễn Văn A" />
                </Field>
                <Field label="Vị trí ứng tuyển">
                  <select value={form.jobId} onChange={(event) => updateForm('jobId', event.target.value)} className={inputClass}>
                    {recruitmentJobs.map((job) => (
                      <option key={job.id} value={job.id}>
                        {job.title} - {job.department}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="SĐT">
                  <input value={form.phone} onChange={(event) => updateForm('phone', event.target.value)} className={inputClass} placeholder="0901 234 567" />
                </Field>
                <Field label="Email">
                  <input type="email" value={form.email} onChange={(event) => updateForm('email', event.target.value)} className={inputClass} placeholder="candidate@email.com" />
                </Field>
                <Field label="Nguồn ứng viên">
                  <input value={form.source} onChange={(event) => updateForm('source', event.target.value)} className={inputClass} placeholder="Facebook, LinkedIn, Referral..." />
                </Field>
                <Field label="CV/file">
                  <input value={form.cvFileName} onChange={(event) => updateForm('cvFileName', event.target.value)} className={inputClass} placeholder="Nguyen_Van_A_CV.pdf" />
                </Field>
                <Field label="Upload ảnh/CV lên Google Drive" className="md:col-span-2">
                  <input
                    type="file"
                    multiple
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                    onChange={(event) => setSelectedFiles(Array.from(event.target.files ?? []))}
                    className={inputClass}
                  />
                  {selectedFiles.length > 0 && (
                    <div className="mt-2 rounded-xl border border-outline-variant bg-surface-container-low/50 px-3 py-2">
                      <p className="text-[11px] font-black uppercase tracking-[0.10em] text-on-surface-variant">
                        Sẽ upload lên Google Drive khi bấm Lưu
                      </p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {selectedFiles.map((file) => (
                          <span key={`${file.name}-${file.size}`} className="inline-flex items-center gap-1 rounded-full border border-primary/15 bg-primary-fixed px-2 py-1 text-[10px] font-bold text-primary">
                            <UploadCloud className="size-3" strokeWidth={2.4} />
                            {file.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {!isGoogleDrivePickerConfigured() && (
                    <p className="mt-1.5 text-[11px] font-semibold leading-5 text-on-surface-variant">
                      Chưa có cấu hình Google API trong env, chưa thể upload file lên Drive.
                    </p>
                  )}
                </Field>
                <Field label="Link Google Drive có sẵn" className="md:col-span-2">
                  <input
                    value={form.cvUrl}
                    onChange={(event) => updateForm('cvUrl', event.target.value)}
                    className={inputClass}
                    placeholder="Dán link nếu file đã có sẵn trên Drive"
                  />
                </Field>
              </div>

              <Field label="Ghi chú đánh giá" className="mt-3">
                <textarea
                  rows={4}
                  value={form.notes}
                  onChange={(event) => updateForm('notes', event.target.value)}
                  className={`${inputClass} h-auto resize-y py-3 leading-6`}
                  placeholder="Điểm mạnh, điểm cần đánh giá thêm, ghi chú HR..."
                />
              </Field>

              {formError && (
                <div className="mt-3 rounded-xl border border-error/25 bg-error-container px-3 py-2 text-[12px] font-bold text-on-error-container">
                  {formError}
                </div>
              )}
            </div>

            <footer className="grid shrink-0 grid-cols-2 gap-2 border-t border-outline-variant bg-surface-container-low/40 p-3">
              <button type="button" onClick={() => setIsFormOpen(false)} className="inline-flex h-12 items-center justify-center rounded-2xl border border-outline-variant bg-surface text-[11px] font-black uppercase tracking-[0.10em] text-on-surface-variant transition active:scale-95 hover:bg-surface-container-high">
                Hủy
              </button>
              <button type="submit" disabled={isUploadingDrive} className="inline-flex h-12 items-center justify-center gap-1.5 rounded-2xl bg-primary text-[11px] font-black uppercase tracking-[0.10em] text-on-primary shadow-md shadow-primary/25 transition active:scale-95 hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-70">
                <Check className="size-4" strokeWidth={2.5} />
                {isUploadingDrive ? 'Đang upload...' : 'Lưu ứng viên'}
              </button>
            </footer>
          </form>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn('block', className)}>
      <span className="eyebrow">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function EmptyState({
  query,
  setQuery,
  setStageFilter,
}: {
  query: string;
  setQuery: (value: string) => void;
  setStageFilter: (value: StageFilter) => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-outline-variant bg-surface px-4 py-10 text-center">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-surface-container-low/60 text-on-surface-variant">
        <Search className="size-5" strokeWidth={2} />
      </div>
      <p className="text-[13px] font-black text-on-surface">Không tìm thấy ứng viên</p>
      <p className="max-w-xs text-[11px] font-medium text-on-surface-variant">
        Thử đổi bộ lọc trạng thái hoặc xóa ô tìm kiếm.
      </p>
      <button
        type="button"
        onClick={() => {
          setQuery('');
          setStageFilter('all');
        }}
        className="mt-2 inline-flex h-9 items-center gap-1.5 rounded-full border border-outline-variant bg-surface px-3 text-[10.5px] font-black uppercase tracking-[0.10em] text-on-surface-variant transition active:scale-95 hover:border-primary/30 hover:text-primary"
      >
        <X className="size-3.5" strokeWidth={2.5} />
        Xóa bộ lọc
      </button>
    </div>
  );
}

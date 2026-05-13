import {
  ArrowRight,
  Clock,
  GripVertical,
  Mail,
  Phone,
  Plus,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { candidateStages, stageLabel, useCrm } from '../lib/crmStore';

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

export default function CandidateList() {
  const { candidates, recruitmentJobs, createCandidate, moveCandidateStage } = useCrm();
  const [query, setQuery] = useState('');
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const filteredCandidates = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return candidates;
    return candidates.filter((candidate) =>
      [candidate.name, candidate.email, candidate.phone, candidate.source, candidate.notes, recruitmentJobs.find((job) => job.id === candidate.jobId)?.title]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(normalized))
    );
  }, [candidates, query, recruitmentJobs]);

  function handleCreateCandidate() {
    const name = window.prompt('Họ tên ứng viên');
    if (!name) return;
    const phone = window.prompt('SĐT', '0900 000 000') || '';
    const email = window.prompt('Email', 'candidate@email.com') || '';
    const title = window.prompt('Vị trí ứng tuyển', recruitmentJobs[0]?.title || '') || '';
    const job = recruitmentJobs.find((item) => item.title.toLowerCase().includes(title.toLowerCase())) ?? recruitmentJobs[0];
    if (!job) return;
    const source = window.prompt('Nguồn ứng viên', 'LinkedIn') || 'Khác';
    const notes = window.prompt('Ghi chú đánh giá', '') || '';
    createCandidate({
      name,
      phone,
      email,
      jobId: job.id,
      source,
      notes,
      cvFileName: `${name.replace(/\s+/g, '_')}_CV.pdf`,
    });
  }

  return (
    <div className="flex min-h-screen flex-col bg-background pb-20">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-3 px-3 py-3 pb-24 md:gap-4 md:px-6 md:py-5">
        <section className="section-card p-4 md:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="eyebrow mb-2">Recruitment pipeline</p>
              <h1 className="text-xl font-black text-on-surface md:text-3xl">Kanban ứng viên</h1>
              <p className="mt-2 max-w-2xl text-xs font-semibold leading-5 text-on-surface-variant md:text-sm md:leading-6">
                Kéo thả ứng viên qua 10 stage. Mỗi lần đổi stage sẽ tự động ghi vào lịch sử hoạt động của ứng viên.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative min-w-[260px] flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-outline" />
                <input
                  type="text"
                  placeholder="Tìm ứng viên, email, vị trí..."
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                className="h-9 w-full rounded-lg border border-outline-variant bg-surface pl-10 pr-3 text-xs font-semibold outline-none transition-all focus:ring-2 focus:ring-primary/25 md:h-10 md:text-sm"
                />
              </div>
              <button className="btn-secondary">
                <SlidersHorizontal className="size-4" /> Lọc
              </button>
              <button onClick={handleCreateCandidate} className="btn-primary">
                <Plus className="size-4" /> Thêm ứng viên
              </button>
            </div>
          </div>
        </section>

        <div className="overflow-x-auto pb-4">
          <div className="grid min-w-[1500px] gap-3" style={{ gridTemplateColumns: `repeat(${candidateStages.length}, minmax(250px, 1fr))` }}>
            {candidateStages.map((stage, index) => {
              const stageCandidates = filteredCandidates.filter((candidate) => candidate.stage === stage.id);
              const tone = stageTone[index] ?? 'bg-primary';
              return (
                <section
                  key={stage.id}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => {
                    if (draggingId) moveCandidateStage(draggingId, stage.id);
                    setDraggingId(null);
                  }}
                  className={cn(
                    'min-h-[560px] rounded-lg border border-outline-variant/70 bg-surface-container-low p-3 transition-colors',
                    draggingId && 'border-primary/40 bg-primary/5'
                  )}
                >
                  <div className="mb-3 rounded-lg bg-surface p-3 shadow-sm ring-1 ring-outline-variant/60">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className={cn('h-7 w-1.5 rounded-full', tone)} />
                        <h2 className="truncate text-[11px] font-black uppercase tracking-widest text-on-surface">{stage.label}</h2>
                      </div>
                      <span className="rounded-full bg-surface-container-low px-2 py-0.5 text-[10px] font-black text-on-surface-variant">{stageCandidates.length}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    {stageCandidates.map((candidate) => {
                      const job = recruitmentJobs.find((item) => item.id === candidate.jobId);
                      return (
                        <Link
                          key={candidate.id}
                          to={`/recruitment/candidate/${candidate.id}`}
                          draggable
                          onDragStart={() => setDraggingId(candidate.id)}
                          onDragEnd={() => setDraggingId(null)}
                          className={cn(
                            'group rounded-lg border border-outline-variant/70 bg-surface p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md active:cursor-grabbing',
                            draggingId === candidate.id && 'opacity-50'
                          )}
                        >
                          <div className="mb-3 flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="mb-2 flex items-center gap-2">
                                <GripVertical className="size-4 text-outline" />
                                <span className="status-pill border-primary/20 bg-primary/10 text-primary">{stageLabel(candidate.stage)}</span>
                              </div>
                              <h3 className="truncate text-sm font-black text-on-surface group-hover:text-primary">{candidate.name}</h3>
                              <p className="mt-1 truncate text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{job?.title}</p>
                            </div>
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-fixed font-black text-on-primary-fixed">
                              {candidate.name.slice(0, 1)}
                            </div>
                          </div>

                          <div className="space-y-2 text-xs font-semibold text-on-surface-variant">
                            <div className="flex items-center gap-2">
                              <Phone className="size-3.5 text-outline" />
                              <span className="font-mono">{candidate.phone}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Mail className="size-3.5 text-outline" />
                              <span className="truncate">{candidate.email}</span>
                            </div>
                          </div>

                          {candidate.notes && (
                            <div className="mt-3 rounded-lg bg-surface-container-low p-2 text-[10px] font-semibold leading-4 text-on-surface-variant">
                              {candidate.notes}
                            </div>
                          )}

                          <div className="mt-4 flex items-center justify-between border-t border-outline-variant/60 pt-3">
                            <div className="flex items-center gap-1 text-[10px] font-bold text-outline">
                              <Clock className="size-3" />
                              {new Date(candidate.createdAt).toLocaleDateString('vi-VN')}
                            </div>
                            <ArrowRight className="size-4 text-primary" />
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

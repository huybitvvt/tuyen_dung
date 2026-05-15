import {
  ArrowRight,
  Briefcase,
  ChevronRight,
  Clock,
  Mail,
  Phone,
  Plus,
  Search,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { candidateStages, stageLabel, useCrm, type CandidateStage } from '../lib/crmStore';

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

export default function CandidateList() {
  const { candidates, recruitmentJobs, createCandidate } = useCrm();
  const [query, setQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<StageFilter>('all');
  const tabsRef = useRef<HTMLDivElement>(null);

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
        recruitmentJobs.find((job) => job.id === candidate.jobId)?.title,
      ]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(normalized));
    });
  }, [candidates, query, stageFilter, recruitmentJobs]);

  const stageCounts = useMemo(() => {
    const map = new Map<CandidateStage | 'all', number>();
    map.set('all', candidates.length);
    candidateStages.forEach((stage) => {
      map.set(stage.id, candidates.filter((c) => c.stage === stage.id).length);
    });
    return map;
  }, [candidates]);

  // Auto-scroll active tab into view
  useEffect(() => {
    const tabs = tabsRef.current;
    if (!tabs) return;
    const target = tabs.querySelector<HTMLElement>(`[data-stage="${stageFilter}"]`);
    if (target) target.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [stageFilter]);

  function handleCreateCandidate() {
    const name = window.prompt('Họ tên ứng viên');
    if (!name) return;
    const phone = window.prompt('SĐT', '0900 000 000') || '';
    const email = window.prompt('Email', 'candidate@email.com') || '';
    const title = window.prompt('Vị trí ứng tuyển', recruitmentJobs[0]?.title || '') || '';
    const job =
      recruitmentJobs.find((item) => item.title.toLowerCase().includes(title.toLowerCase())) ?? recruitmentJobs[0];
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

  const tabs: Array<{ id: StageFilter; label: string; tone?: string }> = [
    { id: 'all', label: 'Tất cả' },
    ...candidateStages.map((stage, index) => ({
      id: stage.id,
      label: stage.label,
      tone: stageTone[index],
    })),
  ];

  return (
    <div className="flex flex-col gap-3 px-3 py-3">
      {/* HERO */}
      <section className="rounded-2xl border border-outline-variant bg-surface p-4 shadow-sm">
        <p className="eyebrow">Recruitment pipeline</p>
        <h1 className="mt-1 font-display text-[22px] font-bold leading-tight text-on-surface">Ứng viên</h1>
        <p className="mt-1.5 text-[12px] font-semibold leading-5 text-on-surface-variant">
          Lọc theo trạng thái, mở hồ sơ để xem chi tiết hoặc cập nhật stage.
        </p>

        {/* Search + Add */}
        <div className="mt-3 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-on-surface-variant" />
            <input
              type="text"
              placeholder="Tìm ứng viên..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-10 w-full rounded-xl border border-outline-variant bg-surface pl-9 pr-9 text-[13px] font-semibold outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-2 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-on-surface-variant active:scale-90 hover:bg-surface-container-high"
                aria-label="Xoá tìm kiếm"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={handleCreateCandidate}
            className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-on-primary shadow-sm shadow-primary/25 transition active:scale-95 hover:bg-primary-container"
            aria-label="Thêm ứng viên"
          >
            <Plus className="size-5" strokeWidth={2.5} />
          </button>
        </div>
      </section>

      {/* STAGE TABS - horizontal scroll */}
      <div ref={tabsRef} className="-mx-3 flex gap-1.5 overflow-x-auto px-3 pb-1 scrollbar-hide snap-x">
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

      {/* CANDIDATE CARDS */}
      <section className="flex flex-col gap-2.5">
        {filteredCandidates.map((candidate) => {
          const job = recruitmentJobs.find((item) => item.id === candidate.jobId);
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

        {filteredCandidates.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-outline-variant bg-surface px-4 py-10 text-center">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-surface-container-low/60 text-on-surface-variant">
              <Search className="size-5" strokeWidth={2} />
            </div>
            <p className="text-[13px] font-black text-on-surface">Không tìm thấy ứng viên</p>
            <p className="max-w-xs text-[11px] font-medium text-on-surface-variant">
              Thử đổi bộ lọc trạng thái hoặc xoá ô tìm kiếm.
            </p>
            {(query || stageFilter !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setStageFilter('all');
                }}
                className="mt-2 inline-flex h-9 items-center gap-1.5 rounded-full border border-outline-variant bg-surface px-3 text-[10.5px] font-black uppercase tracking-[0.10em] text-on-surface-variant transition active:scale-95 hover:border-primary/30 hover:text-primary"
              >
                <X className="size-3.5" strokeWidth={2.5} />
                Xoá bộ lọc
              </button>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

import {
  Search,
  SlidersHorizontal,
  Plus,
  MoreVertical,
  Phone,
  Mail,
  Globe,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { CandidateStage, candidateStages, Department, stageLabel, useCrm } from '../lib/crmStore';

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
    <div className="flex flex-col min-h-screen bg-background pb-20">
      <div className="p-4 md:p-8 max-w-[1500px] mx-auto w-full flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-on-surface">Kanban tuyển dụng</h2>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mt-1 opacity-70">Kéo thả ứng viên giữa 10 stage và lưu lịch sử tự động</p>
          </div>
          <div className="flex gap-2">
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-surface brightness-95 border border-outline-variant text-on-surface-variant px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-surface-container-low transition-all">
              <SlidersHorizontal className="size-4" /> Lọc
            </button>
            <button onClick={handleCreateCandidate} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-primary-container transition-all shadow-lg shadow-primary/20 active:scale-95">
              <Plus className="size-4" /> Thêm ứng viên
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-outline" />
            <input
              type="text"
              placeholder="Tìm ứng viên..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-full bg-surface border border-outline-variant rounded-xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all shadow-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto pb-4 scrollbar-hide">
          <div className="grid gap-4 min-w-[1280px]" style={{ gridTemplateColumns: `repeat(${candidateStages.length}, minmax(240px, 1fr))` }}>
            {candidateStages.map((stage) => {
              const stageCandidates = filteredCandidates.filter((candidate) => candidate.stage === stage.id);
              return (
                <section
                  key={stage.id}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => {
                    if (draggingId) moveCandidateStage(draggingId, stage.id);
                    setDraggingId(null);
                  }}
                  className="bg-surface-container-low/70 rounded-2xl border border-outline-variant/30 p-3 min-h-[520px]"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[11px] font-black text-on-surface uppercase tracking-widest">{stage.label}</h3>
                    <span className="text-[10px] font-black bg-surface text-on-surface-variant border border-outline-variant/40 px-2 py-0.5 rounded-full">{stageCandidates.length}</span>
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
                            'bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 shadow-sm hover:border-primary transition-all group flex flex-col gap-4 relative overflow-hidden cursor-grab active:cursor-grabbing',
                            draggingId === candidate.id && 'opacity-50'
                          )}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="size-10 rounded-full flex items-center justify-center font-black text-xs bg-secondary-container text-on-secondary-container shrink-0">
                                {candidate.name.slice(0, 1)}
                              </div>
                              <div className="min-w-0">
                                <h3 className="text-sm font-black text-on-surface truncate group-hover:text-primary transition-colors">{candidate.name}</h3>
                                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest truncate">{job?.title}</p>
                              </div>
                            </div>
                            <MoreVertical className="size-4 text-outline" />
                          </div>

                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant">
                              <Phone className="size-3.5 text-outline-variant" />
                              <span className="font-mono">{candidate.phone}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant">
                              <Mail className="size-3.5 text-outline-variant" />
                              <span className="truncate">{candidate.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant">
                              <Globe className="size-3.5 text-outline-variant" />
                              <span className="truncate">{candidate.source}</span>
                            </div>
                          </div>

                          {candidate.notes && (
                            <div className="p-2 bg-surface-container-low rounded-lg text-[10px] font-medium text-on-surface-variant italic">
                              Ghi chú: {candidate.notes}
                            </div>
                          )}

                          <div className="pt-4 mt-auto border-t border-outline-variant/30 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 bg-primary/5 text-primary border border-primary/20 text-[8px] font-black uppercase tracking-widest rounded-full">
                                {stageLabel(candidate.stage)}
                              </span>
                              <div className="flex items-center gap-1 text-[8px] font-bold text-outline uppercase tracking-widest">
                                <Clock className="size-2.5" />
                                {new Date(candidate.createdAt).toLocaleDateString('vi-VN')}
                              </div>
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

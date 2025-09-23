'use client';

import { useCallback, Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import LoadingBrand from '@/components/LoadingBrand';
import MyJobCard from '@/components/MyJobCard';
import { useAuth } from '@/hooks/useAuth';
import { meService } from '@/services/me';

import JobEditor from '@/components/JobEditor';

import styles from '@/styles/MyJobs.module.css';

type Job = {
  uuid: string;
  title: string;
  status: 'draft' | 'published' | 'paused' | 'closed' | 'expired' | string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;
  expiresAt?: string | null;
  totalApplications?: number | null;
};

type JobsResponse = {
  jobs: Job[];
  total: number;
};

type StatusFilter = 'all' | 'draft' | 'published' | 'paused' | 'closed' | 'expired';

const statusLabels: Record<StatusFilter, string> = {
  all: 'Todas',
  draft: 'Rascunhos',
  published: 'Publicadas',
  paused: 'Pausadas',
  closed: 'Encerradas',
  expired: 'Expiradas',
};

function MyJobsPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isBootstrapped, isLoggedIn, isEnterprise } = useAuth();

  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);

  const [showCreate, setShowCreate] = useState(false);
  const [editUuid, setEditUuid] = useState<string | null>(null);

  const closeEditor = () => {
    setShowCreate(false);
    setEditUuid(null);
    void load();
  };

  const [limit, setLimit] = useState<number>(() => {
    const p = searchParams?.get('limit');
    const n = p ? parseInt(p, 10) : 12;
    return Number.isFinite(n) && n > 0 ? n : 12;
  });
  const [offset, setOffset] = useState<number>(() => {
    const p = searchParams?.get('offset');
    const n = p ? parseInt(p, 10) : 0;
    return Number.isFinite(n) && n >= 0 ? n : 0;
  });
  const [status, setStatus] = useState<StatusFilter>(() => {
    const s = (searchParams?.get('status') as StatusFilter) || 'all';
    return (['all', 'draft', 'published', 'paused', 'closed', 'expired'] as const).includes(s) ? s : 'all';
  });

  const page = useMemo(() => Math.floor(offset / limit) + 1, [offset, limit]);
  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

  useEffect(() => {
    if (!isBootstrapped) return;
    if (!isLoggedIn) {
      router.replace(`/signin?next=${encodeURIComponent('/jobs')}`);
    }
  }, [isBootstrapped, isLoggedIn, router]);

  const load = useCallback(async () => {
    if (!isBootstrapped || !isLoggedIn || !isEnterprise) return;
    setLoading(true);
    try {
      const params: any = { limit, offset };
      if (status !== 'all') params.status = status;
      const data = await meService.getMyJobs(params);
      const payload = (data as unknown as JobsResponse) || { jobs: [], total: 0 };
      setJobs(payload.jobs || []);
      setTotal(payload.total || 0);

      const q = new URLSearchParams();
      q.set('limit', String(limit));
      q.set('offset', String(offset));
      q.set('status', status);
      router.replace(`/jobs?${q.toString()}`);
    } catch {
      setJobs([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [isBootstrapped, isLoggedIn, isEnterprise, limit, offset, status, router]);

  useEffect(() => { void load(); }, [load]);

  const onPrev = () => setOffset((o) => Math.max(0, o - limit));
  const onNext = () => {
    const next = offset + limit;
    if (next < total) setOffset(next);
  };

  const onChangeStatus = (next: StatusFilter) => {
    setOffset(0);
    setStatus(next);
  };

  return (
    <LoadingBrand loading={loading && isBootstrapped}>
      <section className={styles.page}>
        <header className={styles.header}>
          <div className={styles.headerTop}>
            <h1 className={styles.title}>Minhas vagas</h1>
            <div className={styles.actions}>
              <button className={styles.primaryBtn} onClick={() => setShowCreate(true)} type="button">
                Nova vaga
              </button>
            </div>
          </div>

          <div className={styles.toolbar}>
            <div className={styles.filters} role="tablist" aria-label="Filtrar por status">
              {(['all', 'draft', 'published', 'paused', 'closed', 'expired'] as StatusFilter[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  role="tab"
                  aria-selected={status === s}
                  className={`${styles.filterBtn} ${status === s ? styles.filterBtn_active : ''}`}
                  onClick={() => onChangeStatus(s)}
                >
                  {statusLabels[s]}
                </button>
              ))}
            </div>

            <div className={styles.pager}>
              <button
                className={styles.pagerBtn}
                onClick={onPrev}
                disabled={offset === 0}
                type="button"
                aria-label="Página anterior"
              >
                ←
              </button>
              <span className={styles.pageInfo}>
                Página {page} de {totalPages}
              </span>
              <button
                className={styles.pagerBtn}
                onClick={onNext}
                disabled={offset + limit >= total}
                type="button"
                aria-label="Próxima página"
              >
                →
              </button>
            </div>
          </div>
        </header>

        {!isEnterprise && isLoggedIn ? (
          <div className={styles.notEnterprise}>
            <h3 className={styles.calloutTitle}>Área exclusiva para empresas</h3>
            <p className={styles.calloutText}>Você precisa estar logado como empresa para gerenciar vagas.</p>
            <Link href="/applications" className={styles.secondaryBtn}>Ver minhas candidaturas</Link>
          </div>
        ) : jobs.length === 0 ? (
          <div className={styles.empty}>
            <h3 className={styles.emptyTitle}>Nenhuma vaga encontrada</h3>
            <p className={styles.emptyText}>Crie sua primeira vaga e comece a receber candidaturas.</p>
            <Link href="/jobs/new" className={styles.primaryBtn}>Criar vaga</Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {jobs.map((job) => (
              <MyJobCard
                key={job.uuid}
                job={job}
                ctaLabel="Ver página pública"
                onView={() => router.push(`/jobs/${job.uuid}`)}
                onEdit={() => setEditUuid(job.uuid)}
              />
            ))}
          </div>
        )}

        {jobs.length > 0 && (
          <div className={styles.footerPager}>
            <button
              className={styles.pagerBtn}
              onClick={onPrev}
              disabled={offset === 0}
              type="button"
            >
              ← Anterior
            </button>
            <span className={styles.pageInfo}>Página {page} de {totalPages}</span>
            <button
              className={styles.pagerBtn}
              onClick={onNext}
              disabled={offset + limit >= total}
              type="button"
            >
              Próxima →
            </button>
          </div>
        )}

        {(showCreate || editUuid) && (
          <div className={styles.modalBackdrop} role="dialog" aria-modal="true">
            <div className={styles.modalPanel}>
              <JobEditor
                mode={showCreate ? 'create' : 'edit'}
                jobUuid={editUuid ?? undefined}
                onClose={closeEditor}
              />
            </div>
          </div>
        )}
      </section>
    </LoadingBrand>
  );
}

export default function MyJobsPage() {
  return (
    <Suspense
      fallback={
        <LoadingBrand loading>
          <section style={{ minHeight: '40vh' }} />
        </LoadingBrand>
      }
    >
      <MyJobsPageInner />
    </Suspense>
  );
}

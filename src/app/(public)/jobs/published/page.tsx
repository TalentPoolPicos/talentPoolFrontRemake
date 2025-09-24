'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import LoadingBrand from '@/components/LoadingBrand';
import JobCard from '@/components/JobCard';
import { jobsService } from '@/services/jobs';
import { path } from '@/lib/path';
import type { JobPreviewDto } from '@/types';
import styles from '@/styles/PublishedJobs.module.css';

type ListResp = {
  jobs: JobPreviewDto[];
  total: number;
  limit: number;
  offset: number;
};

const PAGE_SIZE = 20;

export default function PublishedJobsPage() {
  const [items, setItems] = useState<JobPreviewDto[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // evita chamadas concorrentes/duplicadas do observer
  const lockRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const load = useCallback(async (nextOffset = 0) => {
    try {
      if (nextOffset === 0) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      const resp = await jobsService.getPublishedJobs({
        limit: PAGE_SIZE,
        offset: nextOffset,
      }) as unknown as ListResp;

      setTotal(resp.total ?? 0);
      setOffset(resp.offset ?? nextOffset);
      setItems(prev =>
        nextOffset === 0 ? (resp.jobs ?? []) : [...prev, ...(resp.jobs ?? [])]
      );
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Não foi possível carregar as vagas públicas.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      lockRef.current = false; // libera o lock após completar
    }
  }, []);

  useEffect(() => {
    void load(0);
  }, [load]);

  const canLoadMore = items.length < total;

  // IntersectionObserver para auto “paginar”
  useEffect(() => {
    if (!canLoadMore) return; // nada a observar
    const el = sentinelRef.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry.isIntersecting) return;
        if (lockRef.current) return;
        lockRef.current = true;

        // próxima página
        void load(offset + PAGE_SIZE);
      },
      {
        root: null,
        rootMargin: '200px', // carrega um pouco antes de aparecer
        threshold: 0,
      }
    );

    obs.observe(el);
    return () => {
      obs.disconnect();
    };
  }, [offset, canLoadMore, load]);

  return (
    <LoadingBrand loading={loading}>
      <main className={styles.page}>
        <header className={styles.hero}>
          <div className={styles.breadcrumbs}>
            <Link href={path.home()} className={styles.bcLink}>Início</Link>
            <span className={styles.bcSep}>/</span>
            <span className={styles.bcCurrent}>Vagas publicadas</span>
          </div>

          <h1 className={styles.title}>Vagas publicadas</h1>
          <p className={styles.subtitle}>
            Explore as vagas ativas e publicadas pelas empresas.
          </p>
        </header>

        {error ? (
          <div className={styles.errorWrap}>
            <h2 className={styles.errorTitle}>Ops…</h2>
            <p className={styles.errorMsg}>{error}</p>
            <button className={styles.backBtn} onClick={() => load(0)} type="button">
              Tentar novamente
            </button>
          </div>
        ) : items.length === 0 ? (
          <section className={styles.card}>
            <p className={styles.infoMuted}>Nenhuma vaga publicada no momento.</p>
            <div className={styles.ctaRow}>
              <Link className={styles.secondaryBtn} href={path.home()}>
                Voltar ao início
              </Link>
            </div>
          </section>
        ) : (
          <>
            <section className={styles.card}>
              <ul className={styles.resultList} role="list">
                {items.map(job => (
                  <JobCard key={job.uuid} job={job} />
                ))}
              </ul>

              <div className={styles.listFooter}>
                <span className={styles.count}>
                  Exibindo {items.length} de {total}
                </span>

                {/* fallback manual */}
                {canLoadMore && (
                  <button
                    className={styles.secondaryBtn}
                    onClick={() => {
                      if (lockRef.current) return;
                      lockRef.current = true;
                      void load(offset + PAGE_SIZE);
                    }}
                    disabled={loadingMore}
                    type="button"
                  >
                    {loadingMore ? 'Carregando…' : 'Carregar mais'}
                  </button>
                )}
              </div>

              {/* sentinel para infinite scroll */}
              {canLoadMore && (
                <div
                  ref={sentinelRef}
                  className={styles.infiniteSentinel}
                  aria-hidden
                />
              )}
            </section>
          </>
        )}
      </main>
    </LoadingBrand>
  );
}

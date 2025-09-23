'use client';

import { Suspense, useEffect, useMemo, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import LoadingBrand from '@/components/LoadingBrand';
import CircleAvatar from '@/components/CircleAvatar';
import { useAuth } from '@/hooks/useAuth';
import { meService } from '@/services/me';
import { searchService } from '@/services/search';
import type { JobApplicationStudentResponseDto, JobPreviewDto } from '@/types';

import styles from '@/styles/Applications.module.css';

type ApplicationStatusType = 'pending' | 'reviewing' | 'approved' | 'rejected' | 'withdrawn';

const APP_STATUS_LABEL: Record<ApplicationStatusType, string> = {
  pending: 'Pendente',
  reviewing: 'Em análise',
  approved: 'Aprovada',
  rejected: 'Rejeitada',
  withdrawn: 'Retirada',
};

type AppItem = JobApplicationStudentResponseDto & {
  job: JobPreviewDto & {
    company?: {
      uuid: string;
      username: string;
      name?: string;
      avatarUrl?: string | null;
    };
  };
};

function ApplicationsPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { isBootstrapped, isLoggedIn, isStudent } = useAuth();

  const [loading, setLoading] = useState(true);
  const [apps, setApps] = useState<AppItem[]>([]);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState<number>(() => {
    const p = searchParams?.get('limit');
    const n = p ? parseInt(p, 10) : 10;
    return Number.isFinite(n) && n > 0 ? n : 10;
  });
  const [offset, setOffset] = useState<number>(() => {
    const p = searchParams?.get('offset');
    const n = p ? parseInt(p, 10) : 0;
    return Number.isFinite(n) && n >= 0 ? n : 0;
  });

  const [enterpriseUserUuid, setEnterpriseUserUuid] = useState<Record<string, string>>({});
  const uuidCache = useRef<Map<string, string>>(new Map());

  const page = useMemo(() => Math.floor(offset / limit) + 1, [offset, limit]);
  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

  useEffect(() => {
    if (!isBootstrapped) return;
    if (!isLoggedIn) {
      router.replace(`/signin?next=${encodeURIComponent('/applications')}`);
    }
  }, [isBootstrapped, isLoggedIn, router]);

  const load = useCallback(async () => {
    if (!isBootstrapped || !isLoggedIn) return;
    setLoading(true);
    try {
      const data = await meService.getMyApplications({ limit, offset });
      setApps((data?.applications ?? []) as AppItem[]);
      setTotal(data?.total ?? 0);
      const q = new URLSearchParams();
      q.set('limit', String(limit));
      q.set('offset', String(offset));
      router.replace(`/applications?${q.toString()}`);
    } finally {
      setLoading(false);
    }
  }, [isBootstrapped, isLoggedIn, limit, offset, router]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const usernames = Array.from(
      new Set(
        apps
          .map((a) => a.job?.company?.username?.trim())
          .filter((u): u is string => !!u && !uuidCache.current.has(u))
      )
    );
    if (usernames.length === 0) return;

    (async () => {
      const entries: Array<[string, string]> = [];
      for (const username of usernames) {
        try {
          const res = await searchService.users({ q: username, role: 'enterprise', limit: 5, offset: 0 });
          const hit = (res.hits || []).find((h) => h.username?.toLowerCase() === username.toLowerCase());
          if (hit?.uuid) {
            uuidCache.current.set(username, hit.uuid);
            entries.push([username, hit.uuid]);
          }
        } catch {

        }
      }
      if (entries.length) {
        setEnterpriseUserUuid((prev) => {
          const next = { ...prev };
          for (const [u, id] of entries) next[u] = id;
          return next;
        });
      }
    })();
  }, [apps]);

  const onPrev = () => setOffset((o) => Math.max(0, o - limit));
  const onNext = () => {
    const next = offset + limit;
    if (next < total) setOffset(next);
  };

  const fmtDate = (iso?: string) => {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleDateString();
    } catch {
      return '—';
    }
  };

  const daysFrom = (iso?: string) => {
    if (!iso) return '—';
    try {
      const ms = Date.now() - new Date(iso).getTime();
      const d = Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24)));
      return d === 0 ? 'hoje' : `${d} ${d === 1 ? 'dia' : 'dias'}`;
    } catch {
      return '—';
    }
  };

  const canCancel = (status: string) => status === 'pending';

  const onCancel = async (uuid: string) => {
    const ok = window.confirm('Deseja cancelar esta candidatura? Esta ação não pode ser desfeita.');
    if (!ok) return;
    try {
      await meService.removeApplication(uuid);
      alert('Candidatura cancelada com sucesso.');
      void load();
    } catch {
      alert('Não foi possível cancelar esta candidatura.');
    }
  };

  return (
    <LoadingBrand loading={loading && isBootstrapped}>
      <section className={styles.page}>
        <header className={styles.header}>
          <div className={styles.headerTop}>
            <h1 className={styles.title}>Minhas candidaturas</h1>
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

          <div className={styles.headerMeta}>
            <span className={styles.count}>
              {total} {total === 1 ? 'candidatura' : 'candidaturas'}
            </span>
          </div>
        </header>

        {!isStudent && isLoggedIn ? (
          <div className={styles.notStudent}>
            <h3 className={styles.calloutTitle}>Área exclusiva para estudantes</h3>
            <p className={styles.calloutText}>
              Somente estudantes possuem candidaturas. Como empresa, você pode gerenciar suas vagas.
            </p>
            <Link href="/my/jobs" className={styles.primaryBtn}>
              Ir para Minhas vagas
            </Link>
          </div>
        ) : apps.length === 0 ? (
          <div className={styles.empty}>
            <h3 className={styles.emptyTitle}>Você ainda não possui candidaturas</h3>
            <p className={styles.emptyText}>Encontre oportunidades alinhadas ao seu perfil e candidate-se com um clique.</p>
            <Link href="/search?tab=jobs" className={styles.primaryBtn}>
              Buscar vagas
            </Link>
          </div>
        ) : (
          <ul className={styles.list} role="list">
            {apps.map((app) => {
              const job = app.job;
              const company = job?.company;
              const companyName = company?.name || company?.username || 'Empresa';
              const status = (app.status as ApplicationStatusType) ?? 'pending';
              const profileUuid = company?.username ? enterpriseUserUuid[company.username] : undefined;

              return (
                <li key={app.uuid} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <Link href={`/jobs/${job.uuid}`} className={styles.jobTitle}>
                      {job.title}
                    </Link>
                  </div>

                  <div className={styles.cardGrid}>
                    <div className={styles.colJob}>
                      <div className={styles.metaRow}>
                        {job.publishedAt && (
                          <span className={styles.metaPill}>Publicada em {fmtDate(job.publishedAt)}</span>
                        )}
                        <span className={styles.metaPill}>Candidatou-se há {daysFrom(app.appliedAt)}</span>
                      </div>

                      <div className={styles.actions}>
                        <Link href={`/jobs/${job.uuid}`} className={styles.secondaryBtn}>
                          Ver vaga
                        </Link>
                        {canCancel(status) && (
                          <button
                            className={styles.destructiveBtn}
                            onClick={() => void onCancel(app.uuid)}
                            type="button"
                            title="Cancelar candidatura (somente pendente)"
                          >
                            Cancelar
                          </button>
                        )}
                      </div>
                    </div>

                    <div className={styles.colCompany}>
                      <div className={styles.companyCard}>
                        <CircleAvatar
                          avatarUrl={company?.avatarUrl ?? null}
                          username={company?.username}
                          alt={companyName}
                          width={44}
                          height={44}
                          treatDefaultAsEmpty={false}
                        />
                        <div className={styles.companyInfo}>
                          {profileUuid ? (
                            <Link
                              href={`/profile/${profileUuid}`}
                              className={styles.company}
                              title={`Ver perfil de ${companyName}`}
                            >
                              {companyName}
                            </Link>
                          ) : (
                            <span className={styles.company} aria-disabled="true" title="Perfil indisponível">
                              {companyName}
                            </span>
                          )}
                          <span className={styles.companyUsername}>@{company?.username}</span>
                        </div>
                      </div>
                    </div>

                    <div className={styles.colSummary}>
                      <ul className={styles.kv}>
                        <li>
                          <span>Status</span>
                          <strong>{APP_STATUS_LABEL[status] ?? status}</strong>
                        </li>
                        <li>
                          <span>Aplicação</span>
                          <strong>{fmtDate(app.appliedAt)}</strong>
                        </li>
                      </ul>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {apps.length > 0 && (
          <div className={styles.footerPager}>
            <button className={styles.pagerBtn} onClick={onPrev} disabled={offset === 0} type="button">
              ← Anterior
            </button>
            <span className={styles.pageInfo}>
              Página {page} de {totalPages}
            </span>
            <button className={styles.pagerBtn} onClick={onNext} disabled={offset + limit >= total} type="button">
              Próxima →
            </button>
          </div>
        )}
      </section>
    </LoadingBrand>
  );
}

export default function ApplicationsPage() {
  return (
    <Suspense
      fallback={
        <LoadingBrand loading>
          <section style={{ minHeight: '40vh' }} />
        </LoadingBrand>
      }
    >
      <ApplicationsPageInner />
    </Suspense>
  );
}

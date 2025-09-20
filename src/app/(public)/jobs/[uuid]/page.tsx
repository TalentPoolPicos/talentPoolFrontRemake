'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import LoadingBrand from '@/components/LoadingBrand';
import { useAuth } from '@/hooks/useAuth';
import { jobsService } from '@/services/jobs';
import { searchService } from '@/services/search';
import { path } from '@/lib/path';
import type { JobResponseDto } from '@/types';
import styles from '@/styles/JobDetails.module.css';
import Link from 'next/link';

export default function JobDetailsPage() {
  const { uuid } = useParams<{ uuid: string }>();
  const router = useRouter();
  const { isLoggedIn, isStudent } = useAuth();

  const [job, setJob] = useState<JobResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [companyUserUuid, setCompanyUserUuid] = useState<string | null>(null);
  const profileHref = useMemo(
    () => (companyUserUuid ? path.profileByUuid(companyUserUuid) : null),
    [companyUserUuid]
  );

  const isPublished = useMemo(() => job?.status === 'published', [job?.status]);
  const isExpired = useMemo(() => {
    if (!job?.expiresAt) return false;
    try {
      return new Date(job.expiresAt).getTime() < Date.now();
    } catch {
      return false;
    }
  }, [job?.expiresAt]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await jobsService.getByUuid(uuid);
        if (!mounted) return;
        setJob(data);
      } catch {
        if (mounted) setError('Vaga não encontrada ou indisponível.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [uuid]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!job?.company?.username) {
        setCompanyUserUuid(null);
        return;
      }
      try {
        const res = await searchService.users({
          q: job.company.username,
          role: 'enterprise',
          limit: 5,
          offset: 0,
        });
        const hit = (res.hits || []).find(
          h => h.username?.toLowerCase() === job.company.username.toLowerCase()
        );
        if (mounted) setCompanyUserUuid(hit?.uuid ?? null);
      } catch {
        if (mounted) setCompanyUserUuid(null);
      }
    })();
    return () => { mounted = false; };
  }, [job?.company?.username]);

  const handleApplyClick = () => {
    if (!job) return;
    if (!isLoggedIn) {
      const next = `/jobs/${job.uuid}#apply`;
      router.push(`/signin?next=${encodeURIComponent(next)}`);
      return;
    }
    const el = document.getElementById('apply');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <LoadingBrand loading={loading}>
      {error ? (
        <div className={styles.errorWrap}>
          <h2 className={styles.errorTitle}>Ops…</h2>
          <p className={styles.errorMsg}>{error}</p>
          <button className={styles.backBtn} onClick={() => router.back()}>Voltar</button>
        </div>
      ) : job ? (
        <article className={styles.page}>
          <header className={styles.hero}>
            <div className={styles.breadcrumbs}>
              <Link href="/" className={styles.bcLink}>Início</Link>
              <span className={styles.bcSep}>/</span>
              <Link href="/search?tab=jobs" className={styles.bcLink}>Vagas</Link>
              <span className={styles.bcSep}>/</span>
              <span className={styles.bcCurrent}>{job.title}</span>
            </div>

            <h1 className={styles.title}>{job.title}</h1>

            <div className={styles.metaRow}>
              {profileHref ? (
                <Link
                  href={profileHref}
                  className={styles.company}
                  title={`Ver perfil de ${job.company.name ?? job.company.username}`}
                >
                  {job.company.name ?? job.company.username}
                </Link>
              ) : (
                <span
                  className={styles.company}
                  aria-disabled="true"
                  title="Perfil indisponível no momento"
                >
                  {job.company.name ?? job.company.username}
                </span>
              )}

              <span className={`${styles.badge} ${styles[`status_${job.status}` as const]}`}>
                {job.status === 'published' ? 'Publicada' :
                 job.status === 'draft' ? 'Rascunho' : 'Encerrada'}
              </span>

              <span className={styles.metaPill}>
                Candidaturas: {job.totalApplications}
              </span>
            </div>

            <div className={styles.ctaRow}>
              <button
                className={styles.primaryBtn}
                onClick={handleApplyClick}
                disabled={!isPublished || isExpired}
                title={!isPublished ? 'Vaga não está publicada' : (isExpired ? 'Vaga expirada' : 'Aplicar')}
              >
                {isLoggedIn ? 'Aplicar agora' : 'Entrar para aplicar'}
              </button>

              <button
                className={styles.secondaryBtn}
                onClick={() => router.push('/search?tab=jobs')}
                type="button"
              >
                Ver outras vagas
              </button>
            </div>
          </header>

          <div className={styles.layout}>
            <main className={styles.main}>
              <section className={styles.card}>
                <h2 className={styles.blockTitle}>Descrição da vaga</h2>
                <div
                  className={styles.jobBody}
                  dangerouslySetInnerHTML={{ __html: job.body }}
                />
              </section>
            </main>

            <aside className={styles.aside}>
              <section className={`${styles.card} ${styles.sticky}`}>
                <ul className={styles.kv}>
                  <li>
                    <span>Criada em</span>
                    <strong>{new Date(job.createdAt).toLocaleDateString()}</strong>
                  </li>
                  <li>
                    <span>Atualizada em</span>
                    <strong>{new Date(job.updatedAt).toLocaleDateString()}</strong>
                  </li>
                  {job.expiresAt && (
                    <li>
                      <span>Expira em</span>
                      <strong className={isExpired ? styles.expiredText : undefined}>
                        {new Date(job.expiresAt).toLocaleDateString()}
                      </strong>
                    </li>
                  )}
                </ul>
              </section>

              <section className={styles.card}>
                <h3 className={styles.cardTitle}>Empresa</h3>
                <div className={styles.companyCard}>
                  <div className={styles.companyAvatar} aria-hidden />
                  <div className={styles.companyInfo}>
                    <strong className={styles.companyName}>
                      {job.company.name ?? job.company.username}
                    </strong>
                    {profileHref ? (
                      <Link
                        href={profileHref}
                        className={styles.companyLink}
                      >
                        Ver perfil
                      </Link>
                    ) : (
                      <span className={styles.companyLink} aria-disabled="true" style={{ opacity: .6 }}>
                        Ver perfil
                      </span>
                    )}
                  </div>
                </div>
              </section>
            </aside>
          </div>
        </article>
      ) : null}
    </LoadingBrand>
  );
}

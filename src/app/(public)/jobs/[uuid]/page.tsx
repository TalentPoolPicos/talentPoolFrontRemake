'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

import LoadingBrand from '@/components/LoadingBrand';
import CircleAvatar from '@/components/CircleAvatar';

import { useAuth } from '@/hooks/useAuth';
import { jobsService } from '@/services/jobs';
import { meService } from '@/services/me';
import { searchService } from '@/services/search';
import { path } from '@/lib/path';

import type { JobResponseDto } from '@/types';
import styles from '@/styles/JobDetails.module.css';

type StudentApplicationHit = {
  uuid: string;
  job?: { uuid: string };
  status?: string;
  appliedAt?: string;
};

export default function JobDetailsPage() {
  const { uuid } = useParams<{ uuid: string }>();
  const router = useRouter();
  const { isLoggedIn, isStudent } = useAuth();

  const [job, setJob] = useState<JobResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [companyUserUuid, setCompanyUserUuid] = useState<string | null>(null);
  const [companyAvatarUrl, setCompanyAvatarUrl] = useState<string | null>(null);

  const [myApplication, setMyApplication] = useState<StudentApplicationHit | null>(null);
  const [applying, setApplying] = useState(false);
  const [removing, setRemoving] = useState(false);

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
        setCompanyAvatarUrl(data.company?.avatarUrl ?? null);
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
      const username = job?.company?.username;
      if (!username) {
        if (mounted) setCompanyUserUuid(null);
        return;
      }
      try {
        const res = await searchService.users({
          q: username,
          role: 'enterprise',
          limit: 5,
          offset: 0,
        });
        const hit = (res.hits || []).find(
          (h) => h.username?.toLowerCase() === username.toLowerCase()
        );
        if (!mounted) return;
        setCompanyUserUuid(hit?.uuid ?? null);
        setCompanyAvatarUrl(hit?.avatarUrl ?? job?.company?.avatarUrl ?? null);
      } catch {
        if (!mounted) return;
        setCompanyUserUuid(null);
        setCompanyAvatarUrl(job?.company?.avatarUrl ?? null);
      }
    })();
    return () => { mounted = false; };
  }, [job?.company?.username, job?.company?.avatarUrl]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!isLoggedIn || !isStudent || !job?.uuid) {
        if (mounted) setMyApplication(null);
        return;
      }
      try {
        const pageSize = 50;
        let offset = 0;
        let found: StudentApplicationHit | null = null;
        while (true) {
          const resp: any = await meService.getMyApplications({ limit: pageSize, offset });
          const items: StudentApplicationHit[] = resp?.applications ?? [];
          const match = items.find((a) => a?.job?.uuid === job.uuid) ?? null;
          if (match) {
            found = match;
            break;
          }
          const total: number = resp?.total ?? items.length;
          offset += pageSize;
          if (offset >= total || offset >= 1000) break;
        }
        if (mounted) setMyApplication(found);
      } catch {
        if (mounted) setMyApplication(null);
      }
    })();
    return () => { mounted = false; };
  }, [isLoggedIn, isStudent, job?.uuid]);

  const handleApply = async () => {
    if (!job) return;
    if (!isLoggedIn) {
      const next = `/jobs/${job.uuid}#apply`;
      router.push(`/signin?next=${encodeURIComponent(next)}`);
      return;
    }
    if (!isStudent) {
      alert('Apenas estudantes podem se candidatar a vagas.');
      return;
    }
    if (!isPublished || isExpired) return;

    try {
      setApplying(true);
      const created = await meService.applyToJob(job.uuid, {});
      setMyApplication({ uuid: created.uuid, job: { uuid: job.uuid } });
      setJob((j) => (j ? { ...j, totalApplications: (j.totalApplications ?? 0) + 1 } : j));
      alert('Candidatura enviada com sucesso!');
    } catch (e: any) {
      alert(e?.response?.data?.message ?? 'Não foi possível enviar a candidatura.');
    } finally {
      setApplying(false);
    }
  };

  const handleRemoveApplication = async () => {
    if (!job || !myApplication?.uuid) return;
    const ok = window.confirm('Deseja realmente remover sua candidatura?');
    if (!ok) return;

    try {
      setRemoving(true);
      await meService.removeApplication(myApplication.uuid);
      setMyApplication(null);
      setJob((j) => (j ? { ...j, totalApplications: Math.max(0, (j.totalApplications ?? 0) - 1) } : j));
      alert('Candidatura removida.');
    } catch (e: any) {
      alert(e?.response?.data?.message ?? 'Não foi possível remover a candidatura.');
    } finally {
      setRemoving(false);
    }
  };

  const handlePrimaryCta = () => {
    if (!job) return;
    if (!isLoggedIn) {
      const next = `/jobs/${job.uuid}#apply`;
      router.push(`/signin?next=${encodeURIComponent(next)}`);
      return;
    }
    if (!isStudent) {
      alert('Apenas estudantes podem se candidatar.');
      return;
    }
    if (myApplication) {
      void handleRemoveApplication();
      return;
    }
    void handleApply();
  };

  const renderPrimaryCtaLabel = () => {
    if (!isLoggedIn) return 'Entrar para aplicar';
    if (!isStudent) return 'Disponível apenas para estudantes';
    if (myApplication) return removing ? 'Removendo…' : 'Remover candidatura';
    return applying ? 'Enviando…' : 'Aplicar agora';
  };

  const primaryCtaDisabled =
    (!isPublished || isExpired) ||
    (isLoggedIn && !isStudent) ||
    applying ||
    removing;

  const primaryCtaClass =
    myApplication ? styles.dangerBtn : styles.primaryBtn;

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
                className={primaryCtaClass}
                onClick={handlePrimaryCta}
                disabled={primaryCtaDisabled}
                title={
                  !isPublished ? 'Vaga não está publicada'
                    : (isExpired ? 'Vaga expirada'
                      : (isLoggedIn ? (myApplication ? 'Remover candidatura' : 'Aplicar') : 'Entrar para aplicar'))
                }
                type="button"
              >
                {renderPrimaryCtaLabel()}
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
                  <CircleAvatar
                    avatarUrl={companyAvatarUrl ?? job.company.avatarUrl ?? null}
                    username={job.company.username}
                    alt={job.company.name ?? job.company.username}
                    width={44}
                    height={44}
                    treatDefaultAsEmpty={false}
                  />
                  <div className={styles.companyInfo}>
                    <strong className={styles.companyName}>
                      {job.company.name ?? job.company.username}
                    </strong>
                    {profileHref ? (
                      <Link href={profileHref} className={styles.companyLink}>
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

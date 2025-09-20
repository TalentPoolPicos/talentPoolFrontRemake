'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FiEdit,
  FiPauseCircle,
  FiSend,
  FiXCircle,
  FiUserCheck,
  FiUserX,
  FiRotateCcw,
  FiExternalLink,
} from 'react-icons/fi';

import LoadingBrand from '@/components/LoadingBrand';
import CircleAvatar from '@/components/CircleAvatar';

import { useAuth } from '@/hooks/useAuth';
import { jobsService } from '@/services/jobs';
import { meService } from '@/services/me';
import { searchService } from '@/services/search';
import { path } from '@/lib/path';

import type { JobResponseDto, ApplicationListResponseDto } from '@/types';
import styles from '@/styles/JobDetails.module.css';

type StudentApplicationHit = {
  uuid: string;
  job?: { uuid: string };
  status?: string;
  appliedAt?: string;
};

type AppItem = {
  uuid: string;
  status: 'pending' | 'approved' | 'rejected' | string;
  appliedAt?: string;
  notes?: string | null;
  student?: {
    userUuid?: string;
    username?: string;
    name?: string | null;
    avatarUrl?: string | null;
  };
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

  const [myUuid, setMyUuid] = useState<string | null>(null);
  const [appsLoading, setAppsLoading] = useState(false);
  const [appsError, setAppsError] = useState<string | null>(null);
  const [applications, setApplications] = useState<AppItem[]>([]);
  const [updating, setUpdating] = useState<Record<string, boolean>>({});

  const profileHref = useMemo(
    () => (companyUserUuid ? path.profileByUuid(companyUserUuid) : null),
    [companyUserUuid]
  );

  const isPublished = useMemo(() => job?.status === 'published', [job?.status]);
  const isDraft = useMemo(() => job?.status === 'draft', [job?.status]);
  const isClosed = useMemo(() => job?.status === 'closed', [job?.status]);
  const isExpired = useMemo(() => {
    if (!job?.expiresAt) return false;
    try {
      return new Date(job.expiresAt).getTime() < Date.now();
    } catch {
      return false;
    }
  }, [job?.expiresAt]);

  const isOwner = useMemo(() => {
    if (!isLoggedIn) return false;
    if (!myUuid) return false;
    if (companyUserUuid && myUuid === companyUserUuid) return true;
    if ((job as any)?.company?.uuid && myUuid === (job as any).company.uuid) return true;
    return false;
  }, [isLoggedIn, myUuid, companyUserUuid, job]);

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
    return () => {
      mounted = false;
    };
  }, [uuid]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!isLoggedIn) {
        if (mounted) setMyUuid(null);
        return;
      }
      try {
        const me = await meService.getMyProfile();
        if (mounted) setMyUuid(me.uuid);
      } catch {
        if (mounted) setMyUuid(null);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [isLoggedIn]);

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
          (h: any) => h.username?.toLowerCase() === username.toLowerCase()
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
    return () => {
      mounted = false;
    };
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
    return () => {
      mounted = false;
    };
  }, [isLoggedIn, isStudent, job?.uuid]);

  const loadApplications = useCallback(async () => {
    if (!isOwner || !job?.uuid) return;
    setAppsLoading(true);
    setAppsError(null);
    try {
      const res: ApplicationListResponseDto = await meService.getJobApplications(job.uuid);
      const list = (res?.applications as any[]) ?? [];
      setApplications(
        list.map((a) => ({
          uuid: a.uuid,
          status: a.status,
          appliedAt: a.appliedAt,
          notes: a.notes ?? null,
          student: {
            userUuid:
              a?.student?.userUuid ??
              a?.student?.user?.uuid ??
              a?.userUuid ??
              undefined,
            username: a?.student?.username ?? a?.username ?? undefined,
            name: a?.student?.name ?? a?.name ?? undefined,
            avatarUrl: a?.student?.avatarUrl ?? a?.avatarUrl ?? null,
          },
        }))
      );
    } catch {
      setAppsError('Não foi possível carregar as candidaturas.');
    } finally {
      setAppsLoading(false);
    }
  }, [isOwner, job?.uuid]);

  useEffect(() => {
    void loadApplications();
  }, [loadApplications]);

  useEffect(() => {
    if (!isOwner || applications.length === 0) return;

    const need = applications.filter(
      (a) => (!a.student?.userUuid || !a.student?.avatarUrl) && a.student?.username
    );
    if (need.length === 0) return;

    const run = async () => {
      const usernames = Array.from(
        new Set(need.map((a) => a.student!.username!.toLowerCase()))
      );
      const updates: Record<string, { uuid?: string; avatarUrl?: string | null }> = {};

      await Promise.all(
        usernames.map(async (uname) => {
          try {
            const res = await searchService.users({
              q: uname,
              role: 'student',
              limit: 5,
              offset: 0,
            });
            const hit = (res.hits || []).find(
              (h: any) => h.username?.toLowerCase() === uname
            );
            if (hit) {
              updates[uname] = {
                uuid: hit.uuid,
                avatarUrl: hit.avatarUrl ?? null,
              };
            }
          } catch {
          }
        })
      );

      if (Object.keys(updates).length > 0) {
        setApplications((list) =>
          list.map((a) => {
            const uname = a.student?.username?.toLowerCase();
            if (!uname) return a;
            const patch = updates[uname];
            if (!patch) return a;

            return {
              ...a,
              student: {
                ...a.student,
                userUuid: a.student?.userUuid ?? patch.uuid,
                avatarUrl: a.student?.avatarUrl ?? patch.avatarUrl ?? null,
              },
            };
          })
        );
      }
    };

    void run();
  }, [applications, isOwner]);

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
      setJob((j) =>
        j ? { ...j, totalApplications: (j.totalApplications ?? 0) + 1 } : j
      );
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
      setJob((j) =>
        j
          ? {
            ...j,
            totalApplications: Math.max(
              0,
              (j.totalApplications ?? 0) - 1
            ),
          }
          : j
      );
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

  const primaryCtaClass = myApplication ? styles.dangerBtn : styles.primaryBtn;

  const onPublish = async () => {
    if (!job || !isOwner || !isDraft) return;
    if (!confirm('Publicar esta vaga agora?')) return;
    try {
      const updated = await meService.publishJob(job.uuid);
      setJob(updated);
      alert('Vaga publicada.');
      void loadApplications();
    } catch {
      alert('Não foi possível publicar a vaga.');
    }
  };

  const onPause = async () => {
    if (!job || !isOwner || !isPublished) return;
    if (!confirm('Pausar esta vaga (volta para rascunho)?')) return;
    try {
      const updated = await meService.pauseJob(job.uuid);
      setJob(updated);
      alert('Vaga pausada.');
    } catch {
      alert('Não foi possível pausar a vaga.');
    }
  };

  const onClose = async () => {
    if (!job || !isOwner || isClosed) return;
    if (!confirm('Encerrar esta vaga? Esta ação é definitiva.')) return;
    try {
      const updated = await meService.closeJob(job.uuid);
      setJob(updated);
      alert('Vaga encerrada.');
    } catch {
      alert('Não foi possível encerrar a vaga.');
    }
  };

  const onEdit = () => {
    if (!job) return;
    router.push(`/my/jobs/${job.uuid}/edit`);
  };

  const setAppStatus = async (
    appUuid: string,
    status: 'approved' | 'rejected' | 'pending'
  ) => {
    try {
      setUpdating((u) => ({ ...u, [appUuid]: true }));
      await meService.updateApplicationStatus(appUuid, { status } as any);
      setApplications((list) =>
        list.map((a) => (a.uuid === appUuid ? { ...a, status } : a))
      );
    } catch {
      alert('Não foi possível atualizar o status.');
    } finally {
      setUpdating((u) => ({ ...u, [appUuid]: false }));
    }
  };

  const fmtDate = (iso?: string) => {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleDateString();
    } catch {
      return '—';
    }
  };

  const statusLabel = (s: string) =>
    s === 'approved' ? 'Aprovada' : s === 'rejected' ? 'Rejeitada' : 'Pendente';

  return (
    <LoadingBrand loading={loading}>
      {error ? (
        <div className={styles.errorWrap}>
          <h2 className={styles.errorTitle}>Ops…</h2>
          <p className={styles.errorMsg}>{error}</p>
          <button className={styles.backBtn} onClick={() => router.back()}>
            Voltar
          </button>
        </div>
      ) : job ? (
        <article className={styles.page}>
          <header className={styles.hero}>
            <div className={styles.breadcrumbs}>
              <Link href="/" className={styles.bcLink}>
                Início
              </Link>
              <span className={styles.bcSep}>/</span>
              <Link href="/search?tab=jobs" className={styles.bcLink}>
                Vagas
              </Link>
              <span className={styles.bcSep}>/</span>
              <span className={styles.bcCurrent}>{job.title}</span>
            </div>

            <h1 className={styles.title}>{job.title}</h1>

            <div className={styles.metaRow}>
              {profileHref ? (
                <Link
                  href={profileHref}
                  className={styles.company}
                  title={`Ver perfil de ${job.company.name ?? job.company.username
                    }`}
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

              <span
                className={`${styles.badge} ${styles[`status_${job.status}` as const]}`}
              >
                {job.status === 'published'
                  ? 'Publicada'
                  : job.status === 'draft'
                    ? 'Rascunho'
                    : 'Encerrada'}
              </span>

              <span className={styles.metaPill}>
                Candidaturas: {job.totalApplications}
              </span>

              {isOwner && (
                <span
                  className={styles.metaPill}
                  title="Você é o proprietário desta vaga"
                >
                  Minha vaga
                </span>
              )}
            </div>

            {!isOwner ? (
              <div className={styles.ctaRow}>
                <button
                  className={primaryCtaClass}
                  onClick={handlePrimaryCta}
                  disabled={primaryCtaDisabled}
                  title={
                    !isPublished
                      ? 'Vaga não está publicada'
                      : isExpired
                        ? 'Vaga expirada'
                        : isLoggedIn
                          ? myApplication
                            ? 'Remover candidatura'
                            : 'Aplicar'
                          : 'Entrar para aplicar'
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
            ) : (
              <div className={styles.ctaRow}>
                {isDraft && (
                  <button
                    className={styles.primaryBtn}
                    onClick={onPublish}
                    type="button"
                    title="Publicar"
                  >
                    <FiSend /> Publicar
                  </button>
                )}
                {isPublished && (
                  <button
                    className={styles.secondaryBtn}
                    onClick={onPause}
                    type="button"
                    title="Pausar"
                  >
                    <FiPauseCircle /> Pausar
                  </button>
                )}
                {!isClosed && (
                  <button
                    className={styles.dangerBtn}
                    onClick={onClose}
                    type="button"
                    title="Encerrar"
                  >
                    <FiXCircle /> Encerrar
                  </button>
                )}
                <button
                  className={styles.secondaryBtn}
                  onClick={onEdit}
                  type="button"
                  title="Editar"
                >
                  <FiEdit /> Editar vaga
                </button>
              </div>
            )}
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

              {isOwner && (
                <section className={styles.card} id="applications">
                  <h2 className={styles.blockTitle}>Candidaturas</h2>

                  {appsLoading ? (
                    <p className={styles.infoMuted}>Carregando candidaturas…</p>
                  ) : appsError ? (
                    <p className={styles.infoMuted}>{appsError}</p>
                  ) : applications.length === 0 ? (
                    <p className={styles.infoMuted}>
                      Ainda não há candidaturas para esta vaga.
                    </p>
                  ) : (
                    <ul className={styles.kv} role="list">
                      {applications.map((a) => {
                        const isBusy = !!updating[a.uuid];
                        const profileUuid = a.student?.userUuid ?? undefined;
                        return (
                          <li key={a.uuid} className={styles.appItem}>
                            <div className={styles.appLead}>
                              <CircleAvatar
                                avatarUrl={a.student?.avatarUrl ?? null}
                                username={a.student?.username}
                                alt={a.student?.name ?? a.student?.username ?? 'Candidato'}
                                width={36}
                                height={36}
                                treatDefaultAsEmpty={false}
                              />
                              <div className={styles.appLeadInfo}>
                                <strong className={styles.appLeadName}>
                                  {a.student?.name ?? a.student?.username ?? 'Candidato'}
                                </strong>
                                <span className={styles.infoMuted} style={{ fontSize: '.85rem' }}>
                                  Aplicou em {fmtDate(a.appliedAt)}
                                </span>
                              </div>
                            </div>

                            <div className={styles.appActions} role="group" aria-label="Ações da candidatura">
                              <span
                                className={`${styles.badge} ${a.status === 'approved'
                                  ? styles.status_published
                                  : a.status === 'rejected'
                                    ? styles.status_closed
                                    : styles.status_draft
                                  }`}
                                title="Status da candidatura"
                              >
                                {statusLabel(a.status)}
                              </span>

                              <button
                                type="button"
                                className={`${styles.iconBtn} ${a.status === 'approved' ? styles.iconBtnActive : ''}`}
                                data-variant="approve"
                                onClick={() => setAppStatus(a.uuid, 'approved')}
                                title="Aprovar candidatura"
                                aria-label="Aprovar candidatura"
                                disabled={isBusy}
                              >
                                <FiUserCheck />
                              </button>

                              <button
                                type="button"
                                className={`${styles.iconBtn} ${a.status === 'rejected' ? styles.iconBtnActive : ''}`}
                                data-variant="reject"
                                onClick={() => setAppStatus(a.uuid, 'rejected')}
                                title="Rejeitar candidatura"
                                aria-label="Rejeitar candidatura"
                                disabled={isBusy}
                              >
                                <FiUserX />
                              </button>

                              <button
                                type="button"
                                className={`${styles.iconBtn} ${a.status === 'pending' ? styles.iconBtnActive : ''}`}
                                data-variant="pending"
                                onClick={() => setAppStatus(a.uuid, 'pending')}
                                title="Marcar como pendente"
                                aria-label="Marcar como pendente"
                                disabled={isBusy}
                              >
                                <FiRotateCcw />
                              </button>

                              {profileUuid ? (
                                <Link
                                  href={path.profileByUuid(profileUuid)}
                                  className={styles.iconBtn}
                                  data-variant="link"
                                  title="Ver perfil do candidato"
                                  aria-label="Ver perfil do candidato"
                                >
                                  <FiExternalLink />
                                </Link>
                              ) : null}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </section>
              )}
            </main>

            <aside className={styles.aside}>
              <section className={`${styles.card} ${styles.sticky}`}>
                <ul className={styles.kv}>
                  <li className={styles.appItem}>
                    <span>Criada em</span>
                    <strong>{new Date(job.createdAt).toLocaleDateString()}</strong>
                  </li>
                  <li className={styles.appItem}>
                    <span>Atualizada em</span>
                    <strong>{new Date(job.updatedAt).toLocaleDateString()}</strong>
                  </li>
                  {job.expiresAt && (
                    <li className={styles.appItem}>
                      <span>Expira em</span>
                      <strong
                        className={isExpired ? styles.expiredText : undefined}
                      >
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
                      <span
                        className={styles.companyLink}
                        aria-disabled="true"
                        style={{ opacity: 0.6 }}
                      >
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

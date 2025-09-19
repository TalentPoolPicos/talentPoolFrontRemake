'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import LoadingBrand from '@/components/LoadingBrand';
import ImageUser from '@/components/ImageUser';
import CircleAvatar from '@/components/CircleAvatar';
import { useAuth } from '@/hooks/useAuth';
import { usersService } from '@/services/users';
import { meService } from '@/services/me';
import { likesService } from '@/services/likes';
import { path } from '@/lib/path';
import styles from '@/styles/Profile.module.css';
import type {
  PublicUserProfileResponseDto,
  UserProfileResponseDto,
  LikeInitiatorsResponseDto,
  LikeReceiversResponseDto,
  Role,
} from '@/types';

import type { IconType } from 'react-icons';
import { FiMail, FiMapPin, FiDownload, FiLink, FiFileText, FiEdit } from 'react-icons/fi';
import {
  FaDiscord,
  FaLinkedin,
  FaGithub,
  FaFacebook,
  FaGitlab,
  FaInstagram,
  FaReddit,
  FaTelegram,
  FaTiktok,
  FaWhatsapp,
  FaXTwitter,
  FaYoutube,
} from 'react-icons/fa6';

type ProfileDto = PublicUserProfileResponseDto | UserProfileResponseDto;

const socialIcons: Record<string, IconType> = {
  discord: FaDiscord,
  linkedin: FaLinkedin,
  github: FaGithub,
  facebook: FaFacebook,
  gitlab: FaGitlab,
  instagram: FaInstagram,
  reddit: FaReddit,
  telegram: FaTelegram,
  tiktok: FaTiktok,
  whatsapp: FaWhatsapp,
  x: FaXTwitter,
  youtube: FaYoutube,
};

function isPrivate(u: ProfileDto | null): u is UserProfileResponseDto {
  return !!u && 'stats' in u;
}

export default function ProfileView({ uuid }: { uuid?: string }) {
  const router = useRouter();
  const { isLoggedIn, user: loggedUser, isBootstrapped } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<ProfileDto | null>(null);

  const [likesLoading, setLikesLoading] = useState(false);
  const [initiators, setInitiators] = useState<LikeInitiatorsResponseDto | null>(null);
  const [receivers, setReceivers] = useState<LikeReceiversResponseDto | null>(null);

  const [loadingLike, setLoadingLike] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const isOwn = useMemo(
    () => !!user?.uuid && !!loggedUser?.uuid && user.uuid === loggedUser.uuid,
    [user?.uuid, loggedUser?.uuid]
  );

  const hasAnySocial = useMemo(() => {
    const hasLattes = user?.role === 'student' && !!user.student?.lattes;
    const hasSocials = (user?.socialMedia?.length ?? 0) > 0;
    return Boolean(hasLattes || hasSocials);
  }, [user]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let u: ProfileDto | null = null;

      if (uuid) {
        u = await usersService.getPublicProfile(uuid);
      } else {
        if (!isBootstrapped) return;
        if (!isLoggedIn) {
          router.replace(path.home());
          return;
        }
        u = await meService.getMyProfile();
      }

      if (!u) {
        setError('Usuário não encontrado.');
        return;
      }
      setUser(u);
    } catch (e) {
      console.error(e);
      setError('Falha ao carregar perfil.');
    } finally {
      setLoading(false);
    }
  }, [uuid, isLoggedIn, isBootstrapped, router]);

  const fetchLikes = useCallback(async () => {
    if (!user?.uuid) return;
    setLikesLoading(true);
    try {
      const [init, recv] = await Promise.all([
        likesService
          .getInitiators(user.uuid)
          .catch(() => ({ initiators: [], total: 0 } as LikeInitiatorsResponseDto)),
        likesService
          .getReceivers(user.uuid)
          .catch(() => ({ receivers: [], total: 0 } as LikeReceiversResponseDto)),
      ]);
      setInitiators(init);
      setReceivers(recv);
    } catch (err) {
      console.error('Erro ao buscar curtidas', err);
    } finally {
      setLikesLoading(false);
    }
  }, [user?.uuid]);

  const checkIfLiked = useCallback(
    async (u?: ProfileDto | null) => {
      if (!u || !isLoggedIn || !loggedUser) return;
      if (loggedUser.uuid === u.uuid) return;
      if ((loggedUser.role as Role) === u.role) return;

      setLoadingLike(true);
      try {
        const r = await meService.checkLike(u.uuid);
        setIsLiked(Boolean(r?.hasLiked));
      } catch {
        setIsLiked(false);
      } finally {
        setLoadingLike(false);
      }
    },
    [isLoggedIn, loggedUser]
  );

  const matchToggle = async () => {
    if (!isLoggedIn) {
      router.push(path.home());
      return;
    }
    if (!user?.uuid) return;
    if (loggedUser?.uuid === user.uuid) {
      alert('Você não pode dar like em si mesmo.');
      return;
    }

    setLoadingLike(true);
    const next = !isLiked;
    setIsLiked(next);
    try {
      if (next) await meService.giveLike(user.uuid);
      else await meService.removeLike(user.uuid);
    } catch (e) {
      console.error('Erro ao (des)curtir', e);
      setIsLiked(!next);
    } finally {
      setLoadingLike(false);
    }
  };

  const downloadCurriculum = () => {
    const url = user && user.role === 'student' ? user.student?.curriculumUrl : null;
    if (url) window.open(url, '_blank');
    else alert('Usuário não cadastrou o currículo.');
  };
  const downloadHistory = () => {
    const url = user && user.role === 'student' ? user.student?.historyUrl : null;
    if (url) window.open(url, '_blank');
    else alert('Usuário não cadastrou o histórico.');
  };

  const goToEdit = () => router.push('/profile/edit');

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (user) {
      void fetchLikes();
      void checkIfLiked(user);
    }
  }, [user, fetchLikes, checkIfLiked]);

  const displayName = useMemo(() => {
    if (!user) return '';
    if (user.name) return user.name;
    if (user.role === 'enterprise') return user.enterprise?.fantasyName ?? 'Empresa';
    return 'Talento';
  }, [user]);

  const privateStats = isPrivate(user) ? user.stats : undefined;

  return (
    <LoadingBrand loading={loading}>
      {error ? (
        <div className={styles.error}>{error}</div>
      ) : (
        <div className={styles.profilePage}>
          <ImageUser user={user ?? undefined} editable />

          <section className={styles.main}>
            <div className={styles.headerCard}>
              <div className={styles.nameRow}>
                <h1 className={styles.title}>{displayName}</h1>

                {user?.username && <span className={styles.usernameAt}>@{user.username}</span>}

                {isLoggedIn && !isOwn && loggedUser?.role !== user?.role && (
                  <button
                    type="button"
                    className={`${styles.matchIndicator} ${isLiked ? styles.liked : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      void matchToggle();
                    }}
                    aria-label={isLiked ? 'Remover like' : 'Dar like'}
                    title={isLiked ? 'Remover like' : 'Dar like'}
                  >
                    {loadingLike ? (
                      <span className={styles.emoji}>⏳</span>
                    ) : isLiked ? (
                      <span className={`${styles.emoji} ${styles.animateIn}`}>❤️‍🔥</span>
                    ) : (
                      <span className={`${styles.emoji} ${styles.animateOut}`}>🖤</span>
                    )}
                  </button>
                )}
              </div>

              <div className={styles.metaRow}>
                {user?.role === 'enterprise' && (
                  <span className={`${styles.roleBadge} ${styles.roleEnterprise}`}>Empresa</span>
                )}
              </div>

              {user?.description && <p className={styles.about}>{user.description}</p>}

              {!!user?.tags?.length && (
                <div className={styles.tagsInline}>
                  {user.tags.map((t) => (
                    <span key={t.uuid} className={styles.tagChip}>
                      {t.label}
                    </span>
                  ))}
                </div>
              )}

              <div className={styles.quickInfo}>
                <div className={styles.qiItem}>
                  <span className={styles.qiLabel}>Email</span>
                  <span className={styles.qiValue}>
                    <FiMail className={styles.qiIcon} aria-hidden />
                    <span>{isPrivate(user) ? user.email : '—'}</span>
                  </span>
                </div>

                {user?.role === 'student' && user.student?.course && (
                  <div className={styles.qiItem}>
                    <span className={styles.qiLabel}>Curso</span>
                    <span className={styles.qiValue}>{user.student.course}</span>
                  </div>
                )}

                {user?.role === 'enterprise' && user.enterprise?.fantasyName && (
                  <div className={styles.qiItem}>
                    <span className={styles.qiLabel}>Empresa</span>
                    <span className={styles.qiValue}>{user.enterprise.fantasyName}</span>
                  </div>
                )}

                {user?.address && (
                  <div className={styles.qiItem}>
                    <span className={styles.qiLabel}>Localização</span>
                    <span className={styles.qiValue}>
                      <FiMapPin className={styles.qiIcon} aria-hidden />
                      <span>
                        {user.address.city} / {user.address.state}
                      </span>
                    </span>
                  </div>
                )}
              </div>
            </div>
          </section>

          <aside className={styles.sidebar}>
            {isOwn && (
              <div className={`${styles.card} ${styles.sidebarCard}`}>
                <h3 className={styles.cardTitle}>Ações</h3>
                <div className={styles.actionButtons}>
                  <button
                    className={`${styles.downloadBtn} ${styles.editBtn}`}
                    onClick={goToEdit}
                    title="Editar perfil"
                    type="button"
                  >
                    <FiEdit className={styles.downloadIcon} aria-hidden />
                    Editar perfil
                  </button>
                </div>
              </div>
            )}

            {user?.role === 'student' && (user.student?.curriculumUrl || user.student?.historyUrl) && (
              <div className={`${styles.card} ${styles.sidebarCard}`}>
                <h3 className={styles.cardTitle}>Documentos</h3>
                <div className={styles.downloadsCol}>
                  {user.student?.curriculumUrl && (
                    <button
                      className={styles.downloadBtn}
                      onClick={downloadCurriculum}
                      title="Baixar currículo (PDF)"
                      type="button"
                    >
                      <FiDownload className={styles.downloadIcon} aria-hidden />
                      Currículo
                    </button>
                  )}

                  {user.student?.historyUrl && (
                    <button
                      className={styles.downloadBtn}
                      onClick={downloadHistory}
                      title="Baixar histórico (PDF)"
                      type="button"
                    >
                      <FiDownload className={styles.downloadIcon} aria-hidden />
                      Histórico
                    </button>
                  )}
                </div>
              </div>
            )}

            {hasAnySocial && (
              <div className={styles.card}>
                <h3 className={styles.cardTitle}>Conecte-se</h3>
                <ul className={`${styles.socialLinks} ${styles.socialOnlyIcons}`}>
                  {user?.role === 'student' && user.student?.lattes && (
                    <li>
                      <a
                        href={user.student.lattes}
                        target="_blank"
                        rel="noreferrer noopener"
                        aria-label="Lattes"
                        title="Lattes"
                        className={styles.socialCircle}
                      >
                        <FiFileText aria-hidden />
                        <span className={styles.srOnly}>Lattes</span>
                      </a>
                    </li>
                  )}
                  {user?.socialMedia?.map((link) => {
                    const Icon = socialIcons[link.type] ?? FiLink;
                    return (
                      <li key={link.uuid}>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noreferrer noopener"
                          aria-label={link.type}
                          title={link.type}
                          className={styles.socialCircle}
                        >
                          <Icon aria-hidden />
                          <span className={styles.srOnly}>{link.type}</span>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            <div className={`${styles.card} ${styles.stats}`}>
              <h3 className={styles.cardTitle}>Estatísticas</h3>

              <div className={styles.statItem} role="group" aria-label="Curtidas recebidas">
                <div className={styles.likesContainer}>
                  <span className={styles.statNumber}>
                    {initiators?.total ?? privateStats?.totalLikesReceived ?? 0}
                  </span>
                  <div className={styles.avatarStack}>
                    {initiators?.initiators?.slice(0, 5).map((u, idx) => (
                      <div key={u.uuid} className={styles.stackedAvatar} style={{ zIndex: 10 - idx }}>
                        <CircleAvatar
                          avatarUrl={u.avatarUrl ?? undefined}
                          username={u.username ?? undefined}
                          width={36}
                          height={36}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <span className={styles.statLabel}>Curtidas recebidas</span>
              </div>

              <div className={styles.statItem} role="group" aria-label="Curtidas enviadas">
                <div className={styles.likesContainer}>
                  <span className={styles.statNumber}>
                    {receivers?.total ?? privateStats?.totalLikesGiven ?? 0}
                  </span>
                  <div className={styles.avatarStack}>
                    {receivers?.receivers?.slice(0, 5).map((u, idx) => (
                      <div key={u.uuid} className={styles.stackedAvatar} style={{ zIndex: 10 - idx }}>
                        <CircleAvatar
                          avatarUrl={u.avatarUrl ?? undefined}
                          username={u.username ?? undefined}
                          width={36}
                          height={36}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <span className={styles.statLabel}>Curtidas enviadas</span>
              </div>
            </div>
          </aside>
        </div>
      )}
    </LoadingBrand>
  );
}

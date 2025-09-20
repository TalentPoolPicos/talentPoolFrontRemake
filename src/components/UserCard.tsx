'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import CircleAvatar from '@/components/CircleAvatar';
import { useAuth } from '@/hooks/useAuth';
import { meService } from '@/services/me';
import { path } from '@/lib/path';
import type { Role, UserPreviewResponseDto } from '@/types';
import styles from '@/styles/UserCard.module.css';

type Props = { user: UserPreviewResponseDto };

const BASE_FILES = process.env.NEXT_PUBLIC_FILES_BASE ?? '';

function toAbs(u?: string | null) {
  if (!u) return undefined;
  if (/^https?:\/\//i.test(u) || u.startsWith('data:')) return u;
  try {
    return new URL(u, BASE_FILES || window.location.origin).toString();
  } catch {
    return u;
  }
}

function pickUrl(...vals: Array<string | null | undefined>) {
  const v = vals.find((x) => !!x && String(x).trim() !== '');
  return v ?? undefined;
}

export default function UserCard({ user }: Props) {
  const { isLoggedIn, user: logged } = useAuth();

  const [loadingLike, setLoadingLike] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const canLike = useMemo(() => {
    if (!isLoggedIn || !logged) return false;
    if (logged.uuid === user.uuid) return false;
    return (logged.role as Role) !== user.role;
  }, [isLoggedIn, logged, user]);

  const checkIfLiked = async () => {
    if (!canLike) return;
    setLoadingLike(true);
    try {
      const r = await meService.checkLike(user.uuid);
      setIsLiked(Boolean(r?.hasLiked));
    } catch {
      setIsLiked(false);
    } finally {
      setLoadingLike(false);
    }
  };

  const matchToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!canLike) return;

    setLoadingLike(true);
    const next = !isLiked;
    setIsLiked(next);
    try {
      if (next) await meService.giveLike(user.uuid);
      else await meService.removeLike(user.uuid);
    } catch (err) {
      console.error('Erro ao (des)curtir', err);
      setIsLiked(!next);
    } finally {
      setLoadingLike(false);
    }
  };

  useEffect(() => { void checkIfLiked(); }, [user.uuid, canLike]);

  const displayName = user.name ?? user.username;

  const avatarUrl =
    toAbs(pickUrl(user.avatarUrl, (user as any).profilePicture, (user as any).avatar_url));
  const bannerUrl =
    toAbs(pickUrl(user.bannerUrl, (user as any).banner_url, (user as any).bannerURL)) || '/banner.png';

  const tags = user.mainTags ?? [];

  return (
    <li className={styles.resultCard}>
      <Link href={path.profileByUuid(user.uuid)} className={styles.cardLink} aria-label={`Abrir perfil de ${displayName}`}>
        <div className={styles.cardContent}>
          <div className={styles.imageUserContainer}>
            <div className={styles.cardCircleAvatar}>
              <CircleAvatar
                avatarUrl={avatarUrl}
                username={user.username}
                width={72}
                height={72}
                alt={displayName}
                treatDefaultAsEmpty
              />
            </div>

            <Image
              src={bannerUrl}
              alt="Banner do usuário"
              fill
              sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, 400px"
              className={styles.bannerImage}
              priority={false}
            />
          </div>

          <div className={styles.info}>
            <p><strong>{displayName}</strong></p>
            <p className={styles.location}>{user.location ?? '—'}</p>

            {!!tags.length && (
              <div className={styles.tags}>
                {tags.map((t, i) => (
                  <span key={`${t}-${i}`} className={styles.tag}>
                    {String(t).replace(/\s+/g, '_')}
                  </span>
                ))}
              </div>
            )}
          </div>

          {canLike && (
            <button
              className={`${styles.matchIndicator} ${isLiked ? styles.liked : ''}`}
              onClick={matchToggle}
              type="button"
              aria-pressed={isLiked}
              aria-label={isLiked ? 'Remover like' : 'Dar like'}
            >
              {loadingLike ? (
                <span className={styles.emoji} aria-hidden>⏳</span>
              ) : isLiked ? (
                <span className={`${styles.emoji} ${styles.animateIn}`} aria-hidden>❤️‍🔥</span>
              ) : (
                <span className={`${styles.emoji} ${styles.animateOut}`} aria-hidden>🖤</span>
              )}
            </button>
          )}
        </div>
      </Link>
    </li>
  );
}

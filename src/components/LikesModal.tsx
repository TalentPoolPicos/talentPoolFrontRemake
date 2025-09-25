'use client';

import { useEffect, useRef, useState } from 'react';
import CircleAvatar from '@/components/CircleAvatar';
import { likesService } from '@/services/likes';
import styles from '@/styles/LikesModal.module.css';

type LikeUser = {
  uuid: string;
  username?: string;
  name?: string;
  avatarUrl?: string | null;
  location?: string;
  mainTags?: string[];
};

type Props = {
  /** UUID do perfil (dono da página) */
  userUuid?: string;
  /** 'received' = curtidas recebidas | 'sent' = curtidas enviadas */
  type: 'received' | 'sent';
  /** controle externo de abertura */
  isOpen: boolean;
  /** callback para fechar */
  onClose: () => void;
  /** título opcional customizado */
  title?: string;
};

export default function LikesModal({ userUuid, type, isOpen, onClose, title }: Props) {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<LikeUser[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const dialogRef = useRef<HTMLDivElement | null>(null);

  // Busca os dados ao abrir
  useEffect(() => {
    if (!isOpen || !userUuid) return;

    let mounted = true;
    setLoading(true);
    setError(null);

    const run = async () => {
      try {
        if (type === 'received') {
          const data = await likesService.getInitiators(userUuid);
          if (!mounted) return;
          setUsers((data?.initiators ?? []) as LikeUser[]);
          setTotal(data?.total ?? (data?.initiators?.length ?? 0));
        } else {
          const data = await likesService.getReceivers(userUuid);
          if (!mounted) return;
          setUsers((data?.receivers ?? []) as LikeUser[]);
          setTotal(data?.total ?? (data?.receivers?.length ?? 0));
        }
      } catch (e) {
        if (!mounted) return;
        setUsers([]);
        setTotal(0);
        setError('Não foi possível carregar as curtidas.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void run();
    return () => {
      mounted = false;
    };
  }, [isOpen, userUuid, type]);

  // Fechar com ESC
  useEffect(() => {
    if (!isOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  // Click fora do dialog fecha
  const onOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const heading =
    title ??
    (type === 'received' ? 'Curtidas recebidas' : 'Curtidas enviadas');

  return (
    <div
      className={styles.overlay}
      data-open={isOpen || undefined}
      role="dialog"
      aria-modal="true"
      aria-labelledby="likes-modal-title"
      onClick={onOverlayClick}
    >
      <div className={styles.modal} ref={dialogRef}>
        <header className={styles.header}>
          <h2 id="likes-modal-title" className={styles.title}>
            {heading} {total > 0 ? `(${total})` : ''}
          </h2>
          <button
            type="button"
            className={styles.closeBtn}
            aria-label="Fechar"
            title="Fechar"
            onClick={onClose}
          >
            ×
          </button>
        </header>

        <div className={styles.content}>
          {loading && <div className={styles.state}>Carregando…</div>}
          {!loading && error && <div className={styles.stateError}>{error}</div>}
          {!loading && !error && users.length === 0 && (
            <div className={styles.state}>Nenhuma curtida encontrada.</div>
          )}

          {!loading && !error && users.length > 0 && (
            <ul className={styles.list} role="list">
              {users.map((u) => (
                <li key={u.uuid} className={styles.listItem}>
                  <div className={styles.userCard}>
                    <CircleAvatar
                      avatarUrl={u.avatarUrl ?? undefined}
                      username={u.username ?? undefined}
                      width={40}
                      height={40}
                    />
                    <div className={styles.userMeta}>
                      <div className={styles.userNameLine}>
                        <span className={styles.name}>{u.name ?? 'Usuário'}</span>
                        {u.username && (
                          <span className={styles.username}>@{u.username}</span>
                        )}
                      </div>
                      {u.location && (
                        <span className={styles.subtle}>{u.location}</span>
                      )}
                      {Array.isArray(u.mainTags) && u.mainTags.length > 0 && (
                        <div className={styles.tags}>
                          {u.mainTags.slice(0, 4).map((t) => (
                            <span className={styles.tag} key={t}>{t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
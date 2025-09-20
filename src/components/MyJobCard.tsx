// src/components/MyJobCard.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiEye, FiEdit, FiSend, FiPauseCircle, FiXCircle } from 'react-icons/fi';
import { meService } from '@/services/me';
import styles from '@/styles/MyJobCard.module.css';

type Job = {
  uuid: string;
  title: string;
  status: 'draft' | 'published' | 'closed' | string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;
  expiresAt?: string | null;
  totalApplications?: number | null;
};

type Props = {
  job: Job;
  onView: () => void;
  ctaLabel?: string;
};

export default function MyJobCard({ job, onView, ctaLabel = 'Ver detalhes' }: Props) {
  const router = useRouter();
  const [localJob, setLocalJob] = useState<Job>(job);
  const [busy, setBusy] = useState<'publish' | 'pause' | 'close' | 'edit' | null>(null);

  const status = (localJob.status as 'draft' | 'published' | 'closed') ?? 'draft';

  const fmt = (iso?: string | null) => {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleDateString();
    } catch {
      return '—';
    }
  };

  const handlePublish = async () => {
    if (status !== 'draft') return;
    if (!confirm('Publicar esta vaga agora?')) return;
    try {
      setBusy('publish');
      const updated = await meService.publishJob(localJob.uuid);
      setLocalJob((j) => ({ ...j, ...updated }));
    } catch {
      alert('Não foi possível publicar a vaga.');
    } finally {
      setBusy(null);
    }
  };

  const handlePause = async () => {
    if (status !== 'published') return;
    if (!confirm('Pausar esta vaga (voltará para rascunho)?')) return;
    try {
      setBusy('pause');
      const updated = await meService.pauseJob(localJob.uuid);
      setLocalJob((j) => ({ ...j, ...updated }));
    } catch {
      alert('Não foi possível pausar a vaga.');
    } finally {
      setBusy(null);
    }
  };

  const handleClose = async () => {
    if (status === 'closed') return;
    if (!confirm('Encerrar esta vaga? Esta ação é definitiva.')) return;
    try {
      setBusy('close');
      const updated = await meService.closeJob(localJob.uuid);
      setLocalJob((j) => ({ ...j, ...updated }));
    } catch {
      alert('Não foi possível encerrar a vaga.');
    } finally {
      setBusy(null);
    }
  };

  const handleEdit = () => {
    setBusy('edit');
    router.push(`/my/jobs/${localJob.uuid}/edit`);
  };

  return (
    <article className={styles.card} title={localJob.title}>
      <header className={styles.header}>
        <h3 className={styles.title}>{localJob.title}</h3>
        <span className={`${styles.badge} ${styles[`status_${status}` as const]}`}>
          {status === 'draft' ? 'Rascunho' : status === 'published' ? 'Publicada' : 'Encerrada'}
        </span>
      </header>

      <div className={styles.body}>
        <ul className={styles.kv}>
          <li>
            <span>Candidaturas</span>
            <strong>{localJob.totalApplications ?? 0}</strong>
          </li>
          <li>
            <span>Criada</span>
            <strong>{fmt(localJob.createdAt)}</strong>
          </li>
          <li>
            <span>Publicada</span>
            <strong>{fmt(localJob.publishedAt)}</strong>
          </li>
          <li>
            <span>Expira</span>
            <strong>{fmt(localJob.expiresAt)}</strong>
          </li>
        </ul>
      </div>

      <footer className={styles.footer}>
        <button
          type="button"
          className={`${styles.iconBtn} ${styles.primaryBtn}`}
          onClick={onView}
          title={ctaLabel}
          aria-label={ctaLabel}
        >
          <FiEye className={styles.icon} />
        </button>

        <button
          type="button"
          className={`${styles.iconBtn} ${styles.secondaryBtn}`}
          onClick={handleEdit}
          disabled={busy !== null}
          title="Editar"
          aria-label="Editar"
        >
          <FiEdit className={styles.icon} />
        </button>

        {status === 'draft' && (
          <button
            type="button"
            className={`${styles.iconBtn} ${styles.publishBtn}`}
            onClick={handlePublish}
            disabled={busy !== null}
            title="Publicar"
            aria-label="Publicar"
          >
            <FiSend className={styles.icon} />
          </button>
        )}

        {status === 'published' && (
          <button
            type="button"
            className={`${styles.iconBtn} ${styles.pauseBtn}`}
            onClick={handlePause}
            disabled={busy !== null}
            title="Pausar"
            aria-label="Pausar"
          >
            <FiPauseCircle className={styles.icon} />
          </button>
        )}

        {status !== 'closed' && (
          <button
            type="button"
            className={`${styles.iconBtn} ${styles.destructiveBtn}`}
            onClick={handleClose}
            disabled={busy !== null}
            title="Encerrar"
            aria-label="Encerrar"
          >
            <FiXCircle className={styles.icon} />
          </button>
        )}
      </footer>
    </article>
  );
}

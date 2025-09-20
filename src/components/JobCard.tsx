'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { JobPreviewDto } from '@/types';
import styles from '@/styles/JobCard.module.css';

type Props = { job: JobPreviewDto };

export default function JobCard({ job }: Props) {
  const router = useRouter();

  const handleApply = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const applyUrl = (job as any)?.applyUrl as string | undefined;
    if (applyUrl) {
      window.open(applyUrl, '_blank', 'noopener,noreferrer');
    } else {
      router.push(`/jobs/${job.uuid}#apply`);
    }
  };

  const companyName = job?.company?.name ?? 'Empresa';
  const location = (job as any)?.location ?? '—';
  const tags: string[] = (job as any)?.tags ?? (job as any)?.skills ?? [];

  return (
    <li className={styles.resultCard}>
      <Link href={`/jobs/${job.uuid}`} className={styles.cardLink} aria-label={`Abrir vaga ${job.title}`}>
        <div className={styles.cardContent}>
          <div className={styles.info}>
            <p className={styles.title}>
              <strong>{job.title}</strong>
            </p>
            <p className={styles.metaLine}>
              <span className={styles.company}>{companyName}</span>
              <span className={styles.dot}>•</span>
              <span className={styles.location}>{location}</span>
              {job.status && (
                <>
                  <span className={styles.dot}>•</span>
                  <span className={styles.status}>{job.status}</span>
                </>
              )}
            </p>

            {!!tags?.length && (
              <div className={styles.tags}>
                {tags.map((t, i) => (
                  <span key={`${t}-${i}`} className={styles.tag}>
                    {String(t).replace(/\s+/g, '_')}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className={styles.cardActions}>
            <button className={styles.applyButton} onClick={handleApply} type="button">
              Aplicar
            </button>
          </div>
        </div>
      </Link>
    </li>
  );
}

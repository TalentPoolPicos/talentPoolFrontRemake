'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import LoadingBrand from '@/components/LoadingBrand';
import { useAuth } from '@/hooks/useAuth';
import { meService } from '@/services/me';
import styles from '@/styles/JobEditor.module.css';
import type { CreateJobDto, UpdateJobContentDto } from '@/types';

type Mode = 'create' | 'edit';

type Props = {
  mode: Mode;
  jobUuid?: string;
  onClose?: () => void;
};

type JobDraft = {
  title: string;
  body: string;
  expiresAt: string;
};

const toLocalInputs = (iso?: string | null) => {
  if (!iso) return { date: '', time: '' };
  try {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const mi = pad(d.getMinutes());
    return { date: `${yyyy}-${mm}-${dd}`, time: `${hh}:${mi}` };
  } catch {
    return { date: '', time: '' };
  }
};

const toISOFromInputs = (date: string, time: string) => {
  if (!date) return '';
  const safeTime = time && /^\d{2}:\d{2}$/.test(time) ? time : '23:59';
  try {
    const [y, m, d] = date.split('-').map(Number);
    const [hh, mm] = safeTime.split(':').map(Number);
    const dt = new Date(y!, (m! - 1), d!, hh!, mm!, 59, 999);
    return dt.toISOString();
  } catch {
    return '';
  }
};

export default function JobEditor({ mode, jobUuid, onClose }: Props) {
  const router = useRouter();
  const { isBootstrapped, isLoggedIn, isEnterprise } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('<p></p>');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('23:59');

  const isEdit = mode === 'edit';

  useEffect(() => {
    if (!isEdit) { setLoading(false); return; }
    let mounted = true;

    (async () => {
      if (!jobUuid) { setError('Vaga inválida.'); setLoading(false); return; }
      setLoading(true); setError(null);
      try {
        const job = await meService.getMyJob(jobUuid);
        if (job.status !== 'draft') {
          setError('Somente vagas em rascunho podem ser editadas.');
        }
        setTitle(job.title ?? '');
        setBody(job.body ?? '<p></p>');
        const { date: d, time: t } = toLocalInputs(job.expiresAt ?? undefined);
        setDate(d);
        setTime(t || '23:59');
      } catch {
        setError('Não foi possível carregar a vaga para edição.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [isEdit, jobUuid]);

  useEffect(() => {
    if (!isBootstrapped) return;
    if (!isLoggedIn || !isEnterprise) {
      router.replace(`/signin?next=${encodeURIComponent(isEdit ? `/jobs/${jobUuid}/edit` : '/jobs/new')}`);
    }
  }, [isBootstrapped, isLoggedIn, isEnterprise, isEdit, jobUuid, router]);

  const isValid = useMemo(() => {
    const titleOk = title.trim().length >= 4 && title.trim().length <= 140;
    const bodyOk = body.trim().length > 0;
    const iso = toISOFromInputs(date, time);
    const expOk = !!iso && !Number.isNaN(new Date(iso).getTime());
    return titleOk && bodyOk && expOk;
  }, [title, body, date, time]);

  const payload: JobDraft = useMemo(() => ({
    title: title.trim(),
    body: body.trim(),
    expiresAt: toISOFromInputs(date, time),
  }), [title, body, date, time]);

  const onSubmit = useCallback(async () => {
    if (!isValid) return;
    setSaving(true); setError(null);
    try {
      if (isEdit && jobUuid) {
        const updated = await meService.updateJobContent(jobUuid, payload as UpdateJobContentDto);
        alert('Vaga atualizada com sucesso!');
        // Fechar o modal em vez de redirecionar
        if (onClose) onClose(); 
      } else {
        const created = await meService.createJob(payload as CreateJobDto);
        alert('Vaga criada com sucesso!');
        // Fechar o modal em vez de redirecionar
        if (onClose) onClose();
      }
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Falha ao salvar a vaga.');
    } finally {
      setSaving(false);
    }
  }, [isEdit, jobUuid, payload, isValid, router, onClose]);

  const onCancel = () => {
    if (onClose) return onClose();
    router.back();
  };

  return (
    <>
      <div className={styles.backdrop} onClick={onCancel} />
      <LoadingBrand loading={loading || (isBootstrapped && !isLoggedIn)}>
        <section
          className={styles.modal}
          role="dialog"
          aria-modal="true"
          aria-label={isEdit ? 'Editar vaga' : 'Nova vaga'}
          onClick={(e) => e.stopPropagation()}
        >
          <header className={styles.header}>
            <h1 className={styles.title}>{isEdit ? 'Editar vaga' : 'Nova vaga'}</h1>
            <button
              type="button"
              className={styles.closeBtn}
              aria-label="Fechar"
              title="Fechar"
              onClick={onCancel}
            >
              ×
            </button>
          </header>
          {error && <div className={styles.error}>{error}</div>}
          <div className={styles.content}>
            <form
              className={styles.form}
              onSubmit={(e) => { e.preventDefault(); void onSubmit(); }}
            >
              <div className={styles.field}>
                <label htmlFor="job-title">Título</label>
                <input
                  id="job-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex.: Desenvolvedor Frontend React"
                  required
                />
              </div>
              <div className={`${styles.field} ${styles.fullWidth}`}>
                <label htmlFor="job-body">Descrição (HTML)</label>
                <textarea
                  id="job-body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="<p>Estamos procurando um desenvolvedor Frontend...</p>"
                  rows={8}
                  required
                />
                <small className={styles.muted}>
                  Cole HTML (ex.: do seu editor rich text). No detalhe da vaga será renderizado como HTML.
                </small>
              </div>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label htmlFor="job-date">Data de expiração</label>
                  <input
                    id="job-date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="job-time">Hora</label>
                  <input
                    id="job-time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                </div>
              </div>
            </form>
          </div>
          <footer className={styles.footer}>
            <button type="button" className={styles.ghostBtn} onClick={onCancel}>
              Cancelar
            </button>
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={() => void onSubmit()}
              disabled={!isValid || saving}
              title={!isValid ? 'Preencha os campos corretamente' : (isEdit ? 'Salvar alterações' : 'Criar vaga')}
            >
              {saving ? 'Salvando…' : isEdit ? 'Salvar' : 'Criar'}
            </button>
          </footer>
        </section>
      </LoadingBrand>
    </>
  );
}

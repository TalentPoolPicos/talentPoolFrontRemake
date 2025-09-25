'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type React from 'react';
import { useRouter } from 'next/navigation';
import LoadingBrand from '@/components/LoadingBrand';
import { useAuth } from '@/hooks/useAuth';
import { meService } from '@/services/me';
import { markdownToHtml, htmlToMarkdown, sanitizeHtml, convertBulletsToHtml } from '@/helpers/markdown';
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
    return {
      date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
      time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
    };
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
  const [bodyMarkdown, setBodyMarkdown] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('23:59');

  const editorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      document.execCommand('defaultParagraphSeparator', false, 'p');
    } catch { }
  }, []);

  const createParagraph = (): HTMLParagraphElement => {
    const p = document.createElement('p');
    p.appendChild(document.createElement('br'));
    return p;
  };

  const setCaretToEnd = (el: HTMLElement) => {
    const sel = window.getSelection();
    if (!sel) return;
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
  };

  const setCaretIn = (el: HTMLElement) => {
    const sel = window.getSelection();
    if (!sel) return;
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
  };

  const closestBlock = (el: HTMLElement | null): HTMLElement | null => {
    while (el && editorRef.current && el !== editorRef.current) {
      if (el.matches('p, li, ul, ol')) return el;
      el = el.parentElement as HTMLElement | null;
    }
    return null;
  };

  const insertNewLineSmart = () => {
    const editor = editorRef.current;
    if (!editor) return;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const anchor = sel.anchorNode as Node | null;
    let el = anchor instanceof HTMLElement ? anchor : (anchor?.parentElement as HTMLElement | null) || null;
    el = closestBlock(el);
    if (el && el.tagName === 'LI') {
      const li = el as HTMLLIElement;
      const text = (li.textContent || '').replace(/\u200B/g, '').trim();
      if (text.length === 0) {
        const list = li.parentElement as HTMLOListElement | HTMLUListElement | null;
        const next = createParagraph();
        if (list) {
          list.parentElement?.insertBefore(next, list.nextSibling);
          li.remove();
          if (list.children.length === 0) list.remove();
          setCaretIn(next);
          const withLists = convertBulletsToHtml(editor.innerHTML);
          const safe = sanitizeHtml(withLists);
          setBodyMarkdown(htmlToMarkdown(safe));
          return;
        }
      } else {
        const newLi = document.createElement('li');
        newLi.appendChild(document.createElement('br'));
        li.parentElement?.insertBefore(newLi, li.nextSibling);
        setCaretIn(newLi);
        const withLists = convertBulletsToHtml(editor.innerHTML);
        const safe = sanitizeHtml(withLists);
        setBodyMarkdown(htmlToMarkdown(safe));
        return;
      }
    }
    const p = createParagraph();
    if (el) {
      el.parentElement?.insertBefore(p, el.nextSibling);
    } else {
      editor.appendChild(p);
    }
    setCaretIn(p);
    const withLists = convertBulletsToHtml(editor.innerHTML);
    const safe = sanitizeHtml(withLists);
    setBodyMarkdown(htmlToMarkdown(safe));
  };

  const tryStartBullet = () => {
    const editor = editorRef.current;
    if (!editor) return;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const anchor = sel.anchorNode as Node | null;
    let el = anchor instanceof HTMLElement ? anchor : (anchor?.parentElement as HTMLElement | null) || null;
    el = closestBlock(el);
    if (!el || el.tagName !== 'P') return;
    const text = el.textContent || '';
    if (!/^\s*-\s/.test(text)) return;
    const content = text.replace(/^\s*-\s/, '');
    const ul = document.createElement('ul');
    const li = document.createElement('li');
    if (content.length) {
      li.textContent = content;
    } else {
      li.appendChild(document.createElement('br'));
    }
    ul.appendChild(li);
    el.replaceWith(ul);
    setCaretToEnd(li);
    const withLists = convertBulletsToHtml(editor.innerHTML);
    const safe = sanitizeHtml(withLists);
    setBodyMarkdown(htmlToMarkdown(safe));
  };

  const isEdit = mode === 'edit';

  useEffect(() => {
    let mounted = true;

    const putInitialHtml = (html: string) => {
      requestAnimationFrame(() => {
        if (!mounted) return;
        if (editorRef.current) {
          editorRef.current.innerHTML = html || '';
          if (!html) {
            editorRef.current.appendChild(createParagraph());
          }
          setCaretToEnd(editorRef.current);
        }
      });
    };

    (async () => {
      if (!isEdit) {
        setLoading(false);
        putInitialHtml('');
        return;
      }
      if (!jobUuid) {
        setError('Vaga inválida.');
        setLoading(false);
        putInitialHtml('');
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const job = await meService.getMyJob(jobUuid);
        if (!mounted) return;
        if (job.status !== 'draft') {
          setError('Somente vagas em rascunho podem ser editadas.');
        }
        setTitle(job.title ?? '');
        const raw = job.body ?? '';
        let initialHtml: string;
        if (/<[a-z][\s\S]*>/i.test(raw)) {
          initialHtml = sanitizeHtml(raw);
          setBodyMarkdown(htmlToMarkdown(initialHtml));
        } else {
          initialHtml = sanitizeHtml(markdownToHtml(raw));
          setBodyMarkdown(raw.trim());
        }
        putInitialHtml(initialHtml);
        const { date: d, time: t } = toLocalInputs(job.expiresAt ?? undefined);
        setDate(d);
        setTime(t || '23:59');
      } catch {
        if (mounted) {
          setError('Não foi possível carregar a vaga para edição.');
          putInitialHtml('');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [isEdit, jobUuid]);

  useEffect(() => {
    if (!isBootstrapped) return;
    if (!isLoggedIn || !isEnterprise) {
      router.replace(
        `/signin?next=${encodeURIComponent(isEdit ? `/jobs/${jobUuid}/edit` : '/jobs/new')}`
      );
    }
  }, [isBootstrapped, isLoggedIn, isEnterprise, isEdit, jobUuid, router]);

  const syncFromEditor = useCallback((opts?: { noWrite?: boolean }) => {
    const el = editorRef.current;
    if (!el) return;
    if (el.innerHTML === '<br>') el.innerHTML = '';
    const withLists = convertBulletsToHtml(el.innerHTML);
    const safe = sanitizeHtml(withLists);
    if (!opts?.noWrite && safe !== el.innerHTML) {
      el.innerHTML = safe;
      setCaretToEnd(el);
    }
    setBodyMarkdown(htmlToMarkdown(safe));
  }, []);

  const focusEditor = () => {
    const el = editorRef.current;
    if (!el) return;
    el.focus();
  };

  const doCmd = (cmd: 'bold' | 'italic' | 'insertUnorderedList' | 'insertOrderedList' | 'insertHTML') => {
    focusEditor();
    try {
      document.execCommand(cmd, false);
    } catch (error) {
      console.warn('execCommand failed:', error);
    }
    syncFromEditor();
  };

  const toggleBold = () => doCmd('bold');
  const toggleItalic = () => doCmd('italic');
  const makeUList = () => doCmd('insertUnorderedList');
  const makeOList = () => doCmd('insertOrderedList');

  // Função para inserir link
  const insertLink = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const selectedText = selection.toString();
    let url = prompt('Digite a URL do link:', 'https://');

    if (!url) return;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    const linkText = selectedText || prompt('Digite o texto do link:', '') || url;

    if (selectedText) {
      try {
        document.execCommand('createLink', false, url);
        syncFromEditor();
      } catch {
        // Fallback manual
        const range = selection.getRangeAt(0);
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = linkText;

        range.deleteContents();
        range.insertNode(link);

        // Move cursor after link
        range.setStartAfter(link);
        range.setEndAfter(link);
        selection.removeAllRanges();
        selection.addRange(range);

        syncFromEditor();
      }
    } else {
      // Insert new link
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = linkText;

      const range = selection.getRangeAt(0);
      range.insertNode(link);

      // Move cursor after link
      range.setStartAfter(link);
      range.setEndAfter(link);
      selection.removeAllRanges();
      selection.addRange(range);

      syncFromEditor();
    }
  };

  // Função para limpar formatação
  const clearFormatting = () => {
    focusEditor();
    try {
      document.execCommand('removeFormat', false);
    } catch (error) {
      console.warn('removeFormat failed:', error);
    }
    syncFromEditor();
  };

  const onEditorKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const key = e.key.toLowerCase();

    // Permite undo/redo nativo
    if ((e.ctrlKey || e.metaKey) && (key === 'z' || key === 'y')) {
      return;
    }

    // Atalhos de formatação
    if ((e.ctrlKey || e.metaKey) && (key === 'b' || key === 'i')) {
      e.preventDefault();
      if (key === 'b') toggleBold();
      else if (key === 'i') toggleItalic();
      return;
    }

    // Atalho para link
    if ((e.ctrlKey || e.metaKey) && key === 'k') {
      e.preventDefault();
      insertLink();
      return;
    }

    // Enter inteligente
    if (key === 'enter' && !e.shiftKey) {
      e.preventDefault();
      insertNewLineSmart();
    }
  };

  const onEditorKeyUp = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === ' ' || e.key === '-' || e.key === 'Enter') {
      tryStartBullet();
    }
    syncFromEditor({ noWrite: true });
  };

  const onEditorPaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const html = e.clipboardData.getData('text/html');
    const text = e.clipboardData.getData('text/plain');
    const raw =
      html && /<[a-z][\s\S]*>/i.test(html)
        ? sanitizeHtml(convertBulletsToHtml(html))
        : `<p>${(text || '').replace(/\n{2,}/g, '</p><p>').replace(/\n/g, '<br>')}</p>`;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    const temp = document.createElement('div');
    temp.innerHTML = raw;
    const frag = document.createDocumentFragment();
    while (temp.firstChild) frag.appendChild(temp.firstChild);
    range.deleteContents();
    range.insertNode(frag);
    const editor = editorRef.current;
    if (editor) {
      setCaretToEnd(editor);
      syncFromEditor();
    }
  };

  const onEditorInput = () => {
    tryStartBullet();
    syncFromEditor({ noWrite: true });
  };

  const isValid = useMemo(() => {
    const titleOk = title.trim().length >= 4 && title.trim().length <= 140;
    const bodyOk = bodyMarkdown.trim().length > 0;
    const iso = toISOFromInputs(date, time);
    const expOk = !!iso && !Number.isNaN(new Date(iso).getTime());
    return titleOk && bodyOk && expOk;
  }, [title, bodyMarkdown, date, time]);

  const payload: JobDraft = useMemo(
    () => ({
      title: title.trim(),
      body: bodyMarkdown.trim(),
      expiresAt: toISOFromInputs(date, time),
    }),
    [title, bodyMarkdown, date, time]
  );

  const onSubmit = useCallback(async () => {
    if (!isValid) return;
    setSaving(true);
    setError(null);
    try {
      if (isEdit && jobUuid) {
        await meService.updateJobContent(jobUuid, payload as UpdateJobContentDto);
        alert('Vaga atualizada com sucesso!');
        onClose ? onClose() : router.back();
      } else {
        await meService.createJob(payload as CreateJobDto);
        alert('Vaga criada com sucesso!');
        onClose ? onClose() : router.back();
      }
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Falha ao salvar a vaga.');
    } finally {
      setSaving(false);
    }
  }, [isEdit, jobUuid, payload, isValid, onClose, router]);

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

          <div className={styles.contentScroll}>
            <div className={styles.content}>
              <form
                className={styles.form}
                onSubmit={(e) => {
                  e.preventDefault();
                  void onSubmit();
                }}
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
                  <div className={styles.editorHeader}>
                    <label htmlFor="job-body">Descrição (visual)</label>
                    <div className={styles.toolbar} role="group" aria-label="Ferramentas de formatação">
                      <button
                        type="button"
                        className={styles.tbBtn}
                        onClick={toggleBold}
                        title="Negrito (Ctrl+B)"
                        aria-label="Negrito"
                      >
                        <strong>B</strong>
                      </button>
                      <button
                        type="button"
                        className={styles.tbBtn}
                        onClick={toggleItalic}
                        title="Itálico (Ctrl+I)"
                        aria-label="Itálico"
                      >
                        <em>I</em>
                      </button>
                      <button
                        type="button"
                        className={styles.tbBtn}
                        onClick={insertLink}
                        title="Inserir link"
                        aria-label="Inserir link"
                      >
                        🔗
                      </button>
                      <span className={styles.tbSep} aria-hidden />
                      <button
                        type="button"
                        className={styles.tbBtn}
                        onClick={makeUList}
                        title="Lista com marcadores"
                        aria-label="Lista com marcadores"
                      >
                        • Lista
                      </button>
                      <button
                        type="button"
                        className={styles.tbBtn}
                        onClick={makeOList}
                        title="Lista numerada"
                        aria-label="Lista numerada"
                      >
                        1. Lista
                      </button>
                      <span className={styles.tbSep} aria-hidden />
                      <button
                        type="button"
                        className={styles.tbBtn}
                        onClick={clearFormatting}
                        title="Limpar formatação"
                        aria-label="Limpar formatação"
                      >
                        ✂️
                      </button>
                    </div>
                  </div>

                  <div
                    id="job-body"
                    ref={editorRef}
                    className={styles.editor}
                    contentEditable
                    role="textbox"
                    aria-multiline="true"
                    suppressContentEditableWarning
                    onInput={onEditorInput}
                    onKeyDown={onEditorKeyDown}
                    onKeyUp={onEditorKeyUp}
                    onPaste={onEditorPaste}
                  />

                  <small className={styles.muted}>
                    Use <strong>negrito</strong>, <em>itálico</em>, listas e links.
                    Atalhos: <kbd>Ctrl+B</kbd> (negrito), <kbd>Ctrl+I</kbd> (itálico), <kbd>Ctrl+K</kbd> (link).
                    O conteúdo será salvo como Markdown e renderizado na visualização.
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
              title={!isValid ? 'Preencha os campos corretamente' : isEdit ? 'Salvar alterações' : 'Criar vaga'}
            >
              {saving ? 'Salvando…' : isEdit ? 'Salvar' : 'Criar'}
            </button>
          </footer>
        </section>
      </LoadingBrand>
    </>
  );
}

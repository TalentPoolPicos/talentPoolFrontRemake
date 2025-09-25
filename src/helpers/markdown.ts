/**
 * Converte Markdown básico para HTML seguro
 */
export function markdownToHtml(md: string): string {
  if (!md) return '';

  let html = md;

  // Escapa caracteres HTML primeiro
  html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // Links [texto](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  // Negrito **texto**
  html = html.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');

  // Itálico _texto_
  html = html.replace(/_([^_\n]+)_/g, '<em>$1</em>');

  // Listas ordenadas
  html = html.replace(
    /(^|\n)(\d+\.\s+[^\n]+(?:\n\d+\.\s+[^\n]+)*)/g,
    (_match: string, lead: string, listContent: string) => {
      const items = listContent
        .split('\n')
        .map((line: string) => line.replace(/^\d+\.\s+/, '').trim())
        .filter((item: string) => item.length > 0);
      return `${lead}<ol>${items.map((item: string) => `<li>${item}</li>`).join('')}</ol>`;
    }
  );

  // Listas não ordenadas
  html = html.replace(
    /(^|\n)([-*]\s+[^\n]+(?:\n[-*]\s+[^\n]+)*)/g,
    (_match: string, lead: string, listContent: string) => {
      const items = listContent
        .split('\n')
        .map((line: string) => line.replace(/^[-*]\s+/, '').trim())
        .filter((item: string) => item.length > 0);
      return `${lead}<ul>${items.map((item: string) => `<li>${item}</li>`).join('')}</ul>`;
    }
  );

  // Converte duplas quebras em parágrafos
  const paragraphs = html
    .split(/\n{2,}/)
    .map((p: string) => p.trim())
    .filter((p: string) => p.length > 0);

  html = paragraphs
    .map((paragraph: string) => {
      // Quebras simples viram <br>
      const withBreaks = paragraph.replace(/\n/g, '<br>');
      // Não embrulha listas em parágrafos
      if (/^<(ul|ol)>/i.test(withBreaks)) return withBreaks;
      return `<p>${withBreaks}</p>`;
    })
    .join('');

  return html;
}

/**
 * Converte HTML para Markdown básico
 */
export function htmlToMarkdown(html: string): string {
  if (!html) return '';

  let markdown = html;

  // Remove quebras de linha
  markdown = markdown.replace(/<br\s*\/?>/gi, '\n');

  // Links
  markdown = markdown.replace(
    /<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi,
    (_match, href, text) => {
      const cleanText = String(text).replace(/<[^>]+>/g, '').trim();
      return cleanText ? `[${cleanText}](${href})` : href;
    }
  );

  // Listas não ordenadas
  markdown = markdown.replace(/<ul>\s*([\s\S]*?)\s*<\/ul>/gi, (_match: string, content: string) => {
    const items = content.match(/<li[\s\S]*?<\/li>/gi) || [];
    const listItems = items.map((item: string) =>
      `- ${item.replace(/<\/?li>/gi, '').replace(/\s+/g, ' ').trim()}`
    );
    return `${listItems.join('\n')}\n`;
  });

  // Listas ordenadas
  markdown = markdown.replace(/<ol>\s*([\s\S]*?)\s*<\/ol>/gi, (_match: string, content: string) => {
    const items = content.match(/<li[\s\S]*?<\/li>/gi) || [];
    const listItems = items.map((item: string, index: number) =>
      `${index + 1}. ${item.replace(/<\/?li>/gi, '').replace(/\s+/g, ' ').trim()}`
    );
    return `${listItems.join('\n')}\n`;
  });

  // Negrito
  markdown = markdown.replace(/<\/?(strong|b)>/gi, '**');

  // Itálico
  markdown = markdown.replace(/<\/?(em|i)>/gi, '_');

  // Parágrafos
  markdown = markdown.replace(/<\/p>\s*<p>/gi, '\n\n');
  markdown = markdown.replace(/<\/?p>/gi, '');

  // Remove outras tags HTML
  markdown = markdown.replace(/<[^>]+>/g, '');

  // Limpa espaços não quebráveis e múltiplas quebras
  markdown = markdown.replace(/\u00A0/g, ' ');
  markdown = markdown.replace(/\n{3,}/g, '\n\n');

  return markdown.trim();
}

/**
 * Sanitiza HTML mantendo apenas tags permitidas
 */
export function sanitizeHtml(html: string): string {
  if (typeof window === 'undefined') return html; // SSR safe

  const ALLOWED_TAGS = new Set(['P', 'BR', 'STRONG', 'B', 'EM', 'I', 'UL', 'OL', 'LI', 'A', '#text']);
  const ALLOWED_ATTRS: Record<string, Set<string>> = {
    A: new Set(['href', 'rel', 'target']),
  };

  const container = document.createElement('div');
  container.innerHTML = html;

  const walk = (node: Node): void => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement;

      if (!ALLOWED_TAGS.has(element.tagName)) {
        // Substitui tags não permitidas por texto
        const textNode = document.createTextNode(element.textContent ?? '');
        element.replaceWith(textNode);
        return;
      }

      // Remove atributos não permitidos
      [...element.attributes].forEach((attr: Attr) => {
        if (!ALLOWED_ATTRS[element.tagName]?.has(attr.name)) {
          element.removeAttribute(attr.name);
        }
      });

      // Regras especiais para links
      if (element.tagName === 'A') {
        const anchor = element as HTMLAnchorElement;
        const href = anchor.getAttribute('href') ?? '';

        try {
          const url = new URL(href, window.location.origin);
          if (!/^https?:$/.test(url.protocol)) {
            anchor.removeAttribute('href');
          }
        } catch {
          anchor.removeAttribute('href');
        }

        anchor.setAttribute('rel', 'noreferrer noopener');
        if (!anchor.getAttribute('target')) {
          anchor.setAttribute('target', '_blank');
        }
      }
    }

    // Processa filhos recursivamente
    [...node.childNodes].forEach((child: Node) => walk(child));
  };

  [...container.childNodes].forEach((node: Node) => walk(node));
  return container.innerHTML;
}

/**
 * Converte listas simples com traços em HTML <ul>
 */
export function convertBulletsToHtml(html: string): string {
  // Converte listas com - em elementos <ul><li>
  html = html.replace(
    /<p>(?:\s*-&nbsp;|\s*-\s)([^<]*)(?:<br\s*\/?>\s*(?:-&nbsp;|-\s)([^<]*))*<\/p>/gi,
    (match: string) => {
      const items: string[] = [];
      match.replace(/(?:-&nbsp;|-\s)([^<]*)/gi, (_subMatch: string, text: string) => {
        const cleanText = String(text).trim();
        if (cleanText) items.push(cleanText);
        return '';
      });
      return items.length
        ? `<ul>${items.map((item: string) => `<li>${item}</li>`).join('')}</ul>`
        : match;
    }
  );

  // Converte parágrafos simples com traço em listas
  html = html.replace(
    /<p>\s*(?:-&nbsp;|-\s)([^<]+)\s*<\/p>/gi,
    (_match: string, text: string) => `<ul><li>${String(text).trim()}</li></ul>`
  );

  return html;
}
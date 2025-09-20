'use client';

import React, { useEffect, useMemo, useState } from 'react';
import styles from '@/styles/CircleAvatar.module.css';

type Props = {
  avatarUrl?: string | null;
  username?: string | null;
  src?: string;
  alt?: string | null;
  width?: number | null;
  height?: number | null;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  treatDefaultAsEmpty?: boolean;
};

function isDefaultIcon(url?: string | null) {
  return !!url && /(robohash\.org|api\.dicebear\.com|ui-avatars\.com)/i.test(url);
}

function isSignedUrl(url?: string | null) {
  return !!url && /(X-Amz-Algorithm=|X-Amz-Signature=|X-Amz-Credential=|token=)/i.test(url!);
}

function withBust(url: string) {
  if (!url) return url;
  return isSignedUrl(url) ? url : `${url}${url.includes('?') ? '&' : '?'}v=${Date.now()}`;
}

function robo(username?: string | null) {
  return `https://robohash.org/${encodeURIComponent(username ?? 'default')}?set=set2&size=72x72`;
}

export default function CircleAvatar({
  avatarUrl,
  username,
  src,
  alt = 'Avatar',
  width = 44,
  height = 44,
  onClick,
  treatDefaultAsEmpty = true,
}: Props) {
  const sizeStyle = { width: `${width ?? 44}px`, height: `${height ?? 44}px` };

  const initialSrc = useMemo(() => {
    if (src && src.trim() !== '') return withBust(src.trim());

    const sanitized = (avatarUrl ?? '').trim();
    if (sanitized && (!treatDefaultAsEmpty || !isDefaultIcon(sanitized))) {
      return withBust(sanitized);
    }

    return robo(username ?? undefined);
  }, [src, avatarUrl, username, treatDefaultAsEmpty]);

  const [currentSrc, setCurrentSrc] = useState(initialSrc);

  useEffect(() => {
    setCurrentSrc(initialSrc);
  }, [initialSrc]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      (e.currentTarget as HTMLDivElement).click();
    }
  };

  return (
    <div
      className={styles.circleAvatar}
      style={sizeStyle}
      tabIndex={0}
      role="button"
      onClick={onClick}
      onKeyDown={handleKeyDown}
      aria-label={alt ?? 'Avatar'}
    >
      <img
        src={currentSrc}
        alt={alt ?? 'Avatar'}
        className={styles.img}
        loading="lazy"
        decoding="async"
        draggable={false}
        onError={() => setCurrentSrc(robo(username ?? undefined))}
      />
    </div>
  );
}

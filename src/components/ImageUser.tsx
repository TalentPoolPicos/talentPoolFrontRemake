'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import CircleAvatar from '@/components/CircleAvatar';
import { useAuth } from '@/hooks/useAuth';
import { meService } from '@/services/me';
import styles from '@/styles/ImageUser.module.css';

type MinimalUser = {
  uuid: string;
  username?: string | null;
  role: 'student' | 'enterprise' | 'admin';
  avatarUrl?: string | null;
  bannerUrl?: string | null;
};

function isSignedUrl(url?: string | null) {
  return !!url && /(X-Amz-Algorithm=|X-Amz-Signature=|X-Amz-Credential=|token=)/i.test(url);
}
function withBust(url?: string | null) {
  if (!url) return url ?? '';
  return isSignedUrl(url) ? url : `${url}${url.includes('?') ? '&' : '?'}v=${Date.now()}`;
}

const robo = (u?: string | null) =>
  `https://robohash.org/${encodeURIComponent(u ?? 'default')}?set=set2&size=150x150`;

export default function ImageUser({
  user,
  editable = false,
}: {
  user?: MinimalUser | null;
  editable?: boolean;
}) {
  const { user: logged } = useAuth();

  const displayUser = useMemo<MinimalUser | null>(
    () => (user ?? ((logged as unknown) as MinimalUser) ?? null),
    [user, logged]
  );

  const canEdit =
    editable === true && !!displayUser?.uuid && displayUser.uuid === (logged as any)?.uuid;

  const [avatarLocal, setAvatarLocal] = useState<string | null>(null);
  const [bannerLocal, setBannerLocal] = useState<string | null>(null);

  const [hoverAvatar, setHoverAvatar] = useState(false);
  const [hoverBanner, setHoverBanner] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [offsetX, setOffsetX] = useState(0);

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const bounds = useRef({ min: 0, max: 0 });
  const start = useRef({ x: 0, offset: 0 });

  const resolveImgRef = useCallback(() => {
    const wrap = wrapperRef.current;
    if (!wrap) return;
    const inner = wrap.querySelector('img');
    if (inner) imgRef.current = inner as HTMLImageElement;
  }, []);

  const calcBounds = useCallback(() => {
    const img = imgRef.current;
    const wrap = wrapperRef.current;
    if (!img || !wrap) return;
    const extra = img.clientWidth - wrap.clientWidth;
    bounds.current.min = -Math.max(0, extra);
    bounds.current.max = 0;
    setOffsetX((prev) => Math.max(Math.min(prev, bounds.current.max), bounds.current.min));
  }, []);

  useEffect(() => {
    resolveImgRef();
    calcBounds();
    const onResize = () => calcBounds();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [resolveImgRef, calcBounds]);

  useEffect(() => {
    resolveImgRef();
    calcBounds();
  }, [displayUser?.bannerUrl, bannerLocal, resolveImgRef, calcBounds]);

  const onDown = (e: React.MouseEvent) => {
    if (!canEdit) return;
    setDragging(true);
    start.current.x = e.clientX;
    start.current.offset = offsetX;
    window.addEventListener('mousemove', onMove as any);
    window.addEventListener('mouseup', onUp as any);
  };
  const onMove = (e: MouseEvent) => {
    if (!dragging) return;
    const delta = e.clientX - start.current.x;
    const next = Math.max(
      Math.min(start.current.offset + delta, bounds.current.max),
      bounds.current.min
    );
    setOffsetX(next);
  };
  const onUp = () => {
    setDragging(false);
    window.removeEventListener('mousemove', onMove as any);
    window.removeEventListener('mouseup', onUp as any);
  };

  const openPicker = async (cb: (file: File) => Promise<void>) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e: any) => {
      const file = e.target?.files?.[0];
      if (file) {
        try {
          await cb(file);
          setOffsetX(0);
          requestAnimationFrame(() => {
            resolveImgRef();
            calcBounds();
          });
        } catch {
          alert('Erro ao enviar imagem.');
        }
      }
    };
    input.click();
  };

  const uploadProfilePicture = () =>
    canEdit &&
    openPicker(async (file) => {
      const res = await meService.uploadAvatar(file);
      setAvatarLocal(withBust(res.avatarUrl));
    });

  const uploadBannerPicture = () =>
    canEdit &&
    openPicker(async (file) => {
      const res = await meService.uploadBanner(file);
      setBannerLocal(withBust(res.bannerUrl));
    });

  const avatarSrc =
    avatarLocal ?? displayUser?.avatarUrl ?? (displayUser?.username ? robo(displayUser.username) : undefined);

  const bannerSrc = bannerLocal ?? displayUser?.bannerUrl ?? '/banner.png';

  return (
    <div className={styles.bannerContainer}>
      <div
        className={styles.bannerWrapper}
        ref={wrapperRef}
        onMouseEnter={() => setHoverBanner(true)}
        onMouseLeave={() => setHoverBanner(false)}
        onMouseDown={onDown}
        onDoubleClick={uploadBannerPicture}
        style={{ cursor: canEdit ? (dragging ? 'grabbing' : 'grab') : 'default' }}
        aria-label="Banner do usuário"
      >
        <Image
          src={bannerSrc}
          alt=""
          fill
          priority={false}
          className={styles.bannerImg}
          sizes="(max-width: 768px) 100vw, 1200px"
          draggable={false}
          onLoad={calcBounds}
          onLoadingComplete={() => {
            resolveImgRef();
            calcBounds();
          }}
          style={{ transform: `translateX(${offsetX}px)` }}
        />
        {canEdit && hoverBanner && !dragging && (
          <div className={styles.overlayBanner}>Duplo clique para trocar</div>
        )}
      </div>

      <div
        className={styles.avatarWrapper}
        onMouseEnter={() => setHoverAvatar(true)}
        onMouseLeave={() => setHoverAvatar(false)}
        onClick={uploadProfilePicture}
        style={{ cursor: canEdit ? 'pointer' : 'default' }}
        aria-label="Foto de perfil"
      >
        <CircleAvatar
          avatarUrl={avatarSrc ?? undefined}
          username={displayUser?.username ?? undefined}
          width={150}
          height={150}
          alt={displayUser?.username ?? 'Avatar'}
          treatDefaultAsEmpty
        />
        {canEdit && hoverAvatar && (
          <div className={styles.overlayAvatar}>Editar foto de perfil</div>
        )}
      </div>
    </div>
  );
}

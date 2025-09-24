'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  useMemo, useState, useCallback, useEffect, useRef, useLayoutEffect
} from 'react';
import { path } from '@/lib/path';
import { useAuth } from '@/hooks/useAuth';
import CircleAvatar from '@/components/CircleAvatar';
import ThemeToggle from '@/components/ThemeToggle';
import SearchBar from '@/components/SearchBar';
import styles from '@/styles/NavigatorBar.module.css';

import { meService } from '@/services/me';
import { FiInbox, FiBell } from 'react-icons/fi';

function pickUrl(...vals: Array<string | null | undefined>) {
  const v = vals.find((x) => !!x && String(x).trim() !== '');
  return v ?? undefined;
}

export default function NavigatorBar() {
  const router = useRouter();
  const pathname = usePathname() ?? '/';
  const {
    isLoggedIn,
    user: loggedUser,
    isBootstrapped,
    logout,
    isStudent = false,
    isEnterprise = false,
  } = useAuth();

  const headerRef = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;

    const setNavHeight = () => {
      const h = headerRef.current?.offsetHeight ?? 0;
      document.documentElement.style.setProperty('--nav-h', `${h}px`);
    };

    setNavHeight();

    window.addEventListener('resize', setNavHeight);

    const ro = headerRef.current ? new ResizeObserver(setNavHeight) : null;
    if (headerRef.current && ro) ro.observe(headerRef.current);

    return () => {
      window.removeEventListener('resize', setNavHeight);
      ro?.disconnect();
    };
  }, []);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [unreadCount, setUnreadCount] = useState<number | null>(null);

  type MiniNotification = {
    id: number;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    createdAt: string;
  };

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [miniNotifications, setMiniNotifications] = useState<MiniNotification[]>([]);
  const [miniLoading, setMiniLoading] = useState(false);

  const notifMenuRootRef = useRef<HTMLDivElement | null>(null);

  const currentPath = useMemo(() => pathname, [pathname]);

  // Atualiza badge de não lidas (poll + uso direto)
  const fetchUnreadCount = useCallback(async () => {
    if (!isLoggedIn) {
      setUnreadCount(0);
      return;
    }
    try {
      const { unreadCount: count } = await meService.getUnreadNotificationsCount();
      setUnreadCount(count);
    } catch (err) {
      console.error('Erro ao buscar notificações não lidas', err);
      setUnreadCount(0);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 60000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  useEffect(() => setIsUserMenuOpen(false), [pathname]);

  const userMenuRootRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (isUserMenuOpen && userMenuRootRef.current && !userMenuRootRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (isNotifOpen && notifMenuRootRef.current && !notifMenuRootRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsUserMenuOpen(false);
        setIsMenuOpen(false);
        setIsNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, [isUserMenuOpen, isNotifOpen]);

  // Busca SOMENTE não lidas (mais recentes) para o dropdown e atualiza badge imediatamente
  const fetchMiniNotifications = useCallback(async () => {
    if (!isLoggedIn) {
      setMiniNotifications([]);
      setUnreadCount(0);
      return;
    }
    setMiniLoading(true);
    try {
      const resp = await meService.getMyNotifications({ page: 1, limit: 5, unreadOnly: true });
      const items = (resp?.notifications?.notifications ?? [])
        .filter((n: MiniNotification) => !n.isRead)
        .sort((a: MiniNotification, b: MiniNotification) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

      setMiniNotifications(items);
      // Atualiza a badge com a contagem vinda da API (fallback para total/pagination/length)
      const apiUnread = typeof resp?.unreadCount === 'number' ? resp.unreadCount
        : typeof resp?.pagination?.total === 'number' ? resp.pagination.total
        : items.length;
      setUnreadCount(apiUnread);
    } catch (err) {
      console.error('Erro ao buscar resumo de notificações', err);
      setMiniNotifications([]);
      // fallback para manter coerência
      await fetchUnreadCount();
    } finally {
      setMiniLoading(false);
    }
  }, [isLoggedIn, fetchUnreadCount]);

  const toggleNotifMenu = async () => {
    const next = !isNotifOpen;
    setIsNotifOpen(next);
    if (next) {
      await fetchMiniNotifications();
    }
  };

  const openMobileMenu = () => setIsMenuOpen(true);
  const closeMobileMenu = () => setIsMenuOpen(false);

  const search = useCallback((termArg?: string) => {
    const term = (termArg ?? searchTerm).trim();
    if (!term) return;
    const url = path.search(term);
    if (currentPath.startsWith('/search')) router.replace(url);
    else router.push(url);
    setSearchTerm('');
    setIsMenuOpen(false);
  }, [searchTerm, currentPath, router]);

  const closeAllMenus = useCallback(() => {
    setIsUserMenuOpen(false);
    setIsMenuOpen(false);
    setIsNotifOpen(false);
  }, []);

  const doLogout = useCallback(async () => {
    try {
      await logout();
    } finally {
      closeAllMenus();
      router.push(path.home());
      router.refresh();
    }
  }, [logout, router, closeAllMenus]);

  const isActive = (p: string, mode: 'equal' | 'startsWith' = 'equal') =>
    mode === 'equal' ? currentPath === p : currentPath.startsWith(p);

  const IconUser = () => (
    <span className={styles.menuIcon} aria-hidden>
      <svg viewBox="0 0 24 24" fill="none"><path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-5 0-9 2.5-9 5v1h18v-1c0-2.5-4-5-9-5Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </span>
  );
  const IconClipboard = () => (
    <span className={styles.menuIcon} aria-hidden>
      <svg viewBox="0 0 24 24" fill="none"><path d="M9 4h6a2 2 0 0 1 2 2v1h1a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1V6a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.6" /><path d="M9 6h6v2H9z" stroke="currentColor" strokeWidth="1.6" /></svg>
    </span>
  );
  const IconLogout = () => (
    <span className={styles.menuIcon} aria-hidden>
      <svg viewBox="0 0 24 24" fill="none"><path d="M9 21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </span>
  );

  const DesktopUserMenu = () => {
    if (!isBootstrapped) return <div style={{ width: 36, height: 36 }} aria-hidden />;

    if (!isLoggedIn) {
      return (
        <Link href={path.signin()} className={styles.btnOutline}>
          Entrar
        </Link>
      );
    }

    return (
      <div className={styles.userDropdown} ref={userMenuRootRef}>
        <button
          className={styles.userTrigger}
          aria-haspopup="menu"
          aria-expanded={isUserMenuOpen}
          aria-controls="user-menu"
          onClick={() => setIsUserMenuOpen((v) => !v)}
          type="button"
        >
          <CircleAvatar
            avatarUrl={pickUrl(loggedUser?.profilePicture, (loggedUser as any)?.avatarUrl)}
            username={loggedUser?.username}
            alt={loggedUser?.username ?? 'Avatar'}
            treatDefaultAsEmpty
          />
        </button>

        <div
          id="user-menu"
          role="menu"
          aria-label="Menu do usuário"
          className={styles.dropdownMenu}
          data-open={isUserMenuOpen || undefined}
          onKeyDown={(e) => e.key === 'Escape' && setIsUserMenuOpen(false)}
        >
          <Link
            role="menuitem"
            href={path.profile()}
            className={styles.dropdownItem}
            onClick={closeAllMenus}
          >
            <IconUser /> Perfil
          </Link>

          {isStudent && (
            <Link
              role="menuitem"
              href={path.applications()}
              className={styles.dropdownItem}
              onClick={closeAllMenus}
            >
              <IconClipboard /> Minhas candidaturas
            </Link>
          )}

          {isEnterprise && (
            <Link
              role="menuitem"
              href={path.companyJobs()}
              className={styles.dropdownItem}
              onClick={closeAllMenus}
            >
              <IconClipboard /> Minhas vagas
            </Link>
          )}

          <button
            role="menuitem"
            className={`${styles.dropdownItem} ${styles.menuItemDestructive}`}
            onClick={() => void doLogout()}
            type="button"
          >
            <IconLogout /> Sair
          </button>
        </div>
      </div>
    );
  };

  return (
    <header ref={headerRef} className={styles.navBar}>
      <div className={styles.navBarContainer}>
        <Link href={path.home()} className={styles.logoLink}>
          <div className={styles.brand} aria-label="Banco de Talentos">
            <span className={styles.small}>Banco&nbsp;de</span>
            <span className={styles.strong}>Talentos</span>
          </div>
        </Link>

        <nav className={styles.links} aria-label="primary">
          <Link href={path.home()} data-active={isActive(path.home()) || undefined}>Início</Link>
          <Link href={path.about()} data-active={isActive(path.about(), 'startsWith') || undefined}>Sobre</Link>
          <Link href={path.news()} data-active={isActive(path.news(), 'startsWith') || undefined}>Notícias</Link>
        </nav>

        <div className={styles.rightTools}>
          <SearchBar
            variant="desktop"
            placeholder="Pesquisar"
            value={searchTerm}
            onChange={setSearchTerm}
            onSearch={(t) => search(t)}
            ariaLabel="Pesquisar"
          />

          {isLoggedIn && (
            <div className={styles.notificationsRoot} ref={notifMenuRootRef}>
              <button
                className={styles.notificationsBtn}
                title="Notificações"
                aria-label="Notificações"
                aria-haspopup="menu"
                aria-expanded={isNotifOpen}
                onClick={toggleNotifMenu}
                type="button"
              >
                <FiBell />
                {unreadCount !== null && unreadCount > 0 && (
                  <span className={styles.unreadBadge}>{unreadCount > 99 ? '99+' : unreadCount}</span>
                )}
              </button>

              <div
                role="menu"
                aria-label="Resumo de notificações"
                className={styles.notificationsDropdown}
                data-open={isNotifOpen || undefined}
              >
                <div className={styles.notificationsDropdownHeader}>
                  <strong>Notificações</strong>
                  <Link href={path.notifications()} className={styles.viewMoreLink} onClick={() => setIsNotifOpen(false)}>
                    Ver mais
                  </Link>
                </div>

                <div className={styles.notificationsDropdownBody}>
                  {miniLoading ? (
                    <div className={styles.notificationsDropdownEmpty}>Carregando…</div>
                  ) : miniNotifications.length === 0 ? (
                    <div className={styles.notificationsDropdownEmpty}>
                      <FiInbox />
                      <span>Nenhuma notificação</span>
                    </div>
                  ) : (
                    <ul className={styles.notificationsDropdownList} role="list">
                      {miniNotifications.slice(0, 5).map((n) => (
                        <li key={n.id} className={styles.notificationsDropdownItem}>
                          <div className={styles.notificationsDropdownItemMain}>
                            <strong className={styles.notificationsDropdownItemTitle}>{n.title}</strong>
                            <span className={styles.notificationsDropdownItemMsg}>{n.message}</span>
                          </div>
                          <small className={styles.notificationsDropdownItemDate}>
                            {new Date(n.createdAt).toLocaleString()}
                          </small>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}

          <ThemeToggle />

          <DesktopUserMenu />

          <button
            className={styles.mobileMenuToggle}
            aria-label="Abrir menu de navegação"
            onClick={openMobileMenu}
            type="button"
          >
            &#9776;
          </button>
        </div>
      </div>

      <div
        className={styles.mobileMenu}
        data-open={isMenuOpen || undefined}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-menu-title"
        onClick={closeMobileMenu}
      >
        <div className={styles.mobileMenuContent} onClick={(e) => e.stopPropagation()}>
          <div className={styles.mobileMenuHeader}>
            <h2 id="mobile-menu-title" style={{ margin: 0, fontSize: '1.25rem' }}>Menu</h2>
            <button
              className={styles.mobileMenuClose}
              onClick={closeMobileMenu}
              aria-label="Fechar menu"
              type="button"
            >
              ✕
            </button>
          </div>

          {isMenuOpen && (
            <SearchBar
              variant="mobile"
              autoFocus
              placeholder="Pesquisar"
              value={searchTerm}
              onChange={setSearchTerm}
              onSearch={(t) => search(t)}
              ariaLabel="Pesquisar"
            />
          )}

          <nav className={styles.mobileMenuLinks} role="navigation">
            <Link href={path.home()} data-active={isActive(path.home()) || undefined} onClick={closeMobileMenu}>Início</Link>
            <Link href={path.about()} data-active={isActive(path.about(), 'startsWith') || undefined} onClick={closeMobileMenu}>Sobre</Link>
            <Link href={path.news()} data-active={isActive(path.news(), 'startsWith') || undefined} onClick={closeMobileMenu}>Notícias</Link>
            {isLoggedIn && (
              <Link href={path.notifications()} data-active={isActive(path.notifications(), 'startsWith') || undefined} onClick={closeMobileMenu} className={styles.mobileAuthLink}>
                <FiBell /> Notificações
                {unreadCount !== null && unreadCount > 0 && (
                  <span className={styles.unreadBadge}>{unreadCount > 99 ? '99+' : unreadCount}</span>
                )}
              </Link>
            )}

            <div style={{ borderTop: '1px solid var(--color-border)', margin: '.5rem 0' }} />

            {!isBootstrapped ? null : !isLoggedIn ? (
              <Link href={path.signin()} onClick={closeMobileMenu} className={styles.mobileAuthLink}>
                Entrar
              </Link>
            ) : (
              <>
                <Link href={path.profile()} onClick={closeMobileMenu} className={styles.mobileAuthLink}>
                  <IconUser /> Perfil
                </Link>

                {isStudent && (
                  <Link href={path.applications()} onClick={closeMobileMenu} className={styles.mobileAuthLink}>
                    <IconClipboard /> Minhas candidaturas
                  </Link>
                )}

                {isEnterprise && (
                  <Link href={path.companyJobs()} onClick={closeMobileMenu} className={styles.mobileAuthLink}>
                    <IconClipboard /> Minhas vagas
                  </Link>
                )}
                
                <button onClick={() => void doLogout()} className={`${styles.mobileAuthLink} ${styles.menuItemDestructive}`} type="button">
                  <IconLogout /> Sair
                </button>
              </>
            )}
          </nav>

          <div className={styles.mobileMenuFooter}>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}

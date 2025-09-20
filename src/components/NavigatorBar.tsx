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

export default function NavigatorBar() {
  const router = useRouter();
  const pathname = usePathname() ?? '/';
  const { isLoggedIn, user: loggedUser, isBootstrapped, logout } = useAuth();

  // === medir altura do header e escrever em --nav-h
  const headerRef = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;

    const setNavHeight = () => {
      const h = headerRef.current?.offsetHeight ?? 0;
      document.documentElement.style.setProperty('--nav-h', `${h}px`);
    };

    setNavHeight();

    // Atualiza em resize de janela
    window.addEventListener('resize', setNavHeight);

    // Atualiza quando o próprio header muda de tamanho (menu abre, login muda, etc.)
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

  const currentPath = useMemo(() => pathname, [pathname]);

  useEffect(() => setIsUserMenuOpen(false), [pathname]);

  const userMenuRootRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!isUserMenuOpen) return;
      if (!userMenuRootRef.current) return;
      if (!userMenuRootRef.current.contains(e.target as Node)) setIsUserMenuOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsUserMenuOpen(false);
        setIsMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, [isUserMenuOpen]);

  useEffect(() => {
    if (isMenuOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen]);

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

  const gotoProfile = useCallback(() => { router.push(path.profile()); }, [router]);
  const gotoApplications = useCallback(() => { router.push('/applications'); }, [router]);

  const doLogout = useCallback(async () => {
    try {
      await logout();
    } finally {
      setIsUserMenuOpen(false);
      router.push(path.home());
      router.refresh();
    }
  }, [logout, router]);

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

  const AuthSlot = () => {
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
            avatarUrl={loggedUser?.profilePicture ?? (loggedUser as any)?.avatarUrl ?? null}
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
          <button
            role="menuitem"
            className={styles.dropdownItem}
            onClick={() => { setIsUserMenuOpen(false); gotoProfile(); }}
          >
            <IconUser /> Perfil
          </button>

          <button
            role="menuitem"
            className={styles.dropdownItem}
            onClick={() => { setIsUserMenuOpen(false); gotoApplications(); }}
          >
            <IconClipboard /> Minhas candidaturas
          </button>

          <button
            role="menuitem"
            className={`${styles.dropdownItem} ${styles.menuItemDestructive}`}
            onClick={() => void doLogout()}
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
        <div className={styles.brand} aria-label="Banco de Talentos">
          <span className={styles.small}>Banco&nbsp;de</span>
          <span className={styles.strong}>Talentos</span>
        </div>

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

          <ThemeToggle />

          <AuthSlot />

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
          </nav>

          <div className={styles.mobileMenuFooter}>
            <AuthSlot />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}

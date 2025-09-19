'use client';

import { useMemo, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import styles from '@/styles/Tabs.module.css';

export type TabKey = 'users' | 'companies' | 'jobs';

type Tab = {
  key: TabKey;
  label: string;
  count?: number;
  disabled?: boolean;
};

type Props = {
  tabs: Tab[];
  active?: TabKey;
  onChange?: (k: TabKey) => void;
  shallow?: boolean;
  queryParam?: string;
};

export default function Tabs({
  tabs,
  active,
  onChange,
  shallow = true,
  queryParam = 'tab',
}: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlTab = (searchParams?.get(queryParam) as TabKey | null) ?? null;

  const resolvedActive = useMemo<TabKey>(() => {
    if (active) return active;
    const candidate = tabs.find(t => t.key === urlTab);
    if (candidate) return candidate.key;
    return tabs[0]?.key ?? 'users';
  }, [active, tabs, urlTab]);

  const onSelect = useCallback(
    (k: TabKey) => {
      onChange?.(k);
      const sp = new URLSearchParams(searchParams ?? undefined);
      sp.set(queryParam, k);
      router.push(`${pathname}?${sp.toString()}`, { scroll: false });
    },
    [onChange, searchParams, router, pathname, queryParam]
  );

  return (
    <div className={styles.tabs}>
      <div className={styles.tabList} role="tablist" aria-label="Resultados da pesquisa">
        {tabs.map((t) => {
          const isActive = t.key === resolvedActive;
          const hasResults = (t.count ?? 0) > 0;
          const isDisabled = t.disabled || !hasResults;

          const href = (() => {
            const sp = new URLSearchParams(searchParams ?? undefined);
            sp.set(queryParam, t.key);
            return `${pathname}?${sp.toString()}`;
          })();

          return (
            <Link
              key={t.key}
              href={href}
              onClick={(e) => {
                if (isDisabled) {
                  e.preventDefault();
                  return;
                }
                if (shallow) {
                  e.preventDefault();
                  onSelect(t.key);
                }
              }}
              role="tab"
              aria-selected={isActive}
              aria-disabled={isDisabled}
              className={`${styles.tab} ${isActive ? styles.active : ''} ${isDisabled ? styles.disabled : ''}`}
            >
              {t.label}{typeof t.count === 'number' ? ` (${t.count})` : ''}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

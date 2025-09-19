'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import Image from 'next/image';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import LoadingBrand from '@/components/LoadingBrand';
import UserCard from '@/components/UserCard';
import JobCard from '@/components/JobCard';
import Tabs, { TabKey } from '@/components/Tabs';
import { searchService } from '@/services/search';
import styles from '@/styles/Search.module.css';
import type { JobPreviewDto, UserPreviewResponseDto } from '@/types';

const ROLE_STUDENT = 'student' as const;
const ROLE_ENTERPRISE = 'enterprise' as const;

type Bucket<T> = { items: T[]; total: number };
type UiResults = {
  usersPeople: Bucket<UserPreviewResponseDto>;
  usersCompanies: Bucket<UserPreviewResponseDto>;
  jobs: Bucket<JobPreviewDto>;
};

const pageSize = 20;

const pick = (...vals: Array<string | null | undefined>) =>
  vals.find((x) => !!x && String(x).trim() !== '') ?? null;

const normalizeUser = (u: any): UserPreviewResponseDto => ({
  ...u,
  avatarUrl: pick(u.avatarUrl, u.profilePicture, u.avatar_url),
  bannerUrl: pick(u.bannerUrl, u.banner_url, u.bannerURL),
});

export default function SearchPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const qParam = (searchParams.get('q') ?? '').trim();
  const tabParam = searchParams.get('tab') as TabKey | null;

  const [query, setQuery] = useState(qParam);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('jobs');

  const [pageUsers, setPageUsers] = useState(1);
  const [pageCompanies, setPageCompanies] = useState(1);
  const [pageJobs, setPageJobs] = useState(1);

  const [results, setResults] = useState<UiResults>({
    usersPeople: { items: [], total: 0 },
    usersCompanies: { items: [], total: 0 },
    jobs: { items: [], total: 0 },
  });

  const pages = useMemo(
    () => ({
      users: Math.max(1, Math.ceil(results.usersPeople.total / pageSize)),
      companies: Math.max(1, Math.ceil(results.usersCompanies.total / pageSize)),
      jobs: Math.max(1, Math.ceil(results.jobs.total / pageSize)),
    }),
    [results]
  );

  const tabCounts = {
    users: results.usersPeople.total,
    companies: results.usersCompanies.total,
    jobs: results.jobs.total,
  };

  const baseTabs: Array<{ key: TabKey; label: string; count: number }> = [
    { key: 'users', label: 'Usuários', count: tabCounts.users },
    { key: 'companies', label: 'Empresas', count: tabCounts.companies },
    { key: 'jobs', label: 'Vagas', count: tabCounts.jobs },
  ];
  const availableTabs = baseTabs.filter((t) => t.count > 0);

  const fetchAll = useCallback(async (term: string) => {
    if (!term) {
      setResults({
        usersPeople: { items: [], total: 0 },
        usersCompanies: { items: [], total: 0 },
        jobs: { items: [], total: 0 },
      });
      return;
    }

    setLoading(true);
    try {
      const [people, companies, jobs] = await Promise.all([
        searchService.users({
          q: term,
          role: ROLE_STUDENT,
          limit: pageSize,
          offset: (pageUsers - 1) * pageSize,
        }),
        searchService.users({
          q: term,
          role: ROLE_ENTERPRISE,
          limit: pageSize,
          offset: (pageCompanies - 1) * pageSize,
        }),
        searchService.jobs({
          q: term,
          limit: pageSize,
          offset: (pageJobs - 1) * pageSize,
        }),
      ]);

      setResults({
        usersPeople: { items: (people.hits ?? []).map(normalizeUser), total: people.total ?? 0 },
        usersCompanies: { items: (companies.hits ?? []).map(normalizeUser), total: companies.total ?? 0 },
        jobs: { items: jobs.hits ?? [], total: jobs.total ?? 0 },
      });
    } catch {
      setResults({
        usersPeople: { items: [], total: 0 },
        usersCompanies: { items: [], total: 0 },
        jobs: { items: [], total: 0 },
      });
    } finally {
      setLoading(false);
    }
  }, [pageUsers, pageCompanies, pageJobs]);

  const fetchOne = useCallback(async (tab: TabKey, page: number) => {
    if (!query) return;

    try {
      if (tab === 'users') {
        const r = await searchService.users({
          q: query,
          role: ROLE_STUDENT,
          limit: pageSize,
          offset: (page - 1) * pageSize,
        });
        setResults((prev) => ({
          ...prev,
          usersPeople: { items: (r.hits ?? []).map(normalizeUser), total: r.total ?? 0 },
        }));
      } else if (tab === 'companies') {
        const r = await searchService.users({
          q: query,
          role: ROLE_ENTERPRISE,
          limit: pageSize,
          offset: (page - 1) * pageSize,
        });
        setResults((prev) => ({
          ...prev,
          usersCompanies: { items: (r.hits ?? []).map(normalizeUser), total: r.total ?? 0 },
        }));
      } else {
        const r = await searchService.jobs({
          q: query,
          limit: pageSize,
          offset: (page - 1) * pageSize,
        });
        setResults((prev) => ({
          ...prev,
          jobs: { items: r.hits ?? [], total: r.total ?? 0 },
        }));
      }
    } finally {
    }
  }, [query]);

  const changeTab = useCallback((k: TabKey) => {
    setActiveTab(k);
    const sp = new URLSearchParams(searchParams ?? undefined);
    sp.set('tab', k);
    router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
  }, [router, pathname, searchParams]);

  const goToPage = useCallback((tab: TabKey, page: number) => {
    if (tab === 'users') {
      if (page < 1 || page > pages.users) return;
      setPageUsers(page);
    } else if (tab === 'companies') {
      if (page < 1 || page > pages.companies) return;
      setPageCompanies(page);
    } else {
      if (page < 1 || page > pages.jobs) return;
      setPageJobs(page);
    }
    void fetchOne(tab, page);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pages.users, pages.companies, pages.jobs, fetchOne]);

  useEffect(() => {
    const newQ = (searchParams.get('q') ?? '').trim();
    setQuery(newQ);
    setPageUsers(1);
    setPageCompanies(1);
    setPageJobs(1);
    void fetchAll(newQ);
  }, [searchParams, fetchAll]);

  useEffect(() => {
    if (tabParam && ['users', 'companies', 'jobs'].includes(tabParam)) {
      setActiveTab(tabParam as TabKey);
      return;
    }
    const first = availableTabs[0]?.key ?? 'jobs';
    setActiveTab(first);
  }, [tabParam, availableTabs]);

  const noResults =
    results.jobs.total + results.usersPeople.total + results.usersCompanies.total === 0;

  return (
    <LoadingBrand loading={loading}>
      <div className={styles.searchPage}>
        <h2 className={styles.pageTitle}>
          Resultados para <span className={styles.searchQuery}>{query || '—'}</span>
          {!noResults && (
            <span>
              {' '}
              ({results.jobs.total + results.usersPeople.total + results.usersCompanies.total})
            </span>
          )}
        </h2>

        {noResults && !!query && (
          <div className={styles.noResultsContainer}>
            <div className={styles.noResultsImageWrapper}>
              <Image
                src="/undraw_back-home_3dun.svg"
                alt="Nenhum resultado encontrado"
                width={480}
                height={280}
                className={styles.notFoundImg}
                priority={false}
              />
            </div>
            <p>Nenhum resultado encontrado para &quot;{query}&quot;.</p>
            <p>
              Tente ajustar sua busca ou{' '}
              <a
                href="/"
                onClick={(e) => {
                  e.preventDefault();
                  router.push('/');
                }}
              >
                voltar para a página inicial
              </a>
              .
            </p>
          </div>
        )}

        {!noResults && (
          <>
            <Tabs active={activeTab} onChange={changeTab} tabs={availableTabs} />

            {activeTab === 'users' && (
              <>
                <div className={styles.gridContainer}>
                  <ul className={styles.resultsGrid} role="list">
                    {results.usersPeople.items.map((u) => (
                      <UserCard key={u.uuid ?? u.username} user={u} />
                    ))}
                  </ul>
                </div>
                {pages.users > 1 && (
                  <nav className={styles.pagination} role="navigation" aria-label="Paginação usuários">
                    {Array.from({ length: pages.users }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        className={page === pageUsers ? styles.active : undefined}
                        onClick={() => goToPage('users', page)}
                        type="button"
                        aria-current={page === pageUsers ? 'page' : undefined}
                      >
                        {page}
                      </button>
                    ))}
                  </nav>
                )}
              </>
            )}

            {activeTab === 'companies' && (
              <>
                <div className={styles.gridContainer}>
                  <ul className={styles.resultsGrid} role="list">
                    {results.usersCompanies.items.map((u) => (
                      <UserCard key={u.uuid ?? u.username} user={u} />
                    ))}
                  </ul>
                </div>
                {pages.companies > 1 && (
                  <nav className={styles.pagination} role="navigation" aria-label="Paginação empresas">
                    {Array.from({ length: pages.companies }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        className={page === pageCompanies ? styles.active : undefined}
                        onClick={() => goToPage('companies', page)}
                        type="button"
                        aria-current={page === pageCompanies ? 'page' : undefined}
                      >
                        {page}
                      </button>
                    ))}
                  </nav>
                )}
              </>
            )}

            {activeTab === 'jobs' && (
              <>
                <div className={styles.gridContainer}>
                  <ul className={styles.resultsGrid} role="list">
                    {results.jobs.items.map((job) => (
                      <JobCard key={job.uuid} job={job} />
                    ))}
                  </ul>
                </div>
                {pages.jobs > 1 && (
                  <nav className={styles.pagination} role="navigation" aria-label="Paginação vagas">
                    {Array.from({ length: pages.jobs }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        className={page === pageJobs ? styles.active : undefined}
                        onClick={() => goToPage('jobs', page)}
                        type="button"
                        aria-current={page === pageJobs ? 'page' : undefined}
                      >
                        {page}
                      </button>
                    ))}
                  </nav>
                )}
              </>
            )}
          </>
        )}
      </div>
    </LoadingBrand>
  );
}

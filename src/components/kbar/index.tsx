'use client';
import { navItems } from '@/config/nav-config';
import {
  KBarAnimator,
  KBarPortal,
  KBarPositioner,
  KBarProvider,
  KBarSearch,
  useKBar,
  useRegisterActions
} from 'kbar';
import { useRouter } from 'next/navigation';
import { useMemo, useState, useEffect, useCallback } from 'react';
import RenderResults from './render-result';
import useThemeSwitching from './use-theme-switching';
import { useFilteredNavItems } from '@/hooks/use-nav';

function useWorkspaceSearch() {
  const { searchQuery } = useKBar((state) => ({
    searchQuery: state.searchQuery
  }));
  const [searchActions, setSearchActions] = useState<any[]>([]);
  const router = useRouter();

  const doSearch = useCallback(
    async (query: string) => {
      if (query.length < 3) {
        setSearchActions([]);
        return;
      }
      try {
        const res = await fetch(
          `/api/openclaw/search?q=${encodeURIComponent(query)}`,
          { method: 'POST' }
        );
        const data = await res.json();
        const results = Array.isArray(data)
          ? data
          : data.results
            ? data.results
            : [];
        const actions = results.slice(0, 8).map((r: any, i: number) => ({
          id: `workspace-search-${i}`,
          name:
            typeof r === 'string'
              ? r.slice(0, 100)
              : r.title || r.path || r.name || JSON.stringify(r).slice(0, 100),
          subtitle: typeof r === 'object' ? r.snippet || r.path || '' : '',
          section: 'Workspace Search',
          perform: () =>
            router.push(`/dashboard/search?q=${encodeURIComponent(query)}`)
        }));
        setSearchActions(actions);
      } catch {
        setSearchActions([]);
      }
    },
    [router]
  );

  useEffect(() => {
    const timer = setTimeout(() => doSearch(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery, doSearch]);

  useRegisterActions(searchActions, [searchActions]);
}

export default function KBar({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const filteredItems = useFilteredNavItems(navItems);

  const actions = useMemo(() => {
    const navigateTo = (url: string) => {
      router.push(url);
    };

    return filteredItems.flatMap((navItem) => {
      const baseAction =
        navItem.url !== '#'
          ? {
              id: `${navItem.title.toLowerCase()}Action`,
              name: navItem.title,
              shortcut: navItem.shortcut,
              keywords: navItem.title.toLowerCase(),
              section: 'Navigation',
              subtitle: `Go to ${navItem.title}`,
              perform: () => navigateTo(navItem.url)
            }
          : null;

      const childActions =
        navItem.items?.map((childItem) => ({
          id: `${childItem.title.toLowerCase()}Action`,
          name: childItem.title,
          shortcut: childItem.shortcut,
          keywords: childItem.title.toLowerCase(),
          section: navItem.title,
          subtitle: `Go to ${childItem.title}`,
          perform: () => navigateTo(childItem.url)
        })) ?? [];

      return baseAction ? [baseAction, ...childActions] : childActions;
    });
  }, [router, filteredItems]);

  return (
    <KBarProvider actions={actions}>
      <KBarComponent>{children}</KBarComponent>
    </KBarProvider>
  );
}

const KBarComponent = ({ children }: { children: React.ReactNode }) => {
  useThemeSwitching();
  useWorkspaceSearch();

  return (
    <>
      <KBarPortal>
        <KBarPositioner className='bg-background/80 fixed inset-0 z-99999 p-0! backdrop-blur-sm'>
          <KBarAnimator className='bg-card text-card-foreground relative mt-64! w-full max-w-[600px] -translate-y-12! overflow-hidden rounded-lg border shadow-lg'>
            <div className='bg-card border-border sticky top-0 z-10 border-b'>
              <KBarSearch className='bg-card w-full border-none px-6 py-4 text-lg outline-hidden focus:ring-0 focus:ring-offset-0 focus:outline-hidden' />
            </div>
            <div className='max-h-[400px]'>
              <RenderResults />
            </div>
          </KBarAnimator>
        </KBarPositioner>
      </KBarPortal>
      {children}
    </>
  );
};

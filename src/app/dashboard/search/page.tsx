'use client';

import { useState, useCallback } from 'react';
import PageContainer from '@/components/layout/page-container';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { IconSearch, IconFile } from '@tabler/icons-react';

const API = 'http://localhost:3001/api';

interface SearchResult {
  source: string;
  line: number;
  text: string;
  type: string;
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const search = useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(
        `${API}/search?q=${encodeURIComponent(query.trim())}`
      );
      if (res.ok) {
        const data = await res.json();
        setResults(data);
      } else {
        setResults([]);
      }
    } catch {
      setResults([]);
    }
    setLoading(false);
  }, [query]);

  return (
    <PageContainer
      pageTitle='Search'
      pageDescription='Search across your workspace files'
    >
      <div className='space-y-4'>
        <div className='flex gap-2'>
          <div className='relative flex-1'>
            <IconSearch className='text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2' />
            <Input
              placeholder='Search workspace files...'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && search()}
              className='pl-9'
            />
          </div>
        </div>

        {loading && (
          <div className='space-y-2'>
            {[1, 2, 3].map((i) => (
              <div key={i} className='animate-pulse'>
                <div className='bg-muted h-16 rounded-lg' />
              </div>
            ))}
          </div>
        )}

        {!loading && searched && results.length === 0 && (
          <Card>
            <CardContent className='py-8 text-center'>
              <p className='text-muted-foreground'>
                No results found for &ldquo;{query}&rdquo;
              </p>
            </CardContent>
          </Card>
        )}

        {!loading && results.length > 0 && (
          <div className='space-y-2'>
            <p className='text-muted-foreground text-sm'>
              {results.length} results
            </p>
            {results.map((r, idx) => (
              <Card key={idx}>
                <CardContent className='py-3'>
                  <div className='flex items-start gap-3'>
                    <IconFile className='text-muted-foreground mt-0.5 size-4 shrink-0' />
                    <div className='min-w-0 flex-1'>
                      <div className='mb-1 flex items-center gap-2'>
                        <span className='text-muted-foreground font-mono text-xs'>
                          {r.source}
                        </span>
                        {r.line > 0 && (
                          <span className='text-muted-foreground text-xs'>
                            line {r.line}
                          </span>
                        )}
                        <Badge variant='outline' className='text-[10px]'>
                          {r.type}
                        </Badge>
                      </div>
                      <p className='text-sm'>{r.text}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}

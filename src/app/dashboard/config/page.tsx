'use client';

import { useEffect, useState } from 'react';
import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IconFile, IconChevronRight } from '@tabler/icons-react';

const CONFIG_FILES = [
  'AGENTS.md',
  'SOUL.md',
  'USER.md',
  'IDENTITY.md',
  'TOOLS.md',
  'HEARTBEAT.md'
];

export default function ConfigPage() {
  const [contents, setContents] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [activeFile, setActiveFile] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAll() {
      const results: Record<string, string> = {};
      await Promise.all(
        CONFIG_FILES.map(async (file) => {
          try {
            const res = await fetch(
              `/api/openclaw/content?path=${encodeURIComponent(file)}`
            );
            const data = await res.json();
            results[file] =
              typeof data === 'string'
                ? data
                : data.content || data.error || JSON.stringify(data, null, 2);
          } catch {
            results[file] = 'Failed to load';
          }
        })
      );
      setContents(results);
      setLoading(false);
    }
    fetchAll();
  }, []);

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-4'>
        <h2 className='text-2xl font-bold tracking-tight'>Config Files</h2>

        {loading ? (
          <div className='flex items-center justify-center py-20'>
            <div className='border-muted-foreground size-6 animate-spin rounded-full border-2 border-t-transparent' />
          </div>
        ) : activeFile ? (
          <>
            <button
              onClick={() => setActiveFile(null)}
              className='text-muted-foreground hover:text-foreground flex w-fit items-center gap-1 text-sm'
            >
              ← Back to files
            </button>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2 text-base'>
                  <IconFile className='size-4' />
                  {activeFile}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className='bg-muted/50 max-h-[600px] overflow-auto rounded-lg p-4 font-mono text-sm whitespace-pre-wrap'>
                  {contents[activeFile] || 'No content'}
                </pre>
              </CardContent>
            </Card>
          </>
        ) : (
          <div className='space-y-2'>
            {CONFIG_FILES.map((file) => (
              <Card
                key={file}
                className='hover:border-primary/20 cursor-pointer transition-colors'
                onClick={() => setActiveFile(file)}
              >
                <CardContent className='flex items-center justify-between p-4'>
                  <div className='flex items-center gap-3'>
                    <IconFile className='text-muted-foreground size-5' />
                    <div>
                      <p className='text-sm font-medium'>{file}</p>
                      <p className='text-muted-foreground max-w-md truncate text-xs'>
                        {contents[file]?.slice(0, 80)?.replace(/\n/g, ' ') ||
                          'Empty'}
                      </p>
                    </div>
                  </div>
                  <IconChevronRight className='text-muted-foreground size-4' />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}

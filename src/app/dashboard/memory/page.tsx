'use client';

import { useEffect, useState } from 'react';
import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  IconBrain,
  IconCalendar,
  IconBook,
  IconChevronRight
} from '@tabler/icons-react';

interface MemoryFile {
  name: string;
  date: string;
  size: number;
  lines: number;
  content: string;
  modified: string;
}

interface MemoryData {
  daily: MemoryFile[];
  guides: MemoryFile[];
  longTerm: string;
}

export default function MemoryPage() {
  const [memory, setMemory] = useState<MemoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedDaily, setExpandedDaily] = useState<string | null>(null);
  const [expandedGuide, setExpandedGuide] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/openclaw/memory')
      .then((r) => r.json())
      .then((data) => {
        setMemory(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-4'>
        <h2 className='text-2xl font-bold tracking-tight'>Memory</h2>

        {loading ? (
          <div className='flex items-center justify-center py-20'>
            <div className='border-muted-foreground size-6 animate-spin rounded-full border-2 border-t-transparent' />
          </div>
        ) : (
          <Tabs defaultValue='longterm'>
            <TabsList>
              <TabsTrigger value='longterm'>
                <IconBrain className='mr-1 size-4' />
                Long-Term
              </TabsTrigger>
              <TabsTrigger value='daily'>
                <IconCalendar className='mr-1 size-4' />
                Daily ({memory?.daily?.length || 0})
              </TabsTrigger>
              <TabsTrigger value='guides'>
                <IconBook className='mr-1 size-4' />
                Guides ({memory?.guides?.length || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value='longterm'>
              <Card>
                <CardHeader>
                  <CardTitle className='text-base'>MEMORY.md</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className='bg-muted/50 max-h-[600px] overflow-auto rounded-lg p-4 font-mono text-sm whitespace-pre-wrap'>
                    {memory?.longTerm || 'No long-term memory found.'}
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='daily'>
              <div className='space-y-2'>
                {!memory?.daily?.length ? (
                  <Card>
                    <CardContent className='text-muted-foreground py-10 text-center text-sm'>
                      No daily memory files found
                    </CardContent>
                  </Card>
                ) : (
                  memory.daily.map((file) => (
                    <Card key={file.name}>
                      <CardHeader
                        className='cursor-pointer py-3'
                        onClick={() =>
                          setExpandedDaily(
                            expandedDaily === file.name ? null : file.name
                          )
                        }
                      >
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center gap-3'>
                            <IconChevronRight
                              className={`size-4 transition-transform ${
                                expandedDaily === file.name ? 'rotate-90' : ''
                              }`}
                            />
                            <span className='text-sm font-medium'>
                              {file.name}
                            </span>
                            <Badge variant='outline' className='text-xs'>
                              {file.lines} lines
                            </Badge>
                            <span className='text-muted-foreground text-xs'>
                              {(file.size / 1024).toFixed(1)} KB
                            </span>
                          </div>
                          <span className='text-muted-foreground text-xs'>
                            {file.date}
                          </span>
                        </div>
                      </CardHeader>
                      {expandedDaily === file.name && (
                        <CardContent className='pt-0'>
                          <pre className='bg-muted/50 max-h-[400px] overflow-auto rounded-lg p-4 font-mono text-xs whitespace-pre-wrap'>
                            {file.content}
                          </pre>
                        </CardContent>
                      )}
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value='guides'>
              <div className='space-y-2'>
                {!memory?.guides?.length ? (
                  <Card>
                    <CardContent className='text-muted-foreground py-10 text-center text-sm'>
                      No guide files found
                    </CardContent>
                  </Card>
                ) : (
                  memory.guides.map((file) => (
                    <Card key={file.name}>
                      <CardHeader
                        className='cursor-pointer py-3'
                        onClick={() =>
                          setExpandedGuide(
                            expandedGuide === file.name ? null : file.name
                          )
                        }
                      >
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center gap-3'>
                            <IconChevronRight
                              className={`size-4 transition-transform ${
                                expandedGuide === file.name ? 'rotate-90' : ''
                              }`}
                            />
                            <span className='text-sm font-medium'>
                              {file.name}
                            </span>
                            <Badge variant='outline' className='text-xs'>
                              {file.lines} lines
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      {expandedGuide === file.name && (
                        <CardContent className='pt-0'>
                          <pre className='bg-muted/50 max-h-[400px] overflow-auto rounded-lg p-4 font-mono text-xs whitespace-pre-wrap'>
                            {file.content}
                          </pre>
                        </CardContent>
                      )}
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </PageContainer>
  );
}

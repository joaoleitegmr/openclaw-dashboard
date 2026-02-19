'use client';

import { useEffect, useState } from 'react';
import PageContainer from '@/components/layout/page-container';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { IconNews, IconClock, IconCalendar } from '@tabler/icons-react';

const API = 'http://localhost:3001/api';

interface CronJob {
  id: string;
  name: string;
  enabled: boolean;
  schedule: { kind: string; expr?: string; tz?: string };
  payload?: { kind: string; message?: string };
  state?: {
    lastRunAtMs?: number;
    lastStatus?: string;
    lastDurationMs?: number;
    nextRunAtMs?: number;
  };
}

export default function DigestsPage() {
  const [crons, setCrons] = useState<CronJob[]>([]);

  useEffect(() => {
    fetch(`${API}/cron`)
      .then((r) => r.json())
      .then(setCrons)
      .catch(() => {});
  }, []);

  // Filter to digest/briefing-type cron jobs
  const digestJobs = crons.filter((c) => {
    const name = c.name.toLowerCase();
    return (
      name.includes('briefing') ||
      name.includes('digest') ||
      name.includes('news') ||
      name.includes('summary')
    );
  });

  const otherJobs = crons.filter((c) => !digestJobs.includes(c) && c.enabled);

  return (
    <PageContainer
      pageTitle='Digests'
      pageDescription='News briefings and automated summaries'
    >
      <div className='space-y-6'>
        {/* Digest Jobs */}
        <div>
          <h3 className='mb-3 flex items-center gap-2 text-lg font-semibold'>
            <IconNews className='size-5 text-blue-500' />
            Digest Briefings ({digestJobs.length})
          </h3>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            {digestJobs.map((job) => (
              <Card key={job.id}>
                <CardHeader className='pb-2'>
                  <div className='flex items-start justify-between'>
                    <CardTitle className='text-base'>{job.name}</CardTitle>
                    <Badge variant={job.enabled ? 'default' : 'secondary'}>
                      {job.enabled ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className='space-y-2 text-sm'>
                  {job.schedule.expr && (
                    <div className='flex items-center gap-2'>
                      <IconClock className='text-muted-foreground size-3.5' />
                      <span className='text-muted-foreground font-mono text-xs'>
                        {job.schedule.expr}
                      </span>
                      {job.schedule.tz && (
                        <span className='text-muted-foreground text-xs'>
                          ({job.schedule.tz})
                        </span>
                      )}
                    </div>
                  )}
                  {job.payload?.message && (
                    <p className='text-muted-foreground line-clamp-2 text-xs'>
                      {job.payload.message}
                    </p>
                  )}
                  <div className='flex items-center justify-between pt-1'>
                    {job.state?.lastRunAtMs && (
                      <span className='text-muted-foreground flex items-center gap-1 text-xs'>
                        <IconCalendar className='size-3' />
                        Last:{' '}
                        {new Date(job.state.lastRunAtMs).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    )}
                    {job.state?.lastStatus && (
                      <Badge
                        variant={
                          job.state.lastStatus === 'ok'
                            ? 'default'
                            : 'destructive'
                        }
                        className='text-[10px]'
                      >
                        {job.state.lastStatus}
                      </Badge>
                    )}
                  </div>
                  {job.state?.nextRunAtMs && (
                    <p className='text-muted-foreground text-xs'>
                      Next:{' '}
                      {new Date(job.state.nextRunAtMs).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          {digestJobs.length === 0 && (
            <Card>
              <CardContent className='py-8 text-center'>
                <p className='text-muted-foreground'>
                  No digest briefings configured.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PageContainer>
  );
}

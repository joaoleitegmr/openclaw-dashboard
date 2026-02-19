'use client';

import { useEffect, useState } from 'react';
import PageContainer from '@/components/layout/page-container';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  IconRefresh,
  IconClock,
  IconCheck,
  IconAlertCircle,
  IconBolt,
  IconCalendar
} from '@tabler/icons-react';

const API = 'http://localhost:3001/api';

interface CronJob {
  id: string;
  name: string;
  enabled: boolean;
  schedule: { kind: string; expr?: string; at?: string; tz?: string };
  state?: {
    lastRunAtMs?: number;
    lastStatus?: string;
    lastDurationMs?: number;
    nextRunAtMs?: number;
  };
}

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
}

interface FeedItem {
  time: number;
  type: 'cron_run' | 'error' | 'info' | 'scheduled';
  title: string;
  detail?: string;
  status?: string;
}

export default function FeedPage() {
  const [crons, setCrons] = useState<CronJob[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const load = () => {
    fetch(`${API}/cron`)
      .then((r) => r.json())
      .then(setCrons)
      .catch(() => {});
    fetch(`${API}/logs`)
      .then((r) => r.json())
      .then(setLogs)
      .catch(() => {});
  };

  useEffect(() => {
    load();
  }, []);

  // Build a combined feed
  const feedItems: FeedItem[] = [
    // Cron last runs
    ...crons
      .filter((c) => c.state?.lastRunAtMs)
      .map((c) => ({
        time: c.state!.lastRunAtMs!,
        type: 'cron_run' as const,
        title: `${c.name}`,
        detail: c.state?.lastDurationMs
          ? `Ran for ${(c.state.lastDurationMs / 1000).toFixed(1)}s`
          : undefined,
        status: c.state?.lastStatus
      })),
    // Upcoming scheduled events
    ...crons
      .filter(
        (c) => c.enabled && c.state?.nextRunAtMs && c.schedule.kind === 'at'
      )
      .map((c) => ({
        time: c.state!.nextRunAtMs!,
        type: 'scheduled' as const,
        title: `Upcoming: ${c.name}`,
        detail: `Scheduled for ${new Date(c.state!.nextRunAtMs!).toLocaleString()}`,
        status: 'pending'
      })),
    // Recent errors from logs
    ...logs
      .filter((l) => l.level === 'error')
      .slice(0, 10)
      .map((l) => ({
        time: new Date(l.timestamp).getTime(),
        type: 'error' as const,
        title:
          l.message.length > 100 ? l.message.slice(0, 100) + '...' : l.message,
        status: 'error'
      }))
  ]
    .sort((a, b) => b.time - a.time)
    .slice(0, 40);

  const typeConfig: Record<string, { icon: React.ReactNode; color: string }> = {
    cron_run: { icon: <IconBolt className='size-4' />, color: 'text-blue-500' },
    error: {
      icon: <IconAlertCircle className='size-4' />,
      color: 'text-red-500'
    },
    info: { icon: <IconClock className='size-4' />, color: 'text-gray-500' },
    scheduled: {
      icon: <IconCalendar className='size-4' />,
      color: 'text-amber-500'
    }
  };

  return (
    <PageContainer
      pageTitle='Feed'
      pageDescription='Combined activity and event feed'
      pageHeaderAction={
        <Button variant='outline' size='sm' onClick={load}>
          <IconRefresh className='mr-1 size-4' />
          Refresh
        </Button>
      }
    >
      <Card>
        <CardContent className='pt-6'>
          <div className='space-y-3'>
            {feedItems.map((item, idx) => {
              const cfg = typeConfig[item.type] || typeConfig.info;
              return (
                <div
                  key={idx}
                  className='flex items-start gap-3 border-b pb-3 last:border-0 last:pb-0'
                >
                  <div className={`mt-0.5 ${cfg.color}`}>{cfg.icon}</div>
                  <div className='min-w-0 flex-1'>
                    <p className='text-sm'>{item.title}</p>
                    {item.detail && (
                      <p className='text-muted-foreground text-xs'>
                        {item.detail}
                      </p>
                    )}
                  </div>
                  <div className='flex shrink-0 items-center gap-2'>
                    {item.status && (
                      <Badge
                        variant={
                          item.status === 'ok'
                            ? 'default'
                            : item.status === 'error'
                              ? 'destructive'
                              : 'outline'
                        }
                        className='text-[10px]'
                      >
                        {item.status}
                      </Badge>
                    )}
                    <span className='text-muted-foreground text-xs whitespace-nowrap'>
                      {new Date(item.time).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              );
            })}
            {feedItems.length === 0 && (
              <p className='text-muted-foreground py-8 text-center text-sm'>
                No feed items yet.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}

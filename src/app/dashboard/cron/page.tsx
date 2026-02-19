'use client';

import { useEffect, useState } from 'react';
import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';

interface CronJob {
  id: string;
  name: string;
  enabled: boolean;
  schedule: {
    kind: string;
    expr: string;
    tz: string;
    at?: string;
    everyMs?: number;
  };
  sessionTarget: string;
  payload: string;
  state: {
    lastRunAtMs: number;
    lastStatus: string;
    nextRunAtMs: number;
    consecutiveErrors: number;
  };
}

function formatTimestamp(ms: number) {
  if (!ms) return '-';
  return new Date(ms).toLocaleString();
}

function timeUntil(ms: number) {
  if (!ms) return '-';
  const diff = ms - Date.now();
  if (diff < 0) return 'overdue';
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ${mins % 60}m`;
  return `${Math.floor(hours / 24)}d ${hours % 24}h`;
}

function parseCronToHuman(expr: string): { time: string; tag: string } {
  if (!expr) return { time: '-', tag: '' };
  const parts = expr.trim().split(/\s+/);
  if (parts.length < 5) return { time: expr, tag: '' };
  const [min, hour, dom, mon, dow] = parts;

  let time = '';
  if (hour !== '*' && min !== '*') {
    const h = parseInt(hour);
    const m = parseInt(min);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    time = `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
  } else if (min !== '*' && hour === '*') {
    time = `Every hour at :${String(parseInt(min)).padStart(2, '0')}`;
  } else {
    time = expr;
  }

  let tag = '';
  if (dom === '*' && mon === '*' && dow === '*') {
    if (hour !== '*' && min !== '*') tag = 'Daily';
    else if (hour === '*') tag = 'Hourly';
    else tag = 'Every minute';
  } else if (dom === '*' && mon === '*' && dow !== '*') {
    const dayNames: Record<string, string> = {
      '0': 'Sun',
      '1': 'Mon',
      '2': 'Tue',
      '3': 'Wed',
      '4': 'Thu',
      '5': 'Fri',
      '6': 'Sat',
      '7': 'Sun'
    };
    const days = dow
      .split(',')
      .map((d) => dayNames[d] || d)
      .join(', ');
    tag = `Weekly (${days})`;
  } else if (dom !== '*' && mon === '*') {
    tag = 'Monthly';
  } else if (mon !== '*') {
    // Specific date — show it as a date
    tag = 'One-time';
  }
  return { time, tag };
}

function formatSchedule(schedule: CronJob['schedule']): {
  time: string;
  tag: string;
  tz: string;
} {
  if (!schedule) return { time: '-', tag: '', tz: '' };

  // One-time "at" schedule
  if (schedule.kind === 'at' && schedule.at) {
    const d = new Date(schedule.at);
    const time = d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    return { time, tag: 'One-time', tz: schedule.tz || '' };
  }

  if (schedule.kind === 'cron' && schedule.expr) {
    const parsed = parseCronToHuman(schedule.expr);

    // If it's a specific date cron (non-wildcard month+day), show the full date+time
    const parts = schedule.expr.trim().split(/\s+/);
    if (parts.length >= 5) {
      const [min, hour, dom, mon] = parts;
      if (mon !== '*' && dom !== '*' && hour !== '*' && min !== '*') {
        const h = parseInt(hour);
        const m = parseInt(min);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
        const monthNames = [
          '',
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec'
        ];
        const monthName = monthNames[parseInt(mon)] || mon;
        return {
          time: `${monthName} ${dom}, ${h12}:${String(m).padStart(2, '0')} ${ampm}`,
          tag: 'One-time',
          tz: schedule.tz || ''
        };
      }
    }

    return { ...parsed, tz: schedule.tz || '' };
  }

  if (schedule.kind === 'every' && schedule.everyMs) {
    const ms = schedule.everyMs;
    let time = '';
    if (ms < 60000) time = `Every ${ms / 1000}s`;
    else if (ms < 3600000) time = `Every ${ms / 60000}m`;
    else if (ms < 86400000) time = `Every ${ms / 3600000}h`;
    else time = `Every ${ms / 86400000}d`;
    return { time, tag: 'Interval', tz: schedule.tz || '' };
  }

  return {
    time: schedule.expr || schedule.kind || '-',
    tag: '',
    tz: schedule.tz || ''
  };
}

function CronTable({ jobs, title }: { jobs: CronJob[]; title: string }) {
  if (jobs.length === 0) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-base'>{title}</CardTitle>
      </CardHeader>
      <CardContent className='p-0'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Schedule</TableHead>
              <TableHead>Frequency</TableHead>
              <TableHead>Last Status</TableHead>
              <TableHead>Last Run</TableHead>
              <TableHead>Next Run</TableHead>
              <TableHead>Errors</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.map((job) => {
              const sched = formatSchedule(job.schedule);
              return (
                <TableRow key={job.id || job.name}>
                  <TableCell className='text-sm font-medium'>
                    {job.name}
                  </TableCell>
                  <TableCell className='text-sm'>
                    <div>{sched.time}</div>
                    {sched.tz && (
                      <span className='text-muted-foreground text-xs'>
                        {sched.tz}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {sched.tag && (
                      <Badge
                        variant={
                          sched.tag === 'One-time' ? 'secondary' : 'outline'
                        }
                        className='text-xs'
                      >
                        {sched.tag}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        job.state?.lastStatus === 'ok'
                          ? 'default'
                          : job.state?.lastStatus === 'error'
                            ? 'destructive'
                            : 'outline'
                      }
                    >
                      {job.state?.lastStatus || 'never'}
                    </Badge>
                  </TableCell>
                  <TableCell className='text-muted-foreground text-xs'>
                    {formatTimestamp(job.state?.lastRunAtMs)}
                  </TableCell>
                  <TableCell className='text-xs'>
                    {timeUntil(job.state?.nextRunAtMs)}
                  </TableCell>
                  <TableCell>
                    {(job.state?.consecutiveErrors || 0) > 0 ? (
                      <Badge variant='destructive'>
                        {job.state.consecutiveErrors}
                      </Badge>
                    ) : (
                      <span className='text-muted-foreground text-xs'>0</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default function CronPage() {
  const [jobs, setJobs] = useState<CronJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInactive, setShowInactive] = useState(false);

  useEffect(() => {
    fetch('/api/openclaw/cron')
      .then((r) => r.json())
      .then((data) => {
        setJobs(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const activeJobs = jobs.filter((j) => j.enabled);
  const inactiveJobs = jobs.filter((j) => !j.enabled);

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-center justify-between'>
          <h2 className='text-2xl font-bold tracking-tight'>Cron Jobs</h2>
          <span className='text-muted-foreground text-sm'>
            {activeJobs.length} active / {jobs.length} total
          </span>
        </div>

        {loading ? (
          <div className='flex items-center justify-center py-20'>
            <div className='border-muted-foreground size-6 animate-spin rounded-full border-2 border-t-transparent' />
          </div>
        ) : jobs.length === 0 ? (
          <Card>
            <CardContent className='py-20 text-center'>
              <p className='text-muted-foreground text-sm'>
                No cron jobs configured
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <CronTable
              jobs={activeJobs}
              title={`✅ Active Jobs (${activeJobs.length})`}
            />

            {inactiveJobs.length > 0 && (
              <div className='space-y-3'>
                <Button
                  variant='ghost'
                  className='text-muted-foreground hover:text-foreground flex items-center gap-2'
                  onClick={() => setShowInactive(!showInactive)}
                >
                  {showInactive ? (
                    <IconChevronUp className='size-4' />
                  ) : (
                    <IconChevronDown className='size-4' />
                  )}
                  Inactive Jobs ({inactiveJobs.length})
                </Button>
                {showInactive && (
                  <CronTable
                    jobs={inactiveJobs}
                    title={`⏸️ Inactive Jobs (${inactiveJobs.length})`}
                  />
                )}
              </div>
            )}
          </>
        )}
      </div>
    </PageContainer>
  );
}

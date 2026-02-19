'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import PageContainer from '@/components/layout/page-container';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  IconCpu,
  IconServer,
  IconDatabase,
  IconClock,
  IconBolt,
  IconCoins,
  IconActivity,
  IconBrandNodejs,
  IconCalendarEvent,
  IconWand,
  IconSettings,
  IconChartBar,
  IconBrain,
  IconArrowRight,
  IconRocket
} from '@tabler/icons-react';

interface StatusData {
  uptime: number;
  uptimeFormatted: string;
  memUsed: number;
  memTotal: number;
  memPercent: number;
  diskUsed: number;
  diskTotal: number;
  diskPercent: number;
  cpuLoad1: number;
  cpuCores: number;
  openclawStatus: string;
  nodeVersion: string;
}

interface UsageData {
  totalTokens: number;
  totalCost: number;
  totalRuns: number;
  dailyUsage: Record<string, { tokens: number; cost: number; runs: number }>;
}

interface CronJob {
  id: string;
  name: string;
  enabled: boolean;
  schedule: { kind: string; expr: string; tz: string };
  state: {
    lastRunAtMs: number;
    lastStatus: string;
    nextRunAtMs: number;
    consecutiveErrors: number;
  };
}

interface Skill {
  name: string;
  active: boolean;
}

interface Project {
  id: string;
  name: string;
  status: string;
  description: string;
  stack: string[];
  links?: { label: string; url: string }[];
}

export default function OverviewPage() {
  const [status, setStatus] = useState<StatusData | null>(null);
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [cronJobs, setCronJobs] = useState<CronJob[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statusRes, usageRes, cronRes, skillsRes, projRes] =
          await Promise.all([
            fetch('/api/openclaw/status'),
            fetch('/api/openclaw/usage'),
            fetch('/api/openclaw/cron'),
            fetch('/api/openclaw/skills'),
            fetch('/api/projects')
          ]);
        setStatus(await statusRes.json());
        setUsage(await usageRes.json());
        const cronData = await cronRes.json();
        setCronJobs(Array.isArray(cronData) ? cronData : []);
        const skillsData = await skillsRes.json();
        setSkills(Array.isArray(skillsData) ? skillsData : []);
        const projData = await projRes.json();
        setProjects(Array.isArray(projData) ? projData : []);
      } catch (e) {
        console.error('Failed to fetch overview data:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Today's stats
  const today = new Date().toISOString().split('T')[0];
  const todayUsage = usage?.dailyUsage?.[today];
  const activeCronCount = cronJobs.filter((j) => j.enabled).length;
  const activeSkillCount = skills.filter((s) => s.active).length;

  // Recent cron runs (last 5 that have run)
  const recentRuns = [...cronJobs]
    .filter((j) => j.state?.lastRunAtMs)
    .sort((a, b) => (b.state?.lastRunAtMs || 0) - (a.state?.lastRunAtMs || 0))
    .slice(0, 5);

  // Upcoming runs (next 5)
  const upcomingRuns = [...cronJobs]
    .filter((j) => j.enabled && j.state?.nextRunAtMs)
    .sort((a, b) => (a.state?.nextRunAtMs || 0) - (b.state?.nextRunAtMs || 0))
    .slice(0, 5);

  const cpuPercent = status
    ? Math.round((status.cpuLoad1 / status.cpuCores) * 100)
    : 0;

  if (loading) {
    return (
      <PageContainer>
        <div className='flex flex-1 flex-col space-y-4'>
          <h2 className='text-2xl font-bold tracking-tight'>Overview ⚡</h2>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
            {[...Array(8)].map((_, i) => (
              <Card key={i}>
                <CardHeader className='pb-2'>
                  <div className='bg-muted h-4 w-24 animate-pulse rounded' />
                  <div className='bg-muted mt-2 h-8 w-16 animate-pulse rounded' />
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </PageContainer>
    );
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

  function timeAgo(ms: number) {
    if (!ms) return '-';
    const diff = Date.now() - ms;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-6'>
        <div className='flex items-center justify-between'>
          <h2 className='text-2xl font-bold tracking-tight'>Overview ⚡</h2>
          <Badge
            variant={
              status?.openclawStatus === 'running' ? 'default' : 'destructive'
            }
            className='text-sm'
          >
            <IconBolt className='mr-1 size-3' />
            {status?.openclawStatus || 'unknown'}
          </Badge>
        </div>

        {/* System Stats */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
          <Card>
            <CardHeader className='pb-2'>
              <CardDescription className='flex items-center gap-2'>
                <IconCpu className='size-4' /> CPU Load
              </CardDescription>
              <CardTitle className='text-2xl'>
                {status?.cpuLoad1.toFixed(2)}
                <span className='text-muted-foreground ml-1 text-sm font-normal'>
                  / {status?.cpuCores} cores
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={Math.min(cpuPercent, 100)} className='h-2' />
              <p className='text-muted-foreground mt-1 text-xs'>
                {cpuPercent}% utilization
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardDescription className='flex items-center gap-2'>
                <IconServer className='size-4' /> Memory
              </CardDescription>
              <CardTitle className='text-2xl'>
                {status?.memPercent.toFixed(1)}%
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={status?.memPercent || 0} className='h-2' />
              <p className='text-muted-foreground mt-1 text-xs'>
                {((status?.memUsed || 0) / 1024 / 1024 / 1024).toFixed(1)} /{' '}
                {((status?.memTotal || 0) / 1024 / 1024 / 1024).toFixed(1)} GB
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardDescription className='flex items-center gap-2'>
                <IconDatabase className='size-4' /> Disk
              </CardDescription>
              <CardTitle className='text-2xl'>
                {status?.diskPercent.toFixed(1)}%
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={status?.diskPercent || 0} className='h-2' />
              <p className='text-muted-foreground mt-1 text-xs'>
                {((status?.diskUsed || 0) / 1024 / 1024 / 1024).toFixed(1)} /{' '}
                {((status?.diskTotal || 0) / 1024 / 1024 / 1024).toFixed(1)} GB
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardDescription className='flex items-center gap-2'>
                <IconClock className='size-4' /> Uptime
              </CardDescription>
              <CardTitle className='text-2xl'>
                {status?.uptimeFormatted || 'N/A'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-muted-foreground text-xs'>
                Node {status?.nodeVersion || 'N/A'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Today's Quick Stats */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
          <Card>
            <CardHeader className='pb-2'>
              <CardDescription className='flex items-center gap-2'>
                <IconCoins className='size-4' /> Today&apos;s Cost
              </CardDescription>
              <CardTitle className='text-2xl'>
                ${todayUsage?.cost?.toFixed(4) || '0.00'}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className='pb-2'>
              <CardDescription className='flex items-center gap-2'>
                <IconActivity className='size-4' /> Today&apos;s Tokens
              </CardDescription>
              <CardTitle className='text-2xl'>
                {todayUsage?.tokens
                  ? (todayUsage.tokens / 1000).toFixed(1) + 'K'
                  : '0'}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className='pb-2'>
              <CardDescription className='flex items-center gap-2'>
                <IconCalendarEvent className='size-4' /> Active Cron Jobs
              </CardDescription>
              <CardTitle className='text-2xl'>{activeCronCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className='pb-2'>
              <CardDescription className='flex items-center gap-2'>
                <IconWand className='size-4' /> Active Skills
              </CardDescription>
              <CardTitle className='text-2xl'>{activeSkillCount}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Recent & Upcoming */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          {/* Projects */}
          <Card>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <CardTitle className='flex items-center gap-2 text-base'>
                  <IconRocket className='size-4' /> Projects
                </CardTitle>
                <Link
                  href='/dashboard/projects'
                  className='text-muted-foreground hover:text-foreground text-xs'
                >
                  View all →
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {projects.length === 0 ? (
                <p className='text-muted-foreground text-sm'>No projects</p>
              ) : (
                <div className='space-y-3'>
                  {projects
                    .filter((p) => p.status === 'active')
                    .slice(0, 5)
                    .map((proj) => (
                      <div
                        key={proj.id}
                        className='flex items-center justify-between'
                      >
                        <div className='min-w-0 flex-1'>
                          <p className='truncate text-sm font-medium'>
                            {proj.name}
                          </p>
                          <p className='text-muted-foreground truncate text-xs'>
                            {proj.description}
                          </p>
                        </div>
                        <Badge variant='default' className='ml-2 shrink-0'>
                          {proj.status}
                        </Badge>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming */}
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Upcoming</CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingRuns.length === 0 ? (
                <p className='text-muted-foreground text-sm'>
                  No upcoming runs
                </p>
              ) : (
                <div className='space-y-3'>
                  {upcomingRuns.map((job) => (
                    <div
                      key={job.id}
                      className='flex items-center justify-between'
                    >
                      <div className='min-w-0 flex-1'>
                        <p className='truncate text-sm font-medium'>
                          {job.name}
                        </p>
                        <p className='text-muted-foreground text-xs'>
                          {new Date(job.state?.nextRunAtMs).toLocaleTimeString(
                            'en-US',
                            { hour: '2-digit', minute: '2-digit' }
                          )}
                        </p>
                      </div>
                      <Badge variant='outline'>
                        {timeUntil(job.state?.nextRunAtMs)}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        <div className='grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6'>
          {[
            { title: 'Models', href: '/dashboard/models', icon: IconBrain },
            {
              title: 'Cron Jobs',
              href: '/dashboard/cron',
              icon: IconCalendarEvent
            },
            { title: 'Skills', href: '/dashboard/skills', icon: IconWand },
            { title: 'Usage', href: '/dashboard/usage', icon: IconChartBar },
            { title: 'Config', href: '/dashboard/config', icon: IconSettings },
            { title: 'Calendar', href: '/dashboard/calendar', icon: IconClock }
          ].map((link) => (
            <Link key={link.href} href={link.href}>
              <Card className='hover:border-primary/30 cursor-pointer transition-colors'>
                <CardContent className='flex items-center gap-2 p-4'>
                  <link.icon className='text-muted-foreground size-4' />
                  <span className='text-sm font-medium'>{link.title}</span>
                  <IconArrowRight className='text-muted-foreground ml-auto size-3' />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}

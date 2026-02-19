'use client';

import { useEffect, useState, useMemo } from 'react';
import PageContainer from '@/components/layout/page-container';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  IconClipboard,
  IconClock,
  IconServer,
  IconUser,
  IconFolder,
  IconAlertTriangle,
  IconFilter
} from '@tabler/icons-react';

interface ActivityEvent {
  id: string;
  timestamp: string;
  type: 'task' | 'cron' | 'system' | 'session' | 'project' | 'error';
  title: string;
  description: string;
  source: string;
  project?: string;
  level?: 'info' | 'warn' | 'error';
}

const typeConfig: Record<
  string,
  {
    label: string;
    icon: typeof IconClipboard;
    color: string;
    badgeClass: string;
  }
> = {
  task: {
    label: 'Tasks',
    icon: IconClipboard,
    color: 'text-blue-500',
    badgeClass:
      'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20'
  },
  cron: {
    label: 'Cron',
    icon: IconClock,
    color: 'text-purple-500',
    badgeClass:
      'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/20'
  },
  system: {
    label: 'System',
    icon: IconServer,
    color: 'text-emerald-500',
    badgeClass:
      'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
  },
  session: {
    label: 'Sessions',
    icon: IconUser,
    color: 'text-cyan-500',
    badgeClass:
      'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/20'
  },
  project: {
    label: 'Projects',
    icon: IconFolder,
    color: 'text-orange-500',
    badgeClass:
      'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/20'
  },
  error: {
    label: 'Errors',
    icon: IconAlertTriangle,
    color: 'text-red-500',
    badgeClass: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/20'
  }
};

const projectColors: Record<string, string> = {
  // Add project-specific colors here as needed
};

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;

  if (diff < 0) return 'just now';

  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

const allTypes = [
  'task',
  'cron',
  'system',
  'session',
  'project',
  'error'
] as const;

export default function ActivityPage() {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/activity')
      .then((r) => r.json())
      .then((data) => {
        setEvents(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Compute counts
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = { all: events.length };
    for (const type of allTypes) {
      counts[type] = events.filter((e) => e.type === type).length;
    }
    return counts;
  }, [events]);

  // Unique projects from events
  const projectsInEvents = useMemo(() => {
    const set = new Set<string>();
    for (const e of events) {
      if (e.project) set.add(e.project);
    }
    return Array.from(set).sort();
  }, [events]);

  // Filtered events
  const filtered = useMemo(() => {
    return events.filter((e) => {
      if (typeFilter !== 'all' && e.type !== typeFilter) return false;
      if (projectFilter !== 'all' && e.project !== projectFilter) return false;
      return true;
    });
  }, [events, typeFilter, projectFilter]);

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-center justify-between'>
          <h2 className='text-2xl font-bold tracking-tight'>Activity</h2>
          <span className='text-muted-foreground text-sm'>
            {filtered.length} events
          </span>
        </div>

        {/* Filter Bar */}
        <div className='flex flex-wrap items-center gap-3'>
          <div className='flex items-center gap-1.5'>
            <IconFilter className='text-muted-foreground size-4' />
          </div>

          {/* Type filters */}
          <div className='flex flex-wrap gap-1.5'>
            <button
              onClick={() => setTypeFilter('all')}
              className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                typeFilter === 'all'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background hover:bg-accent border-border'
              }`}
            >
              All
              <span className='opacity-60'>{typeCounts.all}</span>
            </button>
            {allTypes.map((type) => {
              const config = typeConfig[type];
              const count = typeCounts[type] || 0;
              if (count === 0) return null;
              const Icon = config.icon;
              return (
                <button
                  key={type}
                  onClick={() =>
                    setTypeFilter(typeFilter === type ? 'all' : type)
                  }
                  className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                    typeFilter === type
                      ? `${config.badgeClass}`
                      : 'bg-background hover:bg-accent border-border'
                  }`}
                >
                  <Icon className='size-3' />
                  {config.label}
                  <span className='opacity-60'>{count}</span>
                </button>
              );
            })}
          </div>

          {/* Project filter */}
          {projectsInEvents.length > 0 && (
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className='bg-background border-input h-8 rounded-md border px-2 text-xs outline-none'
            >
              <option value='all'>All Projects</option>
              {projectsInEvents.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Event List */}
        {loading ? (
          <div className='flex items-center justify-center py-20'>
            <div className='border-muted-foreground size-6 animate-spin rounded-full border-2 border-t-transparent' />
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className='py-20'>
              <p className='text-muted-foreground text-center text-sm'>
                No activity found
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className='space-y-1.5'>
            {filtered.map((event) => {
              const config = typeConfig[event.type] || typeConfig.task;
              const Icon = config.icon;
              const isExpanded = expandedId === event.id;

              return (
                <Card
                  key={event.id}
                  className='hover:bg-accent/50 cursor-pointer py-0 transition-colors'
                  onClick={() => setExpandedId(isExpanded ? null : event.id)}
                >
                  <CardContent className='px-4 py-3'>
                    <div className='flex items-start gap-3'>
                      {/* Icon */}
                      <div className={`mt-0.5 shrink-0 ${config.color}`}>
                        <Icon className='size-4' />
                      </div>

                      {/* Content */}
                      <div className='min-w-0 flex-1'>
                        <div className='flex items-start justify-between gap-2'>
                          <div className='min-w-0 flex-1'>
                            <p
                              className={`text-sm font-medium ${isExpanded ? '' : 'truncate'}`}
                            >
                              {event.title}
                            </p>
                            {isExpanded &&
                              event.description !== event.title && (
                                <p className='text-muted-foreground mt-1 text-sm break-words whitespace-pre-wrap'>
                                  {event.description}
                                </p>
                              )}
                          </div>
                          <span className='text-muted-foreground shrink-0 text-xs'>
                            {timeAgo(event.timestamp)}
                          </span>
                        </div>

                        {/* Tags */}
                        <div className='mt-1.5 flex flex-wrap items-center gap-1.5'>
                          <Badge
                            variant='outline'
                            className={`py-0 text-[10px] ${config.badgeClass}`}
                          >
                            {config.label.replace(/s$/, '')}
                          </Badge>
                          {event.source && (
                            <Badge
                              variant='outline'
                              className='py-0 text-[10px] opacity-60'
                            >
                              {event.source.length > 30
                                ? event.source.substring(0, 30) + '…'
                                : event.source}
                            </Badge>
                          )}
                          {event.project && (
                            <Badge
                              variant='outline'
                              className={`py-0 text-[10px] ${projectColors[event.project] || ''}`}
                            >
                              {event.project}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </PageContainer>
  );
}

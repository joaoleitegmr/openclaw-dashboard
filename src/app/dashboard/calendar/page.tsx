'use client';

import { useEffect, useState, useMemo } from 'react';
import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';

interface CalendarEvent {
  title: string;
  start: string;
  type: string;
  status: string;
  schedule: string;
  isOneTime: boolean;
}

interface CronJob {
  id: string;
  name: string;
  enabled: boolean;
  schedule: {
    kind: string;
    expr?: string;
    at?: string;
    tz?: string;
    everyMs?: number;
  };
  state?: {
    lastStatus?: string;
    nextRunAtMs?: number;
  };
}

// Expand a cron job into calendar events for a given year/month
function expandCronForMonth(
  job: CronJob,
  year: number,
  month: number
): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const sched = job.schedule;
  if (!sched) return events;

  // "at" type — one-time scheduled
  if (sched.kind === 'at' && sched.at) {
    const d = new Date(sched.at);
    if (d.getFullYear() === year && d.getMonth() === month) {
      events.push({
        title: job.name,
        start: sched.at,
        type: 'scheduled',
        status: job.enabled ? 'scheduled' : 'disabled',
        schedule: '',
        isOneTime: true
      });
    }
    return events;
  }

  // "cron" type — expand the expression
  if (sched.kind === 'cron' && sched.expr) {
    const parts = sched.expr.trim().split(/\s+/);
    if (parts.length < 5) return events;
    const [minP, hourP, domP, monP, dowP] = parts;

    // Check if month matches
    if (monP !== '*') {
      const months = expandField(monP, 1, 12);
      if (!months.includes(month + 1)) return events;
    }

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const mins = expandField(minP, 0, 59);
    const hours = expandField(hourP, 0, 23);
    const doms = domP === '*' ? null : expandField(domP, 1, 31);
    const dows =
      dowP === '*'
        ? null
        : expandField(dowP, 0, 7).map((d) => (d === 7 ? 0 : d));

    for (let day = 1; day <= daysInMonth; day++) {
      const dayOfWeek = new Date(year, month, day).getDay();

      // Check day-of-month
      if (doms && !doms.includes(day)) continue;
      // Check day-of-week
      if (dows && !dows.includes(dayOfWeek)) continue;

      // Use first hour/min combo for display
      const h = hours[0] ?? 0;
      const m = mins[0] ?? 0;
      const d = new Date(year, month, day, h, m);

      const isSpecificDate = monP !== '*' && domP !== '*';

      events.push({
        title: job.name,
        start: d.toISOString(),
        type: 'cron',
        status: job.enabled ? 'scheduled' : 'disabled',
        schedule: sched.expr,
        isOneTime: isSpecificDate
      });
    }
    return events;
  }

  // "every" type — show on every day of the month
  if (sched.kind === 'every' && sched.everyMs) {
    // Only show if interval is >= daily, otherwise too noisy
    if (sched.everyMs >= 86400000) {
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const intervalDays = sched.everyMs / 86400000;
      for (let day = 1; day <= daysInMonth; day += intervalDays) {
        const d = new Date(year, month, Math.floor(day));
        events.push({
          title: job.name,
          start: d.toISOString(),
          type: 'cron',
          status: job.enabled ? 'scheduled' : 'disabled',
          schedule: `every ${intervalDays}d`,
          isOneTime: false
        });
      }
    }
  }

  return events;
}

// Expand a cron field like "1,3,5" or "1-5" or "*/2" or "*"
function expandField(field: string, min: number, max: number): number[] {
  const results: number[] = [];
  const parts = field.split(',');
  for (const part of parts) {
    if (part.includes('/')) {
      const [range, stepStr] = part.split('/');
      const step = parseInt(stepStr);
      const start = range === '*' ? min : parseInt(range);
      for (let i = start; i <= max; i += step) results.push(i);
    } else if (part.includes('-')) {
      const [a, b] = part.split('-').map(Number);
      for (let i = a; i <= b; i++) results.push(i);
    } else if (part === '*') {
      for (let i = min; i <= max; i++) results.push(i);
    } else {
      results.push(parseInt(part));
    }
  }
  return results;
}

function parseCronToHuman(schedule: string): { time: string; tag: string } {
  if (!schedule) return { time: '-', tag: '' };
  const parts = schedule.trim().split(/\s+/);
  if (parts.length < 5) return { time: schedule, tag: '' };
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
    time = schedule;
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
  } else if (dom !== '*' && mon !== '*') {
    tag = 'One-time';
  } else if (dom !== '*' && mon === '*') {
    tag = 'Monthly';
  }
  return { time, tag };
}

function isDaily(schedule: string): boolean {
  if (!schedule) return false;
  const parts = schedule.trim().split(/\s+/);
  if (parts.length < 5) return false;
  const [, , dom, mon, dow] = parts;
  return dom === '*' && mon === '*' && dow === '*';
}

function formatScheduleHuman(ev: CalendarEvent): string {
  if (ev.isOneTime || ev.type === 'scheduled') {
    const d = new Date(ev.start);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  const parsed = parseCronToHuman(ev.schedule);
  return parsed.tag ? `${parsed.time} · ${parsed.tag}` : parsed.time;
}

export default function CalendarPage() {
  const [cronJobs, setCronJobs] = useState<CronJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetch('/api/openclaw/cron')
      .then((r) => r.json())
      .then((data) => {
        setCronJobs(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = currentDate.toLocaleString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  // Generate all events for this month from cron jobs
  const events = useMemo(() => {
    return cronJobs
      .filter((j) => j.enabled)
      .flatMap((job) => expandCronForMonth(job, year, month));
  }, [cronJobs, year, month]);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter((e) => e.start?.startsWith(dateStr));
  };

  const handleDayClick = (day: number) => {
    const dayEvents = getEventsForDay(day);
    if (dayEvents.length > 0) {
      setSelectedDay(day);
      setModalOpen(true);
    }
  };

  const selectedDayEvents = selectedDay ? getEventsForDay(selectedDay) : [];

  // "All Events" — only non-daily (specific dates, one-time, weekly, monthly)
  const specialEvents = events
    .filter(
      (ev) => !isDaily(ev.schedule) || ev.isOneTime || ev.type === 'scheduled'
    )
    .filter(
      (ev, i, arr) =>
        arr.findIndex(
          (e) =>
            e.title === ev.title &&
            e.start.split('T')[0] === ev.start.split('T')[0]
        ) === i
    )
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-4'>
        <h2 className='text-2xl font-bold tracking-tight'>Calendar</h2>

        {loading ? (
          <div className='flex items-center justify-center py-20'>
            <div className='border-muted-foreground size-6 animate-spin rounded-full border-2 border-t-transparent' />
          </div>
        ) : (
          <Card>
            <CardHeader className='flex-row items-center justify-between'>
              <CardTitle>{monthName}</CardTitle>
              <div className='flex items-center gap-2'>
                <Button
                  variant='outline'
                  size='icon'
                  className='size-8'
                  onClick={prevMonth}
                >
                  <IconChevronLeft className='size-4' />
                </Button>
                <Button
                  variant='outline'
                  size='icon'
                  className='size-8'
                  onClick={nextMonth}
                >
                  <IconChevronRight className='size-4' />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-7 gap-px'>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                  <div
                    key={d}
                    className='text-muted-foreground p-2 text-center text-xs font-medium'
                  >
                    {d}
                  </div>
                ))}
                {days.map((day, i) => {
                  const dayEvents = day ? getEventsForDay(day) : [];
                  const isToday =
                    day &&
                    new Date().getDate() === day &&
                    new Date().getMonth() === month &&
                    new Date().getFullYear() === year;
                  const hasEvents = dayEvents.length > 0;
                  return (
                    <div
                      key={i}
                      className={`border-border min-h-[80px] rounded border p-1 ${
                        day ? 'bg-card' : 'bg-muted/30'
                      } ${isToday ? 'ring-primary ring-1' : ''} ${hasEvents ? 'hover:bg-muted/50 cursor-pointer' : ''}`}
                      onClick={() => day && hasEvents && handleDayClick(day)}
                    >
                      {day && (
                        <>
                          <span
                            className={`text-xs ${isToday ? 'text-primary font-bold' : 'text-muted-foreground'}`}
                          >
                            {day}
                          </span>
                          <div className='mt-1 space-y-0.5'>
                            {dayEvents.map((ev, j) => (
                              <div
                                key={j}
                                className={`truncate rounded px-1 text-[10px] ${
                                  ev.isOneTime || ev.type === 'scheduled'
                                    ? 'bg-green-500/20 text-green-400'
                                    : 'bg-blue-500/20 text-blue-400'
                                }`}
                                title={ev.title}
                              >
                                {ev.title}
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Events — non-daily only */}
        {specialEvents.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>All Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='divide-y'>
                {specialEvents.map((ev, i) => (
                  <div
                    key={i}
                    className='flex items-center justify-between py-2'
                  >
                    <div className='flex items-center gap-3'>
                      <div
                        className={`size-2 rounded-full ${ev.isOneTime || ev.type === 'scheduled' ? 'bg-green-400' : 'bg-blue-400'}`}
                      />
                      <div>
                        <p className='text-sm font-medium'>{ev.title}</p>
                        <p className='text-muted-foreground text-xs'>
                          {formatScheduleHuman(ev)}
                        </p>
                      </div>
                    </div>
                    <Badge
                      className={`text-[10px] ${ev.isOneTime || ev.type === 'scheduled' ? 'border-green-500/30 bg-green-500/20 text-green-400' : 'border-blue-500/30 bg-blue-500/20 text-blue-400'}`}
                      variant='outline'
                    >
                      {ev.isOneTime || ev.type === 'scheduled'
                        ? 'Scheduled'
                        : parseCronToHuman(ev.schedule).tag || 'Recurring'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Day Events Modal */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className='max-w-md'>
            <DialogHeader>
              <DialogTitle>
                {selectedDay &&
                  new Date(year, month, selectedDay).toLocaleString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
              </DialogTitle>
              <DialogDescription>
                {selectedDayEvents.length} event
                {selectedDayEvents.length !== 1 ? 's' : ''} on this day
              </DialogDescription>
            </DialogHeader>
            <div className='max-h-[400px] space-y-0 overflow-y-auto'>
              {[...selectedDayEvents]
                .sort(
                  (a, b) =>
                    new Date(a.start).getTime() - new Date(b.start).getTime()
                )
                .map((ev, i) => {
                  const isGreen = ev.isOneTime || ev.type === 'scheduled';
                  const time = new Date(ev.start).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  });
                  const tag = parseCronToHuman(ev.schedule).tag;
                  return (
                    <div key={i} className='flex gap-3 py-2'>
                      {/* Time column */}
                      <div className='w-16 shrink-0 text-right'>
                        <span className='text-muted-foreground font-mono text-xs'>
                          {time}
                        </span>
                      </div>
                      {/* Timeline dot + line */}
                      <div className='flex flex-col items-center'>
                        <div
                          className={`mt-1.5 size-2 shrink-0 rounded-full ${isGreen ? 'bg-green-400' : 'bg-blue-400'}`}
                        />
                        {i < selectedDayEvents.length - 1 && (
                          <div className='bg-border mt-1 w-px flex-1' />
                        )}
                      </div>
                      {/* Event card */}
                      <div
                        className={`flex-1 rounded-lg border p-2.5 ${isGreen ? 'border-green-500/30' : 'border-blue-500/30'}`}
                      >
                        <div className='flex items-center justify-between'>
                          <p className='text-sm font-medium'>{ev.title}</p>
                          <Badge
                            className={`text-[10px] ${isGreen ? 'border-green-500/30 bg-green-500/20 text-green-400' : 'border-blue-500/30 bg-blue-500/20 text-blue-400'}`}
                            variant='outline'
                          >
                            {isGreen ? 'One-time' : tag || 'Daily'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </PageContainer>
  );
}

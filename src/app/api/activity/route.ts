import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const OPENCLAW_API =
  process.env.OPENCLAW_API_URL || 'http://localhost:3001/api';

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

interface CronJob {
  id: string;
  name: string;
  enabled: boolean;
  state?: {
    lastRunAtMs?: number;
    lastStatus?: string;
    lastDurationMs?: number;
  };
}

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  module?: string;
}

interface StatusData {
  uptime: number;
  uptimeFormatted: string;
  memUsed: number;
  memTotal: number;
  memPercent: number;
  diskUsed: string;
  diskTotal: string;
  diskPercent: number;
  cpuLoad1: number;
  cpuCores: number;
  openclawStatus: string;
  nodeVersion: string;
}

interface ActivityItem {
  date: string;
  time: string;
  text: string;
  type: string;
  source: string;
}

export async function GET() {
  try {
    // Fetch from all sources in parallel
    const [activityRes, cronRes, logsRes, statusRes] = await Promise.allSettled(
      [
        fetch(`${OPENCLAW_API}/activity`).then((r) => r.json()),
        fetch(`${OPENCLAW_API}/cron`).then((r) => r.json()),
        fetch(`${OPENCLAW_API}/logs`).then((r) => r.json()),
        fetch(`${OPENCLAW_API}/status`).then((r) => r.json())
      ]
    );

    const activityData: ActivityItem[] =
      activityRes.status === 'fulfilled' ? activityRes.value : [];
    const cronData: CronJob[] =
      cronRes.status === 'fulfilled' ? cronRes.value : [];
    const logsData: LogEntry[] =
      logsRes.status === 'fulfilled' ? logsRes.value : [];
    const statusData: StatusData | null =
      statusRes.status === 'fulfilled' ? statusRes.value : null;

    const events: ActivityEvent[] = [];
    let counter = 0;

    // Process activity items → type: 'task'
    for (const item of activityData) {
      const ts =
        item.date && item.time
          ? `${item.date}T${item.time.padStart(5, '0')}:00.000Z`
          : item.date
            ? `${item.date}T00:00:00.000Z`
            : new Date().toISOString();

      events.push({
        id: `activity-${counter++}`,
        timestamp: ts,
        type: 'task',
        title:
          item.text.length > 80 ? item.text.substring(0, 80) + '…' : item.text,
        description: item.text,
        source: item.source ? `memory/${item.source}` : 'activity',
        level: 'info'
      });
    }

    // Process cron jobs → type: 'cron'
    for (const job of cronData) {
      if (job.state?.lastRunAtMs) {
        const ts = new Date(job.state.lastRunAtMs).toISOString();
        const status = job.state.lastStatus || 'unknown';
        const duration = job.state.lastDurationMs
          ? `${(job.state.lastDurationMs / 1000).toFixed(1)}s`
          : '';

        events.push({
          id: `cron-${counter++}`,
          timestamp: ts,
          type: 'cron',
          title: `Cron: ${job.name}`,
          description: `Status: ${status}${duration ? ` (${duration})` : ''}${!job.enabled ? ' [disabled]' : ''}`,
          source: `cron:${job.name}`,
          level: status === 'error' ? 'error' : 'info'
        });
      }
    }

    // Process logs → filtered
    for (const log of logsData) {
      if (log.level === 'debug') continue;

      const msg = log.message || '';

      if (log.level === 'error') {
        const title = msg.length > 100 ? msg.substring(0, 100) + '…' : msg;
        events.push({
          id: `log-${counter++}`,
          timestamp: log.timestamp,
          type: 'error',
          title,
          description: msg,
          source: 'system',
          level: 'error'
        });
      } else if (log.level === 'info') {
        if (msg.includes('starting provider')) {
          events.push({
            id: `log-${counter++}`,
            timestamp: log.timestamp,
            type: 'system',
            title: 'System Restart',
            description: msg,
            source: 'system',
            level: 'info'
          });
        } else if (msg.includes('webchat connected')) {
          events.push({
            id: `log-${counter++}`,
            timestamp: log.timestamp,
            type: 'session',
            title: 'Webchat Session Connected',
            description: msg,
            source: 'system',
            level: 'info'
          });
        }
      }
    }

    // Status → single system event
    if (statusData) {
      events.push({
        id: `status-${counter++}`,
        timestamp: new Date().toISOString(),
        type: 'system',
        title: 'System Status',
        description: `Uptime: ${statusData.uptimeFormatted} | CPU: ${statusData.cpuLoad1}/${statusData.cpuCores} cores | Memory: ${statusData.memUsed}/${statusData.memTotal}MB (${statusData.memPercent}%) | Disk: ${statusData.diskUsed}/${statusData.diskTotal} (${statusData.diskPercent}%)`,
        source: 'system',
        level: 'info'
      });
    }

    // Sort by timestamp descending
    events.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Limit to 200
    const limited = events.slice(0, 200);

    return NextResponse.json(limited);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to aggregate activity', details: String(error) },
      { status: 500 }
    );
  }
}

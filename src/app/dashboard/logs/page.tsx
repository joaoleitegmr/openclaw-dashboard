'use client';

import { useEffect, useState } from 'react';
import PageContainer from '@/components/layout/page-container';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  module: string;
}

const levelColors: Record<
  string,
  {
    variant: 'default' | 'secondary' | 'outline' | 'destructive';
    className: string;
  }
> = {
  error: { variant: 'destructive', className: '' },
  warn: { variant: 'outline', className: 'border-yellow-500 text-yellow-500' },
  info: { variant: 'secondary', className: '' },
  debug: { variant: 'outline', className: 'text-muted-foreground' }
};

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('');

  useEffect(() => {
    fetch('/api/openclaw/logs')
      .then((r) => r.json())
      .then((data) => {
        setLogs(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = logs.filter((log) => {
    if (levelFilter && log.level !== levelFilter) return false;
    if (search && !log.message?.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-center justify-between'>
          <h2 className='text-2xl font-bold tracking-tight'>Logs</h2>
          <span className='text-muted-foreground text-sm'>
            {filtered.length} entries
          </span>
        </div>

        <div className='flex flex-wrap items-center gap-3'>
          <Input
            placeholder='Search logs...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='max-w-xs'
          />
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className='bg-background border-input h-9 rounded-md border px-3 text-sm outline-none'
          >
            <option value=''>All levels</option>
            <option value='error'>Error</option>
            <option value='warn'>Warn</option>
            <option value='info'>Info</option>
            <option value='debug'>Debug</option>
          </select>
        </div>

        <Card>
          <CardContent className='p-0'>
            {loading ? (
              <div className='flex items-center justify-center py-20'>
                <div className='border-muted-foreground size-6 animate-spin rounded-full border-2 border-t-transparent' />
              </div>
            ) : filtered.length === 0 ? (
              <p className='text-muted-foreground py-20 text-center text-sm'>
                No logs found
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='w-[180px]'>Timestamp</TableHead>
                    <TableHead className='w-[80px]'>Level</TableHead>
                    <TableHead className='w-[120px]'>Module</TableHead>
                    <TableHead>Message</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((log, i) => {
                    const lc = levelColors[log.level] || levelColors.info;
                    return (
                      <TableRow key={i}>
                        <TableCell className='text-muted-foreground font-mono text-xs'>
                          {log.timestamp}
                        </TableCell>
                        <TableCell>
                          <Badge variant={lc.variant} className={lc.className}>
                            {log.level}
                          </Badge>
                        </TableCell>
                        <TableCell className='text-xs'>
                          {log.module || '-'}
                        </TableCell>
                        <TableCell className='max-w-lg truncate font-mono text-sm text-xs'>
                          {log.message}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}

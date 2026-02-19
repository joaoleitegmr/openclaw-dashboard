'use client';

import { useEffect, useState } from 'react';
import PageContainer from '@/components/layout/page-container';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  IconSettings,
  IconPalette,
  IconBell,
  IconShield,
  IconServer
} from '@tabler/icons-react';

const API = 'http://localhost:3001/api';

interface StatusData {
  uptimeFormatted: string;
  nodeVersion: string;
  openclawStatus: string;
  memUsed: number;
  memTotal: number;
  diskUsed: string;
  diskTotal: string;
}

export default function SettingsPage() {
  const [status, setStatus] = useState<StatusData | null>(null);

  useEffect(() => {
    fetch(`${API}/status`)
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => {});
  }, []);

  return (
    <PageContainer
      pageTitle='Settings'
      pageDescription='Dashboard and system settings'
    >
      <div className='space-y-6'>
        <Card>
          <CardHeader>
            <div className='flex items-center gap-2'>
              <IconPalette className='size-5 text-purple-500' />
              <div>
                <CardTitle className='text-base'>Appearance</CardTitle>
                <CardDescription>Theme and display settings</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className='space-y-3 text-sm'>
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground'>Theme</span>
              <Badge variant='outline'>System / Auto</Badge>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground'>Sidebar</span>
              <Badge variant='outline'>Collapsible</Badge>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground'>Dashboard Port</span>
              <span className='font-mono'>3100</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className='flex items-center gap-2'>
              <IconServer className='size-5 text-green-500' />
              <div>
                <CardTitle className='text-base'>System Info</CardTitle>
                <CardDescription>Runtime and hardware details</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className='space-y-3 text-sm'>
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground'>Uptime</span>
              <span className='font-medium'>
                {status?.uptimeFormatted || '—'}
              </span>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground'>Node.js</span>
              <span className='font-mono'>{status?.nodeVersion || '—'}</span>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground'>Memory</span>
              <span className='font-mono'>
                {status?.memUsed || 0}MB / {status?.memTotal || 0}MB
              </span>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground'>Disk</span>
              <span className='font-mono'>
                {status?.diskUsed || '—'} / {status?.diskTotal || '—'}
              </span>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground'>Agent Status</span>
              <Badge
                variant={
                  status?.openclawStatus === 'active'
                    ? 'default'
                    : 'destructive'
                }
              >
                {status?.openclawStatus || 'unknown'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className='flex items-center gap-2'>
              <IconBell className='size-5 text-amber-500' />
              <div>
                <CardTitle className='text-base'>Notifications</CardTitle>
                <CardDescription>Alert preferences</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className='space-y-3 text-sm'>
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground'>Delivery Channel</span>
              <Badge variant='outline'>Telegram</Badge>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground'>Cron Notifications</span>
              <Badge variant='default'>Enabled</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className='flex items-center gap-2'>
              <IconShield className='size-5 text-red-500' />
              <div>
                <CardTitle className='text-base'>Security</CardTitle>
                <CardDescription>Access control settings</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className='space-y-3 text-sm'>
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground'>Cloudflare Access</span>
              <Badge variant='default'>Enabled</Badge>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground'>Auth Provider</span>
              <Badge variant='outline'>Google SSO</Badge>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground'>Allowed Email</span>
              <span className='font-mono text-xs'>
                user@example.com
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}

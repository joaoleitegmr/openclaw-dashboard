'use client';

import { useEffect, useState } from 'react';
import PageContainer from '@/components/layout/page-container';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { IconPlugConnected } from '@tabler/icons-react';
import Image from 'next/image';

interface Account {
  platform: string;
  icon: string;
  handle: string;
  status: string;
  permissions: string;
  connected: string;
  lastActivity: string;
}

const PLATFORM_LOGOS: Record<string, string> = {
  Telegram:
    'https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg',
  Gmail:
    'https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg',
  'Google Calendar':
    'https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg',
  'Google Drive':
    'https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg',
  'Twitter/X':
    'https://upload.wikimedia.org/wikipedia/commons/c/ce/X_logo_2023.svg',
  Cloudflare:
    'https://upload.wikimedia.org/wikipedia/commons/4/4b/Cloudflare_Logo.svg'
};

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/openclaw/accounts')
      .then((r) => r.json())
      .then((data) => {
        setAccounts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-center justify-between'>
          <h2 className='text-2xl font-bold tracking-tight'>
            Connected Accounts
          </h2>
          <span className='text-muted-foreground text-sm'>
            {
              accounts.filter(
                (a) => a.status === 'connected' || a.status === 'active'
              ).length
            }{' '}
            connected
          </span>
        </div>

        {loading ? (
          <div className='flex items-center justify-center py-20'>
            <div className='border-muted-foreground size-6 animate-spin rounded-full border-2 border-t-transparent' />
          </div>
        ) : accounts.length === 0 ? (
          <Card>
            <CardContent className='flex flex-col items-center justify-center py-20'>
              <IconPlugConnected className='text-muted-foreground size-10' />
              <p className='text-muted-foreground mt-3 text-sm'>
                No connected accounts
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className='grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3'>
            {accounts.map((account) => (
              <Card
                key={account.platform + account.handle}
                className='hover:border-primary/20 transition-colors'
              >
                <CardHeader className='pb-2'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                      {PLATFORM_LOGOS[account.platform] ? (
                        <div className='flex size-8 items-center justify-center'>
                          <Image
                            src={PLATFORM_LOGOS[account.platform]}
                            alt={account.platform}
                            width={28}
                            height={28}
                            className='object-contain'
                            unoptimized
                          />
                        </div>
                      ) : (
                        <span className='text-xl'>{account.icon}</span>
                      )}
                      <div>
                        <CardTitle className='text-base'>
                          {account.platform}
                        </CardTitle>
                        <CardDescription className='text-xs'>
                          {account.handle}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge
                      variant={
                        account.status === 'connected' ||
                        account.status === 'active'
                          ? 'default'
                          : 'secondary'
                      }
                    >
                      {account.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className='space-y-1.5'>
                    {account.permissions && (
                      <div className='flex justify-between text-xs'>
                        <span className='text-muted-foreground'>
                          Permissions
                        </span>
                        <span>{account.permissions}</span>
                      </div>
                    )}
                    {account.connected && (
                      <div className='flex justify-between text-xs'>
                        <span className='text-muted-foreground'>Connected</span>
                        <span>{account.connected}</span>
                      </div>
                    )}
                    {account.lastActivity && (
                      <div className='flex justify-between text-xs'>
                        <span className='text-muted-foreground'>
                          Last Activity
                        </span>
                        <span>{account.lastActivity}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { IconKey, IconCoins } from '@tabler/icons-react';
import { Progress } from '@/components/ui/progress';

interface ApiKey {
  name: string;
  key: string;
  status: string;
  type: string;
  hasBalance: boolean;
  plan: string;
  limits: string;
}

interface Balance {
  data: {
    total_credits: number;
    total_usage: number;
  };
}

function maskKey(key: string) {
  if (!key || key.length < 8) return key || '-';
  return key.slice(0, 4) + '••••••••' + key.slice(-4);
}

export default function ApisPage() {
  const [apis, setApis] = useState<ApiKey[]>([]);
  const [balance, setBalance] = useState<Balance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/openclaw/apis').then((r) => r.json()),
      fetch('/api/openclaw/balance')
        .then((r) => r.json())
        .catch(() => null)
    ])
      .then(([apisData, balanceData]) => {
        setApis(Array.isArray(apisData) ? apisData : []);
        setBalance(balanceData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const credits = balance?.data?.total_credits || 0;
  const used = balance?.data?.total_usage || 0;
  const remaining = credits - used;
  const usagePercent = credits > 0 ? (used / credits) * 100 : 0;

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-4'>
        <h2 className='text-2xl font-bold tracking-tight'>API Keys</h2>

        {loading ? (
          <div className='flex items-center justify-center py-20'>
            <div className='border-muted-foreground size-6 animate-spin rounded-full border-2 border-t-transparent' />
          </div>
        ) : (
          <>
            {/* Balance Card */}
            {balance?.data && (
              <Card>
                <CardHeader className='pb-2'>
                  <CardDescription className='flex items-center gap-2'>
                    <IconCoins className='size-4' />
                    OpenRouter Balance
                  </CardDescription>
                  <CardTitle className='text-2xl'>
                    ${remaining.toFixed(2)}
                    <span className='text-muted-foreground ml-2 text-sm font-normal'>
                      remaining
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Progress value={usagePercent} className='h-2' />
                  <div className='mt-1 flex justify-between'>
                    <p className='text-muted-foreground text-xs'>
                      ${used.toFixed(2)} used
                    </p>
                    <p className='text-muted-foreground text-xs'>
                      ${credits.toFixed(2)} total credits
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* API Keys Table */}
            <Card>
              <CardContent className='p-0'>
                {apis.length === 0 ? (
                  <div className='flex flex-col items-center justify-center py-20'>
                    <IconKey className='text-muted-foreground size-10' />
                    <p className='text-muted-foreground mt-3 text-sm'>
                      No API keys configured
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Key</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead>Limits</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {apis.map((api) => (
                        <TableRow key={api.name}>
                          <TableCell className='text-sm font-medium'>
                            {api.name}
                          </TableCell>
                          <TableCell className='text-muted-foreground font-mono text-xs'>
                            {maskKey(api.key)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                api.status === 'active'
                                  ? 'default'
                                  : 'secondary'
                              }
                            >
                              {api.status || 'unknown'}
                            </Badge>
                          </TableCell>
                          <TableCell className='text-sm'>
                            {api.type || '-'}
                          </TableCell>
                          <TableCell className='text-sm'>
                            {api.plan || '-'}
                          </TableCell>
                          <TableCell className='text-muted-foreground text-xs'>
                            {api.limits || '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </PageContainer>
  );
}

'use client';

import { useEffect, useState, useMemo } from 'react';
import PageContainer from '@/components/layout/page-container';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { IconActivity, IconCoins, IconBolt } from '@tabler/icons-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';

interface UsageData {
  totalTokens: number;
  totalCost: number;
  totalRuns: number;
  modelUsage: Record<
    string,
    {
      tokens: number;
      cost: number;
      runs: number;
      input: number;
      output: number;
      cacheRead: number;
      cacheWrite: number;
    }
  >;
  dailyUsage: Record<
    string,
    {
      tokens: number;
      cost: number;
      runs: number;
    }
  >;
}

type Period = '7d' | '30d' | 'all';

export default function UsagePage() {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>('7d');

  useEffect(() => {
    fetch('/api/openclaw/usage')
      .then((r) => r.json())
      .then((data) => {
        setUsage(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const modelEntries = usage?.modelUsage
    ? Object.entries(usage.modelUsage).sort((a, b) => b[1].cost - a[1].cost)
    : [];

  const allDailyEntries = usage?.dailyUsage
    ? Object.entries(usage.dailyUsage).sort((a, b) => a[0].localeCompare(b[0]))
    : [];

  const filteredDaily = useMemo(() => {
    if (period === 'all') return allDailyEntries;
    const days = period === '7d' ? 7 : 30;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const cutoffStr = cutoff.toISOString().split('T')[0];
    return allDailyEntries.filter(([date]) => date >= cutoffStr);
  }, [allDailyEntries, period]);

  const chartData = filteredDaily.map(([date, data]) => ({
    date: date.slice(5), // MM-DD
    cost: parseFloat(data.cost.toFixed(4)),
    tokens: Math.round(data.tokens / 1000),
    runs: data.runs
  }));

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-6'>
        <h2 className='text-2xl font-bold tracking-tight'>Usage</h2>

        {loading ? (
          <div className='flex items-center justify-center py-20'>
            <div className='border-muted-foreground size-6 animate-spin rounded-full border-2 border-t-transparent' />
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
              <Card>
                <CardHeader className='pb-2'>
                  <CardDescription className='flex items-center gap-2'>
                    <IconActivity className='size-4' />
                    Total Tokens
                  </CardDescription>
                  <CardTitle className='text-2xl'>
                    {usage?.totalTokens
                      ? (usage.totalTokens / 1000000).toFixed(2) + 'M'
                      : '0'}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className='pb-2'>
                  <CardDescription className='flex items-center gap-2'>
                    <IconCoins className='size-4' />
                    Total Cost
                  </CardDescription>
                  <CardTitle className='text-2xl'>
                    ${usage?.totalCost?.toFixed(2) || '0.00'}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className='pb-2'>
                  <CardDescription className='flex items-center gap-2'>
                    <IconBolt className='size-4' />
                    Total Runs
                  </CardDescription>
                  <CardTitle className='text-2xl'>
                    {usage?.totalRuns?.toLocaleString() || '0'}
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>

            {/* Chart */}
            {allDailyEntries.length > 0 && (
              <Card>
                <CardHeader>
                  <div className='flex items-center justify-between'>
                    <CardTitle className='text-base'>Daily Cost</CardTitle>
                    <div className='flex gap-1'>
                      {(['7d', '30d', 'all'] as Period[]).map((p) => (
                        <Button
                          key={p}
                          variant={period === p ? 'default' : 'outline'}
                          size='sm'
                          className='h-7 text-xs'
                          onClick={() => setPeriod(p)}
                        >
                          {p === '7d'
                            ? '7 Days'
                            : p === '30d'
                              ? '30 Days'
                              : 'All Time'}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className='h-[250px] w-full'>
                    <ResponsiveContainer width='100%' height='100%'>
                      <BarChart data={chartData}>
                        <CartesianGrid
                          strokeDasharray='3 3'
                          className='stroke-muted'
                        />
                        <XAxis
                          dataKey='date'
                          className='text-xs'
                          tick={{ fontSize: 11 }}
                        />
                        <YAxis
                          tick={{ fontSize: 11 }}
                          tickFormatter={(v) => `$${v}`}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                          labelStyle={{ color: 'hsl(var(--foreground))' }}
                          formatter={(value: number) => [
                            `$${value.toFixed(4)}`,
                            'Cost'
                          ]}
                        />
                        <Bar
                          dataKey='cost'
                          fill='hsl(var(--primary))'
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Model Breakdown */}
            {modelEntries.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className='text-base'>Model Breakdown</CardTitle>
                </CardHeader>
                <CardContent className='p-0'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Model</TableHead>
                        <TableHead className='text-right'>Tokens</TableHead>
                        <TableHead className='text-right'>Input</TableHead>
                        <TableHead className='text-right'>Output</TableHead>
                        <TableHead className='text-right'>Cache Read</TableHead>
                        <TableHead className='text-right'>Cost</TableHead>
                        <TableHead className='text-right'>Runs</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {modelEntries.map(([model, data]) => (
                        <TableRow key={model}>
                          <TableCell className='text-sm font-medium'>
                            {model}
                          </TableCell>
                          <TableCell className='text-right text-sm'>
                            {(data.tokens / 1000).toFixed(1)}K
                          </TableCell>
                          <TableCell className='text-right text-sm'>
                            {(data.input / 1000).toFixed(1)}K
                          </TableCell>
                          <TableCell className='text-right text-sm'>
                            {(data.output / 1000).toFixed(1)}K
                          </TableCell>
                          <TableCell className='text-right text-sm'>
                            {(data.cacheRead / 1000).toFixed(1)}K
                          </TableCell>
                          <TableCell className='text-right text-sm font-medium'>
                            ${data.cost.toFixed(4)}
                          </TableCell>
                          <TableCell className='text-right text-sm'>
                            {data.runs}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {/* Daily Usage Table */}
            {filteredDaily.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className='text-base'>Daily Usage</CardTitle>
                </CardHeader>
                <CardContent className='p-0'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead className='text-right'>Tokens</TableHead>
                        <TableHead className='text-right'>Cost</TableHead>
                        <TableHead className='text-right'>Runs</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[...filteredDaily].reverse().map(([date, data]) => (
                        <TableRow key={date}>
                          <TableCell className='text-sm'>{date}</TableCell>
                          <TableCell className='text-right text-sm'>
                            {(data.tokens / 1000).toFixed(1)}K
                          </TableCell>
                          <TableCell className='text-right text-sm'>
                            ${data.cost.toFixed(4)}
                          </TableCell>
                          <TableCell className='text-right text-sm'>
                            {data.runs}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </PageContainer>
  );
}

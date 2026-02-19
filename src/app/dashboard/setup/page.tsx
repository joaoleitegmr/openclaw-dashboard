'use client';

import { useEffect, useState } from 'react';
import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  IconServer,
  IconBrain,
  IconBolt,
  IconCloudComputing,
  IconMessage,
  IconShield,
  IconRocket
} from '@tabler/icons-react';

interface Model {
  id: string;
  name: string;
  provider: string;
  role: string;
  active: boolean;
  context: number;
}

interface StatusData {
  memTotal: number;
  diskTotal: number;
  cpuCores: number;
  nodeVersion: string;
  openclawStatus: string;
  uptimeFormatted?: string;
}

interface ConfigData {
  agentName?: string;
  timezone?: string;
  channel?: string;
  [key: string]: unknown;
}

export default function SetupPage() {
  const [models, setModels] = useState<Model[]>([]);
  const [status, setStatus] = useState<StatusData | null>(null);
  const [config, setConfig] = useState<ConfigData | null>(null);
  const [skills, setSkills] = useState<{ name: string; active: boolean }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      try {
        const [modRes, stRes, cfgRes, skRes] = await Promise.all([
          fetch('/api/openclaw/models'),
          fetch('/api/openclaw/status'),
          fetch('/api/openclaw/config').catch(() => null),
          fetch('/api/openclaw/skills').catch(() => null)
        ]);
        const modData = await modRes.json();
        setModels(Array.isArray(modData) ? modData : []);
        setStatus(await stRes.json());
        if (cfgRes && cfgRes.ok) setConfig(await cfgRes.json());
        if (skRes && skRes.ok) {
          const skData = await skRes.json();
          setSkills(Array.isArray(skData) ? skData : []);
        }
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  const getModel = (role: string) =>
    models.find((m) => m.role?.toLowerCase() === role);

  if (loading) {
    return (
      <PageContainer>
        <div className='flex flex-1 flex-col space-y-4'>
          <h2 className='text-2xl font-bold tracking-tight'>Setup</h2>
          <div className='flex items-center justify-center py-20'>
            <div className='border-muted-foreground size-6 animate-spin rounded-full border-2 border-t-transparent' />
          </div>
        </div>
      </PageContainer>
    );
  }

  const primary = getModel('primary');
  const fallback = getModel('fallback');
  const subagent = getModel('subagent');
  const embedding = getModel('embedding');
  const activeSkills = skills.filter((s) => s.active).length;

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-3'>
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-xl font-bold tracking-tight'>Setup ⚙️</h2>
            <p className='text-muted-foreground text-xs'>
              OpenClaw · System Configuration
            </p>
          </div>
          <Badge variant='default' className='text-xs'>
            <IconBolt className='mr-1 size-3' />
            {status?.openclawStatus || 'unknown'}
          </Badge>
        </div>

        {/* Row 1: Identity + Infrastructure + System */}
        <div className='grid grid-cols-1 gap-3 md:grid-cols-3'>
          <Card className='p-0'>
            <CardHeader className='p-3 pb-2'>
              <CardTitle className='flex items-center gap-1.5 text-sm'>
                <IconRocket className='size-3.5' /> Agent
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-1 p-3 pt-0'>
              <Row label='Platform' value='OpenClaw' />
              <Row
                label='Timezone'
                value={
                  config?.timezone ||
                  Intl.DateTimeFormat().resolvedOptions().timeZone
                }
              />
              <Row label='Channel' value={config?.channel || 'N/A'} />
              <Row label='Uptime' value={status?.uptimeFormatted || 'N/A'} />
              <Row label='Skills' value={`${activeSkills} active`} />
            </CardContent>
          </Card>

          <Card className='p-0'>
            <CardHeader className='p-3 pb-2'>
              <CardTitle className='flex items-center gap-1.5 text-sm'>
                <IconServer className='size-3.5' /> Infrastructure
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-1 p-3 pt-0'>
              <Row label='OS' value='Linux x64' />
              <Row
                label='CPU / RAM'
                value={`${status?.cpuCores || '?'}c · ${((status?.memTotal || 0) / 1024 / 1024 / 1024).toFixed(1)}GB`}
              />
              <Row
                label='Runtime'
                value={`Node ${status?.nodeVersion || '?'}`}
              />
              <Row label='Dashboard' value='Next.js + shadcn' />
            </CardContent>
          </Card>

          <Card className='p-0'>
            <CardHeader className='p-3 pb-2'>
              <CardTitle className='flex items-center gap-1.5 text-sm'>
                <IconCloudComputing className='size-3.5' /> Network
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-1 p-3 pt-0'>
              <Row
                label='API'
                value={
                  process.env.NEXT_PUBLIC_OPENCLAW_API_URL || 'localhost:3001'
                }
              />
              <Row label='Dashboard Port' value='3100' />
              <Row label='Status' value={status?.openclawStatus || 'unknown'} />
            </CardContent>
          </Card>
        </div>

        {/* Row 2: Models + Security */}
        <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
          <Card className='p-0'>
            <CardHeader className='p-3 pb-2'>
              <CardTitle className='flex items-center gap-1.5 text-sm'>
                <IconBrain className='size-3.5' /> Models
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-1 p-3 pt-0'>
              <Row label='🎯 Primary' value={primary?.name || '-'} />
              <Row label='🔄 Fallback' value={fallback?.name || '-'} />
              <Row label='🤖 Sub-Agent' value={subagent?.name || '-'} />
              <Row label='📐 Embedding' value={embedding?.name || '-'} />
            </CardContent>
          </Card>

          <Card className='p-0'>
            <CardHeader className='p-3 pb-2'>
              <CardTitle className='flex items-center gap-1.5 text-sm'>
                <IconShield className='size-3.5' /> Security
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-1 p-3 pt-0'>
              <Row label='Auth' value='Configurable' />
              <Row label='API Access' value='Proxy via Next.js' />
              <Row label='SSL' value='Recommended' />
            </CardContent>
          </Card>
        </div>

        {/* Row 3: Smart Optimizations */}
        <Card className='p-0'>
          <CardHeader className='p-3 pb-2'>
            <CardTitle className='flex items-center gap-1.5 text-sm'>
              <IconBolt className='size-3.5 text-yellow-500' /> Smart Optimizations
            </CardTitle>
          </CardHeader>
          <CardContent className='p-3 pt-0'>
            <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
              <div className='space-y-2'>
                <h4 className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>💰 Cost Efficiency</h4>
                <div className='space-y-1.5'>
                  <OptRow
                    title='Multi-tier model routing'
                    desc='MiniMax M2.5 for everyday ($0.20/M) → Sonnet for fallback → Opus for heavy research (free via Max)'
                    tag='~95% cost reduction'
                    tagColor='green'
                  />
                  <OptRow
                    title='Free embeddings'
                    desc='Gemini free tier for memory search embeddings — zero cost for semantic recall'
                    tag='$0/mo'
                    tagColor='green'
                  />
                  <OptRow
                    title='Free web search'
                    desc='Brave Search API — 2,000 queries/month on free tier'
                    tag='$0/mo'
                    tagColor='green'
                  />
                  <OptRow
                    title='Sub-agent routing'
                    desc='Cron jobs & sub-agents use MiniMax M2.5 — cheapest model for background tasks'
                    tag='Automated'
                    tagColor='blue'
                  />
                </div>
              </div>
              <div className='space-y-2'>
                <h4 className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>⚡ Reliability & Performance</h4>
                <div className='space-y-1.5'>
                  <OptRow
                    title='Context pruning'
                    desc='cache-ttl mode (2h) with safeguard compaction — prevents context overflow crashes'
                    tag='Auto'
                    tagColor='blue'
                  />
                  <OptRow
                    title='Auto-restart on crash'
                    desc='systemd service with Restart=always — recovers from any failure automatically'
                    tag='Resilient'
                    tagColor='blue'
                  />
                  <OptRow
                    title='Cloudflare Access'
                    desc='Dashboard behind Cloudflare Tunnel + Google login — zero exposed ports'
                    tag='Secure'
                    tagColor='purple'
                  />
                  <OptRow
                    title='Fallback chain'
                    desc='If primary model fails → automatic fallback to Sonnet 4.5 → keeps responding'
                    tag='99.9%'
                    tagColor='green'
                  />
                </div>
              </div>
            </div>
            <div className='mt-3 rounded-md bg-muted/50 p-2'>
              <p className='text-[10px] text-muted-foreground text-center'>
                💡 <span className='font-medium'>Estimated monthly cost:</span> ~$2-5 for daily use (vs. $50-100+ with a single premium model) · 
                Opus available free for complex tasks via Anthropic Max subscription
              </p>
            </div>
          </CardContent>
        </Card>

        <p className='text-muted-foreground text-center text-[10px]'>
          OpenClaw Dashboard · Built with OpenClaw
        </p>
      </div>
    </PageContainer>
  );
}

function OptRow({
  title,
  desc,
  tag,
  tagColor = 'blue'
}: {
  title: string;
  desc: string;
  tag: string;
  tagColor?: 'green' | 'blue' | 'purple';
}) {
  const colors = {
    green: 'bg-green-500/10 text-green-600 dark:text-green-400',
    blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
  };
  return (
    <div className='flex items-start justify-between gap-2 rounded-md border border-border/50 p-2'>
      <div className='min-w-0 flex-1'>
        <p className='text-xs font-medium'>{title}</p>
        <p className='text-[10px] text-muted-foreground leading-relaxed'>{desc}</p>
      </div>
      <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${colors[tagColor]}`}>
        {tag}
      </span>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className='flex items-center justify-between text-xs'>
      <span className='text-muted-foreground'>{label}</span>
      <span className='ml-2 truncate text-right font-medium'>{value}</span>
    </div>
  );
}

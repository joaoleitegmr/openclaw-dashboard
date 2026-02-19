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
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { IconCpu, IconEdit, IconCheck } from '@tabler/icons-react';

interface Model {
  id: string;
  name: string;
  provider: string;
  type: string;
  context: number;
  cost: number;
  active: boolean;
  role: string;
}

const ROLE_PAIRS = [
  ['primary', 'fallback'],
  ['subagent', 'embedding']
];
const ROLE_LABELS: Record<string, string> = {
  primary: '🎯 Primary',
  fallback: '🔄 Fallback',
  subagent: '🤖 Sub-Agent',
  embedding: '📐 Embedding'
};
const ROLE_DESCRIPTIONS: Record<string, string> = {
  primary: 'Main model for conversations',
  fallback: 'When primary is unavailable',
  subagent: 'Background tasks & cron',
  embedding: 'Memory & semantic search'
};

export default function ModelsPage() {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [editModelId, setEditModelId] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/openclaw/models')
      .then((r) => r.json())
      .then((data) => {
        setModels(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const groupedModels: Record<string, Model> = {};
  const otherModels: Model[] = [];
  for (const model of models) {
    const role = model.role?.toLowerCase();
    if (
      role &&
      ['primary', 'fallback', 'subagent', 'embedding'].includes(role)
    ) {
      groupedModels[role] = model;
    } else {
      otherModels.push(model);
    }
  }

  const handleEdit = (role: string, currentModelId: string) => {
    setEditingRole(role);
    setEditModelId(currentModelId);
  };

  const handleSave = async () => {
    if (!editingRole) return;
    setSaving(true);
    try {
      await fetch('/api/openclaw/models', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ role: editingRole, modelId: editModelId })
      });
      const res = await fetch('/api/openclaw/models');
      const data = await res.json();
      setModels(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Failed to save model:', e);
    } finally {
      setSaving(false);
      setEditingRole(null);
    }
  };

  const renderModelCard = (role: string) => {
    const model = groupedModels[role];
    if (!model) {
      return (
        <Card className='flex-1 opacity-50'>
          <CardHeader className='pb-2'>
            <div className='flex items-center justify-between'>
              <CardTitle className='text-base'>{ROLE_LABELS[role]}</CardTitle>
              <Badge variant='secondary'>Not set</Badge>
            </div>
            <CardDescription className='text-xs'>
              {ROLE_DESCRIPTIONS[role]}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className='text-muted-foreground text-xs'>No model assigned</p>
          </CardContent>
        </Card>
      );
    }
    return (
      <Card className='hover:border-primary/20 flex-1 transition-colors'>
        <CardHeader className='pb-2'>
          <div className='flex items-start justify-between'>
            <div className='min-w-0 flex-1'>
              <CardTitle className='text-base'>{ROLE_LABELS[role]}</CardTitle>
              <CardDescription className='mt-0.5 text-xs'>
                {ROLE_DESCRIPTIONS[role]}
              </CardDescription>
            </div>
            <div className='flex items-center gap-2'>
              <Badge variant={model.active ? 'default' : 'secondary'}>
                {model.active ? 'Active' : 'Inactive'}
              </Badge>
              <Button
                variant='ghost'
                size='icon'
                className='size-7'
                onClick={() => handleEdit(role, model.id || model.name)}
              >
                <IconEdit className='size-3.5' />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className='truncate text-sm font-medium'>{model.name}</p>
          <div className='text-muted-foreground mt-1 flex items-center gap-3 text-xs'>
            <span>{model.provider}</span>
            {model.context > 0 && (
              <span>{(model.context / 1000).toFixed(0)}K ctx</span>
            )}
            {model.cost > 0 && <span>${model.cost}/MTok</span>}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <PageContainer>
        <div className='flex flex-1 flex-col space-y-4'>
          <h2 className='text-2xl font-bold tracking-tight'>Models</h2>
          <div className='flex items-center justify-center py-20'>
            <div className='border-muted-foreground size-6 animate-spin rounded-full border-2 border-t-transparent' />
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-6'>
        <div className='flex items-center justify-between'>
          <h2 className='text-2xl font-bold tracking-tight'>Models</h2>
          <span className='text-muted-foreground text-sm'>
            {models.length} configured
          </span>
        </div>

        {models.length === 0 ? (
          <Card>
            <CardContent className='flex flex-col items-center justify-center py-20'>
              <IconCpu className='text-muted-foreground size-10' />
              <p className='text-muted-foreground mt-3 text-sm'>
                No models configured
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {ROLE_PAIRS.map((pair, idx) => (
              <div key={idx} className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                {pair.map((role) => (
                  <div key={role}>{renderModelCard(role)}</div>
                ))}
              </div>
            ))}

            {otherModels.length > 0 && (
              <div className='space-y-3'>
                <h3 className='text-lg font-semibold'>Other Models</h3>
                <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
                  {otherModels.map((model) => (
                    <Card
                      key={model.id || model.name}
                      className='hover:border-primary/20 transition-colors'
                    >
                      <CardHeader className='pb-2'>
                        <div className='flex items-start justify-between'>
                          <CardTitle className='truncate text-base'>
                            {model.name}
                          </CardTitle>
                          <Badge
                            variant={model.active ? 'default' : 'secondary'}
                          >
                            {model.active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <CardDescription className='text-xs'>
                          {model.provider}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className='text-muted-foreground flex items-center gap-4 text-xs'>
                          {model.context > 0 && (
                            <span>
                              {(model.context / 1000).toFixed(0)}K ctx
                            </span>
                          )}
                          {model.cost > 0 && <span>${model.cost}/MTok</span>}
                          {model.role && (
                            <Badge variant='outline' className='text-[10px]'>
                              {model.role}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Edit Model Dialog with Dropdown */}
        <Dialog
          open={!!editingRole}
          onOpenChange={(open) => !open && setEditingRole(null)}
        >
          <DialogContent className='max-w-md'>
            <DialogHeader>
              <DialogTitle>
                Edit{' '}
                {editingRole ? ROLE_LABELS[editingRole] || editingRole : ''}
              </DialogTitle>
              <DialogDescription>
                Select a model for this role from your available models.
              </DialogDescription>
            </DialogHeader>
            <div className='space-y-4 py-2'>
              <div>
                <label className='text-sm font-medium'>Model</label>
                <Select value={editModelId} onValueChange={setEditModelId}>
                  <SelectTrigger className='mt-1'>
                    <SelectValue placeholder='Select a model...' />
                  </SelectTrigger>
                  <SelectContent>
                    {models.map((m) => (
                      <SelectItem key={m.id || m.name} value={m.id || m.name}>
                        <div className='flex items-center gap-2'>
                          <span>{m.name}</span>
                          <span className='text-muted-foreground text-xs'>
                            ({m.provider})
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant='outline' onClick={() => setEditingRole(null)}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving || !editModelId.trim()}
              >
                <IconCheck className='mr-1 size-4' />
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageContainer>
  );
}

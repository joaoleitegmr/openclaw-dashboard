'use client';

import { useEffect, useState } from 'react';
import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import {
  IconFolder,
  IconExternalLink,
  IconCalendar,
  IconCode,
  IconServer
} from '@tabler/icons-react';

interface ProjectLink {
  label: string;
  url: string;
}

interface Project {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'completed';
  description: string;
  stack: string[];
  path: string;
  startDate: string;
  details: string;
  links: ProjectLink[];
}

const statusConfig: Record<string, { label: string; className: string }> = {
  active: {
    label: 'Active',
    className:
      'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
  },
  paused: {
    label: 'Paused',
    className:
      'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20'
  },
  completed: {
    label: 'Completed',
    className:
      'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20'
  }
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Project | null>(null);

  useEffect(() => {
    fetch('/api/projects')
      .then((r) => r.json())
      .then((data) => {
        setProjects(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-6'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Projects</h2>
          <p className='text-muted-foreground text-sm'>
            {projects.length} project{projects.length !== 1 ? 's' : ''} tracked
          </p>
        </div>

        {loading ? (
          <div className='flex items-center justify-center py-20'>
            <div className='border-muted-foreground size-6 animate-spin rounded-full border-2 border-t-transparent' />
          </div>
        ) : projects.length === 0 ? (
          <p className='text-muted-foreground py-20 text-center text-sm'>
            No projects found
          </p>
        ) : (
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            {projects.map((project) => {
              const status =
                statusConfig[project.status] || statusConfig.active;
              return (
                <Card
                  key={project.id}
                  className='hover:border-primary/30 cursor-pointer transition-all hover:shadow-md'
                  onClick={() => setSelected(project)}
                >
                  <CardHeader className='pb-3'>
                    <div className='flex items-start justify-between gap-2'>
                      <div className='flex items-center gap-2'>
                        <IconFolder className='text-muted-foreground size-5 shrink-0' />
                        <CardTitle className='text-base'>
                          {project.name}
                        </CardTitle>
                      </div>
                      <Badge variant='outline' className={status.className}>
                        {status.label}
                      </Badge>
                    </div>
                    <p className='text-muted-foreground mt-1 line-clamp-2 text-sm'>
                      {project.description}
                    </p>
                  </CardHeader>
                  <CardContent className='pt-0'>
                    <div className='mb-3 flex flex-wrap gap-1.5'>
                      {project.stack.map((tech) => (
                        <Badge
                          key={tech}
                          variant='secondary'
                          className='text-xs font-normal'
                        >
                          {tech}
                        </Badge>
                      ))}
                    </div>
                    <div className='text-muted-foreground flex items-center gap-1 text-xs'>
                      <IconCalendar className='size-3' />
                      Started {project.startDate}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Detail Dialog */}
        <Dialog
          open={!!selected}
          onOpenChange={(open) => !open && setSelected(null)}
        >
          {selected && (
            <DialogContent className='sm:max-w-xl'>
              <DialogHeader>
                <div className='flex items-center gap-3'>
                  <IconFolder className='text-primary size-6' />
                  <div>
                    <DialogTitle className='text-xl'>
                      {selected.name}
                    </DialogTitle>
                    <DialogDescription className='mt-1'>
                      {selected.description}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className='mt-2 space-y-4'>
                {/* Status */}
                <div className='flex items-center gap-2'>
                  <span className='text-muted-foreground text-sm font-medium'>
                    Status:
                  </span>
                  <Badge
                    variant='outline'
                    className={
                      (statusConfig[selected.status] || statusConfig.active)
                        .className
                    }
                  >
                    {
                      (statusConfig[selected.status] || statusConfig.active)
                        .label
                    }
                  </Badge>
                </div>

                {/* Details */}
                <div>
                  <p className='text-sm leading-relaxed'>{selected.details}</p>
                </div>

                {/* Stack */}
                <div>
                  <div className='mb-2 flex items-center gap-1.5'>
                    <IconCode className='text-muted-foreground size-4' />
                    <span className='text-muted-foreground text-sm font-medium'>
                      Tech Stack
                    </span>
                  </div>
                  <div className='flex flex-wrap gap-1.5'>
                    {selected.stack.map((tech) => (
                      <Badge key={tech} variant='secondary'>
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Path */}
                <div className='flex items-center gap-2'>
                  <IconServer className='text-muted-foreground size-4 shrink-0' />
                  <span className='text-muted-foreground text-sm font-medium'>
                    Path:
                  </span>
                  <code className='bg-muted rounded px-2 py-0.5 text-xs'>
                    {selected.path}
                  </code>
                </div>

                {/* Start Date */}
                <div className='flex items-center gap-2'>
                  <IconCalendar className='text-muted-foreground size-4' />
                  <span className='text-muted-foreground text-sm font-medium'>
                    Started:
                  </span>
                  <span className='text-sm'>{selected.startDate}</span>
                </div>

                {/* Links */}
                {selected.links && selected.links.length > 0 && (
                  <div className='flex flex-wrap gap-2 pt-1'>
                    {selected.links.map((link, i) => (
                      <a
                        key={i}
                        href={link.url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors'
                      >
                        <IconExternalLink className='size-3.5' />
                        {link.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </DialogContent>
          )}
        </Dialog>
      </div>
    </PageContainer>
  );
}

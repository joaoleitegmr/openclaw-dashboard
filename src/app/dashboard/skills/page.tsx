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
import { IconWand, IconChevronDown, IconChevronUp } from '@tabler/icons-react';

interface Skill {
  name: string;
  description: string;
  path: string;
  active: boolean;
}

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInactive, setShowInactive] = useState(false);

  useEffect(() => {
    fetch('/api/openclaw/skills')
      .then((r) => r.json())
      .then((data) => {
        setSkills(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const activeSkills = skills.filter((s) => s.active);
  const inactiveSkills = skills.filter((s) => !s.active);

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-center justify-between'>
          <h2 className='text-2xl font-bold tracking-tight'>Skills</h2>
          <span className='text-muted-foreground text-sm'>
            {activeSkills.length} active
          </span>
        </div>

        {loading ? (
          <div className='flex items-center justify-center py-20'>
            <div className='border-muted-foreground size-6 animate-spin rounded-full border-2 border-t-transparent' />
          </div>
        ) : activeSkills.length === 0 && inactiveSkills.length === 0 ? (
          <Card>
            <CardContent className='flex flex-col items-center justify-center py-20'>
              <IconWand className='text-muted-foreground size-10' />
              <p className='text-muted-foreground mt-3 text-sm'>
                No skills configured
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Active Skills */}
            {activeSkills.length > 0 && (
              <div className='grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3'>
                {activeSkills.map((skill) => (
                  <Card
                    key={skill.name}
                    className='hover:border-primary/20 transition-colors'
                  >
                    <CardHeader className='pb-2'>
                      <div className='flex items-center justify-between'>
                        <CardTitle className='text-base'>
                          {skill.name}
                        </CardTitle>
                        <Badge variant='default'>Active</Badge>
                      </div>
                      <CardDescription className='text-xs'>
                        {skill.description || 'No description'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className='text-muted-foreground truncate font-mono text-xs'>
                        {skill.path}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Available (Inactive) Skills - Collapsible */}
            {inactiveSkills.length > 0 && (
              <div className='space-y-3'>
                <Button
                  variant='ghost'
                  className='text-muted-foreground hover:text-foreground flex items-center gap-2'
                  onClick={() => setShowInactive(!showInactive)}
                >
                  {showInactive ? (
                    <IconChevronUp className='size-4' />
                  ) : (
                    <IconChevronDown className='size-4' />
                  )}
                  Available Skills ({inactiveSkills.length})
                </Button>

                {showInactive && (
                  <div className='grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3'>
                    {inactiveSkills.map((skill) => (
                      <Card
                        key={skill.name}
                        className='opacity-60 transition-opacity hover:opacity-100'
                      >
                        <CardHeader className='pb-2'>
                          <div className='flex items-center justify-between'>
                            <CardTitle className='text-base'>
                              {skill.name}
                            </CardTitle>
                            <Badge variant='secondary'>Available</Badge>
                          </div>
                          <CardDescription className='text-xs'>
                            {skill.description || 'No description'}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className='text-muted-foreground truncate font-mono text-xs'>
                            {skill.path}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </PageContainer>
  );
}

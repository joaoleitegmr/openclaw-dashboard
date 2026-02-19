'use client';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail
} from '@/components/ui/sidebar';
import { navItems } from '@/config/nav-config';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';
import { Icons } from '../icons';
import { IconBolt } from '@tabler/icons-react';

const groups = [
  { label: 'Main', items: ['Overview', 'Projects', 'Activity', 'Calendar'] },
  {
    label: 'System',
    items: ['Models', 'Cron Jobs', 'Skills', 'Logs', 'Usage', 'Setup']
  },
  { label: 'Data', items: ['Memory', 'Config Files'] },
  { label: 'Management', items: ['Expenses', 'API Keys', 'Accounts'] }
];

export default function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible='icon'>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent'
            >
              <div className='flex aspect-square size-8 items-center justify-center rounded-lg overflow-hidden'>
                <img src='/openclaw-logo.svg' alt='OpenClaw' className='size-full object-cover' />
              </div>
              <div className='grid flex-1 text-left text-sm leading-tight'>
                <span className='truncate font-semibold'>OpenClaw</span>
                <span className='text-muted-foreground truncate text-xs'>
                  Dashboard
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className='overflow-x-hidden'>
        {groups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarMenu>
              {group.items.map((itemTitle) => {
                const item = navItems.find((n) => n.title === itemTitle);
                if (!item) return null;
                const Icon = item.icon ? Icons[item.icon] : Icons.logo;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      isActive={pathname === item.url}
                    >
                      <Link href={item.url}>
                        {Icon && <Icon />}
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size='sm'>
              <div className='grid flex-1 text-left text-sm leading-tight'>
                <span className='text-muted-foreground truncate text-xs'>
                  OpenClaw Dashboard
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

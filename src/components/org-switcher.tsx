'use client';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar';
import Image from 'next/image';

export function OrgSwitcher() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size='lg'
          className='data-[state=open]:bg-sidebar-accent'
        >
          <div className='flex aspect-square size-8 items-center justify-center rounded-lg overflow-hidden'>
            <Image src='/openclaw-logo.svg' alt='OpenClaw' width={32} height={32} className='object-cover' />
          </div>
          <div className='grid flex-1 text-left text-sm leading-tight'>
            <span className='truncate font-semibold'>OpenClaw</span>
            <span className='text-muted-foreground truncate text-xs'>
              Intelligence Dashboard
            </span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

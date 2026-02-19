import { NavItem } from '@/types';

export const navItems: NavItem[] = [
  // Main
  {
    title: 'Overview',
    url: '/dashboard/overview',
    icon: 'dashboard',
    isActive: false,
    shortcut: ['d', 'd'],
    items: []
  },
  {
    title: 'Activity',
    url: '/dashboard/activity',
    icon: 'activity',
    shortcut: ['a', 'f'],
    isActive: false,
    items: []
  },
  {
    title: 'Calendar',
    url: '/dashboard/calendar',
    icon: 'calendar',
    shortcut: ['c', 'a'],
    isActive: false,
    items: []
  },
  // System
  {
    title: 'Models',
    url: '/dashboard/models',
    icon: 'robot',
    shortcut: ['m', 'o'],
    isActive: false,
    items: []
  },
  {
    title: 'Cron Jobs',
    url: '/dashboard/cron',
    icon: 'clock',
    shortcut: ['c', 'r'],
    isActive: false,
    items: []
  },
  {
    title: 'Skills',
    url: '/dashboard/skills',
    icon: 'skills',
    shortcut: ['s', 'k'],
    isActive: false,
    items: []
  },
  {
    title: 'Logs',
    url: '/dashboard/logs',
    icon: 'logs',
    shortcut: ['l', 'o'],
    isActive: false,
    items: []
  },
  {
    title: 'Usage',
    url: '/dashboard/usage',
    icon: 'chart',
    shortcut: ['u', 's'],
    isActive: false,
    items: []
  },
  {
    title: 'Setup',
    url: '/dashboard/setup',
    icon: 'settings',
    shortcut: ['s', 'u'],
    isActive: false,
    items: []
  },
  // Data
  {
    title: 'Memory',
    url: '/dashboard/memory',
    icon: 'brain',
    shortcut: ['m', 'e'],
    isActive: false,
    items: []
  },
  {
    title: 'Config Files',
    url: '/dashboard/config',
    icon: 'fileCode',
    shortcut: ['c', 'f'],
    isActive: false,
    items: []
  },
  {
    title: 'Projects',
    url: '/dashboard/projects',
    icon: 'workspace',
    shortcut: ['p', 'p'],
    isActive: false,
    items: []
  },
  // Management
  {
    title: 'Expenses',
    url: '/dashboard/expenses',
    icon: 'receipt',
    shortcut: ['e', 'x'],
    isActive: false,
    items: []
  },
  {
    title: 'API Keys',
    url: '/dashboard/apis',
    icon: 'key',
    shortcut: ['a', 'k'],
    isActive: false,
    items: []
  },
  {
    title: 'Accounts',
    url: '/dashboard/accounts',
    icon: 'plugConnected',
    shortcut: ['a', 'c'],
    isActive: false,
    items: []
  }
];

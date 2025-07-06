'use client';

import {
  UserGroupIcon,
  HomeIcon,
  DocumentDuplicateIcon,
  CameraIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';

import Link from 'next/link';

import { usePathname } from 'next/navigation';  

import clsx from 'clsx';

// Map of links to display in the side navigation.
// Depending on the size of the application, this would be stored in a database.
const links = [
  { name: 'Home', href: '/dashboard', icon: HomeIcon },
  { name: 'Fatture', href: '/dashboard/invoices',  icon: DocumentDuplicateIcon },
  { name: 'Pazienti', href: '/dashboard/pazienti', icon: UserGroupIcon },
  { name: 'VisualMotion+', href: '/dashboard/visual-motion+', icon: CameraIcon },
  { name: 'Calendario', href: '/dashboard/calendar', icon: CalendarIcon },
  { name: 'Chat', href: '/dashboard/chat', icon: ChatBubbleLeftRightIcon },
  { name: 'Incassi', href: '/dashboard/earnings', icon: CurrencyDollarIcon },
];

export default function NavLinks() {
  const pathname = usePathname();
  return (
    <>
      {links.map((link) => {
        const LinkIcon = link.icon;
        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx('flex h-[48px] grow items-center justify-center gap-2 rounded-md p-3 text-sm font-medium md:flex-none md:justify-start md:p-2 md:px-3',
              {
                'bg-brand-main text-white': pathname === link.href,
                'hover:bg-brand-background hover:text-brand-main hover:font-semibold': pathname !== link.href,
              }
            )}
          >
            <LinkIcon className="w-6" />
            <p className="hidden md:block">{link.name}</p>
          </Link>
        );
      })}
    </>
  );
}

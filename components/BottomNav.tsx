'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();
  const isWatchPage = pathname.startsWith('/watch');
  const isAdminPage = pathname.startsWith('/admin') || pathname.startsWith('/add-');
  
  if (isWatchPage || isAdminPage) return null;

  const navItems = [
    { href: '/', icon: 'home', label: 'Home' },
    { href: '/genres', icon: 'genre', label: 'Genres' },
    { href: '/favorites', icon: 'favorites', label: 'My List' },
    { href: '/search', icon: 'search', label: 'Search' },
  ];

  const getIcon = (icon: string, isActive: boolean) => {
    const color = isActive ? 'text-[#e50914]' : 'text-gray-400';
    switch (icon) {
      case 'home':
        return (
          <svg className={`w-6 h-6 ${color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        );
      case 'genre':
        return (
          <svg className={`w-6 h-6 ${color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        );
      case 'favorites':
        return (
          <svg className={`w-6 h-6 ${color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        );
      case 'search':
        return (
          <svg className={`w-6 h-6 ${color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        );
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#141414]/95 backdrop-blur-sm border-t border-white/10 md:hidden z-50 safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = item.href === '/' ? pathname === '/' : pathname === item.href || pathname.includes(item.href.slice(1));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${
                isActive ? 'text-[#e50914]' : 'text-gray-400'
              }`}
            >
              {getIcon(item.icon, isActive)}
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FiCompass, FiBook, FiCalendar } from 'react-icons/fi';

const navItems = [
  { label: 'Home', href: '/', icon: FiCompass },
  { label: 'Recipes', href: '/recipes', icon: FiBook },
  { label: 'Meal Planner', href: '/mealplanner', icon: FiCalendar },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/') return router.pathname === '/' || router.pathname === '/home';
    return router.pathname.startsWith(href);
  };

  return (
    <div className="h-screen flex bg-cream text-warm-500 overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static z-50 w-60 h-screen flex flex-col border-r border-warm-100 bg-white transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="px-6 py-5 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white font-bold text-sm">K</div>
          <span className="font-serif text-xl font-semibold">Kulinar</span>
        </div>
        <nav className="flex-1 px-3 space-y-1 text-sm">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg ${active ? 'bg-warm-50 text-accent font-medium' : 'text-warm-400 hover:bg-warm-50'}`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-warm-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-warm-50 flex items-center justify-center text-sm font-medium text-warm-400">U</div>
          <div className="text-sm leading-tight">
            <div className="font-medium">Home Chef</div>
            <div className="text-xs text-warm-300">Cook with joy</div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto h-screen">
        {/* Topbar */}
        <div className="sticky top-0 z-10 bg-cream/90 backdrop-blur px-4 md:px-8 py-4 flex items-center gap-4 border-b border-warm-100">
          <button className="lg:hidden p-2 rounded-lg hover:bg-warm-50" onClick={() => setSidebarOpen(true)}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <div className="flex-1" />
          <Link href="/recipes" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover">
            + New Recipe
          </Link>
        </div>
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
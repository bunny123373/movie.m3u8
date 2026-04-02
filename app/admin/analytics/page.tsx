'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface AnalyticsData {
  totalViews: number;
  uniqueVisitors: number;
  avgWatchTime: number;
  bounceRate: number;
  viewsByDay: { date: string; views: number }[];
  topContent: { id: string; title: string; views: number }[];
  topCountries: { country: string; views: number }[];
  deviceStats: { device: string; views: number }[];
}

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { href: '/admin/users', label: 'Users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
  { href: '/admin/sources', label: 'Sources', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
  { href: '/admin/settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
  { href: '/admin/homepage', label: 'Homepage', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { href: '/admin/analytics', label: 'Analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { href: '/admin/logs', label: 'Logs', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { href: '/admin/import', label: 'Import', icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12' },
];

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  async function fetchAnalytics() {
    setLoading(true);
    try {
      const res = await fetch(`/api/analytics?period=${period}`);
      if (res.ok) {
        const analyticsData = await res.json();
        setData(analyticsData);
      } else {
        setData(generateMockData());
      }
    } catch {
      setData(generateMockData());
    } finally {
      setLoading(false);
    }
  }

  function generateMockData(): AnalyticsData {
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const viewsByDay = Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
      return {
        date: date.toISOString().split('T')[0],
        views: Math.floor(Math.random() * 5000) + 1000,
      };
    });

    return {
      totalViews: viewsByDay.reduce((sum, d) => sum + d.views, 0),
      uniqueVisitors: Math.floor(viewsByDay.reduce((sum, d) => sum + d.views, 0) * 0.6),
      avgWatchTime: Math.floor(Math.random() * 60) + 30,
      bounceRate: Math.floor(Math.random() * 30) + 20,
      viewsByDay,
      topContent: [
        { id: '1', title: 'Inception', views: 12500 },
        { id: '2', title: 'The Dark Knight', views: 10200 },
        { id: '3', title: 'Interstellar', views: 9800 },
        { id: '4', title: 'Breaking Bad', views: 8500 },
        { id: '5', title: 'Stranger Things', views: 7200 },
      ],
      topCountries: [
        { country: 'United States', views: 45000 },
        { country: 'United Kingdom', views: 12000 },
        { country: 'Canada', views: 8500 },
        { country: 'Germany', views: 6200 },
        { country: 'Australia', views: 5100 },
      ],
      deviceStats: [
        { device: 'Desktop', views: 45000 },
        { device: 'Mobile', views: 35000 },
        { device: 'Tablet', views: 8000 },
      ],
    };
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const maxViews = data ? Math.max(...data.viewsByDay.map(d => d.views)) : 1;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f13]">
        <div className="flex">
          <aside className="w-64 bg-[#18181b] border-r border-zinc-800 h-screen fixed left-0 top-0 p-4">
            <div className="h-8 bg-zinc-800 rounded animate-pulse mb-8" />
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-10 bg-zinc-800/50 rounded animate-pulse mb-2" />
            ))}
          </aside>
          <main className="ml-64 flex-1 p-8">
            <div className="grid grid-cols-4 gap-4 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-[#18181b] rounded-2xl animate-pulse" />
              ))}
            </div>
            <div className="h-80 bg-[#18181b] rounded-2xl animate-pulse" />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f13]">
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-[#18181b] border border-zinc-800 rounded-lg lg:hidden"
      >
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <aside className={`fixed top-0 left-0 h-full bg-[#18181b] border-r border-zinc-800 w-64 p-4 z-40 transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.4 10.6C16.55 8.99 14.15 8 11.99 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z"/>
            </svg>
          </div>
          <span className="text-xl font-bold text-white">StreamGrid</span>
        </div>
        
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                item.href === '/admin/analytics'
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
              </svg>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Back to Site
          </Link>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <main className="lg:ml-64 min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Analytics</h1>
              <p className="text-zinc-500 mt-1 text-sm">Track your platform performance</p>
            </div>
            <div className="flex gap-2">
              {(['7d', '30d', '90d'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1.5 text-sm rounded-xl transition-all ${
                    period === p
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                      : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'
                  }`}
                >
                  {p === '7d' ? '7 Days' : p === '30d' ? '30 Days' : '90 Days'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-[#18181b] border border-zinc-800 p-5 rounded-2xl hover:border-zinc-700 transition-all group">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-cyan-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-white">{formatNumber(data?.totalViews || 0)}</p>
              <p className="text-sm text-zinc-500 mt-1">Total Views</p>
            </div>
            <div className="bg-[#18181b] border border-zinc-800 p-5 rounded-2xl hover:border-zinc-700 transition-all group">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-white">{formatNumber(data?.uniqueVisitors || 0)}</p>
              <p className="text-sm text-zinc-500 mt-1">Unique Visitors</p>
            </div>
            <div className="bg-[#18181b] border border-zinc-800 p-5 rounded-2xl hover:border-zinc-700 transition-all group">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-white">{data?.avgWatchTime || 0}m</p>
              <p className="text-sm text-zinc-500 mt-1">Avg Watch Time</p>
            </div>
            <div className="bg-[#18181b] border border-zinc-800 p-5 rounded-2xl hover:border-zinc-700 transition-all group">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-white">{data?.bounceRate || 0}%</p>
              <p className="text-sm text-zinc-500 mt-1">Bounce Rate</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 bg-[#18181b] border border-zinc-800 p-6 rounded-2xl">
              <h2 className="text-lg font-semibold text-white mb-4">Views Over Time</h2>
              <div className="h-48 sm:h-64 flex items-end gap-1 sm:gap-2">
                {data?.viewsByDay.map((day, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-gradient-to-t from-cyan-500 to-blue-500 rounded-t transition-all hover:from-cyan-400 hover:to-blue-400"
                      style={{ height: `${(day.views / maxViews) * 100}%` }}
                      title={`${day.views.toLocaleString()} views`}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#18181b] border border-zinc-800 p-6 rounded-2xl">
              <h2 className="text-lg font-semibold text-white mb-4">Top Content</h2>
              <div className="space-y-3">
                {data?.topContent.map((item, i) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <span className="text-lg font-bold text-zinc-600 w-6">#{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{item.title}</p>
                      <div className="h-1.5 bg-zinc-800 rounded-full mt-1 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                          style={{ width: `${(item.views / (data.topContent[0]?.views || 1)) * 100}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-xs text-zinc-500">{formatNumber(item.views)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-[#18181b] border border-zinc-800 p-6 rounded-2xl">
              <h2 className="text-lg font-semibold text-white mb-4">Top Countries</h2>
              <div className="space-y-3">
                {data?.topCountries.map((item, i) => (
                  <div key={item.country} className="flex items-center gap-3">
                    <span className="text-xs">🌍</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{item.country}</p>
                      <div className="h-1.5 bg-zinc-800 rounded-full mt-1 overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: `${(item.views / (data.topCountries[0]?.views || 1)) * 100}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-xs text-zinc-500">{formatNumber(item.views)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#18181b] border border-zinc-800 p-6 rounded-2xl">
              <h2 className="text-lg font-semibold text-white mb-4">Device Stats</h2>
              <div className="space-y-4">
                {data?.deviceStats.map((item) => (
                  <div key={item.device}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-white">{item.device}</span>
                      <span className="text-zinc-500">{formatNumber(item.views)}</span>
                    </div>
                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                        style={{ width: `${(item.views / (data.deviceStats[0]?.views || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#18181b] border border-zinc-800 p-6 rounded-2xl sm:col-span-2 lg:col-span-1">
              <h2 className="text-lg font-semibold text-white mb-4">Quick Stats</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-zinc-800">
                  <span className="text-zinc-500">Peak Views Today</span>
                  <span className="font-medium text-white">2,450</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-zinc-800">
                  <span className="text-zinc-500">Avg. Session</span>
                  <span className="font-medium text-white">12m 30s</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-zinc-800">
                  <span className="text-zinc-500">Most Active</span>
                  <span className="font-medium text-white">8-11 PM</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-zinc-500">Returning Users</span>
                  <span className="font-medium text-green-400">67%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

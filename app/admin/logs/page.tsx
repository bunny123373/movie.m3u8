'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'success';
  category: string;
  message: string;
  details?: string;
  user?: string;
  ip?: string;
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

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'info' | 'warning' | 'error'>('all');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, [filter, categoryFilter]);

  async function fetchLogs() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') params.set('level', filter);
      if (categoryFilter !== 'all') params.set('category', categoryFilter);
      
      const res = await fetch(`/api/logs?${params}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      } else {
        setLogs(generateMockLogs());
      }
    } catch {
      setLogs(generateMockLogs());
    } finally {
      setLoading(false);
    }
  }

  function generateMockLogs(): LogEntry[] {
    const categories = ['auth', 'content', 'api', 'system', 'user'];
    const levels: ('info' | 'warning' | 'error' | 'success')[] = ['info', 'warning', 'error', 'success'];
    const messages: Record<string, string[]> = {
      auth: ['User logged in', 'Failed login attempt', 'Password reset requested', 'Session expired'],
      content: ['Movie added', 'Series updated', 'Source added', 'Content deleted'],
      api: ['API request received', 'External API call failed', 'Rate limit reached', 'Cache updated'],
      system: ['Server started', 'Backup completed', 'Memory usage high', 'Database connection restored'],
      user: ['Profile updated', 'Settings changed', 'Favorite added', 'Watch history cleared'],
    };

    return Array.from({ length: 50 }, (_, i) => {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const level = levels[Math.floor(Math.random() * levels.length)];
      const messageList = messages[category];
      
      return {
        id: `log-${i}`,
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        level,
        category,
        message: messageList[Math.floor(Math.random() * messageList.length)],
        details: level === 'error' ? 'Error details here...' : undefined,
        user: Math.random() > 0.3 ? `user${Math.floor(Math.random() * 100)}` : undefined,
        ip: Math.random() > 0.5 ? `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}` : undefined,
      };
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  function clearLogs() {
    if (confirm('Clear all logs?')) {
      setLogs([]);
    }
  }

  function exportLogs() {
    const csv = [
      ['Timestamp', 'Level', 'Category', 'Message', 'User', 'IP'].join(','),
      ...logs.map(l => [
        l.timestamp,
        l.level,
        l.category,
        l.message,
        l.user || '',
        l.ip || '',
      ].join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  }

  const filteredLogs = logs.filter(log => 
    (filter === 'all' || log.level === filter) &&
    (categoryFilter === 'all' || log.category === categoryFilter) &&
    (search === '' || log.message.toLowerCase().includes(search.toLowerCase()))
  );

  const categories = ['all', 'auth', 'content', 'api', 'system', 'user'];

  const levelColors = {
    info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    warning: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    error: 'bg-red-500/20 text-red-400 border-red-500/30',
    success: 'bg-green-500/20 text-green-400 border-green-500/30',
  };

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
                <div key={i} className="h-24 bg-[#18181b] rounded-2xl animate-pulse" />
              ))}
            </div>
            <div className="h-96 bg-[#18181b] rounded-2xl animate-pulse" />
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
                item.href === '/admin/logs'
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
              <h1 className="text-2xl sm:text-3xl font-bold text-white">System Logs</h1>
              <p className="text-zinc-500 mt-1 text-sm">View system activity and audit trails</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={exportLogs}
                className="px-4 py-2.5 text-sm font-medium bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-all"
              >
                Export CSV
              </button>
              <button
                onClick={clearLogs}
                className="px-4 py-2.5 text-sm font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 rounded-xl transition-all"
              >
                Clear All
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-[#18181b] border border-zinc-800 p-4 rounded-2xl">
              <p className="text-zinc-500 text-xs">Total Logs</p>
              <p className="text-2xl font-bold text-white mt-1">{logs.length}</p>
            </div>
            <div className="bg-[#18181b] border border-zinc-800 p-4 rounded-2xl">
              <p className="text-zinc-500 text-xs">Errors</p>
              <p className="text-2xl font-bold text-red-400 mt-1">{logs.filter(l => l.level === 'error').length}</p>
            </div>
            <div className="bg-[#18181b] border border-zinc-800 p-4 rounded-2xl">
              <p className="text-zinc-500 text-xs">Warnings</p>
              <p className="text-2xl font-bold text-amber-400 mt-1">{logs.filter(l => l.level === 'warning').length}</p>
            </div>
            <div className="bg-[#18181b] border border-zinc-800 p-4 rounded-2xl">
              <p className="text-zinc-500 text-xs">Last 24h</p>
              <p className="text-2xl font-bold text-cyan-400 mt-1">
                {logs.filter(l => new Date(l.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)).length}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mb-6">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-4 py-2.5 bg-[#18181b] border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Levels</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2.5 bg-[#18181b] border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Search logs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 min-w-[200px] px-4 py-2.5 bg-[#18181b] border border-zinc-800 rounded-xl text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="bg-[#18181b] border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead className="bg-zinc-900/50">
                  <tr>
                    <th className="px-4 sm:px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase">Timestamp</th>
                    <th className="px-4 sm:px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase">Level</th>
                    <th className="px-4 sm:px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase">Category</th>
                    <th className="px-4 sm:px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase">Message</th>
                    <th className="px-4 sm:px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase hidden sm:table-cell">User</th>
                    <th className="px-4 sm:px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase hidden md:table-cell">IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-zinc-500 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <span className={`px-3 py-1.5 text-xs rounded-lg border ${levelColors[log.level]}`}>
                          {log.level}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm">
                        <span className="px-3 py-1.5 bg-zinc-800 text-zinc-400 rounded-lg">{log.category}</span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-sm text-white">{log.message}</td>
                      <td className="px-4 sm:px-6 py-4 text-xs text-zinc-500 hidden sm:table-cell">{log.user || '-'}</td>
                      <td className="px-4 sm:px-6 py-4 text-xs text-zinc-500 hidden md:table-cell">{log.ip || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredLogs.length === 0 && (
              <div className="p-12 text-center text-zinc-500">
                No logs found
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

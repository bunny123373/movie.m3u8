'use client';

import { useState, useEffect } from 'react';
import { AdminSidebar } from '@/components/AdminSidebar';

interface HomeSection {
  id: string;
  title: string;
  enabled: boolean;
  order: number;
}

interface HomeSettings {
  sections: HomeSection[];
  heroAutoRotate: boolean;
  heroInterval: number;
  showContinueWatching: boolean;
  showTrending: boolean;
  showNewReleases: boolean;
  showTopRated: boolean;
}

const defaultSettings: HomeSettings = {
  heroAutoRotate: true,
  heroInterval: 5000,
  showContinueWatching: true,
  showTrending: true,
  showNewReleases: true,
  showTopRated: true,
  sections: [
    { id: 'continue', title: 'Continue Watching', enabled: true, order: 1 },
    { id: 'trending', title: 'Trending Now', enabled: true, order: 2 },
    { id: 'newreleases', title: 'New Releases', enabled: true, order: 3 },
    { id: 'movies', title: 'Movies', enabled: true, order: 4 },
    { id: 'series', title: 'TV Series', enabled: true, order: 5 },
    { id: 'toprated', title: 'Top Rated', enabled: true, order: 6 },
  ],
};

export default function HomepageSettingsPage() {
  const [settings, setSettings] = useState<HomeSettings>(defaultSettings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('homeSettings');
    if (stored) {
      try {
        setSettings({ ...defaultSettings, ...JSON.parse(stored) });
      } catch {
        setSettings(defaultSettings);
      }
    }
  }, []);

  const handleSave = async () => {
    setSaving(true);
    localStorage.setItem('homeSettings', JSON.stringify(settings));
    await new Promise(resolve => setTimeout(resolve, 500));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleSection = (id: string) => {
    setSettings({
      ...settings,
      sections: settings.sections.map(s => 
        s.id === id ? { ...s, enabled: !s.enabled } : s
      ),
    });
  };

  const Toggle = ({ enabled, onClick }: { enabled: boolean; onClick: () => void }) => (
    <button
      onClick={onClick}
      className={`w-12 h-6 rounded-full transition-colors ${
        enabled ? 'bg-gradient-to-r from-cyan-500 to-blue-600' : 'bg-zinc-700'
      }`}
    >
      <div className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
        enabled ? 'translate-x-6' : 'translate-x-0.5'
      }`} />
    </button>
  );

  return (
    <div className="min-h-screen bg-[#0f0f13]">
      <AdminSidebar activeHref="/admin/homepage" />
      
      <main className="lg:ml-64 min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Homepage Settings</h1>
              <p className="text-zinc-500 mt-1 text-sm">Customize homepage sections</p>
            </div>
          </div>

          {saved && (
            <div className="mb-6 px-4 py-3 bg-green-500/20 text-green-400 border border-green-500/30 rounded-xl">
              Settings saved successfully!
            </div>
          )}

          <div className="space-y-6">
            <div className="bg-[#18181b] border border-zinc-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Hero Banner</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">Auto Rotate</p>
                    <p className="text-sm text-zinc-500">Automatically change featured content</p>
                  </div>
                  <Toggle enabled={settings.heroAutoRotate} onClick={() => setSettings({ ...settings, heroAutoRotate: !settings.heroAutoRotate })} />
                </div>
                {settings.heroAutoRotate && (
                  <div>
                    <label className="block text-sm text-zinc-400 mb-2">Rotation Interval (seconds)</label>
                    <input
                      type="number"
                      min="3"
                      max="60"
                      value={settings.heroInterval / 1000}
                      onChange={(e) => setSettings({ ...settings, heroInterval: parseInt(e.target.value) * 1000 || 5000 })}
                      className="w-24 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="bg-[#18181b] border border-zinc-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Sections Visibility</h2>
              <div className="space-y-3">
                {settings.sections.map((section) => (
                  <div key={section.id} className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-xl">
                    <span className="font-medium text-white">{section.title}</span>
                    <Toggle enabled={section.enabled} onClick={() => toggleSection(section.id)} />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#18181b] border border-zinc-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Content Sections</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">Continue Watching</p>
                    <p className="text-sm text-zinc-500">Show partially watched content</p>
                  </div>
                  <Toggle enabled={settings.showContinueWatching} onClick={() => setSettings({ ...settings, showContinueWatching: !settings.showContinueWatching })} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">Trending Now</p>
                    <p className="text-sm text-zinc-500">Show trending/popular content</p>
                  </div>
                  <Toggle enabled={settings.showTrending} onClick={() => setSettings({ ...settings, showTrending: !settings.showTrending })} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">New Releases</p>
                    <p className="text-sm text-zinc-500">Show recently added content</p>
                  </div>
                  <Toggle enabled={settings.showNewReleases} onClick={() => setSettings({ ...settings, showNewReleases: !settings.showNewReleases })} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">Top Rated</p>
                    <p className="text-sm text-zinc-500">Show highest rated content</p>
                  </div>
                  <Toggle enabled={settings.showTopRated} onClick={() => setSettings({ ...settings, showTopRated: !settings.showTopRated })} />
                </div>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 rounded-xl font-medium disabled:opacity-50 transition-all"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

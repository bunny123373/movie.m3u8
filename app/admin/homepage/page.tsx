'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

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

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0d1117] via-[#161b22] to-[#0d1117] text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin" className="text-[#8b949e] hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Homepage Settings</h1>
            <p className="text-[#8b949e] text-sm">Customize homepage sections</p>
          </div>
        </div>

        {saved && (
          <div className="mb-6 px-4 py-3 bg-[#238636] text-white rounded-lg">
            Settings saved successfully!
          </div>
        )}

        <div className="space-y-6">
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Hero Banner</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Auto Rotate</p>
                  <p className="text-sm text-[#8b949e]">Automatically change featured content</p>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, heroAutoRotate: !settings.heroAutoRotate })}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.heroAutoRotate ? 'bg-[#00a8e1]' : 'bg-[#30363d]'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.heroAutoRotate ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
              {settings.heroAutoRotate && (
                <div>
                  <label className="block text-sm text-[#8b949e] mb-1">Rotation Interval (seconds)</label>
                  <input
                    type="number"
                    min="3"
                    max="60"
                    value={settings.heroInterval / 1000}
                    onChange={(e) => setSettings({ ...settings, heroInterval: parseInt(e.target.value) * 1000 || 5000 })}
                    className="w-24 px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-white"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Sections Visibility</h2>
            <div className="space-y-3">
              {settings.sections.map((section) => (
                <div key={section.id} className="flex items-center justify-between p-3 bg-[#0d1117] rounded-lg">
                  <span className="font-medium">{section.title}</span>
                  <button
                    onClick={() => toggleSection(section.id)}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      section.enabled ? 'bg-[#00a8e1]' : 'bg-[#30363d]'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      section.enabled ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Content Sections</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Continue Watching</p>
                  <p className="text-sm text-[#8b949e]">Show partially watched content</p>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, showContinueWatching: !settings.showContinueWatching })}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.showContinueWatching ? 'bg-[#00a8e1]' : 'bg-[#30363d]'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.showContinueWatching ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Trending Now</p>
                  <p className="text-sm text-[#8b949e]">Show trending/popular content</p>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, showTrending: !settings.showTrending })}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.showTrending ? 'bg-[#00a8e1]' : 'bg-[#30363d]'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.showTrending ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">New Releases</p>
                  <p className="text-sm text-[#8b949e]">Show recently added content</p>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, showNewReleases: !settings.showNewReleases })}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.showNewReleases ? 'bg-[#00a8e1]' : 'bg-[#30363d]'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.showNewReleases ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Top Rated</p>
                  <p className="text-sm text-[#8b949e]">Show highest rated content</p>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, showTopRated: !settings.showTopRated })}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.showTopRated ? 'bg-[#00a8e1]' : 'bg-[#30363d]'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.showTopRated ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full sm:w-auto px-8 py-3 bg-[#00a8e1] hover:bg-[#00b4e6] rounded-lg font-medium disabled:opacity-50 transition-all"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </main>
  );
}
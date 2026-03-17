'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface SiteSettings {
  siteName: string;
  siteDescription: string;
  logo: string;
  favicon: string;
  primaryColor: string;
  footerText: string;
  socialLinks: {
    facebook: string;
    twitter: string;
    instagram: string;
    youtube: string;
  };
}

const defaultSettings: SiteSettings = {
  siteName: 'StreamGrid',
  siteDescription: 'Watch your favorite movies and series online',
  logo: '',
  favicon: '',
  primaryColor: '#00a8e1',
  footerText: '© 2024 StreamGrid. All rights reserved.',
  socialLinks: {
    facebook: '',
    twitter: '',
    instagram: '',
    youtube: '',
  },
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('siteSettings');
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
    localStorage.setItem('siteSettings', JSON.stringify(settings));
    await new Promise(resolve => setTimeout(resolve, 500));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-[#8b949e] text-sm">Configure your site</p>
          </div>
        </div>

        {saved && (
          <div className="mb-6 px-4 py-3 bg-[#238636] text-white rounded-lg">
            Settings saved successfully!
          </div>
        )}

        <div className="space-y-6">
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">General</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#8b949e] mb-1">Site Name</label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#0d1117] border border-[#30363d] rounded-lg text-white focus:outline-none focus:border-[#00a8e1]"
                />
              </div>
              <div>
                <label className="block text-sm text-[#8b949e] mb-1">Site Description</label>
                <textarea
                  value={settings.siteDescription}
                  onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-[#0d1117] border border-[#30363d] rounded-lg text-white focus:outline-none focus:border-[#00a8e1] resize-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Branding</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#8b949e] mb-1">Logo URL</label>
                <input
                  type="url"
                  value={settings.logo}
                  onChange={(e) => setSettings({ ...settings, logo: e.target.value })}
                  placeholder="https://example.com/logo.png"
                  className="w-full px-4 py-2.5 bg-[#0d1117] border border-[#30363d] rounded-lg text-white focus:outline-none focus:border-[#00a8e1]"
                />
              </div>
              <div>
                <label className="block text-sm text-[#8b949e] mb-1">Favicon URL</label>
                <input
                  type="url"
                  value={settings.favicon}
                  onChange={(e) => setSettings({ ...settings, favicon: e.target.value })}
                  placeholder="https://example.com/favicon.ico"
                  className="w-full px-4 py-2.5 bg-[#0d1117] border border-[#30363d] rounded-lg text-white focus:outline-none focus:border-[#00a8e1]"
                />
              </div>
              <div>
                <label className="block text-sm text-[#8b949e] mb-1">Primary Color</label>
                <div className="flex gap-3 items-center">
                  <input
                    type="color"
                    value={settings.primaryColor}
                    onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                    className="w-12 h-10 rounded border border-[#30363d] cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.primaryColor}
                    onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                    className="flex-1 px-4 py-2.5 bg-[#0d1117] border border-[#30363d] rounded-lg text-white focus:outline-none focus:border-[#00a8e1]"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Footer</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#8b949e] mb-1">Footer Text</label>
                <input
                  type="text"
                  value={settings.footerText}
                  onChange={(e) => setSettings({ ...settings, footerText: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#0d1117] border border-[#30363d] rounded-lg text-white focus:outline-none focus:border-[#00a8e1]"
                />
              </div>
            </div>
          </div>

          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Social Links</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[#8b949e] mb-1">Facebook</label>
                <input
                  type="url"
                  value={settings.socialLinks.facebook}
                  onChange={(e) => setSettings({ ...settings, socialLinks: { ...settings.socialLinks, facebook: e.target.value } })}
                  placeholder="https://facebook.com/..."
                  className="w-full px-4 py-2.5 bg-[#0d1117] border border-[#30363d] rounded-lg text-white focus:outline-none focus:border-[#00a8e1]"
                />
              </div>
              <div>
                <label className="block text-sm text-[#8b949e] mb-1">Twitter/X</label>
                <input
                  type="url"
                  value={settings.socialLinks.twitter}
                  onChange={(e) => setSettings({ ...settings, socialLinks: { ...settings.socialLinks, twitter: e.target.value } })}
                  placeholder="https://twitter.com/..."
                  className="w-full px-4 py-2.5 bg-[#0d1117] border border-[#30363d] rounded-lg text-white focus:outline-none focus:border-[#00a8e1]"
                />
              </div>
              <div>
                <label className="block text-sm text-[#8b949e] mb-1">Instagram</label>
                <input
                  type="url"
                  value={settings.socialLinks.instagram}
                  onChange={(e) => setSettings({ ...settings, socialLinks: { ...settings.socialLinks, instagram: e.target.value } })}
                  placeholder="https://instagram.com/..."
                  className="w-full px-4 py-2.5 bg-[#0d1117] border border-[#30363d] rounded-lg text-white focus:outline-none focus:border-[#00a8e1]"
                />
              </div>
              <div>
                <label className="block text-sm text-[#8b949e] mb-1">YouTube</label>
                <input
                  type="url"
                  value={settings.socialLinks.youtube}
                  onChange={(e) => setSettings({ ...settings, socialLinks: { ...settings.socialLinks, youtube: e.target.value } })}
                  placeholder="https://youtube.com/..."
                  className="w-full px-4 py-2.5 bg-[#0d1117] border border-[#30363d] rounded-lg text-white focus:outline-none focus:border-[#00a8e1]"
                />
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
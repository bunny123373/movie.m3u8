'use client';

import { Source } from '@/lib/models';

interface SourceInputProps {
  sources: Source[];
  onChange: (sources: Source[]) => void;
}

export default function SourceInput({ sources, onChange }: SourceInputProps) {
  const addSource = () => {
    const newSource: Source = {
      id: `new-${Date.now()}`,
      name: '',
      url: '',
      type: 'm3u8',
      priority: sources.length + 1,
      active: true,
    };
    onChange([...sources, newSource]);
  };

  const removeSource = (id: string) => {
    onChange(sources.filter(s => s.id !== id));
  };

  const updateSource = (id: string, field: keyof Source, value: string | boolean) => {
    onChange(sources.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-zinc-900 dark:text-white">Sources</h3>
        <button
          type="button"
          onClick={addSource}
          className="px-3 py-1.5 text-sm font-medium text-zinc-900 dark:text-white bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
        >
          + Add Source
        </button>
      </div>

      {sources.map((source, index) => (
        <div key={source.id} className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Source {index + 1}</span>
            <button
              type="button"
              onClick={() => removeSource(source.id)}
              className="text-sm text-red-500 hover:text-red-600 transition-colors"
            >
              Remove
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              value={source.name}
              onChange={(e) => updateSource(source.id, 'name', e.target.value)}
              placeholder="Source name"
              className="px-3 py-2 text-sm bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-600 text-zinc-900 dark:text-white"
            />
            <input
              type="url"
              value={source.url}
              onChange={(e) => updateSource(source.id, 'url', e.target.value)}
              placeholder="Source URL"
              className="px-3 py-2 text-sm bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-600 text-zinc-900 dark:text-white"
            />
            <select
              value={source.type}
              onChange={(e) => updateSource(source.id, 'type', e.target.value)}
              className="px-3 py-2 text-sm bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-600 text-zinc-900 dark:text-white"
            >
              <option value="m3u8">M3U8</option>
              <option value="mp4">MP4</option>
              <option value="embed">Embed</option>
            </select>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={source.active}
              onChange={(e) => updateSource(source.id, 'active', e.target.checked)}
              className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-white focus:ring-zinc-300 dark:focus:ring-zinc-600"
            />
            <span className="text-sm text-zinc-600 dark:text-zinc-400">Active</span>
          </label>
        </div>
      ))}

      {sources.length === 0 && (
        <p className="text-center text-zinc-500 dark:text-zinc-400 py-4">No sources added yet</p>
      )}
    </div>
  );
}

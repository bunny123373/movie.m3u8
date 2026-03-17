export interface Subtitle {
  id: string;
  label: string;
  lang: string;
  url: string;
}

export interface Source {
  id: string;
  name: string;
  url: string;
  type: 'mp4' | 'm3u8' | 'embed';
  priority: number;
  active: boolean;
  season?: number;
  episode?: number;
  subtitles?: Subtitle[];
}

export function createSlug(title: string, id: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
  return `${slug}-${id}`;
}

export interface Movie {
  _id?: any;
  id: string;
  slug?: string;
  title: string;
  poster: string;
  backdrop: string;
  rating: number;
  releaseDate: string;
  overview: string;
  genres: string[];
  audioLanguages: string[];
  subtitleLanguages: string[];
  quality: string;
  runtime: string;
  fileSize: string;
  sources: Source[];
  mediaType: 'movie';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Series {
  _id?: any;
  id: string;
  slug?: string;
  title: string;
  poster: string;
  backdrop: string;
  rating: number;
  releaseDate: string;
  overview: string;
  genres: string[];
  audioLanguages: string[];
  subtitleLanguages: string[];
  quality: string;
  totalSeasons: number;
  totalEpisodes: number;
  sources: Source[];
  mediaType: 'series';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MediaItem extends Movie {
  mediaType: 'movie';
}

export interface MediaSeries extends Series {
  mediaType: 'series';
}

import { getDatabase } from './db';
import { ObjectId } from 'mongodb';

export interface Source {
  id: string;
  name: string;
  url: string;
  type: 'mp4' | 'm3u8' | 'embed';
  priority: number;
  active: boolean;
  season?: number;
  episode?: number;
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
  _id?: ObjectId;
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
  createdAt: Date;
  updatedAt: Date;
}

export interface Series {
  _id?: ObjectId;
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
  createdAt: Date;
  updatedAt: Date;
}

const movieSchema = {
  id: '',
  slug: '',
  title: '',
  poster: '',
  backdrop: '',
  rating: 0,
  releaseDate: '',
  overview: '',
  genres: [] as string[],
  audioLanguages: [] as string[],
  subtitleLanguages: [] as string[],
  quality: '1080p',
  runtime: '',
  fileSize: '',
  sources: [] as Source[],
};

export async function getAllMovies(): Promise<Movie[]> {
  const db = await getDatabase();
  const movies = await db.collection<Movie>('movies').find({}).sort({ createdAt: -1 }).toArray();
  return movies;
}

export async function getMovieById(id: string): Promise<Movie | null> {
  const db = await getDatabase();
  const movie = await db.collection<Movie>('movies').findOne({ id });
  return movie;
}

export async function getMovieBySlug(slug: string): Promise<Movie | null> {
  const db = await getDatabase();
  const movie = await db.collection<Movie>('movies').findOne({ slug });
  return movie;
}

export async function getFeaturedMovie(): Promise<Movie | null> {
  const db = await getDatabase();
  const movie = await db.collection<Movie>('movies').findOne({}, { sort: { createdAt: -1 } });
  return movie;
}

export async function createMovie(movie: Omit<Movie, '_id' | 'createdAt' | 'updatedAt'>): Promise<Movie> {
  const db = await getDatabase();
  const now = new Date();
  const newMovie: Movie = {
    ...movie,
    createdAt: now,
    updatedAt: now,
  };
  const result = await db.collection<Movie>('movies').insertOne(newMovie);
  return { ...newMovie, _id: result.insertedId };
}

export async function updateMovie(id: string, updates: Partial<Movie>): Promise<Movie | null> {
  const db = await getDatabase();
  const result = await db.collection<Movie>('movies').findOneAndUpdate(
    { id },
    { $set: { ...updates, updatedAt: new Date() } },
    { returnDocument: 'after' }
  );
  return result;
}

export async function deleteMovie(id: string): Promise<boolean> {
  const db = await getDatabase();
  const result = await db.collection<Movie>('movies').deleteOne({ id });
  return result.deletedCount > 0;
}

export async function seedMovies(): Promise<void> {
  const db = await getDatabase();
  const count = await db.collection('movies').countDocuments();
  
  if (count === 0) {
    const sampleMovies: Omit<Movie, '_id' | 'createdAt' | 'updatedAt'>[] = [
      {
        id: '1',
        title: 'Pushpa 2: The Rule',
        poster: 'https://image.tmdb.org/t/p/w500/l2ezR1lEsJ3JGR8CnYpK3K2mvi.jpg',
        backdrop: 'https://image.tmdb.org/t/p/original//4响wXq9OPqX8KwrL3QnV1tzLPOsY.jpg',
        rating: 8.2,
        releaseDate: '2024-12-05',
        overview: 'Pushpa Raj is back with a vengeance as he sets off on a dangerous new adventure.',
        genres: ['Action', 'Drama'],
        audioLanguages: ['Telugu', 'Tamil', 'Hindi'],
        subtitleLanguages: ['English', 'Telugu'],
        quality: '1080p',
        runtime: '2h 45m',
        fileSize: '2.8 GB',
        sources: [
          { id: 's1', name: 'Server 1', url: 'https://example.com/movie1', type: 'm3u8', priority: 1, active: true },
          { id: 's2', name: 'Server 2', url: 'https://example.com/movie2', type: 'embed', priority: 2, active: true },
        ],
        mediaType: 'movie' as const,
      },
      {
        id: '2',
        title: 'Devara: Part 1',
        poster: 'https://image.tmdb.org/t/p/w500/lf1TeC8qUf2B4qD2evM9c9XhG.jpg',
        backdrop: 'https://image.tmdb.org/t/p/original//2Z3kfbK8x7G1f6tFZdC0sXaQ.jpg',
        rating: 7.8,
        releaseDate: '2024-10-10',
        overview: 'A fearless warrior navigates through the world of crime and corruption.',
        genres: ['Action', 'Thriller'],
        audioLanguages: ['Telugu', 'Tamil', 'Hindi', 'English'],
        subtitleLanguages: ['English', 'Telugu', 'Tamil'],
        quality: '4K',
        runtime: '2h 55m',
        fileSize: '4.2 GB',
        sources: [
          { id: 's1', name: 'Server 1', url: 'https://example.com/devara1', type: 'm3u8', priority: 1, active: true },
          { id: 's2', name: 'Server 2', url: 'https://example.com/devara2', type: 'mp4', priority: 2, active: true },
          { id: 's3', name: 'Server 3', url: 'https://example.com/devara3', type: 'embed', priority: 3, active: true },
        ],
        mediaType: 'movie' as const,
      },
      {
        id: '3',
        title: 'Kalki 2898 AD',
        poster: 'https://image.tmdb.org/t/p/w500/lrO0PHXYazyUVWPECzJ3Jfwz6w.jpg',
        backdrop: 'https://image.tmdb.org/t/p/original//4M0RPllEQs6f4K4e55gY2QqTxY.jpg',
        rating: 8.5,
        releaseDate: '2024-06-27',
        overview: 'In a dystopian future, a legendary warrior is reborn to save humanity.',
        genres: ['Sci-Fi', 'Action', 'Adventure'],
        audioLanguages: ['Telugu', 'Hindi', 'English'],
        subtitleLanguages: ['English', 'Hindi'],
        quality: '1080p',
        runtime: '2h 45m',
        fileSize: '2.9 GB',
        sources: [
          { id: 's1', name: 'Server 1', url: 'https://example.com/kalki1', type: 'm3u8', priority: 1, active: true },
        ],
        mediaType: 'movie' as const,
      },
      {
        id: '4',
        title: 'RRR',
        poster: 'https://image.tmdb.org/t/p/w500/wfocG94d75V4x5XzL7E3L4nM3D.jpg',
        backdrop: 'https://image.tmdb.org/t/p/original//dX0KV3EZ9qTyQFfMimoF4keF2R.jpg',
        rating: 8.9,
        releaseDate: '2022-03-25',
        overview: 'Two Indian revolutionaries fight for independence against British colonial rule.',
        genres: ['Action', 'Drama', 'History'],
        audioLanguages: ['Telugu', 'Tamil', 'Hindi'],
        subtitleLanguages: ['English', 'Telugu', 'Tamil', 'Hindi'],
        quality: '1080p',
        runtime: '3h 7m',
        fileSize: '3.2 GB',
        sources: [
          { id: 's1', name: 'Server 1', url: 'https://example.com/rrr1', type: 'm3u8', priority: 1, active: true },
          { id: 's2', name: 'Server 2', url: 'https://example.com/rrr2', type: 'embed', priority: 2, active: true },
        ],
        mediaType: 'movie' as const,
      },
      {
        id: '5',
        title: 'Jawan',
        poster: 'https://image.tmdb.org/t/p/w500/lmZFxXgJE3vgrciwuDib0N8CfQo.jpg',
        backdrop: 'https://image.tmdb.org/t/p/original//dZ9XbLfeKPr3rM0ZKPSNTSfJRW.jpg',
        rating: 8.1,
        releaseDate: '2023-09-07',
        overview: 'A vigilante leader embarks on a mission to rect wrong injustices in society.',
        genres: ['Action', 'Thriller'],
        audioLanguages: ['Hindi', 'Telugu', 'Tamil'],
        subtitleLanguages: ['English'],
        quality: '1080p',
        runtime: '2h 49m',
        fileSize: '2.6 GB',
        sources: [
          { id: 's1', name: 'Server 1', url: 'https://example.com/jawan1', type: 'm3u8', priority: 1, active: true },
          { id: 's2', name: 'Server 2', url: 'https://example.com/jawan2', type: 'mp4', priority: 2, active: true },
        ],
        mediaType: 'movie' as const,
      },
      {
        id: '6',
        title: 'Dunki',
        poster: 'https://image.tmdb.org/t/p/w500/jE5o7y9K6pZtWNNMEzf3xC9nZ4W.jpg',
        backdrop: 'https://image.tmdb.org/t/p/original//em4rQGmGLT2J5h0fPrMNTgKHwI.jpg',
        rating: 7.5,
        releaseDate: '2023-12-12',
        overview: 'A group of friends embark on a perilous journey to find a better life abroad.',
        genres: ['Comedy', 'Drama'],
        audioLanguages: ['Hindi', 'Telugu', 'Tamil'],
        subtitleLanguages: ['English'],
        quality: '720p',
        runtime: '2h 41m',
        fileSize: '1.8 GB',
        sources: [
          { id: 's1', name: 'Server 1', url: 'https://example.com/dunki1', type: 'embed', priority: 1, active: true },
        ],
        mediaType: 'movie' as const,
      },
    ];

    await db.collection('movies').insertMany(sampleMovies as Movie[]);
    console.log('Sample movies seeded');
  }
}

export async function getAllSeries(): Promise<Series[]> {
  const db = await getDatabase();
  const series = await db.collection<Series>('series').find({}).sort({ createdAt: -1 }).toArray();
  return series;
}

export async function getSeriesById(id: string): Promise<Series | null> {
  const db = await getDatabase();
  const series = await db.collection<Series>('series').findOne({ id });
  return series;
}

export async function getSeriesBySlug(slug: string): Promise<Series | null> {
  const db = await getDatabase();
  const series = await db.collection<Series>('series').findOne({ slug });
  return series;
}

export async function createSeries(series: Omit<Series, '_id' | 'createdAt' | 'updatedAt'>): Promise<Series> {
  const db = await getDatabase();
  const now = new Date();
  const newSeries: Series = {
    ...series,
    createdAt: now,
    updatedAt: now,
  };
  const result = await db.collection<Series>('series').insertOne(newSeries);
  return { ...newSeries, _id: result.insertedId };
}

export async function updateSeries(id: string, updates: Partial<Series>): Promise<Series | null> {
  const db = await getDatabase();
  const result = await db.collection<Series>('series').findOneAndUpdate(
    { id },
    { $set: { ...updates, updatedAt: new Date() } },
    { returnDocument: 'after' }
  );
  return result;
}

export async function deleteSeries(id: string): Promise<boolean> {
  const db = await getDatabase();
  const result = await db.collection<Series>('series').deleteOne({ id });
  return result.deletedCount > 0;
}

export async function getAllMedia(): Promise<(Movie | Series)[]> {
  const db = await getDatabase();
  const [movies, series] = await Promise.all([
    db.collection<Movie>('movies').find({}).toArray(),
    db.collection<Series>('series').find({}).toArray(),
  ]);
  return [...movies, ...series].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

import { getDatabase } from './db';
import { ObjectId, Collection } from 'mongodb';

export * from './types';

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
  sources: [] as any[],
};

export async function getAllMovies(): Promise<any[]> {
  const db = await getDatabase();
  const movies = await db.collection('movies').find({}).sort({ createdAt: -1 }).toArray();
  return movies;
}

export async function getMovieById(id: string): Promise<any | null> {
  const db = await getDatabase();
  const movie = await db.collection('movies').findOne({ id });
  return movie;
}

export async function getMovieBySlug(slug: string): Promise<any | null> {
  const db = await getDatabase();
  const movie = await db.collection('movies').findOne({ slug });
  return movie;
}

export async function getFeaturedMovie(): Promise<any | null> {
  const db = await getDatabase();
  const movie = await db.collection('movies').findOne({}, { sort: { createdAt: -1 } });
  return movie;
}

export async function createMovie(movie: any): Promise<any> {
  const db = await getDatabase();
  const now = new Date();
  const newMovie = {
    ...movie,
    createdAt: now,
    updatedAt: now,
  };
  const result = await db.collection('movies').insertOne(newMovie);
  return { ...newMovie, _id: result.insertedId };
}

export async function updateMovie(id: string, updates: any): Promise<any | null> {
  const db = await getDatabase();
  const result = await db.collection('movies').findOneAndUpdate(
    { id },
    { $set: { ...updates, updatedAt: new Date() } },
    { returnDocument: 'after' }
  );
  return result;
}

export async function deleteMovie(id: string): Promise<boolean> {
  const db = await getDatabase();
  const result = await db.collection('movies').deleteOne({ id });
  return result.deletedCount > 0;
}

export async function seedMovies(): Promise<void> {
  // No seed data - only user-added content
}

export async function seedSeries(): Promise<void> {
  // No seed data - only user-added content
}

export async function getAllSeries(): Promise<any[]> {
  const db = await getDatabase();
  const series = await db.collection('series').find({}).sort({ createdAt: -1 }).toArray();
  return series;
}

export async function getSeriesById(id: string): Promise<any | null> {
  const db = await getDatabase();
  const series = await db.collection('series').findOne({ id });
  return series;
}

export async function getSeriesBySlug(slug: string): Promise<any | null> {
  const db = await getDatabase();
  const series = await db.collection('series').findOne({ slug });
  return series;
}

export async function createSeries(series: any): Promise<any> {
  const db = await getDatabase();
  const now = new Date();
  const newSeries = {
    ...series,
    createdAt: now,
    updatedAt: now,
  };
  const result = await db.collection('series').insertOne(newSeries);
  return { ...newSeries, _id: result.insertedId };
}

export async function updateSeries(id: string, updates: any): Promise<any | null> {
  const db = await getDatabase();
  const result = await db.collection('series').findOneAndUpdate(
    { id },
    { $set: { ...updates, updatedAt: new Date() } },
    { returnDocument: 'after' }
  );
  return result;
}

export async function deleteSeries(id: string): Promise<boolean> {
  const db = await getDatabase();
  const result = await db.collection('series').deleteOne({ id });
  return result.deletedCount > 0;
}

export async function getAllMedia(): Promise<any[]> {
  const db = await getDatabase();
  const [movies, series] = await Promise.all([
    db.collection('movies').find({}).toArray(),
    db.collection('series').find({}).toArray(),
  ]);
  return [...movies, ...series].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export interface Favorite {
  _id?: ObjectId;
  userId: string;
  mediaId: string;
  slug: string;
  title: string;
  poster: string;
  mediaType: 'movie' | 'series';
  createdAt: Date;
}

export interface WatchProgress {
  _id?: ObjectId;
  userId: string;
  mediaId: string;
  progress: number;
  duration: number;
  updatedAt: Date;
}

export interface UserSettings {
  _id?: ObjectId;
  userId: string;
  homeSettings?: Record<string, any>;
  siteSettings?: Record<string, any>;
  updatedAt: Date;
}

export async function getFavorites(userId: string): Promise<Favorite[]> {
  const db = await getDatabase();
  return db.collection('favorites').find({ userId }).toArray() as Promise<Favorite[]>;
}

export async function addFavorite(favorite: Omit<Favorite, '_id' | 'createdAt'>): Promise<Favorite> {
  const db = await getDatabase();
  const newFavorite = { ...favorite, createdAt: new Date() };
  const result = await db.collection('favorites').insertOne(newFavorite);
  return { ...newFavorite, _id: result.insertedId };
}

export async function removeFavorite(userId: string, mediaId: string): Promise<boolean> {
  const db = await getDatabase();
  const result = await db.collection('favorites').deleteOne({ userId, mediaId });
  return result.deletedCount > 0;
}

export async function getWatchProgress(userId: string): Promise<WatchProgress[]> {
  const db = await getDatabase();
  return db.collection('watchProgress').find({ userId }).toArray() as Promise<WatchProgress[]>;
}

export async function saveWatchProgress(data: Omit<WatchProgress, '_id' | 'updatedAt'>): Promise<WatchProgress> {
  const db = await getDatabase();
  const result = await db.collection('watchProgress').findOneAndUpdate(
    { userId: data.userId, mediaId: data.mediaId },
    { $set: { ...data, updatedAt: new Date() } },
    { upsert: true, returnDocument: 'after' }
  );
  return result as WatchProgress;
}

export async function getUserSettings(userId: string): Promise<UserSettings | null> {
  const db = await getDatabase();
  return db.collection('settings').findOne({ userId }) as Promise<UserSettings | null>;
}

export async function saveUserSettings(userId: string, settings: Partial<UserSettings>): Promise<UserSettings> {
  const db = await getDatabase();
  const result = await db.collection('settings').findOneAndUpdate(
    { userId },
    { $set: { ...settings, updatedAt: new Date() } },
    { upsert: true, returnDocument: 'after' }
  );
  return result as UserSettings;
}

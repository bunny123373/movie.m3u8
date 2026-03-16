import { getDatabase } from './db';
import { ObjectId } from 'mongodb';

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

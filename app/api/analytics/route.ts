import { NextRequest, NextResponse } from 'next/server';

const analyticsData: Record<string, any> = {
  '7d': {
    totalViews: 28500,
    uniqueVisitors: 17100,
    avgWatchTime: 42,
    bounceRate: 35,
    viewsByDay: Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        date: date.toISOString().split('T')[0],
        views: Math.floor(Math.random() * 5000) + 3000,
      };
    }),
  },
  '30d': {
    totalViews: 125000,
    uniqueVisitors: 75000,
    avgWatchTime: 45,
    bounceRate: 32,
    viewsByDay: Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return {
        date: date.toISOString().split('T')[0],
        views: Math.floor(Math.random() * 8000) + 2000,
      };
    }),
  },
  '90d': {
    totalViews: 385000,
    uniqueVisitors: 231000,
    avgWatchTime: 48,
    bounceRate: 28,
    viewsByDay: Array.from({ length: 90 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (89 - i));
      return {
        date: date.toISOString().split('T')[0],
        views: Math.floor(Math.random() * 10000) + 1500,
      };
    }),
  },
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period') || '30d';

  return NextResponse.json(analyticsData[period] || analyticsData['30d']);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    if (!type || !data) {
      return NextResponse.json({ error: 'Missing type or data' }, { status: 400 });
    }

    console.log(`[Analytics] ${type}:`, data);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

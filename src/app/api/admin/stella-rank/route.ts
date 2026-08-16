import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectToDatabase from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    if (decoded.username !== 'scroppy') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { embed } = await request.json();
    await connectToDatabase();
    
    // Safely get the collection through mongoose which handles buffering
    const collection = mongoose.connection.collection('vip_data');
    
    await collection.updateOne(
      { _id: 'dashboard_config' as any },
      { $set: { stella_rank_embed: embed } },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('stella-rank POST error:', error?.message || error);
    return NextResponse.json({ error: error?.message || 'Failed to save' }, { status: 500 });
  }
}

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    if (decoded.username !== 'scroppy') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectToDatabase();
    const collection = mongoose.connection.collection('vip_data');
    const dbData = await collection.findOne({ _id: 'dashboard_config' as any });
    return NextResponse.json({ stella_rank_embed: (dbData as any)?.stella_rank_embed || {} });
  } catch (error: any) {
    console.error('stella-rank GET error:', error?.message || error);
    return NextResponse.json({ error: error?.message || 'Failed to fetch' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectToDatabase from '@/lib/mongodb';
import mongoose from 'mongoose';
import DashboardConfig from '@/lib/models/DashboardConfig';

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

    await connectToDatabase();
    const collection = mongoose.connection.collection('vip_data');
    const dbData = await collection.findOne({ _id: 'dashboard_config' as any });

    const vipPlusUsers = dbData?.vipPlusUsers || [];
    if (!vipPlusUsers.includes(decoded.id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { embed } = await request.json();
    
    await DashboardConfig.updateOne(
      { _id: 'dashboard_config' },
      { $set: { global_rank_embed: embed } },
      { upsert: true, strict: false }
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to save global rank config' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

    await connectToDatabase();
    const collection = mongoose.connection.collection('vip_data');
    const dbData = await collection.findOne({ _id: 'dashboard_config' as any });

    const vipPlusUsers = dbData?.vipPlusUsers || [];
    if (!vipPlusUsers.includes(decoded.id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    return NextResponse.json({ global_rank_embed: (dbData as any)?.global_rank_embed || {} });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import connectToDatabase from '@/lib/mongodb';
import mongoose from 'mongoose';

const userConfigSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  rank_embed: { type: Object, default: {} }
}, { collection: 'user_configs' });

const UserConfig = mongoose.models.UserConfig || mongoose.model('UserConfig', userConfigSchema);

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    await connectToDatabase();
    
    const config = await UserConfig.findById(decoded.id);
    if (!config) {
      return NextResponse.json({ rank_embed: null });
    }

    return NextResponse.json({ rank_embed: config.rank_embed });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch rank profile' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectToDatabase from '@/lib/mongodb';
import mongoose from 'mongoose';

const userConfigSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  rank_embed: { type: Object, default: {} },
  xp_multiplier_active: { type: Boolean, default: true },
  vip_boost_expires: { type: Number, default: 0 }
}, { collection: 'user_configs' });

const UserConfig = mongoose.models.UserConfig || mongoose.model('UserConfig', userConfigSchema);

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    await connectToDatabase();
    
    const { active } = await request.json();
    
    await UserConfig.findByIdAndUpdate(
      decoded.id,
      { $set: { xp_multiplier_active: active } },
      { upsert: true }
    );

    return NextResponse.json({ success: true, active });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to toggle multiplier' }, { status: 500 });
  }
}

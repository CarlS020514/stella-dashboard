import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import connectToDatabase from '@/lib/mongodb';
import mongoose from 'mongoose';

const userConfigSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  rank_embed: { type: Object, default: {} },
  xp_multiplier_active: { type: Boolean, default: true },
  vip_boost_expires: { type: Number, default: 0 },
  last_bonus_time: { type: Number, default: 0 },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 0 },
  global_xp: { type: Number, default: 0 },
  global_level: { type: Number, default: 1 }
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
    
    const config = await UserConfig.findById(decoded.id).lean() as any;
    if (!config) {
      return NextResponse.json({
        rank_embed: null,
        last_bonus_time: 0,
        xp_multiplier_active: true,
        vip_boost_expires: 0,
        xp: 0,
        level: 0,
        global_xp: 0,
        global_level: 1
      });
    }

    return NextResponse.json({
      rank_embed: config.rank_embed ?? null,
      xp_multiplier_active: config.xp_multiplier_active ?? true,
      vip_boost_expires: config.vip_boost_expires ?? 0,
      last_bonus_time: config.last_bonus_time ?? 0,
      xp: config.xp ?? 0,
      level: config.level ?? 0,
      global_xp: config.global_xp ?? config.xp ?? 0,
      global_level: config.global_level ?? config.level ?? 1
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch rank profile' }, { status: 500 });
  }
}

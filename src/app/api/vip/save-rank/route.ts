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

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const { embed } = await req.json();

    if (!embed) {
      return NextResponse.json({ error: 'Embed data missing' }, { status: 400 });
    }

    await connectToDatabase();
    
    // Check if user is VIP+
    const DashboardConfig = mongoose.models.DashboardConfig || mongoose.model('DashboardConfig', new mongoose.Schema({
      _id: { type: String, default: 'dashboard_config' },
      vipPlusUsers: { type: [String], default: [] }
    }, { collection: 'vip_data' }));
    
    const dbData = await DashboardConfig.findById('dashboard_config');
    if (!dbData || !dbData.vipPlusUsers?.includes(decoded.id)) {
      return NextResponse.json({ error: 'You do not have VIP+ status' }, { status: 403 });
    }

    // Save rank profile
    await UserConfig.findOneAndUpdate(
      { _id: decoded.id },
      { $set: { rank_embed: embed } },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Save Rank Error:", error);
    return NextResponse.json({ error: 'Failed to save rank profile' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectToDatabase from '@/lib/mongodb';
import DashboardConfig from '@/lib/models/DashboardConfig';

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    if (decoded.username !== 'scroppy') { // Hardcoded Admin Check
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { embed } = await request.json();
    await connectToDatabase();
    
    let dbData = await DashboardConfig.findById('dashboard_config');
    if (!dbData) {
      dbData = new DashboardConfig();
    }
    
    // Add global_rank_embed dynamically (since we didn't add it to mongoose schema explicitly)
    dbData.set('global_rank_embed', embed, { strict: false });
    await dbData.save();

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
    if (decoded.username !== 'scroppy') { 
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectToDatabase();
    const dbData = await DashboardConfig.findById('dashboard_config').lean();
    
    return NextResponse.json({ global_rank_embed: (dbData as any)?.global_rank_embed || {} });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

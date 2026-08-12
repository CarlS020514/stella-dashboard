import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import connectToDatabase from '@/lib/mongodb';
import DashboardConfig from '@/lib/models/DashboardConfig';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

    await connectToDatabase();
    const dbData = await DashboardConfig.findById('dashboard_config');
    if (!dbData) {
      return NextResponse.json({ error: 'DB Error' }, { status: 500 });
    }

    if (dbData.vipBackgrounds && dbData.vipBackgrounds.has(decoded.id)) {
      dbData.vipBackgrounds.delete(decoded.id);
      await dbData.save();
    }

    return NextResponse.json({ message: 'Background removed successfully' });
  } catch (error) {
    console.error('Remove BG Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

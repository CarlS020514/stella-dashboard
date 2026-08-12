import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import connectToDatabase from '@/lib/mongodb';
import DashboardConfig from '@/lib/models/DashboardConfig';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    return NextResponse.json({ authenticated: false });
  }

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    
    // Check VIP status
    let is_vip = false;
    let is_vip_plus = false;
    let bgImage = null;
    try {
      await connectToDatabase();
      const dbData = await DashboardConfig.findById('dashboard_config');
      if (dbData) {
        is_vip_plus = dbData.vipPlusUsers?.includes(decoded.id) || false;
        is_vip = is_vip_plus || (dbData.vipUsers?.includes(decoded.id) || false);
        
        if (is_vip_plus && dbData.vipBackgrounds) {
          bgImage = dbData.vipBackgrounds.get(decoded.id) || null;
        }
      }
    } catch(e) {
      console.error("Failed to read DB", e);
    }
    
    decoded.is_vip = is_vip;
    decoded.is_vip_plus = is_vip_plus;
    decoded.bgImage = bgImage;
    
    return NextResponse.json({ authenticated: true, user: decoded });
  } catch (error) {
    return NextResponse.json({ authenticated: false });
  }
}

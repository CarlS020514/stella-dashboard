import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectToDatabase from '@/lib/mongodb';
import DashboardConfig from '@/lib/models/DashboardConfig';

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let user: any = null;
  try {
    user = jwt.verify(token, process.env.JWT_SECRET!);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  try {
    const { code } = await request.json();
    if (!code) return NextResponse.json({ error: 'Code is required' }, { status: 400 });

    await connectToDatabase();
    
    // Fetch DB
    let dbData = await DashboardConfig.findById('dashboard_config');
    if (!dbData) {
      dbData = new DashboardConfig();
      await dbData.save();
    }
    
    // Check if already VIP+
    if (dbData.vipPlusUsers.includes(user.id)) {
      return NextResponse.json({ error: 'You already have the highest tier (VIP+)' }, { status: 400 });
    }

    let codeType = 'none';
    
    // Check if it's a VIP+ code
    if (dbData.validPlusCodes && dbData.validPlusCodes.includes(code)) {
      codeType = 'vipplus';
    } 
    // Check if it's a normal VIP code
    else if (dbData.validCodes.includes(code)) {
      if (dbData.vipUsers.includes(user.id)) {
        return NextResponse.json({ error: 'You are already a VIP! You need a VIP+ code for the next tier.' }, { status: 400 });
      }
      codeType = 'vip';
    }

    if (codeType === 'none') {
      return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 });
    }

    if (codeType === 'vipplus') {
      // Remove from normal VIP if upgrading
      dbData.vipUsers = dbData.vipUsers.filter((id: string) => id !== user.id);
      dbData.vipPlusUsers.push(user.id);
      dbData.validPlusCodes = dbData.validPlusCodes.filter((c: string) => c !== code);
    } else {
      dbData.vipUsers.push(user.id);
      dbData.validCodes = dbData.validCodes.filter((c: string) => c !== code);
    }

    await dbData.save();

    const tierName = codeType === 'vipplus' ? 'VIP+' : 'VIP';
    return NextResponse.json({ message: `Success! You are now ${tierName}.` });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

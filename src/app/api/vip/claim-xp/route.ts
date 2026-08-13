import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectToDatabase from '@/lib/mongodb';
import mongoose from 'mongoose';

const claimSchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  timestamp: { type: Number, required: true }
}, { collection: 'pending_xp_claims' });

const PendingClaim = mongoose.models.PendingClaim || mongoose.model('PendingClaim', claimSchema);

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    await connectToDatabase();
    
    // We will let the bot handle cooldown logic to avoid desync.
    // Dashboard just pushes a claim request to the queue.
    const newClaim = new PendingClaim({
      user_id: decoded.id,
      timestamp: Date.now()
    });
    
    await newClaim.save();

    return NextResponse.json({ success: true, message: "Claim request sent to Bot!" });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to claim XP' }, { status: 500 });
  }
}

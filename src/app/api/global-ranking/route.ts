import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function GET() {
  try {
    await connectToDatabase();
    const collection = mongoose.connection.collection('user_configs');
    
    // Fetch top 50 users sorted by global_xp descending
    // If global_xp doesn't exist, sort by xp descending
    const topUsers = await collection.aggregate([
      {
        $addFields: {
          sort_xp: { $ifNull: ["$global_xp", "$xp"] },
          sort_level: { $ifNull: ["$global_level", "$level"] }
        }
      },
      {
        $match: {
          sort_xp: { $gt: 0 } // Only include users with more than 0 XP
        }
      },
      {
        $sort: { sort_xp: -1 }
      },
      {
        $limit: 50
      },
      {
        $project: {
          _id: 1, // This is the Discord ID
          username: 1,
          avatar: 1,
          global_xp: "$sort_xp",
          global_level: "$sort_level"
        }
      }
    ]).toArray();

    return NextResponse.json({ leaderboard: topUsers });
  } catch (error: any) {
    console.error('Failed to fetch leaderboard:', error);
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}

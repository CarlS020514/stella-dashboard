import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const DISCORD_API = 'https://discord.com/api/v10';

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET!);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const guildId = searchParams.get('guild_id');

  if (!guildId) {
    return NextResponse.json({ error: 'Missing guild_id' }, { status: 400 });
  }

  const botToken = process.env.DISCORD_BOT_TOKEN;

  try {
    const response = await fetch(`${DISCORD_API}/guilds/${guildId}/channels`, {
      headers: {
        Authorization: `Bot ${botToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Discord API responded with ${response.status}`);
    }

    const channels = await response.json();
    // Filter to only text channels (type 0) and news channels (type 5)
    const textChannels = channels.filter((c: any) => c.type === 0 || c.type === 5);
    return NextResponse.json(textChannels);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch channels' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const DISCORD_API = 'https://discord.com/api/v10';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let accessToken = '';
  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    accessToken = decoded.access_token;
  } catch (error) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  if (!accessToken) {
    return NextResponse.json({ error: 'No access token found' }, { status: 401 });
  }

  // Fetch user guilds on the fly
  let userGuilds: any[] = [];
  try {
    const uRes = await fetch(`${DISCORD_API}/users/@me/guilds`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (uRes.ok) {
      userGuilds = await uRes.json();
    }
  } catch (error) {
    console.error("Failed to fetch user guilds:", error);
  }

  // Filter user guilds: Must be Owner or have Administrator permission (0x8)
  const adminGuilds = userGuilds.filter((g: any) => g.owner || (BigInt(g.permissions) & BigInt(0x8)) === BigInt(0x8));

  // Fetch Bot's Guilds
  const botToken = process.env.DISCORD_BOT_TOKEN;
  try {
    const response = await fetch(`${DISCORD_API}/users/@me/guilds`, {
      headers: { Authorization: `Bot ${botToken}` },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch bot guilds');
    }

    const botGuilds = await response.json();
    const botGuildIds = new Set(botGuilds.map((g: any) => g.id));

    // Intersection: Guilds where User is Admin AND Bot is present
    const validGuilds = adminGuilds.filter((g: any) => botGuildIds.has(g.id));

    return NextResponse.json(validGuilds);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch guilds' }, { status: 500 });
  }
}

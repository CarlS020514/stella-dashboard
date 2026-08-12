import { NextResponse } from 'next/server';

const DISCORD_API = 'https://discord.com/api/v10';
const OWNER_ID = '1510628854941880451'; // User's discord ID

export async function GET() {
  const botToken = process.env.DISCORD_BOT_TOKEN;

  if (!botToken) {
    return NextResponse.json({ username: 'zynex.05' }); // fallback
  }

  try {
    const res = await fetch(`${DISCORD_API}/users/${OWNER_ID}`, {
      headers: {
        Authorization: `Bot ${botToken}`,
      },
      next: { revalidate: 3600 } // Cache for 1 hour so we don't spam discord API
    });

    if (!res.ok) {
      return NextResponse.json({ username: 'zynex.05' }); // fallback
    }

    const data = await res.json();
    return NextResponse.json({ username: data.username });
  } catch (error) {
    return NextResponse.json({ username: 'zynex.05' }); // fallback
  }
}

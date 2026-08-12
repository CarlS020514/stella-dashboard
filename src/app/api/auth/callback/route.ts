import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const DISCORD_API_ENDPOINT = 'https://discord.com/api/v10';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 });
  }

  const clientId = process.env.DISCORD_CLIENT_ID!;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET!;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`;

  // Exchange code for token
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
  });

  try {
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });

    if (!tokenResponse.ok) {
      return NextResponse.json({ error: 'Failed to exchange token' }, { status: 500 });
    }

    const tokenData = await tokenResponse.json();
    const { access_token } = tokenData;

    // Fetch user info
    const userResponse = await fetch(`${DISCORD_API_ENDPOINT}/users/@me`, {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    if (!userResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch user info' }, { status: 500 });
    }

    const userData = await userResponse.json();

    // Create JWT (DO NOT store guilds here, it exceeds 4KB cookie limit)
    const jwtToken = jwt.sign(
      {
        id: userData.id,
        username: userData.username,
        avatar: userData.avatar,
        access_token: access_token,
      },
      process.env.JWT_SECRET!,
      { expiresIn: '30d' }
    );

    // Set cookie
    const res = NextResponse.redirect(process.env.NEXT_PUBLIC_APP_URL!);
    res.cookies.set('auth_token', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    });

    return res;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

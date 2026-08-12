import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import connectToDatabase from '@/lib/mongodb';
import DashboardConfig from '@/lib/models/DashboardConfig';

const DISCORD_BG_CHANNEL_ID = '1536970444014616708';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    
    // Fetch fresh user data from Discord to update username dynamically
    if (decoded.access_token) {
      try {
        const userResponse = await fetch('https://discord.com/api/v10/users/@me', {
          headers: { Authorization: `Bearer ${decoded.access_token}` },
        });
        if (userResponse.ok) {
          const freshData = await userResponse.json();
          decoded.username = freshData.username;
        }
      } catch (e) {
        console.error("Failed to fetch fresh user data from Discord");
      }
    }

    // Verify VIP+ status
    await connectToDatabase();
    const dbData = await DashboardConfig.findById('dashboard_config');
    if (!dbData || !dbData.vipPlusUsers.includes(decoded.id)) {
      return NextResponse.json({ error: 'You must be a VIP+ to upload a background.' }, { status: 403 });
    }

    const { imageBase64 } = await req.json();
    if (!imageBase64) {
      return NextResponse.json({ error: 'No image provided.' }, { status: 400 });
    }

    // Extract base64 payload
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');
    const blob = new Blob([buffer], { type: 'image/png' });

    // Upload to Discord
    const formData = new FormData();
    formData.append('files[0]', blob, 'background.png');
    formData.append('payload_json', JSON.stringify({ 
      content: `**New VIP+ Background Upload**\nUser: \`${decoded.username}\`\nID: \`${decoded.id}\`` 
    }));

    const discordRes = await fetch(`https://discord.com/api/v10/channels/${DISCORD_BG_CHANNEL_ID}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`
      },
      body: formData
    });

    if (!discordRes.ok) {
      const errorText = await discordRes.text();
      console.error("Discord upload error", errorText);
      return NextResponse.json({ error: `Discord API Error: ${errorText}` }, { status: 500 });
    }

    const discordData = await discordRes.json();
    const imageUrl = discordData.attachments[0].url;

    // Save to Database
    dbData.vipBackgrounds.set(decoded.id, imageUrl);
    await dbData.save();

    return NextResponse.json({ message: 'Background updated successfully', imageUrl });
  } catch (error) {
    console.error('Upload Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

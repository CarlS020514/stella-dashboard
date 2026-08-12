import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const DISCORD_API = 'https://discord.com/api/v10';

export async function POST(request: Request) {
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

  try {
    const body = await request.json();
    const { channel_id, message_data, sender_name, sender_avatar } = body;

    if (!channel_id || !message_data) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const botToken = process.env.DISCORD_BOT_TOKEN;

    // If VIP features (custom name/avatar) are used, we must use a Webhook
    if (sender_name || sender_avatar) {
      // 1. Create Webhook
      const createHookRes = await fetch(`${DISCORD_API}/channels/${channel_id}/webhooks`, {
        method: 'POST',
        headers: {
          Authorization: `Bot ${botToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: 'Stella Dashboard' }),
      });

      if (!createHookRes.ok) {
        const err = await createHookRes.json();
        return NextResponse.json({ error: 'Failed to create webhook', details: err }, { status: createHookRes.status });
      }

      const webhook = await createHookRes.json();

      // 2. Execute Webhook
      const executePayload: any = {
        ...message_data
      };
      if (sender_name) executePayload.username = sender_name;
      if (sender_avatar) executePayload.avatar_url = sender_avatar;

      const executeRes = await fetch(`${DISCORD_API}/webhooks/${webhook.id}/${webhook.token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(executePayload),
      });

      if (!executeRes.ok) {
        const err = await executeRes.json();
        await fetch(`${DISCORD_API}/webhooks/${webhook.id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bot ${botToken}` }
        });
        return NextResponse.json({ error: 'Failed to execute webhook', details: err }, { status: executeRes.status });
      }

      // 3. Delete Webhook
      await fetch(`${DISCORD_API}/webhooks/${webhook.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bot ${botToken}` }
      });
    } else {
      // Normal Users: Send message directly through the Bot account
      const sendRes = await fetch(`${DISCORD_API}/channels/${channel_id}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bot ${botToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message_data),
      });

      if (!sendRes.ok) {
        const err = await sendRes.json();
        return NextResponse.json({ error: 'Failed to send message as bot', details: err }, { status: sendRes.status });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

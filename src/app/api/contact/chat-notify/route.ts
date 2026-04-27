import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { message, sessionId } = await req.json()
    if (!message) return NextResponse.json({ ok: true })

    // Save to DB as a chat-sourced contact message
    await prisma.contactMessage.create({
      data: {
        name: 'Chat Visitor',
        email: `chat-${sessionId ?? Date.now()}@unknown`,
        message: message.slice(0, 2000),
        source: 'ai_chat',
      },
    }).catch(() => {})

    // Push notification to Victor
    await fetch('https://notify.chrysoliteai.com/videbimus-contact', {
      method: 'POST',
      headers: {
        Title: '💬 New AI Chat Started',
        Priority: 'default',
        Tags: 'speech_balloon',
      },
      body: `Message: ${message.slice(0, 300)}`,
    }).catch(() => {})

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: true })
  }
}

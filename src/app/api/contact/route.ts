import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const LISTMONK_URL = process.env.LISTMONK_URL || 'https://mail.chrysoliteai.com'
const LISTMONK_AUTH = 'Basic ' + Buffer.from(
  `${process.env.LISTMONK_USER || 'admin'}:${process.env.LISTMONK_PASSWORD || 'b9df654ee3d95dc0021db4c17ae6204d'}`
).toString('base64')
const NTFY_URL = process.env.NTFY_URL || 'https://notify.chrysoliteai.com'
const NTFY_TOPIC = process.env.NTFY_TOPIC || 'videbimus-contact'
const OWNER_EMAILS = (process.env.CONTACT_OWNER_EMAIL || 'info@videbimusai.com,victoropp@gmail.com').split(',')
const NOTIFY_TEMPLATE_ID = parseInt(process.env.LISTMONK_CONTACT_NOTIFY_TEMPLATE || '12')
const AUTOREPLY_TEMPLATE_ID = parseInt(process.env.LISTMONK_CONTACT_AUTOREPLY_TEMPLATE || '13')

async function sendListmonkTx(templateId: number, toEmail: string, toName: string, data: Record<string, string>) {
  const res = await fetch(`${LISTMONK_URL}/api/tx`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: LISTMONK_AUTH },
    body: JSON.stringify({
      subscriber_email: toEmail,
      subscriber_name: toName,
      template_id: templateId,
      data,
    }),
  })
  if (!res.ok) console.error('Listmonk error:', res.status, await res.text())
}

async function sendNtfy(title: string, body: string, priority = 'high') {
  await fetch(`${NTFY_URL}/${NTFY_TOPIC}`, {
    method: 'POST',
    headers: { Title: title, Priority: priority, Tags: 'envelope' },
    body,
  }).catch(err => console.error('ntfy error:', err))
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, company, industry, service, timeline, budget, message, source = 'contact_form' } = body

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json({ error: 'Name, email and message are required' }, { status: 400 })
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    // 1. Save to database
    await prisma.contactMessage.create({
      data: { name, email, company, industry, service, timeline, budget, message, source },
    })

    const txData = {
      name: name || '',
      email: email || '',
      company: company || 'Not specified',
      industry: industry || 'Not specified',
      service: service || 'Not specified',
      timeline: timeline || 'Not specified',
      budget: budget || 'Not specified',
      message: message || '',
    }

    // 2 & 3. Email owners + auto-reply (parallel, fire-and-forget)
    Promise.all([
      ...OWNER_EMAILS.map(e => sendListmonkTx(NOTIFY_TEMPLATE_ID, e.trim(), 'Victor Collins Oppon', txData)),
      sendListmonkTx(AUTOREPLY_TEMPLATE_ID, email, name, txData),
    ]).catch(console.error)

    // 4. Push notification via ntfy
    const ntfyBody = [
      `From: ${name} <${email}>`,
      company ? `Company: ${company}` : null,
      industry ? `Industry: ${industry}` : null,
      `"${message.slice(0, 200)}${message.length > 200 ? '...' : ''}"`,
    ].filter(Boolean).join('\n')

    sendNtfy(`New contact: ${name}`, ntfyBody).catch(console.error)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Contact route error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

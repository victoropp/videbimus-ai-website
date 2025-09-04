import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { notFound } from 'next/navigation'
import { getServerAuthSession } from '@/lib/auth'
import { ConsultationRoomView } from '@/components/consultation/consultation-room-view'
import { api } from '@/lib/trpc/server'

interface ConsultationRoomPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: ConsultationRoomPageProps): Promise<Metadata> {
  try {
    const room = await api.consultation.getRoomById({ id: params.id })
    
    return {
      title: `${room.name} | Consultation Room | VidebimusAI`,
      description: room.description || `Consultation room: ${room.name}`,
    }
  } catch {
    return {
      title: 'Consultation Room | VidebimusAI',
      description: 'Consultation room collaboration space.',
    }
  }
}

export default async function ConsultationRoomPage({ params }: ConsultationRoomPageProps) {
  const session = await getServerAuthSession()

  if (!session) {
    redirect('/auth/signin')
  }

  try {
    const room = await api.consultation.getRoomById({ id: params.id })
    
    return (
      <div className="h-screen flex flex-col">
        <ConsultationRoomView room={room} currentUser={session.user} />
      </div>
    )
  } catch (error) {
    notFound()
  }
}
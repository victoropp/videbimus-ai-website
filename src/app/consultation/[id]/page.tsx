import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { notFound } from 'next/navigation'
import { getServerAuthSession } from '@/lib/auth'
import { ConsultationView } from '@/components/consultation/consultation-view'
import { api } from '@/lib/trpc/server'

interface ConsultationPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: ConsultationPageProps): Promise<Metadata> {
  try {
    const consultation = await api.consultation.getById({ id: params.id })
    
    return {
      title: `${consultation.title} | Consultation | VidebimusAI`,
      description: consultation.description || `Consultation: ${consultation.title}`,
    }
  } catch {
    return {
      title: 'Consultation | VidebimusAI',
      description: 'Consultation management and details.',
    }
  }
}

export default async function ConsultationPage({ params }: ConsultationPageProps) {
  const session = await getServerAuthSession()

  if (!session) {
    redirect('/auth/signin')
  }

  try {
    const consultation = await api.consultation.getById({ id: params.id })
    
    return (
      <div className="container mx-auto py-8 px-4">
        <ConsultationView consultation={consultation} currentUser={session.user} />
      </div>
    )
  } catch (error) {
    notFound()
  }
}
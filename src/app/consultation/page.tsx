import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getServerAuthSession } from '@/lib/auth'
import { ConsultationDashboard } from '@/components/consultation/consultation-dashboard'

export const metadata: Metadata = {
  title: 'Consultation Dashboard | VidebimusAI',
  description: 'Manage your consultations, rooms, and collaboration sessions.',
}

export default async function ConsultationPage() {
  const session = await getServerAuthSession()

  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Consultation Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Manage your consultations, rooms, and collaboration sessions.
          </p>
        </div>
      </div>
      
      <ConsultationDashboard />
    </div>
  )
}
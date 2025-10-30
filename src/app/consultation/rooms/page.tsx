import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getServerAuthSession } from '@/lib/auth'
import { ConsultationRoomsList } from '@/components/consultation/consultation-rooms-list'

export const metadata: Metadata = {
  title: 'Consultation Rooms | Videbimus AI',
  description: 'View and manage your consultation rooms.',
}

export default async function ConsultationRoomsPage() {
  const session = await getServerAuthSession()

  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Consultation Rooms</h1>
          <p className="text-gray-600 mt-2">
            View and manage your consultation rooms and collaboration sessions.
          </p>
        </div>
      </div>
      
      <ConsultationRoomsList />
    </div>
  )
}
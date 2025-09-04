import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getServerAuthSession } from '@/lib/auth'
import RoomsList from '@/components/collaboration/rooms-list'

export const metadata: Metadata = {
  title: 'Collaboration Rooms | VidebimusAI',
  description: 'Access your collaboration rooms and join virtual consultations.',
}

export default async function CollaborationPage() {
  const session = await getServerAuthSession()

  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Collaboration Rooms
          </h1>
          <p className="text-gray-600">
            Join your consultation rooms and collaborate in real-time with your team.
          </p>
        </div>

        <RoomsList />
      </div>
    </div>
  )
}
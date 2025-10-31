import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import { getServerAuthSession } from '@/lib/auth'
import { ConsultationDashboard } from '@/components/consultation/consultation-dashboard'

export const metadata: Metadata = {
  title: 'Consultation Dashboard | Videbimus AI',
  description: 'Manage your consultations, rooms, and collaboration sessions.',
}

export default async function ConsultationPage() {
  const session = await getServerAuthSession()

  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Hero Section */}
      <div className="relative mb-12 rounded-2xl overflow-hidden shadow-2xl">
        <Image
          src="/images/consultation/hero-consultation-hub.jpg"
          alt="Consultation Hub"
          width={1920}
          height={1080}
          className="w-full h-[350px] object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/95 via-indigo-800/85 to-purple-900/95"></div>
        <div className="absolute inset-0 flex flex-col justify-center px-8">
          <h1 className="text-5xl font-bold text-white mb-4">Consultation Hub</h1>
          <p className="text-xl text-white/90 max-w-3xl mb-6">
            Connect with our experts through secure video consultations, real-time collaboration,
            and comprehensive project planning. Your success is our mission.
          </p>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20">
              <p className="text-white/80 text-sm">Secure & Private</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20">
              <p className="text-white/80 text-sm">HD Video & Audio</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20">
              <p className="text-white/80 text-sm">Screen Sharing</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20">
              <p className="text-white/80 text-sm">Collaborative Whiteboard</p>
            </div>
          </div>
        </div>
      </div>

      <ConsultationDashboard />
    </div>
  )
}
import { Metadata } from 'next'
import Image from 'next/image'
import { ConsultationBookingForm } from '@/components/consultation/consultation-booking-form'
import { Calendar, CheckCircle, Video } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Book Consultation | Videbimus AI',
  description: 'Schedule a consultation session with our experts.',
}

export default function BookConsultationPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Book a Consultation</h1>
          <p className="text-lg text-gray-600">
            Schedule a consultation session with our experts to discuss your project needs.
          </p>
        </div>

        {/* Booking Process Steps */}
        <div className="mb-12 grid md:grid-cols-3 gap-6">
          <div className="relative group">
            <div className="relative rounded-xl overflow-hidden shadow-lg transition-transform duration-300 group-hover:scale-105">
              <Image
                src="/images/consultation/book-calendar.jpg"
                alt="Select Your Time"
                width={600}
                height={400}
                className="w-full h-[220px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/95 via-blue-800/70 to-transparent"></div>
              <div className="absolute top-4 left-4">
                <div className="bg-white text-blue-900 rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">
                  1
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-5 h-5" />
                  <h3 className="text-lg font-bold">Select Your Time</h3>
                </div>
                <p className="text-sm text-white/90">Choose a convenient date and time from available slots</p>
              </div>
            </div>
          </div>

          <div className="relative group">
            <div className="relative rounded-xl overflow-hidden shadow-lg transition-transform duration-300 group-hover:scale-105">
              <Image
                src="/images/consultation/book-video-prep.jpg"
                alt="Prepare Your Session"
                width={600}
                height={400}
                className="w-full h-[220px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-purple-900/95 via-purple-800/70 to-transparent"></div>
              <div className="absolute top-4 left-4">
                <div className="bg-white text-purple-900 rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">
                  2
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <div className="flex items-center gap-2 mb-1">
                  <Video className="w-5 h-5" />
                  <h3 className="text-lg font-bold">Prepare Your Session</h3>
                </div>
                <p className="text-sm text-white/90">Share your project details and consultation goals</p>
              </div>
            </div>
          </div>

          <div className="relative group">
            <div className="relative rounded-xl overflow-hidden shadow-lg transition-transform duration-300 group-hover:scale-105">
              <Image
                src="/images/consultation/book-confirmation.jpg"
                alt="Get Confirmation"
                width={600}
                height={400}
                className="w-full h-[220px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-green-900/95 via-green-800/70 to-transparent"></div>
              <div className="absolute top-4 left-4">
                <div className="bg-white text-green-900 rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">
                  3
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-5 h-5" />
                  <h3 className="text-lg font-bold">Get Confirmation</h3>
                </div>
                <p className="text-sm text-white/90">Receive instant confirmation with meeting details</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <ConsultationBookingForm />
        </div>
      </div>
    </div>
  )
}
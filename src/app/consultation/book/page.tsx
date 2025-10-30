import { Metadata } from 'next'
import { ConsultationBookingForm } from '@/components/consultation/consultation-booking-form'

export const metadata: Metadata = {
  title: 'Book Consultation | Videbimus AI',
  description: 'Schedule a consultation session with our experts.',
}

export default function BookConsultationPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Book a Consultation</h1>
          <p className="text-gray-600 mt-2">
            Schedule a consultation session with our experts to discuss your project needs.
          </p>
        </div>
        
        <ConsultationBookingForm />
      </div>
    </div>
  )
}
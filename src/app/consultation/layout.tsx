import { ReactNode } from 'react'

interface ConsultationLayoutProps {
  children: ReactNode
}

export default function ConsultationLayout({ children }: ConsultationLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  )
}
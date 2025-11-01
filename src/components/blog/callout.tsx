'use client'

import { AlertCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react'
import { ReactNode } from 'react'

type CalloutType = 'info' | 'warning' | 'success' | 'danger'

interface CalloutProps {
  type?: CalloutType
  title?: string
  children: ReactNode
}

const calloutStyles: Record<CalloutType, {
  container: string
  icon: string
  IconComponent: typeof Info
}> = {
  info: {
    container: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800',
    icon: 'text-blue-600 dark:text-blue-400',
    IconComponent: Info,
  },
  warning: {
    container: 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800',
    icon: 'text-yellow-600 dark:text-yellow-400',
    IconComponent: AlertTriangle,
  },
  success: {
    container: 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800',
    icon: 'text-green-600 dark:text-green-400',
    IconComponent: CheckCircle,
  },
  danger: {
    container: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800',
    icon: 'text-red-600 dark:text-red-400',
    IconComponent: AlertCircle,
  },
}

export function Callout({ type = 'info', title, children }: CalloutProps) {
  const style = calloutStyles[type]
  const Icon = style.IconComponent

  return (
    <div className={`my-6 rounded-lg border-l-4 p-6 ${style.container}`}>
      <div className="flex items-start gap-4">
        <Icon className={`h-6 w-6 flex-shrink-0 mt-0.5 ${style.icon}`} />
        <div className="flex-1">
          {title && (
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2 mt-0">
              {title}
            </h4>
          )}
          <div className="text-gray-700 dark:text-gray-300 [&>p]:my-2 [&>p:first-child]:mt-0 [&>p:last-child]:mb-0">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

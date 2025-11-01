'use client'

import Image from 'next/image'
import { useState } from 'react'

interface BlogImageProps {
  src: string
  alt: string
  caption?: string
  width?: number
  height?: number
  priority?: boolean
}

export function BlogImage({
  src,
  alt,
  caption,
  width = 1200,
  height = 675,
  priority = false,
}: BlogImageProps) {
  const [isLoading, setIsLoading] = useState(true)

  return (
    <figure className="my-8">
      <div className="relative overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          priority={priority}
          className={`
            w-full h-auto object-cover
            transition-all duration-300
            ${isLoading ? 'blur-sm scale-105' : 'blur-0 scale-100'}
          `}
          onLoadingComplete={() => setIsLoading(false)}
          style={{
            aspectRatio: `${width} / ${height}`,
          }}
        />
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-cyan-500" />
          </div>
        )}
      </div>
      {caption && (
        <figcaption className="mt-3 text-center text-sm text-gray-600 dark:text-gray-400 italic">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}

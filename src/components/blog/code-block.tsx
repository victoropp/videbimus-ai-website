'use client'

import React, { useState } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useTheme } from 'next-themes'
import { Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface CodeBlockProps {
  code: string
  language?: string
  showLineNumbers?: boolean
  className?: string
}

export function CodeBlock({
  code,
  language = 'javascript',
  showLineNumbers = true,
  className,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Handle mounting to prevent hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  const currentTheme = mounted ? (resolvedTheme || theme) : 'light'
  const syntaxTheme = currentTheme === 'dark' ? atomDark : tomorrow

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={cn('group relative rounded-lg overflow-hidden', className)}>
      {/* Language label and copy button header */}
      <div className="flex items-center justify-between bg-gray-800 dark:bg-gray-900 px-4 py-2 border-b border-gray-700">
        <span className="text-xs font-mono text-gray-300 uppercase tracking-wider">
          {language}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCopy}
          className="h-8 w-8 text-gray-300 hover:text-white hover:bg-gray-700 transition-all duration-200"
          aria-label={copied ? 'Copied!' : 'Copy code'}
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-400" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Code content */}
      <div className="relative overflow-x-auto">
        <SyntaxHighlighter
          language={language}
          style={syntaxTheme}
          showLineNumbers={showLineNumbers}
          customStyle={{
            margin: 0,
            padding: '1.25rem',
            fontSize: '0.875rem',
            lineHeight: '1.7',
            borderRadius: 0,
            background: currentTheme === 'dark' ? '#1a1a1a' : '#fafafa',
          }}
          codeTagProps={{
            style: {
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            },
          }}
          lineNumberStyle={{
            minWidth: '3em',
            paddingRight: '1.5em',
            color: currentTheme === 'dark' ? '#666' : '#999',
            userSelect: 'none',
          }}
          wrapLines={true}
          wrapLongLines={false}
        >
          {code}
        </SyntaxHighlighter>
      </div>

      {/* Hover effect overlay */}
      <div className="absolute inset-0 pointer-events-none border-2 border-transparent group-hover:border-cyan-500/20 transition-colors duration-300 rounded-lg" />
    </div>
  )
}

export default CodeBlock

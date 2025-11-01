# Blog Components Usage Examples

## CodeBlock Component

The `CodeBlock` component provides professional syntax highlighting with copy-to-clipboard functionality.

### Basic Usage

```tsx
import { CodeBlock } from '@/components/blog/code-block'

function MyBlogPost() {
  const codeExample = `
function fibonacci(n) {
  if (n <= 1) return n
  return fibonacci(n - 1) + fibonacci(n - 2)
}
  `.trim()

  return (
    <CodeBlock
      code={codeExample}
      language="javascript"
      showLineNumbers={true}
    />
  )
}
```

### Features

- **Language Support**: Supports all languages from Prism.js
- **Copy Button**: Automatic clipboard copy with success feedback
- **Theme Support**: Automatically switches between light/dark themes
- **Line Numbers**: Optional line numbers (enabled by default)
- **Responsive**: Horizontal scroll for long lines

### Props

```tsx
interface CodeBlockProps {
  code: string              // The code to display
  language?: string         // Programming language (default: 'javascript')
  showLineNumbers?: boolean // Show line numbers (default: true)
  className?: string        // Additional CSS classes
}
```

### Supported Languages

Common languages include:
- `javascript`, `typescript`, `jsx`, `tsx`
- `python`, `java`, `csharp`, `go`, `rust`
- `html`, `css`, `scss`, `sass`
- `json`, `yaml`, `markdown`
- `sql`, `bash`, `shell`

---

## TableOfContents Component

The `TableOfContents` component auto-generates an interactive table of contents from markdown content.

### Basic Usage

```tsx
import { TableOfContents } from '@/components/blog/table-of-contents'

function BlogPost() {
  const markdownContent = `
## Introduction
This is the introduction section.

## Getting Started
Let's get started with the basics.

### Installation
Install the required packages.

### Configuration
Configure your settings.

## Advanced Topics
Dive deeper into advanced concepts.
  `.trim()

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <div className="lg:col-span-3">
        {/* Your blog content here */}
      </div>
      <aside className="lg:col-span-1">
        <TableOfContents content={markdownContent} />
      </aside>
    </div>
  )
}
```

### Features

- **Auto-Generation**: Extracts H2 and H3 headings from markdown
- **Active Highlighting**: Highlights current section as you scroll
- **Smooth Navigation**: Click to jump to sections with smooth scrolling
- **Sticky Positioning**: Stays visible while scrolling (top-24)
- **Responsive**: Adapts to different screen sizes
- **Animations**: Smooth hover effects with Framer Motion

### Props

```tsx
interface TableOfContentsProps {
  content: string   // Markdown content to parse
  className?: string // Additional CSS classes
}
```

### How It Works

1. **Extraction**: Uses regex `/^#{2,3}\s+(.+)$/gm` to find H2 and H3 headings
2. **ID Generation**: Creates URL-safe IDs from heading text
3. **DOM Manipulation**: Adds IDs to actual heading elements
4. **Intersection Observer**: Tracks which section is currently visible
5. **Active State**: Highlights the active section with cyan styling

### Layout Example

```tsx
<div className="container mx-auto px-4 py-12">
  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
    {/* Main content */}
    <article className="lg:col-span-8">
      <h1>Blog Post Title</h1>
      <ReactMarkdown>{content}</ReactMarkdown>
    </article>

    {/* Sidebar with TOC */}
    <aside className="lg:col-span-4">
      <TableOfContents content={content} />
    </aside>
  </div>
</div>
```

---

## Combined Usage

Here's a complete example using both components together:

```tsx
'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { CodeBlock } from '@/components/blog/code-block'
import { TableOfContents } from '@/components/blog/table-of-contents'

export default function BlogPostPage({ post }) {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content */}
        <article className="lg:col-span-8 prose prose-lg max-w-none">
          <h1>{post.title}</h1>

          <ReactMarkdown
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '')
                const codeString = String(children).replace(/\n$/, '')

                return !inline && match ? (
                  <CodeBlock
                    code={codeString}
                    language={match[1]}
                    showLineNumbers={true}
                  />
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                )
              },
            }}
          >
            {post.content}
          </ReactMarkdown>
        </article>

        {/* Sidebar */}
        <aside className="lg:col-span-4">
          <TableOfContents content={post.content} />
        </aside>
      </div>
    </div>
  )
}
```

---

## Styling Notes

### Dark Mode

Both components automatically support dark mode via `next-themes`:

- **CodeBlock**: Uses `atomDark` theme in dark mode, `tomorrow` in light mode
- **TableOfContents**: Adapts text and border colors based on theme

### Customization

You can customize the components by passing additional classes:

```tsx
<CodeBlock
  code={code}
  language="typescript"
  className="my-8 shadow-2xl"
/>

<TableOfContents
  content={content}
  className="border-2 border-cyan-500"
/>
```

### Tailwind CSS Classes Used

The components use the project's design system:
- Primary colors: `cyan-500`, `purple-500`
- Gray scale: `gray-100` through `gray-900`
- Transitions: `transition-all duration-200/300`
- Hover effects: `hover:` states for interactive elements

---

## Accessibility

Both components follow accessibility best practices:

- **CodeBlock**:
  - Proper `aria-label` on copy button
  - Visual feedback for copy action
  - Keyboard accessible

- **TableOfContents**:
  - Semantic `<nav>` with `aria-label`
  - Proper heading hierarchy
  - Focus states for keyboard navigation
  - Screen reader friendly link text

---

## Performance Considerations

- **CodeBlock**: Uses `react-syntax-highlighter` with code-splitting
- **TableOfContents**: Uses `useMemo` to cache heading extraction
- **Intersection Observer**: Efficient scroll tracking without performance impact
- **Framer Motion**: Optimized animations with GPU acceleration

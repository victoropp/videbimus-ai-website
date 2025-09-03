import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/auth'
import { authOptions } from '@/auth'
import { prisma } from '@/lib/prisma'
import sharp from 'sharp'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads', 'blog')

// Ensure upload directory exists
async function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true })
  }
}

// Generate unique filename
function generateFilename(originalName: string) {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 15)
  const extension = originalName.split('.').pop()
  return `${timestamp}-${random}.${extension}`
}

// GET /api/blog/images - Get blog images
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const blogPostId = searchParams.get('blogPostId')

    const where = blogPostId ? { blogPostId } : {}

    const total = await prisma.blogImage.count({ where })

    const images = await prisma.blogImage.findMany({
      where,
      include: {
        blogPost: {
          select: {
            id: true,
            title: true,
            slug: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    })

    return NextResponse.json({
      images,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching images:', error)
    return NextResponse.json(
      { error: 'Failed to fetch images' },
      { status: 500 }
    )
  }
}

// POST /api/blog/images - Upload blog images
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Only admins and consultants can upload images
    if (!['ADMIN', 'CONSULTANT'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    await ensureUploadDir()

    const formData = await request.formData()
    const file = formData.get('file') as File
    const alt = formData.get('alt') as string
    const caption = formData.get('caption') as string
    const blogPostId = formData.get('blogPostId') as string

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      )
    }

    // Validate blog post exists if provided
    if (blogPostId) {
      const blogPost = await prisma.blogPost.findUnique({
        where: { id: blogPostId }
      })

      if (!blogPost) {
        return NextResponse.json(
          { error: 'Blog post not found' },
          { status: 400 }
        )
      }

      // Check if user can edit this post
      if (blogPost.authorId !== session.user.id && session.user.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Insufficient permissions to add images to this post' },
          { status: 403 }
        )
      }
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate filename
    const filename = generateFilename(file.name)
    const filepath = join(UPLOAD_DIR, filename)

    // Process image with Sharp
    let processedBuffer = buffer
    let width: number | undefined
    let height: number | undefined

    try {
      const image = sharp(buffer)
      const metadata = await image.metadata()
      
      width = metadata.width
      height = metadata.height

      // Resize if too large (max 2048px on any side)
      if (width && height && (width > 2048 || height > 2048)) {
        processedBuffer = await image
          .resize(2048, 2048, {
            fit: 'inside',
            withoutEnlargement: true
          })
          .toBuffer()

        const resizedMetadata = await sharp(processedBuffer).metadata()
        width = resizedMetadata.width
        height = resizedMetadata.height
      }

      // Optimize based on format
      if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
        processedBuffer = await sharp(processedBuffer)
          .jpeg({ quality: 85, progressive: true })
          .toBuffer()
      } else if (file.type === 'image/png') {
        processedBuffer = await sharp(processedBuffer)
          .png({ compressionLevel: 9, progressive: true })
          .toBuffer()
      } else if (file.type === 'image/webp') {
        processedBuffer = await sharp(processedBuffer)
          .webp({ quality: 85 })
          .toBuffer()
      }
    } catch (error) {
      console.error('Error processing image:', error)
      // Fallback to original buffer if processing fails
    }

    // Save file
    await writeFile(filepath, processedBuffer)

    // Save to database
    const url = `/uploads/blog/${filename}`
    
    const blogImage = await prisma.blogImage.create({
      data: {
        filename,
        originalName: file.name,
        alt,
        caption,
        url,
        width,
        height,
        size: processedBuffer.length,
        mimeType: file.type,
        blogPostId: blogPostId || null
      }
    })

    return NextResponse.json(blogImage, { status: 201 })
  } catch (error) {
    console.error('Error uploading image:', error)
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    )
  }
}

// DELETE /api/blog/images - Delete blog images
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const imageId = searchParams.get('id')

    if (!imageId) {
      return NextResponse.json(
        { error: 'Image ID is required' },
        { status: 400 }
      )
    }

    // Find image
    const image = await prisma.blogImage.findUnique({
      where: { id: imageId },
      include: {
        blogPost: true
      }
    })

    if (!image) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      )
    }

    // Check permissions
    if (image.blogPost) {
      if (image.blogPost.authorId !== session.user.id && session.user.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        )
      }
    } else if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Delete from database
    await prisma.blogImage.delete({
      where: { id: imageId }
    })

    // Delete file (optional - you might want to keep files for recovery)
    try {
      const filepath = join(UPLOAD_DIR, image.filename)
      if (existsSync(filepath)) {
        await import('fs/promises').then(fs => fs.unlink(filepath))
      }
    } catch (error) {
      console.error('Error deleting file:', error)
      // Don't fail the request if file deletion fails
    }

    return NextResponse.json({ message: 'Image deleted successfully' })
  } catch (error) {
    console.error('Error deleting image:', error)
    return NextResponse.json(
      { error: 'Failed to delete image' },
      { status: 500 }
    )
  }
}
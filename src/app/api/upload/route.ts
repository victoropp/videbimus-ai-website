import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/auth"
import { prisma } from "@/lib/prisma"
import { validateFileType, validateFileSize, generateSecureFilename } from "@/lib/security"
import { writeFile, mkdir, rename, unlink } from "fs/promises"
import path from "path"

const UPLOAD_DIR = path.join(process.cwd(), "public/uploads")
const MAX_FILE_SIZE = parseInt(process.env.UPLOAD_MAX_SIZE || "10485760") // 10MB
const ALLOWED_TYPES = (process.env.ALLOWED_FILE_TYPES || "image/jpeg,image/png,image/webp,application/pdf").split(",")

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get("file") as File
    const projectId = formData.get("projectId") as string
    const consultationId = formData.get("consultationId") as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file
    if (!validateFileType(file, ALLOWED_TYPES)) {
      return NextResponse.json(
        { error: `File type not allowed. Allowed types: ${ALLOWED_TYPES.join(", ")}` },
        { status: 400 }
      )
    }

    if (!validateFileSize(file, MAX_FILE_SIZE)) {
      return NextResponse.json(
        { error: `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      )
    }

    // Verify project or consultation ownership
    if (projectId) {
      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
          userId: session.user.id,
        },
      })

      if (!project) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 })
      }
    }

    if (consultationId) {
      const consultation = await prisma.consultation.findFirst({
        where: {
          id: consultationId,
          userId: session.user.id,
        },
      })

      if (!consultation) {
        return NextResponse.json({ error: "Consultation not found" }, { status: 404 })
      }
    }

    // Create upload directory if it doesn't exist
    try {
      await mkdir(UPLOAD_DIR, { recursive: true })
    } catch (error) {
      // Directory might already exist
    }

    // Generate secure filename
    const secureFilename = generateSecureFilename(file.name)
    const tempPath = path.join(UPLOAD_DIR, `${secureFilename}.tmp`)
    const finalPath = path.join(UPLOAD_DIR, secureFilename)
    const fileUrl = `/uploads/${secureFilename}`

    try {
      // Write to temp file first
      const bytes = await file.arrayBuffer()
      await writeFile(tempPath, Buffer.from(bytes))

      // Save file record to database and rename atomically in transaction
      if (projectId) {
        const fileRecord = await prisma.$transaction(async (tx) => {
          const record = await tx.projectFile.create({
            data: {
              filename: secureFilename,
              originalName: file.name,
              mimeType: file.type,
              size: file.size,
              url: fileUrl,
              projectId,
            },
          })

          // Atomic rename after database record created
          await rename(tempPath, finalPath)
          return record
        })

        return NextResponse.json({
          message: "File uploaded successfully",
          file: fileRecord,
        })
      } else if (consultationId) {
        const fileRecord = await prisma.$transaction(async (tx) => {
          const record = await tx.consultationFile.create({
            data: {
              filename: secureFilename,
              originalName: file.name,
              mimeType: file.type,
              size: file.size,
              url: fileUrl,
              consultationId,
            },
          })

          // Atomic rename after database record created
          await rename(tempPath, finalPath)
          return record
        })

        return NextResponse.json({
          message: "File uploaded successfully",
          file: fileRecord,
        })
      } else {
        // Generic file upload (could be extended for other purposes)
        await rename(tempPath, finalPath)

        return NextResponse.json({
          message: "File uploaded successfully",
          file: {
            filename: secureFilename,
            originalName: file.name,
            mimeType: file.type,
            size: file.size,
            url: fileUrl,
          },
        })
      }
    } catch (error) {
      // Clean up temp file on error
      try {
        await unlink(tempPath)
      } catch (cleanupError) {
        // Ignore cleanup errors
      }
      throw error
    }
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get("projectId")
    const consultationId = searchParams.get("consultationId")

    if (projectId) {
      // Verify project ownership
      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
          userId: session.user.id,
        },
      })

      if (!project) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 })
      }

      const files = await prisma.projectFile.findMany({
        where: { projectId },
        orderBy: { createdAt: "desc" },
      })

      return NextResponse.json({ files })
    } else if (consultationId) {
      // Verify consultation ownership
      const consultation = await prisma.consultation.findFirst({
        where: {
          id: consultationId,
          userId: session.user.id,
        },
      })

      if (!consultation) {
        return NextResponse.json({ error: "Consultation not found" }, { status: 404 })
      }

      const files = await prisma.consultationFile.findMany({
        where: { consultationId },
        orderBy: { createdAt: "desc" },
      })

      return NextResponse.json({ files })
    } else {
      return NextResponse.json({ error: "Project ID or Consultation ID required" }, { status: 400 })
    }
  } catch (error) {
    console.error("Get files error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get("fileId")
    const fileType = searchParams.get("type") // "project" or "consultation"

    if (!fileId || !fileType) {
      return NextResponse.json({ error: "File ID and type required" }, { status: 400 })
    }

    if (fileType === "project") {
      // Verify file belongs to user's project
      const file = await prisma.projectFile.findFirst({
        where: {
          id: fileId,
          project: {
            userId: session.user.id,
          },
        },
      })

      if (!file) {
        return NextResponse.json({ error: "File not found" }, { status: 404 })
      }

      await prisma.projectFile.delete({
        where: { id: fileId },
      })

      // TODO: Delete physical file from filesystem
      
      return NextResponse.json({ message: "File deleted successfully" })
    } else if (fileType === "consultation") {
      // Verify file belongs to user's consultation
      const file = await prisma.consultationFile.findFirst({
        where: {
          id: fileId,
          consultation: {
            userId: session.user.id,
          },
        },
      })

      if (!file) {
        return NextResponse.json({ error: "File not found" }, { status: 404 })
      }

      await prisma.consultationFile.delete({
        where: { id: fileId },
      })

      return NextResponse.json({ message: "File deleted successfully" })
    } else {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 })
    }
  } catch (error) {
    console.error("Delete file error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
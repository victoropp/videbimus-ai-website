import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authConfig } from "@/auth"
import { prisma } from "@/lib/prisma"
import { validateFileType, validateFileSize, generateSecureFilename } from "@/lib/security"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

const UPLOAD_DIR = path.join(process.cwd(), "public/uploads")
const MAX_FILE_SIZE = parseInt(process.env.UPLOAD_MAX_SIZE || "10485760") // 10MB
const ALLOWED_TYPES = (process.env.ALLOWED_FILE_TYPES || "image/jpeg,image/png,image/webp,application/pdf").split(",")

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authConfig)
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

    // Generate secure filename and save file
    const secureFilename = generateSecureFilename(file.name)
    const filePath = path.join(UPLOAD_DIR, secureFilename)
    
    const bytes = await file.arrayBuffer()
    await writeFile(filePath, Buffer.from(bytes))

    const fileUrl = `/uploads/${secureFilename}`

    // Save file record to database
    if (projectId) {
      const fileRecord = await prisma.projectFile.create({
        data: {
          filename: secureFilename,
          originalName: file.name,
          mimeType: file.type,
          size: file.size,
          url: fileUrl,
          projectId,
        },
      })

      return NextResponse.json({
        message: "File uploaded successfully",
        file: fileRecord,
      })
    } else if (consultationId) {
      const fileRecord = await prisma.consultationFile.create({
        data: {
          filename: secureFilename,
          originalName: file.name,
          mimeType: file.type,
          size: file.size,
          url: fileUrl,
          consultationId,
        },
      })

      return NextResponse.json({
        message: "File uploaded successfully",
        file: fileRecord,
      })
    } else {
      // Generic file upload (could be extended for other purposes)
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
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
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
    const session = await getServerSession(authConfig)
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
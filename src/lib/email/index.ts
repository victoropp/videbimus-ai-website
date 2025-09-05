import { Resend } from "resend"
import { render } from "@react-email/render"
import { ContactNotificationEmail } from "./templates/contact-notification"
import { WelcomeEmail } from "./templates/welcome"

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key_for_build')

interface ContactNotificationData {
  name: string
  email: string
  company?: string
  phone?: string
  subject: string
  message: string
  contactId: string
}

interface WelcomeEmailData {
  email: string
  name?: string
}

export async function sendContactNotificationEmail(data: ContactNotificationData) {
  const { name, email, company, phone, subject, message, contactId } = data

  try {
    const emailHtml = await render(ContactNotificationEmail({
      name,
      email,
      company,
      phone,
      subject,
      message,
      contactId,
    }))

    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM || "noreply@videbimusai.com",
      to: process.env.ADMIN_EMAIL || "admin@videbimusai.com",
      subject: `New Contact Form Submission: ${subject}`,
      html: emailHtml,
      replyTo: email,
    })

    console.log("Contact notification email sent:", result)
    return result
  } catch (error) {
    console.error("Failed to send contact notification email:", error)
    throw error
  }
}

export async function sendWelcomeEmail(data: WelcomeEmailData) {
  const { email, name } = data

  try {
    const emailHtml = await render(WelcomeEmail({
      email,
      name,
    }))

    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM || "noreply@videbimusai.com",
      to: email,
      subject: "Welcome to Videbimus AI Newsletter!",
      html: emailHtml,
    })

    console.log("Welcome email sent:", result)
    return result
  } catch (error) {
    console.error("Failed to send welcome email:", error)
    throw error
  }
}

export async function sendPasswordResetEmail(email: string, resetToken: string) {
  try {
    const resetUrl = `${process.env.APP_URL}/auth/reset-password?token=${resetToken}`

    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM || "noreply@videbimusai.com",
      to: email,
      subject: "Reset Your Password - Videbimus AI",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Reset Your Password</h2>
          <p>You requested to reset your password. Click the link below to set a new password:</p>
          <a href="${resetUrl}" style="display: inline-block; background: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 16px 0;">
            Reset Password
          </a>
          <p>If you didn't request this, you can safely ignore this email.</p>
          <p>This link will expire in 1 hour.</p>
          <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 14px;">
            Videbimus AI - Your AI Consulting Partner
          </p>
        </div>
      `,
    })

    console.log("Password reset email sent:", result)
    return result
  } catch (error) {
    console.error("Failed to send password reset email:", error)
    throw error
  }
}

export async function sendProjectUpdateEmail(
  userEmail: string,
  userName: string,
  projectTitle: string,
  updateMessage: string
) {
  try {
    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM || "noreply@videbimusai.com",
      to: userEmail,
      subject: `Project Update: ${projectTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Project Update</h2>
          <p>Hello ${userName},</p>
          <p>We have an update on your project: <strong>${projectTitle}</strong></p>
          <div style="background: #f8f9fa; padding: 16px; border-left: 4px solid #0066cc; margin: 16px 0;">
            <p>${updateMessage}</p>
          </div>
          <p>You can view your project details in your dashboard.</p>
          <a href="${process.env.APP_URL}/dashboard/projects" style="display: inline-block; background: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 16px 0;">
            View Project
          </a>
          <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 14px;">
            Videbimus AI - Your AI Consulting Partner
          </p>
        </div>
      `,
    })

    console.log("Project update email sent:", result)
    return result
  } catch (error) {
    console.error("Failed to send project update email:", error)
    throw error
  }
}
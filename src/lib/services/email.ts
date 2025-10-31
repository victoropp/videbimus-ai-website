import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import { render } from '@react-email/render';
import { getEmailConfig } from '../config/services';
import { withErrorHandling, ServiceErrorType, CustomServiceError } from './error-handler';
import { ContactNotificationEmail } from '../email/templates/contact-notification';
import { WelcomeEmail } from '../email/templates/welcome';

export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface EmailOptions {
  to: EmailRecipient | EmailRecipient[];
  from?: EmailRecipient;
  replyTo?: string;
  cc?: EmailRecipient[];
  bcc?: EmailRecipient[];
  attachments?: {
    filename: string;
    content: Buffer | string;
    contentType?: string;
    cid?: string;
  }[];
  tags?: string[];
  headers?: Record<string, string>;
  scheduledAt?: Date;
  trackOpens?: boolean;
  trackClicks?: boolean;
}

export interface EmailSendResult {
  id: string;
  status: 'sent' | 'queued' | 'failed';
  recipient: string;
  error?: string;
}

export interface BulkEmailResult {
  sent: number;
  failed: number;
  results: EmailSendResult[];
}

export interface EmailStats {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  complained: number;
  unsubscribed: number;
  failed: number;
}

export interface ContactNotificationData {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  subject: string;
  message: string;
  contactId: string;
}

export interface WelcomeEmailData {
  email: string;
  name?: string;
  verificationUrl?: string;
}

export interface ProjectUpdateData {
  userEmail: string;
  userName: string;
  projectTitle: string;
  updateMessage: string;
  projectUrl?: string;
}

export interface PasswordResetData {
  email: string;
  resetUrl: string;
  expiresAt: Date;
}

export interface InvoiceData {
  userEmail: string;
  userName: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  dueDate: Date;
  downloadUrl: string;
}

export interface NewsletterData {
  title: string;
  content: string;
  previewText?: string;
  unsubscribeUrl: string;
}

class EmailService {
  private resend: Resend;
  private smtp?: nodemailer.Transporter;
  private config: ReturnType<typeof getEmailConfig>;
  private emailStats: Map<string, EmailStats> = new Map();

  constructor() {
    this.config = getEmailConfig();
    
    // Initialize Resend
    this.resend = new Resend(this.config.resend.apiKey);
    
    // Initialize SMTP if configured
    if (this.config.smtp) {
      this.smtp = nodemailer.createTransport({
        host: this.config.smtp.host,
        port: this.config.smtp.port,
        secure: this.config.smtp.secure,
        auth: this.config.smtp.user && this.config.smtp.password ? {
          user: this.config.smtp.user,
          pass: this.config.smtp.password,
        } : undefined,
      });
    }
  }

  // Send email using Resend
  async sendEmail(
    template: EmailTemplate,
    options: EmailOptions,
    provider: 'resend' | 'smtp' = 'resend'
  ): Promise<EmailSendResult> {
    try {
      if (provider === 'resend') {
        return await this.sendWithResend(template, options);
      } else if (provider === 'smtp' && this.smtp) {
        return await this.sendWithSMTP(template, options);
      } else {
        throw new Error('SMTP not configured');
      }
    } catch (error) {
      throw new CustomServiceError({
        type: ServiceErrorType.EMAIL,
        service: 'email',
        operation: 'sendEmail',
        message: `Failed to send email: ${error.message}`,
        retryable: true,
        originalError: error as Error,
        metadata: {
          provider,
          recipient: Array.isArray(options.to) ? options.to.map(r => r.email) : options.to.email,
          subject: template.subject,
        },
      });
    }
  }

  private async sendWithResend(template: EmailTemplate, options: EmailOptions): Promise<EmailSendResult> {
    const recipients = Array.isArray(options.to) ? options.to : [options.to];
    
    if (recipients.length > 1) {
      throw new Error('Resend does not support multiple recipients in a single call');
    }

    const recipient = recipients[0];
    
    try {
      const result = await this.resend.emails.send({
        from: options.from ? `${options.from.name} <${options.from.email}>` : this.config.resend.fromEmail,
        to: `${recipient.name || ''} <${recipient.email}>`.trim(),
        subject: template.subject,
        html: template.html,
        text: template.text,
        replyTo: options.replyTo,
        cc: options.cc?.map(r => `${r.name || ''} <${r.email}>`.trim()),
        bcc: options.bcc?.map(r => `${r.name || ''} <${r.email}>`.trim()),
        attachments: options.attachments?.map(att => ({
          filename: att.filename,
          content: att.content,
          content_type: att.contentType,
          cid: att.cid,
        })),
        tags: options.tags?.map(tag => ({ name: tag, value: 'true' })),
        headers: options.headers,
      });

      // Update stats
      this.updateEmailStats('sent', 1);

      return {
        id: result.data?.id || 'unknown',
        status: 'sent',
        recipient: recipient.email,
      };
    } catch (error) {
      this.updateEmailStats('failed', 1);
      throw error;
    }
  }

  private async sendWithSMTP(template: EmailTemplate, options: EmailOptions): Promise<EmailSendResult> {
    if (!this.smtp) {
      throw new Error('SMTP transporter not initialized');
    }

    const recipients = Array.isArray(options.to) ? options.to : [options.to];
    const recipient = recipients[0]; // SMTP can handle multiple recipients, but we'll use the first one

    try {
      const result = await this.smtp.sendMail({
        from: options.from ? `${options.from.name} <${options.from.email}>` : this.config.resend.fromEmail,
        to: recipients.map(r => `${r.name || ''} <${r.email}>`.trim()),
        subject: template.subject,
        html: template.html,
        text: template.text,
        replyTo: options.replyTo,
        cc: options.cc?.map(r => `${r.name || ''} <${r.email}>`.trim()),
        bcc: options.bcc?.map(r => `${r.name || ''} <${r.email}>`.trim()),
        attachments: options.attachments?.map(att => ({
          filename: att.filename,
          content: att.content,
          contentType: att.contentType,
          cid: att.cid,
        })),
        headers: options.headers,
      });

      this.updateEmailStats('sent', 1);

      return {
        id: result.messageId,
        status: 'sent',
        recipient: recipient.email,
      };
    } catch (error) {
      this.updateEmailStats('failed', 1);
      throw error;
    }
  }

  // Send bulk emails
  async sendBulkEmail(
    template: EmailTemplate,
    recipients: EmailRecipient[],
    options: Omit<EmailOptions, 'to'> = {},
    provider: 'resend' | 'smtp' = 'resend'
  ): Promise<BulkEmailResult> {
    const results: EmailSendResult[] = [];
    let sent = 0;
    let failed = 0;

    // Send emails in batches to avoid rate limits
    const batchSize = 10;
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (recipient) => {
        try {
          const result = await this.sendEmail(template, {
            ...options,
            to: recipient,
          }, provider);
          sent++;
          return result;
        } catch (error) {
          failed++;
          return {
            id: 'failed',
            status: 'failed' as const,
            recipient: recipient.email,
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Add delay between batches to respect rate limits
      if (i + batchSize < recipients.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return { sent, failed, results };
  }

  // Template methods
  async sendContactNotificationEmail(data: ContactNotificationData): Promise<EmailSendResult> {
    try {
      const html = await render(ContactNotificationEmail(data));
      
      return await this.sendEmail(
        {
          subject: `New Contact Form Submission: ${data.subject}`,
          html,
        },
        {
          to: { email: process.env.ADMIN_EMAIL || 'admin@videbimusai.com' },
          replyTo: data.email,
          tags: ['contact-form'],
        }
      );
    } catch (error) {
      throw new CustomServiceError({
        type: ServiceErrorType.EMAIL,
        service: 'email',
        operation: 'sendContactNotificationEmail',
        message: `Failed to send contact notification: ${error.message}`,
        retryable: true,
        originalError: error as Error,
        metadata: { contactId: data.contactId, senderEmail: data.email },
      });
    }
  }

  async sendWelcomeEmail(data: WelcomeEmailData): Promise<EmailSendResult> {
    try {
      const html = await render(WelcomeEmail(data));
      
      return await this.sendEmail(
        {
          subject: 'Welcome to Videbimus AI!',
          html,
        },
        {
          to: { email: data.email, name: data.name },
          tags: ['welcome', 'onboarding'],
        }
      );
    } catch (error) {
      throw new CustomServiceError({
        type: ServiceErrorType.EMAIL,
        service: 'email',
        operation: 'sendWelcomeEmail',
        message: `Failed to send welcome email: ${error.message}`,
        retryable: true,
        originalError: error as Error,
        metadata: { email: data.email },
      });
    }
  }

  async sendProjectUpdateEmail(data: ProjectUpdateData): Promise<EmailSendResult> {
    const template = {
      subject: `Project Update: ${data.projectTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Project Update</h2>
          <p>Hello ${data.userName},</p>
          <p>We have an update on your project: <strong>${data.projectTitle}</strong></p>
          <div style="background: #f8f9fa; padding: 16px; border-left: 4px solid #0066cc; margin: 16px 0;">
            <p>${data.updateMessage}</p>
          </div>
          ${data.projectUrl ? `
            <p>You can view your project details:</p>
            <a href="${data.projectUrl}" style="display: inline-block; background: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 16px 0;">
              View Project
            </a>
          ` : ''}
          <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 14px;">
            Videbimus AI - Your AI Consulting Partner
          </p>
        </div>
      `,
    };

    return await this.sendEmail(template, {
      to: { email: data.userEmail, name: data.userName },
      tags: ['project-update', 'notification'],
    });
  }

  async sendPasswordResetEmail(data: PasswordResetData): Promise<EmailSendResult> {
    const template = {
      subject: 'Reset Your Password - Videbimus AI',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Reset Your Password</h2>
          <p>You requested to reset your password. Click the link below to set a new password:</p>
          <a href="${data.resetUrl}" style="display: inline-block; background: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 16px 0;">
            Reset Password
          </a>
          <p>If you didn't request this, you can safely ignore this email.</p>
          <p>This link will expire at ${data.expiresAt.toLocaleString()}.</p>
          <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 14px;">
            Videbimus AI - Your AI Consulting Partner
          </p>
        </div>
      `,
    };

    return await this.sendEmail(template, {
      to: { email: data.email },
      tags: ['password-reset', 'security'],
    });
  }

  async sendInvoiceEmail(data: InvoiceData): Promise<EmailSendResult> {
    const template = {
      subject: `Invoice ${data.invoiceNumber} - Videbimus AI`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>New Invoice</h2>
          <p>Hello ${data.userName},</p>
          <p>Please find your invoice details below:</p>
          <div style="background: #f8f9fa; padding: 16px; border-radius: 4px; margin: 16px 0;">
            <p><strong>Invoice Number:</strong> ${data.invoiceNumber}</p>
            <p><strong>Amount:</strong> ${data.currency} ${data.amount.toFixed(2)}</p>
            <p><strong>Due Date:</strong> ${data.dueDate.toLocaleDateString()}</p>
          </div>
          <a href="${data.downloadUrl}" style="display: inline-block; background: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 16px 0;">
            Download Invoice
          </a>
          <p>If you have any questions about this invoice, please don't hesitate to contact us.</p>
          <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 14px;">
            Videbimus AI - Your AI Consulting Partner
          </p>
        </div>
      `,
    };

    return await this.sendEmail(template, {
      to: { email: data.userEmail, name: data.userName },
      tags: ['invoice', 'billing'],
    });
  }

  async sendNewsletterEmail(
    data: NewsletterData,
    recipients: EmailRecipient[]
  ): Promise<BulkEmailResult> {
    const template = {
      subject: data.title,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>${data.title}</h1>
          ${data.previewText ? `<p style="font-size: 16px; color: #666; margin-bottom: 24px;">${data.previewText}</p>` : ''}
          <div style="line-height: 1.6;">
            ${data.content}
          </div>
          <hr style="margin: 32px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            You received this email because you subscribed to our newsletter. 
            <a href="${data.unsubscribeUrl}" style="color: #0066cc;">Unsubscribe</a>
          </p>
          <p style="color: #666; font-size: 12px;">
            Videbimus AI - Your AI Consulting Partner
          </p>
        </div>
      `,
    };

    return await this.sendBulkEmail(template, recipients, {
      tags: ['newsletter', 'marketing'],
    });
  }

  // Email verification
  async sendEmailVerification(email: string, verificationUrl: string): Promise<EmailSendResult> {
    const template = {
      subject: 'Verify Your Email - Videbimus AI',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Verify Your Email Address</h2>
          <p>Thank you for signing up! Please verify your email address by clicking the button below:</p>
          <a href="${verificationUrl}" style="display: inline-block; background: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 16px 0;">
            Verify Email
          </a>
          <p>If you didn't create an account with us, you can safely ignore this email.</p>
          <p>This link will expire in 24 hours.</p>
          <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 14px;">
            Videbimus AI - Your AI Consulting Partner
          </p>
        </div>
      `,
    };

    return await this.sendEmail(template, {
      to: { email },
      tags: ['email-verification', 'security'],
    });
  }

  // Get email statistics
  getEmailStats(): Record<string, EmailStats> {
    return Object.fromEntries(this.emailStats.entries());
  }

  // Reset email statistics
  resetEmailStats(): void {
    this.emailStats.clear();
  }

  // Health check
  async healthCheck(): Promise<{ resend: boolean; smtp?: boolean }> {
    const results: { resend: boolean; smtp?: boolean } = { resend: false };

    // Test Resend
    try {
      // Resend doesn't have a direct health check, so we'll check if we can list domains
      // This is a minimal API call that doesn't send emails
      await fetch('https://api.resend.com/domains', {
        headers: {
          'Authorization': `Bearer ${this.config.resend.apiKey}`,
        },
      });
      results.resend = true;
    } catch (error) {
      console.error('Resend health check failed:', error);
      results.resend = false;
    }

    // Test SMTP if configured
    if (this.smtp) {
      try {
        await this.smtp.verify();
        results.smtp = true;
      } catch (error) {
        console.error('SMTP health check failed:', error);
        results.smtp = false;
      }
    }

    return results;
  }

  // Private helper methods
  private updateEmailStats(type: keyof EmailStats, count: number): void {
    const today = new Date().toISOString().split('T')[0];
    const stats = this.emailStats.get(today) || {
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      bounced: 0,
      complained: 0,
      unsubscribed: 0,
      failed: 0,
    };

    stats[type] += count;
    this.emailStats.set(today, stats);
  }
}

// Create wrapped methods with error handling and retry logic
const rawEmailService = new EmailService();

export const emailService = {
  sendEmail: withErrorHandling('email', 'sendEmail', rawEmailService.sendEmail.bind(rawEmailService)),
  sendBulkEmail: withErrorHandling('email', 'sendBulkEmail', rawEmailService.sendBulkEmail.bind(rawEmailService)),
  sendContactNotificationEmail: withErrorHandling('email', 'sendContactNotificationEmail', rawEmailService.sendContactNotificationEmail.bind(rawEmailService)),
  sendWelcomeEmail: withErrorHandling('email', 'sendWelcomeEmail', rawEmailService.sendWelcomeEmail.bind(rawEmailService)),
  sendProjectUpdateEmail: withErrorHandling('email', 'sendProjectUpdateEmail', rawEmailService.sendProjectUpdateEmail.bind(rawEmailService)),
  sendPasswordResetEmail: withErrorHandling('email', 'sendPasswordResetEmail', rawEmailService.sendPasswordResetEmail.bind(rawEmailService)),
  sendInvoiceEmail: withErrorHandling('email', 'sendInvoiceEmail', rawEmailService.sendInvoiceEmail.bind(rawEmailService)),
  sendNewsletterEmail: withErrorHandling('email', 'sendNewsletterEmail', rawEmailService.sendNewsletterEmail.bind(rawEmailService)),
  sendEmailVerification: withErrorHandling('email', 'sendEmailVerification', rawEmailService.sendEmailVerification.bind(rawEmailService)),
  getEmailStats: rawEmailService.getEmailStats.bind(rawEmailService),
  resetEmailStats: rawEmailService.resetEmailStats.bind(rawEmailService),
  healthCheck: withErrorHandling('email', 'healthCheck', rawEmailService.healthCheck.bind(rawEmailService), { maxAttempts: 1 }),
};

export { EmailService };

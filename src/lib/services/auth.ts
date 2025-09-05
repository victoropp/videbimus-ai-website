// Remove NextAuthOptions import as it's not available in this version
import { PrismaAdapter } from '@auth/prisma-adapter';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '../prisma';
import { getAuthConfig } from '../config/services';
import { withErrorHandling, ServiceErrorType, CustomServiceError } from './error-handler';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  image?: string;
  role: 'USER' | 'ADMIN' | 'MODERATOR';
  emailVerified?: Date;
  createdAt: Date;
  updatedAt: Date;
  accounts: {
    provider: string;
    providerAccountId: string;
    type: string;
  }[];
  sessions: {
    sessionToken: string;
    expires: Date;
  }[];
  preferences?: {
    theme?: 'light' | 'dark' | 'system';
    language?: string;
    notifications?: {
      email: boolean;
      push: boolean;
      marketing: boolean;
    };
  };
}

export interface AuthSession {
  user: {
    id: string;
    email: string;
    name?: string;
    image?: string;
    role: string;
  };
  expires: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
  acceptTerms: boolean;
  subscribeNewsletter?: boolean;
}

export interface PasswordResetRequest {
  email: string;
  token?: string;
  newPassword?: string;
}

export interface EmailVerificationRequest {
  email: string;
  token?: string;
}

// Validation schemas
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean().optional(),
});

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  acceptTerms: z.boolean().refine(val => val === true, 'You must accept the terms and conditions'),
  subscribeNewsletter: z.boolean().optional(),
});

const passwordResetSchema = z.object({
  email: z.string().email('Invalid email address'),
  token: z.string().optional(),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number')
    .optional(),
});

class AuthService {
  private config: ReturnType<typeof getAuthConfig>;

  constructor() {
    this.config = getAuthConfig();
  }

  // Get NextAuth configuration
  getNextAuthConfig() {
    const providers = [];

    // Add Google provider if configured
    if (this.config.providers.google.enabled) {
      providers.push(
        GoogleProvider({
          clientId: this.config.providers.google.clientId!,
          clientSecret: this.config.providers.google.clientSecret!,
          authorization: {
            params: {
              prompt: 'consent',
              access_type: 'offline',
              response_type: 'code',
              scope: 'openid email profile https://www.googleapis.com/auth/calendar.readonly',
            },
          },
        })
      );
    }

    // Add GitHub provider if configured
    if (this.config.providers.github.enabled) {
      providers.push(
        GitHubProvider({
          clientId: this.config.providers.github.clientId!,
          clientSecret: this.config.providers.github.clientSecret!,
        })
      );
    }

    // Add credentials provider
    providers.push(
      CredentialsProvider({
        name: 'credentials',
        credentials: {
          email: { label: 'Email', type: 'email' },
          password: { label: 'Password', type: 'password' },
        },
        async authorize(credentials: any) {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }

          try {
            const user = await prisma.user.findUnique({
              where: { email: credentials.email },
              include: { accounts: true },
            });

            if (!user || !user.password) {
              return null;
            }

            const isPasswordValid = await bcrypt.compare(
              credentials.password,
              user.password
            );

            if (!isPasswordValid) {
              return null;
            }

            return {
              id: user.id,
              email: user.email,
              name: user.name,
              image: user.image,
              role: user.role,
            };
          } catch (error) {
            console.error('Auth error:', error);
            return null;
          }
        },
      })
    );

    return {
      adapter: PrismaAdapter(prisma),
      providers,
      session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
      },
      jwt: {
        maxAge: 30 * 24 * 60 * 60, // 30 days
      },
      pages: {
        signIn: '/auth/signin',
        signUp: '/auth/signup',
        error: '/auth/error',
        verifyRequest: '/auth/verify-request',
      },
      callbacks: {
        async jwt({ token, user, account }) {
          if (user) {
            token.role = user.role;
            token.id = user.id;
          }
          
          // Store OAuth tokens for API access
          if (account) {
            token.accessToken = account.access_token;
            token.refreshToken = account.refresh_token;
            token.provider = account.provider;
          }
          
          return token;
        },
        async session({ session, token }) {
          if (session.user) {
            session.user.role = token.role as string;
            session.user.id = token.id as string;
          }
          return session;
        },
        async signIn({ user, account, profile }) {
          try {
            // Handle OAuth sign-ins
            if (account?.provider === 'google' || account?.provider === 'github') {
              // Check if user already exists
              const existingUser = await prisma.user.findUnique({
                where: { email: user.email! },
              });

              if (existingUser) {
                // Link account if not already linked
                const existingAccount = await prisma.account.findUnique({
                  where: {
                    provider_providerAccountId: {
                      provider: account.provider,
                      providerAccountId: account.providerAccountId,
                    },
                  },
                });

                if (!existingAccount) {
                  await prisma.account.create({
                    data: {
                      userId: existingUser.id,
                      type: account.type,
                      provider: account.provider,
                      providerAccountId: account.providerAccountId,
                      access_token: account.access_token,
                      refresh_token: account.refresh_token,
                      expires_at: account.expires_at,
                      token_type: account.token_type,
                      scope: account.scope,
                      id_token: account.id_token,
                    },
                  });
                }

                return true;
              }

              // Create new user for OAuth sign-in
              const newUser = await prisma.user.create({
                data: {
                  email: user.email!,
                  name: user.name,
                  image: user.image,
                  emailVerified: new Date(),
                  role: 'CLIENT',
                },
              });

              // Create account record
              await prisma.account.create({
                data: {
                  userId: newUser.id,
                  type: account.type,
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  access_token: account.access_token,
                  refresh_token: account.refresh_token,
                  expires_at: account.expires_at,
                  token_type: account.token_type,
                  scope: account.scope,
                  id_token: account.id_token,
                },
              });

              return true;
            }

            return true;
          } catch (error) {
            console.error('Sign-in callback error:', error);
            return false;
          }
        },
      },
      events: {
        async signIn({ user, account, isNewUser }) {
          console.log(`User signed in: ${user.email} (${account?.provider || 'credentials'})`);
          
          if (isNewUser) {
            // Send welcome email, set up user preferences, etc.
            await this.handleNewUserSignup(user.id!);
          }
        },
        async signOut({ token }) {
          console.log(`User signed out: ${token?.email}`);
        },
      },
      debug: process.env.NODE_ENV === 'development',
    };
  }

  // Register new user with credentials
  async registerUser(data: RegisterData): Promise<{ user: UserProfile; needsVerification: boolean }> {
    try {
      // Validate input
      const validatedData = registerSchema.parse(data);

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: validatedData.email },
      });

      if (existingUser) {
        throw new CustomServiceError({
          type: ServiceErrorType.VALIDATION,
          service: 'auth',
          operation: 'registerUser',
          message: 'User with this email already exists',
          retryable: false,
          metadata: { email: validatedData.email },
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, 12);

      // Create user
      const user = await prisma.user.create({
        data: {
          email: validatedData.email,
          name: validatedData.name,
          password: hashedPassword,
          role: 'CLIENT',
          emailVerified: null, // Will be set when email is verified
        },
        include: {
          accounts: true,
          sessions: true,
        },
      });

      // Generate email verification token
      const verificationToken = await this.generateEmailVerificationToken(user.email);

      // Send verification email (you'll need to implement this)
      // await emailService.sendVerificationEmail(user.email, verificationToken);

      const userProfile: UserProfile = {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        role: user.role as 'USER' | 'ADMIN' | 'MODERATOR',
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        accounts: user.accounts.map(account => ({
          provider: account.provider,
          providerAccountId: account.providerAccountId,
          type: account.type,
        })),
        sessions: user.sessions.map(session => ({
          sessionToken: session.sessionToken,
          expires: session.expires,
        })),
      };

      // Handle new user setup
      await this.handleNewUserSignup(user.id);

      return {
        user: userProfile,
        needsVerification: true,
      };
    } catch (error) {
      if (error instanceof CustomServiceError) {
        throw error;
      }

      throw new CustomServiceError({
        type: ServiceErrorType.EXTERNAL_SERVICE,
        service: 'auth',
        operation: 'registerUser',
        message: `Failed to register user: ${error.message}`,
        retryable: false,
        originalError: error as Error,
        metadata: { email: data.email },
      });
    }
  }

  // Verify email address
  async verifyEmail(data: EmailVerificationRequest): Promise<{ success: boolean; message: string }> {
    try {
      if (!data.token) {
        throw new CustomServiceError({
          type: ServiceErrorType.VALIDATION,
          service: 'auth',
          operation: 'verifyEmail',
          message: 'Verification token is required',
          retryable: false,
        });
      }

      // Find verification token
      const verificationToken = await prisma.verificationToken.findUnique({
        where: {
          token: data.token,
        },
      });

      if (!verificationToken) {
        throw new CustomServiceError({
          type: ServiceErrorType.VALIDATION,
          service: 'auth',
          operation: 'verifyEmail',
          message: 'Invalid verification token',
          retryable: false,
        });
      }

      if (verificationToken.expires < new Date()) {
        // Delete expired token
        await prisma.verificationToken.delete({
          where: { token: data.token },
        });

        throw new CustomServiceError({
          type: ServiceErrorType.VALIDATION,
          service: 'auth',
          operation: 'verifyEmail',
          message: 'Verification token has expired',
          retryable: false,
        });
      }

      // Update user email verification
      await prisma.user.update({
        where: { email: verificationToken.identifier },
        data: { emailVerified: new Date() },
      });

      // Delete used token
      await prisma.verificationToken.delete({
        where: { token: data.token },
      });

      return {
        success: true,
        message: 'Email verified successfully',
      };
    } catch (error) {
      if (error instanceof CustomServiceError) {
        throw error;
      }

      throw new CustomServiceError({
        type: ServiceErrorType.EXTERNAL_SERVICE,
        service: 'auth',
        operation: 'verifyEmail',
        message: `Failed to verify email: ${error.message}`,
        retryable: false,
        originalError: error as Error,
      });
    }
  }

  // Request password reset
  async requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
    try {
      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        // Don't reveal that user doesn't exist
        return {
          success: true,
          message: 'If an account with this email exists, you will receive a password reset link',
        };
      }

      // Generate reset token
      const resetToken = await this.generatePasswordResetToken(email);

      // Send reset email (you'll need to implement this)
      // await emailService.sendPasswordResetEmail(email, resetToken);

      return {
        success: true,
        message: 'Password reset link has been sent to your email',
      };
    } catch (error) {
      throw new CustomServiceError({
        type: ServiceErrorType.EXTERNAL_SERVICE,
        service: 'auth',
        operation: 'requestPasswordReset',
        message: `Failed to request password reset: ${error.message}`,
        retryable: true,
        originalError: error as Error,
        metadata: { email },
      });
    }
  }

  // Reset password
  async resetPassword(data: PasswordResetRequest): Promise<{ success: boolean; message: string }> {
    try {
      const validatedData = passwordResetSchema.parse(data);

      if (!validatedData.token || !validatedData.newPassword) {
        throw new CustomServiceError({
          type: ServiceErrorType.VALIDATION,
          service: 'auth',
          operation: 'resetPassword',
          message: 'Token and new password are required',
          retryable: false,
        });
      }

      // TODO: Implement password reset token model
      // const resetToken = await prisma.passwordResetToken.findUnique({
      //   where: { token: validatedData.token },
      // });
      throw new CustomServiceError({
        type: ServiceErrorType.VALIDATION,
        service: 'auth',
        operation: 'resetPassword', 
        message: 'Password reset not implemented yet',
        retryable: false,
      });

      /*
      if (!resetToken) {
        throw new CustomServiceError({
          type: ServiceErrorType.VALIDATION,
          service: 'auth',
          operation: 'resetPassword',
          message: 'Invalid reset token',
          retryable: false,
        });
      }

      if (resetToken.expires < new Date()) {
        // Delete expired token
        await prisma.passwordResetToken.delete({
          where: { token: validatedData.token },
        });

        throw new CustomServiceError({
          type: ServiceErrorType.VALIDATION,
          service: 'auth',
          operation: 'resetPassword',
          message: 'Reset token has expired',
          retryable: false,
        });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(validatedData.newPassword, 12);

      // Update user password
      await prisma.user.update({
        where: { email: resetToken.email },
        data: { hashedPassword },
      });

      // Delete used token
      await prisma.passwordResetToken.delete({
        where: { token: validatedData.token },
      });

      // Invalidate all existing sessions
      await prisma.session.deleteMany({
        where: {
          user: { email: resetToken.email },
        },
      });

      return {
        success: true,
        message: 'Password reset successfully',
      };
      */
    } catch (error) {
      if (error instanceof CustomServiceError) {
        throw error;
      }

      throw new CustomServiceError({
        type: ServiceErrorType.EXTERNAL_SERVICE,
        service: 'auth',
        operation: 'resetPassword',
        message: `Failed to reset password: ${error.message}`,
        retryable: false,
        originalError: error as Error,
      });
    }
  }

  // Get user profile
  async getUserProfile(userId: string): Promise<UserProfile> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          accounts: true,
          sessions: true,
        },
      });

      if (!user) {
        throw new CustomServiceError({
          type: ServiceErrorType.VALIDATION,
          service: 'auth',
          operation: 'getUserProfile',
          message: 'User not found',
          retryable: false,
          metadata: { userId },
        });
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        role: user.role as 'USER' | 'ADMIN' | 'MODERATOR',
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        accounts: user.accounts.map(account => ({
          provider: account.provider,
          providerAccountId: account.providerAccountId,
          type: account.type,
        })),
        sessions: user.sessions.map(session => ({
          sessionToken: session.sessionToken,
          expires: session.expires,
        })),
      };
    } catch (error) {
      if (error instanceof CustomServiceError) {
        throw error;
      }

      throw new CustomServiceError({
        type: ServiceErrorType.EXTERNAL_SERVICE,
        service: 'auth',
        operation: 'getUserProfile',
        message: `Failed to get user profile: ${error.message}`,
        retryable: true,
        originalError: error as Error,
        metadata: { userId },
      });
    }
  }

  // Update user profile
  async updateUserProfile(
    userId: string,
    updates: Partial<{
      name: string;
      image: string;
      preferences: UserProfile['preferences'];
    }>
  ): Promise<UserProfile> {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: updates,
        include: {
          accounts: true,
          sessions: true,
        },
      });

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        role: user.role as 'USER' | 'ADMIN' | 'MODERATOR',
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        accounts: user.accounts.map(account => ({
          provider: account.provider,
          providerAccountId: account.providerAccountId,
          type: account.type,
        })),
        sessions: user.sessions.map(session => ({
          sessionToken: session.sessionToken,
          expires: session.expires,
        })),
        preferences: updates.preferences,
      };
    } catch (error) {
      throw new CustomServiceError({
        type: ServiceErrorType.EXTERNAL_SERVICE,
        service: 'auth',
        operation: 'updateUserProfile',
        message: `Failed to update user profile: ${error.message}`,
        retryable: true,
        originalError: error as Error,
        metadata: { userId, updates },
      });
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      await prisma.user.count({ take: 1 });
      return true;
    } catch (error) {
      console.error('Auth service health check failed:', error);
      return false;
    }
  }

  // Private helper methods
  private async generateEmailVerificationToken(email: string): Promise<string> {
    const token = crypto.randomUUID();
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    });

    return token;
  }

  private async generatePasswordResetToken(email: string): Promise<string> {
    const token = crypto.randomUUID();
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // TODO: Delete any existing reset tokens for this email
    // await prisma.passwordResetToken.deleteMany({
    //   where: { email },
    // });

    // TODO: Create password reset token
    // await prisma.passwordResetToken.create({
    //   data: {
    //     email,
    //     token,
    //     expires,
    //   },
    // });

    return token;
  }

  private async handleNewUserSignup(userId: string): Promise<void> {
    try {
      // Set up default user preferences
      await prisma.user.update({
        where: { id: userId },
        data: {
          // TODO: Add preferences to User model
          // preferences: {
          //   theme: 'system',
          //   language: 'en',
          //   notifications: {
          //     email: true,
          //     push: true,
          //     marketing: false,
          //   },
          // },
        },
      });

      // You could also:
      // - Send welcome email
      // - Create default folders/projects
      // - Set up onboarding flow
      // - Track analytics event
    } catch (error) {
      console.error('Failed to handle new user signup:', error);
    }
  }
}

// Create wrapped methods with error handling and retry logic
const rawAuthService = new AuthService();

export const authService = {
  getNextAuthConfig: rawAuthService.getNextAuthConfig.bind(rawAuthService),
  registerUser: withErrorHandling('auth', 'registerUser', rawAuthService.registerUser.bind(rawAuthService), { maxAttempts: 1 }),
  verifyEmail: withErrorHandling('auth', 'verifyEmail', rawAuthService.verifyEmail.bind(rawAuthService), { maxAttempts: 1 }),
  requestPasswordReset: withErrorHandling('auth', 'requestPasswordReset', rawAuthService.requestPasswordReset.bind(rawAuthService)),
  resetPassword: withErrorHandling('auth', 'resetPassword', rawAuthService.resetPassword.bind(rawAuthService), { maxAttempts: 1 }),
  getUserProfile: withErrorHandling('auth', 'getUserProfile', rawAuthService.getUserProfile.bind(rawAuthService)),
  updateUserProfile: withErrorHandling('auth', 'updateUserProfile', rawAuthService.updateUserProfile.bind(rawAuthService)),
  healthCheck: withErrorHandling('auth', 'healthCheck', rawAuthService.healthCheck.bind(rawAuthService), { maxAttempts: 1 }),
};

export { AuthService };
export * from './error-handler';

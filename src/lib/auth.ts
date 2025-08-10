import { NextAuthOptions, User as NextAuthUser } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/database/mongoDB";
import User from "@/lib/database/models/User";
import { sanitizeUser } from "@/lib/utils/auth";

declare module "next-auth" {
    interface Session {
        user: {
            id?: string;
            name?: string | null;
            email?: string | null;
            image?: string | null;
        };
    }
    interface AppUser extends NextAuthUser {
        id: string;
    }
}

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        GitHubProvider({
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        }),
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Please enter both email and password");
                }

                try {
                    await dbConnect();

                    // Find user and include password for comparison
                    const user = await User.findOne({
                        email: credentials.email.toLowerCase()
                    }).select('+password');

                    if (!user) {
                        throw new Error("No user found with this email address");
                    }

                    // Check if user registered with credentials
                    if (user.provider !== 'credentials') {
                        throw new Error(`Please sign in with ${user.provider}`);
                    }

                    // Check if email is verified
                    if (!user.isEmailVerified) {
                        throw new Error("Please verify your email before signing in");
                    }

                    // Check password
                    const isPasswordValid = await user.comparePassword(credentials.password);
                    if (!isPasswordValid) {
                        throw new Error("Invalid password");
                    }

                    // Return user data (password will be excluded by sanitizeUser)
                    return sanitizeUser(user);
                } catch (error) {
                    console.error("Credentials authorization error:", error);
                    throw error;
                }
            }
        })
    ],
    callbacks: {
        async signIn({ user, account }) {
            if (account?.provider === "google" || account?.provider === "github") {
                try {
                    await dbConnect();

                    const existingUser = await User.findOne({ email: user.email });

                    if (existingUser) {
                        // Update existing user with OAuth info if needed
                        if (existingUser.provider !== account.provider) {
                            existingUser.provider = account.provider as 'google' | 'github';
                            existingUser.providerId = account.providerAccountId;
                            existingUser.image = user.image;
                            existingUser.isEmailVerified = true; // OAuth emails are pre-verified
                            await existingUser.save();
                        }
                        return true;
                    } else {
                        // Create new user from OAuth
                        await User.create({
                            name: user.name,
                            email: user.email?.toLowerCase(),
                            image: user.image,
                            provider: account.provider,
                            providerId: account.providerAccountId,
                            isEmailVerified: true, // OAuth emails are pre-verified
                        });
                        return true;
                    }
                } catch (error) {
                    console.error("OAuth sign in error:", error);
                    return false;
                }
            }
            return true;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                if (session.user) {
                    session.user.id = token.id as string;
                }
            }
            return session;
        }
    },
    pages: {
        signIn: '/login',
        error: '/auth/error',
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
};
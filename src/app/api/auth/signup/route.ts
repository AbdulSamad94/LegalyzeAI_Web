import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/database/mongoDB';
import User from '@/lib/database/models/User';
import { sendVerificationEmail } from '@/lib/services/emailService';
import { generateVerificationToken, generateTokenExpiry } from '@/lib/utils/auth';
import { signupSchema } from '@/lib/validators/auth';
import { handleApiError } from '@/lib/api-utils';

export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        const body = await request.json();

        // 1. Validate Input (Zod)
        const { name, email, password } = signupSchema.parse(body);

        // 2. Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            if (existingUser.isEmailVerified) {
                return NextResponse.json(
                    { success: false, message: 'User already exists with this email' },
                    { status: 409 }
                );
            } else {
                // User exists but email not verified, resend verification email
                const verificationToken = generateVerificationToken();
                const verificationExpiry = generateTokenExpiry(24); // 24 hours

                existingUser.emailVerificationToken = verificationToken;
                existingUser.emailVerificationExpires = verificationExpiry;
                existingUser.name = name;
                existingUser.password = password; // Will be hashed by the pre-save hook

                await existingUser.save();

                const emailResult = await sendVerificationEmail(email, verificationToken, name);

                if (!emailResult.success) {
                    return NextResponse.json(
                        { success: false, message: 'Failed to send verification email' },
                        { status: 500 }
                    );
                }

                return NextResponse.json({
                    success: true,
                    message: 'Verification email sent. Please check your inbox.',
                });
            }
        }

        // 3. Create new user
        const verificationToken = generateVerificationToken();
        const verificationExpiry = generateTokenExpiry(24); // 24 hours

        const newUser = new User({
            name,
            email: email.toLowerCase(),
            password,
            provider: 'credentials',
            isEmailVerified: false,
            emailVerificationToken: verificationToken,
            emailVerificationExpires: verificationExpiry,
        });

        await newUser.save();

        // 4. Send verification email
        const emailResult = await sendVerificationEmail(email, verificationToken, name);

        if (!emailResult.success) {
            // Delete the user if email sending fails
            await User.findByIdAndDelete(newUser._id);
            return NextResponse.json(
                { success: false, message: 'Failed to send verification email' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Account created successfully! Please check your email to verify your account.',
        });

    } catch (error) {
        return handleApiError(error);
    }
}
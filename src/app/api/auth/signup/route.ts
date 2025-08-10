import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/database/mongoDB';
import User from '@/lib/database/models/User';
import { sendVerificationEmail } from '@/lib/services/emailService';
import { generateVerificationToken, generateTokenExpiry, validateEmail, validatePassword } from '@/lib/utils/auth';

export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        const body = await request.json();
        const { name, email, password, confirmPassword } = body;

        // Validation
        if (!name || !email || !password || !confirmPassword) {
            return NextResponse.json(
                { success: false, message: 'All fields are required' },
                { status: 400 }
            );
        }

        if (password !== confirmPassword) {
            return NextResponse.json(
                { success: false, message: 'Passwords do not match' },
                { status: 400 }
            );
        }

        if (!validateEmail(email)) {
            return NextResponse.json(
                { success: false, message: 'Please enter a valid email address' },
                { status: 400 }
            );
        }

        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            return NextResponse.json(
                { success: false, message: passwordValidation.message },
                { status: 400 }
            );
        }

        // Check if user already exists
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

                // Send verification email
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

        // Generate verification token
        const verificationToken = generateVerificationToken();
        const verificationExpiry = generateTokenExpiry(24); // 24 hours

        // Create new user
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

        // Send verification email
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
        console.error('Signup error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}
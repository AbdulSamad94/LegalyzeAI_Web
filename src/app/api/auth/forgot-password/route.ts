import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/database/mongoDB';
import User from '@/lib/database/models/User';
import { sendPasswordResetEmail } from '@/lib/services/emailService';
import { generateVerificationToken, generateTokenExpiry, validateEmail, validatePassword } from '@/lib/utils/auth';

export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        const body = await request.json();
        const { email } = body;

        if (!email) {
            return NextResponse.json(
                { success: false, message: 'Email is required' },
                { status: 400 }
            );
        }

        if (!validateEmail(email)) {
            return NextResponse.json(
                { success: false, message: 'Please enter a valid email address' },
                { status: 400 }
            );
        }

        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() });

        // Always return success to prevent email enumeration
        // but only send email if user exists
        if (user && user.provider === 'credentials') {
            const resetToken = generateVerificationToken();
            const resetExpiry = generateTokenExpiry(1); // 1 hour

            user.passwordResetToken = resetToken;
            user.passwordResetExpires = resetExpiry;
            await user.save();

            // Send password reset email
            await sendPasswordResetEmail(email, resetToken, user.name);
        }

        return NextResponse.json({
            success: true,
            message: 'If an account with this email exists, you will receive a password reset link.',
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}

// app/api/auth/reset-password/route.ts
export async function PUT(request: NextRequest) {
    try {
        await dbConnect();

        const body = await request.json();
        const { token, password } = body;

        if (!token || !password) {
            return NextResponse.json(
                { success: false, message: 'Token and password are required' },
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

        // Find user with valid reset token
        const user = await User.findOne({
            passwordResetToken: token,
            passwordResetExpires: { $gt: new Date() }
        }).select('+passwordResetToken +passwordResetExpires');

        if (!user) {
            return NextResponse.json(
                { success: false, message: 'Invalid or expired reset token' },
                { status: 400 }
            );
        }

        // Update password and clear reset token
        user.password = password; // Will be hashed by pre-save hook
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        return NextResponse.json({
            success: true,
            message: 'Password reset successfully. You can now sign in with your new password.',
        });

    } catch (error) {
        console.error('Password reset error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}
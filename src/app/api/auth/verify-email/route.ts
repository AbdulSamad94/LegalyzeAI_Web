import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/database/mongoDB';
import User from '@/lib/database/models/User';

export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        const body = await request.json();
        const { token } = body;

        if (!token) {
            return NextResponse.json(
                { success: false, message: 'Verification token is required' },
                { status: 400 }
            );
        }

        // Find user with the verification token
        const user = await User.findOne({
            emailVerificationToken: token,
            emailVerificationExpires: { $gt: new Date() }
        }).select('+emailVerificationToken +emailVerificationExpires');

        if (!user) {
            return NextResponse.json(
                { success: false, message: 'Invalid or expired verification token' },
                { status: 400 }
            );
        }

        // Update user as verified
        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;

        await user.save();

        return NextResponse.json({
            success: true,
            message: 'Email verified successfully! You can now sign in.',
        });

    } catch (error) {
        console.error('Email verification error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const token = searchParams.get('token');

        if (!token) {
            return NextResponse.json(
                { success: false, message: 'Verification token is required' },
                { status: 400 }
            );
        }

        // Find user with the verification token
        const user = await User.findOne({
            emailVerificationToken: token,
            emailVerificationExpires: { $gt: new Date() }
        }).select('+emailVerificationToken +emailVerificationExpires');

        if (!user) {
            return NextResponse.json(
                { success: false, message: 'Invalid or expired verification token' },
                { status: 400 }
            );
        }

        // Update user as verified
        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;

        await user.save();

        return NextResponse.json({
            success: true,
            message: 'Email verified successfully! You can now sign in.',
        });

    } catch (error) {
        console.error('Email verification error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}
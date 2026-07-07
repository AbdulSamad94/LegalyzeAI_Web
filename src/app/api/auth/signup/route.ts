import { NextRequest, NextResponse } from 'next/server';

// This endpoint is now handled by better-auth
// Signup is processed through: POST /api/auth/sign-up/email
// This route is kept for backward compatibility but redirects to better-auth

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(_request: NextRequest) {
    return NextResponse.json(
        {
            success: false,
            message: 'Please use the better-auth signup endpoint. Signup is now handled at /api/auth/sign-up/email'
        },
        { status: 410 }
    );
}
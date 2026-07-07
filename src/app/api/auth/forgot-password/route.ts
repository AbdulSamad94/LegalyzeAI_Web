import { NextRequest, NextResponse } from 'next/server';

// This endpoint is now handled by better-auth
// Password reset is processed through better-auth's built-in flow
// This route is kept for backward compatibility but redirects to better-auth

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(_request: NextRequest) {
    return NextResponse.json(
        {
            success: false,
            message: 'Password reset is now handled by better-auth'
        },
        { status: 410 }
    );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function PUT(_request: NextRequest) {
    return NextResponse.json(
        {
            success: false,
            message: 'Password reset is now handled by better-auth'
        },
        { status: 410 }
    );
}
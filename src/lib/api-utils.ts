import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

type ErrorResponse = {
    success: false;
    error: string;
    details?: string | unknown;
};

export function handleApiError(error: unknown): NextResponse<ErrorResponse> {
    console.error('API Error:', error);

    if (error instanceof ZodError) {
        return NextResponse.json(
            { success: false, error: 'Validation Error', details: error.flatten() },
            { status: 400 }
        );
    }

    if (error instanceof Error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }

    return NextResponse.json(
        { success: false, error: 'Internal Server Error' },
        { status: 500 }
    );
}

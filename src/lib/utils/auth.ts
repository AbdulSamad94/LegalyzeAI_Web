import crypto from 'crypto';

export const generateVerificationToken = (): string => {
    return crypto.randomBytes(32).toString('hex');
};

export const generateTokenExpiry = (hours: number = 24): Date => {
    return new Date(Date.now() + hours * 60 * 60 * 1000);
};

export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const validatePassword = (password: string): { isValid: boolean; message: string } => {
    if (password.length < 6) {
        return { isValid: false, message: 'Password must be at least 6 characters long' };
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
        return {
            isValid: false,
            message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
        };
    }

    return { isValid: true, message: 'Password is valid' };
};

interface User {
    password?: string;
    emailVerificationToken?: string;
    passwordResetToken?: string;
    [key: string]: unknown;
}

export const sanitizeUser = (user: User) => {
    const userObj = typeof user.toObject === 'function' ? user.toObject() : user;
    const { password, emailVerificationToken, passwordResetToken, ...sanitizedUser } = userObj;
    return sanitizedUser;
};
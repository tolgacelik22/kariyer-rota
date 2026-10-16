import { cookies, headers } from 'next/headers';
import jwt from 'jsonwebtoken';
import prisma from './prisma';

export const AUTH_COOKIE = 'auth_token';

export function signSession(user) {
    return jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '30d' });
}

export const sessionCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
    sameSite: 'lax',
};

// Web uses the httpOnly cookie; the mobile app sends the same JWT as a Bearer token.
export async function getCurrentUser() {
    const auth = (await headers()).get('authorization') || '';
    const bearer = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    const token = bearer || (await cookies()).get(AUTH_COOKIE)?.value;
    if (!token) return null;
    try {
        const { userId } = jwt.verify(token, process.env.JWT_SECRET);
        if (!userId) return null;
        return await prisma.user.findUnique({ where: { id: userId } });
    } catch {
        return null;
    }
}

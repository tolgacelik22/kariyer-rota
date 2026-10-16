import { cookies } from 'next/headers';
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

export async function getCurrentUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE)?.value;
    if (!token) return null;
    try {
        const { userId } = jwt.verify(token, process.env.JWT_SECRET);
        if (!userId) return null;
        return await prisma.user.findUnique({ where: { id: userId } });
    } catch {
        return null;
    }
}

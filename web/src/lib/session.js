import { cookies } from 'next/headers';
import crypto from 'crypto';

export async function getSessionId() {
    const cookieStore = await cookies();
    let sessionId = cookieStore.get('session_id')?.value;

    if (!sessionId) {
        sessionId = crypto.randomUUID();
        // Since we are in an async component/route, we can set it if we return a response, 
        // but often we just use it for the current action.
        // Actually, setting it in a GET might be better, but for now we'll just return it.
    }

    return sessionId;
}

export function setSessionId(sessionId) {
    // This needs to be called in a server action or route handler that returns a response
}

import crypto from 'crypto';

// Stored as "<nonce>.<sha256>" so the same code issued twice never collides on Token.hash.
export function codeHash(email, code, nonce) {
    const digest = crypto.createHash('sha256').update(`${nonce}:${email}:${code}:${process.env.JWT_SECRET}`).digest('hex');
    return `${nonce}.${digest}`;
}

export function codeMatches(stored, email, code) {
    const [nonce] = String(stored).split('.');
    const expected = Buffer.from(codeHash(email, code, nonce));
    const actual = Buffer.from(String(stored));
    return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

import prisma from './prisma';

export async function trackEvent(name, { email = null, userId = null, submissionId = null, properties = {} } = {}) {
    try {
        await prisma.event.create({
            data: {
                name,
                email,
                userId,
                submissionId,
                properties: properties || {},
            },
        });
    } catch (err) {
        console.error(`Failed to track event ${name}:`, err.message);
    }
}

export function getUtms(searchParams) {
    const utms = {};
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(key => {
        const val = searchParams.get(key);
        if (val) utms[key] = val;
    });
    return utms;
}

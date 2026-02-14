import { db } from '../src/db/index.js';
import { businessCards } from '../src/db/schema.js';
import { verifyToken } from '@clerk/backend';
import { eq, desc } from 'drizzle-orm';

export const config = {
    runtime: 'edge',
};

export default async function handler(req: Request) {
    if (req.method !== 'GET') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }

    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return new Response(JSON.stringify({ error: 'Missing authorization header' }), { status: 401 });
        }

        const token = authHeader.split(' ')[1];

        // Verify token with Clerk
        let verifiedToken;
        try {
            verifiedToken = await verifyToken(token, {
                secretKey: process.env.CLERK_SECRET_KEY,
            });
        } catch (err) {
            console.error('Token verification failed:', err);
            return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401 });
        }

        const userId = verifiedToken.sub;

        // Fetch all cards for this user, sorted by most recently updated
        const cards = await db
            .select()
            .from(businessCards)
            .where(eq(businessCards.userId, userId))
            .orderBy(desc(businessCards.updatedAt));

        return new Response(JSON.stringify({ success: true, cards }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });

    } catch (error: any) {
        console.error('Error fetching cards:', error);
        return new Response(JSON.stringify({ error: 'Internal server error', details: error?.message || 'Unknown error' }), { status: 500 });
    }
}

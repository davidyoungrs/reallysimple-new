import { db } from '../src/db/index.js';
import { businessCards, cardViews } from '../src/db/schema.js';
import { verifyToken } from '@clerk/backend';
import { eq, desc, sql } from 'drizzle-orm';

// export const config = {
//     runtime: 'edge',
// };

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Missing authorization header' });
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
            return res.status(401).json({ error: 'Invalid token' });
        }

        const userId = verifiedToken.sub;

        // Fetch all cards for this user with view counts
        const cards = await db
            .select({
                id: businessCards.id,
                uid: businessCards.uid,
                userId: businessCards.userId,
                data: businessCards.data,
                slug: businessCards.slug,
                isActive: businessCards.isActive,
                createdAt: businessCards.createdAt,
                updatedAt: businessCards.updatedAt,
                viewCount: sql<number>`cast(count(${cardViews.id}) as integer)`,
            })
            .from(businessCards)
            .leftJoin(cardViews, eq(cardViews.cardId, businessCards.id))
            .where(eq(businessCards.userId, userId))
            .groupBy(businessCards.id)
            .orderBy(desc(businessCards.updatedAt));

        return res.status(200).json({ success: true, cards });

    } catch (error: any) {
        console.error('Error fetching cards:', error);
        return res.status(500).json({ error: 'Internal server error', details: error?.message || 'Unknown error' });
    }
}

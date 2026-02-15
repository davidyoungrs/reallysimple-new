import { db } from '../src/db/index.js';
import { businessCards, cardViews, cardClicks } from '../src/db/schema.js';
import { eq, and } from 'drizzle-orm';
import { verifyToken } from '@clerk/backend';

// export const config = {
//     runtime: 'edge',
// };

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'DELETE' && req.method !== 'POST') {
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

        const authenticatedUserId = verifiedToken.sub;
        const body = req.body;
        const { cardId, userId } = body;

        // Ensure the userId in body matches the authenticated user
        if (userId && userId !== authenticatedUserId) {
            return res.status(403).json({ error: 'Unauthorized user mismatch' });
        }

        const effectiveUserId = authenticatedUserId;

        if (!cardId) {
            return res.status(400).json({ error: 'Missing cardId' });
        }

        console.log('Attempting to delete card:', cardId, 'for user:', effectiveUserId);

        // Verify the card exists and belongs to the user
        const existingCards = await db
            .select()
            .from(businessCards)
            .where(and(
                eq(businessCards.id, cardId),
                eq(businessCards.userId, effectiveUserId)
            ))
            .limit(1);

        if (existingCards.length === 0) {
            console.log('Card not found or unauthorized');
            return res.status(404).json({ error: 'Card not found or unauthorized' });
        }

        console.log('Card found, deleting associated analytics data...');

        // Import cardClicks to ensure it's handled even if cascade isn't fully active yet
        const { cardClicks } = await import('../src/db/schema.js');

        // Delete all analytics data (views and clicks) for this card
        await Promise.all([
            db.delete(cardViews).where(eq(cardViews.cardId, cardId)),
            db.delete(cardClicks).where(eq(cardClicks.cardId, cardId))
        ]);

        console.log('Analytics data (views and clicks) deleted, now deleting card...');

        // Now delete the card
        await db
            .delete(businessCards)
            .where(and(
                eq(businessCards.id, cardId),
                eq(businessCards.userId, effectiveUserId)
            ));

        console.log('Card deleted successfully');

        return res.status(200).json({ success: true, message: 'Card deleted successfully' });

    } catch (error: any) {
        console.error('Error deleting card:', error);
        return res.status(500).json({ error: 'Internal server error', details: error?.message || 'Unknown error' });
    }
}

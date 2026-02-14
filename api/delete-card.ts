import { db } from '../src/db/index.js';
import { businessCards, cardViews, cardClicks } from '../src/db/schema.js';
import { eq, and } from 'drizzle-orm';
import { verifyToken } from '@clerk/backend';

// export const config = {
//     runtime: 'edge',
// };

export default async function handler(req: Request) {
    if (req.method !== 'DELETE' && req.method !== 'POST') {
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

        const authenticatedUserId = verifiedToken.sub;
        const body = await req.json();
        const { cardId, userId } = body;

        // Ensure the userId in body matches the authenticated user
        if (userId && userId !== authenticatedUserId) {
            return new Response(JSON.stringify({ error: 'Unauthorized user mismatch' }), { status: 403 });
        }

        const effectiveUserId = authenticatedUserId;

        if (!cardId) {
            return new Response(JSON.stringify({ error: 'Missing cardId' }), { status: 400 });
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
            return new Response(JSON.stringify({ error: 'Card not found or unauthorized' }), { status: 404 });
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

        return new Response(JSON.stringify({ success: true, message: 'Card deleted successfully' }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });

    } catch (error: any) {
        console.error('Error deleting card:', error);
        return new Response(JSON.stringify({ error: 'Internal server error', details: error?.message || 'Unknown error' }), { status: 500 });
    }
}

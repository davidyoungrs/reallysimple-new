import { db } from '../src/db/index.js';
import { businessCards, cardViews } from '../src/db/schema.js';
import { eq, and } from 'drizzle-orm';

// export const config = {
//     runtime: 'edge',
// };

export default async function handler(req: Request) {
    if (req.method !== 'DELETE' && req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }

    try {
        const body = await req.json();
        const { cardId, userId } = body;

        if (!cardId) {
            return new Response(JSON.stringify({ error: 'Missing cardId' }), { status: 400 });
        }

        if (!userId) {
            return new Response(JSON.stringify({ error: 'Missing userId' }), { status: 400 });
        }

        console.log('Attempting to delete card:', cardId, 'for user:', userId);

        // Verify the card exists and belongs to the user
        const existingCards = await db
            .select()
            .from(businessCards)
            .where(and(
                eq(businessCards.id, cardId),
                eq(businessCards.userId, userId)
            ))
            .limit(1);

        if (existingCards.length === 0) {
            console.log('Card not found or unauthorized');
            return new Response(JSON.stringify({ error: 'Card not found or unauthorized' }), { status: 404 });
        }

        console.log('Card found, deleting analytics first...');

        // First, delete all analytics data (card_views) for this card
        await db
            .delete(cardViews)
            .where(eq(cardViews.cardId, cardId));

        console.log('Analytics deleted, now deleting card...');

        // Now delete the card (and its slug automatically since it's in the same row)
        await db
            .delete(businessCards)
            .where(and(
                eq(businessCards.id, cardId),
                eq(businessCards.userId, userId)
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

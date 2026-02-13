import { db } from '../src/db/index.js';
import { businessCards } from '../src/db/schema.js';
import { verifyToken } from '@clerk/backend';
import { eq } from 'drizzle-orm';

export const config = {
    runtime: 'edge',
};

export default async function handler(req: Request) {
    if (req.method !== 'POST') {
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
        const body = await req.json();
        const { cardData } = body;

        if (!cardData) {
            return new Response(JSON.stringify({ error: 'Missing card data' }), { status: 400 });
        }

        // Check if user already has a card
        const existingCard = await db.select().from(businessCards).where(eq(businessCards.userId, userId)).limit(1);

        let result;
        if (existingCard.length > 0) {
            // Update existing card
            result = await db.update(businessCards)
                .set({
                    data: cardData,
                    updatedAt: new Date(),
                })
                .where(eq(businessCards.userId, userId))
                .returning();
        } else {
            // Create new card
            result = await db.insert(businessCards)
                .values({
                    userId: userId,
                    data: cardData,
                })
                .returning();
        }

        return new Response(JSON.stringify({ success: true, card: result[0] }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });

    } catch (error: any) {
        console.error('Error saving card:', error);
        return new Response(JSON.stringify({ error: 'Internal server error', details: error.message }), { status: 500 });
    }
}

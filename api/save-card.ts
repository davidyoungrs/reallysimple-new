import { db } from '../src/db/index.js';
import { businessCards } from '../src/db/schema.js';
import { eq } from 'drizzle-orm';

// export const config = {
//     runtime: 'edge',
// };

export default async function handler(req: Request) {
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }

    try {
        const body = await req.json();
        const { cardData, cardId, userId } = body;

        if (!cardData) {
            return new Response(JSON.stringify({ error: 'Missing card data' }), { status: 400 });
        }

        if (!userId) {
            return new Response(JSON.stringify({ error: 'Missing userId' }), { status: 400 });
        }

        // Get slug from cardData
        let slug = cardData.slug;

        console.log('Saving card with slug:', slug, 'cardId:', cardId, 'userId:', userId);

        // Check slug uniqueness if provided
        if (slug) {
            const existingCard = await db.select()
                .from(businessCards)
                .where(eq(businessCards.slug, slug))
                .limit(1);

            // If slug exists and it's not the current card, reject it
            if (existingCard.length > 0 && existingCard[0].id !== cardId) {
                console.log('Slug already taken by card:', existingCard[0].id);
                return new Response(JSON.stringify({
                    error: 'Slug already taken',
                    suggestion: `${slug}-2`
                }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
        }

        let result;
        if (cardId) {
            // Update existing card by ID
            result = await db.update(businessCards)
                .set({
                    data: cardData,
                    slug: slug || null,
                    updatedAt: new Date(),
                })
                .where(eq(businessCards.id, cardId))
                .returning();
        } else {
            // Create new card
            result = await db.insert(businessCards)
                .values({
                    userId: userId,
                    data: cardData,
                    slug: slug || null,
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

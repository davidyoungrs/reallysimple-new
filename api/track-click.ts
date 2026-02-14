import { db } from '../src/db';
import { businessCards, cardClicks } from '../src/db/schema';
import { eq } from 'drizzle-orm';

export default async function handler(request: Request) {
    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }

    try {
        const { slug, type, targetInfo } = await request.json();

        if (!slug || !type) {
            return new Response(JSON.stringify({ error: 'Missing required fields' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Find card ID from slug
        const card = await db.select({ id: businessCards.id })
            .from(businessCards)
            .where(eq(businessCards.slug, slug))
            .limit(1);

        if (!card.length) {
            console.error(`Card not found for slug: ${slug}`);
            return new Response(JSON.stringify({ error: 'Card not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const cardId = card[0].id;
        const userAgent = request.headers.get('user-agent') || undefined;

        await db.insert(cardClicks).values({
            cardId,
            type,
            targetInfo,
            userAgent,
        });

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Error tracking click:', error);
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

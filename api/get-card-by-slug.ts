import { db } from '../src/db/index.js';
import { businessCards } from '../src/db/schema.js';
import { eq } from 'drizzle-orm';

export const config = {
    runtime: 'edge',
};

export default async function handler(req: Request) {
    if (req.method !== 'GET') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }

    try {
        // Extract slug from URL
        const url = new URL(req.url);
        const pathParts = url.pathname.split('/');
        const slug = pathParts[pathParts.length - 1];

        if (!slug) {
            return new Response(JSON.stringify({ error: 'Missing slug' }), { status: 400 });
        }

        // Fetch card by slug
        const cards = await db
            .select()
            .from(businessCards)
            .where(eq(businessCards.slug, slug))
            .limit(1);

        if (cards.length === 0) {
            return new Response(JSON.stringify({ error: 'Card not found' }), { status: 404 });
        }

        const card = cards[0];

        return new Response(JSON.stringify({ success: true, card }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });

    } catch (error: any) {
        console.error('Error fetching card by slug:', error);
        return new Response(JSON.stringify({ error: 'Internal server error', details: error?.message || 'Unknown error' }), { status: 500 });
    }
}

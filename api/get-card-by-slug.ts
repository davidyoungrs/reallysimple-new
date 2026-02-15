import { db } from '../src/db/index.js';
import { businessCards } from '../src/db/schema.js';
import { eq } from 'drizzle-orm';

// export const config = {
//     runtime: 'edge',
// };

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Vercel rewrites /api/get-card-by-slug/some-slug to /api/get-card-by-slug?slug=some-slug
        // OR we might need to parse it from req.url if rewrite isn't passing query param
        let slug = req.query.slug as string;

        // Fallback: Parsing from URL if not in query (local dev or specific vercel behaviors)
        if (!slug && req.url) {
            const urlParts = req.url.split('/');
            // Assuming format /api/get-card-by-slug/SLUG
            slug = urlParts[urlParts.length - 1];
        }

        if (!slug) {
            return res.status(400).json({ error: 'Missing slug' });
        }

        // Fetch card by slug
        const cards = await db
            .select()
            .from(businessCards)
            .where(eq(businessCards.slug, slug))
            .limit(1);

        if (cards.length === 0) {
            return res.status(404).json({ error: 'Card not found' });
        }

        const card = cards[0];

        return res.status(200).json({ success: true, card });

    } catch (error: any) {
        console.error('Error fetching card by slug:', error);
        return res.status(500).json({ error: 'Internal server error', details: error?.message || 'Unknown error' });
    }
}

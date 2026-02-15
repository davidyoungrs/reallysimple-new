import { db } from '../src/db/index.js';
import { businessCards } from '../src/db/schema.js';
import { eq } from 'drizzle-orm';

// export const config = {
//     runtime: 'edge',
// };

// Reserved slugs that cannot be used
const RESERVED_SLUGS = [
    'admin', 'api', 'app', 'auth', 'card', 'cards', 'dashboard',
    'login', 'logout', 'signup', 'settings', 'profile', 'user',
    'users', 'new', 'edit', 'delete', 'create',
];

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const slug = req.query.slug as string;
        const currentCardId = req.query.cardId as string; // Optional: exclude current card from check

        if (!slug) {
            return res.status(400).json({ error: 'Missing slug parameter' });
        }

        // Check if slug is reserved
        if (RESERVED_SLUGS.includes(slug.toLowerCase())) {
            return res.status(200).json({
                available: false,
                reason: 'reserved',
                suggestion: `${slug}-card`
            });
        }

        // Check if slug exists in database
        const existingCards = await db
            .select()
            .from(businessCards)
            .where(eq(businessCards.slug, slug))
            .limit(1);

        // If slug exists and it's not the current card being edited
        if (existingCards.length > 0 && (!currentCardId || existingCards[0].id.toString() !== currentCardId)) {
            // Generate suggestion
            let counter = 2;
            let suggestion = `${slug}-${counter}`;

            return res.status(200).json({
                available: false,
                reason: 'taken',
                suggestion
            });
        }

        // Slug is available
        return res.status(200).json({ available: true });

    } catch (error: any) {
        console.error('Error checking slug availability:', error);
        return res.status(500).json({
            error: 'Internal server error',
            details: error?.message || 'Unknown error'
        });
    }
}

import { db } from '../src/db/index.js';
import { businessCards } from '../src/db/schema.js';
import { eq } from 'drizzle-orm';

export const config = {
    runtime: 'edge',
};

// Reserved slugs that cannot be used
const RESERVED_SLUGS = [
    'admin', 'api', 'app', 'auth', 'card', 'cards', 'dashboard',
    'login', 'logout', 'signup', 'settings', 'profile', 'user',
    'users', 'new', 'edit', 'delete', 'create',
];

export default async function handler(req: Request) {
    if (req.method !== 'GET') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }

    try {
        const url = new URL(req.url);
        const slug = url.searchParams.get('slug');
        const currentCardId = url.searchParams.get('cardId'); // Optional: exclude current card from check

        if (!slug) {
            return new Response(JSON.stringify({ error: 'Missing slug parameter' }), { status: 400 });
        }

        // Check if slug is reserved
        if (RESERVED_SLUGS.includes(slug.toLowerCase())) {
            return new Response(JSON.stringify({
                available: false,
                reason: 'reserved',
                suggestion: `${slug}-card`
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
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

            return new Response(JSON.stringify({
                available: false,
                reason: 'taken',
                suggestion
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Slug is available
        return new Response(JSON.stringify({ available: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error: any) {
        console.error('Error checking slug availability:', error);
        return new Response(JSON.stringify({
            error: 'Internal server error',
            details: error?.message || 'Unknown error'
        }), { status: 500 });
    }
}

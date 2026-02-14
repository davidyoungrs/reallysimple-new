import { db } from '../src/db/index.js';
import { businessCards, cardViews, cardClicks } from '../src/db/schema.js';
import { eq, sql, and, gte, lte, desc } from 'drizzle-orm';

export default async function handler(request: Request) {
    if (request.method !== 'GET') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }

    try {
        const url = new URL(request.url);
        const slug = url.searchParams.get('slug');
        const cardIdParam = url.searchParams.get('cardId');

        if (!slug && !cardIdParam) {
            return new Response(JSON.stringify({ error: 'Missing cardId or slug' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        let cardId: number;

        if (slug) {
            const card = await db.select({ id: businessCards.id })
                .from(businessCards)
                .where(eq(businessCards.slug, slug))
                .limit(1);

            if (!card.length) {
                return new Response(JSON.stringify({ error: 'Card not found' }), {
                    status: 404,
                    headers: { 'Content-Type': 'application/json' },
                });
            }
            cardId = card[0].id;
        } else {
            cardId = parseInt(cardIdParam!);
        }

        let startDate: Date;
        let endDate: Date;

        const startDateParam = url.searchParams.get('startDate');
        const endDateParam = url.searchParams.get('endDate');

        if (startDateParam && endDateParam) {
            startDate = new Date(startDateParam);
            endDate = new Date(endDateParam);
            // Set end date to end of day
            endDate.setHours(23, 59, 59, 999);
        } else {
            // Default to last 30 days
            endDate = new Date();
            startDate = new Date();
            startDate.setDate(endDate.getDate() - 30);
        }

        // Fetch daily views
        const dailyViews = await db.select({
            date: sql<string>`DATE_TRUNC('day', ${cardViews.viewedAt})::text`,
            count: sql<number>`count(*)`
        })
            .from(cardViews)
            .where(and(
                eq(cardViews.cardId, cardId),
                gte(cardViews.viewedAt, startDate),
                lte(cardViews.viewedAt, endDate)
            ))
            .groupBy(sql`DATE_TRUNC('day', ${cardViews.viewedAt})`)
            .orderBy(sql`DATE_TRUNC('day', ${cardViews.viewedAt})`);

        // Fetch daily clicks
        const dailyClicks = await db.select({
            date: sql<string>`DATE_TRUNC('day', ${cardClicks.clickedAt})::text`,
            count: sql<number>`count(*)`
        })
            .from(cardClicks)
            .where(and(
                eq(cardClicks.cardId, cardId),
                gte(cardClicks.clickedAt, startDate),
                lte(cardClicks.clickedAt, endDate)
            ))
            .groupBy(sql`DATE_TRUNC('day', ${cardClicks.clickedAt})`)
            .orderBy(sql`DATE_TRUNC('day', ${cardClicks.clickedAt})`);

        // Fetch click breakdown
        const clickBreakdown = await db.select({
            type: cardClicks.type,
            targetInfo: cardClicks.targetInfo,
            count: sql<number>`count(*)`
        })
            .from(cardClicks)
            .where(and(
                eq(cardClicks.cardId, cardId),
                gte(cardClicks.clickedAt, startDate),
                lte(cardClicks.clickedAt, endDate)
            ))
            .groupBy(cardClicks.type, cardClicks.targetInfo)
            .orderBy(desc(sql`count(*)`));

        const totalViews = dailyViews.reduce((acc, curr) => acc + Number(curr.count), 0);
        const totalClicks = dailyClicks.reduce((acc, curr) => acc + Number(curr.count), 0);
        const ctr = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0;

        // Generate date array for charts
        const mergedStats = [];
        // Calculate number of days in range
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Limit daily stats generation to avoid huge loops if someone requests a large range
        // For very large ranges, we might want to group by month, but for now stick to daily up to reasonable limits (e.g. 90 days)
        // or just iterate 

        for (let i = 0; i <= diffDays; i++) {
            const d = new Date(startDate);
            d.setDate(d.getDate() + i);
            if (d > endDate) break;

            const dateKey = d.toISOString().split('T')[0]; // YYYY-MM-DD

            const viewStat = dailyViews.find(v => v.date.startsWith(dateKey));
            const clickStat = dailyClicks.find(c => c.date.startsWith(dateKey));

            mergedStats.push({
                date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                fullDate: dateKey,
                views: viewStat ? Number(viewStat.count) : 0,
                clicks: clickStat ? Number(clickStat.count) : 0
            });
        }

        // Fetch geographic distribution (most recent 100 views with coordinates)
        const geoStats = await db.select({
            city: cardViews.city,
            region: cardViews.region,
            country: cardViews.country,
            latitude: cardViews.latitude,
            longitude: cardViews.longitude,
            viewedAt: cardViews.viewedAt,
        })
            .from(cardViews)
            .where(and(
                eq(cardViews.cardId, cardId),
                gte(cardViews.viewedAt, startDate),
                lte(cardViews.viewedAt, endDate),
                sql`${cardViews.latitude} IS NOT NULL`
            ))
            .orderBy(desc(cardViews.viewedAt))
            .limit(100);

        // Fetch device distribution
        const deviceStats = await db.select({
            deviceType: cardViews.deviceType,
            count: sql<number>`count(*)`
        })
            .from(cardViews)
            .where(and(
                eq(cardViews.cardId, cardId),
                gte(cardViews.viewedAt, startDate),
                lte(cardViews.viewedAt, endDate)
            ))
            .groupBy(cardViews.deviceType);

        // Fetch source distribution
        const sourceStats = await db.select({
            source: cardViews.source,
            count: sql<number>`count(*)`
        })
            .from(cardViews)
            .where(and(
                eq(cardViews.cardId, cardId),
                gte(cardViews.viewedAt, startDate),
                lte(cardViews.viewedAt, endDate)
            ))
            .groupBy(cardViews.source);

        return new Response(JSON.stringify({
            totalViews,
            totalClicks,
            ctr: parseFloat(ctr.toFixed(2)),
            dailyStats: mergedStats,
            clickBreakdown: clickBreakdown.map(item => ({
                platform: item.targetInfo,
                type: item.type,
                count: Number(item.count)
            })),
            geoStats: geoStats.map(item => ({
                ...item,
                // Ensure coordinates are numbers for the frontend
                latitude: item.latitude ? parseFloat(item.latitude) : null,
                longitude: item.longitude ? parseFloat(item.longitude) : null,
            })),
            deviceStats: deviceStats.map(item => ({
                type: item.deviceType || 'unknown',
                count: Number(item.count)
            })),
            sourceStats: sourceStats.map(item => ({
                source: item.source || 'direct',
                count: Number(item.count)
            }))
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Error fetching analytics:', error);
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

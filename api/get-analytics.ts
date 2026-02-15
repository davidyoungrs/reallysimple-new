import { db } from '../src/db/index.js';
import { businessCards, cardViews, cardClicks } from '../src/db/schema.js';
import { eq, sql, and, gte, lte, desc } from 'drizzle-orm';

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const slug = req.query.slug as string;
        const cardIdParam = req.query.cardId as string;

        if (!slug && !cardIdParam) {
            return res.status(400).json({ error: 'Missing cardId or slug' });
        }

        let cardId: number;

        if (slug) {
            const card = await db.select({ id: businessCards.id })
                .from(businessCards)
                .where(eq(businessCards.slug, slug))
                .limit(1);

            if (!card.length) {
                return res.status(404).json({ error: 'Card not found' });
            }
            cardId = card[0].id;
        } else {
            cardId = parseInt(cardIdParam!);
            if (isNaN(cardId)) {
                return res.status(400).json({ error: 'Invalid cardId format' });
            }
        }

        let startDate: Date;
        let endDate: Date;

        const startDateParam = req.query.startDate as string;
        const endDateParam = req.query.endDate as string;

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

        return res.status(200).json({
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
        });

    } catch (error: any) {
        console.error('Error fetching analytics:', error);
        return res.status(500).json({
            error: 'Internal server error',
            details: error?.message || 'Unknown error',
            stack: error?.stack
        });
    }
}

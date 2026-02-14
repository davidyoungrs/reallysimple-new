import { pgTable, serial, text, timestamp, jsonb, boolean, uuid } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    email: text('email').notNull().unique(),
    createdAt: timestamp('created_at').defaultNow(),
});

export const businessCards = pgTable('business_cards', {
    id: serial('id').primaryKey(),
    uid: uuid('uid').defaultRandom().notNull().unique(), // Public facing ID
    userId: text('user_id'), // Link to auth provider ID (e.g. Clerk)
    data: jsonb('data').notNull(), // Stores the entire JSON state of the card
    slug: text('slug').unique(), // For custom URLs like /card/david
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

export const cardViews = pgTable('card_views', {
    id: uuid('id').defaultRandom().primaryKey(),
    cardId: serial('card_id').references(() => businessCards.id),
    viewedAt: timestamp('viewed_at').defaultNow(),
    referrer: text('referrer'),
    userAgent: text('user_agent'),
});

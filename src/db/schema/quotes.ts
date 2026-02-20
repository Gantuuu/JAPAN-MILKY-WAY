import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const quotes = sqliteTable('quotes', {
    id: text('id').primaryKey(),
    userId: text('user_id'),
    type: text('type').notNull(), // 'personal' | 'business'
    name: text('name').notNull(),
    phone: text('phone'),
    email: text('email'),
    destination: text('destination'),
    headcount: text('headcount'),
    period: text('period'),
    budget: text('budget'),
    travelTypes: text('travel_types'), // JSON string
    accommodations: text('accommodations'), // JSON string
    vehicle: text('vehicle'),
    additionalRequest: text('additional_request'),
    attachmentUrl: text('attachment_url'),
    status: text('status').default('pending'),
    adminNote: text('admin_note'),
    estimateUrl: text('estimate_url'),

    // Payment / Confirmation
    confirmedStartDate: text('confirmed_start_date'),
    confirmedEndDate: text('confirmed_end_date'),
    confirmedPrice: integer('confirmed_price'),
    deposit: integer('deposit'),
    depositStatus: text('deposit_status').default('unpaid'),
    balanceStatus: text('balance_status').default('unpaid'),

    createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

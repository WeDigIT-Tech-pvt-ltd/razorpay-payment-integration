const { pgTable, text, timestamp, varchar, integer, decimal, jsonb } = require('drizzle-orm/pg-core');
const products = require('./products');
const { sql } = require('drizzle-orm');

const plans = pgTable('plans', {
  id: varchar('id').primaryKey(), // Razorpay plan ID
  name: text('name').notNull(),
  description: text('description'),
  productId: varchar('product_id')
    .notNull()
    .references(() => products.id),
  features: text('features')
    .array()
    .notNull()
    .default(sql`ARRAY[]::text[]`),
  pgPlanId: text('pg_plan_id').notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).notNull(),
  interval: varchar('interval', { length: 20 }).notNull(), // daily, weekly, monthly, yearly
  intervalCount: integer('interval_count').notNull(),
  metadata: jsonb('metadata'),
  taxPer: decimal('tax_per', { precision: 10, scale: 2 }).notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

module.exports = plans;
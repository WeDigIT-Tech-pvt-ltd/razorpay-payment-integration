const { pgTable, text, timestamp, varchar, integer, decimal, boolean, jsonb } = require('drizzle-orm/pg-core');
const customers = require('./customers');
const plans = require('./plans');

const subscriptions = pgTable('subscriptions', {
  id: varchar('id').primaryKey(), // Razorpay subscription ID
  planId: varchar('plan_id')
    .notNull()
    .references(() => plans.id),  
  customerId: varchar('customer_id')
    .notNull()
    .references(() => customers.id),  
  status: varchar('status', { length: 20 }).notNull(),
  currentPeriodStart: timestamp('current_period_start'),
  currentPeriodEnd: timestamp('current_period_end'),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false),
  canceledAt: timestamp('canceled_at'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

module.exports = subscriptions;
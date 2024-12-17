const { pgTable, timestamp, varchar, decimal, jsonb } = require('drizzle-orm/pg-core');
const customers = require('./customers');
const { CURRENCY } = require('../../config/constants');

const orders = pgTable('orders', {
  id: varchar('id').primaryKey(), // Razorpay order ID
  customerId: varchar('customer_id')
    .notNull()
    .references(() => customers.id),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).notNull().$type(CURRENCY),
  receipt: varchar('receipt').notNull(),
  status: varchar('status', { length: 20 }).notNull(), // created, paid, failed
  notes: jsonb('notes'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

module.exports = orders;
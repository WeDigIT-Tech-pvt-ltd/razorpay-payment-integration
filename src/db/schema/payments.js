const { pgTable, text, timestamp, varchar, integer, decimal, jsonb } = require('drizzle-orm/pg-core');
const { PAYMENT_STATUS } = require('../../config/constants');
const customers = require('./customers');
const orders = require('./orders');

const payments = pgTable('payments', {
  id: varchar('id').primaryKey(), // Razorpay payment ID
  orderId: varchar('order_id')
    .notNull()
    .references(() => orders.id), 
  customerId: varchar('customer_id')
    .notNull()
    .references(() => customers.id),  
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).notNull(),
  status: varchar('status', { length: 20 }).notNull().$type(PAYMENT_STATUS),
  method: varchar('method', { length: 50 }),
  description: text('description'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

module.exports = payments;
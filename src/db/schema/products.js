const { pgTable, text, timestamp, varchar } = require('drizzle-orm/pg-core');

const products = pgTable('products', {
  id: varchar('id').primaryKey(), // Razorpay plan ID
  name: text('name').notNull(),
  url: varchar('url', { length: 2083 }).notNull().default(''),
  webhook: varchar('webhook', { length: 2083 }).notNull().default(''),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

module.exports = products;
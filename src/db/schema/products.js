const { pgTable, text, timestamp, varchar } = require('drizzle-orm/pg-core');

const products = pgTable('products', {
  id: varchar('id').primaryKey(), // Razorpay plan ID
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

module.exports = products;
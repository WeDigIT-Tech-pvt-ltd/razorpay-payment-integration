const { pgTable, text, timestamp, varchar } = require('drizzle-orm/pg-core');

const customers = pgTable('customers', {
  id: varchar('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  phone: varchar('phone'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

module.exports = customers;
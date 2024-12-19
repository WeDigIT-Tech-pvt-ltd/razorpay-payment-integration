const db = require('../db');
const { customers } = require('../db/schema');
const { eq } = require('drizzle-orm');

class CustomerRepository {
  async create(customerData) {
    const [customer] = await db.insert(customers)
      .values(customerData)
      .returning();
    return customer;
  }

  async findById(id) {
    const [customer] = await db.select()
      .from(customers)
      .where(eq(customers.id, id));
    return customer;
  }

  async findByEmail(email) {
    const [customer] = await db.select()
      .from(customers)
      .where(eq(customers.email, email));
    return customer;
  }

  async update(id, customerData) {
    const [customer] = await db.update(customers)
      .set({ ...customerData, updatedAt: new Date() })
      .where(eq(customers.id, id))
      .returning();
    return customer;
  }
}

module.exports = new CustomerRepository();
const db = require('../db');
const { orders } = require('../db/schema');
const { eq } = require('drizzle-orm');

class OrderRepository {
  async create(orderData) {
    const [order] = await db.insert(orders)
      .values(orderData)
      .returning();
    return order;
  }

  async findById(id) {
    const [order] = await db.select()
      .from(orders)
      .where(eq(orders.id, id));
    return order;
  }

  async updateStatus(id, status) {
    const [order] = await db.update(orders)
      .set({ 
        status, 
        updatedAt: new Date() 
      })
      .where(eq(orders.id, id))
      .returning();
    return order;
  }

  async findByCustomerId(customerId) {
    return db.select()
      .from(orders)
      .where(eq(orders.customerId, customerId));
  }
}

module.exports = new OrderRepository();
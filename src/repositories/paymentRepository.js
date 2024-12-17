const db = require('../db');
const { payments } = require('../db/schema');
const { eq } = require('drizzle-orm');

class PaymentRepository {
  async create(paymentData) {
    const [payment] = await db.insert(payments)
      .values(paymentData)
      .returning();
    return payment;
  }

  async findById(id) {
    const [payment] = await db.select()
      .from(payments)
      .where(eq(payments.id, id));
    return payment;
  }

  async updateStatus(id, status) {
    const [payment] = await db.update(payments)
      .set({ status, updatedAt: new Date() })
      .where(eq(payments.id, id))
      .returning();
    return payment;
  }

  async findByCustomerId(customerId) {
    return db.select()
      .from(payments)
      .where(eq(payments.customerId, customerId));
  }
}

module.exports = new PaymentRepository();
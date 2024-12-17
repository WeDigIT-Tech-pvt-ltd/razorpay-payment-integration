const db = require('../db');
const { subscriptions } = require('../db/schema');
const { eq } = require('drizzle-orm');

class SubscriptionRepository {
  async create(subscriptionData) {
    const [subscription] = await db.insert(subscriptions)
      .values(subscriptionData)
      .returning();
    return subscription;
  }

  async findById(id) {
    const [subscription] = await db.select()
      .from(subscriptions)
      .where(eq(subscriptions.id, id));
    return subscription;
  }

  async updateStatus(id, status) {
    const [subscription] = await db.update(subscriptions)
      .set({ 
        status, 
        updatedAt: new Date(),
        ...(status === 'cancelled' ? { canceledAt: new Date() } : {})
      })
      .where(eq(subscriptions.id, id))
      .returning();
    return subscription;
  }

  async findByCustomerId(customerId) {
    return db.select()
      .from(subscriptions)
      .where(eq(subscriptions.customerId, customerId));
  }
}

module.exports = new SubscriptionRepository();
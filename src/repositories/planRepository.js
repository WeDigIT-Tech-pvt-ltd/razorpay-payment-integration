const db = require('../db');
const { plans } = require('../db/schema');
const { eq } = require('drizzle-orm');

class PlanRepository {
  async create(planData) {
    const [plan] = await db.insert(plans)
      .values(planData)
      .returning();
    return plan;
  }

  async findById(id) {
    const [plan] = await db.select()
      .from(plans)
      .where(eq(plans.id, id));
    return plan;
  }

  async findByProductId(pId) {
    const plan = await db.select()
      .from(plans)
      .where(eq(plans.productId, pId))
      .orderBy(plans.createdAt);
    return plan;
  }
}

module.exports = new PlanRepository();
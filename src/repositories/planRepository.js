const db = require('../db');
const { plans } = require('../db/schema');
const { eq } = require('drizzle-orm');

class PlanRepository {
  async findById(id) {
    const [plan] = await db.select()
      .from(plans)
      .where(eq(plans.id, id));
    return plan;
  }
}

module.exports = new PlanRepository();
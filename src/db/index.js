const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const schema = require('./schema');

const queryClient = postgres(process.env.DATABASE_URL);
const db = drizzle(queryClient, { schema });

module.exports = db;
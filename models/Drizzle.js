import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const client = postgres(process.env.SQLURL, { prepare: false });
const db = drizzle(client);

//export { db };
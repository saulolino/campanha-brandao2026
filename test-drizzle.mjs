import { drizzle } from 'drizzle-orm/mysql2';
import { instagramPosts } from './drizzle/schema.ts';
import { desc } from 'drizzle-orm';

const db = drizzle(process.env.DATABASE_URL);

try {
  const posts = await db.select().from(instagramPosts).orderBy(desc(instagramPosts.scheduledDate)).limit(10);
  console.log('Success! Posts:', posts.length);
  if (posts.length > 0) console.log('First post:', JSON.stringify(posts[0], null, 2));
} catch (err) {
  console.error('Error:', err.message);
  console.error('Code:', err.code);
}

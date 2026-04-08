import mysql from 'mysql2/promise';

const conn = await mysql.createConnection(process.env.DATABASE_URL);

try {
  const [rows] = await conn.execute(
    'SELECT `id`, `title`, `scheduledDate`, `status`, `type`, `objective`, `scheduledTime`, `description`, `mediaUrls`, `caption`, `hashtags`, `expectedReach`, `expectedLikes`, `expectedComments`, `budget`, `notes`, `designerId`, `captionWriterId`, `coordinatorId`, `createdAt`, `updatedAt`, `publishedAt`, `instagramPostId`, `instagramError` FROM `instagram_posts` ORDER BY `scheduledDate` DESC LIMIT 500'
  );
  console.log('Query succeeded! Rows:', rows.length);
} catch (err) {
  console.error('Query failed:', err.message);
  console.error('SQL state:', err.sqlState);
  console.error('Error code:', err.code);
}

await conn.end();

import { createClient } from "@libsql/client";

/**
 * Example 1: Local Development (No Auth)
 */
export const createLocalClient = () => {
  return createClient({
    url: "http://localhost:8080",
  });
};

/**
 * Example 2: Local Development with JWT Auth
 */
export const createLocalClientWithAuth = () => {
  return createClient({
    url: "http://localhost:8080",
    authToken: process.env.LIBSQL_JWT_TOKEN,
  });
};

/**
 * Example 3: Production Turso Cloud
 */
export const createTursoClient = () => {
  return createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  });
};

/**
 * Example 4: Environment-aware client factory
 */
export const createDatabaseClient = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isDocker = process.env.DOCKER_ENV === 'true';

  if (isDevelopment) {
    // Local development
    const url = isDocker ? 'http://libsql:8080' : 'http://localhost:8080';
    return createClient({
      url,
      authToken: process.env.LIBSQL_JWT_TOKEN, // Optional for local
    });
  }

  // Production - Turso Cloud
  return createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  });
};

/**
 * Example 5: Using the client
 */
async function exampleUsage() {
  const client = createDatabaseClient();

  try {
    // Simple query
    const result = await client.execute("SELECT 1 as test");
    console.log("Query result:", result.rows);

    // Parameterized query
    const users = await client.execute({
      sql: "SELECT * FROM users WHERE email = ?",
      args: ["user@example.com"],
    });
    console.log("Users:", users.rows);

    // Transaction
    const batch = [
      {
        sql: "INSERT INTO posts (title, content) VALUES (?, ?)",
        args: ["Hello World", "This is my first post"],
      },
      {
        sql: "UPDATE posts SET published = 1 WHERE title = ?",
        args: ["Hello World"],
      },
    ];
    await client.batch(batch);

    // Query with parameters for better performance
    const publishedPosts = await client.execute({
      sql: "SELECT * FROM posts WHERE published = ?",
      args: [1],
    });
    console.log("Published posts:", publishedPosts.rows);

  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
}

/**
 * Example 6: With connection pooling for serverless
 */
export const createServerlessClient = () => {
  return createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
    // Enable connection pooling
    syncUrl: process.env.TURSO_DATABASE_URL,
    syncInterval: 60, // Sync every 60 seconds
  });
};

/**
 * Example 7: AWS Lambda handler example
 */
export const lambdaHandler = async (event: any) => {
  const client = createDatabaseClient();
  
  try {
    const result = await client.execute({
      sql: "SELECT * FROM items WHERE id = ?",
      args: [event.pathParameters.id],
    });

    return {
      statusCode: 200,
      body: JSON.stringify(result.rows[0]),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};

/**
 * Example 8: React Server Component (Next.js App Router)
 * Note: To use this example, rename this file to .tsx
 */
export async function getPostData(postId: string) {
  const client = createDatabaseClient();

  const post = await client.execute({
    sql: "SELECT * FROM posts WHERE id = ?",
    args: [postId],
  });

  if (!post.rows[0]) {
    return null;
  }

  return {
    title: post.rows[0].title as string,
    content: post.rows[0].content as string,
  };
}

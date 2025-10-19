import { buildConfig } from 'payload';
import { sqliteAdapter } from '@payloadcms/db-sqlite';

export default buildConfig({
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000',
  secret: process.env.PAYLOAD_SECRET || 'your-secret-key-here',

  // SQLite/libSQL Database Configuration
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URI || 'http://localhost:8080',
      authToken: process.env.DATABASE_AUTH_TOKEN,
    },
    // Optional: push schema changes automatically in development
    push: process.env.NODE_ENV === 'development',
  }),

  admin: {
    user: 'users',
  },

  collections: [
    {
      slug: 'users',
      auth: true,
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      slug: 'posts',
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'content',
          type: 'richText',
        },
        {
          name: 'publishedDate',
          type: 'date',
        },
      ],
    },
  ],

  typescript: {
    outputFile: './payload-types.ts',
  },

  graphQL: {
    schemaOutputFile: './generated-schema.graphql',
  },
});

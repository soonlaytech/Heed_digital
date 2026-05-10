import { z } from 'zod';
import { insertCheckinSchema, insertSettingsSchema, checkins, settings } from './schema';

// Shared error schemas
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  checkins: {
    list: {
      method: 'GET' as const,
      path: '/api/checkins' as const,
      responses: {
        200: z.array(z.custom<typeof checkins.$inferSelect>()),
      },
    },
    latest: {
      method: 'GET' as const,
      path: '/api/checkins/latest' as const,
      responses: {
        200: z.custom<typeof checkins.$inferSelect>().nullable(),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/checkins' as const,
      input: insertCheckinSchema,
      responses: {
        201: z.custom<typeof checkins.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  settings: {
    get: {
      method: 'GET' as const,
      path: '/api/settings' as const,
      responses: {
        200: z.custom<typeof settings.$inferSelect>(),
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/settings' as const,
      input: insertSettingsSchema.partial(),
      responses: {
        200: z.custom<typeof settings.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

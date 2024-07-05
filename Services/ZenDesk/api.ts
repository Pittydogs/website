import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { rateLimiter } from 'hono-rate-limiter';
import { uptimeToHumanFriendly } from './utils';
import { csrf } from 'hono/csrf';

const PORT = 3331;

const app = new Hono();

const requiredEnvVars = [
  'PRIVATE_ZENDESK_EMAIL',
  'PRIVATE_ZENDESK_API_KEY',
  'PRIVATE_ZENDESK_HOSTNAME',
  'ALLOW_ORIGIN_ADDR',
];

requiredEnvVars.forEach((varName) => {
  if (!varName || !process.env[varName]) {
    console.error(`Oops! Environment variable ${varName} is not set.`);

    process.exit(1);
  }
});

const generateApiToken = ({ email }: { email: string }) => {
  const formatted = `${email}/token:${process.env.PRIVATE_ZENDESK_API_KEY}`;

  return Buffer.from(formatted).toString('base64');
};

const zendeskAuthToken = generateApiToken({
  email: process.env.PRIVATE_ZENDESK_EMAIL as string,
});

if (!process.env.ALLOW_ORIGIN_ADDR)
  throw Error(
    'Oops! Missing environment variable, expected ALLOW_ORIGIN_ADDR.',
  );

const limiter = rateLimiter({
  windowMs: 60 * 60 * 1000, // 60 minutes
  limit: 5, // Maximum of 5 requests per window, here 60m
  standardHeaders: 'draft-6',
  keyGenerator: (c) =>
    c.req.header('x-real-ip') ?? c.req.header('x-forwarded-for') ?? '',
});

app.use(limiter);

const allowedOrigins = process.env.ALLOW_ORIGIN_ADDR.split(',');

app.use(
  '*',
  cors({
    origin: [...allowedOrigins],
  }),
);

app.use(
  csrf({
    origin: [...allowedOrigins],
  }),
);

app.get('/health', (c) => {
  return c.json({
    message: 'OK',
    uptime: uptimeToHumanFriendly(process.uptime()),
  });
});

app.post(
  '/ticket',
  zValidator(
    'form',
    z.object({
      name: z.string().min(2).optional(),
      email: z.string().email(),
      subject: z.string(),
      comment: z.string().min(30),
    }),
  ),
  async (c, next) => {
    const { email, name, subject, comment } = await c.req.parseBody();

    try {
      const body = {
        ticket: {
          subject,
          comment: {
            body: comment,
          },
          requester: {
            name,
            email,
          },
        },
      };

      const response = await fetch(
        `https://${process.env.PRIVATE_ZENDESK_HOSTNAME}.zendesk.com/api/v2/tickets.json?async=true`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${zendeskAuthToken}`,
          },
          body: JSON.stringify(body),
        },
      );

      const data = await response.json();

      return c.json(
        {
          data,
        },
        200,
      );
    } catch (error) {
      console.error(error);

      c.json(
        {
          message: 'Oops! Failed for some reason...',
        },
        500,
      );
    }

    await next();
  },
);

console.log(`🤖 Server listening in port ${PORT}...`);

export default {
  port: PORT,
  fetch: app.fetch,
};

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mocks (use relative imports because test runner doesn't know the `@` alias)
vi.mock('../src/lib/prisma', () => ({
  default: {
    newsletterSubscriber: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock('../src/lib/rateLimiter', () => ({ default: vi.fn(async () => ({ limited: false, remaining: 4, resetIn: 60 })) }));
vi.mock('../src/lib/email-service', () => ({ emailService: { sendOtpEmail: vi.fn(async () => ({ success: true })) } }));

import prisma from '../src/lib/prisma';
import rateLimit from '../src/lib/rateLimiter';
import { POST } from '../src/app/api/newsletter/route.testable';

function makeReq(body: any) {
  return {
    json: async () => body,
    headers: new Map(),
  } as any;
}

describe('Newsletter route', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('creates a new subscriber when none exists', async () => {
    (prisma.newsletterSubscriber.findUnique as any).mockResolvedValue(null);
    (prisma.newsletterSubscriber.create as any).mockResolvedValue({ id: '1', email: 'a@b.com' });

    const res = await POST(makeReq({ email: 'a@b.com' }));
    const json = await res.json();
    expect(json.message).toBe('Subscribed successfully');
    expect(prisma.newsletterSubscriber.create).toHaveBeenCalled();
  });

  it('returns already subscribed when exists', async () => {
    (prisma.newsletterSubscriber.findUnique as any).mockResolvedValue({ id: '1', email: 'a@b.com' });

    const res = await POST(makeReq({ email: 'a@b.com' }));
    const json = await res.json();
    expect(json.message).toBe('Already subscribed');
    expect(prisma.newsletterSubscriber.create).not.toHaveBeenCalled();
  });
});

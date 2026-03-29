import { randomUUID } from 'crypto';
import { prisma } from '../../config/prisma';

export async function createTestSession(overrides = {}) {
  const token = randomUUID();
  
  const user = await prisma.user.create({
    data: {
      email: `test-${token}@example.com`,
      username: `testuser-${token}`,
      password: "testpass"
    },
  });

  const session = await prisma.session.create({
    data: {
      token,
      userId: user.id,
      expiresAt: new Date(Date.now() + 3600000), // 1 hour
      ...overrides,
    },
  });

  return { token, user, session };
}

export async function cleanupTestSession(userId: string) {
  await prisma.session.deleteMany({ where: { userId } });
  await prisma.user.delete({ where: { id: userId } });
}
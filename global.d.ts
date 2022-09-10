import type { PrismaClient } from '@prisma/client';
import type Pusher from 'pusher';

declare global {
  var prisma: PrismaClient;
  var pusher: Pusher;
}

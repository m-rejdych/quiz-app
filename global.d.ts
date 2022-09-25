import type { PrismaClient } from '@prisma/client';
import type Pusher from 'pusher';
import type AppState from './src/models/state/app';

declare global {
  var prisma: PrismaClient;
  var pusher: Pusher;
  var state: AppState;
}

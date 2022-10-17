import type { inferProcedureOutput } from '@trpc/server';
import { Prisma } from '@prisma/client';

import type { AppRouter } from '../../pages/api/trpc/[trpc]';

export type GetGameQueryData = inferProcedureOutput<
  AppRouter['_def']['queries']['game.get']
>;

export type GameResult = Prisma.GameResultGetPayload<{
  include: {
    players: {
      orderBy: { score: 'desc' };
      include: { user: { select: { id: true; username: true } } };
    };
  };
}>;

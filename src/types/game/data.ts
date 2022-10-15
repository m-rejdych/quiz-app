import type { inferProcedureOutput } from '@trpc/server';

import type { AppRouter } from '../../pages/api/trpc/[trpc]';

export type GetGameQueryData = inferProcedureOutput<
  AppRouter['_def']['queries']['game.get']
>;

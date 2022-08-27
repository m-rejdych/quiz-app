import * as trpc from '@trpc/server';

import type { Context } from './context';

export default () => trpc.router<Context>();

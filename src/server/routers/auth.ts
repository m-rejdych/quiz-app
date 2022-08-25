import * as trpc from '@trpc/server';
import { z } from 'zod';
import { hash } from 'bcryptjs';

import { prisma } from '../../server/prisma';

const authRouter = trpc.router().mutation('register', {
  input: z.object({
    email: z.string().email(),
    password: z
      .string()
      .regex(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/),
    username: z.string(),
  }),
  resolve: async ({ input: { password, ...rest } }) => {
    try {
      const hashedPassword = await hash(password, 12);

      const user = await prisma.user.create({
        data: { ...rest, password: hashedPassword },
        select: { email: true, id: true },
      });
      await prisma.profile.create({
        data: { userId: user.id },
      });

      return { email: user.email, id: user.id };
    } catch (error) {
      throw new trpc.TRPCError({
        code: 'CONFLICT',
        message: 'Email already in use.',
      });
    }
  },
});

export default authRouter;

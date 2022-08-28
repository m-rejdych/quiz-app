import * as trpc from '@trpc/server';
import { z } from 'zod';
import { hash } from 'bcryptjs';

import createRouter from '../../server/createRouter';

const authRouter = createRouter().mutation('register', {
  input: z.object({
    email: z.string().email(),
    password: z
      .string()
      .regex(
        /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/,
        'Password must be at least 6 characters long and contain numbers and special characters.',
      ),
    username: z.string().min(3, 'Username must be at least 3 characters long.'),
  }),
  resolve: async ({ input: { password, ...rest }, ctx: { prisma } }) => {
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

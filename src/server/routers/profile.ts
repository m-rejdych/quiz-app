import createRouter from '../../server/createRouter';

const profileRouter = createRouter().query('get-data', {
  resolve: ({ ctx }) => {
    return ctx.userId;
  },
});

export default profileRouter;

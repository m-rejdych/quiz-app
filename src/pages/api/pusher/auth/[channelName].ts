import type { NextApiHandler } from 'next';
import * as trpc from '@trpc/server';

import { getServerSession } from '../../../../utils/session';
import { pusher } from '../../../../server/pusher';

const handler: NextApiHandler = async (req, res) => {
  try {
    const session = await getServerSession({ req, res });
    if (!session?.user) {
      throw new trpc.TRPCError({ code: 'UNAUTHORIZED' });
    }
    console.log(session);

    const socketId = req.body.socket_id;
    const { id, ...rest } = session.user;
    const { channelName } = req.query;

    const response = pusher.authorizeChannel(socketId, channelName as string, {
      user_id: id.toString(),
      user_info: rest,
    });

    res.send(response);
  } catch (error) {
    res.status(403).send(error);
  }
};

export default handler;

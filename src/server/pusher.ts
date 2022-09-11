import Pusher from 'pusher';

const __prod__ = process.env.NODE_ENV === 'production';

export const pusher =
  global.pusher ??
  new Pusher({
    appId: process.env.PUSHER_APP_ID as string,
    key: process.env.PUSHER_KEY as string,
    secret: process.env.PUSHER_SECRET as string,
    cluster: process.env.PUSHER_CLUSTER as string,
    useTLS: true,
  });

if (!__prod__) global.pusher = pusher;

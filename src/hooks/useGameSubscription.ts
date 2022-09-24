import { useEffect } from 'react';
import Pusher, { type PresenceChannel } from 'pusher-js';

const useGameSubscription = (code: string): void => {
  const channelName = `presence-${code}`;

  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY as string, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
      forceTLS: true,
      channelAuthorization: {
        endpoint: `${process.env.NEXT_PUBLIC_PUSHER_CHANNEL_AUTHORIZATION_URL}/${channelName}`,
        transport: 'ajax',
      },
    });

    const channel = pusher.subscribe(channelName) as PresenceChannel;

    channel.bind('pusher:member_added', (data: any) =>
      console.log('added', data),
    );

    channel.bind('pusher:member_removed', (data: any) => console.log('removed', data));

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusher.unbind_all();
      pusher.disconnect();
    };
  }, []);
};

export default useGameSubscription;

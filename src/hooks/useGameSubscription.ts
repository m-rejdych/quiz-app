import { useEffect, useState } from 'react';
import Pusher, { type PresenceChannel } from 'pusher-js';

import type { Members, Member } from '../types/game/members';

type UseGameSubscription = (code: string) => {
  members: Members;
};

const useGameSubscription: UseGameSubscription = (code) => {
  const [members, setMembers] = useState<Members>({});

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

    channel.bind('pusher:subscription_succeeded', () => {
      setMembers(channel.members.members);
    });

    channel.bind('pusher:member_added', ({ id, info }: Member) => {
      setMembers((prev) => ({ ...prev, [id]: info }));
    });

    channel.bind('pusher:member_removed', ({ id }: Member) => {
      setMembers((prev) => {
        const temp = { ...prev };
        delete temp[id];

        return temp;
      });
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusher.unbind_all();
      pusher.disconnect();
    };
  }, []);

  return { members };
};

export default useGameSubscription;

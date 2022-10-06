import { useEffect, useState } from 'react';
import Pusher, { type PresenceChannel } from 'pusher-js';

interface MemberInfo {
  email: string;
  image: null;
  name: string;
}

interface Member {
  id: string;
  info: MemberInfo;
}

type Members = Record<string, MemberInfo>;

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
    setMembers(channel.members.members);

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

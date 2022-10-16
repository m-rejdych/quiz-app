import { useEffect, useState } from 'react';
import Pusher, { type PresenceChannel } from 'pusher-js';

import useAuthError from '../hooks/useAuthError';
import { trpc } from '../utils/trpc';
import { ChannelEvent, GameEvent } from '../types/game/events';
import type { Members, Member } from '../types/game/members';
import type { GetGameQueryData } from '../types/game/data';

const EVENTS = [
  ChannelEvent.UpdatePlayers,
  GameEvent.StartGame,
  GameEvent.CountdownStartGame,
  GameEvent.StartQuestion,
  GameEvent.CountdownStartQuestion,
  GameEvent.QuestionLoop,
  GameEvent.FinishQuestion,
  GameEvent.FinishGame,
] as const;

const useGameSubscription = (code: string) => {
  const [members, setMembers] = useState<Members>({});
  const { invalidateQueries, setQueryData } = trpc.useContext();
  const onError = useAuthError();
  const gameData = trpc.useQuery(['game.get', code], {
    refetchOnWindowFocus: false,
    onError,
  });

  console.log(gameData.data);
  const channelName = `presence-${code}`;

  const invalidateGetGameQuery = (): Promise<void> =>
    invalidateQueries(['game.get', code]);

  const updateGetGameQueryData = (newData: Partial<GetGameQueryData>): void => {
    setQueryData(
      ['game.get', code],
      (prev) =>
        ({
          ...prev,
          ...newData,
        } as GetGameQueryData),
    );
  };

  const handleEvent = <T extends Partial<GetGameQueryData>>(data: T): void => {
    updateGetGameQueryData(data);
  };

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
      invalidateGetGameQuery();
    });

    channel.bind('pusher:member_removed', ({ id }: Member) => {
      setMembers((prev) => {
        const temp = { ...prev };
        delete temp[id];

        return temp;
      });
      invalidateGetGameQuery();
    });

    EVENTS.forEach((event) => {
      channel.bind(event, handleEvent);
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusher.unbind_all();
      pusher.disconnect();

      // leave game on cleanup?
    };
  }, []);

  return {
    members,
    gameData,
  };
};

export default useGameSubscription;

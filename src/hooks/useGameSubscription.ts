import { useEffect, useState } from 'react';
import Pusher, { type PresenceChannel } from 'pusher-js';
import type { inferProcedureOutput } from '@trpc/server';

import useAuthError from '../hooks/useAuthError';
import { trpc } from '../utils/trpc';
import { ChannelEvent, GameEvent } from '../types/game/events';
import type { Members, Member } from '../types/game/members';
import type { AppRouter } from '../pages/api/trpc/[trpc]';

const useGameSubscription = (code: string) => {
  const [members, setMembers] = useState<Members>({});
  const { invalidateQueries, setQueryData } = trpc.useContext();
  const invalidateGetGameQuery = (): Promise<void> =>
    invalidateQueries(['game.get', code]);
  const onError = useAuthError();
  const gameData = trpc.useQuery(['game.get', code], {
    refetchOnWindowFocus: false,
    onError,
  });
  const joinGame = trpc.useMutation('game.join');
  const leaveGame = trpc.useMutation('game.leave');
  const startGame = trpc.useMutation('game.start');

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

    channel.bind(
      ChannelEvent.UpdatePlayers,
      (
        players: inferProcedureOutput<
          AppRouter['_def']['queries']['game.get']
        >['players'],
      ) => {
        setQueryData(['game.get', code], { ...gameData.data, players });
      },
    );
    channel.bind(GameEvent.StartGame, (data: any) => {
      console.log('start game', data);
    });
    channel.bind(GameEvent.CountdownStartGame, (data: any) => {
      console.log('countdown start game', data);
    });
    channel.bind(GameEvent.StartQuestion, (data: any) => {
      console.log('start question', data);
    });
    channel.bind(GameEvent.QuestionLoop, (data: any) => {
      console.log('question loop', data);
    });
    channel.bind(GameEvent.FinishQuestion, (data: any) => {
      console.log('finsh question', data);
    });
    channel.bind(GameEvent.CountdownStartQuestion, (data: any) => {
      console.log('countdown start question', data);
    });
    channel.bind(GameEvent.FinishGame, (data: any) => {
      console.log('finsh game', data);
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
    joinGame,
    leaveGame,
    startGame,
    onAuthError: onError,
  };
};

export default useGameSubscription;

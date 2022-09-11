import * as trpc from '@trpc/server';
import { Prisma } from '@prisma/client';

import State from './state';
import PlayerState, { type InitPlayerState } from './player';

type Quiz = Prisma.QuizGetPayload<{
  include: {
    questions: { include: { answers: true } };
    author: { select: { id: true; username: true } };
  };
}>;

export interface InitGameState {
  quiz: Quiz;
}

interface BaseGameState {
  players: Record<number, PlayerState>;
}

type IGameState = InitGameState & BaseGameState;

const BASE_STATE: BaseGameState = {
  players: {},
};

export default class GameState extends State<IGameState> {
  constructor(state: InitGameState) {
    super({ ...BASE_STATE, ...state });
  }

  getPlayer(id: number): PlayerState | undefined {
    return this.get('players')[id];
  }

  addPlayer(id: number, state: InitPlayerState): PlayerState {
    if (this.getPlayer(id))
      throw new trpc.TRPCError({
        code: 'BAD_REQUEST',
        message: 'Game with this code already exists.',
      });

    const player = new PlayerState(state);
    this.set('players', (players) => ({ ...players, [id]: player }));

    return player;
  }

  removePlayer(id: number): boolean {
    const currentPlayers = { ...this.get('players') };
    if (!(id in currentPlayers)) return false;

    delete currentPlayers[id];
    this.set('players', currentPlayers);
    return true;
  }
}

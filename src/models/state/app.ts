import * as trpc from '@trpc/server';

import State from './state';
import GameState, { type InitGameState } from './game';

type Games = Record<string, GameState>;

interface IAppState {
  games: Games;
}

const BASE_STATE: IAppState = {
  games: {},
};

export class AppState extends State<IAppState> {
  constructor() {
    super(BASE_STATE);
  }

  getGame(id: keyof Games): GameState | undefined {
    return this.get('games')[id];
  }

  addGame(id: string, state: InitGameState): GameState {
    if (this.getGame(id))
      throw new trpc.TRPCError({
        code: 'BAD_REQUEST',
        message: 'Game with this code already exists.',
      });

    const game = new GameState(state);
    this.set('games', (games) => ({ ...games, [id]: game }));
    return game;
  }

  removeGame(id: keyof Games): boolean {
    const currentGames = { ...this.get('games') };
    if (!(id in currentGames)) return false;

    delete currentGames[id];
    this.set('games', currentGames);
    return true;
  }
}

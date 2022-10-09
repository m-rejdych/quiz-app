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

export default class AppState extends State<IAppState> {
  constructor() {
    super(BASE_STATE);
  }

  getGame(code: keyof Games): GameState | undefined {
    return this.get('games')[code];
  }

  addGame(code: string, state: InitGameState): GameState {
    if (this.getGame(code))
      throw new trpc.TRPCError({
        code: 'BAD_REQUEST',
        message: 'Game with this code already exists.',
      });

    const game = new GameState(state);
    this.set('games', (games) => ({ ...games, [code]: game }));
    return game;
  }

  removeGame(code: keyof Games): boolean {
    const currentGames = { ...this.get('games') };
    if (!(code in currentGames)) return false;

    const playerCleanupInterval =
      currentGames[code].getReadonlyState().playersCleanupInterval;
    if (playerCleanupInterval) {
      clearInterval(playerCleanupInterval);
    }

    delete currentGames[code];
    this.set('games', currentGames);
    return true;
  }
}

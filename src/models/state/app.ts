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

  addGame(code: string, state: Omit<InitGameState, 'onClean'>): GameState {
    if (this.getGame(code))
      throw new trpc.TRPCError({
        code: 'BAD_REQUEST',
        message: 'Game with this code already exists.',
      });

    const game = new GameState({
      ...state,
      onClean: this.removeGame.bind(this),
    });
    this.set('games', (games) => ({ ...games, [code]: game }));
    return game;
  }

  removeGame(code: keyof Games): boolean {
    const currentGames = { ...this.get('games') };
    if (!(code in currentGames)) return false;

    const { cleanupLoopInterval, currentStageTimeout } =
      currentGames[code].getReadonlyState();
    if (cleanupLoopInterval) {
      clearInterval(cleanupLoopInterval);
    }
    if (currentStageTimeout) {
      clearTimeout(currentStageTimeout);
    }

    delete currentGames[code];
    this.set('games', currentGames);
    return true;
  }
}

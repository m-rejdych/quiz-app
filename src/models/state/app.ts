import State from './state';
import GameState from './game';

type Games = Record<string, GameState>;

interface IAppState {
  games: Games;
}

const INIT_STATE: IAppState = {
  games: {},
};

export class AppState extends State<IAppState> {
  constructor(state?: IAppState) {
    super(state ?? INIT_STATE);
  }

  getGame(id: keyof Games): GameState | undefined {
    return this.get('games')[id];
  }

  addGame(id: string): GameState {
    const game = new GameState();
    this.set('games', (games) => ({ ...games, [id]: game }));
    return game;
  }

  removeGame(id: keyof Games): boolean {
    const currentGames = { ...this.get('games') };
    if (!currentGames[id]) return false;

    delete currentGames[id];
    this.set('games', currentGames);
    return true;
  }
}

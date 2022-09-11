import State from './state';

interface IGameState {}

const INIT_STATE: IGameState = {};

export default class GameState extends State<IGameState> {
  constructor(state?: IGameState) {
    super(state ?? INIT_STATE);
  }
}

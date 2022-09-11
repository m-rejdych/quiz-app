import State from './state';

export interface InitPlayerState {
  username: string;
}

interface BasePlayerState {}

type IPlayerState = InitPlayerState & BasePlayerState;

const BASE_STATE: BasePlayerState = {};

export default class PlayerState extends State<IPlayerState> {
  constructor(state: InitPlayerState) {
    super({ ...BASE_STATE, ...state });
  }
}

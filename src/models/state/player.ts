import type { User } from '@prisma/client';

import State from './state';

export interface InitPlayerState {
  user: Pick<User, 'id' | 'username'>;
}

interface BasePlayerState {
  score: number;
}

type IPlayerState = InitPlayerState & BasePlayerState;

const BASE_STATE: BasePlayerState = {
  score: 0,
};

const calculateScore = (timeLeft: number): number => 100 * timeLeft;

export default class PlayerState extends State<IPlayerState> {
  constructor(state: InitPlayerState) {
    super({ ...BASE_STATE, ...state });
  }

  incrementScore(timeLeft: number): void {
    this.set('score', (prev) => prev + calculateScore(timeLeft));
  }
}

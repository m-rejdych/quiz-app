import type { User } from '@prisma/client';

import State from './state';

interface QuestionAnswer {
  answerId: number;
  timeLeft: number;
}

export interface InitPlayerState {
  user: Pick<User, 'id' | 'username'>;
  questionAnswers: Record<number, QuestionAnswer | null>;
}

type IPlayerState = InitPlayerState;

type SerializedPlayer = Record<number, PlayerState & { score: number }>;

const SCORE_FACTOR = 100;

const calculateScore = (timeLeft: number) => timeLeft * SCORE_FACTOR;

export default class PlayerState extends State<IPlayerState> {
  constructor(state: InitPlayerState) {
    super(state);
  }

  get score() {
    return Object.values(this.get('questionAnswers')).reduce(
      (total, answer) => total + (answer ? calculateScore(answer.timeLeft) : 0),
      0,
    );
  }

  static serialize(players: Record<number, PlayerState>): SerializedPlayer {
    return Object.entries(players).reduce(
      (acc, [id, player]) => ({
        ...acc,
        [id]: { ...player.getReadonlyState(), score: player.score },
      }),
      {},
    );
  }
}

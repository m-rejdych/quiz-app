import type { User } from '@prisma/client';

import State from './state';

interface QuestionAnswer {
  answerId: number;
  timeLeft: number;
  isCorrect: boolean;
}

export interface InitPlayerState {
  user: Pick<User, 'id' | 'username'>;
  questionAnswers: Record<number, QuestionAnswer | null>;
}

type IPlayerState = InitPlayerState;

type SerializedPlayers = Record<
  number,
  Readonly<InitPlayerState> & { score: number }
>;

const SCORE_FACTOR = 100;

const calculateScore = (timeLeft: number) => timeLeft * SCORE_FACTOR;

export default class PlayerState extends State<IPlayerState> {
  constructor(state: InitPlayerState) {
    super(state);
  }

  submitAnswer(questionId: number, answer: QuestionAnswer): void {
    const questions = this.get('questionAnswers');
    if (!(questionId in questions)) return;

    this.set('questionAnswers', (prev) => ({ ...prev, [questionId]: answer }));
  }

  get score(): number {
    return Object.values(this.get('questionAnswers'))
      .filter((answer) => answer?.isCorrect)
      .reduce((total, answer) => total + calculateScore(answer!.timeLeft), 0);
  }

  static serializePlayers(
    players: Record<number, PlayerState>,
  ): SerializedPlayers {
    return Object.entries(players).reduce(
      (acc, [id, player]) => ({
        ...acc,
        [id]: { ...player.getReadonlyState(), score: player.score },
      }),
      {},
    );
  }
}

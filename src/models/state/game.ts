import * as trpc from '@trpc/server';
import { Prisma } from '@prisma/client';
import type Pusher from 'pusher';

import State from './state';
import PlayerState, { type InitPlayerState } from './player';
import { Stage } from '../../types/game/events';

type Quiz = Prisma.QuizGetPayload<{
  include: {
    questions: { include: { answers: true } };
    author: { select: { id: true; username: true } };
  };
}>;

export interface InitGameState {
  code: string;
  quiz: Quiz;
  pusher: Pusher;
}

interface BaseGameState {
  players: Record<number, PlayerState>;
  currentQuestionIndex: number;
  gameStartCountdown: number;
  questionStartCountdown: number;
  questionCountdown: number;
  gameStage: Stage;
  questionStage: Stage;
}

type IGameState = InitGameState & BaseGameState;

const GAME_START_COUNTDOWN = 5;
const QUESTION_START_COUNTDOWN = 3;
const QUESTION_COUNTDOWN = 10;

const BASE_STATE: BaseGameState = {
  players: {},
  currentQuestionIndex: -1,
  gameStartCountdown: 0,
  questionStartCountdown: 0,
  questionCountdown: 0,
  gameStage: Stage.NotStarted,
  questionStage: Stage.NotStarted,
};

export default class GameState extends State<IGameState> {
  constructor(state: InitGameState) {
    super({ ...BASE_STATE, ...state });
  }

  startGame(): void {
    if (!this.get('quiz').questions.length) return;

    this.set('gameStage', Stage.Starting);
    this.set('gameStartCountdown', GAME_START_COUNTDOWN);

    this.countdownStartGame();
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

  private finishGame() {}

  private startQuestion(): void {
    const { questions } = this.get('quiz');
    if (!questions[this.get('currentQuestionIndex') + 1]) {
      return this.finishGame();
    }

    this.set('currentQuestionIndex', (prev) => prev + 1);
    this.set('questionStage', Stage.Starting);
    this.set('questionStartCountdown', QUESTION_START_COUNTDOWN);

    this.countdownStartQuestion();
  }

  private questionLoop(): void {
    const currentCountdown = this.get('questionCountdown');

    if (currentCountdown) {
      setTimeout(() => {
        this.set('questionCountdown', (prev) => Math.max(0, prev - 1));
        this.questionLoop();
      }, 1000);
    } else {
      this.set('questionCountdown', QUESTION_COUNTDOWN);
      this.set('questionStage', Stage.Finished);
      this.finishQuestion();
    }
  }

  private finishQuestion(): void {
    setTimeout(() => {
      this.set('questionStage', Stage.Started);
      this.startQuestion();
    }, 5000);
  }

  private countdownStartGame(): void {
    const currentCountdown = this.get('gameStartCountdown');

    if (currentCountdown) {
      setTimeout(() => {
        this.set('gameStartCountdown', (prev) => Math.max(0, prev - 1));
        this.countdownStartGame();
      }, 1000);
    } else {
      this.set('gameStage', Stage.Started);
      this.set('gameStartCountdown', GAME_START_COUNTDOWN);
      this.startQuestion();
    }
  }

  private countdownStartQuestion(): void {
    const currentCountdown = this.get('questionStartCountdown');

    if (currentCountdown) {
      setTimeout(() => {
        this.set('questionStartCountdown', (prev) => Math.max(0, prev - 1));
        this.countdownStartQuestion();
      }, 1000);
    } else {
      this.set('questionStage', Stage.Started);
      this.set('questionStartCountdown', QUESTION_START_COUNTDOWN);
      this.questionLoop();
    }
  }

  static generateCode(length = 5): string {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }

    return result;
  }
}

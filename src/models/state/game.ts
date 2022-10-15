import * as trpc from '@trpc/server';
import { Prisma } from '@prisma/client';
import type Pusher from 'pusher';

import State from './state';
import PlayerState, { type InitPlayerState } from './player';
import { GameEvent, ChannelEvent, Stage } from '../../types/game/events';

interface PusherUser {
  id: string;
}

type Quiz = Prisma.QuizGetPayload<{
  include: {
    questions: { include: { answers: true } };
    author: { select: { id: true; username: true } };
  };
}>;

interface BroadcastOpts {
  includeStages?: boolean;
}

export interface InitGameState {
  code: string;
  quiz: Quiz;
  pusher: Pusher;
  onClean: (code: string) => void;
}

interface BaseGameState {
  players: Record<number, PlayerState>;
  currentQuestionIndex: number;
  gameStartCountdown: number;
  questionStartCountdown: number;
  questionCountdown: number;
  gameStage: Stage;
  questionStage: Stage;
  cleanupLoopInterval: ReturnType<typeof setInterval> | null;
  currentStageTimeout: ReturnType<typeof setTimeout> | null;
}

type IGameState = InitGameState & BaseGameState;

const GAME_START_COUNTDOWN = 5;
const QUESTION_START_COUNTDOWN = 3;
const QUESTION_COUNTDOWN = 11;
const CLEANUP_LOOP_INTERVAL = 10000;
const GAME_CLEANUP_TIMEOUT = 5000;
const SHORT_TICK = 1000;
const LONG_TICK = 5000;

const BASE_STATE: BaseGameState = {
  players: {},
  currentQuestionIndex: -1,
  gameStartCountdown: GAME_START_COUNTDOWN,
  questionStartCountdown: QUESTION_START_COUNTDOWN,
  questionCountdown: QUESTION_COUNTDOWN,
  gameStage: Stage.NotStarted,
  questionStage: Stage.NotStarted,
  cleanupLoopInterval: null,
  currentStageTimeout: null,
};

export default class GameState extends State<IGameState> {
  constructor(state: InitGameState) {
    super({
      ...BASE_STATE,
      ...state,
    });

    const playersCleanupInterval = setInterval(
      this.cleanupLoop.bind(this),
      CLEANUP_LOOP_INTERVAL,
    );

    this.set('cleanupLoopInterval', playersCleanupInterval);
  }

  getPlayer(id: number): PlayerState | undefined {
    return this.get('players')[id];
  }

  async addPlayer(id: number, state: InitPlayerState): Promise<PlayerState> {
    if (this.getPlayer(id))
      throw new trpc.TRPCError({
        code: 'BAD_REQUEST',
        message: 'Game with this code already exists.',
      });

    const player = new PlayerState(state);
    this.set('players', (players) => ({ ...players, [id]: player }));

    await this.broadcast(ChannelEvent.UpdatePlayers, {
      players: this.get('players'),
    });

    return player;
  }

  async removePlayer(id: number): Promise<boolean> {
    const currentPlayers = { ...this.get('players') };
    if (!(id in currentPlayers)) return false;

    delete currentPlayers[id];
    this.set('players', currentPlayers);

    await this.broadcast(ChannelEvent.UpdatePlayers, {
      players: currentPlayers,
    });

    return true;
  }

  async start(): Promise<void> {
    if (
      !this.get('quiz').questions.length ||
      !Object.keys(this.get('players')).length
    )
      return;

    this.set('gameStage', Stage.Starting);
    this.set('gameStartCountdown', GAME_START_COUNTDOWN);
    this.set('currentQuestionIndex', -1);

    await this.broadcast(
      GameEvent.StartGame,
      {
        gameStartCountdown: this.get('gameStartCountdown'),
      },
      { includeStages: true },
    );

    this.setCurrentStageTimeout(this.countdownStartGame, SHORT_TICK);
  }

  private async countdownStartGame(): Promise<void> {
    const currentCountdown = this.get('gameStartCountdown');

    if (currentCountdown) {
      this.set('gameStartCountdown', (prev) => Math.max(0, prev - 1));
      await this.broadcast(
        GameEvent.CountdownStartGame,
        {
          gameStartCountdown: this.get('gameStartCountdown'),
        },
        { includeStages: true },
      );

      this.setCurrentStageTimeout(this.countdownStartGame, SHORT_TICK);
    } else {
      this.set('gameStage', Stage.Started);
      this.startQuestion();
    }
  }

  private async startQuestion(): Promise<void> {
    const { questions } = this.get('quiz');

    if (!questions[this.get('currentQuestionIndex') + 1]) {
      this.set('gameStage', Stage.Finished);
      return this.finish();
    }

    this.set('currentQuestionIndex', (prev) => prev + 1);
    this.set('questionStage', Stage.Starting);
    this.set('questionStartCountdown', QUESTION_START_COUNTDOWN);
    this.set('questionCountdown', QUESTION_COUNTDOWN);

    await this.broadcast(
      GameEvent.StartQuestion,
      {
        questionStartCountdown: this.get('questionStartCountdown'),
      },
      { includeStages: true },
    );

    this.setCurrentStageTimeout(this.countdownStartQuestion, SHORT_TICK);
  }

  private async countdownStartQuestion(): Promise<void> {
    const currentCountdown = this.get('questionStartCountdown');

    if (currentCountdown) {
      this.set('questionStartCountdown', (prev) => Math.max(0, prev - 1));
      await this.broadcast(
        GameEvent.CountdownStartQuestion,
        {
          questionStartCountdown: this.get('questionStartCountdown'),
        },
        { includeStages: true },
      );

      this.setCurrentStageTimeout(this.countdownStartQuestion, SHORT_TICK);
    } else {
      this.set('questionStage', Stage.Started);
      this.questionLoop();
    }
  }

  private async questionLoop(): Promise<void> {
    const currentCountdown = this.get('questionCountdown');

    if (currentCountdown) {
      this.set('questionCountdown', (prev) => Math.max(0, prev - 1));
      await this.broadcast(
        GameEvent.QuestionLoop,
        {
          currentQuestionIndex: this.get('currentQuestionIndex'),
          questionCountdown: this.get('questionCountdown'),
        },
        { includeStages: true },
      );

      this.setCurrentStageTimeout(this.questionLoop, SHORT_TICK);
    } else {
      this.set('questionStage', Stage.Finished);
      this.finishQuestion();
    }
  }

  private async finishQuestion(): Promise<void> {
    await this.broadcast(GameEvent.FinishQuestion, {}, { includeStages: true });

    this.setCurrentStageTimeout(this.startQuestion, LONG_TICK);
  }

  private async finish(): Promise<void> {
    await this.broadcast(GameEvent.FinishGame, {}, { includeStages: true });

    this.set('currentStageTimeout', null);
  }

  private async broadcast<T>(
    event: GameEvent | ChannelEvent,
    data: T,
    { includeStages }: BroadcastOpts = {},
  ): Promise<void> {
    const code = this.get('code');
    await this.get('pusher').trigger(
      `presence-${code}`,
      event,
      includeStages
        ? {
            ...data,
            gameStage: this.get('gameStage'),
            questionStage: this.get('questionStage'),
          }
        : data,
    );
  }

  private async cleanupPlayers(users: PusherUser[]): Promise<void> {
    const currentPlayers = this.get('players');
    const cleanedPlayers = Object.entries(currentPlayers).filter(([playerId]) =>
      users.some(({ id }) => id === playerId.toString()),
    );

    if (cleanedPlayers.length === Object.keys(currentPlayers).length) return;

    const updatedPlayers = this.set(
      'players',
      cleanedPlayers.reduce(
        (acc, [id, player]) => ({ ...acc, [id]: player }),
        {},
      ),
    );

    await this.broadcast(ChannelEvent.UpdatePlayers, {
      players: updatedPlayers,
    });
  }

  private async cleanupGame(users: PusherUser[]) {
    if (users.length) return;
    this.get('onClean')(this.get('code'));
  }

  private async cleanupLoop(): Promise<void> {
    const users = await this.fetchUsers();
    this.cleanupPlayers(users);
    if (!users.length)
      setTimeout(this.cleanupGame.bind(this, users), GAME_CLEANUP_TIMEOUT);
  }

  private async fetchUsers(): Promise<PusherUser[]> {
    try {
      const response = await this.get('pusher').get({
        path: `/channels/presence-${this.get('code')}/users`,
      });
      const { users } = await response.json();

      return users;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  private setCurrentStageTimeout(cb: () => void, ms: number): void {
    this.set('currentStageTimeout', setTimeout(cb.bind(this), ms));
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

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

    await this.broadcast(ChannelEvent.UpdatePlayers, this.get('players'));

    return player;
  }

  async removePlayer(id: number): Promise<boolean> {
    const currentPlayers = { ...this.get('players') };
    if (!(id in currentPlayers)) return false;

    delete currentPlayers[id];
    this.set('players', currentPlayers);

    await this.broadcast(ChannelEvent.UpdatePlayers, currentPlayers);

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

    await this.broadcast(GameEvent.StartGame, {
      gameStartCountdown: this.get('gameStartCountdown'),
    });

    this.setCurrentStageTimeout(this.countdownStartGame, SHORT_TICK);
  }

  private async countdownStartGame(): Promise<void> {
    const currentCountdown = this.get('gameStartCountdown');
    const newCountdown = Math.max(0, currentCountdown - 1);

    if (currentCountdown) {
      this.set('gameStartCountdown', newCountdown);
      await this.broadcast(GameEvent.CountdownStartGame, {
        gameStartCountdown: newCountdown,
      });
    } else {
      this.set('gameStage', Stage.Started);
    }

    this.setCurrentStageTimeout(
      this[newCountdown ? 'countdownStartGame' : 'startQuestion'],
      SHORT_TICK,
    );
  }

  private async startQuestion(): Promise<void> {
    const { questions } = this.get('quiz');

    if (!questions[this.get('currentQuestionIndex') + 1]) {
      return this.finish();
    }

    this.set('currentQuestionIndex', (prev) => prev + 1);
    this.set('questionStage', Stage.Starting);
    this.set('questionStartCountdown', QUESTION_START_COUNTDOWN);
    this.set('questionCountdown', QUESTION_COUNTDOWN);

    await this.broadcast(GameEvent.StartQuestion, {
      questionStartCountdown: this.get('questionStartCountdown'),
    });

    this.setCurrentStageTimeout(this.countdownStartQuestion, SHORT_TICK);
  }

  private async countdownStartQuestion(): Promise<void> {
    const currentCountdown = this.get('questionStartCountdown');
    const newCountdown = Math.max(0, currentCountdown - 1);

    if (currentCountdown) {
      this.set('questionStartCountdown', newCountdown);
      await this.broadcast(GameEvent.CountdownStartQuestion, {
        questionStartCountdown: newCountdown,
      });
    } else {
      this.set('questionStage', Stage.Started);
    }

    this.setCurrentStageTimeout(
      this[newCountdown ? 'countdownStartQuestion' : 'questionLoop'],
      SHORT_TICK,
    );
  }

  private async questionLoop(): Promise<void> {
    const currentCountdown = this.get('questionCountdown');
    const newCountdown = Math.max(0, currentCountdown - 1);

    if (currentCountdown) {
      const currentQuestion =
        this.get('quiz').questions[this.get('currentQuestionIndex')];

      this.set('questionCountdown', newCountdown);
      await this.broadcast(GameEvent.QuestionLoop, {
        currentQuestion,
        questionCountdown: newCountdown,
      });
    } else {
      this.set('questionStage', Stage.Finished);
    }

    this.setCurrentStageTimeout(
      this[newCountdown ? 'questionLoop' : 'finishQuestion'],
      SHORT_TICK,
    );
  }

  private async finishQuestion(): Promise<void> {
    await this.broadcast(GameEvent.FinishQuestion, {});
    this.set('questionStage', Stage.Started);

    this.setCurrentStageTimeout(this.startQuestion, LONG_TICK);
  }

  private async finish(): Promise<void> {
    await this.broadcast(GameEvent.FinishGame, {});
    this.set('currentStageTimeout', null);
  }

  private async broadcast<T>(
    event: GameEvent | ChannelEvent,
    data: T,
  ): Promise<void> {
    const code = this.get('code');
    await this.get('pusher').trigger(`presence-${code}`, event, data);
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

    await this.broadcast(ChannelEvent.UpdatePlayers, updatedPlayers);
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

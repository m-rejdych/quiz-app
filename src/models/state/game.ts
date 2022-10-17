import * as trpc from '@trpc/server';
import { Prisma, type PrismaPromise } from '@prisma/client';
import type Pusher from 'pusher';

import State from './state';
import PlayerState, { type InitPlayerState } from './player';
import { GameEvent, ChannelEvent, Stage } from '../../types/game/events';
import { prisma } from '../../server/prisma';
import type UnwrapArrayItem from '../../types/common/UnwrapArrayItem';

type Quiz = Prisma.QuizGetPayload<{
  include: {
    questions: {
      include: {
        answers: { select: { id: true; content: true; isCorrect: true } };
      };
    };
    author: { select: { id: true; username: true } };
  };
}>;

type Question = UnwrapArrayItem<InitGameState['quiz']['questions']>;

interface FormattedQuestion extends Omit<Question, 'answers'> {
  answers: Omit<UnwrapArrayItem<Question['answers']>, 'isCorrect'>[];
}

interface PusherUser {
  id: string;
}

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
const CLEANUP_TIMEOUT = 5000;
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

    const cleanupLoopInterval = setInterval(
      this.cleanupLoop.bind(this),
      CLEANUP_LOOP_INTERVAL,
    );

    this.set('cleanupLoopInterval', cleanupLoopInterval);
  }

  get currentQuestion(): Question | null {
    return this.get('quiz').questions[this.get('currentQuestionIndex')] ?? null;
  }

  get formattedCurrentQuestion(): FormattedQuestion | null {
    const currentQuestion =
      this.get('quiz').questions[this.get('currentQuestionIndex')];
    if (!currentQuestion) return null;

    return {
      ...currentQuestion,
      answers: currentQuestion.answers.map(({ isCorrect, ...rest }) => rest),
    };
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
      players: PlayerState.formatPlayers(this.get('players')),
    });

    return player;
  }

  async removePlayer(id: number): Promise<boolean> {
    const currentPlayers = { ...this.get('players') };
    if (!(id in currentPlayers)) return false;

    delete currentPlayers[id];
    this.set('players', currentPlayers);

    await this.broadcast(ChannelEvent.UpdatePlayers, {
      players: PlayerState.formatPlayers(currentPlayers),
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
    try {
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
    } catch (error) {
      console.log(error);
    }
  }

  private async startQuestion(): Promise<void> {
    try {
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
          currentQuestionIndex: this.get('currentQuestionIndex'),
          currentQuestion: this.formattedCurrentQuestion,
        },
        { includeStages: true },
      );

      this.setCurrentStageTimeout(this.countdownStartQuestion, SHORT_TICK);
    } catch (error) {
      console.log(error);
    }
  }

  private async countdownStartQuestion(): Promise<void> {
    try {
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
    } catch (error) {
      console.log(error);
    }
  }

  private async questionLoop(): Promise<void> {
    try {
      const currentCountdown = this.get('questionCountdown');

      if (currentCountdown) {
        this.set('questionCountdown', (prev) => Math.max(0, prev - 1));
        await this.broadcast(
          GameEvent.QuestionLoop,
          {
            questionCountdown: this.get('questionCountdown'),
          },
          { includeStages: true },
        );

        this.setCurrentStageTimeout(this.questionLoop, SHORT_TICK);
      } else {
        this.set('questionStage', Stage.Finished);
        this.finishQuestion();
      }
    } catch (error) {
      console.log(error);
    }
  }

  private async finishQuestion(): Promise<void> {
    try {
      await this.broadcast(
        GameEvent.FinishQuestion,
        { players: PlayerState.formatPlayers(this.get('players')) },
        { includeStages: true },
      );

      this.setCurrentStageTimeout(this.startQuestion, LONG_TICK);
    } catch (error) {
      console.log(error);
    }
  }

  private async finish(): Promise<void> {
    try {
      const gameResultId = await this.generateResult();

      await this.broadcast(
        GameEvent.FinishGame,
        { gameResultId },
        {
          includeStages: true,
        },
      );

      this.set('currentStageTimeout', null);
    } catch (error) {
      console.log(error);
    }
  }

  private async generateResult(): Promise<number> {
    const gameResult = await prisma.gameResult.create({
      data: { quizId: this.get('quiz').id },
    });

    const playersToCreate = Object.entries(this.get('players')).map(
      ([id, { score }]) =>
        prisma.player.create({
          data: { userId: parseInt(id, 10), score, gameResultId: gameResult.id },
        }),
    );

    const answersToCreate: PrismaPromise<Prisma.BatchPayload>[] = [];

    for await (const { id, userId } of playersToCreate) {
      const player = this.getPlayer(userId);
      if (!player) continue;

      const { questionAnswers } = player.getReadonlyState();
      answersToCreate.push(
        prisma.answerOnPlayer.createMany({
          data: Object.values(questionAnswers)
            .filter(Boolean)
            .map((answer) => ({ answerId: answer!.answerId, playerId: id })),
        }),
      );
    }

    await Promise.all(answersToCreate);

    return gameResult.id;
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

  private async cleanupPlayers(fetchedUsers?: PusherUser[]): Promise<void> {
    const users = fetchedUsers ?? (await this.fetchUsers());

    const currentPlayers = this.get('players');
    const cleanedPlayers = Object.entries(currentPlayers).filter(([playerId]) =>
      users.some(({ id }) => id === playerId.toString()),
    );

    if (cleanedPlayers.length === Object.keys(currentPlayers).length) return;

    if (fetchedUsers) {
      setTimeout(this.cleanupPlayers.bind(this), CLEANUP_TIMEOUT);
    } else {
      const updatedPlayers = this.set(
        'players',
        cleanedPlayers.reduce(
          (acc, [id, player]) => ({ ...acc, [id]: player }),
          {},
        ),
      );

      await this.broadcast(ChannelEvent.UpdatePlayers, {
        players: PlayerState.formatPlayers(updatedPlayers),
      });
    }
  }

  private async cleanupGame() {
    const users = await this.fetchUsers();
    if (users.length) return;

    this.get('onClean')(this.get('code'));
  }

  private async cleanupLoop(): Promise<void> {
    try {
      const users = await this.fetchUsers();

      this.cleanupPlayers(users);
      if (!users.length) {
        setTimeout(this.cleanupGame.bind(this), CLEANUP_TIMEOUT);
      }
    } catch (error) {
      console.log(error);
    }
  }

  private async fetchUsers(): Promise<PusherUser[]> {
    const response = await this.get('pusher').get({
      path: `/channels/presence-${this.get('code')}/users`,
    });
    const { users } = await response.json();

    return users;
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

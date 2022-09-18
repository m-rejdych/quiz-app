export enum GameEvent {
  StartGame = 'START_GAME',
  CountdownStartGame = 'START_GAME',
  StartQuestion = 'START_QUESTION',
  CountdownStartQuestion = 'COUNTDOWN_START_QUESTION',
  QuestionLoop = 'QUESTION_LOOP',
  FinishQuestion = 'FINISH_QUESTION',
  FinishGame = 'FINISH_GAME',
}

export enum Stage {
  NotStarted,
  Starting,
  Started,
  Finished,
}

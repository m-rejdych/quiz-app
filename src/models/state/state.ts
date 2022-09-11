type SetStateCb<T extends object, U extends keyof T> = (
  prevState: T[U],
) => T[U];

export default class State<T extends object> {
  constructor(private state: T) {}

  protected set<U extends keyof T>(
    key: U,
    newState: T[U] | SetStateCb<T, U>,
  ): T[U] {
    const updatedState =
      newState instanceof Function ? newState(this.state[key]) : newState;
    this.state[key] = updatedState;

    return updatedState;
  }

  protected get<U extends keyof T>(key: U): T[U] {
    return this.state[key];
  }
}

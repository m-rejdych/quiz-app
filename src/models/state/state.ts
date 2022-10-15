type SetStateCb<T extends object, U extends keyof T> = (
  prevState: T[U],
) => T[U];

interface GetReadonlyStateOpts<T extends object, U extends keyof T> {
  exclude?: U | U[];
}

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

  getReadonlyState<U extends keyof T = never>({
    exclude,
  }: GetReadonlyStateOpts<T, U> = {}): Readonly<Omit<T, U>> {
    if (exclude) {
      return Object.entries(this.state)
        .filter(([key]) =>
          Array.isArray(exclude)
            ? !exclude.includes(key as U)
            : key !== exclude,
        )
        .reduce(
          (acc, [key, value]) => ({ ...acc, [key]: value }),
          {} as Omit<T, U>,
        );
    }

    return this.state;
  }
}

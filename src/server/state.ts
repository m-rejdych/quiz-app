import AppState from '../models/state/app';

const __prod__ = process.env.NODE_ENV === 'production';

export const state = global.state ?? new AppState();

if (!__prod__) {
  global.state = state;
}

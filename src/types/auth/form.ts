import type { HTMLInputTypeAttribute } from 'react';
import type { RegisterOptions } from 'react-hook-form';

export interface Field<T extends string> {
  name: T;
  type: HTMLInputTypeAttribute;
  label: string;
  registerOptions: RegisterOptions;
}

export interface LoginFieldNames {
  email: string;
  password: string;
}

export interface RegisterFieldNames extends LoginFieldNames {
  username: string;
}

export enum AuthMode {
  Login,
  Register,
}

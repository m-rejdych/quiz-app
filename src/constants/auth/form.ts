import {
  Field,
  LoginFieldNames,
  RegisterFieldNames,
} from '../../types/auth/form';

export const EMAIL_PATTERN =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export const PASSWORD_PATTERN =
  /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/;

export const LOGIN_FIELDS: Field<keyof LoginFieldNames>[] = [
  {
    name: 'email',
    type: 'email',
    label: 'Email',
    registerOptions: {
      required: 'Email is required.',
      pattern: {
        value: EMAIL_PATTERN,
        message: 'Invalid email.',
      },
    },
  },
  {
    name: 'password',
    type: 'password',
    label: 'Password',
    registerOptions: {
      required: 'Password is required.',
      pattern: {
        value: PASSWORD_PATTERN,
        message:
          'Password must be at least 6 characters long and contain numbers and special characters.',
      },
    },
  },
];

export const REGISTER_FIELDS: Field<keyof RegisterFieldNames>[] = [
  ...LOGIN_FIELDS,
  {
    name: 'username',
    type: 'text',
    label: 'Username',
    registerOptions: {
      required: 'Username is required.',
      minLength: {
        value: 3,
        message: 'Username must be at least 3 characters long.',
      },
    },
  },
];

import type { FC } from 'react';
import {
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  type FormControlProps,
  type FormLabelProps,
  type InputProps,
  type FormErrorMessageProps,
} from '@chakra-ui/react';

interface Props extends FormControlProps {
  labelProps?: FormLabelProps;
  inputProps?: InputProps;
  errorProps?: FormErrorMessageProps;
  error?: string;
}

const LabeledInput: FC<Props> = ({
  labelProps,
  inputProps,
  errorProps,
  error,
  label,
  ...rest
}) => (
  <FormControl {...rest}>
    {label && <FormLabel {...labelProps}>{label}</FormLabel>}
    <Input {...inputProps} />
    {error && <FormErrorMessage>{error}</FormErrorMessage>}
  </FormControl>
);

export default LabeledInput;

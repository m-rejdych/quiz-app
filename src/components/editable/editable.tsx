import type { FC } from 'react';
import {
  Editable,
  EditablePreview,
  EditableInput,
  type EditableProps,
  type EditablePreviewProps,
  type EditableInputProps,
  type BoxProps,
} from '@chakra-ui/react';

import Controls from './controls';

interface Props extends EditableProps {
  previewProps?: EditablePreviewProps;
  inputProps?: EditableInputProps;
  controlsProps?: BoxProps;
}

const EditableComponent: FC<Props> = ({
  previewProps,
  inputProps,
  controlsProps,
  ...rest
}) => (
  <Editable
    display="flex"
    flexDirection="row"
    justifyContent="space-between"
    alignItems="center"
    {...rest}
  >
    <EditablePreview {...previewProps} />
    <EditableInput {...inputProps} />
    <Controls {...controlsProps} />
  </Editable>
);

export default EditableComponent;

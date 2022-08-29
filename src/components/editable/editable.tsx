import type { FC } from 'react';
import {
  Editable,
  EditablePreview,
  EditableInput,
  type EditableProps,
  type EditablePreviewProps,
  type EditableInputProps,
} from '@chakra-ui/react';

import Controls from './controls';

interface Props extends EditableProps {
  previewProps?: EditablePreviewProps;
  inputProps?: EditableInputProps;
}

const EditableComponent: FC<Props> = ({
  previewProps,
  inputProps,
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
    <EditableInput mr={4} {...inputProps} />
    <Controls />
  </Editable>
);

export default EditableComponent;

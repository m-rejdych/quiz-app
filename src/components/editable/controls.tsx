import type { FC } from 'react';
import {
  useEditableControls,
  ButtonGroup,
  IconButton,
  Box,
} from '@chakra-ui/react';
import { CheckIcon, CloseIcon, EditIcon } from '@chakra-ui/icons';

const Controls: FC = () => {
  const {
    isEditing,
    getEditButtonProps,
    getCancelButtonProps,
    getSubmitButtonProps,
  } = useEditableControls();

  return isEditing ? (
    <ButtonGroup justifyContent="center" size="sm">
      <IconButton
        aria-label="submit"
        icon={<CheckIcon />}
        {...getSubmitButtonProps()}
      />
      <IconButton
        aria-label="cancel"
        icon={<CloseIcon />}
        {...getCancelButtonProps()}
      />
    </ButtonGroup>
  ) : (
    <Box>
      <IconButton
        aria-label="edit"
        size="sm"
        icon={<EditIcon />}
        {...getEditButtonProps()}
      />
    </Box>
  );
};

export default Controls;

import type { FC } from 'react';
import { IconButton } from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';

const AddQuestionButton: FC = () => {
  return (
    <IconButton
      aria-label="add-question"
      size="sm"
      icon={<AddIcon />}
      color="secondary.light"
    />
  );
};

export default AddQuestionButton;

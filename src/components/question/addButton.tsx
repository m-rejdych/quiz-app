import { type FC, type ChangeEvent, useState } from 'react';
import {
  IconButton,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverHeader,
  PopoverCloseButton,
  PopoverBody,
  PopoverFooter,
  Button,
  Input,
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';

import LabeledInput from '../common/labeledInput';

const AddQuestionButton: FC = () => {
  const [title, setTitle] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const isError = isSubmitted && !title;

  const handleChangeTitle = (e: ChangeEvent<HTMLInputElement>): void => {
    setTitle(e.target.value);
  };

  const handleSubmit = (): void => {
    setIsSubmitted(true);

    if (!title) return;
  };

  const handleClose = (): void => {
    setTimeout(() => {
      setTitle('');
      setIsSubmitted(false);
    }, 100);
  };

  return (
    <Popover onClose={handleClose}>
      <PopoverTrigger>
        <IconButton
          aria-label="add-question"
          size="sm"
          icon={<AddIcon />}
          color="secondary.light"
        />
      </PopoverTrigger>
      <PopoverContent>
        <PopoverArrow />
        <PopoverHeader>Add question</PopoverHeader>
        <PopoverCloseButton />
        <PopoverBody>
          <LabeledInput
            isInvalid={isError}
            inputProps={{
              name: 'question-title',
              value: title,
              onChange: handleChangeTitle,
            }}
            label="Question title"
            labelProps={{ htmlFor: 'question-title' }}
            error={isError ? 'Question title is required.' : undefined}
          />
        </PopoverBody>
        <PopoverFooter>
          <Button colorScheme="red" onClick={handleSubmit}>
            Add
          </Button>
        </PopoverFooter>
      </PopoverContent>
    </Popover>
  );
};

export default AddQuestionButton;

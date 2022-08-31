import { type FC, type ChangeEvent, useState, useEffect } from 'react';
import {
  ButtonGroup,
  IconButton,
  Flex,
  Input,
  SlideFade,
  Box,
} from '@chakra-ui/react';
import { AddIcon, CheckIcon, CloseIcon } from '@chakra-ui/icons';

interface Props {
  isOpen: boolean;
}

const AddAnswerButton: FC<Props> = ({ isOpen }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const clearup = (): void => {
    setTitle('');
    setIsSubmitted(false);
  };

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        clearup();
        setIsAdding(false);
      }, 200);
    }
  }, [isOpen]);

  const isError = isSubmitted && !title;

  const handleChangeTitle = (e: ChangeEvent<HTMLInputElement>): void => {
    setTitle(e.target.value);
  };

  const handleSubmit = (): void => {
    setIsSubmitted(true);

    if (!title) return;

    setIsAdding(false);
  };

  return (
    <Flex alignItems="center" justifyContent="flex-end" width="100%">
      <Box flex={1} mr={3}>
        <SlideFade in={isAdding} offsetY="20px" onAnimationComplete={clearup}>
          <Input
            isInvalid={isError}
            name="answer-title"
            placeholder={isError ? 'Answer title is requried' : 'Answer title'}
            value={title}
            onChange={handleChangeTitle}
          />
        </SlideFade>
      </Box>
      {isAdding ? (
        <ButtonGroup size="sm" spacing={2}>
          <IconButton
            colorScheme="teal"
            icon={<CheckIcon />}
            aria-label="submit-answer"
            onClick={handleSubmit}
          />
          <IconButton
            colorScheme="red"
            icon={<CloseIcon />}
            aria-label="cancel-answer"
            onClick={() => setIsAdding(false)}
          />
        </ButtonGroup>
      ) : (
        <IconButton
          size="sm"
          icon={<AddIcon />}
          colorScheme="red"
          aria-label="add-answer"
          onClick={() => setIsAdding(true)}
        />
      )}
    </Flex>
  );
};

export default AddAnswerButton;

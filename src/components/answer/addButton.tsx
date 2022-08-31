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
  onAdd: (content: string) => void;
}

const AddAnswerButton: FC<Props> = ({ isOpen, onAdd }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [content, setContent] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const clearup = (): void => {
    setContent('');
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

  const isError = isSubmitted && !content;

  const handleChangeContent = (e: ChangeEvent<HTMLInputElement>): void => {
    setContent(e.target.value);
  };

  const handleSubmit = (): void => {
    setIsSubmitted(true);

    if (!content) return;

    onAdd(content);
    setIsAdding(false);
  };

  return (
    <Flex alignItems="center" justifyContent="flex-end" width="100%">
      <Box flex={1} mr={3}>
        <SlideFade in={isAdding} offsetY="20px" onAnimationComplete={clearup}>
          <Input
            isInvalid={isError}
            name="answer-content"
            placeholder={
              isError ? 'Answer content is requried' : 'Answer content'
            }
            value={content}
            onChange={handleChangeContent}
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

import {
  type FC,
  type ChangeEvent,
  type KeyboardEvent,
  useState,
  useEffect,
} from 'react';
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
  onAdd: (content: string) => boolean;
}

const AddAnswerButton: FC<Props> = ({ isOpen, onAdd }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isInputHidden, setIsInputHidden] = useState(true);
  const [content, setContent] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const clearup = (): void => {
    setContent('');
    setIsSubmitted(false);
    setIsInputHidden(true);
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

  const handleAnimationCompleted = (): void => {
    if (isAdding) return;

    setTimeout(clearup, 150);
  };

  const handleStartAdding = (): void => {
    setIsAdding(true);
    setIsInputHidden(false);
  };

  const handleSubmit = (): void => {
    setIsSubmitted(true);

    if (!content) return;

    if (onAdd(content)) setIsAdding(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <Flex alignItems="center" justifyContent="flex-end" width="100%">
      <Box flex={1} mr={3}>
        <SlideFade
          in={isAdding}
          offsetY="20px"
          onAnimationComplete={handleAnimationCompleted}
        >
          <Input
            hidden={isInputHidden}
            isInvalid={isError}
            name="answer-content"
            placeholder={
              isError ? 'Answer content is requried' : 'Answer content'
            }
            value={content}
            onChange={handleChangeContent}
            onKeyDown={handleKeyDown}
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
          onClick={handleStartAdding}
        />
      )}
    </Flex>
  );
};

export default AddAnswerButton;

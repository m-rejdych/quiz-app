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
  Text,
  VStack,
  Flex,
  useDisclosure,
} from '@chakra-ui/react';
import { AddIcon, CloseIcon } from '@chakra-ui/icons';
import type { Answer as PrismaAnswer } from '@prisma/client';

import LabeledInput from '../common/labeledInput';
import AddAnswerButton from '../answer/addButton';
import AnswersList from '../answer/list';

type Answer = Pick<PrismaAnswer, 'content' | 'isCorrect'>;

const AddQuestionButton: FC = () => {
  const [title, setTitle] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const isError = isSubmitted && !title;

  const handleChangeTitle = (e: ChangeEvent<HTMLInputElement>): void => {
    setTitle(e.target.value);
  };

  const handleSubmit = (): void => {
    setIsSubmitted(true);

    if (!title) return;

    onClose();
  };

  const handleClose = (): void => {
    onClose();

    setTimeout(() => {
      setTitle('');
      setIsSubmitted(false);
      setAnswers([]);
    }, 200);
  };

  const handleAddAnswer = (content: string): void => {
    if (answers.some(({ content: answerContent }) => content === answerContent))
      return;

    setAnswers((prev) => [...prev, { content, isCorrect: false }]);
  };

  return (
    <Popover isOpen={isOpen} onClose={handleClose} size="md">
      <PopoverTrigger>
        <IconButton
          aria-label="add-question"
          size="sm"
          icon={isOpen ? <CloseIcon /> : <AddIcon />}
          colorScheme="red"
          onClick={onOpen}
        />
      </PopoverTrigger>
      <PopoverContent>
        <PopoverArrow />
        <PopoverHeader>Add question</PopoverHeader>
        <PopoverCloseButton />
        <PopoverBody>
          <VStack spacing={6} alignItems="stretch">
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
            <VStack spacing={3} alignItems="stretch">
              <Flex justifyContent="space-between" alignItems="center">
                <Text fontSize="md" fontWeight="medium" mr={3}>
                  Answers
                </Text>
                <AddAnswerButton isOpen={isOpen} onAdd={handleAddAnswer} />
              </Flex>
              <AnswersList answers={answers} />
            </VStack>
          </VStack>
        </PopoverBody>
        <PopoverFooter>
          <Button colorScheme="teal" onClick={handleSubmit}>
            Add
          </Button>
        </PopoverFooter>
      </PopoverContent>
    </Popover>
  );
};

export default AddQuestionButton;

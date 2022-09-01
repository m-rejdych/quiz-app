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
  Divider,
  useDisclosure,
} from '@chakra-ui/react';
import { AddIcon, CloseIcon } from '@chakra-ui/icons';
import type { Answer as PrismaAnswer } from '@prisma/client';

import LabeledInput from '../common/labeledInput';
import AddAnswerButton from '../answer/addButton';
import AnswersList from '../answer/list';

type Answer = Pick<PrismaAnswer, 'content' | 'isCorrect'>;

interface Question {
  title: string;
  answers: Answer[];
}

interface Props {
  onAdd: (question: Question) => void;
}

const AddQuestionButton: FC<Props> = ({ onAdd }) => {
  const [title, setTitle] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const isError = isSubmitted && !title;

  const handleChangeTitle = (e: ChangeEvent<HTMLInputElement>): void => {
    setTitle(e.target.value);
  };

  const handleClose = (): void => {
    onClose();

    setTimeout(() => {
      setTitle('');
      setIsSubmitted(false);
      setAnswers([]);
    }, 200);
  };

  const handleSubmit = (): void => {
    setIsSubmitted(true);

    if (!title) return;

    onAdd({ title, answers });
    handleClose();
  };

  const handleAddAnswer = (content: string): void => {
    if (answers.some(({ content: answerContent }) => content === answerContent))
      return;

    setAnswers((prev) => [
      { content, isCorrect: true },
      ...prev.map((answer) => ({ ...answer, isCorrect: false })),
    ]);
  };

  const handleSelectCorrect = (content: string): void => {
    setAnswers((prev) =>
      prev.map((answer) => ({
        ...answer,
        isCorrect: answer.content === content,
      })),
    );
  };

  const handleDelete = (content: string): void => {
    const newAnswers = answers.filter(
      ({ content: answerContent }) => content !== answerContent,
    );

    if (newAnswers.length && !newAnswers.some(({ isCorrect }) => isCorrect)) {
      newAnswers[newAnswers.length - 1].isCorrect = true;
    }

    setAnswers(newAnswers);
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
              <Flex
                justifyContent="space-between"
                alignItems="center"
                minH={10}
              >
                <Text fontSize="md" fontWeight="medium" mr={3}>
                  Answers
                </Text>
                <AddAnswerButton isOpen={isOpen} onAdd={handleAddAnswer} />
              </Flex>
              {!!answers.length && (
                <>
                  <Divider />
                  <Flex alignItems="center" justifyContent="space-between">
                    <Text fontWeight="bold">Answer title</Text>
                    <Text fontWeight="bold">Correct answer</Text>
                  </Flex>
                  <AnswersList
                    answers={answers}
                    onCorrectSelect={handleSelectCorrect}
                    onDelete={handleDelete}
                  />
                </>
              )}
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

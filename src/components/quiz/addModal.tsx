import { type FC, type ChangeEvent, useState } from 'react';
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  VStack,
  Text,
  Flex,
  Divider,
} from '@chakra-ui/react';

import AddQuestionButton from '../question/addButton';
import QuestionsList from '../question/list';
import LabeledInput from '../common/labeledInput';
import useAuthError from '../../hooks/useAuthError';
import { trpc } from '../../utils/trpc';
import type {
  QuestionListItem,
  DeleteHandlerPayload,
} from '../../types/question/list';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const AddQuizModal: FC<Props> = ({ isOpen, onClose }) => {
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState<QuestionListItem[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const onError = useAuthError();
  const { invalidateQueries } = trpc.useContext();
  const createQuiz = trpc.useMutation('quiz.create-quiz', {
    onSuccess: () => {
      invalidateQueries(['quiz.list']);
    },
  });

  const isError = isSubmitted && !title;

  const handleChangeTitle = (e: ChangeEvent<HTMLInputElement>): void => {
    setTitle(e.target.value);
  };

  const handleSubmit = async (): Promise<void> => {
    setIsSubmitted(true);

    if (!title) return;

    try {
      await createQuiz.mutateAsync({
        title,
        questions: questions.length
          ? questions.map(({ answers, ...question }) => ({
              ...question,
              answers: answers.length ? answers : undefined,
            }))
          : undefined,
      });

      onClose();
    } catch (error) {
      onError(error as Parameters<typeof onError>[0]);
    }
  };

  const handleCloseComplete = (): void => {
    setTitle('');
    setIsSubmitted(false);
    setQuestions([]);
  };

  const handleAddQuestion = (question: QuestionListItem): boolean => {
    if (questions.some(({ title }) => title === question.title)) return false;

    setQuestions((prev) => [question, ...prev]);
    return true;
  };

  const handleDeleteQuestion = ({ title }: DeleteHandlerPayload): void => {
    setQuestions((prev) =>
      prev.filter(({ title: questionTitle }) => title !== questionTitle),
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onCloseComplete={handleCloseComplete}
      size="xl"
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add quiz</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={6} alignItems="stretch">
            <LabeledInput
              isInvalid={isError}
              inputProps={{
                name: 'quiz-title',
                value: title,
                onChange: handleChangeTitle,
              }}
              label="Quiz title"
              labelProps={{ htmlFor: 'quiz-title' }}
              error={isError ? 'Quiz title is required.' : undefined}
            />
            <VStack spacing={3} alignItems="stretch">
              <Flex justifyContent="space-between" alignItems="center">
                <Text fontSize="md" fontWeight="medium">
                  Questions
                </Text>
                <AddQuestionButton onAdd={handleAddQuestion} />
              </Flex>
              {!!questions.length && (
                <>
                  <Divider />
                  <QuestionsList
                    questions={questions}
                    onDelete={handleDeleteQuestion}
                  />
                </>
              )}
            </VStack>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button
            colorScheme="teal"
            onClick={handleSubmit}
            isLoading={createQuiz.isLoading}
          >
            Add
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddQuizModal;

import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import {
  VStack,
  Flex,
  Text,
  Divider,
  Button,
  IconButton,
  HStack,
} from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';

import QuestionsList from '../../../components/question/list';
import AddQuestionButton from '../../../components/question/addButton';
import useAuthError from '../../../hooks/useAuthError';
import { getPropsWithSession } from '../../../utils/session';
import { trpc } from '../../../utils/trpc';
import type {
  UpdateQuestionPayload,
  QuestionListItem,
} from '../../../types/question/list';
import type { UpdateAnswerPayload } from '../../../types/answer/list';

const Quiz: NextPage = () => {
  const { invalidateQueries } = trpc.useContext();
  const router = useRouter();
  const quizId = parseInt(router.query.id as string, 10);
  const invalidateQuizQueries = (): void => {
    invalidateQueries(['quiz.get-by-id', quizId]);
  };
  const onError = useAuthError();
  const { data } = trpc.useQuery(['quiz.get-by-id', quizId], { onError });
  const addQuestion = trpc.useMutation('question.add', {
    onSuccess: invalidateQuizQueries,
  });
  const deleteQuestion = trpc.useMutation('question.delete', {
    onSuccess: invalidateQuizQueries,
  });
  const updateQuestion = trpc.useMutation('question.update', {
    onSuccess: invalidateQuizQueries,
  });
  const addAnswer = trpc.useMutation('answer.add', {
    onSuccess: invalidateQuizQueries,
  });
  const deleteAnswer = trpc.useMutation('answer.delete', {
    onSuccess: invalidateQuizQueries,
  });
  const updateAnswer = trpc.useMutation('answer.update', {
    onSuccess: invalidateQuizQueries,
  });
  const deleteQuiz = trpc.useMutation('quiz.delete');
  const createGame = trpc.useMutation('game.create');

  const canStart =
    !!data?.questions.length &&
    data.questions.some(({ answers }) => answers.length >= 2) &&
    !deleteQuiz.isLoading;

  const handleDeleteQuestion = async ({
    id,
  }: UpdateQuestionPayload): Promise<void> => {
    if (!id) return;

    try {
      await deleteQuestion.mutateAsync(id);
    } catch (error) {
      onError(error as Parameters<typeof onError>[0]);
    }
  };

  const handleAddQuestion = async ({
    answers,
    ...question
  }: QuestionListItem): Promise<boolean> => {
    try {
      await addQuestion.mutateAsync({
        quizId,
        question: {
          ...question,
          answers: answers.length ? answers : undefined,
        },
      });
      return true;
    } catch (error) {
      onError(error as Parameters<typeof onError>[0]);
      return false;
    }
  };

  const handleAddAnswer =
    (questionId: number) =>
    async (content: string): Promise<boolean> => {
      try {
        await addAnswer.mutateAsync({
          questionId,
          answer: { content, isCorrect: false },
        });
        return true;
      } catch (error) {
        onError(error as Parameters<typeof onError>[0]);
        return false;
      }
    };

  const handleEditTitle = async ({
    title,
    id,
  }: UpdateQuestionPayload): Promise<void> => {
    if (!id) return;

    try {
      await updateQuestion.mutateAsync({
        id: id,
        question: { title },
      });
    } catch (error) {
      onError(error as Parameters<typeof onError>[0]);
    }
  };

  const handleDeleteAnswer = async ({
    id,
  }: UpdateAnswerPayload): Promise<void> => {
    if (!id) return;

    try {
      await deleteAnswer.mutateAsync(id);
    } catch (error) {
      onError(error as Parameters<typeof onError>[0]);
    }
  };

  const handleEditAnswerContent = async ({
    id,
    content,
  }: UpdateAnswerPayload): Promise<void> => {
    if (!id) return;

    try {
      await updateAnswer.mutateAsync({ id, answer: { content } });
    } catch (error) {
      onError(error as Parameters<typeof onError>[0]);
    }
  };

  const handleCorrectAnswerSelect = async ({ id }: UpdateAnswerPayload) => {
    if (!id) return;

    try {
      await updateAnswer.mutateAsync({ id, answer: { isCorrect: true } });
    } catch (error) {
      onError(error as Parameters<typeof onError>[0]);
    }
  };

  const handleStartGame = async (): Promise<void> => {
    if (!canStart) return;

    try {
      const { code } = await createGame.mutateAsync({
        quizId,
      });
      await router.push(`/game/${code}`);
    } catch (error) {
      onError(error as Parameters<typeof onError>[0]);
    }
  };

  const handleDeleteQuiz = async (): Promise<void> => {
    try {
      await deleteQuiz.mutateAsync(quizId);
      await router.push('/');
    } catch (error) {
      onError(error as Parameters<typeof onError>[0]);
    }
  };

  return data ? (
    <VStack spacing={6} alignItems="stretch">
      <Flex alignItems="center" justifyContent="space-between">
        <Text fontSize="2xl" fontWeight="bold">
          {data.title}
        </Text>
        <HStack spacing={3}>
          <IconButton
            colorScheme="red"
            variant="outline"
            aria-label="delete-quiz"
            icon={<DeleteIcon />}
            onClick={handleDeleteQuiz}
            isLoading={deleteQuiz.isLoading}
          />
          <Button
            isDisabled={!canStart}
            colorScheme="teal"
            onClick={handleStartGame}
            isLoading={createGame.isLoading}
          >
            Start quiz
          </Button>
        </HStack>
      </Flex>
      <Divider />
      <Flex alignItems="center" justifyContent="space-between">
        <Text fontSize="xl">Questions</Text>
        <AddQuestionButton
          onAdd={handleAddQuestion}
          isLoading={addQuestion.isLoading}
        />
      </Flex>
      <QuestionsList
        questions={data.questions}
        onDelete={handleDeleteQuestion}
        onEditTitle={handleEditTitle}
        onAddAnswer={handleAddAnswer}
        onDeleteAnswer={handleDeleteAnswer}
        onEditAnswerContent={handleEditAnswerContent}
        onCorrectAnswerSelect={handleCorrectAnswerSelect}
        isQuestionLoading={deleteQuestion.isLoading}
        isAnswerLoading={deleteAnswer.isLoading}
      />
    </VStack>
  ) : null;
};

export const getServerSideProps = getPropsWithSession();

export default Quiz;

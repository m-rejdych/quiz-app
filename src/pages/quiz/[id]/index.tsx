import { VStack, Flex, Text, Divider, Button } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import type { NextPage } from 'next';

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
  const { query } = useRouter();
  const quizId = parseInt(query.id as string, 10);
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
  const createGame = trpc.useMutation('game.create');
  const router = useRouter();

  const canStart =
    !!data?.questions.length &&
    data.questions.some(({ answers }) => answers.length >= 2);

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
    const { id } = router.query;

    try {
      const { code } = await createGame.mutateAsync({
        quizId: parseInt(id as string, 10),
      });
      await router.push(`/game/${code}`);
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
        <Button
          isDisabled={!canStart}
          isLoading={createGame.isLoading}
          colorScheme="teal"
          onClick={handleStartGame}
        >
          Start quiz
        </Button>
      </Flex>
      <Divider />
      <Flex alignItems="center" justifyContent="space-between">
        <Text fontSize="xl">Questions</Text>
        <AddQuestionButton onAdd={handleAddQuestion} />
      </Flex>
      <QuestionsList
        questions={data.questions}
        onDelete={handleDeleteQuestion}
        onEditTitle={handleEditTitle}
        onAddAnswer={handleAddAnswer}
        onDeleteAnswer={handleDeleteAnswer}
        onEditAnswerContent={handleEditAnswerContent}
        onCorrectAnswerSelect={handleCorrectAnswerSelect}
      />
    </VStack>
  ) : null;
};

export const getServerSideProps = getPropsWithSession();

export default Quiz;

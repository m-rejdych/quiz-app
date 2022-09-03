import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { VStack, Flex, Text, Divider, Button } from '@chakra-ui/react';

import QuestionsList from '../../components/question/list';
import AddQuestionButton from '../../components/question/addButton';
import useAuthError from '../../hooks/useAuthError';
import { getPropsWithSession } from '../../utils/session';
import { trpc } from '../../utils/trpc';
import type {
  DeleteHandlerPayload,
  QuestionListItem,
} from '../../types/question/list';

const Quiz: NextPage = () => {
  const { invalidateQueries } = trpc.useContext();
  const { query } = useRouter();
  const quizId = parseInt(query.id as string, 10);
  const invalidateQuizQueries = (): void => {
    invalidateQueries(['quiz.get-by-id', quizId]);
  };
  const onError = useAuthError();
  const { data } = trpc.useQuery(['quiz.get-by-id', quizId], { onError });
  const deleteQuestion = trpc.useMutation('question.delete-question', {
    onSuccess: invalidateQuizQueries,
  });
  const addQuestion = trpc.useMutation('question.add', {
    onSuccess: invalidateQuizQueries,
  });

  const handleDeleteQuestion = async ({
    id,
  }: DeleteHandlerPayload): Promise<void> => {
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

  return data ? (
    <VStack spacing={6} alignItems="stretch">
      <Flex alignItems="center" justifyContent="space-between">
        <Text fontSize="2xl" fontWeight="bold">
          {data.title}
        </Text>
        <Button colorScheme="teal">Start quiz</Button>
      </Flex>
      <Divider />
      <Flex alignItems="center" justifyContent="space-between">
        <Text fontSize="xl">Questions</Text>
        <AddQuestionButton onAdd={handleAddQuestion} />
      </Flex>
      <QuestionsList
        questions={data.questions}
        onDelete={handleDeleteQuestion}
      />
    </VStack>
  ) : null;
};

export const getServerSideProps = getPropsWithSession();

export default Quiz;

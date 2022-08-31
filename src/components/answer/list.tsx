import type { FC } from 'react';
import type { Answer as PrismaAnswer } from '@prisma/client';
import { UnorderedList, ListItem, SlideFade } from '@chakra-ui/react';

type Answer = Pick<PrismaAnswer, 'content' | 'isCorrect'>;

interface Props {
  answers: Answer[];
}

const AnswersList: FC<Props> = ({ answers }) => {
  return (
    <UnorderedList listStyleType="none" spacing={2}>
      {answers.map(({ content }) => (
        <SlideFade in offsetY="-20px">
          <ListItem key={`answer-${content}`} fontWeight="bold" fontSize="lg">
            {content}
          </ListItem>
        </SlideFade>
      ))}
    </UnorderedList>
  );
};

export default AnswersList;

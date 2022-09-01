import type { FC } from 'react';
import type { Answer as PrismaAnswer } from '@prisma/client';
import {
  UnorderedList,
  ListItem,
  SlideFade,
  Radio,
  Text,
} from '@chakra-ui/react';

type Answer = Pick<PrismaAnswer, 'content' | 'isCorrect'>;

interface Props {
  answers: Answer[];
  withRadio?: boolean;
  onCorrectSelect?: (content: string) => void;
}

const AnswersList: FC<Props> = ({ answers, onCorrectSelect, withRadio }) => {
  const handleSelect = (content: string): void => {
    if (!withRadio) return;

    onCorrectSelect?.(content);
  };

  return (
    <UnorderedList listStyleType="none" spacing={2}>
      {answers.map(({ content, isCorrect }) => (
        <SlideFade in offsetY="-20px" key={`answer-${content}`}>
          <ListItem
            key={`answer-${content}`}
            fontSize="lg"
            display="flex"
            alignItems="center"
            justifyContent={withRadio ? 'space-between' : 'flex-start'}
          >
            <Text>{content}</Text>
            {withRadio && (
              <Radio
                value={content}
                isChecked={isCorrect}
                onChange={(e) => handleSelect(e.target.value)}
                colorScheme="teal"
              />
            )}
          </ListItem>
        </SlideFade>
      ))}
    </UnorderedList>
  );
};

export default AnswersList;

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
} from '@chakra-ui/react';

import AddQuestionButton from '../question/addButton';
import LabeledInput from '../common/labeledInput';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const AddQuizModal: FC<Props> = ({ isOpen, onClose }) => {
  const [title, setTitle] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const isError = isSubmitted && !title;

  const handleChangeTitle = (e: ChangeEvent<HTMLInputElement>): void => {
    setTitle(e.target.value);
  };

  const handleSubmit = (): void => {
    setIsSubmitted(true);

    if (!title) return;
  };

  const handleCloseComplete = (): void => {
    setTitle('');
    setIsSubmitted(false);
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
            <Flex justifyContent="space-between" alignItems="center">
              <Text fontSize="md" fontWeight="medium">
                Questions
              </Text>
              <AddQuestionButton />
            </Flex>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="teal" onClick={handleSubmit}>
            Add
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddQuizModal;

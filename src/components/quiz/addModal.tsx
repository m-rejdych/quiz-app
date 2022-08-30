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
  Input,
  VStack,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Text,
  Flex,
} from '@chakra-ui/react';

import AddQuestionButton from '../question/addButton';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const AddQuizModal: FC<Props> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [errors, setErrors] = useState({
    name: '',
  });

  const handleChangeName = (e: ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    setName(value);

    if (value && errors.name) setErrors((prev) => ({ ...prev, name: '' }));
  };

  const handleSubmit = (): void => {
    if (!name) {
      setErrors((prev) => ({ ...prev, name: 'Name is required.' }));
      return;
    }
  };

  const handleCloseComplete = (): void => {
    setName('');
    setErrors((prev) =>
      Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: '' }), {}),
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onCloseComplete={handleCloseComplete}
      size="2xl"
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add quiz</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={6} alignItems="stretch">
            <FormControl isInvalid={!!errors.name}>
              <FormLabel htmlFor="title">Name</FormLabel>
              <Input name="title" value={name} onChange={handleChangeName} />
              {errors.name && (
                <FormErrorMessage>{errors.name}</FormErrorMessage>
              )}
            </FormControl>
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

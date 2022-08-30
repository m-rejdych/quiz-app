import type { FC } from 'react';
import { Button, useDisclosure } from '@chakra-ui/react';

import AddQuizModal from './addModal';

const AddQuizButton: FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Button colorScheme="teal" onClick={onOpen}>
        Add quiz
      </Button>
      <AddQuizModal isOpen={isOpen} onClose={onClose} />
    </>
  );
};

export default AddQuizButton;

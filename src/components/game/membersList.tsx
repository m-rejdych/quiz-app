import type { FC } from 'react';
import {
  UnorderedList,
  ListItem,
  Avatar,
  Flex,
  ListProps,
  Text,
} from '@chakra-ui/react';

import type { Members } from '../../types/game/members';

interface Props extends ListProps {
  members: Members;
  title?: string;
}

const MembersList: FC<Props> = ({ members, title, ...rest }) => (
  <UnorderedList listStyleType="none" {...rest}>
    {title && (
      <Text fontSize="2xl" fontWeight="bold" mb={3}>
        {title}
      </Text>
    )}
    {Object.entries(members).map(([id, { name }]) => (
      <ListItem key={id}>
        <Flex alignItems="center">
          <Avatar size="sm" mr={3} />
          {name}
        </Flex>
      </ListItem>
    ))}
  </UnorderedList>
);

export default MembersList;

import type { FC } from 'react';
import type { Prisma } from '@prisma/client';
import { VStack, Box, Text } from '@chakra-ui/react';

import Editable from '../../components/editable/editable';

type Profile = Prisma.ProfileGetPayload<{ include: { gender: true } }>;

interface Props {
  profile: Profile;
  isMe?: boolean;
}

interface Field {
  name: keyof Profile;
  value: string | null;
  label: string;
}

const ProfileData: FC<Props> = ({
  isMe,
  profile: { firstName, lastName, gender },
}) => {
  const fields: Field[] = [
    {
      name: 'firstName',
      value: firstName,
      label: 'First name',
    },
    {
      name: 'lastName',
      value: lastName,
      label: 'Last name',
    },
    {
      name: 'gender',
      value: gender?.type ?? null,
      label: 'Gender',
    },
  ];

  return (
    <VStack spacing={6} alignItems="stretch">
      {fields.map(({ name, label, value }) => (
        <Box key={`profile-${name}`}>
          <Text fontSize="xl" fontWeight={700}>
            {label}
          </Text>
          {isMe ? (
            <Editable
              defaultValue={value ?? 'None'}
              fontSize="lg"
              isPreviewFocusable={false}
              previewProps={{
                color: value ? 'white' : 'gray.500',
              }}
            />
          ) : (
            <Text color={value ? 'white' : 'gray.500'} fontSize="lg">
              {value ?? 'None'}
            </Text>
          )}
        </Box>
      ))}
    </VStack>
  );
};

export default ProfileData;

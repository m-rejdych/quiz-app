import type { FC, ReactNode } from 'react';
import type { Prisma } from '@prisma/client';
import { VStack, Box, Text, Select } from '@chakra-ui/react';
import { useRouter } from 'next/router';

import Editable from '../../components/editable/editable';
import useAuthError from '../../hooks/useAuthError';
import { trpc } from '../../utils/trpc';

type Profile = Prisma.ProfileGetPayload<{ include: { gender: true } }>;

interface Props {
  profile: Profile;
  isMe?: boolean;
}

interface SelectOption {
  value: string | number;
  label: string;
}

interface Field {
  name: keyof Profile;
  value: string | number | null;
  label: string;
  type: FieldType;
  options?: SelectOption[];
}

enum FieldType {
  Text,
  Select,
}

const ProfileData: FC<Props> = ({
  isMe,
  profile: { id, firstName, lastName, gender },
}) => {
  const onError = useAuthError();
  const { query } = useRouter();
  const { invalidateQueries } = trpc.useContext();
  const { data } = trpc.useQuery(['gender.list'], {
    refetchOnWindowFocus: false,
    onError,
  });
  const updateMutation = trpc.useMutation('profile.update', {
    onError,
    onSuccess: () => {
      invalidateQueries(['profile.get-data', query.id ? { id } : undefined]);
    },
  });

  const fields: Field[] = [
    {
      name: 'firstName',
      value: firstName,
      label: 'First name',
      type: FieldType.Text,
    },
    {
      name: 'lastName',
      value: lastName,
      label: 'Last name',
      type: FieldType.Text,
    },
    {
      name: 'genderId',
      value: gender?.id ?? null,
      label: 'Gender',
      type: FieldType.Select,
      options: data?.map(({ id, type }) => ({ value: id, label: type })),
    },
  ];

  const handleSubmit = async (
    value: string | number,
    name: Field['name'],
  ): Promise<void> => {
    const formattedValue = value || null;

    try {
      await updateMutation.mutateAsync({
        id,
        data: { [name]: formattedValue },
      });
    } catch (error) {
      onError(error as Parameters<typeof onError>[0]);
    }
  };

  const renderEditComponent = ({
    name,
    type,
    value,
    options,
  }: Omit<Field, 'label'>): ReactNode => {
    switch (type) {
      case FieldType.Text:
        return (
          <Editable
            onSubmit={(newValue) => handleSubmit(newValue, name)}
            defaultValue={(value as string | null) ?? 'None'}
            fontSize="lg"
            isPreviewFocusable={false}
            previewProps={{
              color: value ? 'white' : 'gray.500',
            }}
          />
        );
      case FieldType.Select:
        return (
          <Select
            placeholder="None"
            defaultValue={value ?? undefined}
            color={value ? 'white' : 'gray.500'}
            onChange={(e) => handleSubmit(parseInt(e.target.value, 10), name)}
          >
            {options?.map(({ value: optValue, label }) => (
              <option key={`select-${label}-${optValue}`} value={optValue}>
                {label}
              </option>
            ))}
          </Select>
        );
      default:
        return null;
    }
  };

  return (
    <VStack spacing={6} alignItems="stretch">
      {fields.map(({ name, label, type, value, options }) => (
        <Box key={`profile-${name}`}>
          <Text fontSize="xl" fontWeight={700}>
            {label}
          </Text>
          {isMe ? (
            renderEditComponent({ type, value, options, name })
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

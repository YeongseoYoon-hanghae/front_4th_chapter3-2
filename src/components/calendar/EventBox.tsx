import { BellIcon } from '@chakra-ui/icons';
import { Box, HStack, Text } from '@chakra-ui/react';

import { Event } from '../../types';

interface EventBoxProps {
  event: Event;
  isNotified: boolean;
}

export const EventBox = ({ event, isNotified }: EventBoxProps) => {
  return (
    <Box
      p={1}
      my={1}
      bg={isNotified ? 'red.100' : 'gray.100'}
      borderRadius="md"
      fontWeight={isNotified ? 'bold' : 'normal'}
      color={isNotified ? 'red.500' : 'inherit'}
      aria-label="event-box"
    >
      <HStack spacing={1}>
        {isNotified && <BellIcon aria-label="bell-icon" />}
        <Text fontSize="sm" noOfLines={1}>
          {event.title}
        </Text>
      </HStack>
    </Box>
  );
};
